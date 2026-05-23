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
  Rocket, Shield, Coins, Trophy, Maximize2, Minimize2, 
  RotateCcw, Sparkles, AlertTriangle, ArrowLeft, CheckCircle2, XCircle
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";

// Types
type Difficulty = "beginner" | "intermediate" | "advanced";
type GameState = "idle" | "instructions" | "difficulty_select" | "playing" | "warping" | "finished" | "failed";

interface SpaceQuestion {
  id: number;
  question: string;
  category: "Vocabulary" | "Grammar" | "Idioms" | "Reading";
  difficulty: Difficulty;
  options: string[];
  answer: string;
  explanation: string;
}

// 120 Premium unique questions (40 Beginner, 40 Intermediate, 40 Advanced)
const QUESTION_DATABASE: SpaceQuestion[] = [
  // --- BEGINNER (1-40) ---
  {
    id: 1,
    question: "Choose the correct pronoun: 'This is my sister. ___ is ten years old.'",
    category: "Grammar",
    difficulty: "beginner",
    options: ["He", "She", "They", "It"],
    answer: "She",
    explanation: "'Sister' is female, so we use the pronoun 'She'."
  },
  {
    id: 2,
    question: "Select the antonym of 'Hot':",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Warm", "Cold", "Bright", "Dry"],
    answer: "Cold",
    explanation: "The opposite of hot is cold."
  },
  {
    id: 3,
    question: "Complete the sentence: 'We ___ going to the park yesterday.'",
    category: "Grammar",
    difficulty: "beginner",
    options: ["is", "am", "are", "were"],
    answer: "were",
    explanation: "For past plural ('We'), the correct past tense verb is 'were'."
  },
  {
    id: 4,
    question: "What does the idiom 'Piece of cake' mean?",
    category: "Idioms",
    difficulty: "beginner",
    options: ["Very easy", "Very hard", "A slice of dessert", "A birthday gift"],
    answer: "Very easy",
    explanation: "If something is a 'piece of cake', it is simple to do."
  },
  {
    id: 5,
    question: "Select the synonym of 'Quick':",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Slow", "Fast", "Heavy", "Soft"],
    answer: "Fast",
    explanation: "Both 'quick' and 'fast' describe moving or happening with speed."
  },
  {
    id: 6,
    question: "Fill in the blank: 'I have ___ apple in my bag.'",
    category: "Grammar",
    difficulty: "beginner",
    options: ["a", "an", "the", "some"],
    answer: "an",
    explanation: "Use 'an' before words starting with vowel sounds like 'apple'."
  },
  {
    id: 7,
    question: "What is the plural form of 'Child'?",
    category: "Grammar",
    difficulty: "beginner",
    options: ["Childs", "Childrens", "Children", "Childes"],
    answer: "Children",
    explanation: "'Children' is the irregular plural form of 'child'."
  },
  {
    id: 8,
    question: "Identify the animal matching this description: 'A large mammal with trunk and tusks.'",
    category: "Reading",
    difficulty: "beginner",
    options: ["Lion", "Elephant", "Giraffe", "Bear"],
    answer: "Elephant",
    explanation: "Elephants are known for their trunks and tusks."
  },
  {
    id: 9,
    question: "Complete the statement: 'He always ___ early in the morning.'",
    category: "Grammar",
    difficulty: "beginner",
    options: ["wake up", "wakes up", "waking up", "waked up"],
    answer: "wakes up",
    explanation: "Third-person singular 'He' takes the verb form 'wakes'."
  },
  {
    id: 10,
    question: "What is the opposite of 'Dark'?",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Light", "Black", "Heavy", "Cloudy"],
    answer: "Light",
    explanation: "The opposite of dark is light."
  },
  {
    id: 11,
    question: "Choose the correct spelling:",
    category: "Grammar",
    difficulty: "beginner",
    options: ["Recieve", "Receive", "Recive", "Receeve"],
    answer: "Receive",
    explanation: "The rule is 'i before e except after c', making 'Receive' correct."
  },
  {
    id: 12,
    question: "Which of the following is a fruit?",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Carrot", "Potato", "Banana", "Onion"],
    answer: "Banana",
    explanation: "Banana is a fruit, while the rest are vegetables."
  },
  {
    id: 13,
    question: "Complete: 'My mother is ___ teacher.'",
    category: "Grammar",
    difficulty: "beginner",
    options: ["a", "an", "some", "any"],
    answer: "a",
    explanation: "We use 'a' before words starting with consonant sounds."
  },
  {
    id: 14,
    question: "What does 'break a leg' mean in theatre?",
    category: "Idioms",
    difficulty: "beginner",
    options: ["Fall down", "Good luck", "Sing loudly", "Stop working"],
    answer: "Good luck",
    explanation: "It is a traditional idiom wishing performers good luck."
  },
  {
    id: 15,
    question: "Select the synonym of 'Huge':",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Tiny", "Large", "Weak", "Narrow"],
    answer: "Large",
    explanation: "'Huge' and 'large' refer to objects of significant size."
  },
  {
    id: 16,
    question: "Complete the sentence: 'They ___ at school right now.'",
    category: "Grammar",
    difficulty: "beginner",
    options: ["is", "am", "are", "was"],
    answer: "are",
    explanation: "Plural subject 'They' in the present tense uses 'are'."
  },
  {
    id: 17,
    question: "What is the opposite of 'Start'?",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Begin", "Finish", "Play", "Move"],
    answer: "Finish",
    explanation: "The opposite of start is finish (or stop)."
  },
  {
    id: 18,
    question: "Fill in: 'I want to buy ___ new book.'",
    category: "Grammar",
    difficulty: "beginner",
    options: ["a", "an", "the", "many"],
    answer: "a",
    explanation: "'Book' starts with a consonant sound, so we use 'a'."
  },
  {
    id: 19,
    question: "Which word is a noun?",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Run", "Happy", "Happiness", "Quickly"],
    answer: "Happiness",
    explanation: "'Happiness' is an abstract noun, whereas 'Happy' is an adjective."
  },
  {
    id: 20,
    question: "What does 'under the weather' mean?",
    category: "Idioms",
    difficulty: "beginner",
    options: ["Feeling sick", "Wet from rain", "Hot and sunny", "Flying high"],
    answer: "Feeling sick",
    explanation: "To feel 'under the weather' means to feel slightly unwell."
  },
  {
    id: 21,
    question: "Complete: 'Do you like ___ oranges?'",
    category: "Grammar",
    difficulty: "beginner",
    options: ["this", "that", "these", "a"],
    answer: "these",
    explanation: "'Oranges' is plural, so we use the plural demonstrative 'these'."
  },
  {
    id: 22,
    question: "Choose the correct verb: 'The dog ___ when the mailman arrives.'",
    category: "Grammar",
    difficulty: "beginner",
    options: ["bark", "barks", "barking", "barked"],
    answer: "barks",
    explanation: "Singular noun 'dog' takes the singular present verb 'barks'."
  },
  {
    id: 23,
    question: "Select the synonym of 'Happy':",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Sad", "Glad", "Angry", "Tired"],
    answer: "Glad",
    explanation: "'Glad' is a synonym for 'happy'."
  },
  {
    id: 24,
    question: "Complete: 'She went ___ the store to buy milk.'",
    category: "Grammar",
    difficulty: "beginner",
    options: ["at", "to", "in", "on"],
    answer: "to",
    explanation: "We use 'to' to show movement towards a destination."
  },
  {
    id: 25,
    question: "What is the past tense of 'Go'?",
    category: "Grammar",
    difficulty: "beginner",
    options: ["Goes", "Gone", "Went", "Goed"],
    answer: "Went",
    explanation: "'Went' is the irregular past tense form of 'go'."
  },
  {
    id: 26,
    question: "Identify the antonym of 'Weak':",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Strong", "Soft", "Small", "Thin"],
    answer: "Strong",
    explanation: "The opposite of weak is strong."
  },
  {
    id: 27,
    question: "Complete the sentence: 'We have two ___ in our house.'",
    category: "Grammar",
    difficulty: "beginner",
    options: ["cat", "cats", "cates", "cat's"],
    answer: "cats",
    explanation: "Plural form of 'cat' is 'cats'."
  },
  {
    id: 28,
    question: "What is the correct preposition: 'The keys are ___ the table.'",
    category: "Grammar",
    difficulty: "beginner",
    options: ["in", "on", "at", "underneath"],
    answer: "on",
    explanation: "'On' indicates that the keys are resting on the flat surface."
  },
  {
    id: 29,
    question: "Select the spelling of the number 12:",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Twelf", "Twelve", "Twelv", "Twelph"],
    answer: "Twelve",
    explanation: "The correct spelling is 'Twelve'."
  },
  {
    id: 30,
    question: "Complete: 'He ___ like chocolate ice cream.'",
    category: "Grammar",
    difficulty: "beginner",
    options: ["don't", "doesn't", "isn't", "not"],
    answer: "doesn't",
    explanation: "Third-person singular 'He' takes 'doesn't' (does not) to negate."
  },
  {
    id: 31,
    question: "What is a synonym of 'Silent'?",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Noisy", "Quiet", "Loud", "Active"],
    answer: "Quiet",
    explanation: "'Quiet' is a synonym for 'silent'."
  },
  {
    id: 32,
    question: "Fill in the blank: 'Look at ___ beautiful stars in the sky!'",
    category: "Grammar",
    difficulty: "beginner",
    options: ["this", "that", "those", "them"],
    answer: "those",
    explanation: "'Stars' are plural and far away, so we use 'those'."
  },
  {
    id: 33,
    question: "What does the idiom 'spill the beans' mean?",
    category: "Idioms",
    difficulty: "beginner",
    options: ["Cook soup", "Reveal a secret", "Drop groceries", "Clean the floor"],
    answer: "Reveal a secret",
    explanation: "To 'spill the beans' is to reveal secret information prematurely."
  },
  {
    id: 34,
    question: "Choose the correct word: 'I have ___ much homework.'",
    category: "Grammar",
    difficulty: "beginner",
    options: ["to", "two", "too", "tow"],
    answer: "too",
    explanation: "'Too' means excessively or also. Here it is used as 'excessively'."
  },
  {
    id: 35,
    question: "What is the opposite of 'Heavy'?",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Light", "Soft", "Small", "Short"],
    answer: "Light",
    explanation: "The opposite of heavy is light."
  },
  {
    id: 36,
    question: "Select the sentence with correct grammar:",
    category: "Reading",
    difficulty: "beginner",
    options: [
      "She don't like apples.",
      "She doesn't likes apples.",
      "She doesn't like apples.",
      "She not like apples."
    ],
    answer: "She doesn't like apples.",
    explanation: "'She doesn't like' is the correct negative present form."
  },
  {
    id: 37,
    question: "Fill in: 'They are ___ a movie right now.'",
    category: "Grammar",
    difficulty: "beginner",
    options: ["watch", "watches", "watched", "watching"],
    answer: "watching",
    explanation: "Present continuous tense 'are' requires verb+ing 'watching'."
  },
  {
    id: 38,
    question: "What is a synonym of 'Simple'?",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Hard", "Easy", "Complex", "Slow"],
    answer: "Easy",
    explanation: "'Easy' and 'simple' both mean not difficult."
  },
  {
    id: 39,
    question: "Choose the plural of 'Foot':",
    category: "Grammar",
    difficulty: "beginner",
    options: ["Foots", "Feets", "Feet", "Footes"],
    answer: "Feet",
    explanation: "'Feet' is the irregular plural form of 'foot'."
  },
  {
    id: 40,
    question: "What is the correct exclamation for greeting: '___! How are you?'",
    category: "Vocabulary",
    difficulty: "beginner",
    options: ["Goodbye", "Hello", "Thanks", "Please"],
    answer: "Hello",
    explanation: "'Hello' is the standard greeting exclamation."
  },

  // --- INTERMEDIATE (41-80) ---
  {
    id: 41,
    question: "Identify the synonym of 'Elated':",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Depressed", "Excited", "Overjoyed", "Exhausted"],
    answer: "Overjoyed",
    explanation: "'Elated' means extremely happy and excited; 'Overjoyed' matches."
  },
  {
    id: 42,
    question: "Complete the conditional: 'If I ___ you, I would take the job.'",
    category: "Grammar",
    difficulty: "intermediate",
    options: ["was", "am", "were", "be"],
    answer: "were",
    explanation: "Subjunctive mood for hypothetical scenarios uses 'were' for all subjects."
  },
  {
    id: 43,
    question: "What is the meaning of 'Once in a blue moon'?",
    category: "Idioms",
    difficulty: "intermediate",
    options: ["Very rarely", "Every month", "At nighttime", "Frequently"],
    answer: "Very rarely",
    explanation: "A 'blue moon' is rare, so the idiom denotes something happening infrequently."
  },
  {
    id: 44,
    question: "Choose the correct spelling:",
    category: "Grammar",
    difficulty: "intermediate",
    options: ["Necessary", "Necesary", "Neccessary", "Necessarry"],
    answer: "Necessary",
    explanation: "The word has one 'c' and double 's': 'Necessary'."
  },
  {
    id: 45,
    question: "Which of the following is a synonym of 'Meticulous'?",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Messy", "Careful", "Hasty", "Indifferent"],
    answer: "Careful",
    explanation: "'Meticulous' means showing great attention to detail; very careful."
  },
  {
    id: 46,
    question: "Complete the sentence: 'By the time we arrived, they ___ finished dinner.'",
    category: "Grammar",
    difficulty: "intermediate",
    options: ["have", "had", "would", "has"],
    answer: "had",
    explanation: "Past perfect tense ('had finished') is used for actions completed before another past event."
  },
  {
    id: 47,
    question: "Identify the antonym of 'Abundant':",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Plentiful", "Scarce", "Heavy", "Vast"],
    answer: "Scarce",
    explanation: "'Abundant' means existing in large quantities; 'scarce' is the opposite."
  },
  {
    id: 48,
    question: "What does 'cost an arm and a leg' mean?",
    category: "Idioms",
    difficulty: "intermediate",
    options: ["Very cheap", "Injurious", "Extremely expensive", "Difficult to buy"],
    answer: "Extremely expensive",
    explanation: "If something costs an arm and a leg, it is very high priced."
  },
  {
    id: 49,
    question: "Choose the sentence in the passive voice:",
    category: "Grammar",
    difficulty: "intermediate",
    options: [
      "The chef cooked a delicious meal.",
      "A delicious meal was cooked by the chef.",
      "The chef is cooking a delicious meal.",
      "A delicious meal has cooked the chef."
    ],
    answer: "A delicious meal was cooked by the chef.",
    explanation: "In passive voice, the target of the action becomes the subject."
  },
  {
    id: 50,
    question: "Select the synonym of 'Obstinate':",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Stubborn", "Flexible", "Polite", "Generous"],
    answer: "Stubborn",
    explanation: "'Obstinate' means stubbornly refusing to change one's opinion or course of action."
  },
  {
    id: 51,
    question: "Complete: 'She is very good ___ playing the violin.'",
    category: "Grammar",
    difficulty: "intermediate",
    options: ["on", "at", "with", "in"],
    answer: "at",
    explanation: "The adjective phrase 'good at' is used to describe skill in an activity."
  },
  {
    id: 52,
    question: "What does the idiom 'burn the midnight oil' mean?",
    category: "Idioms",
    difficulty: "intermediate",
    options: ["Work late into the night", "Waste resources", "Cause an accident", "Wake up early"],
    answer: "Work late into the night",
    explanation: "This means to stay up late studying or working."
  },
  {
    id: 53,
    question: "Identify the root word of 'Uncomfortably':",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Comfort", "Comfortable", "Comfortably", "Able"],
    answer: "Comfort",
    explanation: "'Comfort' is the root noun/verb; 'un-' is prefix, '-able' and '-ly' are suffixes."
  },
  {
    id: 54,
    question: "Complete the sentence: 'I look forward to ___ you soon.'",
    category: "Grammar",
    difficulty: "intermediate",
    options: ["meet", "meeting", "met", "will meet"],
    answer: "meeting",
    explanation: "'Look forward to' is a phrasal verb that takes a gerund (verb+ing)."
  },
  {
    id: 55,
    question: "Select the antonym of 'Vague':",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Clear", "Hazy", "Uncertain", "Dim"],
    answer: "Clear",
    explanation: "'Vague' means unclear or indefinite; 'clear' is its opposite."
  },
  {
    id: 56,
    question: "Which pronoun completes the clause: 'The man ___ car was stolen went to the police.'",
    category: "Grammar",
    difficulty: "intermediate",
    options: ["who", "whom", "whose", "which"],
    answer: "whose",
    explanation: "Possessive relative pronoun 'whose' refers to ownership by the man."
  },
  {
    id: 57,
    question: "What is the meaning of 'miss the boat'?",
    category: "Idioms",
    difficulty: "intermediate",
    options: ["Miss an opportunity", "Travel by ship", "Make a mistake", "Arrive late"],
    answer: "Miss an opportunity",
    explanation: "To 'miss the boat' is to fail to take advantage of an opportunity."
  },
  {
    id: 58,
    question: "Choose the correct phrasal verb: 'We had to ___ the meeting due to rain.'",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["call off", "put off", "carry on", "give in"],
    answer: "put off",
    explanation: "'Put off' means to postpone, while 'call off' means to cancel entirely."
  },
  {
    id: 59,
    question: "Fill in the blank: 'Neither of the candidates ___ prepared for the debate.'",
    category: "Grammar",
    difficulty: "intermediate",
    options: ["were", "are", "was", "have been"],
    answer: "was",
    explanation: "'Neither' is grammatically singular and requires a singular verb ('was')."
  },
  {
    id: 60,
    question: "Identify the synonym of 'Candid':",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Honest", "Polite", "Secretive", "Clever"],
    answer: "Honest",
    explanation: "'Candid' means truthful, straightforward, and frank."
  },
  {
    id: 61,
    question: "Complete the sentence: 'She has been working here ___ three years.'",
    category: "Grammar",
    difficulty: "intermediate",
    options: ["since", "for", "during", "ago"],
    answer: "for",
    explanation: "Use 'for' to express a duration or length of time."
  },
  {
    id: 62,
    question: "What is the meaning of 'see eye to eye'?",
    category: "Idioms",
    difficulty: "intermediate",
    options: ["Stare closely", "Agree completely", "Argue loudly", "Look away"],
    answer: "Agree completely",
    explanation: "To see 'eye to eye' with someone is to have the same opinion or agree."
  },
  {
    id: 63,
    question: "Select the word spelled correctly:",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Colleague", "Coleague", "Colleage", "Coleage"],
    answer: "Colleague",
    explanation: "The correct spelling is 'Colleague'."
  },
  {
    id: 64,
    question: "Complete the conditional: 'If we ___ earlier, we wouldn't have missed the bus.'",
    category: "Grammar",
    difficulty: "intermediate",
    options: ["left", "had left", "have left", "would leave"],
    answer: "had left",
    explanation: "Third conditional (past regret) uses 'had + past participle' in the if-clause."
  },
  {
    id: 65,
    question: "What is the opposite of 'Rigid'?",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Stiff", "Hard", "Flexible", "Heavy"],
    answer: "Flexible",
    explanation: "'Rigid' means stiff and unyielding; its opposite is 'flexible'."
  },
  {
    id: 66,
    question: "Identify the error in: 'Each of the students have to submit their essay.'",
    category: "Reading",
    difficulty: "intermediate",
    options: ["students", "have", "submit", "their"],
    answer: "have",
    explanation: "'Each' is a singular subject, so it requires the singular verb 'has' instead of 'have'."
  },
  {
    id: 67,
    question: "Choose the correct word: 'The company decided to ___ a new marketing policy.'",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["adopt", "adapt", "adept", "adorn"],
    answer: "adopt",
    explanation: "'Adopt' means to take up or follow; 'adapt' means to adjust."
  },
  {
    id: 68,
    question: "What does 'take it with a grain of salt' mean?",
    category: "Idioms",
    difficulty: "intermediate",
    options: ["Add seasoning", "Be skeptical of it", "Believe it fully", "Accept a gift"],
    answer: "Be skeptical of it",
    explanation: "To take something with a grain of salt is to regard it with skepticism."
  },
  {
    id: 69,
    question: "Fill in: 'The news ___ worse than we expected.'",
    category: "Grammar",
    difficulty: "intermediate",
    options: ["were", "are", "was", "have been"],
    answer: "was",
    explanation: "'News' is an uncountable noun that takes a singular verb."
  },
  {
    id: 70,
    question: "Select the synonym of 'Diligent':",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Lazy", "Hardworking", "Careless", "Clever"],
    answer: "Hardworking",
    explanation: "'Diligent' means showing care and conscientiousness in one's work."
  },
  {
    id: 71,
    question: "Complete the sentence: 'He had no intention of ___ his principles.'",
    category: "Grammar",
    difficulty: "intermediate",
    options: ["compromise", "compromising", "compromised", "to compromise"],
    answer: "compromising",
    explanation: "Prepositions like 'of' must be followed by a gerund ('compromising')."
  },
  {
    id: 72,
    question: "What is the meaning of 'beat around the bush'?",
    category: "Idioms",
    difficulty: "intermediate",
    options: ["Avoid the main point", "Cut down trees", "Arrive early", "Speak directly"],
    answer: "Avoid the main point",
    explanation: "To 'beat around the bush' is to speak evasively or avoid the main topic."
  },
  {
    id: 73,
    question: "Choose the correct spelling:",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Occurrence", "Occurence", "Occurrance", "Ocurrence"],
    answer: "Occurrence",
    explanation: "The word has double 'c', double 'r', and ends in '-ence'."
  },
  {
    id: 74,
    question: "Complete: '___ being tired, he stayed up to study.'",
    category: "Grammar",
    difficulty: "intermediate",
    options: ["Although", "Despite", "However", "In spite"],
    answer: "Despite",
    explanation: "'Despite' takes a noun or gerund phrase ('being tired'); 'Although' takes a full clause."
  },
  {
    id: 75,
    question: "Select the synonym of 'Pensive':",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Happy", "Thoughtful", "Angry", "Indecisive"],
    answer: "Thoughtful",
    explanation: "'Pensive' means engaged in, involving, or reflecting deep or serious thought."
  },
  {
    id: 76,
    question: "Choose the correct relative pronoun: 'The laptop, ___ battery is dead, is mine.'",
    category: "Grammar",
    difficulty: "intermediate",
    options: ["whose", "which", "its", "that"],
    answer: "whose",
    explanation: "'Whose' can be used possessively for both people and inanimate objects."
  },
  {
    id: 77,
    question: "What does 'break the ice' mean?",
    category: "Idioms",
    difficulty: "intermediate",
    options: ["Shatter frozen water", "Relieve tension in a social situation", "Start a fire", "Make a drink"],
    answer: "Relieve tension in a social situation",
    explanation: "To 'break the ice' is to make people feel more comfortable, especially in new groups."
  },
  {
    id: 78,
    question: "Complete the sentence: 'We should ___ our differences and work together.'",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["set aside", "set off", "put up", "take down"],
    answer: "set aside",
    explanation: "'Set aside' means to dismiss or ignore differences for a common goal."
  },
  {
    id: 79,
    question: "Choose the correct verb: 'A number of questions ___ raised during the lecture.'",
    category: "Grammar",
    difficulty: "intermediate",
    options: ["was", "were", "is", "has been"],
    answer: "were",
    explanation: "'A number of' takes a plural verb ('were'), whereas 'The number of' takes a singular verb."
  },
  {
    id: 80,
    question: "Select the opposite of 'Vibrant':",
    category: "Vocabulary",
    difficulty: "intermediate",
    options: ["Lively", "Dull", "Bright", "Active"],
    answer: "Dull",
    explanation: "'Vibrant' means full of energy or bright; 'dull' is its opposite."
  },

  // --- ADVANCED (81-120) ---
  {
    id: 81,
    question: "Identify the synonym of 'Ephemeral':",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Eternal", "Fleeting", "Fragile", "Substantial"],
    answer: "Fleeting",
    explanation: "'Ephemeral' means lasting for a very short time; 'Fleeting' is a perfect synonym."
  },
  {
    id: 82,
    question: "Complete the sentence: 'No sooner had she entered the room ___ the phone rang.'",
    category: "Grammar",
    difficulty: "advanced",
    options: ["when", "then", "than", "before"],
    answer: "than",
    explanation: "The correlative structure is 'no sooner... than'."
  },
  {
    id: 83,
    question: "What is the meaning of the idiom 'burn bridges'?",
    category: "Idioms",
    difficulty: "advanced",
    options: ["Destroy connections permanently", "Light fires", "Cross water", "Start a new business"],
    answer: "Destroy connections permanently",
    explanation: "To 'burn bridges' is to act in a way that makes it impossible to return to a previous state or relationship."
  },
  {
    id: 84,
    question: "Select the word spelled correctly:",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Conscientious", "Consciencious", "Consientious", "Conscientous"],
    answer: "Conscientious",
    explanation: "The correct spelling is 'Conscientious', derived from science."
  },
  {
    id: 85,
    question: "Identify the meaning of 'Capricious':",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Steadfast", "Unpredictable", "Spiteful", "Generous"],
    answer: "Unpredictable",
    explanation: "'Capricious' means given to sudden and unaccountable changes of mood or behavior."
  },
  {
    id: 86,
    question: "Complete the clause: 'Had we known about the storm, we ___ our travel plans.'",
    category: "Grammar",
    difficulty: "advanced",
    options: ["altered", "would alter", "would have altered", "had altered"],
    answer: "would have altered",
    explanation: "Inverted conditional clause representing past hypothetical uses third conditional form ('would have altered')."
  },
  {
    id: 87,
    question: "Choose the antonym of 'Benevolent':",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Malevolent", "Kind", "Generous", "Indifferent"],
    answer: "Malevolent",
    explanation: "'Benevolent' means well-meaning and kindly; 'malevolent' means wishing evil to others."
  },
  {
    id: 88,
    question: "What does 'hearing it straight from the horse's mouth' mean?",
    category: "Idioms",
    difficulty: "advanced",
    options: [
      "Hearing a rumor from a friend",
      "Hearing information from the direct source",
      "Translating a message",
      "Speaking with farm animals"
    ],
    answer: "Hearing information from the direct source",
    explanation: "This idiom means getting information directly from the person most authoritative or involved."
  },
  {
    id: 89,
    question: "Identify the grammatical construct: 'Having finished the report, John went home.'",
    category: "Grammar",
    difficulty: "advanced",
    options: ["Gerund phrase", "Participial phrase", "Infinitive phrase", "Prepositional phrase"],
    answer: "Participial phrase",
    explanation: "'Having finished the report' is a perfect active participial phrase modifying 'John'."
  },
  {
    id: 90,
    question: "Select the synonym of 'Taciturn':",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Talkative", "Quiet", "Arrogant", "Polite"],
    answer: "Quiet",
    explanation: "'Taciturn' means reserved or uncommunicative in speech; saying little."
  },
  {
    id: 91,
    question: "Complete: 'She acts as though she ___ the owner of the mansion.'",
    category: "Grammar",
    difficulty: "advanced",
    options: ["is", "was", "were", "has been"],
    answer: "were",
    explanation: "Hypothetical clause introduced by 'as though' uses subjunctive 'were'."
  },
  {
    id: 92,
    question: "What is the meaning of the idiom 'bite the bullet'?",
    category: "Idioms",
    difficulty: "advanced",
    options: [
      "Accept a difficult situation with courage",
      "Injure oneself",
      "Give up under pressure",
      "Attack an enemy"
    ],
    answer: "Accept a difficult situation with courage",
    explanation: "To 'bite the bullet' is to face a painful situation with fortitude."
  },
  {
    id: 93,
    question: "Choose the word that describes 'fear of enclosed spaces':",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Acrophobia", "Agoraphobia", "Claustrophobia", "Hydrophobia"],
    answer: "Claustrophobia",
    explanation: "'Claustrophobia' is the extreme fear of confined places."
  },
  {
    id: 94,
    question: "Complete the sentence: 'The director demanded that the actor ___ the lines immediately.'",
    category: "Grammar",
    difficulty: "advanced",
    options: ["memorize", "memorizes", "memorized", "must memorize"],
    answer: "memorize",
    explanation: "Subjunctive verb form is required after verbs of demanding or recommending ('demanded that he memorize')."
  },
  {
    id: 95,
    question: "Identify the antonym of 'Equivocal':",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Ambiguous", "Clear", "Vague", "Mysterious"],
    answer: "Clear",
    explanation: "'Equivocal' means open to more than one interpretation; ambiguous. Clear is the opposite."
  },
  {
    id: 96,
    question: "Select the error in: 'Whom do you think will win the championship?'",
    category: "Reading",
    difficulty: "advanced",
    options: ["Whom", "think", "win", "championship"],
    answer: "Whom",
    explanation: "It should be 'Who' because it acts as the subject of 'will win'."
  },
  {
    id: 97,
    question: "Choose the correct phrasal verb: 'We need to ___ this problem before it escalates.'",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["nip in the bud", "iron out", "tackle down", "clear away"],
    answer: "iron out",
    explanation: "'Iron out' means to resolve or settle difficulties/problems."
  },
  {
    id: 98,
    question: "What is the meaning of 'a double-edged sword'?",
    category: "Idioms",
    difficulty: "advanced",
    options: [
      "Something that has both benefits and drawbacks",
      "A ancient weapon",
      "A highly dangerous situation",
      "A dual alliance"
    ],
    answer: "Something that has both benefits and drawbacks",
    explanation: "This denotes something that can help you but also has potential to harm."
  },
  {
    id: 99,
    question: "Complete: 'Scarcely ___ started when the power failed.'",
    category: "Grammar",
    difficulty: "advanced",
    options: ["the show had", "had the show", "did the show", "the show did"],
    answer: "had the show",
    explanation: "Negative adverbial 'Scarcely' at the beginning triggers subject-auxiliary inversion ('had the show')."
  },
  {
    id: 100,
    question: "Select the synonym of 'Superfluous':",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Necessary", "Excessive", "Insufficient", "Incomplete"],
    answer: "Excessive",
    explanation: "'Superfluous' means unnecessary, especially through being more than enough (excessive)."
  },
  {
    id: 101,
    question: "Complete the sentence: 'The jury is deliberating, and they ___ to reach a verdict.'",
    category: "Grammar",
    difficulty: "advanced",
    options: ["struggle", "are struggling", "struggles", "is struggling"],
    answer: "are struggling",
    explanation: "Since they is used in the second clause, it refers to members individually, requiring 'are struggling'."
  },
  {
    id: 102,
    question: "What does the idiom 'bark up the wrong tree' mean?",
    category: "Idioms",
    difficulty: "advanced",
    options: [
      "Pursue a mistaken line of thought",
      "Shout at someone",
      "Search for lost items",
      "Chop down wood"
    ],
    answer: "Pursue a mistaken line of thought",
    explanation: "It means to pursue a course of action that will not lead to the desired results."
  },
  {
    id: 103,
    question: "Choose the correct spelling:",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Supercede", "Supersede", "Superseed", "Supersied"],
    answer: "Supersede",
    explanation: "Supersede is spelled with 's' and not 'c'."
  },
  {
    id: 104,
    question: "Fill in: 'I would rather you ___ talk during the lecture.'",
    category: "Grammar",
    difficulty: "advanced",
    options: ["don't", "didn't", "should not", "not"],
    answer: "didn't",
    explanation: "'Would rather' followed by a subject takes a past simple subjunctive form ('didn't') for present reference."
  },
  {
    id: 105,
    question: "Select the synonym of 'Alacrity':",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Reluctance", "Speedy readiness", "Sadness", "Cleverness"],
    answer: "Speedy readiness",
    explanation: "'Alacrity' means brisk and cheerful readiness."
  },
  {
    id: 106,
    question: "Complete: 'The company's failure was attributed to ___ management.'",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["remiss", "inept", "unfit", "careless"],
    answer: "inept",
    explanation: "'Inept' means having or showing no skill; clumsy/incompetent management."
  },
  {
    id: 107,
    question: "What is the meaning of 'a storm in a teacup'?",
    category: "Idioms",
    difficulty: "advanced",
    options: [
      "A minor issue made into a large fuss",
      "A bad weather forecast",
      "An unexpected celebration",
      "A broken glass"
    ],
    answer: "A minor issue made into a large fuss",
    explanation: "This idiom refers to a lot of anger or worry about something trivial."
  },
  {
    id: 108,
    question: "Complete the sentence: 'Lest he ___ fail the exam, he studied day and night.'",
    category: "Grammar",
    difficulty: "advanced",
    options: ["should", "would", "might", "will"],
    answer: "should",
    explanation: "The conjunction 'lest' (meaning 'for fear that') classically takes 'should' or base subjunctive."
  },
  {
    id: 109,
    question: "Identify the synonym of 'Obsequious':",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Rebellious", "Fawning", "Arrogant", "Quiet"],
    answer: "Fawning",
    explanation: "'Obsequious' means obedient or attentive to an excessive or servile degree (fawning)."
  },
  {
    id: 110,
    question: "Choose the correct word: 'The judge was completely ___ and gave a fair trial.'",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["uninterested", "disinterested", "objective", "fairly"],
    answer: "disinterested",
    explanation: "'Disinterested' means impartial and unbiased, whereas 'uninterested' means not caring."
  },
  {
    id: 111,
    question: "What is the meaning of 'spill the tea'?",
    category: "Idioms",
    difficulty: "advanced",
    options: ["Drop hot drinks", "Share gossip", "Clean up a mess", "Prepare breakfast"],
    answer: "Share gossip",
    explanation: "Slang idiom meaning to share interesting gossip or news."
  },
  {
    id: 112,
    question: "Complete the clause: 'It is essential that everyone ___ present at the assembly.'",
    category: "Grammar",
    difficulty: "advanced",
    options: ["is", "be", "are", "should be"],
    answer: "be",
    explanation: "Subjunctive clause triggered by 'essential that' takes base form 'be'."
  },
  {
    id: 113,
    question: "Select the synonym of 'Plausible':",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Unlikely", "Believable", "Bizarre", "Intelligent"],
    answer: "Believable",
    explanation: "'Plausible' means reasonable or probable; believable."
  },
  {
    id: 114,
    question: "Complete the sentence: 'The lawyer tried to ___ a confession from the witness.'",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["elicit", "illicit", "allude", "evade"],
    answer: "elicit",
    explanation: "'Elicit' means to draw out or evoke a response. 'Illicit' means illegal."
  },
  {
    id: 115,
    question: "What is 'a red herring'?",
    category: "Idioms",
    difficulty: "advanced",
    options: [
      "A misleading clue",
      "A delicious seafood",
      "A red flag",
      "A clear warning"
    ],
    answer: "A misleading clue",
    explanation: "A red herring is something that misleads or distracts from a relevant or important question."
  },
  {
    id: 116,
    question: "Complete: '___ had we reached home than the storm broke.'",
    category: "Grammar",
    difficulty: "advanced",
    options: ["Hardly", "No sooner", "Scarcely", "Barely"],
    answer: "No sooner",
    explanation: "'No sooner' couples with 'than'. 'Hardly', 'scarcely' and 'barely' couple with 'when'."
  },
  {
    id: 117,
    question: "Select the synonym of 'Loquacious':",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Quiet", "Talkative", "Brilliant", "Deceptive"],
    answer: "Talkative",
    explanation: "'Loquacious' means tending to talk a great deal; talkative."
  },
  {
    id: 118,
    question: "Choose the correct spelling:",
    category: "Vocabulary",
    difficulty: "advanced",
    options: ["Mischievous", "Mischievous", "Mischevious", "Mischivous"],
    answer: "Mischievous",
    explanation: "The correct spelling is 'Mischievous' (three syllables)."
  },
  {
    id: 119,
    question: "What does 'take the bull by the horns' mean?",
    category: "Idioms",
    difficulty: "advanced",
    options: [
      "Face a difficulty directly and confidently",
      "Participate in a rodeo",
      "Make a rash decision",
      "Flee from danger"
    ],
    answer: "Face a difficulty directly and confidently",
    explanation: "This means dealing with a difficult situation in a very direct and confident way."
  },
  {
    id: 120,
    question: "Complete: 'She was so absorbed ___ her work that she forgot to eat.'",
    category: "Grammar",
    difficulty: "advanced",
    options: ["at", "in", "with", "on"],
    answer: "in",
    explanation: "The correct preposition after 'absorbed' is 'in'."
  }
];

