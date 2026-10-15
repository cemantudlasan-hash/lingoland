'use client';

import * as React from 'react';
import { 
  STARTER_TREES, 
  StarterTree, 
  PetEvolutionNode, 
  getStarterLineForPet, 
  evaluateBranchEligibility 
} from '@/lib/lingo-pet-evolution';
import { StarterPetRenderer } from '@/components/games/lingo-pet-starters-visual';
import { StarterLine, EvolutionBranch, UserPet, LingoPetType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Sparkles, Zap, BookOpen, Volume2, Flame, Award, ChevronRight, 
  CheckCircle2, Lock, ArrowUpRight, Maximize2, X, RefreshCw, BarChart3, HelpCircle 
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface EvolutionTreeProps {
  pet: UserPet;
  isAdmin?: boolean;
  onEvolvePet: (newType: LingoPetType, branch?: EvolutionBranch, tier?: 1 | 2 | 3) => void;
  onUpdateLearningStats: (updatedStats: Partial<UserPet['learningStats']>) => void;
}

export function LingoPetEvolutionTree({
  pet,
  isAdmin = false,
  onEvolvePet,
  onUpdateLearningStats
}: EvolutionTreeProps) {
  const currentStarter = pet.starterLine || getStarterLineForPet(pet.petType) || 'floby';
  const [selectedStarter, setSelectedStarter] = React.useState<StarterLine>(currentStarter);
  const [showParchmentModal, setShowParchmentModal] = React.useState(false);
  const [inspectNode, setInspectNode] = React.useState<PetEvolutionNode | null>(null);

  const inspectStarterLine = inspectNode ? (getStarterLineForPet(inspectNode.id) || selectedStarter) : selectedStarter;
  const inspectEligibility = React.useMemo(() => {
    if (!inspectNode) return { eligible: true, reasons: [] };
    if (isAdmin || pet.petType === inspectNode.id) return { eligible: true, reasons: [] };
    if (inspectNode.tier === 1) {
      return { eligible: true, reasons: [] };
    }
    if (inspectNode.branch && (inspectNode.tier === 2 || inspectNode.tier === 3)) {
      return evaluateBranchEligibility(pet, inspectNode.branch, inspectNode.tier, inspectStarterLine);
    }
    return { eligible: true, reasons: [] };
  }, [inspectNode, pet, isAdmin, inspectStarterLine]);

  const isInspectUnlocked = inspectEligibility.eligible || isAdmin || pet.petType === inspectNode?.id;

  const activeTree: StarterTree = STARTER_TREES[selectedStarter];
  const stats = pet.learningStats || {};

  // Check if current pet is in the active tree
  const isCurrentPetInActiveTree = getStarterLineForPet(pet.petType) === selectedStarter;

  return (
    <div className="flex flex-col gap-6 text-slate-100">
      
      {/* Top Banner & Starter Line Selector */}
      <div className="bg-gradient-to-r from-slate-900/90 via-indigo-950/70 to-slate-900/90 border border-slate-800 rounded-3xl p-5 md:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">🌳</span>
              <h3 className="text-xl md:text-2xl font-black bg-gradient-to-r from-amber-200 via-emerald-200 to-sky-200 bg-clip-text text-transparent">
                LingoPet Starter Evolution Trees
              </h3>
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-[10px] font-bold uppercase tracking-wider">
                Behavior-Driven Branches
              </Badge>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Each starter companion evolves through 3 tiers based on how you practice English—rewarding study diligence, listening accuracy, or creative grammar mastery.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => setShowParchmentModal(true)}
              variant="outline"
              size="sm"
              className="bg-amber-950/40 border-amber-600/40 hover:bg-amber-900/50 text-amber-200 text-xs font-bold gap-1.5 shadow-md shadow-amber-900/20"
            >
              <Maximize2 className="h-3.5 w-3.5 text-amber-400" />
              View Original Chart
            </Button>
          </div>
        </div>

        {/* Active Floating Companion Status Banner in Evolution Trees */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0">
              {['floby', 'tome-tortoise', 'lore-drake', 'seed-rooter', 'terra-keeper'].includes(pet.petType) ? '🌿' : ['pip', 'echo-grif', 'acu-maestro', 'chirp-wing', 'sonic-storm'].includes(pet.petType) ? '🎵' : ['igni', 'spark-fox', 'rune-stalker', 'ember-scribe', 'pyro-phoenix'].includes(pet.petType) ? '🔥' : '🐾'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">Active Floating Mascot:</span>
                <Badge className="bg-emerald-500/20 border-emerald-500/50 text-emerald-300 text-[10px] font-black uppercase">
                  {pet.petName} ({pet.petType})
                </Badge>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Click "Set as Active Mascot" on any unlocked evolution form to choose your floating companion across LingoLand.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              onEvolvePet(pet.petType, pet.evolutionBranch, pet.evolutionTier as any);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs h-8 px-3.5 shadow-md flex items-center gap-1.5 shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
            <span>Confirm Floating Mascot</span>
          </Button>
        </div>

        {/* 3 Starter Line Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          {[
            {
              id: 'floby' as StarterLine,
              name: 'FLOBY',
              subtitle: 'Earth & Vocabulary',
              icon: '🌿',
              color: 'from-emerald-950/60 to-teal-900/40',
              borderColor: 'border-emerald-500/40',
              activeRing: 'ring-2 ring-emerald-400 bg-emerald-950/70',
              textColor: 'text-emerald-300',
              accent: 'bg-emerald-500'
            },
            {
              id: 'pip' as StarterLine,
              name: 'PIP',
              subtitle: 'Air & Phonics / Listening',
              icon: '🎵',
              color: 'from-sky-950/60 to-cyan-900/40',
              borderColor: 'border-sky-500/40',
              activeRing: 'ring-2 ring-sky-400 bg-sky-950/70',
              textColor: 'text-sky-300',
              accent: 'bg-sky-500'
            },
            {
              id: 'igni' as StarterLine,
              name: 'IGNI',
              subtitle: 'Fire & Grammar / Writing',
              icon: '🔥',
              color: 'from-amber-950/60 to-orange-900/40',
              borderColor: 'border-orange-500/40',
              activeRing: 'ring-2 ring-orange-400 bg-orange-950/70',
              textColor: 'text-orange-300',
              accent: 'bg-orange-500'
            }
          ].map((tab) => {
            const isSelected = selectedStarter === tab.id;
            const isCompanionActive = getStarterLineForPet(pet.petType) === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStarter(tab.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex items-center justify-between group ${
                  isSelected ? `${tab.activeRing} shadow-lg` : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                    {tab.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-black text-sm tracking-wide ${tab.textColor}`}>{tab.name}</span>
                      {isCompanionActive && (
                        <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Your Line
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block font-medium">{tab.subtitle}</span>
                  </div>
                </div>
                {isSelected && (
                  <div className={`w-2 h-2 rounded-full ${tab.accent} animate-ping`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Starter Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-950/50 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-base">{activeTree.icon}</span>
          <span className="font-extrabold text-slate-200">{activeTree.element}:</span>
          <span className="text-slate-400">{activeTree.learningFocus}</span>
        </div>
        <div className="text-[11px] text-amber-300/80 italic font-medium">
          {activeTree.lore}
        </div>
      </div>

      {/* THE 3-TIER EVOLUTION TREE DIAGRAM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* TIER 1 BASE CARD (Spans 4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5" />
              Tier 1 • Starter Form
            </span>
            <Badge variant="outline" className="text-[9px] font-bold border-slate-700 text-slate-400">
              Lv. 1+
            </Badge>
          </div>

          <EvolutionNodeCard
            node={activeTree.tier1}
            isCurrent={pet.petType === activeTree.tier1.id}
            isAdmin={isAdmin}
            onInspect={() => setInspectNode(activeTree.tier1)}
            onEvolve={() => onEvolvePet(activeTree.tier1.id, undefined, 1)}
          />

          {/* Behavior Trigger Switch Note */}
          <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-indigo-400" />
              How Evolution Branching Works:
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When your companion reaches <strong>Level 15</strong>, its evolutionary path diverges into <strong>Branch A</strong> or <strong>Branch B</strong> based on your primary study habits in quizzes and arcade games!
            </p>
          </div>
        </div>

        {/* BRANCH A & BRANCH B COLUMNS (Spans 8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* BRANCH A ROW (Study / Pronunciation / Composition) */}
          <div className="flex flex-col gap-3 p-4 rounded-3xl bg-slate-900/40 border border-slate-800 relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm">📜</span>
                <span className="font-black text-xs uppercase tracking-wide text-amber-300">
                  Branch A: {activeTree.branchA.trackName}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                Trigger: {activeTree.branchA.triggerSummary}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Branch A - Tier 2 */}
              <div>
                <div className="text-[10px] font-black uppercase text-slate-500 mb-1 flex items-center justify-between">
                  <span>Tier 2 (Req Lv. 15)</span>
                  <span className="text-emerald-400 font-bold">First Branch</span>
                </div>
                <EvolutionNodeCard
                  node={activeTree.branchA.tier2}
                  isCurrent={pet.petType === activeTree.branchA.tier2.id}
                  isAdmin={isAdmin}
                  eligibility={evaluateBranchEligibility(pet, 'A', 2, selectedStarter)}
                  onInspect={() => setInspectNode(activeTree.branchA.tier2)}
                  onEvolve={() => onEvolvePet(activeTree.branchA.tier2.id, 'A', 2)}
                />
              </div>

              {/* Branch A - Tier 3 */}
              <div>
                <div className="text-[10px] font-black uppercase text-slate-500 mb-1 flex items-center justify-between">
                  <span>Tier 3 (Req Lv. 30+)</span>
                  <span className="text-amber-400 font-bold">Apex Sovereign</span>
                </div>
                <EvolutionNodeCard
                  node={activeTree.branchA.tier3}
                  isCurrent={pet.petType === activeTree.branchA.tier3.id}
                  isAdmin={isAdmin}
                  eligibility={evaluateBranchEligibility(pet, 'A', 3, selectedStarter)}
                  onInspect={() => setInspectNode(activeTree.branchA.tier3)}
                  onEvolve={() => onEvolvePet(activeTree.branchA.tier3.id, 'A', 3)}
                />
              </div>
            </div>
          </div>

          {/* BRANCH B ROW (Speed / Arcade / Performance) */}
          <div className="flex flex-col gap-3 p-4 rounded-3xl bg-slate-900/40 border border-slate-800 relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm">⚡</span>
                <span className="font-black text-xs uppercase tracking-wide text-sky-300">
                  Branch B: {activeTree.branchB.trackName}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                Trigger: {activeTree.branchB.triggerSummary}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Branch B - Tier 2 */}
              <div>
                <div className="text-[10px] font-black uppercase text-slate-500 mb-1 flex items-center justify-between">
                  <span>Tier 2 (Req Lv. 15)</span>
                  <span className="text-sky-400 font-bold">Speed Sprint</span>
                </div>
                <EvolutionNodeCard
                  node={activeTree.branchB.tier2}
                  isCurrent={pet.petType === activeTree.branchB.tier2.id}
                  isAdmin={isAdmin}
                  eligibility={evaluateBranchEligibility(pet, 'B', 2, selectedStarter)}
                  onInspect={() => setInspectNode(activeTree.branchB.tier2)}
                  onEvolve={() => onEvolvePet(activeTree.branchB.tier2.id, 'B', 2)}
                />
              </div>

              {/* Branch B - Tier 3 */}
              <div>
                <div className="text-[10px] font-black uppercase text-slate-500 mb-1 flex items-center justify-between">
                  <span>Tier 3 (Req Lv. 30+)</span>
                  <span className="text-cyan-400 font-bold">Arcade Sovereign</span>
                </div>
                <EvolutionNodeCard
                  node={activeTree.branchB.tier3}
                  isCurrent={pet.petType === activeTree.branchB.tier3.id}
                  isAdmin={isAdmin}
                  eligibility={evaluateBranchEligibility(pet, 'B', 3, selectedStarter)}
                  onInspect={() => setInspectNode(activeTree.branchB.tier3)}
                  onEvolve={() => onEvolvePet(activeTree.branchB.tier3.id, 'B', 3)}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* LEARNING BEHAVIOR ACTIVITY SYNCHRONIZER & SIMULATOR */}
      <Card className="bg-slate-950/70 border-slate-800/80 backdrop-blur-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h4 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              Student Learning Behavior Telemetry
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Your real classroom test scores, arcade runs, and speaking practice calibrate your pet’s evolutionary path.
            </p>
          </div>
          
          {/* Quick simulation buttons to test behavior branching */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-slate-500">Test Behaviors:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onUpdateLearningStats({
                  vocabScore: Math.min(100, (stats.vocabScore || 70) + 5),
                  masteredWords: (stats.masteredWords || 10) + 5
                });
              }}
              className="h-7 text-[10px] bg-slate-900 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950"
            >
              +5 Vocab Mastery
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onUpdateLearningStats({
                  speedTriviaPlayed: (stats.speedTriviaPlayed || 5) + 3,
                  arcadeRuns: (stats.arcadeRuns || 5) + 2
                });
              }}
              className="h-7 text-[10px] bg-slate-900 border-lime-500/30 text-lime-300 hover:bg-lime-950"
            >
              +5 Speed Runs
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onUpdateLearningStats({
                  speechAccuracy: Math.min(100, (stats.speechAccuracy || 70) + 5),
                  listeningStreak: (stats.listeningStreak || 2) + 1
                });
              }}
              className="h-7 text-[10px] bg-slate-900 border-sky-500/30 text-sky-300 hover:bg-sky-950"
            >
              +Phonics Practice
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onUpdateLearningStats({
                  sentenceWritingCount: (stats.sentenceWritingCount || 8) + 5,
                  grammarQuestsCompleted: (stats.grammarQuestsCompleted || 4) + 3
                });
              }}
              className="h-7 text-[10px] bg-slate-900 border-orange-500/30 text-orange-300 hover:bg-orange-950"
            >
              +Grammar Sentences
            </Button>
          </div>
        </div>

        {/* Behavioral Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Vocab Accuracy</span>
            <div className="text-lg font-black text-emerald-400 my-1">{stats.vocabScore || 82}%</div>
            <Progress value={stats.vocabScore || 82} className="h-1 bg-slate-950" />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Mastered Words</span>
            <div className="text-lg font-black text-emerald-400 my-1">{stats.masteredWords || 24}</div>
            <Progress value={((stats.masteredWords || 24) / 40) * 100} className="h-1 bg-slate-950" />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Speech Accuracy</span>
            <div className="text-lg font-black text-sky-400 my-1">{stats.speechAccuracy || 88}%</div>
            <Progress value={stats.speechAccuracy || 88} className="h-1 bg-slate-950" />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Audio Streak</span>
            <div className="text-lg font-black text-sky-400 my-1">{stats.listeningStreak || 7} Days</div>
            <Progress value={((stats.listeningStreak || 7) / 10) * 100} className="h-1 bg-slate-950" />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Sentences Built</span>
            <div className="text-lg font-black text-orange-400 my-1">{stats.sentenceWritingCount || 32}</div>
            <Progress value={((stats.sentenceWritingCount || 32) / 40) * 100} className="h-1 bg-slate-950" />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Arcade Runs</span>
            <div className="text-lg font-black text-amber-400 my-1">{(stats.arcadeRuns || 12) + (stats.speedTriviaPlayed || 8)}</div>
            <Progress value={(((stats.arcadeRuns || 12) + (stats.speedTriviaPlayed || 8)) / 30) * 100} className="h-1 bg-slate-950" />
          </div>
        </div>
      </Card>

      {/* NODE INSPECTION MODAL */}
      <AnimatePresence>
        {inspectNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() => setInspectNode(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-950/80 border border-slate-800 p-2 flex items-center justify-center shrink-0">
                  <StarterPetRenderer
                    petType={inspectNode.id}
                    level={inspectNode.tier === 1 ? 1 : inspectNode.tier === 2 ? 15 : 30}
                    energy={100}
                    mood={100}
                  />
                </div>
                <div>
                  <Badge className={`${inspectNode.badgeBg} ${inspectNode.badgeBorder} text-[10px] uppercase font-black px-2 py-0.5 mb-1`}>
                    Tier {inspectNode.tier} • {inspectNode.speciesName}
                  </Badge>
                  <h3 className="text-2xl font-black text-white">{inspectNode.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">{inspectNode.focus}</p>
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-black uppercase text-amber-400 block mb-1">Visual Lore & Description</span>
                  <p className="text-slate-300">{inspectNode.description}</p>
                </div>

                <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-500/20">
                  <span className="text-[10px] font-black uppercase text-indigo-300 block mb-1">⚡ Stat Bonus & Power</span>
                  <div className="font-bold text-slate-100">{inspectNode.statBonusTitle}</div>
                  <p className="text-slate-400 mt-0.5">{inspectNode.statBonusDesc}</p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-black uppercase text-emerald-400 block mb-1">Evolution Trigger Condition</span>
                  <p className="text-slate-300">{inspectNode.triggerCondition}</p>
                </div>

                {/* Locked Notification Banner when requirements are not yet satisfied */}
                {!isInspectUnlocked && (
                  <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-500/40 text-rose-200 animate-fadeIn">
                    <div className="flex items-center gap-1.5 font-bold text-rose-300 text-xs mb-1">
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      <span>Evolution Locked — Requirements Not Met</span>
                    </div>
                    <p className="text-[11px] text-rose-200/90 mb-1.5 leading-relaxed">
                      This evolution form cannot be used as your floating mascot yet. You must unlock it by meeting these study milestones:
                    </p>
                    <ul className="list-disc list-inside text-[11px] text-rose-300/90 space-y-0.5">
                      {inspectEligibility.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-5">
                {isInspectUnlocked ? (
                  <Button
                    onClick={() => {
                      onEvolvePet(inspectNode.id, inspectNode.branch, inspectNode.tier);
                      setInspectNode(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black rounded-xl py-2.5 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <Sparkles className="h-4 w-4" />
                    {pet.petType === inspectNode.id ? "✓ Active Floating Mascot" : `Set as Active Floating Mascot ✨`}
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="flex-1 bg-slate-800/80 text-slate-500 font-bold rounded-xl py-2.5 flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-700/60"
                  >
                    <Lock className="h-4 w-4 text-slate-500" />
                    <span>Locked (Unlock to Use)</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setInspectNode(null)}
                  className="rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ORIGINAL PARCHMENT INFOGRAPHIC MODAL */}
      <AnimatePresence>
        {showParchmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-amber-950/90 border border-amber-500/40 rounded-3xl p-4 sm:p-6 max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-amber-600/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📜</span>
                  <h3 className="text-lg font-black uppercase text-amber-200 tracking-wider">
                    Original LingoPet Starter Evolution Parchment
                  </h3>
                </div>
                <button
                  onClick={() => setShowParchmentModal(false)}
                  className="p-1.5 rounded-full bg-slate-900/60 text-amber-300 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-amber-700/50 shadow-inner bg-stone-900">
                <Image
                  src="/images/lingopet/starter-evolution-trees.jpg"
                  alt="LingoPet Starter Evolution Trees Parchment Infographic"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-amber-300/80 gap-2">
                <span>🌾 Floby (Vocabulary) • 🎵 Pip (Phonics/Listening) • 🔥 Igni (Grammar/Writing)</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowParchmentModal(false)}
                  className="border-amber-600/40 text-amber-200 hover:bg-amber-900/50 text-xs font-bold"
                >
                  Back to Interactive Tree
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// -------------------------------------------------------------
// Helper Node Card Component
// -------------------------------------------------------------
function EvolutionNodeCard({
  node,
  isCurrent,
  isAdmin,
  eligibility,
  onInspect,
  onEvolve
}: {
  node: PetEvolutionNode;
  isCurrent: boolean;
  isAdmin?: boolean;
  eligibility?: { eligible: boolean; reasons: string[]; currentProgress: number };
  onInspect: () => void;
  onEvolve: () => void;
}) {
  const isEligible = eligibility ? eligibility.eligible || isAdmin : true;

  return (
    <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden group ${
      isCurrent 
        ? "bg-indigo-950/70 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400"
        : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50"
    }`}>
      
      {/* Active Form Badge */}
      {isCurrent && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-indigo-600/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </div>
      )}

      {/* Mascot visual and main identity */}
      <div className="flex items-center gap-3">
        <div 
          onClick={onInspect}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900/80 border border-white/10 p-1.5 flex items-center justify-center shrink-0 cursor-pointer group-hover:scale-105 transition-transform shadow-inner relative"
        >
          <StarterPetRenderer
            petType={node.id}
            level={node.tier === 1 ? 1 : node.tier === 2 ? 15 : 30}
            energy={100}
            mood={100}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-white truncate">{node.name}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium truncate">{node.speciesName}</p>

          <div className="mt-1.5 flex items-center gap-1">
            <Badge className={`${node.badgeBg} ${node.badgeBorder} text-[9px] font-black uppercase px-2 py-0 h-4`}>
              Tier {node.tier}
            </Badge>
          </div>
        </div>
      </div>

      {/* Power bonus pill */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-[11px] leading-tight">
        <span className="font-extrabold text-amber-300 block mb-0.5">
          ⚡ {node.statBonusTitle}
        </span>
        <span className="text-slate-400 text-[10px] block line-clamp-2">
          {node.statBonusDesc}
        </span>
      </div>

      {/* Progress & Evolve Button */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
        <button
          type="button"
          onClick={onInspect}
          className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1"
        >
          Details <ArrowUpRight className="h-3 w-3" />
        </button>

        {isCurrent ? (
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Active Mascot
          </span>
        ) : isEligible ? (
          <Button
            size="sm"
            onClick={onEvolve}
            className="h-7 text-[10px] bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black px-2.5 rounded-lg shadow-sm flex items-center gap-1"
          >
            <Sparkles className="h-3 w-3" />
            Set as Active Mascot
          </Button>
        ) : (
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold" title={eligibility?.reasons.join('\n')}>
            <Lock className="h-3 w-3" /> Locked
          </div>
        )}
      </div>

    </div>
  );
}
