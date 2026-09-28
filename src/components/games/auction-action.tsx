"use client";

import * as React from "react";
import Image from "next/image";
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
  generateAuctionItem,
  type GenerateAuctionItemOutput,
} from "@/ai/flows/generate-auction-item";
import { Loader2, UserPlus, Trash2, RotateCcw, ThumbsUp, ThumbsDown, Send, CheckCircle, XCircle, Skull, Gift, Maximize, Minimize, Sparkles, Repeat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Link from "next/link";


type GameState = "setup" | "loading" | "turn" | "judged" | "finished" | "event" | "instructions" | "idle";

type Team = {
  name: string;
  money: number;
  passes: number;
};

type Exercise = {
    presentedSentence: string;
    isCorrect: boolean;
    explanation: string;
};

const PASS_LIMIT = 3;
const WAGER_AMOUNT = 100;
const EVENT_CHANCE = 0.3;
const EVENT_AMOUNTS = [10, 20, 30, 40, 50];


export function AuctionAction({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [exercise, setExercise] = React.useState<Exercise | null>(null);
  const [settings, setSettings] = React.useState({ startingMoney: 500, numSentences: 10 });
  const [teams, setTeams] = React.useState<Team[]>([
    { name: "Team 1", money: 500, passes: PASS_LIMIT },
    { name: "Team 2", money: 500, passes: PASS_LIMIT },
  ]);
  const [round, setRound] = React.useState(0);
  const [turn, setTurn] = React.useState(0);
  const [judgement, setJudgement] = React.useState<{ correct: boolean, message: string } | null>(null);
  const [randomEvent, setRandomEvent] = React.useState<{ message: string; type: 'steal' | 'give' } | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleStartGame = () => {
    if (teams.length < 2) {
        toast({ variant: "destructive", title: "Error", description: "You need at least two teams to play." });
        return;
    }
    const startingTeams = teams.map(team => ({...team, money: settings.startingMoney, passes: PASS_LIMIT }))
    setTeams(startingTeams);
    setRound(1);
    setTurn(0);
    setGameState("instructions");
  };

  const fetchNextItem = async () => {
    setGameState("loading");
    setExercise(null);
    setJudgement(null);
    setRandomEvent(null);

    try {
      const auctionData: GenerateAuctionItemOutput = await generateAuctionItem({ difficulty: 'intermediate' });
      
      setExercise({
          presentedSentence: auctionData.sentence,
          isCorrect: auctionData.isCorrect,
          explanation: auctionData.explanation,
      });
      setGameState("turn");

    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch a new sentence." });
      setGameState("setup");
    }
  };

  const showRandomEvent = () => {
    const isSteal = Math.random() < 0.5;
    const amount = EVENT_AMOUNTS[Math.floor(Math.random() * EVENT_AMOUNTS.length)];
    
    const getRandomIndices = (maxIndex: number, count: number) => {
        const indices = new Set<number>();
        if (count > maxIndex) count = maxIndex;
        while (indices.size < count) {
            indices.add(Math.floor(Math.random() * maxIndex));
        }
        return Array.from(indices);
    };
    const numTargets = Math.random() < 0.5 ? 1 : 2;
    const targetIndices = getRandomIndices(teams.length, numTargets);

    const newTeams = [...teams];
    let eventMessage = "";
    
    const targetNames = targetIndices.map(i => newTeams[i].name).join(" and ");

    if (isSteal) {
      eventMessage = `A mysterious man appears and steals $${amount} from ${targetNames}!`;
      targetIndices.forEach(i => newTeams[i].money -= amount);
      setRandomEvent({ message: eventMessage, type: 'steal' });
    } else {
      eventMessage = `A mysterious woman appears and gives $${amount} to ${targetNames}!`;
      targetIndices.forEach(i => newTeams[i].money += amount);
      setRandomEvent({ message: eventMessage, type: 'give' });
    }
    
    setTeams(newTeams);
    setGameState("event");
  };

  const handlePass = () => {
      const currentTeam = teams[turn];
      if (currentTeam.passes <= 0) {
          toast({variant: 'destructive', title: "No Passes Left!", description: "You must make a choice."})
          return;
      }

      const newTeams = [...teams];
      newTeams[turn].passes -= 1;
      setTeams(newTeams);

      toast({title: "Passed!", description: `${currentTeam.name} passed the turn.`})
      setTurn((turn + 1) % teams.length);
  }

  const handleJudge = (userThinksIsCorrect: boolean) => {
    if (!exercise) return;
    
    const wasChoiceCorrect = userThinksIsCorrect === exercise.isCorrect;
    const team = teams[turn];
    const newTeams = [...teams];

    if (wasChoiceCorrect) {
        newTeams[turn].money += WAGER_AMOUNT;
        setJudgement({correct: true, message: `Correct! The sentence was ${exercise.isCorrect ? 'correct' : 'incorrect'}. ${team.name} wins $${WAGER_AMOUNT}.`});
    } else {
        newTeams[turn].money -= WAGER_AMOUNT;
        setJudgement({correct: false, message: `Incorrect! The sentence was ${exercise.isCorrect ? 'correct' : 'incorrect'}. ${team.name} loses $${WAGER_AMOUNT}.`});
    }
    
    setTeams(newTeams);
    setGameState("judged");
  };

  const handleNext = () => {
    if (round + 1 > settings.numSentences) {
      setGameState("finished");
    } else {
      setRound(round + 1);
      setTurn((turn + 1) % teams.length);
      
      if (Math.random() < EVENT_CHANCE) {
        showRandomEvent();
      } else {
        fetchNextItem();
      }
    }
  };
  
  const handleAddTeam = () => {
      setTeams([...teams, {name: `Team ${teams.length + 1}`, money: settings.startingMoney, passes: PASS_LIMIT}]);
  }

  const handleRemoveTeam = (index: number) => {
      if (teams.length <= 2) return;
      const newTeams = [...teams];
      newTeams.splice(index, 1);
      setTeams(newTeams);
  }

  const handleTeamNameChange = (index: number, newName: string) => {
      const newTeams = [...teams];
      newTeams[index].name = newName;
      setTeams(newTeams);
  }

  const resetGame = () => {
    setGameState("setup");
    setRandomEvent(null);
    setTeams([
        { name: "Team 1", money: settings.startingMoney, passes: PASS_LIMIT },
        { name: "Team 2", money: settings.startingMoney, passes: PASS_LIMIT },
    ]);
  }

  const renderContent = () => {
    switch (gameState) {
      case "setup":
        return (
          <div className="flex flex-col items-center gap-6 w-full max-w-lg">
            <h3 className="text-xl font-bold">Game Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="flex flex-col gap-2">
                <label>Starting Money</label>
                <Select defaultValue="500" onValueChange={(v) => setSettings(s => ({...s, startingMoney: parseInt(v)}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                    <SelectItem value="500">$500</SelectItem>
                    <SelectItem value="1000">$1000</SelectItem>
                    <SelectItem value="2000">$2000</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <div className="flex flex-col gap-2">
                <label>Number of Sentences</label>
                <Select defaultValue="10" onValueChange={(v) => setSettings(s => ({...s, numSentences: parseInt(v)}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                    <SelectItem value="10">10 Sentences</SelectItem>
                    <SelectItem value="20">20 Sentences</SelectItem>
                    <SelectItem value="30">30 Sentences</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>
            <div className="w-full space-y-2">
                <h4 className="font-bold">Teams</h4>
                {teams.map((team, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Input value={team.name} onChange={(e) => handleTeamNameChange(index, e.target.value)} />
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveTeam(index)} disabled={teams.length <= 2}>
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                ))}
                <Button variant="outline" onClick={handleAddTeam} className="w-full"><UserPlus className="mr-2"/>Add Team</Button>
            </div>
            <Button onClick={handleStartGame} size="lg" className="w-full h-14 font-black uppercase text-xl rounded-2xl shadow-lg">Begin Auction</Button>
          </div>
        );
      case "instructions":
        return (
            <div className={cn(
                "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
                isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-lg"
            )}>
                <h3 className={cn("font-black uppercase tracking-widest text-center mb-4", isFullscreen ? "text-4xl" : "text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-4", isFullscreen ? "text-2xl" : "text-base")}>
                    <p>1. Teams analyze a presented sentence. It is either grammatically perfect or contains a subtle error.</p>
                    <p>2. The active team must decide: <strong>CORRECT</strong> or <strong>INCORRECT</strong>.</p>
                    <p>3. Successful judgments earn $100. Failures cost $100.</p>
                    <p>4. Use your limited <strong>PASSES</strong> to skip high-risk sentences!</p>
                </div>
                <Button onClick={fetchNextItem} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Initialize</Button>
            </div>
        );
      case "loading":
        return (
            <div className="flex flex-col items-center justify-center gap-6">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
                <p className={cn("text-muted-foreground animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>Analyzing syntax tokens...</p>
            </div>
        );
      case "turn":
        const currentTeam = teams[turn];
        return (
          <div className="w-full text-center flex flex-col items-center gap-6 max-w-4xl mx-auto animate-in fade-in duration-300">
            <div className="flex items-center justify-center p-6 md:p-10 rounded-2xl md:rounded-3xl bg-muted/20 border-2 md:border-4 border-primary shadow-xl w-full transition-all text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed min-h-[120px] md:min-h-[160px]">
              {exercise?.presentedSentence}
            </div>

            <div className="text-center w-full space-y-4">
              <div className="space-y-1">
                <p className="font-black uppercase tracking-widest text-primary text-lg sm:text-xl md:text-2xl">
                  {currentTeam.name}, what is your verdict?
                </p>
                <p className="text-muted-foreground font-semibold text-sm md:text-base">Wager: $100</p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => handleJudge(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-black uppercase shadow-lg h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl rounded-2xl transition-transform hover:scale-105"
                  size="lg"
                >
                  <ThumbsUp className="mr-2.5 h-5 w-5 md:h-6 md:w-6" />
                  Correct
                </Button>
                <Button
                  onClick={() => handleJudge(false)}
                  variant="destructive"
                  className="font-black uppercase shadow-lg h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl rounded-2xl transition-transform hover:scale-105"
                  size="lg"
                >
                  <ThumbsDown className="mr-2.5 h-5 w-5 md:h-6 md:w-6" />
                  Incorrect
                </Button>
              </div>
              <div className="pt-2">
                <Button
                  onClick={handlePass}
                  variant="secondary"
                  size="sm"
                  disabled={currentTeam.passes <= 0}
                  className="h-10 px-5 text-sm font-semibold rounded-xl"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Pass Turn ({currentTeam.passes} left)
                </Button>
              </div>
            </div>
          </div>
        );
      case "judged":
        return (
          <div className="text-center w-full max-w-3xl mx-auto flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
            <Alert
              variant={judgement?.correct ? "default" : "destructive"}
              className={cn(
                "border-2 md:border-4 rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 text-left",
                judgement?.correct
                  ? "bg-green-500/10 border-green-500/50 text-foreground"
                  : "bg-red-500/10 border-red-500/50 text-foreground"
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                {judgement?.correct ? (
                  <CheckCircle className="h-8 w-8 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-500 shrink-0" />
                )}
                <AlertTitle className="text-xl md:text-2xl font-black uppercase tracking-tight m-0">
                  {judgement?.message}
                </AlertTitle>
              </div>
              <AlertDescription className="text-base md:text-lg">
                {!exercise?.isCorrect && (
                  <p className="mt-3 border-t border-border/30 pt-3">
                    <strong className="text-primary">Correction Intelligence:</strong> {exercise?.explanation}
                  </p>
                )}
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl h-14 px-10 text-lg md:text-xl rounded-2xl"
            >
              {round >= settings.numSentences ? "Finish Session" : "Next Round"}
            </Button>
          </div>
        );
      case "event":
          const isGive = randomEvent?.type === 'give';
          return (
             <div className="text-center w-full max-w-4xl flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8">
                 <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <Image 
                        src={isGive ? `https://picsum.photos/seed/${Math.random()}/400` : `https://picsum.photos/seed/${Math.random()}/400`}
                        width={isFullscreen ? 400 : 250}
                        height={isFullscreen ? 400 : 250}
                        alt="Event character"
                        className="rounded-[3rem] shadow-2xl relative border-4 border-white/20"
                        data-ai-hint={isGive ? "woman portrait" : "man portrait"}
                    />
                 </div>
                <Alert variant={isGive ? 'default' : 'destructive'} className={cn(
                    "border-4 rounded-[2rem] shadow-2xl",
                    isFullscreen ? "p-12" : "",
                    isGive ? "bg-green-500/20 border-green-500/50" : "bg-red-500/20 border-red-500/50"
                )}>
                    {isGive ? <Gift className={cn(isFullscreen ? "h-12 w-12" : "h-6 w-6")} /> : <Skull className={cn(isFullscreen ? "h-12 w-12" : "h-6 w-6")} />}
                    <AlertTitle className={cn("font-black uppercase tracking-widest mb-4", isFullscreen ? "text-4xl" : "text-xl")}>{isGive ? "Market Surplus!" : "Market Crash!"}</AlertTitle>
                    <AlertDescription className={cn("font-bold", isFullscreen ? "text-3xl" : "text-lg")}>
                        {randomEvent?.message}
                    </AlertDescription>
                </Alert>
                <Button onClick={fetchNextItem} className={cn("bg-primary text-white font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}>
                    Continue Mission
                </Button>
            </div>
          );
      case "finished":
        const sortedTeams = [...teams].sort((a,b) => b.money - a.money);
        return (
            <div className="text-center flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                <h2 className={cn("font-black uppercase tracking-tighter text-white", isFullscreen ? "text-8xl" : "text-4xl")}>Session Over!</h2>
                <div className={cn("p-8 rounded-3xl bg-muted/20 border-4 border-primary shadow-xl", isFullscreen ? "p-16" : "p-6")}>
                    <p className={cn("text-muted-foreground uppercase tracking-widest font-black mb-4", isFullscreen ? "text-2xl" : "text-sm")}>Highest Capital:</p>
                    <p className={cn("text-amber-400 font-black uppercase italic", isFullscreen ? "text-[8vw]" : "text-4xl")}>🎉 {sortedTeams[0].name} 🎉</p>
                </div>
                <Card className={cn("w-full max-w-sm p-6 bg-card/50", isFullscreen && "max-w-xl p-12")}>
                  <h3 className={cn("font-black uppercase tracking-widest text-muted-foreground mb-4", isFullscreen ? "text-2xl" : "text-sm")}>Final Ledger</h3>
                  <div className="flex flex-col gap-4">
                      {sortedTeams.map(team => (
                          <div key={team.name} className={cn("flex justify-between font-bold", isFullscreen ? "text-3xl" : "text-xl")}>
                            <span>{team.name}:</span>
                            <span className="text-primary">${team.money}</span>
                          </div>
                      ))}
                  </div>
                </Card>
                <Button onClick={resetGame} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}><Repeat className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")}/>New Auction</Button>
            </div>
        )
      default:
        return (
            <div className="flex flex-col items-center gap-4">
                <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Ready to bid on grammatical truth?</p>
                <Button onClick={() => setGameState('setup')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                    <Sparkles className={cn("mr-2", isFullscreen ? "h-10 w-10" : "h-5 w-5")} /> Initialize
                </Button>
            </div>
        );
    }
  };

  const Icon = game.icon;
  const isPlaying = gameState !== "idle" && gameState !== "setup" && gameState !== "instructions";

  return (
    <Card className={cn(
        "w-full transition-all duration-300 flex flex-col",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-background justify-start p-4 sm:p-6 md:p-8" 
            : "max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border-border/20 shadow-lg"
      )}>
      {/* Top Header: Compact HUD during gameplay or fullscreen mode; Standard centered banner during setup/idle */}
      {isFullscreen || isPlaying ? (
        <div className="w-full max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-tight text-foreground">
                  {game.title}
                </h2>
                <Badge variant="outline" className="text-[10px] sm:text-xs font-bold uppercase border-primary/40 text-primary px-2 py-0">
                  {game.level}
                </Badge>
                {isPlaying && (
                  <Badge variant="secondary" className="text-[10px] sm:text-xs font-bold px-2 py-0">
                    Round {round} / {settings.numSentences}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground hidden md:block">
                {game.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {gameState !== "idle" && gameState !== "setup" && (
              <Button variant="ghost" size="sm" onClick={resetGame} className="text-xs h-8 sm:h-9 px-2.5 sm:px-3 gap-1 text-muted-foreground hover:text-foreground">
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 sm:h-9 px-2.5 sm:px-3 gap-1.5 font-bold text-xs"
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
              <span className="uppercase">{isFullscreen ? "Exit Full" : "Fullscreen"}</span>
            </Button>
          </div>
        </div>
      ) : (
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-auto p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? "Exit" : "Full"}</span>
          </Button>
          <div className="flex justify-center mb-3">
            <Icon className="w-14 h-14 text-primary" />
          </div>
          <CardTitle className="font-black tracking-tight uppercase text-3xl md:text-4xl">{game.title}</CardTitle>
          <CardDescription className="text-base md:text-lg max-w-xl mx-auto">{game.description}</CardDescription>
          <div className="flex justify-center pt-2">
            <Badge variant="outline" className="text-sm px-4 py-0.5">{game.level.toUpperCase()}</Badge>
          </div>
        </CardHeader>
      )}

      <CardContent className={cn(
          "w-full max-w-5xl mx-auto flex flex-col items-center justify-start flex-1 gap-4 sm:gap-6",
          isFullscreen ? "p-0 pt-2" : "p-6 pt-0 min-h-[24rem]"
      )}>
        {isPlaying && (
            <div className={cn(
                "w-full grid gap-3 md:gap-4 my-2",
                teams.length === 2 && "grid-cols-2",
                teams.length === 3 && "grid-cols-3",
                teams.length >= 4 && "grid-cols-2 sm:grid-cols-4"
            )}>
                {teams.map((team, index) => (
                     <div key={index} className={cn(
                         "p-3.5 sm:p-4 md:p-5 rounded-2xl border-2 transition-all duration-300",
                         turn === index && gameState === "turn" 
                            ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-[1.02]" 
                            : "border-border/40 bg-muted/30 opacity-75"
                     )}>
                        <p className="truncate font-black uppercase tracking-wider text-xs md:text-sm text-muted-foreground">{team.name}</p>
                        <p className="text-primary font-black text-2xl sm:text-3xl my-0.5">${team.money}</p>
                        <p className="text-muted-foreground/80 italic text-[11px] md:text-xs">{team.passes} passes left</p>
                    </div>
                ))}
            </div>
        )}
        <div className="flex-grow flex items-center justify-center w-full">
            {renderContent()}
        </div>
      </CardContent>

      <CardFooter className={cn(
        "flex justify-between items-center gap-4 pt-4 max-w-5xl mx-auto w-full",
        isFullscreen ? "p-0 pt-4" : "p-6 pt-0"
      )}>
        <Button variant="outline" asChild size="default" className="rounded-xl font-bold">
            <Link href="/games">Back to Library</Link>
        </Button>
        {isPlaying && (
            <Button variant="secondary" onClick={resetGame} size="default" className="rounded-xl font-bold">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Session
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
