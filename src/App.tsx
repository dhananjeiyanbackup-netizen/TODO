import React, { useState, useEffect } from 'react';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';
import { Task, ViewMode, MainCategory, TaskStatus, Attachment } from './types';
import { INITIAL_TASKS } from './data/initialTasks';
import { 
  syncTaskStatusesWithDates, 
  generateNotifications, 
  getTodayFormatted,
  generateTaskId
} from './utils/taskUtils';
import {
  subscribeToTasks,
  saveTaskToDb,
  batchSaveTasksToDb,
  deleteTaskFromDb,
  clearAllTasksFromDb
} from './lib/firebase';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { MyTasksView } from './components/MyTasksView';
import { DepartmentDashboardView } from './components/DepartmentDashboardView';
import { InnovationHubView } from './components/InnovationHubView';
import { FollowUpView } from './components/FollowUpView';
import { CalendarView } from './components/CalendarView';
import { KanbanView } from './components/KanbanView';
import { ReportsView } from './components/ReportsView';
import { TaskFormModal } from './components/TaskFormModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { SettingsModal } from './components/SettingsModal';
import { GoogleCalendarModal } from './components/GoogleCalendarModal';
import { GoogleTasksModal } from './components/GoogleTasksModal';

export default function App() {
  // 1. Live Task State connected to Firestore Database + Local Cache for instant refresh resilience
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const cached = localStorage.getItem('exec_portal_tasks_v1');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return syncTaskStatusesWithDates(parsed);
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage cache:', e);
    }
    return INITIAL_TASKS;
  });
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);

  // Sync to localStorage whenever tasks state updates
  useEffect(() => {
    try {
      if (tasks && tasks.length > 0) {
        localStorage.setItem('exec_portal_tasks_v1', JSON.stringify(tasks));
      }
    } catch (e) {
      console.warn('Failed to cache tasks in localStorage:', e);
    }
  }, [tasks]);

  useEffect(() => {
    const unsubscribe = subscribeToTasks(
      async (fetchedTasks) => {
        setIsLoadingDb(false);
        if (fetchedTasks && fetchedTasks.length > 0) {
          const synced = syncTaskStatusesWithDates(fetchedTasks);
          setTasks(synced);
          try {
            localStorage.setItem('exec_portal_tasks_v1', JSON.stringify(synced));
          } catch (e) {}
        } else {
          // If Firestore is empty on first launch, auto-persist the default dataset
          try {
            const cached = localStorage.getItem('exec_portal_tasks_v1');
            const dataToSeed: Task[] = (cached && JSON.parse(cached)?.length > 0)
              ? JSON.parse(cached)
              : INITIAL_TASKS;
            await batchSaveTasksToDb(dataToSeed);
          } catch (err) {
            console.error('Auto-seed to Firestore failed:', err);
          }
        }
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        setIsLoadingDb(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Navigation & View State
  const [currentView, setCurrentView] = useState<ViewMode>('DASHBOARD');
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | undefined>(undefined);

  // 3. UI Control States
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // 4. Modal States
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formCategoryPreset, setFormCategoryPreset] = useState<MainCategory | undefined>(undefined);
  const [formDueDatePreset, setFormDueDatePreset] = useState<string | undefined>(undefined);

  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGoogleCalendarOpen, setIsGoogleCalendarOpen] = useState<boolean>(false);
  const [isGoogleTasksOpen, setIsGoogleTasksOpen] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Notifications calculation
  const notifications = generateNotifications(tasks);

  // Navigation Handlers
  const handleNavigateToView = (view: ViewMode) => {
    setCurrentView(view);
    setSelectedCategory(undefined);
    setIsSidebarOpen(false);
  };

  const handleNavigateToCategory = (category: MainCategory) => {
    setSelectedCategory(category);
    if (category === 'DEPARTMENT_WORK') setCurrentView('DEPARTMENT_WORK');
    else if (category === 'FOLLOW_UPS') setCurrentView('FOLLOW_UPS');
    else if (category === 'INNOVATION_HUB') setCurrentView('INNOVATION_HUB');
    else if (category === 'TOP_PRIORITY') setCurrentView('TOP_PRIORITY');
    else setCurrentView('MY_TASKS');
    setIsSidebarOpen(false);
  };

  // Task Operations - Persisting directly to Firestore
  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      // Update existing task
      const updated: Task = {
        ...editingTask,
        ...taskData,
        activityLogs: [
          {
            id: `act_${Date.now()}`,
            action: 'Updated',
            description: 'Task details updated via form editor.',
            timestamp: new Date().toLocaleString()
          },
          ...(editingTask.activityLogs || [])
        ]
      };
      try {
        await saveTaskToDb(updated);
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
        setToastNotification({
          type: 'success',
          message: `Task "${updated.title}" (${updated.id}) updated and saved to database!`
        });
        setTimeout(() => setToastNotification(null), 4000);
      } catch (err: any) {
        console.error('Error saving updated task to Firestore:', err);
        setToastNotification({
          type: 'error' as any,
          message: `Failed to update database: ${err.message || 'Unknown error'}`
        });
      }

      if (taskData.googleSyncEmail || taskData.googleCalendarEventId || taskData.googleTaskId) {
        setToastNotification({
          type: 'success',
          message: `Task updated & auto-fixed to Google Calendar & Google Tasks (${taskData.googleSyncEmail || 'dhananjeiyan.backup@gmail.com'})`
        });
        setTimeout(() => setToastNotification(null), 5000);
      }
    } else {
      // Create new task with guaranteed unique ID to prevent overwriting existing tasks
      let newId = taskData.id;
      if (!newId || tasks.some(t => t.id === newId)) {
        newId = generateTaskId(tasks);
      }
      while (tasks.some(t => t.id === newId)) {
        newId = generateTaskId([...tasks, { id: newId } as Task]);
      }

      const newTask: Task = {
        id: newId,
        title: taskData.title || 'Untitled Task',
        description: taskData.description || '',
        category: taskData.category || 'DEPARTMENT_WORK',
        subcategory: taskData.subcategory || 'General',
        priority: taskData.priority || 'MEDIUM',
        status: taskData.status || 'NEW',
        startDate: taskData.startDate || undefined,
        dueDate: taskData.dueDate || '',
        reminderDate: taskData.reminderDate || undefined,
        assignedTo: taskData.assignedTo || '',
        relatedOrganization: taskData.relatedOrganization || '',
        estimatedTimeHours: taskData.estimatedTimeHours || 1,
        createdDate: taskData.createdDate || getTodayFormatted(),
        isArchived: false,
        notes: taskData.notes || [],
        activityLogs: taskData.activityLogs || [
          {
            id: `act_${Date.now()}`,
            action: 'Created',
            description: 'Task created.',
            timestamp: new Date().toLocaleString()
          }
        ],
        followUpRequired: taskData.followUpRequired || false,
        contact: taskData.contact,
        placement: taskData.placement,
        innovation: taskData.innovation,
        recurrence: taskData.recurrence || 'NONE',
        googleCalendarEventId: taskData.googleCalendarEventId,
        googleCalendarLink: taskData.googleCalendarLink,
        googleTaskId: taskData.googleTaskId,
        googleSyncEmail: taskData.googleSyncEmail
      };

      try {
        await saveTaskToDb(newTask);
        setTasks(prev => {
          const filtered = prev.filter(t => t.id !== newTask.id);
          return [newTask, ...filtered];
        });
        setToastNotification({
          type: 'success',
          message: `Task "${newTask.title}" (${newTask.id}) created and saved to database!`
        });
        setTimeout(() => setToastNotification(null), 4000);
      } catch (err: any) {
        console.error('Error saving new task to Firestore:', err);
        setToastNotification({
          type: 'error' as any,
          message: `Failed to save new task to database: ${err.message || 'Unknown error'}`
        });
      }

      if (taskData.googleSyncEmail || taskData.googleCalendarEventId || taskData.googleTaskId) {
        setToastNotification({
          type: 'success',
          message: `Task "${newTask.title}" fixed automatically to Google Calendar & Google Tasks for ${newTask.googleSyncEmail || 'dhananjeiyan.backup@gmail.com'}`
        });
        setTimeout(() => setToastNotification(null), 6000);
      }
    }

    setIsFormModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
      setIsDetailModalOpen(false);
    }
    try {
      await deleteTaskFromDb(taskId);
      setToastNotification({
        type: 'info',
        message: `Task ${taskId} removed from database.`
      });
      setTimeout(() => setToastNotification(null), 3000);
    } catch (err: any) {
      console.error('Error deleting task from Firestore:', err);
    }
  };

  const handleDuplicateTask = async (task: Task) => {
    let newId = generateTaskId(tasks);
    while (tasks.some(t => t.id === newId)) {
      newId = generateTaskId([...tasks, { id: newId } as Task]);
    }

    const duplicated: Task = {
      ...task,
      id: newId,
      title: `${task.title} (Copy)`,
      createdDate: getTodayFormatted(),
      status: 'NEW',
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          action: 'Duplicated',
          description: `Duplicated from ${task.id}.`,
          timestamp: new Date().toLocaleString()
        }
      ]
    };

    setTasks(prev => [duplicated, ...prev]);
    try {
      await saveTaskToDb(duplicated);
      setToastNotification({
        type: 'success',
        message: `Task duplicated as ${duplicated.id} and saved to database.`
      });
      setTimeout(() => setToastNotification(null), 3000);
    } catch (err: any) {
      console.error('Error saving duplicated task to Firestore:', err);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    const existing = tasks.find(t => t.id === taskId);
    if (!existing) return;

    const updated: Task = {
      ...existing,
      status: newStatus,
      completionDate: newStatus === 'COMPLETED' ? getTodayFormatted() : undefined,
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          action: 'Status Change',
          description: `Status updated from ${existing.status} to ${newStatus}.`,
          timestamp: new Date().toLocaleString()
        },
        ...(existing.activityLogs || [])
      ]
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updated);
    }

    try {
      await saveTaskToDb(updated);
    } catch (err: any) {
      console.error('Error updating task status in Firestore:', err);
    }
  };

  const handleAddNote = async (taskId: string, note: string) => {
    const existing = tasks.find(t => t.id === taskId);
    if (!existing) return;

    const updatedNotes = [...(existing.notes || []), `${new Date().toLocaleDateString()}: ${note}`];
    const updated: Task = {
      ...existing,
      notes: updatedNotes,
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          action: 'Note Added',
          description: `Added note: "${note.substring(0, 30)}..."`,
          timestamp: new Date().toLocaleString()
        },
        ...(existing.activityLogs || [])
      ]
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updated);
    }

    try {
      await saveTaskToDb(updated);
    } catch (err: any) {
      console.error('Error saving note in Firestore:', err);
    }
  };

  const handleAddFollowUpLog = async (taskId: string, logNote: string, nextDate?: string) => {
    const existing = tasks.find(t => t.id === taskId);
    if (!existing) return;

    const updatedContact = existing.contact ? {
      ...existing.contact,
      lastContactedDate: getTodayFormatted(),
      nextFollowUpDate: nextDate || existing.contact.nextFollowUpDate,
      notes: `${existing.contact.notes ? existing.contact.notes + ' | ' : ''}${getTodayFormatted()}: ${logNote}`
    } : undefined;

    const updated: Task = {
      ...existing,
      contact: updatedContact,
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          action: 'Follow-up Logged',
          description: `Follow-up contact logged. Next date set to ${nextDate || 'N/A'}.`,
          timestamp: new Date().toLocaleString()
        },
        ...(existing.activityLogs || [])
      ]
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updated);
    }

    try {
      await saveTaskToDb(updated);
    } catch (err: any) {
      console.error('Error saving follow-up in Firestore:', err);
    }
  };

  const handleAddAttachment = async (taskId: string, attachment: Attachment) => {
    const existing = tasks.find(t => t.id === taskId);
    if (!existing) return;

    const currentAttachments = existing.attachments || [];
    const updated: Task = {
      ...existing,
      attachments: [...currentAttachments, attachment],
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          action: 'Updated',
          description: `Attached project document "${attachment.name}" (${attachment.size}).`,
          timestamp: new Date().toLocaleString()
        },
        ...(existing.activityLogs || [])
      ]
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updated);
    }

    try {
      await saveTaskToDb(updated);
    } catch (err: any) {
      console.error('Error saving attachment in Firestore:', err);
    }
  };

  const handleDeleteAttachment = async (taskId: string, attachmentId: string) => {
    const existing = tasks.find(t => t.id === taskId);
    if (!existing) return;

    const currentAttachments = existing.attachments || [];
    const removedAtt = currentAttachments.find(a => a.id === attachmentId);
    const updated: Task = {
      ...existing,
      attachments: currentAttachments.filter(a => a.id !== attachmentId),
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          action: 'Updated',
          description: `Removed document attachment "${removedAtt?.name || attachmentId}".`,
          timestamp: new Date().toLocaleString()
        },
        ...(existing.activityLogs || [])
      ]
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updated);
    }

    try {
      await saveTaskToDb(updated);
    } catch (err: any) {
      console.error('Error deleting attachment in Firestore:', err);
    }
  };

  const handleAddAllToDatabase = async () => {
    try {
      setIsLoadingDb(true);
      const count = await batchSaveTasksToDb(tasks.length > 0 ? tasks : INITIAL_TASKS);
      setToastNotification({
        type: 'success',
        message: `Successfully synchronized and saved all ${count} tasks to Firestore database!`
      });
      setTimeout(() => setToastNotification(null), 5000);
    } catch (err: any) {
      console.error('Error adding all tasks to database:', err);
      setToastNotification({
        type: 'error',
        message: `Error adding tasks to database: ${err?.message || 'Check Firestore permissions'}`
      });
      setTimeout(() => setToastNotification(null), 5000);
    } finally {
      setIsLoadingDb(false);
    }
  };

  const handleResetSampleData = async () => {
    try {
      setIsLoadingDb(true);
      await clearAllTasksFromDb(tasks);
      await batchSaveTasksToDb(INITIAL_TASKS);
      setTasks(INITIAL_TASKS);
      localStorage.setItem('exec_portal_tasks_v1', JSON.stringify(INITIAL_TASKS));
      setToastNotification({
        type: 'success',
        message: 'Sample dataset successfully written to Firestore database!'
      });
      setTimeout(() => setToastNotification(null), 4000);
    } catch (err: any) {
      console.error('Error resetting sample data:', err);
    } finally {
      setIsLoadingDb(false);
    }
  };

  const handleClearAllData = async () => {
    try {
      setIsLoadingDb(true);
      await clearAllTasksFromDb(tasks);
      setTasks([]);
      localStorage.removeItem('exec_portal_tasks_v1');
      setToastNotification({
        type: 'info',
        message: 'All tasks have been cleared from database.'
      });
      setTimeout(() => setToastNotification(null), 4000);
    } catch (err: any) {
      console.error('Error clearing tasks from database:', err);
      setTasks([]);
      localStorage.removeItem('exec_portal_tasks_v1');
    } finally {
      setIsLoadingDb(false);
    }
  };

  const handleImportTasks = async (importedTasks: Task[]) => {
    setTasks(prev => [...importedTasks, ...prev]);
    await batchSaveTasksToDb(importedTasks);
    setToastNotification({
      type: 'success',
      message: `Imported ${importedTasks.length} tasks into Firestore database!`
    });
    setTimeout(() => setToastNotification(null), 4000);
  };

  const handleQuickAdd = (categoryPreset?: string, dueDatePreset?: string) => {
    setEditingTask(null);
    setFormCategoryPreset(categoryPreset as MainCategory);
    setFormDueDatePreset(dueDatePreset);
    setIsFormModalOpen(true);
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleSelectTaskById = (taskId: string) => {
    const t = tasks.find(x => x.id === taskId);
    if (t) {
      handleSelectTask(t);
    }
  };

  // Render main content area based on currentView
  const renderMainContent = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return (
          <DashboardView
            tasks={tasks}
            onSelectTask={handleSelectTask}
            onUpdateStatus={handleUpdateStatus}
            onQuickAdd={handleQuickAdd}
            onNavigateToView={handleNavigateToView}
            onNavigateToCategory={handleNavigateToCategory}
          />
        );

      case 'DEPARTMENT_WORK':
        return (
          <DepartmentDashboardView
            tasks={tasks}
            onSelectTask={handleSelectTask}
            onUpdateStatus={handleUpdateStatus}
            onQuickAdd={handleQuickAdd}
          />
        );

      case 'INNOVATION_HUB':
        return (
          <InnovationHubView
            tasks={tasks}
            onSelectTask={handleSelectTask}
            onUpdateStatus={handleUpdateStatus}
            onQuickAdd={handleQuickAdd}
          />
        );

      case 'FOLLOW_UPS':
        return (
          <FollowUpView
            tasks={tasks}
            onSelectTask={handleSelectTask}
            onUpdateStatus={handleUpdateStatus}
            onQuickAdd={handleQuickAdd}
            onAddFollowUpLog={handleAddFollowUpLog}
          />
        );

      case 'CALENDAR':
        return (
          <CalendarView
            tasks={tasks}
            onSelectTask={handleSelectTask}
            onUpdateStatus={handleUpdateStatus}
            onQuickAddForDate={(dateStr) => handleQuickAdd(undefined, dateStr)}
            onOpenGoogleCalendarModal={() => setIsGoogleCalendarOpen(true)}
          />
        );

      case 'KANBAN':
        return (
          <KanbanView
            tasks={tasks}
            onSelectTask={handleSelectTask}
            onUpdateStatus={handleUpdateStatus}
            onQuickAdd={() => handleQuickAdd()}
          />
        );

      case 'REPORTS':
        return (
          <ReportsView 
            tasks={tasks}
            onSelectTask={handleSelectTask}
            onUpdateStatus={handleUpdateStatus}
            onQuickAdd={() => handleQuickAdd()}
          />
        );

      case 'TOP_PRIORITY':
        return (
          <MyTasksView
            tasks={tasks}
            onSelectTask={handleSelectTask}
            onUpdateStatus={handleUpdateStatus}
            onQuickAdd={() => handleQuickAdd('TOP_PRIORITY')}
            initialFilter="CRITICAL"
          />
        );

      case 'MY_TASKS':
      default:
        return (
          <MyTasksView
            tasks={tasks}
            onSelectTask={handleSelectTask}
            onUpdateStatus={handleUpdateStatus}
            onQuickAdd={() => handleQuickAdd()}
          />
        );
    }
  };

  return (
    <div className="h-screen h-dvh w-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col overflow-hidden antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header */}
      <Header
        tasks={tasks}
        unreadNotificationCount={notifications.length}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGoogleCalendar={() => setIsGoogleCalendarOpen(true)}
        onOpenGoogleTasks={() => setIsGoogleTasksOpen(true)}
        onQuickAdd={() => handleQuickAdd()}
        onResetData={handleResetSampleData}
        onClearAllData={handleClearAllData}
        onAddAllToDb={handleAddAllToDatabase}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectTask={handleSelectTask}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Floating Auto-Sync Notification Banner */}
      {toastNotification && (
        <div className={`fixed top-16 right-4 z-50 max-w-md ${
          toastNotification.type === 'error'
            ? 'bg-rose-600 border-rose-400'
            : toastNotification.type === 'info'
            ? 'bg-indigo-600 border-indigo-400'
            : 'bg-emerald-600 border-emerald-400'
        } text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 border`}>
          {toastNotification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-200" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />
          )}
          <p className="text-xs font-semibold leading-relaxed flex-1">
            {toastNotification.message}
          </p>
          <button
            onClick={() => setToastNotification(null)}
            className="p-1 hover:bg-black/20 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden relative">
        
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigateView={handleNavigateToView}
          onNavigateCategory={handleNavigateToCategory}
          selectedCategory={selectedCategory}
          tasks={tasks}
          onOpenGoogleCalendar={() => setIsGoogleCalendarOpen(true)}
          onOpenGoogleTasks={() => setIsGoogleTasksOpen(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full min-w-0">
            {renderMainContent()}
          </div>
        </main>

      </div>

      {/* Task Creation / Editing Modal */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => { 
          setIsFormModalOpen(false); 
          setEditingTask(null);
          setFormCategoryPreset(undefined);
          setFormDueDatePreset(undefined);
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
        tasks={tasks}
        categoryPreset={formCategoryPreset}
        defaultDueDate={formDueDatePreset}
      />

      {/* Task Detail View Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedTask(null); }}
        onEdit={(task) => {
          setIsDetailModalOpen(false);
          setEditingTask(task);
          setIsFormModalOpen(true);
        }}
        onDelete={handleDeleteTask}
        onDuplicate={handleDuplicateTask}
        onUpdateStatus={handleUpdateStatus}
        onAddNote={handleAddNote}
        onAddFollowUpLog={handleAddFollowUpLog}
        onAddAttachment={handleAddAttachment}
        onDeleteAttachment={handleDeleteAttachment}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onSelectTaskById={handleSelectTaskById}
        onMarkAllRead={() => {}}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        tasks={tasks}
        onImportData={handleImportTasks}
        onResetSampleData={handleResetSampleData}
        onClearAllData={handleClearAllData}
        onAddAllToDb={handleAddAllToDatabase}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Google Calendar & Daily Reminders Modal */}
      <GoogleCalendarModal
        isOpen={isGoogleCalendarOpen}
        onClose={() => setIsGoogleCalendarOpen(false)}
        tasks={tasks}
      />

      {/* Google Tasks Integration Modal */}
      <GoogleTasksModal
        isOpen={isGoogleTasksOpen}
        onClose={() => setIsGoogleTasksOpen(false)}
        tasks={tasks}
        onImportTask={handleSaveTask}
      />

    </div>
  );
}
