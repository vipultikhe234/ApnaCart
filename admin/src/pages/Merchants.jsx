import React, { useState, useEffect } from 'react';
import { MerchantService, locationService } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
    Store, 
    Search, 
    Plus, 
    MapPin, 
    Clock, 
    ShieldCheck, 
    Loader2,
    XCircle,
    ArrowRight,
    Edit3,
    Globe,
    RefreshCw,
    Eye,
    Mail,
    Phone,
    Calendar,
    ChevronRight,
    SearchX,
    UserCircle,
    Info,
    Share2,
    Settings,
    Sparkles,
    Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useMerchant } from '../contexts/MerchantContext';

const Merchants = () => {
    const { setMerchants: setGlobalMerchants } = useMerchant();
    const [merchants, setMerchantsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewingMerchant, setViewingMerchant] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    
    const initialFormState = {
        merchant_name: '',
        email: '',
        password: '',
        Merchant_name: '',
        address: '',
        country_id: '',
        state_id: '',
        city_id: '',
        image: '',
        opening_time: '09:00:00',
        closing_time: '22:00:00',
        delivery_charge: 0,
        packaging_charge: 0,
        platform_fee: 0,
        delivery_charge_tax: 0,
        packaging_charge_tax: 0,
        platform_fee_tax: 0,
        latitude: '',
        longitude: '',
        delivery_charge_type: 'fixed',
        delivery_charge_per_km: 0,
        max_delivery_distance: 0
    };
    
    const [formData, setFormData] = useState(initialFormState);
    const [countries, setCountries] = useState([]);
    const [formStates, setFormStates] = useState([]);
    const [formCities, setFormCities] = useState([]);

    useEffect(() => {
        fetchMerchants();
        locationService.getCountries().then(r => setCountries(r.data)).catch(() => {});
    }, []);

    const fetchMerchants = async () => {
        try {
            setLoading(true);
            const res = await MerchantService.listAll();
            const data = res.data.data || [];
            setMerchantsList(data);
            setGlobalMerchants(data); // Sync global context
        } catch (error) {
            console.error("Error fetching data:", error);
            setMerchantsList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        setUpdatingId(id);
        try {
            await MerchantService.toggleStatus(id);
            setMerchantsList(prev => prev.map(r => 
                r.id === id ? { ...r, is_active: !r.is_active } : r
            ));
            toast.success("Status updated successfully.");
        } catch (error) {
            toast.error("Failed to update status. Please try again.");
        } finally {
            setUpdatingId(null);
        }
    };

    const openEditModal = (rest) => {
        setEditingId(rest.id);
        setFormData({
            merchant_name: rest.user?.name || '',
            email: rest.user?.email || '',
            password: '', 
            Merchant_name: rest.name || '',
            address: rest.address || '',
            country_id: rest.country_id || '',
            state_id: rest.state_id || '',
            city_id: rest.city_id || '',
            image: rest.image || '',
            opening_time: rest.opening_time || '09:00:00',
            closing_time: rest.closing_time || '22:00:00',
            delivery_charge: rest.other_charges?.delivery_charge || 0,
            packaging_charge: rest.other_charges?.packaging_charge || 0,
            platform_fee: rest.other_charges?.platform_fee || 0,
            delivery_charge_tax: rest.other_charges?.delivery_charge_tax || 0,
            packaging_charge_tax: rest.other_charges?.packaging_charge_tax || 0,
            platform_fee_tax: rest.other_charges?.platform_fee_tax || 0,
            latitude: rest.latitude || '',
            longitude: rest.longitude || '',
            delivery_charge_type: rest.other_charges?.delivery_charge_type || 'fixed',
            delivery_charge_per_km: rest.other_charges?.delivery_charge_per_km || 0,
            max_delivery_distance: rest.other_charges?.max_delivery_distance || 0
        });
        if (rest.country_id) locationService.getStates(rest.country_id).then(r => setFormStates(r.data));
        if (rest.state_id) locationService.getCities(rest.state_id).then(r => setFormCities(r.data));
        setIsModalOpen(true);
    };

    const handleFormCountry = async (cId) => {
        setFormData(d => ({ ...d, country_id: cId, state_id: '', city_id: '' }));
        setFormStates([]); setFormCities([]);
        if (!cId) return;
        const r = await locationService.getStates(cId);
        setFormStates(r.data);
    };

    const handleFormState = async (sId) => {
        setFormData(d => ({ ...d, state_id: sId, city_id: '' }));
        setFormCities([]);
        if (!sId) return;
        const r = await locationService.getCities(sId);
        setFormCities(r.data);
    };

    const handleAIGenImage = async () => {
        if (!formData.Merchant_name) return toast.error("Enter a name first");
        setFormLoading(true);
        try {
            const { fetchRealFoodImage } = await import('../utils/aiHelpers');
            const url = await fetchRealFoodImage(formData.Merchant_name, true, formData.address, 'merchant');
            setFormData(prev => ({ ...prev, image: url }));
            toast.success("AI Image generated successfully");
        } catch (error) {
            console.error("AI Image Generation Error:", error);
            toast.error("AI Image generation failed");
        } finally {
            setFormLoading(false);
        }
    };

    const handleSaveMerchant = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (editingId) {
                const res = await MerchantService.updateMerchant(editingId, formData);
                const updated = res.data.merchant || res.data.Merchant; // Handle both cases for safety
                if (updated) {
                    setMerchantsList(prev => prev.map(r => r.id === editingId ? updated : r));
                    setGlobalMerchants(prev => prev.map(r => r.id === editingId ? updated : r));
                }
            } else {
                const res = await MerchantService.createMerchant(formData);
                const newlyCreated = res.data.merchant || res.data.Merchant;
                if (newlyCreated) {
                    setMerchantsList(prev => [newlyCreated, ...prev]);
                    setGlobalMerchants(prev => [newlyCreated, ...prev]);
                }
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData(initialFormState);
            toast.success(editingId ? "Merchant updated successfully!" : "Merchant created successfully!");
        } catch (error) {
            const msg = error.response?.data?.message || "Error saving data.";
            toast.error(msg);
        } finally {
            setFormLoading(false);
        }
    };

    const handleViewDetail = (merchant) => {
        setViewingMerchant(merchant);
        setIsViewModalOpen(true);
    };

    const filtered = (merchants || []).filter(r => 
        (r?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r?.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r?.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Loading Merchants...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-sans pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-none uppercase">Merchant Partners</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">Enterprise-wide merchant fleet management.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={fetchMerchants}
                        className="p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 hover:text-emerald-500 transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                    
                    <div className="relative group hidden sm:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                        <input 
                            type="text"
                            placeholder="SEARCH MERCHANTS..."
                            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-12 pr-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider outline-none focus:ring-4 focus:ring-emerald-500/5 w-64 transition-all dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={() => { setEditingId(null); setFormData(initialFormState); setIsModalOpen(true); }}
                        className="bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all outline-none"
                    >
                        <Plus size={18} strokeWidth={3} />
                        Add Merchant
                    </button>
                </div>
            </div>

            {/* ── Table List View ── */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50/50 dark:bg-zinc-800/60 text-zinc-400 text-[9px] uppercase tracking-[0.2em] font-black border-b border-zinc-100 dark:border-zinc-800">
                                <th className="px-8 py-5">Merchant / Outlet</th>
                                <th className="py-5 px-6">Status</th>
                                <th className="py-5 px-6">Location</th>
                                <th className="py-5 px-6">Owner</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-30">
                                            <SearchX size={48} className="text-zinc-400" />
                                            <p className="text-xs font-black uppercase tracking-widest mt-4 text-zinc-500">No merchants found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((rest) => (
                                    <motion.tr
                                        key={rest.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="group hover:bg-zinc-50/40 dark:hover:bg-zinc-800/40 transition-colors"
                                    >
                                        {/* Merchant Name + Image */}
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm shrink-0">
                                                    <img 
                                                        src={rest.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'} 
                                                        alt={rest.name}
                                                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-125"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-zinc-900 dark:text-white tracking-tight text-[15px] mb-1 group-hover:text-emerald-500 transition-colors leading-none truncate">{rest.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={10} className="text-zinc-400" />
                                                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest font-mono">
                                                            {rest.opening_time?.slice(0,5)} - {rest.closing_time?.slice(0,5)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="py-5 px-6">
                                            <div className="flex flex-col gap-1.5">
                                                <button 
                                                    onClick={() => handleToggleStatus(rest.id)}
                                                    disabled={updatingId === rest.id}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border transition-all ${
                                                        rest.is_active 
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40' 
                                                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 border-rose-100 dark:border-rose-900/40'
                                                    }`}
                                                >
                                                    {updatingId === rest.id ? <Loader2 size={10} className="animate-spin" /> : <div className={`w-1.5 h-1.5 rounded-full ${rest.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />}
                                                    {rest.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                                <span className={`text-[8px] font-black uppercase tracking-widest ml-1 ${rest.is_open ? 'text-blue-500' : 'text-zinc-400'}`}>
                                                    {rest.is_open ? '● Accepting Orders' : '● Closed'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Location */}
                                        <td className="py-5 px-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 text-[10px] uppercase font-black tracking-tight">
                                                    <MapPin size={11} className="text-rose-500 shrink-0" />
                                                    <span className="truncate max-w-[200px]">{rest.address}</span>
                                                </div>
                                                {rest.city && (
                                                    <div className="flex items-center gap-2 text-zinc-400 text-[9px] uppercase font-bold tracking-widest ml-5">
                                                        <span>{rest.city.name}, {rest.state?.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Owner Info */}
                                        <td className="py-5 px-6">
                                            {rest.user ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-700 text-zinc-500 font-black text-[10px] shrink-0 uppercase">
                                                        {rest.user.name?.[0]}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-black text-zinc-900 dark:text-white leading-none mb-1 truncate">{rest.user.name}</p>
                                                        <p className="text-[9px] text-zinc-400 font-medium truncate">{rest.user.email}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">—</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleViewDetail(rest)}
                                                    className="p-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-500 hover:text-white rounded-xl text-zinc-500 dark:text-zinc-400 transition-all shadow-sm"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => openEditModal(rest)}
                                                    className="p-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-500 hover:text-white rounded-xl text-zinc-500 dark:text-zinc-400 transition-all shadow-sm"
                                                    title="Edit Merchant"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Add/Edit Modal (Existing) ── */}
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
                                            {editingId ? 'Edit Merchant' : 'Add New Merchant'}
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
                                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Merchant Outlet</p>
                                            <div className="space-y-4">
                                                <input required name="val_rest" type="text" placeholder="Merchant / Outlet Name" className="w-full h-14 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700/50 rounded-2xl px-6 text-[14px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-500 shadow-sm" value={formData.Merchant_name} onChange={(e) => setFormData({...formData, Merchant_name: e.target.value})} />
                                                <input required name="val_addr" type="text" placeholder="Street Address" className="w-full h-14 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700/50 rounded-2xl px-6 text-[14px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-500 shadow-sm" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                                                <div className="flex gap-4">
                                                    <div className="flex-1 relative">
                                                        <input name="val_img" type="text" placeholder="Image URL (optional)" className="w-full h-14 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700/50 rounded-2xl px-6 text-[14px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-500 shadow-sm pr-14" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
                                                        {formLoading && (
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                                                            </div>
                                                        )}
                                                        {!formLoading && (
                                                            <button 
                                                                type="button"
                                                                onClick={handleAIGenImage}
                                                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg active:scale-90"
                                                                title="Generate AI Image"
                                                            >
                                                                <Sparkles size={14} className="animate-pulse" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    {formData.image && (
                                                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shadow-sm shrink-0">
                                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financial Config (Fees & Taxes) */}
                                    <div className="p-8 bg-zinc-50 dark:bg-zinc-800/30 rounded-[2rem] border-2 border-dashed border-zinc-200 dark:border-zinc-700/50 space-y-8">
                                        <div className="flex items-center gap-3">
                                            <Settings size={18} className="text-zinc-400" />
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Financial & Performance Metrics</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            {/* Charges Section */}
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Pricing & Fees (₹)</label>
                                                </div>
                                                <div className="space-y-4">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Delivery Strategy</label>
                                                            <select className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-[11px] font-bold outline-none focus:border-emerald-500 text-zinc-900 dark:text-white" value={formData.delivery_charge_type} onChange={e => setFormData({...formData, delivery_charge_type: e.target.value})}>
                                                                <option value="fixed">Fixed Rate</option>
                                                                <option value="distance">Distance Based (km)</option>
                                                            </select>
                                                        </div>
                                                        
                                                        {formData.delivery_charge_type === 'distance' ? (
                                                            <div className="flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                                <div className="flex-1 space-y-1.5">
                                                                    <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Rate (₹/km)</label>
                                                                    <input type="number" step="0.1" placeholder="e.g. 5.0" className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-[11px] font-bold outline-none focus:border-emerald-500 text-zinc-900 dark:text-white" value={formData.delivery_charge_per_km} onChange={e => setFormData({...formData, delivery_charge_per_km: e.target.value})} />
                                                                </div>
                                                                <div className="flex-1 space-y-1.5">
                                                                    <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Max dist</label>
                                                                    <input type="number" step="0.1" placeholder="e.g. 10" className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-[11px] font-bold outline-none focus:border-emerald-500 text-zinc-900 dark:text-white" value={formData.max_delivery_distance} onChange={e => setFormData({...formData, max_delivery_distance: e.target.value})} />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-1.5">
                                                                <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Flat Delivery Fee</label>
                                                                <input type="number" step="0.01" placeholder="e.g. 20.00" className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-[11px] font-bold outline-none focus:border-emerald-500 text-zinc-900 dark:text-white" value={formData.delivery_charge} onChange={e => setFormData({...formData, delivery_charge: e.target.value})} />
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Packing Fee</label>
                                                                <input type="number" step="0.01" placeholder="₹" className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-[11px] font-bold outline-none focus:border-emerald-500 text-zinc-900 dark:text-white" value={formData.packaging_charge} onChange={e => setFormData({...formData, packaging_charge: e.target.value})} />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Platform Fee</label>
                                                                <input type="number" step="0.01" placeholder="₹" className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-[11px] font-bold outline-none focus:border-emerald-500 text-zinc-900 dark:text-white" value={formData.platform_fee} onChange={e => setFormData({...formData, platform_fee: e.target.value})} />
                                                            </div>
                                                        </div>
                                                </div>
                                            </div>

                                            {/* Taxes Section */}
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Taxation & GST (%)</label>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Delivery Tax</label>
                                                            <input type="number" step="0.1" placeholder="%" className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-[11px] font-bold outline-none focus:border-amber-500 text-zinc-900 dark:text-white" value={formData.delivery_charge_tax} onChange={e => setFormData({...formData, delivery_charge_tax: e.target.value})} />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Packing Tax</label>
                                                            <input type="number" step="0.1" placeholder="%" className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-[11px] font-bold outline-none focus:border-amber-500 text-zinc-900 dark:text-white" value={formData.packaging_charge_tax} onChange={e => setFormData({...formData, packaging_charge_tax: e.target.value})} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Service/Platform Tax (%)</label>
                                                        <input type="number" step="0.1" placeholder="e.g. 18.0" className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-[11px] font-bold outline-none focus:border-amber-500 text-zinc-900 dark:text-white" value={formData.platform_fee_tax} onChange={e => setFormData({...formData, platform_fee_tax: e.target.value})} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location Row */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Location <span className="text-zinc-400 font-bold">(Optional — merchant can set later)</span></p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <select value={formData.country_id} onChange={e => handleFormCountry(e.target.value)} className="w-full h-14 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700/50 rounded-2xl px-4 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all">
                                                <option value="">Country</option>
                                                {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                            <select value={formData.state_id} onChange={e => handleFormState(e.target.value)} disabled={!formData.country_id} className="w-full h-14 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700/50 rounded-2xl px-4 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all disabled:opacity-40">
                                                <option value="">State</option>
                                                {formStates.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                            <select value={formData.city_id} onChange={e => setFormData({...formData, city_id: e.target.value})} disabled={!formData.state_id} className="w-full h-14 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700/50 rounded-2xl px-4 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all disabled:opacity-40">
                                                <option value="">City</option>
                                                {formCities.map(ci => <option key={ci.id} value={ci.id}>{ci.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
                                        <button 
                                            disabled={formLoading}
                                            type="submit" 
                                            className="w-full h-16 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                        >
                                            {formLoading ? <Loader2 size={24} className="animate-spin" /> : <>{editingId ? 'Update Merchant' : 'Save Merchant'} <ArrowRight size={20} strokeWidth={3} /></>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Detail View Modal (New) ── */}
            <AnimatePresence>
                {isViewModalOpen && viewingMerchant && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 sm:p-8 overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsViewModalOpen(false)}
                            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 50 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-auto"
                        >
                            {/* Merchant Banner */}
                            <div className="relative h-64 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                <img 
                                    src={viewingMerchant.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'} 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-8 left-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-3xl p-1 shadow-2xl">
                                            <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 rounded-[1.25rem] flex items-center justify-center text-zinc-400">
                                                <Store size={32} />
                                            </div>
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none mb-3">
                                                {viewingMerchant.name}
                                            </h2>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                    viewingMerchant.is_active 
                                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' 
                                                        : 'bg-rose-500/20 text-rose-400 border-rose-500/20'
                                                }`}>
                                                    {viewingMerchant.is_active ? '● Active Partner' : '● Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setIsViewModalOpen(false)} className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl text-white transition-all">
                                    <XCircle size={28} />
                                </button>
                            </div>

                            {/* Info Grid */}
                            <div className="p-10 lg:p-12 grid grid-cols-1 md:grid-cols-3 gap-10">
                                {/* Section 1: Core Logistics */}
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-emerald-500">
                                            <Info size={16} strokeWidth={3} />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Outlet Info</p>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-zinc-400"><MapPin size={18} /></div>
                                                <div>
                                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Location</p>
                                                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed uppercase">
                                                        {viewingMerchant.address} <br/>
                                                        {viewingMerchant.city?.name}, {viewingMerchant.state?.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-zinc-400"><Clock size={18} /></div>
                                                <div>
                                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Operating Hours</p>
                                                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest font-mono">
                                                        {viewingMerchant.opening_time?.slice(0,5)} - {viewingMerchant.closing_time?.slice(0,5)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Owner / Contact */}
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-blue-500">
                                            <UserCircle size={16} strokeWidth={3} />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Owner Profiles</p>
                                        </div>
                                        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 space-y-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-zinc-900 font-black text-sm uppercase">
                                                    {viewingMerchant.user?.name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-zinc-900 dark:text-white leading-none mb-1.5 uppercase">{viewingMerchant.user?.name}</p>
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[8px] font-black uppercase tracking-widest w-fit">
                                                        <ShieldCheck size={8} /> Verified Partner
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-3 pt-2">
                                                <div className="flex items-center gap-3 text-zinc-500">
                                                    <Mail size={14} className="shrink-0" />
                                                    <span className="text-[11px] font-bold truncate">{viewingMerchant.user?.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-zinc-500">
                                                    <Phone size={14} className="shrink-0" />
                                                    <span className="text-[11px] font-bold tracking-widest">{viewingMerchant.user?.phone || '+1 XXX XXX XXXX'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Performance / Stats */}
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-rose-500">
                                            <Settings size={16} strokeWidth={3} />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Node Operations</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-5 bg-zinc-50 dark:bg-zinc-800/30 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800">
                                                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 text-center">Status</p>
                                                <p className={`text-[10px] font-black text-center uppercase tracking-widest ${viewingMerchant.is_open ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {viewingMerchant.is_open ? 'LIVE' : 'CLOSED'}
                                                </p>
                                            </div>
                                            <div className="p-5 bg-zinc-50 dark:bg-zinc-800/30 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800">
                                                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 text-center">Joined</p>
                                                <p className="text-[10px] font-black text-zinc-900 dark:text-white text-center uppercase tracking-widest">
                                                    {new Date(viewingMerchant.user?.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <button className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
                                            <Share2 size={16} /> Share Partner Node
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Merchants;

