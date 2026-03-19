import React, { useState, useEffect } from 'react';
import api from '../services/api';
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
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchRealFoodImage, generateAIDescription, generateProductNames } from '../utils/aiHelpers';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [uploading, setUploading] = useState(false);
    const [imgLoading, setImgLoading] = useState(false);
    const [nameSuggestions, setNameSuggestions] = useState([]);

    const initialProductState = {
        name: '',
        description: '',
        price: '',
        category_id: '',
        stock: 0,
        image: null,
        is_available: true
    };

    const [newProduct, setNewProduct] = useState(initialProductState);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (typeof path !== 'string') return null;
        if (path.startsWith('http')) return path;
        return `${import.meta.env.VITE_API_URL}/storage/${path}`;
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);
            // Safe handling of API response structure
            const productsData = prodRes.data.data || prodRes.data || [];
            const categoriesData = catRes.data.data || catRes.data || [];

            setProducts(Array.isArray(productsData) ? productsData : []);
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
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

    const handleNameChange = (e) => {
        setNewProduct({ ...newProduct, name: e.target.value });
        if (nameSuggestions.length > 0) setNameSuggestions([]);
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
            if (editingId) {
                await api.put(`/products/${editingId}`, newProduct);
            } else {
                await api.post('/products', newProduct);
            }
            fetchData();
            setShowModal(false);
            setEditingId(null);
        } catch (error) {
            alert("Error saving product");
        }
    };

    const handleEdit = (prod) => {
        setEditingId(prod.id);
        setNewProduct({
            name: prod.name,
            description: prod.description || '',
            price: prod.price,
            category_id: prod.category?.id || prod.category_id,
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-zinc-500 font-medium text-sm animate-pulse tracking-tight">Loading products...</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-20 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Products</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Manage your food items and availability.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setNewProduct(initialProductState);
                        setShowModal(true);
                    }}
                    className="bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-zinc-900/10 text-[10px] uppercase tracking-[0.2em]"
                >
                    <Plus className="w-4 h-4" />
                    Add Product
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col lg:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-emerald-500 transition-colors dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === 'all'
                            ? 'bg-zinc-900 dark:bg-emerald-500 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                            }`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === cat.id
                                ? 'bg-zinc-900 dark:bg-emerald-500 text-white'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Table Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                                <th className="px-6 py-4">Name</th>
                                <th className="py-4 px-4">Category</th>
                                <th className="py-4 px-4">Price</th>
                                <th className="py-4 px-4 text-center">Stock</th>
                                <th className="py-4 px-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-30">
                                            <SearchX size={48} className="text-zinc-400" />
                                            <p className="text-xs font-bold uppercase tracking-widest mt-4 text-zinc-500">No products found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((prod) => (
                                    <tr key={prod.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-sm relative group-hover:scale-105 transition-all">
                                                    {prod.image_url ? (
                                                        <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-300"><ImageIcon size={20} /></div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 pr-2">
                                                    <p className="font-bold text-zinc-900 dark:text-white tracking-tight text-sm mb-0.5">{prod.name}</p>
                                                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest truncate max-w-[180px] ">{prod.description || 'No description'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] font-bold uppercase text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                                {prod.category?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="font-bold text-zinc-900 dark:text-white tracking-tight text-sm">₹{parseFloat(prod.price || 0).toFixed(0)}</span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className={`font-bold text-xs ${prod.stock < 10 ? 'text-rose-500' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                                {prod.stock} units
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${prod.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${prod.is_available ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                {prod.is_available ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(prod)}
                                                    className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-500/70 hover:text-emerald-600 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(prod.id)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500/70 hover:text-red-500 rounded-lg transition-colors"
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{editingId ? 'Edit Product' : 'Add Product'}</h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                                {/* Image Upload & AI Gen Section */}
                                <div className="mb-6 flex flex-col items-center">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden transition-all group-hover:border-emerald-500/50 shadow-inner">
                                            {newProduct.image ? (
                                                <img
                                                    src={getImageUrl(newProduct.image)}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-1.5 opacity-40">
                                                    <ImageIcon size={24} />
                                                    <span className="text-[8px] font-bold uppercase tracking-widest">No Asset</span>
                                                </div>
                                            )}
                                            {(uploading || imgLoading) && (
                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 flex flex-col gap-1">
                                            <label className="p-2 bg-zinc-900 dark:bg-zinc-800 text-white rounded-lg cursor-pointer hover:bg-emerald-500 transition-all shadow-xl border border-zinc-800 dark:border-zinc-700">
                                                <ImageIcon size={14} />
                                                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleAIGenImage}
                                                className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-xl"
                                                title="AI Generate Image"
                                            >
                                                <Sparkles size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-4">Static Asset or AI Generation</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Product Name</label>
                                        <button
                                            type="button"
                                            onClick={() => setNameSuggestions(generateProductNames(newProduct.name || 'Food'))}
                                            className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1 hover:text-emerald-700 transition-colors"
                                        >
                                            <Sparkles size={10} /> Get suggestions
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Double Cheese Burger"
                                            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-emerald-500 transition-colors dark:text-white"
                                            value={newProduct.name}
                                            onChange={handleNameChange}
                                        />
                                        {nameSuggestions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden">
                                                {nameSuggestions.map((s, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => { setNewProduct(prev => ({ ...prev, name: s })); setNameSuggestions([]); }}
                                                        className="w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors"
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Category</label>
                                        <select
                                            required
                                            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-emerald-500 transition-colors dark:text-white"
                                            value={newProduct.category_id}
                                            onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Price (₹)</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-emerald-500 transition-colors dark:text-white"
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Stock Quantity</label>
                                        <input
                                            required
                                            type="number"
                                            placeholder="0"
                                            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-emerald-500 transition-colors dark:text-white"
                                            value={newProduct.stock}
                                            onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-2 text-center flex flex-col justify-center">
                                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Availability</label>
                                        <button
                                            type="button"
                                            onClick={() => setNewProduct({ ...newProduct, is_available: !newProduct.is_available })}
                                            className={`py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${newProduct.is_available ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}
                                        >
                                            {newProduct.is_available ? 'Available' : 'Unavailable'}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
                                        <button
                                            type="button"
                                            onClick={handleAIDesc}
                                            className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1 hover:text-emerald-700 transition-colors"
                                        >
                                            {uploading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Auto-Compose
                                        </button>
                                    </div>
                                    <textarea
                                        placeholder="Product description..."
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-emerald-500 transition-colors dark:text-white resize-none"
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2.5 bg-zinc-900 dark:bg-emerald-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-zinc-900/10 text-[10px] uppercase tracking-[0.2em]"
                                    >
                                        {editingId ? 'Save Changes' : 'Add Product'}
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
