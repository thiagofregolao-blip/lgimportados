import { db } from './db.js';
import { sql } from 'drizzle-orm';

export async function initializeDatabase() {
    console.log('🔄 Initializing database tables...');

    try {
        // Criar tabela products se não existir
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price_usd DECIMAL(10, 2) NOT NULL,
                price_brl DECIMAL(10, 2) NOT NULL,
                price_brazil DECIMAL(10, 2),
                image TEXT,
                category VARCHAR(100),
                store VARCHAR(100),
                brand VARCHAR(100),
                description TEXT,
                discount INTEGER,
                is_new BOOLEAN DEFAULT FALSE,
                featured BOOLEAN DEFAULT FALSE,
                active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Table products ready');

        // Criar tabela categories se não existir
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                slug VARCHAR(100) NOT NULL UNIQUE,
                name VARCHAR(100) NOT NULL,
                icon VARCHAR(50),
                image TEXT,
                subtitle VARCHAR(255),
                active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Table categories ready');

        // Criar tabela banners se não existir
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS banners (
                id SERIAL PRIMARY KEY,
                url TEXT NOT NULL,
                alt VARCHAR(255),
                title VARCHAR(255),
                title_highlight VARCHAR(100),
                subtitle TEXT,
                button_text VARCHAR(100),
                active BOOLEAN DEFAULT TRUE,
                "order" INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Table banners ready');

        // Criar tabela ai_search_analytics se não existir
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS ai_search_analytics (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(100),
                raw_query TEXT NOT NULL,
                normalized_query TEXT,
                detected_category VARCHAR(100),
                detected_brand VARCHAR(100),
                detected_price_intent VARCHAR(50),
                search_intent VARCHAR(50),
                results_count INTEGER DEFAULT 0,
                products_shown JSONB,
                product_clicked_id INTEGER,
                conversion_happened BOOLEAN DEFAULT FALSE,
                no_results_found BOOLEAN DEFAULT FALSE,
                device VARCHAR(50) DEFAULT 'desktop',
                source VARCHAR(50) DEFAULT 'gemini_v2',
                search_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Table ai_search_analytics ready');

        // Criar tabela price_monitors se não existir
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS price_monitors (
                id SERIAL PRIMARY KEY,
                product_id INTEGER NOT NULL,
                url TEXT NOT NULL,
                site_name VARCHAR(100),
                last_price DECIMAL(10, 2),
                last_price_currency VARCHAR(10) DEFAULT 'USD',
                last_checked_at TIMESTAMP,
                status VARCHAR(20) DEFAULT 'active',
                failure_reason TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Table price_monitors ready');

        // Criar tabela monitor_settings se não existir
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS monitor_settings (
                id SERIAL PRIMARY KEY,
                check_interval_minutes INTEGER DEFAULT 60,
                is_active BOOLEAN DEFAULT TRUE,
                last_run_at TIMESTAMP,
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Table monitor_settings ready');

        console.log('✅ All database tables initialized successfully!');
    } catch (error: any) {
        console.error('❌ Database initialization error:', error.message);
        // Não lança erro para permitir que o servidor continue
    }
}
