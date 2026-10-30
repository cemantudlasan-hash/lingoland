"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Maximize2, Minimize2, ArrowLeft, XOctagon, ShieldAlert, Crosshair, Trophy, ListChecks, CheckCircle2, BookOpen, Shield } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type Difficulty = "easy" | "medium" | "hard";

interface Question {
  q: string;
  options: string[];
  answer: string;
}

interface HistoryItem {
  questionDisplay: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Huge bank of questions to avoid repetition (30 per difficulty to support a 30-round hard game)
const scienceQuestions: Record<Difficulty, Question[]> = {
  easy: [
    { q: "What is the center of an atom called?", options: ["Nucleus", "Electron", "Proton", "Molecule"], answer: "Nucleus" },
    { q: "What gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], answer: "Carbon Dioxide" },
    { q: "What is the closest planet to the Sun?", options: ["Venus", "Earth", "Mars", "Mercury"], answer: "Mercury" },
    { q: "What part of the plant conducts photosynthesis?", options: ["Root", "Stem", "Leaf", "Flower"], answer: "Leaf" },
    { q: "What is the chemical symbol for water?", options: ["H2O", "CO2", "O2", "NaCl"], answer: "H2O" },
    { q: "How many legs does an insect have?", options: ["4", "6", "8", "10"], answer: "6" },
    { q: "Which force keeps us on the ground?", options: ["Magnetism", "Friction", "Gravity", "Inertia"], answer: "Gravity" },
    { q: "What do bees collect to make honey?", options: ["Pollen", "Nectar", "Dew", "Sap"], answer: "Nectar" },
    { q: "What covers the Earth's surface the most?", options: ["Land", "Water", "Ice", "Forests"], answer: "Water" },
    { q: "What is the largest planet in our solar system?", options: ["Saturn", "Earth", "Jupiter", "Neptune"], answer: "Jupiter" },
    { q: "What is the primary source of energy for the Earth?", options: ["The Moon", "The Sun", "Wind", "Geothermal"], answer: "The Sun" },
    { q: "What do we call animals that only eat plants?", options: ["Carnivores", "Omnivores", "Herbivores", "Insectivores"], answer: "Herbivores" },
    { q: "What is H2O more commonly known as?", options: ["Salt", "Air", "Water", "Sugar"], answer: "Water" },
    { q: "Which of these is a mammal?", options: ["Snake", "Frog", "Shark", "Whale"], answer: "Whale" },
    { q: "What gives leaves their green color?", options: ["Chlorophyll", "Melanin", "Carotene", "Hemoglobin"], answer: "Chlorophyll" },
    { q: "What is the hardest natural substance?", options: ["Gold", "Iron", "Diamond", "Quartz"], answer: "Diamond" },
    { q: "How many bones are in the adult human body?", options: ["100", "206", "300", "405"], answer: "206" },
    { q: "What comes down but never goes up?", options: ["Rain", "Smoke", "Helium", "Balloon"], answer: "Rain" },
    { q: "What planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: "Mars" },
    { q: "Which animal is the tallest in the world?", options: ["Elephant", "Giraffe", "Ostrich", "Camel"], answer: "Giraffe" },
    { q: "What do caterpillars turn into?", options: ["Beetles", "Spiders", "Butterflies", "Worms"], answer: "Butterflies" },
    { q: "What organ is used to pump blood?", options: ["Lungs", "Stomach", "Heart", "Brain"], answer: "Heart" },
    { q: "What gas do humans need to breathe to live?", options: ["Nitrogen", "Oxygen", "Carbon Dioxide", "Helium"], answer: "Oxygen" },
    { q: "What do you call molten rock before it has erupted?", options: ["Lava", "Magma", "Igneous", "Obsidian"], answer: "Magma" },
    { q: "Which is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: "Pacific" },
    { q: "What type of animal is a frog?", options: ["Reptile", "Amphibian", "Mammal", "Fish"], answer: "Amphibian" },
    { q: "What force pulls objects toward the center of the Earth?", options: ["Friction", "Magnetism", "Gravity", "Inertia"], answer: "Gravity" },
    { q: "What part of the body controls everything?", options: ["Heart", "Brain", "Lungs", "Stomach"], answer: "Brain" },
    { q: "Which sense uses the eyes?", options: ["Smell", "Hearing", "Taste", "Sight"], answer: "Sight" },
    { q: "What do fish use to breathe underwater?", options: ["Lungs", "Skin", "Gills", "Fins"], answer: "Gills" },
  ],
  medium: [
    { q: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Body"], answer: "Mitochondria" },
    { q: "Which blood cells fight infection?", options: ["Red Blood Cells", "White Blood Cells", "Platelets", "Plasma"], answer: "White Blood Cells" },
    { q: "What type of bond involves sharing electron pairs?", options: ["Ionic", "Covalent", "Hydrogen", "Metallic"], answer: "Covalent" },
    { q: "What is the main gas found in the air we breathe?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], answer: "Nitrogen" },
    { q: "What is the speed of light in a vacuum?", options: ["300,000 km/s", "150,000 km/s", "1,000,000 km/s", "10,000 km/s"], answer: "300,000 km/s" },
    { q: "What is the chemical symbol for Gold?", options: ["Au", "Ag", "Go", "Gl"], answer: "Au" },
    { q: "Who developed the theory of general relativity?", options: ["Isaac Newton", "Albert Einstein", "Nikola Tesla", "Galileo Galilei"], answer: "Albert Einstein" },
    { q: "What is the pH of pure water?", options: ["0", "5", "7", "14"], answer: "7" },
    { q: "Which planet has the most moons?", options: ["Earth", "Mars", "Jupiter", "Saturn"], answer: "Saturn" },
    { q: "What is the largest organ in the human body?", options: ["Liver", "Heart", "Skin", "Brain"], answer: "Skin" },
    { q: "What part of the cell contains genetic material?", options: ["Cytoplasm", "Nucleus", "Ribosome", "Mitochondria"], answer: "Nucleus" },
    { q: "What type of rock is formed from cooled magma?", options: ["Sedimentary", "Metamorphic", "Igneous", "Limestone"], answer: "Igneous" },
    { q: "What is the most abundant element in the Earth's crust?", options: ["Iron", "Oxygen", "Silicon", "Aluminum"], answer: "Oxygen" },
    { q: "What process do plants use to create food?", options: ["Respiration", "Digestion", "Photosynthesis", "Fermentation"], answer: "Photosynthesis" },
    { q: "What is the study of weather called?", options: ["Geology", "Meteorology", "Astronomy", "Ecology"], answer: "Meteorology" },
    { q: "What is the charge of a neutron?", options: ["Positive", "Negative", "Neutral", "Variable"], answer: "Neutral" },
    { q: "Which scientist proposed the laws of motion?", options: ["Einstein", "Newton", "Tesla", "Curie"], answer: "Newton" },
    { q: "What type of eclipse occurs when the moon passes between the Earth and Sun?", options: ["Lunar", "Solar", "Partial", "Annular"], answer: "Solar" },
    { q: "What is the chemical formula for table salt?", options: ["KCl", "NaCl", "NaOH", "HCl"], answer: "NaCl" },
    { q: "Which part of the eye controls the amount of light entering?", options: ["Retina", "Lens", "Pupil", "Iris"], answer: "Iris" },
    { q: "What are the building blocks of proteins?", options: ["Nucleic Acids", "Fatty Acids", "Amino Acids", "Monosaccharides"], answer: "Amino Acids" },
    { q: "What element has the atomic number 1?", options: ["Oxygen", "Carbon", "Helium", "Hydrogen"], answer: "Hydrogen" },
    { q: "What is the outer layer of the Earth called?", options: ["Mantle", "Core", "Crust", "Lithosphere"], answer: "Crust" },
    { q: "Which planet rotates on its side?", options: ["Neptune", "Venus", "Uranus", "Jupiter"], answer: "Uranus" },
    { q: "What is the primary function of red blood cells?", options: ["Fight disease", "Clot blood", "Carry oxygen", "Digest food"], answer: "Carry oxygen" },
    { q: "What term describes animals that maintain a constant body temperature?", options: ["Cold-blooded", "Warm-blooded", "Invertebrate", "Amphibian"], answer: "Warm-blooded" },
    { q: "What is the unit of electrical resistance?", options: ["Volt", "Ampere", "Watt", "Ohm"], answer: "Ohm" },
    { q: "What type of wave is sound?", options: ["Transverse", "Longitudinal", "Electromagnetic", "Surface"], answer: "Longitudinal" },
    { q: "What is the name of our galaxy?", options: ["Andromeda", "Milky Way", "Triangulum", "Sombrero"], answer: "Milky Way" },
    { q: "Which blood type is the universal donor?", options: ["A", "B", "AB", "O"], answer: "O" },
  ],
  hard: [
    { q: "Which organelle is responsible for protein synthesis?", options: ["Lysosome", "Ribosome", "Smooth ER", "Vacuole"], answer: "Ribosome" },
    { q: "What is the most abundant element in the universe?", options: ["Helium", "Oxygen", "Carbon", "Hydrogen"], answer: "Hydrogen" },
    { q: "What law states that for every action, there is an equal and opposite reaction?", options: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law", "Law of Gravity"], answer: "Newton's 3rd Law" },
    { q: "Which of these is a noble gas?", options: ["Chlorine", "Fluorine", "Neon", "Nitrogen"], answer: "Neon" },
    { q: "What is the genetic material of a virus typically enclosed in?", options: ["Cell Wall", "Capsid", "Nucleus", "Membrane"], answer: "Capsid" },
    { q: "What is the name of the process where a solid turns directly into a gas?", options: ["Condensation", "Evaporation", "Sublimation", "Deposition"], answer: "Sublimation" },
    { q: "Which part of the brain controls balance and coordination?", options: ["Cerebrum", "Cerebellum", "Brainstem", "Thalamus"], answer: "Cerebellum" },
    { q: "What is the half-life of Carbon-14?", options: ["5,730 years", "1,000 years", "10,000 years", "500 years"], answer: "5,730 years" },
    { q: "What is the principle that explains how an airplane wing generates lift?", options: ["Archimedes' Principle", "Pascal's Principle", "Bernoulli's Principle", "Boyle's Law"], answer: "Bernoulli's Principle" },
    { q: "Which subatomic particle is the carrier of the electromagnetic force?", options: ["Gluon", "W Boson", "Z Boson", "Photon"], answer: "Photon" },
    { q: "What is the term for a mutation that changes an amino acid to a stop codon?", options: ["Missense", "Nonsense", "Silent", "Frameshift"], answer: "Nonsense" },
    { q: "Which element has the highest melting point?", options: ["Iron", "Tungsten", "Carbon", "Titanium"], answer: "Tungsten" },
    { q: "What is the primary neurostransmitter associated with the reward center of the brain?", options: ["Serotonin", "GABA", "Dopamine", "Acetylcholine"], answer: "Dopamine" },
    { q: "Which phylum do sponges belong to?", options: ["Cnidaria", "Mollusca", "Porifera", "Annelida"], answer: "Porifera" },
    { q: "In quantum mechanics, what principle states you cannot simultaneously know exact position and momentum?", options: ["Pauli Exclusion", "Heisenberg Uncertainty", "Bohr Model", "Aufbau Principle"], answer: "Heisenberg Uncertainty" },
    { q: "What era is known as the 'Age of Reptiles'?", options: ["Paleozoic", "Mesozoic", "Cenozoic", "Precambrian"], answer: "Mesozoic" },
    { q: "Which equation represents the ideal gas law?", options: ["F = ma", "E = mc^2", "PV = nRT", "V = IR"], answer: "PV = nRT" },
    { q: "What enzyme unwinds DNA during replication?", options: ["Ligase", "Polymerase", "Helicase", "Primase"], answer: "Helicase" },
    { q: "What is the measure of disorder in a thermodynamic system?", options: ["Enthalpy", "Entropy", "Gibbs Free Energy", "Kinetic Energy"], answer: "Entropy" },
    { q: "What is the rarest naturally occurring element in the Earth's crust?", options: ["Francium", "Astatine", "Promethium", "Technetium"], answer: "Astatine" },
    { q: "Which part of the flower produces pollen?", options: ["Stigma", "Style", "Anther", "Ovary"], answer: "Anther" },
    { q: "What type of chemical reaction absorbs heat?", options: ["Exothermic", "Endothermic", "Combustion", "Synthesis"], answer: "Endothermic" },
    { q: "What is the fundamental unit of length in the metric system?", options: ["Gram", "Liter", "Meter", "Mole"], answer: "Meter" },
    { q: "Which vitamin is also known as ascorbic acid?", options: ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"], answer: "Vitamin C" },
    { q: "What phenomenon causes the apparent change in frequency of a wave due to relative motion?", options: ["Diffraction", "Refraction", "Doppler Effect", "Interference"], answer: "Doppler Effect" },
    { q: "What is the name of the bond formed between amino acids?", options: ["Glycosidic", "Phosphodiester", "Peptide", "Hydrogen"], answer: "Peptide" },
    { q: "Which element is a liquid at room temperature?", options: ["Gallium", "Bromine", "Francium", "Cesium"], answer: "Bromine" }, // Mercury and Bromine are liquids, Bromine is the non-metal option here.
    { q: "What structure connects muscles to bones?", options: ["Ligaments", "Cartilage", "Tendons", "Joints"], answer: "Tendons" },
    { q: "What process converts glucose into pyruvate, yielding ATP?", options: ["Krebs Cycle", "Electron Transport", "Glycolysis", "Calvin Cycle"], answer: "Glycolysis" },
    { q: "Which scientist formulated the periodic table of elements?", options: ["Dmitri Mendeleev", "Niels Bohr", "Marie Curie", "Antoine Lavoisier"], answer: "Dmitri Mendeleev" },
  ]
};

export function GalacticCellDefender() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  const handleAbortGame = () => {
    setDifficulty(null);
    setCurrentQ(null);
    setIsGameOver(false);
    setWrongAnswer(null);
    setScore(0);
    setCurrentRound(1);
  };
  const [questionPool, setQuestionPool] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState<{ selected: string; correct: string } | null>(null);
  const [shootTrigger, setShootTrigger] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(10);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const startGame = (diff: Difficulty) => {
      setTotalRounds(diff === "easy" ? 10 : diff === "medium" ? 20 : 30);
      setCurrentRound(1);
      setScore(0);
      setHistory([]);
      setIsGameOver(false);
      
      const pool = shuffleArray(scienceQuestions[diff]).map(q => ({
        ...q,
        options: shuffleArray(q.options)
      }));
      setQuestionPool(pool);
      setCurrentQ(pool[0]);
  };

  useEffect(() => {
    if (difficulty) {
      startGame(difficulty);
    }
  }, [difficulty]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(e => console.error(e));
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);

  const proceedToNextRound = (hItem: HistoryItem) => {
    setHistory(prev => [...prev, hItem]);
    setCurrentRound(prevRound => {
      if (prevRound >= totalRounds) {
        setTimeout(() => setIsGameOver(true), 500); // Slight delay for animation if correct
        return prevRound;
      }
      setQuestionPool(prevPool => {
        const newPool = prevPool.slice(1);
        setCurrentQ(newPool[0]);
        return newPool;
      });
      return prevRound + 1;
    });
  };

  const handleOptionClick = (opt: string) => {
    if (wrongAnswer || !currentQ || isGameOver) return;

    if (opt === currentQ.answer) {
      setShootTrigger(prev => prev + 1);
      setScore(s => s + 100);
      
      const hItem: HistoryItem = {
        questionDisplay: currentQ.q,
        userAnswer: opt,
        correctAnswer: currentQ.answer,
        isCorrect: true
      };
      
      setTimeout(() => {
        proceedToNextRound(hItem);
      }, 500); // Wait for shoot animation
    } else {
      setWrongAnswer({ selected: opt, correct: currentQ.answer });
    }
  };

  const closeWrongModal = () => {
    if (wrongAnswer && currentQ) {
      proceedToNextRound({
        questionDisplay: currentQ.q,
        userAnswer: wrongAnswer.selected,
        correctAnswer: currentQ.answer,
        isCorrect: false
      });
    }
    setWrongAnswer(null);
  };

  if (!difficulty) {
    return (
      <div className="w-full flex-1 min-h-[calc(100dvh-4.5rem)] flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-950 rounded-2xl md:rounded-3xl border border-emerald-500/30 shadow-2xl overflow-y-auto max-w-full">
        {!showInstructions ? (
          <div className="flex flex-col items-center text-center space-y-6 max-w-xl w-full my-auto py-6">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(52,211,153,0.5)]">
                <ShieldAlert className="text-slate-950 w-8 h-8 sm:w-10 sm:h-10" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)] uppercase tracking-tight">
                Galactic Cell Defender
              </h1>
              <p className="text-emerald-100/70 text-xs sm:text-base mt-2 max-w-md mx-auto leading-relaxed">
                Defend the cellular core! Answer biology & science trivia to lock laser weapons onto invading pathogens.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <Button onClick={() => setDifficulty("easy")} className="flex-1 h-12 sm:h-14 bg-slate-900 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-950/60 font-bold uppercase tracking-wider text-xs sm:text-sm rounded-xl">
                Easy (10 Rnds)
              </Button>
              <Button onClick={() => setDifficulty("medium")} className="flex-1 h-12 sm:h-14 bg-slate-900 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-950/60 font-bold uppercase tracking-wider text-xs sm:text-sm rounded-xl">
                Medium (20 Rnds)
              </Button>
              <Button onClick={() => setDifficulty("hard")} className="flex-1 h-12 sm:h-14 bg-slate-900 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-950/60 font-bold uppercase tracking-wider text-xs sm:text-sm rounded-xl">
                Hard (30 Rnds)
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md pt-2">
              <Button onClick={() => setShowInstructions(true)} variant="outline" className="flex-1 h-11 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/40 text-xs font-bold uppercase tracking-wider rounded-xl">
                <BookOpen className="w-4 h-4 mr-2" /> How to Play
              </Button>
              <Button variant="ghost" asChild className="flex-1 h-11 text-slate-400 hover:text-slate-200 text-xs font-bold uppercase tracking-wider">
                <Link href="/games">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xl bg-slate-900/90 border border-emerald-500/40 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl text-left my-auto space-y-5">
            <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4">
              <Shield className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white">Defense Protocol: How to Play</h2>
            </div>
            <div className="space-y-3.5 text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-medium">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">1</span>
                <p><strong>Identify the Pathogen Threat</strong>: An invading organism descends toward the nucleus with a science challenge.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">2</span>
                <p><strong>Fire Defense Lasers</strong>: Select the correct scientific answer among the 4 options to neutralize the threat.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">3</span>
                <p><strong>Prevent Breaches</strong>: Wrong answers breach core shielding. Review the correct concept and eliminate all waves to win!</p>
              </div>
            </div>
            <div className="pt-4 flex gap-3">
              <Button onClick={() => setShowInstructions(false)} className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-xs tracking-wider rounded-xl">
                Ready for Deployment
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`relative flex flex-col items-center justify-start sm:justify-between w-full flex-1 min-h-[calc(100dvh-4.5rem)] bg-slate-950 font-sans transition-all overflow-y-auto overflow-x-hidden max-w-full ${isFullscreen ? 'min-h-screen rounded-none border-none p-2 sm:p-6' : 'rounded-2xl md:rounded-3xl border border-emerald-500/30 p-2 sm:p-6'}`}
    >
      {/* Space / Radar Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0,transparent_50%)] pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] border border-emerald-500/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] border border-emerald-500/30 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Top Bar */}
      <div className="w-full p-2.5 sm:p-4 flex justify-between items-center z-10 bg-slate-950/80 backdrop-blur-sm border-b border-emerald-500/20 rounded-xl shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {!isFullscreen && (
            <Button variant="ghost" size="icon" onClick={() => setDifficulty(null)} className="h-8 w-8 text-emerald-500 hover:bg-slate-900 hover:text-emerald-300 shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <Badge variant="outline" className="text-[10px] sm:text-xs text-emerald-400 border-emerald-500/50 uppercase tracking-widest px-2 py-0.5">
            {difficulty}
          </Badge>
          {!isGameOver && (
            <span className="text-emerald-400 font-bold text-xs sm:text-sm">Rnd: {currentRound}/{totalRounds} | {score} pts</span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="h-8 px-2 gap-1 text-emerald-500 hover:bg-slate-900 shrink-0">
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          <span className="text-[10px] font-bold uppercase hidden sm:inline">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
      </div>

      {/* Game Content */}
      <AnimatePresence mode="wait">
        {!isGameOver && currentQ && !wrongAnswer && (
          <motion.div
            key="game-area"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center w-full max-w-2xl px-2 sm:px-4 my-auto py-4"
          >
            {/* The Core */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-8 sm:mb-10 flex items-center justify-center shrink-0">
              <motion.div 
                animate={{ scale: [1, 1.05, 1], rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl" 
              />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.6)]">
                <ShieldAlert className="text-slate-900 w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              
              {/* Laser Animation */}
              <AnimatePresence>
                {shootTrigger > 0 && (
                  <motion.div
                    key={shootTrigger}
                    initial={{ height: 0, opacity: 1, bottom: '100%' }}
                    animate={{ height: 260, opacity: 0, bottom: '100%' }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute w-2 bg-emerald-400 rounded-full shadow-[0_0_15px_#34d399]"
                  />
                )}
              </AnimatePresence>

              {/* Incoming Pathogen (Target) */}
              <motion.div
                key={currentQ.q}
                initial={{ y: -120, opacity: 0, scale: 0.5 }}
                animate={{ y: -65, opacity: 1, scale: 1 }}
                className="absolute -top-16 sm:-top-20 flex flex-col items-center"
              >
                <Crosshair className="text-red-500 w-9 h-9 sm:w-12 sm:h-12 animate-pulse" />
              </motion.div>
            </div>

            {/* Question Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-slate-900/85 backdrop-blur-md border border-emerald-500/30 p-4 sm:p-6 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            >
              <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white text-center mb-4 sm:mb-6 leading-snug break-words">
                {currentQ.q}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                {currentQ.options.map((opt, i) => (
                  <Button
                    key={i}
                    onClick={() => handleOptionClick(opt)}
                    className="h-auto min-h-[44px] sm:min-h-[56px] py-2.5 px-3.5 sm:py-3.5 sm:px-5 text-xs sm:text-base font-bold bg-slate-800 border border-slate-700 text-emerald-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-400 transition-all text-left justify-start break-words whitespace-normal leading-snug rounded-xl"
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {isGameOver && (
          <motion.div
            key="game-over"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-10 flex flex-col items-center w-full max-w-3xl my-auto p-2 sm:p-4"
          >
            <Trophy className="w-14 h-14 sm:w-20 sm:h-20 text-yellow-400 mb-2 sm:mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            <h2 className="text-2xl sm:text-4xl font-bold text-emerald-400 mb-1 sm:mb-2 text-center">Cell Successfully Defended!</h2>
            <p className="text-sm sm:text-xl text-emerald-100/70 mb-4 sm:mb-8">Final Score: {score} / {totalRounds * 100}</p>
            
            <Card className="w-full bg-slate-900/80 border border-emerald-500/30 p-4 sm:p-6 shadow-xl max-h-[300px] sm:max-h-[380px] overflow-y-auto custom-scrollbar">
              <h3 className="text-base sm:text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                <ListChecks className="w-5 h-5" /> Defense Log
              </h3>
              <div className="space-y-3">
                {history.map((h, i) => (
                  <div key={i} className={`p-3 sm:p-4 rounded-xl border ${h.isCorrect ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-red-950/30 border-red-500/30'} flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-xs sm:text-sm font-medium mb-1 break-words">Q{i + 1}: {h.questionDisplay}</p>
                      <p className="text-[11px] sm:text-xs text-slate-400">
                        Targeted: <span className={h.isCorrect ? 'text-emerald-400' : 'text-red-400 line-through'}>{h.userAnswer}</span>
                      </p>
                    </div>
                    {!h.isCorrect && (
                      <div className="bg-slate-950/50 p-2 rounded px-3 text-left sm:text-center shrink-0">
                        <p className="text-[10px] text-slate-500 uppercase">Correct Target</p>
                        <p className="text-emerald-400 font-bold text-xs sm:text-sm">{h.correctAnswer}</p>
                      </div>
                    )}
                    {h.isCorrect && <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />}
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 mt-6 w-full max-w-md justify-center">
              <Button onClick={() => setDifficulty(null)} className="flex-1 h-11 sm:h-12 text-xs sm:text-sm font-bold bg-slate-900 border border-emerald-500 text-emerald-400 hover:bg-slate-800 transition-all rounded-xl">
                Change Difficulty
              </Button>
              <Button onClick={() => startGame(difficulty!)} className="flex-1 h-11 sm:h-12 text-xs sm:text-sm font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)] rounded-xl">
                Play Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wrong Answer Modal */}
      <AnimatePresence>
        {wrongAnswer && !isGameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-3 sm:p-4"
          >
            <Card className="p-5 sm:p-8 max-w-md w-full bg-slate-900 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)] flex flex-col items-center text-center rounded-2xl">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Crosshair className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 animate-pulse" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-2">Defense Breach!</h2>
              <p className="text-slate-300 mb-5 text-sm sm:text-base leading-relaxed">
                You targeted <span className="text-red-400 font-semibold">{wrongAnswer.selected}</span>. <br/>
                The correct target was <span className="text-emerald-400 font-semibold">{wrongAnswer.correct}</span>.
              </p>
              <Button 
                onClick={closeWrongModal}
                className="w-full h-11 sm:h-12 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl"
              >
                Continue Defending
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Universal Footer */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-emerald-500/20 mt-4 shrink-0 z-10">
        <Button variant="outline" asChild size="sm" className="font-bold border-emerald-500/30 bg-emerald-950/40 text-emerald-300 hover:text-white rounded-xl">
          <Link href="/games" className="flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Games</span>
          </Link>
        </Button>
        {difficulty && !isGameOver && (
          <Button variant="outline" size="sm" onClick={handleAbortGame} className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 gap-1.5 font-bold rounded-xl">
            <XOctagon className="h-3.5 w-3.5" /> Abort Game
          </Button>
        )}
        <div className="text-[10px] text-emerald-600 font-mono tracking-wider uppercase select-none">
          Galactic Cell Defense Grid
        </div>
      </div>
    </div>
  );
}
