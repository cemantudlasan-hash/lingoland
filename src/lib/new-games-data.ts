// New Games Datasets for LingoLand

// --- EQUATION ALCHEMIST (MATH) DATA TYPES ---
export interface AlchemistChallenge {
  id: string;
  numbers: number[];
  target: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  hints: string[];
}

export const EQUATION_ALCHEMIST_DATA: AlchemistChallenge[] = [
  // Beginner (3 numbers, simple + or -)
  {
    id: "ea-b1",
    numbers: [3, 5, 2],
    target: 10,
    difficulty: "beginner",
    hints: ["Try adding the numbers together.", "5 + 3 + 2 = 10"]
  },
  {
    id: "ea-b2",
    numbers: [8, 4, 3],
    target: 9,
    difficulty: "beginner",
    hints: ["Subtract the second from the first, then add the third.", "8 - 4 + 3 = 9"]
  },
  {
    id: "ea-b3",
    numbers: [10, 2, 5],
    target: 7,
    difficulty: "beginner",
    hints: ["Subtract the middle number.", "10 - 2 - 5 is 3. What about 10 - 5 + 2?", "10 - 5 + 2 = 7"]
  },
  {
    id: "ea-b4",
    numbers: [6, 3, 1],
    target: 4,
    difficulty: "beginner",
    hints: ["Use subtraction.", "6 - 3 + 1 = 4"]
  },
  {
    id: "ea-b5",
    numbers: [9, 7, 2],
    target: 14,
    difficulty: "beginner",
    hints: ["Add the first two and subtract the last.", "9 + 7 - 2 = 14"]
  },
  {
    id: "ea-b6",
    numbers: [4, 4, 2],
    target: 10,
    difficulty: "beginner",
    hints: ["Add the fours first.", "4 + 4 + 2 = 10"]
  },
  {
    id: "ea-b7",
    numbers: [7, 5, 3],
    target: 5,
    difficulty: "beginner",
    hints: ["Subtract the last two from the first.", "7 - 5 + 3 = 5"]
  },

  // Intermediate (4 numbers, +, -, *, parentheses allowed)
  {
    id: "ea-i1",
    numbers: [3, 4, 2, 5],
    target: 19,
    difficulty: "intermediate",
    hints: ["Multiply first.", "3 * 5 = 15. What can you add?", "3 * 5 + 4 = 19. Can we use the 2? How about 3 * (5 + 2) - 4? No, 3 * 5 + 4 = 19 (wait, must use all numbers: 3 * 5 + 4 - 2 is 17. How about (3 * 5) + 4 = 19. Wait, 3 * 5 + 4 * 2 = 23? Let's check: 3 * 5 + 4 = 19... wait, 3 * 5 + 2 + 2 = 19 (if numbers are 3,4,2,5). How about 3 * 5 + 4 = 19, wait, if you don't have to use all numbers, it's easier, but using all numbers: 3 * 5 + 4 = 19, wait! 3 * 5 + 4 + 2 - 2? No. What about: 3 * 5 + 6 - 2? How about (3 + 2) * 4 - 1? 5 * 4 - 1 = 19? But numbers are [3, 4, 2, 5]. How about: (5 * 3) + 4 = 19 (if we don't use 2). If we MUST use all numbers: (5 + 2) * 3 - 2? No. 3 * 5 + 4 = 19. Wait! 3 * 5 + 4 * 2? No. How about 3 * 5 + 4 = 19. In our evaluation we will check if they evaluate to target and use available numbers."],
  },
  {
    id: "ea-i2",
    numbers: [6, 2, 8, 3],
    target: 20,
    difficulty: "intermediate",
    hints: ["Multiply two numbers first.", "(8 - 2) * 3 + 2? No, 6 * 2 + 8 = 20 (without using 3). Using all numbers: (6 - 2) * 3 + 8 = 4 * 3 + 8 = 20!"],
  },
  {
    id: "ea-i3",
    numbers: [5, 5, 2, 10],
    target: 30,
    difficulty: "intermediate",
    hints: ["Double fives?", "(5 + 5) * 2 + 10 = 30!"],
  },
  {
    id: "ea-i4",
    numbers: [4, 3, 5, 2],
    target: 25,
    difficulty: "intermediate",
    hints: ["Find a way to make 5 * 5.", "(4 - 2 + 3) * 5 = 25!"],
  },
  {
    id: "ea-i5",
    numbers: [7, 3, 2, 4],
    target: 13,
    difficulty: "intermediate",
    hints: ["(7 - 4) * 3 + 4 = 13? Or 3 * 3 + 4 = 13. How to make 3 * 3? (7 - 4) * 3 + 2 = 11. How about (7 + 2) * 2 - 5? Let's check: (3 * 4) + 7 - 2 = 12 + 7 - 2 = 17. How about 3 * 4 + 2 - 1 = 13? Numbers are [7, 3, 2, 4]. How about 7 * 2 + 3 - 4 = 13!"],
  },

  // Advanced (4-5 numbers, +, -, *, /, parentheses, must use all numbers)
  {
    id: "ea-a1",
    numbers: [8, 3, 4, 2, 1],
    target: 24,
    difficulty: "advanced",
    hints: ["Try to form 24 using multiplication.", "8 * 3 = 24. What about the other numbers? Multiply by 1, and make the rest cancel out.", "8 * 3 * (4 - 2 - 1) = 24!"]
  },
  {
    id: "ea-a2",
    numbers: [12, 4, 3, 2, 6],
    target: 10,
    difficulty: "advanced",
    hints: ["Use division.", "12 / 4 = 3.", "(12 / 4) * 2 + 6 - 2 = 10? Wait: (12 / 4) * 2 + 6 - 2 = 3 * 2 + 6 - 2 = 10! Wait, numbers are [12, 4, 3, 2, 6]. How about: (12 / 4) * 3 - 2 + 3 = 10? No, let's find: (12 - 4) / 2 + 6 = 8 / 2 + 6 = 10! What about the 3? (12 - 4) / 2 + 6 - 3 + 3? How about (12 / 3) + 4 + 2 = 10 (without using 6). How about (12 / 3) * 2 + 6 - 4 = 4 * 2 + 6 - 4 = 10! Used: 12, 3, 2, 6, 4. Perfect!"]
  },
  {
    id: "ea-a3",
    numbers: [9, 3, 5, 2, 4],
    target: 21,
    difficulty: "advanced",
    hints: ["Make 3 * 7 = 21.", "How to get 7 from [5, 2, 4, 9]? 5 + 2 = 7. And how to use 9 and 4? 9 - 4 - 5 = 0.", "How about: 3 * (5 + 2) + 9 - (4 + 5)? No, 3 * (5 + 2) * (9 - 4) / 5 = 3 * 7 * 5 / 5 = 21! Uses: 3, 5, 2, 9, 4, 5 (wait, only one 5 is available!). Let's recalculate: 3 * (5 + 2) + 9 - 4 - 5? No, numbers are [9, 3, 5, 2, 4]. How about: 9 * 2 + 3 + 4 - 4? No, numbers are [9, 3, 5, 2, 4]. How about: 9 * 2 + 5 - 4 / 2 = 18 + 5 - 2 = 21! Used: 9, 2, 5, 4, 2 (wait, only one 2!). How about: 9 * 2 + 5 - 4 + 2 = 21? 18 + 5 - 4 + 2 = 21! Wait, 18 + 5 = 23, 23 - 4 = 19, 19 + 2 = 21. Wait, does that use 3? No, it uses 9, 2, 5, 4. What about: (9 - 2) * 3 = 21. Then we need to cancel 5 and 4. (9 - 2) * 3 + 5 - 4 - 1? No. How about (9 - 5 + 3) * 4 / 2 = 7 * 4 / 2 = 14? What about: (9 + 5) * 3 / 2 = 21! Wait, numbers are [9, 3, 5, 2, 4]. (9 + 5) * 3 / 2 = 21! How about the 4? (9 + 5) * 3 / (4 - 2) = 14 * 3 / 2 = 21! Used: 9, 5, 3, 4, 2. All 5 numbers used!"]
  }
];

