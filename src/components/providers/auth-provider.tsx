'use client';

import React from 'react';
import { AuthProvider as CustomAuthProvider } from '../../hooks/use-auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <CustomAuthProvider>{children}</CustomAuthProvider>;
}
