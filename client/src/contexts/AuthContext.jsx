import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

// Create the context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Load user from localStorage on initial load
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if we have a token
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Set the token in axios headers
        api.defaults.headers.common['x-auth-token'] = token;
        
        // Fetch user data
        const res = await api.get('/auth/user');
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error loading user:', err);
        // Clear localStorage if token is invalid
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login user
  const login = async (formData) => {
    try {
      setError(null);
      console.log('Attempting login with:', formData.email);
      
      // Make the login request
      const res = await api.post('/auth/login', formData);
      console.log('Login response:', res.data);
      
      if (!res.data.token) {
        throw new Error('No token received from server');
      }
      
      // Set token in local storage
      localStorage.setItem('token', res.data.token);
      
      // Set token in axios headers
      api.defaults.headers.common['x-auth-token'] = res.data.token;
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      // Load user data
      console.log('Fetching user data with token');
      const userRes = await api.get('/auth/user');
      console.log('User data response:', userRes.data);
      
      setUser(userRes.data);
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return false;
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      setError(null);
      
      const res = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (!res.data.token) {
        throw new Error('No token received from server');
      }
      
      // Save token to localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set token in axios headers
      api.defaults.headers.common['x-auth-token'] = res.data.token;
      
      // Fetch user data
      const userRes = await api.get('/auth/user');
      
      // Set user and authentication state
      setUser(userRes.data);
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove token from axios headers
    delete api.defaults.headers.common['x-auth-token'];
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        error,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


