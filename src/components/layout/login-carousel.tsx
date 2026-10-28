'use client';

import { useState, useEffect, useCallback } from "react";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { doc, onSnapshot, type FirestoreError } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

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
    description: "Learn languages and educational subjects with 66+ interactive classroom games.",
    mediaUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
    mediaType: "image",
    createdAt: 1
  },
  {
    id: "default-2",
    title: "Interactive Lingo-Pet",
    description: "Adopt, feed, and grow your animated companion while studying and completing tasks.",
    mediaUrl: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&auto=format&fit=crop&q=60",
    mediaType: "image",
    createdAt: 2
  },
  {
    id: "default-3",
    title: "Vocabulary Snake Arena",
    description: "Challenge your classmates in real-time vocabulary battles and climb the leaderboard.",
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
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

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
        console.warn("Firestore announcements/login_carousel read ignored (guest/auth context):", error);
        setSlides(defaultSlides);
      }
    );

    return () => unsubscribe();
  }, [slidesDocRef]);

  // Safeguard: Clamp currentIndex if slides array length changes
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

  // Autoplay functionality - only autoplay if not currently displaying a video
  useEffect(() => {
    if (slides.length <= 1) return;
    const currentSlide = slides[currentIndex] || slides[0] || defaultSlides[0];
    const isVideo = currentSlide.mediaType === "video";
    // Don't auto-rotate away if it's a video (let users watch it), but auto-rotate images
    const autoplayDelay = isVideo ? 15000 : 7000;

    const timer = setInterval(() => {
      handleNext();
    }, autoplayDelay);
    return () => clearInterval(timer);
  }, [handleNext, slides, currentIndex]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  if (slides.length === 0) return null;

  // Safe fallback lookup
  const currentSlide = slides[currentIndex] || slides[0] || defaultSlides[0];
  const embedUrl = getEmbedUrl(currentSlide.mediaUrl, true);
  const resolvedImageUrl = resolveImageUrl(currentSlide.mediaUrl);

  return (
    <div className="relative w-full bg-slate-950/50 backdrop-blur-2xl rounded-3xl border border-cyan-500/30 overflow-hidden shadow-[0_0_45px_rgba(6,182,212,0.2)] p-4 sm:p-5 lg:p-6 flex flex-col md:flex-row gap-6 lg:gap-8 min-h-[280px] md:min-h-[380px] lg:min-h-[440px] xl:min-h-[480px]">
      <div 
        onClick={() => {
          if (currentSlide.mediaUrl) {
            window.open(currentSlide.mediaUrl, '_blank');
          }
        }}
        title="Click to open link in a new tab"
        className="relative w-full md:w-[58%] lg:w-[60%] h-[220px] sm:h-[280px] md:h-[340px] lg:h-[400px] xl:h-[440px] rounded-2xl overflow-hidden bg-slate-950/80 border border-cyan-500/30 shrink-0 cursor-pointer hover:border-cyan-400/60 transition-all shadow-2xl"
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {currentSlide.mediaUrl ? (
              currentSlide.mediaType === "video" ? (
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
                  {/* Ambient blurred background so non-16:9 photos fill the entire frame without black bars */}
                  <img
                    src={resolvedImageUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 pointer-events-none"
                  />
                  <img
                    src={resolvedImageUrl}
                    alt={currentSlide.title}
                    className="relative z-10 object-contain w-full h-full pointer-events-none"
                  />
                </>
              )
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-pink-900/40 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-zinc-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent pointer-events-none z-20" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col justify-between flex-1 relative min-h-[160px] py-1 lg:py-2">
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 lg:space-y-4"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest bg-cyan-500/15 border border-cyan-400/35 text-cyan-300 w-fit">
                Featured Spotlight • Slide {currentIndex + 1} of {slides.length}
              </span>
              <h3 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent tracking-tight leading-tight">
                {currentSlide.title}
              </h3>
              <p className="text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed font-medium">
                {currentSlide.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 relative z-20">
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > currentIndex ? 1 : -1);
                  setCurrentIndex(i);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex ? "w-6 bg-purple-500" : "w-2 bg-zinc-700 hover:bg-zinc-600"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {slides.length > 1 && (
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                className="w-9 h-9 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shadow-md"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="w-9 h-9 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shadow-md"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
