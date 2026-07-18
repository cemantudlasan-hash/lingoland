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
  Play,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getDailyMissions, getDailyBonusGame } from "@/lib/analytics";
import Link from "next/link";
import type { SkillLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

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
      { question: "What is 9 + 9?", options: ["16", "17", "18", "19"], answer: "18" },
      { question: "What is 14 - 6?", options: ["6", "7", "8", "9"], answer: "8" },
      { question: "What is 3 + 7 + 5?", options: ["13", "14", "15", "16"], answer: "15" },
      { question: "What is 18 - 10?", options: ["6", "7", "8", "9"], answer: "8" },
      { question: "What is 6 + 7?", options: ["11", "12", "13", "14"], answer: "13" },
      { question: "What is 25 - 5?", options: ["15", "20", "25", "30"], answer: "20" },
      { question: "What is 4 + 4 + 4?", options: ["10", "12", "14", "16"], answer: "12" },
      { question: "What is 30 - 15?", options: ["10", "15", "20", "25"], answer: "15" },
      { question: "What is 11 + 9?", options: ["18", "19", "20", "21"], answer: "20" },
      { question: "What is 16 - 8?", options: ["6", "7", "8", "9"], answer: "8" },
    ],
    intermediate: [
      { question: "What is 7 x 8?", options: ["54", "56", "58", "62"], answer: "56" },
      { question: "What is 144 / 12?", options: ["10", "11", "12", "14"], answer: "12" },
      { question: "What is 3 x (4 + 5)?", options: ["17", "23", "27", "32"], answer: "27" },
      { question: "What is 15% of 200?", options: ["20", "25", "30", "35"], answer: "30" },
      { question: "What is the square of 9?", options: ["72", "81", "90", "99"], answer: "81" },
      { question: "What is 6 x 9?", options: ["48", "52", "54", "56"], answer: "54" },
      { question: "What is 120 / 10?", options: ["10", "11", "12", "13"], answer: "12" },
      { question: "What is 4 x (6 + 3)?", options: ["24", "32", "36", "40"], answer: "36" },
      { question: "What is 20% of 150?", options: ["25", "30", "35", "40"], answer: "30" },
      { question: "What is the square of 12?", options: ["122", "140", "144", "156"], answer: "144" },
      { question: "What is 8 x 9?", options: ["64", "72", "80", "81"], answer: "72" },
      { question: "What is 100 / 4?", options: ["20", "25", "30", "35"], answer: "25" },
      { question: "What is 5 x (8 - 3)?", options: ["15", "20", "25", "30"], answer: "25" },
      { question: "What is 10% of 450?", options: ["40", "45", "50", "55"], answer: "45" },
      { question: "What is the square of 7?", options: ["35", "42", "49", "56"], answer: "49" },
    ],
    advanced: [
      { question: "If 3x + 7 = 22, what is x?", options: ["3", "4", "5", "6"], answer: "5" },
      { question: "Solve: 10 - 2 * 3 + 4", options: ["8", "16", "28", "18"], answer: "8" },
      { question: "What is the square root of 225?", options: ["13", "14", "15", "16"], answer: "15" },
      { question: "If a triangle has base 6cm and height 8cm, what is its area?", options: ["14", "24", "48", "28"], answer: "24" },
      { question: "If x^2 = 64 and x > 0, what is x?", options: ["4", "6", "8", "10"], answer: "8" },
      { question: "If 4x - 5 = 19, what is x?", options: ["5", "6", "7", "8"], answer: "6" },
      { question: "Solve: 24 / 6 + 2 * 5", options: ["14", "16", "18", "30"], answer: "14" },
      { question: "What is the square root of 196?", options: ["12", "13", "14", "15"], answer: "14" },
      { question: "What is the volume of a cube with 4cm sides?", options: ["16 cm³", "32 cm³", "64 cm³", "128 cm³"], answer: "64 cm³" },
      { question: "If 2(x + 3) = 16, what is x?", options: ["4", "5", "6", "7"], answer: "5" },
      { question: "Solve: 5 + 4 * (8 - 3)", options: ["25", "45", "29", "35"], answer: "25" },
      { question: "What is the square root of 289?", options: ["15", "16", "17", "18"], answer: "17" },
      { question: "What is the area of a circle with radius 7 (use pi = 22/7)?", options: ["44", "154", "77", "196"], answer: "154" },
      { question: "If 5x + 3 = 2x + 18, what is x?", options: ["3", "4", "5", "6"], answer: "5" },
      { question: "Solve: 15 / 3 + 4 * 2", options: ["11", "13", "18", "21"], answer: "13" },
    ],
  },
  science: {
    beginner: [
      { question: "Which planet is closest to the Sun?", options: ["Venus", "Mars", "Mercury", "Jupiter"], answer: "Mercury" },
      { question: "What state of matter is steam?", options: ["Solid", "Liquid", "Gas", "Plasma"], answer: "Gas" },
      { question: "How many legs does a spider have?", options: ["6", "8", "10", "12"], answer: "8" },
      { question: "Which gas do humans need to breathe?", options: ["Nitrogen", "Oxygen", "Carbon Dioxide", "Hydrogen"], answer: "Oxygen" },
      { question: "What is the freezing point of water in Celsius?", options: ["-10", "0", "10", "100"], answer: "0" },
      { question: "Which planet is known as the red planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: "Mars" },
      { question: "What state of matter is ice?", options: ["Solid", "Liquid", "Gas", "Plasma"], answer: "Solid" },
      { question: "How many bones are in an adult human body?", options: ["106", "206", "306", "406"], answer: "206" },
      { question: "Which gas do plants absorb from the air?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"], answer: "Carbon Dioxide" },
      { question: "What is the boiling point of water in Celsius?", options: ["50", "80", "100", "120"], answer: "100" },
      { question: "What is the largest mammal in the world?", options: ["Elephant", "Blue Whale", "Giraffe", "Shark"], answer: "Blue Whale" },
      { question: "Which celestial body shines at night in the sky?", options: ["Sun", "Moon", "Comet", "Meteor"], answer: "Moon" },
      { question: "What state of matter is water?", options: ["Solid", "Liquid", "Gas", "Plasma"], answer: "Liquid" },
      { question: "What is the primary source of energy for Earth?", options: ["Moon", "Sun", "Wind", "Ocean"], answer: "Sun" },
      { question: "What force pulls objects toward Earth?", options: ["Magnetism", "Friction", "Gravity", "Inertia"], answer: "Gravity" },
    ],
    intermediate: [
      { question: "What is the chemical symbol for Gold?", options: ["Ag", "Au", "Fe", "Gd"], answer: "Au" },
      { question: "Which organ pumps blood throughout the human body?", options: ["Brain", "Lungs", "Heart", "Liver"], answer: "Heart" },
      { question: "What is the process by which plants make food?", options: ["Respiration", "Photosynthesis", "Transpiration", "Digestion"], answer: "Photosynthesis" },
      { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: "Mars" },
      { question: "What is the hardest natural substance on Earth?", options: ["Gold", "Iron", "Diamond", "Quartz"], answer: "Diamond" },
      { question: "What is the chemical symbol for Water?", options: ["CO2", "H2O", "NaCl", "O2"], answer: "H2O" },
      { question: "Which organ filters waste from the blood?", options: ["Heart", "Liver", "Kidneys", "Stomach"], answer: "Kidneys" },
      { question: "What is the name of the green pigment in plants?", options: ["Carotene", "Chlorophyll", "Xanthophyll", "Melanin"], answer: "Chlorophyll" },
      { question: "Which planet is largest in our solar system?", options: ["Earth", "Saturn", "Jupiter", "Neptune"], answer: "Jupiter" },
      { question: "What mineral is main in our bones?", options: ["Iron", "Calcium", "Zinc", "Sodium"], answer: "Calcium" },
      { question: "What is the chemical symbol for Iron?", options: ["Ir", "Fe", "Au", "Pb"], answer: "Fe" },
      { question: "Which organ is responsible for breathing?", options: ["Heart", "Lungs", "Brain", "Kidneys"], answer: "Lungs" },
      { question: "What gas makes up most of the air we breathe?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"], answer: "Nitrogen" },
      { question: "Which planet has famous visible rings around it?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], answer: "Saturn" },
      { question: "What type of energy is stored in a battery?", options: ["Thermal", "Electrical", "Chemical", "Nuclear"], answer: "Chemical" },
    ],
    advanced: [
      { question: "What is the approximate speed of light?", options: ["30,000 km/s", "300,000 km/s", "3,000,000 km/s", "300 km/s"], answer: "300,000 km/s" },
      { question: "What is the main gas in the Earth's atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"], answer: "Nitrogen" },
      { question: "Which subatomic particle has a negative charge?", options: ["Proton", "Neutron", "Electron", "Quark"], answer: "Electron" },
      { question: "What is the unit of electric resistance?", options: ["Volt", "Ampere", "Ohm", "Watt"], answer: "Ohm" },
      { question: "What is the power house of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], answer: "Mitochondria" },
      { question: "What is the chemical symbol for Lead?", options: ["Ld", "Fe", "Pb", "Au"], answer: "Pb" },
      { question: "Which scientist formulated the laws of motion?", options: ["Einstein", "Newton", "Galileo", "Copernicus"], answer: "Newton" },
      { question: "Which subatomic particle has no electric charge?", options: ["Proton", "Neutron", "Electron", "Positron"], answer: "Neutron" },
      { question: "What is the unit of force?", options: ["Joule", "Watt", "Newton", "Pascal"], answer: "Newton" },
      { question: "What is the process of cell division called?", options: ["Mitosis", "Osmosis", "Photosynthesis", "Respiration"], answer: "Mitosis" },
      { question: "What is the chemical symbol for Mercury?", options: ["Me", "Hg", "Pb", "Ag"], answer: "Hg" },
      { question: "Which scientist proposed the theory of relativity?", options: ["Newton", "Einstein", "Bohr", "Hawking"], answer: "Einstein" },
      { question: "Which subatomic particle has a positive charge?", options: ["Proton", "Neutron", "Electron", "Neutrino"], answer: "Proton" },
      { question: "What is the unit of frequency?", options: ["Hertz", "Decibel", "Joule", "Ohm"], answer: "Hertz" },
      { question: "What is the outer layer of the Earth called?", options: ["Mantle", "Core", "Crust", "Magma"], answer: "Crust" },
    ],
  },
  english: {
    beginner: [
      { question: "What is the plural of 'child'?", options: ["childs", "children", "childes", "childrens"], answer: "children" },
      { question: "Which word is a synonym of 'happy'?", options: ["Sad", "Angry", "Glad", "Tired"], answer: "Glad" },
      { question: "Choose the correct spelling:", options: ["Recieve", "Receive", "Receve", "Recive"], answer: "Receive" },
      { question: "Complete the sentence: 'I ___ to school yesterday.'", options: ["go", "goes", "went", "going"], answer: "went" },
      { question: "Which word is a noun?", options: ["Run", "Beautiful", "Quickly", "Apple"], answer: "Apple" },
      { question: "What is the plural of 'mouse'?", options: ["mouses", "mice", "mices", "mousese"], answer: "mice" },
      { question: "Which word is a synonym of 'big'?", options: ["Small", "Large", "Tiny", "Short"], answer: "Large" },
      { question: "Choose the correct spelling:", options: ["Tomorrow", "Tommorow", "Tommorrow", "Tomorow"], answer: "Tomorrow" },
      { question: "Complete: 'She ___ a book right now.'", options: ["read", "reads", "is reading", "reading"], answer: "is reading" },
      { question: "Which word is a verb?", options: ["Jump", "Happy", "Elephant", "Softly"], answer: "Jump" },
      { question: "What is the plural of 'sheep'?", options: ["sheeps", "sheep", "sheepes", "sheepses"], answer: "sheep" },
      { question: "Which word is a synonym of 'quick'?", options: ["Slow", "Fast", "Quiet", "Heavy"], answer: "Fast" },
      { question: "Choose the correct spelling:", options: ["Beautiful", "Beatiful", "Beautifull", "Beautifull"], answer: "Beautiful" },
      { question: "Complete: 'We ___ football last Sunday.'", options: ["play", "plays", "played", "playing"], answer: "played" },
      { question: "Which word is an adjective?", options: ["Run", "Blue", "Slowly", "Table"], answer: "Blue" },
    ],
    intermediate: [
      { question: "Choose the correct article: 'She wants to buy ___ umbrella.'", options: ["a", "an", "the", "no article"], answer: "an" },
      { question: "What is the past participle of 'fly'?", options: ["flew", "flied", "flown", "flying"], answer: "flown" },
      { question: "What is the antonym of 'generous'?", options: ["Kind", "Greedy", "Selfish", "Mean"], answer: "Selfish" },
      { question: "Identify the conjunction in: 'I wanted to go, but it was raining.'", options: ["wanted", "to", "but", "raining"], answer: "but" },
      { question: "What does the idiom 'piece of cake' mean?", options: ["Very easy", "Sweet food", "Hard work", "A birthday party"], answer: "Very easy" },
      { question: "Choose the correct article: 'He is ___ honest man.'", options: ["a", "an", "the", "no article"], answer: "an" },
      { question: "What is the past participle of 'write'?", options: ["wrote", "writed", "written", "writing"], answer: "written" },
      { question: "What is the antonym of 'brave'?", options: ["Strong", "Cowardly", "Smart", "Angry"], answer: "Cowardly" },
      { question: "Identify the preposition in: 'The cat is under the table.'", options: ["cat", "is", "under", "table"], answer: "under" },
      { question: "What does the idiom 'break a leg' mean?", options: ["Good luck", "Get hurt", "Go home", "Dance well"], answer: "Good luck" },
      { question: "Choose the correct article: 'I saw ___ unique bird yesterday.'", options: ["a", "an", "the", "no article"], answer: "a" },
      { question: "What is the past participle of 'swim'?", options: ["swam", "swimed", "swum", "swimming"], answer: "swum" },
      { question: "What is the antonym of 'ancient'?", options: ["Old", "New", "Modern", "Historic"], answer: "Modern" },
      { question: "Identify the adverb in: 'She sang beautifully.'", options: ["She", "sang", "beautifully", "none"], answer: "beautifully" },
      { question: "What does the idiom 'cost an arm and a leg' mean?", options: ["Very expensive", "Cheap", "Physical pain", "Surgery"], answer: "Very expensive" },
    ],
    advanced: [
      { question: "Identify the figurative language: 'The wind whispered through the trees.'", options: ["Simile", "Metaphor", "Personification", "Hyperbole"], answer: "Personification" },
      { question: "What is the meaning of the word 'eloquent'?", options: ["Fluent or persuasive in speaking", "Silent", "Very noisy", "Confused"], answer: "Fluent or persuasive in speaking" },
      { question: "Choose the correct word: 'The new rules will ___ all students.'", options: ["affect", "effect", "affeckt", "effeckt"], answer: "affect" },
      { question: "What does the idiom 'bite the bullet' mean?", options: ["Face a difficult situation with courage", "Shoot a gun", "Eat metal", "Get angry"], answer: "Face a difficult situation with courage" },
      { question: "What is a synonym of 'scrupulous'?", options: ["Careless", "Dishonest", "Thorough and attentive to details", "Lazy"], answer: "Thorough and attentive to details" },
      { question: "Identify the figurative language: 'Her heart was a block of ice.'", options: ["Simile", "Metaphor", "Personification", "Alliteration"], answer: "Metaphor" },
      { question: "What is the meaning of the word 'capricious'?", options: ["Given to sudden changes of mood", "Steady", "Friendly", "Stubborn"], answer: "Given to sudden changes of mood" },
      { question: "Choose the correct word: 'This coffee is better ___ the one we had yesterday.'", options: ["then", "than", "there", "their"], answer: "than" },
      { question: "What does the idiom 'burn the midnight oil' mean?", options: ["Work late into the night", "Start a fire", "Save energy", "Cook food"], answer: "Work late into the night" },
      { question: "What is a synonym of 'ephemeral'?", options: ["Permanent", "Short-lived", "Heavy", "Deep"], answer: "Short-lived" },
      { question: "Identify the figurative language: 'He cried a river of tears.'", options: ["Simile", "Metaphor", "Personification", "Hyperbole"], answer: "Hyperbole" },
      { question: "What is the meaning of the word 'pragmatic'?", options: ["Dealing with things practically", "Dreamy", "Angry", "Scientific"], answer: "Dealing with things practically" },
      { question: "Choose the correct word: 'Whose jacket is ___?'", options: ["there", "their", "they're", "this"], answer: "this" },
      { question: "What does the idiom 'spill the beans' mean?", options: ["Reveal a secret", "Cook dinner", "Make a mess", "Drop items"], answer: "Reveal a secret" },
      { question: "What is a synonym of 'loquacious'?", options: ["Talkative", "Quiet", "Smart", "Lazy"], answer: "Talkative" },
    ],
  },
};

