import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Search, ChevronLeft, ChevronRight, Bot, X, Send, ShoppingCart, Loader2 } from 'lucide-react';
import { useStore } from '../store/store';
import { useAISearch } from '../hooks/useAISearch';

export function Hero() {
    const { banners, products } = useStore();
    const activeBanners = banners.filter(b => b.active);

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        query,
        setQuery,
        isTyping,
        streaming,
        messages,
        products: aiProducts,
        suggestions,
        submit,
        fetchSuggestions,
    } = useAISearch();

    // Auto-rotate carousel every 5 seconds
    useEffect(() => {
        if (activeBanners.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [activeBanners.length]);

    // Scroll para última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streaming]);

    // Buscar sugestões com debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                fetchSuggestions(query);
                setShowSuggestions(true);
            } else {
                setShowSuggestions(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query, fetchSuggestions]);

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
        if (query.trim()) {
            setIsModalOpen(true);
            setShowSuggestions(false);
            submit();
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        setShowSuggestions(false);
        setIsModalOpen(true);
        submit(suggestion);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
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
                        {/* Search Bar com IA */}
                        <div className="hero-search-container">
                            <form className="hero-search" onSubmit={handleSearch}>
                                <Search className="hero-search-icon" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar produtos, marcas e mais..."
                                    aria-label="Buscar produtos"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <button type="submit" className="hero-search-btn">
                                    Buscar
                                </button>
                            </form>

                            {/* Sugestões Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="hero-suggestions">
                                    {suggestions.map((suggestion, i) => (
                                        <button
                                            key={i}
                                            className="hero-suggestion-item"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            <Search size={14} />
                                            <span>{suggestion}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

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

            {/* Modal de Resultados IA */}
            {isModalOpen && (
                <div className="ai-modal-overlay" onClick={handleCloseModal}>
                    <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
                        {/* Header do Modal */}
                        <div className="ai-modal-header">
                            <div className="ai-modal-title">
                                <Bot size={24} />
                                <span>Assistente IA - LG Importados</span>
                            </div>
                            <button onClick={handleCloseModal} className="ai-modal-close">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Chat */}
                        <div className="ai-chat-container">
                            {messages.length === 0 && !isTyping && (
                                <div className="ai-chat-empty">
                                    <Sparkles size={48} />
                                    <p>Olá! Como posso ajudar você a encontrar os melhores produtos do Paraguai?</p>
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <div key={i} className={`ai-chat-message ai-chat-${msg.type}`}>
                                    <div className="ai-chat-bubble">
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            {isTyping && streaming && (
                                <div className="ai-chat-message ai-chat-assistant">
                                    <div className="ai-chat-bubble ai-chat-typing">
                                        {streaming}
                                    </div>
                                </div>
                            )}

                            {isTyping && !streaming && (
                                <div className="ai-chat-message ai-chat-assistant">
                                    <div className="ai-chat-bubble ai-chat-loading">
                                        <Loader2 className="ai-spinner" size={20} />
                                        <span>Pensando...</span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Grid de Produtos */}
                        {aiProducts.length > 0 && (
                            <div className="ai-products-container">
                                <h3 className="ai-products-title">
                                    <ShoppingCart size={18} />
                                    Produtos Encontrados ({aiProducts.length})
                                </h3>
                                <div className="ai-products-grid">
                                    {aiProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="ai-product-card"
                                        >
                                            <img
                                                src={product.image || 'https://via.placeholder.com/150'}
                                                alt={product.name}
                                                className="ai-product-image"
                                            />
                                            <div className="ai-product-info">
                                                <h4 className="ai-product-name">{product.name}</h4>
                                                <div className="ai-product-prices">
                                                    <span className="ai-product-price-usd">
                                                        US$ {product.priceUSD.toFixed(0)}
                                                    </span>
                                                    <span className="ai-product-price-brl">
                                                        ≈ R$ {product.priceBRL.toFixed(0)}
                                                    </span>
                                                </div>
                                                {(product.discount || 0) > 0 && (
                                                    <span className="discount-badge">
                                                        -{product.discount}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input de Nova Mensagem */}
                        <form onSubmit={handleSearch} className="ai-modal-input-form">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Faça outra pergunta..."
                                className="ai-modal-input"
                            />
                            <button type="submit" disabled={!query.trim() || isTyping} className="ai-modal-send">
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
