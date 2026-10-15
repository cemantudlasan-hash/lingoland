
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

export type StarterLine = 'floby' | 'pip' | 'igni';
export type EvolutionBranch = 'A' | 'B';

export type LingoPetType = 
  | 'owl' | 'dino' | 'kitty' | 'phoenix' | 'morphling' | 'godly'
  | 'floby' | 'tome-tortoise' | 'lore-drake' | 'seed-rooter' | 'terra-keeper'
  | 'pip' | 'echo-grif' | 'acu-maestro' | 'chirp-wing' | 'sonic-storm'
  | 'igni' | 'spark-fox' | 'rune-stalker' | 'ember-scribe' | 'pyro-phoenix';

export interface PetLearningStats {
  vocabScore?: number;
  masteredWords?: number;
  speedTriviaPlayed?: number;
  listeningStreak?: number;
  speechAccuracy?: number;
  sentenceWritingCount?: number;
  grammarQuestsCompleted?: number;
  arcadeRuns?: number;
}

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
    activePetType?: LingoPetType;
    activePetLevel?: number;
    activePetAura?: string;
    activePetCosmetics?: {
        hat?: string;
        glasses?: string;
        necklace?: string;
        shoes?: string;
        wings?: string;
        clothes?: string;
    };
};

export interface PetMission {
  id: string;
  title: string;
  description: string;
  category: 'quiz' | 'game' | 'vocab' | 'care' | 'conversation';
  progress: number;
  maxProgress: number;
  rewardCoins: number;
  rewardXp: number;
  completed: boolean;
  claimed: boolean;
  actionUrl?: string;
  iconName?: string;
}

export interface UserPet {
  userId: string;
  isActivated?: boolean;
  petType: LingoPetType;
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
    necklace?: string;
    shoes?: string;
    wings?: string;
    clothes?: string;
    costume?: string;
    aura?: string;
  };
  currentBackground: string;
  lastActive: string; // ISO string
  lastLoginDate?: string; // YYYY-MM-DD
  loginStreakCount?: number; // 1-7
  personality?: 'cheerleader' | 'scholar' | 'zen' | 'trickster' | 'cyberpunk';
  starterLine?: StarterLine;
  evolutionTier?: 1 | 2 | 3;
  evolutionBranch?: EvolutionBranch;
  evolutionTrackName?: string;
  activeBonusTitle?: string;
  activeBonusDesc?: string;
  equippedAura?: string;
  freeSkipTokens?: number;
  learningStats?: PetLearningStats;
  missions?: PetMission[];
  lastMissionDate?: string;
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
    reactions?: Record<string, string[]>;
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
