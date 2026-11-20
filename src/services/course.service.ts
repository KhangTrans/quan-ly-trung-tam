import apiClient from './api';

export interface Course {
  _id: string;
  title: string;
  code: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'Kaiwa';
  description?: string;
  textbook: string;
  totalSessions: number;
  tuitionFee: number;
  duration?: string;
  schedule?: string;
  maxStudents: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const courseService = {
  async getAllCourses(params?: { level?: string; status?: string; search?: string }) {
    const res = await apiClient.get<{ success: boolean; data: any; message: string }>('/courses', {
      params,
    });
    const list = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.data?.courses)
      ? res.data.data.courses
      : [];
    return {
      ...res.data,
      data: list as Course[],
    };
  },

  async getCourseById(id: string) {
    const res = await apiClient.get<{ success: boolean; data: Course; message: string }>(`/courses/${id}`);
    return res.data;
  },
};
