import { Question } from "./game-types-corridor";

interface WordPOS {
  sentence: string;
  word: string;
  options: [string, string, string]; // exactly 3 choices
  correctIdx: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

const PARTS_OF_SPEECH: WordPOS[] = [
  // Easy
  {
    sentence: "The SUN is shining brightly.",
    word: "SUN",
    options: ["Noun", "Verb", "Adjective"],
    correctIdx: 0,
    explanation: "'Sun' represents a person, place, thing, or entity, which is a noun.",
    difficulty: "easy"
  },
  {
    sentence: "She is SINGING elegantly in the concert.",
    word: "SINGING",
    options: ["Adverb", "Noun", "Verb"],
    correctIdx: 2,
    explanation: "'Singing' is the core action word representing a verb.",
    difficulty: "easy"
  },
  {
    sentence: "The friendly DOG barked at the mailman.",
    word: "DOG",
    options: ["Noun", "Verb", "Adverb"],
    correctIdx: 0,
    explanation: "'Dog' is a living creature, which is a noun.",
    difficulty: "easy"
  },
  {
    sentence: "We RAN to the cyber library.",
    word: "RAN",
    options: ["Noun", "Verb", "Adjective"],
    correctIdx: 1,
    explanation: "'Ran' is the action performed, making it a verb.",
    difficulty: "easy"
  },
  {
    sentence: "This delicious APPLE is very sweet.",
    word: "APPLE",
    options: ["Adverb", "Verb", "Noun"],
    correctIdx: 2,
    explanation: "'Apple' is a fruit/object, representing a noun.",
    difficulty: "easy"
  },
  {
    sentence: "He is a HAPPY boy today.",
    word: "HAPPY",
    options: ["Adjective", "Verb", "Noun"],
    correctIdx: 0,
    explanation: "'Happy' describes the boy, making it an adjective.",
    difficulty: "easy"
  },
  {
    sentence: "A black CAT slept on the sofa.",
    word: "CAT",
    options: ["Verb", "Noun", "Adverb"],
    correctIdx: 1,
    explanation: "'Cat' is an animal, representing a noun.",
    difficulty: "easy"
  },
  {
    sentence: "The children LAUGH at the funny clown.",
    word: "LAUGH",
    options: ["Noun", "Adjective", "Verb"],
    correctIdx: 2,
    explanation: "'Laugh' is the action they perform, representing a verb.",
    difficulty: "easy"
  },
  // Medium
  {
    sentence: "He ran QUICKLY to catch the school bus.",
    word: "QUICKLY",
    options: ["Adjective", "Adverb", "Conjunction"],
    correctIdx: 1,
    explanation: "'Quickly' is an adverb because it modifies the action verb 'ran'.",
    difficulty: "medium"
  },
  {
    sentence: "They live in a BEAUTIFUL cyber castle.",
    word: "BEAUTIFUL",
    options: ["Verb", "Pronoun", "Adjective"],
    correctIdx: 2,
    explanation: "'Beautiful' is an adjective since it describes the noun 'castle'.",
    difficulty: "medium"
  },
  {
    sentence: "Ouch! The hot burner BURNT my index finger.",
    word: "BURNT",
    options: ["Verb", "Preposition", "Noun"],
    correctIdx: 0,
    explanation: "'Burnt' denotes the core action of the sentence, making it a verb.",
    difficulty: "medium"
  },
  {
    sentence: "A DILIGENT student studied quietly in the cyber library.",
    word: "DILIGENT",
    options: ["Noun", "Adjective", "Verb"],
    correctIdx: 1,
    explanation: "'Diligent' describes the noun 'student', making it an adjective.",
    difficulty: "medium"
  },
  {
    sentence: "They are playing soccer OUTSIDE in the field.",
    word: "OUTSIDE",
    options: ["Adverb", "Noun", "Pronoun"],
    correctIdx: 0,
    explanation: "'Outside' describes where they are playing, which makes it an adverb.",
    difficulty: "medium"
  },
  {
    sentence: "The chef CAREFULLY chopped the fresh garlic.",
    word: "CAREFULLY",
    options: ["Adjective", "Preposition", "Adverb"],
    correctIdx: 2,
    explanation: "'Carefully' modifies how the garlic is chopped, so it is an adverb.",
    difficulty: "medium"
  },
  {
    sentence: "We crawled UNDER the low laser beam.",
    word: "UNDER",
    options: ["Conjunction", "Preposition", "Adjective"],
    correctIdx: 1,
    explanation: "'Under' is a preposition describing the spatial path.",
    difficulty: "medium"
  },
  {
    sentence: "The robot hid BEHIND the control terminal.",
    word: "BEHIND",
    options: ["Verb", "Pronoun", "Preposition"],
    correctIdx: 2,
    explanation: "'Behind' is a preposition showing location relative to the terminal.",
    difficulty: "medium"
  },
  {
    sentence: "I wanted to run, BUT the engine was malfunctioning.",
    word: "BUT",
    options: ["Conjunction", "Adjective", "Preposition"],
    correctIdx: 0,
    explanation: "'But' connects two independent clauses, making it a coordinating conjunction.",
    difficulty: "medium"
  },
  {
    sentence: "He stayed indoors BECAUSE it was acid-raining.",
    word: "BECAUSE",
    options: ["Preposition", "Conjunction", "Verb"],
    correctIdx: 1,
    explanation: "'Because' is a subordinating conjunction showing cause.",
    difficulty: "medium"
  },
  // Hard
  {
    sentence: "Knowledge is a POWERFUL cyber tool.",
    word: "POWERFUL",
    options: ["Adjective", "Noun", "Preposition"],
    correctIdx: 0,
    explanation: "'Powerful' describes the noun 'tool', making it an adjective.",
    difficulty: "hard"
  },
  {
    sentence: "A MYSTERIOUS visitor tapped on the glass viewport.",
    word: "MYSTERIOUS",
    options: ["Verb", "Adjective", "Adverb"],
    correctIdx: 1,
    explanation: "'Mysterious' is an adjective, qualifying the noun 'visitor'.",
    difficulty: "hard"
  },
  {
    sentence: "The wild wind BLEW fiercely across the plain.",
    word: "BLEW",
    options: ["Verb", "Noun", "Preposition"],
    correctIdx: 0,
    explanation: "'Blew' is the past-tense action of the wind, representing a verb.",
    difficulty: "hard"
  },
  {
    sentence: "He placed the delicate VASE gently down.",
    word: "VASE",
    options: ["Verb", "Adverb", "Noun"],
    correctIdx: 2,
    explanation: "'Vase' is a concrete object, which is a noun.",
    difficulty: "hard"
  },
  {
    sentence: "The crew succeeded, ALTHOUGH the power levels were critical.",
    word: "ALTHOUGH",
    options: ["Preposition", "Conjunction", "Adverb"],
    correctIdx: 1,
    explanation: "'Although' is a subordinating conjunction introducing contrast.",
    difficulty: "hard"
  },
  {
    sentence: "The code compile was EXTREMELY quick.",
    word: "EXTREMELY",
    options: ["Adjective", "Noun", "Adverb"],
    correctIdx: 2,
    explanation: "'Extremely' modifies the adjective 'quick', making it an adverb.",
    difficulty: "hard"
  },
  {
    sentence: "She HERSELF reprogrammed the main mainframe.",
    word: "HERSELF",
    options: ["Pronoun", "Noun", "Verb"],
    correctIdx: 0,
    explanation: "'Herself' is an intensive pronoun emphasizing 'She'.",
    difficulty: "hard"
  },
  {
    sentence: "We must, THEREFORE, escape through the emergency vent.",
    word: "THEREFORE",
    options: ["Conjunction", "Adverb", "Preposition"],
    correctIdx: 1,
    explanation: "'Therefore' is a conjunctive adverb connecting logical consequences.",
    difficulty: "hard"
  },
  {
    sentence: "The signal was sent THROUGHOUT the entire sector.",
    word: "THROUGHOUT",
    options: ["Preposition", "Conjunction", "Noun"],
    correctIdx: 0,
    explanation: "'Throughout' is a preposition describing coverage across space.",
    difficulty: "hard"
  }
];

interface WordConcept {
  word: string;
  correct: string;
  distractors: [string, string];
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

const SYNONYMS: WordConcept[] = [
  // Easy
  {
    word: "LARGE",
    correct: "Huge",
    distractors: ["Tiny", "Short"],
    explanation: "'Large' and 'huge' both describe something of great size.",
    difficulty: "easy"
  },
  {
    word: "HAPPY",
    correct: "Joyful",
    distractors: ["Sad", "Angry"],
    explanation: "'Happy' and 'joyful' mean showing or feeling pleasure.",
    difficulty: "easy"
  },
  {
    word: "START",
    correct: "Begin",
    distractors: ["Finish", "Stop"],
    explanation: "To 'start' or 'begin' is to perform the first part of an action.",
    difficulty: "easy"
  },
  {
    word: "FAST",
    correct: "Quick",
    distractors: ["Slow", "Heavy"],
    explanation: "'Fast' and 'quick' denote high speed.",
    difficulty: "easy"
  },
  {
    word: "SAD",
    correct: "Gloomy",
    distractors: ["Cheerful", "Excited"],
    explanation: "'Sad' and 'gloomy' indicate feeling unhappy.",
    difficulty: "easy"
  },
  {
    word: "SMALL",
    correct: "Tiny",
    distractors: ["Giant", "Wide"],
    explanation: "'Small' and 'tiny' describe things of little size.",
    difficulty: "easy"
  },
  {
    word: "SILENT",
    correct: "Quiet",
    distractors: ["Loud", "Noisy"],
    explanation: "'Silent' and 'quiet' both refer to the absence of sound.",
    difficulty: "easy"
  },
  // Medium
  {
    word: "ABUNDANT",
    correct: "Plentiful",
    distractors: ["Scarce", "Sparse"],
    explanation: "'Abundant' means existing or available in large quantities; plentiful.",
    difficulty: "medium"
  },
  {
    word: "CANDID",
    correct: "Honest",
    distractors: ["Deceitful", "Evasive"],
    explanation: "'Candid' means straightforward, truth-telling, or honest.",
    difficulty: "medium"
  },
  {
    word: "PRUDENT",
    correct: "Wise",
    distractors: ["Reckless", "Negligent"],
    explanation: "'Prudent' is acting with or showing care and thought for the future; wise.",
    difficulty: "medium"
  },
  {
    word: "CONCISE",
    correct: "Brief",
    distractors: ["Wordy", "Extended"],
    explanation: "'Concise' means giving information clearly and in few words; brief.",
    difficulty: "medium"
  },
  {
    word: "INDUSTRIOUS",
    correct: "Hardworking",
    distractors: ["Indolent", "Tardy"],
    explanation: "'Industrious' means diligent and hard-working.",
    difficulty: "medium"
  },
  {
    word: "BRAVE",
    correct: "Courageous",
    distractors: ["Fearful", "Weak"],
    explanation: "A 'brave' or 'courageous' person faces danger without fear.",
    difficulty: "medium"
  },
  {
    word: "HOSTILE",
    correct: "Unfriendly",
    distractors: ["Amiable", "Warm"],
    explanation: "'Hostile' represents an antagonistic or unfriendly attitude.",
    difficulty: "medium"
  },
  {
    word: "BROAD",
    correct: "Wide",
    distractors: ["Narrow", "Deep"],
    explanation: "'Broad' and 'wide' describe large horizontal distances.",
    difficulty: "medium"
  },
  // Hard
  {
    word: "OBSTINATE",
    correct: "Stubborn",
    distractors: ["Pliable", "Intelligent"],
    explanation: "'Obstinate' means stubborn or refusing to change one's mind.",
    difficulty: "hard"
  },
  {
    word: "ALACRITY",
    correct: "Eagerness",
    distractors: ["Sluggishness", "Skeptical"],
    explanation: "'Alacrity' represents an enthusiastic eagerness or readiness.",
    difficulty: "hard"
  },
  {
    word: "METICULOUS",
    correct: "Precise",
    distractors: ["Careless", "Slothful"],
    explanation: "'Meticulous' means showing extreme care and precision.",
    difficulty: "hard"
  },
  {
    word: "DUBIOUS",
    correct: "Doubtful",
    distractors: ["Certain", "Reliable"],
    explanation: "'Dubious' describes a state of hesitation, uncertainty, or doubt.",
    difficulty: "hard"
  },
  {
    word: "IMPARTIAL",
    correct: "Fair",
    distractors: ["Biased", "Opinionated"],
    explanation: "'Impartial' means treating all rivals or disputants equally; fair.",
    difficulty: "hard"
  },
  {
    word: "OMINOUS",
    correct: "Threatening",
    distractors: ["Promising", "Joyful"],
    explanation: "'Ominous' gives the impression that something bad is about to happen; threatening.",
    difficulty: "hard"
  },
  {
    word: "RESILIENT",
    correct: "Tough",
    distractors: ["Fragile", "Yielding"],
    explanation: "'Resilient' is able to withstand or recover quickly from difficult conditions; tough.",
    difficulty: "hard"
  },
  {
    word: "ZEALOUS",
    correct: "Passionate",
    distractors: ["Apathetic", "Bored"],
    explanation: "'Zealous' is having or showing zeal; extremely passionate.",
    difficulty: "hard"
  },
  {
    word: "FRUGAL",
    correct: "Thrifty",
    distractors: ["Extravagant", "Generous"],
    explanation: "'Frugal' is sparing or economical with regard to money; thrifty.",
    difficulty: "hard"
  },
  {
    word: "CACOPHONY",
    correct: "Clatter",
    distractors: ["Silence", "Melody"],
    explanation: "'Cacophony' refers to harsh, discordant noise; a clatter is similar.",
    difficulty: "hard"
  }
];

const ANTONYMS: WordConcept[] = [
  // Easy
  {
    word: "DARK",
    correct: "Light",
    distractors: ["Black", "Shadowy"],
    explanation: "'Light' is the direct opposite antonym of 'dark'.",
    difficulty: "easy"
  },
  {
    word: "FAST",
    correct: "Slow",
    distractors: ["Quick", "Rapid"],
    explanation: "The opposite of moving at high speed ('fast') is 'slow'.",
    difficulty: "easy"
  },
  {
    word: "HAPPY",
    correct: "Sad",
    distractors: ["Joyful", "Glad"],
    explanation: "'Sad' represents the opposite emotional state of 'happy'.",
    difficulty: "easy"
  },
  {
    word: "COLD",
    correct: "Hot",
    distractors: ["Cool", "Freezing"],
    explanation: "'Hot' is the direct thermal opposite of 'cold'.",
    difficulty: "easy"
  },
  {
    word: "BIG",
    correct: "Small",
    distractors: ["Large", "Huge"],
    explanation: "'Small' is the size opposite of 'big'.",
    difficulty: "easy"
  },
  {
    word: "DRY",
    correct: "Wet",
    distractors: ["Arid", "Dehydrated"],
    explanation: "'Wet' indicates moisture, which is the antonym of 'dry'.",
    difficulty: "easy"
  },
  {
    word: "HIGH",
    correct: "Low",
    distractors: ["Tall", "Elevated"],
    explanation: "'Low' is the height antonym of 'high'.",
    difficulty: "easy"
  },
  {
    word: "LOUD",
    correct: "Quiet",
    distractors: ["Noisy", "Screaming"],
    explanation: "'Quiet' is the opposite of a high-volume sound ('loud').",
    difficulty: "easy"
  },
  // Medium
  {
    word: "VIBRANT",
    correct: "Dull",
    distractors: ["Energetic", "Sparkling"],
    explanation: "'Vibrant' means full of energy and life. The opposite is dull.",
    difficulty: "medium"
  },
  {
    word: "GREGARIOUS",
    correct: "Introverted",
    distractors: ["Sociable", "Outspoken"],
    explanation: "'Gregarious' means fond of company or sociable. The antonym is introverted.",
    difficulty: "medium"
  },
  {
    word: "COMPASSIONATE",
    correct: "Coldhearted",
    distractors: ["Kindhearted", "Empathetic"],
    explanation: "'Compassionate' is feeling or showing sympathy. The opposite is coldhearted.",
    difficulty: "medium"
  },
  {
    word: "HASTY",
    correct: "Deliberate",
    distractors: ["Rapid", "Impulsive"],
    explanation: "'Hasty' is done with excessive speed. The antonym is deliberate.",
    difficulty: "medium"
  },
  {
    word: "SMOOTH",
    correct: "Rough",
    distractors: ["Sleek", "Polished"],
    explanation: "'Rough' is the texture antonym of 'smooth'.",
    difficulty: "medium"
  },
  {
    word: "GENEROUS",
    correct: "Stingy",
    distractors: ["Kind", "Giving"],
    explanation: "'Stingy' (unwilling to share) is the antonym of 'generous'.",
    difficulty: "medium"
  },
  {
    word: "ANCIENT",
    correct: "Modern",
    distractors: ["Old", "Historic"],
    explanation: "'Modern' represents contemporary times, which is the opposite of 'ancient'.",
    difficulty: "medium"
  },
  {
    word: "PLENTIFUL",
    correct: "Scarce",
    distractors: ["Abundant", "Bountiful"],
    explanation: "'Scarce' means insufficient or rare, the antonym of 'plentiful'.",
    difficulty: "medium"
  },
  // Hard
  {
    word: "EPHEMERAL",
    correct: "Permanent",
    distractors: ["Transitional", "Fragile"],
    explanation: "'Ephemeral' is short-lived. The exact opposite antonym is permanent.",
    difficulty: "hard"
  },
  {
    word: "CACOPHONY",
    correct: "Harmony",
    distractors: ["Clatter", "Screaming"],
    explanation: "'Cacophony' is a harsh, discordant mixture of sounds. The opposite is harmony.",
    difficulty: "hard"
  },
  {
    word: "ADVERSITY",
    correct: "Prosperity",
    distractors: ["Hardship", "Misfortune"],
    explanation: "'Adversity' means difficulties or misfortune. The antonym is prosperity.",
    difficulty: "hard"
  },
  {
    word: "FASTIDIOUS",
    correct: "Sloppy",
    distractors: ["Meticulous", "Clean"],
    explanation: "'Fastidious' is very attentive to detail and cleanliness. The opposite is sloppy.",
    difficulty: "hard"
  },
  {
    word: "TRANSIENT",
    correct: "Eternal",
    distractors: ["Passing", "Temporary"],
    explanation: "'Transient' means lasting only for a short time. The opposite is eternal.",
    difficulty: "hard"
  },
  {
    word: "STAGNANT",
    correct: "Flowing",
    distractors: ["Motionless", "Stale"],
    explanation: "'Stagnant' refers to bodies of water or situations without flow; standard antonym is flowing.",
    difficulty: "hard"
  },
  {
    word: "OBSCURE",
    correct: "Famous",
    distractors: ["Hidden", "Unclear"],
    explanation: "'Obscure' means unknown or hard to see. The antonym is famous.",
    difficulty: "hard"
  },
  {
    word: "MITIGATE",
    correct: "Intensify",
    distractors: ["Lessen", "Ease"],
    explanation: "To 'mitigate' is to make less severe. The opposite is to 'intensify'.",
    difficulty: "hard"
  },
  {
    word: "LOQUACIOUS",
    correct: "Taciturn",
    distractors: ["Talkative", "Chatty"],
    explanation: "'Loquacious' means extremely talkative. The antonym is 'taciturn' (reserved or quiet).",
    difficulty: "hard"
  }
];

interface GrammarTemplate {
  prompt: string;
  options: [string, string, string];
  correctIdx: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

const GRAMMAR_REPAIRS: GrammarTemplate[] = [
  // Easy
  {
    prompt: "Complete the sentence: 'Each of the puppies ___ sleeping.'",
    options: ["is", "are", "am"],
    correctIdx: 0,
    explanation: "'Each' is a singular indefinite pronoun, requiring the singular verb 'is'.",
    difficulty: "easy"
  },
  {
    prompt: "Complete the sentence: 'She ___ to the coding camp every day.'",
    options: ["go", "goes", "going"],
    correctIdx: 1,
    explanation: "Third-person singular 'She' agrees with 'goes'.",
    difficulty: "easy"
  },
  {
    prompt: "Complete the sentence: 'They ___ playing games yesterday afternoon.'",
    options: ["was", "is", "were"],
    correctIdx: 2,
    explanation: "Past tense plural subject 'They' matches with 'were'.",
    difficulty: "easy"
  },
  {
    prompt: "Complete the sentence: 'He does not ___ any credits left.'",
    options: ["have", "has", "having"],
    correctIdx: 0,
    explanation: "Negative auxiliary 'does not' is followed by base form 'have'.",
    difficulty: "easy"
  },
  {
    prompt: "Complete the sentence: 'We have already ___ our power lunch.'",
    options: ["eat", "eaten", "ate"],
    correctIdx: 1,
    explanation: "Present perfect past participle form of 'eat' is 'eaten'.",
    difficulty: "easy"
  },
  {
    prompt: "Complete the sentence: 'You ___ my best squadmate.'",
    options: ["is", "are", "am"],
    correctIdx: 1,
    explanation: "Subject pronoun 'You' always takes the verb form 'are'.",
    difficulty: "easy"
  },
  {
    prompt: "Complete the sentence: 'The sleeping cat ___ on the warm solar mat.'",
    options: ["sits", "sit", "sitting"],
    correctIdx: 0,
    explanation: "Singular noun 'cat' requires singular verb inflection 'sits'.",
    difficulty: "easy"
  },
  {
    prompt: "Complete the sentence: 'Yesterday, I ___ a shooting star in the sky.'",
    options: ["see", "saw", "seen"],
    correctIdx: 1,
    explanation: "The past tense of 'see' is 'saw'.",
    difficulty: "easy"
  },
  // Medium
  {
    prompt: "Complete the sentence: 'Neither of the students ___ completed the cyber essay.'",
    options: ["have", "has", "are"],
    correctIdx: 1,
    explanation: "'Neither' is a singular indefinite pronoun and takes the singular verb 'has'.",
    difficulty: "medium"
  },
  {
    prompt: "Complete the sentence: 'I could ___ written a better response if my terminal worked.'",
    options: ["have", "of", "had"],
    correctIdx: 0,
    explanation: "It is grammatically 'could have' (or could've), never 'could of'.",
    difficulty: "medium"
  },
  {
    prompt: "Identify the grammatical error: 'Each dog are wearing a tracking badge.'",
    options: ["Each", "are", "wearing"],
    correctIdx: 1,
    explanation: "'Each' is singular. The verb must be changed to 'is' for correct agreement.",
    difficulty: "medium"
  },
  {
    prompt: "Complete the sentence: 'Every one of the books ___ been read by the droid.'",
    options: ["has", "have", "having"],
    correctIdx: 0,
    explanation: "'Every one' is a singular subject, requiring 'has'.",
    difficulty: "medium"
  },
  {
    prompt: "Complete the sentence: 'The symphony of strings ___ beautiful.'",
    options: ["is", "are", "were"],
    correctIdx: 0,
    explanation: "The singular subject is 'symphony', so the verb should be 'is'.",
    difficulty: "medium"
  },
  {
    prompt: "Complete the sentence: 'Between you and ___, this is a secret.'",
    options: ["I", "we", "me"],
    correctIdx: 2,
    explanation: "The preposition 'between' takes the objective case pronoun 'me'.",
    difficulty: "medium"
  },
  {
    prompt: "Complete the sentence: 'The team ___ practicing their individual routines.'",
    options: ["is", "are", "was"],
    correctIdx: 1,
    explanation: "Members of the collective noun are performing individual tasks, indicating plural 'are'.",
    difficulty: "medium"
  },
  {
    prompt: "Complete the sentence: 'None of the private information ___ leaked yet.'",
    options: ["has", "have", "were"],
    correctIdx: 0,
    explanation: "'Information' is uncountable, so it takes the singular verb 'has'.",
    difficulty: "medium"
  },
  // Hard
  {
    prompt: "Complete the sentence: 'By next December, we ___ in this city for ten years.'",
    options: ["will have lived", "had lived", "will be living"],
    correctIdx: 0,
    explanation: "The future perfect 'will have lived' describes an action that will be completed before a future time.",
    difficulty: "hard"
  },
  {
    prompt: "Choose the grammatically correct sentence:",
    options: [
      "Whom wrote this holographic message?",
      "Who wrote this holographic message?",
      "Whose wrote this holographic message?"
    ],
    correctIdx: 1,
    explanation: "'Who' is the subject pronoun. 'Who wrote' is correct.",
    difficulty: "hard"
  },
  {
    prompt: "Complete the sentence: 'Neither the commander nor the soldiers ___ back.'",
    options: ["was", "were", "is"],
    correctIdx: 1,
    explanation: "With 'neither... nor', the verb agrees with the closer subject 'soldiers' (plural), so 'were' is correct.",
    difficulty: "hard"
  },
  {
    prompt: "Complete the sentence: 'She is the pilot ___ I trust the most.'",
    options: ["who", "whom", "which"],
    correctIdx: 1,
    explanation: "'Whom' is correct as it acts as the object of the verb 'trust'.",
    difficulty: "hard"
  },
  {
    prompt: "Complete the sentence: 'If I ___ in your position, I would activate shields.'",
    options: ["was", "were", "would be"],
    correctIdx: 1,
    explanation: "Subjunctive mood uses 'were' for imaginary or hypothetical situations.",
    difficulty: "hard"
  },
  {
    prompt: "Complete the sentence: 'The jury ___ still debating the final verdict.'",
    options: ["is", "are", "have"],
    correctIdx: 0,
    explanation: "Collective nouns representing a unified singular body take 'is'.",
    difficulty: "hard"
  },
  {
    prompt: "Complete the sentence: 'We ___ waiting for over two hours when the pod arrived.'",
    options: ["have been", "had been", "were"],
    correctIdx: 1,
    explanation: "Past perfect continuous 'had been waiting' applies to an ongoing action interrupted in the past.",
    difficulty: "hard"
  },
  {
    prompt: "Complete the sentence: 'Scarcely had she finished speaking ___ the terminal console crashed.'",
    options: ["when", "than", "then"],
    correctIdx: 0,
    explanation: "'Scarcely' is correctly followed by the relative conjunction 'when'.",
    difficulty: "hard"
  },
  {
    prompt: "Complete the sentence: 'It is essential that he ___ present at the emergency briefing.'",
    options: ["be", "is", "was"],
    correctIdx: 0,
    explanation: "The subjunctive verb form 'be' is used after adjectives expressing necessity like 'essential'.",
    difficulty: "hard"
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

// Generate dynamic questions on demand with category and difficulty filters!
export function generateDynamicQuestions(
  count: number,
  category?: string,
  difficulty?: "easy" | "medium" | "hard"
): Question[] {
  const list: Question[] = [];

  // Filter Parts of Speech
  let posPool = PARTS_OF_SPEECH;
  if (difficulty) {
    posPool = posPool.filter((q) => q.difficulty === difficulty);
  }
  if (!category || category === "Parts of Speech") {
    posPool.forEach((pos, idx) => {
      list.push({
        id: `pos-dynamic-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        category: "Parts of Speech",
        prompt: `Identify the word type of the capitalized word: "${pos.sentence}"`,
        options: pos.options,
        correctIdx: pos.correctIdx,
        explanation: pos.explanation,
        difficulty: pos.difficulty
      });
    });
  }

  // Filter Synonyms
  let synPool = SYNONYMS;
  if (difficulty) {
    synPool = synPool.filter((q) => q.difficulty === difficulty);
  }
  if (!category || category === "Vocabulary" || category === "Synonyms" || category === "Synonyms & Antonyms") {
    synPool.forEach((syn, idx) => {
      // Dynamically randomize choice options placement so user cannot memorize buttons!
      const opts = [syn.correct, syn.distractors[0], syn.distractors[1]];
      const shuffledOpts = shuffle(opts);
      const corrIdx = shuffledOpts.indexOf(syn.correct);

      list.push({
        id: `syn-dynamic-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        category: "Vocabulary",
        prompt: `Find the SYNONYM of the word: "${syn.word}"`,
        options: shuffledOpts as [string, string, string],
        correctIdx: corrIdx,
        explanation: syn.explanation,
        difficulty: syn.difficulty
      });
    });
  }

  // Filter Antonyms
  let antPool = ANTONYMS;
  if (difficulty) {
    antPool = antPool.filter((q) => q.difficulty === difficulty);
  }
  if (!category || category === "Vocabulary" || category === "Antonyms" || category === "Synonyms & Antonyms") {
    antPool.forEach((ant, idx) => {
      const opts = [ant.correct, ant.distractors[0], ant.distractors[1]];
      const shuffledOpts = shuffle(opts);
      const corrIdx = shuffledOpts.indexOf(ant.correct);

      list.push({
        id: `ant-dynamic-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        category: "Vocabulary",
        prompt: `Find the ANTONYM of the word: "${ant.word}"`,
        options: shuffledOpts as [string, string, string],
        correctIdx: corrIdx,
        explanation: ant.explanation,
        difficulty: ant.difficulty
      });
    });
  }

  // Filter Grammar repairs
  let gramPool = GRAMMAR_REPAIRS;
  if (difficulty) {
    gramPool = gramPool.filter((q) => q.difficulty === difficulty);
  }
  if (!category || category === "Grammar Repair") {
    gramPool.forEach((gm, idx) => {
      list.push({
        id: `gram-dynamic-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        category: "Grammar Repair",
        prompt: gm.prompt,
        options: gm.options,
        correctIdx: gm.correctIdx,
        explanation: gm.explanation,
        difficulty: gm.difficulty
      });
    });
  }

  // Shuffle the entire dynamic mega deck!
  const shuffledDeck = shuffle(list);

  // Return a subset matching user desired count
  return shuffledDeck.slice(0, Math.min(count, shuffledDeck.length));
}
