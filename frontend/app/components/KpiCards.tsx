'use client';

import React from 'react';
import { DashboardStats } from '../types';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  History,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface KpiCardsProps {
  stats: DashboardStats | null;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ stats }) => {
  if (!stats) return null;

  const kpis = [
    {
      title: 'Total Projects',
      value: stats.total_projects,
      subtitle: `${stats.completed_tasks} tasks completed`,
      icon: FolderKanban,
      gradient: 'from-blue-600/20 via-indigo-600/10 to-transparent',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-500/20 text-blue-400',
    },
    {
      title: 'Active Tasks',
      value: stats.total_tasks,
      subtitle: `${stats.in_progress_tasks} in progress, ${stats.todo_tasks} to do`,
      icon: Clock,
      gradient: 'from-indigo-600/20 via-purple-600/10 to-transparent',
      borderColor: 'border-indigo-500/30',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
    },
    {
      title: 'Project Completion Rate',
      value: `${stats.completion_rate}%`,
      subtitle: `${stats.completed_tasks} of ${stats.total_tasks} tasks done`,
      icon: CheckCircle2,
      gradient: 'from-emerald-600/20 via-teal-600/10 to-transparent',
      borderColor: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      title: 'Deadline Revision Audit Logs',
      value: stats.total_deadline_changes,
      subtitle: 'Recorded deadline adjustments',
      icon: History,
      gradient: 'from-amber-600/20 via-orange-600/10 to-transparent',
      borderColor: 'border-amber-500/30',
      iconBg: 'bg-amber-500/20 text-amber-400',
      badge: 'Challenge Metric',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl bg-slate-900/90 border ${kpi.borderColor} p-5 bg-gradient-to-br ${kpi.gradient} shadow-lg transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {kpi.title}
                </p>
                <h3 className="text-3xl font-extrabold text-white mt-1 tracking-tight">
                  {kpi.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${kpi.iconBg} ring-1 ring-white/10`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium">
                {kpi.subtitle}
              </span>
              {kpi.badge && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  {kpi.badge}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
