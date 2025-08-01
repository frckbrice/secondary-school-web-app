import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { SettingsProvider } from '../components/providers/settings-provider';
import { AuthProvider } from '../components/providers/auth-provider';
import { QueryClientProvider } from '../components/providers/query-provider';
import { ThemeProvider } from '../components/providers/theme-provider';
import { LanguageProvider } from '../hooks/use-language';
import { AccessibilityProvider } from '../components/accessibility/accessibility-provider';
import { AccessibilitySettings } from '../components/ui/accessibility-settings';
import { Toaster } from '../components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const sourceSansPro = Source_Sans_3({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-source-sans-pro',
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: ' "" - Government Bilingual High School | Excellence in Education',
    template: '%s |  ""',
  },
  description:
    'Government Bilingual High School XYZ - Premier secondary education in Centre Region, Cameroon. Admissions open for Forms 1-7. Excellence in academics, sports, and character development. Join our community of learners.',
  keywords: [
    ' ""',
    'Government Bilingual High School',
    'Cameroon',
    'Education',
    'Secondary School',
    'XYZ',
    'Centre Region',
    'Bilingual Education',
    'Academic Excellence',
    'Student Development',
    'School Admissions',
    'Cameroon Education',
    'High School',
    'Form 1',
    'Form 2',
    'Form 3',
    'Form 4',
    'Form 5',
    'Form 6',
    'Form 7',
  ],
  authors: [{ name: ' ""', url: 'https://secondary-school-web-app' }],
  creator: ' ""',
  publisher: ' ""',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://secondary-school-web-app'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'fr-FR': '/fr',
    },
  },
  openGraph: {
    title: ' "" - Government Bilingual High School',
    description:
      'Premier secondary education in Centre Region, Cameroon. Excellence in academics, sports, and character development. Join our community of learners.',
    url: 'https://secondary-school-web-app',
    siteName: ' ""',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: ' "" - Government Bilingual High School',
        type: 'image/jpeg',
      },
      {
        url: '/og-image-fr.jpg',
        width: 1200,
        height: 630,
        alt: ' "" - Lycée Bilingue de XYZ',
        type: 'image/jpeg',
      },
    ],
    locale: 'en_US',
    type: 'website',
    countryName: 'Cameroon',
  },
  twitter: {
    card: 'summary_large_image',
    title: ' "" - Government Bilingual High School',
    description:
      'Premier secondary education in Centre Region, Cameroon. Excellence in academics, sports, and character development.',
    images: ['/twitter-image.jpg'],
    creator: '@avombrice',
    site: '@avombrice',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'Education',
  classification: 'Educational Institution',
  other: {
    'geo.region': 'CM-CE',
    'geo.placename': 'XYZ',
    'geo.position': '4.7500;11.2333',
    ICBM: '4.7500, 11.2333',
  },
};

// Structured Data for Educational Organization
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': 'https://secondary-school-web-app/#organization',
  name: 'Government Bilingual High School XYZ',
  alternateName: [' ""', 'Lycée Bilingue du Gouvernement XYZ'],
  url: 'https://secondary-school-web-app',
  logo: {
    '@type': 'ImageObject',
    url: 'https://secondary-school-web-app/favicon.png',
    width: 244,
    height: 244,
  },
  image: {
    '@type': 'ImageObject',
    url: 'https://secondary-school-web-app/og-image.jpg',
    width: 1200,
    height: 630,
  },
  description:
    'Premier secondary education in Centre Region, Cameroon. Excellence in academics, sports, and character development.',
  slogan: 'Excellence in Education',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'XYZ',
    addressLocality: 'XYZ',
    addressRegion: 'Centre Region',
    addressCountry: 'CM',
    postalCode: '00000',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+237-222-17-51-75',
    contactType: 'customer service',
    areaServed: 'CM',
    availableLanguage: ['English', 'French'],
  },
  email: 'lyceebilingueXYZ@yahoo.fr',
  foundingDate: '1979',
  educationalLevel: 'Secondary Education',
  educationalProgram: [
    'Form 1',
    'Form 2',
    'Form 3',
    'Form 4',
    'Form 5',
    'Form 6',
    'Form 7',
  ],
  areaServed: {
    '@type': 'Country',
    name: 'Cameroon',
  },
  sameAs: [
    'https://facebook.com/gbhsXYZ',
    'https://twitter.com/gbhsXYZ',
    'https://instagram.com/gbhsXYZ',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Academic Programs',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'EducationalProgram',
          name: 'Lower Secondary Education',
          description: 'Forms 1-3',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'EducationalProgram',
          name: 'Upper Secondary Education',
          description: 'Forms 4-5',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'EducationalProgram',
          name: 'Advanced Level Education',
          description: 'Forms 6-7',
        },
      },
    ],
  },
  potentialAction: {
    '@type': 'ApplyAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://secondary-school-web-app/contact',
      inLanguage: 'en',
      actionPlatform: [
        'http://schema.org/DesktopWebPlatform',
        'http://schema.org/MobileWebPlatform',
      ],
    },
    result: {
      '@type': 'EducationalApplication',
      name: 'Student Application',
    },
  },
};

// Breadcrumb structured data
const breadcrumbStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://secondary-school-web-app',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSansPro.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link
          rel="icon"
          href="/favicon-16x16.png"
          type="image/png"
          sizes="16x16"
        />
        <link
          rel="icon"
          href="/favicon-32x32.png"
          type="image/png"
          sizes="32x32"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.png"
          sizes="180x180"
        />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/source-sans-pro-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbStructuredData),
          }}
        />

        {/* Additional meta tags for SEO */}
        <meta name="theme-color" content="#1e40af" />
        <meta name="msapplication-TileColor" content="#1e40af" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta
          httpEquiv="Referrer-Policy"
          content="strict-origin-when-cross-origin"
        />

        {/* Accessibility meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="format-detection" content="date=no" />
        <meta name="format-detection" content="address=no" />
        <meta name="format-detection" content="email=no" />
      </head>
      <body
        className={`${inter.className} antialiased`}
        style={{
          fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
          fontVariationSettings: '"opsz" 32',
        }}
      >
        <SettingsProvider>
          <QueryClientProvider>
            <AuthProvider>
              <ThemeProvider>
                <LanguageProvider>
                  <AccessibilityProvider>
                    <AccessibilitySettings />
                    {children}
                  </AccessibilityProvider>
                </LanguageProvider>
              </ThemeProvider>
            </AuthProvider>
            <Toaster />
          </QueryClientProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
