import { Task } from '../types';
import { 
  universalGoogleSignIn, 
  getCachedGoogleToken, 
  setCachedGoogleToken, 
  universalGoogleSignOut, 
  subscribeToGoogleAuth,
  GoogleUserInfo,
  WORKSPACE_SCOPES 
} from './googleAuthHelper';

export { WORKSPACE_SCOPES };

export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
  selfLink?: string;
}

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
  updated?: string;
  selfLink?: string;
  hidden?: boolean;
  links?: Array<{
    type: string;
    description: string;
    link: string;
  }>;
}

// Unified Auth state listener
export const initGoogleWorkspaceAuth = (
  onAuthSuccess?: (user: { email: string | null; displayName?: string | null; photoURL?: string | null }, token: string) => void,
  onAuthFailure?: () => void
) => {
  return subscribeToGoogleAuth((user, token) => {
    if (token && user) {
      if (onAuthSuccess) {
        onAuthSuccess({
          email: user.email,
          displayName: user.name || user.email,
          photoURL: user.photoURL || null
        }, token);
      }
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google with Calendar + Tasks scopes
export const googleSignInForWorkspace = async (): Promise<{ user: { email: string | null; displayName?: string | null; photoURL?: string | null }; accessToken: string } | null> => {
  const result = await universalGoogleSignIn();
  return {
    user: {
      email: result.user.email,
      displayName: result.user.name || result.user.email,
      photoURL: result.user.photoURL || null
    },
    accessToken: result.accessToken
  };
};

export const getCachedWorkspaceToken = (): string | null => {
  return getCachedGoogleToken();
};

export const setCachedWorkspaceToken = (token: string | null, email?: string) => {
  setCachedGoogleToken(token, email);
};

export const logoutGoogleWorkspace = async () => {
  await universalGoogleSignOut();
};

// Google Tasks API V1 Operations

// 1. Fetch Task Lists
export const fetchGoogleTaskLists = async (token: string): Promise<GoogleTaskList[]> => {
  const response = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Tasks API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.items || [];
};

// 2. Create Task List
export const createGoogleTaskList = async (token: string, title: string): Promise<GoogleTaskList> => {
  const response = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: title.trim() || 'New Task List' })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create Google Task List: ${errText}`);
  }

  return await response.json();
};

// 3. Delete Task List (with confirmation handled at UI layer)
export const deleteGoogleTaskList = async (token: string, taskListId: string): Promise<void> => {
  const response = await fetch(`https://tasks.googleapis.com/tasks/v1/users/@me/lists/${encodeURIComponent(taskListId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to delete Google Task List: ${errText}`);
  }
};

// 4. Fetch Tasks in a List
export const fetchGoogleTasks = async (
  token: string, 
  taskListId: string = '@default',
  showCompleted: boolean = true
): Promise<GoogleTask[]> => {
  const url = `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks?showCompleted=${showCompleted}&showHidden=true&maxResults=100`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Tasks API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.items || [];
};

// 5. Create a Task in Google Tasks
export const createGoogleTask = async (
  token: string,
  taskListId: string = '@default',
  task: {
    title: string;
    notes?: string;
    due?: string; // RFC 3339 formatted e.g. "2026-08-15T00:00:00.000Z"
  }
): Promise<GoogleTask> => {
  let formattedDue: string | undefined = undefined;
  if (task.due) {
    if (task.due.includes('T')) {
      formattedDue = new Date(task.due).toISOString();
    } else {
      formattedDue = new Date(`${task.due}T00:00:00.000Z`).toISOString();
    }
  }

  const payload: any = {
    title: task.title.trim() || 'Untitled Task',
    status: 'needsAction'
  };

  if (task.notes) payload.notes = task.notes.trim();
  if (formattedDue) payload.due = formattedDue;

  const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create task in Google Tasks: ${errText}`);
  }

  return await response.json();
};

// 6. Update Task Status (toggle complete)
export const updateGoogleTaskStatus = async (
  token: string,
  taskListId: string = '@default',
  taskId: string,
  completed: boolean
): Promise<GoogleTask> => {
  const payload: any = {
    id: taskId,
    status: completed ? 'completed' : 'needsAction'
  };

  if (!completed) {
    payload.completed = null;
  }

  const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks/${encodeURIComponent(taskId)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to update task status in Google Tasks: ${errText}`);
  }

  return await response.json();
};

// 7. Delete Task from Google Tasks
export const deleteGoogleTask = async (
  token: string,
  taskListId: string = '@default',
  taskId: string
): Promise<void> => {
  const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks/${encodeURIComponent(taskId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to delete task from Google Tasks: ${errText}`);
  }
};

// 8. Clear Completed Tasks from a List
export const clearCompletedGoogleTasks = async (
  token: string,
  taskListId: string = '@default'
): Promise<void> => {
  const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/clear`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to clear completed Google Tasks: ${errText}`);
  }
};

// 9. Sync multiple App Tasks to Google Tasks
export const syncAppTasksToGoogleTasks = async (
  token: string,
  taskListId: string = '@default',
  appTasks: Task[]
): Promise<{ count: number; created: GoogleTask[] }> => {
  const results: GoogleTask[] = [];

  for (const t of appTasks) {
    const notesParts: string[] = [];
    if (t.description) notesParts.push(t.description);
    if (t.category) notesParts.push(`Category: ${t.category} (${t.subcategory || 'General'})`);
    if (t.priority) notesParts.push(`Priority: ${t.priority}`);
    if (t.assignedTo) notesParts.push(`Assigned: ${t.assignedTo}`);
    if (t.contact?.personName) notesParts.push(`Contact: ${t.contact.personName} (${t.contact.phone || t.contact.email || ''})`);
    if (t.placement?.companyName) notesParts.push(`Placement: ${t.placement.companyName} - HR: ${t.placement.hrName || ''} - CTC: ${t.placement.ctcPackage || ''}`);

    const created = await createGoogleTask(token, taskListId, {
      title: t.title,
      notes: notesParts.join('\n'),
      due: t.dueDate || t.reminderDate || undefined
    });
    results.push(created);
  }

  return { count: results.length, created: results };
};
