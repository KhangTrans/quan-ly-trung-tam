import { apiClient } from './api';

export interface Student {
  _id: string;
  studentCode: string;
  fullName: string;
  gender: 'male' | 'female' | 'other';
  dob?: string;
  phone: string;
  email?: string;
  address?: string;
  inputLevel?: string;
  learningObjective?: string;
  status: 'active' | 'graduated' | 'paused' | 'dropped';
  notes?: string;
  createdAt: string;
}

export const studentService = {
  async getAllStudents(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<{ success: boolean; data: { students: Student[]; pagination: any } }>('/students', { params });
    return res.data;
  },

  async getStudentById(id: string) {
    const res = await apiClient.get<{ success: boolean; data: Student }>(`/students/${id}`);
    return res.data;
  },

  async createStudent(data: Partial<Student>) {
    const res = await apiClient.post<{ success: boolean; data: Student }>('/students', data);
    return res.data;
  },

  async updateStudent(id: string, data: Partial<Student>) {
    const res = await apiClient.put<{ success: boolean; data: Student }>(`/students/${id}`, data);
    return res.data;
  },

  async deleteStudent(id: string) {
    const res = await apiClient.delete<{ success: boolean; data: any }>(`/students/${id}`);
    return res.data;
  },
};
