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
        <div className="flex justify-center pt-2">
          <Badge variant="outline" className={cn(isFullscreen && "text-xl px-6 py-1")}>{game.level.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center",
          isFullscreen ? "min-h-[60vh] max-w-6xl mx-auto w-full px-12" : "min-h-[24rem] p-6"
      )}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Ready to show off your drawing skills?</p>
            <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
              <Sparkles className={cn("mr-2", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
              Start Drawing
            </Button>
          </div>
        )}
        {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
                 isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-lg"
             )}>
                <h3 className={cn("font-bold text-center mb-4", isFullscreen ? "text-4xl" : "text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-4", isFullscreen ? "text-2xl" : "text-base")}>
                    <p>1. This is a team game. One person is the "artist" and the others are "guessers".</p>
                    <p>2. The artist will get a secret word to draw. Click "Show my word" to see it.</p>
                    <p>3. Use the tools to draw clues. <strong>No letters or numbers allowed!</strong></p>
                    <p>4. Teammates must guess the word before time runs out.</p>
                </div>
                <Button onClick={handleStartGame} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Initialize Canvas</Button>
            </div>
        )}
        {gameState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-6">
            <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
            <p className={cn("text-muted-foreground animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>Selecting artistic prompt...</p>
          </div>
        )}
        {gameState === "playing" && prompt && (
          <div className={cn("flex w-full flex-col gap-8", isFullscreen ? "lg:flex-row max-w-7xl" : "lg:flex-row")}>
            <div className="flex flex-grow flex-col gap-4">
              <div className={cn("flex items-center justify-center rounded-2xl bg-muted/20 backdrop-blur-sm border-2 border-primary/20", isFullscreen ? "h-20" : "h-12")}>
                {showPrompt ? (
                  <div className="flex items-center gap-4">
                    <p className={cn("font-black uppercase tracking-widest", isFullscreen ? "text-4xl" : "text-xl")}>
                      {prompt.prompt}
                      <span className={cn("font-medium text-muted-foreground lowercase ml-4 italic", isFullscreen ? "text-2xl" : "text-base")}>
                        ({prompt.category})
                      </span>
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPrompt(false)}
                      className={cn(isFullscreen && "h-12 w-12")}
                    >
                      <EyeOff className={cn(isFullscreen && "h-8 w-8")} />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => setShowPrompt(true)}
                    className={cn("font-black uppercase", isFullscreen && "h-16 px-10 text-2xl rounded-xl")}
                  >
                    <Eye className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                    Show my secret word
                  </Button>
                )}
              </div>
               <div className={cn(
                   "w-full overflow-hidden rounded-3xl border-4 bg-white shadow-2xl relative",
                   isFullscreen ? "aspect-video" : "aspect-video"
               )}>
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
            <div className={cn("flex w-full flex-col gap-6", isFullscreen ? "lg:w-80" : "lg:w-48")}>
              <h3 className={cn("font-black uppercase tracking-widest text-primary", isFullscreen ? "text-2xl" : "text-sm")}>
                Artillery
              </h3>
              <div className={cn("grid grid-cols-4 gap-3", isFullscreen ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    onClick={() => setStrokeColor(color)}
                    className={cn(
                        "rounded-full border-4 shadow-md transition-transform hover:scale-110",
                        isFullscreen ? "h-14 w-14" : "h-10 w-10"
                    )}
                    style={{
                      backgroundColor: color,
                      borderColor:
                        strokeColor === color
                          ? "hsl(var(--primary))"
                          : "transparent",
                    }}
                    aria-label={`Set color to ${color}`}
                  ></button>
                ))}
              </div>
              <div className="space-y-4">
                <Label className={cn("font-black uppercase text-xs tracking-widest", isFullscreen && "text-lg")}>Brush Density</Label>
                <Slider
                  min={2}
                  max={40}
                  step={2}
                  value={[strokeWidth]}
                  onValueChange={(value) => setStrokeWidth(value[0])}
                  className={cn(isFullscreen && "py-4")}
                />
              </div>
              <div className="flex flex-col gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => canvasRef.current?.undo()}
                  className={cn("font-black uppercase border-2", isFullscreen && "h-16 text-xl rounded-xl")}
                >
                  <Undo className={cn("mr-3", isFullscreen ? "h-8 w-8" : "h-4 w-4")} />
                  Undo Last
                </Button>
                <Button
                  variant="outline"
                  onClick={() => canvasRef.current?.clearCanvas()}
                  className={cn("font-black uppercase border-2", isFullscreen && "h-16 text-xl rounded-xl")}
                >
                  <Trash2 className={cn("mr-3", isFullscreen ? "h-8 w-8" : "h-4 w-4")} />
                  Scrub Board
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-7xl mx-auto w-full pb-16")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
          <Link href="/games">Abort Session</Link>
        </Button>
        {gameState === "playing" && (
          <Button onClick={handleStartGame} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}>
            <Wand2 className={cn("mr-3", isFullscreen ? "h-8 w-8" : "h-4 w-4")} />
            Next Word
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
