'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import {
  Layers,
  Building2,
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  User as UserIcon,
  Briefcase,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupRole, setSignupRole] = useState<Role>('MEMBER');
  const [signupDepartment, setSignupDepartment] = useState('Engineering');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setError('Please enter username and password.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await login(loginUsername.trim(), loginPassword.trim());
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupUsername.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await register({
        username: signupUsername.trim(),
        email: signupEmail.trim(),
        password: signupPassword.trim(),
        first_name: signupFirstName.trim(),
        last_name: signupLastName.trim(),
        role: signupRole,
        department: signupDepartment.trim(),
      });
      setSuccessMessage(`Account created as ${signupRole === 'ADMIN' ? 'Admin' : 'Team Member'}! Logging in...`);
      // Auto login newly registered user
      await login(signupUsername.trim(), signupPassword.trim());
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2a040d] text-white flex items-center justify-center p-4 selection:bg-rose-800 selection:text-white">
      {/* Background Glow Overlay */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-rose-950/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-[#4c0519]/95 border border-rose-900/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 mx-auto rounded-2xl bg-gradient-to-br from-rose-700 via-rose-900 to-rose-950 flex items-center justify-center shadow-xl shadow-rose-950/50 ring-1 ring-white/30">
            <Layers className="h-7 w-7 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">TeamSync</h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-900/60 text-rose-200 border border-rose-700 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-2.5 h-2.5" /> MNC Enterprise
            </span>
          </div>
          <p className="text-xs text-rose-200">
            Team Project & Task Management Suite
          </p>
        </div>

        {/* Tab Switcher: Login vs Sign Up */}
        <div className="flex bg-[#3b0712] p-1 rounded-2xl border border-rose-900">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'login'
                ? 'bg-rose-800 text-white shadow-md'
                : 'text-rose-300 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'signup'
                ? 'bg-rose-800 text-white shadow-md'
                : 'text-rose-300 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 text-xs bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Username / Email
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. admin or alice"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-2.5 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-2.5 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Enterprise SSO Login Options */}
            <div className="pt-3 border-t border-slate-800/80 space-y-3">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <span className="relative px-3 bg-slate-900 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Or continue with
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  className="p-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700/80 flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                    />
                  </svg>
                  <span>Gmail</span>
                </button>

                <button
                  type="button"
                  className="p-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700/80 flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.97.99-3.12-1 .04-2.19.67-2.88 1.48-.61.72-1.15 1.89-.99 3.01 1.12.09 2.22-.55 2.88-1.37z" />
                  </svg>
                  <span>Apple</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* SIGN UP FORM WITH ROLE DROPDOWN */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah"
                  value={signupFirstName}
                  onChange={(e) => setSignupFirstName(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Connor"
                  value={signupLastName}
                  onChange={(e) => setSignupLastName(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="sarahc"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="sarah@teamsync.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* ROLE DROPDOWN: ADMIN vs TEAM MEMBER */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1 flex items-center gap-1">
                  <span>Role Dropdown</span>
                  <span className="text-rose-400">*</span>
                </label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value as Role)}
                  className="w-full bg-slate-800 text-slate-100 font-bold text-xs rounded-xl px-3 py-2 border-2 border-indigo-500/60 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="MEMBER">Team Member 👤</option>
                  <option value="ADMIN">Admin 👑</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="Engineering"
                  value={signupDepartment}
                  onChange={(e) => setSignupDepartment(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-rose-800 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/40 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : `Register as ${signupRole === 'ADMIN' ? 'Admin' : 'Team Member'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-rose-900/60 text-center text-[10px] text-rose-200/90 font-medium">
          Copyright © 2026 Rajkumar PR. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};
