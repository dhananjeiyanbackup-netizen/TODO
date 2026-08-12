import React, { useState } from 'react';
import { 
  X, 
  Edit3, 
  Trash2, 
  Copy, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  Lightbulb, 
  Paperclip, 
  Plus, 
  CheckCircle2, 
  RotateCcw,
  MessageSquare,
  History,
  FileText,
  Share2
} from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { 
  getCategoryBadgeStyle, 
  getPriorityBadgeStyle, 
  getStatusBadgeStyle,
  getTodayFormatted 
} from '../utils/taskUtils';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDuplicate: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onAddNote: (taskId: string, note: string) => void;
  onAddFollowUpLog: (taskId: string, logNote: string, nextDate?: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onUpdateStatus,
  onAddNote,
  onAddFollowUpLog
}) => {
  if (!isOpen || !task) return null;

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMELINE' | 'CONTACT' | 'NOTES'>('OVERVIEW');
  const [newNoteInput, setNewNoteInput] = useState('');
  const [followUpLogInput, setFollowUpLogInput] = useState('');
  const [nextFollowUpInput, setNextFollowUpInput] = useState(task.contact?.nextFollowUpDate || getTodayFormatted());

  const handleAddNote = () => {
    if (newNoteInput.trim()) {
      onAddNote(task.id, newNoteInput.trim());
      setNewNoteInput('');
    }
  };

  const handleLogContact = () => {
    if (followUpLogInput.trim()) {
      onAddFollowUpLog(task.id, followUpLogInput.trim(), nextFollowUpInput);
      setFollowUpLogInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                {task.id}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${getPriorityBadgeStyle(task.priority)}`}>
                {task.priority}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getCategoryBadgeStyle(task.category)}`}>
                {task.subcategory}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {task.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDuplicate(task)}
              title="Duplicate Task"
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(task)}
              title="Edit Task"
              className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${task.id}?`)) {
                  onDelete(task.id);
                  onClose();
                }
              }}
              title="Delete Task"
              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 text-xs font-semibold bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-3 border-b-2 cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Overview & Details
          </button>

          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`py-3 border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'TIMELINE'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Activity History ({task.activityLogs.length})
          </button>

          {(task.contact || task.followUpRequired) && (
            <button
              onClick={() => setActiveTab('CONTACT')}
              className={`py-3 border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'CONTACT'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              Follow-up & Person
            </button>
          )}

          <button
            onClick={() => setActiveTab('NOTES')}
            className={`py-3 border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'NOTES'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Notes ({task.notes?.length || 0})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm custom-scrollbar">
          
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              
              {/* Description */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </h4>
                <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-medium">
                  {task.description || 'No detailed description provided.'}
                </p>
              </div>

              {/* Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Current Status</span>
                  <span className={`inline-block mt-0.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusBadgeStyle(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {task.status !== 'COMPLETED' && (
                    <button
                      onClick={() => onUpdateStatus(task.id, 'COMPLETED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Completed
                    </button>
                  )}
                  {task.status === 'COMPLETED' && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Completed on {task.completionDate || 'N/A'}
                    </span>
                  )}
                </div>
              </div>

              {/* Key Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold block">Due Date</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{task.dueDate || 'N/A'}</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold block">Assigned To</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{task.assignedTo || 'Unassigned'}</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold block">Estimated Time</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{task.estimatedTimeHours || 0} Hours</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold block">Created Date</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{task.createdDate}</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold block">Recurrence</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{task.recurrence || 'None'}</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold block">Related Organization</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{task.relatedOrganization || 'N/A'}</span>
                </div>
              </div>

              {/* Innovation Info Card if applicable */}
              {task.innovation && task.innovation.eventName && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-xs uppercase tracking-wider">
                    🏆 Innovation Hub Activity
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div><span className="text-emerald-700 dark:text-emerald-400">Event:</span> <strong className="text-emerald-950 dark:text-emerald-100">{task.innovation.eventName}</strong></div>
                    <div><span className="text-emerald-700 dark:text-emerald-400">Team:</span> <strong className="text-emerald-950 dark:text-emerald-100">{task.innovation.studentOrTeam}</strong></div>
                    <div><span className="text-emerald-700 dark:text-emerald-400">Level:</span> <strong className="text-emerald-950 dark:text-emerald-100">{task.innovation.level}</strong></div>
                    <div><span className="text-emerald-700 dark:text-emerald-400">Result:</span> <strong className="text-emerald-950 dark:text-emerald-100">{task.innovation.result}</strong></div>
                    <div><span className="text-emerald-700 dark:text-emerald-400">Certificate:</span> <strong className="text-emerald-950 dark:text-emerald-100">{task.innovation.certificateStatus}</strong></div>
                    <div><span className="text-emerald-700 dark:text-emerald-400">Prize:</span> <strong className="text-emerald-950 dark:text-emerald-100">{task.innovation.prize || 'N/A'}</strong></div>
                  </div>
                </div>
              )}

              {/* Attachments Section */}
              {task.attachments && task.attachments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Attachments ({task.attachments.length})
                  </h4>
                  <div className="space-y-2">
                    {task.attachments.map((att) => (
                      <div key={att.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-indigo-500" />
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">{att.name}</span>
                            <span className="text-[10px] text-slate-400">{att.size} • Uploaded {att.uploadedAt}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => alert(`Simulated downloading ${att.name}`)}
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {activeTab === 'TIMELINE' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Activity & Lifecycle History
              </h4>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {task.activityLogs.map((log) => (
                  <div key={log.id} className="relative group">
                    <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900" />
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">{log.action}</span>
                        <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{log.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'CONTACT' && task.contact && (
            <div className="space-y-6">
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl space-y-3">
                <h4 className="font-bold text-purple-900 dark:text-purple-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-purple-600" /> Contact Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div><span className="text-purple-700 dark:text-purple-400">Person Name:</span> <strong className="text-purple-950 dark:text-purple-100">{task.contact.personName}</strong></div>
                  <div><span className="text-purple-700 dark:text-purple-400">Department / Org:</span> <strong className="text-purple-950 dark:text-purple-100">{task.contact.departmentOrOrg}</strong></div>
                  <div><span className="text-purple-700 dark:text-purple-400">Contact Method:</span> <strong className="text-purple-950 dark:text-purple-100">{task.contact.contactType}</strong></div>
                  <div><span className="text-purple-700 dark:text-purple-400">Phone:</span> <strong className="text-purple-950 dark:text-purple-100">{task.contact.phone || 'N/A'}</strong></div>
                  <div><span className="text-purple-700 dark:text-purple-400">Email:</span> <strong className="text-purple-950 dark:text-purple-100">{task.contact.email || 'N/A'}</strong></div>
                  <div><span className="text-purple-700 dark:text-purple-400">Next Follow-up Date:</span> <strong className="text-purple-950 dark:text-purple-100 font-bold">{task.contact.nextFollowUpDate || 'N/A'}</strong></div>
                </div>
              </div>

              {/* Log Follow-up Activity */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  Log New Contact / Reschedule Follow-up
                </h4>
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={followUpLogInput}
                    onChange={(e) => setFollowUpLogInput(e.target.value)}
                    placeholder="Enter summary of contact conversation or response received..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 font-medium">Set Next Follow-up Date:</span>
                      <input
                        type="date"
                        value={nextFollowUpInput}
                        onChange={(e) => setNextFollowUpInput(e.target.value)}
                        className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <button
                      onClick={handleLogContact}
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Log Follow-up
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'NOTES' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNoteInput}
                  onChange={(e) => setNewNoteInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNote(); } }}
                  placeholder="Type a new note or checkpoint..."
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Add Note
                </button>
              </div>

              {task.notes && task.notes.length > 0 ? (
                <div className="space-y-2">
                  {task.notes.map((note, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200">
                      • {note}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No notes added yet.</p>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
