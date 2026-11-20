import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Tag,
  Modal,
  Form,
  Popconfirm,
  message,
  Typography,
  Space,
  Row,
  Col,
  Alert,
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { studentService, type Student } from '../../services/student.service';

const { Title, Paragraph } = Typography;

export const StudentManagementView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentService.getAllStudents({
        page,
        limit: pageSize,
        search: search || undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      });
      if (res.data) {
        setStudents(res.data.students);
        setTotal(res.data.pagination.total);
      }
    } catch {
      message.error('Lỗi khi tải danh sách học viên');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, selectedStatus]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleOpenCreate = () => {
    setEditingStudent(null);
    form.resetFields();
    form.setFieldsValue({
      gender: 'male',
      status: 'active',
      inputLevel: 'Chưa biết gì',
      learningObjective: 'Giao tiếp & Luyện thi JLPT',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    form.setFieldsValue({
      fullName: student.fullName,
      phone: student.phone,
      email: student.email,
      gender: student.gender,
      address: student.address,
      inputLevel: student.inputLevel,
      learningObjective: student.learningObjective,
      status: student.status,
      notes: student.notes,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingStudent) {
        await studentService.updateStudent(editingStudent._id, values);
        message.success('Cập nhật học viên thành công! Thao tác đã được tự động lưu vào Lịch sử thao tác.');
      } else {
        await studentService.createStudent(values);
        message.success('Thêm mới học viên thành công! Thao tác đã được tự động lưu vào Lịch sử thao tác.');
      }

      setIsModalOpen(false);
      fetchStudents();
    } catch {
      // Form validation error or API error
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await studentService.deleteStudent(id);
      message.success(`Đã xóa học viên ${name}. Hành động đã được ghi nhận vào Lịch sử thao tác!`);
      fetchStudents();
    } catch {
      message.error('Không thể xóa học viên');
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <Tag color="green">Đang theo học</Tag>;
      case 'graduated':
        return <Tag color="blue">Đã tốt nghiệp</Tag>;
      case 'paused':
        return <Tag color="orange">Bảo lưu</Tag>;
      case 'dropped':
        return <Tag color="red">Thôi học</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã Học Viên',
      dataIndex: 'studentCode',
      key: 'studentCode',
      width: 140,
      render: (code: string) => <strong className="text-rose-600 font-mono">{code}</strong>,
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name: string, record: Student) => (
        <div>
          <div className="font-bold text-slate-800 text-sm">{name}</div>
          <div className="text-[11px] text-slate-400">
            {record.gender === 'female' ? 'Nữ' : record.gender === 'male' ? 'Nam' : 'Khác'} • {record.address || 'Chưa cập nhật địa chỉ'}
          </div>
        </div>
      ),
    },
    {
      title: 'Liên Hệ',
      key: 'contact',
      render: (_: any, record: Student) => (
        <div>
          <div className="text-xs font-semibold text-slate-700">{record.phone}</div>
          <div className="text-[11px] text-slate-400">{record.email || 'Chưa có email'}</div>
        </div>
      ),
    },
    {
      title: 'Trình Độ & Mục Tiêu',
      key: 'learning',
      render: (_: any, record: Student) => (
        <div>
          <div className="text-xs font-medium text-slate-700">{record.inputLevel || 'Mới bắt đầu'}</div>
          <div className="text-[11px] text-slate-400">{record.learningObjective || 'JLPT'}</div>
        </div>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 150,
      align: 'center' as const,
      render: (_: any, record: Student) => (
        <Space size="small">
          <Button
            size="small"
            type="primary"
            ghost
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
            className="border-rose-300 text-rose-600"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa học viên này?"
            description={`Hành động xóa học viên ${record.fullName} sẽ được lưu vết vào Lịch sử thao tác.`}
            onConfirm={() => handleDelete(record._id, record.fullName)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Alert
        showIcon
        icon={<SafetyCertificateOutlined className="text-rose-600 text-lg" />}
        message="Lưu Vết Thao Tác Tự Động"
        description="Mọi thao tác Thêm mới, Chỉnh sửa thông tin học viên (SĐT, Họ tên, Trạng thái) hoặc Xóa hồ sơ học viên tại giao diện này đều được tự động lưu vết chính xác kèm danh tính người thực hiện vào Lịch sử thao tác (Chỉ xem, không thể xóa hoặc sửa)."
        className="rounded-2xl border-rose-200 bg-rose-50/60"
      />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
            Quản Lý Hồ Sơ Học Viên
          </Title>
          <Paragraph type="secondary" style={{ margin: 0, fontSize: 13 }}>
            Danh sách học viên đang theo học tại các cơ sở Minh Tú Nihongo
          </Paragraph>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchStudents} loading={loading} className="rounded-xl">
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 font-bold"
          >
            Thêm Học Viên Mới
          </Button>
        </Space>
      </div>

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl border-rose-100 shadow-xs">
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={12}>
            <Input
              placeholder="Tìm kiếm theo tên học viên, mã học viên, số điện thoại..."
              prefix={<SearchOutlined className="text-slate-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={() => {
                setPage(1);
                fetchStudents();
              }}
              allowClear
              className="rounded-xl h-10"
            />
          </Col>
          <Col xs={12} md={6}>
            <Select
              value={selectedStatus}
              onChange={(val) => {
                setSelectedStatus(val);
                setPage(1);
              }}
              style={{ width: '100%', height: 40 }}
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'active', label: 'Đang theo học' },
                { value: 'graduated', label: 'Đã tốt nghiệp' },
                { value: 'paused', label: 'Bảo lưu' },
                { value: 'dropped', label: 'Thôi học' },
              ]}
              className="rounded-xl"
            />
          </Col>
          <Col xs={12} md={6}>
            <Button
              type="primary"
              onClick={() => {
                setPage(1);
                fetchStudents();
              }}
              className="w-full h-10 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold"
            >
              Tìm Kiếm
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card className="rounded-3xl border-rose-100 shadow-sm overflow-hidden">
        <Table
          dataSource={students}
          columns={columns}
          rowKey="_id"
          loading={loading}
          size="middle"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
            showTotal: (totalCount) => `Tổng số ${totalCount} học viên`,
          }}
        />
      </Card>

      {/* Add / Edit Student Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-bold text-base text-slate-800">
            <UserOutlined className="text-rose-600" />
            <span>{editingStudent ? 'Chỉnh Sửa Hồ Sơ Học Viên' : 'Thêm Mới Học Viên'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText={editingStudent ? 'Lưu Thay Đổi' : 'Thêm Mới'}
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-rose-600 hover:bg-rose-700 font-bold' }}
        width={650}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="pt-2">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="fullName"
                label={<span className="font-bold text-xs">Họ và tên học viên</span>}
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
              >
                <Input placeholder="Ví dụ: Nguyễn Văn Hoàng" className="rounded-xl h-10" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="gender" label={<span className="font-bold text-xs">Giới tính</span>}>
                <Select
                  options={[
                    { value: 'male', label: 'Nam' },
                    { value: 'female', label: 'Nữ' },
                    { value: 'other', label: 'Khác' },
                  ]}
                  className="rounded-xl h-10"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label={<span className="font-bold text-xs">Số điện thoại liên hệ</span>}
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input placeholder="Ví dụ: 0939111222" className="rounded-xl h-10" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label={<span className="font-bold text-xs">Địa chỉ Email</span>}>
                <Input placeholder="hocvien@gmail.com" className="rounded-xl h-10" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label={<span className="font-bold text-xs">Địa chỉ cư trú</span>}>
            <Input placeholder="Ví dụ: Số 123 Đường 30/4, Ninh Kiều, Cần Thơ" className="rounded-xl h-10" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="inputLevel" label={<span className="font-bold text-xs">Trình độ đầu vào</span>}>
                <Select
                  options={[
                    { value: 'Chưa biết gì', label: 'Chưa biết gì (Từ bảng chữ cái)' },
                    { value: 'Đã thuộc bảng chữ cái', label: 'Đã thuộc bảng chữ cái' },
                    { value: 'N5 (Sơ cấp 1)', label: 'N5 (Sơ cấp 1)' },
                    { value: 'N4 (Sơ cấp 2)', label: 'N4 (Sơ cấp 2)' },
                    { value: 'N3 (Trung cấp)', label: 'N3 (Trung cấp)' },
                  ]}
                  className="rounded-xl h-10"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label={<span className="font-bold text-xs">Trạng thái học tập</span>}>
                <Select
                  options={[
                    { value: 'active', label: 'Đang theo học' },
                    { value: 'graduated', label: 'Đã tốt nghiệp' },
                    { value: 'paused', label: 'Bảo lưu' },
                    { value: 'dropped', label: 'Thôi học' },
                  ]}
                  className="rounded-xl h-10"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label={<span className="font-bold text-xs">Ghi chú</span>}>
            <Input.TextArea rows={2} placeholder="Ghi chú thêm về học viên..." className="rounded-xl" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
