import { Task, TaskStatus, Priority, MainCategory, TaskFilterOptions, NotificationItem } from '../types';

export const getTodayFormatted = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTomorrowFormatted = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const generateTaskId = (existingTasks: Task[] = []): string => {
  let maxNum = 1000;
  (existingTasks || []).forEach(task => {
    if (!task || !task.id) return;
    const match = task.id.match(/TASK-(\d+)/) || task.id.match(/TSK-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  return `TASK-${maxNum + 1}`;
};

// Automatic Overdue Evaluator
export const syncTaskStatusesWithDates = (tasks: Task[] = []): Task[] => {
  const today = getTodayFormatted();
  return (tasks || []).map(task => {
    if (!task) return task;
    // If due date < today and status is NEW, PENDING, or IN_PROGRESS -> set OVERDUE
    if (task.dueDate && task.dueDate < today && ['NEW', 'PENDING', 'IN_PROGRESS'].includes(task.status)) {
      return {
        ...task,
        status: 'OVERDUE' as TaskStatus,
        activityLogs: [
          ...(task.activityLogs || []),
          {
            id: `sys-overdue-${Date.now()}`,
            timestamp: `${today} 12:00 AM`,
            action: 'Status Change',
            description: 'System automatically marked task as OVERDUE due to passed deadline.'
          }
        ]
      };
    }
    return task;
  });
};

export const getPriorityWeight = (priority: Priority): number => {
  switch (priority) {
    case 'CRITICAL': return 4;
    case 'HIGH': return 3;
    case 'MEDIUM': return 2;
    case 'LOW': return 1;
    default: return 1;
  }
};

export const sortTasksByPriorityAndDate = (tasks: Task[] = []): Task[] => {
  return [...(tasks || [])].sort((a, b) => {
    if (!a || !b) return 0;
    // CRITICAL tasks always top
    const weightA = getPriorityWeight(a.priority);
    const weightB = getPriorityWeight(b.priority);
    if (weightA !== weightB) {
      return weightB - weightA; // higher priority first
    }
    // Then due date ascending
    if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    return 0;
  });
};

export const filterTasks = (tasks: Task[] = [], options: TaskFilterOptions): Task[] => {
  const today = getTodayFormatted();
  const tomorrow = getTomorrowFormatted();

  return (tasks || []).filter(task => {
    if (!task) return false;
    if (task.isArchived) return false;

    // Search Query
    if (options && options.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase();
      const matchTitle = task.title?.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchCategory = task.category?.toLowerCase().includes(q);
      const matchSub = task.subcategory?.toLowerCase().includes(q);
      const matchPerson = task.contact?.personName?.toLowerCase().includes(q) || task.assignedTo?.toLowerCase().includes(q);
      const matchOrg = task.relatedOrganization?.toLowerCase().includes(q);
      const matchEvent = task.innovation?.eventName?.toLowerCase().includes(q) || task.relatedEvent?.toLowerCase().includes(q);
      const matchNotes = task.notes?.some(n => n.toLowerCase().includes(q));

      if (!matchTitle && !matchDesc && !matchCategory && !matchSub && !matchPerson && !matchOrg && !matchEvent && !matchNotes) {
        return false;
      }
    }

    // Category
    if (options && options.category && options.category !== 'ALL') {
      if (task.category !== options.category) return false;
    }

    // Subcategory
    if (options && options.subcategory && options.subcategory !== 'ALL') {
      if (task.subcategory !== options.subcategory) return false;
    }

    // Priority
    if (options && options.priority && options.priority !== 'ALL') {
      if (task.priority !== options.priority) return false;
    }

    // Status
    if (options && options.status && options.status !== 'ALL') {
      if (task.status !== options.status) return false;
    }

    // Assignee
    if (options && options.assignedTo && options.assignedTo.trim()) {
      if (!task.assignedTo?.toLowerCase().includes(options.assignedTo.toLowerCase())) {
        return false;
      }
    }

    // Follow up only
    if (options && options.followUpOnly) {
      if (!task.followUpRequired && task.category !== 'FOLLOW_UPS') return false;
    }

    // Smart Due Date Filters
    if (options && options.dueFilter && options.dueFilter !== 'ALL') {
      switch (options.dueFilter) {
        case 'TODAY':
          if (task.dueDate !== today) return false;
          break;
        case 'TOMORROW':
          if (task.dueDate !== tomorrow) return false;
          break;
        case 'THIS_WEEK': {
          const due = new Date(task.dueDate);
          const now = new Date();
          const endOfWeek = new Date();
          endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
          if (due < now || due > endOfWeek) return false;
          break;
        }
        case 'UPCOMING':
          if (!task.dueDate || task.dueDate <= today) return false;
          break;
        case 'OVERDUE':
          if (task.status !== 'OVERDUE' && !(task.dueDate < today && task.status !== 'COMPLETED' && task.status !== 'CANCELLED')) {
            return false;
          }
          break;
      }
    }

    return true;
  });
};

export const calculateDashboardStats = (tasks: Task[] = []) => {
  const activeTasks = (tasks || []).filter(t => t && !t.isArchived);
  const total = activeTasks.length;
  const today = getTodayFormatted();

  const completed = activeTasks.filter(t => t.status === 'COMPLETED').length;
  const pending = activeTasks.filter(t => t.status === 'PENDING' || t.status === 'NEW' || t.status === 'IN_PROGRESS').length;
  const overdue = activeTasks.filter(t => t.status === 'OVERDUE' || (t.dueDate < today && t.status !== 'COMPLETED' && t.status !== 'CANCELLED')).length;
  const dueToday = activeTasks.filter(t => t.dueDate === today && t.status !== 'COMPLETED').length;
  const critical = activeTasks.filter(t => t.priority === 'CRITICAL' && t.status !== 'COMPLETED').length;
  const highPriority = activeTasks.filter(t => (t.priority === 'HIGH' || t.priority === 'CRITICAL') && t.status !== 'COMPLETED').length;
  const onHold = activeTasks.filter(t => t.status === 'ON_HOLD').length;
  const followUps = activeTasks.filter(t => (t.followUpRequired || t.category === 'FOLLOW_UPS') && t.status !== 'COMPLETED').length;

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    pending,
    completed,
    overdue,
    dueToday,
    critical,
    highPriority,
    onHold,
    followUps,
    completionPercentage
  };
};

export const generateNotifications = (tasks: Task[] = []): NotificationItem[] => {
  const notifications: NotificationItem[] = [];
  const today = getTodayFormatted();
  const tomorrow = getTomorrowFormatted();

  (tasks || []).filter(t => t && !t.isArchived && t.status !== 'COMPLETED' && t.status !== 'CANCELLED').forEach(t => {
    // Critical or High priority due today
    if (t.dueDate === today) {
      notifications.push({
        id: `notif-today-${t.id}`,
        taskId: t.id,
        title: `Task Due Today: ${t.title}`,
        type: 'DUE_TODAY',
        message: `${t.priority} priority task due today (${t.subcategory}).`,
        timestamp: today,
        isRead: false,
        severity: t.priority === 'CRITICAL' ? 'critical' : 'warning'
      });
    }

    // Due tomorrow
    if (t.dueDate === tomorrow) {
      notifications.push({
        id: `notif-tom-${t.id}`,
        taskId: t.id,
        title: `Due Tomorrow: ${t.title}`,
        type: 'DUE_TOMORROW',
        message: `Task is scheduled for completion tomorrow.`,
        timestamp: today,
        isRead: false,
        severity: 'info'
      });
    }

    // Overdue
    if (t.dueDate < today || t.status === 'OVERDUE') {
      notifications.push({
        id: `notif-overdue-${t.id}`,
        taskId: t.id,
        title: `OVERDUE: ${t.title}`,
        type: 'OVERDUE',
        message: `Task passed deadline on ${t.dueDate}. Immediate action required.`,
        timestamp: today,
        isRead: false,
        severity: 'critical'
      });
    }

    // Follow-up due
    if ((t.followUpRequired || t.category === 'FOLLOW_UPS') && t.contact?.nextFollowUpDate === today) {
      notifications.push({
        id: `notif-followup-${t.id}`,
        taskId: t.id,
        title: `Follow-up Due: ${t.contact?.personName || t.title}`,
        type: 'FOLLOW_UP_DUE',
        message: `Follow-up scheduled today with ${t.contact?.personName || 'contact'}.`,
        timestamp: today,
        isRead: false,
        severity: 'warning'
      });
    }

    // Innovation deadline
    if (t.innovation?.registrationDeadline === today) {
      notifications.push({
        id: `notif-innov-${t.id}`,
        taskId: t.id,
        title: `Registration Deadline Today: ${t.innovation.eventName}`,
        type: 'REGISTRATION_DEADLINE',
        message: `Registration closing today for ${t.innovation.eventName}.`,
        timestamp: today,
        isRead: false,
        severity: 'critical'
      });
    }
  });

  return notifications;
};

export const getCategoryBadgeStyle = (category: MainCategory) => {
  switch (category) {
    case 'TOP_PRIORITY':
      return 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border-red-200 dark:border-red-800';
    case 'DEPARTMENT_WORK':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'FOLLOW_UPS':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'INSTITUTIONAL_WORK':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    case 'INNOVATION_HUB':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'PERSONAL_WORK':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'HOME_WORKS':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200 dark:border-teal-800';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
  }
};

export const getPriorityBadgeStyle = (priority: Priority) => {
  switch (priority) {
    case 'CRITICAL':
      return 'bg-red-500 text-white font-extrabold shadow-2xs';
    case 'HIGH':
      return 'bg-orange-500 text-white font-extrabold shadow-2xs';
    case 'MEDIUM':
      return 'bg-yellow-500 text-slate-950 font-extrabold shadow-2xs';
    case 'LOW':
      return 'bg-emerald-500 text-white font-extrabold shadow-2xs';
  }
};

export const getPriorityCardStyle = (priority: Priority) => {
  switch (priority) {
    case 'CRITICAL':
      return 'border-l-4 border-l-red-500 border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30 hover:border-red-300 dark:hover:border-red-800';
    case 'HIGH':
      return 'border-l-4 border-l-orange-500 border-orange-200 dark:border-orange-900/60 bg-orange-50/50 dark:bg-orange-950/30 hover:border-orange-300 dark:hover:border-orange-800';
    case 'MEDIUM':
      return 'border-l-4 border-l-yellow-500 border-yellow-200 dark:border-yellow-900/60 bg-yellow-50/50 dark:bg-yellow-950/30 hover:border-yellow-300 dark:hover:border-yellow-800';
    case 'LOW':
      return 'border-l-4 border-l-emerald-500 border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-800';
    default:
      return 'border-l-4 border-l-slate-400 border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 hover:border-slate-300 dark:hover:border-slate-600';
  }
};

export const getStatusBadgeStyle = (status: TaskStatus) => {
  switch (status) {
    case 'NEW':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300';
    case 'PENDING':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
    case 'IN_PROGRESS':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
    case 'ON_HOLD':
      return 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-400';
    case 'OVERDUE':
      return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300 font-bold';
    case 'CANCELLED':
      return 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400 line-through';
  }
};
