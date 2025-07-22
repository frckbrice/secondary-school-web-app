'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { useLanguage } from '../../../hooks/use-language';
import { type News } from '../../../schema';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  BookmarkPlus,
  Facebook,
  Twitter,
  Mail,
  Tag,
} from 'lucide-react';

interface NewsDetailProps {
  news: News;
}

export default function NewsDetail({ news }: NewsDetailProps) {
  const { language } = useLanguage();
  const [isBookmarked, setIsBookmarked] = useState(false);

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
      return `${diffInDays} days ago`;
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
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const shareArticle = (platform: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = news?.title || '';

    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
          '_blank'
        );
        break;
      case 'email':
        window.open(
          `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
    }
  };

  return (
    <div className="min-h-[60vh] min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <Link href="/news">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to News
            </Button>
          </Link>

          {/* Article Content */}
          <article className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b">
              <div className="flex items-center gap-3 mb-6">
                <Badge className={getCategoryColor(news.category)}>
                  <Tag className="w-3 h-3 mr-1" />
                  {news.category}
                </Badge>
                <span className="text-gray-400">•</span>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(
                    news.publishedAt?.toString() ||
                      news.createdAt?.toString() ||
                      null
                  )}
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {getTimeAgo(
                    news.publishedAt?.toString() ||
                      news.createdAt?.toString() ||
                      null
                  )}
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {news.title}
              </h1>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <User className="w-5 h-5 mr-2" />
                  <span>By "" Administration</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                  >
                    <BookmarkPlus
                      className={`w-4 h-4 mr-1 ${isBookmarked ? 'fill-current' : ''}`}
                    />
                    {isBookmarked ? 'Saved' : 'Save'}
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareArticle('facebook')}
                    >
                      <Facebook className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareArticle('twitter')}
                    >
                      <Twitter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareArticle('email')}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Article Body */}
            <div className="p-8">
              <div className="prose prose-lg max-w-none">
                {news.content.split('\n').map((paragraph, index) => {
                  if (paragraph.trim() === '') return null;

                  // Check if paragraph is a header (starts with ##)
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h2
                        key={index}
                        className="text-2xl font-bold text-gray-900 mt-8 mb-4"
                      >
                        {paragraph.substring(3)}
                      </h2>
                    );
                  }

                  // Check if paragraph is a subheader (starts with ###)
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h3
                        key={index}
                        className="text-xl font-semibold text-gray-900 mt-6 mb-3"
                      >
                        {paragraph.substring(4)}
                      </h3>
                    );
                  }

                  // Check if paragraph is a list item (starts with -)
                  if (paragraph.startsWith('- ')) {
                    return (
                      <li
                        key={index}
                        className="text-gray-700 leading-relaxed mb-2"
                      >
                        {paragraph.substring(2)}
                      </li>
                    );
                  }

                  return (
                    <p
                      key={index}
                      className="text-gray-700 leading-relaxed mb-6 text-lg"
                    >
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Article Footer */}
            <div className="p-8 bg-gray-50 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Share this article:
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareArticle('facebook')}
                    >
                      <Facebook className="w-4 h-4 mr-1" />
                      Facebook
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareArticle('twitter')}
                    >
                      <Twitter className="w-4 h-4 mr-1" />
                      Twitter
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  Published on{' '}
                  {formatDate(
                    news.publishedAt?.toString() ||
                      news.createdAt?.toString() ||
                      null
                  )}
                </div>
              </div>
            </div>
          </article>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Stay Updated with "" News
                </h3>
                <p className="text-gray-600 mb-6">
                  Don&apos;t miss out on the latest announcements, achievements,
                  and events from our school community.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/news">
                    <Button>View All News</Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline">Visit Homepage</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
