import { Heart, ArrowLeftRight } from 'lucide-react';
import { Product } from '../store/store';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const formatCurrency = (value: number, currency: string) => {
        if (currency === 'USD') {
            return `US$ ${value.toLocaleString('pt-BR')}`;
        }
        return `R$ ${value.toLocaleString('pt-BR')}`;
    };

    return (
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

                <button className="product-compare-btn">
                    <ArrowLeftRight size={16} />
                    Comparar com Brasil
                </button>
            </div>
        </article>
    );
}
