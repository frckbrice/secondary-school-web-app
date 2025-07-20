'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../../../ui/data-table';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import {
  Plus,
  Users,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { apiRequest } from '../../../../lib/queryClient';
import { useToast } from '../../../../hooks/use-toast';
import { useLanguage } from '../../../../hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Input } from '../../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../ui/dialog';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  class: string;
  email: string;
  phone?: string;
  status: string;
  createdAt: string;
}

interface StudentFormData {
  firstName: string;
  lastName: string;
  gender: string;
  class: string;
  email: string;
  phone?: string;
  status: string;
}

export default function StudentsManagement() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: '',
    lastName: '',
    gender: '',
    class: '',
    email: '',
    phone: '',
    status: 'active',
  });

  // Fetch students with pagination and filters
  const {
    data: studentsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'students',
      currentPage,
      itemsPerPage,
      classFilter,
      statusFilter,
      searchQuery,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      if (classFilter !== 'all') params.append('class', classFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      const response = await fetch(`/api/students?${params}`);
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const students = studentsData?.data?.students || studentsData?.students || [];
  const pagination = studentsData?.data?.pagination || studentsData?.pagination;
  const totalItems = pagination?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [classFilter, statusFilter, searchQuery, itemsPerPage]);

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const response = await apiRequest('POST', '/api/students', data);
      if (!response) throw new Error('Failed to create student');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description:
          language === 'fr'
            ? 'Élève ajouté avec succès'
            : 'Student added successfully',
      });
      setIsCreateDialogOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        gender: '',
        class: '',
        email: '',
        phone: '',
        status: 'active',
      });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: async (data: Student & StudentFormData) => {
      const response = await apiRequest(
        'PUT',
        `/api/students/${data.id}`,
        data
      );
      if (!response) throw new Error('Failed to update student');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description:
          language === 'fr'
            ? 'Élève modifié avec succès'
            : 'Student updated successfully',
      });
      setIsEditDialogOpen(false);
      setSelectedStudent(null);
      queryClient.invalidateQueries({ queryKey: ['students'] });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
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
        title: language === 'fr' ? 'Succès' : 'Success',
        description:
          language === 'fr'
            ? 'Élève supprimé avec succès'
            : 'Student deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setSelectedStudent(null);
      queryClient.invalidateQueries({ queryKey: ['students'] });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handlers
  const handleOpenView = (student: Student) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };
  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      gender: student.gender,
      class: student.class,
      email: student.email,
      phone: student.phone || '',
      status: student.status,
    });
    setIsEditDialogOpen(true);
  };
  const handleOpenDelete = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const columns = [
    {
      key: 'name',
      label: language === 'fr' ? 'Nom' : 'Name',
      render: (value: any, row: Student) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.firstName} {row.lastName}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.email}
          </div>
        </div>
      ),
    },
    {
      key: 'class',
      label: language === 'fr' ? 'Classe' : 'Class',
      render: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: 'gender',
      label: language === 'fr' ? 'Sexe' : 'Gender',
      render: (value: string) => <span className="capitalize">{value}</span>,
    },
    {
      key: 'status',
      label: language === 'fr' ? 'Statut' : 'Status',
      render: (value: string) => (
        <Badge
          variant={value === 'active' ? 'default' : 'secondary'}
          className="capitalize"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: language === 'fr' ? 'Inscrit le' : 'Enrolled',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: language === 'fr' ? 'Actions' : 'Actions',
      render: (value: any, row: Student) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenView(row)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenEdit(row)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleOpenDelete(row)}
            disabled={deleteStudentMutation.isPending}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Élèves' : 'Students List'} ({totalItems})
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'fr'
                  ? 'Tous les élèves inscrits'
                  : 'All enrolled students'}
              </p>
            </div>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Ajouter' : 'Add Student'}
              </Button>
            </DialogTrigger>
          </Dialog>
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
              <label className="text-sm font-medium mb-2 block">
                {language === 'fr' ? 'Rechercher' : 'Search'}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={
                    language === 'fr'
                      ? 'Rechercher par nom ou email...'
                      : 'Search by name or email...'
                  }
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <label className="text-sm font-medium mb-2 block">
                {language === 'fr' ? 'Classe' : 'Class'}
              </label>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      language === 'fr' ? 'Toutes les classes' : 'All classes'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'fr' ? 'Toutes les classes' : 'All classes'}
                  </SelectItem>
                  <SelectItem value="form1">Form 1</SelectItem>
                  <SelectItem value="form2">Form 2</SelectItem>
                  <SelectItem value="form3">Form 3</SelectItem>
                  <SelectItem value="form4">Form 4</SelectItem>
                  <SelectItem value="form5">Form 5</SelectItem>
                  <SelectItem value="form6">Form 6</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <label className="text-sm font-medium mb-2 block">
                {language === 'fr' ? 'Statut' : 'Status'}
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      language === 'fr' ? 'Tous les statuts' : 'All statuses'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'fr' ? 'Tous les statuts' : 'All statuses'}
                  </SelectItem>
                  <SelectItem value="active">
                    {language === 'fr' ? 'Actif' : 'Active'}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {language === 'fr' ? 'Inactif' : 'Inactive'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <label className="text-sm font-medium mb-2 block">
                {language === 'fr' ? 'Lignes par page' : 'Items per page'}
              </label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={value => setItemsPerPage(Number(value))}
              >
                <SelectTrigger>
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
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader />
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <DataTable
                title=""
                columns={columns}
                data={students}
                loading={isLoading}
                pagination={{
                  page: currentPage,
                  totalPages,
                  total: totalItems,
                  limit: itemsPerPage,
                  hasNextPage: currentPage < totalPages,
                  hasPrevPage: currentPage > 1,
                }}
                onPageChange={setCurrentPage}
                onLimitChange={setItemsPerPage}
                showPagination={false}
              />
              {/* Bottom Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {language === 'fr'
                      ? `Affichage de ${startItem} à ${endItem} sur ${totalItems} résultats`
                      : `Showing ${startItem} to ${endItem} of ${totalItems} results`}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="border-gray-300 dark:border-gray-600"
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
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? 'default' : 'outline'
                              }
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className={
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'border-gray-300 dark:border-gray-600'
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
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="border-gray-300 dark:border-gray-600"
                    >
                      {language === 'fr' ? 'Suivant' : 'Next'}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'fr' ? "Détails de l'élève" : 'Student Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-2">
              <div>
                <b>{language === 'fr' ? 'Nom:' : 'Name:'}</b>{' '}
                {selectedStudent.firstName} {selectedStudent.lastName}
              </div>
              <div>
                <b>Email:</b> {selectedStudent.email}
              </div>
              <div>
                <b>{language === 'fr' ? 'Téléphone:' : 'Phone:'}</b>{' '}
                {selectedStudent.phone || '-'}
              </div>
              <div>
                <b>{language === 'fr' ? 'Sexe:' : 'Gender:'}</b>{' '}
                {selectedStudent.gender}
              </div>
              <div>
                <b>{language === 'fr' ? 'Classe:' : 'Class:'}</b>{' '}
                {selectedStudent.class}
              </div>
              <div>
                <b>{language === 'fr' ? 'Statut:' : 'Status:'}</b>{' '}
                {selectedStudent.status}
              </div>
              <div>
                <b>{language === 'fr' ? 'Inscrit le:' : 'Enrolled:'}</b>{' '}
                {new Date(selectedStudent.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'fr' ? "Modifier l'élève" : 'Edit Student'}
            </DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              if (selectedStudent)
                updateStudentMutation.mutate({
                  ...formData,
                  id: selectedStudent.id,
                  createdAt: selectedStudent.createdAt,
                });
            }}
          >
            <div className="flex gap-4">
              <Input
                placeholder={language === 'fr' ? 'Prénom' : 'First Name'}
                value={formData.firstName}
                onChange={e =>
                  setFormData(f => ({ ...f, firstName: e.target.value }))
                }
                required
              />
              <Input
                placeholder={language === 'fr' ? 'Nom' : 'Last Name'}
                value={formData.lastName}
                onChange={e =>
                  setFormData(f => ({ ...f, lastName: e.target.value }))
                }
                required
              />
            </div>
            <div className="flex gap-4">
              <Select
                value={formData.gender}
                onValueChange={v => setFormData(f => ({ ...f, gender: v }))}
                required
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={language === 'fr' ? 'Sexe' : 'Gender'}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">
                    {language === 'fr' ? 'Masculin' : 'Male'}
                  </SelectItem>
                  <SelectItem value="female">
                    {language === 'fr' ? 'Féminin' : 'Female'}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={formData.class}
                onValueChange={v => setFormData(f => ({ ...f, class: v }))}
                required
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={language === 'fr' ? 'Classe' : 'Class'}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="form1">Form 1</SelectItem>
                  <SelectItem value="form2">Form 2</SelectItem>
                  <SelectItem value="form3">Form 3</SelectItem>
                  <SelectItem value="form4">Form 4</SelectItem>
                  <SelectItem value="form5">Form 5</SelectItem>
                  <SelectItem value="form6">Form 6</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={e =>
                setFormData(f => ({ ...f, email: e.target.value }))
              }
              required
            />
            <Input
              placeholder={language === 'fr' ? 'Téléphone' : 'Phone'}
              value={formData.phone}
              onChange={e =>
                setFormData(f => ({ ...f, phone: e.target.value }))
              }
            />
            <Select
              value={formData.status}
              onValueChange={v => setFormData(f => ({ ...f, status: v }))}
              required
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={language === 'fr' ? 'Statut' : 'Status'}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  {language === 'fr' ? 'Actif' : 'Active'}
                </SelectItem>
                <SelectItem value="inactive">
                  {language === 'fr' ? 'Inactif' : 'Inactive'}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="submit"
              className="w-full"
              disabled={updateStudentMutation.isPending}
            >
              {updateStudentMutation.isPending && (
                <span className="animate-spin mr-2 inline-block w-4 h-4 border-b-2 border-white rounded-full"></span>
              )}
              {language === 'fr' ? 'Enregistrer' : 'Save'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'fr' ? "Supprimer l'élève" : 'Delete Student'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              {language === 'fr'
                ? 'Êtes-vous sûr de vouloir supprimer cet élève ?'
                : 'Are you sure you want to delete this student?'}
            </p>
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button
                variant="destructive"
                disabled={deleteStudentMutation.isPending}
                onClick={() =>
                  selectedStudent &&
                  deleteStudentMutation.mutate(selectedStudent.id)
                }
              >
                {deleteStudentMutation.isPending && (
                  <span className="animate-spin mr-2 inline-block w-4 h-4 border-b-2 border-white rounded-full"></span>
                )}
                {language === 'fr' ? 'Supprimer' : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
