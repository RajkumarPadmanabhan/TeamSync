'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './lib/api';
import { Project, Task, DashboardStats, TaskStatus, TaskPriority, User, ProjectInvitation } from './types';
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
  Sparkles,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Trash2,
  Edit,
  ShieldCheck,
  UserCheck,
  Mail,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function Home() {
  const { user, isAdmin, allUsers, refreshUsers, loading: authLoading } = useAuth();

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

  // Toast & Warning Dialog state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  const showToast = (type: ToastType, title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveUserProfile = async (data: any) => {
    try {
      if (data.id === user?.id) {
        await api.updateProfile(data);
      } else if (data.id) {
        await api.updateUser(data.id, data);
      }
      await refreshUsers();
      await loadAllData();
      showToast('success', 'Profile Updated', 'User profile information updated successfully.');
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Failed to update user profile.');
    }
  };

  // Filters for tasks
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [assignedToMeFilter, setAssignedToMeFilter] = useState<boolean>(false);

  const fetchInvitations = async () => {
    try {
      if (api.getToken()) {
        const invList = await api.getProjectInvitations();
        setInvitations(invList);
      }
    } catch (err) {
      console.error('Error fetching invitations:', err);
    }
  };

  const loadAllData = async () => {
    try {
      setLoadingData(true);
      setDataError(null);

      const [projectsData, tasksData, statsData] = await Promise.all([
        api.getProjects(),
        api.getTasks(),
        api.getDashboardStats(),
      ]);

      setProjects(projectsData);
      setTasks(tasksData);
      setStats(statsData);
      await fetchInvitations();
    } catch (err: any) {
      console.error(err);
      setDataError(err.message || 'Failed to connect to backend server.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  // Handle Invitations
  const handleRespondInvitation = async (invitationId: number, action: 'accept' | 'reject') => {
    try {
      const res = await api.respondToInvitation(invitationId, action);
      showToast(action === 'accept' ? 'success' : 'info', 'Project Invitation Updated', res.detail);
      await loadAllData();
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message || 'Failed to respond to invitation.');
    }
  };

  const handleSendProjectInvitation = async (projectId: number, userId: number) => {
    try {
      const res = await api.sendProjectInvitation(projectId, userId);
      showToast('success', 'Invitation Request Sent', res.detail);
      await fetchInvitations();
    } catch (err: any) {
      showToast('error', 'Invitation Error', err.message || 'Failed to send invitation request.');
    }
  };

  // Security Guard: If unauthenticated, securely render AuthScreen and prevent back navigation
  if (!user && !authLoading) {
    if (typeof window !== 'undefined' && window.history.state?.protected) {
      window.history.replaceState(null, '', '/login');
    }
    return <AuthScreen onSuccess={loadAllData} />;
  }

  // Handle Project Creation or Update
  const handleSaveProject = async (data: any) => {
    try {
      if (data.id) {
        await api.updateProject(data.id, data);
        showToast('success', 'Project Updated', `Project "${data.name}" updated successfully.`);
      } else {
        await api.createProject(data);
        showToast('success', 'Project Created', `New project "${data.name}" created successfully.`);
      }
      await loadAllData();
    } catch (err: any) {
      showToast('error', 'Project Save Error', err.message || 'Failed to save project.');
    }
  };

  const handleDeleteProject = (projectId: number, projectName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Project Warning',
      message: `Are you sure you want to delete project "${projectName}"? This action cannot be undone and will delete all associated tasks.`,
      confirmText: 'Delete Project',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await api.deleteProject(projectId);
          if (selectedProjectId === projectId) {
            setSelectedProjectId(null);
          }
          await loadAllData();
          showToast('warning', 'Project Deleted', `Project "${projectName}" and its tasks were deleted.`);
        } catch (err: any) {
          showToast('error', 'Delete Failed', err.message || 'Failed to delete project.');
        }
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  // Handle Task Creation or Update
  const handleSaveTask = async (data: any) => {
    try {
      if (data.id) {
        await api.updateTask(data.id, data);
        showToast('success', 'Task Updated', `Task "${data.title}" updated successfully.`);
      } else {
        await api.createTask(data);
        showToast('success', 'Task Assigned', `Task "${data.title}" assigned successfully.`);
      }
      await loadAllData();
    } catch (err: any) {
      showToast('error', 'Task Save Error', err.message || 'Failed to save task.');
    }
  };

  // Handle Quick Status Update
  const handleUpdateStatus = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      await loadAllData();
      if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
        setSelectedTaskForDetail((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast('info', 'Status Updated', `Task status updated to ${newStatus.replace('_', ' ')}.`);
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Failed to update status.');
    }
  };

  // Handle Delete Task
  const handleDeleteTask = async (taskId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Task Warning',
      message: 'Are you sure you want to delete this task? This action cannot be undone.',
      confirmText: 'Delete Task',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await api.deleteTask(taskId);
          await loadAllData();
          showToast('warning', 'Task Deleted', 'Task was deleted successfully.');
        } catch (err: any) {
          showToast('error', 'Delete Failed', err.message || 'Failed to delete task.');
        }
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  // Handle Create Team Member
  const handleCreateUser = async (userData: any) => {
    try {
      await api.createUser(userData);
      await refreshUsers();
      await loadAllData();
      showToast('success', 'Team Member Added', `User "${userData.username}" created successfully.`);
    } catch (err: any) {
      showToast('error', 'Creation Error', err.message || 'Failed to add user.');
    }
  };

  // Open Deadline Modal
  const openDeadlineHistoryModal = (t: Task) => {
    setSelectedTaskForDeadline(t);
    setIsDeadlineModalOpen(true);
  };

  // Open Task Detail Modal
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

  // Filtered Projects based on global search query
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
    LOW: 'bg-slate-800 text-slate-300 border-slate-700',
    MEDIUM: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    HIGH: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    URGENT: 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold',
  };

  const statusBadge: Record<string, string> = {
    TODO: 'bg-slate-800 text-slate-300 border-slate-700',
    IN_PROGRESS: 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30',
    IN_REVIEW: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    COMPLETED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
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
            <div className="p-3 bg-indigo-600/20 border border-indigo-500/40 rounded-2xl text-xs text-indigo-200 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  Filtering results for &quot;<strong className="text-white font-bold">{searchQuery}</strong>&quot; — Found <strong>{filteredTasks.length}</strong> task(s) and <strong>{filteredProjects.length}</strong> project(s)
                </span>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="px-2.5 py-1 bg-indigo-500/30 hover:bg-indigo-500/50 text-white font-bold text-[11px] rounded-lg transition"
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
                  <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>Executive Overview</span>
                    <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      Live Operational Metrics
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time project progress, task allocation & deadline revision metrics
                  </p>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition"
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
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-indigo-400" />
                      <span>Project Completion Progress</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('projects')}
                      className="text-xs text-indigo-400 hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-4">
                    {filteredProjects.map((proj) => (
                      <div key={proj.id} className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-200">{proj.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-indigo-400 font-bold">
                              {proj.progress_percentage}%
                            </span>
                            {isAdmin && (
                              <div className="flex items-center gap-1 pl-2 border-l border-slate-700/80">
                                <button
                                  onClick={() => {
                                    setEditingProject(proj);
                                    setIsProjectModalOpen(true);
                                  }}
                                  className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition"
                                  title="Edit project name & details"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProject(proj.id, proj.name)}
                                  className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                                  title="Delete project"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                            style={{ width: `${proj.progress_percentage}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span>
                            Tasks: {proj.completed_tasks} / {proj.total_tasks} completed
                          </span>
                          <span className="text-slate-500">
                            {proj.members.length} Team Members
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority & Deadline Audit Highlight Card */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-amber-400" />
                      <span>Deadline Audit Trail Summary</span>
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      Additional Challenge
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Whenever a task deadline is adjusted by an admin, TeamSync maintains a complete historical changelog recording previous deadlines, updated deadlines, editor avatars, and justification reasons.
                  </p>

                  <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">Tasks with Revised Deadlines:</span>
                      <span className="font-bold text-amber-400 text-sm">{stats?.total_deadline_changes || 0}</span>
                    </div>

                    <button
                      onClick={() => setActiveTab('deadline-history')}
                      className="w-full py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/40 flex items-center justify-center gap-2 transition"
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
                  <h1 className="text-xl font-extrabold text-white tracking-tight">
                    Projects Workspace
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Create projects, set target end dates, and manage team member access
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setIsProjectModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition"
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
                    className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${proj.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : proj.status === 'PLANNING' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                          {proj.status}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-indigo-400 font-mono">
                            {proj.progress_percentage}% Done
                          </span>
                          {isAdmin && (
                            <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
                              <button
                                onClick={() => {
                                  setEditingProject(proj);
                                  setIsProjectModalOpen(true);
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition"
                                title="Edit project name & details"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(proj.id, proj.name)}
                                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                                title="Delete project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="text-base font-extrabold text-white">{proj.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {proj.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-800">
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                          style={{ width: `${proj.progress_percentage}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center -space-x-2">
                          {proj.members_detail?.map((m) => (
                            <img
                              key={m.id}
                              src={m.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.first_name || m.username)}&background=6366f1&color=fff`}
                              alt={m.username}
                              title={`${m.first_name || m.username} (${m.role})`}
                              className="w-6 h-6 rounded-full border-2 border-slate-900 object-cover"
                            />
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            setSelectedProjectId(proj.id);
                            setActiveTab('tasks');
                          }}
                          className="text-xs text-indigo-400 hover:underline font-semibold flex items-center gap-1"
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
                  <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>Task Management</span>
                    {selectedProjectId && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Filtered: {projects.find((p) => p.id === selectedProjectId)?.name}
                      </span>
                    )}
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    View assigned tasks, update status, track deadlines & post comments
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAssignedToMeFilter(!assignedToMeFilter)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${assignedToMeFilter ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
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
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Create Task</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Task Filters Bar */}
              <div className="flex items-center gap-3 flex-wrap bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Filter className="w-3.5 h-3.5" />
                  <span className="font-semibold">Filters:</span>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 border border-slate-700 focus:outline-none"
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
                  className="bg-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 border border-slate-700 focus:outline-none"
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
                    className="text-[11px] text-rose-400 hover:underline font-semibold ml-auto"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                  <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
                    <CheckSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-300">No tasks found matching criteria</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting filters or create a new task</p>
                  </div>
                ) : (
                  filteredTasks.map((t) => {
                    const assignee = t.assigned_to_detail;
                    return (
                      <div
                        key={t.id}
                        className="bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 transition shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
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
                                ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30'
                                : 'bg-slate-800/80 border-slate-700 text-transparent hover:border-emerald-500 hover:text-emerald-400/50'
                            }`}
                            title={t.status === 'COMPLETED' ? 'Mark as In Progress' : 'Mark Task as Completed'}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
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
                                <option value="TODO" className="bg-slate-900 text-slate-300 font-sans">To Do</option>
                                <option value="IN_PROGRESS" className="bg-slate-900 text-blue-300 font-sans">In Progress</option>
                                <option value="IN_REVIEW" className="bg-slate-900 text-purple-300 font-sans">In Review</option>
                                <option value="COMPLETED" className="bg-slate-900 text-emerald-300 font-sans">Completed ✓</option>
                              </select>
                            </div>

                            <button
                              onClick={() => openTaskDetail(t)}
                              className={`text-left font-bold text-sm hover:text-indigo-300 transition truncate block ${t.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-white'}`}
                            >
                              {t.title}
                            </button>

                            <p className="text-xs text-slate-400 line-clamp-1">
                              {t.description || 'No description provided.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs shrink-0 flex-wrap">
                          <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
                            {assignee ? (
                              <>
                                <img
                                  src={assignee.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee.first_name || assignee.username)}&background=3b82f6&color=fff`}
                                  alt="assignee"
                                  className="w-5 h-5 rounded-full object-cover"
                                />
                                <span className="font-semibold text-slate-200 text-xs">
                                  {assignee.first_name ? `${assignee.first_name} ${assignee.last_name}` : assignee.username}
                                </span>
                              </>
                            ) : (
                              <span className="text-slate-500 italic text-xs">Unassigned</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-300 font-medium bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            <span>{formatDate(t.deadline)}</span>
                          </div>

                          <button
                            onClick={() => openDeadlineHistoryModal(t)}
                            className="p-2 text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl border border-amber-500/30 font-semibold text-xs flex items-center gap-1 transition"
                            title="View Deadline Change History"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">History ({t.deadline_history_count})</span>
                          </button>

                          <button
                            onClick={() => openTaskDetail(t)}
                            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 font-semibold text-xs flex items-center gap-1 transition"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{t.comments_count}</span>
                          </button>

                          {isAdmin && (
                            <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
                              <button
                                onClick={() => {
                                  setEditingTask(t);
                                  setIsTaskModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition"
                                title="Edit Task & Deadline"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(t.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
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
                    <h1 className="text-xl font-extrabold text-white tracking-tight">
                      Deadline Audit Trail
                    </h1>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                      Additional Challenge Requirement
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Complete historical tracking of all previous and updated deadlines across tasks
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Select any task from below to view its chronological deadline revision log, including editor profile, old vs new date timestamps, and change justification.
                </p>

                <div className="space-y-3">
                  {tasks.length === 0 ? (
                    <div className="p-8 text-center bg-slate-800/40 rounded-xl border border-slate-800">
                      <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-300">No tasks created yet</p>
                      <p className="text-xs text-slate-500 mt-1">Create tasks to track deadline revision history.</p>
                    </div>
                  ) : (
                    tasks.map((t) => {
                      const hasRevisions = t.deadline_history_count > 0;
                      return (
                        <div
                          key={t.id}
                          className="p-4 bg-slate-800/60 border border-slate-800 hover:border-amber-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                                {t.project_name || `Project #${t.project}`}
                              </span>
                              {hasRevisions ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  ⚡ {t.deadline_history_count} Revisions Logged
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                  Initial Deadline
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-sm text-white">{t.title}</h4>
                            <p className="text-xs text-amber-400 font-medium">
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
                                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                                title="Update Task Deadline & Record Audit Reason"
                              >
                                <Edit className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Update Deadline</span>
                              </button>
                            )}
                            <button
                              onClick={() => openDeadlineHistoryModal(t)}
                              className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition ${
                                hasRevisions
                                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 shadow-sm'
                                  : 'bg-slate-800 hover:bg-slate-700/80 text-slate-300 border-slate-700'
                              }`}
                            >
                              <History className="w-4 h-4 text-amber-400" />
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
                  <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>Project Invitations & Requests</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                      {invitations.filter((inv) => inv.status === 'PENDING').length} Pending
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Admin invitations to join projects. Accept requests to participate in project tasks & workflows.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {invitations.length === 0 ? (
                  <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
                    <Mail className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm font-semibold text-slate-300">No Project Requests Found</p>
                    <p className="text-xs text-slate-500">
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
                        className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition"
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${isPending ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse' : isAccepted ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}`}>
                              {inv.status}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              Received: {new Date(inv.created_at).toLocaleString()}
                            </span>
                          </div>

                          <h3 className="text-base font-extrabold text-white">
                            {project?.name || `Project #${inv.project}`}
                          </h3>
                          <p className="text-xs text-slate-400">
                            Invited by <strong className="text-slate-200">{sender?.first_name ? `${sender.first_name} ${sender.last_name}` : sender?.username || 'Admin'}</strong> ({sender?.email})
                          </p>
                          {inv.message && (
                            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800 text-xs text-slate-300 italic">
                              &quot;{inv.message}&quot;
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleRespondInvitation(inv.id, 'reject')}
                                className="px-4 py-2.5 bg-slate-800 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Reject Request</span>
                              </button>
                              <button
                                onClick={() => handleRespondInvitation(inv.id, 'accept')}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Accept & Join Project</span>
                              </button>
                            </>
                          )}
                          {isAccepted && (
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                              <CheckCircle className="w-4 h-4" /> Joined Project
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
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
                  <h1 className="text-xl font-extrabold text-white tracking-tight">
                    Team Directory
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Team members, roles, departments, and onboarding
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setIsTeamModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition"
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
                    className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-start gap-3"
                  >
                    <img
                      src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.first_name || u.username)}&background=6366f1&color=fff`}
                      alt={u.username}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white">
                          {u.first_name ? `${u.first_name} ${u.last_name}` : u.username}
                        </h4>
                        <div className="flex items-center gap-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${u.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                            {u.role}
                          </span>
                          {(isAdmin || u.id === user?.id) && (
                            <button
                              onClick={() => {
                                setSelectedUserForEdit(u);
                                setIsProfileModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-md transition"
                              title="Edit user profile info (email, name, role, department)"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{u.email}</p>
                      <p className="text-[11px] text-slate-500 mb-2">{u.department || 'General'}</p>

                      {/* Admin Project Request Controls */}
                      {isAdmin && u.id !== user?.id && (
                        <div className="pt-2 border-t border-slate-800/80 space-y-2">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <select
                              id={`project-select-${u.id}`}
                              className="bg-slate-800 text-slate-200 text-[11px] rounded-lg px-2 py-1 border border-slate-700 focus:outline-none flex-1"
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
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg transition shadow"
                              title="Send invitation request to join project"
                            >
                              Send Request
                            </button>
                          </div>

                          {/* Render Existing Invitation Badges */}
                          {invitations
                            .filter((inv) => inv.invited_user === u.id)
                            .map((inv) => (
                              <div key={inv.id} className="flex items-center justify-between text-[10px] bg-slate-800/40 px-2 py-1 rounded border border-slate-800">
                                <span className="text-slate-400 truncate">{inv.project_detail?.name}:</span>
                                {inv.status === 'PENDING' && <span className="font-bold text-amber-400">⌛ Pending</span>}
                                {inv.status === 'ACCEPTED' && <span className="font-bold text-emerald-400">✅ Joined</span>}
                                {inv.status === 'REJECTED' && (
                                  <button
                                    onClick={() => handleSendProjectInvitation(inv.project, u.id)}
                                    className="font-bold text-rose-400 hover:underline cursor-pointer"
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
    </div>
  );
}
