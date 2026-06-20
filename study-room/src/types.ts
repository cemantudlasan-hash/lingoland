export type LC_Category = 'grammar' | 'vocabulary' | 'listening' | 'pronunciation' | 'conversation';
export type TargetLang = 'thai' | 'korean' | 'japanese' | 'french' | 'spanish' | 'chinese' | 'vietnamese';
export type LC_Level = 'beginner' | 'intermediate' | 'advanced';

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface ExampleSentence {
  english: string;
  structureExplanation: string;
}

export interface WordItem {
  word: string;
  partOfSpeech: string;
  definition: string;
  englishExample: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
}

export interface PracticeWord {
  word: string;
  ipa: string;
  guide: string;
}

export interface PracticeSentence {
  text: string;
  emphasis: string;
}

export interface LessonContent {
  // Grammar Category
  explanation?: string;
  keyRules?: string[];
  examples?: ExampleSentence[];
  
  // Vocabulary Category
  introduction?: string;
  words?: WordItem[];
  
  // Listening Category
  context?: string;
  speakerNames?: string[];
  transcript?: DialogueLine[];
  
  // Pronunciation Category
  phoneme?: string;
  howToProduce?: string;
  practiceWords?: PracticeWord[];
  practiceSentences?: PracticeSentence[];

  // Common Quiz
  quiz: QuizItem[];
}

export interface Lesson {
  id: string;
  category: LC_Category;
  level: LC_Level;
  title: string;
  description: string;
  xpReward: number;
  estimatedMinutes: number;
  targetLang?: TargetLang;
  content: LessonContent;
}

export interface LessonTranslation {
  title: string;
  description: string;
  explanation?: string;
  introduction?: string;
  context?: string;
  howToProduce?: string;
  keyRules?: string[];
  words?: string[]; // Corresponding translated definitions or translations of vocabulary words
  transcript?: string[]; // Corresponding translated dialogue lines
  quiz?: Array<{
    question: string;
    options: string[];
    explanation: string;
  }>;
  practiceSentences?: string[]; // Corresponding translated pronunciation practice sentences
}

export interface UserStats {
  completedLessons: string[]; // List of completed lesson ids
  streakCount: number;
  lastActiveDate: string; // YYYY-MM-DD
  points: number;
  timeSpentMinutes: number;
  history: Array<{
    lessonId: string;
    completedAt: string;
    score: number;
    xpEarned: number;
  }>;
  passedExams?: string[];
  examAttempts?: Record<string, { score: number; passed: boolean; date: string }>;
}

export interface TargetLanguage {
  code: string;
  name: string;
  flag: string;
  greetingCode: string;
}
