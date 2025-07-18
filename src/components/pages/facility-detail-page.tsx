'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useLanguage } from '../../hooks/use-language';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Building,
  Microscope,
  Monitor,
  Library,
  Trophy,
  Music,
  Palette,
  Utensils,
  ExternalLink,
  ChevronRight,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '../layout/header';
import { Footer } from '../layout/footer';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface FacilityDetailPageProps {
  facilityId: string;
}

interface Facility {
  id: string;
  name: string;
  nameFr?: string;
  description?: string;
  descriptionFr?: string;
  imageUrl?: string;
  category?: string;
  features?: string[];
  equipment?: string[];
  isPublished: boolean;
  createdAt: string;
}

interface FacilitiesResponse {
  success: boolean;
  data: Facility[];
  pagination: any;
}

const getIconComponent = (category: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    science: Microscope,
    library: Library,
    sports: Trophy,
    arts: Palette,
    technology: Monitor,
    administration: Building,
    other: Building,
  };
  return iconMap[category || 'other'] || Building;
};

const getCategoryColor = (category: string) => {
  const colorMap: { [key: string]: string } = {
    science:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
    library:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
    sports:
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700',
    arts: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700',
    technology:
      'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-700',
    administration:
      'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
    other:
      'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  };
  return colorMap[category || 'other'] || colorMap.other;
};

export default function FacilityDetailPage({
  facilityId,
}: FacilityDetailPageProps) {
  const { t, language } = useLanguage();
  const router = useRouter();

  // Fetch facility data from API
  const {
    data: facilityResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['facility', facilityId],
    queryFn: async () => {
      const response = await fetch(`/api/facilities/${facilityId}`);
      if (!response.ok) {
        throw new Error('Facility not found');
      }
      return response.json();
    },
  });

  // Fetch all facilities for the sidebar
  const { data: facilitiesResponse, isLoading: isLoadingFacilities } = useQuery(
    {
      queryKey: ['facilities', 'published'],
      queryFn: async () => {
        const response = await fetch('/api/facilities?isPublished=true');
        if (!response.ok) {
          throw new Error('Failed to fetch facilities');
        }
        return response.json() as Promise<FacilitiesResponse>;
      },
    }
  );

  const facility = facilityResponse?.facility as Facility;
  const allFacilities = facilitiesResponse?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto shadow-lg dark:shadow-gray-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-4">
                  {language === 'fr'
                    ? 'Installation non trouvée'
                    : 'Facility Not Found'}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {language === 'fr'
                    ? "L'installation que vous recherchez n'existe pas ou a été déplacée."
                    : 'The facility you are looking for does not exist or has been moved.'}
                </p>
                <Button onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {language === 'fr' ? 'Retour' : 'Go Back'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const IconComponent = getIconComponent(facility.category || 'other');
  const displayName =
    language === 'fr' && facility.nameFr ? facility.nameFr : facility.name;
  const displayDescription =
    language === 'fr' && facility.descriptionFr
      ? facility.descriptionFr
      : facility.description;

  // Filter out current facility from the sidebar list
  const otherFacilities = allFacilities.filter(f => f.id !== facilityId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Breadcrumb */}
              <nav className="mb-6">
                <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <li>
                    <Link
                      href="/"
                      className="hover:text-primary transition-colors"
                    >
                      {language === 'fr' ? 'Accueil' : 'Home'}
                    </Link>
                  </li>
                  <li>/</li>
                  <li>
                    <Link
                      href="/about"
                      className="hover:text-primary transition-colors"
                    >
                      {language === 'fr' ? 'À propos' : 'About'}
                    </Link>
                  </li>
                  <li>/</li>
                  <li>
                    <Link
                      href="/about"
                      className="hover:text-primary transition-colors"
                    >
                      {language === 'fr' ? 'Installations' : 'Facilities'}
                    </Link>
                  </li>
                  <li>/</li>
                  <li className="text-foreground font-medium">{displayName}</li>
                </ol>
              </nav>

              {/* Back Button */}
              <div className="mb-6">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="hover:bg-background transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {language === 'fr' ? 'Retour' : 'Go Back'}
                </Button>
              </div>

              {/* Facility Header */}
              <Card className="mb-8 shadow-lg dark:shadow-gray-900/20 border-0 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-xl shadow-sm">
                      <IconComponent className="h-10 w-10 text-blue-700 dark:text-blue-300" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-foreground mb-2">
                        {displayName}
                      </CardTitle>
                      <div className="flex items-center space-x-3">
                        {facility.category && (
                          <Badge
                            className={`${getCategoryColor(facility.category)} border`}
                          >
                            {facility.category}
                          </Badge>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(facility.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Facility Image */}
              {facility.imageUrl && (
                <Card className="mb-8 shadow-lg dark:shadow-gray-900/20 border-0 overflow-hidden">
                  <div className="relative h-80 w-full">
                    <Image
                      src={facility.imageUrl}
                      alt={displayName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                </Card>
              )}

              {/* Facility Description */}
              <Card className="mb-8 shadow-lg dark:shadow-gray-900/20 border-0 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {language === 'fr' ? 'Description' : 'Description'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {displayDescription ||
                      (language === 'fr'
                        ? 'Aucune description disponible pour cette installation.'
                        : 'No description available for this facility.')}
                  </p>
                </CardContent>
              </Card>

              {/* Features Section */}
              {facility.features && facility.features.length > 0 && (
                <Card className="mb-8 shadow-lg dark:shadow-gray-900/20 border-0 bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                      <Star className="h-5 w-5 mr-2 text-yellow-500" />
                      {language === 'fr' ? 'Caractéristiques' : 'Features'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {facility.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Equipment Section */}
              {facility.equipment && facility.equipment.length > 0 && (
                <Card className="mb-8 shadow-lg dark:shadow-gray-900/20 border-0 bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                      <Microscope className="h-5 w-5 mr-2 text-green-500" />
                      {language === 'fr' ? 'Équipements' : 'Equipment'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {facility.equipment.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 mt-14">
              <div className="sticky top-20 mt-10 space-y-6">
                {/* Other Facilities - Moved to same level as title */}
                <Card className="shadow-xl dark:shadow-gray-700 border-0 bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                      <Building className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      {language === 'fr'
                        ? 'Autres Installations'
                        : 'Other Facilities'}
                    </CardTitle>
                    <CardDescription>
                      {language === 'fr'
                        ? 'Découvrez nos autres installations'
                        : 'Discover our other facilities'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingFacilities ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="animate-pulse">
                            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : otherFacilities.length > 0 ? (
                      <div className="space-y-3">
                        {otherFacilities.slice(0, 6).map(otherFacility => {
                          const OtherIconComponent = getIconComponent(
                            otherFacility.category || 'other'
                          );
                          const otherDisplayName =
                            language === 'fr' && otherFacility.nameFr
                              ? otherFacility.nameFr
                              : otherFacility.name;

                          return (
                            <Link
                              key={otherFacility.id}
                              href={`/about/facility/${otherFacility.id}`}
                              className="block group"
                            >
                              <div className="p-3 rounded-lg border border-border hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group-hover:shadow-md">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-800 transition-colors">
                                    <OtherIconComponent className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-foreground group-hover:text-blue-900 dark:group-hover:text-blue-100 truncate">
                                      {otherDisplayName}
                                    </h4>
                                    {otherFacility.category && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs mt-1"
                                      >
                                        {otherFacility.category}
                                      </Badge>
                                    )}
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm text-center py-4">
                        {language === 'fr'
                          ? 'Aucune autre installation disponible'
                          : 'No other facilities available'}
                      </p>
                    )}

                    {otherFacilities.length > 6 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <Link
                          href="/about"
                          className="w-full flex items-center justify-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                          <span>
                            {language === 'fr'
                              ? 'Voir toutes les installations'
                              : 'View all facilities'}
                          </span>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="shadow-xl dark:shadow-gray-700 border-0 bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/about">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Building className="h-4 w-4 mr-2" />
                        {language === 'fr'
                          ? 'Toutes les Installations'
                          : 'All Facilities'}
                      </Button>
                    </Link>
                    <Link href="/about">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        {language === 'fr'
                          ? 'Nos Réalisations'
                          : 'Our Achievements'}
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {language === 'fr' ? 'Nous Contacter' : 'Contact Us'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
