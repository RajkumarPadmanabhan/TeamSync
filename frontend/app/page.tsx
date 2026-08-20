'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { api } from './lib/api';
import { Project, Task, DashboardStats, TaskStatus, TaskPriority, User, ProjectInvitation, Role } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { KpiCards } from './components/KpiCards';
import { ProjectModal } from './components/ProjectModal';
import { TaskModal } from './components/TaskModal';
import { DeadlineModal } from './components/DeadlineModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TeamRosterModal } from './components/TeamRosterModal';
import { AuthScreen } from './components/AuthScreen';
import { InvitationsBanner } from './components/InvitationsBanner';
import { UserProfileModal } from './components/UserProfileModal';
import { ToastNotification, ToastMessage, ToastType, ConfirmDialogState } from './components/ToastNotification';
import {
  PlusCircle,
  FolderKanban,
  CheckSquare,
  History,
  Users,
  Search,
  Filter,
  Calendar,
  Clock,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  Trash2,
  Edit,
  UserCheck,
  Mail,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function Home() {
  const { user, isAdmin, allUsers, refreshUsers, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Active Tab View
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'tasks' | 'deadline-history' | 'team' | 'requests'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [selectedTaskForDeadline, setSelectedTaskForDeadline] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);

  // Toast Notification System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [assignedToMeFilter, setAssignedToMeFilter] = useState(false);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadAllData = async () => {
    if (!api.getToken()) return;
    try {
      setLoadingData(true);
      setDataError(null);
      const [projData, taskData, statsData, invData] = await Promise.all([
        api.getProjects(),
        api.getTasks(),
        api.getDashboardStats(),
        api.getProjectInvitations(),
      ]);
      setProjects(projData);
      setTasks(taskData);
      setStats(statsData);
      setInvitations(invData);
    } catch (err: any) {
      setDataError(err.message || 'Failed to sync workspace data.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? 'bg-[#141d13] text-[#fefae0]' : 'bg-[#faf8f3] text-[#1b2819]'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#556b2f] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider">Loading TeamSync Suite...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onSuccess={() => loadAllData()} />;
  }

  // Action handlers
  const handleSaveProject = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        status: data.status,
        start_date: data.start_date,
        end_date: data.end_date,
        member_ids: data.member_ids || data.members || [],
      };
      if (editingProject) {
        await api.updateProject(editingProject.id, payload);
        showToast(`Project "${data.name}" updated successfully!`, 'success');
      } else {
        await api.createProject(payload);
        showToast(`Project "${data.name}" created successfully!`, 'success');
      }
      setIsProjectModalOpen(false);
      setEditingProject(null);
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save project.', 'error');
    }
  };

  const handleDeleteProject = (projectId: number, projectName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Project',
      message: `Are you sure you want to delete project "${projectName}"? All associated tasks will be permanently removed.`,
      confirmText: 'Delete Project',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await api.deleteProject(projectId);
          showToast(`Project "${projectName}" deleted successfully.`, 'warning');
          if (selectedProjectId === projectId) setSelectedProjectId(null);
          await loadAllData();
        } catch (err: any) {
          showToast(err.message || 'Failed to delete project.', 'error');
        }
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const handleSaveTask = async (data: any) => {
    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, data);
        showToast('Task updated successfully!', 'success');
      } else {
        await api.createTask(data);
        showToast('New task assigned successfully!', 'success');
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save task.', 'error');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task? This action cannot be undone.',
      confirmText: 'Delete Task',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await api.deleteTask(taskId);
          showToast('Task deleted successfully.', 'warning');
          await loadAllData();
        } catch (err: any) {
          showToast(err.message || 'Failed to delete task.', 'error');
        }
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const handleUpdateStatus = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      showToast(`Task status updated to ${newStatus.replace('_', ' ')}!`, 'success');
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status.', 'error');
    }
  };

  const handleCreateUser = async (data: any) => {
    try {
      await api.createUser(data);
      showToast(`User ${data.username} created successfully as ${data.role}!`, 'success');
      setIsTeamModalOpen(false);
      await refreshUsers();
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create user.', 'error');
    }
  };

  const handleSaveUserProfile = async (updatedData: { id?: number; first_name: string; last_name: string; email: string; role: Role; department: string }) => {
    try {
      const targetId = updatedData.id || selectedUserForEdit?.id || user.id;
      await api.updateUser(targetId, updatedData);
      showToast('User profile info updated successfully!', 'success');
      setIsProfileModalOpen(false);
      setSelectedUserForEdit(null);
      await refreshUsers();
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile info.', 'error');
    }
  };

  const handleSendProjectInvitation = async (projectId: number, userId: number) => {
    try {
      await api.sendProjectInvitation(projectId, userId);
      showToast('Project join invitation sent to user!', 'success');
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to send invitation request.', 'error');
    }
  };

  const handleRespondInvitation = async (invitationId: number, action: 'accept' | 'reject') => {
    try {
      await api.respondToInvitation(invitationId, action);
      showToast(`Invitation ${action}ed successfully!`, action === 'accept' ? 'success' : 'warning');
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to process request.', 'error');
    }
  };

  const openDeadlineHistoryModal = (t: Task) => {
    setSelectedTaskForDeadline(t);
    setIsDeadlineModalOpen(true);
  };

  const openTaskDetail = (t: Task) => {
    setSelectedTaskForDetail(t);
    setIsDetailModalOpen(true);
  };

  // Filtered Tasks
  const filteredTasks = tasks.filter((t) => {
    if (selectedProjectId && t.project !== selectedProjectId) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (assignedToMeFilter && t.assigned_to !== user?.id) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchProj = t.project_name?.toLowerCase().includes(q);
      const matchAssignee = t.assigned_to_detail?.first_name?.toLowerCase().includes(q) || t.assigned_to_detail?.last_name?.toLowerCase().includes(q) || t.assigned_to_detail?.username.toLowerCase().includes(q);
      const matchPriority = t.priority.toLowerCase().includes(q);
      const matchStatus = t.status.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchProj || matchAssignee || matchPriority || matchStatus;
    }
    return true;
  });

  // Filtered Projects
  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchName = p.name.toLowerCase().includes(q);
    const matchDesc = p.description.toLowerCase().includes(q);
    const matchStatus = p.status.toLowerCase().includes(q);
    const matchMember = p.members_detail?.some(
      (m) => m.first_name?.toLowerCase().includes(q) || m.last_name?.toLowerCase().includes(q) || m.username.toLowerCase().includes(q)
    );
    return matchName || matchDesc || matchStatus || matchMember;
  });

  const priorityBadge: Record<string, string> = {
    LOW: isDark ? 'bg-[#283925] text-[#e9edc9] border-[#3c5638]' : 'bg-[#e9edc9] text-[#1b2819] border-[#d4ddcf]',
    MEDIUM: isDark ? 'bg-[#386641]/40 text-[#fefae0] border-[#386641]' : 'bg-[#d8f3dc] text-[#1b2819] border-[#385233]/30',
    HIGH: isDark ? 'bg-[#556b2f]/60 text-[#fefae0] border-[#556b2f]' : 'bg-[#c7f9cc] text-[#1b2819] border-[#385233]',
    URGENT: isDark ? 'bg-rose-900/60 text-rose-200 border-rose-700 font-bold' : 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
  };

  const statusBadge: Record<string, string> = {
    TODO: isDark ? 'bg-[#283925] text-[#e9edc9] border-[#3c5638]' : 'bg-[#faf8f3] text-[#1b2819] border-[#d4ddcf]',
    IN_PROGRESS: isDark ? 'bg-[#386641]/60 text-[#fefae0] border-[#386641]' : 'bg-[#e9edc9] text-[#1b2819] border-[#556b2f]',
    IN_REVIEW: isDark ? 'bg-[#556b2f]/60 text-[#fefae0] border-[#556b2f]' : 'bg-[#faedcd] text-[#1b2819] border-[#d4ddcf]',
    COMPLETED: isDark ? 'bg-[#283925] text-[#a3b18a] border-[#386641]' : 'bg-[#c7f9cc] text-[#1b2819] border-[#385233]',
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'No Deadline';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased transition-colors ${
      isDark
        ? 'bg-[#141d13] text-[#fefae0] selection:bg-[#556b2f] selection:text-[#fefae0]'
        : 'bg-[#faf8f3] text-[#1b2819] selection:bg-[#385233] selection:text-[#fefae0]'
    }`}>
      {/* MNC Navigation Topbar */}
      <Navbar
        onRefresh={loadAllData}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openEditProfileModal={() => {
          setSelectedUserForEdit(user);
          setIsProfileModalOpen(true);
        }}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        {/* MNC Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          projects={projects}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          openCreateProjectModal={() => {
            setEditingProject(null);
            setIsProjectModalOpen(true);
          }}
          openCreateTaskModal={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          openCreateUserModal={() => setIsTeamModalOpen(true)}
          pendingRequestsCount={invitations.filter((inv) => inv.status === 'PENDING').length}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
          {/* Project Invitations Banner */}
          <InvitationsBanner
            invitations={invitations}
            onRespond={handleRespondInvitation}
          />

          {/* Global Alert / Info Banner */}
          {dataError && (
            <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-xs text-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{dataError}</span>
              </div>
              <button onClick={loadAllData} className="underline font-bold">Retry</button>
            </div>
          )}

          {/* Active Search Query Status Bar */}
          {searchQuery.trim() && (
            <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between animate-in fade-in ${
              isDark
                ? 'bg-[#283925] border-[#3c5638] text-[#fefae0]'
                : 'bg-white border-[#d4ddcf] text-[#1b2819] shadow-sm'
            }`}>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 shrink-0 text-[#556b2f]" />
                <span>
                  Filtering results for &quot;<strong className="font-bold">{searchQuery}</strong>&quot; — Found <strong>{filteredTasks.length}</strong> task(s) and <strong>{filteredProjects.length}</strong> project(s)
                </span>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="px-2.5 py-1 bg-[#556b2f] hover:bg-[#606c38] text-[#fefae0] font-bold text-[11px] rounded-lg transition"
              >
                Clear Search ✕
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Header Title */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-xl font-extrabold tracking-tight flex items-center gap-2 ${isDark ? 'text-[#fefae0]' : 'text-[#1b2819]'}`}>
                    <span>Executive Overview</span>
                    <span className={`text-xs font-normal px-2.5 py-0.5 rounded-full border ${
                      isDark
                        ? 'bg-[#283925] text-[#e9edc9] border-[#3c5638]'
                        : 'bg-[#e9edc9] text-[#1b2819] border-[#d4ddcf]'
                    }`}>
                      Live Operational Metrics
                    </span>
                  </h1>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#e9edc9]/80' : 'text-[#556b2f]'}`}>
                    Real-time project progress, task allocation & deadline revision metrics
                  </p>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    className={`text-xs font-semibold px-4 py-2 rounded-xl shadow-md flex items-center gap-2 transition ${
                      isDark
                        ? 'bg-[#556b2f] hover:bg-[#606c38] text-[#fefae0]'
                        : 'bg-[#385233] hover:bg-[#283b24] text-[#fefae0]'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Task</span>
                  </button>
                )}
              </div>

              {/* KPI Stat Cards */}
              <KpiCards stats={stats} />

              {/* Project Progress Overview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Projects Progress */}
                <div className={`rounded-2xl p-5 border space-y-4 transition ${
                  isDark
                    ? 'bg-[#1f2c1d] border-[#3c5638] text-[#fefae0]'
                    : 'bg-white border-[#d4ddcf] text-[#1b2819] shadow-sm'
                }`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-[#556b2f]" />
                      <span>Project Completion Progress</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('projects')}
                      className={`text-xs hover:underline font-semibold ${isDark ? 'text-[#e9edc9]' : 'text-[#385233]'}`}
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-4">
                    {filteredProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className={`p-3.5 rounded-xl border space-y-2 ${
                          isDark
                            ? 'bg-[#283925] border-[#3c5638] text-[#fefae0]'
                            : 'bg-[#faf8f3] border-[#e2e8f0] text-[#1b2819]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold">{proj.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold ${isDark ? 'text-[#e9edc9]' : 'text-[#385233]'}`}>
                              {proj.progress_percentage}%
                            </span>
                            {isAdmin && (
                              <div className={`flex items-center gap-1 pl-2 border-l ${isDark ? 'border-[#3c5638]' : 'border-[#cbd5e1]'}`}>
                                <button
                                  onClick={() => {
                                    setEditingProject(proj);
                                    setIsProjectModalOpen(true);
                                  }}
                                  className="p-1 hover:opacity-75 transition"
                                  title="Edit project name & details"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProject(proj.id, proj.name)}
                                  className="p-1 text-rose-500 hover:text-rose-700 transition"
                                  title="Delete project"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#141d13]' : 'bg-[#e2e8f0]'}`}>
                          <div
                            className="h-full bg-gradient-to-r from-[#386641] to-[#556b2f] transition-all duration-500"
                            style={{ width: `${proj.progress_percentage}%` }}
                          />
                        </div>

                        <div className={`flex items-center justify-between text-[11px] pt-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                          <span>
                            Tasks: {proj.completed_tasks} / {proj.total_tasks} completed
                          </span>
                          <span>
                            {proj.members.length} Team Members
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority & Deadline Audit Highlight Card */}
                <div className={`rounded-2xl p-5 border space-y-4 transition ${
                  isDark
                    ? 'bg-[#1f2c1d] border-[#3c5638] text-[#fefae0]'
                    : 'bg-white border-[#d4ddcf] text-[#1b2819] shadow-sm'
                }`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <History className="w-4 h-4 text-[#556b2f]" />
                      <span>Deadline Audit Trail Summary</span>
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      isDark
                        ? 'bg-[#3c5638] text-[#fefae0] border-[#556b2f]'
                        : 'bg-[#e9edc9] text-[#1b2819] border-[#d4ddcf]'
                    }`}>
                      Additional Challenge
                    </span>
                  </div>

                  <p className={`text-xs leading-relaxed ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                    Whenever a task deadline is adjusted by an admin, TeamSync maintains a complete historical changelog recording previous deadlines, updated deadlines, editor avatars, and justification reasons.
                  </p>

                  <div className={`p-4 rounded-xl border space-y-3 ${
                    isDark
                      ? 'bg-[#283925] border-[#3c5638]'
                      : 'bg-[#faf8f3] border-[#e2e8f0]'
                  }`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">Tasks with Revised Deadlines:</span>
                      <span className="font-bold text-sm">{stats?.total_deadline_changes || 0}</span>
                    </div>

                    <button
                      onClick={() => setActiveTab('deadline-history')}
                      className={`w-full py-2.5 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition ${
                        isDark
                          ? 'bg-[#3c5638] hover:bg-[#556b2f] text-[#fefae0] border-[#556b2f]'
                          : 'bg-[#385233] hover:bg-[#283b24] text-[#fefae0] border-[#385233]'
                      }`}
                    >
                      <History className="w-4 h-4" />
                      <span>Explore Full Deadline History Audit Log</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROJECTS WORKSPACE */}
          {activeTab === 'projects' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-[#fefae0]' : 'text-[#1b2819]'}`}>
                    Projects Workspace
                  </h1>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                    Create projects, set target end dates, and manage team member access
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setIsProjectModalOpen(true)}
                    className={`text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition ${
                      isDark
                        ? 'bg-[#556b2f] hover:bg-[#606c38] text-[#fefae0]'
                        : 'bg-[#385233] hover:bg-[#283b24] text-[#fefae0]'
                    }`}
                  >
                    <FolderKanban className="w-4 h-4" />
                    <span>Create Project</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className={`rounded-2xl p-5 border flex flex-col justify-between space-y-4 transition ${
                      isDark
                        ? 'bg-[#1f2c1d] border-[#3c5638] text-[#fefae0]'
                        : 'bg-white border-[#d4ddcf] text-[#1b2819] shadow-sm'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          proj.status === 'ACTIVE'
                            ? 'bg-[#386641] text-[#fefae0] border-[#386641]'
                            : proj.status === 'PLANNING'
                              ? 'bg-[#e9edc9] text-[#1b2819] border-[#d4ddcf]'
                              : 'bg-[#283925] text-[#e9edc9] border-[#3c5638]'
                        }`}>
                          {proj.status}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold font-mono ${isDark ? 'text-[#e9edc9]' : 'text-[#385233]'}`}>
                            {proj.progress_percentage}% Done
                          </span>
                          {isAdmin && (
                            <div className={`flex items-center gap-1 pl-2 border-l ${isDark ? 'border-[#3c5638]' : 'border-[#cbd5e1]'}`}>
                              <button
                                onClick={() => {
                                  setEditingProject(proj);
                                  setIsProjectModalOpen(true);
                                }}
                                className="p-1 hover:opacity-75 transition"
                                title="Edit project name & details"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(proj.id, proj.name)}
                                className="p-1 text-rose-500 hover:text-rose-700 transition"
                                title="Delete project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="text-base font-extrabold">{proj.name}</h3>
                      <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                        {proj.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className={`space-y-3 pt-3 border-t ${isDark ? 'border-[#3c5638]' : 'border-[#e2e8f0]'}`}>
                      <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-[#141d13]' : 'bg-[#e2e8f0]'}`}>
                        <div
                          className="h-full bg-gradient-to-r from-[#386641] to-[#556b2f] transition-all duration-300"
                          style={{ width: `${proj.progress_percentage}%` }}
                        />
                      </div>

                      <div className={`flex items-center justify-between text-xs ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                        <div className="flex items-center -space-x-2">
                          {proj.members_detail?.map((m) => (
                            <img
                              key={m.id}
                              src={m.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.first_name || m.username)}&background=556b2f&color=fefae0`}
                              alt={m.username}
                              title={`${m.first_name || m.username} (${m.role})`}
                              className={`w-6 h-6 rounded-full border-2 object-cover ${isDark ? 'border-[#1f2c1d]' : 'border-white'}`}
                            />
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            setSelectedProjectId(proj.id);
                            setActiveTab('tasks');
                          }}
                          className="text-xs font-semibold flex items-center gap-1 hover:underline"
                        >
                          <span>View Tasks ({proj.total_tasks})</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TASK MANAGEMENT */}
          {activeTab === 'tasks' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className={`text-xl font-extrabold tracking-tight flex items-center gap-2 ${isDark ? 'text-[#fefae0]' : 'text-[#1b2819]'}`}>
                    <span>Task Management</span>
                    {selectedProjectId && (
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        isDark ? 'bg-[#3c5638] text-[#fefae0] border-[#556b2f]' : 'bg-[#e9edc9] text-[#1b2819] border-[#d4ddcf]'
                      }`}>
                        Filtered: {projects.find((p) => p.id === selectedProjectId)?.name}
                      </span>
                    )}
                  </h1>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                    View assigned tasks, update status, track deadlines & post comments
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAssignedToMeFilter(!assignedToMeFilter)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                      assignedToMeFilter
                        ? 'bg-[#556b2f] text-[#fefae0] border-[#556b2f]'
                        : isDark
                          ? 'bg-[#1f2c1d] text-[#e9edc9] border-[#3c5638] hover:bg-[#283925]'
                          : 'bg-white text-[#1b2819] border-[#d4ddcf] hover:bg-[#e9edc9]'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>My Tasks Only</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setEditingTask(null);
                        setIsTaskModalOpen(true);
                      }}
                      className={`text-xs font-semibold px-4 py-2 rounded-xl shadow-md flex items-center gap-2 transition ${
                        isDark
                          ? 'bg-[#556b2f] hover:bg-[#606c38] text-[#fefae0]'
                          : 'bg-[#385233] hover:bg-[#283b24] text-[#fefae0]'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Create Task</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Task Filters Bar */}
              <div className={`flex items-center gap-3 flex-wrap p-3 rounded-2xl border text-xs ${
                isDark
                  ? 'bg-[#1f2c1d] border-[#3c5638] text-[#fefae0]'
                  : 'bg-white border-[#d4ddcf] text-[#1b2819] shadow-sm'
              }`}>
                <div className={`flex items-center gap-1.5 ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                  <Filter className="w-3.5 h-3.5" />
                  <span className="font-semibold">Filters:</span>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`text-xs rounded-xl px-3 py-1.5 border focus:outline-none ${
                    isDark
                      ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                      : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                  }`}
                >
                  <option value="">All Statuses</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="COMPLETED">Completed</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className={`text-xs rounded-xl px-3 py-1.5 border focus:outline-none ${
                    isDark
                      ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                      : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                  }`}
                >
                  <option value="">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent ⚡</option>
                </select>

                {(statusFilter || priorityFilter || assignedToMeFilter || selectedProjectId) && (
                  <button
                    onClick={() => {
                      setStatusFilter('');
                      setPriorityFilter('');
                      setAssignedToMeFilter(false);
                      setSelectedProjectId(null);
                    }}
                    className="text-[11px] text-rose-500 hover:underline font-semibold ml-auto"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                  <div className={`p-12 text-center rounded-2xl border ${
                    isDark
                      ? 'bg-[#1f2c1d] border-[#3c5638] text-[#e9edc9]'
                      : 'bg-white border-[#d4ddcf] text-[#556b2f] shadow-sm'
                  }`}>
                    <CheckSquare className="w-8 h-8 opacity-50 mx-auto mb-2" />
                    <p className="text-sm font-semibold">No tasks found matching criteria</p>
                    <p className="text-xs opacity-75 mt-1">Try resetting filters or create a new task</p>
                  </div>
                ) : (
                  filteredTasks.map((t) => {
                    const assignee = t.assigned_to_detail;
                    return (
                      <div
                        key={t.id}
                        className={`rounded-2xl p-4 transition border shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isDark
                            ? 'bg-[#1f2c1d] border-[#3c5638] hover:border-[#556b2f] text-[#fefae0]'
                            : 'bg-white border-[#d4ddcf] hover:border-[#385233] text-[#1b2819]'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Completion Checkbox */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newStatus = t.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
                              handleUpdateStatus(t.id, newStatus);
                            }}
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition shrink-0 mt-0.5 ${
                              t.status === 'COMPLETED'
                                ? 'bg-[#386641] border-[#386641] text-white shadow'
                                : isDark
                                  ? 'bg-[#141d13] border-[#3c5638] text-transparent hover:border-[#556b2f]'
                                  : 'bg-white border-[#d4ddcf] text-transparent hover:border-[#385233]'
                            }`}
                            title={t.status === 'COMPLETED' ? 'Mark as In Progress' : 'Mark Task as Completed'}
                          >
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </button>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                isDark
                                  ? 'bg-[#141d13] text-[#e9edc9] border-[#3c5638]'
                                  : 'bg-[#faf8f3] text-[#1b2819] border-[#d4ddcf]'
                              }`}>
                                {t.project_name || `Project #${t.project}`}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${priorityBadge[t.priority]}`}>
                                {t.priority}
                              </span>

                              {/* Quick Status Selector */}
                              <select
                                value={t.status}
                                onChange={(e) => handleUpdateStatus(t.id, e.target.value as TaskStatus)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border focus:outline-none cursor-pointer ${statusBadge[t.status]}`}
                                title="Click to update task progress status"
                              >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="IN_REVIEW">In Review</option>
                                <option value="COMPLETED">Completed ✓</option>
                              </select>
                            </div>

                            <button
                              onClick={() => openTaskDetail(t)}
                              className={`text-left font-bold text-sm transition truncate block hover:underline ${
                                t.status === 'COMPLETED'
                                  ? 'line-through opacity-60'
                                  : isDark ? 'text-[#fefae0]' : 'text-[#1b2819]'
                              }`}
                            >
                              {t.title}
                            </button>

                            <p className={`text-xs line-clamp-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                              {t.description || 'No description provided.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs shrink-0 flex-wrap">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                            isDark
                              ? 'bg-[#283925] border-[#3c5638] text-[#fefae0]'
                              : 'bg-[#faf8f3] border-[#e2e8f0] text-[#1b2819]'
                          }`}>
                            {assignee ? (
                              <>
                                <img
                                  src={assignee.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee.first_name || assignee.username)}&background=556b2f&color=fefae0`}
                                  alt="assignee"
                                  className="w-5 h-5 rounded-full object-cover"
                                />
                                <span className="font-semibold text-xs">
                                  {assignee.first_name ? `${assignee.first_name} ${assignee.last_name}` : assignee.username}
                                </span>
                              </>
                            ) : (
                              <span className="opacity-60 italic text-xs">Unassigned</span>
                            )}
                          </div>

                          <div className={`flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-xl border ${
                            isDark
                              ? 'bg-[#283925] border-[#3c5638] text-[#fefae0]'
                              : 'bg-[#faf8f3] border-[#e2e8f0] text-[#1b2819]'
                          }`}>
                            <Calendar className="w-3.5 h-3.5 text-[#556b2f]" />
                            <span>{formatDate(t.deadline)}</span>
                          </div>

                          <button
                            onClick={() => openDeadlineHistoryModal(t)}
                            className={`p-2 rounded-xl border font-semibold text-xs flex items-center gap-1 transition ${
                              isDark
                                ? 'bg-[#3c5638] hover:bg-[#556b2f] text-[#fefae0] border-[#556b2f]'
                                : 'bg-[#e9edc9] hover:bg-[#385233] hover:text-[#fefae0] text-[#1b2819] border-[#d4ddcf]'
                            }`}
                            title="View Deadline Change History"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">History ({t.deadline_history_count})</span>
                          </button>

                          <button
                            onClick={() => openTaskDetail(t)}
                            className={`p-2 rounded-xl border font-semibold text-xs flex items-center gap-1 transition ${
                              isDark
                                ? 'bg-[#283925] hover:bg-[#3c5638] text-[#fefae0] border-[#3c5638]'
                                : 'bg-[#faf8f3] hover:bg-[#e2e8f0] text-[#1b2819] border-[#d4ddcf]'
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#556b2f]" />
                            <span>{t.comments_count}</span>
                          </button>

                          {isAdmin && (
                            <div className={`flex items-center gap-1 pl-2 border-l ${isDark ? 'border-[#3c5638]' : 'border-[#cbd5e1]'}`}>
                              <button
                                onClick={() => {
                                  setEditingTask(t);
                                  setIsTaskModalOpen(true);
                                }}
                                className="p-1.5 hover:opacity-75 transition"
                                title="Edit Task & Deadline"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(t.id)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 transition"
                                title="Delete Task"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DEADLINE AUDIT TRAIL */}
          {activeTab === 'deadline-history' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-[#fefae0]' : 'text-[#1b2819]'}`}>
                      Deadline Audit Trail
                    </h1>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                      isDark
                        ? 'bg-[#3c5638] text-[#fefae0] border-[#556b2f]'
                        : 'bg-[#e9edc9] text-[#1b2819] border-[#d4ddcf]'
                    }`}>
                      Additional Challenge Requirement
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                    Complete historical tracking of all previous and updated deadlines across tasks
                  </p>
                </div>
              </div>

              <div className={`rounded-2xl p-6 border space-y-4 shadow-xl transition ${
                isDark
                  ? 'bg-[#1f2c1d] border-[#3c5638] text-[#fefae0]'
                  : 'bg-white border-[#d4ddcf] text-[#1b2819] shadow-sm'
              }`}>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                  Select any task from below to view its chronological deadline revision log, including editor profile, old vs new date timestamps, and change justification.
                </p>

                <div className="space-y-3">
                  {tasks.length === 0 ? (
                    <div className={`p-8 text-center rounded-xl border ${
                      isDark
                        ? 'bg-[#283925] border-[#3c5638] text-[#e9edc9]'
                        : 'bg-[#faf8f3] border-[#e2e8f0] text-[#556b2f]'
                    }`}>
                      <History className="w-8 h-8 opacity-50 mx-auto mb-2" />
                      <p className="text-sm font-semibold">No tasks created yet</p>
                      <p className="text-xs opacity-75 mt-1">Create tasks to track deadline revision history.</p>
                    </div>
                  ) : (
                    tasks.map((t) => {
                      const hasRevisions = t.deadline_history_count > 0;
                      return (
                        <div
                          key={t.id}
                          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                            isDark
                              ? 'bg-[#283925] border-[#3c5638] text-[#fefae0]'
                              : 'bg-[#faf8f3] border-[#e2e8f0] text-[#1b2819]'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                isDark
                                  ? 'bg-[#141d13] text-[#e9edc9] border-[#3c5638]'
                                  : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                              }`}>
                                {t.project_name || `Project #${t.project}`}
                              </span>
                              {hasRevisions ? (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  isDark
                                    ? 'bg-[#3c5638] text-[#fefae0] border-[#556b2f]'
                                    : 'bg-[#e9edc9] text-[#1b2819] border-[#d4ddcf]'
                                }`}>
                                  ⚡ {t.deadline_history_count} Revisions Logged
                                </span>
                              ) : (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  isDark
                                    ? 'bg-[#141d13] text-[#e9edc9] border-[#3c5638]'
                                    : 'bg-white text-[#556b2f] border-[#d4ddcf]'
                                }`}>
                                  Initial Deadline
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-sm">{t.title}</h4>
                            <p className={`text-xs font-medium ${isDark ? 'text-[#e9edc9]' : 'text-[#385233]'}`}>
                              Current Deadline: {formatDate(t.deadline)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap shrink-0">
                            {isAdmin && (
                              <button
                                onClick={() => {
                                  setEditingTask(t);
                                  setIsTaskModalOpen(true);
                                }}
                                className={`px-3.5 py-2 font-semibold text-xs rounded-xl border flex items-center gap-1.5 transition ${
                                  isDark
                                    ? 'bg-[#141d13] hover:bg-[#3c5638] text-[#fefae0] border-[#3c5638]'
                                    : 'bg-white hover:bg-[#e9edc9] text-[#1b2819] border-[#d4ddcf]'
                                }`}
                                title="Update Task Deadline & Record Audit Reason"
                              >
                                <Edit className="w-3.5 h-3.5 text-[#556b2f]" />
                                <span>Update Deadline</span>
                              </button>
                            )}
                            <button
                              onClick={() => openDeadlineHistoryModal(t)}
                              className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition ${
                                hasRevisions
                                  ? isDark
                                    ? 'bg-[#556b2f] hover:bg-[#606c38] text-[#fefae0] border-[#556b2f]'
                                    : 'bg-[#385233] hover:bg-[#283b24] text-[#fefae0] border-[#385233]'
                                  : isDark
                                    ? 'bg-[#141d13] text-[#e9edc9] border-[#3c5638]'
                                    : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                              }`}
                            >
                              <History className="w-4 h-4" />
                              <span>View Audit Log ({t.deadline_history_count})</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROJECT REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-xl font-extrabold tracking-tight flex items-center gap-2 ${isDark ? 'text-[#fefae0]' : 'text-[#1b2819]'}`}>
                    <span>Project Invitations & Requests</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border font-mono ${
                      isDark
                        ? 'bg-[#3c5638] text-[#fefae0] border-[#556b2f]'
                        : 'bg-[#e9edc9] text-[#1b2819] border-[#d4ddcf]'
                    }`}>
                      {invitations.filter((inv) => inv.status === 'PENDING').length} Pending
                    </span>
                  </h1>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                    Admin invitations to join projects. Accept requests to participate in project tasks & workflows.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {invitations.length === 0 ? (
                  <div className={`p-12 text-center rounded-2xl border space-y-2 ${
                    isDark
                      ? 'bg-[#1f2c1d] border-[#3c5638] text-[#e9edc9]'
                      : 'bg-white border-[#d4ddcf] text-[#556b2f] shadow-sm'
                  }`}>
                    <Mail className="w-8 h-8 opacity-50 mx-auto" />
                    <p className="text-sm font-semibold">No Project Requests Found</p>
                    <p className="text-xs opacity-75">
                      When an Admin invites you to join a project, the request will appear here for your approval.
                    </p>
                  </div>
                ) : (
                  invitations.map((inv) => {
                    const project = inv.project_detail;
                    const sender = inv.sender_detail;
                    const isPending = inv.status === 'PENDING';
                    const isAccepted = inv.status === 'ACCEPTED';
                    const isRejected = inv.status === 'REJECTED';

                    return (
                      <div
                        key={inv.id}
                        className={`rounded-2xl p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                          isDark
                            ? 'bg-[#1f2c1d] border-[#3c5638] text-[#fefae0]'
                            : 'bg-white border-[#d4ddcf] text-[#1b2819] shadow-sm'
                        }`}
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              isPending
                                ? 'bg-[#556b2f] text-[#fefae0] border-[#e9edc9] animate-pulse'
                                : isAccepted
                                  ? 'bg-[#386641] text-[#fefae0] border-[#386641]'
                                  : 'bg-rose-900/60 text-rose-200 border-rose-700'
                            }`}>
                              {inv.status}
                            </span>
                            <span className={`text-xs font-mono ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                              Received: {new Date(inv.created_at).toLocaleString()}
                            </span>
                          </div>

                          <h3 className="text-base font-extrabold">
                            {project?.name || `Project #${inv.project}`}
                          </h3>
                          <p className={`text-xs ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                            Invited by <strong className="font-bold">{sender?.first_name ? `${sender.first_name} ${sender.last_name}` : sender?.username || 'Admin'}</strong> ({sender?.email})
                          </p>
                          {inv.message && (
                            <div className={`p-3 rounded-xl border text-xs italic ${
                              isDark
                                ? 'bg-[#283925] border-[#3c5638] text-[#e9edc9]'
                                : 'bg-[#faf8f3] border-[#e2e8f0] text-[#1b2819]'
                            }`}>
                              &quot;{inv.message}&quot;
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleRespondInvitation(inv.id, 'reject')}
                                className="px-4 py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Reject Request</span>
                              </button>
                              <button
                                onClick={() => handleRespondInvitation(inv.id, 'accept')}
                                className="px-5 py-2.5 bg-[#386641] hover:bg-[#556b2f] text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-1.5"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Accept & Join Project</span>
                              </button>
                            </>
                          )}
                          {isAccepted && (
                            <span className="text-xs font-bold text-[#a3b18a] flex items-center gap-1.5 px-3 py-1.5 bg-[#386641]/20 rounded-xl border border-[#386641]">
                              <CheckCircle className="w-4 h-4" /> Joined Project
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 rounded-xl border border-rose-800">
                              <XCircle className="w-4 h-4" /> Request Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 6: TEAM DIRECTORY */}
          {activeTab === 'team' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-[#fefae0]' : 'text-[#1b2819]'}`}>
                    Team Directory
                  </h1>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                    Team members, roles, departments, and onboarding
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setIsTeamModalOpen(true)}
                    className={`text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition ${
                      isDark
                        ? 'bg-[#556b2f] hover:bg-[#606c38] text-[#fefae0]'
                        : 'bg-[#385233] hover:bg-[#283b24] text-[#fefae0]'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Add Team Member</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allUsers.map((u) => (
                  <div
                    key={u.id}
                    className={`rounded-2xl p-5 border flex items-start gap-3 transition ${
                      isDark
                        ? 'bg-[#1f2c1d] border-[#3c5638] text-[#fefae0]'
                        : 'bg-white border-[#d4ddcf] text-[#1b2819] shadow-sm'
                    }`}
                  >
                    <img
                      src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.first_name || u.username)}&background=556b2f&color=fefae0`}
                      alt={u.username}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#556b2f]/40"
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm">
                          {u.first_name ? `${u.first_name} ${u.last_name}` : u.username}
                        </h4>
                        <div className="flex items-center gap-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            u.role === 'ADMIN'
                              ? isDark
                                ? 'bg-[#fefae0] text-[#141d13] border-[#fefae0]'
                                : 'bg-[#1b2819] text-[#fefae0] border-[#1b2819]'
                              : isDark
                                ? 'bg-[#3c5638] text-[#fefae0] border-[#556b2f]'
                                : 'bg-[#e9edc9] text-[#1b2819] border-[#385233]'
                          }`}>
                            {u.role}
                          </span>
                          {(isAdmin || u.id === user?.id) && (
                            <button
                              onClick={() => {
                                setSelectedUserForEdit(u);
                                setIsProfileModalOpen(true);
                              }}
                              className="p-1 hover:opacity-75 transition"
                              title="Edit user profile info (email, name, role, department)"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className={`text-xs font-mono ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>{u.email}</p>
                      <p className={`text-[11px] mb-2 ${isDark ? 'text-[#e9edc9]/80' : 'text-[#556b2f]'}`}>{u.department || 'General'}</p>

                      {/* Admin Project Request Controls */}
                      {isAdmin && u.id !== user?.id && (
                        <div className={`pt-2 border-t space-y-2 ${isDark ? 'border-[#3c5638]' : 'border-[#e2e8f0]'}`}>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <select
                              id={`project-select-${u.id}`}
                              className={`text-[11px] rounded-lg px-2 py-1 border focus:outline-none flex-1 ${
                                isDark
                                  ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                                  : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                              }`}
                              defaultValue={projects[0]?.id || ''}
                            >
                              {projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => {
                                const selectEl = document.getElementById(`project-select-${u.id}`) as HTMLSelectElement;
                                const projId = Number(selectEl?.value);
                                if (projId) {
                                  handleSendProjectInvitation(projId, u.id);
                                }
                              }}
                              className={`px-2.5 py-1 font-bold text-[10px] rounded-lg transition shadow ${
                                isDark
                                  ? 'bg-[#556b2f] hover:bg-[#606c38] text-[#fefae0]'
                                  : 'bg-[#385233] hover:bg-[#283b24] text-[#fefae0]'
                              }`}
                              title="Send invitation request to join project"
                            >
                              Send Request
                            </button>
                          </div>

                          {/* Render Existing Invitation Badges */}
                          {invitations
                            .filter((inv) => inv.invited_user === u.id)
                            .map((inv) => (
                              <div key={inv.id} className={`flex items-center justify-between text-[10px] px-2 py-1 rounded border ${
                                isDark
                                  ? 'bg-[#141d13] border-[#3c5638]'
                                  : 'bg-[#faf8f3] border-[#e2e8f0]'
                              }`}>
                                <span className="truncate opacity-75">{inv.project_detail?.name}:</span>
                                {inv.status === 'PENDING' && <span className="font-bold text-amber-500">⌛ Pending</span>}
                                {inv.status === 'ACCEPTED' && <span className="font-bold text-[#386641]">✅ Joined</span>}
                                {inv.status === 'REJECTED' && (
                                  <button
                                    onClick={() => handleSendProjectInvitation(inv.project, u.id)}
                                    className="font-bold text-rose-500 hover:underline cursor-pointer"
                                    title="Click to re-send invitation request"
                                  >
                                    ❌ Rejected (Re-send)
                                  </button>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleSaveProject}
        users={allUsers}
        editingProject={editingProject}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleSaveTask}
        projects={projects}
        users={allUsers}
        initialTask={editingTask}
        defaultProjectId={selectedProjectId}
      />

      <DeadlineModal
        isOpen={isDeadlineModalOpen}
        onClose={() => setIsDeadlineModalOpen(false)}
        task={selectedTaskForDeadline}
      />

      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        task={selectedTaskForDetail}
        onUpdateStatus={handleUpdateStatus}
        openDeadlineHistory={openDeadlineHistoryModal}
        onDeleteTask={handleDeleteTask}
      />

      <TeamRosterModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onSubmit={handleCreateUser}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedUserForEdit(null);
        }}
        user={selectedUserForEdit}
        onSave={handleSaveUserProfile}
      />

      <ToastNotification
        toasts={toasts}
        onDismiss={dismissToast}
        confirmDialog={confirmDialog}
      />

      {/* GLOBAL FOOTER WITH COPYRIGHT */}
      <footer className={`mt-auto border-t py-4 px-6 text-center text-xs transition-colors ${
        isDark
          ? 'bg-[#1a2618] border-[#3c5638] text-[#e9edc9]'
          : 'bg-[#faf8f3] border-[#d4ddcf] text-[#1b2819]'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold">TeamSync Platform</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
              isDark ? 'bg-[#3c5638] text-[#fefae0]' : 'bg-[#e9edc9] text-[#1b2819]'
            }`}>v11.0</span>
          </div>
          <p className="font-semibold">
            Copyright © 2026 Rajkumar PR. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
