'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Role } from '../types';
import {
  Layers,
  Building2,
  User as UserIcon,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

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
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
      isDark
        ? 'bg-[#141d13] text-[#fefae0] selection:bg-[#556b2f] selection:text-[#fefae0]'
        : 'bg-[#faf8f3] text-[#1b2819] selection:bg-[#385233] selection:text-[#fefae0]'
    }`}>
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-2 shadow-sm ${
            isDark
              ? 'bg-[#283925] hover:bg-[#3c5638] text-[#fefae0] border-[#3c5638]'
              : 'bg-white hover:bg-[#e9edc9] text-[#1b2819] border-[#d4ddcf]'
          }`}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-300" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[#385233]" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      <div className={`relative w-full max-w-md border rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 ${
        isDark
          ? 'bg-[#1f2c1d]/95 border-[#3c5638] text-[#fefae0]'
          : 'bg-white border-[#d4ddcf] text-[#1b2819]'
      }`}>
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className={`h-12 w-12 mx-auto rounded-2xl flex items-center justify-center shadow-md ring-1 ${
            isDark
              ? 'bg-gradient-to-br from-[#386641] via-[#283925] to-[#141d13] ring-[#e9edc9]/30 text-[#fefae0]'
              : 'bg-gradient-to-br from-[#556b2f] via-[#385233] to-[#1b2819] ring-[#385233]/20 text-[#fefae0]'
          }`}>
            <Layers className="h-7 w-7" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">TeamSync</h1>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1 ${
              isDark
                ? 'bg-[#3c5638]/60 text-[#e9edc9] border-[#556b2f]'
                : 'bg-[#e9edc9] text-[#1b2819] border-[#d4ddcf]'
            }`}>
              <Building2 className="w-2.5 h-2.5" /> MNC Enterprise
            </span>
          </div>
          <p className={`text-xs ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
            Team Project & Task Management Suite
          </p>
        </div>

        {/* Tab Switcher: Login vs Sign Up */}
        <div className={`flex p-1 rounded-2xl border ${
          isDark
            ? 'bg-[#141d13] border-[#3c5638]'
            : 'bg-[#faf8f3] border-[#d4ddcf]'
        }`}>
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'login'
                ? isDark
                  ? 'bg-[#556b2f] text-[#fefae0] shadow-md'
                  : 'bg-[#385233] text-[#fefae0] shadow-md'
                : isDark
                  ? 'text-[#e9edc9] hover:text-[#fefae0]'
                  : 'text-[#556b2f] hover:text-[#1b2819]'
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
                ? isDark
                  ? 'bg-[#556b2f] text-[#fefae0] shadow-md'
                  : 'bg-[#385233] text-[#fefae0] shadow-md'
                : isDark
                  ? 'text-[#e9edc9] hover:text-[#fefae0]'
                  : 'text-[#556b2f] hover:text-[#1b2819]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 text-xs bg-rose-500/20 text-rose-700 border border-rose-400 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3 text-xs bg-[#e9edc9] text-[#1b2819] border border-[#385233] rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#385233]" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                Username / Email
              </label>
              <div className="relative">
                <UserIcon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`} />
                <input
                  type="text"
                  required
                  placeholder="e.g. admin or alice"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className={`w-full text-xs rounded-xl pl-10 pr-4 py-2.5 border focus:outline-none ${
                    isDark
                      ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638] focus:ring-2 focus:ring-[#556b2f]'
                      : 'bg-white text-[#1b2819] border-[#d4ddcf] focus:ring-2 focus:ring-[#385233]'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={`w-full text-xs rounded-xl px-4 py-2.5 border focus:outline-none ${
                  isDark
                    ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638] focus:ring-2 focus:ring-[#556b2f]'
                    : 'bg-white text-[#1b2819] border-[#d4ddcf] focus:ring-2 focus:ring-[#385233]'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 ${
                isDark
                  ? 'bg-[#556b2f] hover:bg-[#606c38] text-[#fefae0]'
                  : 'bg-[#385233] hover:bg-[#283b24] text-[#fefae0]'
              }`}
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
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                Username <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. johndoe"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                className={`w-full text-xs rounded-xl px-3 py-2 border focus:outline-none ${
                  isDark
                    ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                    : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="john@teamsync.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className={`w-full text-xs rounded-xl px-3 py-2 border focus:outline-none ${
                  isDark
                    ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                    : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="John"
                  value={signupFirstName}
                  onChange={(e) => setSignupFirstName(e.target.value)}
                  className={`w-full text-xs rounded-xl px-3 py-2 border focus:outline-none ${
                    isDark
                      ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                      : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={signupLastName}
                  onChange={(e) => setSignupLastName(e.target.value)}
                  className={`w-full text-xs rounded-xl px-3 py-2 border focus:outline-none ${
                    isDark
                      ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                      : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                  Account Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value as Role)}
                  className={`w-full text-xs rounded-xl px-3 py-2 border focus:outline-none ${
                    isDark
                      ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                      : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                  }`}
                >
                  <option value="MEMBER">Team Member</option>
                  <option value="ADMIN">Admin 👑</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                  Department
                </label>
                <input
                  type="text"
                  placeholder="Engineering"
                  value={signupDepartment}
                  onChange={(e) => setSignupDepartment(e.target.value)}
                  className={`w-full text-xs rounded-xl px-3 py-2 border focus:outline-none ${
                    isDark
                      ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                      : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className={`w-full text-xs rounded-xl px-3 py-2 border focus:outline-none ${
                  isDark
                    ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                    : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 ${
                isDark
                  ? 'bg-[#556b2f] hover:bg-[#606c38] text-[#fefae0]'
                  : 'bg-[#385233] hover:bg-[#283b24] text-[#fefae0]'
              }`}
            >
              <span>{loading ? 'Creating Account...' : `Register as ${signupRole === 'ADMIN' ? 'Admin' : 'Team Member'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className={`pt-4 border-t text-center text-[10px] font-medium ${
          isDark ? 'border-[#3c5638] text-[#e9edc9]/90' : 'border-[#d4ddcf] text-[#556b2f]'
        }`}>
          Copyright © 2026 Rajkumar PR. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};
