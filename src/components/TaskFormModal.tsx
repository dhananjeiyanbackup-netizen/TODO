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
  AlertCircle
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
      'CIAT / Internal Assessment', 'Examination', 'Student Mentoring', 
      'Faculty Follow-up', 'Department Meetings', 'NBA', 'NAAC', 'IQAC', 
      'NIRF', 'IIPC', 'CDC', 'Accreditation', 'Student Activities', 
      'Faculty Activities', 'Department Events', 'Reports', 'Documentation'
    ],
    FOLLOW_UPS: [
      'Faculty Follow-up', 'Student Mentoring', 'Industry Collaboration', 
      'Accreditation', 'CIAT / Internal Assessment', 'Examination', 'Reports'
    ],
    INSTITUTIONAL_WORK: [
      'Principal Office', 'Academic Office', 'Examination Cell', 'IQAC', 
      'NAAC', 'NBA', 'NIRF', 'Placement Cell', 'IIPC', 'FDP & Workshops', 
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

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
      followUpRequired: followUpRequired || category === 'FOLLOW_UPS',
      followUpDate: followUpDate || dueDate,
      contact: (personName || followUpRequired || category === 'FOLLOW_UPS') ? {
        personName: personName.trim(),
        departmentOrOrg: departmentOrOrg.trim(),
        contactType,
        email: contactEmail.trim(),
        phone: contactPhone.trim(),
        nextFollowUpDate: followUpDate || dueDate,
        notes: followUpNotes.trim(),
        status: status === 'COMPLETED' ? 'Resolved' : 'Pending'
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
      activityLogs: currentTask ? [
        ...(currentTask.activityLogs || []),
        {
          id: `log-${Date.now()}`,
          timestamp: `${today} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          action: 'Updated',
          description: 'Task details updated.'
        }
      ] : [
        {
          id: `log-${Date.now()}`,
          timestamp: `${today} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          action: 'Created',
          description: 'New task created.'
        }
      ],
      recurrence
    };

    if (onSave) {
      onSave(taskToSave);
    } else if (onSaveTask) {
      onSaveTask(taskToSave);
    }
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

        </form>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{existingTask ? 'Save Changes' : 'Create Task'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
