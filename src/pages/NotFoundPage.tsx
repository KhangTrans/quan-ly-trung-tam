import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-6xl font-bold text-slate-800">404</h1>
      <p className="mt-2 text-sm text-slate-500">Trang không tồn tại</p>
      <Link
        to="/"
        className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
      >
        Về Trang Chủ
      </Link>
    </div>
  );
};
