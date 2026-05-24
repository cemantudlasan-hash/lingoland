
'use client';

import { useState, useEffect, useRef, useMemo } from "react";
import { collection, query, orderBy, onSnapshot, serverTimestamp, type FirestoreError, doc, writeBatch, setDoc, addDoc, deleteDoc, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/auth-context";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, Edit, Trash2, MessageCircle, Sticker, Pin, PinOff, UserPlus, Reply, X, ChevronDown, ChevronUp, ShieldBan } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import type { Suggestion, UserProfile } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import type { InternalQuery } from "@/firebase/firestore/use-collection";
import { addDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";


const stickerStyles = [
    "adventurer", "adventurer-neutral", "avataaars", "big-ears", "big-smile", 
    "bottts", "croodles", "fun-emoji", "icons", "identicon", "initials", 
    "lorelei", "micah", "miniavs", "open-peeps", "personas", "pixel-art", 
    "shapes", "thumbs", "notionists", "glass-animals", "rings",
    "lorelei-neutral", "pixel-art-neutral", "avataaars-neutral", "bottts-neutral",
    "croodles-neutral"
];

const forbiddenKeywords = ['porn', 'hentai', 'gambling', 'casino', 'betting', 'xxx'];

const containsForbiddenLink = (text: string): boolean => {
    try {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = text.match(urlRegex);
        if (!urls) return false;

        for (const url of urls) {
            const normalizedUrl = url.toLowerCase();
            for (const keyword of forbiddenKeywords) {
                if (normalizedUrl.includes(keyword)) {
                    return true;
                }
            }
        }
        return false;
    } catch (e) {
        return false;
    }
};


export default function LoungePage() {
  const { user, isAdmin, isGuest, userProfile, isLoading: isAuthLoading } = useAuth();
  const firestore = useFirestore();
  const PinnedMessagesKey = `lingoland_pinned_messages_${user?.uid || 'guest'}`;

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [localPinnedIds, setLocalPinnedIds] = useState<string[]>([]);
  const [showPinned, setShowPinned] = useState(true);
  const [newSuggestion, setNewSuggestion] = useState("");
  const [editingSuggestion, setEditingSuggestion] = useState<Suggestion | null>(null);
  const [replyingTo, setReplyingTo] = useState<Suggestion | null>(null);
  const [deletingSuggestionId, setDeletingSuggestionId] = useState<string | null>(null);
  const [blockingUser, setBlockingUser] = useState<{ userId: string; userName: string; } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentionState, setMentionState] = useState<{ show: boolean; query: string }>({ show: false, query: '' });
  const { toast } = useToast();
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'suggestions'), orderBy('createdAt', 'asc'));
  }, [firestore]);
  
  const pinnedSuggestions = suggestions.filter(s => localPinnedIds.includes(s.id)).sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
  });

   useEffect(() => {
    if (isGuest || !user) return;
    const savedPins = localStorage.getItem(PinnedMessagesKey);
    if (savedPins) {
      try {
        setLocalPinnedIds(JSON.parse(savedPins));
      } catch (e) {
        console.error("Failed to parse pinned messages from localStorage", e);
        setLocalPinnedIds([]);
      }
    }
  }, [PinnedMessagesKey, isGuest, user]);

  const scrollToMessage = (messageId: string) => {
    const el = messageRefs.current[messageId];
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('bg-primary/20', 'transition-colors', 'duration-1000');
        setTimeout(() => {
            el.classList.remove('bg-primary/20');
        }, 1000);
    }
  };

  useEffect(() => {
    if (isAuthLoading) {
      setIsLoading(true);
      return;
    }
    if (isGuest || !user || !firestore) {
      setIsLoading(false);
      return;
    }

    const fetchAllUsers = async () => {
        const usersRef = collection(firestore, 'users');
        getDocs(usersRef).then(usersSnap => {
            const usersList: UserProfile[] = usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
            setAllUsers(usersList.filter(p => p.displayName));
        }).catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'list',
                path: usersRef.path,
            }));
        });
    };

    fetchAllUsers();

    if (!suggestionsQuery) return;
    const unsubscribeSuggestions = onSnapshot(suggestionsQuery, 
      (snapshot) => {
        const suggestionsData: Suggestion[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              text: data.text,
              stickerUrl: data.stickerUrl,
              authorId: data.authorId,
              authorName: data.authorName,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
              isPinned: !!data.isPinned,
              replyToId: data.replyToId,
              replyToAuthor: data.replyToAuthor,
              replyToText: data.replyToText,
              mentions: data.mentions || [],
            };
        });
        setSuggestions(suggestionsData);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        setIsLoading(false);
        const path = (suggestionsQuery as unknown as InternalQuery)._query.path.canonicalString();
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          operation: 'list',
          path: path,
        }));
      }
    );

    return () => {
        unsubscribeSuggestions();
    };
  }, [isAuthLoading, user, isGuest, firestore, suggestionsQuery]);


  useEffect(() => {
    if(bottomRef.current && !replyingTo) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [suggestions, isLoading, replyingTo]);

  const handlePostSuggestion = async () => {
    if ((!newSuggestion.trim()) || !user || !userProfile || !firestore) return;
    
    if (containsForbiddenLink(newSuggestion)) {
        toast({
            variant: "destructive",
            title: "Inappropriate Content Detected",
            description: "Your message could not be sent because it contains a forbidden link.",
        });
        return;
    }

    setIsSubmitting(true);
    
    const mentionRegex = /@(\w+)/g;
    let match;
    const mentionedUserIds: string[] = [];
    while ((match = mentionRegex.exec(newSuggestion)) !== null) {
        const username = match[1];
        const mentionedUser = allUsers.find(p => p.displayName?.toLowerCase() === username.toLowerCase());
        if (mentionedUser && mentionedUser.uid !== user.uid) {
            mentionedUserIds.push(mentionedUser.uid);
        }
    }


    if (editingSuggestion) {
      if(editingSuggestion.authorId !== user.uid && !isAdmin) {
          toast({ variant: "destructive", title: "Unauthorized", description: "You cannot edit another user's suggestion." });
          setIsSubmitting(false);
          return;
      }
      const suggestionRef = doc(firestore, "suggestions", editingSuggestion.id);
      const updatedData = { text: newSuggestion, mentions: mentionedUserIds };
      
      setDocumentNonBlocking(suggestionRef, updatedData, { merge: true });

      toast({ title: "Suggestion Updated!" });
      setEditingSuggestion(null);

    } else {
      const suggestionsCollection = collection(firestore, "suggestions");
      const newSuggestionData: Partial<Suggestion> = {
        text: newSuggestion,
        authorId: user.uid,
        authorName: userProfile.displayName,
        createdAt: serverTimestamp(),
        isPinned: false,
        mentions: mentionedUserIds,
      };

      if (replyingTo) {
        newSuggestionData.replyToId = replyingTo.id;
        newSuggestionData.replyToAuthor = replyingTo.authorName;
        newSuggestionData.replyToText = replyingTo.text || "a sticker";
      }

      const newDocRef = await addDocumentNonBlocking(suggestionsCollection, newSuggestionData);
      
      if (mentionedUserIds.length > 0 && newDocRef) {
        const batch = writeBatch(firestore);
        mentionedUserIds.forEach(mentionedId => {
            const notificationRef = doc(collection(firestore, `users/${mentionedId}/notifications`));
            const notificationData = {
                userId: mentionedId,
                type: 'mention',
                text: `mentioned you in the lounge: "${newSuggestion.substring(0, 50)}..."`,
                link: `/lounge?messageId=${newDocRef.id}`,
                isRead: false,
                createdAt: serverTimestamp(),
                fromUserName: userProfile.displayName || 'Someone',
                fromUserAvatarSeed: userProfile.avatarSeed || user.uid,
            };
            batch.set(notificationRef, notificationData);
        })
        await batch.commit().catch(error => {
            errorEmitter.emit( 'permission-error', new FirestorePermissionError({
                path: `users/{userId}/notifications/{notificationId}`,
                operation: 'create',
                requestResourceData: 'Multiple notifications',
            }));
        });
      }
    }
    setNewSuggestion("");
    setReplyingTo(null);
    setIsSubmitting(false);
    setMentionState({ show: false, query: '' });
  };
  
  const handleSendSticker = async (style: string) => {
      if (!user || !userProfile || !firestore) return;
      setIsSubmitting(true);

      const stickerUrl = `https://api.dicebear.com/8.x/${style}/svg?seed=${user.uid}&flip=true&radius=10&backgroundType=gradientLinear,solid&backgroundColor=transparent`;

      const suggestionsCollection = collection(firestore, "suggestions");
      const newStickerData: Partial<Suggestion> = {
        stickerUrl,
        authorId: user.uid,
        authorName: userProfile.displayName,
        createdAt: serverTimestamp(),
        isPinned: false,
      };
      
      if (replyingTo) {
        newStickerData.replyToId = replyingTo.id;
        newStickerData.replyToAuthor = replyingTo.authorName;
        newStickerData.replyToText = "a sticker";
      }

      addDocumentNonBlocking(suggestionsCollection, newStickerData);
      setReplyingTo(null);
      setIsSubmitting(false);
  }

  const handleEdit = (suggestion: Suggestion) => {
      if(suggestion.text) {
        setEditingSuggestion(suggestion);
        setNewSuggestion(suggestion.text);
        setReplyingTo(null);
        textareaRef.current?.focus();
      }
  }

  const handleReply = (suggestion: Suggestion) => {
      setReplyingTo(suggestion);
      setEditingSuggestion(null);
      textareaRef.current?.focus();
  }

  const handleDelete = async () => {
    if (!deletingSuggestionId || !firestore || !user) return;
    
    const suggestionToDelete = suggestions.find(s => s.id === deletingSuggestionId);
    if (suggestionToDelete && suggestionToDelete.authorId !== user.uid && !isAdmin) {
        toast({ variant: "destructive", title: "Unauthorized", description: "You cannot delete another user's suggestion." });
        setDeletingSuggestionId(null);
        return;
    }

    const suggestionRef = doc(firestore, "suggestions", deletingSuggestionId);
    
    deleteDocumentNonBlocking(suggestionRef);

    toast({ title: "Suggestion Deleted" });
    setDeletingSuggestionId(null);
  }
  
  const handlePinToggle = (suggestion: Suggestion) => {
      if (isGuest) {
          toast({ variant: 'destructive', title: "Feature Disabled", description: "Guests cannot pin messages."});
          return;
      }

      setLocalPinnedIds(prevIds => {
          const newIds = prevIds.includes(suggestion.id)
              ? prevIds.filter(id => id !== suggestion.id)
              : [...prevIds, suggestion.id];
          localStorage.setItem(PinnedMessagesKey, JSON.stringify(newIds));
          return newIds;
      });
  };

    const handleBlockUser = async () => {
        if (!blockingUser || !firestore || !isAdmin) return;
        
        const blockRef = doc(firestore, 'blockedUsers', blockingUser.userId);
        setDocumentNonBlocking(blockRef, {
            blockedAt: serverTimestamp(),
            blockedBy: user?.uid,
        }, { merge: true });

        const userRef = doc(firestore, 'users', blockingUser.userId);
        setDocumentNonBlocking(userRef, { isBlocked: true }, { merge: true });
        
        toast({
            title: "User Blocked",
            description: `${blockingUser.userName} has been blocked from posting in the lounge.`,
        });
        setBlockingUser(null);
    };

  const getInitials = (name?: string | null) => {
    if (!name) return 'G';
    const names = name.split(' ');
    if (names.length > 1 && names[1]) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  const handleMentionSelect = (displayName: string) => {
    setNewSuggestion(prev => {
        const atIndex = prev.lastIndexOf('@');
        return prev.substring(0, atIndex) + `@${displayName} `;
    });
    setMentionState({ show: false, query: '' });
    textareaRef.current?.focus();
  }
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNewSuggestion(text);

    const atIndex = text.lastIndexOf('@');
    const spaceAfterAt = text.substring(atIndex + 1).indexOf(' ');

    if (atIndex !== -1 && (spaceAfterAt === -1 || atIndex === text.length -1)) {
        setMentionState({ show: true, query: text.substring(atIndex + 1) });
    } else {
        setMentionState({ show: false, query: '' });
    }
  };

  const mentionableUsers = useMemo(() => {
    if (!mentionState.show || !mentionState.query) return [];
    
    const queryLower = mentionState.query.toLowerCase();
    return allUsers.filter(p => 
        p.uid !== user?.uid && 
        p.displayName?.toLowerCase().includes(queryLower)
    ).slice(0, 5);
  }, [mentionState.query, mentionState.show, allUsers, user?.uid]);


  const renderMessageText = (text: string) => {
      const parts = text.split(/(@\w+)/g);
      return parts.map((part, index) => {
          if (part.startsWith('@')) {
              const username = part.substring(1);
              const mentionedUser = allUsers.find(p => p.displayName?.toLowerCase() === username.toLowerCase());
              if (mentionedUser) {
                  return <strong key={index} className="bg-primary/20 text-primary-foreground rounded px-1">@{username}</strong>
              }
          }
          return part;
      });
  };

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (isGuest) {
      return (
        <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full gap-4">
            <UserPlus className="h-16 w-16" />
            <h3 className="text-xl font-bold">Wanna find out?</h3>
            <p>Register now to view and use the community lounge.</p>
            <Button asChild>
                <Link href="/auth">Sign Up or Login</Link>
            </Button>
        </div>
      )
    }
    
    if (suggestions.length === 0) {
        return (
            <div className="text-center text-muted-foreground">
                <MessageCircle className="mx-auto h-12 w-12" />
                <p className="mt-4">No suggestions yet. Be the first to share one!</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {suggestions.map((suggestion, index) => {
                const authorProfile = allUsers.find(u => u.uid === suggestion.authorId);
                const isCurrentUser = user?.uid === suggestion.authorId;
                const messageColor = isCurrentUser ? 'bg-blue-500' : 'bg-pink-500';
                const isStickerOnly = suggestion.stickerUrl && !suggestion.text;
                
                // Determine if we should show the public profile link
                const isAdminAccount = authorProfile?.email === "cemantudlasan2@gmail.com";
                const canViewProfile = authorProfile && !isAdminAccount;

                return (
                    <div
                        key={suggestion.id}
                        ref={(el) => { if (el) messageRefs.current[suggestion.id] = el; }}
                        className={cn("flex items-start gap-4 group", isCurrentUser ? "justify-end" : "justify-start")}
                    >
                         <div className={cn("flex items-start gap-4", isCurrentUser && "flex-row-reverse")}>
                            {canViewProfile ? (
                                <Link href={`/users/${suggestion.authorId}`} className="transition-transform hover:scale-110 active:scale-95">
                                    <Avatar className="h-12 w-12 border-2 border-primary/20 flex-shrink-0">
                                        <AvatarImage src={authorProfile?.avatarSeed ? `https://api.dicebear.com/8.x/notionists/svg?seed=${authorProfile.avatarSeed}&backgroundColor=18181b` : `https://api.dicebear.com/8.x/initials/svg?seed=${suggestion.authorName}`} alt={suggestion.authorName || ''} />
                                        <AvatarFallback>{getInitials(suggestion.authorName)}</AvatarFallback>
                                    </Avatar>
                                </Link>
                            ) : (
                                <Avatar className="h-12 w-12 border-2 border-background flex-shrink-0">
                                    <AvatarImage src={authorProfile?.avatarSeed ? `https://api.dicebear.com/8.x/notionists/svg?seed=${authorProfile.avatarSeed}&backgroundColor=18181b` : `https://api.dicebear.com/8.x/initials/svg?seed=${suggestion.authorName}`} alt={suggestion.authorName || ''} />
                                    <AvatarFallback>{getInitials(suggestion.authorName)}</AvatarFallback>
                                </Avatar>
                            )}

                            <div className={cn("flex flex-col", isCurrentUser ? "items-end" : "items-start")}>
                                <p className="font-bold text-sm text-gray-400 mb-1">{suggestion.authorName}</p>
                                <div className="flex items-center gap-2">
                                    <div className={cn(isCurrentUser && "order-2")}>
                                        <div className={cn("text-white rounded-lg inline-block max-w-[72vw] sm:max-w-md md:max-w-lg lg:max-w-2xl break-words min-w-0", isStickerOnly ? 'bg-transparent' : 'p-4', !isStickerOnly && messageColor)}>
                                            {suggestion.replyToId && (
                                            <div className="border-l-2 border-white/50 pl-2 text-xs mb-2 opacity-80 cursor-pointer min-w-0 w-full" onClick={() => scrollToMessage(suggestion.replyToId!)}>
                                                <p className="font-bold truncate">Replying to {suggestion.replyToAuthor}</p>
                                                <p className="truncate italic">"{suggestion.replyToText}"</p>
                                            </div>
                                        )}
                                        
                                            {suggestion.text && <p className="text-base whitespace-pre-line break-words">{renderMessageText(suggestion.text)}</p>}
                                            {suggestion.stickerUrl && <Image unoptimized src={suggestion.stickerUrl} alt="sticker" width={128} height={128} className="rounded-md bg-transparent" />}
                                        </div>
                                    </div>
                                    {user && !isGuest && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center self-center">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400" onClick={() => handlePinToggle(suggestion)}><Pin className={cn("h-3 w-3", localPinnedIds.includes(suggestion.id) && "fill-amber-400 text-amber-400")}/></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400" onClick={() => handleReply(suggestion)}><Reply className="h-3 w-3"/></Button>
                                            {(isCurrentUser || isAdmin) && suggestion.text && <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400" onClick={() => handleEdit(suggestion)}><Edit className="h-3 w-3"/></Button>}
                                            {(isCurrentUser || isAdmin) && <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400" onClick={() => setDeletingSuggestionId(suggestion.id)}><Trash2 className="h-3 w-3 text-destructive"/></Button>}
                                            {isAdmin && !isCurrentUser && <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => setBlockingUser({ userId: suggestion.authorId, userName: suggestion.authorName})}><ShieldBan className="h-4 w-4"/></Button>}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs mt-1 text-gray-400">
                                    {suggestion.createdAt ? formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true }) : 'just now'}
                                </p>
                            </div>
                        </div>
                    </div>
                )
            })}
            <div ref={bottomRef} />
        </div>
    )
  }
  
  const renderMentionBox = () => {
    if (!mentionState.show) return null;

    return (
        <div className="bg-muted p-2 rounded-lg w-full max-h-32 overflow-y-auto">
            {mentionableUsers.length > 0 ? (
                mentionableUsers.map(p => (
                    <div key={p.uid} onClick={() => handleMentionSelect(p.displayName!)} className="p-2 hover:bg-primary/10 rounded cursor-pointer flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={p.avatarSeed ? `https://api.dicebear.com/8.x/notionists/svg?seed=${p.avatarSeed}&backgroundColor=18181b` : `https://api.dicebear.com/8.x/initials/svg?seed=${p.displayName}`} alt={p.displayName!} />
                            <AvatarFallback>{getInitials(p.displayName)}</AvatarFallback>
                        </Avatar>
                        <span>{p.displayName}</span>
                    </div>
                ))
            ) : (
                <p className="p-2 text-sm text-muted-foreground">No users found matching "{mentionState.query}"</p>
            )}
        </div>
    );
  };


  return (
    <div className="relative w-full h-full p-0 bg-transparent">
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col h-full">
        <Card className="w-full h-full flex flex-col overflow-hidden">
          <CardHeader className="text-white bg-gradient-to-r from-purple-500 to-indigo-600 text-center flex-shrink-0">
            <CardTitle className="flex items-center justify-center gap-2 text-3xl">
              <MessageCircle />
              Community Lounge
            </CardTitle>
            <CardDescription className="text-gray-300 text-center">Share your suggestions, comments, and ideas with the community.</CardDescription>
          </CardHeader>
          <div className="flex-1 flex flex-col min-h-0">
            {pinnedSuggestions.length > 0 && !isGuest && (
              <div className="px-6 py-2 border-b-2 border-primary/10 flex-shrink-0 z-10 bg-card/80 backdrop-blur-sm">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowPinned(!showPinned)}>
                  <h4 className="text-sm font-bold text-muted-foreground flex items-center gap-2"><Pin className="h-4 w-4 text-amber-500" /> Pinned Messages ({pinnedSuggestions.length})</h4>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                    {showPinned ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                {showPinned && (
                  <div className="flex gap-4 overflow-x-auto pb-2 pt-2">
                    {pinnedSuggestions.map(suggestion => (
                      <div key={suggestion.id} className="p-3 rounded-lg bg-muted/50 border border-amber-400/50 w-64 flex-shrink-0 cursor-pointer hover:bg-muted" onClick={() => scrollToMessage(suggestion.id)}>
                        <p className="text-sm font-bold truncate">{suggestion.authorName}</p>
                        <p className="text-sm text-muted-foreground truncate">{suggestion.text || "Sticker"}</p>
                        <Button variant="ghost" size="icon" className="h-6 w-6 float-right" onClick={(e) => { e.stopPropagation(); handlePinToggle(suggestion); }}>
                          <PinOff className="h-3 w-3 text-amber-500"/>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <CardContent className="flex-1 overflow-y-auto p-3 sm:p-6">
              {renderContent()}
            </CardContent>
            {user && !isGuest && userProfile && (
              <CardFooter className="pt-4 border-t-2 border-border/20 flex flex-col items-start gap-2 flex-shrink-0">
                {mentionState.show && (
                  <div className="bg-muted p-2 rounded-lg w-full max-h-32 overflow-y-auto">
                    {mentionableUsers.length > 0 ? (
                      mentionableUsers.map(p => (
                        <div key={p.uid} onClick={() => handleMentionSelect(p.displayName!)} className="p-2 hover:bg-primary/10 rounded cursor-pointer flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={p.avatarSeed ? `https://api.dicebear.com/8.x/notionists/svg?seed=${p.avatarSeed}&backgroundColor=18181b` : `https://api.dicebear.com/8.x/initials/svg?seed=${p.displayName}`} alt={p.displayName!} />
                            <AvatarFallback>{getInitials(p.displayName)}</AvatarFallback>
                          </Avatar>
                          <span>{p.displayName}</span>
                        </div>
                      ))
                    ) : (
                      <p className="p-2 text-sm text-muted-foreground">No users found matching "{mentionState.query}"</p>
                    )}
                  </div>
                )}
                {replyingTo && (
                  <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md w-full flex justify-between items-center">
                    <div>
                      Replying to <span className="font-bold">{replyingTo.authorName}</span>: <em className="truncate">"{replyingTo.text?.substring(0, 30)}..."</em>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyingTo(null)}><X className="h-4 w-4"/></Button>
                  </div>
                )}
                <div className="flex w-full items-center gap-2">
                  <Avatar>
                    <AvatarImage src={userProfile.avatarSeed ? `https://api.dicebear.com/8.x/notionists/svg?seed=${userProfile.avatarSeed}&backgroundColor=18181b` : `https://api.dicebear.com/8.x/initials/svg?seed=${userProfile.displayName}`} alt={userProfile.displayName || ''} />
                    <AvatarFallback>{getInitials(userProfile?.displayName)}</AvatarFallback>
                  </Avatar>
                  <Textarea
                    ref={textareaRef}
                    placeholder={editingSuggestion ? "Edit your suggestion..." : "Type your suggestion here... use @ to mention"}
                    value={newSuggestion}
                    onChange={handleTextChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handlePostSuggestion();
                      }
                    }}
                    rows={1}
                    className="flex-1 bg-muted/80 text-foreground border-border/50 focus-visible:ring-1 focus-visible:ring-primary min-h-[40px] max-h-32 py-2 resize-none"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
                        <Sticker/>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 h-96">
                      <div className="grid grid-cols-4 gap-4 overflow-y-auto h-full">
                        {stickerStyles.map((style) => (
                          <Button key={style} variant="ghost" className="h-16 w-16" onClick={() => handleSendSticker(style)}>
                            <Image 
                              unoptimized
                              src={`https://api.dicebear.com/8.x/${style}/svg?seed=${user?.uid || 'guest'}&flip=true&radius=10&backgroundType=gradientLinear,solid&backgroundColor=transparent`}
                              alt={style}
                              width={64}
                              height={64}
                            />
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button onClick={handlePostSuggestion} disabled={isSubmitting || !newSuggestion.trim()} size="icon" className="rounded-full flex-shrink-0">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                  </Button>
                  {editingSuggestion && (
                    <Button variant="ghost" onClick={() => { setEditingSuggestion(null); setNewSuggestion(""); }}>Cancel</Button>
                  )}
                </div>
              </CardFooter>
            )}
          </div>
          <AlertDialog open={!!deletingSuggestionId} onOpenChange={(open) => !open && setDeletingSuggestionId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this suggestion. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
           <AlertDialog open={!!blockingUser} onOpenChange={(open) => !open && setBlockingUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Block</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to block <strong>{blockingUser?.userName}</strong>? They will no longer be able to post messages in the Community Lounge.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBlockUser} className="bg-destructive hover:bg-destructive/90">Block User</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
      </div>
    </div>
  );
}

