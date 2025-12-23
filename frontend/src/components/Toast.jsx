import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000); // Auto-disappear after 3s
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-600 border-emerald-500 shadow-emerald-500/20',
    error: 'bg-red-600 border-red-500 shadow-red-500/20'
  };

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-6 py-4 rounded-xl border text-white shadow-2xl transition-all animate-in fade-in slide-in-from-top-4 ${styles[type]}`}>
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <p className="font-semibold">{message}</p>
      <button onClick={onClose} className="ml-4 hover:opacity-70">
        <X size={18} />
      </button>
    </div>
  );
}