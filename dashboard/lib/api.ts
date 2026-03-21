import axios from 'axios';

// Create a new axios instance with a custom config
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

if (typeof window !== 'undefined') {
    console.log('📡 API Base URL:', api.defaults.baseURL);
}

// Add a request interceptor to attach the token if it exists
api.interceptors.request.use(
    (config) => {
        // TODO: Connect this to real auth state later
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Handle regional RBAC for demonstration
        const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : '0282ddf2-e676-492d-a89c-89fd57ace2a9';
        if (userId) {
            config.headers['x-user-id'] = userId;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
