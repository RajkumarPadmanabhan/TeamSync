'use client';

import React, { useState, useEffect } from 'react';
import { Task, DeadlineHistoryItem } from '../types';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import { History, X, Clock, Calendar, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

interface DeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export const DeadlineModal: React.FC<DeadlineModalProps> = ({ isOpen, onClose, task }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className={`border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden transition-colors ${
        isDark ? 'bg-[#1f2c1d] border-[#3c5638] text-[#fefae0]' : 'bg-white border-[#d4ddcf] text-[#1b2819]'
      }`}>
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-[#3c5638] bg-[#141d13]/50' : 'border-[#e2e8f0] bg-[#faf8f3]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isDark ? 'bg-[#3c5638] text-[#fefae0] border-[#556b2f]' : 'bg-[#e9edc9] text-[#1b2819] border-[#d4ddcf]'
            }`}>
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold">Deadline Revision Audit Trail</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                  isDark ? 'bg-[#556b2f] text-[#fefae0] border-[#e9edc9]' : 'bg-[#385233] text-[#fefae0] border-[#385233]'
                }`}>
                  Enterprise Audit Log
                </span>
              </div>
              <p className={`text-xs font-medium ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                Task: <span className="font-semibold">{task.title}</span>
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

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-xs opacity-60 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 animate-spin text-[#556b2f]" />
              <span>Fetching deadline audit log history...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/20 border border-rose-400 text-rose-600 text-xs rounded-xl">
              {error}
            </div>
          ) : history.length === 0 ? (
            <div className={`py-12 text-center rounded-2xl border p-6 ${
              isDark ? 'bg-[#141d13]/50 border-[#3c5638]' : 'bg-[#faf8f3] border-[#e2e8f0]'
            }`}>
              <Clock className="w-8 h-8 opacity-40 mx-auto mb-2" />
              <p className="text-sm font-semibold">No Deadline Revisions Recorded</p>
              <p className="text-xs opacity-75 mt-1">
                This task deadline has not been updated since creation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`flex items-center justify-between text-xs pb-2 border-b ${
                isDark ? 'border-[#3c5638] text-[#e9edc9]' : 'border-[#e2e8f0] text-[#556b2f]'
              }`}>
                <span>Total Revisions: <strong className="font-bold">{history.length}</strong></span>
                <span>Current Deadline: <strong className="font-bold">{formatDate(task.deadline)}</strong></span>
              </div>

              {/* Timeline Items */}
              <div className={`relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 ${
                isDark ? 'before:bg-[#3c5638]' : 'before:bg-[#d4ddcf]'
              }`}>
                {history.map((item) => {
                  const author = item.changed_by_detail;
                  return (
                    <div key={item.id} className="relative group">
                      {/* Node Bullet */}
                      <div className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border ${
                        isDark ? 'bg-[#556b2f] border-[#fefae0]' : 'bg-[#385233] border-[#faf8f3]'
                      }`} />

                      <div className={`border rounded-2xl p-4 space-y-3 shadow-sm ${
                        isDark ? 'bg-[#141d13]/70 border-[#3c5638]' : 'bg-[#faf8f3] border-[#e2e8f0]'
                      }`}>
                        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                author?.avatar_url ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  author?.first_name || author?.username || 'Admin'
                                )}&background=556b2f&color=fefae0`
                              }
                              alt="author"
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-[#556b2f]/40"
                            />
                            <span className="font-semibold">
                              {author?.first_name ? `${author.first_name} ${author.last_name}` : author?.username || 'Admin'}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold border ${
                              isDark ? 'bg-[#3c5638] text-[#fefae0] border-[#556b2f]' : 'bg-[#e9edc9] text-[#1b2819] border-[#385233]'
                            }`}>
                              {author?.role || 'ADMIN'}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono opacity-75 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(item.changed_at)}
                          </span>
                        </div>

                        {/* Deadline Comparison Badges */}
                        <div className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${
                          isDark ? 'bg-[#192418] border-[#3c5638]' : 'bg-white border-[#d4ddcf]'
                        }`}>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] uppercase font-bold opacity-60">Previous Deadline</p>
                            <p className="font-semibold text-rose-500 truncate">
                              {formatDate(item.previous_deadline)}
                            </p>
                          </div>

                          <ArrowRight className="w-4 h-4 opacity-50 shrink-0" />

                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] uppercase font-bold opacity-60">Updated Deadline</p>
                            <p className="font-semibold text-emerald-600 truncate">
                              {formatDate(item.new_deadline)}
                            </p>
                          </div>
                        </div>

                        {/* Reason */}
                        {item.reason && (
                          <div className={`text-xs p-2.5 rounded-xl border ${
                            isDark ? 'bg-[#141d13] border-[#3c5638]' : 'bg-[#faf8f3] border-[#e2e8f0]'
                          }`}>
                            <p className="text-[10px] font-bold uppercase opacity-60 mb-0.5">Audit Reason / Notes</p>
                            <p className="italic">&quot;{item.reason}&quot;</p>
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
        <div className={`px-6 py-3 border-t flex justify-end ${
          isDark ? 'border-[#3c5638] bg-[#141d13]/50' : 'border-[#e2e8f0] bg-[#faf8f3]'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition text-white ${
              isDark ? 'bg-[#556b2f] hover:bg-[#606c38]' : 'bg-[#385233] hover:bg-[#283b24]'
            }`}
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};
