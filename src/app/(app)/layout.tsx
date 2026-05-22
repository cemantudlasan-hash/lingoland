import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { DonationPopup } from "@/components/layout/donation-popup";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen">
        <AppShell>
            {children}
            <DonationPopup />
        </AppShell>
    </div>
  );
}
