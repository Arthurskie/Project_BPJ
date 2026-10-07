import React, { useState, useEffect, useRef } from 'react';
import { FileText, Database, Users, TrendingUp, Calendar, Clock, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from '../../contexts/FormContext';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const dashboardRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { title: 'Total Forms', value: '124', icon: FileText, color: 'text-slate-700' },
    { title: 'Total Submissions', value: '8,432', icon: Database, color: 'text-slate-700' },
    { title: 'Active Users', value: '1,204', icon: Users, color: 'text-slate-700' },
    { title: 'Conversion Rate', value: '64.2%', icon: TrendingUp, color: 'text-slate-700' },
  ];

  const navigate = useNavigate();
  const { forms } = useFormContext();
  const recentForms = forms.slice(0, 5);

  return (
    <div className="space-y-6" ref={dashboardRef}>
      {isLoading && (
        <div className="text-sm text-slate-500 dark:text-neutral-400 animate-pulse mb-2">Updating dashboard data...</div>
      )}
      <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 dark:text-neutral-400 text-sm mt-1">Welcome back! Here's what's happening with your forms today.</p>
        </div>
        <button 
          onClick={() => navigate('/forms/new')}
          className="flex items-center gap-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
          <Plus size={16} />
          Create New Form
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="p-5 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 shadow-sm animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-700/50 text-slate-700 dark:text-neutral-300">
                <stat.icon size={20} />
              </div>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-500/20">
                +12%
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-slate-500 dark:text-neutral-400 text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Form Creation History Section */}
      <div className="rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Form Creation History</h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Track recently created forms, their dates, and times.</p>
          </div>
          <button onClick={() => navigate('/forms')} className="text-sm text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">
            View All &rarr;
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-neutral-900/50">
              <tr className="text-slate-500 dark:text-neutral-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-neutral-800">
                <th className="px-6 py-3 font-medium">Form Name</th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">Creator</th>
                <th className="px-6 py-3 font-medium">Date & Time</th>
                <th className="px-6 py-3 font-medium text-center">Responses</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-neutral-800 text-sm">
              {recentForms.map((form) => (
                <tr key={form.id} className="hover:bg-slate-50 dark:hover:bg-neutral-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {form.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-neutral-400 hidden md:table-cell text-sm">
                    {form.creator}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-neutral-400 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{form.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{form.time}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center text-slate-700 dark:text-neutral-300 font-medium">
                      {form.responses}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-neutral-300">
                      <span className={`w-2 h-2 rounded-full ${
                        form.status === 'Active' ? 'bg-emerald-500' :
                        form.status === 'Draft' ? 'bg-amber-500' :
                        'bg-slate-400 dark:bg-neutral-500'
                      }`}></span>
                      {form.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
