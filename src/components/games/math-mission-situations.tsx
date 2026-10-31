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
import { Input } from "../ui/input";
import {
  Loader2,
  Sparkles,
  Timer,
  CheckCircle2,
  XCircle,
  Repeat,
  Maximize,
  Minimize,
  Eraser,
  Undo2,
  ScrollText,
  Send,
  SkipForward,
  Trophy,
  Pencil,
  Flame,
  Volume2,
  VolumeX,
  HelpCircle,
  Calculator,
  Lock,
  Unlock,
  Layers,
  ArrowRight,
  Lightbulb,
  Check,
  Delete,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactSketchCanvasRef } from "react-sketch-canvas";
import type { SkillLevel } from "@/lib/types";

const DynamicCanvas = dynamic(
  () => import("react-sketch-canvas").then((mod) => mod.ReactSketchCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-900 text-cyan-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
  }
);

// ─────────────────────────────────────────────────────────
// SOUND SYNTHESIZER
// ─────────────────────────────────────────────────────────
class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playBeep(freq = 440, dur = 0.1, type: OscillatorType = "sine", gainVal = 0.08) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    } catch {}
  }

  playClick() {
    this.playBeep(600, 0.05, "sine", 0.04);
  }

  playKey() {
    this.playBeep(850, 0.04, "triangle", 0.03);
  }

  playSuccess() {
    this.playBeep(523.25, 0.1, "triangle", 0.08); // C5
    setTimeout(() => this.playBeep(659.25, 0.12, "triangle", 0.08), 90); // E5
    setTimeout(() => this.playBeep(783.99, 0.18, "triangle", 0.1), 180); // G5
    setTimeout(() => this.playBeep(1046.5, 0.28, "sine", 0.12), 270); // C6
  }

  playError() {
    this.playBeep(220, 0.15, "sawtooth", 0.08);
    setTimeout(() => this.playBeep(180, 0.22, "sawtooth", 0.08), 120);
  }

  playTick() {
    this.playBeep(980, 0.03, "sine", 0.02);
  }
}

const sounds = new SoundEffects();

// ─────────────────────────────────────────────────────────
// TYPES & DATA STRUCTURES
// ─────────────────────────────────────────────────────────
type GameState = "idle" | "instructions" | "selecting_difficulty" | "loading" | "playing" | "answered" | "finished";

interface MathProblem {
  id: number;
  level: SkillLevel;
  scenario: string;
  goal: string;
  text: string;
  answer: string;
  explanation: string;
  clues: string[];
}

