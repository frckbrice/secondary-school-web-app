'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DataTable } from '../../../ui/data-table';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import {
  Eye,
  Check,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Plus,
  Calendar,
} from 'lucide-react';
import { apiRequest } from '../../../../lib/queryClient';
import { useToast } from '../../../../hooks/use-toast';
import { useLanguage } from '../../../../hooks/use-language';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../ui/dialog';

interface Booking {
  id: string;
  studentName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  teacherName: string;
  subject: string;
  purpose: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  createdAt: string;
  confirmedDate?: string;
  confirmedTime?: string;
  notes?: string;
}

interface CreateBookingData {
  studentName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  teacherName: string;
  subject: string;
  purpose: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
}

export default function BookingManagement() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateBookingData>({
    studentName: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    teacherName: '',
    subject: '',
    purpose: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
  });

  // Fetch bookings with pagination and filters
  const {
    data: bookingsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'bookings',
      currentPage,
      itemsPerPage,
      statusFilter,
      subjectFilter,
      searchQuery,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (subjectFilter !== 'all') {
        params.append('subject', subjectFilter);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/bookings?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      return response.json();
    },
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: CreateBookingData) => {
      const response = await apiRequest('POST', '/api/bookings', data);
      if (!response) throw new Error('Failed to create booking');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description:
          language === 'fr'
            ? 'Réservation créée avec succès'
            : 'Booking created successfully',
      });
      setIsCreateDialogOpen(false);
      setCreateFormData({
        studentName: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        teacherName: '',
        subject: '',
        purpose: '',
        preferredDate: '',
        preferredTime: '',
        notes: '',
      });
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

  // Update booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      confirmedDate,
      confirmedTime,
      notes,
    }: {
      id: string;
      status: string;
      confirmedDate?: string;
      confirmedTime?: string;
      notes?: string;
    }) => {
      const response = await apiRequest('PUT', `/api/bookings/${id}`, {
        status,
        confirmedDate,
        confirmedTime,
        notes,
      });
      if (!response) throw new Error('Failed to update booking status');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Booking status updated successfully',
        variant: 'default',
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

  const handleStatusUpdate = (
    id: string,
    status: string,
    confirmedDate?: string,
    confirmedTime?: string,
    notes?: string
  ) => {
    updateStatusMutation.mutate({
      id,
      status,
      confirmedDate,
      confirmedTime,
      notes,
    });
  };

  const handleCreateBooking = () => {
    createBookingMutation.mutate(createFormData);
  };

  const handleInputChange = (field: keyof CreateBookingData, value: string) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const columns = [
    {
      key: 'parentInfo',
      label: language === 'fr' ? 'Informations parent' : 'Parent Information',
      render: (value: any, row: Booking) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.parentName}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.parentEmail}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.parentPhone}
          </div>
        </div>
      ),
    },
    {
      key: 'studentInfo',
      label: language === 'fr' ? 'Étudiant & Enseignant' : 'Student & Teacher',
      render: (value: any, row: Booking) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.studentName}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {language === 'fr' ? 'Enseignant' : 'Teacher'}: {row.teacherName} (
            {row.subject})
          </div>
        </div>
      ),
    },
    {
      key: 'purpose',
      label: language === 'fr' ? 'Objectif' : 'Purpose',
      render: (value: string) => (
        <div
          className="max-w-xs truncate text-gray-700 dark:text-gray-300"
          title={value}
        >
          {value}
        </div>
      ),
    },
    {
      key: 'preferredDateTime',
      label: language === 'fr' ? 'Heure préférée' : 'Preferred Time',
      render: (value: any, row: Booking) => (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-gray-500" />
          <div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {row.preferredDate}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.preferredTime}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: language === 'fr' ? 'Statut' : 'Status',
      render: (value: string) => (
        <Badge
          variant={
            value === 'confirmed'
              ? 'default'
              : value === 'cancelled'
                ? 'destructive'
                : value === 'completed'
                  ? 'secondary'
                  : 'outline'
          }
          className="capitalize"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: language === 'fr' ? 'Demandé le' : 'Requested',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: language === 'fr' ? 'Actions' : 'Actions',
      render: (value: any, row: Booking) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Eye className="w-4 h-4" />
          </Button>
          {row.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => handleStatusUpdate(row.id, 'confirmed')}
                disabled={updateStatusMutation.isPending}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleStatusUpdate(row.id, 'cancelled')}
                disabled={updateStatusMutation.isPending}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const bookings = bookingsData?.data?.bookings || bookingsData?.bookings || [];
  const pagination = bookingsData?.data?.pagination || bookingsData?.pagination;
  const totalItems = pagination?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, subjectFilter, searchQuery, itemsPerPage]);

  // Main render
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Réservations' : 'Bookings List'} (
                {totalItems})
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'fr'
                  ? 'Toutes les réservations de réunions parents-enseignants'
                  : 'All parent-teacher meeting bookings'}
              </p>
            </div>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Ajouter' : 'Add Booking'}
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
                      ? "Rechercher par nom de parent ou d'étudiant..."
                      : 'Search by parent or student name...'
                  }
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
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
                  <SelectItem value="pending">
                    {language === 'fr' ? 'En attente' : 'Pending'}
                  </SelectItem>
                  <SelectItem value="confirmed">
                    {language === 'fr' ? 'Confirmé' : 'Confirmed'}
                  </SelectItem>
                  <SelectItem value="cancelled">
                    {language === 'fr' ? 'Annulé' : 'Cancelled'}
                  </SelectItem>
                  <SelectItem value="completed">
                    {language === 'fr' ? 'Terminé' : 'Completed'}
                  </SelectItem>
                </SelectContent>
              </Select>
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

      {/* Bookings List */}
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
                data={bookings}
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
    </div>
  );
}
