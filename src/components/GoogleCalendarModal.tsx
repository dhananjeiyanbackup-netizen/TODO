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
  Check,
  AlertCircle
} from 'lucide-react';
import { 
  googleSignInForCalendar, 
  getCachedAccessToken, 
  logoutCalendar, 
  initCalendarAuth,
  createDailyReminderOnGoogleCalendar, 
  fetchGoogleCalendarEvents,
  CalendarEvent 
} from '../lib/googleCalendar';
import { Task } from '../types';

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
  const [reminderTitle, setReminderTitle] = useState('Daily Task & Work Review');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [popupMinutes, setPopupMinutes] = useState(15);
  const [sendEmail, setSendEmail] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdEventLink, setCreatedEventLink] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

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
        setSuccessMessage('Successfully connected to Google Calendar!');
        await loadEvents(res.accessToken);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to authorize Google Calendar.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogout = async () => {
    await logoutCalendar();
    setToken(null);
    setUserEmail(null);
    setEvents([]);
    setSuccessMessage('Disconnected from Google Calendar.');
  };

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
        description: 'Daily automated reminder scheduled from Todo Work Dashboard.',
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-8">
        
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
                Connect your account and create recurring daily reminders on Google Calendar.
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

          {/* Step 1: Authentication Box */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${token ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600'}`}>
                  {token ? <CheckCircle2 className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {token ? 'Connected to Google Calendar' : 'Connect Google Account'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {token ? (userEmail || 'Account Authorized') : 'Authorize to schedule daily reminders and sync tasks'}
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

          {/* Step 2: Daily Reminder Form */}
          <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Create Daily Reminder Event
              </h3>
            </div>

            <form onSubmit={handleCreateDailyReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reminder Title
                </label>
                <input
                  type="text"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  placeholder="e.g. Daily Standup & Work Task Review"
                  required
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" /> Daily Time
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-indigo-500" /> Notification Popup
                  </label>
                  <select
                    value={popupMinutes}
                    onChange={(e) => setPopupMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="sendEmail" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  Send email notification 30 minutes before
                </label>
              </div>

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
            </form>
          </div>

          {/* Step 3: Google Calendar Synced Events List */}
          {token && (
            <div className="space-y-3">
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
