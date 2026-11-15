import { apiClient } from './api';
import type { ApiResponse, ICourse, CourseListResponse } from '../types';

export interface CourseFilterParams {
  level?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const courseService = {
  async getCourses(params?: CourseFilterParams): Promise<CourseListResponse> {
    const res = await apiClient.get<ApiResponse<CourseListResponse>>('/courses', { params });
    return res.data.data;
  },

  async getCourseById(id: string): Promise<ICourse> {
    const res = await apiClient.get<ApiResponse<ICourse>>(`/courses/${id}`);
    return res.data.data;
  },

  async createCourse(course: Partial<ICourse>): Promise<ICourse> {
    const res = await apiClient.post<ApiResponse<ICourse>>('/courses', course);
    return res.data.data;
  },

  async updateCourse(id: string, course: Partial<ICourse>): Promise<ICourse> {
    const res = await apiClient.put<ApiResponse<ICourse>>(`/courses/${id}`, course);
    return res.data.data;
  },

  async deleteCourse(id: string): Promise<void> {
    await apiClient.delete(`/courses/${id}`);
  },
};
