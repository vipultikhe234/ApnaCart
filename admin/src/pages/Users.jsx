import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Users as UsersIcon,
    Search,
    Mail,
    Phone,
    MapPin,
    Calendar,
    SearchX,
    ArrowUpRight,
    UserCircle,
    Activity,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users');
            const data = res.data.data || res.data || [];
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone?.includes(searchQuery)
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-zinc-500 font-medium text-sm animate-pulse tracking-tight">Loading users...</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-20 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Users</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Manage your customers and delivery partners.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">{users.length} Active Users</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-emerald-500 transition-colors dark:text-white"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                                <th className="px-6 py-4">User Details</th>
                                <th className="py-4 px-4">Contact Info</th>
                                <th className="py-4 px-4">Address</th>
                                <th className="px-6 py-4 text-right">Registered</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-30">
                                            <SearchX size={48} className="text-zinc-400" />
                                            <p className="text-xs font-bold uppercase tracking-widest mt-4 text-zinc-500">No users found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((user) => (
                                    <tr key={user.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm text-zinc-500 group-hover:bg-emerald-500 group-hover:text-white transition-all overflow-hidden uppercase font-bold text-xs ring-4 ring-transparent group-hover:ring-emerald-50">
                                                    {user.name?.[0] || <UserCircle size={20} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-zinc-900 dark:text-white tracking-tight text-sm mb-0.5">{user.name || 'Anonymous'}</p>
                                                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest truncate max-w-[180px]">ID-{String(user.id).padStart(4, '0')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                                                    <Mail size={10} className="text-zinc-400" />
                                                    {user.email || 'N/A'}
                                                </div>
                                                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                                                    <Phone size={10} className="text-zinc-400" />
                                                    {user.phone || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                                                <MapPin size={12} className="text-zinc-400 shrink-0" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest max-w-[200px] truncate">{user.address || 'No address'}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1.5 text-zinc-900 dark:text-white font-bold text-xs">
                                                    <Calendar size={12} className="text-emerald-500" />
                                                    {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Date Joined</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {[
                    { label: 'Total Users', val: users.length, icon: Activity, color: 'text-zinc-600 dark:text-zinc-400' },
                    { label: 'Active Today', val: Math.round(users.length * 0.4), icon: UserCircle, color: 'text-emerald-500' },
                    { label: 'Growth', val: `+${Math.round(users.length * 0.12)}`, icon: ArrowUpRight, color: 'text-amber-500' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between group transition-shadow hover:shadow-md"
                    >
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{stat.val}</p>
                        </div>
                        <div className={`p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} strokeWidth={2.5} />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Users;
