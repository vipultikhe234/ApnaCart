import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ShoppingBag,
    Plus,
    Minus,
    Trash2,
    ArrowRight,
    Ticket,
    ReceiptText,
    Wallet,
    ChevronRight
} from 'lucide-react';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();
    const navigate = useNavigate();

    const safeSubtotal = parseFloat(subtotal || 0);
    const deliveryFee = cartItems.length > 0 ? 30.00 : 0;
    const taxes = safeSubtotal * 0.05; // 5% GST
    const total = safeSubtotal + deliveryFee + taxes;

    const fadeUp = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="pb-32 bg-zinc-50 dark:bg-[#0A0A0A] min-h-screen">
            {/* Elegant Header */}
            <div className="px-6 pt-12 pb-4 sticky top-0 z-40 bg-zinc-50/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white transition-transform active:scale-95 shadow-sm"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">Your Cart</h2>
                    <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{cartItems.length} items</p>
                </div>
                <div className="w-10 h-10"></div>
            </div>

            <div className="px-6 mt-6 space-y-4">
                <AnimatePresence mode="popLayout">
                    {cartItems.length === 0 ? (
                        <motion.div
                            key="empty-cart"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-24 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center px-8 shadow-sm"
                        >
                            <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                                <ShoppingBag size={32} className="text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">Cart is empty</h3>
                            <p className="text-sm text-zinc-500 mb-8">Discover our menu to add your favorite meals.</p>

                            <Link to="/" className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-2xl text-sm font-semibold shadow-sm active:scale-[0.98] transition-all">
                                Browse Menu
                            </Link>
                        </motion.div>
                    ) : (
                        cartItems.map((item) => (
                            <motion.div
                                key={item.cart_item_id}
                                layout
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, x: -20 }}
                                variants={fadeUp}
                                className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center gap-4 relative overflow-hidden"
                            >
                                <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-2xl overflow-hidden shrink-0 border border-zinc-100 dark:border-zinc-800">
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 min-w-0 py-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-zinc-900 dark:text-white text-sm truncate pr-2">{item.name}</h4>
                                        <button
                                            onClick={() => removeFromCart(item.cart_item_id)}
                                            className="text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{item.category?.name || 'Exclusive'}</p>
                                        {item.variant && (
                                            <>
                                                <span className="w-1 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full"></span>
                                                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full">{item.variant.quantity}</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-semibold text-zinc-900 dark:text-white">₹{parseFloat(item.variant ? item.variant.price : item.price).toFixed(0)}</span>
                                        <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 rounded-full p-1 border border-zinc-100 dark:border-zinc-700">
                                            <button
                                                onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                                                className="w-7 h-7 rounded-full bg-white dark:bg-zinc-700 text-zinc-500 flex items-center justify-center shadow-sm active:scale-95"
                                            >
                                                <Minus size={12} strokeWidth={2.5} />
                                            </button>
                                            <span className="text-xs font-semibold text-zinc-900 dark:text-white px-3">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                                                className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-sm active:scale-95"
                                            >
                                                <Plus size={12} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>

                {/* Subtotal & Summary section */}
                {cartItems.length > 0 && (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="pt-6 space-y-4">
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Subtotal</span>
                                <span className="font-semibold text-zinc-900 dark:text-white">₹{safeSubtotal.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Delivery Fee</span>
                                <span className="font-semibold text-zinc-900 dark:text-white">₹{deliveryFee.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Taxes</span>
                                <span className="font-semibold text-zinc-900 dark:text-white">₹{taxes.toFixed(0)}</span>
                            </div>

                            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-4"></div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-zinc-900 dark:text-white">Total</span>
                                <span className="text-2xl font-bold text-zinc-900 dark:text-white">₹{total.toFixed(0)}</span>
                            </div>
                        </div>

                        {/* Promo Code area */}
                        <div className="bg-zinc-50 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-zinc-700 p-4 rounded-3xl flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-900 dark:text-white shadow-sm border border-zinc-100 dark:border-zinc-800">
                                    <Ticket size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">Add Promo Code</p>
                                    <p className="text-[10px] text-zinc-500">Save on your order</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-zinc-400" />
                        </div>
                    </motion.div>
                )}
            </div>

            <AnimatePresence>
                {cartItems.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-28 w-full px-6 z-40"
                    >
                        <button
                            onClick={() => {
                                const token = localStorage.getItem('access_token');
                                if (!token) navigate('/login');
                                else navigate('/checkout');
                            }}
                            className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 h-[64px] rounded-2xl shadow-lg flex items-center justify-between px-6 active:scale-[0.98] transition-transform"
                        >
                            <span className="font-semibold text-base">₹{total.toFixed(0)}</span>
                            <span className="text-sm font-semibold flex items-center gap-2">
                                Checkout <ArrowRight size={18} />
                            </span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Cart;
