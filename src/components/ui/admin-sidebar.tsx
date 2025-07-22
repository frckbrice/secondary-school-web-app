'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { Button } from './button';
import {
  Shield,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Home,
  Calendar,
  Award,
  MessageSquare,
  Upload,
  Download,
  Eye,
  Plus,
  UserCheck,
  BookOpen,
  Image,
  Newspaper,
  Mail,
  Phone,
  Building,
  GraduationCap,
  DollarSign,
  AlertTriangle,
  ClipboardList,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../../hooks/use-language';
import { useAuth } from '../../hooks/use-auth';

interface AdminSidebarProps {
  className?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function AdminSidebar({
  className,
  activeTab,
  onTabChange,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const { logoutMutation } = useAuth();

  const menuItems = [
    {
      title: language === 'fr' ? 'Tableau de Bord' : 'Dashboard',
      tab: 'overview',
      icon: Home,
      description: language === 'fr' ? "Vue d'ensemble" : 'Overview',
    },
    {
      title: language === 'fr' ? 'Actualités' : 'News',
      tab: 'news',
      icon: Newspaper,
      description:
        language === 'fr' ? 'Gestion des actualités' : 'News management',
    },
    {
      title: language === 'fr' ? 'Candidatures' : 'Applications',
      tab: 'applications',
      icon: ClipboardList,
      description:
        language === 'fr'
          ? 'Gestion des candidatures'
          : 'Application management',
    },
    {
      title: language === 'fr' ? 'Réservations' : 'Bookings',
      tab: 'bookings',
      icon: Calendar,
      description:
        language === 'fr' ? 'Gestion des réservations' : 'Booking management',
    },
    {
      title: language === 'fr' ? 'Contacts' : 'Contacts',
      tab: 'contacts',
      icon: Phone,
      description:
        language === 'fr' ? 'Messages de contact' : 'Contact messages',
    },
    {
      title: language === 'fr' ? 'Installations' : 'Facilities',
      tab: 'facilities',
      icon: Building,
      description:
        language === 'fr' ? 'Gestion des installations' : 'Facility management',
    },
    {
      title: language === 'fr' ? 'Réalisations' : 'Achievements',
      tab: 'achievements',
      icon: Award,
      description:
        language === 'fr'
          ? 'Gestion des réalisations'
          : 'Achievement management',
    },
    {
      title: language === 'fr' ? 'Élèves' : 'Students',
      tab: 'students',
      icon: Users,
      description:
        language === 'fr' ? 'Gestion des élèves' : 'Student management',
    },
    {
      title: language === 'fr' ? 'Enseignants' : 'Teachers',
      tab: 'teachers',
      icon: UserCheck,
      description:
        language === 'fr' ? 'Gestion des enseignants' : 'Teacher management',
    },
  ];

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-r border-gray-200 dark:border-gray-800',
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {language === 'fr' ? 'Portail Administrateur' : 'Admin Portal'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'fr' ? ' ""' : ' ""'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map(item => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onTabChange?.(item.tab)}
              className={cn(
                'group relative flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 w-full text-left hover:scale-[1.02]',
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg" />
              )}

              <div
                className={cn(
                  'p-2 rounded-lg transition-all duration-300',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                )}
              >
                <item.icon className="h-4 w-4" />
              </div>

              <div className="flex-1">
                <div className="font-medium">{item.title}</div>
                <div
                  className={cn(
                    'text-xs transition-colors duration-300',
                    isActive
                      ? 'text-white/80'
                      : 'text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  )}
                >
                  {item.description}
                </div>
              </div>

              {/* Hover effect */}
              {!isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all duration-300" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 group"
          onClick={() => logoutMutation.mutate()}
        >
          <div className="p-1 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-800/40 transition-colors duration-300 mr-2">
            <LogOut className="h-4 w-4" />
          </div>
          {language === 'fr' ? 'Déconnexion' : 'Logout'}
        </Button>
      </div>
    </div>
  );
}
