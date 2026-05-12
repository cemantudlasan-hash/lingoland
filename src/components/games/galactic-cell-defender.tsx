"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Maximize2, Minimize2, ArrowLeft, ShieldAlert, Crosshair, Trophy, ListChecks, CheckCircle2 } from "lucide-react";
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
  const [questionPool, setQuestionPool] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 bg-slate-950 p-8 rounded-xl border border-emerald-500/30">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)] text-center">
          Galactic Cell Defender
        </h1>
        <p className="text-emerald-100/70 text-center max-w-md">
          Defend the core! Answer biology and science trivia to shoot down invading pathogens.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button onClick={() => setDifficulty("easy")} className="bg-slate-900 border border-emerald-500 text-emerald-400 hover:bg-emerald-900 transition-all uppercase tracking-widest">
            Easy (10 Rnds)
          </Button>
          <Button onClick={() => setDifficulty("medium")} className="bg-slate-900 border border-emerald-500 text-emerald-400 hover:bg-emerald-900 transition-all uppercase tracking-widest">
            Medium (20 Rnds)
          </Button>
          <Button onClick={() => setDifficulty("hard")} className="bg-slate-900 border border-emerald-500 text-emerald-400 hover:bg-emerald-900 transition-all uppercase tracking-widest">
            Hard (30 Rnds)
          </Button>
        </div>
        <Link href="/games">
          <Button variant="ghost" className="text-slate-500 hover:text-slate-300">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`relative flex flex-col items-center justify-center w-full min-h-[70vh] bg-slate-950 font-sans transition-all overflow-hidden ${isFullscreen ? 'h-screen overflow-y-auto' : 'rounded-xl border border-emerald-500/30'}`}
    >
      {/* Space / Radar Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0,transparent_50%)] pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] border border-emerald-500/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] border border-emerald-500/30 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-slate-950/80 backdrop-blur-sm border-b border-emerald-500/20">
        <div className="flex items-center gap-4">
          {!isFullscreen && (
            <Button variant="ghost" size="icon" onClick={() => setDifficulty(null)} className="text-emerald-500 hover:bg-slate-900 hover:text-emerald-300">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <Badge variant="outline" className="text-emerald-400 border-emerald-500/50 uppercase tracking-widest">
            {difficulty}
          </Badge>
          {!isGameOver && (
            <span className="text-emerald-400 font-bold">Round: {currentRound}/{totalRounds} | Score: {score}</span>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-emerald-500 hover:bg-slate-900">
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
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
            className="relative z-10 flex flex-col items-center w-full max-w-2xl mt-12 px-4"
          >
            {/* The Core */}
            <div className="relative w-32 h-32 mb-12 flex items-center justify-center">
              <motion.div 
                animate={{ scale: [1, 1.05, 1], rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl" 
              />
              <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.6)]">
                <ShieldAlert className="text-slate-900 w-10 h-10" />
              </div>
              
              {/* Laser Animation */}
              <AnimatePresence>
                {shootTrigger > 0 && (
                  <motion.div
                    key={shootTrigger}
                    initial={{ height: 0, opacity: 1, bottom: '100%' }}
                    animate={{ height: 300, opacity: 0, bottom: '100%' }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute w-2 bg-emerald-400 rounded-full shadow-[0_0_15px_#34d399]"
                  />
                )}
              </AnimatePresence>

              {/* Incoming Pathogen (Target) */}
              <motion.div
                key={currentQ.q}
                initial={{ y: -150, opacity: 0, scale: 0.5 }}
                animate={{ y: -80, opacity: 1, scale: 1 }}
                className="absolute -top-24 flex flex-col items-center"
              >
                <Crosshair className="text-red-500 w-12 h-12 animate-pulse" />
              </motion.div>
            </div>

            {/* Question Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 p-6 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-6 leading-relaxed">
                {currentQ.q}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQ.options.map((opt, i) => (
                  <Button
                    key={i}
                    onClick={() => handleOptionClick(opt)}
                    className="h-auto py-4 px-6 text-lg bg-slate-800 border border-slate-700 text-emerald-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-400 transition-all text-left justify-start break-words whitespace-normal"
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
            className="z-10 flex flex-col items-center w-full max-w-3xl mt-16 p-4"
          >
            <Trophy className="w-20 h-20 text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            <h2 className="text-4xl font-bold text-emerald-400 mb-2">Cell Successfully Defended!</h2>
            <p className="text-xl text-emerald-100/70 mb-8">Final Score: {score} / {totalRounds * 100}</p>
            
            <Card className="w-full bg-slate-900/80 border border-emerald-500/30 p-6 shadow-xl max-h-[400px] overflow-y-auto custom-scrollbar">
              <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <ListChecks className="w-5 h-5" /> Defense Log
              </h3>
              <div className="space-y-4">
                {history.map((h, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${h.isCorrect ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-red-950/30 border-red-500/30'} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                    <div className="flex-1">
                      <p className="text-slate-200 font-medium mb-1">Q{i + 1}: {h.questionDisplay}</p>
                      <p className="text-sm text-slate-400">
                        Targeted: <span className={h.isCorrect ? 'text-emerald-400' : 'text-red-400 line-through'}>{h.userAnswer}</span>
                      </p>
                    </div>
                    {!h.isCorrect && (
                      <div className="bg-slate-950/50 p-2 rounded px-4 text-center">
                        <p className="text-xs text-slate-500 uppercase">Missed Target</p>
                        <p className="text-emerald-400 font-bold text-sm">{h.correctAnswer}</p>
                      </div>
                    )}
                    {h.isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />}
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex gap-4 mt-8">
              <Button onClick={() => setDifficulty(null)} className="bg-slate-900 border border-emerald-500 text-emerald-400 hover:bg-slate-800 transition-all">
                Change Difficulty
              </Button>
              <Button onClick={() => startGame(difficulty!)} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]">
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
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          >
            <Card className="p-8 max-w-md w-full bg-slate-900 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)] flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <Crosshair className="w-8 h-8 text-red-500 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">Defense Breach!</h2>
              <p className="text-slate-300 mb-6 text-lg">
                You targeted <span className="text-red-400 font-semibold">{wrongAnswer.selected}</span>. <br/>
                The correct target was <span className="text-emerald-400 font-semibold">{wrongAnswer.correct}</span>.
              </p>
              <Button 
                onClick={closeWrongModal}
                className="w-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white"
              >
                Continue Defending
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
