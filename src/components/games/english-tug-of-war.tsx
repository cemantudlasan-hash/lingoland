"use client";

import * as React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Trophy, Play, UserPlus, Sparkles, Volume2, VolumeX, Maximize,
  UserCheck, Award, ArrowRight, Wifi, WifiOff, Users, Copy,
  CheckCircle2, Loader2, RefreshCw, LogOut, Swords, Timer, Check, X, Shield, Zap, AlertCircle, BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  useEnglishTugRoom as useTugRoom,
  useEnglishTugRoomListener as useTugRoomListener,
  getOrCreateTugPlayerId,
  type TugRoom,
  type TugPlayer,
  type TugRoomConfig,
} from "@/hooks/use-english-tug-room";

// ---------------------------------------------------------
// SOUND SYNTHESIS (Web Audio API)
// ---------------------------------------------------------
class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (Ctx) this.ctx = new Ctx();
    }
  }

  playBeep(freq = 440, dur = 0.1, type: OscillatorType = "sine") {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    } catch {}
  }

  playDing() {
    this.playBeep(523.25, 0.1);
    setTimeout(() => this.playBeep(659.25, 0.15), 100);
  }

  playBuzz() {
    this.playBeep(180, 0.25, "triangle");
  }

  playPull() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(80, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {}
  }

  playCheer() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      // Crowd cheer noise generation
      const bufferSize = this.ctx.sampleRate * 1.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      // Filter to sound like a crowd
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1000;
      filter.Q.value = 1;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
      noise.stop(this.ctx.currentTime + 1.5);
    } catch {}
  }

  playFanfare() {
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((f, idx) => {
      setTimeout(() => this.playBeep(f, 0.25, "square"), idx * 120);
    });
  }
}

const sfx = new SoundEffects();

// ---------------------------------------------------------
// PROBLEM GENERATION
// ---------------------------------------------------------
interface TugProblem {
  question: string;
  answer: string;
  options: string[];
  solutionHint?: string;
}

const CATEGORIES = [
  { id: "vocabulary", name: "Vocabulary", emoji: "📖", desc: "Synonyms, antonyms, and word meanings" },
  { id: "verb_to_be", name: "Verb to Be", emoji: "🐝", desc: "Am, is, are, was, were and agreement" },
  { id: "present_tenses", name: "Present Tenses", emoji: "⏱️", desc: "Present simple, continuous, and perfect tenses" },
  { id: "past_simple", name: "Past Simple", emoji: "⏰", desc: "Past simple tense regular and irregular verbs" },
  { id: "past_perfect", name: "Past Perfect", emoji: "⏳", desc: "Actions completed before another past action (had + V3)" },
  { id: "future_tense", name: "Future Tense", emoji: "🔮", desc: "Future predictions & plans (will / going to)" },
  { id: "nouns_and_plurals", name: "Nouns & Plurals", emoji: "🧸", desc: "Common/proper nouns, plurals, and countable/uncountable" },
  { id: "parts_of_speech", name: "Parts of Speech", emoji: "🏷️", desc: "Nouns, verbs, adjectives, prepositions and pronouns" },
  { id: "spelling", name: "Spelling Bee", emoji: "🔤", desc: "Common spelling traps and homophones" },
  { id: "idioms", name: "Idioms & Sayings", emoji: "💡", desc: "Fill in the blank for common expressions" },
  { id: "find_the_error", name: "Find the Error", emoji: "🔍", desc: "Identify the grammatical or spelling error in the sentence" },
  { id: "mixed", name: "Mixed English", emoji: "🎲", desc: "All categories combined" },
];

interface RawProblem {
  question: string;
  answer: string;
  wrong: string[];
  hint: string;
}

