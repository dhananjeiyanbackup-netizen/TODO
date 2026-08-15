import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  PauseCircle, 
  AlertOctagon, 
  Users, 
  Plus, 
  TrendingUp, 
  Building2, 
  Lightbulb, 
  User, 
  Home, 
  Landmark,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Task, ViewMode, MainCategory, TaskStatus } from '../types';
import { calculateDashboardStats, getTodayFormatted, sortTasksByPriorityAndDate, getPriorityBadgeStyle } from '../utils/taskUtils';
import { TaskCard } from './TaskCard';

interface DashboardViewProps {
  tasks?: Task[];
  onSelectTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onQuickAdd: (categoryPreset?: MainCategory) => void;
  onNavigateToView: (view: ViewMode) => void;
  onNavigateToCategory: (category: MainCategory) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks = [],
  onSelectTask,
  onUpdateStatus,
  onQuickAdd,
  onNavigateToView,
  onNavigateToCategory
}) => {
  const safeTasks = tasks || [];
  const stats = calculateDashboardStats(safeTasks);
  const today = getTodayFormatted();

  // Section 19 layout:
  // 1. Welcome & Summary Cards Pill Strip
  // 2. Today's Focus (Top 5 critical tasks)
  // 3. Category Overview (Dept, Follow-up, Institutional, Innovation Hub, Personal, Home)
  // 4. Task Progress
  // 5. Upcoming Deadlines (Next 10 deadlines)

  // Filter today's focus (due today or critical)
  const sortedTasks = sortTasksByPriorityAndDate(safeTasks.filter(t => t && !t.isArchived));
  const todaysFocusTasks = sortedTasks.filter(
    t => t && t.status !== 'COMPLETED' && (t.dueDate === today || t.priority === 'CRITICAL' || t.status === 'OVERDUE')
  ).slice(0, 5);

  // Upcoming deadlines (next 10 tasks due after today)
  const upcomingDeadlines = sortedTasks.filter(
    t => t && t.status !== 'COMPLETED' && t.dueDate >= today
  ).slice(0, 10);

  const categoryCards = [
    { 
      id: 'DEPARTMENT_WORK' as MainCategory, 
      label: 'Department Work', 
      icon: Building2, 
      count: safeTasks.filter(t => t && t.category === 'DEPARTMENT_WORK' && t.status !== 'COMPLETED').length,
      color: 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100'
    },
    { 
      id: 'FOLLOW_UPS' as MainCategory, 
      label: 'Follow-ups', 
      icon: Users, 
      count: safeTasks.filter(t => t && (t.category === 'FOLLOW_UPS' || t.followUpRequired) && t.status !== 'COMPLETED').length,
      color: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-100'
    },
    { 
      id: 'INSTITUTIONAL_WORK' as MainCategory, 
      label: 'Institutional Work', 
      icon: Landmark, 
      count: safeTasks.filter(t => t && t.category === 'INSTITUTIONAL_WORK' && t.status !== 'COMPLETED').length,
      color: 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-100'
    },
    { 
      id: 'INNOVATION_HUB' as MainCategory, 
      label: 'Innovation Hub', 
      icon: Lightbulb, 
      count: safeTasks.filter(t => t && t.category === 'INNOVATION_HUB' && t.status !== 'COMPLETED').length,
      color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100'
    },
    { 
      id: 'PERSONAL_WORK' as MainCategory, 
      label: 'Personal Work', 
      icon: User, 
      count: safeTasks.filter(t => t && t.category === 'PERSONAL_WORK' && t.status !== 'COMPLETED').length,
      color: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-100'
    },
    { 
      id: 'HOME_WORKS' as MainCategory, 
      label: 'Home Works', 
      icon: Home, 
      count: safeTasks.filter(t => t && t.category === 'HOME_WORKS' && t.status !== 'COMPLETED').length,
      color: 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 text-teal-900 dark:text-teal-100'
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. Header & Quick Stat Summary Cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Main Task Executive Dashboard
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Instant overview of critical activities, department tasks, follow-ups, and upcoming deadlines.
            </p>
          </div>

          <button
            onClick={() => onQuickAdd()}
            className="self-start sm:self-auto py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Add Task</span>
          </button>
        </div>

        {/* 8 Summary Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
          {/* Top Priority */}
          <div 
            onClick={() => onNavigateToView('TOP_PRIORITY')}
            className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-red-600 dark:text-red-400 font-bold mb-1">
              <span>Top Priority</span>
              <AlertTriangle className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-black text-red-700 dark:text-red-300">{stats.critical}</div>
            <span className="text-[10px] text-red-500/90 font-medium">Critical Attention</span>
          </div>

          {/* Due Today */}
          <div 
            onClick={() => onNavigateToView('MY_TASKS')}
            className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-bold mb-1">
              <span>Due Today</span>
              <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-black text-amber-700 dark:text-amber-300">{stats.dueToday}</div>
            <span className="text-[10px] text-amber-600/90 font-medium">Scheduled Today</span>
          </div>

          {/* Upcoming */}
          <div 
            onClick={() => onNavigateToView('MY_TASKS')}
            className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
              <span>Upcoming</span>
              <Calendar className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-black text-blue-700 dark:text-blue-300">
              {safeTasks.filter(t => t && t.dueDate > today && t.status !== 'COMPLETED').length}
            </div>
            <span className="text-[10px] text-blue-500/90 font-medium">Future Deadlines</span>
          </div>

          {/* Pending */}
          <div 
            onClick={() => onNavigateToView('MY_TASKS')}
            className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-sky-600 dark:text-sky-400 font-bold mb-1">
              <span>Pending</span>
              <Clock className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-black text-sky-700 dark:text-sky-300">{stats.pending}</div>
            <span className="text-[10px] text-sky-500/90 font-medium">In Progress / New</span>
          </div>

          {/* Completed */}
          <div 
            onClick={() => onNavigateToView('MY_TASKS')}
            className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-1">
              <span>Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-300">{stats.completed}</div>
            <span className="text-[10px] text-emerald-500/90 font-medium">Finished Tasks</span>
          </div>

          {/* On Hold */}
          <div 
            onClick={() => onNavigateToView('MY_TASKS')}
            className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-bold mb-1">
              <span>On Hold</span>
              <PauseCircle className="w-4 h-4 text-slate-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-black text-slate-700 dark:text-slate-200">{stats.onHold}</div>
            <span className="text-[10px] text-slate-500 font-medium">Paused Work</span>
          </div>

          {/* Overdue */}
          <div 
            onClick={() => onNavigateToView('MY_TASKS')}
            className="p-3 bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-red-700 dark:text-red-300 font-bold mb-1">
              <span>Overdue</span>
              <AlertOctagon className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform animate-pulse" />
            </div>
            <div className="text-xl font-black text-red-800 dark:text-red-200">{stats.overdue}</div>
            <span className="text-[10px] text-red-600 font-bold">Passed Deadline</span>
          </div>

          {/* Follow-ups */}
          <div 
            onClick={() => onNavigateToView('FOLLOW_UPS')}
            className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-bold mb-1">
              <span>Follow-ups</span>
              <Users className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-black text-purple-700 dark:text-purple-300">{stats.followUps}</div>
            <span className="text-[10px] text-purple-500/90 font-medium">Pending Contact</span>
          </div>
        </div>
      </div>

      {/* 2. Today's Focus Section */}
      <section className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="text-red-500">🔥</span> Today's Focus
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The 5 most critical & urgent items requiring immediate execution today.
            </p>
          </div>
          <button 
            onClick={() => onNavigateToView('TOP_PRIORITY')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            View All Critical <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todaysFocusTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaysFocusTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onSelectTask={onSelectTask}
                onUpdateStatus={onUpdateStatus}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl">
            🎉 All critical tasks for today are completed or up to date!
          </div>
        )}
      </section>

      {/* 3. Category Overview Section */}
      <section>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
          📁 Category Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => onNavigateToCategory(cat.id)}
                className={`p-4 border rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${cat.color}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 opacity-80" />
                  <span className="text-xs font-bold px-2 py-0.5 bg-white/60 dark:bg-black/30 rounded-full">
                    {cat.count}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm leading-tight">{cat.label}</h3>
                  <p className="text-[10px] opacity-75 mt-0.5 font-medium">Click to manage</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Task Progress & Productivity Banner */}
      <section className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Overall Productivity Score</span>
          </div>
          <h3 className="text-2xl font-black tracking-tight">
            System Productivity: {stats.completionPercentage}% Completed
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            You have completed <strong className="text-emerald-300">{stats.completed}</strong> out of <strong className="text-white">{stats.total}</strong> active tasks. 
            Keep pushing forward on pending departmental and institutional deadlines.
          </p>
        </div>

        <div className="w-full md:w-64 bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl text-center space-y-2">
          <div className="text-3xl font-black text-emerald-400">{stats.completionPercentage}%</div>
          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {stats.pending} Pending • {stats.overdue} Overdue
          </span>
        </div>
      </section>

      {/* 5. Upcoming Deadlines Section */}
      <section className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Upcoming Important Deadlines (Next 10)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Key institutional submissions, accreditation reviews, and follow-ups approaching.
            </p>
          </div>
          <button 
            onClick={() => onNavigateToView('CALENDAR')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Open Calendar <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Task Title</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {upcomingDeadlines.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-slate-400">{task.id}</td>
                  <td 
                    onClick={() => onSelectTask(task)}
                    className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 cursor-pointer"
                  >
                    {task.title}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[11px]">
                      {task.subcategory}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-extrabold ${getPriorityBadgeStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                    {task.dueDate}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-md">
                      {task.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <button
                      onClick={() => onSelectTask(task)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};
