import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../ui/data-table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Plus,
  UserCheck,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject?: string;
  status: string;
  createdAt: string;
  gender: string;
}

interface TeacherFormData {
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phone?: string;
  subject: string;
  status: string;
}

export default function TeachersManagement() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TeacherFormData>({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    phone: '',
    subject: '',
    status: 'active',
  });

  // Fetch teachers with pagination and filters
  const {
    data: teachersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'teachers',
      currentPage,
      itemsPerPage,
      subjectFilter,
      statusFilter,
      searchQuery,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        role: 'teacher',
      });
      if (subjectFilter !== 'all') params.append('subject', subjectFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      const response = await fetch(`/api/users?${params}`);
      if (!response.ok) throw new Error('Failed to fetch teachers');
      return response.json();
    },
  });

  const teachers = teachersData?.data?.users || teachersData?.users || [];
  const pagination = teachersData?.data?.pagination || teachersData?.pagination;
  const totalItems = pagination?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [subjectFilter, statusFilter, searchQuery, itemsPerPage]);

  // Create teacher mutation
  const createTeacherMutation = useMutation({
    mutationFn: async (data: TeacherFormData) => {
      const response = await apiRequest('POST', '/api/teachers', data);
      if (!response) throw new Error('Failed to create teacher');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description:
          language === 'fr'
            ? 'Enseignant ajouté avec succès'
            : 'Teacher added successfully',
      });
      setIsCreateDialogOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        gender: '',
        email: '',
        phone: '',
        subject: '',
        status: 'active',
      });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
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

  // Update teacher mutation
  const updateTeacherMutation = useMutation({
    mutationFn: async (data: Teacher & TeacherFormData) => {
      const response = await apiRequest(
        'PUT',
        `/api/teachers/${data.id}`,
        data
      );
      if (!response) throw new Error('Failed to update teacher');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description:
          language === 'fr'
            ? 'Enseignant modifié avec succès'
            : 'Teacher updated successfully',
      });
      setIsEditDialogOpen(false);
      setSelectedTeacher(null);
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
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

  // Delete teacher mutation
  const deleteTeacherMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/teachers/${id}`);
      if (!response) throw new Error('Failed to delete teacher');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description:
          language === 'fr'
            ? 'Enseignant supprimé avec succès'
            : 'Teacher deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setSelectedTeacher(null);
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
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
  const handleOpenView = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsViewDialogOpen(true);
  };
  const handleOpenEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      gender: teacher.gender,
      email: teacher.email,
      phone: teacher.phone || '',
      subject: teacher.subject || '',
      status: teacher.status,
    });
    setIsEditDialogOpen(true);
  };
  const handleOpenDelete = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteDialogOpen(true);
  };

  const columns = [
    {
      key: 'name',
      label: language === 'fr' ? 'Nom' : 'Name',
      render: (value: any, row: Teacher) => (
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
      key: 'subject',
      label: language === 'fr' ? 'Matière' : 'Subject',
      render: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value || '-'}
        </Badge>
      ),
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
      label: language === 'fr' ? 'Ajouté le' : 'Added',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: language === 'fr' ? 'Actions' : 'Actions',
      render: (value: any, row: Teacher) => (
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
            disabled={deleteTeacherMutation.isPending}
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
      <div className="bg-gradient-to-r from-emerald-50 to-blue-100 dark:from-emerald-950/50 dark:to-blue-900/30 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg shadow-lg">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Enseignants' : 'Teachers List'} (
                {totalItems})
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'fr' ? 'Tous les enseignants' : 'All teachers'}
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
                {language === 'fr' ? 'Ajouter' : 'Add Teacher'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {language === 'fr' ? 'Ajouter un enseignant' : 'Add Teacher'}
                </DialogTitle>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={e => {
                  e.preventDefault();
                  createTeacherMutation.mutate(formData);
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
                  <Input
                    placeholder={language === 'fr' ? 'Matière' : 'Subject'}
                    value={formData.subject}
                    onChange={e =>
                      setFormData(f => ({ ...f, subject: e.target.value }))
                    }
                    required
                  />
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
                  disabled={createTeacherMutation.isPending}
                >
                  {createTeacherMutation.isPending && (
                    <span className="animate-spin mr-2 inline-block w-4 h-4 border-b-2 border-white rounded-full"></span>
                  )}
                  {language === 'fr' ? 'Ajouter' : 'Add'}
                </Button>
              </form>
            </DialogContent>
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
                {language === 'fr' ? 'Matière' : 'Subject'}
              </label>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      language === 'fr' ? 'Toutes les matières' : 'All subjects'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'fr' ? 'Toutes les matières' : 'All subjects'}
                  </SelectItem>
                  <SelectItem value="mathematics">
                    {language === 'fr' ? 'Mathématiques' : 'Mathematics'}
                  </SelectItem>
                  <SelectItem value="physics">
                    {language === 'fr' ? 'Physique' : 'Physics'}
                  </SelectItem>
                  <SelectItem value="chemistry">
                    {language === 'fr' ? 'Chimie' : 'Chemistry'}
                  </SelectItem>
                  <SelectItem value="english">
                    {language === 'fr' ? 'Anglais' : 'English'}
                  </SelectItem>
                  <SelectItem value="french">
                    {language === 'fr' ? 'Français' : 'French'}
                  </SelectItem>
                  <SelectItem value="biology">
                    {language === 'fr' ? 'Biologie' : 'Biology'}
                  </SelectItem>
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

      {/* Teachers List */}
      <Card>
        <CardHeader />
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <>
              <DataTable
                title=""
                columns={columns}
                data={teachers}
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
                                  ? 'bg-emerald-600 text-white'
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
              {language === 'fr'
                ? "Détails de l'enseignant"
                : 'Teacher Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedTeacher && (
            <div className="space-y-2">
              <div>
                <b>{language === 'fr' ? 'Nom:' : 'Name:'}</b>{' '}
                {selectedTeacher.firstName} {selectedTeacher.lastName}
              </div>
              <div>
                <b>Email:</b> {selectedTeacher.email}
              </div>
              <div>
                <b>{language === 'fr' ? 'Téléphone:' : 'Phone:'}</b>{' '}
                {selectedTeacher.phone || '-'}
              </div>
              <div>
                <b>{language === 'fr' ? 'Sexe:' : 'Gender:'}</b>{' '}
                {selectedTeacher.gender}
              </div>
              <div>
                <b>{language === 'fr' ? 'Matière:' : 'Subject:'}</b>{' '}
                {selectedTeacher.subject}
              </div>
              <div>
                <b>{language === 'fr' ? 'Statut:' : 'Status:'}</b>{' '}
                {selectedTeacher.status}
              </div>
              <div>
                <b>{language === 'fr' ? 'Ajouté le:' : 'Added:'}</b>{' '}
                {new Date(selectedTeacher.createdAt).toLocaleDateString()}
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
              {language === 'fr' ? "Modifier l'enseignant" : 'Edit Teacher'}
            </DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              if (selectedTeacher)
                updateTeacherMutation.mutate({
                  ...formData,
                  id: selectedTeacher.id,
                  createdAt: selectedTeacher.createdAt,
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
              <Input
                placeholder={language === 'fr' ? 'Matière' : 'Subject'}
                value={formData.subject}
                onChange={e =>
                  setFormData(f => ({ ...f, subject: e.target.value }))
                }
                required
              />
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
              disabled={updateTeacherMutation.isPending}
            >
              {updateTeacherMutation.isPending && (
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
              {language === 'fr' ? "Supprimer l'enseignant" : 'Delete Teacher'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              {language === 'fr'
                ? 'Êtes-vous sûr de vouloir supprimer cet enseignant ?'
                : 'Are you sure you want to delete this teacher?'}
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
                disabled={deleteTeacherMutation.isPending}
                onClick={() =>
                  selectedTeacher &&
                  deleteTeacherMutation.mutate(selectedTeacher.id)
                }
              >
                {deleteTeacherMutation.isPending && (
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
