import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '../hooks/useDashboardStats';
import {
    TrendingUp,
    Clock,
    Wallet,
    Ticket,
    Package,
    Users as UsersIcon,
    ShoppingCart,
    ShoppingBag,
    Loader2,
    AlertCircle,
    Activity,
    CheckCircle2,
    ChevronRight,
    Store,
    Bike
} from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_CONFIG = {
    placed: { text: 'text-zinc-700', bg: 'bg-zinc-100', icon: Package },
    accepted: { text: 'text-blue-700', bg: 'bg-blue-100', icon: CheckCircle2 },
    preparing: { text: 'text-amber-700', bg: 'bg-amber-100', icon: Activity },
    ready: { text: 'text-emerald-700', bg: 'bg-emerald-100', icon: ShoppingBag },
    out_for_delivery: { text: 'text-violet-700', bg: 'bg-violet-100', icon: Bike },
    delivered: { text: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle2 },
    picked_up: { text: 'text-teal-700', bg: 'bg-teal-100', icon: Store },
    cancelled: { text: 'text-red-700', bg: 'bg-red-100', icon: AlertCircle },
};

import { useMerchant } from '../contexts/MerchantContext';

const Dashboard = () => {
    const { selectedMerchantId } = useMerchant();
    const { orders, stats, loading, error } = useDashboardStats(selectedMerchantId);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-zinc-500 font-medium text-sm animate-pulse tracking-tight">Synchronizing node data...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12 bg-white dark:bg-zinc-900 rounded-2xl border border-red-100 dark:border-red-900/20 max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center mb-6 text-red-500">
                <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Sync Interrupted</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="bg-zinc-900 dark:bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold shadow-sm hover:opacity-90 transition-all text-sm"
            >
                Retry Connection
            </button>
        </div>
    );

    const totalOrders = stats?.total_orders ?? orders.length;
    const totalRevenue = stats?.total_revenue ?? 0;
    const totalUsers = stats?.total_users ?? 0;
    const totalProducts = stats?.total_products ?? 0;
    const totalRestaurants = stats?.total_restaurants ?? 0;
    const recentCount = stats?.recent_orders_count ?? 0;

    const statusBreakdown = ['placed', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'picked_up', 'cancelled'].map(s => ({
        status: s,
        count: orders.filter(o => o.status === s).length,
    }));

    const statsConfig = [
        { label: 'Revenue Flow', val: `₹${Number(totalRevenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: Wallet, color: 'emerald', sub: '+12.5% Velocity', show: true },
        { label: 'Rewards Burn', val: `₹${Number(stats?.total_discounts || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: Ticket, color: 'amber', sub: 'Coupon utility', show: stats?.total_discounts !== undefined },
        { label: 'Order Volume', val: totalOrders, icon: ShoppingBag, color: 'blue', sub: `${recentCount} recent`, show: true },
        { label: 'Network Users', val: totalUsers, icon: UsersIcon, color: 'purple', sub: 'Total accounts', show: stats?.total_users !== undefined },
        { label: 'Partner Outlets', val: totalRestaurants, icon: Store, color: 'violet', sub: 'Active nodes', show: stats?.total_restaurants !== undefined },
        { label: 'Inventory Assets', val: totalProducts, icon: Package, color: 'orange', sub: 'Active menu', show: true }
    ].filter(s => s.show);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 pb-10"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Dashboard Overview</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Welcome back, here's what's happening in your node today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/orders"
                        className="bg-zinc-900 dark:bg-emerald-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-zinc-900/10 dark:shadow-emerald-500/20 text-[10px] uppercase tracking-[0.2em]"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Marketplace Intel
                    </Link>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-6 gap-6">
                {statsConfig.map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full uppercase tracking-wider`}>
                                <TrendingUp className="w-3 h-3" />
                                12%
                            </div>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{stat.val}</h3>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-medium">{stat.sub}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Orders Overview */}
                <motion.div variants={itemVariants} className="xl:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Recent Orders</h3>
                            <p className="text-xs text-zinc-500 font-medium">Tracking live node activity</p>
                        </div>
                        <Link to="/orders" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest flex items-center gap-1">
                            View All <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="p-6">
                        {orders.length === 0 ? (
                            <div className="py-20 text-center">
                                <ShoppingCart size={48} className="text-zinc-100 mx-auto mb-4" />
                                <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest">No recent traffic</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.slice(0, 5).map((order) => {
                                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                                    return (
                                        <div key={order.id} className="flex items-center justify-between p-4 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-400 text-xs">
                                                    #{order.id.toString().slice(-3)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{order.user?.name || 'Guest User'}</p>
                                                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ₹{order.total_price}</p>
                                                </div>
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
                                                {order.status}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Status Breakdown */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Distribution</h3>
                        <div className="space-y-6">
                            {statusBreakdown.map((s) => {
                                const cfg = STATUS_CONFIG[s.status];
                                return (
                                    <div key={s.status} className="space-y-2.5">
                                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em]">
                                            <span className="text-zinc-500">{s.status}</span>
                                            <span className="text-zinc-900 dark:text-white">{s.count}</span>
                                        </div>
                                        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((s.count / (orders.length || 1)) * 100, 100)}%` }}
                                                className={`h-full ${cfg.bg.replace('100', '500')}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
