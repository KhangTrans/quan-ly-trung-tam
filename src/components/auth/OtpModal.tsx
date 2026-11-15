import React, { useState, useEffect, useRef } from 'react';
import { Mail, Clock, ArrowRight, RefreshCw, X, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  initialOtpToken: string;
  initialExpiresInMinutes?: number;
  devOtp?: string;
  onSuccess?: () => void;
}

export const OtpModal: React.FC<OtpModalProps> = ({
  isOpen,
  onClose,
  email,
  initialOtpToken,
  initialExpiresInMinutes = 5,
  devOtp: initialDevOtp,
  onSuccess,
}) => {
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  const [otpToken, setOtpToken] = useState(initialOtpToken);
  const [devOtp, setDevOtp] = useState<string | undefined>(initialDevOtp);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(initialExpiresInMinutes * 60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Đồng bộ otpToken và devOtp khi prop thay đổi
  useEffect(() => {
    setOtpToken(initialOtpToken);
    setDevOtp(initialDevOtp);
    setCountdown(initialExpiresInMinutes * 60);
    setDigits(['', '', '', '', '', '']);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialOtpToken, initialDevOtp, initialExpiresInMinutes, isOpen]);

  // Bộ đếm ngược thời gian hết hạn OTP
  useEffect(() => {
    if (!isOpen || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  // Tự động focus vào ô đầu tiên khi mở modal
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDigitChange = (index: number, value: string) => {
    // Chỉ chấp nhận chữ số
    const cleanValue = value.replace(/\D/g, '');
    const newDigits = [...digits];

    if (cleanValue.length > 1) {
      // Trường hợp người dùng paste cả chuỗi số
      const pastedDigits = cleanValue.slice(0, 6).split('');
      pastedDigits.forEach((char, idx) => {
        if (index + idx < 6) {
          newDigits[index + idx] = char;
        }
      });
      setDigits(newDigits);
      const nextIndex = Math.min(index + pastedDigits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = cleanValue;
    setDigits(newDigits);

    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = ['', '', '', '', '', ''];
    pastedData.split('').forEach((char, idx) => {
      newDigits[idx] = char;
    });
    setDigits(newDigits);

    const focusIdx = Math.min(pastedData.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const otp = digits.join('');
    if (otp.length !== 6) {
      setErrorMessage('Vui lòng nhập đầy đủ 6 chữ số mã OTP.');
      return;
    }

    if (!otpToken) {
      setErrorMessage('Thiếu token phiên xác thực. Vui lòng bấm gửi lại mã.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      await verifyOtp({
        email,
        otp,
        otpToken,
      });

      setSuccessMessage('Xác thực tài khoản thành công! Đang chuyển hướng...');
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
          navigate('/');
        }
      }, 1200);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn. Vui lòng thử lại.';
      setErrorMessage(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 240) {
      // Cho phép gửi lại nếu đã qua ít nhất 60s kể từ lúc gửi (countdown < 240 trên tổng 300)
      setErrorMessage('Vui lòng đợi một lát trước khi yêu cầu gửi lại mã mới.');
      return;
    }

    setIsResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await resendOtp({ email });
      setOtpToken(res.otpToken);
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setCountdown((res.expiresInMinutes || 5) * 60);
      setDigits(['', '', '', '', '', '']);
      setSuccessMessage('Mã OTP mới đã được gửi tới email của bạn.');
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.';
      setErrorMessage(msg);
    } finally {
      setIsResending(false);
    }
  };

  const fillDevOtp = () => {
    if (devOtp && devOtp.length === 6) {
      setDigits(devOtp.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-100 overflow-hidden">
        {/* Soft decorative glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-200/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-pink-200/50 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-rose-50 transition-colors"
          aria-label="Đóng cửa sổ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/25 text-white mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Xác thực mã OTP</h3>
          <p className="text-sm text-slate-500 mt-1.5">
            Nhập mã gồm 6 chữ số đã được gửi tới hòm thư
          </p>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-xs font-medium text-rose-700">
            <Mail className="w-3.5 h-3.5 text-rose-500" />
            <span className="truncate max-w-[260px]">{email}</span>
          </div>
        </div>

        {/* Development Helper Badge */}
        {devOtp && (
          <div className="mb-5 p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Mã thử nghiệm (Môi trường Dev): <strong className="font-mono text-sm tracking-wider text-amber-800">{devOtp}</strong></span>
            </div>
            <button
              type="button"
              onClick={fillDevOtp}
              className="text-xs bg-amber-200/70 hover:bg-amber-200 text-amber-800 px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0"
            >
              Điền nhanh
            </button>
          </div>
        )}

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
            <span className="font-semibold shrink-0">Lỗi:</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleVerify}>
          <div className="flex justify-between gap-2 sm:gap-2.5 mb-6" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border border-rose-200 bg-white text-slate-900 shadow-sm focus:border-rose-500 focus:ring-3 focus:ring-rose-500/20 outline-none transition-all"
                autoComplete="off"
                aria-label={`Chữ số thứ ${index + 1}`}
              />
            ))}
          </div>

          {/* Countdown & Resend */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-6">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-rose-500" />
              <span>Hiệu lực còn: <strong className="text-slate-800 font-mono">{formatTime(countdown)}</strong></span>
            </div>

            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || countdown > 240}
              className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>Gửi lại mã</span>
            </button>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isVerifying || digits.some((d) => !d)}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 transition-all"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang kiểm tra...</span>
              </>
            ) : (
              <>
                <span>Xác nhận & Hoàn tất</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          Nếu không thấy email trong Hộp thư đến, vui lòng kiểm tra thư mục Spam hoặc Quảng cáo.
        </p>
      </div>
    </div>
  );
};
