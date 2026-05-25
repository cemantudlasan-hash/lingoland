const fs = require('fs');
const path = require('path');

const explorationPath = path.join(__dirname, 'src/components/games/exploration-quest-3d.tsx');
const livingPuzzlesPath = path.join(__dirname, 'src/components/games/living-puzzles-3d.tsx');
const characterConversationsPath = path.join(__dirname, 'src/components/games/character-conversations-3d.tsx');

// Exploration Quest 3D
let expCode = fs.readFileSync(explorationPath, 'utf8');

const newObjects = `
const KITCHEN_OBJECTS: QuestItem[] = [
  { id: 'fridge', name: 'Refrigerator', emoji: '❄️', description: 'A large appliance used to keep food cold.', phonetics: '/rɪˈfrɪdʒəreɪtər/', rotateY: 0, translateX: -200, translateY: -80, translateZ: -200, width: '130px', height: '200px', color: 'from-blue-600 to-indigo-800 border-blue-400' },
  { id: 'toaster', name: 'Toaster', emoji: '🍞', description: 'An electrical appliance used to brown bread.', phonetics: '/ˈtoʊstər/', rotateY: 0, translateX: 100, translateY: 50, translateZ: -200, width: '90px', height: '90px', color: 'from-amber-500 to-orange-600 border-amber-400' },
  { id: 'clock', name: 'Clock', emoji: '⏰', description: 'Used to measure and display time.', phonetics: '/klɑːk/', rotateY: -90, translateX: 250, translateY: -150, translateZ: 0, width: '100px', height: '100px', color: 'from-rose-500 to-pink-600 border-pink-400' },
  { id: 'cabinet', name: 'Cabinet', emoji: '🗄️', description: 'A cupboard with shelves for storing items.', phonetics: '/ˈkæbɪnət/', rotateY: 0, translateX: 0, translateY: -120, translateZ: -220, width: '150px', height: '100px', color: 'from-purple-500 to-violet-750 border-purple-400' },
  { id: 'sink', name: 'Sink', emoji: '🚰', description: 'A basin used for washing hands and dishes.', phonetics: '/sɪŋk/', rotateY: 90, translateX: -250, translateY: 50, translateZ: 0, width: '120px', height: '120px', color: 'from-teal-500 to-cyan-600 border-teal-400' },
  { id: 'window', name: 'Window', emoji: '🪟', description: 'An opening in a wall to let in light and air.', phonetics: '/ˈwɪndoʊ/', rotateY: 0, translateX: 180, translateY: -100, translateZ: -220, width: '130px', height: '140px', color: 'from-sky-400 to-indigo-600 border-sky-300' },
  { id: 'microwave', name: 'Microwave', emoji: '📻', description: 'Oven that cooks food very quickly.', phonetics: '/ˈmaɪkrəweɪv/', rotateY: 0, translateX: -80, translateY: 30, translateZ: -200, width: '110px', height: '80px', color: 'from-slate-500 to-slate-700 border-slate-400' },
  { id: 'blender', name: 'Blender', emoji: '🥤', description: 'Used to mix or puree food and liquids.', phonetics: '/ˈblɛndər/', rotateY: 90, translateX: -200, translateY: 120, translateZ: 80, width: '70px', height: '110px', color: 'from-fuchsia-500 to-pink-600 border-fuchsia-400' },
  { id: 'pan', name: 'Frying Pan', emoji: '🍳', description: 'A flat-bottomed pan used for frying.', phonetics: '/pæn/', rotateY: -90, translateX: 180, translateY: 80, translateZ: 100, width: '90px', height: '60px', color: 'from-zinc-700 to-zinc-900 border-zinc-500' },
  { id: 'plate', name: 'Plate', emoji: '🍽️', description: 'A flat dish from which food is eaten.', phonetics: '/pleɪt/', rotateY: 0, translateX: 30, translateY: 150, translateZ: -100, width: '100px', height: '60px', color: 'from-white to-slate-200 border-slate-300' },
  { id: 'chair', name: 'Chair', emoji: '🪑', description: 'A separate seat for one person.', phonetics: '/tʃɛər/', rotateY: 0, translateX: -100, translateY: 180, translateZ: 50, width: '100px', height: '150px', color: 'from-amber-700 to-amber-900 border-amber-600' },
  { id: 'plant', name: 'Plant', emoji: '🪴', description: 'A living organism such as a flower or shrub.', phonetics: '/plænt/', rotateY: 0, translateX: 200, translateY: 180, translateZ: -100, width: '90px', height: '130px', color: 'from-green-500 to-emerald-700 border-green-400' },
  { id: 'broom', name: 'Broom', emoji: '🧹', description: 'Used for sweeping floors.', phonetics: '/bruːm/', rotateY: 0, translateX: -180, translateY: 100, translateZ: 150, width: '60px', height: '180px', color: 'from-yellow-600 to-amber-800 border-yellow-500' },
  { id: 'trash', name: 'Trash Can', emoji: '🗑️', description: 'A container for waste.', phonetics: '/træʃ/', rotateY: 0, translateX: 150, translateY: 150, translateZ: 150, width: '90px', height: '110px', color: 'from-zinc-400 to-zinc-600 border-zinc-300' },
  { id: 'mug', name: 'Mug', emoji: '☕', description: 'A large cup, typically used for hot drinks.', phonetics: '/mʌɡ/', rotateY: 0, translateX: -30, translateY: 80, translateZ: -150, width: '60px', height: '60px', color: 'from-red-400 to-red-600 border-red-300' }
];
`;
expCode = expCode.replace(/const KITCHEN_OBJECTS[\s\S]*?\];/m, newObjects.trim());

