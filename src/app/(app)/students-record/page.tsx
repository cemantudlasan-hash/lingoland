"use client";

import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardList, ShieldAlert, LogIn, UserPlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { StudentsTable } from "@/components/students-record/students-table";

export default function StudentsRecordPage() {
  const { user, isGuest } = useAuth();

  // If the user is a guest, display the restricted access screen
  if (isGuest || !user) {
    return (
      <div className="w-full h-full p-8 md:p-12">
        <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-[60vh] gap-4 border border-dashed border-border/50 rounded-lg p-12 bg-card/5">
            <UserPlus className="h-16 w-16" />
            <h3 className="text-xl font-bold text-foreground">Please Login to Access the Students Record</h3>
            <p className="text-base">The Students Record is an exclusive feature for our registered members.</p>
            <Button className="mt-2 font-bold px-8 h-10" asChild>
                <Link href="/auth">Log in to your account</Link>
            </Button>
        </div>
      </div>
    );
  }

  // If authenticated, display the full Students Record feature
  return (
    <div className="flex-1 overflow-y-auto w-full p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <Button variant="outline" className="w-fit" asChild>
          <Link href="/dashboard">
             <ArrowLeft className="mr-2 h-4 w-4" />
             Back to Dashboard
          </Link>
        </Button>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-2">
              <ClipboardList className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Classroom Management</span>
            </div>
            <h1 className="text-4xl font-black font-headline tracking-tighter text-foreground">Students Record</h1>
            <p className="text-muted-foreground text-lg">
              Manage your class roster, track assignments, and calculate overall performance grades.
            </p>
          </div>
        </header>

        <StudentsTable />
      </div>
    </div>
  );
}
