"use client";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Maximize, Minimize, Trophy, Sparkles, Repeat, Dna, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";
import { shuffleArray } from "@/lib/shuffle";

interface GeneticsQuestion {
  id: number;
  question: string;
  parent1: string; // Mother
  parent2: string; // Father
  p1Label: string;
  p2Label: string;
  correctAnswer: string;
  options: string[];
  topAlleles: string[];
  leftAlleles: string[];
  cellValues: string[];
}

const QUESTION_POOL: GeneticsQuestion[] = [
  // Bb x Bb (Eyes)
  {
    id: 1,
    question: "What is the probability of having an offspring with blue eyes (recessive, bb)?",
    parent1: "Bb", parent2: "Bb",
    p1Label: "Brown eyes (heterozygous)", p2Label: "Brown eyes (heterozygous)",
    correctAnswer: "25%",
    options: ["25%", "50%", "75%", "100%"],
    topAlleles: ["B", "b"], leftAlleles: ["B", "b"],
    cellValues: ["BB", "Bb", "Bb", "bb"]
  },
  {
    id: 2,
    question: "What is the expected genotype ratio of BB : Bb : bb?",
    parent1: "Bb", parent2: "Bb",
    p1Label: "Brown eyes (heterozygous)", p2Label: "Brown eyes (heterozygous)",
    correctAnswer: "1:2:1",
    options: ["1:1", "3:1", "1:2:1", "9:3:3:1"],
    topAlleles: ["B", "b"], leftAlleles: ["B", "b"],
    cellValues: ["BB", "Bb", "Bb", "bb"]
  },
  {
    id: 3,
    question: "What is the probability of having a heterozygous (Bb) offspring?",
    parent1: "Bb", parent2: "Bb",
    p1Label: "Brown eyes (heterozygous)", p2Label: "Brown eyes (heterozygous)",
    correctAnswer: "50%",
    options: ["25%", "50%", "75%", "0%"],
    topAlleles: ["B", "b"], leftAlleles: ["B", "b"],
    cellValues: ["BB", "Bb", "Bb", "bb"]
  },
  {
    id: 4,
    question: "What is the expected phenotype ratio of dominant (Brown) to recessive (Blue) eyes?",
    parent1: "Bb", parent2: "Bb",
    p1Label: "Brown eyes (heterozygous)", p2Label: "Brown eyes (heterozygous)",
    correctAnswer: "3:1",
    options: ["1:1", "3:1", "2:2", "1:2:1"],
    topAlleles: ["B", "b"], leftAlleles: ["B", "b"],
    cellValues: ["BB", "Bb", "Bb", "bb"]
  },
  // Bb x bb (Eyes)
  {
    id: 5,
    question: "What is the probability of having a homozygous recessive (bb) offspring?",
    parent1: "Bb", parent2: "bb",
    p1Label: "Brown eyes (heterozygous)", p2Label: "Blue eyes (homozygous recessive)",
    correctAnswer: "50%",
    options: ["25%", "50%", "75%", "100%"],
    topAlleles: ["B", "b"], leftAlleles: ["b", "b"],
    cellValues: ["Bb", "bb", "Bb", "bb"]
  },
  {
    id: 6,
    question: "What percentage of offspring will exhibit the dominant phenotype (Brown eyes)?",
    parent1: "Bb", parent2: "bb",
    p1Label: "Brown eyes (heterozygous)", p2Label: "Blue eyes (homozygous recessive)",
    correctAnswer: "50%",
    options: ["25%", "50%", "0%", "100%"],
    topAlleles: ["B", "b"], leftAlleles: ["b", "b"],
    cellValues: ["Bb", "bb", "Bb", "bb"]
  },
  // BB x bb (Eyes)
  {
    id: 7,
    question: "What percentage of offspring will show the dominant phenotype (Brown eyes)?",
    parent1: "BB", parent2: "bb",
    p1Label: "Brown eyes (homozygous dominant)", p2Label: "Blue eyes (homozygous recessive)",
    correctAnswer: "100%",
    options: ["25%", "50%", "75%", "100%"],
    topAlleles: ["B", "B"], leftAlleles: ["b", "b"],
    cellValues: ["Bb", "Bb", "Bb", "Bb"]
  },
  {
    id: 8,
    question: "What percentage of offspring will be heterozygous (Bb)?",
    parent1: "BB", parent2: "bb",
    p1Label: "Brown eyes (homozygous dominant)", p2Label: "Blue eyes (homozygous recessive)",
    correctAnswer: "100%",
    options: ["0%", "50%", "75%", "100%"],
    topAlleles: ["B", "B"], leftAlleles: ["b", "b"],
    cellValues: ["Bb", "Bb", "Bb", "Bb"]
  },
  // BB x Bb (Eyes)
  {
    id: 9,
    question: "What is the probability of having a homozygous dominant (BB) offspring?",
    parent1: "BB", parent2: "Bb",
    p1Label: "Brown eyes (homozygous dominant)", p2Label: "Brown eyes (heterozygous)",
    correctAnswer: "50%",
    options: ["25%", "50%", "75%", "0%"],
    topAlleles: ["B", "B"], leftAlleles: ["B", "b"],
    cellValues: ["BB", "BB", "Bb", "Bb"]
  },
  {
    id: 10,
    question: "What percentage of offspring will show the recessive phenotype (Blue eyes)?",
    parent1: "BB", parent2: "Bb",
    p1Label: "Brown eyes (homozygous dominant)", p2Label: "Brown eyes (heterozygous)",
    correctAnswer: "0%",
    options: ["0%", "25%", "50%", "75%"],
    topAlleles: ["B", "B"], leftAlleles: ["B", "b"],
    cellValues: ["BB", "BB", "Bb", "Bb"]
  },
  // Tt x Tt (Height)
  {
    id: 11,
    question: "What percentage of offspring will be short (homozygous recessive, tt)?",
    parent1: "Tt", parent2: "Tt",
    p1Label: "Tall plant (heterozygous)", p2Label: "Tall plant (heterozygous)",
    correctAnswer: "25%",
    options: ["25%", "50%", "75%", "100%"],
    topAlleles: ["T", "t"], leftAlleles: ["T", "t"],
    cellValues: ["TT", "Tt", "Tt", "tt"]
  },
  {
    id: 12,
    question: "What is the probability of having a tall plant offspring (TT or Tt)?",
    parent1: "Tt", parent2: "Tt",
    p1Label: "Tall plant (heterozygous)", p2Label: "Tall plant (heterozygous)",
    correctAnswer: "75%",
    options: ["25%", "50%", "75%", "100%"],
    topAlleles: ["T", "t"], leftAlleles: ["T", "t"],
    cellValues: ["TT", "Tt", "Tt", "tt"]
  },
  {
    id: 13,
    question: "What is the expected genotype ratio of TT : Tt : tt?",
    parent1: "Tt", parent2: "Tt",
    p1Label: "Tall plant (heterozygous)", p2Label: "Tall plant (heterozygous)",
    correctAnswer: "1:2:1",
    options: ["1:1", "3:1", "1:2:1", "1:3:1"],
    topAlleles: ["T", "t"], leftAlleles: ["T", "t"],
    cellValues: ["TT", "Tt", "Tt", "tt"]
  },
  // TT x Tt (Height)
  {
    id: 14,
    question: "What is the probability of having a heterozygous (Tt) offspring?",
    parent1: "TT", parent2: "Tt",
    p1Label: "Tall plant (homozygous)", p2Label: "Tall plant (heterozygous)",
    correctAnswer: "50%",
    options: ["25%", "50%", "75%", "100%"],
    topAlleles: ["T", "T"], leftAlleles: ["T", "t"],
    cellValues: ["TT", "TT", "Tt", "Tt"]
  },
  {
    id: 15,
    question: "What is the probability of having a short plant (tt) offspring?",
    parent1: "TT", parent2: "Tt",
    p1Label: "Tall plant (homozygous)", p2Label: "Tall plant (heterozygous)",
    correctAnswer: "0%",
    options: ["0%", "25%", "50%", "75%"],
    topAlleles: ["T", "T"], leftAlleles: ["T", "t"],
    cellValues: ["TT", "TT", "Tt", "Tt"]
  },
  // Tt x tt (Height)
  {
    id: 16,
    question: "What is the phenotype ratio of tall plants to short plants?",
    parent1: "Tt", parent2: "tt",
    p1Label: "Tall plant (heterozygous)", p2Label: "Short plant (homozygous recessive)",
    correctAnswer: "1:1",
    options: ["1:1", "3:1", "1:2:1", "4:0"],
    topAlleles: ["T", "t"], leftAlleles: ["t", "t"],
    cellValues: ["Tt", "tt", "Tt", "tt"]
  },
  {
    id: 17,
    question: "What percentage of offspring will be short plants?",
    parent1: "Tt", parent2: "tt",
    p1Label: "Tall plant (heterozygous)", p2Label: "Short plant (homozygous recessive)",
    correctAnswer: "50%",
    options: ["25%", "50%", "75%", "100%"],
    topAlleles: ["T", "t"], leftAlleles: ["t", "t"],
    cellValues: ["Tt", "tt", "Tt", "tt"]
  },
  // TT x tt (Height)
  {
    id: 18,
    question: "What percentage of offspring will be tall plants?",
    parent1: "TT", parent2: "tt",
    p1Label: "Tall plant (homozygous)", p2Label: "Short plant (homozygous recessive)",
    correctAnswer: "100%",
    options: ["0%", "50%", "75%", "100%"],
    topAlleles: ["T", "T"], leftAlleles: ["t", "t"],
    cellValues: ["Tt", "Tt", "Tt", "Tt"]
  },
  // Rr x Rr (Flowers)
  {
    id: 19,
    question: "What is the probability of having white flowers (recessive, rr)?",
    parent1: "Rr", parent2: "Rr",
    p1Label: "Red flowers (heterozygous)", p2Label: "Red flowers (heterozygous)",
    correctAnswer: "25%",
    options: ["0%", "25%", "50%", "75%"],
    topAlleles: ["R", "r"], leftAlleles: ["R", "r"],
    cellValues: ["RR", "Rr", "Rr", "rr"]
  },
  {
    id: 20,
    question: "What percentage of offspring will have red flowers (dominant phenotype)?",
    parent1: "Rr", parent2: "Rr",
    p1Label: "Red flowers (heterozygous)", p2Label: "Red flowers (heterozygous)",
    correctAnswer: "75%",
    options: ["25%", "50%", "75%", "100%"],
    topAlleles: ["R", "r"], leftAlleles: ["R", "r"],
    cellValues: ["RR", "Rr", "Rr", "rr"]
  },
  {
    id: 21,
    question: "What is the probability of having heterozygous red (Rr) flowers?",
    parent1: "Rr", parent2: "Rr",
    p1Label: "Red flowers (heterozygous)", p2Label: "Red flowers (heterozygous)",
    correctAnswer: "50%",
    options: ["25%", "50%", "75%", "100%"],
    topAlleles: ["R", "r"], leftAlleles: ["R", "r"],
    cellValues: ["RR", "Rr", "Rr", "rr"]
  },
  // Rr x rr (Flowers)
  {
    id: 22,
    question: "What is the phenotype ratio of red flowers to white flowers?",
    parent1: "Rr", parent2: "rr",
    p1Label: "Red flowers (heterozygous)", p2Label: "White flowers (homozygous recessive)",
    correctAnswer: "1:1",
    options: ["3:1", "1:1", "1:2:1", "1:3"],
    topAlleles: ["R", "r"], leftAlleles: ["r", "r"],
    cellValues: ["Rr", "rr", "Rr", "rr"]
  },
  {
    id: 23,
    question: "What is the probability of having white flowers?",
    parent1: "Rr", parent2: "rr",
    p1Label: "Red flowers (heterozygous)", p2Label: "White flowers (homozygous recessive)",
    correctAnswer: "50%",
    options: ["25%", "50%", "75%", "0%"],
    topAlleles: ["R", "r"], leftAlleles: ["r", "r"],
    cellValues: ["Rr", "rr", "Rr", "rr"]
  },
  // RR x Rr (Flowers)
  {
    id: 24,
    question: "What percentage of offspring will be homozygous dominant (RR)?",
    parent1: "RR", parent2: "Rr",
    p1Label: "Red flowers (homozygous)", p2Label: "Red flowers (heterozygous)",
    correctAnswer: "50%",
    options: ["25%", "50%", "75%", "100%"],
    topAlleles: ["R", "R"], leftAlleles: ["R", "r"],
    cellValues: ["RR", "RR", "Rr", "Rr"]
  },
  {
    id: 25,
    question: "What percentage of offspring will have red flowers?",
    parent1: "RR", parent2: "Rr",
    p1Label: "Red flowers (homozygous)", p2Label: "Red flowers (heterozygous)",
    correctAnswer: "100%",
    options: ["50%", "75%", "90%", "100%"],
    topAlleles: ["R", "R"], leftAlleles: ["R", "r"],
    cellValues: ["RR", "RR", "Rr", "Rr"]
  },
  // Yy x Yy (Seeds)
  {
    id: 26,
    question: "What percentage of offspring will have green seeds (recessive, yy)?",
    parent1: "Yy", parent2: "Yy",
    p1Label: "Yellow seeds (heterozygous)", p2Label: "Yellow seeds (heterozygous)",
    correctAnswer: "25%",
    options: ["25%", "50%", "75%", "0%"],
    topAlleles: ["Y", "y"], leftAlleles: ["Y", "y"],
    cellValues: ["YY", "Yy", "Yy", "yy"]
  },
  {
    id: 27,
    question: "What percentage of offspring will have yellow seeds?",
    parent1: "Yy", parent2: "Yy",
    p1Label: "Yellow seeds (heterozygous)", p2Label: "Yellow seeds (heterozygous)",
    correctAnswer: "75%",
    options: ["25%", "50%", "75%", "100%"],
    topAlleles: ["Y", "y"], leftAlleles: ["Y", "y"],
    cellValues: ["YY", "Yy", "Yy", "yy"]
  },
  // Yy x yy (Seeds)
  {
    id: 28,
    question: "What is the expected genotype ratio of Yy : yy?",
    parent1: "Yy", parent2: "yy",
    p1Label: "Yellow seeds (heterozygous)", p2Label: "Green seeds (homozygous recessive)",
    correctAnswer: "1:1",
    options: ["1:1", "3:1", "1:2:1", "2:1"],
    topAlleles: ["Y", "y"], leftAlleles: ["y", "y"],
    cellValues: ["Yy", "yy", "Yy", "yy"]
  },
  {
    id: 29,
    question: "What is the probability of having homozygous recessive green seeds?",
    parent1: "Yy", parent2: "yy",
    p1Label: "Yellow seeds (heterozygous)", p2Label: "Green seeds (homozygous recessive)",
    correctAnswer: "50%",
    options: ["25%", "50%", "75%", "100%"],
    topAlleles: ["Y", "y"], leftAlleles: ["y", "y"],
    cellValues: ["Yy", "yy", "Yy", "yy"]
  },
  // YY x Yy (Seeds)
  {
    id: 30,
    question: "What percentage of offspring will have green seeds?",
    parent1: "YY", parent2: "Yy",
    p1Label: "Yellow seeds (homozygous)", p2Label: "Yellow seeds (heterozygous)",
    correctAnswer: "0%",
    options: ["0%", "25%", "50%", "75%"],
    topAlleles: ["Y", "Y"], leftAlleles: ["Y", "y"],
    cellValues: ["YY", "YY", "Yy", "Yy"]
  },
  // Terminology
  {
    id: 31,
    question: "What term describes having two identical alleles for a gene (e.g., BB or bb)?",
    parent1: "BB", parent2: "bb",
    p1Label: "Homozygous", p2Label: "Homozygous",
    correctAnswer: "Homozygous",
    options: ["Homozygous", "Heterozygous", "Dominant", "Recessive"],
    topAlleles: ["B", "B"], leftAlleles: ["b", "b"],
    cellValues: ["Bb", "Bb", "Bb", "Bb"]
  },
  {
    id: 32,
    question: "What term describes having two different alleles for a gene (e.g., Bb)?",
    parent1: "Bb", parent2: "Bb",
    p1Label: "Heterozygous", p2Label: "Heterozygous",
    correctAnswer: "Heterozygous",
    options: ["Homozygous", "Heterozygous", "Genotype", "Phenotype"],
    topAlleles: ["B", "b"], leftAlleles: ["B", "b"],
    cellValues: ["BB", "Bb", "Bb", "bb"]
  },
  {
    id: 33,
    question: "What is the term for the observable physical expression of a trait?",
    parent1: "BB", parent2: "bb",
    p1Label: "Brown eyes", p2Label: "Blue eyes",
    correctAnswer: "Phenotype",
    options: ["Genotype", "Phenotype", "Allele", "Pedigree"],
    topAlleles: ["B", "B"], leftAlleles: ["b", "b"],
    cellValues: ["Bb", "Bb", "Bb", "Bb"]
  },
  {
    id: 34,
    question: "What is the term for the genetic makeup of an organism (the specific alleles)?",
    parent1: "BB", parent2: "bb",
    p1Label: "Genotype", p2Label: "Genotype",
    correctAnswer: "Genotype",
    options: ["Genotype", "Phenotype", "Locus", "Chromosome"],
    topAlleles: ["B", "B"], leftAlleles: ["b", "b"],
    cellValues: ["Bb", "Bb", "Bb", "Bb"]
  },
  {
    id: 35,
    question: "An allele that masks the expression of another allele is called...",
    parent1: "BB", parent2: "bb",
    p1Label: "Dominant", p2Label: "Recessive",
    correctAnswer: "Dominant",
    options: ["Dominant", "Recessive", "Codominant", "Heterozygous"],
    topAlleles: ["B", "B"], leftAlleles: ["b", "b"],
    cellValues: ["Bb", "Bb", "Bb", "Bb"]
  },
  // Extra genetics combinations
  {
    id: 36,
    question: "If parent 1 is heterozygous (Bb) and parent 2 is heterozygous (Bb), how many cell genotypes will show the dominant phenotype?",
    parent1: "Bb", parent2: "Bb",
    p1Label: "Heterozygous", p2Label: "Heterozygous",
    correctAnswer: "3",
    options: ["1", "2", "3", "4"],
    topAlleles: ["B", "b"], leftAlleles: ["B", "b"],
    cellValues: ["BB", "Bb", "Bb", "bb"]
  },
  {
    id: 37,
    question: "If Mother is Bb and Father is bb, what genotype represents the blue-eyed offspring?",
    parent1: "Bb", parent2: "bb",
    p1Label: "Heterozygous", p2Label: "Homozygous recessive",
    correctAnswer: "bb",
    options: ["BB", "Bb", "bb", "B"],
    topAlleles: ["B", "b"], leftAlleles: ["b", "b"],
    cellValues: ["Bb", "bb", "Bb", "bb"]
  },
  {
    id: 38,
    question: "Crossing a purebred dominant tall (TT) and a purebred recessive short (tt) results in what percentage of tall offspring?",
    parent1: "TT", parent2: "tt",
    p1Label: "Purebred Tall", p2Label: "Purebred Short",
    correctAnswer: "100%",
    options: ["0%", "50%", "75%", "100%"],
    topAlleles: ["T", "T"], leftAlleles: ["t", "t"],
    cellValues: ["Tt", "Tt", "Tt", "Tt"]
  },
  {
    id: 39,
    question: "If both parents are homozygous recessive (tt x tt), what percentage of offspring will be tall?",
    parent1: "tt", parent2: "tt",
    p1Label: "Short", p2Label: "Short",
    correctAnswer: "0%",
    options: ["0%", "25%", "50%", "100%"],
    topAlleles: ["t", "t"], leftAlleles: ["t", "t"],
    cellValues: ["tt", "tt", "tt", "tt"]
  },
  {
    id: 40,
    question: "Which of the following represents a heterozygous genotype?",
    parent1: "Bb", parent2: "bb",
    p1Label: "Heterozygous", p2Label: "Homozygous",
    correctAnswer: "Bb",
    options: ["BB", "bb", "Bb", "B"],
    topAlleles: ["B", "b"], leftAlleles: ["b", "b"],
    cellValues: ["Bb", "bb", "Bb", "bb"]
  }
];

