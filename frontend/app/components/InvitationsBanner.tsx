'use client';

import React from 'react';
import { ProjectInvitation } from '../types';
import { Mail, CheckCircle, XCircle, Building2, User } from 'lucide-react';

interface InvitationsBannerProps {
  invitations: ProjectInvitation[];
  onRespond: (invitationId: number, action: 'accept' | 'reject') => Promise<void>;
}

export const InvitationsBanner: React.FC<InvitationsBannerProps> = ({ invitations, onRespond }) => {
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
            className="p-4 bg-gradient-to-r from-indigo-900/40 via-slate-900 to-indigo-950/40 border border-indigo-500/40 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm text-white">Project Invitation Request</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    From {sender ? (sender.first_name ? `${sender.first_name} ${sender.last_name}` : sender.username) : 'Admin'}
                  </span>
                </div>
                <p className="text-slate-300">
                  You have been invited to join project <strong className="text-indigo-200">{project?.name || `Project #${inv.project}`}</strong>
                </p>
                {inv.message && (
                  <p className="text-slate-400 italic text-[11px]">
                    &quot;{inv.message}&quot;
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => onRespond(inv.id, 'reject')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/40 rounded-xl font-bold transition flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => onRespond(inv.id, 'accept')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5"
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
