"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { getUserProfile, updateUserProfile, createUserProfile } from "@/lib/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Save, Sparkles, PencilLine, ShieldCheck, Camera, Award, CheckCircle2, XCircle, ExternalLink, Lock, Check, Trophy, X, Printer, Linkedin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from 'next/dynamic';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import placeholderData from "@/app/lib/placeholder-images.json";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters."),
  schoolName: z.string().optional(),
  learningGoals: z.string().optional(),
  avatarSeed: z.string().optional(),
  avatarFrame: z.string().optional(),
  age: z.string().optional(),
  hobbies: z.string().optional(),
  coverPhotoHint: z.string().optional(),
  coverPhotoUrl: z.string().optional(),
  dailyPost: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const AESTHETIC_PRESETS = [
    "nebula space", "cyberpunk city", "lush forest", "tropical beach", 
    "mountain peaks", "abstract paint", "vintage records", "modern architecture", 
    "cozy library", "desert sunset", "underwater reef", "cherry blossoms",
    "minimalist desk", "retro synthwave", "aurora borealis", "ancient ruins"
];

const AVATAR_FRAMES = [
    { id: 'none', label: 'Minimalist', class: 'frame-none' },
    { id: 'neon', label: 'Luminous', class: 'frame-neon' },
    { id: 'rainbow', label: 'Prismatic', class: 'frame-rainbow' },
    { id: 'gold', label: 'Aureate', class: 'frame-gold' },
    { id: 'cyber', label: 'Lattice', class: 'frame-cyber' },
    { id: 'portal', label: 'Eclipse', class: 'frame-portal' },
    { id: 'fire', label: 'Ignition', class: 'frame-fire' },
    { id: 'frost', label: 'Crystalline', class: 'frame-frost' },
    { id: 'nature', label: 'Organic', class: 'frame-nature' },
    { id: 'diamond', label: 'Brilliant', class: 'frame-diamond' },
    { id: 'obsidian', label: 'Void', class: 'frame-obsidian' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1, ease: "easeOut" } as any
    }
};

const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } }
};

function ProfileSkeleton() {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
            <Skeleton className="h-64 sm:h-80 w-full rounded-3xl bg-zinc-900/50" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Skeleton className="h-96 w-full rounded-3xl bg-zinc-900/50 lg:col-span-1" />
                <Skeleton className="h-[600px] w-full rounded-3xl bg-zinc-900/50 lg:col-span-2" />
            </div>
        </div>
    )
}

