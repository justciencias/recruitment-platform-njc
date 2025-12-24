import React, { useEffect, useState } from 'react';
import api from '../services/api';
import KanbanColumn from '../components/KanbanColumn';

const STAGES = ['Application', 'Group Dynamics', 'Interview', 'Motivational Assessment', 'Waitlist'];

const RecruitmentBoard = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/candidates');
      setCandidates(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading candidates", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Recruitment Progress</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
          + Add Candidate
        </button>
      </header>

      {/* Responsive Grid: Columns stack on mobile, side-by-side on desktop */}
      <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <KanbanColumn 
            key={stage} 
            title={stage} 
            candidates={candidates.filter(c => c.current_stage === stage)} 
          />
        ))}
      </div>
    </div>
  );
};

export default RecruitmentBoard;