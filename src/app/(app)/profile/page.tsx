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
import { Loader2, RefreshCw, Save, Sparkles, PencilLine, ShieldCheck, Camera } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from 'next/dynamic';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import placeholderData from "@/app/lib/placeholder-images.json";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
        transition: { staggerChildren: 0.08, delayChildren: 0.1, ease: "easeOut" }
    }
};

const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
};

function ProfileSkeleton() {
    return (
        <Card className="w-full max-w-4xl mx-auto bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800/50 shadow-2xl">
            <div className="relative h-64 w-full bg-zinc-900 animate-pulse rounded-t-lg"></div>
            <CardContent className="space-y-8 py-8 relative z-20">
                <div className="flex justify-center -mt-24">
                    <Skeleton className="h-32 w-32 rounded-full border-[6px] border-zinc-950 bg-zinc-800" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3"><Skeleton className="h-4 w-24 bg-zinc-800" /><Skeleton className="h-12 w-full bg-zinc-900 rounded-md" /></div>
                    <div className="space-y-3"><Skeleton className="h-4 w-24 bg-zinc-800" /><Skeleton className="h-12 w-full bg-zinc-900 rounded-md" /></div>
                </div>
                <div className="space-y-3"><Skeleton className="h-4 w-32 bg-zinc-800" /><Skeleton className="h-24 w-full bg-zinc-900 rounded-md" /></div>
                <Skeleton className="h-14 w-full bg-zinc-800 rounded-md" />
            </CardContent>
        </Card>
    )
}

