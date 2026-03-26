import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://foodhub-backend-2alg.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

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
    login: (data) => api.post('/login', data),
    getProfile: () => api.get('/profile'),
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        return api.post('/logout');
    },
};

export const riderService = {
    getAvailableOrders: () => api.get('/rider/orders/available'),
    acceptOrder: (id) => api.post(`/rider/orders/${id}/accept`),
    updateLocation: (lat, lng) => api.post('/rider/location', { lat, lng }),
    completeOrder: (id) => api.post(`/rider/orders/${id}/complete`),
    getHistory: () => api.get('/rider/orders/history'), // Placeholder for history
};

export default api;
