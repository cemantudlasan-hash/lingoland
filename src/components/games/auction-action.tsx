"use client";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  generateAuctionItem,
  type GenerateAuctionItemOutput,
} from "@/ai/flows/generate-auction-item";
import { 
  Loader2, 
  UserPlus, 
  Trash2, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  Send, 
  CheckCircle, 
  XCircle, 
  Skull, 
  Gift, 
  Maximize, 
  Minimize, 
  Sparkles, 
  ArrowLeft,
  LogOut,
  Gavel,
  Coins,
  Users,
  HelpCircle,
  Activity
} from "lucide-react";
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
const EVENT_AMOUNTS = [10, 20, 30, 40, 50];

export function AuctionAction({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [exercise, setExercise] = React.useState<Exercise | null>(null);
  const [settings, setSettings] = React.useState({ startingMoney: 500, numSentences: 10 });
  const [teams, setTeams] = React.useState<Team[]>([
    { name: "Team Alpha", money: 500, passes: PASS_LIMIT },
    { name: "Team Beta", money: 500, passes: PASS_LIMIT },
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
    const startingTeams = teams.map(team => ({...team, money: settings.startingMoney, passes: PASS_LIMIT }));
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

    const availableIndices = teams.map((_, i) => i).filter(i => i !== turn);
    const targetIndices = getRandomIndices(availableIndices.length, numTargets).map(i => availableIndices[i]);

    let message = '';
    const newTeams = [...teams];
    const currentTeam = newTeams[turn];

    if (isSteal) {
      let totalStolen = 0;
      targetIndices.forEach(index => {
        const targetTeam = newTeams[index];
        const stolen = Math.min(targetTeam.money, amount);
        targetTeam.money -= stolen;
        totalStolen += stolen;
      });
      currentTeam.money += totalStolen;
      const targetNames = targetIndices.map(i => teams[i].name).join(' and ');
      message = `${currentTeam.name} pirated $${totalStolen} total from ${targetNames}!`;
    } else {
      let totalGiven = 0;
      targetIndices.forEach(index => {
        const targetTeam = newTeams[index];
        const given = amount;
        targetTeam.money += given;
        totalGiven += given;
      });
      currentTeam.money -= totalGiven;
      const targetNames = targetIndices.map(i => teams[i].name).join(' and ');
      message = `${currentTeam.name} distributed $${amount} to ${targetNames}!`;
    }

    setTeams(newTeams);
    setRandomEvent({ message, type: isSteal ? 'steal' : 'give' });
    setGameState("event");
  };

  const handleJudge = (guessedCorrect: boolean) => {
    if (!exercise) return;
    const isActuallyCorrect = exercise.isCorrect;
    const playerWasRight = guessedCorrect === isActuallyCorrect;

    const newTeams = [...teams];
    const currentTeam = newTeams[turn];

    if (playerWasRight) {
      currentTeam.money += WAGER_AMOUNT;
      setJudgement({
        correct: true,
        message: `Ruling Verified! ${currentTeam.name} earned $${WAGER_AMOUNT}.`,
      });
    } else {
      currentTeam.money -= WAGER_AMOUNT;
      setJudgement({
        correct: false,
        message: `Contempt of Court! ${currentTeam.name} lost $${WAGER_AMOUNT}.`,
      });
    }
    setTeams(newTeams);
    setGameState("judged");
  };

  const handlePass = () => {
    const newTeams = [...teams];
    const currentTeam = newTeams[turn];
    if (currentTeam.passes > 0) {
      currentTeam.passes -= 1;
      setTeams(newTeams);
      toast({
        title: "Auction Passed",
        description: `${currentTeam.name} passed. Next team step up!`,
      });
      advanceTurn(false);
    }
  };

  const advanceTurn = (checkEvent: boolean = true) => {
    if (checkEvent && Math.random() < 0.25) {
      showRandomEvent();
      return;
    }

    const nextTurn = (turn + 1) % teams.length;
    let nextRound = round;
    if (nextTurn === 0) {
      nextRound += 1;
    }

    if (nextRound > settings.numSentences) {
      setGameState("finished");
    } else {
      setRound(nextRound);
      setTurn(nextTurn);
      fetchNextItem();
    }
  };

  const resetGame = () => {
    setGameState("idle");
    setExercise(null);
    setRound(0);
    setTurn(0);
    setJudgement(null);
    setRandomEvent(null);
    setTeams(teams.map(t => ({...t, money: settings.startingMoney, passes: PASS_LIMIT })));
    toast({
      title: "Auction Aborted",
      description: "Returned to the Auction Grand Hall.",
    });
  };

  const handleAddTeam = () => {
    setTeams([...teams, { name: `Team ${teams.length + 1}`, money: settings.startingMoney, passes: PASS_LIMIT }]);
  };

  const handleRemoveTeam = (index: number) => {
    if (teams.length <= 2) return;
    setTeams(teams.filter((_, i) => i !== index));
  };

  const handleTeamNameChange = (index: number, newName: string) => {
    const newTeams = [...teams];
    newTeams[index].name = newName;
    setTeams(newTeams);
  };

  const isPlaying = ["turn", "judged", "event", "loading"].includes(gameState);

  const renderContent = () => {
    switch (gameState) {
      case "idle":
        return (
          <div className="w-full space-y-6 py-2">
            {/* Auction Status Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-900/60 border border-amber-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Gavel className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-mono uppercase text-amber-300/60">Gavel Status</p>
                  <p className="text-sm sm:text-base font-black text-white">READY // $100</p>
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-emerald-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-mono uppercase text-emerald-300/60">Starting Vault</p>
                  <p className="text-sm sm:text-base font-black text-emerald-300">${settings.startingMoney}</p>
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-blue-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-mono uppercase text-blue-300/60">Teams Registered</p>
                  <p className="text-sm sm:text-base font-black text-white">{teams.length} SYNDICATES</p>
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-purple-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-mono uppercase text-purple-300/60">Auction Lots</p>
                  <p className="text-sm sm:text-base font-black text-white">{settings.numSentences} SENTENCES</p>
                </div>
              </div>
            </div>

            {/* Main Interactive Deck */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 bg-gradient-to-b from-amber-950/20 via-zinc-900/40 to-black/60 border border-amber-500/30 rounded-3xl p-5 sm:p-8 backdrop-blur-xl flex flex-col justify-between space-y-6 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>GRAMMAR BIDDING & JUDGMENT HALL</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase leading-tight">
                    Auction Action <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400">
                      Grammar Market Floor
                    </span>
                  </h2>

                  <p className="text-sm sm:text-base text-amber-100/70 leading-relaxed max-w-xl">
                    Step up to the auction podium! Analyze complex grammatical sentences with your syndicate. Wager money on sentence validity, deploy strategic passes, and survive market events!
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setGameState("setup")}
                    className="flex-1 h-14 sm:h-16 text-base sm:text-lg font-black bg-gradient-to-r from-amber-500 via-orange-600 to-yellow-500 hover:from-amber-400 hover:to-orange-500 text-slate-950 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.35)] transition-all hover:scale-[1.02] border border-amber-300/40 uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Gavel className="h-5 w-5" />
                    <span>Configure Teams & Play</span>
                  </Button>

                  <Button
                    variant="outline"
                    asChild
                    className="h-14 sm:h-16 px-6 text-sm sm:text-base font-bold border-white/15 bg-zinc-900/50 hover:bg-zinc-800 text-white rounded-2xl flex items-center justify-center gap-2"
                  >
                    <Link href="/games">
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Games</span>
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Auction Floor Rules */}
              <div className="lg:col-span-5 bg-zinc-900/50 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 text-amber-300">
                    <HelpCircle className="h-5 w-5 text-amber-400" />
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                      Market Rules
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm text-amber-100/80 font-normal">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="h-6 w-6 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">01</span>
                      <div>
                        <p className="font-bold text-white">Sentence Judgment</p>
                        <p className="text-[12px] text-amber-200/60">Sentences are presented. Judge whether they are grammatically sound or flawed.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">02</span>
                      <div>
                        <p className="font-bold text-white">$100 Stakes & Pass Power</p>
                        <p className="text-[12px] text-amber-200/60">Win $100 for correct verdicts, lose $100 for errors. Use passes to skip traps.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="h-6 w-6 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">03</span>
                      <div>
                        <p className="font-bold text-white">Random Market Events</p>
                        <p className="text-[12px] text-amber-200/60">Random windfall steals and redistribution events can shake up team standings!</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setGameState("instructions")} 
                  variant="outline" 
                  className="w-full border-amber-500/30 text-amber-200 hover:bg-amber-950/40 rounded-xl font-bold text-xs"
                >
                  View How To Play
                </Button>
              </div>
            </div>
          </div>
        );

      case "setup":
        return (
          <div className="flex flex-col gap-6 w-full max-w-xl mx-auto bg-zinc-900/60 border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-xl">
            <h3 className="text-xl sm:text-2xl font-black uppercase text-amber-300 tracking-wider">Configure Auction Room</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-muted-foreground">Starting Vault</label>
                <Select defaultValue={settings.startingMoney.toString()} onValueChange={(v) => setSettings(s => ({...s, startingMoney: parseInt(v)}))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="250">$250 (Fast)</SelectItem>
                    <SelectItem value="500">$500 (Standard)</SelectItem>
                    <SelectItem value="1000">$1000 (High Stakes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-muted-foreground">Sentences (Lots)</label>
                <Select defaultValue={settings.numSentences.toString()} onValueChange={(v) => setSettings(s => ({...s, numSentences: parseInt(v)}))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 Lots</SelectItem>
                    <SelectItem value="15">15 Lots</SelectItem>
                    <SelectItem value="20">20 Lots</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">Syndicate Teams</h4>
              {teams.map((team, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input 
                    value={team.name} 
                    onChange={(e) => handleTeamNameChange(index, e.target.value)}
                    className="rounded-xl bg-zinc-950/50" 
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveTeam(index)} disabled={teams.length <= 2}>
                    <Trash2 className="h-4 w-4 text-red-400"/>
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={handleAddTeam} className="w-full rounded-xl border-dashed border-white/20">
                <UserPlus className="mr-2 h-4 w-4"/>Add Team
              </Button>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setGameState("idle")} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleStartGame} size="lg" className="flex-1 font-black uppercase text-base bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-xl shadow-lg">
                Enter Market Floor
              </Button>
            </div>
          </div>
        );

      case "instructions":
        return (
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-10 rounded-3xl max-w-2xl w-full mx-auto text-center space-y-6">
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-white flex items-center justify-center gap-3">
              <Gavel className="text-amber-400" /> Auction Protocol
            </h3>
            <div className="text-left space-y-3 font-normal text-amber-100/90 text-sm sm:text-base">
              <p className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">1. Teams examine a presented sentence. It is either grammatically correct or has a subtle flaw.</p>
              <p className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">2. The active syndicate must rule: <strong className="text-emerald-400">CORRECT</strong> or <strong className="text-rose-400">INCORRECT</strong>.</p>
              <p className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">3. Winning verdicts claim $100. Erroneous rulings forfeit $100.</p>
              <p className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">4. Use limited passes to skip precarious sentences!</p>
            </div>
            <Button onClick={fetchNextItem} size="lg" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black h-12 rounded-xl shadow-xl">
              Open First Lot
            </Button>
          </div>
        );

      case "loading":
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Loader2 className="animate-spin text-amber-400 h-12 w-12" />
            <p className="text-amber-200 animate-pulse text-sm sm:text-base font-mono">Analyzing syntax tokens from auction floor...</p>
          </div>
        );

      case "turn":
        const currentTeam = teams[turn];
        return (
          <div className="w-full text-center flex flex-col items-center gap-6 max-w-4xl mx-auto animate-in fade-in duration-300">
            <div className="flex items-center justify-center p-6 md:p-10 rounded-3xl bg-zinc-900/80 border-2 border-amber-500/40 shadow-xl w-full text-xl sm:text-2xl md:text-3xl font-bold leading-relaxed min-h-[140px] text-white">
              &ldquo;{exercise?.presentedSentence}&rdquo;
            </div>

            <div className="text-center w-full space-y-4">
              <div className="space-y-1">
                <p className="font-black uppercase tracking-widest text-amber-300 text-lg sm:text-2xl">
                  {currentTeam.name}, what is your verdict?
                </p>
                <p className="text-muted-foreground font-mono text-xs sm:text-sm">Stakes: $100</p>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => handleJudge(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase shadow-lg h-14 md:h-16 px-8 md:px-12 text-base md:text-xl rounded-2xl transition-transform hover:scale-105"
                  size="lg"
                >
                  <ThumbsUp className="mr-2.5 h-5 w-5" />
                  Correct
                </Button>
                <Button
                  onClick={() => handleJudge(false)}
                  variant="destructive"
                  className="font-black uppercase shadow-lg h-14 md:h-16 px-8 md:px-12 text-base md:text-xl rounded-2xl transition-transform hover:scale-105"
                  size="lg"
                >
                  <ThumbsDown className="mr-2.5 h-5 w-5" />
                  Incorrect
                </Button>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <Button
                  onClick={handlePass}
                  variant="secondary"
                  size="sm"
                  disabled={currentTeam.passes <= 0}
                  className="h-10 px-5 text-sm font-semibold rounded-xl"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Pass Turn ({currentTeam.passes} passes left)
                </Button>
              </div>
            </div>
          </div>
        );

      case "judged":
        return (
          <div className="text-center w-full max-w-3xl mx-auto flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
            <Alert
              className={cn(
                "border-2 rounded-2xl shadow-2xl p-6 text-left",
                judgement?.correct ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-100" : "bg-rose-950/80 border-rose-500/50 text-rose-100"
              )}
            >
              <AlertTitle className="font-black uppercase text-xl mb-2 flex items-center gap-2">
                {judgement?.correct ? <CheckCircle className="h-6 w-6 text-emerald-400" /> : <XCircle className="h-6 w-6 text-rose-400" />}
                {judgement?.correct ? "Ruling Upheld!" : "Ruling Overturned!"}
              </AlertTitle>
              <AlertDescription className="text-sm sm:text-base leading-relaxed">
                <p className="font-semibold mb-2">{judgement?.message}</p>
                <p className="opacity-90">{exercise?.explanation}</p>
              </AlertDescription>
            </Alert>
            <Button onClick={() => advanceTurn(true)} size="lg" className="h-12 px-8 font-black uppercase text-base rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg">
              Next Auction Lot →
            </Button>
          </div>
        );

      case "event":
        return (
          <div className="text-center w-full max-w-2xl mx-auto flex flex-col items-center gap-6 animate-in zoom-in duration-300 p-6 bg-zinc-900/80 border-2 border-purple-500/40 rounded-3xl">
            <div className="p-4 rounded-full bg-purple-500/20 text-purple-400">
              {randomEvent?.type === 'steal' ? <Skull className="h-12 w-12 text-rose-400" /> : <Gift className="h-12 w-12 text-emerald-400" />}
            </div>
            <h3 className="text-2xl font-black uppercase text-white tracking-wider">Market Disruption!</h3>
            <p className="text-lg text-purple-200">{randomEvent?.message}</p>
            <Button onClick={() => advanceTurn(false)} size="lg" className="h-12 px-8 font-black uppercase text-base rounded-xl bg-purple-600 hover:bg-purple-500 text-white">
              Resume Auction Floor
            </Button>
          </div>
        );

      case "finished":
        const sortedTeams = [...teams].sort((a, b) => b.money - a.money);
        const winner = sortedTeams[0];

        return (
          <div className="text-center w-full max-w-xl mx-auto flex flex-col items-center gap-6 animate-in zoom-in duration-500 py-6">
            <div className="h-20 w-20 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl">
              <Gavel className="h-10 w-10 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">Auction Closed!</h2>
              <p className="text-amber-300 font-bold text-lg">{winner.name} Dominates the Floor with ${winner.money}!</p>
            </div>

            <div className="w-full bg-zinc-900/60 rounded-3xl p-5 border border-white/10 space-y-2">
              {sortedTeams.map((t, idx) => (
                <div key={t.name} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.03]">
                  <span className="font-bold text-sm text-white">{idx + 1}. {t.name}</span>
                  <span className="font-mono font-black text-amber-300 text-base">${t.money}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 w-full justify-center">
              <Button onClick={() => setGameState("idle")} className="flex-1 h-12 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl">
                Return to Grand Hall
              </Button>
              <Button variant="outline" asChild className="flex-1 h-12 border-white/20 text-white font-bold rounded-xl">
                <Link href="/games">Back to Games</Link>
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn(
      "w-full flex-1 min-h-[calc(100dvh-4.5rem)] transition-all duration-500 flex flex-col justify-between bg-zinc-950/95 backdrop-blur-2xl border border-amber-500/20 shadow-2xl overflow-y-auto overflow-x-hidden text-white",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen bg-black" : "rounded-2xl md:rounded-3xl"
    )}>
      {/* Universal Header with Back to Games & In-game Abort */}
      <CardHeader className="z-20 bg-zinc-950/80 backdrop-blur-md border-b border-amber-500/20 px-3 sm:px-6 py-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              asChild 
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-bold bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 border-amber-500/30 hover:border-amber-400 rounded-xl"
            >
              <Link href="/games" className="flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Games</span>
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Gavel className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-400">
                  {game.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-[11px] font-medium text-amber-300/70">
                  <span>Grammar Auction Syndicate</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {isPlaying && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetGame}
                className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-bold bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-500/40 rounded-xl flex items-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5 text-red-400" />
                <span>Abort Game</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 text-amber-300/70 hover:text-white rounded-xl"
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Main Content: items-stretch & justify-start */}
      <CardContent className="flex-1 flex flex-col items-stretch justify-start p-3 sm:p-6 lg:p-8 z-10 relative overflow-y-auto w-full max-w-6xl mx-auto space-y-6 pb-16">
        {isPlaying && (
          <div className={cn(
            "w-full grid gap-2.5 sm:gap-4",
            teams.length === 2 && "grid-cols-2",
            teams.length === 3 && "grid-cols-3",
            teams.length >= 4 && "grid-cols-2 sm:grid-cols-4"
          )}>
            {teams.map((team, index) => (
              <div 
                key={index} 
                className={cn(
                  "p-3 sm:p-4 rounded-2xl border-2 transition-all",
                  turn === index && gameState === "turn"
                    ? "border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10 scale-[1.02]"
                    : "border-white/10 bg-zinc-900/40 opacity-75"
                )}
              >
                <p className="truncate font-mono font-bold uppercase text-[11px] text-amber-300/70">{team.name}</p>
                <p className="text-white font-black text-xl sm:text-2xl my-0.5">${team.money}</p>
                <p className="text-muted-foreground text-[10px] sm:text-xs">{team.passes} passes left</p>
              </div>
            ))}
          </div>
        )}

        <div className="w-full flex-1">
          {renderContent()}
        </div>
      </CardContent>

      <CardFooter className="z-20 bg-zinc-950/80 backdrop-blur-md border-t border-amber-500/20 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-amber-300/60 shrink-0">
        <div className="flex items-center gap-2">
          <Gavel className="h-3.5 w-3.5 text-amber-400" />
          <span>AUCTION ACTION // SYNDICATE EXCHANGE</span>
        </div>
        <Link href="/games" className="hover:text-amber-200 transition-colors">
          ← Exit to Games Hub
        </Link>
      </CardFooter>
    </Card>
  );
}
