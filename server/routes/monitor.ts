import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { priceMonitors, products, monitorSettings } from '../schema.js';
import { eq, desc } from 'drizzle-orm';
import { runMonitorCheck } from '../services/scraper.js';

export const monitorRoutes = Router();

// Listar todos os monitores (com dados do produto)
monitorRoutes.get('/', async (req, res) => {
    try {
        const monitors = await db.select({
            id: priceMonitors.id,
            url: priceMonitors.url,
            siteName: priceMonitors.siteName,
            lastPrice: priceMonitors.lastPrice,
            lastPriceCurrency: priceMonitors.lastPriceCurrency,
            lastCheckedAt: priceMonitors.lastCheckedAt,
            status: priceMonitors.status,
            failureReason: priceMonitors.failureReason,
            productName: products.name,
            productImage: products.image,
            myPriceUSD: products.priceUSD,
            myPriceBRL: products.priceBRL
        })
            .from(priceMonitors)
            .leftJoin(products, eq(priceMonitors.productId, products.id))
            .orderBy(desc(priceMonitors.lastCheckedAt));

        res.json({ success: true, monitors });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Criar novo monitor
monitorRoutes.post('/', async (req, res) => {
    try {
        const { productId, url, siteName } = req.body;

        if (!productId || !url) {
            return res.status(400).json({ success: false, message: 'Produto e URL são obrigatórios' });
        }

        const newMonitor = await db.insert(priceMonitors).values({
            productId,
            url,
            siteName: siteName || 'Concorrente',
            status: 'active'
        }).returning();

        res.json({ success: true, monitor: newMonitor[0] });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Remover monitor
monitorRoutes.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(priceMonitors).where(eq(priceMonitors.id, Number(id)));
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Forçar verificação (Run Check)
monitorRoutes.post('/:id/run', async (req, res) => {
    try {
        const { id } = req.params;

        // Roda assíncrono para não travar request se demorar? 
        // Não, user quer ver resultado. Vamos esperar (Scrape.do pode demorar ~10s)
        const result = await runMonitorCheck(Number(id));

        res.json({ success: true, result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Obter Configurações
monitorRoutes.get('/settings', async (req, res) => {
    try {
        const settings = await db.select().from(monitorSettings).limit(1);
        res.json({ success: true, settings: settings[0] || { checkIntervalMinutes: 60, isActive: true } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Salvar Configurações
monitorRoutes.post('/settings', async (req, res) => {
    try {
        const { checkIntervalMinutes, isActive } = req.body;

        // Verifica se existe, se não cria
        const existing = await db.select().from(monitorSettings).limit(1);

        if (existing.length === 0) {
            await db.insert(monitorSettings).values({ checkIntervalMinutes, isActive });
        } else {
            await db.update(monitorSettings)
                .set({ checkIntervalMinutes, isActive, updatedAt: new Date() })
                .where(eq(monitorSettings.id, existing[0].id));
        }

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});
