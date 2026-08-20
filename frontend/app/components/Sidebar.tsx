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
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

  const navItems = [
    { id: 'overview', label: 'Overview & KPIs', icon: LayoutDashboard },
    { id: 'requests', label: 'Project Requests', icon: Mail, count: pendingRequestsCount, badge: pendingRequestsCount > 0 ? 'New' : undefined },
    { id: 'projects', label: 'Projects Workspace', icon: FolderKanban, count: projects.length },
    { id: 'tasks', label: 'Task Management', icon: CheckSquare },
    { id: 'deadline-history', label: 'Deadline Audit Trail', icon: History, badge: 'Required' },
    { id: 'team', label: 'Team Directory', icon: Users },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900/80 backdrop-blur border-r border-slate-800 text-slate-300 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Quick Action Buttons for Admin */}
        {isAdmin && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
              Admin Quick Actions
            </p>
            <button
              onClick={openCreateTaskModal}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs py-2.5 px-3 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition ring-1 ring-white/10"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Task</span>
            </button>
            <button
              onClick={openCreateProjectModal}
              className="w-full bg-slate-800 hover:bg-slate-700/80 text-slate-200 font-semibold text-xs py-2 px-3 rounded-xl border border-slate-700/80 flex items-center justify-center gap-2 transition"
            >
              <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
              <span>Create Project</span>
            </button>
          </div>
        )}

        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
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
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${item.badge === 'New' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-md font-mono text-slate-300 border border-slate-700 font-bold">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Project Selector Filter */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Projects
            </p>
            <button
              onClick={() => setSelectedProjectId(null)}
              className={`text-[10px] hover:underline font-semibold ${selectedProjectId === null ? 'text-indigo-400' : 'text-slate-500'}`}
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
                      ? 'bg-slate-800 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'hover:bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <div className="truncate flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${proj.status === 'ACTIVE' ? 'bg-emerald-400' : proj.status === 'PLANNING' ? 'bg-indigo-400' : 'bg-slate-500'}`} />
                    <span className="truncate">{proj.name}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Role Footer Info */}
      <div className="pt-4 border-t border-slate-800 mt-6">
        <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center gap-2 text-[11px]">
          {isAdmin ? (
            <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />
          ) : (
            <Users className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <div>
            <p className="font-semibold text-slate-300">
              Role: {isAdmin ? 'Admin' : 'Team Member'}
            </p>
            <p className="text-[10px] text-slate-500">
              {isAdmin ? 'Full Project & Task Management' : 'Assigned Tasks & Updates'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
