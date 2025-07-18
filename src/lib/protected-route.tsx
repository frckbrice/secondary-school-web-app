'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles = ['admin', 'super_admin', 'teacher', 'student'],
  redirectTo,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // No user logged in, redirect to login
        router.push('/auth?mode=login');
        return;
      }

      // Check if user has the required role
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // User doesn't have the required role, redirect based on their actual role
        if (user.role === 'admin' || user.role === 'super_admin') {
          router.push('/admin');
        } else if (user.role === 'teacher') {
          router.push('/teacher');
        } else if (user.role === 'student') {
          router.push('/student-portal');
        } else {
          // Fallback to home page
          router.push('/');
        }
        return;
      }

      // User is authenticated and has the required role
      // Check if they're on the right path for their role
      const currentPath = pathname;

      if (user.role === 'admin' || user.role === 'super_admin') {
        // Admin users should be on admin routes
        if (!currentPath.startsWith('/admin') && !redirectTo) {
          router.push('/admin');
          return;
        }
      } else if (user.role === 'teacher') {
        // Teacher users should be on teacher routes
        if (!currentPath.startsWith('/teacher') && !redirectTo) {
          router.push('/teacher');
          return;
        }
      } else if (user.role === 'student') {
        // Student users should be on student routes
        if (!currentPath.startsWith('/student-portal') && !redirectTo) {
          router.push('/student-portal');
          return;
        }
      }

      // If redirectTo is specified and user is not on that path, redirect
      if (redirectTo && currentPath !== redirectTo) {
        router.push(redirectTo);
        return;
      }
    }
  }, [user, isLoading, allowedRoles, redirectTo, router, pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render children if user is not authenticated or doesn't have the required role
  if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
