import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Star,
    Clock,
    Flame,
    Leaf,
    MessageSquare,
    Plus,
    Minus,
    ArrowRight,
    X,
    Heart,
    Share2,
    ShieldCheck
} from 'lucide-react';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [userRating, setUserRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');

    const handleSubmitReview = async () => {
        try {
            await productService.addReview(id, {
                rating: userRating,
                comment: reviewComment
            });
            setShowReviewModal(false);
            const response = await productService.getById(id);
            setProduct(response.data.data);
            setReviewComment('');
        } catch (error) {
            console.error("Review error:", error);
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await productService.getById(id);
                setProduct(response.data.data);

                const queryParams = new URLSearchParams(location.search);
                if (queryParams.get('auto_add') === 'true' && response.data.data) {
                    const qty = parseInt(queryParams.get('qty')) || 1;
                    addToCart(response.data.data, qty);
                    navigate('/cart', { replace: true });
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, location.search, addToCart, navigate]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-[#0A0A0A]">
            <div className="w-8 h-8 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!product) return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center bg-zinc-50 dark:bg-[#0A0A0A] p-6">
            <X size={48} className="text-zinc-300 dark:text-zinc-600 mb-4" />
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">Item Not Found</h1>
            <button onClick={() => navigate('/')} className="text-sm font-medium underline text-zinc-900 dark:text-white">Return Home</button>
        </div>
    );

    return (
        <div className="bg-zinc-50 dark:bg-[#0A0A0A] min-h-screen pb-32 font-sans">
            {/* Elegant Hero Image */}
            <div className="relative h-[45vh] bg-zinc-100 dark:bg-zinc-900">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                
                {/* Header Actions */}
                <div className="absolute top-12 left-6 right-6 flex justify-between items-center z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center text-zinc-900 dark:text-white active:scale-95 transition-transform"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex gap-3">
                        <button className="w-10 h-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center text-zinc-900 dark:text-white active:scale-95 transition-transform">
                            <Heart size={18} />
                        </button>
                        <button className="w-10 h-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center text-zinc-900 dark:text-white active:scale-95 transition-transform">
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <div className="px-6 pt-6 bg-zinc-50 dark:bg-[#0A0A0A] relative -mt-6 rounded-t-3xl border-t border-white/10">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 pr-4">
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white leading-tight mb-2">{product.name}</h1>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-semibold text-zinc-900 dark:text-white">{parseFloat(product.avg_rating || 4.5).toFixed(1)}</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{product.review_count || 12} reviews</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                            ₹{parseFloat(product.price).toFixed(0)}
                        </span>
                    </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                        { label: 'Calories', val: '450 kcal', icon: Flame },
                        { label: 'Time', val: '15-20 min', icon: Clock },
                        { label: 'Type', val: 'Organic', icon: Leaf }
                    ].map((spec, i) => {
                        const Icon = spec.icon;
                        return (
                            <div key={i} className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col items-center gap-2">
                                <Icon size={18} className="text-zinc-400" />
                                <div className="text-center">
                                    <p className="text-[11px] font-semibold text-zinc-900 dark:text-white">{spec.val}</p>
                                    <p className="text-[9px] text-zinc-500 uppercase tracking-wider">{spec.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Description */}
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                        Details <ShieldCheck size={14} className="text-emerald-500" />
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                        {product.description || "A delicious blend of premium ingredients prepared to your satisfaction."}
                    </p>
                </div>

                {/* Reviews */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Customer Reviews</h3>
                        <button
                            onClick={() => {
                                if (!localStorage.getItem('access_token')) return navigate('/login');
                                setShowReviewModal(true);
                            }}
                            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 active:scale-95 transition-transform"
                        >
                            <MessageSquare size={12} /> Add
                        </button>
                    </div>

                    <div className="space-y-4">
                        {product.reviews?.length > 0 ? (
                            product.reviews.map((rev, i) => (
                                <div key={i} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center font-bold text-xs">
                                                {rev.user_name[0]}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-zinc-900 dark:text-white">{rev.user_name}</p>
                                                <div className="flex items-center mt-0.5">
                                                    {[...Array(5)].map((_, s) => (
                                                        <Star key={s} size={8} className={`${s < rev.rating ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-200 dark:text-zinc-700'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">"{rev.comment}"</p>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white dark:bg-zinc-900 py-8 rounded-2xl text-center border border-zinc-100 dark:border-zinc-800">
                                <p className="text-xs font-medium text-zinc-400 mb-1">No reviews yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sticky Add to Cart Actions */}
            <AnimatePresence>
                {!showReviewModal && (
                    <motion.div
                        initial={{ y: 200 }}
                        animate={{ y: 0 }}
                        exit={{ y: 200 }}
                        className="fixed bottom-0 w-full p-6 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-800 z-50 flex gap-3"
                    >
                        <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-1.5 border border-zinc-200 dark:border-zinc-800">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-sm text-zinc-600 dark:text-zinc-300 active:scale-95"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="w-10 text-center font-semibold text-zinc-900 dark:text-white">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center shadow-sm text-white dark:text-zinc-900 active:scale-95"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                const token = localStorage.getItem('access_token');
                                if (!token) {
                                    navigate('/login', { state: { from: `/product/${id}?auto_add=true&qty=${quantity}` } });
                                    return;
                                }
                                addToCart(product, quantity);
                                navigate('/cart');
                            }}
                            className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl shadow-sm flex items-center justify-between px-6 active:scale-[0.98] transition-transform"
                        >
                            <div className="flex flex-col text-left">
                                <span className="text-sm font-semibold">Add to cart</span>
                                <span className="text-[10px] opacity-70">₹{(product.price * quantity).toFixed(0)} total</span>
                            </div>
                            <ArrowRight size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Review Modal */}
            <AnimatePresence>
                {showReviewModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end"
                        onClick={() => setShowReviewModal(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-[#0A0A0A] w-full rounded-t-[32px] p-6 pb-12 shadow-2xl relative"
                        >
                            <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-6"></div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Leave a Review</h2>
                                    <p className="text-xs text-zinc-500">{product.name}</p>
                                </div>
                                <button onClick={() => setShowReviewModal(false)} className="w-8 h-8 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex justify-center gap-2 mb-6 p-4">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} onClick={() => setUserRating(star)}>
                                        <Star size={32} className={`${userRating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-200 dark:text-zinc-800'}`} />
                                    </button>
                                ))}
                            </div>

                            <div className="mb-6">
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="Tell us what you thought..."
                                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none min-h-[100px] text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400"
                                />
                            </div>

                            <button
                                onClick={handleSubmitReview}
                                className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-semibold text-sm active:scale-95 transition-transform"
                            >
                                Submit Review
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductDetail;
