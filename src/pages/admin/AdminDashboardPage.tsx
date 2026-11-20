import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Avatar,
  Space,
  Typography,
  Dropdown,
} from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  BookOutlined,
  DollarOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  UserOutlined,
  BellOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { BranchManagementView } from '../../components/admin/BranchManagementView';
import { AuditLogView } from '../../components/admin/AuditLogView';
import { ClassManagementView } from '../../components/admin/class/ClassManagementView';
import { StudentManagementView } from '../../components/admin/StudentManagementView';
import { InvoiceManagementView } from '../../components/admin/InvoiceManagementView';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedMenuKey, setSelectedMenuKey] = useState<string>('dashboard');

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined className="text-rose-600" />,
      label: <span className="font-semibold text-xs">Hồ sơ cá nhân</span>,
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <span className="font-semibold text-xs">Đăng xuất</span>,
      danger: true,
      onClick: handleLogout,
    },
  ];

  const sampleClasses = [
    {
      key: '1',
      code: 'JP-N5-K45',
      name: 'Tiếng Nhật Sơ Cấp N5 (Khai giảng T11)',
      teacher: 'Nguyễn Văn Minh (N1)',
      students: '12/12',
      status: 'active',
      schedule: 'T2-4-6 (18:00 - 20:00)',
    },
    {
      key: '2',
      code: 'JP-N4-K32',
      name: 'Luyện thi JLPT N4 Cấp tốc',
      teacher: 'Trần Thị Hạnh (N1)',
      students: '10/12',
      status: 'active',
      schedule: 'T3-5-7 (19:30 - 21:30)',
    },
    {
      key: '3',
      code: 'JP-N3-K20',
      name: 'Chinh phục JLPT N3 Đọc hiểu & Nghe',
      teacher: 'Yamada Kenji (Bản ngữ)',
      students: '8/12',
      status: 'upcoming',
      schedule: 'T7-CN (09:00 - 11:30)',
    },
    {
      key: '4',
      code: 'JP-KW-K15',
      name: 'Kaiwa Tiếng Nhật Giao Tiếp Doanh Nghiệp',
      teacher: 'Lê Hoàng Nam (N1)',
      students: '12/12',
      status: 'active',
      schedule: 'T2-4-6 (20:00 - 21:30)',
    },
  ];

  const columns = [
    {
      title: 'Mã Lớp',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      align: 'center' as const,
      render: (text: string) => <strong className="text-rose-700 font-mono whitespace-nowrap">{text}</strong>,
    },
    {
      title: 'Tên Khóa Học',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      align: 'center' as const,
      render: (name: string) => <div className="text-left font-medium text-slate-800 whitespace-nowrap">{name}</div>,
    },
    {
      title: 'Giảng Viên',
      dataIndex: 'teacher',
      key: 'teacher',
      width: 240,
      align: 'center' as const,
      render: (t: string) => (
        <Space className="justify-center whitespace-nowrap">
          <Avatar size="small" style={{ backgroundColor: '#f43f5e' }}>{t.charAt(0)}</Avatar>
          <span>{t}</span>
        </Space>
      ),
    },
    {
      title: 'Lịch Học',
      dataIndex: 'schedule',
      key: 'schedule',
      width: 220,
      align: 'center' as const,
      render: (s: string) => <Text type="secondary" className="text-xs whitespace-nowrap">{s}</Text>,
    },
    {
      title: 'Sĩ Số',
      dataIndex: 'students',
      key: 'students',
      width: 120,
      align: 'center' as const,
      render: (st: string) => <Tag color="blue" className="font-bold whitespace-nowrap">{st}</Tag>,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 170,
      align: 'center' as const,
      render: (status: string) =>
        status === 'active' ? (
          <Tag color="green" icon={<CheckCircleOutlined />} className="whitespace-nowrap">Đang diễn ra</Tag>
        ) : (
          <Tag color="orange" className="whitespace-nowrap">Sắp khai giảng</Tag>
        ),
    },
  ];

  return (
    <Layout className="min-h-screen bg-[#FFF9FA]">
      {/* Sider Navigation */}
      <Sider
        width={240}
        theme="light"
        className="border-r border-rose-100/80 shadow-xs"
        style={{ background: '#ffffff' }}
      >
        <Link
          to="/admin/dashboard"
          className="p-4 flex items-center gap-3 border-b border-rose-100 block hover:opacity-95 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white font-serif font-black shadow-md shadow-rose-500/20">
            明
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-sm">Minh Tú Nihongo</span>
          </div>
        </Link>

        <Menu
          mode="inline"
          selectedKeys={[selectedMenuKey]}
          onClick={({ key }) => setSelectedMenuKey(key)}
          className="border-r-0 pt-3"
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: 'Tổng quan (Dashboard)',
            },
            {
              key: 'branches',
              icon: <EnvironmentOutlined className="text-rose-600" />,
              label: 'Cơ sở, Phòng & Ca học',
            },
            {
              key: 'classes',
              icon: <BookOutlined />,
              label: 'Quản lý Lớp học',
            },
            {
              key: 'students',
              icon: <TeamOutlined />,
              label: 'Hồ sơ Học viên',
            },
            {
              key: 'finance',
              icon: <DollarOutlined />,
              label: 'Học phí & Hóa đơn',
            },
            {
              key: 'audit-logs',
              icon: <HistoryOutlined className="text-rose-600" />,
              label: 'Lịch sử thao tác',
            },
          ]}
        />
      </Sider>

      {/* Main Container */}
      <Layout>
        {/* Header */}
        <Header
          style={{
            backgroundColor: '#ffffff',
            height: 64,
            lineHeight: 'normal',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          className="border-b border-rose-100 shadow-xs"
        >
          <Title level={4} style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>
            {selectedMenuKey === 'branches'
              ? 'Thiết Lập Cơ Sở, Phòng Học & Ca Học'
              : selectedMenuKey === 'classes'
              ? 'Quản Lý Lớp Học & Tiến Độ Đào Tạo'
              : selectedMenuKey === 'students'
              ? 'Quản Lý Hồ Sơ Học Viên'
              : selectedMenuKey === 'finance'
              ? 'Quản Lý Phiếu Thu & Học Phí'
              : selectedMenuKey === 'audit-logs'
              ? 'Lịch Sử Thao Tác'
              : 'Bảng Điều Khiển Quản Trị'}
          </Title>

          <div className="flex items-center gap-3">
            <Button
              shape="circle"
              icon={<BellOutlined />}
              className="border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600"
            />

            <div className="h-6 w-px bg-slate-200 mx-1" />

            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all select-none">
                <Avatar size={36} style={{ backgroundColor: '#e11d48', flexShrink: 0 }} src={user?.avatar}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </Avatar>
                <div className="text-left hidden sm:flex flex-col justify-center">
                  <span className="text-xs font-bold text-slate-800 leading-snug truncate max-w-[150px]">
                    {user?.name || 'Quản trị viên'}
                  </span>
                  <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider leading-none mt-0.5">
                    {user?.role || 'Admin'}
                  </span>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content className="p-6 overflow-y-auto">
          {selectedMenuKey === 'branches' ? (
            <BranchManagementView />
          ) : selectedMenuKey === 'classes' ? (
            <ClassManagementView />
          ) : selectedMenuKey === 'students' ? (
            <StudentManagementView />
          ) : selectedMenuKey === 'finance' ? (
            <InvoiceManagementView />
          ) : selectedMenuKey === 'audit-logs' ? (
            <AuditLogView />
          ) : (
            <>
              {/* Stats Row */}
              <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                  <Card className="rounded-2xl border-rose-100 shadow-xs">
                    <Statistic
                      title={<span className="text-xs font-medium text-slate-500">Tổng Học Viên Đang Học</span>}
                      value={1280}
                      prefix={<TeamOutlined className="text-rose-500 mr-2" />}
                      valueStyle={{ color: '#0f172a', fontWeight: 800 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="rounded-2xl border-rose-100 shadow-xs">
                    <Statistic
                      title={<span className="text-xs font-medium text-slate-500">Lớp Học Đang Hoạt Động</span>}
                      value={42}
                      prefix={<BookOutlined className="text-pink-500 mr-2" />}
                      valueStyle={{ color: '#0f172a', fontWeight: 800 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="rounded-2xl border-rose-100 shadow-xs">
                    <Statistic
                      title={<span className="text-xs font-medium text-slate-500">Tỷ Lệ Đỗ JLPT Kì Gần Nhất</span>}
                      value={98.6}
                      precision={1}
                      suffix="%"
                      prefix={<CheckCircleOutlined className="text-emerald-500 mr-2" />}
                      valueStyle={{ color: '#059669', fontWeight: 800 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="rounded-2xl border-rose-100 shadow-xs">
                    <Statistic
                      title={<span className="text-xs font-medium text-slate-500">Giảng Viên & Trợ Giảng</span>}
                      value={28}
                      prefix={<UserOutlined className="text-amber-500 mr-2" />}
                      valueStyle={{ color: '#0f172a', fontWeight: 800 }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Table of Classes */}
              <Card
                title={
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-base">Danh Sách Lớp Học Hoạt Động Gần Đây</span>
                    <Tag color="rose">Học kỳ Fall 2026</Tag>
                  </div>
                }
                className="rounded-3xl border-rose-100 shadow-sm"
              >
                <Table
                  dataSource={sampleClasses}
                  columns={columns}
                  pagination={false}
                  size="middle"
                  scroll={{ x: 1100 }}
                />
              </Card>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};
