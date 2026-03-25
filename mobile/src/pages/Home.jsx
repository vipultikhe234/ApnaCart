import { productService, addressService, restaurantService } from '../services/api';
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
    Utensils
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

const Home = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
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
                const [catRes, prodRes, restRes] = await Promise.all([
                    productService.getCategories(),
                    productService.getAll(),
                    restaurantService.getAll()
                ]);
                setCategories(catRes.data.data || []);
                setPopularProducts(prodRes.data.data || []);
                setRestaurants(restRes.data.data || []);
            } catch (error) {
                console.error("Error fetching mobile home data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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
            
            {/* Minimal Header */}
            <div className="px-6 pt-12 pb-6 sticky top-0 z-30 bg-zinc-50/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl">
                <div className="flex justify-between items-center">
                    <button 
                        onClick={() => {
                            setNewAddress(user?.address || '');
                            setShowAddressModal(true);
                        }}
                        className="flex flex-col text-left"
                    >
                        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-1">Delivering To</span>
                        <div className="flex items-center gap-1.5 group">
                            <span className="text-base font-semibold text-zinc-900 dark:text-white truncate max-w-[200px]">{user?.address || 'Set your address'}</span>
                            <ChevronDown size={14} className="text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                        </div>
                    </button>
                    
                    <Link to="/profile" className="relative group">
                        <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-800 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700 active:scale-95 transition-transform">
                            {user?.name ? (
                                <span className="font-semibold text-sm">{user.name[0]}</span>
                            ) : (
                                <User size={18} strokeWidth={2} />
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
                    {restaurants.map(rest => (
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
                    ))}
                </div>
            </motion.div>

            {/* Minimalist Product Grid */}
            <div className="px-6 mb-10">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-5">Popular Now</h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                    <AnimatePresence mode="popLayout">
                        {filteredProducts.slice(0, 8).map((p, idx) => (
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

            {/* Address Modal */}
            <AnimatePresence>
                {showAddressModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-zinc-100 dark:border-zinc-800"
                        >
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Change Delivery Address</h3>
                            <p className="text-xs text-zinc-500 mb-6">Enter your full street address.</p>
                            
                            <textarea
                                value={newAddress}
                                onChange={(e) => setNewAddress(e.target.value)}
                                placeholder="e.g. 123 Main Street..."
                                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-4 text-sm text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white resize-none h-24 mb-6"
                            />
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAddressModal(false)}
                                    className="flex-1 py-3.5 rounded-xl font-semibold text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 active:scale-95 transition-transform"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!newAddress.trim()) return;
                                        setIsSavingAddress(true);
                                        try {
                                            const response = await addressService.addAddress({ address_line: newAddress, is_default: true });
                                            const updatedAddress = response.data.data.address_line;
                                            
                                            // Update User in Local Storage synchronously
                                            const currentUserData = JSON.parse(localStorage.getItem('user')) || {};
                                            currentUserData.address = updatedAddress;
                                            localStorage.setItem('user', JSON.stringify(currentUserData));
                                            
                                            setUser(currentUserData);
                                            setShowAddressModal(false);
                                        } catch (e) {
                                            alert("Failed to update address.");
                                        } finally {
                                            setIsSavingAddress(false);
                                        }
                                    }}
                                    disabled={!newAddress.trim() || isSavingAddress}
                                    className="flex-[2] py-3.5 rounded-xl font-semibold text-sm bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 active:scale-[0.98] transition-all flex justify-center items-center"
                                >
                                    {isSavingAddress ? (
                                        <div className="w-5 h-5 border-2 border-inherit border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        "Confirm Address"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
