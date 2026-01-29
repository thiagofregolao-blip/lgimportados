import fetch from 'node-fetch';
import OpenAI from 'openai';
import { db } from '../db';
import { priceMonitors, products } from '../schema';
import { eq } from 'drizzle-orm';

// Configuração
const SCRAPE_DO_TOKEN = process.env.SCRAPE_DO_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface ScrapeResult {
    price?: number;
    currency?: 'USD' | 'BRL';
    error?: string;
    debugHtml?: string;
}

// Inicializar OpenAI
function getOpenAI() {
    if (!OPENAI_API_KEY) return null;
    return new OpenAI({ apiKey: OPENAI_API_KEY });
}

export async function checkCompetitorPrice(url: string): Promise<ScrapeResult> {
    if (!SCRAPE_DO_TOKEN) {
        return { error: 'SCRAPE_DO_TOKEN não configurado no servidor.' };
    }

    try {
        // 1. Obter HTML via Scrape.do
        // Usa render=true para sites com muito JS (opcional, gasta mais créditos, vou deixar sem por enquanto ou configurável)
        const targetUrl = `http://api.scrape.do?token=${SCRAPE_DO_TOKEN}&url=${encodeURIComponent(url)}`;

        console.log(`🔍 Scraping URL: ${url}`);
        const response = await fetch(targetUrl);

        if (!response.ok) {
            throw new Error(`Falha ao acessar Scrape.do: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();

        if (!html || html.length < 100) {
            throw new Error('HTML retornado vazio ou inválido.');
        }

        console.log(`📄 HTML obtido (${html.length} chars). Analisando com IA...`);

        // 2. Extrair preço usando IA (OpenAI ou Gemini)
        // Cortar o HTML para não estourar tokens (pegar <body e um pedaço razoável)
        // Muitos sites modernas colocam dados no <head> (meta tags, json-ld). Vou pegar os primeiros 15000 caracters e garantir que meta tags estejam lá.
        const cleanHtml = html.substring(0, 50000).replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, ""); // Remove scripts para economizar tokens

        const aiResult = await extractPriceWithAI(cleanHtml);
        return aiResult;

    } catch (error: any) {
        console.error('❌ Erro no Scraper:', error);
        return { error: error.message };
    }
}

async function extractPriceWithAI(htmlSnippet: string): Promise<ScrapeResult> {
    // Tenta OpenAI Primeiro
    const openai = getOpenAI();

    if (openai) {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini", // Modelo rápido e barato
                messages: [
                    {
                        role: "system",
                        content: "Você é um extrator de dados. Analise o HTML fornecido e encontre o PREÇO ATUAL do produto principal da página. Retorne APENAS um JSON: {\"price\": number, \"currency\": \"USD\" | \"BRL\"}. Se não encontrar, retorne {\"error\": \"not found\"}. Ignore ofertas de parcelamento, busque o preço à vista/principal."
                    },
                    {
                        role: "user",
                        content: htmlSnippet
                    }
                ],
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0].message.content;
            if (content) {
                const json = JSON.parse(content);
                if (json.price) return { price: json.price, currency: json.currency || 'USD' };
                if (json.error) return { error: json.error };
            }
        } catch (e) {
            console.error('OpenAI failed, falling back...');
        }
    }

    // Fallback Gemini (Implementação simplificada, assuming GoogleGenerativeAI imported or similar logic)
    // ... Implementar se necessário, mas GPT-4o-mini deve dar conta.

    return { error: 'Falha na extração de preço (IA não retornou dados).' };
}

// Função Principal para rodar verificação e atualizar banco
export async function runMonitorCheck(monitorId: number) {
    console.log(`🚀 Iniciando verificação para Monitor #${monitorId}`);

    try {
        const monitors = await db.select().from(priceMonitors).where(eq(priceMonitors.id, monitorId));
        const monitor = monitors[0];

        if (!monitor) return;

        const result = await checkCompetitorPrice(monitor.url);

        if (result.error) {
            await db.update(priceMonitors).set({
                status: 'error',
                failureReason: result.error,
                lastCheckedAt: new Date()
            }).where(eq(priceMonitors.id, monitorId));
        } else if (result.price) {
            await db.update(priceMonitors).set({
                status: 'active',
                lastPrice: result.price.toString(),
                lastPriceCurrency: result.currency,
                lastCheckedAt: new Date(),
                failureReason: null
            }).where(eq(priceMonitors.id, monitorId));
        }

        return result;
    } catch (e: any) {
        console.error(`Erro fatal no monitor ${monitorId}:`, e);
    }
}
