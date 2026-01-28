import { Router } from 'express';
import OpenAI from 'openai';
import { db } from '../db.js';
import { products, aiSearchAnalytics, assistantSessions, assistantMessages } from '../schema.js';
import { eq, ilike, desc, sql, and } from 'drizzle-orm';

export const assistantRoutes = Router();

// ============================================
// INICIALIZAR OPENAI
// ============================================
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// ============================================
// PIPELINE DE PROCESSAMENTO
// ============================================

// Detectar intenção da mensagem
function detectIntent(message: string): string {
    const lower = message.toLowerCase();

    if (/^(oi|olá|hello|bom dia|boa tarde|boa noite|tudo bem|ei|e aí)/.test(lower)) {
        return 'greeting';
    }
    if (/como (usar|funciona)|ajuda|help|o que você faz/.test(lower)) {
        return 'help';
    }
    if (/(mais barato|menor preço|preço baixo|desconto|promoção|barato)/.test(lower)) {
        return 'price';
    }
    if (/(comparar|versus|vs|diferença entre|melhor entre)/.test(lower)) {
        return 'compare';
    }
    if (/(recomenda|sugere|melhor|qual escolher|indica)/.test(lower)) {
        return 'recommend';
    }
    if (/(obrigado|valeu|agradeço|tchau|até mais)/.test(lower)) {
        return 'farewell';
    }

    return 'search';
}

// Extrair entidades (produto, categoria, marca)
function extractEntities(message: string): { product?: string; category?: string; brand?: string; maxPrice?: number } {
    const lower = message.toLowerCase();
    const entities: { product?: string; category?: string; brand?: string; maxPrice?: number } = {};

    // Detectar produtos
    const productPatterns: Record<string, RegExp> = {
        'iphone': /iphone\s*(\d+)?(\s*pro)?(\s*max)?/i,
        'galaxy': /galaxy\s*(s|a|note|z)?\s*(\d+)?/i,
        'playstation': /(ps5|ps4|playstation\s*\d?)/i,
        'xbox': /xbox\s*(series)?\s*(x|s)?/i,
        'airpods': /airpods\s*(pro)?(\s*\d)?/i,
        'macbook': /macbook\s*(air|pro)?/i,
        'apple watch': /apple\s*watch(\s*\d+)?(\s*ultra)?/i,
    };

    for (const [name, pattern] of Object.entries(productPatterns)) {
        const match = lower.match(pattern);
        if (match) {
            entities.product = match[0].trim();
            break;
        }
    }

    // Detectar categorias
    const categories: Record<string, string[]> = {
        'celulares': ['celular', 'smartphone', 'telefone', 'iphone', 'galaxy', 'xiaomi'],
        'notebooks': ['notebook', 'laptop', 'macbook', 'computador'],
        'games': ['game', 'playstation', 'ps5', 'xbox', 'nintendo', 'console', 'jogo'],
        'audio': ['fone', 'headphone', 'airpods', 'earbuds', 'caixa de som', 'jbl'],
        'smartwatch': ['relógio', 'watch', 'smartwatch', 'apple watch'],
        'perfumes': ['perfume', 'fragrância', 'colônia', 'eau de'],
        'cosmeticos': ['maquiagem', 'batom', 'skincare', 'cosmético'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(k => lower.includes(k))) {
            entities.category = category;
            break;
        }
    }

    // Detectar marcas
    const brands = ['apple', 'samsung', 'xiaomi', 'sony', 'jbl', 'nintendo', 'microsoft', 'dell', 'lenovo', 'asus'];
    for (const brand of brands) {
        if (lower.includes(brand)) {
            entities.brand = brand;
            break;
        }
    }

    // Detectar faixa de preço
    const priceMatch = lower.match(/até\s*r?\$?\s*(\d+)/);
    if (priceMatch) {
        entities.maxPrice = parseInt(priceMatch[1]);
    }

    return entities;
}

// Normalizar query
function normalizeQuery(query: string): string {
    let normalized = query.toLowerCase().trim();
    normalized = normalized.replace(/[^\w\sáéíóúãõâêîôûç]/gi, ' ');

    const stopWords = ['quero', 'preciso', 'busco', 'procuro', 'me', 'um', 'uma', 'de', 'para', 'pode', 'ter', 'você'];
    normalized = normalized.split(' ').filter(w => w.length > 1 && !stopWords.includes(w)).join(' ');

    return normalized.replace(/\s+/g, ' ').trim();
}

