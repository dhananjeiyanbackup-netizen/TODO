import React, { useState, useRef } from 'react';
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
  Share2,
  Upload,
  FolderOpen,
  Download,
  Eye,
  FileSpreadsheet,
  FileCode,
  FileImage,
  FileCheck,
  File,
  Check,
  ExternalLink,
  Sparkles,
  Tag,
  AlertCircle,
  Briefcase,
  CheckSquare
} from 'lucide-react';
import { Task, TaskStatus, Attachment } from '../types';
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
  onAddAttachment?: (taskId: string, attachment: Attachment) => void;
  onDeleteAttachment?: (taskId: string, attachmentId: string) => void;
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
  onAddFollowUpLog,
  onAddAttachment,
  onDeleteAttachment
}) => {
  if (!isOpen || !task) return null;

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DOCUMENTS' | 'TIMELINE' | 'CONTACT' | 'NOTES'>('OVERVIEW');
  const [newNoteInput, setNewNoteInput] = useState('');
  const [followUpLogInput, setFollowUpLogInput] = useState('');
  const [nextFollowUpInput, setNextFollowUpInput] = useState(task.contact?.nextFollowUpDate || getTodayFormatted());
  
  // Document attachments state
  const [documentTag, setDocumentTag] = useState<string>('Specification');
  const [previewFile, setPreviewFile] = useState<Attachment | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const attachmentsList = task.attachments || [];

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

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg(null);
    }, 3500);
  };

  // Attach a newly selected file or preset document
  const handleAttachFile = (fileName: string, fileSizeStr: string, fileType: string) => {
    if (!onAddAttachment) return;
    const today = getTodayFormatted();
    const newAtt: Attachment = {
      id: `att_${Date.now()}`,
      name: fileName,
      size: fileSizeStr,
      type: fileType,
      uploadedAt: today
    };
    onAddAttachment(task.id, newAtt);
    showNotification(`Associated document "${fileName}" with task ${task.id}`);
  };

  // Browser File Input Handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const sizeKb = (file.size / 1024).toFixed(0);
      const formattedSize = file.size >= 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;
      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

      handleAttachFile(file.name, formattedSize, ext);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper for document type icon
  const renderFileIcon = (fileType: string) => {
    const t = fileType.toUpperCase();
    if (t.includes('PDF')) return <FileText className="w-5 h-5 text-red-500" />;
    if (t.includes('XLS') || t.includes('CSV') || t.includes('SHEET')) return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    if (t.includes('PNG') || t.includes('JPG') || t.includes('IMG') || t.includes('JPEG')) return <FileImage className="w-5 h-5 text-purple-500" />;
    if (t.includes('DOC') || t.includes('WORD') || t.includes('TXT')) return <FileCheck className="w-5 h-5 text-blue-500" />;
    if (t.includes('ZIP') || t.includes('RAR') || t.includes('ARCHIVE')) return <FileCode className="w-5 h-5 text-amber-500" />;
    return <File className="w-5 h-5 text-indigo-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto relative">
        
        {/* Notification Toast */}
        {notificationMsg && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition-all">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{notificationMsg}</span>
          </div>
        )}

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
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-3 border-b-2 cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Overview & Details
          </button>

          <button
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`py-3 border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'DOCUMENTS'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
            <span>Documents & Attachments</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              attachmentsList.length > 0 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {attachmentsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`py-3 border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'TIMELINE'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
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
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
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
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Notes ({task.notes?.length || 0})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm custom-scrollbar">
          
          {/* TAB 1: OVERVIEW */}
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

              {/* Placement Info Card if applicable */}
              {task.placement && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2">
                  <h4 className="font-bold text-blue-900 dark:text-blue-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span>Placement & Drive Details</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div><span className="text-blue-700 dark:text-blue-400">Company:</span> <strong className="text-blue-950 dark:text-blue-100">{task.placement.companyName}</strong></div>
                    <div><span className="text-blue-700 dark:text-blue-400">HR Contact:</span> <strong className="text-blue-950 dark:text-blue-100">{task.placement.hrName || 'N/A'}</strong></div>
                    <div><span className="text-blue-700 dark:text-blue-400">Activity Type:</span> <strong className="text-blue-950 dark:text-blue-100">{task.placement.placementType}</strong></div>
                    <div><span className="text-blue-700 dark:text-blue-400">CTC Package:</span> <strong className="text-blue-950 dark:text-blue-100">{task.placement.ctcPackage || 'N/A'}</strong></div>
                    <div><span className="text-blue-700 dark:text-blue-400">Eligible Batches:</span> <strong className="text-blue-950 dark:text-blue-100">{task.placement.eligibleBranches || 'All'}</strong></div>
                    <div><span className="text-blue-700 dark:text-blue-400">Drive Date:</span> <strong className="text-blue-950 dark:text-blue-100">{task.placement.driveDate || 'N/A'}</strong></div>
                    {task.placement.contactPhone && <div><span className="text-blue-700 dark:text-blue-400 font-semibold">HR Phone:</span> <span className="font-mono text-blue-900 dark:text-blue-200">{task.placement.contactPhone}</span></div>}
                    {task.placement.contactEmail && <div><span className="text-blue-700 dark:text-blue-400 font-semibold">HR Email:</span> <span className="font-mono text-blue-900 dark:text-blue-200">{task.placement.contactEmail}</span></div>}
                    {task.placement.studentsShortlisted && <div><span className="text-blue-700 dark:text-blue-400 font-semibold">Shortlisted:</span> <span className="font-bold text-emerald-600 dark:text-emerald-400">{task.placement.studentsShortlisted}</span></div>}
                  </div>
                  {task.placement.remarks && (
                    <div className="pt-1 text-xs text-blue-900 dark:text-blue-200">
                      <span className="font-semibold text-blue-700 dark:text-blue-400">Drive Status / Remarks: </span>
                      {task.placement.remarks}
                    </div>
                  )}
                </div>
              )}

              {/* Google Workspace Auto-Sync Status Card */}
              {(task.googleSyncEmail || task.googleCalendarEventId || task.googleTaskId || task.googleCalendarLink) && (
                <div className="p-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 dark:from-slate-800/80 dark:via-indigo-950/30 dark:to-slate-800/80 border border-indigo-200 dark:border-indigo-800/60 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-indigo-950 dark:text-indigo-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Google Workspace Auto-Sync</span>
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                        Fixed & Synced
                      </span>
                    </h4>

                    {task.googleSyncEmail && (
                      <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        <Mail className="w-3 h-3 text-indigo-500" />
                        <span>{task.googleSyncEmail}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {task.googleCalendarEventId && (
                      <div className="flex items-center justify-between p-2 bg-white/80 dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">Google Calendar Event</span>
                        </div>
                        {task.googleCalendarLink ? (
                          <a
                            href={task.googleCalendarLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-semibold">Synced</span>
                        )}
                      </div>
                    )}

                    {task.googleTaskId && (
                      <div className="flex items-center justify-between p-2 bg-white/80 dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700">
                        <div className="flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-emerald-500" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">Google Tasks Item</span>
                        </div>
                        <span className="text-[11px] text-emerald-600 font-semibold">Synced</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Attachments Summary Widget */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                    <Paperclip className="w-4 h-4 text-indigo-500" />
                    <span>Project File Attachments ({attachmentsList.length})</span>
                  </h4>

                  <button
                    onClick={() => setActiveTab('DOCUMENTS')}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage / Attach Files</span>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {attachmentsList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {attachmentsList.slice(0, 4).map((att) => (
                      <div key={att.id} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                        <div className="flex items-center gap-2 min-w-0">
                          {renderFileIcon(att.type)}
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs truncate">{att.name}</span>
                            <span className="text-[10px] text-slate-400">{att.size} • {att.uploadedAt}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setPreviewFile(att)}
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded cursor-pointer"
                          title="Preview document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div 
                    onClick={() => setActiveTab('DOCUMENTS')}
                    className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                  >
                    <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No project documents associated yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click here to upload or attach specifications, spreadsheets, and blueprint files.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: DOCUMENTS & ATTACHMENTS (NEW PLACEHOLDER COMPONENT) */}
          {activeTab === 'DOCUMENTS' && (
            <div className="space-y-6">

              {/* Document Vault Info Banner */}
              <div className="p-4 bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 text-white rounded-2xl border border-indigo-800/80 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-600/60 rounded-xl">
                      <FolderOpen className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        <span>Project Document Association Vault</span>
                        <span className="px-2 py-0.5 bg-indigo-500/40 border border-indigo-400/40 text-[10px] font-mono rounded-md text-indigo-200">
                          {task.id}
                        </span>
                      </h3>
                      <p className="text-[11px] text-indigo-200">
                        Associate project specifications, financial budgets, blueprints, and meeting records with this task.
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" /> Firestore Synced
                  </span>
                </div>
              </div>

              {/* Upload Dropzone Placeholder Component */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                
                {/* Dropzone Area */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 border-2 border-dashed border-indigo-300 dark:border-indigo-800/80 hover:border-indigo-500 bg-white dark:bg-slate-800/80 rounded-2xl text-center cursor-pointer transition-all hover:shadow-md group space-y-2"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileInputChange} 
                    multiple 
                    className="hidden" 
                  />

                  <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100">
                      Click to browse or drag & drop project files here
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Supports PDF, DOCX, XLSX, PPTX, PNG, JPG, ZIP (Up to 25 MB)
                    </p>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Select Local File
                    </button>
                  </div>
                </div>

                {/* Preset Sample Document Associations */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-indigo-500" />
                      Quick Attach Sample Project Documents
                    </span>
                    <span className="text-[10px] text-slate-400">Click to attach test document</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleAttachFile(`Project_Specification_${task.id}.pdf`, '1.8 MB', 'PDF')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-500" />
                      <span>📄 Specification (.pdf)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAttachFile(`Budget_Analysis_2026.xlsx`, '940 KB', 'XLSX')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                      <span>📊 Budget Sheet (.xlsx)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAttachFile(`Blueprint_Design_v3.png`, '3.4 MB', 'PNG')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <FileImage className="w-3.5 h-3.5 text-purple-500" />
                      <span>🎨 Blueprint (.png)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAttachFile(`Meeting_Minutes_${getTodayFormatted()}.docx`, '450 KB', 'DOCX')}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-blue-500" />
                      <span>📝 Meeting Minutes (.docx)</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* List of Associated Documents */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span>Attached Project Files ({attachmentsList.length})</span>
                  </h4>
                  {attachmentsList.length > 0 && (
                    <span className="text-[11px] text-slate-400">
                      All files associated with task {task.id}
                    </span>
                  )}
                </div>

                {attachmentsList.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                    <FolderOpen className="w-10 h-10 mx-auto text-slate-400" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      No documents currently associated
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Use the upload box or sample buttons above to attach project files.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {attachmentsList.map((att) => (
                      <div 
                        key={att.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 hover:border-indigo-300 shadow-2xs gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 shrink-0">
                            {renderFileIcon(att.type)}
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                                {att.name}
                              </span>
                              <span className="px-2 py-0.2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-mono font-bold rounded-md uppercase">
                                {att.type}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              <span>Size: <strong>{att.size}</strong></span>
                              <span>•</span>
                              <span>Uploaded: <strong>{att.uploadedAt}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* File Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-700/60">
                          <button
                            type="button"
                            onClick={() => setPreviewFile(att)}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Preview Document"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Preview</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => showNotification(`Simulated download of ${att.name}`)}
                            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Download File"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>

                          {onDeleteAttachment && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Remove attachment "${att.name}"?`)) {
                                  onDeleteAttachment(task.id, att.id);
                                  showNotification(`Removed document "${att.name}"`);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-xl cursor-pointer"
                              title="Delete Attachment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cloud Storage integration footer note */}
              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-center gap-2 text-amber-900 dark:text-amber-200 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Document Attachment Note:</strong> Files linked here are stored with task records in Firestore. Firebase Cloud Storage bucket storage handles full binary uploads.
                </span>
              </div>

            </div>
          )}

          {/* TAB 3: TIMELINE */}
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

          {/* TAB 4: CONTACT */}
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

          {/* TAB 5: NOTES */}
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

      {/* Document Preview Overlay Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {renderFileIcon(previewFile.type)}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{previewFile.name}</h3>
                  <span className="text-[10px] text-slate-400">{previewFile.size} • Uploaded {previewFile.uploadedAt}</span>
                </div>
              </div>
              <button 
                onClick={() => setPreviewFile(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                {renderFileIcon(previewFile.type)}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Project Document Preview
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Associated with Task <strong className="text-indigo-600 dark:text-indigo-400">{task.id}</strong> ({task.title}).
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border text-left text-[11px] text-slate-600 dark:text-slate-300 font-mono space-y-1">
                <div>Document Name: {previewFile.name}</div>
                <div>Task Category: {task.category}</div>
                <div>Status: Firestore Linked</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  showNotification(`Simulated download of ${previewFile.name}`);
                  setPreviewFile(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download File
              </button>
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
