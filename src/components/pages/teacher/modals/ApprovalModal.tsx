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
            {t('importExport.confirmApproval') ||
              (language === 'fr'
                ? "Confirmer l'approbation"
                : 'Confirm Approval')}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {message ||
            t('importExport.confirmApprovalMessage') ||
            (language === 'fr'
              ? 'Êtes-vous sûr de vouloir approuver cette action ?'
              : 'Are you sure you want to approve this action?')}
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <Button onClick={onClose} variant="outline" disabled={isLoading}>
            {t('importExport.cancel') ||
              (language === 'fr' ? 'Annuler' : 'Cancel')}
          </Button>
          <Button onClick={onApprove} disabled={isLoading}>
            {t('importExport.approve') ||
              (language === 'fr' ? 'Approuver' : 'Approve')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalModal;
