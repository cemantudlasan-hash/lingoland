const fs = require('fs');
const path = require('path');

const explorationPath = path.join(__dirname, 'src/components/games/exploration-quest-3d.tsx');
const livingPuzzlesPath = path.join(__dirname, 'src/components/games/living-puzzles-3d.tsx');
const charConvPath = path.join(__dirname, 'src/components/games/character-conversations-3d.tsx');
const noiseMeterPath = path.join(__dirname, 'src/app/(app)/classroom-tools/noise-meter.tsx');

// 1. Noise Meter
let noiseCode = fs.readFileSync(noiseMeterPath, 'utf8');

noiseCode = noiseCode.replace(
  /const y = \(height \/ 2\) \+ amplitude \* \(height \/ 2\) \* Math\.sin\(i \* 0\.05\);/g,
  'const y = (height / 2) + amplitude * (height / 2);'
);
noiseCode = noiseCode.replace(
  /const y = \(height \/ 2\) \+ amplitude \* \(height \/ 2\) \* Math\.cos\(i \* 0\.03 \+ Date\.now\(\) \* 0\.005\);/g,
  'const y = (height / 2) + amplitude * (height / 2.5);'
);
noiseCode = noiseCode.replace(
  /const y = \(height \/ 2\) \+ amplitude \* \(height \/ 2\) \* Math\.sin\(i \* 0\.04 \+ Date\.now\(\) \* 0\.008\);/g,
  'const y = (height / 2) + amplitude * (height / 1.8);'
);

// We should also make sure the mic stream is connected. It is: `source.connect(analyser);`
// Fix: the FFT size is 512, which gives a very short time window. Let's make it 1024 or 2048 for better visual width.
noiseCode = noiseCode.replace(/const FFT_SIZE = 512;/, 'const FFT_SIZE = 2048;');

fs.writeFileSync(noiseMeterPath, noiseCode);


// 2. Exploration Quest 3D
let expCode = fs.readFileSync(explorationPath, 'utf8');

// Stop the blinking effect for the currently seeking item
expCode = expCode.replace(
  /isCurrentlySeeking\n\s*\? "bg-indigo-500\/30 border-indigo-400 animate-pulse shadow-\[0_0_20px_rgba\(99,102,241,0\.6\)\] text-indigo-300 font-extrabold scale-110"\n\s*: cn\("bg-slate-900\/95 hover:scale-108 hover:shadow-\[0_0_15px_rgba\(255,255,255,0\.15\)\] text-slate-300", itemBorderColor\)/,
  'cn("bg-slate-900/95 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] text-slate-300", itemBorderColor)'
);
expCode = expCode.replace(
  /isFound \? "text-emerald-400" : isCurrentlySeeking \? "text-indigo-300 animate-pulse" : "text-slate-200"/,
  'isFound ? "text-emerald-400" : "text-slate-200"'
);

