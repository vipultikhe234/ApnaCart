import React, { useState, useEffect } from 'react';
import { Store, MapPin, Clock, Info, CheckCircle, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { restaurantService } from '../services/api';

const RestaurantProfile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [restaurant, setRestaurant] = useState({
        name: '',
        description: '',
        address: '',
        is_open: true,
        opening_time: '09:00:00',
        closing_time: '22:00:00',
        image: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await restaurantService.getProfile();
            setRestaurant(response.data.data);
        } catch (error) {
            console.error("Error fetching restaurant profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await restaurantService.updateProfile(restaurant);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Error updating profile:", error);
            alert('Failed to update profile.');
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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Restaurant Profile</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1 uppercase tracking-widest text-[10px]">Manage your storefront identity</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                    <CheckCircle size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Active Storefront</span>
                </div>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Core Identity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                <Store size={18} className="text-zinc-500" />
                             </div>
                             <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Store Details</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Business Name</label>
                                <input
                                    type="text"
                                    value={restaurant.name}
                                    onChange={(e) => setRestaurant({...restaurant, name: e.target.value})}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all uppercase tracking-wide"
                                    placeholder="Enter restaurant name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Description</label>
                                <textarea
                                    value={restaurant.description}
                                    onChange={(e) => setRestaurant({...restaurant, description: e.target.value})}
                                    rows="4"
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all leading-relaxed"
                                    placeholder="Tell customers about your kitchen..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                <MapPin size={18} className="text-zinc-500" />
                             </div>
                             <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Location & Logistics</h2>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Physical Address</label>
                            <input
                                type="text"
                                value={restaurant.address}
                                onChange={(e) => setRestaurant({...restaurant, address: e.target.value})}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all uppercase tracking-tight"
                                placeholder="Enter full address"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Opening Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                    <input
                                        type="time"
                                        value={restaurant.opening_time}
                                        onChange={(e) => setRestaurant({...restaurant, opening_time: e.target.value})}
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 pl-12 text-sm font-bold text-zinc-900 dark:text-white outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Closing Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                    <input
                                        type="time"
                                        value={restaurant.closing_time}
                                        onChange={(e) => setRestaurant({...restaurant, closing_time: e.target.value})}
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 pl-12 text-sm font-bold text-zinc-900 dark:text-white outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Visuals & Status */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Cover Image</label>
                        <div className="aspect-video bg-zinc-100 dark:bg-zinc-950 rounded-2xl overflow-hidden border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center group cursor-pointer hover:border-emerald-500/50 transition-all relative">
                            {restaurant.image ? (
                                <img src={restaurant.image} className="w-full h-full object-cover" alt="Banner" />
                            ) : (
                                <>
                                    <ImageIcon className="text-zinc-300 dark:text-zinc-700 mb-2" size={32} />
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Upload Banner</span>
                                </>
                            )}
                        </div>
                        <input
                            type="text"
                            value={restaurant.image}
                            onChange={(e) => setRestaurant({...restaurant, image: e.target.value})}
                            placeholder="Image URL"
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-[10px] font-medium outline-none"
                        />
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Store Status</span>
                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${restaurant.is_open ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {restaurant.is_open ? 'Open' : 'Closed'}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setRestaurant({...restaurant, is_open: !restaurant.is_open})}
                            className={`w-full p-4 rounded-2xl border-2 transition-all font-bold text-xs uppercase tracking-widest ${
                                restaurant.is_open 
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                : 'bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-500'
                            }`}
                        >
                            {restaurant.is_open ? 'Turn Store Off' : 'Open for Business'}
                        </button>
                        <p className="text-[9px] text-zinc-400 font-medium text-center mt-4 px-2">
                             Toggle store visibility on the customer mobile app instantly.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? 'Synchronizing...' : 'Save Configuration'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RestaurantProfile;
