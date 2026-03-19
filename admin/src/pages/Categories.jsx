import React, { useState, useEffect, useRef } from 'react';
import { productService } from '../services/api';
import api from '../services/api';
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
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imgLoading, setImgLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const debounceRef = useRef(null);

    const [newCategory, setNewCategory] = useState({
        name: '', image: '', image_url: '', status: true,
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/categories');
            const data = res.data.data || res.data || [];
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
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
            const url = await fetchRealFoodImage(name);
            setNewCategory(prev => ({ ...prev, image: url, image_url: url }));
            setImgLoading(false);
        }, 1500);
    };

    const handleRetryImage = async () => {
        if (!newCategory.name.trim()) return;
        setImgLoading(true);
        const url = await fetchRealFoodImage(newCategory.name, true);
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
            setNewCategory(prev => ({
                ...prev,
                image: path,
                image_url: `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${path}`,
            }));
        } catch {
            alert('Upload failed.');
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (cat) => {
        setEditingId(cat.id);
        setNewCategory({
            name: cat.name,
            image: cat.image || '',
            image_url: cat.image_url || '',
            status: cat.status ?? true,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newCategory.name.trim()) return alert('Category name required');
        try {
            const payload = { name: newCategory.name, image: newCategory.image, status: newCategory.status };
            if (editingId) await api.put(`/categories/${editingId}`, payload);
            else await api.post('/categories', payload);
            setShowModal(false);
            setEditingId(null);
            fetchData();
            setNewCategory({ name: '', image: '', image_url: '', status: true });
        } catch (err) {
            alert(`Error processing request`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete category?')) {
            try {
                await api.delete(`/categories/${id}`);
                setCategories(prev => prev.filter(c => c.id !== id));
            } catch { alert('Error deleting category'); }
        }
    };

    const resetModal = () => {
        setShowModal(false);
        setEditingId(null);
        setNewCategory({ name: '', image: '', image_url: '', status: true });
        setImgLoading(false);
        clearTimeout(debounceRef.current);
    };

    const filtered = categories.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-zinc-500 font-medium text-sm animate-pulse tracking-tight">Loading categories...</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-20 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Categories</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Organize your products into groups.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-zinc-900 dark:bg-emerald-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-zinc-900/10 dark:shadow-emerald-500/20 text-[10px] uppercase tracking-[0.2em]"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-emerald-500 transition-colors dark:text-white"
                    />
                </div>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filtered.length === 0 ? (
                    <div className="col-span-full py-24 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center opacity-30">
                        <LayoutGrid size={48} className="text-zinc-400" />
                        <p className="text-xs font-bold uppercase tracking-widest mt-4 text-zinc-500">No categories found</p>
                    </div>
                ) : (
                    filtered.map((cat) => (
                        <motion.div
                            key={cat.id}
                            whileHover={{ y: -4 }}
                            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden group"
                        >
                            <div className="relative h-32 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                {cat.image_url ? (
                                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                        <LayoutGrid size={32} />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wider border ${cat.status ? 'bg-emerald-500 text-white border-white/20' : 'bg-red-500 text-white border-white/20'}`}>
                                        {cat.status ? 'Active' : 'Hidden'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-zinc-900 dark:text-white tracking-tight uppercase text-sm">{cat.name}</h3>
                                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest mt-0.5">ID #{cat.id}</p>
                                </div>
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => handleEdit(cat)}
                                        className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-500/70 hover:text-emerald-600 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500/70 hover:text-red-500 rounded-lg transition-colors"
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={resetModal}
                            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{editingId ? 'Edit Category' : 'Add Category'}</h2>
                                <button onClick={resetModal} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Display Image</label>
                                    <div className="relative h-40 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center overflow-hidden transition-colors hover:border-emerald-500/30">
                                        {imgLoading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Loading image...</p>
                                            </div>
                                        ) : newCategory.image_url ? (
                                            <div className="w-full h-full relative group">
                                                <img src={newCategory.image_url} className="w-full h-full object-cover" alt="preview" />
                                                <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">Change Image</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <ImageIcon className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Upload or AI Generate</p>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                                            <AlertCircle size={10} /> Square image recommended
                                        </span>
                                        {newCategory.name.length > 2 && (
                                            <button onClick={handleRetryImage} className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                                                <Sparkles size={10} /> Get AI Image
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Category Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Burgers"
                                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-emerald-500 transition-colors dark:text-white"
                                        value={newCategory.name}
                                        onChange={handleNameChange}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setNewCategory(prev => ({ ...prev, status: !prev.status }))}
                                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${newCategory.status ? 'bg-emerald-50 border-emerald-100' : 'bg-zinc-50 border-zinc-200'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${newCategory.status ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-400'}`}>
                                            <Activity size={16} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-zinc-900 uppercase">Visible on App</p>
                                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Show this category to users</p>
                                        </div>
                                    </div>
                                    <div className={`w-10 h-6 rounded-full relative ${newCategory.status ? 'bg-emerald-500' : 'bg-zinc-300'} transition-colors`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newCategory.status ? 'translate-x-5' : 'translate-x-1'}`} />
                                    </div>
                                </button>

                                <div className="flex gap-3 pt-2">
                                    <button onClick={resetModal} className="flex-1 py-3 text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-600 transition-colors">Cancel</button>
                                    <button onClick={handleSubmit} className="flex-[2] py-3 bg-zinc-900 dark:bg-emerald-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-zinc-900/10 hover:opacity-90 transition-all flex items-center justify-center gap-2">
                                        <CheckCircle2 size={16} /> {editingId ? 'Save Changes' : 'Create Category'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Categories;
