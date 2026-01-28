import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { assistantRoutes } from './routes/assistant.js';
import { analyticsRoutes } from './routes/analytics.js';
import { pricesRoutes } from './routes/prices.js';
import { productsRoutes } from './routes/products.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARES
// ============================================
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Para imagens base64

// ============================================
// ROTAS DE API
// ============================================
app.use('/api/assistant', assistantRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api/products', productsRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`
🚀 LG Importados API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Listening on port ${PORT}
🔗 http://localhost:${PORT}
📊 Environment: ${process.env.NODE_ENV || 'development'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;
