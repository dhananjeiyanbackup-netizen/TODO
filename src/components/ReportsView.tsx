import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Award,
  Building2, 
  Users, 
  Lightbulb,
  User,
  Home,
  Landmark,
  Calendar,
  Download,
  Printer,
  Copy,
  Search,
  Check,
  RotateCcw,
  ExternalLink,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ChevronRight,
  ListFilter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Task, TaskStatus, Priority, MainCategory } from '../types';
import { calculateDashboardStats, getTodayFormatted } from '../utils/taskUtils';
import { CategoryProductivityProgress } from './CategoryProductivityProgress';

interface ReportsViewProps {
  tasks?: Task[];
  onSelectTask?: (task: Task) => void;
  onUpdateStatus?: (taskId: string, newStatus: TaskStatus) => void;
  onQuickAdd?: () => void;
}

type ReportSubTab = 'DONE_TASKS' | 'ANALYTICS_CHARTS' | 'CATEGORY_KPIS';
type DateRangeFilter = 'ALL' | 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_30_DAYS';
type ViewModeType = 'TABLE' | 'CARDS';

export const ReportsView: React.FC<ReportsViewProps> = ({ 
  tasks = [], 
  onSelectTask,
  onUpdateStatus,
  onQuickAdd 
}) => {
  const safeTasks = tasks || [];
  const stats = calculateDashboardStats(safeTasks);

  // Sub Tab Navigation
  const [activeTab, setActiveTab] = useState<ReportSubTab>('DONE_TASKS');

  // Filter States for Done Report
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<MainCategory | 'ALL'>('ALL');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<Priority | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'DATE_ASC' | 'PRIORITY_DESC' | 'TITLE_ASC' | 'HOURS_DESC'>('DATE_DESC');
  const [viewMode, setViewMode] = useState<ViewModeType>('TABLE');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showCategoryProgressInDone, setShowCategoryProgressInDone] = useState<boolean>(true);

  const today = getTodayFormatted();

  // 1. Filter ALL Completed / Done Tasks
  const completedTasks = useMemo(() => {
    return safeTasks.filter(t => t && t.status === 'COMPLETED');
  }, [safeTasks]);

  // 2. Filter Done Tasks based on dynamic Date Range, Category, Priority & Search
  const filteredDoneTasks = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    return completedTasks.filter(task => {
      if (!task) return false;

      // Completion Date logic (fallback to dueDate or createdDate)
      const taskDoneDateStr = task.completionDate || task.dueDate || task.createdDate || today;
      const taskDoneTime = new Date(taskDoneDateStr).getTime();

      // Date Range Filter
      if (dateRangeFilter === 'TODAY') {
        if (taskDoneDateStr !== today) return false;
      } else if (dateRangeFilter === 'YESTERDAY') {
        const yesterdayDate = new Date(now.getTime() - oneDayMs);
        const yStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;
        if (taskDoneDateStr !== yStr) return false;
      } else if (dateRangeFilter === 'THIS_WEEK') {
        const weekAgo = todayStart - (7 * oneDayMs);
        if (taskDoneTime < weekAgo) return false;
      } else if (dateRangeFilter === 'THIS_MONTH') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        if (taskDoneTime < monthStart) return false;
      } else if (dateRangeFilter === 'LAST_30_DAYS') {
        const thirtyDaysAgo = todayStart - (30 * oneDayMs);
        if (taskDoneTime < thirtyDaysAgo) return false;
      }

      // Category Filter
      if (selectedCategoryFilter !== 'ALL' && task.category !== selectedCategoryFilter) {
        return false;
      }

      // Priority Filter
      if (selectedPriorityFilter !== 'ALL' && task.priority !== selectedPriorityFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title?.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        const matchSub = task.subcategory?.toLowerCase().includes(q);
        const matchAssignee = task.assignedTo?.toLowerCase().includes(q);
        const matchContact = task.contact?.personName?.toLowerCase().includes(q);
        const matchInnovation = task.innovation?.eventName?.toLowerCase().includes(q);
        const matchPlacement = task.placement?.companyName?.toLowerCase().includes(q);

        if (!matchTitle && !matchDesc && !matchSub && !matchAssignee && !matchContact && !matchInnovation && !matchPlacement) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'DATE_DESC') {
        const dateA = a.completionDate || a.dueDate || a.createdDate || '';
        const dateB = b.completionDate || b.dueDate || b.createdDate || '';
        return dateB.localeCompare(dateA);
      }
      if (sortBy === 'DATE_ASC') {
        const dateA = a.completionDate || a.dueDate || a.createdDate || '';
        const dateB = b.completionDate || b.dueDate || b.createdDate || '';
        return dateA.localeCompare(dateB);
      }
      if (sortBy === 'PRIORITY_DESC') {
        const pWeights: Record<Priority, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (pWeights[b.priority] || 1) - (pWeights[a.priority] || 1);
      }
      if (sortBy === 'TITLE_ASC') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'HOURS_DESC') {
        return (b.actualTimeHours || b.estimatedTimeHours || 0) - (a.actualTimeHours || a.estimatedTimeHours || 0);
      }
      return 0;
    });
  }, [completedTasks, dateRangeFilter, selectedCategoryFilter, selectedPriorityFilter, searchQuery, sortBy, today]);

  // Done Statistics Calculations
  const doneTodayCount = useMemo(() => {
    return completedTasks.filter(t => (t.completionDate || t.dueDate) === today).length;
  }, [completedTasks, today]);

  const doneThisWeekCount = useMemo(() => {
    const weekAgo = new Date().getTime() - (7 * 24 * 60 * 60 * 1000);
    return completedTasks.filter(t => new Date(t.completionDate || t.dueDate || t.createdDate).getTime() >= weekAgo).length;
  }, [completedTasks]);

  const totalHoursLogged = useMemo(() => {
    return completedTasks.reduce((acc, t) => acc + (t.actualTimeHours || t.estimatedTimeHours || 0), 0);
  }, [completedTasks]);

  const criticalDoneCount = useMemo(() => {
    return completedTasks.filter(t => t.priority === 'CRITICAL' || t.priority === 'HIGH').length;
  }, [completedTasks]);

  // Category breakdown for done tasks
  const categoryDoneStats = useMemo(() => {
    const categories: { id: MainCategory; label: string; icon: any; color: string }[] = [
      { id: 'TOP_PRIORITY', label: 'Top Priority', icon: AlertTriangle, color: 'text-red-500 bg-red-500' },
      { id: 'DEPARTMENT_WORK', label: 'Department Work', icon: Building2, color: 'text-blue-500 bg-blue-500' },
      { id: 'FOLLOW_UPS', label: 'Follow-ups', icon: Users, color: 'text-purple-500 bg-purple-500' },
      { id: 'INSTITUTIONAL_WORK', label: 'Institutional Work', icon: Landmark, color: 'text-indigo-500 bg-indigo-500' },
      { id: 'INNOVATION_HUB', label: 'Innovation Hub', icon: Lightbulb, color: 'text-emerald-500 bg-emerald-500' },
      { id: 'PERSONAL_WORK', label: 'Personal Work', icon: User, color: 'text-amber-500 bg-amber-500' },
      { id: 'HOME_WORKS', label: 'Home Works', icon: Home, color: 'text-teal-500 bg-teal-500' },
    ];

    return categories.map(cat => {
      const catTasks = safeTasks.filter(t => t.category === cat.id);
      const catDone = catTasks.filter(t => t.status === 'COMPLETED').length;
      const catPending = catTasks.filter(t => t.status !== 'COMPLETED').length;
      const percentage = catTasks.length > 0 ? Math.round((catDone / catTasks.length) * 100) : 0;

      return {
        ...cat,
        total: catTasks.length,
        done: catDone,
        pending: catPending,
        percentage
      };
    });
  }, [safeTasks]);

  // CSV Export Generator for Done Tasks Report
  const handleExportCSV = () => {
    if (filteredDoneTasks.length === 0) {
      alert('No completed tasks to export for the current filter selection.');
      return;
    }

    const headers = [
      'Task ID',
      'Title',
      'Category',
      'Subcategory',
      'Priority',
      'Status',
      'Completion Date',
      'Due Date',
      'Actual Hours',
      'Estimated Hours',
      'Assigned To',
      'Description',
      'Follow-up / Contact',
      'Innovation / Event',
      'Placement / Company'
    ];

    const rows = filteredDoneTasks.map(t => [
      `"${t.id}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${t.category || ''}"`,
      `"${t.subcategory || ''}"`,
      `"${t.priority || ''}"`,
      `"${t.status || 'COMPLETED'}"`,
      `"${t.completionDate || t.dueDate || ''}"`,
      `"${t.dueDate || ''}"`,
      `"${t.actualTimeHours || ''}"`,
      `"${t.estimatedTimeHours || ''}"`,
      `"${(t.assignedTo || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.contact?.personName || '').replace(/"/g, '""')}"`,
      `"${(t.innovation?.eventName || '').replace(/"/g, '""')}"`,
      `"${(t.placement?.companyName || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WorkManager_Done_Tasks_Report_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Copy Executive Done Report Summary to Clipboard
  const handleCopySummary = async () => {
    let summaryText = `📋 WORK & TASK COMPLETION REPORT (${today})\n`;
    summaryText += `--------------------------------------------------\n`;
    summaryText += `Total Completed Tasks: ${completedTasks.length} / ${safeTasks.length} (${stats.completionPercentage}% Overall Completion)\n`;
    summaryText += `Total Hours Logged: ${totalHoursLogged} Hours\n`;
    summaryText += `High & Critical Milestones Completed: ${criticalDoneCount}\n\n`;
    summaryText += `COMPLETED TASKS BREAKDOWN:\n`;

    filteredDoneTasks.forEach((t, i) => {
      summaryText += `${i + 1}. [${t.id}] ${t.title}\n`;
      summaryText += `   • Category: ${t.category} > ${t.subcategory} | Priority: ${t.priority}\n`;
      summaryText += `   • Completed On: ${t.completionDate || t.dueDate || 'N/A'}${t.actualTimeHours ? ` | Logged: ${t.actualTimeHours}h` : ''}\n`;
      if (t.assignedTo) summaryText += `   • Assigned To: ${t.assignedTo}\n`;
      if (t.description) summaryText += `   • Notes: ${t.description.slice(0, 100)}\n`;
      summaryText += `\n`;
    });

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 3000);
    } catch (err) {
      console.warn('Clipboard write error:', err);
    }
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  // Chart Data for Analytics tab
  const categoryData = [
    { name: 'Top Priority', count: safeTasks.filter(t => t && t.category === 'TOP_PRIORITY').length, completed: safeTasks.filter(t => t.category === 'TOP_PRIORITY' && t.status === 'COMPLETED').length, fill: '#ef4444' },
    { name: 'Department', count: safeTasks.filter(t => t && t.category === 'DEPARTMENT_WORK').length, completed: safeTasks.filter(t => t.category === 'DEPARTMENT_WORK' && t.status === 'COMPLETED').length, fill: '#3b82f6' },
    { name: 'Follow-ups', count: safeTasks.filter(t => t && t.category === 'FOLLOW_UPS').length, completed: safeTasks.filter(t => t.category === 'FOLLOW_UPS' && t.status === 'COMPLETED').length, fill: '#a855f7' },
    { name: 'Institutional', count: safeTasks.filter(t => t && t.category === 'INSTITUTIONAL_WORK').length, completed: safeTasks.filter(t => t.category === 'INSTITUTIONAL_WORK' && t.status === 'COMPLETED').length, fill: '#6366f1' },
    { name: 'Innovation', count: safeTasks.filter(t => t && t.category === 'INNOVATION_HUB').length, completed: safeTasks.filter(t => t.category === 'INNOVATION_HUB' && t.status === 'COMPLETED').length, fill: '#10b981' },
    { name: 'Personal', count: safeTasks.filter(t => t && t.category === 'PERSONAL_WORK').length, completed: safeTasks.filter(t => t.category === 'PERSONAL_WORK' && t.status === 'COMPLETED').length, fill: '#f59e0b' },
    { name: 'Home', count: safeTasks.filter(t => t && t.category === 'HOME_WORKS').length, completed: safeTasks.filter(t => t.category === 'HOME_WORKS' && t.status === 'COMPLETED').length, fill: '#14b8a6' },
  ];

  const statusData = [
    { name: 'Completed', count: safeTasks.filter(t => t && t.status === 'COMPLETED').length, fill: '#10b981' },
    { name: 'Pending', count: safeTasks.filter(t => t && t.status === 'PENDING').length, fill: '#3b82f6' },
    { name: 'In Progress', count: safeTasks.filter(t => t && t.status === 'IN_PROGRESS').length, fill: '#f59e0b' },
    { name: 'Overdue', count: safeTasks.filter(t => t && t.status === 'OVERDUE').length, fill: '#ef4444' },
    { name: 'On Hold', count: safeTasks.filter(t => t && t.status === 'ON_HOLD').length, fill: '#64748b' },
    { name: 'New', count: safeTasks.filter(t => t && t.status === 'NEW').length, fill: '#06b6d4' },
  ];

  const priorityData = [
    { name: 'Critical', count: safeTasks.filter(t => t && t.priority === 'CRITICAL').length, fill: '#ef4444' },
    { name: 'High', count: safeTasks.filter(t => t && t.priority === 'HIGH').length, fill: '#f97316' },
    { name: 'Medium', count: safeTasks.filter(t => t && t.priority === 'MEDIUM').length, fill: '#f59e0b' },
    { name: 'Low', count: safeTasks.filter(t => t && t.priority === 'LOW').length, fill: '#64748b' },
  ];

  const getPriorityBadgeClass = (priority: Priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'LOW': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getCategoryBadgeClass = (category: MainCategory) => {
    switch (category) {
      case 'TOP_PRIORITY': return 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200';
      case 'DEPARTMENT_WORK': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200';
      case 'FOLLOW_UPS': return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200';
      case 'INSTITUTIONAL_WORK': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200';
      case 'INNOVATION_HUB': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200';
      case 'PERSONAL_WORK': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200';
      case 'HOME_WORKS': return 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Task Completion & Productivity Report
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Detailed audit of all completed tasks, deliverables, turnaround velocity, and department performance metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Global Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('DONE_TASKS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'DONE_TASKS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed Tasks ({completedTasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CATEGORY_KPIS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'CATEGORY_KPIS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Category Productivity</span>
          </button>

          <button
            onClick={() => setActiveTab('ANALYTICS_CHARTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ANALYTICS_CHARTS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Visual Charts</span>
          </button>
        </div>
      </div>

      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-4 rounded-2xl shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Done Tasks
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {completedTasks.length}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {stats.completionPercentage}% of total
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-4 rounded-2xl shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Done This Week
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {doneThisWeekCount}
              </span>
              <span className="text-xs font-medium text-slate-500">
                ({doneTodayCount} done today)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-4 rounded-2xl shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Hours Logged
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {totalHoursLogged}h
              </span>
              <span className="text-xs font-medium text-slate-500">
                on completed tasks
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-4 rounded-2xl shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              High / Critical Solved
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {criticalDoneCount}
              </span>
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                Major milestones
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* SUB-VIEW 1: COMPLETED / DONE TASKS REPORT & AUDIT LOG   */}
      {/* ======================================================== */}
      {activeTab === 'DONE_TASKS' && (
        <div className="space-y-6">
          
          {/* Collapsible Category Productivity Progress Widget */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                Category Productivity Overview
              </span>
              <button
                type="button"
                onClick={() => setShowCategoryProgressInDone(!showCategoryProgressInDone)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                {showCategoryProgressInDone ? 'Hide Progress Bars' : 'Show Progress Bars'}
              </button>
            </div>
            {showCategoryProgressInDone && (
              <CategoryProductivityProgress 
                tasks={safeTasks}
                onSelectCategory={(catId) => {
                  setSelectedCategoryFilter(catId);
                }}
              />
            )}
          </div>

          {/* Controls Bar: Filters, Date Range, Search & Export */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-4 rounded-2xl shadow-xs space-y-3.5">
            
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter completed tasks by title, assignee, category, notes, or company..."
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Action Buttons: CSV, Summary, Print */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  title="Export Done Tasks Report to CSV / Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handleCopySummary}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300 dark:border-slate-600"
                  title="Copy Done Tasks Executive Summary to Clipboard"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer border border-slate-300 dark:border-slate-600 hidden sm:flex"
                  title="Print Report"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Filter Pills Bar */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              
              {/* Date Ranges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mr-1">Timeframe:</span>
                {(['ALL', 'TODAY', 'YESTERDAY', 'THIS_WEEK', 'THIS_MONTH', 'LAST_30_DAYS'] as DateRangeFilter[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRangeFilter(range)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer text-[11px] ${
                      dateRangeFilter === range
                        ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {range === 'ALL' && 'All Time'}
                    {range === 'TODAY' && 'Done Today'}
                    {range === 'YESTERDAY' && 'Yesterday'}
                    {range === 'THIS_WEEK' && 'Last 7 Days'}
                    {range === 'THIS_MONTH' && 'This Month'}
                    {range === 'LAST_30_DAYS' && 'Last 30 Days'}
                  </button>
                ))}
              </div>

              {/* Category & Priority Selectors */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value as any)}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-xs font-semibold"
                >
                  <option value="ALL">All Categories</option>
                  <option value="TOP_PRIORITY">Top Priority</option>
                  <option value="DEPARTMENT_WORK">Department Work</option>
                  <option value="FOLLOW_UPS">Follow-ups</option>
                  <option value="INSTITUTIONAL_WORK">Institutional Work</option>
                  <option value="INNOVATION_HUB">Innovation Hub</option>
                  <option value="PERSONAL_WORK">Personal Work</option>
                  <option value="HOME_WORKS">Home Works</option>
                </select>

                <select
                  value={selectedPriorityFilter}
                  onChange={(e) => setSelectedPriorityFilter(e.target.value as any)}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-xs font-semibold"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="CRITICAL">Critical Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-xs font-semibold"
                >
                  <option value="DATE_DESC">Newest Done First</option>
                  <option value="DATE_ASC">Oldest Done First</option>
                  <option value="PRIORITY_DESC">Highest Priority First</option>
                  <option value="TITLE_ASC">Title (A-Z)</option>
                  <option value="HOURS_DESC">Most Hours Logged</option>
                </select>
              </div>

            </div>

          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Showing <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{filteredDoneTasks.length}</span> completed {filteredDoneTasks.length === 1 ? 'task' : 'tasks'}
            </span>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('TABLE')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  viewMode === 'TABLE' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('CARDS')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  viewMode === 'CARDS' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500'
                }`}
              >
                Timeline Cards
              </button>
            </div>
          </div>

          {/* Empty State */}
          {filteredDoneTasks.length === 0 && (
            <div className="bg-white dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {completedTasks.length === 0 ? 'No Completed Tasks Yet' : 'No Tasks Match the Selected Filters'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {completedTasks.length === 0 
                    ? 'When you complete tasks across your dashboard, department workflows, or innovation projects, they will be audited and reported here with turnaround metrics.'
                    : 'Try clearing search keywords or selecting "All Time" to view your historical done tasks.'}
                </p>
              </div>
              {onQuickAdd && (
                <button
                  onClick={onQuickAdd}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Create / Complete New Task</span>
                </button>
              )}
            </div>
          )}

          {/* TABLE VIEW */}
          {filteredDoneTasks.length > 0 && viewMode === 'TABLE' && (
            <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Task & Title</th>
                      <th className="py-3 px-4">Category / Stream</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Completed On</th>
                      <th className="py-3 px-4">Hours</th>
                      <th className="py-3 px-4">Assignee / Contacts</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {filteredDoneTasks.map((task) => (
                      <tr 
                        key={task.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors group cursor-pointer"
                        onClick={() => onSelectTask && onSelectTask(task)}
                      >
                        {/* Title & ID */}
                        <td className="py-3.5 px-4 max-w-xs sm:max-w-sm">
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] font-bold text-slate-400">{task.id}</span>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight line-clamp-1">
                                  {task.title}
                                </h4>
                              </div>
                              {task.description && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category & Subcategory */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryBadgeClass(task.category)}`}>
                              {task.category.replace('_', ' ')}
                            </span>
                            {task.subcategory && (
                              <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                {task.subcategory}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold border uppercase tracking-wider ${getPriorityBadgeClass(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>

                        {/* Completed Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">
                              {task.completionDate || task.dueDate || task.createdDate || 'Done'}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Completed
                            </span>
                          </div>
                        </td>

                        {/* Hours */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                          {task.actualTimeHours ? (
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {task.actualTimeHours} hrs
                            </span>
                          ) : task.estimatedTimeHours ? (
                            <span className="text-slate-400 text-[11px]">
                              ~{task.estimatedTimeHours} hrs est
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>

                        {/* Assignee / Contact */}
                        <td className="py-3.5 px-4 text-[11px]">
                          {task.assignedTo && (
                            <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{task.assignedTo}</span>
                            </div>
                          )}
                          {task.contact?.personName && (
                            <div className="text-purple-600 dark:text-purple-400 text-[10px] flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{task.contact.personName}</span>
                            </div>
                          )}
                          {task.innovation?.eventName && (
                            <div className="text-emerald-600 dark:text-emerald-400 text-[10px] flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" />
                              <span>{task.innovation.eventName}</span>
                            </div>
                          )}
                          {task.placement?.companyName && (
                            <div className="text-blue-600 dark:text-blue-400 text-[10px] flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              <span>{task.placement.companyName}</span>
                            </div>
                          )}
                          {!task.assignedTo && !task.contact?.personName && !task.innovation?.eventName && !task.placement?.companyName && (
                            <span className="text-slate-400 text-[10px]">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onSelectTask && onSelectTask(task)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                              title="View Full Task Details"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            {onUpdateStatus && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Re-open task "${task.title}" to In-Progress?`)) {
                                    onUpdateStatus(task.id, 'IN_PROGRESS');
                                  }
                                }}
                                className="px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md text-[10px] font-bold transition-all cursor-pointer"
                                title="Move back to In Progress"
                              >
                                Reopen
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TIMELINE CARDS VIEW */}
          {filteredDoneTasks.length > 0 && viewMode === 'CARDS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDoneTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask && onSelectTask(task)}
                  className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-4 rounded-2xl shadow-xs hover:border-emerald-400 dark:hover:border-emerald-500 transition-all cursor-pointer space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryBadgeClass(task.category)}`}>
                        {task.category.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {task.title}
                      </h4>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {task.completionDate || task.dueDate || 'Completed'}
                    </span>
                    {task.actualTimeHours ? (
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {task.actualTimeHours} hrs spent
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-slate-400">{task.id}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 2: VISUAL ANALYTICS & VELOCITY CHARTS           */}
      {/* ======================================================== */}
      {activeTab === 'ANALYTICS_CHARTS' && (
        <div className="space-y-6">
          
          {/* Top Banner Rate Card */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Productivity Formula</span>
              </div>
              <h2 className="text-3xl font-black">
                {stats.completionPercentage}% Overall Completion Rate
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Calculated as: <code className="bg-slate-800 px-2 py-0.5 rounded-md text-emerald-300">Completed Tasks ({stats.completed}) / Total Tasks ({stats.total}) × 100</code>.
              </p>
            </div>

            <div className="w-44 h-44 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed Tasks', value: stats.completed, fill: '#10b981' },
                      { name: 'Active / Pending', value: stats.pending, fill: '#3b82f6' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#3b82f6" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-white">{stats.completionPercentage}%</span>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Done</span>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Category Total vs Completed */}
            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-5 rounded-2xl shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                Tasks Distribution: Total vs Completed
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Total Tasks" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" name="Completed Tasks" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Distribution Pie */}
            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-5 rounded-2xl shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-emerald-500" />
                Tasks Distribution by Status
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ name, count }) => count > 0 ? `${name}: ${count}` : ''}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`status-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Priority Breakdown */}
            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-5 rounded-2xl shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Priority Volume Breakdown
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {priorityData.map((entry, index) => (
                        <Cell key={`prio-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Key Performance Indicators */}
            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-500" />
                Operational KPIs & Status Summary
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold block">Done / Completed</span>
                  <span className="text-xl font-black text-emerald-900 dark:text-emerald-100">{stats.completed}</span>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800">
                  <span className="text-blue-700 dark:text-blue-300 font-bold block">Critical Tasks</span>
                  <span className="text-xl font-black text-blue-900 dark:text-blue-100">{stats.critical}</span>
                </div>

                <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800">
                  <span className="text-red-700 dark:text-red-300 font-bold block">Overdue Items</span>
                  <span className="text-xl font-black text-red-900 dark:text-red-100">{stats.overdue}</span>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800">
                  <span className="text-purple-700 dark:text-purple-300 font-bold block">Follow-ups Active</span>
                  <span className="text-xl font-black text-purple-900 dark:text-purple-100">{stats.followUps}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 3: CATEGORY & DEPARTMENT KPI MATRIX TABLE      */}
      {/* ======================================================== */}
      {activeTab === 'CATEGORY_KPIS' && (
        <div className="space-y-6">
          {/* Main Visual Category Productivity Progress Bars */}
          <CategoryProductivityProgress 
            tasks={safeTasks}
            onSelectCategory={(catId) => {
              setSelectedCategoryFilter(catId);
              setActiveTab('DONE_TASKS');
            }}
          />

          {/* Department Breakdown Matrix */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xs overflow-hidden space-y-4 p-5">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Category & Stream Completion Performance Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparative completion percentages, active workloads, and execution progress across every functional department.
              </p>
            </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Main Category</th>
                  <th className="py-3 px-4 text-center">Total Tasks</th>
                  <th className="py-3 px-4 text-center">Completed</th>
                  <th className="py-3 px-4 text-center">Active / Pending</th>
                  <th className="py-3 px-4">Completion Ratio</th>
                  <th className="py-3 px-4 text-right">Progress Bar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {categoryDoneStats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${item.color.split(' ')[0]}`} />
                        <span>{item.label}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {item.total}
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-emerald-600 dark:text-emerald-400">
                        {item.done}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-slate-500 dark:text-slate-400">
                        {item.pending}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {item.percentage}% Done
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="w-32 ml-auto bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

  </div>
);
};
