import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
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
} from '@ant-design/icons';
import {
  courseService,
  type Course,
  type CreateCourseInput,
} from '../../../services/course.service';

const LEVEL_CONFIG: Record<
  string,
  { label: string; color: string; border: string; text: string }
> = {
  N5: { label: 'Sơ Cấp N5', color: 'purple', border: 'border-purple-200', text: 'text-purple-700' },
  N4: { label: 'Sơ Cấp N4', color: 'blue', border: 'border-blue-200', text: 'text-blue-700' },
  N3: { label: 'Trung Cấp N3', color: 'cyan', border: 'border-cyan-200', text: 'text-cyan-700' },
  N2: { label: 'Trung Cao N2', color: 'orange', border: 'border-orange-200', text: 'text-orange-700' },
  N1: { label: 'Cao Cấp N1', color: 'red', border: 'border-red-200', text: 'text-red-700' },
  Kaiwa: { label: 'Giao Tiếp (Kaiwa)', color: 'green', border: 'border-emerald-200', text: 'text-emerald-700' },
  'Luyện thi JLPT': { label: 'Luyện Thi JLPT', color: 'volcano', border: 'border-rose-200', text: 'text-rose-700' },
  'Luyện thi NAT-TEST': { label: 'Luyện Thi NAT-TEST', color: 'magenta', border: 'border-pink-200', text: 'text-pink-700' },
  JLPT: { label: 'Luyện Thi JLPT', color: 'volcano', border: 'border-rose-200', text: 'text-rose-700' },
  'NAT-TEST': { label: 'Luyện Thi NAT-TEST', color: 'magenta', border: 'border-pink-200', text: 'text-pink-700' },
};

const TEXTBOOK_SUGGESTIONS = [
  'Minna no Nihongo I (Bài 1 - 25) + Flashcard Kanji',
  'Minna no Nihongo II (Bài 26 - 50)',
  'Shinkanzen Master N3 (Ngữ pháp, Đọc hiểu, Nghe, Từ vựng)',
  'Shinkanzen Master N2 (Tổng hợp 4 kỹ năng)',
  'Shinkanzen Master N1 (Luyện đề chuyên sâu)',
  'Soumatome N3 / N2',
  'Mimi Kara Oboeru (Từ vựng & Nghe hiểu)',
  'Giáo trình Shadowing: Tiếng Nhật Giao Tiếp Đời Sống',
  'Bộ Đề Thi Thử Chuẩn JLPT & NAT-TEST Độc Quyền',
];

