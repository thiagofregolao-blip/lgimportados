import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/store';

export function Hero() {
    const { banners, products } = useStore();
    const activeBanners = banners.filter(b => b.active);

    const [currentSlide, setCurrentSlide] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    // Auto-rotate carousel every 5 seconds
    useEffect(() => {
        if (activeBanners.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [activeBanners.length]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const goToPrev = () => {
        setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
    };

    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Will be connected to AI search later
            console.log('Searching:', searchQuery);
        }
    };

    return (
        <section className="hero">
            {/* Carousel Background */}
            <div className="hero-carousel">
                {activeBanners.map((banner, index) => (
                    <div
                        key={banner.id}
                        className={`hero-carousel-slide ${index === currentSlide ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${banner.url})` }}
                    />
                ))}
                <div className="hero-carousel-overlay" />
            </div>

            {/* Carousel Navigation */}
            {activeBanners.length > 1 && (
                <>
                    <button className="hero-carousel-nav prev" onClick={goToPrev} aria-label="Banner anterior">
                        <ChevronLeft size={24} />
                    </button>
                    <button className="hero-carousel-nav next" onClick={goToNext} aria-label="Próximo banner">
                        <ChevronRight size={24} />
                    </button>

                    {/* Carousel Dots */}
                    <div className="hero-carousel-dots">
                        {activeBanners.map((_, index) => (
                            <button
                                key={index}
                                className={`hero-carousel-dot ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => goToSlide(index)}
                                aria-label={`Ir para banner ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Content */}
            <div className="container hero-container">
                <div className="hero-content">
                    {/* Search Bar moved here */}
                    <form className="hero-search" onSubmit={handleSearch}>
                        <Search className="hero-search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar produtos, marcas e mais..."
                            aria-label="Buscar produtos"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="hero-search-btn">
                            Buscar
                        </button>
                    </form>

                    {activeBanners.length > 0 && (
                        <div className="hero-text-content" key={activeBanners[currentSlide]?.id}>
                            <h1 className="hero-title">
                                {activeBanners[currentSlide]?.titleHighlight
                                    ? activeBanners[currentSlide]?.title.split(activeBanners[currentSlide]?.titleHighlight || '').map((part, i, arr) =>
                                        i < arr.length - 1 ? (
                                            <span key={i}>
                                                {part}
                                                <span className="highlight">{activeBanners[currentSlide]?.titleHighlight}</span>
                                            </span>
                                        ) : (
                                            <span key={i}>{part}</span>
                                        )
                                    )
                                    : activeBanners[currentSlide]?.title
                                }
                            </h1>

                            <p className="hero-subtitle">
                                {activeBanners[currentSlide]?.subtitle}
                            </p>

                            <button className="hero-cta">
                                <Sparkles size={20} />
                                {activeBanners[currentSlide]?.buttonText || 'Ver Ofertas'}
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="hero-image">
                    {activeBanners.length > 0 && products.length > 0 && products.some(p => p.featured) && (
                        (() => {
                            const featuredProduct = products.find(p => p.featured)!;
                            return (
                                <div className="hero-image-wrapper">
                                    <div className="hero-product-card">
                                        <div className="hero-product-image">
                                            <img
                                                src={featuredProduct.image}
                                                alt={featuredProduct.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }}
                                            />
                                        </div>
                                        <div className="hero-product-info">
                                            <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{featuredProduct.name}</h3>
                                            <div className="hero-product-prices">
                                                <span className="hero-product-price-usd">US$ {featuredProduct.priceUSD.toLocaleString('pt-BR')}</span>
                                                <span className="hero-product-price-brl">≈ R$ {featuredProduct.priceBRL.toLocaleString('pt-BR')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {featuredProduct.discount && (
                                        <div className="hero-floating-badge">-{featuredProduct.discount}% OFF</div>
                                    )}
                                </div>
                            );
                        })()
                    )}
                </div>
            </div>
        </section>
    );
}
