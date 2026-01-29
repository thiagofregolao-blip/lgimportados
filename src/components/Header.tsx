import { useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu } from 'lucide-react';
import { useStore } from '../store/store';

export function Header() {
    const navigate = useNavigate();
    const { cart } = useStore();
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <header className="header">
            <div className="container header-container">
                <a href="/" className="header-logo">
                    <img src="/logo.png" alt="LG Importados" className="header-logo-image" />
                </a>

                <div className="header-actions">
                    <button className="header-action-btn" aria-label="Menu">
                        <Menu size={22} />
                    </button>
                    <button
                        className="header-action-btn"
                        aria-label="Carrinho"
                        onClick={() => navigate('/checkout')}
                    >
                        <ShoppingCart size={22} />
                        {cartCount > 0 && <span className="badge">{cartCount}</span>}
                    </button>
                    <button className="header-action-btn" aria-label="Perfil">
                        <User size={22} />
                    </button>
                </div>
            </div>
        </header>
    );
}
