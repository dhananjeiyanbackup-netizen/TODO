import React, { useState } from 'react';
import { 
  CheckSquare, 
  Filter, 
  Plus, 
  Clock, 
  Calendar, 
  AlertOctagon, 
  Users, 
  CheckCircle2, 
  PauseCircle,
  Search
} from 'lucide-react';
import { Task, TaskFilterOptions, MainCategory, Priority, TaskStatus } from '../types';
import { filterTasks, sortTasksByPriorityAndDate } from '../utils/taskUtils';
import { TaskCard } from './TaskCard';

interface MyTasksViewProps {
  tasks?: Task[];
  onSelectTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onQuickAdd: () => void;
  initialFilter?: string;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  tasks = [],
  onSelectTask,
  onUpdateStatus,
  onQuickAdd,
  initialFilter
}) => {
  const safeTasks = tasks || [];
  const [activeTab, setActiveTab] = useState<string>(initialFilter || 'ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterOptions: TaskFilterOptions = {
    searchQuery,
    category: categoryFilter as any,
    priority: priorityFilter as any,
    status: statusFilter as any,
    dueFilter: ['TODAY', 'TOMORROW', 'THIS_WEEK', 'UPCOMING', 'OVERDUE'].includes(activeTab) ? activeTab as any : 'ALL',
    followUpOnly: activeTab === 'FOLLOW_UP'
  };

  let processedTasks = filterTasks(safeTasks, filterOptions);

  if (activeTab === 'COMPLETED') {
    processedTasks = processedTasks.filter(t => t && t.status === 'COMPLETED');
  } else if (activeTab === 'ON_HOLD') {
    processedTasks = processedTasks.filter(t => t && t.status === 'ON_HOLD');
  } else if (activeTab === 'CRITICAL') {
    processedTasks = processedTasks.filter(t => t && t.priority === 'CRITICAL');
  }

  const sortedTasks = sortTasksByPriorityAndDate(processedTasks);

  const smartTabs = [
    { id: 'ALL', label: 'All Tasks', count: safeTasks.filter(t => t && !t.isArchived).length },
    { id: 'TODAY', label: '📅 Due Today' },
    { id: 'TOMORROW', label: '⏰ Due Tomorrow' },
    { id: 'THIS_WEEK', label: '📆 This Week' },
    { id: 'UPCOMING', label: '🚀 Upcoming' },
    { id: 'OVERDUE', label: '⚠️ Overdue' },
    { id: 'FOLLOW_UP', label: '📌 Follow-up' },
    { id: 'COMPLETED', label: '🟢 Completed' },
    { id: 'ON_HOLD', label: '⏸️ On Hold' },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Task Management & Smart Views
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Filter, sort, and organize all activities by smart dates, priority, or categories.
          </p>
        </div>

        <button
          onClick={onQuickAdd}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Smart View Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-2 text-xs font-semibold">
        {smartTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters & Search Row */}
      <div className="p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="TOP_PRIORITY">🔥 Top Priority</option>
              <option value="DEPARTMENT_WORK">🏫 Department Work</option>
              <option value="FOLLOW_UPS">📞 Follow-ups</option>
              <option value="INSTITUTIONAL_WORK">🏢 Institutional Work</option>
              <option value="INNOVATION_HUB">💻 Innovation Hub</option>
              <option value="PERSONAL_WORK">👤 Personal Work</option>
              <option value="HOME_WORKS">🏠 Home Works</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">🔴 Critical</option>
              <option value="HIGH">🟠 High</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="LOW">🟢 Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">🆕 New</option>
              <option value="PENDING">🔵 Pending</option>
              <option value="IN_PROGRESS">🟠 In Progress</option>
              <option value="ON_HOLD">⏸️ On Hold</option>
              <option value="OVERDUE">🔴 Overdue</option>
              <option value="COMPLETED">🟢 Completed</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
          Showing {sortedTasks.length} task{sortedTasks.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onSelectTask={onSelectTask}
              onUpdateStatus={onUpdateStatus}
            />
          ))
        ) : (
          <div className="col-span-full p-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border">
            No tasks match your selected tab or filter options.
          </div>
        )}
      </div>

    </div>
  );
};
