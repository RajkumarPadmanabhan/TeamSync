'use client';

import React, { useState, useEffect } from 'react';
import { Task, DeadlineHistoryItem } from '../types';
import { api } from '../lib/api';
import { History, X, Clock, Calendar, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

interface DeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export const DeadlineModal: React.FC<DeadlineModalProps> = ({ isOpen, onClose, task }) => {
  const [history, setHistory] = useState<DeadlineHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && task) {
      fetchDeadlineHistory(task.id);
    }
  }, [isOpen, task]);

  const fetchDeadlineHistory = async (taskId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDeadlineHistory(taskId);
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load deadline audit trail.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'None (Unset)';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Deadline Revision Audit Trail</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  Additional Challenge Requirement
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Task: <span className="text-slate-200 font-semibold">{task.title}</span>
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

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 animate-spin text-amber-400" />
              <span>Fetching deadline audit log history...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl">
              {error}
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center bg-slate-800/40 rounded-2xl border border-slate-800 p-6">
              <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No Deadline Revisions Recorded</p>
              <p className="text-xs text-slate-500 mt-1">
                This task deadline has not been updated since creation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span>Total Revisions: <strong className="text-amber-400">{history.length}</strong></span>
                <span>Current Deadline: <strong className="text-emerald-400">{formatDate(task.deadline)}</strong></span>
              </div>

              {/* Timeline Items */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {history.map((item, idx) => {
                  const author = item.changed_by_detail;
                  return (
                    <div key={item.id} className="relative group">
                      {/* Node Bullet */}
                      <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-slate-900 border border-amber-300" />

                      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3 shadow-md">
                        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                author?.avatar_url ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  author?.first_name || author?.username || 'Admin'
                                )}&background=f59e0b&color=fff`
                              }
                              alt="author"
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-500/40"
                            />
                            <span className="font-semibold text-slate-200">
                              {author?.first_name ? `${author.first_name} ${author.last_name}` : author?.username || 'Admin'}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-bold">
                              {author?.role || 'ADMIN'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {formatDate(item.changed_at)}
                          </span>
                        </div>

                        {/* Deadline Comparison Badges */}
                        <div className="flex items-center gap-2 p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Previous Deadline</p>
                            <p className="font-semibold text-rose-400 truncate">
                              {formatDate(item.previous_deadline)}
                            </p>
                          </div>

                          <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Updated Deadline</p>
                            <p className="font-semibold text-emerald-400 truncate">
                              {formatDate(item.new_deadline)}
                            </p>
                          </div>
                        </div>

                        {/* Reason */}
                        {item.reason && (
                          <div className="text-xs text-slate-300 bg-slate-800/90 p-2.5 rounded-lg border border-slate-700/50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Audit Reason / Notes</p>
                            <p className="italic text-slate-300">"{item.reason}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};
