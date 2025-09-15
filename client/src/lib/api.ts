import axios from 'axios';

const API_BASE = '/api/v1';

export const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers['Authorization'] = token;
        }
        return config;
    });
