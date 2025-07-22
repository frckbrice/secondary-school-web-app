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
import { useSettings } from '../../providers/settings-provider';
import {
  MapPin,
  Phone,
  Mail,
  Users,
  BookOpen,
  Award,
  Building,
  ArrowLeft,
  Quote,
  Clock,
  ExternalLink,
  Microscope,
  Monitor,
  Library,
  Trophy,
  Music,
  Palette,
  Utensils,
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '../../globals/layout/header';
import { Footer } from '../../globals/layout/footer';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { News, Facility, Achievement } from '../../../schema';
import { getApiUrl } from '../../../lib/utils';

interface NewsResponse {
  success: boolean;
  news: News[];
}

interface FacilitiesResponse {
  success: boolean;
  data: Facility[];
  pagination: any;
}

interface AchievementsResponse {
  success: boolean;
  data: Achievement[];
  pagination: any;
}

export default function AboutPage() {
  const { settings } = useSettings();
  const { language } = useLanguage();

  // Query for news items related to achievements
  const { data: newsResponse } = useQuery<NewsResponse>({
    queryKey: ['/api/news?published=true'],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/api/news?published=true'));
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      return response.json();
    },
  });

  // Query for facilities
  const { data: facilitiesResponse } = useQuery<FacilitiesResponse>({
    queryKey: ['/api/facilities?isPublished=true'],
    queryFn: async () => {
      const response = await fetch(
        getApiUrl('/api/facilities?isPublished=true')
      );
      if (!response.ok) {
        throw new Error('Failed to fetch facilities');
      }
      return response.json();
    },
  });

  // Query for achievements
  const { data: achievementsResponse } = useQuery<AchievementsResponse>({
    queryKey: ['/api/achievements?isPublished=true'],
    queryFn: async () => {
      const response = await fetch(
        getApiUrl('/api/achievements?isPublished=true')
      );
      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }
      return response.json();
    },
  });

  const newsItems = newsResponse?.news || [];
  const facilities = facilitiesResponse?.data || [];
  const achievements = achievementsResponse?.data || [];

  const stats = [
    {
      icon: Users,
      label: language === 'fr' ? 'Élèves' : 'Students',
      value: '1,500+',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    },
    {
      icon: BookOpen,
      label: language === 'fr' ? 'Programmes' : 'Programs',
      value: '15+',
      color:
        'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    },
    {
      icon: Award,
      label: language === 'fr' ? "Années d'Excellence" : 'Years of Excellence',
      value: '45+',
      color:
        'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
    },
    {
      icon: Building,
      label: language === 'fr' ? 'Installations' : 'Facilities',
      value: '20+',
      color:
        'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
    },
  ];

  const principalMessage = {
    en: {
      name: 'Dr. Marie-Claire Ngounou',
      title: 'Principal',
      message:
        'Welcome to ' +
        (settings?.siteName || 'Government Bilingual High School X') +
        ', where excellence in education meets cultural diversity. For over four decades, our institution has been committed to nurturing young minds and preparing them for the challenges of tomorrow. We believe in holistic education that combines academic rigor with character development, ensuring our students become responsible global citizens. Our bilingual approach not only preserves our rich Cameroonian heritage but also prepares our students to thrive in an interconnected world.',
    },
    fr: {
      name: 'Dr. Marie-Claire Ngounou',
      title: 'Proviseure',
      message:
        'Bienvenue au ' +
        (settings?.siteNameFr || 'Lycée Bilingue de X') +
        ", où l'excellence éducative rencontre la diversité culturelle. Depuis plus de quatre décennies, notre institution s'engage à former les jeunes esprits et à les préparer aux défis de demain. Nous croyons en une éducation holistique qui combine la rigueur académique avec le développement du caractère, assurant que nos étudiants deviennent des citoyens du monde responsables. Notre approche bilingue préserve non seulement notre riche patrimoine camerounais mais prépare aussi nos étudiants à prospérer dans un monde interconnecté.",
    },
  };

  const currentMessage =
    language === 'fr' ? principalMessage.fr : principalMessage.en;

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

  const findRelatedNews = (keywords: string[]) => {
    if (!newsItems || newsItems.length === 0) return [];

    return newsItems.filter(news => {
      const searchText = `${news.title} ${news.content}`.toLowerCase();
      return keywords.some(keyword =>
        searchText.includes(keyword.toLowerCase())
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with Principal's Message */}
      <div
        className="relative min-h-[70vh] flex-col 
        sm:flex items-center justify-center p-4"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Navigation Header + Title (mobile: stack, center) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="flex-col  items-center justify-center py-4 w-full 
            space-y-4"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center order-first md:order-none mb-2 md:mb-0">
              {language === 'fr'
                ? 'À Propos de ' + (settings?.siteNameFr || 'Site Name')
                : 'About ' + (settings?.siteName || 'Site Name')}
            </h1>
            <div className="w-32 h-0 md:h-auto" />
          </div>
        </div>

        {/* Principal's Message (mobile: single column, center) */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-white ">
          <div className="bg-black/40 backdrop-blur-md rounded-3xl p-4 sm:p-8 md:p-12 border border-white/20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center text-center lg:text-left">
              {/* Principal's Photo */}
              <div className="flex justify-center mb-6 lg:mb-0">
                <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-blue-300/50 shadow-2xl mx-auto">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
                    alt={currentMessage.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Message Content */}
              <div className="lg:col-span-2 flex flex-col items-center lg:items-start">
                <Quote className="w-10 h-10 sm:w-10 sm:h-10 mx-auto lg:mx-0 mb-4 sm:mb-6 text-blue-300" />
                <blockquote className="text-base text-justify sm:text-lg md:text-xl leading-relaxed mb-4 sm:mb-6 italic font-light">
                  &ldquo;{currentMessage.message}&rdquo;
                </blockquote>
                <div className="border-t border-white/20 pt-4 sm:pt-6 w-full max-w-xs mx-auto lg:mx-0">
                  <p className="font-semibold text-lg sm:text-xl text-blue-300">
                    {currentMessage.name}
                  </p>
                  <p className="text-blue-200">{currentMessage.title}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card
                  key={index}
                  className="text-center border-0 shadow-lg bg-card hover:shadow-xl transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.color} mb-4`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-2">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Our Story Section */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                {language === 'fr' ? 'Notre Histoire' : 'Our Story'}
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-justify">
                  {language === 'fr'
                    ? 'Établi en XXXX, le ' +
                      settings?.siteNameFr +
                      " a été un phare d'excellence éducative dans la Région du Centre du Cameroun. Notre école a été fondée avec la vision de fournir une éducation bilingue de qualité qui prépare les étudiants aux opportunités nationales et internationales."
                    : 'Established in XXXX, ' +
                      settings?.siteName +
                      ' has been a beacon of educational excellence in the Centre Region of Cameroon. Our school was founded with the vision of providing quality bilingual education that prepares students for both national and international opportunities.'}
                </p>
                <p className="text-justify">
                  {language === 'fr'
                    ? "Au fil des décennies, nous avons évolué d'une modeste institution secondaire vers l'un des lycées bilingues les plus respectés du Cameroun. Notre engagement envers l'excellence académique, le développement du caractère et la préservation culturelle a fait de nous un choix privilégié pour les familles recherchant une éducation complète."
                    : 'Over the decades, we have evolved from a modest secondary institution to one of the most respected bilingual high schools in Cameroon. Our commitment to academic excellence, character development, and cultural preservation has made us a preferred choice for families seeking comprehensive education.'}
                </p>
                <p className="text-justify">
                  {language === 'fr'
                    ? "Aujourd'hui, " +
                      settings?.siteNameFr +
                      " continue d'innover dans l'éducation tout en maintenant nos valeurs fondamentales d'intégrité, d'excellence et de respect de la diversité. Nous sommes fiers de nos diplômés qui ont apporté des contributions significatives dans divers domaines à travers le Cameroun et au-delà."
                    : 'Today, ' +
                      settings?.siteName +
                      ' continues to innovate in education while maintaining our core values of integrity, excellence, and respect for diversity. We are proud of our graduates who have gone on to make significant contributions in various fields across Cameroon and beyond.'}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                {language === 'fr'
                  ? 'Notre Mission & Vision'
                  : 'Our Mission & Vision'}
              </h2>
              <div className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                      <Award className="w-5 h-5" />
                      <span>{language === 'fr' ? 'Mission' : 'Mission'}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-justify">
                      {language === 'fr'
                        ? 'Fournir une éducation bilingue de qualité qui développe des citoyens intellectuellement compétents, moralement intègres et socialement responsables qui peuvent contribuer de manière significative au développement national et au progrès mondial.'
                        : 'To provide quality bilingual education that develops intellectually competent, morally upright, and socially responsible citizens who can contribute meaningfully to national development and global progress.'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                      <BookOpen className="w-5 h-5" />
                      <span>{language === 'fr' ? 'Vision' : 'Vision'}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-justify">
                      {language === 'fr'
                        ? "Être le lycée bilingue de premier plan au Cameroun, reconnu pour l'excellence académique, la formation du caractère et la préparation des étudiants au succès dans un monde globalisé."
                        : 'To be the leading bilingual high school in Cameroon, recognized for academic excellence, character formation, and preparing students for success in a globalized world.'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Enhanced Facilities Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              {language === 'fr' ? 'Nos Installations' : 'Our Facilities'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {facilities.map((facility, index) => {
                const IconComponent = getIconComponent(
                  facility.category || 'other'
                );
                return (
                  <Link
                    key={facility.id}
                    href={`/about/facility/${facility.id}`}
                    className="block"
                  >
                    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                      <div className="relative h-48">
                        <Image
                          src={
                            facility.imageUrl ||
                            'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop'
                          }
                          alt={
                            language === 'fr' && facility.nameFr
                              ? facility.nameFr
                              : facility.name
                          }
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-white/20 backdrop-blur-sm text-white border-white/30"
                            >
                              {facility.category || 'other'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {language === 'fr' && facility.nameFr
                            ? facility.nameFr
                            : facility.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm">
                          {language === 'fr' && facility.descriptionFr
                            ? facility.descriptionFr
                            : facility.description ||
                              (language === 'fr'
                                ? 'Aucune description disponible.'
                                : 'No description available.')}
                        </p>
                        <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                          {language === 'fr'
                            ? 'Voir les détails'
                            : 'View Details'}
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Enhanced Achievements Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              {language === 'fr' ? 'Nos Réalisations' : 'Our Achievements'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {achievements.map((achievement, index) => {
                return (
                  <Link
                    key={achievement.id}
                    href={`/about/achievement/${achievement.id}`}
                    className="block"
                  >
                    <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer group p-4 md:p-6">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 group-hover:text-blue-600 transition-colors">
                          <Award className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                          <span className="text-wrap text-[1.3rem] sm:text-lg">
                            {language === 'fr' && achievement.titleFr
                              ? achievement.titleFr
                              : achievement.title}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4 text-justify">
                          {language === 'fr' && achievement.descriptionFr
                            ? achievement.descriptionFr
                            : achievement.description ||
                              (language === 'fr'
                                ? 'Aucune description disponible.'
                                : 'No description available.')}
                        </p>

                        {achievement.date && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(achievement.date).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 items-center">
                          <div className="col-span-1 flex items-center ">
                            {achievement.category && (
                              <Badge
                                variant="outline"
                                className="bg-gradient-to-t from-blue-500 to-blue-600 text-white"
                              >
                                {achievement.category.charAt(0).toUpperCase() +
                                  achievement.category.slice(1)}
                              </Badge>
                            )}
                          </div>

                          <div className="col-span-1 flex items-center justify-start text-blue-600 text-sm font-medium ">
                            {language === 'fr'
                              ? 'Voir les détails'
                              : 'View Details'}
                            <ExternalLink className="w-4 h-4 ml-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Enhanced Contact Information */}
          <Card className="shadow-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span>{language === 'fr' ? 'Nous Visiter' : 'Visit Us'}</span>
              </CardTitle>
              <CardDescription className="text-lg">
                {language === 'fr'
                  ? 'Nous accueillons les visiteurs et les futurs étudiants'
                  : 'We welcome visitors and prospective students'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                <div className="flex items-start space-x-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      {language === 'fr' ? 'Adresse' : 'Address'}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Government Bilingual High School
                      <br />
                      Bafia, Centre Region
                      <br />
                      Cameroon
                      <br />
                      <span className="font-medium">P.O. Box 327</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      {language === 'fr' ? 'Téléphone' : 'Phone'}
                    </h4>
                    <p className="text-muted-foreground">
                      <span className="font-medium">+237 222 175 175</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      {language === 'fr' ? 'Email' : 'Email'}
                    </h4>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-wrap text-center">
                        {settings?.contactEmail || 'example@gmail.com'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      {language === 'fr'
                        ? "Heures d'Ouverture"
                        : 'Office Hours'}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      <span className="font-medium">
                        {language === 'fr'
                          ? 'Lundi - Vendredi:'
                          : 'Monday - Friday:'}
                      </span>
                      {language === 'fr'
                        ? '7:00 H - 15:30 H'
                        : '7:00 AM - 15:30 PM'}
                      <br />
                      <span className="font-medium">
                        {language === 'fr' ? 'Samedi:' : 'Saturday:'}
                      </span>{' '}
                      {language === 'fr'
                        ? 'Réserver un rendez-vous'
                        : 'Book an appointment'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
