'use client';

import React, { useState } from 'react';
import * as constants from '../api/constants';
import * as utils from '../api/utils';
import GradeReportsManagement, {
  GradeReportsManagementProps,
} from './GradeReportsManagement';
import StudentGradesManagement, {
  StudentGradesManagementProps,
} from './StudentGradesManagement';
import ImportExportManagement, {
  ImportExportManagementProps,
} from './sections/ImportExportManagement';
// import StatisticsManagement from './StatisticsManagement';
// import StudentsManagement from './StudentsManagement';
// import CalendarManagement from './CalendarManagement';
// import AwardsManagement from './AwardsManagement';
// import MessagesManagement from './MessagesManagement';
// import SettingsManagement from './SettingsManagement';

import type { GradeReport, StudentGrade } from '../api/constants';
import ApprovalModal from '../modals/ApprovalModal';
import ImportModal from '../modals/ImportModal';
import PreviewModal from '../modals/PreviewModal';
import { useLanguage } from '../../../../hooks/use-language';
import { useAuth } from '../../../../hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../../lib/queryClient';
import { useToast } from '../../../../hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '../../../ui/avatar';
import { Button } from '../../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../ui/dialog';
import { Input } from '../../../ui/input';
import { ProfileImageUpload } from '../../../ui/profile-image-upload';
import { Sun, Moon, User as UserIcon, ChevronDown } from 'lucide-react';
import { TeacherSidebar } from '../../../ui/teacher-sidebar';
import TemplateList from './TemplateList';

