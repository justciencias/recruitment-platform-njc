import React, { useState, useEffect } from 'react';
import { UserPlus, X, Users, Trash2, ShieldCheck, Mail, Briefcase } from 'lucide-react';
import axios from 'axios';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

export default function Members() {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [notification, setNotification] = useState(null);
    const [currentUserLevel, setCurrentUserLevel] = useState(1);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

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
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error("Connection error:", err.message);
            if (err.response?.status === 401) {
                setNotification({ message: 'Session expired. Please login again.', type: 'error' });
            }
        }
    };

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUserLevel(parseInt(storedUser.access_level || 1));
        fetchUsers();
    }, []);

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

    const requestDelete = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/users/${userToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotification({ message: 'Member removed successfully!', type: 'success' });
            fetchUsers();
        } catch (err) {
            setNotification({
                message: err.response?.data?.error || 'Error deleting member',
                type: 'error'
            });
        } finally {
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };

    return (
        <div className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto min-h-screen">
            {notification && (
                <Toast 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification(null)} 
                />
            )}

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600/20 p-3 rounded-2xl text-blue-500 shadow-inner">
                        <Users size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">NJC Team</h1>
                        <p className="text-slate-400 text-sm">Manage access and roles for recruiters</p>
                    </div>
                </div>
                {currentUserLevel === 3 && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 font-bold"
                    >
                        <UserPlus size={20} /> Add New Member
                    </button>
                )}
            </div>

            {/* Members Table Card */}
            <div className="bg-[#1E293B] rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#0F172A] text-slate-400 text-xs uppercase font-bold tracking-widest border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-5">Full Name</th>
                                <th className="px-6 py-5 hidden sm:table-cell">Department</th>
                                <th className="px-6 py-5 hidden lg:table-cell">Access Level</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700 text-slate-300">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-slate-500 italic">
                                        No team members found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-800/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white group-hover:text-blue-400 transition-colors">
                                                    {user.full_name}
                                                </span>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Mail size={12} /> {user.email}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-slate-400 hidden sm:table-cell">
                                            <div className="flex items-center gap-2">
                                                <Briefcase size={14} className="text-slate-600" />
                                                {user.department || 'N/A'}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black border flex items-center w-fit gap-1.5 ${
                                                user.access_level === 3 ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                user.access_level === 2 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            }`}>
                                                <ShieldCheck size={12} />
                                                {user.access_level === 3 ? 'Admin' : user.access_level === 2 ? 'Evaluator' : 'Member'}
                                            </span>
                                        </td>
                                        
                                        <td className="px-6 py-4 text-right">
                                            {currentUserLevel === 3 && (
                                                <button
                                                    onClick={() => requestDelete(user)}
                                                    className="text-slate-500 hover:text-red-500 transition-all p-2 rounded-lg hover:bg-red-500/10"
                                                    title="Remove Member"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Registration Modal Overlay */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-[#1E293B] w-full max-w-lg rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-[#0F172A]/50">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <div className="p-2 bg-blue-600/20 rounded-lg text-blue-500">
                                    <UserPlus size={20} />
                                </div>
                                Create New Member
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleRegister} className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                    placeholder="Enter full name..."
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                        placeholder="e.g., HR"
                                        value={formData.department}
                                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Access Level</label>
                                    <select
                                        className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all appearance-none cursor-pointer"
                                        value={formData.role_id}
                                        onChange={e => setFormData({ ...formData, role_id: parseInt(e.target.value) })}
                                    >
                                        <option value={1}>Member (View Only)</option>
                                        <option value={2}>Evaluator (Can Grade)</option>
                                        <option value={3}>Admin (Full Access)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                    placeholder="user@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2 pb-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Temporary Password</label>
                                <input
                                    required
                                    type="password"
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                    placeholder="Set temporary password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-blue-900/40 mt-2"
                            >
                                Register Team Member
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Modal */}
            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Remove Team Member"
                message={`Are you sure you want to remove ${userToDelete?.full_name}? They will lose all access to the platform immediately. This action is logged.`}
            />
        </div>
    );
}