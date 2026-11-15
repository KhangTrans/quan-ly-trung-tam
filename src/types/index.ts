export type UserRole = 'admin' | 'staff' | 'teacher' | 'student';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  branchId?: string;
  isActive: boolean;
  avatar?: string;
  salaryRatePerHour?: number;
  createdAt: string;
  updatedAt: string;
}

export type JapaneseLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'Kaiwa';
export type CourseStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface ICourse {
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
  status: CourseStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EnrollmentStatus = 'enrolled' | 'reserved' | 'transferred' | 'dropped';
export type TuitionStatus = 'unpaid' | 'partially_paid' | 'paid';

export interface IEnrollment {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  } | string;
  classId: {
    _id: string;
    name?: string;
    code?: string;
  } | string;
  enrollmentDate: string;
  status: EnrollmentStatus;
  remainingSessions: number;
  tuitionStatus: TuitionStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface AuthResponse {
  user: IUser;
  token: string;
}

export interface CourseListResponse {
  courses: ICourse[];
  pagination: Pagination;
}
