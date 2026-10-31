"use client";

import * as React from "react";
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
import { 
  Loader2, Sparkles, Repeat, Trophy, Globe, Key, Maximize, Minimize, 
  HelpCircle, Volume2, CheckCircle2, Compass, BookOpen, Layers
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import confetti from "canvas-confetti";

type GameState = "idle" | "spinning" | "result" | "revealed" | "instructions" | "all_spun";

export type Region = "All" | "Europe" | "Asia" | "Americas" | "Africa" | "Middle East" | "Oceania";

export type Country = {
  name: string;
  nationality: string;
  flag: string;
  region: Exclude<Region, "All">;
};

// Comprehensive Global Roster of 132 Nations across all inhabited continents
const ALL_COUNTRIES: Country[] = [
  // Europe (32)
  { name: "United Kingdom", nationality: "British", flag: "🇬🇧", region: "Europe" },
  { name: "France", nationality: "French", flag: "🇫🇷", region: "Europe" },
  { name: "Germany", nationality: "German", flag: "🇩🇪", region: "Europe" },
  { name: "Italy", nationality: "Italian", flag: "🇮🇹", region: "Europe" },
  { name: "Spain", nationality: "Spanish", flag: "🇪🇸", region: "Europe" },
  { name: "Portugal", nationality: "Portuguese", flag: "🇵🇹", region: "Europe" },
  { name: "Netherlands", nationality: "Dutch", flag: "🇳🇱", region: "Europe" },
  { name: "Belgium", nationality: "Belgian", flag: "🇧🇪", region: "Europe" },
  { name: "Switzerland", nationality: "Swiss", flag: "🇨🇭", region: "Europe" },
  { name: "Austria", nationality: "Austrian", flag: "🇦🇹", region: "Europe" },
  { name: "Sweden", nationality: "Swedish", flag: "🇸🇪", region: "Europe" },
  { name: "Norway", nationality: "Norwegian", flag: "🇳🇴", region: "Europe" },
  { name: "Denmark", nationality: "Danish", flag: "🇩🇰", region: "Europe" },
  { name: "Finland", nationality: "Finnish", flag: "🇫🇮", region: "Europe" },
  { name: "Ireland", nationality: "Irish", flag: "🇮🇪", region: "Europe" },
  { name: "Greece", nationality: "Greek", flag: "🇬🇷", region: "Europe" },
  { name: "Poland", nationality: "Polish", flag: "🇵🇱", region: "Europe" },
  { name: "Czech Republic", nationality: "Czech", flag: "🇨🇿", region: "Europe" },
  { name: "Hungary", nationality: "Hungarian", flag: "🇭🇺", region: "Europe" },
  { name: "Romania", nationality: "Romanian", flag: "🇷🇴", region: "Europe" },
  { name: "Ukraine", nationality: "Ukrainian", flag: "🇺🇦", region: "Europe" },
  { name: "Russia", nationality: "Russian", flag: "🇷🇺", region: "Europe" },
  { name: "Croatia", nationality: "Croatian", flag: "🇭🇷", region: "Europe" },
  { name: "Serbia", nationality: "Serbian", flag: "🇷🇸", region: "Europe" },
  { name: "Bulgaria", nationality: "Bulgarian", flag: "🇧🇬", region: "Europe" },
  { name: "Slovakia", nationality: "Slovak", flag: "🇸🇰", region: "Europe" },
  { name: "Slovenia", nationality: "Slovenian", flag: "🇸🇮", region: "Europe" },
  { name: "Iceland", nationality: "Icelandic", flag: "🇮🇸", region: "Europe" },
  { name: "Lithuania", nationality: "Lithuanian", flag: "🇱🇹", region: "Europe" },
  { name: "Latvia", nationality: "Latvian", flag: "🇱🇻", region: "Europe" },
  { name: "Estonia", nationality: "Estonian", flag: "🇪🇪", region: "Europe" },
  { name: "Luxembourg", nationality: "Luxembourgish", flag: "🇱🇺", region: "Europe" },

  // Asia (28)
  { name: "Japan", nationality: "Japanese", flag: "🇯🇵", region: "Asia" },
  { name: "China", nationality: "Chinese", flag: "🇨🇳", region: "Asia" },
  { name: "South Korea", nationality: "South Korean", flag: "🇰🇷", region: "Asia" },
  { name: "India", nationality: "Indian", flag: "🇮🇳", region: "Asia" },
  { name: "Vietnam", nationality: "Vietnamese", flag: "🇻🇳", region: "Asia" },
  { name: "Thailand", nationality: "Thai", flag: "🇹🇭", region: "Asia" },
  { name: "Philippines", nationality: "Filipino", flag: "🇵🇭", region: "Asia" },
  { name: "Indonesia", nationality: "Indonesian", flag: "🇮🇩", region: "Asia" },
  { name: "Malaysia", nationality: "Malaysian", flag: "🇲🇾", region: "Asia" },
  { name: "Singapore", nationality: "Singaporean", flag: "🇸🇬", region: "Asia" },
  { name: "Pakistan", nationality: "Pakistani", flag: "🇵🇰", region: "Asia" },
  { name: "Bangladesh", nationality: "Bangladeshi", flag: "🇧🇩", region: "Asia" },
  { name: "Sri Lanka", nationality: "Sri Lankan", flag: "🇱🇰", region: "Asia" },
  { name: "Nepal", nationality: "Nepalese", flag: "🇳🇵", region: "Asia" },
  { name: "Mongolia", nationality: "Mongolian", flag: "🇲🇳", region: "Asia" },
  { name: "Cambodia", nationality: "Cambodian", flag: "🇰🇭", region: "Asia" },
  { name: "Laos", nationality: "Laotian", flag: "🇱🇦", region: "Asia" },
  { name: "Myanmar", nationality: "Burmese", flag: "🇲🇲", region: "Asia" },
  { name: "Kazakhstan", nationality: "Kazakh", flag: "🇰🇿", region: "Asia" },
  { name: "Uzbekistan", nationality: "Uzbek", flag: "🇺🇿", region: "Asia" },
  { name: "Taiwan", nationality: "Taiwanese", flag: "🇹🇼", region: "Asia" },
  { name: "Maldives", nationality: "Maldivian", flag: "🇲🇻", region: "Asia" },
  { name: "Bhutan", nationality: "Bhutanese", flag: "🇧🇹", region: "Asia" },
  { name: "Brunei", nationality: "Bruneian", flag: "🇧🇳", region: "Asia" },
  { name: "Georgia", nationality: "Georgian", flag: "🇬🇪", region: "Asia" },
  { name: "Armenia", nationality: "Armenian", flag: "🇦🇲", region: "Asia" },
  { name: "Azerbaijan", nationality: "Azerbaijani", flag: "🇦🇿", region: "Asia" },
  { name: "Afghanistan", nationality: "Afghan", flag: "🇦🇫", region: "Asia" },

  // The Americas (26)
  { name: "United States", nationality: "American", flag: "🇺🇸", region: "Americas" },
  { name: "Canada", nationality: "Canadian", flag: "🇨🇦", region: "Americas" },
  { name: "Mexico", nationality: "Mexican", flag: "🇲🇽", region: "Americas" },
  { name: "Brazil", nationality: "Brazilian", flag: "🇧🇷", region: "Americas" },
  { name: "Argentina", nationality: "Argentinian", flag: "🇦🇷", region: "Americas" },
  { name: "Colombia", nationality: "Colombian", flag: "🇨🇴", region: "Americas" },
  { name: "Chile", nationality: "Chilean", flag: "🇨🇱", region: "Americas" },
  { name: "Peru", nationality: "Peruvian", flag: "🇵🇪", region: "Americas" },
  { name: "Venezuela", nationality: "Venezuelan", flag: "🇻🇪", region: "Americas" },
  { name: "Ecuador", nationality: "Ecuadorian", flag: "🇪🇨", region: "Americas" },
  { name: "Bolivia", nationality: "Bolivian", flag: "🇧🇴", region: "Americas" },
  { name: "Paraguay", nationality: "Paraguayan", flag: "🇵🇾", region: "Americas" },
  { name: "Uruguay", nationality: "Uruguayan", flag: "🇺🇾", region: "Americas" },
  { name: "Cuba", nationality: "Cuban", flag: "🇨🇺", region: "Americas" },
  { name: "Jamaica", nationality: "Jamaican", flag: "🇯🇲", region: "Americas" },
  { name: "Dominican Republic", nationality: "Dominican", flag: "🇩🇴", region: "Americas" },
  { name: "Costa Rica", nationality: "Costa Rican", flag: "🇨🇷", region: "Americas" },
  { name: "Panama", nationality: "Panamanian", flag: "🇵🇦", region: "Americas" },
  { name: "Guatemala", nationality: "Guatemalan", flag: "🇬🇹", region: "Americas" },
  { name: "Honduras", nationality: "Honduran", flag: "🇭🇳", region: "Americas" },
  { name: "El Salvador", nationality: "Salvadoran", flag: "🇸🇻", region: "Americas" },
  { name: "Nicaragua", nationality: "Nicaraguan", flag: "🇳🇮", region: "Americas" },
  { name: "Haiti", nationality: "Haitian", flag: "🇭🇹", region: "Americas" },
  { name: "Bahamas", nationality: "Bahamian", flag: "🇧🇸", region: "Americas" },
  { name: "Trinidad and Tobago", nationality: "Trinidadian", flag: "🇹🇹", region: "Americas" },
  { name: "Barbados", nationality: "Barbadian", flag: "🇧🇧", region: "Americas" },

  // Africa (26)
  { name: "Egypt", nationality: "Egyptian", flag: "🇪🇬", region: "Africa" },
  { name: "South Africa", nationality: "South African", flag: "🇿🇦", region: "Africa" },
  { name: "Nigeria", nationality: "Nigerian", flag: "🇳🇬", region: "Africa" },
  { name: "Kenya", nationality: "Kenyan", flag: "🇰🇪", region: "Africa" },
  { name: "Morocco", nationality: "Moroccan", flag: "🇲🇦", region: "Africa" },
  { name: "Ghana", nationality: "Ghanaian", flag: "🇬🇭", region: "Africa" },
  { name: "Ethiopia", nationality: "Ethiopian", flag: "🇪🇹", region: "Africa" },
  { name: "Algeria", nationality: "Algerian", flag: "🇩🇿", region: "Africa" },
  { name: "Tunisia", nationality: "Tunisian", flag: "🇹🇳", region: "Africa" },
  { name: "Senegal", nationality: "Senegalese", flag: "🇸🇳", region: "Africa" },
  { name: "Uganda", nationality: "Ugandan", flag: "🇺🇬", region: "Africa" },
  { name: "Tanzania", nationality: "Tanzanian", flag: "🇹🇿", region: "Africa" },
  { name: "Zimbabwe", nationality: "Zimbabwean", flag: "🇿🇼", region: "Africa" },
  { name: "Ivory Coast", nationality: "Ivorian", flag: "🇨🇮", region: "Africa" },
  { name: "Cameroon", nationality: "Cameroonian", flag: "🇨🇲", region: "Africa" },
  { name: "Madagascar", nationality: "Malagasy", flag: "🇲🇬", region: "Africa" },
  { name: "Rwanda", nationality: "Rwandan", flag: "🇷🇼", region: "Africa" },
  { name: "Zambia", nationality: "Zambian", flag: "🇿🇲", region: "Africa" },
  { name: "Angola", nationality: "Angolan", flag: "🇦🇴", region: "Africa" },
  { name: "Mozambique", nationality: "Mozambican", flag: "🇲🇿", region: "Africa" },
  { name: "Sudan", nationality: "Sudanese", flag: "🇸🇩", region: "Africa" },
  { name: "Namibia", nationality: "Namibian", flag: "🇳🇦", region: "Africa" },
  { name: "Botswana", nationality: "Motswana", flag: "🇧🇼", region: "Africa" },
  { name: "Mauritius", nationality: "Mauritian", flag: "🇲🇺", region: "Africa" },
  { name: "Mali", nationality: "Malian", flag: "🇲🇱", region: "Africa" },
  { name: "DR Congo", nationality: "Congolese", flag: "🇨🇩", region: "Africa" },

  // Middle East (12)
  { name: "Saudi Arabia", nationality: "Saudi", flag: "🇸🇦", region: "Middle East" },
  { name: "United Arab Emirates", nationality: "Emirati", flag: "🇦🇪", region: "Middle East" },
  { name: "Turkey", nationality: "Turkish", flag: "🇹🇷", region: "Middle East" },
  { name: "Israel", nationality: "Israeli", flag: "🇮🇱", region: "Middle East" },
  { name: "Jordan", nationality: "Jordanian", flag: "🇯🇴", region: "Middle East" },
  { name: "Lebanon", nationality: "Lebanese", flag: "🇱🇧", region: "Middle East" },
  { name: "Qatar", nationality: "Qatari", flag: "🇶🇦", region: "Middle East" },
  { name: "Kuwait", nationality: "Kuwaiti", flag: "🇰🇼", region: "Middle East" },
  { name: "Oman", nationality: "Omani", flag: "🇴🇲", region: "Middle East" },
  { name: "Bahrain", nationality: "Bahraini", flag: "🇧🇭", region: "Middle East" },
  { name: "Iraq", nationality: "Iraqi", flag: "🇮🇶", region: "Middle East" },
  { name: "Iran", nationality: "Iranian", flag: "🇮🇷", region: "Middle East" },

  // Oceania (8)
  { name: "Australia", nationality: "Australian", flag: "🇦🇺", region: "Oceania" },
  { name: "New Zealand", nationality: "New Zealander", flag: "🇳🇿", region: "Oceania" },
  { name: "Fiji", nationality: "Fijian", flag: "🇫🇯", region: "Oceania" },
  { name: "Papua New Guinea", nationality: "Papua New Guinean", flag: "🇵🇬", region: "Oceania" },
  { name: "Samoa", nationality: "Samoan", flag: "🇼🇸", region: "Oceania" },
  { name: "Tonga", nationality: "Tongan", flag: "🇹🇴", region: "Oceania" },
  { name: "Solomon Islands", nationality: "Solomon Islander", flag: "🇸🇧", region: "Oceania" },
  { name: "Vanuatu", nationality: "Ni-Vanuatu", flag: "🇻🇺", region: "Oceania" },
];

// Rich, high-contrast arcade wheel colors with alternating vibrance
const WHEEL_COLORS = [
  "#2563EB", "#DB2777", "#059669", "#D97706", "#7C3AED", "#0891B2",
  "#DC2626", "#0D9488", "#EA580C", "#4F46E5", "#65A30D", "#C026D3",
  "#3B82F6", "#EC4899", "#10B981", "#F59E0B", "#8B5CF6", "#06B6D4",
];

const REGION_OPTIONS: { id: Region; label: string; icon: string; count: number }[] = [
  { id: "All", label: "Global", icon: "🌐", count: 132 },
  { id: "Europe", label: "Europe", icon: "🇪🇺", count: 32 },
  { id: "Asia", label: "Asia", icon: "🌏", count: 28 },
  { id: "Americas", label: "Americas", icon: "🌎", count: 26 },
  { id: "Africa", label: "Africa", icon: "🌍", count: 26 },
  { id: "Middle East", label: "Middle East", icon: "🕌", count: 12 },
  { id: "Oceania", label: "Oceania", icon: "🏝️", count: 8 },
];

// Helper to select an optimal, stable set of 12 destinations for the active spinning wheel
function initWheelStage(region: Region, used: string[]): Country[] {
  const pool = region === "All" ? ALL_COUNTRIES : ALL_COUNTRIES.filter((c) => c.region === region);
  const unvisited = pool.filter((c) => !used.includes(c.name));

  // If pool has <= 14 countries (like Middle East with 12, Oceania with 8), mount all of them directly
  if (pool.length <= 14) {
    return pool;
  }

  // If remaining unvisited is fewer than 12, pad with visited to preserve wheel symmetry
  if (unvisited.length <= 12) {
    const visited = pool.filter((c) => used.includes(c.name));
    return [...unvisited, ...visited].slice(0, 12);
  }

  return unvisited.slice(0, 12);
}

export function WorldTourWheel({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [selectedRegion, setSelectedRegion] = React.useState<Region>("All");
  const [result, setResult] = React.useState<Country | null>(null);
  const [rotation, setRotation] = React.useState(0);
  const [usedCountries, setUsedCountries] = React.useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isPassportOpen, setIsPassportOpen] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [passportSearch, setPassportSearch] = React.useState("");

  // STABLE active wheel destinations in state: ensures wheel never reshuffles under the needle!
  const [stageCountries, setStageCountries] = React.useState<Country[]>(() => initWheelStage("All", []));

  const game = getGameBySlug(slug);
  const { toast } = useToast();

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  // Countries filtered by active region
  const regionCountries = React.useMemo(() => {
    if (selectedRegion === "All") return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter((c) => c.region === selectedRegion);
  }, [selectedRegion]);

  // Available (unvisited) in active region
  const availableCountries = React.useMemo(() => {
    return regionCountries.filter((c) => !usedCountries.includes(c.name));
  }, [regionCountries, usedCountries]);

  // Switch region cleanly
  const handleRegionChange = (newRegion: Region) => {
    if (gameState === "spinning") return;
    const initialStage = initWheelStage(newRegion, []);
    setSelectedRegion(newRegion);
    setStageCountries(initialStage);
    setUsedCountries([]);
    setGameState("idle");
    setResult(null);
  };

  // Realistic synthetic click sound via Web Audio API
  const playRealisticTickSequence = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();

      // Realistic decelerating tick timing pattern over 3.8s
      let elapsed = 0;
      let delay = 35;
      const ticks: number[] = [];
      while (elapsed < 3700) {
        ticks.push(elapsed);
        elapsed += delay;
        if (elapsed > 1000) delay += 7;
        if (elapsed > 2200) delay += 18;
        if (elapsed > 3000) delay += 40;
      }

      ticks.forEach((t) => {
        setTimeout(() => {
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(1400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.02);
            gain.gain.setValueAtTime(0.09, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.02);
          } catch (e) {}
        }, t);
      });
    } catch (e) {}
  };

  const handleSpin = () => {
    // Check if entire expedition is complete
    if (availableCountries.length === 0) {
      setGameState("all_spun");
      try {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
      return;
    }

    // Check if all destinations on current stage wheel are already visited
    let activeWheel = stageCountries;
    let unvisitedOnWheel = activeWheel.filter((c) => !usedCountries.includes(c.name));

    if (unvisitedOnWheel.length === 0) {
      activeWheel = initWheelStage(selectedRegion, usedCountries);
      setStageCountries(activeWheel);
      unvisitedOnWheel = activeWheel.filter((c) => !usedCountries.includes(c.name));
    }

    setGameState("spinning");
    setResult(null);
    playRealisticTickSequence();

    // Pick target strictly from unvisited on this exact active wheel
    const targetCountry = unvisitedOnWheel[Math.floor(Math.random() * unvisitedOnWheel.length)];
    const winningIndex = activeWheel.findIndex((c) => c.name === targetCountry.name);

    // Exact target angle calculation: slice midpoint lands 100.00% under top 12 o'clock pointer
    const total = activeWheel.length;
    const segmentAngle = 360 / total;
    const midAngle = (winningIndex + 0.5) * segmentAngle;

    const spinCycles = 6;
    const currentRotationMod = ((rotation % 360) + 360) % 360;
    const targetOffset = (360 - midAngle) % 360;
    const diff = (((targetOffset - currentRotationMod) % 360) + 360) % 360;
    const newRotation = rotation + spinCycles * 360 + diff;

    setRotation(newRotation);

    setTimeout(() => {
      setResult(targetCountry);
      setUsedCountries((prev) => [...prev, targetCountry.name]);
      setGameState("result");
    }, 4000);
  };

  const handleReveal = () => setGameState("revealed");

  const resetGame = () => {
    const initialStage = initWheelStage(selectedRegion, []);
    setStageCountries(initialStage);
    setGameState("idle");
    setResult(null);
    setUsedCountries([]);
  };

  const handleSpeak = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const { audio } = await textToSpeech(text);
      const audioEl = new Audio(audio);
      audioEl.play();
      audioEl.onended = () => setIsSpeaking(false);
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  const Icon = game.icon;
  const visitedPercentage = Math.round((usedCountries.length / regionCountries.length) * 100);

  return (
    <Card
      className={cn(
        "w-full flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full flex flex-col justify-start overflow-y-auto overflow-x-hidden rounded-2xl md:rounded-3xl border border-border/20 shadow-xl bg-card/80 backdrop-blur-sm transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none p-2 sm:p-6 bg-background"
      )}
    >
      <CardHeader className={cn(
        "text-center relative px-4 transition-all",
        gameState !== "idle" && gameState !== "instructions" ? "pt-2 sm:pt-4 pb-1 sm:pb-2" : "pt-4 sm:pt-6 pb-2"
      )}>
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-1.5 z-20">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 sm:px-3 text-xs gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => setGameState(gameState === "instructions" ? "idle" : "instructions")}
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Guide</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 sm:px-3 text-xs gap-1 text-muted-foreground hover:text-foreground"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? "Exit" : "Full"}</span>
          </Button>
        </div>

        <div className={cn("flex justify-center mb-1", gameState !== "idle" && gameState !== "instructions" && "hidden sm:flex")}>
          <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
        </div>
        <CardTitle className={cn(
          "font-black tracking-tight uppercase",
          gameState !== "idle" && gameState !== "instructions" ? "text-lg sm:text-2xl md:text-3xl" : "text-xl sm:text-3xl md:text-4xl"
        )}>
          {game.title}
        </CardTitle>
        <CardDescription className={cn(
          "text-xs sm:text-sm max-w-xl mx-auto",
          gameState !== "idle" && gameState !== "instructions" && "hidden sm:block"
        )}>
          {game.description}
        </CardDescription>

        {/* Region Filter Selection Bar */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 w-full max-w-2xl mx-auto pt-2 pb-1">
          {REGION_OPTIONS.map((region) => (
            <button
              key={region.id}
              type="button"
              onClick={() => handleRegionChange(region.id)}
              disabled={gameState === "spinning"}
              className={cn(
                "px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 border",
                selectedRegion === region.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                  : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/40"
              )}
            >
              <span>{region.icon}</span>
              <span>{region.label}</span>
              <span className="text-[10px] opacity-75 font-mono">({region.count})</span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          "w-full flex-1 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 pb-16 sm:pb-20 max-w-5xl mx-auto overflow-visible",
          isFullscreen ? "min-h-[60vh] max-w-6xl" : "min-h-[20rem]"
        )}
      >
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-5 text-center max-w-md mx-auto py-6 animate-in fade-in duration-200">
            <div className="p-4 rounded-3xl bg-primary/10 text-primary">
              <Globe className="w-12 h-12" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-black uppercase tracking-tight text-xl sm:text-2xl">
                {selectedRegion === "All" ? "Global Tour Expedition" : `${selectedRegion} Expedition`}
              </h3>
              <p className={cn("text-muted-foreground text-xs sm:text-sm")}>
                Spin the realistic destination wheel to tour nations and master their official nationalities!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button onClick={() => setGameState("instructions")} variant="outline" className="h-11 sm:h-12 px-6 rounded-xl font-bold">
                <HelpCircle className="mr-2 h-4 w-4" /> How to Play
              </Button>
              <Button
                onClick={handleSpin}
                className="h-11 sm:h-12 px-8 rounded-xl font-black bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg"
              >
                <Sparkles className="mr-2 h-5 w-5" /> Spin Wheel ({availableCountries.length} Unvisited)
              </Button>
            </div>
          </div>
        )}

        {gameState === "instructions" && (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-2xl mx-auto border border-border/20 shadow-inner w-full animate-in zoom-in-95 duration-200",
              isFullscreen ? "p-6 sm:p-12 max-w-3xl" : "p-5 sm:p-8 max-w-lg"
            )}
          >
            <h3 className={cn("font-black uppercase tracking-wider text-center", isFullscreen ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl")}>
              How to Play
            </h3>
            <div className={cn("text-left space-y-3 text-muted-foreground w-full", isFullscreen ? "text-base sm:text-lg" : "text-xs sm:text-sm")}>
              <p className="flex items-start gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>Choose your destination region (Global or a specific continent).</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>Spin the realistic wheel — watch each country's flag and name spin past the top ticker pin.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>The needle lands exactly on the destination. State its nationality before hitting "Reveal Nationality".</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-primary">4.</span>
                <span>Listen to native pronunciation and stamp all {regionCountries.length} nations on your passport!</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4">
              <Button onClick={() => setGameState("idle")} variant="outline" className="h-10 sm:h-11 px-5 rounded-xl font-bold">
                Back
              </Button>
              <Button
                onClick={handleSpin}
                className="h-10 sm:h-11 px-8 rounded-xl font-black bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg"
              >
                Launch Expedition
              </Button>
            </div>
          </div>
        )}

        {(gameState === "spinning" || gameState === "result" || gameState === "revealed") && (
          <div className="w-full max-w-5xl mx-auto py-2 flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-10 items-center justify-center">
            {/* Realistic Arcade World Tour Wheel (Desktop Left / Mobile Top) */}
            <div className="lg:col-span-6 flex flex-col items-center justify-start w-full pt-6 sm:pt-10 pb-2">
              <div
                className="relative flex items-center justify-center select-none w-[210px] h-[210px] xs:w-[240px] xs:h-[240px] sm:w-[300px] sm:h-[300px] md:w-[360px] md:h-[360px] lg:w-[420px] lg:h-[420px] max-w-[90vw] max-h-[90vw] shrink-0"
              >
                {/* 3D Realistic Physical Needle / Flapper Pin at 12 o'clock */}
                <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                  <div className="px-2 py-0.5 rounded-full bg-slate-950/90 border border-amber-400/80 text-[8px] sm:text-[9px] font-black tracking-widest text-amber-300 uppercase shadow-md mb-0.5">
                    ▼ TARGET ▼
                  </div>
                  {/* Brass mounting bracket */}
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 border-2 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-950 shadow-inner" />
                  </div>
                  {/* Tapered Needle pointing straight down into 12 o'clock */}
                  <div
                    className={cn(
                      "w-0 h-0 border-l-[12px] sm:border-l-[16px] border-l-transparent border-r-[12px] sm:border-r-[16px] border-r-transparent border-t-[28px] sm:border-t-[36px] border-t-amber-400 -mt-1 drop-shadow-[0_5px_8px_rgba(0,0,0,0.6)] origin-top transition-transform",
                      gameState === "spinning" && "animate-[wiggle_0.1s_ease-in-out_infinite]"
                    )}
                  />
                </div>

                {/* Outer Realistic Metallic Bezel Container */}
                <div className="w-full h-full rounded-full p-2.5 sm:p-3.5 bg-gradient-to-tr from-amber-700 via-amber-400 to-yellow-200 shadow-[0_10px_35px_rgba(0,0,0,0.4)] border-2 border-amber-600/60 flex items-center justify-center">
                  <div className="w-full h-full rounded-full border-4 border-slate-900 shadow-inner overflow-hidden bg-slate-950 relative">
                    <div
                      className="w-full h-full relative"
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: "transform 4s cubic-bezier(0.15, 0.95, 0.35, 1.0)",
                      }}
                    >
                      <svg viewBox="-220 -220 440 440" className="w-full h-full select-none overflow-visible">
                        <defs>
                          {/* Radial badge shadow */}
                          <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4" />
                          </filter>
                          {/* Metallic peg gradient */}
                          <radialGradient id="pegGradient" cx="35%" cy="35%" r="65%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="40%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#78350f" />
                          </radialGradient>
                          {/* Outer metallic hub gradient */}
                          <radialGradient id="outerHubGradient" cx="30%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="50%" stopColor="#ca8a04" />
                            <stop offset="100%" stopColor="#78350f" />
                          </radialGradient>
                          {/* Inner metallic hub gradient */}
                          <radialGradient id="innerHubGradient" cx="35%" cy="35%" r="65%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="50%" stopColor="#e2e8f0" />
                            <stop offset="100%" stopColor="#64748b" />
                          </radialGradient>
                        </defs>

                        {/* Wheel Slices with Flags and Clear Labels */}
                        {stageCountries.map((country, index) => {
                          const total = stageCountries.length;
                          const startAngle = (index * 360) / total;
                          const endAngle = ((index + 1) * 360) / total;
                          const midAngle = (startAngle + endAngle) / 2;

                          // Trigonometric slice coordinates (-90deg for 12 o'clock top origin)
                          const rad1 = ((startAngle - 90) * Math.PI) / 180;
                          const rad2 = ((endAngle - 90) * Math.PI) / 180;
                          const x1 = Math.cos(rad1) * 196;
                          const y1 = Math.sin(rad1) * 196;
                          const x2 = Math.cos(rad2) * 196;
                          const y2 = Math.sin(rad2) * 196;
                          const largeArc = 360 / total > 180 ? 1 : 0;
                          const d = `M 0 0 L ${x1} ${y1} A 196 196 0 ${largeArc} 1 ${x2} ${y2} Z`;
                          const isUsed = usedCountries.includes(country.name);
                          const isLanded = result?.name === country.name && (gameState === "result" || gameState === "revealed");

                          return (
                            <g key={country.name}>
                              {/* Slice colored sector */}
                              <path
                                d={d}
                                fill={WHEEL_COLORS[index % WHEEL_COLORS.length]}
                                className={cn(
                                  "transition-opacity duration-300",
                                  isUsed && "opacity-20 grayscale",
                                  isLanded && "filter drop-shadow-[0_0_12px_rgba(254,240,138,0.9)]"
                                )}
                                stroke={isLanded ? "#fef08a" : "#ffffff"}
                                strokeWidth={isLanded ? "3.5" : "1.5"}
                              />

                              {/* Slice Content (Flag Badge + Bold Country Name) */}
                              <g transform={`rotate(${midAngle})`}>
                                {/* Crisp Country Flag Badge near outer rim */}
                                <g transform="translate(0, -150)">
                                  <circle r="16" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" filter="url(#badgeShadow)" />
                                  <text
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize="18"
                                    className="select-none pointer-events-none"
                                  >
                                    {country.flag}
                                  </text>
                                </g>

                                {/* Country Name radially readable towards center */}
                                <g transform="translate(0, -116)">
                                  <text
                                    transform={midAngle > 90 && midAngle < 270 ? "rotate(90)" : "rotate(-90)"}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className="font-black fill-white text-[10px] sm:text-[12px] uppercase tracking-tight select-none pointer-events-none"
                                    style={{
                                      textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 0 2px #000000",
                                    }}
                                  >
                                    {country.name.length > 14 ? country.name.slice(0, 12) + ".." : country.name}
                                  </text>
                                </g>
                              </g>
                            </g>
                          );
                        })}

                        {/* Physical 3D Brass Pegs (Studs) along slice boundaries */}
                        {stageCountries.map((_, index) => {
                          const total = stageCountries.length;
                          const startAngle = (index * 360) / total;
                          const rad = ((startAngle - 90) * Math.PI) / 180;
                          const px = Math.cos(rad) * 196;
                          const py = Math.sin(rad) * 196;
                          return (
                            <g key={`peg-${index}`}>
                              <circle cx={px} cy={py} r="4.5" fill="url(#pegGradient)" stroke="#78350f" strokeWidth="1" filter="url(#badgeShadow)" />
                              <circle cx={px - 1} cy={py - 1} r="1.5" fill="#fef08a" opacity="0.8" />
                            </g>
                          );
                        })}

                        {/* Realistic Center Metallic Hub */}
                        <circle cx="0" cy="0" r="42" fill="url(#outerHubGradient)" stroke="#fef08a" strokeWidth="2.5" filter="url(#badgeShadow)" />
                        <circle cx="0" cy="0" r="30" fill="url(#innerHubGradient)" stroke="#ca8a04" strokeWidth="1.5" />
                        <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
                        <text cx="0" cy="0" textAnchor="middle" dominantBaseline="central" fontSize="13" className="select-none pointer-events-none">
                          🧭
                        </text>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Passport Intel & Destination Side */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left gap-4 w-full">
              {/* Visited Progress Tracker */}
              <div className="w-full p-3 sm:p-4 rounded-2xl bg-card border border-border/30 shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-muted-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    Passport Visas: {selectedRegion}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs font-black">
                      {usedCountries.length} / {regionCountries.length} Visited ({visitedPercentage}%)
                    </Badge>
                    <Dialog open={isPassportOpen} onOpenChange={setIsPassportOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] font-bold uppercase text-primary">
                          <BookOpen className="w-3 h-3 mr-1" /> View Passport
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 font-black uppercase text-xl">
                            <Compass className="w-5 h-5 text-primary" /> World Tour Passport Visa Collection
                          </DialogTitle>
                          <DialogDescription>
                            Review all 132 nations across the globe and track your verified nationality visas.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-2">
                          <input
                            type="text"
                            placeholder="Search country or nationality..."
                            value={passportSearch}
                            onChange={(e) => setPassportSearch(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border bg-muted/30 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5 custom-scrollbar">
                          {ALL_COUNTRIES.filter(
                            (c) =>
                              c.name.toLowerCase().includes(passportSearch.toLowerCase()) ||
                              c.nationality.toLowerCase().includes(passportSearch.toLowerCase()) ||
                              c.region.toLowerCase().includes(passportSearch.toLowerCase())
                          ).map((country) => {
                            const isStamped = usedCountries.includes(country.name);
                            return (
                              <div
                                key={country.name}
                                className={cn(
                                  "p-2.5 rounded-xl border flex flex-col justify-between gap-1 text-left transition-all",
                                  isStamped
                                    ? "bg-primary/10 border-primary/40 shadow-sm"
                                    : "bg-muted/20 border-border/30 opacity-70"
                                )}
                              >
                                <div className="flex items-start justify-between">
                                  <span className="text-2xl">{country.flag}</span>
                                  {isStamped ? (
                                    <Badge className="bg-green-600 text-[10px] font-bold h-5 px-1.5 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" /> Stamped
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 opacity-60">
                                      {country.region}
                                    </Badge>
                                  )}
                                </div>
                                <div>
                                  <p className="font-black text-xs truncate">{country.name}</p>
                                  <p className="text-[11px] text-primary font-bold">{country.nationality}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300 rounded-full"
                    style={{ width: `${(usedCountries.length / regionCountries.length) * 100}%` }}
                  />
                </div>
              </div>

              {gameState === "spinning" && (
                <div className="flex flex-col items-center lg:items-start gap-3 w-full p-6 rounded-2xl bg-muted/30 border border-primary/20 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin text-primary h-6 w-6 sm:h-8 sm:w-8" />
                    <span className="font-black uppercase tracking-widest text-sm sm:text-base animate-pulse text-primary">
                      Calibrating Flight Coordinates...
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Spinning past global destinations to touch down on today&apos;s mystery nation!
                  </p>
                </div>
              )}

              {(gameState === "result" || gameState === "revealed") && result && (
                <div className="flex flex-col items-center lg:items-start gap-4 animate-in zoom-in-95 duration-300 w-full">
                  <div className="p-5 sm:p-7 rounded-2xl bg-primary/10 border-2 border-primary/40 shadow-xl w-full">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold uppercase tracking-widest text-muted-foreground text-xs sm:text-sm">
                        Destination Reached:
                      </p>
                      <Badge variant="outline" className="font-bold text-xs bg-card/80">
                        {result.region}
                      </Badge>
                    </div>

                    {/* Matching Country Flag and Name matching the wheel slice 100% */}
                    <div className="flex items-center gap-3.5 my-2">
                      <span className="text-4xl sm:text-6xl drop-shadow-md select-none">{result.flag}</span>
                      <p className="font-black text-primary uppercase italic text-3xl sm:text-5xl md:text-6xl tracking-tight leading-none">
                        {result.name}
                      </p>
                    </div>

                    {gameState === "revealed" && (
                      <div className="mt-4 pt-4 border-t border-primary/20 animate-in fade-in duration-300 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-bold uppercase tracking-widest text-muted-foreground text-xs">
                            Official Nationality:
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleSpeak(`${result.name}. ${result.nationality}.`)}
                            disabled={isSpeaking}
                            className="h-7 px-2.5 rounded-lg text-xs font-bold gap-1"
                          >
                            {isSpeaking ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Volume2 className="h-3.5 w-3.5 text-primary" />
                            )}
                            Listen
                          </Button>
                        </div>

                        <p className="font-black text-amber-500 uppercase text-3xl sm:text-4xl md:text-5xl leading-tight">
                          {result.nationality}
                        </p>
                        <p className="text-xs sm:text-sm text-foreground/80 font-medium italic mt-2">
                          Sentence: &quot;They are <strong className="text-amber-500">{result.nationality}</strong>.&quot;
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="w-full flex flex-col sm:flex-row gap-3 mt-3 mb-2">
                    {gameState === "result" && (
                      <Button
                        type="button"
                        onClick={handleReveal}
                        className="w-full sm:w-auto h-11 sm:h-12 px-8 rounded-xl font-black uppercase shadow-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all hover:scale-105 active:scale-95"
                      >
                        <Key className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Reveal Nationality
                      </Button>
                    )}

                    {gameState === "revealed" && (
                      <Button
                        type="button"
                        onClick={handleSpin}
                        className="w-full sm:w-auto h-11 sm:h-12 px-8 rounded-xl font-black bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all hover:scale-105 active:scale-95"
                      >
                        <Repeat className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Next Destination ({availableCountries.length} left)
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === "all_spun" && (
          <div className="text-center flex flex-col items-center gap-4 sm:gap-6 animate-in zoom-in-95 duration-300 w-full max-w-md mx-auto py-6">
            <Trophy className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] h-16 w-16 sm:h-24 sm:w-24 animate-pulse" />
            <div className="space-y-1.5">
              <h3 className="font-black uppercase tracking-tight text-xl sm:text-3xl">Expedition Complete!</h3>
              <p className="font-bold text-primary uppercase text-sm sm:text-base">
                All {regionCountries.length} Nations in {selectedRegion} Surveyed
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                type="button"
                onClick={resetGame}
                className="flex-1 h-11 sm:h-12 px-6 rounded-xl font-black bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg"
              >
                <Repeat className="mr-2 h-4 w-4" />
                New Expedition
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPassportOpen(true)}
                className="h-11 sm:h-12 px-6 rounded-xl font-bold"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                View Visas
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="w-full shrink-0 mt-auto flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10 bg-card/95 backdrop-blur-md relative z-10">
        <Button variant="outline" asChild size="sm" className="w-full sm:w-auto h-9 sm:h-10 px-4 text-xs sm:text-sm font-semibold rounded-xl">
          <Link href="/games">Back to Library</Link>
        </Button>
        {gameState !== "idle" && gameState !== "instructions" && (
          <Button variant="secondary" onClick={resetGame} size="sm" className="w-full sm:w-auto h-9 sm:h-10 px-4 text-xs sm:text-sm font-semibold rounded-xl">
            Reset Expedition
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
