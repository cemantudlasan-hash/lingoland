"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Users, MessageSquare, Trash2, Calendar, Lock, Unlock, Play, Pause, Mic, 
  Square, Plus, Sparkles, Clock, Crown, Settings, LogOut, Check, X, 
  ShieldAlert, Award, FileText, Send, Volume2, RotateCcw, ListCollapse, ArrowUp, ArrowDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Firebase imports
import { db, storage } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  writeBatch, 
  getDocs, 
  getDoc 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Profanity list
const BANNED_WORDS = [
  "fuck", "shit", "asshole", "bitch", "cunt", "dick", "pussy", "bastard", "slut", "whore",
  "faggot", "nigger", "crap", "damn", "foul", "bastards", "motherfucker", "fucker", "cock",
  "ass", "bullshit"
];

const containsBadWord = (text: string) => {
  const normalized = text.toLowerCase();
  return BANNED_WORDS.some(word => {
    const regex = new RegExp(`\\b${word}\\b|${word}`, 'i');
    return regex.test(normalized);
  });
};

// Interface definitions
interface RoleplayRoom {
  id: string;
  name: string;
  password?: string;
  scenario: string;
  dueDate: string; // Expiry date
  timerMinutes: number;
  timerStartedAt?: number | null; // timestamp
  creatorUid: string;
  creatorName: string;
  isPrivate?: boolean;
  notes: StickyNote[];
}

interface ChatMessage {
  id: string;
  senderName: string;
  senderSeat: string;
  senderRole: string;
  content: string;
  type: "text" | "voice";
  timestamp: number;
  audioDuration?: number; // seconds
  audioUrl?: string; // stored Firebase Storage download URL
}

interface StickyNote {
  id: string;
  content: string;
  color: "yellow" | "blue" | "pink" | "green" | "purple";
  senderName: string;
  senderSeat: string;
  x: number;
  y: number;
}

const scenarioPresets = [
  {
    id: "airport",
    title: "Help! Lost Luggage at Boarding Gate",
    desc: "A chaotic travel scenario. Actor A is a traveler who has lost their passport and luggage. Actor B is a strict gate agent who is boarding the flight. Focus: Navigating travel, expressing urgency, and descriptive narration."
  },
  {
    id: "business",
    title: "High-Stakes Contract Negotiation",
    desc: "A formal corporate setting. Actor A is the founder of a promising green-tech startup. Actor B is a shrewd venture capitalist negotiator. Focus: Formality, natural corporate idioms, numbers, and logical reasoning."
  },
  {
    id: "restaurant",
    title: "A Culinary Catastrophe",
    desc: "A hospitality situation. Actor A is an extremely demanding food critic who found a hair in their cold soup. Actor B is an anxious head chef trying to keep their Michelin star. Focus: Polite complaints, diplomacy, and resolving friction."
  },
  {
    id: "medical",
    title: "The Mysterious Flu Diagnostic",
    desc: "A healthcare consultation. Actor A is a patient with bizarre symptoms after visiting a futuristic space park. Actor B is an advanced medical AI doctor. Focus: Describing bodily feelings, symptoms, and providing empathetic recommendations."
  }
];

