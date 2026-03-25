import React, { useState, useEffect } from 'react';
import { restaurantService } from '../services/api';
import { 
    Store, 
    Search, 
    Plus, 
    MoreVertical, 
    MapPin, 
    Phone, 
    Clock, 
    ShieldCheck, 
    ShieldAlert,
    ExternalLink,
    Loader2,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Edit3,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    
    const initialFormState = {
        merchant_name: '',
        email: '',
        password: '',
        restaurant_name: '',
        address: '',
        image: '',
        opening_time: '09:00:00',
        closing_time: '22:00:00'
    };
    
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const res = await restaurantService.listAll();
            setRestaurants(res.data.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            setRestaurants([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        setUpdatingId(id);
        try {
            await restaurantService.toggleStatus(id);
            setRestaurants(prev => prev.map(r => 
                r.id === id ? { ...r, is_active: !r.is_active } : r
            ));
        } catch (error) {
            alert("Failed to update status. Please try again.");
        } finally {
            setUpdatingId(null);
        }
    };

    const openEditModal = (rest) => {
        setEditingId(rest.id);
        setFormData({
            merchant_name: rest.merchant?.name || '',
            email: rest.merchant?.email || '',
            password: '', 
            restaurant_name: rest.name || '',
            address: rest.address || '',
            image: rest.image || '',
            opening_time: rest.opening_time || '09:00:00',
            closing_time: rest.closing_time || '22:00:00'
        });
        setIsModalOpen(true);
    };

    const handleSaveMerchant = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (editingId) {
                const res = await restaurantService.updateMerchant(editingId, formData);
                setRestaurants(prev => prev.map(r => r.id === editingId ? res.data.restaurant : r));
            } else {
                const res = await restaurantService.createMerchant(formData);
                setRestaurants(prev => [res.data.restaurant, ...prev]);
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData(initialFormState);
        } catch (error) {
            const msg = error.response?.data?.message || "Error saving data.";
            alert(msg);
        } finally {
            setFormLoading(false);
        }
    };

    const filtered = (restaurants || []).filter(r => 
        (r?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r?.address || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Loading Restaurants...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-none uppercase">Restaurants</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-[0.2em] mt-3">Manage all merchant partners and outlets.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={fetchRestaurants}
                        className="p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 hover:text-emerald-500 transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                    
                    <div className="relative group hidden sm:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                        <input 
                            type="text"
                            placeholder="Search..."
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-12 pr-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider outline-none focus:ring-4 focus:ring-emerald-500/5 w-64 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={() => { setEditingId(null); setFormData(initialFormState); setIsModalOpen(true); }}
                        className="bg-emerald-500 text-white px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all outline-none"
                    >
                        <Plus size={18} strokeWidth={3} />
                        Add Restaurant
                    </button>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-8 overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-auto"
                        >
                            <div className="p-8 sm:p-12 overflow-y-auto max-h-[90vh] custom-scrollbar">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight leading-none">
                                            {editingId ? 'Edit Restaurant' : 'Add New Restaurant'}
                                        </h2>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">
                                            {editingId ? 'Update details below.' : 'Fill in the details for the new merchant.'}
                                        </p>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                        <XCircle size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSaveMerchant} className="space-y-10" autoComplete="off">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Owner Details</p>
                                            <div className="space-y-4">
                                                <input required name="val_name" type="text" placeholder="Full Name" className="w-full h-14 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700/50 rounded-2xl px-6 text-[14px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-500 shadow-sm" value={formData.merchant_name} onChange={(e) => setFormData({...formData, merchant_name: e.target.value})} />
                                                <input required name="val_email" type="email" placeholder="Email Address" className="w-full h-14 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700/50 rounded-2xl px-6 text-[14px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-500 shadow-sm" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                                <input name="val_pass" type="password" placeholder={editingId ? "New Password (Optional)" : "Password"} className="w-full h-14 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700/50 rounded-2xl px-6 text-[14px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-500 shadow-sm" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!editingId} autoComplete="new-password" />
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Restaurant Details</p>
                                            <div className="space-y-4">
                                                <input required name="val_rest" type="text" placeholder="Restaurant Name" className="w-full h-14 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700/50 rounded-2xl px-6 text-[14px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-500 shadow-sm" value={formData.restaurant_name} onChange={(e) => setFormData({...formData, restaurant_name: e.target.value})} />
                                                <input required name="val_addr" type="text" placeholder="Address" className="w-full h-14 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700/50 rounded-2xl px-6 text-[14px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-500 shadow-sm" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                                                <input name="val_img" type="text" placeholder="Image URL" className="w-full h-14 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700/50 rounded-2xl px-6 text-[14px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-500 shadow-sm" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
                                        <button 
                                            disabled={formLoading}
                                            type="submit" 
                                            className="w-full h-16 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                        >
                                            {formLoading ? <Loader2 size={24} className="animate-spin" /> : <>{editingId ? 'Update Restaurant' : 'Save Restaurant'} <ArrowRight size={20} strokeWidth={3} /></>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {filtered.map((rest) => (
                    <motion.div 
                        key={rest.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500 relative"
                    >
                        {/* Status Header */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                            <img 
                                src={rest.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'} 
                                alt={rest.name}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                            />
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-xl border ${
                                    rest.is_active 
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/10' 
                                    : 'bg-rose-500/20 text-rose-400 border-rose-500/20'
                                }`}>
                                    {rest.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            
                            <button 
                                onClick={() => openEditModal(rest)}
                                className="absolute top-6 right-6 h-12 w-12 bg-white/20 hover:bg-emerald-500 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white transition-all group/edit z-10"
                            >
                                <Edit3 size={18} className="group-hover/edit:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            <div className="flex items-start justify-between mb-8">
                                <div className="min-w-0">
                                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate group-hover:text-emerald-500 transition-colors leading-none">
                                        {rest.name}
                                    </h3>
                                    <div className="flex items-center gap-2.5 mt-3">
                                        <div className={`w-2 h-2 rounded-full ${rest.is_open ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500'} animate-pulse`}></div>
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                                            {rest.is_open ? 'Open Now' : 'Closed'}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center border border-zinc-100 dark:border-zinc-700 text-zinc-400 group-hover:text-emerald-500 group-hover:bg-emerald-500/5 group-hover:border-emerald-500/20 transition-all">
                                    <Store size={24} />
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
                                    <MapPin size={16} className="shrink-0 text-emerald-500" />
                                    <span className="text-xs font-bold uppercase tracking-tight truncate">{rest.address}</span>
                                </div>
                                <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
                                    <Clock size={16} className="shrink-0 text-blue-500" />
                                    <span className="text-xs font-bold uppercase tracking-tight font-mono">{rest.opening_time?.slice(0,5)} - {rest.closing_time?.slice(0,5)}</span>
                                </div>
                                {rest.merchant && (
                                    <div className="mt-6 flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 transition-all group-hover:bg-white dark:group-hover:bg-zinc-800">
                                        <ShieldCheck size={18} className="shrink-0 text-emerald-500" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1.5">Owner</p>
                                            <p className="text-xs font-black text-zinc-900 dark:text-white truncate uppercase">{rest.merchant.name}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleToggleStatus(rest.id)}
                                disabled={updatingId === rest.id}
                                className={`w-full py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border-2 ${
                                    rest.is_active 
                                    ? 'bg-transparent text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white' 
                                    : 'bg-emerald-500 text-white border-transparent hover:bg-emerald-400'
                                }`}
                            >
                                {updatingId === rest.id ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : rest.is_active ? (
                                    <>Deactivate</>
                                ) : (
                                    <>Activate</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Restaurants;
