
'use client';

import { usePathname } from "next/navigation";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Gamepad2,
  BookOpen,
  BrainCircuit,
  GraduationCap,
  Quote,
  LogOut,
  User,
  Presentation,
  Briefcase,
  MessageCircle,
  CalendarCheck,
  AlertCircle,
  Shield,
  FileText,
  Bell,
  ListOrdered,
  Notebook,
  BookMarked,
  FileLock,
  Wrench,
  FileQuestion,
  Coffee,
  Clapperboard,
  ClipboardList,
  StickyNote,
  Egg,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, limit, onSnapshot, type FirestoreError } from "firebase/firestore";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";
import type { InternalQuery } from "@/firebase/firestore/use-collection";


const publicItems = [
  { href: "/lingo-pet", label: "Lingo-Pet", icon: Egg },
  { href: "/games", label: "Classroom Games", icon: Gamepad2 },
  { href: "/classroom-tools", label: "Classroom Tools", icon: Wrench },
  { href: "/reader", label: "Reader", icon: BookOpen },
  { href: "/generator", label: "Exercises", icon: BrainCircuit },
  { href: "/exam-mode", label: "Exam Mode", icon: FileQuestion },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/presentation", label: "Presentation", icon: Presentation },
  { href: "/rubrics", label: "Rubrics", icon: ListOrdered },
  { href: "/lesson-planner", label: "Lesson Planner", icon: Notebook },
  { href: "/quotes", label: "Quotes", icon: Quote },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/movie-relax", label: "Movie Relax", icon: Clapperboard },
  { href: "/lounge", label: "Lounge", icon: MessageCircle },
  { href: "/homework-hub", label: "Homework Hub", icon: BookMarked },
  { href: "/onet-practice", label: "O-Net Test Practice", icon: BookMarked },
  { href: "/students-record", label: "Students Record", icon: ClipboardList },
];

const privateItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/my-postings", label: "My Postings", icon: FileText },
];

const adminItems = [
    { href: "/admin", label: "Admin", icon: Shield },
];

const LAST_VISIT_KEY_LOUNGE = 'lingoland_lounge_last_visit';
const LAST_VISIT_KEY_NOTIFICATIONS = 'lingoland_notifications_last_visit';

export function AppSidebar() {
  const pathname = usePathname();
  const { user, isGuest, logoutGuest, isAdmin, setAuthAction } = useAuth();
  const router = useRouter();
  const firestore = useFirestore();
  const [hasNewLoungeMessages, setHasNewLoungeMessages] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  useEffect(() => {
    if (pathname === '/lounge') {
      localStorage.setItem(LAST_VISIT_KEY_LOUNGE, new Date().toISOString());
      setHasNewLoungeMessages(false);
    }
    if (pathname === '/notifications') {
        localStorage.setItem(LAST_VISIT_KEY_NOTIFICATIONS, new Date().toISOString());
        setHasNewNotifications(false);
    }
  }, [pathname]);

  const latestSuggestionQuery = useMemoFirebase(() => {
    if (!firestore || isGuest) return null;
    return query(collection(firestore, "suggestions"), orderBy("createdAt", "desc"), limit(1));
  }, [firestore, isGuest]);
  
  const notificationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, `users/${user.uid}/notifications`), where('isRead', '==', false));
  }, [firestore, user]);

  useEffect(() => {
    if (!notificationsQuery) {
        setHasNewNotifications(false);
        return;
    }
    const unsubscribe = onSnapshot(notificationsQuery, snapshot => {
        if (!snapshot.empty && pathname !== '/notifications') {
            setHasNewNotifications(true);
        } else {
            setHasNewNotifications(false);
        }
    }, (error: FirestoreError) => {
        const path = (notificationsQuery as unknown as InternalQuery)._query.path.canonicalString();
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          operation: 'list',
          path: path,
        }));
    });
    return () => unsubscribe();
  }, [notificationsQuery, pathname]);


  useEffect(() => {
    if (!latestSuggestionQuery) return;

    const unsubscribe = onSnapshot(latestSuggestionQuery, (snapshot) => {
      if (snapshot.empty) {
        setHasNewLoungeMessages(false);
        return;
      }
      
      const latestMessage = snapshot.docs[0].data();
      const lastVisit = localStorage.getItem(LAST_VISIT_KEY_LOUNGE);
      
      if (latestMessage.createdAt) {
        const messageTime = latestMessage.createdAt.toDate();
        if ((!lastVisit || new Date(messageTime) > new Date(lastVisit)) && pathname !== '/lounge') {
              setHasNewLoungeMessages(true);
        } else {
            setHasNewLoungeMessages(false);
        }
      }
    }, (error: FirestoreError) => {
        const path = (latestSuggestionQuery as unknown as InternalQuery)._query.path.canonicalString();
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          operation: 'list',
          path: path,
        }));
    });

    return () => unsubscribe();
  }, [latestSuggestionQuery, pathname]);


  const handleLogout = async () => {
    setAuthAction('logout');
    if (isGuest) {
        logoutGuest();
    } else {
        await signOut();
    }
    window.location.href = '/auth';
  };
  
  const baseItems = user ? [...privateItems, ...publicItems] : publicItems;
  const menuItems = isAdmin ? [...baseItems, ...adminItems] : baseItems;


  return (
    <div className="relative h-full flex flex-col">
      <div className="geometric-background">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
        <div className="shape-3"></div>
      </div>
      <div className="relative z-10 flex h-full flex-col p-2 gap-2">
        <SidebarHeader className="hidden md:flex bg-card/10">
          <div className="flex items-center gap-2 p-2 overflow-hidden">
            <GraduationCap className="h-8 w-8 shrink-0 text-primary" />
            <h1 className="text-xl font-bold font-headline truncate transition-opacity group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:hidden">LingoLandVerse</h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="bg-card/10">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                {pathname === item.href && (
                    <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-[0_0_20px_theme(colors.purple.500)]"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                     {item.href === '/lounge' && hasNewLoungeMessages && (
                        <AlertCircle className="ml-auto h-5 w-5 text-red-500 animate-pulse" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="bg-card/10">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{ children: 'Privacy Policy' }}>
                <Link href="/privacy-policy">
                  <FileLock />
                  <span>Privacy Policy</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {user || isGuest ? (
                  <SidebarMenuItem>
                      <SidebarMenuButton onClick={handleLogout}>
                          <LogOut />
                          <span>Logout</span>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
            ) : (
                  <SidebarMenuItem>
                      <SidebarMenuButton onClick={() => router.push('/auth')}>
                          <User />
                          <span>Login</span>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarFooter>
      </div>
    </div>
  );
}
