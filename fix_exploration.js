const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/games/exploration-quest-3d.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. We will replace KITCHEN_OBJECTS with a massive array of 80 items. We don't need fixed X,Y,Z coordinates anymore.
const newObjects = `
interface QuestItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  phonetics: string;
  width: string;
  height: string;
  color: string;
}

const ALL_OBJECTS: QuestItem[] = [
  { id: 'fridge', name: 'Refrigerator', emoji: '❄️', description: 'A large appliance used to keep food cold.', phonetics: '/rɪˈfrɪdʒəreɪtər/', width: '130px', height: '200px', color: 'from-blue-600 to-indigo-800 border-blue-400' },
  { id: 'toaster', name: 'Toaster', emoji: '🍞', description: 'An electrical appliance used to brown bread.', phonetics: '/ˈtoʊstər/', width: '90px', height: '90px', color: 'from-amber-500 to-orange-600 border-amber-400' },
  { id: 'clock', name: 'Clock', emoji: '⏰', description: 'Used to measure and display time.', phonetics: '/klɑːk/', width: '100px', height: '100px', color: 'from-rose-500 to-pink-600 border-pink-400' },
  { id: 'cabinet', name: 'Cabinet', emoji: '🗄️', description: 'A cupboard with shelves for storing items.', phonetics: '/ˈkæbɪnət/', width: '150px', height: '100px', color: 'from-purple-500 to-violet-750 border-purple-400' },
  { id: 'sink', name: 'Sink', emoji: '🚰', description: 'A basin used for washing hands and dishes.', phonetics: '/sɪŋk/', width: '120px', height: '120px', color: 'from-teal-500 to-cyan-600 border-teal-400' },
  { id: 'window', name: 'Window', emoji: '🪟', description: 'An opening in a wall to let in light and air.', phonetics: '/ˈwɪndoʊ/', width: '130px', height: '140px', color: 'from-sky-400 to-indigo-600 border-sky-300' },
  { id: 'microwave', name: 'Microwave', emoji: '📻', description: 'Oven that cooks food very quickly.', phonetics: '/ˈmaɪkrəweɪv/', width: '110px', height: '80px', color: 'from-slate-500 to-slate-700 border-slate-400' },
  { id: 'blender', name: 'Blender', emoji: '🥤', description: 'Used to mix or puree food and liquids.', phonetics: '/ˈblɛndər/', width: '70px', height: '110px', color: 'from-fuchsia-500 to-pink-600 border-fuchsia-400' },
  { id: 'pan', name: 'Frying Pan', emoji: '🍳', description: 'A flat-bottomed pan used for frying.', phonetics: '/pæn/', width: '90px', height: '60px', color: 'from-zinc-700 to-zinc-900 border-zinc-500' },
  { id: 'plate', name: 'Plate', emoji: '🍽️', description: 'A flat dish from which food is eaten.', phonetics: '/pleɪt/', width: '100px', height: '60px', color: 'from-white to-slate-200 border-slate-300' },
  { id: 'chair', name: 'Chair', emoji: '🪑', description: 'A separate seat for one person.', phonetics: '/tʃɛər/', width: '100px', height: '150px', color: 'from-amber-700 to-amber-900 border-amber-600' },
  { id: 'plant', name: 'Plant', emoji: '🪴', description: 'A living organism such as a flower or shrub.', phonetics: '/plænt/', width: '90px', height: '130px', color: 'from-green-500 to-emerald-700 border-green-400' },
  { id: 'broom', name: 'Broom', emoji: '🧹', description: 'Used for sweeping floors.', phonetics: '/bruːm/', width: '60px', height: '180px', color: 'from-yellow-600 to-amber-800 border-yellow-500' },
  { id: 'trash', name: 'Trash Can', emoji: '🗑️', description: 'A container for waste.', phonetics: '/træʃ/', width: '90px', height: '110px', color: 'from-zinc-400 to-zinc-600 border-zinc-300' },
  { id: 'mug', name: 'Mug', emoji: '☕', description: 'A large cup, typically used for hot drinks.', phonetics: '/mʌɡ/', width: '60px', height: '60px', color: 'from-red-400 to-red-600 border-red-300' },
  { id: 'apple', name: 'Apple', emoji: '🍎', description: 'A round fruit with red or green skin.', phonetics: '/ˈæpəl/', width: '60px', height: '60px', color: 'from-red-500 to-red-700 border-red-400' },
  { id: 'book', name: 'Book', emoji: '📖', description: 'Written or printed work consisting of pages.', phonetics: '/bʊk/', width: '80px', height: '80px', color: 'from-blue-400 to-blue-600 border-blue-300' },
  { id: 'lamp', name: 'Lamp', emoji: '💡', description: 'A device for giving light.', phonetics: '/læmp/', width: '70px', height: '100px', color: 'from-yellow-300 to-yellow-500 border-yellow-300' },
  { id: 'laptop', name: 'Laptop', emoji: '💻', description: 'A portable computer.', phonetics: '/ˈlæptɒp/', width: '110px', height: '90px', color: 'from-slate-400 to-slate-600 border-slate-400' },
  { id: 'keys', name: 'Keys', emoji: '🔑', description: 'A small piece of shaped metal to open a lock.', phonetics: '/kiːz/', width: '60px', height: '60px', color: 'from-yellow-500 to-amber-600 border-amber-400' },
  { id: 'wallet', name: 'Wallet', emoji: '👛', description: 'A pocket-sized, flat, folding holder for money.', phonetics: '/ˈwɒlɪt/', width: '70px', height: '60px', color: 'from-orange-800 to-brown-900 border-orange-700' },
  { id: 'shoes', name: 'Shoes', emoji: '👞', description: 'Coverings for the feet.', phonetics: '/ʃuːz/', width: '90px', height: '70px', color: 'from-orange-900 to-stone-900 border-orange-800' },
  { id: 'coat', name: 'Coat', emoji: '🧥', description: 'An outer garment worn outdoors.', phonetics: '/koʊt/', width: '90px', height: '150px', color: 'from-stone-500 to-stone-700 border-stone-400' },
  { id: 'hat', name: 'Hat', emoji: '🧢', description: 'A shaped covering for the head.', phonetics: '/hæt/', width: '80px', height: '70px', color: 'from-blue-600 to-blue-800 border-blue-500' },
  { id: 'umbrella', name: 'Umbrella', emoji: '🌂', description: 'A portable circular canopy protecting from rain.', phonetics: '/ʌmˈbrɛlə/', width: '60px', height: '170px', color: 'from-purple-600 to-purple-800 border-purple-500' },
  { id: 'backpack', name: 'Backpack', emoji: '🎒', description: 'A bag supported by shoulder straps.', phonetics: '/ˈbækpæk/', width: '100px', height: '130px', color: 'from-red-600 to-red-800 border-red-500' },
  { id: 'glasses', name: 'Glasses', emoji: '👓', description: 'Lenses worn to aid vision.', phonetics: '/ˈɡlæsɪz/', width: '70px', height: '50px', color: 'from-sky-500 to-blue-700 border-sky-400' },
  { id: 'watch', name: 'Watch', emoji: '⌚', description: 'A small timepiece worn typically on a strap.', phonetics: '/wɒtʃ/', width: '60px', height: '60px', color: 'from-zinc-500 to-slate-700 border-zinc-400' },
  { id: 'camera', name: 'Camera', emoji: '📷', description: 'A device for recording visual images.', phonetics: '/ˈkæmərə/', width: '90px', height: '80px', color: 'from-slate-700 to-black border-slate-600' },
  { id: 'headphones', name: 'Headphones', emoji: '🎧', description: 'A pair of earphones worn over the head.', phonetics: '/ˈhɛdfoʊnz/', width: '80px', height: '90px', color: 'from-indigo-500 to-indigo-700 border-indigo-400' },
  { id: 'teddy', name: 'Teddy Bear', emoji: '🧸', description: 'A soft toy bear.', phonetics: '/ˈtɛdi bɛər/', width: '100px', height: '120px', color: 'from-amber-600 to-amber-800 border-amber-500' },
  { id: 'guitar', name: 'Guitar', emoji: '🎸', description: 'A stringed musical instrument.', phonetics: '/ɡɪˈtɑːr/', width: '80px', height: '180px', color: 'from-red-700 to-red-900 border-red-600' },
  { id: 'soccer', name: 'Soccer Ball', emoji: '⚽', description: 'A round ball used in soccer.', phonetics: '/ˈsɒkər bɔːl/', width: '80px', height: '80px', color: 'from-white to-slate-300 border-slate-200' },
  { id: 'basketball', name: 'Basketball', emoji: '🏀', description: 'A large round ball used in basketball.', phonetics: '/ˈbæskɪtbɔːl/', width: '90px', height: '90px', color: 'from-orange-500 to-orange-700 border-orange-400' },
  { id: 'tennis', name: 'Tennis Racket', emoji: '🎾', description: 'Used to hit a tennis ball.', phonetics: '/ˈtɛnɪs ˈrækɪt/', width: '70px', height: '160px', color: 'from-lime-400 to-green-600 border-lime-300' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', description: 'A savory dish of Italian origin.', phonetics: '/ˈpiːtsə/', width: '90px', height: '90px', color: 'from-yellow-400 to-orange-500 border-yellow-300' },
  { id: 'burger', name: 'Burger', emoji: '🍔', description: 'A sandwich consisting of one or more cooked patties.', phonetics: '/ˈbɜːrɡər/', width: '80px', height: '80px', color: 'from-amber-500 to-orange-700 border-amber-400' },
  { id: 'donut', name: 'Donut', emoji: '🍩', description: 'A small ring-shaped friedcake.', phonetics: '/ˈdoʊnʌt/', width: '70px', height: '70px', color: 'from-pink-400 to-pink-600 border-pink-300' },
  { id: 'icecream', name: 'Ice Cream', emoji: '🍦', description: 'A sweetened frozen food.', phonetics: '/aɪs kriːm/', width: '60px', height: '100px', color: 'from-rose-300 to-rose-500 border-rose-200' },
  { id: 'cake', name: 'Cake', emoji: '🍰', description: 'An item of soft, sweet food made from baking.', phonetics: '/keɪk/', width: '80px', height: '80px', color: 'from-fuchsia-400 to-purple-600 border-fuchsia-300' },
  { id: 'car', name: 'Toy Car', emoji: '🚗', description: 'A miniature road vehicle.', phonetics: '/tɔɪ kɑːr/', width: '100px', height: '60px', color: 'from-red-500 to-rose-700 border-red-400' },
  { id: 'train', name: 'Toy Train', emoji: '🚂', description: 'A miniature connected railway carriage.', phonetics: '/tɔɪ treɪn/', width: '120px', height: '70px', color: 'from-stone-600 to-stone-800 border-stone-500' },
  { id: 'plane', name: 'Toy Plane', emoji: '✈️', description: 'A miniature flying vehicle.', phonetics: '/tɔɪ pleɪn/', width: '110px', height: '110px', color: 'from-sky-400 to-blue-600 border-sky-300' },
  { id: 'boat', name: 'Toy Boat', emoji: '⛵', description: 'A miniature vessel for water.', phonetics: '/tɔɪ boʊt/', width: '90px', height: '100px', color: 'from-blue-400 to-blue-600 border-blue-300' },
  { id: 'rocket', name: 'Toy Rocket', emoji: '🚀', description: 'A miniature spacecraft.', phonetics: '/tɔɪ ˈrɒkɪt/', width: '70px', height: '140px', color: 'from-cyan-500 to-blue-700 border-cyan-400' },
  { id: 'scissors', name: 'Scissors', emoji: '✂️', description: 'An instrument used for cutting.', phonetics: '/ˈsɪzərz/', width: '60px', height: '80px', color: 'from-zinc-400 to-zinc-600 border-zinc-300' },
  { id: 'pencil', name: 'Pencil', emoji: '✏️', description: 'An instrument for writing or drawing.', phonetics: '/ˈpɛnsəl/', width: '40px', height: '120px', color: 'from-yellow-400 to-amber-500 border-yellow-300' },
  { id: 'ruler', name: 'Ruler', emoji: '📏', description: 'A straight strip used to draw lines or measure.', phonetics: '/ˈruːlər/', width: '40px', height: '150px', color: 'from-emerald-400 to-green-600 border-emerald-300' },
  { id: 'globe', name: 'Globe', emoji: '🌍', description: 'A spherical representation of the earth.', phonetics: '/ɡloʊb/', width: '90px', height: '110px', color: 'from-blue-500 to-indigo-700 border-blue-400' },
  { id: 'telescope', name: 'Telescope', emoji: '🔭', description: 'An optical instrument to make distant objects appear nearer.', phonetics: '/ˈtɛlɪskoʊp/', width: '140px', height: '100px', color: 'from-slate-600 to-slate-800 border-slate-500' },
  { id: 'microscope', name: 'Microscope', emoji: '🔬', description: 'An optical instrument used for viewing very small objects.', phonetics: '/ˈmaɪkrəskoʊp/', width: '80px', height: '130px', color: 'from-zinc-300 to-zinc-500 border-zinc-200' },
  { id: 'magnet', name: 'Magnet', emoji: '🧲', description: 'A piece of iron that has its component atoms so ordered that it exhibits properties of magnetism.', phonetics: '/ˈmæɡnɪt/', width: '70px', height: '70px', color: 'from-red-500 to-zinc-500 border-red-400' },
  { id: 'battery', name: 'Battery', emoji: '🔋', description: 'A container consisting of one or more cells.', phonetics: '/ˈbætəri/', width: '50px', height: '80px', color: 'from-green-500 to-green-700 border-green-400' },
  { id: 'bulb', name: 'Lightbulb', emoji: '💡', description: 'A glass bulb inserted into a lamp or a socket in a ceiling.', phonetics: '/bʌlb/', width: '60px', height: '90px', color: 'from-yellow-200 to-yellow-400 border-yellow-100' },
  { id: 'key', name: 'Key', emoji: '🗝️', description: 'A small piece of shaped metal with incisions cut to fit the wards of a particular lock.', phonetics: '/kiː/', width: '50px', height: '50px', color: 'from-amber-300 to-amber-500 border-amber-200' },
  { id: 'lock', name: 'Lock', emoji: '🔒', description: 'A mechanism for keeping a door, lid, etc., fastened.', phonetics: '/lɒk/', width: '60px', height: '80px', color: 'from-zinc-400 to-zinc-600 border-zinc-300' },
  { id: 'tools', name: 'Tools', emoji: '🛠️', description: 'Devices or implements used to carry out a particular function.', phonetics: '/tuːlz/', width: '90px', height: '90px', color: 'from-slate-500 to-slate-700 border-slate-400' },
  { id: 'hammer', name: 'Hammer', emoji: '🔨', description: 'A tool with a heavy head block.', phonetics: '/ˈhæmər/', width: '60px', height: '110px', color: 'from-zinc-500 to-stone-700 border-zinc-400' },
  { id: 'wrench', name: 'Wrench', emoji: '🔧', description: 'A tool used for gripping and turning nuts or bolts.', phonetics: '/rɛntʃ/', width: '50px', height: '120px', color: 'from-slate-400 to-slate-600 border-slate-300' },
  { id: 'gear', name: 'Gear', emoji: '⚙️', description: 'One of a set of toothed wheels that work together.', phonetics: '/ɡɪər/', width: '80px', height: '80px', color: 'from-zinc-500 to-zinc-700 border-zinc-400' },
  { id: 'gem', name: 'Gemstone', emoji: '💎', description: 'A precious or semiprecious stone.', phonetics: '/ˈdʒɛmstoʊn/', width: '70px', height: '70px', color: 'from-cyan-300 to-blue-500 border-cyan-200' },
  { id: 'coin', name: 'Coin', emoji: '🪙', description: 'A flat, typically round piece of metal with an official stamp.', phonetics: '/kɔɪn/', width: '60px', height: '60px', color: 'from-yellow-400 to-amber-500 border-yellow-300' },
  { id: 'money', name: 'Money', emoji: '💵', description: 'A current medium of exchange.', phonetics: '/ˈmʌni/', width: '100px', height: '60px', color: 'from-green-500 to-green-700 border-green-400' },
  { id: 'creditcard', name: 'Credit Card', emoji: '💳', description: 'A small plastic card issued by a bank.', phonetics: '/ˈkrɛdɪt kɑːrd/', width: '90px', height: '60px', color: 'from-blue-500 to-indigo-700 border-blue-400' },
  { id: 'envelope', name: 'Envelope', emoji: '✉️', description: 'A flat paper container with a sealable flap.', phonetics: '/ˈɛnvəloʊp/', width: '80px', height: '60px', color: 'from-white to-slate-200 border-slate-300' },
  { id: 'package', name: 'Package', emoji: '📦', description: 'An object or group of objects wrapped in paper or packed in a box.', phonetics: '/ˈpækɪdʒ/', width: '100px', height: '100px', color: 'from-amber-600 to-amber-800 border-amber-500' },
  { id: 'gift', name: 'Gift', emoji: '🎁', description: 'A thing given willingly to someone without payment.', phonetics: '/ɡɪft/', width: '90px', height: '90px', color: 'from-red-500 to-pink-600 border-red-400' },
  { id: 'balloon', name: 'Balloon', emoji: '🎈', description: 'A small colored rubber bag which is inflated.', phonetics: '/bəˈluːn/', width: '60px', height: '120px', color: 'from-red-400 to-red-600 border-red-300' },
  { id: 'ribbon', name: 'Ribbon', emoji: '🎀', description: 'A long, narrow strip of fabric.', phonetics: '/ˈrɪbən/', width: '70px', height: '60px', color: 'from-pink-400 to-rose-600 border-pink-300' },
  { id: 'trophy', name: 'Trophy', emoji: '🏆', description: 'A cup or other decorative object awarded as a prize.', phonetics: '/ˈtroʊfi/', width: '90px', height: '110px', color: 'from-yellow-300 to-amber-500 border-yellow-200' },
  { id: 'medal', name: 'Medal', emoji: '🏅', description: 'A metal disk with an inscription or design.', phonetics: '/ˈmɛdəl/', width: '60px', height: '80px', color: 'from-amber-300 to-yellow-500 border-amber-200' }
];

interface PlacedItem extends QuestItem {
  rotateY: number;
  translateX: number;
  translateY: number;
  translateZ: number;
}
`;
code = code.replace(/interface QuestItem[\s\S]*?const KITCHEN_OBJECTS[\s\S]*?\];/m, newObjects.trim());

