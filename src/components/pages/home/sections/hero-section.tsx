'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../../ui/button';
import { useLanguage } from '../../../../hooks/use-language';
import { useTheme } from 'next-themes';

export default function HeroSection() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white"
    >
      {/* Background overlay - only in light mode, but only after mounting */}
      {mounted && theme !== 'dark' && (
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      )}

      {/* Background image (modern school building) */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
              {language === 'fr'
                ? 'Lycée Bilingue de Bafia'
                : 'Government Bilingual High School Bafia'}
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-blue-100 leading-relaxed">
              {language === 'fr'
                ? 'Lycée Bilingue de Bafia'
                : 'Government Bilingual High School Bafia'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                onClick={() => scrollToSection('admissions')}
                className="bg-orange-500 text-white px-8 py-4 text-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg"
              >
                {language === 'fr' ? 'Candidature' : 'Apply'}
              </Button>
              <Button
                onClick={() => (window.location.href = '/gbhs-history')}
                variant="outline"
                className="border-2 border-orange-400 text-orange-400 bg-white bg-opacity-10 backdrop-blur-sm px-8 py-4 text-lg font-semibold hover:bg-orange-400 hover:text-white transition-colors"
              >
                {language === 'fr' ? 'En savoir plus' : 'Learn More'}
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-lg text-center border border-white border-opacity-20">
              <div className="text-3xl font-bold text-orange-400 mb-2">
                1,500+
              </div>
              <div className="text-blue-100">
                {language === 'fr' ? 'Élèves inscrits' : 'Students Enrolled'}
              </div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-lg text-center border border-white border-opacity-20">
              <div className="text-3xl font-bold text-orange-400 mb-2">95%</div>
              <div className="text-blue-100">
                {language === 'fr' ? 'Taux de réussite' : 'Pass Rate'}
              </div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-lg text-center border border-white border-opacity-20">
              <div className="text-3xl font-bold text-orange-400 mb-2">
                100+
              </div>
              <div className="text-blue-100">
                {language === 'fr'
                  ? 'Enseignants qualifiés'
                  : 'Qualified Teachers'}
              </div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-lg text-center border border-white border-opacity-20">
              <div className="text-3xl font-bold text-orange-400 mb-2">45+</div>
              <div className="text-blue-100">{t('hero.yearsExcellence')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
