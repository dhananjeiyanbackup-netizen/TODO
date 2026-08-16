import React from 'react';
import { X, Download, Upload, RotateCcw, Database, Moon, Sun, ShieldCheck } from 'lucide-react';
import { Task } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onImportData: (tasks: Task[]) => void;
  onResetSampleData: () => void;
  onClearAllData?: () => void;
  onAddAllToDb?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onImportData,
  onResetSampleData,
  onClearAllData,
  onAddAllToDb,
  isDarkMode,
  onToggleDarkMode
}) => {
  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `WorkManager_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedTasks = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedTasks)) {
          onImportData(importedTasks);
          alert('Tasks successfully imported!');
          onClose();
        } else {
          alert('Invalid backup format. Must be an array of tasks.');
        }
      } catch (err) {
        alert('Error parsing JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              System Settings & Data Management
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4 text-xs">
          
          {/* Dark Mode */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block">Theme Appearance</span>
              <span className="text-slate-500 text-[11px]">Toggle Dark / Light mode UI</span>
            </div>
            <button
              onClick={onToggleDarkMode}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>

          {/* Backup & Export */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block">Backup Local Data</span>
              <span className="text-slate-500 text-[11px]">Download all tasks, logs, contacts, and innovation records as JSON.</span>
            </div>
            <button
              onClick={handleExportJSON}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export Backup File (.json)
            </button>
          </div>

          {/* Restore / Import */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block">Restore from Backup</span>
              <span className="text-slate-500 text-[11px]">Upload a previously saved JSON backup file.</span>
            </div>
            <label className="w-full py-2 bg-slate-800 text-white dark:bg-slate-700 hover:bg-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" /> Import Backup File
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>

          {/* Add All into Database (Batch Sync) */}
          {onAddAllToDb && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
              <div>
                <span className="font-bold text-emerald-900 dark:text-emerald-200 block flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-600" />
                  Add All Tasks into Database
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                  Batch save and sync all comprehensive task datasets directly into your live Firestore cloud database.
                </span>
              </div>
              <button
                onClick={() => {
                  onAddAllToDb();
                  onClose();
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Database className="w-4 h-4" /> Add All into Database Now
              </button>
            </div>
          )}

          {/* Reset Sample Data */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block">Load Sample Dataset</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Populate database with demo tasks for department & innovation hub.</span>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Load sample dataset into Firestore database? Existing tasks will be replaced.')) {
                  onResetSampleData();
                  onClose();
                }
              }}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Load Sample Dataset
            </button>
          </div>

          {/* Clear All Data */}
          {onClearAllData && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800/80 space-y-2">
              <div>
                <span className="font-bold text-red-900 dark:text-red-200 block">Clear All Database Tasks</span>
                <span className="text-red-700 dark:text-red-400 text-[11px]">Wipe all tasks from your cloud database for a completely fresh start.</span>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete ALL tasks from your database? This action cannot be undone.')) {
                    onClearAllData();
                    onClose();
                  }
                }}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4" /> Clear All Tasks
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
