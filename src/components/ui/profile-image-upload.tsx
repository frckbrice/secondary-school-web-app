'use client';

import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';
import { useProfileImage } from '../../hooks/use-profile-image';
import { Camera, X, Upload, User } from 'lucide-react';
import { useLanguage } from '../../hooks/use-language';

interface ProfileImageUploadProps {
  userId: string;
  currentImageUrl?: string;
  userName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onImageChange?: (imageUrl: string) => void;
}

export function ProfileImageUpload({
  userId,
  currentImageUrl,
  userName = 'User',
  size = 'md',
  className = '',
  onImageChange,
}: ProfileImageUploadProps) {
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { uploadProfileImage, removeProfileImage, isUploading, isRemoving } =
    useProfileImage({
      userId,
      onSuccess: data => {
        setPreviewUrl(null);
        onImageChange?.(data.profileImageUrl);
      },
    });

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const handleFileSelect = (file: File) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(
          language === 'fr'
            ? 'Veuillez sélectionner un fichier image'
            : 'Please select an image file'
        );
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(
          language === 'fr'
            ? 'La taille du fichier ne doit pas dépasser 5MB'
            : 'File size must not exceed 5MB'
        );
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = e => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload image
      uploadProfileImage(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    if (
      confirm(
        language === 'fr'
          ? 'Êtes-vous sûr de vouloir supprimer votre photo de profil ?'
          : 'Are you sure you want to remove your profile picture?'
      )
    ) {
      removeProfileImage();
      setPreviewUrl(null);
      onImageChange?.('');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayImageUrl = previewUrl || currentImageUrl;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative group">
        <div
          className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Avatar className={`${sizeClasses[size]} cursor-pointer`}>
            <AvatarImage
              src={displayImageUrl}
              alt={language === 'fr' ? 'Photo de profil' : 'Profile picture'}
            />
            <AvatarFallback className="bg-gray-100 text-gray-600">
              <User className={iconSizes[size]} />
            </AvatarFallback>
          </Avatar>

          {/* Upload overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className={`${iconSizes[size]} text-white`} />
          </div>

          {/* Loading overlay */}
          {(isUploading || isRemoving) && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute -bottom-2 -right-2 flex space-x-1">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="w-8 h-8 p-0 rounded-full shadow-md"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isRemoving}
          >
            <Upload className="w-3 h-3" />
          </Button>

          {displayImageUrl && (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="w-8 h-8 p-0 rounded-full shadow-md"
              onClick={handleRemoveImage}
              disabled={isUploading || isRemoving}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* File input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* User info */}
      <div className="text-center">
        <p className="font-medium text-gray-900">{userName}</p>
        <p className="text-sm text-gray-500">
          {language === 'fr'
            ? 'Cliquez pour changer la photo'
            : 'Click to change photo'}
        </p>
      </div>

      {/* Drag and drop hint */}
      <div className="text-xs text-gray-400 text-center">
        {language === 'fr'
          ? 'Glissez-déposez une image ici ou cliquez pour sélectionner'
          : 'Drag and drop an image here or click to select'}
      </div>
    </div>
  );
}
