"use client";

import { type ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { usePathname } from 'next/navigation';
import { useAuth } from "@/context/auth-context";
import { DonationPopup } from "@/components/layout/donation-popup";
import { FloatingPetWidget } from "@/components/layout/floating-pet-widget";
import { DailyLoginModal } from "@/components/layout/daily-login-modal";

export function AppShell({ children }: { children: ReactNode }) {
  const isMounted = useIsMounted();
  const pathname = usePathname();
  if (pathname === '/') {
    return (
      <div className="min-h-screen w-full overflow-x-hidden relative" suppressHydrationWarning>
        {children}
        {isMounted && <FloatingPetWidget />}
      </div>
    );
  }

  if (!isMounted) {
    return null;
  }

  const { isLoading, authAction } = useAuth();
  if (isLoading && !authAction) {
    return (
      <div className="flex h-screen min-h-svh flex-col bg-background text-foreground items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading LingoLand...</p>
        </div>
      </div>
    );
  }

  // Inside tabs/pages: no sidebar is rendered. Header has "Back to Menu" button returning to cockpit.
  return (
    <div className="flex h-screen min-h-svh flex-col bg-background text-foreground">
      <AppHeader />
      <main className="flex-1 min-h-0 overflow-y-auto p-3 md:p-4 lg:p-5 relative flex flex-col">
        {children}
        <DailyLoginModal />
        <DonationPopup />
        <FloatingPetWidget />
      </main>
    </div>
  );
}
