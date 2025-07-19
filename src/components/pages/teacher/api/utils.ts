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

/**
 * Parses a grading Excel file (either from app or matching template) and returns normalized data for preview.
 * @param {ArrayBuffer} arrayBuffer - The file data as ArrayBuffer
 * @param {string} [fileName] - Optional file name for format detection
 * @returns {Promise<{ tableData: any[][], allRowsData: any[][] }>} Parsed data for preview
 */
export async function parseGradingFile(
  arrayBuffer: ArrayBuffer,
  fileName?: string
): Promise<{ tableData: any[][]; allRowsData: any[][] }> {
  // Dynamic import for performance - use a more reliable approach
  let XLSX;
  try {
    // Use a more reliable dynamic import approach
    const xlsxModule = await import('xlsx');
    // Handle both default and named exports
    XLSX = xlsxModule.default || xlsxModule;

    // Additional check to ensure we have the required methods
    if (
      !XLSX ||
      typeof XLSX.read !== 'function' ||
      typeof XLSX.utils !== 'object'
    ) {
      throw new Error(
        'XLSX library not properly loaded - missing required methods'
      );
    }
  } catch (importError) {
    console.error('XLSX import error:', importError);
    throw new Error('Failed to load Excel processing library');
  }

  try {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const allRowsData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
    }) as any[][];

    // Try to detect if file is from app (has known header structure)
    const appHeader = ['Ide', 'NOM ET PRENOM', 'NOTE 1', 'NOTE 2'];
    const firstRow = allRowsData[0]?.map(cell =>
      String(cell).trim().toUpperCase()
    );
    const isAppFile =
      firstRow && appHeader.every((h, i) => firstRow[i]?.toUpperCase() === h);

    if (isAppFile) {
      // App-generated file: use as-is for preview
      return { tableData: allRowsData, allRowsData };
    }

    // Otherwise, try to parse as template (robust logic)
    // Table header
    const tableHeader = ['Ide', 'NOM ET PRENOM', 'NOTE 1', 'NOTE 2'];
    // Extract rows: NOM ET PRENOM from col E (index 4), NOTE 1-6 from cols F-K (5-10), from row 4 (index 3)
    const filteredRows = allRowsData
      .slice(3)
      .map(row => [
        row[4] || '',
        row[5] || '',
        row[6] || '',
        row[7] || '',
        row[8] || '',
        row[9] || '',
        row[10] || '',
      ])
      .filter(row => row[0] && String(row[0]).trim() !== ''); // Only rows with non-empty NOM ET PRENOM
    // Build tableRows with Ide as running number (idx+1)
    const tableRows = filteredRows.map((row, idx) => [
      idx + 1,
      row[0],
      row[1],
      row[2],
    ]);
    const tableData = [tableHeader, ...tableRows];
    return { tableData, allRowsData };
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error('Failed to parse Excel file');
  }
}

// Add other utility functions (parseStudentList, parseCSVContent, etc.) as needed.