export default function RoleplayWorkspacePage() {
  const { user, isGuest, userProfile, isAdmin } = useAuth();
  const { toast } = useToast();

  // State: Active User Details
  const [nickname, setNickname] = useState("");
  const [seatNo, setSeatNo] = useState("");
  const [selectedRole, setSelectedRole] = useState("Actor A");
  const [isRegistered, setIsRegistered] = useState(false);

  // State: Room List, Active Room, and Subscribed Messages
  const [rooms, setRooms] = useState<RoleplayRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [roomPasswordInput, setRoomPasswordInput] = useState("");
  const [passwordGateRoomId, setPasswordGateRoomId] = useState<string | null>(null);

  // State: Room Creation
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomPassword, setNewRoomPassword] = useState("");
  const [newRoomScenarioId, setNewRoomScenarioId] = useState("airport");
  const [customScenario, setCustomScenario] = useState("");
  const [newRoomDueDate, setNewRoomDueDate] = useState("");
  const [newRoomTimer, setNewRoomTimer] = useState(15); // Default 15 minutes
  const [newRoomIsPrivate, setNewRoomIsPrivate] = useState(false);
  const [unlockedPrivateRooms, setUnlockedPrivateRooms] = useState<string[]>([]);

  // State: Active Workspace UI
  const [chatInput, setChatInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeAudioMessageId, setActiveAudioMessageId] = useState<string | null>(null);
  const [audioPlaybackProgress, setAudioPlaybackProgress] = useState(0);

  // State: Dialogue Sequencer / Playlist
  const [sequencedMessageIds, setSequencedMessageIds] = useState<string[]>([]);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [currentPlayingSeqIndex, setCurrentPlayingSeqIndex] = useState<number | null>(null);

  // State: Sticky Notes
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteColor, setNewNoteColor] = useState<"yellow" | "blue" | "pink" | "green" | "purple">("yellow");

  // State: Active Room Timer
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Refs for audio and scrolls
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Audio recording engine refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const sequenceAudioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Initial Page Load & Profile Check
  useEffect(() => {
    // Load registered profile from local storage if exists
    const storedUser = localStorage.getItem("lingoland_roleplay_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setNickname(parsed.nickname);
        setSeatNo(parsed.seatNo);
        setSelectedRole(parsed.role || "Actor A");
        setIsRegistered(true);
      } catch (e) {}
    } else if (!isGuest && user) {
      // Auto fill if real student
      setNickname(userProfile?.displayName || user.displayName || user.email?.split("@")[0] || "Student");
    }

    // Load unlocked private rooms list
    const storedUnlocked = localStorage.getItem("lingoland_unlocked_private_rooms");
    if (storedUnlocked) {
      try {
        setUnlockedPrivateRooms(JSON.parse(storedUnlocked));
      } catch (e) {}
    }
  }, [user, isGuest, userProfile]);

  // 2. Real-Time Rooms List Sync Hook (Firestore)
  useEffect(() => {
    const q = query(collection(db, "roleplay_rooms"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomList: RoleplayRoom[] = [];
      const now = new Date();
      let hasExpiredRooms = false;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const dueDate = data.dueDate;
        let expired = false;
        
        if (dueDate) {
          const dateStr = dueDate.includes("T") ? dueDate : `${dueDate}T23:59:59`;
          const expiry = new Date(dateStr);
          if (expiry < now) {
            expired = true;
            hasExpiredRooms = true;
            // Let the creator or admin delete it asynchronously
            if (isAdmin || (user && data.creatorUid === user.uid) || (nickname.trim() !== "" && data.creatorName && data.creatorName.trim().toLowerCase() === nickname.trim().toLowerCase())) {
              deleteDoc(doc(db, "roleplay_rooms", docSnap.id)).catch(err => console.error("Error purging room:", err));
            }
          }
        }

        if (!expired) {
          roomList.push({
            id: docSnap.id,
            name: data.name,
            password: data.password,
            scenario: data.scenario,
            dueDate: data.dueDate,
            timerMinutes: data.timerMinutes,
            timerStartedAt: data.timerStartedAt,
            creatorUid: data.creatorUid || "",
            creatorName: data.creatorName || "Student",
            isPrivate: data.isPrivate || false,
            notes: data.notes || []
          });
        }
      });

      if (hasExpiredRooms) {
        toast({
          title: "Rooms Cleaned up! 🧹",
          description: "Expired collaborative roleplay rooms have been automatically purged.",
          className: "bg-slate-900 border-purple-500/30 text-purple-200"
        });
      }
      setRooms(roomList);
    }, (err) => {
      console.error("Error listing rooms:", err);
    });

    return () => unsubscribe();
  }, [user, isGuest, nickname, isAdmin]);

  // 3. Real-Time Messages Sync Hook (Firestore)
  useEffect(() => {
    if (!activeRoomId) {
      setMessages([]);
      return;
    }
    const q = query(collection(db, "roleplay_rooms", activeRoomId, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(msgs);
    }, (err) => {
      console.error("Error loading messages:", err);
    });
    return () => unsubscribe();
  }, [activeRoomId]);

  // 4. Invite Link Query Parameters Hook
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const inviteId = params.get("roomInvite");

      if (inviteId) {
        // Clear query param so it doesn't stay in the URL bar permanently
        window.history.replaceState({}, document.title, window.location.pathname);

        const checkAndJoin = async () => {
          try {
            // Find in current loaded state first
            const existingRoom = rooms.find(r => r.id === inviteId);
            if (existingRoom) {
              joinOrPromptPassword(existingRoom);
            } else {
              // Fetch directly from Firestore
              const docRef = doc(db, "roleplay_rooms", inviteId);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                const roomData = docSnap.data();
                const fetchedRoom: RoleplayRoom = {
                  id: docSnap.id,
                  name: roomData.name,
                  password: roomData.password,
                  scenario: roomData.scenario,
                  dueDate: roomData.dueDate,
                  timerMinutes: roomData.timerMinutes,
                  timerStartedAt: roomData.timerStartedAt,
                  creatorUid: roomData.creatorUid || "",
                  creatorName: roomData.creatorName || "Student",
                  isPrivate: roomData.isPrivate || false,
                  notes: roomData.notes || []
                };
                joinOrPromptPassword(fetchedRoom);
              } else {
                toast({
                  title: "Shared Room Not Found 🔍❌",
                  description: "This collaborative room does not exist in the database.",
                  variant: "destructive"
                });
              }
            }
          } catch (err) {
            console.error("Error looking up room:", err);
          }
        };

        checkAndJoin();
      }
    }
  }, [rooms.length]);

  const joinOrPromptPassword = (room: RoleplayRoom) => {
    const myNameLower = nickname.trim().toLowerCase();
    const isBlocked = room.blockedUsers?.some(n => n.toLowerCase() === myNameLower);
    if (isBlocked && !isAdmin) {
      toast({
        title: "Access Denied 🚫",
        description: "You are blocked from entering this collaborative room.",
        variant: "destructive"
      });
      return;
    }

    // Add to unlocked list if private
    if (room.isPrivate) {
      const unlocked = JSON.parse(localStorage.getItem("lingoland_unlocked_private_rooms") || "[]");
      if (!unlocked.includes(room.id)) {
        unlocked.push(room.id);
        localStorage.setItem("lingoland_unlocked_private_rooms", JSON.stringify(unlocked));
        setUnlockedPrivateRooms(unlocked);
      }
    }

    if (room.password) {
      setPasswordGateRoomId(room.id);
      setRoomPasswordInput("");
      toast({
        title: "Room is Locked 🔑🛡️",
        description: "This collaborative room is password-restricted. Please enter the password to join.",
        className: "bg-slate-900 border-amber-500/30 text-amber-200"
      });
    } else {
      setActiveRoomId(room.id);
      toast({
        title: "Collaborative Room Joined! 🔗✨",
        description: "You have joined the roleplay session via invitation link.",
        className: "bg-slate-900 border-purple-500/30 text-purple-200"
      });
    }
  };

  // Scroll Chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeRoomId, messages]);

  // Clean up audio elements, recording timers, and microphone streams on unmount
  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current as NodeJS.Timeout);
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current as NodeJS.Timeout);
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (sequenceAudioRef.current) {
        sequenceAudioRef.current.pause();
        sequenceAudioRef.current = null;
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Active Room Object
  const currentRoom = rooms.find(r => r.id === activeRoomId) || null;

  const myNameLower = nickname.trim().toLowerCase();
  const isCurrentUserMuted = currentRoom?.mutedUsers?.some(n => n.toLowerCase() === myNameLower) || false;

  // Compile list of participants dynamically (students only)
  const activeParticipants = Array.from(new Set([
    ...messages.map(m => m.senderName),
    ...(currentRoom?.mutedUsers || []),
    ...(currentRoom?.blockedUsers || [])
  ])).filter(name => {
    if (!name || !name.trim()) return false;
    if (currentRoom && name.trim().toLowerCase() === currentRoom.creatorName.trim().toLowerCase()) return false;
    return true;
  });

  // Host toggle mute
  const handleToggleMute = async (nicknameToMute: string) => {
    if (!currentRoom) return;
    const targetName = nicknameToMute.trim().toLowerCase();
    const mutedList = currentRoom.mutedUsers || [];
    let updatedMuted: string[];
    
    if (mutedList.map(n => n.toLowerCase()).includes(targetName)) {
      updatedMuted = mutedList.filter(n => n.toLowerCase() !== targetName);
      toast({
        title: "Student Unmuted 🔊",
        description: `"${nicknameToMute}" has been unmuted in this room.`,
        className: "bg-slate-900 border-green-500/30 text-green-200"
      });
    } else {
      updatedMuted = [...mutedList, nicknameToMute];
      toast({
        title: "Student Muted 🔇",
        description: `"${nicknameToMute}" has been muted. They cannot send messages.`,
        className: "bg-slate-900 border-rose-500/30 text-rose-200"
      });
    }
    
    try {
      await updateDoc(doc(db, "roleplay_rooms", currentRoom.id), {
        mutedUsers: updatedMuted
      });
    } catch (err) {
      console.error("Error updating muted list:", err);
    }
  };

  // Host toggle block
  const handleToggleBlock = async (nicknameToBlock: string) => {
    if (!currentRoom) return;
    const targetName = nicknameToBlock.trim().toLowerCase();
    const blockedList = currentRoom.blockedUsers || [];
    let updatedBlocked: string[];
    
    if (blockedList.map(n => n.toLowerCase()).includes(targetName)) {
      updatedBlocked = blockedList.filter(n => n.toLowerCase() !== targetName);
      toast({
        title: "Student Unblocked 🔓",
        description: `"${nicknameToBlock}" has been unblocked.`,
        className: "bg-slate-900 border-green-500/30 text-green-200"
      });
    } else {
      updatedBlocked = [...blockedList, nicknameToBlock];
      toast({
        title: "Student Blocked 🚫",
        description: `"${nicknameToBlock}" has been blocked and kicked out of this room.`,
        className: "bg-slate-900 border-rose-500/30 text-rose-200"
      });
    }
    
    try {
      await updateDoc(doc(db, "roleplay_rooms", currentRoom.id), {
        blockedUsers: updatedBlocked
      });
    } catch (err) {
      console.error("Error updating blocked list:", err);
    }
  };

  // Auto kick blocked student in real-time
  useEffect(() => {
    if (currentRoom) {
      const myNameLower = nickname.trim().toLowerCase();
      const isBlocked = currentRoom.blockedUsers?.some(n => n.toLowerCase() === myNameLower);
      if (isBlocked && !isAdmin) {
        setActiveRoomId(null);
        toast({
          title: "Kicked / Blocked from Room 🚫",
          description: "You have been blocked from accessing this collaborative room by the host.",
          variant: "destructive"
        });
      }
    }
  }, [currentRoom?.blockedUsers, nickname]);

  // Filter rooms based on privacy and sharing link list
  const visibleRooms = rooms.filter(room => {
    if (!room.isPrivate) return true;
    const isCreator = 
      (user && room.creatorUid === user.uid) || 
      (nickname.trim() !== "" && room.creatorName.trim().toLowerCase() === nickname.trim().toLowerCase());
    return isCreator || unlockedPrivateRooms.includes(room.id);
  });

  // Check if current user is room creator (to control timer / delete etc.)
  const canControlTimer = currentRoom ? (
    isAdmin || 
    (user && currentRoom.creatorUid === user.uid) ||
    (nickname.trim() !== "" && currentRoom.creatorName.trim().toLowerCase() === nickname.trim().toLowerCase())
  ) : false;

  const isRoomCreator = (room: RoleplayRoom) => {
    return isAdmin || 
      (user && room.creatorUid === user.uid) ||
      (nickname.trim() !== "" && room.creatorName.trim().toLowerCase() === nickname.trim().toLowerCase());
  };

  // Active Room Timer Countdown logic (Firestore Synced)
  useEffect(() => {
    if (!currentRoom || !currentRoom.timerStartedAt) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const startTime = currentRoom.timerStartedAt || Date.now();
      const durationMs = currentRoom.timerMinutes * 60 * 1000;
      const elapsedMs = Date.now() - startTime;
      const remainingMs = durationMs - elapsedMs;

      if (remainingMs <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        toast({
          title: "Brainstorming Completed! ⏱️",
          description: "Pacing timer has ended. Prepare to present your dialogue roles!",
          className: "bg-purple-950 border-purple-500 text-purple-100"
        });
      } else {
        setTimeLeft(Math.floor(remainingMs / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRoomId, currentRoom?.timerStartedAt, currentRoom?.timerMinutes]);

  // 3. User Setup registration handler
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      toast({
        title: "Registration incomplete",
        description: "Please enter a nickname/name to connect.",
        variant: "destructive"
      });
      return;
    }
    setNickname(trimmedNickname);
    const profile = { nickname: trimmedNickname, seatNo: seatNo.trim() || "N/A", role: selectedRole };
    localStorage.setItem("lingoland_roleplay_user", JSON.stringify(profile));
    setIsRegistered(true);
    toast({
      title: "Workspace Connected! 🤝✨",
      description: `Welcome aboard, ${trimmedNickname}! Ready to brainstorm roleplay groups.`,
      className: "bg-slate-900 border-indigo-500/30 text-indigo-200"
    });
  };

  // Logout/Reset Profile state
  const handleResetProfile = () => {
    localStorage.removeItem("lingoland_roleplay_user");
    setIsRegistered(false);
    setNickname("");
    setSeatNo("");
  };

  // 4. Room Creation Handler (Firestore)
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) {
      toast({
        title: "Room Name required",
        description: "Please enter a descriptive room/group title.",
        variant: "destructive"
      });
      return;
    }
    if (!newRoomDueDate) {
      toast({
        title: "Deletion date required",
        description: "Set a clear expiration date for collaborative auto-purging.",
        variant: "destructive"
      });
      return;
    }

    const scenarioText = newRoomScenarioId === "custom" 
      ? customScenario.trim() || "Custom Roleplay Scenario" 
      : scenarioPresets.find(s => s.id === newRoomScenarioId)?.title || "Standard Scenario";

    const roomId = "room-" + Date.now();
    const newRoom: Omit<RoleplayRoom, "messages"> = {
      id: roomId,
      name: newRoomName.trim(),
      scenario: scenarioText,
      dueDate: newRoomDueDate,
      timerMinutes: newRoomTimer,
      creatorUid: user?.uid || "guest-" + nickname.trim(),
      creatorName: nickname.trim() || "Student",
      isPrivate: newRoomIsPrivate,
      notes: []
    };

    if (newRoomPassword.trim()) {
      newRoom.password = newRoomPassword.trim();
    }

    try {
      await setDoc(doc(db, "roleplay_rooms", roomId), newRoom);
      
      // Auto-unlock private room locally so it instantly appears in active list for creator
      if (newRoom.isPrivate) {
        const storedUnlocked = localStorage.getItem("lingoland_unlocked_private_rooms");
        let unlocked: string[] = [];
        if (storedUnlocked) {
          try {
            unlocked = JSON.parse(storedUnlocked);
          } catch (e) {}
        }
        if (!unlocked.includes(roomId)) {
          unlocked.push(roomId);
          localStorage.setItem("lingoland_unlocked_private_rooms", JSON.stringify(unlocked));
          setUnlockedPrivateRooms(unlocked);
        }
      }
      
      // Reset room form state
      setNewRoomName("");
      setNewRoomPassword("");
      setNewRoomDueDate("");
      setNewRoomTimer(15);
      setNewRoomIsPrivate(false);
      setShowCreatePanel(false);
      
      toast({
        title: "Roleplay Room Created! 🎓🛡️",
        description: `"${newRoom.name}" has been registered successfully.`,
        className: "bg-slate-900 border-purple-500/30 text-purple-200"
      });
    } catch (error) {
      console.error("Error creating room:", error);
      toast({
        title: "Error Creating Room",
        description: "Could not sync room to database. Check connection.",
        variant: "destructive"
      });
    }
  };

  // 5. Delete Room Handler (Firestore - Admins & Creator only)
  const handleDeleteRoom = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetRoom = rooms.find(r => r.id === id);
    if (!targetRoom) return;

    if (!isRoomCreator(targetRoom)) {
      toast({
        title: "Access Denied",
        description: "Only the teacher who created this room can delete it.",
        variant: "destructive"
      });
      return;
    }
    
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this collaborative room?");
    if (!confirmDelete) return;

    try {
      // First batch delete messages
      const messagesQuery = query(collection(db, "roleplay_rooms", id, "messages"));
      const messagesSnapshot = await getDocs(messagesQuery);
      const batch = writeBatch(db);
      messagesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Delete the room doc itself
      await deleteDoc(doc(db, "roleplay_rooms", id));

      if (activeRoomId === id) {
        setActiveRoomId(null);
      }
      toast({
        title: "Room Purged",
        description: "Collaborative space has been removed completely.",
        className: "bg-slate-900 border-rose-500/20 text-rose-300"
      });
    } catch (error) {
      console.error("Error deleting room:", error);
      toast({
        title: "Deletion Failed ❌",
        description: "Only authenticated creators or administrators can delete rooms from the database.",
        variant: "destructive"
      });
    }
  };

  // 6. Join Room Handlers
  const handleTryJoinRoom = (room: RoleplayRoom) => {
    const myNameLower = nickname.trim().toLowerCase();
    const isBlocked = room.blockedUsers?.some(n => n.toLowerCase() === myNameLower);
    if (isBlocked && !isAdmin) {
      toast({
        title: "Access Denied 🚫",
        description: "You are blocked from entering this collaborative room.",
        variant: "destructive"
      });
      return;
    }

    if (room.password) {
      setPasswordGateRoomId(room.id);
      setRoomPasswordInput("");
    } else {
      setActiveRoomId(room.id);
    }
  };

  const handlePasswordGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = rooms.find(r => r.id === passwordGateRoomId);
    if (!target) return;

    if (roomPasswordInput.trim() === (target.password || "").trim()) {
      setActiveRoomId(target.id);
      setPasswordGateRoomId(null);
      setRoomPasswordInput("");
      toast({
        title: "Access Granted! 🔓",
        description: `Successfully joined ${target.name}.`,
        className: "bg-slate-900 border-emerald-500/30 text-emerald-300"
      });
    } else {
      toast({
        title: "Access Denied ❌",
        description: "Invalid password for this room. Ask your teacher for help.",
        variant: "destructive"
      });
    }
  };

  // 7. Timer Control (Firestore Dynamic)
  const handleStartTimer = async () => {
    if (!currentRoom) return;
    if (!canControlTimer) {
      toast({
        title: "Host Action Only ⏱️🚫",
        description: "Only the teacher/host can trigger the workspace countdown timer.",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateDoc(doc(db, "roleplay_rooms", currentRoom.id), {
        timerStartedAt: Date.now()
      });
      toast({
        title: "Timer Started! ⏱️",
        description: `Countdown set to ${currentRoom.timerMinutes} minutes.`,
        className: "bg-indigo-950 border-indigo-500 text-indigo-100"
      });
    } catch (error) {
      console.error("Error starting timer:", error);
    }
  };

  const handleResetTimer = async () => {
    if (!currentRoom) return;
    if (!canControlTimer) return;

    try {
      await updateDoc(doc(db, "roleplay_rooms", currentRoom.id), {
        timerStartedAt: null
      });
    } catch (error) {
      console.error("Error resetting timer:", error);
    }
  };

  // 8. Voice Messaging Audio Engine (Firebase Storage sync)
  const startRecording = async () => {
    if (isCurrentUserMuted) {
      toast({
        title: "Microphone Restricted 🔇",
        description: "You have been muted in this room and cannot record voice clips.",
        variant: "destructive"
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();
      
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast({
        title: "Microphone Access Denied 🎙️❌",
        description: "Please check your browser permissions to allow voice recording.",
        variant: "destructive"
      });
    }
  };

  const stopAndSendVoice = () => {
    if (!currentRoom) return;
    clearInterval(recordingTimerRef.current as NodeJS.Timeout);
    setIsRecording(false);

    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.onstop = async () => {
        // Stop all tracks on the stream to turn off the recording light/microphone
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
          audioStreamRef.current = null;
        }

        // Determine MIME type and extension dynamically
        let mimeType = "audio/webm";
        let extension = "webm";
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
          if (MediaRecorder.isTypeSupported("audio/webm")) {
            mimeType = "audio/webm";
            extension = "webm";
          } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
            mimeType = "audio/mp4";
            extension = "mp4";
          } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
            mimeType = "audio/ogg";
            extension = "ogg";
          }
        } else {
          const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
          if (isSafari) {
            mimeType = "audio/mp4";
            extension = "mp4";
          }
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        setIsUploadingVoice(true);
        const uploadToast = toast({
          title: "Uploading voice recording... 🎙️⏳",
          description: "Syncing audio speaking file to secure cloud database.",
          className: "bg-slate-900 border-indigo-500/30 text-indigo-200"
        });

        const messageId = "msg-" + Date.now();

        // Race the uploadBytes with a 6-second timeout to prevent indefinite SDK retries
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Firebase Storage upload timed out")), 6000)
        );

        try {
          const storageRef = ref(storage, `roleplay_audio/${currentRoom.id}/${messageId}.${extension}`);
          
          const uploadSnapshot = await Promise.race([
            uploadBytes(storageRef, audioBlob),
            timeoutPromise
          ]);
          
          const downloadUrl = await getDownloadURL(uploadSnapshot.ref);
          
          const voiceTextOptions = [
            "Let's practice the lost luggage dialogue now. Excuse me, my baggage is missing!",
            "I agree with that. We should ask the VC for a higher valuation because of our proprietary tech.",
            "My soup is completely cold, and there is an actual strand of black hair in it. I need to speak to the manager.",
            "I've been feeling extremely dizzy and seeing floating neon pets since last night, doctor."
          ];
          
          let chosenText = "Hello team, let's coordinate this dialogue!";
          if (currentRoom.scenario.includes("Luggage")) chosenText = voiceTextOptions[0];
          else if (currentRoom.scenario.includes("Negotiation")) chosenText = voiceTextOptions[1];
          else if (currentRoom.scenario.includes("Culinary")) chosenText = voiceTextOptions[2];
          else if (currentRoom.scenario.includes("Flu")) chosenText = voiceTextOptions[3];

          const newVoiceMessage: ChatMessage = {
            id: messageId,
            senderName: nickname,
            senderSeat: seatNo || "N/A",
            senderRole: selectedRole,
            content: chosenText,
            type: "voice",
            timestamp: Date.now(),
            audioDuration: recordingSeconds || 4,
            audioUrl: downloadUrl
          };

          await setDoc(doc(db, "roleplay_rooms", currentRoom.id, "messages", messageId), newVoiceMessage);

          toast({
            title: "Voice Message Sent! 🎙️🚀",
            description: "Your real headset voice note has been added to the chat.",
            className: "bg-slate-900 border-indigo-500/30 text-indigo-200"
          });
        } catch (error) {
          console.error("Error uploading voice file, falling back to dynamic synthesis:", error);
          
          // Fallback: Write directly to Firestore without audioUrl to trigger dynamic Speech Synthesis
          const voiceTextOptions = [
            "Let's practice the lost luggage dialogue now. Excuse me, my baggage is missing!",
            "I agree with that. We should ask the VC for a higher valuation because of our proprietary tech.",
            "My soup is completely cold, and there is an actual strand of black hair in it. I need to speak to the manager.",
            "I've been feeling extremely dizzy and seeing floating neon pets since last night, doctor."
          ];
          
          let chosenText = "Hello team, let's coordinate this dialogue!";
          if (currentRoom.scenario.includes("Luggage")) chosenText = voiceTextOptions[0];
          else if (currentRoom.scenario.includes("Negotiation")) chosenText = voiceTextOptions[1];
          else if (currentRoom.scenario.includes("Culinary")) chosenText = voiceTextOptions[2];
          else if (currentRoom.scenario.includes("Flu")) chosenText = voiceTextOptions[3];

          const newVoiceMessage: ChatMessage = {
            id: messageId,
            senderName: nickname,
            senderSeat: seatNo || "N/A",
            senderRole: selectedRole,
            content: chosenText,
            type: "voice",
            timestamp: Date.now(),
            audioDuration: recordingSeconds || 4
          };

          try {
            await setDoc(doc(db, "roleplay_rooms", currentRoom.id, "messages", messageId), newVoiceMessage);
            toast({
              title: "Voice Message Sent (AI Fallback)! 🎙️⚡",
              description: "Direct sync fallback enabled. Speech synthesized version created.",
              className: "bg-slate-900 border-yellow-500/30 text-yellow-200"
            });
          } catch (dbErr) {
            console.error("Error writing fallback message to firestore:", dbErr);
            toast({
              title: "Upload Failed 🎙️❌",
              description: "Could not upload voice note or sync to room. Please check connection.",
              variant: "destructive"
            });
          }
        } finally {
          setIsUploadingVoice(false);
        }
      };
      mediaRecorder.stop();
    } else {
      // Fallback if MediaRecorder is not supported or was not active
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
      }
      
      const voiceTextOptions = [
        "Let's practice the lost luggage dialogue now. Excuse me, my baggage is missing!",
        "I agree with that. We should ask the VC for a higher valuation because of our proprietary tech.",
        "My soup is completely cold, and there is an actual strand of black hair in it. I need to speak to the manager.",
        "I've been feeling extremely dizzy and seeing floating neon pets since last night, doctor."
      ];
      
      let chosenText = "Hello team, let's coordinate this dialogue!";
      if (currentRoom.scenario.includes("Luggage")) chosenText = voiceTextOptions[0];
      else if (currentRoom.scenario.includes("Negotiation")) chosenText = voiceTextOptions[1];
      else if (currentRoom.scenario.includes("Culinary")) chosenText = voiceTextOptions[2];
      else if (currentRoom.scenario.includes("Flu")) chosenText = voiceTextOptions[3];

      const newVoiceMessage: ChatMessage = {
        id: "msg-" + Date.now(),
        senderName: nickname,
        senderSeat: seatNo || "N/A",
        senderRole: selectedRole,
        content: chosenText,
        type: "voice",
        timestamp: Date.now(),
        audioDuration: recordingSeconds || 4
      };

      setDoc(doc(db, "roleplay_rooms", currentRoom.id, "messages", newVoiceMessage.id), newVoiceMessage)
        .then(() => {
          toast({
            title: "Voice Message Sent! 🎙️🚀",
            description: "Synthesized audio preview created dynamically.",
            className: "bg-slate-900 border-indigo-500/30 text-indigo-200"
          });
        })
        .catch(err => console.error("Error saving voice message:", err));
    }
  };

  const handlePlayAudioMessage = (msg: ChatMessage) => {
    // Stop speech synthesis if playing
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    // Stop real audio element if playing
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    // Clear existing animation interval
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current as NodeJS.Timeout);
      audioIntervalRef.current = null;
    }

    if (msg.audioUrl) {
      try {
        const audio = new Audio(msg.audioUrl);
        currentAudioRef.current = audio;
        
        setActiveAudioMessageId(msg.id);
        setAudioPlaybackProgress(0);

        audio.play().catch(e => {
          console.error("Failed to play real voice recording:", e);
        });

        // Set up animation progress using actual currentTime and duration
        audioIntervalRef.current = setInterval(() => {
          if (audio.paused || audio.ended) {
            clearInterval(audioIntervalRef.current as NodeJS.Timeout);
            audioIntervalRef.current = null;
            setActiveAudioMessageId(null);
            setAudioPlaybackProgress(0);
            if (currentAudioRef.current === audio) {
              currentAudioRef.current = null;
            }
          } else {
            const duration = audio.duration || msg.audioDuration || 4;
            const pct = (audio.currentTime / duration) * 100;
            setAudioPlaybackProgress(Math.min(100, pct));
          }
        }, 100);

        audio.onended = () => {
          if (audioIntervalRef.current) {
            clearInterval(audioIntervalRef.current as NodeJS.Timeout);
            audioIntervalRef.current = null;
          }
          setActiveAudioMessageId(null);
          setAudioPlaybackProgress(0);
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
        };
      } catch (err) {
        console.error("Audio playback error:", err);
      }
    } else {
      // Fallback: Dynamic HTML5 Web Speech synthesis (AI voice simulation)
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(msg.content);
        if (msg.senderRole.includes("Teacher") || msg.senderRole.includes("Facilitator")) {
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
        } else {
          utterance.rate = 1.0;
          utterance.pitch = 0.95;
        }

        setActiveAudioMessageId(msg.id);
        setAudioPlaybackProgress(0);

        const duration = (msg.audioDuration || 4) * 1000;
        const startTime = Date.now();

        audioIntervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const pct = Math.min(100, (elapsed / duration) * 100);
          setAudioPlaybackProgress(pct);
          if (elapsed >= duration) {
            clearInterval(audioIntervalRef.current as NodeJS.Timeout);
            audioIntervalRef.current = null;
            setActiveAudioMessageId(null);
            setAudioPlaybackProgress(0);
          }
        }, 100);

        window.speechSynthesis.speak(utterance);
      } else {
        toast({
          title: "Browser incompatibility",
          description: "Your system doesn't support speaking speech-synthesis.",
          variant: "destructive"
        });
      }
    }
  };

  const handleStopAudioMessage = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current as NodeJS.Timeout);
      audioIntervalRef.current = null;
    }
    setActiveAudioMessageId(null);
    setAudioPlaybackProgress(0);
  };

  // Dialogue Sequencer & Playback Assembler logic
  const handleToggleSeqMessage = (msgId: string) => {
    if (sequencedMessageIds.includes(msgId)) {
      setSequencedMessageIds(prev => prev.filter(id => id !== msgId));
    } else {
      setSequencedMessageIds(prev => [...prev, msgId]);
    }
  };

  const handleMoveSeqItem = (index: number, direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    const newSeq = [...sequencedMessageIds];
    if (direction === "up" && index > 0) {
      [newSeq[index], newSeq[index - 1]] = [newSeq[index - 1], newSeq[index]];
    } else if (direction === "down" && index < newSeq.length - 1) {
      [newSeq[index], newSeq[index + 1]] = [newSeq[index + 1], newSeq[index]];
    }
    setSequencedMessageIds(newSeq);
  };

  const handlePlaySequence = (index: number = 0) => {
    // Stop any active single-audio plays
    handleStopAudioMessage();

    if (index >= sequencedMessageIds.length) {
      setIsSequencePlaying(false);
      setCurrentPlayingSeqIndex(null);
      if (sequenceAudioRef.current) {
        sequenceAudioRef.current.pause();
        sequenceAudioRef.current = null;
      }
      toast({
        title: "Roleplay Sequence Finished! 🎭🎬",
        description: "The sequenced roleplay voice conversation has ended successfully.",
        className: "bg-slate-900 border-emerald-500/30 text-emerald-300"
      });
      return;
    }

    setIsSequencePlaying(true);
    setCurrentPlayingSeqIndex(index);

    const nextMsgId = sequencedMessageIds[index];
    const msg = messages.find(m => m.id === nextMsgId);
    if (!msg) {
      handlePlaySequence(index + 1);
      return;
    }

    if (msg.audioUrl) {
      try {
        const audio = new Audio(msg.audioUrl);
        sequenceAudioRef.current = audio;
        audio.play().catch(e => {
          console.error("Failed to play sequence audio clip:", e);
          handlePlaySequence(index + 1);
        });

        audio.onended = () => {
          audio.onended = null;
          handlePlaySequence(index + 1);
        };
      } catch (err) {
        console.error("Sequence audio setup error:", err);
        handlePlaySequence(index + 1);
      }
    } else {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(msg.content);
        if (msg.senderRole.includes("Teacher") || msg.senderRole.includes("Facilitator")) {
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
        } else {
          utterance.rate = 1.0;
          utterance.pitch = 0.95;
        }

        utterance.onend = () => {
          utterance.onend = null;
          handlePlaySequence(index + 1);
        };
        utterance.onerror = () => {
          utterance.onerror = null;
          handlePlaySequence(index + 1);
        };

        window.speechSynthesis.speak(utterance);
      } else {
        handlePlaySequence(index + 1);
      }
    }
  };

  const handleStopSequence = () => {
    setIsSequencePlaying(false);
    setCurrentPlayingSeqIndex(null);
    if (sequenceAudioRef.current) {
      sequenceAudioRef.current.pause();
      sequenceAudioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  // 9. Standard Text Message handler (Firestore Collection)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentRoom) return;

    if (isCurrentUserMuted) {
      toast({
        title: "Action Denied 🔇",
        description: "You have been muted in this room by the host.",
        variant: "destructive"
      });
      return;
    }

    if (containsBadWord(chatInput)) {
      toast({
        title: "Message Restricted 🚫",
        description: "Your message contains inappropriate language and cannot be sent.",
        variant: "destructive"
      });
      return;
    }

    const newMessage: Omit<ChatMessage, "id"> = {
      senderName: nickname,
      senderSeat: seatNo || "N/A",
      senderRole: selectedRole,
      content: chatInput.trim(),
      type: "text",
      timestamp: Date.now()
    };

    try {
      await addDoc(collection(db, "roleplay_rooms", currentRoom.id, "messages"), newMessage);
      setChatInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Send Failed ❌",
        description: "Could not deliver message to Firestore.",
        variant: "destructive"
      });
    }
  };

  // 10. Whiteboard Brainstorm Sticky notes handler (Firestore Update)
  const handleAddStickyNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !currentRoom) return;

    if (containsBadWord(newNoteContent)) {
      toast({
        title: "Note Restricted 🚫",
        description: "Your brainstorm note contains inappropriate language and cannot be pinned.",
        variant: "destructive"
      });
      return;
    }

    const newNote: StickyNote = {
      id: "note-" + Date.now(),
      content: newNoteContent.trim(),
      color: newNoteColor,
      senderName: nickname,
      senderSeat: seatNo || "N/A",
      x: Math.floor(Math.random() * 50) + 10,
      y: Math.floor(Math.random() * 50) + 10
    };

    try {
      const updatedNotes = [...(currentRoom.notes || []), newNote];
      await updateDoc(doc(db, "roleplay_rooms", currentRoom.id), {
        notes: updatedNotes
      });
      setNewNoteContent("");
      
      toast({
        title: "Note Pinned! 📌",
        description: "Brainstorm card synced to whiteboard.",
        className: "bg-slate-900 border-indigo-500/20 text-indigo-200 animate-in fade-in"
      });
    } catch (error) {
      console.error("Error adding sticky note:", error);
      toast({
        title: "Note Pin Failed",
        description: "Could not upload card. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteStickyNote = async (noteId: string) => {
    if (!currentRoom) return;

    try {
      const updatedNotes = (currentRoom.notes || []).filter(n => n.id !== noteId);
      await updateDoc(doc(db, "roleplay_rooms", currentRoom.id), {
        notes: updatedNotes
      });
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col md:p-6 p-3 select-none relative overflow-y-auto">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-slate-950 pointer-events-none z-0" />

      {/* Header Container */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-850 pb-4 mb-5 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/10 text-white">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-200">
              Roleplay Collaborative Workspace
            </h2>
          </div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Assign groups, chat live, record speak voice clips, and brainstorm in real-time
          </p>
        </div>

        {isRegistered && (
          <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md px-4 py-2 border border-slate-850 rounded-2xl">
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase font-black text-purple-400 tracking-widest">Active Student</span>
              <span className="text-xs font-bold text-slate-200">
                {nickname} <Badge variant="outline" className="text-[9px] border-slate-700 bg-slate-950/80">Seat {seatNo || "N/A"}</Badge>
              </span>
            </div>
            <Button size="icon" variant="ghost" onClick={handleResetProfile} className="h-7 w-7 text-slate-400 hover:text-rose-400 rounded-lg" title="Change Profile Details">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* STAGE A: Registration Setup Panel */}
      {!isRegistered && (
        <div className="relative z-10 flex-1 flex items-center justify-center p-4">
          <Card className="bg-slate-900/60 border-slate-850 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-500 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
              <Users className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-100 uppercase tracking-widest">Enter Collaborative Zone</h3>
              <p className="text-slate-400 text-xs">
                {isGuest 
                  ? "Guest account verified! Set up a custom speaking alias and class seat details below." 
                  : "Syncing secure educational credential. Please set your role and classroom seat."}
              </p>
            </div>
            <form onSubmit={handleRegister} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <Label htmlFor="nickname" className="text-xs font-black uppercase text-purple-400 tracking-wider">Nickname / Name</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Somchai, Anya, Jane"
                  required
                  className="bg-slate-950 border-slate-850 h-11 rounded-xl text-slate-200 placeholder:text-slate-600 focus-visible:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="seat" className="text-xs font-black uppercase text-purple-400 tracking-wider">Seat Number</Label>
                  <Input
                    id="seat"
                    value={seatNo}
                    onChange={(e) => setSeatNo(e.target.value)}
                    placeholder="e.g. A-4, B-12"
                    className="bg-slate-950 border-slate-850 h-11 rounded-xl text-slate-200 placeholder:text-slate-600 focus-visible:ring-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-xs font-black uppercase text-purple-400 tracking-wider">Default Role</Label>
                  <select
                    id="role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-slate-850 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-200 outline-none focus:border-purple-500"
                  >
                    <option value="Actor A">Actor A (Protagonist)</option>
                    <option value="Actor B">Actor B (Antagonist)</option>
                    <option value="Facilitator (Teacher/Host)">Facilitator / Host</option>
                    <option value="Scribe">Scribe / Recorder</option>
                    <option value="Presenter">Presenter</option>
                    <option value="Timekeeper">Timekeeper</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black uppercase tracking-wider text-xs h-11 rounded-xl shadow-lg shadow-purple-600/25">
                Join Lobby Workspace
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* STAGE B: Registered user view */}
      {isRegistered && (
        <div className="relative z-10 flex-1 flex flex-col gap-5">
          {/* LOBBY VIEW: Active rooms and creations */}
          {!activeRoomId && (
            <div className="flex-1 flex flex-col lg:flex-row gap-5 animate-in fade-in duration-500">
              {/* Rooms List Grid */}
              <div className="flex-1 flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase text-slate-300 tracking-widest flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-400" /> Active Dialogue Rooms ({visibleRooms.length})
                  </h3>
                  <Button onClick={() => setShowCreatePanel(!showCreatePanel)} className="bg-purple-600/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 text-xs font-extrabold uppercase rounded-xl h-8">
                    {showCreatePanel ? "Hide Panel" : "Create Room"}
                  </Button>
                </div>

                {visibleRooms.length === 0 ? (
                  <div className="flex-1 border border-dashed border-slate-850 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-2 bg-slate-900/10 min-h-[250px]">
                    <span className="text-4xl animate-bounce">💬</span>
                    <h4 className="text-sm font-bold text-slate-300">No rooms active right now</h4>
                    <p className="text-slate-500 text-[10px] max-w-xs leading-relaxed uppercase">
                      Start by creating a room and choosing a roleplay scenario!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleRooms.map((room) => (
                      <Card 
                        key={room.id}
                        onClick={() => handleTryJoinRoom(room)}
                        className="bg-slate-900/40 border-slate-850 hover:border-purple-500/40 backdrop-blur-xl rounded-2xl p-5 cursor-pointer transition-all hover:translate-y-[-2px] group select-none relative overflow-hidden"
                      >
                        {/* Expiry Indicator */}
                        <div className="absolute top-0 right-0 p-2.5 rounded-bl-xl bg-slate-950 border-l border-b border-slate-850/80 flex items-center gap-1.5 text-[9px] font-bold text-purple-400">
                          <Calendar className="h-3 w-3" /> Expiry: {room.dueDate}
                        </div>

                        <CardHeader className="p-0 space-y-1 text-left">
                          <CardTitle className="text-sm font-bold text-slate-100 group-hover:text-purple-400 transition-colors flex items-center gap-2">
                            {room.password ? <Lock className="h-3.5 w-3.5 text-amber-500" /> : <Unlock className="h-3.5 w-3.5 text-slate-500" />}
                            {room.name}
                          </CardTitle>
                          <Badge className="bg-purple-950/80 text-purple-300 border-purple-800/30 text-[9px] uppercase font-black tracking-widest w-fit">
                            {room.scenario}
                          </Badge>
                        </CardHeader>

                        <CardContent className="p-0 mt-4 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-medium">
                            ⏱️ Dialogue timer: <strong className="text-slate-200">{room.timerMinutes} mins</strong>
                          </span>
                          
                          <div className="flex items-center gap-2">
                            {room.isPrivate && (
                              <Badge variant="outline" className="text-[8px] border-amber-600/30 bg-amber-950/20 text-amber-400 uppercase font-black tracking-widest">
                                Private Link
                              </Badge>
                            )}
                            {(isAdmin || isRoomCreator(room)) && (
                              <Button 
                                size="icon"
                                variant="ghost"
                                onClick={(e) => handleDeleteRoom(room.id, e)}
                                className="h-7 w-7 text-slate-500 hover:text-rose-400"
                                title="Purge Room"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <span className="font-extrabold uppercase text-purple-400 group-hover:translate-x-1 transition-transform">
                              Enter Room →
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* STAGE C: Create Room Sideboard Panel */}
              {showCreatePanel && (
                <Card className="w-full lg:w-96 bg-slate-900/60 border-slate-850 backdrop-blur-xl rounded-3xl p-5 space-y-5 h-fit shrink-0 animate-in slide-in-from-right duration-300 text-left">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-850">
                    <h3 className="text-xs font-black uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
                      <Settings className="h-4 w-4" /> Create dialogue Room
                    </h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowCreatePanel(false)} className="h-7 w-7 text-slate-400 hover:text-slate-200">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <form onSubmit={handleCreateRoom} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="roomName" className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Room Name</Label>
                      <Input
                        id="roomName"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="e.g. Group A - Loss Complaint"
                        className="bg-slate-950 border-slate-850 h-9 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="roomPass" className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Room Password (Optional)</Label>
                      <Input
                        id="roomPass"
                        type="password"
                        value={newRoomPassword}
                        onChange={(e) => setNewRoomPassword(e.target.value)}
                        placeholder="Prevent wrong students from joining"
                        className="bg-slate-950 border-slate-850 h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="roomScenario" className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Scenario Prompt</Label>
                      <select
                        id="roomScenario"
                        value={newRoomScenarioId}
                        onChange={(e) => setNewRoomScenarioId(e.target.value)}
                        className="flex h-9 w-full rounded-lg border border-slate-850 bg-slate-950 px-3 py-1.5 text-xs font-bold text-slate-200 outline-none"
                      >
                        {scenarioPresets.map(s => (
                          <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                        <option value="custom">-- Custom Scenario --</option>
                      </select>
                    </div>

                    {newRoomScenarioId === "custom" && (
                      <div className="space-y-1.5">
                        <Label htmlFor="customPrompt" className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Custom prompt text</Label>
                        <Textarea
                          id="customPrompt"
                          value={customScenario}
                          onChange={(e) => setCustomScenario(e.target.value)}
                          placeholder="Describe the roles and goal of the dialogue..."
                          className="bg-slate-950 border-slate-850 text-xs min-h-[60px]"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="roomTimer" className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Timer (mins)</Label>
                        <Input
                          id="roomTimer"
                          type="number"
                          value={newRoomTimer}
                          onChange={(e) => setNewRoomTimer(Number(e.target.value))}
                          min={5}
                          max={60}
                          className="bg-slate-950 border-slate-850 h-9 text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="roomDue" className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Purge Date</Label>
                        <Input
                          id="roomDue"
                          type="date"
                          value={newRoomDueDate}
                          onChange={(e) => setNewRoomDueDate(e.target.value)}
                          className="bg-slate-950 border-slate-850 h-9 text-xs"
                          required
                        />
                      </div>
                    </div>

                    {/* Private sharing room option */}
                    <div className="flex items-center space-x-2 pt-1 pb-2 select-none">
                      <input
                        id="isPrivateRoom"
                        type="checkbox"
                        checked={newRoomIsPrivate}
                        onChange={(e) => setNewRoomIsPrivate(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-900 focus:ring-offset-2"
                      />
                      <div className="space-y-0.5 text-left">
                        <Label htmlFor="isPrivateRoom" className="text-[10px] font-black uppercase text-purple-400 tracking-wider cursor-pointer">
                          Private Room (Invite Link Only)
                        </Label>
                        <p className="text-[9px] text-slate-500 leading-tight">
                          Only visible in your account and to users who click your invite link.
                        </p>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black uppercase text-xs h-10 rounded-xl shadow-md">
                      Register collaborative room
                    </Button>
                  </form>
                </Card>
              )}
            </div>
          )}

          {activeRoomId && currentRoom && (
            /* ACTIVE WORKSPACE ZONE: Inside a Room */
            <div className="flex-1 flex flex-col gap-4 animate-in zoom-in-95 duration-500">
              {/* Active Workspace Header details */}
              <Card className="bg-slate-900/40 border-slate-850 backdrop-blur-xl rounded-3xl p-5 select-none relative overflow-hidden text-left">
                {/* Expire / Scenario prompt banner */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => setActiveRoomId(null)} className="h-7 px-2.5 bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 text-[10px] uppercase font-black tracking-widest rounded-lg">
                        ← Exit room
                      </Button>
                      <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-1.5 mr-2">
                        {currentRoom?.name || "Untitled Room"}
                      </h3>
                      {currentRoom?.isPrivate && (
                        <Badge className="bg-amber-950 border-amber-850 text-amber-400 text-[8px] uppercase tracking-widest font-black mr-2">
                          Private Link Only
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        onClick={() => {
                          if (typeof window !== 'undefined' && currentRoom) {
                            const baseUrl = window.location.origin + window.location.pathname;
                            const params = new URLSearchParams();
                            params.set("roomInvite", currentRoom.id);
                            params.set("roomName", currentRoom.name || "");
                            params.set("roomScenario", currentRoom.scenario || "");
                            params.set("roomTimer", (currentRoom.timerMinutes || 15).toString());
                            params.set("roomDue", currentRoom.dueDate || "");
                            if (currentRoom.password) {
                              params.set("roomPass", currentRoom.password);
                            }
                            if (currentRoom.isPrivate) {
                              params.set("roomPrivate", "true");
                            }
                            
                            const inviteUrl = baseUrl + "?" + params.toString();
                            try {
                              navigator.clipboard.writeText(inviteUrl).then(() => {
                                toast({
                                  title: "Invite Link Copied! 🔗✨",
                                  description: "Send this link to your roleplay partner to let them join this room.",
                                  className: "bg-slate-900 border-purple-500/30 text-purple-200"
                                });
                              }).catch(() => {
                                toast({
                                  title: "Copy Link Manually",
                                  description: inviteUrl,
                                  className: "bg-slate-900 border-amber-500/30 text-amber-300"
                                });
                              });
                            } catch {
                              toast({
                                title: "Copy Link Manually",
                                description: inviteUrl,
                                className: "bg-slate-900 border-amber-500/30 text-amber-300"
                              });
                            }
                          }
                        }}
                        className="h-7 px-3 bg-purple-650/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 text-[9px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1"
                      >
                        Copy Invite Link 🔗
                      </Button>
                    </div>

                    <div className="p-3 bg-slate-950/70 border border-slate-850 rounded-xl">
                      <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block mb-1">Scenario Active Prompt</span>
                      <p className="text-slate-300 text-xs font-semibold leading-relaxed">
                        {currentRoom?.scenario || ""}
                      </p>
                      {/* Presets Description fallback helper */}
                      {scenarioPresets.map(s => {
                        if (currentRoom?.scenario && s.title === currentRoom.scenario) {
                          return (
                            <p key={s.id} className="text-slate-400 text-[10px] italic leading-normal mt-1 border-t border-slate-850/60 pt-1.5">
                              {s.desc}
                            </p>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>

                  {/* Collaborative countdown timer Widget */}
                  <div className="bg-slate-950/90 border border-slate-850 p-4 rounded-2xl flex flex-col items-center justify-center text-center w-full md:w-44 select-none self-stretch">
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">
                      <Clock className="h-3.5 w-3.5 text-purple-400" /> pacing Timer
                    </div>
                    {timeLeft === null ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-lg font-black text-slate-500 font-mono">
                          {currentRoom?.timerMinutes || 15}:00
                        </span>
                        {canControlTimer ? (
                          <Button size="sm" onClick={handleStartTimer} className="h-6 px-3 bg-purple-650/10 border border-purple-500/30 text-purple-400 text-[9px] font-black uppercase tracking-wider rounded-lg">
                            Start Timer
                          </Button>
                        ) : (
                          <span className="text-[10px] text-slate-500 uppercase font-bold animate-pulse">Waiting for host</span>
                        )}
                      </div>
                    ) : timeLeft === 0 ? (
                      <div className="text-center">
                        <span className="text-xs font-black text-rose-500 uppercase tracking-widest block animate-pulse">Time Expired</span>
                        {canControlTimer && (
                          <Button size="sm" onClick={handleResetTimer} className="h-5 px-2 bg-slate-900 border border-slate-850 text-slate-400 text-[8px] font-black uppercase tracking-wider rounded-lg mt-1">
                            <RotateCcw className="h-2 w-2 mr-1" /> Reset
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-purple-400 font-mono tracking-wider animate-pulse">
                          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                        </span>
                        {canControlTimer && (
                          <Button size="sm" onClick={handleResetTimer} className="h-5 px-2 bg-slate-900 border border-slate-850 text-slate-400 text-[8px] font-black uppercase tracking-wider rounded-lg mt-1">
                            <RotateCcw className="h-2 w-2 mr-1" /> Reset
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Two-Column split workspace dashboard */}
              <div className="flex-1 flex flex-col xl:flex-row gap-4 items-stretch">
                
                {/* LEFT COLUMN: Chat & Voice dialogue feed */}
                <Card className="flex-1 bg-slate-900/30 border-slate-850/80 backdrop-blur-xl rounded-3xl flex flex-col min-h-[500px]">
                  <CardHeader className="p-4 border-b border-slate-850 flex flex-row items-center justify-between select-none">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase text-purple-400 tracking-wider">
                      <MessageSquare className="h-4 w-4" /> Dialogue Speaking Feed
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 uppercase font-black">My Speaking Alias Role:</span>
                      <select
                        value={selectedRole}
                        onChange={(e) => {
                          setSelectedRole(e.target.value);
                          // Sync profile with local storage
                          const currentProfile = JSON.parse(localStorage.getItem("lingoland_roleplay_user") || "{}");
                          currentProfile.role = e.target.value;
                          localStorage.setItem("lingoland_roleplay_user", JSON.stringify(currentProfile));
                          toast({
                            title: `Role updated to ${e.target.value}`,
                            className: "bg-slate-900 border-indigo-500/20 text-indigo-300"
                          });
                        }}
                        className="h-6 border border-slate-800 bg-slate-950 text-[10px] font-bold text-slate-200 outline-none rounded-md px-1.5 focus:border-purple-500"
                      >
                        <option value="Actor A">Actor A</option>
                        <option value="Actor B">Actor B</option>
                        <option value="Facilitator (Teacher/Host)">Facilitator</option>
                        <option value="Scribe">Scribe</option>
                        <option value="Presenter">Presenter</option>
                        <option value="Timekeeper">Timekeeper</option>
                      </select>
                    </div>
                  </CardHeader>

                  {/* Messages Feed body */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-1.5">
                        <MessageSquare className="h-8 w-8 text-slate-700" />
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">The Dialogue is empty</h4>
                        <p className="text-[10px] max-w-xs leading-normal">
                          Write a message or press the microphone to share audio speaking notes with fellow students!
                        </p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className="flex flex-col text-left space-y-1">
                          <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wide">
                            <span className="text-purple-400">{msg.senderName}</span>
                            <Badge variant="outline" className="text-[8px] px-1 border-slate-880 bg-slate-950 text-slate-500">Seat {msg.senderSeat}</Badge>
                            <span className="text-slate-600 font-medium">({msg.senderRole})</span>
                          </div>

                          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-850/60 max-w-xl text-slate-200 text-xs relative overflow-hidden animate-in fade-in duration-300">
                            {msg.type === "text" ? (
                              <p className="leading-relaxed">{msg.content}</p>
                            ) : (
                              /* Interactive speaking audio note */
                              <div className="flex items-center gap-3">
                                {activeAudioMessageId === msg.id ? (
                                  <Button size="icon" onClick={handleStopAudioMessage} className="h-8 w-8 bg-rose-650 hover:bg-rose-600 rounded-full shrink-0 text-white animate-pulse">
                                    <Pause className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button size="icon" onClick={() => handlePlayAudioMessage(msg)} className="h-8 w-8 bg-indigo-600 hover:bg-indigo-500 rounded-full shrink-0 text-white">
                                    <Play className="h-4 w-4 ml-0.5" />
                                  </Button>
                                )}

                                <div className="flex-1 space-y-1">
                                  <div className="flex justify-between items-center text-[9px] uppercase font-bold text-slate-400">
                                    <span className="flex items-center gap-1 text-purple-400">
                                      <Volume2 className="h-3 w-3" /> Voice Note Speaking
                                    </span>
                                    <span>{msg.audioDuration} seconds</span>
                                  </div>
                                  
                                  {/* Custom playback slider track */}
                                  <div className="w-full h-1 bg-slate-850 rounded-full overflow-hidden relative">
                                    <div 
                                      className="absolute top-0 left-0 bottom-0 bg-indigo-500 transition-all duration-100 ease-linear"
                                      style={{ width: `${activeAudioMessageId === msg.id ? audioPlaybackProgress : 0}%` }}
                                    />
                                  </div>
                                  
                                  <p className="text-[10px] text-slate-400 italic font-medium pt-0.5 leading-tight">
                                    Speaking Text: "{msg.content}"
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat message and audio recording forms */}
                  <div className="p-4 border-t border-slate-850 bg-slate-900/20 rounded-b-3xl">
                    {isRecording ? (
                      /* Live Audio Recording waveform panel */
                      <div className="flex items-center justify-between p-3 bg-red-950/20 border border-red-500/20 rounded-2xl animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 bg-red-600 rounded-full animate-ping" />
                          <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                            Recording Speaking Clip... {recordingSeconds}s
                          </span>
                        </div>
                        {/* Mock frequency visualizer bars */}
                        <div className="flex gap-0.5 h-6 items-center">
                          <span className="w-0.5 h-3 bg-red-500 rounded-full" />
                          <span className="w-0.5 h-5 bg-red-500 rounded-full animate-bounce" />
                          <span className="w-0.5 h-2 bg-red-500 rounded-full" />
                          <span className="w-0.5 h-6 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-0.5 h-4 bg-red-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                          <span className="w-0.5 h-3 bg-red-500 rounded-full" />
                        </div>
                        <Button onClick={stopAndSendVoice} className="bg-red-650 hover:bg-red-600 text-white font-extrabold text-[10px] uppercase h-8 px-4 rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-1.5">
                          <Square className="h-3.5 w-3.5" /> Stop & Send Note
                        </Button>
                      </div>
                    ) : isUploadingVoice ? (
                      <div className="flex items-center justify-center p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl">
                        <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
                        <span className="text-xs font-black uppercase text-indigo-400 tracking-wider">
                          Uploading Voice Speaking Note...
                        </span>
                      </div>
                    ) : (
                      /* Text and microphone input feed Form */
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Button 
                          type="button" 
                          onClick={startRecording} 
                          disabled={isCurrentUserMuted}
                          className="bg-slate-950 border border-slate-850 hover:bg-indigo-950 text-indigo-400 rounded-xl h-11 w-11 shrink-0 flex items-center justify-center disabled:opacity-30" 
                          title={isCurrentUserMuted ? "You are muted" : "Record Voice speaking clip"}
                        >
                          <Mic className="h-5 w-5 animate-pulse" />
                        </Button>
                        <Input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          disabled={isCurrentUserMuted}
                          placeholder={isCurrentUserMuted ? "You are muted in this room by the host 🔇" : "Type something to coordinate dialogs..."}
                          className="flex-1 bg-slate-950 border-slate-850 h-11 rounded-xl text-xs placeholder:text-slate-600 focus-visible:ring-purple-500 disabled:bg-slate-950/40 disabled:placeholder:text-rose-550/60"
                        />
                        <Button 
                          type="submit" 
                          disabled={isCurrentUserMuted}
                          className="bg-purple-650 hover:bg-purple-600 text-white rounded-xl h-11 px-4 shrink-0 flex items-center justify-center disabled:bg-slate-800 disabled:text-slate-500"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    )}

                    {/* Premium Dialogue Sequencer & Playback Assembler */}
                    <div className="mt-4 pt-3 border-t border-slate-850 text-left">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-black uppercase text-purple-400 tracking-wider flex items-center gap-1">
                          <ListCollapse className="h-3.5 w-3.5" /> 🎭 Dialogue Sequencer & Playback Assembler
                        </h4>
                        
                        {sequencedMessageIds.length > 0 && (
                          <div className="flex gap-2">
                            {isSequencePlaying ? (
                              <Button 
                                size="sm" 
                                onClick={handleStopSequence} 
                                className="h-6 px-2.5 bg-rose-650 hover:bg-rose-600 border border-rose-500/20 text-white text-[9px] font-bold uppercase rounded-lg flex items-center gap-1"
                              >
                                <Square className="h-2.5 w-2.5" /> Stop Sequence
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={() => handlePlaySequence(0)} 
                                className="h-6 px-3 bg-purple-600 hover:bg-purple-500 border border-purple-500/20 text-white text-[9px] font-black uppercase rounded-lg flex items-center gap-1.5 shadow-md shadow-purple-600/10"
                              >
                                <Play className="h-2.5 w-2.5" /> Play Sequenced Scene ({sequencedMessageIds.length})
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setSequencedMessageIds([])} 
                              className="h-6 px-2 text-slate-500 hover:text-slate-300 text-[9px] font-bold uppercase"
                            >
                              Clear
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* List of voice clips inside active room */}
                      {messages.filter(m => m.type === "voice").length === 0 ? (
                        <p className="text-[9px] text-slate-650 italic select-none">
                          No voice clips recorded in this room yet. Send a voice note above to start sequencing!
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {/* Playlist selector cards */}
                          <div className="flex flex-wrap gap-2 py-1 max-h-[85px] overflow-y-auto pr-1">
                            {messages.filter(m => m.type === "voice").map((msg) => {
                              const isSelected = sequencedMessageIds.includes(msg.id);
                              return (
                                <button
                                  key={msg.id}
                                  type="button"
                                  onClick={() => handleToggleSeqMessage(msg.id)}
                                  className={`px-2.5 py-1.5 rounded-xl border text-left transition-all flex items-center gap-2 max-w-[170px] ${
                                    isSelected
                                      ? "bg-purple-950/20 border-purple-500/40 text-purple-200"
                                      : "bg-slate-950/60 border-slate-900 hover:border-slate-800 text-slate-400"
                                  }`}
                                >
                                  <input 
                                    type="checkbox" 
                                    checked={isSelected}
                                    readOnly
                                    className="h-3 w-3 rounded text-purple-650 focus:ring-0 focus:ring-offset-0 cursor-pointer bg-slate-950"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[9px] font-bold truncate leading-tight">{msg.senderName}</p>
                                    <p className="text-[8px] opacity-60 truncate">Seat {msg.senderSeat} • {msg.audioDuration || 4}s</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Sortable sequenced list */}
                          {sequencedMessageIds.length > 0 && (
                            <div className="mt-2.5 bg-slate-950/60 border border-slate-850 rounded-2xl p-2 select-none">
                              <span className="text-[8px] font-black uppercase text-purple-400 tracking-wider block mb-1">
                                Dialogue Sequence Order (Reorder Clips):
                              </span>
                              <div className="flex flex-wrap gap-1.5 max-h-[90px] overflow-y-auto pr-1">
                                {sequencedMessageIds.map((id, index) => {
                                  const msg = messages.find(m => m.id === id);
                                  if (!msg) return null;
                                  const isCurrentlyPlaying = isSequencePlaying && currentPlayingSeqIndex === index;
                                  return (
                                    <div 
                                      key={`${id}-${index}`} 
                                      className={`px-2 py-1 rounded-lg border text-[9px] font-bold flex items-center gap-1.5 transition-all ${
                                        isCurrentlyPlaying
                                          ? "bg-purple-600/20 border-purple-500 text-purple-100 shadow-[0_0_8px_rgba(147,51,234,0.2)] animate-pulse"
                                          : "bg-slate-900 border-slate-800/80 text-slate-300"
                                      }`}
                                    >
                                      <span className="opacity-50 text-[8px]">{index + 1}.</span>
                                      <span className="truncate max-w-[80px]">{msg.senderName} ({msg.senderSeat})</span>
                                      <div className="flex items-center gap-0.5 border-l border-slate-800 pl-1.5 ml-1">
                                        <button
                                          type="button"
                                          disabled={index === 0}
                                          onClick={(e) => handleMoveSeqItem(index, "up", e)}
                                          className="hover:text-purple-400 disabled:opacity-30 disabled:hover:text-inherit"
                                        >
                                          <ArrowUp className="h-3 w-3" />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={index === sequencedMessageIds.length - 1}
                                          onClick={(e) => handleMoveSeqItem(index, "down", e)}
                                          className="hover:text-purple-400 disabled:opacity-30 disabled:hover:text-inherit"
                                        >
                                          <ArrowDown className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* RIGHT COLUMN: Brainstorm sticky notes board */}
                <Card className="w-full xl:w-96 bg-slate-900/30 border-slate-850/80 backdrop-blur-xl rounded-3xl flex flex-col min-h-[500px]">
                  <CardHeader className="p-4 border-b border-slate-850 text-left select-none">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase text-purple-400 tracking-wider">
                        <Award className="h-4 w-4" /> Brainstorm whiteboard Board
                      </div>
                      <Badge variant="outline" className="text-[9px] border-slate-800 bg-slate-950 text-slate-400">
                        {(currentRoom?.notes || []).length} Notes pinned
                      </Badge>
                    </div>
                  </CardHeader>

                  <div className="flex-1 p-4 flex flex-col space-y-4">
                    {/* Write new note panel */}
                    <form onSubmit={handleAddStickyNote} className="space-y-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-850 text-left select-none">
                      <span className="text-[9px] font-black uppercase text-slate-550 tracking-widest block mb-1">Pin New Idea Card</span>
                      <Textarea
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder="Write a dialogue line, vocabulary item, or roleplay brainstorm idea..."
                        className="bg-slate-950 border-slate-850 text-xs min-h-[60px] rounded-xl placeholder:text-slate-700"
                        required
                      />

                      <div className="flex justify-between items-center">
                        {/* Note colors selector */}
                        <div className="flex gap-1.5">
                          {(["yellow", "blue", "pink", "green", "purple"] as const).map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setNewNoteColor(color)}
                              className={`h-5 w-5 rounded-full border transition-all ${
                                color === "yellow" ? "bg-amber-400/80 border-amber-300" :
                                color === "blue" ? "bg-sky-400/80 border-sky-300" :
                                color === "pink" ? "bg-rose-400/80 border-rose-300" :
                                color === "green" ? "bg-emerald-400/80 border-emerald-300" :
                                "bg-purple-400/80 border-purple-300"
                              } ${newNoteColor === color ? "scale-125 border-white shadow-[0_0_10px_rgba(255,255,255,0.4)]" : "opacity-60"}`}
                            />
                          ))}
                        </div>

                        <Button type="submit" className="bg-purple-650 hover:bg-purple-600 text-white font-extrabold text-[9px] uppercase h-7 rounded-lg">
                          Pin Note
                        </Button>
                      </div>
                    </form>

                    {/* Scrollable container of sticky notes */}
                    <div className="flex-1 overflow-y-auto max-h-[160px] space-y-3 pr-1">
                      {(currentRoom?.notes || []).length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-655 space-y-1">
                          <FileText className="h-7 w-7 text-slate-850" />
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Board is Empty</h4>
                          <p className="text-[9px] max-w-xs leading-normal">
                            Sticky notes will display here dynamically in real-time.
                          </p>
                        </div>
                      ) : (
                        (currentRoom?.notes || []).map((note) => (
                          <div 
                            key={note.id}
                            className={`p-3 rounded-xl border relative shadow-md text-slate-900 text-left select-none animate-in fade-in zoom-in duration-300 ${
                              note.color === "yellow" ? "bg-amber-300 border-amber-400" :
                              note.color === "blue" ? "bg-sky-300 border-sky-400" :
                              note.color === "pink" ? "bg-rose-300 border-rose-400" :
                              note.color === "green" ? "bg-emerald-300 border-emerald-400" :
                              "bg-purple-300 border-purple-400"
                            }`}
                          >
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleDeleteStickyNote(note.id)}
                              className="absolute top-1.5 right-1.5 h-5 w-5 p-0 hover:bg-black/10 text-slate-800/60 hover:text-slate-950"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            
                            <p className="text-xs font-semibold leading-relaxed pr-4 break-words">
                              {note.content}
                            </p>

                            <div className="mt-2.5 pt-1.5 border-t border-black/10 flex items-center justify-between text-[8px] font-black uppercase text-slate-800/60">
                              <span>By: {note.senderName}</span>
                              <span>Seat: {note.senderSeat}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Collaborative participants & Host Moderation board */}
                    <div className="border-t border-slate-850/60 pt-4 flex flex-col space-y-3 text-left">
                      <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider flex items-center gap-1.5 select-none">
                        <Users className="h-3.5 w-3.5 text-purple-400" /> Workspace Participants ({activeParticipants.length})
                      </span>
                      
                      {activeParticipants.length === 0 ? (
                        <p className="text-[9px] text-slate-500 italic select-none">
                          No active students in this room yet. When they send messages, they will appear here.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                          {activeParticipants.map(participant => {
                            const isMuted = currentRoom?.mutedUsers?.some(n => n.toLowerCase() === participant.toLowerCase());
                            const isBlocked = currentRoom?.blockedUsers?.some(n => n.toLowerCase() === participant.toLowerCase());
                            const isHost = isRoomCreator(currentRoom);

                            return (
                              <div key={participant} className="flex items-center justify-between p-2 bg-slate-950/60 border border-slate-850/80 rounded-xl animate-in fade-in duration-300">
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 flex-wrap">
                                    {participant}
                                    {isMuted && <Badge className="bg-rose-955 border-rose-800/30 text-rose-400 text-[8px] scale-90 px-1 py-0 font-bold uppercase tracking-wider">Muted</Badge>}
                                    {isBlocked && <Badge className="bg-red-955 border-red-800/30 text-red-400 text-[8px] scale-90 px-1 py-0 font-bold uppercase tracking-wider">Blocked</Badge>}
                                  </span>
                                  <span className="text-[8px] text-slate-550 uppercase tracking-widest font-black">Roleplay Student</span>
                                </div>

                                {isHost && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleToggleMute(participant)}
                                      className={`h-7 px-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                                        isMuted 
                                          ? "text-green-400 hover:text-green-300 bg-green-955/20 border border-green-800/20" 
                                          : "text-rose-400 hover:text-rose-300 bg-rose-955/20 border border-rose-800/20"
                                      }`}
                                    >
                                      {isMuted ? "Unmute" : "Mute"}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleToggleBlock(participant)}
                                      className={`h-7 px-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                                        isBlocked 
                                          ? "text-green-400 hover:text-green-300 bg-green-955/20 border border-green-800/20" 
                                          : "text-red-400 hover:text-red-300 bg-red-955/20 border border-red-800/20"
                                      }`}
                                    >
                                      {isBlocked ? "Unblock" : "Block"}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Manual Block panel for host */}
                      {isRoomCreator(currentRoom) && (
                        <div className="bg-slate-950/30 p-2.5 rounded-xl border border-slate-850/60 mt-1 flex flex-col space-y-1.5">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest select-none">Pre-emptively Block Student</span>
                          <div className="flex gap-2">
                            <Input
                              id="manualBlockInput"
                              placeholder="Type student name..."
                              className="bg-slate-950 border-slate-850 h-8 text-[11px] rounded-lg"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const val = (e.target as HTMLInputElement).value.trim();
                                  if (val) {
                                    handleToggleBlock(val);
                                    (e.target as HTMLInputElement).value = "";
                                  }
                                }
                              }}
                            />
                            <Button 
                              onClick={() => {
                                const input = document.getElementById("manualBlockInput") as HTMLInputElement;
                                if (input && input.value.trim()) {
                                  handleToggleBlock(input.value.trim());
                                  input.value = "";
                                }
                              }}
                              className="bg-red-650 hover:bg-red-600 text-white text-[9px] font-black uppercase h-8 px-3 rounded-lg"
                            >
                              Block
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeRoomId && !currentRoom && (
            /* Graceful Room Loading/Fallback View */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 border border-dashed border-slate-850 rounded-3xl bg-slate-900/10 min-h-[300px]">
              <span className="text-4xl animate-pulse">⏳</span>
              <h4 className="text-sm font-bold text-slate-300">Loading Roleplay Room...</h4>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider max-w-xs leading-relaxed">
                Please wait while the shared room credentials and details are established.
              </p>
              <Button 
                onClick={() => setActiveRoomId(null)}
                variant="outline" 
                size="sm" 
                className="mt-3 bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 text-[10px] uppercase font-black tracking-widest rounded-lg h-8 px-4"
              >
                ← Back to Lobby
              </Button>
            </div>
          )}
        </div>
      )}

      {/* PASSWORD GATE UNLOCK DIALOG MODAL */}
      {passwordGateRoomId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="bg-slate-900 border-slate-850 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full text-center space-y-5 select-none animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Lock className="h-7 w-7" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-100 uppercase tracking-widest">Locked room</h3>
              <p className="text-slate-400 text-xs">
                This collaborative roleplay room is password-restricted by the teacher. Enter password to gain access.
              </p>
            </div>

            <form onSubmit={handlePasswordGateSubmit} className="space-y-4">
              <Input
                type="password"
                value={roomPasswordInput}
                onChange={(e) => setRoomPasswordInput(e.target.value)}
                placeholder="Enter password..."
                className="bg-slate-950 border-slate-850 h-10 rounded-xl text-center text-slate-200 placeholder:text-slate-700 font-bold focus-visible:ring-purple-500 text-xs"
                required
                autoFocus
              />
              
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setPasswordGateRoomId(null)} className="flex-1 bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400 font-extrabold uppercase text-xs h-10 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-600 hover:to-indigo-600 text-white font-black uppercase text-xs h-10 rounded-xl">
                  Unlock
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
