import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, User, Mail, Phone, Calendar, ChevronRight, XCircle, Clock, Lock, ShieldAlert } from 'lucide-react';
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
    
    // States
    const [candidate, setCandidate] = useState(null);
    const [notes, setNotes] = useState('');
    const [interDecision, setInterDecision] = useState('');
    const [finalDecision, setFinalDecision] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);
    const [isLockedByOther, setIsLockedByOther] = useState(false);
    const [lockMessage, setLockMessage] = useState('');
    const [userLevel, setUserLevel] = useState(1);

    useEffect(() => {
        const loadPageData = async () => {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            setUserLevel(user.access_level || 1);

            try {
                // Attempt to lock the candidate 
                await axios.post(`http://localhost:5000/api/candidates/${id}/lock`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Fetch details
                const res = await axios.get(`http://localhost:5000/api/candidates/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setCandidate(res.data);
                setNotes(res.data.evaluation_notes || '');
                setInterDecision(res.data.intermediate_decision || '');
                setFinalDecision(res.data.final_decision || '');
                setAdminNotes(res.data.private_admin_notes || '');

            } catch (err) {
                if (err.response?.status === 403) {
                    setIsLockedByOther(true);
                    setLockMessage(err.response.data.error);
                    
                    // Fetch in read-only mode if locked
                    const res = await axios.get(`http://localhost:5000/api/candidates/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setCandidate(res.data);
                    setNotes(res.data.evaluation_notes || '');
                    setInterDecision(res.data.intermediate_decision || '');
                    setFinalDecision(res.data.final_decision || '');
                    setAdminNotes(res.data.private_admin_notes || '');
                }
            }
        };
        loadPageData();
    }, [id]);

    const canEdit = !isLockedByOther;

    const handleSaveEvaluation = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:5000/api/candidates/${id}`, {
                ...candidate,
                evaluation_notes: notes,
                intermediate_decision: interDecision,
                final_decision: finalDecision,
                private_admin_notes: userLevel === 3 ? adminNotes : undefined
            }, { headers: { Authorization: `Bearer ${token}` } });

            setCandidate(response.data);
            setNotification({ message: 'Progress saved successfully!', type: 'success' });
        } catch (err) {
            setNotification({ message: 'Failed to save changes.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDecision = async (decision) => {
        if (!canEdit) return;
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

    if (!candidate) return <div className="text-white p-10 italic">Loading profile...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

            {/* Lock Warning Banner  */}
            {isLockedByOther && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                    <Lock className="text-amber-500" size={20} />
                    <p className="text-amber-200 font-medium text-sm">{lockMessage}</p>
                </div>
            )}

            <button onClick={() => navigate('/candidates')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all">
                <ArrowLeft size={20} /> Back to List
            </button>

            {/* Profile Header */}
            <div className="bg-[#1E293B] p-8 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-6">
                <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center border-2 border-blue-500/50">
                    <User size={48} className="text-blue-500" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold text-white">{candidate.full_name}</h1>
                        <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-md text-xs font-bold border border-slate-700 uppercase">{candidate.degree_type}</span>
                    </div>
                    <div className="flex gap-4 mt-2 text-slate-400">
                        <span className="flex items-center gap-1 text-sm"><Mail size={14} /> {candidate.email}</span>
                        <span className="flex items-center gap-1 text-sm"><Phone size={14} /> {candidate.phone || 'No phone'}</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest shadow-lg ${
                        candidate.current_stage === 'Rejected' ? 'bg-red-600' : 
                        candidate.current_stage === 'Waiting List' ? 'bg-amber-500 text-black' : 'bg-blue-600'
                    }`}>
                        {candidate.current_stage}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* General Evaluation Notes */}
                    <div className="bg-[#1E293B] p-8 rounded-2xl border border-slate-700 space-y-4 shadow-xl">
                        <h2 className="text-xl font-bold text-white">Evaluation Feedback</h2>
                        <textarea
                            disabled={!canEdit}
                            className="w-full h-48 bg-[#0F172A] border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:opacity-50"
                            placeholder="Write collective member feedback here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                        
                        {/* Decisions Section */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Intermediate Decision</label>
                                <textarea 
                                    disabled={!canEdit}
                                    value={interDecision}
                                    onChange={(e) => setInterDecision(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Final Decision</label>
                                <textarea 
                                    disabled={!canEdit}
                                    value={finalDecision}
                                    onChange={(e) => setFinalDecision(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-sm text-white"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveEvaluation}
                            disabled={saving || !canEdit}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
                        >
                            <Save size={20} /> {saving ? 'Saving...' : 'Save Evaluation & Decisions'}
                        </button>
                    </div>

                    {/* Presidency & RH Private Section  */}
                    {userLevel === 3 && (
                        <div className="bg-blue-900/10 p-8 rounded-2xl border border-blue-500/20 space-y-4">
                            <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                                <ShieldAlert size={20} /> Presidency & RH Private Notes
                            </h2>
                            <textarea
                                disabled={!canEdit}
                                className="w-full h-32 bg-[#0F172A] border border-blue-500/20 rounded-xl p-4 text-blue-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:opacity-50"
                                placeholder="Confidential observations (Not visible to regular members)..."
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Decision Controls */}
                    <div className="bg-[#1E293B] p-8 rounded-2xl border border-slate-700 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-6">Workflow Action</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={() => handleDecision('pass')}
                                disabled={!canEdit || candidate.current_stage === 'Approved'}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-20"
                            >
                                <ChevronRight size={18} /> Pass Candidate
                            </button>
                            
                            {candidate.current_stage === 'Phase 3 (Interviews)' && (
                                <button 
                                    onClick={() => handleDecision('waitlist')}
                                    disabled={!canEdit}
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                                >
                                    <Clock size={18} /> Waitlist
                                </button>
                            )}

                            <button 
                                onClick={() => handleDecision('fail')}
                                disabled={!canEdit || candidate.current_stage === 'Rejected'}
                                className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 font-bold py-3 rounded-xl transition-all disabled:opacity-20"
                            >
                                <XCircle size={18} /> Reject
                            </button>
                        </div>
                    </div>

                    {/* Quick Info Sidebar */}
                    <div className="bg-[#1E293B] p-8 rounded-2xl border border-slate-700 space-y-6">
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}