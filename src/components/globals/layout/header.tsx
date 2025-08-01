'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../../ui/button';
import { useLanguage } from '../../../hooks/use-language';
import { useTheme } from 'next-themes';
import { useAuth } from '../../../hooks/use-auth';
import { useSettings } from '../../providers/settings-provider';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  School,
  User,
  LogOut,
  Settings,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';

export function Header() {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { settings, loading: settingsLoading } = useSettings();

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (settingsLoading || !settings) {
    return null; // Or a loading skeleton if you prefer
  }

  const navigation = [
    { name: language === 'fr' ? 'Accueil' : 'Home', href: '/' },
    { name: language === 'fr' ? 'À Propos' : 'About', href: '/about' },
    { name: language === 'fr' ? 'Actualités' : 'News', href: '/news' },
    { name: language === 'fr' ? 'Galerie' : 'Gallery', href: '/gallery' },
    { name: language === 'fr' ? 'Contact' : 'Contact', href: '/contact' },
  ];

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = '/';
      },
    });
  };

  // Get user initials (first two characters of name or username)
  const getUserInitials = () => {
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      if (names.length >= 2) {
        return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
      }
      return user.fullName.substring(0, 2).toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <header
      className="bg-white dark:bg-gray-900 
    shadow-sm border-b border-gray-200
     dark:border-gray-700 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Go Back button for /auth page on mobile */}
        {pathname === '/auth' && (
          <div className="md:hidden flex items-center py-2 bg-red-500">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center text-gray-700 dark:text-gray-300"
            >
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {language === 'fr' ? 'Retour' : 'Go Back'}
            </Button>
          </div>
        )}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <School className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              )}
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {language === 'fr'
                    ? settings.siteNameFr || settings.siteName || 'Nom du site'
                    : settings.siteName || 'Site Name'}
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {language === 'en'
                    ? settings.siteName || 'Site Name'
                    : settings.siteNameFr || 'Nom du site'}
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle - Only render after mount to prevent hydration mismatch */}
            {mounted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                {theme === 'dark' ? (
                  <Sun className="w-8 h-8" />
                ) : (
                  <Moon className="w-8 h-8" />
                )}
              </Button>
            )}

            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 dark:text-gray-300"
                >
                  <Globe className="w-8 h-8" />
                  {language === 'fr' ? 'FR' : 'EN'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('fr')}>
                  Français
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu or Auth Buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-10 w-10 rounded-full p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={
                          (user as any).profileImageUrl ??
                          'https://via.placeholder.com/150'
                        }
                        alt="Profile Image"
                        className="object-cover h-12 w-12"
                      />
                      <AvatarFallback className="bg-blue-600 text-white font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.fullName || user.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.role === 'super_admin'
                        ? 'Super Administrator'
                        : user.role === 'admin'
                          ? 'Administrator'
                          : user.role === 'teacher'
                            ? 'Teacher'
                            : 'User'}
                    </p>
                  </div>
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Voir le profil' : 'View Profile'}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Paramètres' : 'Settings'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Déconnexion' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {/* Desktop: show both buttons, Mobile: show icon button */}
                <div className="hidden md:flex items-center space-x-2">
                  <Link href="/auth">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {language === 'fr' ? 'Connexion' : 'Login'}
                    </Button>
                  </Link>
                  <Link href="/auth?mode=register">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {language === 'fr' ? "S'inscrire" : 'Register'}
                    </Button>
                  </Link>
                </div>
                <div className="flex md:hidden items-center">
                  <Link href="/auth">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2"
                      aria-label={language === 'fr' ? 'Connexion' : 'Login'}
                    >
                      <User className="w-6 h-6" />
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-gray-700 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-2">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {/* Mobile auth buttons */}
              {!user && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link href="/auth">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 dark:text-gray-300"
                    >
                      {language === 'fr' ? 'Connexion' : 'Login'}
                    </Button>
                  </Link>
                  <Link href="/auth?mode=register">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      {language === 'fr' ? "S'inscrire" : 'Register'}
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