export function CosmicWordVoyager({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  // Game state hooks
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("intermediate");
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [currentQuestions, setCurrentQuestions] = React.useState<SpaceQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [shield, setShield] = React.useState(100);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = React.useState<boolean | null>(null);
  const [shipPosition, setShipPosition] = React.useState<"left" | "center" | "right">("center");
  const [askedQuestions, setAskedQuestions] = React.useState<number[]>([]);
  const [warpMultiplier, setWarpMultiplier] = React.useState(1);

  // References
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const starsRef = React.useRef<{ x: number; y: number; z: number; color: string }[]>([]);

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

  // Keyboard navigation for ship steering
  React.useEffect(() => {
    if (gameState !== "playing" || selectedOption !== null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setShipPosition("left");
      } else if (e.key === "ArrowRight") {
        setShipPosition("right");
      } else if (e.key === "ArrowUp") {
        setShipPosition("center");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, selectedOption]);

  // Starfield simulation on Canvas
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

    // Initialize stars
    const numStars = 150;
    const colors = ["#818cf8", "#a78bfa", "#f472b6", "#22d3ee", "#ffffff"];
    if (starsRef.current.length === 0) {
      for (let i = 0; i < numStars; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width - canvas.width / 2,
          y: Math.random() * canvas.height - canvas.height / 2,
          z: Math.random() * canvas.width,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }

    const animate = () => {
      ctx.fillStyle = "rgba(10, 10, 20, 0.2)"; // Twinkle ghosting trail
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Adjust speed depending on game state
      // During warp drive speed lines are drawn
      const speed = gameState === "warping" ? 25 : 2;

      starsRef.current.forEach((star) => {
        star.z -= speed;

        if (star.z <= 0) {
          star.z = canvas.width;
          star.x = Math.random() * canvas.width - canvas.width / 2;
          star.y = Math.random() * canvas.height - canvas.height / 2;
        }

        const px = (star.x / star.z) * cx + cx;
        const py = (star.y / star.z) * cy + cy;

        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          const size = (1 - star.z / canvas.width) * 4 + 0.5;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.shadowBlur = size * 2;
          ctx.shadowColor = star.color;
          ctx.fill();
          ctx.shadowBlur = 0; // reset

          // Draw stretching warp lines
          if (gameState === "warping") {
            ctx.beginPath();
            const lastZ = star.z + speed;
            const lpx = (star.x / lastZ) * cx + cx;
            const lpy = (star.y / lastZ) * cy + cy;
            ctx.moveTo(px, py);
            ctx.lineTo(lpx, lpy);
            ctx.strokeStyle = star.color;
            ctx.lineWidth = size / 2;
            ctx.stroke();
          }
        }
      });

      // Draw faint space nebulae clouds in background
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(canvas.width, canvas.height));
      grad.addColorStop(0, "rgba(99, 102, 241, 0.05)");
      grad.addColorStop(0.5, "rgba(168, 85, 247, 0.02)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState]);

  // Start Voyage & select difficulty
  const initiateVoyage = () => {
    setGameState("difficulty_select");
  };

  const handleDifficultySelect = (diff: Difficulty) => {
    setDifficulty(diff);
    setScore(0);
    setShield(100);
    setQuestionIndex(0);
    setSelectedOption(null);
    setAnsweredCorrectly(null);
    setShipPosition("center");

    // Filter questions by difficulty and select 10 unique ones
    const pool = QUESTION_DATABASE.filter(q => q.difficulty === diff);
    // Shuffle the pool using dynamic indices
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    
    // Low repetition logic: ensure we don't repeat questions asked in recent rounds
    const unasked = shuffled.filter(q => !askedQuestions.includes(q.id));
    let selected: SpaceQuestion[] = [];
    if (unasked.length >= 10) {
      selected = unasked.slice(0, 10);
    } else {
      // If we don't have enough unasked, reset tracking and take from all
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

  // Answer handler
  const handleAnswerSubmit = (option: string, position: "left" | "center" | "right") => {
    if (selectedOption !== null || gameState !== "playing") return;

    setSelectedOption(option);
    setShipPosition(position);
    const correct = option === currentQuestion.answer;
    setAnsweredCorrectly(correct);

    setTimeout(() => {
      if (correct) {
        setScore(s => s + 10);
        setGameState("warping"); // Warp drive animation active

        // De-escalate warp after 2 seconds and move to next question or end
        setTimeout(() => {
          advanceGame(correct);
        }, 2000);
      } else {
        // Shield takes hit
        setShield(s => {
          const nextShield = s - 20;
          if (nextShield <= 0) {
            setTimeout(() => {
              setGameState("failed");
            }, 1500);
          } else {
            setTimeout(() => {
              advanceGame(correct);
            }, 2500); // Give player time to read explanation
          }
          return Math.max(0, nextShield);
        });
      }
    }, 800);
  };

  const advanceGame = (lastWasCorrect: boolean) => {
    setSelectedOption(null);
    setAnsweredCorrectly(null);
    setShipPosition("center");

    if (questionIndex < 9) {
      setQuestionIndex(i => i + 1);
      setGameState("playing");
    } else {
      // Completed all 10 rounds
      setGameState("finished");
      
      // Award coins via analytics event trigger
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

  const restartGame = () => {
    setGameState("idle");
  };

  return (
    <Card className={cn(
      "w-full transition-all duration-500 flex flex-col relative overflow-hidden select-none border-slate-800/80 bg-slate-950 text-slate-100",
      isFullscreen ? "min-h-screen rounded-none border-none max-w-none justify-center" : "max-w-4xl mx-auto shadow-2xl shadow-indigo-950/20"
    )}>
      {/* Absolute Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0" 
      />

      {/* Top Controls Header */}
      <div className="flex justify-between items-center p-4 border-b border-slate-800/50 z-10 bg-slate-950/70 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-indigo-400" />
          <span className="font-extrabold tracking-wider bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent uppercase text-xs md:text-sm">
            COSMIC WORD VOYAGER
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {gameState === "playing" && (
            <div className="flex items-center gap-4 text-xs md:text-sm font-semibold">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                <Badge variant="outline" className="border-indigo-500/20 text-indigo-400 p-0 text-[10px]">
                  ROUND {questionIndex + 1}/10
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                <Coins className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span className="text-amber-300 font-bold">{score} pts</span>
              </div>

              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-300",
                shield <= 20 ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse" : "bg-slate-900 border-slate-800 text-cyan-400"
              )}>
                <Shield className="h-3.5 w-3.5 fill-current" />
                <span className="font-bold">{shield}%</span>
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
              <div className="relative p-6 bg-indigo-500/10 rounded-full border border-indigo-500/20 shadow-2xl shadow-indigo-500/5 mb-2">
                <Rocket className="h-20 w-20 text-indigo-400 animate-bounce" />
                <div className="absolute inset-0 border border-indigo-400/25 rounded-full scale-125 animate-ping opacity-30" />
              </div>
              
              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  COSMIC WORD VOYAGER
                </h1>
                <p className="text-slate-400 text-sm md:text-base mt-2">
                  Pilot your spacecraft through hypergates by solving language mysteries. Fuel the ship with vocabulary, shield your hull from errors!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-4">
                <Button 
                  onClick={() => setGameState("instructions")} 
                  className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-extrabold uppercase rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/20"
                >
                  Initiate Voyage
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
                <Badge className="bg-indigo-500/20 border-indigo-500/30 text-indigo-300 font-bold uppercase tracking-wider mb-2">
                  FLIGHT INSTRUCTION MANUAL
                </Badge>
                <h2 className="text-2xl md:text-3xl font-black uppercase text-foreground">Mission Briefing</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
                <div className="flex gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                  <Rocket className="h-8 w-8 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold uppercase text-slate-200 text-xs tracking-wider mb-1">STEER THE VESSEL</h4>
                    <p className="text-slate-400 leading-relaxed text-xs">
                      Fly towards the portal card that holds the correct answer. Use your **mouse/clicks** or steer using **Arrow Keys** (Left / Up / Right).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                  <Shield className="h-8 w-8 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold uppercase text-slate-200 text-xs tracking-wider mb-1">PROTECT YOUR HULL</h4>
                    <p className="text-slate-400 leading-relaxed text-xs">
                      Each mistake inflicts 20% shield damage. If shields hit 0%, the spacecraft will break apart and the mission is failed.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                  <Sparkles className="h-8 w-8 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold uppercase text-slate-200 text-xs tracking-wider mb-1">WARP SPEEDS</h4>
                    <p className="text-slate-400 leading-relaxed text-xs">
                      Correct responses activate your ship's hyperdrive engine, speeding through the cosmos and earning 10 Lingo-Coins.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                  <AlertTriangle className="h-8 w-8 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold uppercase text-slate-200 text-xs tracking-wider mb-1">ZERO REPETITION</h4>
                    <p className="text-slate-400 leading-relaxed text-xs">
                      Our navigation mainframe ensures you will never receive repeating vocabulary coordinates during your flight.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800/40 pt-4 mt-2">
                <Button 
                  variant="ghost" 
                  onClick={restartGame}
                  className="font-bold uppercase text-slate-400 hover:text-slate-200"
                >
                  Abort
                </Button>
                <Button 
                  onClick={() => setGameState("difficulty_select")} 
                  className="h-12 px-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-extrabold uppercase rounded-xl hover:opacity-90 transition-all shadow-md shadow-indigo-500/10"
                >
                  Select Sector
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
                <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">COSMIC SECTORS</span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mt-1 text-foreground">CHOOSE CHALLENGE SPEED</h2>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                {(["beginner", "intermediate", "advanced"] as Difficulty[]).map((level) => (
                  <Button
                    key={level}
                    onClick={() => handleDifficultySelect(level)}
                    className={cn(
                      "h-16 text-sm md:text-base font-extrabold uppercase tracking-widest rounded-xl transition-all border border-slate-800 hover:scale-[1.02] shadow-lg",
                      level === "beginner" && "bg-slate-950 text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/[0.03]",
                      level === "intermediate" && "bg-slate-950 text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/[0.03]",
                      level === "advanced" && "bg-slate-950 text-pink-400 hover:border-pink-500/30 hover:bg-pink-500/[0.03]"
                    )}
                  >
                    {level} Sector
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

          {/* 4. GAMEPLAY PLAYING / ANSWERED */}
          {(gameState === "playing" || gameState === "warping") && currentQuestion && (
            <motion.div 
              key="gameplay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col gap-6 items-center"
            >
              {/* Question Definition Card */}
              <div className="w-full max-w-3xl bg-slate-900/60 border border-slate-800/80 p-5 md:p-6 rounded-2xl backdrop-blur-md text-center shadow-lg relative">
                <Badge className="absolute -top-3 left-6 bg-slate-800 border-slate-700 text-indigo-300 font-extrabold uppercase text-[9px] tracking-wider py-0.5 px-3">
                  {currentQuestion.category}
                </Badge>
                
                <h3 className="text-lg md:text-xl font-bold leading-relaxed text-slate-200 mt-2">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Space Arena (Canvas overlays ship and drifting portals) */}
              <div className="w-full max-w-3xl relative h-[240px] md:h-[280px] bg-slate-950/40 border border-slate-900/60 rounded-3xl overflow-hidden flex items-center justify-center shadow-inner">
                {/* Space Gridlines for depth perception */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950/10 to-transparent z-0 pointer-events-none" />

                {/* Warp streak lines during warping */}
                {gameState === "warping" && (
                  <div className="absolute inset-0 z-0 bg-indigo-500/[0.01] animate-pulse pointer-events-none flex flex-col items-center justify-center">
                    <span className="text-indigo-400/25 font-black uppercase text-[12vw] select-none tracking-widest scale-110">
                      WARP SPEED
                    </span>
                  </div>
                )}

                {/* Incorrect Answer Warning */}
                {selectedOption !== null && !answeredCorrectly && (
                  <div className="absolute inset-0 bg-red-950/15 border-2 border-red-500/20 z-0 animate-pulse pointer-events-none flex items-center justify-center flex-col">
                    <AlertTriangle className="h-12 w-12 text-red-500 animate-bounce mb-2" />
                    <span className="text-red-500 font-extrabold tracking-widest text-xs uppercase animate-pulse">
                      COLLISION ALERT: SHIELD INTEGRITY COMPROMISED
                    </span>
                  </div>
                )}

                {/* Spaceship Representation */}
                <motion.div
                  animate={{
                    x: shipPosition === "left" ? -140 : shipPosition === "right" ? 140 : 0,
                    y: selectedOption !== null && answeredCorrectly ? -100 : 0,
                    scale: selectedOption !== null && answeredCorrectly ? 0.3 : 1,
                    rotate: shipPosition === "left" ? -15 : shipPosition === "right" ? 15 : 0
                  }}
                  transition={{ type: "spring", stiffness: 120, damping: 14 }}
                  className="absolute bottom-6 z-10 flex flex-col items-center cursor-pointer"
                >
                  <div className="relative">
                    {/* Glowing thruster flames */}
                    <div className={cn(
                      "absolute -bottom-4 left-1/2 -translate-x-1/2 w-4 h-6 bg-cyan-400 rounded-full blur-md animate-pulse",
                      gameState === "warping" ? "h-14 w-8 bg-indigo-400 blur-lg scale-y-150" : ""
                    )} />
                    
                    {/* Retro-futuristic SVG Spaceship */}
                    <svg className="w-14 h-14 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M32 4L18 36L32 28L46 36L32 4Z" fill="#e2e8f0" stroke="#818cf8" strokeWidth="2" strokeLinejoin="round"/>
                      <path d="M32 28V60" stroke="#22d3ee" strokeWidth="3"/>
                      <circle cx="32" cy="20" r="4" fill="#22d3ee"/>
                      {/* Shield perimeter indicator */}
                      <path d="M10 40C10 20 20 12 32 12C44 12 54 20 54 40" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1" strokeDasharray="3 3"/>
                    </svg>
                  </div>
                </motion.div>
              </div>

              {/* Explanatory Overlay (Show on incorrect response) */}
              {selectedOption !== null && !answeredCorrectly && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-3xl bg-red-950/20 border border-red-900/40 rounded-xl p-4 text-center text-xs md:text-sm text-red-300"
                >
                  <strong className="uppercase font-bold tracking-widest text-[10px] bg-red-900/40 px-2 py-0.5 rounded text-red-200 mr-2">
                    Incorrect Gate
                  </strong>
                  {currentQuestion.explanation}
                </motion.div>
              )}

              {/* Portal Hypergates Options (Drifting cards) */}
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
                      onClick={() => handleAnswerSubmit(opt, pos)}
                      className={cn(
                        "h-20 md:h-24 rounded-2xl border-2 backdrop-blur-md transition-all duration-300 font-extrabold text-sm md:text-base flex flex-col items-center justify-center p-3 relative shadow-lg hover:-translate-y-1 active:translate-y-0",
                        // Idle styles
                        "bg-slate-900/50 border-slate-800 text-slate-200 hover:bg-indigo-500/10 hover:border-indigo-500/40 hover:shadow-indigo-500/5",
                        // Selection states
                        isSelected && isCorrectAnswer && "bg-green-500/20 border-green-500 text-green-300 shadow-green-500/10 scale-105",
                        isSelected && !isCorrectAnswer && "bg-red-500/20 border-red-500 text-red-300 shadow-red-500/10 scale-[0.98]",
                        selectedOption !== null && !isSelected && isCorrectAnswer && "bg-green-500/15 border-green-500/50 text-green-300",
                        selectedOption !== null && !isSelected && !isCorrectAnswer && "opacity-40"
                      )}
                    >
                      <span className="text-[10px] font-black uppercase text-indigo-400/70 tracking-widest absolute top-2">
                        PORTAL {idx + 1}
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
                  SYSTEM DOCKED SUCCESSFULLY
                </Badge>
                <h2 className="text-3xl font-black uppercase tracking-tight mt-2 text-foreground">Mission Complete</h2>
                <p className="text-slate-400 text-xs mt-1">
                  You have successfully navigated through all 10 space sectors!
                </p>
              </div>

              <div className="w-full grid grid-cols-2 gap-3 py-4 border-y border-slate-800/60">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warp Score</span>
                  <p className="text-2xl font-black text-indigo-400 mt-1">{score} pts</p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hull Integrity</span>
                  <p className={cn(
                    "text-2xl font-black mt-1",
                    shield <= 40 ? "text-red-400" : "text-cyan-400"
                  )}>{shield}%</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <Button 
                  onClick={restartGame}
                  className="h-12 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-extrabold uppercase rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" /> Restart Simulation
                </Button>
                <Button 
                  variant="outline"
                  asChild
                  className="h-12 border-slate-800 hover:bg-slate-900 rounded-xl"
                >
                  <Link href="/games">Return to Command</Link>
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
                  SPACECRAFT DESTRUCTED
                </Badge>
                <h2 className="text-3xl font-black uppercase tracking-tight mt-2 text-foreground">Mission Failed</h2>
                <p className="text-slate-400 text-xs mt-1">
                  Space shields collapsed due to excessive navigation collisions.
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 w-full text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sectors Traveled</span>
                <p className="text-2xl font-black text-red-400 mt-1">{questionIndex}/10 Sectors</p>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <Button 
                  onClick={restartGame}
                  className="h-12 bg-red-600 text-white font-extrabold uppercase rounded-xl hover:bg-red-500 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" /> Try Again
                </Button>
                <Button 
                  variant="outline"
                  asChild
                  className="h-12 border-slate-800 hover:bg-slate-900 rounded-xl"
                >
                  <Link href="/games">Abort Mission</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      {/* Footer Details */}
      <CardFooter className="flex justify-between items-center border-t border-slate-800/30 p-4 bg-slate-950/50 backdrop-blur-sm z-10 text-[10px] md:text-xs text-slate-500">
        <span>Sector Level: <span className="uppercase text-slate-400 font-bold">{difficulty}</span></span>
        <span>Steer: <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400 text-[9px]">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400 text-[9px]">↑</kbd> <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400 text-[9px]">→</kbd> or mouse-clicks</span>
      </CardFooter>
    </Card>
  );
}
