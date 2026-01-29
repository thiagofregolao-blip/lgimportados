import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, ArrowLeftRight, X, Loader2, TrendingDown, Store, Plus, Minus, Share2, Check } from 'lucide-react';
import { useStore, Product } from '../store/store';
import { TopBar } from '../components/TopBar';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface ComparisonData {
    productName: string;
    paraguay: { priceUSD: number; priceBRL: number; store: string };
    brazil: { store: string; price: number; currency: string; estimated: boolean }[];
    savings: { amount: number; percentage: number; cheaperInBrazil: boolean };
    exchangeRate: number;
}

export function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const { products } = useStore();
    const [product, setProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [showComparison, setShowComparison] = useState(false);
    const [loading, setLoading] = useState(false);
    const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
    const [addedToCart, setAddedToCart] = useState(false);

    // Scroll para o topo quando a página carrega
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (id) {
            const found = products.find(p => String(p.id) === id);
            setProduct(found || null);
        }
    }, [id, products]);

    const formatCurrency = (value: number, currency: string) => {
        if (currency === 'USD') {
            return `US$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
        }
        return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    };

    const handleCompare = async () => {
        if (!product) return;
        setShowComparison(true);
        setLoading(true);

        try {
            const response = await fetch('/api/prices/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) setComparisonData(data.comparison);
            }
        } catch (err) {
            console.error('Error comparing:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        // Adicionar ao carrinho (simulado - você pode implementar store de carrinho)
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleBuyNow = () => {
        if (!product) return;
        // Redirecionar para WhatsApp ou checkout
        const message = encodeURIComponent(
            `Olá! Quero comprar:\n\n` +
            `📦 ${product.name}\n` +
            `💵 ${formatCurrency(product.priceUSD, 'USD')}\n` +
            `📊 Quantidade: ${quantity}\n\n` +
            `Total: ${formatCurrency(product.priceUSD * quantity, 'USD')}`
        );
        window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
    };

    if (!product) {
        return (
            <div className="app">
                <TopBar />
                <Header />
                <main className="main-content">
                    <div className="product-page-loading">
                        <Loader2 size={40} className="spinner" />
                        <p>Carregando produto...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="app">
            <TopBar />
            <Header />
            <main className="main-content">
                <div className="product-page">
                    {/* Breadcrumb */}
                    <nav className="product-page-breadcrumb">
                        <Link to="/" className="breadcrumb-link">
                            <ArrowLeft size={18} />
                            Voltar para Home
                        </Link>
                    </nav>

                    <div className="product-page-content">
                        {/* Galeria de Imagens */}
                        <div className="product-page-gallery">
                            <div className="product-page-main-image">
                                <img src={product.image} alt={product.name} />
                                {product.discount && (
                                    <span className="product-page-badge discount">-{product.discount}%</span>
                                )}
                                {product.isNew && (
                                    <span className="product-page-badge new">Novo</span>
                                )}
                            </div>
                        </div>

                        {/* Informações do Produto */}
                        <div className="product-page-info">
                            <div className="product-page-header">
                                <span className="product-page-category">{product.category}</span>
                                <button className="product-page-favorite">
                                    <Heart size={22} />
                                </button>
                            </div>

                            <h1 className="product-page-title">{product.name}</h1>

                            <p className="product-page-store">
                                <Store size={16} />
                                Vendido por <strong>{product.store || 'LG Importados'}</strong>
                            </p>

                            {/* Preços */}
                            <div className="product-page-prices">
                                <div className="product-page-price-usd">
                                    {formatCurrency(product.priceUSD, 'USD')}
                                </div>
                                <div className="product-page-price-brl">
                                    ≈ {formatCurrency(product.priceBRL, 'BRL')}
                                </div>
                                {product.discount && (
                                    <span className="product-page-discount-badge">
                                        Economia de {product.discount}% vs Brasil
                                    </span>
                                )}
                            </div>

                            {/* Botão Comparar Preço */}
                            <button className="product-page-compare-btn" onClick={handleCompare}>
                                <ArrowLeftRight size={18} />
                                Comparar com Preços do Brasil
                            </button>

                            {/* Quantidade */}
                            <div className="product-page-quantity">
                                <span>Quantidade:</span>
                                <div className="quantity-controls">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                        <Minus size={16} />
                                    </button>
                                    <span>{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)}>
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="product-page-actions">
                                <button
                                    className={`product-page-add-cart ${addedToCart ? 'added' : ''}`}
                                    onClick={handleAddToCart}
                                >
                                    {addedToCart ? (
                                        <>
                                            <Check size={20} />
                                            Adicionado!
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={20} />
                                            Adicionar ao Carrinho
                                        </>
                                    )}
                                </button>
                                <button className="product-page-buy-now" onClick={handleBuyNow}>
                                    Comprar Agora
                                </button>
                            </div>

                            {/* Compartilhar */}
                            <button className="product-page-share">
                                <Share2 size={16} />
                                Compartilhar
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            {/* Modal de Comparação */}
            {showComparison && (
                <div className="price-comparison-overlay" onClick={() => setShowComparison(false)}>
                    <div className="price-comparison-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="price-comparison-close" onClick={() => setShowComparison(false)}>
                            <X size={24} />
                        </button>
                        <h2 className="price-comparison-title">
                            <ArrowLeftRight size={24} />
                            Comparação de Preços
                        </h2>

                        {loading && (
                            <div className="price-comparison-loading">
                                <Loader2 size={40} className="spinner" />
                                <p>Buscando preços no Brasil...</p>
                            </div>
                        )}

                        {comparisonData && !loading && (
                            <div className="price-comparison-content">
                                <h3 className="price-comparison-product-name">{comparisonData.productName}</h3>
                                <div className="price-comparison-grid">
                                    <div className="price-comparison-card paraguay">
                                        <div className="price-comparison-card-header">
                                            <span className="flag">🇵🇾</span>
                                            <span>Paraguai</span>
                                        </div>
                                        <div className="price-comparison-card-store">
                                            <Store size={14} />
                                            {comparisonData.paraguay.store}
                                        </div>
                                        <div className="price-comparison-card-price-usd">
                                            {formatCurrency(comparisonData.paraguay.priceUSD, 'USD')}
                                        </div>
                                        <div className="price-comparison-card-price-brl">
                                            ≈ {formatCurrency(comparisonData.paraguay.priceBRL, 'BRL')}
                                        </div>
                                    </div>
                                    <div className="price-comparison-card brazil">
                                        <div className="price-comparison-card-header">
                                            <span className="flag">🇧🇷</span>
                                            <span>Brasil</span>
                                        </div>
                                        {comparisonData.brazil.map((store, i) => (
                                            <div key={i} className="price-comparison-brazil-store">
                                                <span className="store-name">
                                                    <Store size={14} />
                                                    {store.store}
                                                </span>
                                                <span className="store-price">
                                                    {formatCurrency(store.price, 'BRL')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {!comparisonData.savings.cheaperInBrazil && (
                                    <div className="price-comparison-savings">
                                        <TrendingDown size={20} />
                                        <span>
                                            Economia de <strong>{formatCurrency(comparisonData.savings.amount, 'BRL')}</strong>
                                            {' '}({comparisonData.savings.percentage}% mais barato!)
                                        </span>
                                    </div>
                                )}
                                <p className="price-comparison-rate">
                                    Cotação: $1 = R$ {comparisonData.exchangeRate.toFixed(2)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
