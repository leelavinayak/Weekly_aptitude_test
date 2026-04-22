import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || `${window.location.origin}/api`
});

// Add a request interceptor to include JWT in headers
api.interceptors.request.use(
    (config) => {
        // Try reading from 'userInfo' object first (primary auth store)
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const { token } = JSON.parse(userInfo);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (e) {
                // Corrupted userInfo — clear it
                localStorage.removeItem('userInfo');
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle expired/invalid sessions
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear stale auth data
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
            // Redirect to login only if not already there
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
