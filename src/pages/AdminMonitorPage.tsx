import { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, AlertTriangle, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { useStore } from '../store/store';

// Types (frontend mirror of API response)
interface Monitor {
    id: number;
    url: string;
    siteName: string;
    lastPrice: string | null;
    lastPriceCurrency: string;
    lastCheckedAt: string | null;
    status: 'active' | 'error' | 'paused';
    failureReason: string | null;
    productName: string;
    productImage: string;
    myPriceUSD: string;
    myPriceBRL: string;
}

interface MonitorSettings {
    checkIntervalMinutes: number;
    isActive: boolean;
}

export function AdminMonitorPage() {
    const { products } = useStore(); // Para o select de produtos
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [settings, setSettings] = useState<MonitorSettings>({ checkIntervalMinutes: 60, isActive: true });

    // UI States
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isRunningCheck, setIsRunningCheck] = useState<number | null>(null); // ID do monitor rodando

    // Form Data
    const [newMonitor, setNewMonitor] = useState({
        productId: '',
        url: '',
        siteName: ''
    });

    // Fetch Data
    const fetchData = async () => {
        try {
            const [resMonitors, resSettings] = await Promise.all([
                fetch('/api/monitors').then(res => res.json()),
                fetch('/api/monitors/settings').then(res => res.json())
            ]);

            if (resMonitors.success) setMonitors(resMonitors.monitors);
            if (resSettings.success) setSettings(resSettings.settings);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Polling para atualizar status a cada 30s
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    // Handlers
    const handleAddMonitor = async () => {
        if (!newMonitor.productId || !newMonitor.url) return alert('Preencha os campos obrigatórios');

        try {
            const res = await fetch('/api/monitors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: parseInt(newMonitor.productId),
                    url: newMonitor.url,
                    siteName: newMonitor.siteName
                })
            });
            const data = await res.json();
            if (data.success) {
                setIsAdding(false);
                setNewMonitor({ productId: '', url: '', siteName: '' });
                fetchData();
            } else {
                alert('Erro ao criar: ' + data.error);
            }
        } catch (error) {
            alert('Erro de conexão');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Deseja excluir este monitor?')) return;
        await fetch(`/api/monitors/${id}`, { method: 'DELETE' });
        setMonitors(monitors.filter(m => m.id !== id));
    };

    const handleRunCheck = async (id: number) => {
        setIsRunningCheck(id);
        try {
            const res = await fetch(`/api/monitors/${id}/run`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                // Atualiza localmente ou refetch
                fetchData();
            } else {
                alert('Erro ao verificar: ' + data.error);
            }
        } catch (error) {
            alert('Erro ao rodar verificação');
        } finally {
            setIsRunningCheck(null);
        }
    };

    const updateSettings = async (newSettings: Partial<MonitorSettings>) => {
        const merged = { ...settings, ...newSettings };
        setSettings(merged);
        await fetch('/api/monitors/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(merged)
        });
    };

    // Helper para mensagem WhatsApp
    const getWhatsAppLink = (m: Monitor) => {
        const myPrice = parseFloat(m.myPriceUSD);
        const competitorPrice = m.lastPrice ? parseFloat(m.lastPrice) : 0;
        const diff = competitorPrice - myPrice;
        const diffPercent = ((diff / myPrice) * 100).toFixed(1);

        const isLosing = diff < 0; // Se diferença negativa, concorrente é mais barato
        const emoji = isLosing ? '🔴' : '🟢';
        const statusText = isLosing ? `ALERTA: Nosso preço está MAIOR!` : `Ótimo! Estamos competitivos.`;

        const message = `
*Monitoramento de Preços - LG Importados*
${emoji} ${statusText}

📦 *Produto:* ${m.productName}
🏢 *Concorrente:* ${m.siteName || 'Site Externo'}

💲 *Nosso Preço:* U$ ${myPrice.toFixed(2)}
💲 *Preço Deles:* U$ ${competitorPrice.toFixed(2)}

📉 *Diferença:* ${diffPercent}% (U$ ${diff.toFixed(2)})
🔗 *Link:* ${m.url}
`.trim();

        return `https://wa.me/?text=${encodeURIComponent(message)}`;
    };

    return (
        <div className="admin-content">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Monitoramento de Concorrência</h1>
                    <p className="admin-subtitle">Acompanhe preços automaticamente usando IA</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <Clock size={16} color="#666" />
                        <select
                            value={settings.checkIntervalMinutes}
                            onChange={(e) => updateSettings({ checkIntervalMinutes: parseInt(e.target.value) })}
                            style={{ border: 'none', background: 'transparent', fontWeight: 500 }}
                        >
                            <option value={30}>A cada 30 min</option>
                            <option value={60}>A cada 1 hora</option>
                            <option value={120}>A cada 2 horas</option>
                            <option value={360}>A cada 6 horas</option>
                        </select>
                    </div>

                    <button className="admin-btn primary" onClick={() => setIsAdding(true)}>
                        <Plus size={20} />
                        Novo Monitor
                    </button>
                </div>
            </div>

            {/* Configurações Globais */}
            <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 600, color: '#475569' }}>Status do Sistema:</span>
                <button
                    onClick={() => updateSettings({ isActive: !settings.isActive })}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: '20px',
                        border: 'none', cursor: 'pointer', fontWeight: 600,
                        background: settings.isActive ? '#DCFCE7' : '#FEE2E2',
                        color: settings.isActive ? '#166534' : '#991B1B'
                    }}
                >
                    {settings.isActive ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    {settings.isActive ? 'Monitoramento Ativo' : 'Pausado'}
                </button>
            </div>

            {isLoading ? (
                <div>Carregando monitores...</div>
            ) : (
                <div className="admin-products-list">
                    <div className="admin-products-header" style={{ gridTemplateColumns: 'minmax(250px, 2fr) 1fr 1fr 1fr 1.5fr' }}>
                        <span>Produto / Concorrente</span>
                        <span>Preços (USD)</span>
                        <span>Última Verificação</span>
                        <span>Status</span>
                        <span>Ações</span>
                    </div>

                    {monitors.length === 0 && (
                        <div className="admin-empty">Nenhum monitoramento cadastrado. Adicione um para começar.</div>
                    )}

                    {monitors.map((m) => {
                        const myPrice = parseFloat(m.myPriceUSD);
                        const competitorPrice = m.lastPrice ? parseFloat(m.lastPrice) : 0;
                        const hasPrice = competitorPrice > 0;
                        const isLosing = hasPrice && competitorPrice < myPrice;
                        const priceDiff = hasPrice ? ((competitorPrice - myPrice) / myPrice * 100).toFixed(0) + '%' : '-';

                        return (
                            <div key={m.id} className="admin-product-row" style={{ gridTemplateColumns: 'minmax(250px, 2fr) 1fr 1fr 1fr 1.5fr' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <img src={m.productImage} alt="" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{m.productName}</div>
                                        <a href={m.url} target="_blank" rel="noopener" style={{ fontSize: '0.85rem', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {m.siteName || 'Link Concorrente'} <ExternalLink size={12} />
                                        </a>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Nós: <span style={{ fontWeight: 'bold', color: '#333' }}>U$ {myPrice.toFixed(2)}</span></div>
                                    {hasPrice ? (
                                        <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: isLosing ? '#DC2626' : '#16A34A' }}>
                                            Eles: U$ {competitorPrice.toFixed(2)}
                                            <span style={{ fontSize: '0.75rem', marginLeft: '6px', background: isLosing ? '#FEE2E2' : '#DCFCE7', padding: '2px 4px', borderRadius: '4px' }}>
                                                {priceDiff}
                                            </span>
                                        </div>
                                    ) : (
                                        <div style={{ color: '#94A3B8' }}>Aguardando...</div>
                                    )}
                                </div>

                                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                                    {m.lastCheckedAt ? new Date(m.lastCheckedAt).toLocaleString('pt-BR') : 'Nunca'}
                                </div>

                                <div>
                                    {m.status === 'error' ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                                                <AlertTriangle size={14} /> Erro
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: '#EF4444', maxWidth: '150px' }}>
                                                {m.failureReason || 'Erro desconhecido'}
                                            </span>
                                        </div>
                                    ) : (
                                        <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <CheckCircle size={14} /> Ativo
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="icon-btn"
                                        onClick={() => handleRunCheck(m.id)}
                                        disabled={isRunningCheck === m.id}
                                        title="Verificar Agora"
                                    >
                                        <RefreshCw size={18} className={isRunningCheck === m.id ? 'spin' : ''} />
                                    </button>

                                    {hasPrice && (
                                        <a
                                            href={getWhatsAppLink(m)}
                                            target="_blank"
                                            className="icon-btn"
                                            style={{ color: '#25D366' }}
                                            title="Enviar Alerta WhatsApp"
                                        >
                                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                        </a>
                                    )}

                                    <button className="icon-btn danger" onClick={() => handleDelete(m.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Adicionar */}
            {isAdding && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <h3>Adicionar Monitoramento</h3>
                        <div className="admin-form">
                            <div className="form-group">
                                <label>Produto Nosso</label>
                                <select
                                    value={newMonitor.productId}
                                    onChange={(e) => setNewMonitor({ ...newMonitor, productId: e.target.value })}
                                >
                                    <option value="">Selecione um produto...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Link do Concorrente (URL)</label>
                                <input
                                    type="url"
                                    placeholder="https://site-concorrente.com/produto-x"
                                    value={newMonitor.url}
                                    onChange={(e) => setNewMonitor({ ...newMonitor, url: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Nome do Site (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Cellshop"
                                    value={newMonitor.siteName}
                                    onChange={(e) => setNewMonitor({ ...newMonitor, siteName: e.target.value })}
                                />
                            </div>
                            <div className="form-actions">
                                <button className="admin-btn secondary" onClick={() => setIsAdding(false)}>Cancelar</button>
                                <button className="admin-btn primary" onClick={handleAddMonitor}>Salvar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
