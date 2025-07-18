'use client';

import React, { useState, useEffect } from 'react';
import type { GradeReport, StudentGrade } from '../../../../api/constants';
import type {
  calculateStatistics,
  calculateTermStatistics,
  parseStudentList,
  parseCSVContent,
} from '../../../../api/utils';
import type ImportModal from '../../../../modals/ImportModal';
import type PreviewModal from '../../../../modals/PreviewModal';
import type ApprovalModal from '../../../../modals/ApprovalModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../../../ui/dialog';
import { Button } from '../../../../../../ui/button';
import { Input } from '../../../../../../ui/input';
import { Textarea } from '../../../../../../ui/textarea';
import { useToast } from '../../../../../../../hooks/use-toast';
import { FileText, Users, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface ImportExportManagementProps {
  classList: string[];
  classFolderMap: Record<string, string>;
  englishClasses: string[];
  frenchClasses: string[];
  calculateStatistics: typeof calculateStatistics;
  calculateTermStatistics: typeof calculateTermStatistics;
  parseStudentList: typeof parseStudentList;
  parseCSVContent: typeof parseCSVContent;
  // Modal dependencies to be injected:
  ImportModal: typeof ImportModal;
  PreviewModal: typeof PreviewModal;
  ApprovalModal: typeof ApprovalModal;
  t: (key: string) => string;
  language: string;
  section?: string;
  // Sub-component dependencies to be injected as needed
}

const ImportExportManagement: React.FC<ImportExportManagementProps> = ({
  classList,
  classFolderMap,
  englishClasses,
  frenchClasses,
  calculateStatistics,
  calculateTermStatistics,
  parseStudentList,
  parseCSVContent,
  ImportModal,
  PreviewModal,
  ApprovalModal,
  t,
  language,
  section,
  // ...other injected dependencies
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState('');
  const [templates, setTemplates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editorData, setEditorData] = useState<any[][]>([]);
  const [allRows, setAllRows] = useState<any[][]>([]);
  const [editorFileName, setEditorFileName] = useState('');
  const [editorClass, setEditorClass] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadPreviewFile, setUploadPreviewFile] = useState<File | null>(null);
  const [uploadPreviewData, setUploadPreviewData] = useState<any[][]>([]);
  const [showUploadPreview, setShowUploadPreview] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [showGradePreview, setShowGradePreview] = useState(false);

  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    const folderName = classFolderMap[selectedClass] || selectedClass;
    fetch(`/api/grading-templates/${encodeURIComponent(folderName)}`)
      .then(res => res.json())
      .then(data => {
        setTemplates(data.templates || []);
        setLoading(false);
      })
      .catch(() => setTemplates([]));
  }, [selectedClass, classFolderMap]);

  // Simulate fetching uploaded files (replace with real API call)
  useEffect(() => {
    setUploadedFiles([
      // Example stub
      {
        id: '1',
        name: 'grades-math-2024.xlsx',
        url: '/uploads/teacher-grades/teacher1/2024-06-01/grades-math-2024.xlsx',
        uploadedAt: '2024-06-01',
      },
    ]);
  }, []);

  // Handler for Fill Grades Online
  const handleFillOnline = async (templateFile: string) => {
    setLoading(true);
    try {
      const folderName = classFolderMap[selectedClass] || selectedClass;
      const res = await fetch(
        `/api/grading-templates/${encodeURIComponent(folderName)}/${encodeURIComponent(templateFile)}`
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const blob = await res.blob();
      const arrayBuffer = await blob.arrayBuffer();

      // Dynamic import of XLSX with proper error handling
      let XLSX;
      try {
        const xlsxModule = await import('xlsx');
        XLSX = xlsxModule.default || xlsxModule;
      } catch (importError) {
        console.error('Failed to import XLSX library:', importError);
        throw new Error('Failed to load Excel processing library');
      }

      if (!XLSX || typeof XLSX.read !== 'function') {
        throw new Error('XLSX library not properly loaded');
      }

      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const allRowsData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      }) as any[][];

      // Table header
      const tableHeader = ['Ide', 'NOM ET PRENOM', 'NOTE 1', 'NOTE 2'];
      // Extract rows: NOM ET PRENOM from col E (index 4), NOTE 1-6 from cols F-K (5-10), from row 4 (index 3)
      const filteredRows = allRowsData
        .slice(3)
        .map(row => [
          row[4] || '',
          row[5] || '',
          row[6] || '',
          row[7] || '',
          row[8] || '',
          row[9] || '',
          row[10] || '',
        ])
        .filter(row => row[0] && String(row[0]).trim() !== ''); // Only rows with non-empty NOM ET PRENOM
      // Build tableRows with Ide as running number (idx+1)
      const tableRows = filteredRows.map((row, idx) => [
        idx + 1,
        row[0],
        row[1],
        row[2],
      ]);
      const tableData = [tableHeader, ...tableRows];

      setEditorData(tableData);
      setAllRows(allRowsData);
      setEditorFileName(templateFile);
      setEditorClass(selectedClass);
      setShowEditor(true);
      setEditorOpen(true);
    } catch (err) {
      console.error('Error loading template:', err);
      toast({
        title:
          t('errorLoadingTemplate') ||
          (language === 'fr'
            ? 'Erreur lors du chargement du modèle'
            : 'Error loading template'),
        description:
          err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Update handleCellChange to handle validation
  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    // Determine if this is francophone or english system based on class
    const isFrancophone =
      selectedClass &&
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
      ].includes(selectedClass);
    const maxGrade = isFrancophone ? 20 : 100;

    // Handle editorData updates (main grade table) - NOTE 1 and NOTE 2
    if (rowIdx > 0 && colIdx >= 2 && colIdx <= 3) {
      const validatedValue = validateGradeInput(value, maxGrade);
      setEditorData(prev => {
        const newData = prev.map(row => [...row]);
        newData[rowIdx][colIdx] = validatedValue;
        return newData;
      });
    }
  };

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

  // Handle finalize/upload
  const handleFinalizeUpload = async () => {
    // Convert editorData back to Excel file
    let XLSX;
    try {
      const xlsxModule = await import('xlsx');
      XLSX = xlsxModule.default || xlsxModule;
    } catch (importError) {
      console.error('Failed to import XLSX library:', importError);
      toast({
        title:
          t('errorLoadingLibrary') ||
          (language === 'fr'
            ? 'Erreur lors du chargement de la bibliothèque'
            : 'Error loading library'),
        description: 'Failed to load Excel processing library',
        variant: 'destructive',
      });
      return;
    }

    const ws = XLSX.utils.aoa_to_sheet(editorData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const outFile = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });

    // Create filename with subject, term, and NOTE columns
    const subject = editorFileName.replace('.xlsx', '');
    const noteColumns =
      editorData[0]
        ?.slice(2)
        .filter(col => col && col.toString().includes('NOTE'))
        .join('|') || 'NOTE_1|NOTE_2';
    const originalName = `${subject}-${term || 'T1'}-${noteColumns}.xlsx`;
    const file = new File([outFile], originalName, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Upload file with required fields
    const formData = new FormData();
    formData.append('file', file);
    formData.append('relatedType', 'grading');
    formData.append('relatedId', `teacher-grades-${Date.now()}`);
    formData.append('uploadedBy', 'teacher-user'); // Provide a valid user ID

    setUploading(true);
    try {
      const res = await fetch('/api/file-uploads', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || `Upload failed with status ${res.status}`
        );
      }

      const result = await res.json();
      if (result.success) {
        // Remove session data after successful upload
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('gradeEditorState');
          sessionStorage.removeItem('openFullPage');
        }

        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description:
            language === 'fr'
              ? 'Notes téléchargées avec succès!'
              : 'Grades uploaded successfully!',
          variant: 'default',
        });
        setShowEditor(false);
        setEditorOpen(false);

        // Reset all state
        setEditorData([]);
        setAllRows([]);
        setEditorFileName('');
        setEditorClass('');
        setTerm('');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Error uploading grades', err);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description:
          err instanceof Error
            ? err.message
            : language === 'fr'
              ? 'Échec du téléchargement'
              : 'Failed to upload grades',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // Handler for file upload input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadPreviewFile(file);

    // Dynamic import of XLSX with proper error handling
    let XLSX;
    try {
      const xlsxModule = await import('xlsx');
      XLSX = xlsxModule.default || xlsxModule;
    } catch (importError) {
      console.error('Failed to import XLSX library:', importError);
      toast({
        title:
          t('errorLoadingLibrary') ||
          (language === 'fr'
            ? 'Erreur lors du chargement de la bibliothèque'
            : 'Error loading library'),
        description: 'Failed to load Excel processing library',
        variant: 'destructive',
      });
      return;
    }

    if (!XLSX || typeof XLSX.read !== 'function') {
      toast({
        title:
          t('errorLoadingLibrary') ||
          (language === 'fr'
            ? 'Erreur lors du chargement de la bibliothèque'
            : 'Error loading library'),
        description: 'XLSX library not properly loaded',
        variant: 'destructive',
      });
      return;
    }

    let compCoords = null;
    let statsCoords = null;
    for (let i = 0; i < allRows.length; i++) {
      for (let j = 0; j < allRows[i].length; j++) {
        if (allRows[i][j] === 'COMPETENCES TRIMESTRIELLES VISEES') {
          compCoords = { row: i, col: j };
        }
        if (allRows[i][j] === 'STATISTIQUES ANNUELLES DE CONSEIL') {
          statsCoords = { row: i, col: j };
        }
      }
    }

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const previewRows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as any[][];
        setUploadPreviewData(
          previewRows.slice(0, 10).map(row => row.slice(0, 10))
        );
        setShowUploadPreview(true);
      } catch (err) {
        toast({
          title:
            t('errorReadingFile') ||
            (language === 'fr'
              ? 'Erreur lors de la lecture du fichier'
              : 'Error reading file'),
          variant: 'destructive',
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handler for approving the preview and uploading the file
  const handleApprovePreview = () => {
    setShowApprovalModal(true);
  };

  const handleUploadApproval = async () => {
    if (!uploadPreviewFile) return;
    setApprovalLoading(true);
    try {
      // Simulate upload (replace with real API call)
      await new Promise(res => setTimeout(res, 1000));
      setSuccessMessage(
        t('uploadSuccess') ||
          (language === 'fr'
            ? 'Fichier téléchargé avec succès !'
            : 'File uploaded successfully!')
      );
      setShowUploadPreview(false);
      setUploadPreviewFile(null);
      setUploadPreviewData([]);
    } catch (err) {
      toast({
        title:
          t('uploadError') ||
          (language === 'fr'
            ? 'Erreur lors du téléchargement.'
            : 'Upload error.'),
        variant: 'destructive',
      });
    } finally {
      setApprovalLoading(false);
      setShowApprovalModal(false);
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
          allRows,
        })
      );
    }
  };

  // Function to load state from sessionStorage
  const loadStateFromSession = () => {
    if (typeof window !== 'undefined') {
      const savedState = sessionStorage.getItem('gradeEditorState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          setEditorData(state.editorData || []);
          setEditorFileName(state.editorFileName || '');
          setEditorClass(state.editorClass || '');
          setTerm(state.term || '');
          setAllRows(state.allRows || []);
          return true;
        } catch (error) {
          console.error('Error loading state from sessionStorage:', error);
        }
      }
    }
    return false;
  };

  // Save state whenever any of the key data changes
  React.useEffect(() => {
    if (editorData.length > 0 || editorFileName || editorClass) {
      saveStateToSession();
    }
  }, [editorData, editorFileName, editorClass, term, allRows]);

  // Load state on component mount
  React.useEffect(() => {
    loadStateFromSession();
  }, []);

  // Handle preview functionality
  const handlePreview = async () => {
    if (!editorData || editorData.length === 0) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description:
          language === 'fr'
            ? 'Aucune donnée à prévisualiser'
            : 'No data to preview',
        variant: 'destructive',
      });
      return;
    }

    setShowGradePreview(true);
  };

  // Handle preview in Google Sheets
  const handlePreviewInGoogleSheets = async () => {
    if (!editorData || editorData.length === 0) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description:
          language === 'fr'
            ? 'Aucune donnée à prévisualiser'
            : 'No data to preview',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Dynamic import of XLSX
      let XLSX;
      try {
        const xlsxModule = await import('xlsx');
        XLSX = xlsxModule.default || xlsxModule;
      } catch (importError) {
        console.error('Failed to import XLSX library:', importError);
        throw new Error('Failed to load Excel processing library');
      }

      // Create workbook with current data
      const ws = XLSX.utils.aoa_to_sheet(editorData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      // Convert to base64 for Google Sheets
      const excelBuffer = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const dataUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelBuffer}`;

      // Open in Google Sheets
      const googleSheetsUrl = `https://docs.google.com/spreadsheets/d/create?usp=data_import&dataurl=${encodeURIComponent(dataUrl)}`;
      window.open(googleSheetsUrl, '_blank');

      toast({
        title: language === 'fr' ? 'Prévisualisation' : 'Preview',
        description:
          language === 'fr'
            ? 'Ouverture dans Google Sheets...'
            : 'Opening in Google Sheets...',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error creating preview:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description:
          language === 'fr'
            ? 'Erreur lors de la création de la prévisualisation'
            : 'Error creating preview',
        variant: 'destructive',
      });
    }
  };

  // Handle download preview as Excel file
  const handleDownloadPreview = async () => {
    if (!editorData || editorData.length === 0) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description:
          language === 'fr'
            ? 'Aucune donnée à télécharger'
            : 'No data to download',
        variant: 'destructive',
      });
      return;
    }

    try {
      let XLSX;
      try {
        const xlsxModule = await import('xlsx');
        XLSX = xlsxModule.default || xlsxModule;
      } catch (importError) {
        console.error('Failed to import XLSX library:', importError);
        throw new Error('Failed to load Excel processing library');
      }

      const ws = XLSX.utils.aoa_to_sheet(editorData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const outFile = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });

      const subject = editorFileName.replace('.xlsx', '');
      const previewName = `${subject}-PREVIEW-${new Date().toISOString().split('T')[0]}.xlsx`;
      const file = new File([outFile], previewName, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Create download link
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = previewName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: language === 'fr' ? 'Téléchargement' : 'Download',
        description:
          language === 'fr'
            ? 'Fichier de prévisualisation téléchargé'
            : 'Preview file downloaded',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error downloading preview:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description:
          language === 'fr'
            ? 'Erreur lors du téléchargement'
            : 'Error downloading file',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        {language === 'fr' ? 'Import/Export des Notes' : 'Import/Export Grades'}
      </h2>
      <div className="flex gap-8 mb-6">
        <div className="flex-1">
          <h4 className="font-semibold mb-2 text-blue-700">
            {language === 'fr' ? 'Système Anglophone' : 'English Sub-system'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {englishClasses.map(cls => (
              <button
                key={cls}
                className={`rounded-lg px-4 py-2 font-medium border transition-colors shadow-sm text-sm ${selectedClass === cls ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
                onClick={() => setSelectedClass(cls)}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold mb-2 text-green-700">
            {language === 'fr' ? 'Système Francophone' : 'French Sub-system'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {frenchClasses.map(cls => (
              <button
                key={cls}
                className={`rounded-lg px-4 py-2 font-medium border transition-colors shadow-sm text-sm ${selectedClass === cls ? 'bg-green-600 text-white border-green-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50'}`}
                onClick={() => setSelectedClass(cls)}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* set a separator with shadow */}
      <div className="my-6 h-[14px]  border-t border-gray-400 shadow-xl shadow-black/10" />
      {/* Template List */}
      {selectedClass && (
        <div className="bg-slate-50 rounded-xl shadow-sm border p-6 mb-6">
          <h3 className="font-semibold mb-2">
            {language === 'fr'
              ? 'Modèles Disponibles pour'
              : 'Available Templates for'}{' '}
            <span className="text-blue-700">{selectedClass}</span>
          </h3>
          {loading ? (
            <div>
              {language === 'fr'
                ? 'Chargement des modèles...'
                : 'Loading templates...'}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-gray-500">
              {language === 'fr'
                ? 'Aucun modèle trouvé pour cette classe.'
                : 'No templates found for this class.'}
            </div>
          ) : (
            <ul className="space-y-2">
              {templates.map(file => (
                <li
                  key={file}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border"
                >
                  <span className="flex-1 font-medium text-gray-700">
                    {file}
                  </span>
                  <a
                    href={`/api/grading-templates/${classFolderMap[selectedClass] || selectedClass}/${file}`}
                    download
                    className="text-blue-600 hover:text-blue-800 underline text-sm font-medium transition-colors duration-200"
                  >
                    {language === 'fr' ? 'Télécharger' : 'Download'}
                  </a>
                  <button
                    className="ml-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                    onClick={() => handleFillOnline(file)}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    {language === 'fr' ? 'Remplir en ligne' : 'Fill Online'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* File Upload */}
      <div className="bg-slate-50 rounded-xl shadow-sm border p-6 mb-6">
        <h3 className="font-semibold mb-2">
          {language === 'fr'
            ? 'Télécharger le Fichier de Notes Rempli'
            : 'Upload Filled Grading File'}
        </h3>
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          disabled={uploading || showUploadPreview}
          className="mb-2"
        />
        {uploading && (
          <span className="text-blue-600 ml-2">
            {language === 'fr' ? 'Téléchargement...' : 'Uploading...'}
          </span>
        )}
      </div>
      {/* Grade Preview Modal */}
      <PreviewModal
        isOpen={showGradePreview}
        onClose={() => setShowGradePreview(false)}
        data={editorData}
        t={t}
        language={language}
        mode="grades"
        fileName={editorFileName}
        onPreviewInGoogleSheets={handlePreviewInGoogleSheets}
        onDownloadPreview={handleDownloadPreview}
      />

      {/* Upload Preview Modal */}
      {showUploadPreview && (
        <PreviewModal
          isOpen={showUploadPreview}
          onClose={() => setShowUploadPreview(false)}
          data={uploadPreviewData}
          onApprove={handleApprovePreview}
          isLoading={uploading}
          t={t}
          language={language}
          mode="file"
          fileName={uploadPreviewFile?.name}
        />
      )}
      {/* Approval Modal */}
      {showApprovalModal && (
        <ApprovalModal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          onApprove={handleUploadApproval}
          message={
            language === 'fr'
              ? 'Voulez-vous vraiment approuver et télécharger ce fichier ?'
              : 'Do you really want to approve and upload this file?'
          }
          isLoading={approvalLoading}
          t={t}
          language={language}
        />
      )}
      {/* Success Message */}
      {successMessage && (
        <div className="text-green-600 font-semibold my-4">
          {successMessage}
        </div>
      )}

      {/* Uploaded Files List */}
      <div className="my-6 border-t border-gray-400" />
      <div className="bg-slate-50 rounded-xl shadow-sm border p-6 mb-6">
        <h3 className="font-semibold mb-2">
          {language === 'fr'
            ? 'Vos Fichiers Téléchargés'
            : 'Your Uploaded Files'}
        </h3>
        {uploadedFiles.length === 0 ? (
          <div className="text-gray-500">
            {language === 'fr'
              ? 'Aucun fichier téléchargé.'
              : 'No uploaded files.'}
          </div>
        ) : (
          <ul className="space-y-2">
            {uploadedFiles.map(file => (
              <li key={file.id} className="flex items-center gap-2">
                <span>{file.name}</span>
                <a
                  href={file.url}
                  download
                  className="text-blue-600 underline text-sm"
                >
                  {language === 'fr' ? 'Télécharger' : 'Download'}
                </a>
                <button
                  className="ml-2 px-2 py-1 bg-purple-500 text-white rounded text-xs"
                  onClick={() =>
                    alert(
                      language === 'fr'
                        ? 'Partage non implémenté.'
                        : 'Share not implemented.'
                    )
                  }
                >
                  {language === 'fr' ? 'Partager' : 'Share'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* */}

      {/* Comprehensive Grading Table Modal */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-7xl w-full h-[95vh] flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
          <DialogHeader className="bg-white rounded-t-lg shadow-sm border-b border-gray-200 p-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              Fill Grades: {editorFileName} ({editorClass})
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="text-center font-bold text-xl text-gray-800 mb-4">
                LYCEE BILINGUE DE BAFIA. RELEVE DE NOTES
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">
                    {language === 'fr' ? 'CLASSE' : 'CLASS'}:
                  </span>
                  <span className="text-blue-600 font-medium">
                    {editorClass}
                  </span>
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
                  <span className="text-blue-600 font-medium">Teacher</span>
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
                                      placeholder={
                                        isFrancophone ? '0-20' : '0-100'
                                      }
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
                            {allRows[7]?.[0] || language === 'fr'
                              ? 'Statistiques'
                              : 'Statistics'}
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
                      {language === 'fr' ? 'Competences' : 'Competencies'}
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
                            {language === 'fr' ? 'Competences' : 'Competencies'}
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
                              ? 'Statistiques annuelles'
                              : 'Annual Statistics'}
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
                            {language === 'fr'
                              ? 'Heures Prévues'
                              : 'Hours Planned'}
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
                            {language === 'fr'
                              ? 'TP/TD Prévus'
                              : 'TP/TD Planned'}
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
          </div>

          {/* Footer Actions */}
          <div className="bg-white border-t border-gray-200 p-6 rounded-b-lg">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {editorData && editorData.length > 1
                  ? `${editorData.length - 1} students loaded`
                  : 'No students found'}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditor(false);
                    setEditorOpen(false);
                  }}
                  disabled={uploading}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </Button>

                {/* Preview Button */}
                <Button
                  onClick={handlePreview}
                  disabled={uploading || !editorData || editorData.length === 0}
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {language === 'fr' ? 'Prévisualiser' : 'Preview'}
                </Button>

                {/* Download Preview Button */}
                <Button
                  onClick={handleDownloadPreview}
                  disabled={uploading || !editorData || editorData.length === 0}
                  variant="outline"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {language === 'fr' ? 'Télécharger' : 'Download'}
                </Button>

                {/* Show "Open in Full Page" button when in modal */}
                {editorOpen && (
                  <Button
                    onClick={() => {
                      sessionStorage.setItem('openFullPage', '1');
                      router.push('/teacher/import-export');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {language === 'fr'
                      ? 'Ouvrir dans la page complète'
                      : 'Open in Full Page'}
                  </Button>
                )}
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
                      {language === 'fr'
                        ? 'Finaliser et Télécharger'
                        : 'Finalize & Upload'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImportExportManagement;