// Gerar resposta para intenções sem busca
function generateTextResponse(intent: string): string {
    switch (intent) {
        case 'greeting':
            return '👋 Olá! Eu sou o assistente IA da LG Importados! Como posso ajudar você a encontrar os melhores produtos do Paraguai hoje?';
        case 'help':
            return `Posso te ajudar de várias formas:
• 🔍 Buscar produtos: "iPhone 15 Pro" ou "fone JBL"
• 💰 Achar mais barato: "celular mais barato"
• 📊 Comparar: "comparar iPhone e Galaxy"
• ✨ Recomendar: "me recomenda um perfume masculino"

É só digitar o que você procura!`;
        case 'farewell':
            return '👋 Até mais! Volte sempre para conferir nossas ofertas do Paraguai! 🇵🇾';
        default:
            return 'Como posso ajudar você hoje?';
    }
}

// ============================================
// ENDPOINT: STREAM SSE (Busca com IA)
// ============================================
assistantRoutes.post('/stream', async (req, res) => {
    const { message, sessionId, horaLocal } = req.body;

    if (!message) {
        return res.status(400).json({ success: false, message: 'Mensagem é obrigatória' });
    }

    // Headers para SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (data: any) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
        // 1. Processar mensagem através do pipeline
        const intent = detectIntent(message);
        const entities = extractEntities(message);
        const normalizedQuery = normalizeQuery(message);

        console.log(`🤖 [Assistant] Intent: ${intent}, Query: "${normalizedQuery}"`, entities);

        // 2. Se não precisa buscar, só responder
        const noSearchIntents = ['greeting', 'help', 'farewell'];
        if (noSearchIntents.includes(intent)) {
            const textResponse = generateTextResponse(intent);
            send({ text: textResponse, products: [], provider: 'local' });
            send({ done: true });

            // Registrar analytics
            await db.insert(aiSearchAnalytics).values({
                sessionId: sessionId || 'anonymous',
                rawQuery: message,
                normalizedQuery,
                searchIntent: intent,
                resultsCount: 0,
                noResultsFound: false,
                source: 'openai',
            });

            return res.end();
        }

        // 3. Buscar produtos no banco
        const searchTerm = entities.product || entities.category || normalizedQuery || message;

        const foundProducts = await db.select().from(products)
            .where(
                and(
                    eq(products.active, true),
                    sql`(
            ${products.name} ILIKE ${`%${searchTerm}%`} OR 
            ${products.category} ILIKE ${`%${searchTerm}%`} OR
            ${products.brand} ILIKE ${`%${searchTerm}%`} OR
            ${products.description} ILIKE ${`%${searchTerm}%`}
          )`
                )
            )
            .limit(10)
            .orderBy(desc(products.featured), desc(products.createdAt));

        console.log(`📦 Encontrados ${foundProducts.length} produtos para "${searchTerm}"`);

        // 4. Gerar resposta com OpenAI (se configurado)
        let aiResponse = '';

        if (process.env.OPENAI_API_KEY && foundProducts.length > 0) {
            try {
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: `Você é o assistente de vendas da LG Importados, uma loja de produtos importados do Paraguai.
Seja breve, amigável e use emojis. Fale em português brasileiro.
Destaque que os preços são em dólar e muito mais baratos que no Brasil.
Não invente informações sobre produtos que não existem.`
                        },
                        {
                            role: 'user',
                            content: `O cliente perguntou: "${message}"
              
Encontrei ${foundProducts.length} produto(s):
${foundProducts.slice(0, 3).map(p => `- ${p.name}: US$ ${p.priceUSD} (economia de ~${p.discount || 20}% vs Brasil)`).join('\n')}

Gere uma resposta curta (máximo 2 frases) apresentando os produtos.`
                        }
                    ],
                    max_tokens: 150,
                    temperature: 0.7,
                });

                aiResponse = completion.choices[0]?.message?.content || '';
            } catch (error) {
                console.error('❌ OpenAI error:', error);
            }
        }

        // 5. Fallback para resposta template
        if (!aiResponse) {
            if (foundProducts.length === 0) {
                aiResponse = `😅 Não encontrei "${searchTerm}" no momento. Quer que eu busque algo parecido?`;
            } else if (foundProducts.length <= 3) {
                aiResponse = `🎯 Encontrei ${foundProducts.length} opção de ${searchTerm}! Confira:`;
            } else {
                aiResponse = `🎉 Encontrei ${foundProducts.length} ofertas de ${searchTerm}! Dá uma olhada:`;
            }
        }

        // 6. Enviar resposta via SSE
        send({
            text: aiResponse,
            products: foundProducts.map(p => ({
                id: p.id,
                name: p.name,
                priceUSD: Number(p.priceUSD),
                priceBRL: Number(p.priceBRL),
                priceBrazil: p.priceBrazil ? Number(p.priceBrazil) : null,
                image: p.image,
                category: p.category,
                discount: p.discount,
                store: p.store,
            })),
            provider: process.env.OPENAI_API_KEY ? 'openai' : 'local',
        });

        send({ done: true });

        // 7. Registrar analytics
        await db.insert(aiSearchAnalytics).values({
            sessionId: sessionId || 'anonymous',
            rawQuery: message,
            normalizedQuery,
            detectedCategory: entities.category,
            detectedBrand: entities.brand,
            searchIntent: intent,
            resultsCount: foundProducts.length,
            productsShown: foundProducts.map(p => p.id),
            noResultsFound: foundProducts.length === 0,
            source: 'openai',
        });

    } catch (error: any) {
        console.error('❌ Stream error:', error);
        send({ error: error.message });
    }

    res.end();
});