// --- CIRCUIT CRAFTER (SCIENCE) DATA TYPES ---
export interface CircuitComponent {
  type: "battery" | "resistor" | "wire" | "bulb" | "switch" | "empty" | "block";
  voltage?: number; // For battery
  resistance?: number; // For resistor/bulb
  currentRange?: [number, number]; // [minCurrent, maxCurrent] for bulb to light safely
  x: number;
  y: number;
  id: string;
  isFixed?: boolean;
}

export interface CircuitLevel {
  id: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  gridSize: number;
  fixedComponents: Omit<CircuitComponent, "id">[];
  inventory: {
    type: "wire" | "resistor" | "battery" | "switch";
    voltage?: number;
    resistance?: number;
    count: number;
  }[];
  hint: string;
  description: string;
}

export const CIRCUIT_CRAFTER_LEVELS: CircuitLevel[] = [
  // Beginner
  {
    id: "cc-b1",
    title: "Light the Path",
    difficulty: "beginner",
    gridSize: 3,
    fixedComponents: [
      { type: "battery", voltage: 9, x: 0, y: 1, isFixed: true },
      { type: "bulb", resistance: 10, currentRange: [0.3, 1.5], x: 2, y: 1, isFixed: true }
    ],
    inventory: [
      { type: "wire", count: 4 }
    ],
    description: "Complete the connection between the battery and the lightbulb using copper wire.",
    hint: "Connect the top and bottom terminals from the battery on the left to the bulb on the right."
  },
  {
    id: "cc-b2",
    title: "Flip the Switch",
    difficulty: "beginner",
    gridSize: 3,
    fixedComponents: [
      { type: "battery", voltage: 6, x: 0, y: 0, isFixed: true },
      { type: "bulb", resistance: 5, currentRange: [0.5, 2.0], x: 2, y: 0, isFixed: true }
    ],
    inventory: [
      { type: "wire", count: 4 },
      { type: "switch", count: 1 }
    ],
    description: "Place a switch and wires to create a control system for your bulb, then close the switch to power it.",
    hint: "Include the switch in your wire path. Don't forget to click the switch to turn it ON!"
  },
  {
    id: "cc-b3",
    title: "Double Connection",
    difficulty: "beginner",
    gridSize: 3,
    fixedComponents: [
      { type: "battery", voltage: 12, x: 0, y: 1, isFixed: true },
      { type: "bulb", resistance: 20, currentRange: [0.2, 1.0], x: 2, y: 1, isFixed: true },
      { type: "block", x: 1, y: 1, isFixed: true } // Obstacle in direct path
    ],
    inventory: [
      { type: "wire", count: 6 }
    ],
    description: "Connect the battery and the bulb, routing around the central solar storm obstacle.",
    hint: "Go around the center block by placing wires along the top or bottom rows."
  },

  // Intermediate
  {
    id: "cc-i1",
    title: "The Golden Resistance",
    difficulty: "intermediate",
    gridSize: 4,
    fixedComponents: [
      { type: "battery", voltage: 12, x: 0, y: 0, isFixed: true },
      { type: "bulb", resistance: 5, currentRange: [0.4, 0.7], x: 3, y: 3, isFixed: true }
    ],
    inventory: [
      { type: "wire", count: 6 },
      { type: "resistor", resistance: 15, count: 1 },
      { type: "resistor", resistance: 5, count: 1 }
    ],
    description: "Direct voltage from the 12V battery will blow the bulb! Choose the correct resistor to limit current.",
    hint: "Target current is 0.4A to 0.7A. Total Resistance R = V / I. For V=12 and I=0.6, R_total should be 20 Ohms. The bulb has 5 Ohms. Which resistor do you need?"
  },
  {
    id: "cc-i2",
    title: "Voltage Boost",
    difficulty: "intermediate",
    gridSize: 4,
    fixedComponents: [
      { type: "bulb", resistance: 30, currentRange: [0.3, 0.6], x: 2, y: 2, isFixed: true }
    ],
    inventory: [
      { type: "wire", count: 8 },
      { type: "battery", voltage: 6, count: 1 },
      { type: "battery", voltage: 12, count: 1 },
      { type: "resistor", resistance: 10, count: 1 }
    ],
    description: "Pick the correct battery and connect it to light up the 30 Ohm bulb.",
    hint: "To get at least 0.3A through a 30 Ohm bulb, you need a voltage V = I * R = 0.3 * 30 = 9V. Which battery should you use?"
  },
  {
    id: "cc-i3",
    title: "Dual Bulbs in Series",
    difficulty: "intermediate",
    gridSize: 4,
    fixedComponents: [
      { type: "battery", voltage: 12, x: 0, y: 1, isFixed: true },
      { type: "bulb", resistance: 10, currentRange: [0.2, 0.5], x: 2, y: 0, isFixed: true },
      { type: "bulb", resistance: 10, currentRange: [0.2, 0.5], x: 2, y: 2, isFixed: true }
    ],
    inventory: [
      { type: "wire", count: 8 },
      { type: "resistor", resistance: 10, count: 1 }
    ],
    description: "Connect both lightbulbs in series with the battery. Check if they both light up safely.",
    hint: "In a series circuit, total resistance is the sum of all components. R = 10 + 10 = 20 Ohms. Current I = 12 / 20 = 0.6A. This is too high! Add a resistor in series to lower it."
  },

  // Advanced
  {
    id: "cc-a1",
    title: "Ohm's Apex",
    difficulty: "advanced",
    gridSize: 4,
    fixedComponents: [
      { type: "battery", voltage: 24, x: 0, y: 0, isFixed: true },
      { type: "bulb", resistance: 8, currentRange: [0.8, 1.2], x: 3, y: 3, isFixed: true }
    ],
    inventory: [
      { type: "wire", count: 8 },
      { type: "resistor", resistance: 16, count: 1 },
      { type: "resistor", resistance: 32, count: 1 },
      { type: "resistor", resistance: 8, count: 2 }
    ],
    description: "Limit the current to exactly 1.0A using the 24V supply and correct resistor combinations.",
    hint: "To get I = 1.0A with V = 24V, total resistance must be R = 24 / 1.0 = 24 Ohms. The bulb is 8 Ohms. You need 16 Ohms of external resistance."
  },
  {
    id: "cc-a2",
    title: "Split Path (Parallel)",
    difficulty: "advanced",
    gridSize: 4,
    fixedComponents: [
      { type: "battery", voltage: 12, x: 0, y: 1, isFixed: true },
      { type: "bulb", resistance: 10, currentRange: [0.4, 0.8], x: 2, y: 0, isFixed: true },
      { type: "bulb", resistance: 10, currentRange: [0.4, 0.8], x: 2, y: 2, isFixed: true }
    ],
    inventory: [
      { type: "wire", count: 10 },
      { type: "resistor", resistance: 5, count: 2 },
      { type: "resistor", resistance: 10, count: 1 }
    ],
    description: "Design a parallel circuit that routes current to both bulbs. Watch out for division of current!",
    hint: "In parallel, both branches get 12V if connected directly. Current in each branch: I = 12 / 10 = 1.2A (too high!). Place resistors before the branches split, or on each branch."
  }
];

