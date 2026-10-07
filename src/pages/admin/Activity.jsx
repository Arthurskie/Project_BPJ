import React, { useState, useEffect, useRef } from 'react';

export default function Activity() {
  const [filter, setFilter] = useState('All');
  const activityListRef = useRef(null);

  useEffect(() => {
    if (activityListRef.current) {
      activityListRef.current.style.opacity = '0.5';
      const timer = setTimeout(() => {
        if (activityListRef.current) activityListRef.current.style.opacity = '1';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [filter]);

  const activities = [
    { id: 1, user: 'Sarah Jenkins', action: 'created form', target: 'Customer Satisfaction Survey 2026', time: '10:30 AM, Today' },
    { id: 2, user: 'Admin User', action: 'deleted form', target: 'Old Event Registration', time: '09:15 AM, Today' },
    { id: 3, user: 'System', action: 'generated report', target: 'Monthly Submissions', time: '12:00 AM, Today' },
    { id: 4, user: 'Mark Otto', action: 'edited settings', target: 'Email Notifications', time: '04:45 PM, Yesterday' },
    { id: 5, user: 'Sarah Jenkins', action: 'published form', target: 'Support Ticket Intake', time: '11:20 AM, Yesterday' },
  ];

  const filteredActivities = filter === 'All' ? activities : activities.filter(a => a.user === filter);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Activity Log</h2>
        <p className="text-slate-500 dark:text-neutral-400 text-sm mt-1">Track everything happening across your forms.</p>
      </div>

      <div className="bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl shadow-sm p-6">
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-neutral-800 pb-4">
          {['All', 'Sarah Jenkins', 'Admin User', 'System'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-slate-900 dark:bg-neutral-100 text-white dark:text-neutral-900' : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-800'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative border-l-2 border-slate-200 dark:border-neutral-800 ml-3 md:ml-6 space-y-8 py-2 transition-opacity duration-300" ref={activityListRef}>
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="relative pl-6 md:pl-8">
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-black border-2 border-slate-900 dark:border-neutral-100"></div>
              <div className="bg-white dark:bg-neutral-900/50 p-4 rounded-lg border border-slate-200 dark:border-neutral-700 shadow-sm">
                <p className="text-slate-900 dark:text-neutral-100 text-sm">
                  <span className="font-bold">{activity.user}</span> {activity.action} <span className="font-semibold text-slate-700 dark:text-neutral-300">{activity.target}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1.5">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
