import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useToast } from './use-toast';

interface UseProfileImageOptions {
  userId: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useProfileImage({
  userId,
  onSuccess,
  onError,
}: UseProfileImageOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadProfileImage = useMutation({
    mutationFn: async (imageFile: File) => {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('userId', userId.toString());

      const response = await apiRequest(
        'POST',
        '/api/users/profile-image',
        formData
      );
      if (!response) throw new Error('Failed to upload profile image');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload profile image');
      }
      return response.json();
    },
    onSuccess: data => {
      toast({
        title: 'Success',
        description: 'Profile image updated successfully',
      });
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/auth/login'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload profile image',
        variant: 'destructive',
      });
      onError?.(error);
    },
  });

  const removeProfileImage = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        'DELETE',
        `/api/users/profile-image?userId=${userId}`
      );
      if (!response) throw new Error('Failed to remove profile image');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove profile image');
      }
      return response.json();
    },
    onSuccess: data => {
      toast({
        title: 'Success',
        description: 'Profile image removed successfully',
      });
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/auth/login'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove profile image',
        variant: 'destructive',
      });
      onError?.(error);
    },
  });

  const handleUpload = async (imageFile: File) => {
    setIsUploading(true);
    try {
      await uploadProfileImage.mutateAsync(imageFile);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeProfileImage.mutateAsync();
    } finally {
      setIsRemoving(false);
    }
  };

  return {
    uploadProfileImage: handleUpload,
    removeProfileImage: handleRemove,
    isUploading: isUploading || uploadProfileImage.isPending,
    isRemoving: isRemoving || removeProfileImage.isPending,
    uploadError: uploadProfileImage.error,
    removeError: removeProfileImage.error,
  };
}
