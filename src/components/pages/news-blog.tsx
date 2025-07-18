'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Separator } from '../ui/separator';
import { useLanguage } from '../../hooks/use-language';
import { type News } from '../../schema';
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  ChevronRight,
  BookOpen,
  TrendingUp,
  Tag,
  ArrowRight,
  Users,
  Trophy,
  GraduationCap,
  Megaphone,
} from 'lucide-react';
import { getApiUrl } from '../../lib/utils';

interface NewsResponse {
  success: boolean;
  news: News[];
}

export default function NewsBlog() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const {
    data: newsResponse,
    isLoading,
    error,
  } = useQuery<NewsResponse>({
    queryKey: ['/api/news', { published: true }],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/api/news?published=true'));
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      return response.json();
    },
  });

  // Safely access the news array from the response
  const news = newsResponse?.news || [];

  const categories = [
    {
      value: 'all',
      label: 'All Categories',
      icon: BookOpen,
      count: news.length,
    },
    {
      value: 'academics',
      label: 'Academics',
      icon: GraduationCap,
      count: news.filter(n => n.category === 'academics').length,
    },
    {
      value: 'sports',
      label: 'Sports & Athletics',
      icon: Trophy,
      count: news.filter(n => n.category === 'sports').length,
    },
    {
      value: 'events',
      label: 'School Events',
      icon: Calendar,
      count: news.filter(n => n.category === 'events').length,
    },
    {
      value: 'achievements',
      label: 'Achievements',
      icon: Trophy,
      count: news.filter(n => n.category === 'achievements').length,
    },
    {
      value: 'announcements',
      label: 'General Announcements',
      icon: Megaphone,
      count: news.filter(n => n.category === 'announcements').length,
    },
    {
      value: 'admissions',
      label: 'Admissions',
      icon: Users,
      count: news.filter(n => n.category === 'admissions').length,
    },
  ];

  const filteredAndSortedNews = news
    .filter(article => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || article.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        const dateA = new Date(a.publishedAt || a.createdAt || 0);
        const dateB = new Date(b.publishedAt || b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      } else if (sortBy === 'oldest') {
        const dateA = new Date(a.publishedAt || a.createdAt || 0);
        const dateB = new Date(b.publishedAt || b.createdAt || 0);
        return dateA.getTime() - dateB.getTime();
      }
      return 0;
    });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Recently';
    const now = new Date();
    const articleDate = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return '1 day ago';
      if (diffInDays < 30) return `${diffInDays} days ago`;
      const diffInMonths = Math.floor(diffInDays / 30);
      if (diffInMonths === 1) return '1 month ago';
      return `${diffInMonths} months ago`;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      academics: 'bg-blue-100 text-blue-800 border-blue-200',
      sports: 'bg-green-100 text-green-800 border-green-200',
      events: 'bg-purple-100 text-purple-800 border-purple-200',
      achievements: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      announcements: 'bg-gray-100 text-gray-800 border-gray-200',
      admissions: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      academics: GraduationCap,
      sports: Trophy,
      events: Calendar,
      achievements: Trophy,
      announcements: Megaphone,
      admissions: Users,
    };
    return icons[category] || BookOpen;
  };

  const getFeaturedArticles = () => {
    return filteredAndSortedNews.slice(0, 3);
  };

  const getRegularArticles = () => {
    return filteredAndSortedNews.slice(3);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              GBHS Bafia News
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Stay connected with the latest happenings, achievements, and
              announcements from our school community
            </p>
            <div className="flex items-center justify-center gap-6 text-lg">
              <div className="flex items-center">
                <BookOpen className="w-6 h-6 mr-2" />
                <span>{news.length} Articles</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 mr-2" />
                <span>Updated Daily</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter Section */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search articles, announcements, and news..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-11 h-12"
                />
              </div>
              <div className="flex gap-3">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-48 h-12">
                    <div className="flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="All Categories" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{category.label}</span>
                          <Badge variant="secondary" className="ml-2">
                            {category.count}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-36 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Category Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(1).map(category => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.value}
                  onClick={() => setCategoryFilter(category.value)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                    categoryFilter === category.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <IconComponent
                    className={`w-8 h-8 mx-auto mb-2 ${
                      categoryFilter === category.value
                        ? 'text-blue-600'
                        : 'text-gray-600'
                    }`}
                  />
                  <p
                    className={`text-sm font-medium ${
                      categoryFilter === category.value
                        ? 'text-blue-600'
                        : 'text-gray-900'
                    }`}
                  >
                    {category.label}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {category.count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Error loading news
              </h3>
              <p className="text-gray-600 mb-6">
                Unable to load news articles. Please try again later.
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && filteredAndSortedNews.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No articles found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || categoryFilter !== 'all'
                  ? "Try adjusting your search terms or filters to find what you're looking for."
                  : 'No news articles are currently available. Check back soon for updates!'}
              </p>
              {(searchTerm || categoryFilter !== 'all') && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Featured Articles */}
        {!isLoading && !error && getFeaturedArticles().length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Featured Stories
              </h2>
              <Badge variant="secondary" className="px-3 py-1">
                Latest Updates
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Featured Article */}
              <div className="lg:col-span-2">
                {getFeaturedArticles()[0] && (
                  <Link href={`/news/${getFeaturedArticles()[0].id}`}>
                    <Card className="h-full group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
                      <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-700 relative">
                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                        <div className="absolute bottom-6 left-6 right-6">
                          <Badge
                            className={getCategoryColor(
                              getFeaturedArticles()[0].category
                            )}
                            variant="secondary"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {getFeaturedArticles()[0].category}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {getFeaturedArticles()[0].title}
                        </h3>
                        <p className="text-gray-600 mb-6 line-clamp-3 text-lg leading-relaxed">
                          {getFeaturedArticles()[0].content.substring(0, 200)}
                          ...
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(
                              getFeaturedArticles()[0].publishedAt?.toString() ||
                                getFeaturedArticles()[0].createdAt?.toString() ||
                                null
                            )}
                          </div>
                          <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                            <span className="text-sm font-medium mr-1">
                              Read More
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )}
              </div>

              {/* Secondary Featured Articles */}
              <div className="space-y-6">
                {getFeaturedArticles()
                  .slice(1, 3)
                  .map(article => (
                    <Link key={article.id} href={`/news/${article.id}`}>
                      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <Badge
                              className={getCategoryColor(article.category)}
                              variant="secondary"
                            >
                              {article.category}
                            </Badge>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {getTimeAgo(
                                article.publishedAt?.toString() ||
                                  article.createdAt?.toString() ||
                                  null
                              )}
                            </div>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {article.content.substring(0, 120)}...
                          </p>
                          <div className="flex items-center justify-end">
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* All Articles Grid */}
        {!isLoading && !error && getRegularArticles().length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">All Articles</h2>
              <div className="flex items-center text-sm text-gray-600">
                <span>
                  Showing {filteredAndSortedNews.length} of {news.length}{' '}
                  articles
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getRegularArticles().map(article => {
                const CategoryIcon = getCategoryIcon(article.category);
                return (
                  <Link key={article.id} href={`/news/${article.id}`}>
                    <Card className="h-full group hover:shadow-xl transition-all duration-300 cursor-pointer">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge
                            className={getCategoryColor(article.category)}
                            variant="secondary"
                          >
                            <CategoryIcon className="w-3 h-3 mr-1" />
                            {article.category}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(
                              article.publishedAt?.toString() ||
                                article.createdAt?.toString() ||
                                null
                            )}
                          </div>
                        </div>
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {article.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                          {article.content.substring(0, 150)}...
                        </p>
                        <Separator className="mb-4" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {getTimeAgo(
                              article.publishedAt?.toString() ||
                                article.createdAt?.toString() ||
                                null
                            )}
                          </div>
                          <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                            <span className="text-sm font-medium mr-1">
                              Read Article
                            </span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="mt-20">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-700 text-white overflow-hidden">
            <CardContent className="p-12 text-center relative">
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">
                  Never Miss an Update
                </h3>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Stay informed about the latest news, events, and achievements
                  from GBHS Bafia. Get important announcements delivered
                  directly to your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <Input
                    placeholder="Enter your email address"
                    className="bg-white text-gray-900 border-none h-12"
                  />
                  <Button variant="secondary" className="h-12 px-8">
                    Subscribe
                  </Button>
                </div>
                <p className="text-sm text-blue-200 mt-4">
                  Join over 2,000 parents, students, and community members who
                  stay connected with GBHS Bafia.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
