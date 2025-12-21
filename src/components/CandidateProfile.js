import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const CandidateProfile = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState({ score: 5, text: '', stage: '' });

  useEffect(() => {
    loadCandidateData();
  }, [id]);

  const loadCandidateData = async () => {
    const [details, evaluations] = await Promise.all([
      api.get(`/candidates/${id}`),
      api.get(`/candidates/${id}/history`)
    ]);
    setCandidate(details.data);
    setHistory(evaluations.data);
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    try {
      await api.post('/evaluations', {
        candidate_id: id,
        score: feedback.score,
        feedback_text: feedback.text,
        stage_name: feedback.stage
      });
      alert('Evaluation submitted!');
      loadCandidateData(); // Refresh history
    } catch (err) {
      alert('Error submitting evaluation');
    }
  };

  if (!candidate) return <div className="p-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg my-10 rounded-lg">
      <h1 className="text-3xl font-bold border-b pb-4">{candidate.full_name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {/* Left Side: Evaluation History (Figure 2 logic) */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Evaluation History</h2>
          <div className="space-y-4">
            {history.map((ev) => (
              <div key={ev.id} className="p-4 bg-gray-50 rounded border">
                <div className="flex justify-between font-bold">
                  <span>{ev.stage_name}</span>
                  <span className="text-blue-600">Score: {ev.score}/5</span>
                </div>
                <p className="text-gray-600 mt-2 italic">"{ev.feedback_text}"</p>
                <p className="text-xs text-gray-400 mt-2">By {ev.interviewer_name} on {new Date(ev.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: New Evaluation Form */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Add Feedback</h2>
          <form onSubmit={handleSubmitEvaluation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Next Stage</label>
              <select 
                className="w-full p-2 border rounded"
                onChange={(e) => setFeedback({...feedback, stage: e.target.value})}
                required
              >
                <option value="">Select Stage</option>
                <option value="Group Dynamics">Group Dynamics</option>
                <option value="Interview">Interview</option>
                <option value="Pass">Pass</option>
                <option value="Fail">Fail</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Score (1-5)</label>
              <input 
                type="number" min="1" max="5" 
                className="w-full p-2 border rounded"
                value={feedback.score}
                onChange={(e) => setFeedback({...feedback, score: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Comments</label>
              <textarea 
                className="w-full p-2 border rounded h-32"
                onChange={(e) => setFeedback({...feedback, text: e.target.value})}
                placeholder="Describe candidate performance..."
                required
              ></textarea>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
              Submit Evaluation
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;