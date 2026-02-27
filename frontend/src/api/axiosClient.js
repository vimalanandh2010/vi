import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const axiosClient = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log('--- AxiosClient Initialized ---');
console.log('Base URL:', baseURL);

// Request Interceptor
axiosClient.interceptors.request.use(
    (config) => {
        // Strictly respect manual Authorization headers if already present
        if (config.headers.Authorization && config.headers.Authorization.startsWith('Bearer ') && !config.headers.Authorization.includes('null')) {
            console.log('[AxiosClient] Using manual Authorization header override');
            return config;
        }

        const recruiterToken = sessionStorage.getItem('recruiterToken') || localStorage.getItem('recruiterToken');
        const seekerToken = sessionStorage.getItem('seekerToken') || localStorage.getItem('seekerToken');
        const path = window.location.pathname;
        // Also check the API endpoint being called
        const apiPath = (config.url || '').toLowerCase();
        let token = null;

        if (path.includes('/recruiter') || path.includes('/employer') || apiPath.includes('/recruiter')) {
            token = recruiterToken || seekerToken; // fallback to seeker if recruiter token missing
            console.log('[AxiosClient] Selecting Recruiter Token for path:', path);
        } else if (path.includes('/seeker') || apiPath.includes('/seeker')) {
            token = seekerToken || recruiterToken; // fallback to recruiter if seeker token missing
            console.log('[AxiosClient] Selecting Seeker Token for path:', path);
        } else {
            // General pages — use whatever is available
            token = seekerToken || recruiterToken;
            console.log('[AxiosClient] Selecting Default Token for path:', path);
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('[AxiosClient] No token found for path:', path);
        }

        console.log(`[AxiosClient] Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosClient.interceptors.response.use(
    (response) => {
        // Standardize response: Only for plain objects to avoid corrupting Buffers, Blobs, etc.
        const isPlainObject = response.data &&
            typeof response.data === 'object' &&
            Object.prototype.toString.call(response.data) === '[object Object]';

        if (isPlainObject) {
            response.data.status = response.status;
            response.data.ok = response.status >= 200 && response.status < 300;
        }
        return response.data;
    },
    (error) => {
        // Restore standard Axios behavior: Reject on HTTP errors (4xx, 5xx)
        // This ensures try/catch blocks in existing components work correctly.
        if (error.response) {
            console.error('API Error:', error.response.data?.message || error.response.statusText);
        } else {
            console.error('Network Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
