import { apiClient } from './api';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'CANCEL';

export interface ChangedField {
  field: string;
  fieldName?: string;
  oldValue: any;
  newValue: any;
}

export interface AuditUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'teacher' | 'student';
  avatar?: string;
  phone?: string;
}

export interface AuditLog {
  _id: string;
  userId: AuditUser;
  action: AuditAction;
  targetCollection: 'students' | 'invoices' | 'exam_results' | string;
  targetId: string;
  description?: string;
  changedFields?: ChangedField[];
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogStats {
  totalLogs: number;
  todayLogs: number;
  byCollection: Record<string, number>;
  byAction: Record<string, number>;
}

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  targetCollection?: string;
  action?: string;
  userId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const auditLogService = {
  async getAuditLogs(params?: AuditLogQuery) {
    const res = await apiClient.get<{ success: boolean; data: AuditLogResponse }>('/audit-logs', {
      params,
    });
    return res.data;
  },

  async getAuditLogById(id: string) {
    const res = await apiClient.get<{ success: boolean; data: AuditLog }>(`/audit-logs/${id}`);
    return res.data;
  },

  async getAuditLogStats() {
    const res = await apiClient.get<{ success: boolean; data: AuditLogStats }>('/audit-logs/stats');
    return res.data;
  },
};
