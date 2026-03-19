import React, { useState } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Copy, CheckCircle2, ShieldAlert, Lock, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const ELEMENT_STYLE = {
    style: {
        base: {
            fontSize: '15px',
            color: '#111827',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: '600',
            iconColor: '#f97316',
            '::placeholder': { color: '#9ca3af', fontWeight: '500' },
        },
        invalid: { color: '#ef4444', iconColor: '#ef4444' },
    },
};

const StripePayment = ({ clientSecret, orderId, onSucceeded, onFailed, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const testCard = '4242 4242 4242 4242';

    const copyTestCard = () => {
        navigator.clipboard?.writeText('4242424242424242');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError(null);

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardNumberElement),
            },
        });

        if (result.error) {
            setError(result.error.message);
            setProcessing(false);
            onFailed?.(result.error.message);
            return;
        }

        if (result.paymentIntent?.status === 'succeeded') {
            try {
                // For admin panel, we can directly update the order status as Paid
                await api.patch(`/orders/${orderId}/payment-status`, { status: 'paid' });
                setProcessing(false);
                onSucceeded?.();
            } catch (err) {
                console.error('Payment update error:', err);
                const backendMsg = err.response?.data?.message || err.message;
                setError(`Payment received by Stripe, but database update failed: ${backendMsg}. Please mark order as PAID manually.`);
                setProcessing(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[48px] overflow-hidden shadow-2xl border border-white/20 relative"
            >
                {/* Close Button */}
                <button
                    onClick={onCancel}
                    className="absolute top-8 right-8 w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all z-20"
                >
                    <X size={20} />
                </button>

                <div className="p-10 pt-12">
                    <div className="mb-8">
                        <h2 className="text-2xl lg:text-3xl font-[800] text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none font-['Outfit']">Complete Payment</h2>
                        <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-3 italic leading-none">Order #ORD-{String(orderId).padStart(4, '0')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Test Card Banner */}
                        <div className="bg-orange-50/50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/20 rounded-[32px] p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>

                            <div className="relative z-10 flex items-center gap-2 mb-3">
                                <ShieldAlert size={14} className="text-orange-500" />
                                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest leading-none italic">Test Mode Active</p>
                            </div>

                            <div className="relative z-10 flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl border border-orange-100/50 dark:border-white/5 shadow-sm mb-3">
                                <span className="font-bold text-gray-900 dark:text-white tracking-[0.1em] text-sm">{testCard}</span>
                                <button
                                    type="button"
                                    onClick={copyTestCard}
                                    className={`text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${copied ? 'bg-green-50 text-green-600' : 'bg-gray-900 text-white hover:bg-orange-600'}`}
                                >
                                    {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>

                            <div className="relative z-10 flex justify-between px-2">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">EXP: <span className="text-gray-900 dark:text-white italic">01/28</span></span>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">CVC: <span className="text-gray-900 dark:text-white italic">424</span></span>
                            </div>
                        </div>

                        {/* Card Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-2 italic">Card Information</label>
                                <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-[28px] border border-gray-100 dark:border-gray-600 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                                    <CardNumberElement options={{ ...ELEMENT_STYLE, showIcon: true }} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-[28px] border border-gray-100 dark:border-gray-600">
                                    <CardExpiryElement options={ELEMENT_STYLE} />
                                </div>
                                <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-[28px] border border-gray-100 dark:border-gray-600">
                                    <CardCvcElement options={ELEMENT_STYLE} />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-red-100 flex items-center gap-2 italic">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={processing || !stripe}
                            className={`w-full py-6 rounded-full font-bold text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 italic ${processing || !stripe
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-slate-900 text-white shadow-indigo-600/10 hover:bg-indigo-600'}`}
                        >
                            {processing ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <><Lock size={16} /> Process Payment</>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 flex items-center justify-center gap-2 text-gray-300">
                        <Lock size={10} />
                        <p className="text-[9px] font-black uppercase tracking-widest italic">Encrypted Secure Payment Gateway</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StripePayment;
