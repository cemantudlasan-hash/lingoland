
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen">
        <AppShell>
            {children}
        </AppShell>
    </div>
  );
}
