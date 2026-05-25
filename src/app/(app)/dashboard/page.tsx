
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, BookCheck, RotateCw, BarChart, Users, Gamepad2, Loader2, Trash2, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { DashboardChart } from "@/components/dashboard-chart";
import { useAuth } from "@/context/auth-context";
import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, getDocs, writeBatch, query, where } from "firebase/firestore";
import type { AnalyticsEvent } from "@/lib/types";
import { subDays, format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type VocabularyLevel = "Beginner" | "Intermediate" | "Advanced";

function DashboardPageComponent() {
  const { user, userProfile, isAdmin, isGuest } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  // State for admin
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);


  // Fetch analytics data
  const analyticsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    if (isAdmin) {
        return collection(firestore, 'analytics');
    }
    return query(collection(firestore, 'analytics'), where('userId', '==', user.uid));
  }, [firestore, isAdmin, user]);

  const { data: analyticsEvents, isLoading: isDataLoading } = useCollection<AnalyticsEvent>(analyticsQuery);

  const stats = useMemo(() => {
    if (!analyticsEvents) {
      return null;
    }
    
    const gamePlays = analyticsEvents.filter(e => e.type === 'game_played');
    const articleReads = analyticsEvents.filter(e => e.type === 'article_read');
    const exercises = analyticsEvents.filter(e => e.type === 'exercise_generated');

    const gameCounts = gamePlays.reduce((acc, game) => {
        const title = game.details?.title || 'Unknown Game';
        acc[title] = (acc[title] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

     const articleCounts = articleReads.reduce((acc, article) => {
        const title = article.details?.title || 'Unknown Article';
        acc[title] = (acc[title] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const mostPlayedGame = Object.keys(gameCounts).length > 0
        ? Object.entries(gameCounts).sort((a, b) => b[1] - a[1])[0][0]
        : 'N/A';
        
    const mostReadArticle = Object.keys(articleCounts).length > 0
        ? Object.entries(articleCounts).sort((a, b) => b[1] - a[1])[0][0]
        : 'N/A';

    const today = new Date();
    const weeklyData = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(today, i);
        return {
            day: format(date, 'EEEE'),
            games: 0,
            exercises: 0,
        };
    }).reverse();

    analyticsEvents.forEach(event => {
        const eventDate = event.createdAt?.toDate ? event.createdAt.toDate() : null;
        if(eventDate) {
            const dayName = format(eventDate, 'EEEE');
            const dayIndex = weeklyData.findIndex(d => d.day === dayName);
            if(dayIndex !== -1) {
                if(event.type === 'game_played') {
                    weeklyData[dayIndex].games++;
                } else if (event.type === 'exercise_generated') {
                    weeklyData[dayIndex].exercises++;
                }
            }
        }
    });

    const totalXP = analyticsEvents.length;
    let level: VocabularyLevel = "Beginner";
    if (totalXP > 100) level = "Advanced";
    else if (totalXP > 25) level = "Intermediate";

    return {
        totalEvents: analyticsEvents.length,
        mostPlayedGame,
        mostReadArticle,
        weeklyChartData: weeklyData,
        level,
        quizzesPassed: gamePlays.length,
        articlesRead: articleReads.length,
    };
  }, [analyticsEvents]);

  const handleResetAnalytics = async () => {
    if (!firestore || !isAdmin) return;
    setIsResetting(true);
    try {
        const analyticsCollection = collection(firestore, 'analytics');
        const analyticsSnapshot = await getDocs(analyticsCollection);
        if (analyticsSnapshot.empty) {
            toast({ title: "No records to reset." });
            setIsResetting(false);
            setIsResetDialogOpen(false);
            return;
        }
        const batch = writeBatch(firestore);
        analyticsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        toast({ title: "Success", description: "All analytics records have been deleted." });
    } catch (error) {
        console.error("Error resetting analytics:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not reset analytics records." });
    } finally {
        setIsResetting(false);
        setIsResetDialogOpen(false);
    }
  };

  useEffect(() => {
      if (isGuest) {
          router.replace('/games');
      }
  }, [isGuest, router]);
  
  if (isGuest) {
      return null;
  }
  
  const cardClasses = "bg-white text-black shadow-lg transition-transform duration-200 hover:scale-105";

  if (isAdmin) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Bento Grid Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Welcome Admin Box */}
          <div className="glass-card p-6 md:col-span-2 rounded-3xl flex flex-col justify-between relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-600/10 opacity-50 pointer-events-none" />
            <div className="space-y-2 relative z-10">
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">System Overview</span>
              <h1 className="text-3xl font-black tracking-tight text-white">Admin Analytics Dashboard</h1>
              <p className="text-zinc-400 text-sm max-w-lg">
                Real-time metrics and interactions monitor. Track engagement, games played, and generated content across the platform.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-zinc-500 font-bold">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
              Live Server Engine Running
            </div>
          </div>

          {/* Controls Bento Box */}
          <div className="glass-card p-6 rounded-3xl flex flex-col justify-between border border-red-500/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-red-500/5 opacity-30 pointer-events-none" />
            <div className="space-y-2 relative z-10">
              <span className="text-[10px] uppercase font-black tracking-widest text-rose-400">Developer Actions</span>
              <h3 className="text-lg font-bold text-white">Database Controls</h3>
              <p className="text-xs text-zinc-400">
                Purge log entries and reset global system metrics across all active users.
              </p>
            </div>
            <div className="mt-4 relative z-10">
              <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full bg-red-600/80 hover:bg-red-655 text-white font-extrabold h-10 rounded-xl shadow-lg shadow-red-600/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reset System Records
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-card border border-white/10 rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white font-black">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400 text-sm">
                      This action cannot be undone. This will permanently delete all global analytics logs, resets XP scores, and removes reading history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isResetting} className="border border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800 font-bold rounded-xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetAnalytics} disabled={isResetting} className="bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl">
                      {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirm Global Purge
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {isDataLoading && <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-400" /></div>}

        {stats && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {/* Bento Stat Card 1 */}
            <div className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Total Interactions</span>
                  <h4 className="text-3xl font-black text-white mt-1">+{stats.totalEvents}</h4>
                </div>
                <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                  <BarChart className="h-5 w-5 text-indigo-400" />
                </div>
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-4">Across all active classrooms and guests.</p>
            </div>

            {/* Bento Stat Card 2 */}
            <div className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Most Popular Game</span>
                  <h4 className="text-lg font-black text-white truncate max-w-[200px] mt-1" title={stats.mostPlayedGame}>{stats.mostPlayedGame}</h4>
                </div>
                <div className="p-2.5 bg-green-500/10 rounded-xl border border-green-500/20">
                  <Gamepad2 className="h-5 w-5 text-green-400" />
                </div>
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-4">Highest engagement game in LingoLand.</p>
            </div>

            {/* Bento Stat Card 3 */}
            <div className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Highest Read Article</span>
                  <h4 className="text-lg font-black text-white truncate max-w-[200px] mt-1" title={stats.mostReadArticle}>{stats.mostReadArticle}</h4>
                </div>
                <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <BookCheck className="h-5 w-5 text-purple-400" />
                </div>
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-4">Top read resource in Reader hub.</p>
            </div>

            {/* Large Activity Chart Bento Box */}
            <div className="glass-card p-6 rounded-3xl md:col-span-3 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
              <div className="mb-6">
                <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">Weekly Performance</span>
                <h3 className="text-xl font-black text-white">Global Activity Register</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Games played and smart exercises generated.</p>
              </div>
              <div className="w-full h-80 bg-zinc-950/20 p-2 rounded-2xl border border-zinc-900/60">
                <DashboardChart data={stats.weeklyChartData} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default dashboard for regular users
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Bento Grid Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Welcome Card Box */}
        <div className="glass-card p-6 md:col-span-2 rounded-3xl flex flex-col justify-between relative overflow-hidden group shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-600/10 opacity-50 pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">Welcome Back</span>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Hi, {userProfile?.displayName || "Learner"}!
            </h1>
            <p className="text-zinc-400 text-sm max-w-md">
              Here is a live snapshot of your learning path. Keep up the excellent work and master your next subject!
            </p>
          </div>
          <div className="mt-4 relative z-10 flex items-center gap-2 text-xs text-indigo-300 font-bold">
            <Sparkles className="h-4 w-4 animate-pulse text-amber-405" />
            AI Study Buddy Online
          </div>
        </div>

        {/* Daily Progress & Vocabulary Level Box */}
        {stats && (
          <div className="glass-card p-6 rounded-3xl flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
            <div className="space-y-1 relative z-10">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Daily Progress</span>
                <Zap className="h-4 w-4 text-indigo-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white mt-1">Vocab Level: {stats.level}</h3>
              <p className="text-xs text-zinc-500 font-semibold">Total Score: {stats.totalEvents} XP</p>
            </div>
            <div className="mt-4 relative z-10 space-y-1.5">
              <div className="flex justify-between text-[10px] text-zinc-500 font-bold">
                <span>XP Progress</span>
                <span>{stats.level === 'Beginner' ? '33%' : stats.level === 'Intermediate' ? '66%' : '100%'}</span>
              </div>
              <Progress value={stats.level === 'Beginner' ? 33 : stats.level === 'Intermediate' ? 66 : 100} className="h-2 bg-zinc-950/60" />
            </div>
          </div>
        )}
      </div>

      {isDataLoading && <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-400" /></div>}

      {stats && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {/* Bento Stat Card 1 - Games Completed */}
          <div className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Recommended Lessons Completed</span>
                <h4 className="text-3xl font-black text-white mt-1">+{stats.quizzesPassed}</h4>
              </div>
              <div className="p-2.5 bg-green-500/10 rounded-xl border border-green-500/20">
                <Trophy className="h-5 w-5 text-green-400" />
              </div>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-4">Real-time educational mission count.</p>
          </div>

          {/* Bento Stat Card 2 - New Words & Articles Read */}
          <div className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">New Words & Reads</span>
                <h4 className="text-3xl font-black text-white mt-1">+{stats.articlesRead}</h4>
              </div>
              <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <BookCheck className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-4">Your reading and vocab history.</p>
          </div>

          {/* Bento Card 3 - Recommended Lesson Quick Link */}
          <div className="glass-card p-6 rounded-3xl flex flex-col justify-between border border-indigo-500/20 hover:-translate-y-1 transition-all duration-300 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-40 pointer-events-none" />
            <div className="space-y-1 relative z-10">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">Recommended Lesson</span>
                <BookOpen className="h-4 w-4 text-indigo-400" />
              </div>
              <h4 className="text-base font-bold text-white mt-1">Vocab Voyage</h4>
              <p className="text-[10px] text-zinc-400 italic">Advanced Vocabulary & Context</p>
            </div>
            <div className="mt-4 relative z-10">
              <Button onClick={() => router.push("/games")} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 font-extrabold h-9 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 transition-all hover:scale-[1.02] text-xs">
                Play Lesson Now
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Weekly Progress Chart Bento Box */}
          <div className="glass-card p-6 rounded-3xl md:col-span-3 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            <div className="mb-6">
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">Analytics Tracker</span>
              <h3 className="text-xl font-black text-white">Your Weekly Progress</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Track your interaction and learning metrics over the past 7 days.</p>
            </div>
            <div className="w-full h-80 bg-zinc-950/20 p-2 rounded-2xl border border-zinc-900/60">
              <DashboardChart data={stats.weeklyChartData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


const DashboardPage = dynamic(() => Promise.resolve(DashboardPageComponent), { ssr: false });

export default DashboardPage;
