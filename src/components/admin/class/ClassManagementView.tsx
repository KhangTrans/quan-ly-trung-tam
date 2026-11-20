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
  DatePicker,
  Checkbox,
  Avatar,
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
  ShopOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { classService, type ClassItem, type CreateClassInput, type Teacher } from '../../../services/class.service';
import { branchService, type Branch } from '../../../services/branch.service';
import { classroomService, type Classroom } from '../../../services/classroom.service';
import { shiftSlotService, type ShiftSlot } from '../../../services/shiftSlot.service';
import { courseService, type Course } from '../../../services/course.service';

const DAYS_OF_WEEK_OPTIONS = [
  { label: 'Thứ 2', value: 2 },
  { label: 'Thứ 3', value: 3 },
  { label: 'Thứ 4', value: 4 },
  { label: 'Thứ 5', value: 5 },
  { label: 'Thứ 6', value: 6 },
  { label: 'Thứ 7', value: 7 },
  { label: 'Chủ Nhật', value: 8 },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  upcoming: { label: 'Sắp khai giảng', color: 'orange' },
  ongoing: { label: 'Đang diễn ra', color: 'green' },
  completed: { label: 'Đã hoàn thành', color: 'blue' },
  cancelled: { label: 'Đã hủy', color: 'red' },
};