// We need a state for the 20 placed items in the room
code = code.replace(/const \[targetItems, setTargetItems\] = React\.useState<string\[\]>\(\[\]\);/, 
  'const [targetItems, setTargetItems] = React.useState<string[]>([]);\n  const [roomItems, setRoomItems] = React.useState<PlacedItem[]>([]);');

code = code.replace(/\/\/ Initialize targets[\s\S]*?setTargetItems[\s\S]*?\}, \[\]\);/m, `
  // Initialize targets and room
  const initGame = () => {
    const shuffled = [...ALL_OBJECTS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 20); // 20 items total in the room
    const targets = selected.slice(0, 10).map(item => item.id);
    
    const placed = selected.map(item => {
      return {
        ...item,
        rotateY: Math.floor(Math.random() * 4) * 90,
        translateX: Math.floor(Math.random() * 500) - 250,
        translateY: Math.floor(Math.random() * 400) - 200,
        translateZ: Math.floor(Math.random() * 500) - 250,
      };
    });
    
    setRoomItems(placed);
    setTargetItems(targets);
  };

  React.useEffect(() => {
    initGame();
  }, []);
`);

// Call initGame on handleStartGame
code = code.replace(/const handleStartGame = \(\) => \{/, `const handleStartGame = () => {
    initGame();`);

// Fix progress count 4 -> 10
code = code.replace(/foundItems\.length \/ [0-9]+/g, 'foundItems.length / 10');
code = code.replace(/foundItems\.length\}\/[0-9]+/g, 'foundItems.length}/10');
code = code.replace(/targetItems\.length === [0-9]+/g, 'targetItems.length === 10');

