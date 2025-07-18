import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { useLanguage } from '../../../../hooks/use-language';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
  isLoading?: boolean;
}

const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  isLoading,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { language } = useLanguage();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImport(e.target.files[0]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {language === 'fr' ? 'Importer un Fichier' : 'Import File'}
          </DialogTitle>
        </DialogHeader>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        <div className="flex justify-end mt-4">
          <Button onClick={onClose} variant="outline" disabled={isLoading}>
            {language === 'fr' ? 'Annuler' : 'Cancel'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportModal;
