
import type { LucideIcon } from "lucide-react";

export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type LanguageFocus = "grammar" | "vocabulary" | "pronunciation" | "reading" | "biology" | "geometry" | "conversation";
export type Subject = "english" | "science" | "math";

export interface Game {
  title: string;
  slug: string;
  description: string;
  level: SkillLevel;
  focus: LanguageFocus;
  subject: Subject;
  icon: LucideIcon;
}

export type Quote = {
    id: string;
    text: string;
    author: string;
    category: "love" | "friendship" | "goal" | "family" | "other";
    userId: string;
    createdAt: any; // Firestore Timestamp
};

export type UserProfile = {
    uid: string;
    email: string;
    displayName: string;
    schoolName?: string;
    learningGoals: string;
    avatarSeed?: string;
    avatarFrame?: string;
    age?: string;
    hobbies?: string;
    coverPhotoHint?: string;
    coverPhotoUrl?: string;
    dailyPost?: string;
};

export interface UserPet {
  userId: string;
  petType: 'owl' | 'dino' | 'kitty';
  petName: string;
  level: number;
  xp: number;
  energy: number;       // 0 to 100
  intelligence: number; // 0 to 100
  mood: number;         // 0 to 100
  coins: number;
  unlockedCosmetics: string[];
  equippedCosmetics: {
    hat?: string;
    glasses?: string;
    clothes?: string;
  };
  currentBackground: string;
  lastActive: string; // ISO string
}

export type DailyPostComment = {
    id: string;
    authorId: string;
    authorName: string;
    text: string;
    createdAt: any; // Firestore Timestamp
    replyToId?: string;
    replyToAuthor?: string;
    replyToText?: string;
};

export type Suggestion = {
    id: string;
    text?: string;
    stickerUrl?: string;
    authorId: string;
    authorName: string;
    createdAt: any; // Firestore Timestamp
    isPinned?: boolean;
    replyToId?: string;
    replyToAuthor?: string;
    replyToText?: string;
    mentions?: string[];
};

export type Job = {
    id: string;
    title: string;
    company: string;
    location: string;
    type: "Full-time" | "Part-time" | "Contract";
    isRemote: boolean;
    description: string;
    requirements: string[];
    contactEmail?: string;
    userId?: string;
    createdAt?: any;
};

export type Application = {
    id: string;
    applicantName: string;
    applicantEmail: string;
    applicantContactNumber?: string;
    applicantId: string;
    appliedAt: any;
    whyHire: string;
    skillsExperience: string;
    education: string;
    trainings?: string;
    certificates: {
        tefl: boolean;
        tesol: boolean;
        toiec: boolean;
    }
};

export type Notification = {
    id: string;
    userId: string;
    type: 'mention' | 'reply' | 'new_job' | 'new_quote';
    text: string;
    link: string;
    isRead: boolean;
    createdAt: any; // Firestore Timestamp
    fromUserName: string;
    fromUserAvatarSeed?: string;
};

export type AnalyticsEvent = {
  id: string;
  userId: string;
  type: 'game_played' | 'article_read' | 'exercise_generated';
  details: {
    slug?: string;
    title?: string;
    topic?: string;
    difficulty?: string;
  };
  createdAt: any; // Firestore Timestamp
};
