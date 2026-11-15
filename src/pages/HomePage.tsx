import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, BookOpen, GraduationCap, ShieldCheck } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <section className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-br from-white via-rose-50/40 to-pink-50/60 border border-rose-100 shadow-sm">
        {/* Soft radial glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-pink-200/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/70 border border-rose-200/80 text-rose-800 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Trung tâm Nhật ngữ Minh Tú • 明途日本語</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Nâng tầm tri thức, <br />
            <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              tự tin chinh phục tiếng Nhật
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            Hệ thống đào tạo và quản lý học tập hiện đại. Đăng nhập để truy cập lịch học, xem điểm danh, tài liệu giảng dạy và kết quả thi JLPT chuẩn quốc tế.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {isAuthenticated && user ? (
              <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-slate-500">Xin chào mừng trở lại,</p>
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-sm shadow-md shadow-rose-500/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Đăng nhập ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 rounded-xl bg-white hover:bg-rose-50/50 border border-rose-200 text-rose-700 font-semibold text-sm shadow-xs transition-all cursor-pointer"
                >
                  <span>Đăng ký học viên mới</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-rose-100 shadow-sm hover:border-rose-200 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1.5">Lộ trình bài bản JLPT</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Các khóa đào tạo từ N5 cấp tốc đến N1 nâng cao, chú trọng kỹ năng phản xạ kaiwa và ngữ pháp ứng dụng thực tế.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-rose-100 shadow-sm hover:border-rose-200 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1.5">Học tập số hóa 24/7</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Học viên dễ dàng theo dõi điểm danh từng buổi, kho đề thi thử có đáp án chi tiết và tài liệu bản quyền.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-rose-100 shadow-sm hover:border-rose-200 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1.5">Bảo mật & Đáng tin cậy</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Xác thực OTP 2 lớp qua email, phân quyền rõ ràng giữa Học viên, Giảng viên và Ban Quản trị.
          </p>
        </div>
      </section>
    </div>
  );
};
