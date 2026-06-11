
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { getUserProfile } from '@/lib/user';
import type { UserProfile } from '@/lib/types';
import { AuthLoadingScreen } from '@/components/layout/auth-loading-screen';

const ADMIN_EMAIL = "cemantudlasan2@gmail.com";

type AuthAction = 'login' | 'logout' | null;

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isGuest: boolean;
  loginAsGuest: () => void;
  logoutGuest: () => void;
  refreshUserProfile: () => Promise<void>;
  authAction: AuthAction;
  setAuthAction: (action: AuthAction) => void;
};

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    userProfile: null, 
    isLoading: true,
    isAdmin: false,
    isGuest: false,
    loginAsGuest: () => {},
    logoutGuest: () => {},
    refreshUserProfile: async () => {},
    authAction: null,
    setAuthAction: () => {},
});

const protectedRoutes = ['/dashboard', '/profile', '/study-room'];


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [authAction, setAuthAction] = useState<AuthAction>(null);

  const refreshUserProfile = useCallback(async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    }
  }, [user]);

  const handleSetAuthAction = (action: AuthAction) => {
    setAuthAction(action);
    if (action) {
      setTimeout(() => setAuthAction(null), 2500); // Animation duration
    }
  };


  const clearCompanionAndDonationSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('ai_usage_count');
      sessionStorage.removeItem('ai_popup_shown');
      sessionStorage.removeItem('donation_popup_shown');
      sessionStorage.removeItem('lingoland_classroom_games_played');
      sessionStorage.removeItem('lingoland_donation_games_target');
      
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('lingoland_floating_pet_closed')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => sessionStorage.removeItem(k));
    }
  }, []);

  useEffect(() => {
    // Check for session storage guest status on initial load
    const guestStatus = sessionStorage.getItem('isGuest');
    if (guestStatus === 'true') {
        setIsGuest(true);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        setIsGuest(false); // Real user logged in, not a guest
        sessionStorage.removeItem('isGuest');
        setIsAdmin(user.email === ADMIN_EMAIL);
        // Clear companion closed state and donation triggers on login
        clearCompanionAndDonationSession();
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        // When user is null, it means they logged out.
        // We should ensure they are not considered a guest unless they explicitly log in as one.
        if (sessionStorage.getItem('isGuest') !== 'true') {
            setIsGuest(false);
        }
        setIsAdmin(false);
        setUserProfile(null);
        // Clear companion closed state and donation triggers on logout
        clearCompanionAndDonationSession();
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [clearCompanionAndDonationSession]);

  const loginAsGuest = () => {
    if (user) { // if a real user is logged in, sign them out first
        auth.signOut();
    }
    setIsGuest(true);
    sessionStorage.setItem('isGuest', 'true');
    // Clear companion closed state and donation triggers on guest login
    clearCompanionAndDonationSession();
  };

  const logoutGuest = () => {
    setIsGuest(false);
    sessionStorage.removeItem('isGuest');
    // Clear companion closed state and donation triggers on guest logout
    clearCompanionAndDonationSession();
  };
  
  const contextValue = {
      user,
      userProfile,
      isLoading,
      isAdmin,
      isGuest,
      loginAsGuest,
      logoutGuest,
      refreshUserProfile,
      authAction,
      setAuthAction: handleSetAuthAction,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {authAction && <AuthLoadingScreen action={authAction} />}
      <AuthGuard>{children}</AuthGuard>
    </AuthContext.Provider>
  );
};

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isLoading, isGuest } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
      if(isProtectedRoute && !user && !isGuest) {
          router.replace('/auth');
      }
    }
  }, [isLoading, user, isGuest, pathname, router]);

  return <>{children}</>;
}


export const useAuth = () => useContext(AuthContext);

export const useRequireAuth = () => {
    const { user, isLoading, isGuest } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window !== 'undefined' && !isLoading) {
            const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
            if (isProtectedRoute && !user && !isGuest) {
                router.push('/auth');
            }
        }
    }, [user, isLoading, isGuest, router, pathname]);

    return { user, isLoading };
};
