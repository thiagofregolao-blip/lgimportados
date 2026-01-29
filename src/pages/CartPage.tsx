import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { TopBar } from '../components/TopBar';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export function CartPage() {
    const navigate = useNavigate();
    const { cart, removeFromCart, updateCartQuantity, cartTotal } = useStore();

    // Cotação fixa (pode vir do store topBar.dollarRate se quiser)
    const EXCHANGE_RATE = 6.15;

    const totalUSD = cart.reduce((acc, item) => acc + (item.priceUSD * item.quantity), 0);
    const totalBRL = totalUSD * EXCHANGE_RATE;

    const handleQuantityChange = (id: string, currentQuantity: number, delta: number) => {
        const newQuantity = currentQuantity + delta;
        if (newQuantity < 1) return;
        updateCartQuantity(id, newQuantity);
    };

    return (
        <div className="app">
            <TopBar />
            <Header />

            <main className="main-content" style={{ padding: '2rem 1rem', minHeight: '60vh' }}>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <ShoppingBag size={32} />
                        Seu Carrinho
                    </h1>

                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#666' }}>
                            <ShoppingBag size={64} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Seu carrinho está vazio</h2>
                            <p style={{ marginBottom: '2rem' }}>Que tal dar uma olhada nas nossas ofertas?</p>
                            <button
                                onClick={() => navigate('/')}
                                style={{ background: '#333', color: 'white', padding: '1rem 2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Ver Produtos
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>
                            {/* Lista de Produtos */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {cart.map((item) => (
                                    <div key={item.id} style={{ display: 'flex', gap: '1rem', background: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                        <div style={{ width: '100px', height: '100px', flexShrink: 0 }}>
                                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.25rem' }} />
                                        </div>

                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>{item.name}</h3>
                                                <p style={{ color: '#666', fontSize: '0.9rem' }}>US$ {item.priceUSD.toFixed(2)}</p>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f5f5f5', borderRadius: '0.25rem', padding: '0.25rem' }}>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                                                        disabled={item.quantity <= 1}
                                                        style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'white', cursor: 'pointer', borderRadius: '4px', opacity: item.quantity <= 1 ? 0.5 : 1 }}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                                                        style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'white', cursor: 'pointer', borderRadius: '4px' }}
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                                                    aria-label="Remover item"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Resumo do Pedido */}
                            <div>
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', position: 'sticky', top: '100px' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Resumo</h3>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#666' }}>
                                        <span>Subtotal (USD)</span>
                                        <span>US$ {totalUSD.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#666' }}>
                                        <span>Cotação Estimada</span>
                                        <span>R$ {EXCHANGE_RATE.toFixed(2)}</span>
                                    </div>

                                    <div style={{ height: '1px', background: '#eee', margin: '1rem 0' }} />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Total Estimado</span>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16A34A' }}>R$ {totalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#666' }}>US$ {totalUSD.toFixed(2)}</div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate('/checkout')}
                                        style={{
                                            width: '100%',
                                            background: '#16A34A',
                                            color: 'white',
                                            padding: '1rem',
                                            borderRadius: '0.5rem',
                                            border: 'none',
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        Finalizar Compra <ArrowRight size={20} />
                                    </button>

                                    <button
                                        onClick={() => navigate('/')}
                                        style={{
                                            width: '100%',
                                            background: 'transparent',
                                            color: '#666',
                                            padding: '0.75rem',
                                            marginTop: '1rem',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        Continuar Comprando
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default CartPage;
