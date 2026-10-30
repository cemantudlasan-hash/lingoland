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
import { Loader2, Sparkles,
  ArrowLeft,
  XOctagon, Volume2, Check, X, Repeat, Lightbulb, Send, RotateCcw, UserPlus, Trash2, Timer, Trophy, SkipForward, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import type { SkillLevel } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Progress } from "../ui/progress";

type GameState = "idle" | "setup" | "loading" | "playing" | "answered" | "finished" | "instructions";
type Team = { name: string; score: number };

const TURN_TIME_SECONDS = 60;
const LOCAL_STORAGE_KEY = 'lingoland_spelling_bee_used_words';

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
    setGameState("loading");
    setWordData(null);
    setUserAnswer("");
    setIsCorrect(null);
    setShowHint(false);
    setTimedOut(false);
    try {
      const newWord = await generateSpellingBeeWord({
        difficulty: level,
        usedWords: usedWords,
      });
      setWordData(newWord);
      setUsedWords(prev => [...prev, newWord.word]);
      setTimeLeft(TURN_TIME_SECONDS);
      setGameState("playing");
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
    setTeams(teams.map(t => ({...t, score: 0})));
    setCurrentRound(1);
    setCurrentTurn(0);
    fetchNextWord(difficulty);
  }, [teams, difficulty, fetchNextWord, toast]);

  const handleTimeUp = React.useCallback(() => {
    if (gameState !== 'playing') return;
    setTimedOut(true);
    setIsCorrect(false);
    setGameState("answered");
  }, [gameState]);

  React.useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, handleTimeUp]);

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
    if (currentRound >= totalRounds && currentTurn === teams.length - 1) {
        setGameState("finished");
        return;
    }

    const nextTurn = (currentTurn + 1) % teams.length;
    setCurrentTurn(nextTurn);
    if (nextTurn === 0) {
        setCurrentRound(prev => prev + 1);
    }
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
      setGameState('setup');
      setUsedWords([]);
  }

  const Icon = game.icon;

  const renderContent = () => {
      switch(gameState) {
        case "setup":
          return (
             <div className="flex flex-col items-center gap-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-center">Game Setup</h3>
                 <div className="w-full space-y-2">
                    <label>Difficulty</label>
                    <Select value={difficulty} onValueChange={(v) => setDifficulty(v as SkillLevel)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="beginner">Beginner</SelectItem>
                           <SelectItem value="intermediate">Intermediate</SelectItem>
                           <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="w-full space-y-2">
                    <label>Rounds</label>
                    <Select value={String(totalRounds)} onValueChange={(v) => setTotalRounds(Number(v))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="10">10 Rounds</SelectItem>
                           <SelectItem value="15">15 Rounds</SelectItem>
                           <SelectItem value="20">20 Rounds</SelectItem>
                           <SelectItem value="30">30 Rounds</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full space-y-2">
                    <h4 className="font-bold">Teams</h4>
                    {teams.map((team, index) => (
                        <div key={index} className="flex items-center gap-2">
                        <Input value={team.name} onChange={(e) => handleTeamNameChange(index, e.target.value)} />
                        <Button variant="ghost" size="icon" onClick={() => removeTeam(index)} disabled={teams.length <= 2}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        </div>
                    ))}
                    <Button variant="outline" onClick={addTeam} className="w-full" disabled={teams.length >= 4}>
                        <UserPlus className="mr-2" />
                        Add Team
                    </Button>
                </div>
                <Button onClick={handleStartGame} size="lg" className="w-full h-14 font-black uppercase text-xl rounded-2xl shadow-lg">Begin Competition</Button>
            </div>
          );
        case "instructions":
            return (
                 <div className="flex flex-col items-center justify-center gap-4 text-center bg-muted/40 rounded-2xl mx-auto border border-border/20 shadow-inner p-4 sm:p-8 max-w-lg w-full">
                    <h3 className="font-black uppercase tracking-wider text-center text-lg sm:text-2xl">How to Play</h3>
                    <div className="text-left space-y-3 text-xs sm:text-base text-muted-foreground">
                        <p className="flex items-start gap-2"><span className="font-bold text-primary">1.</span> On your team's turn, click "Listen to word" to hear pronunciation.</p>
                        <p className="flex items-start gap-2"><span className="font-bold text-primary">2.</span> You have {TURN_TIME_SECONDS} seconds to spell the target word correctly.</p>
                        <p className="flex items-start gap-2"><span className="font-bold text-primary">3.</span> Use "Get Intel" for word definitions and context sentences!</p>
                    </div>
                    <Button onClick={() => setGameState('setup')} className="w-full sm:w-auto mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 px-8 rounded-xl">Configure Teams</Button>
                </div>
            );
        case "loading":
             return (
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="animate-spin text-primary h-10 w-10 sm:h-14 sm:h-14" />
                <p className="text-muted-foreground animate-pulse font-black uppercase tracking-wider text-xs sm:text-sm">Loading phonetic database...</p>
              </div>
            );
        case "playing":
        case "answered":
            if (!wordData) return null;
            return (
                <div className="w-full flex flex-col items-center gap-6 max-w-3xl">
                    <div className="w-full grid grid-cols-3 gap-2 sm:gap-4 text-center font-black uppercase tracking-wider">
                        <div className="p-3 bg-muted/20 rounded-xl border border-primary/10">
                            <p className="text-[10px] sm:text-xs opacity-60">Round</p>
                            <p className="text-sm sm:text-xl">{currentRound}/{totalRounds}</p>
                        </div>
                        <div className="p-3 bg-primary text-white rounded-xl shadow-md">
                            <p className="text-[10px] sm:text-xs opacity-80">Active Team</p>
                            <p className="text-sm sm:text-xl truncate">{teams[currentTurn].name}</p>
                        </div>
                         <div className="p-3 bg-muted/20 rounded-xl border border-primary/10">
                            <p className="text-[10px] sm:text-xs opacity-60">Time Left</p>
                            <p className="text-sm sm:text-xl font-mono">{timeLeft}s</p>
                        </div>
                    </div>
                    <Progress value={(timeLeft / TURN_TIME_SECONDS) * 100} className="w-full h-2.5 rounded-full" />
                    
                     <div className="space-y-6 text-center w-full">
                        <div className="flex flex-wrap justify-center gap-3">
                            <Button onClick={() => handleSpeak(wordData.word)} disabled={isSpeaking} className="h-11 sm:h-12 px-5 font-bold uppercase rounded-xl">
                                {isSpeaking ? <Loader2 className="animate-spin h-4 w-4" /> : <Volume2 className="h-4 w-4 mr-2" />}
                                <span>Listen</span>
                            </Button>
                            <Button onClick={() => setShowHint(true)} variant="secondary" className="h-11 sm:h-12 px-5 font-bold uppercase rounded-xl">
                                <Lightbulb className="mr-2 h-4 w-4"/>
                                Get Hint
                            </Button>
                        </div>

                        {showHint && (
                            <div className="p-4 sm:p-6 bg-muted/30 backdrop-blur-sm rounded-2xl border-2 border-dashed border-primary/30 text-left space-y-2 animate-in fade-in duration-200">
                                <p className="text-xs sm:text-sm font-medium"><strong>Definition:</strong> {wordData.definition}</p>
                                <p className="text-xs sm:text-sm font-medium italic opacity-80"><strong>Context:</strong> "{wordData.exampleSentence}"</p>
                            </div>
                        )}

                        <div className="flex gap-2 sm:gap-3 w-full">
                            <Input 
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                className="h-12 sm:h-14 text-base sm:text-xl font-black uppercase tracking-wider text-center bg-card border-2 focus-visible:ring-primary rounded-xl"
                                disabled={gameState === "answered"}
                                placeholder="TYPE WORD HERE..."
                                onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer()}
                                spellCheck="false"
                                autoFocus
                            />
                            <Button onClick={handleCheckAnswer} disabled={gameState === 'answered' || !userAnswer.trim()} className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl shrink-0">
                                <Send className="h-5 w-5" />
                            </Button>
                        </div>
                    
                        {gameState === 'answered' && (
                            <Alert variant={isCorrect ? "default" : "destructive"} className={cn(
                                'text-center border-2 rounded-2xl shadow-xl animate-in fade-in zoom-in duration-200 p-4 sm:p-6',
                                isCorrect ? 'bg-green-500/15 border-green-500/40 text-foreground' : 'bg-red-500/15 border-red-500/40 text-foreground'
                            )}>
                                {isCorrect ? <Check className="h-5 w-5 sm:h-6 sm:w-6" /> : <X className="h-5 w-5 sm:h-6 sm:w-6" />}
                                <AlertTitle className="font-black uppercase tracking-wider text-base sm:text-xl mb-1">{timedOut ? "TIME EXPIRED!" : (isCorrect ? 'PERFECT SPELLING!' : 'INCORRECT SPELLING!')}</AlertTitle>
                                <AlertDescription className="font-bold text-xs sm:text-base">
                                    {isCorrect ? `+1 point awarded to ${teams[currentTurn].name}.` : `The correct spelling was: ${wordData.word.toUpperCase()}`}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
            );
        case "finished":
            const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
            return (
                <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-300 max-w-md w-full">
                    <Trophy className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)] h-16 w-16 sm:h-24 sm:h-24 animate-pulse"/>
                    <div className="space-y-1">
                        <h2 className="font-black uppercase tracking-tight text-xl sm:text-3xl">Competition Over!</h2>
                        <p className="font-black text-primary uppercase text-sm sm:text-lg">🎉 {sortedTeams[0].name} Champion! 🎉</p>
                    </div>
                     <Card className="w-full p-4 sm:p-6 bg-card/50 rounded-2xl border-2">
                        <h3 className="font-black uppercase tracking-wider text-muted-foreground mb-3 text-xs sm:text-sm">Final Scoreboard</h3>
                        <div className="flex flex-col gap-2.5">
                            {sortedTeams.map((team, index) => (
                                <div key={team.name} className="flex justify-between font-bold text-sm sm:text-lg">
                                    <span>{index + 1}. {team.name}</span>
                                    <span className="text-primary">{team.score} pts</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Button onClick={handleStartGame} className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-lg rounded-xl">
                        <Repeat className="mr-2 h-4 w-4" />
                        Start New Bee
                    </Button>
                </div>
            )
        default:
             return (
              <div className="flex flex-col items-center gap-4 text-center max-w-md">
                <p className="text-sm sm:text-base text-muted-foreground">Ready to prove your spelling dominance? Form teams and compete!</p>
                <Button onClick={() => setGameState('instructions')} className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-lg rounded-xl">
                  <Sparkles className="mr-2 h-4 w-4" /> Initialize Bee
                </Button>
              </div>
            );
      }
  }

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
            <Icon className="w-10 h-10 sm:w-14 sm:h-14 text-primary" />
        </div>
        <CardTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-2xl sm:text-4xl md:text-5xl" : "text-xl sm:text-3xl")}>{game.title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm md:text-base max-w-xl mx-auto">{game.description}</CardDescription>
        {gameState !== 'setup' && gameState !== 'idle' && (
            <div className="flex justify-center pt-2">
                <Badge variant="outline" className="text-xs sm:text-sm px-3 py-0.5">{difficulty.toUpperCase()}</Badge>
            </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-4xl mx-auto overflow-y-auto overflow-x-hidden custom-scrollbar">
        {renderContent()}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10 w-full shrink-0">
        <Button variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
            <Link href="/games">Back to Library</Link>
        </Button>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            {gameState === 'playing' && (
                <Button onClick={handleNextTurn} variant="secondary" className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
                    <SkipForward className="mr-2 h-4 w-4"/> Skip Word
                </Button>
            )}
            {gameState === 'answered' && <Button onClick={handleNextTurn} className="w-full sm:w-auto h-11 sm:h-12 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-lg rounded-xl"><Repeat className="mr-2 h-4 w-4"/>Next Turn</Button>}
            {gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'setup' && (
                <Button variant="ghost" onClick={handleClearHistory} title="Clear used word history" className="w-full sm:w-auto h-11 sm:h-12 px-4 rounded-xl text-xs sm:text-sm">
                    <RotateCcw className="mr-2 h-4 w-4"/>Clear History
                </Button>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
