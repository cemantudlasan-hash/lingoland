export interface EmojiEnigmaItem {
  emojis: string;
  answer: string;
  clue: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'Movies' | 'Idioms' | 'Everyday Activities' | 'Famous Places' | 'Objects';
  explanation: string;
}

export const EMOJI_ENIGMA_DATA: EmojiEnigmaItem[] = [
  // --- MOVIES ---
  {
    emojis: "🦁👑",
    answer: "Lion King",
    clue: "Disney animated classic about a lion cub who becomes king",
    difficulty: "beginner",
    category: "Movies",
    explanation: "The lion represents the main character Simba, and the crown represents royalty and his destiny to be king."
  },
  {
    emojis: "❄️👑",
    answer: "Frozen",
    clue: "Disney animated musical about sisters, ice powers, and a snowman",
    difficulty: "beginner",
    category: "Movies",
    explanation: "The snowflake represents ice powers, and the crown represents Queen Elsa."
  },
  {
    emojis: "🦖🎢",
    answer: "Jurassic Park",
    clue: "Sci-fi adventure film about cloned dinosaurs escaping a theme park",
    difficulty: "beginner",
    category: "Movies",
    explanation: "The dinosaur represents the prehistoric creatures, and the roller coaster represents the amusement park."
  },
  {
    emojis: "🤡🎈",
    answer: "It",
    clue: "Horror movie based on Stephen King's novel about a shape-shifting monster",
    difficulty: "beginner",
    category: "Movies",
    explanation: "The clown represents Pennywise, and the red balloon is his signature calling card."
  },
  {
    emojis: "⚡🧙‍♂️🦉",
    answer: "Harry Potter",
    clue: "Fantasy film series about a young wizard and his friends",
    difficulty: "beginner",
    category: "Movies",
    explanation: "The lightning bolt represents Harry's scar, the wizard represents magic, and the owl represents his pet Hedwig."
  },
  {
    emojis: "👽🚲🌕",
    answer: "ET",
    clue: "Classic sci-fi film about a friendly alien trying to go home",
    difficulty: "beginner",
    category: "Movies",
    explanation: "The alien represents E.T., and the bicycle flying past the moon represents the famous movie scene."
  },
  {
    emojis: "🤡🐠🌊",
    answer: "Finding Nemo",
    clue: "Pixar movie about a father clownfish searching for his lost son",
    difficulty: "beginner",
    category: "Movies",
    explanation: "The clown emoji and fish represent the clownfish Nemo, and the wave represents the ocean."
  },
  {
    emojis: "🍫🏭🍭",
    answer: "Charlie and the Chocolate Factory",
    clue: "Fantasy story about a boy winning a tour of a magical candy factory",
    difficulty: "beginner",
    category: "Movies",
    explanation: "The chocolate bar and factories represent Willy Wonka's chocolate factory."
  },
  {
    emojis: "👻🚫🔫",
    answer: "Ghostbusters",
    clue: "Comedy about a team of scientists catching supernatural spirits",
    difficulty: "beginner",
    category: "Movies",
    explanation: "The ghost, prohibited sign, and gun represent the ghostbusters and their proton packs."
  },
  {
    emojis: "🧛🦇🏰",
    answer: "Dracula",
    clue: "Classic horror movie about a famous vampire count from Transylvania",
    difficulty: "beginner",
    category: "Movies",
    explanation: "The vampire, bat, and castle represent Count Dracula."
  },
  {
    emojis: "🏠🎈🎈",
    answer: "Up",
    clue: "Pixar movie about an old man floating his house away with helium balloons",
    difficulty: "beginner",
    category: "Movies",
    explanation: "The house and balloons represent Carl floating his house to Paradise Falls."
  },
  {
    emojis: "🦈⛵🌊",
    answer: "Jaws",
    clue: "Classic thriller about a giant man-eating shark terrorizing a beach town",
    difficulty: "beginner",
    category: "Movies",
    explanation: "The shark and sailboat represent the hunt for the killer great white shark."
  },
  {
    emojis: "🎥🚢❄️",
    answer: "Titanic",
    clue: "Epic romance and disaster film directed by James Cameron",
    difficulty: "intermediate",
    category: "Movies",
    explanation: "The movie camera represents a film, the ship is the Titanic, and the snowflake/ice represents the iceberg that sank it."
  },
  {
    emojis: "🕸️🕷️🧍",
    answer: "Spider Man",
    clue: "Superhero film about Peter Parker who fights crime with spider powers",
    difficulty: "intermediate",
    category: "Movies",
    explanation: "The spiderweb, spider, and person represent the famous Marvel superhero Spiderman."
  },
  {
    emojis: "🚀🌌⚔️",
    answer: "Star Wars",
    clue: "Epic space opera film series about the Jedi and the Empire",
    difficulty: "intermediate",
    category: "Movies",
    explanation: "The rocket represents space travel, the galaxy is outer space, and the swords represent lightsaber duels."
  },
  {
    emojis: "🧸🎒🤠",
    answer: "Toy Story",
    clue: "Pixar animation about toys that secretly come to life when humans leave",
    difficulty: "intermediate",
    category: "Movies",
    explanation: "The teddy bear and backpack represent toys, and the cowboy represents Woody."
  },
  {
    emojis: "🥊🏆⚡",
    answer: "Rocky",
    clue: "Sports drama about a small-time boxer who gets a shot at the heavyweight title",
    difficulty: "intermediate",
    category: "Movies",
    explanation: "The boxing glove, trophy, and lightning represent Rocky Balboa's fights."
  },
  {
    emojis: "🐒🦖🏙️",
    answer: "King Kong",
    clue: "Giant monster film about a massive ape who climbs the Empire State Building",
    difficulty: "intermediate",
    category: "Movies",
    explanation: "The monkey, dinosaur, and cityscape represent the giant ape King Kong fighting in New York."
  },
  {
    emojis: "🏹🍎🎯",
    answer: "Robin Hood",
    clue: "Legendary outlaw who steals from the rich and gives to the poor",
    difficulty: "intermediate",
    category: "Movies",
    explanation: "The bow and arrow, apple, and bullseye represent the legendary archer Robin Hood."
  },
  {
    emojis: "🤖🦾🕶️",
    answer: "Terminator",
    clue: "Sci-fi action movie about an assassin cyborg sent back in time",
    difficulty: "intermediate",
    category: "Movies",
    explanation: "The robot, mechanical arm, and sunglasses represent the Terminator."
  },
  {
    emojis: "🚗🏁⚡",
    answer: "Cars",
    clue: "Pixar animation about a racing car named Lightning McQueen",
    difficulty: "intermediate",
    category: "Movies",
    explanation: "The car, checkered flag, and lightning bolt represent Lightning McQueen."
  },
  {
    emojis: "🧙‍♂️💍🌋",
    answer: "Lord of the Rings",
    clue: "Epic fantasy trilogy about destroying a powerful ring in a volcano",
    difficulty: "intermediate",
    category: "Movies",
    explanation: "The wizard, ring, and volcano represent Mount Doom and the quest of the ring-bearer."
  },
  {
    emojis: "🐒🛶🏝️",
    answer: "Cast Away",
    clue: "Survival drama about a FedEx employee stranded on an uninhabited island",
    difficulty: "intermediate",
    category: "Movies",
    explanation: "The monkey, canoe, and island represent survival on a remote island with Wilson."
  },
  {
    emojis: "🦖🌋🌍",
    answer: "Jurassic World",
    clue: "Sci-fi sequel where a fully functional dinosaur theme park gets out of control",
    difficulty: "intermediate",
    category: "Movies",
    explanation: "The dinosaur, volcano, and globe represent the global prehistoric threat."
  },
  {
    emojis: "🧠🌀🐑",
    answer: "Inception",
    clue: "Mind-bending sci-fi heist movie about entering people's dreams",
    difficulty: "advanced",
    category: "Movies",
    explanation: "The brain represents dreams, the spiral represents going deeper, and the sleeping sheep represents sleep/dreaming."
  },
  {
    emojis: "🟩🕶️💊",
    answer: "The Matrix",
    clue: "Sci-fi action film where humanity is trapped in a virtual reality simulation",
    difficulty: "advanced",
    category: "Movies",
    explanation: "The green color and sunglasses represent the aesthetic, and the pill represents the choice between the red and blue pills."
  },
  {
    emojis: "👨‍👩‍👧‍👦🏠🤫",
    answer: "Parasite",
    clue: "Award-winning thriller about a poor family infiltrating a wealthy house",
    difficulty: "advanced",
    category: "Movies",
    explanation: "The family and house represent the household invasion, and the shushing emoji represents the dark secrets."
  },
  {
    emojis: "🤫🐏🐑",
    answer: "The Silence of the Lambs",
    clue: "Psychological thriller about an FBI agent interviewing a serial killer",
    difficulty: "advanced",
    category: "Movies",
    explanation: "The shushing emoji represents silence, and the ram and sheep represent the lambs."
  },
  {
    emojis: "🧑‍🌾🚀🪐",
    answer: "Interstellar",
    clue: "Epic sci-fi movie about astronauts searching for a new home for humanity",
    difficulty: "advanced",
    category: "Movies",
    explanation: "The farmer represents Cooper, and the rocket and planet represent space exploration through a wormhole."
  },
  {
    emojis: "🎭🃏🦇",
    answer: "The Dark Knight",
    clue: "Superhero movie about Batman battling the chaotic Joker",
    difficulty: "advanced",
    category: "Movies",
    explanation: "The mask represents Batman, the joker card represents Joker, and the bat represents Gotham's hero."
  },
  {
    emojis: "🎻👨‍👦💼",
    answer: "The Godfather",
    clue: "Crime drama about a powerful Italian-American mafia family",
    difficulty: "advanced",
    category: "Movies",
    explanation: "The violin and family elements represent the famous theme song and the family business."
  },
  {
    emojis: "🕰️🍊🥛",
    answer: "A Clockwork Orange",
    clue: "Dystopian crime film about Alex and his gang of droogs",
    difficulty: "advanced",
    category: "Movies",
    explanation: "The clock, orange fruit, and glass of milk represent the title and the iconic milk bar scene."
  },

  // --- IDIOMS ---
  {
    emojis: "🍎👁️",
    answer: "Apple of my eye",
    clue: "An idiom meaning someone who is cherished above all others",
    difficulty: "beginner",
    category: "Idioms",
    explanation: "The apple and the eye combine literally to represent this expression of affection."
  },
  {
    emojis: "🧩🍰",
    answer: "Piece of cake",
    clue: "An idiom meaning something that is extremely easy to complete",
    difficulty: "beginner",
    category: "Idioms",
    explanation: "The puzzle piece represents a 'piece' and the cake represents a dessert, forming 'piece of cake'."
  },
  {
    emojis: "⏱️✈️",
    answer: "Time flies",
    clue: "An idiom expressing that time passes surprisingly quickly",
    difficulty: "beginner",
    category: "Idioms",
    explanation: "The stopwatch represents time, and the airplane represents flying."
  },
  {
    emojis: "🌧️🐱🐶",
    answer: "Raining cats and dogs",
    clue: "An idiom describing a heavy downpour of rain",
    difficulty: "beginner",
    category: "Idioms",
    explanation: "The rain cloud combined with a cat and dog represents this common weather expression."
  },
  {
    emojis: "🐱💼🤫",
    answer: "Let the cat out of the bag",
    clue: "An idiom that means to accidentally reveal a secret",
    difficulty: "beginner",
    category: "Idioms",
    explanation: "The cat, the briefcase (bag), and the shushing face represent revealing a secret."
  },
  {
    emojis: "💰🌳🚫",
    answer: "Money doesn't grow on trees",
    clue: "An idiom warning that money is limited and must be earned",
    difficulty: "beginner",
    category: "Idioms",
    explanation: "The money bag, tree, and prohibited sign represent that money is not grew on branches."
  },
  {
    emojis: "🥚🧺❌",
    answer: "Don't put all your eggs in one basket",
    clue: "An idiom warning against putting all your resources in one single option",
    difficulty: "beginner",
    category: "Idioms",
    explanation: "The egg, basket, and red X represent not consolidating all risks."
  },
  {
    emojis: "🗣️👹👿",
    answer: "Speak of the devil",
    clue: "An idiom used when someone appears right as they are being mentioned",
    difficulty: "beginner",
    category: "Idioms",
    explanation: "The speaking mouth and devil emojis represent mentioning the devil."
  },
  {
    emojis: "🛏️🛏️🛏️",
    answer: "Hit the sack",
    clue: "An idiom that simply means going to sleep or going to bed",
    difficulty: "beginner",
    category: "Idioms",
    explanation: "The beds represent sleeping or going to bed."
  },
  {
    emojis: "🤫🤐🔑",
    answer: "Under lock and key",
    clue: "An idiom meaning securely locked up or stored away safely",
    difficulty: "beginner",
    category: "Idioms",
    explanation: "The key and locked padlock represent storing secrets safely."
  },
  {
    emojis: "🔔🔊🔔",
    answer: "Ring a bell",
    clue: "An idiom meaning to sound familiar or bring back a memory",
    difficulty: "beginner",
    category: "Idioms",
    explanation: "The bells and speaker represent making a familiar sound."
  },
  {
    emojis: "🤫🐱🗣️",
    answer: "Cat got your tongue",
    clue: "An idiom used when someone is unusually quiet and refuses to speak",
    difficulty: "intermediate",
    category: "Idioms",
    explanation: "The shushing, cat, and speaking face represent a cat stealing your ability to speak."
  },
  {
    emojis: "🥶👣",
    answer: "Cold feet",
    clue: "An idiom meaning to become nervous or hesitant about a planned event",
    difficulty: "intermediate",
    category: "Idioms",
    explanation: "The cold face and feet literally represent getting 'cold feet'."
  },
  {
    emojis: "💰🦵💪",
    answer: "Cost an arm and a leg",
    clue: "An idiom meaning that something is extremely expensive",
    difficulty: "intermediate",
    category: "Idioms",
    explanation: "The money bag, leg, and flexed arm stand for costing an arm and a leg."
  },
  {
    emojis: "💔🧊",
    answer: "Break the ice",
    clue: "An idiom meaning to start a conversation to ease tension in a social setting",
    difficulty: "intermediate",
    category: "Idioms",
    explanation: "The broken heart represents breaking, and the ice cube represents ice."
  },
  {
    emojis: "🥈🦎🌲",
    answer: "Sour grapes",
    clue: "An idiom meaning pretending to dislike something because you cannot have it",
    difficulty: "intermediate",
    category: "Idioms",
    explanation: "The medal, lizard (representing crawling/jealousy), and green tree represent false claims of dislike."
  },
  {
    emojis: "🔥🍟🥔",
    answer: "Hot potato",
    clue: "An idiom referring to a controversial issue that is passed around and avoided",
    difficulty: "intermediate",
    category: "Idioms",
    explanation: "The fire, fries, and potato represent a potato that is too hot to hold."
  },
  {
    emojis: "👀👃👂",
    answer: "Hear no evil see no evil",
    clue: "An idiom representing turning a blind eye to wrongdoing",
    difficulty: "intermediate",
    category: "Idioms",
    explanation: "The eyes, nose, and ear represent censoring your senses to stay out of trouble."
  },
  {
    emojis: "🧊🏔️🔝",
    answer: "Tip of the iceberg",
    clue: "An idiom meaning a small visible part of a much larger problem",
    difficulty: "intermediate",
    category: "Idioms",
    explanation: "The ice cube, mountain, and top indicator represent the tip of an iceberg."
  },
  {
    emojis: "🚶☁️9️⃣",
    answer: "On cloud nine",
    clue: "An idiom meaning to feel extremely happy, joyful, or proud",
    difficulty: "intermediate",
    category: "Idioms",
    explanation: "The walking person, cloud, and number 9 represent being on cloud nine."
  },
  {
    emojis: "⚡🪱🐦",
    answer: "The early bird catches the worm",
    clue: "An idiom indicating that success comes to those who prepare and act early",
    difficulty: "intermediate",
    category: "Idioms",
    explanation: "The lightning (early), worm, and bird represent the proverb."
  },
  {
    emojis: "🤫🤫🤐",
    answer: "Keep it under your hat",
    clue: "An idiom meaning to keep a piece of information secret and confidential",
    difficulty: "intermediate",
    category: "Idioms",
    explanation: "The shushing faces and zipper-mouth represent keeping things under a hat."
  },
  {
    emojis: "🧂🩹🤕",
    answer: "Rub salt in the wound",
    clue: "An idiom meaning to make a painful situation even worse for someone",
    difficulty: "intermediate",
    category: "Idioms",
    explanation: "The salt shaker, bandage, and injured face represent aggravating pain."
  },
  {
    emojis: "🔔💤🐕",
    answer: "Let sleeping dogs lie",
    clue: "An idiom meaning to leave a situation alone to avoid creating trouble",
    difficulty: "advanced",
    category: "Idioms",
    explanation: "The sleeping symbol and dog represent letting a sleeping dog rest undisturbed."
  },
  {
    emojis: "🔥⛵🌉",
    answer: "Burn your bridges",
    clue: "An idiom meaning to permanently destroy a relationship or path of retreat",
    difficulty: "advanced",
    category: "Idioms",
    explanation: "The fire represents burning, and the bridge represents your connection to safety."
  },
  {
    emojis: "💧🪣",
    answer: "A drop in the bucket",
    clue: "An idiom representing a tiny, insignificant amount compared to what is needed",
    difficulty: "advanced",
    category: "Idioms",
    explanation: "The water droplet represents a drop, and the bucket represents the container."
  },
  {
    emojis: "👹🗣️🛡️",
    answer: "Devil's advocate",
    clue: "An idiom meaning to take an opposing position for the sake of debate",
    difficulty: "advanced",
    category: "Idioms",
    explanation: "The ogre represents the devil, and the speaking face with shield represents defense/advocacy."
  },
  {
    emojis: "🔔🐈🐱",
    answer: "Bell the cat",
    clue: "An idiom meaning to undertake a highly dangerous task for the common good",
    difficulty: "advanced",
    category: "Idioms",
    explanation: "The bell and the cat represent the fable of mice attempting to bell a cat."
  },
  {
    emojis: "🦢🎶🎵",
    answer: "Swan song",
    clue: "An idiom referring to a final performance or effort before death or retirement",
    difficulty: "advanced",
    category: "Idioms",
    explanation: "The swan, music notes, and melody represent the final song of a dying swan."
  },
  {
    emojis: "📚🌲🌲",
    answer: "Can't see the forest for the trees",
    clue: "An idiom meaning unable to understand the big picture because of focusing on small details",
    difficulty: "advanced",
    category: "Idioms",
    explanation: "The books (knowledge) and trees represent missing the whole forest for individual details."
  },
  {
    emojis: "🏊‍♂️🦈🌊",
    answer: "Swimming with sharks",
    clue: "An idiom meaning engaging in dangerous actions with highly competitive people",
    difficulty: "advanced",
    category: "Idioms",
    explanation: "The swimmer, shark, and water represent putting yourself in dangerous company."
  },
  {
    emojis: "🐎👄🗣️",
    answer: "Straight from the horse's mouth",
    clue: "An idiom meaning from the highest authority or original source",
    difficulty: "advanced",
    category: "Idioms",
    explanation: "The horse, lips, and speaking face represent information coming directly from the horse's mouth."
  },

  // --- EVERYDAY ACTIVITIES ---
  {
    emojis: "🦷🪥",
    answer: "Brushing teeth",
    clue: "A daily hygiene routine for keeping your mouth clean",
    difficulty: "beginner",
    category: "Everyday Activities",
    explanation: "The tooth and toothbrush clearly illustrate the act of brushing your teeth."
  },
  {
    emojis: "🛁🚿",
    answer: "Taking a shower",
    clue: "A daily hygiene routine of washing your body with water",
    difficulty: "beginner",
    category: "Everyday Activities",
    explanation: "The bathtub and shower head show the act of taking a bath or shower."
  },
  {
    emojis: "🍳🥚",
    answer: "Cooking eggs",
    clue: "Preparing a simple breakfast meal on the stove",
    difficulty: "beginner",
    category: "Everyday Activities",
    explanation: "The frying pan cooking an egg represents preparing breakfast eggs."
  },
  {
    emojis: "📚🤓",
    answer: "Reading books",
    clue: "Learning or enjoying stories by studying written pages",
    difficulty: "beginner",
    category: "Everyday Activities",
    explanation: "The stack of books and the nerd face represent reading and studying."
  },
  {
    emojis: "🛏️\uD83E\uDDF5✨",
    answer: "Making the bed",
    clue: "Neatening the sheets and pillows on your sleeping setup each morning",
    difficulty: "beginner",
    category: "Everyday Activities",
    explanation: "The bed and sparkles represent organizing your bed neatly."
  },
  {
    emojis: "🌿🚿🌻",
    answer: "Watering plants",
    clue: "Pouring water on soil to help garden vegetation grow",
    difficulty: "beginner",
    category: "Everyday Activities",
    explanation: "The herb, shower head, and sunflower represent feeding plants water."
  },
  {
    emojis: "🍳🥞🥓",
    answer: "Cooking breakfast",
    clue: "Preparing morning food like pancakes, bacon, and eggs",
    difficulty: "beginner",
    category: "Everyday Activities",
    explanation: "The pan, pancakes, and bacon represent preparing the first meal of the day."
  },
  {
    emojis: "🏃‍♂️🎧👟",
    answer: "Going for a run",
    clue: "Exercising by jogging outdoors while wearing running shoes and listening to music",
    difficulty: "beginner",
    category: "Everyday Activities",
    explanation: "The running person, headphones, and athletic sneaker show going for a run."
  },
  {
    emojis: "🗑️🚮🚛",
    answer: "Taking out the trash",
    clue: "Emptying garbage bins and carrying waste to the outside dumpster",
    difficulty: "beginner",
    category: "Everyday Activities",
    explanation: "The bin, waste disposal symbol, and garbage truck show disposing of trash."
  },
  {
    emojis: "🍽️🧼🧽",
    answer: "Washing dishes",
    clue: "Cleaning used plates, forks, and bowls in the kitchen sink",
    difficulty: "beginner",
    category: "Everyday Activities",
    explanation: "The plate, soap bubbles, and sponge represent cleaning dinnerware."
  },
  {
    emojis: "🍕📞🚚",
    answer: "Ordering pizza",
    clue: "Calling a restaurant or using an app to have hot pizza delivered to your door",
    difficulty: "beginner",
    category: "Everyday Activities",
    explanation: "The pizza slice, phone receiver, and truck show food delivery order."
  },
  {
    emojis: "🌱🏡\uD83E\uDDF5",
    answer: "Gardening",
    clue: "Planting seeds, pulling weeds, and maintaining a backyard flowerbed",
    difficulty: "beginner",
    category: "Everyday Activities",
    explanation: "The seedling, house, and utility string show backyard yard work."
  },
  {
    emojis: "😴💤⏰",
    answer: "Setting an alarm",
    clue: "Adjusting your clock to wake you up at a specific time in the morning",
    difficulty: "beginner",
    category: "Everyday Activities",
    explanation: "The sleeping face, zzz symbols, and alarm clock show setting wake up times."
  },
  {
    emojis: "🎂🎁🎉",
    answer: "Celebrating a birthday",
    clue: "Blowing out candles, opening presents, and singing for a birthday party",
    difficulty: "beginner",
    category: "Everyday Activities",
    explanation: "The birthday cake, gift, and party popper represent birthday parties."
  },
  {
    emojis: "🛒🥦🍎",
    answer: "Grocery shopping",
    clue: "Buying food and fresh produce at a supermarket",
    difficulty: "intermediate",
    category: "Everyday Activities",
    explanation: "The shopping cart, broccoli, and red apple represent buying groceries."
  },
  {
    emojis: "🧺👚🧼",
    answer: "Doing laundry",
    clue: "Washing dirty clothes using soap and a washing machine",
    difficulty: "intermediate",
    category: "Everyday Activities",
    explanation: "The laundry basket, clothes, and soap bar show the process of cleaning clothes."
  },
  {
    emojis: "🚶🐕🐾",
    answer: "Walking the dog",
    clue: "Taking a pet dog out for exercise and fresh air",
    difficulty: "intermediate",
    category: "Everyday Activities",
    explanation: "The walking person, dog, and paw prints represent taking a pet for a walk."
  },
  {
    emojis: "🚗🚿💦",
    answer: "Washing the car",
    clue: "Cleaning a motor vehicle using water and soap",
    difficulty: "intermediate",
    category: "Everyday Activities",
    explanation: "The automobile, shower droplets, and water represent cleaning a car."
  },
  {
    emojis: "💇‍♂️✂️💈",
    answer: "Getting a haircut",
    clue: "Visiting a barber shop to trim or style your hair",
    difficulty: "intermediate",
    category: "Everyday Activities",
    explanation: "The man getting hair cut, scissors, and barber pole show styling hair."
  },
  {
    emojis: "🚗⛽💸",
    answer: "Pumping gas",
    clue: "Refilling a car's fuel tank with petrol at a service station",
    difficulty: "intermediate",
    category: "Everyday Activities",
    explanation: "The car, gas pump, and flying money represent buying fuel."
  },
  {
    emojis: "✈️🧳🎫",
    answer: "Packing a suitcase",
    clue: "Putting clothes and items into a travel bag before a flight",
    difficulty: "intermediate",
    category: "Everyday Activities",
    explanation: "The airplane, luggage bag, and ticket show preparing to travel."
  },
  {
    emojis: "🧹💨🧼",
    answer: "Vacuuming the floor",
    clue: "Using a mechanical vacuum cleaner to suck up dust from carpets",
    difficulty: "intermediate",
    category: "Everyday Activities",
    explanation: "The broom, gust of wind, and soap represent vacuuming and cleaning floors."
  },
  {
    emojis: "🚉🎫🏃",
    answer: "Catching a train",
    clue: "Running to the railway platform with a ticket before the train departs",
    difficulty: "intermediate",
    category: "Everyday Activities",
    explanation: "The train station, transit ticket, and running person show catching the train."
  },
  {
    emojis: "🔑🚗🛣️",
    answer: "Driving to work",
    clue: "Commuting to your office job behind the wheel of an automobile",
    difficulty: "intermediate",
    category: "Everyday Activities",
    explanation: "The keys, car, and motorway show driving to a work shift."
  },
  {
    emojis: "🏋️‍♂️💪🥛",
    answer: "Working out",
    clue: "Lifting weights at the gym and drinking a protein shake",
    difficulty: "intermediate",
    category: "Everyday Activities",
    explanation: "The weight lifter, strong biceps, and glass of milk represent fitness exercise."
  },
  {
    emojis: "🎸🎶🧑‍🎤",
    answer: "Practicing guitar",
    clue: "Strumming musical chords on a string instrument to learn a song",
    difficulty: "intermediate",
    category: "Everyday Activities",
    explanation: "The guitar, musical notes, and singer represent musical rehearsal."
  },
  {
    emojis: "🛋️🥔📺",
    answer: "Couch potatoing",
    clue: "Lazing around on the sofa watching TV for hours",
    difficulty: "advanced",
    category: "Everyday Activities",
    explanation: "The sofa, potato, and television represent being a lazy couch potato."
  },
  {
    emojis: "💻📧🔥",
    answer: "Answering emails",
    clue: "Replying to office messages and digital work correspondence",
    difficulty: "advanced",
    category: "Everyday Activities",
    explanation: "The laptop and envelope represent emails, and the fire represents handling them quickly."
  },
  {
    emojis: "🧘🧘‍♂️🍃",
    answer: "Meditating",
    clue: "Mindfulness activity involving deep breathing and quiet concentration",
    difficulty: "advanced",
    category: "Everyday Activities",
    explanation: "The meditating people and blowing leaves represent peace, mindfulness, and breathing."
  },
  {
    emojis: "📦🚚🏠",
    answer: "Moving house",
    clue: "Relocating belongings from an old home to a new address",
    difficulty: "advanced",
    category: "Everyday Activities",
    explanation: "The moving box, delivery truck, and new house represent relocating households."
  },
  {
    emojis: "🌅☕📰",
    answer: "Reading morning news",
    clue: "Drinking coffee and studying a newspaper as the sun rises",
    difficulty: "advanced",
    category: "Everyday Activities",
    explanation: "The sunrise, coffee cup, and newspaper represent morning routines."
  },
  {
    emojis: "💻🎨🧑‍💻",
    answer: "Coding a website",
    clue: "Writing software scripts on a computer to build dynamic web layouts",
    difficulty: "advanced",
    category: "Everyday Activities",
    explanation: "The laptop, art palette, and computer programmer represent website creation."
  },

  // --- FAMOUS PLACES ---
  {
    emojis: "🗼🇫🇷",
    answer: "Eiffel Tower",
    clue: "A famous iron lattice tower located in Paris",
    difficulty: "beginner",
    category: "Famous Places",
    explanation: "The Tokyo tower emoji (used as Eiffel Tower) and the French flag represent Paris's iconic landmark."
  },
  {
    emojis: "🗽🇺🇸",
    answer: "Statue of Liberty",
    clue: "A large copper statue on Liberty Island in New York harbor",
    difficulty: "beginner",
    category: "Famous Places",
    explanation: "The Statue of Liberty and USA flag represent the famous monument in New York."
  },
  {
    emojis: "🧱🇨🇳",
    answer: "Great Wall of China",
    clue: "An ancient stone defensive wall built across northern historical borders",
    difficulty: "beginner",
    category: "Famous Places",
    explanation: "The brick wall and the Chinese flag stand for the Great Wall."
  },
  {
    emojis: "🏛️🇬🇷",
    answer: "Parthenon",
    clue: "A famous ancient temple on the Acropolis in Athens",
    difficulty: "beginner",
    category: "Famous Places",
    explanation: "The classical Greek temple columns and Greek flag represent the Parthenon."
  },
  {
    emojis: "🏔️🗻🏔️",
    answer: "Mount Everest",
    clue: "The highest mountain peak in the world, located in the Himalayas",
    difficulty: "beginner",
    category: "Famous Places",
    explanation: "The snowy mountains and Fuji peak represent Mount Everest's high summit."
  },
  {
    emojis: "🌉🌁🇺🇸",
    answer: "Golden Gate Bridge",
    clue: "A massive, famous orange suspension bridge in San Francisco",
    difficulty: "beginner",
    category: "Famous Places",
    explanation: "The bridge, fog, and USA flag represent San Francisco's Golden Gate."
  },
  {
    emojis: "🏰🐭🇺🇸",
    answer: "Disneyland",
    clue: "A world-famous magical family theme park created by Walt Disney",
    difficulty: "beginner",
    category: "Famous Places",
    explanation: "The fairytale castle, mouse face, and American flag show Disneyland."
  },
  {
    emojis: "🏛️🇮🇹🏛️",
    answer: "Leaning Tower of Pisa",
    clue: "A famous freestanding bell tower in Italy known for its unintended tilt",
    difficulty: "beginner",
    category: "Famous Places",
    explanation: "The columns, Italian elements, and tilting structure represent the Pisa tower."
  },
  {
    emojis: "🔔🗼🇬🇧",
    answer: "Big Ben",
    clue: "The nickname for the Great Bell of the striking clock tower in London",
    difficulty: "beginner",
    category: "Famous Places",
    explanation: "The bell, tower, and British flag represent the famous clock tower."
  },
  {
    emojis: "🌴🏨🇲🇻",
    answer: "Maldives Resorts",
    clue: "Remote tropical islands with overwater bungalows and coral reefs",
    difficulty: "beginner",
    category: "Famous Places",
    explanation: "The palm tree and ocean hotel represent tropical resort bungalows."
  },
  {
    emojis: "🦘🎭🇦🇺",
    answer: "Sydney Opera House",
    clue: "A multi-venue performing arts centre with sail-like structures in Australia",
    difficulty: "intermediate",
    category: "Famous Places",
    explanation: "The kangaroo, theater masks, and Australian flag represent the Sydney Opera House."
  },
  {
    emojis: "🕌🇮🇳",
    answer: "Taj Mahal",
    clue: "An iconic white marble dome-topped mausoleum in Agra",
    difficulty: "intermediate",
    category: "Famous Places",
    explanation: "The mosque-like dome and the Indian flag represent the Taj Mahal."
  },
  {
    emojis: "🏔️🗻🇯🇵",
    answer: "Mount Fuji",
    clue: "An active volcano and sacred mountain close to Tokyo",
    difficulty: "intermediate",
    category: "Famous Places",
    explanation: "The snow-capped peak, Mount Fuji emoji, and Japanese flag represent this landmark."
  },
  {
    emojis: "🎡🇬🇧🕵️",
    answer: "London Eye",
    clue: "A giant observation wheel on the River Thames in London",
    difficulty: "intermediate",
    category: "Famous Places",
    explanation: "The Ferris wheel, British flag, and detective (Sherlock Holmes) represent London."
  },
  {
    emojis: "🎪🎰🇺🇸",
    answer: "Las Vegas Strip",
    clue: "A famous boulevard in Nevada known for its glittering casinos and nightlife",
    difficulty: "intermediate",
    category: "Famous Places",
    explanation: "The circus tent, slot machine, and USA flag represent the Las Vegas Strip."
  },
  {
    emojis: "🌊🏜️🇪🇬",
    answer: "Giza Pyramids",
    clue: "Ancient monumental stone structures built in the desert for Egyptian pharaohs",
    difficulty: "intermediate",
    category: "Famous Places",
    explanation: "The water, sand desert, and Egypt flag represent the Pyramids on the Nile."
  },
  {
    emojis: "🏰🧛🇷🇴",
    answer: "Bran Castle",
    clue: "A historic fortress in Transylvania, Romania, famous as Dracula's castle",
    difficulty: "intermediate",
    category: "Famous Places",
    explanation: "The medieval castle, vampire, and Romanian elements represent Bran Castle."
  },
  {
    emojis: "🗿🗽🇨🇦",
    answer: "Niagara Falls",
    clue: "Massive waterfalls located on the border between New York and Ontario",
    difficulty: "intermediate",
    category: "Famous Places",
    explanation: "The Moai stone head, statue, and Canadian flag represent Niagara's waterfalls."
  },
  {
    emojis: "⛰️🗿🇺🇸",
    answer: "Mount Rushmore",
    clue: "A mountain sculpture of four US presidents carved into South Dakota granite",
    difficulty: "intermediate",
    category: "Famous Places",
    explanation: "The mountain peak and stone statues represent Mount Rushmore presidential faces."
  },
  {
    emojis: "🔴🏛️🇷🇺",
    answer: "Red Square",
    clue: "A famous central city square in Moscow near the Kremlin",
    difficulty: "intermediate",
    category: "Famous Places",
    explanation: "The red circle and Kremlin temple dome show Moscow's historic square."
  },
  {
    emojis: "🏯🌸🇯🇵",
    answer: "Himeji Castle",
    clue: "A spectacular hilltop Japanese castle complex located in Hyogo",
    difficulty: "intermediate",
    category: "Famous Places",
    explanation: "The Japanese castle and cherry blossom represent Himeji."
  },
  {
    emojis: "🐫🏛️🇯🇴",
    answer: "Petra",
    clue: "A famous archaeological city carved into red sandstone cliffs in the desert",
    difficulty: "advanced",
    category: "Famous Places",
    explanation: "The camel, ancient building, and Jordanian flag represent the ancient city of Petra."
  },
  {
    emojis: "🧗⛰️🇵🇪",
    answer: "Machu Picchu",
    clue: "A 15th-century Incan citadel situated in the Andes mountain range",
    difficulty: "advanced",
    category: "Famous Places",
    explanation: "The climber, mountain peak, and Peruvian flag represent Machu Picchu."
  },
  {
    emojis: "🏟️🦁🇮🇹",
    answer: "Colosseum",
    clue: "A massive stone amphitheatre built in Rome under the Flavian emperors",
    difficulty: "advanced",
    category: "Famous Places",
    explanation: "The stadium, lion (representing gladiator battles), and Italian flag represent the Colosseum."
  },
  {
    emojis: "🗿🗿🇨🇱",
    answer: "Easter Island",
    clue: "A remote volcanic territory famous for its giant monolithic stone statues",
    difficulty: "advanced",
    category: "Famous Places",
    explanation: "The moai statues and the Chilean flag represent Easter Island."
  },
  {
    emojis: "🧗⛰️🌋",
    answer: "Mount Kilimanjaro",
    clue: "A dormant volcano in Tanzania and the highest free-standing mountain in the world",
    difficulty: "advanced",
    category: "Famous Places",
    explanation: "The climber, mountain, and active volcano represent the famous Tanzanian peak."
  },
  {
    emojis: "🎭🎭🇧🇷",
    answer: "Rio de Janeiro Carnival",
    clue: "A massive festive parade with samba music, dancers, and costumes in Brazil",
    difficulty: "advanced",
    category: "Famous Places",
    explanation: "The theater masks and Brazil flag represent the Carnival of Rio."
  },
  {
    emojis: "⛲⛲🏛️",
    answer: "Trevi Fountain",
    clue: "A spectacular Baroque stone fountain in Rome where tourists throw coins",
    difficulty: "advanced",
    category: "Famous Places",
    explanation: "The fountains and Italian stone monument represent the Trevi Fountain."
  },
  {
    emojis: "🌊🏔️🚢",
    answer: "Panama Canal",
    clue: "An artificial waterway in Central America connecting the Atlantic and Pacific oceans",
    difficulty: "advanced",
    category: "Famous Places",
    explanation: "The sea wave, mountain peaks, and cargo ship represent the shipping canal."
  },
  {
    emojis: "🏛️🕌🇹🇷",
    answer: "Hagia Sophia",
    clue: "A historic place of worship in Istanbul with a massive Byzantine dome",
    difficulty: "advanced",
    category: "Famous Places",
    explanation: "The classical column, mosque dome, and Turkish flag represent Istanbul's landmark."
  },
  {
    emojis: "🏰🏔️🇩🇪",
    answer: "Neuschwanstein Castle",
    clue: "A fairytale Romanesque Revival palace on a rugged hill in Bavaria",
    difficulty: "advanced",
    category: "Famous Places",
    explanation: "The castle, mountains, and German flag represent Neuschwanstein Castle."
  },
  {
    emojis: "🛕🌾🇮🇩",
    answer: "Borobudur Temple",
    clue: "A famous 9th-century Buddhist temple complex in Central Java",
    difficulty: "advanced",
    category: "Famous Places",
    explanation: "The religious temple, rice ear, and Indonesian flag represent Borobudur."
  },

  // --- OBJECTS ---
  {
    emojis: "⏰🔊",
    answer: "Alarm clock",
    clue: "A timekeeping device set to make a loud sound at a specific hour",
    difficulty: "beginner",
    category: "Objects",
    explanation: "The clock and speaker represent an alarm that rings to wake you up."
  },
  {
    emojis: "📱🎧",
    answer: "Smart phone",
    clue: "A portable cellular device used for calling, internet, and music",
    difficulty: "beginner",
    category: "Objects",
    explanation: "The mobile phone and headphones represent a smartphone device."
  },
  {
    emojis: "🌂🌧",
    answer: "Umbrella",
    clue: "A collapsible canopy designed for protection against downpours",
    difficulty: "beginner",
    category: "Objects",
    explanation: "The closed umbrella and rain droplets show a tool used for rainy weather."
  },
  {
    emojis: "🕶️☀️",
    answer: "Sunglasses",
    clue: "Dark-tinted eyewear designed to shield the eyes from solar glare",
    difficulty: "beginner",
    category: "Objects",
    explanation: "The sunglasses and sun represent glasses worn in sunny weather."
  },
  {
    emojis: "💳💰💼",
    answer: "Credit card",
    clue: "A plastic card issued by a bank allowing you to purchase items on debt",
    difficulty: "beginner",
    category: "Objects",
    explanation: "The credit card, bag of money, and briefcase represent electronic money cards."
  },
  {
    emojis: "🔦🔋👻",
    answer: "Flashlight",
    clue: "A battery-powered portable light source used to illuminate dark areas",
    difficulty: "beginner",
    category: "Objects",
    explanation: "The flashlight, battery, and ghost represent finding your way in the dark."
  },
  {
    emojis: "🪞👩‍🦰✨",
    answer: "Mirror",
    clue: "A reflective surface made of glass that shows your reflection clearly",
    difficulty: "beginner",
    category: "Objects",
    explanation: "The hand mirror, woman, and sparkles represent checking your reflection."
  },
  {
    emojis: "🖨️📄💼",
    answer: "Printer",
    clue: "An office machine that reproduces digital documents and text onto paper sheets",
    difficulty: "beginner",
    category: "Objects",
    explanation: "The printer and printed page represent office printing equipment."
  },
  {
    emojis: "🧱🎨🖌️",
    answer: "Paintbrush",
    clue: "A tool with bristles used by artists to apply paint to canvases or walls",
    difficulty: "beginner",
    category: "Objects",
    explanation: "The brick wall, art palette, and paintbrush represent painting."
  },
  {
    emojis: "🔑🔒📦",
    answer: "Padlock",
    clue: "A detachable lock hanging by a shackle to secure doors, gates, or chests",
    difficulty: "beginner",
    category: "Objects",
    explanation: "The key and locked padlock represent locking storage items."
  },
  {
    emojis: "⌚💎👑",
    answer: "Wrist watch",
    clue: "A small portable clock worn on a strap around the wrist",
    difficulty: "beginner",
    category: "Objects",
    explanation: "The watch, diamond, and crown represent premium wrist chronometers."
  },
  {
    emojis: "🕯️🔥🕯️",
    answer: "Candle",
    clue: "A cylinder of wax with a central wick that is lit to provide light",
    difficulty: "beginner",
    category: "Objects",
    explanation: "The candles and fire show wax sticks burnt for illumination."
  },
  {
    emojis: "✂️📄🧵",
    answer: "Scissors",
    clue: "An instrument with two sharp blades used for cutting paper, cloth, or string",
    difficulty: "beginner",
    category: "Objects",
    explanation: "The scissors, document, and sewing thread show cutting utilities."
  },
  {
    emojis: "📸🎞️🏜️",
    answer: "Photo camera",
    clue: "A device with a lens used to capture and record photographs of landscapes",
    difficulty: "beginner",
    category: "Objects",
    explanation: "The camera, film frame, and desert show landscape photography."
  },
  {
    emojis: "🧴☀️🏖️",
    answer: "Sunscreen lotion",
    clue: "A protective cream rubbed on the skin to shield against solar burns",
    difficulty: "beginner",
    category: "Objects",
    explanation: "The lotion bottle, sun, and beach represent UV protection creams."
  },
  {
    emojis: "🎙️🔊🎙️",
    answer: "Microphone",
    clue: "An acoustic sensor instrument that captures and amplifies vocal audio",
    difficulty: "beginner",
    category: "Objects",
    explanation: "The studio micro and speakers show sound recording gear."
  },
  {
    emojis: "💻🖱️",
    answer: "Computer mouse",
    clue: "A hand-held pointing device used to navigate a screen",
    difficulty: "intermediate",
    category: "Objects",
    explanation: "The laptop and computer mouse represent an input mouse."
  },
  {
    emojis: "☕🏺",
    answer: "Coffee mug",
    clue: "A heavy ceramic cup with a handle, used for hot beverages",
    difficulty: "intermediate",
    category: "Objects",
    explanation: "The hot beverage cup and urn represent a mug of coffee."
  },
  {
    emojis: "🔑🚪",
    answer: "Door key",
    clue: "A metal instrument used to lock or unlock an entrance",
    difficulty: "intermediate",
    category: "Objects",
    explanation: "The key and closed door show a key used to open a door."
  },
  {
    emojis: "🎒📚",
    answer: "School backpack",
    clue: "A bag carried on the back, filled with learning supplies",
    difficulty: "intermediate",
    category: "Objects",
    explanation: "The school bag and books stand for a backpack used for school."
  },
  {
    emojis: "🩺🏥🧑‍⚕️",
    answer: "Stethoscope",
    clue: "A medical instrument used by doctors to listen to heartbeats and breathing",
    difficulty: "intermediate",
    category: "Objects",
    explanation: "The stethoscope, hospital building, and medical doctor represent diagnostics."
  },
  {
    emojis: "🎸🎛️🔌",
    answer: "Electric guitar",
    clue: "A guitar that requires an amplifier to produce audible musical volume",
    difficulty: "intermediate",
    category: "Objects",
    explanation: "The guitar, amplifier dial, and power plug represent amplified instruments."
  },
  {
    emojis: "🔨🔩🪜",
    answer: "Tool box",
    clue: "A portable container filled with hand tools like hammers, screws, and ladders",
    difficulty: "intermediate",
    category: "Objects",
    explanation: "The hammer, screw, and ladder represent repair equipment packages."
  },
  {
    emojis: "🧺🥪🌳",
    answer: "Picnic basket",
    clue: "A woven wicker container packed with sandwiches and food for a park trip",
    difficulty: "intermediate",
    category: "Objects",
    explanation: "The basket, sandwich, and park tree represent outdoor dining baskets."
  },
  {
    emojis: "🚁🎮📡",
    answer: "Drone",
    clue: "A remotely controlled pilotless flying quadcopter with camera sensors",
    difficulty: "intermediate",
    category: "Objects",
    explanation: "The helicopter, game controller, and satellite dish represent remote flight gadgets."
  },
  {
    emojis: "🌡️🤒🏥",
    answer: "Thermometer",
    clue: "An instrument used to measure body temperature and check for high fevers",
    difficulty: "intermediate",
    category: "Objects",
    explanation: "The medical thermometer, sick face, and hospital show fever sensors."
  },
  {
    emojis: "⏳📜",
    answer: "Hourglass",
    clue: "An ancient device measuring elapsed time using sand flow",
    difficulty: "advanced",
    category: "Objects",
    explanation: "The hourglass and scroll represent an antique timekeeping object."
  },
  {
    emojis: "🔎🗺️",
    answer: "Magnifying glass",
    clue: "A convex lens used to view small details or maps closely",
    difficulty: "advanced",
    category: "Objects",
    explanation: "The magnifying glass pointing left and world map represent a detective's reading glass."
  },
  {
    emojis: "🧭🧲",
    answer: "Compass",
    clue: "An orientation tool with a magnetized pointer showing north",
    difficulty: "advanced",
    category: "Objects",
    explanation: "The navigation compass and magnet represent a magnetic compass object."
  },
  {
    emojis: "🔭🌌",
    answer: "Telescope",
    clue: "A tubular optical instrument used to view distant space stars",
    difficulty: "advanced",
    category: "Objects",
    explanation: "The telescope and milky way galaxy show an instrument for stargazing."
  },
  {
    emojis: "⚖️🏛️📜",
    answer: "Scales of justice",
    clue: "A symbol representing fairness, objective law, and court evaluation",
    difficulty: "advanced",
    category: "Objects",
    explanation: "The balance scales, classical building, and legal scroll show courtroom scales."
  },
  {
    emojis: "🪶📜✍️",
    answer: "Quill pen",
    clue: "An antique writing tool made from a bird's flight feather dipped in ink",
    difficulty: "advanced",
    category: "Objects",
    explanation: "The feather, ancient scroll, and writing hand represent historic calligraphy."
  }
];
