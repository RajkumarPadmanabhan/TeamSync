'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  allUsers: User[];
  login: (username: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const token = api.getToken();
      if (token) {
        // Retrieve profile of strictly logged in / signed up user
        const currentUser = await api.getMe();
        setUser(currentUser);
        const usersList = await api.getUsers();
        setAllUsers(usersList);
      } else {
        // Strictly unauthenticated: force user to sign up or log in
        setUser(null);
      }
      setError(null);
    } catch (err: any) {
      setUser(null);
      api.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.login(username, password);
      setUser(res.user);
      const usersList = await api.getUsers();
      setAllUsers(usersList);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    try {
      setLoading(true);
      setError(null);
      await api.createUser(userData);
      await refreshUsers();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshUsers = async () => {
    try {
      if (api.getToken()) {
        const usersList = await api.getUsers();
        setAllUsers(usersList);
      }
    } catch (err) {
      console.error('Error refreshing users list:', err);
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN' || user?.is_staff === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        allUsers,
        login,
        register,
        logout,
        isAdmin,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
