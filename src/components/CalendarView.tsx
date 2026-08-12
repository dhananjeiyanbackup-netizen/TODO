import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Filter,
  Sparkles,
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle,
  User,
  Tag,
  Search,
  CheckSquare,
  ArrowRight
} from 'lucide-react';
import { Task, TaskStatus, MainCategory } from '../types';
import { getTodayFormatted } from '../utils/taskUtils';

interface CalendarViewProps {
  tasks?: Task[];
  onSelectTask: (task: Task) => void;
  onUpdateStatus?: (taskId: string, newStatus: TaskStatus) => void;
  onQuickAddForDate?: (dateStr: string) => void;
  onOpenGoogleCalendarModal?: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks = [],
  onSelectTask,
  onUpdateStatus,
  onQuickAddForDate,
  onOpenGoogleCalendarModal
}) => {
  const todayStr = getTodayFormatted();
  const safeTasks = tasks || [];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [viewType, setViewType] = useState<'MONTH' | 'WEEK'>('MONTH');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | 'ALL'>('ALL');
  const [filterMode, setFilterMode] = useState<'SELECTED_DATE' | 'ALL_MONTH'>('SELECTED_DATE');

  // Month navigation
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewType === 'MONTH') {
      d.setMonth(d.getMonth() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewType === 'MONTH') {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(getTodayFormatted());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: (string | null)[] = [];
  if (viewType === 'MONTH') {
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      calendarDays.push(dateStr);
    }
  } else {
    // Week View: 7 days starting from Sunday
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
      calendarDays.push(dateStr);
    }
  }

  // Helper to filter tasks for a given date
  const getTasksForDate = (dateStr: string) => {
    return safeTasks.filter(t => {
      if (!t || t.isArchived) return false;
      const matchesDate = (
        t.dueDate === dateStr || 
        t.startDate === dateStr || 
        t.reminderDate === dateStr || 
        t.contact?.nextFollowUpDate === dateStr
      );
      if (!matchesDate) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title?.toLowerCase().includes(q);
        const matchesSub = t.subcategory?.toLowerCase().includes(q);
        const matchesAssigned = t.assignedTo?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSub && !matchesAssigned) return false;
      }

      return true;
    });
  };

  // Get tasks to display on the side list
  const sideListTasks = filterMode === 'SELECTED_DATE'
    ? getTasksForDate(selectedDateStr)
    : safeTasks.filter(t => {
        if (!t || t.isArchived) return false;
        // Check if task belongs to current month view
        const tDate = t.dueDate || t.startDate || t.reminderDate;
        if (!tDate) return false;
        const matchesMonth = tDate.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`);
        if (!matchesMonth) return false;
        if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return t.title?.toLowerCase().includes(q) || t.subcategory?.toLowerCase().includes(q);
        }
        return true;
      });

  // Format date readable
  const formatReadableDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Calendar & Task List View
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Select any calendar date on the left to view, manage, and quickly add tasks for that day.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenGoogleCalendarModal && (
            <button
              onClick={onOpenGoogleCalendarModal}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Google Calendar Daily Reminders</span>
            </button>
          )}

          {/* Month / Week Switcher */}
          <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 flex text-xs font-bold">
            <button
              onClick={() => setViewType('MONTH')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                viewType === 'MONTH' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewType('WEEK')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                viewType === 'WEEK' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Week View
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Month Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Month Navigator */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer text-slate-700 dark:text-slate-200 shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 rounded-xl text-xs font-bold cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer text-slate-700 dark:text-slate-200 shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="font-black text-base sm:text-lg text-slate-900 dark:text-slate-100 pl-2">
            {monthNames[month]} {year}
          </span>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="DEPARTMENT_WORK">Department Work</option>
            <option value="TOP_PRIORITY">Top Priority</option>
            <option value="FOLLOW_UPS">Follow-ups</option>
            <option value="INNOVATION_HUB">Innovation Hub</option>
            <option value="INSTITUTIONAL_WORK">Institutional</option>
            <option value="PERSONAL_WORK">Personal</option>
            <option value="HOME_WORKS">Home</option>
          </select>
        </div>

      </div>

      {/* Split View: Calendar on Left, Task List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Calendar Grid (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-xs">
          
          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase pb-2.5 border-b border-slate-200 dark:border-slate-700">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 pt-2">
            {calendarDays.map((dateStr, idx) => {
              if (!dateStr) {
                return (
                  <div key={`empty-${idx}`} className="h-24 sm:h-28 bg-slate-50/40 dark:bg-slate-900/10 rounded-xl" />
                );
              }

              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDateStr;
              const dayNum = dateStr.split('-')[2];
              const dateTasks = getTasksForDate(dateStr);

              const hasCritical = dateTasks.some(t => t.priority === 'CRITICAL');
              const hasHigh = dateTasks.some(t => t.priority === 'HIGH');

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-24 sm:h-28 p-1.5 border rounded-xl flex flex-col justify-between transition-all cursor-pointer overflow-hidden relative group ${
                    isSelected
                      ? 'bg-indigo-100/90 dark:bg-indigo-950/80 border-indigo-600 ring-2 ring-indigo-500 shadow-md z-10'
                      : isToday 
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 hover:border-indigo-400' 
                        : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800'
                  }`}
                >
                  {/* Top Bar: Day Number & Task Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isToday 
                          ? 'bg-blue-600 text-white' 
                          : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {parseInt(dayNum, 10)}
                    </span>

                    {dateTasks.length > 0 && (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                        hasCritical 
                          ? 'bg-red-500 text-white' 
                          : hasHigh 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-indigo-600 text-white'
                      }`}>
                        {dateTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Previews */}
                  <div className="flex-1 overflow-y-auto space-y-1 my-1 custom-scrollbar">
                    {dateTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={`px-1 py-0.5 rounded text-[9px] font-semibold truncate ${
                          t.priority === 'CRITICAL'
                            ? 'bg-red-500/90 text-white'
                            : t.status === 'COMPLETED'
                              ? 'bg-emerald-600/80 text-white line-through'
                              : 'bg-indigo-200/80 text-indigo-950 dark:bg-indigo-900/80 dark:text-indigo-100'
                        }`}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dateTasks.length > 2 && (
                      <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 pl-0.5">
                        +{dateTasks.length - 2} more
                      </div>
                    )}
                  </div>

                  {/* Indicator footer */}
                  <div className="flex items-center justify-end gap-1">
                    {hasCritical && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                    {hasHigh && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Side: Selected Date Task Details & Quick Add (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-4">
          
          {/* Header Box for Selected Date */}
          <div className="p-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-wider text-indigo-200 bg-white/10 px-2.5 py-0.5 rounded-full">
                {selectedDateStr === todayStr ? 'Today' : 'Selected Date'}
              </span>
              <span className="text-xs font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                {getTasksForDate(selectedDateStr).length} Task{getTasksForDate(selectedDateStr).length === 1 ? '' : 's'}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-white">
              {formatReadableDate(selectedDateStr)}
            </h2>

            {/* Quick Add Button for this date */}
            {onQuickAddForDate && (
              <button
                onClick={() => onQuickAddForDate(selectedDateStr)}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-indigo-900 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] mt-2"
              >
                <Plus className="w-4 h-4 text-indigo-600 font-bold" />
                <span>Add Task for {selectedDateStr.split('-').slice(1).join('/')}</span>
              </button>
            )}
          </div>

          {/* Mode Switcher Pills: Selected Date vs All Month */}
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterMode('SELECTED_DATE')}
              className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-colors ${
                filterMode === 'SELECTED_DATE' 
                  ? 'bg-indigo-600 text-white shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Selected Date ({getTasksForDate(selectedDateStr).length})
            </button>
            <button
              onClick={() => setFilterMode('ALL_MONTH')}
              className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-colors ${
                filterMode === 'ALL_MONTH' 
                  ? 'bg-indigo-600 text-white shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Month Tasks
            </button>
          </div>

          {/* Side Task Cards List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {sideListTasks.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <div className="w-10 h-10 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    No tasks found for {filterMode === 'SELECTED_DATE' ? formatReadableDate(selectedDateStr) : 'this month'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Click the button below to quickly add task details for this date!
                  </p>
                </div>
                {onQuickAddForDate && (
                  <button
                    onClick={() => onQuickAddForDate(selectedDateStr)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Task Now
                  </button>
                )}
              </div>
            ) : (
              sideListTasks.map((t) => {
                const isCompleted = t.status === 'COMPLETED';

                return (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-xl border transition-all space-y-2 relative group hover:shadow-md cursor-pointer ${
                      isCompleted
                        ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                        : t.priority === 'CRITICAL'
                          ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 hover:border-red-400'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                    onClick={() => onSelectTask(t)}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Checkbox toggle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onUpdateStatus) {
                            onUpdateStatus(t.id, isCompleted ? 'PENDING' : 'COMPLETED');
                          }
                        }}
                        className={`mt-0.5 p-0.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer shrink-0`}
                        title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400 hover:text-indigo-600" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono text-slate-400">{t.id}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            t.priority === 'CRITICAL'
                              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                              : t.priority === 'HIGH'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {t.priority}
                          </span>
                        </div>

                        <h4 className={`text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 ${
                          isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}>
                          {t.title}
                        </h4>

                        {/* Category & Assignee metadata */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium">
                            {t.category.replace('_', ' ')}
                          </span>

                          {t.assignedTo && (
                            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                              <User className="w-3 h-3 text-slate-400" />
                              {t.assignedTo}
                            </span>
                          )}

                          {t.dueDate && (
                            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 ml-auto">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {t.dueDate}
                            </span>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
