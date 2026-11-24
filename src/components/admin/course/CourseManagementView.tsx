import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Tabs,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Card,
  Row,
  Col,
  Popconfirm,
  message,
  Tooltip,
  Switch,
  Descriptions,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  BookOutlined,
  InfoCircleOutlined,
  ReadOutlined,
  FireOutlined,
  TeamOutlined,
  FilePdfOutlined,
  ExportOutlined,
  InboxOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import {
  courseService,
  type Course,
  type CreateCourseInput,
} from '../../../services/course.service';
import {
  textbookService,
  type Textbook,
  type CreateTextbookInput,
  type UploadPdfResponse,
} from '../../../services/textbook.service';

const LEVEL_CONFIG: Record<
  string,
  { label: string; color: string; text: string }
> = {
  N5: { label: 'Sơ Cấp N5', color: 'purple', text: 'text-purple-700' },
  N4: { label: 'Sơ Cấp N4', color: 'blue', text: 'text-blue-700' },
  N3: { label: 'Trung Cấp N3', color: 'cyan', text: 'text-cyan-700' },
  N2: { label: 'Trung Cao N2', color: 'orange', text: 'text-orange-700' },
  N1: { label: 'Cao Cấp N1', color: 'red', text: 'text-red-700' },
  Kaiwa: { label: 'Giao Tiếp (Kaiwa)', color: 'green', text: 'text-emerald-700' },
  'Luyện thi JLPT': { label: 'Luyện Thi JLPT', color: 'volcano', text: 'text-rose-700' },
  'Luyện thi NAT-TEST': { label: 'Luyện Thi NAT-TEST', color: 'magenta', text: 'text-pink-700' },
  JLPT: { label: 'Luyện Thi JLPT', color: 'volcano', text: 'text-rose-700' },
  'NAT-TEST': { label: 'Luyện Thi NAT-TEST', color: 'magenta', text: 'text-pink-700' },
  'Tất cả': { label: 'Mọi Trình Độ', color: 'default', text: 'text-slate-700' },
};