const PROBLEMS: { [catId: string]: { easy: RawProblem[]; medium: RawProblem[]; hard: RawProblem[] } } = {
  vocabulary: {
    easy: [
      { question: "What is a synonym for 'happy'?", answer: "Joyful", wrong: ["Sad", "Angry", "Tired"], hint: "It means filled with joy." },
      { question: "What is an antonym for 'hot'?", answer: "Cold", wrong: ["Warm", "Dry", "Sun"], hint: "The opposite of hot temperature." },
      { question: "Choose the synonym of 'quick'.", answer: "Fast", wrong: ["Slow", "Heavy", "Quiet"], hint: "Rapid movement." },
      { question: "What is the opposite of 'large'?", answer: "Small", wrong: ["Big", "Huge", "Wide"], hint: "Little in size." },
      { question: "What does 'begin' mean?", answer: "Start", wrong: ["Finish", "Stop", "Pause"], hint: "To commence something." },
      { question: "Choose the synonym of 'silent'.", answer: "Quiet", wrong: ["Loud", "Noisy", "Active"], hint: "Without noise." },
      { question: "What is the antonym of 'easy'?", answer: "Hard", wrong: ["Soft", "Light", "Simple"], hint: "Difficult to do." },
      { question: "Choose the synonym of 'angry'.", answer: "Mad", wrong: ["Glad", "Sad", "Silly"], hint: "Feeling annoyed or displeased." },
      { question: "What is the opposite of 'always'?", answer: "Never", wrong: ["Often", "Sometimes", "Usually"], hint: "At no time." },
      { question: "What is a synonym for 'neat'?", answer: "Tidy", wrong: ["Messy", "Dirty", "Rough"], hint: "Organized and clean." },
      { question: "What is the opposite of 'sweet'?", answer: "Sour", wrong: ["Sugar", "Tasty", "Soft"], hint: "Tasting like lemon or vinegar." },
      { question: "Choose the synonym of 'intelligent'.", answer: "Smart", wrong: ["Dull", "Lazy", "Slow"], hint: "Having quick learning ability." },
      { question: "What does 'purchase' mean?", answer: "Buy", wrong: ["Sell", "Give", "Keep"], hint: "To acquire by paying money." },
      { question: "What is the antonym of 'heavy'?", answer: "Light", wrong: ["Hard", "Dark", "Strong"], hint: "Not weighing much." },
      { question: "Choose the synonym of 'gift'.", answer: "Present", wrong: ["Box", "Reward", "Task"], hint: "Something given voluntarily." }
    ],
    medium: [
      { question: "What is the synonym of 'enormous'?", answer: "Huge", wrong: ["Tiny", "Weak", "Bright"], hint: "Extremely large in size." },
      { question: "What is the meaning of 'benevolent'?", answer: "Kind", wrong: ["Cruel", "Lazy", "Rich"], hint: "Showing goodwill or charity." },
      { question: "What is an antonym of 'assemble'?", answer: "Disperse", wrong: ["Gather", "Create", "Hold"], hint: "To scatter or spread apart." },
      { question: "Choose the synonym of 'abundant'.", answer: "Plentiful", wrong: ["Scarce", "Few", "Empty"], hint: "Existing in large quantities." },
      { question: "What is the antonym of 'brave'?", answer: "Cowardly", wrong: ["Bold", "Fearless", "Strong"], hint: "Lacking courage." },
      { question: "What does 'reluctant' mean?", answer: "Unwilling", wrong: ["Eager", "Ready", "Excited"], hint: "Hesitant or not wanting to do something." },
      { question: "What does 'cease' mean?", answer: "Stop", wrong: ["Start", "Continue", "Prolong"], hint: "To bring or come to an end." },
      { question: "Choose the synonym of 'generous'.", answer: "Giving", wrong: ["Greedy", "Selfish", "Mean"], hint: "Willing to give money or help." },
      { question: "What does 'fragile' mean?", answer: "Delicate", wrong: ["Strong", "Heavy", "Rough"], hint: "Easily broken or damaged." },
      { question: "What is the antonym of 'hostile'?", answer: "Friendly", wrong: ["Angry", "Mean", "Silent"], hint: "Opposite of showing opposition or dislike." },
      { question: "Select the synonym of 'obvious'.", answer: "Clear", wrong: ["Hidden", "Difficult", "Vague"], hint: "Easy to see or understand." },
      { question: "What does 'initial' mean?", answer: "First", wrong: ["Last", "Middle", "Final"], hint: "Existing or occurring at the beginning." },
      { question: "Choose the synonym of 'constant'.", answer: "Steady", wrong: ["Changing", "Rare", "Quick"], hint: "Occurring continuously over time." },
      { question: "What is the antonym of 'ancient'?", answer: "Modern", wrong: ["Old", "Dirty", "Broken"], hint: "Opposite of belonging to the very distant past." },
      { question: "Choose the synonym of 'valiant'.", answer: "Brave", wrong: ["Fearful", "Weak", "Lazy"], hint: "Showing courage or determination." }
    ],
    hard: [
      { question: "Select the synonym of 'ephemeral'.", answer: "Short-lived", wrong: ["Eternal", "Beautiful", "Scary"], hint: "Lasting for a very short time." },
      { question: "What is the meaning of 'loquacious'?", answer: "Talkative", wrong: ["Silent", "Smart", "Shy"], hint: "Tending to talk a great deal." },
      { question: "What is an antonym of 'cacophony'?", answer: "Harmony", wrong: ["Noise", "Chaos", "Disorder"], hint: "A pleasing combination of sounds." },
      { question: "What does 'capricious' mean?", answer: "Fickle", wrong: ["Stable", "Generous", "Angry"], hint: "Given to sudden changes of mood." },
      { question: "Choose the synonym of 'pernicious'.", answer: "Harmful", wrong: ["Beneficial", "Pleasant", "Innocent"], hint: "Having a harmful effect." },
      { question: "What is the antonym of 'nadir'?", answer: "Zenith", wrong: ["Bottom", "Lowest", "Center"], hint: "The highest point." },
      { question: "Choose the synonym of 'alacrity'.", answer: "Eagerness", wrong: ["Apathy", "Sadness", "Fear"], hint: "Brisk and cheerful readiness." },
      { question: "What is the meaning of 'taciturn'?", answer: "Silent", wrong: ["Talkative", "Loud", "Happy"], hint: "Reserved or uncommunicative in speech." },
      { question: "Choose the synonym of 'mitigate'.", answer: "Lessen", wrong: ["Increase", "Worsen", "Create"], hint: "To make less severe, serious, or painful." },
      { question: "Select the synonym of 'voracious'.", answer: "Greedy", wrong: ["Full", "Generous", "Satisfied"], hint: "Wanting or devouring great quantities of food or information." },
      { question: "What does 'equivocal' mean?", answer: "Vague", wrong: ["Clear", "Direct", "Certain"], hint: "Open to more than one interpretation." },
      { question: "Choose the synonym of 'gregarious'.", answer: "Sociable", wrong: ["Shy", "Quiet", "Hostile"], hint: "Fond of company." },
      { question: "What does 'ubiquitous' mean?", answer: "Everywhere", wrong: ["Rare", "Unique", "Nowhere"], hint: "Present, appearing, or found everywhere." },
      { question: "Choose the synonym of 'transient'.", answer: "Temporary", wrong: ["Permanent", "Long", "Sturdy"], hint: "Lasting only for a short time." },
      { question: "What is the antonym of 'lethargic'?", answer: "Energetic", wrong: ["Lazy", "Tired", "Slow"], hint: "Opposite of sluggish and apathetic." }
    ]
  },
  verb_to_be: {
    easy: [
      { question: "Choose the correct form: I ___ a student.", answer: "am", wrong: ["is", "are", "be"], hint: "First-person singular pronoun takes 'am'." },
      { question: "Choose the correct form: She ___ my friend.", answer: "is", wrong: ["am", "are", "were"], hint: "Third-person singular takes 'is'." },
      { question: "Choose the correct form: They ___ playing soccer.", answer: "are", wrong: ["is", "am", "was"], hint: "Plural pronoun takes 'are' in present." },
      { question: "Choose the correct form: Yesterday, it ___ raining.", answer: "was", wrong: ["is", "am", "were"], hint: "Past singular form for 'it'." },
      { question: "Choose the correct form: We ___ at school now.", answer: "are", wrong: ["is", "am", "was"], hint: "First-person plural takes 'are'." },
      { question: "Choose the correct form: You ___ very kind.", answer: "are", wrong: ["is", "am", "be"], hint: "Second-person takes 'are' in present." },
      { question: "Choose the correct form: He ___ not here today.", answer: "is", wrong: ["am", "are", "be"], hint: "Third-person singular negative." },
      { question: "Choose the correct form: The dog ___ barking.", answer: "is", wrong: ["are", "am", "were"], hint: "Singular noun takes 'is'." },
      { question: "Choose the correct form: Last year, they ___ in Grade 5.", answer: "were", wrong: ["was", "are", "is"], hint: "Past plural form for 'they'." },
      { question: "Choose the correct form: The cat and dog ___ sleeping.", answer: "are", wrong: ["is", "was", "am"], hint: "Compound subject joined by 'and' is plural." },
      { question: "Choose the correct form: It ___ a sunny day.", answer: "is", wrong: ["am", "are", "be"], hint: "Singular 'it' present tense." },
      { question: "Choose the correct form: Who ___ you?", answer: "are", wrong: ["is", "am", "was"], hint: "Subject 'you' takes 'are'." },
      { question: "Choose the correct form: ___ she coming?", answer: "Is", wrong: ["Are", "Am", "Be"], hint: "Question form for singular she." },
      { question: "Choose the correct form: I ___ tired yesterday.", answer: "was", wrong: ["am", "were", "are"], hint: "Past tense first-person singular." },
      { question: "Choose the correct form: We ___ happy to help.", answer: "are", wrong: ["is", "am", "was"], hint: "Plural subject takes 'are'." }
    ],
    medium: [
      { question: "Choose the correct form: Neither of the books ___ interesting.", answer: "is", wrong: ["are", "were", "been"], hint: "The subject is 'neither', which is singular." },
      { question: "Choose the correct form: Each of the students ___ given a pen.", answer: "was", wrong: ["were", "are", "been"], hint: "Subject 'each' takes a singular verb." },
      { question: "Choose the correct form: The committee ___ meeting tomorrow.", answer: "is", wrong: ["are", "were", "am"], hint: "Collective noun acting as a single unit." },
      { question: "Choose the correct form: There ___ many reasons to study.", answer: "are", wrong: ["is", "was", "be"], hint: "The real subject 'reasons' is plural." },
      { question: "Choose the correct form: Either you or he ___ responsible.", answer: "is", wrong: ["are", "am", "were"], hint: "With 'either/or', verb agrees with the closer subject 'he'." },
      { question: "Choose the correct form: Mathematics ___ my favorite subject.", answer: "is", wrong: ["are", "were", "be"], hint: "Subjects ending in -ics are usually singular." },
      { question: "Choose the correct form: Ten dollars ___ a lot of money.", answer: "is", wrong: ["are", "were", "be"], hint: "A specific sum of money takes a singular verb." },
      { question: "Choose the correct form: Both of my brothers ___ doctors.", answer: "are", wrong: ["is", "was", "been"], hint: "'Both' is plural." },
      { question: "Choose the correct form: One of the cars ___ red.", answer: "is", wrong: ["are", "were", "be"], hint: "The subject 'one' is singular." },
      { question: "Choose the correct form: The news ___ shocking.", answer: "is", wrong: ["are", "were", "been"], hint: "The noun 'news' is uncountable and singular." },
      { question: "Choose the correct form: There ___ some water in the glass.", answer: "is", wrong: ["are", "were", "be"], hint: "'Water' is uncountable and singular." },
      { question: "Choose the correct form: A pack of wolves ___ howling.", answer: "is", wrong: ["are", "were", "be"], hint: "Collective noun 'pack' is singular." },
      { question: "Choose the correct form: A number of students ___ absent.", answer: "are", wrong: ["is", "was", "been"], hint: "The phrase 'a number of' acts as plural." },
      { question: "Choose the correct form: None of the milk ___ spoiled.", answer: "is", wrong: ["are", "were", "be"], hint: "'Milk' is uncountable and singular." },
      { question: "Choose the correct form: Every boy and girl ___ ready.", answer: "is", wrong: ["are", "were", "be"], hint: "Subjects preceded by 'every' take singular verbs." }
    ],
    hard: [
      { question: "Choose the correct form: If I ___ you, I would study hard.", answer: "were", wrong: ["was", "am", "be"], hint: "Subjunctive mood for hypothetical statements." },
      { question: "Choose the correct form: The team members ___ debating the rules.", answer: "are", wrong: ["is", "was", "been"], hint: "Focus is on individual members, which is plural." },
      { question: "Choose the correct form: Not only the students but also the teacher ___ laughing.", answer: "is", wrong: ["are", "were", "been"], hint: "Agrees with the closer subject 'teacher'." },
      { question: "Choose the correct form: Economics ___ studied by many.", answer: "is", wrong: ["are", "were", "be"], hint: "'Economics' is a singular subject field." },
      { question: "Choose the correct form: Fifty miles ___ a long distance.", answer: "is", wrong: ["are", "were", "be"], hint: "Distance is treated as a singular unit." },
      { question: "Choose the correct form: The jury ___ divided in their opinions.", answer: "were", wrong: ["was", "is", "been"], hint: "Jury members act individually, plural." },
      { question: "Choose the correct form: Many a student ___ failed this test.", answer: "has been", wrong: ["have been", "is", "are"], hint: "'Many a' singular construction." },
      { question: "Choose the correct form: A series of lectures ___ scheduled.", answer: "is", wrong: ["are", "were", "been"], hint: "The singular subject is 'series'." },
      { question: "Choose the correct form: Either the supervisor or the employees ___ blamed.", answer: "are", wrong: ["is", "was", "be"], hint: "Agrees with plural closer subject 'employees'." },
      { question: "Choose the correct form: All of the cake ___ eaten.", answer: "was", wrong: ["were", "are", "been"], hint: "'All' of uncountable singular 'cake' is singular." },
      { question: "Choose the correct form: He acts as if he ___ the boss.", answer: "were", wrong: ["was", "is", "am"], hint: "Subjunctive mood for unreal situations." },
      { question: "Choose the correct form: The majority of the voters ___ in favor.", answer: "are", wrong: ["is", "was", "been"], hint: "Voters are countable plural." },
      { question: "Choose the correct form: Every one of the boxes ___ heavy.", answer: "is", wrong: ["are", "were", "be"], hint: "The subject 'every one' is singular." },
      { question: "Choose the correct form: Physics ___ considered difficult.", answer: "is", wrong: ["are", "were", "be"], hint: "Singular academic subject." },
      { question: "Choose the correct form: The logistics ___ handled by a firm.", answer: "are", wrong: ["is", "was", "been"], hint: "'Logistics' is treated as plural here." }
    ]
  },
  past_simple: {
    easy: [
      { question: "Choose the correct form: Yesterday, I ___ a book.", answer: "read", wrong: ["reads", "reading", "will read"], hint: "Past tense of read (spelled the same, sounds like 'red')." },
      { question: "Choose the correct form: She ___ to the park last Sunday.", answer: "went", wrong: ["go", "goes", "gone"], hint: "Past tense of irregular verb 'go'." },
      { question: "Choose the correct form: They ___ a new house last year.", answer: "bought", wrong: ["buy", "buys", "buying"], hint: "Past tense of irregular verb 'buy'." },
      { question: "Choose the correct form: We ___ soccer after school.", answer: "played", wrong: ["play", "plays", "playing"], hint: "Past tense of regular verb 'play'." },
      { question: "Choose the correct form: I ___ my keys this morning.", answer: "lost", wrong: ["lose", "loses", "losing"], hint: "Past tense of irregular verb 'lose'." },
      { question: "Choose the correct form: He ___ a delicious cake.", answer: "made", wrong: ["make", "makes", "making"], hint: "Past tense of irregular verb 'make'." },
      { question: "Choose the correct form: They ___ to music yesterday.", answer: "listened", wrong: ["listen", "listens", "listening"], hint: "Past tense of regular verb 'listen'." },
      { question: "Choose the correct form: We ___ a movie last night.", answer: "watched", wrong: ["watch", "watches", "watching"], hint: "Past tense of regular verb 'watch'." },
      { question: "Choose the correct form: She ___ her homework early.", answer: "did", wrong: ["do", "does", "done"], hint: "Past tense of irregular verb 'do'." },
      { question: "Choose the correct form: The cat ___ on the mat.", answer: "sat", wrong: ["sit", "sits", "sitting"], hint: "Past tense of irregular verb 'sit'." },
      { question: "Choose the correct form: I ___ my lunch at noon.", answer: "ate", wrong: ["eat", "eats", "eating"], hint: "Past tense of irregular verb 'eat'." },
      { question: "Choose the correct form: They ___ the test on time.", answer: "finished", wrong: ["finish", "finishes", "finishing"], hint: "Past tense of regular verb 'finish'." },
      { question: "Choose the correct form: He ___ a letter to his penpal.", answer: "wrote", wrong: ["write", "writes", "writing"], hint: "Past tense of irregular verb 'write'." },
      { question: "Choose the correct form: We ___ the match last week.", answer: "won", wrong: ["win", "wins", "winning"], hint: "Past tense of irregular verb 'win'." },
      { question: "Choose the correct form: She ___ the question easily.", answer: "answered", wrong: ["answer", "answers", "answering"], hint: "Past tense of regular verb 'answer'." }
    ],
    medium: [
      { question: "Choose the correct form: The wind ___ strongly last night.", answer: "blew", wrong: ["blowed", "blown", "blows"], hint: "Past tense of irregular verb 'blow'." },
      { question: "Choose the correct form: They ___ the truth to the judge.", answer: "spoke", wrong: ["speaked", "spoken", "speaks"], hint: "Past tense of irregular verb 'speak'." },
      { question: "Choose the correct form: He ___ a deep hole in the garden.", answer: "dug", wrong: ["digged", "digs", "digging"], hint: "Past tense of irregular verb 'dig'." },
      { question: "Choose the correct form: She ___ the bird fly away.", answer: "saw", wrong: ["seen", "seed", "sees"], hint: "Past tense of irregular verb 'see'." },
      { question: "Choose the correct form: We ___ the bell ring.", answer: "heard", wrong: ["heared", "hear", "hears"], hint: "Past tense of irregular verb 'hear'." },
      { question: "Choose the correct form: He ___ the heavy box on the table.", answer: "laid", wrong: ["lay", "lied", "lain"], hint: "Past tense of transitive verb 'lay'." },
      { question: "Choose the correct form: They ___ from the high tower.", answer: "dove", wrong: ["dived", "diven", "divs"], hint: "Past tense of 'dive' is dove or dived." },
      { question: "Choose the correct form: She ___ a warm sweater.", answer: "wore", wrong: ["weared", "worn", "wears"], hint: "Past tense of irregular verb 'wear'." },
      { question: "Choose the correct form: We ___ the cold water.", answer: "drank", wrong: ["drunk", "drinked", "drinks"], hint: "Past tense of irregular verb 'drink'." },
      { question: "Choose the correct form: The thief ___ the gold watch.", answer: "stole", wrong: ["stealed", "stolen", "steals"], hint: "Past tense of irregular verb 'steal'." },
      { question: "Choose the correct form: He ___ from the horse.", answer: "fell", wrong: ["fallen", "felled", "falls"], hint: "Past tense of irregular verb 'fall'." },
      { question: "Choose the correct form: The children ___ in the pool.", answer: "swam", wrong: ["swum", "swimmed", "swims"], hint: "Past tense of irregular verb 'swim'." },
      { question: "Choose the correct form: They ___ a song together.", answer: "sang", wrong: ["sung", "singed", "sings"], hint: "Past tense of irregular verb 'sing'." },
      { question: "Choose the correct form: She ___ her keys in the drawer.", answer: "hid", wrong: ["hidden", "hided", "hides"], hint: "Past tense of irregular verb 'hide'." },
      { question: "Choose the correct form: We ___ the secret for weeks.", answer: "kept", wrong: ["keeped", "keep", "keeping"], hint: "Past tense of irregular verb 'keep'." }
    ],
    hard: [
      { question: "Choose the correct form: The snake ___ him on the ankle.", answer: "bit", wrong: ["bitten", "bited", "bite"], hint: "Past tense of irregular verb 'bite'." },
      { question: "Choose the correct form: The pipe ___ during the freeze.", answer: "burst", wrong: ["bursted", "bursts", "bursting"], hint: "'Burst' has the same form in past simple." },
      { question: "Choose the correct form: He ___ the table with cloth.", answer: "clad", wrong: ["clothed", "cladded", "clothes"], hint: "Past tense of 'clothe' is clad or clothed." },
      { question: "Choose the correct form: The price ___ by ten percent.", answer: "shrank", wrong: ["shrunk", "shrinked", "shrinks"], hint: "Past tense of irregular verb 'shrink'." },
      { question: "Choose the correct form: She ___ the seeds on the ground.", answer: "strewed", wrong: ["strewn", "strew", "strews"], hint: "Past tense of irregular verb 'strew'." },
      { question: "Choose the correct form: They ___ under oath.", answer: "swore", wrong: ["swared", "sworn", "swears"], hint: "Past tense of irregular verb 'swear'." },
      { question: "Choose the correct form: He ___ the metal together.", answer: "welded", wrong: ["weld", "welding", "welds"], hint: "Past tense of regular verb 'weld'." },
      { question: "Choose the correct form: The ship ___ quickly after hit.", answer: "sank", wrong: ["sunk", "sinked", "sinks"], hint: "Past tense of irregular verb 'sink'." },
      { question: "Choose the correct form: She ___ the thread in the needle.", answer: "threaded", wrong: ["thread", "threads", "threading"], hint: "Past tense of regular verb 'thread'." },
      { question: "Choose the correct form: The alarm ___ at 6 AM.", answer: "rang", wrong: ["rung", "ringed", "rings"], hint: "Past tense of irregular verb 'ring'." },
      { question: "Choose the correct form: He ___ all his money away.", answer: "flung", wrong: ["flinged", "flang", "flings"], hint: "Past tense of irregular verb 'fling'." },
      { question: "Choose the correct form: They ___ in the muddy ground.", answer: "sank", wrong: ["sunk", "sinked", "sinks"], hint: "Past tense of irregular verb 'sink'." },
      { question: "Choose the correct form: The plane ___ over the mountains.", answer: "flew", wrong: ["flied", "flown", "fly"], hint: "Past tense of irregular verb 'fly'." },
      { question: "Choose the correct form: The fire ___ all night.", answer: "glowed", wrong: ["glow", "glowing", "glows"], hint: "Past tense of regular verb 'glow'." },
      { question: "Choose the correct form: He ___ a heavy blow to the enemy.", answer: "dealt", wrong: ["dealed", "deals", "dealing"], hint: "Past tense of irregular verb 'deal'." }
    ]
  },
  past_perfect: {
    easy: [
      { question: "Choose the correct form: She ___ her lunch before the meeting.", answer: "had eaten", wrong: ["has eaten", "ate", "eating"], hint: "Use had + V3 for past perfect." },
      { question: "Choose the correct form: They ___ the game before it rained.", answer: "had started", wrong: ["have started", "started", "starting"], hint: "Use had + V3." },
      { question: "Choose the correct form: I realized I ___ my keys.", answer: "had lost", wrong: ["have lost", "lost", "losing"], hint: "Use had + V3." },
      { question: "Choose the correct form: He ___ home before we arrived.", answer: "had gone", wrong: ["has gone", "went", "goes"], hint: "Use had + V3." },
      { question: "Choose the correct form: By the time we got there, the movie ___.", answer: "had begun", wrong: ["has begun", "began", "beginning"], hint: "Use had + V3." },
      { question: "Choose the correct form: She ___ her homework before dinner.", answer: "had done", wrong: ["has done", "did", "doing"], hint: "Use had + V3." },
      { question: "Choose the correct form: They ___ the house before selling.", answer: "had painted", wrong: ["have painted", "painted", "painting"], hint: "Use had + V3." },
      { question: "Choose the correct form: We ___ each other for years.", answer: "had known", wrong: ["have known", "knew", "knowing"], hint: "Use had + V3." },
      { question: "Choose the correct form: He ___ the letter before leaving.", answer: "had written", wrong: ["has written", "wrote", "writing"], hint: "Use had + V3." },
      { question: "Choose the correct form: The train ___ before they reached.", answer: "had left", wrong: ["has left", "left", "leaving"], hint: "Use had + V3." },
      { question: "Choose the correct form: I ___ the film already.", answer: "had seen", wrong: ["have seen", "saw", "seeing"], hint: "Use had + V3." },
      { question: "Choose the correct form: They ___ their goals early.", answer: "had achieved", wrong: ["have achieved", "achieved", "achieving"], hint: "Use had + V3." },
      { question: "Choose the correct form: She ___ a map before walking.", answer: "had bought", wrong: ["has bought", "bought", "buying"], hint: "Use had + V3." },
      { question: "Choose the correct form: We ___ the bills before due.", answer: "had paid", wrong: ["have paid", "paid", "paying"], hint: "Use had + V3." },
      { question: "Choose the correct form: He ___ the window before sleep.", answer: "had closed", wrong: ["has closed", "closed", "closing"], hint: "Use had + V3." }
    ],
    medium: [
      { question: "Choose the correct form: By the time the police arrived, the thief ___.", answer: "had escaped", wrong: ["has escaped", "escaped", "escapes"], hint: "Use had + V3." },
      { question: "Choose the correct form: She was tired because she ___ all day.", answer: "had worked", wrong: ["has worked", "worked", "is working"], hint: "Use had + V3." },
      { question: "Choose the correct form: He ___ the book before taking the test.", answer: "had read", wrong: ["has read", "read", "reads"], hint: "Use had + V3." },
      { question: "Choose the correct form: They ___ the project before the deadline.", answer: "had finished", wrong: ["have finished", "finished", "finishing"], hint: "Use had + V3." },
      { question: "Choose the correct form: The grass was wet because it ___.", answer: "had rained", wrong: ["has rained", "rained", "rains"], hint: "Use had + V3." },
      { question: "Choose the correct form: She was sad because she ___ her dog.", answer: "had lost", wrong: ["has lost", "lost", "loses"], hint: "Use had + V3." },
      { question: "Choose the correct form: We ___ the match before the power cut.", answer: "had won", wrong: ["have won", "won", "wins"], hint: "Use had + V3." },
      { question: "Choose the correct form: He realized he ___ his password.", answer: "had forgotten", wrong: ["has forgotten", "forgot", "forgets"], hint: "Use had + V3." },
      { question: "Choose the correct form: They ___ the table before guests came.", answer: "had set", wrong: ["have set", "set", "sets"], hint: "Use had + V3." },
      { question: "Choose the correct form: By age ten, she ___ three languages.", answer: "had learned", wrong: ["has learned", "learned", "learns"], hint: "Use had + V3." },
      { question: "Choose the correct form: I ___ my dinner when you called.", answer: "had eaten", wrong: ["have eaten", "ate", "eats"], hint: "Use had + V3." },
      { question: "Choose the correct form: They ___ the song before performing.", answer: "had practiced", wrong: ["have practiced", "practiced", "practices"], hint: "Use had + V3." },
      { question: "Choose the correct form: She ___ the car before driving.", answer: "had washed", wrong: ["has washed", "washed", "washes"], hint: "Use had + V3." },
      { question: "Choose the correct form: He ___ the building before the fire.", answer: "had exited", wrong: ["has exited", "exited", "exits"], hint: "Use had + V3." },
      { question: "Choose the correct form: We ___ the report before submission.", answer: "had typed", wrong: ["have typed", "typed", "types"], hint: "Use had + V3." }
    ],
    hard: [
      { question: "Choose the correct form: Scarcely ___ the sun set when the storm began.", answer: "had", wrong: ["has", "did", "was"], hint: "Inversion construction with 'scarcely'." },
      { question: "Choose the correct form: If they ___ harder, they would have won.", answer: "had tried", wrong: ["have tried", "tried", "would try"], hint: "Third conditional uses past perfect in if-clause." },
      { question: "Choose the correct form: She wished she ___ the ticket.", answer: "had bought", wrong: ["has bought", "bought", "would buy"], hint: "Past wishes take past perfect." },
      { question: "Choose the correct form: No sooner ___ we arrived than the phone rang.", answer: "had", wrong: ["has", "did", "were"], hint: "Inversion construction with 'no sooner'." },
      { question: "Choose the correct form: He behaved as if he ___ nothing.", answer: "had seen", wrong: ["has seen", "saw", "was seeing"], hint: "Unreal past situation takes past perfect." },
      { question: "Choose the correct form: She denied that she ___ the money.", answer: "had stolen", wrong: ["has stolen", "stole", "steals"], hint: "Past action prior to the denial." },
      { question: "Choose the correct form: I ___ the book three times before understanding it.", answer: "had read", wrong: ["have read", "read", "was reading"], hint: "Use had + V3." },
      { question: "Choose the correct form: They ___ the node before the server crashed.", answer: "had backed up", wrong: ["have backed up", "backed up", "back up"], hint: "Use had + V3." },
      { question: "Choose the correct form: We wished you ___ us earlier.", answer: "had told", wrong: ["have told", "told", "tell"], hint: "Past wishes take past perfect." },
      { question: "Choose the correct form: The flowers died because they ___ water.", answer: "had lacked", wrong: ["have lacked", "lacked", "lack"], hint: "Use had + V3." },
      { question: "Choose the correct form: If he ___ the truth, he would be safe.", answer: "had told", wrong: ["have told", "told", "tells"], hint: "Conditional clause for past regret." },
      { question: "Choose the correct form: By 2020, they ___ the structure.", answer: "had demolished", wrong: ["have demolished", "demolished", "demolish"], hint: "Past perfect for actions completed before a past year." },
      { question: "Choose the correct form: She was pleased she ___ her exams.", answer: "had passed", wrong: ["has passed", "passed", "passes"], hint: "Action completed prior to being pleased." },
      { question: "Choose the correct form: He was upset because they ___ him.", answer: "had rejected", wrong: ["have rejected", "rejected", "reject"], hint: "Action completed prior to being upset." },
      { question: "Choose the correct form: We ___ the base before the launch.", answer: "had secured", wrong: ["have secured", "secured", "secure"], hint: "Use had + V3." }
    ]
  },
  future_tense: {
    easy: [
      { question: "Choose the correct form: Tomorrow, I ___ to the beach.", answer: "will go", wrong: ["go", "went", "going"], hint: "Simple future prediction." },
      { question: "Choose the correct form: She ___ a doctor when she grows up.", answer: "is going to be", wrong: ["is being", "will been", "was"], hint: "Future plan/intention." },
      { question: "Choose the correct form: They ___ soccer this afternoon.", answer: "are going to play", wrong: ["will played", "played", "playing"], hint: "Planned future event." },
      { question: "Choose the correct form: Look at the clouds! It ___.", answer: "is going to rain", wrong: ["will rained", "rained", "rains"], hint: "Future prediction based on present evidence." },
      { question: "Choose the correct form: I promise I ___ you later.", answer: "will call", wrong: ["am calling", "called", "calls"], hint: "Promises take 'will'." },
      { question: "Choose the correct form: He ___ a new car next week.", answer: "is going to buy", wrong: ["will bought", "bought", "buying"], hint: "Prior plan/decision." },
      { question: "Choose the correct form: We ___ a movie tonight.", answer: "are going to watch", wrong: ["watched", "watching", "watch"], hint: "Prior plan/intention." },
      { question: "Choose the correct form: I think they ___ the game.", answer: "will win", wrong: ["are winning", "won", "wins"], hint: "Opinion prediction." },
      { question: "Choose the correct form: She ___ her bedroom tomorrow.", answer: "is going to clean", wrong: ["will cleaned", "cleaned", "cleans"], hint: "Intended future action." },
      { question: "Choose the correct form: Wait! I ___ you carry that.", answer: "will help", wrong: ["am helping", "helped", "helps"], hint: "Instant offer takes 'will'." },
      { question: "Choose the correct form: They ___ to London next summer.", answer: "are going to travel", wrong: ["travelled", "travels", "travelling"], hint: "Prior plan/intention." },
      { question: "Choose the correct form: He ___ lunch in ten minutes.", answer: "will have", wrong: ["had", "having", "has"], hint: "Future event prediction." },
      { question: "Choose the correct form: We ___ a party next Saturday.", answer: "are going to host", wrong: ["hosted", "hosting", "hosts"], hint: "Planned future event." },
      { question: "Choose the correct form: I think the weather ___ nice.", answer: "will be", wrong: ["is going to", "was", "been"], hint: "Simple future prediction." },
      { question: "Choose the correct form: She ___ a letter tonight.", answer: "is going to write", wrong: ["will wrote", "wrote", "writing"], hint: "Intended future action." }
    ],
    medium: [
      { question: "Choose the correct form: This time next year, we ___ in college.", answer: "will be studying", wrong: ["will study", "will have studied", "are studying"], hint: "Action in progress at a specific time in the future." },
      { question: "Choose the correct form: They ___ their project by Friday.", answer: "will have finished", wrong: ["will finish", "are finishing", "finish"], hint: "Action completed before a future deadline (future perfect)." },
      { question: "Choose the correct form: I ___ my grandparents this weekend.", answer: "am going to visit", wrong: ["will visited", "visited", "visiting"], hint: "Prior arrangement/plan." },
      { question: "Choose the correct form: By the time you arrive, the train ___.", answer: "will have left", wrong: ["will leave", "is leaving", "leaves"], hint: "Action completed before a future point." },
      { question: "Choose the correct form: He ___ his exams next month.", answer: "is going to take", wrong: ["will taken", "took", "takes"], hint: "Intention/arrangement." },
      { question: "Choose the correct form: We ___ the house tomorrow morning.", answer: "are going to paint", wrong: ["will painted", "painted", "painting"], hint: "Prior plan." },
      { question: "Choose the correct form: I believe he ___ the president.", answer: "will become", wrong: ["is going to", "became", "becomes"], hint: "Belief prediction." },
      { question: "Choose the correct form: They ___ for two hours by noon.", answer: "will have been running", wrong: ["will run", "will be running", "ran"], hint: "Duration up to a future point (future perfect continuous)." },
      { question: "Choose the correct form: She ___ a new cake recipe tonight.", answer: "is going to try", wrong: ["will tried", "tried", "tries"], hint: "Intended plan." },
      { question: "Choose the correct form: The movie ___ at 8 PM.", answer: "is going to start", wrong: ["will started", "started", "starts"], hint: "Planned schedule." },
      { question: "Choose the correct form: I ___ you if you need assistance.", answer: "will assist", wrong: ["am assisting", "assisted", "assists"], hint: "Instant offer/promise." },
      { question: "Choose the correct form: We ___ a conference next Monday.", answer: "are going to attend", wrong: ["attended", "attending", "attends"], hint: "Prior plan." },
      { question: "Choose the correct form: By next month, I ___ here for a year.", answer: "will have lived", wrong: ["will live", "am living", "lived"], hint: "Action completed before a future point." },
      { question: "Choose the correct form: He ___ his homework after dinner.", answer: "is going to do", wrong: ["will did", "did", "does"], hint: "Intended action." },
      { question: "Choose the correct form: I think they ___ the invitation.", answer: "will accept", wrong: ["are accepting", "accepted", "accepts"], hint: "Opinion prediction." }
    ],
    hard: [
      { question: "Choose the correct form: By this time tomorrow, she ___ her flight.", answer: "will have boarded", wrong: ["will board", "is boarding", "boards"], hint: "Action completed by a future time." },
      { question: "Choose the correct form: I ___ the reports before you ask.", answer: "will have compiled", wrong: ["will compile", "compiling", "compile"], hint: "Action completed prior to another future action." },
      { question: "Choose the correct form: They ___ for hours by the time we arrive.", answer: "will have been waiting", wrong: ["will wait", "will be waiting", "waited"], hint: "Continuous action up to a future point." },
      { question: "Choose the correct form: If you do that, you ___ yourself.", answer: "will hurt", wrong: ["are going to hurt", "hurt", "hurts"], hint: "Conditional prediction." },
      { question: "Choose the correct form: We ___ our business by 2028.", answer: "will have expanded", wrong: ["will expand", "are expanding", "expand"], hint: "Completion before a future year." },
      { question: "Choose the correct form: He ___ for the team by next season.", answer: "will have been playing", wrong: ["will play", "will be playing", "played"], hint: "Duration of action up to a future point." },
      { question: "Choose the correct form: I ___ the contract by tomorrow noon.", answer: "will have signed", wrong: ["will sign", "signing", "sign"], hint: "Completion by a future deadline." },
      { question: "Choose the correct form: They ___ the bridge by next winter.", answer: "will have constructed", wrong: ["will construct", "constructing", "construct"], hint: "Completion by a future season." },
      { question: "Choose the correct form: By next week, she ___ for ten years.", answer: "will have been teaching", wrong: ["will teach", "will be teaching", "taught"], hint: "Continuous duration up to next week." },
      { question: "Choose the correct form: I promise I ___ the secret.", answer: "will not reveal", wrong: ["am not going to reveal", "revealed", "reveals"], hint: "Promises take 'will'." },
      { question: "Choose the correct form: We ___ the final details tonight.", answer: "will have finalized", wrong: ["will finalize", "finalizing", "finalize"], hint: "Completion tonight." },
      { question: "Choose the correct form: He ___ his degree before summer.", answer: "will have earned", wrong: ["will earn", "earning", "earns"], hint: "Completion prior to summer." },
      { question: "Choose the correct form: They ___ the region by tomorrow.", answer: "will have evacuated", wrong: ["will evacuate", "evacuating", "evacuate"], hint: "Completion by tomorrow." },
      { question: "Choose the correct form: By tonight, I ___ for twelve hours.", answer: "will have been working", wrong: ["will work", "will be working", "worked"], hint: "Duration up to tonight." },
      { question: "Choose the correct form: She ___ the results by Friday.", answer: "will have published", wrong: ["will publish", "publishing", "publish"], hint: "Completion by Friday." }
    ]
  },
  parts_of_speech: {
    easy: [
      { question: "Identify the noun: The cat ran.", answer: "cat", wrong: ["The", "ran", "fast"], hint: "A noun is a person, place, or thing." },
      { question: "Identify the verb: She sang loudly.", answer: "sang", wrong: ["She", "loudly", "sweet"], hint: "A verb expresses action." },
      { question: "Identify the adjective: The green leaf fell.", answer: "green", wrong: ["leaf", "fell", "The"], hint: "An adjective describes a noun." },
      { question: "Identify the pronoun: They went home.", answer: "They", wrong: ["went", "home", "back"], hint: "A pronoun replaces a noun." },
      { question: "Identify the adverb: He walked slowly.", answer: "slowly", wrong: ["walked", "He", "road"], hint: "An adverb describes a verb, often ending in -ly." },
      { question: "Identify the preposition: The key is in the box.", answer: "in", wrong: ["key", "box", "the"], hint: "A preposition shows location or direction." },
      { question: "Identify the noun: London is beautiful.", answer: "London", wrong: ["is", "beautiful", "very"], hint: "Proper noun naming a city." },
      { question: "Identify the verb: We played games.", answer: "played", wrong: ["We", "games", "fun"], hint: "Action word." },
      { question: "Identify the adjective: I saw a tall building.", answer: "tall", wrong: ["building", "saw", "I"], hint: "Describes the height of the building." },
      { question: "Identify the pronoun: She called me.", answer: "She", wrong: ["called", "phone", "yes"], hint: "Replaces a female name." },
      { question: "Identify the adverb: She smiled happily.", answer: "happily", wrong: ["smiled", "She", "nice"], hint: "Describes how she smiled." },
      { question: "Identify the preposition: Stand under the tree.", answer: "under", wrong: ["tree", "the", "Stand"], hint: "Shows position relative to the tree." },
      { question: "Identify the noun: Honesty is good.", answer: "Honesty", wrong: ["is", "good", "very"], hint: "Abstract noun representing a quality." },
      { question: "Identify the verb: Read this letter.", answer: "Read", wrong: ["this", "letter", "now"], hint: "Action to perform." },
      { question: "Identify the adjective: We drank cold water.", answer: "cold", wrong: ["water", "drank", "We"], hint: "Describes the temperature of the water." }
    ],
    medium: [
      { question: "Identify the conjunction: I like tea and coffee.", answer: "and", wrong: ["like", "tea", "coffee"], hint: "Connects words or clauses." },
      { question: "Identify the pronoun: This is mine.", answer: "mine", wrong: ["This", "is", "belong"], hint: "Possessive pronoun." },
      { question: "Identify the adverb: The project is almost finished.", answer: "almost", wrong: ["finished", "project", "is"], hint: "Adverb of degree modifying 'finished'." },
      { question: "Identify the preposition: Walk along the path.", answer: "along", wrong: ["Walk", "path", "the"], hint: "Shows direction of movement." },
      { question: "Identify the noun: Friendship is precious.", answer: "Friendship", wrong: ["precious", "is", "very"], hint: "Abstract noun." },
      { question: "Identify the verb: She seems tired.", answer: "seems", wrong: ["tired", "She", "sleepy"], hint: "Linking verb connecting subject and description." },
      { question: "Identify the adjective: That is an amazing story.", answer: "amazing", wrong: ["story", "That", "is"], hint: "Describes the story." },
      { question: "Identify the conjunction: I went but he stayed.", answer: "but", wrong: ["went", "he", "stayed"], hint: "Coordinating conjunction showing contrast." },
      { question: "Identify the pronoun: Who called you?", answer: "Who", wrong: ["called", "you", "phone"], hint: "Interrogative pronoun." },
      { question: "Identify the adverb: He is very tall.", answer: "very", wrong: ["tall", "He", "is"], hint: "Modifies adjective 'tall'." },
      { question: "Identify the preposition: She stood behind him.", answer: "behind", wrong: ["stood", "him", "She"], hint: "Shows relative position." },
      { question: "Identify the noun: The decision was hard.", answer: "decision", wrong: ["hard", "was", "The"], hint: "Noun representing an outcome." },
      { question: "Identify the verb: We must decide now.", answer: "decide", wrong: ["must", "now", "We"], hint: "Action verb after modal 'must'." },
      { question: "Identify the adjective: This is a golden chance.", answer: "golden", wrong: ["chance", "This", "is"], hint: "Describes the quality of the chance." },
      { question: "Identify the conjunction: Stay here until I return.", answer: "until", wrong: ["Stay", "here", "return"], hint: "Subordinating conjunction of time." }
    ],
    hard: [
      { question: "Identify the gerund acting as noun: Swimming is fun.", answer: "Swimming", wrong: ["is", "fun", "good"], hint: "Verb ending in -ing acting as subject noun." },
      { question: "Identify the relative pronoun: The man who left is my uncle.", answer: "who", wrong: ["man", "left", "uncle"], hint: "Connects modifying clause to 'man'." },
      { question: "Identify the preposition: Despite the rain, we went out.", answer: "Despite", wrong: ["rain", "went", "out"], hint: "Preposition showing concession." },
      { question: "Identify the conjunctive adverb: Therefore, we must leave.", answer: "Therefore", wrong: ["must", "leave", "we"], hint: "Connects thoughts and shows consequence." },
      { question: "Identify the participle acting as adjective: The crying baby slept.", answer: "crying", wrong: ["baby", "slept", "little"], hint: "Verb form modifying noun 'baby'." },
      { question: "Identify the reflexive pronoun: He did it himself.", answer: "himself", wrong: ["did", "it", "He"], hint: "Refers back to subject 'He'." },
      { question: "Identify the adverb: She ran upstairs.", answer: "upstairs", wrong: ["ran", "She", "fast"], hint: "Adverb of place showing where she ran." },
      { question: "Identify the preposition: He stood among the crowd.", answer: "among", wrong: ["stood", "crowd", "the"], hint: "Preposition meaning in the middle of." },
      { question: "Identify the noun clause: What you said is true.", answer: "What you said", wrong: ["is true", "true", "said"], hint: "A whole clause acting as the subject." },
      { question: "Identify the auxiliary verb: We have completed it.", answer: "have", wrong: ["completed", "it", "We"], hint: "Helping verb forming present perfect." },
      { question: "Identify the adjective: This is an idle talk.", answer: "idle", wrong: ["talk", "This", "is"], hint: "Describes the talk." },
      { question: "Identify the conjunction: Neither he nor she came.", answer: "Neither...nor", wrong: ["he", "she", "came"], hint: "Correlative conjunctions." },
      { question: "Identify the pronoun: Either will do.", answer: "Either", wrong: ["will", "do", "N/A"], hint: "Indefinite pronoun acting as subject." },
      { question: "Identify the adverb: He is somewhat better.", answer: "somewhat", wrong: ["better", "He", "is"], hint: "Modifies adjective 'better'." },
      { question: "Identify the preposition: Look through the window.", answer: "through", wrong: ["Look", "window", "the"], hint: "Shows path of looking." }
    ]
  },
  spelling: {
    easy: [
      { question: "Which word is spelled correctly?", answer: "Receive", wrong: ["Recieve", "Receve", "Receivee"], hint: "Remember: 'I before E except after C'." },
      { question: "Identify the correct spelling:", answer: "Definitely", wrong: ["Definately", "Definitly", "Defenitely"], hint: "Derived from 'definite'." },
      { question: "Which of the following is correct?", answer: "Tomorrow", wrong: ["Tommorow", "Tomorow", "Tommorrow"], hint: "One 'm' and two 'r's." },
      { question: "Choose the correct spelling:", answer: "Friend", wrong: ["Freind", "Frind", "Friende"], hint: "F-R-I-E-N-D." },
      { question: "Find the correctly spelled homophone: Look over ___!", answer: "there", wrong: ["their", "they're", "thare"], hint: "Refers to a place." },
      { question: "Select the correct spelling:", answer: "Until", wrong: ["Untill", "Untel", "Unetil"], hint: "Only ends with one 'l'." },
      { question: "Which spelling is correct?", answer: "Believe", wrong: ["Beleive", "Belive", "Believee"], hint: "'I before E except after C'." },
      { question: "Choose the correct spelling:", answer: "Beautiful", wrong: ["Beatiful", "Beutiful", "Beatifuls"], hint: "B-E-A-U-tiful." },
      { question: "Find the correct spelling:", answer: "Because", wrong: ["Becouse", "Becauses", "Becasue"], hint: "B-E-C-A-U-S-E." },
      { question: "Choose the correct spelling:", answer: "Library", wrong: ["Libary", "Librery", "Libery"], hint: "Contains the word 'bra'." },
      { question: "Which of these is correct?", answer: "People", wrong: ["Poeple", "Peaple", "Peoples"], hint: "P-E-O-P-L-E." },
      { question: "Choose the correct spelling:", answer: "Running", wrong: ["Runing", "Runnig", "Runnings"], hint: "Double the 'n' in present participle." },
      { question: "Identify the correct spelling:", answer: "Different", wrong: ["Diferent", "Differant", "Diferant"], hint: "Double 'f' and ends in '-ent'." },
      { question: "Which word is correct?", answer: "School", wrong: ["Schoole", "Shool", "Scool"], hint: "S-C-H-O-O-L." },
      { question: "Select the correct spelling:", answer: "Animal", wrong: ["Anemal", "Animle", "Anamle"], hint: "A-N-I-M-A-L." }
    ],
    medium: [
      { question: "Find the correct spelling:", answer: "Occurred", wrong: ["Ocured", "Occured", "Ocurred"], hint: "Double 'c' and double 'r'." },
      { question: "Which word is spelled correctly?", answer: "Accommodate", wrong: ["Accomodate", "Acomodate", "Acommodate"], hint: "Double 'c' and double 'm'." },
      { question: "Select the correct spelling:", answer: "Calendar", wrong: ["Calender", "Colendar", "Calandar"], hint: "Ends with '-ar'." },
      { question: "Find the correct spelling:", answer: "Separate", wrong: ["Seperate", "Saparate", "Seprate"], hint: "There is 'a rat' in separate." },
      { question: "Which spelling is correct?", answer: "Dilemma", wrong: ["Dilema", "Dylemma", "Dillema"], hint: "D-I-L-E-M-M-A." },
      { question: "Find the correct spelling:", answer: "Foreign", wrong: ["Foriegn", "Forign", "Forein"], hint: "F-O-R-E-I-G-N." },
      { question: "Which word is spelled correctly?", answer: "Restaurant", wrong: ["Resturant", "Restaraunt", "Restoront"], hint: "Has 'taur' in the middle." },
      { question: "Choose the correct spelling:", answer: "Necessary", wrong: ["Neccessary", "Necesary", "Neccesary"], hint: "One collar (c), two sleeves (s)." },
      { question: "Identify the correct spelling:", answer: "Guarantee", wrong: ["Garantee", "Guarante", "Garantie"], hint: "Starts with G-U-A." },
      { question: "Which spelling is correct?", answer: "Embarrass", wrong: ["Embaras", "Embarass", "Embbarrass"], hint: "Double 'r' and double 's'." },
      { question: "Choose the correct spelling:", answer: "Receipt", wrong: ["Reciept", "Receipts", "Receipte"], hint: "'I before E except after C'." },
      { question: "Select the correct spelling:", answer: "Argument", wrong: ["Arguement", "Argumant", "Argumint"], hint: "Drop the 'e' from argue." },
      { question: "Find the correct spelling:", answer: "Foreigner", wrong: ["Foriegner", "Forigner", "Foreiner"], hint: "Derived from foreign." },
      { question: "Which word is correct?", answer: "Language", wrong: ["Langage", "Languge", "Lenguage"], hint: "L-A-N-G-U-A-G-E." },
      { question: "Select the correct spelling:", answer: "Privilege", wrong: ["Privelege", "Priviledge", "Privileges"], hint: "P-R-I-V-I-L-E-G-E." }
    ],
    hard: [
      { question: "Which spelling is correct?", answer: "Supersede", wrong: ["Supercede", "Superceed", "Superseed"], hint: "Ends with '-sede', meaning to take the place of." },
      { question: "Select the correct spelling:", answer: "Mischievous", wrong: ["Mischevious", "Mischivous", "Mischievious"], hint: "Three syllables: mis-chiev-ous." },
      { question: "Which word is spelled correctly?", answer: "Conscientious", wrong: ["Consciencious", "Consientious", "Conscientous"], hint: "Contains 'science'." },
      { question: "Select the correct spelling:", answer: "Pharaoh", wrong: ["Pharoah", "Phaorah", "Pharaohs"], hint: "Ends with '-aoh'." },
      { question: "Find the correct spelling:", answer: "Liaison", wrong: ["Liason", "Liaisonn", "Liasion"], hint: "L-I-A-I-S-O-N." },
      { question: "Which spelling is correct?", answer: "Maintenance", wrong: ["Maintainance", "Maintenence", "Maintenanse"], hint: "Derived from maintain, but spelled with '-ten-'" },
      { question: "Find the correct spelling:", answer: "Acquiesce", wrong: ["Acquese", "Acquiesc", "Aquesse"], hint: "A-C-Q-U-I-E-S-C-E." },
      { question: "Choose the correct spelling:", answer: "Idiosyncrasy", wrong: ["Idiosyncrazy", "Idiosyncrasie", "Idiosyncracy"], hint: "Ends with '-sy'." },
      { question: "Which spelling is correct?", answer: "Occurrence", wrong: ["Occurence", "Ocurence", "Ocurrence"], hint: "Double 'c', double 'r', double 'e'." },
      { question: "Select the correct spelling:", answer: "Playwright", wrong: ["Playwrite", "Playright", "Playwrights"], hint: "Ends in 'wright' (maker)." },
      { question: "Choose the correct spelling:", answer: "Sacrilegious", wrong: ["Sacreligious", "Sacriligious", "Sacrilegiouss"], hint: "Opposite of religious in letters order." },
      { question: "Select the correct spelling:", answer: "Pronunciation", wrong: ["Pronounciation", "Pronuncation", "Pronounciate"], hint: "No 'o' in the middle syllable." },
      { question: "Which spelling is correct?", answer: "Fuchsia", wrong: ["Fuschia", "Fushia", "Fucsia"], hint: "F-U-C-H-S-I-A." },
      { question: "Find the correct spelling:", answer: "Anaesthetist", wrong: ["Anesthetist", "Anaesthetistt", "Anesthetiste"], hint: "A-N-A-E-S-T-H-E-T-I-S-T." },
      { question: "Choose the correct spelling:", answer: "Hierarchy", wrong: ["Heirarchy", "Hierarky", "Hierachy"], hint: "H-I-E-R-A-R-C-H-Y." }
    ]
  },
  idioms: {
    easy: [
      { question: "What does 'break a leg' mean?", answer: "Good luck", wrong: ["Get hurt", "Dance well", "Stop playing"], hint: "Often said to actors before a show." },
      { question: "What does 'a piece of cake' mean?", answer: "Very easy", wrong: ["Delicious food", "A birthday gift", "A small portion"], hint: "Something simple to do." },
      { question: "What does 'under the weather' mean?", answer: "Sick", wrong: ["Raining", "Happy", "Cold"], hint: "Feeling slightly unwell." },
      { question: "What does 'once in a blue moon' mean?", answer: "Very rarely", wrong: ["Every month", "At night", "Frequently"], hint: "An event that happens very seldom." },
      { question: "What does 'cost an arm and a leg' mean?", answer: "Very expensive", wrong: ["Cheap", "Painful", "Fair price"], hint: "A very high price." },
      { question: "What does 'let the cat out of the bag' mean?", answer: "Reveal a secret", wrong: ["Free a pet", "Be quiet", "Get angry"], hint: "Accidentally sharing information." },
      { question: "What does 'hit the sack' mean?", answer: "Go to sleep", wrong: ["Play punch", "Clean up", "Get fired"], hint: "To go to bed." },
      { question: "What does 'miss the boat' mean?", answer: "Too late", wrong: ["Get lost", "Travel slow", "Drown"], hint: "Missing an opportunity." },
      { question: "What does 'no pain, no gain' mean?", answer: "You must work for success", wrong: ["Hurting is bad", "No rewards", "Be lazy"], hint: "Need effort to succeed." },
      { question: "What does 'see eye to eye' mean?", answer: "Agree completely", wrong: ["Stare closely", "Be enemies", "Cry together"], hint: "Sharing the same opinion." },
      { question: "What does 'so far so good' mean?", answer: "Progress is fine up to now", wrong: ["Very distant", "It is bad", "Travel well"], hint: "Things are going well currently." },
      { question: "What does 'speak of the devil' mean?", answer: "The person we were discussing just arrived", wrong: ["Speak badly", "Pray", "Get scared"], hint: "An expected person appears." },
      { question: "What does 'the best of both worlds' mean?", answer: "An ideal situation", wrong: ["Two planets", "Travel far", "Mixed feelings"], hint: "Enjoying two different opportunities." },
      { question: "What does 'time flies' mean?", answer: "Time passes quickly", wrong: ["Clock breaks", "Bugs on clock", "Late"], hint: "Time goes by fast." },
      { question: "What does 'add insult to injury' mean?", answer: "Make a bad situation worse", wrong: ["Call an ambulance", "Say sorry", "Fight back"], hint: "To double the damage." }
    ],
    medium: [
      { question: "What does 'spill the beans' mean?", answer: "Reveal a secret", wrong: ["Drop food", "Cook dinner", "Make a mess"], hint: "Letting info slip." },
      { question: "What does 'burn the midnight oil' mean?", answer: "Work late into the night", wrong: ["Waste energy", "Light a candle", "Start a fire"], hint: "Studying or working late." },
      { question: "What does 'bite the bullet' mean?", answer: "Face a difficult situation with courage", wrong: ["Eat something hard", "Shoot a gun", "Get angry"], hint: "Getting an inevitable painful task over with." },
      { question: "What does 'hit the nail on the head' mean?", answer: "Describe exactly what is causing a situation", wrong: ["Do carpentry", "Make a mistake", "Hurt yourself"], hint: "Being completely correct." },
      { question: "What does 'call it a day' mean?", answer: "Stop working on something", wrong: ["Name the day", "Start working", "Go to sleep"], hint: "Deciding to end an activity." },
      { question: "What does 'blessing in disguise' mean?", answer: "A good thing that seemed bad at first", wrong: ["A secret gift", "A magical spell", "A religious ceremony"], hint: "Something positive coming from a negative event." },
      { question: "What does 'a penny for your thoughts' mean?", answer: "Ask someone what they are thinking", wrong: ["Pay for info", "Think slow", "Buy coins"], hint: "Asking for an opinion." },
      { question: "What does 'actions speak louder than words' mean?", answer: "What you do matters more than what you say", wrong: ["Shouting is good", "Silent play", "No talking"], hint: "Deeds count." },
      { question: "What does 'back to the drawing board' mean?", answer: "Start over from the beginning", wrong: ["Draw a sketch", "Clean board", "Fail completely"], hint: "A plan failed, need a new one." },
      { question: "What does 'comparing apples to oranges' mean?", answer: "Comparing two incomparable things", wrong: ["Fruit shopping", "Fruit salad", "Healthy eating"], hint: "Things are totally different." },
      { question: "What does 'cry over spilt milk' mean?", answer: "Complain about something that can't be undone", wrong: ["Drop milk", "Get hungry", "Wash kitchen"], hint: "Useless regrets." },
      { question: "What does 'do unto others' mean?", answer: "Treat others how you want to be treated", wrong: ["Fight back", "Be selfish", "Do nothing"], hint: "The Golden Rule." },
      { question: "What does 'every cloud has a silver lining' mean?", answer: "Good things come after bad times", wrong: ["Rainy weather", "Rich clouds", "Fly high"], hint: "Optimism in difficulties." },
      { question: "What does 'haste makes waste' mean?", answer: "Slowing down saves mistakes", wrong: ["Run fast", "Throw trash", "Be quick"], hint: "Don't rush." },
      { question: "What does 'keep something at bay' mean?", answer: "Keep something at a distance", wrong: ["Go to sea", "Hold tight", "Buy dogs"], hint: "Preventing something from harming you." }
    ],
    hard: [
      { question: "What does 'barking up the wrong tree' mean?", answer: "Looking in the wrong place", wrong: ["Chasing a dog", "Climbing trees", "Shouting at someone"], hint: "Pursuing a mistaken line of thought." },
      { question: "What does 'throw in the towel' mean?", answer: "Give up or surrender", wrong: ["Clean up", "Start a fight", "Go swimming"], hint: "Admitting defeat." },
      { question: "What does 'hear it on the grapevine' mean?", answer: "Hear a rumor or gossip", wrong: ["Listen to music", "Eat grapes", "Talk on the phone"], hint: "Learning news informally." },
      { question: "What does 'take with a grain of salt' mean?", answer: "Do not take too seriously or literally", wrong: ["Add seasoning", "Be skeptical of food", "Believe completely"], hint: "Accepting with healthy doubt." },
      { question: "What does 'devil's advocate' mean?", answer: "Presenting an opposing opinion for debate", wrong: ["An evil lawyer", "A bad friend", "A supporter of rules"], hint: "Arguing the counterpoint." },
      { question: "What does 'cut corners' mean?", answer: "Do something badly or cheaply to save time/money", wrong: ["Trim paper", "Take a shortcut while walking", "Drive fast around curves"], hint: "Compromising quality for speed." },
      { question: "What does 'beat around the bush' mean?", answer: "Avoid saying what you mean directly", wrong: ["Hit plants", "Trim garden", "Run circles"], hint: "Not speaking directly." },
      { question: "What does 'burn bridges' mean?", answer: "Destroy relations or paths permanently", wrong: ["Set fire", "Cross river", "Make friends"], hint: "Cannot return to previous state." },
      { question: "What does 'on the ball' mean?", answer: "Alert and doing a good job", wrong: ["Stand on ball", "Play soccer", "Bounce"], hint: "Attentive and quick." },
      { question: "What does 'pull someone's leg' mean?", answer: "Joke with someone", wrong: ["Trip someone", "Stretch body", "Fight"], hint: "Teasing or fooling someone." },
      { question: "What does 'wrap your head around' mean?", answer: "Understand something complicated", wrong: ["Tie bandage", "Think simple", "Sleep"], hint: "Succeeding in understanding." },
      { question: "What does 'straight from the horse's mouth' mean?", answer: "From the highest authority or source", wrong: ["Talk to pets", "Eat grass", "Whisper"], hint: "Direct original source." },
      { question: "What does 'steal someone's thunder' mean?", answer: "Take credit for someone else's achievement", wrong: ["Rain cloud", "Make noise", "Rob gold"], hint: "Pre-empting someone's credit." },
      { question: "What does 'blessing in disguise' mean?", answer: "A good thing that seemed bad at first", wrong: ["Secret gift", "Magic spell", "Good luck"], hint: "Unexpected benefit." },
      { question: "What does 'ignorance is bliss' mean?", answer: "You are happier not knowing the facts", wrong: ["Being smart", "Sad truth", "Ignore rules"], hint: "Better to remain unaware." }
    ]
  },
  present_tenses: {
    easy: [
      { question: "Choose the correct form: She ___ tea every morning.", answer: "drinks", wrong: ["drink", "drinking", "drunk"], hint: "Present simple third-person singular verb ends in -s." },
      { question: "Choose the correct form: They ___ to the library now.", answer: "are going", wrong: ["goes", "go", "is going"], hint: "Present continuous tense for an action happening now." },
      { question: "Choose the correct form: I ___ my homework already.", answer: "have finished", wrong: ["finish", "finishing", "has finished"], hint: "Present perfect tense with 'already'." },
      { question: "Choose the correct form: The sun ___ in the east.", answer: "rises", wrong: ["rise", "rising", "rose"], hint: "Present simple for general truths/facts." },
      { question: "Choose the correct form: We ___ English at the moment.", answer: "are studying", wrong: ["studying", "study", "studies"], hint: "Present continuous for actions in progress." },
      { question: "Choose the correct form: He ___ a big dog.", answer: "has", wrong: ["have", "having", "is having"], hint: "Singular subject 'he' takes 'has' for possession." },
      { question: "Choose the correct form: They ___ here for three years.", answer: "have lived", wrong: ["live", "are living", "lived"], hint: "Present perfect for duration up to the present." },
      { question: "Choose the correct form: Water ___ at 100 degrees Celsius.", answer: "boils", wrong: ["boil", "boiling", "boiled"], hint: "Scientific facts use present simple tense." },
      { question: "Choose the correct form: Look! It ___.", answer: "is snowing", wrong: ["snows", "snowed", "has snowed"], hint: "Action happening at the moment of speaking." },
      { question: "Choose the correct form: She ___ her key. She cannot find it.", answer: "has lost", wrong: ["lost", "loses", "is losing"], hint: "Present perfect for past actions with present results." },
      { question: "Choose the correct form: I ___ my dinner right now.", answer: "am eating", wrong: ["eat", "eats", "ate"], hint: "First-person present continuous." },
      { question: "Choose the correct form: We usually ___ shopping on Saturdays.", answer: "go", wrong: ["goes", "going", "are going"], hint: "Habits or routines take present simple." },
      { question: "Choose the correct form: He ___ the movie twice.", answer: "has seen", wrong: ["sees", "saw", "seeing"], hint: "Present perfect for life experiences." },
      { question: "Choose the correct form: The train ___ at 9 AM daily.", answer: "leaves", wrong: ["leave", "leaving", "is leaving"], hint: "Scheduled future events use present simple." },
      { question: "Choose the correct form: Listen! The birds ___.", answer: "are singing", wrong: ["sing", "sings", "sang"], hint: "Listening to an action in progress." }
    ],
    medium: [
      { question: "Choose the correct form: Since last night, they ___ soccer.", answer: "have been playing", wrong: ["play", "are playing", "played"], hint: "Present perfect continuous for action starting in the past and continuing." },
      { question: "Choose the correct form: She ___ on the phone for two hours.", answer: "has been talking", wrong: ["talks", "is talking", "talked"], hint: "Action continuing up to present." },
      { question: "Choose the correct form: I ___ the book you recommended.", answer: "am reading", wrong: ["read", "have read", "reads"], hint: "Currently in progress, not necessarily at this instant." },
      { question: "Choose the correct form: The child ___ older day by day.", answer: "is growing", wrong: ["grows", "grow", "grown"], hint: "Gradual changes use present continuous." },
      { question: "Choose the correct form: He ___ his keys; he's looking for them.", answer: "has misplaced", wrong: ["misplaces", "misplaced", "is misplacing"], hint: "Present perfect for recent events." },
      { question: "Choose the correct form: Currently, we ___ the budget constraints.", answer: "are analyzing", wrong: ["analyze", "analyzes", "analyzed"], hint: "Temporary situations use present continuous." },
      { question: "Choose the correct form: How long ___ she ___ English?", answer: "has...been learning", wrong: ["is...learning", "does...learn", "did...learn"], hint: "Asking about duration starting in the past." },
      { question: "Choose the correct form: I ___ this film before; I know the plot.", answer: "have watched", wrong: ["watch", "am watching", "watched"], hint: "Present perfect for experience." },
      { question: "Choose the correct form: The weather ___ warmer lately.", answer: "has been getting", wrong: ["gets", "is getting", "got"], hint: "Lately takes present perfect continuous." },
      { question: "Choose the correct form: My brother ___ at the bank now.", answer: "is working", wrong: ["works", "work", "worked"], hint: "Temporary job situation." },
      { question: "Choose the correct form: She ___ all the emails today.", answer: "has sent", wrong: ["sends", "sent", "sending"], hint: "Completed actions in an unfinished time period (today)." },
      { question: "Choose the correct form: They ___ to the stadium.", answer: "are walking", wrong: ["walks", "walked", "walk"], hint: "Action in progress." },
      { question: "Choose the correct form: I ___ this company for five years.", answer: "have managed", wrong: ["manage", "am managing", "managed"], hint: "Present perfect for state continuing up to now." },
      { question: "Choose the correct form: The population of the town ___ rapidly.", answer: "is increasing", wrong: ["increases", "increase", "increased"], hint: "Trends or changing states." },
      { question: "Choose the correct form: She ___ her project by next Friday.", answer: "is finishing", wrong: ["finish", "finishing", "finished"], hint: "Present continuous for planned future arrangements." }
    ],
    hard: [
      { question: "Choose the correct form: It ___ for hours without stopping.", answer: "has been pouring", wrong: ["pours", "is pouring", "poured"], hint: "Uninterrupted continuous action." },
      { question: "Choose the correct form: The committee ___ the issue since morning.", answer: "has been debating", wrong: ["debates", "is debating", "debated"], hint: "Focus on duration of the activity." },
      { question: "Choose the correct form: I ___ this project for six months.", answer: "have been coordinating", wrong: ["coordinate", "am coordinating", "coordinated"], hint: "Ongoing professional activity." },
      { question: "Choose the correct form: This is the first time I ___ to Europe.", answer: "have been", wrong: ["am", "go", "went"], hint: "The construction 'This is the first time...' takes present perfect." },
      { question: "Choose the correct form: The bread ___ delicious; who baked it?", answer: "smells", wrong: ["is smelling", "smell", "smelled"], hint: "Stative verb of perception does not take continuous form here." },
      { question: "Choose the correct form: He ___ in Paris for years, yet speaks no French.", answer: "has been living", wrong: ["lives", "is living", "lived"], hint: "Long term situation continuing from past." },
      { question: "Choose the correct form: The climate ___ due to greenhouse gases.", answer: "is shifting", wrong: ["shifts", "shifted", "has shifted"], hint: "Action in progress/evolution." },
      { question: "Choose the correct form: This is the most complex task I ___.", answer: "have ever undertaken", wrong: ["ever undertake", "am ever undertaking", "undertook"], hint: "Present perfect for superlative experiences." },
      { question: "Choose the correct form: You look tired. What ___ you ___?", answer: "have...been doing", wrong: ["are...doing", "did...do", "do...do"], hint: "Past activity with current visible result." },
      { question: "Choose the correct form: She ___ the secret from us all along.", answer: "has been hiding", wrong: ["hides", "is hiding", "hid"], hint: "Continuous secret-keeping up to now." },
      { question: "Choose the correct form: The machinery ___ maintenance; it is noisy.", answer: "needs", wrong: ["is needing", "need", "needed"], hint: "Stative verb 'need' doesn't take continuous form." },
      { question: "Choose the correct form: Lately, there ___ a surge in sales.", answer: "has been", wrong: ["is", "was", "are"], hint: "'Lately' is a marker for present perfect." },
      { question: "Choose the correct form: By now, the letter ___ at their office.", answer: "has arrived", wrong: ["arrives", "is arriving", "arrived"], hint: "Completion with present relevance." },
      { question: "Choose the correct form: The stream ___ dried up after the heatwave.", answer: "has", wrong: ["is", "was", "had"], hint: "Present perfect active state." },
      { question: "Choose the correct form: I ___ my keys; I cannot leave.", answer: "have locked in", wrong: ["am locking in", "locked in", "locks in"], hint: "Action in past with immediate present consequence." }
    ]
  },
  nouns_and_plurals: {
    easy: [
      { question: "What is the plural of 'child'?", answer: "Children", wrong: ["Childs", "Childrens", "Childes"], hint: "Irregular plural form." },
      { question: "What is the plural of 'cat'?", answer: "Cats", wrong: ["Cates", "Catts", "Cat"], hint: "Regular plural form by adding -s." },
      { question: "Identify the proper noun: Eiffel Tower is famous.", answer: "Eiffel Tower", wrong: ["famous", "is", "N/A"], hint: "Specific named structure." },
      { question: "What is the plural of 'box'?", answer: "Boxes", wrong: ["Boxs", "Boxies", "Boxe"], hint: "Nouns ending in -x add -es." },
      { question: "What is the plural of 'mouse'?", answer: "Mice", wrong: ["Mouses", "Mices", "Mouse"], hint: "Irregular mutation plural." },
      { question: "Identify the common noun: We went to the city.", answer: "city", wrong: ["We", "went", "the"], hint: "General class of place." },
      { question: "What is the plural of 'baby'?", answer: "Babies", wrong: ["Babys", "Babyes", "Babi"], hint: "Change -y to -ies when preceded by consonant." },
      { question: "What is the plural of 'leaf'?", answer: "Leaves", wrong: ["Leafs", "Leavese", "Leafes"], hint: "Change -f to -ves." },
      { question: "Choose the uncountable noun:", answer: "Water", wrong: ["Cup", "Apple", "Coin"], hint: "Mass noun that cannot be counted." },
      { question: "What is the plural of 'man'?", answer: "Men", wrong: ["Mans", "Menes", "Manes"], hint: "Irregular vowel change plural." },
      { question: "Identify the proper noun:", answer: "John", wrong: ["boy", "teacher", "doctor"], hint: "Specific personal name." },
      { question: "What is the plural of 'foot'?", answer: "Feet", wrong: ["Foots", "Feets", "Footes"], hint: "Double -o- changes to double -e-." },
      { question: "What is the plural of 'sheep'?", answer: "Sheep", wrong: ["Sheeps", "Sheepes", "Shepi"], hint: "Singular and plural forms are identical." },
      { question: "Choose the countable noun:", answer: "Banana", wrong: ["Milk", "Rice", "Sugar"], hint: "Object that can be separated and counted." },
      { question: "What is the plural of 'tooth'?", answer: "Teeth", wrong: ["Tooths", "Teeths", "Toothes"], hint: "Double -o- changes to double -e-." }
    ],
    medium: [
      { question: "What is the plural of 'knife'?", answer: "Knives", wrong: ["Knifes", "Knive", "Knifese"], hint: "Nouns ending in -fe change to -ves." },
      { question: "What is the plural of 'potato'?", answer: "Potatoes", wrong: ["Potatos", "Potato", "Potatoese"], hint: "Nouns ending in consonant + o add -es." },
      { question: "Identify the abstract noun:", answer: "Bravery", wrong: ["Soldier", "Sword", "Shield"], hint: "Noun expressing quality or concept." },
      { question: "What is the plural of 'cactus'?", answer: "Cacti", wrong: ["Cactuses", "Cactis", "Cactus"], hint: "Latin origin plural ends in -i." },
      { question: "Choose the uncountable noun:", answer: "Knowledge", wrong: ["Fact", "Idea", "Book"], hint: "Abstract concept, cannot be counted." },
      { question: "What is the plural of 'deer'?", answer: "Deer", wrong: ["Deers", "Deeres", "Deeri"], hint: "Singular and plural are the same." },
      { question: "What is the plural of 'nucleus'?", answer: "Nuclei", wrong: ["Nucleuses", "Nucleis", "Nucleuse"], hint: "Latin plural ending -us changes to -i." },
      { question: "Identify the collective noun:", answer: "Flock", wrong: ["Bird", "Wing", "Feather"], hint: "Noun representing a group of entities." },
      { question: "What is the plural of 'focus'?", answer: "Foci", wrong: ["Focuses", "Focusses", "Focis"], hint: "Scientific Latin plural is 'foci'." },
      { question: "Choose the plural form of 'passerby':", answer: "Passersby", wrong: ["Passerbys", "Passersbys", "Passerbyes"], hint: "Pluralize the principal word." },
      { question: "What is the plural of 'ox'?", answer: "Oxen", wrong: ["Oxes", "Oxens", "Oxe"], hint: "Old Germanic plural ending -en." },
      { question: "Identify the compound noun:", answer: "Toothbrush", wrong: ["Teeth", "Brush", "Clean"], hint: "Noun formed of two distinct words." },
      { question: "What is the plural of 'hypothesis'?", answer: "Hypotheses", wrong: ["Hypothesis", "Hypothesises", "Hypothesesys"], hint: "Greek plural ending -is changes to -es." },
      { question: "Choose the uncountable noun:", answer: "Furniture", wrong: ["Chair", "Table", "Desk"], hint: "Collective uncountable category." },
      { question: "What is the plural of 'fungus'?", answer: "Fungi", wrong: ["Funguses", "Fungis", "Funguse"], hint: "Latin plural ending -us to -i." }
    ],
    hard: [
      { question: "What is the plural of 'criterion'?", answer: "Criteria", wrong: ["Criterions", "Criterias", "Criterion"], hint: "Greek origin plural ending -on changes to -a." },
      { question: "What is the plural of 'phenomenon'?", answer: "Phenomena", wrong: ["Phenomenons", "Phenomenas", "Phenomenon"], hint: "Greek origin plural ending -on changes to -a." },
      { question: "What is the plural of 'crisis'?", answer: "Crises", wrong: ["Crisis", "Crisises", "Crise"], hint: "Greek origin plural -is to -es." },
      { question: "What is the plural of 'larva'?", answer: "Larvae", wrong: ["Larvas", "Larves", "Larva"], hint: "Latin origin plural ending -a to -ae." },
      { question: "Choose the correct collective noun for whales:", answer: "Pod", wrong: ["School", "Pack", "Herd"], hint: "Specific terminology for a group of marine mammals." },
      { question: "What is the plural of 'alumnus'?", answer: "Alumni", wrong: ["Alumnuses", "Alumnas", "Alumnae"], hint: "Masculine Latin plural ending -us to -i." },
      { question: "What is the plural of 'index'?", answer: "Indices", wrong: ["Indexes", "Indeces", "Indexis"], hint: "Latin origin plural ending -ex/ix to -ices." },
      { question: "What is the plural of 'syllabus'?", answer: "Syllabi", wrong: ["Syllabuses", "Syllabis", "Syllabus"], hint: "Latin origin plural ending -us to -i." },
      { question: "What is the plural of 'matrix'?", answer: "Matrices", wrong: ["Matrixes", "Matrice", "Matrix"], hint: "Latin origin plural ending -ix to -ices." },
      { question: "Choose the correct collective noun for crows:", answer: "Murder", wrong: ["Flock", "Pack", "Herd"], hint: "Traditional poetic collective noun." },
      { question: "What is the plural of 'stimulus'?", answer: "Stimuli", wrong: ["Stimuluses", "Stimulas", "Stimulis"], hint: "Latin plural ending -us to -i." },
      { question: "What is the plural of 'memorandum'?", answer: "Memoranda", wrong: ["Memorandums", "Memorandas", "Memorandum"], hint: "Latin plural ending -um to -a." },
      { question: "What is the plural of 'stratum'?", answer: "Strata", wrong: ["Stratums", "Stratas", "Stratum"], hint: "Latin plural ending -um to -a." },
      { question: "What is the plural of 'bacterium'?", answer: "Bacteria", wrong: ["Bacteriums", "Bacterias", "Bacterium"], hint: "Latin plural ending -um to -a." },
      { question: "What is the plural of 'vertex'?", answer: "Vertices", wrong: ["Vertexes", "Vertice", "Vertex"], hint: "Latin plural ending -ex to -ices." }
    ]
  },
  find_the_error: {
    easy: [
      { question: "Find the error: She do not like apples.", answer: "do", wrong: ["like", "apples", "She"], hint: "Third-person singular takes 'does', not 'do'." },
      { question: "Find the error: The dogs is barking loudly.", answer: "is", wrong: ["dogs", "barking", "loudly"], hint: "Plural subject 'dogs' takes 'are'." },
      { question: "Find the error: I goes to school every day.", answer: "goes", wrong: ["school", "every", "day"], hint: "First-person pronoun 'I' takes bare verb 'go'." },
      { question: "Find the error: They has two cars.", answer: "has", wrong: ["two", "cars", "They"], hint: "Plural subject 'they' takes 'have'." },
      { question: "Find the error: He run very fast yesterday.", answer: "run", wrong: ["very", "fast", "yesterday"], hint: "Past tense is needed: 'ran'." },
      { question: "Find the error: The apple are sweet.", answer: "are", wrong: ["apple", "sweet", "The"], hint: "Singular subject 'apple' takes 'is'." },
      { question: "Find the error: We was happy to see them.", answer: "was", wrong: ["happy", "see", "them"], hint: "Plural past form 'were' is needed for 'we'." },
      { question: "Find the error: She write a letter tomorrow.", answer: "write", wrong: ["letter", "tomorrow", "She"], hint: "Future event needs future helper: 'will write'." },
      { question: "Find the error: I has been waiting here.", answer: "has", wrong: ["been", "waiting", "here"], hint: "First-person takes 'have'." },
      { question: "Find the error: He don't has a pen.", answer: "has", wrong: ["don't", "a", "pen"], hint: "Double negative auxiliary; base verb 'have' is required." },
      { question: "Find the error: They is coming tonight.", answer: "is", wrong: ["coming", "tonight", "They"], hint: "Plural subject 'they' takes 'are'." },
      { question: "Find the error: The book are on the table.", answer: "are", wrong: ["on", "table", "The"], hint: "Singular subject 'book' takes 'is'." },
      { question: "Find the error: We has finished the work.", answer: "has", wrong: ["finished", "work", "We"], hint: "Plural subject 'we' takes 'have'." },
      { question: "Find the error: She sing beautifully.", answer: "sing", wrong: ["beautifully", "She", "N/A"], hint: "Subject verb agreement; needs 'sings'." },
      { question: "Find the error: I am more taller than him.", answer: "more", wrong: ["taller", "than", "him"], hint: "Double comparative error (more taller)." }
    ],
    medium: [
      { question: "Find the error: Everyone have finished their homework.", answer: "have", wrong: ["Everyone", "finished", "homework"], hint: "Indefinite pronoun 'everyone' is singular and takes 'has'." },
      { question: "Find the error: The list of items are long.", answer: "are", wrong: ["list", "items", "long"], hint: "Subject is 'list' (singular), not 'items'." },
      { question: "Find the error: Neither of the cars are fast.", answer: "are", wrong: ["Neither", "cars", "fast"], hint: "'Neither' is singular and takes 'is'." },
      { question: "Find the error: She is married with a doctor.", answer: "with", wrong: ["married", "a", "doctor"], hint: "Preposition error: married 'to' someone." },
      { question: "Find the error: I look forward to see you.", answer: "see", wrong: ["look", "forward", "to"], hint: "'Look forward to' is followed by gerund 'seeing'." },
      { question: "Find the error: He gave me some advices.", answer: "advices", wrong: ["gave", "some", "me"], hint: "'Advice' is uncountable; plural is 'pieces of advice'." },
      { question: "Find the error: Although it was raining, but we went out.", answer: "but", wrong: ["Although", "raining", "went"], hint: "Double conjunction error; remove 'but'." },
      { question: "Find the error: The children ran quick to the bus.", answer: "quick", wrong: ["children", "ran", "bus"], hint: "Need adverb 'quickly' to describe the action." },
      { question: "Find the error: I have been knowing him for years.", answer: "been knowing", wrong: ["have", "him", "years"], hint: "Stative verb 'know' cannot be used in continuous tense." },
      { question: "Find the error: Each student must bring their book.", answer: "their", wrong: ["Each", "student", "book"], hint: "Singular subject 'each' takes singular possessive pronoun." },
      { question: "Find the error: The news are very disappointing.", answer: "are", wrong: ["news", "disappointing", "very"], hint: "'News' is singular and takes 'is'." },
      { question: "Find the error: She behaves like she is the boss.", answer: "like", wrong: ["behaves", "she", "boss"], hint: "Conjunction 'as if' or 'as though' is preferred for clauses." },
      { question: "Find the error: I prefer coffee than tea.", answer: "than", wrong: ["prefer", "coffee", "tea"], hint: "Structure is 'prefer A to B'." },
      { question: "Find the error: The police is investigating the crime.", answer: "is", wrong: ["police", "investigating", "crime"], hint: "Collective noun 'police' is grammatically plural." },
      { question: "Find the error: He worked hard so that he can succeed.", answer: "can", wrong: ["worked", "so", "succeed"], hint: "Tense agreement: past tense 'worked' requires modal 'could'." }
    ],
    hard: [
      { question: "Find the error: Having finished the book, the lights were turned off.", answer: "the lights", wrong: ["Having", "finished", "book"], hint: "Dangling modifier; the lights didn't finish the book." },
      { question: "Find the error: She is one of those who is always late.", answer: "is", wrong: ["one", "those", "late"], hint: "Verb agrees with plural relative clause subject 'who' (referring to 'those')." },
      { question: "Find the error: If I was you, I would accept the job.", answer: "was", wrong: ["you", "would", "accept"], hint: "Subjunctive mood 'were' for hypothetical statements." },
      { question: "Find the error: I suggest that he goes immediately.", answer: "goes", wrong: ["suggest", "he", "immediately"], hint: "Subjunctive mood requires bare verb 'go' after 'suggest'." },
      { question: "Find the error: The reason why he failed is because he was lazy.", answer: "because", wrong: ["reason", "failed", "lazy"], hint: "Structure 'the reason is...' takes a noun clause starting with 'that'." },
      { question: "Find the error: Between you and I, this is a secret.", answer: "I", wrong: ["Between", "you", "secret"], hint: "Prepositions take object pronouns: 'between you and me'." },
      { question: "Find the error: Not only he but also his friends is playing.", answer: "is", wrong: ["Not only", "friends", "playing"], hint: "Verb agrees with closest subject 'friends' (plural 'are')." },
      { question: "Find the error: I would rather to walk than run.", answer: "to walk", wrong: ["would", "rather", "run"], hint: "'Would rather' takes bare infinitive 'walk'." },
      { question: "Find the error: She operates the machine more smoother than him.", answer: "more smoother", wrong: ["operates", "machine", "than"], hint: "Double comparative error." },
      { question: "Find the error: No sooner had he left when it started raining.", answer: "when", wrong: ["No sooner", "left", "raining"], hint: "'No sooner' takes conjunction 'than'." },
      { question: "Find the error: He layed his keys on the table.", answer: "layed", wrong: ["keys", "table", "on"], hint: "Past tense of 'lay' (to place) is 'laid'." },
      { question: "Find the error: The temperature is hotter today than yesterday.", answer: "hotter", wrong: ["temperature", "today", "yesterday"], hint: "Temperature is 'higher' or 'lower', not hot/cold." },
      { question: "Find the error: She was too tired that she fell asleep.", answer: "too", wrong: ["tired", "that", "asleep"], hint: "Structure is 'so...that'." },
      { question: "Find the error: Whom do you think will win the game?", answer: "Whom", wrong: ["do", "think", "win"], hint: "Subject pronoun 'who' is needed." },
      { question: "Find the error: I noticed the dog wagging it's tail.", answer: "it's", wrong: ["noticed", "dog", "tail"], hint: "Possessive pronoun is 'its', without apostrophe." }
    ]
  }
};

