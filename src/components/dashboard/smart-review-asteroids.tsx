"use client";

import { useState, useEffect } from "react";
import {
  useSmartReviewAsteroids,
  AsteroidItem,
  shuffleArray,
} from "@/hooks/use-smart-review-asteroids";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
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
  PlusCircle,
  Clock,
  FastForward,
  UserCheck,
  HelpCircle,
  Compass,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function SmartReviewAsteroidsWidget() {
  const { user } = useAuth();
  const {
    activeAsteroids,
    scheduledAsteroids,
    isLoading,
    error,
    submitReviewAttempt,
    fastForwardAsteroid,
    spawnTestAsteroid,
  } = useSmartReviewAsteroids();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"ready" | "scheduled">("ready");
  const [activeAsteroid, setActiveAsteroid] = useState<AsteroidItem | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{
    success: boolean;
    text: string;
  } | null>(null);

  // When an asteroid is selected, shuffle options so the correct answer is randomized (never locked to Letter A)
  useEffect(() => {
    if (activeAsteroid?.challenge_data?.challenge_payload?.options) {
      const rawOptions = activeAsteroid.challenge_data.challenge_payload.options;
      setShuffledOptions(shuffleArray(rawOptions));
    } else {
      setShuffledOptions([]);
    }
    setSelectedOption("");
    setResultMessage(null);
  }, [activeAsteroid]);

  const handleOpenChallenge = (asteroid: AsteroidItem) => {
    setActiveAsteroid(asteroid);
  };

  const handleAnswerSubmit = async () => {
    if (!activeAsteroid || !selectedOption) return;
    setIsSubmitting(true);

    try {
      const res = await submitReviewAttempt(activeAsteroid, selectedOption);
      if (res.status === "DESTROYED") {
        setResultMessage({
          success: true,
          text: `💥 KABOOM! The asteroid for "${activeAsteroid.word}" was shattered completely! Vocabulary mastery achieved.`,
        });
        toast({
          title: "Asteroid Shattered! 💥",
          description: `Mastery achieved for "${activeAsteroid.word}". Permanently removed from your asteroid belt.`,
        });
        setTimeout(() => setActiveAsteroid(null), 1400);
      } else if (res.status === "PROMOTED") {
        setResultMessage({
          success: true,
          text: `🚀 Correct! Promoted to Stage ${res.nextStage}. The asteroid is now in orbital rest until its next SRS cycle.`,
        });
        toast({
          title: "Orbital Advancement 🚀",
          description: `Stage ${res.nextStage} reached for "${activeAsteroid.word}".`,
        });
        setTimeout(() => setActiveAsteroid(null), 1400);
      } else if (res.status === "DEMOTED") {
        setResultMessage({
          success: false,
          text: `⚠️ Incorrect! Asteroid demoted back to Stage 1 (5m reset) with a refreshed recall challenge.`,
        });
        toast({
          variant: "destructive",
          title: "Review Demoted",
          description: `Reset to Stage 1 (5-minute review interval).`,
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

  const handleFastForward = async (e: React.MouseEvent, asteroidId: string, word: string) => {
    e.stopPropagation();
    await fastForwardAsteroid(asteroidId);
    toast({
      title: "Fast-Forward Triggered ⏩",
      description: `Asteroid "${word}" is now immediately ready for your next stage review!`,
    });
    setActiveTab("ready");
  };

  const handleTestSpawn = async () => {
    const samples = [
      {
        word: "Ephemeral",
        def: "Lasting for a very short time; transient",
        wrong: "Permanent, enduring and immortal",
      },
      {
        word: "Resilient",
        def: "Able to withstand or recover quickly from difficult conditions",
        wrong: "Fragile, delicate and easily shattered",
      },
      {
        word: "Nebula",
        def: "A distinct body of interstellar clouds in deep space",
        wrong: "A small planetary moon",
      },
      {
        word: "Ubiquitous",
        def: "Present, appearing, or found everywhere simultaneously",
        wrong: "Extremely rare and secluded",
      },
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    await spawnTestAsteroid(pick.word, pick.def, pick.wrong);
    toast({
      title: "Asteroid Inbound! ☄️",
      description: `Spawned spaced-repetition challenge for "${pick.word}".`,
    });
    setActiveTab("ready");
  };

  const stageLabels: Record<number, { label: string; badge: string }> = {
    1: { label: "Stage 1 (5m)", badge: "border-red-500/30 bg-red-500/10 text-red-300" },
    2: { label: "Stage 2 (20m)", badge: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
    3: { label: "Stage 3 (1h)", badge: "border-blue-500/30 bg-blue-500/10 text-blue-300" },
    4: { label: "Stage 4 (24h)", badge: "border-purple-500/30 bg-purple-500/10 text-purple-300" },
  };

  const getRemainingTimeText = (timestamp: any) => {
    if (!timestamp) return "Soon";
    const targetMs = timestamp.toDate ? timestamp.toDate().getTime() : new Date(timestamp).getTime();
    const diffMs = targetMs - Date.now();
    if (diffMs <= 0) return "Ready Now";
    const minutes = Math.ceil(diffMs / (1000 * 60));
    if (minutes < 60) return `In ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `In ${hours}h ${minutes % 60}m`;
  };

  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Background ambient cosmic glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Spaced-Repetition System (SM-2)
            </span>

            {/* Current Authenticated User Isolation Badge */}
            <Badge className="bg-indigo-950/60 text-indigo-300 border-indigo-500/30 text-[10px] font-semibold flex items-center gap-1">
              <UserCheck className="h-3 w-3 text-indigo-400" />
              Account: {user?.displayName || user?.email?.split("@")[0] || "Active Learner"}
            </Badge>
          </div>

          <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
            <span>AI Smart-Review Asteroids</span>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-black text-xs">
              {activeAsteroids.length} Ready &bull; {scheduledAsteroids.length} Resting
            </Badge>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Target vocabulary mistakes with adaptive micro-challenges. Asteroids rest in orbit according to SM-2 curves (5m &rarr; 20m &rarr; 1h &rarr; 24h) and are strictly isolated to your account.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={handleTestSpawn}
            variant="outline"
            size="sm"
            className="bg-indigo-950/40 border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-900/40 rounded-xl font-bold text-xs h-9 shadow-lg shadow-indigo-950/30"
            title="Simulate game mistake and spawn test asteroid"
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
            Simulate Game Mistake
          </Button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-6 relative z-10">
        <button
          type="button"
          onClick={() => setActiveTab("ready")}
          className={cn(
            "text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5",
            activeTab === "ready"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          )}
        >
          <Flame className="h-3.5 w-3.5 text-amber-400" />
          Ready for Interception ({activeAsteroids.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("scheduled")}
          className={cn(
            "text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5",
            activeTab === "scheduled"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          )}
        >
          <Clock className="h-3.5 w-3.5 text-indigo-400" />
          Resting in Orbit ({scheduledAsteroids.length})
        </button>
      </div>

      {/* Content Area */}
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
      ) : activeTab === "ready" ? (
        activeAsteroids.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 flex flex-col items-center justify-center">
            <Sparkles className="h-8 w-8 text-indigo-400/60 mb-2" />
            <p className="text-sm font-bold text-slate-300">Active Orbit Cleared!</p>
            <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
              No asteroids require review right this second. Any reviewed words are currently resting in orbit under the SM-2 timing interval. Click &ldquo;Resting in Orbit&rdquo; to view or fast-forward them!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
            {activeAsteroids.map((asteroid) => {
              const stage = asteroid.srs_stage || 1;
              const meta = stageLabels[stage] || stageLabels[1];

              return (
                <div
                  key={asteroid.id}
                  onClick={() => handleOpenChallenge(asteroid)}
                  className="group relative cursor-pointer rounded-2xl p-4 bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-amber-400/50 transition-all duration-300 shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">☄️</span>
                        <h4 className="font-black text-white text-base tracking-tight capitalize group-hover:text-amber-300 transition-colors">
                          {asteroid.word}
                        </h4>
                      </div>
                      <Badge className={cn("text-[10px] font-black border uppercase", meta.badge)}>
                        {meta.label}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {asteroid.challenge_data?.challenge_payload?.question ||
                        asteroid.challenge_data?.error_analysis}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <Flame className="h-3 w-3" /> Ready to Review
                    </span>
                    <span className="text-[10px] font-black uppercase text-indigo-400 group-hover:underline">
                      Target &amp; Defend &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Scheduled Asteroids Tab */
        scheduledAsteroids.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 flex flex-col items-center justify-center">
            <Compass className="h-8 w-8 text-slate-600 mb-2" />
            <p className="text-sm font-bold text-slate-400">No Asteroids Currently In Rest</p>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              When you complete a review, the asteroid moves here to rest until its next spaced interval.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
            {scheduledAsteroids.map((asteroid) => {
              const stage = asteroid.srs_stage || 1;
              const meta = stageLabels[stage] || stageLabels[1];
              const timeRemaining = getRemainingTimeText(asteroid.next_review_at);

              return (
                <div
                  key={asteroid.id}
                  className="relative rounded-2xl p-4 bg-slate-900/40 border border-slate-800/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl opacity-70">🪐</span>
                        <h4 className="font-black text-slate-200 text-base tracking-tight capitalize">
                          {asteroid.word}
                        </h4>
                      </div>
                      <Badge className={cn("text-[10px] font-black border uppercase", meta.badge)}>
                        {meta.label}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {asteroid.challenge_data?.challenge_payload?.question}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold text-indigo-300 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-indigo-400" /> {timeRemaining}
                    </span>

                    <Button
                      onClick={(e) => handleFastForward(e, asteroid.id, asteroid.word)}
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[10px] font-bold text-amber-300 hover:text-white hover:bg-amber-500/20 rounded-lg flex items-center gap-1"
                      title="Fast-forward timestamp to test review right now"
                    >
                      <FastForward className="h-3 w-3" />
                      Test Review Now
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )
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

              {/* Shuffled Options (Randomized so Letter A is not always correct) */}
              <div className="space-y-2.5">
                {shuffledOptions.map((opt: string, idx: number) => {
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
                })}
              </div>

              {/* Feedback Alert */}
              {resultMessage && (
                <div
                  className={cn(
                    "p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold animate-in fade-in duration-300",
                    resultMessage.success
                      ? "bg-green-950/40 border-green-500/30 text-green-300"
                      : "bg-rose-950/40 border-rose-500/30 text-rose-300"
                  )}
                >
                  {resultMessage.success ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  )}
                  <span>{resultMessage.text}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveAsteroid(null)}
                  disabled={isSubmitting}
                  className="rounded-xl font-bold text-xs hover:bg-slate-900 text-slate-400"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAnswerSubmit}
                  disabled={!selectedOption || isSubmitting}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-slate-950 font-black rounded-xl text-xs h-10 px-5 shadow-lg shadow-orange-500/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <Flame className="h-4 w-4 mr-1.5" />
                  )}
                  Submit Defense
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
