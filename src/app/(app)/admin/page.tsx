"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { doc, onSnapshot, type FirestoreError } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

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
    
    const announcementRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, "announcements", "main_banner");
    }, [firestore]);

    const widgetMessagesRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, "announcements", "floating_pet_widget");
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

    if (isLoading || isFetching) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
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
            </div>
        </div>
    );
}
