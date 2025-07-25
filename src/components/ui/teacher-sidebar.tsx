'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import {
  BookOpen,
  Calculator,
  FileText,
  BarChart3,
  Users,
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
} from 'lucide-react';
import { useLanguage } from '../../hooks/use-language';
import { useAuth } from '../../hooks/use-auth';

interface TeacherSidebarProps {
  className?: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
  sections?: string[];
}

export function TeacherSidebar({
  className,
  activeSection,
  onSectionChange,
  sections = [
    'gradeReports',
    'studentGrades',
    'calendar',
    'importExport',
    'settings',
  ],
}: TeacherSidebarProps) {
  const { t, language } = useLanguage();
  const { logoutMutation } = useAuth();

  const menuItems = [
    { key: 'gradeReports', label: 'Grade Reports', icon: BookOpen },
    { key: 'studentGrades', label: 'Student Grades', icon: Calculator },
    { key: 'calendar', label: 'Calendar', icon: Calendar },
    { key: 'importExport', label: 'Import/Export', icon: Upload },
    { key: 'settings', label: 'Settings', icon: Settings },
  ].filter(item => sections.includes(item.key));

  return (
    <div className={cn('flex flex-col h-full bg-transparent', className)}>
      {/* Header */}
      <div className="p-6 border-b border-indigo-500/30">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-white" />
          <div>
            <h2 className="text-lg font-semibold text-white">
              {language === 'fr' ? 'Portail Enseignant' : 'Teacher Portal'}
            </h2>
            <p className="text-sm text-indigo-200">
              {language === 'fr' ? ' ""' : ' ""'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => (
          <Button
            key={item.key}
            variant={activeSection === item.key ? 'default' : 'ghost'}
            className={cn(
              'w-full flex items-center justify-start gap-3 mb-2 transition-all duration-200',
              activeSection === item.key
                ? 'bg-white text-indigo-700 hover:bg-indigo-50 shadow-md'
                : 'text-indigo-100 hover:bg-indigo-700/50 hover:text-white'
            )}
            onClick={() => onSectionChange(item.key)}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Logout Action Only */}
      <div className="p-4 border-t border-indigo-500/30 mt-auto">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-red-300 hover:text-red-200 hover:bg-red-600/20"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {language === 'fr' ? 'Déconnexion' : 'Logout'}
        </Button>
      </div>
    </div>
  );
}
