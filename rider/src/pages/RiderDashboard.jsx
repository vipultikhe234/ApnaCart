import React, { useState, useEffect } from 'react';
import { 
    Bike, 
    Bell, 
    Navigation, 
    CheckCircle2, 
    Clock, 
    MapPin, 
    ChevronRight, 
    ScanLine, 
    SearchX, 
    Loader2, 
    LogOut, 
    Package, 
    IndianRupee, 
    Activity,
    Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { riderService, authService } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

const riderIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3195/3195884.png',
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -42],
});

const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 15);
        }
    }, [lat, lng, map]);
    return null;
};

const RiderDashboard = ({ user, onLogout }) => {
    const [availableOrders, setAvailableOrders] = useState([]);
    const [activeOrder, setActiveOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [riderPos, setRiderPos] = useState({ lat: 28.6139, lng: 77.2090 });
    const [stats, setStats] = useState({ earnings: 0, ordersCompleted: 0, activeMinutes: 0 });

    useEffect(() => {
        fetchRiderData();
        
        // High frequency location sync
        let intervalId = setInterval(() => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    const { latitude, longitude } = pos.coords;
                    setRiderPos({ lat: latitude, lng: longitude });
                    riderService.updateLocation(latitude, longitude).catch(() => {});
                }, () => {
                   // Mock movement for demo
                   setRiderPos(prev => ({ 
                       lat: prev.lat + (Math.random() - 0.5) * 0.001, 
                       lng: prev.lng + (Math.random() - 0.5) * 0.001 
                   }));
                });
            }
        }, 10000);

        return () => clearInterval(intervalId);
    }, []);

    const fetchRiderData = async () => {
        try {
            setLoading(true);
            const res = await riderService.getAvailableOrders();
            const all = res.data.data || res.data.orders || [];
            
            // Check for active order
            const active = all.find(o => o.status === 'out_for_delivery' && o.rider_id === user.id);
            setActiveOrder(active || null);
            setAvailableOrders(all.filter(o => o.status === 'ready' || o.status === 'preparing'));
            
            // Mock stats
            setStats({ earnings: 1240, ordersCompleted: 14, activeMinutes: 320 });
        } catch (err) {
            console.error("Fetch Data Failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOrder = async (id) => {
        setSyncing(true);
        try {
            await riderService.acceptOrder(id);
            fetchRiderData();
        } catch (err) {
            alert("Protocol Violation: Could not accept mission.");
        } finally {
            setSyncing(false);
        }
    };

    const handleCompleteOrder = async (id) => {
        setSyncing(true);
        try {
            await riderService.completeOrder(id);
            setActiveOrder(null);
            fetchRiderData();
        } catch (err) {
            alert("Protocol Violation: Termination failed.");
        } finally {
            setSyncing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0A0B10] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.4em]">Establishing Uplink...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0A0B10] text-[#F9FAFB] font-sans overflow-x-hidden">
            {/* Header Terminal Style */}
            <div className="sticky top-0 z-[1000] bg-[#0A0B10]/80 backdrop-blur-xl border-b border-zinc-800/50 px-6 pt-12 pb-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/5 relative">
                             <Bike size={24} strokeWidth={2.5} />
                             <div className="absolute top-[-2px] right-[-2px] w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0A0B10] animate-pulse"></div>
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter uppercase italic">{user.name}</h1>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Status: Active Duty</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white transition-all shadow-xl"
                    >
                         <LogOut size={18} />
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-8 pb-32">
                {/* Real-time Intel Table */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-zinc-900/40 p-4 rounded-3xl border border-zinc-800 shadow-sm relative overflow-hidden group">
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Shift Earnings</p>
                        <h2 className="text-lg font-black tracking-tighter">₹{stats.earnings}</h2>
                        <div className="mt-2 text-[8px] font-bold text-emerald-500 uppercase">+15% boost</div>
                        <IndianRupee className="absolute right-[-5px] bottom-[-5px] w-12 h-12 text-zinc-800 opacity-20 -rotate-12" />
                    </div>
                    <div className="bg-zinc-900/40 p-4 rounded-3xl border border-zinc-800 shadow-sm relative overflow-hidden group">
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Units Delivered</p>
                        <h2 className="text-lg font-black tracking-tighter">{stats.ordersCompleted}</h2>
                        <div className="mt-2 text-[8px] font-bold text-blue-500 uppercase">Rank: Elite</div>
                        <Package className="absolute right-[-5px] bottom-[-5px] w-12 h-12 text-zinc-800 opacity-20 rotate-12" />
                    </div>
                    <div className="bg-zinc-900/40 p-4 rounded-3xl border border-zinc-800 shadow-sm relative overflow-hidden group">
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Activity Min</p>
                        <h2 className="text-lg font-black tracking-tighter">{stats.activeMinutes}</h2>
                        <div className="mt-2 text-[8px] font-bold text-amber-500 uppercase">98% uptime</div>
                        <Activity className="absolute right-[-5px] bottom-[-5px] w-12 h-12 text-zinc-800 opacity-20 -rotate-12" />
                    </div>
                </div>

                {/* Tracking Hub (Show when order active) */}
                <AnimatePresence>
                {activeOrder && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-emerald-500 rounded-[40px] p-1 shadow-2xl shadow-emerald-500/20 overflow-hidden"
                    >
                        <div className="bg-[#0A0B10] rounded-[39px] overflow-hidden p-6 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full mb-3">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active Mission Tracking</span>
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tighter uppercase italic">Mission #{String(activeOrder.id).slice(-4)}</h3>
                                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Customer: {activeOrder.user?.name}</p>
                                </div>
                                <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-emerald-500 border border-zinc-800 shadow-xl">
                                    <Navigation size={24} />
                                </div>
                            </div>

                            <div className="h-[250px] w-full rounded-[32px] overflow-hidden relative border border-zinc-800 shadow-inner">
                                <MapContainer 
                                    center={[riderPos.lat, riderPos.lng]} 
                                    zoom={15} 
                                    style={{ height: '100%', width: '100%' }}
                                    zoomControl={false}
                                >
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                        attribution='&copy; OpenStreetMap contributors'
                                    />
                                    <Marker position={[riderPos.lat, riderPos.lng]} icon={riderIcon}>
                                        <Popup>Current Velocity Vector</Popup>
                                    </Marker>
                                    <RecenterMap lat={riderPos.lat} lng={riderPos.lng} />
                                </MapContainer>
                                <div className="absolute bottom-4 right-4 z-[500] bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-800 text-[8px] font-black uppercase tracking-widest text-emerald-500">
                                    Precision Tracking: ON
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-zinc-900/60 p-4 rounded-3xl border border-zinc-800">
                                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                                    <MapPin size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Vector Destination</p>
                                    <p className="text-xs font-bold text-white truncate uppercase italic">{activeOrder.address}</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleCompleteOrder(activeOrder.id)}
                                disabled={syncing}
                                className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-white rounded-[32px] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] mt-4"
                            >
                                {syncing ? <Loader2 size={24} className="animate-spin" /> : (
                                    <>
                                        <CheckCircle2 size={20} /> Mission Accomplished
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>

                {/* Mission Pool */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-2">
                             <Bell size={16} className="text-zinc-500" />
                             <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Mission Resource Pool</h3>
                        </div>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{availableOrders.length} New Orders</span>
                    </div>

                    <div className="space-y-4">
                        {availableOrders.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                                <SearchX size={48} className="text-zinc-800" />
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] mt-4">Zero missions available in sector</p>
                            </div>
                        ) : (
                            availableOrders.map(order => (
                                <div key={order.id} className="bg-zinc-900/40 p-6 rounded-[36px] border border-zinc-800 flex items-center justify-between group hover:border-emerald-500/50 transition-all active:scale-[0.97]">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-emerald-500/5 rounded-2xl flex items-center justify-center text-emerald-500/40 border border-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-black text-white uppercase italic">Sector #{String(order.id).slice(-4)}</h4>
                                                <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-tighter uppercase">₹{parseFloat(order.total_price * 0.1).toFixed(0)} PAYOUT</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-zinc-500">
                                                <MapPin size={10} />
                                                <p className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[150px] italic">{order.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleAcceptOrder(order.id)}
                                        disabled={syncing || activeOrder}
                                        className="w-12 h-12 bg-white text-zinc-900 rounded-2xl flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-20"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Nav Simulation */}
            <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0A0B10] to-transparent pointer-events-none z-[1000]"></div>
        </div>
    );
};

export default RiderDashboard;
