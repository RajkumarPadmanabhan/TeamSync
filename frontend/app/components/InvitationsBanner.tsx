'use client';

import React from 'react';
import { ProjectInvitation } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Mail, CheckCircle, XCircle, Building2, User } from 'lucide-react';

interface InvitationsBannerProps {
  invitations: ProjectInvitation[];
  onRespond: (invitationId: number, action: 'accept' | 'reject') => Promise<void>;
}

export const InvitationsBanner: React.FC<InvitationsBannerProps> = ({ invitations, onRespond }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const pendingInvitations = invitations.filter((inv) => inv.status === 'PENDING');

  if (pendingInvitations.length === 0) return null;

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 mb-6">
      {pendingInvitations.map((inv) => {
        const project = inv.project_detail;
        const sender = inv.sender_detail;

        return (
          <div
            key={inv.id}
            className={`p-4 border rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs transition-colors ${
              isDark
                ? 'bg-[#1f2c1d] border-[#3c5638] text-[#fefae0]'
                : 'bg-white border-[#d4ddcf] text-[#1b2819]'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${
                isDark ? 'bg-[#3c5638] text-[#fefae0] border-[#556b2f]' : 'bg-[#e9edc9] text-[#1b2819] border-[#d4ddcf]'
              }`}>
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm">Project Invitation Request</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    isDark ? 'bg-[#556b2f] text-[#fefae0] border-[#e9edc9]' : 'bg-[#385233] text-[#fefae0] border-[#385233]'
                  }`}>
                    From {sender ? (sender.first_name ? `${sender.first_name} ${sender.last_name}` : sender.username) : 'Admin'}
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                  You have been invited to join project <strong className="font-bold">{project?.name || `Project #${inv.project}`}</strong>
                </p>
                {inv.message && (
                  <p className="italic text-[11px] opacity-80">
                    &quot;{inv.message}&quot;
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => onRespond(inv.id, 'reject')}
                className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-600 border border-rose-400 rounded-xl font-bold transition flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => onRespond(inv.id, 'accept')}
                className={`px-4 py-2 text-white rounded-xl font-bold shadow-md transition flex items-center gap-1.5 ${
                  isDark ? 'bg-[#556b2f] hover:bg-[#606c38]' : 'bg-[#385233] hover:bg-[#283b24]'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Accept & Join Project</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
