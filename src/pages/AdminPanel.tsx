import { useState } from 'react';
import { AdminMonitorPage } from './AdminMonitorPage';
import {
    LayoutDashboard,
    Image,
    Package,
    FolderOpen,
    Settings,
    ArrowLeft,
    Plus,
    Trash2,
    Edit2,
    Eye,
    EyeOff,
    GripVertical,
    Save,
    X,
    Megaphone,
    Sparkles,
    Menu,
    LineChart
} from 'lucide-react';
import { useStore, Banner, Product, Category } from '../store/store';

// Helper to compress images
const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new window.Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Max width/height 1920px (Full HD)
                const MAX_SIZE = 1920;
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    // Compress to JPEG 0.9 (High Quality)
                    resolve(canvas.toDataURL('image/jpeg', 0.9));
                } else {
                    resolve(event.target?.result as string);
                }
            };
        };
    });
};

type Tab = 'dashboard' | 'banners' | 'products' | 'categories' | 'topbar' | 'settings' | 'monitors';

export function AdminPanel() {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="admin-panel">
            {/* Mobile Menu Toggle */}
            <button className="admin-mobile-toggle" onClick={toggleMenu}>
                <Menu size={24} />
            </button>

            {/* SidebarOverlay */}
            {isMobileMenuOpen && <div className="admin-sidebar-overlay" onClick={closeMenu} />}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <a href="/" className="admin-logo">
                        <div className="admin-logo-icon">LG</div>
                        <span>Admin Panel</span>
                    </a>
                    <button className="admin-mobile-close" onClick={closeMenu}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="admin-nav">
                    <button
                        className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('dashboard'); closeMenu(); }}
                    >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'monitors' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('monitors'); closeMenu(); }}
                    >
                        <LineChart size={20} />
                        <span>Monitoramento</span>
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'banners' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('banners'); closeMenu(); }}
                    >
                        <Image size={20} />
                        <span>Banners</span>
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('products'); closeMenu(); }}
                    >
                        <Package size={20} />
                        <span>Produtos</span>
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('categories'); closeMenu(); }}
                    >
                        <FolderOpen size={20} />
                        <span>Categorias</span>
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'topbar' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('topbar'); closeMenu(); }}
                    >
                        <Megaphone size={20} />
                        <span>Barra Superior</span>
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('settings'); closeMenu(); }}
                    >
                        <Settings size={20} />
                        <span>Configurações</span>
                    </button>
                </nav>

                <div className="admin-sidebar-footer">
                    <a href="/" className="admin-nav-item">
                        <ArrowLeft size={20} />
                        <span>Voltar ao Site</span>
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {activeTab === 'dashboard' && <DashboardTab />}
                {activeTab === 'banners' && <BannersTab />}
                {activeTab === 'products' && <ProductsTab />}
                {activeTab === 'categories' && <CategoriesTab />}
                {activeTab === 'topbar' && <TopBarTab />}
                {activeTab === 'settings' && <SettingsTab />}
                {activeTab === 'monitors' && <AdminMonitorPage />}
            </main>
        </div>
    );
}

