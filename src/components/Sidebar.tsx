import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  CreditCard,
  Plane,
  Settings,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const navItems = [
  {
    name: 'Tổng quan',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Khóa học tiếng Nhật',
    path: '/courses',
    icon: BookOpen,
  },
  {
    name: 'Lớp học & Lịch dạy',
    path: '/classes',
    icon: GraduationCap,
  },
  {
    name: 'Học viên & Tuyển sinh',
    path: '/students',
    icon: Users,
  },
  {
    name: 'Ghi danh & Học phí',
    path: '/enrollments',
    icon: CreditCard,
  },
  {
    name: 'Hồ sơ Du học Nhật Bản',
    path: '/study-abroad',
    icon: Plane,
    badge: 'Mới',
  },
  {
    name: 'Cài đặt hệ thống',
    path: '/settings',
    icon: Settings,
  },
];

const levels = ['N5', 'N4', 'N3', 'N2', 'N1', 'Kaiwa'];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo / Brand */}
          <div className="p-5 flex items-center gap-3 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-red-500/20">
              MT
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-wide flex items-center gap-1.5">
                Minh Tú Center
              </h1>
              <p className="text-xs text-rose-400 font-medium tracking-wider">
                日本語センター (MTCenter)
              </p>
            </div>
          </div>

          {/* Quick Level Filter / Highlights */}
          <div className="px-5 pt-4 pb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Khung năng lực JLPT
            </span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {levels.map((lvl) => (
                <span
                  key={lvl}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                >
                  {lvl}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-2 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Menu quản lý
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-rose-600 text-white font-semibold shadow-sm shadow-rose-600/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Role Card at Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || 'Quản trị viên'}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Sparkles className="w-3 h-3 text-rose-400" />
                <span className="capitalize">{user?.role || 'Admin'}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
