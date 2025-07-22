'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import React from 'react';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { useLanguage } from '../../../../hooks/use-language';
import { News } from '../../../../schema';
import Link from 'next/link';
import { getApiUrl } from '../../../../lib/utils';

interface NewsResponse {
  success: boolean;
  news: News[];
}

export default function NewsAnnouncements() {
  const { language } = useLanguage();

  const {
    data: newsResponse,
    isLoading,
    error,
  } = useQuery<NewsResponse>({
    queryKey: ['/api/news?published=true'],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/api/news?published=true'));
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      return response.json();
    },
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-100 text-blue-700';
      case 'infrastructure':
        return 'bg-green-100 text-green-700';
      case 'sports':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTitle = (news: News) => {
    return language === 'fr' && news.titleFr ? news.titleFr : news.title;
  };

  const getContent = (news: News) => {
    return language === 'fr' && news.contentFr ? news.contentFr : news.content;
  };

  if (isLoading) {
    return (
      <section
        id="news"
        className="py-16 bg-gradient-to-br from-blue-50 via-background to-orange-50 dark:from-blue-950 dark:via-background dark:to-orange-950"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-bold text-3xl sm:text-4xl text-foreground mb-4">
              {language === 'fr' ? 'Actualités' : 'News'}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <Card key={i} className="shadow-md animate-pulse">
                <div className="w-full h-48 bg-muted"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-3"></div>
                  <div className="h-6 bg-muted rounded mb-3"></div>
                  <div className="h-16 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Handle error state
  if (error) {
    return (
      <section id="news" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Failed to load news. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Safely access the news array from the response
  const newsItems = newsResponse?.news || [];
  const displayNews = newsItems.slice(0, 3);

  return (
    <section id="news" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 flex items-center justify-center border-b border-gray-200 pb-4 bg-gradient-to-br from-blue-300 via-background to-orange-50 dark:from-blue-950 dark:via-background dark:to-orange-950 dark:border-none rounded-md sm:rounded-lg">
          <h2 className="font-bold text-3xl sm:text-4xl text-foreground mb-4">
            {language === 'fr' ? 'Actualités' : 'News'}
          </h2>
        </div>

        {displayNews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {language === 'fr'
                ? 'Aucune actualité disponible pour le moment.'
                : 'No news articles available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayNews.map(newsItem => (
              <Card
                key={newsItem.id}
                className="shadow-md hover:shadow-lg transition-shadow"
              >
                {newsItem.imageUrl && (
                  <Image
                    src={newsItem.imageUrl}
                    alt={getTitle(newsItem)}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                    <Badge className={getCategoryColor(newsItem.category)}>
                      {newsItem.category}
                    </Badge>
                    {newsItem.publishedAt && (
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(newsItem.publishedAt.toString())}
                        </span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-xl text-foreground mb-3 line-clamp-2">
                    {getTitle(newsItem)}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {getContent(newsItem).substring(0, 150)}...
                  </p>
                  <Link href={`/news/${newsItem.id}`}>
                    <Button
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-700 p-0"
                    >
                      {language === 'fr' ? 'Lire la suite' : 'Read More'}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/news">
            <Button
              variant="outline"
              className="inline-flex items-center text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              {language === 'fr'
                ? 'Voir toutes les actualités'
                : 'View All News'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
