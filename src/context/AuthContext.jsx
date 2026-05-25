import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await api.get('/api/categories');
        const userRes = await api.get('/api/auth/me');
        setUser(userRes.data);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const login = async (username, password) => {
    const payload = {
      username: username,
      password: password
    };
    const response = await api.post('/api/auth/login', payload);
    if (response.status === 200 || response.status === 201) {
      const userRes = await api.get('/api/auth/me');
      setUser(userRes.data);
      setIsAuthenticated(true);
    }
  };

  const register = async (username, password, fullName, phoneNumber) => {
    try {
      const payload = {
        username: username,
        password: password,
        fullName: fullName,
        phoneNumber: phoneNumber
      };
      console.log("REGISTER PAYLOAD:", JSON.stringify({ username, password, fullName, phoneNumber }));
      await api.post('/api/auth/register', payload);
    } catch (error) {
      console.error("REGISTER ERROR:", error.response?.data);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-[#f8fafc] text-xl font-bold">
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