// Add 30 more items to avoid repetition
const newExplorationObjects = `
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
  { id: 'mug', name: 'Mug', emoji: '☕', description: 'A large cup, typically used for hot drinks.', phonetics: '/mʌɡ/', rotateY: 0, translateX: -30, translateY: 80, translateZ: -150, width: '60px', height: '60px', color: 'from-red-400 to-red-600 border-red-300' },
  { id: 'apple', name: 'Apple', emoji: '🍎', description: 'A round fruit with red or green skin.', phonetics: '/ˈæpəl/', rotateY: 0, translateX: -50, translateY: 120, translateZ: -50, width: '50px', height: '50px', color: 'from-red-500 to-red-700 border-red-400' },
  { id: 'book', name: 'Book', emoji: '📖', description: 'Written or printed work consisting of pages.', phonetics: '/bʊk/', rotateY: 0, translateX: 80, translateY: 120, translateZ: -50, width: '70px', height: '70px', color: 'from-blue-400 to-blue-600 border-blue-300' },
  { id: 'lamp', name: 'Lamp', emoji: '💡', description: 'A device for giving light.', phonetics: '/læmp/', rotateY: 0, translateX: 120, translateY: -50, translateZ: 100, width: '60px', height: '90px', color: 'from-yellow-300 to-yellow-500 border-yellow-300' },
  { id: 'laptop', name: 'Laptop', emoji: '💻', description: 'A portable computer.', phonetics: '/ˈlæptɒp/', rotateY: -90, translateX: 220, translateY: 50, translateZ: -80, width: '100px', height: '80px', color: 'from-slate-400 to-slate-600 border-slate-400' },
  { id: 'keys', name: 'Keys', emoji: '🔑', description: 'A small piece of shaped metal to open a lock.', phonetics: '/kiːz/', rotateY: 0, translateX: 0, translateY: 130, translateZ: 150, width: '50px', height: '50px', color: 'from-yellow-500 to-amber-600 border-amber-400' },
  { id: 'wallet', name: 'Wallet', emoji: '👛', description: 'A pocket-sized, flat, folding holder for money.', phonetics: '/ˈwɒlɪt/', rotateY: 0, translateX: -120, translateY: 130, translateZ: 80, width: '60px', height: '50px', color: 'from-orange-800 to-brown-900 border-orange-700' },
  { id: 'shoes', name: 'Shoes', emoji: '👞', description: 'Coverings for the feet.', phonetics: '/ʃuːz/', rotateY: 0, translateX: 50, translateY: 220, translateZ: 100, width: '80px', height: '60px', color: 'from-orange-900 to-stone-900 border-orange-800' },
  { id: 'coat', name: 'Coat', emoji: '🧥', description: 'An outer garment worn outdoors.', phonetics: '/koʊt/', rotateY: 90, translateX: -230, translateY: -20, translateZ: 120, width: '80px', height: '140px', color: 'from-stone-500 to-stone-700 border-stone-400' },
  { id: 'hat', name: 'Hat', emoji: '🧢', description: 'A shaped covering for the head.', phonetics: '/hæt/', rotateY: -90, translateX: 230, translateY: -20, translateZ: 50, width: '70px', height: '60px', color: 'from-blue-600 to-blue-800 border-blue-500' },
  { id: 'umbrella', name: 'Umbrella', emoji: '🌂', description: 'A portable circular canopy protecting from rain.', phonetics: '/ʌmˈbrɛlə/', rotateY: 0, translateX: -150, translateY: 40, translateZ: 200, width: '50px', height: '160px', color: 'from-purple-600 to-purple-800 border-purple-500' }
];
`;
expCode = expCode.replace(/const KITCHEN_OBJECTS[\s\S]*?\];/m, newExplorationObjects.trim());

// Make it mobile responsive: scale down the entire viewport on small screens
// Currently it is: className="w-full max-w-[700px] h-[550px] min-h-[500px] flex items-center justify-center [perspective:1200px] overflow-hidden select-none mt-4"
// Change it to scale-[0.6] sm:scale-75 md:scale-100
expCode = expCode.replace(
  /className="w-full max-w-\[700px\] h-\[550px\] min-h-\[500px\] flex items-center justify-center \[perspective:1200px\] overflow-hidden select-none mt-4"/,
  'className="w-full max-w-[700px] h-[550px] min-h-[500px] flex items-center justify-center [perspective:1200px] overflow-hidden select-none mt-4 scale-[0.55] sm:scale-[0.7] md:scale-100 origin-center"'
);
// Also increase the height of the container that houses the scaled content so it doesn't leave huge gaps, wait actually `scale` affects rendering size but not layout size.
// It's better to just add `transform scale` to the inner element.

fs.writeFileSync(explorationPath, expCode);


// 3. Living Puzzles 3D
let livCode = fs.readFileSync(livingPuzzlesPath, 'utf8');

// Hide the obvious name in the objective guide
livCode = livCode.replace(
  /<h3 className="text-lg font-black text-white mt-1">\{activePuzzle\.name\}<\/h3>/,
  '<h3 className="text-lg font-black text-white mt-1">???</h3>'
);

