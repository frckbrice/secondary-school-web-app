'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DataTable } from '../ui/data-table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Eye,
  MessageSquare,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Plus,
} from 'lucide-react';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/use-language';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  inquiryType: string;
  message: string;
  status: string;
  submittedAt: string;
  respondedAt?: string;
  respondedBy?: string;
  response?: string;
}

interface CreateContactData {
  name: string;
  email: string;
  phone?: string;
  inquiryType: string;
  message: string;
}

export default function ContactsManagement() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [inquiryTypeFilter, setInquiryTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateContactData>({
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: '',
  });

  // Fetch contacts with pagination and filters
  const {
    data: contactsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'contacts',
      currentPage,
      itemsPerPage,
      statusFilter,
      inquiryTypeFilter,
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

      if (inquiryTypeFilter !== 'all') {
        params.append('inquiryType', inquiryTypeFilter);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/contacts?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      return response.json();
    },
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (data: CreateContactData) => {
      const response = await apiRequest('POST', '/api/contacts', data);
      if (!response) throw new Error('Failed to create contact');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description:
          language === 'fr'
            ? 'Message de contact créé avec succès'
            : 'Contact message created successfully',
      });
      setIsCreateDialogOpen(false);
      setCreateFormData({
        name: '',
        email: '',
        phone: '',
        inquiryType: '',
        message: '',
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

  // Update contact status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      response,
    }: {
      id: string;
      status: string;
      response?: string;
    }) => {
      const responseData = await apiRequest(
        'PUT',
        `/api/contacts/${id}/status`,
        {
          status,
          response,
          responderId: 'current-user-id', // Replace with actual user ID
        }
      );
      if (!responseData) throw new Error('Failed to update contact status');
      return responseData.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description:
          language === 'fr'
            ? 'Statut du contact mis à jour avec succès'
            : 'Contact status updated successfully',
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

  const handleStatusUpdate = (
    id: string,
    status: string,
    response?: string
  ) => {
    updateStatusMutation.mutate({ id, status, response });
  };

  const handleCreateContact = () => {
    createContactMutation.mutate(createFormData);
  };

  const handleInputChange = (field: keyof CreateContactData, value: string) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const columns = [
    {
      key: 'contactInfo',
      label:
        language === 'fr' ? 'Informations de contact' : 'Contact Information',
      render: (value: any, row: Contact) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.email}
          </div>
          {row.phone && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'inquiryType',
      label: language === 'fr' ? 'Type de demande' : 'Inquiry Type',
      render: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'message',
      label: language === 'fr' ? 'Message' : 'Message',
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
      key: 'status',
      label: language === 'fr' ? 'Statut' : 'Status',
      render: (value: string) => (
        <Badge
          variant={
            value === 'responded'
              ? 'default'
              : value === 'closed'
                ? 'secondary'
                : value === 'read'
                  ? 'outline'
                  : 'destructive'
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
      render: (value: any, row: Contact) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Eye className="w-4 h-4" />
          </Button>
          {row.status === 'new' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate(row.id, 'read')}
              disabled={updateStatusMutation.isPending}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          )}
          {row.status === 'read' && (
            <Button
              size="sm"
              variant="default"
              onClick={() => handleStatusUpdate(row.id, 'responded')}
              disabled={updateStatusMutation.isPending}
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const contacts = contactsData?.data?.contacts || contactsData?.contacts || [];
  const pagination = contactsData?.data?.pagination || contactsData?.pagination;
  const totalItems = pagination?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, inquiryTypeFilter, searchQuery, itemsPerPage]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50 rounded-xl p-6 border border-cyan-200 dark:border-cyan-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Liste des Contacts' : 'Contacts List'} (
                {totalItems})
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'fr'
                  ? 'Tous les messages de contact'
                  : 'All contact messages'}
              </p>
            </div>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Ajouter' : 'Add Contact'}
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
                  <SelectItem value="new">
                    {language === 'fr' ? 'Nouveau' : 'New'}
                  </SelectItem>
                  <SelectItem value="read">
                    {language === 'fr' ? 'Lu' : 'Read'}
                  </SelectItem>
                  <SelectItem value="responded">
                    {language === 'fr' ? 'Répondu' : 'Responded'}
                  </SelectItem>
                  <SelectItem value="closed">
                    {language === 'fr' ? 'Fermé' : 'Closed'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <label className="text-sm font-medium mb-2 block">
                {language === 'fr' ? 'Type de demande' : 'Inquiry Type'}
              </label>
              <Select
                value={inquiryTypeFilter}
                onValueChange={setInquiryTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      language === 'fr' ? 'Tous les types' : 'All types'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'fr' ? 'Tous les types' : 'All types'}
                  </SelectItem>
                  <SelectItem value="general_inquiry">
                    {language === 'fr' ? 'Demande générale' : 'General Inquiry'}
                  </SelectItem>
                  <SelectItem value="admission_inquiry">
                    {language === 'fr'
                      ? "Demande d'admission"
                      : 'Admission Inquiry'}
                  </SelectItem>
                  <SelectItem value="academic_inquiry">
                    {language === 'fr'
                      ? 'Demande académique'
                      : 'Academic Inquiry'}
                  </SelectItem>
                  <SelectItem value="financial_inquiry">
                    {language === 'fr'
                      ? 'Demande financière'
                      : 'Financial Inquiry'}
                  </SelectItem>
                  <SelectItem value="complaint">
                    {language === 'fr' ? 'Plainte' : 'Complaint'}
                  </SelectItem>
                  <SelectItem value="suggestion">
                    {language === 'fr' ? 'Suggestion' : 'Suggestion'}
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

      {/* Contacts List */}
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
                data={contacts}
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
