import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Avatar,
  Tag,
  Button,
  Form,
  Input,
  Typography,
  Divider,
  Alert,
  message,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  CameraOutlined,
  SaveOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';

const { Title, Text, Paragraph } = Typography;

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated, isLoading } = useAuth();

  // Tab đang chọn bên trái: 'info' (Đổi thông tin) hoặc 'password' (Đổi mật khẩu)
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Forms
  const [infoForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Loading & Alerts
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [infoAlert, setInfoAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [passwordAlert, setPasswordAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !user) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (user) {
      infoForm.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role === 'admin' ? 'Quản trị viên (Admin)' : user.role === 'teacher' ? 'Giảng viên (Sensei)' : 'Học viên (Student)',
      });
      setAvatarUrl(user.avatar || '');
    }
  }, [user, infoForm]);

  // Xử lý tải ảnh đại diện từ thiết bị
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        message.error('Ảnh tải lên không được vượt quá 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setAvatarUrl(base64);
        try {
          const res = await authService.updateProfile({ avatar: base64 });
          updateUser(res.data);
          message.success('Cập nhật ảnh đại diện thành công!');
        } catch (err: any) {
          console.error('Error updating avatar:', err);
          message.error(err.response?.data?.message || 'Không thể cập nhật ảnh đại diện lên máy chủ.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. Lưu thay đổi thông tin cá nhân
  const handleSaveInfo = async (values: { name: string; phone?: string }) => {
    setIsUpdatingInfo(true);
    setInfoAlert(null);

    try {
      const res = await authService.updateProfile({
        name: values.name.trim(),
        phone: values.phone?.trim(),
        avatar: avatarUrl,
      });

      updateUser(res.data);
      setInfoAlert({ type: 'success', message: 'Cập nhật thông tin cá nhân thành công!' });
      message.success('Cập nhật thông tin thành công!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.';
      setInfoAlert({ type: 'error', message: msg });
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  // Khôi phục form thông tin cá nhân
  const handleCancelInfo = () => {
    if (user) {
      infoForm.setFieldsValue({
        name: user.name,
        phone: user.phone || '',
      });
      setAvatarUrl(user.avatar || '');
    }
    setInfoAlert(null);
    message.info('Đã khôi phục thông tin ban đầu.');
  };

  // 2. Cập nhật mật khẩu mới
  const handleSavePassword = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      setPasswordAlert({ type: 'error', message: 'Mật khẩu xác nhận không trùng khớp.' });
      return;
    }

    if (values.newPassword.length < 6) {
      setPasswordAlert({ type: 'error', message: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordAlert(null);

    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      setPasswordAlert({ type: 'success', message: 'Đổi mật khẩu thành công!' });
      message.success('Đổi mật khẩu thành công!');
      passwordForm.resetFields();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Mật khẩu hiện tại không chính xác.';
      setPasswordAlert({ type: 'error', message: msg });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Hủy form đổi mật khẩu
  const handleCancelPassword = () => {
    passwordForm.resetFields();
    setPasswordAlert(null);
    message.info('Đã hủy thay đổi mật khẩu.');
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return <Tag color="magenta" className="px-2.5 py-0.5 rounded-full font-bold">👑 Quản trị viên (ADMIN)</Tag>;
      case 'teacher':
        return <Tag color="purple" className="px-2.5 py-0.5 rounded-full font-bold">🧑‍🏫 Giảng viên (Sensei)</Tag>;
      case 'staff':
        return <Tag color="blue" className="px-2.5 py-0.5 rounded-full font-bold">💼 Nhân viên (Staff)</Tag>;
      default:
        return <Tag color="pink" className="px-2.5 py-0.5 rounded-full font-bold">🎓 Học viên (Student)</Tag>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9FA] py-1 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              if (user?.role === 'admin' || user?.role === 'staff') {
                navigate('/admin/dashboard');
              } else {
                navigate('/');
              }
            }}
            className="rounded-xl border-rose-200 text-slate-700 hover:text-rose-600 hover:border-rose-300"
          >
            Quay lại {user?.role === 'admin' ? 'Bảng điều khiển' : 'Trang chủ'}
          </Button>
        </div>

        {/* MAIN 2-COLUMN PROFILE LAYOUT */}
        <Row gutter={[24, 24]}>
          {/* ==================== CỘT BÊN TRÁI: AVATAR, THÔNG TIN TỔNG QUAN & NÚT CHỌN TAB ==================== */}
          <Col xs={24} md={9} lg={8}>
            <Card
              className="rounded-3xl border-rose-100/90 shadow-sm overflow-hidden bg-white/95 backdrop-blur-md"
              styles={{ body: { padding: '28px 20px' } }}
            >
              {/* Avatar Section */}
              <div className="flex flex-col items-center text-center">
                <div className="relative group mb-4">
                  <Avatar
                    size={110}
                    src={avatarUrl}
                    style={{ backgroundColor: '#e11d48', fontSize: 40, fontWeight: 800 }}
                    className="border-4 border-rose-100 shadow-md transition-transform group-hover:scale-105"
                  >
                    {!avatarUrl && user?.name ? user.name.charAt(0).toUpperCase() : <UserOutlined />}
                  </Avatar>

                  {/* Nút thay đổi ảnh đại diện */}
                  <Tooltip title="Nhấn để thay đổi ảnh đại diện">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md cursor-pointer border-2 border-white transition-all hover:scale-110"
                      aria-label="Thay đổi ảnh đại diện"
                    >
                      <CameraOutlined className="text-base" />
                    </button>
                  </Tooltip>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                <Title level={4} style={{ margin: '0 0 4px', fontWeight: 800, color: '#0f172a' }}>
                  {user?.name || 'Họ và Tên'}
                </Title>
                <Text type="secondary" className="text-xs block mb-2">{user?.email}</Text>
                <div className="mb-2">
                  {getRoleBadge(user?.role)}
                </div>
                
              </div>

              <Divider className="my-2" />

              {/* Nút điều hướng Tab bên trái: "Đổi thông tin" & "Đổi mật khẩu" */}
              <div className="space-y-2 pt-2">
                <Button
                  block
                  icon={<UserOutlined />}
                  onClick={() => {
                    setActiveTab('info');
                    setInfoAlert(null);
                  }}
                  className={`h-11 rounded-xl font-bold flex items-center justify-start text-sm transition-all cursor-pointer ${
                    activeTab === 'info'
                      ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-xs ring-2 ring-rose-400/20'
                      : 'border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50/30'
                  }`}
                >
                  Đổi thông tin cá nhân
                </Button>

                <Button
                  block
                  icon={<LockOutlined />}
                  onClick={() => {
                    setActiveTab('password');
                    setPasswordAlert(null);
                  }}
                  className={`h-11 rounded-xl font-bold flex items-center justify-start text-sm transition-all cursor-pointer ${
                    activeTab === 'password'
                      ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-xs ring-2 ring-rose-400/20'
                      : 'border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50/30'
                  }`}
                >
                  Đổi mật khẩu
                </Button>
              </div>
            </Card>
          </Col>

          {/* ==================== CỘT BÊN PHẢI: FORM CHỈNH SỬA THAY ĐỔI THEO TAB ==================== */}
          <Col xs={24} md={15} lg={16}>
            <Card
              className="rounded-3xl border-rose-100/90 shadow-sm overflow-hidden bg-white/95 backdrop-blur-md min-h-[460px]"
              styles={{ body: { padding: '32px' } }}
            >
              {/* TRƯỜNG HỢP 1: FORM ĐỔI THÔNG TIN CÁ NHÂN */}
              {activeTab === 'info' && (
                <div className="space-y-5">
                  <div className="border-b border-rose-100 pb-3">
                    <Title level={4} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
                      Cập Nhật Thông Tin Cá Nhân
                    </Title>
                    <Paragraph type="secondary" style={{ fontSize: 13, margin: '4px 0 0' }}>
                      Quản lý họ tên, số điện thoại và thông tin liên hệ của bạn tại trung tâm
                    </Paragraph>
                  </div>

                  {infoAlert && (
                    <Alert
                      message={infoAlert.message}
                      type={infoAlert.type}
                      showIcon
                      closable
                      onClose={() => setInfoAlert(null)}
                      className="rounded-xl text-xs"
                    />
                  )}

                  <Form
                    form={infoForm}
                    layout="vertical"
                    onFinish={handleSaveInfo}
                    requiredMark={false}
                    size="large"
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="name"
                          label={
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <UserOutlined className="text-rose-500" />
                              <span>Họ và tên <span className="text-rose-500">*</span></span>
                            </span>
                          }
                          rules={[
                            { required: true, message: 'Họ và tên không được để trống' },
                            { min: 2, message: 'Họ tên tối thiểu 2 ký tự' },
                          ]}
                        >
                          <Input
                            placeholder="Nguyễn Văn A"
                            className="rounded-xl border-rose-200 hover:border-rose-300 focus:border-rose-500"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="phone"
                          label={
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <PhoneOutlined className="text-rose-500" />
                              <span>Số điện thoại</span>
                            </span>
                          }
                        >
                          <Input
                            placeholder="0901234567"
                            className="rounded-xl border-rose-200 hover:border-rose-300 focus:border-rose-500"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="email"
                          label={
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <MailOutlined className="text-rose-500" />
                              <span>Địa chỉ Email (Định danh tài khoản)</span>
                            </span>
                          }
                        >
                          <Input
                            disabled
                            className="rounded-xl bg-slate-50 text-slate-600 border-slate-200 font-medium"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="role"
                          label={
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <CrownOutlined className="text-rose-500" />
                              <span>Vai trò hệ thống</span>
                            </span>
                          }
                        >
                          <Input
                            disabled
                            className="rounded-xl bg-slate-50 text-slate-600 border-slate-200 font-medium"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* NÚT LƯU & NÚT HỦY */}
                    <div className="pt-4 border-t border-rose-100 flex items-center justify-end gap-3">
                      <Button
                        onClick={handleCancelInfo}
                        icon={<CloseOutlined />}
                        className="h-10 px-5 rounded-xl font-semibold border-slate-300 text-slate-600 hover:bg-slate-50"
                      >
                        Hủy
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isUpdatingInfo}
                        icon={<SaveOutlined />}
                        className="h-10 px-6 rounded-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 border-none shadow-md shadow-rose-500/25"
                      >
                        Lưu Thay Đổi
                      </Button>
                    </div>
                  </Form>
                </div>
              )}

              {/* TRƯỜNG HỢP 2: FORM ĐỔI MẬT KHẨU */}
              {activeTab === 'password' && (
                <div className="space-y-5">
                  <div className="border-b border-rose-100 pb-3">
                    <Title level={4} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
                      Đổi Mật Khẩu Đăng Nhập
                    </Title>
                    <Paragraph type="secondary" style={{ fontSize: 13, margin: '4px 0 0' }}>
                      Cập nhật mật khẩu định kỳ để bảo vệ tài khoản và dữ liệu học tập của bạn
                    </Paragraph>
                  </div>

                  {passwordAlert && (
                    <Alert
                      message={passwordAlert.message}
                      type={passwordAlert.type}
                      showIcon
                      closable
                      onClose={() => setPasswordAlert(null)}
                      className="rounded-xl text-xs"
                    />
                  )}

                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleSavePassword}
                    requiredMark={false}
                    size="large"
                  >
                    <Form.Item
                      name="currentPassword"
                      label={
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <LockOutlined className="text-rose-500" />
                          <span>Mật khẩu hiện tại <span className="text-rose-500">*</span></span>
                        </span>
                      }
                      rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                    >
                      <Input.Password
                        placeholder="Nhập mật khẩu hiện tại..."
                        className="rounded-xl border-rose-200 hover:border-rose-300 focus:border-rose-500"
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="newPassword"
                          label={
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <LockOutlined className="text-rose-500" />
                              <span>Mật khẩu mới (Tối thiểu 6 ký tự) <span className="text-rose-500">*</span></span>
                            </span>
                          }
                          rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                            { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
                          ]}
                        >
                          <Input.Password
                            placeholder="Nhập mật khẩu mới..."
                            className="rounded-xl border-rose-200 hover:border-rose-300 focus:border-rose-500"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="confirmPassword"
                          label={
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <LockOutlined className="text-rose-500" />
                              <span>Xác nhận mật khẩu mới <span className="text-rose-500">*</span></span>
                            </span>
                          }
                          rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới' }]}
                        >
                          <Input.Password
                            placeholder="Nhập lại mật khẩu mới..."
                            className="rounded-xl border-rose-200 hover:border-rose-300 focus:border-rose-500"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* NÚT LƯU & NÚT HỦY */}
                    <div className="pt-4 border-t border-rose-100 flex items-center justify-end gap-3">
                      <Button
                        onClick={handleCancelPassword}
                        icon={<CloseOutlined />}
                        className="h-10 px-5 rounded-xl font-semibold border-slate-300 text-slate-600 hover:bg-slate-50"
                      >
                        Hủy
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isUpdatingPassword}
                        icon={<SaveOutlined />}
                        className="h-10 px-6 rounded-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 border-none shadow-md shadow-rose-500/25"
                      >
                        Cập Nhật Mật Khẩu
                      </Button>
                    </div>
                  </Form>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};
