import axios from 'axios';

const api = axios.create({ 
  // FORCE the live backend URL directly
  baseURL: 'https://muslim-jamaa-api.onrender.com/api' 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;