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
import './styles/admin.css';

// Home Page Component
function HomePage() {
    return (
        <div className="app">
            <TopBar />
            <Header />
            <main className="main-content">
                <Hero />
                <Categories />
                <ProductGrid title="🔥 Ofertas do Dia" limit={4} />
                <PriceCompare />
                <ProductGrid title="Todos os Produtos" showAll={true} />
            </main>
            <Footer />
        </div>
    );
}

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
            </Routes>
        </BrowserRouter>
    );
}

export default App;

