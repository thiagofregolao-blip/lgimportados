import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, X, Send, ShoppingCart, Loader2, Bot } from 'lucide-react';
import { useAISearch } from '../hooks/useAISearch';

interface AISearchBarProps {
    onProductClick?: (productId: number) => void;
}

export function AISearchBar({ onProductClick }: AISearchBarProps) {
    const {
        query,
        setQuery,
        isTyping,
        streaming,
        messages,
        products,
        suggestions,
        submit,
        clearMessages,
        fetchSuggestions,
    } = useAISearch();

    const [isOpen, setIsOpen] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setIsOpen(true);
            setShowSuggestions(false);
            submit();
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        setShowSuggestions(false);
        setIsOpen(true);
        submit(suggestion);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* Barra de Busca */}
            <div className="ai-search-container">
                <div className="ai-search-badge">
                    <Sparkles size={12} />
                    <span>IA</span>
                </div>

                <form onSubmit={handleSubmit} className="ai-search-form">
                    <div className="ai-search-input-wrapper">
                        <Bot className="ai-search-icon" size={20} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="🤖 Pergunte sobre produtos... Ex: 'iPhone mais barato'"
                            className="ai-search-input"
                        />
                        <button
                            type="submit"
                            disabled={!query.trim()}
                            className="ai-search-button"
                        >
                            <Search size={18} />
                        </button>
                    </div>
                </form>

                {/* Sugestões (Autocomplete) */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="ai-suggestions-dropdown">
                        {suggestions.map((suggestion, i) => (
                            <button
                                key={i}
                                className="ai-suggestion-item"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                <Search size={14} />
                                <span>{suggestion}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Resultados */}
            {isOpen && (
                <div className="ai-modal-overlay" onClick={handleClose}>
                    <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
                        {/* Header do Modal */}
                        <div className="ai-modal-header">
                            <div className="ai-modal-title">
                                <Bot size={24} />
                                <span>Assistente IA - LG Importados</span>
                            </div>
                            <button onClick={handleClose} className="ai-modal-close">
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
                        {products.length > 0 && (
                            <div className="ai-products-container">
                                <h3 className="ai-products-title">
                                    <ShoppingCart size={18} />
                                    Produtos Encontrados ({products.length})
                                </h3>
                                <div className="ai-products-grid">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="ai-product-card"
                                            onClick={() => onProductClick?.(product.id)}
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
                                                {product.discount && (
                                                    <span className="ai-product-discount">
                                                        -{product.discount}% vs Brasil
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input de Nova Mensagem */}
                        <form onSubmit={handleSubmit} className="ai-modal-input-form">
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
