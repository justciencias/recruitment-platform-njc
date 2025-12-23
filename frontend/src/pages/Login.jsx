import { useState } from 'react';
import axios from 'axios';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      
      localStorage.setItem('token', response.data.token);
      
      onLoginSuccess(response.data.token); 
      
    } catch (err) {
      setError('Credenciais inválidas ou erro no servidor');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A192F] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden border-t-4 border-slate-400">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#0A192F]">NJC Recruitment</h1>
            <p className="text-slate-500 mt-2">Gestão de Candidatos</p>
          </div>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-200">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="email" required placeholder="Email" className="w-full px-3 py-2 border rounded-md" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" required placeholder="Password" className="w-full px-3 py-2 border rounded-md" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full py-2 px-4 rounded-md text-white bg-[#0A192F] hover:bg-slate-800 transition-all font-bold">Entrar</button>
          </form>
        </div>
      </div>
    </div>
  );
}