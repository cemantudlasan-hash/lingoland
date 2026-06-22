
"use client";

import { useState, useMemo } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, setDoc, getDocs, writeBatch } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit, Quote as QuoteIcon, Loader2 } from "lucide-react";
import { AddEditQuoteDialog } from "./add-edit-quote-dialog";
import type { Quote } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const categoryGradients = {
    love: "from-pink-500 to-red-500",
    friendship: "from-sky-400 to-blue-500",
    goal: "from-green-400 to-teal-500",
    family: "from-orange-400 to-amber-500",
    other: "from-slate-500 to-gray-600",
};

export function QuoteActions() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
    const { user, isAdmin, isGuest } = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    const quotesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "quotes"), orderBy("createdAt", "desc"));
    }, [firestore]);

    const { data: quotes, isLoading } = useCollection<Quote>(quotesQuery);

    const handleSaveQuote = async (quoteData: Omit<Quote, 'id' | 'isUserQuote' | 'createdAt' | 'userId'> & { id?: string }) => {
        if (!user || !firestore) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to save a quote." });
            return;
        }

        if (quoteData.id) {
            // Editing existing quote
            const originalQuote = quotes?.find(q => q.id === quoteData.id);
            if(originalQuote?.userId !== user.uid && !isAdmin) {
                toast({ variant: "destructive", title: "Permission Denied", description: "You can only edit your own quotes." });
                return;
            }
            const { id, ...updateData } = quoteData;
            const quoteRef = doc(firestore, "quotes", id);
            setDocumentNonBlocking(quoteRef, updateData, { merge: true });
            toast({ title: "Quote Updated!", description: "Your changes have been saved." });
        } else {
            // Adding new quote
            const { id, ...newQuoteData } = quoteData;
            const dataToSave = {
                ...newQuoteData,
                userId: user.uid,
                createdAt: serverTimestamp(),
            };
            const docRef = await addDocumentNonBlocking(collection(firestore, "quotes"), dataToSave);

            if (docRef) {
                // Notify all users
                const usersSnapshot = await getDocs(collection(firestore, 'users'));
                const batch = writeBatch(firestore);
                usersSnapshot.forEach(userDoc => {
                    if (userDoc.id !== user.uid && userDoc.id !== 'guest') { // Don't notify the poster or guest
                        const notificationRef = doc(collection(firestore, `users/${userDoc.id}/notifications`));
                        batch.set(notificationRef, {
                            userId: userDoc.id,
                            type: 'new_quote',
                            text: `A new quote by ${newQuoteData.author} was added.`,
                            link: `/quotes#${docRef.id}`,
                            isRead: false,
                            createdAt: serverTimestamp(),
                            fromUserName: "LingoLand Quotes",
                        });
                    }
                });
                await batch.commit();
            }

            toast({ title: "Quote Added!", description: "Your quote is now shared with the community." });
        }
        setIsDialogOpen(false);
    };

    const handleDeleteQuote = (id: string) => {
        if (!user || !firestore) return;
        const originalQuote = quotes?.find(q => q.id === id);
         if(originalQuote?.userId !== user.uid && !isAdmin) {
            toast({ variant: "destructive", title: "Permission Denied", description: "You can only delete your own quotes." });
            return;
        }
        deleteDocumentNonBlocking(doc(firestore, "quotes", id));
        toast({ title: "Quote Deleted", variant: "destructive" });
    };

    const handleEditQuote = (quote: Quote) => {
        const originalQuote = quotes?.find(q => q.id === quote.id);
        if(originalQuote?.userId !== user?.uid && !isAdmin) {
            toast({ variant: "destructive", title: "Permission Denied", description: "You can only edit your own quotes." });
            return;
        }
        setEditingQuote(quote);
        setIsDialogOpen(true);
    }
    
    const handleAddQuote = () => {
        setEditingQuote(null);
        setIsDialogOpen(true);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                {user && !isGuest && (
                    <Button onClick={handleAddQuote}>
                        <Plus className="mr-2 h-4 w-4" /> Add Your Quote
                    </Button>
                )}
            </div>
            {isLoading && (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {quotes?.map((quote) => (
                    <Card 
                        key={quote.id}
                        id={quote.id}
                        className="flex flex-col bg-white text-black border-gray-200 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 rounded-xl overflow-hidden"
                    >
                         <div className={cn("h-1.5 bg-gradient-to-r", categoryGradients[quote.category] || categoryGradients.other)}></div>
                        <div className="relative pt-12 pb-6 px-8 flex-grow flex flex-col justify-center">
                             <div className={cn("absolute -top-1 left-1/2 -translate-x-1/2 w-16 h-16 flex items-center justify-center text-white bg-gradient-to-br", categoryGradients[quote.category] || categoryGradients.other)}
                                 style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)' }}>
                                <QuoteIcon className="w-8 h-8 opacity-80" />
                            </div>
                            <CardTitle className="text-xl font-normal italic text-center text-gray-700">
                                "{quote.text}"
                            </CardTitle>
                        </div>
                        <CardContent className="flex-shrink-0 p-6 pt-0 text-center">
                             <Avatar className="h-14 w-14 mx-auto mb-3 border-2 border-gray-200">
                                <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${quote.author}`} alt={quote.author} />
                                <AvatarFallback>{quote.author.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <p className="font-bold text-gray-800">{quote.author}</p>
                            <p className="text-sm text-gray-500 capitalize">{quote.category}</p>
                        </CardContent>
                        {user && (quote.userId === user.uid || isAdmin) && (
                            <CardFooter className="flex justify-end gap-2 p-2 bg-gray-50">
                                <Button variant="ghost" size="icon" onClick={() => handleEditQuote(quote)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteQuote(quote.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                ))}
            </div>
             <AddEditQuoteDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSave={handleSaveQuote}
                quote={editingQuote}
            />
        </div>
    );
}
