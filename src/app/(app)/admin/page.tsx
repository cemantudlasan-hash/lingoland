"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { doc, onSnapshot, type FirestoreError, collection, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, ChevronRight, Plus, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

function getGoogleDriveFileId(url: string) {
  if (!url) return null;
  const dMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) return dMatch[1];
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return idMatch[1];
  return null;
}

function getEmbedUrl(url: string, autoplay: boolean = false) {
  if (!url) return null;
  const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const ytMatch = url.match(ytRegExp);
  if (ytMatch && ytMatch[2].length === 11) {
    const videoId = ytMatch[2];
    const autoplayVal = autoplay ? "1" : "0";
    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplayVal}&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0`;
  }
  const driveId = getGoogleDriveFileId(url);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }
  return null;
}

function resolveImageUrl(url: string) {
  if (!url) return "";
  const driveId = getGoogleDriveFileId(url);
  if (driveId) {
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }
  return url;
}

export default function AdminPage() {
    const { user, isAdmin, isLoading } = useAuth();
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [announcementText, setAnnouncementText] = useState("");
    const [isAnnouncementActive, setIsAnnouncementActive] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const [widgetMsg1, setWidgetMsg1] = useState("");
    const [widgetMsg2, setWidgetMsg2] = useState("");
    const [useMotivational, setUseMotivational] = useState(false);
    const [isSavingWidget, setIsSavingWidget] = useState(false);

    const [loginTitle, setLoginTitle] = useState("");
    const [loginDescription, setLoginDescription] = useState("");
    const [loginCredits, setLoginCredits] = useState("");
    const [isSavingLogin, setIsSavingLogin] = useState(false);

    const [slides, setSlides] = useState<any[]>([]);
    const [slideTitle, setSlideTitle] = useState("");
    const [slideDescription, setSlideDescription] = useState("");
    const [slideMediaUrl, setSlideMediaUrl] = useState("");
    const [slideMediaType, setSlideMediaType] = useState<"image" | "video">("image");
    const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
    const [isSavingSlide, setIsSavingSlide] = useState(false);

    const carouselDocRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, "announcements", "login_carousel");
    }, [firestore]);

    useEffect(() => {
        if (!carouselDocRef || isLoading || !isAdmin) return;

        const unsubscribe = onSnapshot(carouselDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setSlides(data.slides || []);
            } else {
                setSlides([]);
            }
        }, (error: FirestoreError) => {
            console.warn("Firestore announcements/login_carousel read failed:", error);
            setSlides([]);
        });
        return () => unsubscribe();
    }, [carouselDocRef, isLoading, isAdmin]);

    const handleSaveSlide = async () => {
        if (!carouselDocRef || !user) return;
        if (!slideTitle.trim() || !slideDescription.trim() || !slideMediaUrl.trim()) {
            toast({
                title: "Error",
                description: "Please fill in all fields (Title, Description, Media URL).",
                variant: "destructive"
            });
            return;
        }

        setIsSavingSlide(true);
        try {
            let updatedSlides = [...slides];
            if (editingSlideId) {
                updatedSlides = updatedSlides.map((slide) => 
                    slide.id === editingSlideId 
                        ? {
                            ...slide,
                            title: slideTitle.trim(),
                            description: slideDescription.trim(),
                            mediaUrl: slideMediaUrl.trim(),
                            mediaType: slideMediaType
                          }
                        : slide
                );
                toast({
                    title: "Success",
                    description: "Slide has been updated.",
                });
            } else {
                updatedSlides.push({
                    id: Math.random().toString(36).substring(2, 9),
                    title: slideTitle.trim(),
                    description: slideDescription.trim(),
                    mediaUrl: slideMediaUrl.trim(),
                    mediaType: slideMediaType,
                    createdAt: Date.now()
                });
                toast({
                    title: "Success",
                    description: "New slide added.",
                });
            }

            // Sort by createdAt asc to preserve sequence
            updatedSlides.sort((a, b) => a.createdAt - b.createdAt);

            await setDocumentNonBlocking(carouselDocRef, { slides: updatedSlides }, { merge: true });

            // Reset form
            setSlideTitle("");
            setSlideDescription("");
            setSlideMediaUrl("");
            setSlideMediaType("image");
            setEditingSlideId(null);
        } catch (e) {
            console.error("Error saving slide:", e);
            toast({
                title: "Error",
                description: "Failed to save slide.",
                variant: "destructive"
            });
        }
        setIsSavingSlide(false);
    };

    const handleEditSlide = (slide: any) => {
        setEditingSlideId(slide.id);
        setSlideTitle(slide.title);
        setSlideDescription(slide.description);
        setSlideMediaUrl(slide.mediaUrl || slide.imageUrl || "");
        setSlideMediaType(slide.mediaType || "image");
    };

    const handleDeleteSlide = async (id: string) => {
        if (!carouselDocRef || !user) return;
        if (!confirm("Are you sure you want to delete this slide?")) return;

        try {
            const updatedSlides = slides.filter((slide) => slide.id !== id);
            await setDocumentNonBlocking(carouselDocRef, { slides: updatedSlides }, { merge: true });
            toast({
                title: "Success",
                description: "Slide has been deleted.",
            });
            if (editingSlideId === id) {
                setEditingSlideId(null);
                setSlideTitle("");
                setSlideDescription("");
                setSlideMediaUrl("");
                setSlideMediaType("image");
            }
        } catch (e) {
            console.error("Error deleting slide:", e);
            toast({
                title: "Error",
                description: "Failed to delete slide.",
                variant: "destructive"
            });
        }
    };
    
    const announcementRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, "announcements", "main_banner");
    }, [firestore]);

    const widgetMessagesRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, "announcements", "floating_pet_widget");
    }, [firestore]);

    const loginFormRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, "announcements", "login_form");
    }, [firestore]);

    useEffect(() => {
        if (!isLoading && !isAdmin) {
            router.replace('/dashboard');
        }
    }, [isAdmin, isLoading, router]);

    useEffect(() => {
        if (!announcementRef || isLoading || !isAdmin) {
            if (!isLoading) setIsFetching(false);
            return;
        };

        setIsFetching(true);
        const unsubscribe = onSnapshot(announcementRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setAnnouncementText(data.text || "");
                setIsAnnouncementActive(data.isActive || false);
            }
            setIsFetching(false);
        },
        (error: FirestoreError) => {
            setIsFetching(false);
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              operation: 'get',
              path: announcementRef.path,
            }));
          }
        );
        return () => unsubscribe();
    }, [announcementRef, isLoading, isAdmin]);

    useEffect(() => {
        if (!widgetMessagesRef || isLoading || !isAdmin) return;

        const unsubscribe = onSnapshot(widgetMessagesRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                if (data.messages && Array.isArray(data.messages)) {
                    setWidgetMsg1(data.messages[0] || "");
                    setWidgetMsg2(data.messages[1] || "");
                }
                setUseMotivational(data.useMotivational || false);
            }
        },
        (error: FirestoreError) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              operation: 'get',
              path: widgetMessagesRef.path,
            }));
          }
        );
        return () => unsubscribe();
    }, [widgetMessagesRef, isLoading, isAdmin]);

    useEffect(() => {
        if (!loginFormRef || isLoading || !isAdmin) return;

        const unsubscribe = onSnapshot(loginFormRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setLoginTitle(data.title || "");
                setLoginDescription(data.description || "");
                setLoginCredits(data.credits || "");
            }
        },
        (error: FirestoreError) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              operation: 'get',
              path: loginFormRef.path,
            }));
          }
        );
        return () => unsubscribe();
    }, [loginFormRef, isLoading, isAdmin]);

    const handleSave = async () => {
        if (!announcementRef || !user) return;
        setIsSaving(true);
        
        const dataToSave = { text: announcementText, isActive: isAnnouncementActive };

        setDocumentNonBlocking(announcementRef, dataToSave, { merge: true });

        toast({
            title: "Success",
            description: "Announcement has been updated.",
        });

        setIsSaving(false);
    };

    const handleSaveWidget = async () => {
        if (!widgetMessagesRef || !user) return;
        setIsSavingWidget(true);
        
        const dataToSave = { 
            messages: [
                widgetMsg1.trim() || "Hello, how's your day?",
                widgetMsg2.trim() || "Visit me, you can feed me. :)"
            ],
            useMotivational
        };

        setDocumentNonBlocking(widgetMessagesRef, dataToSave, { merge: true });

        toast({
            title: "Success",
            description: "Floating pet speech bubbles have been updated.",
        });

        setIsSavingWidget(false);
    };

    const handleSaveLogin = async () => {
        if (!loginFormRef || !user) return;
        setIsSavingLogin(true);
        
        const dataToSave = { 
            title: loginTitle.trim(),
            description: loginDescription.trim(),
            credits: loginCredits.trim()
        };

        setDocumentNonBlocking(loginFormRef, dataToSave, { merge: true });

        toast({
            title: "Success",
            description: "Login page texts have been updated.",
        });

        setIsSavingLogin(false);
    };

    if (isLoading || isFetching) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="w-full py-8 space-y-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader
                      className="bg-white text-black"
                      style={{
                        backgroundImage: `repeating-linear-gradient(45deg, rgba(0,0,0,0.02), rgba(0,0,0,0.02) 1px, transparent 1px, transparent 10px)`,
                        backgroundSize: '20px 20px',
                      }}
                    >
                        <CardTitle>Manage Announcement Banner</CardTitle>
                        <CardDescription>
                            Control the scrolling text banner shown at the top of the app for all users.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label htmlFor="announcement-text">Banner Text</Label>
                            <Textarea
                                id="announcement-text"
                                value={announcementText}
                                onChange={(e) => setAnnouncementText(e.target.value)}
                                placeholder="Enter your announcement here..."
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="announcement-active"
                                checked={isAnnouncementActive}
                                onCheckedChange={setIsAnnouncementActive}
                            />
                            <Label htmlFor="announcement-active">Show banner to users</Label>
                        </div>
                         <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader
                      className="bg-white text-black"
                      style={{
                        backgroundImage: `repeating-linear-gradient(45deg, rgba(0,0,0,0.02), rgba(0,0,0,0.02) 1px, transparent 1px, transparent 10px)`,
                        backgroundSize: '20px 20px',
                      }}
                    >
                        <CardTitle>Manage Floating Companion Speech Bubbles</CardTitle>
                        <CardDescription>
                            Edit the messages shown in the speech bubble of the hovering pet widget.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label htmlFor="widget-msg-1">First Speech Bubble Message</Label>
                            <Textarea
                                id="widget-msg-1"
                                value={widgetMsg1}
                                onChange={(e) => setWidgetMsg1(e.target.value)}
                                placeholder="Hello, how's your day?"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="widget-msg-2">Second Speech Bubble Message</Label>
                            <Textarea
                                id="widget-msg-2"
                                value={widgetMsg2}
                                onChange={(e) => setWidgetMsg2(e.target.value)}
                                placeholder="Visit me, you can feed me. :)"
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-2 pb-2 border-t border-slate-800/10">
                            <Switch
                                id="widget-use-motivational"
                                checked={useMotivational}
                                onCheckedChange={setUseMotivational}
                            />
                            <Label htmlFor="widget-use-motivational" className="font-semibold cursor-pointer">
                                Include Motivational Preset Phrases
                            </Label>
                        </div>
                        {useMotivational && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-600 max-h-40 overflow-y-auto">
                                <p className="font-bold text-slate-800 mb-1">Preview of Motivational Phrases (Good Words Only):</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>"Believe in yourself! You're doing amazing! 🌟"</li>
                                    <li>"Every mistake is a step closer to learning! 🚀"</li>
                                    <li>"Keep going! I am so proud of your progress! 💖"</li>
                                    <li>"You're capable of incredible things! ✨"</li>
                                    <li>"Learning is a superpower, and you've got it! 🧠"</li>
                                    <li>"Take a deep breath. You're doing just fine! 🌿"</li>
                                    <li>"Small steps every day lead to big results! 📈"</li>
                                    <li>"Your hard work is paving the way to success! 🏆"</li>
                                    <li>"Stay positive, work hard, make it happen! 💪"</li>
                                    <li>"Mistakes are proof that you are trying! 🎨"</li>
                                </ul>
                            </div>
                        )}
                         <Button onClick={handleSaveWidget} disabled={isSavingWidget}>
                            {isSavingWidget && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Companion Texts
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader
                      className="bg-white text-black"
                      style={{
                        backgroundImage: `repeating-linear-gradient(45deg, rgba(0,0,0,0.02), rgba(0,0,0,0.02) 1px, transparent 1px, transparent 10px)`,
                        backgroundSize: '20px 20px',
                      }}
                    >
                        <CardTitle>Manage Login Page Texts</CardTitle>
                        <CardDescription>
                            Edit the main title, description, and credits shown on the login form.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="space-y-2">
                            <Label htmlFor="login-title">Login Page Title</Label>
                            <Textarea
                                id="login-title"
                                value={loginTitle}
                                onChange={(e) => setLoginTitle(e.target.value)}
                                placeholder="Master Any Subject with Your Personal AI Companion"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="login-description">Login Page Subtitle / Description</Label>
                            <Textarea
                                id="login-description"
                                value={loginDescription}
                                onChange={(e) => setLoginDescription(e.target.value)}
                                placeholder="Welcome to LingoLandVerse — Learn language and educational subjects with 66+ interactive games."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="login-credits">Login Page Credits</Label>
                            <Input
                                id="login-credits"
                                value={loginCredits}
                                onChange={(e) => setLoginCredits(e.target.value)}
                                placeholder="Ideas and created by: CSC Tech Corp., Powered by AI."
                            />
                        </div>
                        <Button onClick={handleSaveLogin} disabled={isSavingLogin}>
                            {isSavingLogin && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Login Texts
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader
                      className="bg-white text-black"
                      style={{
                        backgroundImage: `repeating-linear-gradient(45deg, rgba(0,0,0,0.02), rgba(0,0,0,0.02) 1px, transparent 1px, transparent 10px)`,
                        backgroundSize: '20px 20px',
                      }}
                    >
                        <CardTitle className="flex items-center gap-1.5">
                            <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" />
                            Lingo-Pet Evolution Tester
                        </CardTitle>
                        <CardDescription>
                            Directly adjust and preview the level-based growth designs of your active Lingo-Pet.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            To test all pet evolutions (Level ranges: 1-14, 15, 30, 45, 60, 75, 90, 100+), access the interactive testing panel built directly into the Lingo-Pet companion dashboard page.
                        </p>
                        <Button asChild className="w-full bg-slate-900 text-slate-100 hover:bg-slate-800 border border-slate-700/50">
                            <Link href="/lingo-pet">
                                Open Lingo-Pet Testing Panel
                                <ChevronRight className="ml-1.5 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader
                      className="bg-white text-black"
                      style={{
                        backgroundImage: `repeating-linear-gradient(45deg, rgba(0,0,0,0.02), rgba(0,0,0,0.02) 1px, transparent 1px, transparent 10px)`,
                        backgroundSize: '20px 20px',
                      }}
                    >
                        <CardTitle className="flex items-center gap-1.5">
                            <Plus className="h-5 w-5 text-indigo-500" />
                            Manage Login Page Carousel Slides
                        </CardTitle>
                        <CardDescription>
                            Create, update, and delete the custom slides displayed in the carousel on the login/auth page. Works dynamically across client contexts!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="bg-zinc-900/40 p-4 rounded-xl border border-white/5 space-y-4">
                            <h4 className="font-bold text-sm text-zinc-300">
                                {editingSlideId ? "Edit Slide Info" : "Create New Slide"}
                            </h4>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="slide-title">Slide Title</Label>
                                    <Input
                                        id="slide-title"
                                        value={slideTitle}
                                        onChange={(e) => setSlideTitle(e.target.value)}
                                        placeholder="e.g. Real-time Multiplayer Arena"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Media Type</Label>
                                    <div className="flex gap-4 pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-zinc-300">
                                            <input
                                                type="radio"
                                                name="mediaType"
                                                value="image"
                                                checked={slideMediaType === "image"}
                                                onChange={() => setSlideMediaType("image")}
                                                className="accent-indigo-500 h-4 w-4"
                                            />
                                            Image
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-zinc-300">
                                            <input
                                                type="radio"
                                                name="mediaType"
                                                value="video"
                                                checked={slideMediaType === "video"}
                                                onChange={() => setSlideMediaType("video")}
                                                className="accent-indigo-500 h-4 w-4"
                                            />
                                            Video / YouTube URL
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="slide-media">Media URL (Image or Video / YouTube Link)</Label>
                                    <Input
                                        id="slide-media"
                                        value={slideMediaUrl}
                                        onChange={(e) => setSlideMediaUrl(e.target.value)}
                                        placeholder="e.g. https://... or https://youtube.com/watch?v=..."
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="slide-description">Slide Description</Label>
                                    <Textarea
                                        id="slide-description"
                                        value={slideDescription}
                                        onChange={(e) => setSlideDescription(e.target.value)}
                                        placeholder="Provide a clean text description for the slide..."
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button onClick={handleSaveSlide} disabled={isSavingSlide}>
                                    {isSavingSlide && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingSlideId ? "Update Slide" : "Add Slide"}
                                </Button>
                                {editingSlideId && (
                                    <Button variant="secondary" onClick={() => {
                                        setEditingSlideId(null);
                                        setSlideTitle("");
                                        setSlideDescription("");
                                        setSlideMediaUrl("");
                                        setSlideMediaType("image");
                                    }}>
                                        Cancel Edit
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-sm text-zinc-300">Current Carousel Slides ({slides.length})</h4>
                            {slides.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No custom slides uploaded yet. The default slides will be displayed on the login page.</p>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {slides.map((slide) => {
                                        const embedUrl = getEmbedUrl(slide.mediaUrl || slide.imageUrl, false);
                                        const isVideo = slide.mediaType === "video";
                                        const resolvedImageUrl = resolveImageUrl(slide.mediaUrl || slide.imageUrl);

                                        return (
                                            <div key={slide.id} className="bg-zinc-950 p-3 rounded-xl border border-white/5 flex flex-col justify-between gap-3 relative group">
                                                {(slide.mediaUrl || slide.imageUrl) && (
                                                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/5 bg-zinc-900 shrink-0">
                                                        {isVideo ? (
                                                            embedUrl ? (
                                                                <iframe
                                                                    src={embedUrl}
                                                                    title={slide.title}
                                                                    className="w-full h-full object-cover pointer-events-none"
                                                                    frameBorder="0"
                                                                />
                                                            ) : (
                                                                <video
                                                                    src={slide.mediaUrl || slide.imageUrl}
                                                                    muted
                                                                    playsInline
                                                                    className="object-cover w-full h-full"
                                                                />
                                                            )
                                                        ) : (
                                                            <img
                                                                src={resolvedImageUrl}
                                                                alt={slide.title}
                                                                className="object-cover w-full h-full"
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 justify-between">
                                                        <h5 className="font-bold text-sm text-zinc-200 line-clamp-1 flex-1">{slide.title}</h5>
                                                        <span className="text-[10px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                                            {isVideo ? "Video" : "Image"}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">{slide.description}</p>
                                                </div>
                                                <div className="flex gap-2 pt-2 border-t border-white/5">
                                                    <Button variant="secondary" onClick={() => handleEditSlide(slide)} className="flex-1 text-xs py-1 h-8">
                                                        <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                                                    </Button>
                                                    <Button variant="destructive" onClick={() => handleDeleteSlide(slide.id)} className="flex-1 text-xs py-1 h-8">
                                                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
