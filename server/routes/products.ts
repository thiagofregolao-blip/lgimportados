import { Router } from 'express';
import { db } from '../db.js';
import { products } from '../schema.js';
import { eq, ilike, desc, and, sql } from 'drizzle-orm';

export const productsRoutes = Router();

// ============================================
// LISTAR PRODUTOS
// ============================================
productsRoutes.get('/', async (req, res) => {
    try {
        const { category, search, limit = 20 } = req.query;

        let query = db.select().from(products).where(eq(products.active, true));

        if (category) {
            query = query.where(eq(products.category, category as string));
        }

        if (search) {
            query = query.where(ilike(products.name, `%${search}%`));
        }

        const result = await query.limit(Number(limit)).orderBy(desc(products.createdAt));

        res.json({ success: true, products: result });
    } catch (error: any) {
        console.error('❌ Error fetching products:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// BUSCAR PRODUTO POR ID
// ============================================
productsRoutes.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.select().from(products).where(eq(products.id, Number(id)));

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Produto não encontrado' });
        }

        res.json({ success: true, product: result[0] });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// BUSCA INTELIGENTE (para IA)
// ============================================
productsRoutes.get('/search/smart', async (req, res) => {
    try {
        const { q, category, brand, maxPrice, limit = 10 } = req.query;

        if (!q) {
            return res.status(400).json({ success: false, message: 'Query é obrigatória' });
        }

        // Busca flexível por nome, categoria e marca
        const result = await db.select().from(products)
            .where(
                and(
                    eq(products.active, true),
                    sql`(
            ${products.name} ILIKE ${`%${q}%`} OR 
            ${products.category} ILIKE ${`%${q}%`} OR
            ${products.brand} ILIKE ${`%${q}%`}
          )`
                )
            )
            .limit(Number(limit))
            .orderBy(desc(products.featured), desc(products.createdAt));

        res.json({
            success: true,
            products: result,
            count: result.length,
            query: q
        });
    } catch (error: any) {
        console.error('❌ Error in smart search:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// CRIAR PRODUTO (Cadastro Rápido IA)
// ============================================
productsRoutes.post('/', async (req, res) => {
    try {
        const { name, priceUSD, priceBRL, priceBrazil, image, category, store, brand, description, discount, isNew, featured } = req.body;

        if (!name || !priceUSD || !priceBRL) {
            return res.status(400).json({ success: false, message: 'Nome, priceUSD e priceBRL são obrigatórios' });
        }

        const result = await db.insert(products).values({
            name,
            priceUSD,
            priceBRL,
            priceBrazil,
            image,
            category,
            store: store || 'LG Importados',
            brand,
            description,
            discount,
            isNew: isNew || false,
            featured: featured || false,
            active: true,
        }).returning();

        res.json({ success: true, product: result[0] });
    } catch (error: any) {
        console.error('❌ Error creating product:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ATUALIZAR PRODUTO
// ============================================
productsRoutes.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const result = await db.update(products)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(products.id, Number(id)))
            .returning();

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Produto não encontrado' });
        }

        res.json({ success: true, product: result[0] });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// DELETAR PRODUTO (soft delete)
// ============================================
productsRoutes.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.update(products)
            .set({ active: false })
            .where(eq(products.id, Number(id)))
            .returning();

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Produto não encontrado' });
        }

        res.json({ success: true, message: 'Produto removido' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});
