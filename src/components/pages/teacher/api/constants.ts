// Constants and types for Teacher Dashboard
export const CLASS_LIST = [
  'Form 1',
  'Form 2',
  'Form 3',
  'Form 4',
  'Form 5',
  'Lower Six',
  'Upper 6',
  '6eme',
  '5eme',
  '4eme',
  '3eme',
  '2nd C',
  '2nd A',
  'Pre A',
  'Pre C',
  'Pre D',
  'Tle A',
  'Tle C',
  'Tle D',
];
export const CLASS_FOLDER_MAP: Record<string, string> = {
  'Form 1': 'Form1',
  'Form 2': 'Form2',
  'Form 3': 'Form3',
  'Form 4': 'Form4',
  'Form 5': 'Form5',
  'Lower Six': 'LowerSix',
  'Upper 6': 'Upper6',
  '6eme': '6eme',
  '5eme': '5eme',
  '4eme': '4eme',
  '3eme': '3eme',
  '2nd C': '2ndC',
  '2nd A': '2ndA',
  'Pre A': 'PreA',
  'Pre C': 'PreC',
  'Pre D': 'PreD',
  'Tle A': 'TleA',
  'Tle C': 'TleC',
  'Tle D': 'TleD',
};
export const ENGLISH_CLASSES = [
  'Form 1',
  'Form 2',
  'Form 3',
  'Form 4',
  'Form 5',
  'Lower Six',
  'Upper 6',
];
export const FRENCH_CLASSES = [
  '6eme',
  '5eme',
  '4eme',
  '3eme',
  '2nd C',
  '2nd A',
  'Pre A',
  'Pre C',
  'Pre D',
  'Tle A',
  'Tle C',
  'Tle D',
];
// Types and schemas
import { z } from 'zod';
export interface GradeStatistics {
  totalStudents: number;
  studentsAbove10: number;
  studentsBelow10: number;
  femaleAbove10: number;
  femaleBelow10: number;
  maleAbove10: number;
  maleBelow10: number;
  averageGrade: number;
  passRate: number;
}
export interface TermStatistics {
  courses: {
    expected: number;
    done: number;
    percentage: number;
  };
  periodHours: {
    expected: number;
    done: number;
    percentage: number;
  };
  tpTd: {
    expected: number;
    done: number;
    percentage: number;
  };
}
export const gradeReportSchema = z.object({
  className: z.string().min(1, 'Class name is required'),
  subject: z.string().min(1, 'Subject is required'),
  term: z.string().min(1, 'Term is required'),
  gradingPeriod: z.string().min(1, 'Grading period is required'),
  coursesExpected: z.number().min(0),
  coursesDone: z.number().min(0),
  expectedPeriodHours: z.number().min(0),
  periodHoursDone: z.number().min(0),
  tpTdExpected: z.number().min(0),
  tpTdDone: z.number().min(0),
});
export const studentGradeSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  gender: z.enum(['male', 'female']),
  matricule: z.string().optional(),
  grade: z.number().min(0).max(20).optional(),
  remarks: z.string().optional(),
});
export type GradeReportFormData = z.infer<typeof gradeReportSchema>;
export type StudentGradeFormData = z.infer<typeof studentGradeSchema>;

// Add type definitions for StudentGrade and GradeReport
export interface StudentGrade {
  id?: string;
  studentName: string;
  gender: 'male' | 'female';
  matricule?: string;
  grade?: number;
  remarks?: string;
}
export interface GradeReport {
  id?: string;
  className: string;
  subject: string;
  term: string;
  gradingPeriod: string;
  academicYear?: string;
  teacherId?: string;
  isFinalized?: boolean;
}
