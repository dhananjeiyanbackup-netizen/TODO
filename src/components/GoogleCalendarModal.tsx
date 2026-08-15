import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  Bell, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  LogOut, 
  Sparkles,
  AlertCircle,
  ListTodo,
  CalendarCheck,
  Building2,
  Users,
  Briefcase,
  Layers
} from 'lucide-react';
import { 
  googleSignInForCalendar, 
  getCachedAccessToken, 
  logoutCalendar, 
  initCalendarAuth,
  createDailyReminderOnGoogleCalendar, 
  syncTaskToGoogleCalendar,
  fetchGoogleCalendarEvents,
  CalendarEvent 
} from '../lib/googleCalendar';
import { Task } from '../types';
import { getPriorityBadgeStyle } from '../utils/taskUtils';

interface GoogleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks?: Task[];
}

export const GoogleCalendarModal: React.FC<GoogleCalendarModalProps> = ({
  isOpen,
  onClose,
  tasks = []
}) => {
  const [token, setToken] = useState<string | null>(getCachedAccessToken());
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSubmittingReminder, setIsSubmittingReminder] = useState(false);
  const [isSchedulingExactEvent, setIsSchedulingExactEvent] = useState(false);

  // Unfinished Task selection
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [reminderTitle, setReminderTitle] = useState('Daily Task & Work Review');
  const [reminderDescription, setReminderDescription] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [popupMinutes, setPopupMinutes] = useState(15);
  const [sendEmail, setSendEmail] = useState(true);
  const [scheduleMode, setScheduleMode] = useState<'DAILY_REMINDER' | 'EXACT_EVENT'>('DAILY_REMINDER');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdEventLink, setCreatedEventLink] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Filter unfinished tasks
  const unfinishedTasks = tasks.filter(t => t && t.status !== 'COMPLETED' && !t.isArchived);
  const selectedTask = unfinishedTasks.find(t => t.id === selectedTaskId);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = initCalendarAuth(
      (user, tok) => {
        setToken(tok);
        setUserEmail(user.email);
        loadEvents(tok);
      },
      () => {
        setToken(null);
        setUserEmail(null);
      }
    );
    return () => unsub();
  }, [isOpen]);

  // When selected task changes from dropdown, prefill reminder fields
  const handleSelectUnfinishedTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    if (!taskId) {
      setReminderTitle('Daily Task & Work Review');
      setReminderDescription('Daily recurring task reminder created from Todo Work Dashboard.');
      return;
    }

    const task = unfinishedTasks.find(t => t.id === taskId);
    if (task) {
      setReminderTitle(`[Pending Task] ${task.title}`);
      
      const descLines = [
        `Task ID: ${task.id}`,
        `Status: ${task.status} | Priority: ${task.priority}`,
        `Category: ${task.category} > ${task.subcategory || 'General'}`,
        task.assignedTo ? `Assigned To: ${task.assignedTo}` : '',
        task.dueDate ? `Due Date: ${task.dueDate}` : '',
        task.description ? `\nDetails: ${task.description}` : ''
      ];

      if (task.contact?.personName) {
        descLines.push(`\nFollow-up Contact: ${task.contact.personName} (${task.contact.phone || task.contact.email || ''})`);
      }
      if (task.placement?.companyName) {
        descLines.push(`\nPlacement Drive: ${task.placement.companyName} | HR: ${task.placement.hrName || 'N/A'} | Package: ${task.placement.ctcPackage || 'N/A'}`);
      }

      setReminderDescription(descLines.filter(Boolean).join('\n'));
      if (task.dueDate) {
        setScheduledDate(task.dueDate);
      }
    }
  };

  const loadEvents = async (authToken: string) => {
    setIsLoadingEvents(true);
    try {
      const fetched = await fetchGoogleCalendarEvents(authToken);
      setEvents(fetched);
    } catch (err: any) {
      console.error('Error fetching calendar events:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      const res = await googleSignInForCalendar();
      if (res) {
        setToken(res.accessToken);
        setUserEmail(res.user.email);
        setSuccessMessage('Successfully connected to Google Calendar & Google Tasks!');
        await loadEvents(res.accessToken);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to authorize Google Workspace.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogout = async () => {
    await logoutCalendar();
    setToken(null);
    setUserEmail(null);
    setEvents([]);
    setSuccessMessage('Disconnected from Google Account.');
  };

  // Schedule as Daily Recurring Reminder
  const handleCreateDailyReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMessage('Please connect your Google Account first.');
      return;
    }

    setIsSubmittingReminder(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setCreatedEventLink(null);

    try {
      const created = await createDailyReminderOnGoogleCalendar(token, {
        title: reminderTitle,
        description: reminderDescription || 'Daily automated reminder scheduled from Todo Work Dashboard.',
        reminderTime: reminderTime,
        popupMinutesBefore: popupMinutes,
        emailMinutesBefore: sendEmail ? 30 : undefined
      });

      setSuccessMessage(`Daily Reminder "${created.summary}" created on your Google Calendar!`);
      if (created.htmlLink) {
        setCreatedEventLink(created.htmlLink);
      }
      await loadEvents(token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create reminder on Google Calendar.');
    } finally {
      setIsSubmittingReminder(false);
    }
  };

  // Schedule as Specific Event on Google Calendar
  const handleScheduleSpecificTask = async () => {
    if (!token) {
      setErrorMessage('Please connect your Google Account first.');
      return;
    }

    setIsSchedulingExactEvent(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setCreatedEventLink(null);

    try {
      const created = await syncTaskToGoogleCalendar(token, {
        title: reminderTitle.replace(/^\[Pending Task\]\s*/, ''),
        description: reminderDescription,
        dueDate: scheduledDate
      });

      setSuccessMessage(`Task event scheduled on Google Calendar for ${scheduledDate}!`);
      if (created.htmlLink) {
        setCreatedEventLink(created.htmlLink);
      }
      await loadEvents(token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to schedule task event on Google Calendar.');
    } finally {
      setIsSchedulingExactEvent(false);
    }
  };

  // Quick 1-click schedule for any task in list
  const handleQuickScheduleTask = async (task: Task) => {
    if (!token) {
      setErrorMessage('Please sign in with Google first.');
      return;
    }

    try {
      const created = await syncTaskToGoogleCalendar(token, {
        title: task.title,
        description: `Priority: ${task.priority} | Category: ${task.category} > ${task.subcategory || ''}\n${task.description || ''}`,
        dueDate: task.dueDate
      });

      setSuccessMessage(`Task "${task.title}" fixed to Google Calendar on ${task.dueDate}!`);
      if (created.htmlLink) {
        setCreatedEventLink(created.htmlLink);
      }
      await loadEvents(token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sync task.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Google Calendar Integration
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">Live Sync</span>
              </h2>
              <p className="text-xs text-blue-100">
                Fix unfinished tasks to Google Calendar and set up daily recurring work reminders.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* Messages */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800/80 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800/80 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{successMessage}</span>
              </div>
              {createdEventLink && (
                <a
                  href={createdEventLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 underline font-medium hover:text-emerald-900 text-xs ml-6"
                >
                  View Event in Google Calendar <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Authentication Box */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${token ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600'}`}>
                  {token ? <CheckCircle2 className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {token ? 'Connected to Google Account' : 'Connect Google Account'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {token ? (userEmail || 'Account Authorized (Calendar & Tasks Scopes)') : 'Authorize to schedule daily reminders and sync tasks to Calendar'}
                  </p>
                </div>
              </div>

              {token ? (
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Disconnect
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl shadow-sm font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
                >
                  {isConnecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.23v3.15C3.21 21.32 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.23C.44 8.18 0 9.99 0 12s.44 3.82 1.23 5.39l4.05-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.21 2.68 1.23 6.61l4.05 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
                    </svg>
                  )}
                  {isConnecting ? 'Connecting...' : 'Sign in with Google'}
                </button>
              )}
            </div>
          </div>

          {/* Daily Reminder & Fix Unfinished Task Section */}
          <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Create Daily Reminder & Fix Tasks to Google Calendar
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pick an unfinished task from the dropdown to automatically prefill reminder details.
                  </p>
                </div>
              </div>

              {/* Schedule Mode Selector */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-indigo-200 dark:border-indigo-800/80 text-xs">
                <button
                  type="button"
                  onClick={() => setScheduleMode('DAILY_REMINDER')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    scheduleMode === 'DAILY_REMINDER'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600'
                  }`}
                >
                  Daily Reminder
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleMode('EXACT_EVENT')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    scheduleMode === 'EXACT_EVENT'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600'
                  }`}
                >
                  Specific Date Event
                </button>
              </div>
            </div>

            {/* Unfinished Task Dropdown (Requirement Highlight) */}
            <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-indigo-600" />
                  Select Unfinished Task to Fix / Remind ({unfinishedTasks.length} pending tasks)
                </label>
                {selectedTaskId && (
                  <button
                    type="button"
                    onClick={() => handleSelectUnfinishedTask('')}
                    className="text-[11px] text-red-500 hover:underline cursor-pointer"
                  >
                    Clear Task Link
                  </button>
                )}
              </div>

              <select
                value={selectedTaskId}
                onChange={(e) => handleSelectUnfinishedTask(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Choose an Unfinished Task (or create custom reminder) --</option>
                {unfinishedTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.priority}] {t.title} — Due: {t.dueDate} ({t.category} / {t.subcategory || 'General'})
                  </option>
                ))}
              </select>

              {/* Selected Task Details Chip */}
              {selectedTask && (
                <div className="p-2.5 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-lg border border-indigo-200/80 dark:border-indigo-800/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {selectedTask.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getPriorityBadgeStyle(selectedTask.priority)}`}>
                      {selectedTask.priority}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-2">
                    <span>Due: <strong>{selectedTask.dueDate}</strong></span>
                    <span>• Category: <strong>{selectedTask.category}</strong></span>
                    {selectedTask.assignedTo && <span>• Assigned: <strong>{selectedTask.assignedTo}</strong></span>}
                    {selectedTask.placement?.companyName && (
                      <span className="text-blue-600 font-bold">• Drive: {selectedTask.placement.companyName}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleCreateDailyReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event / Reminder Title
                </label>
                <input
                  type="text"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  placeholder="e.g. Daily Standup & Work Task Review"
                  required
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Task Notes (Synced to Google Calendar)
                </label>
                <textarea
                  value={reminderDescription}
                  onChange={(e) => setReminderDescription(e.target.value)}
                  rows={3}
                  placeholder="Details of the task to be reviewed..."
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {scheduleMode === 'EXACT_EVENT' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" /> Event Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" /> Time (HH:MM)
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-indigo-500" /> Notification Popup
                  </label>
                  <select
                    value={popupMinutes}
                    onChange={(e) => setPopupMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={5}>5 minutes before</option>
                    <option value={10}>10 minutes before</option>
                    <option value={15}>15 minutes before</option>
                    <option value={30}>30 minutes before</option>
                    <option value={60}>1 hour before</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="sendEmail" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  Send email reminder notification 30 minutes before
                </label>
              </div>

              {scheduleMode === 'DAILY_REMINDER' ? (
                <button
                  type="submit"
                  disabled={isSubmittingReminder || !token}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    !token 
                      ? 'bg-slate-400 cursor-not-allowed opacity-60' 
                      : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99]'
                  }`}
                >
                  {isSubmittingReminder ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Scheduling Daily Reminder...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="w-4 h-4" /> Schedule Daily Reminder on Google Calendar
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleScheduleSpecificTask}
                  disabled={isSchedulingExactEvent || !token}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    !token 
                      ? 'bg-slate-400 cursor-not-allowed opacity-60' 
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99]'
                  }`}
                >
                  {isSchedulingExactEvent ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Fixing Task Event to Calendar...
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="w-4 h-4" /> Fix Task Event to Google Calendar ({scheduledDate})
                    </>
                  )}
                </button>
              )}
            </form>
          </div>

          {/* Quick Fix Unfinished Tasks Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <ListTodo className="w-4 h-4 text-blue-600" />
                Unfinished Tasks Quick Sync Table
              </h4>
              <span className="text-[11px] text-slate-500">
                {unfinishedTasks.length} pending
              </span>
            </div>

            {unfinishedTasks.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                All tasks are currently completed!
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {unfinishedTasks.slice(0, 6).map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs hover:border-indigo-400 transition-colors"
                  >
                    <div className="space-y-0.5 max-w-[70%]">
                      <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${getPriorityBadgeStyle(t.priority)}`}>
                          {t.priority}
                        </span>
                        <span>Due: <strong>{t.dueDate}</strong></span>
                        <span>• {t.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectUnfinishedTask(t.id)}
                        className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-lg text-[11px] font-bold border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                      >
                        Select in Form
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickScheduleTask(t)}
                        disabled={!token}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-[11px] font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                        title="1-Click Fix to Calendar"
                      >
                        <CalendarCheck className="w-3 h-3" /> Fix to Cal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Google Calendar Synced Events List */}
          {token && (
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Upcoming Google Calendar Events
                </h4>
                <button
                  onClick={() => loadEvents(token)}
                  disabled={isLoadingEvents}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingEvents ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>

              {isLoadingEvents ? (
                <div className="p-4 text-center text-xs text-slate-400">Loading Calendar events...</div>
              ) : events.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  No upcoming events found on primary calendar.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {events.slice(0, 8).map((evt) => (
                    <div 
                      key={evt.id}
                      className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {evt.recurrence ? (
                            <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] rounded font-bold">
                              Daily
                            </span>
                          ) : null}
                          {evt.summary}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {evt.start.dateTime 
                              ? new Date(evt.start.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                              : evt.start.date}
                          </span>
                        </div>
                      </div>
                      {evt.htmlLink && (
                        <a
                          href={evt.htmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          title="Open in Google Calendar"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
