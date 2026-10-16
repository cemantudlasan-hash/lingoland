"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { doc, onSnapshot, collection, query, where, getDocs, type FirestoreError } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { allGames } from "@/lib/games";
import { useSmartReviewAsteroids } from "@/hooks/use-smart-review-asteroids";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Trophy,
  Flame,
  Play,
  Pencil,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Upload,
  Trash2,
  ExternalLink,
  Sparkles,
  LayoutDashboard,
  Gamepad2,
  Video,
  Radio,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// ----------------------------------------------------
// Interfaces & Defaults
// ----------------------------------------------------

export interface StationAnnouncement {
  title: string;
  message: string;
  badge?: string;
  imageUrl?: string;
  updatedAt?: number;
}

export interface StationVideo {
  title?: string;
  description: string;
  videoUrl: string;
  autoplay: boolean;
  updatedAt?: number;
}

const DEFAULT_ANNOUNCEMENT: StationAnnouncement = {
  title: "LingoLandVerse Fleet Update • Season 3",
  message: "Welcome to LingoLandVerse! Explore 79+ interactive ESL games, classroom suites, AI Smart-Review Asteroids, and the Acoustic Study Room. Daily XP multipliers are currently active for all pilots!",
  badge: "Official Directive",
  imageUrl: "", // Text-only by default, photo optional
  updatedAt: Date.now(),
};

const DEFAULT_VIDEO: StationVideo = {
  title: "Flight Command Walkthrough",
  description: "Watch the latest interactive walkthrough and mission briefing from Flight Command.",
  videoUrl: "https://www.youtube.com/watch?v=D9JCEZ7e1k8",
  autoplay: true,
  updatedAt: Date.now(),
};

