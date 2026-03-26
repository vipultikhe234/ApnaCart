import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productService, addressService, restaurantService, locationService } from '../services/api';
import {
    MapPin,
    Search,
    ChevronDown,
    Star,
    Clock,
    Plus,
    Minus,
    User,
    ArrowRight,
    Utensils,
    ShoppingBag,
    X,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

const Home = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [allCities, setAllCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null); // {id, name}
    const [showCityModal, setShowCityModal] = useState(false);
    const [popularProducts, setPopularProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [newAddress, setNewAddress] = useState('');
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, prodRes, restRes, cityRes] = await Promise.all([
                    productService.getCategories(),
                    productService.getAll(),
                    restaurantService.getAll(),
                    locationService.getCities()
                ]);
                setCategories(catRes.data.data || []);
                setPopularProducts(prodRes.data.data || []);
                setRestaurants(restRes.data.data || []);
                setAllCities(cityRes.data || []);
            } catch (error) {
                console.error("Error fetching mobile home data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredRestaurants = selectedCity 
        ? restaurants.filter(r => r.city_id === selectedCity.id)
        : restaurants;

    const filteredProducts = activeCategory === 'All'
        ? popularProducts
        : popularProducts.filter(p => p.category?.name === activeCategory);

    const fadeUp = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
    };

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-white dark:bg-[#0B0F1A]">
            <div className="w-8 h-8 border-[3px] border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin font-light"></div>
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 tracking-wider">Loading Menu...</p>
        </div>
    );

    return (
        <div className="pb-32 bg-zinc-50 dark:bg-[#0A0A0A] min-h-screen">
            
            {/* Minimal Header with Area Selector */}
            <div className="px-6 pt-12 pb-6 sticky top-0 z-30 bg-zinc-50/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl">
                <div className="flex justify-between items-center">
                    <button 
                        onClick={() => setShowCityModal(true)}
                        className="flex flex-col text-left"
                    >
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1">Exploring In</span>
                        <div className="flex items-center gap-1.5 group">
                            <span className="text-base font-black text-zinc-900 dark:text-white truncate max-w-[220px] uppercase tracking-tight">{selectedCity?.name || 'All Delivery Areas'}</span>
                            <ChevronDown size={14} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                    </button>
                    
                    <Link to="/profile" className="relative group">
                        <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-900 dark:text-white shadow-sm border border-zinc-100 dark:border-zinc-800 active:scale-95 transition-transform">
                            {user?.name ? (
                                <span className="font-bold text-xs">{user.name[0].toUpperCase()}</span>
                            ) : (
                                <User size={18} strokeWidth={2.5} />
                            )}
                        </div>
                    </Link>
                </div>
            </div>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="px-6 mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white leading-tight mb-2">
                    {greeting}, <br />
                    <span className="text-zinc-400 font-normal">{user?.name?.split(' ')[0] || 'Guest'}</span>
                </h1>
            </motion.div>

            {/* Clean Search Bar */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="px-6 mb-8">
                <div
                    onClick={() => navigate('/search')}
                    className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 active:scale-[0.98] transition-transform cursor-pointer"
                >
                    <Search size={20} className="text-zinc-400" />
                    <span className="text-zinc-400 font-medium text-sm">Search for dishes, restaurants...</span>
                </div>
            </motion.div>

            {/* Premium Minimal Banner */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="px-6 mb-10">
                <div className="bg-zinc-900 dark:bg-zinc-800 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-center h-44 shadow-md">
                    <div className="relative z-10 w-2/3">
                        <span className="text-[10px] font-semibold px-2.5 py-1 bg-white/10 rounded-full uppercase tracking-wider mb-3 inline-block">Exclusive Offer</span>
                        <h3 className="text-2xl font-semibold leading-tight mb-1">Free delivery</h3>
                        <p className="text-zinc-400 text-xs font-medium">On your first 3 orders.</p>
                    </div>
                    {/* Decorative minimalist graphic */}
                    <div className="absolute right-[-20%] bottom-[-20%] w-48 h-48 border-[1rem] border-white/5 rounded-full" />
                </div>
            </motion.div>

            {/* Simple Categories */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
                <div className="px-6 flex justify-between items-baseline mb-5">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Categories</h2>
                    <Link to="/search" className="text-xs font-semibold text-emerald-600 flex items-center gap-1 hover:opacity-80 transition-opacity">
                        View All <ArrowRight size={12} />
                    </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar pb-2">
                    <button
                        onClick={() => setActiveCategory('All')}
                        className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                            activeCategory === 'All'
                                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md'
                                : 'bg-white text-zinc-500 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400'
                        }`}
                    >
                        For You
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.name)}
                            className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors flex items-center gap-2 ${
                                activeCategory === cat.name
                                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md'
                                    : 'bg-white text-zinc-500 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Restaurants Section */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
                <div className="px-6 flex justify-between items-baseline mb-5">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Top Restaurants</h2>
                    <Link to="/search" className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        Show More <ChevronDown size={12} />
                    </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar pb-4">
                    {filteredRestaurants.length === 0 ? (
                        <div className="w-full py-10 flex flex-col items-center justify-center opacity-40 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 border-dashed">
                             <Utensils size={40} className="mb-3 text-zinc-300" />
                             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No merchants in this area yet</p>
                        </div>
                    ) : (
                        filteredRestaurants.map(rest => (
                            <Link 
                                key={rest.id} 
                                to={`/restaurant/${rest.id}`}
                                className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm shrink-0 w-72 group"
                            >
                                <div className="aspect-[16/9] relative">
                                    <img src={rest.image || 'https://images.unsplash.com/photo-1517248135467-4c7ed9d42339'} alt={rest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    {!rest.is_open && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                                            <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/40 px-3 py-1.5 rounded-lg">Closed Now</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-zinc-900 dark:text-white tracking-tight text-sm uppercase">{rest.name}</h3>
                                        <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md border border-zinc-100 dark:border-zinc-700">
                                            <Star size={8} className="text-yellow-500 fill-yellow-500" />
                                            <span className="text-[10px] font-bold text-zinc-900 dark:text-white">4.5</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest truncate">{rest.address}</p>
                                    <div className="flex items-center gap-2 mt-3 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                        <Clock size={10} className="text-emerald-500" />
                                        <span>{rest.opening_time} - {rest.closing_time}</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </motion.div>

            {/* Minimalist Product Grid */}
            <div className="px-6 mb-10">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-5">Popular Now</h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                    <AnimatePresence mode="popLayout">
                        {filteredProducts
                            .filter(p => !selectedCity || p.restaurant?.city_id === selectedCity.id)
                            .slice(0, 8)
                            .map((p, idx) => (
                            <motion.div
                                key={p.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Link to={`/product/${p.id}`} className="block group">
                                    <div className="aspect-square bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden mb-3 relative">
                                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                            <Star size={10} className="text-yellow-500 fill-yellow-500" />
                                            <span className="text-[10px] font-semibold text-zinc-900 dark:text-white">4.8</span>
                                        </div>
                                    </div>

                                    <div className="px-1">
                                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white truncate mb-0.5">{p.name}</h4>
                                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium mb-3">
                                            <span>{p.category?.name || 'Exclusive'}</span>
                                            <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                                            <span className="flex items-center gap-0.5"><Clock size={10} /> 15m</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <span className="text-base font-semibold text-zinc-900 dark:text-white">
                                                ₹{parseFloat(p.price).toFixed(0)}
                                            </span>
                                            {(() => {
                                                const cartItem = cartItems.find(item => item.id === p.id);
                                                if (cartItem) {
                                                    return (
                                                        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full p-1 border border-zinc-200 dark:border-zinc-700" onClick={(e) => e.preventDefault()}>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    updateQuantity(p.id, cartItem.quantity - 1);
                                                                }}
                                                                className="w-6 h-6 rounded-full bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                                                            >
                                                                <Minus size={12} strokeWidth={2.5} />
                                                            </button>
                                                            <span className="text-xs font-semibold text-zinc-900 dark:text-white px-2.5">
                                                                {cartItem.quantity}
                                                            </span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    updateQuantity(p.id, cartItem.quantity + 1);
                                                                }}
                                                                className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                                                            >
                                                                <Plus size={12} strokeWidth={2.5} />
                                                            </button>
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            addToCart(p);
                                                        }}
                                                        className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full flex items-center justify-center text-zinc-900 dark:text-white transition-colors active:scale-95"
                                                    >
                                                        <Plus size={16} strokeWidth={2.5} />
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* City Selection Modal */}
            <AnimatePresence>
                {showCityModal && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl border-t sm:border border-zinc-100 dark:border-zinc-800"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Select Area</h3>
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Discover merchants in your area</p>
                                    </div>
                                    <button onClick={() => setShowCityModal(false)} className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                <div className="max-h-[60vh] overflow-y-auto no-scrollbar space-y-3 pb-4">
                                    <button
                                        onClick={() => { setSelectedCity(null); setShowCityModal(false); }}
                                        className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all ${
                                            !selectedCity 
                                                ? 'bg-zinc-900 border-zinc-900 dark:bg-white dark:border-white text-white dark:text-zinc-900' 
                                                : 'bg-zinc-50 dark:bg-zinc-800 border-transparent text-zinc-500 dark:text-zinc-400'
                                        }`}
                                    >
                                        <span className="font-bold text-sm uppercase tracking-wide">All Delivery Areas</span>
                                        {!selectedCity && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                                    </button>
                                    
                                    {allCities.map(city => (
                                        <button
                                            key={city.id}
                                            onClick={() => { setSelectedCity(city); setShowCityModal(false); }}
                                            className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all ${
                                                selectedCity?.id === city.id 
                                                    ? 'bg-zinc-900 border-zinc-900 dark:bg-white dark:border-white text-white dark:text-zinc-900' 
                                                    : 'bg-zinc-50 dark:bg-zinc-800 border-transparent text-zinc-500 dark:text-zinc-400'
                                            }`}
                                        >
                                            <span className="font-bold text-sm uppercase tracking-wide">{city.name}</span>
                                            {selectedCity?.id === city.id && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
