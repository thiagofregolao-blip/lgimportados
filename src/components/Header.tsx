import { ShoppingCart, User, Menu } from 'lucide-react';
import { AISearchBar } from './AISearchBar';

export function Header() {
    return (
        <header className="header">
            <div className="container header-container">
                <a href="/" className="header-logo">
                    <img src="/logo.png" alt="LG Importados" className="header-logo-image" />
                </a>

                {/* Barra de Busca IA */}
                <div className="header-search">
                    <AISearchBar />
                </div>

                <div className="header-actions">
                    <button className="header-action-btn" aria-label="Menu">
                        <Menu size={22} />
                    </button>
                    <button className="header-action-btn" aria-label="Carrinho">
                        <ShoppingCart size={22} />
                        <span className="badge">3</span>
                    </button>
                    <button className="header-action-btn" aria-label="Perfil">
                        <User size={22} />
                    </button>
                </div>
            </div>
        </header>
    );
}
