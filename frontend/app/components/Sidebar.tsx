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
    <aside className="w-full lg:w-64 bg-[#3b0712]/90 backdrop-blur border-r border-rose-900/60 text-white p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Quick Action Buttons for Admin */}
        {isAdmin && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-200/80 px-2">
              Admin Quick Actions
            </p>
            <button
              onClick={openCreateTaskModal}
              className="w-full bg-rose-800 hover:bg-rose-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2 transition ring-1 ring-white/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Task</span>
            </button>
            <button
              onClick={openCreateProjectModal}
              className="w-full bg-[#581123] hover:bg-rose-900 text-white font-semibold text-xs py-2 px-3 rounded-xl border border-rose-800 flex items-center justify-center gap-2 transition"
            >
              <FolderKanban className="w-3.5 h-3.5 text-rose-300" />
              <span>Create Project</span>
            </button>
          </div>
        )}

        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-200/80 px-2 mb-2">
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
                    ? 'bg-white text-rose-950 shadow-md font-extrabold border border-white'
                    : 'hover:bg-rose-900/50 text-rose-100 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-950' : 'text-rose-300'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${item.badge === 'New' ? 'bg-rose-900 text-white border-white animate-pulse' : 'bg-rose-950 text-rose-200 border-rose-800'}`}>
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${isActive ? 'bg-rose-950 text-white' : 'bg-[#581123] text-white border border-rose-800'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Project Selector Filter */}
        <div className="pt-2 border-t border-rose-900/60">
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-200/80">
              Active Projects
            </p>
            <button
              onClick={() => setSelectedProjectId(null)}
              className={`text-[10px] hover:underline font-semibold ${selectedProjectId === null ? 'text-white underline font-bold' : 'text-rose-300'}`}
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
                      ? 'bg-white text-rose-950 font-bold'
                      : 'hover:bg-rose-900/40 text-rose-200 hover:text-white'
                  }`}
                >
                  <div className="truncate flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${proj.status === 'ACTIVE' ? 'bg-emerald-400' : proj.status === 'PLANNING' ? 'bg-rose-300' : 'bg-rose-800'}`} />
                    <span className="truncate">{proj.name}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Role Footer Info & Copyright */}
      <div className="pt-4 border-t border-rose-900/60 mt-6 space-y-3">
        <div className="p-2.5 rounded-xl bg-[#581123] border border-rose-800 flex items-center gap-2 text-[11px]">
          {isAdmin ? (
            <ShieldAlert className="w-4 h-4 text-white shrink-0" />
          ) : (
            <Users className="w-4 h-4 text-rose-200 shrink-0" />
          )}
          <div>
            <p className="font-bold text-white">
              Role: {isAdmin ? 'Admin 👑' : 'Team Member 👤'}
            </p>
            <p className="text-[10px] text-rose-200">
              {isAdmin ? 'Full Project & Task Management' : 'Assigned Tasks & Updates'}
            </p>
          </div>
        </div>

        <div className="text-[10px] text-center text-rose-200/90 font-medium">
          Copyright © 2026 Rajkumar PR.<br/>All Rights Reserved.
        </div>
      </div>
    </aside>
  );
};