function ProfilePageComponent() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const { refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [randomSeed, setRandomSeed] = useState("");

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
        <div className="w-full max-w-4xl mx-auto px-4">
            <Card className="bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800/50 shadow-2xl text-zinc-100 overflow-hidden relative rounded-2xl">
                {/* Subtle Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-500/10 blur-[100px] pointer-events-none z-10" />

                {/* Header Cover */}
                <div className="relative h-64 w-full group overflow-hidden bg-zinc-900">
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
                
                <CardContent className="relative px-8 pb-12 pt-0 z-20">
                    {/* Avatar Section */}
                    <div className="flex flex-col md:flex-row items-center md:items-end justify-between -mt-20 mb-12 gap-6 pointer-events-none">
                        <div className="flex flex-col items-center md:items-start relative group cursor-pointer pointer-events-auto" onClick={handleGenerateAvatar}>
                            <motion.div 
                                className={cn("rounded-full p-1.5 transition-all duration-700 bg-zinc-950/80 backdrop-blur-xl group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]", currentFrameClass)}
                            >
                                <Avatar className="h-36 w-36 border-[6px] border-zinc-950 shadow-2xl bg-zinc-900 transition-transform duration-500 group-hover:scale-[1.02]">
                                    <AvatarImage src={`https://api.dicebear.com/8.x/notionists/svg?seed=${avatarSeed || user?.uid}&backgroundColor=18181b`} alt={user?.displayName || ''} />
                                    <AvatarFallback className="bg-zinc-800 text-zinc-300 text-3xl font-medium tracking-widest">
                                        {watch("displayName")?.substring(0, 2).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </motion.div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full bg-black/40 backdrop-blur-sm m-2">
                                <RefreshCw className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        
                        <div className="flex-1 text-center md:text-left space-y-1 md:pl-4 mb-4 md:mb-0 pointer-events-auto">
                            <h1 className="text-3xl font-semibold tracking-tight text-white">{watch("displayName") || "Anonymous User"}</h1>
                            <p className="text-zinc-400 font-medium">{watch("schoolName") || "No organization specified"}</p>
                        </div>
                    </div>

                    <motion.form 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        onSubmit={handleSubmit(onSubmit)} 
                        className="space-y-10"
                    >
                        {/* Profile Info Section */}
                        <div className="space-y-6">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-2">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <motion.div variants={itemVariants} className="space-y-3">
                                    <Label htmlFor="displayName" className="text-zinc-300 font-medium">Display Name</Label>
                                    <Input id="displayName" {...register("displayName")} className="h-12 bg-zinc-900/50 border-zinc-800 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all text-zinc-100 placeholder:text-zinc-600" />
                                    {errors.displayName && <p className="text-xs text-rose-400 font-medium mt-1">{errors.displayName.message}</p>}
                                </motion.div>
                                <motion.div variants={itemVariants} className="space-y-3">
                                    <Label htmlFor="email" className="text-zinc-300 font-medium">Email Address</Label>
                                    <Input id="email" type="email" value={user?.email || ""} disabled className="h-12 bg-zinc-900/30 border-zinc-800/50 text-zinc-500 cursor-not-allowed" />
                                </motion.div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <motion.div variants={itemVariants} className="space-y-3">
                                    <Label htmlFor="schoolName" className="text-zinc-300 font-medium">Organization / School</Label>
                                    <Input id="schoolName" {...register("schoolName")} placeholder="e.g., LingoLand Academy" className="h-12 bg-zinc-900/50 border-zinc-800 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all text-zinc-100 placeholder:text-zinc-600" />
                                </motion.div>
                                <motion.div variants={itemVariants} className="space-y-3">
                                    <Label htmlFor="age" className="text-zinc-300 font-medium">Age</Label>
                                    <Input id="age" {...register("age")} placeholder="e.g., 25" className="h-12 bg-zinc-900/50 border-zinc-800 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all text-zinc-100 placeholder:text-zinc-600" />
                                </motion.div>
                            </div>
                        </div>

                        {/* About Section */}
                        <div className="space-y-6">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-2">About Me</h2>
                            <motion.div variants={itemVariants} className="space-y-3">
                                <Label htmlFor="hobbies" className="text-zinc-300 font-medium">Hobbies & Interests</Label>
                                <Input id="hobbies" {...register("hobbies")} placeholder="Reading, Photography, Traveling..." className="h-12 bg-zinc-900/50 border-zinc-800 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all text-zinc-100 placeholder:text-zinc-600" />
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-3">
                                <Label htmlFor="learningGoals" className="text-zinc-300 font-medium">Learning Objectives</Label>
                                <Textarea
                                    id="learningGoals"
                                    {...register("learningGoals")}
                                    placeholder="What do you hope to achieve?"
                                    rows={3}
                                    className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all text-zinc-100 placeholder:text-zinc-600 resize-none py-3"
                                />
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-3">
                                <Label htmlFor="dailyPost" className="flex items-center gap-2 text-zinc-300 font-medium">
                                    <PencilLine className="h-4 w-4 text-zinc-400" />
                                    Current Status
                                </Label>
                                <Textarea
                                    id="dailyPost"
                                    {...register("dailyPost")}
                                    placeholder="Share a brief update..."
                                    rows={2}
                                    className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all text-zinc-100 placeholder:text-zinc-600 resize-none py-3"
                                />
                            </motion.div>
                        </div>

                        {/* Aesthetics Section */}
                        <div className="space-y-6">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-2">Aesthetics</h2>
                            
                            <motion.div variants={itemVariants} className="space-y-4">
                                <Label className="text-zinc-300 font-medium flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-zinc-400"/>
                                    Avatar Frame
                                </Label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                    {AVATAR_FRAMES.map(frame => (
                                        <div key={frame.id}>
                                            <Button 
                                                type="button"
                                                variant="outline"
                                                onClick={() => setValue("avatarFrame", frame.id)}
                                                className={cn(
                                                    "w-full h-auto py-4 flex flex-col gap-3 bg-zinc-900/30 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200 transition-all text-zinc-400", 
                                                    avatarFrame === frame.id && "bg-zinc-800 border-zinc-500 text-zinc-100 ring-1 ring-zinc-500/50"
                                                )}
                                            >
                                                <div className={cn("w-6 h-6 rounded-full border-2", frame.class)}></div>
                                                <span className="text-[11px] font-medium tracking-wide">{frame.label}</span>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-4 pt-4">
                                <Label className="text-zinc-300 font-medium">Backdrop Vibe</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                                    {AESTHETIC_PRESETS.map(preset => (
                                        <div key={preset}>
                                            <Button 
                                                type="button"
                                                variant="outline"
                                                onClick={() => { 
                                                    setRandomSeed(Date.now().toString());
                                                    setValue("coverPhotoHint", preset); 
                                                    setValue("coverPhotoUrl", ""); 
                                                }}
                                                className={cn(
                                                    "w-full px-2 text-[10px] font-medium truncate h-9 bg-zinc-900/30 border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all capitalize", 
                                                    coverPhotoHint === preset && !coverPhotoUrl && "bg-zinc-800 border-zinc-500 text-zinc-100"
                                                )}
                                            >
                                                {preset.split(' ')[0]}
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label htmlFor="coverPhotoHint" className="text-xs text-zinc-500 font-medium">Or enter a custom aesthetic prompt:</Label>
                                    <Input 
                                        id="coverPhotoHint" 
                                        {...register("coverPhotoHint")} 
                                        placeholder="e.g., 'minimalist architecture', 'cinematic lighting'" 
                                        className="h-12 bg-zinc-900/50 border-zinc-800 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all text-zinc-100 placeholder:text-zinc-600"
                                        onChange={(e) => {
                                            setRandomSeed(Date.now().toString());
                                            setValue("coverPhotoHint", e.target.value);
                                            setValue("coverPhotoUrl", "");
                                        }}
                                    />
                                </div>
                            </motion.div>
                        </div>

                        <motion.div variants={itemVariants} className="pt-8 pb-4">
                            <Button 
                                type="submit" 
                                disabled={isSaving} 
                                className="w-full h-14 text-sm font-semibold tracking-wide bg-zinc-100 hover:bg-zinc-200 text-zinc-900 transition-all rounded-lg"
                            >
                                {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                {isSaving ? "Saving Changes..." : "Save Profile"}
                            </Button>
                        </motion.div>
                    </motion.form>
                </CardContent>
            </Card>
        </div>
    </motion.div>
  );
}

const ProfilePage = dynamic(() => Promise.resolve(ProfilePageComponent), { ssr: false });

export default ProfilePage;
