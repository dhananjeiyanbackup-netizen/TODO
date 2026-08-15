import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  Lightbulb, 
  Paperclip, 
  Plus, 
  Trash2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  CheckSquare,
  Sparkles,
  Loader2,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { 
  Task, 
  MainCategory, 
  SubCategory, 
  Priority, 
  TaskStatus, 
  RecurrencePattern,
  InnovationLevel
} from '../types';
import { getTodayFormatted, generateTaskId } from '../utils/taskUtils';
import { autoFixTaskToGoogleWorkspace, getCurrentGoogleAccount } from '../lib/googleSync';
import { googleSignInForWorkspace } from '../lib/googleTasks';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (taskData: Partial<Task>) => void;
  onSaveTask?: (task: Task) => void;
  editingTask?: Task | null;
  existingTask?: Task | null;
  existingTasksList?: Task[];
  tasks?: Task[];
  categoryPreset?: MainCategory;
  presetCategory?: MainCategory;
  defaultDueDate?: string;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveTask,
  editingTask,
  existingTask,
  existingTasksList = [],
  tasks = [],
  categoryPreset,
  presetCategory,
  defaultDueDate
}) => {
  if (!isOpen) return null;

  const currentTask = editingTask || existingTask || null;
  const currentPreset = categoryPreset || presetCategory;
  const allTasksList = (existingTasksList && existingTasksList.length > 0) ? existingTasksList : tasks;

  const today = getTodayFormatted();

  const categorySubcategoriesMap: Record<MainCategory, SubCategory[]> = {
    TOP_PRIORITY: ['CIAT / Internal Assessment', 'Examination', 'Accreditation', 'Faculty Follow-up', 'Reports'],
    DEPARTMENT_WORK: [
      'Academic', 'Lesson Plan', 'Syllabus Completion', 'Attendance', 
      'Placement', 'Placement Drive', 'Placement Cell', 'Placement Training',
      'CIAT / Internal Assessment', 'Examination', 'Student Mentoring', 
      'Faculty Follow-up', 'Department Meetings', 'NBA', 'NAAC', 'IQAC', 
      'NIRF', 'IIPC', 'CDC', 'Accreditation', 'Student Activities', 
      'Faculty Activities', 'Department Events', 'Reports', 'Documentation'
    ],
    FOLLOW_UPS: [
      'Placement Follow-up', 'Company HR Follow-up', 'Placement Drive',
      'Faculty Follow-up', 'Student Mentoring', 'Industry Collaboration', 
      'Accreditation', 'CIAT / Internal Assessment', 'Examination', 'Reports'
    ],
    INSTITUTIONAL_WORK: [
      'Principal Office', 'Academic Office', 'Examination Cell', 'IQAC', 
      'NAAC', 'NBA', 'NIRF', 'Placement Cell', 'Placement Drive', 'IIPC', 'FDP & Workshops', 
      'Department Events', 'Reports', 'Documentation'
    ],
    INNOVATION_HUB: [
      'Hackathons', 'Startup Activities', 'Innovation Projects', 'Student Projects', 
      'Project Expo', 'Incubation', 'Ideation', 'Patents', 'AI/ML Projects', 
      'Industry Collaboration', 'Competitions', 'Innovation Events', 
      'Student Achievements', 'Certificates & Awards'
    ],
    PERSONAL_WORK: [
      'Learning & Research', 'Publications', 'NPTEL & Certifications', 
      'Personal Appointments', 'General'
    ],
    HOME_WORKS: [
      'Shopping & Supplies', 'Bills & Finances', 'Repairs & Maintenance', 'General'
    ]
  };

  // State initialization
  const [taskId, setTaskId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MainCategory>(presetCategory || 'DEPARTMENT_WORK');
  const [subcategory, setSubcategory] = useState<SubCategory>('Academic');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('PENDING');
  const [assignedTo, setAssignedTo] = useState('');
  const [createdDate, setCreatedDate] = useState(today);
  const [startDate, setStartDate] = useState(today);
  const [dueDate, setDueDate] = useState(today);
  const [reminderDate, setReminderDate] = useState('');
  const [estimatedTimeHours, setEstimatedTimeHours] = useState<number>(2);
  const [actualTimeHours, setActualTimeHours] = useState<number>(0);

  // Follow up fields
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [personName, setPersonName] = useState('');
  const [departmentOrOrg, setDepartmentOrOrg] = useState('');
  const [contactType, setContactType] = useState<'Email' | 'Phone' | 'In-Person' | 'WhatsApp' | 'Official Portal'>('Phone');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');

  // Placement fields
  const [placementCompany, setPlacementCompany] = useState('');
  const [placementHrName, setPlacementHrName] = useState('');
  const [placementHrEmail, setPlacementHrEmail] = useState('');
  const [placementHrPhone, setPlacementHrPhone] = useState('');
  const [placementType, setPlacementType] = useState<'On-Campus Drive' | 'Off-Campus Drive' | 'Internship' | 'Industrial Visit' | 'Placement Training' | 'MOU Signing' | 'Job Offer Follow-up'>('On-Campus Drive');
  const [placementCtc, setPlacementCtc] = useState('');
  const [placementEligibleBranches, setPlacementEligibleBranches] = useState('');
  const [placementDriveDate, setPlacementDriveDate] = useState('');
  const [placementStudentsCount, setPlacementStudentsCount] = useState('');
  const [placementStatus, setPlacementStatus] = useState<'Upcoming Drive' | 'Interview Scheduled' | 'Awaiting Offer Letters' | 'Completed' | 'Follow-up Pending'>('Upcoming Drive');
  const [placementRemarks, setPlacementRemarks] = useState('');

  // Innovation Hub fields
  const [eventName, setEventName] = useState('');
  const [studentOrTeam, setStudentOrTeam] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [venue, setVenue] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [level, setLevel] = useState<InnovationLevel>('College');
  const [prize, setPrize] = useState('');
  const [certificateStatus, setCertificateStatus] = useState<'Pending' | 'Received' | 'Issued' | 'N/A'>('Pending');
  const [result, setResult] = useState<'Won 1st Prize' | 'Won 2nd Prize' | 'Won 3rd Prize' | 'Finalist' | 'Participated' | 'Awaiting Result'>('Awaiting Result');

  // Metadata & Notes
  const [relatedOrganization, setRelatedOrganization] = useState('');
  const [relatedEvent, setRelatedEvent] = useState('');
  const [notesList, setNotesList] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrencePattern>('NONE');

  // Google Workspace Auto-Fix Settings
  const [autoSyncCalendar, setAutoSyncCalendar] = useState<boolean>(true);
  const [autoSyncTasks, setAutoSyncTasks] = useState<boolean>(true);
  const [isSyncingWorkspace, setIsSyncingWorkspace] = useState<boolean>(false);
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(false);
  const [syncStatusBanner, setSyncStatusBanner] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const acc = getCurrentGoogleAccount();
    if (acc.user?.email || acc.token) {
      setGoogleUserEmail(acc.user?.email || 'dhananjeiyan.backup@gmail.com');
      setIsGoogleConnected(!!acc.token);
    } else {
      setGoogleUserEmail('dhananjeiyan.backup@gmail.com');
      setIsGoogleConnected(false);
    }
  }, [isOpen]);

  const handleConnectGoogleNow = async () => {
    try {
      setIsSyncingWorkspace(true);
      const res = await googleSignInForWorkspace();
      if (res) {
        setGoogleUserEmail(res.user.email || 'dhananjeiyan.backup@gmail.com');
        setIsGoogleConnected(true);
        setSyncStatusBanner({
          type: 'success',
          message: `Connected Google Account (${res.user.email}). Ready to auto-fix tasks & calendar events!`
        });
      }
    } catch (err: any) {
      setSyncStatusBanner({
        type: 'error',
        message: `Failed to authorize Google: ${err.message}`
      });
    } finally {
      setIsSyncingWorkspace(false);
    }
  };

  useEffect(() => {
    if (currentTask) {
      setTaskId(currentTask.id);
      setTitle(currentTask.title);
      setDescription(currentTask.description || '');
      setCategory(currentTask.category);
      setSubcategory(currentTask.subcategory);
      setPriority(currentTask.priority);
      setStatus(currentTask.status);
      setAssignedTo(currentTask.assignedTo || '');
      setCreatedDate(currentTask.createdDate || today);
      setStartDate(currentTask.startDate || today);
      setDueDate(currentTask.dueDate || today);
      setReminderDate(currentTask.reminderDate || '');
      setEstimatedTimeHours(currentTask.estimatedTimeHours || 2);
      setActualTimeHours(currentTask.actualTimeHours || 0);

      setFollowUpRequired(!!currentTask.followUpRequired || currentTask.category === 'FOLLOW_UPS');
      setFollowUpDate(currentTask.followUpDate || '');
      if (currentTask.contact) {
        setPersonName(currentTask.contact.personName || '');
        setDepartmentOrOrg(currentTask.contact.departmentOrOrg || '');
        setContactType(currentTask.contact.contactType || 'Phone');
        setContactEmail(currentTask.contact.email || '');
        setContactPhone(currentTask.contact.phone || '');
        setFollowUpNotes(currentTask.contact.notes || '');
      }

      if (currentTask.placement) {
        setPlacementCompany(currentTask.placement.companyName || '');
        setPlacementHrName(currentTask.placement.hrName || '');
        setPlacementHrEmail(currentTask.placement.contactEmail || '');
        setPlacementHrPhone(currentTask.placement.contactPhone || '');
        setPlacementType(currentTask.placement.placementType || 'On-Campus Drive');
        setPlacementCtc(currentTask.placement.ctcPackage || '');
        setPlacementEligibleBranches(currentTask.placement.eligibleBranches || '');
        setPlacementDriveDate(currentTask.placement.driveDate || '');
        setPlacementStudentsCount(currentTask.placement.studentsShortlisted || '');
        setPlacementStatus(currentTask.placement.placementStatus || 'Upcoming Drive');
        setPlacementRemarks(currentTask.placement.remarks || '');
      }

      if (currentTask.innovation) {
        setEventName(currentTask.innovation.eventName || '');
        setStudentOrTeam(currentTask.innovation.studentOrTeam || '');
        setEventDate(currentTask.innovation.eventDate || '');
        setRegistrationDeadline(currentTask.innovation.registrationDeadline || '');
        setVenue(currentTask.innovation.venue || '');
        setOrganizer(currentTask.innovation.organizer || '');
        setLevel(currentTask.innovation.level || 'College');
        setPrize(currentTask.innovation.prize || '');
        setCertificateStatus(currentTask.innovation.certificateStatus || 'Pending');
        setResult(currentTask.innovation.result || 'Awaiting Result');
      }

      setRelatedOrganization(currentTask.relatedOrganization || '');
      setRelatedEvent(currentTask.relatedEvent || '');
      setNotesList(currentTask.notes || []);
      setRecurrence(currentTask.recurrence || 'NONE');
    } else {
      const newId = generateTaskId(allTasksList || []);
      setTaskId(newId);
      setTitle('');
      setDescription('');
      const initialCat = currentPreset || 'DEPARTMENT_WORK';
      setCategory(initialCat);
      setSubcategory(categorySubcategoriesMap[initialCat]?.[0] || 'General');
      setPriority(initialCat === 'TOP_PRIORITY' ? 'CRITICAL' : 'MEDIUM');
      setStatus('NEW');
      setAssignedTo('');
      setCreatedDate(today);
      setStartDate(defaultDueDate || today);
      setDueDate(defaultDueDate || today);
      setReminderDate('');
      setEstimatedTimeHours(2);
      setActualTimeHours(0);
      setFollowUpRequired(initialCat === 'FOLLOW_UPS');
      setFollowUpDate(today);
      setPersonName('');
      setDepartmentOrOrg('');
      setContactType('Phone');
      setContactEmail('');
      setContactPhone('');
      setFollowUpNotes('');

      setPlacementCompany('');
      setPlacementHrName('');
      setPlacementHrEmail('');
      setPlacementHrPhone('');
      setPlacementType('On-Campus Drive');
      setPlacementCtc('');
      setPlacementEligibleBranches('');
      setPlacementDriveDate('');
      setPlacementStudentsCount('');
      setPlacementStatus('Upcoming Drive');
      setPlacementRemarks('');

      setEventName('');
      setStudentOrTeam('');
      setEventDate('');
      setRegistrationDeadline('');
      setVenue('');
      setOrganizer('');
      setLevel('College');
      setPrize('');
      setCertificateStatus('Pending');
      setResult('Awaiting Result');

      setRelatedOrganization('');
      setRelatedEvent('');
      setNotesList([]);
      setRecurrence('NONE');
    }
  }, [existingTask, isOpen, presetCategory]);

  const handleCategoryChange = (newCat: MainCategory) => {
    setCategory(newCat);
    const subList = categorySubcategoriesMap[newCat];
    if (subList && subList.length > 0) {
      setSubcategory(subList[0]);
    }
    if (newCat === 'TOP_PRIORITY') setPriority('CRITICAL');
    if (newCat === 'FOLLOW_UPS') setFollowUpRequired(true);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotesList([...notesList, newNote.trim()]);
      setNewNote('');
    }
  };

  const handleRemoveNote = (idx: number) => {
    setNotesList(notesList.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSyncingWorkspace) return;

    setIsSyncingWorkspace(true);
    setSyncStatusBanner(null);

    const initialLogs = currentTask ? [
      ...(currentTask.activityLogs || []),
      {
        id: `log-${Date.now()}`,
        timestamp: `${today} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        action: 'Updated' as const,
        description: 'Task details updated.'
      }
    ] : [
      {
        id: `log-${Date.now()}`,
        timestamp: `${today} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        action: 'Created' as const,
        description: 'New task created.'
      }
    ];

    const taskToSave: Task = {
      id: taskId,
      title: title.trim(),
      description: description.trim(),
      category,
      subcategory,
      priority,
      status,
      assignedTo: assignedTo.trim() || undefined,
      createdDate,
      startDate,
      dueDate,
      reminderDate: reminderDate || undefined,
      estimatedTimeHours: Number(estimatedTimeHours) || 0,
      actualTimeHours: Number(actualTimeHours) || 0,
      followUpRequired: followUpRequired || category === 'FOLLOW_UPS' || subcategory.toLowerCase().includes('follow-up'),
      followUpDate: followUpDate || dueDate,
      contact: (personName || placementHrName || placementCompany || followUpRequired || category === 'FOLLOW_UPS') ? {
        personName: (personName || placementHrName).trim(),
        departmentOrOrg: (departmentOrOrg || placementCompany || 'Placement Cell').trim(),
        contactType,
        email: (contactEmail || placementHrEmail).trim(),
        phone: (contactPhone || placementHrPhone).trim(),
        nextFollowUpDate: followUpDate || dueDate,
        notes: followUpNotes.trim() || placementRemarks.trim() || (placementCtc ? `CTC: ${placementCtc}` : undefined),
        status: status === 'COMPLETED' ? 'Resolved' : 'Pending'
      } : undefined,
      placement: (placementCompany || subcategory.toLowerCase().includes('placement') || subcategory.toLowerCase().includes('company')) ? {
        companyName: placementCompany.trim() || relatedOrganization.trim() || 'Partner Company / Placement Drive',
        hrName: placementHrName.trim() || personName.trim() || undefined,
        contactEmail: placementHrEmail.trim() || contactEmail.trim() || undefined,
        contactPhone: placementHrPhone.trim() || contactPhone.trim() || undefined,
        placementType,
        ctcPackage: placementCtc.trim() || undefined,
        eligibleBranches: placementEligibleBranches.trim() || undefined,
        driveDate: placementDriveDate || dueDate,
        studentsShortlisted: placementStudentsCount.trim() || undefined,
        placementStatus,
        remarks: placementRemarks.trim() || undefined
      } : undefined,
      innovation: (eventName || category === 'INNOVATION_HUB') ? {
        eventName: eventName.trim(),
        studentOrTeam: studentOrTeam.trim(),
        eventDate,
        registrationDeadline,
        venue: venue.trim(),
        organizer: organizer.trim(),
        participationType: studentOrTeam.includes('&') || studentOrTeam.toLowerCase().includes('team') ? 'Team' : 'Individual',
        level,
        prize: prize.trim(),
        certificateStatus,
        result
      } : undefined,
      relatedOrganization: relatedOrganization.trim() || undefined,
      relatedEvent: relatedEvent.trim() || undefined,
      notes: notesList,
      attachments: currentTask?.attachments || [],
      activityLogs: initialLogs,
      recurrence,
      googleSyncEmail: googleUserEmail || undefined
    };

    // Auto-fix to Google Calendar & Google Tasks if selected
    if (autoSyncCalendar || autoSyncTasks) {
      try {
        const syncRes = await autoFixTaskToGoogleWorkspace(taskToSave, {
          syncCalendar: autoSyncCalendar,
          syncTasks: autoSyncTasks,
          requireAuthPrompt: true
        });

        if (syncRes.success) {
          const targetMail = syncRes.userEmail || googleUserEmail || 'dhananjeiyan.backup@gmail.com';
          taskToSave.googleSyncEmail = targetMail;
          if (syncRes.calendarEvent?.id) {
            taskToSave.googleCalendarEventId = syncRes.calendarEvent.id;
            taskToSave.googleCalendarLink = syncRes.calendarEvent.htmlLink;
          }
          if (syncRes.googleTask?.id) {
            taskToSave.googleTaskId = syncRes.googleTask.id;
          }

          taskToSave.activityLogs.unshift({
            id: `act_${Date.now()}`,
            action: 'Updated',
            description: `Auto-fixed to Google Calendar & Google Tasks for ${targetMail}`,
            timestamp: new Date().toLocaleString()
          });
        } else if (syncRes.error) {
          console.warn('Google Workspace auto-sync note:', syncRes.error);
        }
      } catch (err: any) {
        console.error('Error during auto-sync on create task:', err);
      }
    }

    if (onSave) {
      onSave(taskToSave);
    } else if (onSaveTask) {
      onSaveTask(taskToSave);
    }
    setIsSyncingWorkspace(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
              {taskId}
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {existingTask ? 'Edit Task Details' : 'Create New Task'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs sm:text-sm">
          
          {/* Title & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Prepare Question Paper for CIAT II"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="CRITICAL">🔴 CRITICAL</option>
                <option value="HIGH">🟠 HIGH</option>
                <option value="MEDIUM">🟡 MEDIUM</option>
                <option value="LOW">🟢 LOW</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter comprehensive details, requirements, instructions..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category, Subcategory, Status, Recurrence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Main Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as MainCategory)}
                className="w-full px-2.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-medium"
              >
                <option value="TOP_PRIORITY">🔥 TOP PRIORITY</option>
                <option value="DEPARTMENT_WORK">🏫 DEPARTMENT WORK</option>
                <option value="FOLLOW_UPS">📞 FOLLOW-UPS</option>
                <option value="INSTITUTIONAL_WORK">🏢 INSTITUTIONAL WORK</option>
                <option value="INNOVATION_HUB">💻 INNOVATION HUB</option>
                <option value="PERSONAL_WORK">👤 PERSONAL WORK</option>
                <option value="HOME_WORKS">🏠 HOME WORKS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subcategory
              </label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value as SubCategory)}
                className="w-full px-2.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-medium"
              >
                {categorySubcategoriesMap[category]?.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-2.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold"
              >
                <option value="NEW">🆕 NEW</option>
                <option value="PENDING">🔵 PENDING</option>
                <option value="IN_PROGRESS">🟠 IN PROGRESS</option>
                <option value="ON_HOLD">⏸️ ON HOLD</option>
                <option value="COMPLETED">🟢 COMPLETED</option>
                <option value="OVERDUE">🔴 OVERDUE</option>
                <option value="CANCELLED">❌ CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recurrence
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrencePattern)}
                className="w-full px-2.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-medium"
              >
                <option value="NONE">None (One-time)</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>

          {/* Dates & Time Estimation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Reminder Date
              </label>
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Assigned To
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Person / Role"
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={estimatedTimeHours}
                onChange={(e) => setEstimatedTimeHours(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Actual Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={actualTimeHours}
                onChange={(e) => setActualTimeHours(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Follow-up Section Toggle */}
          <div className="border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-purple-900 dark:text-purple-300 text-xs sm:text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={followUpRequired}
                  onChange={(e) => setFollowUpRequired(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                📞 Requires Person / Inter-departmental Follow-up
              </label>
              {followUpRequired && (
                <span className="text-[11px] font-medium text-purple-700 dark:text-purple-400">
                  Track person & schedule contact
                </span>
              )}
            </div>

            {followUpRequired && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-purple-900 dark:text-purple-300 mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Kumar"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-purple-900 dark:text-purple-300 mb-1">
                    Dept / Organization
                  </label>
                  <input
                    type="text"
                    value={departmentOrOrg}
                    onChange={(e) => setDepartmentOrOrg(e.target.value)}
                    placeholder="e.g. CSE Dept / TechCorp"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-purple-900 dark:text-purple-300 mb-1">
                    Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-lg text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-purple-900 dark:text-purple-300 mb-1">
                    Contact Type
                  </label>
                  <select
                    value={contactType}
                    onChange={(e) => setContactType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-lg text-xs"
                  >
                    <option value="Phone">Phone Call</option>
                    <option value="Email">Email</option>
                    <option value="In-Person">In-Person Meeting</option>
                    <option value="WhatsApp">WhatsApp Message</option>
                    <option value="Official Portal">Official Portal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-purple-900 dark:text-purple-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-purple-900 dark:text-purple-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="person@institution.edu"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-lg text-xs"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[11px] font-semibold text-purple-900 dark:text-purple-300 mb-1">
                    Follow-up Instructions / Notes
                  </label>
                  <input
                    type="text"
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    placeholder="Special instructions, responses received..."
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Placement & Drive Details Section */}
          {(subcategory.toLowerCase().includes('placement') || subcategory.toLowerCase().includes('company') || category === 'DEPARTMENT_WORK' || category === 'FOLLOW_UPS' || category === 'INSTITUTIONAL_WORK') && (
            <div className="border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-blue-900 dark:text-blue-300 text-xs sm:text-sm flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Placement & Corporate Drive Details
                </h4>
                <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-md">
                  Placement & Follow-ups
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={placementCompany}
                    onChange={(e) => setPlacementCompany(e.target.value)}
                    placeholder="e.g. TCS / Infosys / Zoho"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    HR / Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={placementHrName}
                    onChange={(e) => setPlacementHrName(e.target.value)}
                    placeholder="e.g. Ms. Priya Sharma (HR Lead)"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    Placement Activity Type
                  </label>
                  <select
                    value={placementType}
                    onChange={(e) => setPlacementType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold"
                  >
                    <option value="On-Campus Drive">On-Campus Drive</option>
                    <option value="Off-Campus Drive">Off-Campus Drive</option>
                    <option value="Internship">Internship Placement</option>
                    <option value="Industrial Visit">Industrial Visit</option>
                    <option value="Placement Training">Placement Training / Workshop</option>
                    <option value="MOU Signing">MOU / Corporate Partnership</option>
                    <option value="Job Offer Follow-up">Job Offer / LOI Follow-up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    CTC Package Offered
                  </label>
                  <input
                    type="text"
                    value={placementCtc}
                    onChange={(e) => setPlacementCtc(e.target.value)}
                    placeholder="e.g. 6.5 LPA / 12 LPA"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    Eligible Dept / Batches
                  </label>
                  <input
                    type="text"
                    value={placementEligibleBranches}
                    onChange={(e) => setPlacementEligibleBranches(e.target.value)}
                    placeholder="e.g. CSE, ECE, IT (2026 Batch)"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    Drive / Schedule Date
                  </label>
                  <input
                    type="date"
                    value={placementDriveDate}
                    onChange={(e) => setPlacementDriveDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    HR Phone Number
                  </label>
                  <input
                    type="text"
                    value={placementHrPhone}
                    onChange={(e) => setPlacementHrPhone(e.target.value)}
                    placeholder="+91 98765 12345"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    HR Email Address
                  </label>
                  <input
                    type="email"
                    value={placementHrEmail}
                    onChange={(e) => setPlacementHrEmail(e.target.value)}
                    placeholder="hr.drives@company.com"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    Shortlisted / Offers
                  </label>
                  <input
                    type="text"
                    value={placementStudentsCount}
                    onChange={(e) => setPlacementStudentsCount(e.target.value)}
                    placeholder="e.g. 18 Students Selected"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-lg text-xs"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[11px] font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    Placement & Drive Status / Remarks
                  </label>
                  <input
                    type="text"
                    value={placementRemarks}
                    onChange={(e) => setPlacementRemarks(e.target.value)}
                    placeholder="e.g. PPT completed, Round 1 online test scheduled tomorrow..."
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Innovation Hub Specific Section */}
          {category === 'INNOVATION_HUB' && (
            <div className="border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 rounded-xl space-y-3">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-emerald-600" />
                Innovation Hub & Hackathon Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                    Event / Hackathon Name
                  </label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. Smart India Hackathon 2026"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                    Student / Team Name
                  </label>
                  <input
                    type="text"
                    value={studentOrTeam}
                    onChange={(e) => setStudentOrTeam(e.target.value)}
                    placeholder="e.g. Team CodeX"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                    Competition Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as InnovationLevel)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold"
                  >
                    <option value="College">College Level</option>
                    <option value="District">District Level</option>
                    <option value="State">State Level</option>
                    <option value="National">National Level</option>
                    <option value="International">International Level</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                    Reg. Deadline
                  </label>
                  <input
                    type="date"
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                    Venue / Organizer
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Campus Lab / Ministry"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                    Prize / Award
                  </label>
                  <input
                    type="text"
                    value={prize}
                    onChange={(e) => setPrize(e.target.value)}
                    placeholder="₹50,000 / Gold Trophy"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                    Result Status
                  </label>
                  <select
                    value={result}
                    onChange={(e) => setResult(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs"
                  >
                    <option value="Awaiting Result">Awaiting Result</option>
                    <option value="Won 1st Prize">Won 1st Prize</option>
                    <option value="Won 2nd Prize">Won 2nd Prize</option>
                    <option value="Won 3rd Prize">Won 3rd Prize</option>
                    <option value="Finalist">Finalist</option>
                    <option value="Participated">Participated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                    Certificate Status
                  </label>
                  <select
                    value={certificateStatus}
                    onChange={(e) => setCertificateStatus(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Received">Received</option>
                    <option value="Issued">Issued to Student</option>
                    <option value="N/A">N/A</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Quick Notes List */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Add Task Notes / Checkpoints
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNote(); } }}
                placeholder="Enter note or checklist item..."
                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddNote}
                className="px-3 py-1.5 bg-slate-800 text-white dark:bg-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Add Note
              </button>
            </div>

            {notesList.length > 0 && (
              <ul className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                {notesList.map((note, idx) => (
                  <li key={idx} className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/80 dark:border-slate-700">
                    <span>• {note}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveNote(idx)}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Google Calendar & Google Tasks Auto-Fix Integration */}
          <div className="p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 dark:from-slate-800/80 dark:via-indigo-950/40 dark:to-slate-800/80 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-xs text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    Google Workspace Auto-Sync
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold px-2 py-0.5 rounded-full">
                      Auto-Fix
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Auto-fix event & task to Google Calendar & Google Tasks on Create Task
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 shadow-2xs">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="truncate max-w-[170px]" title={googleUserEmail || 'dhananjeiyan.backup@gmail.com'}>
                    {googleUserEmail || 'dhananjeiyan.backup@gmail.com'}
                  </span>
                </div>
                {!isGoogleConnected && (
                  <button
                    type="button"
                    onClick={handleConnectGoogleNow}
                    disabled={isSyncingWorkspace}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                  >
                    {isSyncingWorkspace ? <Loader2 className="w-3 h-3 animate-spin" /> : <ExternalLink className="w-3 h-3" />}
                    <span>Connect Google</span>
                  </button>
                )}
              </div>
            </div>

            {syncStatusBanner && (
              <div className={`p-2 rounded-lg text-xs flex items-center gap-2 ${
                syncStatusBanner.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200' :
                syncStatusBanner.type === 'error' ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200' :
                'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200'
              }`}>
                {syncStatusBanner.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
                {syncStatusBanner.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />}
                <span>{syncStatusBanner.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-indigo-100 dark:border-indigo-900/50">
              <label className="flex items-center gap-2.5 p-2 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={autoSyncCalendar}
                  onChange={(e) => setAutoSyncCalendar(e.target.checked)}
                  className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Auto-Fix to Google Calendar</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={autoSyncTasks}
                  onChange={(e) => setAutoSyncTasks(e.target.checked)}
                  className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold">
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                  <span>Auto-Fix to Google Tasks</span>
                </div>
              </label>
            </div>
          </div>

        </form>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {(autoSyncCalendar || autoSyncTasks) && (
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Will auto-fix to {googleUserEmail || 'dhananjeiyan.backup@gmail.com'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSyncingWorkspace}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSyncingWorkspace}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-75"
            >
              {isSyncingWorkspace ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Fixing to Calendar & Tasks...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{existingTask ? 'Save Changes' : 'Create Task'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
