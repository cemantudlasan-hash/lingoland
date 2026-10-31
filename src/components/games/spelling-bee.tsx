"use client";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { generateSpellingBeeWord } from "@/ai/flows/generate-spelling-bee-word";
import type { GenerateSpellingBeeWordOutput } from "@/ai/flows/schemas/spelling-bee-schema";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import { 
  Loader2, Sparkles, ArrowLeft, XOctagon, Volume2, Check, X, Repeat, 
  Lightbulb, Send, RotateCcw, UserPlus, Trash2, Timer, Trophy, 
  SkipForward, Maximize, Minimize, Users, Crown, Medal, Award 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import type { SkillLevel } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Progress } from "../ui/progress";
import confetti from 'canvas-confetti';

type GameState = "idle" | "setup" | "loading" | "playing" | "answered" | "finished" | "instructions";
type Team = { name: string; score: number };

const TURN_TIME_SECONDS = 60;
const LOCAL_STORAGE_KEY = 'lingoland_spelling_bee_used_words';

const TEAM_THEMES = [
  { badge: "bg-amber-500 text-white", border: "border-amber-500/40", glow: "from-amber-500/20 to-amber-600/5", activeText: "text-amber-500", name: "Amber" },
  { badge: "bg-indigo-600 text-white", border: "border-indigo-500/40", glow: "from-indigo-500/20 to-indigo-600/5", activeText: "text-indigo-400", name: "Indigo" },
  { badge: "bg-emerald-600 text-white", border: "border-emerald-500/40", glow: "from-emerald-500/20 to-emerald-600/5", activeText: "text-emerald-400", name: "Emerald" },
  { badge: "bg-rose-600 text-white", border: "border-rose-500/40", glow: "from-rose-500/20 to-rose-600/5", activeText: "text-rose-400", name: "Rose" },
];

