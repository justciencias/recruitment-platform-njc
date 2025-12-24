import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Download, Search } from 'lucide-react';
import Toast from '../components/Toast';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  // Fetch live data from the database
  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/candidates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidates(response.data);
    } catch (error) {
      console.error("Error loading candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Functional Excel Import
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('token'); 

    const formData = new FormData();
    formData.append('excelFile', file); 

    try {
        await axios.post('http://localhost:5000/api/candidates/import', formData, { 
            headers: { 
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}` 
            }
        });
        setNotification({ message: 'Data imported successfully!', type: 'success' });
        
        e.target.value = null; 
        
        fetchCandidates();
    } catch (error) {
        console.error("Import Error:", error.response?.data || error.message);
        setNotification({ message: 'Error importing file.', type: 'error' });
    }
};

  const filteredCandidates = candidates.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Candidate List</h1>
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept=".xlsx, .xls" 
        />
        
        {/* Import Excel Button */}
        <button 
          onClick={() => fileInputRef.current.click()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-semibold"
        >
          <Download size={20} />
          Import Excel
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Search by name or email..."
          className="w-full bg-[#1E293B] border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-[#1E293B] rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-[#0F172A] text-slate-400 text-xs uppercase tracking-widest border-b border-slate-700">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Current Stage</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-white">
            {loading ? (
              <tr><td colSpan="4" className="p-10 text-center italic text-slate-500">Loading data...</td></tr>
            ) : filteredCandidates.length === 0 ? (
              <tr><td colSpan="4" className="p-10 text-center italic text-slate-500">No candidates found.</td></tr>
            ) : filteredCandidates.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 font-medium">{candidate.full_name}</td>
                <td className="px-6 py-4 text-slate-400">{candidate.email}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full border border-blue-600/30">
                    {candidate.current_stage}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {/* View Details Action */}
                  <button 
                    onClick={() => navigate(`/candidates/${candidate.id}`)}
                    className="text-blue-500 hover:text-blue-400 font-semibold text-sm"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}