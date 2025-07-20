'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../../../ui/data-table';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import {
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Plus,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../ui/alert-dialog';

interface Application {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  form: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  notes?: string;
  documents?: string[];
}

interface CreateApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  form: string;
  notes?: string;
}

export default function ApplicationsManagement() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formFilter, setFormFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateApplicationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    form: '',
    notes: '',
  });

  // Fetch applications with pagination and filters
  const {
    data: applicationsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'applications',
      currentPage,
      itemsPerPage,
      statusFilter,
      formFilter,
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

      if (formFilter !== 'all') {
        params.append('form', formFilter);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/applications?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Create application mutation
  const createApplicationMutation = useMutation({
    mutationFn: async (data: CreateApplicationData) => {
      const response = await apiRequest('POST', '/api/applications', data);
      if (!response) throw new Error('Failed to create application');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description:
          language === 'fr'
            ? 'Candidature créée avec succès'
            : 'Application created successfully',
      });
      setIsCreateDialogOpen(false);
      setCreateFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        form: '',
        notes: '',
      });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error: Error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: string;
      notes?: string;
    }) => {
      const response = await apiRequest(
        'PUT',
        `/api/applications/${id}/status`,
        {
          status,
          notes,
          reviewerId: 'current-user-id', // Replace with actual user ID
        }
      );
      if (!response) throw new Error('Failed to update application status');
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description:
          language === 'fr'
            ? 'Statut de la candidature mis à jour avec succès'
            : 'Application status updated successfully',
      });

      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

      // Close the modal if it's open
      if (selectedApplication?.id === variables.id) {
        setIsViewDialogOpen(false);
        setSelectedApplication(null);
      }
    },
    onError: (error: Error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleStatusUpdate = (id: string, status: string, notes?: string) => {
    updateStatusMutation.mutate({ id, status, notes });
  };

  const handleCreateApplication = () => {
    createApplicationMutation.mutate(createFormData);
  };

  const handleInputChange = (
    field: keyof CreateApplicationData,
    value: string
  ) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setIsViewDialogOpen(true);
  };

  const handleDownloadDocument = (
    documentUrl: string,
    documentName: string
  ) => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentName || 'document';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDocumentName = (url: string) => {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      return fileName || 'Document';
    } catch {
      return 'Document';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const columns = [
    {
      key: 'name',
      label: language === 'fr' ? "Nom de l'étudiant" : 'Student Name',
      render: (value: any, row: Application) => (
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
      key: 'form',
      label: language === 'fr' ? 'Classe' : 'Form',
      render: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: 'phone',
      label: language === 'fr' ? 'Téléphone' : 'Phone',
      render: (value: string) => (
        <span className="text-gray-700 dark:text-gray-300">{value}</span>
      ),
    },
    {
      key: 'status',
      label: language === 'fr' ? 'Statut' : 'Status',
      render: (value: string) => (
        <Badge
          variant={
            value === 'approved'
              ? 'default'
              : value === 'rejected'
                ? 'destructive'
                : 'secondary'
          }
          className="capitalize"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'submittedAt',
      label: language === 'fr' ? 'Soumis le' : 'Submitted',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: language === 'fr' ? 'Actions' : 'Actions',
      render: (value: any, row: Application) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewApplication(row)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {row.status === 'pending' && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="default"
                    disabled={updateStatusMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {language === 'fr'
                        ? 'Approuver la candidature'
                        : 'Approve Application'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {language === 'fr'
                        ? 'Êtes-vous sûr de vouloir approuver cette candidature ? Cette action ne peut pas être annulée.'
                        : 'Are you sure you want to approve this application? This action cannot be undone.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {language === 'fr' ? 'Annuler' : 'Cancel'}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleStatusUpdate(row.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {language === 'fr' ? 'Approuver' : 'Approve'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={updateStatusMutation.isPending}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {language === 'fr'
                        ? 'Rejeter la candidature'
                        : 'Reject Application'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {language === 'fr'
                        ? 'Êtes-vous sûr de vouloir rejeter cette candidature ? Cette action ne peut pas être annulée.'
                        : 'Are you sure you want to reject this application? This action cannot be undone.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {language === 'fr' ? 'Annuler' : 'Cancel'}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleStatusUpdate(row.id, 'rejected')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {language === 'fr' ? 'Rejeter' : 'Reject'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      ),
    },
  ];

  const applications =
    applicationsData?.data?.applications ||
    applicationsData?.applications ||
    [];
  const pagination =
    applicationsData?.data?.pagination || applicationsData?.pagination;
  const totalItems = pagination?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, formFilter, searchQuery, itemsPerPage]);

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'fr'
              ? 'Gestion des Candidatures'
              : 'Applications Management'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'fr'
              ? 'Gérez les candidatures des étudiants'
              : 'Manage student applications'}
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Nouvelle Candidature' : 'New Application'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {language === 'fr'
                  ? 'Créer une Nouvelle Candidature'
                  : 'Create New Application'}
              </DialogTitle>
              <DialogDescription>
                {language === 'fr'
                  ? "Ajoutez une nouvelle candidature d'étudiant"
                  : 'Add a new student application'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">
                    {language === 'fr' ? 'Prénom' : 'First Name'}
                  </Label>
                  <Input
                    id="firstName"
                    value={createFormData.firstName}
                    onChange={e =>
                      handleInputChange('firstName', e.target.value)
                    }
                    placeholder={language === 'fr' ? 'Prénom' : 'First name'}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">
                    {language === 'fr' ? 'Nom de famille' : 'Last Name'}
                  </Label>
                  <Input
                    id="lastName"
                    value={createFormData.lastName}
                    onChange={e =>
                      handleInputChange('lastName', e.target.value)
                    }
                    placeholder={
                      language === 'fr' ? 'Nom de famille' : 'Last name'
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">
                    {language === 'fr' ? 'Email' : 'Email'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={createFormData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    placeholder={language === 'fr' ? 'Email' : 'Email'}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">
                    {language === 'fr' ? 'Téléphone' : 'Phone'}
                  </Label>
                  <Input
                    id="phone"
                    value={createFormData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder={language === 'fr' ? 'Téléphone' : 'Phone'}
                  />
                </div>
                <div>
                  <Label htmlFor="form">
                    {language === 'fr' ? 'Classe' : 'Form'}
                  </Label>
                  <Select
                    value={createFormData.form}
                    onValueChange={value => handleInputChange('form', value)}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          language === 'fr'
                            ? 'Sélectionner une classe'
                            : 'Select a form'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="form1">
                        {language === 'fr' ? 'Première' : 'Form 1'}
                      </SelectItem>
                      <SelectItem value="form2">
                        {language === 'fr' ? 'Deuxième' : 'Form 2'}
                      </SelectItem>
                      <SelectItem value="form3">
                        {language === 'fr' ? 'Troisième' : 'Form 3'}
                      </SelectItem>
                      <SelectItem value="form4">
                        {language === 'fr' ? 'Quatrième' : 'Form 4'}
                      </SelectItem>
                      <SelectItem value="form5">
                        {language === 'fr' ? 'Cinquième' : 'Form 5'}
                      </SelectItem>
                      <SelectItem value="form6">
                        {language === 'fr' ? 'Sixième' : 'Form 6'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">
                  {language === 'fr' ? 'Notes' : 'Notes'}
                </Label>
                <Textarea
                  id="notes"
                  value={createFormData.notes}
                  onChange={e => handleInputChange('notes', e.target.value)}
                  placeholder={
                    language === 'fr'
                      ? 'Notes sur la candidature...'
                      : 'Application notes...'
                  }
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </Button>
                <Button
                  onClick={handleCreateApplication}
                  disabled={createApplicationMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {createApplicationMutation.isPending
                    ? language === 'fr'
                      ? 'Création...'
                      : 'Creating...'
                    : language === 'fr'
                      ? 'Créer la Candidature'
                      : 'Create Application'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Application Details Modal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <div className="space-y-6">
              {/* Header */}
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedApplication.firstName}{' '}
                      {selectedApplication.lastName}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                      {language === 'fr'
                        ? 'Détails de la candidature'
                        : 'Application Details'}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Contact Information */}
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                        <Mail className="w-5 h-5" />
                        {language === 'fr'
                          ? 'Informations de Contact'
                          : 'Contact Information'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <Mail className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {language === 'fr' ? 'Email' : 'Email'}
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {selectedApplication.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <Phone className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {language === 'fr' ? 'Téléphone' : 'Phone'}
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {selectedApplication.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Academic Information */}
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                        <FileText className="w-5 h-5" />
                        {language === 'fr'
                          ? 'Informations Académiques'
                          : 'Academic Information'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <FileText className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {language === 'fr'
                              ? 'Classe demandée'
                              : 'Requested Class'}
                          </p>
                          <Badge
                            variant="outline"
                            className="capitalize text-green-700 dark:text-green-300"
                          >
                            {selectedApplication.form}
                          </Badge>
                        </div>
                      </div>
                      {selectedApplication.notes && (
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            {language === 'fr' ? 'Notes' : 'Notes'}
                          </p>
                          <p className="text-gray-900 dark:text-white">
                            {selectedApplication.notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Documents */}
                  {selectedApplication.documents &&
                    selectedApplication.documents.length > 0 && (
                      <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border-purple-200 dark:border-purple-800">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                            <FileText className="w-5 h-5" />
                            {language === 'fr' ? 'Documents' : 'Documents'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedApplication.documents.map((doc, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <FileText className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {getDocumentName(doc)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                      {doc}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleDownloadDocument(
                                      doc,
                                      getDocumentName(doc)
                                    )
                                  }
                                  className="flex-shrink-0 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  {language === 'fr'
                                    ? 'Télécharger'
                                    : 'Download'}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Status Card */}
                  <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
                        {getStatusIcon(selectedApplication.status)}
                        {language === 'fr' ? 'Statut' : 'Status'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge
                        className={`w-full justify-center py-2 text-sm font-medium ${getStatusColor(selectedApplication.status)}`}
                      >
                        {selectedApplication.status.charAt(0).toUpperCase() +
                          selectedApplication.status.slice(1)}
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Timeline */}
                  <Card className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950 border-gray-200 dark:border-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Clock className="w-5 h-5" />
                        {language === 'fr' ? 'Chronologie' : 'Timeline'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {language === 'fr'
                                ? 'Candidature soumise'
                                : 'Application Submitted'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(
                                selectedApplication.submittedAt
                              ).toLocaleDateString()}{' '}
                              {new Date(
                                selectedApplication.submittedAt
                              ).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        {selectedApplication.reviewedAt && (
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {language === 'fr'
                                  ? 'Candidature examinée'
                                  : 'Application Reviewed'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(
                                  selectedApplication.reviewedAt
                                ).toLocaleDateString()}{' '}
                                {new Date(
                                  selectedApplication.reviewedAt
                                ).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  {selectedApplication.status === 'pending' && (
                    <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-red-900 dark:text-red-100">
                          {language === 'fr' ? 'Actions' : 'Actions'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                              disabled={updateStatusMutation.isPending}
                            >
                              <Check className="w-4 h-4 mr-2" />
                              {language === 'fr' ? 'Approuver' : 'Approve'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {language === 'fr'
                                  ? 'Approuver la candidature'
                                  : 'Approve Application'}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {language === 'fr'
                                  ? 'Êtes-vous sûr de vouloir approuver cette candidature ?'
                                  : 'Are you sure you want to approve this application?'}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {language === 'fr' ? 'Annuler' : 'Cancel'}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  handleStatusUpdate(
                                    selectedApplication.id,
                                    'approved'
                                  );
                                  setIsViewDialogOpen(false);
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {language === 'fr' ? 'Approuver' : 'Approve'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              className="w-full"
                              disabled={updateStatusMutation.isPending}
                            >
                              <X className="w-4 h-4 mr-2" />
                              {language === 'fr' ? 'Rejeter' : 'Reject'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {language === 'fr'
                                  ? 'Rejeter la candidature'
                                  : 'Reject Application'}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {language === 'fr'
                                  ? 'Êtes-vous sûr de vouloir rejeter cette candidature ?'
                                  : 'Are you sure you want to reject this application?'}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {language === 'fr' ? 'Annuler' : 'Cancel'}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  handleStatusUpdate(
                                    selectedApplication.id,
                                    'rejected'
                                  );
                                  setIsViewDialogOpen(false);
                                }}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {language === 'fr' ? 'Rejeter' : 'Reject'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                  <SelectItem value="approved">
                    {language === 'fr' ? 'Approuvé' : 'Approved'}
                  </SelectItem>
                  <SelectItem value="rejected">
                    {language === 'fr' ? 'Rejeté' : 'Rejected'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <label className="text-sm font-medium mb-2 block">
                {language === 'fr' ? 'Classe' : 'Class'}
              </label>
              <Select value={formFilter} onValueChange={setFormFilter}>
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
                  <SelectItem value="form1">
                    {language === 'fr' ? 'Sixième' : 'Form 1'}
                  </SelectItem>
                  <SelectItem value="form2">
                    {language === 'fr' ? 'Cinquième' : 'Form 2'}
                  </SelectItem>
                  <SelectItem value="form3">
                    {language === 'fr' ? 'Quatrième' : 'Form 3'}
                  </SelectItem>
                  <SelectItem value="form4">
                    {language === 'fr' ? 'Troisième' : 'Form 4'}
                  </SelectItem>
                  <SelectItem value="form5">
                    {language === 'fr' ? 'Seconde' : 'Form 5'}
                  </SelectItem>
                  <SelectItem value="form6">
                    {language === 'fr' ? 'Première' : 'Form 6'}
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

      {/* Applications List */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-800">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={applications}
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
                <div className="flex items-center justify-between mt-6 p-6 border-t border-gray-200 dark:border-gray-700">
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
