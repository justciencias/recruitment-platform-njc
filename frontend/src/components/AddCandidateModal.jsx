import { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

export default function AddCandidateModal({ isOpen, onClose, onCandidateAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    degree: 'BSc',
    track: ''
  });
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchTracks = async () => {
        const token = localStorage.getItem('token');
        try {
          const res = await axios.get('http://localhost:5000/api/tracks', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setTracks(res.data);
          if (res.data.length > 0) {
            setFormData(prev => ({ ...prev, track: res.data[0].name }));
          }
        } catch (err) {
          console.error("Failed to fetch tracks", err);
          setError("Failed to load recruitment tracks. Please try again.");
        }
      };
      fetchTracks();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    
    // Find the ID for the selected track name
    const selectedTrackObj = tracks.find(t => t.name === formData.track);
    
    // Prepare the payload to match your SQL Schema exactly
    const payload = {
      full_name: formData.name,     // Mapping 'name' to 'full_name'
      email: formData.email,
      phone: formData.phone,
      degree_type: formData.degree, // Mapping 'degree' to 'degree_type'
      track_id: selectedTrackObj ? selectedTrackObj.id : null // Sending ID, not name
    };

    try {
      await axios.post('http://localhost:5000/api/candidates', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onCandidateAdded();
      onClose();
      // Reset form
      setFormData({ name: '', email: '', phone: '', degree: 'BSc', track: tracks[0]?.name || '' });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add candidate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#1E293B] border border-slate-700 w-full max-w-md rounded-xl shadow-2xl p-6 relative">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Add New Candidate</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="e.g. jane@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="e.g. +1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Degree</label>
            <select
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="BSc">BSc</option>
              <option value="Masters">Masters</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Track</label>
            <select
              name="track"
              value={formData.track}
              onChange={handleChange}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              {tracks.map(track => (
                <option key={track.id} value={track.name}>{track.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 mt-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}