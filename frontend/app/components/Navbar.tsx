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
  openEditProfileModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefresh, searchQuery, setSearchQuery, openEditProfileModal }) => {
  const { user, logout, isAdmin, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#4c0519]/95 backdrop-blur border-b border-rose-900/60 text-white px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-700 via-rose-900 to-rose-950 flex items-center justify-center shadow-lg shadow-rose-950/40 ring-1 ring-white/30">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                TeamSync
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-900/50 text-rose-200 border border-rose-700/60 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-2.5 h-2.5" /> MNC Enterprise
              </span>
            </div>
            <p className="text-[11px] text-rose-200/80 font-medium hidden sm:block">
              Copyright © 2026 Rajkumar PR. All Rights Reserved.
            </p>
          </div>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
            <input
              type="text"
              placeholder="Search projects, tasks, assignees, or priorities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#3b0712] hover:bg-[#4c0519] text-white placeholder-rose-300/60 text-xs rounded-xl pl-10 pr-4 py-2.5 border border-rose-800/80 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-400 transition"
            />
          </div>
        </div>

        {/* User Account Controls */}
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-rose-200 hover:text-white bg-[#581123] hover:bg-rose-900 rounded-xl border border-rose-800 transition flex items-center gap-1 text-xs font-medium"
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
                className="flex items-center gap-2.5 bg-[#581123] hover:bg-rose-900 px-3 py-1.5 rounded-xl border border-rose-800/80 cursor-pointer transition"
                title="Click to edit profile info (email, name, role, department)"
              >
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || user.username)}&background=800020&color=fff`}
                  alt={user.username}
                  className="w-7 h-7 rounded-full ring-2 ring-white/40 object-cover"
                />
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white leading-tight">
                      {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
                    </span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${isAdmin ? 'bg-white text-rose-950 font-black border-white' : 'bg-rose-900/60 text-white border-rose-700'}`}>
                      {isAdmin ? 'Admin' : 'Member'}
                    </span>
                  </div>
                  <p className="text-[10px] text-rose-200 font-medium">
                    {user.department || (isAdmin ? 'Admin' : 'Member')}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-rose-200 hover:text-white hover:bg-rose-900 rounded-xl transition flex items-center gap-1 text-xs font-semibold"
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