// Replace KITCHEN_OBJECTS.find with ALL_OBJECTS.find
code = code.replace(/KITCHEN_OBJECTS\.find/g, 'ALL_OBJECTS.find');

// Replace KITCHEN_OBJECTS.map with roomItems.map
code = code.replace(/KITCHEN_OBJECTS\.map/g, 'roomItems.map');

// 3D rendering updates
// Ensure the 3D room container is large enough to prevent overlap but scales down properly.
code = code.replace(/w-\[600px\] h-\[600px\]/g, 'w-[800px] h-[800px]');
code = code.replace(/w-\[600px\] h-\[460px\]/g, 'w-[800px] h-[600px]');
code = code.replace(/w-\[500px\] h-\[460px\]/g, 'w-[800px] h-[600px]');

// Floor: absolute w-[800px] h-[800px] bg-slate-900 border border-slate-800/40 opacity-70 [transform:rotateX(90deg)_translateZ(-300px)_translateX(0px)]
code = code.replace(/\[transform:rotateX\(90deg\)_translateZ\([^)]*\)_translateX\([^)]*\)\]/g, '[transform:rotateX(90deg)_translateZ(-300px)]');
code = code.replace(/\[transform:rotateX\(90deg\)_translateZ\([^)]*\)\]/g, '[transform:rotateX(90deg)_translateZ(-300px)]');

