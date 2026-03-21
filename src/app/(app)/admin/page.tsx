
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
import { doc, onSnapshot, setDoc, type FirestoreError } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
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
    
    const announcementRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, "announcements", "main_banner");
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


    if (isLoading || isFetching) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
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
        </div>
    );
}
