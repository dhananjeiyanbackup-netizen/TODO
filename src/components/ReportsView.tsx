import React from 'react';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Award,
  Building2,
  Users,
  Lightbulb
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Task } from '../types';
import { calculateDashboardStats } from '../utils/taskUtils';

interface ReportsViewProps {
  tasks?: Task[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ tasks = [] }) => {
  const safeTasks = tasks || [];
  const stats = calculateDashboardStats(safeTasks);

  // 1. Category Data
  const categoryData = [
    { name: 'Top Priority', count: safeTasks.filter(t => t && t.category === 'TOP_PRIORITY').length, fill: '#ef4444' },
    { name: 'Department', count: safeTasks.filter(t => t && t.category === 'DEPARTMENT_WORK').length, fill: '#3b82f6' },
    { name: 'Follow-ups', count: safeTasks.filter(t => t && t.category === 'FOLLOW_UPS').length, fill: '#a855f7' },
    { name: 'Institutional', count: safeTasks.filter(t => t && t.category === 'INSTITUTIONAL_WORK').length, fill: '#6366f1' },
    { name: 'Innovation', count: safeTasks.filter(t => t && t.category === 'INNOVATION_HUB').length, fill: '#10b981' },
    { name: 'Personal', count: safeTasks.filter(t => t && t.category === 'PERSONAL_WORK').length, fill: '#f59e0b' },
    { name: 'Home', count: safeTasks.filter(t => t && t.category === 'HOME_WORKS').length, fill: '#14b8a6' },
  ];

  // 2. Status Data
  const statusData = [
    { name: 'Completed', count: safeTasks.filter(t => t && t.status === 'COMPLETED').length, fill: '#10b981' },
    { name: 'Pending', count: safeTasks.filter(t => t && t.status === 'PENDING').length, fill: '#3b82f6' },
    { name: 'In Progress', count: safeTasks.filter(t => t && t.status === 'IN_PROGRESS').length, fill: '#f59e0b' },
    { name: 'Overdue', count: safeTasks.filter(t => t && t.status === 'OVERDUE').length, fill: '#ef4444' },
    { name: 'On Hold', count: safeTasks.filter(t => t && t.status === 'ON_HOLD').length, fill: '#64748b' },
    { name: 'New', count: safeTasks.filter(t => t && t.status === 'NEW').length, fill: '#06b6d4' },
  ];

  // 3. Priority Data
  const priorityData = [
    { name: 'Critical', count: safeTasks.filter(t => t && t.priority === 'CRITICAL').length, fill: '#ef4444' },
    { name: 'High', count: safeTasks.filter(t => t && t.priority === 'HIGH').length, fill: '#f97316' },
    { name: 'Medium', count: safeTasks.filter(t => t && t.priority === 'MEDIUM').length, fill: '#f59e0b' },
    { name: 'Low', count: safeTasks.filter(t => t && t.priority === 'LOW').length, fill: '#64748b' },
  ];

  // 4. Completed vs Pending Donut
  const completedVsPendingData = [
    { name: 'Completed Tasks', value: stats.completed, fill: '#10b981' },
    { name: 'Pending / Active Tasks', value: stats.pending, fill: '#3b82f6' },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Analytics & Productivity Reports
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Visual metrics breakdown across departments, priorities, completion ratios, and innovation activities.
        </p>
      </div>

      {/* Top Banner Productivity Metric */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Productivity Formula</span>
          </div>
          <h2 className="text-3xl font-black">
            {stats.completionPercentage}% Overall Completion Rate
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Calculated as: <code className="bg-slate-800 px-2 py-0.5 rounded-md text-emerald-300">Completed Tasks ({stats.completed}) / Total Tasks ({stats.total}) × 100</code>.
          </p>
        </div>

        <div className="w-48 h-48 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={completedVsPendingData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={5}
                dataKey="value"
              >
                {completedVsPendingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute text-center">
            <span className="text-2xl font-black text-white">{stats.completionPercentage}%</span>
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Done</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tasks by Category Bar Chart */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-5 rounded-2xl shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            Tasks Distribution by Main Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cat-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks by Status Pie Chart */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-5 rounded-2xl shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-emerald-500" />
            Tasks Distribution by Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ name, count }) => `${name}: ${count}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`status-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown Bar Chart */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-5 rounded-2xl shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Priority Level Volume Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`prio-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department & Innovation Hub Summary Card */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-500" />
            Key Performance Indicators (KPIs)
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800">
              <span className="text-blue-700 dark:text-blue-300 font-bold block">Critical Tasks</span>
              <span className="text-xl font-black text-blue-900 dark:text-blue-100">{stats.critical}</span>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800">
              <span className="text-red-700 dark:text-red-300 font-bold block">Overdue Items</span>
              <span className="text-xl font-black text-red-900 dark:text-red-100">{stats.overdue}</span>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800">
              <span className="text-purple-700 dark:text-purple-300 font-bold block">Follow-ups Active</span>
              <span className="text-xl font-black text-purple-900 dark:text-purple-100">{stats.followUps}</span>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <span className="text-emerald-700 dark:text-emerald-300 font-bold block">Completed Work</span>
              <span className="text-xl font-black text-emerald-900 dark:text-emerald-100">{stats.completed}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
