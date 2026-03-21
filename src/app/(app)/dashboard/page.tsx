
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, BookCheck, RotateCw, BarChart, Users, Gamepad2, Loader2, Trash2 } from "lucide-react";
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
       <div className="space-y-6">
        <Card>
            <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-primary-foreground rounded-lg">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Analytics Dashboard</h1>
                        <p className="text-primary-foreground/80">Overview of all user activity on the platform.</p>
                    </div>
                     <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Reset Records
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete all analytics records.
                                This includes game plays, article reads, and exercise generation data for all users.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetAnalytics} disabled={isResetting} className="bg-destructive hover:bg-destructive/90">
                                {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm Reset
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardHeader>
        </Card>
        {isDataLoading && <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>}
        {stats && (
            <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className={cn(cardClasses, "dark:bg-card dark:text-card-foreground")}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Events Logged</CardTitle>
                            <BarChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{stats.totalEvents}</div>
                            <p className="text-xs text-muted-foreground">All user interactions</p>
                        </CardContent>
                    </Card>
                    <Card className={cn(cardClasses, "dark:bg-card dark:text-card-foreground")}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Most Played Game</CardTitle>
                            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold truncate">{stats.mostPlayedGame}</div>
                            <p className="text-xs text-muted-foreground">Across all users</p>
                        </CardContent>
                    </Card>
                    <Card className={cn(cardClasses, "dark:bg-card dark:text-card-foreground")}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Most Read Article</CardTitle>
                            <BookCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold truncate">{stats.mostReadArticle}</div>
                            <p className="text-xs text-muted-foreground">From the Reader section</p>
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader className="bg-gradient-to-b from-white to-slate-50 text-black">
                        <CardTitle>Global Weekly Activity</CardTitle>
                        <CardDescription>Total games played and exercises generated across the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DashboardChart data={stats.weeklyChartData} />
                    </CardContent>
                </Card>
            </>
        )}
       </div>
    )
  }

  // Default dashboard for regular users
  return (
    <div className="space-y-6">
        <Card className="bg-white text-black">
            <CardContent className="pt-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back, {userProfile?.displayName || "friend"}!</h1>
                        <p className="text-muted-foreground">Here's a live snapshot of your progress. Keep up the great work!</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      {isDataLoading && <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>}
      {stats && (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className={cn(cardClasses, "dark:bg-card dark:text-card-foreground")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Vocabulary Level
                    </CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.level}</div>
                    <p className="text-xs text-muted-foreground">
                    Total XP: {stats.totalEvents}
                    </p>
                    <Progress value={stats.level === 'Beginner' ? 33 : stats.level === 'Intermediate' ? 66 : 100} className="mt-2" />
                </CardContent>
                </Card>
                <Card className={cn(cardClasses, "dark:bg-card dark:text-card-foreground")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Games Completed
                    </CardTitle>
                    <Trophy className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{stats.quizzesPassed}</div>
                    <p className="text-xs text-gray-500">
                    Real-time mission count
                    </p>
                </CardContent>
                </Card>
                <Card className={cn(cardClasses, "dark:bg-card dark:text-card-foreground")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Articles Read</CardTitle>
                    <BookCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{stats.articlesRead}</div>
                    <p className="text-xs text-muted-foreground">
                    Your reading history
                    </p>
                </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader className="bg-gradient-to-b from-white to-slate-50 text-black">
                <CardTitle>Your Weekly Progress</CardTitle>
                <CardDescription>
                    Track your engagement and learning over the last week.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <DashboardChart data={stats.weeklyChartData} />
                </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}


const DashboardPage = dynamic(() => Promise.resolve(DashboardPageComponent), { ssr: false });

export default DashboardPage;
