"use client";

import { shuffleArray } from "@/lib/shuffle";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Flame, Droplets, Bone, Repeat, Maximize, Minimize, BookOpen } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";

type Difficulty = "easy" | "intermediate" | "pro";

interface IdiomProblem {
  idiom: string;
  meaning: string;
  wrong: string[];
}

export function IdiomInferno({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<"idle" | "playing" | "showing_result" | "finished" | "instructions">("idle");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");
  const [currentIdiom, setCurrentIdiom] = React.useState<{idiom: string, meaning: string, options: string[]} | null>(null);
  const [sessionIdioms, setSessionIdioms] = React.useState<IdiomProblem[]>([]);
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [lavaLevel, setLavaLevel] = React.useState(0); // 0 to 100
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [resultStatus, setResultStatus] = React.useState<"correct" | "incorrect" | "burned">("correct");
  
  const { user } = useAuth();
  const firestore = useFirestore();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const idiomsByDifficulty: Record<Difficulty, IdiomProblem[]> = {
    easy: [
      { idiom: "Piece of cake", meaning: "Very easy", wrong: ["A dessert", "A small slice", "Something sweet"] },
      { idiom: "Break a leg", meaning: "Good luck", wrong: ["Get injured", "Fall down", "Dance well"] },
      { idiom: "Hit the sack", meaning: "Go to sleep", wrong: ["Punch a bag", "Pack a bag", "Win a game"] },
      { idiom: "Under the weather", meaning: "Feeling ill", wrong: ["Standing in rain", "Checking the forecast", "Feeling very hot"] },
      { idiom: "Spill the beans", meaning: "Reveal a secret", wrong: ["Drop your food", "Make a mess", "Cook dinner"] },
      { idiom: "Costs an arm and a leg", meaning: "Very expensive", wrong: ["A bodily injury", "Hospital bill", "Buying prosthetics"] },
      { idiom: "Call it a day", meaning: "Stop working", wrong: ["Look at calendar", "Name a holiday", "Go outside"] },
      { idiom: "Miss the boat", meaning: "Miss an opportunity", wrong: ["Drop your ticket", "Fail to swim", "Wait at the dock"] },
      { idiom: "See eye to eye", meaning: "Agree with someone", wrong: ["Stare closely", "Stand together", "Check vision"] },
      { idiom: "Once in a blue moon", meaning: "Very rarely", wrong: ["During the night", "Every month", "A lunar event"] },
      { idiom: "Bite the dust", meaning: "To fail or die", wrong: ["To clean up", "To eat dirt", "To work hard"] },
      { idiom: "Burn bridges", meaning: "Ruin relationships", wrong: ["Build pathways", "Cross a river", "Set fire to wood"] },
      { idiom: "Cry over spilled milk", meaning: "Complain about past", wrong: ["Drink milk", "Clean the floor", "Be happy"] },
      { idiom: "Cut the slack", meaning: "Don't be critical", wrong: ["Tighten rope", "Work overtime", "Loosen restrictions"] },
      { idiom: "Draw the line", meaning: "Set a limit", wrong: ["Paint a picture", "Make a path", "Cancel a rule"] },
      { idiom: "Easy does it", meaning: "Slow down", wrong: ["Work faster", "Do it well", "Simple task"] },
      { idiom: "Feel blue", meaning: "Feel sad", wrong: ["Feel cold", "Feel energetic", "Feel green"] },
      { idiom: "Go cold turkey", meaning: "Stop suddenly", wrong: ["Eat leftovers", "Travel north", "Get sick"] },
      { idiom: "Hang in there", meaning: "Don't give up", wrong: ["Climb high", "Wait outside", "Fall down"] },
      { idiom: "In the same boat", meaning: "Same situation", wrong: ["Sailing together", "Drowning", "Having fun"] },
      { idiom: "Keep in touch", meaning: "Maintain contact", wrong: ["Hold hands", "Stay close", "Never write"] },
      { idiom: "Let the cat out of the bag", meaning: "Reveal secret", wrong: ["Set pet free", "Go shopping", "Lose a game"] },
      { idiom: "Make a long story short", meaning: "Come to the point", wrong: ["Write a book", "Tell a joke", "Speak slowly"] },
      { idiom: "Play second fiddle", meaning: "Be less important", wrong: ["Play music", "Tune instrument", "Help the leader"] },
      { idiom: "Read between the lines", meaning: "Find hidden meaning", wrong: ["Wear glasses", "Scan quickly", "Skip pages"] },
      { idiom: "Ring a bell", meaning: "Sound familiar", wrong: ["Make noise", "Call someone", "Time to leave"] },
      { idiom: "Run out of steam", meaning: "Lose energy", wrong: ["Boil water", "Train delay", "Speed up"] },
      { idiom: "Safe and sound", meaning: "Safe", wrong: ["Hear noise", "Very quiet", "Locked up"] },
      { idiom: "Take it easy", meaning: "Relax", wrong: ["Work harder", "Bring objects", "Go faster"] },
      { idiom: "The last straw", meaning: "Final problem", wrong: ["Drinking tube", "Farm harvest", "Small victory"] },
      { idiom: "Through the grapevine", meaning: "Rumors", wrong: ["Fruit garden", "Wine press", "Direct news"] },
      { idiom: "Time flies", meaning: "Passes quickly", wrong: ["Insects buzzing", "Clocks moving", "Wasting hours"] },
      { idiom: "Touch and go", meaning: "Risky", wrong: ["Tap screen", "Run away", "Land plane"] },
      { idiom: "Under your nose", meaning: "In front of you", wrong: ["Smelling food", "Sneeze coming", "Hidden away"] },
      { idiom: "Up in the air", meaning: "Undecided", wrong: ["Flying plane", "Tossing coin", "High altitude"] },
      { idiom: "Watch your step", meaning: "Be careful", wrong: ["Look at shoes", "Count stairs", "Walk fast"] },
      { idiom: "Wear heart on sleeve", meaning: "Open emotions", wrong: ["Tattoo design", "Dress warmly", "Hide feelings"] },
      { idiom: "When pigs fly", meaning: "Never", wrong: ["Animal farm", "High speed", "Soon"] },
      { idiom: "Up the creek", meaning: "In trouble", wrong: ["Boating trip", "Going up", "Lost path"] },
      { idiom: "Rule of thumb", meaning: "Broad principle", wrong: ["Finger print", "Hit nail", "Measure size"] }
    ],
    intermediate: [
      { idiom: "Bite the bullet", meaning: "Endure a painful situation", wrong: ["Eat something hard", "Shoot an animal", "Run very fast"] },
      { idiom: "Cut corners", meaning: "Do something poorly to save time", wrong: ["Use scissors", "Drive dangerously", "Build a square"] },
      { idiom: "On the fence", meaning: "Undecided", wrong: ["Sitting outside", "Building a wall", "Trapped"] },
      { idiom: "Steal my thunder", meaning: "Take attention away from someone", wrong: ["Steal electricity", "Be loud", "Predict a storm"] },
      { idiom: "Through thick and thin", meaning: "Under all circumstances", wrong: ["Cutting wood", "Dieting", "Squeezing through spaces"] },
      { idiom: "Best of both worlds", meaning: "Ideal situation", wrong: ["Two planets", "Traveling far", "Being greedy"] },
      { idiom: "Jumping on the bandwagon", meaning: "Joining a popular trend", wrong: ["Playing instruments", "Riding a wagon", "Starting a band"] },
      { idiom: "Pulling my leg", meaning: "Joking with someone", wrong: ["Stretching", "Tripping someone", "Hurting me"] },
      { idiom: "Wrap my head around it", meaning: "Understand something complex", wrong: ["Wear a hat", "Spin around", "Get a headache"] },
      { idiom: "Hit the nail on the head", meaning: "Exactly right", wrong: ["Use a hammer", "Hurt your finger", "Build a house"] },
      { idiom: "Beat around the bush", meaning: "Avoid main topic", wrong: ["Trim plants", "Hunt animals", "Walk in circles"] },
      { idiom: "Burn the midnight oil", meaning: "Work late", wrong: ["Light a fire", "Cook food", "Waste fuel"] },
      { idiom: "Call the shots", meaning: "Decide", wrong: ["Take photos", "Drink small cups", "Aim weapon"] },
      { idiom: "Cry wolf", meaning: "False alarm", wrong: ["Hunt wild animal", "Shout loudly", "Be afraid"] },
      { idiom: "Devil's advocate", meaning: "Opposite side", wrong: ["Evil spirit", "Lawyer in court", "Satanic worship"] },
      { idiom: "Face the music", meaning: "Consequences", wrong: ["Listen to song", "Look at band", "Sing along"] },
      { idiom: "Get out of hand", meaning: "Out of control", wrong: ["Drop object", "Wash hands", "Quit job"] },
      { idiom: "Go the extra mile", meaning: "Extra effort", wrong: ["Run marathon", "Drive longer", "Get lost"] },
      { idiom: "Hit the books", meaning: "Study", wrong: ["Throw textbook", "Read novel", "Buy bookshelf"] },
      { idiom: "Let off steam", meaning: "Release anger", wrong: ["Boil water", "Take sauna", "Cool down"] },
      { idiom: "Lose your touch", meaning: "Lose skill", wrong: ["Drop item", "Stop feeling", "Get numb"] },
      { idiom: "On the ball", meaning: "Alert/capable", wrong: ["Play sports", "Roll sphere", "Bounce high"] },
      { idiom: "Pitch in", meaning: "Help", wrong: ["Throw ball", "Set tent", "Shout loud"] },
      { idiom: "Pull yourself together", meaning: "Calm down", wrong: ["Stand up", "Hug tightly", "Gather items"] },
      { idiom: "Rain on my parade", meaning: "Spoil plans", wrong: ["Weather forecast", "Walk in rain", "Watch festival"] },
      { idiom: "Rock the boat", meaning: "Cause trouble", wrong: ["Sail in storm", "Listen to music", "Catch fish"] },
      { idiom: "Skeleton in closet", meaning: "Hidden secret", wrong: ["Halloween prop", "Bones structure", "Wardrobe storage"] },
      { idiom: "Take with grain of salt", meaning: "Skeptical", wrong: ["Season food", "Eat healthily", "Add flavor"] },
      { idiom: "Elephant in the room", meaning: "Ignored issue", wrong: ["Wild animal", "Large furniture", "Zoo visit"] },
      { idiom: "Throw in the towel", meaning: "Give up", wrong: ["Dry yourself", "Do laundry", "Clean floor"] },
      { idiom: "Touch base", meaning: "Brief contact", wrong: ["Play baseball", "Build foundation", "Paint walls"] },
      { idiom: "Under wraps", meaning: "Secret", wrong: ["Wrap gifts", "Wear bandage", "Eat burritos"] },
      { idiom: "Up to speed", meaning: "Informed", wrong: ["Driving fast", "Accelerating", "Running late"] },
      { idiom: "Water under the bridge", meaning: "Past is past", wrong: ["River flow", "Crossing bridge", "Flooded path"] },
      { idiom: "Blow off steam", meaning: "Release stress", wrong: ["Clean engine", "Open valve", "Boil kettle"] },
      { idiom: "Burn a hole in pocket", meaning: "Want to spend", wrong: ["Fire hazard", "Lose coins", "Torn clothes"] },
      { idiom: "Close but no cigar", meaning: "Almost made it", wrong: ["Smoking habit", "Near distance", "Won prize"] },
      { idiom: "Down to earth", meaning: "Realistic", wrong: ["Fall down", "Dig soil", "Gravity pull"] },
      { idiom: "Clear as mud", meaning: "Very confusing", wrong: ["Wash face", "Rain shower", "Dirty water"] },
      { idiom: "Right off the bat", meaning: "Immediately", wrong: ["Play baseball", "Flying mammal", "Hit object"] }
    ],
    pro: [
      { idiom: "Kick the bucket", meaning: "To die", wrong: ["Play soccer", "Spill water", "Stub a toe"] },
      { idiom: "Barking up the wrong tree", meaning: "Pursuing a false lead", wrong: ["Lost in woods", "Being an animal", "Cutting wood"] },
      { idiom: "Bite off more than you can chew", meaning: "Take on too much responsibility", wrong: ["Eat too fast", "Choking hazard", "Order much food"] },
      { idiom: "By the skin of your teeth", meaning: "Just barely", wrong: ["Dental hygiene", "Eating tough food", "Smiling wide"] },
      { idiom: "Every cloud has a silver lining", meaning: "Good in every bad situation", wrong: ["Rain is coming", "Looking at sky", "Finding money"] },
      { idiom: "Go back to the drawing board", meaning: "Start over completely", wrong: ["Buy art supplies", "Erase a picture", "Become a student"] },
      { idiom: "Hear it on the grapevine", meaning: "Hear rumors", wrong: ["Drink wine", "Visit a farm", "Listen to radio"] },
      { idiom: "It takes two to tango", meaning: "Actions need two people to happen", wrong: ["Dancing lessons", "Going to a club", "Learning Spanish"] },
      { idiom: "Kill two birds with one stone", meaning: "Achieve two things at once", wrong: ["Hunting animals", "Throwing rocks", "Being cruel"] },
      { idiom: "Method to my madness", meaning: "A specific purpose in strange actions", wrong: ["Being crazy", "Losing your mind", "Acting angrily"] },
      { idiom: "Actions speak louder than words", meaning: "Deeds matter", wrong: ["Shouting loud", "Talking fast", "Silent movie"] },
      { idiom: "Add insult to injury", meaning: "Worse situation", wrong: ["Doctor fee", "Say mean things", "Get bandaged"] },
      { idiom: "Blessing in disguise", meaning: "Good but seemed bad", wrong: ["Wearing mask", "Church service", "Lucky charm"] },
      { idiom: "At the drop of a hat", meaning: "Instantly", wrong: ["Wind blowing", "Losing clothing", "Pick up item"] },
      { idiom: "Beat a dead horse", meaning: "Waste energy", wrong: ["Riding animal", "Veterinary care", "Farm work"] },
      { idiom: "Between a rock and hard place", meaning: "Two bad choices", wrong: ["Mountain climbing", "Get trapped", "Build house"] },
      { idiom: "Bite your tongue", meaning: "Stop speaking", wrong: ["Eat dinner", "Oral injury", "Taste food"] },
      { idiom: "Burn candle at both ends", meaning: "Overwork", wrong: ["Power outage", "Make light", "Save energy"] },
      { idiom: "Don't put all eggs in one basket", meaning: "Don't risk everything", wrong: ["Shopping trip", "Farm chores", "Break shell"] },
      { idiom: "Hit below the belt", meaning: "Act unfairly", wrong: ["Boxer punch", "Wear trousers", "Low level"] },
      { idiom: "In heat of the moment", meaning: "Say/do without thinking", wrong: ["Summer weather", "Warm kitchen", "Hurry up"] },
      { idiom: "Leave no stone unturned", meaning: "Search completely", wrong: ["Build path", "Look for bugs", "Throw rocks"] },
      { idiom: "Make no bones about it", meaning: "Direct", wrong: ["Skeleton anatomy", "Cook meat", "Speak softly"] },
      { idiom: "No pain no gain", meaning: "Suffering for progress", wrong: ["Get injured", "Win nothing", "Physical therapy"] },
      { idiom: "On cloud nine", meaning: "Very happy", wrong: ["Flying high", "Weather forecast", "Rain shower"] },
      { idiom: "Penny for thoughts", meaning: "What are you thinking?", wrong: ["Give money", "Buy items", "Save coins"] },
      { idiom: "Put cart before horse", meaning: "Wrong order", wrong: ["Farm driving", "Ride carriage", "Feed animal"] },
      { idiom: "Throw caution to wind", meaning: "Act recklessly", wrong: ["Stormy weather", "Fly kite", "Be careful"] },
      { idiom: "Wouldn't be caught dead", meaning: "Would never do", wrong: ["Cemetery visit", "Dressed up", "Passed away"] },
      { idiom: "Speak of the devil", meaning: "Talked person appears", wrong: ["Evil spirit", "Priest sermon", "Scary movie"] },
      { idiom: "Straight from horse's mouth", meaning: "High authority", wrong: ["Farm animal", "Dentist check", "Whisper secret"] },
      { idiom: "Cold shoulder", meaning: "Unfriendly", wrong: ["Winter weather", "Joint injury", "Wear jacket"] },
      { idiom: "Play fast and loose", meaning: "Irresponsible", wrong: ["Fast runner", "Untie knots", "Win games"] },
      { idiom: "Keep at bay", meaning: "Prevent coming near", wrong: ["Sailing boat", "Dog barking", "Water body"] },
      { idiom: "A penny saved is a penny earned", meaning: "Saving is wise", wrong: ["Spend coins", "Find money", "Bank deposit"] },
      { idiom: "Cut to the chase", meaning: "Get to the point", wrong: ["Run fast", "Action movie", "Car racing"] },
      { idiom: "Fit as a fiddle", meaning: "Very healthy", wrong: ["Tuned instrument", "Play music", "Correct size"] },
      { idiom: "Get a second wind", meaning: "Renewed energy", wrong: ["Blowing breeze", "Storm coming", "Breathe deeply"] },
      { idiom: "Go down in flames", meaning: "Fail spectacularly", wrong: ["Fire hazard", "Flying plane", "Light matches"] },
      { idiom: "Look before you leap", meaning: "Plan before acting", wrong: ["Jump high", "Check distance", "Safety first"] }
    ]
  };

  const getLavaSpeed = () => {
     if (difficulty === "easy") return 0.5;
     if (difficulty === "intermediate") return 1;
     return 1.8;
  };

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setRound(1);
    const pool = idiomsByDifficulty[diff];
    const shuffled = shuffleArray([...pool]);
    setSessionIdioms(shuffled);
    const item = shuffled[0];
    setCurrentIdiom({ idiom: item.idiom, meaning: item.meaning, options: shuffleArray([item.meaning, ...item.wrong]) });
    setLavaLevel(0);
    setGameState("playing");
  };

  const nextRound = () => {
    if (round >= 10) {
      setGameState("finished");
      if (firestore && game) {
        logAnalyticsEvent(firestore, user?.uid || 'guest', { type: 'game_played', details: { slug: game.slug, score, difficulty } });
      }
      return;
    }
    const item = sessionIdioms[round];
    if (item) {
      setCurrentIdiom({ idiom: item.idiom, meaning: item.meaning, options: shuffleArray([item.meaning, ...item.wrong]) });
    }
    setRound(r => r + 1);
    setLavaLevel(0);
    setGameState("playing");
  };

  const handleChoice = (ans: string | null) => {
    if (gameState !== "playing" || !currentIdiom) return;
    if (ans === currentIdiom.meaning) {
        setResultStatus("correct");
        const diffMultiplier = difficulty === "easy" ? 1 : difficulty === "intermediate" ? 1.5 : 2;
        setScore(prev => prev + Math.floor((100 - Math.floor(lavaLevel)) * diffMultiplier));
    } else if (ans === null) {
        setResultStatus("burned");
    } else {
        setResultStatus("incorrect");
    }
    setGameState("showing_result");
  };

  React.useEffect(() => {
    if (gameState === "playing") {
        const timer = setInterval(() => {
            setLavaLevel(prev => {
                const next = prev + getLavaSpeed();
                if (next >= 100) { clearInterval(timer); handleChoice(null); return 100; }
                return next; 
            });
        }, 100);
        return () => clearInterval(timer);
    }
  }, [gameState, difficulty]);

  if (!game) return null;

  return (
    <Card className={cn(
      "w-full transition-all duration-500 bg-neutral-950 flex flex-col relative border-none overflow-y-auto overflow-x-hidden",
      isFullscreen ? "fixed inset-0 z-50 rounded-none min-h-screen" : "flex-1 min-h-[calc(100dvh-4.5rem)] rounded-2xl md:rounded-3xl shadow-2xl"
    )}>
      <motion.div 
         animate={{ y: `${100 - (gameState === 'playing' ? lavaLevel : 0)}%` }}
         transition={{ ease: "linear", duration: 0.1 }}
         className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 opacity-40 z-0 pointer-events-none"
         style={{ filter: "url(#displacement-filter)" }}
      >
          <div className="absolute top-0 inset-x-0 h-8 sm:h-10 bg-white/20 backdrop-blur-md border-t-4 border-yellow-200" />
      </motion.div>

      <CardHeader className="z-10 bg-black/80 backdrop-blur-md relative border-b border-red-900/30 p-3 sm:p-6 shrink-0">
        <div className="flex justify-between items-center text-orange-100 gap-2">
           <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button variant="ghost" size="icon" asChild className="text-red-500/50 hover:text-red-400 shrink-0">
                 <Link href="/games"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></Link>
              </Button>
              <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 shrink-0" />
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-2xl font-black uppercase text-orange-400 font-mono tracking-wider truncate">Idiom Inferno</CardTitle>
                <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                    <Badge variant="outline" className="border-red-500/30 text-red-400 text-[10px] sm:text-xs">Level {round}/10</Badge>
                    {difficulty && <Badge variant="secondary" className="bg-red-950/60 text-red-300 text-[10px] uppercase">{difficulty}</Badge>}
                </div>
              </div>
           </div>
           <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGameState(gameState === "instructions" ? "idle" : "instructions")}
                className="border-red-500/40 text-orange-300 hover:bg-red-900/30 text-xs px-2 sm:px-3 h-8 sm:h-9"
              >
                <BookOpen className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">{gameState === "instructions" ? "Close Guide" : "How to Play"}</span>
              </Button>
              <div className="text-right">
                 <p className="text-[9px] sm:text-[10px] uppercase text-orange-700 font-bold tracking-wider">Safe Points</p>
                 <p className="text-lg sm:text-2xl font-black text-orange-400 tabular-nums">{score}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-red-500 h-8 w-8 sm:h-9 sm:w-9" onClick={onToggleFullscreen}>
                 {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
           </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col z-10 relative p-3 sm:p-6 items-center justify-center overflow-y-auto w-full max-w-full">
         <AnimatePresence mode="wait">
            {gameState === "instructions" && (
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="bg-neutral-900/95 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-red-800/60 max-w-xl w-full text-orange-200 space-y-4 my-auto">
                <div className="flex items-center gap-3 border-b border-red-800/40 pb-3">
                  <Flame className="w-6 h-6 text-orange-500 shrink-0" />
                  <h3 className="text-xl sm:text-2xl font-black text-orange-400 uppercase font-mono">How to Play: Idiom Inferno</h3>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-stone-300 leading-relaxed">
                  <p><strong className="text-orange-400">Objective:</strong> Decode 10 fiery idioms before the rising lava reaches the platform top!</p>
                  <div className="bg-black/60 p-3 sm:p-4 rounded-xl border border-red-900/40 space-y-2">
                    <p className="font-bold text-red-400">Rules & Survival Tips:</p>
                    <ul className="list-disc list-inside space-y-1 text-stone-300">
                      <li>Each round, an English idiom appears in quotations.</li>
                      <li>Select the true meaning from the 4 platform tiles before being consumed by lava.</li>
                      <li>Faster answers award more points based on remaining safety margin.</li>
                      <li>Wrong guesses or letting the lava overflow will burn your survival streak!</li>
                    </ul>
                  </div>
                </div>
                <Button onClick={() => setGameState("idle")} className="w-full h-11 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider rounded-xl font-mono">
                  Enter The Inferno
                </Button>
              </motion.div>
            )}

            {gameState === "idle" && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="m-auto text-center w-full max-w-md py-4">
                    <Flame className="w-20 h-20 sm:w-32 sm:h-32 text-orange-500 mx-auto animate-pulse drop-shadow-[0_0_30px_rgba(249,115,22,0.8)]" />
                    <h2 className="text-3xl sm:text-5xl font-black text-white uppercase mt-2 sm:mt-4 mb-2 font-mono">Escape the Heat</h2>
                    <p className="text-orange-200/60 mb-4 sm:mb-8 text-xs sm:text-sm">Select your survival difficulty.</p>
                    
                    <div className="flex flex-col gap-2.5 sm:gap-3">
                        <Button onClick={() => startGame("easy")} className="h-12 sm:h-14 px-4 sm:px-12 text-xs sm:text-base font-black bg-neutral-900 border-2 border-orange-500/30 hover:border-orange-500 text-orange-400 rounded-xl font-mono uppercase tracking-wider inline-flex gap-2 relative overflow-hidden group">
                           Easy (Slow) <Flame className="absolute right-4 text-orange-500/20 group-hover:text-orange-500/50 w-6 h-6" />
                        </Button>
                        <Button onClick={() => startGame("intermediate")} className="h-12 sm:h-14 px-4 sm:px-12 text-xs sm:text-base font-black bg-neutral-900 border-2 border-red-500/30 hover:border-red-500 text-red-400 rounded-xl font-mono uppercase tracking-wider inline-flex gap-2 relative overflow-hidden group">
                           Intermediate <Flame className="absolute right-4 text-red-500/20 group-hover:text-red-500/50 w-6 h-6" />
                        </Button>
                        <Button onClick={() => startGame("pro")} className="h-12 sm:h-14 px-4 sm:px-12 text-xs sm:text-base font-black bg-neutral-900 border-2 border-fuchsia-500/30 hover:border-fuchsia-500 text-fuchsia-400 rounded-xl font-mono uppercase tracking-wider inline-flex gap-2 relative overflow-hidden group">
                           Pro (Fast) <Flame className="absolute right-4 text-fuchsia-500/20 group-hover:text-fuchsia-500/50 w-6 h-6" />
                        </Button>
                        <Button variant="outline" onClick={() => setGameState("instructions")} className="border-red-500/40 text-orange-300 hover:bg-red-900/20 text-xs sm:text-sm h-10 sm:h-11 rounded-xl">
                           <BookOpen className="w-4 h-4 mr-2" /> How to Play Guide
                        </Button>
                        <Button variant="ghost" asChild className="text-orange-700 hover:text-orange-500 uppercase tracking-widest font-mono text-[11px] sm:text-xs">
                           <Link href="/games">Back to Games</Link>
                        </Button>
                    </div>
                </motion.div>
            )}

            {gameState === "playing" && currentIdiom && (
                <div className="m-auto w-full max-w-2xl text-center py-2">
                    <div className="bg-neutral-900/80 border-2 border-red-900/50 p-4 sm:p-8 rounded-2xl sm:rounded-3xl mb-4 sm:mb-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                        <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-red-500 mix-blend-overlay pointer-events-none" />
                        <p className="text-red-500 font-black uppercase tracking-wider text-[10px] sm:text-xs mb-2">What does this mean?</p>
                        <h1 className="text-xl sm:text-3xl md:text-5xl font-black text-white uppercase break-words">&ldquo;{currentIdiom.idiom}&rdquo;</h1>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                        {currentIdiom.options.map(opt => (
                            <Button key={opt} onClick={() => handleChoice(opt)} className="text-sm sm:text-lg font-bold bg-neutral-900/80 hover:bg-orange-600 text-orange-100 border border-orange-900/50 hover:border-orange-300 transition-all rounded-xl sm:rounded-2xl whitespace-normal min-h-[56px] sm:min-h-[72px] h-auto py-3 px-4 break-words">
                                {opt}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {gameState === "showing_result" && (
                <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:1.2, opacity:0}} className="m-auto text-center bg-black/80 p-5 sm:p-10 rounded-2xl sm:rounded-3xl backdrop-blur-md border border-neutral-800 w-full max-w-lg">
                    {resultStatus === "correct" && (
                        <>
                           <Droplets className="w-16 h-16 sm:w-28 sm:h-28 text-blue-400 mx-auto mb-3 sm:mb-4 drop-shadow-[0_0_30px_rgba(96,165,250,0.5)]" />
                           <h2 className="text-3xl sm:text-5xl font-black text-blue-400 uppercase tracking-wider font-mono">Cooled Down!</h2>
                           <p className="text-sm sm:text-xl text-stone-300 mt-2 sm:mt-4 font-medium break-words">Meaning: <span className="text-orange-400 font-black bg-neutral-900 px-3 py-1 rounded-lg ml-1">{currentIdiom?.meaning}</span></p>
                        </>
                    )}
                    {resultStatus === "incorrect" && (
                        <>
                           <Flame className="w-16 h-16 sm:w-28 sm:h-28 text-red-500 mx-auto mb-3 sm:mb-4 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]" />
                           <h2 className="text-3xl sm:text-5xl font-black text-red-500 uppercase tracking-wider font-mono">Burned!</h2>
                           <p className="text-sm sm:text-xl text-stone-300 mt-2 sm:mt-4 font-medium break-words">Meaning: <span className="text-orange-400 font-black bg-neutral-900 px-3 py-1 rounded-lg ml-1">{currentIdiom?.meaning}</span></p>
                        </>
                    )}
                    {resultStatus === "burned" && (
                        <>
                           <Bone className="w-16 h-16 sm:w-28 sm:h-28 text-stone-400 mx-auto mb-3 sm:mb-4 drop-shadow-[0_0_30px_rgba(168,162,158,0.5)]" />
                           <h2 className="text-3xl sm:text-5xl font-black text-stone-400 uppercase tracking-wider font-mono">Consumed!</h2>
                           <p className="text-sm sm:text-xl text-stone-300 mt-2 sm:mt-4 font-medium break-words">Meaning: <span className="text-orange-400 font-black bg-neutral-900 px-3 py-1 rounded-lg ml-1">{currentIdiom?.meaning}</span></p>
                        </>
                    )}

                    <div className="flex flex-col items-center gap-2.5 sm:gap-3 mt-6 sm:mt-8">
                        <Button onClick={nextRound} className="w-full sm:w-auto h-11 sm:h-14 px-6 sm:px-10 text-base sm:text-xl font-black bg-orange-600 text-white hover:bg-orange-500 rounded-xl shadow-2xl transition-all font-mono uppercase tracking-wider">
                            {round >= 10 ? "Extinguish" : "Next Idiom"}
                        </Button>
                        <Button variant="ghost" onClick={() => setGameState("idle")} className="text-orange-700 hover:text-orange-500 uppercase tracking-widest text-[11px] sm:text-xs">
                            Reset Heat
                        </Button>
                    </div>
                </motion.div>
            )}

            {gameState === "finished" && (
                <div className="m-auto text-center w-full max-w-lg p-4">
                    <h2 className="text-3xl sm:text-6xl font-black text-white uppercase font-mono mb-4">Out of the Fire</h2>
                    <p className="text-lg sm:text-2xl text-orange-400 font-bold mb-6 sm:mb-8 bg-neutral-900 border border-orange-900/50 p-4 sm:p-6 rounded-2xl shadow-2xl w-full">Total Score: <span className="text-white text-3xl sm:text-5xl ml-2">{score}</span></p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                       <Button onClick={() => {setGameState("idle"); setScore(0); setRound(0);}} className="h-11 sm:h-14 px-6 text-sm sm:text-base font-bold bg-white text-black hover:bg-neutral-200 font-mono uppercase tracking-wider rounded-xl"><Repeat className="mr-2 h-4 w-4"/> Play Again</Button>
                       <Button variant="outline" asChild className="h-11 sm:h-14 px-6 text-sm sm:text-base font-bold border-neutral-700 text-neutral-300 hover:bg-neutral-900 hover:text-white rounded-xl font-mono uppercase tracking-wider"><Link href="/games">Esc</Link></Button>
                    </div>
                </div>
            )}
         </AnimatePresence>
      </CardContent>
    </Card>
  );
}
