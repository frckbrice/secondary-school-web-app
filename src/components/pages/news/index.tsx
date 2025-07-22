'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useInfiniteQueryData } from '../../../hooks/use-infinite-query';
import { useInfiniteScroll } from '../../../hooks/use-infinite-scroll';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { useLanguage } from '../../../hooks/use-language';
import { type News } from '../../../schema';
import { useSettings } from '../../providers/settings-provider';
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  ArrowLeft,
  Newspaper,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '../../globals/layout/header';
import { Footer } from '../../globals/layout/footer';

export default function NewsPage() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<News | null>(null);
  const { settings } = useSettings();
  // Infinite query for paginated news
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQueryData<News>(
    [
      '/api/news',
      {
        published: true,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      },
    ],
    async params => {
      const url = new URL('/api/news', window.location.origin);
      url.searchParams.set('published', 'true');
      url.searchParams.set('page', String(params.page || 1));
      url.searchParams.set('limit', '9');
      if (params.category) url.searchParams.set('category', params.category);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch news');
      const json = await res.json();
      return {
        success: json.success,
        data: json.news,
        pagination: json.pagination,
      };
    }
  );

  // Flattened news list
  const news: News[] =
    (data as { pages?: any })?.pages?.flatMap((page: any) => page.data) || [];

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef } = useInfiniteScroll(
    () => {
      if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
    { enabled: !!hasNextPage }
  );

  const filteredNews = news.filter((article: News) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString)
      return language === 'fr' ? 'Date non disponible' : 'Date not available';
    return new Date(dateString).toLocaleDateString(
      language === 'fr' ? 'fr-FR' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
  };

  const categories: { value: string; label: string }[] = [
    {
      value: 'all',
      label: language === 'fr' ? 'Toutes les catégories' : 'All Categories',
    },
    {
      value: 'academics',
      label: language === 'fr' ? 'Académique' : 'Academics',
    },
    {
      value: 'sports',
      label: language === 'fr' ? 'Sports & Athlétisme' : 'Sports & Athletics',
    },
    {
      value: 'events',
      label: language === 'fr' ? 'Événements' : 'School Events',
    },
    {
      value: 'achievements',
      label: language === 'fr' ? 'Réalisations' : 'Achievements',
    },
    {
      value: 'announcements',
      label: language === 'fr' ? 'Annonces' : 'General Announcements',
    },
    {
      value: 'admissions',
      label: language === 'fr' ? 'Admissions' : 'Admissions',
    },
  ];

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return language === 'fr' ? 'Récemment' : 'Recently';
    const now = new Date();
    const articleDate = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return language === 'fr'
        ? `Il y a ${diffInHours} heures`
        : `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return language === 'fr'
        ? `Il y a ${diffInDays} jours`
        : `${diffInDays} days ago`;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      academics: 'bg-blue-100 text-blue-800',
      sports: 'bg-green-100 text-green-800',
      events: 'bg-purple-100 text-purple-800',
      achievements: 'bg-yellow-100 text-yellow-800',
      announcements: 'bg-gray-100 text-gray-800',
      admissions: 'bg-red-100 text-red-800',
      cultural: 'bg-orange-100 text-orange-800',
      academic: 'bg-yellow-100 text-yellow-800',
      general: 'bg-gray-400 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 sm:py-8 py-4">
          <Button
            onClick={() => setSelectedArticle(null)}
            variant="ghost"
            className="mb-6 flex items-center space-x-2 "
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {language === 'fr' ? 'Retour aux actualités' : 'Back to News'}
            </span>
          </Button>

          <article className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge className={getCategoryColor(selectedArticle.category)}>
                    {selectedArticle.category}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(
                      selectedArticle.publishedAt?.toString() ||
                        selectedArticle.createdAt?.toString() ||
                        null
                    )}
                  </div>
                </div>
                <CardTitle className="text-3xl mb-4">
                  {selectedArticle.title}
                </CardTitle>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-1" />
                  <span>
                    {language === 'fr'
                      ? "Par l'Administration  " +
                        (settings?.siteNameFr || 'Nom du Site')
                      : 'By  ' +
                        (settings?.siteName || 'Nom du Site') +
                        ' Administration'}
                  </span>
                  <Clock className="w-4 h-4 ml-4 mr-1" />
                  <span>
                    {getTimeAgo(
                      selectedArticle.publishedAt?.toString() ||
                        selectedArticle.createdAt?.toString() ||
                        null
                    )}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {selectedArticle.content.split('\n').map(
                    (paragraph, index) =>
                      paragraph.trim() && (
                        <p
                          key={index}
                          className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed"
                        >
                          {paragraph}
                        </p>
                      )
                  )}
                </div>
              </CardContent>
            </Card>
          </article>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with School Photo Background */}
      <div
        className="relative min-h-[70vh] flex-col 
        sm:flex items-center justify-center p-4 sm:p-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Navigation Header */}
        <div className="sm:absolute sm:top-20 sm:left-0 sm:right-0 sm:z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="flex-col  items-center justify-center py-4 w-full 
            space-y-4"
            >
              {/* <Link href="/" className='hidden sm:block'>
                <Button
                  variant="ghost"
                  className="
                  text-white hover:bg-white/20
                  flex items-center
                  space-x-2 backdrop-blur-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>
                    {language === 'fr' ? "Retour à l'accueil" : 'Back to Home'}
                  </span>
                </Button>
              </Link> */}
              <h1
                className="ml-6 sm:ml-0 text-2xl 
              sm:text-3xl font-bold text-white text-center"
              >
                {language === 'fr'
                  ? 'Actualités & Annonces'
                  : 'News & Announcements'}
              </h1>
              <div className="w-32"></div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto sm:mt-10 px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20">
            <Newspaper className="w-16 h-16 mx-auto mb-6 text-blue-300" />
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4">
              {language === 'fr' ? 'Restez Informés' : 'Stay Informed'}
            </h2>
            <p className="text-lg md:text-2xl text-blue-100 leading-relaxed mb-6">
              {language === 'fr'
                ? 'Découvrez les dernières nouvelles, événements et réalisations de notre école'
                : 'Discover the latest news, events, and achievements from our school'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <span className="text-blue-200 font-medium text-base sm:text-lg">
                  {filteredNews.length}{' '}
                  {language === 'fr' ? 'articles' : 'articles'}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <span className="text-blue-200 font-medium text-base sm:text-lg">
                  {language === 'fr'
                    ? 'Mise à jour régulière'
                    : 'Regular Updates'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={
                  language === 'fr'
                    ? 'Rechercher des articles...'
                    : 'Search articles...'
                }
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* News Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="shadow-md animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-16 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {language === 'fr' ? 'Erreur de chargement' : 'Loading Error'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'fr'
                  ? 'Impossible de charger les actualités. Veuillez réessayer.'
                  : 'Unable to load news. Please try again.'}
              </p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {language === 'fr'
                  ? 'Aucun article trouvé'
                  : 'No articles found'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'fr'
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Try adjusting your search criteria'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredNews.map((article: News) => (
                  <Card
                    key={article.id}
                    className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedArticle(article)}
                  >
                    {article.imageUrl && (
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                        <Badge className={getCategoryColor(article.category)}>
                          {article.category}
                        </Badge>
                        {article.publishedAt && (
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDate(article.publishedAt.toString())}
                            </span>
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-xl mb-3 line-clamp-2">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3 mb-4">
                        {article.content.substring(0, 150)}...
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>
                            {getTimeAgo(
                              article.publishedAt?.toString() ||
                                article.createdAt?.toString() ||
                                null
                            )}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {language === 'fr' ? 'Lire' : 'Read'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Infinite scroll trigger */}
              <div
                ref={loadMoreRef}
                className="h-12 flex items-center justify-center"
              >
                {isFetchingNextPage ? (
                  <span className="text-gray-500">
                    {language === 'fr' ? 'Chargement...' : 'Loading more...'}
                  </span>
                ) : !hasNextPage && news.length > 0 ? (
                  <span className="text-gray-400">
                    {language === 'fr'
                      ? 'Fin des articles'
                      : 'No more articles'}
                  </span>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
