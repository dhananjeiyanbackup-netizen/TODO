import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { app } from './firebase';
import { WORKSPACE_SCOPES, setCachedWorkspaceToken } from './googleTasks';

export const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach(scope => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  recurrence?: string[];
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'popup' | 'email';
      minutes: number;
    }>;
  };
  htmlLink?: string;
}

// Initialize auth state listener
export const initCalendarAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google to authorize Calendar access
export const googleSignInForCalendar = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google OAuth access token');
    }

    cachedAccessToken = credential.accessToken;
    setCachedWorkspaceToken(credential.accessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Calendar Sign-In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logoutCalendar = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  setCachedWorkspaceToken(null);
};

// Google Calendar API V3 Helpers
export const fetchGoogleCalendarEvents = async (token: string): Promise<CalendarEvent[]> => {
  const now = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&orderBy=startTime&singleEvents=true&maxResults=50`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Calendar API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.items || [];
};

// Create a Daily Recurring Reminder on Google Calendar
export const createDailyReminderOnGoogleCalendar = async (
  token: string,
  options: {
    title: string;
    description?: string;
    reminderTime: string; // HH:mm format e.g. "09:00"
    popupMinutesBefore?: number;
    emailMinutesBefore?: number;
  }
): Promise<CalendarEvent> => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  
  // Calculate start date-time for today at reminderTime
  const today = new Date();
  const [hours, minutes] = options.reminderTime.split(':').map(Number);
  
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours || 9, minutes || 0, 0);
  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // 30 minutes duration

  const overrides: Array<{ method: 'popup' | 'email'; minutes: number }> = [];
  if (options.popupMinutesBefore !== undefined) {
    overrides.push({ method: 'popup', minutes: options.popupMinutesBefore });
  }
  if (options.emailMinutesBefore !== undefined) {
    overrides.push({ method: 'email', minutes: options.emailMinutesBefore });
  }
  if (overrides.length === 0) {
    overrides.push({ method: 'popup', minutes: 15 });
  }

  const eventPayload: CalendarEvent = {
    summary: options.title || 'Daily Task & Work Review Reminder',
    description: options.description || 'Daily recurring task reminder created from Todo Work Dashboard.',
    start: {
      dateTime: startDate.toISOString(),
      timeZone
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone
    },
    recurrence: [
      'RRULE:FREQ=DAILY'
    ],
    reminders: {
      useDefault: false,
      overrides
    }
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create Daily Reminder on Google Calendar: ${errText}`);
  }

  return await response.json();
};

// Sync a single Task as a Google Calendar Event
export const syncTaskToGoogleCalendar = async (
  token: string,
  task: {
    title: string;
    description?: string;
    dueDate?: string;
    startDate?: string;
    reminderDate?: string;
  }
): Promise<CalendarEvent> => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const targetDateStr = task.dueDate || task.reminderDate || task.startDate || new Date().toISOString().split('T')[0];

  const startDate = new Date(`${targetDateStr}T09:00:00`);
  const endDate = new Date(`${targetDateStr}T09:30:00`);

  const eventPayload: CalendarEvent = {
    summary: `Task: ${task.title}`,
    description: task.description || 'Scheduled from Todo Work Dashboard',
    start: {
      dateTime: startDate.toISOString(),
      timeZone
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'popup', minutes: 10 }
      ]
    }
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to sync task to Google Calendar: ${errText}`);
  }

  return await response.json();
};
