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
  InputNumber,
} from 'antd';
import {
  DollarOutlined,
  SearchOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { invoiceService, type Invoice } from '../../services/invoice.service';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

export const InvoiceManagementView: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Payment Update Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [payForm] = Form.useForm();

  // Cancel Modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelForm] = Form.useForm();

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await invoiceService.getAllInvoices({
        page,
        limit: pageSize,
        search: search || undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      });
      if (res.data) {
        setInvoices(res.data.invoices);
        setTotal(res.data.pagination.total);
      }
    } catch {
      message.error('Lỗi khi tải danh sách phiếu thu');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, selectedStatus]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleOpenPay = (inv: Invoice) => {
    setSelectedInvoice(inv);
    payForm.setFieldsValue({
      paidAmount: inv.paidAmount,
      notes: inv.notes,
    });
    setIsPayModalOpen(true);
  };

  const handleOpenCancel = (inv: Invoice) => {
    setSelectedInvoice(inv);
    cancelForm.resetFields();
    setIsCancelModalOpen(true);
  };

  const handlePaySubmit = async () => {
    if (!selectedInvoice) return;
    try {
      const values = await payForm.validateFields();
      setSubmitting(true);
      await invoiceService.updateInvoice(selectedInvoice._id, values);
      message.success('Cập nhật phiếu thu thành công! Thao tác đã được lưu vào Lịch sử thao tác.');
      setIsPayModalOpen(false);
      fetchInvoices();
    } catch {
      // Handled
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSubmit = async () => {
    if (!selectedInvoice) return;
    try {
      const values = await cancelForm.validateFields();
      setSubmitting(true);
      await invoiceService.cancelInvoice(selectedInvoice._id, values.reason);
      message.success('Hủy phiếu thu thành công! Hành động CANCEL đã được ghi vào Lịch sử thao tác.');
      setIsCancelModalOpen(false);
      fetchInvoices();
    } catch {
      // Handled
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    try {
      await invoiceService.deleteInvoice(id);
      message.success(`Đã xóa phiếu thu ${code}. Hành động đã được ghi vào Lịch sử thao tác.`);
      fetchInvoices();
    } catch {
      message.error('Không thể xóa phiếu thu');
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'paid':
        return <Tag color="green" icon={<CheckCircleOutlined />}>Đã đóng đủ</Tag>;
      case 'partially_paid':
        return <Tag color="blue">Đóng một phần</Tag>;
      case 'unpaid':
        return <Tag color="orange">Chưa thanh toán</Tag>;
      case 'overdue':
        return <Tag color="red">Quá hạn</Tag>;
      case 'cancelled':
        return <Tag color="default">Đã hủy</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã Phiếu Thu',
      dataIndex: 'invoiceCode',
      key: 'invoiceCode',
      width: 140,
      render: (code: string) => <strong className="text-cyan-700 font-mono">{code}</strong>,
    },
    {
      title: 'Học Viên',
      key: 'student',
      render: (_: any, record: Invoice) => {
        const s = typeof record.studentId === 'object' ? record.studentId : null;
        return (
          <div>
            <div className="font-bold text-slate-800 text-xs">{s?.fullName || 'Học viên'}</div>
            <div className="text-[11px] text-slate-400 font-mono">{s?.studentCode} • {s?.phone}</div>
          </div>
        );
      },
    },
    {
      title: 'Nội Dung Thu',
      dataIndex: 'title',
      key: 'title',
      render: (t: string) => <span className="text-xs text-slate-700 font-medium">{t}</span>,
    },
    {
      title: 'Học Phí',
      key: 'amount',
      render: (_: any, record: Invoice) => (
        <div className="text-xs">
          <div>Tổng: <strong className="text-slate-800">{record.finalAmount?.toLocaleString('vi-VN')} đ</strong></div>
          <div className="text-emerald-600 font-semibold">Đã đóng: {record.paidAmount?.toLocaleString('vi-VN')} đ</div>
          {record.debtAmount > 0 && (
            <div className="text-rose-600 font-semibold">Còn nợ: {record.debtAmount?.toLocaleString('vi-VN')} đ</div>
          )}
        </div>
      ),
    },
    {
      title: 'Hạn Đóng',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (d: string) => <span className="text-xs text-slate-500">{dayjs(d).format('DD/MM/YYYY')}</span>,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (st: string) => getStatusTag(st),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 180,
      align: 'center' as const,
      render: (_: any, record: Invoice) => (
        <Space size="small">
          {record.status !== 'cancelled' && (
            <>
              <Button
                size="small"
                type="primary"
                ghost
                icon={<CreditCardOutlined />}
                onClick={() => handleOpenPay(record)}
                className="border-cyan-400 text-cyan-700"
              >
                Cập nhật
              </Button>
              <Button
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleOpenCancel(record)}
                className="border-amber-300 text-amber-700"
              >
                Hủy
              </Button>
            </>
          )}
          <Popconfirm
            title="Xóa phiếu thu này?"
            description={`Xóa phiếu thu ${record.invoiceCode} sẽ được ghi nhận vào Lịch sử thao tác.`}
            onConfirm={() => handleDelete(record._id, record.invoiceCode)}
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
        icon={<SafetyCertificateOutlined className="text-cyan-700 text-lg" />}
        message="Giám Sát Thao Tác Tài Chính & Học Phí"
        description="Mọi thao tác Điều chỉnh số tiền nộp, Hủy hóa đơn lập nhầm hoặc Xóa phiếu thu đều tự động được ghi nhận vào Lịch sử thao tác với đầy đủ danh tính người thực hiện, thời gian, số tiền trước và sau thay đổi (Chỉ xem, không được xóa hoặc sửa)."
        className="rounded-2xl border-cyan-200 bg-cyan-50/50"
      />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
            Quản Lý Phiếu Thu & Học Phí
          </Title>
          <Paragraph type="secondary" style={{ margin: 0, fontSize: 13 }}>
            Theo dõi hóa đơn đóng học phí, công nợ và lịch sử thu ngân
          </Paragraph>
        </div>

        <Button icon={<ReloadOutlined />} onClick={fetchInvoices} loading={loading} className="rounded-xl">
          Làm mới
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl border-cyan-100 shadow-xs">
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={12}>
            <Input
              placeholder="Tìm kiếm theo mã phiếu thu, nội dung..."
              prefix={<SearchOutlined className="text-slate-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={() => {
                setPage(1);
                fetchInvoices();
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
                { value: 'paid', label: 'Đã đóng đủ' },
                { value: 'partially_paid', label: 'Đóng một phần' },
                { value: 'unpaid', label: 'Chưa thanh toán' },
                { value: 'cancelled', label: 'Đã hủy' },
              ]}
              className="rounded-xl"
            />
          </Col>
          <Col xs={12} md={6}>
            <Button
              type="primary"
              onClick={() => {
                setPage(1);
                fetchInvoices();
              }}
              className="w-full h-10 rounded-xl bg-cyan-700 hover:bg-cyan-800 font-bold"
            >
              Lọc Hóa Đơn
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card className="rounded-3xl border-cyan-100 shadow-sm overflow-hidden">
        <Table
          dataSource={invoices}
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
            showTotal: (totalCount) => `Tổng số ${totalCount} phiếu thu`,
          }}
        />
      </Card>

      {/* Payment Update Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-bold text-base text-slate-800">
            <DollarOutlined className="text-cyan-700" />
            <span>Cập Nhật Thanh Toán Phiếu Thu: {selectedInvoice?.invoiceCode}</span>
          </div>
        }
        open={isPayModalOpen}
        onCancel={() => setIsPayModalOpen(false)}
        onOk={handlePaySubmit}
        confirmLoading={submitting}
        okText="Lưu Thay Đổi & Ghi Log"
        cancelText="Đóng"
        okButtonProps={{ className: 'bg-cyan-700 hover:bg-cyan-800 font-bold' }}
        destroyOnClose
      >
        <Form form={payForm} layout="vertical" className="pt-2">
          <div className="mb-4 p-3 bg-slate-50 rounded-xl text-xs space-y-1">
            <div>Tổng số tiền phải nộp: <strong>{selectedInvoice?.finalAmount?.toLocaleString('vi-VN')} VND</strong></div>
            <div>Hạn nộp: {dayjs(selectedInvoice?.dueDate).format('DD/MM/YYYY')}</div>
          </div>

          <Form.Item
            name="paidAmount"
            label={<span className="font-bold text-xs">Số tiền đã nộp (VND)</span>}
            rules={[{ required: true, message: 'Vui lòng nhập số tiền đã nộp' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(val) => val!.replace(/\$\s?|(,*)/g, '') as any}
              className="rounded-xl h-10 text-base"
            />
          </Form.Item>

          <Form.Item name="notes" label={<span className="font-bold text-xs">Ghi chú thanh toán</span>}>
            <Input.TextArea rows={2} placeholder="Hình thức thanh toán (Tiền mặt, VietQR, Chuyển khoản)..." className="rounded-xl" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-bold text-base text-slate-800">
            <CloseCircleOutlined className="text-amber-600" />
            <span>Hủy Phiếu Thu: {selectedInvoice?.invoiceCode}</span>
          </div>
        }
        open={isCancelModalOpen}
        onCancel={() => setIsCancelModalOpen(false)}
        onOk={handleCancelSubmit}
        confirmLoading={submitting}
        okText="Xác Nhận Hủy & Lưu Vết"
        cancelText="Đóng"
        okButtonProps={{ danger: true }}
        destroyOnClose
      >
        <Form form={cancelForm} layout="vertical" className="pt-2">
          <Paragraph className="text-xs text-slate-600">
            Phiếu thu này sẽ được chuyển sang trạng thái <strong>Đã hủy</strong>. Lý do hủy và người thực hiện sẽ được tự động ghi nhận vào Lịch sử thao tác.
          </Paragraph>

          <Form.Item
            name="reason"
            label={<span className="font-bold text-xs">Lý do hủy bỏ phiếu thu</span>}
            rules={[{ required: true, message: 'Vui lòng nhập lý do hủy' }]}
          >
            <Input.TextArea rows={3} placeholder="Ví dụ: Tạo trùng hóa đơn, học viên đổi khóa học..." className="rounded-xl" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
