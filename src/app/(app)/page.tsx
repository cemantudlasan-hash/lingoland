"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { signInWithEmail, signUpWithEmail, signOut } from "@/lib/auth";
import { CockpitHologram3D } from "@/components/layout/CockpitHologram3D";
import { AlienMarketAnimation, RocketLaunchAnimation, ConstellationAnimation } from "@/components/layout/BottomCardsAnimation3D";
import { CockpitSlideshow } from "@/components/layout/CockpitSlideshow";
import { ClefConversationBubble } from "@/components/layout/ClefConversationBubble";
import { useFirestore } from "@/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Gamepad2,
  Mic,
  User,
  Bell,
  Sparkles,
  Rocket,
  Flame,
  ChevronDown,
  LogIn,
  LogOut,
  Loader2,
  HelpCircle,
  Trophy,
  Info,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Zap,
  Menu,
  Search,
  StickyNote,
  BrainCircuit,
  FileQuestion,
  CalendarCheck,
  Presentation,
  ListOrdered,
  Notebook,
  Quote,
  Briefcase,
  Clapperboard,
  MessageCircle,
  BookMarked,
  ClipboardList,
  Store,
  Users,
  Egg,
  GraduationCap,
  Shield,
  FileText,
  ChevronRight,
  X,
  Wrench,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useSmartReviewAsteroids } from "@/hooks/use-smart-review-asteroids";

