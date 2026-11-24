import { apiClient } from './api';

export interface Invoice {
  _id: string;
  invoiceCode: string;
  studentId: {
    _id: string;
    fullName: string;
    studentCode: string;
    phone: string;
  } | string;
  title: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paidAmount: number;
  debtAmount: number;
  dueDate: string;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export const invoiceService = {
  async getAllInvoices(params?: { search?: string; status?: string; studentId?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<{ success: boolean; data: { invoices: Invoice[]; pagination: any } }>('/invoices', { params });
    return res.data;
  },

  async getInvoiceById(id: string) {
    const res = await apiClient.get<{ success: boolean; data: Invoice }>(`/invoices/${id}`);
    return res.data;
  },

  async createInvoice(data: Partial<Invoice>) {
    const res = await apiClient.post<{ success: boolean; data: Invoice }>('/invoices', data);
    return res.data;
  },

  async updateInvoice(id: string, data: Partial<Invoice>) {
    const res = await apiClient.put<{ success: boolean; data: Invoice }>(`/invoices/${id}`, data);
    return res.data;
  },

  async cancelInvoice(id: string, reason: string) {
    const res = await apiClient.post<{ success: boolean; data: Invoice }>(`/invoices/${id}/cancel`, { reason });
    return res.data;
  },

  async deleteInvoice(id: string) {
    const res = await apiClient.delete<{ success: boolean; data: any }>(`/invoices/${id}`);
    return res.data;
  },
};
