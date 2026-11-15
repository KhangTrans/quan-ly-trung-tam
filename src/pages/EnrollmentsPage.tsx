import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Receipt,
  Plus,
} from 'lucide-react';
import { enrollmentService } from '../services/enrollment.service';
import type { IEnrollment, TuitionStatus } from '../types';
import { Badge } from '../components/Badge';

const sampleEnrollments: IEnrollment[] = [
  {
    _id: 'e1',
    studentId: {
      _id: 's1',
      name: 'Nguyễn Văn An',
      email: 'nguyenvanan@gmail.com',
      phone: '0901234567',
    },
    classId: {
      _id: 'c1',
      name: 'Lớp N5 Khóa K28',
      code: 'CLS-N5-K28',
    },
    enrollmentDate: '2026-11-01T08:00:00.000Z',
    status: 'enrolled',
    remainingSessions: 46,
    tuitionStatus: 'paid',
    notes: 'Đã hoàn tất 100% học phí đầu khóa',
    createdAt: '2026-11-01T08:00:00.000Z',
    updatedAt: '2026-11-01T08:00:00.000Z',
  },
  {
    _id: 'e2',
    studentId: {
      _id: 's2',
      name: 'Trần Thị Mai',
      email: 'maitran@gmail.com',
      phone: '0912345678',
    },
    classId: {
      _id: 'c1',
      name: 'Lớp N5 Khóa K28',
      code: 'CLS-N5-K28',
    },
    enrollmentDate: '2026-11-03T09:30:00.000Z',
    status: 'enrolled',
    remainingSessions: 44,
    tuitionStatus: 'partially_paid',
    notes: 'Đặt cọc 2.000.000đ, hẹn đóng phần còn lại vào buổi 5',
    createdAt: '2026-11-03T09:30:00.000Z',
    updatedAt: '2026-11-03T09:30:00.000Z',
  },
  {
    _id: 'e3',
    studentId: {
      _id: 's3',
      name: 'Lê Hoàng Long',
      email: 'longle@gmail.com',
      phone: '0988776655',
    },
    classId: {
      _id: 'c2',
      name: 'Lớp N4 Luyện Đề Tối',
      code: 'CLS-N4-K12',
    },
    enrollmentDate: '2026-11-10T14:15:00.000Z',
    status: 'enrolled',
    remainingSessions: 54,
    tuitionStatus: 'unpaid',
    notes: 'Học thử 1 buổi trước khi quyết định đóng phí',
    createdAt: '2026-11-10T14:15:00.000Z',
    updatedAt: '2026-11-10T14:15:00.000Z',
  },
  {
    _id: 'e4',
    studentId: {
      _id: 's4',
      name: 'Phạm Quỳnh Chi',
      email: 'quynhchi.pham@gmail.com',
      phone: '0933221100',
    },
    classId: {
      _id: 'c3',
      name: 'Lớp Kaiwa Giao Tiếp Phản Xạ',
      code: 'CLS-KW-04',
    },
    enrollmentDate: '2026-11-05T10:00:00.000Z',
    status: 'enrolled',
    remainingSessions: 32,
    tuitionStatus: 'paid',
    notes: 'Đăng ký kèm gói tư vấn du học Kyoto',
    createdAt: '2026-11-05T10:00:00.000Z',
    updatedAt: '2026-11-05T10:00:00.000Z',
  },
];

export const EnrollmentsPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tuitionFilter, setTuitionFilter] = useState<string>('all');

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const data = await enrollmentService.getEnrollments();
        if (data.enrollments && data.enrollments.length > 0) {
          setEnrollments(data.enrollments);
        } else {
          setEnrollments(sampleEnrollments);
        }
      } catch (err) {
        console.warn('API error, using sample enrollments:', err);
        setEnrollments(sampleEnrollments);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  const handleUpdateStatus = (id: string, newStatus: TuitionStatus) => {
    setEnrollments((prev) =>
      prev.map((e) => (e._id === id ? { ...e, tuitionStatus: newStatus } : e))
    );
  };

  const filtered = enrollments.filter((e) => {
    const student = typeof e.studentId === 'object' ? e.studentId : { name: '', phone: '' };
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.phone && student.phone.includes(searchTerm));
    const matchesTuition = tuitionFilter === 'all' || e.tuitionStatus === tuitionFilter;
    return matchesSearch && matchesTuition;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-rose-600" />
            <span>Ghi Danh & Quản Lý Học Phí</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi trạng thái đóng học phí, công nợ và số buổi học còn lại của học viên
          </p>
        </div>

        <button
          onClick={() => alert('Mở form ghi danh học viên mới vào lớp')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi Danh Lớp Mới</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên học viên, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Học phí:
          </span>
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'paid', label: 'Đã hoàn tất' },
            { key: 'partially_paid', label: 'Đóng một phần' },
            { key: 'unpaid', label: 'Chưa đóng' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTuitionFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                tuitionFilter === tab.key
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Đang tải dữ liệu ghi danh...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Học Viên</th>
                  <th className="py-3.5 px-4">Lớp Học</th>
                  <th className="py-3.5 px-4">Ngày Ghi Danh</th>
                  <th className="py-3.5 px-4">Buổi Còn Lại</th>
                  <th className="py-3.5 px-4">Tình Trạng Học Phí</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((item) => {
                  const student = typeof item.studentId === 'object' ? item.studentId : null;
                  const classItem = typeof item.classId === 'object' ? item.classId : null;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-semibold text-slate-800">
                          {student?.name || 'Học viên'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {student?.phone || student?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-700">
                          {classItem?.name || 'Lớp tiếng Nhật'}
                        </span>
                        {classItem?.code && (
                          <div className="text-[10px] font-mono text-slate-400">
                            {classItem.code}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(item.enrollmentDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {item.remainingSessions} buổi
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="tuition" value={item.tuitionStatus} />
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {item.tuitionStatus !== 'paid' && (
                            <button
                              onClick={() => handleUpdateStatus(item._id, 'paid')}
                              title="Xác nhận hoàn tất học phí"
                              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                            >
                              Thu phí
                            </button>
                          )}
                          <button
                            onClick={() => alert(`Xuất phiếu thu cho ${student?.name || 'học viên'}`)}
                            title="In phiếu thu"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
