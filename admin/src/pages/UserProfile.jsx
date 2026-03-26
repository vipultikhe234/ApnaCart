import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Mail, Phone, MapPin, Save, Loader2, ShieldCheck } from 'lucide-react';
import { authService } from '../services/api';

import { toast } from 'react-hot-toast';

const UserProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [userRole, setUserRole] = useState('user');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await authService.getProfile();
            const data = res.data;
            setFormData({
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || ''
            });
            setUserRole(data.role || 'user');
        } catch (error) {
            console.error("Error fetching profile details:", error);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            // Updating name, phone, address by hitting PUT /api/profile
            const res = await authService.updateProfile({
                name: formData.name,
                phone: formData.phone,
                address: formData.address
            });
            
            // Update local storage user data
            const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...savedUser, name: formData.name, phone: formData.phone, address: formData.address };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            toast.success('Profile updated successfully!');
            setTimeout(() => {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user.role === 'admin') navigate('/dashboard');
                else if (user.role === 'merchant') navigate('/merchant-dashboard');
                else navigate('/');
            }, 1000);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Access Identity</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Manage your personal credentials</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{userRole} Identity</span>
                </div>
            </div>

            <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8">
                
                <div className="flex items-center gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 shadow-inner">
                        <UserCircle size={40} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{formData.name || 'Anonymous User'}</h2>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mt-1">{formData.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><UserCircle size={14} /> Full Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 text-xs font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all uppercase tracking-wide"
                            placeholder="Enter your name"
                        />
                    </div>

                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Mail size={14} /> Identity Email</label>
                        <input
                            type="email"
                            disabled
                            value={formData.email}
                            className="w-full bg-zinc-100 dark:bg-zinc-900/50 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 text-xs font-bold text-zinc-500 outline-none cursor-not-allowed uppercase tracking-wide"
                        />
                    </div>

                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Phone size={14} /> Contact Matrix</label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 text-xs font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all font-mono"
                            placeholder="e.g. +91 98765 43210"
                        />
                    </div>

                    <div className="space-y-2.5 md:col-span-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={14} /> Registered Address</label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            rows="3"
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 text-xs font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all uppercase tracking-wide leading-relaxed"
                            placeholder="Enter physical address details"
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full md:w-auto px-8 bg-zinc-900 dark:bg-emerald-500 text-white dark:text-zinc-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-zinc-900/10 dark:shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {saving ? 'Transmitting...' : 'Update Context'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserProfile;
