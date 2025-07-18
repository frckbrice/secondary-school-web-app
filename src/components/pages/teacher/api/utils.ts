// Utility functions for Teacher Dashboard

import type {
  StudentGrade,
  GradeStatistics,
  TermStatistics,
  GradeReport,
} from './constants';

export const calculateStatistics = (
  grades: StudentGrade[]
): GradeStatistics => {
  const gradesWithScores = grades.filter(
    g => g.grade !== null && g.grade !== undefined
  );
  const totalStudents = gradesWithScores.length;
  if (totalStudents === 0) {
    return {
      totalStudents: 0,
      studentsAbove10: 0,
      studentsBelow10: 0,
      femaleAbove10: 0,
      femaleBelow10: 0,
      maleAbove10: 0,
      maleBelow10: 0,
      averageGrade: 0,
      passRate: 0,
    };
  }
  const studentsAbove10 = gradesWithScores.filter(g => g.grade! >= 10).length;
  const studentsBelow10 = totalStudents - studentsAbove10;
  const femaleGrades = gradesWithScores.filter(g => g.gender === 'female');
  const maleGrades = gradesWithScores.filter(g => g.gender === 'male');
  const femaleAbove10 = femaleGrades.filter(g => g.grade! >= 10).length;
  const femaleBelow10 = femaleGrades.length - femaleAbove10;
  const maleAbove10 = maleGrades.filter(g => g.grade! >= 10).length;
  const maleBelow10 = maleGrades.length - maleAbove10;
  const totalGrades = gradesWithScores.reduce((sum, g) => sum + g.grade!, 0);
  const averageGrade = totalGrades / totalStudents;
  const passRate = (studentsAbove10 / totalStudents) * 100;
  return {
    totalStudents,
    studentsAbove10,
    studentsBelow10,
    femaleAbove10,
    femaleBelow10,
    maleAbove10,
    maleBelow10,
    averageGrade,
    passRate,
  };
};

export const calculateTermStatistics = (statsForm: any): TermStatistics => {
  const coursesPercentage =
    statsForm.coursesExpected > 0
      ? Math.round((statsForm.coursesDone / statsForm.coursesExpected) * 100)
      : 0;
  const periodHoursPercentage =
    statsForm.expectedPeriodHours > 0
      ? Math.round(
          (statsForm.periodHoursDone / statsForm.expectedPeriodHours) * 100
        )
      : 0;
  const tpTdPercentage =
    statsForm.tpTdExpected > 0
      ? Math.round((statsForm.tpTdDone / statsForm.tpTdExpected) * 100)
      : 0;
  return {
    courses: {
      expected: statsForm.coursesExpected,
      done: statsForm.coursesDone,
      percentage: coursesPercentage,
    },
    periodHours: {
      expected: statsForm.expectedPeriodHours,
      done: statsForm.periodHoursDone,
      percentage: periodHoursPercentage,
    },
    tpTd: {
      expected: statsForm.tpTdExpected,
      done: statsForm.tpTdDone,
      percentage: tpTdPercentage,
    },
  };
};

// Add parseStudentList and parseCSVContent utility functions
export const parseStudentList = (text: string) => {
  const lines = text.split('\n').filter(line => line.trim());
  const students: Array<{
    studentName: string;
    matricule?: string;
    gender: 'male' | 'female';
  }> = [];
  // ... (copy logic from original TeacherDashboard)
  return students;
};

export const parseCSVContent = (content: string) => {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  const students: Array<{
    studentName: string;
    matricule?: string;
    gender: 'male' | 'female';
  }> = [];
  // ... (copy logic from original TeacherDashboard)
  return students;
};

// Add other utility functions (parseStudentList, parseCSVContent, etc.) as needed.