// Walls
code = code.replace(/\[transform:translateZ\(-[0-9]+px\)_translateX\([0-9]+px\)_translateY\(-[0-9]+px\)\]/g, '[transform:translateZ(-400px)_translateY(-20px)]');
code = code.replace(/\[transform:rotateY\(90deg\)_translateZ\(-[0-9]+px\)_translateY\(-[0-9]+px\)_translateX\([0-9]+px\)\]/g, '[transform:rotateY(90deg)_translateZ(-400px)_translateY(-20px)]');
code = code.replace(/\[transform:rotateY\(-90deg\)_translateZ\(-[0-9]+px\)_translateY\(-[0-9]+px\)_translateX\([0-9]+px\)\]/g, '[transform:rotateY(-90deg)_translateZ(-400px)_translateY(-20px)]');

// There are probably versions with only 2 parameters if already partially modified.
code = code.replace(/\[transform:translateZ\(-[0-9]+px\)_translateY\(-[0-9]+px\)\]/g, '[transform:translateZ(-400px)_translateY(-20px)]');
code = code.replace(/\[transform:rotateY\(90deg\)_translateZ\(-[0-9]+px\)_translateY\(-[0-9]+px\)\]/g, '[transform:rotateY(90deg)_translateZ(-400px)_translateY(-20px)]');
code = code.replace(/\[transform:rotateY\(-90deg\)_translateZ\(-[0-9]+px\)_translateY\(-[0-9]+px\)\]/g, '[transform:rotateY(-90deg)_translateZ(-400px)_translateY(-20px)]');

fs.writeFileSync(filePath, code);

console.log("Done updating 3D exploration");
