'use client';

import React, { useState } from 'react';
import { User, Role } from '../types';
import { UserPlus, X, ShieldCheck, UserCheck } from 'lucide-react';

interface TeamRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: Role;
    department: string;
    password: string;
  }) => Promise<void>;
}

export const TeamRosterModal: React.FC<TeamRosterModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<Role>('MEMBER');
  const [department, setDepartment] = useState('Engineering');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      setError('Username and email are required.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        username: username.trim(),
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role,
        department: department.trim(),
        password,
      });
      // reset
      setUsername('');
      setEmail('');
      setFirstName('');
      setLastName('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add team member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Add Team Member</h3>
              <p className="text-xs text-slate-400">Onboard new admin or team member to TeamSync</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                placeholder="e.g. David"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                placeholder="e.g. Beckham"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Username <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. davidb"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="david@teamsync.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Role <span className="text-rose-400">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="MEMBER">Team Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Department
              </label>
              <input
                type="text"
                placeholder="e.g. Frontend Engineering"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer */}
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
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Adding Member...' : 'Add Team Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