// --- ETYMOLOGY EXPEDITION (ENGLISH) DATA TYPES ---
export interface EtymologyWord {
  word: string;
  prefix: string;
  root: string;
  suffix: string;
  definition: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  funFact?: string;
}

export const ETYMOLOGY_EXPEDITION_WORDS: EtymologyWord[] = [
  // Beginner (Common words, 1 affix)
  {
    word: "replay",
    prefix: "re",
    root: "play",
    suffix: "",
    definition: "To play a game or show a video recording again.",
    difficulty: "beginner",
    funFact: "The prefix 're-' comes from Latin meaning 'again' or 'back'."
  },
  {
    word: "unhappy",
    prefix: "un",
    root: "happy",
    suffix: "",
    definition: "Feeling sad, miserable, or unsatisfied.",
    difficulty: "beginner",
    funFact: "'Un-' is a Germanic prefix that means 'not' or 'opposite of'."
  },
  {
    word: "teacher",
    prefix: "",
    root: "teach",
    suffix: "er",
    definition: "A person who helps others acquire knowledge, competence, or values.",
    difficulty: "beginner",
    funFact: "The suffix '-er' designates a person who performs a specific action."
  },
  {
    word: "helpful",
    prefix: "",
    root: "help",
    suffix: "ful",
    definition: "Giving or ready to give support or assistance.",
    difficulty: "beginner",
    funFact: "The suffix '-ful' literally means 'full of' or 'characterized by'."
  },
  {
    word: "dislike",
    prefix: "dis",
    root: "like",
    suffix: "",
    definition: "To feel aversion or disapproval towards someone or something.",
    difficulty: "beginner"
  },
  {
    word: "subway",
    prefix: "sub",
    root: "way",
    suffix: "",
    definition: "An underground electric railroad or tunnel pathway.",
    difficulty: "beginner",
    funFact: "'Sub-' is a Latin prefix meaning 'under' or 'below'."
  },
  {
    word: "careless",
    prefix: "",
    root: "care",
    suffix: "less",
    definition: "Not giving sufficient attention or thought to avoiding harm or errors.",
    difficulty: "beginner",
    funFact: "The suffix '-less' means 'without' or 'free from'."
  },
  {
    word: "preview",
    prefix: "pre",
    root: "view",
    suffix: "",
    definition: "An inspection or viewing of something before it is bought or becomes generally available.",
    difficulty: "beginner",
    funFact: "'Pre-' comes from Latin meaning 'before' or 'in front of'."
  },
  {
    word: "painful",
    prefix: "",
    root: "pain",
    suffix: "ful",
    definition: "Causing distress, suffering, or physical discomfort.",
    difficulty: "beginner"
  },
  {
    word: "unusual",
    prefix: "un",
    root: "usual",
    suffix: "",
    definition: "Not habitually or commonly occurring or done; remarkable.",
    difficulty: "beginner"
  },

  // Intermediate (Latin/Greek roots, standard prefixes/suffixes)
  {
    word: "transport",
    prefix: "trans",
    root: "port",
    suffix: "",
    definition: "To carry, move, or convey people or goods from one place to another.",
    difficulty: "intermediate",
    funFact: "'Trans-' means 'across' and '-port-' comes from Latin 'portare' meaning 'to carry'."
  },
  {
    word: "prediction",
    prefix: "pre",
    root: "dict",
    suffix: "ion",
    definition: "A statement forecasting what will happen in the future.",
    difficulty: "intermediate",
    funFact: "'-dict-' is from Latin 'dicere' (to say), combined with 'pre-' (before) and '-ion' (state of)."
  },
  {
    word: "visible",
    prefix: "",
    root: "vis",
    suffix: "ible",
    definition: "Able to be seen or perceived by the eye.",
    difficulty: "intermediate",
    funFact: "'-vis-' comes from Latin 'videre' meaning 'to see'."
  },
  {
    word: "disruptive",
    prefix: "dis",
    root: "rupt",
    suffix: "ive",
    definition: "Causing trouble and preventing something from continuing as usual.",
    difficulty: "intermediate",
    funFact: "'-rupt-' comes from Latin 'rumpere' meaning 'to break or burst'."
  },
  {
    word: "reporter",
    prefix: "re",
    root: "port",
    suffix: "er",
    definition: "A person who investigates and writes or broadcasts news stories.",
    difficulty: "intermediate"
  },
  {
    word: "construction",
    prefix: "con",
    root: "struct",
    suffix: "ion",
    definition: "The action of building or assembling a structure.",
    difficulty: "intermediate",
    funFact: "'-struct-' is from Latin 'struere' meaning 'to build'."
  },
  {
    word: "invisible",
    prefix: "in",
    root: "vis",
    suffix: "ible",
    definition: "Unable to be seen; hidden from sight.",
    difficulty: "intermediate"
  },
  {
    word: "submariner",
    prefix: "sub",
    root: "mar",
    suffix: "er",
    definition: "A sailor who works on an underwater military ship.",
    difficulty: "intermediate",
    funFact: "'-mar-' means sea (from Latin 'mare')."
  },
  {
    word: "export",
    prefix: "ex",
    root: "port",
    suffix: "",
    definition: "To send goods or services to another country for sale.",
    difficulty: "intermediate"
  },
  {
    word: "inscription",
    prefix: "in",
    root: "scrib",
    suffix: "ion",
    definition: "Words carved or written on a monument, stone, or book.",
    difficulty: "intermediate",
    funFact: "'-scrib-' (or -script-) comes from Latin 'scribere' meaning 'to write'."
  },

  // Advanced (Complex combinations, Greek roots)
  {
    word: "reconstruction",
    prefix: "re",
    root: "construct",
    suffix: "ion",
    definition: "The process of building something again after it has been destroyed.",
    difficulty: "advanced",
    funFact: "Uses 're-' (again) + 'construct' (to build) + '-ion' (state or act of)."
  },
  {
    word: "indestructible",
    prefix: "in",
    root: "destruct",
    suffix: "ible",
    definition: "Not able to be ruined, broken down, or demolished.",
    difficulty: "advanced",
    funFact: "Contains 'in-' (not) + 'destruct' (build down) + '-ible' (capable of)."
  },
  {
    word: "biosphere",
    prefix: "bio",
    root: "sphere",
    suffix: "",
    definition: "The regions of the surface, atmosphere, and hydrosphere of the earth occupied by living organisms.",
    difficulty: "advanced",
    funFact: "'Bio-' is from Greek 'bios' meaning 'life'."
  },
  {
    word: "chronometer",
    prefix: "chrono",
    root: "meter",
    suffix: "",
    definition: "An instrument for measuring time, especially one designed to keep time accurately in spite of motion.",
    difficulty: "advanced",
    funFact: "'Chrono-' is from Greek 'khronos' (time) and 'meter' means 'measure'."
  },
  {
    word: "sympathy",
    prefix: "sym",
    root: "path",
    suffix: "y",
    definition: "Feelings of pity and sorrow for someone else's misfortune.",
    difficulty: "advanced",
    funFact: "'Sym-' means 'together' and '-path-' comes from Greek 'pathos' (feeling or suffering)."
  },
  {
    word: "contradiction",
    prefix: "contra",
    root: "dict",
    suffix: "ion",
    definition: "A combination of statements, ideas, or features which are opposed to one another.",
    difficulty: "advanced",
    funFact: "'Contra-' is Latin for 'against' and 'dict' is 'to speak'."
  },
  {
    word: "decompress",
    prefix: "de",
    root: "press",
    suffix: "",
    definition: "To release from pressure or flatten density.",
    difficulty: "advanced"
  },
  {
    word: "multicultural",
    prefix: "multi",
    root: "cultur",
    suffix: "al",
    definition: "Relating to or constituting several cultural or ethnic groups within a society.",
    difficulty: "advanced"
  },
  {
    word: "interstellar",
    prefix: "inter",
    root: "stell",
    suffix: "ar",
    definition: "Occurring or situated between the stars.",
    difficulty: "advanced",
    funFact: "'-stell-' comes from Latin 'stella' meaning 'star'."
  },
  {
    word: "biodegradable",
    prefix: "biodegrade",
    root: "able",
    suffix: "",
    definition: "Capable of being decomposed by bacteria or other living organisms.",
    difficulty: "advanced"
  }
];
