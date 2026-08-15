import { getAuth, User } from 'firebase/auth';
import { app } from './firebase';
import { 
  googleSignInForWorkspace, 
  getCachedWorkspaceToken, 
  setCachedWorkspaceToken,
  createGoogleTask,
  GoogleTask 
} from './googleTasks';
import { 
  syncTaskToGoogleCalendar, 
  CalendarEvent 
} from './googleCalendar';
import { Task } from '../types';

const auth = getAuth(app);

export interface AutoSyncResult {
  success: boolean;
  userEmail: string | null;
  calendarEvent?: CalendarEvent | null;
  googleTask?: GoogleTask | null;
  error?: string | null;
}

/**
 * Gets the current authenticated Google user details
 */
export const getCurrentGoogleAccount = (): { user: User | null; email: string | null; token: string | null } => {
  const user = auth.currentUser;
  const token = getCachedWorkspaceToken();
  return {
    user,
    email: user?.email || null,
    token
  };
};

/**
 * Automatically fixes a task to Google Calendar and Google Tasks tied to the user's mail ID
 */
export const autoFixTaskToGoogleWorkspace = async (
  task: Task,
  options: {
    syncCalendar?: boolean;
    syncTasks?: boolean;
    requireAuthPrompt?: boolean;
  } = {
    syncCalendar: true,
    syncTasks: true,
    requireAuthPrompt: false
  }
): Promise<AutoSyncResult> => {
  let token = getCachedWorkspaceToken();
  let user = auth.currentUser;

  // If not authenticated and interactive prompt is allowed
  if (!token && options.requireAuthPrompt) {
    try {
      const authRes = await googleSignInForWorkspace();
      if (authRes) {
        token = authRes.accessToken;
        user = authRes.user;
      }
    } catch (err: any) {
      console.warn('Google Workspace sign-in cancelled or failed:', err);
      return {
        success: false,
        userEmail: null,
        error: err.message || 'Google sign-in required to fix to Calendar and Tasks.'
      };
    }
  }

  if (!token) {
    return {
      success: false,
      userEmail: user?.email || null,
      error: 'Google account is not connected. Please connect Google Account to auto-fix to Google Calendar and Tasks.'
    };
  }

  const email = user?.email || 'Authorized Google Account';
  let createdCalendarEvent: CalendarEvent | null = null;
  let createdGoogleTask: GoogleTask | null = null;
  const errors: string[] = [];

  // 1. Sync to Google Calendar
  if (options.syncCalendar !== false) {
    try {
      const descLines: string[] = [];
      if (task.description) descLines.push(task.description);
      descLines.push(`• Priority: ${task.priority} | Status: ${task.status}`);
      descLines.push(`• Category: ${task.category} > ${task.subcategory || 'General'}`);
      if (task.assignedTo) descLines.push(`• Assigned: ${task.assignedTo}`);
      if (task.contact?.personName) {
        descLines.push(`• Follow-up: ${task.contact.personName} (${task.contact.phone || task.contact.email || ''})`);
      }
      if (task.placement?.companyName) {
        descLines.push(`• Placement Drive: ${task.placement.companyName} (HR: ${task.placement.hrName || 'N/A'})`);
      }

      createdCalendarEvent = await syncTaskToGoogleCalendar(token, {
        title: task.title,
        description: descLines.join('\n'),
        dueDate: task.dueDate,
        startDate: task.startDate,
        reminderDate: task.reminderDate
      });
    } catch (err: any) {
      console.error('Error auto-syncing to Google Calendar:', err);
      errors.push(`Calendar: ${err.message || 'Failed to fix to Calendar'}`);
    }
  }

  // 2. Sync to Google Tasks
  if (options.syncTasks !== false) {
    try {
      const notesParts: string[] = [];
      if (task.description) notesParts.push(task.description);
      notesParts.push(`Category: ${task.category} > ${task.subcategory || 'General'}`);
      notesParts.push(`Priority: ${task.priority} | Due: ${task.dueDate}`);
      if (task.assignedTo) notesParts.push(`Assigned: ${task.assignedTo}`);
      if (task.contact?.personName) notesParts.push(`Contact: ${task.contact.personName} (${task.contact.phone || task.contact.email || ''})`);
      if (task.placement?.companyName) notesParts.push(`Drive: ${task.placement.companyName} (${task.placement.ctcPackage || ''})`);

      createdGoogleTask = await createGoogleTask(token, '@default', {
        title: `[${task.priority}] ${task.title}`,
        notes: notesParts.join('\n'),
        due: task.dueDate || task.reminderDate || undefined
      });
    } catch (err: any) {
      console.error('Error auto-syncing to Google Tasks:', err);
      errors.push(`Google Tasks: ${err.message || 'Failed to fix to Tasks'}`);
    }
  }

  return {
    success: errors.length === 0,
    userEmail: email,
    calendarEvent: createdCalendarEvent,
    googleTask: createdGoogleTask,
    error: errors.length > 0 ? errors.join('; ') : null
  };
};
