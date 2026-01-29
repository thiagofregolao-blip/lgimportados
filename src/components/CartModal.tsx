import { ShoppingCart, X, Check, ArrowRight } from 'lucide-react';
import { Product } from '../store/store';

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGoToCheckout: () => void;
    product: Product;
    quantity: number;
}

export function CartModal({ isOpen, onClose, onGoToCheckout, product, quantity }: CartModalProps) {
    if (!isOpen) return null;

    const total = product.priceUSD * quantity;

    return (
        <div className="cart-modal-overlay" onClick={onClose}>
            <div className="cart-modal-content" onClick={e => e.stopPropagation()}>
                <div className="cart-modal-header">
                    <div className="cart-modal-success">
                        <div className="cart-modal-icon-wrapper">
                            <Check size={20} />
                        </div>
                        <h3>Produto adicionado ao carrinho!</h3>
                    </div>
                    <button className="cart-modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="cart-modal-body">
                    <div className="cart-modal-item">
                        <img src={product.image} alt={product.name} className="cart-modal-image" />
                        <div className="cart-modal-item-info">
                            <h4 className="cart-modal-item-title">{product.name}</h4>
                            <p className="cart-modal-item-quantity">Quantidade: {quantity}</p>
                            <p className="cart-modal-item-price">US$ {total.toLocaleString('pt-BR')}</p>
                        </div>
                    </div>
                </div>

                <div className="cart-modal-footer">
                    <button className="cart-modal-btn secondary" onClick={onClose}>
                        Continuar Comprando
                    </button>
                    <button className="cart-modal-btn primary" onClick={onGoToCheckout}>
                        <ShoppingCart size={18} />
                        Ir para Pagamento
                    </button>
                </div>
            </div>
        </div>
    );
}
