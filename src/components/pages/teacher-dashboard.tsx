'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  Plus,
  Home,
  LogOut,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Lock,
  Globe,
  Sun,
  Moon,
  User,
  Settings,
  FileText,
  Calculator,
  BarChart3,
  Calendar,
  MessageSquare,
  Upload,
} from 'lucide-react';
import { useLanguage } from '../../hooks/use-language';
import { useAuth } from '../../hooks/use-auth';
import { apiRequest, queryClient } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';
import { useRouter } from 'next/navigation';
import { TeacherSidebar } from '../ui/teacher-sidebar';
import type { GradeReport, StudentGrade } from '../../schema';
import Link from 'next/link';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Edit, Trash2 } from 'lucide-react';
import { Label } from '../ui/label';

interface GradeStatistics {
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

interface TermStatistics {
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

// Form schemas
const gradeReportSchema = z.object({
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

const studentGradeSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  gender: z.enum(['male', 'female']),
  matricule: z.string().optional(),
  grade: z.number().min(0).max(20).optional(),
  remarks: z.string().optional(),
});

type GradeReportFormData = z.infer<typeof gradeReportSchema>;
type StudentGradeFormData = z.infer<typeof studentGradeSchema>;

// 1. Create a context for grade editor state
const GradeEditorContext = createContext<any>(null);
export const useGradeEditor = () => useContext(GradeEditorContext);

export default function TeacherDashboard() {
  const { user, logoutMutation } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const lang = language;
  const router = useRouter();
  const { toast } = useToast();

  const [selectedReport, setSelectedReport] = useState<GradeReport | null>(
    null
  );

  // Add missing sorting state variables
  const [sortBy, setSortBy] = useState<'name' | 'grade' | 'matricule'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Add missing statsForm state definition for term statistics calculation
  const [statsForm, setStatsForm] = useState({
    coursesExpected: 0,
    coursesDone: 0,
    expectedPeriodHours: 0,
    periodHoursDone: 0,
    tpTdExpected: 0,
    tpTdDone: 0,
  });

  // Add missing state variables for editing and importing
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: string;
  } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importText, setImportText] = useState('');
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<StudentGrade | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Add section state at the top of TeacherDashboard
  const [activeSection, setActiveSection] = useState<
    | 'dashboard'
    | 'gradeReports'
    | 'studentGrades'
    | 'calendar'
    | 'importExport'
    | 'settings'
  >('dashboard');

