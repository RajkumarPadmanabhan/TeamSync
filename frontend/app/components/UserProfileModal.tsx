'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, Role } from '../types';
import { useTheme } from '../context/ThemeContext';
import { UserCheck, X, Camera, Upload, Link as LinkIcon, RotateCcw, Check } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (updatedData: {
    id?: number;
    first_name: string;
    last_name: string;
    email: string;
    role: Role;
    department: string;
    avatar_url?: string;
  }) => Promise<void>;
}

// Preset gallery of enterprise avatars
const AVATAR_PRESETS = [
  { id: '1', name: 'Executive Admin', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: '2', name: 'Tech Lead', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: '3', name: 'Product Manager', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  { id: '4', name: 'DevOps Engineer', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: '5', name: 'UI/UX Designer', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
  { id: '6', name: 'Fullstack Dev', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80' },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('MEMBER');
  const [department, setDepartment] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarTab, setAvatarTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDefaultAvatar = (name: string) => {
    const cleanName = encodeURIComponent(name || 'User');
    return `https://ui-avatars.com/api/?name=${cleanName}&background=385233&color=fefae0&size=128&bold=true`;
  };

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
      setRole(user.role || 'MEMBER');
      setDepartment(user.department || '');
      setAvatarUrl(user.avatar_url || getDefaultAvatar(user.first_name || user.username));
    }
    setError(null);
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const currentDisplayName = firstName ? `${firstName} ${lastName}` : user.username;
  const activeAvatar = avatarUrl || getDefaultAvatar(currentDisplayName);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefault = () => {
    const defaultUrl = getDefaultAvatar(currentDisplayName);
    setAvatarUrl(defaultUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await onSave({
        id: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        role,
        department: department.trim(),
        avatar_url: avatarUrl.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile information.');
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
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">Update Profile & Avatar</h3>
              <p className={`text-xs ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                Upload custom profile picture, choose preset, or update details
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-rose-500/20 text-rose-600 border border-rose-400 rounded-xl">
              {error}
            </div>
          )}

          {/* AVATAR SELECTION & UPLOAD SECTION */}
          <div className={`p-4 rounded-2xl border space-y-4 ${
            isDark ? 'bg-[#141d13]/60 border-[#3c5638]' : 'bg-[#faf8f3] border-[#e2e8f0]'
          }`}>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <img
                  src={activeAvatar}
                  alt="Profile Avatar"
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-[#556b2f]/40 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-xs font-bold gap-1"
                >
                  <Camera className="w-4 h-4" />
                  <span>Change</span>
                </button>
              </div>

              <div className="flex-1 space-y-1.5">
                <h4 className="font-bold text-sm">{currentDisplayName}</h4>
                <p className={`text-xs ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                  Profile picture displayed across projects, task assignments & navbar
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className={`text-[11px] font-semibold flex items-center gap-1 hover:underline ${
                      isDark ? 'text-[#e9edc9]' : 'text-[#385233]'
                    }`}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Default Avatar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Avatar Input Mode Selector Tabs */}
            <div className={`flex p-1 rounded-xl border text-xs ${
              isDark ? 'bg-[#1f2c1d] border-[#3c5638]' : 'bg-white border-[#d4ddcf]'
            }`}>
              <button
                type="button"
                onClick={() => setAvatarTab('upload')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  avatarTab === 'upload'
                    ? isDark ? 'bg-[#556b2f] text-[#fefae0]' : 'bg-[#385233] text-[#fefae0]'
                    : isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab('presets')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  avatarTab === 'presets'
                    ? isDark ? 'bg-[#556b2f] text-[#fefae0]' : 'bg-[#385233] text-[#fefae0]'
                    : isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Presets</span>
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab('url')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  avatarTab === 'url'
                    ? isDark ? 'bg-[#556b2f] text-[#fefae0]' : 'bg-[#385233] text-[#fefae0]'
                    : isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Image Link</span>
              </button>
            </div>

            {/* TAB 1: FILE UPLOAD */}
            {avatarTab === 'upload' && (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full py-3 px-4 rounded-xl border-2 border-dashed font-semibold text-xs transition flex items-center justify-center gap-2 ${
                    isDark
                      ? 'border-[#3c5638] hover:border-[#556b2f] bg-[#1f2c1d] text-[#fefae0]'
                      : 'border-[#d4ddcf] hover:border-[#385233] bg-white text-[#1b2819]'
                  }`}
                >
                  <Upload className="w-4 h-4 text-[#556b2f]" />
                  <span>Choose Image File (PNG, JPG, WebP up to 5MB)</span>
                </button>
              </div>
            )}

            {/* TAB 2: PRESET GALLERY */}
            {avatarTab === 'presets' && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = avatarUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAvatarUrl(preset.url)}
                      className={`relative rounded-xl overflow-hidden border-2 transition ${
                        isSelected
                          ? 'border-[#556b2f] ring-2 ring-[#556b2f]/50 scale-105'
                          : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      title={preset.name}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-12 object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#385233]/40 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white font-bold" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB 3: IMAGE LINK URL */}
            {avatarTab === 'url' && (
              <div>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.png"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none ${
                    isDark
                      ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                      : 'bg-white text-[#1b2819] border-[#d4ddcf]'
                  }`}
                />
              </div>
            )}
          </div>

          {/* USER INFO FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                First Name
              </label>
              <input
                type="text"
                placeholder="First Name"
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
                placeholder="Last Name"
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

          <div>
            <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="user@teamsync.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none ${
                isDark
                  ? 'bg-[#141d13] text-[#fefae0] border-[#3c5638]'
                  : 'bg-white text-[#1b2819] border-[#d4ddcf]'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-[#e9edc9]' : 'text-[#1b2819]'}`}>
                System Role <span className="text-rose-500">*</span>
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
                placeholder="e.g. Engineering"
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
              {loading ? 'Saving Profile...' : 'Save Profile & Avatar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
