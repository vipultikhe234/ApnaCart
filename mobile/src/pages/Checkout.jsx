import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { couponService, orderService, addressService } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePayment from '../components/StripePayment';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    MapPin,
    Banknote,
    CreditCard,
    ShieldCheck,
    X,
    ArrowRight,
    Ticket,
    ReceiptText,
    Wallet
} from 'lucide-react';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const Checkout = () => {
    const { cartItems, subtotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [loading, setLoading] = useState(false);
    const [clientSecret, setClientSecret] = useState(null);
    const [showStripeModal, setShowStripeModal] = useState(false);
    const [placedOrderId, setPlacedOrderId] = useState(null);

    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponApplied, setCouponApplied] = useState(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    const [addresses, setAddresses] = useState([]);
    const [newAddress, setNewAddress] = useState('');
    const [isAddingAddress, setIsAddingAddress] = useState(false);

    const deliveryFee = 30.00;
    const taxes = (Number(subtotal) || 0) * 0.05;
    const finalSubtotal = (Number(subtotal) || 0) - couponDiscount;
    const total = finalSubtotal + deliveryFee + taxes;

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login', { state: { from: '/checkout' } });
            return;
        }

        const fetchAddresses = async () => {
            try {
                const response = await addressService.getAddresses();
                if (response.data.data && response.data.data.length > 0) {
                    setAddresses(response.data.data);
                    const defaultAddress = response.data.data.find(a => a.is_default);
                    setAddress(defaultAddress ? defaultAddress.address_line : response.data.data[0].address_line);
                } else {
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        try {
                            const user = JSON.parse(storedUser);
                            if (user.address) setAddress(user.address);
                        } catch (e) {
                            console.error("User data corruption:", e);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch user addresses:", err);
            }
        };
        fetchAddresses();
    }, [navigate]);

    const handleSaveNewAddress = async () => {
        if (!newAddress.trim()) return;
        try {
            const res = await addressService.addAddress({ address_line: newAddress, is_default: true });
            setAddresses([res.data.data, ...addresses]);
            setAddress(res.data.data.address_line);
            setNewAddress('');
            setIsAddingAddress(false);
        } catch (e) {
            alert('Failed to save address');
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplyingCoupon(true);
        setCouponApplied(null);
        try {
            const response = await couponService.validate(couponCode, subtotal);
            setCouponDiscount(response.data.discount);
            setCouponApplied({ type: 'success', message: `Saved ₹${response.data.discount}` });
        } catch (error) {
            setCouponDiscount(0);
            setCouponApplied({ type: 'error', message: error.response?.data?.message || 'Invalid code' });
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!address.trim()) return alert('Please enter delivery address.');
        if (paymentMethod === 'stripe' && !stripeKey) {
            return alert('Payment gateway error. Please try Cash.');
        }
        setLoading(true);
        try {
            const orderData = {
                delivery_address: address,
                payment_method: paymentMethod,
                coupon_code: couponDiscount > 0 ? couponCode : null,
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };
            const response = await orderService.placeOrder(orderData);
            const orderId = response.data.data?.order?.id;
            setPlacedOrderId(orderId);

            if (paymentMethod === 'stripe' && response.data.data?.stripe_client_secret) {
                setClientSecret(response.data.data.stripe_client_secret);
                setShowStripeModal(true);
            } else {
                clearCart();
                navigate(orderId ? `/order/${orderId}` : '/orders');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to place order.');
            if (error.response?.status === 401) {
                navigate('/login', { state: { from: '/checkout' } });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = () => {
        clearCart();
        navigate(placedOrderId ? `/order/${placedOrderId}` : '/orders');
    };

    return (
        <div className="pb-32 bg-zinc-50 dark:bg-[#0A0A0A] min-h-screen">
            {/* Header */}
            <div className="px-6 pt-12 pb-4 sticky top-0 z-40 bg-zinc-50/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shadow-sm active:scale-95"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Checkout</h2>
                    <p className="text-[10px] font-medium text-emerald-500 uppercase tracking-widest flex items-center justify-center gap-1">
                        <ShieldCheck size={10} /> Secure Checkout
                    </p>
                </div>
                <div className="w-10 h-10"></div>
            </div>

            <div className="px-6 mt-6 space-y-8">
                {/* Address */}
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Delivery Address</h3>
                        <button 
                            onClick={() => setIsAddingAddress(!isAddingAddress)}
                            className="text-xs font-semibold text-emerald-500"
                        >
                            {isAddingAddress ? 'Cancel' : '+ Add New'}
                        </button>
                    </div>

                    {isAddingAddress ? (
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                            <textarea
                                value={newAddress}
                                onChange={(e) => setNewAddress(e.target.value)}
                                placeholder="Enter your full new address..."
                                className="w-full bg-transparent outline-none h-20 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 resize-none"
                            />
                            <button
                                onClick={handleSaveNewAddress}
                                disabled={!newAddress.trim()}
                                className="w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-semibold"
                            >
                                Save Address
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {addresses.length > 0 ? (
                                addresses.map((addr) => (
                                    <div 
                                        key={addr.id}
                                        onClick={() => setAddress(addr.address_line)}
                                        className={`p-4 rounded-3xl border cursor-pointer flex gap-3 transition-all ${
                                            address === addr.address_line 
                                            ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800' 
                                            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${address === addr.address_line ? 'border-zinc-900 dark:border-white' : 'border-zinc-300 dark:border-zinc-600'}`}>
                                            {address === addr.address_line && <div className="w-2.5 h-2.5 bg-zinc-900 dark:bg-white rounded-full"></div>}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white">{addr.address_line}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                    <textarea
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Enter your street address..."
                                        className="w-full bg-transparent outline-none h-20 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 resize-none"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* Payment */}
                <section>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Payment Method</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: 'cod', label: 'Cash', icon: Banknote },
                            { id: 'stripe', label: 'Card', icon: CreditCard }
                        ].map(method => {
                            const Icon = method.icon;
                            const isActive = paymentMethod === method.id;
                            return (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`relative p-4 rounded-[20px] border flex flex-col items-center gap-2 transition-all active:scale-[0.98] ${
                                        isActive
                                            ? 'border-zinc-900 bg-white dark:border-white dark:bg-zinc-800'
                                            : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
                                        <Icon size={20} />
                                    </div>
                                    <span className={`text-[11px] font-semibold ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                                        {method.label}
                                    </span>
                                    {isActive && <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-zinc-900 dark:bg-white rounded-full" />}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Coupon */}
                <section>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Promo Code</h3>
                    <div className="bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex gap-2">
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Enter Code..."
                            className="flex-1 bg-transparent px-4 text-sm font-semibold text-zinc-900 dark:text-white outline-none placeholder:text-zinc-400 uppercase tracking-widest"
                        />
                        <button
                            onClick={handleApplyCoupon}
                            disabled={isApplyingCoupon || !couponCode.trim()}
                            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-xl text-xs font-semibold active:scale-95 transition-transform"
                        >
                            {isApplyingCoupon ? '...' : (couponDiscount > 0 ? 'Applied' : 'Apply')}
                        </button>
                    </div>
                    {couponApplied && (
                        <p className={`mt-2 text-xs font-medium ml-2 ${couponApplied.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {couponApplied.message}
                        </p>
                    )}
                </section>

                {/* Summary */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500 flex items-center gap-2"><ReceiptText size={16} /> Subtotal</span>
                        <span className="font-semibold text-zinc-900 dark:text-white">₹{(Number(subtotal) || 0).toFixed(0)}</span>
                    </div>

                    {couponDiscount > 0 && (
                        <div className="flex justify-between items-center text-emerald-500 text-sm">
                            <span className="flex items-center gap-2"><Ticket size={16} /> Discount</span>
                            <span className="font-semibold">-₹{couponDiscount.toFixed(0)}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500 flex items-center gap-2"><Wallet size={16} /> Taxes & Delivery</span>
                        <span className="font-semibold text-zinc-900 dark:text-white">₹{(taxes + deliveryFee).toFixed(0)}</span>
                    </div>

                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-4"></div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">Total to pay</span>
                        <span className="text-2xl font-bold text-zinc-900 dark:text-white">₹{total.toFixed(0)}</span>
                    </div>
                </div>
            </div>

            {/* Bottom Fix Bar */}
            <AnimatePresence>
                {!showStripeModal && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="fixed bottom-0 w-full p-6 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-800 z-50"
                    >
                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading || cartItems.length === 0}
                            className={`w-full h-[60px] rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-transform ${
                                loading ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400' : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                            }`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span className="font-semibold text-base">Confirm payment - ₹{total.toFixed(0)}</span>
                                </>
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stripe Modal */}
            <AnimatePresence>
                {showStripeModal && clientSecret && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="bg-white dark:bg-[#0A0A0A] rounded-t-[32px] w-full max-w-lg p-6 pb-12 shadow-2xl relative overflow-y-auto max-h-[90vh]"
                        >
                            <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-6"></div>

                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Pay Securely</h2>
                                </div>
                                <button onClick={() => setShowStripeModal(false)} className="w-8 h-8 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900">
                                <Elements stripe={stripePromise}>
                                    <StripePayment
                                        clientSecret={clientSecret}
                                        orderId={placedOrderId}
                                        onSucceeded={handleSuccess}
                                        onFailed={(msg) => {
                                            setShowStripeModal(false);
                                            alert('Payment failed: ' + msg);
                                        }}
                                    />
                                </Elements>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Checkout;
