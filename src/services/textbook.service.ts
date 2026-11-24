import apiClient from './api';

export interface Textbook {
  _id: string;
  name: string;
  code: string;
  level: string;
  author?: string;
  publisher?: string;
  totalLessons?: number;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  fileSizeFormatted?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTextbookInput {
  name: string;
  code: string;
  level: string;
  author?: string;
  publisher?: string;
  totalLessons?: number;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  fileSizeFormatted?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateTextbookInput extends Partial<CreateTextbookInput> {}

export interface UploadPdfResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileSizeFormatted: string;
}

export const textbookService = {
  async getAllTextbooks(params?: { search?: string; level?: string; isActive?: boolean }) {
    const res = await apiClient.get<{ success: boolean; data: Textbook[]; message: string }>('/textbooks', {
      params,
    });
    return res.data;
  },

  async getTextbookById(id: string) {
    const res = await apiClient.get<{ success: boolean; data: Textbook; message: string }>(`/textbooks/${id}`);
    return res.data;
  },

  async createTextbook(data: CreateTextbookInput) {
    const res = await apiClient.post<{ success: boolean; data: Textbook; message: string }>('/textbooks', data);
    return res.data;
  },

  async updateTextbook(id: string, data: UpdateTextbookInput) {
    const res = await apiClient.put<{ success: boolean; data: Textbook; message: string }>(`/textbooks/${id}`, data);
    return res.data;
  },

  async deleteTextbook(id: string) {
    const res = await apiClient.delete<{ success: boolean; data: null; message: string }>(`/textbooks/${id}`);
    return res.data;
  },

  async uploadPdf(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<{ success: boolean; data: UploadPdfResponse; message: string }>(
      '/textbooks/upload-pdf',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  },
};
