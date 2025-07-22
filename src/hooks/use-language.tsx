'use client';
import React, { createContext, ReactNode, useContext, useState } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    'header.phone': '+237 222 17 51 75',
    'header.email': 'lyceebilingueXYZ@yahoo.fr',
    'header.studentPortal': 'Student Portal',
    'header.schoolName': ' ""',
    'header.schoolFullName': 'Government Bilingual High School',
    'header.home': 'Home',
    'header.about': 'About',
    'header.academics': 'Academics',
    'header.admissions': 'Admissions',
    'header.studentLife': 'Student Life',
    'header.news': 'News',
    'header.contact': 'Contact',
    'header.applyNow': 'Apply Now',

    // Hero Section
    'hero.title': 'Excellence in Bilingual Education',
    'hero.subtitle':
      'Empowering students in Centre Region, Cameroon with quality secondary education in English and French',
    'hero.applyButton': 'Apply for Admission',
    'hero.learnMore': 'Learn More',
    'hero.studentsEnrolled': 'Students Enrolled',
    'hero.passRate': 'Pass Rate',
    'hero.qualifiedTeachers': 'Qualified Teachers',
    'hero.yearsExcellence': 'Years of Excellence',

    // News Section
    'news.title': 'Latest News & Announcements',
    'news.subtitle': 'Stay updated with the latest happenings at  ""',
    'news.readMore': 'Read More',
    'news.viewAll': 'View All News',

    // Quick Links
    'quickLinks.title': 'Quick Access',
    'quickLinks.subtitle': 'Everything you need at your fingertips',
    'quickLinks.admissions': 'Admissions',
    'quickLinks.admissionsDesc':
      'Apply for admission, requirements, and fee structure',
    'quickLinks.calendar': 'Academic Calendar',
    'quickLinks.calendarDesc': 'Term dates, examinations, and holidays',
    'quickLinks.portal': 'Student Portal',
    'quickLinks.portalDesc': 'Grades, attendance, and assignments',
    'quickLinks.teacher': 'Teacher Portal',
    'quickLinks.teacherDesc': 'Grade reports and class management',
    'quickLinks.contact': 'Contact Us',
    'quickLinks.contactDesc': 'Get in touch with administration',

    // Academic Programs
    'academics.title': 'Academic Programs',
    'academics.subtitle':
      'Comprehensive bilingual education from Form 1 to Upper Sixth',
    'academics.firstCycle': 'First Cycle',
    'academics.secondCycle': 'Second Cycle',
    'academics.sciences': 'Sciences',
    'academics.languages': 'Languages',
    'academics.commercial': 'Commercial',
    'academics.arts': 'Arts & Humanities',

    // Gallery
    'gallery.title': 'School Life Gallery',
    'gallery.subtitle': 'Capturing moments of excellence and joy',
    'gallery.viewFull': 'View Full Gallery',

    // Admissions
    'admissions.title': 'Admissions',
    'admissions.subtitle':
      'Join the  "" family and excel in your academic journey',
    'admissions.requirements': 'Admission Requirements',
    'admissions.onlineApp': 'Online Application',
    'admissions.firstName': 'First Name',
    'admissions.lastName': 'Last Name',
    'admissions.email': 'Email Address',
    'admissions.phone': 'Phone Number',
    'admissions.form': 'Applying for Form',
    'admissions.documents': 'Upload Documents',
    'admissions.submit': 'Submit Application',

    // Contact
    'contact.title': 'Get in Touch',
    'contact.subtitle': "We're here to help with any questions or concerns",
    'contact.info': 'Contact Information',
    'contact.address': 'Address',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.hours': 'Office Hours',
    'contact.sendMessage': 'Send us a Message',
    'contact.fullName': 'Full Name',
    'contact.inquiryType': 'Inquiry Type',
    'contact.message': 'Message',
    'contact.send': 'Send Message',

    // Admin
    'admin.dashboard': 'Admin Dashboard',
    'admin.news': 'News Management',
    'admin.applications': 'Applications',
    'admin.bookings': 'Bookings',
    'admin.contacts': 'Contact Messages',
    'admin.logout': 'Logout',
    'admin.students': 'Students',
    'admin.teachers': 'Teachers',
    'admin.courses': 'Courses',
    'admin.avg': 'Avg. Grade',
    'admin.passRate': 'Pass Rate',
  },
  fr: {
    // Header
    'header.phone': '+237 233 XX XX XX',
    'header.email': 'lyceebilingueXYZ@yahoo.fr',
    'header.studentPortal': 'Portail Étudiant',
    'header.schoolName': ' ""',
    'header.schoolFullName': 'Lycée Bilingue Gouvernemental',
    'header.home': 'Accueil',
    'header.about': 'À Propos',
    'header.academics': 'Académique',
    'header.admissions': 'Admissions',
    'header.studentLife': 'Vie Étudiante',
    'header.news': 'Actualités',
    'header.contact': 'Contact',
    'header.applyNow': 'Postuler',

    // Hero Section
    'hero.title': 'Excellence en Éducation Bilingue',
    'hero.subtitle':
      'Autonomiser les étudiants de la région du Centre, Cameroun avec une éducation secondaire de qualité en anglais et français',
    'hero.applyButton': 'Postuler pour Admission',
    'hero.learnMore': 'En Savoir Plus',
    'hero.studentsEnrolled': 'Étudiants Inscrits',
    'hero.passRate': 'Taux de Réussite',
    'hero.qualifiedTeachers': 'Enseignants Qualifiés',
    'hero.yearsExcellence': "Années d'Excellence",

    // News Section
    'news.title': 'Dernières Nouvelles & Annonces',
    'news.subtitle': 'Restez informé des derniers événements au  ""',
    'news.readMore': 'Lire Plus',
    'news.viewAll': 'Voir Toutes les Nouvelles',

    // Quick Links
    'quickLinks.title': 'Accès Rapide',
    'quickLinks.subtitle': 'Tout ce dont vous avez besoin à portée de main',
    'quickLinks.admissions': 'Admissions',
    'quickLinks.admissionsDesc':
      'Postuler pour admission, exigences et structure des frais',
    'quickLinks.calendar': 'Calendrier Académique',
    'quickLinks.calendarDesc': 'Dates de trimestre, examens et vacances',
    'quickLinks.portal': 'Portail Étudiant',
    'quickLinks.portalDesc': 'Notes, présence et devoirs',
    'quickLinks.teacher': 'Portail Enseignant',
    'quickLinks.teacherDesc': 'Bulletins de notes et gestion de classe',
    'quickLinks.contact': 'Contactez-Nous',
    'quickLinks.contactDesc': "Entrer en contact avec l'administration",

    // Academic Programs
    'academics.title': 'Programmes Académiques',
    'academics.subtitle':
      'Éducation bilingue complète de la Classe 1 à la Terminale',
    'academics.firstCycle': 'Premier Cycle',
    'academics.secondCycle': 'Second Cycle',
    'academics.sciences': 'Sciences',
    'academics.languages': 'Langues',
    'academics.commercial': 'Commercial',
    'academics.arts': 'Arts & Humanités',

    // Gallery
    'gallery.title': 'Galerie de la Vie Scolaire',
    'gallery.subtitle': "Capturer les moments d'excellence et de joie",
    'gallery.viewFull': 'Voir la Galerie Complète',

    // Admissions
    'admissions.title': 'Admissions',
    'admissions.subtitle':
      'Rejoignez la famille  "" et excellez dans votre parcours académique',
    'admissions.requirements': "Exigences d'Admission",
    'admissions.onlineApp': 'Candidature en Ligne',
    'admissions.firstName': 'Prénom',
    'admissions.lastName': 'Nom de Famille',
    'admissions.email': 'Adresse Email',
    'admissions.phone': 'Numéro de Téléphone',
    'admissions.form': 'Postule pour la Classe',
    'admissions.documents': 'Télécharger Documents',
    'admissions.submit': 'Soumettre la Candidature',

    // Contact
    'contact.title': 'Entrer en Contact',
    'contact.subtitle':
      'Nous sommes là pour aider avec toutes questions ou préoccupations',
    'contact.info': 'Informations de Contact',
    'contact.address': 'Adresse',
    'contact.phone': 'Téléphone',
    'contact.email': 'Email',
    'contact.hours': 'Heures de Bureau',
    'contact.sendMessage': 'Envoyez-nous un Message',
    'contact.fullName': 'Nom Complet',
    'contact.inquiryType': 'Type de Demande',
    'contact.message': 'Message',
    'contact.send': 'Envoyer Message',

    // Admin
    'admin.dashboard': 'Tableau de Bord Admin',
    'admin.news': 'Gestion des Nouvelles',
    'admin.applications': 'Candidatures',
    'admin.bookings': 'Réservations',
    'admin.contacts': 'Messages de Contact',
    'admin.logout': 'Déconnexion',
    'admin.students': 'Étudiants',
    'admin.teachers': 'Enseignants',
    'admin.courses': 'Cours',
    'admin.avg': 'Note Moy.',
    'admin.passRate': 'Taux de Réussite',
  },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return (
      translations[language][key as keyof (typeof translations)['en']] || key
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
