"use client";

import { useState } from "react";
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

export const gameComponentMap = {

    'arithmetic-ace': dynamic(() => import('@/components/games/arithmetic-ace').then(mod => mod.ArithmeticAce)),
    'fraction-fusion': dynamic(() => import('@/components/games/fraction-fusion').then(mod => mod.FractionFusion)),
    'math-mission-situations': dynamic(() => import('@/components/games/math-mission-situations').then(mod => mod.MathMissionSituations)),
    'time-traveler': dynamic(() => import('@/components/games/time-traveler').then(mod => mod.TimeTraveler)),
    'probability-pilot': dynamic(() => import('@/components/games/probability-pilot').then(mod => mod.ProbabilityPilot)),
    'element-escapade': dynamic(() => import('@/components/games/element-escapade').then(mod => mod.ElementEscapade)),
    'solar-system-scout': dynamic(() => import('@/components/games/solar-system-scout').then(mod => mod.SolarSystemScout)),
    'states-of-matter': dynamic(() => import('@/components/games/states-of-matter').then(mod => mod.StatesOfMatter)),
    'anatomy-academy': dynamic(() => import('@/components/games/anatomy-academy').then(mod => mod.AnatomyAcademy)),
    'atmospheric-ace': dynamic(() => import('@/components/games/atmospheric-ace').then(mod => mod.AtmosphericAce)),
    'lexi-sphere': dynamic(() => import('@/components/games/lexi-sphere').then(mod => mod.LexiSphere)),
    'cellular-explorer-3d': dynamic(() => import('@/components/games/cellular-explorer-3d').then(mod => mod.CellularExplorer3D)),
    'geometry-galaxy-3d': dynamic(() => import('@/components/games/geometry-galaxy-3d').then(mod => mod.GeometryGalaxy3D)),
    'dialogue-dojo': dynamic(() => import('@/components/games/dialogue-dojo').then(mod => mod.DialogueDojo)),
    'riddle-realm': dynamic(() => import('@/components/games/riddle-realm').then(mod => mod.RiddleRealm)),
    'grammar-guru': dynamic(() => import('@/components/games/grammar-guru').then(mod => mod.GrammarGuru)),
    'vocab-voyage': dynamic(() => import('@/components/games/vocab-voyage').then(mod => mod.VocabVoyage)),
    'sentence-scramble': dynamic(() => import('@/components/games/sentence-scramble').then(mod => mod.SentenceScramble)),
    'idiom-illumination': dynamic(() => import('@/components/games/idiom-illumination').then(mod => mod.IdiomIllumination)),
    'pronunciation-pro': dynamic(() => import('@/components/games/pronunciation-pro').then(mod => mod.PronunciationPro)),
    'listening-labyrinth': dynamic(() => import('@/components/games/listening-labyrinth').then(mod => mod.ListeningLabyrinth)),
    'pictionary-party': dynamic(() => import('@/components/games/pictionary-party').then(mod => mod.PictionaryParty)),
    'charades-challenge': dynamic(() => import('@/components/games/charades-challenge').then(mod => mod.CharadesChallenge)),
    'running-dictation': dynamic(() => import('@/components/games/running-dictation').then(mod => mod.RunningDictation)),
    'auction-action': dynamic(() => import('@/components/games/auction-action').then(mod => mod.AuctionAction)),
    'story-chain': dynamic(() => import('@/components/games/story-chain').then(mod => mod.StoryChain)),
    'taboo-tussle': dynamic(() => import('@/components/games/taboo-tussle').then(mod => mod.TabooTussle)),
    'twenty-questions': dynamic(() => import('@/components/games/twenty-questions').then(mod => mod.TwentyQuestions)),
    'synonym-sleuth': dynamic(() => import('@/components/games/synonym-sleuth').then(mod => mod.SynonymSleuth)),
    'reading-comprehension': dynamic(() => import('@/components/games/reading-comprehension').then(mod => mod.ReadingComprehension)),
    'wheel-of-fortune': dynamic(() => import('@/components/games/wheel-of-fortune').then(mod => mod.WheelOfFortune)),
    'world-tour-wheel': dynamic(() => import('@/components/games/world-tour-wheel').then(mod => mod.WorldTourWheel)),
    'hangman-challenge': dynamic(() => import('@/components/games/hangman-challenge').then(mod => mod.HangmanChallenge)),
    'bingo-boost': dynamic(() => import('@/components/games/bingo-boost').then(mod => mod.BingoBoost)),
    'top-5-quiz': dynamic(() => import('@/components/games/top-5-quiz').then(mod => mod.Top5Quiz)),
    'mystery-box': dynamic(() => import('@/components/games/mystery-box').then(mod => mod.MysteryBox)),
    'crossword-connect': dynamic(() => import('@/components/games/crossword-connect').then(mod => mod.CrosswordConnect)),
    'phonics-flash': dynamic(() => import('@/components/games/phonics-flash').then(mod => mod.PhonicsFlash)),
    'article-architect': dynamic(() => import('@/components/games/article-architect').then(mod => mod.ArticleArchitect)),
    'jeopardy-classroom': dynamic(() => import('@/components/games/jeopardy-classroom').then(mod => mod.JeopardyClassroom)),
    'choose-your-gift': dynamic(() => import('@/components/games/choose-your-gift').then(mod => mod.ChooseYourGift)),
    'vocabulary-match-up': dynamic(() => import('@/components/games/vocabulary-match-up').then(mod => mod.VocabularyMatchUp)),
    'spelling-bee': dynamic(() => import('@/components/games/spelling-bee').then(mod => mod.SpellingBee)),
    'spin-the-wheel': dynamic(() => import('@/components/games/spin-the-wheel').then(mod => mod.SpinTheWheel)),
    'odd-one-out': dynamic(() => import('@/components/games/odd-one-out').then(mod => mod.OddOneOut)),
    'emoji-enigma': dynamic(() => import('@/components/games/emoji-enigma').then(mod => mod.EmojiEnigma)),
    'context-detective': dynamic(() => import('@/components/games/context-detective').then(mod => mod.ContextDetective)),
    'word-morph': dynamic(() => import('@/components/games/word-morph').then(mod => mod.WordMorph)),
    'algebraic-abyss': dynamic(() => import('@/components/games/algebraic-abyss').then(mod => mod.AlgebraicAbyss)),
    'evolution-expedition': dynamic(() => import('@/components/games/evolution-expedition').then(mod => mod.EvolutionExpedition)),
    'syntax-skyline': dynamic(() => import('@/components/games/syntax-skyline').then(mod => mod.SyntaxSkyline)),
    'math-matrix': dynamic(() => import('@/components/games/math-matrix').then(mod => mod.MathMatrix)),
    'vocab-vortex': dynamic(() => import('@/components/games/vocab-vortex').then(mod => mod.VocabVortex)),
    'quantum-quest': dynamic(() => import('@/components/games/quantum-quest').then(mod => mod.QuantumQuest)),
    'grammar-gladiator': dynamic(() => import('@/components/games/grammar-gladiator').then(mod => mod.GrammarGladiator)),
    'synonym-sniper': dynamic(() => import('@/components/games/synonym-sniper').then(mod => mod.SynonymSniper)),
    'idiom-inferno': dynamic(() => import('@/components/games/idiom-inferno').then(mod => mod.IdiomInferno)),
    'molecule-maker': dynamic(() => import('@/components/games/molecule-maker').then(mod => mod.MoleculeMaker)),
    'bio-hazard': dynamic(() => import('@/components/games/bio-hazard').then(mod => mod.BioHazard)),
    'newtons-nightmare': dynamic(() => import('@/components/games/newtons-nightmare').then(mod => mod.NewtonsNightmare)),
    'fraction-fortress': dynamic(() => import('@/components/games/fraction-fortress').then(mod => mod.FractionFortress)),
    'data-detective': dynamic(() => import('@/components/games/data-detective').then(mod => mod.DataDetective)),
    'geometry-genius': dynamic(() => import('@/components/games/geometry-genius').then(mod => mod.GeometryGenius)),
    'calculus-comet': dynamic(() => import('@/components/games/calculus-comet').then(mod => mod.CalculusComet)),
    'chemical-combat': dynamic(() => import('@/components/games/chemical-combat').then(mod => mod.ChemicalCombat)),
    'punctuation-pirate': dynamic(() => import('@/components/games/punctuation-pirate').then(mod => mod.PunctuationPirate)),
    'game-placeholder': dynamic(() => import('@/components/game-placeholder').then(mod => mod.GamePlaceholder)),
};


