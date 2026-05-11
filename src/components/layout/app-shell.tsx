"use client";

import { useEffect, type ReactNode } from "react";
import dynamic from 'next/dynamic';
import { SidebarProvider, Sidebar, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

// Dynamically import AppSidebar with SSR turned off
const AppSidebar = dynamic(() => import('@/components/layout/app-sidebar').then(mod => mod.AppSidebar), {
  ssr: false,
});

// Wrapper component to manage hover states since it needs access to useSidebar
function HoverSidebarWrapper({ children }: { children: ReactNode }) {
  const { setOpen, isMobile } = useSidebar();

  // Initialize as collapsed on desktop
  useEffect(() => {
    if (!isMobile) {
      setOpen(false);
    }
  }, [isMobile, setOpen]);

  return (
    <Sidebar 
      collapsible="icon" 
      onMouseEnter={() => !isMobile && setOpen(true)}
      onMouseLeave={() => !isMobile && setOpen(false)}
    >
      {children}
    </Sidebar>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const isMounted = useIsMounted();
  const { isLoading, authAction } = useAuth();

  if (!isMounted) {
    return null;
  }
  
  if (isLoading && !authAction) {
    return null; // Don't render the shell while auth is loading, AuthProvider will show its own screen
  }

  // We set defaultOpen to false here so it initializes cleanly, 
  // though HoverSidebarWrapper also enforces it via useEffect
  return (
    <SidebarProvider defaultOpen={false}>
      <HoverSidebarWrapper>
        <AppSidebar />
      </HoverSidebarWrapper>
      <SidebarInset>
        <div className="flex h-screen min-h-svh flex-col">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
            <div className="relative z-10">
              {children}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
