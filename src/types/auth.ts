export type UserRole = 'admin' | 'staff' | 'teacher' | 'student';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  otpToken: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface AuthSuccessData {
  user: User;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface RegisterSuccessData {
  user: User;
  isEmailVerified: boolean;
  otpToken: string;
  expiresInMinutes: number;
  message?: string;
  devOtp?: string;
}

export interface ResendOtpSuccessData {
  email: string;
  otpToken: string;
  expiresInMinutes: number;
  message?: string;
  devOtp?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponseData {
  email: string;
  otpToken: string;
  expiresInMinutes: number;
  message?: string;
  devOtp?: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  otpToken: string;
  newPassword: string;
}

