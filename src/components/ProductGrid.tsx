import { ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useStore } from '../store/store';

interface ProductGridProps {
    title: string;
    showAll?: boolean;
    limit?: number;
}

export function ProductGrid({ title, showAll = true, limit }: ProductGridProps) {
    const { products } = useStore();
    const activeProducts = products.filter(p => p.active);
    const displayProducts = limit ? activeProducts.slice(0, limit) : activeProducts;

    return (
        <section className="products-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{title}</h2>
                    {showAll && (
                        <a href="/produtos" className="section-link">
                            Ver todos
                            <ChevronRight size={18} />
                        </a>
                    )}
                </div>

                <div className="products-grid">
                    {displayProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
