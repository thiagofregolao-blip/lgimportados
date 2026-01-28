import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TopBar } from './components/TopBar';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Categories } from './components/Categories';
import { ProductGrid } from './components/ProductGrid';
import { PriceCompare } from './components/PriceCompare';
import { Footer } from './components/Footer';
import { AdminPanel } from './pages/AdminPanel';
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
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/admin" element={<AdminPanel />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
