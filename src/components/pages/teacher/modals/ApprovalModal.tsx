import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  message?: string;
  isLoading?: boolean;
  t: (key: string) => string;
  language: string;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  message,
  isLoading,
  t,
  language,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {language === 'fr'
              ? 'Confirmer la suppression'
              : 'Confirm Deletion'}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {message ||
            (language === 'fr'
              ? 'Êtes-vous sûr de vouloir supprimer cet élément ?'
              : 'Are you sure you want to delete this item?')}
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <Button onClick={onClose} variant="outline" disabled={isLoading}>
            {language === 'fr' ? 'Annuler' : 'Cancel'}
          </Button>
          <Button onClick={onApprove} disabled={isLoading}>
            {language === 'fr' ? 'Supprimer' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalModal;
