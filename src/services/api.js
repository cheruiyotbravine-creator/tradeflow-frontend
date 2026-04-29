import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Deriv API calls
export const derivAPI = {
  getSymbols: () => api.get('/deriv/symbols'),
  getTicks: (symbol) => api.get(`/deriv/ticks/${symbol}`),
  getBalance: () => api.get('/deriv/balance'),
  placeTrade: (data) => api.post('/deriv/trade', data),
  getHistory: () => api.get('/deriv/history'),
  getLiveHistory: () => api.get('/deriv/history/live'),
};

// Referral API calls ← NEW
export const referralAPI = {
  getStats: () => api.get('/referral/stats'),
  getLeaderboard: () => api.get('/referral/leaderboard'),
  claimReward: () => api.post('/referral/claim'),
};

export default api;