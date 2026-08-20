'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskComment, TaskActivity, TaskAttachment } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    { value: 'TODO', label: 'To Do', color: isDark ? 'bg-[#3c5638] text-[#fefae0]' : 'bg-[#e2e8f0] text-[#1b2819]' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: isDark ? 'bg-[#556b2f] text-[#fefae0]' : 'bg-[#385233] text-[#fefae0]' },
    { value: 'IN_REVIEW', label: 'In Review', color: isDark ? 'bg-amber-800 text-amber-100' : 'bg-amber-200 text-amber-900' },
    { value: 'COMPLETED', label: 'Completed', color: isDark ? 'bg-[#283925] text-[#a3b18a]' : 'bg-[#386641] text-[#fefae0]' },
  ];

  const priorityColors: Record<string, string> = {
    LOW: isDark ? 'bg-[#141d13] text-[#e9edc9] border-[#3c5638]' : 'bg-[#faf8f3] text-[#556b2f] border-[#d4ddcf]',
    MEDIUM: isDark ? 'bg-[#283925] text-[#fefae0] border-[#556b2f]' : 'bg-[#e9edc9] text-[#1b2819] border-[#385233]',
    HIGH: isDark ? 'bg-[#556b2f] text-[#fefae0] border-[#e9edc9]' : 'bg-[#385233] text-[#fefae0] border-[#1b2819]',
    URGENT: 'bg-rose-600 text-white border-rose-400 animate-pulse',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className={`border rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden transition-colors flex flex-col max-h-[85vh] ${
        isDark ? 'bg-[#1f2c1d] border-[#3c5638] text-[#fefae0]' : 'bg-white border-[#d4ddcf] text-[#1b2819]'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-[#3c5638] bg-[#141d13]/50' : 'border-[#e2e8f0] bg-[#faf8f3]'
        }`}>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
              isDark ? 'bg-[#141d13] text-[#e9edc9] border-[#3c5638]' : 'bg-white text-[#556b2f] border-[#d4ddcf]'
            }`}>
              {task.project_name || `Project #${task.project}`}
            </span>
            <h2 className="text-lg font-extrabold mt-1">{task.title}</h2>
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
                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-600 border border-rose-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                title="Delete Task Permanently"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition ${
                isDark ? 'text-[#e9edc9] hover:text-white hover:bg-[#3c5638]' : 'text-[#556b2f] hover:text-black hover:bg-[#e2e8f0]'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Metadata Row */}
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl border text-xs ${
            isDark ? 'bg-[#141d13]/60 border-[#3c5638]' : 'bg-[#faf8f3] border-[#d4ddcf]'
          }`}>
            <div>
              <p className={`text-[10px] uppercase font-bold ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>Assigned To</p>
              <div className="flex items-center gap-2 mt-1">
                {task.assigned_to_detail ? (
                  <>
                    <img
                      src={
                        task.assigned_to_detail.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          task.assigned_to_detail.first_name || task.assigned_to_detail.username
                        )}&background=556b2f&color=fefae0`
                      }
                      alt="assigned"
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="font-semibold">
                      {task.assigned_to_detail.first_name
                        ? `${task.assigned_to_detail.first_name} ${task.assigned_to_detail.last_name}`
                        : task.assigned_to_detail.username}
                    </span>
                  </>
                ) : (
                  <span className="italic opacity-60">Unassigned</span>
                )}
              </div>
            </div>

            <div>
              <p className={`text-[10px] uppercase font-bold ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>Priority</p>
              <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
            </div>

            <div>
              <p className={`text-[10px] uppercase font-bold ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>Deadline</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-medium">{formatDate(task.deadline)}</span>
                <button
                  onClick={() => openDeadlineHistory(task)}
                  className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 transition ${
                    isDark
                      ? 'bg-[#556b2f] text-[#fefae0] border-[#e9edc9]'
                      : 'bg-[#385233] text-[#fefae0] border-[#385233]'
                  }`}
                >
                  <History className="w-3 h-3" /> Audit ({task.deadline_history_count})
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
              Description & Specifications
            </h4>
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed whitespace-pre-wrap ${
              isDark ? 'bg-[#141d13]/40 border-[#3c5638] text-[#fefae0]' : 'bg-[#faf8f3] border-[#e2e8f0] text-[#1b2819]'
            }`}>
              {task.description || 'No detailed description provided.'}
            </div>
          </div>

          {/* Status Workflow Buttons */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
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
                        ? `${opt.color} ring-2 ring-[#556b2f] shadow-md`
                        : isDark
                          ? 'bg-[#141d13] text-[#e9edc9] hover:bg-[#3c5638] border border-[#3c5638]'
                          : 'bg-[#faf8f3] text-[#556b2f] hover:bg-[#e9edc9] border border-[#d4ddcf]'
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
          <div className={`space-y-4 pt-4 border-t ${isDark ? 'border-[#3c5638]' : 'border-[#e2e8f0]'}`}>
            <div className={`flex items-center gap-4 border-b pb-2 ${isDark ? 'border-[#3c5638]' : 'border-[#e2e8f0]'}`}>
              <button
                onClick={() => setActiveSubTab('comments')}
                className={`text-xs font-bold flex items-center gap-1.5 pb-1 transition border-b-2 ${
                  activeSubTab === 'comments'
                    ? isDark ? 'border-[#fefae0] text-[#fefae0]' : 'border-[#385233] text-[#385233]'
                    : isDark ? 'border-transparent text-[#e9edc9]' : 'border-transparent text-[#556b2f]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Comments ({comments.length})</span>
              </button>

              <button
                onClick={() => setActiveSubTab('activity')}
                className={`text-xs font-bold flex items-center gap-1.5 pb-1 transition border-b-2 ${
                  activeSubTab === 'activity'
                    ? isDark ? 'border-[#fefae0] text-[#fefae0]' : 'border-[#385233] text-[#385233]'
                    : isDark ? 'border-transparent text-[#e9edc9]' : 'border-transparent text-[#556b2f]'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Activity History ({activities.length})</span>
              </button>

              <button
                onClick={() => setActiveSubTab('attachments')}
                className={`text-xs font-bold flex items-center gap-1.5 pb-1 transition border-b-2 ${
                  activeSubTab === 'attachments'
                    ? isDark ? 'border-[#fefae0] text-[#fefae0]' : 'border-[#385233] text-[#385233]'
                    : isDark ? 'border-transparent text-[#e9edc9]' : 'border-transparent text-[#556b2f]'
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
                    <p className="text-xs opacity-60">Loading comments...</p>
                  ) : comments.length === 0 ? (
                    <p className={`text-xs italic p-3 rounded-xl text-center border ${
                      isDark ? 'bg-[#141d13]/50 border-[#3c5638] text-[#e9edc9]' : 'bg-[#faf8f3] border-[#e2e8f0] text-[#556b2f]'
                    }`}>
                      No comments or progress updates posted yet.
                    </p>
                  ) : (
                    comments.map((c) => {
                      const author = c.author_detail;
                      return (
                        <div key={c.id} className={`p-3 rounded-xl border space-y-1.5 ${
                          isDark ? 'bg-[#141d13]/70 border-[#3c5638]' : 'bg-[#faf8f3] border-[#e2e8f0]'
                        }`}>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <img
                                src={
                                  author?.avatar_url ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    author?.first_name || author?.username || 'User'
                                  )}&background=556b2f&color=fefae0`
                                }
                                alt="author"
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <span className="font-semibold">
                                {author?.first_name ? `${author.first_name} ${author.last_name}` : author?.username}
                              </span>
                            </div>
                            <span className="text-[10px] opacity-60 font-mono">
                              {new Date(c.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs pl-7 leading-relaxed">{c.content}</p>
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
                    className={`flex-1 text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none ${
                      isDark
                        ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                        : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition disabled:opacity-50 flex items-center gap-1.5 text-white ${
                      isDark ? 'bg-[#556b2f] hover:bg-[#606c38]' : 'bg-[#385233] hover:bg-[#283b24]'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </form>
              </div>
            )}

            {/* SUB-TAB 2: ACTIVITY HISTORY */}
            {activeSubTab === 'activity' && (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {loadingActivities ? (
                  <p className="text-xs opacity-60">Loading task activity history...</p>
                ) : activities.length === 0 ? (
                  <p className={`text-xs italic p-3 rounded-xl text-center border ${
                    isDark ? 'bg-[#141d13]/50 border-[#3c5638] text-[#e9edc9]' : 'bg-[#faf8f3] border-[#e2e8f0] text-[#556b2f]'
                  }`}>
                    No task activities recorded yet.
                  </p>
                ) : (
                  activities.map((act) => (
                    <div key={act.id} className={`p-3 rounded-xl border flex items-start gap-3 text-xs ${
                      isDark ? 'bg-[#141d13]/50 border-[#3c5638]' : 'bg-[#faf8f3] border-[#e2e8f0]'
                    }`}>
                      <div className={`p-2 rounded-lg shrink-0 ${isDark ? 'bg-[#3c5638] text-[#fefae0]' : 'bg-[#e9edc9] text-[#1b2819]'}`}>
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{act.activity_type.replace('_', ' ')}</span>
                          <span className="text-[10px] opacity-60 font-mono">
                            {new Date(act.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="opacity-80 mt-0.5">{act.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* SUB-TAB 3: ATTACHMENTS */}
            {activeSubTab === 'attachments' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>Attached files & documents</p>
                  <label className={`cursor-pointer px-3 py-1.5 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isDark ? 'bg-[#556b2f] hover:bg-[#606c38]' : 'bg-[#385233] hover:bg-[#283b24]'
                  }`}>
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
                    <p className="text-xs opacity-60">Loading attachments...</p>
                  ) : attachments.length === 0 ? (
                    <p className={`text-xs italic p-3 rounded-xl text-center border ${
                      isDark ? 'bg-[#141d13]/50 border-[#3c5638] text-[#e9edc9]' : 'bg-[#faf8f3] border-[#e2e8f0] text-[#556b2f]'
                    }`}>
                      No attachments uploaded for this task yet.
                    </p>
                  ) : (
                    attachments.map((att) => (
                      <div key={att.id} className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        isDark ? 'bg-[#141d13]/70 border-[#3c5638]' : 'bg-[#faf8f3] border-[#e2e8f0]'
                      }`}>
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText className="w-4 h-4 text-[#556b2f] shrink-0" />
                          <div className="truncate">
                            <p className="font-semibold truncate">{att.file_name}</p>
                            <p className="text-[10px] opacity-60">
                              {formatFileSize(att.file_size)} • Uploaded by {att.uploaded_by_detail?.first_name || att.uploaded_by_detail?.username || 'User'}
                            </p>
                          </div>
                        </div>

                        <a
                          href={att.file.startsWith('http') ? att.file : `http://localhost:8000${att.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-[#556b2f] hover:bg-[#e9edc9] rounded-lg transition shrink-0"
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
