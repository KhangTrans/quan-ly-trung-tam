import apiClient from './api';
import type { Branch } from './branch.service';

export interface Classroom {
  _id: string;
  branchId: Branch | string;
  roomCode: string;
  capacity: number;
  facilities: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassroomInput {
  branchId: string;
  roomCode: string;
  capacity: number;
  facilities?: string[];
  isActive?: boolean;
}

export interface UpdateClassroomInput {
  branchId?: string;
  roomCode?: string;
  capacity?: number;
  facilities?: string[];
  isActive?: boolean;
}

export const classroomService = {
  async getAllClassrooms(params?: { branchId?: string; search?: string; isActive?: boolean }) {
    const res = await apiClient.get<{ success: boolean; data: Classroom[]; message: string }>('/classrooms', {
      params,
    });
    return res.data;
  },

  async getClassroomById(id: string) {
    const res = await apiClient.get<{ success: boolean; data: Classroom; message: string }>(`/classrooms/${id}`);
    return res.data;
  },

  async createClassroom(data: CreateClassroomInput) {
    const res = await apiClient.post<{ success: boolean; data: Classroom; message: string }>('/classrooms', data);
    return res.data;
  },

  async updateClassroom(id: string, data: UpdateClassroomInput) {
    const res = await apiClient.put<{ success: boolean; data: Classroom; message: string }>(`/classrooms/${id}`, data);
    return res.data;
  },

  async deleteClassroom(id: string) {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/classrooms/${id}`);
    return res.data;
  },
};
