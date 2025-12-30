import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Send, User, Mail, Phone, Calendar, ChevronRight, XCircle, Clock, Lock, ShieldAlert, MessageSquare, Star } from 'lucide-react';
import Toast from '../components/Toast';

const STAGES = [
    'Phase 1 (Forms)',
    'Phase 2 (Dynamics)',
    'Phase 3 (Interviews)',
    'Phase 4 (Motivational)',
    'Approved'
];

export default function CandidateDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Data States
    const [candidate, setCandidate] = useState(null);
    const [evaluations, setEvaluations] = useState([]);

    // New Evaluation Form States
    const [newFeedback, setNewFeedback] = useState('');
    const [newRating, setNewRating] = useState(0);

    // Legacy/Decision States
    const [interDecision, setInterDecision] = useState('');
    const [finalDecision, setFinalDecision] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    // UI States
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);
    const [isLockedByOther, setIsLockedByOther] = useState(false);
    const [lockMessage, setLockMessage] = useState('');
    const [userLevel, setUserLevel] = useState(1);
    const [tracks, setTracks] = useState([]);

    const fetchEvaluations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/candidates/${id}/evaluations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvaluations(res.data);
        } catch (err) {
            console.error("Failed to load evaluations");
        }
    };

    useEffect(() => {
        const loadPageData = async () => {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            setUserLevel(user.access_level || 1);

            // Fetch Tracks
            try {
                const tracksRes = await axios.get(`http://localhost:5000/api/tracks`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTracks(tracksRes.data);
            } catch (err) { console.error("Could not load tracks", err); }

            // Fetch Evaluations
            fetchEvaluations();

            // Fetch Candidate Details & Attempt Lock
            try {
                await axios.post(`http://localhost:5000/api/candidates/${id}/lock`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const res = await axios.get(`http://localhost:5000/api/candidates/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setCandidate(res.data);
                setInterDecision(res.data.intermediate_decision || '');
                setFinalDecision(res.data.final_decision || '');
                setAdminNotes(res.data.private_admin_notes || '');

            } catch (err) {
                if (err.response?.status === 403) {
                    setIsLockedByOther(true);
                    setLockMessage(err.response.data.error);

                    const res = await axios.get(`http://localhost:5000/api/candidates/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setCandidate(res.data);
                    setInterDecision(res.data.intermediate_decision || '');
                    setFinalDecision(res.data.final_decision || '');
                    setAdminNotes(res.data.private_admin_notes || '');
                }
            }
        };
        loadPageData();
    }, [id]);

    const canEditNotes = !isLockedByOther;

    const handlePostEvaluation = async (e) => {
        e.preventDefault();
        if (!newFeedback.trim()) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/candidates/${id}/evaluations`,
                {
                    feedback: newFeedback,
                    rating: newRating || null,
                    stage_evaluated: candidate.current_stage
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNewFeedback('');
            setNewRating(0);
            fetchEvaluations();
            setNotification({ message: 'Evaluation added!', type: 'success' });
        } catch (err) {
            setNotification({ message: 'Failed to post evaluation.', type: 'error' });
        }
    };

    const handleSaveSummary = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/candidates/${id}`, {
                ...candidate,
                intermediate_decision: interDecision,
                final_decision: finalDecision,
                private_admin_notes: userLevel === 3 ? adminNotes : undefined
            }, { headers: { Authorization: `Bearer ${token}` } });

            setNotification({ message: 'Decisions updated successfully!', type: 'success' });
        } catch (err) {
            setNotification({ message: 'Failed to save changes.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDecision = async (decision) => {
        let nextStage = candidate.current_stage;
        if (decision === 'pass') {
            const currentIndex = STAGES.indexOf(candidate.current_stage);
            if (candidate.current_stage === 'Waiting List') {
                nextStage = 'Phase 4 (Motivational)';
            } else if (currentIndex < STAGES.length - 1) {
                nextStage = STAGES[currentIndex + 1];
            }
        } else if (decision === 'waitlist') {
            nextStage = 'Waiting List';
        } else {
            nextStage = 'Rejected';
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:5000/api/candidates/${id}`, {
                ...candidate,
                current_stage: nextStage
            }, { headers: { Authorization: `Bearer ${token}` } });

            setCandidate(response.data);
            setNotification({ message: `Status updated to ${nextStage}`, type: decision === 'fail' ? 'error' : 'success' });
        } catch (err) {
            setNotification({ message: 'Update failed.', type: 'error' });
        }
    };

    const handleTrackChange = async (newTrackId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:5000/api/candidates/${id}`, {
                ...candidate,
                track_id: parseInt(newTrackId) 
            }, { headers: { Authorization: `Bearer ${token}` } });

            setCandidate(response.data);
            setNotification({ message: 'Recruitment track updated!', type: 'success' });
        } catch (err) {
            setNotification({ message: 'Failed to update track.', type: 'error' });
        }
    };

    if (!candidate) return <div className="text-white p-10 italic">Loading profile...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4 lg:px-0">
            {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

            {isLockedByOther && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                    <Lock className="text-amber-500" size={20} />
                    <p className="text-amber-200 font-medium text-sm">
                        {lockMessage} - <span className="text-white opacity-70">Evaluation feed is read-only.</span>
                    </p>
                </div>
            )}

            <button onClick={() => navigate('/candidates')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all">
                <ArrowLeft size={20} /> Back to List
            </button>

            {/* Profile Header */}
            <div className="bg-[#1E293B] p-6 lg:p-8 rounded-2xl border border-slate-700 shadow-xl flex flex-col lg:flex-row items-center">
                <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center border-2 border-blue-500/50 flex-shrink-0">
                    <User size={48} className="text-blue-500" />
                </div>
                <div className="flex-1 text-center lg:text-left">
                    <div className="flex flex-col lg:flex-row items-center gap-3">
                        <h1 className="text-3xl lg:text-4xl font-bold text-white">{candidate.full_name}</h1>
                        <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-md text-xs font-bold border border-slate-700 uppercase">{candidate.degree_type}</span>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 mt-2 text-slate-400 justify-center lg:justify-start">
                        <span className="flex items-center gap-1 text-sm"><Mail size={14} /> {candidate.email}</span>
                        <span className="flex items-center gap-1 text-sm"><Phone size={14} /> {candidate.phone || 'No phone'}</span>
                    </div>
                </div>
                <div className="text-center lg:text-right mt-4 lg:mt-0">
                    <span className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest shadow-lg ${candidate.current_stage === 'Rejected' ? 'bg-red-600' :
                        candidate.current_stage === 'Waiting List' ? 'bg-amber-500 text-black' : 'bg-blue-600'}`}>
                        {candidate.current_stage}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">

                    {/* FEED SECTION */}
                    <div className="bg-[#1E293B] p-6 lg:p-8 rounded-2xl border border-slate-700 shadow-xl flex flex-col h-auto lg:h-[480px]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <MessageSquare size={20} className="text-blue-500" /> Evaluation Feed
                            </h2>
                            {isLockedByOther && <Lock size={16} className="text-amber-500" />}
                        </div>

                        {/* Feed List */}
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                            {evaluations.length === 0 ? (
                                <div className="text-center text-slate-500 italic py-10">No evaluations recorded yet. Be the first!</div>
                            ) : (
                                evaluations.map((evalItem) => (
                                    <div key={evalItem.id} className="bg-[#0F172A] p-4 rounded-xl border border-slate-700/50">
                                        <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold text-xs flex-shrink-0">
                                                    {evalItem.full_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm">{evalItem.full_name}</p>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                                            {evalItem.access_level === 3 ? 'Admin' : evalItem.access_level === 2 ? 'Evaluator' : 'Member'}
                                                        </p>
                                                        {evalItem.stage_evaluated && (
                                                            <span className="text-[10px] bg-slate-800 px-1.5 rounded text-slate-500 border border-slate-700">
                                                                {evalItem.stage_evaluated}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-left sm:text-right mt-2 sm:mt-0">
                                                {evalItem.rating && (
                                                    <div className="flex gap-0.5 justify-start sm:justify-end mb-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={12}
                                                                className={i < evalItem.rating ? "fill-amber-400 text-amber-400" : "text-slate-700"}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                                <span className="text-[10px] text-slate-500 block">
                                                    {new Date(evalItem.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap pl-10">
                                            {evalItem.feedback}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handlePostEvaluation} className={`bg-[#0F172A] p-4 rounded-xl border border-slate-700 ${isLockedByOther ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-bold text-slate-500 uppercase">Rate:</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={20}
                                                className={star <= newRating ? "fill-amber-400 text-amber-400" : "text-slate-600 hover:text-amber-400"}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <textarea
                                    disabled={!canEditNotes}
                                    className="w-full bg-transparent text-slate-200 outline-none resize-none h-20 text-sm placeholder:text-slate-600"
                                    placeholder={isLockedByOther ? "Section locked by another user..." : `Write your evaluation for ${candidate.current_stage}...`}
                                    value={newFeedback}
                                    onChange={(e) => setNewFeedback(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!newFeedback.trim() || !canEditNotes}
                                    className="absolute right-0 bottom-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-0"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* DECISIONS BLOCK */}
                    <div className="bg-[#1E293B] p-6 lg:p-8 rounded-2xl border border-slate-700 space-y-4 shadow-xl">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Consensus & Decisions</h2>
                            {isLockedByOther && <Lock size={16} className="text-amber-500" />}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Intermediate Decision</label>
                                <textarea
                                    disabled={!canEditNotes}
                                    value={interDecision}
                                    onChange={(e) => setInterDecision(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-sm text-white h-24 resize-none disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Final Decision</label>
                                <textarea
                                    disabled={!canEditNotes}
                                    value={finalDecision}
                                    onChange={(e) => setFinalDecision(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-sm text-white h-24 resize-none disabled:opacity-50"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleSaveSummary}
                            disabled={saving || !canEditNotes}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-xl transition-all disabled:opacity-50 text-sm"
                        >
                            {saving ? 'Saving...' : 'Update Decisions'}
                        </button>
                    </div>
                </div>

                {/* SIDEBAR */}
                <div className="space-y-6">
                    {/* Workflow Actions */}
                    <div className="bg-[#1E293B] p-6 lg:p-8 rounded-2xl border border-slate-700 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-6">Workflow Action</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleDecision('pass')}
                                disabled={candidate.current_stage === 'Approved'}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-20"
                            >
                                <ChevronRight size={18} /> Pass Candidate
                            </button>

                            {candidate.current_stage === 'Phase 3 (Interviews)' && (
                                <button
                                    onClick={() => handleDecision('waitlist')}
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                                >
                                    <Clock size={18} /> Waitlist
                                </button>
                            )}

                            <button
                                onClick={() => handleDecision('fail')}
                                disabled={candidate.current_stage === 'Rejected'}
                                className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 font-bold py-3 rounded-xl transition-all disabled:opacity-20"
                            >
                                <XCircle size={18} /> Reject
                            </button>
                        </div>
                    </div>

                    {/* Information Sidebar with Fixed Track Select */}
                    <div className="bg-[#1E293B] p-6 lg:p-8 rounded-2xl border border-slate-700 space-y-6">
                        <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Information</h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Applied On</p>
                                <p className="text-white mt-1 flex items-center gap-2"><Calendar size={14} /> {new Date(candidate.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">ID Reference</p>
                                <p className="text-white mt-1">#NJC-{candidate.id.toString().padStart(4, '0')}</p>
                            </div>
                            <div className="pt-2">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Recruitment Track</p>
                                <select
                                    value={candidate.track_id ? candidate.track_id.toString() : ""} 
                                    onChange={(e) => handleTrackChange(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="" disabled>
                                        {tracks.length === 0 ? "Loading tracks..." : "Select a season"}
                                    </option>
                                    {tracks.length > 0 && tracks.map(track => (
                                        <option key={track.id} value={track.id.toString()}>
                                            {track.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Admin Private Note */}
                    {userLevel === 3 && (
                        <div className="bg-blue-900/10 p-6 rounded-2xl border border-blue-500/20 space-y-4 shadow-xl">
                            <h2 className="text-sm font-bold text-blue-400 flex items-center gap-2 uppercase tracking-wider">
                                <ShieldAlert size={16} /> Presidency Notes
                            </h2>
                            <textarea
                                disabled={!canEditNotes}
                                className="w-full h-40 bg-[#0F172A] border border-blue-500/20 rounded-xl p-4 text-blue-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:opacity-50 text-sm"
                                placeholder="Confidential observations (Not visible to regular members)..."
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                            />
                            <button
                                onClick={handleSaveSummary}
                                disabled={saving || !canEditNotes}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                            >
                                Save Private Note
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}