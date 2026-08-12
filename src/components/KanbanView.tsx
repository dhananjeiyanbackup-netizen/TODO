import React, { useState } from 'react';
import { 
  Kanban as KanbanIcon, 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { getTodayFormatted, getPriorityBadgeStyle } from '../utils/taskUtils';

interface KanbanViewProps {
  tasks?: Task[];
  onSelectTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onQuickAdd: () => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks = [],
  onSelectTask,
  onUpdateStatus,
  onQuickAdd
}) => {
  const safeTasks = tasks || [];
  const columns: { id: TaskStatus; label: string; color: string; headerBg: string }[] = [
    { id: 'NEW', label: '🆕 NEW', color: 'border-sky-400', headerBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200' },
    { id: 'PENDING', label: '🔵 PENDING', color: 'border-blue-400', headerBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200' },
    { id: 'IN_PROGRESS', label: '🟠 IN PROGRESS', color: 'border-amber-400', headerBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200' },
    { id: 'ON_HOLD', label: '⏸️ ON HOLD', color: 'border-slate-400', headerBg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' },
    { id: 'COMPLETED', label: '🟢 COMPLETED', color: 'border-emerald-400', headerBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200' },
  ];

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetStatus: TaskStatus) => {
    if (draggedTaskId) {
      onUpdateStatus(draggedTaskId, targetStatus);
      setDraggedTaskId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <KanbanIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Interactive Kanban Board
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Drag & drop or move tasks across workflow columns: NEW → PENDING → IN PROGRESS → ON HOLD → COMPLETED.
          </p>
        </div>

        <button
          onClick={onQuickAdd}
          className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* 5-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start min-w-0">
        {columns.map((col) => {
          const colTasks = safeTasks.filter(t => t && !t.isArchived && t.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.id)}
              className="bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col min-h-[500px] overflow-hidden"
            >
              {/* Column Header */}
              <div className={`p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between ${col.headerBg}`}>
                <span className="font-black text-xs uppercase tracking-wider">{col.label}</span>
                <span className="w-5 h-5 bg-white/80 dark:bg-black/30 rounded-full font-bold text-[11px] flex items-center justify-center">
                  {colTasks.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="p-2.5 flex-1 space-y-3 overflow-y-auto custom-scrollbar">
                {colTasks.length > 0 ? (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onClick={() => onSelectTask(task)}
                      className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2 group"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono font-bold text-slate-400">{task.id}</span>
                        <span className={`px-1.5 py-0.5 rounded-md font-bold text-[9px] uppercase ${getPriorityBadgeStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {task.title}
                      </h4>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700">
                        <span>{task.subcategory}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Due: {task.dueDate}</span>
                      </div>

                      {/* Move Column Arrow Controls for easy mobile/click use */}
                      <div className="flex items-center justify-between pt-1 text-[10px]" onClick={(e) => e.stopPropagation()}>
                        {col.id !== 'NEW' && (
                          <button
                            onClick={() => {
                              const prevMap: Record<TaskStatus, TaskStatus> = {
                                PENDING: 'NEW',
                                IN_PROGRESS: 'PENDING',
                                ON_HOLD: 'IN_PROGRESS',
                                COMPLETED: 'IN_PROGRESS',
                                NEW: 'NEW',
                                OVERDUE: 'PENDING',
                                CANCELLED: 'NEW'
                              };
                              onUpdateStatus(task.id, prevMap[col.id]);
                            }}
                            className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-bold flex items-center gap-0.5 cursor-pointer"
                          >
                            <ChevronLeft className="w-3 h-3" /> Move
                          </button>
                        )}

                        {col.id !== 'COMPLETED' && (
                          <button
                            onClick={() => {
                              const nextMap: Record<TaskStatus, TaskStatus> = {
                                NEW: 'PENDING',
                                PENDING: 'IN_PROGRESS',
                                IN_PROGRESS: 'COMPLETED',
                                ON_HOLD: 'IN_PROGRESS',
                                COMPLETED: 'COMPLETED',
                                OVERDUE: 'IN_PROGRESS',
                                CANCELLED: 'NEW'
                              };
                              onUpdateStatus(task.id, nextMap[col.id]);
                            }}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-0.5 ml-auto cursor-pointer"
                          >
                            Move <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-[11px] text-slate-400 italic">
                    Drop items here
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
