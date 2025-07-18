import React, { useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: { name: string } | null;
  email: string;
  message: string;
  onEmailChange: (val: string) => void;
  onMessageChange: (val: string) => void;
  onShare: () => void;
  isLoading?: boolean;
  t: (key: string) => string;
  language: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  file,
  email,
  message,
  onEmailChange,
  onMessageChange,
  onShare,
  isLoading,
  t,
  language,
}) => {
  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isOpen && emailRef.current) {
      emailRef.current.focus();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('importExport.shareFile') ||
              (language === 'fr' ? 'Partager le fichier' : 'Share File')}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          <div className="mb-4">
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
              {t('importExport.fileToShare') ||
                (language === 'fr' ? 'Fichier à partager' : 'File to share')}
            </div>
            <div className="font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded px-3 py-2">
              {file?.name}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('importExport.recipientEmail') ||
                (language === 'fr'
                  ? 'E-mail du destinataire'
                  : 'Recipient Email')}
            </label>
            <Input
              ref={emailRef}
              type="email"
              value={email}
              onChange={e => onEmailChange(e.target.value)}
              placeholder={
                t('importExport.emailPlaceholder') ||
                (language === 'fr'
                  ? 'Entrer une adresse e-mail...'
                  : 'Enter an email address...')
              }
              disabled={isLoading}
              className="w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('importExport.message') ||
                (language === 'fr' ? 'Message' : 'Message')}
            </label>
            <Textarea
              value={message}
              onChange={e => onMessageChange(e.target.value)}
              placeholder={
                t('importExport.messagePlaceholder') ||
                (language === 'fr'
                  ? 'Message facultatif...'
                  : 'Optional message...')
              }
              disabled={isLoading}
              className="w-full min-h-[80px]"
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={onClose} variant="outline" disabled={isLoading}>
              {t('importExport.cancel') ||
                (language === 'fr' ? 'Annuler' : 'Cancel')}
            </Button>
            <Button
              onClick={onShare}
              disabled={isLoading || !email}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm"
            >
              {isLoading ? (
                <span>
                  {t('importExport.sharing') ||
                    (language === 'fr' ? 'Partage...' : 'Sharing...')}
                </span>
              ) : (
                t('importExport.share') ||
                (language === 'fr' ? 'Partager' : 'Share')
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
