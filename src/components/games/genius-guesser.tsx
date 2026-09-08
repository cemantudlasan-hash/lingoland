"use client";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  Play, RotateCcw, Check, Eye, EyeOff, Maximize, Minimize,
  Shuffle, Trophy, Minus, Plus, Lightbulb,
} from "lucide-react";
import Link from "next/link";

const CATEGORIES: Record<string, string[]> = {
  Animals: ["Eagle", "Dolphin", "Penguin", "Tiger", "Kangaroo", "Flamingo", "Gorilla", "Octopus", "Chameleon", "Giraffe"],
  "Food & Drinks": ["Sushi", "Pizza", "Mango", "Lemonade", "Pancake", "Burrito", "Smoothie", "Waffle", "Avocado", "Popcorn"],
  Countries: ["Brazil", "Iceland", "Egypt", "Japan", "Canada", "Kenya", "Norway", "Thailand", "Mexico", "Portugal"],
  "Hollywood Movies": ["Titanic", "Inception", "Frozen", "Avengers", "Interstellar", "Clueless", "Grease", "Moana", "Shrek", "Jaws"],
  "Household Objects": ["Blender", "Umbrella", "Pillow", "Toaster", "Scissors", "Curtain", "Dustpan", "Kettle", "Hamper", "Stapler"],
  "Jobs & Professions": ["Surgeon", "Astronaut", "Architect", "Chef", "Journalist", "Detective", "Pilot", "Pharmacist", "Geologist", "Animator"],
  "Famous Landmarks": ["Colosseum", "Eiffel Tower", "Stonehenge", "Taj Mahal", "Niagara Falls", "Machu Picchu", "Parthenon", "Big Ben", "Pyramids", "Angkor Wat"],
  Sports: ["Badminton", "Surfing", "Archery", "Fencing", "Gymnastics", "Polo", "Curling", "Bobsled", "Lacrosse", "Squash"],
  Superheroes: ["Batman", "Wolverine", "Black Widow", "Flash", "Thor", "Wonder Woman", "Iron Man", "Deadpool", "Aquaman", "Storm"],
  "School Subjects": ["Algebra", "Biology", "Literature", "Geography", "Chemistry", "Philosophy", "Economics", "Physics", "History", "Music"],
};

type GamePhase = "setup" | "playing" | "timeout" | "correct";
interface TeamScore { name: string; score: number; }

