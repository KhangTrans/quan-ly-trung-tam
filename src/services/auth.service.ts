import apiClient from './api';
import type {
  ApiResponse,
  AuthSuccessData,
  LoginRequest,
  RegisterRequest,
  RegisterSuccessData,
  ResendOtpRequest,
  ResendOtpSuccessData,
  User,
  VerifyOtpRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponseData,
  ResetPasswordRequest,
} from '../types';

export const authService = {
  async login(payload: LoginRequest): Promise<ApiResponse<AuthSuccessData>> {
    const response = await apiClient.post<ApiResponse<AuthSuccessData>>('/auth/login', payload);
    return response.data;
  },

  async register(payload: RegisterRequest): Promise<ApiResponse<RegisterSuccessData>> {
    const response = await apiClient.post<ApiResponse<RegisterSuccessData>>('/auth/register', payload);
    return response.data;
  },

  async verifyOtp(payload: VerifyOtpRequest): Promise<ApiResponse<AuthSuccessData>> {
    const response = await apiClient.post<ApiResponse<AuthSuccessData>>('/auth/verify-otp', payload);
    return response.data;
  },

  async resendOtp(payload: ResendOtpRequest): Promise<ApiResponse<ResendOtpSuccessData>> {
    const response = await apiClient.post<ApiResponse<ResendOtpSuccessData>>('/auth/resend-otp', payload);
    return response.data;
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<ApiResponse<ForgotPasswordResponseData>> {
    const response = await apiClient.post<ApiResponse<ForgotPasswordResponseData>>('/auth/forgot-password', payload);
    return response.data;
  },

  async verifyResetOtp(payload: VerifyOtpRequest): Promise<ApiResponse<{ valid: boolean; message: string }>> {
    const response = await apiClient.post<ApiResponse<{ valid: boolean; message: string }>>('/auth/verify-reset-otp', payload);
    return response.data;
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', payload);
    return response.data;
  },

  async googleAuth(payload: { idToken?: string; credential?: string }): Promise<ApiResponse<AuthSuccessData>> {
    const response = await apiClient.post<ApiResponse<AuthSuccessData>>('/auth/google', payload);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthSuccessData>> {
    const response = await apiClient.post<ApiResponse<AuthSuccessData>>('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  async getMe(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  async updateProfile(payload: { name?: string; phone?: string; avatar?: string }): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>('/auth/me', payload);
    return response.data;
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.put<ApiResponse<{ message: string }>>('/auth/change-password', payload);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Bỏ qua lỗi server khi logout để luôn xóa token cục bộ
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },
};
