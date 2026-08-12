import React, { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  FileCheck, 
  Users, 
  Award, 
  Search, 
  Filter, 
  Plus, 
  BookOpen, 
  Calendar
} from 'lucide-react';
import { Task, SubCategory, Priority, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

interface DepartmentDashboardViewProps {
  tasks?: Task[];
  onSelectTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onQuickAdd: (categoryPreset?: string) => void;
}

export const DepartmentDashboardView: React.FC<DepartmentDashboardViewProps> = ({
  tasks = [],
  onSelectTask,
  onUpdateStatus,
  onQuickAdd
}) => {
  const safeTasks = tasks || [];
  const deptTasks = safeTasks.filter(t => t && (t.category === 'DEPARTMENT_WORK' || t.category === 'TOP_PRIORITY' || t.category === 'INSTITUTIONAL_WORK'));

  // Filter States
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');

  // Metrics
  const pendingCount = deptTasks.filter(t => t && t.status !== 'COMPLETED').length;
  const facultyFollowups = safeTasks.filter(t => t && (t.subcategory === 'Faculty Follow-up' || t.contact?.personName?.includes('Faculty') || t.contact?.personName?.includes('HOD') || t.contact?.personName?.includes('Dr.'))).length;
  const studentFollowups = safeTasks.filter(t => t && (t.subcategory === 'Student Mentoring' || t.subcategory === 'Student Activities')).length;
  const academicWork = deptTasks.filter(t => ['Academic', 'Lesson Plan', 'Syllabus Completion', 'Attendance'].includes(t.subcategory)).length;
  const examWork = deptTasks.filter(t => ['CIAT / Internal Assessment', 'Examination', 'Examination Cell'].includes(t.subcategory)).length;
  const nbaNaacWork = deptTasks.filter(t => ['NBA', 'NAAC', 'Accreditation'].includes(t.subcategory)).length;
  const iqacWork = deptTasks.filter(t => ['IQAC', 'NIRF'].includes(t.subcategory)).length;
  const reportsPending = deptTasks.filter(t => t.subcategory === 'Reports' && t.status !== 'COMPLETED').length;
  const docsPending = deptTasks.filter(t => t.subcategory === 'Documentation' && t.status !== 'COMPLETED').length;

  const filteredTasks = deptTasks.filter(t => {
    if (selectedSubcategory !== 'ALL' && t.subcategory !== selectedSubcategory) return false;
    if (selectedPriority !== 'ALL' && t.priority !== selectedPriority) return false;
    if (selectedStatus !== 'ALL' && t.status !== selectedStatus) return false;
    if (assigneeFilter.trim() && !t.assignedTo?.toLowerCase().includes(assigneeFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Department Work Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track academic schedules, CIAT exams, NBA/NAAC accreditations, and faculty mentoring.
          </p>
        </div>

        <button
          onClick={() => onQuickAdd('DEPARTMENT_WORK')}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Dept Task</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl">
          <span className="text-xs text-blue-700 dark:text-blue-300 font-bold block">Pending Dept Tasks</span>
          <span className="text-2xl font-black text-blue-900 dark:text-blue-100">{pendingCount}</span>
        </div>

        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl">
          <span className="text-xs text-purple-700 dark:text-purple-300 font-bold block">Faculty Follow-ups</span>
          <span className="text-2xl font-black text-purple-900 dark:text-purple-100">{facultyFollowups}</span>
        </div>

        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
          <span className="text-xs text-emerald-700 dark:text-emerald-300 font-bold block">Student Mentoring</span>
          <span className="text-2xl font-black text-emerald-900 dark:text-emerald-100">{studentFollowups}</span>
        </div>

        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl">
          <span className="text-xs text-indigo-700 dark:text-indigo-300 font-bold block">NBA / NAAC Work</span>
          <span className="text-2xl font-black text-indigo-900 dark:text-indigo-100">{nbaNaacWork}</span>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <span className="text-xs text-amber-700 dark:text-amber-300 font-bold block">Examination / CIAT</span>
          <span className="text-2xl font-black text-amber-900 dark:text-amber-100">{examWork}</span>
        </div>
      </div>

      {/* Subcategory Quick Tabs */}
      <div className="p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filter Department Work</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-600 font-semibold"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">🔴 Critical</option>
              <option value="HIGH">🟠 High</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="LOW">🟢 Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-600 font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="OVERDUE">Overdue</option>
              <option value="COMPLETED">Completed</option>
            </select>

            {/* Faculty Search */}
            <input
              type="text"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              placeholder="Faculty / Assignee name..."
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-600"
            />
          </div>
        </div>

        {/* Subcategory Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
          <button
            onClick={() => setSelectedSubcategory('ALL')}
            className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
              selectedSubcategory === 'ALL'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Subcategories ({deptTasks.length})
          </button>
          {['Academic', 'CIAT / Internal Assessment', 'Examination', 'NBA', 'NAAC', 'IQAC', 'Faculty Follow-up', 'Reports', 'Documentation'].map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                selectedSubcategory === sub
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onSelectTask={onSelectTask}
              onUpdateStatus={onUpdateStatus}
            />
          ))
        ) : (
          <div className="col-span-full p-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border">
            No department tasks match the selected filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
