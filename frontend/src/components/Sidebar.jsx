import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, Mail, UserPlus, Settings, LogOut, Menu, X } from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Candidates', path: '/candidates' },
  { icon: ClipboardList, label: 'Recruitment', path: '/recruitment' },
  { icon: Mail, label: 'Communication', path: '/communication' },
  { icon: UserPlus, label: 'Members', path: '/members' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-[#1E293B] text-white rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky w-72 h-screen top-0 bg-[#1E293B] text-white border-r border-slate-800 flex flex-col transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="p-8 border-b border-slate-800">
          <h2 className="text-3xl font-bold"> NJC Recruitment </h2>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon size={22} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 mt-auto">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            className="flex items-center gap-4 px-4 py-3 w-full text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <LogOut size={22} />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}