export function SpellingBee({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [teams, setTeams] = React.useState<Team[]>([{ name: "Team 1", score: 0 }, { name: "Team 2", score: 0 }]);
  const [totalRounds, setTotalRounds] = React.useState(10);
  const [currentRound, setCurrentRound] = React.useState(0);
  const [currentTurn, setCurrentTurn] = React.useState(0);
  const [wordData, setWordData] = React.useState<GenerateSpellingBeeWordOutput | null>(null);
  const [userAnswer, setUserAnswer] = React.useState("");
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [timedOut, setTimedOut] = React.useState(false);
  const [difficulty, setDifficulty] = React.useState<SkillLevel>("intermediate");
  const [usedWords, setUsedWords] = React.useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(TURN_TIME_SECONDS);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  React.useEffect(() => {
    try {
      const storedWords = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedWords) {
        setUsedWords(JSON.parse(storedWords));
      }
    } catch (error) {
      console.error("Failed to load used words", error);
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(usedWords));
    } catch (error) {
      console.error("Failed to save used words", error);
    }
  }, [usedWords]);

  if (!game) return <div>Game not found</div>;

  const fetchNextWord = React.useCallback(async (level: SkillLevel) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setGameState("loading");
    setWordData(null);
    setUserAnswer("");
    setIsCorrect(null);
    setShowHint(false);
    setTimedOut(false);
    setTimeLeft(TURN_TIME_SECONDS);
    try {
      const newWord = await generateSpellingBeeWord({
        difficulty: level,
        usedWords: usedWords,
      });
      setWordData(newWord);
      setUsedWords(prev => [...prev, newWord.word]);
      setTimeLeft(TURN_TIME_SECONDS);
      setGameState("playing");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent('lingoland_game_started_hijack'));
      }
    } catch (error) {
      console.error("Failed to generate word:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not start a new game. Please try again.",
      });
      setGameState("setup");
    }
  }, [usedWords, toast]);
  
  const handleStartGame = React.useCallback(() => {
    if (teams.length < 1) {
      toast({ variant: "destructive", title: "Add at least one team" });
      return;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTeams(teams.map(t => ({...t, score: 0})));
    setCurrentRound(1);
    setCurrentTurn(0);
    setTimeLeft(TURN_TIME_SECONDS);
    setTimedOut(false);
    fetchNextWord(difficulty);
  }, [teams, difficulty, fetchNextWord, toast]);

  const handleTimeUp = React.useCallback(() => {
    if (gameState !== 'playing') return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimedOut(true);
    setIsCorrect(false);
    setGameState("answered");
  }, [gameState]);

  // Clean countdown interval that ticks every second while gameState === 'playing'
  React.useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState]);

  // Safely trigger turn timeout when timeLeft reaches 0
  React.useEffect(() => {
    if (gameState === 'playing' && timeLeft <= 0) {
      handleTimeUp();
    }
  }, [timeLeft, gameState, handleTimeUp]);

  const handleSpeak = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const { audio } = await textToSpeech(text);
      const audioEl = new Audio(audio);
      audioEl.play();
      audioEl.onended = () => setIsSpeaking(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Audio Error", description: "Could not play audio." });
      setIsSpeaking(false);
    }
  };

  const handleCheckAnswer = () => {
    if (!wordData || gameState !== 'playing') return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const correct = userAnswer.trim().toLowerCase() === wordData.word.toLowerCase();
    setIsCorrect(correct);
    if(correct) {
      const newTeams = [...teams];
      newTeams[currentTurn].score += 1;
      setTeams(newTeams);
    }
    setGameState("answered");
  };

  const handleNextTurn = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (currentRound >= totalRounds && currentTurn === teams.length - 1) {
        setGameState("finished");
        try {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent('lingoland_game_completed_hijack', {
              detail: { state: 'finished' }
            }));
          }
        } catch (e) {}
        return;
    }

    const nextTurn = (currentTurn + 1) % teams.length;
    setCurrentTurn(nextTurn);
    if (nextTurn === 0) {
        setCurrentRound(prev => prev + 1);
    }
    setTimeLeft(TURN_TIME_SECONDS);
    setTimedOut(false);
    fetchNextWord(difficulty);
  };
  
  const handleClearHistory = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setUsedWords([]);
      toast({
        title: "Word History Cleared",
        description: "The list of used words has been reset.",
      });
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Could not clear history." });
    }
  };

  const handleTeamNameChange = (index: number, newName: string) => {
    const newTeams = [...teams];
    newTeams[index].name = newName;
    setTeams(newTeams);
  };
  
  const addTeam = () => {
    if (teams.length < 4) {
      setTeams([...teams, { name: `Team ${String.fromCharCode(65 + teams.length)}`, score: 0 }]);
    }
  };

  const removeTeam = (index: number) => {
    if (teams.length > 2) {
      setTeams(teams.filter((_, i) => i !== index));
    }
  };

  const resetGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setGameState('setup');
    setUsedWords([]);
    setTimeLeft(TURN_TIME_SECONDS);
    setTimedOut(false);
  };

  const Icon = game.icon;

  const maskedExample = React.useMemo(() => {
    if (!wordData?.exampleSentence || !wordData?.word) return "";
    try {
      const escaped = wordData.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      return wordData.exampleSentence.replace(regex, "_______");
    } catch {
      return wordData.exampleSentence;
    }
  }, [wordData]);

  const renderContent = () => {
    switch (gameState) {
      case "setup":
        return (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 p-4 sm:p-8 bg-muted/20 border border-border/30 rounded-3xl shadow-sm animate-in fade-in zoom-in-95 duration-200">
            {/* Tournament Settings */}
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black uppercase tracking-wide">Tournament Setup</h3>
                    <p className="text-xs text-muted-foreground">Adjust game rules and round length.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Difficulty Level</label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as SkillLevel)}>
                    <SelectTrigger className="h-11 rounded-xl bg-card border-2 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (Elementary Vocabulary)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (Standard Academic)</SelectItem>
                      <SelectItem value="advanced">Advanced (Championship Lexicon)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Total Rounds</label>
                  <Select value={String(totalRounds)} onValueChange={(v) => setTotalRounds(Number(v))}>
                    <SelectTrigger className="h-11 rounded-xl bg-card border-2 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Rounds (Quick Sprint)</SelectItem>
                      <SelectItem value="10">10 Rounds (Standard Match)</SelectItem>
                      <SelectItem value="15">15 Rounds (Tournament)</SelectItem>
                      <SelectItem value="20">20 Rounds (Grand Championship)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
                <div className="flex items-center gap-2 font-black uppercase tracking-wider">
                  <Timer className="w-4 h-4 text-amber-500" /> 60-Second Timed Turns
                </div>
                <p className="opacity-90 leading-relaxed">
                  Each team takes turns listening to a spoken word and typing its exact spelling before time runs out.
                </p>
              </div>
            </div>

            {/* Teams Roster */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <h4 className="font-black text-xs uppercase tracking-wider">Competing Teams ({teams.length}/4)</h4>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addTeam} 
                    disabled={teams.length >= 4} 
                    className="h-8 px-3 rounded-lg text-xs font-bold"
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1" /> Add Team
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {teams.map((team, index) => {
                    const theme = TEAM_THEMES[index % TEAM_THEMES.length];
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 bg-card rounded-xl border border-border/40 shadow-sm">
                        <span className={cn("h-8 w-8 rounded-lg font-black text-xs flex items-center justify-center shrink-0", theme.badge)}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <Input 
                          value={team.name} 
                          onChange={(e) => handleTeamNameChange(index, e.target.value)}
                          className="h-9 font-bold text-sm bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                          placeholder={`Team ${String.fromCharCode(65 + index)}`}
                          maxLength={25}
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeTeam(index)} 
                          disabled={teams.length <= 2}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button 
                onClick={handleStartGame} 
                size="lg" 
                className="w-full h-13 font-black uppercase text-base rounded-2xl shadow-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white mt-4"
              >
                <Sparkles className="mr-2 h-5 w-5" /> Begin Competition
              </Button>
            </div>
          </div>
        );

      case "instructions":
        return (
          <div className="w-full max-w-2xl bg-card border border-border/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-500 mb-1">
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="font-black uppercase tracking-wider text-xl sm:text-2xl">Spelling Bee Rules</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Test your listening comprehension and vocabulary spelling skills in a head-to-head arena.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-sm flex items-center justify-center mx-auto">1</div>
                <h4 className="font-black text-xs uppercase tracking-wider">Listen Carefully</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">Click the listen button to hear the target word pronounced aloud with high-fidelity speech synthesis.</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black text-sm flex items-center justify-center mx-auto">2</div>
                <h4 className="font-black text-xs uppercase tracking-wider">Get Clues</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">Stuck on the word? Click "Get Hint" to reveal its dictionary definition and an example sentence.</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-sm flex items-center justify-center mx-auto">3</div>
                <h4 className="font-black text-xs uppercase tracking-wider">Score Points</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">Type your answer before the 60s countdown expires. Every correct spelling awards 1 point to your team.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button onClick={() => setGameState('setup')} className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black uppercase tracking-wider rounded-xl shadow-md">
                Configure Teams & Play
              </Button>
            </div>
          </div>
        );

      case "loading":
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center py-12">
            <div className="p-4 rounded-3xl bg-amber-500/10 text-amber-500 animate-pulse">
              <Loader2 className="animate-spin h-12 w-12" />
            </div>
            <div className="space-y-1">
              <p className="font-black uppercase tracking-wider text-base">Retrieving Next Word...</p>
              <p className="text-xs text-muted-foreground">Consulting phonetic database and context sentences</p>
            </div>
          </div>
        );

      case "playing":
      case "answered":
        if (!wordData) return null;
        const activeTheme = TEAM_THEMES[currentTurn % TEAM_THEMES.length];
        const isTimeCritical = timeLeft <= 15;

        return (
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Mobile Top Score Bar (Visible on mobile/tablet, hidden on desktop lg) */}
            <div className="col-span-12 lg:hidden flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {teams.map((t, idx) => {
                const tTheme = TEAM_THEMES[idx % TEAM_THEMES.length];
                const isCurrent = idx === currentTurn;
                return (
                  <div 
                    key={idx}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap shrink-0 transition-all",
                      isCurrent 
                        ? cn(tTheme.badge, "shadow-md scale-105")
                        : "bg-muted/40 border-border/40 text-muted-foreground"
                    )}
                  >
                    <span>{t.name}</span>
                    <span className={cn("px-1.5 py-0.5 rounded-md text-[10px] font-black", isCurrent ? "bg-white/25 text-white" : "bg-muted text-foreground")}>
                      {t.score} pts
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Main Tournament Arena (8 columns on lg) */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-5 w-full min-w-0">
              {/* Arena Header HUD */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center font-black uppercase tracking-wider">
                <div className="p-3 sm:p-4 bg-muted/30 rounded-2xl border border-border/40 flex flex-col items-center justify-center">
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold">Match Round</span>
                  <span className="text-base sm:text-2xl mt-0.5">{currentRound} / {totalRounds}</span>
                </div>

                <div className={cn(
                  "p-3 sm:p-4 rounded-2xl border flex flex-col items-center justify-center transition-all shadow-md",
                  activeTheme.badge
                )}>
                  <span className="text-[10px] sm:text-xs opacity-90 font-semibold flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Turn
                  </span>
                  <span className="text-base sm:text-2xl truncate max-w-[120px] sm:max-w-[200px] mt-0.5 font-black">
                    {teams[currentTurn].name}
                  </span>
                </div>

                <div className={cn(
                  "p-3 sm:p-4 rounded-2xl border flex flex-col items-center justify-center transition-colors",
                  isTimeCritical 
                    ? "bg-destructive/15 border-destructive/40 text-destructive animate-pulse"
                    : "bg-muted/30 border-border/40 text-foreground"
                )}>
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold flex items-center gap-1">
                    <Timer className="w-3 h-3" /> Time Left
                  </span>
                  <span className="text-base sm:text-2xl font-mono font-black mt-0.5">{timeLeft}s</span>
                </div>
              </div>

              {/* Timer progress bar */}
              <Progress 
                value={(timeLeft / TURN_TIME_SECONDS) * 100} 
                className={cn(
                  "w-full h-2 rounded-full transition-all",
                  isTimeCritical ? "[&>div]:bg-destructive" : "[&>div]:bg-amber-500"
                )} 
              />

              {/* Phonetic Listening Station */}
              <div className="p-5 sm:p-8 rounded-3xl bg-card border-2 border-border/50 shadow-lg text-center flex flex-col items-center gap-5">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Phonetic Station</span>
                  <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight">Listen to the Pronunciation</h2>
                </div>

                {/* Big Interactive Audio Speaker Button */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSpeak(wordData.word)}
                    disabled={isSpeaking}
                    className={cn(
                      "group relative h-20 w-20 sm:h-24 sm:w-24 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-200 active:scale-95 cursor-pointer",
                      "bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 text-white hover:shadow-amber-500/30 hover:scale-105",
                      isSpeaking && "ring-4 ring-amber-400/50 ring-offset-2 ring-offset-background"
                    )}
                    title="Click to hear pronunciation"
                  >
                    {isSpeaking ? (
                      <div className="flex items-center gap-1 h-6">
                        <span className="w-1.5 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-6 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-4 bg-white rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-5 bg-white rounded-full animate-bounce [animation-delay:-0.2s]"></span>
                      </div>
                    ) : (
                      <Volume2 className="h-8 w-8 sm:h-10 sm:w-10 group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                  <span className="text-xs font-bold text-muted-foreground">
                    {isSpeaking ? "Pronouncing word..." : "Click to Speak"}
                  </span>
                </div>

                {/* Action buttons (Listen & Hint) */}
                <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                  <Button 
                    type="button"
                    onClick={() => handleSpeak(wordData.word)} 
                    disabled={isSpeaking} 
                    variant="outline"
                    className="h-11 px-5 font-bold uppercase rounded-xl border-2 hover:bg-amber-500/10 hover:border-amber-500/50"
                  >
                    <Volume2 className="h-4 w-4 mr-2 text-amber-500" />
                    Replay Audio
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => setShowHint(prev => !prev)} 
                    variant="secondary" 
                    className={cn(
                      "h-11 px-5 font-bold uppercase rounded-xl transition-all",
                      showHint && "bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400"
                    )}
                  >
                    <Lightbulb className="mr-2 h-4 w-4 text-amber-500"/>
                    {showHint ? "Hide Clue" : "Get Clue / Intel"}
                  </Button>
                </div>

                {/* Clue Panel */}
                {showHint && (
                  <div className="w-full p-4 sm:p-5 bg-amber-500/5 border-2 border-dashed border-amber-500/30 rounded-2xl text-left space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-600 dark:text-amber-400">
                      <Lightbulb className="w-3.5 h-3.5" /> Clue & Context
                    </div>
                    <p className="text-xs sm:text-sm font-medium">
                      <span className="font-bold text-foreground">Definition:</span> {wordData.definition}
                    </p>
                    <p className="text-xs sm:text-sm font-medium italic text-muted-foreground">
                      <span className="font-bold text-foreground not-italic">Example:</span> "{maskedExample}"
                    </p>
                  </div>
                )}

                {/* Input Station */}
                <div className="w-full space-y-2 pt-2">
                  <div className="flex gap-2 sm:gap-3 w-full">
                    <Input 
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="h-13 sm:h-16 text-lg sm:text-2xl font-mono font-black tracking-widest uppercase text-center bg-card border-2 focus-visible:ring-amber-500 focus-visible:border-amber-500 rounded-2xl shadow-inner"
                      disabled={gameState === "answered"}
                      placeholder="TYPE SPELLING HERE..."
                      onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer()}
                      spellCheck="false"
                      autoComplete="off"
                      autoCorrect="off"
                      autoFocus
                    />
                    <Button 
                      type="button"
                      onClick={handleCheckAnswer} 
                      disabled={gameState === 'answered' || !userAnswer.trim()} 
                      className="h-13 w-13 sm:h-16 sm:w-16 rounded-2xl shrink-0 bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
                    >
                      <Send className="h-5 w-5 sm:h-6 sm:w-6" />
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-semibold">Press Enter ↵ to submit your spelling</p>
                </div>

                {/* Result Alert with embedded Next Turn action */}
                {gameState === 'answered' && (
                  <div className="w-full space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <Alert variant={isCorrect ? "default" : "destructive"} className={cn(
                      'text-center border-2 rounded-2xl shadow-xl p-4 sm:p-6',
                      isCorrect ? 'bg-green-500/15 border-green-500/40 text-foreground' : 'bg-red-500/15 border-red-500/40 text-foreground'
                    )}>
                      {isCorrect ? <Check className="h-6 w-6 text-green-500 mx-auto" /> : <X className="h-6 w-6 text-red-500 mx-auto" />}
                      <AlertTitle className="font-black uppercase tracking-wider text-base sm:text-xl mt-1 mb-1">
                        {timedOut ? "TIME EXPIRED!" : (isCorrect ? 'PERFECT SPELLING! 🎯' : 'INCORRECT SPELLING')}
                      </AlertTitle>
                      <AlertDescription className="font-bold text-xs sm:text-base">
                        {isCorrect ? (
                          <span className="text-green-600 dark:text-green-400">
                            +1 point awarded to {teams[currentTurn].name}! Correct spelling: <span className="underline font-black">{wordData.word.toUpperCase()}</span>
                          </span>
                        ) : (
                          <span>
                            The correct spelling was: <span className="font-black underline tracking-wider">{wordData.word.toUpperCase()}</span>
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>

                    {/* Direct Next Turn button right here inside the feedback block */}
                    <Button 
                      type="button"
                      onClick={handleNextTurn} 
                      size="lg" 
                      className="w-full h-13 font-black uppercase text-base rounded-2xl shadow-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white"
                    >
                      <Repeat className="mr-2 h-5 w-5"/>
                      {currentRound >= totalRounds && currentTurn === teams.length - 1 ? "View Final Results" : "Next Team's Turn"}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Tournament Leaderboard Sidebar (4 columns on lg, hidden on mobile) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 w-full min-w-0">
              <div className="p-5 rounded-3xl bg-card border border-border/40 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" /> Live Standings
                  </h4>
                  <Badge variant="outline" className="text-[10px] font-black uppercase">{difficulty}</Badge>
                </div>

                {/* Sorted Standings */}
                <div className="space-y-2">
                  {[...teams]
                    .map((team, originalIndex) => ({ ...team, originalIndex }))
                    .sort((a, b) => b.score - a.score)
                    .map((team, rank) => {
                      const theme = TEAM_THEMES[team.originalIndex % TEAM_THEMES.length];
                      const isCurrent = team.originalIndex === currentTurn;
                      return (
                        <div 
                          key={team.name}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-2xl border transition-all",
                            isCurrent 
                              ? "bg-amber-500/10 border-amber-500/40 ring-2 ring-amber-500/30" 
                              : "bg-muted/20 border-border/30"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={cn(
                              "h-7 w-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0",
                              rank === 0 ? "bg-amber-500 text-white shadow-sm" :
                              rank === 1 ? "bg-slate-400 text-white shadow-sm" :
                              rank === 2 ? "bg-amber-700 text-white shadow-sm" : "bg-muted text-muted-foreground"
                            )}>
                              {rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : `${rank + 1}`}
                            </span>
                            <div className="min-w-0">
                              <p className="font-black text-xs sm:text-sm truncate">{team.name}</p>
                              {isCurrent && (
                                <span className="text-[10px] font-black uppercase text-amber-500 flex items-center gap-1">
                                  ● Active Turn
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-mono font-black text-sm sm:text-base text-primary shrink-0 ml-2">
                            {team.score} pts
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Match Statistics & Control */}
              <div className="p-4 rounded-2xl bg-muted/20 border border-border/30 text-xs space-y-3">
                <div className="flex justify-between items-center text-muted-foreground font-semibold">
                  <span>Rounds Remaining:</span>
                  <span className="font-mono font-bold text-foreground">{totalRounds - currentRound + 1}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground font-semibold">
                  <span>Turn Time Limit:</span>
                  <span className="font-mono font-bold text-foreground">60s</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground font-semibold">
                  <span>Words in Bank:</span>
                  <span className="font-mono font-bold text-foreground">{usedWords.length} used</span>
                </div>
                {gameState === 'playing' && (
                  <Button 
                    type="button"
                    onClick={handleNextTurn} 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-9 rounded-xl font-bold text-xs"
                  >
                    <SkipForward className="mr-1.5 h-3.5 w-3.5" /> Skip Word
                  </Button>
                )}
              </div>
            </div>
          </div>
        );

      case "finished":
        const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
        const winner = sortedTeams[0];
        const isTie = sortedTeams.length > 1 && sortedTeams[0].score === sortedTeams[1].score && sortedTeams[0].score > 0;

        return (
          <div className="w-full max-w-2xl flex flex-col items-center gap-6 p-6 sm:p-8 bg-card border border-border/40 rounded-3xl shadow-xl text-center animate-in zoom-in-95 duration-300">
            <div className="relative">
              <Trophy className="text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.6)] h-20 w-20 sm:h-24 sm:w-24 animate-pulse mx-auto"/>
              <Crown className="w-8 h-8 text-amber-500 absolute -top-3 -right-2 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h2 className="font-black uppercase tracking-tight text-2xl sm:text-4xl">Competition Over!</h2>
              <p className="font-black text-amber-500 uppercase text-base sm:text-xl">
                {isTie ? `🤝 Tied Championship: ${sortedTeams[0].name} & ${sortedTeams[1].name}!` : `🎉 ${winner.name} Champion! 🎉`}
              </p>
            </div>

            {/* Podium Cards */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sortedTeams.map((team, idx) => (
                <div 
                  key={team.name} 
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all",
                    idx === 0 
                      ? "bg-amber-500/15 border-amber-500/40 shadow-md ring-2 ring-amber-500/20" 
                      : "bg-muted/30 border-border/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🎖️"}
                    </span>
                    <div className="text-left">
                      <p className="font-black text-sm sm:text-base">{team.name}</p>
                      <p className="text-[11px] text-muted-foreground uppercase">{idx === 0 ? "1st Place Winner" : `${idx + 1}th Place`}</p>
                    </div>
                  </div>
                  <span className="font-mono font-black text-lg text-primary">{team.score} pts</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
              <Button 
                type="button"
                onClick={handleStartGame} 
                className="flex-1 h-13 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black uppercase tracking-wider rounded-xl shadow-lg"
              >
                <Repeat className="mr-2 h-4 w-4" /> Rematch with Same Teams
              </Button>
              <Button 
                type="button"
                onClick={() => setGameState('setup')} 
                variant="outline" 
                className="h-13 px-6 font-black uppercase tracking-wider rounded-xl"
              >
                New Tournament Setup
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center gap-5 text-center max-w-md py-6">
            <div className="p-4 rounded-3xl bg-amber-500/10 text-amber-500">
              <Icon className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tight">Arena Awaits</h3>
              <p className="text-sm text-muted-foreground">Ready to prove your spelling dominance? Form teams and compete!</p>
            </div>
            <Button 
              type="button"
              onClick={() => setGameState('instructions')} 
              className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black shadow-lg rounded-xl uppercase tracking-wider"
            >
              <Sparkles className="mr-2 h-4 w-4" /> Initialize Bee
            </Button>
          </div>
        );
    }
  };

  return (
    <Card className={cn(
        "w-full flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full flex flex-col justify-between overflow-y-auto overflow-x-hidden rounded-2xl md:rounded-3xl border border-border/20 shadow-xl bg-card/80 backdrop-blur-sm transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none p-2 sm:p-6 bg-background"
      )}>
      <CardHeader className="text-center relative p-4 sm:p-6 pb-2">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 h-auto p-1.5 sm:p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        <div className="flex justify-center mb-2">
          <Icon className="w-10 h-10 sm:w-14 sm:h-14 text-amber-500" />
        </div>
        <CardTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-2xl sm:text-4xl md:text-5xl" : "text-xl sm:text-3xl")}>{game.title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm md:text-base max-w-xl mx-auto">{game.description}</CardDescription>
        {gameState !== 'setup' && gameState !== 'idle' && (
          <div className="flex justify-center pt-2">
            <Badge variant="outline" className="text-xs sm:text-sm px-3 py-0.5 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold">{difficulty.toUpperCase()}</Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 w-full max-w-6xl mx-auto overflow-y-auto overflow-x-hidden custom-scrollbar">
        {renderContent()}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10 w-full shrink-0">
        <Button variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
          <Link href="/games">Back to Library</Link>
        </Button>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          {gameState === 'playing' && (
            <Button type="button" onClick={handleNextTurn} variant="secondary" className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
              <SkipForward className="mr-2 h-4 w-4"/> Skip Word
            </Button>
          )}
          {gameState === 'answered' && (
            <Button type="button" onClick={handleNextTurn} className="w-full sm:w-auto h-11 sm:h-12 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black shadow-lg rounded-xl">
              <Repeat className="mr-2 h-4 w-4"/>Next Turn
            </Button>
          )}
          {gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'setup' && (
            <Button type="button" variant="ghost" onClick={handleClearHistory} title="Clear used word history" className="w-full sm:w-auto h-11 sm:h-12 px-4 rounded-xl text-xs sm:text-sm">
              <RotateCcw className="mr-2 h-4 w-4"/>Clear History
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
