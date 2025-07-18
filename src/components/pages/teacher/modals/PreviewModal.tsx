import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { FileText, Eye, Download, ExternalLink } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: any[][];
  onApprove?: () => void;
  isLoading?: boolean;
  t: (key: string) => string;
  language: string;
  mode?: 'file' | 'grades';
  fileName?: string;
  onPreviewInGoogleSheets?: () => void;
  onDownloadPreview?: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  data = [],
  onApprove,
  isLoading = false,
  t,
  language,
  mode = 'file',
  fileName,
  onPreviewInGoogleSheets,
  onDownloadPreview,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              {mode === 'grades'
                ? language === 'fr'
                  ? 'Aperçu des Notes'
                  : 'Grade Preview'
                : language === 'fr'
                  ? 'Aperçu du Fichier'
                  : 'File Preview'}
            </DialogTitle>
            <button
              type="button"
              aria-label="Close"
              className="text-gray-400 hover:text-gray-700 text-2xl font-bold px-2 focus:outline-none"
              onClick={onClose}
              disabled={isLoading}
            >
              {language === 'fr' ? 'Fermer' : 'Close'}
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {mode === 'grades' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">
                {language === 'fr'
                  ? 'Options de Prévisualisation'
                  : 'Preview Options'}
              </h4>
              <div className="flex gap-3">
                <Button
                  onClick={onPreviewInGoogleSheets}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isLoading}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {language === 'fr'
                    ? 'Voir dans Google Sheets'
                    : 'View in Google Sheets'}
                </Button>
                <Button
                  onClick={onDownloadPreview}
                  variant="outline"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  disabled={isLoading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Télécharger Excel' : 'Download Excel'}
                </Button>
              </div>
            </div>
          )}

          {mode === 'file' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">
                {language === 'fr'
                  ? 'Informations du Fichier'
                  : 'File Information'}
              </h4>
              <p className="text-sm text-blue-700">
                <strong>{language === 'fr' ? 'Nom' : 'Name'}:</strong>{' '}
                {fileName}
                <br />
                <strong>{language === 'fr' ? 'Type' : 'Type'}:</strong> Excel
                Spreadsheet
              </p>
            </div>
          )}

          {data.length > 0 && (
            <div className="bg-white rounded shadow p-4 border border-gray-200">
              <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {mode === 'grades'
                  ? language === 'fr'
                    ? `Aperçu des Données (${data.length} lignes)`
                    : `Data Preview (${data.length} rows)`
                  : language === 'fr'
                    ? 'Aperçu du Fichier (10 premières lignes)'
                    : 'File Preview (First 10 rows)'}
              </h4>
              <div className="overflow-x-auto overflow-y-auto max-h-96 border border-gray-200 rounded">
                <table className="min-w-full text-xs">
                  <tbody>
                    {data.map((row, i) => (
                      <tr
                        key={i}
                        className={
                          i === 0
                            ? 'bg-gray-100 font-semibold sticky top-0'
                            : ''
                        }
                      >
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className="border px-2 py-1 whitespace-nowrap"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {mode === 'file' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">
                ⚠️ Important
              </h4>
              <p className="text-sm text-yellow-700">
                {language === 'fr'
                  ? "Veuillez examiner le contenu du fichier ci-dessus. Une fois que vous l'avez approuvé, ce fichier sera téléchargé dans la base de données et ne pourra plus être annulé."
                  : 'Please review the file content above. Once you approve, this file will be uploaded to the database and cannot be undone.'}
              </p>
            </div>
          )}

          {mode === 'grades' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">
                ✅ Données Sauvegardées
              </h4>
              <p className="text-sm text-green-700">
                {language === 'fr'
                  ? 'Vos modifications ont été sauvegardées automatiquement. Vous pouvez maintenant prévisualiser ou télécharger le fichier.'
                  : 'Your changes have been automatically saved. You can now preview or download the file.'}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {language === 'fr' ? 'Annuler' : 'Cancel'}
          </Button>
          {mode === 'file' && onApprove && (
            <Button
              onClick={onApprove}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  {language === 'fr' ? 'Téléchargement...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  {language === 'fr'
                    ? 'Approuver et Télécharger'
                    : 'Approve & Upload'}
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
