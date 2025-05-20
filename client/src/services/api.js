import axios from 'axios';

// Create an instance of axios with the base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://blog-app-1ntb.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      console.log('Response data:', error.response.data);
      console.log('Response status:', error.response.status);
    } else if (error.request) {
      console.log('Request error - no response received');
    } else {
      console.log('Error message:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

