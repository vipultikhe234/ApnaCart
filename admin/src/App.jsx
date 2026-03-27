import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Login from './pages/Login';
import Orders from './pages/Orders';
import MerchantDashboard from './pages/MerchantDashboard';
import LiveMonitor from './pages/LiveMonitor';
import RiderStaff from './pages/RiderStaff';
import Coupons from './pages/Coupons';
import MerchantProfile from './pages/MerchantProfile';
import Merchants from './pages/Merchants';
import Users from './pages/Users';
import UserProfile from './pages/UserProfile';
import LocationMaster from './pages/LocationMaster';
import Offers from './pages/Offers';

import { MerchantProvider } from './contexts/MerchantContext';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <MerchantProvider>
        <Toaster 
            position="top-right" 
            toastOptions={{ 
                style: { 
                    background: '#18181b', 
                    color: '#fff', 
                    fontSize: '11px', 
                    fontWeight: '900', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em', 
                    border: '1px solid #27272a',
                    borderRadius: '16px',
                    padding: '16px 24px'
                },
                success: {
                    iconTheme: { primary: '#10b981', secondary: '#18181b' }
                },
                error: {
                    iconTheme: { primary: '#ef4444', secondary: '#18181b' }
                }
            }} 
        />
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="merchant-dashboard" element={<MerchantDashboard />} />
          <Route path="live-monitor" element={<LiveMonitor />} />
          <Route path="rider-staff" element={<RiderStaff />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="offers" element={<Offers />} />
          <Route path="users" element={<Users />} />
          <Route path="profile" element={<MerchantProfile />} />
          <Route path="my-profile" element={<UserProfile />} />
          <Route path="Merchants" element={<Merchants />} />
          <Route path="location-master" element={<LocationMaster />} />
        </Route>
        </Routes>
      </MerchantProvider>
    </BrowserRouter>
  );
}

export default App;

