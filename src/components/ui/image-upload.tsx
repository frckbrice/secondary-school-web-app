'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from './button';
import { Progress } from './progress';
import { useImageUpload, UploadResult } from '../../hooks/use-image-upload';
import { useLanguage } from '../../hooks/use-language';
import { cn } from '../../lib/utils';

export interface ImageUploadProps {
  onUpload?: (results: UploadResult[]) => void;
  onRemove?: (publicId: string) => void;
  maxFiles?: number;
  maxSize?: number;
  folder?: string;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  acceptedTypes?: string[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  onRemove,
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024,
  folder = 'gbhs-bafia',
  className,
  disabled = false,
  showPreview = true,
  acceptedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
}) => {
  const [uploadedImages, setUploadedImages] = useState<UploadResult[]>([]);
  const { language } = useLanguage();

  const { uploadImages, isUploading, progress } = useImageUpload({
    maxFiles,
    maxSize,
    allowedTypes: acceptedTypes,
    folder,
    onSuccess: results => {
      setUploadedImages(prev => [...prev, ...results]);
      onUpload?.(results);
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled || isUploading) return;

      try {
        await uploadImages(acceptedFiles);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    },
    [uploadImages, disabled, isUploading]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        'image/*': acceptedTypes,
      },
      maxFiles,
      maxSize,
      disabled: disabled || isUploading,
    });

  const handleRemove = (publicId: string) => {
    setUploadedImages(prev => prev.filter(img => img.public_id !== publicId));
    onRemove?.(publicId);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive && !isDragReject && 'border-blue-500 bg-blue-50',
          isDragReject && 'border-red-500 bg-red-50',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'hover:border-gray-400 hover:bg-gray-50'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-2">
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">
                {language === 'fr' ? 'Téléchargement...' : 'Uploading...'}
              </p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {isDragActive
                    ? language === 'fr'
                      ? 'Déposez les images ici'
                      : 'Drop images here'
                    : language === 'fr'
                      ? 'Glissez-déposez des images'
                      : 'Drag & drop images'}
                </p>
                <p className="text-xs text-gray-500">
                  {language === 'fr'
                    ? `ou cliquez pour sélectionner (max ${maxFiles} fichiers, ${Math.round(maxSize / (1024 * 1024))}MB chacun)`
                    : `or click to select (max ${maxFiles} files, ${Math.round(maxSize / (1024 * 1024))}MB each)`}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && progress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{language === 'fr' ? 'Progression' : 'Progress'}</span>
            <span>{Math.round(progress.percentage)}%</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </div>
      )}

      {/* Image Previews */}
      {showPreview && uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedImages.map(image => (
            <div key={image.public_id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={image.secure_url}
                  alt="Uploaded"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(image.public_id)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title={language === 'fr' ? 'Supprimer' : 'Remove'}
              >
                <X className="h-3 w-3" />
              </button>

              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="truncate">{image.format.toUpperCase()}</p>
                <p>
                  {image.width} × {image.height}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {uploadedImages.length > 0 && (
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>
            {language === 'fr'
              ? `${uploadedImages.length} image(s) téléchargée(s)`
              : `${uploadedImages.length} image(s) uploaded`}
          </span>
        </div>
      )}

      {/* Error Display */}
      {isDragReject && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>
            {language === 'fr'
              ? 'Type de fichier non supporté'
              : 'Unsupported file type'}
          </span>
        </div>
      )}
    </div>
  );
};

// Single Image Upload Component
export const SingleImageUpload: React.FC<
  Omit<ImageUploadProps, 'maxFiles'> & {
    value?: string;
    onChange?: (url: string) => void;
  }
> = ({ value, onChange, ...props }) => {
  const [uploadedImage, setUploadedImage] = useState<UploadResult | null>(null);
  const { language } = useLanguage();

  const handleUpload = (results: UploadResult[]) => {
    if (results.length > 0) {
      const image = results[0];
      setUploadedImage(image);
      onChange?.(image.secure_url);
    }
  };

  const handleRemove = () => {
    setUploadedImage(null);
    onChange?.('');
  };

  return (
    <div className="space-y-4">
      {/* Current Image Display */}
      {(value || uploadedImage) && (
        <div className="relative group">
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={uploadedImage?.secure_url || value || ''}
              alt="Current"
              width={200}
              height={200}
              className="w-full h-full object-cover"
            />
          </div>

          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            title={language === 'fr' ? 'Supprimer' : 'Remove'}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <ImageUpload
        {...props}
        maxFiles={1}
        onUpload={handleUpload}
        showPreview={false}
      />
    </div>
  );
};
