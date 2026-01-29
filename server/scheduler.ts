import { db } from './db';
import { monitorSettings, priceMonitors } from './schema';
import { runMonitorCheck } from './services/scraper';
import { eq, and, lte, or, isNull } from 'drizzle-orm';

let isRunning = false;

export function startPriceMonitorScheduler() {
    console.log('⏰ Scheduler de Preços Iniciado');

    // Roda a cada 60 segundos para verificar se precisa disparar jobs
    setInterval(async () => {
        if (isRunning) return;
        isRunning = true;

        try {
            // 1. Verificar configuração global
            const settings = await db.select().from(monitorSettings).limit(1);
            if (!settings.length || !settings[0].isActive) {
                // Monitoramento desativado globalmente
                isRunning = false;
                return;
            }

            const intervalMinutes = settings[0].checkIntervalMinutes || 60;

            // 2. Calcular data de corte (tudo que foi checado ANTES dessa data precisa ser checado de novo)
            const cutoffDate = new Date(Date.now() - intervalMinutes * 60 * 1000);

            // 3. Buscar monitores que precisam de update (lastCheckedAt < cutoffDate OU null)
            // Nota: Drizzle pode precisar raw sql para datas complexas, mas vamos tentar filtro simples
            // Em Postgres timestamp comparison funciona.

            // Vamos iterar um por um para não sobrecarregar
            const monitorsToRun = await db.select()
                .from(priceMonitors)
                .where(
                    and(
                        eq(priceMonitors.status, 'active'),
                        or(
                            isNull(priceMonitors.lastCheckedAt),
                            lte(priceMonitors.lastCheckedAt, cutoffDate)
                        )
                    )
                )
                .limit(5); // Processa no máximo 5 por ciclo para não travar CPU/Rede

            if (monitorsToRun.length > 0) {
                console.log(`🔎 Encontrados ${monitorsToRun.length} monitores pendentes.`);

                for (const monitor of monitorsToRun) {
                    await runMonitorCheck(monitor.id);
                    // Breve pausa para não tomar rate limit do Scrape.do?
                    await new Promise(r => setTimeout(r, 2000));
                }
            }

        } catch (error) {
            console.error('❌ Erro no scheduler:', error);
        } finally {
            isRunning = false;
        }
    }, 60 * 1000); // Check a cada 1 minuto
}
