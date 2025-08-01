import React from 'react';
import { Header } from '../../globals/layout/header';
import { Footer } from '../../globals/layout/footer';
import HeroSection from './sections/hero-section';
import NewsAnnouncements from './sections/news-announcements';
import QuickLinks from './sections/quick-links';
import AcademicPrograms from './sections/academic-programs';
import FeaturedGallery from './sections/featured-gallery';
import AdmissionsSection from './sections/admissions-section';
import AlumniContribution from './sections/alumni-contribution';
import ContactSection from './sections/contact-section';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Header />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <NewsAnnouncements />
        <QuickLinks />
        <AcademicPrograms />
        <FeaturedGallery />
        <AdmissionsSection />
        <AlumniContribution />
        <ContactSection />
      </main>
      <Footer showStats={true} />
    </div>
  );
}
