import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Button,
  Tag,
  Typography,
  Space,
  Badge,
  Avatar,
  Divider,
  Form,
  Input,
  Alert,
  Statistic,
  message,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';

const { Title, Paragraph, Text } = Typography;

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [loginForm] = Form.useForm();
  const [isHomeLoginLoading, setIsHomeLoginLoading] = useState(false);
  const [homeLoginError, setHomeLoginError] = useState<string | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const handleHomeLogin = async (values: { email: string; password: string }) => {
    setIsHomeLoginLoading(true);
    setHomeLoginError(null);
    try {
      await login({
        email: values.email.trim(),
        password: values.password,
      });
      message.success('Đăng nhập thành công!');
    } catch (err: any) {
      setHomeLoginError(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setIsHomeLoginLoading(false);
    }
  };

  const courses = [
    {
      id: 'n5-n4',
      title: 'Khóa Học Tiếng Nhật N5 - N4 (Nhập Môn)',
      badge: 'Bán chạy nhất',
      level: 'Cơ bản',
      tagColor: 'magenta',
      desc: 'Dành cho người mới bắt đầu từ bảng chữ cái Hiragana/Katakana đến làm chủ 1,500 từ vựng và ngữ pháp N5/N4.',
      duration: '3.5 tháng',
      sessions: '42 buổi',
      price: '3.200.000 ₫',
      features: ['Giáo trình Minna no Nihongo độc quyền', 'Lớp học tối đa 12 học viên', 'Hỗ trợ trợ giảng sửa kaiwa 1-1'],
    },
    {
      id: 'n3-pro',
      title: 'Khóa Luyện Thi JLPT N3 Cấp Tốc',
      badge: 'Cam kết đỗ',
      level: 'Trung cấp',
      tagColor: 'pink',
      desc: 'Bứt phá điểm đọc hiểu Choukai và Dokkai, tổng hợp 120 cấu trúc ngữ pháp then chốt cho kỳ thi JLPT.',
      duration: '4 tháng',
      sessions: '48 buổi',
      price: '4.500.000 ₫',
      features: ['Luyện 15 bộ đề thi thật sát 99%', 'Chiến thuật làm bài chống bẫy', 'Test đầu ra chuẩn format Nhật Bản'],
    },
    {
      id: 'n2-n1',
      title: 'Luyện Thi Thượng Cấp N2 - N1 & Thương Mại',
      badge: 'Chuyên sâu',
      level: 'Cao cấp',
      tagColor: 'purple',
      desc: 'Nắm vững tiếng Nhật thương mại Keigo, đọc báo Asahi/NHK và viết báo cáo chuyên nghiệp trong doanh nghiệp Nhật.',
      duration: '5 tháng',
      sessions: '60 buổi',
      price: '5.800.000 ₫',
      features: ['100% Sensei người Nhật & N1 giảng dạy', 'Phỏng vấn xin việc & sửa CV tiếng Nhật', 'Cơ hội kết nối việc làm lương cao'],
    },
  ];

  const senseis = [
    {
      name: 'Thầy Nguyễn Minh Tú',
      role: 'Giám đốc Học thuật • JLPT N1 178/180',
      exp: '12 năm kinh nghiệm giảng dạy JLPT',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      badge: 'Cựu du học sinh ĐH Tokyo',
    },
    {
      name: 'Cô Takahashi Yuka',
      role: 'Chuyên gia Ngữ âm & Kaiwa • Sensei Bản Xứ',
      exp: '8 năm đào tạo phát âm & giao tiếp',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      badge: 'Thạc sĩ Sư phạm Tokyo Gakugei',
    },
    {
      name: 'Thầy Trần Hoàng Nam',
      role: 'Trưởng ban Luyện đề JLPT N2/N3',
      exp: '7 năm cố vấn phương pháp học siêu trí nhớ',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      badge: 'JLPT N1 • Cựu kỹ sư Rakuten',
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* 1. HERO SECTION WITH EMBEDDED QUICK LOGIN */}
      <section className="relative rounded-3xl p-6 sm:p-10 lg:p-12 overflow-hidden bg-gradient-to-br from-white via-rose-50/50 to-pink-50/70 border border-rose-100/90 shadow-sm">
        {/* Sakura ambient light blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-200/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-pink-200/35 rounded-full blur-2xl pointer-events-none" />

        {/* Kanji watermark */}
        <div className="absolute right-4 bottom-2 select-none pointer-events-none opacity-[0.03] text-8xl md:text-9xl font-serif text-rose-950 font-black">
          明途
        </div>

        <Row gutter={[32, 32]} align="middle" className="relative z-10">
          {/* Left Column: Value Prop */}
          <Col xs={24} lg={14}>
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-rose-200/80 shadow-xs">
                <Tag color="magenta" bordered={false} className="m-0 font-bold">
                  🌸 Minh Tú Nihongo
                </Tag>
                <span className="text-xs font-semibold text-slate-700">
                  Trung tâm Đào tạo Tiếng Nhật Chuẩn JLPT Quốc Tế
                </span>
              </div>

              <Title level={1} style={{ margin: 0, fontWeight: 900, color: '#0f172a', lineHeight: 1.15 }}>
                Chinh Phục Tiếng Nhật <br />
                <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 bg-clip-text text-transparent">
                  Bứt Phá Điểm Số JLPT
                </span>
              </Title>

              <Paragraph style={{ fontSize: 15, color: '#475569', lineHeight: 1.6 }}>
                Hệ thống giáo trình độc quyền tinh gọn, sĩ số vàng 12 học viên cùng đội ngũ Sensei đạt chuẩn N1 & bản xứ.
                Theo dõi tiến độ, điểm danh và luyện thi trực tuyến 24/7.
              </Paragraph>

              <Space wrap size={[12, 12]} className="pt-2">
                <a href="#courses">
                  <Button
                    type="primary"
                    size="large"
                    icon={<ThunderboltOutlined />}
                    className="h-12 px-6 rounded-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 border-none shadow-md shadow-rose-500/25"
                  >
                    Xem Các Khóa Học Mới Nhất
                  </Button>
                </a>
                <Link to="/register">
                  <Button
                    size="large"
                    className="h-12 px-6 rounded-xl font-bold border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50/50"
                  >
                    Đăng Ký Tư Vấn Học Viên
                  </Button>
                </Link>
              </Space>

              {/* Badges Highlights */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <CheckCircleOutlined className="text-emerald-500" />
                  Cam kết đỗ JLPT hợp đồng
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircleOutlined className="text-emerald-500" />
                  Lớp học tối đa 12 người
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircleOutlined className="text-emerald-500" />
                  Ứng dụng học tập thông minh
                </span>
              </div>
            </div>
          </Col>

          {/* Right Column: Embedded Quick Login Card */}
          <Col xs={24} lg={10}>
            <div className="w-full max-w-sm mx-auto">
              {isAuthenticated && user ? (
                /* Authenticated User Status Card */
                <Card
                  className="rounded-3xl border-rose-200/80 shadow-lg shadow-rose-950/5 backdrop-blur-md bg-white/90"
                  styles={{ body: { padding: '28px' } }}
                >
                  <div className="text-center space-y-3">
                    <Avatar size={64} style={{ backgroundColor: '#e11d48', fontSize: 24, fontWeight: 700 }}>
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <div>
                      <Tag color="magenta" className="rounded-full text-xs font-semibold px-2.5">
                        {user.role === 'admin' ? 'Quản trị viên' : user.role === 'teacher' ? 'Giảng viên' : 'Học viên chính thức'}
                      </Tag>
                      <Title level={4} style={{ margin: '6px 0 2px', fontWeight: 800 }}>
                        {user.name}
                      </Title>
                      <Text type="secondary" className="text-xs">{user.email}</Text>
                    </div>

                    <Divider className="my-3" />

                    <div className="space-y-2">
                      {user.role === 'admin' || user.role === 'staff' ? (
                        <Button
                          type="primary"
                          block
                          icon={<CrownOutlined />}
                          onClick={() => navigate('/admin/dashboard')}
                          className="rounded-xl h-10 font-bold bg-gradient-to-r from-rose-500 to-pink-500 border-none"
                        >
                          Vào Cổng Quản Trị
                        </Button>
                      ) : null}

                      <Button
                        danger
                        block
                        onClick={() => logout()}
                        className="rounded-xl h-10 font-semibold"
                      >
                        Đăng Xuất Khỏi Thiết Bị
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                /* Quick Login Form with Antd */
                <Card
                  className="rounded-3xl border border-rose-200/90 shadow-xl shadow-rose-950/5 backdrop-blur-md bg-white/95"
                  styles={{ body: { padding: '28px' } }}
                  title={
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs">
                          明
                        </div>
                        <span className="font-bold text-slate-800 text-sm">Đăng Nhập Nhanh</span>
                      </div>
                      <Tag color="pink" className="font-semibold text-[11px] m-0">Học Viên</Tag>
                    </div>
                  }
                >
                  {homeLoginError && (
                    <Alert
                      message={homeLoginError}
                      type="error"
                      showIcon
                      closable
                      onClose={() => setHomeLoginError(null)}
                      className="mb-4 text-xs rounded-xl"
                    />
                  )}

                  <Form
                    form={loginForm}
                    layout="vertical"
                    onFinish={handleHomeLogin}
                    size="middle"
                    requiredMark={false}
                  >
                    <Form.Item
                      name="email"
                      label={
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <UserOutlined className="text-rose-500 text-sm" />
                          <span>Email Học Viên</span>
                        </span>
                      }
                      rules={[
                        { required: true, message: 'Nhập email của bạn' },
                        { type: 'email', message: 'Email không hợp lệ' },
                      ]}
                      className="mb-3"
                    >
                      <Input
                        prefix={<UserOutlined className="text-slate-400" />}
                        placeholder="hocvien@gmail.com"
                        className="rounded-xl border-rose-200"
                      />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      label={
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <LockOutlined className="text-rose-500 text-sm" />
                          <span>Mật khẩu</span>
                        </span>
                      }
                      rules={[{ required: true, message: 'Nhập mật khẩu' }]}
                      className="mb-1"
                    >
                      <Input.Password
                        prefix={<LockOutlined className="text-slate-400" />}
                        placeholder="••••••••"
                        className="rounded-xl border-rose-200"
                      />
                    </Form.Item>

                    <div className="flex justify-end mb-3">
                      <button
                        type="button"
                        onClick={() => setShowForgotPasswordModal(true)}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-semibold border-none bg-transparent cursor-pointer p-0"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isHomeLoginLoading}
                      block
                      className="h-10 rounded-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 border-none shadow-sm shadow-rose-500/25 mb-2"
                    >
                      Đăng Nhập Ngay
                    </Button>
                  </Form>

                  <div className="text-center text-xs text-slate-500 pt-2 border-t border-rose-100">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="font-semibold text-rose-600 hover:underline">
                      Đăng ký ngay 🌸
                    </Link>
                  </div>
                </Card>
              )}
            </div>
          </Col>
        </Row>
      </section>

      {/* 2. STATS ROW USING ANTD STATISTIC */}
      <section>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card className="rounded-2xl border-rose-100 text-center shadow-xs bg-white hover:border-rose-300 transition-all">
              <Statistic
                title={<span className="text-xs font-semibold text-slate-500">Học Viên Tốt Nghiệp</span>}
                value={5000}
                suffix="+"
                prefix={<TeamOutlined className="text-rose-500 mr-1" />}
                valueStyle={{ color: '#0f172a', fontWeight: 900 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-2xl border-rose-100 text-center shadow-xs bg-white hover:border-rose-300 transition-all">
              <Statistic
                title={<span className="text-xs font-semibold text-slate-500">Tỷ Lệ Đỗ JLPT N3 - N1</span>}
                value={98.6}
                precision={1}
                suffix="%"
                prefix={<TrophyOutlined className="text-amber-500 mr-1" />}
                valueStyle={{ color: '#0f172a', fontWeight: 900 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-2xl border-rose-100 text-center shadow-xs bg-white hover:border-rose-300 transition-all">
              <Statistic
                title={<span className="text-xs font-semibold text-slate-500">Năm Kinh Nghiệm</span>}
                value={12}
                suffix="Năm"
                prefix={<ClockCircleOutlined className="text-pink-500 mr-1" />}
                valueStyle={{ color: '#0f172a', fontWeight: 900 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-2xl border-rose-100 text-center shadow-xs bg-white hover:border-rose-300 transition-all">
              <Statistic
                title={<span className="text-xs font-semibold text-slate-500">Sensei Đạt Chuẩn N1</span>}
                value={100}
                suffix="%"
                prefix={<SafetyCertificateOutlined className="text-emerald-500 mr-1" />}
                valueStyle={{ color: '#0f172a', fontWeight: 900 }}
              />
            </Card>
          </Col>
        </Row>
      </section>

      {/* 3. FEATURED COURSES CATALOG */}
      <section id="courses" className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Tag color="magenta" className="font-bold px-3 py-0.5 rounded-full text-xs">
            CHƯƠNG TRÌNH ĐÀO TẠO TIÊU BIỂU
          </Tag>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            Lộ Trình Học Chuẩn Quốc Tế
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 14 }}>
            Mỗi khóa học được thiết kế sát theo format đề thi JLPT thực tế, rèn luyện đồng thời 4 kỹ năng Nghe - Nói - Đọc - Viết.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {courses.map((course) => (
            <Col xs={24} md={8} key={course.id}>
              <Badge.Ribbon text={course.badge} color="#e11d48">
                <Card
                  hoverable
                  className="rounded-3xl border-rose-100 shadow-sm h-full flex flex-col justify-between overflow-hidden hover:border-rose-300 hover:shadow-md transition-all"
                  styles={{ body: { padding: '28px', display: 'flex', flexDirection: 'column', height: '100%' } }}
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <Tag color={course.tagColor} className="font-bold text-xs rounded-md">
                        {course.level}
                      </Tag>
                      <span className="text-xs text-slate-400 font-medium">{course.duration} • {course.sessions}</span>
                    </div>

                    <Title level={4} style={{ margin: '4px 0', fontWeight: 700, color: '#0f172a' }}>
                      {course.title}
                    </Title>

                    <Paragraph type="secondary" style={{ fontSize: 13, lineHeight: 1.5 }}>
                      {course.desc}
                    </Paragraph>

                    <Divider className="my-3" />

                    <div className="space-y-2">
                      {course.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                          <CheckCircleOutlined className="text-rose-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-rose-100/70 flex items-center justify-between">
                    <div>
                      <span className="block text-[11px] text-slate-400">Học phí trọn khóa:</span>
                      <strong className="text-base text-rose-600 font-extrabold">{course.price}</strong>
                    </div>

                    <Link to="/register">
                      <Button
                        type="primary"
                        icon={<ArrowRightOutlined />}
                        className="rounded-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 border-none shadow-xs"
                      >
                        Đăng ký
                      </Button>
                    </Link>
                  </div>
                </Card>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>
      </section>

      {/* 4. SENSEI SHOWCASE */}
      <section className="space-y-6 rounded-3xl p-8 sm:p-10 bg-white border border-rose-100/90 shadow-xs">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Tag color="pink" className="font-bold px-3 py-0.5 rounded-full text-xs">
            ĐỘI NGŨ GIẢNG VIÊN TÂM HUYẾT
          </Tag>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            Học Cùng Các Sensei Xuất Sắc
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 14 }}>
            100% Giảng viên có chứng chỉ JLPT N1, được đào tạo bài bản về phương pháp sư phạm truyền cảm hứng.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {senseis.map((sensei, idx) => (
            <Col xs={24} md={8} key={idx}>
              <Card className="rounded-2xl border-rose-100 text-center hover:border-rose-300 transition-all shadow-xs">
                <Avatar
                  size={84}
                  src={sensei.avatar}
                  className="mb-3 border-2 border-rose-200 shadow-sm"
                />
                <Tag color="magenta" className="rounded-full text-xs font-semibold mb-2">
                  {sensei.badge}
                </Tag>
                <Title level={4} style={{ margin: '4px 0 2px', fontWeight: 700 }}>
                  {sensei.name}
                </Title>
                <Text type="secondary" className="block text-xs font-medium text-rose-600 mb-1">
                  {sensei.role}
                </Text>
                <Text type="secondary" className="block text-xs text-slate-500">
                  {sensei.exp}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* 5. BRANCHES / CAMPUS NETWORK SECTION */}
      <section id="branches" className="space-y-6 rounded-3xl p-8 sm:p-10 bg-white border border-rose-100/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                Hệ Thống Đào Tạo & Cơ Sở
              </span>
            </div>
            <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
              Địa Điểm Học Tập & Tư Vấn Tuyển Sinh
            </Title>
            <Paragraph type="secondary" className="text-xs sm:text-sm mt-1 mb-0">
              Phòng học máy lạnh chuẩn quốc tế, trang thiết bị âm thanh luyện nghe JLPT hiện đại tại TP. Cần Thơ.
            </Paragraph>
          </div>
          <Tag color="rose" className="px-3 py-1 rounded-full font-bold self-start sm:self-auto text-xs">
            🌸 2 Cơ sở tại TP. Cần Thơ
          </Tag>
        </div>

        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Card className="rounded-2xl border-rose-100 hover:border-rose-300 transition-all shadow-xs h-full bg-gradient-to-br from-white to-rose-50/30">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  1
                </div>
                <Tag color="magenta" className="rounded-full font-bold px-2.5">
                  Trụ Sở Đào Tạo Chính
                </Tag>
              </div>

              <Title level={4} style={{ margin: '0 0 8px', fontWeight: 800, color: '#0f172a' }}>
                Cơ sở Nguyễn Văn Cừ - Ninh Kiều
              </Title>
              <Paragraph className="text-xs text-slate-600 mb-4 flex items-start gap-2">
                <EnvironmentOutlined className="text-rose-500 mt-0.5 text-sm shrink-0" />
                <span>Số 256, Đường Nguyễn Văn Cừ, Phường An Hòa, Quận Ninh Kiều, TP. Cần Thơ</span>
              </Paragraph>

              <div className="space-y-2 pt-3 border-t border-rose-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Hotline tư vấn:</span>
                  <span className="font-bold text-rose-600">0292.3838.888</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-medium text-slate-700">trungtamnhatnguminhtu@gmail.com</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Giờ mở cửa:</span>
                  <span className="font-medium text-emerald-600">08:00 - 21:30 (Thứ 2 - Chủ Nhật)</span>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card className="rounded-2xl border-rose-100 hover:border-rose-300 transition-all shadow-xs h-full bg-gradient-to-br from-white to-pink-50/30">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  2
                </div>
                <Tag color="pink" className="rounded-full font-bold px-2.5">
                  Văn Phòng Tuyển Sinh & Luyện Đề
                </Tag>
              </div>

              <Title level={4} style={{ margin: '0 0 8px', fontWeight: 800, color: '#0f172a' }}>
                Văn phòng Đại diện Khu 3 ĐH Cần Thơ
              </Title>
              <Paragraph className="text-xs text-slate-600 mb-4 flex items-start gap-2">
                <EnvironmentOutlined className="text-pink-500 mt-0.5 text-sm shrink-0" />
                <span>Số 01 Lý Tự Trọng, Phường An Phú, Quận Ninh Kiều, TP. Cần Thơ</span>
              </Paragraph>

              <div className="space-y-2 pt-3 border-t border-rose-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Hotline tư vấn:</span>
                  <span className="font-bold text-rose-600">0292.3838.999</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-medium text-slate-700">ctu.minhtu@gmail.com</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Giờ mở cửa:</span>
                  <span className="font-medium text-emerald-600">08:00 - 21:00 (Thứ 2 - Thứ 7)</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </section>

      {/* 6. CALL TO ACTION & REGISTRATION BANNER */}
      <section className="rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 text-white text-center shadow-lg shadow-rose-500/20">
        <div className="max-w-2xl mx-auto space-y-4">
          <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 900 }}>
            Sẵn Sàng Chinh Phục Tiếng Nhật Ngay Hôm Nay? 🌸
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15 }}>
            Đăng ký tham gia bài kiểm tra năng lực đầu vào miễn phí và nhận tư vấn lộ trình học phù hợp nhất với mục tiêu của bạn.
          </Paragraph>
          <Space wrap size="middle" className="pt-2 justify-center">
            <Link to="/register">
              <Button
                size="large"
                className="h-12 px-8 rounded-xl font-bold bg-white text-rose-600 hover:bg-rose-50 border-none shadow-md"
              >
                Đăng Ký Học Thử Miễn Phí
              </Button>
            </Link>
            <a href="#courses">
              <Button
                ghost
                size="large"
                className="h-12 px-8 rounded-xl font-bold border-white/80 text-white hover:bg-white/10"
              >
                Khám Phá Các Khóa Học
              </Button>
            </a>
          </Space>
        </div>
      </section>

      {/* Modal Quên mật khẩu với xác thực OTP qua email */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        defaultEmail={loginForm.getFieldValue('email')}
        onSuccess={(recoveredEmail) => {
          loginForm.setFieldsValue({ email: recoveredEmail });
          message.success('Đã cập nhật mật khẩu mới! Vui lòng đăng nhập.');
        }}
      />
    </div>
  );
};