export const CourseManagementView: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Filters
  const [searchText, setSearchText] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [form] = Form.useForm();

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Fetch courses
  const fetchData = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, [searchText, selectedLevel, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCourse(null);
    form.resetFields();
    form.setFieldsValue({
      level: 'N5',
      textbook: 'Minna no Nihongo I (Bài 1 - 25) + Flashcard Kanji',
      totalSessions: 45,
      tuitionFee: 3500000,
      duration: '3 tháng (12 tuần)',
      maxStudents: 20,
      status: 'upcoming',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (record: Course) => {
    setEditingCourse(record);
    form.setFieldsValue({
      title: record.title,
      code: record.code,
      level: record.level,
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

  // Open Detail Modal
  const handleOpenDetail = async (record: Course) => {
    setDetailCourse(record);
    setDetailModalOpen(true);
    setLoadingDetail(true);
    try {
      const res = await courseService.getCourseById(record._id);
      if (res.success && res.data) {
        setDetailCourse(res.data);
      }
    } catch {
      // Use fallback already set
    } finally {
      setLoadingDetail(false);
    }
  };

  // Submit Form
  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const payload: CreateCourseInput = {
        title: values.title.trim(),
        code: values.code.trim().toUpperCase(),
        level: values.level,
        textbook: values.textbook?.trim() || 'Minna no Nihongo I',
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
      form.resetFields();
      fetchData();
    } catch (err: any) {
      const resp = err.response?.data;
      if (resp?.errors && Array.isArray(resp.errors) && resp.errors.length > 0) {
        const detailMsg = resp.errors.map((e: any) => e.message).join(' | ');
        message.error(`${resp.message || 'Lỗi dữ liệu'}: ${detailMsg}`, 6);
      } else {
        message.error(resp?.message || 'Có lỗi xảy ra, vui lòng thử lại', 6);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Course
  const handleDelete = async (id: string) => {
    try {
      await courseService.deleteCourse(id);
      message.success('Đã xóa khóa học thành công!');
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa khóa học này', 5);
    }
  };

  // Quick stats
  const stats = useMemo(() => {
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

  // Table columns: Header centered, Action on the left, Codes centered, Text left, Numbers right
  const columns = [
    {
      title: 'Thao Tác',
      key: 'action',
      width: 130,
      align: 'center' as const,
      fixed: 'left' as const,
      render: (_: any, record: Course) => (
        <Space size="small" className="justify-center whitespace-nowrap">
          <Tooltip title="Xem chi tiết khóa học">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined className="text-slate-500 hover:text-slate-800" />}
              onClick={() => handleOpenDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa thông tin">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined className="text-blue-500 hover:text-blue-700" />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa khóa học">
            <Popconfirm
              title="Xóa khóa học này?"
              description={`Bạn có chắc muốn xóa khóa học "${record.title}"?`}
              onConfirm={() => handleDelete(record._id)}
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
      title: 'Giáo Trình Áp Dụng',
      dataIndex: 'textbook',
      key: 'textbook',
      width: 300,
      align: 'left' as const,
      render: (tb: string) => (
        <div className="text-left text-xs text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
          <BookOutlined className="text-rose-500 shrink-0" />
          <span className="font-medium truncate max-w-[270px]">{tb || 'Minna no Nihongo'}</span>
        </div>
      ),
    },
    {
      title: 'Tổng Số Buổi',
      dataIndex: 'totalSessions',
      key: 'totalSessions',
      width: 140,
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
      width: 170,
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

  return (
    <div className="space-y-6">
      {/* Thẻ thống kê chương trình đào tạo */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-rose-100 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 text-lg">
                <ReadOutlined />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Tổng Khóa Đào Tạo</span>
                <span className="text-xl font-black text-slate-900">{stats.total}</span>
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
                <span className="text-xl font-black text-slate-900">{stats.basic}</span>
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
                <span className="text-xl font-black text-slate-900">{stats.advanced}</span>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-rose-100 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-lg">
                <TeamOutlined />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Giao Tiếp (Kaiwa)</span>
                <span className="text-xl font-black text-slate-900">{stats.kaiwa}</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Card View */}
      <Card className="rounded-2xl border-rose-100 shadow-xs">
        {/* Toolbar: 6/12 left (Search on top, Filters underneath) - 6/12 right (Add button right-aligned) */}
        <div className="mb-6 space-y-3">
          <Row gutter={[16, 16]} align="top">
            {/* Cột trái 6/12: Ô tìm kiếm ở trên, các bộ lọc ở dưới */}
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
                      onClick={fetchData}
                      className="rounded-xl h-9 w-9 flex items-center justify-center border-slate-200 text-slate-600 hover:text-rose-600"
                    />
                  </Tooltip>
                </div>
              </div>
            </Col>

            {/* Cột phải 6/12: Nút "+ Thêm Khóa Học Mới" căn sát mép phải */}
            <Col xs={24} md={12} className="flex justify-start md:justify-end items-start">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreate}
                className="h-10 px-6 rounded-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 border-none shadow-sm shadow-rose-500/25 flex items-center gap-2 cursor-pointer"
              >
                Thêm Khóa Học Mới
              </Button>
            </Col>
          </Row>
        </div>

        {/* Table View */}
        <Table
          columns={columns}
          dataSource={courses}
          rowKey="_id"
          loading={loading}
          pagination={{
            position: ['bottomCenter'],
            pageSize: 8,
            showTotal: (total) => `Tổng cộng ${total} khóa học đào tạo`,
          }}
          scroll={{ x: 1600 }}
          className="overflow-x-auto"
        />
      </Card>

      {/* MODAL THÊM / CHỈNH SỬA KHÓA HỌC */}
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
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="pt-3 space-y-4">
          {/* KHỐI 1: TÊN, MÃ & CẤP ĐỘ */}
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

          {/* KHỐI 2: GIÁO TRÌNH, BUỔI HỌC VÀ HỌC PHÍ CHUẨN */}
          <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100 space-y-3">
            <div className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOutlined className="text-rose-500" />
              <span>2. Giáo Trình, Khối Lượng Đào Tạo & Học Phí Chuẩn</span>
            </div>

            <Row gutter={14}>
              <Col xs={24}>
                <Form.Item
                  label={<span className="font-semibold text-slate-700">Giáo Trình Áp Dụng <span className="text-red-500 font-bold">*</span></span>}
                  name="textbook"
                  rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập giáo trình áp dụng!' }]}
                >
                  <Select
                    showSearch
                    placeholder="Chọn giáo trình chuẩn hoặc nhập tên mới"
                    className="rounded-xl h-10"
                    options={TEXTBOOK_SUGGESTIONS.map((t) => ({ value: t, label: t }))}
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

          {/* KHỐI 3: QUY MÔ & MÔ TẢ */}
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
              loading={submitting}
              className="rounded-xl h-10 px-6 font-bold bg-gradient-to-r from-rose-500 to-pink-500 border-none hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-500/20"
            >
              {editingCourse ? 'Lưu Thay Đổi' : 'Tạo Khóa Học'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* MODAL XEM CHI TIẾT KHÓA HỌC */}
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
            {/* Header banner */}
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

            {/* Descriptions */}
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
                <div className="flex items-center gap-2">
                  <BookOutlined className="text-rose-500" />
                  <span className="font-medium text-slate-800">{detailCourse.textbook}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng Thái Tuyển Sinh" span={2}>
                <Tag color={detailCourse.isActive !== false ? 'green' : 'default'} className="font-semibold">
                  {detailCourse.isActive !== false ? 'Đang mở tuyển sinh' : 'Tạm dừng tuyển sinh'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* Danh sách lớp học đang mở thuộc khóa này */}
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
    </div>
  );
};
