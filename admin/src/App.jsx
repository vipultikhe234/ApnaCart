import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Coupons from './pages/Coupons';
import RestaurantProfile from './pages/RestaurantProfile';
import Restaurants from './pages/Restaurants';
import Users from './pages/Users';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="users" element={<Users />} />
          <Route path="profile" element={<RestaurantProfile />} />
          <Route path="restaurants" element={<Restaurants />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
