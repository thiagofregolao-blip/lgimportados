import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Banner {
    id: string;
    url: string;
    alt: string;
    title: string;
    titleHighlight?: string; // Word to highlight in gold
    subtitle: string;
    buttonText: string;
    active: boolean;
    order: number;
}

export interface Product {
    id: string;
    name: string;
    priceUSD: number;
    priceBRL: number;
    priceBrazil: number;
    image: string;
    category: string;
    store: string;
    description?: string;
    discount?: number;
    isNew?: boolean;
    featured?: boolean;
    active: boolean;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    image: string;
    subtitle: string;
    active: boolean;
}

// Default data
const defaultBanners: Banner[] = [
    {
        id: '1',
        url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&q=80',
        alt: 'Tecnologia e inovação',
        title: 'Melhores preços do Paraguai',
        titleHighlight: 'preços',
        subtitle: 'Produtos originais com garantia e os menores preços do mercado. Economize até 40% comparado aos preços do Brasil.',
        buttonText: 'Ver Ofertas',
        active: true,
        order: 1
    },
    {
        id: '2',
        url: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1920&q=80',
        alt: 'Smartphones e acessórios',
        title: 'Smartphones com desconto',
        titleHighlight: 'desconto',
        subtitle: 'iPhone, Samsung, Xiaomi e muito mais. Últimos lançamentos direto do Paraguai para você.',
        buttonText: 'Conferir Celulares',
        active: true,
        order: 2
    },
    {
        id: '3',
        url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1920&q=80',
        alt: 'Games e entretenimento',
        title: 'Games e Consoles',
        titleHighlight: 'Consoles',
        subtitle: 'PlayStation 5, Xbox Series X, Nintendo Switch e os melhores jogos com preços imbatíveis.',
        buttonText: 'Ver Games',
        active: true,
        order: 3
    },
    {
        id: '4',
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1920&q=80',
        alt: 'Notebooks e computadores',
        title: 'Notebooks Premium',
        titleHighlight: 'Premium',
        subtitle: 'MacBook, Dell, Lenovo e outras marcas líderes. Performance máxima pelo menor preço.',
        buttonText: 'Ver Notebooks',
        active: true,
        order: 4
    }
];

const defaultProducts: Product[] = [];

const defaultCategories: Category[] = [
    {
        id: 'smartphones',
        name: 'Smartphones',
        icon: '📱',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
        subtitle: 'iPhone, Samsung, Xiaomi',
        active: true
    },
    {
        id: 'notebooks',
        name: 'Notebooks',
        icon: '💻',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
        subtitle: 'Apple, Dell',
        active: true
    },
    {
        id: 'games',
        name: 'Games',
        icon: '🎮',
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300&h=300&fit=crop',
        subtitle: 'PS5, Xbox, Nintendo',
        active: true
    },
    {
        id: 'smartwatch',
        name: 'Wearables',
        icon: '⌚',
        image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300&h=300&fit=crop',
        subtitle: 'Smartwatches, Fones',
        active: true
    },
    {
        id: 'cameras',
        name: 'Câmeras',
        icon: '📷',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=300&fit=crop',
        subtitle: 'Canon, Nikon, Sony',
        active: true
    },
    {
        id: 'audio',
        name: 'Áudio',
        icon: '🎧',
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop',
        subtitle: 'Fones de ouvido',
        active: true
    },
    {
        id: 'perfumes',
        name: 'Perfumes',
        icon: '🧴',
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=300&fit=crop',
        subtitle: 'Importados',
        active: true
    },
    {
        id: 'cosmeticos',
        name: 'Cosméticos',
        icon: '💄',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop',
        subtitle: 'Maquiagem, Skincare',
        active: true
    },
];


// Top Bar Types
export interface TopBarItem {
    id: string;
    title: string;
    details: string[]; // Array of detail lines shown on hover
    icon: string; // Lucide icon name
    active: boolean;
    order: number;
}

export interface TopBarSettings {
    active: boolean;
    backgroundColor: string;
    textColor: string;
    dollarRate: number; // Cotação do dólar
    items: TopBarItem[];
}

const defaultTopBarSettings: TopBarSettings = {
    active: true,
    backgroundColor: '#000000',
    textColor: '#ffffff',
    dollarRate: 5.80,
    items: [
        {
            id: '1',
            title: 'HORÁRIO DE ATENDIMENTO',
            details: [
                'Segunda a quinta: 08:00H - 22:00H',
                'Sexta e sábado: 08:00H - 22:00H',
                'Domingo: 08:00H - 19:00H'
            ],
            icon: 'Clock',
            active: true,
            order: 1
        },
        {
            id: '2',
            title: 'NÃO FAZEMOS ENVIOS',
            details: [
                'Não realizamos entregas no Brasil.',
                'Para mais informações, entre em contato.'
            ],
            icon: 'PackageX',
            active: true,
            order: 2
        },
        {
            id: '3',
            title: 'ONDE ESTAMOS',
            details: [
                'Avenida Paraguay N° 7800, Centro,',
                'Salto del Guairá, Paraguay.'
            ],
            icon: 'MapPin',
            active: true,
            order: 3
        },
        {
            id: '4',
            title: 'TIRE SUAS DÚVIDAS',
            details: [
                'Obtenha respostas e informações úteis',
                'para esclarecer dúvidas.'
            ],
            icon: 'MessageCircle',
            active: true,
            order: 4
        },
    ]
};

// ... existing default arrays ...

