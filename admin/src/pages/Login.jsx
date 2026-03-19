import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import {
    Lock,
    Mail,
    ShieldCheck,
    ArrowRight,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await authService.login(credentials);
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid administrative credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0F1A] px-6 py-12 relative overflow-hidden font-sans">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[140px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-md w-full relative z-10"
            >
                {/* Branding Section */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-premium border border-slate-100 dark:border-white/5 flex items-center justify-center mx-auto mb-6"
                    >
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <ShieldCheck size={24} strokeWidth={2.5} className="text-white" />
                        </div>
                    </motion.div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight font-['Outfit'] mb-2">FoodHub</h1>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Management System</span>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white dark:border-white/5 p-8 lg:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                    <div className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-['Outfit'] tracking-tight">Admin Login</h2>
                        <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Please enter your credentials to proceed.</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mb-6 overflow-hidden"
                            >
                                <div className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-semibold border border-rose-100 dark:border-rose-500/20 flex items-center gap-3">
                                    <AlertCircle size={18} className="shrink-0" />
                                    {error}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest pl-1 block">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder="admin@foodhub.com"
                                    className="w-full h-14 bg-slate-50 dark:bg-white/5 pl-14 pr-6 rounded-2xl focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-semibold text-gray-900 dark:text-white text-sm border border-transparent focus:border-indigo-600/20"
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest pl-1 block">Password</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full h-14 bg-slate-50 dark:bg-white/5 pl-14 pr-6 rounded-2xl focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-semibold text-gray-900 dark:text-white text-sm border border-transparent focus:border-indigo-600/20"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 disabled:opacity-50 transition-all mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight size={18} strokeWidth={2.5} />
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>

                {/* Footer Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 text-center"
                >
                    <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-[0.2em]">
                        Cloud-Based Admin Infrastructure • v2.1.0
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
