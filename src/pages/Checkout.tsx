import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/store";
import { TopBar } from "../components/TopBar";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Loader2, CreditCard, QrCode, Lock, CheckCircle, ArrowRight } from "lucide-react";

export function CheckoutPage() {
    const navigate = useNavigate();
    const { cart, clearCart } = useStore();
    const [step, setStep] = useState(1); // 1: Identificação, 2: Pagamento, 3: Sucesso
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("pix");

    // Dados do cliente
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: ""
    });

    // Cotação fixa para o exemplo (ideal seria vir do backend)
    const EXCHANGE_RATE = 6.15;

    // Redirecionar se carrinho vazio (apenas se não estiver no sucesso)
    useEffect(() => {
        if (cart.length === 0 && step !== 3) {
            navigate("/");
        }
    }, [cart, step, navigate]);

    const totalUSD = cart.reduce((acc, item) => acc + (item.priceUSD * item.quantity), 0);
    const totalBRL = totalUSD * EXCHANGE_RATE;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleNextStep = () => {
        if (step === 1) {
            if (!formData.name || !formData.phone) {
                alert("Por favor, preencha pelo menos Nome e Celular.");
                return;
            }
            setStep(2);
        } else if (step === 2) {
            handleFinishOrder();
        }
    };

    const handleFinishOrder = async () => {
        setLoading(true);

        // Simulação de processamento
        await new Promise(resolve => setTimeout(resolve, 2000));

        setLoading(false);
        setStep(3);
        clearCart();
    };

    const handleWhatsAppRedirect = () => {
        const itemsList = cart.map(i => `📦 ${i.quantity}x ${i.name}`).join('\n');
        const methodDict: { [key: string]: string } = { pix: 'Pix (Imediato)', card: 'Cartão de Crédito' };

        const message = encodeURIComponent(
            `*Olá, acabei de fazer um pedido no site!* 🎉\n\n` +
            `*Número do Pedido:* #${Math.floor(Math.random() * 9999)}\n` +
            `*Cliente:* ${formData.name}\n` +
            `*Pagamento:* ${methodDict[paymentMethod]}\n\n` +
            `*Resumo do Pedido:*\n${itemsList}\n\n` +
            `*Total:* US$ ${totalUSD.toLocaleString('en-US')} (R$ ${totalBRL.toLocaleString('pt-BR')})\n\n` +
            `_Aguardo confirmação para pagamento._`
        );

        window.open(`https://wa.me/5545999999999?text=${message}`, '_blank');
    };

    if (step === 3) {
        return (
            <div className="app">
                <TopBar />
                <Header />
                <main className="main-content" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                    <div style={{ maxWidth: '480px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <div style={{ width: '80px', height: '80px', background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            <CheckCircle size={40} color="#16A34A" />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Pedido Realizado!</h1>
                        <p style={{ color: '#666', marginBottom: '2rem' }}>
                            Seu pedido foi registrado com sucesso. Para confirmar o pagamento e agilizar o envio, clique abaixo.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button
                                onClick={handleWhatsAppRedirect}
                                style={{
                                    background: '#16A34A', color: 'white', padding: '1rem', borderRadius: '0.5rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem'
                                }}
                            >
                                Enviar Comprovante no WhatsApp
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                style={{
                                    background: 'transparent', color: '#666', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #ccc', cursor: 'pointer'
                                }}
                            >
                                Voltar para a Loja
                            </button>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="app">
            <TopBar />
            <Header />

            <main className="main-content">
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem', display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>

                    {/* Coluna Esquerda: Formulário e Pagamento */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Lock size={24} color="#16A34A" />
                            Finalizar Compra
                        </h1>

                        {/* Passo 1: Identificação */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #eee', opacity: step !== 1 ? 0.6 : 1, pointerEvents: step !== 1 ? 'none' : 'auto' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ background: '#333', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>1</span>
                                Identificação
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label htmlFor="name" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Nome Completo</label>
                                    <input
                                        id="name"
                                        placeholder="Ex: Thiago Silva"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.25rem' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label htmlFor="phone" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Celular / WhatsApp *</label>
                                    <input
                                        id="phone"
                                        placeholder="(11) 99999-9999"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.25rem' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label htmlFor="email" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="email@exemplo.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.25rem' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label htmlFor="cpf" style={{ fontSize: '0.9rem', fontWeight: '500' }}>CPF</label>
                                    <input
                                        id="cpf"
                                        placeholder="000.000.000-00"
                                        value={formData.cpf}
                                        onChange={handleInputChange}
                                        style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.25rem' }}
                                    />
                                </div>
                            </div>
                            {step === 1 && (
                                <button
                                    onClick={handleNextStep}
                                    style={{ marginTop: '1rem', width: '100%', background: '#333', color: 'white', padding: '0.75rem', borderRadius: '0.25rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    Continuar para Pagamento <ArrowRight size={16} />
                                </button>
                            )}
                        </div>

                        {/* Passo 2: Pagamento */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #eee', opacity: step !== 2 ? 0.6 : 1, pointerEvents: step !== 2 ? 'none' : 'auto' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ background: '#333', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>2</span>
                                Pagamento
                            </h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div
                                    onClick={() => setPaymentMethod('pix')}
                                    style={{
                                        border: `2px solid ${paymentMethod === 'pix' ? '#16A34A' : '#eee'}`,
                                        borderRadius: '0.5rem',
                                        padding: '1rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        background: paymentMethod === 'pix' ? '#DCFCE7' : 'white'
                                    }}
                                >
                                    <QrCode size={24} />
                                    <span style={{ fontWeight: 'bold' }}>Pix</span>
                                    <span style={{ fontSize: '0.75rem', color: '#16A34A' }}>-5% de Desconto</span>
                                </div>

                                <div
                                    onClick={() => setPaymentMethod('card')}
                                    style={{
                                        border: `2px solid ${paymentMethod === 'card' ? '#16A34A' : '#eee'}`,
                                        borderRadius: '0.5rem',
                                        padding: '1rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        background: paymentMethod === 'card' ? '#DCFCE7' : 'white'
                                    }}
                                >
                                    <CreditCard size={24} />
                                    <span style={{ fontWeight: 'bold' }}>Cartão</span>
                                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Até 12x</span>
                                </div>
                            </div>

                            {step === 2 && paymentMethod === 'card' && (
                                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#FEF9C3', color: '#854D0E', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                                    ⚠️ Pagamentos via cartão serão processados via link seguro enviado no WhatsApp.
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Coluna Direita: Resumo */}
                    <div>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #ddd', position: 'sticky', top: '100px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Resumo do Pedido</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                                {cart.map((item) => (
                                    <div key={item.id} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem' }}>
                                        <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: '500', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</p>
                                            <p style={{ margin: 0, color: '#666', fontSize: '0.8rem' }}>{item.quantity}x US$ {item.priceUSD}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '1rem 0' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                                <span>Subtotal (USD)</span>
                                <span>US$ {totalUSD.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                                <span>Cotação</span>
                                <span>R$ {EXCHANGE_RATE.toFixed(2)}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold', color: '#16A34A' }}>
                                <span>Total (BRL)</span>
                                <span>R$ {totalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>

                            {step === 2 && (
                                <button
                                    onClick={handleFinishOrder}
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        background: '#E60014',
                                        color: 'white',
                                        padding: '1rem',
                                        borderRadius: '0.5rem',
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem',
                                        border: 'none',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                >
                                    {loading ? <Loader2 className="animate-spin mx-auto" /> : `Pagar R$ ${totalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
                                </button>
                            )}

                            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#999', marginTop: '1rem' }}>
                                Pagamento seguro via Pix ou Cartão.
                            </p>
                        </div>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
}

// Export default para manter compatibilidade com lazy loading se houver, ou imports diretos
export default CheckoutPage;
