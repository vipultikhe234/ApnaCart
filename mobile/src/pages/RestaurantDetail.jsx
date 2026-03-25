import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService, restaurantService } from '../services/api';
import { 
    ChevronLeft, 
    Star, 
    Clock, 
    MapPin, 
    Plus, 
    Minus, 
    Info,
    Search as SearchIcon,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

const RestaurantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToCart, cartItems, updateQuantity } = useCart();

    useEffect(() => {
        const fetchRestaurantData = async () => {
            try {
                const [restRes, prodRes] = await Promise.all([
                    restaurantService.getById(id),
                    productService.getAll() // We'll filter these by restaurant_id
                ]);
                setRestaurant(restRes.data.data);
                
                // Filter products that belong to this restaurant
                const restaurantProducts = (prodRes.data.data || []).filter(
                    p => p.restaurant_id === parseInt(id)
                );
                setProducts(restaurantProducts);
            } catch (error) {
                console.error("Error fetching restaurant detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurantData();
    }, [id]);

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-zinc-50 dark:bg-[#0A0A0A]">
            <Loader2 className="w-8 h-8 text-zinc-900 dark:text-white animate-spin" />
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Opening Menu...</p>
        </div>
    );

    if (!restaurant) return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-6">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                <Info size={40} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Restaurant Not Found</h2>
            <button onClick={() => navigate('/')} className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold text-sm tracking-tight active:scale-95 transition-transform shadow-lg">Back to Home</button>
        </div>
    );

    return (
        <div className="pb-32 bg-zinc-50 dark:bg-[#0A0A0A] min-h-screen font-sans">
            {/* Minimalist Header Image */}
            <div className="relative h-64 overflow-hidden">
                <img 
                    src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7ed9d42339'} 
                    alt={restaurant.name} 
                    className="w-full h-full object-cover scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <button 
                    onClick={() => navigate(-1)}
                    className="absolute top-12 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition-transform"
                >
                    <ChevronLeft size={24} />
                </button>
                
                <div className="absolute bottom-6 left-6 right-6">
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase mb-2">{restaurant.name}</h1>
                    <div className="flex items-center gap-4 text-white/80 text-xs font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-400 fill-yellow-400 font-black" />
                            <span>4.8</span>
                        </div>
                        <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                        <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>{restaurant.opening_time} - {restaurant.closing_time}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Restaurant Info Card */}
            <div className="px-6 -mt-6 relative z-10">
                <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                            <MapPin size={24} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Location Details</p>
                            <p className="text-xs font-bold text-zinc-900 dark:text-white leading-relaxed uppercase">{restaurant.address}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Sections */}
            <div className="mt-10 px-6">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Our Menu</h2>
                    <div className="w-48 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-2.5 flex items-center gap-2 border border-zinc-200 dark:border-zinc-800">
                        <SearchIcon size={14} className="text-zinc-400" />
                        <input 
                            type="text" 
                            placeholder="Find a dish..." 
                            className="bg-transparent text-[10px] font-bold uppercase tracking-widest w-full outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {filteredProducts.length === 0 ? (
                        <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                            <SearchIcon size={48} className="text-zinc-300" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">No dishes match your search</p>
                        </div>
                    ) : (
                        filteredProducts.map(p => (
                            <motion.div 
                                key={p.id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="group bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex gap-4 active:scale-[0.98] transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-zinc-50 dark:border-zinc-800">
                                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-zinc-900 dark:text-white text-xs uppercase tracking-tight line-clamp-1">{p.name}</h4>
                                            <span className="text-sm font-black text-emerald-600">₹{parseFloat(p.price).toFixed(0)}</span>
                                        </div>
                                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1 line-clamp-2 leading-relaxed">
                                            {p.description || 'Premium gourmet selection prepared with locally sourced fresh ingredients.'}
                                        </p>
                                    </div>
                                    
                                    <div className="flex justify-end mt-2">
                                        {(() => {
                                            const cartItem = cartItems.find(item => item.id === p.id);
                                            if (cartItem) {
                                                return (
                                                    <div className="flex items-center bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-1 border border-emerald-100 dark:border-emerald-800/30">
                                                        <button 
                                                            onClick={() => updateQuantity(p.id, cartItem.quantity - 1)}
                                                            className="w-7 h-7 bg-white dark:bg-zinc-800 rounded-lg flex items-center justify-center text-emerald-600 shadow-sm active:scale-90 transition-transform"
                                                        >
                                                            <Minus size={14} strokeWidth={3} />
                                                        </button>
                                                        <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 px-3 tracking-tighter">{cartItem.quantity}</span>
                                                        <button 
                                                            onClick={() => updateQuantity(p.id, cartItem.quantity + 1)}
                                                            className="w-7 h-7 bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-emerald-600/20 active:scale-90 transition-transform"
                                                        >
                                                            <Plus size={14} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <button 
                                                    onClick={() => addToCart(p)}
                                                    className="px-6 py-2 bg-zinc-900 dark:bg-emerald-500 text-white text-[9px] font-black uppercase tracking-[0.1em] rounded-xl active:scale-95 transition-transform shadow-lg shadow-zinc-900/10 dark:shadow-emerald-500/20"
                                                >
                                                    Add to Plate
                                                </button>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetail;
