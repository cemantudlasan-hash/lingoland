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
      <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
         >
            <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -ml-10 -mb-10" />
              
              <CardHeader className="text-center pb-2 relative z-10">
                <div className="mx-auto bg-amber-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <ShieldAlert className="h-8 w-8 text-amber-500" />
                </div>
                <CardTitle className="text-2xl font-black tracking-tight text-foreground">Teacher Access Required</CardTitle>
                <CardDescription className="text-muted-foreground text-base mt-2">
                  The Students Record gradebook is a dedicated workspace for registered educators to manage their classes and track student performance.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-6 relative z-10 p-6">
                <Button className="w-full h-12 text-base font-bold" asChild>
                   <Link href="/auth?mode=login">
                      <LogIn className="mr-2 h-5 w-5" /> Log in to your account
                   </Link>
                </Button>
                <Button variant="outline" className="w-full h-12 text-base font-bold" asChild>
                   <Link href="/auth?mode=signup">
                      <UserPlus className="mr-2 h-5 w-5" /> Create a Teacher Account
                   </Link>
                </Button>
              </CardContent>
            </Card>
         </motion.div>
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
