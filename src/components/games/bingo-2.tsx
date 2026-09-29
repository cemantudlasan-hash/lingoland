"use client";

import * as React from "react";
import { createPortal, flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { getGameBySlug } from "@/lib/games";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { logAnalyticsEvent } from "@/lib/analytics";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize2,
  GraduationCap,
  Users,
  Grid3X3,
  Grid2X2,
  Play,
  Pause,
  Shuffle,
  Star,
  Check,
  Radio,
  BookOpen,
  Split,
  Printer,
  Sliders,
  X,
  Info,
  Layers,
  Award,
  LogOut,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- TYPES & INTERFACES ---

export interface VocabItem {
  id: string;
  word: string;
  definition: string;
  category: string;
  emoji: string;
}

export type GridSize = 3 | 5;
export type GameViewMode = "student" | "teacher" | "split";
export type DrawSpeed = "fast" | "normal" | "slow";

export interface BingoCell {
  row: number;
  col: number;
  word: string;
  emoji?: string;
  isFree?: boolean;
  marked: boolean;
  isWinningCell?: boolean;
}

export interface WinningLine {
  type: "row" | "col" | "diagonal-main" | "diagonal-anti";
  index?: number;
  label: string;
}

export interface PrintCardData {
  categoryTitle: string;
  gridSize: GridSize;
  studentCount: number;
  winnerIndices: Set<number>;
  targetWinningWords: VocabItem[];
  allWords: VocabItem[];
  cards: {
    cardIndex: number;
    isWinner: boolean;
    cells: { word: string; emoji?: string; isFree?: boolean }[][];
  }[];
  cardsPerPage: 1 | 2;
  includeKey: boolean;
}

export type BingoEvent =
  | { type: "WORD_DRAWN"; word: VocabItem; remainingCount: number; timestamp: number }
  | { type: "GAME_RESET"; category: string; gridSize: GridSize; timestamp: number }
  | { type: "STUDENT_BINGO"; studentName: string; lineLabel: string; timestamp: number };

export const BINGO2_STORAGE_KEY = "lingoland_bingo2_active_session_v1";

export interface Bingo2SavedSession {
  version: 1;
  roomCode: string;
  gridSize: GridSize;
  selectedCategory: string;
  viewMode: GameViewMode;
  drawSpeed: DrawSpeed;
  isMuted: boolean;
  allowFreePlay: boolean;
  drawnWords: VocabItem[];
  currentMysteryWord: VocabItem | null;
  studentCard: BingoCell[][];
  winningLines: WinningLine[];
  celebrationDetails: {
    lineLabel: string;
    drawCount: number;
    xpEarned: number;
    coinsEarned: number;
  } | null;
  showWinCelebration: boolean;
  printData: {
    categoryTitle: string;
    gridSize: GridSize;
    studentCount: number;
    winnerIndices: number[];
    targetWinningWords: VocabItem[];
    allWords: VocabItem[];
    cards: {
      cardIndex: number;
      isWinner: boolean;
      cells: { word: string; emoji?: string; isFree?: boolean }[][];
    }[];
    cardsPerPage: 1 | 2;
    includeKey: boolean;
  } | null;
  studentCountInput: number;
  cardsPerPage: 1 | 2;
  includeCallSheet: boolean;
  lastUpdated: number;
}

// --- 50+ RICH VOCABULARY WORDS PER CATEGORY ---

const VOCAB_CATEGORIES: Record<string, { label: string; icon: string; words: VocabItem[] }> = {
  animals: {
    label: "Animals & Wildlife",
    icon: "🦁",
    words: [
      { id: "a1", word: "Cheetah", definition: "The fastest land animal on Earth capable of breathtaking speeds", category: "animals", emoji: "🐆" },
      { id: "a2", word: "Dolphin", definition: "A highly intelligent, friendly aquatic mammal that leaps through waves", category: "animals", emoji: "🐬" },
      { id: "a3", word: "Kangaroo", definition: "An Australian marsupial with powerful legs and a pouch for its joey", category: "animals", emoji: "🦘" },
      { id: "a4", word: "Penguin", definition: "A flightless tuxedo-patterned bird built for diving in cold oceans", category: "animals", emoji: "🐧" },
      { id: "a5", word: "Elephant", definition: "The largest land mammal, known for its long trunk, memory, and tusks", category: "animals", emoji: "🐘" },
      { id: "a6", word: "Giraffe", definition: "A majestic African herbivore with an exceptionally long neck and spots", category: "animals", emoji: "🦒" },
      { id: "a7", word: "Koala", definition: "An Australian tree-dweller that spends its days munching eucalyptus", category: "animals", emoji: "🐨" },
      { id: "a8", word: "Chameleon", definition: "A color-shifting lizard with independently moving eyes and long tongue", category: "animals", emoji: "🦎" },
      { id: "a9", word: "Owl", definition: "A wise nocturnal bird of prey with silent flight and sharp night vision", category: "animals", emoji: "🦉" },
      { id: "a10", word: "Panda", definition: "A beloved bear native to China that thrives almost entirely on bamboo", category: "animals", emoji: "🐼" },
      { id: "a11", word: "Octopus", definition: "A clever ocean creature with eight tentacles, blue blood, and three hearts", category: "animals", emoji: "🐙" },
      { id: "a12", word: "Zebra", definition: "An African wild equine instantly recognized by its black-and-white stripes", category: "animals", emoji: "🦓" },
      { id: "a13", word: "Gorilla", definition: "A gentle yet remarkably strong great ape living in lush African forests", category: "animals", emoji: "🦍" },
      { id: "a14", word: "Flamingo", definition: "A tall wading bird that sports vivid pink feathers from eating shrimp", category: "animals", emoji: "🦩" },
      { id: "a15", word: "Eagle", definition: "A fierce raptor with razor-sharp talons and soaring aerial vision", category: "animals", emoji: "🦅" },
      { id: "a16", word: "Polar Bear", definition: "A massive marine apex predator built for survival on Arctic sea ice", category: "animals", emoji: "🐻‍❄️" },
      { id: "a17", word: "Tiger", definition: "The largest big cat with golden-orange fur and distinct camouflage stripes", category: "animals", emoji: "🐅" },
      { id: "a18", word: "Whale", definition: "A colossal marine mammal that sings underwater and breathes via blowhole", category: "animals", emoji: "🐋" },
      { id: "a19", word: "Hedgehog", definition: "A small woodland critter covered in protective prickles that rolls into a ball", category: "animals", emoji: "🦔" },
      { id: "a20", word: "Falcon", definition: "The world's fastest aerial hunter capable of supersonic diving speeds", category: "animals", emoji: "🦅" },
      { id: "a21", word: "Otter", definition: "A playful river animal that floats on its back and cracks shells with stones", category: "animals", emoji: "🦦" },
      { id: "a22", word: "Peacock", definition: "A flamboyant bird famous for spreading an iridescent fan of eye-spotted feathers", category: "animals", emoji: "🦚" },
      { id: "a23", word: "Sloth", definition: "A slow-moving canopy animal that spends almost its whole life hanging upside down", category: "animals", emoji: "🦥" },
      { id: "a24", word: "Wolf", definition: "A loyal pack canine that howls across the wilderness and hunts together", category: "animals", emoji: "🐺" },
      { id: "a25", word: "Seahorse", definition: "A tiny underwater fish with an equine head, armor plates, and prehensile tail", category: "animals", emoji: "🌊" },
      { id: "a26", word: "Lion", definition: "Known as the King of the Jungle with a magnificent golden mane and mighty roar", category: "animals", emoji: "🦁" },
      { id: "a27", word: "Hippopotamus", definition: "A massive semi-aquatic river beast that basks in African waters", category: "animals", emoji: "🦛" },
      { id: "a28", word: "Rhinoceros", definition: "A heavily armored prehistoric herbivore sporting one or two keratin horns", category: "animals", emoji: "🦏" },
      { id: "a29", word: "Leopard", definition: "A stealthy spotted predator famous for hauling prey high into tree branches", category: "animals", emoji: "🐆" },
      { id: "a30", word: "Crocodile", definition: "An ancient armored reptile with immense jaw pressure lurking at river edges", category: "animals", emoji: "🐊" },
      { id: "a31", word: "Squirrel", definition: "A bushy-tailed woodland acrobat that stashes nuts for the winter", category: "animals", emoji: "🐿️" },
      { id: "a32", word: "Beaver", definition: "Nature's engineer with webbed feet and sharp teeth that builds river dams", category: "animals", emoji: "🦫" },
      { id: "a33", word: "Fox", definition: "A cunning rust-colored canine known for a fluffy tail and clever survival skills", category: "animals", emoji: "🦊" },
      { id: "a34", word: "Raccoon", definition: "A masked nocturnal opportunist with dexterous paws and inquisitive curiosity", category: "animals", emoji: "🦝" },
      { id: "a35", word: "Deer", definition: "A graceful herbivore with slender legs, keen ears, and branching antlers", category: "animals", emoji: "🦌" },
      { id: "a36", word: "Moose", definition: "The largest species of deer with huge palmate antlers roaming northern forests", category: "animals", emoji: "🫎" },
      { id: "a37", word: "Camel", definition: "A resilient desert nomad storing fat in humps to endure long journeys", category: "animals", emoji: "🐫" },
      { id: "a38", word: "Meerkat", definition: "A social desert mongoose that stands tall on hind legs acting as sentries", category: "animals", emoji: "🐾" },
      { id: "a39", word: "Badger", definition: "A fiercely brave burrowing carnivore with distinct black-and-white facial stripes", category: "animals", emoji: "🦡" },
      { id: "a40", word: "Platypus", definition: "A bizarre duck-billed, egg-laying mammal native to eastern Australian streams", category: "animals", emoji: "🦆" },
      { id: "a41", word: "Stingray", definition: "A flat cartilaginous marine fish that glides like a winged bird across sea floors", category: "animals", emoji: "🐟" },
      { id: "a42", word: "Jellyfish", definition: "A translucent pulsating bell-shaped invertebrate with trailing tentacles", category: "animals", emoji: "🪼" },
      { id: "a43", word: "Lobster", definition: "A heavy-shelled sea crustacean armed with two formidable grasping claws", category: "animals", emoji: "🦞" },
      { id: "a44", word: "Turtle", definition: "An ancient reptilian with a protective bony shell navigating seas and shores", category: "animals", emoji: "🐢" },
      { id: "a45", word: "Toucan", definition: "A rainforest bird sporting an oversized rainbow-colored beak for plucking fruit", category: "animals", emoji: "🦜" },
      { id: "a46", word: "Parrot", definition: "A brilliant tropical bird capable of mimicking human speech and words", category: "animals", emoji: "🦜" },
      { id: "a47", word: "Woodpecker", definition: "A forest bird that rhythmically pecks tree trunks in search of insects", category: "animals", emoji: "🌲" },
      { id: "a48", word: "Swan", definition: "A graceful white waterfowl celebrated in poetry for beauty and fidelity", category: "animals", emoji: "🦢" },
      { id: "a49", word: "Hummingbird", definition: "A miniature iridescent bird that beats wings fast enough to hover in mid-air", category: "animals", emoji: "🌸" },
      { id: "a50", word: "Walrus", definition: "An enormous Arctic marine pinniped with long ivory tusks and stiff whiskers", category: "animals", emoji: "🦭" },
    ],
  },
  food: {
    label: "Food & Cuisine",
    icon: "🍕",
    words: [
      { id: "f1", word: "Avocado", definition: "A creamy nutrient-dense green fruit beloved on toast and in guacamole", category: "food", emoji: "🥑" },
      { id: "f2", word: "Croissant", definition: "A golden flaky French pastry layered with butter and shaped like a crescent", category: "food", emoji: "🥐" },
      { id: "f3", word: "Pancakes", definition: "Fluffy griddled breakfast cakes served stacked with butter and maple syrup", category: "food", emoji: "🥞" },
      { id: "f4", word: "Sushi", definition: "An artful Japanese dish of seasoned vinegared rice with seafood or vegetables", category: "food", emoji: "🍣" },
      { id: "f5", word: "Pizza", definition: "An Italian classic featuring baked crust topped with savory tomato sauce and cheese", category: "food", emoji: "🍕" },
      { id: "f6", word: "Strawberry", definition: "A juicy ruby-red heart-shaped fruit dotted with tiny exterior seeds", category: "food", emoji: "🍓" },
      { id: "f7", word: "Dumpling", definition: "A pillowy dough pocket filled with minced meats or veggies and steamed or pan-fried", category: "food", emoji: "🥟" },
      { id: "f8", word: "Watermelon", definition: "A giant refreshing summer melon with sweet pink flesh and black seeds", category: "food", emoji: "🍉" },
      { id: "f9", word: "Spaghetti", definition: "Long slender pasta noodles typically twirled on a fork with bolognese or marinara", category: "food", emoji: "🍝" },
      { id: "f10", word: "Chocolate", definition: "A decadent confection made from cacao beans that melts deliciously on the tongue", category: "food", emoji: "🍫" },
      { id: "f11", word: "Pineapple", definition: "A tropical fruit with a spiny crown and sweet tangy golden slices", category: "food", emoji: "🍍" },
      { id: "f12", word: "Sandwich", definition: "A versatile lunch of meats, cheeses, and greens layered between slices of bread", category: "food", emoji: "🥪" },
      { id: "f13", word: "Taco", definition: "A crisp or soft corn tortilla folded around seasoned beef, salsa, and cheese", category: "food", emoji: "🌮" },
      { id: "f14", word: "Broccoli", definition: "An edible green cruciferous plant whose florets look like miniature trees", category: "food", emoji: "🥦" },
      { id: "f15", word: "Cupcake", definition: "A single-serving mini cake baked in a paper cup with swirls of frosting", category: "food", emoji: "🧁" },
      { id: "f16", word: "Burger", definition: "A savory grilled patty served in a sliced bun with crisp lettuce and sauces", category: "food", emoji: "🍔" },
      { id: "f17", word: "Pretzel", definition: "A traditional twisted baked knot sprinkled with coarse salt granules", category: "food", emoji: "🥨" },
      { id: "f18", word: "Noodles", definition: "Long ribbons of dough cooked in piping broth or tossed in aromatic stir-fries", category: "food", emoji: "🍜" },
      { id: "f19", word: "Honey", definition: "A natural sweet golden nectar produced by diligent honeybees from blossoms", category: "food", emoji: "🍯" },
      { id: "f20", word: "Mango", definition: "A fragrant tropical stone fruit bursting with sweet sunny orange juice", category: "food", emoji: "🥭" },
      { id: "f21", word: "Ramen", definition: "A deeply savory Japanese soup of wheat noodles, broth, boiled egg, and scallions", category: "food", emoji: "🍜" },
      { id: "f22", word: "Cookie", definition: "A warm baked sweet treat studded with melty semi-sweet chocolate morsels", category: "food", emoji: "🍪" },
      { id: "f23", word: "Apple", definition: "A crisp orchard fruit celebrated worldwide in red, green, and golden varieties", category: "food", emoji: "🍎" },
      { id: "f24", word: "Donut", definition: "A ring of fluffy fried dough coated in glistening sugar glaze or sprinkles", category: "food", emoji: "🍩" },
      { id: "f25", word: "Coconut", definition: "A tropical palm fruit with a hard fiber shell filled with sweet water and meat", category: "food", emoji: "🥥" },
      { id: "f26", word: "Bagel", definition: "A dense, chewy ring-shaped bread boiled before baking and topped with seeds", category: "food", emoji: "🥯" },
      { id: "f27", word: "Cheese", definition: "A dairy delight crafted from curdled milk spanning mild cheddar to sharp gouda", category: "food", emoji: "🧀" },
      { id: "f28", word: "Tomato", definition: "A plump red garden fruit universally celebrated across culinary dishes", category: "food", emoji: "🍅" },
      { id: "f29", word: "Banana", definition: "A potassium-rich curved yellow fruit that peels open into a creamy snack", category: "food", emoji: "🍌" },
      { id: "f30", word: "Grapes", definition: "Clusters of sweet juicy spheres that grow on vines in purple and green hues", category: "food", emoji: "🍇" },
      { id: "f31", word: "Peach", definition: "A fuzzy velvety summer fruit with sweet aromatic flesh around a central pit", category: "food", emoji: "🍑" },
      { id: "f32", word: "Cherry", definition: "A small round deep-red stone fruit dangling on a slender pair of green stems", category: "food", emoji: "🍒" },
      { id: "f33", word: "Lemon", definition: "A bright yellow citrus fruit loaded with sour acidity and vitamin C", category: "food", emoji: "🍋" },
      { id: "f34", word: "Orange", definition: "A round sweet citrus fruit divided into juicy crescent segments", category: "food", emoji: "🍊" },
      { id: "f35", word: "Carrot", definition: "A crunchy orange root vegetable famous for sweetness and supporting eyesight", category: "food", emoji: "🥕" },
      { id: "f36", word: "Corn", definition: "Tall stalks bearing golden kernels in rows wrapped inside green husks", category: "food", emoji: "🌽" },
      { id: "f37", word: "Potato", definition: "A hearty underground tuber that can be baked, mashed, roasted, or fried", category: "food", emoji: "🥔" },
      { id: "f38", word: "Onion", definition: "A layered bulb vegetable that imparts deep savory aroma to countless recipes", category: "food", emoji: "🧅" },
      { id: "f39", word: "Mushroom", definition: "An earthy culinary fungus celebrated for adding rich umami depth to dishes", category: "food", emoji: "🍄" },
      { id: "f40", word: "Rice", definition: "The dietary staple grain sustaining billions across Asia and the global pantry", category: "food", emoji: "🍚" },
      { id: "f41", word: "Steak", definition: "A tender cut of beef seared over high heat to perfection on a grill", category: "food", emoji: "🥩" },
      { id: "f42", word: "Salmon", definition: "A pink-fleshed coldwater fish rich in healthy omega-3 fatty acids", category: "food", emoji: "🐟" },
      { id: "f43", word: "Waffle", definition: "A crisp batter cake cooked in an iron press with a checkered grid for syrup", category: "food", emoji: "🧇" },
      { id: "f44", word: "Popcorn", definition: "Fluffy puffed corn kernels popped with heat and tossed in melted butter", category: "food", emoji: "🍿" },
      { id: "f45", word: "Muffin", definition: "An individual baked quick-bread bursting with blueberries or bran", category: "food", emoji: "🧁" },
      { id: "f46", word: "Pie", definition: "A flaky golden pastry crust loaded with spiced cinnamon apples or cherries", category: "food", emoji: "🥧" },
      { id: "f47", word: "Ice Cream", definition: "A chilled churned dessert of cream, sugar, and vanilla swirled in a waffle cone", category: "food", emoji: "🍨" },
      { id: "f48", word: "Yogurt", definition: "A creamy fermented dairy product packed with wholesome probiotics", category: "food", emoji: "🥛" },
      { id: "f49", word: "Soup", definition: "A comforting hot liquid dish simmering with vegetables, herbs, and broth", category: "food", emoji: "🍲" },
      { id: "f50", word: "Bread", definition: "The essential human baked food crafted from leavened flour, water, and yeast", category: "food", emoji: "🍞" },
    ],
  },
  actions: {
    label: "Action Verbs & Activities",
    icon: "⚡",
    words: [
      { id: "v1", word: "Whisper", definition: "To speak very softly using breath instead of full vocal cords", category: "actions", emoji: "🤫" },
      { id: "v2", word: "Sprint", definition: "To run at full throttle over a short distance with explosive speed", category: "actions", emoji: "🏃" },
      { id: "v3", word: "Explore", definition: "To venture into unfamiliar territory in pursuit of new knowledge", category: "actions", emoji: "🧭" },
      { id: "v4", word: "Celebrate", definition: "To commemorate a triumph or happy event with joyful festivities", category: "actions", emoji: "🎉" },
      { id: "v5", word: "Create", definition: "To invent or bring an original work of imagination into reality", category: "actions", emoji: "🎨" },
      { id: "v6", word: "Discover", definition: "To come across or uncover something previously hidden or unknown", category: "actions", emoji: "🔍" },
      { id: "v7", word: "Climb", definition: "To ascend upwards using hands, feet, and grit on a steep incline", category: "actions", emoji: "🧗" },
      { id: "v8", word: "Balance", definition: "To keep an upright poise steadily without swaying or falling", category: "actions", emoji: "⚖️" },
      { id: "v9", word: "Inspire", definition: "To fill someone with the creative spark or urge to accomplish greatness", category: "actions", emoji: "💡" },
      { id: "v10", word: "Navigate", definition: "To plot and steer a voyage safely through uncharted waters or skies", category: "actions", emoji: "🗺️" },
      { id: "v11", word: "Construct", definition: "To build a complex framework, structure, or architectural wonder", category: "actions", emoji: "🏗️" },
      { id: "v12", word: "Reflect", definition: "To meditate thoughtfully upon lessons, ideas, or personal growth", category: "actions", emoji: "🪞" },
      { id: "v13", word: "Harmonize", definition: "To combine vocal notes or disparate voices into sweet concordance", category: "actions", emoji: "🎵" },
      { id: "v14", word: "Transform", definition: "To evolve completely in appearance, purpose, or character", category: "actions", emoji: "✨" },
      { id: "v15", word: "Investigate", definition: "To probe deeply into clues and facts to solve a puzzle or mystery", category: "actions", emoji: "🕵️" },
      { id: "v16", word: "Collaborate", definition: "To join forces with fellow teammates toward a mutual dream", category: "actions", emoji: "🤝" },
      { id: "v17", word: "Observe", definition: "To watch with keen concentration to document natural phenomena", category: "actions", emoji: "👀" },
      { id: "v18", word: "Decipher", definition: "To crack a secret code or translate mysterious ancient runes", category: "actions", emoji: "📜" },
      { id: "v19", word: "Illustrate", definition: "To illuminate a written tale with vibrant drawings and visuals", category: "actions", emoji: "✏️" },
      { id: "v20", word: "Experiment", definition: "To test a hypothesis under careful conditions to gain scientific proof", category: "actions", emoji: "🧪" },
      { id: "v21", word: "Achieve", definition: "To reach an ambitious milestone through relentless perseverance", category: "actions", emoji: "🎯" },
      { id: "v22", word: "Persevere", definition: "To persist onward through adversity and never surrender hope", category: "actions", emoji: "🛡️" },
      { id: "v23", word: "Innovate", definition: "To design pioneering inventions and break past conventional limits", category: "actions", emoji: "🚀" },
      { id: "v24", word: "Encourage", definition: "To uplift someone with words of faith, warmth, and reassurance", category: "actions", emoji: "💖" },
      { id: "v25", word: "Summarize", definition: "To extract the most vital essence of a story into a concise briefing", category: "actions", emoji: "📝" },
      { id: "v26", word: "Laugh", definition: "To express spontaneous joy through infectious vocal chuckles", category: "actions", emoji: "😄" },
      { id: "v27", word: "Dance", definition: "To move one's body in rhythm to music with style and grace", category: "actions", emoji: "💃" },
      { id: "v28", word: "Sing", definition: "To produce melodious musical sounds using the human singing voice", category: "actions", emoji: "🎤" },
      { id: "v29", word: "Travel", definition: "To journey across lands and seas to encounter diverse cultures", category: "actions", emoji: "🧳" },
      { id: "v30", word: "Paint", definition: "To apply color and stroke imagination across a blank canvas", category: "actions", emoji: "🖌️" },
      { id: "v31", word: "Jump", definition: "To propel oneself off the ground into the air with leg power", category: "actions", emoji: "🦘" },
      { id: "v32", word: "Swim", definition: "To glide and kick through water using graceful strokes", category: "actions", emoji: "🏊" },
      { id: "v33", word: "Read", definition: "To interpret written text and immerse in stories and ideas", category: "actions", emoji: "📖" },
      { id: "v34", word: "Write", definition: "To compose words and thoughts into structured sentences", category: "actions", emoji: "✍️" },
      { id: "v35", word: "Listen", definition: "To give thoughtful attention to sounds, advice, and music", category: "actions", emoji: "👂" },
      { id: "v36", word: "Speak", definition: "To articulate thoughts clearly aloud into spoken language", category: "actions", emoji: "🗣️" },
      { id: "v37", word: "Teach", definition: "To impart wisdom, skills, and understanding to curious learners", category: "actions", emoji: "👨‍🏫" },
      { id: "v38", word: "Learn", definition: "To gain knowledge and mastery through study and curiosity", category: "actions", emoji: "🧠" },
      { id: "v39", word: "Cook", definition: "To prepare delectable meals using heat, spice, and love", category: "actions", emoji: "🍳" },
      { id: "v40", word: "Bake", definition: "To cook breads and sweets inside a warm oven", category: "actions", emoji: "🥖" },
      { id: "v41", word: "Build", definition: "To assemble pieces together into a sturdy completed object", category: "actions", emoji: "🔨" },
      { id: "v42", word: "Draw", definition: "To sketch outlines and forms using pencils, pens, or crayons", category: "actions", emoji: "📐" },
      { id: "v43", word: "Fly", definition: "To soar aloft through the endless sky like a majestic bird", category: "actions", emoji: "✈️" },
      { id: "v44", word: "Catch", definition: "To intercept and seize a moving ball or item in mid-air", category: "actions", emoji: "🧤" },
      { id: "v45", word: "Throw", definition: "To propel an object forward through the air with arm swing", category: "actions", emoji: "⚾" },
      { id: "v46", word: "Kick", definition: "To strike an object or ball forcefully with one's foot", category: "actions", emoji: "⚽" },
      { id: "v47", word: "Drive", definition: "To operate and guide the direction of a motor vehicle", category: "actions", emoji: "🚗" },
      { id: "v48", word: "Ride", definition: "To sit upon and travel astride a bicycle, skateboard, or horse", category: "actions", emoji: "🚲" },
      { id: "v49", word: "Protect", definition: "To shield and defend something precious from harm", category: "actions", emoji: "🛡️" },
      { id: "v50", word: "Rescue", definition: "To save someone from a perilous or challenging dilemma", category: "actions", emoji: "🚑" },
    ],
  },
  places: {
    label: "Places & Geography",
    icon: "🌍",
    words: [
      { id: "p1", word: "Volcano", definition: "A volcanic mountain with an opening where fiery magma and ash erupt", category: "places", emoji: "🌋" },
      { id: "p2", word: "Glacier", definition: "A massive, majestic frozen river of compressed ice slowly carving valleys", category: "places", emoji: "🧊" },
      { id: "p3", word: "Rainforest", definition: "A vibrant jungle canopy drenched in rainfall and thriving with species", category: "places", emoji: "🌴" },
      { id: "p4", word: "Waterfall", definition: "A roaring curtain of river water tumbling over a steep rocky cliff", category: "places", emoji: "🌊" },
      { id: "p5", word: "Canyon", definition: "A dramatic deep gorge carved out across millions of years by a winding river", category: "places", emoji: "🏜️" },
      { id: "p6", word: "Island", definition: "A piece of tranquil paradise surrounded on all horizons by water", category: "places", emoji: "🏝️" },
      { id: "p7", word: "Lighthouse", definition: "A tall coastal beacon shining a rotating ray to guide ships past rocks", category: "places", emoji: "🗼" },
      { id: "p8", word: "Museum", definition: "A hall of wonder preserving art, history, and scientific treasures", category: "places", emoji: "🏛️" },
      { id: "p9", word: "Observatory", definition: "A domed hilltop facility with giant telescopes peering at distant galaxies", category: "places", emoji: "🔭" },
      { id: "p10", word: "Library", definition: "A serene haven holding thousands of books and stories waiting to be read", category: "places", emoji: "📚" },
      { id: "p11", word: "Aquarium", definition: "A fascinating marine center where colorful fish and rays glide in glass tanks", category: "places", emoji: "🐠" },
      { id: "p12", word: "Desert", definition: "A sun-baked land of shifting sand dunes that receives almost no rain", category: "places", emoji: "🐪" },
      { id: "p13", word: "Harbor", definition: "A safe coastal basin where sailing ships anchor sheltered from stormy tides", category: "places", emoji: "⚓" },
      { id: "p14", word: "Pyramid", definition: "A colossal ancient stone monument with four sloping triangular sides", category: "places", emoji: "📐" },
      { id: "p15", word: "Castle", definition: "A magnificent medieval stone fortress complete with moats and towers", category: "places", emoji: "🏰" },
      { id: "p16", word: "Metro", definition: "A swift underground electric transit system carrying city commuters", category: "places", emoji: "🚇" },
      { id: "p17", word: "Bridge", definition: "An engineering marvel connecting shores across rivers, bays, and chasms", category: "places", emoji: "🌉" },
      { id: "p18", word: "Market", definition: "A lively bazaar filled with stalls of fresh fruit, spices, and artisan goods", category: "places", emoji: "🛍️" },
      { id: "p19", word: "Oasis", definition: "A lush pocket of palms and fresh groundwater amidst desert dunes", category: "places", emoji: "💧" },
      { id: "p20", word: "Skyscraper", definition: "A soaring steel-and-glass tower reaching high up into the clouds", category: "places", emoji: "🏙️" },
      { id: "p21", word: "Planetarium", definition: "A domed cosmic theater projecting the night constellations and planetary orbits", category: "places", emoji: "🪐" },
      { id: "p22", word: "Sanctuary", definition: "A protected ecological reserve where wildlife roams freely without threat", category: "places", emoji: "🌿" },
      { id: "p23", word: "Botanical Garden", definition: "A peaceful sanctuary cultivating exotic flowers, bonsai, and flora", category: "places", emoji: "🌺" },
      { id: "p24", word: "Valley", definition: "A fertile expanse of low ground nestled between rolling mountain peaks", category: "places", emoji: "🌄" },
      { id: "p25", word: "Cave", definition: "A mysterious subterranean chamber sculpted by groundwater in limestone", category: "places", emoji: "🦇" },
      { id: "p26", word: "Forest", definition: "A vast territory blanketed with ancient trees, moss, and woodland creatures", category: "places", emoji: "🌲" },
      { id: "p27", word: "Mountain", definition: "A towering geological peak ascending steeply into crisp alpine air", category: "places", emoji: "⛰️" },
      { id: "p28", word: "Lake", definition: "A calm body of freshwater surrounded completely by peaceful shorelines", category: "places", emoji: "🛶" },
      { id: "p29", word: "River", definition: "A continuous ribbon of freshwater flowing seaward through valleys", category: "places", emoji: "🏞️" },
      { id: "p30", word: "Beach", definition: "A sunny shoreline of soft sands meeting rhythmic ocean waves", category: "places", emoji: "🏖️" },
      { id: "p31", word: "Meadow", definition: "A sunlit field of wildflowers and grasses dancing in summer breezes", category: "places", emoji: "🌻" },
      { id: "p32", word: "Temple", definition: "A sacred architectural sanctuary dedicated to peace, meditation, and faith", category: "places", emoji: "🛕" },
      { id: "p33", word: "Airport", definition: "A busy international hub where airliners arrive and depart for destinations", category: "places", emoji: "🛫" },
      { id: "p34", word: "Station", definition: "A central terminal where trains pause to embark and disembark passengers", category: "places", emoji: "🚉" },
      { id: "p35", word: "Stadium", definition: "A massive open-air arena where athletic championships and games unfold", category: "places", emoji: "🏟️" },
      { id: "p36", word: "Theater", definition: "A stage hall where live drama, musicals, and orchestra concerts perform", category: "places", emoji: "🎭" },
      { id: "p37", word: "Palace", definition: "A grand residence designed for kings, queens, and state ceremonies", category: "places", emoji: "👑" },
      { id: "p38", word: "Tower", definition: "A tall slender vertical spire looking out across surrounding landscapes", category: "places", emoji: "🗼" },
      { id: "p39", word: "Village", definition: "A tight-knit community of cozy cottages set in idyllic countryside", category: "places", emoji: "🏡" },
      { id: "p40", word: "Capital", definition: "The principal city of a country housing the seat of government", category: "places", emoji: "🏛️" },
      { id: "p41", word: "Continent", definition: "One of the Earth's seven vast landmasses bounded by oceans", category: "places", emoji: "🗺️" },
      { id: "p42", word: "Peninsula", definition: "A piece of land projecting out into water, connected on only one side", category: "places", emoji: "🌊" },
      { id: "p43", word: "Plateau", definition: "An elevated area of flat land rising steeply above surrounding terrain", category: "places", emoji: "⛰️" },
      { id: "p44", word: "Jungle", definition: "A dense tropical wilderness teeming with vines, orchids, and wildlife", category: "places", emoji: "🐒" },
      { id: "p45", word: "Lagoon", definition: "A shallow body of turquoise water separated from deep ocean by reefs", category: "places", emoji: "🪸" },
      { id: "p46", word: "Coral Reef", definition: "An underwater metropolis formed by coral polyps teeming with sea life", category: "places", emoji: "🐠" },
      { id: "p47", word: "Port", definition: "A maritime trade harbor equipped with cranes for loading cargo", category: "places", emoji: "🚢" },
      { id: "p48", word: "Monument", definition: "A statue or structure erected to commemorate a historic triumph", category: "places", emoji: "🗿" },
      { id: "p49", word: "Fjord", definition: "A long, deep, narrow sea inlet flanked by steep mountainous cliffs", category: "places", emoji: "⛴️" },
      { id: "p50", word: "Savanna", definition: "A grassy plain in tropical regions with scattered acacia trees and herds", category: "places", emoji: "🦒" },
    ],
  },
  classroom: {
    label: "Classroom & Study",
    icon: "🎓",
    words: [
      { id: "c1", word: "Microscope", definition: "An optical instrument that magnifies tiny microorganisms invisible to eyes", category: "classroom", emoji: "🔬" },
      { id: "c2", word: "Telescope", definition: "An optical tool that reveals the craters of the moon and cosmic stars", category: "classroom", emoji: "🔭" },
      { id: "c3", word: "Dictionary", definition: "A reference guide cataloging word pronunciations, meanings, and origins", category: "classroom", emoji: "📖" },
      { id: "c4", word: "Backpack", definition: "A sturdy pack slung over the shoulders to carry textbooks and pens to school", category: "classroom", emoji: "🎒" },
      { id: "c5", word: "Calculator", definition: "An electronic device used to crunch math equations and arithmetic with ease", category: "classroom", emoji: "🧮" },
      { id: "c6", word: "Compass", definition: "A navigational magnetized instrument pointing true magnetic north", category: "classroom", emoji: "🧭" },
      { id: "c7", word: "Notebook", definition: "A spiral-bound pad of ruled paper for jotting down teacher lectures", category: "classroom", emoji: "📓" },
      { id: "c8", word: "Protractor", definition: "A clear semi-circular ruler marked in degrees for measuring angles", category: "classroom", emoji: "📐" },
      { id: "c9", word: "Globe", definition: "A spherical model of planet Earth that spins on a tilted axis stand", category: "classroom", emoji: "🌐" },
      { id: "c10", word: "Highlighter", definition: "A fluorescent marker used to spotlight important vocabulary in passages", category: "classroom", emoji: "🖊️" },
      { id: "c11", word: "Headphones", definition: "Padded audio cups worn over ears for listening to pronunciation audio", category: "classroom", emoji: "🎧" },
      { id: "c12", word: "Whiteboard", definition: "A glossy magnetic board on which teachers explain lessons with dry markers", category: "classroom", emoji: "📋" },
      { id: "c13", word: "Flashcards", definition: "Study cards showing a prompt on front and answer on back for quick recall", category: "classroom", emoji: "🃏" },
      { id: "c14", word: "Curriculum", definition: "The complete academic road map of subjects and lessons taught across a school year", category: "classroom", emoji: "📜" },
      { id: "c15", word: "Grammar", definition: "The structural rules governing how words fit together to form coherent sentences", category: "classroom", emoji: "✍️" },
      { id: "c16", word: "Vocabulary", definition: "The treasure trove of words and expressions a student knows and utilizes", category: "classroom", emoji: "📚" },
      { id: "c17", word: "Synonym", definition: "A word that shares an identical or remarkably close meaning to another", category: "classroom", emoji: "🔗" },
      { id: "c18", word: "Antonym", definition: "A word that signifies the exact opposite meaning of another word", category: "classroom", emoji: "↔️" },
      { id: "c19", word: "Idiom", definition: "A figurative colorful expression whose meaning differs from literal words", category: "classroom", emoji: "💬" },
      { id: "c20", word: "Certificate", definition: "An official award recognizing exceptional achievement in studies", category: "classroom", emoji: "📜" },
      { id: "c21", word: "Diploma", definition: "An honored academic document awarded upon successfully graduating school", category: "classroom", emoji: "🎓" },
      { id: "c22", word: "Experiment", definition: "A methodical scientific trial performed to test a theory and see results", category: "classroom", emoji: "🧪" },
      { id: "c23", word: "Presentation", definition: "A classroom talk sharing slides, research, and insights with classmates", category: "classroom", emoji: "📽️" },
      { id: "c24", word: "Literature", definition: "Enduring works of poetry, plays, and novels of high artistic value", category: "classroom", emoji: "📑" },
      { id: "c25", word: "Dialogue", definition: "A conversational exchange between two or more characters in a story", category: "classroom", emoji: "🗣️" },
      { id: "c26", word: "Textbook", definition: "A comprehensive instructional book covering an academic discipline", category: "classroom", emoji: "📕" },
      { id: "c27", word: "Eraser", definition: "A handy rubber tool that rubs away pencil marks cleanly", category: "classroom", emoji: "🧹" },
      { id: "c28", word: "Scissors", definition: "A two-bladed cutting implement used for crafts, paper, and collages", category: "classroom", emoji: "✂️" },
      { id: "c29", word: "Stapler", definition: "A mechanical office tool that binds sheets of homework with wire staples", category: "classroom", emoji: "📎" },
      { id: "c30", word: "Ruler", definition: "A straight strip marked in inches and centimeters for measuring length", category: "classroom", emoji: "📏" },
      { id: "c31", word: "Pencil", definition: "A graphite writing instrument that can be sharpened and erased", category: "classroom", emoji: "✏️" },
      { id: "c32", word: "Marker", definition: "A felt-tip pen saturated with colorful ink for posters and drawings", category: "classroom", emoji: "🖍️" },
      { id: "c33", word: "Folder", definition: "A folding cardboard cover designed to keep school worksheets organized", category: "classroom", emoji: "📁" },
      { id: "c34", word: "Binder", definition: "A durable cover with metal snap rings to hold punched loose-leaf paper", category: "classroom", emoji: "🗂️" },
      { id: "c35", word: "Chalkboard", definition: "A classic dark slate surface where teachers wrote with white chalk sticks", category: "classroom", emoji: "⬛" },
      { id: "c36", word: "Assignment", definition: "A designated project or task assigned by a teacher to deepen understanding", category: "classroom", emoji: "📋" },
      { id: "c37", word: "Project", definition: "An extensive group or solo inquiry requiring hands-on research and design", category: "classroom", emoji: "💡" },
      { id: "c38", word: "Quiz", definition: "A brief informal assessment to test comprehension of recent lessons", category: "classroom", emoji: "❓" },
      { id: "c39", word: "Exam", definition: "A comprehensive formal test measuring knowledge across a whole semester", category: "classroom", emoji: "📝" },
      { id: "c40", word: "Schedule", definition: "A timetable showing when each classroom period and activity takes place", category: "classroom", emoji: "🗓️" },
      { id: "c41", word: "Bell", definition: "The chime that rings through the hallways signaling the start of class", category: "classroom", emoji: "🔔" },
      { id: "c42", word: "Locker", definition: "A personal metal cubicle with a combination lock to store coats and books", category: "classroom", emoji: "🔲" },
      { id: "c43", word: "Classroom", definition: "The dynamic room where students and teachers gather every school day", category: "classroom", emoji: "🏫" },
      { id: "c44", word: "Auditorium", definition: "A spacious tiered hall where entire schools assemble for performances", category: "classroom", emoji: "🏛️" },
      { id: "c45", word: "Gymnasium", definition: "A large indoor sports hall equipped for basketball, fitness, and games", category: "classroom", emoji: "🏀" },
      { id: "c46", word: "Cafeteria", definition: "A friendly dining hall where students enjoy lunch together", category: "classroom", emoji: "🍽️" },
      { id: "c47", word: "Desk", definition: "A student work table with a flat surface and chair for focused study", category: "classroom", emoji: "🪑" },
      { id: "c48", word: "Homework", definition: "Exercises completed at home to reinforce learning from the day's class", category: "classroom", emoji: "🏠" },
      { id: "c49", word: "Syllable", definition: "A single uninterrupted unit of spoken language forming whole words", category: "classroom", emoji: "🗣️" },
      { id: "c50", word: "Paragraph", definition: "A distinct section of writing dealing with one unified theme or idea", category: "classroom", emoji: "📄" },
    ],
  },
  science: {
    label: "Science & Space",
    icon: "🚀",
    words: [
      { id: "s1", word: "Atom", definition: "The fundamental microscopic building block of all chemical matter", category: "science", emoji: "⚛️" },
      { id: "s2", word: "Molecule", definition: "A group of atoms bonded tightly together representing a compound", category: "science", emoji: "🧪" },
      { id: "s3", word: "Gravity", definition: "The universal force of attraction that holds planets in celestial orbit", category: "science", emoji: "🍎" },
      { id: "s4", word: "Velocity", definition: "The speed of an object moving in a specified direction through space", category: "science", emoji: "⚡" },
      { id: "s5", word: "Magnet", definition: "A material that generates an invisible magnetic field attracting iron", category: "science", emoji: "🧲" },
      { id: "s6", word: "Electricity", definition: "A powerful form of energy resulting from the flow of charged electrons", category: "science", emoji: "💡" },
      { id: "s7", word: "Solar System", definition: "The gravitationally bound system of the Sun and objects orbiting it", category: "science", emoji: "☀️" },
      { id: "s8", word: "Orbit", definition: "The curved gravitational path of a satellite or planet around a star", category: "science", emoji: "🔄" },
      { id: "s9", word: "Galaxy", definition: "A gargantuan cosmic island of billions of stars, gas, and dark matter", category: "science", emoji: "🌌" },
      { id: "s10", word: "Nebula", definition: "An immense interstellar cloud of luminous dust and gas where stars are born", category: "science", emoji: "✨" },
      { id: "s11", word: "Asteroid", definition: "A rocky metallic body orbiting the sun primarily between Mars and Jupiter", category: "science", emoji: "🪨" },
      { id: "s12", word: "Comet", definition: "An icy small celestial body that releases a glowing tail when near the sun", category: "science", emoji: "☄️" },
      { id: "s13", word: "Prism", definition: "A transparent geometric crystal that splits white light into a rainbow", category: "science", emoji: "🌈" },
      { id: "s14", word: "Photosynthesis", definition: "The process by which green plants convert sunlight into nourishment and oxygen", category: "science", emoji: "🌱" },
      { id: "s15", word: "Ecosystem", definition: "A complex community of living organisms interacting with their physical habitat", category: "science", emoji: "🌿" },
      { id: "s16", word: "DNA", definition: "The double-helix molecule carrying genetic instructions for all living beings", category: "science", emoji: "🧬" },
      { id: "s17", word: "Cell", definition: "The basic structural, functional, and biological unit of all known organisms", category: "science", emoji: "🔬" },
      { id: "s18", word: "Organism", definition: "An individual animal, plant, or single-celled life form", category: "science", emoji: "🧫" },
      { id: "s19", word: "Atmosphere", definition: "The protective envelope of gases surrounding Earth that makes life possible", category: "science", emoji: "☁️" },
      { id: "s20", word: "Evaporation", definition: "The phase change where liquid water heats up and turns into airborne vapor", category: "science", emoji: "💨" },
      { id: "s21", word: "Precipitation", definition: "Rain, snow, sleet, or hail that falls from clouds onto Earth's surface", category: "science", emoji: "🌧️" },
      { id: "s22", word: "Fossil", definition: "The preserved mineralized remains or impression of prehistoric organisms", category: "science", emoji: "🦴" },
      { id: "s23", word: "Mineral", definition: "A naturally occurring inorganic solid with a definite crystalline structure", category: "science", emoji: "💎" },
      { id: "s24", word: "Element", definition: "A pure substance consisting entirely of one type of atom on the periodic table", category: "science", emoji: "🧪" },
      { id: "s25", word: "Reaction", definition: "A process that leads to the chemical transformation of one set of substances", category: "science", emoji: "💥" },
      { id: "s26", word: "Hypothesis", definition: "An educated proposed explanation made on limited evidence as a starting point", category: "science", emoji: "💭" },
      { id: "s27", word: "Satellite", definition: "An artificial electronic machine orbiting Earth transmitting GPS and data", category: "science", emoji: "🛰️" },
      { id: "s28", word: "Rocket", definition: "A spacecraft propelled by burning exhaust fuel capable of escaping gravity", category: "science", emoji: "🚀" },
      { id: "s29", word: "Laser", definition: "A concentrated, coherent beam of light amplified by stimulated emission", category: "science", emoji: "🔴" },
      { id: "s30", word: "Spectrum", definition: "The complete band of electromagnetic colors or frequencies", category: "science", emoji: "📊" },
      { id: "s31", word: "Renewable", definition: "Energy sourced from inexhaustible resources like sunlight, wind, and tides", category: "science", emoji: "☀️" },
      { id: "s32", word: "Turbine", definition: "A rotary mechanical device that extracts energy from flowing wind or steam", category: "science", emoji: "💨" },
      { id: "s33", word: "Earthquake", definition: "A sudden violent shaking of the ground resulting from tectonic fault slips", category: "science", emoji: "📉" },
      { id: "s34", word: "Eclipse", definition: "An astronomical event where one celestial body passes into the shadow of another", category: "science", emoji: "🌑" },
      { id: "s35", word: "Black Hole", definition: "A cosmic region of space with gravity so intense that not even light can escape", category: "science", emoji: "🕳️" },
      { id: "s36", word: "Supernova", definition: "A colossal, blinding explosion marking the final stage of a massive star", category: "science", emoji: "🌟" },
      { id: "s37", word: "Robot", definition: "An intelligent programmable machine capable of carrying out complex tasks", category: "science", emoji: "🤖" },
      { id: "s38", word: "Microchip", definition: "A miniature silicon wafer housing millions of microscopic electronic transistors", category: "science", emoji: "💾" },
      { id: "s39", word: "Algorithm", definition: "A step-by-step set of computational rules executed to solve complex problems", category: "science", emoji: "💻" },
      { id: "s40", word: "Sensor", definition: "A electronic detection device that responds to physical inputs like light or heat", category: "science", emoji: "📡" },
      { id: "s41", word: "Battery", definition: "A portable container of electrochemical cells storing energy for portable use", category: "science", emoji: "🔋" },
      { id: "s42", word: "Conductor", definition: "A material like copper that readily permits the smooth flow of electric current", category: "science", emoji: "🔌" },
      { id: "s43", word: "Insulator", definition: "A material like rubber that prevents or blocks the easy flow of electric charge", category: "science", emoji: "🧱" },
      { id: "s44", word: "Refraction", definition: "The bending of a wave of light as it passes from air into water or glass", category: "science", emoji: "👓" },
      { id: "s45", word: "Density", definition: "The degree of compactness of a substance measured by mass per unit volume", category: "science", emoji: "🧊" },
      { id: "s46", word: "Friction", definition: "The resistive force that opposes the sliding motion of two touching surfaces", category: "science", emoji: "🛹" },
      { id: "s47", word: "Altitude", definition: "The vertical elevation of an object above sea level or the planet's ground", category: "science", emoji: "✈️" },
      { id: "s48", word: "Thermometer", definition: "An instrument calibrated to measure temperature changes precisely", category: "science", emoji: "🌡️" },
      { id: "s49", word: "Barometer", definition: "A scientific tool measuring atmospheric pressure to forecast upcoming weather", category: "science", emoji: "⏱️" },
      { id: "s50", word: "Microbe", definition: "A microscopic single-celled organism such as bacteria, virus, or protozoa", category: "science", emoji: "🦠" },
    ],
  },
};

// --- AUDIO SYNTHESIZER ---

class BingoAudioSynthesizer {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public playTick(pitch: number = 600) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(pitch, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  public playPop() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  public playUnmark() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  public playDraw() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [329.63, 440, 554.37, 659.25].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.25);
      });
    } catch (e) {}
  }

  public playWarning() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(190, now + 0.1);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  public playFanfare() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const chords = [
        { freqs: [261.63, 329.63, 392.0], start: 0, dur: 0.2 },
        { freqs: [329.63, 392.0, 523.25], start: 0.22, dur: 0.2 },
        { freqs: [392.0, 523.25, 659.25], start: 0.44, dur: 0.25 },
        { freqs: [523.25, 659.25, 783.99, 1046.5], start: 0.72, dur: 0.8 },
      ];
      chords.forEach((chord) => {
        chord.freqs.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + chord.start);
          gain.gain.setValueAtTime(0, now + chord.start);
          gain.gain.linearRampToValueAtTime(0.2, now + chord.start + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.005, now + chord.start + chord.dur);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + chord.start);
          osc.stop(now + chord.start + chord.dur);
        });
      });
    } catch (e) {}
  }
}

