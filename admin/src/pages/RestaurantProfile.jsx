import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, MapPin, Clock, Globe, Info, CheckCircle, Save, Loader2, Tag, Image as ImageIcon } from 'lucide-react';
import { restaurantService, locationService } from '../services/api';
import { toast } from 'react-hot-toast';

const RestaurantProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [restaurant, setRestaurant] = useState({
        name: '',
        description: '',
        address: '',
        country_id: '',
        state_id: '',
        city_id: '',
        is_open: true,
        opening_time: '09:00:00',
        closing_time: '22:00:00',
        image: '',
        delivery_charge: 0,
        packaging_charge: 0,
        platform_fee: 0,
        delivery_charge_tax: 0,
        packaging_charge_tax: 0,
        platform_fee_tax: 0,
        latitude: '',
        longitude: '',
        delivery_charge_type: 'fixed',
        delivery_charge_per_km: 0,
        max_delivery_distance: 10
    });

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        fetchProfile();
        fetchCountries();
    }, []);

    const fetchCountries = async () => {
        try {
            const res = await locationService.getCountries();
            setCountries(res.data);
        } catch {}
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await restaurantService.getProfile();
            const data = response.data.data;
            setRestaurant({
                name: data.name || '',
                description: data.description || '',
                address: data.address || '',
                country_id: data.country_id || '',
                state_id: data.state_id || '',
                city_id: data.city_id || '',
                is_open: data.is_open ?? true,
                opening_time: data.opening_time || '09:00:00',
                closing_time: data.closing_time || '22:00:00',
                image: data.image || '',
                delivery_charge: data.other_charges?.delivery_charge || 0,
                packaging_charge: data.other_charges?.packaging_charge || 0,
                platform_fee: data.other_charges?.platform_fee || 0,
                delivery_charge_tax: data.other_charges?.delivery_charge_tax || 0,
                packaging_charge_tax: data.other_charges?.packaging_charge_tax || 0,
                platform_fee_tax: data.other_charges?.platform_fee_tax || 0,
                latitude: data.latitude || '',
                longitude: data.longitude || '',
                delivery_charge_type: data.other_charges?.delivery_charge_type || 'fixed',
                delivery_charge_per_km: data.other_charges?.delivery_charge_per_km || 0,
                max_delivery_distance: data.other_charges?.max_delivery_distance || 10
            });
            // Pre-load dependent selects
            if (data.country_id) {
                const stRes = await locationService.getStates(data.country_id);
                setStates(stRes.data);
            }
            if (data.state_id) {
                const ciRes = await locationService.getCities(data.state_id);
                setCities(ciRes.data);
            }
        } catch (error) {
            console.error("Error fetching merchant profile:", error);
            toast.error("Failed to fetch merchant profile");
        } finally {
            setLoading(false);
        }
    };

    const handleCountryChange = async (countryId) => {
        setRestaurant({ ...restaurant, country_id: countryId, state_id: '', city_id: '' });
        setStates([]); setCities([]);
        if (!countryId) return;
        const res = await locationService.getStates(countryId);
        setStates(res.data);
    };

    const handleStateChange = async (stateId) => {
        setRestaurant({ ...restaurant, state_id: stateId, city_id: '' });
        setCities([]);
        if (!stateId) return;
        const res = await locationService.getCities(stateId);
        setCities(res.data);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!restaurant.country_id || !restaurant.state_id || !restaurant.city_id) {
            toast.error('Country, State, and City are required to publish your merchant profile.');
            return;
        }
        try {
            setSaving(true);
            await restaurantService.updateProfile(restaurant);
            toast.success('Merchant profile updated successfully!');
            // Redirect to main module (Dashboard)
            setTimeout(() => {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user.role === 'admin') navigate('/dashboard');
                else navigate('/merchant-dashboard');
            }, 1000);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error('Failed to update merchant profile.');
        } finally {
            setSaving(false);
        }
    };

    const sel = "w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all";

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Merchant Profile</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1 uppercase tracking-widest text-[10px]">Manage your merchant outlet identity</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                    <CheckCircle size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Active Merchant</span>
                </div>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Store Details */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><Store size={18} className="text-zinc-500" /></div>
                             <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Merchant Details</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Business Name</label>
                                <input type="text" required value={restaurant.name} onChange={(e) => setRestaurant({...restaurant, name: e.target.value})}
                                    className={sel + " uppercase tracking-wide"} placeholder="Enter merchant name" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Description</label>
                                <textarea value={restaurant.description} onChange={(e) => setRestaurant({...restaurant, description: e.target.value})}
                                    rows="4" className={sel + " leading-relaxed"} placeholder="Tell customers about your outlet..." />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><Globe size={18} className="text-zinc-500" /></div>
                             <div>
                                 <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Service Location <span className="text-red-500">*</span></h2>
                                 <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">Required — customers discover your outlet by city</p>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Country <span className="text-red-500">*</span></label>
                                <select required value={restaurant.country_id} onChange={(e) => handleCountryChange(e.target.value)} className={sel}>
                                    <option value="">Select Country</option>
                                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">State <span className="text-red-500">*</span></label>
                                <select required value={restaurant.state_id} onChange={(e) => handleStateChange(e.target.value)} className={sel} disabled={!restaurant.country_id}>
                                    <option value="">Select State</option>
                                    {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">City <span className="text-red-500">*</span></label>
                                <select required value={restaurant.city_id} onChange={(e) => setRestaurant({ ...restaurant, city_id: e.target.value })} className={sel} disabled={!restaurant.state_id}>
                                    <option value="">Select City</option>
                                    {cities.map(ci => <option key={ci.id} value={ci.id}>{ci.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Street Address</label>
                            <input type="text" value={restaurant.address} onChange={(e) => setRestaurant({...restaurant, address: e.target.value})}
                                className={sel} placeholder="Enter full street address" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Latitude</label>
                                <input type="number" step="0.00000001" value={restaurant.latitude} onChange={(e) => setRestaurant({...restaurant, latitude: e.target.value})}
                                    className={sel} placeholder="e.g. 18.5204" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Longitude</label>
                                <input type="number" step="0.00000001" value={restaurant.longitude} onChange={(e) => setRestaurant({...restaurant, longitude: e.target.value})}
                                    className={sel} placeholder="e.g. 73.8567" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Opening Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                    <input type="time" value={restaurant.opening_time} onChange={(e) => setRestaurant({...restaurant, opening_time: e.target.value})}
                                        className={sel + " pl-12"} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Closing Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                    <input type="time" value={restaurant.closing_time} onChange={(e) => setRestaurant({...restaurant, closing_time: e.target.value})}
                                        className={sel + " pl-12"} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fees & Charges */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><Tag size={18} className="text-zinc-500" /></div>
                             <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Fees & Performance Config</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-emerald-500 uppercase tracking-widest px-1">Delivery Logistical Strategy</label>
                                <div className="space-y-3">
                                    <select className={sel} value={restaurant.delivery_charge_type} onChange={(e) => setRestaurant({...restaurant, delivery_charge_type: e.target.value})}>
                                        <option value="fixed">Fixed Price Only</option>
                                        <option value="distance">Distance-Based (INR/KM)</option>
                                    </select>
                                    {restaurant.delivery_charge_type === 'distance' ? (
                                        <div className="flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="flex-1">
                                                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 px-1">₹ per KM</label>
                                                <input type="number" step="0.1" value={restaurant.delivery_charge_per_km} onChange={(e) => setRestaurant({...restaurant, delivery_charge_per_km: e.target.value})} className={sel} />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 px-1">Max Dist (KM)</label>
                                                <input type="number" step="0.1" value={restaurant.max_delivery_distance} onChange={(e) => setRestaurant({...restaurant, max_delivery_distance: e.target.value})} className={sel} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 px-1">Fixed Delivery Fee (₹)</label>
                                            <input type="number" step="0.01" value={restaurant.delivery_charge} onChange={(e) => setRestaurant({...restaurant, delivery_charge: e.target.value})} className={sel} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest px-1">Operational Fees (₹)</label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 px-1">Packaging Charge</label>
                                            <input type="number" step="0.01" value={restaurant.packaging_charge} onChange={(e) => setRestaurant({...restaurant, packaging_charge: e.target.value})} className={sel} />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 px-1">Platform Fee</label>
                                            <input type="number" step="0.01" value={restaurant.platform_fee} onChange={(e) => setRestaurant({...restaurant, platform_fee: e.target.value})} className={sel} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                             <div className="space-y-4">
                                <label className="block text-[10px] font-black text-amber-500 uppercase tracking-widest px-1">Taxation & GST (%)</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 px-1 text-center">Delivery</label>
                                        <input type="number" step="0.1" value={restaurant.delivery_charge_tax} onChange={(e) => setRestaurant({...restaurant, delivery_charge_tax: e.target.value})} className={sel + " text-center"} />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 px-1 text-center">Packing</label>
                                        <input type="number" step="0.1" value={restaurant.packaging_charge_tax} onChange={(e) => setRestaurant({...restaurant, packaging_charge_tax: e.target.value})} className={sel + " text-center"} />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 px-1 text-center">Platform</label>
                                        <input type="number" step="0.1" value={restaurant.platform_fee_tax} onChange={(e) => setRestaurant({...restaurant, platform_fee_tax: e.target.value})} className={sel + " text-center"} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Cover Image</label>
                        <div className="aspect-video bg-zinc-100 dark:bg-zinc-950 rounded-2xl overflow-hidden border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center">
                            {restaurant.image ? (
                                <img src={restaurant.image} className="w-full h-full object-cover" alt="Banner" />
                            ) : (
                                <>
                                    <ImageIcon className="text-zinc-300 dark:text-zinc-700 mb-2" size={32} />
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Paste image URL below</span>
                                </>
                            )}
                        </div>
                        <input type="text" value={restaurant.image} onChange={(e) => setRestaurant({...restaurant, image: e.target.value})}
                            placeholder="Image URL" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-[10px] font-medium outline-none" />
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Merchant Status</span>
                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${restaurant.is_open ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {restaurant.is_open ? 'Open' : 'Closed'}
                            </div>
                        </div>
                        <button type="button" onClick={() => setRestaurant({...restaurant, is_open: !restaurant.is_open})}
                            className={`w-full p-4 rounded-2xl border-2 transition-all font-bold text-xs uppercase tracking-widest ${
                                restaurant.is_open
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-500'
                            }`}>
                            {restaurant.is_open ? 'Close Outlet' : 'Open for Business'}
                        </button>
                        <p className="text-[9px] text-zinc-400 font-medium text-center mt-4 px-2">Toggle outlet visibility on the mobile app instantly.</p>
                    </div>

                    <button type="submit" disabled={saving}
                        className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50">
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? 'Synchronizing...' : 'Save Merchant Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RestaurantProfile;
