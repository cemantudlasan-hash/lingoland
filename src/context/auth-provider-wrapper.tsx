
"use client";

import { AuthProvider } from './auth-context';
import { Toaster } from '@/components/ui/toaster';
import type { ReactNode } from 'react';

export function AuthProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
        {children}
        <Toaster />
    </AuthProvider>
  )
}
