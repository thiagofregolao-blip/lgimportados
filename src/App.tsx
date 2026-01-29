import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useStore } from './store/store';
import { TopBar } from './components/TopBar';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Categories } from './components/Categories';
import { ProductGrid } from './components/ProductGrid';
import { PriceCompare } from './components/PriceCompare';
import { Footer } from './components/Footer';
import { AdminPanel } from './pages/AdminPanel';
import { ProductPage } from './pages/ProductPage';
import { QuickProductPage } from './pages/QuickProductPage';
import { CheckoutPage } from './pages/Checkout';

// ... (rest of imports)

// Main App with Routes
function App() {
    const { fetchProducts } = useStore();

    useEffect(() => {
        // Buscar produtos da API ao iniciar a aplicação
        fetchProducts();
    }, [fetchProducts]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/admin/quick-product" element={<QuickProductPage />} />
                <Route path="/produto/:id" element={<ProductPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