function generateTugProblem(categoryId: string, difficulty: TugRoomConfig['difficulty'], askedSet?: Set<string>): TugProblem {
  let cat = categoryId;
  if (cat === "mixed") {
    const list = CATEGORIES.filter((c) => c.id !== "mixed");
    cat = list[Math.floor(Math.random() * list.length)].id;
  }

  const catPool = PROBLEMS[cat] || PROBLEMS.vocabulary;
  const diff = (difficulty === "adaptive" ? "medium" : difficulty) as 'easy' | 'medium' | 'hard';
  const pool = catPool[diff] || catPool.easy;

  let eligible = pool;
  if (askedSet) {
    eligible = pool.filter((p) => !askedSet.has(p.question));
    if (eligible.length === 0) {
      pool.forEach((p) => askedSet.delete(p.question));
      eligible = pool;
    }
  }

  const raw = eligible[Math.floor(Math.random() * eligible.length)];
  if (askedSet) {
    askedSet.add(raw.question);
  }

  const optionsSet = new Set<string>();
  optionsSet.add(raw.answer);
  raw.wrong.forEach((w) => optionsSet.add(w));

  const fallbackWrong = ["None of these", "All of these", "Something else", "N/A"];
  let padIdx = 0;
  while (optionsSet.size < 4 && padIdx < fallbackWrong.length) {
    optionsSet.add(fallbackWrong[padIdx++]);
  }

  const options = Array.from(optionsSet);
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return {
    question: raw.question,
    answer: raw.answer,
    options,
    solutionHint: raw.hint,
  };
}

