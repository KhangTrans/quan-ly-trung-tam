import apiClient from './api';

export interface Branch {
  _id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchInput {
  name: string;
  code: string;
  address: string;
  phone: string;
  email?: string;
  isActive?: boolean;
}

export interface UpdateBranchInput {
  name?: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export const branchService = {
  async getAllBranches(params?: { search?: string; isActive?: boolean }) {
    const res = await apiClient.get<{ success: boolean; data: Branch[]; message: string }>('/branches', {
      params,
    });
    return res.data;
  },

  async getBranchById(id: string) {
    const res = await apiClient.get<{ success: boolean; data: Branch; message: string }>(`/branches/${id}`);
    return res.data;
  },

  async createBranch(data: CreateBranchInput) {
    const res = await apiClient.post<{ success: boolean; data: Branch; message: string }>('/branches', data);
    return res.data;
  },

  async updateBranch(id: string, data: UpdateBranchInput) {
    const res = await apiClient.put<{ success: boolean; data: Branch; message: string }>(`/branches/${id}`, data);
    return res.data;
  },

  async deleteBranch(id: string) {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/branches/${id}`);
    return res.data;
  },
};
