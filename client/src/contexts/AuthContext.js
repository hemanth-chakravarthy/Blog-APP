import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on initial render if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Set token in axios headers
        api.defaults.headers.common['x-auth-token'] = token;
        
        const res = await api.get('/auth/user');
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        // Clear token if invalid
        localStorage.removeItem('token');
        delete api.defaults.headers.common['x-auth-token'];
        console.error('Auth loading error:', err);
        setError(err.response?.data?.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Register user
  const register = async (formData) => {
    try {
      console.log('Registering with data:', formData);
      setError(null);
      
      // Make sure we're using the correct API endpoint
      const res = await api.post('/auth/register', formData);
      console.log('Registration response:', res.data);
      
      if (!res.data.token) {
        console.error('No token received from server');
        setError('Registration failed: No token received');
        return false;
      }
      
      // Set token in local storage
      localStorage.setItem('token', res.data.token);
      
      // Set token in axios headers
      api.defaults.headers.common['x-auth-token'] = res.data.token;
      
      try {
        // Load user data
        const userRes = await api.get('/auth/user');
        console.log('User data response:', userRes.data);
        setUser(userRes.data);
        setIsAuthenticated(true);
        return true;
      } catch (userErr) {
        console.error('Error fetching user after registration:', userErr);
        setError('Registration succeeded but failed to load user data');
        return false;
      }
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      setError(null);
      const res = await api.post('/auth/login', formData);
      
      // Set token in local storage
      localStorage.setItem('token', res.data.token);
      
      // Set token in axios headers
      api.defaults.headers.common['x-auth-token'] = res.data.token;
      
      // Load user data
      const userRes = await api.get('/auth/user');
      setUser(userRes.data);
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['x-auth-token'];
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};



