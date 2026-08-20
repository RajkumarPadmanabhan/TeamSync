'use client';

import React, { useState, useEffect } from 'react';
import { User, ProjectStatus, Project } from '../types';
import { useTheme } from '../context/ThemeContext';
import { FolderKanban, X } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id?: number;
    name: string;
    description: string;
    status: ProjectStatus;
    start_date?: string;
    end_date?: string;
    member_ids: number[];
  }) => Promise<void>;
  users: User[];
  editingProject?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  users,
  editingProject,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('ACTIVE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name || '');
      setDescription(editingProject.description || '');
      setStatus(editingProject.status || 'ACTIVE');
      setStartDate(editingProject.start_date ? editingProject.start_date.split('T')[0] : '');
      setEndDate(editingProject.end_date ? editingProject.end_date.split('T')[0] : '');
      setSelectedMemberIds(editingProject.members || []);
    } else {
      setName('');
      setDescription('');
      setStatus('ACTIVE');
      setStartDate('');
      setEndDate('');
      setSelectedMemberIds([]);
    }
    setError(null);
  }, [editingProject, isOpen]);

  if (!isOpen) return null;

  const toggleMember = (id: number) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        id: editingProject ? editingProject.id : undefined,
        name: name.trim(),
        description: description.trim(),
        status,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        member_ids: selectedMemberIds,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className={`border rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden transition-colors ${
        isDark ? 'bg-[#1f2c1d] border-[#3c5638] text-[#fefae0]' : 'bg-white border-[#d4ddcf] text-[#1b2819]'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-[#3c5638] bg-[#141d13]/50' : 'border-[#e2e8f0] bg-[#faf8f3]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-[#3c5638] text-[#fefae0] border-[#556b2f]' : 'bg-[#e9edc9] text-[#1b2819] border-[#d4ddcf]'
            }`}>
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">
                {editingProject ? 'Edit Project Details' : 'Create New Project'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                {editingProject ? 'Update name, description, status, or member assignments' : 'Initialize team workspace & set initial members'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${
              isDark ? 'text-[#e9edc9] hover:text-white hover:bg-[#3c5638]' : 'text-[#556b2f] hover:text-black hover:bg-[#e2e8f0]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-rose-500/20 text-rose-600 border border-rose-400 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Enterprise Cloud Migration v2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none ${
                isDark
                  ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                  : 'bg-white text-[#1b2819] border-[#d4ddcf]'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Detail the scope and goals of this project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none ${
                isDark
                  ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                  : 'bg-white text-[#1b2819] border-[#d4ddcf]'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className={`w-full text-xs rounded-xl px-3 py-2.5 border focus:outline-none ${
                  isDark
                    ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                    : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                }`}
              >
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full text-xs rounded-xl px-3 py-2 border focus:outline-none ${
                  isDark
                    ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                    : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full text-xs rounded-xl px-3 py-2 border focus:outline-none ${
                  isDark
                    ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                    : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                }`}
              />
            </div>
          </div>

          {/* Assign Team Members */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 flex items-center justify-between ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
              <span>Assign Team Members</span>
              <span className="text-[10px] font-normal opacity-75">
                {selectedMemberIds.length} selected
              </span>
            </label>
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl border ${
              isDark ? 'bg-[#141d13]/60 border-[#3c5638]' : 'bg-[#faf8f3] border-[#d4ddcf]'
            }`}>
              {users.map((u) => {
                const isSelected = selectedMemberIds.includes(u.id);
                return (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => toggleMember(u.id)}
                    className={`p-2 rounded-lg text-left text-xs flex items-center gap-2 border transition ${
                      isSelected
                        ? isDark
                          ? 'bg-[#556b2f] border-[#556b2f] text-[#fefae0] font-semibold'
                          : 'bg-[#385233] border-[#385233] text-[#fefae0] font-semibold'
                        : isDark
                          ? 'bg-[#1f2c1d] border-[#3c5638] text-[#e9edc9] hover:bg-[#3c5638]'
                          : 'bg-white border-[#d4ddcf] text-[#1b2819] hover:bg-[#e9edc9]'
                    }`}
                  >
                    <img
                      src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.first_name || u.username)}&background=556b2f&color=fefae0`}
                      alt={u.username}
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate">
                      <p className="truncate leading-tight">
                        {u.first_name ? `${u.first_name} ${u.last_name}` : u.username}
                      </p>
                      <p className="text-[9px] opacity-75 uppercase">{u.role}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className={`flex items-center justify-end gap-3 pt-4 border-t ${
            isDark ? 'border-[#3c5638]' : 'border-[#e2e8f0]'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold transition ${
                isDark ? 'text-[#e9edc9] hover:text-white' : 'text-[#556b2f] hover:text-black'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 text-xs font-semibold text-white rounded-xl shadow-md transition disabled:opacity-50 ${
                isDark
                  ? 'bg-[#556b2f] hover:bg-[#606c38]'
                  : 'bg-[#385233] hover:bg-[#283b24]'
              }`}
            >
              {loading ? (editingProject ? 'Updating Project...' : 'Creating Project...') : (editingProject ? 'Save Changes' : 'Create Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
