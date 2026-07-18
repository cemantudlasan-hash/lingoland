"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  User,
  Bot,
  Trophy,
  Maximize,
  Minimize,
  RefreshCw,
  Clock,
  Coins,
  Sparkles,
  Calculator,
  Atom,
  BookOpen,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getDailyMissions, getDailyBonusGame } from "@/lib/analytics";
import Link from "next/link";
import type { SkillLevel } from "@/lib/types";

type Subject = "math" | "science" | "english";
type GameMode = "single" | "multiplayer";
type GameState = "setup" | "playing" | "round_break" | "bot_thinking" | "finished";

type Question = {
  question: string;
  options: string[];
  answer: string;
};

const QUESTION_BANK: Record<Subject, Record<SkillLevel, Question[]>> = {
  math: {
    beginner: [
      { question: "What is 12 + 15?", options: ["25", "27", "29", "30"], answer: "27" },
      { question: "What is 20 - 7?", options: ["11", "13", "15", "17"], answer: "13" },
      { question: "What is 5 + 6 + 7?", options: ["17", "18", "19", "20"], answer: "18" },
      { question: "What is 15 - 9?", options: ["4", "5", "6", "7"], answer: "6" },
      { question: "What is 8 + 4?", options: ["10", "11", "12", "13"], answer: "12" },
    ],
    intermediate: [
      { question: "What is 7 x 8?", options: ["54", "56", "58", "62"], answer: "56" },
      { question: "What is 144 / 12?", options: ["10", "11", "12", "14"], answer: "12" },
      { question: "What is 3 x (4 + 5)?", options: ["17", "23", "27", "32"], answer: "27" },
      { question: "What is 15% of 200?", options: ["20", "25", "30", "35"], answer: "30" },
      { question: "What is the square of 9?", options: ["72", "81", "90", "99"], answer: "81" },
    ],
    advanced: [
      { question: "If 3x + 7 = 22, what is x?", options: ["3", "4", "5", "6"], answer: "5" },
      { question: "Solve: 10 - 2 * 3 + 4", options: ["8", "16", "28", "18"], answer: "8" },
      { question: "What is the square root of 225?", options: ["13", "14", "15", "16"], answer: "15" },
      { question: "If a triangle has base 6cm and height 8cm, what is its area?", options: ["14", "24", "48", "28"], answer: "24" },
      { question: "If x^2 = 64 and x > 0, what is x?", options: ["4", "6", "8", "10"], answer: "8" },
    ],
  },
  science: {
    beginner: [
      { question: "Which planet is closest to the Sun?", options: ["Venus", "Mars", "Mercury", "Jupiter"], answer: "Mercury" },
      { question: "What state of matter is steam?", options: ["Solid", "Liquid", "Gas", "Plasma"], answer: "Gas" },
      { question: "How many legs does a spider have?", options: ["6", "8", "10", "12"], answer: "8" },
      { question: "Which gas do humans need to breathe?", options: ["Nitrogen", "Oxygen", "Carbon Dioxide", "Hydrogen"], answer: "Oxygen" },
      { question: "What is the freezing point of water in Celsius?", options: ["-10", "0", "10", "100"], answer: "0" },
    ],
    intermediate: [
      { question: "What is the chemical symbol for Gold?", options: ["Ag", "Au", "Fe", "Gd"], answer: "Au" },
      { question: "Which organ pumps blood throughout the human body?", options: ["Brain", "Lungs", "Heart", "Liver"], answer: "Heart" },
      { question: "What is the process by which plants make food?", options: ["Respiration", "Photosynthesis", "Transpiration", "Digestion"], answer: "Photosynthesis" },
      { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: "Mars" },
      { question: "What is the hardest natural substance on Earth?", options: ["Gold", "Iron", "Diamond", "Quartz"], answer: "Diamond" },
    ],
    advanced: [
      { question: "What is the approximate speed of light?", options: ["30,000 km/s", "300,000 km/s", "3,000,000 km/s", "300 km/s"], answer: "300,000 km/s" },
      { question: "What is the main gas in the Earth's atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"], answer: "Nitrogen" },
      { question: "Which subatomic particle has a negative charge?", options: ["Proton", "Neutron", "Electron", "Quark"], answer: "Electron" },
      { question: "What is the unit of electric resistance?", options: ["Volt", "Ampere", "Ohm", "Watt"], answer: "Ohm" },
      { question: "What is the power house of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], answer: "Mitochondria" },
    ],
  },
  english: {
    beginner: [
      { question: "What is the plural of 'child'?", options: ["childs", "children", "childes", "childrens"], answer: "children" },
      { question: "Which word is a synonym of 'happy'?", options: ["Sad", "Angry", "Glad", "Tired"], answer: "Glad" },
      { question: "Choose the correct spelling:", options: ["Recieve", "Receive", "Receve", "Recive"], answer: "Receive" },
      { question: "Complete the sentence: 'I ___ to school yesterday.'", options: ["go", "goes", "went", "going"], answer: "went" },
      { question: "Which word is a noun?", options: ["Run", "Beautiful", "Quickly", "Apple"], answer: "Apple" },
    ],
    intermediate: [
      { question: "Choose the correct article: 'She wants to buy ___ umbrella.'", options: ["a", "an", "the", "no article"], answer: "an" },
      { question: "What is the past participle of 'fly'?", options: ["flew", "flied", "flown", "flying"], answer: "flown" },
      { question: "What is the antonym of 'generous'?", options: ["Kind", "Greedy", "Selfish", "Mean"], answer: "Selfish" },
      { question: "Identify the conjunction in: 'I wanted to go, but it was raining.'", options: ["wanted", "to", "but", "raining"], answer: "but" },
      { question: "What does the idiom 'piece of cake' mean?", options: ["Very easy", "Sweet food", "Hard work", "A birthday party"], answer: "Very easy" },
    ],
    advanced: [
      { question: "Identify the figurative language: 'The wind whispered through the trees.'", options: ["Simile", "Metaphor", "Personification", "Hyperbole"], answer: "Personification" },
      { question: "What is the meaning of the word 'eloquent'?", options: ["Fluent or persuasive in speaking", "Silent", "Very noisy", "Confused"], answer: "Fluent or persuasive in speaking" },
      { question: "Choose the correct word: 'The new rules will ___ all students.'", options: ["affect", "effect", "affeckt", "effeckt"], answer: "affect" },
      { question: "What does the idiom 'bite the bullet' mean?", options: ["Face a difficult situation with courage", "Shoot a gun", "Eat metal", "Get angry"], answer: "Face a difficult situation with courage" },
      { question: "What is a synonym of 'scrupulous'?", options: ["Careless", "Dishonest", "Thorough and attentive to details", "Lazy"], answer: "Thorough and attentive to details" },
    ],
  },
};

