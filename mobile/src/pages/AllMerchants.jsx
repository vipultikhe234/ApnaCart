import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { restaurantService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, 
    Search, 
    Star, 
    Clock, 
    MapPin, 
    Filter,
    Activity,
    ArrowRight
} from 'lucide-react';

const AllMerchants = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, rating, nearby

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await restaurantService.list();
                setRestaurants(res.data.data);
            } catch (e) {
                console.error("Failed to fetch merchants", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const filtered = restaurants.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
        if (filter === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
    });

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#0A0A0A] pb-24">
            {/* Dark Premium Header */}
            <div className="sticky top-0 z-50 bg-[#0A0A0A] text-white pt-12 pb-6 px-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">FoodHub Network</h1>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] text-center">Premium Merchant Partners</p>
                    </div>
                    <div className="w-10 h-10"></div>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search our restaurant network..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 text-sm font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-600"
                    />
                </div>
            </div>

            <div className="px-6 mt-6">
                {/* Filters */}
                <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-1">
                    {[
                        { id: 'all', label: 'All Partners', icon: Activity },
                        { id: 'rating', label: 'Top Rated', icon: Star },
                        { id: 'nearby', label: 'Near You', icon: MapPin }
                    ].map(f => {
                        const Icon = f.icon;
                        const isApp = filter === f.id;
                        return (
                            <button 
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${
                                    isApp 
                                    ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:text-zinc-900' 
                                    : 'bg-white border-zinc-200 text-zinc-500 dark:bg-zinc-900 dark:border-zinc-800'
                                }`}
                            >
                                <Icon size={14} strokeWidth={2.5} />
                                {f.label}
                            </button>
                        );
                    })}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-900 rounded-[28px] animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5">
                        <AnimatePresence mode='popLayout'>
                            {sorted.map((merchant, idx) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={merchant.id}
                                    onClick={() => navigate(`/restaurant/${merchant.id}`)}
                                    className="group relative bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden border border-zinc-100 dark:border-zinc-800/60 shadow-sm active:scale-[0.98] transition-all"
                                >
                                    <div className="p-4 flex gap-4">
                                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                                            <img 
                                                src={merchant.image_url || 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=400&auto=format&fit=crop'} 
                                                alt={merchant.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            {merchant.is_busy && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <span className="text-[8px] font-black uppercase text-white tracking-widest bg-red-500 px-2 py-1 rounded-full shadow-lg">Busy</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 py-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-zinc-900 dark:text-white truncate pr-2">{merchant.name}</h3>
                                                <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg">
                                                    <Star size={10} className="fill-emerald-500 text-emerald-500" />
                                                    <span className="text-[10px] font-black text-emerald-600">{merchant.rating || '4.5'}</span>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-zinc-400 font-medium truncate mb-3 flex items-center gap-1">
                                                <MapPin size={10} /> {merchant.address || 'Pune, Maharashtra'}
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                                                    <Clock size={12} className="text-emerald-500" />
                                                    {merchant.opening_time || '09:00'} - {merchant.closing_time || '22:00'}
                                                </div>
                                                <div className="w-1 h-1 bg-zinc-300 rounded-full"></div>
                                                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                                    Open Now
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300">
                                        <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-zinc-900 shadow-xl">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {!loading && sorted.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Activity size={24} className="text-zinc-300" />
                        </div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">No Merchants Found</h3>
                        <p className="text-xs text-zinc-500">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllMerchants;
