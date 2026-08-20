'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Layers,
  Building2,
  Search,
  RefreshCw,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  onRefresh?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openEditProfileModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefresh, searchQuery, setSearchQuery, openEditProfileModal }) => {
  const { user, logout, isAdmin, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur border-b px-4 lg:px-8 py-3 transition-all ${
      isDark
        ? 'bg-[#1f2c1d]/95 border-[#3c5638] text-[#fefae0]'
        : 'bg-[#f7f4ec]/95 border-[#d4ddcf] text-[#1b2819]'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-md ring-1 ${
            isDark
              ? 'bg-gradient-to-br from-[#386641] via-[#283925] to-[#141d13] shadow-black/40 ring-[#e9edc9]/30 text-[#fefae0]'
              : 'bg-gradient-to-br from-[#556b2f] via-[#385233] to-[#1b2819] shadow-slate-300 ring-[#385233]/20 text-[#fefae0]'
          }`}>
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-extrabold text-lg tracking-tight ${isDark ? 'text-[#fefae0]' : 'text-[#1b2819]'}`}>
                TeamSync
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1 ${
                isDark
                  ? 'bg-[#3c5638]/60 text-[#e9edc9] border-[#556b2f]'
                  : 'bg-[#e9edc9] text-[#1b2819] border-[#385233]/40'
              }`}>
                <Building2 className="w-2.5 h-2.5" /> MNC Enterprise
              </span>
            </div>
            <p className={`text-[11px] font-medium hidden sm:block ${isDark ? 'text-[#e9edc9]/80' : 'text-[#556b2f]'}`}>
              Copyright © 2026 Rajkumar PR. All Rights Reserved.
            </p>
          </div>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`} />
            <input
              type="text"
              placeholder="Search projects, tasks, assignees, or priorities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-xs rounded-xl pl-10 pr-4 py-2.5 border focus:outline-none transition ${
                isDark
                  ? 'bg-[#141d13] text-[#fefae0] placeholder-[#e9edc9]/60 border-[#3c5638] focus:ring-2 focus:ring-[#556b2f]'
                  : 'bg-white text-[#1b2819] placeholder-[#556b2f]/60 border-[#d4ddcf] focus:ring-2 focus:ring-[#385233]'
              }`}
            />
          </div>
        </div>

        {/* User Account Controls & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* DARK / LIGHT MODE TOGGLE BUTTON */}
          <button
            onClick={toggleTheme}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              isDark
                ? 'bg-[#283925] hover:bg-[#3c5638] text-[#fefae0] border-[#3c5638]'
                : 'bg-white hover:bg-[#e9edc9] text-[#1b2819] border-[#d4ddcf]'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#385233]" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className={`p-2 rounded-xl border transition flex items-center gap-1 text-xs font-medium ${
                isDark
                  ? 'text-[#e9edc9] hover:text-[#fefae0] bg-[#283925] hover:bg-[#3c5638] border-[#3c5638]'
                  : 'text-[#1b2819] hover:text-[#385233] bg-white hover:bg-[#e9edc9] border-[#d4ddcf]'
              }`}
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}

          {/* Active User Badge & Role Tag */}
          {user && (
            <div className="flex items-center gap-2">
              <div
                onClick={openEditProfileModal}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border cursor-pointer transition ${
                  isDark
                    ? 'bg-[#283925] hover:bg-[#3c5638] border-[#3c5638]'
                    : 'bg-white hover:bg-[#e9edc9] border-[#d4ddcf]'
                }`}
                title="Click to edit profile info (email, name, role, department)"
              >
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || user.username)}&background=556b2f&color=fefae0`}
                  alt={user.username}
                  className="w-7 h-7 rounded-full ring-2 ring-[#556b2f]/40 object-cover"
                />
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold leading-tight ${isDark ? 'text-[#fefae0]' : 'text-[#1b2819]'}`}>
                      {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
                    </span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${
                      isAdmin
                        ? isDark
                          ? 'bg-[#fefae0] text-[#141d13] border-[#fefae0]'
                          : 'bg-[#1b2819] text-[#fefae0] border-[#1b2819]'
                        : isDark
                          ? 'bg-[#3c5638] text-[#fefae0] border-[#556b2f]'
                          : 'bg-[#e9edc9] text-[#1b2819] border-[#385233]'
                    }`}>
                      {isAdmin ? 'Admin' : 'Member'}
                    </span>
                  </div>
                  <p className={`text-[10px] font-medium ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                    {user.department || (isAdmin ? 'Admin' : 'Member')}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-semibold ${
                  isDark
                    ? 'text-[#e9edc9] hover:text-white hover:bg-[#3c5638]'
                    : 'text-[#1b2819] hover:text-rose-700 hover:bg-[#e9edc9]'
                }`}
                title="Logout Session"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