// Remove score
expCode = expCode.replace(/const \[score, setScore\] = React\.useState\(0\);/, '');
expCode = expCode.replace(/setScore\(0\);/, '');
expCode = expCode.replace(/setScore\(prev => prev \+ 25\);/, '');

// Increase size of 3D container
expCode = expCode.replace(/max-w-\[420px\] h-\[360px\]/, 'max-w-[700px] h-[550px] min-h-[500px]');
expCode = expCode.replace(/\[perspective:1000px\]/, '[perspective:1200px]');
expCode = expCode.replace(/w-\[360px\] h-\[360px\]/, 'w-[600px] h-[600px]');
expCode = expCode.replace(/translateZ\(-150px\)/g, 'translateZ(-250px)');
expCode = expCode.replace(/translateX\(-25px\)/g, 'translateX(-50px)');
expCode = expCode.replace(/w-\[360px\] h-\[260px\]/, 'w-[600px] h-[460px]');
expCode = expCode.replace(/w-\[300px\] h-\[260px\]/, 'w-[500px] h-[460px]');
expCode = expCode.replace(/translateZ\(-175px\)/, 'translateZ(-300px)');
expCode = expCode.replace(/translateZ\(-125px\)/, 'translateZ(-200px)');
expCode = expCode.replace(/translateX\(25px\)/g, 'translateX(50px)');

// Make text bigger
expCode = expCode.replace(/text-3xl/, 'text-5xl');
expCode = expCode.replace(/text-\[10px\]/, 'text-sm mt-1');
expCode = expCode.replace(/text-\[9px\]/g, 'text-[11px]');
expCode = expCode.replace(/text-xs/, 'text-sm');

