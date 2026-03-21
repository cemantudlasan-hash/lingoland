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
import { Loader2, RefreshCw, Save, Sparkles, PencilLine, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from 'next/dynamic';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import placeholderData from "@/app/lib/placeholder-images.json";
import { cn } from "@/lib/utils";

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
    { id: 'none', label: 'No Frame', class: 'frame-none' },
    { id: 'neon', label: 'Neon Glow', class: 'frame-neon' },
    { id: 'rainbow', label: 'Rainbow Orbit', class: 'frame-rainbow' },
    { id: 'gold', label: 'Royal Gold', class: 'frame-gold' },
    { id: 'cyber', label: 'Cyber Grid', class: 'frame-cyber' },
    { id: 'portal', label: 'Void Portal', class: 'frame-portal' },
    { id: 'fire', label: 'Solar Flare', class: 'frame-fire' },
    { id: 'frost', label: 'Glacial Ice', class: 'frame-frost' },
    { id: 'nature', label: 'Bio-Signal', class: 'frame-nature' },
    { id: 'diamond', label: 'Diamond Spark', class: 'frame-diamond' },
    { id: 'obsidian', label: 'Dark Matter', class: 'frame-obsidian' },
];

function ProfileSkeleton() {
    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
                <Skeleton className="h-48 w-full rounded-t-lg mb-4" />
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Update your personal information and learning goals here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex justify-center -mt-12">
                    <Skeleton className="h-24 w-24 rounded-full border-4 border-background" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                </div>
                <Skeleton className="h-10 w-32" />
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
        description: "Your changes have been saved successfully.",
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
    return <ProfileSkeleton />;
  }

  const currentCover = coverPhotoUrl || `https://picsum.photos/seed/${coverPhotoHint.replace(/\s+/g, '-')}-${randomSeed}/1200/400`;
  const currentFrameClass = AVATAR_FRAMES.find(f => f.id === avatarFrame)?.class || 'frame-none';

  return (
    <div className="py-8">
        <Card className="w-full max-w-3xl mx-auto bg-card text-card-foreground shadow-2xl border-none overflow-hidden">
            <div className="relative h-48 w-full group">
                <Image 
                    key={currentCover}
                    src={currentCover} 
                    alt="Cover" 
                    fill 
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    data-ai-hint={coverPhotoUrl ? "" : coverPhotoHint}
                />
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-0" />
                <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                    <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        className="bg-black/50 text-white border-white/20 hover:bg-black/70 cursor-pointer font-bold"
                        onClick={handleRandomizeCover}
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Randomize AI Cover
                    </Button>
                </div>
            </div>
            <CardContent className="relative py-8">
                <div className="flex flex-col items-center -mt-20 mb-8">
                    <div className={cn("rounded-full p-1.5 transition-all duration-500", currentFrameClass)}>
                        <Avatar className="h-32 w-32 border-4 border-background shadow-2xl bg-background">
                            <AvatarImage src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${avatarSeed || user?.uid}`} alt={user?.displayName || ''} />
                            <AvatarFallback>{watch("displayName")?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                    </div>
                    <Button type="button" variant="link" size="sm" className="mt-2 text-primary hover:text-primary/80" onClick={handleGenerateAvatar}>
                        <RefreshCw className="mr-2 h-3 w-3"/>
                        New Avatar
                    </Button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input id="displayName" {...register("displayName")} className="bg-muted/50" />
                            {errors.displayName && <p className="text-sm text-destructive">{errors.displayName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email (Private)</Label>
                            <Input id="email" type="email" value={user?.email || ""} disabled className="bg-muted/30 opacity-50" />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <Label className="text-primary font-black uppercase tracking-widest text-xs flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4"/>
                            Linguistic Rank (Avatar Frames)
                        </Label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {AVATAR_FRAMES.map(frame => (
                                <Button 
                                    key={frame.id}
                                    type="button"
                                    variant={avatarFrame === frame.id ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setValue("avatarFrame", frame.id)}
                                    className={cn("h-auto py-2 flex flex-col gap-1", avatarFrame === frame.id && "ring-2 ring-primary")}
                                >
                                    <div className={cn("w-8 h-8 rounded-full border-2", frame.class)}></div>
                                    <span className="text-[10px] uppercase font-black">{frame.label.split(' ')[0]}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="schoolName">School Name</Label>
                            <Input id="schoolName" {...register("schoolName")} placeholder="e.g., LingoLand Academy" className="bg-muted/50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="age">Age</Label>
                            <Input id="age" {...register("age")} placeholder="e.g., 15" className="bg-muted/50" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="hobbies">Hobbies & Interests</Label>
                        <Input id="hobbies" {...register("hobbies")} placeholder="e.g., Gaming, Reading, Soccer" className="bg-muted/50" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dailyPost" className="flex items-center gap-2">
                            <PencilLine className="h-4 w-4 text-primary" />
                            About My Day (Status Post)
                        </Label>
                        <Textarea
                            id="dailyPost"
                            {...register("dailyPost")}
                            placeholder="Share something interesting that happened today..."
                            rows={3}
                            className="bg-muted/50 resize-none"
                        />
                        <p className="text-[10px] text-muted-foreground italic">This post will be visible to anyone who views your profile.</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between">
                            <Label className="text-primary font-black uppercase tracking-widest text-xs">Profile Aesthetic (AI Backdrops)</Label>
                        </div>
                        
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                            {AESTHETIC_PRESETS.map(preset => (
                                <Button 
                                    key={preset}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { 
                                        setRandomSeed(Date.now().toString());
                                        setValue("coverPhotoHint", preset); 
                                        setValue("coverPhotoUrl", ""); 
                                    }}
                                    className={cn("px-1 text-[10px] uppercase font-black truncate h-8", coverPhotoHint === preset && !coverPhotoUrl && "border-primary bg-primary/10")}
                                >
                                    {preset.split(' ')[0]}
                                </Button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="coverPhotoHint" className="text-xs text-muted-foreground">Custom AI Keyword:</Label>
                            <Input 
                                id="coverPhotoHint" 
                                {...register("coverPhotoHint")} 
                                placeholder="Describe your vibe (e.g. 'tokyo night', 'minimalist', 'forest')" 
                                className="bg-muted/50"
                                onChange={(e) => {
                                    setRandomSeed(Date.now().toString());
                                    setValue("coverPhotoHint", e.target.value);
                                    setValue("coverPhotoUrl", "");
                                }}
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">Type a keyword or pick a preset to instantly update your AI background imagery.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="learningGoals">My English Goals</Label>
                        <Textarea
                            id="learningGoals"
                            {...register("learningGoals")}
                            placeholder="e.g., 'I want to be able to talk to people from all over the world!'"
                            rows={4}
                            className="bg-muted/50 resize-none"
                        />
                    </div>

                    <Button type="submit" disabled={isSaving} className="w-full h-12 text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 shadow-xl shadow-purple-500/20">
                        {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                        Save Public Profile
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}

const ProfilePage = dynamic(() => Promise.resolve(ProfilePageComponent), { ssr: false });

export default ProfilePage;
