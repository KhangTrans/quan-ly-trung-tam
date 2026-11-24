import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Check,
} from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { OtpModal } from '../../components/auth/OtpModal';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field Errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);

  // Global status
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // OTP Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registeredOtpData, setRegisteredOtpData] = useState<{
    otpToken: string;
    expiresInMinutes: number;
    devOtp?: string;
  } | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Chưa nhập', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8 && /[A-Z]/.test(pass)) score += 1;
    if (/\d/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score === 1) return { score: 1, label: 'Yếu', color: 'bg-red-400' };
    if (score === 2) return { score: 2, label: 'Khá', color: 'bg-amber-400' };
    return { score: 3, label: 'Mạnh', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const validateName = (val: string) => {
    if (!val.trim()) {
      setNameError('Vui lòng nhập họ và tên.');
      return false;
    }
    if (val.trim().length < 2) {
      setNameError('Họ và tên phải có ít nhất 2 ký tự.');
      return false;
    }
    setNameError(null);
    return true;
  };

  const validateEmail = (val: string) => {
    if (!val.trim()) {
      setEmailError('Vui lòng nhập địa chỉ email.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setEmailError('Email không đúng định dạng.');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePhone = (val: string) => {
    if (!val.trim()) {
      setPhoneError(null);
      return true; // SĐT là trường tùy chọn theo API
    }
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(val)) {
      setPhoneError('Số điện thoại không hợp lệ (ví dụ: 0901234567).');
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError('Vui lòng nhập mật khẩu.');
      return false;
    }
    if (val.length < 6) {
      setPasswordError('Mật khẩu phải có tối thiểu 6 ký tự.');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const validateConfirmPassword = (val: string, passVal: string = password) => {
    if (!val) {
      setConfirmPasswordError('Vui lòng xác nhận mật khẩu.');
      return false;
    }
    if (val !== passVal) {
      setConfirmPasswordError('Mật khẩu xác nhận không khớp.');
      return false;
    }
    setConfirmPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setTermsError(null);

    const isNameOk = validateName(name);
    const isEmailOk = validateEmail(email);
    const isPhoneOk = validatePhone(phone);
    const isPassOk = validatePassword(password);
    const isConfirmOk = validateConfirmPassword(confirmPassword, password);

    if (!agreeTerms) {
      setTermsError('Bạn cần đồng ý với điều khoản sử dụng để đăng ký.');
      return;
    }

    if (!isNameOk || !isEmailOk || !isPhoneOk || !isPassOk || !isConfirmOk) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
        role,
      });

      setRegisteredOtpData({
        otpToken: result.otpToken,
        expiresInMinutes: result.expiresInMinutes || 5,
        devOtp: result.devOtp,
      });

      setFormSuccess(
        result.message ||
          'Đăng ký thành công! Mã OTP xác thực đã được gửi về email của bạn. Vui lòng nhập OTP để hoàn tất.'
      );
      setShowOtpModal(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Đăng ký không thành công. Vui lòng thử lại sau.';
      setFormError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Tạo tài khoản mới 🌸"
      subtitle="Đăng ký thành viên để bắt đầu các khóa học tiếng Nhật chất lượng cao"
    >
      {/* Alert Error */}
      {formError && (
        <div
          role="alert"
          className="mb-4 p-3.5 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <p className="font-semibold">{formError}</p>
        </div>
      )}

      {/* Alert Success */}
      {formSuccess && (
        <div
          role="status"
          className="mb-4 p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <p className="font-semibold">{formSuccess}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {/* Role Selector Segment */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Bạn đăng ký với vai trò:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                role === 'student'
                  ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-xs ring-2 ring-rose-400/20'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50/30'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-rose-500" />
              <span>Học viên (Student)</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                role === 'teacher'
                  ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-xs ring-2 ring-rose-400/20'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50/30'
              }`}
            >
              <UserIcon className="w-4 h-4 text-pink-500" />
              <span>Giảng viên (Sensei)</span>
            </button>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1">
            Họ và tên <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <UserIcon className="w-4 h-4" />
            </div>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) validateName(e.target.value);
              }}
              onBlur={() => validateName(name)}
              placeholder="Nguyễn Văn A"
              aria-invalid={!!nameError}
              aria-describedby={nameError ? 'reg-name-error' : undefined}
              className={`w-full pl-10 pr-4 py-2 text-sm bg-white border rounded-xl shadow-xs outline-none transition-all ${
                nameError
                  ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                  : 'border-rose-200/80 hover:border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              }`}
            />
          </div>
          {nameError && (
            <p id="reg-name-error" className="text-red-500 text-[11px] mt-1 pl-1">
              {nameError}
            </p>
          )}
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1">
              Địa chỉ Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                onBlur={() => validateEmail(email)}
                placeholder="email@gmail.com"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'reg-email-error' : undefined}
                className={`w-full pl-10 pr-3 py-2 text-sm bg-white border rounded-xl shadow-xs outline-none transition-all ${
                  emailError
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                    : 'border-rose-200/80 hover:border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                }`}
              />
            </div>
            {emailError && (
              <p id="reg-email-error" className="text-red-500 text-[11px] mt-1 pl-1">
                {emailError}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-700 mb-1">
              Số điện thoại <span className="text-slate-400 text-[10px] font-normal">(tùy chọn)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="reg-phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (phoneError) validatePhone(e.target.value);
                }}
                onBlur={() => validatePhone(phone)}
                placeholder="0901234567"
                aria-invalid={!!phoneError}
                aria-describedby={phoneError ? 'reg-phone-error' : undefined}
                className={`w-full pl-10 pr-3 py-2 text-sm bg-white border rounded-xl shadow-xs outline-none transition-all ${
                  phoneError
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                    : 'border-rose-200/80 hover:border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                }`}
              />
            </div>
            {phoneError && (
              <p id="reg-phone-error" className="text-red-500 text-[11px] mt-1 pl-1">
                {phoneError}
              </p>
            )}
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 mb-1">
            Mật khẩu <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) validatePassword(e.target.value);
                if (confirmPassword) validateConfirmPassword(confirmPassword, e.target.value);
              }}
              onBlur={() => validatePassword(password)}
              placeholder="Tối thiểu 6 ký tự..."
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? 'reg-password-error' : undefined}
              className={`w-full pl-10 pr-10 py-2 text-sm bg-white border rounded-xl shadow-xs outline-none transition-all ${
                passwordError
                  ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                  : 'border-rose-200/80 hover:border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password strength visual meter */}
          {password && (
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Độ an toàn:</span>
                <span className="font-semibold text-slate-700">{strength.label}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                <div
                  className={`h-full transition-all duration-300 ${
                    strength.score >= 1 ? strength.color : 'bg-transparent'
                  } w-1/3 rounded-full`}
                />
                <div
                  className={`h-full transition-all duration-300 ${
                    strength.score >= 2 ? strength.color : 'bg-transparent'
                  } w-1/3 rounded-full`}
                />
                <div
                  className={`h-full transition-all duration-300 ${
                    strength.score >= 3 ? strength.color : 'bg-transparent'
                  } w-1/3 rounded-full`}
                />
              </div>
            </div>
          )}

          {passwordError && (
            <p id="reg-password-error" className="text-red-500 text-[11px] mt-1 pl-1">
              {passwordError}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-slate-700 mb-1">
            Xác nhận mật khẩu <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="reg-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmPasswordError) validateConfirmPassword(e.target.value);
              }}
              onBlur={() => validateConfirmPassword(confirmPassword)}
              placeholder="Nhập lại mật khẩu..."
              aria-invalid={!!confirmPasswordError}
              aria-describedby={confirmPasswordError ? 'reg-confirm-error' : undefined}
              className={`w-full pl-10 pr-10 py-2 text-sm bg-white border rounded-xl shadow-xs outline-none transition-all ${
                confirmPasswordError
                  ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                  : confirmPassword && confirmPassword === password
                  ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-200'
                  : 'border-rose-200/80 hover:border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPasswordError && (
            <p id="reg-confirm-error" className="text-red-500 text-[11px] mt-1 pl-1">
              {confirmPasswordError}
            </p>
          )}
          {confirmPassword && confirmPassword === password && !confirmPasswordError && (
            <p className="text-emerald-600 text-[11px] mt-1 pl-1 flex items-center gap-1 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>Mật khẩu trùng khớp</span>
            </p>
          )}
        </div>

        {/* Terms and conditions checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (e.target.checked) setTermsError(null);
              }}
              className="mt-0.5 w-4 h-4 rounded text-rose-600 border-rose-300 focus:ring-rose-500 accent-rose-600"
            />
            <span className="text-xs text-slate-600 leading-tight">
              Tôi đồng ý với{' '}
              <a href="#terms" className="text-rose-600 font-semibold hover:underline">
                Điều khoản dịch vụ
              </a>{' '}
              và{' '}
              <a href="#privacy" className="text-rose-600 font-semibold hover:underline">
                Chính sách bảo mật
              </a>{' '}
              của Minh Tú Center
            </span>
          </label>
          {termsError && (
            <p className="text-red-500 text-[11px] mt-1 pl-6">
              {termsError}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-rose-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang gửi thông tin đăng ký...</span>
            </>
          ) : (
            <>
              <span>Đăng ký tài khoản</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Switch to Login */}
        <p className="text-center text-xs text-slate-500 pt-2">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="font-bold text-rose-600 hover:text-rose-700 hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </form>

      {/* OTP Verification Modal */}
      {registeredOtpData && (
        <OtpModal
          isOpen={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          email={email}
          initialOtpToken={registeredOtpData.otpToken}
          initialExpiresInMinutes={registeredOtpData.expiresInMinutes}
          devOtp={registeredOtpData.devOtp}
          onSuccess={() => {
            setShowOtpModal(false);
            setFormSuccess('Xác thực tài khoản thành công! Đang chuyển hướng...');
            setTimeout(() => navigate('/'), 1000);
          }}
        />
      )}
    </AuthLayout>
  );
};
