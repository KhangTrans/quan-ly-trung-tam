import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-extrabold text-rose-600 tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-slate-800 mt-4">Không tìm thấy trang yêu cầu</h2>
        <p className="text-xs text-slate-500 mt-2">
          Đường dẫn bạn truy cập không tồn tại hoặc đã được thay đổi cấu trúc.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Trở về Trang chủ</span>
        </Link>
      </div>
    </div>
  );
};
