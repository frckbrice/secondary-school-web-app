'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { useLanguage } from '../../../hooks/use-language';
import {
  ArrowLeft,
  Calendar,
  Trophy,
  Star,
  Award,
  Music,
  Palette,
  BookOpen,
  Target,
  Users,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '../../globals/layout/header';
import { Footer } from '../../globals/layout/footer';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { type News } from '../../../schema';

interface AchievementDetailPageProps {
  achievementId: string;
}

interface NewsResponse {
  success: boolean;
  news: News[];
}

interface Achievement {
  id: string;
  title: string;
  titleFr?: string;
  description?: string;
  descriptionFr?: string;
  imageUrl?: string;
  category?: string;
  date?: string;
  relatedNewsId?: string;
  isPublished: boolean;
  createdAt: string;
}

interface AchievementsResponse {
  success: boolean;
  data: Achievement[];
  pagination: any;
}

const getIconComponent = (category: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    academic: BookOpen,
    sports: Trophy,
    cultural: Music,
    arts: Palette,
    community: Users,
    technology: Target,
    other: Award,
  };
  return iconMap[category || 'other'] || Award;
};

const getCategoryColor = (category: string) => {
  const colorMap: { [key: string]: string } = {
    academic:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
    sports:
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700',
    cultural:
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700',
    arts: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-200 dark:border-pink-700',
    community:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
    technology:
      'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-700',
    other:
      'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  };
  return colorMap[category || 'other'] || colorMap.other;
};

export default function AchievementDetailPage({
  achievementId,
}: AchievementDetailPageProps) {
  const { language } = useLanguage();
  const router = useRouter();

  // Fetch achievement data from API
  const {
    data: achievementResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['achievement', achievementId],
    queryFn: async () => {
      const response = await fetch(`/api/achievements/${achievementId}`);
      if (!response.ok) {
        throw new Error('Achievement not found');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch all achievements for the sidebar
  const { data: achievementsResponse, isLoading: isLoadingAchievements } =
    useQuery({
      queryKey: ['achievements', 'published'],
      queryFn: async () => {
        const response = await fetch('/api/achievements?isPublished=true');
        if (!response.ok) {
          throw new Error('Failed to fetch achievements');
        }
        return response.json() as Promise<AchievementsResponse>;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    });

  const achievement = achievementResponse?.achievement as Achievement;
  const allAchievements = achievementsResponse?.data || [];

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

  if (error || !achievement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto shadow-lg dark:shadow-gray-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-4">
                  {language === 'fr'
                    ? 'Réalisation non trouvée'
                    : 'Achievement Not Found'}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {language === 'fr'
                    ? "La réalisation que vous recherchez n'existe pas ou a été déplacée."
                    : 'The achievement you are looking for does not exist or has been moved.'}
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

  const IconComponent = getIconComponent(achievement.category || 'other');
  const displayTitle =
    language === 'fr' && achievement.titleFr
      ? achievement.titleFr
      : achievement.title;
  const displayDescription =
    language === 'fr' && achievement.descriptionFr
      ? achievement.descriptionFr
      : achievement.description;

  // Filter out current achievement from the sidebar list
  const otherAchievements = allAchievements.filter(a => a.id !== achievementId);

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
                      {language === 'fr' ? 'Réalisations' : 'Achievements'}
                    </Link>
                  </li>
                  <li>/</li>
                  <li className="text-foreground font-medium text-wrap">
                    {displayTitle.length > 20 ? (
                      <>
                        <br className="sm:hidden" />
                        {displayTitle}
                      </>
                    ) : (
                      displayTitle
                    )}
                  </li>
                </ol>
              </nav>

              {/* Back Button */}
              <div className="mb-6 sm:">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="hover:bg-background transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {language === 'fr' ? 'Retour' : 'Go Back'}
                </Button>
              </div>

              {/* Achievement Header */}
              <Card className="mb-8 shadow-lg dark:shadow-gray-900/20 border-0 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 rounded-xl shadow-sm">
                      <IconComponent className="h-10 w-10 text-yellow-700 dark:text-yellow-300" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl sm:text-3xl  font-bold text-foreground mb-2">
                        {displayTitle}
                      </CardTitle>
                      <div className="flex items-center space-x-3">
                        {achievement.category && (
                          <Badge
                            className={`${getCategoryColor(achievement.category)} border`}
                          >
                            {achievement.category}
                          </Badge>
                        )}
                        {achievement.date && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(achievement.date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Achievement Image */}
              {achievement.imageUrl && (
                <Card className="mb-8 shadow-lg dark:shadow-gray-900/20 border-0 overflow-hidden">
                  <div className="relative h-80 w-full">
                    <Image
                      src={achievement.imageUrl}
                      alt={displayTitle}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                </Card>
              )}

              {/* Achievement Description */}
              <Card className="mb-8 shadow-lg dark:shadow-gray-900/20 border-0 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-500" />
                    {language === 'fr' ? 'Description' : 'Description'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {displayDescription ||
                      (language === 'fr'
                        ? 'Aucune description disponible pour cette réalisation.'
                        : 'No description available for this achievement.')}
                  </p>
                </CardContent>
              </Card>

              {/* Achievement Details */}
              <Card className="mb-8 shadow-lg dark:shadow-gray-900/20 border-0 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                    {language === 'fr'
                      ? 'Détails de la Réalisation'
                      : 'Achievement Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {language === 'fr' ? 'Type' : 'Type'}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {achievement.category ||
                              (language === 'fr'
                                ? 'Non spécifié'
                                : 'Not specified')}
                          </p>
                        </div>
                      </div>

                      {achievement.date && (
                        <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {language === 'fr' ? 'Date' : 'Date'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(achievement.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {language === 'fr' ? 'Statut' : 'Status'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {achievement.isPublished
                              ? language === 'fr'
                                ? 'Publié'
                                : 'Published'
                              : language === 'fr'
                                ? 'Brouillon'
                                : 'Draft'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {language === 'fr' ? 'Créé le' : 'Created'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(
                              achievement.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 sm:mt-14">
              <div className="sticky top-20 sm:mt-10 space-y-6">
                {/* Other Achievements - Moved to same level as title */}
                <Card className="shadow-xl dark:shadow-gray-700 border-0 bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                      {language === 'fr'
                        ? 'Autres Réalisations'
                        : 'Other Achievements'}
                    </CardTitle>
                    <CardDescription>
                      {language === 'fr'
                        ? 'Découvrez nos autres réalisations'
                        : 'Discover our other achievements'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAchievements ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="animate-pulse">
                            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : otherAchievements.length > 0 ? (
                      <div className="space-y-3">
                        {otherAchievements.slice(0, 6).map(otherAchievement => {
                          const OtherIconComponent = getIconComponent(
                            otherAchievement.category || 'other'
                          );
                          const otherDisplayTitle =
                            language === 'fr' && otherAchievement.titleFr
                              ? otherAchievement.titleFr
                              : otherAchievement.title;

                          return (
                            <Link
                              key={otherAchievement.id}
                              href={`/about/achievement/${otherAchievement.id}`}
                              className="block group"
                            >
                              <div className="p-3 rounded-lg border border-border hover:border-yellow-300 dark:hover:border-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-200 group-hover:shadow-md">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg group-hover:bg-yellow-100 dark:group-hover:bg-yellow-800 transition-colors">
                                    <OtherIconComponent className="h-4 w-4 text-muted-foreground group-hover:text-yellow-600 dark:group-hover:text-yellow-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-foreground group-hover:text-yellow-900 dark:group-hover:text-yellow-100 truncate">
                                      {otherDisplayTitle}
                                    </h4>
                                    {otherAchievement.category && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs mt-1"
                                      >
                                        {otherAchievement.category}
                                      </Badge>
                                    )}
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors" />
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm text-center py-4">
                        {language === 'fr'
                          ? 'Aucune autre réalisation disponible'
                          : 'No other achievements available'}
                      </p>
                    )}

                    {otherAchievements.length > 6 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <Link
                          href="/about"
                          className="w-full flex items-center justify-center space-x-2 text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors"
                        >
                          <span>
                            {language === 'fr'
                              ? 'Voir toutes les réalisations'
                              : 'View all achievements'}
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
                        <Trophy className="h-4 w-4 mr-2" />
                        {language === 'fr'
                          ? 'Toutes les Réalisations'
                          : 'All Achievements'}
                      </Button>
                    </Link>
                    <Link href="/about">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Award className="h-4 w-4 mr-2" />
                        {language === 'fr'
                          ? 'Nos Installations'
                          : 'Our Facilities'}
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
