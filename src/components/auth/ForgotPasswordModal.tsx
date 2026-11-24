import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Alert,
  Typography,
  message,
} from 'antd';
import {
  MailOutlined,
  LockOutlined,
  KeyOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { authService } from '../../services/auth.service';

const { Paragraph } = Typography;

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  onSuccess?: (email: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
  onSuccess,
}) => {
  // Step 1: Nhập email gửi OTP
  // Step 2: Nhập và xác thực mã OTP
  // Step 3: Sau khi OTP đúng, mở màn hình nhập mật khẩu mới
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState(defaultEmail);
  const [otpToken, setOtpToken] = useState('');
  const [devOtp, setDevOtp] = useState<string | undefined>(undefined);
  const [otpValue, setOtpValue] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset state when opened
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEmail(defaultEmail);
      setOtpValue('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, defaultEmail]);

  // BƯỚC 1: Gửi mã OTP xác thực tới email
  const handleSendOtp = async (values?: { email: string }) => {
    const targetEmail = values?.email || email;
    if (!targetEmail) {
      setErrorMessage('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authService.forgotPassword({ email: targetEmail.trim().toLowerCase() });
      setEmail(targetEmail.trim().toLowerCase());
      setOtpToken(res.data.otpToken);
      if (res.data.devOtp) {
        setDevOtp(res.data.devOtp);
      }
      setStep(2);
      message.success('Mã OTP xác thực đã được gửi tới email của bạn!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không tìm thấy tài khoản với email này.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi lại mã OTP
  const handleResendOtp = async () => {
    setIsResending(true);
    setErrorMessage(null);
    try {
      const res = await authService.forgotPassword({ email });
      setOtpToken(res.data.otpToken);
      if (res.data.devOtp) setDevOtp(res.data.devOtp);
      message.success('Mã OTP mới đã được gửi lại vào email.');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể gửi lại mã OTP.');
    } finally {
      setIsResending(false);
    }
  };

  // BƯỚC 2: Xác thực mã OTP - Chỉ khi OTP đúng mới chuyển sang Bước 3 (Nhập mật khẩu mới)
  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length !== 6) {
      setErrorMessage('Vui lòng nhập đầy đủ 6 chữ số mã OTP.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.verifyResetOtp({
        email,
        otp: otpValue,
        otpToken,
      });

      message.success('Xác thực mã OTP thành công!');
      // NHẬP ĐÚNG OTP MỚI MỞ BƯỚC NHẬP MẬT KHẨU MỚI
      setStep(3);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // BƯỚC 3: Cập nhật mật khẩu mới
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.resetPassword({
        email,
        otp: otpValue,
        otpToken,
        newPassword,
      });

      setSuccessMessage('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
      message.success('Đặt lại mật khẩu thành công!');

      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess(email);
      }, 1400);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex items-center gap-2 text-rose-600">
            <MailOutlined className="text-lg" />
            <span className="font-bold">Khôi phục Mật khẩu</span>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center gap-2 text-rose-600">
            <SafetyCertificateOutlined className="text-lg" />
            <span className="font-bold">Xác thực Mã OTP Email</span>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center gap-2 text-emerald-600">
            <KeyOutlined className="text-lg" />
            <span className="font-bold">Thiết Lập Mật Khẩu Mới</span>
          </div>
        );
    }
  };

  return (
    <Modal
      title={getModalTitle()}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      className="rounded-3xl overflow-hidden"
    >
      <div className="py-2 space-y-4">
        {errorMessage && (
          <Alert
            message={errorMessage}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMessage(null)}
            className="rounded-xl border-red-200 text-xs"
          />
        )}

        {successMessage && (
          <Alert
            message={successMessage}
            type="success"
            showIcon
            className="rounded-xl border-emerald-200 text-xs"
          />
        )}

        {/* ==================== BƯỚC 1: NHẬP EMAIL ==================== */}
        {step === 1 && (
          <Form
            layout="vertical"
            initialValues={{ email: defaultEmail }}
            onFinish={handleSendOtp}
            requiredMark={false}
          >
            <Paragraph type="secondary" className="text-xs">
              Vui lòng nhập địa chỉ email đã đăng ký tài khoản. Hệ thống sẽ gửi một mã OTP gồm 6 chữ số về email của bạn.
            </Paragraph>

            <Form.Item
              name="email"
              label={
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <MailOutlined className="text-rose-500" />
                  <span>Email của bạn</span>
                </span>
              }
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input
                placeholder="vidu@gmail.com"
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border-rose-200 h-10"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              icon={<ArrowRightOutlined />}
              className="h-10 rounded-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 border-none shadow-md shadow-rose-500/25 mt-2"
            >
              Gửi Mã Xác Thực OTP Về Email
            </Button>
          </Form>
        )}

        {/* ==================== BƯỚC 2: NHẬP VÀ XÁC THỰC MÃ OTP ==================== */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-between text-xs text-rose-800">
              <span className="truncate max-w-[260px]">
                Mã đã gửi tới: <strong>{email}</strong>
              </span>
              <Button
                type="link"
                size="small"
                onClick={() => setStep(1)}
                className="text-xs text-rose-600 p-0 font-medium"
              >
                Đổi email
              </Button>
            </div>

            {devOtp && (
              <Alert
                message={
                  <div className="flex items-center justify-between text-xs">
                    <span>Mã OTP thử nghiệm (Dev): <strong className="font-mono text-rose-700">{devOtp}</strong></span>
                    <Button
                      size="small"
                      type="link"
                      onClick={() => setOtpValue(devOtp)}
                      className="p-0 text-xs font-bold"
                    >
                      Điền nhanh
                    </Button>
                  </div>
                }
                type="warning"
                showIcon
                className="rounded-xl border-amber-200"
              />
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <SafetyCertificateOutlined className="text-rose-500" />
                <span>Nhập mã OTP 6 chữ số:</span>
              </label>
              <div className="flex justify-center py-2">
                <Input.OTP
                  length={6}
                  value={otpValue}
                  onChange={(val) => setOtpValue(val)}
                  size="large"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <ClockCircleOutlined className="text-rose-500" />
                <span>Hiệu lực 5 phút</span>
              </span>

              <Button
                type="link"
                size="small"
                icon={<ReloadOutlined spin={isResending} />}
                onClick={handleResendOtp}
                disabled={isResending}
                className="text-rose-600 font-semibold p-0 text-xs"
              >
                Gửi lại mã OTP
              </Button>
            </div>

            <Button
              type="primary"
              onClick={handleVerifyOtp}
              loading={isLoading}
              block
              icon={<ArrowRightOutlined />}
              className="h-10 rounded-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 border-none shadow-md shadow-rose-500/25 mt-3"
            >
              Xác Thực Mã OTP & Tiếp Tục
            </Button>
          </div>
        )}

        {/* ==================== BƯỚC 3: NHẬP ĐÚNG OTP MỚI MỞ BƯỚC NÀY ==================== */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircleOutlined className="text-emerald-600 text-base shrink-0" />
              <span>Xác thực OTP thành công cho <strong>{email}</strong>! Vui lòng nhập mật khẩu mới:</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <LockOutlined className="text-rose-500" />
                <span>Mật khẩu mới (Tối thiểu 6 ký tự):</span>
              </label>
              <Input.Password
                placeholder="Nhập mật khẩu mới..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl border-rose-200 h-10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <LockOutlined className="text-rose-500" />
                <span>Xác nhận mật khẩu mới:</span>
              </label>
              <Input.Password
                placeholder="Nhập lại mật khẩu mới..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl border-rose-200 h-10"
              />
            </div>

            <Button
              type="primary"
              onClick={handleResetPassword}
              loading={isLoading}
              block
              icon={<CheckCircleOutlined />}
              className="h-10 rounded-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 border-none shadow-md shadow-rose-500/25 mt-3"
            >
              Lưu & Cập Nhật Mật Khẩu Mới
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
