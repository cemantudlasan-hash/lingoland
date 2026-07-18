"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Game, SkillLevel, LanguageFocus, Subject } from "@/lib/types";
import { allGames } from "@/lib/games";
import { Gamepad2, Coins, Check, Compass } from "lucide-react";
import { getDailyBonusGame, getDailyMissions } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

import { gameComponentMap } from "@/lib/game-components";

export default function GamesPage() {
      const [level, setLevel] = useState<SkillLevel | "all">("all");
      const [focus, setFocus] = useState<LanguageFocus | "all">("all");
      const [subject, setSubject] = useState<Subject | "all">("all");
      const [search, setSearch] = useState("");
      const [lastDailyBonusClaimedDate, setLastDailyBonusClaimedDate] = useState<string | null>(null);
      const [completedDailyMissions, setCompletedDailyMissions] = useState<string[]>([]);

      const { user, isGuest } = useAuth();
      const firestore = useFirestore();

      const { slug: dailyBonusSlug, bonusAmount: dailyBonusAmount } = getDailyBonusGame();
      const dailyMissions = getDailyMissions();

      const today = new Date();
      const todayUTC = `${today.getUTCFullYear()}-${today.getUTCMonth() + 1}-${today.getUTCDate()}`;

      useEffect(() => {
            const fetchClaimedDate = async () => {
                  if (!firestore || !user) {
                        if (typeof window !== 'undefined') {
                              const local = localStorage.getItem('lingoland_guest_pet');
                              if (local) {
                                    try {
                                          const parsed = JSON.parse(local);
                                          setLastDailyBonusClaimedDate(parsed.lastDailyBonusClaimedDate || null);
                                    } catch (e) {}
                                }
                        }
                        return;
                  }
                  try {
                        const petRef = doc(firestore, 'user_pets', user.uid);
                        const docSnap = await getDoc(petRef);
                        if (docSnap.exists()) {
                              const data = docSnap.data();
                              setLastDailyBonusClaimedDate(data.lastDailyBonusClaimedDate || null);
                              
                              const isMissionsDateCurrent = data.lastDailyMissionsDate === todayUTC;
                              setCompletedDailyMissions(isMissionsDateCurrent ? (data.completedDailyMissions || []) : []);
                        }
                  } catch (e) {
                        console.error("Error fetching pet claimed date:", e);
                  }
            };
            fetchClaimedDate();
      }, [user, firestore]);

      const filteredGames = allGames.filter((game) => {
            return (
                  (level === "all" || game.level === level) &&
                  (focus === "all" || game.focus === focus) &&
                  (subject === "all" || game.subject === subject) &&
                  game.title.toLowerCase().includes(search.toLowerCase())
            );
      }).sort((a, b) => a.title.localeCompare(b.title));

      return (
            <div className="space-y-6">
                  {/* Premium Header with Total Games Count */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                        <div>
                              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent flex items-center gap-2.5">
                                    <Gamepad2 className="h-7 w-7 text-indigo-400" />
                                    Classroom Games
                              </h1>
                              <p className="text-xs text-slate-400 mt-1">
                                    Complete learning games to level up your pet and earn Lingo-Coins!
                              </p>
                        </div>
                        <div className="flex items-center gap-3">
                              <div className="bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full flex items-center gap-2">
                                    <span className="text-xs font-bold text-indigo-300">Total Games: {allGames.length}</span>
                              </div>
                        </div>
                  </div>

                  {/* Daily Missions Dashboard */}
                  {user && !isGuest && dailyMissions.length > 0 && (
                        <div className="bg-slate-900/40 border border-indigo-500/10 rounded-3xl p-6 backdrop-blur-md shadow-xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                              
                              <div className="flex flex-col gap-1 mb-5">
                                    <div className="flex items-center gap-2">
                                          <Compass className="h-5 w-5 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
                                          <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Active flight plans</span>
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-100">Today's Daily Drop Missions</h2>
                                    <p className="text-xs text-slate-400">Complete these random classroom challenges to earn massive bonus coin drops!</p>
                              </div>

                              <div className="grid gap-4 sm:grid-cols-3">
                                    {dailyMissions.map((mission) => {
                                          const gameInfo = allGames.find(g => g.slug === mission.slug);
                                          const isCompleted = completedDailyMissions.includes(mission.slug);
                                          const IconComp = gameInfo?.icon || Gamepad2;

                                          return (
                                                <div 
                                                      key={mission.slug}
                                                      className={cn(
                                                            "bg-slate-950/40 border p-4 rounded-2xl flex flex-col justify-between gap-4 transition-all duration-300 relative overflow-hidden",
                                                            isCompleted 
                                                                  ? "border-emerald-500/20 bg-emerald-500/[0.01] shadow-emerald-500/5" 
                                                                  : "border-slate-800 hover:border-indigo-500/20 hover:bg-slate-900/30"
                                                      )}
                                                >
                                                      {isCompleted && (
                                                            <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl border-l border-b border-emerald-500/20 flex items-center gap-1">
                                                                  <Check className="h-3 w-3" />
                                                                  Complete
                                                            </div>
                                                      )}

                                                      <div className="flex items-start gap-3">
                                                            <div className={cn(
                                                                  "p-2.5 rounded-xl border shrink-0",
                                                                  isCompleted 
                                                                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
                                                                        : "bg-slate-900 border-slate-800 text-slate-400"
                                                            )}>
                                                                  <IconComp className="h-5 w-5" />
                                                            </div>
                                                            <div className="min-w-0 pr-12">
                                                                  <p className="font-extrabold text-sm text-slate-200 truncate">{mission.title}</p>
                                                                  <div className="flex gap-1.5 mt-1 flex-wrap">
                                                                        <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0 border-slate-850 bg-slate-900 text-slate-400">
                                                                              {gameInfo?.subject}
                                                                        </Badge>
                                                                  </div>
                                                            </div>
                                                      </div>

                                                      <div className="flex items-center justify-between border-t border-slate-900 pt-3 mt-1">
                                                            <div className="flex items-center gap-1.5">
                                                                  <Coins className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                                                  <span className="text-amber-300 font-extrabold text-xs">+{mission.reward} Drop</span>
                                                            </div>

                                                            {isCompleted ? (
                                                                  <span className="text-xs font-bold text-slate-500">Docked</span>
                                                            ) : (
                                                                  <Link href={`/games/${mission.slug}`}>
                                                                        <Button size="sm" className="h-7 px-3 text-[10px] font-black uppercase rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                                                              Fly plan
                                                                        </Button>
                                                                  </Link>
                                                            )}
                                                      </div>
                                                </div>
                                          );
                                    })}
                              </div>
                        </div>
                  )}

                  <div className="flex flex-col gap-4 md:flex-row">
                        <Input
                              placeholder="Search for a game..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              className="max-w-sm"
                        />
                        <div className="flex flex-wrap gap-4">
                              <Select
                                    value={subject}
                                    onValueChange={(v) => setSubject(v as Subject | "all")}
                              >
                                    <SelectTrigger className="w-[180px]">
                                          <SelectValue placeholder="Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                          <SelectItem value="all">All Subjects</SelectItem>
                                          <SelectItem value="english">English</SelectItem>
                                          <SelectItem value="science">Science</SelectItem>
                                          <SelectItem value="math">Math</SelectItem>
                                    </SelectContent>
                              </Select>
                              <Select
                                    value={level}
                                    onValueChange={(v) => setLevel(v as SkillLevel | "all")}
                              >
                                    <SelectTrigger className="w-[180px]">
                                          <SelectValue placeholder="Skill Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                          <SelectItem value="all">All Levels</SelectItem>
                                          <SelectItem value="beginner">Beginner</SelectItem>
                                          <SelectItem value="intermediate">Intermediate</SelectItem>
                                          <SelectItem value="advanced">Advanced</SelectItem>
                                    </SelectContent>
                              </Select>
                              <Select
                                    value={focus}
                                    onValueChange={(v) => setFocus(v as LanguageFocus | "all")}
                              >
                                    <SelectTrigger className="w-[180px]">
                                          <SelectValue placeholder="Learning Focus" />
                                    </SelectTrigger>
                                    <SelectContent>
                                          <SelectItem value="all">All Focus Areas</SelectItem>
                                          <SelectItem value="grammar">Grammar</SelectItem>
                                          <SelectItem value="vocabulary">Vocabulary</SelectItem>
                                          <SelectItem value="pronunciation">Pronunciation</SelectItem>
                                          <SelectItem value="reading">Reading</SelectItem>
                                          <SelectItem value="biology">Biology</SelectItem>
                                          <SelectItem value="geometry">Geometry</SelectItem>
                                          <SelectItem value="conversation">Conversation</SelectItem>
                                    </SelectContent>
                              </Select>
                        </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredGames.map((game) => {
                              const isDailyBonus = game.slug === dailyBonusSlug;
                              const showDailyBonus = isDailyBonus && !isGuest && !!user;
                              return (
                                    <Card
                                          key={game.title}
                                          className={cn(
                                                "flex flex-col bg-card/80 backdrop-blur-sm border-border/20 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                                                showDailyBonus && lastDailyBonusClaimedDate !== todayUTC && "border-amber-500/40 bg-amber-500/[0.02] shadow-amber-500/5 ring-1 ring-amber-500/20",
                                                showDailyBonus && lastDailyBonusClaimedDate === todayUTC && "border-slate-700/60 bg-slate-800/10"
                                          )}
                                    >
                                          <CardHeader className="flex flex-row items-start justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                      <game.icon className="h-10 w-10 text-primary" />
                                                      <div>
                                                            <CardTitle>{game.title}</CardTitle>
                                                            <div className="flex gap-1 mt-1">
                                                                  <Badge variant="outline" className="text-[10px] uppercase">{game.subject}</Badge>
                                                                  <Badge variant="outline" className="text-[10px] uppercase">{game.level}</Badge>
                                                            </div>
                                                      </div>
                                                </div>
                                                {showDailyBonus && (
                                                      lastDailyBonusClaimedDate === todayUTC ? (
                                                            <Badge className="bg-slate-700/80 text-slate-300 font-medium border border-slate-600 flex items-center gap-1 shrink-0">
                                                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                                                  Claimed Today
                                                            </Badge>
                                                      ) : (
                                                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black border-none flex items-center gap-1 shadow-md shadow-amber-500/10 shrink-0">
                                                                  <Coins className="h-3 w-3 fill-slate-950 animate-pulse" />
                                                                  +{dailyBonusAmount.toFixed(2)} Coin
                                                            </Badge>
                                                      )
                                                )}
                                          </CardHeader>
                                          <CardContent className="flex-grow">
                                                <p className="text-sm text-muted-foreground">
                                                      {game.description}
                                                </p>
                                          </CardContent>
                                          <CardFooter>
                                                <Link href={`/games/${game.slug}`} className="w-full">
                                                      <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                                            Play Now
                                                      </Button>
                                                </Link>
                                          </CardFooter>
                                    </Card>
                              );
                        })}
                  </div>
            </div>
      );
}
