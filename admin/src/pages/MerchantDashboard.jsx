import React, { useState, useEffect } from 'react';
import { orderService, MerchantService } from '../services/api';
import { 
    Package, 
    Clock, 
    CheckCircle2, 
    Activity, 
    IndianRupee, 
    TrendingUp,
    Store,
    Users,
    ChevronRight,
    SearchX,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
    placed: { color: 'text-zinc-600', dot: 'bg-zinc-500', bg: 'bg-zinc-50 dark:bg-zinc-800/50', label: 'Placed' },
    accepted: { color: 'text-blue-600', dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Accepted' },
    preparing: { color: 'text-amber-600', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Preparing' },
    ready: { color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', label: 'Ready' },
    out_for_delivery: { color: 'text-violet-600', dot: 'bg-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', label: 'On Way' },
    delivered: { color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', label: 'Delivered' },
    picked_up: { color: 'text-teal-600', dot: 'bg-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20', label: 'Picked Up' },
};

const MerchantDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ revenue: 0, orderCount: 0, activeOrders: 0 });
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    useEffect(() => {
        fetchMerchantData();
    }, []);

    const fetchMerchantData = async () => {
        try {
            setLoading(true);
            // In a real app, we'd have a specific /merchant/dashboard endpoint
            // For now, we filter platform orders by the merchant's Merchant ID
            const response = await orderService.getAllOrders();
            const allOrders = response.data.data || [];
            
            // Assume user.merchant.id exists for merchants (lowercase relationship)
            const merchantOrders = allOrders.filter(o => o.merchant_id === user?.merchant?.id);
            setOrders(merchantOrders);

            // Calculate basic stats
            const revenue = merchantOrders.reduce((acc, o) => o.status === 'delivered' || o.status === 'picked_up' ? acc + parseFloat(o.total_price) : acc, 0);
            const active = merchantOrders.filter(o => !['delivered', 'picked_up', 'cancelled'].includes(o.status)).length;

            setStats({
                revenue,
                orderCount: merchantOrders.length,
                activeOrders: active
            });
        } catch (error) {
            console.error("Merchant fetch failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusMove = async (orderId, currentStatus, type) => {
        const flow = ['placed', 'accepted', 'preparing', 'ready'];
        if (type === 'pickup' && currentStatus === 'ready') {
            try {
                await orderService.updateStatus(orderId, 'picked_up');
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'picked_up' } : o));
                toast.success("Order picked up");
            } catch (e) { toast.error("Pickup termination failed"); }
            return;
        }

        const currentIndex = flow.indexOf(currentStatus);
        if (currentIndex === -1 || currentIndex === flow.length - 1) return;

        const nextStatus = flow[currentIndex + 1];
        try {
            await orderService.updateStatus(orderId, nextStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
            toast.success("Status advanced");
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-10 h-10 text-zinc-900 dark:text-white animate-spin" />
            <p className="text-zinc-500 font-medium text-sm animate-pulse tracking-tight">Loading Kitchen Intel...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 font-sans">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-zinc-900 dark:bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Store size={20} />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Merchant Dashboard</h1>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Managing orders for <span className="font-bold text-zinc-900 dark:text-white uppercase tracking-tighter">Premium Store #24</span></p>
            </header>

            {/* Merchant KPI Track */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Gross Revenue</p>
                        <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">₹{stats.revenue.toFixed(0)}</h2>
                        <div className="mt-4 flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold">
                            <TrendingUp size={12} /> +18.4% this week
                        </div>
                    </div>
                    <IndianRupee className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-zinc-50 dark:text-white/5 -rotate-12" />
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10 text-white">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Active in Kitchen</p>
                        <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">{stats.activeOrders}</h2>
                        <div className="mt-4 flex items-center gap-1.5 text-blue-500 text-[10px] font-bold">
                            <Activity size={12} className="animate-pulse" /> High volume alert
                        </div>
                    </div>
                    <Clock className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-zinc-50 dark:text-white/5 rotate-12" />
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Customer Trust</p>
                        <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">4.9/5.0</h2>
                        <div className="mt-4 flex items-center gap-1.5 text-amber-500 text-[10px] font-bold">
                            <Users size={12} /> 124 Repeat customers
                        </div>
                    </div>
                    <CheckCircle2 className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-zinc-50 dark:text-white/5 -rotate-12" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Kitchen Queue */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> 
                            Live Kitchen Queue
                        </h3>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{stats.activeOrders} Orders</span>
                    </div>

                    <div className="grid gap-4">
                        <AnimatePresence mode="popLayout">
                            {orders.filter(o => !['delivered', 'picked_up', 'cancelled'].includes(o.status)).length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-20 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-[40px] border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center space-y-4"
                                >
                                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300">
                                        <Package size={32} />
                                    </div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Kitchen is clean. No active orders.</p>
                                </motion.div>
                            ) : (
                                orders.filter(o => !['delivered', 'picked_up', 'cancelled'].includes(o.status)).map(order => {
                                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
                                    return (
                                        <motion.div 
                                            key={order.id}
                                            layout
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ scale: 0.9, opacity: 0 }}
                                            className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between group hover:border-zinc-900 dark:hover:border-white transition-all"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center font-black text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                                    #{String(order.id).slice(-3)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase">{order.user?.name || 'Customer'}</h4>
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color}`}>
                                                            {cfg.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest truncate max-w-[200px]">
                                                        {order.items?.map(i => `${i.quantity}x ${i.product?.name}`).join(', ') || 'Various Items'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right mr-4">
                                                    <p className="text-sm font-black text-zinc-900 dark:text-white tracking-tighter">₹{parseFloat(order.total_price).toFixed(0)}</p>
                                                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{order.order_type === 'pickup' ? 'Self Pick' : 'Ship'}</p>
                                                </div>
                                                
                                                {((['placed', 'accepted', 'preparing'].includes(order.status)) || (order.order_type === 'pickup' && order.status === 'ready')) && (
                                                    <button 
                                                        onClick={() => handleStatusMove(order.id, order.status, order.order_type)}
                                                        className="h-12 px-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-zinc-900/10 dark:shadow-white/5 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                    >
                                                        {order.status === 'placed' && 'Accept'}
                                                        {order.status === 'accepted' && 'Start Prep'}
                                                        {order.status === 'preparing' && 'Ready'}
                                                        {(order.status === 'ready' && order.order_type === 'pickup') && 'Handover'}
                                                        <ChevronRight size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Top Selling Items (Small side view) */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-widest px-2 flex items-center gap-2">
                        <TrendingUp size={16} className="text-zinc-400" />
                        Best Assets
                    </h3>
                    <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-100 dark:border-zinc-800 p-8 space-y-6 shadow-sm">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate uppercase">Premium Burger Combo</p>
                                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">48 Sold this week</p>
                                </div>
                                <div className="text-[10px] font-black text-emerald-500">
                                    TOP {i}
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-4 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] border-t border-zinc-100 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            View Full Inventory
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MerchantDashboard;

