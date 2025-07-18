'use client';

import React, { useState } from 'react';
import { useInfiniteQueryData } from '../../hooks/use-infinite-query';
import { useInfiniteScroll } from '../../hooks/use-infinite-scroll';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import {
  Search,
  Filter,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  ArrowLeft,
  Camera,
  Instagram,
  Facebook,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../../hooks/use-language';
import { Gallery } from '../../schema';
import Link from 'next/link';
import { Header } from '../layout/header';
import { Footer } from '../layout/footer';
import Image from 'next/image';

export default function GalleryPage() {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Infinite query for paginated gallery
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQueryData<Gallery>(
    [
      '/api/gallery',
      {
        published: true,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      },
    ],
    async params => {
      const url = new URL('/api/gallery', window.location.origin);
      url.searchParams.set('published', 'true');
      url.searchParams.set('page', String(params.page || 1));
      url.searchParams.set('limit', '12');
      if (params.category) url.searchParams.set('category', params.category);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch gallery');
      const json = await res.json();
      return {
        success: json.success,
        data: json.gallery,
        pagination: json.pagination,
      };
    }
  );

  // Flattened gallery list
  const galleryImages: Gallery[] =
    data?.pages?.flatMap(page => page.data) || [];

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef } = useInfiniteScroll(
    () => {
      if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
    { enabled: !!hasNextPage }
  );

  const categories = [
    {
      value: 'all',
      label: language === 'fr' ? 'Toutes les catégories' : 'All Categories',
    },
    { value: 'campus', label: language === 'fr' ? 'Campus' : 'Campus' },
    { value: 'events', label: language === 'fr' ? 'Événements' : 'Events' },
    { value: 'students', label: language === 'fr' ? 'Étudiants' : 'Students' },
    { value: 'sports', label: language === 'fr' ? 'Sports' : 'Sports' },
    {
      value: 'academics',
      label: language === 'fr' ? 'Académique' : 'Academics',
    },
    {
      value: 'facilities',
      label: language === 'fr' ? 'Installations' : 'Facilities',
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'campus':
        return 'bg-green-100 text-green-700';
      case 'events':
        return 'bg-purple-100 text-purple-700';
      case 'students':
        return 'bg-blue-100 text-blue-700';
      case 'sports':
        return 'bg-orange-100 text-orange-700';
      case 'academics':
        return 'bg-indigo-100 text-indigo-700';
      case 'facilities':
        return 'bg-gray-100 text-gray-700';
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

  const getTitle = (image: Gallery) => {
    return language === 'fr' && image.titleFr ? image.titleFr : image.title;
  };

  const getDescription = (image: Gallery) => {
    return language === 'fr' && image.descriptionFr
      ? image.descriptionFr
      : image.description || '';
  };

  // Filtered images (search)
  const filteredImages = galleryImages.filter((image: Gallery) => {
    const matchesSearch =
      getTitle(image).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDescription(image)?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || image.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentImageIndex(prev =>
        prev > 0 ? prev - 1 : filteredImages.length - 1
      );
    } else {
      setCurrentImageIndex(prev =>
        prev < filteredImages.length - 1 ? prev + 1 : 0
      );
    }
  };

  const downloadImage = (imageUrl: string, title: string) => {
    // Open image in new tab for better download experience
    const link = document.createElement('a');
    link.href = imageUrl;
    link.target = '_blank';
    link.download = `${title.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareImage = async (image: Gallery) => {
    const title = getTitle(image);
    const description = getDescription(image);
    const url = window.location.href;
    const imageUrl = image.imageUrl;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
    }
  };

  const shareToWhatsApp = (image: Gallery) => {
    const title = getTitle(image);
    const description = getDescription(image);
    const url = window.location.href;
    const text = `${title} - ${description} ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToFacebook = (image: Gallery) => {
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };

  const shareToInstagram = (image: Gallery) => {
    // Instagram doesn't support direct sharing via URL, so we'll copy the image URL
    const imageUrl = image.imageUrl;
    navigator.clipboard.writeText(imageUrl).then(() => {
      alert(
        language === 'fr'
          ? "URL de l'image copiée. Collez-la dans Instagram."
          : 'Image URL copied. Paste it in Instagram.'
      );
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            <div className="text-center mb-12">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
              <div className="h-10 bg-gray-200 rounded w-48"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="aspect-square bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            <div className="text-center py-16">
              <div className="text-red-400 mb-4">
                <Camera className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {language === 'fr' ? 'Erreur de chargement' : 'Loading Error'}
              </h3>
              <p className="text-gray-500">
                {language === 'fr'
                  ? 'Impossible de charger la galerie. Veuillez réessayer.'
                  : 'Unable to load gallery. Please try again.'}
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 pt-20 pb-16">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <Camera className="w-16 h-16 text-white mx-auto mb-4" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {language === 'fr' ? 'Galerie Photos' : 'Photo Gallery'}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {language === 'fr'
                ? 'Découvrez les moments précieux de notre école à travers notre collection de photos captivantes'
                : 'Discover the precious moments of our school through our captivating photo collection'}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge className="bg-white/20 text-white border-white/30">
                {filteredImages.length}{' '}
                {language === 'fr' ? 'photos' : 'photos'}
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30">
                {categories.length - 1}{' '}
                {language === 'fr' ? 'catégories' : 'categories'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {/* Search and Filter Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={
                      language === 'fr'
                        ? 'Rechercher des photos...'
                        : 'Search photos...'
                    }
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-48">
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
            </div>
          </div>

          {filteredImages.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {language === 'fr' ? 'Aucune photo trouvée' : 'No photos found'}
              </h3>
              <p className="text-gray-500">
                {language === 'fr'
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Try adjusting your search criteria'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredImages.map((image, index) => (
                  <Card
                    key={image.id}
                    className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div
                      className="relative aspect-square overflow-hidden"
                      onClick={() => openLightbox(index)}
                    >
                      <Image
                        src={image.imageUrl}
                        alt={getTitle(image)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            size="sm"
                            className="bg-white text-gray-900 hover:bg-gray-100"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            {language === 'fr' ? 'Voir' : 'View'}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getCategoryColor(image.category)}>
                          {image.category}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={e => {
                              e.stopPropagation();
                              downloadImage(image.imageUrl, getTitle(image));
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={e => {
                              e.stopPropagation();
                              shareImage(image);
                            }}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {getTitle(image)}
                      </h3>
                      {getDescription(image) && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {getDescription(image)}
                        </p>
                      )}
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(image.createdAt?.toString() || '')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Infinite scroll trigger */}
              <div
                ref={loadMoreRef}
                className="h-12 flex items-center justify-center mt-8"
              >
                {isFetchingNextPage ? (
                  <span className="text-gray-500">
                    {language === 'fr' ? 'Chargement...' : 'Loading more...'}
                  </span>
                ) : !hasNextPage && galleryImages.length > 0 ? (
                  <span className="text-gray-400">
                    {language === 'fr' ? 'Fin des photos' : 'No more photos'}
                  </span>
                ) : null}
              </div>
            </>
          )}

          {/* Enhanced Lightbox Modal */}
          <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
            <DialogContent className="max-w-6xl w-full p-0 bg-black">
              <div className="sr-only">
                <DialogTitle>
                  {filteredImages[currentImageIndex]
                    ? getTitle(filteredImages[currentImageIndex])
                    : 'Gallery Image'}
                </DialogTitle>
                <DialogDescription>
                  {filteredImages[currentImageIndex]
                    ? getDescription(filteredImages[currentImageIndex]) ||
                      'School gallery image'
                    : 'Gallery image viewer'}
                </DialogDescription>
              </div>
              {filteredImages[currentImageIndex] && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                    onClick={() => setIsLightboxOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center justify-center min-h-[70vh]">
                    <Image
                      src={filteredImages[currentImageIndex].imageUrl}
                      alt={getTitle(filteredImages[currentImageIndex])}
                      width={800}
                      height={600}
                      className="max-w-full max-h-[70vh] object-contain"
                    />
                  </div>

                  {/* Navigation Arrows */}
                  {filteredImages.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                        onClick={() => navigateImage('prev')}
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                        onClick={() => navigateImage('next')}
                      >
                        <ChevronRight className="w-6 h-6" />
                      </Button>
                    </>
                  )}

                  {/* Enhanced Image Info and Actions */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <div className="flex justify-between items-end">
                      <div className="text-white">
                        <h3 className="text-xl font-semibold mb-1">
                          {getTitle(filteredImages[currentImageIndex])}
                        </h3>
                        {getDescription(filteredImages[currentImageIndex]) && (
                          <p className="text-gray-300 mb-2">
                            {getDescription(filteredImages[currentImageIndex])}
                          </p>
                        )}
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={getCategoryColor(
                              filteredImages[currentImageIndex].category
                            )}
                          >
                            {filteredImages[currentImageIndex].category}
                          </Badge>
                          {filteredImages[currentImageIndex].createdAt && (
                            <span className="text-sm text-gray-300 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(
                                filteredImages[
                                  currentImageIndex
                                ].createdAt.toString()
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            downloadImage(
                              filteredImages[currentImageIndex].imageUrl,
                              getTitle(filteredImages[currentImageIndex])
                            )
                          }
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {language === 'fr' ? 'Télécharger' : 'Download'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            shareImage(filteredImages[currentImageIndex])
                          }
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          {language === 'fr' ? 'Partager' : 'Share'}
                        </Button>
                      </div>
                    </div>

                    {/* Enhanced Social Media Sharing */}
                    <div className="flex justify-center space-x-4 mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-400 hover:bg-green-400/20"
                        onClick={() =>
                          shareToWhatsApp(filteredImages[currentImageIndex])
                        }
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:bg-blue-400/20"
                        onClick={() =>
                          shareToFacebook(filteredImages[currentImageIndex])
                        }
                      >
                        <Facebook className="w-4 h-4 mr-2" />
                        Facebook
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-pink-400 hover:bg-pink-400/20"
                        onClick={() =>
                          shareToInstagram(filteredImages[currentImageIndex])
                        }
                      >
                        <Instagram className="w-4 h-4 mr-2" />
                        Instagram
                      </Button>
                    </div>

                    {filteredImages.length > 1 && (
                      <div className="text-center mt-4">
                        <span className="text-sm text-gray-300">
                          {currentImageIndex + 1} / {filteredImages.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Divider before Footer */}
      <hr className="my-8 border-gray-200" />
      <Footer />
    </div>
  );
}
