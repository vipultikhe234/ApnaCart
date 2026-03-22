import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ClipboardList, ChefHat, Bike, Gift, HelpCircle, MapPin, SearchX, Box, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const OrderStatus = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const steps = [
        { label: 'Confirmed', status: 'pending', icon: ClipboardList },
        { label: 'Preparing', status: 'preparing', icon: ChefHat },
        { label: 'On the way', status: 'dispatched', icon: Bike },
        { label: 'Delivered', status: 'delivered', icon: Gift },
    ];

    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 3;
        let timeoutId;

        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${id}`);
                setOrder(res.data.data);
                setLoading(false);
            } catch (err) {
                attempts++;
                if (err.response?.status === 401) {
                    navigate('/login');
                    return;
                }
                if (attempts < maxAttempts) {
                    timeoutId = setTimeout(fetchOrder, 1000);
                } else {
                    setLoading(false);
                }
            }
        };

        fetchOrder();
        return () => clearTimeout(timeoutId);
    }, [id, navigate]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-[#0A0A0A]">
            <div className="w-8 h-8 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!order) return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-zinc-50 dark:bg-[#0A0A0A]">
            <SearchX size={48} className="text-zinc-300 dark:text-zinc-600 mb-4" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Order Not Found</h1>
            <button onClick={() => navigate('/orders')} className="text-sm font-medium underline text-zinc-900 dark:text-white">View My Orders</button>
        </div>
    );

    const currentStepIndex = steps.findIndex(s => s.status === order.status);
    const progressPercent = currentStepIndex < 0 ? 0 : (currentStepIndex / (steps.length - 1)) * 100;

    return (
        <div className="bg-zinc-50 dark:bg-[#0A0A0A] min-h-screen pb-20 font-sans">
            {/* Header */}
            <div className="sticky top-0 bg-zinc-50/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 px-6 pt-12 pb-4 flex items-center gap-4 z-40">
                <button
                    onClick={() => navigate('/orders')}
                    className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shadow-sm active:scale-95"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">Track Order</h1>
                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mt-0.5">ID #{String(order.id).padStart(4, '0')}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider border ${
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-500 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                        order.status === 'cancelled' ? 'bg-red-50 text-red-500 border-red-100 dark:bg-red-500/10 dark:border-red-500/20' :
                        'bg-blue-50 text-blue-500 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20'
                    }`}>
                    {order.status}
                </div>
            </div>

            <div className="px-6 mt-6 space-y-6">
                {/* Progress Hub */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                    <div className="relative">
                        {/* Status Track */}
                        <div className="absolute left-[20px] top-6 bottom-6 w-[2px] bg-zinc-100 dark:bg-zinc-800 rounded-full"></div>
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `calc(${progressPercent}% * (100% - 48px) / 100)` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="absolute left-[20px] top-6 w-[2px] bg-zinc-900 dark:bg-white rounded-full"
                        />

                        <div className="space-y-8 relative z-10">
                            {steps.map((step, idx) => {
                                const isComplete = idx <= currentStepIndex;
                                const isCurrent = idx === currentStepIndex;
                                const StepIcon = step.icon;

                                return (
                                    <div key={idx} className={`flex items-center gap-4 transition-all ${!isComplete ? 'opacity-40' : 'opacity-100'}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                                                isComplete && !isCurrent ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900' :
                                                isCurrent ? 'bg-white dark:bg-zinc-900 border-zinc-900 dark:border-white text-zinc-900 dark:text-white' :
                                                'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-400'
                                            }`}>
                                            <StepIcon size={16} />
                                        </div>
                                        <div>
                                            <h4 className={`font-semibold text-sm ${
                                                    isComplete ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'
                                                }`}>{step.label}</h4>
                                            <p className={`text-[10px] uppercase tracking-wider mt-0.5 ${
                                                    isCurrent ? 'text-zinc-900 dark:text-white font-semibold' : 'text-zinc-400 font-medium'
                                                }`}>
                                                {isComplete && !isCurrent ? 'Done' : isCurrent ? 'In Progress' : 'Pending'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0 border border-zinc-100 dark:border-zinc-700">
                        <MapPin size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Delivery Address</p>
                        <p className="font-semibold text-zinc-900 dark:text-white text-sm leading-relaxed">{order.address || 'Standard Location'}</p>
                    </div>
                </div>

                {/* Order Details */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Box size={16} className="text-zinc-400" />
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Order Items</h3>
                    </div>

                    <div className="space-y-4 mb-6">
                        {order.items?.map(item => (
                            <div key={item.id} className="flex gap-3 items-center">
                                <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl overflow-hidden shrink-0 border border-zinc-100 dark:border-zinc-700">
                                    {item.product?.image_url ? (
                                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-300"><HelpCircle size={16} /></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate">{item.product?.name}</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-[10px] text-zinc-500 font-medium">Qty: {item.quantity}</p>
                                        <p className="font-semibold text-sm text-zinc-900 dark:text-white">₹{(item.price * item.quantity).toFixed(0)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-end">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Paid via {order.payment_method === 'cod' ? 'Cash' : 'Card'}</span>
                            </div>
                            <p className="text-[10px] font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Total Paid</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-zinc-900 dark:text-white leading-none">₹{parseFloat(order.total_price).toFixed(0)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderStatus;
