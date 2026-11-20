import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Input,
  Select,
  DatePicker,
  Modal,
  Avatar,
  Typography,
  Tooltip,
  Badge,
  Tabs,
  Alert,
  message,
} from 'antd';
import {
  SafetyCertificateOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  WarningOutlined,
  UserOutlined,
  DollarOutlined,
  BookOutlined,
  FieldTimeOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  CloseCircleOutlined,
  PlusCircleOutlined,
  GlobalOutlined,
  DesktopOutlined,
  LockOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import {
  auditLogService,
  type AuditLog,
  type AuditAction,
  type AuditLogStats,
} from '../../services/auditLog.service';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  // Detail Modal State
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await auditLogService.getAuditLogStats();
      if (res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Không thể tải thống kê nhật ký:', err);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditLogService.getAuditLogs({
        page,
        limit: pageSize,
        search: search || undefined,
        targetCollection: selectedCollection !== 'all' ? selectedCollection : undefined,
        action: selectedAction !== 'all' ? selectedAction : undefined,
        startDate: dateRange ? dateRange[0] : undefined,
        endDate: dateRange ? dateRange[1] : undefined,
      });

      if (res.data) {
        setLogs(res.data.logs);
        setTotal(res.data.pagination.total);
      }
    } catch {
      message.error('Lỗi khi tải danh sách nhật ký hệ thống');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, selectedCollection, selectedAction, dateRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleOpenDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleCopyJson = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    message.success('Đã sao chép dữ liệu JSON vào bộ nhớ tạm!');
  };

  // Helper formatting badges
  const getActionTag = (action: AuditAction) => {
    switch (action) {
      case 'UPDATE':
        return (
          <Tag color="blue" icon={<EditOutlined />} className="px-2.5 py-0.5 rounded-full font-bold text-xs uppercase">
            Chỉnh sửa
          </Tag>
        );
      case 'DELETE':
        return (
          <Tag color="error" icon={<DeleteOutlined />} className="px-2.5 py-0.5 rounded-full font-bold text-xs uppercase animate-pulse">
            Xóa dữ liệu
          </Tag>
        );
      case 'CANCEL':
        return (
          <Tag color="warning" icon={<CloseCircleOutlined />} className="px-2.5 py-0.5 rounded-full font-bold text-xs uppercase">
            Hủy giao dịch
          </Tag>
        );
      case 'CREATE':
        return (
          <Tag color="success" icon={<PlusCircleOutlined />} className="px-2.5 py-0.5 rounded-full font-bold text-xs uppercase">
            Tạo mới
          </Tag>
        );
      default:
        return <Tag>{action}</Tag>;
    }
  };

  const getCollectionBadge = (collection: string) => {
    switch (collection) {
      case 'students':
        return (
          <Tag color="purple" icon={<UserOutlined />} className="font-semibold rounded-md">
            Học viên
          </Tag>
        );
      case 'invoices':
        return (
          <Tag color="cyan" icon={<DollarOutlined />} className="font-semibold rounded-md">
            Phiếu thu / Học phí
          </Tag>
        );
      case 'exam_results':
        return (
          <Tag color="gold" icon={<BookOutlined />} className="font-semibold rounded-md">
            Điểm số / Đánh giá
          </Tag>
        );
      default:
        return <Tag color="default">{collection}</Tag>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-md font-bold uppercase">Quản trị viên</span>;
      case 'staff':
        return <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-md font-bold uppercase">Giáo vụ</span>;
      case 'teacher':
        return <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold uppercase">Giảng viên</span>;
      default:
        return <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md font-bold uppercase">{role}</span>;
    }
  };

  const columns = [
    {
      title: 'Thời Gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      align: 'center' as const,
      render: (dateStr: string) => {
        const d = dayjs(dateStr);
        return (
          <div className="text-center">
            <div className="font-semibold text-slate-800 text-xs flex items-center justify-center gap-1.5">
              <FieldTimeOutlined className="text-rose-500" />
              <span>{d.format('DD/MM/YYYY HH:mm')}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{d.fromNow()}</div>
          </div>
        );
      },
    },
    {
      title: 'Người Thực Hiện',
      dataIndex: 'userId',
      key: 'userId',
      width: 220,
      align: 'center' as const,
      render: (u: AuditLog['userId']) => {
        if (!u) {
          return <span className="text-slate-400 text-xs italic">Hệ thống tự động</span>;
        }
        return (
          <div className="flex items-center gap-2.5 text-left inline-block">
            <Avatar
              size={32}
              src={u.avatar}
              style={{ backgroundColor: u.role === 'admin' ? '#e11d48' : '#3b82f6' }}
            >
              {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 text-xs leading-tight">{u.name || 'Người dùng'}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {getRoleBadge(u.role)}
                <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{u.email}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Phân Hệ',
      dataIndex: 'targetCollection',
      key: 'targetCollection',
      width: 160,
      align: 'center' as const,
      render: (col: string) => (
        <div className="flex justify-center">
          {getCollectionBadge(col)}
        </div>
      ),
    },
    {
      title: 'Hành Động',
      dataIndex: 'action',
      key: 'action',
      width: 140,
      align: 'center' as const,
      render: (act: AuditAction) => (
        <div className="flex justify-center">
          {getActionTag(act)}
        </div>
      ),
    },
    {
      title: 'Nội Dung & Chi Tiết Thao Tác',
      dataIndex: 'description',
      key: 'description',
      align: 'center' as const,
      render: (desc: string, record: AuditLog) => {
        const changeCount = record.changedFields?.length || 0;
        return (
          <div className="text-left">
            <p className="text-xs font-medium text-slate-700 mb-1 leading-snug">{desc}</p>
            {changeCount > 0 && (
              <Tag color="processing" className="text-[10px] border-none bg-blue-50 text-blue-700 font-semibold px-2">
                Đã thay đổi {changeCount} trường thông tin
              </Tag>
            )}
            {record.action === 'DELETE' && (
              <Tag color="error" className="text-[10px] border-none bg-rose-50 text-rose-700 font-semibold px-2">
                Bản ghi gốc đã được sao lưu toàn vẹn
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Thiết Bị / IP',
      key: 'origin',
      width: 160,
      align: 'center' as const,
      render: (_: any, record: AuditLog) => (
        <div className="text-[11px] text-slate-500 text-center">
          <div className="flex items-center justify-center gap-1 font-mono text-slate-700 font-medium">
            <GlobalOutlined className="text-slate-400" />
            <span>{record.ipAddress || '127.0.0.1'}</span>
          </div>
          <div className="truncate max-w-[130px] text-[10px] text-slate-400 mt-0.5 mx-auto" title={record.userAgent}>
            <DesktopOutlined className="mr-1" />
            {record.userAgent?.includes('Chrome') ? 'Google Chrome' : record.userAgent?.includes('Edge') ? 'MS Edge' : 'Web Browser'}
          </div>
        </div>
      ),
    },
    {
      title: 'Xem',
      key: 'actions',
      width: 90,
      align: 'center' as const,
      render: (_: any, record: AuditLog) => (
        <Tooltip title="Xem chi tiết dữ liệu so sánh (Old/New)">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleOpenDetail(record)}
            className="border-rose-300 text-rose-600 hover:border-rose-500 hover:text-rose-700 font-semibold"
          >
            Chi tiết
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner / Header Title */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 p-6 rounded-3xl text-white shadow-lg shadow-rose-600/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5">
              <HistoryOutlined />
              Lịch Sử Thao Tác
            </span>
          </div>
          <Title level={3} style={{ color: '#ffffff', margin: 0, fontWeight: 800 }}>
            Lịch Sử Thao Tác
          </Title>
          <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '6px 0 0 0', fontSize: 13 }}>
            Lưu vết tự động toàn bộ thao tác quan trọng (thời gian, người thực hiện, hành động chỉnh sửa/xóa dữ liệu học viên, phiếu thu hoặc điểm số). 
          </Paragraph>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <Button
            type="default"
            icon={<ReloadOutlined />}
            onClick={() => {
              fetchLogs();
              fetchStats();
            }}
            loading={loading}
            className="bg-white text-rose-600 border-none font-bold h-10 px-5 rounded-xl shadow-md hover:bg-rose-50"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-rose-100 shadow-xs hover:border-rose-300 transition-all">
            <Statistic
              title={<span className="text-xs font-bold text-slate-500 uppercase">Tổng Sự Kiện Đã Ghi Nhận</span>}
              value={stats?.totalLogs || total}
              prefix={<SafetyCertificateOutlined className="text-rose-500 mr-2" />}
              valueStyle={{ color: '#0f172a', fontWeight: 800, fontSize: 24 }}
            />
            <div className="mt-2 text-[11px] text-slate-400">
              Hôm nay ghi nhận: <strong className="text-rose-600">+{stats?.todayLogs || 0} thao tác mới</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-purple-100 shadow-xs hover:border-purple-300 transition-all">
            <Statistic
              title={<span className="text-xs font-bold text-slate-500 uppercase">Thao Tác Hồ Sơ Học Viên</span>}
              value={stats?.byCollection?.students || 0}
              prefix={<UserOutlined className="text-purple-500 mr-2" />}
              valueStyle={{ color: '#6b21a8', fontWeight: 800, fontSize: 24 }}
            />
            <div className="mt-2 text-[11px] text-slate-400">
              Chỉnh sửa thông tin liên hệ, xóa hồ sơ
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-cyan-100 shadow-xs hover:border-cyan-300 transition-all">
            <Statistic
              title={<span className="text-xs font-bold text-slate-500 uppercase">Thao Tác Phiếu Thu & Học Phí</span>}
              value={stats?.byCollection?.invoices || 0}
              prefix={<DollarOutlined className="text-cyan-600 mr-2" />}
              valueStyle={{ color: '#0e7490', fontWeight: 800, fontSize: 24 }}
            />
            <div className="mt-2 text-[11px] text-slate-400">
              Sửa tiền đóng, hủy biên lai, miễn giảm
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-amber-100 shadow-xs hover:border-amber-300 transition-all">
            <Statistic
              title={<span className="text-xs font-bold text-slate-500 uppercase">Thao Tác Điểm Số & Đánh Giá</span>}
              value={stats?.byCollection?.exam_results || 0}
              prefix={<BookOutlined className="text-amber-500 mr-2" />}
              valueStyle={{ color: '#b45309', fontWeight: 800, fontSize: 24 }}
            />
            <div className="mt-2 text-[11px] text-slate-400">
              Phúc khảo, sửa điểm thi JLPT & định kỳ
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter and Search Bar Card */}
      <Card className="rounded-2xl border-rose-100 shadow-xs">
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm theo mô tả, người thao tác, mã bản ghi, IP..."
              prefix={<SearchOutlined className="text-slate-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={() => {
                setPage(1);
                fetchLogs();
              }}
              allowClear
              className="rounded-xl h-10 border-slate-200"
            />
          </Col>

          <Col xs={12} md={4}>
            <Select
              value={selectedCollection}
              onChange={(val) => {
                setSelectedCollection(val);
                setPage(1);
              }}
              style={{ width: '100%', height: 40 }}
              options={[
                { value: 'all', label: 'Tất cả phân hệ' },
                { value: 'students', label: 'Hồ sơ Học viên' },
                { value: 'invoices', label: 'Phiếu thu / Học phí' },
                { value: 'exam_results', label: 'Điểm số / Đánh giá' },
              ]}
              className="rounded-xl"
            />
          </Col>

          <Col xs={12} md={4}>
            <Select
              value={selectedAction}
              onChange={(val) => {
                setSelectedAction(val);
                setPage(1);
              }}
              style={{ width: '100%', height: 40 }}
              options={[
                { value: 'all', label: 'Tất cả hành động' },
                { value: 'UPDATE', label: 'Chỉnh sửa (UPDATE)' },
                { value: 'DELETE', label: 'Xóa bỏ (DELETE)' },
                { value: 'CANCEL', label: 'Hủy giao dịch (CANCEL)' },
                { value: 'CREATE', label: 'Tạo mới (CREATE)' },
              ]}
              className="rounded-xl"
            />
          </Col>

          <Col xs={24} md={6}>
            <RangePicker
              style={{ width: '100%', height: 40 }}
              placeholder={['Từ ngày', 'Đến ngày']}
              onChange={(_dates, dateStrings) => {
                if (dateStrings[0] && dateStrings[1]) {
                  setDateRange([dateStrings[0], dateStrings[1]]);
                } else {
                  setDateRange(null);
                }
                setPage(1);
              }}
              className="rounded-xl"
            />
          </Col>

          <Col xs={24} md={2}>
            <Button
              type="primary"
              onClick={() => {
                setPage(1);
                fetchLogs();
              }}
              className="w-full h-10 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold"
            >
              Lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Main Table Card */}
      <Card
        className="rounded-3xl border-rose-100 shadow-sm overflow-hidden"
        title={
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <HistoryOutlined className="text-rose-600" />
              <span className="font-bold text-slate-800 text-base">Danh Sách Lịch Sử Thao Tác</span>
              <Badge count={total} overflowCount={9999} style={{ backgroundColor: '#e11d48' }} />
            </div>
          </div>
        }
      >
        <Table
          dataSource={logs}
          columns={columns}
          rowKey="_id"
          loading={loading}
          size="middle"
          scroll={{ x: 1250 }}
          pagination={{
            position: ['bottomCenter'],
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
            showTotal: (totalCount, range) => (
              <span className="text-xs text-slate-500">
                Hiển thị <strong>{range[0]}-{range[1]}</strong> trên tổng <strong>{totalCount}</strong> thao tác
              </span>
            ),
          }}
          className="audit-log-table"
        />
      </Card>

      {/* Detail Modal: Data Diff and Inspection */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <HistoryOutlined className="text-rose-600" />
            <span>Chi Tiết Lịch Sử Thao Tác</span>
            {selectedLog && getActionTag(selectedLog.action)}
            <Tag color="cyan" className="ml-auto font-medium text-xs">
              <LockOutlined /> Chỉ xem
            </Tag>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button
            key="copy"
            icon={<CopyOutlined />}
            onClick={() => handleCopyJson(selectedLog)}
            className="border-slate-300"
          >
            Sao chép toàn bộ JSON
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setIsDetailModalOpen(false)}
            className="bg-rose-600 hover:bg-rose-700 font-bold"
          >
            Đóng
          </Button>,
        ]}
        width={800}
        destroyOnClose
      >
        {selectedLog && (
          <div className="space-y-4 py-2">
            {/* Meta Information Cards */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Thời gian thao tác</span>
                <span className="font-bold text-slate-800">
                  {dayjs(selectedLog.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  ({dayjs(selectedLog.createdAt).fromNow()})
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Người thực hiện</span>
                <span className="font-bold text-slate-800">
                  {selectedLog.userId?.name || 'Hệ thống'}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {selectedLog.userId?.email || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Phân hệ & ID Bản ghi</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  {getCollectionBadge(selectedLog.targetCollection)}
                </span>
                <span className="font-mono text-[10px] text-slate-500 block truncate mt-0.5" title={selectedLog.targetId}>
                  ID: {selectedLog.targetId}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Địa chỉ IP thiết bị</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedLog.ipAddress || '127.0.0.1'}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-slate-400 block font-medium">User Agent (Trình duyệt)</span>
                <span className="font-mono text-[11px] text-slate-600 truncate block" title={selectedLog.userAgent}>
                  {selectedLog.userAgent || 'Web Client'}
                </span>
              </div>
            </div>

            {/* Description Banner */}
            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 flex items-start gap-2.5">
              <span className="text-base text-rose-600 font-bold">ℹ️</span>
              <div>
                <span className="text-xs font-bold text-rose-900 block">Nội dung ghi nhận:</span>
                <span className="text-xs text-rose-800">{selectedLog.description}</span>
              </div>
            </div>

            {/* Data Diff Tabs */}
            <Tabs
              defaultActiveKey="diff"
              items={[
                {
                  key: 'diff',
                  label: <span className="font-bold text-xs">So Sánh Thay Đổi (Visual Diff)</span>,
                  children: (
                    <div className="space-y-3">
                      {selectedLog.action === 'UPDATE' && selectedLog.changedFields && selectedLog.changedFields.length > 0 ? (
                        <div className="border border-slate-200 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                <th className="p-3 w-1/4">Trường Thông Tin</th>
                                <th className="p-3 w-3/8 bg-rose-50/50 text-rose-800">Dữ Liệu Cũ (Trước)</th>
                                <th className="p-3 w-3/8 bg-emerald-50/50 text-emerald-800">Dữ Liệu Mới (Sau)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedLog.changedFields.map((field, idx) => (
                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                                  <td className="p-3 font-semibold text-slate-800">
                                    <div>{field.fieldName || field.field}</div>
                                    <code className="text-[10px] text-slate-400 font-mono">{field.field}</code>
                                  </td>
                                  <td className="p-3 font-mono text-rose-600 bg-rose-50/20 line-through">
                                    {typeof field.oldValue === 'object'
                                      ? JSON.stringify(field.oldValue)
                                      : String(field.oldValue ?? 'Trống')}
                                  </td>
                                  <td className="p-3 font-mono font-bold text-emerald-600 bg-emerald-50/20">
                                    {typeof field.newValue === 'object'
                                      ? JSON.stringify(field.newValue)
                                      : String(field.newValue ?? 'Trống')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : selectedLog.action === 'DELETE' ? (
                        <Alert
                          type="error"
                          showIcon
                          icon={<WarningOutlined />}
                          message="Bản ghi đã bị xóa hoàn toàn khỏi cơ sở dữ liệu chính"
                          description="Ảnh chụp toàn bộ dữ liệu trước khi xóa đã được sao lưu toàn vẹn bên dưới để phục vụ công tác đối soát hoặc khôi phục dữ liệu nếu có sai sót."
                          className="rounded-2xl"
                        />
                      ) : selectedLog.action === 'CANCEL' ? (
                        <Alert
                          type="warning"
                          showIcon
                          icon={<CloseCircleOutlined />}
                          message="Giao dịch / Phiếu thu đã bị hủy bỏ"
                          description="Trạng thái đã chuyển sang 'cancelled'. Dữ liệu cũ và mới được lưu vết đầy đủ."
                          className="rounded-2xl"
                        />
                      ) : (
                        <Alert
                          type="success"
                          showIcon
                          icon={<CheckCircleOutlined />}
                          message="Bản ghi mới được tạo"
                          description="Toàn bộ thông tin khởi tạo ban đầu được lưu lại trong phần Dữ liệu mới."
                          className="rounded-2xl"
                        />
                      )}
                    </div>
                  ),
                },
                {
                  key: 'oldData',
                  label: <span className="font-bold text-xs text-rose-700">Ảnh Chụp Cũ (Old Data JSON)</span>,
                  children: (
                    <div className="relative">
                      <Button
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => handleCopyJson(selectedLog.oldData)}
                        className="absolute top-2 right-2 z-10 text-xs"
                      >
                        Sao chép
                      </Button>
                      <pre className="bg-slate-900 text-rose-300 p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-72">
                        {JSON.stringify(selectedLog.oldData, null, 2) || '// Không có dữ liệu cũ'}
                      </pre>
                    </div>
                  ),
                },
                {
                  key: 'newData',
                  label: <span className="font-bold text-xs text-emerald-700">Dữ Liệu Mới (New Data JSON)</span>,
                  children: (
                    <div className="relative">
                      <Button
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => handleCopyJson(selectedLog.newData)}
                        className="absolute top-2 right-2 z-10 text-xs"
                      >
                        Sao chép
                      </Button>
                      <pre className="bg-slate-900 text-emerald-300 p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-72">
                        {JSON.stringify(selectedLog.newData, null, 2) || '// Không có dữ liệu mới'}
                      </pre>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
