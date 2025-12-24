import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import CandidateDetails from './pages/CandidateDetails';
import Layout from './components/Layout';
import Recruitment from './pages/Recruitment';
import Communication from './pages/Communication';
import Members from './pages/Members';



function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  if (!token) {
    return <Login onLoginSuccess={(t) => setToken(t)} />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/candidates/:id" element={<CandidateDetails />} />
          <Route path="/recruitment" element={<Recruitment />} />
          <Route path="/communication" element={<Communication />} />
          <Route path="/members" element={<Members />} />

          
          <Route path="/recruitment" element={<div className="text-white text-2xl">Recruitment Page (Coming Soon)</div>} />
          <Route path="/communication" element={<div className="text-white text-2xl">Communication Page (Coming Soon)</div>} />
          <Route path="/members" element={<div className="text-white text-2xl">Members Page (Coming Soon)</div>} />
          <Route path="/settings" element={<div className="text-white text-2xl">Settings Page (Coming Soon)</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;