const PROBLEMS: MathProblem[] = [
  // ── BEGINNER (Cadet Level) ──
  {
    id: 1,
    level: "beginner",
    scenario: "Farmer Joe harvests fruit at Sunshine Orchards.",
    goal: "How many apples does Joe have left in total?",
    text: "Farmer Joe has 15 red apples and 12 green apples. He gives 7 red apples to his neighbor. How many apples does Joe have left in total?",
    answer: "20",
    explanation: "Joe begins with 15 + 12 = 27 total apples. After sharing 7 red apples: 27 - 7 = 20 apples remaining.",
    clues: ["15 red apples", "12 green apples", "Gave away 7"]
  },
  {
    id: 2,
    level: "beginner",
    scenario: "The morning yellow bus navigates city transit.",
    goal: "How many empty seats remain on the bus?",
    text: "A school bus has 24 seats. 18 students are already seated. At the next stop, 5 more students board. How many empty seats are left?",
    answer: "1",
    explanation: "Total passengers = 18 + 5 = 23 students. Remaining empty seats = 24 total seats - 23 students = 1 empty seat.",
    clues: ["24 total seats", "18 students seated", "5 students board"]
  },
  {
    id: 7,
    level: "beginner",
    scenario: "Sweet Treats Bakery prepares morning pastries.",
    goal: "How many cupcakes does the baker have remaining?",
    text: "A baker made 30 cupcakes. She sold 12 in the morning and 8 in the afternoon. How many cupcakes does she have left?",
    answer: "10",
    explanation: "Total cupcakes sold = 12 + 8 = 20. Remaining stock = 30 - 20 = 10 cupcakes.",
    clues: ["30 cupcakes baked", "12 sold morning", "8 sold afternoon"]
  },
  {
    id: 8,
    level: "beginner",
    scenario: "Art class organization with colored crayons.",
    goal: "How many crayons does Tim have now?",
    text: "Tim has 4 boxes of crayons. Each box contains 8 crayons. He accidentally loses 5 crayons on the playground. How many crayons does he have now?",
    answer: "27",
    explanation: "Initial crayon inventory = 4 boxes × 8 = 32 crayons. After losing 5 = 32 - 5 = 27 crayons.",
    clues: ["4 boxes", "8 crayons per box", "Lost 5 crayons"]
  },
  {
    id: 9,
    level: "beginner",
    scenario: "Botanical garden flower bed survey.",
    goal: "How many flowers are still in the garden bed?",
    text: "In a botanical garden, there are 14 yellow flowers and 16 blue flowers. If 9 flowers are carefully picked for a bouquet, how many flowers are still in the garden?",
    answer: "21",
    explanation: "Total flowers blooming = 14 + 16 = 30. Remaining after picking 9 = 30 - 9 = 21 flowers.",
    clues: ["14 yellow flowers", "16 blue flowers", "9 flowers picked"]
  },
  {
    id: 10,
    level: "beginner",
    scenario: "Lucy shops for school supplies at the bookstore.",
    goal: "How much money does Lucy have remaining?",
    text: "Lucy had $25 in pocket money. She bought an adventure book for $9 and a healthy snack for $4. How much money does she have left?",
    answer: "12",
    explanation: "Total expenditures = $9 + $4 = $13. Remaining budget = $25 - $13 = $12.",
    clues: ["$25 starting cash", "Book costs $9", "Snack costs $4"]
  },
  {
    id: 11,
    level: "beginner",
    scenario: "A pet cat's daily outdoor adventures.",
    goal: "What is the total number of mice caught?",
    text: "Barn cat whiskers caught 3 mice on Monday, 4 on Tuesday, and 2 on Wednesday. How many mice did it catch in total across the 3 days?",
    answer: "9",
    explanation: "Total tally = 3 + 4 + 2 = 9 mice caught.",
    clues: ["Monday: 3", "Tuesday: 4", "Wednesday: 2"]
  },
  {
    id: 22,
    level: "beginner",
    scenario: "Aquarium pet shop livestock inventory.",
    goal: "How many fish remain in the store?",
    text: "A pet shop has 12 fish tanks. Each tank contains 5 colorful fish. If the shop sells 15 fish on Saturday, how many fish are left in total?",
    answer: "45",
    explanation: "Total starting fish = 12 tanks × 5 fish = 60 fish. After sales: 60 - 15 = 45 fish.",
    clues: ["12 fish tanks", "5 fish per tank", "15 fish sold"]
  },
  {
    id: 23,
    level: "beginner",
    scenario: "Emma divides her classic marble collection.",
    goal: "How many marbles does Emma retain?",
    text: "Emma has 40 glass marbles. She gifts 12 to her best friend and 8 to her younger brother. How many marbles does Emma keep for herself?",
    answer: "20",
    explanation: "Total marbles shared = 12 + 8 = 20. Remaining for Emma = 40 - 20 = 20 marbles.",
    clues: ["40 total marbles", "Gave 12 to friend", "Gave 8 to brother"]
  },
  {
    id: 24,
    level: "beginner",
    scenario: "City library shelf circulation.",
    goal: "How many books currently rest on the shelf?",
    text: "A public library had 55 books on the science fiction shelf. 14 books were checked out, and 6 previously borrowed books were returned. How many books are on the shelf now?",
    answer: "47",
    explanation: "55 books - 14 borrowed = 41 books. Plus 6 returned = 41 + 6 = 47 books.",
    clues: ["55 books originally", "14 borrowed", "6 returned"]
  },
  {
    id: 25,
    level: "beginner",
    scenario: "Strawberry harvest at berry hill farm.",
    goal: "How many strawberries does the farmer have left?",
    text: "A farmer picked 18 ripe strawberries in the morning and 24 in the afternoon. He ate 5 fresh strawberries as a snack. How many strawberries does he have left?",
    answer: "37",
    explanation: "Total harvested = 18 + 24 = 42 strawberries. After eating 5: 42 - 5 = 37 strawberries.",
    clues: ["18 morning berries", "24 afternoon berries", "5 eaten"]
  },
  {
    id: 26,
    level: "beginner",
    scenario: "Junior soccer tournament scoring record.",
    goal: "What is the total number of goals scored by the team?",
    text: "The Strikers scored 3 goals in game one, 2 goals in game two, and 5 goals in game three. What is the total number of goals they scored across the series?",
    answer: "10",
    explanation: "Sum of goals = 3 + 2 + 5 = 10 total goals.",
    clues: ["Game 1: 3", "Game 2: 2", "Game 3: 5"]
  },
  {
    id: 41,
    level: "beginner",
    scenario: "Pizza party slice distribution.",
    goal: "How many pizza slices remain for dinner?",
    text: "There are 3 large pizzas, each cut into 8 equal slices. The guests eat 17 slices. How many slices are left over?",
    answer: "7",
    explanation: "Total slices = 3 × 8 = 24 slices. Slices remaining = 24 - 17 = 7 slices.",
    clues: ["3 pizzas", "8 slices per pizza", "17 slices eaten"]
  },
  {
    id: 42,
    level: "beginner",
    scenario: "Toy garage vehicle sorting.",
    goal: "How many toy cars are left in the garage?",
    text: "A toy garage has 5 ramps with 6 toy cars on each ramp. A child takes 8 cars outside to play in the sand. How many cars remain inside the garage?",
    answer: "22",
    explanation: "Total cars = 5 × 6 = 30 cars. Cars remaining = 30 - 8 = 22 cars.",
    clues: ["5 ramps", "6 cars per ramp", "8 taken outside"]
  },

  // ── INTERMEDIATE (Specialist Level) ──
  {
    id: 3,
    level: "intermediate",
    scenario: "Back-to-school stationery transaction.",
    goal: "How much change in dollars should Sarah receive?",
    text: "Sarah buys 3 notebooks for $4 each and 2 packs of pencils for $3 each. She pays with a $20 bill. How much change should she receive in dollars?",
    answer: "2",
    explanation: "Total cost = (3 × $4) + (2 × $3) = $12 + $6 = $18. Change received = $20 - $18 = $2.",
    clues: ["3 notebooks @ $4", "2 pencil packs @ $3", "Paid with $20"]
  },
  {
    id: 4,
    level: "intermediate",
    scenario: "Landscaping and perimeter perimeter calculation.",
    goal: "What is the total perimeter fence length in meters?",
    text: "A rectangular community garden is 8 meters long and 5 meters wide. A decorative fence surrounds the perimeter. What is the total length of the fence in meters?",
    answer: "26",
    explanation: "Perimeter = 2 × (Length + Width) = 2 × (8 + 5) = 2 × 13 = 26 meters.",
    clues: ["Length = 8m", "Width = 5m", "Formula: 2 × (L + W)"]
  },
  {
    id: 12,
    level: "intermediate",
    scenario: "Fraction sharing at a family lunch.",
    goal: "How many pizza slices remain untouched in the box?",
    text: "A family pizza is divided into 12 equal slices. Mark eats 1/4 of the pizza, and Julie eats 1/3 of the pizza. How many slices are left in the box?",
    answer: "5",
    explanation: "Mark eats 12 × 1/4 = 3 slices. Julie eats 12 × 1/3 = 4 slices. Total eaten = 3 + 4 = 7 slices. Leftover = 12 - 7 = 5 slices.",
    clues: ["12 total slices", "Mark eats 1/4", "Julie eats 1/3"]
  },
  {
    id: 13,
    level: "intermediate",
    scenario: "Broadway theater ticket attendance.",
    goal: "How many spectators are watching the live show?",
    text: "An auditorium has 15 rows of seats with 12 seats in each row. During the matinee, 45 seats are vacant. How many people are watching the show?",
    answer: "135",
    explanation: "Auditorium capacity = 15 rows × 12 seats = 180 seats. Attending spectators = 180 - 45 = 135 people.",
    clues: ["15 rows", "12 seats per row", "45 empty seats"]
  },
  {
    id: 14,
    level: "intermediate",
    scenario: "Highway road trip velocity and distance.",
    goal: "How many miles will the car travel in 5 hours?",
    text: "A family drives 180 miles in 3 hours at constant highway speed. At this same average speed, how many miles will they travel in 5 hours?",
    answer: "300",
    explanation: "Speed = 180 miles / 3 hours = 60 mph. Distance in 5 hours = 60 mph × 5 hours = 300 miles.",
    clues: ["180 miles in 3 hours", "Speed = Distance / Time", "Travel time: 5 hours"]
  },
  {
    id: 15,
    level: "intermediate",
    scenario: "Ranch water storage pumping rate.",
    goal: "How many minutes are required to fill the reservoir?",
    text: "A ranch cistern holds 500 liters of water. A motorized pump fills it at 25 liters per minute. If the cistern is already half full, how many minutes will it take to fill completely?",
    answer: "10",
    explanation: "Capacity needed = 500 / 2 = 250 liters remaining. Time needed = 250 liters / 25 liters per minute = 10 minutes.",
    clues: ["500L total capacity", "Already half full (250L)", "Pump rate: 25L/min"]
  },
  {
    id: 16,
    level: "intermediate",
    scenario: "Department store seasonal discount.",
    goal: "What is the final sale price of the jacket in dollars?",
    text: "A winter jacket originally retails for $80. During a clearance event, it is discounted by 20% off. What is the final sale price in dollars?",
    answer: "64",
    explanation: "Discount amount = 20% of $80 = 0.20 × 80 = $16. Final sale price = $80 - $16 = $64.",
    clues: ["Original price: $80", "Discount: 20% off", "Formula: Price × (1 - 0.20)"]
  },
  {
    id: 27,
    level: "intermediate",
    scenario: "Interior design paint coverage calculation.",
    goal: "How many liters of paint are needed to cover the floor?",
    text: "A rectangular studio room is 6 meters long and 4 meters wide. One liter of epoxy paint covers 8 square meters. How many liters of paint are required to coat the entire floor?",
    answer: "3",
    explanation: "Floor area = 6m × 4m = 24 m². Liters needed = 24 m² / 8 m² per liter = 3 liters.",
    clues: ["Length = 6m, Width = 4m", "Floor area = L × W", "Coverage: 8 m² per liter"]
  },
  {
    id: 28,
    level: "intermediate",
    scenario: "Classroom reward candy distribution.",
    goal: "How many candies does each present student receive?",
    text: "A teacher has 48 pieces of candy to distribute equally among 6 group members. However, 2 members are absent today. How many pieces will each attending student get?",
    answer: "12",
    explanation: "Present students = 6 - 2 = 4 students. Candies per student = 48 / 4 = 12 pieces each.",
    clues: ["48 total candies", "6 original members", "2 absent members"]
  },
  {
    id: 29,
    level: "intermediate",
    scenario: "Aviation flight cruise rate.",
    goal: "How many miles will the jet travel in 7 hours?",
    text: "A commercial jet flies 2,400 miles in 4 hours. Continuing at this same cruise velocity, how many total miles will it cover in 7 hours?",
    answer: "4200",
    explanation: "Cruise speed = 2,400 miles / 4 hours = 600 mph. Distance in 7 hours = 600 mph × 7 hours = 4,200 miles.",
    clues: ["2,400 miles in 4 hours", "Speed = 600 mph", "Time = 7 hours"]
  },
  {
    id: 30,
    level: "intermediate",
    scenario: "Organic farm market fruit bundle.",
    goal: "What is the cost in dollars to buy 25 apples?",
    text: "A farmers market sells a pre-packaged bag of 5 honeycrisp apples for $3. How much would it cost in dollars to purchase 25 apples?",
    answer: "15",
    explanation: "Bags required = 25 apples / 5 apples per bag = 5 bags. Total cost = 5 bags × $3 = $15.",
    clues: ["5 apples cost $3", "Goal: 25 apples", "25 / 5 = 5 bags"]
  },
  {
    id: 31,
    level: "intermediate",
    scenario: "Greenhouse flower bed survival rate.",
    goal: "How many healthy flowers remain standing?",
    text: "A greenhouse gardener plants 8 rows of flowers with 12 flowers in each row. Due to a sudden frost, 15 flowers wither and die. How many healthy flowers remain?",
    answer: "81",
    explanation: "Total planted = 8 rows × 12 flowers = 96 flowers. Surviving flowers = 96 - 15 = 81 flowers.",
    clues: ["8 rows of flowers", "12 flowers per row", "15 flowers died"]
  },

  // ── ADVANCED (Master Agent Level) ──
  {
    id: 5,
    level: "advanced",
    scenario: "High-speed rail continental travel.",
    goal: "How many kilometers will the express train cover?",
    text: "An electric express train travels at a constant velocity of 80 kilometers per hour. If the train maintains this pace for 3 hours and 45 minutes, how many total kilometers does it cover?",
    answer: "300",
    explanation: "3 hours and 45 minutes equals 3 + 45/60 = 3.75 hours. Distance = Speed × Time = 80 km/h × 3.75 h = 300 km.",
    clues: ["Speed = 80 km/h", "Time = 3h 45m = 3.75h", "Distance = Velocity × Time"]
  },
  {
    id: 6,
    level: "advanced",
    scenario: "Gaming console seasonal flash sale.",
    goal: "What is the discounted sale price in dollars?",
    text: "A premium video game console retails for $60. During the cyber weekend event, it is discounted by 25%. What is the promotional sale price in dollars?",
    answer: "45",
    explanation: "Discount amount = 25% of $60 = 0.25 × 60 = $15. Promotional price = $60 - $15 = $45.",
    clues: ["Regular price = $60", "Discount = 25% = 1/4", "Savings = $15"]
  },
  {
    id: 17,
    level: "advanced",
    scenario: "Corporate quarterly financial growth audit.",
    goal: "What was the percentage increase in quarterly revenue?",
    text: "A tech startup's quarterly revenue rose from $120,000 to $150,000. What was the exact percentage increase in revenue? (Enter numerical value only)",
    answer: "25",
    explanation: "Absolute increase = $150,000 - $120,000 = $30,000. Percentage growth = (30,000 / 120,000) × 100 = 0.25 × 100 = 25%.",
    clues: ["Original: $120,000", "New: $150,000", "Growth = (Delta / Original) × 100"]
  },
  {
    id: 18,
    level: "advanced",
    scenario: "Industrial chemical storage geometry.",
    goal: "What is the cylinder volume in cubic centimeters?",
    text: "A cylindrical laboratory flask has a radius of 3 cm and a height of 10 cm. Using 3 for the approximation of Pi (π), what is the total volume in cubic centimeters?",
    answer: "270",
    explanation: "Cylinder Volume = π × r² × h = 3 × (3²) × 10 = 3 × 9 × 10 = 270 cm³.",
    clues: ["Radius (r) = 3 cm", "Height (h) = 10 cm", "π ≈ 3, V = π × r² × h"]
  },
  {
    id: 19,
    level: "advanced",
    scenario: "Olympic sprint velocity analysis.",
    goal: "What is the runner's average speed in meters per second?",
    text: "An Olympic sprinter dashes 100 meters in exactly 12.5 seconds. What was their average speed in meters per second?",
    answer: "8",
    explanation: "Average Speed = Distance / Time = 100 meters / 12.5 seconds = 8 m/s.",
    clues: ["Distance = 100m", "Time = 12.5s", "Speed = Distance / Time"]
  },
  {
    id: 20,
    level: "advanced",
    scenario: "Supercomputer processor benchmark.",
    goal: "How many instructions are processed (in millions)?",
    text: "A quantum processor executes 2.5 million instructions every second. How many total instructions does it execute in 4 minutes? (Enter answer in millions)",
    answer: "600",
    explanation: "4 minutes = 4 × 60 = 240 seconds. Total operations = 2.5 million × 240 seconds = 600 million instructions.",
    clues: ["2.5M instructions/sec", "4 minutes = 240 seconds", "Total = Rate × Seconds"]
  },
  {
    id: 21,
    level: "advanced",
    scenario: "Science competition score averaging.",
    goal: "What was the mean score of the academic team?",
    text: "Five science Olympiad students scored 85, 92, 78, 90, and 85 on the preliminary exam. What is the average (mean) score of the group?",
    answer: "86",
    explanation: "Sum of scores = 85 + 92 + 78 + 90 + 85 = 430. Mean average = 430 / 5 = 86.",
    clues: ["Scores: 85, 92, 78, 90, 85", "5 students total", "Mean = Sum / Count"]
  },
  {
    id: 32,
    level: "advanced",
    scenario: "Investment bank simple interest yield.",
    goal: "What is the total account balance after 3 years?",
    text: "An investor deposits $2,000 into a high-yield certificate of deposit paying a 5% simple annual interest rate. How much total money is in the account after 3 years?",
    answer: "2300",
    explanation: "Interest earned = Principal × Rate × Time = $2,000 × 0.05 × 3 = $300. Total account balance = $2,000 + $300 = $2,300.",
    clues: ["Principal = $2,000", "Rate = 5% (0.05)", "Time = 3 years", "I = P × r × t"]
  },
  {
    id: 33,
    level: "advanced",
    scenario: "Catering banquet recipe proportional scaling.",
    goal: "How many cups of flour are required for 10 guests?",
    text: "A gourmet pastry recipe designed for 4 people calls for 2.5 cups of organic flour. How many cups of flour are needed to make the same recipe for 10 people?",
    answer: "6.25",
    explanation: "Flour per single serving = 2.5 / 4 = 0.625 cups. For 10 servings = 0.625 × 10 = 6.25 cups of flour.",
    clues: ["4 servings = 2.5 cups", "Single serving = 0.625 cups", "Scale up to 10 servings"]
  },
  {
    id: 34,
    level: "advanced",
    scenario: "Physics laboratory gravitational acceleration.",
    goal: "What will the probe velocity be in meters per second?",
    text: "A physics probe is dropped from a cliff in a vacuum chamber. Its downward velocity increases by 9.8 meters per second every second. What is its velocity after 4.5 seconds?",
    answer: "44.1",
    explanation: "Velocity = Acceleration × Time = 9.8 m/s² × 4.5 s = 44.1 m/s.",
    clues: ["Acceleration = 9.8 m/s²", "Time = 4.5 seconds", "v = a × t"]
  },
  {
    id: 35,
    level: "advanced",
    scenario: "Statistical analysis with median value constraints.",
    goal: "What is the smallest possible integer value for x?",
    text: "The median of 5 ordered numbers is 12. If the ordered numbers are 8, 10, 12, x, and 20, what is the smallest possible integer value that x can take?",
    answer: "12",
    explanation: "In an ordered set of 5 elements, the median is the 3rd element (which is 12). Because the list is non-decreasing, x must be greater than or equal to 12. Thus, the smallest integer for x is 12.",
    clues: ["Set: [8, 10, 12, x, 20]", "List is in increasing order", "3rd element = 12"]
  },
  {
    id: 36,
    level: "advanced",
    scenario: "Architecture composite floor plan area.",
    goal: "What is the total floor area in square meters?",
    text: "An architect designs an L-shaped conference room comprised of two adjoining non-overlapping rectangles: one measuring 5m × 4m and the other 3m × 2m. What is the total floor area in square meters?",
    answer: "26",
    explanation: "Area of rectangle 1 = 5 × 4 = 20 m². Area of rectangle 2 = 3 × 2 = 6 m². Total composite area = 20 + 6 = 26 m².",
    clues: ["Room 1: 5m × 4m = 20 m²", "Room 2: 3m × 2m = 6 m²", "Sum = 20 + 6"]
  }
];

