import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, ArrowLeft, GraduationCap, Award, Users } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const location = useLocation();
  const isLogin = location.pathname.includes('/login');

  return (
    <div className="min-h-screen w-full bg-[#FFFBFB] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background ambient sakura blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-pink-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-rose-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative subtle Japanese kanji watermark */}
      <div className="absolute right-8 bottom-6 select-none pointer-events-none opacity-[0.03] text-8xl md:text-9xl font-serif text-rose-950 font-bold tracking-widest leading-none">
        明途日本語
      </div>

      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Side: Brand Story & Education Highlights (Desktop only) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between py-6 pr-4">
          <div>
            {/* Brand Logo & Name */}
            <Link to="/" className="inline-flex items-center gap-3 group mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/25 group-hover:scale-105 transition-transform">
                <span className="font-serif font-black text-xl tracking-tight">明</span>
              </div>
              <div>
                <span className="block font-bold text-xl text-slate-900 tracking-tight">
                  Minh Tú Nihongo
                </span>
                <span className="block text-xs font-medium text-rose-600 tracking-wider uppercase">
                  明途日本語センター
                </span>
              </div>
            </Link>

            {/* Main Headline */}
            <div className="space-y-3 mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>Nền tảng Quản trị & Đào tạo Tiếng Nhật</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
                Chinh phục tiếng Nhật <br />
                <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  cùng lộ trình chuẩn JLPT
                </span>
              </h1>
              <p className="text-slate-600 text-sm leading-relaxed">
                Hệ thống số hóa kết nối học viên, giảng viên và trung tâm. Theo dõi tiến độ học tập, bài thi thử và điểm danh minh bạch, tức thì.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-3.5">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/70 border border-rose-100/80 shadow-sm backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">98% Học viên đỗ JLPT</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Cam kết đầu ra từ N5 đến N1 với lộ trình cá nhân hóa</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/70 border border-rose-100/80 shadow-sm backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Đội ngũ Sensei 100% chuẩn N1/N2</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Giảng viên giàu kinh nghiệm sư phạm và giảng dạy thực chiến</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/70 border border-rose-100/80 shadow-sm backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Quản lý lớp học thông minh</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Điểm danh, tài liệu số và kết quả thi luôn cập nhật 24/7</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof / Student quote */}
          <div className="mt-8 pt-6 border-t border-rose-100/80">
            <p className="text-xs italic text-slate-600 mb-2">
              "Giao diện học tập trực quan giúp mình dễ dàng ôn bài và kiểm tra lịch học mỗi ngày. Thầy cô chấm chữa bài rất chi tiết!"
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-rose-200 text-rose-800 font-bold text-xs flex items-center justify-center">
                TT
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-900">Thu Trang</span>
                <span className="block text-[11px] text-slate-500">Học viên lớp JLPT N2 K30</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card Container */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-md">
            {/* Top Navigation Bar: Back & Switch Tab */}
            <div className="flex items-center justify-between mb-4 px-1">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Về trang chủ</span>
              </Link>

              {/* Segmented Tab Pill */}
              <div className="inline-flex p-1 rounded-xl bg-rose-100/70 border border-rose-200/60 text-xs">
                <Link
                  to="/login"
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    isLogin
                      ? 'bg-white text-rose-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    !isLogin
                      ? 'bg-white text-rose-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Đăng ký
                </Link>
              </div>
            </div>

            {/* Auth Glass Card */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 relative">
              {/* Header inside Card */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2 lg:hidden">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-rose-500/20">
                    明
                  </div>
                  <span className="font-bold text-slate-900 text-sm">Minh Tú Nihongo</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>
              </div>

              {/* Form Content */}
              {children}
            </div>

            {/* Footer Notice */}
            <p className="text-center text-xs text-slate-400 mt-5">
              Hệ thống bảo mật tiêu chuẩn mã hóa SSL 256-bit • Minh Tú Center © 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
