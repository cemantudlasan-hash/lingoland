"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, RotateCcw, Volume2, VolumeX, Maximize2, HelpCircle, 
  ChevronRight, Coins, ArrowLeft, Lightbulb, Zap, Shield, ToggleLeft, ToggleRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { audioEngine } from "../AudioEngine";
import { CIRCUIT_CRAFTER_LEVELS, CircuitLevel, CircuitComponent } from "@/lib/new-games-data";
import { getDailyMissions, getDailyBonusGame } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type CellState = Omit<CircuitComponent, "id"> & { id: string; isOpen?: boolean };

export function CircuitCrafter({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced" | null>(null);
  const [score, setScore] = useState(0);
  const [levelIndex, setLevelIndex] = useState(0);
  const [currentLevel, setCurrentLevel] = useState<CircuitLevel | null>(null);
  const [grid, setGrid] = useState<CellState[][]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [inventory, setInventory] = useState<CircuitLevel["inventory"]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDaily, setIsDaily] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  useEffect(() => {
    const dailyMissions = getDailyMissions();
    const { slug: dailyBonusSlug } = getDailyBonusGame();
    const isDailyGame = dailyMissions.some(m => m.slug === slug) || dailyBonusSlug === slug;
    setIsDaily(isDailyGame);
  }, [slug]);
  const [showHint, setShowHint] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    status: "open" | "short" | "dim" | "blown" | "success";
    current: number;
    voltage: number;
    resistance: number;
    path: [number, number][];
  } | null>(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  // Initialize a grid of empty cells
  const initGrid = useCallback((level: CircuitLevel) => {
    const size = level.gridSize;
    const initialGrid: CellState[][] = Array(size).fill(null).map((_, y) => 
      Array(size).fill(null).map((_, x) => ({
        type: "empty",
        x,
        y,
        id: `cell-${x}-${y}`
      }))
    );

    // Apply fixed components
    level.fixedComponents.forEach(comp => {
      if (comp.x < size && comp.y < size) {
        initialGrid[comp.y][comp.x] = {
          ...comp,
          id: `cell-${comp.x}-${comp.y}`,
          isOpen: comp.type === "switch" ? true : undefined
        };
      }
    });

    setGrid(initialGrid);
    setInventory(JSON.parse(JSON.stringify(level.inventory)));
    setSelectedTool(null);
    setSimulationActive(false);
    setSimulationResult(null);
    setShowHint(false);
  }, []);

  // Sandbox dynamic level generator to prevent repetition when fixed levels run out
  const generateProceduralLevel = useCallback((diff: "beginner" | "intermediate" | "advanced", index: number): CircuitLevel => {
    const size = diff === "beginner" ? 3 : 4;
    
    // Choose battery and bulb positions randomly
    const batX = 0;
    const batY = Math.floor(Math.random() * (size - 1));
    const bulbX = size - 1;
    const bulbY = Math.floor(Math.random() * (size - 1)) + 1;

    const voltage = diff === "beginner" ? 9 : diff === "intermediate" ? 12 : 24;
    const bulbResistance = diff === "beginner" ? 10 : diff === "intermediate" ? 6 : 8;
    
    // Define safe currents
    let currentRange: [number, number] = [0.3, 1.2];
    if (diff === "intermediate") currentRange = [0.5, 0.9];
    if (diff === "advanced") currentRange = [0.8, 1.2];

    const fixedComponents: Omit<CircuitComponent, "id">[] = [
      { type: "battery", voltage, x: batX, y: batY, isFixed: true },
      { type: "bulb", resistance: bulbResistance, currentRange, x: bulbX, y: bulbY, isFixed: true }
    ];

    // Add obstacles in intermediate/advanced
    if (diff !== "beginner") {
      fixedComponents.push({ type: "block", x: 1, y: 1, isFixed: true });
    }

    // Build inventory
    const inv: CircuitLevel["inventory"] = [
      { type: "wire", count: size * size }
    ];

    if (diff === "intermediate") {
      inv.push({ type: "resistor", resistance: 14, count: 1 });
      inv.push({ type: "resistor", resistance: 8, count: 1 });
    } else if (diff === "advanced") {
      inv.push({ type: "resistor", resistance: 16, count: 1 });
      inv.push({ type: "resistor", resistance: 8, count: 2 });
    }

    return {
      id: `cc-gen-${diff}-${index}`,
      title: `Ecosystem Node ${index + 1}`,
      difficulty: diff,
      gridSize: size,
      fixedComponents,
      inventory: inv,
      hint: "Create a complete series loop from battery to bulb and back.",
      description: `Restore power on this ship substation. Bulb requires ${currentRange[0]}A - ${currentRange[1]}A.`
    };
  }, []);

  const loadLevel = useCallback((diff: "beginner" | "intermediate" | "advanced", idx: number) => {
    const matchedLevels = CIRCUIT_CRAFTER_LEVELS.filter(l => l.difficulty === diff);
    let level: CircuitLevel;

    if (idx < matchedLevels.length) {
      level = matchedMatches(matchedLevels, idx); // matches
      level = matchedLevels[idx];
    } else {
      level = generateProceduralLevel(diff, idx);
    }

    setCurrentLevel(level);
    initGrid(level);
  }, [generateProceduralLevel, initGrid]);

  const handleStart = (diff: "beginner" | "intermediate" | "advanced") => {
    setDifficulty(diff);
    setScore(0);
    setLevelIndex(0);
    setGameFinished(false);
    setCoinsEarned(0);
    audioEngine.playMove();
    loadLevel(diff, 0);

    window.dispatchEvent(new CustomEvent('lingoland_game_started_hijack'));
  };

  const handleMuteToggle = () => {
    const nextMute = audioEngine.toggleMute();
    setIsMuted(nextMute);
  };

  // Grid Cell Click
  const handleCellClick = (x: number, y: number) => {
    if (simulationActive) return;
    const cell = grid[y][x];
    if (cell.isFixed) {
      // Toggle switch if clicked
      if (cell.type === "switch") {
        audioEngine.playMove();
        setGrid(prev => prev.map((row, rY) => row.map((c, cX) => {
          if (rY === y && cX === x) {
            return { ...c, isOpen: !c.isOpen };
          }
          return c;
        })));
      }
      return;
    }

    audioEngine.playMove();

    // If cell is not empty, return component to inventory
    if (cell.type !== "empty") {
      setInventory(prev => prev.map(invItem => {
        if (
          invItem.type === cell.type &&
          (invItem.type !== "resistor" || invItem.resistance === cell.resistance) &&
          (invItem.type !== "battery" || invItem.voltage === cell.voltage)
        ) {
          return { ...invItem, count: invItem.count + 1 };
        }
        return invItem;
      }));

      setGrid(prev => prev.map((row, rY) => row.map((c, cX) => {
        if (rY === y && cX === x) {
          return { type: "empty", x, y, id: `cell-${x}-${y}` };
        }
        return c;
      })));
      return;
    }

    // Place selected tool
    if (!selectedTool) return;

    const matchedInvIndex = inventory.findIndex(item => {
      if (item.type !== selectedTool) return false;
      if (selectedTool === "resistor") {
        // Parse selected resistance from tool string, e.g., "resistor-15"
        const rVal = parseInt(selectedTool.split("-")[1] || "10", 10);
        return item.resistance === rVal;
      }
      if (selectedTool === "battery") {
        const vVal = parseInt(selectedTool.split("-")[1] || "12", 10);
        return item.voltage === vVal;
      }
      return true;
    });

    if (matchedInvIndex === -1 || inventory[matchedInvIndex].count <= 0) return;

    // Place it
    const item = inventory[matchedInvIndex];
    setGrid(prev => prev.map((row, rY) => row.map((c, cX) => {
      if (rY === y && cX === x) {
        return {
          type: item.type,
          voltage: item.voltage,
          resistance: item.resistance || (item.type === "wire" ? 1 : 0), // Wires have small internal resistance
          x,
          y,
          id: `cell-${x}-${y}`,
          isOpen: item.type === "switch" ? true : undefined
        };
      }
      return c;
    })));

    // Decrement inventory
    setInventory(prev => prev.map((invItem, idx) => 
      idx === matchedInvIndex ? { ...invItem, count: invItem.count - 1 } : invItem
    ));
  };

  // Nodal pathfinder to find simple loops between battery terminals
  const solveCircuit = useCallback((): typeof simulationResult => {
    if (!currentLevel) return null;
    const size = currentLevel.gridSize;

    // Find the battery and bulb
    let batteryCell: CellState | null = null;
    let bulbCell: CellState | null = null;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const cell = grid[y][x];
        if (cell.type === "battery") batteryCell = cell;
        if (cell.type === "bulb") bulbCell = cell;
      }
    }

    if (!batteryCell || !bulbCell) {
      return { status: "open", current: 0, voltage: 0, resistance: 0, path: [] };
    }

    // Trace paths from battery. We search for a closed loop of adjacent connected components.
    // Adjacent coordinates
    const getNeighbors = (x: number, y: number) => {
      const neighbors: [number, number][] = [];
      const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      dirs.forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
          neighbors.push([nx, ny]);
        }
      });
      return neighbors;
    };

    // DFS to find paths from battery to itself, traversing the bulb
    let finalPath: [number, number][] = [];
    let isBulbTraversed = false;
    let hasOpenSwitch = false;

    const findLoop = (
      cx: number, cy: number, 
      px: number, py: number, 
      visited: Set<string>, 
      currentPath: [number, number][]
    ): boolean => {
      const cell = grid[cy][cx];
      
      // Stop if empty, block, or not conductive
      if (cell.type === "empty" || cell.type === "block") return false;

      // Check if switch is open
      if (cell.type === "switch" && cell.isOpen) {
        hasOpenSwitch = true;
        return false;
      }

      const key = `${cx},${cy}`;
      if (visited.has(key)) {
        // Closed loop hit! Check if we returned to the battery
        if (cell.type === "battery" && currentPath.length > 2) {
          // Verify if bulb was hit
          const bulbInPath = currentPath.some(([px, py]) => grid[py][px].type === "bulb");
          if (bulbInPath) {
            finalPath = [...currentPath];
            isBulbTraversed = true;
            return true;
          }
        }
        return false;
      }

      visited.add(key);
      const neighbors = getNeighbors(cx, cy);

      for (let i = 0; i < neighbors.length; i++) {
        const [nx, ny] = neighbors[i];
        if (nx === px && ny === py) continue; // Don't backtrack to immediate parent
        if (findLoop(nx, ny, cx, cy, new Set(visited), [...currentPath, [cx, cy]])) {
          return true;
        }
      }

      return false;
    };

    // Run DFS starting from battery neighbors
    const batNeighbors = getNeighbors(batteryCell.x, batteryCell.y);
    for (let i = 0; i < batNeighbors.length; i++) {
      const [nx, ny] = batNeighbors[i];
      if (findLoop(nx, ny, batteryCell.x, batteryCell.y, new Set([`${batteryCell.x},${batteryCell.y}`]), [[batteryCell.x, batteryCell.y]])) {
        break;
      }
    }

    if (finalPath.length === 0) {
      if (hasOpenSwitch) {
        return { status: "open", current: 0, voltage: 0, resistance: 0, path: [] };
      }
      return { status: "open", current: 0, voltage: 0, resistance: 0, path: [] };
    }

    // Closed loop found. Calculate resistance and voltage.
    let totalResistance = 0;
    let totalVoltage = batteryCell.voltage || 9;

    // Sum resistances of unique components in the path
    const uniqueKeys = new Set<string>();
    finalPath.forEach(([px, py]) => {
      const key = `${px},${py}`;
      if (!uniqueKeys.has(key)) {
        uniqueKeys.add(key);
        const cell = grid[py][px];
        if (cell.type === "bulb") {
          totalResistance += cell.resistance || 10;
        } else if (cell.type === "resistor") {
          totalResistance += cell.resistance || 10;
        } else if (cell.type === "wire") {
          totalResistance += cell.resistance || 1; // 1 Ohm per wire piece
        }
      }
    });

    if (totalResistance === 0) {
      return { status: "short", current: 999, voltage: totalVoltage, resistance: 0, path: finalPath };
    }

    const current = parseFloat((totalVoltage / totalResistance).toFixed(2));
    const range = bulbCell.currentRange || [0.3, 1.2];

    let status: "dim" | "blown" | "success" = "success";
    if (current < range[0]) {
      status = "dim";
    } else if (current > range[1]) {
      status = "blown";
    }

    return {
      status,
      current,
      voltage: totalVoltage,
      resistance: totalResistance,
      path: finalPath
    };
  }, [grid, currentLevel]);

  // Run or Stop circuit simulation
  const toggleSimulation = () => {
    if (simulationActive) {
      setSimulationActive(false);
      setSimulationResult(null);
      audioEngine.playMove();
    } else {
      audioEngine.playMove();
      const result = solveCircuit();
      setSimulationResult(result);
      setSimulationActive(true);

      if (result) {
        if (result.status === "success") {
          audioEngine.playCorrect();
          setScore(prev => prev + 1);

          const coinRewards = isDaily ? (difficulty === "beginner" ? 2.0 : difficulty === "intermediate" ? 4.0 : 6.0) : 0;
          setCoinsEarned(prev => prev + coinRewards);
          window.dispatchEvent(new CustomEvent('lingoland_game_answered_hijack'));

          setTimeout(() => {
            const nextIdx = levelIndex + 1;
            if (nextIdx >= 5) {
              setGameFinished(true);
              audioEngine.playLevelSuccess();
              window.dispatchEvent(new CustomEvent('lingoland_game_completed_hijack', {
                detail: { state: 'finished' }
              }));
            } else {
              setLevelIndex(nextIdx);
              loadLevel(difficulty!, nextIdx);
            }
          }, 2000);
        } else {
          audioEngine.playIncorrect();
        }
      }
    }
  };

  return (
    <div
      className={cn(
        "w-full flex flex-col justify-between relative overflow-hidden transition-all duration-500",
        isFullscreen
          ? "min-h-screen h-screen rounded-none border-none p-6 sm:p-8 bg-[#0c1424] text-white"
          : "min-h-[calc(100vh-112px)] rounded-3xl p-6 border border-blue-900/40 shadow-2xl bg-[#0c1424] text-white"
      )}
    >
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12),transparent)]" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-blue-950 pb-4 z-10">
        <div className="flex items-center gap-3">
          {difficulty ? (
            <button
              onClick={() => setDifficulty(null)}
              className="p-2 hover:bg-slate-900 rounded-xl transition border border-slate-800/60"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-blue-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              Circuit Crafter
            </h1>
            <p className="text-[10px] text-slate-400">Conduct current flow using Ohm's Law components</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHelp(true)}
            className="h-9 w-9 text-slate-400 hover:text-white"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMuteToggle}
            className="h-9 w-9 text-slate-400 hover:text-white"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
          </Button>
          {onToggleFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="h-9 w-9 text-slate-400 hover:text-white"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-grow flex flex-col justify-center items-center py-4 z-10">
        <AnimatePresence mode="wait">
          {!difficulty ? (
            /* Select Difficulty */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-md text-center flex flex-col gap-6"
              key="difficulty-selection"
            >
              <div className="space-y-2">
                <Zap className="h-12 w-12 text-blue-400 mx-auto animate-pulse" />
                <h2 className="text-2xl font-black tracking-tight uppercase">Select Electrical Substation</h2>
                <p className="text-sm text-slate-400 font-medium">Rebuild the spaceship's circuit relays. Keep voltages and resistance in balance.</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleStart("beginner")}
                  className="w-full bg-slate-900/40 border border-blue-950 hover:border-blue-500/40 p-4 rounded-2xl flex items-center justify-between group transition-all duration-300 hover:translate-x-1"
                >
                  <div className="text-left">
                    <span className="text-xs font-black text-blue-400 uppercase tracking-widest font-mono">Substation Alpha</span>
                    <h3 className="font-bold text-slate-200">Beginner - Direct Grid Loop</h3>
                    <p className="text-xs text-slate-500 mt-0.5">3x3 grid, simple wire bypass routing</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-blue-400 transition" />
                </button>

                <button
                  onClick={() => handleStart("intermediate")}
                  className="w-full bg-slate-900/40 border border-blue-950 hover:border-cyan-500/40 p-4 rounded-2xl flex items-center justify-between group transition-all duration-300 hover:translate-x-1"
                >
                  <div className="text-left">
                    <span className="text-xs font-black text-cyan-400 uppercase tracking-widest font-mono">Substation Beta</span>
                    <h3 className="font-bold text-slate-200">Intermediate - Resistance Limiting</h3>
                    <p className="text-xs text-slate-500 mt-0.5">4x4 grid, series circuits, placing resistors to prevent burnouts</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-cyan-400 transition" />
                </button>

                <button
                  onClick={() => handleStart("advanced")}
                  className="w-full bg-slate-900/40 border border-blue-950 hover:border-indigo-500/40 p-4 rounded-2xl flex items-center justify-between group transition-all duration-300 hover:translate-x-1"
                >
                  <div className="text-left">
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-widest font-mono">Substation Delta</span>
                    <h3 className="font-bold text-slate-200">Advanced - Multi-Branch Parallel</h3>
                    <p className="text-xs text-slate-500 mt-0.5">4x4 grid, parallel split grids, Ohm's law calculation</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-indigo-400 transition" />
                </button>
              </div>
            </motion.div>
          ) : gameFinished ? (
            /* Completed Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-md space-y-6"
              key="game-finished"
            >
              <div className="w-20 h-20 bg-blue-500/10 rounded-full border border-blue-500/20 flex items-center justify-center mx-auto shadow-lg">
                <Shield className="h-10 w-10 text-blue-400 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tight">Relays Energized!</h2>
                <p className="text-sm text-slate-400">All 5 subsystems have been successfully balanced and repowered.</p>
              </div>

              <div className={cn("bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl grid gap-4", isDaily ? "grid-cols-2" : "grid-cols-1")}>
                <div className={cn("text-center", isDaily && "border-r border-slate-800")}>
                  <span className="text-[10px] uppercase font-black text-blue-400">Subgrids Repaired</span>
                  <p className="text-3xl font-black text-slate-100">{score}/5</p>
                </div>
                {isDaily && (
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-black text-amber-400 font-mono">Coins Reward</span>
                    <p className="text-3xl font-black text-amber-400 flex items-center justify-center gap-1">
                      <Coins className="h-6 w-6 fill-amber-400 text-amber-500" />
                      +{coinsEarned.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDifficulty(null)}
                  className="flex-grow py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm font-black uppercase tracking-wider hover:bg-slate-850 transition"
                >
                  Change Level
                </button>
                <button
                  onClick={() => handleStart(difficulty)}
                  className="flex-grow py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-650 text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-95 transition"
                >
                  Repower Again
                </button>
              </div>
            </motion.div>
          ) : (
            /* Active Game */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex flex-col md:flex-row gap-6 items-stretch"
              key="active-game"
            >
              {/* Left Side: Breadboard Canvas */}
              <div className="flex-grow flex flex-col gap-4">
                <div className="flex justify-between items-center bg-slate-950/80 border border-slate-900 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase text-slate-400">Subgrid</span>
                    <span className="text-xs font-mono font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/10">
                      {levelIndex + 1} / 5
                    </span>
                  </div>
                  <h3 className="text-xs font-black text-slate-200 truncate max-w-[150px]">{currentLevel?.title}</h3>
                  {isDaily ? (
                    <div className="flex items-center gap-1 text-amber-400">
                      <Coins className="h-4 w-4 fill-amber-400 text-amber-500" />
                      <span className="text-xs font-bold font-mono">+{coinsEarned.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="w-12" />
                  )}
                </div>

                {/* Circuit Grid Plate */}
                <div className="relative p-4 bg-slate-900/60 border border-blue-950/50 rounded-2xl flex items-center justify-center">
                  <div 
                    className="grid gap-2 select-none"
                    style={{ gridTemplateColumns: `repeat(${currentLevel?.gridSize || 3}, minmax(0, 1fr))` }}
                  >
                    {grid.map((row, y) => 
                      row.map((cell, x) => {
                        // Check if this cell is in the successfully completed closed path for flow animations
                        const inSimPath = simulationActive && simulationResult?.path.some(([px, py]) => px === x && py === y);
                        
                        return (
                          <div
                            key={cell.id}
                            onClick={() => handleCellClick(x, y)}
                            className={`w-16 h-16 rounded-xl border flex flex-col items-center justify-center relative cursor-pointer transition-all duration-200 overflow-hidden ${
                              cell.type === "empty" ? "bg-slate-950/40 border-slate-850 hover:border-blue-500/25 hover:bg-slate-900/20" :
                              cell.type === "block" ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed" :
                              cell.isFixed ? "bg-slate-950/80 border-blue-900/40 shadow-inner" : "bg-blue-950/15 border-blue-900/30"
                            }`}
                          >
                            {/* Electron Flow particle animations */}
                            {inSimPath && simulationResult?.status === "success" && (
                              <motion.div
                                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
                                transition={{ repeat: Infinity, duration: 0.6 }}
                                className="absolute inset-0 bg-blue-500/10 pointer-events-none"
                              />
                            )}

                            {/* Cell graphics */}
                            {cell.type === "battery" && (
                              <div className="flex flex-col items-center">
                                <Zap className="h-5 w-5 text-blue-400 animate-pulse" />
                                <span className="text-[8px] font-black font-mono text-blue-300 mt-1">{cell.voltage}V</span>
                              </div>
                            )}

                            {cell.type === "bulb" && (
                              <div className="flex flex-col items-center">
                                <Lightbulb className={`h-6 w-6 transition-all duration-300 ${
                                  simulationActive && simulationResult?.status === "success" ? "text-amber-300 fill-amber-300/40 drop-shadow-[0_0_8px_rgba(252,211,77,0.6)]" :
                                  simulationActive && simulationResult?.status === "dim" ? "text-amber-500/50 fill-amber-500/10" :
                                  simulationActive && simulationResult?.status === "blown" ? "text-red-650 opacity-40 line-through scale-90" : "text-slate-600"
                                }`} />
                                <span className="text-[7px] font-bold text-slate-500 mt-0.5">{cell.resistance}Ω</span>
                              </div>
                            )}

                            {cell.type === "wire" && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className={`h-1.5 w-full absolute ${inSimPath ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                                <div className={`w-1.5 h-full absolute ${inSimPath ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                              </div>
                            )}

                            {cell.type === "resistor" && (
                              <div className="flex flex-col items-center">
                                <div className="w-8 h-3 bg-[#c792ea]/20 border border-[#c792ea]/40 rounded flex items-center justify-around">
                                  <div className="w-0.5 h-full bg-[#f07178]" />
                                  <div className="w-0.5 h-full bg-[#c792ea]" />
                                  <div className="w-0.5 h-full bg-[#ffcb6b]" />
                                </div>
                                <span className="text-[8px] font-black font-mono text-purple-300 mt-1">{cell.resistance}Ω</span>
                              </div>
                            )}

                            {cell.type === "switch" && (
                              <div className="flex flex-col items-center">
                                {cell.isOpen ? (
                                  <ToggleLeft className="h-5 w-5 text-slate-500" />
                                ) : (
                                  <ToggleRight className="h-5 w-5 text-emerald-400" />
                                )}
                                <span className="text-[7px] font-bold text-slate-400 mt-0.5">Switch</span>
                              </div>
                            )}

                            {cell.type === "block" && (
                              <div className="text-[10px] font-black text-slate-700 uppercase font-mono">Storm</div>
                            )}

                            {/* Small coordinate display for debugging */}
                            <span className="absolute bottom-0.5 right-1 text-[6px] text-slate-700 font-mono">
                              {x},{y}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Level instructions & description */}
                <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 text-xs leading-relaxed space-y-1">
                  <span className="font-black text-slate-400 uppercase tracking-wider block">Relay Mission:</span>
                  <p className="text-slate-350">{currentLevel?.description}</p>
                </div>
              </div>

              {/* Right Side: Inventory & Simulation Control */}
              <div className="w-full md:w-56 shrink-0 flex flex-col justify-between bg-slate-950/60 border border-blue-950/40 p-4 rounded-2xl">
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">Relay components</span>
                    <div className="flex flex-col gap-2">
                      {inventory.map((item, idx) => {
                        const isSelected = selectedTool === item.type || 
                          (item.type === "resistor" && selectedTool === `resistor-${item.resistance}`) ||
                          (item.type === "battery" && selectedTool === `battery-${item.voltage}`);

                        const toolKey = item.type === "resistor" ? `resistor-${item.resistance}` :
                          item.type === "battery" ? `battery-${item.voltage}` : item.type;

                        return (
                          <button
                            key={idx}
                            disabled={item.count <= 0 || simulationActive}
                            onClick={() => setSelectedTool(isSelected ? null : toolKey)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all duration-200 ${
                              isSelected 
                                ? "bg-blue-500/20 border-blue-400 text-blue-300 scale-[1.01]" 
                                : item.count <= 0 
                                ? "bg-slate-950/80 border-slate-950 text-slate-750 opacity-40 cursor-not-allowed" 
                                : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-xs font-bold capitalize truncate">
                                {item.type} {item.resistance ? `${item.resistance}Ω` : item.voltage ? `${item.voltage}V` : ""}
                              </p>
                              <span className="text-[9px] text-slate-500 block mt-0.5">Quantity: {item.count}</span>
                            </div>
                            <span className="w-5 h-5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                              {item.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hints area inside tools panel */}
                  <button
                    onClick={() => setShowHint(prev => !prev)}
                    className="text-xs font-black text-slate-400 hover:text-blue-400 flex items-center gap-1.5 transition"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Need formula hint?
                  </button>

                  {showHint && currentLevel && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl text-[11px] text-blue-300 leading-relaxed shadow-inner"
                    >
                      {currentLevel.hint}
                    </motion.div>
                  )}
                </div>

                {/* Simulation Output Stats HUD */}
                <div className="space-y-4 pt-4 border-t border-blue-950/80 mt-4">
                  {simulationActive && simulationResult && (
                    <div className="bg-slate-950/90 border border-blue-950 p-3 rounded-xl space-y-1 font-mono text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Path State:</span>
                        <span className={`font-black uppercase ${
                          simulationResult.status === "success" ? "text-emerald-400" :
                          simulationResult.status === "blown" ? "text-rose-500 animate-pulse" : "text-amber-500"
                        }`}>
                          {simulationResult.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Grid Current:</span>
                        <span className="text-slate-350">{simulationResult.current} A</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Source Voltage:</span>
                        <span className="text-slate-350">{simulationResult.voltage} V</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Ohm Load:</span>
                        <span className="text-slate-350">{simulationResult.resistance} Ω</span>
                      </div>

                      {/* Blown/Dim Warning Message */}
                      {simulationResult.status === "blown" && (
                        <div className="flex items-start gap-1.5 text-rose-400/90 mt-2 bg-rose-950/20 border border-rose-900/30 p-1.5 rounded text-[9px] leading-tight">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-500" />
                          <span>Warning: Excess current! Resistance load too low. Lightbulb has fused.</span>
                        </div>
                      )}
                      {simulationResult.status === "dim" && (
                        <div className="flex items-start gap-1.5 text-amber-400/90 mt-2 bg-amber-950/20 border border-amber-900/30 p-1.5 rounded text-[9px] leading-tight">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                          <span>Notice: Low current! Resistance load too high. Increase voltage.</span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={toggleSimulation}
                    className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-md ${
                      simulationActive
                        ? "bg-slate-900 border border-slate-800 text-slate-350 hover:bg-slate-850"
                        : "bg-blue-500 hover:bg-blue-400 text-slate-950 hover:scale-[1.02]"
                    }`}
                  >
                    {simulationActive ? "Disconnect Circuit" : "Simulate Circuit"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info Help Overlay */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#070b14]/98 z-50 p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-blue-950 pb-2">
                <HelpCircle className="h-5 w-5 text-blue-400" />
                <h3 className="text-base font-black">Circuit Substation Guide</h3>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[360px]">
                <p>Welcome to the Electric Substation! Your mission is to routing electrical currents to safely power up lightbulbs across the grid nodes.</p>
                
                <div className="bg-slate-900/80 p-3 rounded-lg border border-blue-950 space-y-1 font-mono text-[10px]">
                  <span className="font-bold text-blue-400 block">Ohm's Law Solver:</span>
                  <p>Current (Amperes) is calculated by dividing Voltage by Total Resistance: $I = V / R$.</p>
                  <p className="mt-1">Wires add 1Ω each. Resistors add their specified Ohm value. Bulbs add their internal filament resistance.</p>
                </div>

                <ul className="list-disc pl-4 space-y-1.5">
                  <li>Select a component tool from the inventory panel on the right, then click an empty grid square to place it.</li>
                  <li>Click placed components on the board to return them back to your inventory deck.</li>
                  <li>Click fixed switches on the grid to open or close them dynamically.</li>
                  <li>Ensure the simulated Amperage matches the lightbulb's safe current threshold (e.g. 0.4A - 0.7A). Overload blows the bulb, underload keeps it dim.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-black uppercase text-slate-350 hover:bg-slate-850 transition mt-4"
            >
              Return to Substation
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Dummy math helper in component scope to support fallback routing safely
function matchedMatches(arr: any[], index: number) {
  return arr[index];
}
