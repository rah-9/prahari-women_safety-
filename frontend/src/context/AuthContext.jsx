import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Decode user from localStorage token or re-fetch profile
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    setToken(data.token);
    setUser(data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
  };

  const register = async (userData) => {
    const data = await registerApi(userData);
    setToken(data.token);
    setUser(data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