const MISSION_TIME = 180; // 3 minutes

const COLOR_PALETTE = [
  { name: "Cyan", hex: "#38bdf8", label: "Sky Blue" },
  { name: "Emerald", hex: "#34d399", label: "Neon Green" },
  { name: "Amber", hex: "#fbbf24", label: "Solar Gold" },
  { name: "Rose", hex: "#f43f5e", label: "Plasma Red" },
  { name: "White", hex: "#ffffff", label: "Crisp White" },
  { name: "Dark", hex: "#0f172a", label: "Slate Black" },
];

const STROKE_WIDTHS = [
  { label: "Fine", val: 2 },
  { label: "Med", val: 4 },
  { label: "Bold", val: 8 },
];

// Helper to sanitize answers so $15, 15.0, 15 all match
function isMatch(user: string, actual: string): boolean {
  const cleanU = user.trim().replace(/[\$,%]/g, "").replace(/\s+/g, "");
  const cleanA = actual.trim().replace(/[\$,%]/g, "").replace(/\s+/g, "");
  if (!cleanU) return false;
  if (cleanU.toLowerCase() === cleanA.toLowerCase()) return true;

  const numU = parseFloat(cleanU);
  const numA = parseFloat(cleanA);
  if (!isNaN(numU) && !isNaN(numA)) {
    return Math.abs(numU - numA) < 0.0001;
  }
  return false;
}

