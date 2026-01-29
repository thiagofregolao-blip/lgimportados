import { useState, useRef } from 'react';
import { Camera, Upload, X, Save, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import '../styles/admin.css'; // Reutilizando estilos do admin se possível, ou criar novos

export function QuickProductPage() {
    const navigate = useNavigate();
    const { fetchProducts } = useStore(); // Para atualizar a lista após salvar

    // Estados
    const [step, setStep] = useState<'capture' | 'analyzing' | 'review'>('capture');
    const [image, setImage] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Dados do formulário
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        brand: '',
        description: '',
        priceUSD: '',
        priceBRL: '',
        discount: '',
    });

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // ========================
    // CÂMERA
    // ========================
    const startCamera = async () => {
        try {
            setIsCameraOpen(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Erro ao acessar câmera:", err);
            alert("Não foi possível acessar a câmera. Verifique as permissões.");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                const base64 = canvas.toDataURL('image/jpeg', 0.8);
                setImage(base64);
                stopCamera();
                analyzeImage(base64);
            }
        }
    };

    // ========================
    // UPLOAD
    // ========================
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setImage(base64);
                analyzeImage(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    // ========================
    // ANÁLISE IA (Backend)
    // ========================
    const analyzeImage = async (base64: string) => {
        setStep('analyzing');
        setLoading(true);

        try {
            const response = await fetch('/api/assistant/analyze-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64 })
            });

            const data = await response.json();

            if (data.success && data.analysis) {
                const { name, category, brand, description, suggestedPriceUSD } = data.analysis;

                // Cotação fixa para exemplo ou pegar do store se disponível
                const rate = 5.80;
                const priceUSDVal = suggestedPriceUSD?.min || 0;

                setFormData({
                    name: name || '',
                    category: category || '',
                    brand: brand || '',
                    description: description || '',
                    priceUSD: priceUSDVal.toString(),
                    priceBRL: (priceUSDVal * rate).toFixed(2),
                    discount: '0'
                });

                setStep('review');
            } else {
                alert('Não foi possível analisar a imagem. Tente novamente.');
                setStep('capture');
                setImage(null);
            }
        } catch (error) {
            console.error('Erro na análise:', error);
            alert('Erro ao conectar com o servidor.');
            setStep('capture');
            setImage(null);
        } finally {
            setLoading(false);
        }
    };

    // ========================
    // SALVAR PRODUTO
    // ========================
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                priceUSD: Number(formData.priceUSD),
                priceBRL: Number(formData.priceBRL), // Backend pode recalcular, mas enviamos
                priceBrazil: Number(formData.priceBRL) * 1.6, // Estimativa bruta
                image: image,
                category: formData.category,
                brand: formData.brand,
                description: formData.description,
                store: 'LG Importados',
                active: true,
                discount: Number(formData.discount),
                isNew: true
            };

            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                // Atualizar lista global se necessário
                fetchProducts();
                alert('Produto cadastrado com sucesso!');
                navigate('/admin');
            } else {
                alert('Erro ao salvar: ' + data.message);
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar produto.');
        } finally {
            setLoading(false);
        }
    };

    // Atualizar preço BRL quando USD muda
    const handlePriceChange = (usd: string) => {
        const val = parseFloat(usd);
        if (!isNaN(val)) {
            setFormData(prev => ({
                ...prev,
                priceUSD: usd,
                priceBRL: (val * 5.80).toFixed(2)
            }));
        } else {
            setFormData(prev => ({ ...prev, priceUSD: usd }));
        }
    };

    // ========================
    // RENDER
    // ========================
    return (
        <div className="admin-container">
            <header className="admin-header">
                <button onClick={() => navigate('/admin')} className="back-button">
                    <ArrowLeft size={20} /> Voltar
                </button>
                <h1>Cadastro Rápido com IA</h1>
            </header>

            <main className="quick-product-content" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>

                {/* ETAPA 1: CAPTURA */}
                {step === 'capture' && (
                    <div className="capture-area" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {isCameraOpen ? (
                            <div className="camera-preview" style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: 'auto' }} />
                                <canvas ref={canvasRef} style={{ display: 'none' }} />
                                <div className="camera-controls" style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '20px' }}>
                                    <button onClick={stopCamera} className="btn-secondary" style={{ background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '50%' }}>
                                        <X size={24} />
                                    </button>
                                    <button onClick={capturePhoto} className="btn-primary" style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid white', background: 'transparent' }}></button>
                                </div>
                            </div>
                        ) : (
                            <div className="action-buttons" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <button
                                    onClick={startCamera}
                                    className="capture-btn"
                                    style={{ height: '150px', borderRadius: '12px', border: '2px dashed #ccc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'white', cursor: 'pointer' }}
                                >
                                    <Camera size={40} color="#666" />
                                    <span>Usar Câmera</span>
                                </button>

                                <label
                                    className="capture-btn"
                                    style={{ height: '150px', borderRadius: '12px', border: '2px dashed #ccc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'white', cursor: 'pointer' }}
                                >
                                    <Upload size={40} color="#666" />
                                    <span>Upload Foto</span>
                                    <input type="file" accept="image/*" onChange={handleFileUpload} hidden />
                                </label>
                            </div>
                        )}

                        <div className="tips" style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
                            <p>💡 Dica: Fotografe o produto em um fundo claro e com boa iluminação.</p>
                        </div>
                    </div>
                )}

                {/* ETAPA 2: ANALISANDO */}
                {step === 'analyzing' && (
                    <div className="analyzing-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 30px' }}>
                            {image && <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', opacity: 0.5 }} />}
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Loader2 size={48} className="spin" color="#2563eb" />
                            </div>
                        </div>
                        <h2>Analisando imagem...</h2>
                        <p style={{ color: '#666' }}>A IA está identificando o produto e sugerindo preços.</p>
                    </div>
                )}

                {/* ETAPA 3: REVISÃO */}
                {step === 'review' && (
                    <div className="review-form">
                        <div className="image-preview" style={{ marginBottom: '20px', position: 'relative' }}>
                            <img src={image!} alt="Produto" style={{ width: '100%', height: '200px', objectFit: 'contain', background: '#f8f9fa', borderRadius: '12px' }} />
                            <button
                                onClick={() => { setStep('capture'); setImage(null); }}
                                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                <RefreshCw size={16} /> Nova Foto
                            </button>
                        </div>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="form-group">
                                <label>Nome do Produto</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="admin-input"
                                    required
                                />
                            </div>

                            <div className="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Preço (USD)</label>
                                    <div className="input-prefix">
                                        <span>$</span>
                                        <input
                                            type="number"
                                            value={formData.priceUSD}
                                            onChange={e => handlePriceChange(e.target.value)}
                                            className="admin-input"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Preço (BRL)</label>
                                    <div className="input-prefix">
                                        <span>R$</span>
                                        <input
                                            type="number"
                                            value={formData.priceBRL}
                                            readOnly
                                            className="admin-input"
                                            style={{ background: '#f0f0f0' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Categoria</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="admin-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Marca</label>
                                <input
                                    type="text"
                                    value={formData.brand}
                                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                    className="admin-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Descrição (IA)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="admin-input"
                                    rows={4}
                                />
                            </div>

                            <button
                                type="submit"
                                className="save-button"
                                disabled={loading}
                                style={{ background: '#2563eb', color: 'white', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '10px' }}
                            >
                                {loading ? <Loader2 className="spin" /> : <><Save size={20} /> Cadastrar Produto</>}
                            </button>
                        </form>
                    </div>
                )}
            </main>

            <style>{`
                .admin-input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    font-size: 14px;
                }
                .label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: 500;
                    color: #374151;
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .input-prefix {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .input-prefix span {
                    position: absolute;
                    left: 12px;
                    color: #666;
                    font-weight: bold;
                }
                .input-prefix input {
                    padding-left: 35px;
                }
            `}</style>
        </div>
    );
}
