"use client";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Maximize, Minimize, Trophy, Sparkles, Repeat, Gamepad2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";
import { shuffleArray } from "@/lib/shuffle";

interface LiteraryQuestion {
  id: number;
  quote: string;
  deviceType: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

const QUESTION_POOL: LiteraryQuestion[] = [
  { id: 1, quote: "Her smile was as bright as the morning sun.", deviceType: "Simile", correctAnswer: "Simile", options: ["Simile", "Metaphor", "Personification", "Hyperbole"], explanation: "Uses 'as' to compare the smile directly to the morning sun." },
  { id: 2, quote: "The classroom was a zoo during the indoor recess.", deviceType: "Metaphor", correctAnswer: "Metaphor", options: ["Simile", "Metaphor", "Onomatopoeia", "Allusion"], explanation: "Directly equates the classroom to a zoo without using 'like' or 'as'." },
  { id: 3, quote: "The angry wind howled through the crevice in the window.", deviceType: "Personification", correctAnswer: "Personification", options: ["Metaphor", "Personification", "Alliteration", "Oxymoron"], explanation: "Attributes human emotions ('angry') and actions ('howled') to the wind." },
  { id: 4, quote: "I've told you a million times to clean your room!", deviceType: "Hyperbole", correctAnswer: "Hyperbole", options: ["Simile", "Hyperbole", "Allusion", "Onomatopoeia"], explanation: "An extreme exaggeration to make an emphatic statement." },
  { id: 5, quote: "The dry leaves crunched and snapped under our boots.", deviceType: "Onomatopoeia", correctAnswer: "Onomatopoeia", options: ["Onomatopoeia", "Alliteration", "Oxymoron", "Metaphor"], explanation: "Uses words ('crunched', 'snapped') that mimic the sounds they describe." },
  { id: 6, quote: "Sally sells seashells by the seashore.", deviceType: "Alliteration", correctAnswer: "Alliteration", options: ["Simile", "Alliteration", "Hyperbole", "Allusion"], explanation: "Repeats the starting 's' consonant sound in close succession." },
  { id: 7, quote: "The silence in the room was deafening.", deviceType: "Oxymoron", correctAnswer: "Oxymoron", options: ["Personification", "Oxymoron", "Onomatopoeia", "Metaphor"], explanation: "Combines two contradictory terms ('silence' and 'deafening') next to each other." },
  { id: 8, quote: "He was a real Romeo when trying to impress her.", deviceType: "Allusion", correctAnswer: "Allusion", options: ["Metaphor", "Allusion", "Alliteration", "Hyperbole"], explanation: "Refers to Romeo, a famous literary character from Shakespeare's play." },
  { id: 9, quote: "Her heart of stone could not be softened by his apologies.", deviceType: "Metaphor", correctAnswer: "Metaphor", options: ["Simile", "Metaphor", "Personification", "Alliteration"], explanation: "Compares her heart directly to stone to express coldness." },
  { id: 10, quote: "The camera loves her; she is so photogenic.", deviceType: "Personification", correctAnswer: "Personification", options: ["Metaphor", "Personification", "Allusion", "Onomatopoeia"], explanation: "Gives the camera the human capability of 'loving'." },
  { id: 11, quote: "He runs like a cheetah.", deviceType: "Simile", correctAnswer: "Simile", options: ["Simile", "Metaphor", "Hyperbole", "Oxymoron"], explanation: "Uses 'like' to compare his running speed to a cheetah." },
  { id: 12, quote: "This bag weighs a ton.", deviceType: "Hyperbole", correctAnswer: "Hyperbole", options: ["Simile", "Hyperbole", "Allusion", "Onomatopoeia"], explanation: "An exaggeration representing extreme weight." },
  { id: 13, quote: "The tea kettle let out a loud hiss as it boiled.", deviceType: "Onomatopoeia", correctAnswer: "Onomatopoeia", options: ["Onomatopoeia", "Alliteration", "Oxymoron", "Metaphor"], explanation: "The word 'hiss' mimics the physical steam escaping sound." },
  { id: 14, quote: "Peter Piper picked a peck of pickled peppers.", deviceType: "Alliteration", correctAnswer: "Alliteration", options: ["Alliteration", "Personification", "Simile", "Oxymoron"], explanation: "Repeats the initial 'p' sound across several words." },
  { id: 15, quote: "It was an open secret that they were planning a surprise party.", deviceType: "Oxymoron", correctAnswer: "Oxymoron", options: ["Oxymoron", "Metaphor", "Hyperbole", "Allusion"], explanation: "Combines the opposite concepts 'open' and 'secret'." },
  { id: 16, quote: "She had a smile that could rival Mona Lisa.", deviceType: "Allusion", correctAnswer: "Allusion", options: ["Allusion", "Simile", "Personification", "Alliteration"], explanation: "References the famous portrait painting by Leonardo da Vinci." },
  { id: 17, quote: "The stars winked at us from the dark sky.", deviceType: "Personification", correctAnswer: "Personification", options: ["Personification", "Metaphor", "Onomatopoeia", "Allusion"], explanation: "Gives stars the human capability of winking." },
  { id: 18, quote: "My brother is a night owl.", deviceType: "Metaphor", correctAnswer: "Metaphor", options: ["Simile", "Metaphor", "Hyperbole", "Oxymoron"], explanation: "Equates his brother directly to an owl to describe sleeping habits." },
  { id: 19, quote: "The ice cream was calling my name from the freezer.", deviceType: "Personification", correctAnswer: "Personification", options: ["Personification", "Allusion", "Alliteration", "Onomatopoeia"], explanation: "Attributes speaking and calling names to the ice cream." },
  { id: 20, quote: "If I can't get the new phone, I will literally die.", deviceType: "Hyperbole", correctAnswer: "Hyperbole", options: ["Hyperbole", "Simile", "Metaphor", "Oxymoron"], explanation: "Exaggerates extreme longing rather than actual physical danger." },
  { id: 21, quote: "The engine roared to life with a mechanical growl.", deviceType: "Onomatopoeia", correctAnswer: "Onomatopoeia", options: ["Onomatopoeia", "Personification", "Allusion", "Alliteration"], explanation: "The words 'roared' and 'growl' mimic the mechanical motor sound." },
  { id: 22, quote: "Wide-eyed and wondering, we walked through the woods.", deviceType: "Alliteration", correctAnswer: "Alliteration", options: ["Alliteration", "Simile", "Metaphor", "Oxymoron"], explanation: "Repeats the consonant sound 'w' repeatedly." },
  { id: 23, quote: "They ordered some jumbo shrimp at the seafood restaurant.", deviceType: "Oxymoron", correctAnswer: "Oxymoron", options: ["Oxymoron", "Metaphor", "Onomatopoeia", "Allusion"], explanation: "Juxtaposes 'jumbo' (huge) with 'shrimp' (tiny)." },
  { id: 24, quote: "He felt like Hercules lifting those heavy boxes.", deviceType: "Allusion", correctAnswer: "Allusion", options: ["Allusion", "Simile", "Personification", "Alliteration"], explanation: "Refers to Hercules from Greek mythology to emphasize strength." },
  { id: 25, quote: "She stood as tall as a redwood tree.", deviceType: "Simile", correctAnswer: "Simile", options: ["Simile", "Metaphor", "Hyperbole", "Oxymoron"], explanation: "Uses 'as' to compare her height to a redwood tree." },
  { id: 26, quote: "The computer mouse clicked repeatedly as she typed.", deviceType: "Onomatopoeia", correctAnswer: "Onomatopoeia", options: ["Onomatopoeia", "Alliteration", "Allusion", "Personification"], explanation: "The word 'clicked' replicates the physical cursor tap sound." },
  { id: 27, quote: "The streets were a furnace in the middle of July.", deviceType: "Metaphor", correctAnswer: "Metaphor", options: ["Simile", "Metaphor", "Personification", "Alliteration"], explanation: "Equates the streets directly to a furnace to show heat." },
  { id: 28, quote: "Our teacher is older than the hills.", deviceType: "Hyperbole", correctAnswer: "Hyperbole", options: ["Hyperbole", "Simile", "Allusion", "Oxymoron"], explanation: "An exaggeration stating extreme age." },
  { id: 29, quote: "Tiny timid turtles trundled toward the tide.", deviceType: "Alliteration", correctAnswer: "Alliteration", options: ["Alliteration", "Metaphor", "Onomatopoeia", "Personification"], explanation: "Repeats the consonant sound 't' at the start of words." },
  { id: 30, quote: "The magician performed a series of original copies.", deviceType: "Oxymoron", correctAnswer: "Oxymoron", options: ["Oxymoron", "Simile", "Personification", "Allusion"], explanation: "Brings together 'original' (first/unique) and 'copies' (duplicates)." },
  { id: 31, quote: "The fire swallowed the dry logs in seconds.", deviceType: "Personification", correctAnswer: "Personification", options: ["Personification", "Metaphor", "Hyperbole", "Onomatopoeia"], explanation: "Attributes the human action of 'swallowing' to the fire." },
  { id: 32, quote: "Her hair was silk, flowing softly over her shoulders.", deviceType: "Metaphor", correctAnswer: "Metaphor", options: ["Simile", "Metaphor", "Alliteration", "Allusion"], explanation: "Compares her hair directly to silk without comparison words." },
  { id: 33, quote: "The clock ticked away the slow minutes.", deviceType: "Onomatopoeia", correctAnswer: "Onomatopoeia", options: ["Onomatopoeia", "Personification", "Allusion", "Oxymoron"], explanation: "The word 'ticked' replicates the physical gear click." },
  { id: 34, quote: "My dad is a human calculator.", deviceType: "Metaphor", correctAnswer: "Metaphor", options: ["Simile", "Metaphor", "Hyperbole", "Personification"], explanation: "Directly equates dad to a calculator to convey math skills." },
  { id: 35, quote: "The snowflakes danced merrily on the frozen pavement.", deviceType: "Personification", correctAnswer: "Personification", options: ["Personification", "Simile", "Oxymoron", "Allusion"], explanation: "Attributes the human action 'danced' to snowflakes." },
  { id: 36, quote: "I have a million things to do before we leave.", deviceType: "Hyperbole", correctAnswer: "Hyperbole", options: ["Hyperbole", "Metaphor", "Onomatopoeia", "Alliteration"], explanation: "Exaggerates the count of tasks to show busyness." },
  { id: 37, quote: "We heard the gentle splash of the canoe paddle.", deviceType: "Onomatopoeia", correctAnswer: "Onomatopoeia", options: ["Onomatopoeia", "Alliteration", "Oxymoron", "Allusion"], explanation: "The word 'splash' replicates the liquid displacement sound." },
  { id: 38, quote: "Careful cats constantly crawl cautiously.", deviceType: "Alliteration", correctAnswer: "Alliteration", options: ["Alliteration", "Simile", "Metaphor", "Personification"], explanation: "Repeats the consonant sound 'c' across multiple words." },
  { id: 39, quote: "They found themselves in a state of controlled chaos.", deviceType: "Oxymoron", correctAnswer: "Oxymoron", options: ["Oxymoron", "Hyperbole", "Onomatopoeia", "Allusion"], explanation: "Links the contradictory terms 'controlled' and 'chaos'." },
  { id: 40, quote: "Don't act like a Scrooge; share your sweets!", deviceType: "Allusion", correctAnswer: "Allusion", options: ["Allusion", "Metaphor", "Alliteration", "Onomatopoeia"], explanation: "References the Ebenezer Scrooge character from A Christmas Carol." },
  { id: 41, quote: "He slept like a log after the long hike.", deviceType: "Simile", correctAnswer: "Simile", options: ["Simile", "Metaphor", "Personification", "Oxymoron"], explanation: "Uses 'like' to compare his deep sleep to a solid log." },
  { id: 42, quote: "His new car is a speed demon.", deviceType: "Metaphor", correctAnswer: "Metaphor", options: ["Simile", "Metaphor", "Allusion", "Alliteration"], explanation: "Directly compares the car to a speed demon." },
  { id: 43, quote: "The old door groaned as I slowly pushed it open.", deviceType: "Personification", correctAnswer: "Personification", options: ["Personification", "Metaphor", "Oxymoron", "Onomatopoeia"], explanation: "Attributes the human sound 'groaned' to the wooden door." },
  { id: 44, quote: "I'm so hungry I could eat a horse.", deviceType: "Hyperbole", correctAnswer: "Hyperbole", options: ["Hyperbole", "Simile", "Allusion", "Onomatopoeia"], explanation: "Exaggerates hunger level for emphasis." },
  { id: 45, quote: "The bee buzzed near the blooming flowers.", deviceType: "Onomatopoeia", correctAnswer: "Onomatopoeia", options: ["Onomatopoeia", "Alliteration", "Metaphor", "Personification"], explanation: "The word 'buzzed' replicates the bee's wing vibrations." }
];

const ROUNDS_COUNT = 10;
const TIMER_LIMIT = 15;

export function LiteraryDeviceLegend({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<"idle" | "instructions" | "playing" | "answered" | "finished">("idle");
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(1);
  const [questions, setQuestions] = React.useState<LiteraryQuestion[]>([]);
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

  const setupQuestion = (question: LiteraryQuestion) => {
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
    }, 3000); // Give 3s to read the explanation
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
        "w-full transition-all duration-500 flex flex-col justify-between overflow-y-auto overflow-x-hidden bg-slate-950 text-slate-50 border-purple-500/20",
        isFullscreen
          ? "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none p-2 sm:p-6"
          : "flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full rounded-2xl md:rounded-3xl shadow-2xl shadow-purple-500/10 border"
      )}
    >
      <CardHeader className="text-center relative border-b border-purple-950 p-3 sm:p-6 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 sm:top-4 sm:right-4 h-8 px-2 gap-1 text-slate-400 hover:text-slate-100 z-20"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? "Exit" : "Full"}</span>
        </Button>
        <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
          <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 animate-bounce" />
        </div>
        <CardTitle
          className="font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 text-xl sm:text-3xl md:text-5xl"
        >
          {game.title}
        </CardTitle>
        {gameState !== "idle" && gameState !== "instructions" && (
          <div className="flex justify-center gap-2 mt-2 sm:mt-4 flex-wrap">
            <Badge variant="secondary" className="bg-purple-900/50 text-purple-200 border-purple-800 text-xs px-2.5 py-0.5">
              Round {round}/{ROUNDS_COUNT}
            </Badge>
            <Badge variant="outline" className="border-fuchsia-800 text-fuchsia-300 text-xs px-2.5 py-0.5">
              Score: {score}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-4xl mx-auto overflow-y-auto">
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-3 sm:gap-6 text-center max-w-lg my-auto py-2">
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
              Duel with sentences, parse metaphors, and identify similes, hyperboles, and personification in an arcade linguistic showdown.
            </p>
            <Button
              onClick={() => setGameState("instructions")}
              className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 hover:opacity-90 text-white font-black uppercase tracking-wider shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-105 h-11 sm:h-14 px-8 sm:px-14 text-sm sm:text-lg rounded-xl"
            >
              Insert Coin
            </Button>
          </div>
        )}

        {gameState === "instructions" && (
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-5 text-center bg-purple-950/20 rounded-2xl sm:rounded-3xl border border-purple-500/10 shadow-inner w-full p-4 sm:p-8 max-w-xl my-auto">
            <h3 className="font-black uppercase tracking-wider text-purple-400 text-lg sm:text-2xl">
              Arcade Instructions
            </h3>
            <div className="text-left space-y-2.5 text-slate-300 text-xs sm:text-sm bg-black/40 p-3 sm:p-4 rounded-xl border border-purple-900/30 w-full">
              <p>📖 **Read the Quote**: Analyze the target sentence or passage highlighted on the display screen.</p>
              <p>🎯 **Identify Devices**: Recognize Similes, Metaphors, Personifications, Hyperboles, or Oxymorons.</p>
              <p>💡 **Learn Explanations**: Review the device mechanics and details shown after selecting your answer.</p>
              <p>⏱️ **Speed Match**: Input your answer before the digital timer counts down to zero.</p>
            </div>
            <Button
              onClick={handleStartGame}
              className="w-full h-11 sm:h-14 text-xs sm:text-base bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white font-black uppercase tracking-wider rounded-xl"
            >
              Start Duel
            </Button>
          </div>
        )}

        {(gameState === "playing" || gameState === "answered") && currentQ && (
          <div className="w-full max-w-3xl space-y-3 sm:space-y-6 flex flex-col my-auto py-2">
            
            {/* Timer Progress */}
            <div className="space-y-1">
              <div className="flex justify-between font-black uppercase text-[10px] sm:text-xs tracking-wider text-slate-400">
                <span>Arcade CPU Sync</span>
                <span className={cn(timeLeft <= 5 && "text-rose-500 animate-pulse")}>{timeLeft}s</span>
              </div>
              <Progress value={(timeLeft / TIMER_LIMIT) * 100} className="h-2 bg-slate-900 border border-slate-800" />
            </div>

            {/* Target Quote Display Box */}
            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-purple-500/30 bg-slate-900/60 shadow-inner flex flex-col items-center justify-center min-h-[90px] sm:min-h-[130px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
              <blockquote className="font-extrabold italic text-center text-slate-100 text-base sm:text-2xl leading-relaxed break-words">
                &ldquo;{currentQ.quote}&rdquo;
              </blockquote>
            </div>

            {/* Explanations Display */}
            {gameState === "answered" && (
              <div className="p-3 sm:p-4 rounded-xl border border-purple-500/20 bg-purple-950/30 text-purple-200 text-xs sm:text-sm font-semibold animate-in fade-in duration-200">
                <span className="font-black text-purple-400 uppercase tracking-wider mr-1.5">Analysis:</span>
                {currentQ.explanation}
              </div>
            )}

            {/* Answers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
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
                      "h-12 sm:h-16 text-sm sm:text-lg font-black border-2 transition-all rounded-xl hover:scale-[1.01] shadow-md break-words",
                      gameState === "playing"
                        ? "border-slate-800 bg-slate-900 hover:bg-purple-950/30 hover:border-purple-500 hover:text-purple-200"
                        : isCorrectAnswer
                        ? "bg-emerald-950/60 border-emerald-500 text-emerald-200 scale-102"
                        : isSelected
                        ? "bg-rose-950/60 border-rose-500 text-rose-200"
                        : "border-slate-800 bg-slate-900/30 opacity-60"
                    )}
                  >
                    <span className="flex items-center justify-between w-full">
                      <span>{opt}</span>
                      {gameState === "answered" && isCorrectAnswer && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0 ml-2" />}
                      {gameState === "answered" && isSelected && !isCorrectAnswer && <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 shrink-0 ml-2" />}
                    </span>
                  </Button>
                );
              })}
            </div>

          </div>
        )}

        {gameState === "finished" && (
          <div className="text-center flex flex-col items-center gap-4 sm:gap-6 animate-in zoom-in duration-300 my-auto py-2">
            <Trophy className="w-16 h-16 sm:w-24 sm:h-24 text-yellow-400 animate-bounce" />
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-purple-400 to-pink-400">
              Duel Complete
            </h2>
            <div className="p-4 sm:p-8 bg-purple-950/20 rounded-2xl sm:rounded-3xl border-2 border-purple-500/20 max-w-xs w-full">
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Final Arcade Score</p>
              <p className="text-4xl sm:text-6xl font-black text-purple-400">{score}</p>
            </div>
            <Button
              onClick={handleStartGame}
              className="h-11 sm:h-14 px-8 sm:px-12 text-xs sm:text-base font-black rounded-xl uppercase shadow-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white"
            >
              <Repeat className="mr-2 h-4 w-4" /> Insert Coin
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2.5 p-3 sm:p-6 border-t border-purple-950 w-full shrink-0 max-w-4xl mx-auto">
        <Button variant="outline" className="w-full sm:w-auto h-11 sm:h-12 text-xs font-bold rounded-xl border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-slate-100" asChild>
          <Link href="/games">Leave Cabinet</Link>
        </Button>
        {gameState !== "idle" && gameState !== "instructions" && (
          <p className="font-black text-purple-400 uppercase tracking-wider text-xs sm:text-sm">
            Score: {score}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
