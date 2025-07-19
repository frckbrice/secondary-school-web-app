'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/use-auth';
import { useLanguage } from '../../../hooks/use-language';
import { useToast } from '../../../hooks/use-toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { FileText, Users, Upload, ArrowLeft } from 'lucide-react';
// XLSX will be imported dynamically when needed

export default function GradeEditorFullPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();

  // State for grade editor
  const [editorData, setEditorData] = useState<any[][]>([]);
  const [editorFileName, setEditorFileName] = useState('');
  const [editorClass, setEditorClass] = useState('');
  const [term, setTerm] = useState('');
  const [stats, setStats] = useState({
    statistiques: '',
    lessonsPlanned: '',
    lessonsDone: '',
    hoursPlanned: '',
    hoursDone: '',
  });
  const [allRows, setAllRows] = useState<any[][]>([]);
  const [uploading, setUploading] = useState(false);

  // On mount, load editor state from sessionStorage
  useEffect(() => {
    const stateStr =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('gradeEditorState')
        : null;
    if (stateStr) {
      const state = JSON.parse(stateStr);
      setEditorData(state.editorData || []);
      setEditorFileName(state.editorFileName || '');
      setEditorClass(state.editorClass || '');
      setTerm(state.term || '');
      setStats(state.stats || {});
      setAllRows(state.allRows || []);
    }
  }, []);

  // On mount, check for grading data in sessionStorage; if not, redirect to /teacher
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stateStr = sessionStorage.getItem('gradeEditorState');
      if (!stateStr) {
        router.replace('/teacher');
      }
    }
  }, [router]);

  // Input validation functions
  const validateGradeInput = (value: string, maxGrade: number = 20): string => {
    // Remove any non-numeric characters except decimal point
    let sanitized = value.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }

    // Convert to number and validate range
    const numValue = parseFloat(sanitized);
    if (isNaN(numValue)) return '';
    if (numValue < 0) return '0';
    if (numValue > maxGrade) return maxGrade.toString();

    return sanitized;
  };

  const validateNumericInput = (value: string): string => {
    // Remove any non-numeric characters
    return value.replace(/[^0-9]/g, '');
  };

  const sanitizeTextInput = (value: string): string => {
    // Remove potentially dangerous characters and limit length
    return value
      .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 500); // Limit length
  };

  // Handle cell changes for main grade table with validation
  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    // Determine if this is francophone or english system based on class
    const isFrancophone =
      editorClass &&
      [
        '6eme',
        '5eme',
        '4eme',
        '3eme',
        '2nd C',
        '2nd A',
        'Pre A',
        'Pre C',
        'Pre D',
        'Tle A',
        'Tle C',
        'Tle D',
      ].includes(editorClass);
    const maxGrade = isFrancophone ? 20 : 100;

    if (rowIdx > 0 && colIdx >= 2 && colIdx <= 3) {
      const validatedValue = validateGradeInput(value, maxGrade);
      setEditorData(prev => {
        const newData = prev.map(row => [...row]);
        newData[rowIdx][colIdx] = validatedValue;
        return newData;
      });
    }
  };

  // Function to save current state to sessionStorage
  const saveStateToSession = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'gradeEditorState',
        JSON.stringify({
          editorData,
          editorFileName,
          editorClass,
          term,
          stats,
          allRows,
        })
      );
    }
  };

  // Save state whenever any of the key data changes
  useEffect(() => {
    if (editorData.length > 0 || editorFileName || editorClass) {
      saveStateToSession();
    }
  }, [editorData, editorFileName, editorClass, term, stats, allRows]);

  // Handle finalize/upload
  const handleFinalizeUpload = async () => {
    if (!user?.id) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description:
          language === 'fr'
            ? 'Utilisateur non authentifié'
            : 'User not authenticated',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    toast({
      title: language === 'fr' ? 'Téléchargement...' : 'Uploading...',
      description:
        language === 'fr'
          ? 'Veuillez patienter pendant le téléchargement'
          : 'Please wait while uploading',
    });

    try {
      // Dynamic import of XLSX
      const xlsxModule = await import('xlsx');
      const XLSX = xlsxModule.default || xlsxModule;

      // Convert editorData back to Excel file
      const ws = XLSX.utils.aoa_to_sheet(editorData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const outFile = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      const file = new File(
        [outFile],
        editorFileName.replace('.xlsx', '-filled.xlsx'),
        {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }
      );

      const formData = new FormData();
      formData.append('file', file);
      formData.append('relatedType', 'grading');
      formData.append('relatedId', `${user.id}-${Date.now()}`);
      formData.append('uploadedBy', user.id);

      const res = await fetch('/api/file-uploads', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await res.json();
      if (result.success) {
        // Success toast
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description:
            language === 'fr'
              ? 'Notes téléchargées avec succès!'
              : 'Grades uploaded successfully!',
        });

        // Clear sessionStorage and redirect back to dashboard
        sessionStorage.removeItem('gradeEditorState');
        router.push('/teacher');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Error uploading grades', err);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description:
          language === 'fr' ? 'Échec du téléchargement' : 'Upload failed',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // Back to Modal: save state and go back
  const handleBackToModal = () => {
    // State is already being saved automatically via useEffect
    router.push('/teacher?section=importExport');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleBackToModal}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Modal
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Grade Editor - Full Page View
                </h1>
                <p className="text-gray-600 mt-1">
                  {editorFileName} ({editorClass})
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="text-center font-bold text-xl text-gray-800 mb-4">
            LYCEE BILINGUE DE BAFIA. RELEVE DE NOTES
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">
                {language === 'fr' ? 'CLASSE' : 'CLASS'}:
              </span>
              <span className="text-blue-600 font-medium">{editorClass}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">
                {language === 'fr' ? 'MATIERE' : 'SUBJECT'}:
              </span>
              <span className="text-blue-600 font-medium">
                {editorFileName.replace('.xlsx', '')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">
                {language === 'fr' ? 'TRIMESTRE' : 'TERM'}:
              </span>
              <Input
                value={term}
                onChange={e => setTerm(e.target.value)}
                className="w-24 h-8 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-gray-500"
                placeholder="1/2/3"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">
                {language === 'fr' ? 'ENSEIGNANT' : 'TEACHER'}:
              </span>
              <span className="text-blue-600 font-medium">
                {user?.fullName || user?.username}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Grade Table */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Student Grades
              </h3>
            </div>
            <div className="p-4 overflow-x-auto">
              {editorData && editorData.length > 1 ? (
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      {editorData[0].map((cell, colIdx) => (
                        <th
                          key={colIdx}
                          className={`px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200 ${
                            colIdx === 0
                              ? 'w-16'
                              : colIdx === 1
                                ? 'min-w-[200px]'
                                : 'w-24 text-center'
                          }`}
                        >
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {editorData.slice(1).map((row, rowIdx) => {
                      // Determine if this is francophone or english system based on class
                      const isFrancophone =
                        editorClass &&
                        [
                          '6eme',
                          '5eme',
                          '4eme',
                          '3eme',
                          '2nd C',
                          '2nd A',
                          'Pre A',
                          'Pre C',
                          'Pre D',
                          'Tle A',
                          'Tle C',
                          'Tle D',
                        ].includes(editorClass);

                      return (
                        <tr
                          key={rowIdx}
                          className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                            rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          {row.map((cell, colIdx) => (
                            <td
                              key={colIdx}
                              className={`px-4 py-3 border-r border-gray-100 last:border-r-0 ${
                                colIdx === 0
                                  ? 'text-center font-medium text-gray-600 bg-gray-50'
                                  : colIdx === 1
                                    ? 'font-medium text-gray-800'
                                    : 'text-center'
                              }`}
                            >
                              {colIdx === 2 || colIdx === 3 ? (
                                <Input
                                  value={cell || ''}
                                  onChange={e =>
                                    handleCellChange(
                                      rowIdx + 1,
                                      colIdx,
                                      e.target.value
                                    )
                                  }
                                  className="w-full h-8 text-center border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                  placeholder={isFrancophone ? '0-20' : '0-100'}
                                />
                              ) : (
                                <span
                                  className={
                                    colIdx === 0
                                      ? 'font-semibold text-gray-700'
                                      : ''
                                  }
                                >
                                  {cell}
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No student data found in this template.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Tables */}
          <div className="lg:w-80 space-y-4">
            {/* Statistics Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3">
                <h4 className="text-sm font-semibold text-white">
                  {language === 'fr' ? 'Statistiques' : 'Statistics'}
                </h4>
              </div>
              <div className="p-4">
                <table className="w-full text-xs border border-gray-200 rounded">
                  <thead>
                    <tr className="bg-gray-50">
                      <th
                        className="border px-2 py-1 text-left font-medium"
                        colSpan={2}
                      >
                        {allRows[7]?.[0] || 'Statistics'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRows &&
                      allRows.slice(8, 14).map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border px-2 py-1 text-left text-sm">
                            {row[0]}
                          </td>
                          <td className="border px-2 py-1 text-left">
                            <Input
                              value={String(row[1] || '')}
                              onChange={e => {
                                const validatedValue = validateNumericInput(
                                  e.target.value
                                );
                                const newRows = [...allRows];
                                newRows[idx + 8][1] = validatedValue;
                                setAllRows(newRows);
                              }}
                              className="w-full h-6 text-xs border-gray-300 focus:border-green-500 focus:ring-green-500"
                              placeholder="0"
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Competencies Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-3">
                <h4 className="text-sm font-semibold text-white">
                  {language === 'fr' ? 'Competences' : ' Competencies'}
                </h4>
              </div>
              <div className="p-4">
                <table className="w-full text-xs border border-gray-200 rounded">
                  <thead>
                    <tr className="bg-gray-50">
                      <th
                        className="border px-2 py-1 text-left font-medium"
                        colSpan={3}
                      >
                        {language === 'fr'
                          ? 'COMPETENCES TRIMESTRIELLES VISEES'
                          : ' TARGETED TERM COMPETENCIES'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRows &&
                      allRows.slice(4, 5).map((row, idx) => (
                        <tr key={idx}>
                          <td
                            className="border px-2 py-1 text-left"
                            colSpan={3}
                          >
                            <Textarea
                              value={String(row[8] || '')}
                              onChange={e => {
                                const sanitizedValue = sanitizeTextInput(
                                  e.target.value
                                );
                                const newRows = [...allRows];
                                newRows[idx + 4][8] = sanitizedValue;
                                setAllRows(newRows);
                              }}
                              className="w-full text-xs border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                              rows={4}
                              placeholder={
                                language === 'fr'
                                  ? 'Entrez les compétences...'
                                  : 'Enter competencies...'
                              }
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Annual Statistics Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 px-4 py-3">
                <h4 className="text-sm font-semibold text-white">
                  {language === 'fr'
                    ? 'Statistiques annuelles'
                    : 'Annual Statistics'}
                </h4>
              </div>
              <div className="p-4">
                <table className="w-full text-xs border border-gray-200 rounded">
                  <thead>
                    <tr className="bg-gray-50">
                      <th
                        className="border px-2 py-1 text-left font-medium"
                        colSpan={3}
                      >
                        {language === 'fr'
                          ? 'STATISTIQUES ANNUELLES DE CONSEIL'
                          : 'ANNUAL COUNSELING STATISTICS'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-2 py-1 text-left text-sm">
                        {language === 'fr'
                          ? 'Leçons Prévues'
                          : 'Lessons Planned'}
                      </td>
                      <td className="border px-2 py-1 text-left">
                        <Input
                          value={String(allRows[8]?.[9] || '')}
                          onChange={e => {
                            const validatedValue = validateNumericInput(
                              e.target.value
                            );
                            const newRows = [...allRows];
                            newRows[8][9] = validatedValue;
                            setAllRows(newRows);
                          }}
                          className="w-full h-6 text-xs border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          placeholder="0"
                        />
                      </td>
                      <td
                        className="border px-2 py-1 text-left text-sm"
                        rowSpan={3}
                      >
                        {allRows[8]?.[10] || ''}
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1 text-left text-sm">
                        {language === 'fr' ? 'Heures Prévues' : 'Hours Planned'}
                      </td>
                      <td className="border px-2 py-1 text-left">
                        <Input
                          value={String(allRows[9]?.[9] || '')}
                          onChange={e => {
                            const validatedValue = validateNumericInput(
                              e.target.value
                            );
                            const newRows = [...allRows];
                            newRows[9][9] = validatedValue;
                            setAllRows(newRows);
                          }}
                          className="w-full h-6 text-xs border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          placeholder="0"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1 text-left text-sm">
                        {language === 'fr' ? 'TP/TD Prévus' : 'TP/TD Planned'}
                      </td>
                      <td className="border px-2 py-1 text-left">
                        <Input
                          value={String(allRows[10]?.[9] || '')}
                          onChange={e => {
                            const validatedValue = validateNumericInput(
                              e.target.value
                            );
                            const newRows = [...allRows];
                            newRows[10][9] = validatedValue;
                            setAllRows(newRows);
                          }}
                          className="w-full h-6 text-xs border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-gray-200 p-6 rounded-b-lg mt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {editorData && editorData.length > 1
                ? `${editorData.length - 1} students loaded`
                : 'No students found'}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleFinalizeUpload}
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                {uploading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Finalize & Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
