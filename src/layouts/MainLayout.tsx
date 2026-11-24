import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dropdown, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';

export const MainLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined className="text-rose-600" />,
      label: <span className="font-semibold text-xs">Hồ sơ cá nhân</span>,
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <span className="font-semibold text-xs">Đăng xuất</span>,
      danger: true,
      onClick: handleLogout,
    },
  ];

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'teacher':
        return 'Giảng viên';
      case 'staff':
        return 'Nhân viên';
      default:
        return 'Học viên';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBFB] text-slate-800">
      <header className="sticky top-0 z-40 border-b border-rose-100/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white font-serif font-black shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              明
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 tracking-tight group-hover:text-rose-600 transition-colors">
                Minh Tú Center
              </span>
              <span className="block text-[10px] text-rose-500 font-medium tracking-wider -mt-0.5">
                日本語センター
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium">
            <Link to="/" className="text-slate-600 hover:text-rose-600 transition-colors">
              Trang chủ
            </Link>

            {isAuthenticated && user ? (
              <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 cursor-pointer hover:bg-rose-100/80 hover:border-rose-300 transition-all select-none">
                  <Avatar
                    size={28}
                    style={{ backgroundColor: '#e11d48', flexShrink: 0 }}
                    src={user.avatar}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <span className="text-xs font-bold text-slate-800 hidden sm:inline max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-800 font-semibold uppercase tracking-wider">
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </Dropdown>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold transition-all"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold shadow-xs shadow-rose-500/20 transition-all"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      <footer className="border-t border-rose-100 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="font-semibold text-slate-700">Minh Tú Nihongo Center</span>
            <span>— Đào tạo tiếng Nhật chuẩn học thuật & JLPT</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} Minh Tu Center. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
