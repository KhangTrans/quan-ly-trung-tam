import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  ArrowRight,
  Calendar,
  Sparkles,
  Plane,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { courseService } from '../services/course.service';
import type { ICourse } from '../types';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentCourses = async () => {
      try {
        const data = await courseService.getCourses({ limit: 4 });
        setCourses(data.courses || []);
      } catch (err) {
        console.warn('Backend API not reachable or empty, showing fallback data.', err);
        // Fallback sample data for preview
        setCourses([
          {
            _id: '1',
            title: 'Tiếng Nhật Sơ Cấp 1 (N5)',
            code: 'JP-N5-01',
            level: 'N5',
            textbook: 'Minna no Nihongo I (Bài 1-25)',
            totalSessions: 48,
            tuitionFee: 3500000,
            status: 'ongoing',
            isActive: true,
            maxStudents: 15,
            schedule: 'Thứ 2 - 4 - 6 (17:45 - 19:15)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: '2',
            title: 'Tiếng Nhật Sơ Cấp 2 (N4)',
            code: 'JP-N4-01',
            level: 'N4',
            textbook: 'Minna no Nihongo II (Bài 26-50)',
            totalSessions: 54,
            tuitionFee: 4200000,
            status: 'upcoming',
            isActive: true,
            maxStudents: 15,
            schedule: 'Thứ 3 - 5 - 7 (19:30 - 21:00)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: '3',
            title: 'Tiếng Nhật Trung Cấp (N3)',
            code: 'JP-N3-01',
            level: 'N3',
            textbook: 'Shinkanzen Master N3 + Soumatome',
            totalSessions: 60,
            tuitionFee: 5500000,
            status: 'ongoing',
            isActive: true,
            maxStudents: 12,
            schedule: 'Thứ 2 - 4 - 6 (19:30 - 21:00)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: '4',
            title: 'Giao Tiếp Phản Xạ Kaiwa Thực Chiến',
            code: 'JP-KW-01',
            level: 'Kaiwa',
            textbook: 'Nameraka Nihongo Kaiwa',
            totalSessions: 36,
            tuitionFee: 3800000,
            status: 'ongoing',
            isActive: true,
            maxStudents: 10,
            schedule: 'Thứ 7 & Chủ Nhật (08:30 - 10:30)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentCourses();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-700 via-red-600 to-rose-600 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide text-rose-100 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Kỳ thi năng lực Nhật ngữ JLPT sắp tới: Tháng 12</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Chào mừng đến với Hệ thống Minh Tú Center!
          </h1>
          <p className="mt-2 text-sm text-rose-100/90 leading-relaxed">
            Nền tảng quản lý đào tạo, điểm danh học vụ và theo dõi tiến độ hồ sơ du học / việc làm Nhật Bản tập trung.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-rose-700 font-semibold text-xs rounded-xl shadow-sm hover:bg-rose-50 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Quản lý Khóa học</span>
            </Link>
            <Link
              to="/enrollments"
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-800/60 hover:bg-rose-800/80 text-white font-semibold text-xs rounded-xl transition-colors border border-white/20"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Ghi danh & Học phí</span>
            </Link>
          </div>
        </div>

        {/* Decorative circle in background */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng học viên theo học"
          value="186"
          change="12% so với tháng trước"
          isPositive={true}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Lớp học đang mở"
          value="14"
          change="3 lớp mới trong tuần"
          isPositive={true}
          icon={GraduationCap}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Hồ sơ Du học / Kỹ sư"
          value="28"
          change="5 visa vừa được cấp"
          isPositive={true}
          icon={Plane}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />
        <StatCard
          title="Tỷ lệ chuyên cần tháng"
          value="94.2%"
          change="Đạt chuẩn đào tạo"
          isPositive={true}
          icon={TrendingUp}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Main Grid: Courses & JLPT Level Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Courses (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Chương trình Đào tạo Tiêu biểu
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Các khóa học chuẩn khung JLPT đang và sắp khai giảng
              </p>
            </div>
            <Link
              to="/courses"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Đang tải danh sách khóa học...
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs shrink-0 flex items-center justify-center">
                      <Badge variant="level" value={course.level} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-800">
                          {course.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({course.code})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                        <span>Giáo trình: {course.textbook}</span>
                        <span>•</span>
                        <span>{course.totalSessions} buổi</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:text-right">
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {course.tuitionFee?.toLocaleString('vi-VN')} đ
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Sĩ số max: {course.maxStudents}
                      </div>
                    </div>
                    <Badge variant="status" value={course.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Level Distribution & Quick Info (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Phân bổ Học viên theo Cấp độ
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo quy mô đào tạo thực tế
            </p>

            <div className="mt-5 space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Tiếng Nhật N5 (Sơ cấp 1)</span>
                  <span className="font-bold">42% (78 hv)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[42%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Tiếng Nhật N4 (Sơ cấp 2)</span>
                  <span className="font-bold">28% (52 hv)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full w-[28%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Tiếng Nhật N3 (Trung cấp)</span>
                  <span className="font-bold">18% (34 hv)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full w-[18%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Luyện Kaiwa & Phản Xạ</span>
                  <span className="font-bold">12% (22 hv)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full w-[12%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Support Card */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Calendar className="w-4 h-4 text-rose-600" />
              <span>Lịch thi NAT-TEST / JLPT gần nhất</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Hạn chót nộp hồ sơ đăng ký thi chứng chỉ: Ngày 25 hàng tháng. Vui lòng nhắc nhở học viên các lớp N5, N4.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
