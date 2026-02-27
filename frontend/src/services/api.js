import axios from 'axios';

// Base URL points to the backend API. Adjust if backend runs on a different host/port.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor adds the token from localStorage (generic key "token" or role‑specific keys).
api.interceptors.request.use(
    (config) => {
        // Prefer explicit Authorization header if provided
        if (!config.headers.Authorization) {
            // Prefer generic token if present, otherwise fallback to role‑specific tokens.
            const token = localStorage.getItem('token') ||
                localStorage.getItem('recruiterToken') ||
                localStorage.getItem('seekerToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
