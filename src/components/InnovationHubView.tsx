import React, { useState } from 'react';
import { 
  Lightbulb, 
  Trophy, 
  Award, 
  Users, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Medal,
  Globe,
  MapPin
} from 'lucide-react';
import { Task, InnovationLevel, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

interface InnovationHubViewProps {
  tasks?: Task[];
  onSelectTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onQuickAdd: (categoryPreset?: string) => void;
}

export const InnovationHubView: React.FC<InnovationHubViewProps> = ({
  tasks = [],
  onSelectTask,
  onUpdateStatus,
  onQuickAdd
}) => {
  const safeTasks = tasks || [];
  const innovationTasks = safeTasks.filter(t => t && (t.category === 'INNOVATION_HUB' || t.innovation));

  const [levelFilter, setLevelFilter] = useState<string>('ALL');

  // Metrics calculation
  const upcomingHackathons = innovationTasks.filter(t => t.subcategory === 'Hackathons').length;
  const awardsCount = innovationTasks.filter(t => t.innovation?.result?.includes('Won') || t.innovation?.prize).length;
  const certsPending = innovationTasks.filter(t => t.innovation?.certificateStatus === 'Pending').length;
  const certsIssued = innovationTasks.filter(t => t.innovation?.certificateStatus === 'Issued' || t.innovation?.certificateStatus === 'Received').length;
  const nationalCount = innovationTasks.filter(t => t.innovation?.level === 'National' || t.innovation?.level === 'International').length;

  const filteredTasks = innovationTasks.filter(t => {
    if (levelFilter !== 'ALL' && t.innovation?.level !== levelFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Innovation Hub & Student Startup Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track hackathons, patent applications, project expos, incubation, and state/national awards.
          </p>
        </div>

        <button
          onClick={() => onQuickAdd('INNOVATION_HUB')}
          className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Innovation Activity</span>
        </button>
      </div>

      {/* Innovation Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-bold text-xs mb-1">
            <span>Hackathons</span>
            <Lightbulb className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-900 dark:text-emerald-100">{upcomingHackathons}</span>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Active competitions</p>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-300 font-bold text-xs mb-1">
            <span>Awards & Prizes</span>
            <Trophy className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-900 dark:text-amber-100">{awardsCount}</span>
          <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Won / Recognized</p>
        </div>

        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl">
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300 font-bold text-xs mb-1">
            <span>National / Global</span>
            <Globe className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-indigo-900 dark:text-indigo-100">{nationalCount}</span>
          <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-medium">High level participation</p>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl">
          <div className="flex items-center justify-between text-purple-700 dark:text-purple-300 font-bold text-xs mb-1">
            <span>Certificates Pending</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-black text-purple-900 dark:text-purple-100">{certsPending}</span>
          <p className="text-[10px] text-purple-700 dark:text-purple-400 font-medium">Awaiting issuance</p>
        </div>

        <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl">
          <div className="flex items-center justify-between text-teal-700 dark:text-teal-300 font-bold text-xs mb-1">
            <span>Certificates Issued</span>
            <Award className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-2xl font-black text-teal-900 dark:text-teal-100">{certsIssued}</span>
          <p className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">Dispatched to students</p>
        </div>
      </div>

      {/* Achievement Tracker Table (Section 11) */}
      <section className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Innovation Achievement & Event Tracker
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Master table recording competitions, participating teams, organizer details, prizes, and certificates.
            </p>
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Level:</span>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-600 font-bold"
            >
              <option value="ALL">All Levels</option>
              <option value="College">College</option>
              <option value="District">District</option>
              <option value="State">State</option>
              <option value="National">National</option>
              <option value="International">International</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3">Event Name</th>
                <th className="py-3 px-3">Student / Team</th>
                <th className="py-3 px-3">Organizer</th>
                <th className="py-3 px-3">Date & Venue</th>
                <th className="py-3 px-3">Level</th>
                <th className="py-3 px-3">Result</th>
                <th className="py-3 px-3">Prize</th>
                <th className="py-3 px-3">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTasks.map((t) => {
                const inv = t.innovation;
                return (
                  <tr 
                    key={t.id} 
                    onClick={() => onSelectTask(t)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                      {inv?.eventName || t.title}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {inv?.studentOrTeam || t.assignedTo || 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {inv?.organizer || t.relatedOrganization || 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      <div>{inv?.eventDate || t.dueDate}</div>
                      <div className="text-[10px] text-slate-400">{inv?.venue}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        inv?.level === 'National' || inv?.level === 'International' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' 
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {inv?.level || 'College'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {inv?.result || 'Awaiting'}
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-600 dark:text-amber-400">
                      {inv?.prize || 'N/A'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        inv?.certificateStatus === 'Issued' || inv?.certificateStatus === 'Received'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {inv?.certificateStatus || 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Innovation Task Cards Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
          Innovation Hub Task Cards
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onSelectTask={onSelectTask}
              onUpdateStatus={onUpdateStatus}
            />
          ))}
        </div>
      </div>

    </div>
  );
};
