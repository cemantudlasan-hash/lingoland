import { Question } from "../types";

// Dynamic pools for various grammar/word challenges

interface WordPOS {
  sentence: string;
  word: string;
  options: [string, string, string]; // exactly 3 choices
  correctIdx: number;
  explanation: string;
}

const PARTS_OF_SPEECH: WordPOS[] = [
  {
    sentence: "The SUN is shining brightly.",
    word: "SUN",
    options: ["Noun", "Verb", "Adjective"],
    correctIdx: 0,
    explanation: "'Sun' represents a noun because it represents a thing/entity."
  },
  {
    sentence: "She SINGING elegantly in the concert.",
    word: "SINGING",
    options: ["Adverb", "Noun", "Verb"],
    correctIdx: 2,
    explanation: "'Singing' is an action word representing a verb."
  },
  {
    sentence: "He ran QUICKLY to catch the school bus.",
    word: "QUICKLY",
    options: ["Adjective", "Adverb", "Conjunction"],
    correctIdx: 1,
    explanation: "'Quickly' is an adverb because it modifies the action verb 'ran'."
  },
  {
    sentence: "They live in a BEAUTIFUL cyber castle.",
    word: "BEAUTIFUL",
    options: ["Verb", "Pronoun", "Adjective"],
    correctIdx: 2,
    explanation: "'Beautiful' is an adjective since it describes the noun 'castle'."
  },
  {
    sentence: "Ouch! The hot burner BURNT my index finger.",
    word: "BURNT",
    options: ["Verb", "Preposition", "Noun"],
    correctIdx: 0,
    explanation: "'Burnt' denotes the core action of the sentence, making it a verb."
  },
  {
    sentence: "A DILIGENT student studied quietly in the cyber library.",
    word: "DILIGENT",
    options: ["Noun", "Adjective", "Verb"],
    correctIdx: 1,
    explanation: "'Diligent' describes the noun 'student', making it an adjective."
  },
  {
    sentence: "They are playing soccer OUTSIDE in the field.",
    word: "OUTSIDE",
    options: ["Adverb", "Noun", "Pronoun"],
    correctIdx: 0,
    explanation: "'Outside' describes where they are playing, which makes it an adverb."
  },
  {
    sentence: "The chef CAREFULLY chopped the fresh garlic.",
    word: "CAREFULLY",
    options: ["Adjective", "Preposition", "Adverb"],
    correctIdx: 2,
    explanation: "'Carefully' modifies how the garlic is chopped, so it is an adverb."
  },
  {
    sentence: "Knowledge is a POWERFUL cyber tool.",
    word: "POWERFUL",
    options: ["Adjective", "Noun", "Prereq"],
    correctIdx: 0,
    explanation: "'Powerful' describes the noun 'tool', making it an adjective."
  },
  {
    sentence: "A MYSTERIOUS visitor tapped on the glass viewport.",
    word: "MYSTERIOUS",
    options: ["Verb", "Adjective", "Adverb"],
    correctIdx: 1,
    explanation: "'Mysterious' is an adjective, qualifying the visitor."
  },
  {
    sentence: "The wild wind BLEW fiercely across the plain.",
    word: "BLEW",
    options: ["Verb", "Noun", "Preposition"],
    correctIdx: 0,
    explanation: "'Blew' is the past-tense action of the wind, representing a verb."
  },
  {
    sentence: "He placed the delicate VASE gently down.",
    word: "VASE",
    options: ["Verb", "Adverb", "Noun"],
    correctIdx: 2,
    explanation: "'Vase' is a concrete object, which is a noun."
  }
];

interface WordConcept {
  word: string;
  correct: string;
  distractors: [string, string];
  explanation: string;
}

