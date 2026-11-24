import apiClient from './api';

export type ShiftPeriod = 'morning' | 'afternoon' | 'evening';

export interface ShiftSlot {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  period: ShiftPeriod;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShiftSlotInput {
  name: string;
  startTime: string;
  endTime: string;
  period: ShiftPeriod;
  isActive?: boolean;
}

export interface UpdateShiftSlotInput {
  name?: string;
  startTime?: string;
  endTime?: string;
  period?: ShiftPeriod;
  isActive?: boolean;
}

export const shiftSlotService = {
  async getAllShiftSlots(params?: { period?: string; isActive?: boolean }) {
    const res = await apiClient.get<{ success: boolean; data: ShiftSlot[]; message: string }>('/shift-slots', {
      params,
    });
    return res.data;
  },

  async getShiftSlotById(id: string) {
    const res = await apiClient.get<{ success: boolean; data: ShiftSlot; message: string }>(`/shift-slots/${id}`);
    return res.data;
  },

  async createShiftSlot(data: CreateShiftSlotInput) {
    const res = await apiClient.post<{ success: boolean; data: ShiftSlot; message: string }>('/shift-slots', data);
    return res.data;
  },

  async updateShiftSlot(id: string, data: UpdateShiftSlotInput) {
    const res = await apiClient.put<{ success: boolean; data: ShiftSlot; message: string }>(`/shift-slots/${id}`, data);
    return res.data;
  },

  async deleteShiftSlot(id: string) {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/shift-slots/${id}`);
    return res.data;
  },
};
