import React, { useState, useEffect, useRef } from 'react';
import api, { restaurantService } from '../services/api';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Image as ImageIcon,
    MoreVertical,
    SearchX,
    AlertCircle,
    ChevronRight,
    Sparkles,
    CheckCircle2,
    Box,
    Loader2,
    Store,
    Filter,
    ChevronDown,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchRealFoodImage, generateAIDescription, generateProductNames } from '../utils/aiHelpers';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedMerchant, setSelectedMerchant] = useState('');
    const [showMerchantDropdown, setShowMerchantDropdown] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imgLoading, setImgLoading] = useState(false);
    const [nameSuggestions, setNameSuggestions] = useState([]);

    const merchantRef = useRef(null);

    const initialProductState = {
        name: '',
        description: '',
        price: '',
        category_id: '',
        restaurant_id: '',
        stock: 0,
        image: null,
        is_available: true
    };

    const [newProduct, setNewProduct] = useState(initialProductState);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (typeof path !== 'string') return null;
        if (path.startsWith('http')) return path;
        return `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${path}`;
    };

    useEffect(() => {
        fetchData();
        fetchRestaurants();
    }, [selectedMerchant]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (merchantRef.current && !merchantRef.current.contains(event.target)) {
                setShowMerchantDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchRestaurants = async () => {
        try {
            const res = await restaurantService.listAll();
            const data = res.data.data || [];
            setRestaurants(data);
            if (!selectedMerchant && data.length > 0) {
                setSelectedMerchant(data[0].id);
            }
        } catch (error) {
            console.error("Error fetching restaurants");
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const query = selectedMerchant !== 'all' ? `?restaurant_id=${selectedMerchant}` : '';
            const [prodRes, catRes] = await Promise.all([
                api.get(`/products${query}`),
                api.get(`/categories${query}`)
            ]);
            
            setProducts(prodRes.data.data || prodRes.data || []);
            setCategories(catRes.data.data || catRes.data || []);
        } catch (error) {
            console.error("Fetch Error:", error);
            setProducts([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);
        try {
            const res = await api.post('/upload', formData);
            setNewProduct({ ...newProduct, image: res.data.path });
        } catch (error) {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleAIDesc = async () => {
        if (!newProduct.name) return alert("Enter a name first");
        setUploading(true);
        try {
            const desc = await generateAIDescription(newProduct.name);
            setNewProduct(prev => ({ ...prev, description: desc }));
        } finally {
            setUploading(false);
        }
    };

    const handleAIGenImage = async () => {
        if (!newProduct.name) return alert("Enter a name first");
        setImgLoading(true);
        try {
            const url = await fetchRealFoodImage(newProduct.name, true, newProduct.description);
            setNewProduct(prev => ({ ...prev, image: url }));
        } catch (error) {
            console.error("AI Image Error:", error);
        } finally {
            setImgLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...newProduct };
            if (selectedMerchant !== 'all' && !payload.restaurant_id) {
                payload.restaurant_id = selectedMerchant;
            }

            if (editingId) {
                await api.put(`/products/${editingId}`, payload);
            } else {
                await api.post('/products', payload);
            }
            fetchData();
            setShowModal(false);
            setEditingId(null);
        } catch (error) {
            alert("Error saving product. Please ensure a merchant is selected.");
        }
    };

    const handleEdit = (prod) => {
        setEditingId(prod.id);
        setNewProduct({
            name: prod.name,
            description: prod.description || '',
            price: prod.price,
            category_id: prod.category?.id || prod.category_id,
            restaurant_id: prod.restaurant_id || '',
            stock: prod.stock,
            image: prod.image,
            is_available: !!prod.is_available
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this product?")) {
            try {
                await api.delete(`/products/${id}`);
                setProducts(products.filter(p => p.id !== id));
            } catch (error) {
                alert("Error deleting product");
            }
        }
    };

    const filtered = (Array.isArray(products) ? products : []).filter(p => {
        const matchCat = selectedCategory === 'all' || p.category?.id === selectedCategory || p.category_id === selectedCategory;
        const matchQuery = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchQuery;
    });

    const getMerchantName = (id) => {
        const merchant = restaurants.find(r => String(r.id) === String(id));
        return merchant ? merchant.name : 'Select Merchant';
    };

    if (loading && products.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest leading-none">Fetching Products...</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-20 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-none uppercase">Products</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-2">Inventory Management.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* CUSTOM MERCHANT SELECTOR */}
                    <div className="relative" ref={merchantRef}>
                        <button
                            onClick={() => setShowMerchantDropdown(!showMerchantDropdown)}
                            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-5 py-3 rounded-2xl flex items-center gap-4 hover:border-emerald-500/50 transition-all shadow-sm group"
                        >
                            <Store size={16} className={selectedMerchant === 'all' ? 'text-zinc-400' : 'text-emerald-500'} />
                            <div className="text-left pr-4">
                                <p className="text-[8px] font-black uppercase text-zinc-500 leading-none mb-1">Filtering For</p>
                                <p className="text-[10px] font-black uppercase text-zinc-900 dark:text-white leading-none">{getMerchantName(selectedMerchant)}</p>
                            </div>
                            <ChevronDown size={14} className={`text-zinc-400 transition-transform ${showMerchantDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showMerchantDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[60] overflow-hidden p-2"
                                >
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                                        {restaurants.map(r => (
                                            <button
                                                key={r.id}
                                                onClick={() => { setSelectedMerchant(r.id); setShowMerchantDropdown(false); }}
                                                className={`w-full p-4 rounded-2xl text-left flex items-center justify-between group transition-all mb-1 ${selectedMerchant === r.id ? 'bg-emerald-500 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${selectedMerchant === r.id ? 'bg-white/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:text-emerald-500'}`}>
                                                        <Store size={14} />
                                                    </div>
                                                    <span className="text-[11px] font-black uppercase leading-none">{r.name}</span>
                                                </div>
                                                {selectedMerchant === r.id && <CheckCircle2 size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={() => {
                            setEditingId(null);
                            setNewProduct({ ...initialProductState, restaurant_id: selectedMerchant !== 'all' ? selectedMerchant : '' });
                            setShowModal(true);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3 font-black transition-all shadow-xl shadow-emerald-500/20 text-[10px] uppercase tracking-[0.2em] outline-none"
                    >
                        <Plus className="w-4 h-4" strokeWidth={3} />
                        Add Item
                    </button>
                </div>
            </div>

            {/* Sub Filter & Search Bar */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col lg:flex-row items-center gap-6">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 rounded-2xl text-[11px] font-black uppercase tracking-wider outline-none focus:border-zinc-900 dark:focus:border-emerald-500 transition-all dark:text-white placeholder:text-zinc-500"
                    />
                </div>
                <div className="flex items-center gap-3 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${selectedCategory === 'all'
                            ? 'bg-zinc-900 dark:bg-emerald-500 text-white border-zinc-900 dark:border-emerald-500'
                            : 'bg-transparent text-zinc-500 border-zinc-100 dark:border-zinc-800 hover:border-emerald-500/30 hover:text-emerald-500'
                            }`}
                    >
                        All Items
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${selectedCategory === cat.id
                                ? 'bg-zinc-900 dark:bg-emerald-500 text-white border-zinc-900 dark:border-emerald-500'
                                : 'bg-transparent text-zinc-500 border-zinc-100 dark:border-zinc-800 hover:border-emerald-500/30 hover:text-emerald-500'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Table Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-800/30 text-zinc-400 text-[10px] uppercase tracking-widest font-black">
                                <th className="px-8 py-6 text-zinc-500 dark:text-zinc-300">Product Information</th>
                                <th className="py-6 px-4">Merchant</th>
                                <th className="py-6 px-4">Category</th>
                                <th className="py-6 px-4">Price</th>
                                <th className="py-6 px-4 text-center">Stock</th>
                                <th className="py-6 px-4">Availability</th>
                                <th className="px-8 py-6 text-right">Edit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-32 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <Box size={48} className="text-zinc-300" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-6 text-zinc-500">Inventory Empty</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((prod) => (
                                    <tr key={prod.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-[1.25rem] overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-sm relative group-hover:scale-105 transition-all duration-500">
                                                    {prod.image_url ? (
                                                        <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-300"><ImageIcon size={20} /></div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 pr-4">
                                                    <p className="font-black text-zinc-900 dark:text-white uppercase tracking-tight text-[13px] mb-1">{prod.name}</p>
                                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest truncate max-w-[200px] ">{prod.description || 'No description'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-4">
                                            <div className="flex items-center gap-2">
                                                <Store size={14} className="text-emerald-500" />
                                                <span className="text-[10px] font-black uppercase text-zinc-900 dark:text-zinc-100">
                                                    {prod.restaurant?.name || 'Global'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-4">
                                            <span className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl text-[9px] font-black uppercase text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                                                {prod.category?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="py-5 px-4">
                                            <span className="font-black text-zinc-900 dark:text-white tracking-tighter text-lg">₹{parseFloat(prod.price || 0).toFixed(0)}</span>
                                        </td>
                                        <td className="py-5 px-4 text-center">
                                            <span className={`font-black text-[11px] uppercase tracking-wider ${prod.stock < 10 ? 'text-rose-500' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                                {prod.stock} Units
                                            </span>
                                        </td>
                                        <td className="py-5 px-4">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border-2 ${
                                                prod.is_available 
                                                ? 'bg-emerald-50/50 text-emerald-600 border-emerald-500/10' 
                                                : 'bg-rose-50/50 text-rose-600 border-rose-500/10'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${prod.is_available ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                                {prod.is_available ? 'Live' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => handleEdit(prod)}
                                                    className="w-10 h-10 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/80 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(prod.id)}
                                                    className="w-10 h-10 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/80 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative w-full max-w-xl bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-2xl overflow-hidden my-auto border border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="p-6 lg:p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                                <div>
                                    <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight leading-none">{editingId ? 'Modify Item' : 'New Item'}</h2>
                                    <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-1.5">Configure your selection.</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-3 bg-white dark:bg-zinc-800 rounded-xl text-zinc-500 hover:text-rose-500 transition-colors border border-zinc-100 dark:border-zinc-700 shadow-sm"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6 items-start pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
                                    <div className="relative group mx-auto md:mx-0">
                                        <div className="w-32 h-32 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden transition-all group-hover:border-emerald-500/50 shadow-inner">
                                            {newProduct.image ? (
                                                <img src={getImageUrl(newProduct.image)} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={24} className="text-zinc-300" />
                                            )}
                                            {(uploading || imgLoading) && (
                                                <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center">
                                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 flex flex-col gap-1.5">
                                            <label className="w-8 h-8 flex items-center justify-center bg-zinc-900 dark:bg-zinc-800 text-white rounded-lg cursor-pointer hover:bg-emerald-500 transition-all shadow-lg border border-zinc-800">
                                                <ImageIcon size={14} />
                                                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleAIGenImage}
                                                className="w-8 h-8 flex items-center justify-center bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-lg"
                                            >
                                                <Sparkles size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Partner Node</label>
                                            <div className="relative">
                                                <select
                                                    required
                                                    className="w-full h-11 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-[10px] font-black uppercase text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                                                    value={newProduct.restaurant_id}
                                                    onChange={(e) => setNewProduct({ ...newProduct, restaurant_id: e.target.value })}
                                                >
                                                    <option value="" className="dark:bg-zinc-900">Select Partner</option>
                                                    {restaurants.map(r => <option key={r.id} value={r.id} className="bg-white dark:bg-zinc-900 text-black dark:text-white">{r.name}</option>)}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Item Designation</label>
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        const suggestions = await generateProductNames(newProduct.name || 'Food');
                                                        setNameSuggestions(suggestions);
                                                    }}
                                                    className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 hover:text-emerald-600 transition-all"
                                                >
                                                    <Sparkles size={10} strokeWidth={3} /> Suggest
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="e.g. Signature Pizza"
                                                    className="w-full h-11 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-[11px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-400 shadow-inner"
                                                    value={newProduct.name}
                                                    onChange={(e) => {
                                                        setNewProduct({ ...newProduct, name: e.target.value });
                                                        if (nameSuggestions.length > 0) setNameSuggestions([]);
                                                    }}
                                                />
                                                {nameSuggestions.length > 0 && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden p-1">
                                                        {nameSuggestions.map((s, i) => (
                                                            <button
                                                                key={i}
                                                                type="button"
                                                                onClick={() => { setNewProduct(prev => ({ ...prev, name: s })); setNameSuggestions([]); }}
                                                                className="w-full p-2.5 text-left text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white rounded-lg text-zinc-900 dark:text-zinc-100 transition-all"
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Menu Group</label>
                                        <div className="relative">
                                            <select
                                                required
                                                className="w-full h-11 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-[10px] font-black uppercase text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                                                value={newProduct.category_id}
                                                onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                                            >
                                                <option value="" className="dark:bg-zinc-900">Select Group</option>
                                                {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-white dark:bg-zinc-900 text-black dark:text-white">{cat.name}</option>)}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Base Price (₹)</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full h-11 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-[11px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all"
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Inventory Level</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full h-11 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-[11px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all"
                                            value={newProduct.stock}
                                            onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Visibility</label>
                                        <div className="flex items-center justify-between h-11 px-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border-2 border-zinc-100 dark:border-zinc-800">
                                            <span className="text-[9px] font-black uppercase text-zinc-500">{newProduct.is_available ? 'Live' : 'Hidden'}</span>
                                            <button
                                                type="button"
                                                onClick={() => setNewProduct({ ...newProduct, is_available: !newProduct.is_available })}
                                                className={`w-10 h-5 rounded-full relative transition-all ${newProduct.is_available ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                                            >
                                                <motion.div animate={{ x: newProduct.is_available ? 20 : 4 }} className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Item Narrative</label>
                                        <button
                                            type="button"
                                            onClick={handleAIDesc}
                                            className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5"
                                        >
                                            <Sparkles size={10} strokeWidth={3} /> Auto-Write
                                        </button>
                                    </div>
                                    <textarea
                                        rows={2}
                                        className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl outline-none focus:border-emerald-500 transition-all dark:text-white text-[11px] font-bold placeholder:text-zinc-500 resize-none shadow-inner"
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 h-12 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] h-12 bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all text-[9px] uppercase tracking-widest"
                                    >
                                        {editingId ? 'Push Update' : 'Finalize Addition'}
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

export default Products;
