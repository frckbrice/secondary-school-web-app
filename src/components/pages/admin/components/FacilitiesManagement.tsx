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
  Building,
  Eye,
  Save,
  X,
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

interface Facility {
  id: string;
  name: string;
  nameFr?: string;
  description?: string;
  descriptionFr?: string;
  imageUrl?: string;
  category?: string;
  features?: string[];
  equipment?: string[];
  isPublished: boolean;
  createdAt: string;
}

interface FacilitiesResponse {
  success: boolean;
  data: Facility[];
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

export default function FacilitiesManagement() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Loading states for different operations
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    nameFr: '',
    description: '',
    descriptionFr: '',
    imageUrl: '',
    category: '',
    features: [] as string[],
    equipment: [] as string[],
    isPublished: false,
  });

  const categories = [
    'science',
    'library',
    'sports',
    'arts',
    'technology',
    'administration',
    'other',
  ];

  const { data: facilitiesResponse, refetch } = useQuery({
    queryKey: ['facilities'],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/api/facilities'), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch facilities');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(getApiUrl(`/api/facilities?${params}`));
      const data: FacilitiesResponse = await response.json();

      if (data.success) {
        setFacilities(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.total);
      } else {
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: data.message || 'Failed to fetch facilities',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: 'Failed to fetch facilities',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [currentPage, limit, selectedCategory]);

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      const response = await fetch(getApiUrl('/api/facilities'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description:
            language === 'fr'
              ? 'Installation créée avec succès'
              : 'Facility created successfully',
        });
        setIsCreateModalOpen(false);
        resetForm();
        fetchFacilities();
      } else {
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: data.message || 'Failed to create facility',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: 'Failed to create facility',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingFacility) return;

    try {
      setIsUpdating(true);
      const response = await fetch(
        getApiUrl(`/api/facilities/${editingFacility.id}`),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description:
            language === 'fr'
              ? 'Installation mise à jour avec succès'
              : 'Facility updated successfully',
        });
        setIsEditModalOpen(false);
        setEditingFacility(null);
        resetForm();
        fetchFacilities();
      } else {
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: data.message || 'Failed to update facility',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: 'Failed to update facility',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(getApiUrl(`/api/facilities/${id}`), {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description:
            language === 'fr'
              ? 'Installation supprimée avec succès'
              : 'Facility deleted successfully',
        });
        fetchFacilities();
      } else {
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: data.message || 'Failed to delete facility',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: 'Failed to delete facility',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameFr: '',
      description: '',
      descriptionFr: '',
      imageUrl: '',
      category: '',
      features: [],
      equipment: [],
      isPublished: false,
    });
  };

  const openEditModal = (facility: Facility) => {
    setEditingFacility(facility);
    setFormData({
      name: facility.name,
      nameFr: facility.nameFr || '',
      description: facility.description || '',
      descriptionFr: facility.descriptionFr || '',
      imageUrl: facility.imageUrl || '',
      category: facility.category || '',
      features: facility.features || [],
      equipment: facility.equipment || [],
      isPublished: facility.isPublished,
    });
    setIsEditModalOpen(true);
  };

  const columns = [
    {
      key: 'name',
      label: language === 'fr' ? 'Nom' : 'Name',
    },
    {
      key: 'category',
      label: language === 'fr' ? 'Catégorie' : 'Category',
      render: (value: any, row: any) => (
        <Badge variant="secondary">{row.category}</Badge>
      ),
    },
    {
      key: 'features',
      label: language === 'fr' ? 'Fonctionnalités' : 'Features',
      render: (value: any, row: any) => (
        <div className="flex flex-wrap gap-1">
          {row.features && row.features.length > 0 ? (
            row.features.slice(0, 2).map((feature: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))
          ) : (
            <span className="text-gray-400 text-sm">
              {language === 'fr' ? 'Aucune' : 'None'}
            </span>
          )}
          {row.features && row.features.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{row.features.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'equipment',
      label: language === 'fr' ? 'Équipement' : 'Equipment',
      render: (value: any, row: any) => (
        <div className="flex flex-wrap gap-1">
          {row.equipment && row.equipment.length > 0 ? (
            row.equipment.slice(0, 2).map((item: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {item}
              </Badge>
            ))
          ) : (
            <span className="text-gray-400 text-sm">
              {language === 'fr' ? 'Aucun' : 'None'}
            </span>
          )}
          {row.equipment && row.equipment.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{row.equipment.length - 2}
            </Badge>
          )}
        </div>
      ),
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
                    ? "Supprimer l'installation"
                    : 'Delete Facility'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {language === 'fr'
                    ? 'Êtes-vous sûr de vouloir supprimer cette installation ? Cette action ne peut pas être annulée.'
                    : 'Are you sure you want to delete this facility? This action cannot be undone.'}
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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-blue-50 dark:from-yellow-950/50 dark:to-blue-950/50 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-blue-600 rounded-lg shadow-lg">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'fr' ? 'Installations' : 'Facilities'} ({totalItems}
              )
            </h1>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {language === 'fr'
              ? 'Gestion des Installations'
              : 'Facilities Management'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'fr'
              ? "Gérez les installations de l'école"
              : 'Manage school facilities'}
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {language === 'fr' ? 'Ajouter une Installation' : 'Add Facility'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {language === 'fr'
                  ? 'Ajouter une Installation'
                  : 'Add Facility'}
              </DialogTitle>
              <DialogDescription>
                {language === 'fr'
                  ? 'Créez une nouvelle installation scolaire'
                  : 'Create a new school facility'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name (EN)</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="nameFr">Name (FR)</Label>
                  <Input
                    id="nameFr"
                    value={formData.nameFr}
                    onChange={e =>
                      setFormData({ ...formData, nameFr: e.target.value })
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

              {/* Features Array */}
              <div>
                <Label htmlFor="features">Features (Optional)</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="feature-input"
                      placeholder={
                        language === 'fr'
                          ? 'Ajouter une fonctionnalité...'
                          : 'Add a feature...'
                      }
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          const value = input.value.trim();
                          if (value) {
                            setFormData({
                              ...formData,
                              features: [...(formData.features || []), value],
                            });
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById(
                          'feature-input'
                        ) as HTMLInputElement;
                        const value = input.value.trim();
                        if (value) {
                          setFormData({
                            ...formData,
                            features: [...(formData.features || []), value],
                          });
                          input.value = '';
                        }
                      }}
                    >
                      {language === 'fr' ? 'Ajouter' : 'Add'}
                    </Button>
                  </div>
                  {formData.features && formData.features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              features:
                                formData.features?.filter(
                                  (_, i) => i !== index
                                ) || [],
                            });
                          }}
                        >
                          {feature} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Equipment Array */}
              <div>
                <Label htmlFor="equipment">Equipment (Optional)</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="equipment-input"
                      placeholder={
                        language === 'fr'
                          ? 'Ajouter un équipement...'
                          : 'Add equipment...'
                      }
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          const value = input.value.trim();
                          if (value) {
                            setFormData({
                              ...formData,
                              equipment: [...(formData.equipment || []), value],
                            });
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById(
                          'equipment-input'
                        ) as HTMLInputElement;
                        const value = input.value.trim();
                        if (value) {
                          setFormData({
                            ...formData,
                            equipment: [...(formData.equipment || []), value],
                          });
                          input.value = '';
                        }
                      }}
                    >
                      {language === 'fr' ? 'Ajouter' : 'Add'}
                    </Button>
                  </div>
                  {formData.equipment && formData.equipment.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.equipment.map((item, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              equipment:
                                formData.equipment?.filter(
                                  (_, i) => i !== index
                                ) || [],
                            });
                          }}
                        >
                          {item} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
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
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="category-filter">Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="items-per-page">
                {language === 'fr' ? 'Lignes par page' : 'Items per page'}
              </Label>
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

      {/* Facilities Table */}
      <Card>
        <CardHeader />
        <CardContent>
          <DataTable
            title=""
            columns={columns}
            data={facilities}
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

          {/* Manual Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'fr'
                  ? `Affichage de ${(currentPage - 1) * itemsPerPage + 1} à ${Math.min(currentPage * itemsPerPage, totalItems)} sur ${totalItems} résultats`
                  : `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} results`}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  {language === 'fr' ? 'Précédent' : 'Previous'}
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum =
                      Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
                      i;
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          pageNum === currentPage ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  {language === 'fr' ? 'Suivant' : 'Next'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'fr' ? "Modifier l'Installation" : 'Edit Facility'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name (EN)</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-nameFr">Name (FR)</Label>
                <Input
                  id="edit-nameFr"
                  value={formData.nameFr}
                  onChange={e =>
                    setFormData({ ...formData, nameFr: e.target.value })
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

            {/* Features Array */}
            <div>
              <Label htmlFor="edit-features">Features (Optional)</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="edit-feature-input"
                    placeholder={
                      language === 'fr'
                        ? 'Ajouter une fonctionnalité...'
                        : 'Add a feature...'
                    }
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const value = input.value.trim();
                        if (value) {
                          setFormData({
                            ...formData,
                            features: [...(formData.features || []), value],
                          });
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.getElementById(
                        'edit-feature-input'
                      ) as HTMLInputElement;
                      const value = input.value.trim();
                      if (value) {
                        setFormData({
                          ...formData,
                          features: [...(formData.features || []), value],
                        });
                        input.value = '';
                      }
                    }}
                  >
                    {language === 'fr' ? 'Ajouter' : 'Add'}
                  </Button>
                </div>
                {formData.features && formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            features:
                              formData.features?.filter(
                                (_, i) => i !== index
                              ) || [],
                          });
                        }}
                      >
                        {feature} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Equipment Array */}
            <div>
              <Label htmlFor="edit-equipment">Equipment (Optional)</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="edit-equipment-input"
                    placeholder={
                      language === 'fr'
                        ? 'Ajouter un équipement...'
                        : 'Add equipment...'
                    }
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const value = input.value.trim();
                        if (value) {
                          setFormData({
                            ...formData,
                            equipment: [...(formData.equipment || []), value],
                          });
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.getElementById(
                        'edit-equipment-input'
                      ) as HTMLInputElement;
                      const value = input.value.trim();
                      if (value) {
                        setFormData({
                          ...formData,
                          equipment: [...(formData.equipment || []), value],
                        });
                        input.value = '';
                      }
                    }}
                  >
                    {language === 'fr' ? 'Ajouter' : 'Add'}
                  </Button>
                </div>
                {formData.equipment && formData.equipment.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.equipment.map((item, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            equipment:
                              formData.equipment?.filter(
                                (_, i) => i !== index
                              ) || [],
                          });
                        }}
                      >
                        {item} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
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
