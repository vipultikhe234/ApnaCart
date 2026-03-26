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
    Loader2,
    Store,
    Bike,
    User,
    ShieldAlert,
    ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../services/api';

// Role config — label, icon, colour
const ROLES = [
    { value: '',         label: 'All Users',     icon: UsersIcon, pill: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400' },
    { value: 'admin',    label: 'Admins',        icon: ShieldAlert, pill: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' },
    { value: 'customer', label: 'Customers',     icon: User,      pill: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
    { value: 'merchant', label: 'Merchants',     icon: Store,     pill: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
    { value: 'rider',    label: 'Riders',        icon: Bike,      pill: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
];

const rolePill = (role) => {
    // Map 'user' to 'customer' if it comes as 'user' from backend (though DB uses 'customer')
    const actualRole = role === 'user' ? 'customer' : role;
    const r = ROLES.find(r => r.value === actualRole);
    if (!r || !r.value) return (
        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{role || '—'}</span>
    );
    const Icon = r.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${r.pill}`}>
            <Icon size={9} strokeWidth={3} /> {r.label.replace(/s$/, '')}
        </span>
    );
};

const Users = () => {
    const [users, setUsers]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter]   = useState('');   // '' = all

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await authService.listUsers();
            const data = res.data.data || res.data || [];
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = users.filter(u => {
        const uRole = u.role === 'user' ? 'customer' : u.role;
        const matchSearch =
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.phone?.includes(searchQuery);
        const matchRole = !roleFilter || uRole === roleFilter;
        return matchSearch && matchRole;
    });

    // Counts per role
    const counts = {
        '':         users.length,
        'admin':    users.filter(u => u.role === 'admin').length,
        'customer': users.filter(u => u.role === 'customer' || u.role === 'user').length,
        'merchant': users.filter(u => u.role === 'merchant').length,
        'rider':    users.filter(u => u.role === 'rider').length,
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest animate-pulse">Loading users...</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-20 font-sans">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase leading-none">Users</h1>
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-2">
                        Platform-wide user management console
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                        {users.length} Database Records
                    </p>
                </div>
            </div>

            {/* ── Role Filter Tabs + Search ── */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
                {/* Role pill tabs */}
                <div className="flex flex-wrap gap-2.5">
                    {ROLES.map(({ value, label, icon: Icon }) => {
                        const active = roleFilter === value;
                        return (
                            <button
                                key={value}
                                onClick={() => setRoleFilter(value)}
                                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                                    active
                                        ? 'bg-zinc-900 dark:bg-emerald-500 text-white border-transparent shadow-xl shadow-zinc-900/10 dark:shadow-emerald-500/20 scale-105'
                                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-100 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500'
                                }`}
                            >
                                <Icon size={12} strokeWidth={active ? 3 : 2.5} />
                                {label}
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${active ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'}`}>
                                    {counts[value]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email or mobile..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-[1.25rem] text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800/50 transition-all dark:text-white placeholder:text-zinc-400 placeholder:font-normal"
                    />
                </div>
            </div>

            {/* ── Results label ── */}
            <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                    Showing {filtered.length} entries
                    {roleFilter ? ` filtered by ${roleFilter}` : ''}
                </p>
            </div>

            {/* ── Table ── */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50/50 dark:bg-zinc-800/60 text-zinc-400 text-[9px] uppercase tracking-[0.2em] font-black border-b border-zinc-100 dark:border-zinc-800">
                                <th className="px-8 py-5">User Profile</th>
                                <th className="py-5 px-6">System Role</th>
                                <th className="py-5 px-6">Access Points</th>
                                <th className="py-5 px-6">Location</th>
                                <th className="px-8 py-5 text-right">Onboarding</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-30">
                                            <SearchX size={48} className="text-zinc-400" />
                                            <p className="text-xs font-black uppercase tracking-widest mt-4 text-zinc-500">No matching users</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((user) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="group hover:bg-zinc-50/40 dark:hover:bg-zinc-800/40 transition-colors"
                                    >
                                        {/* Name + Avatar */}
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-200 dark:border-zinc-700 text-zinc-500 group-hover:bg-zinc-900 dark:group-hover:bg-emerald-500 group-hover:text-white transition-all uppercase font-black text-sm shadow-sm">
                                                    {user.name?.[0] || <UserCircle size={22} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-zinc-900 dark:text-white tracking-tight text-[14px] mb-0.5 group-hover:text-emerald-500 transition-colors">{user.name || 'Anonymous'}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">ID-{String(user.id).padStart(4, '0')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role badge */}
                                        <td className="py-5 px-6">
                                            {rolePill(user.role)}
                                        </td>

                                        {/* Contact */}
                                        <td className="py-5 px-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-[0.1em]">
                                                    <Mail size={11} className="text-zinc-400 shrink-0" />
                                                    {user.email || 'N/A'}
                                                </div>
                                                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-[0.1em]">
                                                    <Phone size={11} className="text-zinc-400 shrink-0" />
                                                    {user.phone || 'N/A'}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Address */}
                                        <td className="py-5 px-6">
                                            <div className="flex items-start gap-2 text-zinc-500 dark:text-zinc-400">
                                                <MapPin size={13} className="text-rose-500 shrink-0 mt-0.5" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest max-w-[200px] leading-relaxed">
                                                    {user.address || 'Not Provided'}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="py-5 px-8 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-black text-xs">
                                                    <Calendar size={12} className="text-zinc-400" />
                                                    {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">Verified</span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── KPI Summary ── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
                {[
                    { label: 'Platform Users', val: counts[''],         icon: Activity,    color: 'text-zinc-500', group: 'Total' },
                    { label: 'Administrators', val: counts['admin'],    icon: ShieldAlert, color: 'text-rose-500', group: 'Role' },
                    { label: 'Customers',      val: counts['customer'], icon: User,        color: 'text-blue-500', group: 'Role' },
                    { label: 'Merchants',      val: counts['merchant'], icon: Store,       color: 'text-emerald-500', group: 'Role' },
                    { label: 'Riders',         val: counts['rider'],    icon: Bike,        color: 'text-amber-500', group: 'Role' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="bg-white dark:bg-zinc-900 p-6 rounded-[1.75rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-4 group transition-all"
                    >
                        <div className={`w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center ${stat.color} group-hover:bg-zinc-900 dark:group-hover:bg-white transition-colors`}>
                            <stat.icon size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight leading-none">{stat.val}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Users;
