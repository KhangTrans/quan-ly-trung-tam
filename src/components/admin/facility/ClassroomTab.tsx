import React, { useState, useEffect, useCallback } from 'react';
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
  SearchOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  TeamOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import {
  classroomService,
  type Classroom,
  type CreateClassroomInput,
} from '../../../services/classroom.service';
import type { Branch } from '../../../services/branch.service';

interface ClassroomTabProps {
  branches: Branch[];
}

const COMMON_FACILITIES = [
  'Bảng từ chống lóa',
  'Máy lạnh Daikin',
  'Loa trợ giảng',
  'Máy chiếu siêu nét',
  'Tivi 65 inch 4K',
  'Tai nghe luyện thi JLPT',
  'Hệ thống âm thanh vòm Choukai',
  'Camera giám sát',
  'Bàn ghế tiêu chuẩn Nhật',
];

export const ClassroomTab: React.FC<ClassroomTabProps> = ({ branches }) => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Load danh sách phòng học
  const fetchClassrooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await classroomService.getAllClassrooms();
      setClassrooms(res.data || []);
    } catch {
      message.error('Không thể tải danh sách phòng học từ máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  // Mở modal thêm mới
  const handleOpenCreate = () => {
    setEditingClassroom(null);
    form.resetFields();
    form.setFieldsValue({
      branchId: branches[0]?._id,
      capacity: 25,
      facilities: ['Bảng từ chống lóa', 'Máy lạnh Daikin', 'Loa trợ giảng'],
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Mở modal sửa
  const handleOpenEdit = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    const branchIdStr =
      typeof classroom.branchId === 'object' && classroom.branchId !== null
        ? classroom.branchId._id
        : String(classroom.branchId);

    form.setFieldsValue({
      branchId: branchIdStr,
      roomCode: classroom.roomCode,
      capacity: classroom.capacity,
      facilities: classroom.facilities || [],
      isActive: classroom.isActive,
    });
    setIsModalOpen(true);
  };

  // Submit Form
  const handleFormSubmit = async (values: CreateClassroomInput) => {
    setIsSubmitting(true);
    try {
      if (editingClassroom) {
        await classroomService.updateClassroom(editingClassroom._id, values);
        message.success(`Cập nhật phòng học "${values.roomCode}" thành công!`);
      } else {
        await classroomService.createClassroom(values);
        message.success(`Thêm phòng học "${values.roomCode}" thành công!`);
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchClassrooms();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin phòng học.';
      message.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xóa phòng học
  const handleDelete = async (id: string, roomCode: string) => {
    try {
      await classroomService.deleteClassroom(id);
      message.success(`Đã xóa phòng học "${roomCode}".`);
      fetchClassrooms();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa phòng học.');
    }
  };

  // Bật/tắt trạng thái
  const handleToggleStatus = async (classroom: Classroom) => {
    try {
      const newStatus = !classroom.isActive;
      await classroomService.updateClassroom(classroom._id, { isActive: newStatus });
      message.success(`Đã ${newStatus ? 'kích hoạt' : 'tạm dừng'} phòng học "${classroom.roomCode}".`);
      fetchClassrooms();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể đổi trạng thái phòng học.');
    }
  };

  // Lọc dữ liệu
  const filteredClassrooms = classrooms.filter((item) => {
    const branchObj = typeof item.branchId === 'object' ? item.branchId : null;
    const branchIdStr = branchObj ? branchObj._id : String(item.branchId);
    const branchName = branchObj ? branchObj.name : '';

    const matchBranch = selectedBranchId === 'all' || branchIdStr === selectedBranchId;

    const matchSearch =
      item.roomCode.toLowerCase().includes(searchText.toLowerCase()) ||
      branchName.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.facilities && item.facilities.some((f) => f.toLowerCase().includes(searchText.toLowerCase())));

    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? item.isActive
        : !item.isActive;

    return matchBranch && matchSearch && matchStatus;
  });

  const columns = [
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 130,
      align: 'center' as const,
      fixed: 'left' as const,
      render: (_: any, record: Classroom) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px' }}>
          <Space size={6} className="whitespace-nowrap">
            <Tooltip title="Chỉnh sửa thông tin phòng">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined className="text-rose-600" />}
                onClick={() => handleOpenEdit(record)}
                className="hover:bg-rose-50 rounded-lg w-8 h-8 flex items-center justify-center"
              />
            </Tooltip>
            <Popconfirm
              title="Xác nhận xóa phòng học?"
              description={`Bạn có chắc muốn xóa phòng "${record.roomCode}" khỏi hệ thống?`}
              onConfirm={() => handleDelete(record._id, record.roomCode)}
              okText="Xóa vĩnh viễn"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa phòng học">
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
      title: 'Mã Phòng',
      dataIndex: 'roomCode',
      key: 'roomCode',
      width: 140,
      align: 'center' as const,
      render: (code: string) => (
        <div className="flex items-center justify-center gap-2 whitespace-nowrap">
          <Tag color="magenta" className="font-mono font-bold text-xs px-2.5 py-1 rounded-md">
            {code}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Cơ Sở Trực Thuộc',
      key: 'branch',
      width: 300,
      align: 'center' as const,
      render: (_: any, record: Classroom) => {
        const branch = typeof record.branchId === 'object' ? record.branchId : null;
        return (
          <div className="text-left inline-block whitespace-nowrap">
            <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <ShopOutlined className="text-rose-600" />
              <span>{branch ? branch.name : 'Chưa phân bổ'}</span>
            </div>
            {branch?.code && (
              <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                Mã CS: {branch.code}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Sức Chứa',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 150,
      align: 'center' as const,
      render: (capacity: number) => (
        <div className="flex items-center justify-center gap-1.5 font-bold text-slate-800 text-xs whitespace-nowrap">
          <TeamOutlined className="text-pink-600" />
          <span>{capacity} học viên</span>
        </div>
      ),
    },
    {
      title: 'Trang Thiết Bị',
      dataIndex: 'facilities',
      key: 'facilities',
      width: 260,
      align: 'center' as const,
      render: (facilities: string[]) => (
        <div className="flex flex-wrap justify-center gap-1 whitespace-nowrap">
          {facilities && facilities.length > 0 ? (
            facilities.map((fac, idx) => (
              <Tag key={idx} color="pink" className="text-[11px] rounded-md m-0">
                {fac}
              </Tag>
            ))
          ) : (
            <span className="text-slate-400 text-xs italic">Cơ bản</span>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 170,
      align: 'center' as const,
      render: (isActive: boolean, record: Classroom) => (
        <div className="flex items-center justify-center gap-2 whitespace-nowrap">
          <Tag color={isActive ? 'success' : 'default'} className="font-semibold rounded-full px-2.5">
            {isActive ? 'Đang Hoạt Động' : 'Tạm Dừng'}
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
          <span className="font-bold text-slate-800 text-base block">Danh Sách Phòng Học & Sức Chứa</span>
          <span className="text-xs text-slate-500 font-normal">
            Thiết lập mã phòng, sức chứa học viên, trang thiết bị và cơ sở phục vụ xếp lịch lớp học
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
                placeholder="Tìm mã phòng, thiết bị..."
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
                    ...branches.map((b) => ({
                      value: b._id,
                      label: b.name,
                    })),
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
                    onClick={() => setStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-lg transition-all border-none cursor-pointer ${
                      statusFilter === 'active' ? 'bg-white text-emerald-600 shadow-xs' : 'bg-transparent text-slate-600'
                    }`}
                  >
                    Đang mở
                  </button>
                </div>

                <Tooltip title="Tải lại danh sách">
                  <Button
                    shape="circle"
                    icon={<ReloadOutlined spin={loading} />}
                    onClick={fetchClassrooms}
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
              Thêm Phòng Học Mới
            </Button>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={filteredClassrooms}
        rowKey="_id"
        loading={loading}
        pagination={{
          position: ['bottomCenter'],
          pageSize: 6,
          showTotal: (total) => `Tổng cộng ${total} phòng học`,
        }}
        scroll={{ x: 1100 }}
        className="overflow-x-auto"
      />

      {/* Modal Thêm Mới / Sửa Phòng Học */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-2 border-b border-rose-100">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AppstoreOutlined />
            </div>
            <span>{editingClassroom ? 'Chỉnh Sửa Thông Tin Phòng Học' : 'Thêm Phòng Học Mới'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        className="rounded-3xl"
        width={540}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          requiredMark={false}
          className="pt-4"
        >
          <Form.Item
            name="branchId"
            label={
              <span className="text-xs font-bold text-slate-700">
                Thuộc Cơ Sở / Chi Nhánh <span className="text-red-500 font-bold">*</span>
              </span>
            }
            rules={[{ required: true, message: 'Vui lòng chọn cơ sở/chi nhánh' }]}
          >
            <Select
              placeholder="Chọn cơ sở đào tạo"
              className="rounded-xl"
              options={branches.map((b) => ({
                value: b._id,
                label: `${b.name} (${b.code})`,
              }))}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="roomCode"
              label={
                <span className="text-xs font-bold text-slate-700">
                  Mã Phòng Học <span className="text-red-500 font-bold">*</span>
                </span>
              }
              rules={[{ required: true, message: 'Nhập mã phòng học' }]}
            >
              <Input
                placeholder="Ví dụ: P101, LAB-01"
                className="rounded-xl border-rose-200 font-mono uppercase"
                style={{ textTransform: 'uppercase' }}
              />
            </Form.Item>

            <Form.Item
              name="capacity"
              label={
                <span className="text-xs font-bold text-slate-700">
                  Sức Chứa Tối Đa (Học viên) <span className="text-red-500 font-bold">*</span>
                </span>
              }
              rules={[{ required: true, message: 'Nhập sức chứa phòng học' }]}
            >
              <InputNumber
                min={1}
                max={150}
                placeholder="25"
                className="w-full rounded-xl border-rose-200"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="facilities"
            label={
              <span className="text-xs font-bold text-slate-700">
                Trang Thiết Bị Phòng Học
              </span>
            }
          >
            <Select
              mode="tags"
              placeholder="Chọn hoặc gõ thêm trang thiết bị..."
              options={COMMON_FACILITIES.map((fac) => ({ value: fac, label: fac }))}
              className="rounded-xl"
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            valuePropName="checked"
            label={<span className="text-xs font-bold text-slate-700">Trạng Thái Hoạt Động</span>}
          >
            <div className="flex items-center gap-3">
              <Switch defaultChecked className="bg-rose-500" />
              <span className="text-xs text-slate-600">Phòng học sẵn sàng mở lớp giảng dạy</span>
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
              {editingClassroom ? 'Lưu Thay Đổi' : 'Thêm Phòng Học'}
            </Button>
          </div>
        </Form>
      </Modal>
    </Card>
  );
};
