'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  BookOpen,
  Shield,
  MessageSquare,
  TrendingUp,
  Search,
  Clock,
  Send,
  AlertTriangle,
  GraduationCap,
  Home,
  LogOut,
  Globe,
  Sun,
  Moon,
  User,
  BarChart3,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
} from 'lucide-react';
import { useLanguage } from '../../../hooks/use-language';
import {
  insertBookingSchema,
  insertAnonymousReportSchema,
  insertPetitionSchema,
  type InsertBooking,
  type InsertAnonymousReport,
  type InsertPetition,
  type Booking,
  type StudentResult,
  type AnonymousReport,
  type Petition,
} from '../../../schema';
import { apiRequest, queryClient } from '../../../lib/queryClient';
import { useToast } from '../../../hooks/use-toast';
import { Header } from '../../globals/layout/header';
import { Footer } from '../../globals/layout/footer';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/use-auth';
import { getApiUrl } from '../../../lib/utils';

// Form schemas
const reportSchema = insertAnonymousReportSchema.extend({
  incidentDate: z.string().optional(),
});

const petitionSchema = insertPetitionSchema;

type ReportFormData = z.infer<typeof reportSchema>;
type PetitionFormData = z.infer<typeof petitionSchema>;

export default function StudentPortal() {
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('Term 1');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const router = useRouter();
  const { logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Query for student results
  const {
    data: studentResultsResponse,
    isLoading: resultsLoading,
    error: resultsError,
  } = useQuery<{
    success: boolean;
    results: StudentResult[];
  }>({
    queryKey: ['student-results', 'current-student'],
    queryFn: async () => {
      try {
        // For now, return empty results since we don't have authentication context
        // In a real implementation, this would come from the authenticated user's session
        console.log(
          'Student results query disabled - no authentication context'
        );
        return {
          success: true,
          results: [],
        };
      } catch (error) {
        console.error('Error fetching student results:', error);
        return {
          success: false,
          results: [],
        };
      }
    },
    enabled: false, // Disable the query for now
  });

  // Query for petitions
  const {
    data: petitionsResponse,
    isLoading: petitionsLoading,
    error: petitionsError,
  } = useQuery<{
    success: boolean;
    petitions: Petition[];
  }>({
    queryKey: ['/api/petitions'],
    queryFn: async () => {
      try {
        const response = await fetch(getApiUrl('/api/petitions'));
        if (!response.ok) {
          throw new Error('Failed to fetch petitions');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching petitions:', error);
        return {
          success: false,
          petitions: [],
        };
      }
    },
  });

  // Safely access the data arrays from the responses
  const studentResults = studentResultsResponse?.results || [];
  const petitions = petitionsResponse?.petitions || [];

  // Anonymous report form
  const reportForm = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportType: 'sexual_harassment',
      urgencyLevel: 'medium',
      description: '',
      location: '',
      involvedParties: '',
      witnesses: '',
      evidenceDescription: '',
    },
  });

  // Petition form
  const petitionForm = useForm<PetitionFormData>({
    resolver: zodResolver(petitionSchema),
    defaultValues: {
      petitionType: 'grade_appeal',
      academicYear: '2024-2025',
      studentName: '',
      studentId: '',
      className: '',
      email: '',
      title: '',
      description: '',
      requestedAction: '',
    },
  });

  // Submit anonymous report
  const reportMutation = useMutation({
    mutationFn: async (data: ReportFormData) => {
      const submitData = {
        ...data,
        incidentDate: data.incidentDate
          ? new Date(data.incidentDate).toISOString()
          : undefined,
      };
      try {
        const res = await apiRequest(
          'POST',
          '/api/anonymous-reports',
          submitData
        );
        if (!res) throw new Error('Failed to submit report');
        return await res.json();
      } catch (error) {
        console.error('Error submitting report:', error);
        throw new Error('Failed to submit report');
      }
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Rapport soumis' : 'Report Submitted',
        description:
          language === 'fr'
            ? 'Votre rapport a été soumis de manière anonyme et sera traité confidentiellement.'
            : 'Your report has been submitted anonymously and will be handled confidentially.',
      });
      reportForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Submit petition
  const petitionMutation = useMutation({
    mutationFn: async (data: PetitionFormData) => {
      const res = await apiRequest('POST', '/api/petitions', data);
      if (!res) throw new Error('Failed to submit petition');
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Pétition soumise' : 'Petition Submitted',
        description:
          language === 'fr'
            ? "Votre pétition a été soumise et sera examinée par l'administration."
            : 'Your petition has been submitted and will be reviewed by the administration.',
      });
      petitionForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/petitions'] });
    },
    onError: (error: Error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onReportSubmit = (data: ReportFormData) => {
    reportMutation.mutate(data);
  };

  const onPetitionSubmit = (data: PetitionFormData) => {
    petitionMutation.mutate(data);
  };

  // Get recent activity
  const getRecentActivity = () => {
    // Implement logic to fetch recent activity
    return [
      {
        icon: <BookOpen className="w-6 h-6 text-green-600" />,
        title: 'New Report Submitted',
        description: 'A new anonymous report has been submitted',
        time: 'Just now',
        iconBg: 'bg-green-100 rounded-full p-2',
      },
      {
        icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
        title: 'New Petition Submitted',
        description: 'A new petition has been submitted',
        time: '2 minutes ago',
        iconBg: 'bg-blue-100 rounded-full p-2',
      },
    ];
  };

  // Action handlers for results
  const handleViewResult = (result: StudentResult) => {
    // Implement view logic - could open a modal or navigate to detail page
    toast({
      title: language === 'fr' ? 'Voir le résultat' : 'View Result',
      description: `${language === 'fr' ? 'Résultat de' : 'Result for'} ${result.studentName}`,
    });
  };

  const handleEditResult = (result: StudentResult) => {
    // Implement edit logic - could open an edit modal
    toast({
      title: language === 'fr' ? 'Modifier le résultat' : 'Edit Result',
      description: `${language === 'fr' ? 'Modification du résultat de' : 'Editing result for'} ${result.studentName}`,
    });
  };

  // Delete result mutation
  const deleteResultMutation = useMutation({
    mutationFn: async (resultId: string) => {
      const response = await apiRequest(
        'DELETE',
        `/api/student-results/${resultId}`
      );
      if (!response) throw new Error('Failed to delete result');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description:
          language === 'fr'
            ? 'Résultat supprimé avec succès'
            : 'Result deleted successfully',
      });
      // Invalidate and refetch results
      queryClient.invalidateQueries({ queryKey: ['/api/student-results'] });
    },
    onError: (error: Error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDeleteResult = (resultId: string) => {
    if (
      confirm(
        language === 'fr'
          ? 'Êtes-vous sûr de vouloir supprimer ce résultat ?'
          : 'Are you sure you want to delete this result?'
      )
    ) {
      deleteResultMutation.mutate(resultId);
    }
  };

  // Update result mutation
  const updateResultMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<StudentResult>;
    }) => {
      const response = await apiRequest(
        'PUT',
        `/api/student-results/${id}`,
        data
      );
      if (!response) throw new Error('Failed to update result');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description:
          language === 'fr'
            ? 'Résultat mis à jour avec succès'
            : 'Result updated successfully',
      });
      // Invalidate and refetch results
      queryClient.invalidateQueries({ queryKey: ['/api/student-results'] });
    },
    onError: (error: Error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Filter and pagination logic
  const filteredResults = studentResults.filter(result => {
    const matchesSearch =
      !searchStudent ||
      result.studentName?.toLowerCase().includes(searchStudent.toLowerCase()) ||
      result.studentId?.toLowerCase().includes(searchStudent.toLowerCase());

    const matchesClass =
      selectedClass === 'all' || result.className === selectedClass;
    const matchesTerm = result.term === selectedTerm;

    return matchesSearch && matchesClass && matchesTerm;
  });

  const totalItems = filteredResults.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchStudent, selectedClass, selectedTerm, itemsPerPage]);

  // Group results by class and student
  const resultsByClass = filteredResults.reduce(
    (acc, result) => {
      if (!acc[result.className]) {
        acc[result.className] = {};
      }
      if (!acc[result.className][result.studentId]) {
        acc[result.className][result.studentId] = {
          studentName: result.studentName,
          studentId: result.studentId,
          results: [],
        };
      }
      acc[result.className][result.studentId].results.push(result);
      return acc;
    },
    {} as Record<
      string,
      Record<
        string,
        { studentName: string; studentId: string; results: StudentResult[] }
      >
    >
  );

  // Get unique classes
  const availableClasses = Array.from(
    new Set(studentResults?.map(r => r.className) || [])
  );

  // Calculate grade statistics
  const getGradeStats = (results: StudentResult[]) => {
    const totalMarks = results.reduce((sum, r) => sum + (r.totalMarks || 0), 0);
    const average = results.length > 0 ? totalMarks / results.length : 0;
    const gradeCount = results.reduce(
      (acc, r) => {
        acc[r.grade || 'N/A'] = (acc[r.grade || 'N/A'] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return { average, gradeCount, total: results.length };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_investigation':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-green-600 font-semibold';
      case 'B':
        return 'text-blue-600 font-semibold';
      case 'C':
        return 'text-yellow-600 font-semibold';
      case 'D':
        return 'text-orange-600 font-semibold';
      case 'E':
      case 'F':
        return 'text-red-600 font-semibold';
      default:
        return 'text-gray-600';
    }
  };

  const getOverallAverage = () => {
    const totalMarks = studentResults.reduce(
      (sum, r) => sum + (r.totalMarks || 0),
      0
    );
    const average =
      studentResults.length > 0 ? totalMarks / studentResults.length : 0;
    return average.toFixed(1);
  };

  const getOverallPosition = () => {
    const sortedResults = [...studentResults].sort(
      (a, b) => (b.totalMarks || 0) - (a.totalMarks || 0)
    );
    const position =
      sortedResults.findIndex(
        r => r.studentId === studentResults[0].studentId
      ) + 1;
    return position;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">
              {language === 'fr' ? 'Portail Étudiant' : 'Student Portal'}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
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

            {/* User Profile */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>{language === 'fr' ? 'Profil' : 'Profile'}</span>
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
          </div>
        </div>
      </div>

      <div className="flex pt-16">
        {/* Fixed Sidebar */}
        <div className="w-64 bg-white shadow-lg fixed left-0 top-16 h-screen overflow-hidden">
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'fr' ? 'Navigation' : 'Navigation'}
              </h2>
              <div className="w-12 h-1 bg-blue-600 rounded"></div>
            </div>

            {/* Student Management Links */}
            <nav className="space-y-2">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  {language === 'fr'
                    ? 'Gestion Étudiante'
                    : 'Student Management'}
                </h3>

                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'overview'
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 mr-3" />
                    {language === 'fr' ? "Vue d'ensemble" : 'Overview'}
                  </button>

                  <button
                    onClick={() => setActiveTab('results')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'results'
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 mr-3" />
                    {language === 'fr' ? 'Résultats' : 'Results'}
                  </button>

                  <button
                    onClick={() => setActiveTab('report')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'report'
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Shield className="w-4 h-4 mr-3" />
                    {language === 'fr' ? 'Signalement' : 'Report'}
                  </button>

                  <button
                    onClick={() => setActiveTab('petition')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'petition'
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 mr-3" />
                    {language === 'fr' ? 'Pétition' : 'Petition'}
                  </button>

                  <button
                    onClick={() => setActiveTab('status')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'status'
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 mr-3" />
                    {language === 'fr' ? 'Statut' : 'Status'}
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 ml-64">
          <div className="p-8">
            {/* Content based on active tab */}
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Overview Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                          {language === 'fr'
                            ? "Vue d'ensemble"
                            : 'Student Overview'}
                        </h1>
                        <p className="text-gray-600">
                          {language === 'fr'
                            ? 'Bienvenue sur votre tableau de bord étudiant'
                            : 'Welcome to your student dashboard'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-green-100 rounded-lg">
                            <BookOpen className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              {language === 'fr'
                                ? 'Moyenne Générale'
                                : 'Overall Average'}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              {getOverallAverage()}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              {language === 'fr' ? 'Position' : 'Position'}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              #{getOverallPosition()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-orange-100 rounded-lg">
                            <FileText className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              {language === 'fr' ? 'Pétitions' : 'Petitions'}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              {petitions.length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-purple-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              {language === 'fr'
                                ? 'Année Académique'
                                : 'Academic Year'}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              2024-2025
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Clock className="w-5 h-5" />
                        <span>
                          {language === 'fr'
                            ? 'Activité Récente'
                            : 'Recent Activity'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {getRecentActivity().map((activity, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                          >
                            <div
                              className={`p-2 rounded-full ${activity.iconBg}`}
                            >
                              {activity.icon}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {activity.description}
                              </p>
                            </div>
                            <span className="text-xs text-gray-400">
                              {activity.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'results' && (
                <div className="space-y-6">
                  {/* Results Header */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-lg">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900">
                            {language === 'fr'
                              ? 'Résultats Académiques'
                              : 'Academic Results'}
                          </h1>
                          <p className="text-gray-600">
                            {language === 'fr'
                              ? 'Consultez vos résultats organisés par classe et trimestre'
                              : 'View your results organized by class and term'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Filter className="h-5 w-5 mr-2" />
                        {language === 'fr' ? 'Filtres' : 'Filters'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <Label htmlFor="search">
                            {language === 'fr'
                              ? 'Rechercher un étudiant'
                              : 'Search Student'}
                          </Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="search"
                              placeholder={
                                language === 'fr'
                                  ? 'Nom ou ID étudiant...'
                                  : 'Student name or ID...'
                              }
                              value={searchStudent}
                              onChange={e => setSearchStudent(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="class">
                            {language === 'fr' ? 'Classe' : 'Class'}
                          </Label>
                          <Select
                            value={selectedClass}
                            onValueChange={setSelectedClass}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                {language === 'fr'
                                  ? 'Toutes les classes'
                                  : 'All Classes'}
                              </SelectItem>
                              {availableClasses.map(className => (
                                <SelectItem key={className} value={className}>
                                  {className}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="term">
                            {language === 'fr' ? 'Trimestre' : 'Term'}
                          </Label>
                          <Select
                            value={selectedTerm}
                            onValueChange={setSelectedTerm}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Term 1">
                                {language === 'fr' ? 'Trimestre 1' : 'Term 1'}
                              </SelectItem>
                              <SelectItem value="Term 2">
                                {language === 'fr' ? 'Trimestre 2' : 'Term 2'}
                              </SelectItem>
                              <SelectItem value="Term 3">
                                {language === 'fr' ? 'Trimestre 3' : 'Term 3'}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Results Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {language === 'fr' ? 'Résultats' : 'Results'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {resultsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : resultsError ? (
                        <div className="text-center py-8">
                          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">
                            {language === 'fr' ? 'Erreur' : 'Error'}
                          </h3>
                          <p className="text-gray-500">
                            {language === 'fr'
                              ? 'Impossible de charger les résultats'
                              : 'Unable to load results'}
                          </p>
                        </div>
                      ) : studentResults.length === 0 ? (
                        <div className="text-center py-12">
                          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">
                            {language === 'fr'
                              ? 'Aucun résultat trouvé'
                              : 'No Results Found'}
                          </h3>
                          <p className="text-gray-500">
                            {language === 'fr'
                              ? 'Aucun résultat disponible pour les critères sélectionnés'
                              : 'No results available for the selected criteria'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Items per page control */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Label htmlFor="itemsPerPage">
                                {language === 'fr'
                                  ? 'Lignes par page'
                                  : 'Items per page'}
                              </Label>
                              <Select
                                value={itemsPerPage.toString()}
                                onValueChange={value =>
                                  setItemsPerPage(Number(value))
                                }
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="5">5</SelectItem>
                                  <SelectItem value="10">10</SelectItem>
                                  <SelectItem value="20">20</SelectItem>
                                  <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="text-sm text-gray-600">
                              {language === 'fr'
                                ? `Affichage de ${startItem} à ${endItem} sur ${totalItems} résultats`
                                : `Showing ${startItem} to ${endItem} of ${totalItems} results`}
                            </div>
                          </div>

                          {/* Results Table */}
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>
                                    {language === 'fr' ? 'Étudiant' : 'Student'}
                                  </TableHead>
                                  <TableHead>
                                    {language === 'fr' ? 'Classe' : 'Class'}
                                  </TableHead>
                                  <TableHead>
                                    {language === 'fr' ? 'Matière' : 'Subject'}
                                  </TableHead>
                                  <TableHead className="text-center">
                                    {language === 'fr' ? 'CA' : 'CA'}
                                  </TableHead>
                                  <TableHead className="text-center">
                                    {language === 'fr' ? 'Examen' : 'Exam'}
                                  </TableHead>
                                  <TableHead className="text-center">
                                    {language === 'fr' ? 'Total' : 'Total'}
                                  </TableHead>
                                  <TableHead className="text-center">
                                    {language === 'fr' ? 'Note' : 'Grade'}
                                  </TableHead>
                                  <TableHead className="text-center">
                                    {language === 'fr'
                                      ? 'Position'
                                      : 'Position'}
                                  </TableHead>
                                  <TableHead>
                                    {language === 'fr' ? 'Actions' : 'Actions'}
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {paginatedResults.map(result => (
                                  <TableRow key={result.id}>
                                    <TableCell className="font-medium">
                                      {result.studentName}
                                    </TableCell>
                                    <TableCell>{result.className}</TableCell>
                                    <TableCell>{result.subject}</TableCell>
                                    <TableCell className="text-center">
                                      {result.continuousAssessment}/30
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {result.examination}/70
                                    </TableCell>
                                    <TableCell className="text-center font-semibold">
                                      {result.totalMarks}/100
                                    </TableCell>
                                    <TableCell
                                      className={`text-center ${getGradeColor(result.grade || '')}`}
                                    >
                                      {result.grade}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {result.position && (
                                        <Badge
                                          variant="outline"
                                          className="text-orange-600"
                                        >
                                          #{result.position}
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center space-x-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handleViewResult(result)
                                          }
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handleEditResult(result)
                                          }
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handleDeleteResult(result.id)
                                          }
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>

                          {/* Bottom Pagination */}
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-700">
                                {language === 'fr'
                                  ? `Affichage de ${startItem} à ${endItem} sur ${totalItems} résultats`
                                  : `Showing ${startItem} to ${endItem} of ${totalItems} results`}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setCurrentPage(currentPage - 1)
                                  }
                                  disabled={currentPage === 1}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                  {language === 'fr' ? 'Précédent' : 'Previous'}
                                </Button>
                                <div className="flex items-center space-x-1">
                                  {Array.from(
                                    { length: Math.min(5, totalPages) },
                                    (_, i) => {
                                      let pageNum;
                                      if (totalPages <= 5) {
                                        pageNum = i + 1;
                                      } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                      } else if (
                                        currentPage >=
                                        totalPages - 2
                                      ) {
                                        pageNum = totalPages - 4 + i;
                                      } else {
                                        pageNum = currentPage - 2 + i;
                                      }

                                      return (
                                        <Button
                                          key={pageNum}
                                          variant={
                                            currentPage === pageNum
                                              ? 'default'
                                              : 'outline'
                                          }
                                          size="sm"
                                          onClick={() =>
                                            setCurrentPage(pageNum)
                                          }
                                        >
                                          {pageNum}
                                        </Button>
                                      );
                                    }
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setCurrentPage(currentPage + 1)
                                  }
                                  disabled={currentPage === totalPages}
                                >
                                  {language === 'fr' ? 'Suivant' : 'Next'}
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'report' && (
                <div className="space-y-6">
                  {/* Report Header with Enhanced Design */}
                  <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/50 dark:via-orange-950/50 dark:to-yellow-950/50 rounded-xl p-6 border border-red-200 dark:border-red-800">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg shadow-lg">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {language === 'fr'
                            ? 'Signalement Anonyme'
                            : 'Anonymous Reporting'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                          {language === 'fr'
                            ? 'Signalez anonymement tout incident ou préoccupation de sécurité'
                            : 'Anonymously report any incident or safety concern'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Alert Section */}
                  <Alert className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/50">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <AlertTitle className="text-red-800 dark:text-red-200">
                      {language === 'fr'
                        ? 'Confidentialité Assurée'
                        : 'Confidentiality Assured'}
                    </AlertTitle>
                    <AlertDescription className="text-red-700 dark:text-red-300">
                      {language === 'fr'
                        ? 'Tous les rapports sont traités de manière strictement confidentielle. Votre identité ne sera jamais révélée. Les rapports urgents sont traités en priorité.'
                        : 'All reports are handled in strict confidence. Your identity will never be revealed. Urgent reports are prioritized.'}
                    </AlertDescription>
                  </Alert>

                  {/* Enhanced Form Card */}
                  <Card className="shadow-lg border-0 bg-white dark:bg-gray-900">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-t-lg">
                      <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                        <Shield className="w-5 h-5 text-red-600" />
                        <span>
                          {language === 'fr'
                            ? 'Formulaire de Signalement'
                            : 'Report Form'}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        {language === 'fr'
                          ? 'Remplissez tous les champs requis pour soumettre votre signalement'
                          : 'Fill in all required fields to submit your report'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Form {...reportForm}>
                        <form
                          onSubmit={reportForm.handleSubmit(onReportSubmit)}
                          className="space-y-6"
                        >
                          {/* Report Type and Urgency Level */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={reportForm.control}
                              name="reportType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {language === 'fr'
                                      ? 'Type de Rapport *'
                                      : 'Report Type *'}
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value as string}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400">
                                        <SelectValue
                                          placeholder={
                                            language === 'fr'
                                              ? 'Sélectionnez le type'
                                              : 'Select type'
                                          }
                                        />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem
                                        value="sexual_harassment"
                                        className="hover:bg-red-50"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                          <span>
                                            {language === 'fr'
                                              ? 'Harcèlement Sexuel'
                                              : 'Sexual Harassment'}
                                          </span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem
                                        value="bullying"
                                        className="hover:bg-orange-50"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                          <span>
                                            {language === 'fr'
                                              ? 'Harcèlement'
                                              : 'Bullying'}
                                          </span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem
                                        value="violence"
                                        className="hover:bg-red-50"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                          <span>
                                            {language === 'fr'
                                              ? 'Violence'
                                              : 'Violence'}
                                          </span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem
                                        value="academic_misconduct"
                                        className="hover:bg-yellow-50"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                          <span>
                                            {language === 'fr'
                                              ? 'Inconduite Académique'
                                              : 'Academic Misconduct'}
                                          </span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem
                                        value="other"
                                        className="hover:bg-gray-50"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                          <span>
                                            {language === 'fr'
                                              ? 'Autre'
                                              : 'Other'}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={reportForm.control}
                              name="urgencyLevel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {language === 'fr'
                                      ? "Niveau d'Urgence *"
                                      : 'Urgency Level *'}
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value as string}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400">
                                        <SelectValue
                                          placeholder={
                                            language === 'fr'
                                              ? "Sélectionnez l'urgence"
                                              : 'Select urgency'
                                          }
                                        />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem
                                        value="low"
                                        className="hover:bg-green-50"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          <span>
                                            {language === 'fr'
                                              ? 'Faible'
                                              : 'Low'}
                                          </span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem
                                        value="medium"
                                        className="hover:bg-yellow-50"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                          <span>
                                            {language === 'fr'
                                              ? 'Moyen'
                                              : 'Medium'}
                                          </span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem
                                        value="high"
                                        className="hover:bg-red-50"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                          <span>
                                            {language === 'fr'
                                              ? 'Élevé'
                                              : 'High'}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Description Field */}
                          <FormField
                            control={reportForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  {language === 'fr'
                                    ? 'Description Détaillée *'
                                    : 'Detailed Description *'}
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder={
                                      language === 'fr'
                                        ? "Décrivez l'incident en détail, incluant ce qui s'est passé, quand et où..."
                                        : 'Describe the incident in detail, including what happened, when and where...'
                                    }
                                    className="min-h-32 border-2 border-gray-200 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400 resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Location and Date */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={reportForm.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {language === 'fr'
                                      ? "Lieu de l'Incident"
                                      : 'Incident Location'}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={
                                        language === 'fr'
                                          ? "Où s'est produit l'incident?"
                                          : 'Where did the incident occur?'
                                      }
                                      className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400"
                                      value={field.value || ''}
                                      onChange={field.onChange}
                                      onBlur={field.onBlur}
                                      name={field.name}
                                      ref={field.ref}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={reportForm.control}
                              name="incidentDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {language === 'fr'
                                      ? "Date de l'Incident"
                                      : 'Incident Date'}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="date"
                                      className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400"
                                      value={field.value || ''}
                                      onChange={field.onChange}
                                      onBlur={field.onBlur}
                                      name={field.name}
                                      ref={field.ref}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Involved Parties and Witnesses */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={reportForm.control}
                              name="involvedParties"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {language === 'fr'
                                      ? 'Parties Impliquées'
                                      : 'Involved Parties'}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={
                                        language === 'fr'
                                          ? 'Noms ou descriptions des personnes impliquées'
                                          : 'Names or descriptions of involved persons'
                                      }
                                      className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400"
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={reportForm.control}
                              name="witnesses"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {language === 'fr'
                                      ? 'Témoins (si applicable)'
                                      : 'Witnesses (if applicable)'}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={
                                        language === 'fr'
                                          ? 'Noms des témoins ou "Aucun"'
                                          : 'Names of witnesses or "None"'
                                      }
                                      className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400"
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Evidence Description */}
                          <FormField
                            control={reportForm.control}
                            name="evidenceDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  {language === 'fr'
                                    ? 'Preuves Disponibles'
                                    : 'Available Evidence'}
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder={
                                      language === 'fr'
                                        ? 'Décrivez toute preuve disponible (photos, messages, documents, etc.)'
                                        : 'Describe any available evidence (photos, messages, documents, etc.)'
                                    }
                                    className="min-h-24 border-2 border-gray-200 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400 resize-none"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Enhanced Submit Button */}
                          <div className="pt-4">
                            <Button
                              type="submit"
                              disabled={reportMutation.isPending}
                              className="w-full h-12 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              {reportMutation.isPending ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                  {language === 'fr'
                                    ? 'Soumission en cours...'
                                    : 'Submitting...'}
                                </>
                              ) : (
                                <>
                                  <Send className="w-5 h-5 mr-2" />
                                  {language === 'fr'
                                    ? 'Soumettre le Rapport'
                                    : 'Submit Report'}
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'petition' && (
                <div className="space-y-6">
                  {/* Petition Header with Enhanced Design */}
                  <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {language === 'fr'
                            ? 'Soumettre une Pétition'
                            : 'Submit Petition'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                          {language === 'fr'
                            ? "Soumettez une pétition pour faire appel d'une note ou exprimer une préoccupation"
                            : 'Submit a petition to appeal a grade or express a concern'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Form Card */}
                  <Card className="shadow-lg border-0 bg-white dark:bg-gray-900">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-t-lg">
                      <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        <span>
                          {language === 'fr'
                            ? 'Formulaire de Pétition'
                            : 'Petition Form'}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        {language === 'fr'
                          ? 'Remplissez tous les champs requis pour soumettre votre pétition'
                          : 'Fill in all required fields to submit your petition'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Form {...petitionForm}>
                        <form
                          onSubmit={petitionForm.handleSubmit(onPetitionSubmit)}
                          className="space-y-6"
                        >
                          {/* Petition Type and Academic Year */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={petitionForm.control}
                              name="petitionType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {language === 'fr'
                                      ? 'Type de Pétition *'
                                      : 'Petition Type *'}
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value as string}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
                                        <SelectValue
                                          placeholder={
                                            language === 'fr'
                                              ? 'Sélectionnez le type'
                                              : 'Select type'
                                          }
                                        />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem
                                        value="grade_appeal"
                                        className="hover:bg-blue-50"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                          <span>
                                            {language === 'fr'
                                              ? 'Appel de Note'
                                              : 'Grade Appeal'}
                                          </span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem
                                        value="academic_concern"
                                        className="hover:bg-indigo-50"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                          <span>
                                            {language === 'fr'
                                              ? 'Préoccupation Académique'
                                              : 'Academic Concern'}
                                          </span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem
                                        value="disciplinary_appeal"
                                        className="hover:bg-purple-50"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                          <span>
                                            {language === 'fr'
                                              ? 'Appel Disciplinaire'
                                              : 'Disciplinary Appeal'}
                                          </span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem
                                        value="other"
                                        className="hover:bg-gray-50"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                          <span>
                                            {language === 'fr'
                                              ? 'Autre'
                                              : 'Other'}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={petitionForm.control}
                              name="academicYear"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {language === 'fr'
                                      ? 'Année Académique *'
                                      : 'Academic Year *'}
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value as string}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
                                        <SelectValue
                                          placeholder={
                                            language === 'fr'
                                              ? "Sélectionnez l'année"
                                              : 'Select year'
                                          }
                                        />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="2024-2025">
                                        2024-2025
                                      </SelectItem>
                                      <SelectItem value="2023-2024">
                                        2023-2024
                                      </SelectItem>
                                      <SelectItem value="2022-2023">
                                        2022-2023
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Student Information */}
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                              {language === 'fr'
                                ? "Informations de l'Étudiant"
                                : 'Student Information'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={petitionForm.control}
                                name="studentName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                      {language === 'fr'
                                        ? 'Nom Complet *'
                                        : 'Full Name *'}
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder={
                                          language === 'fr'
                                            ? 'Votre nom complet'
                                            : 'Your full name'
                                        }
                                        className="h-11 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={petitionForm.control}
                                name="studentId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                      {language === 'fr'
                                        ? 'ID Étudiant *'
                                        : 'Student ID *'}
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder={
                                          language === 'fr'
                                            ? 'Votre ID étudiant'
                                            : 'Your student ID'
                                        }
                                        className="h-11 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={petitionForm.control}
                                name="className"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                      {language === 'fr'
                                        ? 'Classe *'
                                        : 'Class *'}
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder={
                                          language === 'fr'
                                            ? 'Votre classe'
                                            : 'Your class'
                                        }
                                        className="h-11 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-4">
                              {language === 'fr'
                                ? 'Informations de Contact'
                                : 'Contact Information'}
                            </h3>
                            <FormField
                              control={petitionForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    {language === 'fr' ? 'Email *' : 'Email *'}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="email"
                                      placeholder={
                                        language === 'fr'
                                          ? 'votre.email@example.com'
                                          : 'your.email@example.com'
                                      }
                                      className="h-11 border-2 border-blue-200 dark:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Petition Details */}
                          <div className="space-y-6">
                            <FormField
                              control={petitionForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {language === 'fr'
                                      ? 'Titre de la Pétition *'
                                      : 'Petition Title *'}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={
                                        language === 'fr'
                                          ? 'Titre concis de votre pétition'
                                          : 'Concise title of your petition'
                                      }
                                      className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={petitionForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {language === 'fr'
                                      ? 'Description Détaillée *'
                                      : 'Detailed Description *'}
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder={
                                        language === 'fr'
                                          ? 'Expliquez votre préoccupation en détail, incluant le contexte et les raisons de votre pétition...'
                                          : 'Explain your concern in detail, including the context and reasons for your petition...'
                                      }
                                      className="min-h-32 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 resize-none"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={petitionForm.control}
                              name="requestedAction"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {language === 'fr'
                                      ? 'Action Demandée *'
                                      : 'Requested Action *'}
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder={
                                        language === 'fr'
                                          ? "Quelle action souhaitez-vous que l'administration prenne? Soyez spécifique..."
                                          : 'What action would you like the administration to take? Be specific...'
                                      }
                                      className="min-h-24 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 resize-none"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Enhanced Submit Button */}
                          <div className="pt-4">
                            <Button
                              type="submit"
                              disabled={petitionMutation.isPending}
                              className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              {petitionMutation.isPending ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                  {language === 'fr'
                                    ? 'Soumission en cours...'
                                    : 'Submitting...'}
                                </>
                              ) : (
                                <>
                                  <Send className="w-5 h-5 mr-2" />
                                  {language === 'fr'
                                    ? 'Soumettre la Pétition'
                                    : 'Submit Petition'}
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'status' && (
                <div className="space-y-6">
                  {/* Status Header with Enhanced Design */}
                  <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/50 dark:via-emerald-950/50 dark:to-teal-950/50 rounded-xl p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {language === 'fr'
                            ? 'Statut des Pétitions'
                            : 'Petition Status'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                          {language === 'fr'
                            ? "Suivez le statut de vos pétitions soumises et les réponses de l'administration"
                            : 'Track the status of your submitted petitions and administration responses'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Status Card */}
                  <Card className="shadow-lg border-0 bg-white dark:bg-gray-900">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-t-lg">
                      <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span>
                          {language === 'fr' ? 'Mes Pétitions' : 'My Petitions'}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        {language === 'fr'
                          ? "Consultez l'état de vos pétitions et les réponses reçues"
                          : 'Check the status of your petitions and received responses'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      {petitionsLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map(i => (
                            <div
                              key={i}
                              className="h-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"
                            ></div>
                          ))}
                        </div>
                      ) : petitions && petitions.length > 0 ? (
                        <div className="space-y-6">
                          {petitions.map((petition: any) => (
                            <div
                              key={petition.id}
                              className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300"
                            >
                              {/* Petition Header */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                      {petition.title}
                                    </h4>
                                    <Badge
                                      className={`${getStatusColor(petition.status)} font-medium`}
                                    >
                                      {petition.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="w-4 h-4" />
                                      <span>
                                        {language === 'fr'
                                          ? 'Soumis le'
                                          : 'Submitted on'}{' '}
                                        {petition.submittedAt
                                          ? new Date(
                                              petition.submittedAt
                                            ).toLocaleDateString()
                                          : ''}
                                      </span>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-600"
                                    >
                                      {petition.petitionType}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {/* Petition Description */}
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                  {language === 'fr'
                                    ? 'Description'
                                    : 'Description'}
                                </h5>
                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                  {petition.description}
                                </p>
                              </div>

                              {/* Requested Action */}
                              {petition.requestedAction &&
                                typeof petition.requestedAction ===
                                  'string' && (
                                  <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4 mb-4">
                                    <h5 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                                      {language === 'fr'
                                        ? 'Action Demandée'
                                        : 'Requested Action'}
                                    </h5>
                                    <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                                      {petition.requestedAction}
                                    </p>
                                  </div>
                                )}

                              {/* Admin Response */}
                              {petition.adminResponse ? (
                                <div className="bg-green-50 dark:bg-green-950/50 rounded-lg p-4 border-l-4 border-l-green-500">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <h5 className="font-semibold text-green-800 dark:text-green-200">
                                      {language === 'fr'
                                        ? "Réponse de l'Administration"
                                        : 'Administration Response'}
                                    </h5>
                                  </div>
                                  <p className="text-green-700 dark:text-green-300 text-sm leading-relaxed mb-2">
                                    {petition.adminResponse}
                                  </p>
                                  {petition.responseDate && (
                                    <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                                      <Clock className="w-3 h-3" />
                                      <span>
                                        {language === 'fr'
                                          ? 'Répondu le'
                                          : 'Responded on'}{' '}
                                        {new Date(
                                          petition.responseDate
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="bg-yellow-50 dark:bg-yellow-950/50 rounded-lg p-4 border-l-4 border-l-yellow-500">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                      {language === 'fr'
                                        ? 'En attente de réponse'
                                        : 'Awaiting response'}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Supporting Documents */}
                              {petition.supportingDocuments &&
                                typeof petition.supportingDocuments ===
                                  'object' &&
                                Array.isArray(petition.supportingDocuments) &&
                                petition.supportingDocuments.length > 0 && (
                                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                      {language === 'fr'
                                        ? 'Documents de Soutien'
                                        : 'Supporting Documents'}
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                      {petition.supportingDocuments.map(
                                        (doc: any, index: number) => (
                                          <Badge
                                            key={index}
                                            variant="outline"
                                            className="text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600"
                                          >
                                            <FileText className="w-3 h-3 mr-1" />
                                            {language === 'fr'
                                              ? 'Document'
                                              : 'Document'}{' '}
                                            {index + 1}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-10 h-10 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            {language === 'fr'
                              ? 'Aucune Pétition'
                              : 'No Petitions'}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-500 max-w-md mx-auto">
                            {language === 'fr'
                              ? "Vous n'avez soumis aucune pétition pour le moment. Utilisez l'onglet Pétition pour soumettre votre première demande."
                              : "You haven't submitted any petitions yet. Use the Petition tab to submit your first request."}
                          </p>
                          <Button
                            onClick={() => setActiveTab('petition')}
                            className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {language === 'fr'
                              ? 'Soumettre une Pétition'
                              : 'Submit Petition'}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
