import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, Mail, UserPlus, Settings, LogOut } from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Candidates', path: '/candidates' },
  { icon: ClipboardList, label: 'Recruitment', path: '/recruitment' },
  { icon: Mail, label: 'Communication', path: '/communication' },
  { icon: UserPlus, label: 'Members', path: '/members' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  return (
    // FIX: Added 'h-screen' and 'sticky top-0' to fix position
    <aside className="w-72 h-screen sticky top-0 bg-[#1E293B] text-white border-r border-slate-800 flex flex-col">
      <div className="p-8 border-b border-slate-800">
        <h2 className="text-2xl font-bold italic">NJC <span className="font-light text-slate-400">Recruitment</span></h2>
      </div>
      
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
          onClick={() => { localStorage.clear(); window.location.href = '/'; }}
          className="flex items-center gap-4 px-4 py-3 w-full text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
        >
          <LogOut size={22} />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
}