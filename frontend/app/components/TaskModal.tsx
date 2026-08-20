'use client';

import React, { useState, useEffect } from 'react';
import { Task, Project, User, TaskPriority, TaskStatus } from '../types';
import { CheckSquare, X, Calendar, UserCheck, AlertTriangle, MessageSquare } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task> & { deadline_reason?: string }) => Promise<void>;
  projects: Project[];
  users: User[];
  initialTask?: Task | null;
  defaultProjectId?: number | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projects,
  users,
  initialTask,
  defaultProjectId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<number | ''>('');
  const [assignedTo, setAssignedTo] = useState<number | ''>('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [deadline, setDeadline] = useState('');
  const [deadlineReason, setDeadlineReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setProjectId(initialTask.project);
      setAssignedTo(initialTask.assigned_to || '');
      setPriority(initialTask.priority);
      setStatus(initialTask.status);
      setDeadline(
        initialTask.deadline
          ? new Date(initialTask.deadline).toISOString().slice(0, 16)
          : ''
      );
      setDeadlineReason('');
    } else {
      setTitle('');
      setDescription('');
      setProjectId(defaultProjectId || (projects[0]?.id ?? ''));
      setAssignedTo('');
      setPriority('MEDIUM');
      setStatus('TODO');
      setDeadline('');
      setDeadlineReason('');
    }
  }, [initialTask, defaultProjectId, projects, isOpen]);

  if (!isOpen) return null;

  const isEditingDeadline =
    initialTask &&
    initialTask.deadline &&
    deadline &&
    new Date(initialTask.deadline).getTime() !== new Date(deadline).getTime();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    if (!projectId) {
      setError('Please select a project.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        id: initialTask?.id,
        title: title.trim(),
        description: description.trim(),
        project: Number(projectId),
        assigned_to: assignedTo ? Number(assignedTo) : null,
        priority,
        status,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        deadline_reason: deadlineReason || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {initialTask ? 'Edit Task & Update Deadline' : 'Create New Task'}
              </h3>
              <p className="text-xs text-slate-400">
                Assign tasks to team members & set priorities/deadlines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Design REST API Authentication Schemas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide complete task specifications, instructions, or acceptance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assign To Team Member
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.first_name ? `${u.first_name} ${u.last_name}` : u.username} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent ⚡</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Deadline Date & Time
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Deadline Reason Alert if Deadline changed */}
          {isEditingDeadline && (
            <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Deadline Revision Detected</span>
              </div>
              <p className="text-[11px] text-amber-200/80">
                The system will log a permanent audit record of this deadline change in the Deadline Audit Trail.
              </p>
              <input
                type="text"
                placeholder="Enter reason for deadline change (e.g., Client request, extended audit)..."
                value={deadlineReason}
                onChange={(e) => setDeadlineReason(e.target.value)}
                className="w-full bg-slate-900/80 text-amber-100 placeholder-amber-400/50 text-xs rounded-lg px-3 py-2 border border-amber-500/40 focus:outline-none"
              />
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Saving Task...' : initialTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
