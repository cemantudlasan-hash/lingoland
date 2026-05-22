"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/user";
import type { UserProfile, AnalyticsEvent, DailyPostComment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, School, Trophy, Heart, Target, Calendar, MessageSquareText, Send, Trash2, Edit3, Reply, ShieldBan, X } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { useAuth } from "@/context/auth-context";
import { collection, query, where, orderBy, doc, serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import placeholderData from "@/app/lib/placeholder-images.json";
import { formatDistanceToNow } from 'date-fns';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { LingoPetVisual } from "@/components/games/lingo-pet-visual";

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

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const uid = params.uid as string;
    const firestore = useFirestore();
    const { user: currentUser, userProfile: currentUserProfile } = useAuth();
    const { toast } = useToast();
    
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<DailyPostComment | null>(null);
    const [petData, setPetData] = useState<{
        petType: 'owl' | 'dino' | 'kitty';
        level: number;
        equippedCosmetics: {
            hat?: string;
            glasses?: string;
            necklace?: string;
            shoes?: string;
            wings?: string;
        };
    } | null>(null);
    
    const commentInputRef = useRef<HTMLInputElement>(null);
    const commentRefs = useRef<Record<string, HTMLDivElement>>({});

    // Fetch user analytics for real-time stats
    const analyticsQuery = useMemoFirebase(() => {
        if (!firestore || !uid) return null;
        return query(collection(firestore, 'analytics'), where('userId', '==', uid));
    }, [firestore, uid]);

    const { data: analyticsEvents, isLoading: isStatsLoading } = useCollection<AnalyticsEvent>(analyticsQuery);

    // Fetch comments for the daily post
    const commentsQuery = useMemoFirebase(() => {
        if (!firestore || !uid) return null;
        return query(
            collection(firestore, 'users', uid, 'dailyPostComments'),
            orderBy('createdAt', 'asc')
        );
    }, [firestore, uid]);

    const { data: comments, isLoading: isCommentsLoading } = useCollection<DailyPostComment>(commentsQuery);

    const stats = useMemo(() => {
        if (!analyticsEvents) return { games: 0, level: 'Beginner', articles: 0 };
        
        const games = analyticsEvents.filter(e => e.type === 'game_played').length;
        const articles = analyticsEvents.filter(e => e.type === 'article_read').length;
        const totalActivity = analyticsEvents.length;

        let level = "Beginner";
        if (totalActivity > 100) level = "Advanced";
        else if (totalActivity > 25) level = "Intermediate";

        return { games, level, articles };
    }, [analyticsEvents]);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsProfileLoading(true);
            try {
                const data = await getUserProfile(uid);
                setProfile(data);
            } catch (error: any) {
                console.error("Error fetching profile:", error);
                if (error.code === 'permission-denied' || error.message?.includes('permission')) {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({
                        operation: 'get',
                        path: `users/${uid}`,
                    }));
                }
            } finally {
                setIsProfileLoading(false);
            }
        };
        if (uid) fetchProfile();
    }, [uid]);

    // Fetch Lingo-Pet data for the profile owner
    useEffect(() => {
        if (!uid || !firestore) return;
        const fetchPetData = async () => {
            try {
                const petRef = doc(firestore, 'user_pets', uid);
                const petSnap = await getDoc(petRef);
                if (petSnap.exists()) {
                    const d = petSnap.data();
                    setPetData({
                        petType: d.petType || 'owl',
                        level: d.level || 1,
                        equippedCosmetics: d.equippedCosmetics || {},
                    });
                }
            } catch (e) {
                // silently ignore if not accessible
            }
        };
        fetchPetData();
    }, [uid, firestore]);

    const handleAddComment = async () => {
        if (!commentText.trim() || !currentUser || !profile || !firestore) return;

        const commentsRef = collection(firestore, 'users', uid, 'dailyPostComments');

        if (editingCommentId) {
            const commentRef = doc(firestore, 'users', uid, 'dailyPostComments', editingCommentId);
            setDocumentNonBlocking(commentRef, { text: commentText.trim(), updatedAt: serverTimestamp() }, { merge: true });
            setEditingCommentId(null);
        } else {
            const newComment: any = {
                authorId: currentUser.uid,
                authorName: currentUserProfile?.displayName || currentUser.displayName || 'Explorer',
                text: commentText.trim(),
                createdAt: serverTimestamp(),
            };

            if (replyingTo) {
                newComment.replyToId = replyingTo.id;
                newComment.replyToAuthor = replyingTo.authorName;
                newComment.replyToText = replyingTo.text;
            }

            addDocumentNonBlocking(commentsRef, newComment);
        }

        setCommentText("");
        setReplyingTo(null);
    };

    const handleDeleteComment = (commentId: string) => {
        if (!firestore) return;
        const commentRef = doc(firestore, 'users', uid, 'dailyPostComments', commentId);
        deleteDocumentNonBlocking(commentRef);
    };

    const handleEditComment = (comment: DailyPostComment) => {
        setEditingCommentId(comment.id);
        setCommentText(comment.text);
        setReplyingTo(null);
        commentInputRef.current?.focus();
    };

    const handleReplyComment = (comment: DailyPostComment) => {
        setReplyingTo(comment);
        setEditingCommentId(null);
        setCommentText("");
        commentInputRef.current?.focus();
    };

    const handleBlockUser = async (targetUserId: string, targetUserName: string) => {
        if (!firestore || !currentUser || currentUser.uid === targetUserId) return;
        
        const blockRef = doc(firestore, 'users', currentUser.uid, 'personalBlockList', targetUserId);
        try {
            await setDoc(blockRef, {
                blockedAt: serverTimestamp(),
                userName: targetUserName,
            });
            toast({
                title: "User Blocked",
                description: `${targetUserName} can no longer comment on your profile.`,
            });
        } catch (e) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to block user.",
            });
        }
    };

    const scrollToComment = (commentId: string) => {
        const el = commentRefs.current[commentId];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-primary', 'transition-all');
            setTimeout(() => el.classList.remove('ring-2', 'ring-primary'), 2000);
        }
    };

    if (isProfileLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">User Not Found</h2>
                <p className="text-muted-foreground mt-2">The explorer you're looking for doesn't seem to exist or you don't have permission to view it.</p>
                <Button onClick={() => router.back()} className="mt-6" variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    const coverHint = profile.coverPhotoHint || placeholderData.profileCover.hint;
    const coverPhoto = profile.coverPhotoUrl || `https://picsum.photos/seed/${coverHint.replace(/\s+/g, '-')}/1200/400`;
    const currentFrameClass = AVATAR_FRAMES.find(f => f.id === profile.avatarFrame)?.class || 'frame-none';

    return (
        <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-700">
            <Button onClick={() => router.back()} variant="ghost" className="mb-6 hover:bg-primary/10">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <Card className="overflow-hidden border-none shadow-2xl bg-card/50 backdrop-blur-md">
                <div className="relative h-64 w-full">
                    <Image 
                        src={coverPhoto} 
                        alt="Profile Cover" 
                        fill 
                        className="object-cover"
                        unoptimized
                        data-ai-hint={profile.coverPhotoUrl ? "" : coverHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>

                <CardContent className="relative px-8 pb-12">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 mb-8">
                        <div className={cn("rounded-full p-1.5 transition-all duration-500", currentFrameClass)}>
                            <Avatar className="h-32 w-32 rounded-full border-4 border-background shadow-2xl bg-background">
                                <AvatarImage src={`https://api.dicebear.com/8.x/notionists/svg?seed=${profile.avatarSeed || profile.uid}&backgroundColor=18181b`} />
                                <AvatarFallback className="text-4xl">{profile.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1 text-center md:text-left pb-2">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
                                {profile.displayName}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                                {profile.schoolName && (
                                    <Badge variant="secondary" className="bg-primary/20 text-primary border-none text-sm px-3 py-1">
                                        <School className="mr-2 h-3 w-3" /> {profile.schoolName}
                                    </Badge>
                                )}
                                {profile.age && (
                                    <Badge variant="outline" className="text-white border-white/20 text-sm px-3 py-1">
                                        <Calendar className="mr-2 h-3 w-3" /> {profile.age} Years Old
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                        <div className="md:col-span-2 space-y-8">
                            {profile.dailyPost && (
                                <section className="animate-in slide-in-from-left duration-500">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                                        <MessageSquareText className="h-4 w-4" /> About My Day
                                    </h3>
                                    <div className="p-6 rounded-3xl bg-primary/5 border-2 border-primary/20 shadow-xl font-bold text-xl leading-relaxed text-foreground">
                                        "{profile.dailyPost}"
                                    </div>

                                    {/* Comments Section */}
                                    <div className="mt-8 space-y-4">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Comments</h4>
                                        
                                        {currentUser && (
                                            <div className="space-y-2">
                                                {replyingTo && (
                                                    <div className="flex items-center justify-between bg-primary/10 p-2 rounded-lg text-xs">
                                                        <span>Replying to <strong>{replyingTo.authorName}</strong></span>
                                                        <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => setReplyingTo(null)}><X className="h-3 w-3"/></Button>
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <Input 
                                                        ref={commentInputRef}
                                                        placeholder={editingCommentId ? "Edit your comment..." : "Add a comment..."} 
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                                        className="bg-muted/50 rounded-xl"
                                                    />
                                                    <Button onClick={handleAddComment} size="icon" className="rounded-xl">
                                                        <Send className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            {isCommentsLoading ? (
                                                <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>
                                            ) : comments && comments.length > 0 ? (
                                                comments.map(comment => (
                                                    <div 
                                                        key={comment.id} 
                                                        ref={(el) => { if (el) commentRefs.current[comment.id] = el; }}
                                                        className="group flex items-start gap-3 p-3 rounded-2xl bg-muted/30 border border-white/5 transition-colors hover:bg-muted/50"
                                                    >
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={`https://api.dicebear.com/8.x/notionists/svg?seed=${comment.authorId}&backgroundColor=18181b`} />
                                                            <AvatarFallback>{comment.authorName.substring(0, 2)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <p className="text-sm font-bold text-primary">{comment.authorName}</p>
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                                                                </span>
                                                            </div>
                                                            {comment.replyToId && (
                                                                <div 
                                                                    onClick={() => scrollToComment(comment.replyToId!)}
                                                                    className="text-[10px] bg-primary/5 p-1 rounded mb-1 cursor-pointer hover:bg-primary/10 transition-colors inline-block"
                                                                >
                                                                    Replying to <strong>{comment.replyToAuthor}</strong>: <span className="italic opacity-70">"{comment.replyToText?.substring(0, 20)}..."</span>
                                                                </div>
                                                            )}
                                                            <p className="text-sm text-foreground/90">{comment.text}</p>
                                                            
                                                            <div className="flex gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => handleReplyComment(comment)} className="text-[10px] font-bold uppercase text-muted-foreground hover:text-primary flex items-center gap-1">
                                                                    <Reply className="h-3 w-3"/> Reply
                                                                </button>
                                                                {currentUser?.uid === comment.authorId && (
                                                                    <button onClick={() => handleEditComment(comment)} className="text-[10px] font-bold uppercase text-muted-foreground hover:text-primary flex items-center gap-1">
                                                                        <Edit3 className="h-3 w-3"/> Edit
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            {(currentUser?.uid === comment.authorId || currentUser?.uid === profile.uid) && (
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                                                                    onClick={() => handleDeleteComment(comment.id)}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                            {currentUser?.uid === profile.uid && currentUser?.uid !== comment.authorId && (
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-500/10"
                                                                    onClick={() => handleBlockUser(comment.authorId, comment.authorName)}
                                                                    title="Block user from commenting"
                                                                >
                                                                    <ShieldBan className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-muted-foreground text-center py-4 italic">No comments yet. Be the first to reply!</p>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            )}

                            <section>
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                                    <Target className="h-4 w-4" /> Linguistic Mission
                                </h3>
                                <div className="p-6 rounded-3xl bg-muted/30 border-2 border-white/5 shadow-inner italic text-xl leading-relaxed text-gray-200">
                                    "{profile.learningGoals || "This user hasn't set any learning goals yet."}"
                                </div>
                            </section>

                            {profile.hobbies && (
                                <section>
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                                        <Heart className="h-4 w-4" /> Interests & Hobbies
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.hobbies.split(',').map((hobby, i) => (
                                            <Badge key={i} className="px-4 py-2 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 transition-colors text-base">
                                                {hobby.trim()}
                                            </Badge>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        <div className="space-y-6">
                            <Card className="bg-primary/10 border-primary/20 rounded-3xl p-6">
                                <h4 className="font-black uppercase text-xs tracking-widest text-primary mb-4">Explorer Stats</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-muted-foreground font-bold">Games Cleared</span>
                                        <span className="font-black text-white">
                                            {isStatsLoading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : stats.games}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-muted-foreground font-bold">Vocab Level</span>
                                        <span className="font-black text-white uppercase italic">
                                            {isStatsLoading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : stats.level}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground font-bold">Articles Read</span>
                                        <span className="font-black text-white">
                                            {isStatsLoading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : stats.articles}
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            {/* Lingo-Pet Section */}
                            {petData && (
                                <Card className="bg-indigo-950/60 border-indigo-700/30 rounded-3xl p-6">
                                    <h4 className="font-black uppercase text-xs tracking-widest text-indigo-300 mb-4 flex items-center gap-2">
                                        🐾 Lingo-Pet
                                    </h4>
                                    {/* Mini Pet Preview */}
                                    <div className="w-full aspect-square max-w-[140px] mx-auto rounded-2xl overflow-hidden border border-indigo-700/30 mb-4">
                                        <LingoPetVisual
                                            petType={petData.petType}
                                            level={petData.level}
                                            energy={100}
                                            mood={100}
                                            equippedCosmetics={petData.equippedCosmetics}
                                            currentBackground="cozy-room"
                                        />
                                    </div>
                                    {/* Level Badge */}
                                    <div className="flex justify-center mb-3">
                                        <Badge className="bg-indigo-600/80 text-white border-none px-4 py-1 text-sm font-black">
                                            ✨ Level {petData.level}
                                        </Badge>
                                    </div>
                                    {/* Equipped Items */}
                                    {Object.keys(petData.equippedCosmetics).some(k => (petData.equippedCosmetics as any)[k]) && (
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-2 text-center">Equipped</p>
                                            <div className="flex flex-wrap gap-1.5 justify-center">
                                                {petData.equippedCosmetics.hat && (
                                                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-200 text-[10px] px-2">
                                                        🎩 {petData.equippedCosmetics.hat.replace(/_/g, ' ')}
                                                    </Badge>
                                                )}
                                                {petData.equippedCosmetics.glasses && (
                                                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-200 text-[10px] px-2">
                                                        👓 {petData.equippedCosmetics.glasses.replace(/_/g, ' ')}
                                                    </Badge>
                                                )}
                                                {petData.equippedCosmetics.necklace && (
                                                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-200 text-[10px] px-2">
                                                        💎 {petData.equippedCosmetics.necklace.replace(/_/g, ' ')}
                                                    </Badge>
                                                )}
                                                {petData.equippedCosmetics.shoes && (
                                                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-200 text-[10px] px-2">
                                                        👟 {petData.equippedCosmetics.shoes.replace(/_/g, ' ')}
                                                    </Badge>
                                                )}
                                                {petData.equippedCosmetics.wings && (
                                                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-200 text-[10px] px-2">
                                                        🪽 {petData.equippedCosmetics.wings.replace(/_/g, ' ')}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
