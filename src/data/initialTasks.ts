import { Task } from '../types';

const TODAY = '2026-08-12';
const YESTERDAY = '2026-08-11';
const OVERDUE_DATE = '2026-08-08';
const TOMORROW = '2026-08-13';
const THIS_WEEK = '2026-08-15';
const NEXT_WEEK = '2026-08-20';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'TASK-1001',
    title: 'Finalize CIAT-II Question Paper Approval with HOD',
    description: 'Prepare and obtain sign-off for the 3rd Year Data Structures Continuous Internal Assessment Test question papers along with scheme of evaluation.',
    category: 'TOP_PRIORITY',
    subcategory: 'CIAT / Internal Assessment',
    priority: 'CRITICAL',
    status: 'PENDING',
    assignedTo: 'Dr. Ramesh Kumar (HOD CS)',
    createdDate: YESTERDAY,
    startDate: YESTERDAY,
    dueDate: TODAY,
    reminderDate: TODAY,
    estimatedTimeHours: 2.5,
    actualTimeHours: 1,
    followUpRequired: true,
    followUpDate: TODAY,
    contact: {
      personName: 'Dr. Ramesh Kumar',
      departmentOrOrg: 'Computer Science Dept',
      contactType: 'In-Person',
      email: 'ramesh.hod@institution.edu',
      phone: '+91 98765 43210',
      lastContactedDate: YESTERDAY,
      nextFollowUpDate: TODAY,
      notes: 'HOD requested mapped CO-PO matrix attached with the question paper.',
      status: 'Pending'
    },
    relatedOrganization: 'Dept of CSE',
    notes: ['Ensure CO-PO mapping table is attached.', 'Print 3 hard copies for exam cell signature.'],
    attachments: [
      { id: 'att-1', name: 'DS_CIAT_II_QP_Draft.pdf', size: '1.2 MB', type: 'application/pdf', uploadedAt: YESTERDAY },
      { id: 'att-2', name: 'CO_PO_Mapping_DS.xlsx', size: '450 KB', type: 'application/xlsx', uploadedAt: YESTERDAY }
    ],
    activityLogs: [
      { id: 'log-1', timestamp: `${YESTERDAY} 10:00 AM`, action: 'Created', description: 'Task created for urgent CIAT paper submission.' },
      { id: 'log-2', timestamp: `${YESTERDAY} 04:30 PM`, action: 'Follow-up Contact', description: 'Contacted HOD via phone. Requested print copies.' }
    ],
    recurrence: 'NONE'
  },
  {
    id: 'TASK-1002',
    title: 'Submit NBA SAR Criterion 4 Documentation Review',
    description: 'Compile Student Performance data (Pass percentage, Placement, Higher Studies) for 2023-2026 batches.',
    category: 'DEPARTMENT_WORK',
    subcategory: 'NBA',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    assignedTo: 'Prof. Anitha V',
    createdDate: '2026-08-05',
    startDate: '2026-08-06',
    dueDate: TODAY,
    reminderDate: TODAY,
    estimatedTimeHours: 6,
    actualTimeHours: 4,
    followUpRequired: true,
    followUpDate: TODAY,
    contact: {
      personName: 'Prof. Anitha V',
      departmentOrOrg: 'NBA Coordinator Cell',
      contactType: 'Email',
      email: 'anitha.nba@institution.edu',
      phone: '+91 98123 45678',
      lastContactedDate: YESTERDAY,
      nextFollowUpDate: TODAY,
      notes: 'Awaiting placement statistical proof sheets from placement cell.',
      status: 'Awaiting Response'
    },
    relatedOrganization: 'NBA Cell',
    notes: ['Placement coordinator needs to verify company offer letters.'],
    activityLogs: [
      { id: 'log-3', timestamp: '2026-08-05 09:00 AM', action: 'Created', description: 'Task initialized for NBA SAR Criterion 4.' }
    ],
    recurrence: 'NONE'
  },
  {
    id: 'TASK-1003',
    title: 'Smart India Hackathon 2026 Internal Screening Round',
    description: 'Coordinate internal jury panel and shortlist top 10 student teams for SIH 2026 submission.',
    category: 'INNOVATION_HUB',
    subcategory: 'Hackathons',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedTo: 'Innovation Hub Student Leads',
    createdDate: '2026-08-01',
    startDate: '2026-08-10',
    dueDate: TOMORROW,
    reminderDate: TODAY,
    estimatedTimeHours: 8,
    actualTimeHours: 5,
    innovation: {
      eventName: 'Smart India Hackathon 2026',
      studentOrTeam: 'Team CodeX & Team NeuralVerse',
      eventDate: '2026-08-25',
      registrationDeadline: TOMORROW,
      venue: 'Main Innovation Lab Auditorium',
      organizer: 'Ministry of Education & Innovation Cell',
      participationType: 'Team',
      level: 'National',
      prize: '₹1,000,000 Total Pool',
      certificateStatus: 'Pending',
      result: 'Awaiting Result',
      remarks: '22 teams submitted PPT pitch decks for internal evaluation.'
    },
    relatedOrganization: 'Institution Innovation Council (IIC)',
    notes: ['Ensure nomination letters signed by Principal before deadline.'],
    activityLogs: [
      { id: 'log-4', timestamp: '2026-08-01 11:30 AM', action: 'Created', description: 'Registered hackathon tracking.' }
    ],
    recurrence: 'NONE'
  },
  {
    id: 'TASK-1004',
    title: 'Follow-up with TechCorp for MoU Signing & Student Internships',
    description: 'Contact HR Lead Mr. Suresh for finalizing the IIPC MoU draft and 15 student summer internship slots.',
    category: 'FOLLOW_UPS',
    subcategory: 'Industry Collaboration',
    priority: 'HIGH',
    status: 'PENDING',
    assignedTo: 'IIPC Coordinator',
    createdDate: OVERDUE_DATE,
    startDate: OVERDUE_DATE,
    dueDate: TODAY,
    reminderDate: TODAY,
    followUpRequired: true,
    followUpDate: TODAY,
    contact: {
      personName: 'Mr. Suresh Nair',
      departmentOrOrg: 'TechCorp Pvt Ltd',
      contactType: 'Phone',
      email: 'suresh.nair@techcorp.com',
      phone: '+91 94444 12345',
      lastContactedDate: OVERDUE_DATE,
      nextFollowUpDate: TODAY,
      notes: 'Draft MoU sent last week. Legal team review was pending.',
      status: 'Pending'
    },
    relatedOrganization: 'TechCorp Pvt Ltd / IIPC',
    notes: ['Principal office has approved the MoU terms.'],
    activityLogs: [
      { id: 'log-5', timestamp: `${OVERDUE_DATE} 02:00 PM`, action: 'Created', description: 'Follow-up task created.' }
    ],
    recurrence: 'NONE'
  },
  {
    id: 'TASK-1005',
    title: 'Submit Monthly NAAC IQAC AQAR Department Metrics Report',
    description: 'Compile monthly research publications, FDPs attended by faculty, and student achievements.',
    category: 'INSTITUTIONAL_WORK',
    subcategory: 'NAAC',
    priority: 'HIGH',
    status: 'OVERDUE',
    assignedTo: 'IQAC Department Representative',
    createdDate: '2026-08-01',
    startDate: '2026-08-01',
    dueDate: OVERDUE_DATE,
    reminderDate: OVERDUE_DATE,
    estimatedTimeHours: 3,
    actualTimeHours: 1,
    relatedOrganization: 'IQAC Cell',
    notes: ['Overdue by 4 days! IQAC Director sent reminder email.'],
    activityLogs: [
      { id: 'log-6', timestamp: '2026-08-01 09:00 AM', action: 'Created', description: 'AQAR Monthly report requirement.' }
    ],
    recurrence: 'MONTHLY'
  },
  {
    id: 'TASK-1006',
    title: 'NPTEL Deep Learning Course Assignment 4 Submission',
    description: 'Complete and submit assignment 4 on Convolutional Neural Networks on the Swayam Portal.',
    category: 'PERSONAL_WORK',
    subcategory: 'NPTEL & Certifications',
    priority: 'MEDIUM',
    status: 'PENDING',
    createdDate: '2026-08-09',
    dueDate: THIS_WEEK,
    estimatedTimeHours: 2,
    notes: ['Score counts towards 25% internal weightage for NPTEL Gold badge.'],
    activityLogs: [
      { id: 'log-7', timestamp: '2026-08-09 08:00 PM', action: 'Created', description: 'Added personal learning goal.' }
    ],
    recurrence: 'WEEKLY'
  },
  {
    id: 'TASK-1007',
    title: 'Pay Annual Home Broadband & Electricity Bills',
    description: 'Pay TNEB Electricity bill and Fiber Wifi internet renewal bill online via UPI.',
    category: 'HOME_WORKS',
    subcategory: 'Bills & Finances',
    priority: 'HIGH',
    status: 'COMPLETED',
    createdDate: '2026-08-10',
    dueDate: YESTERDAY,
    completionDate: YESTERDAY,
    estimatedTimeHours: 0.5,
    actualTimeHours: 0.3,
    notes: ['Transaction receipt downloaded to Drive.'],
    activityLogs: [
      { id: 'log-8', timestamp: '2026-08-10 07:00 PM', action: 'Created', description: 'Home bill reminder set.' },
      { id: 'log-9', timestamp: `${YESTERDAY} 09:15 PM`, action: 'Completed', description: 'Paid bill ₹2,450 via GPay.' }
    ],
    recurrence: 'MONTHLY'
  },
  {
    id: 'TASK-1008',
    title: 'State Level AI Project Expo Certificate Distribution',
    description: 'Issue official participation and winner certificates for 45 student teams from 12 colleges.',
    category: 'INNOVATION_HUB',
    subcategory: 'Project Expo',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    assignedTo: 'Innovation Hub Coordinator',
    createdDate: '2026-08-02',
    dueDate: YESTERDAY,
    completionDate: YESTERDAY,
    innovation: {
      eventName: 'State AI & Robotics Expo 2026',
      studentOrTeam: '45 Regional Student Teams',
      eventDate: '2026-08-05',
      organizer: 'State Innovation Council & College IH',
      venue: 'Campus Tech Park',
      level: 'State',
      prize: '₹150,000 Cash Prizes',
      certificateStatus: 'Issued',
      result: 'Won 1st Prize',
      remarks: 'First prize won by CS Dept team for Smart Agriculture Drone.'
    },
    activityLogs: [
      { id: 'log-10', timestamp: '2026-08-02 10:00 AM', action: 'Created', description: 'State expo certificates tracking.' },
      { id: 'log-11', timestamp: `${YESTERDAY} 05:00 PM`, action: 'Completed', description: 'All 120 printed certificates signed and dispatched.' }
    ],
    recurrence: 'NONE'
  },
  {
    id: 'TASK-1009',
    title: 'Weekly Faculty Meeting Agenda & Minutes Documentation',
    description: 'Circulate meeting minutes for the 10th August faculty review meeting and collect action item updates.',
    category: 'DEPARTMENT_WORK',
    subcategory: 'Department Meetings',
    priority: 'MEDIUM',
    status: 'ON_HOLD',
    assignedTo: 'Dept Secretary',
    createdDate: '2026-08-10',
    dueDate: NEXT_WEEK,
    estimatedTimeHours: 1.5,
    notes: ['Waiting for Principal office approval on faculty sabbatical clause.'],
    activityLogs: [
      { id: 'log-12', timestamp: '2026-08-10 04:00 PM', action: 'Created', description: 'Minutes circulation draft.' }
    ],
    recurrence: 'WEEKLY'
  },
  {
    id: 'TASK-1010',
    title: 'Follow-up with Controller of Examinations regarding Special Retest',
    description: 'Verify list of 8 sports quota students eligible for supplementary exam schedule.',
    category: 'FOLLOW_UPS',
    subcategory: 'Examination',
    priority: 'HIGH',
    status: 'PENDING',
    assignedTo: 'Exam Cell Coordinator',
    createdDate: TODAY,
    dueDate: TOMORROW,
    followUpRequired: true,
    followUpDate: TOMORROW,
    contact: {
      personName: 'Dr. Subramanian',
      departmentOrOrg: 'Controller of Examinations Office',
      contactType: 'Official Portal',
      email: 'coe@institution.edu',
      phone: '+91 94321 87654',
      lastContactedDate: TODAY,
      nextFollowUpDate: TOMORROW,
      notes: 'Submitted petition along with Physical Director recommendation.',
      status: 'Pending'
    },
    activityLogs: [
      { id: 'log-13', timestamp: `${TODAY} 09:30 AM`, action: 'Created', description: 'CoE office follow up.' }
    ],
    recurrence: 'NONE'
  },
  {
    id: 'TASK-1011',
    title: 'Submit Research Paper on Transformers to IEEE Conference',
    description: 'Finalize camera-ready PDF, IEEE copyright form, and author registration payment.',
    category: 'PERSONAL_WORK',
    subcategory: 'Publications',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    createdDate: '2026-08-01',
    dueDate: '2026-08-18',
    estimatedTimeHours: 12,
    actualTimeHours: 8,
    notes: ['College research seed grant reimbursed 50% of registration fee.'],
    activityLogs: [
      { id: 'log-14', timestamp: '2026-08-01 08:00 AM', action: 'Created', description: 'IEEE Paper submission target.' }
    ],
    recurrence: 'NONE'
  },
  {
    id: 'TASK-1012',
    title: 'Order Lab Computer Supplies & Replacement SSDs',
    description: 'Purchase 10x 512GB NVMe SSDs for Innovation Hub Workstation upgrade.',
    category: 'HOME_WORKS',
    subcategory: 'Shopping & Supplies',
    priority: 'LOW',
    status: 'PENDING',
    createdDate: TODAY,
    dueDate: NEXT_WEEK,
    estimatedTimeHours: 1,
    notes: ['Compare quotes on GeM portal vs Amazon Business.'],
    activityLogs: [
      { id: 'log-15', timestamp: `${TODAY} 11:00 AM`, action: 'Created', description: 'Lab supplies purchase.' }
    ],
    recurrence: 'NONE'
  },
  {
    id: 'TASK-1013',
    title: 'TCS Digital & Ninja On-Campus Placement Drive Coordination',
    description: 'Coordinate lab allocation for 250 CSE/IT students, arrange online test proctors, and finalize HR hospitality.',
    category: 'DEPARTMENT_WORK',
    subcategory: 'Placement Drive',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    assignedTo: 'Placement Cell Coordinator',
    createdDate: YESTERDAY,
    dueDate: TOMORROW,
    reminderDate: TODAY,
    estimatedTimeHours: 6,
    actualTimeHours: 3,
    followUpRequired: true,
    followUpDate: TODAY,
    contact: {
      personName: 'Ms. Priya Sharma',
      departmentOrOrg: 'TCS Campus Recruitment Team',
      contactType: 'Phone',
      email: 'priya.sharma@tcs.com',
      phone: '+91 98765 11223',
      lastContactedDate: TODAY,
      nextFollowUpDate: TODAY,
      notes: 'HR confirmed online test link distribution at 09:00 AM tomorrow.',
      status: 'Pending'
    },
    placement: {
      companyName: 'TCS (Tata Consultancy Services)',
      hrName: 'Ms. Priya Sharma (Campus Talent Acquisition Lead)',
      contactEmail: 'priya.sharma@tcs.com',
      contactPhone: '+91 98765 11223',
      placementType: 'On-Campus Drive',
      ctcPackage: '7.2 LPA (Digital) / 3.8 LPA (Ninja)',
      eligibleBranches: 'CSE, IT, ECE, EEE (2026 Batch)',
      driveDate: TOMORROW,
      studentsShortlisted: '240 Students Registered',
      placementStatus: 'Upcoming Drive',
      remarks: 'Lab 1 to 4 reserved with high-speed internet and power backup.'
    },
    notes: ['Send hall ticket reminders to students.', 'Arrange auditorium for PPT session.'],
    activityLogs: [
      { id: 'log-16', timestamp: `${YESTERDAY} 02:00 PM`, action: 'Created', description: 'TCS placement drive task created.' }
    ],
    recurrence: 'NONE'
  },
  {
    id: 'TASK-1014',
    title: 'HR Follow-up for Zoho Corporation MOU & Internship Drive',
    description: 'Follow up with Zoho HR lead regarding signed MOU document and 6-month stipend internship offers.',
    category: 'FOLLOW_UPS',
    subcategory: 'Placement Follow-up',
    priority: 'HIGH',
    status: 'PENDING',
    assignedTo: 'Dr. Vignesh (Placement Director)',
    createdDate: TODAY,
    dueDate: THIS_WEEK,
    reminderDate: TODAY,
    estimatedTimeHours: 2,
    followUpRequired: true,
    followUpDate: TODAY,
    contact: {
      personName: 'Mr. Rajesh K',
      departmentOrOrg: 'Zoho Corporation HR',
      contactType: 'Email',
      email: 'rajesh.k@zohocorp.com',
      phone: '+91 94455 66778',
      lastContactedDate: YESTERDAY,
      nextFollowUpDate: TODAY,
      notes: 'Awaiting revised MOU draft from Zoho legal team.',
      status: 'Pending'
    },
    placement: {
      companyName: 'Zoho Corporation',
      hrName: 'Mr. Rajesh K (University Relations Manager)',
      contactEmail: 'rajesh.k@zohocorp.com',
      contactPhone: '+91 94455 66778',
      placementType: 'Internship',
      ctcPackage: '25,000 / month stipend (PPO up to 8.5 LPA)',
      eligibleBranches: 'All B.E / B.Tech Batches',
      driveDate: NEXT_WEEK,
      studentsShortlisted: '15 Interns Shortlisted',
      placementStatus: 'Follow-up Pending',
      remarks: 'Follow up on Principal sign-off once Zoho legal sends draft.'
    },
    activityLogs: [
      { id: 'log-17', timestamp: `${TODAY} 10:30 AM`, action: 'Created', description: 'Zoho MOU follow up initialized.' }
    ],
    recurrence: 'NONE'
  }
];
