'use client';

import React from 'react';
import { DashboardStats } from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  History,
} from 'lucide-react';

interface KpiCardsProps {
  stats: DashboardStats | null;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ stats }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!stats) return null;

  const kpis = [
    {
      title: 'Total Projects',
      value: stats.total_projects,
      subtitle: `${stats.completed_tasks} tasks completed`,
      icon: FolderKanban,
      borderColor: isDark ? 'border-[#3c5638]' : 'border-[#d4ddcf]',
      iconBg: isDark ? 'bg-[#3c5638] text-[#e9edc9]' : 'bg-[#e9edc9] text-[#1b2819]',
    },
    {
      title: 'Active Tasks',
      value: stats.total_tasks,
      subtitle: `${stats.in_progress_tasks} in progress, ${stats.todo_tasks} to do`,
      icon: Clock,
      borderColor: isDark ? 'border-[#3c5638]' : 'border-[#d4ddcf]',
      iconBg: isDark ? 'bg-[#556b2f] text-[#fefae0]' : 'bg-[#d8f3dc] text-[#1b2819]',
    },
    {
      title: 'Project Completion Rate',
      value: `${stats.completion_rate}%`,
      subtitle: `${stats.completed_tasks} of ${stats.total_tasks} tasks done`,
      icon: CheckCircle2,
      borderColor: isDark ? 'border-[#3c5638]' : 'border-[#d4ddcf]',
      iconBg: isDark ? 'bg-[#386641] text-[#fefae0]' : 'bg-[#c7f9cc] text-[#1b2819]',
    },
    {
      title: 'Deadline Revision Audit Logs',
      value: stats.total_deadline_changes,
      subtitle: 'Recorded deadline adjustments',
      icon: History,
      borderColor: isDark ? 'border-[#3c5638]' : 'border-[#d4ddcf]',
      iconBg: isDark ? 'bg-[#283925] text-[#e9edc9]' : 'bg-[#faedcd] text-[#1b2819]',
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
            className={`relative overflow-hidden rounded-2xl border ${kpi.borderColor} p-5 shadow-lg transition-all hover:scale-[1.01] ${
              isDark ? 'bg-[#1f2c1d] text-[#fefae0]' : 'bg-white text-[#1b2819]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#e9edc9]' : 'text-[#385233]'}`}>
                  {kpi.title}
                </p>
                <h3 className={`text-3xl font-extrabold mt-1 tracking-tight ${isDark ? 'text-[#fefae0]' : 'text-[#141d13]'}`}>
                  {kpi.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${kpi.iconBg} ring-1 ring-black/10`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className={`mt-4 flex items-center justify-between pt-3 border-t ${isDark ? 'border-[#3c5638]' : 'border-[#e2e8f0]'}`}>
              <span className={`text-[11px] font-medium ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                {kpi.subtitle}
              </span>
              {kpi.badge && (
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                  isDark ? 'bg-[#3c5638] text-[#fefae0] border-[#556b2f]' : 'bg-[#faedcd] text-[#1b2819] border-[#d4ddcf]'
                }`}>
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
