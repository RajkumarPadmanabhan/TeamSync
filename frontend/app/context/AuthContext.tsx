'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  allUsers: User[];
  loginAs: (username: string) => Promise<void>;
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

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const currentUser = await api.getMe();
      setUser(currentUser);
      const usersList = await api.getUsers();
      setAllUsers(usersList);
      setError(null);
    } catch (err: any) {
      console.log('No active session, auto-logging in as Admin for demo preview.');
      // Auto-login default demo user (admin)
      await loginAs('admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const loginAs = async (username: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.login(username, 'password123');
      setUser(res.user);
      const usersList = await api.getUsers();
      setAllUsers(usersList);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const refreshUsers = async () => {
    try {
      const usersList = await api.getUsers();
      setAllUsers(usersList);
    } catch (err) {
      console.error(err);
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
        loginAs,
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
