import React, { useRef, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import { Badge } from '../../../ui/badge';
import { Separator } from '../../../ui/separator';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: { name: string; id: string } | null;
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
  const [shareMethod, setShareMethod] = useState<'email' | 'social'>('email');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (isOpen && emailRef.current) {
      emailRef.current.focus();
    }
  }, [isOpen]);

  const handleSocialShare = async (platform: string) => {
    if (!file) return;

    const shareUrl = `${window.location.origin}/api/uploads/${file.id}`;
    const shareText = `${language === 'fr' ? 'Fichier de notes partagé' : 'Grading file shared'}: ${file.name}`;

    let shareLink = '';

    switch (platform) {
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
        return;
      default:
        return;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  const socialPlatforms = [
    { name: 'WhatsApp', icon: '💬', color: '#25D366', platform: 'whatsapp' },
    { name: 'Telegram', icon: '📱', color: '#0088cc', platform: 'telegram' },
    { name: 'Facebook', icon: '📘', color: '#1877f2', platform: 'facebook' },
    { name: 'Twitter', icon: '🐦', color: '#1da1f2', platform: 'twitter' },
    { name: 'LinkedIn', icon: '💼', color: '#0077b5', platform: 'linkedin' },
    { name: 'Copy Link', icon: '📋', color: '#6c757d', platform: 'copy' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl p-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            {t('importExport.shareFile') ||
              (language === 'fr' ? 'Partager le fichier' : 'Share File')}
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          {/* File Info */}
          <div className="mb-4 sm:mb-6">
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              {t('importExport.fileToShare') ||
                (language === 'fr' ? 'Fichier à partager' : 'File to share')}
            </div>
            <div className="font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-3 flex items-center gap-2">
              <span className="text-blue-500">📄</span>
              <span className="truncate">{file?.name}</span>
            </div>
          </div>

          {/* Share Method Tabs */}
          <div className="mb-4 sm:mb-6">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setShareMethod('email')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  shareMethod === 'email'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                📧 {language === 'fr' ? 'Email' : 'Email'}
              </button>
              <button
                onClick={() => setShareMethod('social')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  shareMethod === 'social'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                🌐 {language === 'fr' ? 'Réseaux sociaux' : 'Social'}
              </button>
            </div>
          </div>

          {shareMethod === 'email' ? (
            /* Email Sharing */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  className="w-full min-h-[80px] resize-none"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 text-lg">💡</span>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">
                      {language === 'fr' ? 'Nouveau !' : 'New!'}
                    </p>
                    <p>
                      {language === 'fr'
                        ? "Le fichier sera envoyé directement en pièce jointe. Le destinataire n'a pas besoin de se connecter."
                        : "The file will be sent directly as an attachment. The recipient doesn't need to log in."}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={onShare}
                disabled={isLoading || !email}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {language === 'fr' ? 'Envoi...' : 'Sending...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>📤</span>
                    {language === 'fr' ? 'Envoyer par email' : 'Send via Email'}
                  </div>
                )}
              </Button>
            </div>
          ) : (
            /* Social Sharing */
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {language === 'fr'
                    ? 'Partagez ce fichier sur vos réseaux sociaux préférés'
                    : 'Share this file on your favorite social networks'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {socialPlatforms.map(platform => (
                  <button
                    key={platform.platform}
                    onClick={() => handleSocialShare(platform.platform)}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-800"
                    style={{
                      backgroundColor:
                        platform.platform === 'copy' && copySuccess
                          ? '#10b981'
                          : undefined,
                      color:
                        platform.platform === 'copy' && copySuccess
                          ? 'white'
                          : undefined,
                    }}
                  >
                    <span className="text-2xl">{platform.icon}</span>
                    <span className="text-xs font-medium">
                      {platform.platform === 'copy' && copySuccess
                        ? language === 'fr'
                          ? 'Copié !'
                          : 'Copied!'
                        : platform.name}
                    </span>
                  </button>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 text-lg">ℹ️</span>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-medium mb-1">
                      {language === 'fr' ? 'Comment ça marche' : 'How it works'}
                    </p>
                    <p>
                      {language === 'fr'
                        ? 'Un lien direct vers le fichier sera partagé. Les destinataires pourront le télécharger sans compte.'
                        : 'A direct link to the file will be shared. Recipients can download it without an account.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
