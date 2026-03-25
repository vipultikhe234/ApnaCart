import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import {
    LayoutDashboard,
    Soup,
    FolderTree,
    ShoppingBag,
    TicketPercent,
    Users as UsersIcon,
    LogOut,
    Bell,
    Settings,
    Search,
    ShieldCheck,
    Menu,
    X as CloseIcon,
    Moon,
    Sun,
    Command,
    Utensils,
    Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        if (document.documentElement.classList.contains('dark')) {
            setIsDarkMode(true);
        }
    }, [navigate]);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    useEffect(() => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout error");
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    // Role-based Navigation logic
    const getNavLinks = () => {
        if (!user) return [];

        const common = [
            { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        ];

        if (user.role === 'admin') {
            return [
                ...common,
                { to: '/restaurants', label: 'Merchants', icon: Store },
                { to: '/products', label: 'All Products', icon: Soup },
                { to: '/categories', label: 'Categories', icon: FolderTree },
                { to: '/orders', label: 'All Orders', icon: ShoppingBag },
                { to: '/coupons', label: 'Coupons', icon: TicketPercent },
                { to: '/users', label: 'Users', icon: UsersIcon },
            ];
        }

        if (user.role === 'merchant') {
            return [
                ...common,
                { to: '/products', label: 'My Menu', icon: Utensils },
                { to: '/categories', label: 'My Categories', icon: FolderTree },
                { to: '/orders', label: 'Orders', icon: ShoppingBag },
                { to: '/profile', label: 'Store Profile', icon: Store },
            ];
        }

        return common;
    };

    const navLinks = getNavLinks();

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans selection:bg-emerald-100 selection:text-emerald-900">
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-[60] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{
                    x: isSidebarOpen ? 0 : -300,
                    width: isSidebarOpen ? 280 : 0,
                    opacity: isSidebarOpen ? 1 : 0
                }}
                className={`fixed lg:relative h-full bg-white dark:bg-zinc-900 flex flex-col border-r border-zinc-200 dark:border-zinc-800 shrink-0 z-[70] overflow-hidden lg:translate-x-0 ${isSidebarOpen ? 'w-64' : 'w-0'}`}
            >
                <div className="px-6 py-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Command className="text-white" size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight leading-none">FoodHub</h1>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                                {user?.role === 'admin' ? 'Super Admin' : 'Merchant Node'}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-zinc-400">
                        <CloseIcon size={18} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-6 custom-scrollbar">
                    <p className="px-4 mb-4 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                        {user?.role === 'admin' ? 'Master Control' : 'Store Management'}
                    </p>
                    {navLinks.map(({ to, label, icon: Icon }) => {
                        const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-zinc-900 dark:bg-emerald-500 text-white shadow-lg shadow-zinc-900/10 dark:shadow-emerald-500/10'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                                    }`}
                            >
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white'} />
                                <span className="text-xs font-bold tracking-tight">{label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-4">
                    {user && (
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm relative overflow-hidden group">
                            <div className="w-9 h-9 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center relative shrink-0">
                                <span className="font-bold text-white dark:text-zinc-900 text-xs">{user.name?.[0]?.toUpperCase()}</span>
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-800 rounded-full animate-pulse"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-zinc-900 dark:text-white text-[10px] truncate tracking-tight">{user.name}</p>
                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.15em] leading-none mt-1">{user.role}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 dark:hover:bg-white dark:hover:text-zinc-900 transition-all font-black text-[10px] tracking-[0.2em] uppercase border border-zinc-200 dark:border-zinc-800"
                    >
                        <LogOut size={16} className="rotate-180" /> Logout Session
                    </button>
                </div>
            </motion.aside>

            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-[64px] px-6 lg:px-8 flex justify-between items-center bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-40">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all border border-zinc-200 dark:border-zinc-800 lg:hidden"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="hidden lg:flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 uppercase">
                                {user?.role === 'admin' ? 'Global Admin Synchronized' : 'Store Online & Active'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-6">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleDarkMode}
                                className="p-2.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-all"
                            >
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button className="p-2.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-all relative">
                                <Bell size={20} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950"></span>
                            </button>
                        </div>

                        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-2"></div>

                        <div className="hidden sm:flex bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-lg items-center gap-2 border border-emerald-100 dark:border-emerald-950">
                            <ShieldCheck size={14} strokeWidth={2.5} />
                            <span className="text-[9px] font-bold uppercase tracking-widest uppercase">{user?.role}</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-50 dark:bg-zinc-950">
                    <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
