import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { aiSearchAnalytics, aiInsights } from '../schema.js';
import { eq, desc, gte, sql, count, and } from 'drizzle-orm';

export const analyticsRoutes = Router();

// ============================================
// REGISTRAR BUSCA (chamado pelo frontend)
// ============================================
analyticsRoutes.post('/search', async (req: Request, res: Response) => {
    try {
        const {
            sessionId,
            rawQuery,
            normalizedQuery,
            detectedCategory,
            detectedBrand,
            detectedPriceIntent,
            searchIntent,
            resultsCount,
            productsShown,
            productClickedId,
            conversionHappened,
            noResultsFound,
            device,
            source,
        } = req.body;

        const result = await db.insert(aiSearchAnalytics).values({
            sessionId: sessionId || 'anonymous',
            rawQuery: rawQuery || '',
            normalizedQuery,
            detectedCategory,
            detectedBrand,
            detectedPriceIntent,
            searchIntent: searchIntent || 'search',
            resultsCount: resultsCount || 0,
            productsShown,
            productClickedId,
            conversionHappened: conversionHappened || false,
            noResultsFound: noResultsFound || resultsCount === 0,
            device: device || 'desktop',
            source: source || 'openai',
        }).returning();

        res.json({ success: true, search: result[0] });
    } catch (error: any) {
        console.error('❌ Analytics search error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// TOP TERMOS BUSCADOS
// ============================================
analyticsRoutes.get('/top-searches', async (req: Request, res: Response) => {
    try {
        const days = parseInt(req.query.days as string) || 7;
        const limit = parseInt(req.query.limit as string) || 10;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const result = await db
            .select({
                term: aiSearchAnalytics.normalizedQuery,
                count: count(aiSearchAnalytics.id),
                noResults: sql<number>`SUM(CASE WHEN ${aiSearchAnalytics.noResultsFound} THEN 1 ELSE 0 END)`,
            })
            .from(aiSearchAnalytics)
            .where(gte(aiSearchAnalytics.searchAt, startDate))
            .groupBy(aiSearchAnalytics.normalizedQuery)
            .orderBy(desc(count(aiSearchAnalytics.id)))
            .limit(limit);

        res.json({ success: true, topSearches: result });
    } catch (error: any) {
        console.error('❌ Error getting top searches:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// DEMANDA NÃO ATENDIDA (buscas sem resultados)
// ============================================
analyticsRoutes.get('/unmet-demand', async (req: Request, res: Response) => {
    try {
        const days = parseInt(req.query.days as string) || 7;
        const limit = parseInt(req.query.limit as string) || 10;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const result = await db
            .select({
                term: aiSearchAnalytics.rawQuery,
                count: count(aiSearchAnalytics.id),
                category: aiSearchAnalytics.detectedCategory,
                brand: aiSearchAnalytics.detectedBrand,
            })
            .from(aiSearchAnalytics)
            .where(
                and(
                    eq(aiSearchAnalytics.noResultsFound, true),
                    gte(aiSearchAnalytics.searchAt, startDate)
                )
            )
            .groupBy(
                aiSearchAnalytics.rawQuery,
                aiSearchAnalytics.detectedCategory,
                aiSearchAnalytics.detectedBrand
            )
            .orderBy(desc(count(aiSearchAnalytics.id)))
            .limit(limit);

        res.json({ success: true, unmetDemand: result });
    } catch (error: any) {
        console.error('❌ Error getting unmet demand:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// INSIGHTS GERADOS PELA IA
// ============================================
analyticsRoutes.get('/insights', async (req: Request, res: Response) => {
    try {
        const unreadOnly = req.query.unreadOnly === 'true';

        // Executar query com ou sem filtro
        const result = unreadOnly
            ? await db.select().from(aiInsights)
                .where(eq(aiInsights.isRead, false))
                .orderBy(desc(aiInsights.createdAt))
                .limit(20)
            : await db.select().from(aiInsights)
                .orderBy(desc(aiInsights.createdAt))
                .limit(20);

        res.json({ success: true, insights: result });
    } catch (error: any) {
        console.error('❌ Error getting insights:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// DASHBOARD RESUMIDO
// ============================================
analyticsRoutes.get('/dashboard', async (req: Request, res: Response) => {
    try {
        const days = parseInt(req.query.days as string) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Métricas básicas
        const [stats] = await db
            .select({
                totalSearches: count(aiSearchAnalytics.id),
                totalNoResults: sql<number>`SUM(CASE WHEN ${aiSearchAnalytics.noResultsFound} THEN 1 ELSE 0 END)`,
                totalConversions: sql<number>`SUM(CASE WHEN ${aiSearchAnalytics.conversionHappened} THEN 1 ELSE 0 END)`,
            })
            .from(aiSearchAnalytics)
            .where(gte(aiSearchAnalytics.searchAt, startDate));

        // Top buscas
        const topSearches = await db
            .select({
                term: aiSearchAnalytics.normalizedQuery,
                count: count(aiSearchAnalytics.id),
            })
            .from(aiSearchAnalytics)
            .where(gte(aiSearchAnalytics.searchAt, startDate))
            .groupBy(aiSearchAnalytics.normalizedQuery)
            .orderBy(desc(count(aiSearchAnalytics.id)))
            .limit(5);

        // Demanda não atendida
        const unmetDemand = await db
            .select({
                term: aiSearchAnalytics.rawQuery,
                count: count(aiSearchAnalytics.id),
            })
            .from(aiSearchAnalytics)
            .where(
                and(
                    eq(aiSearchAnalytics.noResultsFound, true),
                    gte(aiSearchAnalytics.searchAt, startDate)
                )
            )
            .groupBy(aiSearchAnalytics.rawQuery)
            .orderBy(desc(count(aiSearchAnalytics.id)))
            .limit(5);

        // Insights não lidos
        const insights = await db
            .select()
            .from(aiInsights)
            .where(eq(aiInsights.isRead, false))
            .orderBy(desc(aiInsights.createdAt))
            .limit(3);

        const totalSearches = Number(stats.totalSearches) || 0;
        const totalNoResults = Number(stats.totalNoResults) || 0;
        const conversionRate = totalSearches > 0
            ? ((totalSearches - totalNoResults) / totalSearches * 100).toFixed(1)
            : '0';

        res.json({
            success: true,
            dashboard: {
                totalSearches,
                totalNoResults,
                conversionRate,
                topSearches,
                unmetDemand,
                insightsCount: insights.length,
                insights,
            },
        });
    } catch (error: any) {
        console.error('❌ Error getting dashboard:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
