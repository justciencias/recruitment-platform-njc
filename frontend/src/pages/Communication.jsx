import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Send, Users, Info } from 'lucide-react';
import Toast from '../components/Toast';

const STAGES = [
  'Phase 1 (Forms)', 'Phase 2 (Dynamics)', 'Phase 3 (Interviews)',
  'Phase 4 (Motivational)', 'Waiting List', 'Approved', 'Rejected'
];

export default function Communication() {
  const [selectedStage, setSelectedStage] = useState(STAGES[0]);
  const [count, setCount] = useState(0);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Fetch Template from DB 
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/emails/template`, {
          params: { stage: selectedStage },
          headers: { Authorization: `Bearer ${token}` }
        });

        setSubject(res.data.subject);
        setContent(res.data.body);
      } catch (err) {
        console.error("Template fetch failed:", err.response?.status);
        setSubject('');
        setContent('');
      }
    };
    if (selectedStage) fetchTemplate();
  }, [selectedStage]);

  // Fetch Candidate Count 
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/candidates`, {
          params: { stage: selectedStage },
          headers: { Authorization: `Bearer ${token}` }
        });
        setCount(res.data.length);
      } catch (err) {
        console.error("Error fetching counts");
      }
    };
    if (selectedStage) fetchCount();
  }, [selectedStage]);

  const handleSendEmails = async () => {
    if (!subject || !content) {
      setNotification({ message: 'Please fill in the subject and message.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/emails/sendBulk', {
        stage: selectedStage,
        subject,
        message: content
      }, { headers: { Authorization: `Bearer ${token}` } });

      setNotification({ message: `Sent emails to ${count} candidates!`, type: 'success' });
    } catch (err) {
      setNotification({ message: 'Failed to send emails.', type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 lg:px-0">
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600/20 p-3 rounded-2xl text-blue-500">
            <Mail size={32} />
          </div>
        <h1 className="text-3xl font-bold text-white">Emails</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Users size={18} className="text-slate-400" /> Target Audience
            </h3>
            <div className="space-y-2">
              <label className="text-xs text-slate-500 uppercase font-bold tracking-widest">Select Stage</label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="p-4 bg-blue-600/10 rounded-xl border border-blue-600/20">
              <p className="text-blue-400 text-sm font-medium">
                This will be sent to <span className="text-white font-bold">{count}</span> candidates currently in {selectedStage}.
              </p>
            </div>
            {/* Individual Sending Warning */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
              <div className="text-amber-500 mt-0.5">
                <Info size={16} />
              </div>
              <div className="space-y-1">
                <p className="text-amber-500 font-bold text-xs uppercase tracking-tight">Privacy Note</p>
                <p className="text-amber-500/80 text-[11px] leading-relaxed">
                  Emails are sent **individually**. Candidates won't see other recipients or the total count.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Email Editor */}
        <div className="lg:col-span-2 bg-[#1E293B] p-6 lg:p-8 rounded-2xl border border-slate-700 space-y-4 shadow-xl">
          <input
            type="text"
            placeholder="Email Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <textarea
            placeholder="Write your message here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-80 bg-[#0F172A] border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
          <button
            onClick={handleSendEmails}
            disabled={loading || count === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-30"
          >
            {loading ? 'Processing Queue...' : <><Send size={20} /> Send Emails</>}
          </button>
        </div>
      </div>
    </div>
  );
}