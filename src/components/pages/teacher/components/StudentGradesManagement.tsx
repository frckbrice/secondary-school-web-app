import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type {
  StudentGrade,
  StudentGradeFormData,
  GradeReport,
} from '../api/constants';
import type { calculateStatistics } from '../api/utils';

export interface StudentGradesManagementProps {
  studentGrades: StudentGrade[];
  gradeReports: GradeReport[];
  calculateStatistics: typeof calculateStatistics;
  t: (key: string) => string;
  language: string;
}

const StudentGradesManagement: React.FC<StudentGradesManagementProps> = ({
  studentGrades,
  gradeReports,
  calculateStatistics,
  t,
  language,
}) => {
  const { toast } = useToast();
  const [grades, setGrades] = useState<StudentGrade[]>(studentGrades);
  const [selectedReport, setSelectedReport] = useState<string>('all');
  const [filteredGrades, setFilteredGrades] = useState<StudentGrade[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGrade, setEditingGrade] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<StudentGrade>>({});

  // Filter grades based on selected report and search term
  useEffect(() => {
    let filtered = grades;

    if (selectedReport && selectedReport !== 'all') {
      // Note: gradeReportId is not in the current StudentGrade interface
      // This would need to be added to the interface if needed
      // For now, we'll filter by other criteria
      filtered = filtered.filter(
        grade => grade.id && grade.id.includes(selectedReport)
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        grade =>
          grade.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (grade.matricule &&
            grade.matricule.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredGrades(filtered);
  }, [grades, selectedReport, searchTerm]);

  const handleEditGrade = (gradeId: string) => {
    const grade = grades.find(g => g.id === gradeId);
    if (grade) {
      setEditingGrade(gradeId);
      setEditForm({
        grade: grade.grade,
        remarks: grade.remarks,
      });
    }
  };

  const handleSaveGrade = async (gradeId: string) => {
    if (!gradeId) return;

    try {
      const response = await fetch(`/api/student-grades/${gradeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update grade');
      }

      const updatedGrade = await response.json();
      setGrades(prev => prev.map(g => (g.id === gradeId ? updatedGrade : g)));
      setEditingGrade(null);
      setEditForm({});

      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description:
          language === 'fr' ? 'Note mise à jour' : 'Grade updated successfully',
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description:
          language === 'fr'
            ? 'Échec de la mise à jour'
            : 'Failed to update grade',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGrade = async (gradeId: string) => {
    if (!gradeId) return;

    if (
      !confirm(
        language === 'fr'
          ? 'Êtes-vous sûr de vouloir supprimer cette note ?'
          : 'Are you sure you want to delete this grade?'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/student-grades/${gradeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete grade');
      }

      setGrades(prev => prev.filter(g => g.id !== gradeId));

      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description:
          language === 'fr' ? 'Note supprimée' : 'Grade deleted successfully',
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description:
          language === 'fr'
            ? 'Échec de la suppression'
            : 'Failed to delete grade',
        variant: 'destructive',
      });
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'bg-green-100 text-green-800';
    if (grade >= 12) return 'bg-yellow-100 text-yellow-800';
    if (grade >= 8) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const statistics = calculateStatistics(filteredGrades);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="report-filter">
                {t('studentGrades.reportFilter') || 'Grade Report'}
              </Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      language === 'fr'
                        ? 'Sélectionner un rapport'
                        : 'Select a report'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'fr' ? 'Tous les rapports' : 'All Reports'}
                  </SelectItem>
                  {gradeReports.map(report => (
                    <SelectItem key={report.id} value={report.id || 'temp-id'}>
                      {report.className} - {report.subject} ({report.term})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search">
                {t('studentGrades.search') || 'Search Students'}
              </Label>
              <Input
                id="search"
                placeholder={
                  language === 'fr'
                    ? 'Rechercher par nom ou matricule...'
                    : 'Search by name or matricule...'
                }
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSelectedReport('all');
                  setSearchTerm('');
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
                <div className="text-2xl font-bold">
                  {filteredGrades.length}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'fr' ? 'Étudiants' : 'Students'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {statistics.averageGrade?.toFixed(2) || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'fr' ? 'Moyenne' : 'Average'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {statistics.passRate?.toFixed(1) || 'N/A'}%
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'fr' ? 'Taux de réussite' : 'Pass Rate'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {statistics.averageGrade?.toFixed(1) || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'fr' ? 'Note moyenne' : 'Average Grade'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grades Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {language === 'fr' ? 'Étudiant' : 'Student'}
                  </TableHead>
                  <TableHead>
                    {language === 'fr' ? 'Matricule' : 'Matricule'}
                  </TableHead>
                  <TableHead>
                    {language === 'fr' ? 'Genre' : 'Gender'}
                  </TableHead>
                  <TableHead>{language === 'fr' ? 'Note' : 'Grade'}</TableHead>
                  <TableHead>
                    {language === 'fr' ? 'Remarques' : 'Remarks'}
                  </TableHead>
                  <TableHead>
                    {language === 'fr' ? 'Actions' : 'Actions'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrades.map(grade => (
                  <TableRow key={grade.id || 'temp-id'}>
                    <TableCell className="font-medium">
                      {grade.studentName}
                    </TableCell>
                    <TableCell>{grade.matricule || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          grade.gender === 'male' ? 'default' : 'secondary'
                        }
                      >
                        {grade.gender === 'male'
                          ? language === 'fr'
                            ? 'Masculin'
                            : 'Male'
                          : language === 'fr'
                            ? 'Féminin'
                            : 'Female'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editingGrade === grade.id ? (
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          value={editForm.grade || ''}
                          onChange={e =>
                            setEditForm(prev => ({
                              ...prev,
                              grade: parseInt(e.target.value),
                            }))
                          }
                          className="w-20"
                        />
                      ) : (
                        <Badge className={getGradeColor(grade.grade || 0)}>
                          {grade.grade || 'N/A'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingGrade === grade.id ? (
                        <Input
                          value={editForm.remarks || ''}
                          onChange={e =>
                            setEditForm(prev => ({
                              ...prev,
                              remarks: e.target.value,
                            }))
                          }
                          placeholder={
                            language === 'fr' ? 'Remarques...' : 'Remarks...'
                          }
                        />
                      ) : (
                        <span className="text-sm text-gray-600">
                          {grade.remarks || '-'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {editingGrade === grade.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                grade.id && handleSaveGrade(grade.id)
                              }
                            >
                              {language === 'fr' ? 'Sauvegarder' : 'Save'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingGrade(null);
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
                              onClick={() =>
                                grade.id && handleEditGrade(grade.id)
                              }
                            >
                              {language === 'fr' ? 'Modifier' : 'Edit'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                grade.id && handleDeleteGrade(grade.id)
                              }
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

          {filteredGrades.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {language === 'fr' ? 'Aucune note trouvée' : 'No grades found'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentGradesManagement;
