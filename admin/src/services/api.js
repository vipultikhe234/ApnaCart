import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle 401s
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
    register: (data) => api.post('/register', data),
    login: (data) => api.post('/login', data),
    getProfile: () => api.get('/profile'),
    updateProfile: (data) => api.put('/profile', data),
    logout: () => {
        return api.post('/logout').finally(() => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
        });
    },
    listUsers: () => api.get('/admin/users'), // Admin only
};

export const productService = {
    getAll: (MerchantId = null) => api.get('/products', { params: { merchant_id: MerchantId } }),
    getCategories: (MerchantId = null) => api.get('/categories', { params: { merchant_id: MerchantId } }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    uploadImage: (formData) => api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const categoryService = {
    getAll: (MerchantId = null) => api.get('/categories', { params: { merchant_id: MerchantId } }),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

export const orderService = {
    getUserOrders: () => api.get('/orders'),
    getOrder: (id) => api.get(`/orders/${id}`),
    getAllOrders: (MerchantId = null) => api.get('/orders', { params: { merchant_id: MerchantId } }),
    getStats: (MerchantId = null) => api.get('/stats', { params: { merchant_id: MerchantId } }), 
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
    updatePaymentStatus: (id, status) => api.patch(`/orders/${id}/payment-status`, { status }),
    initiatePayment: (id) => api.post(`/orders/${id}/initiate-payment`),
};

export const couponService = {
    getAll: (MerchantId = null) => api.get('/coupons', { params: { merchant_id: MerchantId } }),
    create: (data) => api.post('/coupons', data),
    update: (id, data) => api.put(`/coupons/${id}`, data),
    delete: (id) => api.delete(`/coupons/${id}`),
};

export const MerchantService = {
    listAll: () => api.get('/admin/merchants'), // Admin view
    createMerchant: (data) => api.post('/admin/merchants', data), // Admin action
    updateMerchant: (id, data) => api.put(`/admin/merchants/${id}`, data), // Admin update
    getProfile: () => api.get('/merchant/profile'), // Merchant view their own
    updateProfile: (data) => api.put('/merchant/profile', data),
    toggleStatus: (id) => api.patch(`/admin/merchants/${id}/toggle`), 
};

// Public cascading dropdown endpoints (no auth needed)
export const locationService = {
    // Public reads
    getCountries: () => api.get('/locations/countries'),
    getStates: (countryId) => api.get('/locations/states', { params: { country_id: countryId } }),
    getCities: (stateId) => api.get('/locations/cities', { params: { state_id: stateId } }),

    // Admin CRUD — Countries
    adminGetCountries: () => api.get('/admin/locations/countries'),
    adminCreateCountry: (data) => api.post('/admin/locations/countries', data),
    adminUpdateCountry: (id, data) => api.put(`/admin/locations/countries/${id}`, data),
    adminDeleteCountry: (id) => api.delete(`/admin/locations/countries/${id}`),

    // Admin CRUD — States
    adminGetStates: (countryId = null) => api.get('/admin/locations/states', { params: countryId ? { country_id: countryId } : {} }),
    adminCreateState: (data) => api.post('/admin/locations/states', data),
    adminUpdateState: (id, data) => api.put(`/admin/locations/states/${id}`, data),
    adminDeleteState: (id) => api.delete(`/admin/locations/states/${id}`),

    // Admin CRUD — Cities
    adminGetCities: (stateId = null) => api.get('/admin/locations/cities', { params: stateId ? { state_id: stateId } : {} }),
    adminCreateCity: (data) => api.post('/admin/locations/cities', data),
    adminUpdateCity: (id, data) => api.put(`/admin/locations/cities/${id}`, data),
    adminDeleteCity: (id) => api.delete(`/admin/locations/cities/${id}`),
};

export default api;

