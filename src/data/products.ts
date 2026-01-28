export interface Product {
    id: number;
    name: string;
    priceUSD: number;
    priceBRL: number;
    priceBrazil: number;
    image: string;
    category: string;
    store: string;
    discount?: number;
    isNew?: boolean;
}

export const products: Product[] = [
    {
        id: 1,
        name: 'iPhone 15 Pro Max 256GB',
        priceUSD: 1199,
        priceBRL: 6954,
        priceBrazil: 9499,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop',
        category: 'smartphones',
        store: 'LG Importados',
        discount: 27
    },
    {
        id: 2,
        name: 'MacBook Air M2 256GB',
        priceUSD: 899,
        priceBRL: 5214,
        priceBrazil: 7999,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
        category: 'notebooks',
        store: 'LG Importados',
        discount: 35
    },
    {
        id: 3,
        name: 'PlayStation 5 Standard Edition',
        priceUSD: 449,
        priceBRL: 2604,
        priceBrazil: 3999,
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop',
        category: 'games',
        store: 'LG Importados',
        discount: 35
    },
    {
        id: 4,
        name: 'Apple Watch Ultra 2',
        priceUSD: 799,
        priceBRL: 4634,
        priceBrazil: 6499,
        image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop',
        category: 'smartwatch',
        store: 'LG Importados',
        discount: 29
    },
    {
        id: 5,
        name: 'Sony WH-1000XM5 Headphones',
        priceUSD: 299,
        priceBRL: 1734,
        priceBrazil: 2399,
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop',
        category: 'audio',
        store: 'LG Importados',
        discount: 28
    },
    {
        id: 6,
        name: 'Canon EOS R6 Mark II',
        priceUSD: 2299,
        priceBRL: 13334,
        priceBrazil: 18999,
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop',
        category: 'cameras',
        store: 'LG Importados',
        discount: 30
    },
    {
        id: 7,
        name: 'Samsung Galaxy S24 Ultra 256GB',
        priceUSD: 1099,
        priceBRL: 6374,
        priceBrazil: 8799,
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop',
        category: 'smartphones',
        store: 'LG Importados',
        discount: 28,
        isNew: true
    },
    {
        id: 8,
        name: 'AirPods Pro 2ª Geração',
        priceUSD: 229,
        priceBRL: 1328,
        priceBrazil: 1999,
        image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop',
        category: 'audio',
        store: 'LG Importados',
        discount: 34
    }
];

export interface Category {
    id: string;
    name: string;
    icon: string;
}

export const categories: Category[] = [
    { id: 'smartphones', name: 'Smartphones', icon: '📱' },
    { id: 'notebooks', name: 'Notebooks', icon: '💻' },
    { id: 'games', name: 'Games', icon: '🎮' },
    { id: 'smartwatch', name: 'Smartwatches', icon: '⌚' },
    { id: 'cameras', name: 'Câmeras', icon: '📷' },
    { id: 'audio', name: 'Áudio', icon: '🎧' },
];