export const ClassManagementView: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [shiftSlots, setShiftSlots] = useState<ShiftSlot[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Toolbar filters
  const [searchText, setSearchText] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [form] = Form.useForm();

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [detailClass, setDetailClass] = useState<ClassItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Filter classrooms by branch selected in Form
  const selectedFormBranchId = Form.useWatch('branchId', form);
  const filteredClassroomsForForm = useMemo(() => {
    if (!selectedFormBranchId) return classrooms;
    return classrooms.filter((r) => {
      const bId = typeof r.branchId === 'object' ? (r.branchId as any)._id : r.branchId;
      return bId === selectedFormBranchId;
    });
  }, [classrooms, selectedFormBranchId]);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [classRes, branchRes, roomRes, shiftRes, courseRes, teacherRes] = await Promise.all([
        classService.getAllClasses({
          search: searchText || undefined,
          branchId: selectedBranchId !== 'all' ? selectedBranchId : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        }),
        branchService.getAllBranches(),
        classroomService.getAllClassrooms(),
        shiftSlotService.getAllShiftSlots(),
        courseService.getAllCourses(),
        classService.getTeachers(),
      ]);

      if (classRes.success) setClasses(Array.isArray(classRes.data) ? classRes.data : []);
      if (branchRes.success) setBranches(Array.isArray(branchRes.data) ? branchRes.data : []);
      if (roomRes.success) setClassrooms(Array.isArray(roomRes.data) ? roomRes.data : []);
      if (shiftRes.success) setShiftSlots(Array.isArray(shiftRes.data) ? shiftRes.data : []);
      if (courseRes.success) setCourses(Array.isArray(courseRes.data) ? courseRes.data : (courseRes.data as any)?.courses || []);
      if (teacherRes.success) setTeachers(Array.isArray(teacherRes.data) ? teacherRes.data : []);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  }, [searchText, selectedBranchId, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingClass(null);
    form.resetFields();
    form.setFieldsValue({
      maxStudents: 20,
      daysOfWeek: [2, 4, 6],
      status: 'upcoming',
      startDate: dayjs().add(7, 'day'),
      endDateExpected: dayjs().add(97, 'day'),
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (record: ClassItem) => {
    setEditingClass(record);
    const branchId = typeof record.branchId === 'object' ? record.branchId._id : record.branchId;
    const courseId = typeof record.courseId === 'object' ? record.courseId._id : record.courseId;
    const teacherId = typeof record.primaryTeacherId === 'object' ? record.primaryTeacherId._id : record.primaryTeacherId;
    const roomId = typeof record.defaultClassroomId === 'object' ? record.defaultClassroomId._id : record.defaultClassroomId;
    const shiftId = typeof record.shiftSlotId === 'object' ? record.shiftSlotId._id : record.shiftSlotId;

    form.setFieldsValue({
      name: record.name,
      classCode: record.classCode,
      courseId,
      branchId,
      primaryTeacherId: teacherId,
      defaultClassroomId: roomId,
      shiftSlotId: shiftId,
      daysOfWeek: record.daysOfWeek,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDateExpected: record.endDateExpected ? dayjs(record.endDateExpected) : null,
      maxStudents: record.maxStudents,
      status: record.status,
      notes: record.notes || '',
    });
    setIsModalOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetail = async (record: ClassItem) => {
    setDetailClass(record);
    setDetailModalOpen(true);
    setLoadingDetail(true);
    try {
      const res = await classService.getClassById(record._id);
      if (res.success) {
        setDetailClass(res.data);
      }
    } catch {
      // Use fallback already set
    } finally {
      setLoadingDetail(false);
    }
  };

  // Submit Create or Edit Form
  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const payload: CreateClassInput = {
        name: values.name.trim(),
        classCode: values.classCode.trim().toUpperCase(),
        courseId: values.courseId,
        branchId: values.branchId,
        primaryTeacherId: values.primaryTeacherId,
        defaultClassroomId: values.defaultClassroomId,
        shiftSlotId: values.shiftSlotId,
        daysOfWeek: values.daysOfWeek,
        startDate: values.startDate.toISOString(),
        endDateExpected: values.endDateExpected ? values.endDateExpected.toISOString() : undefined,
        maxStudents: values.maxStudents,
        status: values.status,
        notes: values.notes?.trim() || '',
      };

      if (editingClass) {
        await classService.updateClass(editingClass._id, payload);
        message.success('Cập nhật thông tin lớp học thành công!');
      } else {
        await classService.createClass(payload);
        message.success('Thêm lớp học mới thành công!');
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

  // Delete Class
  const handleDelete = async (id: string) => {
    try {
      await classService.deleteClass(id);
      message.success('Đã xóa lớp học thành công!');
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa lớp học này');
    }
  };

  // Format Days Of Week to string (e.g. T2-4-6)
  const formatDays = (days: number[] = []) => {
    if (!days || days.length === 0) return 'Chưa xếp';
    const sorted = [...days].sort();
    return sorted.map((d) => (d === 8 ? 'CN' : `T${d}`)).join('-');
  };

  // Format Shift Name without repeating hours if already in name
  const formatShiftName = (shift?: any) => {
    if (!shift) return '---';
    const name = shift.name || '';
    if (shift.startTime && shift.endTime && !name.includes(shift.startTime)) {
      return `${name} (${shift.startTime} - ${shift.endTime})`;
    }
    return name;
  };

  // Table Columns with Action first and all column titles centered!
  const columns = [
    {
      title: 'Thao Tác',
      key: 'action',
      width: 175,
      align: 'center' as const,
      fixed: 'left' as const,
      render: (_: any, record: ClassItem) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px' }}>
          <Space size={4} className="whitespace-nowrap">
            <Tooltip title="Xem chi tiết lớp học">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleOpenDetail(record)}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 w-8 h-8 flex items-center justify-center"
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa lớp">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleOpenEdit(record)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-8 h-8 flex items-center justify-center"
              />
            </Tooltip>
            <Tooltip title="Xóa lớp học">
              <Popconfirm
                title="Xóa lớp học này?"
                description="Bạn có chắc chắn muốn xóa lớp học này không? Hành động này không thể hoàn tác."
                onConfirm={() => handleDelete(record._id)}
                okText="Đồng ý xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  className="hover:bg-red-50 w-8 h-8 flex items-center justify-center"
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        </div>
      ),
    },
    {
      title: 'Mã Lớp',
      dataIndex: 'classCode',
      key: 'classCode',
      width: 160,
      align: 'center' as const,
      render: (code: string) => (
        <strong className="text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 font-mono text-xs block text-center whitespace-nowrap">
          {code}
        </strong>
      ),
    },
    {
      title: 'Tên Lớp Học',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      align: 'left' as const,
      render: (name: string, record: ClassItem) => (
        <span
          className="font-bold text-slate-800 text-xs hover:text-rose-600 cursor-pointer whitespace-nowrap block text-left"
          onClick={() => handleOpenDetail(record)}
        >
          {name}
        </span>
      ),
    },
    {
      title: 'Khóa Học & Trình Độ',
      key: 'course',
      width: 300,
      align: 'left' as const,
      render: (_: any, record: ClassItem) => {
        const course = record.courseId;
        return (
          <div className="text-left text-xs whitespace-nowrap">
            <div className="font-semibold text-slate-800">
              {course ? course.title : 'Chưa gán khóa'}
            </div>
            {course?.level && (
              <Tag color="magenta" className="text-[10px] rounded-md font-bold mt-0.5">
                JLPT {course.level}
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Cơ Sở & Phòng Học',
      key: 'location',
      width: 300,
      align: 'left' as const,
      render: (_: any, record: ClassItem) => {
        const branch = record.branchId;
        const room = record.defaultClassroomId;
        return (
          <div className="text-left text-xs space-y-0.5 whitespace-nowrap">
            <div className="flex items-center gap-1 font-medium text-slate-700">
              <ShopOutlined className="text-rose-500 shrink-0" />
              <span>{branch ? branch.name : 'Chưa phân cơ sở'}</span>
            </div>
            {room && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <span className="bg-slate-100 text-slate-700 font-mono px-1.5 py-0.5 rounded">
                  Phòng: {room.roomCode}
                </span>
                <span>({room.capacity} chỗ)</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Giảng Viên Phụ Trách',
      key: 'teacher',
      width: 240,
      align: 'left' as const,
      render: (_: any, record: ClassItem) => {
        const teacher = record.primaryTeacherId;
        return (
          <div className="flex items-center justify-start gap-2 whitespace-nowrap">
            <Avatar size="small" style={{ backgroundColor: '#e11d48' }} src={teacher?.avatar}>
              {teacher?.name ? teacher.name.charAt(0).toUpperCase() : 'T'}
            </Avatar>
            <span className="font-medium text-slate-800 text-xs">
              {teacher ? teacher.name : 'Chưa phân công'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Lịch Học & Ca Học',
      key: 'schedule',
      width: 220,
      align: 'center' as const,
      render: (_: any, record: ClassItem) => {
        const shift = record.shiftSlotId;
        return (
          <div className="text-center text-xs whitespace-nowrap">
            <Tag color="cyan" className="font-semibold rounded-md">
              {formatDays(record.daysOfWeek)}
            </Tag>
            {shift && (
              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-center gap-1">
                <ClockCircleOutlined className="text-rose-400" />
                <span>{shift.startTime} - {shift.endTime}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Sĩ Số',
      key: 'students',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: ClassItem) => {
        const current = record.currentStudentCount || (record.enrollments ? record.enrollments.length : 0);
        const max = record.maxStudents || 20;
        const isFull = current >= max;
        return (
          <div className="text-center whitespace-nowrap">
            <Tag color={isFull ? 'red' : 'blue'} className="font-bold rounded-full px-2">
              {current}/{max}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Ngày Khai Giảng',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 150,
      align: 'center' as const,
      render: (date: string) => (
        <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
          {date ? dayjs(date).format('DD/MM/YYYY') : '---'}
        </span>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      align: 'center' as const,
      render: (status: string) => {
        const conf = STATUS_CONFIG[status] || { label: status, color: 'default' };
        return (
          <Tag color={conf.color} className="font-semibold rounded-full px-2.5 whitespace-nowrap">
            {conf.label}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-rose-100 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 text-lg">
                <BookOutlined />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Tổng Lớp Đã Tạo</span>
                <span className="text-xl font-black text-slate-900">{classes.length}</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-rose-100 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-lg">
                <CheckCircleOutlined />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Lớp Đang Diễn Ra</span>
                <span className="text-xl font-black text-slate-900">
                  {classes.filter((c) => c.status === 'ongoing').length}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-rose-100 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 text-lg">
                <CalendarOutlined />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Sắp Khai Giảng</span>
                <span className="text-xl font-black text-slate-900">
                  {classes.filter((c) => c.status === 'upcoming').length}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-rose-100 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 text-lg">
                <TeamOutlined />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Tổng Học Viên Đang Học</span>
                <span className="text-xl font-black text-slate-900">
                  {classes.reduce((sum, c) => sum + (c.currentStudentCount || 0), 0)}
                </span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card
        className="rounded-3xl border-rose-100 shadow-sm bg-white overflow-hidden"
        title={
          <div className="py-1">
            <span className="font-bold text-slate-800 text-base block">Quản Lý Lớp Học & Khóa Đào Tạo</span>
            <span className="text-xs text-slate-500 font-normal">
              Mở lớp mới, phân bổ cơ sở, phòng học, ca học chuẩn và chỉ định giáo viên phụ trách
            </span>
          </div>
        }
      >
        {/* TOOLBAR ROW: Cột trái 6/12 (Tìm kiếm ở trên, tất cả bộ lọc ở dưới) & Cột phải 6/12 (Nút thêm mới nằm riêng - Căn sát mép phải) */}
        <div className="mb-4 pb-4 border-b border-rose-100/60 w-full">
          <Row gutter={[20, 16]} align="middle" className="w-full" style={{ width: '100%', margin: 0 }}>
            {/* Cột 6/12 bên trái: Ô tìm kiếm ở trên, tất cả bộ lọc nằm bên dưới */}
            <Col xs={24} md={12} style={{ paddingLeft: 0 }}>
              <div className="space-y-3">
                <Input
                  placeholder="Tìm kiếm mã lớp, tên lớp, ghi chú..."
                  prefix={<SearchOutlined className="text-slate-400" />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  className="w-full rounded-xl border-rose-200 shadow-2xs h-10"
                />

                {/* Tất cả bộ lọc nằm bên dưới ô tìm kiếm */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <Select
                    value={selectedBranchId}
                    onChange={setSelectedBranchId}
                    className="w-44 rounded-xl h-9"
                    options={[
                      { value: 'all', label: 'Tất cả cơ sở' },
                      ...branches.map((b) => ({ value: b._id, label: b.name })),
                    ]}
                  />

                  <div className="flex items-center rounded-xl bg-slate-100 p-0.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-lg transition-all border-none cursor-pointer ${
                        statusFilter === 'all' ? 'bg-white text-rose-600 shadow-xs' : 'bg-transparent text-slate-600'
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('upcoming')}
                      className={`px-3 py-1.5 rounded-lg transition-all border-none cursor-pointer ${
                        statusFilter === 'upcoming' ? 'bg-white text-amber-600 shadow-xs' : 'bg-transparent text-slate-600'
                      }`}
                    >
                      Sắp mở
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('ongoing')}
                      className={`px-3 py-1.5 rounded-lg transition-all border-none cursor-pointer ${
                        statusFilter === 'ongoing' ? 'bg-white text-emerald-600 shadow-xs' : 'bg-transparent text-slate-600'
                      }`}
                    >
                      Đang học
                    </button>
                  </div>

                  <Tooltip title="Tải lại danh sách">
                    <Button
                      shape="circle"
                      icon={<ReloadOutlined spin={loading} />}
                      onClick={fetchData}
                      className="border-rose-200 text-rose-600 hover:border-rose-300 h-9 w-9 shrink-0"
                    />
                  </Tooltip>
                </div>
              </div>
            </Col>

            {/* Cột 6/12 bên phải: Nút thêm mới nằm riêng 6/12 - Căn sát mép phải */}
            <Col xs={24} md={12} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: 0, width: '100%' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreate}
                style={{ marginLeft: 'auto' }}
                className="h-10 px-6 rounded-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 border-none shadow-sm shadow-rose-500/25 flex items-center gap-2 cursor-pointer"
              >
                Thêm Lớp Học Mới
              </Button>
            </Col>
          </Row>
        </div>

        {/* Table view */}
        <Table
          columns={columns}
          dataSource={classes}
          rowKey="_id"
          loading={loading}
          pagination={{
            position: ['bottomCenter'],
            pageSize: 8,
            showTotal: (total) => `Tổng cộng ${total} lớp học`,
          }}
          scroll={{ x: 2100 }}
          className="overflow-x-auto"
        />
      </Card>

      {/* MODAL THÊM / SỬA LỚP HỌC */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-600 font-bold text-base pb-2 border-b border-rose-100">
            <BookOutlined />
            <span>{editingClass ? 'Chỉnh Sửa Thông Tin Lớp Học' : 'Thêm Lớp Học Mới'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={720}
        destroyOnClose
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="pt-4">
          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item
                label={<span className="font-semibold text-slate-700">Tên Lớp Học <span className="text-red-500 font-bold">*</span></span>}
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên lớp học!' }]}
              >
                <Input placeholder="Ví dụ: Lớp N5 Khóa 2601 (Tối 2-4-6)" className="rounded-xl h-10" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<span className="font-semibold text-slate-700">Mã Lớp Học <span className="text-red-500 font-bold">*</span></span>}
                name="classCode"
                rules={[{ required: true, message: 'Vui lòng nhập mã lớp!' }]}
              >
                <Input placeholder="VD: JP-N5-K45" className="rounded-xl h-10 uppercase font-mono" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span className="font-semibold text-slate-700">Chương Trình Khóa Học <span className="text-red-500 font-bold">*</span></span>}
                name="courseId"
                rules={[{ required: true, message: 'Vui lòng chọn khóa học!' }]}
              >
                <Select
                  placeholder="Chọn khóa học đào tạo"
                  className="rounded-xl h-10"
                  options={courses.map((c) => ({
                    value: c._id,
                    label: `${c.title} (${c.level})`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span className="font-semibold text-slate-700">Giáo Viên Phụ Trách <span className="text-red-500 font-bold">*</span></span>}
                name="primaryTeacherId"
                rules={[{ required: true, message: 'Vui lòng chọn giảng viên!' }]}
              >
                <Select
                  placeholder="Chọn giáo viên đứng lớp"
                  className="rounded-xl h-10"
                  options={teachers.map((t) => ({
                    value: t._id,
                    label: `${t.name} (${t.role === 'teacher' ? 'Giáo viên' : 'Quản lý'})`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span className="font-semibold text-slate-700">Cơ Sở / Chi Nhánh <span className="text-red-500 font-bold">*</span></span>}
                name="branchId"
                rules={[{ required: true, message: 'Vui lòng chọn cơ sở đào tạo!' }]}
              >
                <Select
                  placeholder="Chọn cơ sở"
                  className="rounded-xl h-10"
                  options={branches.map((b) => ({
                    value: b._id,
                    label: b.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span className="font-semibold text-slate-700">Phòng Học Mặc Định <span className="text-red-500 font-bold">*</span></span>}
                name="defaultClassroomId"
                rules={[{ required: true, message: 'Vui lòng chọn phòng học!' }]}
              >
                <Select
                  placeholder="Chọn phòng học"
                  className="rounded-xl h-10"
                  options={filteredClassroomsForForm.map((r) => ({
                    value: r._id,
                    label: `Phòng ${r.roomCode} (Sức chứa: ${r.capacity} học viên)`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={14}>
              <Form.Item
                label={<span className="font-semibold text-slate-700">Các Ngày Học Trong Tuần <span className="text-red-500 font-bold">*</span></span>}
                name="daysOfWeek"
                rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 ngày học!' }]}
              >
                <Checkbox.Group options={DAYS_OF_WEEK_OPTIONS} className="flex flex-wrap gap-2 pt-1" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={10}>
              <Form.Item
                label={<span className="font-semibold text-slate-700">Khung Ca Học Chuẩn <span className="text-red-500 font-bold">*</span></span>}
                name="shiftSlotId"
                rules={[{ required: true, message: 'Vui lòng chọn ca học!' }]}
              >
                <Select
                  placeholder="Chọn ca học"
                  className="rounded-xl h-10"
                  options={shiftSlots.map((s) => ({
                    value: s._id,
                    label: formatShiftName(s),
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<span className="font-semibold text-slate-700">Ngày Khai Giảng <span className="text-red-500 font-bold">*</span></span>}
                name="startDate"
                rules={[{ required: true, message: 'Chọn ngày khai giảng!' }]}
              >
                <DatePicker className="w-full rounded-xl h-10" format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<span className="font-semibold text-slate-700">Ngày Dự Kiến Bế Giảng</span>}
                name="endDateExpected"
              >
                <DatePicker className="w-full rounded-xl h-10" format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<span className="font-semibold text-slate-700">Sĩ Số Tối Đa <span className="text-red-500 font-bold">*</span></span>}
                name="maxStudents"
                rules={[{ required: true, message: 'Nhập sĩ số tối đa!' }]}
              >
                <InputNumber min={1} max={100} className="w-full rounded-xl h-10" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={<span className="font-semibold text-slate-700">Trạng Thái Lớp Học</span>} name="status">
                <Select
                  className="rounded-xl h-10"
                  options={[
                    { value: 'upcoming', label: 'Sắp khai giảng' },
                    { value: 'ongoing', label: 'Đang diễn ra' },
                    { value: 'completed', label: 'Đã hoàn thành' },
                    { value: 'cancelled', label: 'Đã hủy' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={<span className="font-semibold text-slate-700">Ghi Chú Bổ Sung</span>} name="notes">
                <Input placeholder="Ghi chú về tài liệu, dặn dò..." className="rounded-xl h-10" />
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
              {editingClass ? 'Lưu Thay Đổi' : 'Tạo Lớp Học'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* MODAL XEM CHI TIẾT LỚP HỌC */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-600 font-bold text-lg pb-2 border-b border-rose-100">
            <InfoCircleOutlined />
            <span>Hồ Sơ Chi Tiết Lớp Học</span>
          </div>
        }
        open={detailModalOpen}
        loading={loadingDetail}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)} className="rounded-xl h-9 px-5">
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDetailModalOpen(false);
              if (detailClass) handleOpenEdit(detailClass);
            }}
            className="rounded-xl h-9 px-5 font-bold bg-gradient-to-r from-rose-500 to-pink-500 border-none"
          >
            Chỉnh Sửa Lớp Này
          </Button>,
        ]}
        width={880}
        destroyOnClose
        centered
      >
        {detailClass && (
          <div className="py-2 space-y-5">
            {/* Class Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs font-mono font-bold text-rose-600 bg-white px-2 py-0.5 rounded border border-rose-200">
                  {detailClass.classCode}
                </span>
                <h3 className="font-black text-slate-800 text-lg mt-1 mb-0">{detailClass.name}</h3>
                <span className="text-xs text-slate-500">
                  {detailClass.courseId ? `${detailClass.courseId.title} (${detailClass.courseId.level})` : 'Chưa phân khóa'}
                </span>
              </div>
              <div className="text-right">
                <Tag color={STATUS_CONFIG[detailClass.status]?.color} className="text-xs font-bold rounded-full px-3 py-1">
                  {STATUS_CONFIG[detailClass.status]?.label}
                </Tag>
              </div>
            </div>

            {/* Descriptions */}
            <Descriptions
              bordered
              size="middle"
              column={{ xs: 1, sm: 2 }}
              labelStyle={{
                width: '180px',
                minWidth: '180px',
                fontWeight: 600,
                color: '#475569',
                whiteSpace: 'nowrap',
                backgroundColor: '#fff9fa',
              }}
              contentStyle={{
                whiteSpace: 'nowrap',
                color: '#1e293b',
              }}
            >
              <Descriptions.Item label="Giáo Viên Phụ Trách">
                <div className="flex items-center gap-2">
                  <Avatar size="small" style={{ backgroundColor: '#e11d48' }} src={detailClass.primaryTeacherId?.avatar}>
                    {detailClass.primaryTeacherId?.name?.charAt(0)}
                  </Avatar>
                  <span className="font-bold text-slate-800">{detailClass.primaryTeacherId?.name || '---'}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Sĩ Số Hiện Tại">
                <Tag color="blue" className="font-bold">
                  {detailClass.currentStudentCount || 0} / {detailClass.maxStudents || 20} học viên
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Cơ Sở Trực Thuộc">
                <div className="font-medium text-slate-800">
                  <ShopOutlined className="text-rose-500 mr-1" />
                  {detailClass.branchId?.name || '---'}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Phòng Học">
                <div className="font-mono font-bold text-slate-800">
                  Phòng {detailClass.defaultClassroomId?.roomCode || '---'} ({detailClass.defaultClassroomId?.capacity || 0} chỗ)
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày Khai Giảng">
                <CalendarOutlined className="text-emerald-500 mr-1" />
                {detailClass.startDate ? dayjs(detailClass.startDate).format('DD/MM/YYYY') : '---'}
              </Descriptions.Item>
              <Descriptions.Item label="Dự Kiến Kết Thúc">
                {detailClass.endDateExpected ? dayjs(detailClass.endDateExpected).format('DD/MM/YYYY') : '---'}
              </Descriptions.Item>

              <Descriptions.Item label="Lịch Học Trong Tuần">
                <Tag color="cyan" className="font-bold">
                  {formatDays(detailClass.daysOfWeek)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Khung Ca Học">
                <ClockCircleOutlined className="text-rose-500 mr-1" />
                {formatShiftName(detailClass.shiftSlotId)}
              </Descriptions.Item>

              <Descriptions.Item label="Giáo Trình Học" span={2}>
                <span className="font-medium text-slate-700">
                  {detailClass.courseId?.textbook || 'Minna no Nihongo I (Bài 1 - 25) + Flashcard Kanji'}
                </span>
              </Descriptions.Item>

              {detailClass.notes && (
                <Descriptions.Item label="Ghi Chú Lớp Học" span={2} contentStyle={{ whiteSpace: 'normal' }}>
                  <span className="italic text-slate-600">{detailClass.notes}</span>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Enrolled Students Table if any */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <TeamOutlined className="text-rose-600" />
                  <span>Danh Sách Học Viên Đã Ghi Danh ({detailClass.enrollments?.length || 0})</span>
                </span>
              </div>

              {detailClass.enrollments && detailClass.enrollments.length > 0 ? (
                <Table
                  size="small"
                  pagination={false}
                  rowKey="_id"
                  dataSource={detailClass.enrollments}
                  columns={[
                    {
                      title: 'STT',
                      key: 'idx',
                      width: 65,
                      align: 'right',
                      render: (_: any, __: any, index: number) => (
                        <span className="font-medium text-slate-600 block pr-2">{index + 1}</span>
                      ),
                    },
                    {
                      title: 'Mã Học Viên',
                      dataIndex: ['studentId', 'studentCode'],
                      key: 'code',
                      align: 'center',
                      render: (code: string) => <strong className="font-mono text-rose-700">{code}</strong>,
                    },
                    {
                      title: 'Họ Và Tên',
                      dataIndex: ['studentId', 'fullName'],
                      key: 'name',
                      align: 'left',
                      render: (name: string) => <span className="font-bold text-slate-800 text-left block pl-3">{name}</span>,
                    },
                    {
                      title: 'Số Điện Thoại',
                      dataIndex: ['studentId', 'phone'],
                      key: 'phone',
                      align: 'center',
                      render: (phone: string) => <span className="font-mono text-slate-700">{phone || '---'}</span>,
                    },
                    {
                      title: 'Tình Trạng Học Phí',
                      dataIndex: 'tuitionStatus',
                      key: 'tuitionStatus',
                      align: 'center',
                      render: (st: string) => (
                        <Tag color={st === 'paid' ? 'green' : st === 'partially_paid' ? 'orange' : 'red'}>
                          {st === 'paid' ? 'Đã hoàn tất' : st === 'partially_paid' ? 'Đóng 1 phần' : 'Chưa đóng'}
                        </Tag>
                      ),
                    },
                  ]}
                />
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400">
                  Chưa có học viên nào ghi danh vào lớp học này.
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
