import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePayment from '../components/StripePayment';
import { toast } from 'react-hot-toast';
import {
    Clock,
    Activity,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    Link as LinkIcon,
    RefreshCw,
    User,
    CreditCard,
    ChevronDown,
    ChevronUp,
    MapPin,
    Package,
    IndianRupee,
    Ticket,
    SearchX,
    ShoppingCart,
    Loader2,
    ShieldCheck,
    Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const STATUS_CONFIG = {
    placed: { color: 'text-zinc-600', dot: 'bg-zinc-500', bg: 'bg-zinc-50 dark:bg-zinc-800/50', label: 'Placed' },
    accepted: { color: 'text-blue-600', dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Accepted' },
    preparing: { color: 'text-amber-600', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Preparing' },
    ready: { color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', label: 'Ready' },
    out_for_delivery: { color: 'text-violet-600', dot: 'bg-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', label: 'On Way' },
    delivered: { color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', label: 'Delivered' },
    picked_up: { color: 'text-teal-600', dot: 'bg-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20', label: 'Picked Up' },
    cancelled: { color: 'text-red-600', dot: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Cancelled' },
};

const PAY_STATUS = {
    paid: 'bg-emerald-500 text-white',
    pending: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400',
    failed: 'bg-red-500 text-white',
    refunded: 'bg-zinc-900 text-white',
};

import { useMerchant } from '../contexts/MerchantContext';

const Orders = () => {
    const { selectedMerchantId } = useMerchant();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [stripeModal, setStripeModal] = useState({ show: false, orderId: null });
    const [clientSecret, setClientSecret] = useState('');
    const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);

    useEffect(() => { fetchOrders(); }, [selectedMerchantId]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderService.getAllOrders(selectedMerchantId);
            const data = response.data.data || response.data || [];
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        const order = orders.find(o => o.id === id);
        if (!order) return;

        if (newStatus === 'delivered' && order.payment_status !== 'paid') {
            setUpdatingId(id);
            try {
                const response = await orderService.initiatePayment(id);
                setClientSecret(response.data.data.client_secret);
                setPendingStatusUpdate({ id, status: newStatus });
                setStripeModal({ show: true, orderId: id });
                return;
            } catch (error) {
                toast.error(`Failed to initiate payment: ${error.message}`);
                setUpdatingId(null);
                return;
            }
        }

        const prevStatus = order.status;
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
        setUpdatingId(id);
        try {
            await orderService.updateStatus(id, newStatus);
        } catch (error) {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: prevStatus } : o));
            toast.error(`Status update failed`);
        } finally {
            setUpdatingId(null);
        }
    };

    const handlePaymentSuccess = async () => {
        if (!pendingStatusUpdate) return;
        const { id, status } = pendingStatusUpdate;

        try {
            await orderService.updateStatus(id, status);
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status, payment_status: 'paid' } : o));
            setStripeModal({ show: false, orderId: null });
            setPendingStatusUpdate(null);
        } catch (error) {
            toast.error(`Update failed`);
        } finally {
            setUpdatingId(null);
        }
    };

    const handlePaymentStatusChange = async (id, newPayStatus) => {
        const prevPayStatus = orders.find(o => o.id === id)?.payment_status;
        setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: newPayStatus } : o));
        setUpdatingId(id);
        try {
            await orderService.updatePaymentStatus(id, newPayStatus);
        } catch (error) {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: prevPayStatus } : o));
            toast.error(`Payment update failed`);
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(o => o.status === filterStatus);

    const statusCounts = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {});

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-zinc-500 font-medium text-sm animate-pulse tracking-tight">Syncing order node...</p>
        </div>
    );

    return (
        <Elements stripe={stripePromise}>
            <div className="space-y-8 pb-20 font-sans">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Orders</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Monitor and manage customer transactions.</p>
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="bg-zinc-900 dark:bg-emerald-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-zinc-900/10 dark:shadow-emerald-500/20 text-[10px] uppercase tracking-[0.2em]"
                    >
                        <RefreshCw size={14} className={updatingId ? 'animate-spin' : ''} />
                        Sync Registry
                    </button>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {['placed', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'picked_up', 'cancelled'].map((key) => {
                        const cfg = STATUS_CONFIG[key];
                        const count = statusCounts[key] || 0;
                        const isActive = filterStatus === key;
                        return (
                            <motion.button
                                key={key}
                                whileHover={{ y: -4 }}
                                onClick={() => setFilterStatus(isActive ? 'all' : key)}
                                className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden group ${isActive
                                    ? 'border-zinc-900 dark:border-emerald-500 bg-zinc-900 dark:bg-emerald-500 text-white shadow-xl'
                                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : cfg.dot}`}></div>
                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-white/70' : 'text-zinc-400'}`}>{cfg.label}</span>
                                </div>
                                <p className={`text-2xl font-bold tracking-tight ${isActive ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                                    {count}
                                </p>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Order Table Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[10px] uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="py-4 px-4">Customer</th>
                                    <th className="py-4 px-4">Valuation</th>
                                    <th className="py-4 px-4 text-center">Payment</th>
                                    <th className="py-4 px-4 text-center">Status</th>
                                    <th className="py-4 px-4 text-center">Update</th>
                                    <th className="px-6 py-4 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-24 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-30">
                                                <SearchX size={48} className="text-zinc-400" />
                                                <p className="text-xs font-bold uppercase tracking-widest mt-4 text-zinc-500">No matching transactions</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => {
                                        const isExpanded = expandedId === order.id;
                                        const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                                        const isUpdating = updatingId === order.id;

                                        return (
                                            <React.Fragment key={order.id}>
                                                <tr className={`group transition-all duration-300 ${isExpanded ? 'bg-zinc-50/50 dark:bg-zinc-800/20' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30'}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <p className="font-bold text-zinc-900 dark:text-white tracking-tight text-sm mb-0.5 uppercase">#ORD-{String(order.id).padStart(4, '0')}</p>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                                                                {order.Merchant && (
                                                                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                                        {order.Merchant.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm text-[10px] font-bold text-zinc-500 group-hover:text-emerald-500 transition-colors uppercase">
                                                                {order.user?.name?.[0] || '?'}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-zinc-900 dark:text-white text-[11px] truncate uppercase">{order.user?.name || 'Guest'}</p>
                                                                <p className="text-[9px] text-zinc-400 font-bold tracking-widest truncate max-w-[100px] uppercase">{order.user?.phone || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="font-bold text-zinc-900 dark:text-white tracking-tight text-sm">₹{parseFloat(order.total_price).toFixed(0)}</span>
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            <select
                                                                value={order.payment_status || 'pending'}
                                                                onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                                                                disabled={isUpdating}
                                                                className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest outline-none border-none shadow-sm ${PAY_STATUS[order.payment_status] || PAY_STATUS.pending}`}
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="paid">Paid</option>
                                                                <option value="failed">Failed</option>
                                                                <option value="refunded">Refunded</option>
                                                            </select>
                                                            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">{order.payment?.payment_method || 'COD'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color} border border-transparent`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                                                            {cfg.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                            disabled={isUpdating}
                                                            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-[9px] font-bold uppercase rounded-xl px-2.5 py-1.5 outline-none border border-zinc-200 dark:border-zinc-700 tracking-widest cursor-pointer shadow-inner"
                                                        >
                                                            <option value="placed">Place</option>
                                                            <option value="accepted">Accept</option>
                                                            <option value="preparing">Prep</option>
                                                            <option value="ready">Ready</option>
                                                            <option value="out_for_delivery">Ship</option>
                                                            <option value="delivered">Done</option>
                                                            <option value="picked_up">Pick</option>
                                                            <option value="cancelled">Void</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                                            className={`p-2 rounded-lg transition-all ${isExpanded ? 'bg-zinc-900 dark:bg-emerald-500 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                                                        >
                                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>
                                                    </td>
                                                </tr>

                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.tr
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="bg-zinc-50/30 dark:bg-zinc-950/20"
                                                        >
                                                            <td colSpan={7} className="p-8">
                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                                    <div className="space-y-4">
                                                                        <div className="flex items-center gap-2 mb-4">
                                                                            <Package size={14} className="text-zinc-400" />
                                                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Package manifest</span>
                                                                        </div>
                                                                        <div className="space-y-3">
                                                                            {order.items?.map(item => (
                                                                                <div key={item.id} className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                                                                    <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl overflow-hidden shrink-0 border border-zinc-100 dark:border-zinc-800">
                                                                                        {item.product?.image_url ? (
                                                                                            <img src={item.product.image_url} className="w-full h-full object-cover" alt={item.product.name} />
                                                                                        ) : (
                                                                                            <div className="w-full h-full flex items-center justify-center opacity-30 text-zinc-400"><Package size={16} /></div>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="flex-1">
                                                                                        <p className="font-bold text-zinc-900 dark:text-white text-xs uppercase">{item.product?.name || 'Product'}</p>
                                                                                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1">QTY: {item.quantity}</p>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                        <p className="text-sm font-bold text-zinc-900 dark:text-white">₹{parseFloat(item.price * item.quantity).toFixed(0)}</p>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-6">
                                                                        <div className="space-y-3">
                                                                            <div className="flex items-center gap-2 px-2">
                                                                                <MapPin size={12} className="text-zinc-400" />
                                                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Destination</span>
                                                                            </div>
                                                                            <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 italic uppercase leading-relaxed">
                                                                                {order.address || 'Standard Location'}
                                                                            </p>
                                                                        </div>

                                                                        <div className="bg-zinc-900 dark:bg-zinc-800 p-6 rounded-2xl text-white space-y-4 shadow-xl">
                                                                            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest opacity-60">
                                                                                <span>Methods</span>
                                                                                <span>{order.payment?.payment_method?.toUpperCase()}</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest opacity-60">
                                                                                <span>Subtotal</span>
                                                                                <span>₹{(order.total_price + (parseFloat(order.discount) || 0)).toFixed(0)}</span>
                                                                            </div>
                                                                            {parseFloat(order.discount) > 0 && (
                                                                                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-emerald-400">
                                                                                    <span>Bonus Apply</span>
                                                                                    <span>-₹{parseFloat(order.discount).toFixed(0)}</span>
                                                                                </div>
                                                                            )}
                                                                            <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-end">
                                                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Total</span>
                                                                                <div className="flex items-end gap-1">
                                                                                    <span className="text-xs font-bold mb-1 opacity-60">₹</span>
                                                                                    <span className="text-3xl font-bold tracking-tighter leading-none">{parseFloat(order.total_price).toFixed(0)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    )}
                                                </AnimatePresence>
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {stripeModal.show && (
                <StripePayment
                    clientSecret={clientSecret}
                    orderId={stripeModal.orderId}
                    onSucceeded={handlePaymentSuccess}
                    onCancel={() => {
                        setStripeModal({ show: false, orderId: null });
                        setUpdatingId(null);
                    }}
                />
            )}
        </Elements>
    );
};

export default Orders;