const ROUNDS_COUNT = 10;
const TIMER_LIMIT = 15;

export function GeneGenius({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<"idle" | "instructions" | "playing" | "answered" | "finished">("idle");
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(1);
  const [questions, setQuestions] = React.useState<GeneticsQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = React.useState(0);
  const [shuffledOptions, setShuffledOptions] = React.useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const [timeLeft, setTimeLeft] = React.useState(TIMER_LIMIT);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuth();
  const firestore = useFirestore();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const handleStartGame = () => {
    const shuffledPool = shuffleArray([...QUESTION_POOL]);
    const selected = shuffledPool.slice(0, ROUNDS_COUNT);
    setQuestions(selected);
    setScore(0);
    setRound(1);
    setCurrentQuestionIdx(0);
    setupQuestion(selected[0]);
    setGameState("playing");
  };

  const setupQuestion = (question: GeneticsQuestion) => {
    setShuffledOptions(shuffleArray([...question.options]));
    setSelectedAnswer(null);
    setTimeLeft(TIMER_LIMIT);
  };

  const handleAnswer = (ans: string) => {
    if (gameState !== "playing") return;
    setSelectedAnswer(ans);
    const currentQ = questions[currentQuestionIdx];
    const correct = ans === currentQ.correctAnswer;
    if (correct) {
      setScore((s) => s + 10);
    }
    setGameState("answered");

    setTimeout(() => {
      if (round < ROUNDS_COUNT) {
        setRound((r) => r + 1);
        const nextIdx = currentQuestionIdx + 1;
        setCurrentQuestionIdx(nextIdx);
        setupQuestion(questions[nextIdx]);
        setGameState("playing");
      } else {
        setGameState("finished");
        if (firestore && game) {
          logAnalyticsEvent(firestore, user?.uid || "guest", {
            type: "game_played",
            details: { slug: game.slug, title: game.title, score: score + (correct ? 10 : 0) },
          });
        }
      }
    }, 2000);
  };

  React.useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (gameState === "playing" && timeLeft === 0) {
      handleAnswer("TIMEOUT");
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, timeLeft]);

  if (!game) return null;

  const currentQ = questions[currentQuestionIdx];

  return (
    <Card
      className={cn(
        "w-full transition-all duration-500 flex flex-col bg-slate-950 text-slate-50 border-emerald-500/20",
        isFullscreen
          ? "min-h-screen rounded-none border-none max-w-none justify-center p-8"
          : "max-w-4xl mx-auto shadow-2xl shadow-emerald-500/10 border"
      )}
    >
      <CardHeader className="text-center relative border-b border-emerald-950 pb-6">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 h-auto p-2 gap-1 text-slate-400 hover:text-slate-100 z-[100]"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? "Exit" : "Full"}</span>
        </Button>
        <div className="flex items-center justify-center gap-3 mb-2">
          <Dna className="w-10 h-10 text-emerald-400 animate-pulse" />
        </div>
        <CardTitle
          className={cn(
            "font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400",
            isFullscreen ? "text-5xl" : "text-3xl"
          )}
        >
          {game.title}
        </CardTitle>
        {gameState !== "idle" && gameState !== "instructions" && (
          <div className="flex justify-center gap-3 mt-4">
            <Badge variant="secondary" className="bg-emerald-900/50 text-emerald-200 border-emerald-800">
              Round {round}/{ROUNDS_COUNT}
            </Badge>
            <Badge variant="outline" className="border-teal-800 text-teal-300">
              Score: {score}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className={cn("flex flex-col items-center justify-center p-6", isFullscreen ? "min-h-[65vh]" : "min-h-[450px]")}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-6 text-center max-w-lg">
            <p className={cn("text-slate-300", isFullscreen ? "text-2xl" : "text-base")}>
              Step into the biolab. Cross parental alleles, complete Punnett squares, and analyze the resulting phenotypes.
            </p>
            <Button
              onClick={() => setGameState("instructions")}
              size={isFullscreen ? "lg" : "default"}
              className={cn(
                "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-90 text-white font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-105",
                isFullscreen && "h-20 px-16 text-2xl rounded-2xl"
              )}
            >
              Access Biolab
            </Button>
          </div>
        )}

        {gameState === "instructions" && (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-6 text-center bg-emerald-950/20 rounded-3xl border border-emerald-500/10 shadow-inner w-full",
              isFullscreen ? "p-16 max-w-4xl" : "p-8 max-w-2xl"
            )}
          >
            <h3 className={cn("font-black uppercase tracking-widest text-emerald-400 mb-2", isFullscreen ? "text-4xl" : "text-2xl")}>
              Biolab Instructions
            </h3>
            <div className={cn("text-left space-y-4 text-slate-300 font-medium", isFullscreen ? "text-xl" : "text-sm md:text-base")}>
              <p>🧬 **Cross Alleles**: Examine the parent genotypes listed at the top and left of the grid.</p>
              <p>📊 **Punnett Grid**: Solve the intersections to determine offspring genotypes (BB, Bb, bb).</p>
              <p>🔬 **Analyze Ratios**: Calculate genotype ratios or phenotype probabilities requested by the prompt.</p>
              <p>⌛ **Time Lock**: Submit answers before the biohazard timer expires.</p>
            </div>
            <Button
              onClick={handleStartGame}
              size="lg"
              className={cn(
                "mt-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-black uppercase tracking-widest",
                isFullscreen && "h-20 px-16 text-2xl rounded-2xl"
              )}
            >
              Start Simulation
            </Button>
          </div>
        )}

        {(gameState === "playing" || gameState === "answered") && currentQ && (
          <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-8 lg:gap-12 mt-4">
            
            {/* Interactive Punnett Square Visualizer */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Punnett Matrix
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-3 rounded-2xl border-2 border-emerald-500/30 bg-slate-900/60 shadow-inner w-60 h-60 md:w-72 md:h-72">
                {/* Empty cell */}
                <div className="flex items-center justify-center font-bold text-slate-500 text-sm">
                  M \ F
                </div>
                {/* Top Alleles */}
                <div className="flex items-center justify-center font-black text-emerald-400 text-xl border border-emerald-500/10 rounded-lg bg-emerald-950/20">
                  {currentQ.topAlleles[0]}
                </div>
                <div className="flex items-center justify-center font-black text-emerald-400 text-xl border border-emerald-500/10 rounded-lg bg-emerald-950/20">
                  {currentQ.topAlleles[1]}
                </div>

                {/* Left Allele 1 & cells */}
                <div className="flex items-center justify-center font-black text-teal-400 text-xl border border-teal-500/10 rounded-lg bg-teal-950/20">
                  {currentQ.leftAlleles[0]}
                </div>
                <div className="flex flex-col items-center justify-center font-black text-slate-200 text-lg border-2 border-slate-800 rounded-xl bg-slate-950/50">
                  {currentQ.cellValues[0]}
                </div>
                <div className="flex flex-col items-center justify-center font-black text-slate-200 text-lg border-2 border-slate-800 rounded-xl bg-slate-950/50">
                  {currentQ.cellValues[1]}
                </div>

                {/* Left Allele 2 & cells */}
                <div className="flex items-center justify-center font-black text-teal-400 text-xl border border-teal-500/10 rounded-lg bg-teal-950/20">
                  {currentQ.leftAlleles[1]}
                </div>
                <div className="flex flex-col items-center justify-center font-black text-slate-200 text-lg border-2 border-slate-800 rounded-xl bg-slate-950/50">
                  {currentQ.cellValues[2]}
                </div>
                <div className="flex flex-col items-center justify-center font-black text-slate-200 text-lg border-2 border-slate-800 rounded-xl bg-slate-950/50">
                  {currentQ.cellValues[3]}
                </div>
              </div>
              <div className="flex gap-4 mt-2 text-[10px] md:text-xs font-bold text-slate-400">
                <div>Mother: <span className="text-emerald-400 font-extrabold">{currentQ.parent1}</span> ({currentQ.p1Label})</div>
                <div>Father: <span className="text-teal-400 font-extrabold">{currentQ.parent2}</span> ({currentQ.p2Label})</div>
              </div>
            </div>

            {/* Question / Options panel */}
            <div className="flex-1 w-full space-y-6 flex flex-col">
              {/* Timer Progress */}
              <div className="space-y-1">
                <div className="flex justify-between font-black uppercase text-xs tracking-widest text-slate-400">
                  <span>Biogenetic Timer</span>
                  <span className={cn(timeLeft <= 5 && "text-rose-500 animate-pulse")}>{timeLeft}s</span>
                </div>
                <Progress value={(timeLeft / TIMER_LIMIT) * 100} className="h-2 bg-slate-900 border border-slate-800" />
              </div>

              {/* Question Text */}
              <div className={cn("font-bold text-slate-100", isFullscreen ? "text-3xl" : "text-xl md:text-2xl")}>
                {currentQ.question}
              </div>

              {/* Answers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shuffledOptions.map((opt) => {
                  const isCorrectAnswer = opt === currentQ.correctAnswer;
                  const isSelected = opt === selectedAnswer;

                  return (
                    <Button
                      key={opt}
                      variant="outline"
                      onClick={() => handleAnswer(opt)}
                      disabled={gameState === "answered"}
                      className={cn(
                        "h-16 text-lg font-black border-2 transition-all rounded-xl hover:scale-[1.02] shadow-md",
                        gameState === "playing"
                          ? "border-slate-800 bg-slate-900 hover:bg-emerald-950/30 hover:border-emerald-500 hover:text-emerald-200"
                          : isCorrectAnswer
                          ? "bg-emerald-950/60 border-emerald-500 text-emerald-200 scale-105"
                          : isSelected
                          ? "bg-rose-950/60 border-rose-500 text-rose-200"
                          : "border-slate-800 bg-slate-900/30 opacity-60"
                      )}
                    >
                      <span className="flex items-center justify-between w-full">
                        <span>{opt}</span>
                        {gameState === "answered" && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />}
                        {gameState === "answered" && isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-rose-400 shrink-0 ml-2" />}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {gameState === "finished" && (
          <div className="text-center flex flex-col items-center gap-8 animate-in zoom-in duration-500">
            <Trophy className="w-28 h-28 text-yellow-400 animate-bounce" />
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-emerald-400 to-teal-400">
              Simulation Finished
            </h2>
            <div className="p-8 bg-emerald-950/20 rounded-3xl border-2 border-emerald-500/20 max-w-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Final Gene score</p>
              <p className="text-6xl font-black text-emerald-400">{score}</p>
            </div>
            <Button
              onClick={handleStartGame}
              size="lg"
              className="h-16 px-12 text-lg font-black rounded-2xl uppercase shadow-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white"
            >
              <Repeat className="mr-3 h-5 w-5" /> Reboot Lab
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t border-emerald-950 pt-6">
        <Button variant="outline" className="border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-slate-100" asChild>
          <Link href="/games">Shutdown Biolab</Link>
        </Button>
        {gameState !== "idle" && gameState !== "instructions" && (
          <p className="font-black text-emerald-400 uppercase tracking-widest">
            Score: {score}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
