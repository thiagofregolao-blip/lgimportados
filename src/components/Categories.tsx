import { ChevronRight } from 'lucide-react';
import { useStore } from '../store/store';

// Default images and subtitles for categories (fallback for old data)
const categoryDefaults: Record<string, { image: string; subtitle: string }> = {
    smartphones: {
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&q=80',
        subtitle: 'iPhone, Samsung, Xiaomi'
    },
    notebooks: {
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop&q=80',
        subtitle: 'Apple, Dell'
    },
    games: {
        image: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=400&h=400&fit=crop&q=80',
        subtitle: 'PS5, Xbox, Nintendo'
    },
    smartwatch: {
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=80',
        subtitle: 'Smartwatches, Fones'
    },
    cameras: {
        image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop&q=80',
        subtitle: 'Canon, Nikon, Sony'
    },
    audio: {
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80',
        subtitle: 'Fones de ouvido'
    },
    perfumes: {
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&q=80',
        subtitle: 'Importados'
    },
    cosmeticos: {
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&q=80',
        subtitle: 'Maquiagem, Skincare'
    }
};

export function Categories() {
    const { categories } = useStore();
    const activeCategories = categories.filter(c => c.active);

    return (
        <section className="categories">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Navegue por Categorias</h2>
                    <a href="/categorias" className="section-link">
                        Ver todas
                        <ChevronRight size={18} />
                    </a>
                </div>

                <div className="categories-grid">
                    {activeCategories.map((category: any) => {
                        const defaults = categoryDefaults[category.id] || { image: '', subtitle: '' };
                        const image = category.image || defaults.image || 'https://via.placeholder.com/300';
                        const subtitle = category.subtitle || defaults.subtitle || '';

                        return (
                            <a
                                key={category.id}
                                href={`/categoria/${category.id}`}
                                className="category-card"
                            >
                                <div className="category-image-wrapper">
                                    <img
                                        src={image}
                                        alt={category.name}
                                        loading="lazy"
                                    />
                                </div>
                                <div className="category-text">
                                    <span className="category-name">{category.name}</span>
                                    <span className="category-subtitle">{subtitle}</span>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