const audioSynth = new BingoAudioSynthesizer();

const shuffle = <T,>(arr: T[]): T[] => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// --- COMPONENT IMPLEMENTATION ---

export function Bingo2({
  slug = "bingo-2",
  onToggleFullscreen,
}: {
  slug?: string;
  onToggleFullscreen?: () => void;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const game = getGameBySlug(slug) || {
    title: "Bingo 2",
    description: "Vocabulary Bingo for interactive classrooms",
  };

  // Fullscreen detection
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  React.useEffect(() => {
    const handler = () => {
      setIsFullscreen(
        !!(document.fullscreenElement || (document as any).webkitFullscreenElement)
      );
    };
    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, []);

  // View & UI State
  const [viewMode, setViewMode] = React.useState<GameViewMode>("split");
  const [gridSize, setGridSize] = React.useState<GridSize>(5);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("animals");
  const [isMuted, setIsMuted] = React.useState<boolean>(false);
  const [allowFreePlay, setAllowFreePlay] = React.useState<boolean>(false);

  // Speed of Mystery Word Drawing
  const [drawSpeed, setDrawSpeed] = React.useState<DrawSpeed>("slow"); // default to slower suspense speed requested!

  // Teacher Draw State
  const [drawnWords, setDrawnWords] = React.useState<VocabItem[]>([]);
  const [currentMysteryWord, setCurrentMysteryWord] = React.useState<VocabItem | null>(null);
  const [isDrawingAnimation, setIsDrawingAnimation] = React.useState<boolean>(false);
  const [isAutoDrawActive, setIsAutoDrawActive] = React.useState<boolean>(false);
  const [autoDrawSeconds, setAutoDrawSeconds] = React.useState<number>(10);
  const [autoDrawCountdown, setAutoDrawCountdown] = React.useState<number>(10);

  // Student Card State
  const [studentCard, setStudentCard] = React.useState<BingoCell[][]>([]);
  const [winningLines, setWinningLines] = React.useState<WinningLine[]>([]);
  const [showWinCelebration, setShowWinCelebration] = React.useState<boolean>(false);
  const [celebrationDetails, setCelebrationDetails] = React.useState<{
    lineLabel: string;
    drawCount: number;
    xpEarned: number;
    coinsEarned: number;
  } | null>(null);

  // Print Cards Modal & Generation State
  const [isPrintModalOpen, setIsPrintModalOpen] = React.useState<boolean>(false);
  const [studentCountInput, setStudentCountInput] = React.useState<number>(30); // 1 to 50 max
  const [cardsPerPage, setCardsPerPage] = React.useState<1 | 2>(2);
  const [includeCallSheet, setIncludeCallSheet] = React.useState<boolean>(true);
  const [printData, setPrintData] = React.useState<PrintCardData | null>(null);
  const [isPrinting, setIsPrinting] = React.useState<boolean>(false);

  // Classroom Live Room Code & Multiplayer Broadcast Channel
  const [roomCode, setRoomCode] = React.useState<string>(
    () => "BINGO-" + Math.floor(1000 + Math.random() * 9000)
  );
  const channelRef = React.useRef<BroadcastChannel | null>(null);

  // Persistence & Dialog States
  const [showEndGameConfirm, setShowEndGameConfirm] = React.useState<boolean>(false);
  const [showExitGameConfirm, setShowExitGameConfirm] = React.useState<boolean>(false);
  const [pendingOptionChange, setPendingOptionChange] = React.useState<{
    type: "category" | "grid";
    value: string | GridSize;
  } | null>(null);
  const [lastSavedTime, setLastSavedTime] = React.useState<number | null>(null);

  const isSessionInitializedRef = React.useRef<boolean>(false);
  const isRestoringRef = React.useRef<boolean>(false);

  // Sync Audio Synth Mute State
  React.useEffect(() => {
    audioSynth.isMuted = isMuted;
  }, [isMuted]);

  // Clean print state on afterprint
  React.useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrinting(false);
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  // --- BROADCAST CHANNEL MULTIPLAYER ENGINE ---
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const channel = new BroadcastChannel("lingoland_bingo_universe");
      channelRef.current = channel;

      channel.onmessage = (event: MessageEvent<BingoEvent>) => {
        const msg = event.data;
        if (!msg) return;

        if (msg.type === "WORD_DRAWN") {
          setCurrentMysteryWord(msg.word);
          setDrawnWords((prev) => {
            if (prev.some((w) => w.word.toLowerCase() === msg.word.word.toLowerCase())) return prev;
            return [msg.word, ...prev];
          });
          audioSynth.playDraw();
          toast({
            title: `Mystery Word Drawn! 📢`,
            description: `${msg.word.emoji} ${msg.word.word} was called!`,
            className: "bg-indigo-950 text-indigo-100 border-indigo-700",
          });
        } else if (msg.type === "GAME_RESET") {
          setDrawnWords([]);
          setCurrentMysteryWord(null);
          toast({
            title: "Game Reset 🔄",
            description: "The teacher has started a new round!",
          });
        } else if (msg.type === "STUDENT_BINGO") {
          toast({
            title: "🎉 BINGO CLAIMED!",
            description: `${msg.studentName} scored BINGO with ${msg.lineLabel}!`,
            className: "bg-amber-950 text-amber-100 border-amber-600 font-bold",
          });
        }
      };
    } catch (err) {
      console.warn("BroadcastChannel fallback to local:", err);
    }

    return () => {
      channelRef.current?.close();
    };
  }, [toast]);

  const broadcast = React.useCallback((event: BingoEvent) => {
    try {
      channelRef.current?.postMessage(event);
    } catch (e) {}
  }, []);

  // --- GENERATE STUDENT CARD ---
  const generateStudentBoard = React.useCallback(
    (size: GridSize, categoryKey: string) => {
      const pool = VOCAB_CATEGORIES[categoryKey]?.words || VOCAB_CATEGORIES.animals.words;
      const shuffled = shuffle(pool);
      const cellCount = size * size;
      const centerIndex = Math.floor(cellCount / 2);

      const cells: BingoCell[][] = [];
      let poolIndex = 0;

      for (let r = 0; r < size; r++) {
        const row: BingoCell[] = [];
        for (let c = 0; c < size; c++) {
          const flatIndex = r * size + c;
          if (size === 5 && flatIndex === centerIndex) {
            row.push({
              row: r,
              col: c,
              word: "FREE",
              emoji: "⭐",
              isFree: true,
              marked: true,
            });
          } else {
            const item = shuffled[poolIndex % shuffled.length];
            poolIndex++;
            row.push({
              row: r,
              col: c,
              word: item.word,
              emoji: item.emoji,
              isFree: false,
              marked: false,
            });
          }
        }
        cells.push(row);
      }

      setStudentCard(cells);
      setWinningLines([]);
      setShowWinCelebration(false);
    },
    []
  );

  // --- PERSISTENCE: RESTORE SESSION ON MOUNT ---
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(BINGO2_STORAGE_KEY);
      if (raw) {
        const saved: Bingo2SavedSession = JSON.parse(raw);
        if (saved && Array.isArray(saved.studentCard) && saved.studentCard.length > 0) {
          isRestoringRef.current = true;
          if (saved.roomCode) setRoomCode(saved.roomCode);
          if (saved.gridSize) setGridSize(saved.gridSize);
          if (saved.selectedCategory && VOCAB_CATEGORIES[saved.selectedCategory]) {
            setSelectedCategory(saved.selectedCategory);
          }
          if (saved.viewMode) setViewMode(saved.viewMode);
          if (saved.drawSpeed) setDrawSpeed(saved.drawSpeed);
          if (typeof saved.isMuted === "boolean") setIsMuted(saved.isMuted);
          if (typeof saved.allowFreePlay === "boolean") setAllowFreePlay(saved.allowFreePlay);
          if (Array.isArray(saved.drawnWords)) setDrawnWords(saved.drawnWords);
          if (saved.currentMysteryWord !== undefined) setCurrentMysteryWord(saved.currentMysteryWord);
          setStudentCard(saved.studentCard);
          if (Array.isArray(saved.winningLines)) setWinningLines(saved.winningLines);
          if (saved.celebrationDetails !== undefined) setCelebrationDetails(saved.celebrationDetails);
          if (typeof saved.showWinCelebration === "boolean") setShowWinCelebration(saved.showWinCelebration);
          if (saved.studentCountInput) setStudentCountInput(saved.studentCountInput);
          if (saved.cardsPerPage) setCardsPerPage(saved.cardsPerPage);
          if (typeof saved.includeCallSheet === "boolean") setIncludeCallSheet(saved.includeCallSheet);

          if (saved.printData) {
            setPrintData({
              ...saved.printData,
              winnerIndices: new Set(saved.printData.winnerIndices || []),
            });
          }

          setLastSavedTime(saved.lastUpdated || Date.now());
          isSessionInitializedRef.current = true;
          setTimeout(() => {
            isRestoringRef.current = false;
          }, 60);

          toast({
            title: "Game Restored 💾",
            description: `Resumed your active Bingo round (${saved.drawnWords?.length || 0} words called).`,
            className: "bg-slate-900 text-slate-100 border-indigo-500/50",
          });
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to load saved Bingo 2 session:", e);
    }

    // If no existing session found, initialize fresh board
    generateStudentBoard(gridSize, selectedCategory);
    isSessionInitializedRef.current = true;
  }, [generateStudentBoard]);

  // --- PERSISTENCE: AUTO-SAVE ON EVERY STATE CHANGE ---
  React.useEffect(() => {
    if (!isSessionInitializedRef.current || isRestoringRef.current) return;
    if (typeof window === "undefined") return;
    if (!studentCard || studentCard.length === 0) return;

    try {
      const session: Bingo2SavedSession = {
        version: 1,
        roomCode,
        gridSize,
        selectedCategory,
        viewMode,
        drawSpeed,
        isMuted,
        allowFreePlay,
        drawnWords,
        currentMysteryWord,
        studentCard,
        winningLines,
        celebrationDetails,
        showWinCelebration,
        printData: printData
          ? {
              ...printData,
              winnerIndices: Array.from(printData.winnerIndices),
            }
          : null,
        studentCountInput,
        cardsPerPage,
        includeCallSheet,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(BINGO2_STORAGE_KEY, JSON.stringify(session));
      setLastSavedTime(Date.now());
    } catch (err) {
      console.warn("Auto-save Bingo session error:", err);
    }
  }, [
    roomCode,
    gridSize,
    selectedCategory,
    viewMode,
    drawSpeed,
    isMuted,
    allowFreePlay,
    drawnWords,
    currentMysteryWord,
    studentCard,
    winningLines,
    celebrationDetails,
    showWinCelebration,
    printData,
    studentCountInput,
    cardsPerPage,
    includeCallSheet,
  ]);

  // --- WIN CONDITION CHECKER ---
  const checkForBingo = React.useCallback(
    (card: BingoCell[][], size: GridSize): WinningLine[] => {
      const detectedLines: WinningLine[] = [];

      // Check Rows
      for (let r = 0; r < size; r++) {
        if (card[r].every((cell) => cell.marked)) {
          detectedLines.push({ type: "row", index: r, label: `Row ${r + 1}` });
        }
      }

      // Check Columns
      for (let c = 0; c < size; c++) {
        let colComplete = true;
        for (let r = 0; r < size; r++) {
          if (!card[r][c].marked) {
            colComplete = false;
            break;
          }
        }
        if (colComplete) {
          detectedLines.push({ type: "col", index: c, label: `Column ${c + 1}` });
        }
      }

      // Check Main Diagonal
      let diagMain = true;
      for (let i = 0; i < size; i++) {
        if (!card[i][i].marked) {
          diagMain = false;
          break;
        }
      }
      if (diagMain) detectedLines.push({ type: "diagonal-main", label: "Diagonal (Top-Left ↘)" });

      // Check Anti Diagonal
      let diagAnti = true;
      for (let i = 0; i < size; i++) {
        if (!card[i][size - 1 - i].marked) {
          diagAnti = false;
          break;
        }
      }
      if (diagAnti) detectedLines.push({ type: "diagonal-anti", label: "Diagonal (Top-Right ↙)" });

      return detectedLines;
    },
    []
  );

  const markWinningCells = React.useCallback(
    (card: BingoCell[][], lines: WinningLine[], size: GridSize): BingoCell[][] => {
      const next = card.map((row) => row.map((cell) => ({ ...cell, isWinningCell: false })));
      lines.forEach((line) => {
        if (line.type === "row" && line.index !== undefined) {
          for (let c = 0; c < size; c++) next[line.index][c].isWinningCell = true;
        } else if (line.type === "col" && line.index !== undefined) {
          for (let r = 0; r < size; r++) next[r][line.index].isWinningCell = true;
        } else if (line.type === "diagonal-main") {
          for (let i = 0; i < size; i++) next[i][i].isWinningCell = true;
        } else if (line.type === "diagonal-anti") {
          for (let i = 0; i < size; i++) next[i][size - 1 - i].isWinningCell = true;
        }
      });
      return next;
    },
    []
  );

  const triggerWinCelebration = React.useCallback(
    (lines: WinningLine[]) => {
      audioSynth.playFanfare();
      try {
        confetti({
          particleCount: 130,
          spread: 85,
          origin: { y: 0.6 },
          colors: ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#38bdf8"],
        });
      } catch (e) {}

      const primaryLine = lines[0]?.label || "Complete Line";
      const xp = 50;
      const coins = 15;

      setCelebrationDetails({
        lineLabel: primaryLine,
        drawCount: drawnWords.length,
        xpEarned: xp,
        coinsEarned: coins,
      });
      setShowWinCelebration(true);

      broadcast({
        type: "STUDENT_BINGO",
        studentName: user?.displayName || "Player 1",
        lineLabel: primaryLine,
        timestamp: Date.now(),
      });

      if (firestore) {
        logAnalyticsEvent(firestore, user?.uid || "guest", {
          type: "game_played",
          details: {
            slug: "bingo-2",
            title: "Bingo 2 (Vocabulary Bingo)",
            lineLabel: primaryLine,
            draws: drawnWords.length,
          },
        });

        if (user) {
          try {
            const petRef = doc(firestore, "user_pets", user.uid);
            getDoc(petRef).then((snap) => {
              if (snap.exists()) {
                updateDoc(petRef, {
                  xp: increment(xp),
                  coins: increment(coins),
                }).catch(() => {});
              }
            });
          } catch (e) {}
        }
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("lingoland_game_completed_hijack", {
            detail: { state: "finished" },
          })
        );
      }
    },
    [drawnWords.length, user, firestore, broadcast]
  );

  // Student Cell Click Handler
  const handleCellClick = (r: number, c: number) => {
    const target = studentCard[r]?.[c];
    if (!target || target.isFree) return;

    if (target.marked) {
      audioSynth.playUnmark();
      const updated = studentCard.map((row, ri) =>
        row.map((cell, ci) => (ri === r && ci === c ? { ...cell, marked: false } : cell))
      );
      setStudentCard(updated);
      const lines = checkForBingo(updated, gridSize);
      setWinningLines(lines);
      return;
    }

    const isWordDrawn = drawnWords.some(
      (w) => w.word.toLowerCase() === target.word.toLowerCase()
    );

    if (!isWordDrawn && !allowFreePlay) {
      audioSynth.playWarning();
      toast({
        title: "Not Called Yet! 👂",
        description: `"${target.word}" hasn't been drawn by the teacher yet. Listen closely!`,
        variant: "destructive",
      });
      return;
    }

    audioSynth.playPop();
    const updated = studentCard.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? { ...cell, marked: true } : cell))
    );

    const newLines = checkForBingo(updated, gridSize);
    const highlightedCard = markWinningCells(updated, newLines, gridSize);
    setStudentCard(highlightedCard);
    setWinningLines(newLines);

    if (newLines.length > 0 && winningLines.length === 0) {
      triggerWinCelebration(newLines);
    }
  };

  // --- TEACHER ACTIONS: DRAW MYSTERY WORD (WITH SLOWER SUSPENSE OPTION) ---
  const drawMysteryWord = React.useCallback(() => {
    const pool = VOCAB_CATEGORIES[selectedCategory]?.words || VOCAB_CATEGORIES.animals.words;
    const drawnIds = new Set(drawnWords.map((w) => w.id));
    const available = pool.filter((w) => !drawnIds.has(w.id));

    if (available.length === 0) {
      audioSynth.playWarning();
      toast({
        title: "All Words Drawn! 🏆",
        description: `All ${pool.length} words in this vocabulary category have been called. Reset to play another round!`,
      });
      setIsAutoDrawActive(false);
      return;
    }

    setIsDrawingAnimation(true);

    // Speed configuration:
    // "fast": 8 iterations at 75ms (~600ms)
    // "normal": 16 iterations at 100ms (~1.6s)
    // "slow": 24 iterations with progressive deceleration from 80ms to 280ms (~3.2s suspense roll)
    let totalTicks = drawSpeed === "fast" ? 8 : drawSpeed === "normal" ? 16 : 24;
    let currentTick = 0;

    const executeTick = () => {
      currentTick++;
      const randomTempWord = available[Math.floor(Math.random() * available.length)];
      setCurrentMysteryWord(randomTempWord);

      // Play suspense tick audio
      const pitch = 450 + (currentTick / totalTicks) * 350;
      audioSynth.playTick(pitch);

      if (currentTick >= totalTicks) {
        // Final Word Settled!
        const finalWord = available[Math.floor(Math.random() * available.length)];
        setCurrentMysteryWord(finalWord);
        setDrawnWords((prev) => [finalWord, ...prev]);
        setIsDrawingAnimation(false);
        audioSynth.playDraw();

        // Speak aloud using Web Speech API
        if (!isMuted && typeof window !== "undefined" && "speechSynthesis" in window) {
          try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(finalWord.word);
            utterance.rate = 0.9;
            utterance.pitch = 1.05;
            window.speechSynthesis.speak(utterance);
          } catch (e) {}
        }

        broadcast({
          type: "WORD_DRAWN",
          word: finalWord,
          remainingCount: available.length - 1,
          timestamp: Date.now(),
        });
      } else {
        // Calculate delay for next tick (progressive slowdown in "slow" mode)
        let delay = 90;
        if (drawSpeed === "fast") delay = 75;
        else if (drawSpeed === "normal") delay = 100;
        else {
          // Slow Suspense deceleration curve
          const progress = currentTick / totalTicks;
          delay = Math.floor(70 + Math.pow(progress, 1.8) * 220);
        }
        setTimeout(executeTick, delay);
      }
    };

    executeTick();
  }, [selectedCategory, drawnWords, drawSpeed, isMuted, broadcast, toast]);

  // Auto-Draw Countdown Handler
  React.useEffect(() => {
    if (!isAutoDrawActive) return;

    setAutoDrawCountdown(autoDrawSeconds);
    const timer = setInterval(() => {
      setAutoDrawCountdown((prev) => {
        if (prev <= 1) {
          drawMysteryWord();
          return autoDrawSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoDrawActive, autoDrawSeconds, drawMysteryWord]);

  // Check if a game is actively in progress (words drawn or marks placed by student)
  const isGameInProgress =
    drawnWords.length > 0 ||
    studentCard.reduce((acc, row) => acc + row.filter((c) => c.marked && !c.isFree).length, 0) > 0;

  // Explicitly End Game and start a new game round & fresh print sets
  const handleEndGameAndStartNew = (newGrid?: GridSize, newCat?: string) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(BINGO2_STORAGE_KEY);
      } catch (e) {}
    }

    const targetGrid = newGrid ?? gridSize;
    const targetCat = newCat ?? selectedCategory;

    setDrawnWords([]);
    setCurrentMysteryWord(null);
    setIsAutoDrawActive(false);
    setWinningLines([]);
    setShowWinCelebration(false);
    setCelebrationDetails(null);
    setPrintData(null); // Clear print set so fresh print sets can be made for new game
    if (newGrid) setGridSize(newGrid);
    if (newCat) setSelectedCategory(newCat);

    generateStudentBoard(targetGrid, targetCat);
    audioSynth.playPop();

    broadcast({
      type: "GAME_RESET",
      category: targetCat,
      gridSize: targetGrid,
      timestamp: Date.now(),
    });

    setShowEndGameConfirm(false);
    setPendingOptionChange(null);

    toast({
      title: "New Game Started! 🎲",
      description: "Previous session & print sets ended. Fresh vocabulary board ready.",
      className: "bg-slate-900 text-slate-100 border-indigo-500/50",
    });
  };

  // Exit Game back to games lobby
  const handleExitGame = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(BINGO2_STORAGE_KEY);
      } catch (e) {}
    }
    setShowExitGameConfirm(false);
    toast({
      title: "Exited Bingo 2",
      description: "Session cleared. Returning to Games...",
    });
    router.push("/games");
  };

  const handleCategorySelect = (newCat: string) => {
    if (newCat === selectedCategory) return;
    if (isGameInProgress) {
      setPendingOptionChange({ type: "category", value: newCat });
      setShowEndGameConfirm(true);
    } else {
      setSelectedCategory(newCat);
      setDrawnWords([]);
      setCurrentMysteryWord(null);
      setPrintData(null);
      generateStudentBoard(gridSize, newCat);
    }
  };

  const handleGridSizeSelect = (newSize: GridSize) => {
    if (newSize === gridSize) return;
    if (isGameInProgress) {
      setPendingOptionChange({ type: "grid", value: newSize });
      setShowEndGameConfirm(true);
    } else {
      setGridSize(newSize);
      setPrintData(null);
      generateStudentBoard(newSize, selectedCategory);
    }
  };

  const resetGame = () => handleEndGameAndStartNew();

  const speakCurrentWord = () => {
    if (!currentMysteryWord || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `${currentMysteryWord.word}. ${currentMysteryWord.definition}`
      );
      utterance.rate = 0.88;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  // --- PRINTABLE CARDS GENERATION ALGORITHM (UP TO 50 STUDENTS, 1-3 GUARANTEED WINNERS) ---
  const handleGenerateAndPrint = () => {
    const pool = VOCAB_CATEGORIES[selectedCategory]?.words || VOCAB_CATEGORIES.animals.words;
    const count = Math.min(Math.max(1, studentCountInput || 25), 50);

    // 1. Pick 1 to 3 random distinct winner card indices
    // (e.g. if 30 students, choose 2 random winners: Card #7 and Card #22)
    const numWinners = count >= 6 ? Math.floor(Math.random() * 3) + 1 : 1; // 1, 2, or 3 cards
    const allIndices = Array.from({ length: count }, (_, i) => i);
    const shuffledIndices = shuffle(allIndices);
    const winnerIndices = new Set(shuffledIndices.slice(0, numWinners));

    // 2. Select target primary winning words from the pool
    // In 5x5, a winning line requires 5 words (or 4 + Free center)
    // In 3x3, a winning line requires 3 words
    const targetLineWordCount = gridSize === 5 ? 5 : 3;
    const shuffledPool = shuffle(pool);
    const targetWinningWords = shuffledPool.slice(0, targetLineWordCount);
    const remainingPoolWords = shuffledPool.slice(targetLineWordCount);

    // 3. Generate each student's card
    const generatedCards = [];
    const centerIndex = Math.floor((gridSize * gridSize) / 2);

    for (let cardIdx = 0; cardIdx < count; cardIdx++) {
      const isWinner = winnerIndices.has(cardIdx);
      const cells: { word: string; emoji?: string; isFree?: boolean }[][] = [];

      if (isWinner) {
        // For winning cards: Place target winning words along a designated line (e.g. Row 0, or Row 1, or Diagonal)
        const winningRowIndex = cardIdx % gridSize;
        const otherCardWords = shuffle(remainingPoolWords);
        let otherWordIdx = 0;
        let winWordIdx = 0;

        for (let r = 0; r < gridSize; r++) {
          const row = [];
          for (let c = 0; c < gridSize; c++) {
            const flatIndex = r * gridSize + c;
            if (gridSize === 5 && flatIndex === centerIndex) {
              row.push({ word: "FREE", emoji: "⭐", isFree: true });
            } else if (r === winningRowIndex) {
              // Guaranteed winning word in this line!
              const winItem = targetWinningWords[winWordIdx % targetWinningWords.length];
              winWordIdx++;
              row.push({ word: winItem.word, emoji: winItem.emoji });
            } else {
              const item = otherCardWords[otherWordIdx % otherCardWords.length];
              otherWordIdx++;
              row.push({ word: item.word, emoji: item.emoji });
            }
          }
          cells.push(row);
        }
      } else {
        // For non-winning cards: Fill words while deliberately breaking any single winning line
        const randomWords = shuffle(pool);
        let wordIdx = 0;

        for (let r = 0; r < gridSize; r++) {
          const row = [];
          for (let c = 0; c < gridSize; c++) {
            const flatIndex = r * gridSize + c;
            if (gridSize === 5 && flatIndex === centerIndex) {
              row.push({ word: "FREE", emoji: "⭐", isFree: true });
            } else {
              const item = randomWords[wordIdx % randomWords.length];
              wordIdx++;
              row.push({ word: item.word, emoji: item.emoji });
            }
          }
          cells.push(row);
        }
      }

      generatedCards.push({
        cardIndex: cardIdx + 1,
        isWinner,
        cells,
      });
    }

    const data: PrintCardData = {
      categoryTitle: VOCAB_CATEGORIES[selectedCategory]?.label || "Vocabulary",
      gridSize,
      studentCount: count,
      winnerIndices,
      targetWinningWords,
      allWords: pool,
      cards: generatedCards,
      cardsPerPage,
      includeKey: includeCallSheet,
    };

    flushSync(() => {
      setPrintData(data);
      setIsPrinting(true);
      setIsPrintModalOpen(false);
    });

    toast({
      title: "Print Ready! 🖨️",
      description: `Generated ${count} student cards with ${numWinners} secret winning card(s).`,
    });

    setTimeout(() => {
      window.print();
    }, 250);
  };

  const markedCellsCount = studentCard.reduce(
    (acc, row) => acc + row.filter((c) => c.marked).length,
    0
  );
  const totalCells = gridSize * gridSize;

  return (
    <div
      className={cn(
        "relative w-full flex-1 flex flex-col justify-between bg-gradient-to-br from-slate-950 via-indigo-950/60 to-slate-900 text-slate-100 p-2 sm:p-3 md:p-4 select-none transition-all duration-300",
        isFullscreen
          ? "h-[100dvh] min-h-[100dvh] max-h-[100dvh]"
          : "min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)]"
      )}
    >
      {/* --- TOP HUD & CONTROLS HEADER --- */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-xl border border-indigo-500/20 p-3 sm:p-4 rounded-2xl shadow-xl mb-3 shrink-0">
        {/* Brand & Room Info */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  Bingo 2
                </h1>
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px] font-bold uppercase">
                  Classroom Edition
                </Badge>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Interactive Vocabulary Bingo • Room <span className="text-indigo-400 font-mono font-bold">{roomCode}</span>
              </p>
            </div>
          </div>

          {/* Quick Print, End & Exit buttons for Mobile */}
          <div className="flex items-center gap-1.5 md:hidden">
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-slate-800 text-xs text-slate-300 px-2"
              onClick={() => setIsPrintModalOpen(true)}
              title="Print Cards"
            >
              <Printer className="h-3.5 w-3.5 mr-1 text-indigo-400" />
              Print
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-amber-500/40 text-xs text-amber-300 px-2 hover:bg-amber-950/40"
              onClick={() => {
                setPendingOptionChange(null);
                setShowEndGameConfirm(true);
              }}
              title="End Game"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1 text-amber-400" />
              End
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
              onClick={() => setShowExitGameConfirm(true)}
              title="Exit Game"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-slate-400 hover:text-white"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
            </Button>
          </div>
        </div>

        {/* View Mode Segmented Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode("teacher")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              viewMode === "teacher"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Teacher Caller</span>
          </button>

          <button
            onClick={() => setViewMode("split")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              viewMode === "split"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Split className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Classroom Split</span>
            <span className="sm:hidden">Dual</span>
          </button>

          <button
            onClick={() => setViewMode("student")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              viewMode === "student"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Student Card</span>
          </button>
        </div>

        {/* Action Tool Buttons */}
        <div className="hidden md:flex items-center gap-2">
          {/* Auto-Saved Status Pill */}
          <div
            title="All game progress, called words, and print cards are automatically saved. It only resets when you press End Game or Exit Game."
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold select-none cursor-default shadow-sm"
          >
            <Save className="h-3 w-3 animate-pulse" />
            <span>Auto-Saved</span>
          </div>

          {/* Print Cards Generator Button */}
          <Button
            size="sm"
            onClick={() => setIsPrintModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            {printData ? "Print Cards (Active Set)" : "Print Student Cards (1-50)"}
          </Button>

          {/* End Game Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setPendingOptionChange(null);
              setShowEndGameConfirm(true);
            }}
            className="border-amber-500/40 hover:bg-amber-950/40 text-xs font-bold text-amber-300"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1 text-amber-400" />
            End Game
          </Button>

          {/* Exit Game Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowExitGameConfirm(true)}
            className="border-rose-500/30 hover:bg-rose-950/40 text-xs font-bold text-rose-300"
          >
            <LogOut className="h-3.5 w-3.5 mr-1 text-rose-400" />
            Exit Game
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 border-slate-800 hover:bg-slate-800 text-slate-300"
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
          </Button>

          {onToggleFullscreen && (
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 border-slate-800 hover:bg-slate-800 text-slate-300"
              onClick={onToggleFullscreen}
              title="Fullscreen Mode"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* --- MAIN INTERACTION STAGE --- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 w-full items-stretch min-h-0">
        {/* ========================================================= */}
        {/* TEACHER MODE PANEL                                        */}
        {/* ========================================================= */}
        {(viewMode === "teacher" || viewMode === "split") && (
          <div
            className={cn(
              "flex flex-col gap-3 h-full min-h-0",
              viewMode === "teacher" ? "lg:col-span-12 max-w-4xl mx-auto w-full" : "lg:col-span-5 w-full"
            )}
          >
            {/* Mystery Word Chamber */}
            <Card className="bg-slate-900/90 border-indigo-500/30 overflow-hidden shadow-2xl relative flex flex-col shrink-0">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-amber-500" />
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between shrink-0">
                <div>
                  <CardTitle className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Radio className="h-4 w-4 text-indigo-400 animate-pulse" />
                    Mystery Word Chamber
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-400">
                    Draw random words from the vocabulary pool for students
                  </CardDescription>
                </div>

                <Badge variant="outline" className="bg-slate-950 border-slate-800 text-[11px] text-slate-300">
                  {drawnWords.length} / {VOCAB_CATEGORIES[selectedCategory]?.words.length || 50} Called
                </Badge>
              </CardHeader>

              <CardContent className="px-4 pb-4 flex flex-col items-center justify-center text-center">
                {/* Word Display Box with Suspense Glow */}
                <div
                  className={cn(
                    "w-full min-h-[140px] sm:min-h-[160px] md:min-h-[180px] rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border p-4 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300",
                    isDrawingAnimation
                      ? "border-pink-500/80 shadow-[0_0_30px_rgba(236,72,153,0.3)]"
                      : "border-slate-800/80"
                  )}
                >
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

                  {currentMysteryWord ? (
                    <motion.div
                      key={currentMysteryWord.id + (isDrawingAnimation ? "-anim" : "")}
                      initial={{ scale: isDrawingAnimation ? 0.92 : 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="flex flex-col items-center gap-1.5 max-w-full"
                    >
                      <span className="text-3xl sm:text-4xl md:text-5xl filter drop-shadow-md">
                        {currentMysteryWord.emoji}
                      </span>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-white to-pink-200">
                        {currentMysteryWord.word}
                      </h2>
                      <p className="text-[11px] sm:text-xs md:text-sm text-indigo-300/90 font-medium max-w-md line-clamp-2 px-2">
                        {currentMysteryWord.definition}
                      </p>

                      {!isDrawingAnimation && (
                        <div className="mt-1 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={speakCurrentWord}
                            className="text-xs text-slate-300 hover:text-white hover:bg-indigo-600/30 h-7 px-3 rounded-full"
                          >
                            <Volume2 className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                            Speak Word
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-slate-500">
                      <div className="h-10 w-10 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center">
                        <Shuffle className="h-5 w-5 text-slate-600" />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-400">Ready to begin!</p>
                      <p className="text-[11px] text-slate-500">
                        Click &ldquo;Draw Mystery Word&rdquo; below to call out the first word.
                      </p>
                    </div>
                  )}
                </div>

                {/* Slower Suspense Speed Controls */}
                <div className="w-full mt-2.5 flex items-center justify-between bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 pl-1 flex items-center gap-1">
                    <Sliders className="h-3 w-3 text-indigo-400" />
                    Speed:
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDrawSpeed("fast")}
                      className={cn(
                        "px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all",
                        drawSpeed === "fast"
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-slate-200"
                      )}
                    >
                      ⚡ Fast
                    </button>
                    <button
                      onClick={() => setDrawSpeed("normal")}
                      className={cn(
                        "px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all",
                        drawSpeed === "normal"
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-slate-200"
                      )}
                    >
                      🎯 Normal
                    </button>
                    <button
                      onClick={() => setDrawSpeed("slow")}
                      className={cn(
                        "px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all",
                        drawSpeed === "slow"
                          ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      )}
                    >
                      🐢 Slower (Suspense)
                    </button>
                  </div>
                </div>

                {/* Draw & Auto-Draw Controls */}
                <div className="w-full mt-2.5 flex flex-col sm:flex-row items-center gap-2">
                  <Button
                    onClick={drawMysteryWord}
                    disabled={isDrawingAnimation}
                    className="w-full sm:flex-1 h-11 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Shuffle className={cn("h-4 w-4 mr-2", isDrawingAnimation && "animate-spin")} />
                    {isDrawingAnimation
                      ? drawSpeed === "slow"
                        ? "Rolling Chamber Suspense..."
                        : "Shuffling Chamber..."
                      : "Draw Mystery Word"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setIsAutoDrawActive(!isAutoDrawActive)}
                    className={cn(
                      "w-full sm:w-auto h-11 border-slate-800 text-xs font-bold rounded-xl px-3.5",
                      isAutoDrawActive
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
                        : "hover:bg-slate-800 text-slate-300"
                    )}
                  >
                    {isAutoDrawActive ? (
                      <>
                        <Pause className="h-3.5 w-3.5 mr-1 text-amber-400" />
                        <span>Auto ({autoDrawCountdown}s)</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                        <span>Auto-Timer</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Teacher Setup & Vocab Selector */}
            <Card className="bg-slate-900/80 border-slate-800 shadow-xl shrink-0">
              <CardContent className="p-3 sm:p-3.5 flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Category Selector */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Vocabulary Pool (50 Words each)
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategorySelect(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                    >
                      {Object.entries(VOCAB_CATEGORIES).map(([key, cat]) => (
                        <option key={key} value={key}>
                          {cat.icon} {cat.label} ({cat.words.length} words)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Grid Size Selection */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Grid Size
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleGridSizeSelect(3)}
                        className={cn(
                          "py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5",
                          gridSize === 3
                            ? "bg-indigo-600/30 border-indigo-500 text-indigo-200"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        )}
                      >
                        <Grid3X3 className="h-3.5 w-3.5" />
                        <span>3x3 (Fast)</span>
                      </button>

                      <button
                        onClick={() => handleGridSizeSelect(5)}
                        className={cn(
                          "py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5",
                          gridSize === 5
                            ? "bg-indigo-600/30 border-indigo-500 text-indigo-200"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        )}
                      >
                        <Grid2X2 className="h-3.5 w-3.5" />
                        <span>5x5 (Classic)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Print Shortcut Banner in Teacher Mode */}
                <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                  <div className="flex items-center gap-2">
                    <Printer className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="text-[11px] font-bold text-indigo-200">
                      Print Physical Cards for up to 50 students
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] h-6 px-2.5 rounded-lg"
                  >
                    Print Sets
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Drawn History Tray - Flexes to fill bottom space */}
            <Card className="bg-slate-900/80 border-slate-800 shadow-xl flex-1 flex flex-col min-h-0">
              <CardHeader className="py-2.5 px-4 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                  Drawn Words History ({drawnWords.length})
                </CardTitle>
                {drawnWords.length > 0 && (
                  <span className="text-[10px] text-slate-500">Click to replay pronunciation</span>
                )}
              </CardHeader>
              <CardContent className="px-4 pb-3 flex-1 flex flex-col min-h-0">
                {drawnWords.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4 italic my-auto">
                    No words called yet this round.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 overflow-y-auto pr-1 flex-1 min-h-[60px]">
                    {drawnWords.map((item, idx) => (
                      <button
                        key={item.id + idx}
                        onClick={() => {
                          if (typeof window !== "undefined" && "speechSynthesis" in window) {
                            const u = new SpeechSynthesisUtterance(item.word);
                            window.speechSynthesis.speak(u);
                          }
                        }}
                        className="flex items-center gap-1 bg-slate-950 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-600 px-2 py-0.5 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
                      >
                        <span className="text-slate-500 text-[10px]">#{drawnWords.length - idx}</span>
                        <span>{item.emoji}</span>
                        <span className="font-bold">{item.word}</span>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================= */}
        {/* STUDENT MODE BINGO CARD - Stretches dynamically to bottom  */}
        {/* ========================================================= */}
        {(viewMode === "student" || viewMode === "split") && (
          <div
            className={cn(
              "flex flex-col gap-3 h-full min-h-0 flex-1",
              viewMode === "student" ? "lg:col-span-12 max-w-3xl mx-auto w-full" : "lg:col-span-7 w-full"
            )}
          >
            {/* Student Top Bar: Live Draw Tracker & Score Status */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="h-8 w-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
                  <Radio className="h-4 w-4 text-indigo-400 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Latest Teacher Call
                  </span>
                  <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                    {currentMysteryWord ? (
                      <>
                        <span>{currentMysteryWord.emoji}</span>
                        <span className="text-indigo-300 underline decoration-indigo-500/50">
                          {currentMysteryWord.word}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-500 text-xs italic">Awaiting teacher draw...</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-bold">Marked:</span>
                  <span className="text-xs font-black text-amber-400">
                    {markedCellsCount} / {totalCells}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateStudentBoard(gridSize, selectedCategory)}
                  className="border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 rounded-xl h-8 px-2.5"
                  title="Shuffle my card words"
                >
                  <Shuffle className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                  New Card
                </Button>
              </div>
            </div>

            {/* THE BINGO CARD CONTAINER - Stretches and fills 100% vertical space */}
            <Card className="bg-slate-900/90 border-indigo-500/30 shadow-2xl p-2.5 sm:p-3 md:p-4 relative overflow-hidden flex-1 flex flex-col justify-between h-full min-h-0">
              {/* Header Letter Ribbon */}
              <div
                className={cn(
                  "grid gap-2 mb-2 text-center shrink-0",
                  gridSize === 3 ? "grid-cols-3" : "grid-cols-5"
                )}
              >
                {(gridSize === 3 ? ["B", "I", "N"] : ["B", "I", "N", "G", "O"]).map((letter, i) => (
                  <div
                    key={letter + i}
                    className="py-1 rounded-lg bg-gradient-to-b from-indigo-500/20 to-slate-950 border border-indigo-500/30 text-indigo-300 font-black text-base md:text-lg tracking-widest shadow-sm"
                  >
                    {letter}
                  </div>
                ))}
              </div>

              {/* The Interactive Grid - Fills all available flex-1 height */}
              <div
                className={cn(
                  "grid gap-1.5 sm:gap-2 md:gap-2.5 w-full flex-1 min-h-0",
                  gridSize === 3 ? "grid-cols-3 grid-rows-3" : "grid-cols-5 grid-rows-5"
                )}
              >
                {studentCard.map((row, r) =>
                  row.map((cell, c) => {
                    const isLatestDrawnWord =
                      currentMysteryWord &&
                      cell.word.toLowerCase() === currentMysteryWord.word.toLowerCase();

                    return (
                      <motion.button
                        key={`${r}-${c}-${cell.word}`}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleCellClick(r, c)}
                        className={cn(
                          "relative rounded-xl md:rounded-2xl p-1.5 md:p-2 flex flex-col items-center justify-center text-center transition-all duration-200 border h-full w-full min-h-[56px] sm:min-h-[68px] md:min-h-[80px] lg:min-h-[92px] cursor-pointer group select-none shadow-md",
                          cell.isFree &&
                            "bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-slate-900 border-amber-500/60 shadow-amber-500/20 text-amber-200",
                          cell.isWinningCell &&
                            "ring-2 ring-amber-400 bg-gradient-to-br from-amber-500/40 via-yellow-500/30 to-indigo-950 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse",
                          !cell.isFree &&
                            cell.marked &&
                            !cell.isWinningCell &&
                            "bg-gradient-to-br from-indigo-600/40 via-purple-600/30 to-slate-950 border-indigo-500/80 text-white shadow-indigo-500/20",
                          !cell.marked &&
                            "bg-slate-950/80 hover:bg-slate-900 border-slate-800/90 text-slate-200 hover:border-slate-700",
                          isLatestDrawnWord &&
                            !cell.marked &&
                            "border-pink-500 ring-2 ring-pink-500/50 bg-pink-950/30 animate-bounce"
                        )}
                      >
                        {cell.marked && (
                          <div className="absolute top-1.5 right-1.5 h-3.5 w-3.5 md:h-4 md:w-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                            <Check className="h-2 w-2 md:h-3 md:w-3 stroke-[3]" />
                          </div>
                        )}

                        <span className="text-base sm:text-xl md:text-2xl lg:text-3xl mb-0.5 filter drop-shadow-sm transition-transform group-hover:scale-110">
                          {cell.emoji}
                        </span>

                        <span
                          className={cn(
                            "text-[10px] sm:text-[11px] md:text-xs font-bold leading-tight line-clamp-2",
                            cell.isFree ? "font-black text-amber-300 tracking-wider" : "text-white"
                          )}
                        >
                          {cell.word}
                        </span>

                        {cell.marked && !cell.isFree && (
                          <span className="text-[8px] uppercase tracking-wider font-extrabold text-indigo-300/80 mt-0.5">
                            Marked
                          </span>
                        )}
                      </motion.button>
                    );
                  })
                )}
              </div>

              {/* Card Footer Rules Hint */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-1.5 shrink-0">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Star className="h-3.5 w-3.5 text-amber-400" />
                  Match any horizontal, vertical, or diagonal row to claim <strong>BINGO</strong>!
                </span>

                {winningLines.length > 0 && (
                  <Badge className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1">
                    🎉 BINGO! ({winningLines.map((l) => l.label).join(", ")})
                  </Badge>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* --- PRINT CARDS CONFIGURATION MODAL --- */}
      <AnimatePresence>
        {isPrintModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative flex flex-col gap-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <Printer className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Print Student Bingo Cards</h3>
                    <p className="text-xs text-slate-400">Generate classroom card sets with guaranteed winners</p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-slate-400 hover:text-white"
                  onClick={() => setIsPrintModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Form Options */}
              <div className="flex flex-col gap-4">
                {/* Number of Students (1 to 50) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      Number of Students to Print (1 - 50 max)
                    </label>
                    <span className="text-xs font-black text-indigo-400 font-mono">
                      {studentCountInput} Cards
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={studentCountInput}
                    onChange={(e) => setStudentCountInput(parseInt(e.target.value) || 1)}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>1 Student</span>
                    <span>25 Standard</span>
                    <span>50 Maximum</span>
                  </div>
                </div>

                {/* Guaranteed 1-3 Random Winners Notice */}
                <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200/90 leading-relaxed">
                    <strong>Classroom Win Guarantee:</strong> The generator automatically assigns <strong>1 to 3 random winning cards</strong> in this print batch. The included Teacher Secret Call Sheet lists the winning card numbers so you stay in control!
                  </div>
                </div>

                {/* Print Layout */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300">Layout Format</label>
                    <select
                      value={cardsPerPage}
                      onChange={(e) => setCardsPerPage(parseInt(e.target.value) as 1 | 2)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                    >
                      <option value={2}>2 Cards per Page (Paper Saver)</option>
                      <option value={1}>1 Card per Page (Large Format)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300">Teacher Secret Sheet</label>
                    <button
                      type="button"
                      onClick={() => setIncludeCallSheet(!includeCallSheet)}
                      className={cn(
                        "py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all",
                        includeCallSheet
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-200"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      )}
                    >
                      {includeCallSheet ? "✓ Include Answer Key" : "No Key"}
                    </button>
                  </div>
                </div>

                {/* Active Print Set Attached Status */}
                {printData && (
                  <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-emerald-400" /> Active Print Set Attached
                      </span>
                      <Badge className="bg-indigo-600/40 text-indigo-200 border-indigo-500/40 text-[10px]">
                        {printData.studentCount} Cards • {printData.winnerIndices.size} Winners
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      This active set is saved with your current game. You can reprint the exact same cards without changing anything, or generate a fresh set.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setIsPrinting(true);
                        setIsPrintModalOpen(false);
                        setTimeout(() => window.print(), 250);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 w-full mt-1"
                    >
                      <Printer className="h-3.5 w-3.5 mr-1.5" />
                      Reprint Current Active Set ({printData.studentCount} Cards)
                    </Button>
                  </div>
                )}

                {/* Category Confirmation */}
                <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                  <span>Selected Pool:</span>
                  <span className="font-bold text-slate-200">
                    {VOCAB_CATEGORIES[selectedCategory]?.icon} {VOCAB_CATEGORIES[selectedCategory]?.label} ({VOCAB_CATEGORIES[selectedCategory]?.words.length} words)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="flex-1 border-slate-800 text-xs font-bold text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateAndPrint}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
                >
                  <Printer className="h-4 w-4 mr-1.5" />
                  {printData ? `Generate New Set (${studentCountInput} Cards)` : `Generate & Print (${studentCountInput} Cards)`}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- BINGO WIN CELEBRATION MODAL OVERLAY --- */}
      <AnimatePresence>
        {showWinCelebration && celebrationDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 border-2 border-amber-400/80 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-[0_0_60px_rgba(245,158,11,0.35)] flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-500/20 rounded-full blur-3xl" />

              <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/40 mb-4 animate-bounce">
                <Trophy className="h-10 w-10 text-slate-950" />
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-tight">
                B I N G O ! ! !
              </h2>
              <p className="text-sm font-semibold text-slate-300 mt-1">
                Outstanding vocabulary master! You scored with:
              </p>
              <Badge className="mt-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-3 py-1 font-bold">
                {celebrationDetails.lineLabel}
              </Badge>

              <div className="grid grid-cols-2 gap-3 w-full my-5">
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Words Called</span>
                  <span className="text-lg font-black text-white">{celebrationDetails.drawCount}</span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Rewards Earned</span>
                  <span className="text-lg font-black text-amber-400 flex items-center gap-1">
                    <Sparkles className="h-4 w-4" /> +{celebrationDetails.xpEarned} XP
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
                <Button
                  onClick={() => setShowWinCelebration(false)}
                  variant="outline"
                  className="w-full sm:flex-1 border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-bold py-3 rounded-xl"
                >
                  Keep Playing
                </Button>
                <Button
                  onClick={() => {
                    setShowWinCelebration(false);
                    handleEndGameAndStartNew();
                  }}
                  className="w-full sm:flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg shadow-amber-500/30"
                >
                  End & Start Next Round
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* END GAME & NEW ROUND CONFIRMATION MODAL                   */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showEndGameConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl relative flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {pendingOptionChange
                      ? `Start New Game with ${
                          pendingOptionChange.type === "category"
                            ? VOCAB_CATEGORIES[pendingOptionChange.value as string]?.label || "New Category"
                            : `${pendingOptionChange.value}x${pendingOptionChange.value} Grid`
                        }?`
                      : "End Current Game & Start New Round?"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {pendingOptionChange
                      ? `You currently have ${drawnWords.length} words drawn in this game. Switching will end this round and reset the boards.`
                      : "Ending the game will wipe current drawn words, reshuffle student boards, and clear old print sets."}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed">
                <strong>Saved Session Notice:</strong> While a round is active, your board is automatically saved so refreshing or exiting won&apos;t lose your place. Pressing <strong>End Game</strong> is the only way to clear this session and generate a new game and new print sets.
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEndGameConfirm(false);
                    setPendingOptionChange(null);
                  }}
                  className="flex-1 border-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel & Keep Playing
                </Button>
                <Button
                  onClick={() => {
                    if (pendingOptionChange) {
                      if (pendingOptionChange.type === "category") {
                        handleEndGameAndStartNew(gridSize, pendingOptionChange.value as string);
                      } else {
                        handleEndGameAndStartNew(pendingOptionChange.value as GridSize, selectedCategory);
                      }
                    } else {
                      handleEndGameAndStartNew();
                    }
                  }}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-600/30"
                >
                  Confirm & End Game
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* EXIT GAME CONFIRMATION MODAL                              */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showExitGameConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl relative flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <LogOut className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Exit Bingo 2?</h3>
                  <p className="text-xs text-slate-400">
                    Exiting will end your active game, clear your saved cards and print sets, and return you to the games menu.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200/90 leading-relaxed">
                If you just want to take a break, you can simply close this tab or leave it open — Bingo 2 will restore your exact game whenever you return! Only click <strong>Exit Game</strong> if you want to permanently end this session.
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setShowExitGameConfirm(false)}
                  className="flex-1 border-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Keep Playing
                </Button>
                <Button
                  onClick={handleExitGame}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30"
                >
                  Exit Game
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* PRINT PORTAL CONTAINER (RENDERED ONLY FOR BROWSER PRINT)   */}
      {/* ========================================================= */}
      {isPrinting &&
        printData &&
        typeof document !== "undefined" &&
        createPortal(
          <div id="bingo-print-portal">
            <style
              dangerouslySetInnerHTML={{
                __html: `
                @media screen {
                  #bingo-print-portal {
                    display: none !important;
                  }
                }
                @media print {
                  @page {
                    size: A4 portrait;
                    margin: 10mm;
                  }
                  html, body {
                    background: #ffffff !important;
                    color: #000000 !important;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                    margin: 0 !important;
                    padding: 0 !important;
                  }
                  body > *:not(#bingo-print-portal) {
                    display: none !important;
                  }
                  #bingo-print-portal {
                    display: block !important;
                    width: 100% !important;
                    background: #ffffff !important;
                  }
                  .print-page {
                    page-break-after: always;
                    break-after: page;
                    width: 100%;
                    min-height: 98vh;
                    box-sizing: border-box;
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                  }
                  .print-card-wrapper {
                    border: 2px solid #1e293b;
                    border-radius: 12px;
                    padding: 14px;
                    margin-bottom: 12px;
                    box-sizing: border-box;
                    background: #ffffff;
                  }
                  .print-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 6px;
                    margin-bottom: 8px;
                  }
                  .print-card-header h2 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 900;
                    color: #1e1b4b;
                    letter-spacing: -0.5px;
                  }
                  .print-student-line {
                    font-size: 11px;
                    color: #475569;
                    font-weight: 600;
                  }
                  .print-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 4px;
                    table-layout: fixed;
                  }
                  .print-table th {
                    background: #f1f5f9;
                    color: #1e293b;
                    font-size: 14px;
                    font-weight: 900;
                    padding: 6px;
                    text-align: center;
                    border: 1.5px solid #cbd5e1;
                    letter-spacing: 2px;
                  }
                  .print-table td {
                    border: 1.5px solid #cbd5e1;
                    text-align: center;
                    padding: 8px 4px;
                    vertical-align: middle;
                    height: 52px;
                    word-break: break-word;
                  }
                  .print-word-text {
                    font-size: 11px;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1.2;
                    text-transform: uppercase;
                  }
                  .print-free-space {
                    background: #fef3c7 !important;
                    font-weight: 900 !important;
                    color: #b45309 !important;
                    font-size: 13px !important;
                    letter-spacing: 1px;
                  }
                  .print-footer {
                    margin-top: 6px;
                    display: flex;
                    justify-content: space-between;
                    font-size: 9px;
                    color: #64748b;
                    font-weight: 600;
                  }
                  /* Teacher Sheet Styles */
                  .teacher-sheet {
                    padding: 20px;
                    border: 2px dashed #6366f1;
                    border-radius: 12px;
                    background: #f8fafc;
                  }
                  .teacher-title {
                    font-size: 22px;
                    font-weight: 900;
                    color: #312e81;
                    margin: 0 0 6px 0;
                  }
                  .winner-box {
                    background: #fef3c7;
                    border: 2px solid #f59e0b;
                    padding: 10px 14px;
                    border-radius: 8px;
                    margin: 12px 0;
                    font-weight: 800;
                    font-size: 13px;
                    color: #92400e;
                  }
                  .call-words-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                    margin-top: 14px;
                  }
                  .call-word-item {
                    border: 1px solid #cbd5e1;
                    background: #ffffff;
                    padding: 6px;
                    border-radius: 6px;
                    font-size: 10px;
                  }
                }
              `,
              }}
            />

            {/* 1. TEACHER'S SECRET CALL SHEET & ANSWER KEY */}
            {printData.includeKey && (
              <div className="print-page">
                <div className="teacher-sheet">
                  <div className="print-card-header">
                    <div>
                      <h1 className="teacher-title">Teacher&apos;s Secret Bingo Master Sheet</h1>
                      <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>
                        Category: <strong>{printData.categoryTitle}</strong> • Total Cards Printed:{" "}
                        <strong>{printData.studentCount}</strong>
                      </p>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "bold", color: "#6366f1" }}>
                      www.lingolandverse.com
                    </span>
                  </div>

                  <div className="winner-box">
                    🏆 SECRET WINNING CARDS IN THIS BATCH: Card{" "}
                    {Array.from(printData.winnerIndices)
                      .map((idx) => `#${idx + 1}`)
                      .join(", Card ")}
                    <div style={{ fontSize: "11px", fontWeight: "normal", marginTop: "4px" }}>
                      These cards are guaranteed to hit BINGO once you call the words below!
                    </div>
                  </div>

                  <p style={{ fontSize: "11px", fontWeight: "bold", color: "#334155", margin: "10px 0 4px" }}>
                    Primary Winning Vocabulary Sequence:
                  </p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {printData.targetWinningWords.map((item, i) => (
                      <span
                        key={i}
                        style={{
                          background: "#e0e7ff",
                          border: "1px solid #6366f1",
                          color: "#312e81",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "800",
                        }}
                      >
                        {i + 1}. {item.emoji} {item.word}
                      </span>
                    ))}
                  </div>

                  <p style={{ fontSize: "11px", fontWeight: "bold", color: "#334155", margin: "10px 0 4px" }}>
                    Complete Category Vocabulary Pool ({printData.allWords.length} words):
                  </p>
                  <div className="call-words-grid">
                    {printData.allWords.map((w, idx) => (
                      <div key={idx} className="call-word-item">
                        <strong>
                          {idx + 1}. {w.emoji} {w.word}
                        </strong>
                        <div style={{ color: "#64748b", marginTop: "2px" }}>{w.definition}</div>
                      </div>
                    ))}
                  </div>

                  <div className="print-footer" style={{ marginTop: "16px" }}>
                    <span>CONFIDENTIAL • Teachers Only • Do not distribute to students</span>
                    <span>LingoLandVerse Educational Consortium</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. STUDENT PRINTABLE CARDS */}
            {(() => {
              const pages = [];
              const perPage = printData.cardsPerPage;

              for (let i = 0; i < printData.cards.length; i += perPage) {
                const pageCards = printData.cards.slice(i, i + perPage);
                pages.push(
                  <div key={i} className="print-page">
                    {pageCards.map((card) => (
                      <div key={card.cardIndex} className="print-card-wrapper">
                        <div className="print-card-header">
                          <div>
                            <h2>LingoLandVerse Bingo</h2>
                            <span className="print-student-line">
                              Student Name: ____________________________ Date: ___________
                            </span>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "12px", fontWeight: "900", color: "#4338ca" }}>
                              Card {card.cardIndex} of {printData.studentCount}
                            </div>
                            <span style={{ fontSize: "10px", color: "#64748b" }}>
                              {printData.categoryTitle}
                            </span>
                          </div>
                        </div>

                        <table className="print-table">
                          <thead>
                            <tr>
                              {(printData.gridSize === 3 ? ["B", "I", "N"] : ["B", "I", "N", "G", "O"]).map(
                                (letter) => (
                                  <th key={letter}>{letter}</th>
                                )
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {card.cells.map((row, r) => (
                              <tr key={r}>
                                {row.map((cell, c) => (
                                  <td
                                    key={c}
                                    className={cell.isFree ? "print-free-space" : undefined}
                                  >
                                    {cell.isFree ? (
                                      <span>⭐ FREE ⭐</span>
                                    ) : (
                                      <div>
                                        <div style={{ fontSize: "13px" }}>{cell.emoji}</div>
                                        <span className="print-word-text">{cell.word}</span>
                                      </div>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <div className="print-footer">
                          <span>Mark words as your teacher calls them. First full line wins BINGO!</span>
                          <span>www.lingolandverse.com</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
              return pages;
            })()}
          </div>,
          document.body
        )}
    </div>
  );
}
