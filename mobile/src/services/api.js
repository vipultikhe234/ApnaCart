import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://foodhub-backend-2alg.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 30000, // 30s timeout
});

// ── In-memory cache for GET requests ──────────────────────────────────────
const cache = new Map();         // url → { data, expiry }
const pending = new Map();         // url → Promise  (dedup inflight requests)
const CACHE_TTL = 60 * 1000;       // 1 minute default TTL

export function bustCache(pattern) {
    cache.forEach((_, key) => {
        if (key.includes(pattern)) cache.delete(key);
    });
}

// ── Request interceptor ────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ── Response interceptor ───────────────────────────────────────────────────
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

// ── Cached GET helper ──────────────────────────────────────────────────────
function cachedGet(url, ttl = CACHE_TTL) {
    const now = Date.now();

    // Return cached data if still fresh
    const hit = cache.get(url);
    if (hit && hit.expiry > now) {
        return Promise.resolve(hit.data);
    }

    // Dedup: if same URL is already in-flight, share the same promise
    if (pending.has(url)) return pending.get(url);

    const req = api.get(url).then((res) => {
        cache.set(url, { data: res, expiry: now + ttl });
        pending.delete(url);
        return res;
    }).catch((err) => {
        pending.delete(url);
        throw err;
    });

    pending.set(url, req);
    return req;
}

// ── Auth Service ───────────────────────────────────────────────────────────
export const authService = {
    register: (data) => api.post('/register', data),
    login: (data) => api.post('/login', data),
    getProfile: () => api.get('/profile'),
    updateProfile: (data) => api.put('/profile', data),
    logout: async () => {
        try {
            await api.post('/remove-fcm-token').catch(() => {}); // Try to remove token first
        } catch (e) {
            console.error('Logout: Failed to remove FCM token', e);
        }
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        bustCache('/profile');
        return api.post('/logout');
    },
};

// ── Product Service ────────────────────────────────────────────────────────
export const productService = {
    // Use cached GET — products list rarely changes
    getAll: () => cachedGet('/products', 5 * 60 * 1000),       // 5 min
    getCategories: () => cachedGet('/categories', 10 * 60 * 1000),    // 10 min
    getById: (id) => cachedGet(`/products/${id}`, 5 * 60 * 1000),
    addReview: (id, data) => {
        bustCache(`/products/${id}`);
        bustCache('/products');
        return api.post(`/products/${id}/reviews`, data);
    },
};

// ── Order Service ──────────────────────────────────────────────────────────
export const orderService = {
    placeOrder: (data) => {
        bustCache('/orders');     // Clear order cache on new order
        return api.post('/orders', data);
    },
    getUserOrders: () => cachedGet('/orders', 30 * 1000),    // 30s
    getOrder: (id) => cachedGet(`/orders/${id}`, 15 * 1000), // 15s
    confirmPayment: (data) => {
        bustCache('/orders');
        return api.post('/payments/confirm', data);
    },
};

// ── Coupon Service ─────────────────────────────────────────────────────────
export const couponService = {
    validate: (code, amount) => api.post('/coupons/validate', { code, order_amount: amount }),
};

// ── Address Service ────────────────────────────────────────────────────────
export const addressService = {
    getAddresses: () => api.get('/addresses'),
    addAddress: (data) => api.post('/addresses', data),
};

// ── FCM Service ────────────────────────────────────────────────────────────
export const fcmService = {
    saveToken: (token) => api.post('/save-fcm-token', { fcm_token: token }),
    removeToken: () => api.post('/remove-fcm-token'),
    getStatus: () => api.get('/fcm-status'),
    sendManualNotification: (data) => api.post('/send-notification', data),
};

export default api;
