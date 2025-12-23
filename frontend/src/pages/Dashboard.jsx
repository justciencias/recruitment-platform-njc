import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StatCard = ({ label, value, colorClass = "text-white" }) => (
  <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700 shadow-lg">
    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</p>
    <p className={`text-5xl font-bold mt-3 ${colorClass}`}>{value}</p>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        setError("Failed to load real-time statistics.");
      }
    };
    loadStats();
  }, []);

  if (error) return <div className="text-red-400 p-8">{error}</div>;
  if (!stats) return <div className="text-slate-400 p-8 italic">Synchronizing with database...</div>;

  const cards = [
    { label: "Total Candidates", value: stats.total },
    { label: "Phase 1 (Forms)", value: stats.phase1 },
    { label: "Phase 2 (Dynamics)", value: stats.phase2 },
    { label: "Phase 3 (Interviews)", value: stats.phase3 },
    { label: "Waiting List", value: stats.waiting_list },
    { label: "Phase 4 (Motivational)", value: stats.phase4 },
    { label: "Approved", value: stats.approved, colorClass: "text-green-400" },
    { label: "Rejected", value: stats.rejected, colorClass: "text-red-400" },
  ];

  return (
    <div className="p-2">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Control Panel</h1>
        <div className="h-1 w-20 bg-blue-600 mt-2 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, idx) => (
          <StatCard key={idx} {...card} />
        ))}
      </div>
    </div>
  );
}