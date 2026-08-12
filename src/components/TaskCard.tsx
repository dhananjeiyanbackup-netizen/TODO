import React from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Phone, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical,
  Paperclip,
  RotateCw
} from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { 
  getCategoryBadgeStyle, 
  getPriorityBadgeStyle, 
  getStatusBadgeStyle,
  getTodayFormatted 
} from '../utils/taskUtils';

interface TaskCardProps {
  task: Task;
  onSelectTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onSelectTask,
  onUpdateStatus,
  compact = false
}) => {
  const today = getTodayFormatted();
  const isDueToday = task.dueDate === today;
  const isOverdue = task.status === 'OVERDUE' || (task.dueDate && task.dueDate < today && task.status !== 'COMPLETED' && task.status !== 'CANCELLED');

  const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'NEW', label: '🆕 NEW' },
    { value: 'PENDING', label: '🔵 PENDING' },
    { value: 'IN_PROGRESS', label: '🟠 IN PROGRESS' },
    { value: 'ON_HOLD', label: '⏸️ ON HOLD' },
    { value: 'COMPLETED', label: '🟢 COMPLETED' },
    { value: 'OVERDUE', label: '🔴 OVERDUE' },
    { value: 'CANCELLED', label: '❌ CANCELLED' },
  ];

  return (
    <div 
      className={`group relative bg-white dark:bg-slate-800/90 border rounded-2xl transition-all duration-200 hover:shadow-md cursor-pointer ${
        task.priority === 'CRITICAL' 
          ? 'border-l-4 border-l-red-500 border-slate-200 dark:border-slate-700' 
          : isOverdue 
            ? 'border-l-4 border-l-orange-500 border-slate-200 dark:border-slate-700'
            : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
      } ${compact ? 'p-3' : 'p-4 sm:p-5'}`}
      onClick={() => onSelectTask(task)}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Priority Badge */}
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase ${getPriorityBadgeStyle(task.priority)}`}>
            {task.priority}
          </span>

          {/* Category Badge */}
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getCategoryBadgeStyle(task.category)}`}>
            {task.subcategory || task.category.replace('_', ' ')}
          </span>

          {/* Recurrence Badge */}
          {task.recurrence && task.recurrence !== 'NONE' && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <RotateCw className="w-2.5 h-2.5" />
              {task.recurrence}
            </span>
          )}
        </div>

        {/* Task ID & Direct Status Changer */}
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <span className="text-[11px] font-mono text-slate-400 font-semibold">{task.id}</span>
          <select
            value={task.status}
            onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
            className={`text-xs font-semibold px-2 py-1 rounded-lg border focus:outline-hidden transition-colors cursor-pointer ${getStatusBadgeStyle(task.status)}`}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task Title */}
      <h3 className={`font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
        task.status === 'COMPLETED' ? 'line-through text-slate-400 dark:text-slate-500' : ''
      } ${compact ? 'text-sm mb-1' : 'text-base mb-1.5'}`}>
        {task.title}
      </h3>

      {/* Task Description snippet */}
      {!compact && task.description && (
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Innovation Event Details snippet if present */}
      {task.innovation && task.innovation.eventName && (
        <div className="mb-2 p-2 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex flex-wrap items-center justify-between gap-1">
          <span className="font-semibold flex items-center gap-1">
            🏆 {task.innovation.eventName}
          </span>
          <span className="px-1.5 py-0.5 bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-md font-bold text-[10px]">
            {task.innovation.level || 'Innovation'}
          </span>
        </div>
      )}

      {/* Contact snippet if present */}
      {task.contact && task.contact.personName && (
        <div className="mb-2 p-2 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/50 rounded-xl text-xs text-purple-900 dark:text-purple-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <Phone className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="font-medium truncate">{task.contact.personName}</span>
            <span className="text-purple-600 dark:text-purple-400 font-normal">({task.contact.departmentOrOrg || 'Contact'})</span>
          </div>
          {task.contact.nextFollowUpDate && (
            <span className="text-[10px] font-bold bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-1.5 py-0.5 rounded-md shrink-0">
              Follow-up: {task.contact.nextFollowUpDate}
            </span>
          )}
        </div>
      )}

      {/* Footer Info Row */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60 gap-2">
        <div className="flex items-center gap-3">
          {/* Due Date */}
          <span className={`flex items-center gap-1 font-medium ${
            isOverdue 
              ? 'text-red-600 dark:text-red-400 font-bold' 
              : isDueToday 
                ? 'text-amber-600 dark:text-amber-400 font-bold' 
                : ''
          }`}>
            <Calendar className="w-3.5 h-3.5" />
            <span>Due: {task.dueDate || 'No Date'}</span>
          </span>

          {/* Assigned To */}
          {task.assignedTo && (
            <span className="hidden sm:flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">{task.assignedTo}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          {/* Attachments indicator */}
          {task.attachments && task.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-slate-400">
              <Paperclip className="w-3 h-3" />
              {task.attachments.length}
            </span>
          )}

          {/* Related Org */}
          {task.relatedOrganization && (
            <span className="hidden md:inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300">
              {task.relatedOrganization}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
