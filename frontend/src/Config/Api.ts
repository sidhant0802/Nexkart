import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
export const DEPLOYED_URL = "https://nexkart-0th3.onrender.com";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
