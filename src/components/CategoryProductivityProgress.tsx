import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Building2, 
  Users, 
  Landmark, 
  Lightbulb, 
  User, 
  Home, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  ChevronRight,
  Layers,
  Sparkles,
  Filter
} from 'lucide-react';
import { Task, MainCategory } from '../types';

interface CategoryProductivityProgressProps {
  tasks: Task[];
  onSelectCategory?: (category: MainCategory) => void;
}

interface CategoryProgressData {
  id: MainCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  pending: number;
  percentage: number;
  colorClass: {
    bg: string;
    text: string;
    border: string;
    progressFill: string;
    trackBg: string;
    badge: string;
  };
}

export const CategoryProductivityProgress: React.FC<CategoryProductivityProgressProps> = ({
  tasks = [],
  onSelectCategory
}) => {
  const [displayLayout, setDisplayLayout] = useState<'GRID' | 'LIST'>('LIST');

  // Category Configuration & Theme Tokens
  const categoryConfigs: {
    id: MainCategory;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: {
      bg: string;
      text: string;
      border: string;
      progressFill: string;
      trackBg: string;
      badge: string;
    };
  }[] = [
    {
      id: 'TOP_PRIORITY',
      label: 'Top Priority',
      icon: AlertTriangle,
      colorClass: {
        bg: 'bg-red-50 dark:bg-red-950/30',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-900/50',
        progressFill: 'bg-red-500',
        trackBg: 'bg-red-100 dark:bg-red-950/60',
        badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
      }
    },
    {
      id: 'DEPARTMENT_WORK',
      label: 'Department Work',
      icon: Building2,
      colorClass: {
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-900/50',
        progressFill: 'bg-blue-500',
        trackBg: 'bg-blue-100 dark:bg-blue-950/60',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
      }
    },
    {
      id: 'FOLLOW_UPS',
      label: 'Follow-ups & Outreach',
      icon: Users,
      colorClass: {
        bg: 'bg-purple-50 dark:bg-purple-950/30',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-900/50',
        progressFill: 'bg-purple-500',
        trackBg: 'bg-purple-100 dark:bg-purple-950/60',
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
      }
    },
    {
      id: 'INSTITUTIONAL_WORK',
      label: 'Institutional Work',
      icon: Landmark,
      colorClass: {
        bg: 'bg-indigo-50 dark:bg-indigo-950/30',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-900/50',
        progressFill: 'bg-indigo-500',
        trackBg: 'bg-indigo-100 dark:bg-indigo-950/60',
        badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
      }
    },
    {
      id: 'INNOVATION_HUB',
      label: 'Innovation Hub',
      icon: Lightbulb,
      colorClass: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-900/50',
        progressFill: 'bg-emerald-500',
        trackBg: 'bg-emerald-100 dark:bg-emerald-950/60',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
      }
    },
    {
      id: 'PERSONAL_WORK',
      label: 'Personal Work',
      icon: User,
      colorClass: {
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-900/50',
        progressFill: 'bg-amber-500',
        trackBg: 'bg-amber-100 dark:bg-amber-950/60',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
      }
    },
    {
      id: 'HOME_WORKS',
      label: 'Home Works',
      icon: Home,
      colorClass: {
        bg: 'bg-teal-50 dark:bg-teal-950/30',
        text: 'text-teal-600 dark:text-teal-400',
        border: 'border-teal-200 dark:border-teal-900/50',
        progressFill: 'bg-teal-500',
        trackBg: 'bg-teal-100 dark:bg-teal-950/60',
        badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
      }
    }
  ];

  // Calculate Productivity & Progress per Category
  const categoryData: CategoryProgressData[] = categoryConfigs.map((config) => {
    const catTasks = tasks.filter((t) => t && t.category === config.id);
    const total = catTasks.length;
    const completed = catTasks.filter((t) => t.status === 'COMPLETED').length;
    const inProgress = catTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const overdue = catTasks.filter((t) => t.status === 'OVERDUE').length;
    const pending = catTasks.filter((t) => t.status === 'PENDING' || t.status === 'NEW').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      ...config,
      total,
      completed,
      inProgress,
      overdue,
      pending,
      percentage
    };
  });

  // Aggregate Workspace Metrics
  const totalTasksCount = tasks.length;
  const totalCompletedCount = tasks.filter((t) => t && t.status === 'COMPLETED').length;
  const overallPercentage = totalTasksCount > 0 ? Math.round((totalCompletedCount / totalTasksCount) * 100) : 0;

  const getProductivityHealth = (pct: number, total: number) => {
    if (total === 0) return { text: 'No Tasks', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-500' };
    if (pct === 100) return { text: '100% Cleared', badge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold' };
    if (pct >= 75) return { text: 'High Momentum', badge: 'bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-bold' };
    if (pct >= 40) return { text: 'In Progress', badge: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold' };
    if (pct > 0) return { text: 'Early Stage', badge: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-semibold' };
    return { text: 'Pending Start', badge: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-semibold' };
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-5">
      {/* Header with Title and Layout Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/60">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Category Productivity & Completion Progress
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time percentage breakdown of completed versus total deliverables across all 7 operational streams.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setDisplayLayout('LIST')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              displayLayout === 'LIST'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            List View
          </button>
          <button
            type="button"
            onClick={() => setDisplayLayout('GRID')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              displayLayout === 'GRID'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Grid Cards
          </button>
        </div>
      </div>

      {/* Overall Productivity Master Progress Bar */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Overall Workspace Productivity
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-extrabold">
              {totalCompletedCount} / {totalTasksCount} Completed
            </span>
          </div>
          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
            {overallPercentage}%
          </span>
        </div>

        {/* Master Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      {/* LIST LAYOUT OF PROGRESS BARS */}
      {displayLayout === 'LIST' && (
        <div className="space-y-3.5">
          {categoryData.map((cat) => {
            const Icon = cat.icon;
            const health = getProductivityHealth(cat.percentage, cat.total);

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                className={`p-3.5 rounded-xl border ${cat.colorClass.border} bg-white dark:bg-slate-900/40 hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-all ${
                  onSelectCategory ? 'cursor-pointer' : ''
                }`}
              >
                {/* Header row: Icon, Category Name, Counts & Percentage */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-lg ${cat.colorClass.bg} ${cat.colorClass.text} shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                          {cat.label}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md ${health.badge}`}>
                          {health.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {cat.completed} of {cat.total} tasks done
                        </span>
                        {cat.overdue > 0 && (
                          <span className="text-rose-600 dark:text-rose-400 font-bold">
                            • {cat.overdue} overdue
                          </span>
                        )}
                        {cat.inProgress > 0 && (
                          <span>
                            • {cat.inProgress} active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Percentage Display */}
                  <div className="text-right shrink-0">
                    <span className={`text-base sm:text-lg font-black ${cat.colorClass.text}`}>
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                {/* The Visual Progress Bar */}
                <div className="relative w-full">
                  <div className={`w-full ${cat.colorClass.trackBg} h-2.5 rounded-full overflow-hidden`}>
                    <div
                      className={`${cat.colorClass.progressFill} h-full rounded-full transition-all duration-600 ease-out`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GRID LAYOUT OF PROGRESS CARDS */}
      {displayLayout === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {categoryData.map((cat) => {
            const Icon = cat.icon;
            const health = getProductivityHealth(cat.percentage, cat.total);

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                className={`p-4 rounded-xl border ${cat.colorClass.border} bg-white dark:bg-slate-900/40 flex flex-col justify-between space-y-3.5 hover:shadow-xs transition-all ${
                  onSelectCategory ? 'cursor-pointer' : ''
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${cat.colorClass.bg} ${cat.colorClass.text}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md ${health.badge}`}>
                      {health.text}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {cat.label}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {cat.completed} / {cat.total} tasks completed
                    </p>
                  </div>
                </div>

                {/* Progress Bar & Value */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Progress
                    </span>
                    <span className={`font-black ${cat.colorClass.text}`}>
                      {cat.percentage}%
                    </span>
                  </div>
                  <div className={`w-full ${cat.colorClass.trackBg} h-2 rounded-full overflow-hidden`}>
                    <div
                      className={`${cat.colorClass.progressFill} h-full rounded-full transition-all duration-600 ease-out`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
