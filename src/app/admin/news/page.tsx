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
  Newspaper,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Globe,
  Calendar,
  ArrowLeft,
  EyeOff,
  Eye as EyeIcon,
  Image as ImageIcon,
  FileText,
  Tag,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface News {
  id: number;
  title: string;
  titleFr: string;
  content: string;
  contentFr: string;
  category:
    | 'academic'
    | 'infrastructure'
    | 'sports'
    | 'general'
    | 'cultural'
    | 'community';
  imageUrl?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  authorId: number;
  authorName: string;
}

type NewsCategory =
  | 'academic'
  | 'infrastructure'
  | 'sports'
  | 'general'
  | 'cultural'
  | 'community';

export default function NewsManagement() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();

  const [news, setNews] = useState<News[]>([]);
  const [filteredNews, setFilteredNews] = useState<News[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    titleFr: string;
    content: string;
    contentFr: string;
    category: NewsCategory;
    imageUrl: string;
    isPublished: boolean;
  }>({
    title: '',
    titleFr: '',
    content: '',
    contentFr: '',
    category: 'general',
    imageUrl: '',
    isPublished: false,
  });

  // Mock data - replace with API calls
  const mockNews: News[] = [
    {
      id: 1,
      title: 'Welcome to the New Academic Year 2024-2025',
      titleFr: 'Bienvenue à la Nouvelle Année Académique 2024-2025',
      content:
        'We are excited to welcome all students back for the 2024-2025 academic year. This year promises to be filled with learning, growth, and achievement. Our dedicated team of over 100 teachers is ready to guide our 1500+ students towards excellence.',
      contentFr:
        "Nous sommes ravis d'accueillir tous les étudiants pour l'année académique 2024-2025. Cette année promet d'être remplie d'apprentissage, de croissance et de réussite. Notre équipe dévouée de plus de 100 enseignants est prête à guider nos plus de 1500 étudiants vers l'excellence.",
      category: 'academic',
      imageUrl:
        'https://images.unsplash.com/photo-1523050854058-8df90110c9e1?w=800&h=600&fit=crop',
      isPublished: true,
      publishedAt: '2024-09-01',
      createdAt: '2024-08-25',
      authorId: 1,
      authorName: 'Administrator',
    },
    {
      id: 2,
      title: 'Annual Sports Day Announcement',
      titleFr: 'Annonce de la Journée Sportive Annuelle',
      content:
        'Our annual sports day will be held on October 15th, 2024. All students are encouraged to participate in various athletic events including football, basketball, athletics, and traditional games. This event promotes physical fitness and team spirit.',
      contentFr:
        "Notre journée sportive annuelle aura lieu le 15 octobre 2024. Tous les étudiants sont encouragés à participer à divers événements athlétiques, y compris le football, le basketball, l'athlétisme et les jeux traditionnels. Cet événement promeut la forme physique et l'esprit d'équipe.",
      category: 'sports',
      imageUrl:
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      isPublished: true,
      publishedAt: '2024-09-15',
      createdAt: '2024-09-10',
      authorId: 1,
      authorName: 'Administrator',
    },
    {
      id: 3,
      title: 'Science Fair 2024: Innovation and Discovery',
      titleFr: 'Foire aux Sciences 2024: Innovation et Découverte',
      content:
        'The annual science fair showcasing student projects and innovations will be held on November 15th, 2024. Students from all classes will present their research projects, experiments, and innovative solutions to real-world problems.',
      contentFr:
        'La foire aux sciences annuelle présentant les projets et innovations des étudiants aura lieu le 15 novembre 2024. Les étudiants de toutes les classes présenteront leurs projets de recherche, expériences et solutions innovantes aux problèmes du monde réel.',
      category: 'academic',
      imageUrl:
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
      isPublished: false,
      createdAt: '2024-10-01',
      authorId: 1,
      authorName: 'Administrator',
    },
    {
      id: 4,
      title: 'Parent-Teacher Meeting Schedule',
      titleFr: 'Calendrier des Réunions Parents-Enseignants',
      content:
        "Quarterly parent-teacher meetings will be held to discuss student progress. The first meeting is scheduled for October 20th, 2024. Parents are encouraged to attend to discuss their children's academic performance and development.",
      contentFr:
        'Des réunions parents-enseignants trimestrielles seront organisées pour discuter du progrès des étudiants. La première réunion est prévue pour le 20 octobre 2024. Les parents sont encouragés à y assister pour discuter de la performance académique et du développement de leurs enfants.',
      category: 'academic',
      isPublished: true,
      publishedAt: '2024-09-20',
      createdAt: '2024-09-18',
      authorId: 1,
      authorName: 'Administrator',
    },
    {
      id: 5,
      title: 'Environmental Awareness Campaign',
      titleFr: "Campagne de Sensibilisation à l'Environnement",
      content:
        'Our school is launching an environmental awareness campaign to promote sustainable practices. Students will participate in tree planting, waste management workshops, and environmental education programs.',
      contentFr:
        "Notre école lance une campagne de sensibilisation à l'environnement pour promouvoir des pratiques durables. Les étudiants participeront à la plantation d'arbres, des ateliers de gestion des déchets et des programmes d'éducation environnementale.",
      category: 'community',
      imageUrl:
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
      isPublished: true,
      publishedAt: '2024-09-10',
      createdAt: '2024-09-05',
      authorId: 1,
      authorName: 'Administrator',
    },
  ];

  const categoryOptions = [
    { value: 'academic', label: 'Academic' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'sports', label: 'Sports' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'community', label: 'Community' },
    { value: 'general', label: 'General' },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNews(mockNews);
      setFilteredNews(mockNews);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = news;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        item =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.titleFr.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.content.toLowerCase().includes(searchTerm.toLowerCase())
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

    setFilteredNews(filtered);
  }, [news, searchTerm, categoryFilter, statusFilter]);

  const handleCreateNews = async () => {
    try {
      // Simulate API call
      const newNews: News = {
        id: news.length + 1,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        authorId: typeof user?.id === 'number' ? user.id : 1,
        authorName: user?.fullName || 'Administrator',
        publishedAt: formData.isPublished
          ? new Date().toISOString().split('T')[0]
          : undefined,
      };

      setNews([...news, newNews]);
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'News article created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create news article',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateNews = async () => {
    if (!editingNews) return;

    try {
      // Simulate API call
      const updatedNews = news.map(item =>
        item.id === editingNews.id
          ? {
              ...item,
              ...formData,
              publishedAt:
                formData.isPublished && !item.isPublished
                  ? new Date().toISOString().split('T')[0]
                  : item.publishedAt,
            }
          : item
      );
      setNews(updatedNews);
      setIsDialogOpen(false);
      setEditingNews(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'News article updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update news article',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNews = async (newsId: number) => {
    try {
      // Simulate API call
      setNews(news.filter(item => item.id !== newsId));
      toast({
        title: 'Success',
        description: 'News article deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete news article',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePublish = async (newsId: number) => {
    try {
      const updatedNews = news.map(item =>
        item.id === newsId
          ? {
              ...item,
              isPublished: !item.isPublished,
              publishedAt: !item.isPublished
                ? new Date().toISOString().split('T')[0]
                : undefined,
            }
          : item
      );
      setNews(updatedNews);
      toast({
        title: 'Success',
        description: `News article ${updatedNews.find(n => n.id === newsId)?.isPublished ? 'published' : 'unpublished'} successfully`,
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
      content: '',
      contentFr: '',
      category: 'general',
      imageUrl: '',
      isPublished: false,
    });
  };

  const openEditDialog = (newsItem: News) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      titleFr: newsItem.titleFr,
      content: newsItem.content,
      contentFr: newsItem.contentFr,
      category: newsItem.category as NewsCategory,
      imageUrl: newsItem.imageUrl || '',
      isPublished: newsItem.isPublished,
    });
    setIsDialogOpen(true);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'sports':
        return 'bg-green-100 text-green-800';
      case 'cultural':
        return 'bg-purple-100 text-purple-800';
      case 'community':
        return 'bg-orange-100 text-orange-800';
      case 'infrastructure':
        return 'bg-gray-100 text-gray-800';
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
              <Newspaper className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  News Management
                </h1>
                <p className="text-sm text-gray-600">
                  Manage news articles and announcements
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
                  <Newspaper className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Articles
                    </p>
                    <p className="text-2xl font-bold">{news.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Globe className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Published
                    </p>
                    <p className="text-2xl font-bold">
                      {news.filter(n => n.isPublished).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <EyeOff className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Drafts</p>
                    <p className="text-2xl font-bold">
                      {news.filter(n => !n.isPublished).length}
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
                        news.filter(n => {
                          const created = new Date(n.createdAt);
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
                      placeholder="Search news..."
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
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingNews(null);
                        resetForm();
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add News
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingNews
                          ? 'Edit News Article'
                          : 'Add New News Article'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingNews
                          ? 'Update news article information'
                          : 'Create a new news article'}
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
                          <Label htmlFor="imageUrl">Image URL (Optional)</Label>
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
                        <Label htmlFor="content">Content (English)</Label>
                        <Textarea
                          id="content"
                          value={formData.content}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              content: e.target.value,
                            })
                          }
                          placeholder="Enter content in English"
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contentFr">Content (French)</Label>
                        <Textarea
                          id="contentFr"
                          value={formData.contentFr}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              contentFr: e.target.value,
                            })
                          }
                          placeholder="Enter content in French"
                          rows={4}
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
                          editingNews ? handleUpdateNews : handleCreateNews
                        }
                      >
                        {editingNews ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* News Table */}
          <Card>
            <CardHeader>
              <CardTitle>News Articles ({filteredNews.length})</CardTitle>
              <CardDescription>
                Manage news articles and announcements
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
                        <TableHead>Article</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNews.map(newsItem => (
                        <TableRow key={newsItem.id}>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="font-medium truncate">
                                {newsItem.title}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {newsItem.titleFr}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {newsItem.content.substring(0, 100)}...
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getCategoryBadgeColor(
                                newsItem.category
                              )}
                            >
                              {newsItem.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{newsItem.authorName}</div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusBadgeColor(
                                newsItem.isPublished
                              )}
                            >
                              {newsItem.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-500">
                              {new Date(
                                newsItem.createdAt
                              ).toLocaleDateString()}
                            </div>
                            {newsItem.publishedAt && (
                              <div className="text-xs text-gray-400">
                                Published:{' '}
                                {new Date(
                                  newsItem.publishedAt
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedNews(newsItem)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(newsItem)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTogglePublish(newsItem.id)}
                              >
                                {newsItem.isPublished ? (
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
                                      Delete News Article
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete &quot;
                                      {newsItem.title}&quot;? This action cannot
                                      be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteNews(newsItem.id)
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
        </div>
      </div>

      {/* News Details Dialog */}
      <Dialog open={!!selectedNews} onOpenChange={() => setSelectedNews(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>News Article Details</DialogTitle>
            <DialogDescription>
              Detailed view of the selected news article
            </DialogDescription>
          </DialogHeader>
          {selectedNews && (
            <div className="space-y-6">
              {selectedNews.imageUrl && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={selectedNews.imageUrl}
                    alt={selectedNews.title}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Title (English)
                  </Label>
                  <p className="text-lg font-medium">{selectedNews.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Title (French)
                  </Label>
                  <p className="text-lg font-medium">{selectedNews.titleFr}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Category
                    </Label>
                    <Badge
                      className={getCategoryBadgeColor(selectedNews.category)}
                    >
                      {selectedNews.category}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Status
                    </Label>
                    <Badge
                      className={getStatusBadgeColor(selectedNews.isPublished)}
                    >
                      {selectedNews.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Author
                    </Label>
                    <p className="text-sm">{selectedNews.authorName}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Content (English)
                  </Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedNews.content}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Content (French)
                  </Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedNews.contentFr}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Created
                    </Label>
                    <p className="text-sm">
                      {new Date(selectedNews.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {selectedNews.publishedAt && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Published
                      </Label>
                      <p className="text-sm">
                        {new Date(selectedNews.publishedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedNews(null)}>
              Close
            </Button>
            {selectedNews && (
              <Button
                onClick={() => {
                  setSelectedNews(null);
                  openEditDialog(selectedNews);
                }}
              >
                Edit Article
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
