import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Moon, 
  Sun, 
  Menu, 
  Building2, 
  Users, 
  Lightbulb, 
  User, 
  Home, 
  Calendar, 
  CheckCircle2,
  ChevronDown,
  RotateCcw,
  Settings
} from 'lucide-react';
import { Task, NotificationItem } from '../types';

interface HeaderProps {
  tasks?: Task[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenMobileSidebar?: () => void;
  onToggleSidebar?: () => void;
  onQuickAdd?: (categoryPreset?: string) => void;
  notifications?: NotificationItem[];
  unreadNotificationCount?: number;
  onOpenNotifications?: () => void;
  onToggleNotifications?: () => void;
  onOpenSettings?: () => void;
  onOpenGoogleCalendar?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onResetData?: () => void;
  onSelectTask?: (task: Task) => void;
}

export const Header: React.FC<HeaderProps> = ({
  tasks = [],
  searchQuery = '',
  onSearchChange = (_query: string) => {},
  onOpenMobileSidebar,
  onToggleSidebar,
  onQuickAdd = (_categoryPreset?: string) => {},
  notifications = [],
  unreadNotificationCount,
  onOpenNotifications,
  onToggleNotifications,
  onOpenSettings,
  onOpenGoogleCalendar,
  isDarkMode = false,
  onToggleDarkMode = () => {},
  onResetData = () => {},
  onSelectTask
}) => {
  const [showQuickDropdown, setShowQuickDropdown] = useState(false);
  const unreadCount = unreadNotificationCount !== undefined 
    ? unreadNotificationCount 
    : (notifications || []).filter(n => n && !n.isRead).length;

  const handleSidebarToggle = onToggleSidebar || onOpenMobileSidebar || (() => {});
  const handleNotifToggle = onOpenNotifications || onToggleNotifications || (() => {});

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu & Welcome / Date */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSidebarToggle}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div>
            <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
              Work & Productivity Dashboard
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              📅 {todayStr}
            </p>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks, persons, departments, notes, events..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          
          {/* Quick Action Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQuickDropdown(!showQuickDropdown)}
              className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Quick Add</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showQuickDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowQuickDropdown(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1.5 text-xs font-medium">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Create Presets
                  </div>
                  <button
                    onClick={() => { onQuickAdd(); setShowQuickDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" /> General Task
                  </button>
                  <button
                    onClick={() => { onQuickAdd('DEPARTMENT_WORK'); setShowQuickDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-blue-500" /> Department Task
                  </button>
                  <button
                    onClick={() => { onQuickAdd('FOLLOW_UPS'); setShowQuickDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-purple-500" /> Follow-up Activity
                  </button>
                  <button
                    onClick={() => { onQuickAdd('INNOVATION_HUB'); setShowQuickDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Lightbulb className="w-4 h-4 text-emerald-500" /> Innovation Hub Activity
                  </button>
                  <button
                    onClick={() => { onQuickAdd('PERSONAL_WORK'); setShowQuickDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-amber-500" /> Personal Work
                  </button>
                  <button
                    onClick={() => { onQuickAdd('HOME_WORKS'); setShowQuickDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Home className="w-4 h-4 text-teal-500" /> Home Work
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Notifications Trigger */}
          <button
            onClick={handleNotifToggle}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Notifications & Reminders"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Google Calendar Daily Reminders */}
          {onOpenGoogleCalendar && (
            <button
              onClick={onOpenGoogleCalendar}
              className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl transition-colors cursor-pointer"
              title="Google Calendar Daily Reminders"
            >
              <Calendar className="w-5 h-5" />
            </button>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Settings Trigger */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Settings & Data Management"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          {/* Reset Sample Data Button */}
          <button
            onClick={onResetData}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer hidden sm:block"
            title="Reset Sample Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

        </div>
      </div>
    </header>
  );
};