const SYNONYMS: WordConcept[] = [
  {
    word: "OBSTINATE",
    correct: "Stubborn",
    distractors: ["Pliable", "Intelligent"],
    explanation: "'Obstinate' means stubborn or refusing to change one's mind."
  },
  {
    word: "ALACRITY",
    correct: "Eagerness",
    distractors: ["Sluggishness", "Skeptical"],
    explanation: "'Alacrity' represents an enthusiastic eagerness or readiness."
  },
  {
    word: "METICULOUS",
    correct: "Precise",
    distractors: ["Careless", "Slothful"],
    explanation: "'Meticulous' means showing extreme care and precision."
  },
  {
    word: "ABUNDANT",
    correct: "Plentiful",
    distractors: ["Scarce", "Sparse"],
    explanation: "'Abundant' means existing or available in large quantities; plentiful."
  },
  {
    word: "CANDID",
    correct: "Honest",
    distractors: ["Deceitful", "Evasive"],
    explanation: "'Candid' means straightforward, truth-telling, or honest."
  },
  {
    word: "DUBIOUS",
    correct: "Doubtful",
    distractors: ["Certain", "Reliable"],
    explanation: "'Dubious' describes a state of hesitation, uncertainty, or doubt."
  },
  {
    word: "IMPARTIAL",
    correct: "Fair",
    distractors: ["Biased", "Opinionated"],
    explanation: "'Impartial' means treating all rivals or disputants equally; fair."
  },
  {
    word: "OMINOUS",
    correct: "Threatening",
    distractors: ["Promising", "Joyful"],
    explanation: "'Ominous' gives the impression that something bad is about to happen; threatening."
  },
  {
    word: "PRUDENT",
    correct: "Wise",
    distractors: ["Reckless", "Negligent"],
    explanation: "'Prudent' is acting with or showing care and thought for the future; wise."
  },
  {
    word: "RESILIENT",
    correct: "Tough",
    distractors: ["Fragile", "Yielding"],
    explanation: "'Resilient' is able to withstand or recover quickly from difficult conditions; tough."
  },
  {
    word: "ZEALOUS",
    correct: "Passionate",
    distractors: ["Apathetic", "Bored"],
    explanation: "'Zealous' is having or showing zeal; extremely passionate."
  },
  {
    word: "FRUGAL",
    correct: "Thrifty",
    distractors: ["Extravagant", "Generous"],
    explanation: "'Frugal' is sparing or economical with regard to money; thrifty."
  },
  {
    word: "CONCISE",
    correct: "Brief",
    distractors: ["Wordy", "Extended"],
    explanation: "'Concise' means giving information clearly and in few words; brief."
  },
  {
    word: "INDUSTRIOUS",
    correct: "Hardworking",
    distractors: ["Indolent", "Tardy"],
    explanation: "'Industrious' means diligent and hard-working."
  }
];

const ANTONYMS: WordConcept[] = [
  {
    word: "EPHEMERAL",
    correct: "Permanent",
    distractors: ["Transitional", "Fragile"],
    explanation: "'Ephemeral' is short-lived. The exact opposite antonym is permanent."
  },
  {
    word: "CACOPHONY",
    correct: "Harmony",
    distractors: ["Clatter", "Screaming"],
    explanation: "'Cacophony' is a harsh, discordant mixture of sounds. The opposite is harmony."
  },
  {
    word: "ADVERSITY",
    correct: "Prosperity",
    distractors: ["Hardship", "Misfortune"],
    explanation: "'Adversity' means difficulties or misfortune. The antonym is prosperity."
  },
  {
    word: "COMPASSIONATE",
    correct: "Coldhearted",
    distractors: ["Kindhearted", "Empathetic"],
    explanation: "'Compassionate' is feeling or showing sympathy. The opposite is coldhearted."
  },
  {
    word: "FASTIDIOUS",
    correct: "Sloppy",
    distractors: ["Meticulous", "Clean"],
    explanation: "'Fastidious' is very attentive to detail and cleanliness. The opposite is sloppy."
  },
  {
    word: "GREGARIOUS",
    correct: "Introverted",
    distractors: ["Sociable", "Outspoken"],
    explanation: "'Gregarious' means fond of company or sociable. The antonym is introverted."
  },
  {
    word: "HASTY",
    correct: "Deliberate",
    distractors: ["Rapid", "Impulsive"],
    explanation: "'Hasty' is done with excessive speed or urgency. The antonym is deliberate."
  },
  {
    word: "TRANSIENT",
    correct: "Eternal",
    distractors: ["Passing", "Temporary"],
    explanation: "'Transient' means lasting only for a short time. The opposite is eternal."
  },
  {
    word: "VIBRANT",
    correct: "Dull",
    distractors: ["Energetic", "Sparkling"],
    explanation: "'Vibrant' means full of energy and life. The opposite is dull."
  },
  {
    word: "STAGNANT",
    correct: "Flowing",
    distractors: ["Motionless", "Stale"],
    explanation: "'Stagnant' refers to bodies of water or situations without flow; standard antonym is flowing."
  }
];

interface GrammarTemplate {
  prompt: string;
  options: [string, string, string];
  correctIdx: number;
  explanation: string;
}

