'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import { Badge } from '../../../ui/badge';
import { useToast } from '../../../../hooks/use-toast';
import { useLanguage } from '../../../../hooks/use-language';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Trophy,
  Eye,
  Save,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
  import { DataTable } from '../../../ui/data-table';
import { Pagination } from '../../../ui/pagination';
import { getApiUrl } from '../../../../lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from '../../../ui/alert-dialog';

interface Achievement {
  id: string;
  title: string;
  titleFr?: string;
  description?: string;
  descriptionFr?: string;
  imageUrl?: string;
  category?: string;
  date?: string;
  relatedNewsId?: string;
  isPublished: boolean;
  createdAt: string;
}

interface AchievementsResponse {
  success: boolean;
  data: Achievement[];
  message?: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function AchievementsManagement() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] =
    useState<Achievement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Loading states for different operations
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    titleFr: '',
    description: '',
    descriptionFr: '',
    imageUrl: '',
    category: '',
    date: '',
    relatedNewsId: '',
    isPublished: false,
  });

  const categories = [
    'academic',
    'sports',
    'cultural',
    'community',
    'technology',
    'environmental',
    'other',
  ];

  const { data: achievementsResponse, refetch } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/api/achievements'), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }
      return response.json();
    },
  });

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      if (statusFilter !== 'all') {
        params.append(
          'isPublished',
          statusFilter === 'published' ? 'true' : 'false'
        );
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/achievements?${params}`);
      const data: AchievementsResponse = await response.json();

      if (data.success) {
        setAchievements(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.total);
      } else {
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: data.message || 'Failed to fetch achievements',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: 'Failed to fetch achievements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [currentPage, itemsPerPage, selectedCategory, statusFilter, searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, statusFilter, searchTerm]);

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      // Format the date properly for the database
      const formattedData = {
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString() : undefined,
      };

      const response = await fetch(getApiUrl('/api/achievements'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description:
            language === 'fr'
              ? 'Réalisation créée avec succès'
              : 'Achievement created successfully',
        });
        setIsCreateModalOpen(false);
        resetForm();
        fetchAchievements();
      } else {
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: data.message || 'Failed to create achievement',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: 'Failed to create achievement',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingAchievement) return;

    try {
      setIsUpdating(true);
      // Format the date properly for the database
      const formattedData = {
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString() : undefined,
      };

      const response = await fetch(
        getApiUrl(`/api/achievements/${editingAchievement.id}`),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedData),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description:
            language === 'fr'
              ? 'Réalisation mise à jour avec succès'
              : 'Achievement updated successfully',
        });
        setIsEditModalOpen(false);
        setEditingAchievement(null);
        resetForm();
        fetchAchievements();
      } else {
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: data.message || 'Failed to update achievement',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: 'Failed to update achievement',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(getApiUrl(`/api/achievements/${id}`), {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description:
            language === 'fr'
              ? 'Réalisation supprimée avec succès'
              : 'Achievement deleted successfully',
        });
        fetchAchievements();
      } else {
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: data.message || 'Failed to delete achievement',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: 'Failed to delete achievement',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleFr: '',
      description: '',
      descriptionFr: '',
      imageUrl: '',
      category: '',
      date: '',
      relatedNewsId: '',
      isPublished: false,
    });
  };

  const openEditModal = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      title: achievement.title,
      titleFr: achievement.titleFr || '',
      description: achievement.description || '',
      descriptionFr: achievement.descriptionFr || '',
      imageUrl: achievement.imageUrl || '',
      category: achievement.category || '',
      date: achievement.date
        ? new Date(achievement.date).toISOString().split('T')[0]
        : '',
      relatedNewsId: achievement.relatedNewsId || '',
      isPublished: achievement.isPublished,
    });
    setIsEditModalOpen(true);
  };

  const columns = [
    {
      key: 'title',
      label: language === 'fr' ? 'Titre' : 'Title',
      render: (value: any, row: any) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.title}
          </div>
          {row.titleFr && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.titleFr}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      label: language === 'fr' ? 'Catégorie' : 'Category',
      render: (value: any, row: any) => (
        <Badge variant="outline" className="capitalize">
          {row.category}
        </Badge>
      ),
    },
    {
      key: 'date',
      label: language === 'fr' ? 'Date' : 'Date',
      render: (value: any, row: any) =>
        row.date ? new Date(row.date).toLocaleDateString() : '-',
    },
    {
      key: 'isPublished',
      label: language === 'fr' ? 'Statut' : 'Status',
      render: (value: any, row: any) => (
        <Badge variant={row.isPublished ? 'default' : 'secondary'}>
          {row.isPublished
            ? language === 'fr'
              ? 'Publié'
              : 'Published'
            : language === 'fr'
              ? 'Brouillon'
              : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: language === 'fr' ? 'Créé le' : 'Created',
      render: (value: any, row: any) =>
        new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: language === 'fr' ? 'Actions' : 'Actions',
      render: (value: any, row: any) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditModal(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {language === 'fr'
                    ? 'Supprimer la réalisation'
                    : 'Delete Achievement'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {language === 'fr'
                    ? 'Êtes-vous sûr de vouloir supprimer cette réalisation ? Cette action ne peut pas être annulée.'
                    : 'Are you sure you want to delete this achievement? This action cannot be undone.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(row.id)}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {language === 'fr' ? 'Suppression...' : 'Deleting...'}
                    </>
                  ) : language === 'fr' ? (
                    'Supprimer'
                  ) : (
                    'Delete'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  // Calculate pagination
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-950/50 dark:to-blue-950/50 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-blue-600 rounded-lg shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Réalisations' : 'Achievements'} (
                {totalItems})
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'fr'
                  ? "Gérer les réalisations et distinctions de l'école"
                  : 'Manage school achievements and accomplishments'}
              </p>
            </div>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="h-4 w-4 mr-2" />
                {language === 'fr'
                  ? 'Ajouter une Réalisation'
                  : 'Add Achievement'}
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'fr'
                ? 'Ajouter une Réalisation'
                : 'Add Achievement'}
            </DialogTitle>
            <DialogDescription>
              {language === 'fr'
                ? 'Créez une nouvelle réalisation scolaire'
                : 'Create a new school achievement'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title (EN)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="titleFr">Title (FR)</Label>
                <Input
                  id="titleFr"
                  value={formData.titleFr}
                  onChange={e =>
                    setFormData({ ...formData, titleFr: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description">Description (EN)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="descriptionFr">Description (FR)</Label>
                <Textarea
                  id="descriptionFr"
                  value={formData.descriptionFr}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      descriptionFr: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={e =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={value =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={e =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="relatedNewsId">Related News ID (Optional)</Label>
              <Input
                id="relatedNewsId"
                value={formData.relatedNewsId}
                onChange={e =>
                  setFormData({ ...formData, relatedNewsId: e.target.value })
                }
                placeholder="Enter news ID if related to a news article"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={e =>
                  setFormData({ ...formData, isPublished: e.target.checked })
                }
              />
              <Label htmlFor="isPublished">Published</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {language === 'fr' ? 'Création...' : 'Creating...'}
                </>
              ) : language === 'fr' ? (
                'Créer'
              ) : (
                'Create'
              )}
            </Button>
          </div>
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
                      ? 'Rechercher des réalisations...'
                      : 'Search achievements...'
                  }
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <label className="text-sm font-medium mb-2 block">
                {language === 'fr' ? 'Catégorie' : 'Category'}
              </label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      language === 'fr'
                        ? 'Toutes les catégories'
                        : 'All categories'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'fr'
                      ? 'Toutes les catégories'
                      : 'All categories'}
                  </SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
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
                  <SelectItem value="published">
                    {language === 'fr' ? 'Publié' : 'Published'}
                  </SelectItem>
                  <SelectItem value="draft">
                    {language === 'fr' ? 'Brouillon' : 'Draft'}
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

      {/* Achievements List */}
      <Card>
        <CardHeader />
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <DataTable
                title=""
                columns={columns}
                data={achievements}
                loading={loading}
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

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'fr'
                ? 'Modifier la Réalisation'
                : 'Edit Achievement'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Title (EN)</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={e =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-titleFr">Title (FR)</Label>
                <Input
                  id="edit-titleFr"
                  value={formData.titleFr}
                  onChange={e =>
                    setFormData({ ...formData, titleFr: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-description">Description (EN)</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-descriptionFr">Description (FR)</Label>
                <Textarea
                  id="edit-descriptionFr"
                  value={formData.descriptionFr}
                  onChange={e =>
                    setFormData({ ...formData, descriptionFr: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-imageUrl">Image URL</Label>
              <Input
                id="edit-imageUrl"
                value={formData.imageUrl}
                onChange={e =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={value =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={e =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-relatedNewsId">
                Related News ID (Optional)
              </Label>
              <Input
                id="edit-relatedNewsId"
                value={formData.relatedNewsId}
                onChange={e =>
                  setFormData({ ...formData, relatedNewsId: e.target.value })
                }
                placeholder="Enter news ID if related to a news article"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isPublished"
                checked={formData.isPublished}
                onChange={e =>
                  setFormData({ ...formData, isPublished: e.target.checked })
                }
              />
              <Label htmlFor="edit-isPublished">Published</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {language === 'fr' ? 'Mise à jour...' : 'Updating...'}
                </>
              ) : language === 'fr' ? (
                'Mettre à jour'
              ) : (
                'Update'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
