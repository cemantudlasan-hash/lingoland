export interface Question {
  id: string;
  category: string;
  prompt: string;
  options: [string, string, string]; // exactly 3 options for the 3 lanes
  correctIdx: number; // 0, 1, or 2
  explanation: string;
  difficulty?: "easy" | "medium" | "hard";
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
    desc: "Identify Nouns, Verbs, Adjectives, Adverbs, Prepositions, and Conjunctions",
    questions: [
      // Easy
      {
        id: "pos-easy-1",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'The SUN is shining brightly.'",
        options: ["Noun", "Verb", "Adjective"],
        correctIdx: 0,
        explanation: "'Sun' is a person, place, thing, or idea, which is a noun.",
        difficulty: "easy"
      },
      {
        id: "pos-easy-2",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'We RAN to the cyber library.'",
        options: ["Noun", "Verb", "Adverb"],
        correctIdx: 1,
        explanation: "'Ran' denotes the physical action, which is a verb.",
        difficulty: "easy"
      },
      {
        id: "pos-easy-3",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'They live in a BEAUTIFUL castle.'",
        options: ["Verb", "Pronoun", "Adjective"],
        correctIdx: 2,
        explanation: "'Beautiful' describes the noun 'castle', so it is an adjective.",
        difficulty: "easy"
      },
      {
        id: "pos-easy-4",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'The active DOG barked loudly.'",
        options: ["Noun", "Verb", "Adverb"],
        correctIdx: 0,
        explanation: "'Dog' is a living entity, representing a noun.",
        difficulty: "easy"
      },
      {
        id: "pos-easy-5",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'I will write the code TOMORROW.'",
        options: ["Noun", "Adverb", "Adjective"],
        correctIdx: 1,
        explanation: "'Tomorrow' describes when the action will happen, making it an adverb.",
        difficulty: "easy"
      },
      // Medium
      {
        id: "pos-med-1",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'He ran QUICKLY to the park.'",
        options: ["Adjective", "Adverb", "Conjunction"],
        correctIdx: 1,
        explanation: "'Quickly' describes the verb 'ran', so it is an adverb.",
        difficulty: "medium"
      },
      {
        id: "pos-med-2",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'Ouch! That hot plate BURNT my finger.'",
        options: ["Verb", "Preposition", "Noun"],
        correctIdx: 0,
        explanation: "'Burnt' denotes the action, making it a verb.",
        difficulty: "medium"
      },
      {
        id: "pos-med-3",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'A DILIGENT student studied silently.'",
        options: ["Noun", "Verb", "Adjective"],
        correctIdx: 2,
        explanation: "'Diligent' describes the noun 'student', making it an adjective.",
        difficulty: "medium"
      },
      {
        id: "pos-med-4",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'They stood UNDER the holographic bridge.'",
        options: ["Conjunction", "Preposition", "Noun"],
        correctIdx: 1,
        explanation: "'Under' indicates the spatial relationship, making it a preposition.",
        difficulty: "medium"
      },
      {
        id: "pos-med-5",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'She wanted to run, BUT it was too dark.'",
        options: ["Conjunction", "Adjective", "Verb"],
        correctIdx: 0,
        explanation: "'But' connects two independent clauses, representing a conjunction.",
        difficulty: "medium"
      },
      // Hard
      {
        id: "pos-hard-1",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'The team worked together, ALTHOUGH they were tired.'",
        options: ["Preposition", "Conjunction", "Adverb"],
        correctIdx: 1,
        explanation: "'Although' is a subordinating conjunction introducing a concession clause.",
        difficulty: "hard"
      },
      {
        id: "pos-hard-2",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'Her singing was EXTREMELY beautiful.'",
        options: ["Adjective", "Noun", "Adverb"],
        correctIdx: 2,
        explanation: "'Extremely' modifies the adjective 'beautiful', so it is an adverb.",
        difficulty: "hard"
      },
      {
        id: "pos-hard-3",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'WHICH path shall we choose?'",
        options: ["Pronoun", "Conjunction", "Preposition"],
        correctIdx: 0,
        explanation: "'Which' stands as an interrogative pronoun in this structure.",
        difficulty: "hard"
      },
      {
        id: "pos-hard-4",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'This is a WELL-BEHAVED puppy.'",
        options: ["Verb", "Noun", "Adjective"],
        correctIdx: 2,
        explanation: "'Well-behaved' is a compound descriptor qualifying the noun 'puppy', making it an adjective.",
        difficulty: "hard"
      },
      {
        id: "pos-hard-5",
        category: "Parts of Speech",
        prompt: "Identify the word type: 'She HERSELF resolved the security breach.'",
        options: ["Verb", "Pronoun", "Adjective"],
        correctIdx: 1,
        explanation: "'Herself' is an intensive pronoun emphasizing the subject 'She'.",
        difficulty: "hard"
      }
    ] as Question[]
  },
  {
    name: "Grammar Repair",
    desc: "Correct auxiliary verbs, tenses, subject-verb agreements, and pronouns",
    questions: [
      // Easy
      {
        id: "gram-easy-1",
        category: "Grammar Repair",
        prompt: "Identify the correct error fix: 'Each dog are wearing a colorful collar.'",
        options: ["Each dog is", "Each dogs are", "Each dog be"],
        correctIdx: 0,
        explanation: "'Each' is singular. The verb should be 'is' instead of 'are'.",
        difficulty: "easy"
      },
      {
        id: "gram-easy-2",
        category: "Grammar Repair",
        prompt: "Complete the sentence: 'She ___ to the cyber school every morning.'",
        options: ["go", "goes", "going"],
        correctIdx: 1,
        explanation: "Third-person singular 'She' requires the singular verb 'goes'.",
        difficulty: "easy"
      },
      {
        id: "gram-easy-3",
        category: "Grammar Repair",
        prompt: "Complete the sentence: 'They ___ playing robotic soccer yesterday.'",
        options: ["was", "is", "were"],
        correctIdx: 2,
        explanation: "Plural subject 'They' in the past continuous requires 'were'.",
        difficulty: "easy"
      },
      {
        id: "gram-easy-4",
        category: "Grammar Repair",
        prompt: "Complete the sentence: 'He does not ___ any virtual credits.'",
        options: ["have", "has", "having"],
        correctIdx: 0,
        explanation: "The auxiliary verb 'does' is followed by the base form 'have'.",
        difficulty: "easy"
      },
      {
        id: "gram-easy-5",
        category: "Grammar Repair",
        prompt: "Complete the sentence: 'We have already ___ our power capsules.'",
        options: ["eat", "eaten", "ate"],
        correctIdx: 1,
        explanation: "Present perfect tense uses 'have' + past participle 'eaten'.",
        difficulty: "easy"
      },
      // Medium
      {
        id: "gram-med-1",
        category: "Grammar Repair",
        prompt: "Complete the sentence: 'Neither of the students ___ completed the essay.'",
        options: ["have", "has", "are"],
        correctIdx: 1,
        explanation: "'Neither' is a singular indefinite pronoun and takes the singular verb 'has'.",
        difficulty: "medium"
      },
      {
        id: "gram-med-2",
        category: "Grammar Repair",
        prompt: "Complete the sentence: 'I could ___ written a better response if I had more time.'",
        options: ["have", "of", "had"],
        correctIdx: 0,
        explanation: "It is grammatically 'could have' (or 'could've'), never 'could of'.",
        difficulty: "medium"
      },
      {
        id: "gram-med-3",
        category: "Grammar Repair",
        prompt: "Complete the sentence: 'The symphony of strings ___ beautiful.'",
        options: ["is", "are", "were"],
        correctIdx: 0,
        explanation: "The singular subject is 'symphony', so the verb should be singular: 'is'.",
        difficulty: "medium"
      },
      {
        id: "gram-med-4",
        category: "Complete the sentence: 'Between you and ___, this is a secret.'",
        options: ["I", "we", "me"],
        correctIdx: 2,
        explanation: "Prepositions like 'between' take object pronouns like 'me'.",
        difficulty: "medium"
      },
      {
        id: "gram-med-5",
        category: "Grammar Repair",
        prompt: "Complete the sentence: 'The team ___ practicing their individual routines.'",
        options: ["is", "are", "was"],
        correctIdx: 1,
        explanation: "When members of a collective noun act individually ('their routines'), a plural verb 'are' is used.",
        difficulty: "medium"
      },
      // Hard
      {
        id: "gram-hard-1",
        category: "Grammar Repair",
        prompt: "Complete the sentence: 'By next December, we ___ in this city for ten years.'",
        options: ["will have lived", "had lived", "will be living"],
        correctIdx: 0,
        explanation: "The future perfect 'will have lived' is used for an action completed by a specific future point.",
        difficulty: "hard"
      },
      {
        id: "gram-hard-2",
        category: "Grammar Repair",
        prompt: "Choose the grammatically correct sentence:",
        options: ["Whom wrote this letter?", "Who wrote this letter?", "Whose wrote this letter?"],
        correctIdx: 1,
        explanation: "'Who' is the subject pronoun. 'Who wrote' is correct.",
        difficulty: "hard"
      },
      {
        id: "gram-hard-3",
        category: "Grammar Repair",
        prompt: "Complete the sentence: 'If I ___ in your position, I would activate shields.'",
        options: ["was", "were", "would be"],
        correctIdx: 1,
        explanation: "Subjunctive mood uses 'were' for imaginary or hypothetical situations.",
        difficulty: "hard"
      },
      {
        id: "gram-hard-4",
        category: "Grammar Repair",
        prompt: "Complete the sentence: 'She is the pilot ___ I trust the most.'",
        options: ["who", "whom", "which"],
        correctIdx: 1,
        explanation: "'Whom' is correct as it acts as the object of the verb 'trust'.",
        difficulty: "hard"
      },
      {
        id: "gram-hard-5",
        category: "Grammar Repair",
        prompt: "Complete the sentence: 'Hardly had he arrived ___ the alarm went off.'",
        options: ["when", "than", "then"],
        correctIdx: 0,
        explanation: "'Hardly... when' is the correct correlative adverbial structure.",
        difficulty: "hard"
      }
    ] as Question[]
  },
  {
    name: "Synonyms & Antonyms",
    desc: "Test lexical meaning, synonyms, and antonyms under pressure",
    questions: [
      // Easy
      {
        id: "voc-easy-1",
        category: "Vocabulary",
        prompt: "Find the SYNONYM of the word: 'HAPPY'",
        options: ["Sad", "Joyful", "Angry"],
        correctIdx: 1,
        explanation: "'Happy' and 'joyful' are synonyms representing a positive emotion.",
        difficulty: "easy"
      },
      {
        id: "voc-easy-2",
        category: "Vocabulary",
        prompt: "Find the ANTONYM of the word: 'DARK'",
        options: ["Light", "Black", "Shadowy"],
        correctIdx: 0,
        explanation: "The direct opposite of 'dark' is 'light'.",
        difficulty: "easy"
      },
      {
        id: "voc-easy-3",
        category: "Vocabulary",
        prompt: "Find the SYNONYM of the word: 'LARGE'",
        options: ["Tiny", "Short", "Huge"],
        correctIdx: 2,
        explanation: "'Huge' is a synonym for 'large'.",
        difficulty: "easy"
      },
      {
        id: "voc-easy-4",
        category: "Vocabulary",
        prompt: "Find the ANTONYM of the word: 'FAST'",
        options: ["Quick", "Slow", "Rapid"],
        correctIdx: 1,
        explanation: "The opposite of moving 'fast' is moving 'slow'.",
        difficulty: "easy"
      },
      {
        id: "voc-easy-5",
        category: "Vocabulary",
        prompt: "Find the SYNONYM of the word: 'START'",
        options: ["Begin", "Finish", "Stop"],
        correctIdx: 0,
        explanation: "'Begin' is a synonym of 'start'.",
        difficulty: "easy"
      },
      // Medium
      {
        id: "voc-med-1",
        category: "Vocabulary",
        prompt: "Find the SYNONYM of the word: 'ABUNDANT'",
        options: ["Scarce", "Plentiful", "Rare"],
        correctIdx: 1,
        explanation: "'Abundant' means existing or available in large quantities; plentiful.",
        difficulty: "medium"
      },
      {
        id: "voc-med-2",
        category: "Vocabulary",
        prompt: "Find the ANTONYM of the word: 'VIBRANT'",
        options: ["Dull", "Bright", "Colorful"],
        correctIdx: 0,
        explanation: "'Vibrant' means full of energy or color. The opposite is dull.",
        difficulty: "medium"
      },
      {
        id: "voc-med-3",
        category: "Vocabulary",
        prompt: "Find the SYNONYM of the word: 'METICULOUS'",
        options: ["Careless", "Precise", "Slothful"],
        correctIdx: 1,
        explanation: "'Meticulous' means showing extreme care and precision.",
        difficulty: "medium"
      },
      {
        id: "voc-med-4",
        category: "Vocabulary",
        prompt: "Find the ANTONYM of the word: 'GREGARIOUS'",
        options: ["Sociable", "Outspoken", "Introverted"],
        correctIdx: 2,
        explanation: "'Gregarious' means sociable or fond of company. The antonym is introverted.",
        difficulty: "medium"
      },
      {
        id: "voc-med-5",
        category: "Vocabulary",
        prompt: "Find the SYNONYM of the word: 'CANDID'",
        options: ["Deceitful", "Honest", "Evasive"],
        correctIdx: 1,
        explanation: "'Candid' means straightforward, truth-telling, or honest.",
        difficulty: "medium"
      },
      // Hard
      {
        id: "voc-hard-1",
        category: "Vocabulary",
        prompt: "Find the SYNONYM of the word: 'OBSTINATE'",
        options: ["Pliable", "Stubborn", "Intelligent"],
        correctIdx: 1,
        explanation: "'Obstinate' means stubborn or refusing to change one's mind.",
        difficulty: "hard"
      },
      {
        id: "voc-hard-2",
        category: "Vocabulary",
        prompt: "Find the ANTONYM of the word: 'EPHEMERAL'",
        options: ["Permanent", "Transitional", "Fragile"],
        correctIdx: 0,
        explanation: "'Ephemeral' means short-lived. The exact opposite antonym is permanent.",
        difficulty: "hard"
      },
      {
        id: "voc-hard-3",
        category: "Vocabulary",
        prompt: "Find the SYNONYM of the word: 'ALACRITY'",
        options: ["Sluggishness", "Skeptical", "Eagerness"],
        correctIdx: 2,
        explanation: "'Alacrity' represents an enthusiastic eagerness or readiness.",
        difficulty: "hard"
      },
      {
        id: "voc-hard-4",
        category: "Vocabulary",
        prompt: "Find the ANTONYM of the word: 'CACOPHONY'",
        options: ["Harmony", "Clatter", "Symphonious"],
        correctIdx: 0,
        explanation: "'Cacophony' is a harsh, discordant mixture of sounds. The opposite is harmony.",
        difficulty: "hard"
      },
      {
        id: "voc-hard-5",
        category: "Vocabulary",
        prompt: "Find the SYNONYM of the word: 'FASTIDIOUS'",
        options: ["Easygoing", "Meticulous", "Untidy"],
        correctIdx: 1,
        explanation: "'Fastidious' means very attentive to detail and cleanliness; meticulous is a synonym.",
        difficulty: "hard"
      }
    ] as Question[]
  }
];
