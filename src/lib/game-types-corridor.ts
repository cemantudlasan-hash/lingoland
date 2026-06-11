export interface Question {
  id: string;
  category: string;
  prompt: string;
  options: [string, string, string]; // exactly 3 options for the 3 lanes
  correctIdx: number; // 0, 1, or 2
  explanation: string;
}

export interface Team {
  id: string;
  name: string;
  score: number;
  multiplier: number;
  questionsAnswered: number;
  correctAnswers: number;
}

export interface GameConfig {
  speed: number; // 1 to 5 (e.g. 1 = slow, 3 = normal, 5 = hyper)
  duration: number; // in seconds, e.g. 120
  invincible: boolean; // boolean bypasses game over on health = 0
  activeQuestions: Question[];
  currentTeamId: string | null;
  startingLives?: number;
  lifeLossPerMistake?: number;
  continueOnZeroHealth?: boolean;
}

export interface AnswerRecord {
  questionPrompt: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  questionIndex: number;
}

export const PRESET_CATEGORIES = [
  {
    name: "Parts of Speech",
    desc: "Identify Nouns, Verbs, Adjectives, and Adverbs under time pressure",
    questions: [
      {
        id: "pos-1",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'The SUN is shining brightly.'",
        options: ["Noun", "Verb", "Adjective"],
        correctIdx: 0,
        explanation: "'Sun' is a person, place, thing, or idea, which is a noun."
      },
      {
        id: "pos-2",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'She SINGING elegantly.'",
        options: ["Adverb", "Noun", "Verb"],
        correctIdx: 2,
        explanation: "'Singing' is an action word, which represents a verb."
      },
      {
        id: "pos-3",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'He ran QUICKLY to the park.'",
        options: ["Adjective", "Adverb", "Conjunction"],
        correctIdx: 1,
        explanation: "'Quickly' describes the verb 'ran', so it is an adverb."
      },
      {
        id: "pos-4",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'They live in a BEAUTIFUL castle.'",
        options: ["Verb", "Pronoun", "Adjective"],
        correctIdx: 2,
        explanation: "'Beautiful' describes the noun 'castle', so it is an adjective."
      },
      {
        id: "pos-5",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'Ouch! That hot plate BURNT my finger.'",
        options: ["Verb", "Preposition", "Noun"],
        correctIdx: 0,
        explanation: "'Burnt' denotes the action, making it a verb."
      }
    ] as Question[]
  },
  {
    name: "Grammar Repair",
    desc: "Correct auxiliary verbs, tenses, subject-verb agreements, and pronouns",
    questions: [
      {
        id: "gram-1",
        category: "Grammar Repair",
        prompt: "Complete the sentence: 'Neither of the students ___ completed the essay.'",
        options: ["have", "has", "are"],
        correctIdx: 1,
        explanation: "'Neither' is a singular pronoun and takes the singular verb 'has'."
      },
      {
        id: "gram-2",
        category: "Grammar Repair",
        prompt: "Complete the sentence: 'By next December, we ___ in this city for ten years.'",
        options: ["will have lived", "had lived", "will be living"],
        correctIdx: 0,
        explanation: "The future perfect 'will have lived' is used for an action completed by a specific future point."
      },
      {
        id: "gram-3",
        category: "Grammar Repair",
        prompt: "Choose the correct sentence:",
        options: [
          "Whom wrote this letter?",
          "Who wrote this letter?",
          "Whose wrote this letter?"
        ],
        correctIdx: 1,
        explanation: "'Who' is the subject pronoun. 'Who wrote this letter?' is correct."
      },
      {
        id: "gram-4",
        category: "Grammar Repair",
        prompt: "Complete the sentence: 'I could ___ written a better response if I had more time.'",
        options: ["have", "of", "had"],
        correctIdx: 0,
        explanation: "Its grammatically 'could have' (often shortened to could've) and never 'could of'."
      },
      {
        id: "gram-5",
        category: "Grammar Repair",
        prompt: "Identify the grammatical error: 'Each dog are wearing a colorful collar.'",
        options: ["Each", "are", "wearing"],
        correctIdx: 1,
        explanation: "'Each' is singular. The verb should be 'is' instead of 'are'."
      }
    ] as Question[]
  },
  {
    name: "Synonyms & Antonyms",
    desc: "Test advanced lexical meaning, synonyms, and context matches",
    questions: [
      {
        id: "voc-1",
        category: "Vocabulary",
        prompt: "Find the SYNONYM of the word: 'OBSTINATE'",
        options: ["Pliable", "Stubborn", "Intelligent"],
        correctIdx: 1,
        explanation: "'Obstinate' means stubborn or refusing to change one's opinion."
      },
      {
        id: "voc-2",
        category: "Vocabulary",
        prompt: "Find the ANTONYM of the word: 'EPHEMERAL'",
        options: ["Permanent", "Transitional", "Fragile"],
        correctIdx: 0,
        explanation: "'Ephemeral' means short-lived. The opposite is permanent."
      },
      {
        id: "voc-3",
        category: "Vocabulary",
        prompt: "Find the SYNONYM of the word: 'ALACRITY'",
        options: ["Sluggishness", "Skeptical", "Eagerness"],
        correctIdx: 2,
        explanation: "'Alacrity' means cheerful readiness or eagerness."
      },
      {
        id: "voc-4",
        category: "Vocabulary",
        prompt: "Find the ANTONYM of the word: 'CACOPHONY'",
        options: ["Harmony", "Clatter", "Symphonious"],
        correctIdx: 0,
        explanation: "'Cacophony' is a harsh mixture of sounds. The opposite is harmony."
      },
      {
        id: "voc-5",
        category: "Vocabulary",
        prompt: "Find the SYNONYM of the word: 'METICULOUS'",
        options: ["Careless", "Precise", "Slothful"],
        correctIdx: 1,
        explanation: "'Meticulous' means showing great attention to detail; precise."
      }
    ] as Question[]
  }
];
