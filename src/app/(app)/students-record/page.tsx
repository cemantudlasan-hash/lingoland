"use client";

import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardList, ShieldAlert, LogIn, UserPlus, ArrowLeft, Sparkles, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { StudentsTable } from "@/components/students-record/students-table";

export default function StudentsRecordPage() {
  const { user, isGuest } = useAuth();

  // If the user is a guest, display a highly polished restricted access screen
  if (isGuest || !user) {
    return (
      <div className="w-full h-full p-8 md:p-12 flex justify-center items-center">
        <Card className="max-w-md w-full bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative text-center space-y-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
            <ClipboardList className="h-8 w-8 animate-bounce" />
          </div>
          <CardHeader className="p-0">
            <CardTitle className="text-2xl font-black text-white bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
              Roster Restricted
            </CardTitle>
            <CardDescription className="text-slate-400 mt-2 text-sm leading-relaxed">
              Student tracking, performance logs, and assignment grades are exclusive features for registered classroom coordinators.
            </CardDescription>
          </CardHeader>
          <Button asChild className="w-full h-11 bg-gradient-to-r from-purple-500 to-indigo-650 font-bold rounded-xl active:scale-95 transition-all">
            <Link href="/auth">Sign In or Create Account</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // If authenticated, display the redesigned premium Students Record dashboard
  return (
    <div className="flex-grow overflow-y-auto w-full p-4 md:p-8 relative">
      {/* Dynamic atmospheric background glows */}
      <div className="absolute top-[-5%] left-[5%] w-80 h-80 rounded-full blur-[140px] bg-purple-500/10 pointer-events-none -z-10" />
      <div className="absolute bottom-[-5%] right-[5%] w-80 h-80 rounded-full blur-[140px] bg-indigo-500/10 pointer-events-none -z-10" />

      <div className="max-w-full w-full mx-auto space-y-8">
        
        <Button variant="outline" className="w-fit border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-white rounded-xl h-9 text-xs" asChild>
          <Link href="/dashboard">
             <ArrowLeft className="mr-2 h-4 w-4" />
             Back to Dashboard
          </Link>
        </Button>

        {/* Premium Redesigned Header Banner Card */}
        <Card className="overflow-hidden border-none shadow-2xl relative bg-gradient-to-br from-indigo-950/50 via-purple-950/20 to-slate-900/60 p-8 md:p-10 rounded-3xl border border-slate-800/80">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-350 shadow-inner">
                <ClipboardList className="h-4 w-4 text-indigo-455" />
                <span className="text-xs font-black uppercase tracking-widest">Classroom Management</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
                STUDENTS <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">RECORD</span>
              </h1>
              <p className="text-slate-400 text-sm font-medium max-w-xl leading-relaxed">
                Manage your class roster, track assignments, calculate student performance grades, and organize student database records.
              </p>
            </div>
            
            <div className="flex gap-4 shrink-0 flex-wrap">
              <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl text-center min-w-[130px] shadow-inner flex flex-col items-center justify-center">
                <Users className="h-5 w-5 text-indigo-400 mb-1 animate-pulse" />
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 block mb-0.5">Roster Mode</span>
                <span className="text-xs font-black text-indigo-300">Roster Active</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Roster Table Workspace */}
        <div className="rounded-3xl bg-slate-900/40 border border-slate-800/80 p-6 shadow-xl">
          <StudentsTable />
        </div>
      </div>
    </div>
  );
}
