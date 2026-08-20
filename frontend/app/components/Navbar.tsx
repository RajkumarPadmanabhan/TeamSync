'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  UserCheck,
  Search,
  ChevronDown,
  Bell,
  Sparkles,
  Layers,
  Building2,
  RefreshCw
} from 'lucide-react';

interface NavbarProps {
  onRefresh?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefresh, searchQuery, setSearchQuery }) => {
  const { user, loginAs, isAdmin, allUsers, loading } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const demoAccounts = [
    { username: 'admin', label: 'Admin (Rajkumar)', role: 'ADMIN', dept: 'Leadership' },
    { username: 'alice', label: 'Team Member (Alice)', role: 'MEMBER', dept: 'Frontend' },
    { username: 'bob', label: 'Team Member (Bob)', role: 'MEMBER', dept: 'Backend' },
    { username: 'charlie', label: 'Team Member (Charlie)', role: 'MEMBER', dept: 'UI/UX' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & MNC Title */}
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
              placeholder="Search projects, tasks, assignees, or priority..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 hover:bg-slate-800 text-slate-200 placeholder-slate-400 text-xs rounded-xl pl-10 pr-4 py-2.5 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Role Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition flex items-center gap-1 text-xs font-medium"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-800/90 hover:from-slate-700 hover:to-slate-800 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700/80 shadow-sm transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-slate-300 hidden sm:inline">Switch Role:</span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${isAdmin ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
                {isAdmin ? 'Admin' : 'Team Member'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Role & Account
                  </p>
                  <p className="text-[10px] text-slate-500">Instant 1-Click Role Testing</p>
                </div>
                <div className="mt-1 space-y-1">
                  {demoAccounts.map((acc) => {
                    const isSelected = user?.username === acc.username;
                    return (
                      <button
                        key={acc.username}
                        onClick={() => {
                          loginAs(acc.username);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {acc.role === 'ADMIN' ? (
                            <ShieldCheck className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-emerald-400" />
                          )}
                          <div>
                            <p className="font-semibold text-slate-200">{acc.label}</p>
                            <p className="text-[10px] text-slate-400">{acc.dept}</p>
                          </div>
                        </div>
                        {isSelected && <span className="text-[10px] bg-indigo-500 text-white font-bold px-1.5 py-0.5 rounded">Active</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Current User Pill */}
          {user && (
            <div className="flex items-center gap-2.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || user.username)}&background=3b82f6&color=fff`}
                alt={user.username}
                className="w-7 h-7 rounded-full ring-2 ring-indigo-500/40 object-cover"
              />
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-slate-200 leading-tight">
                  {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {user.department || (isAdmin ? 'Admin' : 'Member')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
