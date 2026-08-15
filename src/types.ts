export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskStatus = 'NEW' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'OVERDUE' | 'CANCELLED';

export type MainCategory = 
  | 'TOP_PRIORITY'
  | 'DEPARTMENT_WORK'
  | 'FOLLOW_UPS'
  | 'INSTITUTIONAL_WORK'
  | 'INNOVATION_HUB'
  | 'PERSONAL_WORK'
  | 'HOME_WORKS';

export type SubCategory =
  | 'Academic'
  | 'Lesson Plan'
  | 'Syllabus Completion'
  | 'Attendance'
  | 'CIAT / Internal Assessment'
  | 'Examination'
  | 'Student Mentoring'
  | 'Placement'
  | 'Placement Drive'
  | 'Placement Cell'
  | 'Placement Training'
  | 'Placement Follow-up'
  | 'Company HR Follow-up'
  | 'Faculty Follow-up'
  | 'Department Meetings'
  | 'NBA'
  | 'NAAC'
  | 'IQAC'
  | 'NIRF'
  | 'IIPC'
  | 'CDC'
  | 'Accreditation'
  | 'Student Activities'
  | 'Faculty Activities'
  | 'Department Events'
  | 'Reports'
  | 'Documentation'
  // Innovation Hub
  | 'Hackathons'
  | 'Startup Activities'
  | 'Innovation Projects'
  | 'Student Projects'
  | 'Project Expo'
  | 'Incubation'
  | 'Ideation'
  | 'Patents'
  | 'AI/ML Projects'
  | 'Industry Collaboration'
  | 'Competitions'
  | 'Innovation Events'
  | 'Student Achievements'
  | 'Certificates & Awards'
  // Institutional
  | 'Principal Office'
  | 'Academic Office'
  | 'Examination Cell'
  | 'Placement Cell'
  | 'FDP & Workshops'
  // Personal & Home
  | 'Learning & Research'
  | 'Publications'
  | 'NPTEL & Certifications'
  | 'Personal Appointments'
  | 'Shopping & Supplies'
  | 'Bills & Finances'
  | 'Repairs & Maintenance'
  | 'General';

export type InnovationLevel = 'College' | 'District' | 'State' | 'National' | 'International';

export type RecurrencePattern = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: 'Created' | 'Updated' | 'Status Change' | 'Follow-up Contact' | 'Rescheduled' | 'Completed' | 'Note Added' | 'Duplicated' | 'Follow-up Logged';
  description: string;
  author?: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
  uploadedAt: string;
}

export interface InnovationDetails {
  eventName?: string;
  studentOrTeam?: string;
  eventDate?: string;
  registrationDeadline?: string;
  venue?: string;
  organizer?: string;
  participationType?: 'Individual' | 'Team';
  level?: InnovationLevel;
  prize?: string;
  certificateStatus?: 'Pending' | 'Received' | 'Issued' | 'N/A';
  result?: 'Won 1st Prize' | 'Won 2nd Prize' | 'Won 3rd Prize' | 'Finalist' | 'Participated' | 'Awaiting Result';
  remarks?: string;
}

export interface PlacementDetails {
  companyName?: string;
  hrName?: string;
  designation?: string;
  contactEmail?: string;
  contactPhone?: string;
  placementType?: 'On-Campus Drive' | 'Off-Campus Drive' | 'Internship' | 'Industrial Visit' | 'Placement Training' | 'MOU Signing' | 'Job Offer Follow-up';
  ctcPackage?: string; // e.g. "6.5 LPA"
  eligibleBranches?: string; // e.g. "CSE, ECE, IT (2026 Batch)"
  driveDate?: string;
  studentsShortlisted?: string; // e.g. "12 Students"
  placementStatus?: 'Upcoming Drive' | 'Interview Scheduled' | 'Awaiting Offer Letters' | 'Completed' | 'Follow-up Pending';
  remarks?: string;
}

export interface ContactDetails {
  personName?: string;
  departmentOrOrg?: string;
  contactType?: 'Email' | 'Phone' | 'In-Person' | 'WhatsApp' | 'Official Portal';
  email?: string;
  phone?: string;
  lastContactedDate?: string;
  nextFollowUpDate?: string;
  notes?: string;
  status?: 'Pending' | 'Contacted' | 'Awaiting Response' | 'Resolved';
}

export interface Task {
  id: string; // e.g., TASK-1001
  title: string;
  description: string;
  category: MainCategory;
  subcategory: SubCategory;
  priority: Priority;
  status: TaskStatus;
  assignedTo?: string;
  createdDate: string;
  startDate?: string;
  dueDate: string;
  reminderDate?: string;
  completionDate?: string;
  estimatedTimeHours?: number;
  actualTimeHours?: number;
  
  // Follow-up
  followUpRequired?: boolean;
  followUpDate?: string;
  contact?: ContactDetails;
  
  // Placement
  placement?: PlacementDetails;

  // Innovation Hub
  innovation?: InnovationDetails;
  
  // Metadata
  relatedOrganization?: string;
  relatedEvent?: string;
  notes?: string[];
  attachments?: Attachment[];
  activityLogs: ActivityLog[];
  recurrence?: RecurrencePattern;
  isArchived?: boolean;
  googleCalendarEventId?: string;
  googleCalendarLink?: string;
  googleTaskId?: string;
  googleSyncEmail?: string;
}

export interface TaskFilterOptions {
  searchQuery: string;
  category?: MainCategory | 'ALL';
  subcategory?: string | 'ALL';
  priority?: Priority | 'ALL';
  status?: TaskStatus | 'ALL';
  assignedTo?: string;
  dueFilter?: 'ALL' | 'TODAY' | 'TOMORROW' | 'THIS_WEEK' | 'UPCOMING' | 'OVERDUE';
  followUpOnly?: boolean;
}

export interface NotificationItem {
  id: string;
  taskId: string;
  title: string;
  type: 'DUE_TODAY' | 'DUE_TOMORROW' | 'OVERDUE' | 'FOLLOW_UP_DUE' | 'REGISTRATION_DEADLINE' | 'EVENT_DATE' | 'PERSONAL';
  message: string;
  timestamp: string;
  isRead: boolean;
  severity: 'critical' | 'warning' | 'info' | 'success';
}

export type ViewMode = 
  | 'DASHBOARD'
  | 'MY_TASKS'
  | 'TOP_PRIORITY'
  | 'DEPARTMENT_WORK'
  | 'FOLLOW_UPS'
  | 'INSTITUTIONAL_WORK'
  | 'INNOVATION_HUB'
  | 'PERSONAL_WORK'
  | 'HOME_WORKS'
  | 'CALENDAR'
  | 'KANBAN'
  | 'REPORTS';
