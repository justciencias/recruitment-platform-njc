import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Users, ArrowRight } from 'lucide-react';
import Toast from '../components/Toast';

const STAGES = [
  'Phase 1 (Forms)',
  'Phase 2 (Dynamics)',
  'Phase 3 (Interviews)',
  'Phase 4 (Motivational)',
  'Waiting List',
  'Approved',
  'Rejected'
];

export default function Recruitment() {
  const [candidates, setCandidates] = useState([]);
  const [tracks, setTracks] = useState([]); // State for all tracks
  const [selectedTrack, setSelectedTrack] = useState(''); // State for current track
  const [selectedStage, setSelectedStage] = useState(STAGES[0]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  // Fetch Tracks on mount
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/tracks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTracks(res.data);
        if (res.data.length > 0) setSelectedTrack(res.data[0].id); // Default to first track
      } catch (err) {
        console.error("Failed to load tracks");
      }
    };
    fetchTracks();
  }, []);

  // Fetch Candidates using BOTH stage and track
  useEffect(() => {
    const fetchByStageAndTrack = async () => {
      if (!selectedTrack) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/candidates`, {
          params: {
            stage: selectedStage,
            track_id: selectedTrack 
          },
          headers: { Authorization: `Bearer ${token}` }
        });
        setCandidates(response.data);
      } catch (err) {
        setNotification({ message: 'Error loading stage data.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchByStageAndTrack();
  }, [selectedStage, selectedTrack]);

  useEffect(() => {
    const fetchByStage = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/candidates?stage=${selectedStage}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCandidates(response.data);
      } catch (err) {
        setNotification({ message: 'Error loading stage data.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchByStage();
  }, [selectedStage]);

  return (
    <div className="space-y-8">
      {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ClipboardList className="text-blue-500" size={32} />
          Recruitment Pipeline
        </h1>
        <p className="text-slate-400">Manage candidates progress through the active recruitment phases.</p>
      </div>

      {/* Track Switcher */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">Viewing Track</label>
        <select
          value={selectedTrack}
          onChange={(e) => setSelectedTrack(e.target.value)}
          className="bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all min-w-[200px]"
        >
          {tracks.map(track => (
            <option key={track.id} value={track.id}>{track.name}</option>
          ))}
        </select>
      </div>

      {/* Stage Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[#1E293B] rounded-2xl border border-slate-700 w-fit">
        {STAGES.map((stage) => (
          <button
            key={stage}
            onClick={() => setSelectedStage(stage)}
            className={`px-6 py-2.5 rounded-xl font-semibold transition-all text-sm ${selectedStage === stage
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
          >
            {stage}
          </button>
        ))}
      </div>

      {/* Pipeline Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-500 italic">Filtering pipeline...</div>
        ) : candidates.filter(c => c.current_stage === selectedStage).length === 0 ? (
          /* Use filter here to check if the current tab is empty */
          <div className="col-span-full py-20 text-center bg-[#1E293B] rounded-3xl border border-dashed border-slate-700">
            <Users className="mx-auto text-slate-700 mb-4" size={48} />
            <p className="text-slate-500 font-medium">No candidates currently in {selectedStage}</p>
          </div>
        ) : (
          candidates
            .filter(candidate => candidate.current_stage === selectedStage) 
            .map((candidate) => (
              <div
                key={candidate.id}
                className="group bg-[#1E293B] p-6 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer shadow-xl"
                onClick={() => navigate(`/candidates/${candidate.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
                    <Users size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    #{candidate.id.toString().padStart(4, '0')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  {candidate.full_name}
                </h3>
                <p className="text-sm text-slate-400 mb-6 truncate">{candidate.email}</p>

                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-semibold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">
                    In Review
                  </span>
                  <ArrowRight size={18} className="text-slate-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}