// Complete 27-item platform menu directory
const ALL_PLATFORM_MENUS = [
  // 1. Arcade & Learning (8 items)
  { href: "/games", label: "Classroom Games", category: "Arcade & Learning", icon: Gamepad2, color: "text-violet-400", bg: "bg-violet-500/15 border-violet-500/30", desc: "Interactive multiplayer and single-player vocabulary games" },
  { href: "/flashcards", label: "Dynamic Flashcard Generator", category: "Arcade & Learning", icon: StickyNote, color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30", desc: "Spaced-repetition study room with native AI voice pronunciation" },
  { href: "/storytelling", label: "AI Storytelling", category: "Arcade & Learning", icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30", desc: "Adaptive interactive stories crafted to your English CEFR level" },
  { href: "/reader", label: "Dynamic Reader", category: "Arcade & Learning", icon: BookOpen, color: "text-cyan-400", bg: "bg-cyan-500/15 border-cyan-500/30", desc: "Bilingual reading companion with instant translations & definitions" },
  { href: "/generator", label: "Exercise Generator", category: "Arcade & Learning", icon: BrainCircuit, color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/30", desc: "Instant grammar drills, worksheets, and multiple-choice quizzes" },
  { href: "/exam-mode", label: "Exam Mode", category: "Arcade & Learning", icon: FileQuestion, color: "text-rose-400", bg: "bg-rose-500/15 border-rose-500/30", desc: "Timed standard test simulations with detailed scoring breakdown" },
  { href: "/movie-relax", label: "Movie Relax", category: "Arcade & Learning", icon: Clapperboard, color: "text-pink-400", bg: "bg-pink-500/15 border-pink-500/30", desc: "Cinema-based English comprehension with dual subtitles" },
  { href: "/onet-practice", label: "O-Net Test Practice", category: "Arcade & Learning", icon: BookMarked, color: "text-indigo-400", bg: "bg-indigo-500/15 border-indigo-500/30", desc: "Standardized exam prep with official past question banks" },

  // 2. Classroom & Teacher Suite (6 items)
  { href: "/classroom-tools", label: "Classroom Tools", category: "Classroom Suite", icon: Wrench, color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30", desc: "Noise meter, classroom timer, random name picker & board tools" },
  { href: "/lesson-planner", label: "Lesson Planner", category: "Classroom Suite", icon: Notebook, color: "text-teal-400", bg: "bg-teal-500/15 border-teal-500/30", desc: "AI-assisted curriculum generator & daily syllabus planner" },
  { href: "/attendance", label: "Attendance Tracker", category: "Classroom Suite", icon: CalendarCheck, color: "text-green-400", bg: "bg-green-500/15 border-green-500/30", desc: "Student attendance roll-call, presence logs, and reports" },
  { href: "/presentation", label: "Presentation Mode", category: "Classroom Suite", icon: Presentation, color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/30", desc: "Distraction-free presentation canvas for classroom projectors" },
  { href: "/rubrics", label: "Rubrics Generator", category: "Classroom Suite", icon: ListOrdered, color: "text-fuchsia-400", bg: "bg-fuchsia-500/15 border-fuchsia-500/30", desc: "Custom grading rubrics for speaking, writing & presentations" },
  { href: "/students-record", label: "Students Record", category: "Classroom Suite", icon: ClipboardList, color: "text-sky-400", bg: "bg-sky-500/15 border-sky-500/30", desc: "Individual student grade histories, behavior, and notes" },

  // 3. Universe & Social (6 items)
  { href: "/marketplace", label: "Tutor Marketplace", category: "Universe & Social", icon: Store, color: "text-yellow-400", bg: "bg-yellow-500/15 border-yellow-500/30", desc: "Book 1-on-1 certified ESL tutors and find peer study partners" },
  { href: "/roleplay-workspace", label: "Roleplay Workspace", category: "Universe & Social", icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/15 border-cyan-500/30", desc: "Conversational roleplay simulations for real-world scenarios" },
  { href: "/lounge", label: "English Lounge", category: "Universe & Social", icon: MessageCircle, color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30", desc: "Live discussion threads, chat, and community exchanges" },
  { href: "/homework-hub", label: "Homework Hub", category: "Universe & Social", icon: BookMarked, color: "text-purple-400", bg: "bg-purple-500/15 border-purple-500/30", desc: "Assign, submit, and review English assignments online" },
  { href: "/jobs", label: "Job Matcher", category: "Universe & Social", icon: Briefcase, color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/30", desc: "Global ESL teaching job listings and career opportunities" },
  { href: "/quotes", label: "English Quotes", category: "Universe & Social", icon: Quote, color: "text-rose-400", bg: "bg-rose-500/15 border-rose-500/30", desc: "Daily idioms, vocabulary breakdowns, and wisdom quotes" },

  // 4. Pilot & Flight Deck (7 items)
  { href: "/dashboard", label: "Command Dashboard", category: "Pilot & Flight Deck", icon: LayoutDashboard, color: "text-cyan-300", bg: "bg-cyan-500/20 border-cyan-400/40", desc: "Mission center, streak fuel, and AI Smart-Review Asteroids" },
  { href: "/lingo-pet", label: "Lingo-Pet Hatchery", category: "Pilot & Flight Deck", icon: Egg, color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30", desc: "Nurture your cosmic language companion with daily learning XP" },
  { href: "/study-room", label: "Acoustic Study Room", category: "Pilot & Flight Deck", icon: GraduationCap, color: "text-indigo-400", bg: "bg-indigo-500/15 border-indigo-500/30", desc: "Lo-Fi focus soundscapes, Pomodoro timer & speaking mic lab" },
  { href: "/language-modules", label: "Language Modules", category: "Pilot & Flight Deck", icon: BookOpen, color: "text-teal-400", bg: "bg-teal-500/15 border-teal-500/30", desc: "Structured CEFR progression courses from A1 to C2 mastery" },
  { href: "/profile", label: "Pilot Dossier (4K ID)", category: "Pilot & Flight Deck", icon: User, color: "text-pink-400", bg: "bg-pink-500/15 border-pink-500/30", desc: "Cadet identity card, badges, achievements & level progression" },
  { href: "/my-postings", label: "My Postings", category: "Pilot & Flight Deck", icon: FileText, color: "text-slate-300", bg: "bg-slate-700/30 border-slate-600/30", desc: "Manage your published job postings and community resources" },
  { href: "/admin", label: "Station Admin", category: "Pilot & Flight Deck", icon: Shield, color: "text-red-400", bg: "bg-red-500/20 border-red-500/40", desc: "Station administration, user management, and security settings" },
];

export default function LingoLandVerseHomePage() {
  const router = useRouter();
  const { user, isGuest, isAdmin, isLoading, logoutGuest, setAuthAction } = useAuth();
  const { toast } = useToast();
  const { activeAsteroids, scheduledAsteroids } = useSmartReviewAsteroids();
  const firestore = useFirestore();
  const cockpitHeroRef = useRef<HTMLDivElement>(null);

  // Navigation Drawer States
  const [isAllMenusOpen, setIsAllMenusOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [selectedMenuCategory, setSelectedMenuCategory] = useState<string>("All");

  // Dialog States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Informational Dialogs
  const [infoModal, setInfoModal] = useState<"about" | "leaderboard" | "support" | "streak" | null>(null);

  // Top 3 Registered Users Leaderboard (Scores accumulated from dashboard activities)
  const [leaderboardTop3, setLeaderboardTop3] = useState<{ rank: number; name: string; score: string; badge: string }[]>([
    { rank: 1, name: "handsomekyoo31", score: "21,352 XP", badge: "🥇" },
    { rank: 2, name: "CleffyX", score: "15,811 XP", badge: "🥈" },
    { rank: 3, name: "Johnny", score: "1,058 XP", badge: "🥉" },
  ]);

  useEffect(() => {
    // Leaderboard is only loaded for registered users
    if (!user || isGuest || !firestore) return;

    let isSubscribed = true;
    async function loadLeaderboard() {
      try {
        const analyticsSnap = await getDocs(collection(firestore, "analytics"));
        const userScores: Record<string, number> = {};

        analyticsSnap.forEach((docSnap) => {
          const data = docSnap.data();
          const uid = data.userId;
          if (uid && uid !== "guest") {
            const score = data.details && data.details.score ? Number(data.details.score) : 10;
            userScores[uid] = (userScores[uid] || 0) + score;
          }
        });

        const sortedUids = Object.entries(userScores)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);

        const badges = ["🥇", "🥈", "🥉"];
        const top3 = await Promise.all(
          sortedUids.map(async ([uid, totalScore], index) => {
            let name = `Cadet_${uid.substring(0, 5)}`;
            try {
              const uDoc = await getDoc(doc(firestore, "users", uid));
              if (uDoc.exists() && uDoc.data().displayName) {
                name = uDoc.data().displayName;
              }
            } catch {
              // fallback to Cadet_id
            }
            return {
              rank: index + 1,
              name,
              score: `${totalScore.toLocaleString()} XP`,
              badge: badges[index] || "⭐",
            };
          })
        );

        if (isSubscribed && top3.length > 0) {
          setLeaderboardTop3(top3);
        }
      } catch (e) {
        console.warn("Leaderboard live fetch note:", e);
      }
    }

    loadLeaderboard();
    return () => {
      isSubscribed = false;
    };
  }, [user, isGuest, firestore]);

  // Guest restricted routes that require a registered Pilot account
  const GUEST_RESTRICTED_ROUTES = [
    "/dashboard",
    "/profile",
    "/study-room",
    "/lingo-pet",
    "/my-postings",
    "/admin",
  ];

  // Station admin should only be visible on admin's account
  const visibleMenus = ALL_PLATFORM_MENUS.filter((item) => {
    if (item.href === "/admin" && !isAdmin) return false;
    return true;
  });

  // Filtered menus - alphabetically arranged by label (A-Z)
  const filteredMenus = visibleMenus
    .filter((item) => {
      const matchesCategory = selectedMenuCategory === "All" || item.category === selectedMenuCategory;
      const matchesQuery =
        !menuSearchQuery ||
        item.label.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(menuSearchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      toast({
        variant: "destructive",
        title: "Required Fields",
        description: "Please enter both email and password.",
      });
      return;
    }

    setIsAuthLoading(true);
    try {
      if (authMode === "signin") {
        const { error } = await signInWithEmail(authEmail, authPassword);
        if (error) {
          toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: error,
          });
        } else {
          toast({
            title: "Welcome Back, Pilot! 🚀",
            description: "Successfully authenticated into LingoLandVerse.",
          });
          setIsAuthModalOpen(false);
        }
      } else {
        const { error } = await signUpWithEmail(authEmail, authPassword);
        if (error) {
          toast({
            variant: "destructive",
            title: "Registration Failed",
            description: error,
          });
        } else {
          toast({
            title: "Cadet Enrolled! 🌟",
            description: "Account registered successfully. Signing in...",
          });
          setIsAuthModalOpen(false);
        }
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Mission Error",
        description: err.message,
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Redirect unauthenticated visitors directly to sign-in
  useEffect(() => {
    if (!isLoading && !user && !isGuest) {
      router.replace('/auth#login-card-section');
    }
  }, [isLoading, user, isGuest, router]);

  // Prevent flashing the new layout if unauthenticated
  if (isLoading || (!user && !isGuest)) {
    return (
      <div className="min-h-screen w-full bg-[#030712] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-cyan-300 font-mono tracking-widest uppercase">Connecting to LingoLandVerse...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-white flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Dynamic Cosmic Background with Starfield */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950/80 to-[#030712]" />
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[150px]" />
      </div>

      {/* 1. TOP HEADER (Exact match to reference photo) */}
      <header className="relative z-40 w-full h-16 md:h-20 px-4 sm:px-8 lg:px-12 flex items-center justify-between border-b border-white/[0.08] bg-slate-950/40 backdrop-blur-xl">
        {/* Logo & Quick Navigation Menu Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(56,189,248,0.7)] group-hover:drop-shadow-[0_0_22px_rgba(56,189,248,0.9)] transition-all">
              <span className="text-white">lingoland</span>
              <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                Verse
              </span>
            </span>
          </Link>

          <button
            onClick={() => setIsAllMenusOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-400/40 hover:border-cyan-300 text-cyan-200 text-xs font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:scale-105 active:scale-95"
            title={`Browse all ${visibleMenus.length} Educational Apps & Classroom Tools`}
          >
            <Menu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">All Menus</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black">{visibleMenus.length}</span>
          </button>
        </div>

        {/* Navigation Links + Utility Controls */}
        <div className="flex items-center gap-5 sm:gap-8">
          <nav className="hidden sm:flex items-center gap-6 md:gap-8 text-xs md:text-sm font-semibold text-slate-300">
            <button
              onClick={() => setInfoModal("about")}
              className="hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all"
            >
              About
            </button>
            {user && !isGuest && (
              <button
                onClick={() => setInfoModal("leaderboard")}
                className="hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all font-semibold"
              >
                Leaderboard
              </button>
            )}
            <button
              onClick={() => setInfoModal("support")}
              className="hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all"
            >
              Support
            </button>
          </nav>

          {/* Notifications Bell with Glowing Red Badge */}
          <button
            onClick={() => {
              toast({
                title: "Station Alert 🛸",
                description: "AI Smart-Review Asteroids has detected 1 new vocabulary intercept mission.",
              });
            }}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-300" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center border border-black shadow-[0_0_10px_rgba(244,63,94,0.9)]">
              1
            </span>
          </button>

          {/* User Profile Avatar with Glowing Rings (Interactive Dropdown Menu) */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-1.5 p-1 rounded-full border border-cyan-400/40 hover:border-cyan-300 transition-all bg-slate-900/60 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 cursor-pointer"
              title={user ? user.email || "Pilot Profile" : (isGuest ? "Guest Account" : "Authenticate Pilot")}
            >
              {/* Planet Avatar Icon */}
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-cyan-500 to-purple-500 flex items-center justify-center shadow-inner overflow-hidden">
                <div className="absolute w-10 h-2 border border-cyan-200/80 rounded-full rotate-[-25deg] shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span className="text-xs">🪐</span>
              </div>
              <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 pr-0.5 transition-transform duration-200", isProfileDropdownOpen && "rotate-180")} />
            </button>

            {/* Dropdown Menu Modal */}
            <AnimatePresence>
              {isProfileDropdownOpen && (
                <>
                  {/* Backdrop to close dropdown on outside click */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 z-50 border border-cyan-500/30 bg-slate-950/95 backdrop-blur-2xl text-white rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.25)] p-2.5"
                  >
                    {isGuest ? (
                      /* When guest is logged in: ONLY "Sign-Out as a Guest" is visible */
                      <button
                        onClick={async () => {
                          setIsProfileDropdownOpen(false);
                          try {
                            setAuthAction('logout');
                            logoutGuest();
                          } finally {
                            window.location.href = '/auth#login-card-section';
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 rounded-xl transition-all text-left group cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                        <span>Sign-Out as a Guest</span>
                      </button>
                    ) : (
                      <>
                        <div className="px-2 py-1.5 border-b border-slate-800/80 mb-2">
                          <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider block">
                            {user ? "Pilot Profile" : "Pilot Authentication"}
                          </span>
                          <span className="text-xs text-slate-300 font-semibold truncate block mt-0.5" title={user ? user.email || "" : "Not Authenticated"}>
                            {user ? user.email : "Not Authenticated"}
                          </span>
                        </div>

                        {user ? (
                          <div className="space-y-1">
                            <button
                              onClick={() => {
                                setIsProfileDropdownOpen(false);
                                router.push("/dashboard");
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-cyan-500/20 rounded-xl transition-all text-left group"
                            >
                              <LayoutDashboard className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                              <span>Command Dashboard</span>
                            </button>

                            <button
                              onClick={() => {
                                setIsProfileDropdownOpen(false);
                                router.push("/profile");
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-cyan-500/20 rounded-xl transition-all text-left group"
                            >
                              <User className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                              <span>Pilot Dossier &amp; 4K ID</span>
                            </button>

                            <div className="h-px bg-slate-800/80 my-1.5" />

                            <button
                              onClick={async () => {
                                setIsProfileDropdownOpen(false);
                                try {
                                  setAuthAction('logout');
                                  await signOut();
                                } finally {
                                  window.location.href = '/auth#login-card-section';
                                }
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 rounded-xl transition-all text-left group"
                            >
                              <LogOut className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                              <span>Exit Station (Sign Out)</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <button
                              onClick={() => {
                                setIsProfileDropdownOpen(false);
                                router.push("/auth?mode=signin#login-card-section");
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-cyan-300 hover:text-white hover:bg-cyan-500/20 rounded-xl transition-all text-left group"
                            >
                              <LogIn className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                              <span>Sign In to Controls</span>
                            </button>

                            <button
                              onClick={() => {
                                setIsProfileDropdownOpen(false);
                                router.push("/auth?mode=signup#login-card-section");
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-amber-300 hover:text-white hover:bg-amber-500/20 rounded-xl transition-all text-left group"
                            >
                              <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                              <span>Enroll Cadet (Register)</span>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* 2. MAIN COCKPIT BODY (Left Sidebar + Center Cockpit Panorama + Right Widgets) */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto w-full gap-6">
        {/* Upper Stage: Left Nav, Center Hero Cockpit, Right Floating Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[460px] xl:min-h-[520px]">
          {/* Left Vertical Dock (Glassmorphism Pill Navigation) */}
          <aside className="lg:col-span-2 xl:col-span-2 flex flex-col justify-between">
            <div className="glass-card border border-white/10 bg-slate-950/60 backdrop-blur-2xl rounded-3xl p-3 flex flex-col gap-2.5 shadow-2xl">
              {/* Item 1: Dashboard (Active State) */}
              <button
                onClick={() => {
                  if (!user || isGuest) {
                    setAuthNotice("Command Dashboard requires a registered Pilot account. Please sign in or enroll.");
                    setIsAuthModalOpen(true);
                  } else {
                    router.push("/dashboard");
                  }
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all hover:scale-[1.02]"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-400/20 flex items-center justify-center text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm tracking-wide text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                  Dashboard
                </span>
              </button>

              {/* Item 2: Cosmic Codex / Dictionary */}
              <button
                onClick={() => router.push("/reader")}
                className="w-full flex items-start gap-3.5 px-4 py-3 rounded-2xl text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-purple-500/30 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] group-hover:scale-110 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs tracking-wide text-white block">
                    Cosmic Codex
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">
                    Dictionary
                  </span>
                </div>
              </button>

              {/* Item 3: Galactic Games */}
              <button
                onClick={() => router.push("/games")}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-violet-500/30 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)] group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs tracking-wide text-white">
                  Galactic Games
                </span>
              </button>

              {/* Item 4: Speaking Lab */}
              <button
                onClick={() => router.push("/roleplay-workspace")}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-cyan-500/30 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] group-hover:scale-110 transition-transform">
                  <Mic className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs tracking-wide text-white">
                  Speaking Lab
                </span>
              </button>

              {/* Item 5: Profile + 4K Badge */}
              <button
                onClick={() => {
                  if (!user || isGuest) {
                    setAuthNotice("Pilot Dossier requires a registered Pilot account. Please sign in or enroll.");
                    setIsAuthModalOpen(true);
                  } else {
                    router.push("/profile");
                  }
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-pink-500/30 transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-7 h-7 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] group-hover:scale-110 transition-transform">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs tracking-wide text-white">
                    Profile
                  </span>
                </div>
                <Badge className="bg-cyan-950/60 text-cyan-300 border-cyan-500/40 text-[9px] font-black px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                  4K
                </Badge>
              </button>

              {/* Item 6: All Menus & Tools Explorer */}
              <button
                onClick={() => setIsAllMenusOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900/60 hover:from-purple-900/50 hover:to-indigo-900/50 text-slate-300 hover:text-white border border-purple-500/30 hover:border-purple-400 transition-all group shadow-[0_0_15px_rgba(168,85,247,0.25)] hover:scale-[1.02] mt-1"
                title={`Explore all ${visibleMenus.length} Educational Apps & Classroom Tools`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] group-hover:scale-110 transition-transform">
                    <Menu className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="font-extrabold text-xs tracking-wide text-white block">
                      All {visibleMenus.length} Menus
                    </span>
                    <span className="text-[10px] text-purple-300 block -mt-0.5">
                      Explore Apps &amp; Tools
                    </span>
                  </div>
                </div>
                <Badge className="bg-purple-500/30 text-purple-200 border-purple-400/40 text-[9px] font-black px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                  {visibleMenus.length}
                </Badge>
              </button>
            </div>
          </aside>

          {/* Center Cockpit Hero (Astronaut Owl + Holographic Constellation Globe) */}
          <div ref={cockpitHeroRef} className="lg:col-span-7 xl:col-span-7 relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col justify-end min-h-[360px] md:min-h-[460px] group">
            {/* Background Panorama Image */}
            <div className="absolute inset-0">
              <Image
                src="/images/cockpit-hero.jpg"
                alt="Space Station Cockpit"
                fill
                className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-1000"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
            </div>

            {/* Ultra-realistic 3D Holographic Constellation & Orbit Animation */}
            <CockpitHologram3D className="z-[5]" />

            {/* Dynamically Anchored Clef Conversation Bubble (Tracks helmet across all screen sizes) */}
            <ClefConversationBubble containerRef={cockpitHeroRef} />

            {/* Interactive Hologram Indicator Overlay */}
            <div className="relative z-10 p-6 sm:p-8 flex items-end justify-between">
              <div className="glass-card p-4 rounded-2xl border border-cyan-400/30 bg-slate-950/60 backdrop-blur-xl max-w-sm shadow-[0_0_25px_rgba(34,211,238,0.2)]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[10px] font-black uppercase text-cyan-300 tracking-widest">
                    Holographic Constellation Active
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Welcome to the Bridge, Commander! Orbiting nodes: <span className="text-cyan-300 font-bold">Focus</span>, <span className="text-cyan-300 font-bold">Constellation</span>, <span className="text-cyan-300 font-bold">Meditation</span>.
                </p>
              </div>

              {!user && (
                <Button
                  onClick={() => router.push("/auth?mode=signin#login-card-section")}
                  className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black rounded-2xl px-6 h-11 text-xs sm:text-sm shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all hover:scale-105"
                >
                  <Rocket className="w-4 h-4 mr-2 text-slate-950" />
                  Launch Flight Deck
                </Button>
              )}
            </div>
          </div>

          {/* Right Floating Widgets (Streak Fuel + AI Smart-Review Asteroids) */}
          <aside className="lg:col-span-3 xl:col-span-3 flex flex-col gap-4 justify-between">
            {/* Widget 1: Streak Fuel */}
            <div
              onClick={() => setInfoModal("streak")}
              className="glass-card border border-white/10 hover:border-cyan-400/40 bg-slate-950/60 backdrop-blur-2xl rounded-3xl p-5 shadow-2xl cursor-pointer transition-all hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform">
                    🚀
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white group-hover:text-cyan-300 transition-colors">
                      Streak Fuel
                    </h4>
                    <p className="text-[10px] text-slate-400">Daily learning momentum</p>
                  </div>
                </div>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/40 text-xs font-black px-3 py-1 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                  7 day
                </Badge>
              </div>
            </div>

            {/* Widget 2: Interactive Cockpit Slideshow (Notice, Top Game, Asteroids, Video) */}
            <CockpitSlideshow
              onOpenDashboardAuthNotice={() => {
                setAuthNotice("Command Dashboard requires a registered Pilot account. Please sign in or enroll.");
                setIsAuthModalOpen(true);
              }}
            />
          </aside>
        </div>

        {/* 3. BOTTOM ROW (3 Featured Game Cards matching reference photo with 3D Animations) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Card 1: Alien Market Trader */}
          <div
            onClick={() => router.push("/marketplace")}
            className="glass-card border border-white/10 hover:border-cyan-400/40 bg-slate-950/60 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1.5 group flex flex-col"
          >
            <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900">
              <Image
                src="/images/alien-market.jpg"
                alt="Alien Market Trader"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              {/* 3D Animation: Floating Magic Orbs & Fairy Dust */}
              <AlienMarketAnimation />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                  Alien Market Trader
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Art: <span className="text-slate-300 font-semibold">Roleplay &amp; Barter</span>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-bold text-cyan-400">
                <span>Engage Dialogue</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </div>
          </div>

          {/* Card 2: Space Debris Sweeper */}
          <div
            onClick={() => router.push("/games")}
            className="glass-card border border-white/10 hover:border-violet-400/40 bg-slate-950/60 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1.5 group flex flex-col"
          >
            <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900">
              <Image
                src="/images/space-debris.jpg"
                alt="Space Debris Sweeper"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              {/* 3D Animation: Rocket Launching with Moving Fire on Tail & Speed Dust */}
              <RocketLaunchAnimation />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-violet-300 transition-colors">
                  Space Debris Sweeper
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Art: <span className="text-slate-300 font-semibold">Proofreading Action grammar mistakes</span>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-bold text-violet-400">
                <span>Play Grammar Sweep</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </div>
          </div>

          {/* Card 3: Acoustic Study room */}
          <div
            onClick={() => {
              if (!user || isGuest) {
                setAuthNotice("Acoustic Study Room requires a registered Pilot account. Please sign in or enroll.");
                setIsAuthModalOpen(true);
              } else {
                router.push("/study-room");
              }
            }}
            className="glass-card border border-white/10 hover:border-indigo-400/40 bg-slate-950/60 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1.5 group flex flex-col"
          >
            <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900">
              <Image
                src="/images/constellation-connector.jpg"
                alt="Acoustic Study room"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              {/* 3D Animation: Twinkling Glowing Constellation Stars & Stardust */}
              <ConstellationAnimation />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                  Acoustic Study room
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Art: <span className="text-slate-300 font-semibold">Lo-Fi Soundscapes &amp; Focus Star Lab</span>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-bold text-indigo-400">
                <span>Connect to Study Star Room</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PREMIUM GLASSMORPHISM AUTHENTICATION MODAL (With vibrant neon-glowing typography) */}
      <Dialog
        open={isAuthModalOpen}
        onOpenChange={(open) => {
          setIsAuthModalOpen(open);
          if (!open) setAuthNotice(null);
        }}
      >
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md p-6 sm:p-7 z-50 glass-card border border-cyan-500/40 bg-slate-950/95 backdrop-blur-3xl text-white rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.35)] max-h-[90vh] overflow-y-auto">
          {/* Ambient Cosmic Lights */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />

          {/* Guest Restricted Notice Banner */}
          {authNotice && (
            <div className="mb-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs text-left flex items-start gap-2.5 shadow-[0_0_15px_rgba(245,158,11,0.2)] relative z-10">
              <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="font-extrabold block text-white text-[11px] uppercase tracking-wider">Pilot Authorization Required</span>
                <span className="text-slate-300 text-xs mt-0.5 leading-relaxed block">{authNotice}</span>
              </div>
            </div>
          )}

          <DialogHeader className="text-center relative z-10 pb-2">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1.5px] shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-xl">
                🚀
              </div>
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]">
              {isGuest ? "AUTHENTICATE PILOT" : authMode === "signin" ? "AUTHENTICATE PILOT" : "ENROLL NEW CADET"}
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-xs mt-1">
              {isGuest
                ? "Pilot credentials required to access this feature."
                : authMode === "signin"
                ? "Enter your flight credentials to command LingoLandVerse."
                : "Create your pilot passport and start your cosmic ESL expedition."}
            </DialogDescription>
          </DialogHeader>

          {isGuest ? (
            /* When in guest account: remove tabs & form, show required notice and register/sign-in button */
            <div className="my-4 space-y-4 text-center relative z-10">
              <div className="p-4 rounded-2xl bg-slate-900/85 border border-cyan-500/30 text-center space-y-2 shadow-lg">
                <p className="text-sm font-semibold text-cyan-200 leading-relaxed">
                  You need to Sign-in to use this feature, click the button below to register/sign-in.
                </p>
                {authNotice && (
                  <p className="text-xs text-amber-300 font-medium">
                    Restricted Feature: {authNotice}
                  </p>
                )}
              </div>

              <Button
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  router.push("/auth#login-card-section");
                }}
                className="w-full bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 hover:opacity-90 text-slate-950 font-black h-12 rounded-xl text-sm shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-all hover:scale-[1.02] cursor-pointer"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Register / Sign-In
              </Button>
            </div>
          ) : (
            <>
              {/* Tab Switcher */}
              <div className="grid grid-cols-2 p-1 bg-slate-900/80 border border-white/10 rounded-2xl my-2 relative z-10">
                <button
                  type="button"
                  onClick={() => setAuthMode("signin")}
                  className={cn(
                    "py-2 text-xs font-bold rounded-xl transition-all",
                    authMode === "signin"
                      ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  Pilot Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className={cn(
                    "py-2 text-xs font-bold rounded-xl transition-all",
                    authMode === "signup"
                      ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  New Cadet
                </button>
              </div>

              {/* Form with Clean Visual Containers */}
              <form onSubmit={handleAuthSubmit} className="space-y-4 my-2 relative z-10">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                    Cosmic Email ID
                  </Label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="pilot@lingolandverse.io"
                      className="bg-slate-900/70 border-cyan-500/30 text-white placeholder:text-slate-500 focus-visible:ring-cyan-400 focus-visible:border-cyan-400 rounded-xl h-11 text-sm shadow-inner"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                    Access Encryption Code
                  </Label>
                  <div className="relative">
                    <Input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-slate-900/70 border-cyan-500/30 text-white placeholder:text-slate-500 focus-visible:ring-cyan-400 focus-visible:border-cyan-400 rounded-xl h-11 text-sm shadow-inner"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 hover:opacity-90 text-slate-950 font-black h-11 rounded-xl text-sm shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-all hover:scale-[1.02]"
                >
                  {isAuthLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  {authMode === "signin" ? "Engage Flight Deck" : "Activate Cadet Passport"}
                </Button>
              </form>
            </>
          )}

          <p className="text-[11px] text-center text-slate-400 relative z-10 pt-2">
            Protected by LingoLandVerse Quantum Encryption &bull; ESL 4K Standard
          </p>
        </DialogContent>
      </Dialog>

      {/* 5. INFORMATION MODALS (About, Leaderboard, Support, Streak) */}
      <Dialog open={Boolean(infoModal)} onOpenChange={() => setInfoModal(null)}>
        <DialogContent className="glass-card border border-cyan-500/30 bg-slate-950/95 backdrop-blur-2xl text-white rounded-3xl max-w-lg p-6 sm:p-8 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              {infoModal === "about" && (
                <>
                  <Info className="w-6 h-6 text-cyan-400" /> About LingoLandVerse
                </>
              )}
              {infoModal === "leaderboard" && (
                <>
                  <Trophy className="w-6 h-6 text-amber-400" /> Galactic Leaderboard
                </>
              )}
              {infoModal === "support" && (
                <>
                  <ShieldCheck className="w-6 h-6 text-indigo-400" /> Cosmic Mission Support
                </>
              )}
              {infoModal === "streak" && (
                <>
                  <Flame className="w-6 h-6 text-orange-400" /> Streak Fuel Status
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              {infoModal === "about" && "The next-generation AI-powered ESL metaverse learning platform."}
              {infoModal === "leaderboard" && "Real-time global rankings across all galactic classrooms."}
              {infoModal === "support" && "Connect with LingoLandVerse technical support and guidance."}
              {infoModal === "streak" && "Your continuous active days powering vocabulary retention."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 text-sm text-slate-300 leading-relaxed space-y-3">
            {infoModal === "about" && (
              <>
                <p>
                  <strong className="text-cyan-300">LingoLandVerse</strong> combines adaptive OpenAI evaluators, SuperMemo-2 spaced-repetition asteroids, interactive storytelling, and 3D metaverse tools into an immersive ESL learning odyssey.
                </p>
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <div className="text-white font-bold">✨ Key Architecture:</div>
                  <div>&bull; AI Smart-Review Asteroids (SM-2 Spaced Repetition)</div>
                  <div>&bull; Speaking Lab &amp; Alien Market Trader (Interactive Dialogue)</div>
                  <div>&bull; Cosmic Codex (Contextual Reading &amp; Definitions)</div>
                </div>
              </>
            )}

            {infoModal === "leaderboard" && (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-amber-400/20 text-xs text-slate-300 flex items-center justify-between">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" /> Registered Pilots Hall of Fame
                  </span>
                  <span className="text-[10px] text-slate-400">Dashboard Accumulated Scores</span>
                </div>

                <div className="space-y-2.5">
                  {leaderboardTop3.map((pilot) => (
                    <div
                      key={pilot.rank}
                      className={cn(
                        "flex items-center justify-between p-3.5 rounded-2xl border transition-all",
                        pilot.rank === 1
                          ? "bg-amber-500/15 border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                          : pilot.rank === 2
                          ? "bg-slate-800/60 border-cyan-400/30"
                          : "bg-slate-900/60 border-slate-700/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{pilot.badge}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-white">
                              {pilot.name}
                            </span>
                            {pilot.rank === 1 && (
                              <Badge className="bg-amber-400/20 text-amber-300 border-amber-400/40 text-[9px] font-black py-0 px-1">
                                TOP 1
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Rank #{pilot.rank} Active Pilot
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-cyan-300 block">
                          {pilot.score}
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase font-semibold">
                          Total XP
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {infoModal === "support" && (
              <div className="space-y-3">
                <p className="text-xs">
                  Need assistance with your account, lesson planner, or spaced repetition drills? Contact our team directly.
                </p>
                <Button
                  onClick={() => router.push("/support")}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs h-10"
                >
                  Visit Support Center
                </Button>
              </div>
            )}

            {infoModal === "streak" && (
              <div className="text-center space-y-3 py-2">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  🔥
                </div>
                <h4 className="text-lg font-black text-white">7-Day Flight Streak Active!</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  You are earning a +25% XP multiplier on all Galactic Games and Asteroid Shatter challenges.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 5. SLIDE-OUT ALL-MENUS DRAWER (All 27 Educational Apps, Games, Classroom Tools & Pilot Systems) */}
      <AnimatePresence>
        {isAllMenusOpen && (
          <div className="fixed inset-0 z-[120] flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAllMenusOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-[92vw] sm:max-w-md lg:max-w-xl bg-slate-950/98 border-r border-cyan-500/40 backdrop-blur-3xl text-white p-0 flex flex-col h-full shadow-[0_0_80px_rgba(6,182,212,0.35)] z-10"
            >
              {/* Header */}
              <div className="p-5 pb-3 border-b border-white/10 bg-slate-900/60 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white tracking-wide">
                        LingoLandVerse Navigation
                      </h3>
                      <p className="text-xs text-slate-400">
                        All {visibleMenus.length} Educational Apps, Games &amp; Teacher Suites
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-black text-xs">
                      {visibleMenus.length} Apps
                    </Badge>
                    <button
                      onClick={() => setIsAllMenusOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Close Drawer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Instant Search Bar */}
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search games, flashcards, lesson planner..."
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    className="pl-9 pr-8 bg-slate-900/80 border-white/10 focus:border-cyan-400 text-xs text-white rounded-xl placeholder:text-slate-500 h-9"
                  />
                  {menuSearchQuery && (
                    <button
                      onClick={() => setMenuSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none text-[11px]">
                  {["All", "Arcade & Learning", "Classroom Suite", "Universe & Social", "Pilot & Flight Deck"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedMenuCategory(cat)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all border",
                        selectedMenuCategory === cat
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                          : "bg-slate-900/40 text-slate-400 border-transparent hover:text-white hover:bg-white/5"
                      )}
                    >
                      {cat === "All" ? `All (${visibleMenus.length})` : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable List of Filtered Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredMenus.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        setIsAllMenusOpen(false);
                        if ((!user || isGuest) && GUEST_RESTRICTED_ROUTES.includes(item.href)) {
                          setAuthNotice(`${item.label} requires a registered Pilot account. Please sign in or enroll.`);
                          setIsAuthModalOpen(true);
                        } else {
                          router.push(item.href);
                        }
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 hover:bg-cyan-950/30 border border-white/5 hover:border-cyan-500/30 transition-all text-left group hover:scale-[1.01]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105", item.bg, item.color)}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors truncate">
                              {item.label}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold hidden sm:inline">
                              {item.category.split("&")[0].trim()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 group-hover:text-slate-300">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </button>
                  );
                })}

                {filteredMenus.length === 0 && (
                  <div className="py-12 text-center text-slate-400">
                    <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="text-xs">No matching apps found for &quot;{menuSearchQuery}&quot;</p>
                  </div>
                )}
              </div>

              {/* Footer Quick Action */}
              <div className="p-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAllMenusOpen(false);
                    if (!user || isGuest) {
                      setAuthNotice("Command Dashboard requires a registered Pilot account. Please sign in or enroll.");
                      setIsAuthModalOpen(true);
                    } else {
                      router.push("/dashboard");
                    }
                  }}
                  className="w-full border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-900/50 text-cyan-300 text-xs font-bold rounded-xl"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 mr-2" />
                  Open Command Dashboard
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
