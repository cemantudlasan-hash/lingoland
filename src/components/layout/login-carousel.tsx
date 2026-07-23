'use client';

import { useState, useEffect, useCallback } from "react";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, onSnapshot, type FirestoreError } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

interface CarouselSlide {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: number;
}

const defaultSlides: CarouselSlide[] = [
  {
    id: "default-1",
    title: "Welcome to LingoLandVerse",
    description: "Learn languages and educational subjects with 66+ interactive classroom games.",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
    createdAt: 1
  },
  {
    id: "default-2",
    title: "Interactive Lingo-Pet",
    description: "Adopt, feed, and grow your animated companion while studying and completing tasks.",
    imageUrl: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&auto=format&fit=crop&q=60",
    createdAt: 2
  },
  {
    id: "default-3",
    title: "Vocabulary Snake Arena",
    description: "Challenge your classmates in real-time vocabulary battles and climb the leaderboard.",
    imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=60",
    createdAt: 3
  }
];

export function LoginCarousel() {
  const firestore = useFirestore();
  const [slides, setSlides] = useState<CarouselSlide[]>(defaultSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const slidesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "login_carousel"), orderBy("createdAt", "asc"));
  }, [firestore]);

  useEffect(() => {
    if (!slidesQuery) return;

    const unsubscribe = onSnapshot(
      slidesQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedSlides: CarouselSlide[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            loadedSlides.push({
              id: doc.id,
              title: data.title || "",
              description: data.description || "",
              imageUrl: data.imageUrl || "",
              createdAt: data.createdAt || 0,
            });
          });
          setSlides(loadedSlides);
        } else {
          setSlides(defaultSlides);
        }
      },
      (error: FirestoreError) => {
        console.warn("Firestore collection login_carousel read ignored (guest/auth context):", error);
        setSlides(defaultSlides);
      }
    );

    return () => unsubscribe();
  }, [slidesQuery]);

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

  // Autoplay functionality
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [handleNext, slides.length]);

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

  return (
    <div className="relative w-full bg-zinc-950/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-2xl p-4 flex flex-col md:flex-row gap-6 min-h-[220px]">
      <div className="relative w-full md:w-1/2 h-[180px] md:h-[240px] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 shrink-0">
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
            {currentSlide.imageUrl ? (
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-pink-900/40 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-zinc-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col justify-between flex-1 relative min-h-[140px]">
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <h3 className="text-xl md:text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-pink-500 bg-clip-text text-transparent tracking-tight">
                {currentSlide.title}
              </h3>
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-medium">
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