export const CourseManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('courses');

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Textbooks state
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loadingTextbooks, setLoadingTextbooks] = useState<boolean>(false);
  const [searchTbText, setSearchTbText] = useState<string>('');
  const [selectedTbLevel, setSelectedTbLevel] = useState<string>('all');

  // Course Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [submittingCourse, setSubmittingCourse] = useState<boolean>(false);
  const [courseForm] = Form.useForm();

  // Course Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Textbook Modal
  const [isTbModalOpen, setIsTbModalOpen] = useState<boolean>(false);
  const [editingTextbook, setEditingTextbook] = useState<Textbook | null>(null);
  const [submittingTextbook, setSubmittingTextbook] = useState<boolean>(false);
  const [uploadingPdf, setUploadingPdf] = useState<boolean>(false);
  const [uploadedPdfInfo, setUploadedPdfInfo] = useState<UploadPdfResponse | null>(null);
  const [textbookForm] = Form.useForm();

  // PDF Preview Reader Modal (đọc file PDF tạm thời)
  const [pdfModalOpen, setPdfModalOpen] = useState<boolean>(false);
  const [previewPdf, setPreviewPdf] = useState<{
    title: string;
    url: string;
    level?: string;
    size?: string;
  } | null>(null);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format PDF URL to full URL for iframe
  const formatPdfUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Fetch Courses
  const fetchCourses = useCallback(async () => {
    setLoadingCourses(true);
    try {
      const res = await courseService.getAllCourses({
        search: searchText || undefined,
        level: selectedLevel !== 'all' ? selectedLevel : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 100,
      });
      if (res.success && Array.isArray(res.data)) {
        setCourses(res.data);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách khóa học');
    } finally {
      setLoadingCourses(false);
    }
  }, [searchText, selectedLevel, statusFilter]);

  // Fetch Textbooks
  const fetchTextbooks = useCallback(async () => {
    setLoadingTextbooks(true);
    try {
      const res = await textbookService.getAllTextbooks({
        search: searchTbText || undefined,
        level: selectedTbLevel !== 'all' ? selectedTbLevel : undefined,
      });
      if (res.success && Array.isArray(res.data)) {
        setTextbooks(res.data);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách giáo trình');
    } finally {
      setLoadingTextbooks(false);
    }
  }, [searchTbText, selectedTbLevel]);

  useEffect(() => {
    fetchCourses();
    fetchTextbooks();
  }, [fetchCourses, fetchTextbooks]);

  // Open PDF Preview Modal
  const handleOpenPdfPreview = (title: string, url: string, level?: string, size?: string) => {
    if (!url) {
      message.warning('Giáo trình này chưa có tệp PDF đính kèm');
      return;
    }
    setPreviewPdf({ title, url, level, size });
    setPdfModalOpen(true);
  };

  // Handle preview from Course row
  const handlePreviewCourseTextbook = (record: Course) => {
    const matchedTb =
      (typeof record.textbookId === 'object' && record.textbookId) ||
      textbooks.find((t) => t._id === record.textbookId || t.name === record.textbook);

    const pdfUrl = matchedTb?.fileUrl || '/uploads/textbooks/minna-nihongo-1.pdf';
    handleOpenPdfPreview(
      record.textbook || matchedTb?.name || 'Giáo Trình Tiếng Nhật',
      pdfUrl,
      record.level,
      matchedTb?.fileSizeFormatted || 'PDF Giáo Trình'
    );
  };

  // ================= COURSE HANDLERS =================
  const handleOpenCreateCourse = () => {
    setEditingCourse(null);
    courseForm.resetFields();
    // Default select first available textbook if any
    const defaultTb = textbooks[0];
    courseForm.setFieldsValue({
      level: 'N5',
      textbookId: defaultTb?._id,
      textbook: defaultTb?.name || 'Minna no Nihongo I (Bài 1 - 25) + Bản dịch',
      totalSessions: 45,
      tuitionFee: 3500000,
      duration: '3 tháng (12 tuần)',
      maxStudents: 20,
      status: 'upcoming',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditCourse = (record: Course) => {
    setEditingCourse(record);
    const tbId = typeof record.textbookId === 'object' ? (record.textbookId as any)?._id : record.textbookId;
    courseForm.setFieldsValue({
      title: record.title,
      code: record.code,
      level: record.level,
      textbookId: tbId,
      textbook: record.textbook,
      totalSessions: record.totalSessions,
      tuitionFee: record.tuitionFee,
      duration: record.duration || '3 tháng',
      maxStudents: record.maxStudents || 20,
      status: record.status || 'upcoming',
      isActive: record.isActive !== false,
      description: record.description || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenDetailCourse = async (record: Course) => {
    setDetailCourse(record);
    setDetailModalOpen(true);
    setLoadingDetail(true);
    try {
      const res = await courseService.getCourseById(record._id);
      if (res.success && res.data) {
        setDetailCourse(res.data);
      }
    } catch {
      // Keep initial
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSubmitCourse = async (values: any) => {
    setSubmittingCourse(true);
    try {
      // Find selected textbook to sync name
      const selectedTb = textbooks.find((t) => t._id === values.textbookId);
      const textbookName = selectedTb ? selectedTb.name : values.textbook || 'Minna no Nihongo I';

      const payload: CreateCourseInput = {
        title: values.title.trim(),
        code: values.code.trim().toUpperCase(),
        level: values.level,
        textbookId: values.textbookId,
        textbook: textbookName,
        totalSessions: Number(values.totalSessions),
        tuitionFee: Number(values.tuitionFee),
        duration: values.duration?.trim() || '3 tháng',
        maxStudents: Number(values.maxStudents || 20),
        status: values.status,
        isActive: values.isActive !== false,
        description: values.description?.trim() || '',
      };

      if (editingCourse) {
        await courseService.updateCourse(editingCourse._id, payload);
        message.success('Cập nhật thông tin khóa học thành công!');
      } else {
        await courseService.createCourse(payload);
        message.success('Tạo khóa học mới thành công!');
      }

      setIsModalOpen(false);
      courseForm.resetFields();
      fetchCourses();
    } catch (err: any) {
      const resp = err.response?.data;
      message.error(resp?.message || 'Có lỗi xảy ra khi lưu khóa học', 6);
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      await courseService.deleteCourse(id);
      message.success('Đã xóa khóa học thành công!');
      fetchCourses();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa khóa học này', 5);
    }
  };

  // ================= TEXTBOOK HANDLERS =================
  const handleOpenCreateTextbook = () => {
    setEditingTextbook(null);
    setUploadedPdfInfo(null);
    textbookForm.resetFields();
    textbookForm.setFieldsValue({
      level: 'N5',
      totalLessons: 25,
      isActive: true,
    });
    setIsTbModalOpen(true);
  };

  const handleOpenEditTextbook = (record: Textbook) => {
    setEditingTextbook(record);
    setUploadedPdfInfo({
      fileUrl: record.fileUrl,
      fileName: record.fileName || '',
      fileSize: record.fileSize || 0,
      fileSizeFormatted: record.fileSizeFormatted || '0 KB',
    });
    textbookForm.setFieldsValue({
      name: record.name,
      code: record.code,
      level: record.level,
      author: record.author || '',
      publisher: record.publisher || '',
      totalLessons: record.totalLessons || 25,
      fileUrl: record.fileUrl,
      fileName: record.fileName,
      fileSize: record.fileSize,
      fileSizeFormatted: record.fileSizeFormatted,
      description: record.description || '',
      isActive: record.isActive !== false,
    });
    setIsTbModalOpen(true);
  };

  const handleSubmitTextbook = async (values: any) => {
    if (!values.fileUrl) {
      message.error('Vui lòng tải lên tệp PDF giáo trình (.pdf)!');
      return;
    }

    setSubmittingTextbook(true);
    try {
      const payload: CreateTextbookInput = {
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        level: values.level,
        author: values.author?.trim() || '',
        publisher: values.publisher?.trim() || '',
        totalLessons: Number(values.totalLessons || 25),
        fileUrl: values.fileUrl,
        fileName: values.fileName || uploadedPdfInfo?.fileName || '',
        fileSize: values.fileSize || uploadedPdfInfo?.fileSize || 0,
        fileSizeFormatted: values.fileSizeFormatted || uploadedPdfInfo?.fileSizeFormatted || '0 KB',
        description: values.description?.trim() || '',
        isActive: values.isActive !== false,
      };

      if (editingTextbook) {
        await textbookService.updateTextbook(editingTextbook._id, payload);
        message.success('Cập nhật giáo trình thành công!');
      } else {
        await textbookService.createTextbook(payload);
        message.success('Thêm giáo trình mới thành công!');
      }

      setIsTbModalOpen(false);
      textbookForm.resetFields();
      setUploadedPdfInfo(null);
      fetchTextbooks();
    } catch (err: any) {
      const resp = err.response?.data;
      message.error(resp?.message || 'Có lỗi xảy ra khi lưu giáo trình', 6);
    } finally {
      setSubmittingTextbook(false);
    }
  };

  const handleDeleteTextbook = async (id: string) => {
    try {
      await textbookService.deleteTextbook(id);
      message.success('Đã xóa giáo trình thành công!');
      fetchTextbooks();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa giáo trình này', 5);
    }
  };

  // Stats
  const courseStats = useMemo(() => {
    const total = courses.length;
    const basic = courses.filter((c) => c.level === 'N5' || c.level === 'N4').length;
    const advanced = courses.filter(
      (c) =>
        c.level === 'N3' ||
        c.level === 'N2' ||
        c.level === 'N1' ||
        c.level.includes('JLPT') ||
        c.level.includes('NAT-TEST')
    ).length;
    const kaiwa = courses.filter((c) => c.level === 'Kaiwa').length;
    return { total, basic, advanced, kaiwa };
  }, [courses]);

  // ================= COLUMNS DEFINITIONS =================
  // 1. Course Columns
  const courseColumns = [
    {
      title: 'Thao Tác',
      key: 'action',
      width: 120,
      align: 'center' as const,
      fixed: 'left' as const,
      render: (_: any, record: Course) => (
        <Space size="small" className="justify-center whitespace-nowrap">
          <Tooltip title="Xem chi tiết khóa học">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined className="text-slate-500 hover:text-slate-800" />}
              onClick={() => handleOpenDetailCourse(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa thông tin">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined className="text-blue-500 hover:text-blue-700" />}
              onClick={() => handleOpenEditCourse(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa khóa học">
            <Popconfirm
              title="Xóa khóa học này?"
              description={`Bạn có chắc muốn xóa khóa học "${record.title}"?`}
              onConfirm={() => handleDeleteCourse(record._id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined className="text-rose-400 hover:text-rose-600" />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Mã Khóa Học',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      align: 'center' as const,
      render: (code: string) => (
        <Tag color="rose" className="font-mono font-bold uppercase rounded-md px-2.5 py-0.5 whitespace-nowrap">
          {code}
        </Tag>
      ),
    },
    {
      title: 'Tên Khóa Học & Mục Tiêu',
      key: 'title',
      width: 320,
      align: 'left' as const,
      render: (_: any, record: Course) => (
        <div className="text-left whitespace-nowrap">
          <div className="font-bold text-slate-800 text-sm hover:text-rose-600 transition-colors">
            {record.title}
          </div>
          {record.description && (
            <div className="text-[11px] text-slate-400 truncate max-w-[300px]">
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Cấp Độ Đào Tạo',
      dataIndex: 'level',
      key: 'level',
      width: 170,
      align: 'center' as const,
      render: (level: string) => {
        const conf = LEVEL_CONFIG[level] || { label: level, color: 'default' };
        return (
          <Tag color={conf.color} className="font-semibold rounded-full px-3 py-0.5 whitespace-nowrap">
            {conf.label}
          </Tag>
        );
      },
    },
    {
      title: 'Giáo Trình Áp Dụng (Nhấn để đọc)',
      key: 'textbook',
      width: 330,
      align: 'left' as const,
      render: (_: any, record: Course) => (
        <div
          onClick={() => handlePreviewCourseTextbook(record)}
          className="text-left text-xs cursor-pointer group flex items-center gap-2 whitespace-nowrap py-1 px-2 rounded-lg hover:bg-rose-50/80 transition-all border border-transparent hover:border-rose-200"
          title="Nhấn để mở trình đọc file PDF tạm thời"
        >
          <div className="w-6 h-6 rounded-md bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 group-hover:scale-110 transition-transform">
            <FilePdfOutlined className="text-sm" />
          </div>
          <div className="truncate max-w-[240px]">
            <span className="font-semibold text-rose-700 group-hover:underline">
              {record.textbook || 'Minna no Nihongo'}
            </span>
            <span className="text-[10px] text-rose-500 block">📖 Nhấp để đọc PDF</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Tổng Số Buổi',
      dataIndex: 'totalSessions',
      key: 'totalSessions',
      width: 130,
      align: 'right' as const,
      render: (sessions: number, record: Course) => (
        <div className="text-right whitespace-nowrap font-medium text-slate-700">
          <span className="font-bold text-slate-900">{sessions || 45}</span> buổi
          {record.duration && <div className="text-[11px] text-slate-400">({record.duration})</div>}
        </div>
      ),
    },
    {
      title: 'Học Phí Chuẩn',
      dataIndex: 'tuitionFee',
      key: 'tuitionFee',
      width: 160,
      align: 'right' as const,
      render: (fee: number) => (
        <div className="text-right whitespace-nowrap font-bold text-rose-600 font-mono text-sm">
          {formatCurrency(fee || 0)}
        </div>
      ),
    },
    {
      title: 'Trạng Thái',
      key: 'status',
      width: 150,
      align: 'center' as const,
      render: (_: any, record: Course) => {
        const isActive = record.isActive !== false;
        return (
          <Tag color={isActive ? 'green' : 'default'} className="font-semibold rounded-full px-2.5 whitespace-nowrap">
            {isActive ? 'Đang tuyển sinh' : 'Tạm dừng'}
          </Tag>
        );
      },
    },
  ];

  // 2. Textbook Columns
  const textbookColumns = [
    {
      title: 'Thao Tác',
      key: 'action',
      width: 130,
      align: 'center' as const,
      fixed: 'left' as const,
      render: (_: any, record: Textbook) => (
        <Space size="small" className="justify-center whitespace-nowrap">
          <Tooltip title="Đọc tài liệu PDF tạm thời">
            <Button
              type="text"
              size="small"
              icon={<FilePdfOutlined className="text-rose-500 hover:text-rose-700 text-base" />}
              onClick={() => handleOpenPdfPreview(record.name, record.fileUrl, record.level, record.fileSizeFormatted)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa giáo trình">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined className="text-blue-500 hover:text-blue-700" />}
              onClick={() => handleOpenEditTextbook(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa giáo trình">
            <Popconfirm
              title="Xóa giáo trình này?"
              description={`Bạn có chắc muốn xóa giáo trình "${record.name}"?`}
              onConfirm={() => handleDeleteTextbook(record._id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined className="text-rose-400 hover:text-rose-600" />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Mã Giáo Trình',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      align: 'center' as const,
      render: (code: string) => (
        <Tag color="volcano" className="font-mono font-bold uppercase rounded-md px-2.5 py-0.5 whitespace-nowrap">
          {code}
        </Tag>
      ),
    },
    {
      title: 'Tên Giáo Trình & Tác Giả',
      key: 'name',
      width: 320,
      align: 'left' as const,
      render: (_: any, record: Textbook) => (
        <div className="text-left whitespace-nowrap">
          <div className="font-bold text-slate-800 text-sm">{record.name}</div>
          <div className="text-[11px] text-slate-400">
            {record.author ? `Tác giả: ${record.author}` : 'Tài liệu trung tâm'}
            {record.publisher ? ` • ${record.publisher}` : ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Cấp Độ Áp Dụng',
      dataIndex: 'level',
      key: 'level',
      width: 160,
      align: 'center' as const,
      render: (level: string) => {
        const conf = LEVEL_CONFIG[level] || { label: level, color: 'default' };
        return (
          <Tag color={conf.color} className="font-semibold rounded-full px-3 py-0.5 whitespace-nowrap">
            {conf.label}
          </Tag>
        );
      },
    },
    {
      title: 'Số Bài Học',
      dataIndex: 'totalLessons',
      key: 'totalLessons',
      width: 120,
      align: 'right' as const,
      render: (lessons: number) => (
        <span className="font-bold text-slate-800 text-right whitespace-nowrap">
          {lessons || 25} bài
        </span>
      ),
    },
    {
      title: 'Tệp PDF Đính Kèm',
      key: 'file',
      width: 250,
      align: 'left' as const,
      render: (_: any, record: Textbook) => (
        <div
          onClick={() => handleOpenPdfPreview(record.name, record.fileUrl, record.level, record.fileSizeFormatted)}
          className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-rose-50 text-xs transition-colors whitespace-nowrap"
        >
          <FilePdfOutlined className="text-rose-600 text-lg" />
          <div className="truncate max-w-[180px]">
            <span className="font-medium text-slate-800 hover:text-rose-600 block truncate">
              {record.fileName || 'Xem tệp PDF'}
            </span>
            <Tag color="cyan" className="text-[10px] rounded px-1.5 py-0 font-mono m-0">
              {record.fileSizeFormatted || 'PDF'}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng Thái',
      key: 'isActive',
      width: 140,
      align: 'center' as const,
      render: (_: any, record: Textbook) => (
        <Tag color={record.isActive !== false ? 'green' : 'default'} className="rounded-full px-2.5 whitespace-nowrap">
          {record.isActive !== false ? 'Đang áp dụng' : 'Lưu trữ'}
        </Tag>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Thẻ thống kê tổng quan */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-rose-100 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 text-lg">
                <ReadOutlined />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Tổng Khóa Đào Tạo</span>
                <span className="text-xl font-black text-slate-900">{courseStats.total}</span>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-rose-100 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 text-lg">
                <BookOutlined />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Sơ Cấp (N5 - N4)</span>
                <span className="text-xl font-black text-slate-900">{courseStats.basic}</span>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-rose-100 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 text-lg">
                <FireOutlined />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Trung - Cao Cấp & Luyện Thi</span>
                <span className="text-xl font-black text-slate-900">{courseStats.advanced}</span>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-rose-100 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-lg">
                <FilePdfOutlined />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Kho Giáo Trình PDF</span>
                <span className="text-xl font-black text-slate-900">{textbooks.length}</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabs navigation: Khóa học vs Giáo trình */}
      <Card className="rounded-2xl border-rose-100 shadow-xs">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="line"
          size="large"
          className="course-textbook-tabs"
          items={[
            {
              key: 'courses',
              label: (
                <span className="font-bold flex items-center gap-2">
                  <ReadOutlined />
                  <span>1. Chương Trình & Khóa Học ({courses.length})</span>
                </span>
              ),
              children: (
                <div className="pt-2 space-y-4">
                  {/* Toolbar Khóa học: 6/12 Trái (Tìm kiếm + Bộ lọc) & 6/12 Phải (Nút thêm căn phải) */}
                  <Row gutter={[16, 16]} align="top">
                    <Col xs={24} md={12}>
                      <div className="space-y-3">
                        <Input
                          prefix={<SearchOutlined className="text-slate-400 mr-1" />}
                          placeholder="Tìm kiếm theo tên khóa học, mã khóa học, giáo trình..."
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          allowClear
                          className="rounded-xl h-10 w-full"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <Select
                            value={selectedLevel}
                            onChange={setSelectedLevel}
                            className="h-9 min-w-[170px]"
                            options={[
                              { value: 'all', label: 'Tất cả cấp độ' },
                              { value: 'N5', label: 'Sơ cấp N5' },
                              { value: 'N4', label: 'Sơ cấp N4' },
                              { value: 'N3', label: 'Trung cấp N3' },
                              { value: 'N2', label: 'Trung cao N2' },
                              { value: 'N1', label: 'Cao cấp N1' },
                              { value: 'Kaiwa', label: 'Giao tiếp Kaiwa' },
                              { value: 'Luyện thi JLPT', label: 'Luyện thi JLPT' },
                              { value: 'Luyện thi NAT-TEST', label: 'Luyện thi NAT-TEST' },
                            ]}
                          />
                          <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            className="h-9 min-w-[140px]"
                            options={[
                              { value: 'all', label: 'Tất cả trạng thái' },
                              { value: 'upcoming', label: 'Sắp khai giảng' },
                              { value: 'ongoing', label: 'Đang diễn ra' },
                              { value: 'completed', label: 'Đã hoàn thành' },
                            ]}
                          />
                          <Tooltip title="Làm mới dữ liệu">
                            <Button
                              icon={<ReloadOutlined />}
                              onClick={fetchCourses}
                              className="rounded-xl h-9 w-9 flex items-center justify-center border-slate-200 text-slate-600 hover:text-rose-600"
                            />
                          </Tooltip>
                        </div>
                      </div>
                    </Col>

                    {/* Nút thêm căn phải */}
                    <Col xs={24} md={12} className="flex justify-start md:justify-end items-start">
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleOpenCreateCourse}
                        className="h-10 px-6 rounded-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 border-none shadow-sm shadow-rose-500/25 flex items-center gap-2 cursor-pointer ml-auto"
                      >
                        Thêm Khóa Học Mới
                      </Button>
                    </Col>
                  </Row>

                  {/* Bảng Khóa học */}
                  <Table
                    columns={courseColumns}
                    dataSource={courses}
                    rowKey="_id"
                    loading={loadingCourses}
                    pagination={{
                      position: ['bottomCenter'],
                      pageSize: 8,
                      showTotal: (total) => `Tổng cộng ${total} chương trình đào tạo`,
                    }}
                    scroll={{ x: 1700 }}
                    className="overflow-x-auto"
                  />
                </div>
              ),
            },
            {
              key: 'textbooks',
              label: (
                <span className="font-bold flex items-center gap-2">
                  <FilePdfOutlined className="text-rose-600" />
                  <span>2. Quản Lý Giáo Trình (Tài Liệu PDF) ({textbooks.length})</span>
                </span>
              ),
              children: (
                <div className="pt-2 space-y-4">
                  {/* Toolbar Giáo trình: 6/12 Trái (Tìm kiếm) & 6/12 Phải (Nút thêm căn phải) */}
                  <Row gutter={[16, 16]} align="top">
                    <Col xs={24} md={12}>
                      <div className="space-y-3">
                        <Input
                          prefix={<SearchOutlined className="text-slate-400 mr-1" />}
                          placeholder="Tìm tên giáo trình, mã giáo trình, tác giả..."
                          value={searchTbText}
                          onChange={(e) => setSearchTbText(e.target.value)}
                          allowClear
                          className="rounded-xl h-10 w-full"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <Select
                            value={selectedTbLevel}
                            onChange={setSelectedTbLevel}
                            className="h-9 min-w-[170px]"
                            options={[
                              { value: 'all', label: 'Tất cả cấp độ' },
                              { value: 'N5', label: 'Cấp độ N5' },
                              { value: 'N4', label: 'Cấp độ N4' },
                              { value: 'N3', label: 'Cấp độ N3' },
                              { value: 'N2', label: 'Cấp độ N2' },
                              { value: 'N1', label: 'Cấp độ N1' },
                              { value: 'Kaiwa', label: 'Giao tiếp Kaiwa' },
                              { value: 'Luyện thi JLPT', label: 'Luyện thi JLPT' },
                            ]}
                          />
                          <Tooltip title="Làm mới kho giáo trình">
                            <Button
                              icon={<ReloadOutlined />}
                              onClick={fetchTextbooks}
                              className="rounded-xl h-9 w-9 flex items-center justify-center border-slate-200 text-slate-600 hover:text-rose-600"
                            />
                          </Tooltip>
                        </div>
                      </div>
                    </Col>

                    {/* Nút thêm căn phải */}
                    <Col xs={24} md={12} className="flex justify-start md:justify-end items-start">
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleOpenCreateTextbook}
                        className="h-10 px-6 rounded-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 border-none shadow-sm shadow-rose-500/25 flex items-center gap-2 cursor-pointer ml-auto"
                      >
                        Thêm Giáo Trình (File PDF)
                      </Button>
                    </Col>
                  </Row>

                  {/* Bảng Giáo trình */}
                  <Table
                    columns={textbookColumns}
                    dataSource={textbooks}
                    rowKey="_id"
                    loading={loadingTextbooks}
                    pagination={{
                      position: ['bottomCenter'],
                      pageSize: 8,
                      showTotal: (total) => `Tổng cộng ${total} giáo trình tài liệu`,
                    }}
                    scroll={{ x: 1400 }}
                    className="overflow-x-auto"
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* ================= MODAL THÊM / SỬA KHÓA HỌC ================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-600 font-bold text-base pb-2 border-b border-rose-100">
            <BookOutlined />
            <span>{editingCourse ? 'Chỉnh Sửa Chương Trình Khóa Học' : 'Thêm Khóa Học Mới'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={760}
        destroyOnClose
        centered
      >
        <Form form={courseForm} layout="vertical" onFinish={handleSubmitCourse} className="pt-3 space-y-4">
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-3">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <ReadOutlined className="text-rose-500" />
              <span>1. Thông Tin Nhận Diện Khóa Học</span>
            </div>

            <Row gutter={14}>
              <Col xs={24} sm={16}>
                <Form.Item
                  label={<span className="font-semibold text-slate-700">Tên Khóa Học <span className="text-red-500 font-bold">*</span></span>}
                  name="title"
                  rules={[{ required: true, message: 'Vui lòng nhập tên khóa học!' }]}
                >
                  <Input placeholder="Ví dụ: Tiếng Nhật Sơ Cấp N5 (Minna no Nihongo I)" className="rounded-xl h-10" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  label={<span className="font-semibold text-slate-700">Mã Khóa Học <span className="text-red-500 font-bold">*</span></span>}
                  name="code"
                  rules={[{ required: true, message: 'Vui lòng nhập mã khóa học!' }]}
                >
                  <Input placeholder="VD: JP-N5-BASIC" className="rounded-xl h-10 uppercase font-mono" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={14}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={<span className="font-semibold text-slate-700">Cấp Độ / Trình Độ Đào Tạo <span className="text-red-500 font-bold">*</span></span>}
                  name="level"
                  rules={[{ required: true, message: 'Vui lòng chọn cấp độ!' }]}
                >
                  <Select
                    placeholder="Chọn cấp độ"
                    className="rounded-xl h-10"
                    options={[
                      { value: 'N5', label: 'Sơ Cấp N5' },
                      { value: 'N4', label: 'Sơ Cấp N4' },
                      { value: 'N3', label: 'Trung Cấp N3' },
                      { value: 'N2', label: 'Trung Cao N2' },
                      { value: 'N1', label: 'Cao Cấp N1' },
                      { value: 'Kaiwa', label: 'Giao Tiếp (Kaiwa)' },
                      { value: 'Luyện thi JLPT', label: 'Luyện Thi JLPT' },
                      { value: 'Luyện thi NAT-TEST', label: 'Luyện Thi NAT-TEST' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={<span className="font-semibold text-slate-700">Trạng Thái Tuyển Sinh</span>}
                  name="isActive"
                  valuePropName="checked"
                >
                  <div className="flex items-center gap-3 pt-1.5">
                    <Switch defaultChecked />
                    <span className="text-xs text-slate-600 font-medium">Đang mở tuyển sinh</span>
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100 space-y-3">
            <div className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOutlined className="text-rose-500" />
              <span>2. Chọn Giáo Trình Có Sẵn & Học Phí Chuẩn</span>
            </div>

            <Row gutter={14}>
              <Col xs={24}>
                <Form.Item
                  label={
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-slate-700">
                        Giáo Trình Áp Dụng <span className="text-red-500 font-bold">*</span>
                      </span>
                      <span className="text-xs text-rose-600 font-normal">
                        (Chọn từ kho giáo trình PDF có sẵn)
                      </span>
                    </div>
                  }
                  name="textbookId"
                  rules={[{ required: true, message: 'Vui lòng chọn giáo trình có sẵn!' }]}
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    placeholder="Chọn giáo trình đã có trong hệ thống..."
                    className="rounded-xl h-10"
                    options={textbooks.map((tb) => ({
                      value: tb._id,
                      label: `${tb.name} (${tb.level}) — File: ${tb.fileName || 'PDF'} (${tb.fileSizeFormatted || 'PDF'})`,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={14}>
              <Col xs={24} sm={8}>
                <Form.Item
                  label={<span className="font-semibold text-slate-700">Tổng Số Buổi Học <span className="text-red-500 font-bold">*</span></span>}
                  name="totalSessions"
                  rules={[{ required: true, message: 'Nhập tổng số buổi!' }]}
                >
                  <InputNumber min={1} max={200} className="w-full rounded-xl h-10" addonAfter="buổi" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  label={<span className="font-semibold text-slate-700">Học Phí Chuẩn (VNĐ) <span className="text-red-500 font-bold">*</span></span>}
                  name="tuitionFee"
                  rules={[{ required: true, message: 'Nhập học phí chuẩn!' }]}
                >
                  <InputNumber
                    min={0}
                    step={100000}
                    className="w-full rounded-xl h-10"
                    formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(val: any) => val.replace(/\$\s?|(,*)/g, '')}
                    addonAfter="VNĐ"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label={<span className="font-semibold text-slate-700">Thời Lượng Dự Kiến</span>} name="duration">
                  <Input placeholder="VD: 3 tháng (12 tuần)" className="rounded-xl h-10" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Row gutter={14}>
            <Col xs={24} sm={8}>
              <Form.Item label={<span className="font-semibold text-slate-700">Sĩ Số Tối Đa Khuyến Nghị</span>} name="maxStudents">
                <InputNumber min={1} max={100} className="w-full rounded-xl h-10" addonAfter="học viên" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={16}>
              <Form.Item label={<span className="font-semibold text-slate-700">Mục Tiêu & Mô Tả Đào Tạo</span>} name="description">
                <Input placeholder="Đạt chuẩn đầu ra JLPT N5, nắm vững 800 từ vựng và 100 chữ Kanji..." className="rounded-xl h-10" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-rose-100">
            <Button onClick={() => setIsModalOpen(false)} className="rounded-xl h-10 px-5">
              Hủy Bỏ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submittingCourse}
              className="rounded-xl h-10 px-6 font-bold bg-gradient-to-r from-rose-500 to-pink-500 border-none hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-500/20"
            >
              {editingCourse ? 'Lưu Thay Đổi' : 'Tạo Khóa Học'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ================= MODAL THÊM / SỬA GIÁO TRÌNH (UPLOAD PDF) ================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-600 font-bold text-base pb-2 border-b border-rose-100">
            <FilePdfOutlined />
            <span>{editingTextbook ? 'Chỉnh Sửa Giáo Trình (File PDF)' : 'Tạo Mới Giáo Trình (File PDF)'}</span>
          </div>
        }
        open={isTbModalOpen}
        onCancel={() => setIsTbModalOpen(false)}
        footer={null}
        width={720}
        destroyOnClose
        centered
      >
        <Form form={textbookForm} layout="vertical" onFinish={handleSubmitTextbook} className="pt-3 space-y-4">
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-3">
            <Row gutter={14}>
              <Col xs={24} sm={16}>
                <Form.Item
                  label={<span className="font-semibold text-slate-700">Tên Giáo Trình <span className="text-red-500 font-bold">*</span></span>}
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên giáo trình!' }]}
                >
                  <Input placeholder="Ví dụ: Minna no Nihongo I (Bài 1 - 25) + Bản Dịch" className="rounded-xl h-10" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  label={<span className="font-semibold text-slate-700">Mã Giáo Trình <span className="text-red-500 font-bold">*</span></span>}
                  name="code"
                  rules={[{ required: true, message: 'Vui lòng nhập mã giáo trình!' }]}
                >
                  <Input placeholder="VD: TB-MINNA-01" className="rounded-xl h-10 uppercase font-mono" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={14}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={<span className="font-semibold text-slate-700">Cấp Độ Áp Dụng <span className="text-red-500 font-bold">*</span></span>}
                  name="level"
                  rules={[{ required: true, message: 'Vui lòng chọn cấp độ!' }]}
                >
                  <Select
                    placeholder="Chọn cấp độ"
                    className="rounded-xl h-10"
                    options={[
                      { value: 'N5', label: 'Cấp độ N5' },
                      { value: 'N4', label: 'Cấp độ N4' },
                      { value: 'N3', label: 'Cấp độ N3' },
                      { value: 'N2', label: 'Cấp độ N2' },
                      { value: 'N1', label: 'Cấp độ N1' },
                      { value: 'Kaiwa', label: 'Giao Tiếp (Kaiwa)' },
                      { value: 'Luyện thi JLPT', label: 'Luyện Thi JLPT' },
                      { value: 'Tất cả', label: 'Mọi Trình Độ' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={<span className="font-semibold text-slate-700">Tổng Số Bài Học</span>} name="totalLessons">
                  <InputNumber min={1} max={100} className="w-full rounded-xl h-10" addonAfter="bài" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={14}>
              <Col xs={24} sm={12}>
                <Form.Item label={<span className="font-semibold text-slate-700">Tác Giả / Biên Soạn</span>} name="author">
                  <Input placeholder="VD: 3A Corporation, Etsuko Tomomatsu..." className="rounded-xl h-10" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={<span className="font-semibold text-slate-700">Nhà Xuất Bản</span>} name="publisher">
                  <Input placeholder="VD: NXB Trẻ, Kuroshio..." className="rounded-xl h-10" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* KHU VỰC TẢI LÊN FILE .PDF */}
          <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <FilePdfOutlined className="text-rose-600" />
                <span>Tệp Tài Liệu PDF Giáo Trình (.pdf) *</span>
              </span>
              <span className="text-[11px] text-slate-500">Tối đa 50MB</span>
            </div>

            <Upload.Dragger
              name="file"
              multiple={false}
              accept=".pdf,application/pdf"
              showUploadList={false}
              customRequest={async (options) => {
                const { file, onSuccess, onError } = options;
                setUploadingPdf(true);
                try {
                  const res = await textbookService.uploadPdf(file as File);
                  if (res.success && res.data) {
                    textbookForm.setFieldsValue({
                      fileUrl: res.data.fileUrl,
                      fileName: res.data.fileName,
                      fileSize: res.data.fileSize,
                      fileSizeFormatted: res.data.fileSizeFormatted,
                    });
                    setUploadedPdfInfo(res.data);
                    message.success(`Đã tải lên tệp "${res.data.fileName}" thành công!`);
                    onSuccess?.(res.data);
                  }
                } catch (err: any) {
                  message.error(err.response?.data?.message || 'Tải lên tệp PDF thất bại');
                  onError?.(err);
                } finally {
                  setUploadingPdf(false);
                }
              }}
              className="rounded-2xl p-4 bg-white border-2 border-dashed border-rose-200 hover:border-rose-400 cursor-pointer transition-colors"
            >
              <p className="ant-upload-drag-icon text-center mb-2">
                <InboxOutlined className="text-4xl text-rose-400" />
              </p>
              <p className="ant-upload-text font-bold text-sm text-slate-800 text-center">
                Kéo thả file PDF vào đây hoặc bấm để chọn tệp (.pdf)
              </p>
              <p className="ant-upload-hint text-xs text-slate-400 text-center">
                Hỗ trợ tệp định dạng .pdf (sách giáo khoa, sách bài tập, đề thi thử...)
              </p>
            </Upload.Dragger>

            {/* Hiển thị file PDF đã đính kèm */}
            {uploadedPdfInfo?.fileUrl && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircleFilled className="text-emerald-500 text-base" />
                  <div>
                    <span className="font-bold text-slate-800 block">{uploadedPdfInfo.fileName}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{uploadedPdfInfo.fileSizeFormatted}</span>
                  </div>
                </div>
                <Button
                  size="small"
                  type="link"
                  icon={<FilePdfOutlined />}
                  onClick={() =>
                    handleOpenPdfPreview(
                      textbookForm.getFieldValue('name') || 'Xem thử PDF',
                      uploadedPdfInfo.fileUrl,
                      textbookForm.getFieldValue('level'),
                      uploadedPdfInfo.fileSizeFormatted
                    )
                  }
                  className="text-rose-600 font-semibold"
                >
                  Đọc thử ngay
                </Button>
              </div>
            )}

            {/* Hidden form fields to hold upload info */}
            <Form.Item name="fileUrl" hidden rules={[{ required: true, message: 'Vui lòng upload tệp PDF!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="fileName" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="fileSize" hidden>
              <InputNumber />
            </Form.Item>
            <Form.Item name="fileSizeFormatted" hidden>
              <Input />
            </Form.Item>
          </div>

          <Form.Item label={<span className="font-semibold text-slate-700">Ghi Chú / Mô Tả Giáo Trình</span>} name="description">
            <Input placeholder="Mô tả mục tiêu, bài tập hoặc cấu trúc sách..." className="rounded-xl h-10" />
          </Form.Item>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-rose-100">
            <Button onClick={() => setIsTbModalOpen(false)} className="rounded-xl h-10 px-5">
              Hủy Bỏ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submittingTextbook || uploadingPdf}
              className="rounded-xl h-10 px-6 font-bold bg-gradient-to-r from-rose-500 to-pink-500 border-none hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-500/20"
            >
              {editingTextbook ? 'Lưu Thay Đổi' : 'Lưu Giáo Trình'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ================= MODAL XEM CHI TIẾT KHÓA HỌC ================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-600 font-bold text-lg pb-2 border-b border-rose-100">
            <InfoCircleOutlined />
            <span>Hồ Sơ Chương Trình Đào Tạo</span>
          </div>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={800}
        loading={loadingDetail}
        centered
        destroyOnClose
      >
        {detailCourse && (
          <div className="space-y-5 pt-2">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-white border border-rose-100 flex items-start justify-between">
              <div>
                <Tag color="rose" className="font-mono font-bold text-xs uppercase mb-1">
                  {detailCourse.code}
                </Tag>
                <div className="text-lg font-black text-slate-900">{detailCourse.title}</div>
                {detailCourse.description && (
                  <div className="text-xs text-slate-500 mt-1">{detailCourse.description}</div>
                )}
              </div>
              <Tag
                color={LEVEL_CONFIG[detailCourse.level]?.color || 'rose'}
                className="font-bold text-xs rounded-full px-3 py-1"
              >
                {LEVEL_CONFIG[detailCourse.level]?.label || detailCourse.level}
              </Tag>
            </div>

            <Descriptions
              bordered
              size="middle"
              column={{ xs: 1, sm: 2 }}
              className="rounded-xl overflow-hidden shadow-xs"
              labelStyle={{
                backgroundColor: '#FFF9FA',
                fontWeight: 600,
                color: '#475569',
                width: '180px',
                whiteSpace: 'nowrap',
              }}
              contentStyle={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                whiteSpace: 'nowrap',
              }}
            >
              <Descriptions.Item label="Trình Độ Đào Tạo">
                <span className="font-semibold">{detailCourse.level}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Học Phí Chuẩn">
                <span className="font-bold text-rose-600 font-mono text-base">
                  {formatCurrency(detailCourse.tuitionFee)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng Số Buổi">
                <span className="font-bold text-slate-900">{detailCourse.totalSessions} buổi</span>
                {detailCourse.duration && <span className="text-slate-500 ml-1">({detailCourse.duration})</span>}
              </Descriptions.Item>
              <Descriptions.Item label="Sĩ Số Khuyến Nghị">
                <span>Tối đa {detailCourse.maxStudents || 20} học viên / lớp</span>
              </Descriptions.Item>
              <Descriptions.Item label="Giáo Trình Áp Dụng" span={2}>
                <div
                  onClick={() => handlePreviewCourseTextbook(detailCourse)}
                  className="flex items-center gap-2 cursor-pointer text-rose-600 hover:text-rose-700 font-semibold"
                  title="Bấm để đọc file PDF"
                >
                  <FilePdfOutlined className="text-lg text-rose-500" />
                  <span className="underline">{detailCourse.textbook}</span>
                  <span className="text-[11px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-200">
                    📖 Đọc thử PDF
                  </span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng Thái Tuyển Sinh" span={2}>
                <Tag color={detailCourse.isActive !== false ? 'green' : 'default'} className="font-semibold">
                  {detailCourse.isActive !== false ? 'Đang mở tuyển sinh' : 'Tạm dừng tuyển sinh'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {detailCourse.classes && detailCourse.classes.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <TeamOutlined className="text-rose-500" />
                  <span>Các Lớp Học Thuộc Khóa Này ({detailCourse.classes.length})</span>
                </div>
                <div className="space-y-2">
                  {detailCourse.classes.map((cls: any) => (
                    <div
                      key={cls._id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{cls.name}</span>
                        <span className="font-mono text-rose-600 font-bold ml-2">({cls.classCode})</span>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {cls.branchId?.name} • Giáo viên: {cls.primaryTeacherId?.name || 'Chưa phân công'}
                        </div>
                      </div>
                      <Tag color="cyan" className="font-semibold">
                        {cls.status === 'upcoming' ? 'Sắp mở' : cls.status === 'ongoing' ? 'Đang học' : cls.status}
                      </Tag>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-rose-100">
              <Button onClick={() => setDetailModalOpen(false)} className="rounded-xl h-10 px-6">
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= MODAL ĐỌC FILE PDF TẠM THỜI (PDF VIEWER) ================= */}
      <Modal
        title={
          <div className="flex items-center justify-between pr-8 border-b border-rose-100 pb-2">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <FilePdfOutlined className="text-xl text-rose-600" />
              <span className="truncate max-w-[450px]">{previewPdf?.title}</span>
            </div>
            <div className="flex items-center gap-2">
              {previewPdf?.level && (
                <Tag color="rose" className="rounded-md font-semibold text-xs">
                  {previewPdf.level}
                </Tag>
              )}
              {previewPdf?.size && (
                <Tag color="cyan" className="rounded-md font-semibold text-xs font-mono">
                  {previewPdf.size}
                </Tag>
              )}
              <Button
                type="primary"
                size="small"
                icon={<ExportOutlined />}
                href={formatPdfUrl(previewPdf?.url)}
                target="_blank"
                className="bg-rose-500 hover:bg-rose-600 border-none rounded-lg text-xs"
              >
                Mở Tab Mới
              </Button>
            </div>
          </div>
        }
        open={pdfModalOpen}
        onCancel={() => setPdfModalOpen(false)}
        footer={null}
        width={950}
        centered
        destroyOnClose
        className="pdf-preview-modal"
      >
        <div className="pt-2">
          {previewPdf?.url ? (
            <iframe
              src={formatPdfUrl(previewPdf.url)}
              className="w-full h-[680px] rounded-2xl border border-slate-200 shadow-inner bg-slate-50"
              title={previewPdf.title}
            />
          ) : (
            <div className="text-center py-20 text-slate-400">
              Không tìm thấy tệp PDF của giáo trình này
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
