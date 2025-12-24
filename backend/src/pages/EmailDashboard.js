import React, { useState, useEffect } from 'react';
import api from '../services/api';

const EmailDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // Load data for the dashboard
    const fetchData = async () => {
      const [candRes, tempRes] = await Promise.all([
        api.get('/candidates'),
        api.get('/email-templates') // You'll need a simple GET route for this
      ]);
      setCandidates(candRes.data);
      setTemplates(tempRes.data);
    };
    fetchData();
  }, []);

  const toggleCandidate = (id) => {
    setSelectedCandidates(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkSend = async () => {
    if (!selectedTemplate || selectedCandidates.length === 0) {
      alert("Please select both a template and at least one candidate.");
      return;
    }

    setIsSending(true);
    try {
      await api.post('/emails/sendBulk', {
        candidate_ids: selectedCandidates,
        template_id: selectedTemplate
      });
      alert("Emails sent successfully!");
      setSelectedCandidates([]);
    } catch (error) {
      alert("Failed to send emails.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Email Communication Center</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Candidate Selection List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="font-semibold mb-4 border-b pb-2">Select Candidates</h2>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm uppercase">
                  <th className="p-2">Select</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Stage</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(c => (
                  <tr key={c.id} className="border-t hover:bg-blue-50">
                    <td className="p-2">
                      <input 
                        type="checkbox" 
                        checked={selectedCandidates.includes(c.id)}
                        onChange={() => toggleCandidate(c.id)}
                      />
                    </td>
                    <td className="p-2 font-medium">{c.full_name}</td>
                    <td className="p-2 text-sm text-gray-500">{c.current_stage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Template & Action Panel */}
        <div className="bg-white p-6 rounded-lg shadow h-fit">
          <h2 className="font-semibold mb-4 border-b pb-2">Email Configuration</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Template</label>
            <select 
              className="w-full p-2 border rounded bg-gray-50"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <option value="">-- Choose a Template --</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 p-4 rounded mb-6 text-sm">
            <p><strong>Recipients:</strong> {selectedCandidates.length} candidates selected</p>
            <p className="text-gray-500 mt-1 italic">Placeholders like {"{{name}}"} will be replaced automatically.</p>
          </div>

          <button 
            onClick={handleBulkSend}
            disabled={isSending}
            className={`w-full py-3 rounded-lg font-bold text-white transition ${
              isSending ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 shadow-lg'
            }`}
          >
            {isSending ? 'Sending...' : 'Send Emails in Bulk'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmailDashboard;