import { pgTable, serial, varchar, text, decimal, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

// ============================================
// PRODUTOS
// ============================================
export const products = pgTable('products', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    priceUSD: decimal('price_usd', { precision: 10, scale: 2 }).notNull(),
    priceBRL: decimal('price_brl', { precision: 10, scale: 2 }).notNull(),
    priceBrazil: decimal('price_brazil', { precision: 10, scale: 2 }),
    image: text('image'),
    category: varchar('category', { length: 100 }),
    store: varchar('store', { length: 100 }),
    brand: varchar('brand', { length: 100 }),
    description: text('description'),
    discount: integer('discount'),
    isNew: boolean('is_new').default(false),
    featured: boolean('featured').default(false),
    active: boolean('active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// CATEGORIAS
// ============================================
export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    name: varchar('name', { length: 100 }).notNull(),
    icon: varchar('icon', { length: 50 }),
    image: text('image'),
    subtitle: varchar('subtitle', { length: 255 }),
    active: boolean('active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// BANNERS
// ============================================
export const banners = pgTable('banners', {
    id: serial('id').primaryKey(),
    url: text('url').notNull(),
    alt: varchar('alt', { length: 255 }),
    title: varchar('title', { length: 255 }),
    titleHighlight: varchar('title_highlight', { length: 100 }),
    subtitle: text('subtitle'),
    buttonText: varchar('button_text', { length: 100 }),
    active: boolean('active').default(true),
    order: integer('order').default(0),
    createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// ANALYTICS DE BUSCA IA
// ============================================
export const aiSearchAnalytics = pgTable('ai_search_analytics', {
    id: serial('id').primaryKey(),
    sessionId: varchar('session_id', { length: 100 }),
    rawQuery: text('raw_query').notNull(),
    normalizedQuery: text('normalized_query'),
    detectedCategory: varchar('detected_category', { length: 100 }),
    detectedBrand: varchar('detected_brand', { length: 100 }),
    detectedPriceIntent: varchar('detected_price_intent', { length: 50 }),
    searchIntent: varchar('search_intent', { length: 50 }),
    resultsCount: integer('results_count').default(0),
    productsShown: jsonb('products_shown'),
    productClickedId: integer('product_clicked_id'),
    conversionHappened: boolean('conversion_happened').default(false),
    noResultsFound: boolean('no_results_found').default(false),
    device: varchar('device', { length: 50 }).default('desktop'),
    source: varchar('source', { length: 50 }).default('gemini_v2'),
    searchAt: timestamp('search_at').defaultNow(),
});

// ============================================
// INSIGHTS GERADOS PELA IA
// ============================================
export const aiInsights = pgTable('ai_insights', {
    id: serial('id').primaryKey(),
    type: varchar('type', { length: 50 }),
    severity: varchar('severity', { length: 20 }),
    title: varchar('title', { length: 255 }),
    description: text('description'),
    recommendedAction: text('recommended_action'),
    relatedTerm: varchar('related_term', { length: 255 }),
    isRead: boolean('is_read').default(false),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// CACHE DE PREÇOS DO BRASIL
// ============================================
export const priceCache = pgTable('price_cache', {
    id: serial('id').primaryKey(),
    productName: varchar('product_name', { length: 255 }),
    category: varchar('category', { length: 100 }),
    brazilPrice: decimal('brazil_price', { precision: 10, scale: 2 }),
    storeName: varchar('store_name', { length: 100 }),
    productUrl: text('product_url'),
    cacheHits: integer('cache_hits').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    expiresAt: timestamp('expires_at'),
});

// ============================================
// SESSÕES DO ASSISTENTE IA
// ============================================
export const assistantSessions = pgTable('assistant_sessions', {
    id: serial('id').primaryKey(),
    sessionId: varchar('session_id', { length: 100 }).notNull().unique(),
    context: jsonb('context'),
    lastQuery: text('last_query'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// MENSAGENS DO ASSISTENTE
// ============================================
export const assistantMessages = pgTable('assistant_messages', {
    id: serial('id').primaryKey(),
    sessionId: varchar('session_id', { length: 100 }).notNull(),
    role: varchar('role', { length: 20 }).notNull(), // 'user' | 'assistant'
    content: text('content').notNull(),
    timestamp: timestamp('timestamp').defaultNow(),
});

// ============================================
// MONITORAMENTO DE PREÇOS
// ============================================
export const priceMonitors = pgTable('price_monitors', {
    id: serial('id').primaryKey(),
    productId: integer('product_id').notNull(), // Vínculo lógico com products.id (sem FK rígida para facilitar)
    url: text('url').notNull(),
    siteName: varchar('site_name', { length: 100 }), // Ex: Cellshop, Nissei
    lastPrice: decimal('last_price', { precision: 10, scale: 2 }), // Preço encontrado
    lastPriceCurrency: varchar('last_price_currency', { length: 10 }).default('USD'), // USD ou BRL
    lastCheckedAt: timestamp('last_checked_at'),
    status: varchar('status', { length: 20 }).default('active'), // active, error, paused
    failureReason: text('failure_reason'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const monitorSettings = pgTable('monitor_settings', {
    id: serial('id').primaryKey(),
    checkIntervalMinutes: integer('check_interval_minutes').default(60), // 30, 60, 120, etc.
    isActive: boolean('is_active').default(true),
    lastRunAt: timestamp('last_run_at'),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// TIPOS EXPORTADOS
// ============================================
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Banner = typeof banners.$inferSelect;
export type AISearchAnalytic = typeof aiSearchAnalytics.$inferSelect;
export type AIInsight = typeof aiInsights.$inferSelect;
export type PriceMonitor = typeof priceMonitors.$inferSelect;
export type NewPriceMonitor = typeof priceMonitors.$inferInsert;
export type MonitorSetting = typeof monitorSettings.$inferSelect;
