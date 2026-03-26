import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService, restaurantService } from '../services/api';
import { useMerchant } from '../contexts/MerchantContext';
import {
    LayoutDashboard,
    Soup,
    FolderTree,
    ShoppingBag,
    TicketPercent,
    Users as UsersIcon,
    UserCircle,
    LogOut,
    Bell,
    ShieldCheck,
    Zap,
    Menu,
    Navigation,
    X as CloseIcon,
    Moon,
    Sun,
    Command,
    Utensils,
    Store,
    Bike,
    Globe,
    ChevronDown,
    Package,
    ClipboardList,
    MapPin,
    Activity,
    Truck,
    Settings2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Nav Group Component ──────────────────────────────────────────────────────
const NavGroup = ({ group, location, defaultOpen = false }) => {
    const hasActive = group.items.some(
        item => location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
    );
    const [open, setOpen] = useState(defaultOpen || hasActive);

    return (
        <div className="space-y-0.5">
            {/* Group Header */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl group transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
                <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 flex items-center justify-center ${hasActive ? 'text-emerald-500' : 'text-zinc-400'}`}>
                        <group.icon size={13} strokeWidth={2.5} />
                    </div>
                    <span className={`text-[9.5px] font-black uppercase tracking-[0.18em] ${hasActive ? 'text-emerald-500' : 'text-zinc-400'}`}>
                        {group.label}
                    </span>
                </div>
                <ChevronDown
                    size={12}
                    className={`text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Group Items */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18, ease: 'easeInOut' }}
                        className="overflow-hidden pl-3"
                    >
                        <div className="border-l-2 border-zinc-100 dark:border-zinc-800 pl-3 space-y-0.5 pb-2">
                            {group.items.map(({ to, label, icon: Icon, badge }) => {
                                const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
                                return (
                                    <Link
                                        key={to}
                                        to={to}
                                        className={`flex items-center justify-between gap-3 py-2 px-3 rounded-xl transition-all duration-150 group ${
                                            isActive
                                                ? 'bg-zinc-900 dark:bg-emerald-500 text-white shadow-md shadow-zinc-900/10 dark:shadow-emerald-500/20'
                                                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon
                                                size={15}
                                                strokeWidth={isActive ? 2.5 : 2}
                                                className={isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-white transition-colors'}
                                            />
                                            <span className="text-[11px] font-bold tracking-tight">{label}</span>
                                        </div>
                                        {badge && (
                                            <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded-full">
                                                {badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Navigation Config ────────────────────────────────────────────────────────
const ADMIN_NAV = [
    {
        label: 'Overview',
        icon: Activity,
        items: [
            { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        ],
    },
    {
        label: 'Platform Setup',
        icon: Settings2,
        items: [
            { to: '/location-master', label: 'Location Master', icon: Globe, badge: 'Setup' },
        ],
    },
    {
        label: 'Merchant Network',
        icon: Store,
        items: [
            { to: '/restaurants', label: 'Merchant Partners', icon: Store },
            { to: '/categories', label: 'Categories', icon: FolderTree },
            { to: '/products', label: 'Product Catalog', icon: Soup },
            { to: '/offers', label: 'Live Offers', icon: Zap },
            { to: '/coupons', label: 'Promo & Coupons', icon: TicketPercent },
        ],
    },
    {
        label: 'Order Management',
        icon: ShoppingBag,
        items: [
            { to: '/orders', label: 'All Orders', icon: ClipboardList },
            { to: '/live-monitor', label: 'Live Monitor', icon: Navigation, badge: 'Live' },
        ],
    },
    {
        label: 'Workforce & Fleet',
        icon: Truck,
        items: [
            { to: '/rider-staff', label: 'Rider Staff', icon: Bike },
        ],
    },
    {
        label: 'Customer & Access',
        icon: UsersIcon,
        items: [
            { to: '/users', label: 'Users', icon: UsersIcon },
        ],
    },
];

const MERCHANT_NAV = [
    {
        label: 'Overview',
        icon: Activity,
        items: [
            { to: '/merchant-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ],
    },
    {
        label: 'My Outlet',
        icon: Store,
        items: [
            { to: '/profile', label: 'Merchant Profile', icon: MapPin },
            { to: '/categories', label: 'My Categories', icon: FolderTree },
        ],
    },
    {
        label: 'Product Catalog',
        icon: Package,
        items: [
            { to: '/products', label: 'My Menu', icon: Utensils },
            { to: '/offers', label: 'My Offers', icon: Zap },
            { to: '/coupons', label: 'My Coupons', icon: TicketPercent },
        ],
    },
    {
        label: 'Order Operations',
        icon: ShoppingBag,
        items: [
            { to: '/orders', label: 'Orders', icon: ClipboardList },
        ],
    },
    {
        label: 'My Fleet',
        icon: Truck,
        items: [
            { to: '/rider-staff', label: 'My Riders', icon: Bike },
        ],
    },
];

// ─── Main Layout ──────────────────────────────────────────────────────────────
const AdminLayout = () => {
    const { selectedMerchantId, setSelectedMerchantId, merchants, setMerchants } = useMerchant();
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        try { return saved ? JSON.parse(saved) : null; }
        catch (e) { return null; }
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) { navigate('/login'); return; }

        // Root landing redirection based on role
        if (location.pathname === '/' || location.pathname === '/dashboard') {
            if (user?.role === 'merchant') {
                navigate('/merchant-dashboard', { replace: true });
            }
        }
        
        if (location.pathname === '/merchant-dashboard') {
            if (user?.role === 'admin') {
                navigate('/dashboard', { replace: true });
            }
        }

        if (user?.role === 'admin' && merchants.length === 0) {
            restaurantService.listAll()
                .then(res => setMerchants(res.data.data))
                .catch(err => console.error('Failed to fetch merchants', err));
        }

        if (user?.role === 'merchant' && user.restaurant?.id && !selectedMerchantId) {
            setSelectedMerchantId(user.restaurant.id.toString());
        }

        if (document.documentElement.classList.contains('dark')) setIsDarkMode(true);
    }, [navigate, user, merchants.length, setMerchants, selectedMerchantId, setSelectedMerchantId]);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        document.documentElement.classList.toggle('dark', newMode);
    };

    useEffect(() => {
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        try { await authService.logout(); }
        catch {}
        finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const navGroups = user?.role === 'admin' ? ADMIN_NAV : MERCHANT_NAV;

    // Current page label for topbar breadcrumb
    const currentLabel = (() => {
        for (const group of navGroups) {
            for (const item of group.items) {
                if (location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))) {
                    return { group: group.label, page: item.label };
                }
            }
        }
        return { group: '', page: 'Dashboard' };
    })();

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans selection:bg-emerald-100 selection:text-emerald-900">
            {/* Mobile overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-[60] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* ── SIDEBAR ── */}
            <motion.aside
                initial={false}
                animate={{ x: isSidebarOpen ? 0 : -300, width: isSidebarOpen ? 264 : 0, opacity: isSidebarOpen ? 1 : 0 }}
                className="fixed lg:relative h-full bg-white dark:bg-zinc-900 flex flex-col border-r border-zinc-100 dark:border-zinc-800 shrink-0 z-[70] overflow-hidden"
            >
                {/* Logo */}
                <div className="px-5 py-5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <Command className="text-white" size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight leading-none">ApnaCart</h1>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                                    {user?.role === 'admin' ? 'Super Admin' : 'Merchant Console'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                        <CloseIcon size={16} />
                    </button>
                </div>

                {/* User chip */}
                {user && (
                    <div className="mx-4 mt-4 flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700/60">
                        <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center shrink-0 relative">
                            <span className="font-black text-white dark:text-zinc-900 text-xs">{user.name?.[0]?.toUpperCase()}</span>
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-800 rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-zinc-900 dark:text-white text-[10px] truncate">{user.name}</p>
                            <p className="text-[8.5px] text-zinc-400 font-black uppercase tracking-widest mt-0.5">{user.role}</p>
                        </div>
                    </div>
                )}

                {/* Navigation Groups */}
                <nav className="flex-1 overflow-y-auto pt-4 pb-4 px-3 space-y-1 custom-scrollbar">
                    {navGroups.map((group, i) => (
                        <NavGroup
                            key={group.label}
                            group={group}
                            location={location}
                            defaultOpen={i === 0}
                        />
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl text-zinc-500 dark:text-zinc-400 hover:text-white hover:bg-zinc-900 dark:hover:bg-zinc-700 transition-all font-black text-[10px] tracking-[0.2em] uppercase border border-zinc-200 dark:border-zinc-700"
                    >
                        <LogOut size={14} className="rotate-180" /> End Session
                    </button>
                </div>
            </motion.aside>

            {/* ── MAIN ── */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Top Bar */}
                <header className="h-[60px] px-5 lg:px-7 flex justify-between items-center bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800 sticky top-0 z-40">
                    <div className="flex items-center gap-4 flex-1">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all border border-zinc-200 dark:border-zinc-800 lg:hidden"
                        >
                            <Menu size={18} />
                        </button>

                        {/* Breadcrumb */}
                        <div className="hidden lg:flex items-center gap-2">
                            <span className="text-[9.5px] font-black uppercase tracking-[0.2em] text-zinc-400">{currentLabel.group}</span>
                            {currentLabel.group && <span className="text-zinc-300 dark:text-zinc-600 text-xs">/</span>}
                            <span className="text-[10.5px] font-black uppercase tracking-[0.15em] text-zinc-900 dark:text-white">{currentLabel.page}</span>
                        </div>

                        {/* Admin Merchant Selector */}
                        {user?.role === 'admin' && (
                            <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 py-1.5 pl-3.5 pr-2 rounded-2xl ml-2">
                                <Store size={13} className="text-zinc-400 shrink-0" />
                                <select
                                    value={selectedMerchantId}
                                    onChange={(e) => setSelectedMerchantId(e.target.value)}
                                    className="bg-transparent border-none text-[11px] font-bold text-zinc-600 dark:text-zinc-300 focus:ring-0 cursor-pointer outline-none min-w-[140px] max-w-[180px]"
                                >
                                    <option value="">Global Overview</option>
                                    {merchants.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-2 lg:gap-3">
                        <button onClick={toggleDarkMode} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800">
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 relative">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
                        </button>
                        <Link to="/my-profile" className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800">
                            <UserCircle size={18} />
                        </Link>

                        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

                        <div className="flex bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl items-center gap-1.5 border border-emerald-100 dark:border-emerald-900/40">
                            <ShieldCheck size={13} strokeWidth={2.5} />
                            <span className="text-[9px] font-black uppercase tracking-widest hidden sm:block">{user?.role}</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-50 dark:bg-zinc-950">
                    <div className="max-w-[1600px] mx-auto p-5 lg:p-8">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
