"use client";

import * as React from "react";
import dynamic from "next/dynamic";
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
import { Loader2, Sparkles, Wand2, Trash2, Undo, Eye, EyeOff, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import type { ReactSketchCanvasRef } from "react-sketch-canvas";
import Link from "next/link";
import { generatePictionaryPrompt } from "@/ai/flows/generate-pictionary-prompt";
import { cn } from "@/lib/utils";


const DynamicCanvas = dynamic(
  () => import("react-sketch-canvas").then((mod) => mod.ReactSketchCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <Loader2 className="animate-spin" />
      </div>
    ),
  }
);

type GameState = "idle" | "loading" | "playing" | "instructions";
type GeneratePictionaryPromptOutput = {
  prompt: string;
  category: string;
};

export function PictionaryParty({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [prompt, setPrompt] =
    React.useState<GeneratePictionaryPromptOutput | null>(null);
  const [usedPrompts, setUsedPrompts] = React.useState<string[]>([]);
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [strokeColor, setStrokeColor] = React.useState("#000000");
  const [strokeWidth, setStrokeWidth] = React.useState(4);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const canvasRef = React.useRef<ReactSketchCanvasRef>(null);
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleStartGame = async () => {
    setGameState("loading");
    setPrompt(null);
    setShowPrompt(false);
    await canvasRef.current?.clearCanvas();
    try {
      const result = await generatePictionaryPrompt({
        difficulty: game.level,
        usedPrompts: usedPrompts,
      });

      setPrompt(result);
      setUsedPrompts((prev) => [...prev, result.prompt]);
      setGameState("playing");

    } catch (error) {
      console.error("Failed to generate prompt:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not start a new game. Please try again.",
      });
      setGameState("idle");
    }
  };

  const Icon = game.icon;

  const colorPalette = [
    "#000000",
    "#EF4444",
    "#3B82F6",
    "#22C55E",
    "#EAB308",
    "#A855F7",
    "#EC4899",
  ];

  return (
    <Card className={cn(
        "w-full flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full flex flex-col justify-between overflow-y-auto overflow-x-hidden rounded-2xl md:rounded-3xl border border-border/20 shadow-xl bg-card/80 backdrop-blur-sm transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none p-2 sm:p-6 bg-background"
      )}>
      <CardHeader className="text-center relative shrink-0 p-4 sm:p-6">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 h-auto p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        {!isFullscreen && (
            <div className="flex justify-center mb-2 sm:mb-4">
                <Icon className="w-10 h-10 sm:w-14 sm:h-14 text-primary" />
            </div>
        )}
        <CardTitle className={cn("font-black tracking-tight uppercase text-xl sm:text-3xl md:text-4xl", isFullscreen && "text-3xl sm:text-5xl")}>{game.title}</CardTitle>
        <CardDescription className={cn("text-xs sm:text-sm max-w-xl mx-auto", isFullscreen && "text-base sm:text-xl mt-1")}>{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
          <Badge variant="outline" className={cn("text-xs sm:text-sm px-3 py-0.5", isFullscreen && "text-base px-4 py-1")}>{game.level.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-5xl mx-auto overflow-y-auto">
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4 w-full max-w-md text-center py-6">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-xl sm:text-2xl" : "text-sm sm:text-base")}>Ready to show off your drawing skills?</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Button onClick={handleStartGame} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 sm:h-14 px-6 text-sm sm:text-base rounded-2xl shadow-lg", isFullscreen && "h-16 px-10 text-xl")}>
                <Sparkles className="mr-2 h-5 w-5" /> Start Drawing
              </Button>
              <Button variant="outline" onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("h-12 sm:h-14 px-6 text-sm sm:text-base rounded-2xl font-bold border-2", isFullscreen && "h-16 px-10 text-xl")}>
                How to Play
              </Button>
            </div>
          </div>
        )}
        {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-2xl mx-auto border border-border/20 shadow-inner w-full max-w-lg p-5 sm:p-8",
                 isFullscreen && "max-w-2xl p-8 sm:p-12"
             )}>
                <h3 className={cn("font-bold text-center", isFullscreen ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-3 text-muted-foreground", isFullscreen ? "text-base sm:text-lg" : "text-xs sm:text-sm")}>
                    <p>1. This is a team game. One person is the "artist" and the others are "guessers".</p>
                    <p>2. The artist will get a secret word to draw. Click "Show my word" to see it.</p>
                    <p>3. Use the tools to draw clues. <strong>No letters or numbers allowed!</strong></p>
                    <p>4. Teammates must guess the word before time runs out.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
                  <Button onClick={handleStartGame} size="lg" className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 rounded-xl">Initialize Canvas</Button>
                  <Button variant="outline" onClick={() => setGameState('idle')} size="lg" className="h-12 rounded-xl">Back</Button>
                </div>
            </div>
        )}
        {gameState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 py-12">
            <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-16 w-16" : "h-10 w-10 sm:h-12 sm:w-12")} />
            <p className={cn("text-muted-foreground animate-pulse text-sm sm:text-base", isFullscreen && "text-xl")}>Selecting artistic prompt...</p>
          </div>
        )}
        {gameState === "playing" && prompt && (
          <div className="flex w-full flex-col lg:flex-row gap-4 sm:gap-6 max-w-5xl items-stretch">
            <div className="flex flex-grow flex-col gap-3 sm:gap-4 min-w-0">
              <div className={cn("flex items-center justify-center p-3 rounded-2xl bg-muted/20 backdrop-blur-sm border-2 border-primary/20", isFullscreen && "p-4")}>
                {showPrompt ? (
                  <div className="flex items-center gap-3 flex-wrap justify-center">
                    <p className={cn("font-black uppercase tracking-wider text-base sm:text-xl md:text-2xl", isFullscreen && "text-3xl")}>
                      {prompt.prompt}
                      <span className="font-medium text-muted-foreground lowercase ml-2 italic text-xs sm:text-sm">
                        ({prompt.category})
                      </span>
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPrompt(false)}
                      className="h-8 w-8"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => setShowPrompt(true)}
                    className="font-black uppercase h-10 sm:h-12 px-6 rounded-xl text-xs sm:text-sm"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Show secret word
                  </Button>
                )}
              </div>
               <div className="w-full overflow-hidden rounded-2xl sm:rounded-3xl border-2 sm:border-4 bg-white shadow-xl relative min-h-[240px] h-[35vh] sm:h-[45vh] max-h-[500px]">
                 <DynamicCanvas
                    ref={canvasRef}
                    strokeColor={strokeColor}
                    strokeWidth={strokeWidth}
                    className="!h-full !w-full"
                    width="100%"
                    height="100%"
                  />
               </div>
            </div>
            <div className="flex w-full lg:w-56 flex-col gap-3 sm:gap-4 shrink-0 bg-muted/10 p-3 sm:p-4 rounded-2xl border border-border/20">
              <h3 className="font-black uppercase tracking-wider text-primary text-xs sm:text-sm">
                Palette & Tools
              </h3>
              <div className="flex flex-wrap lg:grid lg:grid-cols-4 gap-2 justify-center">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    onClick={() => setStrokeColor(color)}
                    className={cn(
                        "rounded-full border-2 sm:border-3 shadow-md transition-transform hover:scale-110 h-8 w-8 sm:h-9 sm:w-9",
                        strokeColor === color && "ring-2 ring-primary scale-110"
                    )}
                    style={{
                      backgroundColor: color,
                      borderColor: strokeColor === color ? "white" : "transparent",
                    }}
                    aria-label={`Set color to ${color}`}
                  ></button>
                ))}
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase">
                  <span>Brush Size</span>
                  <span>{strokeWidth}px</span>
                </div>
                <Slider
                  min={2}
                  max={40}
                  step={2}
                  value={[strokeWidth]}
                  onValueChange={(value) => setStrokeWidth(value[0])}
                  className="py-1"
                />
              </div>
              <div className="flex flex-row lg:flex-col gap-2 mt-auto">
                <Button
                  variant="outline"
                  onClick={() => canvasRef.current?.undo()}
                  className="flex-1 font-bold uppercase border h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
                >
                  <Undo className="mr-1.5 h-4 w-4" />
                  Undo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => canvasRef.current?.clearCanvas()}
                  className="flex-1 font-bold uppercase border h-10 sm:h-11 rounded-xl text-xs sm:text-sm text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10 w-full shrink-0">
        <Button variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
          <Link href="/games">Exit Game</Link>
        </Button>
        {gameState === "playing" && (
          <Button onClick={handleStartGame} className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-lg h-11 sm:h-12 px-8 rounded-xl">
            <Wand2 className="mr-2 h-4 w-4" />
            Next Word
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
