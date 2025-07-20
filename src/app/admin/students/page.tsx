'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  ArrowLeft,
  GraduationCap,
  Mail,
  Phone,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
} from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import { apiRequest } from '../../../lib/queryClient';
import { useLanguage } from '../../../hooks/use-language';

interface Student {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  phone: string;
  className: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  profileImageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  studentId: string;
  fullName: string;
  email: string;
  phone: string;
  className: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  password: string;
}

export default function StudentsManagement() {
  const router = useRouter();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  const [formData, setFormData] = useState<FormData>({
    studentId: '',
    fullName: '',
    email: '',
    phone: '',
    className: '',
    gender: 'male',
    dateOfBirth: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    address: '',
    password: '',
  });

  // Fetch students with pagination and filters
  const {
    data: studentsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['students', searchTerm, classFilter, genderFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (classFilter !== 'all') params.append('className', classFilter);
      if (genderFilter !== 'all') params.append('gender', genderFilter);
      if (statusFilter !== 'all')
        params.append('isActive', statusFilter === 'active' ? 'true' : 'false');

      const response = await fetch(`/api/students?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const students =
    studentsData &&
    'students' in studentsData &&
    Array.isArray(studentsData.students)
      ? studentsData.students
      : [];

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const submitData = {
        ...data,
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString()
          : undefined,
      };
      const response = await apiRequest('POST', '/api/students', submitData);
      if (!response) throw new Error('Failed to create student');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Student created successfully',
      });
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const submitData = {
        ...data,
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString()
          : undefined,
      };
      const response = await apiRequest(
        'PUT',
        `/api/students/${id}`,
        submitData
      );
      if (!response) throw new Error('Failed to update student');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Student updated successfully',
      });
      setIsDialogOpen(false);
      setEditingStudent(null);
      resetForm();
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/students/${id}`);
      if (!response) throw new Error('Failed to delete student');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Student deleted successfully',
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Toggle student status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/students/${id}`, {
        isActive,
      });
      if (!response) throw new Error('Failed to update student status');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Student status updated successfully',
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreateStudent = async () => {
    createStudentMutation.mutate(formData);
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;
    updateStudentMutation.mutate({ id: editingStudent.id, data: formData });
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      deleteStudentMutation.mutate(studentId);
    }
  };

  const handleToggleStatus = async (
    studentId: string,
    currentStatus: boolean
  ) => {
    toggleStatusMutation.mutate({ id: studentId, isActive: !currentStatus });
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      fullName: '',
      email: '',
      phone: '',
      className: '',
      gender: 'male',
      dateOfBirth: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      address: '',
      password: '',
    });
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      studentId: student.studentId,
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
      className: student.className,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth
        ? new Date(student.dateOfBirth).toISOString().split('T')[0]
        : '',
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      parentPhone: student.parentPhone,
      address: student.address,
      password: '',
    });
    setIsDialogOpen(true);
  };

  const getGenderBadgeColor = (gender: string) => {
    return gender === 'male'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-pink-100 text-pink-800';
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Get unique classes for filter
  const availableClasses: string[] = Array.from(
    new Set(students.map((s: Student) => s.className))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin')}
                className="mr-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language == 'fr'
                  ? 'Retour au Tableau de bord'
                  : 'Back to Dashboard'}
              </Button>
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {language == 'fr'
                    ? 'Gestion des étudiants'
                    : 'Students Management'}
                </h1>
                <p className="text-sm text-gray-600">
                  {language == 'fr'
                    ? 'Gérer les enregistrements et les informations des étudiants'
                    : 'Manage student records and information'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language == 'fr'
                        ? 'Total des étudiants'
                        : 'Total Students'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {students.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language == 'fr'
                        ? 'Étudiants actifs'
                        : 'Active Students'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {students.filter((s: Student) => s.isActive).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language == 'fr'
                        ? 'Étudiants masculins'
                        : 'Male Students'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        students.filter((s: Student) => s.gender === 'male')
                          .length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-pink-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language == 'fr'
                        ? 'Étudiantes féminines'
                        : 'Female Students'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        students.filter((s: Student) => s.gender === 'female')
                          .length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {language == 'fr' ? 'Étudiants' : 'Students'}
                  </CardTitle>
                  <CardDescription>
                    {language == 'fr'
                      ? 'Gérer les enregistrements et les informations des étudiants'
                      : 'Manage student records and information'}
                  </CardDescription>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {language == 'fr' ? 'Ajouter un étudiant' : 'Add Student'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder={
                        language == 'fr'
                          ? 'Rechercher des étudiants...'
                          : 'Search students...'
                      }
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={classFilter}
                  onValueChange={(value: string) => setClassFilter(value)}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue
                      placeholder={language == 'fr' ? 'Classe' : 'Class'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {language == 'fr' ? 'Toutes les classes' : 'All Classes'}
                    </SelectItem>
                    {availableClasses.map(className => (
                      <SelectItem key={className} value={className}>
                        {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={genderFilter}
                  onValueChange={(value: string) => setGenderFilter(value)}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue
                      placeholder={language == 'fr' ? 'Genre' : 'Gender'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="all">All Genders</SelectItem> */}
                    <SelectItem value="male">
                      {language == 'fr' ? 'Masculin' : 'Male'}
                    </SelectItem>
                    <SelectItem value="female">
                      {language == 'fr' ? 'Féminin' : 'Female'}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={statusFilter}
                  onValueChange={(value: string) => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue
                      placeholder={language == 'fr' ? 'Statut' : 'Status'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {language == 'fr' ? 'Tous les statuts' : 'All Status'}
                    </SelectItem>
                    <SelectItem value="active">
                      {language == 'fr' ? 'Actif' : 'Active'}
                    </SelectItem>
                    <SelectItem value="inactive">
                      {language == 'fr' ? 'Inactif' : 'Inactive'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Create/Edit Dialog */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingStudent
                        ? language == 'fr'
                          ? "Modifier l'étudiant"
                          : 'Edit Student'
                        : language == 'fr'
                          ? 'Ajouter un nouvel étudiant'
                          : 'Add New Student'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentId">
                          {language == 'fr' ? "ID de l'étudiant" : 'Student ID'}
                        </Label>
                        <Input
                          id="studentId"
                          value={formData.studentId}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              studentId: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">
                          {language == 'fr' ? 'Nom complet' : 'Full Name'}
                        </Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              fullName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          {language == 'fr' ? 'Email' : 'Email'}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          {language == 'fr' ? 'Téléphone' : 'Phone'}
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="className">
                          {language == 'fr' ? 'Classe' : 'Class'}
                        </Label>
                        <Input
                          id="className"
                          value={formData.className}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              className: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">
                          {language == 'fr' ? 'Genre' : 'Gender'}
                        </Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value: 'male' | 'female') =>
                            setFormData({ ...formData, gender: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">
                              {language == 'fr' ? 'Masculin' : 'Male'}
                            </SelectItem>
                            <SelectItem value="female">
                              {language == 'fr' ? 'Féminin' : 'Female'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">
                        {language == 'fr'
                          ? 'Date de naissance'
                          : 'Date of Birth'}
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            dateOfBirth: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentName">
                        {language == 'fr' ? 'Nom du parent' : 'Parent Name'}
                      </Label>
                      <Input
                        id="parentName"
                        value={formData.parentName}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            parentName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="parentEmail">
                          {language == 'fr'
                            ? 'Email du parent'
                            : 'Parent Email'}
                        </Label>
                        <Input
                          id="parentEmail"
                          type="email"
                          value={formData.parentEmail}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              parentEmail: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parentPhone">
                          {language == 'fr'
                            ? 'Téléphone du parent'
                            : 'Parent Phone'}
                        </Label>
                        <Input
                          id="parentPhone"
                          value={formData.parentPhone}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              parentPhone: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">
                        {language == 'fr' ? 'Adresse' : 'Address'}
                      </Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                    {!editingStudent && (
                      <div className="space-y-2">
                        <Label htmlFor="password">
                          {language == 'fr' ? 'Password' : 'Mot de passe'}
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      {language == 'fr' ? 'Annuler' : 'Cancel'}
                    </Button>
                    <Button
                      onClick={
                        editingStudent
                          ? handleUpdateStudent
                          : handleCreateStudent
                      }
                      disabled={
                        createStudentMutation.isPending ||
                        updateStudentMutation.isPending
                      }
                    >
                      {editingStudent
                        ? language == 'fr'
                          ? 'Mettre à jour'
                          : 'Update'
                        : language == 'fr'
                          ? 'Créer'
                          : 'Create'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Students Table */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language == 'fr' ? 'Étudiants' : 'Students'} (
                    {students.length})
                  </CardTitle>
                  <CardDescription>
                    {language == 'fr'
                      ? 'Gérer les enregistrements et les informations des étudiants'
                      : 'Manage student records and information'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              {language == 'fr' ? 'Étudiant' : 'Student'}
                            </TableHead>
                            <TableHead>
                              {language == 'fr' ? 'Contact' : 'Contact'}
                            </TableHead>
                            <TableHead>
                              {language == 'fr' ? 'Classe' : 'Class'}
                            </TableHead>
                            <TableHead>
                              {language == 'fr' ? 'Parent' : 'Parent'}
                            </TableHead>
                            <TableHead>
                              {language == 'fr' ? 'Statut' : 'Status'}
                            </TableHead>
                            <TableHead>
                              {language == 'fr' ? 'Créé' : 'Created'}
                            </TableHead>
                            <TableHead className="text-right">
                              {language == 'fr' ? 'Actions' : 'Actions'}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {students.map((student: Student) => (
                            <TableRow key={student.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {student.fullName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {student.studentId}
                                  </div>
                                  <Badge
                                    className={getGenderBadgeColor(
                                      student.gender
                                    )}
                                  >
                                    {student.gender}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm">
                                    <Mail className="w-3 h-3 mr-1" />
                                    {student.email}
                                  </div>
                                  {student.phone && (
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Phone className="w-3 h-3 mr-1" />
                                      {student.phone}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {student.className}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    {student.parentName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {student.parentEmail}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getStatusBadgeColor(
                                    student.isActive
                                  )}
                                >
                                  {student.isActive
                                    ? language == 'fr'
                                      ? 'Actif'
                                      : 'Active'
                                    : language == 'fr'
                                      ? 'Inactif'
                                      : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-500">
                                  {new Date(
                                    student.createdAt
                                  ).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditDialog(student)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleToggleStatus(
                                        student.id,
                                        student.isActive
                                      )
                                    }
                                    disabled={toggleStatusMutation.isPending}
                                  >
                                    {student.isActive
                                      ? language == 'fr'
                                        ? 'Désactiver'
                                        : 'Deactivate'
                                      : language == 'fr'
                                        ? 'Activer'
                                        : 'Activate'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleDeleteStudent(student.id)
                                    }
                                    disabled={deleteStudentMutation.isPending}
                                  >
                                    <Trash className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
