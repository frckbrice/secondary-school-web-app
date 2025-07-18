'use client';

import { Card, CardContent } from '../ui/card';
import {
  CheckCircle,
  Lightbulb,
  Globe,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '../../hooks/use-language';
import React from 'react';

export default function AcademicPrograms() {
  const { t } = useLanguage();

  return (
    <section
      id="academics"
      className="py-16 bg-gradient-to-br from-background via-blue-50 to-green-50 dark:from-background dark:via-blue-950 dark:to-green-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-bold text-3xl sm:text-4xl text-foreground mb-4">
            {t('academics.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('academics.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* First Cycle */}
          <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-xl">1-5</span>
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-foreground">
                    {t('academics.firstCycle')}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400">
                    Forms 1 - 5
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Foundation in core subjects: Mathematics, English, French,
                    Sciences
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Bilingual instruction in English and French
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Preparation for GCE Ordinary Level and BEPC examinations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Second Cycle */}
          <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-xl">6-7</span>
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-foreground">
                    {t('academics.secondCycle')}
                  </h3>
                  <p className="text-green-600 dark:text-green-400">
                    Lower & Upper Sixth
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Specialized tracks: Arts, Sciences, Commercial subjects
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    University preparation and career guidance
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Preparation for GCE Advanced Level and Baccalauréat
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Departments */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center border-2 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">
                {t('academics.sciences')}
              </h3>
              <p className="text-muted-foreground">
                Physics, Chemistry, Biology, Mathematics
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-green-300 dark:hover:border-green-600 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">
                {t('academics.languages')}
              </h3>
              <p className="text-muted-foreground">
                English, French, Literature, Communication
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">
                {t('academics.commercial')}
              </h3>
              <p className="text-muted-foreground">
                Accounting, Economics, Business Studies
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-red-300 dark:hover:border-red-600 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">
                {t('academics.arts')}
              </h3>
              <p className="text-muted-foreground">
                History, Geography, Philosophy, Arts
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