const GRAMMAR_REPAIRS: GrammarTemplate[] = [
  {
    prompt: "Complete the sentence: 'Neither of the students ___ completed the cyber essay.'",
    options: ["have", "has", "are"],
    correctIdx: 1,
    explanation: "'Neither' is a singular indefinite pronoun and takes the singular verb 'has'."
  },
  {
    prompt: "Complete the sentence: 'By next December, we ___ in this city for ten years.'",
    options: ["will have lived", "had lived", "will be living"],
    correctIdx: 0,
    explanation: "The future perfect 'will have lived' describes an action that will be completed before a future time."
  },
  {
    prompt: "Choose the grammatically correct sentence:",
    options: [
      "Whom wrote this holographic message?",
      "Who wrote this holographic message?",
      "Whose wrote this holographic message?"
    ],
    correctIdx: 1,
    explanation: "'Who' is the subject pronoun. 'Who wrote' is correct."
  },
  {
    prompt: "Complete the sentence: 'I could ___ written a better response if my terminal worked.'",
    options: ["have", "of", "had"],
    correctIdx: 0,
    explanation: "It is grammatically 'could have' (or could've), never 'could of'."
  },
  {
    prompt: "Identify the grammatical error: 'Each dog are wearing a tracking badge.'",
    options: ["Each", "are", "wearing"],
    correctIdx: 1,
    explanation: "'Each' is singular. The verb must be changed to 'is' for correct agreement."
  },
  {
    prompt: "Complete the sentence: 'Neither the commander nor the soldiers ___ back.'",
    options: ["was", "were", "is"],
    correctIdx: 1,
    explanation: "With 'neither... nor', the verb agrees with the closer subject 'soldiers' (plural), so 'were' is correct."
  },
  {
    prompt: "Complete the sentence: 'She is the pilot ___ I trust the most.'",
    options: ["who", "whom", "which"],
    correctIdx: 1,
    explanation: "'Whom' is correct as it acts as the object of the verb 'trust'."
  },
  {
    prompt: "Complete the sentence: 'If I ___ in your position, I would activate shields.'",
    options: ["was", "were", "would be"],
    correctIdx: 1,
    explanation: "Subjunctive mood uses 'were' for imaginary or hypothetical situations."
  },
  {
    prompt: "Complete the sentence: 'The jury ___ still debating the final verdict.'",
    options: ["is", "are", "have"],
    correctIdx: 0,
    explanation: "Collective nouns representing a unified singular body take 'is'."
  },
  {
    prompt: "Complete the sentence: 'Every one of the books ___ been read by the droid.'",
    options: ["has", "have", "having"],
    correctIdx: 0,
    explanation: "'Every one' is a singular subject, requiring 'has'."
  },
  {
    prompt: "Complete the sentence: 'The symphony of strings ___ beautiful.'",
    options: ["is", "are", "were"],
    correctIdx: 0,
    explanation: "The singular subject is 'symphony', so the verb should be 'is'."
  },
  {
    prompt: "Complete the sentence: 'We ___ waiting for over two hours when the pod arrived.'",
    options: ["have been", "had been", "were"],
    correctIdx: 1,
    explanation: "Past perfect continuous 'had been waiting' applies to an ongoing action interrupted in the past."
  }
];

// Helper to shuffle any array cleanly
function shuffle<T>(array: T[]): T[] {
  const next = [...array];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

// Generate dynamic questions on demand!
export function generateDynamicQuestions(count: number): Question[] {
  const list: Question[] = [];

  // Generate Parts of speech
  PARTS_OF_SPEECH.forEach((pos, idx) => {
    list.push({
      id: `pos-dynamic-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      category: "Parts of Speech",
      prompt: `Identify the word type of the capitalized word: "${pos.sentence}"`,
      options: pos.options,
      correctIdx: pos.correctIdx,
      explanation: pos.explanation
    });
  });

  // Generate Synonyms
  SYNONYMS.forEach((syn, idx) => {
    // Dynamically randomize choice options placement so user cannot memorize buttons!
    const opts = [syn.correct, syn.distractors[0], syn.distractors[1]];
    const shuffledOpts = shuffle(opts);
    const corrIdx = shuffledOpts.indexOf(syn.correct);

    list.push({
      id: `syn-dynamic-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      category: "Synonyms",
      prompt: `Find the SYNONYM of the word: "${syn.word}"`,
      options: shuffledOpts as [string, string, string],
      correctIdx: corrIdx,
      explanation: syn.explanation
    });
  });

  // Generate Antonyms
  ANTONYMS.forEach((ant, idx) => {
    const opts = [ant.correct, ant.distractors[0], ant.distractors[1]];
    const shuffledOpts = shuffle(opts);
    const corrIdx = shuffledOpts.indexOf(ant.correct);

    list.push({
      id: `ant-dynamic-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      category: "Antonyms",
      prompt: `Find the ANTONYM of the word: "${ant.word}"`,
      options: shuffledOpts as [string, string, string],
      correctIdx: corrIdx,
      explanation: ant.explanation
    });
  });

  // Generate Grammar repairs
  GRAMMAR_REPAIRS.forEach((gm, idx) => {
    list.push({
      id: `gram-dynamic-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      category: "Grammar Repair",
      prompt: gm.prompt,
      options: gm.options,
      correctIdx: gm.correctIdx,
      explanation: gm.explanation
    });
  });

  // Shuffle the entire dynamic mega deck!
  const shuffledDeck = shuffle(list);

  // Return a subset matching user desired count
  return shuffledDeck.slice(0, Math.min(count, shuffledDeck.length));
}
