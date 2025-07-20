'use client';

import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../ui/button';
import React from 'react';
import { Images } from 'lucide-react';
import { useLanguage } from '../../../../hooks/use-language';
import { Gallery } from '../../../../schema';
import Link from 'next/link';
import Image from 'next/image';
import { getApiUrl } from '../../../../lib/utils';

interface GalleryResponse {
  success: boolean;
  gallery: Gallery[];
}

export default function FeaturedGallery() {
  const { t, language } = useLanguage();

  const {
    data: galleryResponse,
    isLoading,
    error,
  } = useQuery<GalleryResponse>({
    queryKey: ['/api/gallery?published=true'],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/api/gallery?published=true'));
      if (!response.ok) {
        throw new Error('Failed to fetch gallery');
      }
      return response.json();
    },
  });

  const getTitle = (image: Gallery) => {
    return language === 'fr' && image.titleFr ? image.titleFr : image.title;
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-green-50 via-background to-blue-50 dark:from-green-950 dark:via-background dark:to-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-bold text-3xl sm:text-4xl text-foreground mb-4">
              {t('gallery.title')}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('gallery.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className={`${i === 1 ? 'col-span-2 row-span-2' : ''} bg-muted animate-pulse rounded-lg h-32 md:h-48`}
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Safely access the gallery array from the response
  const galleryImages = galleryResponse?.gallery || [];
  const displayImages = galleryImages.slice(0, 6);

  // Fallback images if no gallery data
  const fallbackImages = [
    {
      id: 1,
      title: 'Modern Classroom Learning',
      imageUrl:
        'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'academics',
    },
    {
      id: 2,
      title: 'Chemistry Laboratory',
      imageUrl:
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      category: 'facilities',
    },
    {
      id: 3,
      title: 'School library',
      imageUrl:
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      category: 'facilities',
    },
    {
      id: 4,
      title: 'Sports Activities',
      imageUrl:
        'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      category: 'sports',
    },
    {
      id: 5,
      title: 'Computer Lab',
      imageUrl:
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      category: 'facilities',
    },
  ];

  const imagesToShow =
    displayImages.length > 0 ? displayImages : fallbackImages;

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 via-background to-blue-50 dark:from-green-950 dark:via-background dark:to-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-bold text-3xl sm:text-4xl text-foreground mb-4">
            {t('gallery.title')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('gallery.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Large Featured Image */}
          <div className="col-span-2 row-span-2">
            <Image
              src={imagesToShow[0]?.imageUrl}
              alt={
                getTitle(imagesToShow[0] as Gallery) || imagesToShow[0]?.title
              }
              width={800}
              height={600}
              className="w-full h-full object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            />
          </div>

          {/* Smaller Images */}
          {imagesToShow.slice(1, 5).map((image, index) => (
            <Image
              key={image.id || index}
              src={image.imageUrl}
              alt={getTitle(image as Gallery) || image.title}
              width={400}
              height={192}
              className="w-full h-32 md:h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/gallery">
            <Button className="inline-flex items-center bg-blue-600 text-white hover:bg-blue-700">
              <Images className="w-5 h-5 mr-2" />
              {t('gallery.viewFull')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
