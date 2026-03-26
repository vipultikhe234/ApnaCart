import React, { useState, useEffect } from 'react';
import { locationService } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, Map, Building2, Plus, Edit3, Trash2,
    Loader2, ChevronRight, X, Check, SearchX
} from 'lucide-react';

// ─── Shared Minimal Input ─────────────────────────────────────────────────────
const Field = ({ label, children }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</label>
        {children}
    </div>
);

const Input = (props) => (
    <input
        {...props}
        className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl px-4 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-400"
    />
);

const Select = ({ children, ...props }) => (
    <select
        {...props}
        className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl px-4 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all"
    >
        {children}
    </select>
);

// ─── Row component ─────────────────────────────────────────────────────────
const Row = ({ item, subLabel, onEdit, onDelete }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="flex items-center justify-between px-5 py-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl group hover:border-emerald-500/30 transition-all"
    >
        <div className="flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full ${item.is_active ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
            <div>
                <p className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">{item.name}</p>
                {subLabel && <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{subLabel}</p>}
            </div>
            {item.code && (
                <span className="text-[10px] font-black text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg tracking-wider">{item.code}</span>
            )}
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(item)} className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors">
                <Edit3 size={15} />
            </button>
            <button onClick={() => onDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                <Trash2 size={15} />
            </button>
        </div>
    </motion.div>
);

// ─── Modal ─────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md" onClick={onClose} />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">{title}</h3>
                <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                    <X size={18} />
                </button>
            </div>
            {children}
        </motion.div>
    </div>
);

