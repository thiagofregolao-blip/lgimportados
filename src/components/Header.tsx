import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, Trash2, Plus, Minus, X } from 'lucide-react';
import { useStore } from '../store/store';

export function Header() {
    const navigate = useNavigate();
    const { cart, removeFromCart, updateCartQuantity } = useStore();
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Calcular total
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotalUSD = cart.reduce((acc, item) => acc + (item.priceUSD * item.quantity), 0);
    const EXCHANGE_RATE = 6.15; // Poderia vir do store

    const handleQuantityChange = (id: string, currentQuantity: number, delta: number) => {
        const newQuantity = currentQuantity + delta;
        if (newQuantity < 1) return;
        updateCartQuantity(id, newQuantity);
    };

    return (
        <header className="header">
            <div className="container header-container">
                <a href="/" className="header-logo">
                    <img src="/logo.png" alt="LG Importados" className="header-logo-image" />
                </a>

                <div className="header-actions" style={{ position: 'relative' }}>
                    <button className="header-action-btn" aria-label="Menu">
                        <Menu size={22} />
                    </button>

                    <div style={{ position: 'relative' }}>
                        <button
                            className="header-action-btn"
                            aria-label="Carrinho"
                            onClick={() => setIsCartOpen(!isCartOpen)}
                            style={{ background: isCartOpen ? '#f5f5f5' : 'transparent' }}
                        >
                            <ShoppingCart size={22} />
                            {cartCount > 0 && <span className="badge">{cartCount}</span>}
                        </button>

                        {/* Dropdown do Carrinho */}
                        {isCartOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '120%',
                                right: 0,
                                width: '380px',
                                background: 'white',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                zIndex: 1000,
                                border: '1px solid #eee'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Seu Carrinho ({cartCount})</h3>
                                    <button onClick={() => setIsCartOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>
                                        <X size={20} color="#666" />
                                    </button>
                                </div>

                                {cart.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem 0', color: '#888' }}>
                                        <ShoppingCart size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                                        <p>Seu carrinho está vazio.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {cart.map((item) => (
                                                <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                    <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} />

                                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                                                        <div style={{ fontSize: '0.85rem', color: '#666', fontWeight: '500' }}>
                                                            US$ {item.priceUSD.toFixed(2)}
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: '#EF4444' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>

                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f5f5', borderRadius: '4px', padding: '2px 6px' }}>
                                                            <button
                                                                onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                                                                disabled={item.quantity <= 1}
                                                                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', display: 'flex', opacity: item.quantity <= 1 ? 0.3 : 1 }}
                                                            >
                                                                <Minus size={12} />
                                                            </button>
                                                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{item.quantity}</span>
                                                            <button
                                                                onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                                                                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', display: 'flex' }}
                                                            >
                                                                <Plus size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                                <span>Total (USD):</span>
                                                <span>US$ {cartTotalUSD.toFixed(2)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
                                                <span>Estimado (BRL):</span>
                                                <span>R$ {(cartTotalUSD * EXCHANGE_RATE).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setIsCartOpen(false);
                                                    navigate('/checkout');
                                                }}
                                                style={{
                                                    width: '100%',
                                                    background: '#16A34A',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.2s'
                                                }}
                                            >
                                                Finalizar Compra
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <button className="header-action-btn" aria-label="Perfil">
                        <User size={22} />
                    </button>
                </div>
            </div>
        </header>
    );
}
