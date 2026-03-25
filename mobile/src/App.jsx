import React, { lazy, Suspense, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { initializeFirebase } from './services/firebase';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from './context/CartContext';
import {
    Home as HomeIcon,
    Search as SearchIcon,
    ShoppingBag,
    Clock,
    User,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

// ── Lazy-load pages ──────────────────────────────
const Home = lazy(() => import('./pages/Home'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const Registration = lazy(() => import('./pages/Registration'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const Search = lazy(() => import('./pages/Search'));
const Profile = lazy(() => import('./pages/Profile'));
const OrderStatus = lazy(() => import('./pages/OrderStatus'));
const TestFCM = lazy(() => import('./pages/TestFCM'));
const RestaurantDetail = lazy(() => import('./pages/RestaurantDetail'));

// ── Minimal spinner ────────────────────────
const PageLoader = () => (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-zinc-50 dark:bg-[#0A0A0A]">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
            <Loader2 className="w-8 h-8 text-zinc-900 dark:text-white" />
        </motion.div>
    </div>
);

function Navigation() {
    const location = useLocation();
    const { cartItems } = useCart();
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const hideOnRoutes = ['/checkout', '/login', '/register', '/order/'];
    const isProductDetail = location.pathname.startsWith('/product/');
    const isHidden = hideOnRoutes.some(route => location.pathname.startsWith(route)) || isProductDetail;

    if (isHidden) return null;

    const navLinks = [
        { to: '/', icon: HomeIcon, label: 'Home' },
        { to: '/search', icon: SearchIcon, label: 'Search' },
        { to: '/cart', icon: ShoppingBag, label: 'Cart', badge: cartCount },
        { to: '/orders', icon: Clock, label: 'Orders' },
        { to: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
            <nav className="bg-white/90 dark:bg-[#111111]/90 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 flex justify-around items-center p-2.5 rounded-3xl shadow-lg">
                {navLinks.map(({ to, icon: Icon, label, badge }) => {
                    const isActive = location.pathname === to;
                    return (
                        <Link
                            key={to}
                            to={to}
                            className="flex flex-col items-center gap-1 py-1 px-1 flex-1 relative transition-transform active:scale-95"
                        >
                            <motion.div
                                animate={isActive ? { y: -2 } : { y: 0 }}
                                className={`relative flex items-center justify-center w-12 h-10 rounded-2xl transition-all duration-300 ${isActive
                                        ? 'text-zinc-900 dark:text-white'
                                        : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-600'
                                    }`}
                            >
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                {badge > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm border-2 border-white dark:border-[#111111] px-1"
                                    >
                                        {badge > 9 ? '9+' : badge}
                                    </motion.span>
                                )}
                            </motion.div>
                            <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-600'
                                }`}>
                                {label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="mobileNavDot"
                                    className="absolute -top-1 w-1 h-1 bg-zinc-900 dark:bg-white rounded-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

function App() {
    const navigate = useNavigate();

    useEffect(() => {
        initializeFirebase();
        
        // Initialize Theme
        const theme = localStorage.getItem('theme') || 'system';
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }

        // Natively handle Android hardware back button
        const handleBackButton = async () => {
            const path = window.location.pathname;
            const subNavs = ['/search', '/cart', '/orders', '/profile'];
            
            if (path === '/') {
                CapacitorApp.exitApp();
            } else if (subNavs.includes(path)) {
                navigate('/');
            } else {
                window.history.back();
            }
        };

        const listener = CapacitorApp.addListener('backButton', handleBackButton);

        return () => {
            listener.remove();
        };
    }, [navigate]);

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-[#0A0A0A]">
            <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Registration />} />
                        <Route path="/" element={<Home />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/order/:id" element={<OrderStatus />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                        <Route path="/test-fcm" element={<TestFCM />} />
                    </Routes>
                </Suspense>
            </main>
            <Navigation />
        </div>
    );
}

export default App;
