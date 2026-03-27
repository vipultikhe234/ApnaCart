import React, { useState, useEffect } from 'react';
import { 
    Bike, 
    Plus, 
    MoreVertical, 
    Mail, 
    Phone, 
    Store, 
    Trash2, 
    ShieldCheck, 
    SearchX, 
    Loader2, 
    X, 
    CheckCircle2 
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import { useMerchant } from '../contexts/MerchantContext';

const RiderStaff = () => {
    const { selectedMerchantId } = useMerchant();
    const [riders, setRiders] = useState([]);
    const [merchants, setMerchants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', merchant_id: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, [selectedMerchantId]);

    const user = JSON.parse(localStorage.getItem('user'));
    const isMerchant = user?.role === 'merchant';

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const config = { 
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
                params: { merchant_id: selectedMerchantId }
            };
            const [staffRes, mercRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/rider/staff`, config),
                !isMerchant ? axios.get(`${import.meta.env.VITE_API_URL}/admin/merchants`, config) : Promise.resolve({ data: { data: [] } })
            ]);
            
            setRiders(staffRes.data.data || []);
            setMerchants(mercRes.data.data || []);
        } catch (err) {
            console.error("Fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOnboard = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const endpoint = isMerchant ? '/merchant/onboard-rider' : '/admin/onboard-rider';
            await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
            });
            setIsModalOpen(false);
            setFormData({ name: '', email: '', phone: '', password: '', merchant_id: '' });
            fetchInitialData();
            toast.success("Rider onboarded successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Onboarding failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-zinc-500 font-medium text-sm animate-pulse tracking-tight">Accessing Staff Database...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 font-sans">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Bike className="text-emerald-500" />
                        Logistics Staff Force
                   </h1>
                   <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 font-medium">Manage and onboard the delivery network across all merchant nodes.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-zinc-900 dark:bg-emerald-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] text-xs uppercase tracking-[0.2em]"
                >
                    <Plus size={18} strokeWidth={3} /> Onboard New Rider
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {riders.length === 0 ? (
                        <div className="col-span-full py-32 text-center opacity-30 select-none pointer-events-none">
                            <SearchX size={64} className="mx-auto text-zinc-600 mb-6" />
                            <p className="text-xs font-black uppercase tracking-[0.5em] text-zinc-500">Zero Personnel Detected</p>
                        </div>
                    ) : (
                        riders.map((rider, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={rider.id}
                                className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-[32px] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
                                
                                <div className="flex items-start justify-between mb-6 relative">
                                    <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                                        <Bike size={24} />
                                    </div>
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-900/50">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] font-black uppercase tracking-wider">Active Force</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase italic truncate tracking-tight">{rider.name}</h3>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mt-0.5">Fleet Protocol Identifier: #{rider.id}</p>
                                    </div>

                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-3 text-zinc-500">
                                            <Mail size={14} className="opacity-40" />
                                            <span className="text-xs font-medium truncate">{rider.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-zinc-500">
                                            <Phone size={14} className="opacity-40" />
                                            <span className="text-xs font-medium font-mono">{rider.phone}</span>
                                        </div>
                                        {rider.merchant_id && (
                                            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                                                <Store size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest truncate">Node Assignment: #{rider.merchant_id}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        <div className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-bold text-blue-600">DL</div>
                                        <div className="w-7 h-7 rounded-full bg-amber-100 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-bold text-amber-600">ID</div>
                                    </div>
                                    <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Onboarding Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md"
                    ></motion.div>
                        <motion.div
                            initial={{ y: 50, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 50, opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-[500px] bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800"
                        >
                            <div className="p-8 lg:p-10">
                                <header className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tight">Onboard {isMerchant ? 'Staff' : 'Rider'}</h2>
                                        <p className="text-zinc-500 text-xs font-medium mt-1">{isMerchant ? 'Register a courier for your station.' : 'Initialize new logistics personnel profile.'}</p>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                                        <X size={20} />
                                    </button>
                                </header>

                                <form onSubmit={handleOnboard} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 italic">Full Identity Name</label>
                                        <input 
                                            required
                                            className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl px-5 text-sm font-bold placeholder:text-zinc-300 outline-none focus:border-emerald-500 transition-all text-zinc-900 dark:text-white"
                                            placeholder="Alpha Courier 01"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 italic">Identity Email</label>
                                            <input 
                                                required
                                                type="email"
                                                className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl px-5 text-sm font-bold placeholder:text-zinc-300 outline-none focus:border-emerald-500 transition-all text-zinc-900 dark:text-white"
                                                placeholder="rider@apnacart.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 italic">Phone Matrix</label>
                                            <input 
                                                required
                                                className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl px-5 text-sm font-bold placeholder:text-zinc-300 outline-none focus:border-emerald-500 transition-all text-zinc-900 dark:text-white"
                                                placeholder="+91 00000 00000"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 italic">Access Key (Password)</label>
                                        <input 
                                            required
                                            type="password"
                                            className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl px-5 text-sm font-bold placeholder:text-zinc-300 outline-none focus:border-emerald-500 transition-all text-zinc-900 dark:text-white"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                    </div>
                                    {!isMerchant && (
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 italic">Merchant Node Assignment (Optional)</label>
                                            <select 
                                                className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl px-5 text-sm font-bold outline-none focus:border-emerald-500 transition-all text-zinc-900 dark:text-white"
                                                value={formData.merchant_id}
                                                onChange={(e) => setFormData({...formData, merchant_id: e.target.value})}
                                            >
                                                <option value="">Global Fleet (Unassigned)</option>
                                                {merchants.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name} (ID: {m.id})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <button 
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full h-14 bg-zinc-900 dark:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 mt-4 hover:opacity-90 transition-all disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" /> : <>Initialize Onboarding <CheckCircle2 size={18} /></>}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RiderStaff;

