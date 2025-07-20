'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../hooks/use-language';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  School,
  Users,
  Award,
  BookOpen,
} from 'lucide-react';

interface FooterProps {
  showStats?: boolean;
}

export function Footer({ showStats = false }: FooterProps) {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* School Info */}
          <div className="lg:col-span-2 w-full md:w-2/3">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <School className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">GBHS Bafia</h3>
            </div>
            <p className="text-gray-300 w-full  mb-6 leading-relaxed">
              {language === 'fr'
                ? "Le Lycée Bilingue de Bafia est une institution d'excellence académique fondée en 1979. Nous nous engageons à fournir une éducation de qualité dans un environnement bilingue, préparant nos étudiants à devenir des citoyens du monde responsables et compétitifs."
                : 'Government Bilingual High School Bafia is an academic excellence institution founded in 1979. We are committed to providing quality education in a bilingual environment, preparing our students to become responsible and competitive global citizens.'}
            </p>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-semibold">Address</p>
                  <p className="text-gray-300 text-sm">
                    Bafia, Centre Region, Cameroon
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-gray-300 text-sm">+237 222 175 175 </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-gray-300 text-sm">
                    lyceebilinguebafia@yahoo.fr
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-semibold">Office Hours</p>
                  <p className="text-gray-300 text-sm">
                    Mon - Fri: 7:00 AM - 15:30 PM, <br /> Sat: Book an
                    appointment.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              {language === 'fr' ? 'Liens Rapides' : 'Quick Links'}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  {language === 'fr' ? 'Accueil' : 'Home'}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  {language === 'fr' ? 'À Propos' : 'About Us'}
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  {language === 'fr' ? 'Actualités' : 'News & Events'}
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  {language === 'fr' ? 'Galerie' : 'Gallery'}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  {language === 'fr' ? 'Contact' : 'Contact'}
                </Link>
              </li>
              <li>
                <Link
                  href="/gbhs-history"
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  {language === 'fr' ? 'Histoire' : 'History'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Programs */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              {language === 'fr'
                ? 'Programmes Académiques'
                : 'Academic Programs'}
            </h4>
            <ul className="space-y-3">
              <li className="text-gray-300 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                Form 1 - Upper Sixth.
              </li>
              <li className="text-gray-300 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                6eme - Tles A4, C, D.
              </li>
              <li className="text-gray-300 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                {language === 'fr'
                  ? 'Éducation Bilingue'
                  : 'Bilingual Education'}
              </li>
              <li className="text-gray-300 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                {language === 'fr' ? 'Sciences & Arts' : 'Science & Arts'}
              </li>
              <li className="text-gray-300 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                {language === 'fr'
                  ? 'Sports & Activités'
                  : 'Sports & Activities'}
              </li>
              <li className="text-gray-300 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                {language === 'fr'
                  ? 'Programmes Culturels'
                  : 'Cultural Programs'}
              </li>
              <li className="text-gray-300 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                {language === 'fr'
                  ? 'Clubs & Associations'
                  : 'Clubs & Associations'}
              </li>
            </ul>
          </div>
        </div>

        {/* Statistics Section - Only show on home page */}
        {showStats && (
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col items-center">
                <Users className="w-8 h-8 text-blue-400 mb-2" />
                <div className="text-2xl font-bold text-white">1,200+</div>
                <div className="text-gray-400 text-sm">
                  {language === 'fr' ? 'Étudiants' : 'Students'}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <School className="w-8 h-8 text-green-400 mb-2" />
                <div className="text-2xl font-bold text-white">65</div>
                <div className="text-gray-400 text-sm">
                  {language === 'fr' ? 'Enseignants' : 'Teachers'}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Award className="w-8 h-8 text-purple-400 mb-2" />
                <div className="text-2xl font-bold text-white">45+</div>
                <div className="text-gray-400 text-sm">
                  {language === 'fr' ? 'Années' : 'Years'}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <BookOpen className="w-8 h-8 text-orange-400 mb-2" />
                <div className="text-2xl font-bold text-white">93%</div>
                <div className="text-gray-400 text-sm">
                  {language === 'fr' ? 'Taux de Réussite' : 'Success Rate'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div
          className={`border-t border-gray-800 ${showStats ? 'mt-8' : 'mt-12'} pt-8 text-center`}
        >
          <p className="text-gray-400">
            © {new Date().getFullYear()}{' '}
            {language === 'fr'
              ? 'Lycée Bilingue de Bafia'
              : 'Government Bilingual High School Bafia'}
            .{' '}
            {language === 'fr' ? 'Tous droits réservés' : 'All rights reserved'}
            .
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {language === 'fr' ? 'Fondé en 1979' : 'Founded in 1979'} |{' '}
            {language === 'fr'
              ? 'Excellence Académique'
              : 'Academic Excellence'}
          </p>
        </div>
      </div>
    </footer>
  );
}
