import { apiClient } from './api';
import type { ApiResponse, IEnrollment, Pagination } from '../types';

export interface EnrollmentListResponse {
  enrollments: IEnrollment[];
  pagination: Pagination;
}

export const enrollmentService = {
  async getEnrollments(params?: {
    status?: string;
    tuitionStatus?: string;
    classId?: string;
    studentId?: string;
    page?: number;
    limit?: number;
  }): Promise<EnrollmentListResponse> {
    const res = await apiClient.get<ApiResponse<EnrollmentListResponse>>('/enrollments', { params });
    return res.data.data;
  },

  async createEnrollment(payload: {
    studentId: string;
    classId: string;
    remainingSessions?: number;
    tuitionStatus?: string;
    notes?: string;
  }): Promise<IEnrollment> {
    const res = await apiClient.post<ApiResponse<IEnrollment>>('/enrollments', payload);
    return res.data.data;
  },

  async updateTuitionStatus(id: string, tuitionStatus: 'unpaid' | 'partially_paid' | 'paid'): Promise<IEnrollment> {
    const res = await apiClient.patch<ApiResponse<IEnrollment>>(`/enrollments/${id}/tuition`, { tuitionStatus });
    return res.data.data;
  },
};
