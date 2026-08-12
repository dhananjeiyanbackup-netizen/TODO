import React, { useState, useEffect } from 'react';
import { Task, ViewMode, MainCategory, TaskStatus } from './types';
import { INITIAL_TASKS } from './data/initialTasks';
import { 
  syncTaskStatusesWithDates, 
  generateNotifications, 
  getTodayFormatted 
} from './utils/taskUtils';
import {
  subscribeToTasks,
  saveTaskToDb,
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

export default function App() {
  // 1. Live Task State connected to Firestore Database
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToTasks(
      (fetchedTasks) => {
        setTasks(syncTaskStatusesWithDates(fetchedTasks));
        setIsLoadingDb(false);
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
      await saveTaskToDb(updated);
    } else {
      // Create new task
      const newId = `TSK-${String(Date.now()).slice(-5)}`;
      const newTask: Task = {
        id: newId,
        title: taskData.title || 'Untitled Task',
        description: taskData.description || '',
        category: taskData.category || 'DEPARTMENT_WORK',
        subcategory: taskData.subcategory || 'General',
        priority: taskData.priority || 'MEDIUM',
        status: taskData.status || 'NEW',
        startDate: taskData.startDate || getTodayFormatted(),
        dueDate: taskData.dueDate || getTodayFormatted(),
        reminderDate: taskData.reminderDate || '',
        assignedTo: taskData.assignedTo || 'Unassigned',
        relatedOrganization: taskData.relatedOrganization || '',
        estimatedTimeHours: taskData.estimatedTimeHours || 1,
        createdDate: getTodayFormatted(),
        isArchived: false,
        notes: taskData.notes || [],
        activityLogs: [
          {
            id: `act_${Date.now()}`,
            action: 'Created',
            description: 'Task created.',
            timestamp: new Date().toLocaleString()
          }
        ],
        followUpRequired: taskData.followUpRequired || false,
        contact: taskData.contact,
        innovation: taskData.innovation
      };

      await saveTaskToDb(newTask);
    }

    setIsFormModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTaskFromDb(taskId);
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
      setIsDetailModalOpen(false);
    }
  };

  const handleDuplicateTask = async (task: Task) => {
    const newId = `TSK-${String(Date.now()).slice(-5)}`;
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
    await saveTaskToDb(duplicated);
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    const existing = tasks.find(t => t.id === taskId);
    if (!existing) return;

    const updated: Task = {
      ...existing,
      status: newStatus,
      completionDate: newStatus === 'COMPLETED' ? getTodayFormatted() : existing.completionDate,
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

    await saveTaskToDb(updated);

    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updated);
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

    await saveTaskToDb(updated);

    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updated);
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

    await saveTaskToDb(updated);

    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updated);
    }
  };

  const handleResetSampleData = async () => {
    // Clear current tasks and load sample dataset
    await clearAllTasksFromDb(tasks);
    for (const sample of INITIAL_TASKS) {
      await saveTaskToDb(sample);
    }
  };

  const handleClearAllData = async () => {
    await clearAllTasksFromDb(tasks);
  };

  const handleImportTasks = async (importedTasks: Task[]) => {
    for (const t of importedTasks) {
      if (t && t.id) {
        await saveTaskToDb(t);
      }
    }
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
          <ReportsView tasks={tasks} />
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
        onQuickAdd={() => handleQuickAdd()}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectTask={handleSelectTask}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden relative">
        
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigateView={handleNavigateToView}
          onNavigateCategory={handleNavigateToCategory}
          selectedCategory={selectedCategory}
          tasks={tasks}
          onOpenGoogleCalendar={() => setIsGoogleCalendarOpen(true)}
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
        onClose={() => { setIsFormModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        editingTask={editingTask}
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
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Google Calendar & Daily Reminders Modal */}
      <GoogleCalendarModal
        isOpen={isGoogleCalendarOpen}
        onClose={() => setIsGoogleCalendarOpen(false)}
        tasks={tasks}
      />

    </div>
  );
}