export function ArenaShowdown({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("setup");
  const [mode, setMode] = React.useState<GameMode>("single");
  const [difficulty, setDifficulty] = React.useState<SkillLevel>("beginner");
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [roundsCount, setRoundsCount] = React.useState<number>(5);

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
    
    // Load seen questions indices from localStorage to avoid repetition
    const historyKey = `lingoland_arena_seen_questions_${subject}_${difficulty}`;
    let seenIndices: number[] = [];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(historyKey);
        if (stored) {
          seenIndices = JSON.parse(stored);
        }
      } catch (e) {}
    }

    // Filter pool for unseen questions
    let available = pool.map((q, idx) => ({ q, idx })).filter(item => !seenIndices.includes(item.idx));

    // If we have fewer than the requested rounds count of unseen questions left, reset history
    const roundsToLoad = mode === "multiplayer" ? roundsCount : 5;
    if (available.length < roundsToLoad) {
      seenIndices = [];
      available = pool.map((q, idx) => ({ q, idx }));
    }

    // Shuffle available questions and select roundsToLoad
    let selected: typeof available = [];
    if (available.length >= roundsToLoad) {
      selected = available.sort(() => Math.random() - 0.5).slice(0, roundsToLoad);
      const newlySeen = [...seenIndices, ...selected.map(item => item.idx)];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(historyKey, JSON.stringify(newlySeen));
        } catch (e) {}
      }
    } else {
      // Fallback: If pool size is smaller than roundsToLoad, select all and pad with duplicates
      selected = [...available];
      const remaining = roundsToLoad - selected.length;
      const extras = pool.map((q, idx) => ({ q, idx })).sort(() => Math.random() - 0.5);
      selected = [...selected, ...extras.slice(0, remaining)];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(historyKey, JSON.stringify([]));
        } catch (e) {}
      }
    }

    setQuestions(selected.map(item => item.q));
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
        "w-full min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.18),rgba(255,255,255,0))] text-white flex flex-col items-center justify-center p-4 md:p-8 transition-all duration-500",
        isFullscreen && "p-8 rounded-none border-none"
      )}
    >
      <Card
        className={cn(
          "w-full max-w-6xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-2xl relative overflow-hidden transition-all duration-500 flex flex-col",
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
                className="space-y-8 max-w-2xl mx-auto w-full py-6"
              >
                {/* Select Mode */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400">
                    1. Select Duel Mode
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { setMode("single"); setRoundsCount(5); }}
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

                {/* Select Rounds (Only for Multiplayer Mode) */}
                {mode === "multiplayer" && (
                  <div className="space-y-3">
                    <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400">
                      3. Customize Rounds
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      {([5, 10, 20] as number[]).map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setRoundsCount(count)}
                          className={cn(
                            "py-2.5 rounded-xl border font-bold uppercase text-[10px] tracking-wider transition-all",
                            roundsCount === count
                              ? "bg-amber-600/20 border-amber-500 text-white shadow-lg shadow-amber-500/10"
                              : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white"
                          )}
                        >
                          {count} Rounds
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
                <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto bg-slate-950/40 border border-slate-850 rounded-2xl p-4">
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
                    Round {questionIndex + 1} of {questions.length}
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
                <div className="max-w-3xl mx-auto space-y-1">
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
                <div className="p-8 rounded-[2rem] bg-slate-950/60 border border-slate-850/80 shadow-lg text-center max-w-4xl mx-auto space-y-6">
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
                className="text-center space-y-6 max-w-xl mx-auto py-8"
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
                className="text-center space-y-8 max-w-xl mx-auto py-6"
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
