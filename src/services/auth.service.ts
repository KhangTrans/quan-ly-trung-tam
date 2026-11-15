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

  async googleAuth(payload: { idToken?: string; credential?: string }): Promise<ApiResponse<AuthSuccessData>> {
    const response = await apiClient.post<ApiResponse<AuthSuccessData>>('/auth/google', payload);
    return response.data;
  },

  async getMe(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
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
