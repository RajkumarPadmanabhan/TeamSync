'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskComment, TaskActivity, TaskAttachment } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare,
  X,
  Calendar,
  Clock,
  UserCheck,
  MessageSquare,
  Send,
  History,
  Paperclip,
  Activity,
  Upload,
  FileText,
  CheckCircle2,
  Download,
  Trash2
} from 'lucide-react';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdateStatus: (taskId: number, newStatus: TaskStatus) => Promise<void>;
  openDeadlineHistory: (task: Task) => void;
  onDeleteTask?: (taskId: number) => Promise<void>;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onUpdateStatus,
  openDeadlineHistory,
  onDeleteTask,
}) => {
  const { user, isAdmin } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'comments' | 'activity' | 'attachments'>('comments');

  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      fetchComments(task.id);
      fetchActivities(task.id);
      fetchAttachments(task.id);
    }
  }, [isOpen, task]);

  const fetchComments = async (taskId: number) => {
    try {
      setLoadingComments(true);
      const data = await api.getTaskComments(taskId);
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchActivities = async (taskId: number) => {
    try {
      setLoadingActivities(true);
      const data = await api.getTaskActivityHistory(taskId);
      setActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const fetchAttachments = async (taskId: number) => {
    try {
      setLoadingAttachments(true);
      const data = await api.getTaskAttachments(taskId);
      setAttachments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAttachments(false);
    }
  };

  if (!isOpen || !task) return null;

  const handleStatusClick = async (status: TaskStatus) => {
    if (status === task.status) return;
    try {
      setUpdatingStatus(true);
      await onUpdateStatus(task.id, status);
      await fetchActivities(task.id);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setSubmittingComment(true);
      const added = await api.addTaskComment(task.id, newComment.trim());
      setComments((prev) => [...prev, added]);
      setNewComment('');
      await fetchActivities(task.id);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingFile(true);
      const uploaded = await api.uploadTaskAttachment(task.id, file);
      setAttachments((prev) => [uploaded, ...prev]);
      await fetchActivities(task.id);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingFile(false);
    }
  };

  const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
    { value: 'TODO', label: 'To Do', color: 'bg-slate-700 text-slate-200' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-indigo-600 text-indigo-100' },
    { value: 'IN_REVIEW', label: 'In Review', color: 'bg-amber-600 text-amber-100' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-emerald-600 text-emerald-100' },
  ];

  const priorityColors: Record<string, string> = {
    LOW: 'bg-slate-800 text-slate-300 border-slate-700',
    MEDIUM: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    HIGH: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    URGENT: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'No Deadline Set';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {task.project_name || `Project #${task.project}`}
            </span>
            <h2 className="text-lg font-extrabold text-white mt-1">{task.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && onDeleteTask && (
              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this task? This will permanently remove the task for all users including the assigned team member.')) {
                    await onDeleteTask(task.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                title="Delete Task Permanently"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/60 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Assigned To</p>
              <div className="flex items-center gap-2 mt-1">
                {task.assigned_to_detail ? (
                  <>
                    <img
                      src={
                        task.assigned_to_detail.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          task.assigned_to_detail.first_name || task.assigned_to_detail.username
                        )}&background=3b82f6&color=fff`
                      }
                      alt="assigned"
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="font-semibold text-slate-200">
                      {task.assigned_to_detail.first_name
                        ? `${task.assigned_to_detail.first_name} ${task.assigned_to_detail.last_name}`
                        : task.assigned_to_detail.username}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500 italic">Unassigned</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Priority</p>
              <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Deadline</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium text-slate-200">{formatDate(task.deadline)}</span>
                <button
                  onClick={() => openDeadlineHistory(task)}
                  className="ml-auto text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20"
                >
                  <History className="w-3 h-3" /> Audit ({task.deadline_history_count})
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Description & Specifications
            </h4>
            <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {task.description || 'No detailed description provided.'}
            </div>
          </div>

          {/* Status Workflow Buttons */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Update Task Status
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              {statusOptions.map((opt) => {
                const isActive = task.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    disabled={updatingStatus}
                    onClick={() => handleStatusClick(opt.value)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                      isActive
                        ? `${opt.color} ring-2 ring-white/30 shadow-md`
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700/80'
                    }`}
                  >
                    {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-Tabs: Comments / Activity Log / Attachments */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveSubTab('comments')}
                className={`text-xs font-bold flex items-center gap-1.5 pb-1 transition border-b-2 ${
                  activeSubTab === 'comments'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Comments ({comments.length})</span>
              </button>

              <button
                onClick={() => setActiveSubTab('activity')}
                className={`text-xs font-bold flex items-center gap-1.5 pb-1 transition border-b-2 ${
                  activeSubTab === 'activity'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Activity History ({activities.length})</span>
              </button>

              <button
                onClick={() => setActiveSubTab('attachments')}
                className={`text-xs font-bold flex items-center gap-1.5 pb-1 transition border-b-2 ${
                  activeSubTab === 'attachments'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attachments ({attachments.length})</span>
              </button>
            </div>

            {/* SUB-TAB 1: COMMENTS */}
            {activeSubTab === 'comments' && (
              <div className="space-y-3">
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {loadingComments ? (
                    <p className="text-xs text-slate-500">Loading comments...</p>
                  ) : comments.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-3 bg-slate-800/20 rounded-xl text-center">
                      No comments or progress updates posted yet.
                    </p>
                  ) : (
                    comments.map((c) => {
                      const author = c.author_detail;
                      return (
                        <div key={c.id} className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <img
                                src={
                                  author?.avatar_url ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    author?.first_name || author?.username || 'User'
                                  )}&background=6366f1&color=fff`
                                }
                                alt="author"
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <span className="font-semibold text-slate-200">
                                {author?.first_name ? `${author.first_name} ${author.last_name}` : author?.username}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(c.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 pl-7 leading-relaxed">{c.content}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Write a comment or progress update..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </form>
              </div>
            )}

            {/* SUB-TAB 2: ACTIVITY HISTORY (OPTIONAL ENHANCEMENT) */}
            {activeSubTab === 'activity' && (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {loadingActivities ? (
                  <p className="text-xs text-slate-500">Loading task activity history...</p>
                ) : activities.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-800/20 rounded-xl text-center">
                    No task activities recorded yet.
                  </p>
                ) : (
                  activities.map((act) => (
                    <div key={act.id} className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-start gap-3 text-xs">
                      <div className="p-2 rounded-lg bg-slate-800 text-indigo-400 shrink-0">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{act.activity_type.replace('_', ' ')}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(act.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-0.5">{act.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* SUB-TAB 3: ATTACHMENTS (OPTIONAL ENHANCEMENT) */}
            {activeSubTab === 'attachments' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">Attached files & documents</p>
                  <label className="cursor-pointer px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                    />
                  </label>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {loadingAttachments ? (
                    <p className="text-xs text-slate-500">Loading attachments...</p>
                  ) : attachments.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-3 bg-slate-800/20 rounded-xl text-center">
                      No attachments uploaded for this task yet.
                    </p>
                  ) : (
                    attachments.map((att) => (
                      <div key={att.id} className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                          <div className="truncate">
                            <p className="font-semibold text-slate-200 truncate">{att.file_name}</p>
                            <p className="text-[10px] text-slate-500">
                              {formatFileSize(att.file_size)} • Uploaded by {att.uploaded_by_detail?.first_name || att.uploaded_by_detail?.username || 'User'}
                            </p>
                          </div>
                        </div>

                        <a
                          href={att.file.startsWith('http') ? att.file : `http://localhost:8000${att.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-indigo-400 hover:bg-slate-700 rounded-lg transition shrink-0"
                          title="Download / View File"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
