import React, { useState } from 'react';
import { Mail, Lock, Loader2, Bike, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../services/api';

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await authService.login({ email, password });
            if (res.data.user.role !== 'rider') {
                setError('Access Denied. Only Riders can access this terminal.');
                setLoading(false);
                return;
            }
            localStorage.setItem('access_token', res.data.access_token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            onLoginSuccess(res.data.user);
        } catch (err) {
            setError('System failure: Authentication invalid.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0B10] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-500/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-emerald-500/5 blur-[120px] rounded-full"></div>

            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-md space-y-8 relative z-10"
            >
                <div className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6">
                        <Bike className="text-white" size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Rider Central</h1>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">Logistics Terminal Alpha</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-zinc-900/50 backdrop-blur-xl p-8 rounded-[32px] border border-zinc-800 shadow-2xl space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">
                            {error}
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <div className="relative group">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest absolute -top-2.5 left-4 bg-[#12141C] px-2 z-10 group-focus-within:text-emerald-500 transition-colors">Credential ID</label>
                            <div className="flex items-center bg-[#0F1118]/80 border border-zinc-800 rounded-2xl px-4 h-14 group-focus-within:border-emerald-500/50 transition-all">
                                <Mail className="text-zinc-600 group-focus-within:text-emerald-500 transition-colors mr-3" size={18} />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="rider@foodhub.com"
                                    className="bg-transparent w-full outline-none text-white text-sm font-medium placeholder:text-zinc-700"
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest absolute -top-2.5 left-4 bg-[#12141C] px-2 z-10 group-focus-within:text-emerald-500 transition-colors">Security Code</label>
                            <div className="flex items-center bg-[#0F1118]/80 border border-zinc-800 rounded-2xl px-4 h-14 group-focus-within:border-emerald-500/50 transition-all">
                                <Lock className="text-zinc-600 group-focus-within:text-emerald-500 transition-colors mr-3" size={18} />
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="bg-transparent w-full outline-none text-white text-sm font-medium placeholder:text-zinc-700"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group transition-all active:scale-[0.98]"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : (
                            <>
                                Initiate Sync <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 pt-4 border-t border-zinc-800/50">
                        <ShieldCheck className="text-zinc-600" size={14} />
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">End-to-End Encrypted Terminal</span>
                    </div>
                </form>

                <p className="text-center text-zinc-600 text-[10px] font-medium leading-relaxed">
                    By accessing this terminal, you agree to comply with the <br/>
                    <span className="text-zinc-400 font-bold">Velocity Delivery Protocols</span>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
