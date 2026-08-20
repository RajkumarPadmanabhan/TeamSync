'use client';

import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  History,
  Users,
  PlusCircle,
  ShieldAlert,
  ChevronRight,
  Mail,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Project } from '../types';

interface SidebarProps {
  activeTab: 'overview' | 'projects' | 'tasks' | 'deadline-history' | 'team' | 'requests';
  setActiveTab: (tab: 'overview' | 'projects' | 'tasks' | 'deadline-history' | 'team' | 'requests') => void;
  projects: Project[];
  selectedProjectId: number | null;
  setSelectedProjectId: (id: number | null) => void;
  openCreateProjectModal: () => void;
  openCreateTaskModal: () => void;
  openCreateUserModal: () => void;
  pendingRequestsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  projects,
  selectedProjectId,
  setSelectedProjectId,
  openCreateProjectModal,
  openCreateTaskModal,
  openCreateUserModal,
  pendingRequestsCount = 0,
}) => {
  const { isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const navItems = [
    { id: 'overview', label: 'Overview & KPIs', icon: LayoutDashboard },
    { id: 'requests', label: 'Project Requests', icon: Mail, count: pendingRequestsCount, badge: pendingRequestsCount > 0 ? 'New' : undefined },
    { id: 'projects', label: 'Projects Workspace', icon: FolderKanban, count: projects.length },
    { id: 'tasks', label: 'Task Management', icon: CheckSquare },
    { id: 'deadline-history', label: 'Deadline Audit Trail', icon: History, badge: 'Required' },
    { id: 'team', label: 'Team Directory', icon: Users },
  ];

  return (
    <aside className={`w-full lg:w-64 backdrop-blur border-r p-4 flex flex-col justify-between shrink-0 transition-colors ${
      isDark
        ? 'bg-[#1a2618]/90 border-[#3c5638] text-[#fefae0]'
        : 'bg-[#faf8f3] border-[#d4ddcf] text-[#1b2819]'
    }`}>
      <div className="space-y-6">
        {/* Quick Action Buttons for Admin */}
        {isAdmin && (
          <div className="space-y-2">
            <p className={`text-[10px] font-bold uppercase tracking-wider px-2 ${isDark ? 'text-[#e9edc9]/80' : 'text-[#556b2f]'}`}>
              Admin Quick Actions
            </p>
            <button
              onClick={openCreateTaskModal}
              className={`w-full font-bold text-xs py-2.5 px-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition ring-1 ${
                isDark
                  ? 'bg-[#556b2f] hover:bg-[#606c38] text-[#fefae0] ring-white/20'
                  : 'bg-[#385233] hover:bg-[#283b24] text-[#fefae0] ring-[#385233]/40'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Task</span>
            </button>
            <button
              onClick={openCreateProjectModal}
              className={`w-full font-semibold text-xs py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition ${
                isDark
                  ? 'bg-[#283925] hover:bg-[#3c5638] text-[#fefae0] border-[#3c5638]'
                  : 'bg-white hover:bg-[#e9edc9] text-[#1b2819] border-[#d4ddcf]'
              }`}
            >
              <FolderKanban className={`w-3.5 h-3.5 ${isDark ? 'text-[#e9edc9]' : 'text-[#385233]'}`} />
              <span>Create Project</span>
            </button>
          </div>
        )}

        {/* Main Navigation */}
        <div className="space-y-1">
          <p className={`text-[10px] font-bold uppercase tracking-wider px-2 mb-2 ${isDark ? 'text-[#e9edc9]/80' : 'text-[#556b2f]'}`}>
            Workspace Views
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                  isActive
                    ? isDark
                      ? 'bg-[#fefae0] text-[#141d13] shadow-md font-extrabold border border-[#fefae0]'
                      : 'bg-[#385233] text-[#fefae0] shadow-md font-extrabold border border-[#385233]'
                    : isDark
                      ? 'hover:bg-[#283925]/60 text-[#e9edc9] hover:text-[#fefae0]'
                      : 'hover:bg-[#e9edc9]/60 text-[#1b2819] hover:text-[#385233]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? (isDark ? 'text-[#141d13]' : 'text-[#fefae0]') : (isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]')}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                    item.badge === 'New'
                      ? 'bg-[#556b2f] text-[#fefae0] border-[#e9edc9] animate-pulse'
                      : isDark
                        ? 'bg-[#141d13] text-[#e9edc9] border-[#3c5638]'
                        : 'bg-[#e9edc9] text-[#1b2819] border-[#d4ddcf]'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                    isActive
                      ? isDark ? 'bg-[#141d13] text-[#fefae0]' : 'bg-[#faf8f3] text-[#1b2819]'
                      : isDark ? 'bg-[#283925] text-[#fefae0] border border-[#3c5638]' : 'bg-white text-[#1b2819] border border-[#d4ddcf]'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Project Selector Filter */}
        <div className={`pt-2 border-t ${isDark ? 'border-[#3c5638]' : 'border-[#d4ddcf]'}`}>
          <div className="flex items-center justify-between px-2 mb-2">
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#e9edc9]/80' : 'text-[#556b2f]'}`}>
              Active Projects
            </p>
            <button
              onClick={() => setSelectedProjectId(null)}
              className={`text-[10px] hover:underline font-semibold ${
                selectedProjectId === null
                  ? isDark ? 'text-[#fefae0] underline font-bold' : 'text-[#1b2819] underline font-bold'
                  : isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'
              }`}
            >
              All Projects
            </button>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {projects.map((proj) => {
              const isSelected = selectedProjectId === proj.id;
              return (
                <button
                  key={proj.id}
                  onClick={() => {
                    setSelectedProjectId(proj.id);
                    if (activeTab !== 'projects' && activeTab !== 'tasks') {
                      setActiveTab('tasks');
                    }
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                    isSelected
                      ? isDark ? 'bg-[#fefae0] text-[#141d13] font-bold' : 'bg-[#385233] text-[#fefae0] font-bold'
                      : isDark ? 'hover:bg-[#283925]/60 text-[#e9edc9] hover:text-[#fefae0]' : 'hover:bg-[#e9edc9]/60 text-[#1b2819] hover:text-[#385233]'
                  }`}
                >
                  <div className="truncate flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${proj.status === 'ACTIVE' ? 'bg-[#386641]' : proj.status === 'PLANNING' ? 'bg-[#e9edc9]' : 'bg-[#3c5638]'}`} />
                    <span className="truncate">{proj.name}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Role Footer Info & Theme Toggle */}
      <div className={`pt-4 border-t mt-6 space-y-3 ${isDark ? 'border-[#3c5638]' : 'border-[#d4ddcf]'}`}>
        <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-[11px] ${
          isDark
            ? 'bg-[#283925] border-[#3c5638] text-[#fefae0]'
            : 'bg-white border-[#d4ddcf] text-[#1b2819]'
        }`}>
          {isAdmin ? (
            <ShieldAlert className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#fefae0]' : 'text-[#385233]'}`} />
          ) : (
            <Users className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`} />
          )}
          <div>
            <p className="font-bold">
              Role: {isAdmin ? 'Admin 👑' : 'Team Member 👤'}
            </p>
            <p className={`text-[10px] ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
              {isAdmin ? 'Full Project & Task Management' : 'Assigned Tasks & Updates'}
            </p>
          </div>
        </div>

        {/* Theme Toggle Button inside Sidebar */}
        <button
          onClick={toggleTheme}
          className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
            isDark
              ? 'bg-[#283925] hover:bg-[#3c5638] text-[#fefae0] border-[#3c5638]'
              : 'bg-white hover:bg-[#e9edc9] text-[#1b2819] border-[#d4ddcf]'
          }`}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-300" />
              <span>Switch to Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[#385233]" />
              <span>Switch to Dark Mode</span>
            </>
          )}
        </button>

        <div className={`text-[10px] text-center font-medium ${isDark ? 'text-[#e9edc9]/90' : 'text-[#556b2f]'}`}>
          Copyright © 2026 Rajkumar PR.<br/>All Rights Reserved.
        </div>
      </div>
    </aside>
  );
};
