'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Building2,
  Search,
  RefreshCw,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  onRefresh?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefresh, searchQuery, setSearchQuery }) => {
  const { user, logout, isAdmin, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                TeamSync
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-2.5 h-2.5" /> MNC Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Project & Task Management Suite
            </p>
          </div>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects, tasks, assignees, or priorities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 hover:bg-slate-800 text-slate-200 placeholder-slate-400 text-xs rounded-xl pl-10 pr-4 py-2.5 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* User Account Controls */}
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-xl border border-slate-700 transition flex items-center gap-1 text-xs font-medium"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}

          {/* Active User Badge & Role Tag */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || user.username)}&background=3b82f6&color=fff`}
                  alt={user.username}
                  className="w-7 h-7 rounded-full ring-2 ring-indigo-500/40 object-cover"
                />
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-200 leading-tight">
                      {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
                    </span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${isAdmin ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'}`}>
                      {isAdmin ? 'Admin' : 'Member'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {user.department || (isAdmin ? 'Admin' : 'Member')}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition flex items-center gap-1 text-xs font-semibold"
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
