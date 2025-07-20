'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { useLanguage } from '../../../hooks/use-language';
import {
  MapPin,
  Calendar,
  Users,
  BookOpen,
  Award,
  Building,
  ArrowLeft,
  Trophy,
  Quote,
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '../../globals/layout/header';
import { Footer } from '../../globals/layout/footer';

export default function GBHSHistory() {
  const { language } = useLanguage();

  const timeline = [
    {
      year: '1979',
      title:
        language === 'fr'
          ? 'Fondation de GBHS Bafia'
          : 'Foundation of GBHS Bafia',
      description:
        language === 'fr'
          ? "Établissement du Lycée Bilingue de Bafia par le gouvernement camerounais dans le cadre du développement de l'éducation bilingue au Cameroun. L'école a été créée pour répondre aux besoins éducatifs de la région du Centre."
          : 'Establishment of Government Bilingual High School Bafia by the Cameroonian government as part of bilingual education development in Cameroon. The school was created to address the educational needs of the Centre region.',
      icon: Building,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      year: '1980',
      title: language === 'fr' ? 'Premiers étudiants' : 'First Students',
      description:
        language === 'fr'
          ? "Accueil des 150 premiers élèves avec un corps enseignant de 12 professeurs dévoués, marquant le début d'une tradition d'excellence académique."
          : 'Welcomed the first 150 students with a faculty of 12 dedicated teachers, marking the beginning of a tradition of academic excellence.',
      icon: Users,
      color: 'bg-green-100 text-green-600',
    },
    {
      year: '1985',
      title:
        language === 'fr'
          ? 'Expansion des infrastructures'
          : 'Infrastructure Expansion',
      description:
        language === 'fr'
          ? 'Construction de nouveaux bâtiments incluant des laboratoires scientifiques modernes, une bibliothèque et des salles de classe supplémentaires.'
          : 'Construction of new buildings including modern science laboratories, library, and additional classrooms to accommodate growing enrollment.',
      icon: Building,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      year: '1992',
      title:
        language === 'fr'
          ? 'Premier succès au baccalauréat'
          : 'First Baccalaureate Success',
      description:
        language === 'fr'
          ? "Taux de réussite remarquable de 89% au baccalauréat, établissant GBHS Bafia comme une institution d'excellence dans la région du Centre."
          : 'Achieved remarkable 89% pass rate in baccalaureate examinations, establishing GBHS Bafia as a center of excellence in the Centre region.',
      icon: Trophy,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      year: '2000',
      title: language === 'fr' ? 'Ère numérique' : 'Digital Era',
      description:
        language === 'fr'
          ? "Introduction des premiers ordinateurs et technologies numériques dans l'enseignement, préparant les étudiants aux défis du 21e siècle."
          : 'Introduction of first computers and digital technologies in education, preparing students for 21st century challenges.',
      icon: BookOpen,
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      year: '2010',
      title:
        language === 'fr' ? 'Reconnaissance nationale' : 'National Recognition',
      description:
        language === 'fr'
          ? "Réception du prix d'excellence du Ministère de l'Éducation pour les performances académiques exceptionnelles et l'innovation pédagogique."
          : 'Received Ministry of Education Excellence Award for outstanding academic performance and innovative teaching methods.',
      icon: Award,
      color: 'bg-red-100 text-red-600',
    },
    {
      year: '2020',
      title: language === 'fr' ? 'Adaptation COVID-19' : 'COVID-19 Adaptation',
      description:
        language === 'fr'
          ? "Transition rapide vers l'apprentissage hybride, démontrant la résilience et l'adaptabilité de l'institution face aux défis mondiaux."
          : 'Swift transition to hybrid learning, demonstrating institutional resilience and adaptability in face of global challenges.',
      icon: BookOpen,
      color: 'bg-teal-100 text-teal-600',
    },
    {
      year: '2025',
      title: language === 'fr' ? 'Vision future' : 'Future Vision',
      description:
        language === 'fr'
          ? 'Lancement de la plateforme numérique moderne et expansion continue pour servir plus de 1200 étudiants avec excellence.'
          : 'Launch of modern digital platform and continued expansion to serve over 1,200 students with excellence.',
      icon: Building,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  const achievements = [
    {
      title:
        language === 'fr' ? 'Plus de 18,500 diplômés' : 'Over 18,500 Graduates',
      description:
        language === 'fr'
          ? "Anciens élèves occupant des postes de direction dans l'administration publique, le secteur privé, et les organisations internationales"
          : 'Alumni holding leadership positions in public administration, private sector, and international organizations',
      icon: Users,
    },
    {
      title: language === 'fr' ? 'Taux de réussite de 93%' : '93% Success Rate',
      description:
        language === 'fr'
          ? 'Classée parmi les 5 meilleures écoles bilingues du Cameroun depuis 15 ans consécutifs'
          : 'Ranked among top 5 bilingual schools in Cameroon for 15 consecutive years',
      icon: Trophy,
    },
    {
      title:
        language === 'fr'
          ? '65 enseignants certifiés'
          : '65 Certified Teachers',
      description:
        language === 'fr'
          ? "Corps enseignant hautement qualifié avec 85% détenant des diplômes d'études supérieures"
          : 'Highly qualified faculty with 85% holding advanced degrees',
      icon: BookOpen,
    },
    {
      title: language === 'fr' ? 'Campus de 12 hectares' : '12-Hectare Campus',
      description:
        language === 'fr'
          ? '3 laboratoires scientifiques, bibliothèque de 15,000 ouvrages, centre informatique avec 80 postes'
          : '3 science laboratories, 15,000-book library, computer center with 80 workstations',
      icon: Building,
    },
    {
      title:
        language === 'fr'
          ? 'Programme bilingue certifié'
          : 'Certified Bilingual Program',
      description:
        language === 'fr'
          ? "Accrédité par le Ministère de l'Éducation avec certification internationale DELF/DALF"
          : 'Accredited by Ministry of Education with international DELF/DALF certification',
      icon: Award,
    },
    {
      title: language === 'fr' ? 'Excellence sportive' : 'Sports Excellence',
      description:
        language === 'fr'
          ? "12 championnats régionaux remportés, terrain de football FIFA standard, piste d'athlétisme"
          : '12 regional championships won, FIFA-standard football field, athletics track',
      icon: Trophy,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Header />

      {/* Hero Section */}
      <div
        className="relative min-h-[70vh] flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.8), rgba(249, 115, 22, 0.8)), url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute top-20 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20 flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>
                    {language === 'fr' ? "Retour à l'accueil" : 'Back to Home'}
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            {language === 'fr'
              ? 'Histoire de GBHS Bafia'
              : 'History of GBHS Bafia'}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            {language === 'fr'
              ? "Plus de 45 ans d'excellence en éducation bilingue, façonnant l'avenir du Cameroun"
              : "Over 45 years of bilingual education excellence, shaping Cameroon's future"}
          </p>
          <div className="flex items-center justify-center space-x-4 text-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>1979 - 2025</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Bafia, Cameroun</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {language === 'fr' ? 'Notre Parcours' : 'Our Journey'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'fr'
                ? "Découvrez les moments clés qui ont façonné GBHS Bafia en l'institution d'excellence qu'elle est aujourd'hui"
                : 'Discover the key moments that shaped GBHS Bafia into the institution of excellence it is today'}
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-400 to-orange-400"></div>

            {timeline.map((event, index) => {
              const IconComponent = event.icon;
              return (
                <div
                  key={event.year}
                  className={`relative flex items-center mb-16 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <Card
                    className={`w-full md:w-96 ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'} shadow-lg hover:shadow-xl transition-shadow`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className="text-lg px-3 py-1 font-bold"
                        >
                          {event.year}
                        </Badge>
                        <div
                          className={`w-12 h-12 rounded-full ${event.color} flex items-center justify-center`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                      </div>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">
                        {event.description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-4 border-blue-400 rounded-full"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="py-16 bg-gradient-to-br from-orange-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {language === 'fr' ? 'Nos Réalisations' : 'Our Achievements'}
            </h2>
            <p className="text-xl text-gray-600">
              {language === 'fr'
                ? 'Les accomplissements qui nous rendent fiers'
                : 'The accomplishments that make us proud'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <Card
                  key={index}
                  className="text-center p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {achievement.title}
                    </h3>
                    <p className="text-gray-600">{achievement.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quote Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Quote className="w-16 h-16 mx-auto mb-8 opacity-50" />
          <blockquote className="text-2xl md:text-3xl font-light leading-relaxed mb-8">
            {language === 'fr'
              ? "« GBHS Bafia ne forme pas seulement des étudiants, nous façonnons les leaders de demain. Notre engagement envers l'excellence bilingue prépare nos diplômés à exceller dans un monde globalisé. »"
              : "« GBHS Bafia doesn't just educate students, we shape tomorrow's leaders. Our commitment to bilingual excellence prepares our graduates to excel in a globalized world. »"}
          </blockquote>
          <p className="text-lg opacity-90">
            {language === 'fr'
              ? 'Direction de GBHS Bafia'
              : 'GBHS Bafia Administration'}
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-gradient-to-br from-white to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {language === 'fr' ? 'Rejoignez Notre Histoire' : 'Join Our Story'}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {language === 'fr'
              ? "Devenez partie intégrante de cette tradition d'excellence académique et contribuez à écrire le prochain chapitre de GBHS Bafia."
              : "Become part of this tradition of academic excellence and help write the next chapter of GBHS Bafia's story."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="bg-blue-600 text-white px-8 py-3 text-lg hover:bg-blue-700">
                {language === 'fr' ? "Découvrir l'école" : 'Explore the School'}
              </Button>
            </Link>
            <Link href="/student-portal">
              <Button
                variant="outline"
                className="border-2 border-orange-500 text-orange-500 px-8 py-3 text-lg hover:bg-orange-500 hover:text-white"
              >
                {language === 'fr' ? 'Portail étudiant' : 'Student Portal'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
