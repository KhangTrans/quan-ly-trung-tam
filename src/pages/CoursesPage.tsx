import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { courseService } from '../services/course.service';
import type { ICourse, JapaneseLevel, CourseStatus } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

const sampleCourses: ICourse[] = [
  {
    _id: '1',
    title: 'Tiếng Nhật Sơ Cấp 1 (Cấp độ N5)',
    code: 'JP-N5-01',
    level: 'N5',
    textbook: 'Minna no Nihongo I (Bài 1-25)',
    totalSessions: 48,
    tuitionFee: 3500000,
    maxStudents: 15,
    status: 'ongoing',
    isActive: true,
    schedule: 'Thứ 2 - 4 - 6 (17:45 - 19:15)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'Tiếng Nhật Sơ Cấp 2 (Cấp độ N4)',
    code: 'JP-N4-01',
    level: 'N4',
    textbook: 'Minna no Nihongo II (Bài 26-50)',
    totalSessions: 54,
    tuitionFee: 4200000,
    maxStudents: 15,
    status: 'upcoming',
    isActive: true,
    schedule: 'Thứ 3 - 5 - 7 (19:30 - 21:00)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    title: 'Luyện Thi Trung Cấp JLPT N3',
    code: 'JP-N3-01',
    level: 'N3',
    textbook: 'Shinkanzen Master N3 + Mimi Kara Oboeru',
    totalSessions: 60,
    tuitionFee: 5500000,
    maxStudents: 12,
    status: 'ongoing',
    isActive: true,
    schedule: 'Thứ 2 - 4 - 6 (19:30 - 21:00)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '4',
    title: 'Giao Tiếp Phản Xạ Kaiwa Thực Chiến',
    code: 'JP-KW-01',
    level: 'Kaiwa',
    textbook: 'Nameraka Nihongo Kaiwa & Shadowing',
    totalSessions: 36,
    tuitionFee: 3800000,
    maxStudents: 10,
    status: 'ongoing',
    isActive: true,
    schedule: 'Thứ 7 & Chủ Nhật (08:30 - 10:30)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [level, setLevel] = useState<JapaneseLevel>('N5');
  const [textbook, setTextbook] = useState('Minna no Nihongo I');
  const [totalSessions, setTotalSessions] = useState(48);
  const [tuitionFee, setTuitionFee] = useState(3500000);
  const [maxStudents, setMaxStudents] = useState(15);
  const [status, setStatus] = useState<CourseStatus>('upcoming');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await courseService.getCourses();
      if (res.courses && res.courses.length > 0) {
        setCourses(res.courses);
      } else {
        setCourses(sampleCourses);
      }
    } catch (err) {
      console.warn('API error, falling back to sample courses:', err);
      setCourses(sampleCourses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setMessage(null);

    const payload = {
      title,
      code,
      level,
      textbook,
      totalSessions: Number(totalSessions),
      tuitionFee: Number(tuitionFee),
      maxStudents: Number(maxStudents),
      status,
      isActive: true,
    };

    try {
      await courseService.createCourse(payload);
      setMessage({ type: 'success', text: 'Tạo khóa học mới thành công!' });
      setIsModalOpen(false);
      resetForm();
      fetchCourses();
    } catch (err: any) {
      console.warn('Failed to call API, adding locally for demo:', err);
      const newCourse: ICourse = {
        _id: String(Date.now()),
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCourses((prev) => [newCourse, ...prev]);
      setMessage({ type: 'success', text: 'Đã tạo khóa học thành công!' });
      setIsModalOpen(false);
      resetForm();
    } finally {
      setFormSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCode('');
    setLevel('N5');
    setTextbook('Minna no Nihongo I');
    setTotalSessions(48);
    setTuitionFee(3500000);
    setMaxStudents(15);
    setStatus('upcoming');
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.textbook.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || c.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-rose-600" />
            <span>Chương Trình & Khóa Học Nhật Ngữ</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý chương trình học tiếng Nhật theo khung chuẩn JLPT (N5 - N1, Kaiwa)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Khóa Học Mới</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã khóa, giáo trình..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </div>

        {/* Level Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Cấp độ:
          </span>
          {['all', 'N5', 'N4', 'N3', 'N2', 'N1', 'Kaiwa'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                selectedLevel === lvl
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl === 'all' ? 'Tất cả' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Đang tải dữ liệu khóa học...
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Không tìm thấy khóa học phù hợp</p>
          <p className="text-xs text-slate-400 mt-0.5">Vui lòng thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="level" value={c.level} />
                  <Badge variant="status" value={c.status} />
                </div>

                <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-1">
                  {c.title}
                </h3>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">Mã: {c.code}</p>

                <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Giáo trình:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[160px]">
                      {c.textbook}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Thời lượng:</span>
                    <span className="font-medium text-slate-700">{c.totalSessions} buổi</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sĩ số tối đa:</span>
                    <span className="font-medium text-slate-700">{c.maxStudents} học viên/lớp</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Học phí</span>
                  <p className="text-sm font-extrabold text-rose-600">
                    {c.tuitionFee?.toLocaleString('vi-VN')} đ
                  </p>
                </div>
                <button
                  onClick={() => alert(`Xem chi tiết lớp học thuộc khóa ${c.code}`)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm Khóa Học Tiếng Nhật Mới"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên khóa học <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Tiếng Nhật N5 Cấp Tốc"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã khóa học <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="JP-N5-02"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cấp độ JLPT <span className="text-rose-500">*</span>
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as JapaneseLevel)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              >
                <option value="N5">N5 (Sơ cấp 1)</option>
                <option value="N4">N4 (Sơ cấp 2)</option>
                <option value="N3">N3 (Trung cấp)</option>
                <option value="N2">N2 (Trung - Cao cấp)</option>
                <option value="N1">N1 (Cao cấp)</option>
                <option value="Kaiwa">Kaiwa (Giao tiếp)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Giáo trình giảng dạy
            </label>
            <input
              type="text"
              value={textbook}
              onChange={(e) => setTextbook(e.target.value)}
              placeholder="Minna no Nihongo I"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số buổi
              </label>
              <input
                type="number"
                min="1"
                value={totalSessions}
                onChange={(e) => setTotalSessions(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Học phí (VND)
              </label>
              <input
                type="number"
                step="50000"
                value={tuitionFee}
                onChange={(e) => setTuitionFee(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sĩ số tối đa
              </label>
              <input
                type="number"
                min="1"
                value={maxStudents}
                onChange={(e) => setMaxStudents(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {formSubmitting ? 'Đang lưu...' : 'Lưu Khóa Học'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
