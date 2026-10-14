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
import {
  generateVocabExercise,
  type GenerateVocabExerciseOutput,
} from "@/ai/flows/generate-vocab-exercise";
import { Loader2, Sparkles, Check, Repeat, Trophy, Maximize, Minimize, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import type { SkillLevel } from "@/lib/types";
import Link from "next/link";

type GameState = "idle" | "loading" | "playing" | "finished" | "selecting_difficulty" | "instructions";
type WordDefinitionPair = GenerateVocabExerciseOutput["pairs"][0];

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const FALLBACK_VOCAB: Record<SkillLevel, WordDefinitionPair[]> = {
  beginner: [
    { word: "Ancient", definition: "Belonging to the very distant past; very old." },
    { word: "Brave", definition: "Ready to face danger or pain without fear." },
    { word: "Curious", definition: "Eager to know or learn something new." },
    { word: "Delight", definition: "A feeling of great pleasure or happiness." },
    { word: "Generous", definition: "Willing to give or share things freely." },
    { word: "Gigantic", definition: "Of extraordinary size; huge or immense." },
    { word: "Harmonious", definition: "Forming a pleasing or consistent whole." },
    { word: "Luminous", definition: "Giving off light; bright or glowing." },
    { word: "Ponder", definition: "To think about something carefully and deeply." },
    { word: "Swift", definition: "Happening quickly or moving at high speed." },
    { word: "Vanish", definition: "To disappear suddenly and completely." },
    { word: "Wisdom", definition: "The ability to make good judgments based on knowledge." }
  ],
  intermediate: [
    { word: "Ambiguous", definition: "Open to more than one interpretation; not clear." },
    { word: "Benevolent", definition: "Well-meaning, kind, and helpful towards others." },
    { word: "Candid", definition: "Truthful, direct, and completely honest." },
    { word: "Diligent", definition: "Showing steady and earnest care and effort." },
    { word: "Eloquent", definition: "Fluent and persuasive in speaking or writing." },
    { word: "Empathy", definition: "The ability to understand and share feelings of others." },
    { word: "Meticulous", definition: "Showing great attention to detail; very precise." },
    { word: "Nostalgia", definition: "A sentimental longing for the past or happy memories." },
    { word: "Pragmatic", definition: "Dealing with problems in a sensible and practical way." },
    { word: "Resilient", definition: "Able to recover quickly from difficulties or setbacks." },
    { word: "Serene", definition: "Calm, peaceful, and untroubled by stress." },
    { word: "Versatile", definition: "Able to adapt or be used for many different purposes." }
  ],
  advanced: [
    { word: "Alacrity", definition: "Brisk, eager, and cheerful readiness." },
    { word: "Cacophony", definition: "A harsh, discordant, and unpleasant mixture of sounds." },
    { word: "Ephemeral", definition: "Lasting for a very brief period of time; fleeting." },
    { word: "Equanimity", definition: "Mental calmness and composure, especially in a crisis." },
    { word: "Fastidious", definition: "Very attentive to accuracy, cleanliness, and detail." },
    { word: "Inscrutable", definition: "Impossible to understand, interpret, or unravel." },
    { word: "Magnanimous", definition: "Very generous, noble, or forgiving toward others." },
    { word: "Pernicious", definition: "Having a harmful, gradual effect in a subtle way." },
    { word: "Surreptitious", definition: "Kept secret, covert, or stealthy." },
    { word: "Tenacious", definition: "Holding firmly to a purpose; persistent and stubborn." },
    { word: "Ubiquitous", definition: "Present, appearing, or found everywhere simultaneously." },
    { word: "Voracious", definition: "Having an eager, insatiable appetite for food or learning." }
  ]
};

export function VocabVoyage({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [words, setWords] = React.useState<WordDefinitionPair[]>([]);
  const [definitions, setDefinitions] = React.useState<WordDefinitionPair[]>([]);
  const [selectedWord, setSelectedWord] = React.useState<WordDefinitionPair | null>(null);
  const [selectedDefinition, setSelectedDefinition] = React.useState<WordDefinitionPair | null>(null);
  const [correctMatches, setCorrectMatches] = React.useState<string[]>([]);
  const [incorrectMatches, setIncorrectMatches] = React.useState<string[]>([]);
  const [difficulty, setDifficulty] = React.useState<SkillLevel | null>(null);
  const [usedWords, setUsedWords] = React.useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFs);
    };

    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    document.addEventListener('mozfullscreenchange', handler);
    
    const handleCustomFs = (e: any) => {
      if (typeof e.detail?.isFullscreen === 'boolean') {
        setIsFullscreen(e.detail.isFullscreen);
      }
    };
    window.addEventListener('lingoland_fullscreen_change', handleCustomFs);

    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
      document.removeEventListener('mozfullscreenchange', handler);
      window.removeEventListener('lingoland_fullscreen_change', handleCustomFs);
    };
  }, []);

  const handleStartGame = async (level: SkillLevel) => {
    setDifficulty(level);
    setGameState("loading");
    setCorrectMatches([]);
    setIncorrectMatches([]);
    setSelectedWord(null);
    setSelectedDefinition(null);
    try {
      if (!game) return;
      const count = isFullscreen ? 10 : 8;
      let newPairs: WordDefinitionPair[] = [];

      try {
        const newExercise = await generateVocabExercise({
          difficulty: level,
          count: count,
          usedWords: usedWords,
        });
        if (newExercise && Array.isArray(newExercise.pairs) && newExercise.pairs.length > 0) {
          newPairs = newExercise.pairs;
        }
      } catch (genErr) {
        console.warn("AI generation unavailable, applying curated fallback pairs:", genErr);
      }

      if (!newPairs || newPairs.length === 0) {
        const pool = FALLBACK_VOCAB[level] || FALLBACK_VOCAB.beginner;
        const available = pool.filter(p => !usedWords.includes(p.word));
        const chosen = shuffleArray(available.length >= count ? available : pool).slice(0, count);
        newPairs = chosen;
      }

      const newWords = newPairs.map(p => p.word);
      setUsedWords(prev => [...prev, ...newWords]);
      setWords(shuffleArray(newPairs));
      setDefinitions(shuffleArray(newPairs));
      setGameState("playing");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent('lingoland_game_started_hijack'));
      }
    } catch (error) {
      console.error("Failed to generate exercise:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not start game. Please try again.",
      });
      setGameState("idle");
    }
  };
  
  React.useEffect(() => {
    if (selectedWord && selectedDefinition) {
      if (selectedWord.word === selectedDefinition.word) {
        setCorrectMatches((prev) => [...prev, selectedWord.word]);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent('lingoland_game_answered_hijack'));
        }
      } else {
        setIncorrectMatches((prev) => [...prev, selectedWord.word, selectedDefinition.word]);
        setTimeout(() => {
            setIncorrectMatches((prev) => prev.filter(w => w !== selectedWord.word && w !== selectedDefinition.word));
        }, 500);
      }
      setSelectedWord(null);
      setSelectedDefinition(null);
    }
  }, [selectedWord, selectedDefinition]);

  React.useEffect(() => {
    if (words.length > 0 && correctMatches.length === words.length) {
      setGameState("finished");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent('lingoland_game_completed_hijack'));
      }
    }
  }, [correctMatches, words]);

  const getButtonState = (item: WordDefinitionPair, type: 'word' | 'definition') => {
    if (correctMatches.includes(item.word)) return "correct";
    if (incorrectMatches.includes(item.word)) return "incorrect";
    if (type === 'word' && selectedWord?.word === item.word) return "selected";
    if (type === 'definition' && selectedDefinition?.word === item.word) return "selected";
    return "default";
  };

  if (!game) return null;
  const Icon = game.icon;

  const handlePlayAgain = () => {
    if (difficulty) {
        handleStartGame(difficulty);
    } else {
        setGameState("selecting_difficulty");
    }
  };

  return (
    <Card className={cn(
        "w-full flex-1 max-w-full flex flex-col justify-between overflow-hidden rounded-2xl md:rounded-3xl border border-border/20 shadow-xl bg-card/80 backdrop-blur-sm transition-all duration-300",
        isFullscreen 
          ? "fixed inset-0 z-50 h-[100dvh] max-h-[100dvh] min-h-0 rounded-none border-none max-w-none p-2 sm:p-4 bg-background" 
          : "h-full min-h-[calc(100dvh-4.5rem)]"
      )}>
      <CardHeader className={cn(
        "text-center relative shrink-0 transition-all duration-200 border-b border-border/10",
        gameState === "playing" ? "p-2.5 sm:p-4 pb-2" : "p-4 sm:p-6"
      )}>
        <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 flex items-center gap-1 sm:gap-2 z-[100]">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 sm:h-9 px-2 gap-1 text-muted-foreground hover:text-foreground text-xs"
            onClick={() => setGameState(gameState === 'instructions' ? 'idle' : 'instructions')}
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">How to Play</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 sm:h-9 p-1.5 sm:p-2 gap-1 text-muted-foreground hover:text-foreground"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase hidden sm:inline">{isFullscreen ? 'Exit' : 'Full'}</span>
          </Button>
        </div>

        {gameState !== "playing" && !isFullscreen && (
          <div className="flex justify-center mb-2 sm:mb-3">
            <Icon className="w-10 h-10 sm:w-14 sm:h-14 text-primary" />
          </div>
        )}

        <div className="flex items-center justify-center gap-2">
          {gameState === "playing" && <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />}
          <CardTitle className={cn(
            "font-black tracking-tight uppercase",
            gameState === "playing" ? "text-base sm:text-2xl" : "text-xl sm:text-3xl md:text-4xl"
          )}>
            {game.title}
          </CardTitle>
          {gameState === "playing" && (
            <Badge variant="outline" className="text-[10px] sm:text-xs px-2 py-0 uppercase">
              {difficulty || game.level}
            </Badge>
          )}
        </div>

        {gameState !== "playing" && (
          <>
            <CardDescription className="text-xs sm:text-sm md:text-base max-w-xl mx-auto mt-1">
              {game.description}
            </CardDescription>
            <div className="flex justify-center pt-2">
              <Badge variant="outline" className="text-xs sm:text-sm px-3 py-0.5">
                {difficulty || game.level.toUpperCase()}
              </Badge>
            </div>
          </>
        )}
      </CardHeader>

      <CardContent 
        className={cn(
          "flex-1 min-h-0 w-full max-w-5xl mx-auto flex flex-col overflow-y-auto overflow-x-hidden p-2 sm:p-4 overscroll-contain touch-pan-y",
          gameState === "playing" ? "justify-start items-stretch" : "items-center justify-center"
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4 text-center my-auto">
            <p className="text-muted-foreground text-sm sm:text-lg">Match the words to their definitions!</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setGameState("instructions")} size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 font-black h-12 sm:h-14 px-8 text-base sm:text-lg rounded-2xl shadow-xl">
                <Sparkles className="mr-2 h-5 w-5" />
                How to Play & Start
              </Button>
              <Button onClick={() => setGameState('selecting_difficulty')} variant="outline" size="lg" className="h-12 sm:h-14 px-8 text-base sm:text-lg rounded-2xl font-bold">
                Direct Select
              </Button>
            </div>
          </div>
        )}

        {gameState === "instructions" && (
          <div className="flex flex-col items-center justify-center gap-4 text-center bg-muted/40 rounded-2xl mx-auto border border-border/20 shadow-inner p-4 sm:p-8 max-w-lg w-full my-auto">
            <h3 className="font-bold text-center text-lg sm:text-2xl">Voyage Directives / How to Play</h3>
            <div className="text-left space-y-2 sm:space-y-3 text-xs sm:text-base text-muted-foreground">
              <p>1. Select a vocabulary word from the left column.</p>
              <p>2. Match it with its correct semantic definition on the right.</p>
              <p>3. Clear all pairs to successfully navigate and complete the voyage!</p>
            </div>
            <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className="mt-4 w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 text-base rounded-xl shadow-lg">
              Launch Voyage
            </Button>
          </div>
        )}

        {gameState === "selecting_difficulty" && (
          <div className="flex flex-col items-center gap-6 my-auto text-center w-full max-w-md">
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs sm:text-sm">Choose Mission Level</p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
              {["beginner", "intermediate", "advanced"].map((level) => (
                <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} variant="outline" className="font-black uppercase h-12 sm:h-14 text-xs sm:text-sm rounded-xl border-2 hover:border-primary shadow-md">
                  {level}
                </Button>
              ))}
            </div>
          </div>
        )}

        {gameState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 my-auto">
            <Loader2 className="animate-spin text-primary h-12 w-12 sm:h-16 sm:w-16" />
            <p className="text-muted-foreground font-medium animate-pulse text-sm sm:text-lg">Synchronizing vocabulary data...</p>
          </div>
        )}

        {gameState === "playing" && (
          <div className="w-full flex flex-col gap-2.5 sm:gap-4 pt-1 pb-4">
            {/* Mission banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-3 py-2 flex items-center justify-between text-xs sm:text-sm shrink-0">
              <div className="flex items-center gap-1.5 font-medium text-muted-foreground truncate">
                <span className="font-bold text-foreground">Mission:</span>
                <span className="truncate">
                  {selectedWord && !selectedDefinition
                    ? `Tap the definition for "${selectedWord.word}"`
                    : !selectedWord && selectedDefinition
                    ? `Tap the word matching the selected definition`
                    : "Tap a Word, then tap its Matching Definition"}
                </span>
              </div>
              <div className="font-black text-primary shrink-0 ml-2 text-xs sm:text-sm">
                {correctMatches.length} / {words.length} Solved
              </div>
            </div>

            {/* Side-by-side 2-column layout for both mobile and desktop */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 items-start w-full">
              {/* Words Column */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-border/40">
                  <h3 className="font-black uppercase tracking-wider text-primary text-xs sm:text-base">
                    Words
                  </h3>
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold">
                    {words.length - correctMatches.length} left
                  </span>
                </div>
                <div className="space-y-2">
                  {words.map((pair) => (
                    <Button
                      key={pair.word}
                      variant={
                        getButtonState(pair, 'word') === 'correct' ? "secondary" : 
                        getButtonState(pair, 'word') === 'incorrect' ? "destructive" :
                        getButtonState(pair, 'word') === 'selected' ? "default" : "outline"
                      }
                      className={cn(
                        "w-full justify-start text-left h-auto py-2.5 px-2.5 sm:py-3.5 sm:px-4 whitespace-normal transition-all duration-200 shadow-sm rounded-xl font-bold text-xs sm:text-sm md:text-base border-2 break-words",
                        {"opacity-35 cursor-not-allowed scale-95": correctMatches.includes(pair.word)},
                        {"bg-green-500 hover:bg-green-600 text-white border-green-600 shadow-green-500/20": getButtonState(pair, 'word') === 'correct'},
                        {"animate-shake ring-2 ring-red-500 border-red-500": getButtonState(pair, 'word') === 'incorrect'},
                        {"ring-2 ring-primary border-primary bg-primary text-primary-foreground scale-[1.02] shadow-md": getButtonState(pair, 'word') === 'selected'}
                      )}
                      onClick={() => !correctMatches.includes(pair.word) && setSelectedWord(pair)}
                      disabled={correctMatches.includes(pair.word)}
                    >
                      {correctMatches.includes(pair.word) && <Check className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-white" />}
                      <span className="truncate max-w-full">{pair.word}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Definitions Column */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-border/40">
                  <h3 className="font-black uppercase tracking-wider text-primary text-xs sm:text-base">
                    Definitions
                  </h3>
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold">
                    {definitions.length - correctMatches.length} left
                  </span>
                </div>
                <div className="space-y-2">
                  {definitions.map((pair) => (
                    <Button
                      key={pair.word}
                      variant={
                        getButtonState(pair, 'definition') === 'correct' ? "secondary" : 
                        getButtonState(pair, 'definition') === 'incorrect' ? "destructive" :
                        getButtonState(pair, 'definition') === 'selected' ? "default" : "outline"
                      }
                      className={cn(
                        "w-full justify-start text-left h-auto py-2 px-2.5 sm:py-3 sm:px-4 whitespace-normal transition-all duration-200 shadow-sm rounded-xl font-medium text-[11px] sm:text-xs md:text-sm leading-snug border-2 break-words",
                        {"opacity-35 cursor-not-allowed scale-95": correctMatches.includes(pair.word)},
                        {"bg-green-500 hover:bg-green-600 text-white border-green-600 shadow-green-500/20": getButtonState(pair, 'definition') === 'correct'},
                        {"animate-shake ring-2 ring-red-500 border-red-500": getButtonState(pair, 'definition') === 'incorrect'},
                        {"ring-2 ring-primary border-primary bg-primary text-primary-foreground scale-[1.02] shadow-md": getButtonState(pair, 'definition') === 'selected'}
                      )}
                      onClick={() => !correctMatches.includes(pair.word) && setSelectedDefinition(pair)}
                      disabled={correctMatches.includes(pair.word)}
                    >
                      {correctMatches.includes(pair.word) && <Check className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-white" />}
                      <span>{pair.definition}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {gameState === "finished" && (
          <div className="flex flex-col items-center gap-4 sm:gap-6 animate-in zoom-in duration-300 my-auto text-center py-6">
            <Trophy className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)] h-20 w-20 sm:h-28 sm:w-28"/>
            <div className="space-y-1">
              <p className="font-black uppercase tracking-tight text-green-500 text-2xl sm:text-4xl">VOYAGE COMPLETE!</p>
              <p className="text-muted-foreground text-xs sm:text-base">You have successfully matched every signal.</p>
            </div>
            <Button onClick={handlePlayAgain} size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 sm:h-14 px-8 text-base rounded-2xl shadow-xl">
              <Repeat className="mr-2 h-4 w-4" />
              Launch New Mission
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-row justify-between items-center gap-3 p-3 sm:p-5 border-t border-border/10 w-full shrink-0 bg-card/40">
        <Button variant="outline" asChild size="sm" className="h-9 sm:h-11 px-4 sm:px-6 rounded-xl font-bold text-xs sm:text-sm">
          <Link href="/games">Abort Voyage</Link>
        </Button>
        {gameState === "playing" && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-muted-foreground text-xs sm:text-sm">Progress:</span>
            <Badge variant="secondary" className="font-black text-primary text-xs sm:text-sm px-2.5 py-0.5">
              {correctMatches.length} / {words.length}
            </Badge>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