// ---------------------------------------------------------
// LOCAL PLAY TYPES
// ---------------------------------------------------------
interface LocalTeamState {
  name: string;
  score: number;
  playersCount: number;
  streak: number;
}

// ---------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------
export function EnglishTugOfWar({ onToggleFullscreen }: { onToggleFullscreen?: () => void }) {
  const { toast } = useToast();

  // Screen states
  type Screen = "modeSelect" | "localConfig" | "localPlay" | "onlineConfig" | "onlinePlay" | "gameOver";
  const [screen, setScreen] = React.useState<Screen>("modeSelect");

  // Options
  const [isAudioEnabled, setIsAudioEnabled] = React.useState(true);
  React.useEffect(() => {
    sfx.enabled = isAudioEnabled;
  }, [isAudioEnabled]);

  // -------------------------------------------------------
  // LOCAL GAME STATE
  // -------------------------------------------------------
  const [localMode, setLocalMode] = React.useState<"pvp" | "team">("pvp");
  const [localCategory, setLocalCategory] = React.useState("vocabulary");
  const [localDifficulty, setLocalDifficulty] = React.useState<TugRoomConfig['difficulty']>("easy");
  const [localWinPulls, setLocalWinPulls] = React.useState(5);
  const [localTimerLimit, setLocalTimerLimit] = React.useState(15);
  const [localRoundsLimit, setLocalRoundsLimit] = React.useState(10);
  const [localRound, setLocalRound] = React.useState(1);

  const [blueTeam, setBlueTeam] = React.useState<LocalTeamState>({ name: "Team Blue", score: 0, playersCount: 1, streak: 0 });
  const [redTeam, setRedTeam] = React.useState<LocalTeamState>({ name: "Team Red", score: 0, playersCount: 1, streak: 0 });

  const [ropePosition, setRopePosition] = React.useState(0); // Left is positive (Blue), Right is negative (Red)
  const [currentProblem, setCurrentProblem] = React.useState<TugProblem | null>(null);
  const [timer, setTimer] = React.useState(15);
  const [timerActive, setTimerActive] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Lockouts (single-screen key bashing prevention)
  const [blueLocked, setBlueLocked] = React.useState(false);
  const [redLocked, setRedLocked] = React.useState(false);
  const [shake, setShake] = React.useState<"none" | "left" | "right" | "fail">("none");

  // Dust particles for rope pulling
  const [particles, setParticles] = React.useState<{ id: number; x: number; y: number; color: string }[]>([]);

  // Session asked question history tracking (to prevent repetition)
  const localAskedQuestionsRef = React.useRef<Set<string>>(new Set());
  const onlineAskedQuestionsRef = React.useRef<Set<string>>(new Set());

  // -------------------------------------------------------
  // ONLINE GAME STATE
  // -------------------------------------------------------
  const { createRoom, joinRoom, selectTeam, setPlayerReady, startGame, submitAnswer, handleTimeout, startNextRound, resetRoom, closeRoom, leaveRoom, endOnlineGameByScore } = useTugRoom();
  const [myRoomCode, setMyRoomCode] = React.useState<string | null>(null);
  const [myPlayerId] = React.useState(() => getOrCreateTugPlayerId());
  const [myPlayerName, setMyPlayerName] = React.useState("Player");
  const [joinCodeInput, setJoinCodeInput] = React.useState("");
  const [isCreator, setIsCreator] = React.useState(false);
  const [isBusy, setIsBusy] = React.useState(false);
  const [onlineError, setOnlineError] = React.useState("");
  const [onlineCategory, setOnlineCategory] = React.useState("vocabulary");
  const [onlineDifficulty, setOnlineDifficulty] = React.useState<TugRoomConfig['difficulty']>("easy");
  const [onlineWinPulls, setOnlineWinPulls] = React.useState(5);
  const [onlineTimerLimit, setOnlineTimerLimit] = React.useState(15);
  const [onlineRoundsLimit, setOnlineRoundsLimit] = React.useState(10);
  const [onlineTimer, setOnlineTimer] = React.useState(15);

  const { room, loading: roomLoading, error: roomError } = useTugRoomListener(myRoomCode);

  // Trigger sound effect on online rope changes
  const lastRopePosRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (!room || room.status !== "playing") return;
    if (lastRopePosRef.current !== null && lastRopePosRef.current !== room.ropePosition) {
      sfx.playPull();
      sfx.playCheer();
      // Generate particles
      triggerParticles();
      // Shake
      setShake(room.ropePosition > lastRopePosRef.current ? "left" : "right");
      setTimeout(() => setShake("none"), 800);
    }
    lastRopePosRef.current = room.ropePosition;
  }, [room?.ropePosition]);

  // Online timer countdown syncing with Firestore timestamp
  React.useEffect(() => {
    if (!room || room.status !== "playing" || !room.timerStartedAt) {
      return;
    }

    const timerLimit = room.config.timerLimit || 15;
    
    // Firestore timestamp could be serverTimestamp (which resolves as null initially)
    const timestamp = room.timerStartedAt as any;
    const startMillis = (timestamp && typeof timestamp.toMillis === 'function') 
      ? timestamp.toMillis() 
      : Date.now();

    const updateTimer = () => {
      const elapsedSeconds = Math.floor((Date.now() - startMillis) / 1000);
      const remaining = Math.max(0, timerLimit - elapsedSeconds);
      setOnlineTimer(remaining);

      if (remaining <= 0) {
        // Any active client to notice timeout triggers handleTimeout in firestore
        handleTimeout(room.roomCode);
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 500);

    return () => clearInterval(interval);
  }, [room?.status, room?.timerStartedAt, room?.roomCode, handleTimeout]);

  // -------------------------------------------------------
  // LOCAL TIMER TICK
  // -------------------------------------------------------
  React.useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setTimeout(() => {
        setTimer((p) => {
          if (p <= 4 && p > 1) sfx.playBeep(330, 0.08, "triangle");
          else if (p === 1) sfx.playBeep(660, 0.4, "sawtooth");
          return p - 1;
        });
      }, 1000);
    } else if (timer === 0 && timerActive) {
      setTimerActive(false);
      handleLocalTimeout();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timer, timerActive]);

  // -------------------------------------------------------
  // LOCAL CORE ACTIONS
  // -------------------------------------------------------
  const triggerParticles = () => {
    const list = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: 35 + Math.random() * 30, // center area
      y: 40 + Math.random() * 20,
      color: Math.random() > 0.5 ? "#3B82F6" : "#EF4444",
    }));
    setParticles(list);
    setTimeout(() => setParticles([]), 1000);
  };

  const handleStartLocalGame = () => {
    sfx.playBeep(440, 0.1);
    localAskedQuestionsRef.current.clear();
    setBlueTeam({ name: localMode === "pvp" ? "Player Blue" : "Team Blue", score: 0, playersCount: 1, streak: 0 });
    setRedTeam({ name: localMode === "pvp" ? "Player Red" : "Team Red", score: 0, playersCount: 1, streak: 0 });
    setRopePosition(0);
    setLocalRound(1);
    setBlueLocked(false);
    setRedLocked(false);

    // Initial problem
    const prob = generateTugProblem(localCategory, localDifficulty, localAskedQuestionsRef.current);
    setCurrentProblem(prob);

    setTimer(localTimerLimit);
    setTimerActive(true);
    setScreen("localPlay");
  };

  const handleLocalAnswer = (team: "blue" | "red", choice: string) => {
    if (!currentProblem || !timerActive) return;
    if (team === "blue" && blueLocked) return;
    if (team === "red" && redLocked) return;

    const isCorrect = choice === currentProblem.answer;

    if (isCorrect) {
      sfx.playDing();
      sfx.playCheer();
      triggerParticles();

      const shift = team === "blue" ? 1 : -1;
      const nextPos = ropePosition + shift;
      setRopePosition(nextPos);

      // Shake animation
      setShake(team === "blue" ? "left" : "right");
      setTimeout(() => setShake("none"), 800);

      // Adjust scores/streaks
      if (team === "blue") {
        setBlueTeam((prev) => ({ ...prev, score: prev.score + 10, streak: prev.streak + 1 }));
        setRedTeam((prev) => ({ ...prev, streak: 0 }));
      } else {
        setRedTeam((prev) => ({ ...prev, score: prev.score + 10, streak: prev.streak + 1 }));
        setBlueTeam((prev) => ({ ...prev, streak: 0 }));
      }

      // Check win condition
      if (Math.abs(nextPos) >= localWinPulls) {
        setTimerActive(false);
        sfx.playCheer();
        sfx.playFanfare();
        setScreen("gameOver");
        return;
      }

      // Check rounds limit
      if (localRoundsLimit > 0 && localRound >= localRoundsLimit) {
        setTimerActive(false);
        sfx.playCheer();
        sfx.playFanfare();
        setScreen("gameOver");
        return;
      }

      setLocalRound((r) => r + 1);

      // Load next problem
      const prob = generateTugProblem(localCategory, localDifficulty, localAskedQuestionsRef.current);
      setCurrentProblem(prob);
      setTimer(localTimerLimit);
      setBlueLocked(false);
      setRedLocked(false);
    } else {
      sfx.playBuzz();
      setShake("fail");
      setTimeout(() => setShake("none"), 400);

      // Lockout team for 2.5 seconds
      if (team === "blue") {
        setBlueLocked(true);
        setTimeout(() => setBlueLocked(false), 2500);
        // Opponent pulls slightly
        setRopePosition((p) => Math.max(-localWinPulls, p - 0.5));
      } else {
        setRedLocked(true);
        setTimeout(() => setRedLocked(false), 2500);
        // Opponent pulls slightly
        setRopePosition((p) => Math.min(localWinPulls, p + 0.5));
      }
    }
  };

  // Keyboard Hotkeys support for local shared-screen play
  React.useEffect(() => {
    if (screen !== "localPlay" || !timerActive || !currentProblem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      // Blue controls: Q, W, E, R (corresponding to option indices 0, 1, 2, 3)
      if (["q", "w", "e", "r"].includes(key)) {
        const idx = ["q", "w", "e", "r"].indexOf(key);
        if (currentProblem.options[idx]) {
          handleLocalAnswer("blue", currentProblem.options[idx]);
        }
      }
      // Red controls: u, i, o, p (corresponding to option indices 0, 1, 2, 3)
      if (["u", "i", "o", "p"].includes(key)) {
        const idx = ["u", "i", "o", "p"].indexOf(key);
        if (currentProblem.options[idx]) {
          handleLocalAnswer("red", currentProblem.options[idx]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [screen, timerActive, currentProblem, ropePosition, blueLocked, redLocked, localRound]);

  const handleLocalTimeout = () => {
    sfx.playBuzz();
    toast({ title: "⏰ Time is up!", description: "Rope shifts slightly towards center.", duration: 2500 });
    
    // Shift rope slightly back to center
    let nextPos = ropePosition;
    if (ropePosition > 0) nextPos = Math.max(0, ropePosition - 0.5);
    else if (ropePosition < 0) nextPos = Math.min(0, ropePosition + 0.5);
    setRopePosition(nextPos);

    // Check rounds limit
    if (localRoundsLimit > 0 && localRound >= localRoundsLimit) {
      setTimerActive(false);
      sfx.playCheer();
      sfx.playFanfare();
      setScreen("gameOver");
      return;
    }

    setLocalRound((r) => r + 1);

    // Next round
    const prob = generateTugProblem(localCategory, localDifficulty, localAskedQuestionsRef.current);
    setCurrentProblem(prob);
    setTimer(localTimerLimit);
    setTimerActive(true);
    setBlueLocked(false);
    setRedLocked(false);
  };

  // -------------------------------------------------------
  // ONLINE MODE ACTIONS
  // -------------------------------------------------------
  const handleCreateRoom = async () => {
    setIsBusy(true); setOnlineError("");
    try {
      const config: TugRoomConfig = {
        rounds: onlineRoundsLimit,
        timerLimit: onlineTimerLimit,
        categoryId: onlineCategory,
        difficulty: onlineDifficulty,
        winPullsRequired: onlineWinPulls,
      };
      const code = await createRoom(myPlayerId, myPlayerName.trim() || "Host", config);
      setMyRoomCode(code);
      setIsCreator(true);
      setScreen("onlinePlay");
      sfx.playDing();
    } catch (e: any) {
      setOnlineError(e.message || "Failed to create room.");
    } finally { setIsBusy(false); }
  };

  const handleJoinRoom = async () => {
    const code = joinCodeInput.toUpperCase().trim();
    if (code.length !== 6) { setOnlineError("Invite code must be 6 characters."); return; }
    setIsBusy(true); setOnlineError("");
    try {
      const result = await joinRoom(code, myPlayerId, myPlayerName.trim() || "Student");
      if (result.success) {
        setMyRoomCode(code);
        setIsCreator(false);
        setScreen("onlinePlay");
        sfx.playDing();
      } else {
        setOnlineError(result.error || "Failed to join room.");
      }
    } catch (e: any) {
      setOnlineError(e.message || "Network error.");
    } finally { setIsBusy(false); }
  };

  const handleToggleReady = async () => {
    if (!room || !myRoomCode) return;
    const me = room.players[myPlayerId];
    if (!me) return;
    await setPlayerReady(myRoomCode, myPlayerId, !me.isReady);
    sfx.playBeep(420, 0.05);
  };

  const handleSwitchTeam = async (team: 'blue' | 'red') => {
    if (!room || !myRoomCode) return;
    await selectTeam(myRoomCode, myPlayerId, team);
    sfx.playBeep(440, 0.05);
  };

  const handleStartOnlineGame = async () => {
    if (!room || !myRoomCode || !isCreator) return;
    onlineAskedQuestionsRef.current.clear();
    const prob = generateTugProblem(room.config.categoryId, room.config.difficulty, onlineAskedQuestionsRef.current);
    await startGame(myRoomCode, prob);
    sfx.playFanfare();
  };

  const handleOnlineAnswer = async (choice: string) => {
    if (!room || !myRoomCode || room.status !== "playing") return;
    const me = room.players[myPlayerId];
    if (!me || me.lastAnsweredCorrectly !== null) return; // Locked out or already answered

    const isCorrect = choice === room.currentProblem?.answer;
    
    if (isCorrect) {
      await submitAnswer(myRoomCode, myPlayerId, true);
    } else {
      sfx.playBuzz();
      await submitAnswer(myRoomCode, myPlayerId, false);
      toast({ title: "❌ Incorrect Answer!", description: "Locked out for this round", variant: "destructive" });
    }
  };

  const handleOnlineNextRound = async () => {
    if (!room || !myRoomCode || !isCreator) return;
    if (room.config.rounds > 0 && room.currentRound >= room.config.rounds) {
      await endOnlineGameByScore(myRoomCode);
      return;
    }
    const prob = generateTugProblem(room.config.categoryId, room.config.difficulty, onlineAskedQuestionsRef.current);
    await startNextRound(myRoomCode, prob, room.currentRound + 1);
  };

  const handleOnlineRestart = async () => {
    if (!room || !myRoomCode || !isCreator) return;
    onlineAskedQuestionsRef.current.clear();
    await resetRoom(myRoomCode);
  };

  const handleLeaveRoom = async () => {
    if (!myRoomCode) return;
    if (isCreator) {
      await closeRoom(myRoomCode);
    } else {
      await leaveRoom(myRoomCode, myPlayerId);
    }
    setMyRoomCode(null);
    setIsCreator(false);
    setScreen("modeSelect");
    sfx.playBeep(350, 0.1);
  };

  // -------------------------------------------------------
  // RENDER SELECTION SCREEN
  // -------------------------------------------------------
  const renderModeSelect = () => {
    return (
      <div className="max-w-3xl mx-auto w-full p-6 space-y-8 text-center bg-slate-950/40 border border-slate-900 rounded-3xl p-8 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="mx-auto w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/5">
            <Swords className="h-12 w-12" />
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-display">English Tug of War</h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">Knowledge is power! Pull the rope to your side and claim victory by answering English questions faster than your opponent.</p>
        </div>

        <div className="grid gap-4 pt-2">
          <button onClick={() => { sfx.playBeep(440, 0.08); setScreen("localConfig"); }}
            className="w-full py-6 bg-slate-900 border border-slate-800 hover:border-slate-750 hover:bg-slate-850/80 rounded-3xl flex items-center gap-5 px-8 text-left transition-all group hover:scale-[1.02] shadow-md">
            <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Play className="h-7 w-7" />
            </div>
            <div>
              <p className="font-extrabold text-white text-lg sm:text-xl">Local Shared Screen</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Play PVP or Team vs Team on a single computer using hotkeys</p>
            </div>
            <ArrowRight className="h-6 w-6 text-slate-500 ml-auto group-hover:text-cyan-400 transition-colors" />
          </button>

          <button onClick={() => { sfx.playBeep(440, 0.08); setScreen("onlineConfig"); }}
            className="w-full py-6 bg-slate-900 border border-slate-800 hover:border-slate-750 hover:bg-slate-850/80 rounded-3xl flex items-center gap-5 px-8 text-left transition-all group hover:scale-[1.02] shadow-md">
            <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <p className="font-extrabold text-white text-lg sm:text-xl">Online Multiplayer</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Create or join rooms to compete with classmates live on separate screens</p>
            </div>
            <ArrowRight className="h-6 w-6 text-slate-500 ml-auto group-hover:text-purple-400 transition-colors" />
          </button>
        </div>

        {/* Game Mechanics Description / How to Play */}
        <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-3xl text-left space-y-4 max-w-2xl mx-auto mt-6">
          <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" /> Game Mechanics & How to Play
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
            <div className="space-y-1.5">
              <p className="font-black text-slate-200">🚩 The Objective</p>
              <p className="leading-relaxed">Pull the rope to your side! Each correct answer pulls the rope 1 step closer to your team. The team wins when their opponent's boundary marker crosses the RED LINE in the middle, or when they have more points at the round limit.</p>
            </div>
            <div className="space-y-1.5">
              <p className="font-black text-slate-200">⚡ Penalties & Lockouts</p>
              <p className="leading-relaxed">Answering incorrectly locks you or your team out for 2.5 seconds, giving the opposing team an advantage to pull the rope towards their side. Solve carefully but quickly!</p>
            </div>
            <div className="space-y-1.5">
              <p className="font-black text-slate-200">🕹️ Local Hotkeys</p>
              <p className="leading-relaxed">
                • <span className="font-mono text-cyan-400">Blue Team (Left)</span>: keys <kbd className="bg-slate-950 px-1 py-0.5 rounded border border-slate-850">Q</kbd> <kbd className="bg-slate-950 px-1 py-0.5 rounded border border-slate-850">W</kbd> <kbd className="bg-slate-950 px-1 py-0.5 rounded border border-slate-850">E</kbd> <kbd className="bg-slate-950 px-1 py-0.5 rounded border border-slate-850">R</kbd><br />
                • <span className="font-mono text-rose-400">Red Team (Right)</span>: keys <kbd className="bg-slate-950 px-1 py-0.5 rounded border border-slate-850">U</kbd> <kbd className="bg-slate-950 px-1 py-0.5 rounded border border-slate-850">I</kbd> <kbd className="bg-slate-950 px-1 py-0.5 rounded border border-slate-850">O</kbd> <kbd className="bg-slate-950 px-1 py-0.5 rounded border border-slate-850">P</kbd>
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="font-black text-slate-200">🌐 Online Play</p>
              <p className="leading-relaxed">Join or create rooms. Every correct answer from any teammate adds pulls for your team. Synchronize live timers and win as a team!</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------
  // RENDER LOCAL CONFIG SCREEN
  // -------------------------------------------------------
  const renderLocalConfig = () => {
    return (
      <div className="max-w-3xl mx-auto w-full p-8 space-y-6 bg-slate-950/60 border border-slate-900 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-900">
          <Swords className="h-6 w-6 text-indigo-400" />
          <h3 className="font-black text-white text-xl">Local Arena Setup</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-black text-slate-200">Choose English Category</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => { sfx.playBeep(380, 0.05); setLocalCategory(c.id); }}
                  className={cn("p-3.5 text-left border rounded-2xl flex items-center gap-3 transition-all",
                    localCategory === c.id ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg" : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900/90")}>
                  <span className="text-xl">{c.emoji}</span>
                  <div className="truncate">
                    <p className="text-sm font-black">{c.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-black text-slate-200">Difficulty Level</Label>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1.5 rounded-xl">
                {["easy", "medium", "hard"].map((d) => (
                  <button key={d} onClick={() => { sfx.playBeep(380, 0.05); setLocalDifficulty(d as any); }}
                    className={cn("py-2.5 text-xs font-black capitalize rounded-lg transition-all",
                      localDifficulty === d ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white")}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-black text-slate-200">Pulls to Win</Label>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1.5 rounded-xl">
                {[3, 5, 8].map((n) => (
                  <button key={n} onClick={() => { sfx.playBeep(380, 0.05); setLocalWinPulls(n); }}
                    className={cn("py-2.5 text-xs font-black rounded-lg transition-all",
                      localWinPulls === n ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white")}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-black text-slate-200">Question Timer</Label>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1.5 rounded-xl">
                {[10, 15, 20].map((t) => (
                  <button key={t} onClick={() => { sfx.playBeep(380, 0.05); setLocalTimerLimit(t); }}
                    className={cn("py-2.5 text-xs font-black rounded-lg transition-all",
                      localTimerLimit === t ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white")}>
                    {t}s
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-black text-slate-200">Game Mode</Label>
              <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1.5 rounded-xl">
                {["pvp", "team"].map((m) => (
                  <button key={m} onClick={() => { sfx.playBeep(380, 0.05); setLocalMode(m as any); }}
                    className={cn("py-2.5 text-xs font-black capitalize rounded-lg transition-all",
                      localMode === m ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white")}>
                    {m === "pvp" ? "Player vs Player" : "Teams"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-black text-slate-200">Total Rounds</Label>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <input type="checkbox" id="localUnlimitedRounds" checked={localRoundsLimit === 0}
                    onChange={(e) => setLocalRoundsLimit(e.target.checked ? 0 : 10)}
                    className="rounded border-slate-800 bg-slate-900 text-indigo-600" />
                  <label htmlFor="localUnlimitedRounds" className="cursor-pointer font-bold select-none">Unlimited</label>
                </div>
              </div>
              <input type="number" min={1} max={100} value={localRoundsLimit === 0 ? "" : localRoundsLimit} disabled={localRoundsLimit === 0}
                onChange={(e) => setLocalRoundsLimit(Math.max(1, Math.min(100, parseInt(e.target.value) || 10)))}
                placeholder="Unlimited"
                className="w-full bg-slate-900 border border-slate-800 text-sm text-white p-3 px-4 rounded-xl focus:border-indigo-500 outline-none font-bold text-center h-[52px] disabled:opacity-50 disabled:cursor-not-allowed" />
            </div>

            <div className="space-y-2" />
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-slate-900">
          <Button variant="ghost" onClick={() => { sfx.playBeep(380, 0.08); setScreen("modeSelect"); }} className="flex-1 py-6 border border-slate-800 text-slate-300 rounded-2xl text-xs uppercase font-black tracking-wider">
            Back
          </Button>
          <Button onClick={handleStartLocalGame} className="flex-1 py-6 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-2xl text-xs uppercase font-black tracking-wider hover:scale-[1.03] transition-all shadow-lg">
            Enter Arena
          </Button>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------
  // RENDER TUG OF WAR ANIMATED ARENA
  // -------------------------------------------------------
  const renderArena = (position: number, winTarget: number) => {
    // calculate shift pixels (max win offset in pixels)
    const maxShiftPx = 140;
    const offsetPx = -(position / winTarget) * maxShiftPx; // Shifts left for positive (Blue), right for negative (Red)

    return (
      <div className={cn("relative w-full h-64 rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden transition-all duration-300 shadow-inner",
        shake === "left" && "animate-[bounce_0.3s_infinite]",
        shake === "right" && "animate-[bounce_0.3s_infinite]",
        shake === "fail" && "animate-[ping_0.2s_1]")}>
        
        {/* Dirt ground background lines */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950" />
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-[2px] h-full bg-slate-100" />
          <div className="w-[300px] h-[300px] rounded-full border-2 border-slate-100" />
        </div>

        {/* Center line (Red Line on the ground) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[3px] bg-red-600 -translate-x-1/2 flex flex-col justify-between items-center text-xs text-red-500 font-black py-2 z-10">
          <span className="bg-slate-950 px-2 py-0.5 border border-red-500/30 rounded-md">RED</span>
          <span className="bg-slate-950 px-2 py-0.5 border border-red-550/30 rounded-md">LINE</span>
        </div>

        {/* Win Zones */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-blue-600/30 to-transparent border-r-2 border-blue-500/30 flex items-center justify-center">
          <div className="text-xs text-blue-400 font-black origin-center -rotate-90 select-none uppercase tracking-widest whitespace-nowrap">BLUE GOAL</div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-red-600/30 to-transparent border-l-2 border-red-500/30 flex items-center justify-center">
          <div className="text-xs text-red-400 font-black origin-center rotate-90 select-none uppercase tracking-widest whitespace-nowrap">RED GOAL</div>
        </div>

        {/* Emitters (dust/smoke particles) */}
        {particles.map((p) => (
          <div key={p.id} className="absolute w-4.5 h-4.5 rounded-full animate-ping opacity-60"
            style={{ left: `${p.x}%`, top: `${p.y}%`, background: p.color }} />
        ))}

        {/* The Rope System (including characters and markers) */}
        <div className="absolute inset-x-0 top-1/2 h-16 -translate-y-1/2 flex items-center transition-transform duration-700 ease-out"
          style={{ transform: `translateX(${offsetPx}px)` }}>
          
          {/* Rope line */}
          <div className="absolute inset-x-0 top-1/2 h-4.5 -translate-y-1/2 bg-[repeating-linear-gradient(45deg,#78350f,#78350f_15px,#b45309_15px,#b45309_30px)] border-2 border-yellow-950 shadow-lg shadow-black/60" />

          {/* Left pulling team (Blue) */}
          <div className="absolute right-[53%] flex items-center gap-3 pr-4">
            <div className="flex items-center gap-2.5 animate-[pulse_0.8s_infinite]">
              <span className="text-5xl filter drop-shadow-[0_4px_10px_rgba(59,130,246,0.7)]">🏋️‍♂️</span>
              <span className="text-[40px] filter drop-shadow-[0_3px_8px_rgba(59,130,246,0.6)]">🏃‍♂️</span>
              <span className="text-[32px] filter drop-shadow-[0_2px_6px_rgba(59,130,246,0.5)]">🧑‍💻</span>
            </div>
            <div className="text-xs bg-blue-600 text-white font-black px-2.5 py-1 rounded-xl uppercase tracking-wider select-none animate-bounce shadow-md">Blue Team</div>
          </div>

          {/* Blue Boundary Marker (on rope) */}
          <div className="absolute left-[calc(50%-140px)] top-1/2 -translate-y-1/2 w-4 h-10 bg-cyan-400 border-2 border-white rounded shadow-lg shadow-cyan-500/50 animate-pulse z-20" title="Blue Team Boundary Marker" />

          {/* Center Flag on Rope (Yellow Pointer) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-16 flex flex-col items-center justify-center z-20">
            <div className="w-1.5 bg-black h-12" />
            <div className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-white -mt-7 animate-pulse shadow-lg shadow-yellow-500/80" />
          </div>

          {/* Red Boundary Marker (on rope) */}
          <div className="absolute left-[calc(50%+140px)] top-1/2 -translate-y-1/2 w-4 h-10 bg-rose-500 border-2 border-white rounded shadow-lg shadow-rose-500/50 animate-pulse z-20" title="Red Team Boundary Marker" />

          {/* Right pulling team (Red) */}
          <div className="absolute left-[53%] flex items-center gap-3 pl-4">
            <div className="text-xs bg-red-600 text-white font-black px-2.5 py-1 rounded-xl uppercase tracking-wider select-none animate-bounce shadow-md">Red Team</div>
            <div className="flex items-center gap-2.5 animate-[pulse_0.8s_infinite]">
              <span className="text-[32px] filter drop-shadow-[0_2px_6px_rgba(239,68,68,0.5)]">🧑‍🔬</span>
              <span className="text-[40px] filter drop-shadow-[0_3px_8px_rgba(239,68,68,0.6)]">🏃‍♀️</span>
              <span className="text-5xl filter drop-shadow-[0_4px_10px_rgba(239,68,68,0.7)]">🏋️‍♀️</span>
            </div>
          </div>

        </div>

        {/* Pull Force Indicator Bar (Top overlay) */}
        <div className="absolute bottom-4 inset-x-16 h-10 flex items-center justify-between text-xs font-black tracking-wider text-slate-300 bg-slate-900/90 px-6 rounded-2xl border border-slate-800 shadow-md">
          <span>BLUE TEAM</span>
          <div className="flex-1 max-w-md mx-6 h-3.5 bg-slate-950 rounded-full overflow-hidden flex relative">
            <div className="absolute inset-y-0 left-1/2 right-1/2 h-full bg-slate-850" />
            {/* Dynamic offset filling */}
            <div className={cn("h-full transition-all duration-500", position >= 0 ? "bg-blue-500 mr-[50%] ml-auto" : "bg-red-500 ml-[50%]")}
              style={{ width: `${Math.abs(position / winTarget) * 50}%` }} />
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-red-600" />
          </div>
          <span>RED TEAM</span>
        </div>

      </div>
    );
  };

  // -------------------------------------------------------
  // RENDER LOCAL GAME ARENA
  // -------------------------------------------------------
  const renderLocalPlay = () => {
    if (!currentProblem) return null;
    const timerPct = (timer / localTimerLimit) * 100;

    return (
      <div className="max-w-[98%] mx-auto w-full p-4 space-y-6">
        {/* Header toolbar */}
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => { sfx.playBeep(380, 0.1); setTimerActive(false); setScreen("localConfig"); }}
            className="bg-slate-950 border border-slate-900 text-slate-300 text-sm font-black uppercase rounded-2xl h-12 px-6">
            Exit Game
          </Button>

          <div className="flex items-center gap-3">
            <Badge className="bg-indigo-600/10 border-indigo-500/30 text-indigo-400 font-extrabold text-sm px-4 py-1.5 rounded-xl">
              Category: {CATEGORIES.find((c) => c.id === localCategory)?.name}
            </Badge>
            <Badge className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-extrabold text-sm px-4 py-1.5 rounded-xl capitalize">
              {localDifficulty}
            </Badge>
          </div>

          <div className={cn("text-5xl font-black tabular-nums tracking-tight",
            timerPct > 50 ? "text-emerald-400" : timerPct > 20 ? "text-amber-400" : "text-red-500 animate-pulse")}>
            {timer}s
          </div>
        </div>

        {/* Animated Rope Arena */}
        {renderArena(ropePosition, localWinPulls)}

        {/* Central Question Display */}
        <div className="bg-gradient-to-b from-indigo-950/20 to-slate-950 border border-indigo-500/25 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
          <span className="text-xs text-indigo-400 font-black uppercase tracking-widest block mb-2">Active Question</span>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight">{currentProblem.question}</h2>
        </div>

        {/* Control Areas for single screen PVP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Blue Side Control */}
          <Card className={cn("p-6 bg-blue-950/10 border-blue-500/20 flex flex-col justify-between space-y-6 relative rounded-3xl",
            blueLocked && "opacity-40 pointer-events-none")}>
            {blueLocked && (
              <div className="absolute inset-0 bg-slate-950/90 rounded-3xl flex flex-col items-center justify-center text-center p-6 z-20">
                <AlertCircle className="h-8 w-8 text-red-500 animate-bounce mb-2" />
                <p className="text-lg font-black text-red-500 uppercase">Incorrect Penalty Lockout</p>
                <p className="text-sm text-slate-400 mt-1">Unlock in 2s...</p>
              </div>
            )}
            
            <div className="flex items-center justify-between border-b border-blue-500/10 pb-3">
              <div>
                <p className="text-lg font-black text-blue-400 uppercase tracking-widest">{blueTeam.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">Pulls: {ropePosition > 0 ? ropePosition : 0}/{localWinPulls}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-500/20 text-blue-300 font-extrabold text-sm px-3 py-1 rounded-lg">Score: {blueTeam.score}</Badge>
                {blueTeam.streak >= 3 && <Badge className="bg-amber-500/20 text-amber-300 text-xs font-black px-2 py-1 rounded-lg">🔥 {blueTeam.streak} Streak</Badge>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              {currentProblem.options.map((option, idx) => {
                const keys = ["Q", "W", "E", "R"];
                return (
                  <Button key={option} onClick={() => handleLocalAnswer("blue", option)} variant="outline"
                    className="h-24 sm:h-28 border-slate-800 bg-slate-950/60 hover:bg-blue-600/10 hover:border-blue-500/35 text-white font-extrabold flex flex-col items-center justify-center p-3 group rounded-2xl shadow-sm transition-all hover:scale-[1.02]">
                    <span className="text-2xl sm:text-3xl font-black text-slate-100">{option}</span>
                    <span className="text-xs text-blue-400 font-black bg-blue-500/10 px-3 py-1 rounded-md mt-2 group-hover:bg-blue-500 group-hover:text-white transition-all">Key: {keys[idx]}</span>
                  </Button>
                );
              })}
            </div>
          </Card>

          {/* Red Side Control */}
          <Card className={cn("p-6 bg-red-950/10 border-red-500/20 flex flex-col justify-between space-y-6 relative rounded-3xl",
            redLocked && "opacity-40 pointer-events-none")}>
            {redLocked && (
              <div className="absolute inset-0 bg-slate-950/90 rounded-3xl flex flex-col items-center justify-center text-center p-6 z-20">
                <AlertCircle className="h-8 w-8 text-red-500 animate-bounce mb-2" />
                <p className="text-lg font-black text-red-500 uppercase">Incorrect Penalty Lockout</p>
                <p className="text-sm text-slate-400 mt-1">Unlock in 2s...</p>
              </div>
            )}
            
            <div className="flex items-center justify-between border-b border-red-500/10 pb-3">
              <div>
                <p className="text-lg font-black text-red-400 uppercase tracking-widest">{redTeam.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">Pulls: {ropePosition < 0 ? Math.abs(ropePosition) : 0}/{localWinPulls}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-red-500/20 text-red-300 font-extrabold text-sm px-3 py-1 rounded-lg">Score: {redTeam.score}</Badge>
                {redTeam.streak >= 3 && <Badge className="bg-amber-500/20 text-amber-300 text-xs font-black px-2 py-1 rounded-lg">🔥 {redTeam.streak} Streak</Badge>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              {currentProblem.options.map((option, idx) => {
                const keys = ["U", "I", "O", "P"];
                return (
                  <Button key={option} onClick={() => handleLocalAnswer("red", option)} variant="outline"
                    className="h-24 sm:h-28 border-slate-800 bg-slate-950/60 hover:bg-red-600/10 hover:border-red-500/35 text-white font-extrabold flex flex-col items-center justify-center p-3 group rounded-2xl shadow-sm transition-all hover:scale-[1.02]">
                    <span className="text-2xl sm:text-3xl font-black text-slate-100">{option}</span>
                    <span className="text-xs text-red-400 font-black bg-red-500/10 px-3 py-1 rounded-md mt-2 group-hover:bg-red-500 group-hover:text-white transition-all">Key: {keys[idx]}</span>
                  </Button>
                );
              })}
            </div>
          </Card>

        </div>
      </div>
    );
  };

  // -------------------------------------------------------
  // RENDER ONLINE CONFIG/SETUP SCREEN
  // -------------------------------------------------------
  const renderOnlineConfig = () => {
    return (
      <div className="max-w-3xl mx-auto w-full p-8 space-y-6 bg-slate-950/60 border border-slate-900 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="text-center space-y-2">
          <Wifi className="h-10 w-10 text-purple-400 mx-auto animate-pulse" />
          <h3 className="text-3xl font-black text-white font-display">Online Arena Setup</h3>
          <p className="text-sm text-slate-400">Play with other players on the internet</p>
        </div>

        {onlineError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-extrabold rounded-2xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{onlineError}</span>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-black text-slate-200">Your Nickname</Label>
            <Input value={myPlayerName} onChange={(e) => setMyPlayerName(e.target.value)} maxLength={15}
              className="bg-slate-900 border-slate-800 text-white rounded-2xl py-6 px-4 text-lg font-black focus:border-purple-500" />
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
            <Label className="text-sm font-black uppercase text-purple-400 tracking-wider">Host a Room</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-400">English Topic</span>
                <select value={onlineCategory} onChange={(e) => setOnlineCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-white p-3 rounded-xl focus:border-purple-500 outline-none">
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-400">Difficulty</span>
                <select value={onlineDifficulty} onChange={(e) => setOnlineDifficulty(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-white p-3 rounded-xl focus:border-purple-500 outline-none">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-400">Winning Pulls (3-8)</span>
                <input type="number" min={3} max={8} value={onlineWinPulls} onChange={(e) => setOnlineWinPulls(Math.max(3, Math.min(8, parseInt(e.target.value) || 5)))}
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-white p-3 rounded-xl focus:border-purple-500 outline-none" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-400">Timer Limit (10-30s)</span>
                <input type="number" min={10} max={30} value={onlineTimerLimit} onChange={(e) => setOnlineTimerLimit(Math.max(10, Math.min(30, parseInt(e.target.value) || 15)))}
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-white p-3 rounded-xl focus:border-purple-500 outline-none" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400">Total Rounds</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <input type="checkbox" id="onlineUnlimitedRounds" checked={onlineRoundsLimit === 0}
                      onChange={(e) => setOnlineRoundsLimit(e.target.checked ? 0 : 10)}
                      className="rounded border-slate-800 bg-slate-900 text-purple-650" />
                    <label htmlFor="onlineUnlimitedRounds" className="cursor-pointer font-bold select-none">Unlimited</label>
                  </div>
                </div>
                <input type="number" min={1} max={100} value={onlineRoundsLimit === 0 ? "" : onlineRoundsLimit} disabled={onlineRoundsLimit === 0}
                  onChange={(e) => setOnlineRoundsLimit(Math.max(1, Math.min(100, parseInt(e.target.value) || 10)))}
                  placeholder="Unlimited"
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-white p-3 rounded-xl focus:border-purple-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed" />
              </div>
            </div>
            <Button onClick={handleCreateRoom} disabled={isBusy || !myPlayerName.trim()}
              className="w-full py-6 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs uppercase font-black tracking-wider flex items-center justify-center gap-2 mt-2 shadow-lg">
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Create Room
            </Button>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
            <Label className="text-sm font-black uppercase text-cyan-400 tracking-wider">Join Existing Room</Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input placeholder="ENTER INVITE CODE" value={joinCodeInput} onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase().slice(0, 6))}
                className="bg-slate-950 border-slate-800 text-white rounded-2xl py-6 px-4 text-center font-black text-lg tracking-widest placeholder:tracking-normal flex-1" />
              <Button onClick={handleJoinRoom} disabled={isBusy || !myPlayerName.trim() || joinCodeInput.length !== 6}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase text-xs rounded-2xl py-6 px-8 tracking-wider shadow-lg">
                {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join Game"}
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button variant="ghost" onClick={() => { sfx.playBeep(380, 0.08); setScreen("modeSelect"); }} className="w-full py-5 border border-slate-800 text-slate-300 rounded-2xl text-xs uppercase font-black tracking-wider">
            Back to mode selection
          </Button>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------
  // RENDER ONLINE GAMEPLAY (Lobby + Playing Arena)
  // -------------------------------------------------------
  const renderOnlinePlay = () => {
    if (roomLoading) {
      return (
        <div className="max-w-md mx-auto w-full p-8 text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto" />
          <p className="text-sm font-bold text-slate-400">Syncing with Arena Room...</p>
        </div>
      );
    }

    if (roomError || !room) {
      return (
        <div className="max-w-md mx-auto w-full p-6 text-center space-y-4 bg-slate-950/80 border border-slate-900 rounded-3xl">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h4 className="font-black text-white text-lg">Failed to Join Room</h4>
          <p className="text-slate-400 text-xs">{roomError || "Room connection lost or closed."}</p>
          <Button onClick={() => setScreen("onlineConfig")} className="w-full bg-indigo-600 text-white rounded-xl py-3 font-bold uppercase text-xs">
            Return Setup
          </Button>
        </div>
      );
    }

    const me = room.players[myPlayerId];
    const playerList = Object.values(room.players || {});
    const blueTeamList = playerList.filter((p) => p.team === "blue");
    const redTeamList = playerList.filter((p) => p.team === "red");

    // LOBBY VIEW
    if (room.status === "lobby") {
      const allReady = playerList.length >= 2 && playerList.every((p) => p.isReady);

      return (
        <div className="max-w-5xl mx-auto w-full p-4 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-900/60 border border-slate-800 rounded-3xl">
            <div>
              <span className="text-xs font-black uppercase text-purple-400 tracking-wider">Online Lobby</span>
              <h3 className="text-2xl font-black text-white">Invite Code: <span className="text-purple-400 underline font-mono select-all ml-1">{room.roomCode}</span></h3>
              <p className="text-xs text-slate-400 mt-0.5">Share this code with teammates so they can join.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => {
                navigator.clipboard.writeText(room.roomCode);
                toast({ title: "📋 Code Copied!", description: "Invite code copied to clipboard", duration: 1500 });
              }} variant="outline" className="border-slate-800 text-slate-350 text-sm font-black uppercase rounded-2xl h-11 px-5">
                <Copy className="h-4 w-4 mr-1.5" /> Copy Code
              </Button>
              <Button onClick={handleLeaveRoom} variant="ghost" className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-black uppercase rounded-2xl h-11 px-5">
                <LogOut className="h-4 w-4 mr-1.5" /> Leave Room
              </Button>
            </div>
          </div>

          {/* Config Summary Card */}
          <Card className="p-6 bg-slate-900/40 border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center rounded-3xl shadow-lg">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Category</span>
              <span className="text-sm font-black text-white capitalize">{CATEGORIES.find((c) => c.id === room.config.categoryId)?.emoji} {room.config.categoryId}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Difficulty</span>
              <span className="text-sm font-black text-white capitalize">{room.config.difficulty}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Target Pulls</span>
              <span className="text-sm font-black text-white">{room.config.winPullsRequired} pulls</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Time Limit</span>
              <span className="text-sm font-black text-white">{room.config.timerLimit}s</span>
            </div>
          </Card>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Team Blue Lobby */}
            <div className="space-y-4 p-6 bg-blue-950/10 border border-blue-500/10 rounded-[2rem] shadow-sm">
              <div className="flex items-center justify-between border-b border-blue-500/10 pb-3">
                <div>
                  <h4 className="font-black text-blue-400 text-base uppercase tracking-widest">Team Blue ({blueTeamList.length})</h4>
                  <p className="text-xs text-slate-500">Pulls Left (Left Side)</p>
                </div>
                {me?.team !== "blue" && (
                  <Button onClick={() => handleSwitchTeam("blue")} size="sm" variant="outline" className="border-blue-500/30 text-blue-400 text-xs font-extrabold hover:bg-blue-600/10 rounded-xl px-4 py-2">
                    Join Team
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {blueTeamList.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3.5 bg-slate-950/50 border border-slate-900 rounded-2xl">
                    <span className="text-sm text-slate-200 font-extrabold">{p.name} {p.id === room.creatorId && "👑"}</span>
                    {p.isReady ? (
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-xs font-black border-transparent px-3 py-1 rounded-md">Ready</Badge>
                    ) : (
                      <Badge className="bg-slate-900 text-slate-500 text-xs font-bold border-transparent px-3 py-1 rounded-md">Waiting</Badge>
                    )}
                  </div>
                ))}
                {blueTeamList.length === 0 && <p className="text-center text-xs text-slate-500 py-6">No players on Team Blue yet.</p>}
              </div>
            </div>

            {/* Team Red Lobby */}
            <div className="space-y-4 p-6 bg-red-950/10 border border-red-500/10 rounded-[2rem] shadow-sm">
              <div className="flex items-center justify-between border-b border-red-500/10 pb-3">
                <div>
                  <h4 className="font-black text-red-400 text-base uppercase tracking-widest">Team Red ({redTeamList.length})</h4>
                  <p className="text-xs text-slate-500">Pulls Right (Right Side)</p>
                </div>
                {me?.team !== "red" && (
                  <Button onClick={() => handleSwitchTeam("red")} size="sm" variant="outline" className="border-red-500/30 text-red-400 text-xs font-extrabold hover:bg-red-600/10 rounded-xl px-4 py-2">
                    Join Team
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {redTeamList.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3.5 bg-slate-950/50 border border-slate-900 rounded-2xl">
                    <span className="text-sm text-slate-200 font-extrabold">{p.name} {p.id === room.creatorId && "👑"}</span>
                    {p.isReady ? (
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-xs font-black border-transparent px-3 py-1 rounded-md">Ready</Badge>
                    ) : (
                      <Badge className="bg-slate-900 text-slate-500 text-xs font-bold border-transparent px-3 py-1 rounded-md">Waiting</Badge>
                    )}
                  </div>
                ))}
                {redTeamList.length === 0 && <p className="text-center text-xs text-slate-500 py-6">No players on Team Red yet.</p>}
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="text-center p-6 bg-slate-900/30 border border-slate-800/80 rounded-3xl space-y-4 shadow-sm">
            <div className="flex justify-center gap-4">
              <Button onClick={handleToggleReady}
                className={cn("px-10 py-5 font-black uppercase text-xs rounded-xl tracking-wider hover:scale-105 transition-all shadow-md",
                  me?.isReady ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white")}>
                {me?.isReady ? "Not Ready ❌" : "I am Ready! ✓"}
              </Button>

              {isCreator && (
                <Button onClick={handleStartOnlineGame} disabled={!allReady}
                  className="px-12 py-5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black uppercase text-xs rounded-xl tracking-wider hover:scale-105 transition-all disabled:opacity-40 disabled:scale-100 flex items-center gap-2 shadow-lg shadow-purple-500/20">
                  <Play className="h-4 w-4" /> Start Battle
                </Button>
              )}
            </div>
            {!isCreator && <p className="text-xs text-slate-500">Wait for the room creator to start once everyone is ready.</p>}
            {isCreator && !allReady && <p className="text-xs text-amber-500 font-bold">Needs at least 2 players in the room, and all players must be Ready.</p>}
          </div>

        </div>
      );
    }

    // GAMEPLAY VIEW (playing, round_end, game_over)
    if (room.status === "playing" && room.currentProblem) {
      const correctWinner = playerList.find((p) => p.id === room.pullWinnerId);

      return (
        <div className="max-w-[98%] mx-auto w-full p-4 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <Button onClick={handleLeaveRoom} variant="ghost" className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-black uppercase rounded-2xl h-12 px-6">
              Leave Game
            </Button>
            <div className="flex items-center gap-3 text-sm font-extrabold text-slate-300">
              <span className="bg-purple-600/20 text-purple-300 px-4 py-1.5 rounded-xl border border-purple-500/20">Round {room.currentRound}</span>
              <span className="bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-xl">Invite Code: {room.roomCode}</span>
            </div>
            <div className={cn("flex items-center gap-1.5 text-2xl font-black tabular-nums",
              onlineTimer > 5 ? "text-emerald-400" : "text-red-500 animate-pulse")}>
              <Timer className="h-6 w-6 text-purple-400 animate-pulse" />
              <span>{onlineTimer}s</span>
            </div>
          </div>

          {/* Animated Tug of War Field */}
          {renderArena(room.ropePosition, room.config.winPullsRequired)}

          {/* Problem Display */}
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-10 text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
            <span className="text-xs text-purple-400 font-black uppercase tracking-widest block">Topic: {room.config.categoryId}</span>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight">{room.currentProblem.question}</h2>
          </div>

          {/* Answer Choice Panel */}
          <div className="max-w-4xl mx-auto w-full">
            {me?.lastAnsweredCorrectly !== null ? (
              <Card className="p-8 bg-slate-900/60 border-slate-800 text-center rounded-3xl space-y-4 shadow-xl">
                {me?.lastAnsweredCorrectly === true ? (
                  <div className="space-y-2">
                    <Check className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
                    <p className="text-2xl font-black text-emerald-400 tracking-tight">CORRECT!</p>
                    <p className="text-sm text-slate-400">You pulled the rope! Waiting for opponents or host...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <X className="h-12 w-12 text-red-500 mx-auto animate-pulse" />
                    <p className="text-2xl font-black text-red-500 tracking-tight">INCORRECT</p>
                    <p className="text-sm text-slate-400">You are locked out for this round. Teammates can still answer!</p>
                  </div>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {room.currentProblem.options.map((option) => (
                  <Button key={option} onClick={() => handleOnlineAnswer(option)} variant="outline"
                    className="h-24 sm:h-28 border-slate-800 bg-slate-950/60 hover:bg-purple-600/10 hover:border-purple-500/35 text-white font-black text-2xl sm:text-3xl rounded-2xl transition-all hover:scale-[1.02] shadow-sm">
                    {option}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Active players scores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto pt-4">
            <div className="p-4 bg-blue-950/5 border border-blue-500/10 rounded-2xl space-y-3">
              <span className="text-xs font-black text-blue-400 uppercase tracking-widest block">Blue Solvers</span>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {blueTeamList.map((p) => (
                  <div key={p.id} className="flex justify-between items-center text-xs font-bold text-slate-300">
                    <span>{p.name} {p.id === myPlayerId && "★"}</span>
                    <span>{p.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-red-950/5 border border-red-500/10 rounded-2xl space-y-3">
              <span className="text-xs font-black text-red-400 uppercase tracking-widest block">Red Solvers</span>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {redTeamList.map((p) => (
                  <div key={p.id} className="flex justify-between items-center text-xs font-bold text-slate-300">
                    <span>{p.name} {p.id === myPlayerId && "★"}</span>
                    <span>{p.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      );
    }

    // ROUND END / PULL RESOLUTION SCREEN
    if (room.status === "round_end") {
      const pullWinner = playerList.find((p) => p.id === room.pullWinnerId);

      return (
        <div className="max-w-4xl mx-auto w-full p-4 space-y-6 text-center">
          {renderArena(room.ropePosition, room.config.winPullsRequired)}

          <div className="space-y-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="text-5xl">💪</div>
            {room.pullWinnerId === 'all_failed' ? (
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-red-400 font-display">❌ All Players Failed!</h3>
                <p className="text-base text-slate-300 max-w-md mx-auto">Every player submitted an incorrect answer. The rope remains in position.</p>
              </div>
            ) : pullWinner ? (
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white font-display">
                  <span className={cn(pullWinner.team === "blue" ? "text-blue-400" : "text-red-400")}>{pullWinner.name}</span> Answered Correctly!
                </h3>
                <p className="text-base text-slate-300 max-w-md mx-auto">
                  Rope pulled 1 segment towards the <span className={cn("font-black capitalize", pullWinner.team === "blue" ? "text-blue-400" : "text-red-400")}>{pullWinner.team}</span> team!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white font-display">⏰ Round Ended in Timeout</h3>
                <p className="text-base text-slate-300 max-w-md mx-auto">Nobody answered correctly before the timer ran out. The rope remains in position.</p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 max-w-md mx-auto space-y-2.5 text-left">
              <span className="text-xs font-black uppercase text-indigo-400 tracking-wider block">Solution details</span>
              <p className="text-sm font-black text-slate-200">Question: <span className="font-mono ml-1">{room.currentProblem?.question}</span></p>
              <p className="text-sm font-black text-emerald-400">Answer: <span className="font-mono ml-1">{room.currentProblem?.answer}</span></p>
              {room.currentProblem?.solutionHint && (
                <p className="text-xs text-slate-400 font-medium">Hint: {room.currentProblem.solutionHint}</p>
              )}
            </div>

            {isCreator && (
              room.config.rounds > 0 && room.currentRound >= room.config.rounds ? (
                <Button onClick={() => endOnlineGameByScore(myRoomCode!)}
                  className="w-full max-w-md mx-auto py-5 bg-gradient-to-r from-amber-500 to-red-600 text-white font-black uppercase text-xs rounded-xl tracking-wider hover:scale-[1.03] transition-all mt-6 flex items-center justify-center gap-2 shadow-lg">
                  <Trophy className="h-4 w-4" /> View Verdict
                </Button>
              ) : (
                <Button onClick={handleOnlineNextRound}
                  className="w-full max-w-md mx-auto py-5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black uppercase text-xs rounded-xl tracking-wider hover:scale-[1.03] transition-all mt-6 flex items-center justify-center gap-2 shadow-lg">
                  <ArrowRight className="h-4 w-4" /> Next Round
                </Button>
              )
            )}
            {!isCreator && (
              room.config.rounds > 0 && room.currentRound >= room.config.rounds ? (
                <p className="text-xs font-bold text-slate-400 mt-6">Waiting for host to reveal the final verdict...</p>
              ) : (
                <p className="text-xs font-bold text-slate-400 mt-6">Waiting for host to start the next round...</p>
              )
            )}
          </div>
        </div>
      );
    }

    // GAME OVER VIEW (Online)
    if (room.status === "game_over") {
      const winningTeamName = room.winnerTeam === "blue" ? "Team Blue" : "Team Red";
      const winTeamList = room.winnerTeam === "blue" ? blueTeamList : redTeamList;

      // Find player with highest score to make MVP
      let mvp: TugPlayer | null = null;
      let hiScore = -1;
      playerList.forEach((p) => {
        if (p.score > hiScore) {
          hiScore = p.score;
          mvp = p;
        }
      });

      return (
        <div className="max-w-2xl mx-auto w-full p-4 space-y-6 text-center">
          <div className="space-y-2">
            <Trophy className="h-14 w-14 text-amber-400 mx-auto animate-bounce drop-shadow-[0_4px_12px_rgba(250,204,21,0.4)]" />
            <h2 className="text-3xl font-black text-white font-display uppercase tracking-tight">🏆 {winningTeamName} Wins the Battle!</h2>
            <p className="text-slate-400 text-xs">
              {Math.abs(room.ropePosition) >= room.config.winPullsRequired
                ? "The boundary marker crossed the red line!"
                : "Battle ended by rounds limit. Winner decided by team points!"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* MVP Panel */}
            <Card className="p-5 bg-slate-900/60 border-slate-800 rounded-3xl flex flex-col justify-between items-center text-center">
              <div>
                <Award className="h-8 w-8 text-indigo-400 mb-2" />
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">Battle MVP</span>
                <p className="text-lg font-black text-white mt-1">{mvp ? (mvp as TugPlayer).name : "N/A"}</p>
                <p className="text-xs text-slate-400 mt-1">Score: {mvp ? (mvp as TugPlayer).score : 0} points</p>
              </div>
              <Badge className="bg-indigo-500/10 text-indigo-400 font-extrabold text-[10px] border-transparent mt-4">Stellar Performance</Badge>
            </Card>

            {/* Score List */}
            <Card className="p-4 bg-slate-900/40 border-slate-800 rounded-3xl space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block text-left">Player Scores</span>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {[...playerList].sort((a, b) => b.score - a.score).map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between p-2 bg-slate-950/60 rounded-xl">
                    <span className="text-xs text-slate-200 font-extrabold">#{i + 1} {p.name} <span className="text-[10px] text-slate-500">({p.team})</span></span>
                    <span className="text-xs font-black text-amber-400">{p.score} pts</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row gap-3">
            {isCreator ? (
              <Button onClick={handleOnlineRestart}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-xs rounded-xl tracking-wider hover:scale-105 transition-all">
                Return Lobby
              </Button>
            ) : (
              <p className="text-xs font-bold text-slate-400 flex items-center justify-center flex-1">Waiting for host to reset room...</p>
            )}
            <Button onClick={handleLeaveRoom} variant="outline" className="border-slate-800 text-slate-300 text-xs font-black uppercase rounded-xl py-3 px-8">
              Leave Arena
            </Button>
          </div>

        </div>
      );
    }

    return null;
  };

  // -------------------------------------------------------
  // RENDER GAME OVER (LOCAL SCREEN)
  // -------------------------------------------------------
  const renderLocalGameOver = () => {
    let isBlueWin = false;
    let winReason = "The boundary marker crossed the red line!";
    
    if (Math.abs(ropePosition) >= localWinPulls) {
      isBlueWin = ropePosition > 0;
    } else {
      if (blueTeam.score > redTeam.score) {
        isBlueWin = true;
        winReason = `Winner decided by higher points (${blueTeam.score} vs ${redTeam.score})!`;
      } else if (redTeam.score > blueTeam.score) {
        isBlueWin = false;
        winReason = `Winner decided by higher points (${redTeam.score} vs ${blueTeam.score})!`;
      } else {
        isBlueWin = ropePosition >= 0;
        winReason = isBlueWin 
          ? "Points were tied! Blue team wins by rope position advantage." 
          : "Points were tied! Red team wins by rope position advantage.";
      }
    }
    const winnerName = isBlueWin ? blueTeam.name : redTeam.name;

    return (
      <div className="max-w-md mx-auto w-full p-4 space-y-6 text-center">
        <div className="space-y-2">
          <Trophy className="h-16 w-16 text-amber-400 mx-auto animate-bounce drop-shadow-[0_4px_12px_rgba(250,204,21,0.4)]" />
          <h2 className="text-3xl font-black text-white font-display tracking-tight uppercase">🏆 {winnerName} Wins!</h2>
          <p className="text-slate-400 text-xs">{winReason}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-blue-950/10 border-blue-500/20 text-center rounded-2xl">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">Blue Score</span>
            <p className="text-2xl font-black text-white mt-1">{blueTeam.score}</p>
          </Card>

          <Card className="p-4 bg-red-950/10 border-red-500/20 text-center rounded-2xl">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block">Red Score</span>
            <p className="text-2xl font-black text-white mt-1">{redTeam.score}</p>
          </Card>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col gap-3">
          <Button onClick={handleStartLocalGame}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black uppercase text-xs rounded-xl tracking-wider hover:scale-105 transition-all">
            Play Again
          </Button>
          <Button onClick={() => setScreen("localConfig")} variant="outline" className="w-full border-slate-800 text-slate-300 text-xs font-black uppercase rounded-xl py-3">
            Change Settings
          </Button>
          <Button onClick={() => setScreen("modeSelect")} variant="ghost" className="w-full text-slate-500 hover:text-slate-300 text-xs font-bold uppercase py-2">
            Exit Menu
          </Button>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------
  // MASTER RENDER
  // -------------------------------------------------------
  return (
    <div className="w-full min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 flex flex-col justify-between py-6">
      
      {/* Top Header Section */}
      <div className="max-w-[95%] mx-auto w-full px-4 flex items-center justify-between border-b border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Swords className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white font-display">ENGLISH TUG OF WAR</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Battle of the Words</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Toggle */}
          <button onClick={() => setIsAudioEnabled((p) => !p)}
            className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors shadow-sm"
            title="Toggle Audio">
            {isAudioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>

          {/* Fullscreen Toggle */}
          {onToggleFullscreen && (
            <button onClick={onToggleFullscreen}
              className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors shadow-sm"
              title="Toggle Fullscreen">
              <Maximize className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Screen Content */}
      <div className="flex-1 max-w-[95%] mx-auto w-full px-4 py-8 flex flex-col justify-center">
        {screen === "modeSelect" && renderModeSelect()}
        {screen === "localConfig" && renderLocalConfig()}
        {screen === "localPlay" && renderLocalPlay()}
        {screen === "onlineConfig" && renderOnlineConfig()}
        {screen === "onlinePlay" && renderOnlinePlay()}
        {screen === "gameOver" && renderLocalGameOver()}
      </div>

      {/* Footer Branding */}
      <div className="max-w-[95%] mx-auto w-full px-4 text-center border-t border-slate-900 pt-4 text-[10px] text-slate-600 font-black tracking-wider uppercase select-none">
        LingoLand Interactive Arena Modules
      </div>

    </div>
  );
}
