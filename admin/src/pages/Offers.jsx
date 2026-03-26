import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    Zap,
    Plus,
    Trash2,
    Calendar,
    Tag,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Gift,
    IndianRupee,
    ArrowUpRight,
    SearchX,
    X,
    Activity,
    Edit2,
    Loader2,
    Clock,
    Image as ImageIcon,
    Store,
    LayoutGrid,
    Target,
    Sparkles
} from 'lucide-react';

import { useMerchant } from '../contexts/MerchantContext';

const Offers = () => {
    const { selectedMerchantId } = useMerchant();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [generating, setGenerating] = useState(false);

    const initialFormState = {
        title: '',
        description: '',
        banner_url: '',
        discount_type: 'percentage',
        discount_value: '',
        start_date: '',
        end_date: '',
        priority: 0,
        is_active: true,
        restaurant_id: selectedMerchantId || '',
        category_id: '',
        product_id: ''
    };

    const [form, setForm] = useState(initialFormState);

    const generateWithAI = async () => {
        if (!form.title) return toast.error("Enter a title first");
        try {
            setGenerating(true);
            const res = await api.post('/admin/generate-offer-image', { prompt: form.title });
            setForm({ ...form, banner_url: res.data.image_url });
            toast.success("AI Visual Refined!");
        } catch (error) {
            toast.error("AI Engine Offline");
        } finally {
            setGenerating(false);
        }
    };

    useEffect(() => {
        fetchOffers();
        fetchMeta();
    }, [selectedMerchantId]);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const query = selectedMerchantId ? `?restaurant_id=${selectedMerchantId}` : '';
            const res = await api.get(`/offers${query}`);
            setOffers(res.data.data || []);
        } catch (error) {
            console.error("Error fetching offers:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMeta = async () => {
        try {
            const query = selectedMerchantId ? `?restaurant_id=${selectedMerchantId}` : '';
            const [catRes, prodRes] = await Promise.all([
                api.get(`/categories${query}`),
                api.get(`/products${query}`)
            ]);
            setCategories(catRes.data.data || []);
            setProducts(prodRes.data.data || []);
        } catch (error) {
            console.error("Error fetching meta data:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form };
            if (selectedMerchantId && !payload.restaurant_id) {
                payload.restaurant_id = selectedMerchantId;
            }

            if (editingId) {
                await api.put(`/offers/${editingId}`, payload);
            } else {
                await api.post('/offers', payload);
            }
            setShowModal(false);
            setEditingId(null);
            setForm(initialFormState);
            fetchOffers();
            toast.success(editingId ? "Offer updated successfully" : "Offer deployed successfully");
        } catch (error) {
            toast.error("Operation failed");
        }
    };

    const handleDelete = async (id) => {
        toast(
            (t) => (
                <span style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    Retract this live offer?
                    <button onClick={async () => { toast.dismiss(t.id); try { await api.delete(`/offers/${id}`); fetchOffers(); toast.success("Offer removed"); } catch { toast.error("Removal failed"); }}} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:'8px',padding:'6px 14px',fontWeight:900,cursor:'pointer',fontSize:'10px',letterSpacing:'0.1em'}}>REMOVE</button>
                    <button onClick={() => toast.dismiss(t.id)} style={{background:'#27272a',color:'#fff',border:'none',borderRadius:'8px',padding:'6px 14px',fontWeight:900,cursor:'pointer',fontSize:'10px',letterSpacing:'0.1em'}}>CANCEL</button>
                </span>
            ),
            { duration: 6000 }
        );
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-zinc-500 font-medium text-sm animate-pulse tracking-tight">Synchronizing promotion manifests...</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-20 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Live Offers <Zap className="text-amber-500 fill-amber-500" size={20} />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Real-time marketplace promotions & blitz deals.</p>
                </div>
                <button
                    onClick={() => { setEditingId(null); setForm(initialFormState); setShowModal(true); }}
                    className="bg-zinc-900 dark:bg-emerald-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-zinc-900/10 dark:shadow-emerald-500/20 text-[10px] uppercase tracking-[0.2em]"
                >
                    <Plus className="w-4 h-4" />
                    New Offer
                </button>
            </div>

            {/* Offers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {offers.length === 0 ? (
                    <div className="col-span-full py-24 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center opacity-30">
                        <Zap size={48} className="text-zinc-400" />
                        <p className="text-xs font-bold uppercase tracking-widest mt-4 text-zinc-500">No active promotions</p>
                    </div>
                ) : offers.map((offer) => (
                    <motion.div
                        key={offer.id}
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden group"
                    >
                        {/* Banner Preview */}
                        <div className="h-32 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                            {offer.banner_url ? (
                                <img src={offer.banner_url} alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20" />
                            )}
                            <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => {
                                        setEditingId(offer.id);
                                        setForm({
                                            ...offer,
                                            start_date: offer.start_date ? offer.start_date.split('T')[0] : '',
                                            end_date: offer.end_date ? offer.end_date.split('T')[0] : '',
                                            category_id: offer.category_id || '',
                                            product_id: offer.product_id || '',
                                        });
                                        setShowModal(true);
                                    }}
                                    className="p-2 bg-white/90 dark:bg-zinc-900/90 text-zinc-600 dark:text-zinc-300 rounded-lg shadow-lg hover:text-emerald-500"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(offer.id)}
                                    className="p-2 bg-white/90 dark:bg-zinc-900/90 text-zinc-600 dark:text-zinc-300 rounded-lg shadow-lg hover:text-red-500"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${offer.is_active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-500'}`}>
                                    {offer.is_active ? 'Live Now' : 'Draft'}
                                </span>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <h3 className="text-base font-bold text-zinc-900 dark:text-white truncate">{offer.title}</h3>
                                <p className="text-[10px] font-bold text-zinc-400 mt-1 flex items-center gap-1.5 uppercase tracking-wide">
                                    <Store size={10} /> {offer.restaurant?.name || 'Global'}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-[11px] font-black tracking-widest uppercase">
                                    {offer.discount_type === 'percentage' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`}
                                </div>
                                {offer.priority >= 10 && (
                                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1.5 rounded-lg border border-amber-100 dark:border-amber-900/40">
                                        <Zap size={10} className="text-amber-500 fill-amber-500" />
                                        <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Hot Deal</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Targeting</span>
                                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-1 truncate uppercase">
                                        {offer.product ? (
                                            <><Tag size={10} /> {offer.product.name}</>
                                        ) : offer.category ? (
                                            <><LayoutGrid size={10} /> {offer.category.name}</>
                                        ) : (
                                            <><Store size={10} /> Store-wide</>
                                        )}
                                    </span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Performance</span>
                                    <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-1 uppercase tracking-tight">
                                         {offer.usage_count} Clicks
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{editingId ? 'Modify Promotion' : 'Configure New Offer'}</h2>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Global & Merchant Targeted Deals</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Column 1: Identity & Offer Structure */}
                                    <div className="space-y-6">
                                        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] block">Offer Title</label>
                                                <input required type="text" placeholder="E.G. ORGANIC HARVEST SALE" className="w-full px-5 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-emerald-500 transition-colors dark:text-white font-bold text-xs uppercase tracking-widest shadow-sm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value.toUpperCase() })} />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] block">Banner Visual</label>
                                                <div className="relative group">
                                                    <input type="text" placeholder="HTTPS://IMAGE-URL.JPG" className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-emerald-500 transition-colors dark:text-white font-bold text-[10px] uppercase tracking-wider shadow-sm" value={form.banner_url} onChange={(e) => setForm({ ...form, banner_url: e.target.value })} />
                                                    <ImageIcon size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                                    <button 
                                                        type="button" 
                                                        onClick={generateWithAI}
                                                        disabled={generating || !form.title}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg hover:rotate-12 transition-all disabled:opacity-30 disabled:rotate-0"
                                                        title="Generate Visual with AI"
                                                    >
                                                        {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="fill-current" />}
                                                    </button>
                                                </div>
                                                {form.banner_url && (
                                                    <div className="mt-3 relative h-28 w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2">
                                                        <img src={form.banner_url} alt="Preview" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                                        <button type="button" onClick={() => setForm({ ...form, banner_url: '' })} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md transition-all"><X size={12} /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] block">Discount Type</label>
                                                    <select className="w-full px-4 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-emerald-500 transition-colors dark:text-white font-bold text-[10px] uppercase shadow-sm" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
                                                        <option value="percentage">Percentage (%)</option>
                                                        <option value="flat">Flat Cash (₹)</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] block">Discount Value</label>
                                                    <input required type="number" className="w-full px-5 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-emerald-500 transition-colors dark:text-white font-bold text-xs shadow-sm" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Targeting & Timeline */}
                                    <div className="space-y-6">
                                        <div className="bg-zinc-50 dark:bg-zinc-950/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 space-y-5">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] block">Target Category</label>
                                                <div className="relative">
                                                    <select className="w-full pl-12 pr-5 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-emerald-500 transition-colors dark:text-white font-bold text-[10px] uppercase appearance-none shadow-sm" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value, product_id: '' })}>
                                                        <option value="">Global / Select Category</option>
                                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name} {!selectedMerchantId && `(${c.restaurant?.name || 'Global'})`}</option>)}
                                                    </select>
                                                    <LayoutGrid size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] block">Target Product</label>
                                                <div className="relative">
                                                    <select disabled={!form.category_id} className="w-full pl-12 pr-5 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-emerald-500 transition-colors dark:text-white font-bold text-[10px] uppercase appearance-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })}>
                                                        <option value="">{form.category_id ? 'All Products in Category' : 'Select Category First'}</option>
                                                        {products.filter(p => String(p.category_id) === String(form.category_id)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                    </select>
                                                    <Tag size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                                </div>
                                                {form.category_id && products.filter(p => String(p.category_id) === String(form.category_id)).length === 0 && (
                                                    <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mt-2 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">No catalog items linked to this category ID ({form.category_id}).</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-zinc-50 dark:bg-zinc-950/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] block">Campaign Start</label>
                                                    <div className="relative">
                                                        <input required type="date" className="w-full pr-2 pl-12 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-emerald-500 transition-colors dark:text-white font-bold text-[13px] uppercase shadow-sm tracking-tight" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                                                        <Calendar size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] block">Campaign Expiry</label>
                                                    <div className="relative">
                                                        <input required type="date" className="w-full pr-2 pl-12 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-emerald-500 transition-colors dark:text-white font-bold text-[13px] uppercase shadow-sm tracking-tight" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                                                        <Calendar size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] block">Marketplace Priority (0-100)</label>
                                                <input type="number" className="w-full px-5 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-emerald-500 transition-colors dark:text-white font-bold text-xs shadow-sm" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-600 transition-colors">Abort Mission</button>
                                    <button type="submit" className="flex-[3] py-4 bg-zinc-900 dark:bg-emerald-500 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-zinc-900/20 hover:opacity-90 transition-all flex items-center justify-center gap-3">
                                        <CheckCircle2 size={18} /> {editingId ? 'Update Promotion' : 'Deploy Live Offer'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Offers;