export function MathMissionSituations({
  slug,
  onToggleFullscreen,
}: {
  slug: string;
  onToggleFullscreen?: () => void;
}) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [difficulty, setDifficulty] = React.useState<SkillLevel>("beginner");
  const [problem, setProblem] = React.useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = React.useState("");
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = React.useState(MISSION_TIME);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [usedIds, setUsedIds] = React.useState<number[]>([]);

  // Gamification
  const [score, setScore] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [solvedCount, setSolvedCount] = React.useState(0);
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  // Scratchpad Workbench Controls
  const [strokeColor, setStrokeColor] = React.useState("#38bdf8");
  const [strokeWidth, setStrokeWidth] = React.useState(4);
  const [isEraser, setIsEraser] = React.useState(false);
  const [canvasTheme, setCanvasTheme] = React.useState<"blueprint" | "white" | "chalkboard">("blueprint");
  const [touchScrollLocked, setTouchScrollLocked] = React.useState(false); // Mobile scroll-guard
  const [mobileTab, setMobileTab] = React.useState<"briefing" | "scratchpad">("briefing");

  const canvasRef = React.useRef<ReactSketchCanvasRef>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  // Fullscreen Listener
  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Sync sound class enabled
  React.useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Round Starter
  const startRound = (level: SkillLevel) => {
    setDifficulty(level);
    setGameState("loading");
    sounds.playClick();

    setTimeout(() => {
      const pool = PROBLEMS.filter((p) => p.level === level && !usedIds.includes(p.id));
      const finalPool = pool.length > 0 ? pool : PROBLEMS.filter((p) => p.level === level);
      const selected = finalPool[Math.floor(Math.random() * finalPool.length)];

      setProblem(selected);
      setUsedIds((prev) => [...prev, selected.id]);
      setUserAnswer("");
      setIsCorrect(null);
      setTimeLeft(MISSION_TIME);
      setGameState("playing");
      setMobileTab("briefing");

      // Reset canvas
      canvasRef.current?.clearCanvas();
      if (isEraser) {
        setIsEraser(false);
        canvasRef.current?.eraseMode(false);
      }
    }, 800);
  };

  // Timer Lifecycle
  React.useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            handleCheckAnswer(true);
            return 0;
          }
          if (t <= 10 && soundEnabled) {
            sounds.playTick();
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, timeLeft, soundEnabled]);

  const handleCheckAnswer = (forcedTimeout = false) => {
    if (!problem) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const correct = forcedTimeout ? false : isMatch(userAnswer, problem.answer);
    setIsCorrect(correct);
    setGameState("answered");

    if (correct) {
      const timeBonus = Math.floor(timeLeft / 2);
      const streakBonus = streak * 25;
      const roundScore = 100 + timeBonus + streakBonus;
      setScore((s) => s + roundScore);
      setStreak((st) => st + 1);
      setSolvedCount((c) => c + 1);
      sounds.playSuccess();
      toast({
        title: "Mission Accomplished! 🎯",
        description: `Code verified! +${roundScore} PTS (Includes ${timeBonus}s speed bonus)`,
      });
    } else {
      setStreak(0);
      sounds.playError();
      toast({
        variant: "destructive",
        title: forcedTimeout ? "Mission Time Elapsed! ⏱️" : "Decryption Failure ❌",
        description: "Calculation did not match target objective. Review the forensics report below.",
      });
    }
  };

  const handleSkip = () => {
    if (!problem) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsCorrect(false);
    setStreak(0);
    setGameState("answered");
    sounds.playError();
    toast({
      title: "Mission Aborted",
      description: "Reviewing tactical solution and calculation steps.",
    });
  };

  // Canvas Handlers
  const toggleEraser = () => {
    const next = !isEraser;
    setIsEraser(next);
    canvasRef.current?.eraseMode(next);
    sounds.playClick();
  };

  const handleColorChange = (hex: string) => {
    setStrokeColor(hex);
    if (isEraser) {
      setIsEraser(false);
      canvasRef.current?.eraseMode(false);
    }
    sounds.playClick();
  };

  const handleClearCanvas = () => {
    canvasRef.current?.clearCanvas();
    sounds.playClick();
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
    sounds.playClick();
  };

  // Virtual Keypad Handlers
  const handleKeypadPress = (val: string) => {
    sounds.playKey();
    if (val === "BACK") {
      setUserAnswer((prev) => prev.slice(0, -1));
    } else if (val === "CLEAR") {
      setUserAnswer("");
    } else {
      if (val === "." && userAnswer.includes(".")) return;
      if (val === "-" && userAnswer.length > 0) return;
      setUserAnswer((prev) => prev + val);
    }
  };

  const Icon = game?.icon || ScrollText;

  // Background style computation for canvas
  const getCanvasBg = () => {
    if (canvasTheme === "white") return "#ffffff";
    if (canvasTheme === "chalkboard") return "#0e1e17";
    return "#070c18"; // Blueprint dark
  };

  return (
    <div
      className={cn(
        "w-full flex-1 flex flex-col justify-between overflow-x-hidden transition-all duration-300",
        isFullscreen
          ? "fixed inset-0 z-50 min-h-screen bg-slate-950 p-2 sm:p-5 overflow-y-auto"
          : "min-h-[calc(100dvh-4.5rem)] rounded-2xl md:rounded-3xl bg-slate-950/95 border border-indigo-500/20 shadow-2xl p-2 sm:p-4 lg:p-6"
      )}
    >
      {/* ─────────────────────────────────────────────────────────
          MISSION COMMAND COCKPIT HEADER
         ───────────────────────────────────────────────────────── */}
      <header className="w-full flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/20 pb-3 sm:pb-4 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-cyan-500/10 to-indigo-500/20 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-black tracking-tight text-white uppercase font-headline">
                {game?.title || "Math Mission: Situations"}
              </h1>
              {gameState !== "idle" && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-black uppercase px-2 py-0.5 rounded-full border",
                    difficulty === "beginner" && "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
                    difficulty === "intermediate" && "border-amber-500/50 bg-amber-500/10 text-amber-400",
                    difficulty === "advanced" && "border-rose-500/50 bg-rose-500/10 text-rose-400"
                  )}
                >
                  {difficulty}
                </Badge>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block">
              Analyze word problems, engineer calculations on the scratchpad, and submit numerical codes.
            </p>
          </div>
        </div>

        {/* Tactical HUD Counters */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {gameState === "playing" && (
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-black text-xs sm:text-sm tracking-widest shadow-sm",
                timeLeft < 30
                  ? "bg-rose-950/70 border-rose-500 text-rose-300 animate-pulse"
                  : "bg-slate-900/90 border-cyan-500/40 text-cyan-300"
              )}
              title="Time Remaining"
            >
              <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              <span>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </span>
            </div>
          )}

          {gameState !== "idle" && (
            <>
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-amber-300 font-black text-xs sm:text-sm shadow-sm"
                title="Current Score"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>{score} PTS</span>
              </div>

              {streak > 1 && (
                <div
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-950/50 border border-orange-500/40 text-orange-400 font-black text-xs animate-bounce"
                  title="Combo Streak"
                >
                  <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                  <span>{streak}x STREAK</span>
                </div>
              )}
            </>
          )}

          {/* Sound & Screen Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled((s) => !s)}
              className="h-8 w-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              title={soundEnabled ? "Mute SFX" : "Unmute SFX"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="h-8 w-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Cockpit"}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────
          MAIN MISSION INTERFACE
         ───────────────────────────────────────────────────────── */}
      <main className="w-full flex-1 flex flex-col justify-center py-3 sm:py-5 overflow-y-auto">
        {/* 1. IDLE / WELCOME SCREEN */}
        {gameState === "idle" && (
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center px-4 py-8 space-y-8 animate-in fade-in duration-500">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full blur-xl opacity-40 animate-pulse" />
              <div className="relative p-6 rounded-3xl bg-slate-900 border-2 border-cyan-500/40 shadow-2xl">
                <ScrollText className="w-16 h-16 text-cyan-300 mx-auto" />
              </div>
            </div>

            <div className="space-y-3 max-w-xl">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase font-headline">
                Math Mission: <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Situations</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                Step inside the analytical tactical lab. Decode multi-step situational word problems, calculate strategies on your digital scratchpad, and enter your numeric solution before the timer runs out!
              </p>
            </div>

            {/* Quick Feature Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl text-left">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-sm">
                <Lightbulb className="w-5 h-5 text-cyan-400 mb-2" />
                <h4 className="text-xs font-black uppercase text-white tracking-wider">Real Situations</h4>
                <p className="text-[11px] text-slate-400 mt-1">Realistic scenarios in shopping, travel, science, sports, and engineering.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-indigo-500/20 backdrop-blur-sm">
                <Pencil className="w-5 h-5 text-indigo-400 mb-2" />
                <h4 className="text-xs font-black uppercase text-white tracking-wider">Digital Canvas</h4>
                <p className="text-[11px] text-slate-400 mt-1">Full scratchpad with pen colors, eraser, line widths, and blueprint grid.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-sm">
                <Flame className="w-5 h-5 text-purple-400 mb-2" />
                <h4 className="text-xs font-black uppercase text-white tracking-wider">Tactical Scoring</h4>
                <p className="text-[11px] text-slate-400 mt-1">Earn speed bonuses, build unbroken streaks, and track tactical progress.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 w-full max-w-md pt-2">
              <Button
                onClick={() => setGameState("instructions")}
                size="lg"
                className="flex-1 h-13 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-base shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Sparkles className="mr-2 h-5 w-5 text-cyan-200" />
                Start Math Mission
              </Button>
              <Button
                variant="outline"
                onClick={() => setGameState("instructions")}
                className="h-13 rounded-2xl border-slate-700 hover:border-cyan-500/50 bg-slate-900/80 text-slate-300 font-bold text-sm cursor-pointer"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Briefing Guide
              </Button>
            </div>
          </div>
        )}

        {/* 2. INSTRUCTIONS SCREEN */}
        {gameState === "instructions" && (
          <div className="w-full max-w-2xl mx-auto p-5 sm:p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase text-white tracking-wide font-headline">Operational Protocol</h3>
                <p className="text-xs text-slate-400">Rules of engagement for situational decryption</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-black text-xs shrink-0">1</span>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-wide">Analyze the Scenario</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Read the situational briefing carefully. Identify given variables, constants, and the question goal.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-black text-xs shrink-0">2</span>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-wide">Use the Digital Workbench</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Sketch your formulas, diagrams, and calculations directly on the scratchpad with custom pen colors and tools.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-black text-xs shrink-0">3</span>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-wide">3-Minute Mission Clock</h4>
                  <p className="text-xs text-slate-400 mt-0.5">You have 180 seconds. Faster solutions yield significant speed bonuses to boost your score.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs shrink-0">4</span>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-wide">Numeric Verification</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Enter standard numbers only (e.g. 24, 3.5, or 300). The system accepts decimal results.</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setGameState("selecting_difficulty")}
              size="lg"
              className="w-full mt-6 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black uppercase tracking-wider text-sm shadow-xl cursor-pointer"
            >
              Select Challenge Tier
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* 3. CHALLENGE TIER SELECTION */}
        {gameState === "selecting_difficulty" && (
          <div className="w-full max-w-2xl mx-auto px-4 py-4 space-y-5 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-wide font-headline">
                Select Mission Clearance
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Choose the situational complexity tier matching your mathematical skill level
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {/* Beginner */}
              <button
                onClick={() => startRound("beginner")}
                className="group w-full p-4 sm:p-5 rounded-2xl bg-slate-900/80 hover:bg-emerald-950/40 border-2 border-emerald-500/30 hover:border-emerald-400 text-left transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between shadow-lg cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <h4 className="text-base sm:text-lg font-black uppercase text-emerald-400 tracking-wider">
                      Cadet Level (Beginner)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    Foundational word problems: single and two-step arithmetic, inventory tracking, simple sharing.
                  </p>
                  <span className="text-[10px] text-emerald-400/80 font-bold block pt-1">
                    CEFR A1–A2 • Elementary Mastery
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Intermediate */}
              <button
                onClick={() => startRound("intermediate")}
                className="group w-full p-4 sm:p-5 rounded-2xl bg-slate-900/80 hover:bg-amber-950/40 border-2 border-amber-500/30 hover:border-amber-400 text-left transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between shadow-lg cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <h4 className="text-base sm:text-lg font-black uppercase text-amber-400 tracking-wider">
                      Specialist Level (Intermediate)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    Multi-variable challenges: fractions, perimeter, area, travel speeds, discounts, unit rates.
                  </p>
                  <span className="text-[10px] text-amber-400/80 font-bold block pt-1">
                    CEFR B1–B2 • Middle School Logic
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Advanced */}
              <button
                onClick={() => startRound("advanced")}
                className="group w-full p-4 sm:p-5 rounded-2xl bg-slate-900/80 hover:bg-purple-950/40 border-2 border-purple-500/30 hover:border-purple-400 text-left transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between shadow-lg cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                    <h4 className="text-base sm:text-lg font-black uppercase text-purple-400 tracking-wider">
                      Master Agent (Advanced)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    High-level word problems: compound rates, volumetric geometry, physics acceleration, finance & statistics.
                  </p>
                  <span className="text-[10px] text-purple-400/80 font-bold block pt-1">
                    CEFR C1–C2 • Advanced Logic & Algebra
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        )}

        {/* 4. LOADING MISSION */}
        {gameState === "loading" && (
          <div className="w-full flex flex-col items-center justify-center py-16 space-y-4 text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <ScrollText className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-black uppercase tracking-widest text-cyan-300 font-headline animate-pulse">
                Synthesizing Tactical Briefing...
              </p>
              <p className="text-xs text-slate-400">Loading parameters and calibrating scratchpad...</p>
            </div>
          </div>
        )}

        {/* 5. ACTIVE PLAYING & ANSWERED COCKPIT (Desktop Wide 2-Column + Mobile Responsive Stack) */}
        {(gameState === "playing" || gameState === "answered") && problem && (
          <div className="w-full max-w-[1500px] mx-auto flex flex-col gap-4">
            {/* Mobile View Toggle Switch (<lg screens) */}
            <div className="flex lg:hidden w-full p-1 bg-slate-900 border border-indigo-500/20 rounded-2xl shrink-0">
              <button
                type="button"
                onClick={() => setMobileTab("briefing")}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                  mobileTab === "briefing"
                    ? "bg-cyan-500 text-slate-950 shadow-md font-black"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <ScrollText className="w-3.5 h-3.5" />
                Problem & Answer
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("scratchpad")}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                  mobileTab === "scratchpad"
                    ? "bg-cyan-500 text-slate-950 shadow-md font-black"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Pencil className="w-3.5 h-3.5" />
                Digital Scratchpad
              </button>
            </div>

            {/* Main Cockpit Body: Desktop 2 Columns, Mobile Tab Switchable */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch w-full">
              {/* ───────────────────────────────────────────────────
                  LEFT COLUMN: MISSION BRIEFING & ANSWER STATION
                 ─────────────────────────────────────────────────── */}
              <div
                className={cn(
                  "lg:col-span-6 xl:col-span-5 flex flex-col gap-4",
                  mobileTab === "scratchpad" && "hidden lg:flex"
                )}
              >
                {/* Mission Briefing Card */}
                <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-xl backdrop-blur-md flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5 font-headline">
                      <ScrollText className="w-3.5 h-3.5" />
                      Mission Briefing #{problem.id}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-700">
                      {problem.scenario}
                    </Badge>
                  </div>

                  {/* Problem Narrative */}
                  <div className="space-y-3">
                    <p className="text-base sm:text-lg text-slate-100 font-semibold leading-relaxed">
                      {problem.text}
                    </p>

                    {/* Key Clues / Given Numbers */}
                    {problem.clues && problem.clues.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                          Identified Parameters:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {problem.clues.map((clue, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-bold"
                            >
                              {clue}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Goal Prompt Box */}
                  <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 text-cyan-200">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" /> Target Goal:
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-white mt-0.5">{problem.goal}</p>
                  </div>
                </div>

                {/* Answer Station: In Playing Mode */}
                {gameState === "playing" ? (
                  <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-indigo-500/30 shadow-xl flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                        Enter Decoded Result:
                      </label>
                      <span className="text-[10px] text-slate-400">Numbers & Decimals</span>
                    </div>

                    {/* Value Display / Physical Input */}
                    <div className="relative">
                      <Input
                        ref={inputRef}
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="e.g. 24"
                        className="h-14 text-center font-black text-2xl sm:text-3xl tracking-wider bg-slate-950 border-2 border-cyan-500/40 text-cyan-300 rounded-2xl shadow-inner focus-visible:ring-cyan-400"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCheckAnswer();
                        }}
                      />
                      {userAnswer && (
                        <button
                          type="button"
                          onClick={() => setUserAnswer("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 text-xs"
                          title="Clear input"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Virtual Ergonomic Keypad (Essential for phones/tablets, convenient on desktop) */}
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                      {["7", "8", "9", "BACK", "4", "5", "6", "CLEAR", "1", "2", "3", "-", "0", ".", "SUBMIT"].map(
                        (key, i) => {
                          if (key === "BACK") {
                            return (
                              <Button
                                key={i}
                                type="button"
                                variant="outline"
                                onClick={() => handleKeypadPress("BACK")}
                                className="h-10 sm:h-11 rounded-xl bg-slate-950 border-slate-700 hover:bg-slate-800 text-rose-300 font-bold text-xs"
                                title="Backspace"
                              >
                                ⌫
                              </Button>
                            );
                          }
                          if (key === "CLEAR") {
                            return (
                              <Button
                                key={i}
                                type="button"
                                variant="outline"
                                onClick={() => handleKeypadPress("CLEAR")}
                                className="h-10 sm:h-11 rounded-xl bg-slate-950 border-slate-700 hover:bg-slate-800 text-slate-400 font-bold text-xs"
                              >
                                CLR
                              </Button>
                            );
                          }
                          if (key === "SUBMIT") {
                            return (
                              <Button
                                key={i}
                                type="button"
                                onClick={() => handleCheckAnswer()}
                                className="col-span-2 h-10 sm:h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95"
                              >
                                <Send className="w-3.5 h-3.5 mr-1" />
                                Submit
                              </Button>
                            );
                          }
                          return (
                            <Button
                              key={i}
                              type="button"
                              variant="outline"
                              onClick={() => handleKeypadPress(key)}
                              className="h-10 sm:h-11 rounded-xl bg-slate-950/80 border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/40 text-white font-bold text-base"
                            >
                              {key}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleSkip}
                        className="w-full text-xs font-bold text-slate-400 hover:text-white"
                      >
                        <SkipForward className="w-3.5 h-3.5 mr-1" />
                        Skip Problem
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Answered Debrief Card */
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/30 shadow-2xl space-y-4 animate-in zoom-in-95 duration-300">
                    <div
                      className={cn(
                        "p-4 rounded-2xl border flex items-center gap-3",
                        isCorrect
                          ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-300"
                          : "bg-rose-950/50 border-rose-500/50 text-rose-300"
                      )}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <h4 className="text-base sm:text-lg font-black uppercase tracking-wider font-headline">
                          {isCorrect ? "Mission Success! Decryption Verified" : "Calculation Error Detected"}
                        </h4>
                        <p className="text-xs opacity-90">
                          {isCorrect
                            ? "Great analytical work! Strategy confirmed."
                            : `Your answer was '${userAnswer || "empty"}'. Target answer is below.`}
                        </p>
                      </div>
                    </div>

                    {/* Solution & Explanation */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest block">
                          Verified Numerical Answer:
                        </span>
                        <div className="text-3xl sm:text-4xl font-black text-white font-mono mt-0.5">
                          {problem.answer}
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-3">
                        <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block mb-1">
                          Forensic Breakdown:
                        </span>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                          {problem.explanation}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => startRound(difficulty)}
                      size="lg"
                      className="w-full h-13 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wider shadow-xl cursor-pointer"
                    >
                      Next Mission Scenario
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>

              {/* ───────────────────────────────────────────────────
                  RIGHT COLUMN: DIGITAL WORKBENCH / SCRATCHPAD
                 ─────────────────────────────────────────────────── */}
              <div
                className={cn(
                  "lg:col-span-6 xl:col-span-7 flex flex-col gap-3",
                  mobileTab === "briefing" && "hidden lg:flex"
                )}
              >
                {/* Workbench Top Toolbar */}
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-lg flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 hidden sm:inline">
                      Tool:
                    </span>
                    {/* Pen Mode */}
                    <Button
                      variant={!isEraser ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setIsEraser(false);
                        canvasRef.current?.eraseMode(false);
                        sounds.playClick();
                      }}
                      className={cn(
                        "h-8 px-2.5 rounded-xl text-xs font-bold gap-1",
                        !isEraser
                          ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-md"
                          : "border-slate-700 text-slate-300"
                      )}
                      title="Pen Mode"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Pen</span>
                    </Button>

                    {/* Eraser Mode */}
                    <Button
                      variant={isEraser ? "default" : "outline"}
                      size="sm"
                      onClick={toggleEraser}
                      className={cn(
                        "h-8 px-2.5 rounded-xl text-xs font-bold gap-1",
                        isEraser
                          ? "bg-rose-500 hover:bg-rose-400 text-white font-black shadow-md"
                          : "border-slate-700 text-slate-300"
                      )}
                      title="Eraser Mode"
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Eraser</span>
                    </Button>

                    {/* Undo */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUndo}
                      className="h-8 px-2 rounded-xl border-slate-700 hover:bg-slate-800 text-slate-300 text-xs"
                      title="Undo Stroke"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                    </Button>

                    {/* Clear All */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCanvas}
                      className="h-8 px-2 rounded-xl border-slate-700 hover:bg-rose-950/40 text-rose-300 text-xs"
                      title="Clear Scratchpad"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Color Swatches */}
                  <div className="flex items-center gap-1.5">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => handleColorChange(c.hex)}
                        style={{ backgroundColor: c.hex }}
                        className={cn(
                          "w-6 h-6 rounded-full border-2 transition-transform shadow-sm cursor-pointer",
                          strokeColor === c.hex && !isEraser
                            ? "scale-125 border-white ring-2 ring-cyan-400/50"
                            : "border-black/30 hover:scale-110"
                        )}
                        title={c.label}
                      />
                    ))}
                  </div>

                  {/* Stroke Width & Canvas Theme */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    {/* Line Width */}
                    <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-0.5">
                      {STROKE_WIDTHS.map((w) => (
                        <button
                          key={w.val}
                          type="button"
                          onClick={() => {
                            setStrokeWidth(w.val);
                            sounds.playClick();
                          }}
                          className={cn(
                            "px-2 py-1 rounded-lg text-[10px] font-bold transition-all",
                            strokeWidth === w.val
                              ? "bg-cyan-500/20 text-cyan-300 font-black"
                              : "text-slate-400 hover:text-white"
                          )}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>

                    {/* Canvas Theme Selector */}
                    <button
                      type="button"
                      onClick={() => {
                        setCanvasTheme((t) => (t === "blueprint" ? "chalkboard" : t === "chalkboard" ? "white" : "blueprint"));
                        sounds.playClick();
                      }}
                      className="px-2 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-300 hover:text-white"
                      title="Cycle Canvas Background"
                    >
                      {canvasTheme === "blueprint" ? "Grid" : canvasTheme === "chalkboard" ? "Board" : "White"}
                    </button>
                  </div>
                </div>

                {/* Mobile Scratchpad Scroll Guard:
                    Allows natural up/down page scrolling on mobile without drawing accidental lines */}
                <div className="flex lg:hidden items-center justify-between px-2 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {touchScrollLocked ? "🔒 Scroll Locked (Draw freely)" : "👆 Page Scroll Active (Tap to lock for drawing)"}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setTouchScrollLocked((l) => !l)}
                    className="h-7 text-xs rounded-lg border-cyan-500/30 text-cyan-300"
                  >
                    {touchScrollLocked ? <Lock className="w-3 h-3 mr-1" /> : <Unlock className="w-3 h-3 mr-1" />}
                    {touchScrollLocked ? "Drawing Active" : "Allow Page Scroll"}
                  </Button>
                </div>

                {/* Canvas Drawing Frame */}
                <div
                  className={cn(
                    "w-full rounded-3xl border-2 border-indigo-500/30 shadow-2xl overflow-hidden relative transition-all",
                    isFullscreen
                      ? "h-[50vh] sm:h-[60vh] lg:h-[calc(100vh-16rem)]"
                      : "h-[320px] sm:h-[380px] lg:h-[480px] xl:h-[540px] 2xl:h-[600px]",
                    canvasTheme === "blueprint" && "bg-slate-950",
                    canvasTheme === "chalkboard" && "bg-[#0b1712]",
                    canvasTheme === "white" && "bg-white"
                  )}
                  style={{
                    backgroundImage:
                      canvasTheme === "blueprint"
                        ? "linear-gradient(to right, rgba(56, 189, 248, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.05) 1px, transparent 1px)"
                        : undefined,
                    backgroundSize: "24px 24px",
                  }}
                >
                  <DynamicCanvas
                    ref={canvasRef}
                    strokeColor={strokeColor}
                    strokeWidth={strokeWidth}
                    eraserWidth={strokeWidth * 4}
                    canvasColor="transparent"
                    className={cn(
                      "!h-full !w-full transition-all",
                      !touchScrollLocked && "touch-pan-y"
                    )}
                    width="100%"
                    height="100%"
                  />

                  {/* Subtle Canvas Watermark */}
                  <div className="absolute bottom-2 right-3 pointer-events-none opacity-30 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Math Scratchpad Workbench
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────
          MISSION COCKPIT FOOTER
         ───────────────────────────────────────────────────────── */}
      <footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-indigo-500/20 shrink-0">
        <Button
          variant="outline"
          asChild
          size="sm"
          className="w-full sm:w-auto rounded-xl border-slate-700 hover:border-rose-500/50 bg-slate-900/60 text-slate-300 hover:text-rose-300 font-bold text-xs"
        >
          <Link href="/games">← Exit to Cockpit</Link>
        </Button>

        <div className="flex items-center gap-2">
          {gameState === "idle" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGameState("instructions")}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-bold"
            >
              How to Play & Guide
            </Button>
          )}

          {gameState !== "idle" && gameState !== "selecting_difficulty" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setGameState("selecting_difficulty");
                sounds.playClick();
              }}
              className="rounded-xl border-slate-700 bg-slate-900/60 text-slate-300 text-xs font-bold"
            >
              <Repeat className="w-3.5 h-3.5 mr-1" />
              Change Tier
            </Button>
          )}

          {gameState === "answered" && (
            <Button
              size="sm"
              onClick={() => startRound(difficulty)}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs shadow-md"
            >
              Next Scenario →
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
