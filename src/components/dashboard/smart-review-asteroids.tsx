"use client";

import { useState } from "react";
import {
  useSmartReviewAsteroids,
  AsteroidItem,
} from "@/hooks/use-smart-review-asteroids";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Loader2,
  Radio,
  PlusCircle,
  Volume2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function SmartReviewAsteroidsWidget() {
  const { asteroids, isLoading, error, submitReviewAttempt, spawnTestAsteroid } =
    useSmartReviewAsteroids();
  const { toast } = useToast();

  const [activeAsteroid, setActiveAsteroid] = useState<AsteroidItem | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{
    success: boolean;
    text: string;
  } | null>(null);

  const handleOpenChallenge = (asteroid: AsteroidItem) => {
    setActiveAsteroid(asteroid);
    setSelectedOption("");
    setResultMessage(null);
  };

  const handleAnswerSubmit = async () => {
    if (!activeAsteroid || !selectedOption) return;
    setIsSubmitting(true);

    try {
      const res = await submitReviewAttempt(activeAsteroid, selectedOption);
      if (res.status === "DESTROYED") {
        setResultMessage({
          success: true,
          text: `💥 KABOOM! The asteroid for "${activeAsteroid.word}" was shattered completely! Mastery achieved.`,
        });
        toast({
          title: "Asteroid Destroyed!",
          description: `You mastered "${activeAsteroid.word}".`,
        });
        setTimeout(() => setActiveAsteroid(null), 1400);
      } else if (res.status === "PROMOTED") {
        setResultMessage({
          success: true,
          text: `🚀 Correct! Promoted to Stage ${res.nextStage}. Next orbital review scheduled.`,
        });
        toast({
          title: "Orbital Advancement",
          description: `Stage ${res.nextStage} reached for "${activeAsteroid.word}".`,
        });
        setTimeout(() => setActiveAsteroid(null), 1200);
      } else if (res.status === "DEMOTED") {
        setResultMessage({
          success: false,
          text: `⚠️ Incorrect! Asteroid demoted back to Stage 1 (5m cycle).`,
        });
        toast({
          variant: "destructive",
          title: "Incorrect Answer",
          description: `Demoted back to Stage 1.`,
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestSpawn = async () => {
    const samples = [
      { word: "Nebula", def: "A giant cloud of dust and gas in space", wrong: "A small rocky asteroid" },
      { word: "Ephemeral", def: "Lasting for a very short time", wrong: "Permanent and eternal" },
      { word: "Resilient", def: "Able to withstand or recover quickly from difficult conditions", wrong: "Fragile and easily broken" },
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    await spawnTestAsteroid(pick.word, pick.def, pick.wrong);
    toast({
      title: "Asteroid Inbound! ☄️",
      description: `Simulated mistake for "${pick.word}". Document written to Firestore.`,
    });
  };

  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-950/80 via-indigo-950/20 to-slate-950/90">
      {/* Background celestial glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="text-[11px] uppercase font-black tracking-widest text-indigo-400">
              Spaced-Repetition System (SM-2)
            </span>
          </div>
          <h3 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
            <span>AI Smart-Review Asteroids</span>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-black text-xs">
              {asteroids.length} In Orbit
            </Badge>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real-time listener tracking vocabulary mistakes ready for spaced-interval review.
          </p>
        </div>

        <Button
          onClick={handleTestSpawn}
          variant="outline"
          size="sm"
          className="bg-indigo-950/40 border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-900/40 rounded-xl font-bold text-xs h-9"
          title="Simulate game mistake and spawn test asteroid"
        >
          <PlusCircle className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
          Simulate Game Mistake
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8 text-indigo-400 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-xs font-bold">Scanning orbital trajectories...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 text-rose-300 text-xs">
          <ShieldAlert className="h-4 w-4 inline mr-1.5" />
          {error}
        </div>
      ) : asteroids.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 flex flex-col items-center justify-center">
          <Sparkles className="h-8 w-8 text-indigo-400/60 mb-2" />
          <p className="text-sm font-bold text-slate-300">Orbit Cleared!</p>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            No active asteroids require review right now (next_review_at &gt; current time). Make a mistake in any game or click "Simulate Game Mistake" to trigger a cosmic challenge.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {asteroids.map((asteroid) => {
            const stage = asteroid.srs_stage || 1;
            const stageLabels: Record<number, string> = {
              1: "Stage 1 (5m)",
              2: "Stage 2 (20m)",
              3: "Stage 3 (1h)",
              4: "Stage 4 (24h)",
            };

            return (
              <div
                key={asteroid.id}
                onClick={() => handleOpenChallenge(asteroid)}
                className="group relative p-5 rounded-2xl border border-indigo-500/20 bg-slate-900/60 hover:bg-slate-900/90 hover:border-amber-500/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-2xl animate-pulse">☄️</span>
                    <Badge
                      variant="outline"
                      className="bg-indigo-500/10 border-indigo-500/30 text-indigo-300 font-extrabold text-[10px]"
                    >
                      {stageLabels[stage] || `Stage ${stage}`}
                    </Badge>
                  </div>
                  <h4 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors capitalize">
                    {asteroid.word}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {asteroid.challenge_data?.error_analysis ||
                      asteroid.challenge_data?.challenge_payload?.question}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                    <Flame className="h-3 w-3" /> Ready to shatter
                  </span>
                  <span className="text-[10px] font-black uppercase text-indigo-400 group-hover:underline">
                    Intercept &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog
        open={Boolean(activeAsteroid)}
        onOpenChange={(open) => !open && setActiveAsteroid(null)}
      >
        <DialogContent className="glass-card border border-indigo-500/30 rounded-3xl max-w-lg bg-slate-950/95 backdrop-blur-2xl text-white">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">☄️</span>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-black text-[11px]">
                Stage {activeAsteroid?.srs_stage || 1} Micro-Challenge
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-white capitalize">
              Target: {activeAsteroid?.word}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs leading-relaxed">
              {activeAsteroid?.challenge_data?.error_analysis}
            </DialogDescription>
          </DialogHeader>

          {activeAsteroid && (
            <div className="space-y-5 my-2">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20">
                <p className="text-sm font-bold text-indigo-200">
                  {activeAsteroid.challenge_data?.challenge_payload?.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {activeAsteroid.challenge_data?.challenge_payload?.options?.map(
                  (opt: string, idx: number) => {
                    const isSelected = selectedOption === opt;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedOption(opt)}
                        disabled={isSubmitting}
                        className={cn(
                          "w-full text-left p-3.5 rounded-xl border transition-all text-xs font-semibold flex items-center gap-3",
                          isSelected
                            ? "border-amber-400 bg-amber-500/10 text-amber-200 ring-2 ring-amber-400/20"
                            : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-indigo-500/40 hover:bg-slate-900"
                        )}
                      >
                        <span
                          className={cn(
                            "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 border",
                            isSelected
                              ? "border-amber-400 bg-amber-400 text-slate-950"
                              : "border-slate-700 bg-slate-800 text-slate-400"
                          )}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 leading-relaxed">{opt}</span>
                      </button>
                    );
                  }
                )}
              </div>

              {resultMessage && (
                <div
                  className={cn(
                    "p-3 rounded-xl text-xs font-bold flex items-center gap-2",
                    resultMessage.success
                      ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-300"
                      : "bg-rose-950/40 border border-rose-500/30 text-rose-300"
                  )}
                >
                  {resultMessage.success ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{resultMessage.text}</span>
                </div>
              )}

              <Button
                onClick={handleAnswerSubmit}
                disabled={!selectedOption || isSubmitting}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black shadow-lg shadow-indigo-600/20"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Flame className="h-4 w-4 mr-2" />
                )}
                Fire Cosmic Counter-Signal
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