// Dashboard Tab
function DashboardTab() {
    const { banners, products, categories } = useStore();

    const stats = [
        { label: 'Banners Ativos', value: banners.filter(b => b.active).length, total: banners.length, icon: Image },
        { label: 'Produtos', value: products.filter(p => p.active).length, total: products.length, icon: Package },
        { label: 'Categorias', value: categories.filter(c => c.active).length, total: categories.length, icon: FolderOpen },
    ];

    return (
        <div className="admin-content">
            <h1 className="admin-title">Dashboard</h1>
            <p className="admin-subtitle">Bem-vindo ao painel de controle da LG Importados</p>

            <div className="admin-stats">
                {stats.map((stat) => (
                    <div key={stat.label} className="admin-stat-card">
                        <div className="admin-stat-icon">
                            <stat.icon size={24} />
                        </div>
                        <div className="admin-stat-info">
                            <span className="admin-stat-value">{stat.value}</span>
                            <span className="admin-stat-label">{stat.label}</span>
                            <span className="admin-stat-total">de {stat.total} total</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="admin-quick-actions">
                <h2>Ações Rápidas</h2>
                <div className="admin-actions-grid">
                    <button className="admin-action-btn">
                        <Plus size={20} />
                        Adicionar Banner
                    </button>
                    <button className="admin-action-btn">
                        <Plus size={20} />
                        Adicionar Produto
                    </button>
                    <button className="admin-action-btn">
                        <Eye size={20} />
                        Ver Site
                    </button>
                </div>
            </div>
        </div>
    );
}

// Banners Tab
function BannersTab() {
    const { banners, addBanner, updateBanner, deleteBanner } = useStore();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [uploadMode, setUploadMode] = useState<'url' | 'local'>('url');
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        url: '',
        alt: '',
        title: '',
        titleHighlight: '',
        subtitle: '',
        buttonText: '',
        active: true,
        order: 1
    });

    const handleSave = () => {
        if (isProcessing) return; // Prevent save while processing

        if (isEditing) {
            updateBanner(isEditing, formData);
            setIsEditing(null);
        } else {
            addBanner({ ...formData, order: banners.length + 1 });
            setIsAdding(false);
        }
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            url: '',
            alt: '',
            title: '',
            titleHighlight: '',
            subtitle: '',
            buttonText: '',
            active: true,
            order: 1
        });
        setUploadMode('url');
        setIsProcessing(false);
    };

    const handleEdit = (banner: Banner) => {
        setFormData({
            url: banner.url,
            alt: banner.alt,
            title: banner.title || '',
            titleHighlight: banner.titleHighlight || '',
            subtitle: banner.subtitle || '',
            buttonText: banner.buttonText || '',
            active: banner.active,
            order: banner.order
        });
        setUploadMode(banner.url.startsWith('data:') ? 'local' : 'url');
        setIsEditing(banner.id);
        setIsAdding(false);
    };

    const handleCancel = () => {
        setIsEditing(null);
        setIsAdding(false);
        resetForm();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsProcessing(true);
            compressImage(file).then(compressedUrl => {
                setFormData(prev => ({ ...prev, url: compressedUrl }));
                setIsProcessing(false);
            }).catch(() => {
                alert("Erro ao processar imagem");
                setIsProcessing(false);
            });
        }
    };

    return (
        <div className="admin-content">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Banners do Carrossel</h1>
                    <p className="admin-subtitle">Gerencie as imagens e textos que aparecem no banner principal</p>
                </div>
                <button className="admin-btn primary" onClick={() => { setIsAdding(true); setIsEditing(null); setUploadMode('url'); }}>
                    <Plus size={20} />
                    Novo Banner
                </button>
            </div>

            {(isAdding || isEditing) && (
                <div className="admin-form-card">
                    <h3>{isEditing ? 'Editar Banner' : 'Adicionar Banner'}</h3>
                    <div className="admin-form">
                        <div className="form-group">
                            <label>Imagem do Banner</label>
                            <div className="image-upload-options">
                                <div className="image-option">
                                    <label className="image-option-label">
                                        <input
                                            type="radio"
                                            name="imageSource"
                                            checked={uploadMode === 'url'}
                                            onChange={() => {
                                                setUploadMode('url');
                                                setFormData(prev => ({ ...prev, url: '' }));
                                            }}
                                        />
                                        URL Externa
                                    </label>
                                    <input
                                        type="text"
                                        value={uploadMode === 'url' ? formData.url : ''}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        placeholder="https://exemplo.com/imagem.jpg"
                                        disabled={uploadMode !== 'url'}
                                    />
                                </div>
                                <div className="image-option">
                                    <label className="image-option-label">
                                        <input
                                            type="radio"
                                            name="imageSource"
                                            checked={uploadMode === 'local'}
                                            onChange={() => {
                                                setUploadMode('local');
                                                setFormData(prev => ({ ...prev, url: '' }));
                                            }}
                                        />
                                        Upload Local {isProcessing && <span style={{ marginLeft: 8, fontSize: '0.8em', color: 'var(--primary-600)' }}>(Processando...)</span>}
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={uploadMode !== 'local' || isProcessing}
                                    />
                                </div>
                            </div>
                            {formData.url && !isProcessing && (
                                <div className="image-preview">
                                    <img src={formData.url} alt="Preview" />
                                    <button
                                        type="button"
                                        className="remove-image-btn"
                                        onClick={() => setFormData({ ...formData, url: '' })}
                                    >
                                        <X size={16} /> Remover
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Descrição (Alt)</label>
                            <input
                                type="text"
                                value={formData.alt}
                                onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                                placeholder="Descrição da imagem"
                            />
                        </div>

                        <hr style={{ margin: '1.5rem 0', borderColor: 'var(--gray-200)' }} />
                        <h4 style={{ marginBottom: '1rem', color: 'var(--gray-700)' }}>Textos do Banner</h4>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Título Principal</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Melhores preços do Paraguai"
                                />
                            </div>
                            <div className="form-group">
                                <label>Palavra em Destaque (Gold)</label>
                                <input
                                    type="text"
                                    value={formData.titleHighlight}
                                    onChange={(e) => setFormData({ ...formData, titleHighlight: e.target.value })}
                                    placeholder="preços"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Subtítulo</label>
                            <textarea
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                placeholder="Produtos originais com garantia e os menores preços do mercado."
                                rows={2}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div className="form-group">
                            <label>Texto do Botão</label>
                            <input
                                type="text"
                                value={formData.buttonText}
                                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                                placeholder="Ver Ofertas"
                            />
                        </div>

                        <div className="form-group checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                />
                                Ativo
                            </label>
                        </div>
                        <div className="form-actions">
                            <button className="admin-btn secondary" onClick={handleCancel}>
                                <X size={18} />
                                Cancelar
                            </button>
                            <button
                                className="admin-btn primary"
                                onClick={handleSave}
                                disabled={isProcessing}
                                style={{ opacity: isProcessing ? 0.7 : 1, cursor: isProcessing ? 'wait' : 'pointer' }}
                            >
                                <Save size={18} />
                                {isProcessing ? 'Processando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="admin-list">
                {banners.map((banner) => (
                    <div key={banner.id} className={`admin-list-item ${!banner.active ? 'inactive' : ''}`}>
                        <div className="admin-list-drag">
                            <GripVertical size={20} />
                        </div>
                        <div className="admin-list-preview">
                            <img src={banner.url} alt={banner.alt} />
                        </div>
                        <div className="admin-list-info">
                            <span className="admin-list-title">{banner.alt}</span>
                            <span className="admin-list-meta">{banner.url.substring(0, 50)}...</span>
                        </div>
                        <div className="admin-list-status">
                            {banner.active ? (
                                <span className="status-badge active"><Eye size={14} /> Ativo</span>
                            ) : (
                                <span className="status-badge inactive"><EyeOff size={14} /> Inativo</span>
                            )}
                        </div>
                        <div className="admin-list-actions">
                            <button className="icon-btn" onClick={() => handleEdit(banner)}>
                                <Edit2 size={18} />
                            </button>
                            <button className="icon-btn" onClick={() => updateBanner(banner.id, { active: !banner.active })}>
                                {banner.active ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            <button className="icon-btn danger" onClick={() => deleteBanner(banner.id)}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Products Tab
function ProductsTab() {
    const { products, categories, addProduct, updateProduct, deleteProduct } = useStore();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '', priceUSD: 0, priceBRL: 0, priceBrazil: 0, image: '',
        category: '', store: 'LG Importados', discount: 0, isNew: false, featured: false, active: true
    });

    const handleSave = () => {
        if (isEditing) {
            updateProduct(isEditing, formData);
            setIsEditing(null);
        } else {
            addProduct(formData as Omit<Product, 'id'>);
            setIsAdding(false);
        }
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: '', priceUSD: 0, priceBRL: 0, priceBrazil: 0, image: '',
            category: '', store: 'LG Importados', discount: 0, isNew: false, featured: false, active: true
        });
    };

    const handleEdit = (product: Product) => {
        setFormData(product);
        setIsEditing(product.id);
        setIsAdding(false);
    };

    const handleCancel = () => {
        setIsEditing(null);
        setIsAdding(false);
        resetForm();
    };

    // Auto-calculate BRL price based on USD (using exchange rate of 5.8)
    const handleUSDChange = (value: number) => {
        setFormData({
            ...formData,
            priceUSD: value,
            priceBRL: Math.round(value * 5.8)
        });
    };

    return (
        <div className="admin-content">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Produtos</h1>
                    <p className="admin-subtitle">Gerencie o catálogo de produtos</p>
                </div>
                <button className="admin-btn primary" onClick={() => { setIsAdding(true); setIsEditing(null); resetForm(); }}>
                    <Plus size={20} />
                    Novo Produto
                </button>
                <a href="/admin/quick-product" className="admin-btn secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                    <Sparkles size={20} />
                    Cadastro com IA
                </a>
            </div>

            {/* Lista de Produtos em Tabela */}
            <div className="admin-products-list">
                <div className="admin-products-header">
                    <span className="col-image">Imagem</span>
                    <span className="col-name">Nome</span>
                    <span className="col-price">Preço USD</span>
                    <span className="col-category">Categoria</span>
                    <span className="col-status">Status</span>
                    <span className="col-actions">Ações</span>
                </div>
                {products.map((product) => (
                    <div key={product.id} className={`admin-product-row ${!product.active ? 'inactive' : ''}`}>
                        <div className="col-image">
                            <img src={product.image || 'https://via.placeholder.com/50'} alt={product.name} />
                            {(product.discount || 0) > 0 && <span className="discount-badge-mini">-{product.discount}%</span>}
                        </div>
                        <div className="col-name">
                            <span className="product-name">{product.name}</span>
                            {product.isNew && <span className="new-tag">Novo</span>}
                            {product.featured && <span className="featured-tag">★</span>}
                        </div>
                        <div className="col-price">
                            <span className="price-usd">US$ {product.priceUSD.toLocaleString('pt-BR')}</span>
                            <span className="price-brl">≈ R$ {product.priceBRL.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="col-category">
                            {categories.find(c => c.id === product.category)?.name || product.category || '-'}
                        </div>
                        <div className="col-status">
                            <span className={`status-badge ${product.active ? 'active' : 'inactive'}`}>
                                {product.active ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                        <div className="col-actions">
                            <button className="icon-btn" onClick={() => handleEdit(product)} title="Editar">
                                <Edit2 size={16} />
                            </button>
                            <button className="icon-btn" onClick={() => updateProduct(product.id, { active: !product.active })} title={product.active ? 'Desativar' : 'Ativar'}>
                                {product.active ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button className="icon-btn danger" onClick={() => deleteProduct(product.id)} title="Excluir">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {products.length === 0 && (
                    <div className="admin-empty">Nenhum produto cadastrado</div>
                )}
            </div>

            {/* Modal de Edição/Criação */}
            {(isAdding || isEditing) && (
                <div className="admin-modal-overlay" onClick={handleCancel}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>{isEditing ? 'Editar Produto' : 'Novo Produto'}</h3>
                            <button className="admin-modal-close" onClick={handleCancel}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nome do Produto</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="iPhone 15 Pro Max 256GB"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Categoria</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Preço USD</label>
                                    <input
                                        type="number"
                                        value={formData.priceUSD}
                                        onChange={(e) => handleUSDChange(Number(e.target.value))}
                                        placeholder="1199"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Preço BRL (calculado)</label>
                                    <input
                                        type="number"
                                        value={formData.priceBRL}
                                        onChange={(e) => setFormData({ ...formData, priceBRL: Number(e.target.value) })}
                                        readOnly
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Preço Brasil (referência)</label>
                                    <input
                                        type="number"
                                        value={formData.priceBrazil}
                                        onChange={(e) => setFormData({ ...formData, priceBrazil: Number(e.target.value) })}
                                        placeholder="9499"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>URL da Imagem</label>
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Desconto (%)</label>
                                    <input
                                        type="number"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                                        placeholder="27"
                                    />
                                </div>
                            </div>

                            <div className="form-row checkboxes">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.isNew}
                                        onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                                    />
                                    Produto Novo
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured || false}
                                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    />
                                    Destaque
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    />
                                    Ativo
                                </label>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn secondary" onClick={handleCancel}>
                                Cancelar
                            </button>
                            <button className="admin-btn primary" onClick={handleSave}>
                                <Save size={18} />
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Categories Tab
function CategoriesTab() {
    const { categories, addCategory, updateCategory, deleteCategory } = useStore();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: '', icon: '', image: '', subtitle: '', active: true });

    const handleSave = () => {
        if (isEditing) {
            updateCategory(isEditing, formData);
            setIsEditing(null);
        } else {
            addCategory(formData);
            setIsAdding(false);
        }
        setFormData({ name: '', icon: '', image: '', subtitle: '', active: true });
    };

    const handleEdit = (category: Category) => {
        setFormData({
            name: category.name,
            icon: category.icon,
            image: category.image || '',
            subtitle: category.subtitle || '',
            active: category.active
        });
        setIsEditing(category.id);
        setIsAdding(false);
    };

    const handleCancel = () => {
        setIsEditing(null);
        setIsAdding(false);
        setFormData({ name: '', icon: '', image: '', subtitle: '', active: true });
    };

    return (
        <div className="admin-content">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Categorias</h1>
                    <p className="admin-subtitle">Gerencie as categorias de produtos</p>
                </div>
                <button className="admin-btn primary" onClick={() => { setIsAdding(true); setIsEditing(null); }}>
                    <Plus size={20} />
                    Nova Categoria
                </button>
            </div>

            {(isAdding || isEditing) && (
                <div className="admin-form-card">
                    <h3>{isEditing ? 'Editar Categoria' : 'Adicionar Categoria'}</h3>
                    <div className="admin-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nome da Categoria</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Smartphones"
                                />
                            </div>
                            <div className="form-group">
                                <label>Ícone (Emoji)</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="📱"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>URL da Imagem</label>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Subtítulo</label>
                                <input
                                    type="text"
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    placeholder="Marcas principais..."
                                />
                            </div>
                        </div>
                        <div className="form-group checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                />
                                Ativa
                            </label>
                        </div>
                        <div className="form-actions">
                            <button className="admin-btn secondary" onClick={handleCancel}>
                                <X size={18} />
                                Cancelar
                            </button>
                            <button className="admin-btn primary" onClick={handleSave}>
                                <Save size={18} />
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="admin-list">
                {categories.map((category) => (
                    <div key={category.id} className={`admin-list-item ${!category.active ? 'inactive' : ''}`}>
                        <div className="admin-list-icon">{category.icon}</div>
                        <div className="admin-list-info">
                            <span className="admin-list-title">{category.name}</span>
                            <span className="admin-list-meta">ID: {category.id}</span>
                        </div>
                        <div className="admin-list-status">
                            {category.active ? (
                                <span className="status-badge active"><Eye size={14} /> Ativa</span>
                            ) : (
                                <span className="status-badge inactive"><EyeOff size={14} /> Inativa</span>
                            )}
                        </div>
                        <div className="admin-list-actions">
                            <button className="icon-btn" onClick={() => handleEdit(category)}>
                                <Edit2 size={18} />
                            </button>
                            <button className="icon-btn" onClick={() => updateCategory(category.id, { active: !category.active })}>
                                {category.active ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            <button className="icon-btn danger" onClick={() => deleteCategory(category.id)}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Top Bar Tab
function TopBarTab() {
    const { topBar, updateTopBarSettings, updateTopBarItem, updateDollarRate, resetTopBar } = useStore();
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ title: '', details: [''], icon: '' });

    // Fallback values for old data
    const safeTopBar = {
        active: topBar?.active ?? true,
        backgroundColor: topBar?.backgroundColor ?? '#000000',
        textColor: topBar?.textColor ?? '#ffffff',
        dollarRate: topBar?.dollarRate ?? 5.80,
        items: topBar?.items ?? []
    };

    const handleEditItem = (item: any) => {
        setEditingItem(item.id);
        setEditForm({
            title: item.title || '',
            details: item.details || [''],
            icon: item.icon || ''
        });
    };

    const handleSaveItem = (id: string) => {
        updateTopBarItem(id, editForm);
        setEditingItem(null);
    };

    const handleDetailChange = (index: number, value: string) => {
        const newDetails = [...editForm.details];
        newDetails[index] = value;
        setEditForm({ ...editForm, details: newDetails });
    };

    const addDetail = () => {
        setEditForm({ ...editForm, details: [...editForm.details, ''] });
    };

    const removeDetail = (index: number) => {
        const newDetails = editForm.details.filter((_, i) => i !== index);
        setEditForm({ ...editForm, details: newDetails });
    };

    const handleReset = () => {
        if (window.confirm('Isso vai resetar todas as configurações da Top Bar para os valores padrão. Continuar?')) {
            resetTopBar();
        }
    };

    return (
        <div className="admin-content">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Barra Superior (Top Bar)</h1>
                    <p className="admin-subtitle">Gerencie a barra de informações no topo do site</p>
                </div>
                <button className="admin-btn secondary" onClick={handleReset} style={{ marginLeft: 'auto' }}>
                    🔄 Resetar Top Bar
                </button>
            </div>

            <div className="admin-form-card">
                <h3>Configurações Gerais</h3>
                <div className="admin-form">
                    <div className="form-group checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={safeTopBar.active}
                                onChange={(e) => updateTopBarSettings({ active: e.target.checked })}
                            />
                            Habilitar Barra Superior
                        </label>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Cor de Fundo</label>
                            <input
                                type="color"
                                value={safeTopBar.backgroundColor}
                                onChange={(e) => updateTopBarSettings({ backgroundColor: e.target.value })}
                                style={{ height: '50px', width: '100px' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Cor do Texto</label>
                            <input
                                type="color"
                                value={safeTopBar.textColor}
                                onChange={(e) => updateTopBarSettings({ textColor: e.target.value })}
                                style={{ height: '50px', width: '100px' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>💵 Cotação do Dólar (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={safeTopBar.dollarRate}
                                onChange={(e) => updateDollarRate(Number(e.target.value))}
                                style={{ width: '120px' }}
                            />
                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '4px' }}>
                                Exibido como: US$ 1 = R$ {safeTopBar.dollarRate.toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-form-card" style={{ marginTop: '2rem' }}>
                <h3>Itens da Barra (Hover Expandível)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
                    Cada item mostra apenas o título. Ao passar o mouse, os detalhes expandem suavemente.
                </p>
                <div className="admin-list">
                    {safeTopBar.items.length === 0 && (
                        <p style={{ padding: '1rem', color: 'var(--gray-500)', textAlign: 'center' }}>
                            Nenhum item encontrado. Clique em "Resetar Top Bar" para restaurar os itens padrão.
                        </p>
                    )}
                    {safeTopBar.items.map((item: any) => (
                        <div key={item.id} className="admin-list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                            {editingItem === item.id ? (
                                <div style={{ width: '100%' }}>
                                    <div className="form-row" style={{ marginBottom: '1rem' }}>
                                        <div className="form-group" style={{ flex: 2 }}>
                                            <label>Título</label>
                                            <input
                                                value={editForm.title}
                                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                placeholder="HORÁRIO DE ATENDIMENTO"
                                            />
                                        </div>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label>Ícone (Lucide)</label>
                                            <input
                                                value={editForm.icon}
                                                onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                                                placeholder="Clock"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Detalhes (aparecem no hover)</label>
                                        {editForm.details.map((detail, index) => (
                                            <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <input
                                                    value={detail}
                                                    onChange={(e) => handleDetailChange(index, e.target.value)}
                                                    placeholder={`Linha ${index + 1}`}
                                                    style={{ flex: 1 }}
                                                />
                                                {editForm.details.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="icon-btn danger"
                                                        onClick={() => removeDetail(index)}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="admin-btn secondary"
                                            onClick={addDetail}
                                            style={{ marginTop: '0.5rem' }}
                                        >
                                            <Plus size={16} /> Adicionar Linha
                                        </button>
                                    </div>
                                    <div className="form-actions">
                                        <button className="admin-btn secondary" onClick={() => setEditingItem(null)}>
                                            <X size={18} /> Cancelar
                                        </button>
                                        <button className="admin-btn primary" onClick={() => handleSaveItem(item.id)}>
                                            <Save size={18} /> Salvar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '1rem' }}>
                                    <div className="admin-list-info" style={{ flex: 1 }}>
                                        <span className="admin-list-title">
                                            {item.title || item.text || '(Sem título)'}
                                            {!item.title && item.text && (
                                                <span style={{ marginLeft: '8px', color: 'orange', fontSize: '0.7rem' }}>
                                                    ⚠️ Estrutura antiga - clique em Resetar
                                                </span>
                                            )}
                                        </span>
                                        <span className="admin-list-meta">
                                            Ícone: {item.icon || '-'} | Detalhes: {item.details?.length || 0} linha(s)
                                        </span>
                                    </div>
                                    <div className="admin-list-actions">
                                        <div className="form-group checkbox" style={{ marginBottom: 0 }}>
                                            <label style={{ fontSize: '0.8rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={item.active}
                                                    onChange={(e) => updateTopBarItem(item.id, { active: e.target.checked })}
                                                />
                                                Exibir
                                            </label>
                                        </div>
                                        <button className="icon-btn" onClick={() => handleEditItem(item)}>
                                            <Edit2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Settings Tab
function SettingsTab() {
    return (
        <div className="admin-content">
            <h1 className="admin-title">Configurações</h1>
            <p className="admin-subtitle">Configurações gerais do sistema</p>

            <div className="admin-form-card">
                <h3>Configurações da Loja</h3>
                <div className="admin-form">
                    <div className="form-group">
                        <label>Nome da Loja</label>
                        <input type="text" defaultValue="LG Importados" />
                    </div>
                    <div className="form-group">
                        <label>Taxa de Câmbio USD/BRL</label>
                        <input type="number" step="0.01" defaultValue="5.80" />
                    </div>
                    <div className="form-group">
                        <label>WhatsApp</label>
                        <input type="text" defaultValue="+595 000 000 000" />
                    </div>
                    <div className="form-actions">
                        <button className="admin-btn primary">
                            <Save size={18} />
                            Salvar Configurações
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
