import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { useLanguage } from './use-language';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

export interface UseImageUploadOptions {
  maxFiles?: number;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  folder?: string;
  onSuccess?: (results: UploadResult[]) => void;
  onError?: (error: string) => void;
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  const {
    maxFiles = 10,
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
    folder = 'gbhs-XYZ',
    onSuccess,
    onError,
  } = options;

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        return language === 'fr'
          ? `Type de fichier non supporté: ${file.type}`
          : `Unsupported file type: ${file.type}`;
      }

      // Check file size
      if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        return language === 'fr'
          ? `Fichier trop volumineux. Taille maximale: ${maxSizeMB}MB`
          : `File too large. Maximum size: ${maxSizeMB}MB`;
      }

      return null;
    },
    [allowedTypes, maxSize, language]
  );

  const uploadImages = useCallback(
    async (files: File[]): Promise<UploadResult[]> => {
      if (files.length === 0) {
        throw new Error(
          language === 'fr' ? 'Aucun fichier sélectionné' : 'No files selected'
        );
      }

      if (files.length > maxFiles) {
        throw new Error(
          language === 'fr'
            ? `Trop de fichiers. Maximum: ${maxFiles}`
            : `Too many files. Maximum: ${maxFiles}`
        );
      }

      // Validate all files
      for (const file of files) {
        const error = validateFile(file);
        if (error) {
          throw new Error(error);
        }
      }

      setIsUploading(true);
      setProgress(null);

      try {
        const formData = new FormData();
        files.forEach(file => {
          formData.append('images', file);
        });
        formData.append('folder', folder);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const result = await response.json();

        if (result.success && result.data) {
          toast({
            title: language === 'fr' ? 'Succès' : 'Success',
            description:
              language === 'fr'
                ? `${files.length} image(s) téléchargée(s) avec succès`
                : `${files.length} image(s) uploaded successfully`,
          });

          onSuccess?.(result.data);
          return result.data;
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed';

        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: errorMessage,
          variant: 'destructive',
        });

        onError?.(errorMessage);
        throw error;
      } finally {
        setIsUploading(false);
        setProgress(null);
      }
    },
    [maxFiles, validateFile, folder, toast, language, onSuccess, onError]
  );

  const uploadSingleImage = useCallback(
    async (file: File): Promise<UploadResult> => {
      const results = await uploadImages([file]);
      return results[0];
    },
    [uploadImages]
  );

  const deleteImage = useCallback(
    async (publicId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/upload?publicId=${publicId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Delete failed');
        }

        const result = await response.json();

        if (result.success) {
          toast({
            title: language === 'fr' ? 'Succès' : 'Success',
            description:
              language === 'fr' ? 'Image supprimée' : 'Image deleted',
          });
          return true;
        } else {
          throw new Error('Delete failed');
        }
      } catch (error) {
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description:
            language === 'fr' ? 'Échec de la suppression' : 'Delete failed',
          variant: 'destructive',
        });
        return false;
      }
    },
    [toast, language]
  );

  return {
    uploadImages,
    uploadSingleImage,
    deleteImage,
    isUploading,
    progress,
  };
};
