import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Download, Search, Users, Plus, Trash2 } from 'lucide-react';
import Toast from '../components/Toast';
import AddCandidateModal from '../components/AddCandidateModal';
import ConfirmModal from '../components/ConfirmModal';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/candidates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidates(response.data);
    } catch (error) {
      console.error("Error loading candidates:", error);
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      await axios.post('http://localhost:5000/api/candidates/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
      });
      setNotification({ message: 'Data imported successfully!', type: 'success' });
      e.target.value = null;
      fetchCandidates();
    } catch (error) {
      setNotification({ message: 'Error importing file.', type: 'error' });
    }
  };

  const filteredCandidates = candidates.filter(c =>
    (c.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Selection Logic
  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCandidates.map(c => c.id));
    }
  };

  const openDeleteModal = () => {
    if (selectedIds.length === 0) return;
    setIsDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/candidates/bulk-delete',
        { ids: selectedIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotification({ message: `Successfully deleted ${selectedIds.length} candidates`, type: 'success' });
      setSelectedIds([]);
      fetchCandidates();
    } catch (error) {
      setNotification({ message: 'Delete failed. Check permissions.', type: 'error' });
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      {/* Action Bar */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600/20 p-3 rounded-2xl text-blue-500">
            <Users size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Candidates</h1>
            <p className="text-slate-400 text-sm">Manage your recruitment pipeline</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={openDeleteModal}
              className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-semibold border border-red-600/20"
            >
              <Trash2 size={20} />
              Delete ({selectedIds.length})
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-semibold"
          >
            <Plus size={20} />
            <span>Add Candidate</span>
          </button>

          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-semibold"
          >
            <Download size={20} />
            <span>Import</span>
          </button>
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls" />

      {/* Search Bar */}
      <div className="relative w-full lg:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search candidates..."
          className="w-full bg-[#1E293B] border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table Container */}
      <div className="bg-[#1E293B] rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0F172A] text-slate-400 text-xs uppercase tracking-widest border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                    checked={selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4 hidden lg:table-cell">Email</th>
                <th className="px-6 py-4 hidden lg:table-cell">Stage</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-white">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-500 italic">Loading...</td></tr>
              ) : filteredCandidates.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-500 italic">No candidates found.</td></tr>
              ) : (
                filteredCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className={`hover:bg-slate-800/50 transition-colors ${selectedIds.includes(candidate.id) ? 'bg-blue-600/5' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                        checked={selectedIds.includes(candidate.id)}
                        onChange={() => toggleSelect(candidate.id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium">{candidate.full_name}</td>
                    <td className="px-6 py-4 text-slate-400 hidden lg:table-cell">{candidate.email}</td>
                    <td className="px-6 py-4 text-sm hidden lg:table-cell">
                      <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full border border-blue-600/30">
                        {candidate.current_stage || 'New'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/candidates/${candidate.id}`)}
                        className="text-blue-500 hover:text-blue-400 font-semibold text-sm transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Candidates"
        message={`Are you sure you want to delete ${selectedIds.length} selected candidate(s)? This action cannot be undone and will remove all associated evaluations.`}
      />

      <AddCandidateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCandidateAdded={() => {
          fetchCandidates();
          setNotification({ message: 'Candidate added successfully!', type: 'success' });
        }}
      />
    </div>
  );
}