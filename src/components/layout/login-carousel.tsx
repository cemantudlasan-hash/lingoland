'use client';

import { useState, useEffect, useCallback } from "react";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { doc, onSnapshot, type FirestoreError } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Sparkles, 
  Play, 
  Gamepad2, 
  Brain, 
  GraduationCap, 
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselSlide {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  createdAt: number;
}

const defaultSlides: CarouselSlide[] = [
  {
    id: "default-1",
    title: "Welcome to LingoLandVerse",
    description: "Learn languages and educational subjects with 79+ interactive classroom games, AI speaking simulations, and CEFR-aligned mastery tracks.",
    mediaUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
    mediaType: "image",
    createdAt: 1
  },
  {
    id: "default-2",
    title: "Interactive Lingo-Pet & Companion",
    description: "Adopt, nurture, and level up your animated cosmic companion while completing daily spaced-repetition vocabulary quests.",
    mediaUrl: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&auto=format&fit=crop&q=60",
    mediaType: "image",
    createdAt: 2
  },
  {
    id: "default-3",
    title: "Real-Time Arena & Leaderboard",
    description: "Challenge your classmates in real-time speed battles, grammar duels, and climb global language leaderboards.",
    mediaUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=60",
    mediaType: "image",
    createdAt: 3
  }
];

function getGoogleDriveFileId(url: string) {
  if (!url) return null;
  const dMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) return dMatch[1];
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return idMatch[1];
  return null;
}

function getEmbedUrl(url: string, autoplay: boolean = true) {
  if (!url) return null;
  const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const ytMatch = url.match(ytRegExp);
  if (ytMatch && ytMatch[2].length === 11) {
    const videoId = ytMatch[2];
    const autoplayVal = autoplay ? "1" : "0";
    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplayVal}&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0`;
  }
  return null;
}

function resolveVideoUrl(url: string) {
  if (!url) return "";
  const driveId = getGoogleDriveFileId(url);
  if (driveId) {
    return `https://drive.google.com/uc?export=view&id=${driveId}`;
  }
  return url;
}

function resolveImageUrl(url: string) {
  if (!url) return "";
  const driveId = getGoogleDriveFileId(url);
  if (driveId) {
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }
  return url;
}

