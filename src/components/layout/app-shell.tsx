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
  const { isLoading, authAction } = useAuth();
  const pathname = usePathname();

  if (!isMounted) {
    return null;
  }
  
  if (isLoading && !authAction) {
    return null; // Don't render the shell while auth is loading, AuthProvider will show its own screen
  }

  if (pathname === '/') {
    return <div className="min-h-screen w-full overflow-x-hidden">{children}</div>;
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