// ─── TAB: Countries ────────────────────────────────────────────────────────
const CountriesTab = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', code: '', is_active: true });
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetch(); }, []);
    const fetch = async () => {
        try { setLoading(true); const res = await locationService.adminGetCountries(); setItems(res.data); }
        catch { toast.error('Failed to load countries'); }
        finally { setLoading(false); }
    };

    const openAdd = () => { setEditing(null); setForm({ name: '', code: '', is_active: true }); setModal(true); };
    const openEdit = (item) => { setEditing(item); setForm({ name: item.name, code: item.code || '', is_active: item.is_active }); setModal(true); };

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (editing) await locationService.adminUpdateCountry(editing.id, form);
            else await locationService.adminCreateCountry(form);
            toast.success(editing ? 'Country updated' : 'Country added');
            setModal(false); fetch();
        } catch { toast.error('Operation failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = (id) => {
        toast((t) => (
            <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                Delete this country? (cascades states & cities)
                <button onClick={async () => { toast.dismiss(t.id); await locationService.adminDeleteCountry(id); toast.success('Deleted'); fetch(); }} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 900, cursor: 'pointer', fontSize: 10 }}>YES</button>
                <button onClick={() => toast.dismiss(t.id)} style={{ background: '#27272a', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 900, cursor: 'pointer', fontSize: 10 }}>NO</button>
            </span>
        ), { duration: 6000 });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{items.length} Countries</p>
                <button onClick={openAdd} className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20">
                    <Plus size={14} strokeWidth={3} /> Add Country
                </button>
            </div>
            {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-emerald-500" size={28} /></div> :
                items.length === 0 ? <div className="text-center py-20 opacity-30"><Globe size={48} className="mx-auto mb-3 text-zinc-400" /><p className="text-xs font-black uppercase tracking-widest text-zinc-500">No countries yet</p></div> :
                <AnimatePresence>{items.map(item => <Row key={item.id} item={item} onEdit={openEdit} onDelete={handleDelete} />)}</AnimatePresence>
            }
            <AnimatePresence>
                {modal && (
                    <Modal title={editing ? 'Edit Country' : 'Add Country'} onClose={() => setModal(false)}>
                        <form onSubmit={handleSave} className="space-y-4">
                            <Field label="Country Name"><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. India" /></Field>
                            <Field label="Country Code (ISO)"><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="e.g. IN" /></Field>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div onClick={() => setForm({ ...form, is_active: !form.is_active })} className={`w-10 h-6 rounded-full transition-colors ${form.is_active ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'} flex items-center px-1`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Active</span>
                            </label>
                            <button type="submit" disabled={saving} className="w-full h-12 bg-zinc-900 dark:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-50">
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} {editing ? 'Update' : 'Create'}
                            </button>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── TAB: States ──────────────────────────────────────────────────────────
const StatesTab = () => {
    const [items, setItems] = useState([]);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ country_id: '', name: '', is_active: true });
    const [saving, setSaving] = useState(false);
    const [filterCountry, setFilterCountry] = useState('');

    useEffect(() => { init(); }, []);
    const init = async () => {
        setLoading(true);
        try {
            const [stRes, cRes] = await Promise.all([locationService.adminGetStates(), locationService.adminGetCountries()]);
            setItems(stRes.data); setCountries(cRes.data);
        } catch { toast.error('Failed'); }
        finally { setLoading(false); }
    };

    const openAdd = () => { setEditing(null); setForm({ country_id: filterCountry || '', name: '', is_active: true }); setModal(true); };
    const openEdit = (item) => { setEditing(item); setForm({ country_id: item.country_id, name: item.name, is_active: item.is_active }); setModal(true); };

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (editing) await locationService.adminUpdateState(editing.id, form);
            else await locationService.adminCreateState(form);
            toast.success(editing ? 'State updated' : 'State added');
            setModal(false); init();
        } catch { toast.error('Operation failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = (id) => {
        toast((t) => (
            <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                Delete this state? (cascades cities)
                <button onClick={async () => { toast.dismiss(t.id); await locationService.adminDeleteState(id); toast.success('Deleted'); init(); }} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 900, cursor: 'pointer', fontSize: 10 }}>YES</button>
                <button onClick={() => toast.dismiss(t.id)} style={{ background: '#27272a', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 900, cursor: 'pointer', fontSize: 10 }}>NO</button>
            </span>
        ), { duration: 6000 });
    };

    const filtered = filterCountry ? items.filter(i => i.country_id == filterCountry) : items;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3 justify-between items-center">
                <Select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} style={{ width: 220 }}>
                    <option value="">All Countries</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                <button onClick={openAdd} className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20">
                    <Plus size={14} strokeWidth={3} /> Add State
                </button>
            </div>
            {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-emerald-500" size={28} /></div> :
                filtered.length === 0 ? <div className="text-center py-20 opacity-30"><Map size={48} className="mx-auto mb-3 text-zinc-400" /><p className="text-xs font-black uppercase tracking-widest text-zinc-500">No states yet</p></div> :
                <AnimatePresence>{filtered.map(item => <Row key={item.id} item={item} subLabel={item.country?.name} onEdit={openEdit} onDelete={handleDelete} />)}</AnimatePresence>
            }
            <AnimatePresence>
                {modal && (
                    <Modal title={editing ? 'Edit State' : 'Add State'} onClose={() => setModal(false)}>
                        <form onSubmit={handleSave} className="space-y-4">
                            <Field label="Country">
                                <Select required value={form.country_id} onChange={e => setForm({ ...form, country_id: e.target.value })}>
                                    <option value="">Select Country</option>
                                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </Select>
                            </Field>
                            <Field label="State / Province Name"><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Maharashtra" /></Field>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div onClick={() => setForm({ ...form, is_active: !form.is_active })} className={`w-10 h-6 rounded-full transition-colors ${form.is_active ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'} flex items-center px-1`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Active</span>
                            </label>
                            <button type="submit" disabled={saving} className="w-full h-12 bg-zinc-900 dark:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-50">
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} {editing ? 'Update' : 'Create'}
                            </button>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── TAB: Cities ──────────────────────────────────────────────────────────
const CitiesTab = () => {
    const [items, setItems] = useState([]);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [filteredStates, setFilteredStates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ state_id: '', name: '', is_active: true });
    const [formStates, setFormStates] = useState([]);
    const [formCountry, setFormCountry] = useState('');
    const [saving, setSaving] = useState(false);
    const [filterState, setFilterState] = useState('');
    const [filterCountry, setFilterCountry] = useState('');

    useEffect(() => { init(); }, []);
    const init = async () => {
        setLoading(true);
        try {
            const [ciRes, stRes, cRes] = await Promise.all([locationService.adminGetCities(), locationService.adminGetStates(), locationService.adminGetCountries()]);
            setItems(ciRes.data); setStates(stRes.data); setCountries(cRes.data);
        } catch { toast.error('Failed'); }
        finally { setLoading(false); }
    };

    const handleFilterCountry = (cId) => {
        setFilterCountry(cId); setFilterState('');
        setFilteredStates(cId ? states.filter(s => s.country_id == cId) : []);
    };

    const handleFormCountry = (cId) => {
        setFormCountry(cId); setForm({ ...form, state_id: '' });
        setFormStates(states.filter(s => s.country_id == cId));
    };

    const openAdd = () => { setEditing(null); setForm({ state_id: '', name: '', is_active: true }); setFormCountry(''); setFormStates([]); setModal(true); };
    const openEdit = (item) => {
        setEditing(item);
        const stateObj = states.find(s => s.id === item.state_id);
        const cId = stateObj?.country_id || '';
        setFormCountry(String(cId));
        setFormStates(states.filter(s => s.country_id == cId));
        setForm({ state_id: item.state_id, name: item.name, is_active: item.is_active });
        setModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (editing) await locationService.adminUpdateCity(editing.id, form);
            else await locationService.adminCreateCity(form);
            toast.success(editing ? 'City updated' : 'City added');
            setModal(false); init();
        } catch { toast.error('Operation failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = (id) => {
        toast((t) => (
            <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                Delete this city?
                <button onClick={async () => { toast.dismiss(t.id); await locationService.adminDeleteCity(id); toast.success('Deleted'); init(); }} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 900, cursor: 'pointer', fontSize: 10 }}>YES</button>
                <button onClick={() => toast.dismiss(t.id)} style={{ background: '#27272a', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 900, cursor: 'pointer', fontSize: 10 }}>NO</button>
            </span>
        ), { duration: 6000 });
    };

    const filtered = items.filter(i => {
        const matchState = !filterState || i.state_id == filterState;
        const matchCountry = !filterCountry || i.state?.country_id == filterCountry;
        return matchState && matchCountry;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3 justify-between items-center">
                <div className="flex gap-3">
                    <Select value={filterCountry} onChange={e => handleFilterCountry(e.target.value)} style={{ width: 180 }}>
                        <option value="">All Countries</option>
                        {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                    <Select value={filterState} onChange={e => setFilterState(e.target.value)} style={{ width: 180 }}>
                        <option value="">All States</option>
                        {(filterCountry ? filteredStates : states).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20">
                    <Plus size={14} strokeWidth={3} /> Add City
                </button>
            </div>
            {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-emerald-500" size={28} /></div> :
                filtered.length === 0 ? <div className="text-center py-20 opacity-30"><Building2 size={48} className="mx-auto mb-3 text-zinc-400" /><p className="text-xs font-black uppercase tracking-widest text-zinc-500">No cities yet</p></div> :
                <AnimatePresence>{filtered.map(item => <Row key={item.id} item={item} subLabel={`${item.state?.name || ''} · ${item.state?.country?.name || ''}`} onEdit={openEdit} onDelete={handleDelete} />)}</AnimatePresence>
            }
            <AnimatePresence>
                {modal && (
                    <Modal title={editing ? 'Edit City' : 'Add City'} onClose={() => setModal(false)}>
                        <form onSubmit={handleSave} className="space-y-4">
                            <Field label="Country">
                                <Select value={formCountry} onChange={e => handleFormCountry(e.target.value)}>
                                    <option value="">Select Country first</option>
                                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </Select>
                            </Field>
                            <Field label="State / Province">
                                <Select required value={form.state_id} onChange={e => setForm({ ...form, state_id: e.target.value })}>
                                    <option value="">Select State</option>
                                    {formStates.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </Select>
                            </Field>
                            <Field label="City Name"><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pune" /></Field>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div onClick={() => setForm({ ...form, is_active: !form.is_active })} className={`w-10 h-6 rounded-full transition-colors ${form.is_active ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'} flex items-center px-1`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Active</span>
                            </label>
                            <button type="submit" disabled={saving} className="w-full h-12 bg-zinc-900 dark:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-50">
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} {editing ? 'Update' : 'Create'}
                            </button>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Main Page ─────────────────────────────────────────────────────────────
const TABS = [
    { key: 'countries', label: 'Countries', icon: Globe },
    { key: 'states',    label: 'States',    icon: Map },
    { key: 'cities',    label: 'Cities',    icon: Building2 },
];

const LocationMaster = () => {
    const [activeTab, setActiveTab] = useState('countries');

    return (
        <div className="space-y-8 pb-20 font-sans">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase leading-none">Location Master</h1>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">Manage Countries · States · Cities for merchant onboarding</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl w-fit border border-zinc-200 dark:border-zinc-800">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeTab === tab.key
                                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                            }`}
                        >
                            <Icon size={13} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                    >
                        {activeTab === 'countries' && <CountriesTab />}
                        {activeTab === 'states'    && <StatesTab />}
                        {activeTab === 'cities'    && <CitiesTab />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LocationMaster;
