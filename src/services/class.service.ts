import apiClient from './api';
import type { Branch } from './branch.service';
import type { Classroom } from './classroom.service';
import type { ShiftSlot } from './shiftSlot.service';
import type { Course } from './course.service';

export interface Teacher {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
}

export interface ClassItem {
  _id: string;
  courseId: Course;
  branchId: Branch;
  classCode: string;
  name: string;
  primaryTeacherId: Teacher;
  defaultClassroomId: Classroom;
  daysOfWeek: number[]; // [2, 4, 6] -> T2-4-6
  shiftSlotId: ShiftSlot;
  startDate: string;
  endDateExpected?: string;
  maxStudents: number;
  currentStudentCount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  enrollments?: Array<{
    _id: string;
    studentId: {
      _id: string;
      studentCode: string;
      fullName: string;
      phone: string;
      email?: string;
      gender: string;
      status: string;
    };
    enrollmentDate: string;
    status: string;
    tuitionStatus: string;
    remainingSessions: number;
  }>;
}

export interface CreateClassInput {
  courseId: string;
  branchId: string;
  classCode: string;
  name: string;
  primaryTeacherId: string;
  defaultClassroomId: string;
  daysOfWeek: number[];
  shiftSlotId: string;
  startDate: string;
  endDateExpected?: string;
  maxStudents?: number;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  notes?: string;
}

export interface UpdateClassInput extends Partial<CreateClassInput> {}

export const classService = {
  async getAllClasses(params?: {
    search?: string;
    branchId?: string;
    courseId?: string;
    status?: string;
    teacherId?: string;
  }) {
    const res = await apiClient.get<{ success: boolean; data: ClassItem[]; message: string }>('/classes', {
      params,
    });
    return res.data;
  },

  async getClassById(id: string) {
    const res = await apiClient.get<{ success: boolean; data: ClassItem; message: string }>(`/classes/${id}`);
    return res.data;
  },

  async createClass(data: CreateClassInput) {
    const res = await apiClient.post<{ success: boolean; data: ClassItem; message: string }>('/classes', data);
    return res.data;
  },

  async updateClass(id: string, data: UpdateClassInput) {
    const res = await apiClient.put<{ success: boolean; data: ClassItem; message: string }>(`/classes/${id}`, data);
    return res.data;
  },

  async deleteClass(id: string) {
    const res = await apiClient.delete<{ success: boolean; data: null; message: string }>(`/classes/${id}`);
    return res.data;
  },

  async getTeachers() {
    const res = await apiClient.get<{ success: boolean; data: Teacher[]; message: string }>('/classes/teachers');
    return res.data;
  },
};
