import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Card,
  Row,
  Col,
  Popconfirm,
  message,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import {
  shiftSlotService,
  type ShiftSlot,
  type CreateShiftSlotInput,
  type ShiftPeriod,
} from '../../../services/shiftSlot.service';

export const ShiftSlotTab: React.FC = () => {
  const [shiftSlots, setShiftSlots] = useState<ShiftSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Load danh sách ca học
  const fetchShiftSlots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await shiftSlotService.getAllShiftSlots();
      setShiftSlots(res.data || []);
    } catch {
      message.error('Không thể tải danh sách ca học chuẩn từ máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShiftSlots();
  }, [fetchShiftSlots]);

  // Tính số phút giữa 2 mốc giờ
  const calculateDuration = (startTime: string, endTime: string): string => {
    try {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      const totalMinutes = endH * 60 + endM - (startH * 60 + startM);
      if (totalMinutes > 0) {
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        if (hours > 0 && mins > 0) return `${hours}h ${mins}p (${totalMinutes} phút)`;
        if (hours > 0) return `${hours} giờ (${totalMinutes} phút)`;
        return `${totalMinutes} phút`;
      }
      return '--';
    } catch {
      return '--';
    }
  };

  // Mở modal thêm mới
  const handleOpenCreate = () => {
    setEditingShift(null);
    form.resetFields();
    form.setFieldsValue({
      period: 'morning',
      startTime: '08:00',
      endTime: '09:30',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Mở modal sửa
  const handleOpenEdit = (shift: ShiftSlot) => {
    setEditingShift(shift);
    form.setFieldsValue({
      name: shift.name,
      period: shift.period,
      startTime: shift.startTime,
      endTime: shift.endTime,
      isActive: shift.isActive,
    });
    setIsModalOpen(true);
  };

  // Submit Form
  const handleFormSubmit = async (values: CreateShiftSlotInput) => {
    setIsSubmitting(true);
    try {
      if (editingShift) {
        await shiftSlotService.updateShiftSlot(editingShift._id, values);
        message.success(`Cập nhật ca học "${values.name}" thành công!`);
      } else {
        await shiftSlotService.createShiftSlot(values);
        message.success(`Thêm ca học "${values.name}" thành công!`);
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchShiftSlots();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin ca học.';
      message.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xóa ca học
  const handleDelete = async (id: string, name: string) => {
    try {
      await shiftSlotService.deleteShiftSlot(id);
      message.success(`Đã xóa ca học "${name}".`);
      fetchShiftSlots();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa ca học.');
    }
  };

  // Bật/tắt trạng thái
  const handleToggleStatus = async (shift: ShiftSlot) => {
    try {
      const newStatus = !shift.isActive;
      await shiftSlotService.updateShiftSlot(shift._id, { isActive: newStatus });
      message.success(`Đã ${newStatus ? 'kích hoạt' : 'tạm dừng'} ca học "${shift.name}".`);
      fetchShiftSlots();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể đổi trạng thái ca học.');
    }
  };

  // Lọc ca học
  const filteredShifts = shiftSlots.filter((item) => {
    const matchPeriod = periodFilter === 'all' || item.period === periodFilter;
    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? item.isActive
        : !item.isActive;

    return matchPeriod && matchStatus;
  });

  const getPeriodBadge = (period: ShiftPeriod) => {
    switch (period) {
      case 'morning':
        return (
          <Tag color="gold" className="font-bold px-2.5 py-0.5 rounded-full text-xs">
            ☀️ Ca Sáng
          </Tag>
        );
      case 'afternoon':
        return (
          <Tag color="blue" className="font-bold px-2.5 py-0.5 rounded-full text-xs">
            ⛅ Ca Chiều
          </Tag>
        );
      case 'evening':
        return (
          <Tag color="purple" className="font-bold px-2.5 py-0.5 rounded-full text-xs">
            🌙 Ca Tối
          </Tag>
        );
      default:
        return <Tag>{period}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 130,
      align: 'center' as const,
      fixed: 'left' as const,
      render: (_: any, record: ShiftSlot) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px' }}>
          <Space size={6} className="whitespace-nowrap">
            <Tooltip title="Chỉnh sửa ca học">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined className="text-rose-600" />}
                onClick={() => handleOpenEdit(record)}
                className="hover:bg-rose-50 rounded-lg w-8 h-8 flex items-center justify-center"
              />
            </Tooltip>
            <Popconfirm
              title="Xác nhận xóa ca học chuẩn?"
              description={`Bạn có chắc muốn xóa "${record.name}" khỏi hệ thống?`}
              onConfirm={() => handleDelete(record._id, record.name)}
              okText="Xóa vĩnh viễn"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa ca học">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  className="hover:bg-red-50 rounded-lg w-8 h-8 flex items-center justify-center"
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        </div>
      ),
    },
    {
      title: 'Tên Ca Học Chuẩn',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      align: 'center' as const,
      render: (name: string) => (
        <div className="font-bold text-slate-800 text-sm flex items-center justify-center gap-1.5 whitespace-nowrap">
          <ClockCircleOutlined className="text-rose-500" />
          <span>{name}</span>
        </div>
      ),
    },
    {
      title: 'Buổi Học',
      dataIndex: 'period',
      key: 'period',
      width: 160,
      align: 'center' as const,
      render: (period: ShiftPeriod) => (
        <div className="flex justify-center whitespace-nowrap">
          {getPeriodBadge(period)}
        </div>
      ),
    },
    {
      title: 'Khung Giờ Học',
      key: 'timeRange',
      width: 190,
      align: 'center' as const,
      render: (_: any, record: ShiftSlot) => (
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
          <Tag color="magenta" className="font-mono font-bold text-xs px-2.5 py-1 rounded-md">
            {record.startTime} - {record.endTime}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Thời Lượng Chuẩn',
      key: 'duration',
      width: 170,
      align: 'center' as const,
      render: (_: any, record: ShiftSlot) => (
        <div className="text-center font-semibold text-slate-600 text-xs whitespace-nowrap">
          {calculateDuration(record.startTime, record.endTime)}
        </div>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 170,
      align: 'center' as const,
      render: (isActive: boolean, record: ShiftSlot) => (
        <div className="flex items-center justify-center gap-2 whitespace-nowrap">
          <Tag color={isActive ? 'success' : 'default'} className="font-semibold rounded-full px-2.5">
            {isActive ? 'Đang Áp Dụng' : 'Tạm Dừng'}
          </Tag>
          <Switch
            size="small"
            checked={isActive}
            onChange={() => handleToggleStatus(record)}
            className={isActive ? 'bg-rose-500' : ''}
          />
        </div>
      ),
    },
  ];

  return (
    <Card
      className="rounded-3xl border-rose-100 shadow-sm bg-white overflow-hidden"
      title={
        <div className="py-1">
          <span className="font-bold text-slate-800 text-base block">Danh Sách Ca Học Chuẩn</span>
          <span className="text-xs text-slate-500 font-normal">
            Quy định các khung ca học chuẩn (Sáng, Chiều, Tối) phục vụ việc xếp lịch và chấm công giảng dạy
          </span>
        </div>
      }
    >
      {/* TOOLBAR ROW: Cột trái 6/12 (Lọc buổi học ở trên, tất cả bộ lọc ở dưới) & Cột phải 6/12 (Nút thêm mới nằm riêng - Căn sát mép phải) */}
      <div className="mb-4 pb-4 border-b border-rose-100/60 w-full">
        <Row gutter={[20, 16]} align="middle" className="w-full" style={{ width: '100%', margin: 0 }}>
          {/* Cột 6/12 bên trái: Chọn lọc theo buổi học ở trên, bộ lọc trạng thái nằm bên dưới */}
          <Col xs={24} md={12} style={{ paddingLeft: 0 }}>
            <div className="space-y-3">
              <Select
                value={periodFilter}
                onChange={setPeriodFilter}
                className="w-full rounded-xl shadow-2xs h-10"
                options={[
                  { value: 'all', label: 'Tất cả buổi học' },
                  { value: 'morning', label: '☀️ Buổi Sáng (Morning)' },
                  { value: 'afternoon', label: '⛅ Buổi Chiều (Afternoon)' },
                  { value: 'evening', label: '🌙 Buổi Tối (Evening)' },
                ]}
              />

              {/* Tất cả bộ lọc nằm bên dưới */}
              <div className="flex flex-wrap items-center gap-2.5">
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
                    onClick={() => setStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-lg transition-all border-none cursor-pointer ${
                      statusFilter === 'active' ? 'bg-white text-emerald-600 shadow-xs' : 'bg-transparent text-slate-600'
                    }`}
                  >
                    Đang áp dụng
                  </button>
                </div>

                <Tooltip title="Tải lại danh sách">
                  <Button
                    shape="circle"
                    icon={<ReloadOutlined spin={loading} />}
                    onClick={fetchShiftSlots}
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
              Thêm Ca Học Chuẩn
            </Button>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={filteredShifts}
        rowKey="_id"
        loading={loading}
        pagination={{
          position: ['bottomCenter'],
          pageSize: 6,
          showTotal: (total) => `Tổng cộng ${total} ca học`,
        }}
        scroll={{ x: 1080 }}
        className="overflow-x-auto"
      />

      {/* Modal Thêm Mới / Sửa Ca Học */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-2 border-b border-rose-100">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <FieldTimeOutlined />
            </div>
            <span>{editingShift ? 'Chỉnh Sửa Ca Học Chuẩn' : 'Thêm Ca Học Chuẩn Mới'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        className="rounded-3xl"
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          requiredMark={false}
          className="pt-4"
        >
          <Form.Item
            name="name"
            label={
              <span className="text-xs font-bold text-slate-700">
                Tên Ca Học Chuẩn <span className="text-red-500 font-bold">*</span>
              </span>
            }
            rules={[{ required: true, message: 'Vui lòng nhập tên ca học' }]}
          >
            <Input placeholder="Ví dụ: Ca Sáng (08:00 - 09:30)" className="rounded-xl border-rose-200" />
          </Form.Item>

          <Form.Item
            name="period"
            label={
              <span className="text-xs font-bold text-slate-700">
                Buổi Trong Ngày <span className="text-red-500 font-bold">*</span>
              </span>
            }
            rules={[{ required: true, message: 'Vui lòng chọn buổi học' }]}
          >
            <Select
              className="rounded-xl"
              options={[
                { value: 'morning', label: 'Buổi Sáng' },
                { value: 'afternoon', label: 'Buổi Chiều' },
                { value: 'evening', label: 'Buổi Tối' },
              ]}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="startTime"
              label={
                <span className="text-xs font-bold text-slate-700">
                  Giờ Bắt Đầu (HH:mm) <span className="text-red-500 font-bold">*</span>
                </span>
              }
              rules={[
                { required: true, message: 'Nhập giờ bắt đầu' },
                { pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, message: 'Định dạng HH:mm (VD: 08:00)' },
              ]}
            >
              <Input
                prefix={<ClockCircleOutlined className="text-slate-400" />}
                placeholder="08:00"
                className="rounded-xl border-rose-200 font-mono"
              />
            </Form.Item>

            <Form.Item
              name="endTime"
              label={
                <span className="text-xs font-bold text-slate-700">
                  Giờ Kết Thúc (HH:mm) <span className="text-red-500 font-bold">*</span>
                </span>
              }
              rules={[
                { required: true, message: 'Nhập giờ kết thúc' },
                { pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, message: 'Định dạng HH:mm (VD: 09:30)' },
              ]}
            >
              <Input
                prefix={<ClockCircleOutlined className="text-slate-400" />}
                placeholder="09:30"
                className="rounded-xl border-rose-200 font-mono"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="isActive"
            valuePropName="checked"
            label={<span className="text-xs font-bold text-slate-700">Trạng Thái Áp Dụng</span>}
          >
            <div className="flex items-center gap-3">
              <Switch defaultChecked className="bg-rose-500" />
              <span className="text-xs text-slate-600">Đang áp dụng xếp lịch cho các khóa học</span>
            </div>
          </Form.Item>

          <div className="flex justify-end gap-2 pt-4 border-t border-rose-100">
            <Button onClick={() => setIsModalOpen(false)} className="rounded-xl">
              Hủy Bỏ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              className="rounded-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 border-none px-6"
            >
              {editingShift ? 'Lưu Thay Đổi' : 'Thêm Ca Học'}
            </Button>
          </div>
        </Form>
      </Modal>
    </Card>
  );
};
