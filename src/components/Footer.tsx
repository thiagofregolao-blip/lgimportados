import { Instagram, MessageCircle, Mail } from 'lucide-react';

export function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <div className="footer-logo-icon">LG</div>
                            <span>LG Importados</span>
                        </div>
                        <p className="footer-description">
                            Os melhores produtos importados do Paraguai com preços imbatíveis.
                            Garantia de originalidade e entrega para todo o Brasil.
                        </p>
                        <div className="footer-social" style={{ marginTop: '1rem' }}>
                            <a href="https://wa.me/595000000000" className="footer-social-btn" aria-label="WhatsApp">
                                <MessageCircle size={20} />
                            </a>
                            <a href="https://instagram.com/lgimportados" className="footer-social-btn" aria-label="Instagram">
                                <Instagram size={20} />
                            </a>
                            <a href="mailto:contato@lgimportados.com" className="footer-social-btn" aria-label="Email">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h4>Categorias</h4>
                        <nav className="footer-links">
                            <a href="/categoria/smartphones" className="footer-link">Smartphones</a>
                            <a href="/categoria/notebooks" className="footer-link">Notebooks</a>
                            <a href="/categoria/games" className="footer-link">Games</a>
                            <a href="/categoria/audio" className="footer-link">Áudio</a>
                        </nav>
                    </div>

                    <div className="footer-section">
                        <h4>Atendimento</h4>
                        <nav className="footer-links">
                            <a href="/sobre" className="footer-link">Sobre nós</a>
                            <a href="/faq" className="footer-link">Perguntas frequentes</a>
                            <a href="/contato" className="footer-link">Contato</a>
                            <a href="/politica" className="footer-link">Termos e condições</a>
                        </nav>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © 2024 LG Importados. Todos os direitos reservados.
                    </p>
                    <div className="footer-payments">
                        <div className="footer-payment">VISA</div>
                        <div className="footer-payment">MC</div>
                        <div className="footer-payment">PIX</div>
                        <div className="footer-payment">USD</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
