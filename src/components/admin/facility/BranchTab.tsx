import React, { useState } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  Card,
  Row,
  Col,
  Popconfirm,
  message,
  Tooltip,
  Descriptions,
} from 'antd';
import {
  EnvironmentOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  SearchOutlined,
  ReloadOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { branchService, type Branch, type CreateBranchInput } from '../../../services/branch.service';

interface BranchTabProps {
  branches: Branch[];
  loading: boolean;
  onRefresh: () => void;
}

export const BranchTab: React.FC<BranchTabProps> = ({ branches, loading, onRefresh }) => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Detail Modal State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailBranch, setDetailBranch] = useState<Branch | null>(null);

  const handleOpenDetail = (branch: Branch) => {
    setDetailBranch(branch);
    setIsDetailOpen(true);
  };

  // Mở modal thêm mới
  const handleOpenCreate = () => {
    setEditingBranch(null);
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Mở modal sửa
  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    form.setFieldsValue({
      name: branch.name,
      code: branch.code,
      address: branch.address,
      phone: branch.phone,
      email: branch.email || '',
      isActive: branch.isActive,
    });
    setIsModalOpen(true);
  };

  // Lưu chi nhánh
  const handleFormSubmit = async (values: CreateBranchInput) => {
    setIsSubmitting(true);
    try {
      if (editingBranch) {
        await branchService.updateBranch(editingBranch._id, values);
        message.success(`Cập nhật chi nhánh "${values.name}" thành công!`);
      } else {
        await branchService.createBranch(values);
        message.success(`Thêm cơ sở "${values.name}" thành công!`);
      }
      setIsModalOpen(false);
      form.resetFields();
      onRefresh();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin chi nhánh.';
      message.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xóa chi nhánh
  const handleDelete = async (id: string, name: string) => {
    try {
      await branchService.deleteBranch(id);
      message.success(`Đã xóa cơ sở "${name}".`);
      onRefresh();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa chi nhánh.');
    }
  };

  // Bật/tắt trạng thái nhanh
  const handleToggleStatus = async (branch: Branch) => {
    try {
      const newStatus = !branch.isActive;
      await branchService.updateBranch(branch._id, { isActive: newStatus });
      message.success(`Đã ${newStatus ? 'kích hoạt' : 'tạm dừng'} cơ sở "${branch.name}".`);
      onRefresh();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể đổi trạng thái chi nhánh.');
    }
  };

  // Lọc dữ liệu
  const filteredBranches = branches.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.code.toLowerCase().includes(searchText.toLowerCase()) ||
      item.address.toLowerCase().includes(searchText.toLowerCase());

    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? item.isActive
        : !item.isActive;

    return matchSearch && matchStatus;
  });

  const columns = [
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 130,
      align: 'center' as const,
      fixed: 'left' as const,
      render: (_: any, record: Branch) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
          <Space size={4} className="whitespace-nowrap">
            <Tooltip title="Xem chi tiết cơ sở">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined className="text-blue-600" />}
                onClick={() => handleOpenDetail(record)}
                className="hover:bg-blue-50 rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer"
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa thông tin">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined className="text-rose-600" />}
                onClick={() => handleOpenEdit(record)}
                className="hover:bg-rose-50 rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer"
              />
            </Tooltip>
            <Popconfirm
              title="Xác nhận xóa cơ sở?"
              description={`Bạn có chắc chắn muốn xóa cơ sở "${record.name}" khỏi hệ thống?`}
              onConfirm={() => handleDelete(record._id, record.name)}
              okText="Xóa vĩnh viễn"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa cơ sở">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  className="hover:bg-red-50 rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer"
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        </div>
      ),
    },
    {
      title: 'Mã Cơ Sở',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      align: 'center' as const,
      render: (code: string) => (
        <Tag color="magenta" className="font-mono font-bold text-xs px-2.5 py-1 rounded-md whitespace-nowrap">
          {code}
        </Tag>
      ),
    },
    {
      title: 'Tên Cơ Sở & Điểm Đào Tạo',
      dataIndex: 'name',
      key: 'name',
      width: 320,
      render: (name: string) => (
        <div className="text-left font-bold text-slate-800 text-sm flex items-center gap-2">
          <ShopOutlined className="text-rose-600 shrink-0" />
          <span className="truncate">{name}</span>
        </div>
      ),
    },
    {
      title: 'Thông Tin Liên Hệ',
      key: 'contact',
      width: 280,
      align: 'left' as const,
      render: (_: any, record: Branch) => (
        <div className="flex flex-col items-start gap-1 text-xs text-left">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <PhoneOutlined className="text-emerald-500 shrink-0" />
            <span className="font-mono">{record.phone}</span>
          </div>
          {record.email ? (
            <div className="flex items-center gap-2 text-slate-500">
              <MailOutlined className="text-rose-400 shrink-0" />
              <span className="truncate max-w-[230px]" title={record.email}>
                {record.email}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 italic text-[11px]">
              <MailOutlined className="text-slate-300 shrink-0" />
              <span>Chưa cập nhật email</span>
            </div>
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
      render: (isActive: boolean, record: Branch) => (
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
          <span className="font-bold text-slate-800 text-base block">Danh Sách Cơ Sở & Chi Nhánh</span>
          <span className="text-xs text-slate-500 font-normal">Quản lý các điểm cơ sở đào tạo, tư vấn tuyển sinh tại trung tâm</span>
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
                placeholder="Tìm theo tên, mã, địa chỉ..."
                prefix={<SearchOutlined className="text-slate-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                className="w-full rounded-xl border-rose-200 shadow-2xs h-10"
              />

              {/* Tất cả bộ lọc nằm bên dưới ô tìm kiếm */}
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
                    Đang mở
                  </button>
                </div>

                <Tooltip title="Tải lại danh sách">
                  <Button
                    shape="circle"
                    icon={<ReloadOutlined spin={loading} />}
                    onClick={onRefresh}
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
              Thêm Cơ Sở Mới
            </Button>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={filteredBranches}
        rowKey="_id"
        loading={loading}
        pagination={{
          position: ['bottomCenter'],
          pageSize: 6,
          showTotal: (total) => `Tổng cộng ${total} cơ sở`,
        }}
        scroll={{ x: 1050 }}
        className="overflow-x-auto"
      />

      {/* Modal Thêm Mới / Chỉnh Sửa Cơ Sở */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-2 border-b border-rose-100">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ShopOutlined />
            </div>
            <span>{editingBranch ? 'Chỉnh Sửa Thông Tin Cơ Sở' : 'Thêm Cơ Sở / Chi Nhánh Mới'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        className="rounded-3xl"
        width={560}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          requiredMark={false}
          className="pt-4"
        >
          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item
                name="name"
                label={
                  <span className="text-xs font-bold text-slate-700">
                    Tên Cơ Sở / Chi Nhánh <span className="text-red-500 font-bold">*</span>
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng nhập tên cơ sở' }]}
              >
                <Input placeholder="Ví dụ: Cơ sở Nguyễn Văn Cừ - Ninh Kiều" className="rounded-xl border-rose-200" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                name="code"
                label={
                  <span className="text-xs font-bold text-slate-700">
                    Mã Cơ Sở <span className="text-red-500 font-bold">*</span>
                  </span>
                }
                rules={[{ required: true, message: 'Nhập mã cơ sở' }]}
              >
                <Input
                  placeholder="CT-NVC"
                  className="rounded-xl border-rose-200 font-mono uppercase"
                  style={{ textTransform: 'uppercase' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label={
              <span className="text-xs font-bold text-slate-700">
                Địa Chỉ Chi Tiết <span className="text-red-500 font-bold">*</span>
              </span>
            }
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cơ sở' }]}
          >
            <Input
              prefix={<EnvironmentOutlined className="text-slate-400" />}
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
              className="rounded-xl border-rose-200"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label={
                  <span className="text-xs font-bold text-slate-700">
                    Số Điện Thoại Hotline <span className="text-red-500 font-bold">*</span>
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input
                  prefix={<PhoneOutlined className="text-slate-400" />}
                  placeholder="0292.3838.888"
                  className="rounded-xl border-rose-200"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label={<span className="text-xs font-bold text-slate-700">Email Liên Hệ</span>}
                rules={[{ type: 'email', message: 'Email không đúng định dạng' }]}
              >
                <Input
                  prefix={<MailOutlined className="text-slate-400" />}
                  placeholder="coso@minhtucenter.com"
                  className="rounded-xl border-rose-200"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="isActive"
            valuePropName="checked"
            label={<span className="text-xs font-bold text-slate-700">Trạng Thái Hoạt Động</span>}
          >
            <div className="flex items-center gap-3">
              <Switch defaultChecked className="bg-rose-500" />
              <span className="text-xs text-slate-600">Đang mở cửa tiếp nhận học viên và tổ chức lớp học</span>
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
              {editingBranch ? 'Lưu Thay Đổi' : 'Thêm Cơ Sở'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Xem Chi Tiết Cơ Sở */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-2 border-b border-rose-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShopOutlined />
            </div>
            <span>Thông Tin Chi Tiết Cơ Sở</span>
            {detailBranch && (
              <Tag color="magenta" className="font-mono font-bold text-xs ml-auto">
                {detailBranch.code}
              </Tag>
            )}
          </div>
        }
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailOpen(false)} className="rounded-xl">
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setIsDetailOpen(false);
              if (detailBranch) handleOpenEdit(detailBranch);
            }}
            className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700"
          >
            Chỉnh Sửa
          </Button>,
        ]}
        width={600}
        destroyOnClose
        className="rounded-3xl"
      >
        {detailBranch && (
          <div className="py-3 space-y-4">
            <Descriptions bordered column={1} size="small" className="rounded-xl overflow-hidden">
              <Descriptions.Item label={<span className="font-bold text-xs text-slate-600">Tên cơ sở</span>}>
                <span className="font-bold text-slate-800 text-sm">{detailBranch.name}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="font-bold text-xs text-slate-600">Mã cơ sở</span>}>
                <Tag color="magenta" className="font-mono font-bold text-xs">
                  {detailBranch.code}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="font-bold text-xs text-slate-600">Địa chỉ chi tiết</span>}>
                <div className="flex items-start gap-1.5 text-slate-700">
                  <EnvironmentOutlined className="text-rose-500 mt-0.5 shrink-0" />
                  <span>{detailBranch.address}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="font-bold text-xs text-slate-600">Số điện thoại hotline</span>}>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <PhoneOutlined className="text-emerald-500" />
                  <span className="font-mono font-semibold">{detailBranch.phone}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="font-bold text-xs text-slate-600">Email liên hệ</span>}>
                {detailBranch.email ? (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MailOutlined className="text-rose-400" />
                    <span>{detailBranch.email}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-xs">Chưa cập nhật email</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label={<span className="font-bold text-xs text-slate-600">Trạng thái hoạt động</span>}>
                <Tag color={detailBranch.isActive ? 'success' : 'default'} className="font-semibold rounded-full px-2.5">
                  {detailBranch.isActive ? 'Đang Hoạt Động' : 'Tạm Dừng'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </Card>
  );
};
