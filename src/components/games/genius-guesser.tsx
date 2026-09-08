"use client";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  Play, RotateCcw, Check, Eye, EyeOff, Maximize, Minimize,
  Shuffle, Trophy, Minus, Plus, Lightbulb, SkipForward, Square,
  Crown, Medal, Sparkles, Volume2, VolumeX, ArrowRight, Flame
} from "lucide-react";
import Link from "next/link";

const CATEGORIES: Record<string, string[]> = {
  Animals: [
    "Eagle", "Dolphin", "Penguin", "Tiger", "Kangaroo", "Flamingo", "Gorilla", "Octopus", "Chameleon", "Giraffe",
    "Cheetah", "Koala", "Panda", "Zebra", "Hedgehog", "Walrus", "Peacock", "Platypus", "Otter", "Wolf",
    "Sloth", "Hippopotamus", "Rhino", "Lemur", "Meerkat", "Jellyfish", "Stingray", "Seahorse"
  ],
  "Food & Drinks": [
    "Sushi", "Pizza", "Mango", "Lemonade", "Pancake", "Burrito", "Smoothie", "Waffle", "Avocado", "Popcorn",
    "Cheeseburger", "Spaghetti", "Croissant", "Tacos", "Donut", "Boba Tea", "Milkshake", "Guacamole", "Dumpling", "Lasagna",
    "Pad Thai", "Churros", "Brownie", "Hotdog", "Pretzel", "Ramen", "Falafel", "Cupcake"
  ],
  Countries: [
    "Brazil", "Iceland", "Egypt", "Japan", "Canada", "Kenya", "Norway", "Thailand", "Mexico", "Portugal",
    "Australia", "Germany", "Argentina", "South Korea", "Switzerland", "Greece", "India", "Vietnam", "Morocco", "New Zealand",
    "Italy", "Spain", "France", "Netherlands", "Turkey", "Singapore", "Jamaica", "Philippines"
  ],
  "Hollywood Movies": [
    "Titanic", "Inception", "Frozen", "Avengers", "Interstellar", "Clueless", "Grease", "Moana", "Shrek", "Jaws",
    "Jurassic Park", "Harry Potter", "The Matrix", "Spider-Man", "Finding Nemo", "Avatar", "Star Wars", "Coco", "Toy Story", "Gladiator",
    "The Lion King", "Back to the Future", "Barbie", "Up", "Home Alone", "Ghostbusters"
  ],
  "Household Objects": [
    "Blender", "Umbrella", "Pillow", "Toaster", "Scissors", "Curtain", "Dustpan", "Kettle", "Hamper", "Stapler",
    "Microwave", "Mirror", "Candle", "Toothbrush", "Flashlight", "Vacuum", "Hanger", "Blanket", "Corkscrew", "Thermometer",
    "Clock", "Spatula", "Laundry Basket", "Cushion", "Ironing Board", "Mug"
  ],
  "Jobs & Professions": [
    "Surgeon", "Astronaut", "Architect", "Chef", "Journalist", "Detective", "Pilot", "Pharmacist", "Geologist", "Animator",
    "Firefighter", "Veterinarian", "Photographer", "Librarian", "Electrician", "Dentist", "Sculptor", "Barista", "Archaeologist", "Diver",
    "Judge", "Carpenter", "Baker", "Flight Attendant", "Mechanic", "Paramedic"
  ],
  "Famous Landmarks": [
    "Colosseum", "Eiffel Tower", "Stonehenge", "Taj Mahal", "Niagara Falls", "Machu Picchu", "Parthenon", "Big Ben", "Pyramids", "Angkor Wat",
    "Golden Gate Bridge", "Mount Everest", "Statue of Liberty", "Great Wall of China", "Sydney Opera House", "Grand Canyon", "Mount Fuji", "Christ the Redeemer", "Leaning Tower of Pisa"
  ],
  Sports: [
    "Badminton", "Surfing", "Archery", "Fencing", "Gymnastics", "Polo", "Curling", "Bobsled", "Lacrosse", "Squash",
    "Basketball", "Volleyball", "Skateboarding", "Snowboarding", "Table Tennis", "Rugby", "Cricket", "Ice Hockey", "Boxing", "Bowling",
    "Rock Climbing", "Water Polo", "Karate", "Darts"
  ],
  Superheroes: [
    "Batman", "Wolverine", "Black Widow", "Flash", "Thor", "Wonder Woman", "Iron Man", "Deadpool", "Aquaman", "Storm",
    "Spider-Man", "Captain America", "Hulk", "Doctor Strange", "Black Panther", "Superman", "Green Lantern", "Robin", "Hawkeye", "Groot"
  ],
  "School Subjects": [
    "Algebra", "Biology", "Literature", "Geography", "Chemistry", "Philosophy", "Economics", "Physics", "History", "Music",
    "Art", "Geometry", "Astronomy", "Drama", "Psychology", "Sociology", "Computer Science", "Languages", "Calculus", "Anthropology"
  ],
  "Science & Nature": [
    "Volcano", "Tsunami", "Galaxy", "Black Hole", "Telescope", "Microscope", "Fossil", "DNA", "Eclipse", "Atmosphere",
    "Lightning", "Aurora", "Constellation", "Glacier", "Meteorite", "Gravity", "Rainforest", "Coral Reef"
  ],
  "Music & Instruments": [
    "Violin", "Saxophone", "Drum Set", "Electric Guitar", "Ukulele", "Accordion", "Trumpet", "Clarinet", "Harp", "Harmonica",
    "Cello", "Flute", "Keyboard", "Microphone", "Tambourine", "Trombone"
  ]
};

