'use client';

import { useSidebar } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { signOut } from "@/lib/auth";
import { User as UserIcon, Coffee, Megaphone, Bell, Trash2, GraduationCap, PanelLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { doc, onSnapshot, type FirestoreError, collection, query, writeBatch, orderBy, getDocs, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";
import type { Notification } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { InternalQuery } from "@/firebase/firestore/use-collection";
import { allGames } from "@/lib/games";

const pageTitles: { [key: string]: string } = {
  "/": "LingoLandVerse Home",
  "/dashboard": "Dashboard",
  "/games": "Game Library",
  "/classroom-tools": "Classroom Tools",
  "/reader": "Reader",
  "/generator": "AI Exercise Generator",
  "/attendance": "Attendance Tracker",
  "/presentation": "Presentation Maker",
  "/rubrics": "Rubrics",
  "/quotes": "Inspirational Quotes",
  "/jobs": "Job Board",
  "/profile": "Your Profile",
  "/lounge": "Community Lounge",
  "/admin": "Admin Dashboard",
  "/my-postings": "My Job Postings",
  "/notifications": "Notifications",
  "/onet-practice": "O-Net Test Practice",
};

function getTitleForPathname(pathname: string): string {
    if (pageTitles[pathname]) {
        return pageTitles[pathname];
    }
    const gameMatch = pathname.match(/^\/games\/([a-zA-Z0-9-]+)/);
    if (gameMatch) {
        const game = allGames.find(g => g.slug === gameMatch[1]);
        return game ? game.title : "Classroom Games";
    }

    const readerMatch = pathname.match(/^\/reader\/([a-zA-Z0-9-]+)/);
    if (readerMatch) {
        return "Article";
    }

    return "LingoLandVerse";
}


export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, isGuest, logoutGuest, isAdmin, setAuthAction } = useAuth();
  const title = getTitleForPathname(pathname);
  const firestore = useFirestore();
  const { toggleSidebar } = useSidebar();

  const [announcement, setAnnouncement] = useState<{ text: string; isActive: boolean } | null>(null);
  const [isClearAlertOpen, setIsClearAlertOpen] = useState(false);
  const [activeReminders, setActiveReminders] = useState<{ id: string; title: string; content: string }[]>([]);


  const notificationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, `users/${user.uid}/notifications`), orderBy('createdAt', 'desc'));
  }, [firestore, user]);


  const { data: notifications } = useCollection<Notification>(notificationsQuery);
  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleNotificationClick = async (notification: Notification) => {
    router.push(notification.link || '#');
    if (!notification.isRead && firestore && user) {
        const notifRef = doc(firestore, `users/${user.uid}/notifications`, notification.id);
        try {
            await setDoc(notifRef, { isRead: true }, { merge: true });
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || !firestore || !notifications || notifications.length === 0) return;
    
    const batch = writeBatch(firestore);
    notifications.forEach(notification => {
        if(!notification.isRead) {
            const notifRef = doc(firestore, `users/${user.uid}/notifications`, notification.id);
            batch.update(notifRef, { isRead: true });
        }
    });
    
    await batch.commit().catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `users/${user.uid}/notifications`,
            operation: 'update',
            requestResourceData: { isRead: true }
        }));
    });
  };

  const handleClearAllNotifications = async () => {
    if (!user || !firestore || !notifications || !notifications.length) return;
    
    const batch = writeBatch(firestore);
    notifications.forEach(notification => {
        const notifRef = doc(firestore, `users/${user.uid}/notifications`, notification.id);
        batch.delete(notifRef);
    });
    
    await batch.commit().catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `users/${user.uid}/notifications`,
            operation: 'delete'
        }));
    });
    setIsClearAlertOpen(false);
  };
  
  useEffect(() => {
    if (!firestore) return;

    const announcementRef = doc(firestore, "announcements", "main_banner");
    const unsubscribe = onSnapshot(announcementRef, (doc) => {
      if (doc.exists()) {
        setAnnouncement(doc.data() as { text: string; isActive: boolean });
      } else {
        setAnnouncement(null);
      }
    },
    (error: FirestoreError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          operation: 'get',
          path: announcementRef.path,
        }));
    });

    return () => unsubscribe();
  }, [firestore]);

  useEffect(() => {
    if (!firestore || !user) return;

    const memosRef = collection(firestore, `users/${user.uid}/memorandums`);
    
    const unsubscribe = onSnapshot(memosRef, async (snapshot) => {
      const now = new Date();
      const batch = writeBatch(firestore);
      let hasUpdates = false;
      const popupsToShow: { id: string; title: string; content: string }[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const notifyAt = data.notifyAt;
        const notified = data.notified;
        const showPopup = data.showPopup;

        if (notifyAt && notified === false) {
          const notifyDate = typeof notifyAt.toDate === 'function' ? notifyAt.toDate() : new Date(notifyAt.seconds * 1000);
          if (notifyDate <= now) {
            // Create notification doc in notifications subcollection
            const notifRef = doc(collection(firestore, `users/${user.uid}/notifications`));
            batch.set(notifRef, {
              userId: user.uid,
              type: 'memorandum_reminder',
              text: `Reminder: "${data.title || 'Untitled'}" - ${data.content || ''}`,
              link: '/classroom-tools?tab=memorandum',
              isRead: false,
              createdAt: serverTimestamp(),
              fromUserName: 'Memorandum Reminder',
            });

            // Mark memo as notified
            const memoRef = doc(firestore, `users/${user.uid}/memorandums`, docSnap.id);
            batch.update(memoRef, { notified: true });
            
            if (showPopup) {
              popupsToShow.push({
                id: docSnap.id,
                title: data.title || 'Untitled',
                content: data.content || '',
              });
            }
            
            hasUpdates = true;
          }
        }
      });

      if (hasUpdates) {
        try {
          await batch.commit();
          if (popupsToShow.length > 0) {
            setActiveReminders((prev) => [...prev, ...popupsToShow]);
          }
        } catch (err) {
          console.error("Error committing notification batch:", err);
        }
      }
    });

    return () => unsubscribe();
  }, [firestore, user]);


  const handleLogout = async () => {
    setAuthAction('logout');
    if (isGuest) {
      logoutGuest();
    } else {
      await signOut();
    }
    window.location.href = '/auth';
  };
  
  const handleSupportClick = () => {
    router.push('/support');
  };

  const handleCoffeeClick = () => {
    window.open("https://www.buymeacoffee.com/cemantudlasan", "_blank");
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'G';
    const names = name.split(' ');
    if (names.length > 1 && names[1]) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  const renderAuthContent = () => {
    if (user && userProfile) {
        return (
            <div className="flex items-center gap-2">
                 <AlertDialog open={isClearAlertOpen} onOpenChange={setIsClearAlertOpen}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="relative text-foreground/80 hover:text-foreground focus-visible:ring-0 focus-visible:ring-offset-0">
                                <Bell />
                                {unreadCount > 0 && <span className="absolute top-1 right-1 flex h-3 w-3 rounded-full bg-red-500 border-2 border-background" />}
                            </Button>
                        </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-80 p-0">
                            <DropdownMenuLabel className="flex justify-between items-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-3 rounded-t-md">
                                <span>Notifications</span>
                                 {unreadCount > 0 && <Badge variant="secondary" className="bg-white/20 text-white border-transparent">{unreadCount} New</Badge>}
                            </DropdownMenuLabel>
                            <div className="p-1 bg-card/80 backdrop-blur-sm">
                                <ScrollArea className="h-[300px]">
                                    {notifications && notifications.length > 0 ? (
                                    <>
                                        {notifications.map(notif => (
                                            <DropdownMenuItem key={notif.id} onSelect={() => handleNotificationClick(notif)} className="flex items-start gap-2 focus:bg-primary/10">
                                                {!notif.isRead && <span className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />}
                                                <div className={cn('flex-grow', notif.isRead ? 'opacity-70' : '')}>
                                                    <p className="whitespace-normal text-sm">
                                                        <span className="font-bold">{notif.fromUserName}</span> {notif.text}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {notif.createdAt?.toDate ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true }) : ''}
                                                    </p>
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </>
                                    ) : (
                                        <p className="p-4 text-center text-sm text-muted-foreground">No notifications yet.</p>
                                    )}
                                </ScrollArea>
                                {notifications && notifications.length > 0 && (
                                    <>
                                        <DropdownMenuSeparator className="bg-border/50" />
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent cursor-default">
                                            <div className="flex justify-between w-full items-center">
                                                <span onClick={handleMarkAllAsRead} className="flex-1 cursor-pointer text-sm text-muted-foreground hover:text-foreground">Mark all as read</span>
                                                <AlertDialogTrigger asChild>
                                                     <span className="text-red-600 cursor-pointer hover:text-red-800 text-sm">Clear All</span>
                                                </AlertDialogTrigger>
                                            </div>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all of your notifications.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAllNotifications} className="bg-destructive hover:bg-destructive/90">
                            Clear All
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0">
                        <Avatar className="h-10 w-10 border-2 border-transparent hover:border-primary">
                            <AvatarImage src={userProfile.avatarSeed ? `https://api.dicebear.com/8.x/notionists/svg?seed=${userProfile.avatarSeed}&backgroundColor=18181b` : `https://api.dicebear.com/8.x/initials/svg?seed=${userProfile.displayName}`} alt={userProfile.displayName || 'user'} />
                            <AvatarFallback>{getInitials(userProfile.displayName)}</AvatarFallback>
                        </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
                        {isAdmin && <DropdownMenuItem onClick={() => router.push('/admin')}>Admin Dashboard</DropdownMenuItem>}
                        <DropdownMenuItem onClick={handleSupportClick}>Customer Support</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    }
    if (isGuest) {
        return (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback>G</AvatarFallback>
                    </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Guest Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/auth')}>Login/Sign Up</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }
    return <Button onClick={() => router.push('/auth')}>Login</Button>
  }


  return (
    <header className="sticky top-0 z-30 flex shrink-0 flex-col items-center border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
      {!isAdmin && announcement && announcement.isActive && (
        <div className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-primary-foreground py-2 text-sm font-semibold overflow-hidden">
          <div className="marquee flex items-center gap-4">
            <Megaphone className="h-5 w-5 flex-shrink-0"/>
            <span className="flex-shrink-0">{announcement.text}</span>
          </div>
        </div>
      )}
      {!isAdmin && (
        <div className="w-full bg-yellow-400 text-black py-1 text-sm font-bold text-center">
            <Button variant="link" className="text-black p-0 h-auto font-bold" onClick={handleCoffeeClick}>
                <Coffee className="h-5 w-5 flex-shrink-0 mr-2"/>
                <span>Enjoying this site/app? Consider supporting its maintenance. Buy me a coffee! Feel free to donate starts at 1$.</span>
            </Button>
        </div>
      )}
      <div className="relative z-10 flex h-16 w-full items-center justify-between px-4 sm:px-6 bg-card/10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={toggleSidebar} className="group -ml-2 px-2 text-sidebar-foreground gap-2 transition-all hover:bg-card/20">
                <PanelLeft className="h-5 w-5 text-primary group-hover:animate-none animate-pulse" />
                <div className="flex flex-col items-start">
                    <span className="font-semibold text-sm leading-none">Menu</span>
                    <span className="text-[10px] text-muted-foreground leading-none hidden md:block mt-1">Hover left edge</span>
                </div>
            </Button>
            <div className="h-6 w-px bg-border/50 hidden md:block mx-1"></div>
            <div className="items-center gap-2 p-2 hidden md:flex">
                <GraduationCap className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold font-headline">LingoLandVerse</h1>
            </div>
        </div>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold hidden md:block md:text-xl font-headline text-foreground">{title}</h1>
        <div className="flex items-center gap-4">
            {renderAuthContent()}
        </div>
      </div>
      {activeReminders.length > 0 && (
        <AlertDialog open={true} onOpenChange={() => {}}>
          <AlertDialogContent className="border-2 border-primary/20 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold font-headline text-primary">
                <Bell className="animate-bounce h-6 w-6 text-yellow-500" />
                Memorandum Reminder
              </AlertDialogTitle>
              <AlertDialogDescription className="text-foreground mt-4 space-y-2">
                <p className="font-bold text-lg">{activeReminders[0].title}</p>
                <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap max-h-[40vh] overflow-y-auto border border-border text-sm">
                  {activeReminders[0].content}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => {
                  setActiveReminders(prev => prev.slice(1));
                }}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6"
              >
                Got it!
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </header>
  );
}