const TeacherDashboard: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, isLoading, error, logoutMutation, registerMutation } =
    useAuth();
  const [activeSection, setActiveSection] = useState('importExport');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    teacherSubject: user?.teacherSubject || '',
    profileImageUrl: user?.profileImageUrl || '',
  });
  const [theme, setTheme] = useState(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  );
  // Update form when user changes
  React.useEffect(() => {
    setProfileForm({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      teacherSubject: user?.teacherSubject || '',
      profileImageUrl: user?.profileImageUrl || '',
    });
  }, [user]);

  // Theme toggler
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: typeof profileForm) => {
      const res = await apiRequest('PUT', '/api/users/me', updates);
      if (!res) throw new Error('Failed to update profile');
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Update failed');
      return data.user;
    },
    onSuccess: updatedUser => {
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description:
          language === 'fr' ? 'Profil mis à jour' : 'Profile updated',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      setShowProfileModal(false);
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || 'Update failed',
        variant: 'destructive',
      });
    },
  });

  // Profile update handler
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Only send text fields, not the image file
    updateProfileMutation.mutate({
      fullName: profileForm.fullName,
      email: profileForm.email,
      phone: profileForm.phone,
      teacherSubject: profileForm.teacherSubject,
      profileImageUrl: profileForm.profileImageUrl,
    });
  };

  // Language switcher
  const handleLanguageChange = (lang: any) => {
    setLanguage(lang);
  };

  // Load state from sessionStorage on component mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = sessionStorage.getItem('gradeEditorState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          // If there's saved state, automatically open the import/export section
          setActiveSection('importExport');
        } catch (error) {
          console.error('Error loading state from sessionStorage:', error);
        }
      }
    }
  }, []);

  // Example data for demonstration; replace with real data fetching logic
  const gradeReports: GradeReport[] = [];
  const studentGrades: StudentGrade[] = [];

  // Only show logout in quick actions
  const quickActions = [
    {
      key: 'logout',
      label: t('logout') || (language === 'fr' ? 'Déconnexion' : 'Logout'),
      icon: 'logout',
      onClick: () => {
        // Implement logout logic here
        window.location.href = '/auth/logout';
      },
    },
  ];

  const importExportProps: ImportExportManagementProps = {
    classList: constants.CLASS_LIST,
    classFolderMap: constants.CLASS_FOLDER_MAP,
    englishClasses: constants.ENGLISH_CLASSES,
    frenchClasses: constants.FRENCH_CLASSES,
    calculateStatistics: utils.calculateStatistics,
    calculateTermStatistics: utils.calculateTermStatistics,
    parseStudentList: utils.parseStudentList,
    parseCSVContent: utils.parseCSVContent,
    ImportModal: ImportModal,
    PreviewModal: PreviewModal,
    ApprovalModal: ApprovalModal,
    t: t,
    language: language,
  };

  // const gradeReportsProps: GradeReportsManagementProps = {
  //   gradeReports,
  //   calculateStatistics: utils.calculateStatistics,
  // };

  // const studentGradesProps: StudentGradesManagementProps = {
  //   studentGrades,
  //   gradeReports,
  //   calculateStatistics: utils.calculateStatistics,
  // };

  // Section titles
  const sectionTitles: Record<string, string> = {
    importExport:
      language === 'fr'
        ? 'Gestion des Importations/Exportations'
        : 'Import/Export Management',
    gradeReports:
      t('gradeReports.title') ||
      (language === 'fr' ? 'Rapports de Notes' : 'Grade Reports'),
    studentGrades:
      t('studentGrades.title') ||
      (language === 'fr' ? 'Notes des Étudiants' : 'Student Grades'),
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Fixed Sidebar with different theme */}
      <div
        className="hidden md:flex flex-col w-64 fixed left-0 top-0 h-full bg-gradient-to-b from-indigo-600 to-indigo-800 
      shadow-lg z-10"
      >
        <TeacherSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          sections={['importExport', 'gradeReports', 'studentGrades']}
        />
      </div>
      {/* Main Content Area - scrollable */}
      <main className="flex-1 md:ml-64 flex flex-col overflow-y-auto">
        {/* Modern Header */}
        <div className="w-full bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
              {language === 'fr' ? 'Espace Enseignant' : 'Teacher Portal'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <Button
              variant={language === 'fr' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleLanguageChange('fr')}
              className="px-2"
            >
              FR
            </Button>
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleLanguageChange('en')}
              className="px-2"
            >
              EN
            </Button>
            {/* Theme Toggler */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </Button>
            {/* Avatar and Name with Profile Modal Trigger */}
            <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={user?.profileImageUrl || profileForm.profileImageUrl}
                      alt={user?.fullName || 'User'}
                    />
                    <AvatarFallback>
                      <UserIcon className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-gray-900 dark:text-white max-w-[120px] truncate">
                    {user?.fullName || user?.username || 'Teacher'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {language === 'fr'
                      ? 'Profil Enseignant'
                      : 'Teacher Profile'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <ProfileImageUpload
                    userId={user?.id?.toString() || ''}
                    currentImageUrl={profileForm.profileImageUrl}
                    userName={profileForm.fullName}
                    onImageChange={url =>
                      setProfileForm(f => ({ ...f, profileImageUrl: url }))
                    }
                  />
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {language === 'fr' ? 'Nom complet' : 'Full Name'}
                    </label>
                    <Input
                      value={profileForm.fullName}
                      onChange={e =>
                        setProfileForm(f => ({
                          ...f,
                          fullName: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {language === 'fr' ? 'Email' : 'Email'}
                    </label>
                    <Input
                      type="email"
                      value={profileForm.email}
                      onChange={e =>
                        setProfileForm(f => ({ ...f, email: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {language === 'fr' ? 'Téléphone' : 'Phone'}
                    </label>
                    <Input
                      type="tel"
                      value={profileForm.phone}
                      onChange={e =>
                        setProfileForm(f => ({ ...f, phone: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {language === 'fr' ? 'Matière' : 'Subject'}
                    </label>
                    <Input
                      value={profileForm.teacherSubject}
                      onChange={e =>
                        setProfileForm(f => ({
                          ...f,
                          teacherSubject: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setShowProfileModal(false)}
                    >
                      {language === 'fr' ? 'Annuler' : 'Cancel'}
                    </Button>
                    <Button
                      type="submit"
                      variant="default"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending
                        ? language === 'fr'
                          ? 'Enregistrement...'
                          : 'Saving...'
                        : language === 'fr'
                          ? 'Enregistrer'
                          : 'Save'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* Accessibility button remains floating (not in header) */}
        <div className="flex flex-col items-center px-4 py-8 md:px-12 md:py-12">
          <div className="w-full max-w-5xl">
            {/* Beautiful Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {sectionTitles[activeSection]}
                </h1>
                <p className="text-gray-500 mt-2">
                  {language === 'fr'
                    ? 'Bienvenue sur votre espace enseignant GBHS Bafia'
                    : 'Welcome to your GBHS Bafia teacher portal'}
                </p>
              </div>
              {/* Add any future header actions here */}
            </header>
            {activeSection === 'importExport' && (
              <section className="mb-12 space-y-8">
                {/* Available Templates Card */}
                <div className="rounded-xl shadow-sm border p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
                  <ImportExportManagement
                    section="availableTemplatesFor"
                    classList={constants.CLASS_LIST}
                    classFolderMap={constants.CLASS_FOLDER_MAP}
                    englishClasses={constants.ENGLISH_CLASSES}
                    frenchClasses={constants.FRENCH_CLASSES}
                    calculateStatistics={utils.calculateStatistics}
                    calculateTermStatistics={utils.calculateTermStatistics}
                    parseStudentList={utils.parseStudentList}
                    parseCSVContent={utils.parseCSVContent}
                    ImportModal={ImportModal}
                    PreviewModal={PreviewModal}
                    ApprovalModal={ApprovalModal}
                    t={t}
                    language={language}
                  />
                </div>
              </section>
            )}
            {activeSection === 'gradeReports' && (
              <section className="mb-12">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">
                  {sectionTitles.gradeReports}
                </h1>
                <GradeReportsManagement
                  gradeReports={gradeReports}
                  calculateStatistics={utils.calculateStatistics}
                  t={t}
                  language={language}
                />
              </section>
            )}
            {activeSection === 'studentGrades' && (
              <section className="mb-12">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">
                  {sectionTitles.studentGrades}
                </h1>
                <StudentGradesManagement
                  studentGrades={studentGrades}
                  gradeReports={gradeReports}
                  calculateStatistics={utils.calculateStatistics}
                  t={t}
                  language={language}
                />
              </section>
            )}
            {/* <StatisticsManagement /> */}
            {/* <StudentsManagement /> */}
            {/* <CalendarManagement /> */}
            {/* <AwardsManagement /> */}
            {/* <MessagesManagement /> */}
            {/* <SettingsManagement /> */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
