'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../../../hooks/use-auth';
import { useLanguage } from '../../../hooks/use-language';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
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
} from '../../../components/ui/alert-dialog';
import { Textarea } from '../../../components/ui/textarea';
import { useToast } from '../../../hooks/use-toast';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  ImageIcon,
  Calendar,
  ArrowLeft,
  EyeOff,
  Eye as EyeIcon,
  FileText,
  Tag,
  Download,
  Share2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GalleryItem {
  id: number;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  imageUrl: string;
  category:
    | 'facilities'
    | 'events'
    | 'sports'
    | 'academics'
    | 'general'
    | 'cultural'
    | 'environmental';
  isPublished: boolean;
  createdAt: string;
  fileSize?: string;
  dimensions?: string;
}

export default function GalleryManagement() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Form state
  type GalleryCategory =
    | 'facilities'
    | 'events'
    | 'sports'
    | 'academics'
    | 'general'
    | 'cultural'
    | 'environmental';
  const [formData, setFormData] = useState<{
    title: string;
    titleFr: string;
    description: string;
    descriptionFr: string;
    imageUrl: string;
    category: GalleryCategory;
    isPublished: boolean;
  }>({
    title: '',
    titleFr: '',
    description: '',
    descriptionFr: '',
    imageUrl: '',
    category: 'general',
    isPublished: false,
  });

  // Mock data - replace with API calls
  const mockGalleryItems: GalleryItem[] = [
    {
      id: 1,
      title: 'School Building Front View',
      titleFr: 'Vue de Face du Bâtiment Scolaire',
      description:
        'The main entrance of GBHS XYZ showing the beautiful architecture and welcoming environment for students.',
      descriptionFr:
        "L'entrée principale du GBHS XYZ montrant la belle architecture et l'environnement accueillant pour les étudiants.",
      imageUrl:
        'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop',
      category: 'facilities',
      isPublished: true,
      createdAt: '2024-01-15',
      fileSize: '2.3 MB',
      dimensions: '1920x1080',
    },
    {
      id: 2,
      title: 'Students in Classroom',
      titleFr: 'Étudiants en Classe',
      description:
        'Students actively engaged in learning activities in our modern classrooms equipped with the latest educational technology.',
      descriptionFr:
        "Étudiants activement engagés dans des activités d'apprentissage dans nos salles de classe modernes équipées de la dernière technologie éducative.",
      imageUrl:
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
      category: 'academics',
      isPublished: true,
      createdAt: '2024-01-20',
      fileSize: '1.8 MB',
      dimensions: '1600x1200',
    },
    {
      id: 3,
      title: 'Science Laboratory',
      titleFr: 'Laboratoire de Sciences',
      description:
        'Our well-equipped science laboratory where students conduct experiments and develop their scientific skills.',
      descriptionFr:
        'Notre laboratoire de sciences bien équipé où les étudiants mènent des expériences et développent leurs compétences scientifiques.',
      imageUrl:
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
      category: 'facilities',
      isPublished: true,
      createdAt: '2024-02-01',
      fileSize: '3.1 MB',
      dimensions: '2048x1536',
    },
    {
      id: 4,
      title: 'Sports Field',
      titleFr: 'Terrain de Sport',
      description:
        'The school sports field where students participate in various athletic activities and competitions.',
      descriptionFr:
        "Le terrain de sport de l'école où les étudiants participent à diverses activités athlétiques et compétitions.",
      imageUrl:
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      category: 'sports',
      isPublished: false,
      createdAt: '2024-02-05',
      fileSize: '2.7 MB',
      dimensions: '1920x1080',
    },
    {
      id: 5,
      title: 'Library Interior',
      titleFr: 'Intérieur de la Bibliothèque',
      description:
        'Our comprehensive library with a vast collection of books, digital resources, and study spaces for students.',
      descriptionFr:
        "Notre bibliothèque complète avec une vaste collection de livres, ressources numériques et espaces d'étude pour les étudiants.",
      imageUrl:
        'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=600&fit=crop',
      category: 'facilities',
      isPublished: true,
      createdAt: '2024-02-10',
      fileSize: '2.1 MB',
      dimensions: '1800x1350',
    },
    {
      id: 6,
      title: 'Cultural Performance',
      titleFr: 'Performance Culturelle',
      description:
        'Students performing traditional dances during cultural celebrations.',
      descriptionFr:
        'Étudiants exécutant des danses traditionnelles pendant les célébrations culturelles.',
      imageUrl:
        'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
      category: 'cultural',
      isPublished: true,
      createdAt: '2024-02-15',
      fileSize: '2.5 MB',
      dimensions: '1920x1080',
    },
  ];

  const categoryOptions = [
    { value: 'facilities', label: 'Facilities' },
    { value: 'events', label: 'Events' },
    { value: 'sports', label: 'Sports' },
    { value: 'academics', label: 'Academics' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'environmental', label: 'Environmental' },
    { value: 'general', label: 'General' },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setGalleryItems(mockGalleryItems);
      setFilteredItems(mockGalleryItems);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = galleryItems;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        item =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.titleFr.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const isPublished = statusFilter === 'published';
      filtered = filtered.filter(item => item.isPublished === isPublished);
    }

    setFilteredItems(filtered);
  }, [galleryItems, searchTerm, categoryFilter, statusFilter]);

  const handleCreateItem = async () => {
    try {
      // Simulate API call
      const newItem: GalleryItem = {
        id: galleryItems.length + 1,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        fileSize: '2.1 MB',
        dimensions: '1920x1080',
      };

      setGalleryItems([...galleryItems, newItem]);
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Gallery item created successfully',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create gallery item',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      // Simulate API call
      const updatedItems = galleryItems.map(item =>
        item.id === editingItem.id ? { ...item, ...formData } : item
      );
      setGalleryItems(updatedItems);
      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Gallery item updated successfully',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update gallery item',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      // Simulate API call
      setGalleryItems(galleryItems.filter(item => item.id !== itemId));
      toast({
        title: 'Success',
        description: 'Gallery item deleted successfully',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete gallery item',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePublish = async (itemId: number) => {
    try {
      const updatedItems = galleryItems.map(item =>
        item.id === itemId ? { ...item, isPublished: !item.isPublished } : item
      );
      setGalleryItems(updatedItems);
      toast({
        title: 'Success',
        description: `Gallery item ${updatedItems.find(i => i.id === itemId)?.isPublished ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update publication status',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleFr: '',
      description: '',
      descriptionFr: '',
      imageUrl: '',
      category: 'general',
      isPublished: false,
    });
  };

  const openEditDialog = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      titleFr: item.titleFr,
      description: item.description,
      descriptionFr: item.descriptionFr,
      imageUrl: item.imageUrl,
      category: item.category as GalleryCategory,
      isPublished: item.isPublished,
    });
    setIsDialogOpen(true);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'facilities':
        return 'bg-blue-100 text-blue-800';
      case 'events':
        return 'bg-green-100 text-green-800';
      case 'sports':
        return 'bg-orange-100 text-orange-800';
      case 'academics':
        return 'bg-purple-100 text-purple-800';
      case 'cultural':
        return 'bg-pink-100 text-pink-800';
      case 'environmental':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (isPublished: boolean) => {
    return isPublished
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  if (!user) {
    return null;
  }

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
                Back to Dashboard
              </Button>
              <Image
                src="/images/logo.png"
                alt="logo"
                width={32}
                height={32}
                className="w-8 h-8 text-blue-600"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Gallery Management
                </h1>
                <p className="text-sm text-gray-600">
                  Manage school gallery and media
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
                  <Image
                    src="/images/gallery.png"
                    alt="gallery"
                    width={32}
                    height={32}
                    className="w-8 h-8 text-blue-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Images
                    </p>
                    <p className="text-2xl font-bold">{galleryItems.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <EyeIcon className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Published
                    </p>
                    <p className="text-2xl font-bold">
                      {galleryItems.filter(i => i.isPublished).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Tag className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Categories
                    </p>
                    <p className="text-2xl font-bold">
                      {new Set(galleryItems.map(i => i.category)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      This Month
                    </p>
                    <p className="text-2xl font-bold">
                      {
                        galleryItems.filter(i => {
                          const created = new Date(i.createdAt);
                          const now = new Date();
                          return (
                            created.getMonth() === now.getMonth() &&
                            created.getFullYear() === now.getFullYear()
                          );
                        }).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search gallery..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categoryOptions.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Drafts</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingItem(null);
                        resetForm();
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Image
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingItem
                          ? 'Edit Gallery Item'
                          : 'Add New Gallery Item'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingItem
                          ? 'Update gallery item information'
                          : 'Add a new image to the gallery'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title (English)</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                title: e.target.value,
                              })
                            }
                            placeholder="Enter title in English"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="titleFr">Title (French)</Label>
                          <Input
                            id="titleFr"
                            value={formData.titleFr}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                titleFr: e.target.value,
                              })
                            }
                            placeholder="Enter title in French"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value: any) =>
                              setFormData({ ...formData, category: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categoryOptions.map(category => (
                                <SelectItem
                                  key={category.value}
                                  value={category.value}
                                >
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="imageUrl">Image URL</Label>
                          <Input
                            id="imageUrl"
                            value={formData.imageUrl}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                imageUrl: e.target.value,
                              })
                            }
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">
                          Description (English)
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Enter description in English"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="descriptionFr">
                          Description (French)
                        </Label>
                        <Textarea
                          id="descriptionFr"
                          value={formData.descriptionFr}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              descriptionFr: e.target.value,
                            })
                          }
                          placeholder="Enter description in French"
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isPublished"
                          checked={formData.isPublished}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              isPublished: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <Label htmlFor="isPublished">Publish immediately</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={
                          editingItem ? handleUpdateItem : handleCreateItem
                        }
                      >
                        {editingItem ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Gallery Content */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? (
                <div className="col-span-full flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                filteredItems.map(item => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        width={300}
                        height={300}
                      />
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <Badge
                          className={getStatusBadgeColor(item.isPublished)}
                        >
                          {item.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                        <Badge className={getCategoryBadgeColor(item.category)}>
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-sm mb-1 truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedItem(item)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePublish(item.id)}
                          >
                            {item.isPublished ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <EyeIcon className="w-3 h-3" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Gallery Item
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;
                                  {item.title}
                                  &quot;? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Gallery Items ({filteredItems.length})</CardTitle>
                <CardDescription>
                  Manage gallery items and media
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
                          <TableHead>Image</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map(item => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="w-16 h-16 rounded-lg overflow-hidden">
                                <Image
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                  width={256}
                                  height={256}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <div className="font-medium truncate">
                                  {item.title}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {item.titleFr}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {item.description.substring(0, 60)}...
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getCategoryBadgeColor(item.category)}
                              >
                                {item.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getStatusBadgeColor(
                                  item.isPublished
                                )}
                              >
                                {item.isPublished ? 'Published' : 'Draft'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-500">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedItem(item)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(item)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTogglePublish(item.id)}
                                >
                                  {item.isPublished ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <EyeIcon className="w-4 h-4" />
                                  )}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Gallery Item
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete &quot;
                                        {item.title}&quot;? This action cannot
                                        be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteItem(item.id)
                                        }
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
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
          )}
        </div>
      </div>

      {/* Gallery Item Details Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Gallery Item Details</DialogTitle>
            <DialogDescription>
              Detailed view of the selected gallery item
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                  width={300}
                  height={300}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Title (English)
                  </Label>
                  <p className="text-lg font-medium">{selectedItem.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Title (French)
                  </Label>
                  <p className="text-lg font-medium">{selectedItem.titleFr}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Category
                    </Label>
                    <Badge
                      className={getCategoryBadgeColor(selectedItem.category)}
                    >
                      {selectedItem.category}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Status
                    </Label>
                    <Badge
                      className={getStatusBadgeColor(selectedItem.isPublished)}
                    >
                      {selectedItem.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Description (English)
                  </Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedItem.description}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Description (French)
                  </Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedItem.descriptionFr}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Created
                    </Label>
                    <p className="text-sm">
                      {new Date(selectedItem.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {selectedItem.fileSize && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        File Size
                      </Label>
                      <p className="text-sm">{selectedItem.fileSize}</p>
                    </div>
                  )}
                  {selectedItem.dimensions && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Dimensions
                      </Label>
                      <p className="text-sm">{selectedItem.dimensions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedItem(null)}>
              Close
            </Button>
            {selectedItem && (
              <Button
                onClick={() => {
                  setSelectedItem(null);
                  openEditDialog(selectedItem);
                }}
              >
                Edit Item
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