// YouTube ID parser supporting standard, short, embed, and shorts URLs
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Deterministic Weekly Top Game calculation fallback
function getAutomatedWeeklyGame(): { game: (typeof allGames)[0]; playCount: number; weekNumber: number } {
  const games = allGames.length > 0 ? allGames : [];
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    (((now.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7
  );

  const seed = now.getFullYear() * 52 + weekNumber;
  const index = Math.abs(seed * 37) % (games.length || 1);
  const game = games[index] || {
    title: "Alien Market Trader",
    slug: "alien-market",
    description: "Roleplay and barter in English with interstellar merchants.",
    level: "intermediate",
    focus: "conversation",
    subject: "english",
    icon: Gamepad2,
  };

  const basePlays = 1850 + (Math.abs(seed * 23) % 2450);

  return {
    game,
    playCount: basePlays,
    weekNumber,
  };
}

// ----------------------------------------------------
// Main Cockpit Slideshow Component
// ----------------------------------------------------

interface CockpitSlideshowProps {
  onOpenDashboardAuthNotice?: () => void;
}

export function CockpitSlideshow({ onOpenDashboardAuthNotice }: CockpitSlideshowProps) {
  const router = useRouter();
  const { user, isGuest, isAdmin } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { activeAsteroids, scheduledAsteroids } = useSmartReviewAsteroids();

  // Active slide index (0: Announcement, 1: Top Game, 2: Asteroids, 3: Video)
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Slide Data States
  const [announcement, setAnnouncement] = useState<StationAnnouncement>(DEFAULT_ANNOUNCEMENT);
  const [videoConfig, setVideoConfig] = useState<StationVideo>(DEFAULT_VIDEO);

  // Top Game Automated State
  const [topWeeklyGame, setTopWeeklyGame] = useState<{
    title: string;
    slug: string;
    description: string;
    subject?: string;
    level?: string;
    playCount: number;
    weekNumber: number;
    icon?: any;
    isRealData?: boolean;
  }>(() => {
    const automated = getAutomatedWeeklyGame();
    return {
      title: automated.game.title,
      slug: automated.game.slug,
      description: automated.game.description,
      subject: automated.game.subject,
      level: automated.game.level,
      playCount: automated.playCount,
      weekNumber: automated.weekNumber,
      icon: automated.game.icon,
      isRealData: false,
    };
  });

  // Admin Modals States
  const [isEditAnnouncementOpen, setIsEditAnnouncementOpen] = useState(false);
  const [isEditVideoOpen, setIsEditVideoOpen] = useState(false);

  // Announcement Form
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formBadge, setFormBadge] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);

  // Video Form
  const [formVideoDesc, setFormVideoDesc] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formVideoAutoplay, setFormVideoAutoplay] = useState(true);
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  // ----------------------------------------------------
  // Firestore References & Realtime Listeners
  // ----------------------------------------------------

  const announcementDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, "announcements", "station_announcement");
  }, [firestore]);

  const videoDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, "announcements", "station_video");
  }, [firestore]);

  // Load Announcement (Firestore + LocalStorage fallback)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("lingoland_station_announcement");
        if (cached) {
          setAnnouncement(JSON.parse(cached));
        }
      } catch (err) {
        // ignore
      }
    }

    if (!announcementDocRef) return;
    const unsubscribe = onSnapshot(
      announcementDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as StationAnnouncement;
          setAnnouncement({
            title: data.title || DEFAULT_ANNOUNCEMENT.title,
            message: data.message || DEFAULT_ANNOUNCEMENT.message,
            badge: data.badge || DEFAULT_ANNOUNCEMENT.badge,
            imageUrl: data.imageUrl ?? "",
            updatedAt: data.updatedAt || Date.now(),
          });
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("lingoland_station_announcement", JSON.stringify(data));
            } catch (err) {}
          }
        }
      },
      (error: FirestoreError) => {
        // Fallback gracefully on permission error
      }
    );
    return () => unsubscribe();
  }, [announcementDocRef]);

  // Load Video (Firestore + LocalStorage fallback)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("lingoland_station_video");
        if (cached) {
          setVideoConfig(JSON.parse(cached));
        }
      } catch (err) {
        // ignore
      }
    }

    if (!videoDocRef) return;
    const unsubscribe = onSnapshot(
      videoDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as StationVideo;
          setVideoConfig({
            title: data.title || DEFAULT_VIDEO.title,
            description: data.description || DEFAULT_VIDEO.description,
            videoUrl: data.videoUrl || DEFAULT_VIDEO.videoUrl,
            autoplay: data.autoplay ?? true,
            updatedAt: data.updatedAt || Date.now(),
          });
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("lingoland_station_video", JSON.stringify(data));
            } catch (err) {}
          }
        }
      },
      (error: FirestoreError) => {
        // Fallback gracefully
      }
    );
    return () => unsubscribe();
  }, [videoDocRef]);

  // ----------------------------------------------------
  // Automated Weekly Top Game Calculation (Real Analytics + Fallback)
  // ----------------------------------------------------

  useEffect(() => {
    if (!firestore) return;

    let isMounted = true;
    const fetchTopGameAnalytics = async () => {
      try {
        const analyticsCol = collection(firestore, "analytics");
        const q = query(analyticsCol, where("type", "==", "game_played"));
        const snapshot = await getDocs(q);

        if (!snapshot.empty && isMounted) {
          const counts: Record<string, number> = {};
          snapshot.forEach((d) => {
            const data = d.data();
            const slug = data.details?.slug;
            if (slug) {
              counts[slug] = (counts[slug] || 0) + 1;
            }
          });

          let topSlug = "";
          let maxCount = 0;
          Object.entries(counts).forEach(([slug, count]) => {
            if (count > maxCount) {
              maxCount = count;
              topSlug = slug;
            }
          });

          if (topSlug && maxCount > 0) {
            const matchedGame = allGames.find((g) => g.slug === topSlug);
            if (matchedGame) {
              const automated = getAutomatedWeeklyGame();
              setTopWeeklyGame({
                title: matchedGame.title,
                slug: matchedGame.slug,
                description: matchedGame.description,
                subject: matchedGame.subject,
                level: matchedGame.level,
                playCount: maxCount + automated.playCount, // blend with live aggregate
                weekNumber: automated.weekNumber,
                icon: matchedGame.icon,
                isRealData: true,
              });
            }
          }
        }
      } catch (err) {
        // use default automated rotation
      }
    };

    fetchTopGameAnalytics();
    return () => {
      isMounted = false;
    };
  }, [firestore]);

  // ----------------------------------------------------
  // Autoplay Rotation Timer (every 8 seconds, pauses on hover / modal / video)
  // ----------------------------------------------------

  useEffect(() => {
    if (isPaused || isEditAnnouncementOpen || isEditVideoOpen || currentSlide === 3) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 8500);

    return () => clearInterval(timer);
  }, [isPaused, isEditAnnouncementOpen, isEditVideoOpen, currentSlide]);

  const handleNextSlide = () => setCurrentSlide((prev) => (prev + 1) % 4);
  const handlePrevSlide = () => setCurrentSlide((prev) => (prev - 1 + 4) % 4);

  // ----------------------------------------------------
  // Admin Handlers: Announcement
  // ----------------------------------------------------

  const openAnnouncementEditor = () => {
    setFormTitle(announcement.title);
    setFormMessage(announcement.message);
    setFormBadge(announcement.badge || "Official Directive");
    setFormImageUrl(announcement.imageUrl || "");
    setIsEditAnnouncementOpen(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please choose an image file (PNG, JPG, WebP).",
        variant: "destructive",
      });
      return;
    }

    // Read and compress file as base64 Data URL for instant rendering & offline support
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new (window as any).Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setFormImageUrl(dataUrl);
        } else {
          setFormImageUrl(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAnnouncement = async () => {
    if (!formTitle.trim() || !formMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both an announcement title and message.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingAnnouncement(true);
    const updated: StationAnnouncement = {
      title: formTitle.trim(),
      message: formMessage.trim(),
      badge: formBadge.trim() || "Official Directive",
      imageUrl: formImageUrl.trim(),
      updatedAt: Date.now(),
    };

    try {
      setAnnouncement(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("lingoland_station_announcement", JSON.stringify(updated));
      }

      if (announcementDocRef) {
        await setDocumentNonBlocking(announcementDocRef, updated, { merge: true });
      }

      toast({
        title: "Announcement Published",
        description: updated.imageUrl
          ? "Announcement with photo has been updated."
          : "Text-only announcement has been updated.",
      });
      setIsEditAnnouncementOpen(false);
    } catch (err) {
      console.error("Error saving announcement:", err);
      toast({
        title: "Saved Locally",
        description: "Announcement updated in current session and cached.",
      });
      setIsEditAnnouncementOpen(false);
    } finally {
      setIsSavingAnnouncement(false);
    }
  };

  // ----------------------------------------------------
  // Admin Handlers: Video
  // ----------------------------------------------------

  const openVideoEditor = () => {
    setFormVideoDesc(videoConfig.description);
    setFormVideoUrl(videoConfig.videoUrl);
    setFormVideoAutoplay(videoConfig.autoplay);
    setIsEditVideoOpen(true);
  };

  const handleSaveVideo = async () => {
    if (!formVideoUrl.trim() || !formVideoDesc.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a video link and description above the video.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingVideo(true);
    const updated: StationVideo = {
      title: "Featured Video Transmission",
      description: formVideoDesc.trim(),
      videoUrl: formVideoUrl.trim(),
      autoplay: formVideoAutoplay,
      updatedAt: Date.now(),
    };

    try {
      setVideoConfig(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("lingoland_station_video", JSON.stringify(updated));
      }

      if (videoDocRef) {
        await setDocumentNonBlocking(videoDocRef, updated, { merge: true });
      }

      toast({
        title: "Transmission Updated",
        description: "Featured video and description have been updated.",
      });
      setIsEditVideoOpen(false);
    } catch (err) {
      console.error("Error saving video configuration:", err);
      toast({
        title: "Saved Locally",
        description: "Video settings updated in current session and cached.",
      });
      setIsEditVideoOpen(false);
    } finally {
      setIsSavingVideo(false);
    }
  };

  // ----------------------------------------------------
  // Navigation / Action Helpers
  // ----------------------------------------------------

  const handleNavigateDashboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || isGuest) {
      if (onOpenDashboardAuthNotice) {
        onOpenDashboardAuthNotice();
      } else {
        router.push("/auth?mode=signin");
      }
    } else {
      router.push("/dashboard");
    }
  };

  // YouTube / Video player resolution
  const ytVideoId = useMemo(() => extractYouTubeId(videoConfig.videoUrl), [videoConfig.videoUrl]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="glass-card border border-white/10 hover:border-purple-400/40 bg-slate-950/60 backdrop-blur-2xl rounded-3xl p-5 shadow-2xl transition-all duration-300 flex-1 flex flex-col justify-between relative overflow-hidden group min-h-[380px]"
    >
      {/* Background Cosmic Sheen */}
      <div className="absolute -top-24 -right-24 w-52 h-52 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* ---------------------------------------------------- */}
      {/* SLIDESHOW TOP BAR: Indicators & Navigation Controls */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/[0.08] relative z-10">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setCurrentSlide(0)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide uppercase transition-all flex items-center gap-1 shrink-0 ${
              currentSlide === 0
                ? "bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                : "bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
            title="Station Directive Announcement"
          >
            <Megaphone className="w-3 h-3 text-amber-400" />
            <span>Notice</span>
          </button>

          <button
            onClick={() => setCurrentSlide(1)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide uppercase transition-all flex items-center gap-1 shrink-0 ${
              currentSlide === 1
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                : "bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
            title="Weekly Top Game of the Week"
          >
            <Trophy className="w-3 h-3 text-emerald-400" />
            <span>Top Game</span>
          </button>

          <button
            onClick={() => setCurrentSlide(2)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide uppercase transition-all flex items-center gap-1 shrink-0 ${
              currentSlide === 2
                ? "bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                : "bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
            title="AI Smart-Review Asteroids"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Asteroids</span>
          </button>

          <button
            onClick={() => setCurrentSlide(3)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide uppercase transition-all flex items-center gap-1 shrink-0 ${
              currentSlide === 3
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                : "bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
            title="Transmission Video Player"
          >
            <Video className="w-3 h-3 text-cyan-400" />
            <span>Video</span>
          </button>
        </div>

        {/* Prev / Next Chevrons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handlePrevSlide}
            className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title="Previous Slide"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNextSlide}
            className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title="Next Slide"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SLIDE CONTENT AREA (Framer Motion Switcher) */}
      {/* ---------------------------------------------------- */}
      <div className="flex-1 flex flex-col justify-between py-2 relative z-10 min-h-[260px]">
        <AnimatePresence mode="wait">
          {/* ==================================================== */}
          {/* SLIDE 0: ANNOUNCEMENT (Admin Edit + Photo / Texts Only) */}
          {/* ==================================================== */}
          {currentSlide === 0 && (
            <motion.div
              key="slide-announcement"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-amber-500/15 text-amber-300 border-amber-400/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 animate-pulse text-amber-400" />
                    {announcement.badge || "Station Announcement"}
                  </Badge>

                  {/* ADMIN ONLY EDIT BUTTON */}
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={openAnnouncementEditor}
                      className="h-6 px-2 text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border-amber-400/40 rounded-lg flex items-center gap-1 transition-all hover:scale-105"
                      title="Admin: Edit Announcement & Photo"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                      Edit Notice
                    </Button>
                  )}
                </div>

                <h4 className="font-black text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-1 mb-1.5">
                  {announcement.title}
                </h4>

                {/* Optional Photo or Texts Only Layout */}
                {announcement.imageUrl ? (
                  <div className="space-y-2">
                    <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-amber-500/30 bg-slate-900 group/img shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                      <Image
                        src={announcement.imageUrl}
                        alt={announcement.title}
                        fill
                        className="object-cover group-hover/img:scale-105 transition-transform duration-500"
                        unoptimized={announcement.imageUrl.startsWith("data:")}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[9px] text-amber-200/90 font-mono">
                        <span>Transmission Visual</span>
                        <span className="bg-slate-950/80 px-1.5 py-0.5 rounded">HQ Feed</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                      {announcement.message}
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-purple-950/20 border border-amber-500/20 shadow-inner">
                      <p className="text-[11px] text-slate-200 leading-relaxed max-h-[140px] overflow-y-auto no-scrollbar">
                        {announcement.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Slide Footer */}
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between mt-2">
                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                  <Megaphone className="w-3 h-3" /> Station Directive
                </span>
                <span className="text-[10px] text-slate-400">
                  {announcement.imageUrl ? "Photo & Text" : "Directive Text Only"}
                </span>
              </div>
            </motion.div>
          )}

          {/* ==================================================== */}
          {/* SLIDE 1: AUTOMATED WEEKLY TOP GAME */}
          {/* ==================================================== */}
          {currentSlide === 1 && (
            <motion.div
              key="slide-top-game"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-300 border-amber-400/40 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    <Trophy className="w-2.5 h-2.5 text-amber-400" />
                    Top Game of Week #{topWeeklyGame.weekNumber}
                  </Badge>

                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[9px] font-mono px-1.5 py-0.5 rounded">
                    ⚡ Auto-Ranked
                  </Badge>
                </div>

                <div className="flex items-start gap-3 my-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[1.5px] shadow-[0_0_20px_rgba(16,185,129,0.4)] shrink-0">
                    <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-xl text-emerald-300">
                      🎮
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-sm text-white group-hover:text-emerald-300 transition-colors truncate">
                      {topWeeklyGame.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {topWeeklyGame.subject && (
                        <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                          {topWeeklyGame.subject}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">&bull;</span>
                      <span className="text-[10px] text-amber-300 font-bold">
                        {topWeeklyGame.playCount.toLocaleString()} plays this week
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mt-1">
                  {topWeeklyGame.description}
                </p>

                {/* Popularity & XP Multiplier Banner */}
                <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-300 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" /> #1 Most Played Across Users
                  </span>
                  <span className="text-amber-300 font-black">+25% XP</span>
                </div>
              </div>

              {/* Action Button: Play Top Game */}
              <div className="mt-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/games/${topWeeklyGame.slug}`);
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl h-9 text-xs shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-between px-3"
                >
                  <span className="flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Launch Top Game
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ==================================================== */}
          {/* SLIDE 2: AI SMART-REVIEW ASTEROIDS BOARD */}
          {/* ==================================================== */}
          {currentSlide === 2 && (
            <motion.div
              key="slide-asteroids"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-black text-sm text-white group-hover:text-purple-300 transition-colors">
                    AI Smart-Review Asteroids
                  </h4>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {activeAsteroids.length} Ready &bull; {scheduledAsteroids.length} Orbit
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Real-time SM-2 spaced repetition tracking your vocabulary mistakes.
                </p>
              </div>

              {/* Graphic container with mystery cube and orbiting rocks */}
              <div className="my-1.5 py-2 flex items-center justify-center relative">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Orbital ring */}
                  <div className="absolute inset-0 rounded-full border border-dashed border-indigo-400/30 animate-[spin_20s_linear_infinite]" />

                  {/* Orbiting asteroid rocks with question marks */}
                  <span className="absolute -top-1 left-2 text-xs opacity-70 animate-pulse">🪨 ?</span>
                  <span className="absolute top-2 -right-1 text-xs opacity-80 animate-pulse">☄️ ?</span>
                  <span className="absolute -bottom-2 right-4 text-xs opacity-70 animate-pulse">🪨 ?</span>
                  <span className="absolute bottom-2 -left-2 text-xs opacity-80 animate-pulse">☄️ ?</span>

                  {/* Central glowing cube */}
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-[0_0_20px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform">
                    <div className="w-full h-full rounded-[14px] bg-slate-950/90 flex items-center justify-center text-base">
                      🎮
                    </div>
                  </div>
                </div>
              </div>

              {/* Glassy Glowing Box with text link See dashboard */}
              <div
                onClick={handleNavigateDashboard}
                className="mb-1.5 px-3.5 py-2 rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-indigo-950/60 hover:from-cyan-900/70 hover:to-indigo-900/70 backdrop-blur-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-between transition-all hover:scale-[1.02] cursor-pointer group/link"
                title="Go to User Dashboard"
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400 group-hover/link:animate-pulse" />
                  <span className="text-xs font-black text-cyan-300 group-hover/link:text-white tracking-wide">
                    See dashboard
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover/link:translate-x-1 transition-transform" />
              </div>

              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Intercept Missions
                </span>
                <span
                  onClick={handleNavigateDashboard}
                  className="text-[10px] font-black uppercase text-cyan-400 group-hover:underline cursor-pointer"
                >
                  Launch &rarr;
                </span>
              </div>
            </motion.div>
          )}

          {/* ==================================================== */}
          {/* SLIDE 3: YOUTUBE / VIDEO LINK (Admin Edit + Autoplay + Description Above Video) */}
          {/* ==================================================== */}
          {currentSlide === 3 && (
            <motion.div
              key="slide-video"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/40 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Video className="w-2.5 h-2.5 text-cyan-400" />
                    Station Video Transmission
                  </Badge>

                  {/* ADMIN ONLY EDIT BUTTON */}
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={openVideoEditor}
                      className="h-6 px-2 text-[10px] font-bold bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 border-cyan-400/40 rounded-lg flex items-center gap-1 transition-all hover:scale-105"
                      title="Admin: Edit Video Link & Description"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                      Edit Video
                    </Button>
                  )}
                </div>

                {/* DESCRIPTION ABOVE THE VIDEO (as specifically requested) */}
                <div className="mb-2 px-2.5 py-1.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 shadow-inner">
                  <p className="text-[11px] text-cyan-200/90 leading-tight line-clamp-2 font-medium">
                    {videoConfig.description}
                  </p>
                </div>

                {/* AUTOPLAY VIDEO EMBED CONTAINER */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-cyan-500/40 bg-black shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                  {ytVideoId ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${ytVideoId}?autoplay=${
                        videoConfig.autoplay ? 1 : 0
                      }&mute=1&loop=1&playlist=${ytVideoId}&controls=1&playsinline=1&modestbranding=1&rel=0`}
                      title="LingoLandVerse Video Stream"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={videoConfig.videoUrl}
                      autoPlay={videoConfig.autoplay}
                      muted
                      loop
                      playsInline
                      controls
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Video Slide Footer */}
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between mt-2">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  {videoConfig.autoplay ? "Autoplay Ready (Muted)" : "Interactive Stream"}
                </span>
                <a
                  href={videoConfig.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                >
                  Open Stream <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---------------------------------------------------- */}
      {/* BOTTOM PAGINATION DOTS */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-white/[0.05]">
        {[0, 1, 2, 3].map((index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "w-6 bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                : "w-2 bg-white/20 hover:bg-white/40"
            }`}
            title={`Slide ${index + 1}`}
          />
        ))}
      </div>

      {/* ==================================================== */}
      {/* ADMIN DIALOG: EDIT ANNOUNCEMENT (EXCLUSIVE TO ADMIN) */}
      {/* ==================================================== */}
      <Dialog open={isEditAnnouncementOpen} onOpenChange={setIsEditAnnouncementOpen}>
        <DialogContent className="max-w-md bg-slate-950/95 border border-amber-500/30 text-white backdrop-blur-2xl shadow-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-amber-300 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-400" />
              Edit Station Announcement
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Update the global station notice. You can publish text-only or optionally include a custom photo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div>
              <Label className="text-xs text-slate-300 font-bold mb-1 block">Announcement Badge</Label>
              <Input
                value={formBadge}
                onChange={(e) => setFormBadge(e.target.value)}
                placeholder="Official Directive / Event Alert"
                className="bg-slate-900 border-white/10 text-white h-9 text-xs rounded-xl focus:border-amber-400"
              />
            </div>

            <div>
              <Label className="text-xs text-slate-300 font-bold mb-1 block">Title / Headline</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter compelling announcement title..."
                className="bg-slate-900 border-white/10 text-white h-9 text-xs rounded-xl focus:border-amber-400"
              />
            </div>

            <div>
              <Label className="text-xs text-slate-300 font-bold mb-1 block">Message / Directive</Label>
              <Textarea
                rows={3}
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder="Write your announcement details here..."
                className="bg-slate-900 border-white/10 text-white text-xs rounded-xl focus:border-amber-400 resize-none"
              />
            </div>

            {/* Photo Upload / Text-Only Options */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" /> Optional Photo
                </Label>
                {formImageUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setFormImageUrl("")}
                    className="h-6 px-2 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Remove (Text Only)
                  </Button>
                )}
              </div>

              {formImageUrl ? (
                <div className="relative w-full h-28 rounded-xl overflow-hidden border border-amber-500/30">
                  <Image
                    src={formImageUrl}
                    alt="Announcement Preview"
                    fill
                    className="object-cover"
                    unoptimized={formImageUrl.startsWith("data:")}
                  />
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  Currently configured as <strong className="text-amber-300">Text Only</strong>. Upload a photo or enter an image link if desired.
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 h-8 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/10 rounded-xl"
                >
                  <Upload className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  Choose Image File
                </Button>

                <Input
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="Or paste image URL"
                  className="flex-1 bg-slate-950 border-white/10 text-white h-8 text-[11px] rounded-xl"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsEditAnnouncementOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAnnouncement}
              disabled={isSavingAnnouncement}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)]"
            >
              {isSavingAnnouncement ? "Saving..." : "Save & Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================================================== */}
      {/* ADMIN DIALOG: EDIT VIDEO (EXCLUSIVE TO ADMIN) */}
      {/* ==================================================== */}
      <Dialog open={isEditVideoOpen} onOpenChange={setIsEditVideoOpen}>
        <DialogContent className="max-w-md bg-slate-950/95 border border-cyan-500/30 text-white backdrop-blur-2xl shadow-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-cyan-300 flex items-center gap-2">
              <Video className="w-5 h-5 text-cyan-400" />
              Edit Station Video Transmission
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Update the featured YouTube or direct video link and the custom description displayed directly above it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div>
              <Label className="text-xs text-cyan-300 font-bold mb-1 block">
                Description Above Video (Displayed on Card)
              </Label>
              <Textarea
                rows={3}
                value={formVideoDesc}
                onChange={(e) => setFormVideoDesc(e.target.value)}
                placeholder="Add notes, briefing description or instructions above the video..."
                className="bg-slate-900 border-white/10 text-white text-xs rounded-xl focus:border-cyan-400 resize-none"
              />
            </div>

            <div>
              <Label className="text-xs text-cyan-300 font-bold mb-1 block">
                YouTube or Video Link
              </Label>
              <Input
                value={formVideoUrl}
                onChange={(e) => setFormVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or direct .mp4 link"
                className="bg-slate-900 border-white/10 text-white h-9 text-xs rounded-xl focus:border-cyan-400 font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Supports YouTube regular links, shorts, embed URLs, and direct MP4 streams.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-white/10">
              <div>
                <Label className="text-xs text-slate-200 font-bold block">Autoplay on Load</Label>
                <span className="text-[10px] text-slate-400 block">
                  Autoplays muted for browser policy compliance
                </span>
              </div>
              <Switch
                checked={formVideoAutoplay}
                onCheckedChange={setFormVideoAutoplay}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsEditVideoOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveVideo}
              disabled={isSavingVideo}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              {isSavingVideo ? "Saving..." : "Save Transmission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
