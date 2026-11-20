import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Card,
  Typography,
  Alert,
  Modal,
  message,
} from 'antd';
import {
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  CrownOutlined,
  ArrowRightOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { ForgotPasswordModal } from '../../components/auth/ForgotPasswordModal';

const { Title, Paragraph } = Typography;

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, verifyOtp, resendOtp, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Nếu đã đăng nhập với vai trò quản trị (admin hoặc staff), tự động chuyển hướng vào Dashboard
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && user && (user.role === 'admin' || user.role === 'staff')) {
      const from = (location.state as any)?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthLoading, isAuthenticated, user, navigate, location]);

  // Hiển thị thông báo nếu bị từ chối truy cập hoặc cần đăng nhập lại
  useEffect(() => {
    const state = location.state as any;
    if (state?.forbidden) {
      setErrorMessage('Tài khoản của bạn không có quyền truy cập vào Khu Vực Quản Trị.');
    } else if (state?.from && !isAuthenticated) {
      setErrorMessage('Vui lòng đăng nhập tài khoản quản trị để tiếp tục truy cập trang.');
    }
  }, [location.state, isAuthenticated]);

  // Forgot password modal state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // OTP Modal states (nếu tài khoản admin/staff chưa kích hoạt email)
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [devOtp, setDevOtp] = useState<string | undefined>(undefined);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  const handleAdminLogin = async (values: { email: string; password: string; remember?: boolean }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await login({
        email: values.email.trim(),
        password: values.password,
      });

      const userRole = result.user.role;
      if (userRole === 'student') {
        setErrorMessage(
          'Tài khoản này là Học viên. Vui lòng đăng nhập tại Cổng Học viên bên ngoài.'
        );
        return;
      }

      message.success('Đăng nhập thành công Cổng Quản Trị!');
      setSuccessMessage(`Chào mừng ${result.user.name} (${userRole.toUpperCase()}) quay trở lại!`);
      const destination = (location.state as any)?.from?.pathname || '/admin/dashboard';
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 700);
    } catch (err: any) {
      const status = err.response?.status;
      const resData = err.response?.data;

      if (status === 403 && resData?.data?.otpToken) {
        setTargetEmail(values.email.trim());
        setOtpToken(resData.data.otpToken);
        setDevOtp(resData.data.devOtp);
        setShowOtpModal(true);
        setErrorMessage('Tài khoản quản trị chưa kích hoạt email. Vui lòng xác thực mã OTP vừa gửi.');
        return;
      }

      setErrorMessage(resData?.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length !== 6) {
      message.error('Vui lòng nhập đầy đủ 6 chữ số mã OTP');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const result = await verifyOtp({
        email: targetEmail,
        otp: otpValue,
        otpToken,
      });

      message.success('Xác thực tài khoản thành công!');
      setShowOtpModal(false);

      if (result.user.role === 'student') {
        navigate('/');
      } else {
        const destination = (location.state as any)?.from?.pathname || '/admin/dashboard';
        navigate(destination, { replace: true });
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResendingOtp(true);
    try {
      const res = await resendOtp({ email: targetEmail });
      setOtpToken(res.otpToken);
      if (res.devOtp) setDevOtp(res.devOtp);
      message.success('Mã OTP mới đã được gửi tới email của bạn.');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể gửi lại mã OTP.');
    } finally {
      setIsResendingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9FA] flex flex-col justify-between relative overflow-hidden">
      {/* Background soft ambient blur blobs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-96 h-96 bg-pink-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-rose-100/30 rounded-full blur-2xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-rose-100/70 bg-white/70 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white font-serif font-black shadow-md shadow-rose-500/20">
            明
          </div>
          <div>
            <span className="font-bold text-base text-slate-900 tracking-tight">Minh Tú Center</span>
            <span className="block text-[10px] text-rose-500 font-semibold tracking-wider -mt-0.5">
              HỆ THỐNG QUẢN TRỊ TRUNG TÂM
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/">
            <Button icon={<HomeOutlined />} size="middle" className="rounded-xl border-rose-200 text-rose-700 hover:border-rose-300">
              Về Trang chủ
            </Button>
          </Link>
          <Link to="/login">
            <Button type="default" size="middle" className="rounded-xl border-rose-200 text-slate-700 hover:text-rose-600">
              Cổng Học viên
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-[460px]">
          {/* Executive Card */}
          <Card
            className="shadow-xl shadow-rose-950/5 border border-rose-100/80 rounded-3xl overflow-hidden backdrop-blur-md bg-white/95"
            styles={{ body: { padding: '36px 32px' } }}
          >
            {/* Header branding inside card */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white text-2xl shadow-lg shadow-rose-500/25 mb-3">
                <CrownOutlined />
              </div>
              <div className="space-y-1">
                <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
                  Đăng nhập Quản Trị
                </Title>
                <Paragraph type="secondary" style={{ fontSize: 13, margin: '4px 0 0' }}>
                  Dành riêng cho Quản trị viên, Cán bộ & Giảng viên trung tâm
                </Paragraph>
              </div>
            </div>

            {/* Error & Success Alerts */}
            {errorMessage && (
              <Alert
                message={errorMessage}
                type="error"
                showIcon
                closable
                onClose={() => setErrorMessage(null)}
                className="mb-5 rounded-xl border-red-200"
              />
            )}

            {successMessage && (
              <Alert
                message={successMessage}
                type="success"
                showIcon
                className="mb-5 rounded-xl border-emerald-200"
              />
            )}

            {/* Ant Design Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleAdminLogin}
              initialValues={{ remember: true }}
              requiredMark={false}
              size="large"
            >
              <Form.Item
                name="email"
                label={
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MailOutlined className="text-rose-500 text-sm" />
                    <span>Email</span>
                  </span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập email quản trị' },
                  { type: 'email', message: 'Email không đúng định dạng' },
                ]}
              >
                <Input
                  placeholder="admin@minhtucenter.com"
                  className="rounded-xl border-rose-200 hover:border-rose-300 focus:border-rose-500"
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
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                className="mb-1"
              >
                <Input.Password
                  placeholder="••••••••"
                  className="rounded-xl border-rose-200 hover:border-rose-300 focus:border-rose-500"
                />
              </Form.Item>

              {/* Hàng bên dưới ô input mật khẩu: Ghi nhớ bên trái & Quên mật khẩu bên phải */}
              <div className="flex items-center justify-between mb-4 pt-1">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="text-xs text-slate-600">
                    Ghi nhớ đăng nhập
                  </Checkbox>
                </Form.Item>

                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-semibold cursor-pointer border-none bg-transparent p-0 text-right"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <Form.Item className="mb-1">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  block
                  icon={<ArrowRightOutlined />}
                  className="h-11 rounded-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 border-none shadow-md shadow-rose-500/25"
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Security Guarantee Note */}
          <div className="text-center text-xs text-slate-400 mt-5 space-y-1">
            <p>Hệ thống ghi nhật ký truy cập theo thời gian thực.</p>
            <p>© {new Date().getFullYear()} Minh Tu Nihongo Education System.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-3 text-center border-t border-rose-100 bg-white/60 text-xs text-slate-500">
        Trung tâm Nhật ngữ Minh Tú • Cổng thông tin nội bộ bảo mật
      </footer>

      {/* Modal Quên mật khẩu xác thực OTP qua email */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        defaultEmail={form.getFieldValue('email')}
        onSuccess={(recoveredEmail) => {
          form.setFieldsValue({ email: recoveredEmail });
          message.success('Vui lòng đăng nhập với mật khẩu mới đã đặt!');
        }}
      />

      {/* Antd Modal xác thực OTP cho tài khoản quản trị khi chưa xác thực email */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-600">
            <SafetyCertificateOutlined className="text-xl" />
            <span className="font-bold">Xác thực mã OTP Quản trị</span>
          </div>
        }
        open={showOtpModal}
        onCancel={() => setShowOtpModal(false)}
        footer={null}
        centered
        className="rounded-3xl overflow-hidden"
      >
        <div className="py-4 space-y-4">
          <Paragraph type="secondary" className="text-xs">
            Mã OTP xác thực 6 chữ số đã được gửi tới email quản trị{' '}
            <strong className="text-slate-800">{targetEmail}</strong>. Vui lòng nhập mã để tiếp tục:
          </Paragraph>

          {devOtp && (
            <Alert
              message={
                <div className="flex items-center justify-between text-xs">
                  <span>Mã OTP thử nghiệm (Dev): <strong className="font-mono text-rose-700">{devOtp}</strong></span>
                  <Button size="small" type="link" onClick={() => setOtpValue(devOtp)}>
                    Điền nhanh
                  </Button>
                </div>
              }
              type="warning"
              showIcon
              className="rounded-xl border-amber-200"
            />
          )}

          <div className="flex justify-center py-2">
            <Input.OTP
              length={6}
              value={otpValue}
              onChange={(val) => setOtpValue(val)}
              size="large"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <ClockCircleOutlined className="text-rose-500" />
              <span>Hiệu lực trong 5 phút</span>
            </span>

            <Button
              type="link"
              size="small"
              icon={<ReloadOutlined spin={isResendingOtp} />}
              onClick={handleResendOtp}
              disabled={isResendingOtp}
              className="text-rose-600 font-semibold p-0"
            >
              Gửi lại mã OTP
            </Button>
          </div>

          <Button
            type="primary"
            onClick={handleVerifyOtp}
            loading={isVerifyingOtp}
            block
            size="large"
            className="rounded-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 border-none shadow-md shadow-rose-500/25 mt-4"
          >
            Xác nhận kích hoạt & Đăng nhập
          </Button>
        </div>
      </Modal>
    </div>
  );
};