type GamePhase = "setup" | "playing" | "turn_over" | "game_over";

interface TeamScore {
  name: string;
  score: number;
}

// Sound effects using Web Audio API synthesized tones (zero external files required)
function playSynthesizedSound(type: "correct" | "skip" | "timeout" | "win") {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "correct") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else if (type === "skip") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else if (type === "timeout") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.45);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.55);
      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    } else if (type === "win") {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "triangle";
        const startTime = ctx.currentTime + idx * 0.12;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.35, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.35);
        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    }
  } catch {
    // AudioContext blocked or not supported in browser environment
  }
}

export function GeniusGuesser({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const game = getGameBySlug(slug);

  // Settings
  const [timerDuration, setTimerDuration] = React.useState(60);
  const [roundsTotal, setRoundsTotal] = React.useState(1); // 1 round = Team A then Team B
  const [selectedCategory, setSelectedCategory] = React.useState<string>("Animals");
  const [showMoreCategories, setShowMoreCategories] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [showWord, setShowWord] = React.useState(true);

  // Match State
  const [phase, setPhase] = React.useState<GamePhase>("setup");
  const [timeLeft, setTimeLeft] = React.useState(60);
  const [activeTeam, setActiveTeam] = React.useState<0 | 1>(0);
  const [currentRound, setCurrentRound] = React.useState(1);
  const [turnsFinished, setTurnsFinished] = React.useState(0);
  const [teams, setTeams] = React.useState<TeamScore[]>([
    { name: "Team A", score: 0 },
    { name: "Team B", score: 0 }
  ]);

  // Turn Gameplay State
  const [secretWord, setSecretWord] = React.useState("");
  const [usedWords, setUsedWords] = React.useState<string[]>([]);
  const [turnGuessedCount, setTurnGuessedCount] = React.useState(0);
  const [lastGuessedWord, setLastGuessedWord] = React.useState<string | null>(null);
  const [wordFlash, setWordFlash] = React.useState<"correct" | "skip" | null>(null);

  // Fullscreen Detection
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Cleanup interval on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const playSfx = React.useCallback((type: "correct" | "skip" | "timeout" | "win") => {
    if (soundEnabled) {
      playSynthesizedSound(type);
    }
  }, [soundEnabled]);

  // Helper to pick next word from category without repeating
  const getNextWord = React.useCallback((categoryName: string, currentUsed: string[]) => {
    const wordList = CATEGORIES[categoryName] || CATEGORIES.Animals;
    const available = wordList.filter((w) => !currentUsed.includes(w.toLowerCase()));
    if (available.length === 0) {
      // If all words used, reset pool
      const pick = wordList[Math.floor(Math.random() * wordList.length)];
      return { word: pick, nextUsed: [pick.toLowerCase()] };
    }
    const pick = available[Math.floor(Math.random() * available.length)];
    return { word: pick, nextUsed: [...currentUsed, pick.toLowerCase()] };
  }, []);

  // START ACTIVE TEAM'S TURN
  const startTurn = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const firstWordData = getNextWord(selectedCategory, usedWords);
    setSecretWord(firstWordData.word);
    setUsedWords(firstWordData.nextUsed);
    setTurnGuessedCount(0);
    setLastGuessedWord(null);
    setWordFlash(null);
    setTimeLeft(timerDuration);
    setPhase("playing");

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // TIME RUNS OUT
  const handleTimeExpired = React.useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    playSfx("timeout");

    setTurnsFinished((prevTurns) => {
      const nextTurns = prevTurns + 1;
      const totalTurns = roundsTotal * 2;

      if (nextTurns >= totalTurns) {
        // Both teams finished all rounds! Go to Leaderboard!
        setTimeout(() => {
          playSfx("win");
        }, 300);
        setPhase("game_over");
      } else {
        // Turn over, switch to next team
        setPhase("turn_over");
      }
      return nextTurns;
    });
  }, [roundsTotal, playSfx]);

  // CORRECT GUESS (+1 point, automatically load next word from same category, timer keeps running)
  const handleCorrect = () => {
    if (phase !== "playing") return;

    playSfx("correct");
    setWordFlash("correct");
    setTimeout(() => setWordFlash(null), 300);

    // Increment team score & turn count
    setTeams((prev) =>
      prev.map((t, idx) => (idx === activeTeam ? { ...t, score: t.score + 1 } : t))
    );
    setTurnGuessedCount((prev) => prev + 1);
    setLastGuessedWord(secretWord);

    // Get next word in same category
    const nextData = getNextWord(selectedCategory, usedWords);
    setSecretWord(nextData.word);
    setUsedWords(nextData.nextUsed);
  };

  // SKIP / PASS (next word, no point, timer keeps running)
  const handleSkip = () => {
    if (phase !== "playing") return;

    playSfx("skip");
    setWordFlash("skip");
    setTimeout(() => setWordFlash(null), 300);

    const nextData = getNextWord(selectedCategory, usedWords);
    setSecretWord(nextData.word);
    setUsedWords(nextData.nextUsed);
  };

  // END TURN EARLY (manual button)
  const handleEndTurnEarly = () => {
    handleTimeExpired();
  };

  // PROCEED TO NEXT TEAM'S TURN (from turn_over screen)
  const proceedToNextTurn = () => {
    // Alternate team: 0 -> 1, or 1 -> 0
    const nextTeamIdx = (activeTeam === 0 ? 1 : 0) as 0 | 1;
    setActiveTeam(nextTeamIdx);

    // If alternating back to Team A, we start the next round
    if (nextTeamIdx === 0) {
      setCurrentRound((r) => r + 1);
    }

    setSecretWord("");
    setPhase("setup");
  };

  // REMATCH (Keep team names, reset scores, start at round 1)
  const handleRematch = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
    setActiveTeam(0);
    setCurrentRound(1);
    setTurnsFinished(0);
    setTurnGuessedCount(0);
    setSecretWord("");
    setUsedWords([]);
    setTimeLeft(timerDuration);
    setPhase("setup");
  };

  // FULL RESET (reset everything to defaults)
  const fullReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTeams([
      { name: "Team A", score: 0 },
      { name: "Team B", score: 0 }
    ]);
    setActiveTeam(0);
    setCurrentRound(1);
    setTurnsFinished(0);
    setTurnGuessedCount(0);
    setSecretWord("");
    setUsedWords([]);
    setSelectedCategory("Animals");
    setTimeLeft(60);
    setTimerDuration(60);
    setRoundsTotal(1);
    setPhase("setup");
  };

  // Score adjustments for host manual edits
  const changeScore = (teamIdx: number, delta: number) => {
    setTeams((prev) =>
      prev.map((t, i) => (i === teamIdx ? { ...t, score: Math.max(0, t.score + delta) } : t))
    );
  };

  const updateTeamName = (idx: number, name: string) => {
    setTeams((prev) => prev.map((t, i) => (i === idx ? { ...t, name } : t)));
  };

  const pickRandomCategory = () => {
    const keys = Object.keys(CATEGORIES);
    setSelectedCategory(keys[Math.floor(Math.random() * keys.length)]);
  };

  // Timer visualization
  const timerPct = phase === "playing" ? timeLeft / timerDuration : 1;
  const timerColor =
    timeLeft > timerDuration * 0.5 ? "#22c55e" : timeLeft > timerDuration * 0.2 ? "#eab308" : "#ef4444";
  const radius = 54;
  const circ = 2 * Math.PI * radius;

  const PRIMARY_CATS = Object.keys(CATEGORIES).slice(0, 6);
  const MORE_CATS = Object.keys(CATEGORIES).slice(6);

  if (!game) return <div>Game not found.</div>;
  const Icon = game.icon;

  const currentTeamObj = teams[activeTeam];
  const otherTeamIdx = activeTeam === 0 ? 1 : 0;
  const otherTeamObj = teams[otherTeamIdx];

  // Winner logic for leaderboard
  const winnerIndex =
    teams[0].score > teams[1].score ? 0 : teams[1].score > teams[0].score ? 1 : -1;

  return (
    <Card
      className={cn(
        "w-full transition-all duration-500 flex flex-col flex-1",
        isFullscreen
          ? "min-h-screen rounded-none border-none max-w-none bg-background"
          : "min-h-full rounded-none border-0 shadow-none"
      )}
    >
      {/* HEADER BAR */}
      <CardHeader className={cn("text-center relative pb-2", isFullscreen ? "pt-12 md:pt-14 pb-4" : "pt-4")}>
        {/* Fullscreen & Sound toggles */}
        <div className={cn("absolute flex items-center gap-1 z-[100]", isFullscreen ? "top-6 right-6" : "top-4 right-4")}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => setSoundEnabled((p) => !p)}
            title={soundEnabled ? "Mute sound" : "Enable sound"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-2 gap-1 text-muted-foreground hover:text-foreground"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? "Exit" : "Full"}</span>
          </Button>
        </div>

        {!isFullscreen && (
          <div className="flex justify-center mb-2">
            <Icon className="w-10 h-10 text-primary" />
          </div>
        )}

        <CardTitle className={cn("font-black tracking-tight uppercase flex items-center justify-center gap-2", isFullscreen ? "text-4xl md:text-5xl" : "text-2xl")}>
          <Lightbulb className={cn("text-yellow-400", isFullscreen ? "h-9 w-9" : "h-6 w-6")} />
          {game.title}
        </CardTitle>

        <CardDescription className={cn(isFullscreen ? "text-base md:text-lg mt-1" : "text-xs md:text-sm")}>
          Guess the secret word before time runs out! Each correct guess pulls the next word automatically!
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 px-4 pb-4 flex-1 flex flex-col justify-between">
        {/* ========================================================================= */}
        {/* 1. PLAYING PHASE (Active turn with continuous word chain) */}
        {/* ========================================================================= */}
        {phase === "playing" && (
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {/* Active Turn Banner */}
            <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                <span className="font-black text-sm uppercase tracking-wider text-primary">
                  {currentTeamObj.name}&apos;s Turn
                </span>
                <span className="text-xs text-muted-foreground font-semibold">
                  (Round {currentRound} of {roundsTotal})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-muted/60 px-2.5 py-1 rounded-full font-bold text-muted-foreground">
                  📂 {selectedCategory}
                </span>
                <span className="text-xs font-black bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5" /> {turnGuessedCount} this turn
                </span>
              </div>
            </div>

            {/* MAIN WORD & TIMER DISPLAY */}
            <div
              className={cn(
                "relative flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-300 bg-black/60 shadow-xl",
                wordFlash === "correct"
                  ? "border-green-500 shadow-green-500/20 scale-[1.01]"
                  : wordFlash === "skip"
                  ? "border-yellow-500/50"
                  : "border-border/30",
                isFullscreen ? "py-10 md:py-14 gap-6" : "py-6 gap-4"
              )}
            >
              {/* Eye toggle for host */}
              <button
                onClick={() => setShowWord((p) => !p)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 bg-muted/40 px-2.5 py-1 rounded-md"
                title={showWord ? "Hide word from guessers" : "Reveal word"}
              >
                {showWord ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span className="text-[11px] font-bold">{showWord ? "Hide" : "Peek"}</span>
              </button>

              {/* SECRET WORD CARD */}
              <div className="text-center px-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  {selectedCategory}
                </p>
                <div
                  className={cn(
                    "rounded-2xl px-8 py-5 text-center font-black tracking-widest uppercase border transition-all duration-200",
                    wordFlash === "correct"
                      ? "bg-green-500/20 border-green-500 text-green-300 scale-105"
                      : "bg-primary/15 border-primary/40 text-primary shadow-[0_0_25px_rgba(168,85,247,0.25)]",
                    isFullscreen ? "text-4xl sm:text-6xl md:text-7xl" : "text-3xl sm:text-4xl"
                  )}
                >
                  {showWord ? secretWord.toUpperCase() : "••••••••"}
                </div>
                {lastGuessedWord && (
                  <p className="text-xs text-green-400 mt-2 font-semibold flex items-center justify-center gap-1">
                    <Check className="h-3 w-3" /> Last: <span className="font-bold">{lastGuessedWord}</span> (+1)
                  </p>
                )}
              </div>

              {/* CIRCULAR COUNTDOWN TIMER */}
              <div className="relative flex items-center justify-center">
                <svg width={isFullscreen ? 150 : 110} height={isFullscreen ? 150 : 110} className="-rotate-90">
                  <circle
                    cx={isFullscreen ? 75 : 55}
                    cy={isFullscreen ? 75 : 55}
                    r={isFullscreen ? 65 : 46}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted/20"
                  />
                  <circle
                    cx={isFullscreen ? 75 : 55}
                    cy={isFullscreen ? 75 : 55}
                    r={isFullscreen ? 65 : 46}
                    fill="none"
                    stroke={timerColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={isFullscreen ? 2 * Math.PI * 65 : 2 * Math.PI * 46}
                    strokeDashoffset={
                      isFullscreen
                        ? (2 * Math.PI * 65) * (1 - timerPct)
                        : (2 * Math.PI * 46) * (1 - timerPct)
                    }
                    style={{ transition: "stroke-dashoffset 0.8s linear, stroke 0.4s" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span
                    className={cn("font-mono font-black", isFullscreen ? "text-4xl" : "text-2xl")}
                    style={{ color: timerColor }}
                  >
                    {timeLeft}s
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Remaining</span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS (DURING PLAY) */}
            <div className="grid grid-cols-4 gap-3 pt-2">
              {/* BIG GREEN CORRECT BUTTON */}
              <Button
                onClick={handleCorrect}
                className="col-span-2 sm:col-span-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black text-base sm:text-lg h-14 sm:h-16 shadow-lg shadow-green-900/30 active:scale-95 transition-all"
              >
                <Check className="mr-2 h-6 w-6" /> CORRECT (+1)
              </Button>

              {/* SKIP / PASS BUTTON */}
              <Button
                onClick={handleSkip}
                variant="outline"
                className="col-span-1 border-border/40 hover:bg-muted font-bold text-xs sm:text-sm h-14 sm:h-16 flex flex-col items-center justify-center gap-0.5"
              >
                <SkipForward className="h-5 w-5 text-yellow-400" />
                <span>Pass / Next</span>
              </Button>

              {/* END TURN BUTTON */}
              <Button
                onClick={handleEndTurnEarly}
                variant="destructive"
                className="col-span-1 font-bold text-xs sm:text-sm h-14 sm:h-16 flex flex-col items-center justify-center gap-0.5 active:scale-95"
              >
                <Square className="h-4 w-4" />
                <span>End Turn</span>
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. TURN OVER TRANSITION PHASE (Switching teams) */}
        {/* ========================================================================= */}
        {phase === "turn_over" && (
          <div className="space-y-6 max-w-xl mx-auto py-6 text-center flex-1 flex flex-col justify-center">
            <div className="relative inline-block mx-auto">
              <div className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/40 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-yellow-500/10">
                ⏰
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
                Time&apos;s Up!
              </h2>
              <p className="text-lg text-muted-foreground">
                <span className="font-black text-primary">{currentTeamObj.name}</span> scored{" "}
                <span className="font-black text-2xl text-green-400">{turnGuessedCount}</span> words this turn!
              </p>
            </div>

            {/* CURRENT SCORE BOARD */}
            <div className="grid grid-cols-2 gap-4 bg-muted/20 border border-border/30 rounded-2xl p-4">
              <div className={cn("p-4 rounded-xl border-2 text-center", activeTeam === 0 ? "border-primary bg-primary/10" : "border-border/30 bg-muted/20")}>
                <p className="text-xs font-bold text-muted-foreground uppercase">{teams[0].name}</p>
                <p className="text-4xl font-black text-primary mt-1">{teams[0].score}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-1">Total Points</p>
              </div>
              <div className={cn("p-4 rounded-xl border-2 text-center", activeTeam === 1 ? "border-primary bg-primary/10" : "border-border/30 bg-muted/20")}>
                <p className="text-xs font-bold text-muted-foreground uppercase">{teams[1].name}</p>
                <p className="text-4xl font-black text-primary mt-1">{teams[1].score}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-1">Total Points</p>
              </div>
            </div>

            {/* NEXT TURN PROMPT */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-center gap-2 text-base font-bold text-foreground">
                <span>Next Up:</span>
                <span className="text-primary font-black text-xl">{otherTeamObj.name}</span>
                <span>🚀</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Pass the device or get ready! {otherTeamObj.name} will have {timerDuration}s to guess as many words as possible.
              </p>

              <Button
                onClick={proceedToNextTurn}
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white font-black text-lg h-14 shadow-xl"
              >
                Ready for {otherTeamObj.name}&apos;s Turn <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. GAME OVER & LEADERBOARD PHASE (Winner Podium) */}
        {/* ========================================================================= */}
        {phase === "game_over" && (
          <div className="space-y-6 max-w-2xl mx-auto py-4 text-center flex-1 flex flex-col justify-center">
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                <Trophy className="h-4 w-4" /> Match Finished
              </div>
              <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-foreground">
                🏆 FINAL LEADERBOARD 🏆
              </h2>
            </div>

            {/* WINNER ANNOUNCEMENT BANNER */}
            <div className="relative overflow-hidden rounded-3xl p-6 border-2 border-yellow-500/40 bg-gradient-to-b from-yellow-500/15 to-black/60 shadow-2xl shadow-yellow-500/10">
              <div className="absolute top-2 right-3 text-2xl opacity-40">✨</div>
              <div className="absolute bottom-2 left-3 text-2xl opacity-40">🎉</div>

              {winnerIndex !== -1 ? (
                <div className="space-y-2">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center mx-auto text-3xl shadow-lg">
                    <Crown className="h-8 w-8 text-yellow-400" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-yellow-400 uppercase tracking-wide">
                    🎉 {teams[winnerIndex].name} IS THE WINNER! 🎉
                  </h3>
                  <p className="text-sm text-muted-foreground font-semibold">
                    Congratulations on an amazing classroom performance!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center mx-auto text-3xl shadow-lg">
                    🤝
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-blue-400 uppercase tracking-wide">
                    🤝 IT&apos;S A TIE GAME! 🤝
                  </h3>
                  <p className="text-sm text-muted-foreground font-semibold">
                    Both teams scored equal points! Outstanding teamwork!
                  </p>
                </div>
              )}
            </div>

            {/* PODIUM / SCORES COMPARISON */}
            <div className="grid grid-cols-2 gap-4">
              {/* Team 0 Card */}
              <div
                className={cn(
                  "p-5 rounded-2xl border-2 text-center relative overflow-hidden transition-all",
                  winnerIndex === 0
                    ? "border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-500/10 scale-[1.02]"
                    : "border-border/30 bg-muted/20"
                )}
              >
                {winnerIndex === 0 && (
                  <span className="absolute top-2 right-2 text-xs bg-yellow-400 text-black font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                    <Medal className="h-3 w-3" /> 1st
                  </span>
                )}
                <p className="text-sm font-bold text-muted-foreground uppercase">{teams[0].name}</p>
                <p className="text-5xl sm:text-6xl font-black text-primary my-2">{teams[0].score}</p>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Correct Words</p>
              </div>

              {/* Team 1 Card */}
              <div
                className={cn(
                  "p-5 rounded-2xl border-2 text-center relative overflow-hidden transition-all",
                  winnerIndex === 1
                    ? "border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-500/10 scale-[1.02]"
                    : "border-border/30 bg-muted/20"
                )}
              >
                {winnerIndex === 1 && (
                  <span className="absolute top-2 right-2 text-xs bg-yellow-400 text-black font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                    <Medal className="h-3 w-3" /> 1st
                  </span>
                )}
                <p className="text-sm font-bold text-muted-foreground uppercase">{teams[1].name}</p>
                <p className="text-5xl sm:text-6xl font-black text-primary my-2">{teams[1].score}</p>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Correct Words</p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                onClick={handleRematch}
                className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-95 text-white font-black text-base h-12 shadow-lg"
              >
                <Sparkles className="mr-2 h-5 w-5" /> Play Rematch
              </Button>
              <Button
                onClick={fullReset}
                variant="secondary"
                className="font-bold text-base h-12"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> New Game Setup
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. SETUP PHASE (Select Category, Set Timer, Launch Turn) */}
        {/* ========================================================================= */}
        {phase === "setup" && (
          <div className="space-y-5 flex-1 flex flex-col justify-center">
            {/* SETUP PANEL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 rounded-2xl p-4 sm:p-5 border border-border/20">
              {/* Timer Duration Slider */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>Turn Timer (Seconds)</span>
                  <span className="text-primary font-mono font-black">{timerDuration}s</span>
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-muted px-2 py-1 rounded w-10 text-center">{timerDuration}</span>
                  <input
                    type="range"
                    min={15}
                    max={180}
                    step={5}
                    value={timerDuration}
                    onChange={(e) => setTimerDuration(parseInt(e.target.value))}
                    className="flex-1 accent-primary cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">180s</span>
                </div>
              </div>

              {/* Rounds Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Rounds per Team
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoundsTotal(r)}
                      className={cn(
                        "py-1.5 rounded-lg font-bold text-xs transition-all border",
                        roundsTotal === r
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-muted/40 text-muted-foreground border-border/30 hover:border-primary/50"
                      )}
                    >
                      {r} {r === 1 ? "Round" : "Rounds"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selector */}
              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Category Selection (for next turn)
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs gap-1 text-muted-foreground hover:text-foreground"
                    onClick={pickRandomCategory}
                  >
                    <Shuffle className="h-3 w-3" /> Random
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {PRIMARY_CATS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25 scale-105"
                          : "bg-muted/40 text-muted-foreground border-border/30 hover:border-primary/50"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowMoreCategories((p) => !p)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-muted/40 text-muted-foreground border border-border/30 hover:border-primary/50"
                  >
                    {showMoreCategories ? "Less" : "More Categories..."}
                  </button>
                </div>

                {showMoreCategories && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {MORE_CATS.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                          selectedCategory === cat
                            ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25 scale-105"
                            : "bg-muted/40 text-muted-foreground border-border/30 hover:border-primary/50"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* LAUNCH TURN CTA */}
            <Button
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:opacity-90 text-white font-black text-lg h-14 shadow-xl active:scale-[0.99] transition-all"
              onClick={startTurn}
            >
              <Play className="mr-2 h-6 w-6 fill-white" /> Start {currentTeamObj.name}&apos;s Turn ({timerDuration}s)
            </Button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCOREBOARD (Always visible at the bottom for transparency & manual edits) */}
        {/* ========================================================================= */}
        <div className="space-y-3 pt-2">
          {/* Active Team Switcher in Setup */}
          {phase === "setup" && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Starting Team
              </p>
              <div className="grid grid-cols-2 gap-2">
                {teams.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTeam(i as 0 | 1)}
                    className={cn(
                      "py-2 rounded-xl font-bold text-xs sm:text-sm transition-all border-2",
                      activeTeam === i
                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/30"
                        : "bg-muted/30 text-muted-foreground border-transparent hover:border-border"
                    )}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Team Score Cards */}
          <div className="grid grid-cols-2 gap-3">
            {teams.map((team, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-xl p-3 border-2 text-center space-y-1 transition-all",
                  activeTeam === i && phase === "playing"
                    ? "border-primary/60 bg-primary/10 shadow-md shadow-primary/20"
                    : "border-border/20 bg-muted/20"
                )}
              >
                <div className="flex items-center gap-1 justify-center">
                  <Trophy className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                  <input
                    type="text"
                    value={team.name}
                    onChange={(e) => updateTeamName(i, e.target.value)}
                    disabled={phase === "playing"}
                    className="bg-transparent text-center text-xs font-black uppercase text-foreground w-full focus:outline-none focus:ring-1 focus:ring-primary/40 rounded px-1"
                  />
                  <span className="text-[10px] text-muted-foreground uppercase font-bold shrink-0">Score</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => changeScore(i, -1)}
                    className="w-7 h-7 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95"
                    title="Subtract 1"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className={cn("text-3xl font-black", activeTeam === i ? "text-primary" : "text-foreground")}>
                    {team.score}
                  </span>
                  <button
                    onClick={() => changeScore(i, 1)}
                    className="w-7 h-7 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95"
                    title="Add 1"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* FOOTER BUTTONS */}
      <CardFooter className="flex justify-between items-center gap-4 pt-4 border-t border-border/20">
        <Button variant="outline" asChild size="sm">
          <Link href="/games">Back to Library</Link>
        </Button>
        <Button variant="secondary" onClick={fullReset} size="sm" className="font-bold">
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Full Reset
        </Button>
      </CardFooter>
    </Card>
  );
}