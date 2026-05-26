import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const http = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

http.interceptors.response.use(
    (res) => res,
    (err) => {
        const message = err?.response?.data?.message || err?.message || 'Lỗi kết nối máy chủ';
        return Promise.reject({ status: err?.response?.status, message, data: err?.response?.data, raw: err });
    }
);

export const get = async (url, config) => (await http.get(url, config)).data;
export const post = async (url, body, config) => (await http.post(url, body, config)).data;
export const put = async (url, body, config) => (await http.put(url, body, config)).data;
export const patch = async (url, body, config) => (await http.patch(url, body, config)).data;
export const del = async (url, config) => (await http.delete(url, config)).data;

export default http;
