import apiClient from './api';

export type JapaneseLevel =
  | 'N5'
  | 'N4'
  | 'N3'
  | 'N2'
  | 'N1'
  | 'Kaiwa'
  | 'Luyện thi JLPT'
  | 'Luyện thi NAT-TEST'
  | 'JLPT'
  | 'NAT-TEST';

export interface Course {
  _id: string;
  title: string;
  code: string;
  level: JapaneseLevel;
  description?: string;
  textbook: string;
  totalSessions: number;
  tuitionFee: number;
  duration?: string;
  schedule?: string;
  maxStudents: number;
  startDate?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  classes?: any[];
}

export interface CreateCourseInput {
  title: string;
  code: string;
  level: string;
  description?: string;
  textbook: string;
  totalSessions: number;
  tuitionFee: number;
  duration?: string;
  schedule?: string;
  maxStudents?: number;
  startDate?: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive?: boolean;
}

export interface UpdateCourseInput extends Partial<CreateCourseInput> {}

export const courseService = {
  async getAllCourses(params?: { level?: string; status?: string; search?: string; limit?: number; page?: number }) {
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

  async createCourse(data: CreateCourseInput) {
    const res = await apiClient.post<{ success: boolean; data: Course; message: string }>('/courses', data);
    return res.data;
  },

  async updateCourse(id: string, data: UpdateCourseInput) {
    const res = await apiClient.put<{ success: boolean; data: Course; message: string }>(`/courses/${id}`, data);
    return res.data;
  },

  async deleteCourse(id: string) {
    const res = await apiClient.delete<{ success: boolean; data: null; message: string }>(`/courses/${id}`);
    return res.data;
  },
};