export function ArenaShowdown({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("setup");
  const [mode, setMode] = React.useState<GameMode>("single");
  const [difficulty, setDifficulty] = React.useState<SkillLevel>("beginner");
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Gameplay variables
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [p1Score, setP1Score] = React.useState(0);
  const [p2Score, setP2Score] = React.useState(0);
  const [activePlayer, setActivePlayer] = React.useState<1 | 2>(1);
  const [timer, setTimer] = React.useState(15);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Determine active subject from slug
  const subject: Subject = React.useMemo(() => {
    if (slug.includes("math")) return "math";
    if (slug.includes("science")) return "science";
    return "english"; // Default fallback
  }, [slug]);

  // Check if current game is Daily Coin Game
  const isDailyCoinGame = React.useMemo(() => {
    try {
      const dailyMissions = getDailyMissions();
      const { slug: dailyBonusSlug } = getDailyBonusGame();
      return dailyMissions.some((m) => m.slug === slug) || dailyBonusSlug === slug;
    } catch (e) {
      return false;
    }
  }, [slug]);

  const activeQuestion = questions[questionIndex];

  // Initialize Game
  const handleStartGame = () => {
    const pool = QUESTION_BANK[subject][difficulty];
    // Shuffle questions
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setQuestionIndex(0);
    setP1Score(0);
    setP2Score(0);
    setActivePlayer(1);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setTimer(15);
    setGameState("playing");
  };

  // Timer Countdown
  React.useEffect(() => {
    if (gameState !== "playing" || hasAnswered) return;

    if (timer <= 0) {
      handleTimeout();
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, gameState, hasAnswered]);

  const handleTimeout = () => {
    setHasAnswered(true);
    toast({
      variant: "destructive",
      title: "Time's Up!",
      description: mode === "single" ? "You ran out of time!" : `Player ${activePlayer} ran out of time!`,
    });
    proceedToNextTurn();
  };

  // Check Answer
  const handleAnswerSelect = (option: string) => {
    if (hasAnswered) return;
    setSelectedAnswer(option);
    setHasAnswered(true);

    const isCorrect = option === activeQuestion.answer;

    if (isCorrect) {
      toast({
        title: "Correct! 🎉",
        description: "+10 Points",
        className: "bg-emerald-500 text-white border-none",
      });
      if (mode === "single") {
        setP1Score((prev) => prev + 10);
      } else {
        if (activePlayer === 1) setP1Score((prev) => prev + 10);
        else setP2Score((prev) => prev + 10);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Wrong! ❌",
        description: `Correct answer was: ${activeQuestion.answer}`,
      });
    }

    proceedToNextTurn();
  };

  const proceedToNextTurn = () => {
    setTimeout(() => {
      if (mode === "single") {
        // AI's turn next
        setGameState("bot_thinking");
        simulateBotTurn();
      } else {
        // Switch player turn or end round
        if (activePlayer === 1) {
          setActivePlayer(2);
          setSelectedAnswer(null);
          setHasAnswered(false);
          setTimer(15);
        } else {
          // Both players have completed the round
          if (questionIndex < questions.length - 1) {
            setGameState("round_break");
          } else {
            endGame();
          }
        }
      }
    }, 2000);
  };

  // Simulate AI Turn
  const simulateBotTurn = () => {
    setTimeout(() => {
      // Determine accuracy based on difficulty
      const accuracyMap = { beginner: 0.5, intermediate: 0.7, advanced: 0.9 };
      const accuracy = accuracyMap[difficulty];
      const botCorrect = Math.random() < accuracy;

      if (botCorrect) {
        setP2Score((prev) => prev + 10);
        toast({
          title: "LingoBot got it right! 🤖",
          description: "Bot answered correctly (+10 pts)",
          className: "bg-indigo-500 text-white border-none",
        });
      } else {
        toast({
          title: "LingoBot made a mistake! 🤖",
          description: "Bot answered incorrectly (0 pts)",
          variant: "destructive",
        });
      }

      setTimeout(() => {
        if (questionIndex < questions.length - 1) {
          setQuestionIndex((prev) => prev + 1);
          setSelectedAnswer(null);
          setHasAnswered(false);
          setTimer(15);
          setGameState("playing");
        } else {
          endGame();
        }
      }, 1500);
    }, 1500);
  };

  const endGame = () => {
    setGameState("finished");
    // Dispatch game complete event
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("lingoland_game_completed_hijack", {
          detail: { state: "finished" },
        })
      );
    }
  };

  const handleNextRoundButton = () => {
    setQuestionIndex((prev) => prev + 1);
    setActivePlayer(1);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setTimer(15);
    setGameState("playing");
  };

  const SubjectIcon = React.useMemo(() => {
    if (subject === "math") return Calculator;
    if (subject === "science") return Atom;
    return BookOpen;
  }, [subject]);

  const subjectTitle = React.useMemo(() => {
    if (subject === "math") return "Mathematics";
    if (subject === "science") return "Science";
    return "English Grammar";
  }, [subject]);

  return (
    <div
      className={cn(
        "w-full min-h-[85vh] bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.18),rgba(255,255,255,0))] text-white flex flex-col items-center justify-center p-4 md:p-8 transition-all duration-500",
        isFullscreen && "min-h-screen p-8 rounded-none border-none"
      )}
    >
      <Card
        className={cn(
          "w-full max-w-4xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-2xl relative overflow-hidden transition-all duration-500 flex flex-col",
          isFullscreen ? "min-h-[90vh] rounded-2xl" : "rounded-3xl"
        )}
      >
        {/* Fullscreen controls */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 h-auto p-2 gap-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl z-50"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? "Exit" : "Full"}</span>
        </Button>

        {/* Decorative background glows */}
        <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full blur-[100px] bg-purple-500/10 pointer-events-none -z-10" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full blur-[100px] bg-indigo-500/10 pointer-events-none -z-10" />

        <CardHeader className="text-center pb-4 border-b border-slate-850/60 relative">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30">
              <SubjectIcon className="w-10 h-10 text-indigo-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black uppercase tracking-tight text-white flex items-center justify-center gap-2">
            <Swords className="w-6 h-6 text-indigo-400 animate-pulse" />
            <span>{subjectTitle} Showdown</span>
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
            {difficulty} &bull; {mode === "single" ? "Solo Game (vs Bot)" : "Local Multiplayer"}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow p-6 flex flex-col justify-center min-h-[350px]">
          <AnimatePresence mode="wait">
            {gameState === "setup" && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 max-w-md mx-auto w-full py-6"
              >
                {/* Select Mode */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400">
                    1. Select Duel Mode
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setMode("single")}
                      className={cn(
                        "p-4 rounded-2xl border transition-all text-center flex flex-col items-center gap-2",
                        mode === "single"
                          ? "bg-indigo-650/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                          : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white"
                      )}
                    >
                      <Bot className="w-8 h-8" />
                      <span className="font-extrabold uppercase text-xs">Vs LingoBot</span>
                    </button>
                    <button
                      onClick={() => setMode("multiplayer")}
                      className={cn(
                        "p-4 rounded-2xl border transition-all text-center flex flex-col items-center gap-2",
                        mode === "multiplayer"
                          ? "bg-indigo-650/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                          : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white"
                      )}
                    >
                      <User className="w-8 h-8" />
                      <span className="font-extrabold uppercase text-xs">Pass & Play</span>
                    </button>
                  </div>
                </div>

                {/* Select Difficulty */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400">
                    2. Select Difficulty
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {(["beginner", "intermediate", "advanced"] as SkillLevel[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={cn(
                          "py-2.5 rounded-xl border font-bold uppercase text-[10px] tracking-wider transition-all",
                          difficulty === level
                            ? "bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10"
                            : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Game Button */}
                <Button
                  onClick={handleStartGame}
                  className="w-full h-13 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-black uppercase tracking-wider text-sm shadow-xl rounded-2xl"
                >
                  <Play className="mr-2 h-5 w-5" /> Let the Duel Begin!
                </Button>
              </motion.div>
            )}

            {gameState === "playing" && activeQuestion && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 w-full"
              >
                {/* Scoreboard */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto bg-slate-950/40 border border-slate-850 rounded-2xl p-4">
                  <div className="flex items-center gap-3 justify-center">
                    <User className="w-6 h-6 text-indigo-400" />
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {mode === "single" ? "Player" : "Player 1"}
                      </p>
                      <p className="text-xl font-black text-white">{p1Score} pts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-center border-l border-slate-850">
                    {mode === "single" ? (
                      <Bot className="w-6 h-6 text-purple-400" />
                    ) : (
                      <User className="w-6 h-6 text-purple-400" />
                    )}
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {mode === "single" ? "LingoBot" : "Player 2"}
                      </p>
                      <p className="text-xl font-black text-white">{p2Score} pts</p>
                    </div>
                  </div>
                </div>

                {/* Turn Header */}
                <div className="text-center space-y-1">
                  <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/20 text-indigo-300 font-extrabold uppercase text-[9px] tracking-widest">
                    Round {questionIndex + 1} of 5
                  </Badge>
                  <h3 className="text-xl font-black uppercase text-white tracking-tight flex items-center justify-center gap-2">
                    {mode === "single" ? (
                      <>Your Turn</>
                    ) : (
                      <>Player {activePlayer}'s Turn</>
                    )}
                  </h3>
                </div>

                {/* Timer Bar */}
                <div className="max-w-md mx-auto space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Time Left</span>
                    <span className={cn(timer <= 5 ? "text-rose-500 font-black animate-pulse" : "text-slate-400")}>{timer}s</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                    <div
                      className={cn(
                        "h-full transition-all duration-1000",
                        timer <= 5 ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]" : "bg-gradient-to-r from-indigo-500 to-purple-500"
                      )}
                      style={{ width: `${(timer / 15) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question Box */}
                <div className="p-8 rounded-[2rem] bg-slate-950/60 border border-slate-850/80 shadow-lg text-center max-w-xl mx-auto space-y-6">
                  <h4 className="font-extrabold text-white text-xl md:text-2xl leading-relaxed italic">
                    "{activeQuestion.question}"
                  </h4>

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {activeQuestion.options.map((option) => {
                      const isCorrect = option === activeQuestion.answer;
                      const isSelected = option === selectedAnswer;

                      return (
                        <Button
                          key={option}
                          disabled={hasAnswered}
                          onClick={() => handleAnswerSelect(option)}
                          className={cn(
                            "h-14 font-extrabold text-sm rounded-2xl transition-all border shadow-lg flex items-center justify-center px-4",
                            hasAnswered
                              ? isCorrect
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 disabled:opacity-100"
                                : isSelected
                                ? "bg-rose-500/20 border-rose-500 text-rose-300 disabled:opacity-100"
                                : "bg-slate-950/20 border-slate-900 text-slate-500 disabled:opacity-50"
                              : "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-850 hover:border-slate-700"
                          )}
                        >
                          {option}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {gameState === "bot_thinking" && (
              <motion.div
                key="bot_thinking"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-4 py-12"
              >
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-purple-500/10 blur-xl animate-pulse" />
                  <Bot className="w-16 h-16 text-purple-400 animate-bounce relative" style={{ animationDuration: "2s" }} />
                </div>
                <h3 className="font-black uppercase tracking-widest text-slate-400 text-xs mt-4">
                  LingoBot is thinking...
                </h3>
              </motion.div>
            )}

            {gameState === "round_break" && (
              <motion.div
                key="round_break"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-6 max-w-md mx-auto py-8"
              >
                <Swords className="w-16 h-16 text-indigo-400 mx-auto animate-pulse" />
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase text-white tracking-tight">Round Completed</h3>
                  <p className="text-slate-400 text-xs">
                    Pass the device to Player 1 for Round {questionIndex + 2}!
                  </p>
                </div>

                <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase">Player 1</p>
                    <p className="text-lg font-black text-white">{p1Score} pts</p>
                  </div>
                  <div className="border-l border-slate-850">
                    <p className="text-[10px] font-black text-slate-500 uppercase">Player 2</p>
                    <p className="text-lg font-black text-white">{p2Score} pts</p>
                  </div>
                </div>

                <Button
                  onClick={handleNextRoundButton}
                  className="w-full h-12 bg-indigo-650 hover:bg-indigo-600 text-white font-black uppercase tracking-wide text-xs rounded-xl"
                >
                  Start Round {questionIndex + 2} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {gameState === "finished" && (
              <motion.div
                key="finished"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-8 max-w-md mx-auto py-6"
              >
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-amber-500/10 blur-xl animate-pulse" />
                  <Trophy className="w-24 h-24 text-amber-400 mx-auto drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase tracking-tight text-white">Duel Completed!</h3>
                  <p className="text-indigo-400 font-extrabold uppercase text-xs tracking-wider">
                    {mode === "single" ? (
                      p1Score > p2Score ? (
                        "You defeated LingoBot! 🏆"
                      ) : p1Score < p2Score ? (
                        "LingoBot Won! 🤖"
                      ) : (
                        "It's a Tie! 🤝"
                      )
                    ) : p1Score > p2Score ? (
                      "Player 1 Won! 🏆"
                    ) : p1Score < p2Score ? (
                      "Player 2 Won! 🏆"
                    ) : (
                      "It's a Tie! 🤝"
                    )}
                  </p>
                </div>

                {/* Scores breakdown */}
                <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-5 grid grid-cols-2 gap-4 shadow-inner">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {mode === "single" ? "Your Score" : "Player 1"}
                    </p>
                    <p className="text-2xl font-black text-white mt-1">{p1Score} pts</p>
                  </div>
                  <div className="border-l border-slate-850">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {mode === "single" ? "LingoBot Score" : "Player 2"}
                    </p>
                    <p className="text-2xl font-black text-white mt-1">{p2Score} pts</p>
                  </div>
                </div>

                {/* Coin Reward Info */}
                <div className="p-4 rounded-2xl bg-slate-950/30 border border-slate-850 text-center space-y-1.5">
                  {isDailyCoinGame ? (
                    <div className="flex items-center justify-center gap-2 text-amber-400 font-black text-sm uppercase tracking-wide">
                      <Coins className="w-5 h-5 animate-bounce" />
                      <span>Daily Coin Active: +10 Lingo-Coins Earned!</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 text-slate-500 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4 text-slate-600" />
                      <span>Coins are only obtainable on the active Daily Coin game.</span>
                    </div>
                  )}
                  <p className="text-[9px] text-slate-500 font-bold">
                    XP (+100) and energy statistics have been synced to your LingoPet profile.
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex flex-col gap-2.5">
                  <Button
                    onClick={handleStartGame}
                    className="w-full h-12 bg-gradient-to-r from-purple-500 to-indigo-650 hover:opacity-90 text-white font-black uppercase text-xs rounded-xl flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Play Again</span>
                  </Button>
                  <Button
                    onClick={() => setGameState("setup")}
                    className="w-full h-12 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 font-bold uppercase text-xs rounded-xl"
                  >
                    Game Setup Lobby
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-12 border-slate-800 text-slate-350 hover:bg-slate-850 hover:text-white font-bold uppercase text-xs rounded-xl"
                  >
                    <Link href="/games">Back to Classroom Games</Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between items-center gap-4 pt-4 border-t border-slate-850/60 pb-6 px-6">
          <Button
            variant="outline"
            asChild
            className="h-10 border-slate-850 text-slate-400 hover:bg-slate-850 hover:text-white rounded-xl text-xs font-bold"
          >
            <Link href="/games">Back to Games</Link>
          </Button>
          {gameState !== "setup" && (
            <Button
              variant="secondary"
              onClick={() => setGameState("setup")}
              className="h-10 bg-slate-850 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-bold"
            >
              Quit Game
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
