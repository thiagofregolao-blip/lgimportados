import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeftRight, X, Loader2, TrendingDown, Store, Plus, Minus, CreditCard, Truck } from 'lucide-react';
import { useStore, Product } from '../store/store';
import { TopBar } from '../components/TopBar';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CartModal } from '../components/CartModal';

interface ComparisonData {
    productName: string;
    paraguay: { priceUSD: number; priceBRL: number; store: string };
    brazil: { store: string; price: number; currency: string; estimated: boolean }[];
    savings: { amount: number; percentage: number; cheaperInBrazil: boolean };
    exchangeRate: number;
}

export function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const { products, addToCart } = useStore();
    const [product, setProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [showComparison, setShowComparison] = useState(false);
    const [loading, setLoading] = useState(false);
    const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
        addToCart(product, quantity);
        setIsCartModalOpen(true);
    };

    const handleBuyNow = () => {
        if (!product) return;
        addToCart(product, quantity);
        setIsCartModalOpen(true);
    };

    const navigate = useNavigate(); // Add hook usage

    // ... (inside component)

    const handleGoToCheckout = () => {
        if (!product) return;
        setIsCartModalOpen(false);
        navigate('/checkout');
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

    // Mock images for gallery (using the main image multiple times if no gallery structure exists yet)
    const images = [product.image, product.image, product.image, product.image];

    return (
        <div className="app">
            <TopBar />
            <Header />
            <main className="main-content">
                <div className="product-page-container">

                    {/* Coluna 1: Galeria de Imagens */}
                    <div className="product-gallery">
                        <div className="product-main-image">
                            <img src={images[selectedImageIndex]} alt={product.name} />
                            {(product.discount || 0) > 0 && (
                                <span className="product-badge discount">-{product.discount}%</span>
                            )}
                        </div>
                        <div className="product-thumbnails">
                            {images.map((img, idx) => (
                                <div
                                    key={idx}
                                    className={`product-thumb ${selectedImageIndex === idx ? 'active' : ''}`}
                                    onClick={() => setSelectedImageIndex(idx)}
                                >
                                    <img src={img} alt={`Thumb ${idx}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Coluna 2: Detalhes do Produto */}
                    <div className="product-details">
                        <div className="product-page-header">
                            <span className="product-page-category">{product.category}</span>
                            <div className="product-rating">
                                ★★★★★ <span>(4.8)</span>
                            </div>
                        </div>

                        <h1>{product.name}</h1>

                        <p className="product-page-store">
                            <Store size={16} />
                            Vendido e entregue por <strong>{product.store || 'LG Importados'}</strong>
                        </p>

                        <p className="product-description-short">
                            {product.description || `O ${product.name} oferece desempenho excepcional e design moderno. Ideal para quem busca tecnologia de ponta com o melhor custo-benefício do mercado paraguaio.`}
                            <br />
                            <span className="product-more-info-link">mais informações</span>
                        </p>

                        <div className="product-variants">
                            <div className="variant-section">
                                <p className="variant-label">Cor: Padrão</p>
                                <div className="variant-options">
                                    <div className="variant-option selected">
                                        <div className="variant-name">Padrão</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="product-page-compare-btn" onClick={handleCompare}>
                            <ArrowLeftRight size={18} />
                            Ver Comparativo de Preços (Brasil vs Paraguai)
                        </button>
                    </div>

                    {/* Coluna 3: Buy Box */}
                    <div className="product-buy-box">
                        <div className="price-block">
                            {(product.discount || 0) > 0 && (
                                <div className="price-original">
                                    {formatCurrency(product.priceUSD * 1.2, 'USD')}
                                </div>
                            )}
                            <div className="price-current">
                                {formatCurrency(product.priceUSD, 'USD')}
                            </div>
                            <div className="price-pix">
                                ≈ {formatCurrency(product.priceBRL, 'BRL')} no Pix
                            </div>
                        </div>

                        <div className="payment-info">
                            <CreditCard size={16} />
                            <span>Em até 12x no cartão (consulte taxas)</span>
                        </div>

                        <div className="shipping-calc">
                            <p className="shipping-title">
                                <Truck size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }} />
                                Calcular frete e prazo
                            </p>
                            <div className="shipping-input-group">
                                <input type="text" placeholder="Digite seu CEP" className="shipping-input" />
                                <button className="shipping-btn">OK</button>
                            </div>
                        </div>

                        <div className="quantity-buy-box">
                            <span className="qty-label">Quantidade:</span>
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

                        <div className="buy-actions">
                            <button className="buy-btn secondary" onClick={handleAddToCart} style={{ marginBottom: '10px', background: '#fff', color: '#333', border: '1px solid #ccc' }}>
                                <ShoppingCart size={20} />
                                Adicionar ao Carrinho
                            </button>
                            <button className="buy-btn primary" onClick={handleBuyNow}>
                                <CreditCard size={20} />
                                Comprar Agora
                            </button>
                        </div>
                    </div>

                </div>
            </main>
            <Footer />

            <CartModal
                isOpen={isCartModalOpen}
                onClose={() => setIsCartModalOpen(false)}
                onGoToCheckout={handleGoToCheckout}
                product={product}
                quantity={quantity}
            />

            {/* Modal de Comparação (Mantido) */}
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
