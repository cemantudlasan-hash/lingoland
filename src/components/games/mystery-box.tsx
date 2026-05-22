'use client';

import { shuffleArray } from "@/lib/shuffle";

import * as React from 'react';
import { getGameBySlug } from '@/lib/games';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '../ui/card';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { generateMysteryBoxItem } from '@/ai/flows/generate-mystery-box-item';
import {
  Loader2,
  Sparkles,
  UserPlus,
  Trash2,
  HelpCircle,
  CheckCircle,
  XCircle,
  Gift,
  Bomb,
  Repeat,
  Maximize,
  Minimize,
  Trophy,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type GameState = 'setup' | 'loading' | 'playing' | 'finished' | 'instructions' | 'idle';
type Team = { name: string; score: number };
type Box = { id: number; label: string; question: string; answer: string; explanation: string; points: number; opened: boolean };

const boxPointValues = [
    -500, -400, -300, -250, -200, -150, -100, -50, 
    50, 100, 150, 200, 250, 300, 350, 400, 450, 500,
    600, 700, 800, 900, 1000, 1500, 2000, -1000
];

const topics = [
    "Verb Tenses (Past, Present, Future)",
    "Prepositions of Time and Place",
    "Conditional Sentences (First and Second)",
    "Phrasal Verbs",
    "Reported Speech",
    "Passive Voice",
    "Articles (a, an, the)",
    "Modal Verbs (can, could, should)"
];
const BOX_COUNT = 26;

export function MysteryBox({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>('idle');
  const [teams, setTeams] = React.useState<Team[]>([
    { name: 'Team 1', score: 0 },
    { name: 'Team 2', score: 0 },
  ]);
  const [boxes, setBoxes] = React.useState<Box[]>([]);
  const [currentTurn, setCurrentTurn] = React.useState(0);
  const [selectedBox, setSelectedBox] = React.useState<Box | null>(null);
  const [userAnswer, setUserAnswer] = React.useState('');
  const [usedQuestions, setUsedQuestions] = React.useState<string[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const [showQuestionDialog, setShowQuestionDialog] = React.useState(false);
  const [showDecisionDialog, setShowDecisionDialog] = React.useState(false);
  const [showIncorrectFeedbackDialog, setShowIncorrectFeedbackDialog] = React.useState(false);
  const [showRevealDialog, setShowRevealDialog] = React.useState(false);
  
  const [revealData, setRevealData] = React.useState<{ points: number; teamName: string; action: 'kept' | 'given' } | null>(null);


  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleStartGame = async () => {
    if (teams.length < 2) {
      toast({
        variant: 'destructive',
        title: 'Add more teams',
        description: 'You need at least two teams to play.',
      });
      return;
    }
    setGameState('loading');
    setIsGenerating(true);
    setBoxes([]);
    setUsedQuestions([]);

    try {
      const newBoxesData: Omit<Box, 'id' | 'label' | 'points' | 'opened'>[] = [];
      const currentUsedQuestions: string[] = [];

      for (let i = 0; i < BOX_COUNT; i++) {
        const item = await generateMysteryBoxItem({
          topic: topics[Math.floor(Math.random() * topics.length)],
          difficulty: 'easy',
          usedQuestions: currentUsedQuestions,
        });
        newBoxesData.push(item);
        currentUsedQuestions.push(item.question);
      }
      
      setUsedQuestions(currentUsedQuestions);

      const shuffledPoints = shuffleArray([...boxPointValues]);

      const finalBoxes = newBoxesData.map((item, index) => ({
        id: index,
        label: String.fromCharCode(65 + index), // A-Z
        ...item,
        points: shuffledPoints[index],
        opened: false,
      }));

      setBoxes(finalBoxes);
      setCurrentTurn(0);
      setTeams(teams.map((t) => ({ ...t, score: 0 })));
      setGameState('playing');
    } catch (e) {
      console.error('Error generating game:', e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate game questions. Please try again.',
      });
      setGameState('setup');
    } finally {
        setIsGenerating(false);
    }
  };

  const handleBoxClick = (box: Box) => {
    if (box.opened || gameState !== 'playing') return;
    setSelectedBox(box);
    setShowQuestionDialog(true);
  };

  const handleCheckAnswer = () => {
    if (!selectedBox) return;
    const isCorrect = userAnswer.trim().toLowerCase() === selectedBox.answer.toLowerCase();
    
    setShowQuestionDialog(false);
    setUserAnswer('');

    if (isCorrect) {
      toast({ title: 'Correct!', className: 'bg-green-200 dark:bg-green-800' });
      setShowDecisionDialog(true);
    } else {
      setShowIncorrectFeedbackDialog(true);
    }
  };

  const handleKeepOrGive = (giveToTeamIndex?: number) => {
    if (!selectedBox) return;

    let targetTeamIndex: number;
    let action: 'kept' | 'given';

    if (giveToTeamIndex !== undefined) {
      targetTeamIndex = giveToTeamIndex;
      action = 'given';
    } else {
      targetTeamIndex = currentTurn;
      action = 'kept';
    }

    const newTeams = [...teams];
    newTeams[targetTeamIndex].score += selectedBox.points;
    setTeams(newTeams);

    setRevealData({ points: selectedBox.points, teamName: teams[targetTeamIndex].name, action });
    
    setShowDecisionDialog(false);
    setShowRevealDialog(true);
  };

  const handleNextTurn = () => {
    setShowRevealDialog(false);
    setShowIncorrectFeedbackDialog(false);
    setRevealData(null);
    
    if (selectedBox) {
        const newBoxes = boxes.map((b) => (b.id === selectedBox.id ? { ...b, opened: true } : b));
        setBoxes(newBoxes);

        const allOpened = newBoxes.every((b) => b.opened);
        if (allOpened) {
          setGameState('finished');
          return;
        }
    }

    setSelectedBox(null);
    setCurrentTurn((currentTurn + 1) % teams.length);
  };

  const handleTeamNameChange = (index: number, name: string) => {
    const newTeams = [...teams];
    newTeams[index].name = name;
    setTeams(newTeams);
  };

  const addTeam = () => {
    if (teams.length < 4) {
      setTeams([...teams, { name: `Team ${teams.length + 1}`, score: 0 }]);
    }
  };

  const removeTeam = (index: number) => {
    if (teams.length > 2) {
      setTeams(teams.filter((_, i) => i !== index));
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setUsedQuestions([]);
    setTeams([
      { name: 'Team 1', score: 0 },
      { name: 'Team 2', score: 0 },
    ]);
  };

  const Icon = game.icon;

  const renderContent = () => {
    switch (gameState) {
      case 'loading':
        return (
          <div className="flex flex-col items-center gap-6">
            <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
            <p className={cn("font-black animate-pulse uppercase tracking-widest", isFullscreen ? "text-4xl" : "text-lg")}>Loading Neural Vaults...</p>
          </div>
        );
      case 'setup':
        return (
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <h3 className="text-xl font-bold">Game Setup</h3>
            <div className="w-full space-y-2">
              <h4 className="font-bold">Teams</h4>
              {teams.map((team, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={team.name} onChange={(e) => handleTeamNameChange(index, e.target.value)} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTeam(index)}
                    disabled={teams.length <= 2}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addTeam}
                className="w-full"
                disabled={teams.length >= 4}
              >
                <UserPlus className="mr-2" />
                Add Team
              </Button>
            </div>
            <Button onClick={handleStartGame} size="lg" disabled={isGenerating} className="bg-primary text-white font-bold w-full h-14 text-xl rounded-2xl shadow-lg">
              {isGenerating ? <Loader2 className="mr-2 animate-spin"/> : <Sparkles className="mr-2" />}
              Generate Game
            </Button>
          </div>
        );
      case 'instructions':
        return (
          <div className={cn(
              "flex flex-col items-center gap-4 text-center bg-muted/50 rounded-lg border border-border/20 shadow-inner mx-auto",
              isFullscreen ? "p-16 max-w-4xl" : "p-8 max-w-lg"
          )}>
            <h3 className={cn("font-black uppercase tracking-tighter", isFullscreen ? "text-4xl" : "text-xl")}>MISSION INTEL</h3>
            <div className={cn("text-left space-y-4", isFullscreen ? "text-2xl" : "text-base")}>
              <p>1. On your turn, pick a mystery box from the grid.</p>
              <p>2. Answer the linguistic review question correctly.</p>
              <p>
                3. If correct, choose to either <strong>KEEP</strong> the box (and its hidden points) or <strong>GIVE</strong> it to an opponent.
              </p>
              <p>
                4. Points can be positive <strong>OR</strong> negative! Choose wisely.
              </p>
            </div>
            <Button onClick={() => setGameState('setup')} size="lg" className={cn("mt-8 bg-primary text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>
              Proceed to Setup
            </Button>
          </div>
        );
      case 'playing':
        return (
          <div className="w-full flex flex-col items-center gap-8">
            <div className={cn("font-black uppercase tracking-widest text-center", isFullscreen ? "text-5xl" : "text-2xl")}>
              IT'S <span className="text-primary">{teams[currentTurn].name}'S</span> TURN!
            </div>
            <div className={cn(
                "grid gap-4",
                isFullscreen 
                    ? "grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-6" 
                    : "grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2"
            )}>
              {boxes.map((box) => (
                <button
                  key={box.id}
                  onClick={() => handleBoxClick(box)}
                  disabled={box.opened}
                  className={cn(
                    'flex items-center justify-center rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-110 font-black text-white border-4 border-white/10',
                    isFullscreen ? "w-24 h-24 text-4xl" : "w-16 h-16 text-xl",
                    box.opened
                      ? 'bg-muted cursor-not-allowed opacity-30 border-none'
                      : 'bg-gradient-to-br from-purple-600 to-indigo-700 hover:shadow-indigo-500/50'
                  )}
                >
                  {box.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 'finished':
        const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
        return (
          <div className="text-center flex flex-col items-center gap-8 animate-in zoom-in duration-500">
            <Trophy className={cn("text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]", isFullscreen ? "h-48 w-48" : "h-24 w-24")} />
            <div className="space-y-2">
                <h2 className={cn("font-black uppercase tracking-tighter text-white", isFullscreen ? "text-7xl" : "text-4xl")}>Game Over!</h2>
                <p className={cn("font-black text-primary uppercase", isFullscreen ? "text-4xl" : "text-2xl")}>🎉 {sortedTeams[0].name} wins! 🎉</p>
            </div>
            <Card className={cn("w-full max-w-sm p-6 bg-card/50", isFullscreen && "max-w-xl p-12")}>
              <h3 className={cn("font-black uppercase tracking-widest text-muted-foreground mb-4", isFullscreen ? "text-2xl" : "text-sm")}>Final Stats</h3>
              <div className="flex flex-col gap-4">
                {sortedTeams.map((team) => (
                  <div key={team.name} className={cn("flex justify-between font-bold", isFullscreen ? "text-3xl" : "text-xl")}>
                    <span>{team.name}:</span>
                    <span className="text-primary">{team.score} pts</span>
                  </div>
                ))}
              </div>
            </Card>
            <Button onClick={handleStartGame} size="lg" disabled={isGenerating} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
              {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Repeat className="mr-2" />}
              Start New Mission
            </Button>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center gap-4">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Unlock the linguistic vaults. Test your luck!</p>
            <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
              <Sparkles className={cn("mr-2", isFullscreen ? "h-10 w-10" : "h-5 w-5")} /> Initialize
            </Button>
          </div>
        );
    }
  };

  return (
    <>
      <Card className={cn(
        "w-full transition-all duration-500 flex flex-col",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-background justify-center" 
            : "max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border-border/20 shadow-lg"
      )}>
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-auto p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
          </Button>
          {!isFullscreen && (
              <div className="flex justify-center mb-4">
                  <Icon className="w-16 h-16 text-primary" />
              </div>
          )}
          <CardTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-6xl" : "text-3xl")}>{game.title}</CardTitle>
          <CardDescription className={cn(isFullscreen && "text-2xl mt-2")}>{game.description}</CardDescription>
        </CardHeader>
        <CardContent className={cn(
            "space-y-6 text-center flex flex-col items-center justify-center",
            isFullscreen ? "min-h-[60vh] max-w-6xl mx-auto w-full px-12" : "min-h-[24rem] p-6"
        )}>
          {gameState !== 'setup' && gameState !== 'loading' && gameState !== 'instructions' && gameState !== 'idle' && (
            <div
              className={cn(
                'w-full grid gap-4 mb-8 text-lg font-black text-center',
                teams.length === 2 && 'grid-cols-2',
                teams.length === 3 && 'grid-cols-3',
                teams.length >= 4 && 'grid-cols-4',
                isFullscreen && "max-w-5xl mx-auto"
              )}
            >
              {teams.map((team, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-4 rounded-2xl border-4 transition-all duration-300',
                    currentTurn === index
                      ? 'border-primary bg-primary/10 scale-105 shadow-lg shadow-primary/20'
                      : 'border-transparent bg-muted/50 opacity-70',
                    isFullscreen && "p-6 text-2xl"
                  )}
                >
                  <p className="truncate uppercase tracking-widest">{team.name}</p>
                  <p className={cn("text-primary", isFullscreen ? "text-4xl" : "text-xl")}>{team.score} pts</p>
                </div>
              ))}
            </div>
          )}
          {renderContent()}
        </CardContent>
        <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-6xl mx-auto w-full pb-16")}>
          <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
            <Link href="/games">Back to Library</Link>
          </Button>
          {gameState !== 'setup' &&
            gameState !== 'loading' &&
            gameState !== 'instructions' &&
            gameState !== 'idle' && (
              <Button variant="secondary" onClick={resetGame} size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 text-xl font-bold rounded-2xl")}>
                Reset Session
              </Button>
            )}
        </CardFooter>
      </Card>

      {/* Dialog for Question */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className={cn(isFullscreen ? "sm:max-w-3xl rounded-[3rem]" : "sm:max-w-lg")}>
          <DialogHeader>
            <DialogTitle className={cn("font-black uppercase tracking-widest", isFullscreen && "text-3xl")}>Neural Vault Challenge</DialogTitle>
            <DialogDescription className={cn("font-bold text-foreground leading-tight", isFullscreen ? "text-4xl py-10" : "text-xl py-4")}>
                {selectedBox?.question}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type decrypted answer..."
            className={cn("font-bold text-center", isFullscreen ? "h-20 text-3xl rounded-2xl" : "h-12")}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCheckAnswer();
              }
            }}
            autoFocus
          />
          <DialogFooter className="mt-6">
            <Button onClick={handleCheckAnswer} className={cn("font-black w-full h-14 text-xl uppercase", isFullscreen && "h-20 text-3xl rounded-3xl")}>Submit Decryption</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for Incorrect Answer */}
      <Dialog open={showIncorrectFeedbackDialog} onOpenChange={(open) => { if(!open) handleNextTurn(); setShowIncorrectFeedbackDialog(open); }}>
        <DialogContent className={cn(isFullscreen ? "sm:max-w-2xl rounded-[3rem] p-16" : "")}>
          <DialogHeader className="items-center text-center">
            <XCircle className={cn("text-destructive mb-4", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
            <DialogTitle className={cn("font-black uppercase", isFullscreen ? "text-5xl" : "text-2xl")}>Access Denied</DialogTitle>
            <DialogDescription className={cn("pt-6", isFullscreen && "text-3xl")}>
              <span className="block mb-4">The correct data was: <strong className="text-foreground uppercase italic">{selectedBox?.answer}</strong></span>
              <span className={cn("block text-muted-foreground", isFullscreen ? "text-xl mt-8" : "text-xs mt-2")}>{selectedBox?.explanation}</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8">
            <Button onClick={handleNextTurn} className={cn("w-full h-14 font-black uppercase", isFullscreen && "h-20 text-2xl rounded-3xl")}>Continue Mission</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for Decision */}
      <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
        <DialogContent className={cn(isFullscreen ? "sm:max-w-3xl rounded-[3rem] p-16" : "p-8")}>
          <DialogHeader className="items-center text-center">
            <CheckCircle className={cn("text-green-500 mb-4", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
            <DialogTitle className={cn("font-black uppercase", isFullscreen ? "text-5xl" : "text-2xl")}>Vault Unlocked!</DialogTitle>
            <DialogDescription className={cn("pt-4", isFullscreen ? "text-3xl" : "text-lg")}>
              This vault contains hidden data points. What will you do?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 mt-10">
            <Button onClick={() => handleKeepOrGive()} size="lg" className={cn("w-full bg-primary text-white font-black uppercase shadow-xl hover:scale-105 transition-transform", isFullscreen ? "h-24 text-3xl rounded-[2rem]" : "h-16")}>
              Keep for {teams[currentTurn].name}
            </Button>
            <div className="w-full flex flex-col items-center gap-4">
              <p className={cn("font-black text-muted-foreground uppercase tracking-widest", isFullscreen ? "text-2xl" : "text-sm")}>OR GIFT TO:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {teams.map(
                  (team, index) =>
                    index !== currentTurn && (
                      <Button
                        key={team.name}
                        variant="destructive"
                        onClick={() => handleKeepOrGive(index)}
                        className={cn("font-black uppercase h-12", isFullscreen && "h-20 text-xl rounded-2xl")}
                      >
                        {team.name}
                      </Button>
                    )
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for Revealing Points */}
      <Dialog open={showRevealDialog} onOpenChange={(open) => { if (!open) handleNextTurn(); setShowRevealDialog(open);}}>
        <DialogContent className={cn(isFullscreen ? "sm:max-w-3xl rounded-[3rem] p-24" : "p-12")}>
          <DialogHeader className="items-center text-center">
            <DialogTitle className={cn("font-black uppercase tracking-[0.2em]", isFullscreen ? "text-4xl" : "text-xl")}>Payload Result</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-8 py-10">
            {revealData?.points && revealData.points > 0 ? (
              <Gift className={cn("text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]", isFullscreen ? "h-48 w-48" : "h-24 w-24")} />
            ) : (
              <Bomb className={cn("text-destructive drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]", isFullscreen ? "h-48 w-48" : "h-24 w-24")} />
            )}
            <p
              className={cn(
                'font-black tracking-tighter',
                isFullscreen ? "text-[10vw]" : "text-7xl",
                revealData?.points && revealData.points > 0 ? 'text-green-500' : 'text-red-500'
              )}
            >
              {revealData?.points && revealData.points > 0 ? `+${revealData.points}` : revealData?.points}
            </p>
            <div className="text-center space-y-2">
                <p className={cn("font-black uppercase tracking-widest text-muted-foreground", isFullscreen ? "text-3xl" : "text-lg")}>Points Awarded</p>
                {revealData && <p className={cn("font-medium opacity-80", isFullscreen ? "text-2xl" : "text-sm")}>{revealData.teamName} {revealData.action === 'kept' ? 'kept' : 'received'} the payload.</p>}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleNextTurn} className={cn("w-full font-black uppercase h-14 text-xl", isFullscreen && "h-20 text-3xl rounded-3xl")}>Next Turn</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