// Remove score HTML blocks
expCode = expCode.replace(/<div className="flex items-center gap-1\.5 text-xs text-amber-300[\s\S]*?<\/div>/m, '');
expCode = expCode.replace(/<div className="bg-amber-500\/10 border border-amber-500\/20[\s\S]*?<\/div>\s*<\/div>/m, '');
// Clean up {score} occurrences
expCode = expCode.replace(/\+\{score\} Lingo-Coins/g, '');

fs.writeFileSync(explorationPath, expCode);

// Living Puzzles 3D
let livCode = fs.readFileSync(livingPuzzlesPath, 'utf8');

const newPuzzles = `
const PUZZLES: PuzzleObject[] = [
  { id: 'car', name: 'Car', emoji: '🚗', letters: ['C', 'A', 'R'], animationType: 'car-drive', description: 'A road vehicle with four wheels.', color: 'from-red-500 to-rose-700' },
  { id: 'rocket', name: 'Rocket', emoji: '🚀', letters: ['R', 'O', 'C', 'K', 'E', 'T'], animationType: 'rocket-launch', description: 'A powerful spacecraft.', color: 'from-cyan-500 to-blue-700' },
  { id: 'apple', name: 'Apple', emoji: '🍎', letters: ['A', 'P', 'P', 'L', 'E'], animationType: 'car-drive', description: 'A sweet, crunchy fruit.', color: 'from-red-400 to-red-600' },
  { id: 'tree', name: 'Tree', emoji: '🌳', letters: ['T', 'R', 'E', 'E'], animationType: 'rocket-launch', description: 'A tall plant with a wooden trunk.', color: 'from-green-500 to-emerald-700' },
  { id: 'house', name: 'House', emoji: '🏠', letters: ['H', 'O', 'U', 'S', 'E'], animationType: 'car-drive', description: 'A building for human habitation.', color: 'from-amber-500 to-orange-700' },
  { id: 'boat', name: 'Boat', emoji: '⛵', letters: ['B', 'O', 'A', 'T'], animationType: 'car-drive', description: 'A small vessel for travelling on water.', color: 'from-blue-400 to-blue-600' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', letters: ['P', 'I', 'Z', 'Z', 'A'], animationType: 'rocket-launch', description: 'A savory dish of Italian origin.', color: 'from-yellow-400 to-orange-500' },
  { id: 'ghost', name: 'Ghost', emoji: '👻', letters: ['G', 'H', 'O', 'S', 'T'], animationType: 'rocket-launch', description: 'An apparition of a dead person.', color: 'from-slate-200 to-slate-400' },
  { id: 'alien', name: 'Alien', emoji: '👽', letters: ['A', 'L', 'I', 'E', 'N'], animationType: 'car-drive', description: 'A being from another planet.', color: 'from-lime-400 to-green-600' },
  { id: 'clock', name: 'Clock', emoji: '⏰', letters: ['C', 'L', 'O', 'C', 'K'], animationType: 'rocket-launch', description: 'Measures time.', color: 'from-rose-400 to-pink-600' },
  { id: 'sword', name: 'Sword', emoji: '🗡️', letters: ['S', 'W', 'O', 'R', 'D'], animationType: 'car-drive', description: 'A weapon with a long metal blade.', color: 'from-zinc-400 to-zinc-600' },
  { id: 'crown', name: 'Crown', emoji: '👑', letters: ['C', 'R', 'O', 'W', 'N'], animationType: 'rocket-launch', description: 'A circular ornamental headdress worn by a monarch.', color: 'from-yellow-300 to-amber-500' },
  { id: 'heart', name: 'Heart', emoji: '❤️', letters: ['H', 'E', 'A', 'R', 'T'], animationType: 'car-drive', description: 'A hollow muscular organ that pumps blood.', color: 'from-red-500 to-pink-600' },
  { id: 'star', name: 'Star', emoji: '⭐', letters: ['S', 'T', 'A', 'R'], animationType: 'rocket-launch', description: 'A luminous point in the night sky.', color: 'from-yellow-200 to-yellow-400' },
  { id: 'moon', name: 'Moon', emoji: '🌙', letters: ['M', 'O', 'O', 'N'], animationType: 'car-drive', description: 'The natural satellite of the earth.', color: 'from-blue-200 to-indigo-300' }
];
`;
livCode = livCode.replace(/const PUZZLES[\s\S]*?\];/m, newPuzzles.trim());

// Remove score
livCode = livCode.replace(/const \[score, setScore\] = React\.useState\(0\);/, '');
livCode = livCode.replace(/setScore\(0\);/g, '');
livCode = livCode.replace(/setScore\(prev => prev \+ 15\);/, '');
livCode = livCode.replace(/setScore\(prev => Math\.max\(0, prev - 5\)\);/, '');

livCode = livCode.replace(/<div className="border-t border-slate-900\/60 pt-3 flex gap-2 items-center">[\s\S]*?<\/div>/m, '');
livCode = livCode.replace(/<div className="bg-amber-500\/10 border border-amber-500\/20 rounded-2xl px-6 py-4 flex items-center justify-center gap-3">[\s\S]*?<\/div>\s*<\/div>/m, '');

// Randomize active puzzles
livCode = livCode.replace(/const activePuzzle = PUZZLES\[currentPuzzleIdx\];/, `
  const [activePuzzles, setActivePuzzles] = React.useState<PuzzleObject[]>([]);
  
  React.useEffect(() => {
    setActivePuzzles([...PUZZLES].sort(() => 0.5 - Math.random()).slice(0, 5));
  }, []);
  
  const activePuzzle = activePuzzles[currentPuzzleIdx] || PUZZLES[0];
`);

livCode = livCode.replace(/if \(currentPuzzleIdx < PUZZLES\.length - 1\)/g, 'if (currentPuzzleIdx < activePuzzles.length - 1)');
livCode = livCode.replace(/Puzzle \{currentPuzzleIdx \+ 1\} of \{PUZZLES\.length\}/, 'Puzzle {currentPuzzleIdx + 1} of {activePuzzles.length}');

livCode = livCode.replace(/const handleRestart = \(\) => \{/, `const handleRestart = () => {
    setActivePuzzles([...PUZZLES].sort(() => 0.5 - Math.random()).slice(0, 5));`);

fs.writeFileSync(livingPuzzlesPath, livCode);


// Character Conversations 3D
let charCode = fs.readFileSync(characterConversationsPath, 'utf8');

const newDialogues = `
const DIALOGUE_NODES: DialogueNode[] = [
  { id: 1, characterText: "Hello there! Welcome to LingoLand Academy! 🌟 I'm Professor Lexi. How do you do?", expression: 'waving', options: [ { text: "How do you do? I'm excited to learn!", isCorrect: true, feedback: "Perfect! 'How do you do?' is a polite, traditional reply to match my greeting." }, { text: "I do good, and you?", isCorrect: false, feedback: "Not quite. While common, 'I do good' is grammatically informal." }, { text: "What's up, dude?", isCorrect: false, feedback: "A bit too informal for greeting a teacher!" } ] },
  { id: 2, characterText: "Let's practice phonics. Which word has the short /æ/ vowel sound as in 'apple'?", expression: 'thinking', options: [ { text: "Car 🚗", isCorrect: false, feedback: "Close, but 'Car' has the long /ɑː/ sound." }, { text: "Cat 🐱", isCorrect: true, feedback: "Spot on! 'Cat' matches the short /æ/ sound perfectly!" }, { text: "Cake 🍰", isCorrect: false, feedback: "Incorrect. 'Cake' features the long /eɪ/ sound." } ] },
  { id: 3, characterText: "If you want to politely interrupt someone to ask a question, what should you say?", expression: 'talking', options: [ { text: "Hey! Listen to me!", isCorrect: false, feedback: "Too aggressive and impolite." }, { text: "Excuse me, may I ask a quick question?", isCorrect: true, feedback: "Outstanding! This is the most polite and natural way to interrupt someone." }, { text: "Move aside, please.", isCorrect: false, feedback: "Impolite and socially awkward." } ] },
  { id: 4, characterText: "Which of these words is a synonym for 'Huge'?", expression: 'thinking', options: [ { text: "Tiny", isCorrect: false, feedback: "Tiny means very small, the opposite of huge." }, { text: "Gigantic", isCorrect: true, feedback: "Yes! Gigantic is a great synonym for huge." }, { text: "Average", isCorrect: false, feedback: "Average means normal size." } ] },
  { id: 5, characterText: "How would you politely decline an invitation to a party?", expression: 'sad', options: [ { text: "I can't go. Too busy.", isCorrect: false, feedback: "A bit too blunt and impolite." }, { text: "Thank you for the invitation, but I won't be able to make it.", isCorrect: true, feedback: "Excellent! Very polite and considerate." }, { text: "No way!", isCorrect: false, feedback: "Too informal and rude." } ] },
  { id: 6, characterText: "What is the past tense of the verb 'to go'?", expression: 'thinking', options: [ { text: "Goed", isCorrect: false, feedback: "Goed is not a word. 'Go' is an irregular verb." }, { text: "Went", isCorrect: true, feedback: "Correct! 'Went' is the past tense of 'to go'." }, { text: "Gone", isCorrect: false, feedback: "'Gone' is the past participle, not the simple past." } ] },
  { id: 7, characterText: "Which sentence uses correct punctuation?", expression: 'talking', options: [ { text: "I love apples, oranges and bananas.", isCorrect: true, feedback: "Correct! The commas are used properly." }, { text: "I love apples oranges and bananas.", isCorrect: false, feedback: "Missing commas to separate items in a list." }, { text: "I, love apples, oranges and bananas.", isCorrect: false, feedback: "The first comma is unnecessary." } ] },
  { id: 8, characterText: "What does the idiom 'break a leg' mean?", expression: 'happy', options: [ { text: "To fracture a bone.", isCorrect: false, feedback: "That's the literal meaning, not the idiomatic one." }, { text: "Good luck!", isCorrect: true, feedback: "Correct! It's a theatrical way to wish someone good luck." }, { text: "To stop walking.", isCorrect: false, feedback: "Incorrect." } ] },
  { id: 9, characterText: "Identify the adjective in this sentence: 'The swift fox jumped.'", expression: 'thinking', options: [ { text: "Fox", isCorrect: false, feedback: "Fox is a noun." }, { text: "Jumped", isCorrect: false, feedback: "Jumped is a verb." }, { text: "Swift", isCorrect: true, feedback: "Yes! Swift describes the noun 'fox'." } ] },
  { id: 10, characterText: "How do you politely ask someone to repeat what they said?", expression: 'talking', options: [ { text: "What did you say?", isCorrect: false, feedback: "A bit abrupt." }, { text: "Could you please repeat that?", isCorrect: true, feedback: "Perfect! Very polite and clear." }, { text: "Huh?", isCorrect: false, feedback: "Too informal." } ] },
  { id: 11, characterText: "Which word is an antonym for 'Brave'?", expression: 'thinking', options: [ { text: "Fearless", isCorrect: false, feedback: "Fearless is a synonym for brave." }, { text: "Cowardly", isCorrect: true, feedback: "Correct! Cowardly is the opposite of brave." }, { text: "Strong", isCorrect: false, feedback: "Strong is not an antonym for brave." } ] },
  { id: 12, characterText: "Choose the correct spelling.", expression: 'happy', options: [ { text: "Accommodate", isCorrect: true, feedback: "Yes! Two c's and two m's." }, { text: "Acommodate", isCorrect: false, feedback: "Missing a 'c'." }, { text: "Accomodate", isCorrect: false, feedback: "Missing an 'm'." } ] },
  { id: 13, characterText: "What does the prefix 'un-' mean in words like 'unhappy'?", expression: 'thinking', options: [ { text: "Not", isCorrect: true, feedback: "Correct! 'Un-' means 'not'." }, { text: "Again", isCorrect: false, feedback: "'Re-' means 'again'." }, { text: "Before", isCorrect: false, feedback: "'Pre-' means 'before'." } ] },
  { id: 14, characterText: "Select the correct plural of 'Child'.", expression: 'talking', options: [ { text: "Childs", isCorrect: false, feedback: "Incorrect." }, { text: "Children", isCorrect: true, feedback: "Correct! Child has an irregular plural." }, { text: "Childrens", isCorrect: false, feedback: "Children is already plural, no 's' needed." } ] },
  { id: 15, characterText: "Which word has the long /i:/ sound as in 'see'?", expression: 'happy', options: [ { text: "Sit", isCorrect: false, feedback: "Sit has the short /ɪ/ sound." }, { text: "Seat", isCorrect: true, feedback: "Correct! Seat has the long /i:/ sound." }, { text: "Set", isCorrect: false, feedback: "Set has the short /e/ sound." } ] }
];
`;

charCode = charCode.replace(/const DIALOGUE_NODES[\s\S]*?\];/m, newDialogues.trim());

// Randomize active dialogues
charCode = charCode.replace(/const activeNode = DIALOGUE_NODES\[currentNodeIdx\];/, `
  const [activeNodes, setActiveNodes] = React.useState<DialogueNode[]>([]);
  
  React.useEffect(() => {
    setActiveNodes([...DIALOGUE_NODES].sort(() => 0.5 - Math.random()).slice(0, 5));
  }, []);
  
  const activeNode = activeNodes[currentNodeIdx] || DIALOGUE_NODES[0];
`);

charCode = charCode.replace(/if \(currentNodeIdx < DIALOGUE_NODES\.length - 1\)/g, 'if (currentNodeIdx < activeNodes.length - 1)');
charCode = charCode.replace(/currentNodeIdx < DIALOGUE_NODES\.length - 1 \? "Next Dialogue"/, 'currentNodeIdx < activeNodes.length - 1 ? "Next Dialogue"');

charCode = charCode.replace(/const handleStart = \(\) => \{[\s\S]*?\};/m, `
  const handleStart = () => {
    setGameState('playing');
    setCurrentNodeIdx(0);
    setSelectedOptionIdx(null);
    
    const newNodes = [...DIALOGUE_NODES].sort(() => 0.5 - Math.random()).slice(0, 5);
    setActiveNodes(newNodes);
    setTimeout(() => speakText(newNodes[0].characterText), 100);
  };
`);

charCode = charCode.replace(/speakText\(DIALOGUE_NODES\[nextIdx\]\.characterText\);/, `speakText(activeNodes[nextIdx].characterText);`);

// Remove score
charCode = charCode.replace(/const \[score, setScore\] = React\.useState\(0\);/, '');
charCode = charCode.replace(/setScore\(0\);/g, '');
charCode = charCode.replace(/setScore\(prev => prev \+ 30\);/, '');

charCode = charCode.replace(/<div className="absolute top-4 left-4 flex gap-1\.5 items-center[\s\S]*?<\/div>/m, '');
charCode = charCode.replace(/<div className="bg-amber-500\/10 border border-amber-500\/20 rounded-2xl px-6 py-4 flex items-center justify-center gap-3">[\s\S]*?<\/div>\s*<\/div>/m, '');


fs.writeFileSync(characterConversationsPath, charCode);

console.log("Done updating games");
