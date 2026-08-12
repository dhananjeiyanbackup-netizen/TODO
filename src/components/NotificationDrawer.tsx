import React from 'react';
import { X, Bell, AlertTriangle, Clock, CheckCircle2, Phone, Calendar } from 'lucide-react';
import { NotificationItem, Task } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: NotificationItem[];
  onSelectTaskById: (taskId: string) => void;
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications = [],
  onSelectTaskById,
  onMarkAllRead
}) => {
  if (!isOpen) return null;

  const safeNotifications = notifications || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Reminders & Notifications
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onMarkAllRead}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                Mark Read
              </button>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {safeNotifications.length > 0 ? (
              safeNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    onSelectTaskById(n.taskId);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    n.severity === 'critical'
                      ? 'bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-950 dark:text-red-100'
                      : n.severity === 'warning'
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100'
                        : 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                    <span className="flex items-center gap-1">
                      {n.severity === 'critical' && <AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
                      {n.severity === 'warning' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      {n.severity === 'info' && <Calendar className="w-3.5 h-3.5 text-blue-600" />}
                      {n.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                  </div>
                  <h4 className="font-bold text-xs mb-0.5">{n.title}</h4>
                  <p className="text-[11px] opacity-80 leading-tight">{n.message}</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                🔔 No active notifications or reminders!
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
