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
} from './import/export/sub-components/ImportExportManagement';
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
import { TeacherSidebar } from '../../../ui/teacher-sidebar';
import TemplateList from './TemplateList';

const TeacherDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeSection, setActiveSection] = useState('importExport');

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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar with beautiful bg */}
      <div className="hidden md:flex flex-col w-64 border-r bg-gradient-to-b from-blue-100 to-blue-300">
        <TeacherSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          sections={['importExport', 'gradeReports', 'studentGrades']}
        />
      </div>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 md:px-12 md:py-12">
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
              <div className="bg-white rounded-xl shadow-sm border p-6">
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
      </main>
    </div>
  );
};

export default TeacherDashboard;