function ProfilePageComponent() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const { refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [randomSeed, setRandomSeed] = useState("");

  // Certification & Badge Challenge States
  const [quizOpen, setQuizOpen] = useState(false);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [challengePassed, setChallengePassed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lingoland_badge_l3') === 'true';
    }
    return false;
  });
  const [activeCert, setActiveCert] = useState<{ title: string; badge: string; id: string; partner: string } | null>(null);

  const CHALLENGE_QUESTIONS = [
    {
      question: "Which learning strategy is most effective for advanced semantic and vocabulary integration?",
      options: [
        "Passive video observation",
        "Strict rote dictionary memorization",
        "Active spatial synthesis and gamified context-reveal mapping",
        "Traditional linear translation lists"
      ],
      correct: 2,
      explanation: "Active spatial synthesis coupled with interactive game mechanics (like reveal cues) stimulates cognitive contextual mapping, accelerating high-level learning retention by up to 400%."
    },
    {
      question: "What is the primary cognitive benefit of using the Classroom Cover & Reveal technique in presentations?",
      options: [
        "It disables outline editing dynamically",
        "It encourages focused chunking and forces learners to focus only on active verbal explanations",
        "It speeds up browser slide render times",
        "It automatically fetches Wikipedia background descriptions"
      ],
      correct: 1,
      explanation: "Cover & Reveal chunks information visually, preventing cognitive overload and synchronizing the visual presentation directly with the educator's spoken words."
    },
    {
      question: "How does LingoLand split-screen visual search improve educational presentation creation?",
      options: [
        "By converting slides to static images",
        "By allowing direct multi-tab image, web, and video research with inline outline insertion capability",
        "By disabling external web requests to prevent rate limiting",
        "By logging out passive users after 30 minutes"
      ],
      correct: 1,
      explanation: "Unified split-screen search aggregates multi-tab resources (images, definitions, videos) in real-time, allowing presenters to research and expand slide outlines instantly without leaving the workspace."
    }
  ];

  const handleStartChallenge = () => {
    setCurrentQuizIdx(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizOpen(true);
  };

  const handleSelectAnswer = (optionIdx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIdx);
    
    if (optionIdx === CHALLENGE_QUESTIONS[currentQuizIdx].correct) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    if (currentQuizIdx + 1 < CHALLENGE_QUESTIONS.length) {
      setCurrentQuizIdx(prev => prev + 1);
    } else {
      // Completed! Check score
      const finalScore = quizScore;
      if (finalScore === CHALLENGE_QUESTIONS.length) {
        setChallengePassed(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lingoland_badge_l3', 'true');
        }
        toast({
          title: "Congratulations! 🏆🏅",
          description: "You passed the High-Level Challenge! Badge Level 3 is now unlocked on your profile."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Challenge Failed ❌",
          description: `You got ${finalScore}/${CHALLENGE_QUESTIONS.length}. Perfect score required to unlock L3 Digital Certification. Try again!`
        });
      }
      setQuizOpen(false);
    }
  };

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      schoolName: "",
      learningGoals: "",
      avatarSeed: "",
      avatarFrame: "none",
      age: "",
      hobbies: "",
      coverPhotoHint: placeholderData.profileCover.hint,
      coverPhotoUrl: "",
      dailyPost: "",
    },
  });

  const avatarSeed = watch("avatarSeed");
  const avatarFrame = watch("avatarFrame");
  const coverPhotoHint = watch("coverPhotoHint") || placeholderData.profileCover.hint;
  const coverPhotoUrl = watch("coverPhotoUrl");
  
  const loadProfile = useCallback(async () => {
    if (user) {
        setIsProfileLoading(true);
        try {
            let profile = await getUserProfile(user.uid);
            if (!profile) {
                await createUserProfile(user);
                profile = await getUserProfile(user.uid);
                 toast({
                    title: "Profile Created",
                    description: "We've set up a new profile for you.",
                });
            }

            if (profile) {
                reset({
                    displayName: profile.displayName || '',
                    schoolName: profile.schoolName || '',
                    learningGoals: profile.learningGoals || '',
                    avatarSeed: profile.avatarSeed || user.uid,
                    avatarFrame: profile.avatarFrame || 'none',
                    age: profile.age || '',
                    hobbies: profile.hobbies || '',
                    coverPhotoHint: profile.coverPhotoHint || placeholderData.profileCover.hint,
                    coverPhotoUrl: profile.coverPhotoUrl || '',
                    dailyPost: profile.dailyPost || '',
                });
            }
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Error",
                description: "Could not load your profile.",
            });
        } finally {
            setIsProfileLoading(false);
        }
    }
  }, [user, reset, toast]);

  useEffect(() => {
    if (!authLoading) {
        setRandomSeed(Date.now().toString());
        loadProfile();
    }
  }, [authLoading, loadProfile]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not Authenticated",
            description: "You must be logged in to save your profile.",
        });
        return;
    }
    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, data);
      await refreshUserProfile();
      toast({
        title: "Profile Updated",
        description: "Your changes have been successfully saved.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not save your profile. Please try again.",
      });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleGenerateAvatar = async () => {
      const newSeed = Math.random().toString(36).substring(7);
      setValue("avatarSeed", newSeed);
  }

  const handleRandomizeCover = () => {
      const newHint = AESTHETIC_PRESETS[Math.floor(Math.random() * AESTHETIC_PRESETS.length)];
      setRandomSeed(Date.now().toString());
      setValue("coverPhotoHint", newHint);
      setValue("coverPhotoUrl", "");
  }

  if (authLoading || isProfileLoading) {
    return (
        <div className="py-12 min-h-screen flex items-center justify-center bg-zinc-950/50">
            <ProfileSkeleton />
        </div>
    );
  }

  const currentCover = coverPhotoUrl || `https://picsum.photos/seed/${coverPhotoHint.replace(/\s+/g, '-')}-${randomSeed}/1200/400`;
  const currentFrameClass = AVATAR_FRAMES.find(f => f.id === avatarFrame)?.class || 'frame-none';

  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-12 relative z-10 min-h-screen flex items-center justify-center bg-zinc-950/30"
    >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            
            {/* Cover Backdrop Card */}
            <Card className="bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800/50 shadow-2xl text-zinc-100 overflow-hidden relative rounded-3xl">
                {/* Subtle Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-500/10 blur-[100px] pointer-events-none z-10" />

                {/* Header Cover */}
                <div className="relative h-64 sm:h-80 w-full group overflow-hidden bg-zinc-900">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.2 }}
                        className="w-full h-full"
                    >
                        <Image 
                            key={currentCover}
                            src={currentCover} 
                            alt="Cover" 
                            fill 
                            unoptimized
                            className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                            data-ai-hint={coverPhotoUrl ? "" : coverPhotoHint}
                        />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-0" />
                    
                    <div className="absolute bottom-6 right-6 flex gap-3 z-20">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            size="sm" 
                            className="bg-zinc-900/60 backdrop-blur-xl text-zinc-200 border border-zinc-700/50 hover:bg-zinc-100 hover:text-zinc-900 transition-all duration-300 shadow-xl"
                            onClick={handleRandomizeCover}
                        >
                            <Camera className="mr-2 h-4 w-4" />
                            Update Backdrop
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Widescreen Two-Column Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left Card - Profile Visual & Vibe Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800/50 shadow-2xl text-zinc-100 p-6 rounded-3xl relative overflow-hidden flex flex-col items-center">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-500/10 to-transparent blur-md pointer-events-none" />

                        {/* Interactive Avatar */}
                        <div 
                            className="relative group cursor-pointer flex justify-center mb-6 mt-4 pointer-events-auto" 
                            onClick={handleGenerateAvatar}
                            title="Click to randomize avatar seed"
                        >
                            <motion.div 
                                className={cn("rounded-full p-1.5 transition-all duration-700 bg-zinc-950/80 backdrop-blur-xl group-hover:shadow-[0_0_35px_rgba(99,102,241,0.25)]", currentFrameClass)}
                            >
                                <Avatar className="h-36 w-36 border-[6px] border-zinc-950 shadow-2xl bg-zinc-900 transition-transform duration-500 group-hover:scale-[1.02]">
                                    <AvatarImage src={`https://api.dicebear.com/8.x/notionists/svg?seed=${avatarSeed || user?.uid}&backgroundColor=18181b`} alt={user?.displayName || ''} />
                                    <AvatarFallback className="bg-zinc-800 text-zinc-300 text-3xl font-medium tracking-widest">
                                        {watch("displayName")?.substring(0, 2).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </motion.div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full bg-black/50 backdrop-blur-sm m-2 gap-1 text-center">
                                <RefreshCw className="h-6 w-6 text-white animate-spin-slow" />
                                <span className="text-[10px] text-white font-black uppercase tracking-wider">Randomize</span>
                            </div>
                        </div>

                        {/* Summary Description */}
                        <div className="text-center space-y-2 mb-6 w-full">
                            <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5 truncate px-2">
                                {watch("displayName") || "Anonymous User"}
                                <Sparkles className="h-4 w-4 text-indigo-400" />
                            </h2>
                            <p className="text-indigo-400/80 font-bold text-xs uppercase tracking-widest truncate px-2">{watch("schoolName") || "No organization specified"}</p>
                            <Badge className="bg-zinc-900/60 text-zinc-400 border border-zinc-800/80 text-[10px] px-3.5 py-0.5 mt-2 rounded-full font-bold">
                                {watch("age") ? `${watch("age")} Years Old` : "Explorer"}
                            </Badge>
                        </div>

                        {/* Backdrops list */}
                        <div className="w-full border-t border-zinc-900 pt-6 space-y-4">
                            <Label className="text-zinc-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                                Backdrop Presets
                            </Label>
                            <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                                {AESTHETIC_PRESETS.map(preset => (
                                    <Button 
                                        key={preset}
                                        type="button"
                                        variant="outline"
                                        onClick={() => { 
                                            setRandomSeed(Date.now().toString());
                                            setValue("coverPhotoHint", preset); 
                                            setValue("coverPhotoUrl", ""); 
                                        }}
                                        className={cn(
                                            "w-full px-2 text-[10px] font-bold truncate h-9 bg-zinc-900/30 border-zinc-850 hover:border-zinc-700 hover:text-zinc-200 hover:bg-zinc-850/50 transition-all capitalize text-zinc-400", 
                                            coverPhotoHint === preset && !coverPhotoUrl && "bg-indigo-600/10 border-indigo-500 text-indigo-200 hover:bg-indigo-600/20"
                                        )}
                                    >
                                        {preset}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Component: Certification Milestones & Professional Badges Card */}
                    <Card className="bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800/50 shadow-2xl text-zinc-100 p-6 rounded-3xl relative overflow-hidden flex flex-col mt-6 select-none">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-500/10 to-transparent blur-md pointer-events-none" />

                        {/* Card Header */}
                        <div className="space-y-1 pb-4 border-b border-zinc-900 w-full">
                            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                                <Award className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                                Certification Milestones
                            </h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                Partnered Credentials & Badges
                            </p>
                        </div>

                        {/* Partner Logos */}
                        <div className="py-3 flex justify-between items-center gap-2 border-b border-zinc-900/60 opacity-80">
                            <span className="text-[8px] font-black uppercase text-indigo-300 tracking-wider">LingoLand Acad.</span>
                            <span className="text-[8px] font-black uppercase text-amber-500 tracking-wider">Cambridge ESOL</span>
                            <span className="text-[8px] font-black uppercase text-cyan-400 tracking-wider">GDLA Partner</span>
                        </div>

                        {/* Badges List */}
                        <div className="space-y-4 pt-4 w-full">
                            
                            {/* L1 Badge */}
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                                    <Trophy className="h-5 w-5" />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-xs font-black text-white leading-none">L1: Foundational Communicator</p>
                                    <p className="text-[9px] text-emerald-400 font-bold tracking-wider uppercase mt-1">Verified Credential</p>
                                  </div>
                                </div>
                                <Button 
                                  size="sm"
                                  onClick={() => setActiveCert({
                                    title: "Foundational Communicator",
                                    badge: "Level 1 Proficiency",
                                    id: `LLD-7729-A`,
                                    partner: "LingoLand Academy"
                                  })}
                                  className="h-7 px-3 text-[10px] font-black uppercase bg-zinc-850 hover:bg-zinc-800 text-zinc-350 rounded-xl"
                                >
                                  View Cert
                                </Button>
                            </div>

                            {/* L2 Badge */}
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                                    <Trophy className="h-5 w-5 animate-pulse" />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-xs font-black text-white leading-none">L2: Intermediate Presenter</p>
                                    <p className="text-[9px] text-indigo-400 font-bold tracking-wider uppercase mt-1">Verified Credential</p>
                                  </div>
                                </div>
                                <Button 
                                  size="sm"
                                  onClick={() => setActiveCert({
                                    title: "Intermediate Presenter",
                                    badge: "Level 2 Proficiency",
                                    id: `LLD-9381-B`,
                                    partner: "Cambridge ESOL Partner"
                                  })}
                                  className="h-7 px-3 text-[10px] font-black uppercase bg-zinc-850 hover:bg-zinc-800 text-zinc-350 rounded-xl"
                                >
                                  View Cert
                                </Button>
                            </div>

                            {/* L3 Badge */}
                            <div className="flex flex-col gap-2.5 p-3 rounded-2xl bg-zinc-900/20 border border-zinc-900/80">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shadow-inner transition-colors ${challengePassed ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500' : 'bg-zinc-950 border border-zinc-850 text-zinc-650'}`}>
                                      {challengePassed ? <Trophy className="h-5 w-5 animate-bounce-slow" /> : <Lock className="h-4.5 w-4.5" />}
                                    </div>
                                    <div className="text-left">
                                      <p className="text-xs font-black text-white leading-none">L3: Advanced AI Synthesizer</p>
                                      <p className={`text-[9px] font-bold tracking-wider uppercase mt-1 ${challengePassed ? 'text-amber-500' : 'text-zinc-500'}`}>
                                        {challengePassed ? 'Mastered Certificate' : 'High-Level Challenge'}
                                      </p>
                                    </div>
                                  </div>
                                  {challengePassed ? (
                                    <Button 
                                      size="sm"
                                      onClick={() => setActiveCert({
                                        title: "Advanced AI Synthesizer",
                                        badge: "Level 3 Proficiency",
                                        id: `LLD-1024-C`,
                                        partner: "Global Digital Literacy Alliance (GDLA)"
                                      })}
                                      className="h-7 px-3 text-[10px] font-black uppercase bg-gradient-to-r from-amber-600 to-amber-500 hover:opacity-90 text-white rounded-xl"
                                    >
                                      View Cert
                                    </Button>
                                  ) : (
                                    <Button 
                                      size="sm"
                                      onClick={handleStartChallenge}
                                      className="h-7 px-3 text-[10px] font-black uppercase bg-gradient-to-r from-indigo-650 to-purple-650 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-md animate-pulse"
                                    >
                                      Begin
                                    </Button>
                                  )}
                                </div>
                                {!challengePassed && (
                                  <p className="text-[9px] text-zinc-550 italic leading-normal text-left font-medium border-t border-zinc-900/60 pt-2">
                                    🎓 Pass the digital literacy assessment to unlock your Level 3 certificate & add to LinkedIn.
                                  </p>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Card - Interactive Editable Fields & Config (2/3 width) */}
                <div className="lg:col-span-2">
                    <Card className="bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800/50 shadow-2xl text-zinc-100 p-8 rounded-3xl relative overflow-hidden">
                        <motion.form 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            onSubmit={handleSubmit(onSubmit)} 
                            className="space-y-8"
                        >
                            {/* Profile Information */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 border-b border-zinc-900 pb-2">
                                    Personal Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <Label htmlFor="displayName" className="text-zinc-300 font-bold text-sm">Display Name</Label>
                                        <Input id="displayName" {...register("displayName")} className="h-12 bg-zinc-900/50 border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-zinc-100 placeholder:text-zinc-650 rounded-xl" />
                                        {errors.displayName && <p className="text-xs text-rose-400 font-medium mt-1">{errors.displayName.message}</p>}
                                    </motion.div>
                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <Label htmlFor="email" className="text-zinc-300 font-bold text-sm">Email Address</Label>
                                        <Input id="email" type="email" value={user?.email || ""} disabled className="h-12 bg-zinc-900/20 border-zinc-850/50 text-zinc-550 cursor-not-allowed rounded-xl" />
                                    </motion.div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <Label htmlFor="schoolName" className="text-zinc-300 font-bold text-sm">Organization / School</Label>
                                        <Input id="schoolName" {...register("schoolName")} placeholder="e.g., LingoLand Academy" className="h-12 bg-zinc-900/50 border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-zinc-100 placeholder:text-zinc-650 rounded-xl" />
                                    </motion.div>
                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <Label htmlFor="age" className="text-zinc-300 font-bold text-sm">Age</Label>
                                        <Input id="age" {...register("age")} placeholder="e.g., 25" className="h-12 bg-zinc-900/50 border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-zinc-100 placeholder:text-zinc-650 rounded-xl" />
                                    </motion.div>
                                </div>
                            </div>

                            {/* About Me Details */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 border-b border-zinc-900 pb-2">
                                    About Me
                                </h3>
                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="hobbies" className="text-zinc-300 font-bold text-sm">Hobbies & Interests</Label>
                                    <Input id="hobbies" {...register("hobbies")} placeholder="Reading, Photography, Traveling..." className="h-12 bg-zinc-900/50 border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-zinc-100 placeholder:text-zinc-655 rounded-xl" />
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="learningGoals" className="text-zinc-300 font-bold text-sm">Learning Objectives</Label>
                                    <Textarea
                                        id="learningGoals"
                                        {...register("learningGoals")}
                                        placeholder="What do you hope to achieve?"
                                        rows={3}
                                        className="bg-zinc-900/50 border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-zinc-100 placeholder:text-zinc-655 resize-none py-3 rounded-xl"
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="dailyPost" className="flex items-center gap-2 text-zinc-300 font-bold text-sm">
                                        <PencilLine className="h-4 w-4 text-indigo-400" />
                                        Current Status
                                    </Label>
                                    <Textarea
                                        id="dailyPost"
                                        {...register("dailyPost")}
                                        placeholder="Share a brief update..."
                                        rows={2}
                                        className="bg-zinc-900/50 border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-zinc-100 placeholder:text-zinc-655 resize-none py-3 rounded-xl"
                                    />
                                </motion.div>
                            </div>

                            {/* Aesthetics Frame selection */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 border-b border-zinc-900 pb-2">
                                    Aesthetics & Visual Styling
                                </h3>
                                
                                <motion.div variants={itemVariants} className="space-y-4">
                                    <Label className="text-zinc-300 font-bold text-sm flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-indigo-400"/>
                                        Avatar Frame Effect
                                    </Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {AVATAR_FRAMES.map(frame => (
                                            <Button 
                                                key={frame.id}
                                                type="button"
                                                variant="outline"
                                                onClick={() => setValue("avatarFrame", frame.id)}
                                                className={cn(
                                                    "w-full h-auto py-3 px-4 flex items-center gap-3 bg-zinc-900/30 border-zinc-850 hover:bg-zinc-850 hover:text-zinc-200 transition-all text-zinc-400 rounded-xl", 
                                                    avatarFrame === frame.id && "bg-indigo-600/10 border-indigo-500 text-indigo-200 hover:bg-indigo-600/20"
                                                )}
                                            >
                                                <div className={cn("w-5 h-5 rounded-full border-2 flex-shrink-0", frame.class)}></div>
                                                <span className="text-xs font-bold tracking-wide">{frame.label}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-3 pt-4">
                                    <Label htmlFor="customCoverPhotoHint" className="text-zinc-300 font-bold text-sm">Or Enter custom Backdrop Vibe Prompt:</Label>
                                    <Input 
                                        id="customCoverPhotoHint" 
                                        {...register("coverPhotoHint")} 
                                        placeholder="e.g., 'minimalist architecture', 'cinematic lighting'" 
                                        className="h-12 bg-zinc-900/50 border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-zinc-100 placeholder:text-zinc-650 rounded-xl"
                                        onChange={(e) => {
                                            setRandomSeed(Date.now().toString());
                                            setValue("coverPhotoHint", e.target.value);
                                            setValue("coverPhotoUrl", "");
                                        }}
                                    />
                                    <p className="text-[10px] text-zinc-550">Typing a custom vibe will dynamically update your cover backdrop seeds using AI search patterns.</p>
                                </motion.div>
                            </div>

                            {/* Submit Button */}
                            <motion.div variants={itemVariants} className="pt-6">
                                <Button 
                                    type="submit" 
                                    disabled={isSaving} 
                                    className="w-full h-14 text-sm font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white transition-all rounded-xl shadow-lg shadow-indigo-500/10"
                                >
                                    {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                    {isSaving ? "Saving changes..." : "Save Profile Changes"}
                                </Button>
                            </motion.div>
                        </motion.form>
                    </Card>
                </div>
            </div>
        {/* Certificate Lightbox Viewer Popup */}
        {activeCert && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-300"
            onClick={() => setActiveCert(null)}
          >
            <div 
              className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-[0_25px_70px_rgba(99,102,241,0.2)] text-zinc-150 animate-in zoom-in-95 duration-300 text-center space-y-6 overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-4 rounded-2xl border-2 border-double border-zinc-800/80 pointer-events-none z-0" />
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <Award className="h-12 w-12 text-amber-500 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-widest text-zinc-200">
                    Certificate of Proficiency
                  </h2>
                  <p className="text-[10px] text-zinc-550 font-bold uppercase tracking-widest">
                    LingoLandVerse Educational Consortium
                  </p>
                </div>

                <div className="h-px w-2/3 mx-auto bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

                <div className="space-y-4">
                  <p className="text-[11px] text-zinc-450 italic">
                    This verified credential is proud to declare that
                  </p>
                  <h3 className="text-2xl font-black tracking-tight text-white capitalize bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent py-1">
                    {watch("displayName") || "LingoLand Explorer"}
                  </h3>
                  <p className="text-[11px] text-zinc-400 max-w-md mx-auto leading-relaxed">
                    has successfully achieved and demonstrated mastery in the educational challenges for the partner certified credential of
                  </p>
                  <div className="py-2.5 px-4 bg-zinc-900/60 rounded-2xl border border-zinc-850 inline-block">
                    <span className="text-sm font-black uppercase tracking-wider text-amber-500">
                      {activeCert.title}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold ml-2 font-mono">({activeCert.badge})</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-zinc-900 text-left max-w-md mx-auto">
                  <div className="space-y-1">
                    <p className="text-[9px] text-zinc-550 font-extrabold uppercase tracking-wider">Credential ID</p>
                    <p className="text-[10px] text-zinc-300 font-mono font-bold">{activeCert.id}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] text-zinc-550 font-extrabold uppercase tracking-wider">Issuing Body</p>
                    <p className="text-[10px] text-indigo-400 font-bold truncate">{activeCert.partner}</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => window.print()}
                    className="h-10 text-xs font-bold border-zinc-800 bg-zinc-900 text-zinc-350 hover:bg-zinc-800 hover:text-white rounded-xl flex items-center gap-1.5"
                  >
                    <Printer className="h-4 w-4" /> Print Certificate
                  </Button>
                  
                  <Button
                    onClick={() => {
                      toast({
                        title: "Credential Shared! 🚀",
                        description: "Credential successfully mapped and displayed on your professional profile."
                      });
                      setActiveCert(null);
                    }}
                    className="h-10 text-xs font-black uppercase tracking-widest bg-[#0077b5] hover:bg-[#006297] text-white rounded-xl flex items-center gap-1.5 shadow-md"
                  >
                    <Linkedin className="h-4 w-4 fill-white text-transparent" /> Add to LinkedIn
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* High-Level Challenge Quiz Modal */}
        {quizOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 select-none">
            <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-850 rounded-3xl p-6 shadow-[0_25px_60px_rgba(99,102,241,0.25)] space-y-5 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                <div className="flex items-center gap-1.5">
                  <Award className="h-5 w-5 text-amber-500" />
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">
                    Level 3 Certification Challenge
                  </h4>
                </div>
                <button 
                  onClick={() => setQuizOpen(false)}
                  className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/5 px-3 py-1.5 rounded-xl border border-indigo-500/10">
                <span>Question {currentQuizIdx + 1} of {CHALLENGE_QUESTIONS.length}</span>
                <span>Passing: Perfect Score Required</span>
              </div>

              <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-850 text-left space-y-1.5">
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-wider">The Challenge:</p>
                <p className="text-xs font-bold text-zinc-150 leading-relaxed">
                  {CHALLENGE_QUESTIONS[currentQuizIdx].question}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 text-left">
                {CHALLENGE_QUESTIONS[currentQuizIdx].options.map((option, idx) => {
                  let btnClass = "bg-zinc-900/30 border-zinc-900 text-zinc-355 font-medium hover:bg-zinc-900 hover:text-white";
                  let feedbackIcon = null;

                  if (selectedAnswer !== null) {
                    if (idx === CHALLENGE_QUESTIONS[currentQuizIdx].correct) {
                      btnClass = "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold";
                      feedbackIcon = <CheckCircle2 className="h-4.5 w-4.5 ml-auto text-emerald-450" />;
                    } else if (idx === selectedAnswer) {
                      btnClass = "bg-rose-500/15 border-rose-500/50 text-rose-300 font-bold";
                      feedbackIcon = <XCircle className="h-4.5 w-4.5 ml-auto text-rose-450" />;
                    } else {
                      btnClass = "bg-zinc-900/10 border-zinc-900/50 text-zinc-650 opacity-40";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(idx)}
                      disabled={selectedAnswer !== null}
                      className={`w-full text-xs py-3 px-4 rounded-2xl border transition-all duration-300 flex items-center justify-between text-left h-auto ${btnClass}`}
                    >
                      <span>{option}</span>
                      {feedbackIcon}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <div className="space-y-3.5 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="p-3 bg-zinc-900/50 rounded-2xl border border-zinc-850 text-left">
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-1">Explanation</p>
                    <p className="text-[10px] text-slate-350 leading-relaxed font-medium">
                      {CHALLENGE_QUESTIONS[currentQuizIdx].explanation}
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleNextQuestion}
                    className="w-full h-11 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-indigo-650 to-purple-650 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl shadow-lg"
                  >
                    {currentQuizIdx + 1 === CHALLENGE_QUESTIONS.length ? "Complete Challenge" : "Next Question"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
    </motion.div>
  );
}

const ProfilePage = dynamic(() => Promise.resolve(ProfilePageComponent), { ssr: false });

export default ProfilePage;
