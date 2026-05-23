"use client";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Flame, ShieldAlert, Coins, Trophy, Maximize2, Minimize2, 
  RotateCcw, Sparkles, AlertTriangle, ArrowLeft, CheckCircle2, XCircle, Compass
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";

// Types
type Difficulty = "beginner" | "intermediate" | "advanced";
type GameState = "idle" | "instructions" | "difficulty_select" | "playing" | "casting" | "finished" | "failed";

interface SpellQuestion {
  id: number;
  question: string;
  category: "Spelling" | "Punctuation" | "Syntax" | "Vocabulary";
  difficulty: Difficulty;
  options: string[];
  answer: string;
  explanation: string;
}

// 120 premium unique questions (40 Beginner, 40 Intermediate, 40 Advanced)
const SPELL_QUESTION_DATABASE: SpellQuestion[] = [
  // --- BEGINNER (1-40) ---
  {
    id: 1,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "beginner",
    options: ["Beautiful", "Beautifull", "Beatiful", "Bautiful"],
    answer: "Beautiful",
    explanation: "'Beautiful' has one 'l' at the end and uses the 'eau' vowel cluster."
  },
  {
    id: 2,
    question: "Which sentence has the correct punctuation?",
    category: "Punctuation",
    difficulty: "beginner",
    options: [
      "Where are we going today.",
      "Where are we going today?",
      "Where are we going today,",
      "where are we going today"
    ],
    answer: "Where are we going today?",
    explanation: "Questions must end with a question mark."
  },
  {
    id: 3,
    question: "Identify the correct past tense: 'Yesterday, I ___ a blue bird.'",
    category: "Syntax",
    difficulty: "beginner",
    options: ["see", "saw", "seen", "seed"],
    answer: "saw",
    explanation: "'Saw' is the irregular past tense of 'see'."
  },
  {
    id: 4,
    question: "Select the correct plural form of 'Tomato':",
    category: "Spelling",
    difficulty: "beginner",
    options: ["Tomatos", "Tomatoes", "Tomatoe", "Tomatose"],
    answer: "Tomatoes",
    explanation: "Nouns ending in 'o' preceded by a consonant usually add '-oes' to form the plural."
  },
  {
    id: 5,
    question: "Choose the synonym of 'Tiny':",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Huge", "Small", "Bright", "Loud"],
    answer: "Small",
    explanation: "'Tiny' and 'small' both describe something of very little size."
  },
  {
    id: 6,
    question: "Complete the sentence: 'The cat is sleeping ___ the warm bed.'",
    category: "Syntax",
    difficulty: "beginner",
    options: ["on", "at", "in", "with"],
    answer: "on",
    explanation: "We sleep 'on' top of a bed surface."
  },
  {
    id: 7,
    question: "Select the correct spelling of the eighth month:",
    category: "Spelling",
    difficulty: "beginner",
    options: ["August", "Agust", "Augast", "Aurgust"],
    answer: "August",
    explanation: "August is spelled with an 'u' in the first syllable."
  },
  {
    id: 8,
    question: "Which word requires a capital letter?",
    category: "Punctuation",
    difficulty: "beginner",
    options: ["london", "apple", "happy", "running"],
    answer: "london",
    explanation: "Proper nouns like city names ('London') must be capitalized."
  },
  {
    id: 9,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "beginner",
    options: ["Friend", "Freind", "Frind", "Frend"],
    answer: "Friend",
    explanation: "The rule is 'i before e except after c', making 'Friend' correct."
  },
  {
    id: 10,
    question: "What is the opposite of 'Heavy'?",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Light", "Soft", "Dark", "Small"],
    answer: "Light",
    explanation: "The opposite of heavy is light."
  },
  {
    id: 11,
    question: "Complete: 'She ___ her teeth twice a day.'",
    category: "Syntax",
    difficulty: "beginner",
    options: ["brush", "brushes", "brushing", "brushed"],
    answer: "brushes",
    explanation: "Third-person singular 'She' takes present verb 'brushes'."
  },
  {
    id: 12,
    question: "Which of the following is an adjective?",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Run", "Quickly", "Beautiful", "Happiness"],
    answer: "Beautiful",
    explanation: "'Beautiful' describes a noun, making it an adjective."
  },
  {
    id: 13,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "beginner",
    options: ["Until", "Untill", "Untile", "Untl"],
    answer: "Until",
    explanation: "'Until' is spelled with a single 'l' at the end."
  },
  {
    id: 14,
    question: "Identify the correct contractions: '___ going to the cinema tonight.'",
    category: "Syntax",
    difficulty: "beginner",
    options: ["They're", "Their", "There", "Them"],
    answer: "They're",
    explanation: "'They're' is the contraction of 'They are'."
  },
  {
    id: 15,
    question: "Select the opposite of 'Before':",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["After", "During", "Under", "Next"],
    answer: "After",
    explanation: "The opposite of before is after."
  },
  {
    id: 16,
    question: "Complete: 'He walked ___ the school door.'",
    category: "Syntax",
    difficulty: "beginner",
    options: ["through", "threw", "though", "tough"],
    answer: "through",
    explanation: "'Through' indicates moving in one side and out the other."
  },
  {
    id: 17,
    question: "Which word contains a spelling error?",
    category: "Spelling",
    difficulty: "beginner",
    options: ["Apple", "Banana", "Strawbery", "Orange"],
    answer: "Strawbery",
    explanation: "Strawberry is spelled with a double 'r': 'Strawberry'."
  },
  {
    id: 18,
    question: "Which sentence has correct punctuation?",
    category: "Punctuation",
    difficulty: "beginner",
    options: [
      "I like apples pears and bananas",
      "I like apples, pears, and bananas.",
      "I like apples pears, and bananas.",
      "I like apples, pears and bananas"
    ],
    answer: "I like apples, pears, and bananas.",
    explanation: "Commas separate items in a list, and a period ends the sentence."
  },
  {
    id: 19,
    question: "Choose the correct pronoun: 'This is my brother. ___ lives in New York.'",
    category: "Syntax",
    difficulty: "beginner",
    options: ["He", "She", "They", "It"],
    answer: "He",
    explanation: "'Brother' is male, so we use 'He'."
  },
  {
    id: 20,
    question: "What is a synonym of 'Happy'?",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Glad", "Sad", "Angry", "Tired"],
    answer: "Glad",
    explanation: "'Glad' means happy or pleased."
  },
  {
    id: 21,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "beginner",
    options: ["Sincerly", "Sincerely", "Sincerelly", "Sinserely"],
    answer: "Sincerely",
    explanation: "Sincerely is spelled with '-ely' appended to the base word 'sincere'."
  },
  {
    id: 22,
    question: "Which of the following is a verb?",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Dog", "Jump", "Yellow", "Quickly"],
    answer: "Jump",
    explanation: "'Jump' is an action word, making it a verb."
  },
  {
    id: 23,
    question: "Complete the sentence: 'I have ___ pen and ___ eraser.'",
    category: "Syntax",
    difficulty: "beginner",
    options: ["a, an", "an, a", "a, a", "an, an"],
    answer: "a, an",
    explanation: "Use 'a' before consonant sounds ('pen') and 'an' before vowel sounds ('eraser')."
  },
  {
    id: 24,
    question: "Select the correct spelling:",
    category: "Spelling",
    difficulty: "beginner",
    options: ["Color", "Coller", "Culer", "Colur"],
    answer: "Color",
    explanation: "'Color' (American) or 'Colour' (British) is correct. 'Color' is listed here."
  },
  {
    id: 25,
    question: "What is the past tense of 'Drink'?",
    category: "Syntax",
    difficulty: "beginner",
    options: ["Drinked", "Drank", "Drunk", "Drinks"],
    answer: "Drank",
    explanation: "'Drank' is the irregular past tense form of 'drink'."
  },
  {
    id: 26,
    question: "Which word is the opposite of 'Up'?",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Down", "Left", "High", "Under"],
    answer: "Down",
    explanation: "The opposite of up is down."
  },
  {
    id: 27,
    question: "Which word contains a spelling error?",
    category: "Spelling",
    difficulty: "beginner",
    options: ["Doctor", "Teacher", "Enginere", "Nurse"],
    answer: "Enginere",
    explanation: "Engineer is spelled 'Engineer'."
  },
  {
    id: 28,
    question: "Where should the apostrophe be: 'This is my dogs collar.' (One dog)",
    category: "Punctuation",
    difficulty: "beginner",
    options: ["dog's", "dogs'", "do'gs", "dogs"],
    answer: "dog's",
    explanation: "Singular possessive is formed by adding apostrophe+s ('dog's')."
  },
  {
    id: 29,
    question: "Complete: 'We ___ playing football in the garden.'",
    category: "Syntax",
    difficulty: "beginner",
    options: ["is", "am", "are", "was"],
    answer: "are",
    explanation: "Present plural 'We' takes the helping verb 'are'."
  },
  {
    id: 30,
    question: "Select the synonym of 'Quick':",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Slow", "Fast", "Heavy", "Quiet"],
    answer: "Fast",
    explanation: "'Fast' is a synonym for 'quick'."
  },
  {
    id: 31,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "beginner",
    options: ["Family", "Famly", "Familly", "Fammily"],
    answer: "Family",
    explanation: "The correct spelling is 'Family'."
  },
  {
    id: 32,
    question: "Which word is a preposition?",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Under", "Cat", "Run", "Green"],
    answer: "Under",
    explanation: "'Under' is a preposition showing location."
  },
  {
    id: 33,
    question: "Complete: 'My book is ___ than your book.'",
    category: "Syntax",
    difficulty: "beginner",
    options: ["good", "better", "best", "more good"],
    answer: "better",
    explanation: "The comparative form of 'good' is 'better'."
  },
  {
    id: 34,
    question: "Identify the correct spelling:",
    category: "Spelling",
    difficulty: "beginner",
    options: ["School", "Schoole", "Shool", "Skool"],
    answer: "School",
    explanation: "The correct spelling is 'School'."
  },
  {
    id: 35,
    question: "Choose the correct punctuation: 'Wow ___ That was amazing!'",
    category: "Punctuation",
    difficulty: "beginner",
    options: ["?", ",", "!", "."],
    answer: "!",
    explanation: "Exclamations like 'Wow' end with an exclamation mark."
  },
  {
    id: 36,
    question: "Complete the sentence: 'She ___ have a car.'",
    category: "Syntax",
    difficulty: "beginner",
    options: ["don't", "doesn't", "not", "isn't"],
    answer: "doesn't",
    explanation: "Third-person singular 'She' takes present negative 'doesn't' (does not)."
  },
  {
    id: 37,
    question: "What is the opposite of 'Soft'?",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Hard", "Weak", "Smooth", "Light"],
    answer: "Hard",
    explanation: "The opposite of soft is hard."
  },
  {
    id: 38,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "beginner",
    options: ["Happy", "Happi", "Hapy", "Hapie"],
    answer: "Happy",
    explanation: "The correct spelling is 'Happy'."
  },
  {
    id: 39,
    question: "Select the sentence with correct punctuation:",
    category: "Punctuation",
    difficulty: "beginner",
    options: [
      "I live in Paris France.",
      "I live in Paris, France.",
      "I live in Paris France?",
      "I live in Paris, France"
    ],
    answer: "I live in Paris, France.",
    explanation: "Commas separate cities and countries, and sentences end with a period."
  },
  {
    id: 40,
    question: "Complete: 'The sun ___ in the east.'",
    category: "Syntax",
    difficulty: "beginner",
    options: ["rise", "rises", "rising", "rosed"],
    answer: "rises",
    explanation: "Present simple facts take singular third-person 'rises'."
  },

  // --- INTERMEDIATE (41-80) ---
  {
    id: 41,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "intermediate",
    options: ["Necessary", "Necesary", "Neccesary", "Necessarry"],
    answer: "Necessary",
    explanation: "Necessary is spelled with one 'c' and double 's'."
  },
  {
    id: 42,
    question: "Which of the following sentences uses a semicolon correctly?",
    category: "Punctuation",
    difficulty: "intermediate",
    options: [
      "I want to go home; but I have to work.",
      "I love hot chocolate; it is my favorite drink.",
      "Because I was tired; I fell asleep.",
      "She likes apples; oranges and bananas."
    ],
    answer: "I love hot chocolate; it is my favorite drink.",
    explanation: "Semicolons connect two independent clauses without a coordinating conjunction."
  },
  {
    id: 43,
    question: "Complete: 'Hardly ___ entered the room when the lights went out.'",
    category: "Syntax",
    difficulty: "intermediate",
    options: ["he had", "had he", "did he", "he did"],
    answer: "had he",
    explanation: "Negative adverbial 'Hardly' at the beginning triggers subject-verb inversion."
  },
  {
    id: 44,
    question: "Select the synonym of 'Pensive':",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Thoughtful", "Lively", "Angry", "Indecisive"],
    answer: "Thoughtful",
    explanation: "'Pensive' means engaged in serious thought; thoughtful."
  },
  {
    id: 45,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "intermediate",
    options: ["Exaggerate", "Exagerate", "Exaggerret", "Exagerret"],
    answer: "Exaggerate",
    explanation: "Exaggerate is spelled with double 'g'."
  },
  {
    id: 46,
    question: "Complete the conditional: 'If I ___ the answer, I would tell you.'",
    category: "Syntax",
    difficulty: "intermediate",
    options: ["know", "knew", "known", "had known"],
    answer: "knew",
    explanation: "Second conditional (hypothetical present) uses simple past 'knew' in the if-clause."
  },
  {
    id: 47,
    question: "Identify the word containing a spelling error:",
    category: "Spelling",
    difficulty: "intermediate",
    options: ["Calendar", "Separate", "Acommodate", "Liaison"],
    answer: "Acommodate",
    explanation: "Accommodate is spelled with double 'c' and double 'm': 'Accommodate'."
  },
  {
    id: 48,
    question: "Where should the hyphen go?",
    category: "Punctuation",
    difficulty: "intermediate",
    options: ["sugar-free candy", "sugar free-candy", "sugarfree-candy", "sugar free candy"],
    answer: "sugar-free candy",
    explanation: "Compound adjectives modifying a noun require a hyphen."
  },
  {
    id: 49,
    question: "Select the correct plural form of 'Criterion':",
    category: "Syntax",
    difficulty: "intermediate",
    options: ["Criterions", "Criteria", "Criterias", "Criteriones"],
    answer: "Criteria",
    explanation: "'Criteria' is the plural form of the Greek-derived singular 'criterion'."
  },
  {
    id: 50,
    question: "What is the meaning of 'Candid'?",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Secretive", "Frank and honest", "Sweet", "Polite"],
    answer: "Frank and honest",
    explanation: "'Candid' means truthful and straightforward; frank."
  },
  {
    id: 51,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "intermediate",
    options: ["Occurrence", "Occurence", "Occurrance", "Ocurrence"],
    answer: "Occurrence",
    explanation: "'Occurrence' is spelled with double 'c', double 'r', and ends with '-ence'."
  },
  {
    id: 52,
    question: "Which relative pronoun is correct: 'The doctor ___ treated me was excellent.'",
    category: "Syntax",
    difficulty: "intermediate",
    options: ["who", "whom", "which", "whose"],
    answer: "who",
    explanation: "Relative pronoun 'who' is the subject of the verb 'treated'."
  },
  {
    id: 53,
    question: "Select the opposite of 'Rigid':",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Flexible", "Stiff", "Hard", "Firm"],
    answer: "Flexible",
    explanation: "The opposite of rigid (stiff) is flexible."
  },
  {
    id: 54,
    question: "Identify the correct punctuation for the possessive: 'The teachers books' (Multiple teachers)",
    category: "Punctuation",
    difficulty: "intermediate",
    options: ["teachers' books", "teacher's books", "teachers books'", "teacherses books"],
    answer: "teachers' books",
    explanation: "Plural possessive ending in 's' adds only an apostrophe at the end ('teachers'')."
  },
  {
    id: 55,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "intermediate",
    options: ["Liaison", "Liason", "Liaisonne", "Liasone"],
    answer: "Liaison",
    explanation: "Liaison has a second 'i' after 'a': 'Liaison'."
  },
  {
    id: 56,
    question: "Complete: 'She has been living here ___ five years.'",
    category: "Syntax",
    difficulty: "intermediate",
    options: ["since", "for", "during", "ago"],
    answer: "for",
    explanation: "Use 'for' to describe a duration of time."
  },
  {
    id: 57,
    question: "Select the synonym of 'Diligence':",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Laziness", "Conscientiousness", "Cleverness", "Speed"],
    answer: "Conscientiousness",
    explanation: "'Diligence' is careful and persistent work or effort; conscientiousness."
  },
  {
    id: 58,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "intermediate",
    options: ["Foreign", "Foriegn", "Forein", "Foring"],
    answer: "Foreign",
    explanation: "Foreign is spelled with 'ei' which breaks the basic 'i before e' rule."
  },
  {
    id: 59,
    question: "Which word requires an apostrophe?",
    category: "Punctuation",
    difficulty: "intermediate",
    options: ["its (possessive)", "it's (contraction)", "hers", "ours"],
    answer: "it's (contraction)",
    explanation: "'It's' represents the contraction 'it is' and requires an apostrophe."
  },
  {
    id: 60,
    question: "Complete the sentence: 'Neither the teacher nor the students ___ present.'",
    category: "Syntax",
    difficulty: "intermediate",
    options: ["was", "were", "is", "has been"],
    answer: "were",
    explanation: "For 'neither... nor', the verb agrees with the closer subject ('students', plural, so 'were')."
  },
  {
    id: 61,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "intermediate",
    options: ["Acquire", "Aquire", "Acquir", "Aqquire"],
    answer: "Acquire",
    explanation: "Acquire is spelled with a 'c' before the 'q'."
  },
  {
    id: 62,
    question: "Identify the antonym of 'Vague':",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Clear", "Hazy", "Uncertain", "Dim"],
    answer: "Clear",
    explanation: "Vague means unclear; 'clear' is the antonym."
  },
  {
    id: 63,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "intermediate",
    options: ["Independent", "Independant", "Independint", "Independentt"],
    answer: "Independent",
    explanation: "Independent is spelled with all 'e's in its suffixes."
  },
  {
    id: 64,
    question: "Which punctuation mark is used to introduce a quote?",
    category: "Punctuation",
    difficulty: "intermediate",
    options: ["Colon", "Hyphen", "Semicolon", "Comma"],
    answer: "Comma",
    explanation: "We typically use a comma to introduce a direct quote."
  },
  {
    id: 65,
    question: "Complete the sentence: 'By the time you arrive, we ___ finished.'",
    category: "Syntax",
    difficulty: "intermediate",
    options: ["will have", "would have", "had", "have"],
    answer: "will have",
    explanation: "Future perfect tense ('will have finished') describes a future completed action."
  },
  {
    id: 66,
    question: "Select the synonym of 'Apathy':",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Empathy", "Indifference", "Sympathy", "Anger"],
    answer: "Indifference",
    explanation: "'Apathy' means lack of interest, enthusiasm, or concern; indifference."
  },
  {
    id: 67,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "intermediate",
    options: ["Maintenance", "Maintainance", "Maintanence", "Maintenence"],
    answer: "Maintenance",
    explanation: "'Maintenance' changes the spelling of the base verb 'maintain'."
  },
  {
    id: 68,
    question: "Which of the following is correct punctuation for speech?",
    category: "Punctuation",
    difficulty: "intermediate",
    options: [
      "He said, \"I'm ready.\"",
      "He said \"I'm ready.\"",
      "He said, I'm ready.",
      "He said, \"I'm ready\""
    ],
    answer: "He said, \"I'm ready.\"",
    explanation: "Punctuation marks must go inside the double quotation marks."
  },
  {
    id: 69,
    question: "Complete the sentence: 'She acts as though she ___ the boss.'",
    category: "Syntax",
    difficulty: "intermediate",
    options: ["is", "was", "were", "be"],
    answer: "were",
    explanation: "Hypothetical clauses with 'as though' take subjunctive 'were'."
  },
  {
    id: 70,
    question: "Select the synonym of 'Benevolent':",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Cruel", "Kind", "Selfish", "Lazy"],
    answer: "Kind",
    explanation: "'Benevolent' means well-meaning and kindly; kind."
  },
  {
    id: 71,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "intermediate",
    options: ["Privilege", "Privelege", "Privilage", "Privelage"],
    answer: "Privilege",
    explanation: "Privilege is spelled with 'i' in both middle syllables: 'Privilege'."
  },
  {
    id: 72,
    question: "Which word requires an apostrophe?",
    category: "Punctuation",
    difficulty: "intermediate",
    options: ["dont", "wont", "cant", "All of the above"],
    answer: "All of the above",
    explanation: "Contractions 'don't', 'won't', and 'cant' (as 'can't') all require apostrophes."
  },
  {
    id: 73,
    question: "Complete the statement: 'The jury ___ reached a unanimous decision.'",
    category: "Syntax",
    difficulty: "intermediate",
    options: ["has", "have", "are", "were"],
    answer: "has",
    explanation: "As a collective noun acting as a single unit, 'jury' takes singular 'has'."
  },
  {
    id: 74,
    question: "What is a synonym of 'Capricious'?",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Unpredictable", "Steadfast", "Angry", "Calm"],
    answer: "Unpredictable",
    explanation: "'Capricious' means given to sudden changes of mood; unpredictable."
  },
  {
    id: 75,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "intermediate",
    options: ["Restaurant", "Restarant", "Restaraunt", "Resturant"],
    answer: "Restaurant",
    explanation: "'Restaurant' ends in '-aurant' and not '-urant'."
  },
  {
    id: 76,
    question: "Complete the sentence: 'I look forward to ___ you soon.'",
    category: "Syntax",
    difficulty: "intermediate",
    options: ["meet", "meeting", "met", "meets"],
    answer: "meeting",
    explanation: "'Look forward to' is a phrasal verb that takes a gerund ('meeting')."
  },
  {
    id: 77,
    question: "What is the antonym of 'Frugal'?",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Thrifty", "Extravagant", "Generous", "Polite"],
    answer: "Extravagant",
    explanation: "'Frugal' means sparing or thrifty; 'extravagant' is its opposite."
  },
  {
    id: 78,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "intermediate",
    options: ["Separate", "Seperate", "Seperat", "Separat"],
    answer: "Separate",
    explanation: "Separate is spelled with 'a' in the second syllable: 'Separate'."
  },
  {
    id: 79,
    question: "Which of the following is correct punctuation?",
    category: "Punctuation",
    difficulty: "intermediate",
    options: [
      "Help! I'm falling.",
      "Help I'm falling?",
      "Help! I'm falling!",
      "Help, I'm falling"
    ],
    answer: "Help! I'm falling.",
    explanation: "Exclamation follows 'Help!' and a period ends the second statement."
  },
  {
    id: 80,
    question: "Complete: 'She walked ___ the platform to board the train.'",
    category: "Syntax",
    difficulty: "intermediate",
    options: ["onto", "on", "into", "in"],
    answer: "onto",
    explanation: "'Onto' shows movement toward and onto the top surface of the platform."
  },

  // --- ADVANCED (81-120) ---
  {
    id: 81,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "advanced",
    options: ["Conscientious", "Consciencious", "Consientious", "Conscientous"],
    answer: "Conscientious",
    explanation: "'Conscientious' is spelled with 'sc' in the first syllable, and ends in '-tious'."
  },
  {
    id: 82,
    question: "Which of the following sentences has a misplaced modifier?",
    category: "Syntax",
    difficulty: "advanced",
    options: [
      "Walking down the street, I saw a beautiful rainbow.",
      "Covered in hot sauce, John ate the wings.",
      "Covered in hot sauce, the wings were eaten by John.",
      "John ate the wings, which were covered in hot sauce."
    ],
    answer: "Covered in hot sauce, John ate the wings.",
    explanation: "This misplaced modifier suggests that John, not the wings, was covered in hot sauce."
  },
  {
    id: 83,
    question: "Select the synonym of 'Ephemeral':",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Fleeting", "Eternal", "Heavy", "Fragile"],
    answer: "Fleeting",
    explanation: "'Ephemeral' means lasting for a very short time; fleeting."
  },
  {
    id: 84,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "advanced",
    options: ["Supersede", "Supercede", "Superseed", "Supersied"],
    answer: "Supersede",
    explanation: "Supersede is spelled with 's' and not 'c' in the second syllable."
  },
  {
    id: 85,
    question: "Where should the colon go?",
    category: "Punctuation",
    difficulty: "advanced",
    options: [
      "He bought: apples, oranges, and bananas.",
      "He bought three items: apples, oranges, and bananas.",
      "He: bought three items apples, oranges, and bananas.",
      "He bought three items apples: oranges, and bananas."
    ],
    answer: "He bought three items: apples, oranges, and bananas.",
    explanation: "Colons introduce lists only after complete independent clauses."
  },
  {
    id: 86,
    question: "Complete the sentence: 'Lest he ___ fail the exam, he studied day and night.'",
    category: "Syntax",
    difficulty: "advanced",
    options: ["should", "would", "might", "will"],
    answer: "should",
    explanation: "Classic syntax structures 'lest' with the auxiliary 'should' or simple subjunctive."
  },
  {
    id: 87,
    question: "Identify the spelling error:",
    category: "Spelling",
    difficulty: "advanced",
    options: ["Aesthetic", "Dilettante", "Grievous", "Mischevious"],
    answer: "Mischevious",
    explanation: "Mischievous is spelled 'Mischievous' and has only three syllables."
  },
  {
    id: 88,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "advanced",
    options: ["Gyrfalcon", "Gerfalcon", "Gierfalcon", "All of the above"],
    answer: "All of the above",
    explanation: "All three spellings are recognized variants for the large arctic falcon."
  },
  {
    id: 89,
    question: "Complete the subjunctive: 'It is vital that she ___ here on time.'",
    category: "Syntax",
    difficulty: "advanced",
    options: ["be", "is", "was", "will be"],
    answer: "be",
    explanation: "Substantive adjective clauses like 'vital that' require base subjunctive ('be')."
  },
  {
    id: 90,
    question: "What is the meaning of 'Loquacious'?",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Quiet", "Talkative", "Brilliant", "Generous"],
    answer: "Talkative",
    explanation: "'Loquacious' means tending to talk a great deal; talkative."
  },
  {
    id: 91,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "advanced",
    options: ["Bellwether", "Bellweather", "Belwether", "Belweather"],
    answer: "Bellwether",
    explanation: "'Bellwether' is named after a leading wether sheep wearing a bell; it does not refer to 'weather'."
  },
  {
    id: 92,
    question: "Which of the following uses punctuation correctly for a parenthetical element?",
    category: "Punctuation",
    difficulty: "advanced",
    options: [
      "My friend, whom I met in college is arriving tomorrow.",
      "My friend (whom I met in college) is arriving tomorrow.",
      "My friend whom I met in college is arriving tomorrow.",
      "My friend whom, I met in college is arriving tomorrow."
    ],
    answer: "My friend (whom I met in college) is arriving tomorrow.",
    explanation: "Parentheses correctly surround parenthetical details that can be omitted."
  },
  {
    id: 93,
    question: "Complete: 'No sooner ___ started when the storm broke.'",
    category: "Syntax",
    difficulty: "advanced",
    options: ["had the game", "did the game", "the game had", "the game did"],
    answer: "had the game",
    explanation: "Inverted past perfect auxiliary is required after 'no sooner' structures."
  },
  {
    id: 94,
    question: "Identify the antonym of 'Plausible':",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Believable", "Implausible", "Vague", "Vibrant"],
    answer: "Implausible",
    explanation: "'Implausible' is the antonym of believable or plausible."
  },
  {
    id: 95,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "advanced",
    options: ["Playwright", "Playwrite", "Playright", "Playwritter"],
    answer: "Playwright",
    explanation: "'Playwright' uses 'wright' (maker, builder) rather than 'write'."
  },
  {
    id: 96,
    question: "Which sentence contains a comma splice?",
    category: "Punctuation",
    difficulty: "advanced",
    options: [
      "I love chocolate, but I hate candy.",
      "I love chocolate, I hate candy.",
      "I love chocolate; I hate candy.",
      "I love chocolate, although I hate candy."
    ],
    answer: "I love chocolate, I hate candy.",
    explanation: "Joining two independent clauses with only a comma creates a comma splice."
  },
  {
    id: 97,
    question: "Complete the structure: 'Scarcely had she finished ___ the phone rang.'",
    category: "Syntax",
    difficulty: "advanced",
    options: ["than", "when", "then", "before"],
    answer: "when",
    explanation: "'Scarcely' pairs with the correlative conjunction 'when'."
  },
  {
    id: 98,
    question: "What is a synonym of 'Taciturn'?",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Talkative", "Quiet", "Arrogant", "Lively"],
    answer: "Quiet",
    explanation: "'Taciturn' means reserved or uncommunicative in speech; saying little."
  },
  {
    id: 99,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "advanced",
    options: ["Idiosyncrasy", "Idiosyncracy", "Idiosyncracy", "Idiosyncrissy"],
    answer: "Idiosyncrasy",
    explanation: "Idiosyncrasy is spelled with '-sy' at the end, not '-cy'."
  },
  {
    id: 100,
    question: "Which sentence has a dangling modifier?",
    category: "Syntax",
    difficulty: "advanced",
    options: [
      "Having finished the report, John went home.",
      "Having finished the report, the computer was turned off.",
      "John turned off the computer after finishing the report.",
      "Turning off the computer, John went home."
    ],
    answer: "Having finished the report, the computer was turned off.",
    explanation: "The modifier 'Having finished the report' danglingly describes 'the computer' as the one completing the report."
  },
  {
    id: 101,
    question: "Select the synonym of 'Superfluous':",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Necessary", "Excessive", "Insufficient", "Fragile"],
    answer: "Excessive",
    explanation: "'Superfluous' means unnecessary, especially through being more than enough (excessive)."
  },
  {
    id: 102,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "advanced",
    options: ["Pharaoh", "Pharoah", "Phaoroh", "Pharoah"],
    answer: "Pharaoh",
    explanation: "'Pharaoh' ends with '-aoh' in the final syllable."
  },
  {
    id: 103,
    question: "Where should the parenthesis go in this citation?",
    category: "Punctuation",
    difficulty: "advanced",
    options: [
      "John (Smith 2012) argued that...",
      "John Smith (2012) argued that...",
      "John Smith argued (that 2012)...",
      "John Smith argued that... (2012)"
    ],
    answer: "John Smith (2012) argued that...",
    explanation: "Parentheses correctly enclose publication dates immediately after authors."
  },
  {
    id: 104,
    question: "Complete the sentence: 'I would rather you ___ go out tonight.'",
    category: "Syntax",
    difficulty: "advanced",
    options: ["don't", "didn't", "not", "should not"],
    answer: "didn't",
    explanation: "'Would rather' followed by a subject takes simple past subjunctive ('didn't') for present reference."
  },
  {
    id: 105,
    question: "Identify the spelling error:",
    category: "Spelling",
    difficulty: "advanced",
    options: ["Miniscular", "Minuscule", "Mischievous", "Mutilate"],
    answer: "Miniscular",
    explanation: "Minuscule is correct; 'Miniscular' is an incorrect misspelling."
  },
  {
    id: 106,
    question: "Which of the following is correct punctuation for a parenthetic dash?",
    category: "Punctuation",
    difficulty: "advanced",
    options: [
      "The car—a blue sedan, was stolen.",
      "The car—a blue sedan—was stolen.",
      "The car, a blue sedan—was stolen.",
      "The car—a blue sedan was stolen."
    ],
    answer: "The car—a blue sedan—was stolen.",
    explanation: "Em-dashes must appear in pairs to bracket parenthetical information."
  },
  {
    id: 107,
    question: "Complete the inverted conditional: '___ been warned, we would have stayed.'",
    category: "Syntax",
    difficulty: "advanced",
    options: ["Had we", "Should we", "If we had", "Were we"],
    answer: "Had we",
    explanation: "Inverted third conditional structure uses auxiliary 'Had we'."
  },
  {
    id: 108,
    question: "Select the synonym of 'Alacrity':",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Brisk readiness", "Reluctance", "Sadness", "Boredom"],
    answer: "Brisk readiness",
    explanation: "'Alacrity' means brisk and cheerful readiness."
  },
  {
    id: 109,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "advanced",
    options: ["Indispensable", "Indispensible", "Indispenseable", "Indispenceable"],
    answer: "Indispensable",
    explanation: "Indispensable ends in '-able'."
  },
  {
    id: 110,
    question: "Which punctuation is used to join compound numbers between 21 and 99?",
    category: "Punctuation",
    difficulty: "advanced",
    options: ["Hyphen", "Comma", "Colon", "Semicolon"],
    answer: "Hyphen",
    explanation: "Compound numbers like 'twenty-one' require a hyphen."
  },
  {
    id: 111,
    question: "Complete: 'It is imperative that he ___ the document.'",
    category: "Syntax",
    difficulty: "advanced",
    options: ["signs", "sign", "signed", "must sign"],
    answer: "sign",
    explanation: "Mandatory clauses introduced by 'imperative that' take base subjunctive 'sign'."
  },
  {
    id: 112,
    question: "What is a synonym of 'Obsequious'?",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Rebellious", "Servile", "Arrogant", "Polite"],
    answer: "Servile",
    explanation: "'Obsequious' means obedient or attentive to an excessive degree (servile)."
  },
  {
    id: 113,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "advanced",
    options: ["Liaison", "Liason", "Liaisonne", "Liasone"],
    answer: "Liaison",
    explanation: "Liaison has a second 'i' after 'a': 'Liaison'."
  },
  {
    id: 114,
    question: "Where should commas surround a non-restrictive relative clause?",
    category: "Punctuation",
    difficulty: "advanced",
    options: [
      "The man, who wore a hat, entered.",
      "The man who wore a hat, entered.",
      "The man, who wore a hat entered.",
      "The man who wore, a hat entered."
    ],
    answer: "The man, who wore a hat, entered.",
    explanation: "Non-restrictive relative clauses are parenthetical and must be surrounded by commas."
  },
  {
    id: 115,
    question: "Complete: 'A number of paths ___ open before us.'",
    category: "Syntax",
    difficulty: "advanced",
    options: ["are", "is", "was", "has been"],
    answer: "are",
    explanation: "'A number of' takes plural verb 'are'."
  },
  {
    id: 116,
    question: "Identify the antonym of 'Mitigate':",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Alleviate", "Exacerbate", "Diminish", "Soften"],
    answer: "Exacerbate",
    explanation: "'Mitigate' means to make less severe; 'exacerbate' means to make worse."
  },
  {
    id: 117,
    question: "Choose the correct spelling:",
    category: "Spelling",
    difficulty: "advanced",
    options: ["Sacrilegious", "Sacreligious", "Sacralegious", "Sacrilegous"],
    answer: "Sacrilegious",
    explanation: "Derived from 'sacrilege' (stealing sacred things) and ends in '-ious'."
  },
  {
    id: 118,
    question: "Which punctuation ends an indirect question?",
    category: "Punctuation",
    difficulty: "advanced",
    options: ["Period", "Question mark", "Exclamation mark", "Semicolon"],
    answer: "Period",
    explanation: "Indirect questions like 'He asked where she was.' end with a period."
  },
  {
    id: 119,
    question: "Complete the double comparison: 'The harder you study, ___ you perform.'",
    category: "Syntax",
    difficulty: "advanced",
    options: ["the better", "better", "the best", "more better"],
    answer: "the better",
    explanation: "Correlative double comparative uses 'the comparative... the comparative'."
  },
  {
    id: 120,
    question: "What is the meaning of 'Garrulous'?",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Quiet", "Talkative", "Generous", "Polite"],
    answer: "Talkative",
    explanation: "'Garrulous' means excessively talkative, especially on trivial matters; talkative."
  }
];

