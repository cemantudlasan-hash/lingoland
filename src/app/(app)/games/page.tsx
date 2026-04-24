Refactor game filtering logic and improve search functionality. Update game component map and adjust state management for selected filters.'use client';

import { useState } from "react";
import dynamic from 'next/dynamic';
import Link from "next/link";
import { 
  Trophy, Target, Zap, Star, Timer, Gamepad2, Search,
  BookOpen, Brain, Rocket, Wand2, Mic2, Languages,
  ArrowRight, Sparkles, Calculator, FlaskConical,
  GraduationCap, PenTool
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type Subject = "english" | "science" | "math";
type SkillLevel = "beginner" | "intermediate" | "advanced";
type LanguageFocus = "grammar" | "vocabulary" | "pronunciation" | "reading" | "biology" | "geometry" | "conversation";
interface Game {
  title: string;
  description: string;
  icon: any;
  slug: string;
  level: SkillLevel;
  focus: LanguageFocus;
  subject: Subject;
}

const GAMES: Game[] = [
  {
    title: "Vocabulary Quest",
    description: "Master new words through an epic adventure.",
    icon: Star,
    slug: "vocabulary-quest",
    level: "beginner",
    focus: "vocabulary",
    subject: "english"
  },
  {
    title: "Grammar Guardian",
    description: "Defend the kingdom using perfect sentence structure.",
    icon: Trophy,
    slug: "grammar-guardian",
    level: "intermediate",
    focus: "grammar",
    subject: "english"
  },
  {
    title: "Pronunciation Pro",
    description: "Perfect your accent with real-time feedback.",
    icon: Mic2,
    slug: "pronunciation-pro",
    level: "advanced",
    focus: "pronunciation",
    subject: "english"
  },
  {
    title: "Science Lab",
    description: "Explore the world of biology and physics.",
    icon: FlaskConical,
    slug: "science-lab",
    level: "intermediate",
    focus: "biology",
    subject: "science"
  },
  {
    title: "Math Master",
    description: "Solve complex geometry and algebra puzzles.",
    icon: Calculator,
    slug: "math-master",
    level: "advanced",
    focus: "geometry",
    subject: "math"
  },
  {
    title: "Conversation Club",
    description: "Practice speaking in various social scenarios.",
    icon: Languages,
    slug: "conversation-club",
    level: "intermediate",
    focus: "conversation",
    subject: "english"
  }
];
export default function GamesPage() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | "all">("all");
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGames = GAMES.filter((game) => {
    const matchesSubject = selectedSubject === "all" || game.subject === selectedSubject;
    const matchesLevel = selectedLevel === "all" || game.level === selectedLevel;
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesLevel && matchesSearch;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Educational Games</h1>
          <p className="text-muted-foreground text-lg">
            Fun and interactive ways to master English, Science, and Math.
          </p>
        </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v as any)}>
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

            <Select value={selectedLevel} onValueChange={(v) => setSelectedLevel(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <Card key={game.slug} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <game.icon className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {game.level}
                  </Badge>
                </div>
                <CardTitle>{game.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{game.description}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {game.subject}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">
                    {game.focus}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/games/${game.slug}`}>
                    Play Now
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
