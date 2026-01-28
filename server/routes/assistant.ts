import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { db } from '../db.js';
import { products, aiSearchAnalytics } from '../schema.js';
import { eq, ilike, desc, sql, and, or, gte, lte } from 'drizzle-orm';

export const assistantRoutes = Router();

// ============================================
// CONFIGURAÇÃO DO ASSISTENTE
// ============================================
const ASSISTANT_ID = 'asst_pfv4n8nb2XoiQpRoailgeLCU';

// Inicialização lazy do OpenAI
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
    if (!process.env.OPENAI_API_KEY) {
        return null;
    }
    if (!openai) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openai;
}

// ============================================
// IMPLEMENTAÇÃO DAS FUNCTIONS
// ============================================

// Function: search_products - Buscar produtos no banco
async function searchProducts(params: {
    query?: string;
    category?: string;
    brand?: string;
    minPrice?: number;  // Alinhado com definição do Assistente
    maxPrice?: number;  // Alinhado com definição do Assistente
    limit?: number;
}) {
    try {
        const conditions: any[] = [eq(products.active, true)];

        if (params.query) {
            conditions.push(
                or(
                    ilike(products.name, `%${params.query}%`),
                    ilike(products.description || '', `%${params.query}%`),
                    ilike(products.category, `%${params.query}%`),
                    ilike(products.brand || '', `%${params.query}%`)
                )
            );
        }

        if (params.category) {
            conditions.push(ilike(products.category, `%${params.category}%`));
        }

        if (params.brand) {
            conditions.push(ilike(products.brand || '', `%${params.brand}%`));
        }

        if (params.minPrice) {
            conditions.push(gte(products.priceUSD, params.minPrice.toString()));
        }

        if (params.maxPrice) {
            // Se não encontrar no valor exato, busca até 20% acima (conforme definição)
            const maxWithMargin = params.maxPrice * 1.2;
            conditions.push(lte(products.priceUSD, maxWithMargin.toString()));
        }

        const found = await db.select()
            .from(products)
            .where(and(...conditions))
            .limit(params.limit || 10)
            .orderBy(desc(products.featured), desc(products.createdAt));

        return {
            success: true,
            count: found.length,
            products: found.map(p => ({
                id: p.id,
                name: p.name,
                priceUSD: Number(p.priceUSD),
                priceBRL: Number(p.priceBRL),
                priceBrazil: p.priceBrazil ? Number(p.priceBrazil) : null,
                discount: p.discount,
                category: p.category,
                brand: p.brand,
                store: p.store,
                image: p.image,
                description: p.description,
            })),
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Function: listar_promocoes - Listar produtos em promoção
async function listarPromocoes(params: { limit?: number }) {
    try {
        const found = await db.select()
            .from(products)
            .where(
                and(
                    eq(products.active, true),
                    sql`${products.discount} > 0`
                )
            )
            .limit(params.limit || 10)
            .orderBy(desc(products.discount));

        return {
            success: true,
            count: found.length,
            products: found.map(p => ({
                id: p.id,
                name: p.name,
                priceUSD: Number(p.priceUSD),
                priceBRL: Number(p.priceBRL),
                discount: p.discount,
                category: p.category,
                image: p.image,
            })),
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Function: adicionar_lista_compras - Placeholder (retorna instrução)
async function adicionarListaCompras(params: { product_id: number }) {
    // Esta função é um placeholder - a ação real acontece no frontend
    return {
        success: true,
        message: `Produto ${params.product_id} adicionado à lista de compras. O cliente pode acessar sua lista na página de carrinho.`,
    };
}

// Function: create_store_route - Placeholder para roteiro de lojas
async function createStoreRoute(params: { product_ids: number[] }) {
    // Placeholder - integraria com um serviço de mapas real
    return {
        success: true,
        message: `Roteiro criado para ${params.product_ids.length} produtos. As lojas serão exibidas no mapa do Paraguai.`,
        stores: ['Casa Liu', 'Cellshop', 'Mega Eletrônicos'], // Exemplo
    };
}

// Mapa de functions disponíveis
const availableFunctions: Record<string, (params: any) => Promise<any>> = {
    search_products: searchProducts,
    listar_promocoes: listarPromocoes,
    adicionar_lista_compras: adicionarListaCompras,
    create_store_route: createStoreRoute,
};

// ============================================
// ENDPOINT: STREAM SSE COM ASSISTANTS API
// ============================================
assistantRoutes.post('/stream', async (req: Request, res: Response) => {
    const { message, sessionId, threadId: existingThreadId } = req.body;

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

    const client = getOpenAI();

    // Se não tem OpenAI, usa fallback local
    if (!client) {
        console.log('⚠️ OpenAI não configurada, usando fallback local');
        const localResult = await searchProducts({ query: message });
        const count = localResult.count ?? 0;

        let responseText = '';
        if (localResult.success && count > 0) {
            responseText = `🎯 Encontrei ${count} produto(s) para "${message}"! Confira:`;
        } else {
            responseText = `😅 Não encontrei produtos para "${message}". Tente buscar algo diferente!`;
        }

        send({
            type: 'message',
            text: responseText,
            products: localResult.success ? localResult.products : [],
            provider: 'local',
        });
        send({ type: 'done' });

        // Registrar analytics
        try {
            await db.insert(aiSearchAnalytics).values({
                sessionId: sessionId || 'anonymous',
                rawQuery: message,
                normalizedQuery: message.toLowerCase(),
                searchIntent: 'search',
                resultsCount: localResult.count ?? 0,
                noResultsFound: !localResult.count,
                source: 'local',
            });
        } catch (e) {
            console.error('Analytics error:', e);
        }

        return res.end();
    }

    try {
        // 1. Criar ou reutilizar thread
        let threadId = existingThreadId;

        if (!threadId) {
            const thread = await client.beta.threads.create();
            threadId = thread.id;
            console.log(`🧵 Nova thread criada: ${threadId}`);
        }

        send({ type: 'thread', threadId });

        // 2. Adicionar mensagem do usuário à thread
        await client.beta.threads.messages.create(threadId, {
            role: 'user',
            content: message,
        });

        // 3. Executar o assistente
        let run = await client.beta.threads.runs.create(threadId, {
            assistant_id: ASSISTANT_ID,
        });

        console.log(`🚀 Run iniciado: ${run.id}`);

        // 4. Polling para aguardar conclusão
        const maxAttempts = 60; // 60 segundos máximo
        let attempts = 0;
        let productsFound: any[] = [];

        while (run.status !== 'completed' && run.status !== 'failed' && run.status !== 'cancelled') {
            attempts++;
            if (attempts > maxAttempts) {
                throw new Error('Timeout aguardando resposta do assistente');
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            run = await client.beta.threads.runs.retrieve(threadId, run.id);

            console.log(`⏳ Run status: ${run.status}`);

            // 5. Se precisa executar functions (tool_calls)
            if (run.status === 'requires_action' && run.required_action?.type === 'submit_tool_outputs') {
                const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
                const toolOutputs: { tool_call_id: string; output: string }[] = [];

                for (const toolCall of toolCalls) {
                    const functionName = toolCall.function.name;
                    const functionArgs = JSON.parse(toolCall.function.arguments);

                    console.log(`🔧 Executando function: ${functionName}`, functionArgs);

                    if (availableFunctions[functionName]) {
                        const result = await availableFunctions[functionName](functionArgs);

                        // Guardar produtos encontrados
                        if (result.products && result.products.length > 0) {
                            productsFound = [...productsFound, ...result.products];
                        }

                        toolOutputs.push({
                            tool_call_id: toolCall.id,
                            output: JSON.stringify(result),
                        });
                    } else {
                        toolOutputs.push({
                            tool_call_id: toolCall.id,
                            output: JSON.stringify({ error: `Function ${functionName} not implemented` }),
                        });
                    }
                }

                // Submeter resultados das functions
                run = await client.beta.threads.runs.submitToolOutputs(threadId, run.id, {
                    tool_outputs: toolOutputs,
                });
            }
        }

        if (run.status === 'failed') {
            throw new Error(run.last_error?.message || 'Erro ao processar a mensagem');
        }

        // 6. Obter mensagens da thread
        const messages = await client.beta.threads.messages.list(threadId, {
            order: 'desc',
            limit: 1,
        });

        const assistantMessage = messages.data.find(m => m.role === 'assistant');
        let responseText = '';

        if (assistantMessage && assistantMessage.content[0]?.type === 'text') {
            responseText = assistantMessage.content[0].text.value;
        }

        // 7. Enviar resposta via SSE
        send({
            type: 'message',
            text: responseText,
            products: productsFound,
            threadId,
            provider: 'openai-assistant',
        });

        send({ type: 'done' });

        // 8. Registrar analytics
        try {
            await db.insert(aiSearchAnalytics).values({
                sessionId: sessionId || 'anonymous',
                rawQuery: message,
                normalizedQuery: message.toLowerCase(),
                searchIntent: 'search',
                resultsCount: productsFound.length,
                productsShown: productsFound.map((p: any) => p.id),
                noResultsFound: productsFound.length === 0,
                source: 'openai-assistant',
            });
        } catch (e) {
            console.error('Analytics error:', e);
        }

    } catch (error: any) {
        console.error('❌ Assistant error:', error);
        send({ type: 'error', message: error.message });
    }

    res.end();
});

// ============================================
// ENDPOINT: SUGESTÕES (Autocomplete)
// ============================================
assistantRoutes.get('/suggestions', async (req: Request, res: Response) => {
    try {
        const { q } = req.query;

        if (!q || (q as string).length < 2) {
            return res.json({ success: true, suggestions: [] });
        }

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
assistantRoutes.post('/analyze-image', async (req: Request, res: Response) => {
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
        const openaiClient = getOpenAI();
        if (openaiClient) {
            const response = await openaiClient.chat.completions.create({
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
