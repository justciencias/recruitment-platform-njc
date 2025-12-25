import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1E293B] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
              <AlertTriangle size={24} />
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
        </div>
        
        <div className="bg-[#0F172A]/50 p-4 flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-red-900/20"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}