// Store interface
interface StoreState {
    banners: Banner[];
    products: Product[];
    categories: Category[];
    topBar: TopBarSettings;

    // Banner actions
    addBanner: (banner: Omit<Banner, 'id'>) => void;
    updateBanner: (id: string, banner: Partial<Banner>) => void;
    deleteBanner: (id: string) => void;
    reorderBanners: (banners: Banner[]) => void;

    // Product actions
    setProducts: (products: Product[]) => void;
    fetchProducts: () => Promise<void>;
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (id: string, product: Partial<Product>) => void;
    deleteProduct: (id: string) => void;

    // Category actions
    addCategory: (category: Omit<Category, 'id'>) => void;
    updateCategory: (id: string, category: Partial<Category>) => void;
    deleteCategory: (id: string) => void;

    // Top Bar actions
    // Top Bar actions
    updateTopBarSettings: (settings: Partial<TopBarSettings>) => void;
    updateTopBarItem: (id: string, item: Partial<TopBarItem>) => void;
    updateDollarRate: (rate: number) => void;
    resetTopBar: () => void;

    // Cart actions
    cart: CartItem[];
    addToCart: (product: Product, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    updateCartQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: () => number;
}

export interface CartItem extends Product {
    quantity: number;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Create store with persistence
export const useStore = create<StoreState>()(
    persist(
        (set) => ({
            banners: defaultBanners,
            products: defaultProducts,
            categories: defaultCategories,
            topBar: defaultTopBarSettings,

            // Banner actions
            addBanner: (banner) => set((state) => ({
                banners: [...state.banners, { ...banner, id: generateId() }]
            })),

            updateBanner: (id, banner) => set((state) => ({
                banners: state.banners.map((b) => b.id === id ? { ...b, ...banner } : b)
            })),

            deleteBanner: (id) => set((state) => ({
                banners: state.banners.filter((b) => b.id !== id)
            })),

            reorderBanners: (banners) => set({ banners }),

            // Product actions (synced with API)
            setProducts: (products) => set({ products }),

            fetchProducts: async () => {
                try {
                    const response = await fetch('/api/products');
                    const data = await response.json();
                    if (data.success && Array.isArray(data.products)) {
                        set({ products: data.products });
                    }
                } catch (error) {
                    console.error('❌ Error fetching products:', error);
                }
            },

            addProduct: (product) => {
                const newId = generateId();

                // Save to local state first
                set((state) => ({
                    products: [...state.products, { ...product, id: newId }]
                }));

                // Sync with backend API (fire and forget, log errors)
                fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: product.name,
                        priceUSD: product.priceUSD,
                        priceBRL: product.priceBRL,
                        priceBrazil: product.priceBrazil,
                        image: product.image,
                        category: product.category,
                        store: product.store || 'LG Importados',
                        discount: product.discount,
                        isNew: product.isNew,
                        featured: product.featured,
                    })
                }).then(res => res.json())
                    .then(data => console.log('✅ Product synced to database:', data))
                    .catch(err => console.error('❌ Failed to sync product:', err));
            },

            updateProduct: (id, product) => set((state) => ({
                products: state.products.map((p) => p.id === id ? { ...p, ...product } : p)
            })),

            deleteProduct: (id) => set((state) => ({
                products: state.products.filter((p) => p.id !== id)
            })),

            // Category actions
            addCategory: (category) => set((state) => ({
                categories: [...state.categories, { ...category, id: generateId() }]
            })),

            updateCategory: (id, category) => set((state) => ({
                categories: state.categories.map((c) => c.id === id ? { ...c, ...category } : c)
            })),

            deleteCategory: (id) => set((state) => ({
                categories: state.categories.filter((c) => c.id !== id)
            })),

            // Top Bar actions
            updateTopBarSettings: (settings) => set((state) => ({
                topBar: { ...state.topBar, ...settings }
            })),

            updateTopBarItem: (id, item) => set((state) => ({
                topBar: {
                    ...state.topBar,
                    items: state.topBar.items.map(i => i.id === id ? { ...i, ...item } : i)
                }
            })),

            updateDollarRate: (rate) => set((state) => ({
                topBar: { ...state.topBar, dollarRate: rate }
            })),

            resetTopBar: () => set({ topBar: defaultTopBarSettings }),

            // Cart implementation
            cart: [],
            addToCart: (product, quantity) => set((state) => {
                const existingItem = state.cart.find(item => item.id === product.id);
                if (existingItem) {
                    return {
                        cart: state.cart.map(item =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        )
                    };
                }
                return { cart: [...state.cart, { ...product, quantity }] };
            }),
            removeFromCart: (productId) => set((state) => ({
                cart: state.cart.filter(item => item.id !== productId)
            })),
            updateCartQuantity: (productId, quantity) => set((state) => ({
                cart: state.cart.map(item =>
                    item.id === productId ? { ...item, quantity } : item
                )
            })),
            clearCart: () => set({ cart: [] }),
            cartTotal: () => {
                // Access state strictly inside components or via get() if needed, 
                // but since this is inside the store definition, we can't easily access 'state' here for a getter function acting as a selector directly without middleware complications.
                // Instead, we usually compute derived state in components: useStore(s => s.cart.reduce(...))
                // Keeping this empty or basic if the interface requires it, but simpler to calculate in component.
                return 0;
            },
        }),
        {
            name: 'lg-importados-store',
            version: 2, // Incrementado para invalidar cache antigo
        }
    )
);