  // Handle URL parameters for section
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const section = urlParams.get('section');
      if (
        section &&
        [
          'dashboard',
          'gradeReports',
          'studentGrades',
          'calendar',
          'importExport',
          'settings',
        ].includes(section)
      ) {
        setActiveSection(section as any);
      }
    }
  }, []);

  // Add theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // 1. Add file preview state
  const [filePreview, setFilePreview] = React.useState<any[][]>([]);

  // Section change handler
  const handleSectionChange = (section: string) => {
    setActiveSection(section as any);
  };

  // Calculate statistics function
  const calculateStatistics = (grades: StudentGrade[]): GradeStatistics => {
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

  // Calculate term statistics [18px]d on current form state
  const calculateTermStatistics = (): TermStatistics => {
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

  // Query for grade reports with teacher filter
  const { data: gradeReports = [], isLoading: reportsLoading } = useQuery<
    GradeReport[]
  >({
    queryKey: ['/api/grade-reports', user?.id],
    queryFn: async () => {
      const res = await apiRequest(
        'GET',
        `/api/grade-reports?teacherId=${user?.id}`
      );
      if (!res) throw new Error('Failed to fetch grade reports');
      const data = await res.json();
      return data.reports || [];
    },
    enabled: !!user?.id,
  });

  // Query for student grades of selected report
  const { data: studentGrades = [], isLoading: gradesLoading } = useQuery<
    StudentGrade[]
  >({
    queryKey: ['/api/grade-reports', selectedReport?.id, 'grades'],
    queryFn: async () => {
      if (!selectedReport) return [];
      const res = await apiRequest(
        'GET',
        `/api/grade-reports/${selectedReport.id}/grades`
      );
      if (!res) throw new Error('Failed to fetch student grades');
      const data = await res.json();
      return data.grades || [];
    },
    enabled: !!selectedReport,
  });

  // Calculate statistics for the selected report
  const statistics = selectedReport
    ? calculateStatistics(studentGrades)
    : {
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

  // Calculate term statistics
  const termStatistics = calculateTermStatistics();

  // Delete grade report mutation (only for drafts)
  const deleteGradeReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      await apiRequest('DELETE', `/api/grade-reports/${reportId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grade-reports'] });
      setSelectedReport(null);
      toast({
        title: lang === 'fr' ? 'Succès' : 'Success',
        description:
          lang === 'fr'
            ? 'Rapport supprimé avec succès'
            : 'Report deleted successfully',
      });
    },
    onError: error => {
      console.error('Failed to delete grade report:', error);
      toast({
        title: lang === 'fr' ? 'Erreur' : 'Error',
        description:
          lang === 'fr' ? 'Échec de la suppression' : 'Failed to delete report',
        variant: 'destructive',
      });
    },
  });

  // Clear all students from grade report (for re-importing)
  const clearStudentsMutation = useMutation({
    mutationFn: async (reportId: string) => {
      // Get all student grades for this report
      const response = await fetch(`/api/grade-reports/${reportId}/grades`);
      const grades = await response.json();

      // Delete each grade
      const deletePromises = grades.map((grade: any) =>
        apiRequest('DELETE', `/api/student-grades/${grade.id}`)
      );

      await Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/grade-reports', selectedReport?.id, 'grades'],
      });
      toast({
        title: lang === 'fr' ? 'Succès' : 'Success',
        description:
          lang === 'fr'
            ? 'Élèves supprimés avec succès'
            : 'Students cleared successfully',
      });
    },
    onError: error => {
      console.error('Failed to clear students:', error);
      toast({
        title: lang === 'fr' ? 'Erreur' : 'Error',
        description:
          lang === 'fr'
            ? 'Échec de la suppression des élèves'
            : 'Failed to clear students',
        variant: 'destructive',
      });
    },
  });

  // Update statistics mutation
  const updateStatsMutation = useMutation({
    mutationFn: async (data: {
      coursesExpected: number;
      coursesDone: number;
      expectedPeriodHours: number;
      periodHoursDone: number;
      tpTdExpected: number;
      tpTdDone: number;
    }) => {
      const res = await apiRequest(
        'PUT',
        `/api/grade-reports/${selectedReport!.id}`,
        data
      );
      if (!res) throw new Error('Failed to update statistics');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grade-reports'] });
      setIsEditingStats(false);
      toast({
        title: lang === 'fr' ? 'Succès' : 'Success',
        description:
          lang === 'fr'
            ? 'Statistiques mises à jour'
            : 'Statistics updated successfully',
      });
    },
    onError: (error: any) => {
      console.error('Failed to update statistics:', error);
      toast({
        title: lang === 'fr' ? 'Erreur' : 'Error',
        description:
          lang === 'fr'
            ? 'Échec de la mise à jour'
            : 'Failed to update statistics',
        variant: 'destructive',
      });
    },
  });

  // Inline edit mutation
  const inlineEditMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      field: string;
      value: string | number;
    }) => {
      const updateData: any = {};
      if (data.field === 'grade') {
        updateData.grade =
          typeof data.value === 'string' ? parseFloat(data.value) : data.value;
      } else {
        updateData[data.field] = data.value;
      }

      const res = await apiRequest(
        'PUT',
        `/api/student-grades/${data.id}`,
        updateData
      );
      if (!res) throw new Error('Failed to update student');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/grade-reports', selectedReport?.id, 'grades'],
      });
      setEditingCell(null);
      setEditValue('');
    },
    onError: error => {
      console.error('Failed to update student:', error);
      toast({
        title: lang === 'fr' ? 'Erreur' : 'Error',
        description:
          lang === 'fr'
            ? 'Échec de la mise à jour'
            : 'Failed to update student',
        variant: 'destructive',
      });
    },
  });

  // Helper functions
  const parseStudentList = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const students: Array<{
      studentName: string;
      matricule?: string;
      gender: 'male' | 'female';
    }> = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Skip if line is purely numeric (row numbers)
      if (/^\d+$/.test(trimmed)) continue;

      let studentName = '';
      let matricule = '';
      let gender: 'male' | 'female' = 'male';

      // Enhanced parsing for various formats
      if (trimmed.includes(',')) {
        // CSV format: "Name, Matricule, Gender" or "Number, Name, Matricule, Gender"
        const parts = trimmed.split(',').map(p => p.trim());

        // Skip if first part is purely numeric (row number)
        if (/^\d+$/.test(parts[0]) && parts.length >= 2) {
          studentName = parts[1];
          matricule = parts[2] || '';
          const genderPart = parts[3]?.toLowerCase();
          if (
            genderPart &&
            ['female', 'f', 'femme', 'féminin', 'girl', 'fille'].includes(
              genderPart
            )
          ) {
            gender = 'female';
          }
        } else {
          studentName = parts[0];
          // Check if second part is matricule or gender
          if (
            parts[1] &&
            ![
              'male',
              'female',
              'm',
              'f',
              'masculin',
              'féminin',
              'homme',
              'femme',
              'boy',
              'girl',
              'garçon',
              'fille',
            ].includes(parts[1].toLowerCase())
          ) {
            matricule = parts[1];
            const genderPart = parts[2]?.toLowerCase();
            if (
              genderPart &&
              ['female', 'f', 'femme', 'féminin', 'girl', 'fille'].includes(
                genderPart
              )
            ) {
              gender = 'female';
            }
          } else {
            // Second part is gender
            const genderPart = parts[1]?.toLowerCase();
            if (
              genderPart &&
              ['female', 'f', 'femme', 'féminin', 'girl', 'fille'].includes(
                genderPart
              )
            ) {
              gender = 'female';
            }
          }
        }
      } else {
        // Try to extract matricule from various formats
        const matriculePatterns = [
          /^(.+?)\s*\(([^)]+)\)$/, // Name (Matricule)
          /^(.+?)\s*-\s*(.+)$/, // Name - Matricule
          /^(.+?)\s+([A-Z0-9]+)$/, // Name MATRICULE
        ];

        let matched = false;
        for (const pattern of matriculePatterns) {
          const match = trimmed.match(pattern);
          if (match) {
            studentName = match[1].trim();
            matricule = match[2].trim();
            matched = true;
            break;
          }
        }

        if (!matched) {
          studentName = trimmed;
        }
      }

      // Clean and validate student name
      studentName = studentName.replace(/^\d+\.?\s*/, ''); // Remove leading numbers and dots
      studentName = studentName.trim();

      // Skip if name is still empty or purely numeric after cleaning
      if (!studentName || /^\d+$/.test(studentName)) continue;

      // Capitalize names properly
      studentName = studentName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      students.push({
        studentName,
        matricule: matricule || undefined,
        gender,
      });
    }

    return students;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    const isExcel =
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls') ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel';

    if (isCSV || isExcel) {
      setImportFile(file);

      if (isCSV) {
        // Handle CSV files
        const reader = new FileReader();
        reader.onload = e => {
          const content = e.target?.result as string;
          setImportText(content);
        };
        reader.readAsText(file);
      } else {
        // Handle Excel files
        const reader = new FileReader();
        reader.onload = e => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const csvContent = XLSX.utils.sheet_to_csv(worksheet);
            setImportText(csvContent);
          } catch (error) {
            toast({
              title: lang === 'fr' ? 'Erreur' : 'Error',
              description:
                lang === 'fr'
                  ? 'Erreur lors de la lecture du fichier Excel'
                  : 'Error reading Excel file',
              variant: 'destructive',
            });
            setImportFile(null);
          }
        };
        reader.readAsArrayBuffer(file);
      }
    } else {
      toast({
        title: lang === 'fr' ? 'Erreur' : 'Error',
        description:
          lang === 'fr'
            ? 'Veuillez sélectionner un fichier CSV ou Excel'
            : 'Please select a CSV or Excel file',
        variant: 'destructive',
      });
    }
  };

  const parseCSVContent = (content: string) => {
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    const students: Array<{
      studentName: string;
      matricule?: string;
      gender: 'male' | 'female';
    }> = [];

    if (lines.length === 0) return students;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Skip header lines and empty rows
      const lowerLine = line.toLowerCase();
      if (
        lowerLine.includes('ide') ||
        lowerLine.includes('nom et prenom') ||
        lowerLine.includes('name') ||
        lowerLine.includes('student') ||
        line === ',' ||
        line === ',,' ||
        /^,+$/.test(line)
      ) {
        continue;
      }

      // Handle different CSV formats: comma, semicolon, tab
      let columns: string[];
      if (line.includes(',')) {
        columns = line.split(',');
      } else if (line.includes(';')) {
        columns = line.split(';');
      } else if (line.includes('\t')) {
        columns = line.split('\t');
      } else {
        // Single column, assume it's just the name
        columns = [line];
      }

      // Clean and process columns - remove quotes, trim whitespace
      columns = columns.map(col =>
        col
          .trim()
          .replace(/^["']|["']$/g, '')
          .trim()
      );

      if (columns.length >= 1) {
        let studentName = '';
        let matricule = '';
        let genderCol = '';

        // Enhanced parsing for Excel format like "2,267",ABONG KOUDI CAMILOU
        if (columns.length >= 2) {
          // Check if first column is a number (matricule) and second is name
          if (
            /^[\d,]+$/.test(columns[0]) &&
            columns[1] &&
            /^[A-Za-z]/.test(columns[1].trim())
          ) {
            matricule = columns[0].replace(/,/g, ''); // Remove commas from numbers
            studentName = columns[1];
            genderCol = columns[2]?.toLowerCase()?.trim() || '';
          }
          // If first column starts with a letter, it's the name
          else if (/^[A-Za-z]/.test(columns[0].trim())) {
            studentName = columns[0];
            matricule = columns[1]?.replace(/,/g, '') || '';
            genderCol = columns[2]?.toLowerCase()?.trim() || '';
          }
        } else if (
          columns.length === 1 &&
          /^[A-Za-z]/.test(columns[0].trim())
        ) {
          // Single column starting with letter is the name
          studentName = columns[0];
        }

        // Additional cleaning: remove trailing punctuation and extra spaces
        studentName = studentName.replace(/[.]+$/, '').trim();

        // Skip if student name is empty, purely numeric, or doesn't start with a letter
        if (
          !studentName?.trim() ||
          /^\d+$/.test(studentName.trim()) ||
          !/^[A-Za-z]/.test(studentName.trim())
        ) {
          continue;
        }

        // Determine gender with various possible values
        let gender: 'male' | 'female' = 'male'; // default
        if (genderCol) {
          if (
            ['female', 'f', 'féminin', 'femme', 'girl', 'fille'].includes(
              genderCol
            )
          ) {
            gender = 'female';
          } else if (
            ['male', 'm', 'masculin', 'homme', 'boy', 'garçon'].includes(
              genderCol
            )
          ) {
            gender = 'male';
          }
        }

        // Capitalize names properly
        studentName = studentName
          .split(' ')
          .map(
            word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(' ');

        students.push({
          studentName: studentName.trim(),
          matricule: matricule || undefined,
          gender,
        });
      }
    }

    return students;
  };

  const handleImportStudents = () => {
    if (!selectedReport) return;

    let students: Array<{
      studentName: string;
      matricule?: string;
      gender: 'male' | 'female';
    }> = [];

    if (importFile) {
      students = parseCSVContent(importText);
    } else if (importText.trim()) {
      students = parseStudentList(importText);
    }

    if (students.length === 0) {
      toast({
        title: lang === 'fr' ? 'Erreur' : 'Error',
        description: lang === 'fr' ? 'Aucun élève trouvé' : 'No students found',
        variant: 'destructive',
      });
      return;
    }

    importMutation.mutate(students);
  };

  const openImportModal = () => {
    setIsImportModalOpen(true);
    setImportText('');
    setImportFile(null);
  };

  const toggleSort = (field: 'name' | 'grade' | 'matricule') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Sort student grades
  const sortedStudentGrades = useMemo(() => {
    if (!studentGrades.length) return [];

    return [...studentGrades].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.studentName.toLowerCase();
          bValue = b.studentName.toLowerCase();
          break;
        case 'grade':
          aValue = a.grade || 0;
          bValue = b.grade || 0;
          break;
        case 'matricule':
          aValue = a.matricule || '';
          bValue = b.matricule || '';
          break;
        default:
          aValue = a.studentName.toLowerCase();
          bValue = b.studentName.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [studentGrades, sortBy, sortOrder]);

  // Form for creating grade reports
  const reportForm = useForm<GradeReportFormData>({
    resolver: zodResolver(gradeReportSchema),
    defaultValues: {
      className: '',
      subject: user?.teacherSubject || '',
      term: '',
      gradingPeriod: '',
      coursesExpected: 0,
      coursesDone: 0,
      expectedPeriodHours: 0,
      periodHoursDone: 0,
      tpTdExpected: 0,
      tpTdDone: 0,
    },
  });

  // Form for adding/editing student grades
  const gradeForm = useForm<StudentGradeFormData>({
    resolver: zodResolver(studentGradeSchema),
    defaultValues: {
      studentName: '',
      gender: 'male',
      matricule: '',
      grade: undefined,
      remarks: '',
    },
  });

  // Create grade report mutation
  const createReportMutation = useMutation({
    mutationFn: async (data: GradeReportFormData) => {
      const reportData = {
        ...data,
        teacherId: user?.id,
        academicYear: '2024-2025',
      };
      const res = await apiRequest('POST', '/api/grade-reports', reportData);
      if (!res) throw new Error('Failed to create grade report');
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: lang === 'fr' ? 'Rapport créé' : 'Report Created',
        description:
          lang === 'fr'
            ? 'Le rapport de notes a été créé avec succès.'
            : 'Grade report has been created successfully.',
      });
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({
        queryKey: ['/api/grade-reports', user?.id],
      });
    },
    onError: (error: Error) => {
      toast({
        title: lang === 'fr' ? 'Erreur' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create student grade mutation
  const createGradeMutation = useMutation({
    mutationFn: async (data: StudentGradeFormData) => {
      if (!selectedReport) throw new Error('No report selected');
      const res = await apiRequest(
        'POST',
        `/api/grade-reports/${selectedReport.id}/grades`,
        data
      );
      if (!res) throw new Error('Failed to create student grade');
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: lang === 'fr' ? 'Note créée' : 'Grade Created',
        description:
          lang === 'fr'
            ? "La note de l'étudiant a été créée avec succès."
            : 'Student grade has been created successfully.',
      });
      setIsGradeModalOpen(false);
      queryClient.invalidateQueries({
        queryKey: ['/api/grade-reports', selectedReport?.id, 'grades'],
      });
    },
    onError: (error: Error) => {
      toast({
        title: lang === 'fr' ? 'Erreur' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update student grade mutation
  const updateGradeMutation = useMutation({
    mutationFn: async (data: StudentGradeFormData) => {
      if (!editingGrade) throw new Error('No grade selected for editing');
      try {
        const res = await apiRequest(
          'PUT',
          `/api/grade-reports/${selectedReport?.id}/grades/${editingGrade.id}`,
          data
        );
        if (!res) throw new Error('Failed to update student grade');
        return await res.json();
      } catch (error: any) {
        return {
          success: false,
          message: 'Failed to update student grade',
        };
      }
    },
    onSuccess: () => {
      toast({
        title: lang === 'fr' ? 'Note mise à jour' : 'Grade Updated',
        description:
          lang === 'fr'
            ? "La note de l'étudiant a été mise à jour avec succès."
            : 'Student grade has been updated successfully.',
      });
      setIsGradeModalOpen(false);
      setEditingGrade(null);
      queryClient.invalidateQueries({
        queryKey: ['/api/grade-reports', selectedReport?.id, 'grades'],
      });
    },
    onError: (error: Error) => {
      toast({
        title: lang === 'fr' ? 'Erreur' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const finalizeReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const res = await apiRequest(
        'POST',
        `/api/grade-reports/${reportId}/finalize`
      );
      if (!res) throw new Error('Failed to finalize report');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/grade-reports', user?.id],
      });
      toast({
        title: lang === 'fr' ? 'Succès' : 'Success',
        description:
          lang === 'fr'
            ? 'Bulletin finalisé avec succès'
            : 'Grade report finalized successfully',
      });
    },
    onError: () => {
      toast({
        title: lang === 'fr' ? 'Erreur' : 'Error',
        description:
          lang === 'fr'
            ? 'Échec de la finalisation'
            : 'Failed to finalize report',
        variant: 'destructive',
      });
    },
  });

  const deleteGradeMutation = useMutation({
    mutationFn: async (gradeId: string) => {
      const res = await apiRequest(
        'DELETE',
        `/api/grade-reports/${selectedReport?.id}/grades/${gradeId}`
      );
      if (!res) throw new Error('Failed to delete grade');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/grade-reports', selectedReport?.id, 'grades'],
      });
      toast({
        title: lang === 'fr' ? 'Succès' : 'Success',
        description:
          lang === 'fr'
            ? 'Note supprimée avec succès'
            : 'Grade deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: lang === 'fr' ? 'Erreur' : 'Error',
        description:
          lang === 'fr' ? 'Échec de la suppression' : 'Failed to delete grade',
        variant: 'destructive',
      });
    },
  });

  // Import students mutation
  const importMutation = useMutation({
    mutationFn: async (
      students: Array<{
        studentName: string;
        matricule?: string;
        gender: 'male' | 'female';
      }>
    ) => {
      if (!selectedReport) throw new Error('No report selected');

      const createPromises = students.map(student =>
        apiRequest(
          'POST',
          `/api/grade-reports/${selectedReport.id}/grades`,
          student
        )
      );

      await Promise.all(createPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/grade-reports', selectedReport?.id, 'grades'],
      });
      setIsImportModalOpen(false);
      setImportText('');
      setImportFile(null);
      toast({
        title: lang === 'fr' ? 'Succès' : 'Success',
        description:
          lang === 'fr'
            ? 'Élèves importés avec succès'
            : 'Students imported successfully',
      });
    },
    onError: (error: any) => {
      console.error('Failed to import students:', error);
      toast({
        title: lang === 'fr' ? 'Erreur' : 'Error',
        description:
          lang === 'fr'
            ? "Échec de l'importation"
            : 'Failed to import students',
        variant: 'destructive',
      });
    },
  });

  const onCreateReport = (data: GradeReportFormData) => {
    createReportMutation.mutate(data);
  };

  const onSubmitGrade = (data: StudentGradeFormData) => {
    if (editingGrade) {
      updateGradeMutation.mutate(data);
    } else {
      createGradeMutation.mutate(data);
    }
  };

  const openEditGrade = (grade: StudentGrade) => {
    setEditingGrade(grade);
    gradeForm.reset({
      studentName: grade.studentName,
      gender: grade.gender as 'male' | 'female',
      matricule: grade.matricule || '',
      grade: grade.grade || undefined,
      remarks: grade.remarks || '',
    });
    setIsGradeModalOpen(true);
  };

  const openAddGrade = () => {
    setEditingGrade(null);
    gradeForm.reset({
      studentName: '',
      gender: 'male',
      matricule: '',
      grade: undefined,
      remarks: '',
    });
    setIsGradeModalOpen(true);
  };

  const downloadGradeReport = (report: GradeReport) => {
    // Fetch current grades for the report
    const currentGrades = studentGrades || [];
    const statistics = calculateStatistics(currentGrades);

    // Generate HTML content for the grade report
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Grade Report - ${report.className} - ${report.subject}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .school-info { margin-bottom: 20px; }
        .report-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .students-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .students-table th, .students-table td { border: 1px solid #333; padding: 8px; text-align: left; }
        .students-table th { background-color: #f5f5f5; font-weight: bold; }
        .statistics { margin-top: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .stat-box { border: 1px solid #333; padding: 15px; }
        .signature-section { margin-top: 40px; display: flex; justify-content: space-between; }
        .signature-box { text-align: center; width: 200px; }
        .signature-line { border-bottom: 1px solid #333; margin-bottom: 5px; height: 50px; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>GOVERNMENT BILINGUAL HIGH SCHOOL BAFIA</h1>
        <h2>GRADE REPORT</h2>
    </div>
    
    <div class="school-info">
        <p><strong>Academic Year:</strong> ${report.academicYear}</p>
        <p><strong>Term:</strong> ${report.term}</p>
        <p><strong>Grading Period:</strong> ${report.gradingPeriod}</p>
    </div>
    
    <div class="report-info">
        <div>
            <p><strong>Class:</strong> ${report.className}</p>
            <p><strong>Subject:</strong> ${report.subject}</p>
        </div>
        <div>
            <p><strong>Teacher:</strong> ${user?.fullName || user?.username}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
    </div>
    
    <table class="students-table">
        <thead>
            <tr>
                <th>No.</th>
                <th>Student Name</th>
                <th>Matricule</th>
                <th>Gender</th>
                <th>Grade (/20)</th>
                <th>Remarks</th>
            </tr>
        </thead>
        <tbody>
            ${currentGrades
              .map(
                (grade, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${grade.studentName}</td>
                    <td>${grade.matricule || 'N/A'}</td>
                    <td>${grade.gender === 'male' ? 'M' : 'F'}</td>
                    <td>${grade.grade || 'N/A'}</td>
                    <td>${grade.remarks || ''}</td>
                </tr>
            `
              )
              .join('')}
        </tbody>
    </table>
    
    <div class="statistics">
        <h3>Grade Statistics</h3>
        <div class="stats-grid">
            <div class="stat-box">
                <h4>Overall Performance</h4>
                <p>Total Students: ${statistics.totalStudents}</p>
                <p>Students Above 10/20: ${statistics.studentsAbove10}</p>
                <p>Students Below 10/20: ${statistics.studentsBelow10}</p>
                <p>Pass Rate: ${statistics.passRate.toFixed(1)}%</p>
            </div>
            <div class="stat-box">
                <h4>Performance by Gender</h4>
                <p>Female Students Above 10/20: ${statistics.femaleAbove10}</p>
                <p>Female Students Below 10/20: ${statistics.femaleBelow10}</p>
                <p>Male Students Above 10/20: ${statistics.maleAbove10}</p>
                <p>Male Students Below 10/20: ${statistics.maleBelow10}</p>
            </div>
        </div>
    </div>
    
    <div class="signature-section">
        <div class="signature-box">
            <div class="signature-line"></div>
            <p>Teacher Signature</p>
        </div>
        <div class="signature-box">
            <div class="signature-line"></div>
            <p>Principal Signature</p>
        </div>
    </div>
</body>
</html>`;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Grade_Report_${report.className}_${report.subject}_${report.term}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: lang === 'fr' ? 'Succès' : 'Success',
      description:
        lang === 'fr'
          ? 'Bulletin téléchargé avec succès'
          : 'Grade report downloaded successfully',
    });
  };

  const shareGradeReport = (report: GradeReport) => {
    if (navigator.share) {
      navigator
        .share({
          title: `Grade Report - ${report.className} - ${report.subject}`,
          text: `Grade report for ${report.className} in ${report.subject} - ${report.term}`,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: lang === 'fr' ? 'Succès' : 'Success',
          description:
            lang === 'fr'
              ? 'Lien copié dans le presse-papiers'
              : 'Link copied to clipboard',
        });
      });
    }
  };

  // Overview stats (replace with real data as needed)
  const stats = [
    {
      icon: Users,
      label: lang === 'fr' ? 'Élèves' : 'Students',
      value: '120',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: BookOpen,
      label: lang === 'fr' ? 'Cours' : 'Courses',
      value: '8',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Award,
      label: lang === 'fr' ? 'Moyenne Classe' : 'Class Avg.',
      value: '13.2',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: TrendingUp,
      label: lang === 'fr' ? 'Taux de Réussite' : 'Pass Rate',
      value: '92%',
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  // Grade Reports Management Section
  function GradeReportsManagement() {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');

    // Fetch grade reports with pagination
    const {
      data: reportsData,
      isLoading,
      refetch,
    } = useQuery({
      queryKey: ['grade-reports', user?.id, page, limit, search],
      queryFn: async () => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          search,
          teacherId: user?.id || '',
        });
        const res = await fetch(`/api/grade-reports?${params}`);
        if (!res.ok) throw new Error('Failed to fetch grade reports');
        return res.json();
      },
      enabled: !!user?.id,
    });

    // Table columns
    const columns = [
      { key: 'className', label: t('Class') },
      { key: 'subject', label: t('Subject') },
      { key: 'term', label: t('Term') },
      { key: 'gradingPeriod', label: t('Period') },
      {
        key: 'isFinalized',
        label: t('Status'),
        render: (v: boolean) => (v ? t('Finalized') : t('Draft')),
      },
      {
        key: 'actions',
        label: t('Actions'),
        render: (_: any, row: any) => (
          <div className="flex gap-2">
            {/* Add edit/delete/finalize buttons here */}
          </div>
        ),
      },
    ];

    // Pagination
    const pagination = reportsData?.pagination || {
      page,
      totalPages: 1,
      total: 0,
      limit,
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('Grade Reports')}
          </h2>
          {/* Add create button here */}
        </div>
        <div className="mb-4 flex gap-2">
          <Input
            placeholder={t('Search by class or subject...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                {columns.map(col => (
                  <th
                    key={col.key}
                    className="px-4 py-2 text-left font-semibold text-gray-700"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8">
                    Loading...
                  </td>
                </tr>
              ) : reportsData?.data?.length ? (
                reportsData.data.map((row: any) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-2">
                        {col.render
                          ? col.render(row[col.key], row)
                          : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8">
                    {t('No grade reports found.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Bottom Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            {t('Showing')}{' '}
            {Math.min(
              (pagination.page - 1) * pagination.limit + 1,
              pagination.total
            )}{' '}
            {t('to')}{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
            {t('of')} {pagination.total} {t('results')}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              {t('Previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages}
            >
              {t('Next')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Student Grades Management Component
  function StudentGradesManagement() {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedReport, setSelectedReport] = useState<GradeReport | null>(
      null
    );
    const [filters, setFilters] = useState({
      subject: '',
      academicYear: '',
      term: '',
    });

    // Fetch grade reports for teacher
    const { data: gradeReports = [], isLoading: reportsLoading } = useQuery({
      queryKey: ['grade-reports', user?.id],
      queryFn: async () => {
        const res = await apiRequest(
          'GET',
          `/api/grade-reports?teacherId=${user?.id}`
        );
        if (!res) throw new Error('Failed to fetch grade reports');
        const data = await res.json();
        return data.reports || [];
      },
      enabled: !!user?.id,
    });

    // Fetch student grades for selected report
    const {
      data: studentGrades = [],
      isLoading: gradesLoading,
      refetch,
    } = useQuery({
      queryKey: [
        'student-grades',
        selectedReport?.id,
        currentPage,
        itemsPerPage,
      ],
      queryFn: async () => {
        if (!selectedReport) return { grades: [], pagination: { total: 0 } };
        const res = await apiRequest(
          'GET',
          `/api/grade-reports/${selectedReport.id}/grades?page=${currentPage}&limit=${itemsPerPage}`
        );
        if (!res) throw new Error('Failed to fetch student grades');
        const data = await res.json();
        return data;
      },
      enabled: !!selectedReport,
    });

    // Create grade mutation
    const createGradeMutation = useMutation({
      mutationFn: async (data: StudentGradeFormData) => {
        const res = await apiRequest(
          'POST',
          `/api/grade-reports/${selectedReport?.id}/grades`,
          data
        );
        if (!res) throw new Error('Failed to create grade');
        return res.json();
      },
      onSuccess: () => {
        refetch();
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description:
            language === 'fr'
              ? 'Note créée avec succès'
              : 'Grade created successfully',
        });
      },
      onError: (error: Error) => {
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });

    // Update grade mutation
    const updateGradeMutation = useMutation({
      mutationFn: async ({
        id,
        data,
      }: {
        id: string;
        data: Partial<StudentGradeFormData>;
      }) => {
        const res = await apiRequest('PUT', `/api/student-grades/${id}`, data);
        if (!res) throw new Error('Failed to update grade');
        return res.json();
      },
      onSuccess: () => {
        refetch();
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description:
            language === 'fr'
              ? 'Note mise à jour avec succès'
              : 'Grade updated successfully',
        });
      },
      onError: (error: Error) => {
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });

    // Delete grade mutation
    const deleteGradeMutation = useMutation({
      mutationFn: async (id: string) => {
        const res = await apiRequest('DELETE', `/api/student-grades/${id}`);
        if (!res) throw new Error('Failed to delete grade');
      },
      onSuccess: () => {
        refetch();
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description:
            language === 'fr'
              ? 'Note supprimée avec succès'
              : 'Grade deleted successfully',
        });
      },
      onError: (error: Error) => {
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });

    const handleCreateGrade = (data: StudentGradeFormData) => {
      createGradeMutation.mutate(data);
    };

    const handleUpdateGrade = (
      id: string,
      data: Partial<StudentGradeFormData>
    ) => {
      updateGradeMutation.mutate({ id, data });
    };

    const handleDeleteGrade = (id: string) => {
      deleteGradeMutation.mutate(id);
    };

    const grades = studentGrades?.grades || [];
    const pagination = studentGrades?.pagination;
    const totalPages = pagination
      ? Math.ceil(pagination.total / itemsPerPage)
      : 0;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {language === 'fr'
                    ? 'Gestion des Notes'
                    : 'Student Grades Management'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {language === 'fr'
                    ? 'Saisir et gérer les notes des étudiants'
                    : 'Enter and manage student grades'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Report Selection */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'fr' ? 'Sélectionner un Rapport' : 'Select Report'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedReport?.id || ''}
              onValueChange={value => {
                const report = gradeReports.find((r: any) => r.id === value);
                setSelectedReport(report || null);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    language === 'fr'
                      ? 'Choisir un rapport...'
                      : 'Choose a report...'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {gradeReports.map((report: any) => (
                  <SelectItem key={report.id} value={report.id}>
                    {report.className} - {report.subject} ({report.term})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedReport && (
          <>
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'fr' ? 'Filtres' : 'Filters'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>{language === 'fr' ? 'Matière' : 'Subject'}</Label>
                    <Input
                      placeholder={
                        language === 'fr'
                          ? 'Filtrer par matière...'
                          : 'Filter by subject...'
                      }
                      value={filters.subject}
                      onChange={e =>
                        setFilters(prev => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>
                      {language === 'fr' ? 'Année Académique' : 'Academic Year'}
                    </Label>
                    <Input
                      placeholder={
                        language === 'fr'
                          ? 'Filtrer par année...'
                          : 'Filter by year...'
                      }
                      value={filters.academicYear}
                      onChange={e =>
                        setFilters(prev => ({
                          ...prev,
                          academicYear: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>{language === 'fr' ? 'Terme' : 'Term'}</Label>
                    <Input
                      placeholder={
                        language === 'fr'
                          ? 'Filtrer par terme...'
                          : 'Filter by term...'
                      }
                      value={filters.term}
                      onChange={e =>
                        setFilters(prev => ({ ...prev, term: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grades Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {language === 'fr'
                      ? 'Notes des Étudiants'
                      : 'Student Grades'}
                  </CardTitle>
                  <Button onClick={() => setIsGradeModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Ajouter Note' : 'Add Grade'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {gradesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : grades.length > 0 ? (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">
                              {language === 'fr' ? 'Nom' : 'Name'}
                            </th>
                            <th className="text-left p-2">
                              {language === 'fr' ? 'Matricule' : 'Student ID'}
                            </th>
                            <th className="text-left p-2">
                              {language === 'fr' ? 'Note' : 'Grade'}
                            </th>
                            <th className="text-left p-2">
                              {language === 'fr' ? 'Remarques' : 'Remarks'}
                            </th>
                            <th className="text-left p-2">
                              {language === 'fr' ? 'Actions' : 'Actions'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {grades.map((grade: any) => (
                            <tr
                              key={grade.id}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="p-2">{grade.studentName}</td>
                              <td className="p-2">{grade.matricule}</td>
                              <td className="p-2">
                                <Badge
                                  variant={
                                    grade.grade && grade.grade >= 10
                                      ? 'default'
                                      : 'destructive'
                                  }
                                >
                                  {grade.grade || 'N/A'}
                                </Badge>
                              </td>
                              <td className="p-2">{grade.remarks || '-'}</td>
                              <td className="p-2">
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingGrade(grade);
                                      setIsGradeModalOpen(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteGrade(grade.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-600">
                          {language === 'fr'
                            ? `Page ${currentPage} sur ${totalPages}`
                            : `Page ${currentPage} of ${totalPages}`}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage(prev => Math.max(1, prev - 1))
                            }
                            disabled={currentPage === 1}
                          >
                            {language === 'fr' ? 'Précédent' : 'Previous'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage(prev =>
                                Math.min(totalPages, prev + 1)
                              )
                            }
                            disabled={currentPage === totalPages}
                          >
                            {language === 'fr' ? 'Suivant' : 'Next'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {language === 'fr'
                      ? 'Aucune note trouvée'
                      : 'No grades found'}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Grade Modal */}
        <Dialog open={isGradeModalOpen} onOpenChange={setIsGradeModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingGrade
                  ? language === 'fr'
                    ? 'Modifier la Note'
                    : 'Edit Grade'
                  : language === 'fr'
                    ? 'Ajouter une Note'
                    : 'Add Grade'}
              </DialogTitle>
            </DialogHeader>
            <Form {...gradeForm}>
              <form
                onSubmit={gradeForm.handleSubmit(
                  editingGrade
                    ? data => {
                        handleUpdateGrade(editingGrade.id, data);
                        setIsGradeModalOpen(false);
                        setEditingGrade(null);
                      }
                    : data => {
                        handleCreateGrade(data);
                        setIsGradeModalOpen(false);
                      }
                )}
              >
                <div className="space-y-4">
                  <FormField
                    control={gradeForm.control}
                    name="studentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {language === 'fr'
                            ? "Nom de l'étudiant"
                            : 'Student Name'}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={gradeForm.control}
                    name="matricule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {language === 'fr' ? 'Matricule' : 'Student ID'}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={gradeForm.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {language === 'fr' ? 'Note' : 'Grade'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            step="0.01"
                            {...field}
                            onChange={e =>
                              field.onChange(
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={gradeForm.control}
                    name="remarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {language === 'fr' ? 'Remarques' : 'Remarks'}
                        </FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsGradeModalOpen(false);
                      setEditingGrade(null);
                    }}
                  >
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                  <Button type="submit">
                    {editingGrade
                      ? language === 'fr'
                        ? 'Mettre à jour'
                        : 'Update'
                      : language === 'fr'
                        ? 'Ajouter'
                        : 'Add'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Add getUserInitials function
  const getUserInitials = () => {
    if (user?.fullName) {
      return user.fullName.substring(0, 2).toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Placeholder components for other management sections
  function StatisticsManagement() {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Statistiques' : 'Statistics'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'fr'
                  ? 'Analyses et rapports détaillés'
                  : 'Detailed analytics and reports'}
              </p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">
              {language === 'fr'
                ? 'Section en cours de développement'
                : 'Section under development'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  function StudentsManagement() {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'fr'
                  ? 'Gestion des Étudiants'
                  : 'Students Management'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'fr'
                  ? 'Gérer la liste des étudiants'
                  : 'Manage student list'}
              </p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">
              {language === 'fr'
                ? 'Section en cours de développement'
                : 'Section under development'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Placeholder for Calendar Management
  function CalendarManagement() {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Calendar</h2>
        <p>School events and exam calendar will be shown here.</p>
      </div>
    );
  }

  function AwardsManagement() {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/50 dark:to-amber-950/50 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg shadow-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Récompenses' : 'Awards'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'fr'
                  ? 'Gestion des prix et récompenses'
                  : 'Award and recognition management'}
              </p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">
              {language === 'fr'
                ? 'Section en cours de développement'
                : 'Section under development'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  function MessagesManagement() {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Messages' : 'Messages'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'fr'
                  ? 'Communication avec les étudiants et parents'
                  : 'Communication with students and parents'}
              </p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">
              {language === 'fr'
                ? 'Section en cours de développement'
                : 'Section under development'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Import/Export Management (Excel Grading Workflow)
  const CLASS_LIST = [
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

  const CLASS_FOLDER_MAP: Record<string, string> = {
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

  // 1. Group classes into French and English sub-systems
  const ENGLISH_CLASSES = [
    'Form 1',
    'Form 2',
    'Form 3',
    'Form 4',
    'Form 5',
    'Lower Six',
    'Upper 6',
  ];
  const FRENCH_CLASSES = [
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

  // ... existing code ...

  // 2. Wrap ImportExportManagement with GradeEditorContext.Provider
  function ImportExportManagement(props: {
    fullPageEditor?: boolean;
    onClose?: () => void;
  }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [selectedClass, setSelectedClass] = React.useState('');
    const [templates, setTemplates] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [uploadedFiles, setUploadedFiles] = React.useState<any[]>([]);
    const [uploading, setUploading] = React.useState(false);
    const [shareModalOpen, setShareModalOpen] = React.useState(false);
    const [shareFile, setShareFile] = React.useState<any>(null);
    const [shareEmail, setShareEmail] = React.useState('');
    const [sharing, setSharing] = React.useState(false);
    const [shareFileId, setShareFileId] = React.useState<string | null>(null);
    const [shareMessage, setShareMessage] = React.useState('');
    const [shareLoading, setShareLoading] = React.useState(false);
    const [editorOpen, setEditorOpen] = React.useState(false);
    const [editorData, setEditorData] = React.useState<any[][]>([]);
    const [editorFileName, setEditorFileName] = React.useState('');
    const [editorClass, setEditorClass] = React.useState('');
    const [term, setTerm] = React.useState('');
    // Add state for the fillable fields at the top of ImportExportManagement
    const [stats, setStats] = React.useState({
      statistiques: '',
      lessonsPlanned: '',
      lessonsDone: '',
      hoursPlanned: '',
      hoursDone: '',
    });
    const [allRows, setAllRows] = React.useState<any[][]>([]);
    const [isReturningFromFullPage, setIsReturningFromFullPage] =
      React.useState(false);
    // Add upload preview state inside ImportExportManagement
    const [uploadPreviewFile, setUploadPreviewFile] =
      React.useState<File | null>(null);
    const [uploadPreviewData, setUploadPreviewData] = React.useState<any[][]>(
      []
    );
    const [showUploadPreview, setShowUploadPreview] = React.useState(false);
    // Add state for editing
    const [editingFileId, setEditingFileId] = React.useState<string | null>(
      null
    );
    const [editingFileMeta, setEditingFileMeta] = React.useState<any>(null);

    // Check if we're returning from full page
    React.useEffect(() => {
      if (typeof window !== 'undefined') {
        const referrer = document.referrer;
        if (referrer.includes('/teacher/import-export')) {
          setIsReturningFromFullPage(true);
        }
      }
    }, []);

    // Load saved state from sessionStorage on component mount
    React.useEffect(() => {
      const stateStr =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('gradeEditorState')
          : null;
      if (stateStr) {
        try {
          const state = JSON.parse(stateStr);
          setEditorData(state.editorData || []);
          setEditorFileName(state.editorFileName || '');
          setEditorClass(state.editorClass || '');
          setTerm(state.term || '');
          setStats(state.stats || {});
          setAllRows(state.allRows || []);
          // Only auto-open if we're not returning from full page
          if (
            state.editorData &&
            state.editorData.length > 0 &&
            !isReturningFromFullPage
          ) {
            setEditorOpen(true);
          }
        } catch (error) {
          console.error('Error loading saved state:', error);
        }
      }
    }, []);

    let compCoords = null;
    let statsCoords = null;
    for (let i = 0; i < allRows.length; i++) {
      for (let j = 0; j < allRows[i].length; j++) {
        if (allRows[i][j] === 'COMPETENCES TRIMESTRIELLES VISEES') {
          compCoords = { row: i, col: j };
        }
        if (allRows[i][j] === 'STATISTIQUES ANNUELLES DE CONSEIL') {
          statsCoords = { row: i, col: j };
        }
      }
    }

    // Fetch templates for selected class
    React.useEffect(() => {
      if (!selectedClass) return;
      setLoading(true);
      const folderName = CLASS_FOLDER_MAP[selectedClass] || selectedClass;
      fetch(`/api/grading-templates/${encodeURIComponent(folderName)}`)
        .then(res => res.json())
        .then(data => {
          setTemplates(data.templates || []);
          setLoading(false);
        })
        .catch(() => setTemplates([]));
    }, [selectedClass]);

    // Fetch uploaded files (stubbed, replace with real API call)
    React.useEffect(() => {
      // TODO: Replace with API call to /api/file-uploads?uploadedBy=teacherId&relatedType=grading
      setUploadedFiles([
        // Example stub
        // { name: 'grades-math-2024.xlsx', url: '/uploads/teacher-grades/teacher1/2024-06-01/grades-math-2024.xlsx', uploadedAt: '2024-06-01', id: '1' },
      ]);
    }, [user?.id]);

    // 2. Update handleFileChange to show preview first
    const handleFileChange = async (
      e: React.ChangeEvent<HTMLInputElement>,
      editMeta?: { id: string; meta: any }
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!user?.id) {
        toast({
          title: 'Error',
          description: 'User not authenticated',
          variant: 'destructive',
        });
        return;
      }
      if (editMeta) {
        setEditingFileId(editMeta.id);
        setEditingFileMeta(editMeta.meta);
      } else {
        setEditingFileId(null);
        setEditingFileMeta(null);
      }
      setUploadPreviewFile(file);
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const previewRows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          }) as any[][];
          setUploadPreviewData(
            previewRows.slice(0, 10).map(row => row.slice(0, 10))
          );
          setShowUploadPreview(true);
        } catch (err) {
          toast({
            title: 'Error',
            description: 'Failed to read file',
            variant: 'destructive',
          });
        }
      };
      reader.readAsArrayBuffer(file);
    };

    // 3. Add function to handle actual upload after preview approval
    const handleUploadApproval = async () => {
      if (!uploadPreviewFile || !user?.id) return;
      setUploading(true);
      try {
        if (editingFileId) {
          await fetch(`/api/file-uploads?id=${editingFileId}`, {
            method: 'DELETE',
          });
        }
        const formData = new FormData();
        formData.append('file', uploadPreviewFile);
        formData.append(
          'relatedType',
          editingFileMeta?.relatedType || 'grading'
        );
        formData.append(
          'relatedId',
          editingFileMeta?.relatedId || `${user.id}-${Date.now()}`
        );
        formData.append('uploadedBy', user.id);
        formData.append(
          'folder',
          editingFileMeta?.folder ||
            `teacher-grades/${user.id}/${new Date().toISOString().slice(0, 10)}`
        );
        const res = await fetch('/api/file-uploads', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          toast({
            title: 'Success',
            description: editingFileId
              ? 'File replaced successfully'
              : 'File uploaded successfully',
          });
          fetch(`/api/file-uploads?uploadedBy=${user.id}&relatedType=grading`)
            .then(res => res.json())
            .then(data => setUploadedFiles(data.fileUploads || []));
        } else {
          toast({
            title: 'Error',
            description: data.message || 'Upload failed',
            variant: 'destructive',
          });
        }
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Upload failed',
          variant: 'destructive',
        });
      } finally {
        setUploading(false);
        props.onClose?.();
      }
    };

    // 4. Add function to cancel upload preview
    const handleUploadCancel = () => {
      setShowUploadPreview(false);
      setUploadPreviewFile(null);
      setUploadPreviewData([]);
    };

    // Handle share
    const handleShare = async () => {
      if (!shareFileId || !shareEmail) return;
      setShareLoading(true);
      try {
        const res = await fetch('/api/file-uploads/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileId: shareFileId,
            recipientEmail: shareEmail,
            message: shareMessage,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast({
            title: 'File Shared',
            description: 'The file was shared and an email notification sent.',
            variant: 'default',
          });
          setShareModalOpen(false);
          setShareEmail('');
          setShareMessage('');
          setShareFileId(null);
          // Refresh uploaded files (optional)
          if (user?.id) {
            fetch(`/api/file-uploads?uploadedBy=${user.id}&relatedType=grading`)
              .then(res => res.json())
              .then(data => {
                setUploadedFiles(data.fileUploads || []);
              });
          }
        } else {
          toast({
            title: 'Share Failed',
            description: data.message || 'Failed to share file',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Share Failed',
          description: 'Failed to share file',
          variant: 'destructive',
        });
      } finally {
        setShareLoading(false);
      }
    };

    // Handle "Fill Grades Online" button
    const handleFillOnline = async (templateFile: string) => {
      setLoading(true);
      try {
        const folderName = CLASS_FOLDER_MAP[selectedClass] || selectedClass;
        const res = await fetch(
          `/grading-templates/${encodeURIComponent(folderName)}/${encodeURIComponent(templateFile)}`
        );
        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const allRows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as any[][];
        // Table header
        const tableHeader = ['Ide', 'NOM ET PRENOM', 'NOTE 1', 'NOTE 2'];
        // Extract rows: NOM ET PRENOM from col E (index 4), NOTE 1-6 from cols F-K (5-10), from row 4 (index 3)
        const filteredRows = allRows
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
        setEditorData(tableData);
        setEditorFileName(templateFile);
        setEditorClass(selectedClass);
        setAllRows(allRows);
        setEditorOpen(true); // open the modal after loading data
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to load template',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    // Update handleCellChange to handle both editorData and allRows updates with validation
    const handleCellChange = (
      rowIdx: number,
      colIdx: number,
      value: string
    ) => {
      // Determine if this is francophone or english system based on class
      const isFrancophone =
        editorClass &&
        [
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
        ].includes(editorClass);
      const maxGrade = isFrancophone ? 20 : 100;

      // Handle editorData updates (main grade table) - NOTE 1 and NOTE 2
      if (rowIdx > 0 && colIdx >= 2 && colIdx <= 3) {
        const validatedValue = validateGradeInput(value, maxGrade);
        setEditorData(prev => {
          const newData = prev.map(row => [...row]);
          newData[rowIdx][colIdx] = validatedValue;
          return newData;
        });
      }

      // Handle allRows updates (right-side tables)
      setAllRows(prev => {
        const newRows = prev.map(row => [...row]);
        if (newRows[rowIdx] && newRows[rowIdx][colIdx] !== undefined) {
          // Apply appropriate validation based on context
          let validatedValue = value;
          if (typeof value === 'string' && value.trim() !== '') {
            // For numeric fields, use numeric validation
            if (colIdx === 1 || colIdx === 9 || colIdx === 10) {
              validatedValue = validateNumericInput(value);
            } else {
              // For text fields, sanitize input
              validatedValue = sanitizeTextInput(value);
            }
          }
          newRows[rowIdx][colIdx] = validatedValue;
        }
        return newRows;
      });
    };

    // Add a separate function for updating stats state
    const handleStatsChange = (field: string, value: string) => {
      setStats(prev => ({
        ...prev,
        [field]: value,
      }));
    };

    // Input validation functions
    const validateGradeInput = (
      value: string,
      maxGrade: number = 20
    ): string => {
      // Remove any non-numeric characters except decimal point
      let sanitized = value.replace(/[^0-9.]/g, '');

      // Ensure only one decimal point
      const parts = sanitized.split('.');
      if (parts.length > 2) {
        sanitized = parts[0] + '.' + parts.slice(1).join('');
      }

      // Convert to number and validate range
      const numValue = parseFloat(sanitized);
      if (isNaN(numValue)) return '';
      if (numValue < 0) return '0';
      if (numValue > maxGrade) return maxGrade.toString();

      return sanitized;
    };

    const validateNumericInput = (value: string): string => {
      // Remove any non-numeric characters
      return value.replace(/[^0-9]/g, '');
    };

    const sanitizeTextInput = (value: string): string => {
      // Remove potentially dangerous characters and limit length
      return value
        .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .substring(0, 500); // Limit length
    };

    // Function to save current state to sessionStorage
    const saveStateToSession = () => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'gradeEditorState',
          JSON.stringify({
            editorData,
            editorFileName,
            editorClass,
            term,
            stats,
            allRows,
          })
        );
      }
    };

    // Save state whenever any of the key data changes
    React.useEffect(() => {
      if (editorData.length > 0 || editorFileName || editorClass) {
        saveStateToSession();
      }
    }, [editorData, editorFileName, editorClass, term, stats, allRows]);

    // Handle finalize/upload
    const handleFinalizeUpload = async () => {
      if (!user?.id) {
        toast({
          title: 'Error',
          description: 'User not authenticated',
          variant: 'destructive',
        });
        return;
      }

      // Convert editorData back to Excel file
      const ws = XLSX.utils.aoa_to_sheet(editorData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const outFile = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      const subject = editorFileName.replace('.xlsx', '');
      const originalName = `${subject}-${term}-NOTE_1|2.xlsx`;
      const file = new File([outFile], originalName, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Upload file with required fields
      const formData = new FormData();
      formData.append('file', file);
      formData.append('relatedType', 'grading');
      formData.append('relatedId', `${user.id}-${Date.now()}`);
      formData.append('uploadedBy', user.id);

      setUploading(true);
      try {
        const res = await fetch('/api/file-uploads', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Upload failed');
        }

        const result = await res.json();
        if (result.success) {
          sessionStorage.removeItem('gradeEditorState');
          sessionStorage.removeItem('openFullPage');
          toast({
            title: language === 'fr' ? 'Succès' : 'Success',
            description:
              language === 'fr'
                ? 'Notes téléchargées avec succès!'
                : 'Grades uploaded successfully!',
            variant: 'default',
          });
          setEditorOpen(false);
          // Refresh uploaded files
          fetch(`/api/file-uploads?uploadedBy=${user.id}&relatedType=grading`)
            .then(res => res.json())
            .then(data => setUploadedFiles(data.fileUploads || []));
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      } catch (err) {
        console.error('Error uploading grades', err);
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description:
            language === 'fr'
              ? 'Échec du téléchargement'
              : 'Failed to upload grades',
          variant: 'destructive',
        });
      } finally {
        setUploading(false);
      }
    };

    // Add context value
    const contextValue = {
      editorData,
      setEditorData,
      editorFileName,
      setEditorFileName,
      editorClass,
      setEditorClass,
      term,
      setTerm,
      stats,
      setStats,
      allRows,
      setAllRows,
      setEditorOpen,
    };

    // Add this function:
    const resetModalState = () => {
      setShowUploadPreview(false);
      setUploadPreviewFile(null);
      setUploadPreviewData([]);
      setEditingFileId(null);
      setEditingFileMeta(null);
    };

    return (
      <GradeEditorContext.Provider value={contextValue}>
        <div className="p-8 space-y-8">
          <h2 className="text-2xl font-bold mb-4">
            {language === 'fr'
              ? 'Import/Export des Fichiers de Notes'
              : 'Import/Export Grading Excel Files'}
          </h2>
          {/* Class Selector */}
          <div className="mb-6 flex items-start gap-6">
            <div className="flex-1">
              <Card>
                <CardHeader>
                  <h4 className="text-blue-700 font-bold mb-2">
                    {language === 'fr'
                      ? 'Système Anglais'
                      : 'English Sub-system'}
                  </h4>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {ENGLISH_CLASSES.map(cls => (
                      <button
                        key={cls}
                        className={`rounded-lg px-4 py-2 font-medium border transition-colors shadow-sm text-sm ${selectedClass === cls ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
                        onClick={() => setSelectedClass(cls)}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex items-center h-full">
              <div className="w-px h-32 bg-gray-300 mx-4" />{' '}
              {/* vertical bar */}
            </div>
            <div className="flex-1">
              <Card>
                <CardHeader>
                  <h4 className="text-green-700 font-bold mb-2">
                    {language === 'fr'
                      ? 'Système Francophone'
                      : 'French Sub-system'}
                  </h4>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {FRENCH_CLASSES.map(cls => (
                      <button
                        key={cls}
                        className={`rounded-lg px-4 py-2 font-medium border transition-colors shadow-sm text-sm ${selectedClass === cls ? 'bg-green-600 text-white border-green-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50'}`}
                        onClick={() => setSelectedClass(cls)}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Template List */}
          {selectedClass && (
            <div className="mb-6">
              <h3 className="font-semibold mb-4 text-lg">
                {language === 'fr'
                  ? 'Modèles de Notes Disponibles'
                  : 'Available Grade Templates'}{' '}
                <span className="text-blue-700 font-bold">{selectedClass}</span>
              </h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">
                    {language === 'fr'
                      ? 'Chargement des modèles...'
                      : 'Loading templates...'}
                  </span>
                </div>
              ) : templates.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">
                      {language === 'fr'
                        ? 'Aucun modèle trouvé pour cette classe.'
                        : 'No templates found for this class.'}
                    </p>
                </div>
              ) : (
                    <div className="space-y-4">
                      {/* Search Input */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={language === 'fr' ? 'Rechercher un sujet...' : 'Search for a subject...'}
                          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>

                      {/* Scrollable Template Grid */}
                      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {templates
                            .filter(file => {
                              const subjectName = file.replace('.xlsx', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                              return subjectName.toLowerCase().includes(searchTerm.toLowerCase());
                            })
                            .map(file => {
                              // Extract subject name from filename (remove .xlsx extension)
                              const subjectName = file.replace('.xlsx', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                          // Get subject icon based on subject name
                          const getSubjectIcon = (subject: string) => {
                            const lowerSubject = subject.toLowerCase();
                            if (lowerSubject.includes('math') || lowerSubject.includes('mathematics')) {
                              return '∑'; // Math symbol
                            } else if (lowerSubject.includes('physics')) {
                              return '⚡'; // Lightning bolt
                            } else if (lowerSubject.includes('chemistry')) {
                              return '⚗️'; // Test tube
                            } else if (lowerSubject.includes('english')) {
                              return '📚'; // Book
                            } else if (lowerSubject.includes('informatique') || lowerSubject.includes('computer')) {
                              return '💻'; // Computer
                            } else {
                              return '📝'; // Default document
                            }
                          };

                          const subjectIcon = getSubjectIcon(subjectName);

                          return (
                            <div
                              key={file}
                              className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-4"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="text-2xl">{subjectIcon}</div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900 capitalize">
                                      {subjectName}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      {language === 'fr' ? 'Modèle Excel' : 'Excel Template'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col space-y-2">
                                <Button
                                  onClick={() => handleFillOnline(file)}
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                  size="sm"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  {language === 'fr'
                                    ? 'Remplir en Ligne'
                                    : 'Fill Online'}
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => {
                                    const folderName = CLASS_FOLDER_MAP[selectedClass] || selectedClass;
                                    const url = `/grading-templates/${encodeURIComponent(folderName)}/${encodeURIComponent(file)}`;
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = file;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  {language === 'fr' ? 'Télécharger' : 'Download'}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                        {templates.filter(file => {
                          const subjectName = file.replace('.xlsx', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          return subjectName.toLowerCase().includes(searchTerm.toLowerCase());
                        }).length === 0 && searchTerm && (
                            <div className="text-center py-8">
                              <div className="text-gray-400 text-4xl mb-2">🔍</div>
                              <p className="text-gray-500">
                                {language === 'fr'
                                  ? 'Aucun sujet trouvé pour cette recherche.'
                                  : 'No subjects found for this search.'}
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
              )}
            </div>
          )}
          <div className="my-6 border-t border-gray-400" />
          <div className="mb-6">
            <h3 className="font-semibold mb-2">
              {language === 'fr'
                ? 'Télécharger le Fichier de Notes Rempli'
                : 'Upload Filled Grading File'}
            </h3>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              disabled={uploading || showUploadPreview}
              className="mb-2"
            />
            {uploading && (
              <span className="text-blue-600 ml-2">
                {language === 'fr' ? 'Téléchargement...' : 'Uploading...'}
              </span>
            )}
          </div>
          <div className="my-6 border-t border-gray-400" />
          <div>
            <h3 className="font-semibold mb-2">
              {language === 'fr'
                ? 'Vos Fichiers Téléchargés'
                : 'Your Uploaded Files'}
            </h3>
            {uploadedFiles.length === 0 ? (
              <div className="text-gray-500">
                {language === 'fr'
                  ? 'Aucun fichier téléchargé.'
                  : 'No files uploaded yet.'}
              </div>
            ) : (
              <ul className="space-y-2">
                {uploadedFiles.map(file => (
                  <li
                    key={file.id || file.name}
                    className="flex flex-col gap-2 bg-gray-50 rounded-lg px-4 py-2 shadow-sm border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">
                          {file.name}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {file.uploadedAt
                            ? new Date(file.uploadedAt).toLocaleDateString()
                            : ''}
                        </span>
                      </div>
                      <a
                        href={file.url}
                        download
                        className="text-blue-600 underline text-sm"
                      >
                        {language === 'fr' ? 'Télécharger' : 'Download'}
                      </a>
                      {/* PDF Preview Button */}
                      {file.name.endsWith('.pdf') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setFilePreview(file.url)}
                        >
                          {language === 'fr' ? 'Aperçu PDF' : 'Preview PDF'}
                        </Button>
                      )}
                      {/* Google Sheets Button */}
                      {file.name.endsWith('.xlsx') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(
                              `https://docs.google.com/spreadsheets/u/0/import?hl=en&pli=1`,
                              '_blank'
                            )
                          }
                        >
                          {language === 'fr'
                            ? 'Voir dans Google Sheets'
                            : 'View in Google Sheets'}
                        </Button>
                      )}
                      <Dialog
                        open={shareModalOpen && shareFile?.id === file.id}
                        onOpenChange={open => {
                          setShareModalOpen(open);
                          if (!open) setShareFile(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShareFile(file);
                              setShareModalOpen(true);
                            }}
                          >
                            {language === 'fr' ? 'Partager' : 'Share'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {language === 'fr'
                                ? 'Partager le Fichier'
                                : 'Share File'}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              type="email"
                              placeholder={
                                language === 'fr'
                                  ? 'Adresse e-mail du destinataire'
                                  : 'Recipient email'
                              }
                              value={shareEmail}
                              onChange={e => setShareEmail(e.target.value)}
                              disabled={sharing}
                            />
                            <Textarea
                              placeholder={
                                language === 'fr' ? 'Message' : 'Message'
                              }
                              value={shareMessage}
                              onChange={e => setShareMessage(e.target.value)}
                              disabled={sharing}
                            />
                            <Button
                              onClick={handleShare}
                              disabled={sharing || !shareEmail}
                              className="w-full"
                            >
                              {sharing
                                ? language === 'fr'
                                  ? 'Partage en cours...'
                                  : 'Sharing...'
                                : language === 'fr'
                                  ? 'Partager'
                                  : 'Share'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {file.uploadedBy === user?.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Load file data into modal for editing
                            setEditingFileId(file.id);
                            setEditingFileMeta(file);
                            setEditorOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                    {/* PDF Preview Modal */}
                    {filePreview === file.url && file.name.endsWith('.pdf') && (
                      <div className="mt-2 w-full h-96 border rounded bg-white flex items-center justify-center">
                        <iframe
                          src={file.url}
                          title="PDF Preview"
                          className="w-full h-full"
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Dialog open={editorOpen}>
            <DialogContent className="max-w-7xl w-full h-[95vh] flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
              <DialogHeader className="bg-white rounded-t-lg shadow-sm border-b border-gray-200 p-6">
                <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Fill Grades: {editorFileName} ({editorClass})
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-6">
                {/* Header Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="text-center font-bold text-xl text-gray-800 mb-4">
                    LYCEE BILINGUE DE BAFIA. RELEVE DE NOTES
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">
                        {language === 'fr' ? 'CLASSE' : 'CLASS'}:
                      </span>
                      <span className="text-blue-600 font-medium">
                        {editorClass}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">
                        {language === 'fr' ? 'MATIERE' : 'SUBJECT'}:
                      </span>
                      <span className="text-blue-600 font-medium">
                        {editorFileName.replace('.xlsx', '')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">
                        {language === 'fr' ? 'TRIMESTRE' : 'TERM'}:
                      </span>
                      <Input
                        value={term}
                        onChange={e => setTerm(e.target.value)}
                        className="w-24 h-8 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-gray-500"
                        placeholder="1/2/3"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">
                        {language === 'fr' ? 'ENSEIGNANT' : 'TEACHER'}:
                      </span>
                      <span className="text-blue-600 font-medium">
                        {user?.fullName || user?.username}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Main Grade Table */}
                  <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Student Grades
                      </h3>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      {editorData && editorData.length > 1 ? (
                        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                          <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                              {editorData[0].map((cell, colIdx) => (
                                <th
                                  key={colIdx}
                                  className={`px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200 ${
                                    colIdx === 0
                                      ? 'w-16'
                                      : colIdx === 1
                                        ? 'min-w-[200px]'
                                        : 'w-24 text-center'
                                  }`}
                                >
                                  {cell}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {editorData.slice(1).map((row, rowIdx) => {
                              // Determine if this is francophone or english system based on class
                              const isFrancophone =
                                editorClass &&
                                [
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
                                ].includes(editorClass);

                              return (
                                <tr
                                  key={rowIdx}
                                  className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                                    rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                  }`}
                                >
                                  {row.map((cell, colIdx) => (
                                    <td
                                      key={colIdx}
                                      className={`px-4 py-3 border-r border-gray-100 last:border-r-0 ${
                                        colIdx === 0
                                          ? 'text-center font-medium text-gray-600 bg-gray-50'
                                          : colIdx === 1
                                            ? 'font-medium text-gray-800'
                                            : 'text-center'
                                      }`}
                                    >
                                      {colIdx === 2 || colIdx === 3 ? (
                                        <Input
                                          value={cell || ''}
                                          onChange={e =>
                                            handleCellChange(
                                              rowIdx + 1,
                                              colIdx,
                                              e.target.value
                                            )
                                          }
                                          className="w-full h-8 text-center border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                          placeholder={
                                            isFrancophone ? '0-20' : '0-100'
                                          }
                                        />
                                      ) : (
                                        <span
                                          className={
                                            colIdx === 0
                                              ? 'font-semibold text-gray-700'
                                              : ''
                                          }
                                        >
                                          {cell}
                                        </span>
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center text-gray-500 py-12">
                          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No student data found in this template.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side Tables */}
                  <div className="lg:w-80 space-y-4">
                    {/* Statistics Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3">
                        <h4 className="text-sm font-semibold text-white">
                          {language === 'fr' ? 'Statistiques' : 'Statistics'}
                        </h4>
                      </div>
                      <div className="p-4">
                        <table className="w-full text-xs border border-gray-200 rounded">
                          <thead>
                            <tr className="bg-gray-50">
                              <th
                                className="border px-2 py-1 text-left font-medium"
                                colSpan={2}
                              >
                                {allRows[7]?.[0] || language === 'fr'
                                  ? 'Statistiques'
                                  : 'Statistics'}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {allRows &&
                              allRows.slice(8, 14).map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="border px-2 py-1 text-left text-sm">
                                    {row[0]}
                                  </td>
                                  <td className="border px-2 py-1 text-left">
                                    <Input
                                      value={String(row[1] || '')}
                                      onChange={e => {
                                        const validatedValue =
                                          validateNumericInput(e.target.value);
                                        const newRows = [...allRows];
                                        newRows[idx + 8][1] = validatedValue;
                                        setAllRows(newRows);
                                      }}
                                      className="w-full h-6 text-xs border-gray-300 focus:border-green-500 focus:ring-green-500"
                                      placeholder="0"
                                    />
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Competencies Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-3">
                        <h4 className="text-sm font-semibold text-white">
                          {language === 'fr' ? 'Competences' : 'Competencies'}
                        </h4>
                      </div>
                      <div className="p-4">
                        <table className="w-full text-xs border border-gray-200 rounded">
                          <thead>
                            <tr className="bg-gray-50">
                              <th
                                className="border px-2 py-1 text-left font-medium"
                                colSpan={3}
                              >
                                {allRows[compCoords?.row || 0]?.[
                                  compCoords?.col || 0
                                ] || language === 'fr'
                                  ? 'Competences'
                                  : 'Competencies'}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {allRows &&
                              allRows.slice(4, 5).map((row, idx) => (
                                <tr key={idx}>
                                  <td
                                    className="border px-2 py-1 text-left"
                                    colSpan={3}
                                  >
                                    <Textarea
                                      value={String(row[8] || '')}
                                      onChange={e => {
                                        const sanitizedValue =
                                          sanitizeTextInput(e.target.value);
                                        const newRows = [...allRows];
                                        newRows[idx + 4][8] = sanitizedValue;
                                        setAllRows(newRows);
                                      }}
                                      className="w-full text-xs border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                      rows={4}
                                      placeholder={
                                        language === 'fr'
                                          ? 'Entrez les compétences...'
                                          : 'Enter competencies...'
                                      }
                                    />
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Annual Statistics Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-orange-600 to-red-600 px-4 py-3">
                        <h4 className="text-sm font-semibold text-white">
                          {language === 'fr'
                            ? 'Statistiques annuelles'
                            : 'Annual Statistics'}
                        </h4>
                      </div>
                      <div className="p-4">
                        <table className="w-full text-xs border border-gray-200 rounded">
                          <thead>
                            <tr className="bg-gray-50">
                              <th
                                className="border px-2 py-1 text-left font-medium"
                                colSpan={3}
                              >
                                {allRows[statsCoords?.row || 0]?.[
                                  statsCoords?.col || 0
                                ] || language === 'fr'
                                  ? 'Statistiques annuelles'
                                  : 'Annual Statistics'}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border px-2 py-1 text-left text-sm">
                                {language === 'fr'
                                  ? 'Leçons Prévues'
                                  : 'Lessons Planned'}
                              </td>
                              <td className="border px-2 py-1 text-left">
                                <Input
                                  value={String(allRows[8]?.[9] || '')}
                                  onChange={e => {
                                    const validatedValue = validateNumericInput(
                                      e.target.value
                                    );
                                    const newRows = [...allRows];
                                    newRows[8][9] = validatedValue;
                                    setAllRows(newRows);
                                  }}
                                  className="w-full h-6 text-xs border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                  placeholder="0"
                                />
                              </td>
                              <td
                                className="border px-2 py-1 text-left text-sm"
                                rowSpan={3}
                              >
                                {allRows[8]?.[10] || ''}
                              </td>
                            </tr>
                            <tr>
                              <td className="border px-2 py-1 text-left text-sm">
                                {language === 'fr'
                                  ? 'Heures Prévues'
                                  : 'Hours Planned'}
                              </td>
                              <td className="border px-2 py-1 text-left">
                                <Input
                                  value={String(allRows[9]?.[9] || '')}
                                  onChange={e => {
                                    const validatedValue = validateNumericInput(
                                      e.target.value
                                    );
                                    const newRows = [...allRows];
                                    newRows[9][9] = validatedValue;
                                    setAllRows(newRows);
                                  }}
                                  className="w-full h-6 text-xs border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                  placeholder="0"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="border px-2 py-1 text-left text-sm">
                                {language === 'fr'
                                  ? 'TP/TD Prévus'
                                  : 'TP/TD Planned'}
                              </td>
                              <td className="border px-2 py-1 text-left">
                                <Input
                                  value={String(allRows[10]?.[9] || '')}
                                  onChange={e => {
                                    const validatedValue = validateNumericInput(
                                      e.target.value
                                    );
                                    const newRows = [...allRows];
                                    newRows[10][9] = validatedValue;
                                    setAllRows(newRows);
                                  }}
                                  className="w-full h-6 text-xs border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                  placeholder="0"
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-white border-t border-gray-200 p-6 rounded-b-lg">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {editorData && editorData.length > 1
                      ? `${editorData.length - 1} students loaded`
                      : 'No students found'}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setEditorOpen(false)}
                      disabled={uploading}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      {language === 'fr' ? 'Annuler' : 'Cancel'}
                    </Button>
                    {/* Show "Open in Full Page" button when in modal */}
                    {editorOpen && (
                      <Button
                        onClick={() => {
                          sessionStorage.setItem('openFullPage', '1');
                          router.push('/teacher/import-export');
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {language === 'fr'
                          ? 'Ouvrir dans la page complète'
                          : 'Open in Full Page'}
                      </Button>
                    )}
                    <Button
                      onClick={handleFinalizeUpload}
                      disabled={uploading}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                      {uploading ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {language === 'fr'
                            ? 'Finaliser et Télécharger'
                            : 'Finalize & Upload'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Upload Preview Modal */}
          <Dialog
            open={showUploadPreview}
            onOpenChange={open => {
              if (!open) {
                setShowUploadPreview(false);
                setUploadPreviewFile(null);
                setUploadPreviewData([]);
              }
            }}
          >
            <DialogContent className="max-w-4xl w-full">
              <DialogHeader>
                <div className="flex items-center justify-between w-full">
                  <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    {language === 'fr' ? 'Aperçu du Fichier' : 'Preview File'}
                  </DialogTitle>
                  <button
                    type="button"
                    aria-label="Close"
                    className="text-gray-400 hover:text-gray-700 text-2xl font-bold px-2 focus:outline-none"
                    onClick={() => {
                      resetModalState();
                      props.onClose?.();
                    }}
                    disabled={uploading}
                  >
                    {language === 'fr' ? 'Fermer' : 'Close'}
                  </button>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    {language === 'fr'
                      ? 'Informations du Fichier'
                      : 'File Information'}
                  </h4>
                  <p className="text-sm text-blue-700">
                    <strong>{language === 'fr' ? 'Nom' : 'Name'}:</strong>{' '}
                    {uploadPreviewFile?.name}
                    <br />
                    <strong>
                      {language === 'fr' ? 'Taille' : 'Size'}:
                    </strong>{' '}
                    {uploadPreviewFile?.size
                      ? (uploadPreviewFile.size / 1024 / 1024).toFixed(2)
                      : 'Unknown'}{' '}
                    MB
                    <br />
                    <strong>{language === 'fr' ? 'Type' : 'Type'}:</strong>{' '}
                    {uploadPreviewFile?.type}
                  </p>
                </div>

                {uploadPreviewData.length > 0 && (
                  <div className="bg-white rounded shadow p-4 border border-gray-200">
                    <h4 className="font-semibold mb-2 text-gray-800">
                      {language === 'fr'
                        ? 'Aperçu du Fichier (10 premières lignes)'
                        : 'File Preview (First 10 rows)'}
                    </h4>
                    <div className="overflow-x-auto max-h-96">
                      <table className="min-w-full text-xs border">
                        <tbody>
                          {uploadPreviewData.map((row, i) => (
                            <tr
                              key={i}
                              className={
                                i === 0 ? 'bg-gray-100 font-semibold' : ''
                              }
                            >
                              {row.map((cell, j) => (
                                <td key={j} className="border px-2 py-1">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    ⚠️ Important
                  </h4>
                  <p className="text-sm text-yellow-700">
                    {language === 'fr'
                      ? "Veuillez examiner le contenu du fichier ci-dessus. Une fois que vous l'avez approuvé, ce fichier sera téléchargé dans la base de données et ne pourra plus être annulé."
                      : 'Please review the file content above. Once you approve, this file will be uploaded to the database and cannot be undone.'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetModalState();
                    props.onClose?.();
                  }}
                  disabled={uploading}
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </Button>
                <Button
                  onClick={handleUploadApproval}
                  disabled={uploading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {uploading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {language === 'fr'
                        ? 'Approuver et Télécharger'
                        : 'Approve & Upload'}
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </GradeEditorContext.Provider>
    );
  }

  // Placeholder for Settings Management
  function SettingsManagement() {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        <p>Teacher account and preferences settings will be shown here.</p>
      </div>
    );
  }

  // At the top of TeacherDashboard, add:
  const [importExportModalOpen, setImportExportModalOpen] = useState(false);

  // Modal close handler: resets all modal state and sets URL to /teacher
  const closeImportExportModal = () => {
    setImportExportModalOpen(false);
    if (window.location.search.includes('section=importExport')) {
      router.replace('/teacher');
    }
  };

  // In TeacherDashboard, add this effect:
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    // Listen for section change
    if (activeSection !== 'importExport') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('section') === 'importExport') {
        url.searchParams.delete('section');
        window.history.replaceState({}, '', '/teacher');
      }
    }
  }, [activeSection]);

  if (user?.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {lang === 'fr'
                  ? 'Accès Enseignant Requis'
                  : 'Teacher Access Required'}
              </h2>
              <p className="text-gray-600 mb-6">
                {lang === 'fr'
                  ? "Vous devez être connecté en tant qu'enseignant pour accéder à cette page."
                  : 'You must be logged in as a teacher to access this page.'}
              </p>
              <div className="flex space-x-3 justify-center">
                <Button variant="outline" onClick={() => window.history.back()}>
                  {lang === 'fr' ? 'Retour' : 'Go Back'}
                </Button>
                <Button asChild>
                  <Link href="/">{lang === 'fr' ? 'Accueil' : 'Home'}</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">
              {lang === 'fr' ? 'Portail Enseignant' : 'Teacher Portal'}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Home */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/')}
              className="flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>{language === 'fr' ? 'Accueil' : 'Home'}</span>
            </Button>

            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="flex items-center space-x-2"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'fr' ? 'EN' : 'FR'}</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center space-x-2"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* Logout */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'fr' ? 'Déconnexion' : 'Logout'}</span>
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-10 w-10 rounded-full p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          (user as any).profileImageUrl ??
                          'https://via.placeholder.com/150'
                        }
                      />
                      <AvatarFallback className="bg-blue-600 text-white font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.fullName || user.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.role === 'teacher' ? 'Teacher' : 'User'}
                    </p>
                  </div>
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Voir le profil' : 'View Profile'}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Paramètres' : 'Settings'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Content Layout (with sidebar and content) */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <div className="hidden md:block w-64 border-r bg-white">
          <TeacherSidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            sections={[
              'gradeReports',
              'studentGrades',
              'calendar',
              'importExport',
              'settings',
            ]} // pass only the required sections
          />
        </div>
        {/* Main Content */}
        <div className="flex-1">
          <div className="container mx-auto px-6 py-8">
            {/* Section Content */}
            {activeSection === 'dashboard' && (
              <div>
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {language === 'fr'
                          ? 'Tableau de Bord Enseignant'
                          : 'Teacher Dashboard'}
                      </h1>
                      <p className="text-gray-600 mt-1">
                        {language === 'fr'
                          ? 'Bienvenue sur votre espace enseignant GBHS Bafia'
                          : 'Welcome to your GBHS Bafia teacher portal'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats Bar */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          120
                        </div>
                        <div className="text-sm text-gray-600">
                          {language === 'fr' ? 'Élèves' : 'Students'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          8
                        </div>
                        <div className="text-sm text-gray-600">
                          {language === 'fr' ? 'Cours' : 'Courses'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          13.2
                        </div>
                        <div className="text-sm text-gray-600">
                          {language === 'fr' ? 'Moyenne Classe' : 'Class Avg.'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          92%
                        </div>
                        <div className="text-sm text-gray-600">
                          {language === 'fr' ? 'Taux de Réussite' : 'Pass Rate'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Quick Actions */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        {language === 'fr'
                          ? 'Actions Rapides'
                          : 'Quick Actions'}
                      </h2>
                      <div className="space-y-3">
                        <Button
                          onClick={() => handleSectionChange('gradeReports')}
                          className="w-full justify-start"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          {language === 'fr'
                            ? 'Nouveau Rapport'
                            : 'New Grade Report'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleSectionChange('studentGrades')}
                          className="w-full justify-start"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          {language === 'fr' ? 'Saisir Notes' : 'Enter Grades'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleSectionChange('statistics')}
                          className="w-full justify-start"
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          {language === 'fr'
                            ? 'Voir Statistiques'
                            : 'View Statistics'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Recent Grade Reports */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        {language === 'fr'
                          ? 'Rapports Récents'
                          : 'Recent Grade Reports'}
                      </h2>
                      {reportsLoading ? (
                        <div className="text-center py-8">Loading...</div>
                      ) : gradeReports.length > 0 ? (
                        <div className="space-y-3">
                          {gradeReports.slice(0, 5).map(report => (
                            <div
                              key={report.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <h3 className="font-medium">
                                  {report.className} - {report.subject}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {report.term} | {report.gradingPeriod}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  report.isFinalized ? 'default' : 'secondary'
                                }
                              >
                                {report.isFinalized
                                  ? language === 'fr'
                                    ? 'Finalisé'
                                    : 'Finalized'
                                  : language === 'fr'
                                    ? 'Brouillon'
                                    : 'Draft'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          {language === 'fr'
                            ? 'Aucun rapport trouvé'
                            : 'No reports found'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grade Reports Management Section */}
            {activeSection === 'gradeReports' && <GradeReportsManagement />}

            {/* Student Grades Management Section */}
            {activeSection === 'studentGrades' && <StudentGradesManagement />}

            {/* Statistics Section */}
            {/* {activeSection === 'statistics' && <StatisticsManagement />} */}

            {/* Calendar Section */}
            {activeSection === 'calendar' && <CalendarManagement />}

            {/* Settings Section */}
            {activeSection === 'settings' && <SettingsManagement />}

            {/* Import/Export Section */}
            {activeSection === 'importExport' && (
              <ImportExportManagement fullPageEditor={false} />
            )}
          </div>
        </div>
      </div>

      {/* Import/Export Modal */}
      <Dialog
        open={importExportModalOpen}
        onOpenChange={open => {
          if (!open) closeImportExportModal();
        }}
      >
        <DialogContent className="max-w-7xl w-full h-[95vh] flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
          <DialogHeader>
            <div className="flex items-center justify-between w-full">
              <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <Upload className="w-6 h-6 text-blue-600" />
                {language === 'fr'
                  ? 'Import/Export des fichiers de notes'
                  : 'Import/Export Grading Files'}
              </DialogTitle>
              <button
                type="button"
                aria-label="Close"
                className="text-gray-400 hover:text-gray-700 text-2xl font-bold px-2 focus:outline-none"
                onClick={closeImportExportModal}
              >
                ×
              </button>
            </div>
          </DialogHeader>
          <ImportExportManagement
            fullPageEditor={false}
            onClose={closeImportExportModal}
            // pass modal state setters if needed
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
