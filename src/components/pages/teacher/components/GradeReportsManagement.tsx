import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { GradeReport, GradeReportFormData } from '../api/constants';
import type { calculateStatistics } from '../api/utils';

export interface GradeReportsManagementProps {
  gradeReports: GradeReport[];
  calculateStatistics: typeof calculateStatistics;
  t: (key: string) => string;
  language: string;
}

const GradeReportsManagement: React.FC<GradeReportsManagementProps> = ({
  gradeReports,
  calculateStatistics,
  t,
  language,
}) => {
  const { toast } = useToast();
  const [reports, setReports] = useState<GradeReport[]>(gradeReports);
  const [filteredReports, setFilteredReports] = useState<GradeReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [editingReport, setEditingReport] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<GradeReport>>({});

  // Filter reports based on search term and filters
  useEffect(() => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSubject && selectedSubject !== 'all') {
      filtered = filtered.filter(report => report.subject === selectedSubject);
    }

    if (selectedTerm && selectedTerm !== 'all') {
      filtered = filtered.filter(report => report.term === selectedTerm);
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, selectedSubject, selectedTerm]);

  const handleEditReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setEditingReport(reportId);
      setEditForm({
        className: report.className,
        subject: report.subject,
        term: report.term,
        gradingPeriod: report.gradingPeriod,
        academicYear: report.academicYear,
      });
    }
  };

  const handleSaveReport = async (reportId: string) => {
    if (!reportId) return;

    try {
      const response = await fetch(`/api/grade-reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update grade report');
      }

      const updatedReport = await response.json();
      setReports(prev => prev.map(r => r.id === reportId ? updatedReport : r));
      setEditingReport(null);
      setEditForm({});

      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Rapport mis à jour' : 'Grade report updated successfully',
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Échec de la mise à jour' : 'Failed to update grade report',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!reportId) return;

    if (!confirm(language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer ce rapport ?' : 'Are you sure you want to delete this report?')) {
      return;
    }

    try {
      const response = await fetch(`/api/grade-reports/${reportId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete grade report');
      }

      setReports(prev => prev.filter(r => r.id !== reportId));

      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Rapport supprimé' : 'Grade report deleted successfully',
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Échec de la suppression' : 'Failed to delete grade report',
        variant: 'destructive',
      });
    }
  };

  const handleFinalizeReport = async (reportId: string) => {
    if (!reportId) return;

    try {
      const response = await fetch(`/api/grade-reports/${reportId}/finalize`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to finalize grade report');
      }

      const finalizedReport = await response.json();
      setReports(prev => prev.map(r => r.id === reportId ? finalizedReport : r));

      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Rapport finalisé' : 'Grade report finalized successfully',
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Échec de la finalisation' : 'Failed to finalize grade report',
        variant: 'destructive',
      });
    }
  };

  const getUniqueSubjects = () => {
    return Array.from(new Set(reports.map(report => report.subject)));
  };

  const getUniqueTerms = () => {
    return Array.from(new Set(reports.map(report => report.term)));
  };

  // Note: calculateStatistics expects StudentGrade[] but we have GradeReport[]
  // For now, we'll create a simple statistics object
  const statistics = {
    totalReports: filteredReports.length,
    finalizedReports: filteredReports.filter(r => r.isFinalized).length,
    inProgressReports: filteredReports.filter(r => !r.isFinalized).length,
    uniqueSubjects: getUniqueSubjects().length,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">{t('gradeReports.search') || 'Search Reports'}</Label>
              <Input
                id="search"
                placeholder={language === 'fr' ? 'Rechercher par classe ou sujet...' : 'Search by class or subject...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="subject-filter">{t('gradeReports.subjectFilter') || 'Subject'}</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'fr' ? 'Tous les sujets' : 'All Subjects'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'fr' ? 'Tous les sujets' : 'All Subjects'}</SelectItem>
                  {getUniqueSubjects().map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="term-filter">{t('gradeReports.termFilter') || 'Term'}</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'fr' ? 'Tous les termes' : 'All Terms'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'fr' ? 'Tous les termes' : 'All Terms'}</SelectItem>
                  {getUniqueTerms().map(term => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSubject('all');
                  setSelectedTerm('all');
                }}
                variant="outline"
              >
                {language === 'fr' ? 'Réinitialiser' : 'Reset'}
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{filteredReports.length}</div>
                <div className="text-sm text-gray-600">{language === 'fr' ? 'Rapports' : 'Reports'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {filteredReports.filter(r => r.isFinalized).length}
                </div>
                <div className="text-sm text-gray-600">{language === 'fr' ? 'Finalisés' : 'Finalized'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {filteredReports.filter(r => !r.isFinalized).length}
                </div>
                <div className="text-sm text-gray-600">{language === 'fr' ? 'En cours' : 'In Progress'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{getUniqueSubjects().length}</div>
                <div className="text-sm text-gray-600">{language === 'fr' ? 'Sujets' : 'Subjects'}</div>
              </CardContent>
            </Card>
          </div>

          {/* Reports Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'fr' ? 'Classe' : 'Class'}</TableHead>
                  <TableHead>{language === 'fr' ? 'Sujet' : 'Subject'}</TableHead>
                  <TableHead>{language === 'fr' ? 'Terme' : 'Term'}</TableHead>
                  <TableHead>{language === 'fr' ? 'Période' : 'Period'}</TableHead>
                  <TableHead>{language === 'fr' ? 'Statut' : 'Status'}</TableHead>
                  <TableHead>{language === 'fr' ? 'Actions' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map(report => (
                  <TableRow key={report.id || 'temp-id'}>
                    <TableCell className="font-medium">{report.className}</TableCell>
                    <TableCell>{report.subject}</TableCell>
                    <TableCell>{report.term}</TableCell>
                    <TableCell>{report.gradingPeriod}</TableCell>
                    <TableCell>
                      <Badge variant={report.isFinalized ? 'default' : 'secondary'}>
                        {report.isFinalized ? (language === 'fr' ? 'Finalisé' : 'Finalized') : (language === 'fr' ? 'En cours' : 'In Progress')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {editingReport === report.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => report.id && handleSaveReport(report.id)}
                            >
                              {language === 'fr' ? 'Sauvegarder' : 'Save'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingReport(null);
                                setEditForm({});
                              }}
                            >
                              {language === 'fr' ? 'Annuler' : 'Cancel'}
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => report.id && handleEditReport(report.id)}
                            >
                              {language === 'fr' ? 'Modifier' : 'Edit'}
                            </Button>
                            {!report.isFinalized && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => report.id && handleFinalizeReport(report.id)}
                              >
                                {language === 'fr' ? 'Finaliser' : 'Finalize'}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => report.id && handleDeleteReport(report.id)}
                            >
                              {language === 'fr' ? 'Supprimer' : 'Delete'}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {language === 'fr' ? 'Aucun rapport trouvé' : 'No reports found'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GradeReportsManagement;
