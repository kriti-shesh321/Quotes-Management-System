import axios from 'axios';

const base = import.meta.env.VITE_BACKEND_URL || '';
const API_BASE = base ? `${base.replace(/\/$/, '')}/api/v1` : '/api/v1';

export const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

const storedToken = localStorage.getItem('token');
if (storedToken) {
    api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            if (!config.headers) config.headers = new axios.AxiosHeaders();
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    err => Promise.reject(err)
);
