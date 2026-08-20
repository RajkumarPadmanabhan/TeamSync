'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import {
  Layers,
  Building2,
  User as UserIcon,
  ArrowRight,
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
      await login(signupUsername.trim(), signupPassword.trim());
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141d13] text-[#fefae0] flex items-center justify-center p-4 selection:bg-[#556b2f] selection:text-[#fefae0]">
      {/* Background Glow Overlay */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#386641]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#283925]/40 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-[#1f2c1d]/95 border border-[#3c5638] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 mx-auto rounded-2xl bg-gradient-to-br from-[#386641] via-[#283925] to-[#141d13] flex items-center justify-center shadow-xl shadow-black/50 ring-1 ring-[#e9edc9]/30">
            <Layers className="h-7 w-7 text-[#fefae0]" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#fefae0] tracking-tight">TeamSync</h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#3c5638]/60 text-[#e9edc9] border border-[#556b2f] uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-2.5 h-2.5" /> MNC Enterprise
            </span>
          </div>
          <p className="text-xs text-[#e9edc9]">
            Team Project & Task Management Suite
          </p>
        </div>

        {/* Tab Switcher: Login vs Sign Up */}
        <div className="flex bg-[#141d13] p-1 rounded-2xl border border-[#3c5638]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'login'
                ? 'bg-[#556b2f] text-[#fefae0] shadow-md'
                : 'text-[#e9edc9] hover:text-[#fefae0]'
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
                ? 'bg-[#556b2f] text-[#fefae0] shadow-md'
                : 'text-[#e9edc9] hover:text-[#fefae0]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 text-xs bg-rose-950/60 text-rose-200 border border-rose-800 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3 text-xs bg-[#283925] text-[#e9edc9] border border-[#556b2f] rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#e9edc9] mb-1">
                Username / Email
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e9edc9]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. admin or alice"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-[#141d13] text-[#fefae0] placeholder-[#e9edc9]/50 text-xs rounded-xl pl-10 pr-4 py-2.5 border border-[#3c5638] focus:ring-2 focus:ring-[#556b2f] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#e9edc9] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-[#141d13] text-[#fefae0] placeholder-[#e9edc9]/50 text-xs rounded-xl px-4 py-2.5 border border-[#3c5638] focus:ring-2 focus:ring-[#556b2f] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#556b2f] hover:bg-[#606c38] text-[#fefae0] font-bold text-xs rounded-xl shadow-lg shadow-black/40 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* SIGNUP FORM */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#e9edc9] mb-1">
                Username <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. johndoe"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                className="w-full bg-[#141d13] text-[#fefae0] text-xs rounded-xl px-3 py-2 border border-[#3c5638] focus:ring-2 focus:ring-[#556b2f] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#e9edc9] mb-1">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="john@teamsync.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full bg-[#141d13] text-[#fefae0] text-xs rounded-xl px-3 py-2 border border-[#3c5638] focus:ring-2 focus:ring-[#556b2f] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#e9edc9] mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="John"
                  value={signupFirstName}
                  onChange={(e) => setSignupFirstName(e.target.value)}
                  className="w-full bg-[#141d13] text-[#fefae0] text-xs rounded-xl px-3 py-2 border border-[#3c5638] focus:ring-2 focus:ring-[#556b2f] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#e9edc9] mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={signupLastName}
                  onChange={(e) => setSignupLastName(e.target.value)}
                  className="w-full bg-[#141d13] text-[#fefae0] text-xs rounded-xl px-3 py-2 border border-[#3c5638] focus:ring-2 focus:ring-[#556b2f] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#e9edc9] mb-1">
                  Account Role <span className="text-rose-400">*</span>
                </label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value as Role)}
                  className="w-full bg-[#141d13] text-[#fefae0] text-xs rounded-xl px-3 py-2 border border-[#3c5638] focus:ring-2 focus:ring-[#556b2f] focus:outline-none"
                >
                  <option value="MEMBER">Team Member</option>
                  <option value="ADMIN">Admin 👑</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#e9edc9] mb-1">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="Engineering"
                  value={signupDepartment}
                  onChange={(e) => setSignupDepartment(e.target.value)}
                  className="w-full bg-[#141d13] text-[#fefae0] text-xs rounded-xl px-3 py-2 border border-[#3c5638] focus:ring-2 focus:ring-[#556b2f] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#e9edc9] mb-1">
                Password <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full bg-[#141d13] text-[#fefae0] text-xs rounded-xl px-3 py-2 border border-[#3c5638] focus:ring-2 focus:ring-[#556b2f] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#556b2f] hover:bg-[#606c38] text-[#fefae0] font-bold text-xs rounded-xl shadow-lg shadow-black/40 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : `Register as ${signupRole === 'ADMIN' ? 'Admin' : 'Team Member'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-[#3c5638] text-center text-[10px] text-[#e9edc9]/90 font-medium">
          Copyright © 2026 Rajkumar PR. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};
