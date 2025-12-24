import React, { useState, useEffect } from 'react';
import { UserPlus, X, Shield, Mail, Briefcase, Lock } from 'lucide-react';
import Toast from '../components/Toast';
import axios from 'axios';

export default function Members() {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [notification, setNotification] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        department: '',
        role_id: 1
    });

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/users', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(res.data);
        } catch (err) {
            console.error("Connection error:", err.message);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/users/register', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotification({ message: 'Member registered successfully!', type: 'success' });
            setShowModal(false);
            setFormData({ full_name: '', email: '', password: '', department: '', role_id: 1 });
            fetchUsers();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Error registering member';
            setNotification({ message: errorMsg, type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this member?")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotification({ message: 'Member removed!', type: 'success' });
            fetchUsers(); // Refresh the list
        } catch (err) {
            setNotification({
                message: err.response?.data?.error || 'Error deleting member',
                type: 'error'
            });
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">NJC Team</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                >
                    <UserPlus size={20} /> Add Member
                </button>
            </div>

            {/* Members Table */}
            <div className="bg-[#1E293B] rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-[#0F172A] text-slate-400 text-xs uppercase font-bold tracking-widest">
                        <tr>
                            <th className="px-6 py-4 w-1/3">Name</th>
                            <th className="px-6 py-4 w-1/3">Department</th>
                            <th className="px-6 py-4 w-1/4">Access Level</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 text-slate-300">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-white w-1/3">
                                    {user.full_name}
                                </td>

                                <td className="px-6 py-4 text-slate-400 w-1/3">
                                    {user.department}
                                </td>

                                <td className="px-6 py-4 w-1/4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${user.access_level === 3 ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            user.access_level === 2 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                        {user.access_level === 3 ? 'Admin' : user.access_level === 2 ? 'Evaluator' : 'Member'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-slate-600 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                                        title="Delete Member"
                                    >
                                        <X size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Registration Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1E293B] w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-slate-700">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <UserPlus className="text-blue-500" /> New Member
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleRegister} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., John Doe"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., HR"
                                        value={formData.department}
                                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Access</label>
                                    <select
                                        className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.role_id}
                                        onChange={e => setFormData({ ...formData, role_id: parseInt(e.target.value) })}
                                    >
                                        <option value={1}>Member</option>
                                        <option value={2}>Evaluator</option>
                                        <option value={3}>Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="email@njc.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Temporary Password</label>
                                <input
                                    required
                                    type="password"
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 mt-4"
                            >
                                Complete Registration
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}