import { apiClient } from './api';

export interface StudentScores {
  vocabularyKanji: number;
  grammarReading: number;
  listening: number;
  total: number;
}

export interface ExamResult {
  _id: string;
  examId: {
    _id: string;
    title: string;
    examType?: string;
    passScore?: number;
  } | string;
  studentId: {
    _id: string;
    fullName: string;
    studentCode: string;
    phone?: string;
  } | string;
  classId: {
    _id: string;
    name: string;
    classCode: string;
  } | string;
  scores: StudentScores;
  isPassed: boolean;
  teacherEvaluation?: string;
  createdAt: string;
}

export const examResultService = {
  async getAllExamResults(params?: { studentId?: string; examId?: string; classId?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<{ success: boolean; data: { examResults: ExamResult[]; pagination: any } }>('/exam-results', { params });
    return res.data;
  },

  async getExamResultById(id: string) {
    const res = await apiClient.get<{ success: boolean; data: ExamResult }>(`/exam-results/${id}`);
    return res.data;
  },

  async createExamResult(data: Partial<ExamResult>) {
    const res = await apiClient.post<{ success: boolean; data: ExamResult }>('/exam-results', data);
    return res.data;
  },

  async updateExamResult(id: string, data: Partial<ExamResult>) {
    const res = await apiClient.put<{ success: boolean; data: ExamResult }>(`/exam-results/${id}`, data);
    return res.data;
  },

  async deleteExamResult(id: string) {
    const res = await apiClient.delete<{ success: boolean; data: any }>(`/exam-results/${id}`);
    return res.data;
  },
};
