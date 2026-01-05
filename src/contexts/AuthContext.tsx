'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  userId: string;
  email: string;
  fullName: string;
  userType: 'TALENTA' | 'MITRA' | 'INDUSTRI';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: {
    email: string;
    password: string;
    fullName: string;
    userType: 'TALENTA' | 'MITRA' | 'INDUSTRI';
    nik?: string;
    phone?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and user on mount (client-side only)
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user:', error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      
      if (response.success && response.data) {
        const { token: newToken, user: userData, refreshToken } = response.data;
        
        if (!newToken || !userData) {
          console.error('Login response missing token or user:', response);
          return { success: false, message: 'Invalid response from server' };
        }
        
        setToken(newToken);
        setUser(userData);
        
        // Only access localStorage on client
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', newToken);
          localStorage.setItem('user', JSON.stringify(userData));
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
        }
        
        return { success: true };
      }
      
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    fullName: string;
    userType: 'TALENTA' | 'MITRA' | 'INDUSTRI';
    nik?: string;
    phone?: string;
  }) => {
    try {
      const response = await apiClient.register(userData);
      
      if (response.success) {
        return { success: true, message: response.message || 'Registration successful' };
      }
      
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error) {
      return { success: false, message: 'An error occurred during registration' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    // Only access localStorage on client
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    
    apiClient.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}