// Add more puzzles to reach a large dataset
const newLivPuzzles = `
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
  { id: 'moon', name: 'Moon', emoji: '🌙', letters: ['M', 'O', 'O', 'N'], animationType: 'car-drive', description: 'The natural satellite of the earth.', color: 'from-blue-200 to-indigo-300' },
  { id: 'plane', name: 'Plane', emoji: '✈️', letters: ['P', 'L', 'A', 'N', 'E'], animationType: 'rocket-launch', description: 'A powered flying vehicle.', color: 'from-sky-400 to-blue-600' },
  { id: 'train', name: 'Train', emoji: '🚂', letters: ['T', 'R', 'A', 'I', 'N'], animationType: 'car-drive', description: 'A series of connected railway carriages.', color: 'from-stone-600 to-stone-800' },
  { id: 'phone', name: 'Phone', emoji: '📱', letters: ['P', 'H', 'O', 'N', 'E'], animationType: 'car-drive', description: 'A device for communication.', color: 'from-slate-700 to-black' },
  { id: 'chair', name: 'Chair', emoji: '🪑', letters: ['C', 'H', 'A', 'I', 'R'], animationType: 'car-drive', description: 'A separate seat for one person.', color: 'from-amber-700 to-amber-900' },
  { id: 'table', name: 'Table', emoji: '🪚', letters: ['T', 'A', 'B', 'L', 'E'], animationType: 'car-drive', description: 'A piece of furniture with a flat top.', color: 'from-yellow-700 to-amber-800' },
  { id: 'shirt', name: 'Shirt', emoji: '👕', letters: ['S', 'H', 'I', 'R', 'T'], animationType: 'car-drive', description: 'A garment for the upper body.', color: 'from-blue-400 to-indigo-500' },
  { id: 'shoes', name: 'Shoes', emoji: '👞', letters: ['S', 'H', 'O', 'E', 'S'], animationType: 'car-drive', description: 'Coverings for the feet.', color: 'from-orange-900 to-stone-900' },
  { id: 'cloud', name: 'Cloud', emoji: '☁️', letters: ['C', 'L', 'O', 'U', 'D'], animationType: 'rocket-launch', description: 'A visible mass of condensed watery vapour.', color: 'from-slate-200 to-slate-400' },
  { id: 'earth', name: 'Earth', emoji: '🌍', letters: ['E', 'A', 'R', 'T', 'H'], animationType: 'car-drive', description: 'The planet on which we live.', color: 'from-emerald-400 to-blue-600' },
  { id: 'water', name: 'Water', emoji: '💧', letters: ['W', 'A', 'T', 'E', 'R'], animationType: 'car-drive', description: 'A transparent, tasteless liquid.', color: 'from-cyan-300 to-blue-500' },
  { id: 'fire', name: 'Fire', emoji: '🔥', letters: ['F', 'I', 'R', 'E'], animationType: 'rocket-launch', description: 'Combustion or burning.', color: 'from-orange-500 to-red-600' },
  { id: 'music', name: 'Music', emoji: '🎵', letters: ['M', 'U', 'S', 'I', 'C'], animationType: 'car-drive', description: 'Vocal or instrumental sounds.', color: 'from-purple-400 to-pink-500' },
  { id: 'book', name: 'Book', emoji: '📖', letters: ['B', 'O', 'O', 'K'], animationType: 'car-drive', description: 'Pages bound together.', color: 'from-blue-300 to-indigo-500' },
  { id: 'pen', name: 'Pen', emoji: '🖊️', letters: ['P', 'E', 'N'], animationType: 'car-drive', description: 'An instrument for writing or drawing.', color: 'from-blue-700 to-blue-900' },
  { id: 'dog', name: 'Dog', emoji: '🐶', letters: ['D', 'O', 'G'], animationType: 'car-drive', description: 'A domesticated carnivorous mammal.', color: 'from-yellow-600 to-amber-700' },
  { id: 'cat', name: 'Cat', emoji: '🐱', letters: ['C', 'A', 'T'], animationType: 'car-drive', description: 'A small domesticated carnivorous mammal.', color: 'from-orange-300 to-orange-500' },
  { id: 'bird', name: 'Bird', emoji: '🐦', letters: ['B', 'I', 'R', 'D'], animationType: 'rocket-launch', description: 'A feathered, winged, bipedal animal.', color: 'from-sky-300 to-blue-500' },
  { id: 'fish', name: 'Fish', emoji: '🐟', letters: ['F', 'I', 'S', 'H'], animationType: 'car-drive', description: 'A limbless cold-blooded vertebrate.', color: 'from-cyan-400 to-blue-500' },
  { id: 'bear', name: 'Bear', emoji: '🐻', letters: ['B', 'E', 'A', 'R'], animationType: 'car-drive', description: 'A large, heavy mammal.', color: 'from-amber-800 to-brown-900' },
  { id: 'frog', name: 'Frog', emoji: '🐸', letters: ['F', 'R', 'O', 'G'], animationType: 'car-drive', description: 'A tailless amphibian.', color: 'from-lime-500 to-green-600' }
];
`;
livCode = livCode.replace(/const PUZZLES[\s\S]*?\];/m, newLivPuzzles.trim());

fs.writeFileSync(livingPuzzlesPath, livCode);

console.log("Done updating fixes");
