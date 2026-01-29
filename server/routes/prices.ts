import { Router } from 'express';
import { db } from '../db.js';
import { products, priceCache } from '../schema.js';
import { eq, gte } from 'drizzle-orm';

export const pricesRoutes = Router();

// ============================================
// CACHE DE COTAÇÃO USD → BRL
// ============================================
let exchangeRateCache: { rate: number; timestamp: number } | null = null;
const EXCHANGE_CACHE_TTL = 15 * 60 * 1000; // 15 minutos

async function getCurrentExchangeRate(): Promise<number> {
    // Verificar cache
    if (exchangeRateCache && (Date.now() - exchangeRateCache.timestamp) < EXCHANGE_CACHE_TTL) {
        return exchangeRateCache.rate;
    }

    try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data: any = await response.json();

        if (data?.rates?.BRL) {
            const rate = data.rates.BRL;
            exchangeRateCache = { rate, timestamp: Date.now() };
            console.log(`💱 Cotação atualizada: $1 = R$${rate.toFixed(2)}`);
            return rate;
        }
    } catch (error) {
        console.error('❌ Erro ao buscar cotação:', error);
    }

    // Fallback
    return 5.80;
}

// ============================================
// MARGENS POR CATEGORIA
// ============================================
const CATEGORY_MARGINS: Record<string, { min: number; max: number }> = {
    'perfumes': { min: 0.40, max: 0.60 },
    'cosmeticos': { min: 0.35, max: 0.55 },
    'celulares': { min: 0.25, max: 0.35 },
    'smartphones': { min: 0.25, max: 0.35 },
    'notebooks': { min: 0.30, max: 0.45 },
    'games': { min: 0.25, max: 0.40 },
    'audio': { min: 0.20, max: 0.35 },
    'smartwatch': { min: 0.25, max: 0.40 },
    'default': { min: 0.20, max: 0.35 },
};

function getMarginForCategory(category?: string | null): { min: number; max: number } {
    if (!category) return CATEGORY_MARGINS['default'];
    const key = category.toLowerCase();
    return CATEGORY_MARGINS[key] || CATEGORY_MARGINS['default'];
}

// ============================================
// COMPARAR PREÇO DE UM PRODUTO
// ============================================
pricesRoutes.post('/compare', async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'productId é obrigatório' });
        }

        // Validar que é um número válido
        const numericId = parseInt(String(productId), 10);
        if (isNaN(numericId)) {
            return res.status(400).json({ success: false, message: 'productId inválido' });
        }

        console.log(`🔍 Buscando produto ID: ${numericId}`);

        // 1. Buscar produto
        const [product] = await db.select().from(products).where(eq(products.id, numericId));

        if (!product) {
            return res.status(404).json({ success: false, message: 'Produto não encontrado' });
        }

        console.log(`🔍 Comparando preços para: ${product.name}`);

        // 2. Obter cotação atual
        const exchangeRate = await getCurrentExchangeRate();
        const paraguayPriceUSD = Number(product.priceUSD);
        const paraguayPriceBRL = paraguayPriceUSD * exchangeRate;

        // 3. Verificar se já temos priceBrazil no banco
        let brazilPrice = product.priceBrazil ? Number(product.priceBrazil) : null;

        // 4. Se não tiver, estimar com base na categoria
        if (!brazilPrice) {
            const margin = getMarginForCategory(product.category);
            const randomMargin = margin.min + Math.random() * (margin.max - margin.min);
            brazilPrice = paraguayPriceBRL * (1 + randomMargin);
        }

        // 5. Calcular economia
        const savings = {
            amount: brazilPrice - paraguayPriceBRL,
            percentage: Math.round(((brazilPrice - paraguayPriceBRL) / brazilPrice) * 100),
            cheaperInBrazil: paraguayPriceBRL > brazilPrice,
        };

        // 6. Gerar comparativo de múltiplas lojas (simulado por enquanto)
        const brazilianStores = [
            { store: 'Mercado Livre', price: brazilPrice, estimated: !product.priceBrazil },
            { store: 'Amazon Brasil', price: brazilPrice * (1 + (Math.random() * 0.08 - 0.02)), estimated: true },
            { store: 'Magazine Luiza', price: brazilPrice * (1 + (Math.random() * 0.10 - 0.03)), estimated: true },
        ].sort((a, b) => a.price - b.price);

        res.json({
            success: true,
            comparison: {
                productName: product.name,
                productId: product.id,
                paraguay: {
                    priceUSD: paraguayPriceUSD,
                    priceBRL: Math.round(paraguayPriceBRL * 100) / 100,
                    store: product.store || 'LG Importados',
                },
                brazil: brazilianStores.map(s => ({
                    store: s.store,
                    price: Math.round(s.price * 100) / 100,
                    currency: 'R$',
                    estimated: s.estimated,
                })),
                savings: {
                    amount: Math.round(savings.amount * 100) / 100,
                    percentage: savings.percentage,
                    cheaperInBrazil: savings.cheaperInBrazil,
                },
                exchangeRate: Math.round(exchangeRate * 100) / 100,
            },
        });
    } catch (error: any) {
        console.error('❌ Error comparing prices:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// OBTER COTAÇÃO ATUAL
// ============================================
pricesRoutes.get('/exchange-rate', async (req, res) => {
    try {
        const rate = await getCurrentExchangeRate();
        res.json({
            success: true,
            rate,
            currency: 'BRL',
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});