export function LoginCarousel() {
  const firestore = useFirestore();
  const [slides, setSlides] = useState<CarouselSlide[]>(defaultSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slidesDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, "announcements", "login_carousel");
  }, [firestore]);

  useEffect(() => {
    if (!slidesDocRef) return;

    const unsubscribe = onSnapshot(
      slidesDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.slides && Array.isArray(data.slides) && data.slides.length > 0) {
            setSlides(data.slides);
          } else {
            setSlides(defaultSlides);
          }
        } else {
          setSlides(defaultSlides);
        }
      },
      (error: FirestoreError) => {
        console.warn("Firestore announcements/login_carousel read ignored:", error);
        setSlides(defaultSlides);
      }
    );

    return () => unsubscribe();
  }, [slidesDocRef]);

  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  const handleNext = useCallback(() => {
    if (slides.length === 0) return;
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    if (slides.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const currentSlide = slides[currentIndex] || slides[0] || defaultSlides[0];
    const isVideo = currentSlide.mediaType === "video";
    const autoplayDelay = isVideo ? 16000 : 7500;

    const timer = setInterval(() => {
      handleNext();
    }, autoplayDelay);

    return () => clearInterval(timer);
  }, [handleNext, slides, currentIndex]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 350 : -350,
      opacity: 0,
      scale: 0.96
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 350 : -350,
      opacity: 0,
      scale: 0.96
    })
  };

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex] || slides[0] || defaultSlides[0];
  const embedUrl = getEmbedUrl(currentSlide.mediaUrl, true);
  const resolvedImageUrl = resolveImageUrl(currentSlide.mediaUrl);
  const isVideo = currentSlide.mediaType === "video";

  return (
    <div className="relative w-full bg-slate-950/70 backdrop-blur-3xl rounded-3xl border border-cyan-500/35 overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.7)] p-4 sm:p-5 lg:p-6 flex flex-col md:flex-row gap-6 lg:gap-8 min-h-[300px] md:min-h-[390px] lg:min-h-[440px] xl:min-h-[480px] transition-all duration-500 group select-none">
      
      {/* ── Ambient Background Glow Orbs ── */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── Sleek Top Edge Highlight Beam ── */}
      <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

      {/* ── Media Viewport (Left 60%) ── */}
      <div 
        onClick={() => {
          if (currentSlide.mediaUrl) {
            window.open(currentSlide.mediaUrl, '_blank');
          }
        }}
        title="Click to view full preview in new tab"
        className="relative w-full md:w-[58%] lg:w-[60%] h-[230px] sm:h-[290px] md:h-[350px] lg:h-[400px] xl:h-[440px] rounded-2xl overflow-hidden bg-slate-950/90 border border-cyan-500/35 shrink-0 cursor-pointer hover:border-cyan-400/70 transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.8)] group/media"
      >
        {/* Futuristic Cyber Corner Bracket Crosshairs */}
        <div className="absolute top-2.5 left-2.5 z-30 pointer-events-none flex items-center gap-1 text-[10px] text-cyan-400/70 font-mono font-bold">
          <span className="w-2.5 h-[1.5px] bg-cyan-400/80" />
          <span className="h-2.5 w-[1.5px] bg-cyan-400/80 absolute top-0 left-0" />
        </div>
        <div className="absolute top-2.5 right-2.5 z-30 pointer-events-none flex items-center gap-1 text-[10px] text-cyan-400/70 font-mono font-bold">
          <span className="w-2.5 h-[1.5px] bg-cyan-400/80" />
          <span className="h-2.5 w-[1.5px] bg-cyan-400/80 absolute top-0 right-0" />
        </div>
        <div className="absolute bottom-2.5 left-2.5 z-30 pointer-events-none flex items-center gap-1 text-[10px] text-cyan-400/70 font-mono font-bold">
          <span className="w-2.5 h-[1.5px] bg-cyan-400/80" />
          <span className="h-2.5 w-[1.5px] bg-cyan-400/80 absolute bottom-0 left-0" />
        </div>
        <div className="absolute bottom-2.5 right-2.5 z-30 pointer-events-none flex items-center gap-1 text-[10px] text-cyan-400/70 font-mono font-bold">
          <span className="w-2.5 h-[1.5px] bg-cyan-400/80" />
          <span className="h-2.5 w-[1.5px] bg-cyan-400/80 absolute bottom-0 right-0" />
        </div>

        {/* Live Broadcast / Media Badge */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-cyan-400/30 text-cyan-300 text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span>{isVideo ? "4K Stream" : "Interactive Highlight"}</span>
          </div>
        </div>

        {/* Floating Quick Action Pill on Hover */}
        <div className="absolute top-3 right-3 z-30 opacity-0 group-hover/media:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 text-[10px] font-bold backdrop-blur-md">
            <span>Explore</span>
            <ExternalLink className="w-3 h-3 text-cyan-300" />
          </div>
        </div>

        {/* Media Slide Renderer */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {currentSlide.mediaUrl ? (
              isVideo ? (
                embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={currentSlide.title}
                    className="w-full h-full object-cover pointer-events-none"
                    allow="autoplay; encrypted-media"
                    frameBorder="0"
                  />
                ) : (
                  <video
                    src={resolveVideoUrl(currentSlide.mediaUrl)}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="object-cover w-full h-full pointer-events-none"
                  />
                )
              ) : (
                <>
                  {/* Ambient blurred backdrop so any aspect ratio looks seamless */}
                  <img
                    src={resolvedImageUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
                  />
                  <img
                    src={resolvedImageUrl}
                    alt={currentSlide.title}
                    className="relative z-10 object-contain w-full h-full pointer-events-none drop-shadow-2xl transition-transform duration-700 group-hover/media:scale-105"
                  />
                </>
              )
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-pink-900/40 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-zinc-600" />
              </div>
            )}
            {/* Cinematic Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30 pointer-events-none z-20" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Content & Features Showcase (Right 40%) ── */}
      <div className="flex flex-col justify-between flex-1 relative min-h-[170px] py-1 lg:py-2">
        <div className="flex-1 flex flex-col justify-center space-y-3.5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-3 lg:space-y-4"
            >
              {/* Category Pill Tag */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                  <Sparkles className="w-3 h-3 text-cyan-300 animate-pulse" />
                  <span>Spotlight • Module 0{currentIndex + 1} of 0{slides.length}</span>
                </span>
              </div>

              {/* Slide Title with Metallic Gradient */}
              <h3 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black bg-gradient-to-r from-white via-cyan-100 to-indigo-200 bg-clip-text text-transparent tracking-tight leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                {currentSlide.title}
              </h3>

              {/* Slide Description */}
              <p className="text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed font-medium">
                {currentSlide.description}
              </p>

              {/* 3 High-Tech Curriculum Feature Micro-Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] font-bold text-slate-300">
                  <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>79+ Games</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] font-bold text-slate-300">
                  <Brain className="w-3.5 h-3.5 text-indigo-400" />
                  <span>SM-2 Memory</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] font-bold text-slate-300">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CEFR Aligned</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Interactive Progress & Navigation Controls Bar ── */}
        <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-white/10 relative z-20">
          {/* Animated Slide Capsule Bars */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > currentIndex ? 1 : -1);
                  setCurrentIndex(i);
                }}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300 relative overflow-hidden cursor-pointer",
                  i === currentIndex 
                    ? "w-8 sm:w-10 bg-gradient-to-r from-teal-400 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" 
                    : "w-2.5 bg-white/20 hover:bg-white/40"
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Previous / Next Arrow Capsule Controls */}
          {slides.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/50 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 active:scale-95 shadow-md cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/50 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 active:scale-95 shadow-md cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
