import { Award, Shield, Truck } from 'lucide-react';

export function PriceCompare() {
    return (
        <section className="price-compare">
            <div className="container price-compare-container">
                <div className="price-compare-content">
                    <h2 className="price-compare-title">
                        LG Importados - A Original do Paraguai
                    </h2>

                    <div className="price-compare-stats">
                        <div className="price-stat">
                            <div className="price-stat-value">
                                <Award size={32} style={{ display: 'inline', marginRight: 8 }} />
                                30+
                            </div>
                            <div className="price-stat-label">Anos de Tradição</div>
                        </div>
                        <div className="price-stat">
                            <div className="price-stat-value">
                                <Shield size={32} style={{ display: 'inline', marginRight: 8 }} />
                                100%
                            </div>
                            <div className="price-stat-label">Produtos Originais</div>
                        </div>
                        <div className="price-stat">
                            <div className="price-stat-value">
                                <Truck size={32} style={{ display: 'inline', marginRight: 8 }} />
                                VIP
                            </div>
                            <div className="price-stat-label">Atendimento Especializado</div>
                        </div>
                    </div>

                    {/* Brand Logos */}
                    <div className="brand-logos">
                        <p className="brand-logos-title">Trabalhamos com as melhores marcas</p>
                        <div className="brand-logos-grid">
                            {/* Apple Logo */}
                            <svg className="brand-logo" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>

                            {/* Samsung Logo */}
                            <svg className="brand-logo samsung" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M5.4 12.5c0-.3-.2-.5-.5-.5s-.5.2-.5.5.2.5.5.5.5-.2.5-.5m14.7-1.2c-.4 0-.8.2-1 .5-.2-.3-.6-.5-1-.5-.3 0-.6.1-.8.3v-.2h-.8v3.2h.8v-1.8c0-.4.3-.7.6-.7s.6.3.6.7v1.8h.8v-1.8c0-.4.3-.7.6-.7s.6.3.6.7v1.8h.8v-1.9c0-.8-.5-1.4-1.2-1.4m-7.5 0c-.9 0-1.6.7-1.6 1.6s.7 1.6 1.6 1.6c.5 0 .9-.2 1.2-.5l-.5-.5c-.2.2-.4.3-.7.3-.5 0-.9-.4-.9-.9s.4-.9.9-.9c.3 0 .5.1.7.3l.5-.5c-.3-.3-.7-.5-1.2-.5m-4.3 0c-.7 0-1.2.4-1.2 1v.1c0 .5.4.8.9.9l.4.1c.3.1.4.2.4.3 0 .2-.2.3-.5.3s-.6-.1-.8-.3l-.5.5c.3.3.8.5 1.3.5.7 0 1.3-.4 1.3-1v-.1c0-.5-.4-.8-.9-.9l-.4-.1c-.3-.1-.4-.2-.4-.3 0-.2.2-.3.5-.3s.5.1.7.2l.4-.5c-.3-.2-.7-.4-1.2-.4m-3.9.1v.7h1.1v2.5h.8v-2.5h1.1v-.7H4.4zm10.5 1.5c0-.5.4-.9.9-.9.3 0 .5.1.7.3l.5-.5c-.3-.3-.7-.5-1.2-.5-.9 0-1.6.7-1.6 1.6s.7 1.6 1.6 1.6c.5 0 .9-.2 1.2-.5l-.5-.5c-.2.2-.4.3-.7.3-.5 0-.9-.4-.9-.9" />
                            </svg>

                            {/* Xiaomi Logo */}
                            <svg className="brand-logo" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                <text x="6" y="16" fontSize="10" fontWeight="bold" fill="currentColor">Mi</text>
                            </svg>

                            {/* Sony Logo */}
                            <svg className="brand-logo" viewBox="0 0 100 30" fill="currentColor">
                                <text x="5" y="22" fontSize="20" fontWeight="bold" fontFamily="Arial">SONY</text>
                            </svg>

                            {/* JBL Logo */}
                            <svg className="brand-logo" viewBox="0 0 60 30" fill="currentColor">
                                <text x="5" y="22" fontSize="18" fontWeight="bold" fontFamily="Arial">JBL</text>
                            </svg>

                            {/* Canon Logo */}
                            <svg className="brand-logo" viewBox="0 0 80 30" fill="currentColor">
                                <text x="5" y="22" fontSize="16" fontWeight="bold" fontFamily="Arial">Canon</text>
                            </svg>

                            {/* Nikon Logo */}
                            <svg className="brand-logo" viewBox="0 0 80 30" fill="currentColor">
                                <text x="5" y="22" fontSize="16" fontWeight="bold" fontFamily="Arial">Nikon</text>
                            </svg>

                            {/* GoPro Logo */}
                            <svg className="brand-logo" viewBox="0 0 80 30" fill="currentColor">
                                <text x="5" y="22" fontSize="16" fontWeight="bold" fontFamily="Arial">GoPro</text>
                            </svg>

                            {/* DJI Logo */}
                            <svg className="brand-logo" viewBox="0 0 60 30" fill="currentColor">
                                <text x="5" y="22" fontSize="18" fontWeight="bold" fontFamily="Arial">DJI</text>
                            </svg>

                            {/* LG Logo */}
                            <svg className="brand-logo" viewBox="0 0 60 30" fill="currentColor">
                                <text x="5" y="22" fontSize="18" fontWeight="bold" fontFamily="Arial">LG</text>
                            </svg>

                            {/* Bose Logo */}
                            <svg className="brand-logo" viewBox="0 0 80 30" fill="currentColor">
                                <text x="5" y="22" fontSize="18" fontWeight="bold" fontFamily="Arial">BOSE</text>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
