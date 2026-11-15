import React from 'react';
import type { JapaneseLevel, CourseStatus, TuitionStatus, EnrollmentStatus } from '../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'level' | 'status' | 'tuition' | 'role' | 'default';
  value?: JapaneseLevel | CourseStatus | TuitionStatus | EnrollmentStatus | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', value, className = '' }) => {
  let styleClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (variant === 'level') {
    switch (value) {
      case 'N5':
        styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'N4':
        styleClasses = 'bg-sky-50 text-sky-700 border-sky-200';
        break;
      case 'N3':
        styleClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'N2':
        styleClasses = 'bg-purple-50 text-purple-700 border-purple-200';
        break;
      case 'N1':
        styleClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
      case 'Kaiwa':
        styleClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      default:
        styleClasses = 'bg-slate-100 text-slate-700 border-slate-200';
    }
  } else if (variant === 'status') {
    switch (value) {
      case 'upcoming':
        styleClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'ongoing':
        styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'completed':
        styleClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'cancelled':
        styleClasses = 'bg-red-50 text-red-700 border-red-200';
        break;
    }
  } else if (variant === 'tuition') {
    switch (value) {
      case 'paid':
        styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'partially_paid':
        styleClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'unpaid':
        styleClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
    }
  }

  const label = children || value;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styleClasses} ${className}`}
    >
      {label}
    </span>
  );
};
