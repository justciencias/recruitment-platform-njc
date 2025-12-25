import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, Database, Mail, Shield, Plus, Trash2, X, Power } from 'lucide-react';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

export default function Settings() {
    const [tracks, setTracks] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newTrackName, setNewTrackName] = useState('');
    const [notification, setNotification] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [trackToDelete, setTrackToDelete] = useState(null);

    const fetchTracks = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/tracks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTracks(res.data);
        } catch (err) {
            console.error("Failed to fetch tracks");
        }
    };

    useEffect(() => {
        fetchTracks();
    }, []);

    const handleAddTrack = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/tracks', { name: newTrackName }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // This refresh is mandatory to see the other tracks change to 'archived'
            await fetchTracks();

            setNotification({ message: 'New track activated!', type: 'success' });
            setNewTrackName('');
            setShowAdd(false);
        } catch (err) {
            setNotification({ message: 'Error creating track', type: 'error' });
        }
    };
    const handleActivateTrack = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/tracks/${id}/activate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotification({ message: 'Track status updated!', type: 'success' });
            fetchTracks(); // Refresh list immediately
        } catch (err) {
            setNotification({ message: 'Error activating track', type: 'error' });
        }
    };

    const initiateDelete = (id) => {
        setTrackToDelete(id);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/tracks/${trackToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotification({ message: 'Track deleted and status updated!', type: 'success' });
            fetchTracks(); // Refreshes list to show new active track
        } catch (err) {
            setNotification({ message: 'Error deleting track.', type: 'error' });
        } finally {
            setIsModalOpen(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-6">
            {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="bg-blue-600/20 p-3 rounded-2xl text-blue-500">
                    <SettingsIcon size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Settings</h1>
                    <p className="text-slate-500 text-sm">Manage system preferences and recruitment tracks</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Recruitment Tracks Section */}
                <div className="bg-[#1E293B] rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Database size={18} className="text-blue-500" /> Recruitment Tracks
                        </h3>
                        <button onClick={() => setShowAdd(!showAdd)} className="text-blue-500 hover:bg-blue-500/10 p-2 rounded-lg transition-colors">
                            {showAdd ? <X size={20} /> : <Plus size={20} />}
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        {showAdd && (
                            <form onSubmit={handleAddTrack} className="mb-6 p-4 bg-[#0F172A] rounded-xl border border-blue-500/30 space-y-3">
                                <input
                                    type="text"
                                    placeholder="Track Name (e.g. Spring 2026)"
                                    value={newTrackName}
                                    onChange={(e) => setNewTrackName(e.target.value)}
                                    className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-blue-500"
                                    required
                                />
                                <button type="submit" className="w-full bg-blue-600 py-2 rounded-lg text-white font-bold text-sm">
                                    Create Track
                                </button>
                            </form>
                        )}

                        <div className="space-y-3">
                            {tracks.map(track => (
                                <div key={track.id} className={`flex justify-between items-center p-4 bg-[#0F172A] rounded-xl border transition-all ${track.status === 'active' ? 'border-blue-500/50 shadow-lg shadow-blue-500/5' : 'border-slate-800 opacity-60'
                                    }`}>
                                    <div>
                                        <p className="text-white font-medium">{track.name}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${track.status === 'active' ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-500/10 text-slate-500'
                                            }`}>
                                            {track.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {track.status !== 'active' && (
                                            <button
                                                onClick={() => handleActivateTrack(track.id)}
                                                className="p-2 text-slate-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                                                title="Set as Active Season"
                                            >
                                                <Power size={18} />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => initiateDelete(track.id)}
                                            className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Delete Track"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Email Configuration Section */}
                <div className="bg-[#1E293B] rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-700">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Mail size={18} className="text-amber-500" /> System Email
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs text-slate-500 uppercase font-bold tracking-widest">Sender Name</label>
                            <input type="text" placeholder="NJC Recruitment Team" className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
                            <p className="text-amber-500/80 text-xs leading-relaxed">
                                Note: Email templates are managed directly in the <b>Communication</b> tab for specific stages.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Security and System Info */}
                <div className="bg-[#1E293B] rounded-2xl border border-slate-700 overflow-hidden shadow-xl md:col-span-2">
                    <div className="p-6 border-b border-slate-700">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Shield size={18} className="text-red-500" /> Advanced System Controls
                        </h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <p className="text-white font-medium">Database Status</p>
                            <p className="text-green-500 text-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Connected to PostgreSQL
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-white font-medium">Environment</p>
                            <p className="text-slate-400 text-sm">Production v1.0.4</p>
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Recruitment Track?"
                message="This action cannot be undone. If this was the active track, the most recent archived track will be promoted to active."
            />
        </div>
    );
}