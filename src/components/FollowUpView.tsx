import React, { useState } from 'react';
import { 
  Users, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Plus, 
  MessageSquare, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { getTodayFormatted, getTomorrowFormatted } from '../utils/taskUtils';

interface FollowUpViewProps {
  tasks?: Task[];
  onSelectTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onQuickAdd: (categoryPreset?: string) => void;
  onAddFollowUpLog: (taskId: string, logNote: string, nextDate?: string) => void;
}

export const FollowUpView: React.FC<FollowUpViewProps> = ({
  tasks = [],
  onSelectTask,
  onUpdateStatus,
  onQuickAdd,
  onAddFollowUpLog
}) => {
  const today = getTodayFormatted();
  const tomorrow = getTomorrowFormatted();

  const safeTasks = tasks || [];
  const followUpTasks = safeTasks.filter(t => t && (t.followUpRequired || t.category === 'FOLLOW_UPS' || t.contact));

  const dueToday = followUpTasks.filter(t => t.contact?.nextFollowUpDate === today && t.status !== 'COMPLETED');
  const dueTomorrow = followUpTasks.filter(t => t.contact?.nextFollowUpDate === tomorrow && t.status !== 'COMPLETED');
  const overdue = followUpTasks.filter(t => t.contact?.nextFollowUpDate && t.contact.nextFollowUpDate < today && t.status !== 'COMPLETED');
  const upcoming = followUpTasks.filter(t => t.contact?.nextFollowUpDate && t.contact.nextFollowUpDate > tomorrow && t.status !== 'COMPLETED');
  const completed = followUpTasks.filter(t => t.status === 'COMPLETED');

  // Interactive Reschedule or Log Contact state
  const [activeRescheduleId, setActiveRescheduleId] = useState<string | null>(null);
  const [newFollowUpDate, setNewFollowUpDate] = useState<string>(today);
  const [logNoteText, setLogNoteText] = useState<string>('');

  const handleExecuteFollowUp = (task: Task) => {
    const note = logNoteText.trim() || 'Contacted person and logged progress.';
    onAddFollowUpLog(task.id, note, newFollowUpDate);
    setActiveRescheduleId(null);
    setLogNoteText('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Follow-up Management Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track communication and pending follow-ups with HODs, faculty, students, companies, and external agencies.
          </p>
        </div>

        <button
          onClick={() => onQuickAdd('FOLLOW_UPS')}
          className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Follow-up</span>
        </button>
      </div>

      {/* Summary Pills Grid (Section 9) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block">Due Today</span>
          <span className="text-2xl font-black text-amber-900 dark:text-amber-100">{dueToday.length}</span>
          <p className="text-[10px] text-amber-600 font-medium">Needs contact today</p>
        </div>

        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 block">Due Tomorrow</span>
          <span className="text-2xl font-black text-blue-900 dark:text-blue-100">{dueTomorrow.length}</span>
          <p className="text-[10px] text-blue-600 font-medium">Scheduled tomorrow</p>
        </div>

        <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl">
          <span className="text-xs font-bold text-red-700 dark:text-red-300 block">Overdue</span>
          <span className="text-2xl font-black text-red-900 dark:text-red-100">{overdue.length}</span>
          <p className="text-[10px] text-red-600 font-bold">Passed follow-up date</p>
        </div>

        <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl">
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 block">Upcoming</span>
          <span className="text-2xl font-black text-indigo-900 dark:text-indigo-100">{upcoming.length}</span>
          <p className="text-[10px] text-indigo-600 font-medium">Future dates</p>
        </div>

        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block">Completed</span>
          <span className="text-2xl font-black text-emerald-900 dark:text-emerald-100">{completed.length}</span>
          <p className="text-[10px] text-emerald-600 font-medium">Resolved follow-ups</p>
        </div>
      </div>

      {/* Follow-up Master Table (Section 9) */}
      <section className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-purple-600" />
          Active Follow-up Log Table
        </h2>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3">Person & Dept</th>
                <th className="py-3 px-3">Related Task</th>
                <th className="py-3 px-3">Last Contact</th>
                <th className="py-3 px-3">Next Follow-up</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Notes</th>
                <th className="py-3 px-3 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {followUpTasks.map((task) => {
                const c = task.contact;
                const isExpanded = activeRescheduleId === task.id;

                return (
                  <React.Fragment key={task.id}>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {c?.personName || 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {c?.departmentOrOrg} • {c?.contactType}
                        </div>
                      </td>

                      <td 
                        onClick={() => onSelectTask(task)}
                        className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 hover:text-purple-600 cursor-pointer max-w-[200px] truncate"
                      >
                        {task.title}
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {c?.lastContactedDate || task.createdDate}
                      </td>

                      <td className="py-3 px-3 font-bold text-purple-700 dark:text-purple-300">
                        {c?.nextFollowUpDate || task.dueDate}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          task.status === 'COMPLETED' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}>
                          {task.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 max-w-[180px] truncate">
                        {c?.notes || task.description}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setActiveRescheduleId(isExpanded ? null : task.id);
                              setNewFollowUpDate(c?.nextFollowUpDate || today);
                            }}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] rounded-lg cursor-pointer shadow-xs"
                          >
                            Followed Up
                          </button>
                          {task.status !== 'COMPLETED' && (
                            <button
                              onClick={() => onUpdateStatus(task.id, 'COMPLETED')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg cursor-pointer"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Reschedule / Log Inline Panel */}
                    {isExpanded && (
                      <tr className="bg-purple-50/60 dark:bg-purple-950/30">
                        <td colSpan={7} className="p-4">
                          <div className="space-y-2 max-w-2xl">
                            <h4 className="font-bold text-purple-900 dark:text-purple-200 text-xs">
                              Log Contact Result & Reschedule Next Follow-up for: {c?.personName || task.title}
                            </h4>
                            <input
                              type="text"
                              value={logNoteText}
                              onChange={(e) => setLogNoteText(e.target.value)}
                              placeholder="Describe conversation, update, or response received..."
                              className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 rounded-xl text-xs"
                            />
                            <div className="flex items-center justify-between gap-2 pt-1">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-semibold text-purple-900 dark:text-purple-200">Next Follow-up Date:</span>
                                <input
                                  type="date"
                                  value={newFollowUpDate}
                                  onChange={(e) => setNewFollowUpDate(e.target.value)}
                                  className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 rounded-lg text-xs font-bold"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setActiveRescheduleId(null)}
                                  className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleExecuteFollowUp(task)}
                                  className="px-4 py-1 bg-purple-600 text-white font-bold rounded-lg text-xs"
                                >
                                  Save Follow-up Entry
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};
