import React, { useState, useEffect, useRef } from 'react';
import api, { productService, MerchantService } from '../services/api';
import { fetchRealFoodImage } from '../utils/aiHelpers';
import {
    X,
    Sparkles,
    Plus,
    Edit2,
    Trash2,
    Image as ImageIcon,
    LayoutGrid,
    CheckCircle2,
    AlertCircle,
    Activity,
    Search,
    Loader2,
    Filter,
    Store,
    ChevronDown,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import { useMerchant } from '../contexts/MerchantContext';

const Categories = () => {
    const { selectedMerchantId, merchants: Merchants } = useMerchant();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imgLoading, setImgLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const debounceRef = useRef(null);

    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const isMerchant = user.role === 'merchant' || user.role === 'Merchant';

    const [newCategory, setNewCategory] = useState({
        name: '', image: '', image_url: '', status: true, merchant_id: ''
    });

    // SYNC NEW CATEGORY WITH SELECTED MERCHANT
    useEffect(() => {
        if (showModal && !editingId && selectedMerchantId) {
            setNewCategory(prev => ({ ...prev, merchant_id: selectedMerchantId }));
        }
    }, [showModal, selectedMerchantId, editingId]);

    useEffect(() => { 
        fetchData(); 
    }, [selectedMerchantId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const query = selectedMerchantId ? `?merchant_id=${selectedMerchantId}` : '';
            const res = await api.get(`/categories${query}`);
            const data = res.data.data || res.data || [];
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleNameChange = async (e) => {
        const name = e.target.value;
        setNewCategory(prev => ({ ...prev, name }));
        if (editingId) return;
        clearTimeout(debounceRef.current);
        if (!name.trim()) {
            setNewCategory(prev => ({ ...prev, name, image: '', image_url: '' }));
            setImgLoading(false);
            return;
        }
        setImgLoading(true);
        debounceRef.current = setTimeout(async () => {
            const url = await fetchRealFoodImage(name, false, '', 'category');
            setNewCategory(prev => ({ ...prev, image: url, image_url: url }));
            setImgLoading(false);
        }, 1500);
    };

    const handleRetryImage = async () => {
        if (!newCategory.name.trim()) return;
        setImgLoading(true);
        const url = await fetchRealFoodImage(newCategory.name, true, '', 'category');
        setNewCategory(prev => ({ ...prev, image: url, image_url: url }));
        setImgLoading(false);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            setUploading(true);
            const res = await productService.uploadImage(formData);
            const path = res.data.path;
            const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
            setNewCategory(prev => ({
                ...prev,
                image: path,
                image_url: `${baseUrl}/storage/${path}`,
            }));
            toast.success('Image uploaded');
        } catch {
            toast.error('Upload failed.');
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (cat) => {
        setEditingId(cat.id);
        const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
        setNewCategory({
            name: cat.name,
            image: cat.image || '',
            image_url: cat.image ? (cat.image.startsWith('http') ? cat.image : `${baseUrl}/storage/${cat.image}`) : '',
            status: cat.status ?? true,
            merchant_id: cat.merchant_id || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newCategory.name.trim()) return toast.error('Category name required');
        try {
            const payload = { 
                name: newCategory.name, 
                image: newCategory.image, 
                status: newCategory.status,
                merchant_id: newCategory.merchant_id
            };
            
            if (selectedMerchantId && !payload.merchant_id) {
                payload.merchant_id = selectedMerchantId;
            }

            if (editingId) await api.put(`/categories/${editingId}`, payload);
            else await api.post('/categories', payload);
            
            setShowModal(false);
            setEditingId(null);
            fetchData();
            setNewCategory({ name: '', image: '', image_url: '', status: true, merchant_id: '' });
            toast.success(editingId ? "Category updated successfully" : "Category created successfully");
        } catch (err) {
            toast.error(`Error saving category.`);
        }
    };

    const handleDelete = async (id) => {
        toast(
            (t) => (
                <span style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    Delete this category?
                    <button onClick={async () => { toast.dismiss(t.id); try { await api.delete(`/categories/${id}`); setCategories(prev => prev.filter(c => c.id !== id)); toast.success('Category deleted'); } catch { toast.error('Error deleting category'); }}} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:'8px',padding:'6px 14px',fontWeight:900,cursor:'pointer',fontSize:'10px',letterSpacing:'0.1em'}}>YES</button>
                    <button onClick={() => toast.dismiss(t.id)} style={{background:'#27272a',color:'#fff',border:'none',borderRadius:'8px',padding:'6px 14px',fontWeight:900,cursor:'pointer',fontSize:'10px',letterSpacing:'0.1em'}}>NO</button>
                </span>
            ),
            { duration: 6000 }
        );
    };

    const resetModal = () => {
        setShowModal(false);
        setEditingId(null);
        setNewCategory({ name: '', image: '', image_url: '', status: true, merchant_id: '' });
        setImgLoading(false);
        clearTimeout(debounceRef.current);
    };

    const getMerchantName = (id) => {
        const merchant = Merchants?.find(r => String(r.id) === String(id));
        return merchant ? merchant.name : 'Select Merchant';
    };

    const filtered = categories.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading && categories.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest leading-none">Loading Categories...</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-20 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-none uppercase">Categories</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-2">Manage all item groupings.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setNewCategory({ name: '', image: '', image_url: '', status: true, merchant_id: selectedMerchantId || '' });
                            setShowModal(true);
                        }}
                        className="bg-emerald-500 text-white px-6 py-4 rounded-2xl flex items-center gap-3 font-black transition-all shadow-xl shadow-emerald-500/20 text-[10px] uppercase tracking-[0.2em] outline-none"
                    >
                        <Plus className="w-4 h-4" strokeWidth={3} />
                        Add Category
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search existing categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 rounded-2xl text-[11px] font-black uppercase tracking-wider outline-none focus:border-zinc-900 dark:focus:border-emerald-500 transition-all dark:text-white placeholder:text-zinc-500"
                    />
                </div>
                <button onClick={fetchData} className="p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-zinc-400 hover:text-emerald-500 transition-all active:scale-95">
                    <Loader2 size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                {filtered.length === 0 ? (
                    <div className="col-span-full py-32 bg-zinc-50 dark:bg-zinc-900/40 rounded-[4rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center opacity-40">
                        <LayoutGrid size={48} className="text-zinc-300" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-6 text-zinc-500">No Groups Found</p>
                    </div>
                ) : (
                    filtered.map((cat) => (
                        <motion.div
                            key={cat.id}
                            whileHover={{ y: -8 }}
                            className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500"
                        >
                            <div className="relative h-44 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                {cat.image_url ? (
                                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                        <LayoutGrid size={48} />
                                    </div>
                                )}
                                <div className="absolute top-6 left-6">
                                    <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider backdrop-blur-xl border ${cat.status ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/10' : 'bg-rose-500/20 text-rose-400 border-rose-500/20'}`}>
                                        {cat.status ? 'Live' : 'Hidden'}
                                    </span>
                                </div>
                                <div className="absolute top-6 right-6 flex items-center gap-2">
                                     <div className="h-10 px-3 bg-white/20 backdrop-blur-xl rounded-xl flex items-center gap-2 border border-white/10 text-white shadow-xl">
                                        <Store size={14} className="text-emerald-400" />
                                        <span className="text-[10px] font-black uppercase tracking-tight">{cat.merchant?.name || 'Global'}</span>
                                     </div>
                                </div>
                            </div>
                            <div className="p-8 flex items-center justify-between">
                                <div className="min-w-0 pr-4">
                                    <h3 className="font-black text-zinc-900 dark:text-white tracking-tight uppercase text-[15px] leading-none truncate group-hover:text-emerald-500 transition-colors">{cat.name}</h3>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-3">Group ID #{cat.id}</p>
                                </div>
                                <div className="flex gap-3 shrink-0">
                                    <button
                                        onClick={() => handleEdit(cat)}
                                        className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={resetModal}
                            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-2xl overflow-hidden my-auto border border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="p-6 lg:p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                                <div>
                                    <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight leading-none">{editingId ? 'Edit Group' : 'New Group'}</h2>
                                    <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-1.5">Define your grouping.</p>
                                </div>
                                <button onClick={resetModal} className="p-3 bg-white dark:bg-zinc-800 rounded-xl text-zinc-500 hover:text-rose-500 transition-colors border border-zinc-100 dark:border-zinc-700 shadow-sm">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]">{isMerchant ? 'Assigned Node' : 'Partner Node'}</label>
                                    <div className="relative">
                                        <select
                                            required
                                            disabled={isMerchant}
                                            className={`w-full h-12 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl px-5 text-[10px] font-black uppercase text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all appearance-none ${isMerchant ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                            value={newCategory.merchant_id}
                                            onChange={(e) => setNewCategory({ ...newCategory, merchant_id: e.target.value })}
                                        >
                                            <option value="" className="dark:bg-zinc-900">Select Merchant</option>
                                            {Merchants.map(r => <option key={r.id} value={r.id} className="bg-white dark:bg-zinc-900 text-black dark:text-white">{r.name}</option>)}
                                        </select>
                                        {!isMerchant && <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]">Visual Identification</label>
                                    <div className="relative h-32 bg-zinc-50 dark:bg-zinc-900 rounded-[1.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-emerald-500/50 shadow-inner group">
                                        {imgLoading ? (
                                            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                                        ) : newCategory.image_url ? (
                                            <div className="w-full h-full relative">
                                                <img src={newCategory.image_url} className="w-full h-full object-cover" alt="preview" />
                                                <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[2px]">
                                                    <p className="text-[9px] font-black text-white uppercase tracking-widest">Change</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center opacity-40">
                                                <ImageIcon className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                                                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Add Image</p>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        {newCategory.name.length > 2 && (
                                            <button type="button" onClick={handleRetryImage} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl hover:bg-emerald-100 transition-all border-2 border-emerald-500/10">
                                                <Sparkles size={12} strokeWidth={3} /> AI Generate
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]">Group Label</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Label Name"
                                            className="w-full h-12 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl px-5 text-[11px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-500 shadow-inner"
                                            value={newCategory.name}
                                            onChange={handleNameChange}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${newCategory.status ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                                        <p className="text-[9px] font-black uppercase text-zinc-900 dark:text-white tracking-widest">Public Visibility</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setNewCategory(prev => ({ ...prev, status: !prev.status }))}
                                        className={`w-10 h-5 rounded-full relative transition-all ${newCategory.status ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                                    >
                                        <motion.div 
                                            animate={{ x: newCategory.status ? 20 : 4 }}
                                            className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm" 
                                        />
                                    </button>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button onClick={resetModal} type="button" className="flex-1 h-12 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-black text-[9px] uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 h-12 bg-emerald-500 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all">
                                        {editingId ? 'Update' : 'Confirm'}
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

export default Categories;

