'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import { Badge } from '../../../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { SingleImageUpload } from '../../../ui/image-upload';
import { useLanguage } from '../../../../hooks/use-language';
import { useToast } from '../../../../hooks/use-toast';
import { type News } from '../../../../schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
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

export default function NewsManagement() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [news, setNews] = useState<News[]>([]);
  const [filteredNews, setFilteredNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingNews, setEditingNews] = useState<News | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Loading states for different operations
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Form schema for news creation/editing
  const newsSchema = z.object({
    title: z
      .string()
      .min(1, language === 'fr' ? 'Le titre est requis' : 'Title is required'),
    titleFr: z.string().optional(),
    content: z
      .string()
      .min(
        1,
        language === 'fr' ? 'Le contenu est requis' : 'Content is required'
      ),
    contentFr: z.string().optional(),
    category: z
      .string()
      .min(
        1,
        language === 'fr' ? 'La catégorie est requise' : 'Category is required'
      ),
    imageUrl: z.string().optional(),
    isPublished: z.boolean().default(false),
  });

  const form = useForm<z.infer<typeof newsSchema>>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      titleFr: '',
      content: '',
      contentFr: '',
      category: 'general',
      imageUrl: '',
      isPublished: false,
    },
  });

  const categories = [
    { value: 'academic', label: language === 'fr' ? 'Académique' : 'Academic' },
    {
      value: 'infrastructure',
      label: language === 'fr' ? 'Infrastructure' : 'Infrastructure',
    },
    { value: 'sports', label: language === 'fr' ? 'Sports' : 'Sports' },
    { value: 'general', label: language === 'fr' ? 'Général' : 'General' },
  ];

  // Fetch news from API with pagination
  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
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

      const url = new URL(`/api/news?${params}`, window.location.origin);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch news');
      const json = await res.json();
      if (json.success) {
        setNews(json.news || []);
        setFilteredNews(json.news || []);
        setTotalItems(json.pagination?.total || json.news?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description:
          language === 'fr'
            ? 'Échec du chargement des actualités'
            : 'Failed to load news',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load news on component mount and when pagination/filters change
  useEffect(() => {
    fetchNews();
  }, [currentPage, itemsPerPage, categoryFilter, statusFilter, searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, statusFilter, searchTerm]);

  const onSubmit = async (data: z.infer<typeof newsSchema>) => {
    try {
      if (editingNews) {
        setIsUpdating(true);
      } else {
        setIsCreating(true);
      }

      const newsData = {
        ...data,
        imageUrl: selectedImage || data.imageUrl || '',
      };

      const url = '/api/news';
      const method = editingNews ? 'PUT' : 'POST';
      const body = editingNews ? { ...newsData, id: editingNews.id } : newsData;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to save news');

      const json = await res.json();
      if (json.success) {
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description: editingNews
            ? language === 'fr'
              ? 'Article mis à jour avec succès'
              : 'News article updated successfully'
            : language === 'fr'
              ? 'Article créé avec succès'
              : 'News article created successfully',
        });
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedImage('');
        form.reset();
        fetchNews();
      }
    } catch (error) {
      console.error('Error saving news:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description:
          language === 'fr' ? 'Échec de la sauvegarde' : 'Failed to save news',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
      setIsUpdating(false);
    }
  };

  const handleDelete = async (newsId: string) => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/news/${newsId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete news');

      const json = await res.json();
      if (json.success) {
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description:
            language === 'fr'
              ? 'Article supprimé avec succès'
              : 'News article deleted successfully',
        });
        fetchNews();
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description:
          language === 'fr'
            ? 'Échec de la suppression'
            : 'Failed to delete news',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setSelectedImage(newsItem.imageUrl || '');
    form.reset({
      title: newsItem.title,
      titleFr: newsItem.titleFr || '',
      content: newsItem.content,
      contentFr: newsItem.contentFr || '',
      category: newsItem.category,
      imageUrl: newsItem.imageUrl || '',
      isPublished: newsItem?.isPublished || false,
    });
    setIsEditModalOpen(true);
  };

  const handleTogglePublish = async (newsItem: News) => {
    try {
      setIsPublishing(true);
      const res = await fetch(`/api/news/${newsItem.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublished: !newsItem.isPublished,
        }),
      });

      if (!res.ok) throw new Error('Failed to toggle publish status');

      const json = await res.json();
      if (json.success) {
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description: newsItem.isPublished
            ? language === 'fr'
              ? 'Article dépublier avec succès'
              : 'News article unpublished successfully'
            : language === 'fr'
              ? 'Article publié avec succès'
              : 'News article published successfully',
        });
        fetchNews();
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description:
          language === 'fr'
            ? 'Échec de la modification du statut'
            : 'Failed to toggle publish status',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'infrastructure':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'sports':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(
      language === 'fr' ? 'fr-FR' : 'en-US'
    );
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? "Articles d'Actualités" : 'News Articles'}{' '}
                ({totalItems})
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'fr'
                  ? "Gérer les articles d'actualités"
                  : 'Manage news articles'}
              </p>
            </div>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Ajouter' : 'Add News'}
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === 'fr' ? 'Créer un Article' : 'Create News Article'}
            </DialogTitle>
            <DialogDescription>
              {language === 'fr'
                ? 'Remplissez les informations pour créer un nouvel article'
                : 'Fill in the information to create a new article'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {language === 'fr' ? 'Titre (EN)' : 'Title (EN)'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            language === 'fr'
                              ? "Titre de l'article"
                              : 'Article title'
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="titleFr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {language === 'fr' ? 'Titre (FR)' : 'Title (FR)'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            language === 'fr'
                              ? "Titre de l'article"
                              : 'Article title'
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {language === 'fr' ? 'Catégorie' : 'Category'}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              language === 'fr'
                                ? 'Sélectionner une catégorie'
                                : 'Select a category'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {language === 'fr' ? 'Contenu (EN)' : 'Content (EN)'}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            language === 'fr'
                              ? "Contenu de l'article..."
                              : 'Article content...'
                          }
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contentFr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {language === 'fr' ? 'Contenu (FR)' : 'Content (FR)'}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            language === 'fr'
                              ? "Contenu de l'article..."
                              : 'Article content...'
                          }
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {language === 'fr' ? 'Image' : 'Image'}
                    </FormLabel>
                    <FormControl>
                      <SingleImageUpload
                        value={selectedImage}
                        onChange={(url: string) => {
                          setSelectedImage(url);
                          field.onChange(url);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="rounded"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {language === 'fr'
                          ? 'Publier immédiatement'
                          : 'Publish immediately'}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </Button>
                <Button type="submit" disabled={isCreating}>
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
            </form>
          </Form>
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
                      ? 'Rechercher dans les articles...'
                      : 'Search articles...'
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
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

      {/* News List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'fr' ? "Articles d'Actualités" : 'News Articles'} (
            {totalItems})
          </CardTitle>
          <CardDescription>
            {language === 'fr'
              ? "Gérer les articles d'actualités"
              : 'Manage news articles'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {filteredNews.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                  >
                    {item.imageUrl && (
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold truncate text-gray-900 dark:text-white">
                          {item.title}
                        </h3>
                        <Badge className={getCategoryColor(item.category)}>
                          {categories.find(c => c.value === item.category)
                            ?.label || item.category}
                        </Badge>
                        <Badge
                          variant={item.isPublished ? 'default' : 'secondary'}
                        >
                          {item.isPublished
                            ? language === 'fr'
                              ? 'Publié'
                              : 'Published'
                            : language === 'fr'
                              ? 'Brouillon'
                              : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {item.content}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatDate(item.createdAt)}</span>
                        {item.publishedAt && (
                          <span>
                            {language === 'fr' ? 'Publié le' : 'Published'}{' '}
                            {formatDate(item.publishedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublish(item)}
                        disabled={isPublishing}
                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      >
                        {isPublishing ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                            {language === 'fr' ? '...' : '...'}
                          </>
                        ) : item.isPublished ? (
                          language === 'fr' ? (
                            'Dépublier'
                          ) : (
                            'Unpublish'
                          )
                        ) : language === 'fr' ? (
                          'Publier'
                        ) : (
                          'Publish'
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {language === 'fr'
                                ? "Supprimer l'article"
                                : 'Delete Article'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {language === 'fr'
                                ? 'Êtes-vous sûr de vouloir supprimer cet article ? Cette action ne peut pas être annulée.'
                                : 'Are you sure you want to delete this article? This action cannot be undone.'}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {language === 'fr' ? 'Annuler' : 'Cancel'}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  {language === 'fr'
                                    ? 'Suppression...'
                                    : 'Deleting...'}
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
                  </div>
                ))}
                {filteredNews.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {language === 'fr'
                      ? 'Aucun article trouvé'
                      : 'No articles found'}
                  </div>
                )}
              </div>

              {/* Pagination */}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === 'fr' ? "Modifier l'Article" : 'Edit News Article'}
            </DialogTitle>
            <DialogDescription>
              {language === 'fr'
                ? "Modifiez les informations de l'article"
                : 'Edit the article information'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {language === 'fr' ? 'Titre (EN)' : 'Title (EN)'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            language === 'fr'
                              ? "Titre de l'article"
                              : 'Article title'
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="titleFr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {language === 'fr' ? 'Titre (FR)' : 'Title (FR)'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            language === 'fr'
                              ? "Titre de l'article"
                              : 'Article title'
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {language === 'fr' ? 'Catégorie' : 'Category'}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              language === 'fr'
                                ? 'Sélectionner une catégorie'
                                : 'Select a category'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {language === 'fr' ? 'Contenu (EN)' : 'Content (EN)'}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            language === 'fr'
                              ? "Contenu de l'article..."
                              : 'Article content...'
                          }
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contentFr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {language === 'fr' ? 'Contenu (FR)' : 'Content (FR)'}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            language === 'fr'
                              ? "Contenu de l'article..."
                              : 'Article content...'
                          }
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {language === 'fr' ? 'Image' : 'Image'}
                    </FormLabel>
                    <FormControl>
                      <SingleImageUpload
                        value={selectedImage}
                        onChange={(url: string) => {
                          setSelectedImage(url);
                          field.onChange(url);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="rounded"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {language === 'fr' ? 'Publier' : 'Publish'}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </Button>
                <Button type="submit" disabled={isUpdating}>
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
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
