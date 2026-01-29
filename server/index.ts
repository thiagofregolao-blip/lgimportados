import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { assistantRoutes } from './routes/assistant.js';
import { analyticsRoutes } from './routes/analytics.js';
import { pricesRoutes } from './routes/prices.js';
import { productsRoutes } from './routes/products.js';
import { initializeDatabase } from './initDb.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARES
// ============================================
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? true // Aceitar qualquer origem em produção
        : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Para imagens base64

// ============================================
// MIDDLEWARE: DESABILITAR CACHE NAS APIs
// ============================================
app.use('/api', (req, res, next) => {
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    next();
});

// ============================================
// ROTAS DE API
// ============================================
import { monitorRoutes } from './routes/monitor.js';
import { startPriceMonitorScheduler } from './scheduler.js';

// ... (imports anteriores mantidos se outside block)

// ============================================
// ROTAS DE API
// ============================================
app.use('/api/assistant', assistantRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/monitors', monitorRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: process.env.DATABASE_URL ? 'configured' : 'missing',
    });
});

// ============================================
// SERVIR FRONTEND ESTÁTICO (Produção)
// ============================================
// O servidor roda de dist/server/, então dist/ está um nível acima
const distPath = path.join(__dirname, '..');
const indexPath = path.join(distPath, 'index.html');

console.log('🔍 Verificando arquivos estáticos em:', distPath);

if (fs.existsSync(indexPath)) {
    console.log('✅ Frontend build encontrado! Servindo arquivos estáticos.');

    // Servir arquivos estáticos da pasta dist
    app.use(express.static(distPath));

    // SPA fallback - qualquer rota não-API vai para o index.html
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(indexPath);
        }
    });
} else {
    console.log('⚠️ Frontend build NÃO encontrado em:', indexPath);
}

// ============================================
// START SERVER
// ============================================
app.listen(PORT, async () => {
    console.log(`
🚀 LG Importados API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Listening on port ${PORT}
🔗 http://localhost:${PORT}
📊 Environment: ${process.env.NODE_ENV || 'development'}
🗄️  Database: ${process.env.DATABASE_URL ? '✅ Configured' : '❌ Missing'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

    // Inicializar tabelas do banco de dados
    if (process.env.DATABASE_URL) {
        await initializeDatabase();
        startPriceMonitorScheduler(); // <--- Iniciado
    }
});

export default app;
