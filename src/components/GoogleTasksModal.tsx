import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckSquare, 
  Plus, 
  Trash2, 
  RefreshCw, 
  ExternalLink, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Download, 
  UploadCloud, 
  Calendar,
  Layers,
  Check,
  Clock,
  FolderPlus,
  FolderMinus,
  ListFilter
} from 'lucide-react';
import { 
  googleSignInForWorkspace, 
  getCachedWorkspaceToken, 
  logoutGoogleWorkspace, 
  initGoogleWorkspaceAuth,
  fetchGoogleTaskLists,
  createGoogleTaskList,
  deleteGoogleTaskList,
  fetchGoogleTasks,
  createGoogleTask,
  updateGoogleTaskStatus,
  deleteGoogleTask,
  clearCompletedGoogleTasks,
  syncAppTasksToGoogleTasks,
  GoogleTaskList,
  GoogleTask
} from '../lib/googleTasks';
import { Task } from '../types';
import { getPriorityBadgeStyle } from '../utils/taskUtils';

interface GoogleTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks?: Task[];
  onImportTask?: (importedTask: Partial<Task>) => void;
}

export const GoogleTasksModal: React.FC<GoogleTasksModalProps> = ({
  isOpen,
  onClose,
  tasks = [],
  onImportTask
}) => {
  const [token, setToken] = useState<string | null>(getCachedWorkspaceToken());
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Task Lists
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('@default');
  const [isLoadingLists, setIsLoadingLists] = useState(false);

  // New list creation
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);

  // Google Tasks
  const [googleTasks, setGoogleTasks] = useState<GoogleTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);

  // New Task form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Sync Unfinished Tasks to Google Tasks
  const [selectedAppTaskIds, setSelectedAppTaskIds] = useState<string[]>([]);
  const [isSyncingAppTasks, setIsSyncingAppTasks] = useState(false);

  // Status & Feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Confirmation modal state for destructive operations (Workspace Guideline MANDATORY)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
    confirmButtonText?: string;
  } | null>(null);

  const unfinishedAppTasks = tasks.filter(t => t && t.status !== 'COMPLETED' && !t.isArchived);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = initGoogleWorkspaceAuth(
      (user, tok) => {
        setToken(tok);
        setUserEmail(user.email);
        loadAllLists(tok);
      },
      () => {
        setToken(null);
        setUserEmail(null);
      }
    );
    return () => unsub();
  }, [isOpen]);

  const loadAllLists = async (authToken: string) => {
    setIsLoadingLists(true);
    try {
      const lists = await fetchGoogleTaskLists(authToken);
      setTaskLists(lists);
      if (lists.length > 0) {
        const defaultList = lists[0].id;
        setSelectedListId(defaultList);
        await loadTasksForList(authToken, defaultList);
      }
    } catch (err: any) {
      console.error('Error fetching Google Task Lists:', err);
      setErrorMessage(err.message || 'Failed to fetch task lists.');
    } finally {
      setIsLoadingLists(false);
    }
  };

  const loadTasksForList = async (authToken: string, listId: string) => {
    setIsLoadingTasks(true);
    setErrorMessage(null);
    try {
      const items = await fetchGoogleTasks(authToken, listId, showCompleted);
      setGoogleTasks(items);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setErrorMessage(err.message || 'Failed to fetch tasks.');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      const res = await googleSignInForWorkspace();
      if (res) {
        setToken(res.accessToken);
        setUserEmail(res.user.email);
        setSuccessMessage('Successfully connected to Google Tasks!');
        await loadAllLists(res.accessToken);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in to Google Tasks.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogleWorkspace();
    setToken(null);
    setUserEmail(null);
    setTaskLists([]);
    setGoogleTasks([]);
    setSuccessMessage('Disconnected from Google Tasks.');
  };

  const handleSelectList = async (listId: string) => {
    setSelectedListId(listId);
    if (token) {
      await loadTasksForList(token, listId);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newListName.trim()) return;

    setIsCreatingList(true);
    try {
      const created = await createGoogleTaskList(token, newListName);
      setTaskLists(prev => [...prev, created]);
      setSelectedListId(created.id);
      setNewListName('');
      setShowNewListForm(false);
      setSuccessMessage(`Task list "${created.title}" created in Google Tasks.`);
      await loadTasksForList(token, created.id);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create task list.');
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleDeleteListPrompt = (list: GoogleTaskList) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete List "${list.title}" from Google Tasks?`,
      description: 'All tasks within this list will be permanently removed from your Google Account. This action cannot be undone.',
      confirmButtonText: 'Delete List',
      onConfirm: async () => {
        if (!token) return;
        try {
          await deleteGoogleTaskList(token, list.id);
          const remaining = taskLists.filter(l => l.id !== list.id);
          setTaskLists(remaining);
          if (remaining.length > 0) {
            setSelectedListId(remaining[0].id);
            await loadTasksForList(token, remaining[0].id);
          } else {
            setGoogleTasks([]);
          }
          setSuccessMessage(`List "${list.title}" deleted.`);
        } catch (err: any) {
          setErrorMessage(err.message || 'Failed to delete list.');
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTaskTitle.trim()) return;

    setIsCreatingTask(true);
    try {
      const created = await createGoogleTask(token, selectedListId, {
        title: newTaskTitle,
        notes: newTaskNotes,
        due: newTaskDue || undefined
      });
      setGoogleTasks(prev => [created, ...prev]);
      setNewTaskTitle('');
      setNewTaskNotes('');
      setNewTaskDue('');
      setSuccessMessage(`Task "${created.title}" added to Google Tasks.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add task.');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleToggleTaskStatus = async (task: GoogleTask) => {
    if (!token) return;
    const newStatus = task.status === 'completed' ? false : true;
    
    // Optimistic UI update
    setGoogleTasks(prev => 
      prev.map(t => t.id === task.id ? { ...t, status: newStatus ? 'completed' : 'needsAction' } : t)
    );

    try {
      await updateGoogleTaskStatus(token, selectedListId, task.id, newStatus);
    } catch (err: any) {
      // Revert if error
      setGoogleTasks(prev => 
        prev.map(t => t.id === task.id ? { ...t, status: task.status } : t)
      );
      setErrorMessage(err.message || 'Failed to update task status.');
    }
  };

  const handleDeleteTaskPrompt = (task: GoogleTask) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Task "${task.title}"?`,
      description: 'This task will be deleted from your Google Tasks list permanently.',
      confirmButtonText: 'Delete Task',
      onConfirm: async () => {
        if (!token) return;
        try {
          await deleteGoogleTask(token, selectedListId, task.id);
          setGoogleTasks(prev => prev.filter(t => t.id !== task.id));
          setSuccessMessage(`Task deleted from Google Tasks.`);
        } catch (err: any) {
          setErrorMessage(err.message || 'Failed to delete task.');
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleClearCompletedPrompt = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear All Completed Tasks?',
      description: 'All completed tasks in this Google Tasks list will be cleared from view.',
      confirmButtonText: 'Clear Completed',
      onConfirm: async () => {
        if (!token) return;
        try {
          await clearCompletedGoogleTasks(token, selectedListId);
          await loadTasksForList(token, selectedListId);
          setSuccessMessage('Completed tasks cleared.');
        } catch (err: any) {
          setErrorMessage(err.message || 'Failed to clear completed tasks.');
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  // Sync selected or all unfinished App tasks into Google Tasks
  const handleSyncAppTasksToGoogle = async (tasksToPush: Task[]) => {
    if (!token) {
      setErrorMessage('Please connect your Google Account first.');
      return;
    }
    if (tasksToPush.length === 0) return;

    setIsSyncingAppTasks(true);
    setErrorMessage(null);
    try {
      const result = await syncAppTasksToGoogleTasks(token, selectedListId, tasksToPush);
      setSuccessMessage(`Successfully pushed ${result.count} tasks into Google Tasks!`);
      setSelectedAppTaskIds([]);
      await loadTasksForList(token, selectedListId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to push tasks to Google Tasks.');
    } finally {
      setIsSyncingAppTasks(false);
    }
  };

  // Import task from Google Tasks into App
  const handleImportToApp = (gTask: GoogleTask) => {
    if (!onImportTask) return;
    onImportTask({
      title: gTask.title,
      description: gTask.notes || 'Imported from Google Tasks',
      category: 'DEPARTMENT_WORK',
      subcategory: 'Google Tasks Sync',
      priority: 'HIGH',
      status: gTask.status === 'completed' ? 'COMPLETED' : 'IN_PROGRESS',
      dueDate: gTask.due ? gTask.due.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setSuccessMessage(`Task "${gTask.title}" imported into WorkManager Dashboard!`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Google Tasks Integration
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">Official API Sync</span>
              </h2>
              <p className="text-xs text-blue-100">
                Manage your Google Tasks, push unfinished work items, and synchronize checklists seamlessly.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://tasks.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold flex items-center gap-1"
              title="Open Google Tasks in Web"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">tasks.google.com</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto custom-scrollbar">
          
          {/* Notifications / Alerts */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800/80 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800/80 text-xs flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Auth Bar */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${token ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600'}`}>
                {token ? <CheckCircle2 className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {token ? 'Google Tasks Connected' : 'Connect Google Tasks'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {token ? (userEmail || 'Access token authorized') : 'Sign in to access your task lists and sync items'}
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

          {token && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Task Lists & App Tasks Sync (5 Cols) */}
              <div className="lg:col-span-5 space-y-5">
                
                {/* Task Lists Section */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-600" />
                      Google Task Lists
                    </h4>
                    <button
                      onClick={() => setShowNewListForm(!showNewListForm)}
                      className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> New List
                    </button>
                  </div>

                  {/* New List inline form */}
                  {showNewListForm && (
                    <form onSubmit={handleCreateList} className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="List name..."
                        required
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      />
                      <button
                        type="submit"
                        disabled={isCreatingList}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer disabled:opacity-50"
                      >
                        {isCreatingList ? '...' : 'Add'}
                      </button>
                    </form>
                  )}

                  {/* List Selector Chips */}
                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {taskLists.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => handleSelectList(l.id)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          selectedListId === l.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                      >
                        <span className="truncate">{l.title}</span>
                        {selectedListId === l.id && taskLists.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteListPrompt(l);
                            }}
                            className="p-1 text-white/80 hover:text-white rounded hover:bg-white/20 transition-colors"
                            title="Delete List"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Push Unfinished App Tasks to Google Tasks */}
                <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-indigo-600" />
                      Push App Tasks to Google
                    </h4>
                    <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold">
                      {unfinishedAppTasks.length} pending
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Push unfinished tasks from your dashboard directly into Google Tasks.
                  </p>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                    {unfinishedAppTasks.map((task) => {
                      const isSelected = selectedAppTaskIds.includes(task.id);
                      return (
                        <div
                          key={task.id}
                          onClick={() => {
                            setSelectedAppTaskIds(prev => 
                              isSelected ? prev.filter(id => id !== task.id) : [...prev, task.id]
                            );
                          }}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-400 font-semibold text-indigo-900 dark:text-indigo-200'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="truncate">{task.title}</span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${getPriorityBadgeStyle(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const selectedTasks = unfinishedAppTasks.filter(t => selectedAppTaskIds.includes(t.id));
                        handleSyncAppTasksToGoogle(selectedTasks);
                      }}
                      disabled={isSyncingAppTasks || selectedAppTaskIds.length === 0}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isSyncingAppTasks ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                      Push Selected ({selectedAppTaskIds.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSyncAppTasksToGoogle(unfinishedAppTasks)}
                      disabled={isSyncingAppTasks || unfinishedAppTasks.length === 0}
                      className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      title="Push All Unfinished Tasks"
                    >
                      Push All
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Google Tasks in Selected List (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Create New Task in Google Tasks */}
                <form onSubmit={handleCreateTask} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-blue-600" />
                    Add Task to Google Tasks
                  </h4>

                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task title..."
                    required
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newTaskNotes}
                      onChange={(e) => setNewTaskNotes(e.target.value)}
                      placeholder="Notes / details..."
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    />
                    <input
                      type="date"
                      value={newTaskDue}
                      onChange={(e) => setNewTaskDue(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingTask || !newTaskTitle.trim()}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isCreatingTask ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    Add to Google Tasks
                  </button>
                </form>

                {/* Google Tasks List Container */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        Tasks in List ({googleTasks.length})
                      </h4>
                      <label className="text-[11px] text-slate-500 flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showCompleted}
                          onChange={(e) => {
                            setShowCompleted(e.target.checked);
                            if (token) loadTasksForList(token, selectedListId);
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        Show Completed
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleClearCompletedPrompt}
                        className="text-[11px] text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                        title="Clear completed tasks"
                      >
                        Clear Completed
                      </button>
                      <button
                        onClick={() => token && loadTasksForList(token, selectedListId)}
                        disabled={isLoadingTasks}
                        className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoadingTasks ? 'animate-spin' : ''}`} /> Refresh
                      </button>
                    </div>
                  </div>

                  {isLoadingTasks ? (
                    <div className="p-8 text-center text-xs text-slate-400">Loading Google Tasks...</div>
                  ) : googleTasks.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      No tasks found in this list. Create one or push from your dashboard!
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                      {googleTasks.map((t) => {
                        const isDone = t.status === 'completed';
                        return (
                          <div
                            key={t.id}
                            className={`p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${
                              isDone
                                ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800 opacity-60'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 shadow-xs'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 max-w-[70%]">
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => handleToggleTaskStatus(t)}
                                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <div className="space-y-0.5">
                                <div className={`font-semibold text-slate-900 dark:text-slate-100 ${isDone ? 'line-through text-slate-400' : ''}`}>
                                  {t.title}
                                </div>
                                {t.notes && (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                    {t.notes}
                                  </p>
                                )}
                                {t.due && (
                                  <div className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1 font-medium">
                                    <Clock className="w-3 h-3" /> Due: {new Date(t.due).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {onImportTask && !isDone && (
                                <button
                                  type="button"
                                  onClick={() => handleImportToApp(t)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                                  title="Import into WorkManager Dashboard"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteTaskPrompt(t)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

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

      {/* Explicit User Confirmation Dialog for Destructive Operations */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-md w-full border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-100 dark:bg-red-950/60 rounded-xl">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {confirmDialog.title}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {confirmDialog.description}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDialog.onConfirm()}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {confirmDialog.confirmButtonText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