export default function GamesPage() {
    const [level, setLevel] = useState<SkillLevel | "all">("all");
    const [focus, setFocus] = useState<LanguageFocus | "all">("all");
    const [subject, setSubject] = useState<Subject | "all">("all");
    const [search, setSearch] = useState("");

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
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredGames.map((game) => (
                    <Card
                                  key={game.title}
                                  className="flex flex-col bg-card/80 backdrop-blur-sm border-border/20 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                                >
                                <CardHeader className="flex flex-row items-center gap-4">
                                              <game.icon className="h-10 w-10 text-primary" />
                                              <div>
                                                              <CardTitle>{game.title}</CardTitle>
                                                              <div className="flex gap-1 mt-1">
                                                                                  <Badge variant="outline" className="text-[10px] uppercase">{game.subject}</Badge>
                                                                                  <Badge variant="outline" className="text-[10px] uppercase">{game.level}</Badge>
                                                              </div>
                                              </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                              <p className="text-sm text-muted-foreground">
                                                {game.description}
                                              </p>p>
                                </CardContent>
                                <CardFooter>
                                              <Link href={`/games/${game.slug}`} className="w-full">
                                                              <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                                                                Play Now
                                                              </Button>
                                              </Link>
                                </CardFooter>
                    </Card>
                  ))}
                    </div>
              </div>
          );
          }
        </div>
