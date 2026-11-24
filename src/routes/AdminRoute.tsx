import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
  allowedRoles?: string[];
}

export const AdminRoute: React.FC<AdminRouteProps> = ({
  allowedRoles = ['admin', 'staff'],
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Đang khởi tạo phiên hoặc tự động refresh token trong nền
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Spin size="large" />
        <p className="mt-4 text-sm font-semibold text-slate-600">
          Đang xác thực quyền truy cập hệ thống...
        </p>
      </div>
    );
  }

  // Chưa đăng nhập hoặc phiên đăng nhập đã hết hạn / tự động logout
  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Đã đăng nhập nhưng không có vai trò quản trị (ví dụ: học viên)
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/admin/login" state={{ from: location, forbidden: true }} replace />;
  }

  return <Outlet />;
};
