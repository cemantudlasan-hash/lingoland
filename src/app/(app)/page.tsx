
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function HomePage() {
  const router = useRouter();
  const { user, isGuest, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard');
      } else if (isGuest) {
        router.replace('/games');
      } else {
        router.replace('/auth');
      }
    }
  }, [router, user, isGuest, isLoading]);

  return null; // or a loading spinner
}
