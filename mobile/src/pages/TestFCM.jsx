import React, { useState } from 'react';
import { fcmService } from '../services/api';
import { Bell, Send, Shield, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const TestFCM = () => {
    const [status, setStatus] = useState('idle');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [hasToken, setHasToken] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(true);

    React.useEffect(() => {
        checkTokenStatus();
    }, []);

    const checkTokenStatus = async () => {
        try {
            const resp = await fcmService.getStatus();
            setHasToken(resp.data.has_token);
        } catch (err) {
            console.error('Failed to check token status', err);
        } finally {
            setLoadingStatus(false);
        }
    };

    const saveMockToken = async () => {
        setStatus('testing');
        try {
            const mockToken = 'MOCK_TOKEN_' + Math.random().toString(36).substring(7);
            await fcmService.saveToken(mockToken);
            setResult('Mock token saved! Re-checking status...');
            await checkTokenStatus();
            setStatus('idle');
        } catch (err) {
            setError('Failed to save mock token: ' + (err.response?.data?.message || err.message));
            setStatus('error');
        }
    };

    const testManualNotification = async () => {
        setStatus('testing');
        setError(null);
        setResult(null);

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.id) {
            setError('You must be logged in to test notifications.');
            setStatus('error');
            return;
        }

        try {
            const response = await fcmService.sendManualNotification({
                user_id: user.id,
                title: 'Test Notification 🚀',
                message: 'This is a test notification from the ApnaCart Test Panel.',
                data: { type: 'test', timestamp: new Date().toISOString() }
            });

            if (response.data.success) {
                setResult('Notification request sent to FCM!');
                setStatus('success');
            } else {
                setError(response.data.message || 'Failed to send notification.');
                setStatus('error');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Server error occurred.');
            setStatus('error');
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                    <Shield size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">FCM Diagnostic Tool</h1>
                    <p className="text-zinc-500 text-sm">Verify backend integration and push delivery</p>
                </div>
            </div>

            <div className="grid gap-4">
                {/* Connection Status */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Info size={16} className="text-zinc-400" />
                        Prerequisites check
                    </h3>
                    <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                        <li className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${localStorage.getItem('access_token') ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            User Authentication: {localStorage.getItem('access_token') ? 'Logged In' : 'Not Logged In'}
                        </li>
                        <li className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${loadingStatus ? 'bg-zinc-400 animate-pulse' : (hasToken ? 'bg-emerald-500' : 'bg-red-500')}`} />
                            Backend Token: {loadingStatus ? 'Checking...' : (hasToken ? '✅ Registered' : '❌ Not Registered')}
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            Platform: {window.Capacitor?.getPlatform() || 'web'}
                        </li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl space-y-4">
                    <p className="text-sm text-zinc-500">
                        Clicking below will trigger the backend to send a push notification to your current user ID using the <code>fcm_token</code> stored in the database.
                    </p>
                    
                    {!hasToken && (
                        <button
                            onClick={saveMockToken}
                            disabled={status === 'testing'}
                            className="w-full py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all mb-2"
                        >
                            Mock Token (Web Testing)
                        </button>
                    )}
                    
                    <button
                        onClick={testManualNotification}
                        disabled={status === 'testing'}
                        className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {status === 'testing' ? 'Sending...' : 'Send Test Notification'}
                        <Send size={18} />
                    </button>
                    
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm"
                        >
                            <AlertCircle size={18} />
                            {error}
                        </motion.div>
                    )}

                    {result && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm"
                        >
                            <CheckCircle2 size={18} />
                            {result}
                        </motion.div>
                    )}
                </div>

                <div className="bg-zinc-100 dark:bg-zinc-800/50 p-5 rounded-3xl text-[10px] text-zinc-500 leading-relaxed">
                    <strong>Note:</strong> On web browsers, you will not receive a physical push notification unless you have configured a Service Worker and have a valid VAPID key. This tool primarily tests the <strong>Backend connectivity to FCM API</strong>.
                </div>
            </div>
        </div>
    );
};

export default TestFCM;
