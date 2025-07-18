import React from 'react';
import { Metadata } from 'next';
import NewsDetail from '../../../components/pages/news-detail';
import { getApiUrl } from '../../../lib/utils';

async function getNewsById(id: string) {
  const res = await fetch(getApiUrl(`/api/news/${id}`), {
    cache: 'force-cache',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function generateStaticParams() {
  try {
    const res = await fetch(getApiUrl('/api/news?published=true'));
    if (!res.ok) {
      console.error(
        'Failed to fetch news for static params:',
        res.status,
        res.statusText
      );
      return [];
    }

    const data = await res.json();

    // Handle both paginated and non-paginated responses
    const newsList = data.news || data || [];

    return newsList.map((news: any) => ({
      id: news.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params for news:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const news = await getNewsById(id);
  if (!news) {
    return {
      title: 'News Not Found | GBHS Bafia',
      description: 'The news article could not be found.',
    };
  }
  return {
    title: `${news.title} | GBHS Bafia`,
    description: news.content?.substring(0, 150) || 'GBHS Bafia News',
    openGraph: {
      title: news.title,
      description: news.content?.substring(0, 150),
      images: news.imageUrl ? [news.imageUrl] : [],
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await getNewsById(id);
  if (!news) {
    return (
      <div className="text-center py-20 min-h-[60vh]">
        News article not found.
      </div>
    );
  }
  return <NewsDetail news={news} />;
}
