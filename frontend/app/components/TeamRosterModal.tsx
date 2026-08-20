'use client';

import React, { useState } from 'react';
import { User, Role } from '../types';
import { useTheme } from '../context/ThemeContext';
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className={`border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transition-colors ${
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
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">Add Team Member</h3>
              <p className={`text-xs ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>Onboard new admin or team member to TeamSync</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                First Name
              </label>
              <input
                type="text"
                placeholder="e.g. David"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none ${
                  isDark
                    ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                    : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                Last Name
              </label>
              <input
                type="text"
                placeholder="e.g. Beckham"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none ${
                  isDark
                    ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                    : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                Username <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. davidb"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none ${
                  isDark
                    ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                    : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="david@teamsync.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none ${
                  isDark
                    ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                    : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                Role <span className="text-rose-500">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className={`w-full text-xs rounded-xl px-3 py-2.5 border focus:outline-none ${
                  isDark
                    ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                    : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                }`}
              >
                <option value="MEMBER">Team Member</option>
                <option value="ADMIN">Admin 👑</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                Department
              </label>
              <input
                type="text"
                placeholder="e.g. Frontend Engineering"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none ${
                  isDark
                    ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                    : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                }`}
              />
            </div>
          </div>

          {/* Footer */}
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
              {loading ? 'Adding Member...' : 'Add Team Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
