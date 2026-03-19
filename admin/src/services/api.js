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
    logout: () => {
        localStorage.removeItem('access_token');
        return api.post('/logout');
    },
};

export const productService = {
    getAll: () => api.get('/products'),
    getCategories: () => api.get('/categories'),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    uploadImage: (formData) => api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const orderService = {
    placeOrder: (data) => api.post('/orders', data),
    getUserOrders: () => api.get('/orders'),
    getOrder: (id) => api.get(`/orders/${id}`),
    getAllOrders: () => api.get('/orders'),
    getStats: () => api.get('/admin/stats'),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
    updatePaymentStatus: (id, status) => api.patch(`/orders/${id}/payment-status`, { status }),
    initiatePayment: (id) => api.post(`/orders/${id}/initiate-payment`),
};

export default api;
