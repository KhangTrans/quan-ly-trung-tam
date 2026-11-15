import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Sparkles, Construction, ArrowLeft } from 'lucide-react';

interface PlaceholderProps {
  title?: string;
  description?: string;
}

export const PlaceholderPage: React.FC<PlaceholderProps> = ({ title, description }) => {
  const location = useLocation();

  const getTitle = () => {
    if (title) return title;
    if (location.pathname.includes('classes')) return 'Quản Lý Lớp Học & Xếp Lịch';
    if (location.pathname.includes('students')) return 'Quản Lý Hồ Sơ Học Viên & Tuyển Sinh';
    if (location.pathname.includes('study-abroad')) return 'Hồ Sơ Du Học & Kỹ Sư Nhật Bản';
    if (location.pathname.includes('settings')) return 'Cài Đặt Cấu Hình Hệ Thống';
    return 'Phân Hệ Quản Lý Đang Hoàn Thiện';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs my-8">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
        <Construction className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 tracking-tight">{getTitle()}</h2>
      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
        {description ||
          'Chức năng này đã sẵn sàng API kết nối trong backend và giao diện phân hệ đang được hoàn thiện theo Lộ trình 5 bước của Trung tâm Nhật ngữ Minh Tú.'}
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về Tổng quan</span>
        </Link>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Xem Khóa học</span>
        </Link>
      </div>
    </div>
  );
};
