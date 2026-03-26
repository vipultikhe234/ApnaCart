import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
    Activity, 
    Bike, 
    Navigation, 
    Store, 
    Package, 
    AlertCircle, 
    RefreshCw, 
    Map as MapIcon, 
    SearchX, 
    Loader2 
} from 'lucide-react';
import { orderService } from '../services/api';

// Marker Icons
const riderIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3195/3195884.png',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
});

import { useMerchant } from '../contexts/MerchantContext';

const LiveMonitor = () => {
    const { selectedMerchantId } = useMerchant();
    const [riders, setRiders] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    
    // Manual Leaflet Management
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersLayer = useRef(new L.LayerGroup());

    useEffect(() => {
        // Initialize Map once
        if (mapRef.current && !mapInstance.current) {
            mapInstance.current = L.map(mapRef.current, {
                center: [28.6139, 77.2090],
                zoom: 13,
                zoomControl: false,
                attributionControl: false
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstance.current);

            markersLayer.current.addTo(mapInstance.current);
        }

        const fetchMonitorData = async () => {
            try {
                setSyncing(true);
                const orderRes = await orderService.getAllOrders(selectedMerchantId);
                const processedOrders = orderRes?.data?.data || orderRes?.data || [];
                setOrders(Array.isArray(processedOrders) ? processedOrders : []);

                const activeRiders = (Array.isArray(processedOrders) ? processedOrders : [])
                    .filter(o => o.status === 'out_for_delivery' && o.rider?.current_latitude)
                    .map(o => {
                        const distToCustomer = (o.rider?.current_latitude && o.user_lat) 
                            ? getDistance(o.rider.current_latitude, o.rider.current_longitude, o.user_lat, o.user_lng)
                            : null;
                        
                        return {
                            ...o.rider,
                            orderId: o.id,
                            orderRef: `#ORD-${String(o.id).padStart(4, '0')}`,
                            distToCustomer
                        };
                    });
                
                setRiders(activeRiders);
            } catch (err) {
                console.error("Monitor sync failed:", err);
            } finally {
                setLoading(false);
                setSyncing(false);
            }
        };

        fetchMonitorData();
        const interval = setInterval(fetchMonitorData, 15000); 
        return () => clearInterval(interval);
    }, [selectedMerchantId]);

    // Update markers when riders change
    useEffect(() => {
        if (mapInstance.current && markersLayer.current) {
            markersLayer.current.clearLayers();
            
            riders.forEach(rider => {
                const marker = L.marker([rider.current_latitude, rider.current_longitude], { icon: riderIcon });
                marker.bindPopup(`
                    <div style="font-family: sans-serif; padding: 4px;">
                        <p style="font-size: 8px; font-weight: 800; color: #71717a; text-transform: uppercase;">Rider Terminal</p>
                        <h4 style="font-size: 14px; font-weight: 900; color: #18181b; text-transform: uppercase; margin: 2px 0;">${rider.name}</h4>
                        <p style="font-size: 10px; font-weight: 700; color: #10b981;">Active: ${rider.orderRef}</p>
                    </div>
                `);
                marker.addTo(markersLayer.current);
            });
        }
    }, [riders]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-zinc-500 font-medium text-sm animate-pulse tracking-tight">Synchronizing Logistics Grid...</p>
        </div>
    );

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1);
    };

    const stats = {
        totalRiders: riders.length,
        activeOrders: orders.filter(o => !['delivered', 'picked_up', 'cancelled'].includes(o.status)).length,
        alertOrders: orders.filter(o => o.status === 'placed' && (new Date() - new Date(o.created_at) > 15 * 60000)).length
    };

    return (
        <div className="space-y-8 pb-20 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        <MapIcon className="text-emerald-500" />
                        Logistics Live Monitor
                   </h1>
                   <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest leading-none">Global Grid Online</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => window.location.reload()}
                        className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm"
                    >
                         <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                    </button>
                    <div className="bg-zinc-900 dark:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg">
                        Sector: 01 (Hyperlocal)
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 italic">Active Couriers</p>
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">{stats.totalRiders}</h2>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500"><Bike size={24} /></div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 italic">Active Missions</p>
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">{stats.activeOrders}</h2>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500"><Navigation size={24} /></div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 italic">Delay Alerts</p>
                        <h2 className="text-2xl font-black text-red-500 tracking-tighter">{stats.alertOrders}</h2>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500"><AlertCircle size={24} /></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 h-[600px] bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-100 dark:border-zinc-800 shadow-xl relative overflow-hidden">
                    <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
                    
                    <div className="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur-xl border border-zinc-100 px-6 py-4 rounded-[28px] shadow-2xl">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-zinc-900 rounded-2xl flex items-center justify-center text-white"><Package size={18} /></div>
                             <div>
                                <h3 className="text-xs font-black uppercase italic tracking-widest text-zinc-900">Telemetry Feed</h3>
                                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Alpha Sector Node</p>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2 px-2">
                        <Activity size={16} className="text-emerald-500" />
                        Logistics Feed
                    </h3>
                    <div className="space-y-4">
                        {riders.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
                                 <SearchX size={48} className="text-zinc-600" />
                                 <p className="text-[9px] font-bold uppercase tracking-[0.3em] mt-4">Zero Couriers Online</p>
                            </div>
                        ) : (
                            riders.map(rider => (
                                <div key={rider.id} className="bg-white dark:bg-zinc-900 p-5 rounded-[28px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center gap-4 group hover:border-emerald-500/50 transition-all">
                                    <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-300 group-hover:text-emerald-500 transition-colors">
                                        <Bike size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-zinc-900 dark:text-white truncate uppercase italic">{rider.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{rider.orderRef}</p>
                                            {rider.distToCustomer && (
                                                <>
                                                    <span className="text-zinc-300 dark:text-zinc-700 font-bold">•</span>
                                                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                                                        {rider.distToCustomer} KM to DEST
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveMonitor;
