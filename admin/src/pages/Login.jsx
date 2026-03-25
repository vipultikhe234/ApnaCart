import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    ArrowRight,
    Loader2,
    ShieldCheck,
    Command,
    Fingerprint,
    Waves
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await authService.login(credentials);
            const user = response.data.user;

            if (user.role !== 'admin' && user.role !== 'merchant') {
                setError('Access denied. Insufficient permissions.');
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                setLoading(false);
                return;
            }

            // The service already handles storage now, but we double-verify
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid management credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-white dark:bg-[#0A0A0A] overflow-hidden font-sans">
            {/* Left Section: Immersive Brand (Visible on LG up) */}
            <div className="hidden lg:flex w-1/2 h-full bg-zinc-900 relative overflow-hidden items-center justify-center">
                {/* Abstract Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/0 z-0"></div>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] -mr-96 -mt-96 animate-pulse"></div>
                
                <div className="relative z-10 px-20">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-10 shadow-2xl">
                             <Command className="text-zinc-900" size={40} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-6xl font-black text-white tracking-tighter leading-[0.95] mb-8">
                            Unifying <br />
                            <span className="text-emerald-400">Merchant</span> <br />
                            Ecosystems.
                        </h1>
                        <p className="text-zinc-400 text-lg font-medium max-w-md leading-relaxed mb-12">
                            A decentralized, high-fidelity administrative terminal designed for elite scalability and multi-tenant synchronization.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <div className="p-3 w-fit bg-white/5 rounded-xl border border-white/10">
                                    <ShieldCheck className="text-emerald-400" size={20} />
                                </div>
                                <h3 className="text-white text-sm font-bold uppercase tracking-widest leading-none">Global RBAC</h3>
                                <p className="text-zinc-500 text-xs">Role-based access precision at every node.</p>
                            </div>
                            <div className="space-y-3">
                                <div className="p-3 w-fit bg-white/5 rounded-xl border border-white/10">
                                    <Fingerprint className="text-blue-400" size={20} />
                                </div>
                                <h3 className="text-white text-sm font-bold uppercase tracking-widest leading-none">Biometric Auth</h3>
                                <p className="text-zinc-500 text-xs">Seamless identity verification protocols.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Branding */}
                <div className="absolute bottom-10 left-20">
                     <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">Nexus Infrastructure V2.5</p>
                </div>
            </div>

            {/* Right Section: Mobile-Style Clean Form */}
            <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-8 lg:p-12 relative">
                {/* Mobile View Logo (Hidden on LG) */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 lg:hidden flex flex-col items-center gap-4">
                     <div className="w-16 h-16 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-xl">
                         <span className="text-white dark:text-zinc-900 text-2xl font-black font-['Outfit'] tracking-tighter">FH</span>
                     </div>
                     <h2 className="text-2xl font-black text-zinc-900 dark:text-white font-['Outfit'] tracking-tight">FoodHub</h2>
                </div>

                <div className="w-full max-w-[420px]">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <header className="mb-10 text-center lg:text-left">
                            <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight lg:drop-shadow-none drop-shadow-sm">
                                Management <br className="hidden lg:block"/> Portal Login
                            </h2>
                            <p className="text-zinc-500 dark:text-zinc-400 text-base font-medium mt-3">
                                Enter your credentials to initialize session.
                            </p>
                        </header>

                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mb-8 overflow-hidden"
                                >
                                    <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl text-[13px] font-bold border border-red-500/20 flex items-center gap-3">
                                        <AlertCircle size={18} className="shrink-0" />
                                        {error}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center justify-between px-1">
                                    <span>Identity Address</span>
                                    <Mail size={12} className="opacity-40" />
                                </label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        required
                                        placeholder="your@foodhub.com"
                                        className="w-full h-16 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 text-sm text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white transition-all placeholder:text-zinc-400 font-bold"
                                        value={credentials.email}
                                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                    />
                                    <div className="absolute inset-0 rounded-2xl ring-4 ring-zinc-900/5 dark:ring-white/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center justify-between px-1">
                                    <span>Access Key</span>
                                    <Lock size={12} className="opacity-40" />
                                </label>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="••••••••••••"
                                        className="w-full h-16 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 pr-14 text-sm text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white transition-all placeholder:text-zinc-400 font-bold"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors z-20"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                    <div className="absolute inset-0 rounded-2xl ring-4 ring-zinc-900/5 dark:ring-white/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full h-16 rounded-[24px] mt-6 flex items-center justify-center gap-3 transition-all font-black text-sm uppercase tracking-[0.3em] overflow-hidden group ${
                                    loading 
                                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed border-2 border-zinc-200 dark:border-zinc-700' 
                                    : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-[1.01] active:scale-[0.99] shadow-2xl shadow-zinc-900/20'
                                }`}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={22} />
                                ) : (
                                    <>
                                        <span>Initialize Session</span>
                                        <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-16 text-center lg:text-left flex items-center gap-6 saturate-0 opacity-40 grayscale">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-5" />
                             <div className="w-1 h-3 bg-zinc-300 rounded-full"></div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Security Verified</p>
                        </div>
                    </motion.div>
                </div>

                {/* Micro Footer Only visible on Mobile Section */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 lg:left-12 lg:translate-x-0">
                     <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.5em] whitespace-nowrap">FoodHub Nexus Ecosystem • 2026</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