// ============================================
// ENDPOINT: SUGESTÕES (Autocomplete)
// ============================================
assistantRoutes.get('/suggestions', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || (q as string).length < 2) {
            return res.json({ success: true, suggestions: [] });
        }

        // Buscar produtos que começam com a query
        const found = await db.select({ name: products.name })
            .from(products)
            .where(
                and(
                    eq(products.active, true),
                    ilike(products.name, `%${q}%`)
                )
            )
            .limit(5);

        const suggestions = found.map(p => p.name);

        res.json({ success: true, suggestions });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ENDPOINT: ANÁLISE DE IMAGEM (Cadastro Rápido)
// ============================================
assistantRoutes.post('/analyze-image', async (req, res) => {
    try {
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ success: false, message: 'Imagem não fornecida' });
        }

        // Usar Gemini se disponível (mais barato para visão)
        if (process.env.GEMINI_API_KEY) {
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const prompt = `Analise esta imagem de produto e retorne APENAS um JSON válido (sem markdown) com:
{
  "name": "Nome completo do produto (ex: 'iPhone 15 Pro Max 256GB')",
  "category": "Categoria (ex: 'celulares', 'perfumes', 'games')",
  "brand": "Marca se identificável",
  "description": "Descrição atrativa em português para vendas (2-3 frases)",
  "suggestedPriceUSD": { "min": 0, "max": 0 },
  "confidence": 0.0
}`;

            // Extrair base64 puro
            const base64Data = imageBase64.includes(',')
                ? imageBase64.split(',')[1]
                : imageBase64;

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: base64Data,
                    },
                },
            ]);

            const responseText = result.response.text();

            // Limpar e parsear JSON
            let cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanJson = jsonMatch[0];
            }

            const analysis = JSON.parse(cleanJson);

            console.log('✅ Produto identificado:', analysis.name);

            return res.json({ success: true, analysis });
        }

        // Fallback: OpenAI Vision
        if (process.env.OPENAI_API_KEY) {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Analise esta imagem de produto e retorne APENAS um JSON válido com:
{"name": "...", "category": "...", "brand": "...", "description": "...", "suggestedPriceUSD": {"min": 0, "max": 0}, "confidence": 0.0}`
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                                    detail: 'high',
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 500,
            });

            const responseText = response.choices[0]?.message?.content || '';
            let cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanJson = jsonMatch[0];
            }

            const analysis = JSON.parse(cleanJson);

            return res.json({ success: true, analysis });
        }

        return res.status(500).json({
            success: false,
            message: 'Nenhuma API de visão configurada (GEMINI_API_KEY ou OPENAI_API_KEY)'
        });

    } catch (error: any) {
        console.error('❌ Error analyzing image:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