export function SpellcasterDefense({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  // Game states
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("intermediate");
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [currentQuestions, setCurrentQuestions] = React.useState<SpellQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [castleHealth, setCastleHealth] = React.useState(100);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = React.useState<boolean | null>(null);
  const [askedQuestions, setAskedQuestions] = React.useState<number[]>([]);
  const [spellPosition, setSpellPosition] = React.useState<"left" | "center" | "right">("center");

  // Particle systems references
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const magicDustRef = React.useRef<{ x: number; y: number; vx: number; vy: number; radius: number; color: string; alpha: number }[]>([]);
  const projectileRef = React.useRef<{ x: number; y: number; targetX: number; targetY: number; active: boolean; color: string } | null>(null);

  // Auth and Firestore
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const gameInfo = getGameBySlug(slug);

  // Fullscreen event listener
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // HTML5 Magic Particle simulation on Canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || 500;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize ambient magic dust
    const numDust = 80;
    const colors = ["#ec4899", "#a855f7", "#6366f1", "#f43f5e", "#fb7185"];
    if (magicDustRef.current.length === 0) {
      for (let i = 0; i < numDust; i++) {
        magicDustRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -Math.random() * 0.8 - 0.2,
          radius: Math.random() * 2 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)] || "#6366f1",
          alpha: Math.random() * 0.5 + 0.3
        });
      }
    }

    const animate = () => {
      // Dark wizard tower atmosphere
      ctx.fillStyle = "rgba(8, 6, 16, 0.15)"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw ambient rising dust particles
      magicDustRef.current.forEach((dust) => {
        dust.y += dust.vy;
        dust.x += dust.vx;

        // Reset if goes off screen
        if (dust.y < 0) {
          dust.y = canvas.height;
          dust.x = Math.random() * canvas.width;
        }
        if (dust.x < 0 || dust.x > canvas.width) {
          dust.vx *= -1;
        }

        ctx.beginPath();
        ctx.arc(dust.x, dust.y, dust.radius, 0, Math.PI * 2);
        ctx.fillStyle = dust.color;
        ctx.globalAlpha = dust.alpha;
        ctx.shadowBlur = dust.radius * 3;
        ctx.shadowColor = dust.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      ctx.globalAlpha = 1.0; // reset

      // Draw magic energy projectile beam if active
      const proj = projectileRef.current;
      if (proj && proj.active) {
        const dx = proj.targetX - proj.x;
        const dy = proj.targetY - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 15) {
          proj.active = false;
          // Spawn spelling magic explosion particles
          for (let k = 0; k < 25; k++) {
            magicDustRef.current.push({
              x: proj.targetX,
              y: proj.targetY,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              radius: Math.random() * 3 + 1,
              color: proj.color,
              alpha: 1.0
            });
          }
        } else {
          // Move projectile towards phantom target
          proj.x += (dx / dist) * 16;
          proj.y += (dy / dist) * 16;

          // Draw projectile beam and sparks
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = proj.color;
          ctx.shadowBlur = 20;
          ctx.shadowColor = proj.color;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Trail sparks
          for (let j = 0; j < 3; j++) {
            magicDustRef.current.push({
              x: proj.x,
              y: proj.y,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              radius: Math.random() * 2 + 0.5,
              color: proj.color,
              alpha: 0.8
            });
          }
        }
      }

      // Draw magical castle floor barrier line
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 20);
      ctx.lineTo(canvas.width, canvas.height - 20);
      ctx.strokeStyle = "rgba(99, 102, 241, 0.25)";
      ctx.lineWidth = 4;
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState]);

  // Start voyage & select difficulty
  const startDefenseSim = () => {
    setGameState("difficulty_select");
  };

  const handleDifficultySelect = (diff: Difficulty) => {
    setDifficulty(diff);
    setScore(0);
    setCastleHealth(100);
    setQuestionIndex(0);
    setSelectedOption(null);
    setAnsweredCorrectly(null);

    // Filter questions by difficulty and select 10 unique ones
    const pool = SPELL_QUESTION_DATABASE.filter(q => q.difficulty === diff);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    
    // Low repetition logic: ensure we don't repeat questions asked in recent rounds
    const unasked = shuffled.filter(q => !askedQuestions.includes(q.id));
    let selected: SpellQuestion[] = [];
    if (unasked.length >= 10) {
      selected = unasked.slice(0, 10);
    } else {
      setAskedQuestions([]);
      selected = shuffled.slice(0, 10);
    }

    setCurrentQuestions(selected);
    
    // Add these IDs to the asked questions list
    const newAskedIds = selected.map(q => q.id);
    setAskedQuestions(prev => [...prev, ...newAskedIds]);

    setGameState("playing");
  };

  const currentQuestion = currentQuestions[questionIndex];

  // Spellcasting triggering
  const handleSpellCast = (option: string, position: "left" | "center" | "right") => {
    if (selectedOption !== null || gameState !== "playing") return;

    setSelectedOption(option);
    setSpellPosition(position);
    const correct = option === currentQuestion.answer;
    setAnsweredCorrectly(correct);

    const canvas = canvasRef.current;
    const startX = canvas ? canvas.width / 2 : window.innerWidth / 2;
    const startY = canvas ? canvas.height - 70 : 400;

    // Calculate phantom target coordinates based on position
    let targetX = startX;
    if (position === "left") targetX -= 150;
    if (position === "right") targetX += 150;
    const targetY = 120; // Drift target y coordinate

    // Fire magical projectile
    projectileRef.current = {
      x: startX,
      y: startY,
      targetX,
      targetY,
      active: true,
      color: correct ? "#10b981" : "#f43f5e" // green for correct spell, red for failure
    };

    setGameState("casting");

    setTimeout(() => {
      if (correct) {
        setScore(s => s + 10);
        setTimeout(() => {
          advanceSpells(correct);
        }, 1200);
      } else {
        // Hull damage
        setCastleHealth(h => {
          const nextHealth = h - 20;
          if (nextHealth <= 0) {
            setTimeout(() => {
              setGameState("failed");
            }, 1200);
          } else {
            setTimeout(() => {
              advanceSpells(correct);
            }, 2200);
          }
          return Math.max(0, nextHealth);
        });
      }
    }, 600);
  };

  const advanceSpells = (lastWasCorrect: boolean) => {
    setSelectedOption(null);
    setAnsweredCorrectly(null);
    setSpellPosition("center");

    if (questionIndex < 9) {
      setQuestionIndex(i => i + 1);
      setGameState("playing");
    } else {
      // Completed all 10 rounds
      setGameState("finished");
      
      // Award coins via analytics event trigger (real users only)
      if (gameInfo) {
        logAnalyticsEvent(firestore, user?.uid || 'guest', {
          type: 'game_played',
          details: { 
            slug: gameInfo.slug, 
            title: gameInfo.title, 
            score: score + (lastWasCorrect ? 10 : 0) 
          }
        });
      }
    }
  };

  const restartSpire = () => {
    setGameState("idle");
  };

  return (
    <Card className={cn(
      "w-full transition-all duration-500 flex flex-col relative overflow-hidden select-none border-slate-900 bg-slate-950 text-slate-100",
      isFullscreen ? "min-h-screen rounded-none border-none max-w-none justify-center" : "max-w-4xl mx-auto shadow-2xl"
    )}>
      {/* Absolute Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0" 
      />

      {/* Top Controls Header */}
      <div className="flex justify-between items-center p-4 border-b border-slate-900/60 z-10 bg-slate-950/70 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-pink-400 fill-pink-400" />
          <span className="font-extrabold tracking-wider bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent uppercase text-xs md:text-sm">
            SPELLCASTER SPELL-DEFENSE
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {gameState === "playing" && (
            <div className="flex items-center gap-4 text-xs md:text-sm font-semibold">
              <div className="flex items-center gap-1.5 bg-slate-900/70 border border-slate-800/80 px-3 py-1 rounded-full">
                <Badge variant="outline" className="border-pink-500/20 text-pink-400 p-0 text-[10px]">
                  INCANTATION {questionIndex + 1}/10
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900/70 border border-slate-800/80 px-3 py-1 rounded-full">
                <Coins className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span className="text-amber-300 font-bold">{score} pts</span>
              </div>

              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-300 bg-slate-900/70 border-slate-800",
                castleHealth <= 20 ? "border-red-500/30 text-red-400 animate-pulse" : "text-cyan-400"
              )}>
                <ShieldAlert className="h-3.5 w-3.5 fill-current" />
                <span className="font-bold">SPIRE {castleHealth}%</span>
              </div>
            </div>
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50" 
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <CardContent className={cn(
        "flex flex-col items-center justify-center p-4 md:p-8 z-10 flex-grow relative min-h-[450px]",
        isFullscreen ? "min-h-[70vh]" : "min-h-[450px]"
      )}>
        <AnimatePresence mode="wait">
          {/* 1. IDLE STATE */}
          {gameState === "idle" && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="text-center flex flex-col items-center gap-6 max-w-xl"
            >
              <div className="relative p-6 bg-pink-500/10 rounded-full border border-pink-500/20 shadow-2xl shadow-pink-500/5 mb-2">
                <Flame className="h-20 w-20 text-pink-400 animate-bounce" />
                <div className="absolute inset-0 border border-pink-400/25 rounded-full scale-125 animate-ping opacity-30" />
              </div>
              
              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                  SPELLCASTER SPELL-DEFENSE
                </h1>
                <p className="text-slate-400 text-sm md:text-base mt-2">
                  Unleash grammar incantations to defend the ancient wizard spire from falling spelling phantoms. Castle shields depend on your vocabulary accuracy!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-4">
                <Button 
                  onClick={() => setGameState("instructions")} 
                  className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold uppercase rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-pink-500/20"
                >
                  Enter Spire
                </Button>
              </div>
            </motion.div>
          )}

          {/* 2. INSTRUCTIONS */}
          {gameState === "instructions" && (
            <motion.div 
              key="instructions"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col gap-6"
            >
              <div className="text-center">
                <Badge className="bg-pink-500/20 border-pink-500/30 text-pink-300 font-bold uppercase tracking-wider mb-2">
                  SPELLBOOK OF ARCANUM
                </Badge>
                <h2 className="text-2xl md:text-3xl font-black uppercase text-foreground">Wizardry Instructions</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
                <div className="flex gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                  <Flame className="h-8 w-8 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold uppercase text-slate-200 text-xs tracking-wider mb-1">CAST NEON SPELLS</h4>
                    <p className="text-slate-400 leading-relaxed text-xs">
                      Examine the grammar/spelling prompt at the top. Target and click the descending phantom card that represents the correct answer.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                  <ShieldAlert className="h-8 w-8 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold uppercase text-slate-200 text-xs tracking-wider mb-1">DEFEND THE WALLS</h4>
                    <p className="text-slate-400 leading-relaxed text-xs">
                      Every incorrect incantation allows a phantom to strike the tower. The walls can withstand exactly five collisions before crumbling.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                  <Sparkles className="h-8 w-8 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold uppercase text-slate-200 text-xs tracking-wider mb-1">COSMIC EARNINGS</h4>
                    <p className="text-slate-400 leading-relaxed text-xs">
                      Slaying all 10 phantoms safely awards 10 Lingo-Coins, which are doubled if selected as your daily bonus challenge!
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                  <Compass className="h-8 w-8 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold uppercase text-slate-200 text-xs tracking-wider mb-1">ANTI-REPETITION RUNES</h4>
                    <p className="text-slate-400 leading-relaxed text-xs">
                      Our mainframe dynamically filters spelling and grammar files to make sure question repetitions are kept to an absolute minimum.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800/40 pt-4 mt-2">
                <Button 
                  variant="ghost" 
                  onClick={restartSpire}
                  className="font-bold uppercase text-slate-400 hover:text-slate-200"
                >
                  Leave Spire
                </Button>
                <Button 
                  onClick={() => setGameState("difficulty_select")} 
                  className="h-12 px-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold uppercase rounded-xl hover:opacity-90 transition-all shadow-md shadow-pink-500/10"
                >
                  Select Difficulty
                </Button>
              </div>
            </motion.div>
          )}

          {/* 3. DIFFICULTY SELECT */}
          {gameState === "difficulty_select" && (
            <motion.div 
              key="difficulty_select"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm flex flex-col gap-5 text-center bg-slate-900/60 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-md"
            >
              <div>
                <span className="text-[10px] font-black tracking-widest text-pink-400 uppercase">INCANTATION LEVELS</span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mt-1 text-foreground">CHOOSE CHALLENGE LEVEL</h2>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                {(["beginner", "intermediate", "advanced"] as Difficulty[]).map((level) => (
                  <Button
                    key={level}
                    onClick={() => handleDifficultySelect(level)}
                    className={cn(
                      "h-16 text-sm md:text-base font-extrabold uppercase tracking-widest rounded-xl transition-all border border-slate-800 hover:scale-[1.02] shadow-lg",
                      level === "beginner" && "bg-slate-950 text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/[0.03]",
                      level === "intermediate" && "bg-slate-950 text-pink-400 hover:border-pink-500/30 hover:bg-pink-500/[0.03]",
                      level === "advanced" && "bg-slate-950 text-purple-400 hover:border-purple-500/30 hover:bg-purple-500/[0.03]"
                    )}
                  >
                    {level} Spells
                  </Button>
                ))}
              </div>

              <Button 
                variant="ghost" 
                onClick={() => setGameState("instructions")}
                className="uppercase font-bold text-xs opacity-50 hover:opacity-100 hover:bg-transparent mt-2"
              >
                Back to brief
              </Button>
            </motion.div>
          )}

          {/* 4. GAMEPLAY PLAYING / CASTING */}
          {(gameState === "playing" || gameState === "casting") && currentQuestion && (
            <motion.div 
              key="gameplay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col gap-6 items-center"
            >
              {/* Question Definition Card */}
              <div className="w-full max-w-3xl bg-slate-900/60 border border-slate-800/80 p-5 md:p-6 rounded-2xl backdrop-blur-md text-center shadow-lg relative">
                <Badge className="absolute -top-3 left-6 bg-slate-800 border-slate-700 text-pink-300 font-extrabold uppercase text-[9px] tracking-wider py-0.5 px-3">
                  {currentQuestion.category} Runes
                </Badge>
                
                <h3 className="text-lg md:text-xl font-bold leading-relaxed text-slate-200 mt-2">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Arena Floor */}
              <div className="w-full max-w-3xl relative h-[240px] md:h-[280px] bg-slate-950/40 border border-slate-900/60 rounded-3xl overflow-hidden flex items-center justify-center shadow-inner">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-pink-950/20 via-slate-950/10 to-transparent z-0 pointer-events-none" />

                {/* Incorrect Spell Crash Warning */}
                {selectedOption !== null && !answeredCorrectly && (
                  <div className="absolute inset-0 bg-red-950/15 border-2 border-red-500/20 z-0 animate-pulse pointer-events-none flex items-center justify-center flex-col">
                    <AlertTriangle className="h-12 w-12 text-red-500 animate-bounce mb-2" />
                    <span className="text-red-500 font-extrabold tracking-widest text-xs uppercase animate-pulse">
                      CASTLE WALLS UNDER COLLISION
                    </span>
                  </div>
                )}

                {/* Floating Wizard character */}
                <motion.div
                  animate={{
                    x: spellPosition === "left" ? -140 : spellPosition === "right" ? 140 : 0,
                    y: [0, -8, 0],
                    rotate: spellPosition === "left" ? -8 : spellPosition === "right" ? 8 : 0
                  }}
                  transition={{ 
                    x: { type: "spring", stiffness: 100, damping: 12 },
                    y: { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
                  }}
                  className="absolute bottom-6 z-10 flex flex-col items-center"
                >
                  <div className="relative">
                    {/* Glowing wizard magic circle behind */}
                    <div className="absolute -inset-4 rounded-full border border-pink-500/20 animate-spin blur-[2px]" style={{ animationDuration: '6s' }} />
                    <div className="absolute -inset-2 rounded-full border border-purple-500/10 animate-spin blur-[1px]" style={{ animationDuration: '10s', animationDirection: 'reverse' }} />
                    
                    {/* Glowing spell circle */}
                    <svg className="w-16 h-16 drop-shadow-[0_0_12px_rgba(236,72,153,0.5)]" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Wizard Hat & Robe */}
                      <path d="M32 6L14 36L32 26L50 36L32 6Z" fill="#a855f7" stroke="#ec4899" strokeWidth="2"/>
                      {/* Robe floor */}
                      <path d="M20 46C20 40 44 40 44 46" stroke="#c084fc" strokeWidth="2"/>
                      {/* Magic Staff */}
                      <path d="M46 22L46 54" stroke="#ec4899" strokeWidth="2.5"/>
                      <circle cx="46" cy="18" r="4" fill="#f43f5e" className="animate-pulse"/>
                    </svg>
                  </div>
                </motion.div>
              </div>

              {/* Explanatory Overlay */}
              {selectedOption !== null && !answeredCorrectly && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-3xl bg-red-950/20 border border-red-900/40 rounded-xl p-4 text-center text-xs md:text-sm text-red-300"
                >
                  <strong className="uppercase font-bold tracking-widest text-[10px] bg-red-900/40 px-2 py-0.5 rounded text-red-200 mr-2">
                    Failed Spell
                  </strong>
                  {currentQuestion.explanation}
                </motion.div>
              )}

              {/* Gargoyle Phantom cards options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                {currentQuestion.options.map((opt, idx) => {
                  const positions: ("left" | "center" | "right")[] = ["left", "center", "right"];
                  const pos = positions[idx] || "center";
                  const isSelected = selectedOption === opt;
                  const isCorrectAnswer = opt === currentQuestion.answer;

                  return (
                    <Button
                      key={opt}
                      disabled={selectedOption !== null}
                      onClick={() => handleSpellCast(opt, pos)}
                      className={cn(
                        "h-20 md:h-24 rounded-2xl border-2 backdrop-blur-md transition-all duration-300 font-extrabold text-sm md:text-base flex flex-col items-center justify-center p-3 relative shadow-lg hover:-translate-y-1 active:translate-y-0",
                        // Idle styles
                        "bg-slate-900/50 border-slate-800 text-slate-200 hover:bg-pink-500/10 hover:border-pink-500/40 hover:shadow-pink-500/5",
                        // Selection states
                        isSelected && isCorrectAnswer && "bg-green-500/20 border-green-500 text-green-300 shadow-green-500/10 scale-105",
                        isSelected && !isCorrectAnswer && "bg-red-500/20 border-red-500 text-red-300 shadow-red-500/10 scale-[0.98]",
                        selectedOption !== null && !isSelected && isCorrectAnswer && "bg-green-500/15 border-green-500/50 text-green-300",
                        selectedOption !== null && !isSelected && !isCorrectAnswer && "opacity-40"
                      )}
                    >
                      <span className="text-[10px] font-black uppercase text-pink-400/70 tracking-widest absolute top-2">
                        PHANTOM {idx + 1}
                      </span>
                      <span className="truncate max-w-full pt-2">{opt}</span>
                    </Button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 5. GAME COMPLETED RESULTS */}
          {gameState === "finished" && (
            <motion.div 
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center flex flex-col items-center gap-6 max-w-md bg-slate-900/50 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-md"
            >
              <Trophy className="w-24 h-24 text-amber-400 animate-bounce" />
              
              <div>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 uppercase font-black tracking-widest py-0.5 px-3">
                  SPIRE DEFENDED SUCCESSFULLY
                </Badge>
                <h2 className="text-3xl font-black uppercase tracking-tight mt-2 text-foreground">Victory Achieved</h2>
                <p className="text-slate-400 text-xs mt-1">
                  You successfully defeated the spelling invasion!
                </p>
              </div>

              <div className="w-full grid grid-cols-2 gap-3 py-4 border-y border-slate-800/60">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spell Score</span>
                  <p className="text-2xl font-black text-pink-400 mt-1">{score} pts</p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spire Integrity</span>
                  <p className={cn(
                    "text-2xl font-black mt-1",
                    castleHealth <= 40 ? "text-red-400" : "text-cyan-400"
                  )}>{castleHealth}%</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <Button 
                  onClick={restartSpire}
                  className="h-12 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold uppercase rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" /> Restart Incantations
                </Button>
                <Button 
                  variant="outline"
                  asChild
                  className="h-12 border-slate-800 hover:bg-slate-900 rounded-xl"
                >
                  <Link href="/games">Leave Castle</Link>
                </Button>
              </div>
            </motion.div>
          )}

          {/* 6. GAME FAILED STATE */}
          {gameState === "failed" && (
            <motion.div 
              key="failed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center flex flex-col items-center gap-6 max-w-md bg-slate-900/60 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-md"
            >
              <AlertTriangle className="w-24 h-24 text-red-500 animate-pulse" />
              
              <div>
                <Badge variant="destructive" className="uppercase font-black tracking-widest py-0.5 px-3">
                  SPIRE DESTROYED
                </Badge>
                <h2 className="text-3xl font-black uppercase tracking-tight mt-2 text-foreground">Defenses Collapsed</h2>
                <p className="text-slate-400 text-xs mt-1">
                  The ancient castle walls have fallen to the gargoyles.
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 w-full text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phantoms Slayed</span>
                <p className="text-2xl font-black text-red-400 mt-1">{questionIndex}/10 Phantoms</p>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <Button 
                  onClick={restartSpire}
                  className="h-12 bg-red-600 text-white font-extrabold uppercase rounded-xl hover:bg-red-500 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" /> Try Again
                </Button>
                <Button 
                  variant="outline"
                  asChild
                  className="h-12 border-slate-800 hover:bg-slate-900 rounded-xl"
                >
                  <Link href="/games">Leave Spire</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      {/* Footer Details */}
      <CardFooter className="flex justify-between items-center border-t border-slate-900/40 p-4 bg-slate-950/50 backdrop-blur-sm z-10 text-[10px] md:text-xs text-slate-500">
        <span>Incantations Speed: <span className="uppercase text-slate-400 font-bold">{difficulty}</span></span>
        <span>Aesthetic: Neon Spell Dust simulation active</span>
      </CardFooter>
    </Card>
  );
}
