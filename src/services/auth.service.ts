import { apiClient } from './api';
import type { ApiResponse, AuthResponse, IUser } from '../types';

export const authService = {
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const data = res.data.data;
    if (data.token) {
      localStorage.setItem('mtcenter_token', data.token);
      localStorage.setItem('mtcenter_user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    const data = res.data.data;
    if (data.token) {
      localStorage.setItem('mtcenter_token', data.token);
      localStorage.setItem('mtcenter_user', JSON.stringify(data.user));
    }
    return data;
  },

  async getMe(): Promise<IUser> {
    const res = await apiClient.get<ApiResponse<IUser>>('/auth/me');
    return res.data.data;
  },

  logout(): void {
    localStorage.removeItem('mtcenter_token');
    localStorage.removeItem('mtcenter_user');
  },

  getCurrentUser(): IUser | null {
    const userStr = localStorage.getItem('mtcenter_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as IUser;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('mtcenter_token');
  },
};
