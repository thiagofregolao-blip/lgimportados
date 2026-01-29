import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeftRight, X, Loader2, TrendingDown, Store } from 'lucide-react';
import { Product } from '../store/store';

interface ProductCardProps {
    product: Product;
}

interface ComparisonData {
    productName: string;
    paraguay: {
        priceUSD: number;
        priceBRL: number;
        store: string;
    };
    brazil: {
        store: string;
        price: number;
        currency: string;
        estimated: boolean;
    }[];
    savings: {
        amount: number;
        percentage: number;
        cheaperInBrazil: boolean;
    };
    exchangeRate: number;
}

export function ProductCard({ product }: ProductCardProps) {
    const [showComparison, setShowComparison] = useState(false);
    const [loading, setLoading] = useState(false);
    const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const formatCurrency = (value: number, currency: string) => {
        if (currency === 'USD') {
            return `US$ ${value.toLocaleString('pt-BR')}`;
        }
        return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    };

    const handleCompare = async (e: React.MouseEvent) => {
        e.preventDefault(); // Evita navegação
        e.stopPropagation();
        setShowComparison(true);
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/prices/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id }),
            });

            if (!response.ok) {
                throw new Error('Erro ao comparar preços');
            }

            const data = await response.json();
            if (data.success) {
                setComparisonData(data.comparison);
            } else {
                throw new Error(data.message || 'Erro desconhecido');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Link to={`/produto/${product.id}`} className="product-card-link">
                <article className="product-card animate-fade-in">
                    <div className="product-image-wrapper">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="product-image"
                            loading="lazy"
                        />

                        {product.discount && (
                            <span className="product-badge">-{product.discount}%</span>
                        )}

                        {product.isNew && (
                            <span className="product-badge new">Novo</span>
                        )}

                        <button
                            className="product-favorite"
                            aria-label="Adicionar aos favoritos"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Heart size={18} />
                        </button>
                    </div>

                    <div className="product-info">
                        <h3 className="product-name">{product.name}</h3>
                        <p className="product-store">{product.store}</p>

                        <div className="product-prices">
                            <span className="product-price-usd">
                                {formatCurrency(product.priceUSD, 'USD')}
                            </span>
                            <span className="product-price-brl">
                                ≈ {formatCurrency(product.priceBRL, 'BRL')}
                            </span>
                        </div>

                        <button className="product-compare-btn" onClick={handleCompare}>
                            <ArrowLeftRight size={16} />
                            Comparar com Brasil
                        </button>
                    </div>
                </article>
            </Link>

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

                        {error && (
                            <div className="price-comparison-error">
                                <p>❌ {error}</p>
                                <button onClick={handleCompare}>Tentar novamente</button>
                            </div>
                        )}

                        {comparisonData && !loading && (
                            <div className="price-comparison-content">
                                <h3 className="price-comparison-product-name">{comparisonData.productName}</h3>

                                <div className="price-comparison-grid">
                                    {/* Lado Paraguai */}
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

                                    {/* Lado Brasil */}
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
                                                    {store.estimated && <small> (est.)</small>}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Badge de Economia */}
                                {!comparisonData.savings.cheaperInBrazil && (
                                    <div className="price-comparison-savings">
                                        <TrendingDown size={20} />
                                        <span>
                                            Economia de <strong>{formatCurrency(comparisonData.savings.amount, 'BRL')}</strong>
                                            {' '}({comparisonData.savings.percentage}% mais barato no Paraguai!)
                                        </span>
                                    </div>
                                )}

                                {comparisonData.savings.cheaperInBrazil && (
                                    <div className="price-comparison-savings brazil-cheaper">
                                        <span>⚠️ Este produto pode estar mais barato no Brasil</span>
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
        </>
    );
}
