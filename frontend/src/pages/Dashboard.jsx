import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LayoutDashboard } from 'lucide-react';

const StatCard = ({ label, value, colorClass = "text-white" }) => (
  <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700 shadow-lg">
    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</p>
    <p className={`text-5xl font-bold mt-3 ${colorClass}`}>{value}</p>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [activeTrack, setActiveTrack] = useState('Loading...');

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

  useEffect(() => {
    const fetchActiveTrack = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/tracks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Find the one marked 'active'
        const active = res.data.find(t => t.status === 'active');
        setActiveTrack(active ? active.name : 'No Active Season');
      } catch (err) {
        console.error(err);
      }
    };
    fetchActiveTrack();
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
    <div className="space-y-8">
      {/* Header Row */}
      <div className="flex items-center gap-4">
        <div className="bg-blue-600/20 p-3 rounded-2xl text-blue-500">
          <LayoutDashboard size={32} />
        </div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>

        {/* Active Season Badge */}
        <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-1.5 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-blue-400 text-sm font-bold uppercase tracking-wider">
            {activeTrack}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <StatCard key={idx} {...card} />
        ))}
      </div>

    </div>
  );
}