export function GeniusGuesser({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const game = getGameBySlug(slug);
  const [timerDuration, setTimerDuration] = React.useState(60);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [secretWord, setSecretWord] = React.useState("");
  const [showWord, setShowWord] = React.useState(false);
  const [showMoreCategories, setShowMoreCategories] = React.useState(false);
  const [phase, setPhase] = React.useState<GamePhase>("setup");
  const [timeLeft, setTimeLeft] = React.useState(60);
  const [activeTeam, setActiveTeam] = React.useState<0 | 1>(0);
  const [teams, setTeams] = React.useState<TeamScore[]>([{ name: "Team A", score: 0 }, { name: "Team B", score: 0 }]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  React.useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const pickRandomCategory = () => {
    const keys = Object.keys(CATEGORIES);
    setSelectedCategory(keys[Math.floor(Math.random() * keys.length)]);
  };

  const pickRandomWord = () => {
    if (!selectedCategory) return;
    const words = CATEGORIES[selectedCategory];
    setSecretWord(words[Math.floor(Math.random() * words.length)]);
    setShowWord(true);
  };

  const startGame = () => {
    if (!secretWord.trim()) return;
    setTimeLeft(timerDuration);
    setPhase("playing");
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); setPhase("timeout"); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCorrect = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTeams((prev) => prev.map((t, i) => (i === activeTeam ? { ...t, score: t.score + 1 } : t)));
    setPhase("correct");
  };

  const handleIncorrect = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("timeout");
  };

  const resetRound = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("setup");
    setSecretWord("");
    setShowWord(false);
    setTimeLeft(timerDuration);
    setActiveTeam((prev) => (prev === 0 ? 1 : 0));
  };

  const fullReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("setup"); setSecretWord(""); setShowWord(false);
    setTimeLeft(timerDuration);
    setTeams([{ name: "Team A", score: 0 }, { name: "Team B", score: 0 }]);
    setActiveTeam(0); setSelectedCategory(null); setShowMoreCategories(false);
  };

  const changeScore = (teamIdx: number, delta: number) => {
    setTeams((prev) => prev.map((t, i) => (i === teamIdx ? { ...t, score: Math.max(0, t.score + delta) } : t)));
  };

  const updateTeamName = (idx: number, name: string) => {
    setTeams((prev) => prev.map((t, i) => (i === idx ? { ...t, name } : t)));
  };

  const timerPct = phase === "playing" ? timeLeft / timerDuration : phase === "setup" ? 1 : timeLeft / timerDuration;
  const timerColor = timeLeft > timerDuration * 0.5 ? "#22c55e" : timeLeft > timerDuration * 0.2 ? "#eab308" : "#ef4444";
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const PRIMARY_CATS = Object.keys(CATEGORIES).slice(0, 5);
  const MORE_CATS = Object.keys(CATEGORIES).slice(5);

  if (!game) return <div>Game not found.</div>;
  const Icon = game.icon;

  return (
    <Card className={cn("w-full transition-all duration-500 flex flex-col", isFullscreen ? "min-h-screen rounded-none border-none max-w-none bg-background" : "rounded-none border-x-0 border-t-0")}>
      <CardHeader className="text-center relative pb-2">
        <Button variant="ghost" size="sm" className="absolute top-4 right-4 h-auto p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]" onClick={onToggleFullscreen}>
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? "Exit" : "Full"}</span>
        </Button>
        {!isFullscreen && <div className="flex justify-center mb-3"><Icon className="w-12 h-12 text-primary" /></div>}
        <CardTitle className={cn("font-black tracking-tight uppercase flex items-center justify-center gap-2", isFullscreen ? "text-5xl" : "text-2xl")}>
          <Lightbulb className={cn("text-yellow-400", isFullscreen ? "h-10 w-10" : "h-6 w-6")} />
          {game.title}
        </CardTitle>
        <CardDescription className={cn(isFullscreen && "text-xl mt-1")}>{game.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 px-4 pb-4">
        {/* DISPLAY PANEL */}
        <div className={cn("relative flex flex-col items-center justify-center rounded-2xl border-2 border-border/30 bg-black/60", isFullscreen ? "py-12 gap-6" : "py-6 gap-4")}>
          <div className={cn("rounded-xl px-8 py-4 text-center font-black tracking-widest uppercase border border-primary/30 bg-primary/10", isFullscreen ? "text-5xl" : "text-2xl")} style={{ color: "var(--primary)" }}>
            {phase === "setup" ? <span className="opacity-40 text-white">-- HIDDEN --</span> : secretWord.toUpperCase()}
          </div>
          <div className="relative flex items-center justify-center">
            <svg width={isFullscreen ? 160 : 120} height={isFullscreen ? 160 : 120} className="-rotate-90">
              <circle cx={isFullscreen ? 80 : 60} cy={isFullscreen ? 80 : 60} r={isFullscreen ? 70 : radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
              <circle cx={isFullscreen ? 80 : 60} cy={isFullscreen ? 80 : 60} r={isFullscreen ? 70 : radius} fill="none"
                stroke={phase === "setup" ? "#334155" : timerColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={isFullscreen ? 2 * Math.PI * 70 : circ}
                strokeDashoffset={isFullscreen ? (2 * Math.PI * 70) * (1 - timerPct) : circ * (1 - timerPct)}
                style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.5s" }} />
            </svg>
            <span className={cn("absolute font-mono font-black", isFullscreen ? "text-4xl" : "text-2xl")} style={{ color: phase === "setup" ? "#64748b" : timerColor }}>
              {phase === "setup" ? `${timerDuration}s` : `${timeLeft}s`}
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            <span>Category: <span className="text-foreground">{selectedCategory ?? "--"}</span></span>
            <span>Turn: <span className="text-blue-400">{teams[activeTeam].name}</span></span>
            <span>Status: <span className={cn(phase === "playing" && "text-green-400", phase === "timeout" && "text-red-400", phase === "correct" && "text-yellow-400", phase === "setup" && "text-muted-foreground")}>
              {phase === "setup" ? "Waiting..." : phase === "playing" ? "Playing!" : phase === "timeout" ? "Time Up!" : "Correct!"}
            </span></span>
          </div>
        </div>

        {/* SETUP PANEL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 rounded-xl p-4 border border-border/20">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Timer Duration (Seconds)</label>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded w-10 text-center">{timerDuration}</span>
              <input type="range" min={10} max={300} step={5} value={timerDuration} disabled={phase === "playing"} onChange={(e) => { const v = parseInt(e.target.value); setTimerDuration(v); if (phase === "setup") setTimeLeft(v); }} className="flex-1 accent-primary" />
              <span className="text-xs text-muted-foreground">{timerDuration}s</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Category</label>
              <Button variant="ghost" size="sm" className="h-5 text-xs gap-1 text-muted-foreground" onClick={pickRandomCategory} disabled={phase === "playing"}>
                <Shuffle className="h-3 w-3" /> Random
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRIMARY_CATS.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} disabled={phase === "playing"} className={cn("px-2.5 py-1 rounded-full text-xs font-bold transition-all border", selectedCategory === cat ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-muted-foreground border-border/30 hover:border-primary/50")}>
                  {cat}
                </button>
              ))}
              <button onClick={() => setShowMoreCategories((p) => !p)} disabled={phase === "playing"} className="px-2.5 py-1 rounded-full text-xs font-bold bg-muted/40 text-muted-foreground border border-border/30 hover:border-primary/50">
                {showMoreCategories ? "Less" : "More..."}
              </button>
            </div>
            {showMoreCategories && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {MORE_CATS.map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} disabled={phase === "playing"} className={cn("px-2.5 py-1 rounded-full text-xs font-bold transition-all border", selectedCategory === cat ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-muted-foreground border-border/30 hover:border-primary/50")}>
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="sm:col-span-2 space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Secret Word to Guess</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input type={showWord ? "text" : "password"} value={secretWord} onChange={(e) => setSecretWord(e.target.value)} placeholder="Type secret word..." disabled={phase === "playing"} className="w-full bg-muted/40 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 pr-9" />
                <button onClick={() => setShowWord((p) => !p)} disabled={phase === "playing"} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showWord ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {selectedCategory && <Button variant="outline" size="sm" disabled={phase === "playing"} onClick={pickRandomWord} className="gap-1 font-bold shrink-0"><Shuffle className="h-3 w-3" /> Random</Button>}
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-3 gap-3">
          {phase === "setup" && (
            <Button className="col-span-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-base h-12 shadow-lg" onClick={startGame} disabled={!secretWord.trim()}>
              <Play className="mr-2 h-5 w-5" /> Start Game
            </Button>
          )}
          {phase === "playing" && (
            <>
              <Button onClick={handleCorrect} className="col-span-2 bg-green-600 hover:bg-green-700 text-white font-black h-12 text-base shadow-lg"><Check className="mr-2 h-5 w-5" /> Correct / Guessed</Button>
              <Button variant="destructive" className="font-black h-12" onClick={handleIncorrect}><RotateCcw className="mr-2 h-4 w-4" /> Stop</Button>
            </>
          )}
          {(phase === "timeout" || phase === "correct") && (
            <Button onClick={resetRound} className="col-span-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-black h-12 text-base">
              <RotateCcw className="mr-2 h-5 w-5" /> Next Round
            </Button>
          )}
        </div>

        {/* SCOREBOARD */}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Active Team</p>
            <div className="grid grid-cols-2 gap-2">
              {teams.map((t, i) => (
                <button key={i} onClick={() => setActiveTeam(i as 0 | 1)} className={cn("py-2 rounded-lg font-bold text-sm transition-all border-2", activeTeam === i ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/30" : "bg-muted/30 text-muted-foreground border-transparent hover:border-border")}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {teams.map((team, i) => (
              <div key={i} className={cn("rounded-xl p-3 border-2 text-center space-y-2 transition-all", activeTeam === i ? "border-primary/40 bg-primary/5" : "border-border/20 bg-muted/20")}>
                <div className="flex items-center gap-1 justify-center">
                  <Trophy className="h-3 w-3 text-yellow-500 shrink-0" />
                  <input type="text" value={team.name} onChange={(e) => updateTeamName(i, e.target.value)} className="bg-transparent text-center text-xs font-bold text-muted-foreground w-full focus:outline-none focus:text-foreground min-w-0" />
                  <span className="text-[10px] text-muted-foreground shrink-0">Score</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => changeScore(i, -1)} className="w-7 h-7 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground"><Minus className="h-3 w-3" /></button>
                  <span className={cn("text-3xl font-black", activeTeam === i ? "text-primary" : "text-foreground")}>{team.score}</span>
                  <button onClick={() => changeScore(i, 1)} className="w-7 h-7 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground"><Plus className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
          {phase === "playing" && (
            <>
              <p className="text-xs text-center text-muted-foreground font-bold uppercase tracking-wider">Host Judgement</p>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleCorrect} className="bg-green-600 hover:bg-green-700 text-white font-black"><Check className="mr-2 h-4 w-4" /> Correct / Guessed</Button>
                <Button variant="destructive" className="font-black" onClick={handleIncorrect}>Incorrect / Missed</Button>
              </div>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center gap-4 pt-4">
        <Button variant="outline" asChild><Link href="/games">Back to Library</Link></Button>
        <Button variant="secondary" onClick={fullReset} className="font-bold"><RotateCcw className="mr-2 h-4 w-4" /> Full Reset</Button>
      </CardFooter>
    </Card>
  );
}