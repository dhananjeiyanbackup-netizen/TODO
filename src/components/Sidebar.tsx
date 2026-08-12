import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  AlertTriangle, 
  Building2, 
  Users, 
  Landmark, 
  Lightbulb, 
  User, 
  Home, 
  Calendar, 
  Kanban, 
  BarChart3, 
  Settings,
  PlusCircle,
  X
} from 'lucide-react';
import { ViewMode, MainCategory, Task } from '../types';
import { calculateDashboardStats } from '../utils/taskUtils';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange?: (view: ViewMode) => void;
  onNavigateView?: (view: ViewMode) => void;
  onNavigateCategory?: (category: MainCategory) => void;
  selectedCategory?: MainCategory;
  tasks?: Task[];
  onQuickAdd?: (categoryPreset?: string) => void;
  onOpenGoogleCalendar?: () => void;
  isOpen?: boolean;
  onCloseMobile?: () => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onNavigateView,
  onNavigateCategory,
  selectedCategory,
  tasks = [],
  onQuickAdd = () => {},
  onOpenGoogleCalendar,
  isOpen = false,
  onCloseMobile,
  onClose
}) => {
  const stats = calculateDashboardStats(tasks || []);

  const handleCloseSidebar = () => {
    if (onClose) onClose();
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectView = (view: ViewMode) => {
    if (onNavigateView) onNavigateView(view);
    else if (onViewChange) onViewChange(view);
    handleCloseSidebar();
  };

  const navItems = [
    { id: 'DASHBOARD' as ViewMode, label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'MY_TASKS' as ViewMode, label: 'My Tasks', icon: CheckSquare, badge: stats.pending > 0 ? stats.pending : null, badgeColor: 'bg-blue-600' },
    { id: 'TOP_PRIORITY' as ViewMode, label: 'Top Priority', icon: AlertTriangle, badge: stats.critical > 0 ? stats.critical : null, badgeColor: 'bg-red-600 font-bold' },
    { id: 'DEPARTMENT_WORK' as ViewMode, label: 'Department Work', icon: Building2, badge: null },
    { id: 'FOLLOW_UPS' as ViewMode, label: 'Follow-ups', icon: Users, badge: stats.followUps > 0 ? stats.followUps : null, badgeColor: 'bg-purple-600' },
    { id: 'INSTITUTIONAL_WORK' as ViewMode, label: 'Institutional Work', icon: Landmark, badge: null },
    { id: 'INNOVATION_HUB' as ViewMode, label: 'Innovation Hub', icon: Lightbulb, badge: null },
    { id: 'PERSONAL_WORK' as ViewMode, label: 'Personal Work', icon: User, badge: null },
    { id: 'HOME_WORKS' as ViewMode, label: 'Home Works', icon: Home, badge: null },
    { id: 'CALENDAR' as ViewMode, label: 'Calendar', icon: Calendar, badge: null },
    { id: 'KANBAN' as ViewMode, label: 'Kanban Board', icon: Kanban, badge: null },
    { id: 'REPORTS' as ViewMode, label: 'Reports & Analytics', icon: BarChart3, badge: null },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed lg:relative inset-y-0 left-0 z-40 h-full w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Branding */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md font-bold text-lg">
              W
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white leading-tight">WorkManager</h1>
              <p className="text-xs text-slate-400 font-medium">Task & Admin Hub</p>
            </div>
          </div>
          <button 
            onClick={handleCloseSidebar}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add & Google Calendar Buttons */}
        <div className="p-3 space-y-2">
          <button
            onClick={() => {
              onQuickAdd();
              handleCloseSidebar();
            }}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-500/25 transition-all duration-150 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Quick Add Task</span>
          </button>

          {onOpenGoogleCalendar && (
            <button
              onClick={() => {
                onOpenGoogleCalendar();
                handleCloseSidebar();
              }}
              className="w-full py-2 px-3 bg-slate-800/90 hover:bg-slate-700 text-blue-300 border border-slate-700/80 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Google Calendar Reminders</span>
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar">
          <div className="text-[11px] font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-600/90 text-white shadow-xs font-semibold' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span className={`px-2 py-0.5 text-xs text-white rounded-full ${item.badgeColor || 'bg-slate-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Stats & Settings */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50 space-y-2">
          {stats.overdue > 0 && (
            <div className="bg-red-950/60 border border-red-800/80 rounded-lg p-2.5 flex items-center justify-between text-xs text-red-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="font-semibold">{stats.overdue} Tasks Overdue</span>
              </div>
              <button
                onClick={() => handleSelectView('MY_TASKS')}
                className="underline text-red-300 hover:text-white cursor-pointer"
              >
                View
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
            <span>Overall Completion</span>
            <span className="font-bold text-slate-200">{stats.completionPercentage}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>
        </div>
      </aside>
    </>
  );
};
