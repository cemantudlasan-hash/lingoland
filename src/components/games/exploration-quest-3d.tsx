'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCw, 
  RotateCcw, 
  Search, 
  Sparkles, 
  Maximize, 
  Minimize, 
  Volume2, 
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Crosshair,
  RefreshCw,
  Eye,
  Compass,
  Target,
  Headphones,
  Award,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { logAnalyticsEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface QuestItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  phonetics: string;
  color: string;
}

const ALL_OBJECTS: QuestItem[] = [
  // --- Original Classics ---
  { id: 'fridge', name: 'Refrigerator', emoji: '❄️', description: 'A large appliance used to keep food cold.', phonetics: '/rɪˈfrɪdʒəreɪtər/', color: 'border-blue-400' },
  { id: 'toaster', name: 'Toaster', emoji: '🍞', description: 'An electrical appliance used to brown bread.', phonetics: '/ˈtoʊstər/', color: 'border-amber-400' },
  { id: 'clock', name: 'Clock', emoji: '⏰', description: 'Used to measure and display time.', phonetics: '/klɑːk/', color: 'border-pink-400' },
  { id: 'cabinet', name: 'Cabinet', emoji: '🗄️', description: 'A cupboard with shelves for storing items.', phonetics: '/ˈkæbɪnət/', color: 'border-purple-400' },
  { id: 'sink', name: 'Sink', emoji: '🚰', description: 'A basin used for washing hands and dishes.', phonetics: '/sɪŋk/', color: 'border-teal-400' },
  { id: 'window', name: 'Window', emoji: '🪟', description: 'An opening in a wall to let in light and air.', phonetics: '/ˈwɪndoʊ/', color: 'border-sky-300' },
  { id: 'microwave', name: 'Microwave', emoji: '📻', description: 'Oven that cooks food very quickly.', phonetics: '/ˈmaɪkrəweɪv/', color: 'border-slate-400' },
  { id: 'blender', name: 'Blender', emoji: '🥤', description: 'Used to mix or puree food and liquids.', phonetics: '/ˈblɛndər/', color: 'border-fuchsia-400' },
  { id: 'pan', name: 'Frying Pan', emoji: '🍳', description: 'A flat-bottomed pan used for frying.', phonetics: '/pæn/', color: 'border-zinc-400' },
  { id: 'plate', name: 'Plate', emoji: '🍽️', description: 'A flat dish from which food is eaten.', phonetics: '/pleɪt/', color: 'border-slate-300' },
  { id: 'chair', name: 'Chair', emoji: '🪑', description: 'A separate seat for one person.', phonetics: '/tʃɛər/', color: 'border-amber-600' },
  { id: 'plant', name: 'Plant', emoji: '🪴', description: 'A living organism such as a flower or shrub.', phonetics: '/plænt/', color: 'border-green-400' },
  { id: 'broom', name: 'Broom', emoji: '🧹', description: 'Used for sweeping floors.', phonetics: '/bruːm/', color: 'border-yellow-500' },
  { id: 'trash', name: 'Trash Can', emoji: '🗑️', description: 'A container for waste.', phonetics: '/træʃ/', color: 'border-zinc-300' },
  { id: 'mug', name: 'Mug', emoji: '☕', description: 'A large cup, typically used for hot drinks.', phonetics: '/mʌɡ/', color: 'border-red-300' },
  { id: 'apple', name: 'Apple', emoji: '🍎', description: 'A round fruit with red or green skin.', phonetics: '/ˈæpəl/', color: 'border-red-400' },
  { id: 'book', name: 'Book', emoji: '📖', description: 'Written or printed work consisting of pages.', phonetics: '/bʊk/', color: 'border-blue-300' },
  { id: 'lamp', name: 'Lamp', emoji: '💡', description: 'A device for giving light.', phonetics: '/læmp/', color: 'border-yellow-300' },
  { id: 'laptop', name: 'Laptop', emoji: '💻', description: 'A portable computer.', phonetics: '/ˈlæptɒp/', color: 'border-slate-400' },
  { id: 'keys', name: 'Keys', emoji: '🔑', description: 'A small piece of shaped metal to open a lock.', phonetics: '/kiːz/', color: 'border-amber-400' },
  { id: 'wallet', name: 'Wallet', emoji: '👛', description: 'A pocket-sized, flat, folding holder for money.', phonetics: '/ˈwɒlɪt/', color: 'border-orange-700' },
  { id: 'shoes', name: 'Shoes', emoji: '👞', description: 'Coverings for the feet.', phonetics: '/ʃuːz/', color: 'border-orange-800' },
  { id: 'coat', name: 'Coat', emoji: '🧥', description: 'An outer garment worn outdoors.', phonetics: '/koʊt/', color: 'border-stone-400' },
  { id: 'hat', name: 'Hat', emoji: '🧢', description: 'A shaped covering for the head.', phonetics: '/hæt/', color: 'border-blue-500' },
  { id: 'umbrella', name: 'Umbrella', emoji: '🌂', description: 'A portable circular canopy protecting from rain.', phonetics: '/ʌmˈbrɛlə/', color: 'border-purple-500' },
  { id: 'backpack', name: 'Backpack', emoji: '🎒', description: 'A bag supported by shoulder straps.', phonetics: '/ˈbækpæk/', color: 'border-red-500' },
  { id: 'glasses', name: 'Glasses', emoji: '👓', description: 'Lenses worn to aid vision.', phonetics: '/ˈɡlæsɪz/', color: 'border-sky-400' },
  { id: 'watch', name: 'Watch', emoji: '⌚', description: 'A small timepiece worn typically on a strap.', phonetics: '/wɒtʃ/', color: 'border-zinc-400' },
  { id: 'camera', name: 'Camera', emoji: '📷', description: 'A device for recording visual images.', phonetics: '/ˈkæmərə/', color: 'border-slate-500' },
  { id: 'headphones', name: 'Headphones', emoji: '🎧', description: 'A pair of earphones worn over the head.', phonetics: '/ˈhɛdfoʊnz/', color: 'border-indigo-400' },
  { id: 'teddy', name: 'Teddy Bear', emoji: '🧸', description: 'A soft toy bear.', phonetics: '/ˈtɛdi bɛər/', color: 'border-amber-500' },
  { id: 'guitar', name: 'Guitar', emoji: '🎸', description: 'A stringed musical instrument.', phonetics: '/ɡɪˈtɑːr/', color: 'border-red-600' },
  { id: 'soccer', name: 'Soccer Ball', emoji: '⚽', description: 'A round ball used in soccer.', phonetics: '/ˈsɒkər bɔːl/', color: 'border-slate-200' },
  { id: 'basketball', name: 'Basketball', emoji: '🏀', description: 'A large round ball used in basketball.', phonetics: '/ˈbæskɪtbɔːl/', color: 'border-orange-400' },
  { id: 'tennis', name: 'Tennis Racket', emoji: '🎾', description: 'Used to hit a tennis ball.', phonetics: '/ˈtɛnɪs ˈrækɪt/', color: 'border-lime-300' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', description: 'A savory dish of Italian origin.', phonetics: '/ˈpiːtsə/', color: 'border-yellow-300' },
  { id: 'burger', name: 'Burger', emoji: '🍔', description: 'A sandwich consisting of one or more cooked patties.', phonetics: '/ˈbɜːrɡər/', color: 'border-amber-400' },
  { id: 'donut', name: 'Donut', emoji: '🍩', description: 'A small ring-shaped friedcake.', phonetics: '/ˈdoʊnʌt/', color: 'border-pink-300' },
  { id: 'icecream', name: 'Ice Cream', emoji: '🍦', description: 'A sweetened frozen food.', phonetics: '/aɪs kriːm/', color: 'border-rose-200' },
  { id: 'cake', name: 'Cake', emoji: '🍰', description: 'An item of soft, sweet food made from baking.', phonetics: '/keɪk/', color: 'border-fuchsia-300' },
  { id: 'car', name: 'Toy Car', emoji: '🚗', description: 'A miniature road vehicle.', phonetics: '/tɔɪ kɑːr/', color: 'border-red-400' },
  { id: 'train', name: 'Toy Train', emoji: '🚂', description: 'A miniature connected railway carriage.', phonetics: '/tɔɪ treɪn/', color: 'border-stone-500' },
  { id: 'plane', name: 'Toy Plane', emoji: '✈️', description: 'A miniature flying vehicle.', phonetics: '/tɔɪ pleɪn/', color: 'border-sky-300' },
  { id: 'boat', name: 'Toy Boat', emoji: '⛵', description: 'A miniature vessel for water.', phonetics: '/tɔɪ boʊt/', color: 'border-blue-300' },
  { id: 'rocket', name: 'Toy Rocket', emoji: '🚀', description: 'A miniature spacecraft.', phonetics: '/tɔɪ ˈrɒkɪt/', color: 'border-cyan-400' },
  { id: 'scissors', name: 'Scissors', emoji: '✂️', description: 'An instrument used for cutting.', phonetics: '/ˈsɪzərz/', color: 'border-zinc-300' },
  { id: 'pencil', name: 'Pencil', emoji: '✏️', description: 'An instrument for writing or drawing.', phonetics: '/ˈpɛnsəl/', color: 'border-yellow-300' },
  { id: 'ruler', name: 'Ruler', emoji: '📏', description: 'A straight strip used to draw lines or measure.', phonetics: '/ˈruːlər/', color: 'border-emerald-300' },
  { id: 'globe', name: 'Globe', emoji: '🌍', description: 'A spherical representation of the earth.', phonetics: '/ɡloʊb/', color: 'border-blue-400' },
  { id: 'telescope', name: 'Telescope', emoji: '🔭', description: 'An optical instrument to make distant objects appear nearer.', phonetics: '/ˈtɛlɪskoʊp/', color: 'border-slate-500' },
  { id: 'microscope', name: 'Microscope', emoji: '🔬', description: 'An optical instrument used for viewing very small objects.', phonetics: '/ˈmaɪkrəskoʊp/', color: 'border-zinc-200' },
  { id: 'magnet', name: 'Magnet', emoji: '🧲', description: 'A piece of iron that exhibits magnetism.', phonetics: '/ˈmæɡnɪt/', color: 'border-red-400' },
  { id: 'battery', name: 'Battery', emoji: '🔋', description: 'A container consisting of one or more cells.', phonetics: '/ˈbætəri/', color: 'border-green-400' },
  { id: 'bulb', name: 'Lightbulb', emoji: '💡', description: 'A glass bulb that gives light.', phonetics: '/bʌlb/', color: 'border-yellow-200' },
  { id: 'key', name: 'Key', emoji: '🗝️', description: 'A small piece of metal used to fit a lock.', phonetics: '/kiː/', color: 'border-amber-300' },
  { id: 'lock', name: 'Lock', emoji: '🔒', description: 'A mechanism for fastening doors or lids.', phonetics: '/lɒk/', color: 'border-zinc-300' },
  { id: 'tools', name: 'Tools', emoji: '🛠️', description: 'Implements used to carry out practical work.', phonetics: '/tuːlz/', color: 'border-slate-400' },
  { id: 'hammer', name: 'Hammer', emoji: '🔨', description: 'A hand tool with a heavy head block.', phonetics: '/ˈhæmər/', color: 'border-zinc-400' },
  { id: 'wrench', name: 'Wrench', emoji: '🔧', description: 'A tool used for gripping and turning bolts.', phonetics: '/rɛntʃ/', color: 'border-slate-300' },
  { id: 'gear', name: 'Gear', emoji: '⚙️', description: 'A toothed wheel in mechanical assemblies.', phonetics: '/ɡɪər/', color: 'border-zinc-400' },
  { id: 'gem', name: 'Gemstone', emoji: '💎', description: 'A precious or semiprecious stone.', phonetics: '/ˈdʒɛmstoʊn/', color: 'border-cyan-300' },
  { id: 'coin', name: 'Coin', emoji: '🪙', description: 'A flat piece of metal used as currency.', phonetics: '/kɔɪn/', color: 'border-yellow-300' },
  { id: 'package', name: 'Package', emoji: '📦', description: 'A parcel packed in a sturdy box.', phonetics: '/ˈpækɪdʒ/', color: 'border-amber-500' },
  { id: 'gift', name: 'Gift', emoji: '🎁', description: 'A present given willingly.', phonetics: '/ɡɪft/', color: 'border-red-400' },
  { id: 'balloon', name: 'Balloon', emoji: '🎈', description: 'A colored rubber bag inflated with gas.', phonetics: '/bəˈluːn/', color: 'border-rose-400' },
  { id: 'trophy', name: 'Trophy', emoji: '🏆', description: 'A decorative cup awarded as a prize.', phonetics: '/ˈtroʊfi/', color: 'border-yellow-300' },
  { id: 'medal', name: 'Medal', emoji: '🏅', description: 'A stamped metal disk commemorating victory.', phonetics: '/ˈmɛdəl/', color: 'border-amber-300' },

  // --- Academic, Classroom & Scientific Tools ---
  { id: 'calculator', name: 'Calculator', emoji: '🧮', description: 'An electronic device used for mathematical calculations.', phonetics: '/ˈkælkjəleɪtər/', color: 'border-blue-400' },
  { id: 'notebook', name: 'Notebook', emoji: '📓', description: 'A book with blank or ruled pages for writing notes.', phonetics: '/ˈnoʊtbʊk/', color: 'border-slate-300' },
  { id: 'compass_math', name: 'Drawing Compass', emoji: '🧭', description: 'An instrument used for drawing circles and arcs.', phonetics: '/ˈkʌmpəs/', color: 'border-amber-400' },
  { id: 'stapler', name: 'Stapler', emoji: '🖇️', description: 'A device for fastening sheets of paper together with wire clips.', phonetics: '/ˈsteɪplər/', color: 'border-zinc-400' },
  { id: 'paperclip', name: 'Paperclip', emoji: '📎', description: 'A bent piece of wire used for holding papers together.', phonetics: '/ˈpeɪpərklɪp/', color: 'border-slate-300' },
  { id: 'paintbrush', name: 'Paintbrush', emoji: '🖌️', description: 'A brush used for applying paint or ink to a canvas.', phonetics: '/ˈpeɪntbrʌʃ/', color: 'border-red-400' },
  { id: 'palette', name: 'Artist Palette', emoji: '🎨', description: 'A thin board on which an artist mixes colors.', phonetics: '/ˈpælɪt/', color: 'border-pink-400' },
  { id: 'test_tube', name: 'Test Tube', emoji: '🧪', description: 'A glass tube used in scientific laboratories for holding liquids.', phonetics: '/tɛst tuːb/', color: 'border-emerald-400' },
  { id: 'prism', name: 'Optical Prism', emoji: '🌈', description: 'A transparent glass object that separates white light into a spectrum.', phonetics: '/ˈprɪzəm/', color: 'border-cyan-300' },
  { id: 'hourglass', name: 'Hourglass', emoji: '⏳', description: 'A device measuring time by the flow of sand through a narrow passage.', phonetics: '/ˈaʊərɡlæs/', color: 'border-amber-300' },
  { id: 'map', name: 'World Map', emoji: '🗺️', description: 'A diagrammatic representation of an area of land or sea.', phonetics: '/mæp/', color: 'border-teal-400' },
  { id: 'blackboard', name: 'Chalkboard', emoji: '📋', description: 'A reusable writing surface on which text is written with chalk.', phonetics: '/ˈtʃɔːkbɔːrd/', color: 'border-green-600' },
  { id: 'calendar', name: 'Calendar', emoji: '📅', description: 'A chart showing days, weeks, and months of a particular year.', phonetics: '/ˈkæləndər/', color: 'border-rose-400' },
  { id: 'diploma', name: 'Diploma', emoji: '📜', description: 'An official certificate acknowledging completion of study.', phonetics: '/dɪˈploʊmə/', color: 'border-amber-200' },
  { id: 'magnifier', name: 'Magnifying Glass', emoji: '🔍', description: 'A convex lens used to produce an enlarged image of an object.', phonetics: '/ˈmæɡnɪfaɪər/', color: 'border-indigo-400' },
  { id: 'bookmark', name: 'Bookmark', emoji: '🔖', description: 'A strip of leather or card used to mark one\'s place in a book.', phonetics: '/ˈbʊkmɑːrk/', color: 'border-red-300' },
  { id: 'megaphone', name: 'Megaphone', emoji: '📢', description: 'A cone-shaped device used to amplify the human voice.', phonetics: '/ˈmɛɡəfoʊn/', color: 'border-yellow-400' },
  { id: 'bell', name: 'School Bell', emoji: '🔔', description: 'A hollow metallic device that sounds a clear musical note when struck.', phonetics: '/bɛl/', color: 'border-yellow-300' },
  { id: 'envelope', name: 'Envelope', emoji: '✉️', description: 'A flat paper container used for enclosing letters or documents.', phonetics: '/ˈɛnvəloʊp/', color: 'border-slate-300' },
  { id: 'fountain_pen', name: 'Fountain Pen', emoji: '✒️', description: 'A pen that contains a reservoir of liquid ink.', phonetics: '/ˈfaʊntən pɛn/', color: 'border-zinc-400' },

  // --- Nature, Geography, Animals & Plants ---
  { id: 'volcano', name: 'Volcano', emoji: '🌋', description: 'A mountain with an opening through which lava and gas erupt.', phonetics: '/vɒlˈkeɪnoʊ/', color: 'border-orange-500' },
  { id: 'mountain', name: 'Mountain Peak', emoji: '🏔️', description: 'A large natural elevation of the earth\'s surface rising abruptly.', phonetics: '/ˈmaʊntən/', color: 'border-slate-400' },
  { id: 'sunflower', name: 'Sunflower', emoji: '🌻', description: 'A tall plant with a large, bright yellow flower head.', phonetics: '/ˈsʌnflaʊər/', color: 'border-yellow-400' },
  { id: 'cactus', name: 'Cactus', emoji: '🌵', description: 'A succulent plant with sharp spines adapted to desert life.', phonetics: '/ˈkæktəs/', color: 'border-emerald-500' },
  { id: 'mushroom', name: 'Mushroom', emoji: '🍄', description: 'A fungal growth with a domed cap on a stalk.', phonetics: '/ˈmʌʃruːm/', color: 'border-rose-400' },
  { id: 'tree', name: 'Oak Tree', emoji: '🌳', description: 'A woody perennial plant typically having a single main stem.', phonetics: '/triː/', color: 'border-green-500' },
  { id: 'leaf', name: 'Maple Leaf', emoji: '🍁', description: 'A flattened green outgrowth from the stem of a vascular plant.', phonetics: '/liːf/', color: 'border-orange-400' },
  { id: 'seashell', name: 'Seashell', emoji: '🐚', description: 'The hard protective outer casing of a marine mollusk.', phonetics: '/ˈsiːʃɛl/', color: 'border-pink-200' },
  { id: 'coral', name: 'Coral Reef', emoji: '🪸', description: 'Marine invertebrates living in compact colonies of polyps.', phonetics: '/ˈkɔːrəl/', color: 'border-rose-400' },
  { id: 'feather', name: 'Bird Feather', emoji: '🪶', description: 'One of the flat epidermal growths forming a bird\'s plumage.', phonetics: '/ˈfɛðər/', color: 'border-sky-300' },
  { id: 'butterfly', name: 'Butterfly', emoji: '🦋', description: 'An insect with large, brightly colored wings.', phonetics: '/ˈbʌtərflaɪ/', color: 'border-indigo-400' },
  { id: 'honeybee', name: 'Honeybee', emoji: '🐝', description: 'A winged stinging insect that gathers pollen and makes honey.', phonetics: '/ˈhʌnibiː/', color: 'border-yellow-400' },
  { id: 'owl', name: 'Wise Owl', emoji: '🦉', description: 'A nocturnal bird of prey with large forward-facing eyes.', phonetics: '/aʊl/', color: 'border-amber-600' },
  { id: 'dolphin', name: 'Dolphin', emoji: '🐬', description: 'An intelligent marine mammal with a streamlined body and blowhole.', phonetics: '/ˈdɒlfɪn/', color: 'border-cyan-400' },
  { id: 'whale', name: 'Whale', emoji: '🐋', description: 'A very large marine mammal that breathes through a blowhole.', phonetics: '/weɪl/', color: 'border-blue-500' },
  { id: 'turtle', name: 'Sea Turtle', emoji: '🐢', description: 'A reptile with a hard bony or leathery shell protecting its body.', phonetics: '/ˈtɜːrtəl/', color: 'border-emerald-400' },
  { id: 'penguin', name: 'Penguin', emoji: '🐧', description: 'A flightless seabird of southern waters with flippers for swimming.', phonetics: '/ˈpɛŋɡwɪn/', color: 'border-zinc-300' },
  { id: 'fox', name: 'Red Fox', emoji: '🦊', description: 'A carnivorous mammal of the dog family with a pointed muzzle and bushy tail.', phonetics: '/fɒks/', color: 'border-orange-500' },
  { id: 'panda', name: 'Giant Panda', emoji: '🐼', description: 'A large bear-like mammal with characteristic black-and-white markings.', phonetics: '/ˈpændə/', color: 'border-slate-300' },
  { id: 'koala', name: 'Koala', emoji: '🐨', description: 'An Australian arboreal marsupial with thick gray fur and large round ears.', phonetics: '/koʊˈɑːlə/', color: 'border-stone-400' },
  { id: 'elephant', name: 'Elephant', emoji: '🐘', description: 'A very large mammal with a trunk, large ear flaps, and tusks.', phonetics: '/ˈɛlɪfənt/', color: 'border-slate-400' },
  { id: 'lion', name: 'Lion', emoji: '🦁', description: 'A large tawny-colored cat of the African savanna.', phonetics: '/ˈlaɪən/', color: 'border-amber-500' },

  // --- Food, Kitchen & Refreshments ---
  { id: 'banana', name: 'Banana', emoji: '🍌', description: 'A curved yellow tropical fruit with a thick skin and soft sweet flesh.', phonetics: '/bəˈnænə/', color: 'border-yellow-400' },
  { id: 'orange', name: 'Orange', emoji: '🍊', description: 'A round citrus fruit with a tough bright reddish-yellow rind.', phonetics: '/ˈɔːrɪndʒ/', color: 'border-orange-400' },
  { id: 'strawberry', name: 'Strawberry', emoji: '🍓', description: 'A sweet soft red fruit with a seed-studded surface.', phonetics: '/ˈstrɔːbɛri/', color: 'border-red-400' },
  { id: 'watermelon', name: 'Watermelon', emoji: '🍉', description: 'A large fruit with a thick green rind and juicy sweet red pulp.', phonetics: '/ˈwɔːtərmɛlən/', color: 'border-rose-400' },
  { id: 'grapes', name: 'Grapes', emoji: '🍇', description: 'A berry growing in clusters, used for making wine or eaten raw.', phonetics: '/ɡreɪps/', color: 'border-purple-400' },
  { id: 'pineapple', name: 'Pineapple', emoji: '🍍', description: 'A large juicy tropical fruit with a tough spiky rind.', phonetics: '/ˈpaɪnæpəl/', color: 'border-amber-400' },
  { id: 'peach', name: 'Peach', emoji: '🍑', description: 'A round fruit with juicy yellow flesh and a velvety downy skin.', phonetics: '/piːtʃ/', color: 'border-rose-300' },
  { id: 'cherry', name: 'Cherries', emoji: '🍒', description: 'Small round fruit with shiny red or purple skin and a central stone.', phonetics: '/ˈtʃɛri/', color: 'border-red-500' },
  { id: 'avocado', name: 'Avocado', emoji: '🥑', description: 'A pear-shaped fruit with a rough skin and oily edible pulp.', phonetics: '/ˌævəˈkɑːdoʊ/', color: 'border-lime-500' },
  { id: 'carrot', name: 'Carrot', emoji: '🥕', description: 'A tapering orange root vegetable eaten cooked or raw.', phonetics: '/ˈkærət/', color: 'border-orange-400' },
  { id: 'corn', name: 'Corn', emoji: '🌽', description: 'A cereal plant that yields large grains set in rows on a cob.', phonetics: '/kɔːrn/', color: 'border-yellow-400' },
  { id: 'croissant', name: 'Croissant', emoji: '🥐', description: 'A crescent-shaped roll made of layered yeast-leavened dough.', phonetics: '/krwɑːˈsɑːŋ/', color: 'border-amber-300' },
  { id: 'sandwich', name: 'Sandwich', emoji: '🥪', description: 'Two slices of bread with meat, cheese, or vegetables between them.', phonetics: '/ˈsænwɪtʃ/', color: 'border-amber-400' },
  { id: 'sushi', name: 'Sushi', emoji: '🍣', description: 'A Japanese dish of prepared vinegared rice with raw seafood or vegetables.', phonetics: '/ˈsuːʃi/', color: 'border-red-400' },
  { id: 'teapot', name: 'Teapot', emoji: '🫖', description: 'A pot with a handle, spout, and lid, in which tea is brewed.', phonetics: '/ˈtiːpɒt/', color: 'border-teal-400' },
  { id: 'thermos', name: 'Thermos Flask', emoji: '🍶', description: 'An insulated vacuum bottle used to keep liquids hot or cold.', phonetics: '/ˈθɜːrməs/', color: 'border-cyan-300' },
  { id: 'salt', name: 'Salt Shaker', emoji: '🧂', description: 'A container with a perforated top used to sprinkle table salt.', phonetics: '/sɔːlt ˈʃeɪkər/', color: 'border-slate-300' },
  { id: 'honey', name: 'Honey Pot', emoji: '🍯', description: 'A sweet sticky yellowish-brown fluid made by bees and stored in jars.', phonetics: '/ˈhʌni/', color: 'border-amber-400' },
  { id: 'cheese', name: 'Cheese', emoji: '🧀', description: 'A food made from pressed curds of milk, solid and flavorful.', phonetics: '/tʃiːz/', color: 'border-yellow-300' },
  { id: 'pretzel', name: 'Pretzel', emoji: '🥨', description: 'A crisp biscuit baked in the shape of a knot.', phonetics: '/ˈprɛtsəl/', color: 'border-amber-600' },

  // --- Music, Sound & Performing Arts ---
  { id: 'violin', name: 'Violin', emoji: '🎻', description: 'A wooden string instrument played with a bow.', phonetics: '/ˌvaɪəˈlɪn/', color: 'border-amber-600' },
  { id: 'drum', name: 'Drum', emoji: '🥁', description: 'A percussion instrument sounded by being struck with sticks.', phonetics: '/drʌm/', color: 'border-red-400' },
  { id: 'saxophone', name: 'Saxophone', emoji: '🎷', description: 'A brass wind instrument with a reed mouthpiece and keys.', phonetics: '/ˈsæksəfoʊn/', color: 'border-amber-400' },
  { id: 'trumpet', name: 'Trumpet', emoji: '🎺', description: 'A flared brass wind instrument with three valves.', phonetics: '/ˈtrʌmpɪt/', color: 'border-yellow-300' },
  { id: 'piano', name: 'Grand Piano', emoji: '🎹', description: 'A large musical instrument with a manual keyboard and hammer action.', phonetics: '/piˈænoʊ/', color: 'border-slate-300' },
  { id: 'microphone', name: 'Microphone', emoji: '🎙️', description: 'An instrument for converting sound waves into electrical energy.', phonetics: '/ˈmaɪkrəfoʊn/', color: 'border-indigo-400' },
  { id: 'radio', name: 'Radio', emoji: '📻', description: 'An apparatus for receiving broadcasting sound signals.', phonetics: '/ˈreɪdioʊ/', color: 'border-stone-400' },
  { id: 'speaker', name: 'Audio Speaker', emoji: '🔊', description: 'An electroacoustic transducer that converts electrical audio signals into sound.', phonetics: '/ˈspiːkər/', color: 'border-slate-400' },

  // --- Games, Sports & Hobbies ---
  { id: 'skateboard', name: 'Skateboard', emoji: '🛹', description: 'A short narrow board with two small wheels attached to each end.', phonetics: '/ˈskeɪtbɔːrd/', color: 'border-rose-400' },
  { id: 'bicycle', name: 'Bicycle', emoji: '🚲', description: 'A vehicle composed of two wheels held in a frame one behind the other.', phonetics: '/ˈbaɪsɪkəl/', color: 'border-cyan-400' },
  { id: 'controller', name: 'Gamepad', emoji: '🎮', description: 'An input device used with video games to control game objects.', phonetics: '/ˈɡeɪmpæd/', color: 'border-purple-400' },
  { id: 'dice', name: 'Dice', emoji: '🎲', description: 'Small cubes with each face marked with a different number of spots.', phonetics: '/daɪs/', color: 'border-red-300' },
  { id: 'chess', name: 'Chess Knight', emoji: '♟️', description: 'A strategic board game played on a checkered board.', phonetics: '/tʃɛs/', color: 'border-slate-300' },
  { id: 'kite', name: 'Flying Kite', emoji: '🪁', description: 'A light frame covered with paper or cloth flown in the wind on a string.', phonetics: '/kaɪt/', color: 'border-amber-400' },
  { id: 'dart', name: 'Dart Board', emoji: '🎯', description: 'A game in which small pointed missiles are thrown at a circular target.', phonetics: '/dɑːrt/', color: 'border-red-500' },
  { id: 'baseball', name: 'Baseball', emoji: '⚾', description: 'A hard ball used in baseball games.', phonetics: '/ˈbeɪsbɔːl/', color: 'border-slate-200' },
  { id: 'volleyball', name: 'Volleyball', emoji: '🏐', description: 'A ball used in a team game played by hitting it over a high net.', phonetics: '/ˈvɒlibɔːl/', color: 'border-yellow-300' },
  { id: 'bow_arrow', name: 'Bow and Arrow', emoji: '🏹', description: 'A traditional projectile weapon used in archery.', phonetics: '/boʊ ænd ˈæroʊ/', color: 'border-amber-500' },

  // --- Space, Weather & Celestial Objects ---
  { id: 'sun', name: 'Sun', emoji: '☀️', description: 'The luminous celestial body around which the earth and planets revolve.', phonetics: '/sʌn/', color: 'border-amber-300' },
  { id: 'moon', name: 'Crescent Moon', emoji: '🌙', description: 'The natural satellite of the earth, visible by reflected sunlight.', phonetics: '/muːn/', color: 'border-yellow-200' },
  { id: 'star', name: 'Glowing Star', emoji: '⭐', description: 'A fixed luminous point in the night sky which is a large remote incandescent body.', phonetics: '/stɑːr/', color: 'border-yellow-300' },
  { id: 'comet', name: 'Comet', emoji: '☄️', description: 'A celestial object consisting of a nucleus of ice and dust with a tail of gas.', phonetics: '/ˈkɒmɪt/', color: 'border-cyan-400' },
  { id: 'satellite', name: 'Space Satellite', emoji: '🛰️', description: 'An artificial body placed in orbit around the earth or moon.', phonetics: '/ˈsætəlaɪt/', color: 'border-blue-300' },
  { id: 'snowflake', name: 'Snowflake', emoji: '❄️', description: 'A single feathery ice crystal falling as snow.', phonetics: '/ˈsnoʊfleɪk/', color: 'border-cyan-200' },
  { id: 'cloud', name: 'Rain Cloud', emoji: '🌧️', description: 'A visible mass of condensed water vapor floating in the atmosphere.', phonetics: '/klaʊd/', color: 'border-slate-400' },
  { id: 'lightning', name: 'Lightning Bolt', emoji: '⚡', description: 'A natural electrical discharge between a cloud and the ground.', phonetics: '/ˈlaɪtnɪŋ/', color: 'border-amber-300' },

  // --- Technology, Everyday Tools & Household Artifacts ---
  { id: 'smartphone', name: 'Smartphone', emoji: '📱', description: 'A portable cellular phone that performs many computer functions.', phonetics: '/ˈsmɑːrtfoʊn/', color: 'border-slate-400' },
  { id: 'tablet', name: 'Digital Tablet', emoji: '📲', description: 'A wireless touch screen personal computer smaller than a notebook.', phonetics: '/ˈtæblɪt/', color: 'border-sky-400' },
  { id: 'keyboard', name: 'Keyboard', emoji: '⌨️', description: 'A panel of keys that operate a computer or typewriter.', phonetics: '/ˈkiːbɔːrd/', color: 'border-slate-300' },
  { id: 'mouse', name: 'Computer Mouse', emoji: '🖱️', description: 'A handheld hardware input device used to control a cursor.', phonetics: '/maʊs/', color: 'border-slate-400' },
  { id: 'printer', name: 'Printer', emoji: '🖨️', description: 'A machine for printing text or pictures onto paper.', phonetics: '/ˈprɪntər/', color: 'border-stone-400' },
  { id: 'flashlight', name: 'Flashlight', emoji: '🔦', description: 'A portable battery-powered electric lamp.', phonetics: '/ˈflæʃlaɪt/', color: 'border-yellow-400' },
  { id: 'candle', name: 'Candle', emoji: '🕯️', description: 'A cylinder of wax with an embedded wick that is burned to provide light.', phonetics: '/ˈkændəl/', color: 'border-amber-300' },
  { id: 'lantern', name: 'Lantern', emoji: '🏮', description: 'A lamp with a transparent case protecting the flame or light.', phonetics: '/ˈlæntərn/', color: 'border-red-400' },
  { id: 'mirror', name: 'Mirror', emoji: '🪞', description: 'A reflective surface that reflects a clear image of objects.', phonetics: '/ˈmɪrər/', color: 'border-cyan-300' },
  { id: 'pillow', name: 'Pillow', emoji: '🛋️', description: 'A soft cushion for the head, especially in bed.', phonetics: '/ˈpɪloʊ/', color: 'border-indigo-300' },
  { id: 'bed', name: 'Bed', emoji: '🛏️', description: 'A piece of furniture for sleep or rest.', phonetics: '/bɛd/', color: 'border-purple-300' },
  { id: 'suitcase', name: 'Suitcase', emoji: '🧳', description: 'A case with a handle and a hinged lid, used for carrying clothes.', phonetics: '/ˈsuːtkeɪs/', color: 'border-amber-500' },
  { id: 'anchor', name: 'Anchor', emoji: '⚓', description: 'A heavy metal device cast overboard to keep a vessel from drifting.', phonetics: '/ˈæŋkər/', color: 'border-slate-500' },
  { id: 'shield', name: 'Knight Shield', emoji: '🛡️', description: 'A broad piece of armor carried on the arm to deflect blows.', phonetics: '/ʃiːld/', color: 'border-blue-400' },
  { id: 'sword', name: 'Sword', emoji: '⚔️', description: 'A weapon with a long metal blade and a hilt.', phonetics: '/sɔːrd/', color: 'border-zinc-300' },
  { id: 'crown', name: 'Golden Crown', emoji: '👑', description: 'A decorative ornamental headdress worn by a monarch.', phonetics: '/kraʊn/', color: 'border-yellow-300' },
  { id: 'ring', name: 'Diamond Ring', emoji: '💍', description: 'A small circular band worn on a finger as an ornamental jewelry.', phonetics: '/rɪŋ/', color: 'border-cyan-300' },
  { id: 'stopwatch', name: 'Stopwatch', emoji: '⏱️', description: 'A handheld timepiece designed to measure the amount of time elapsed.', phonetics: '/ˈstɒpwɒtʃ/', color: 'border-amber-400' },
  { id: 'alarm_clock', name: 'Alarm Clock', emoji: '⏰', description: 'A clock that can be set to sound at a particular time to wake someone.', phonetics: '/əˈlɑːrm klɑːk/', color: 'border-red-400' },
  { id: 'helmet', name: 'Safety Helmet', emoji: '⛑️', description: 'A hard or padded protective hat.', phonetics: '/ˈhɛlmɪt/', color: 'border-red-400' },
  { id: 'bandage', name: 'Adhesive Bandage', emoji: '🩹', description: 'A strip of material used to bind up or protect a wound.', phonetics: '/ˈbændɪdʒ/', color: 'border-amber-300' },
  { id: 'stethoscope', name: 'Stethoscope', emoji: '🩺', description: 'A medical instrument for listening to the action of someone\'s heart or breathing.', phonetics: '/ˈstɛθəskoʊp/', color: 'border-teal-400' },
  { id: 'syringe', name: 'Syringe', emoji: '💉', description: 'A medical device used to inject or withdraw fluids.', phonetics: '/sɪˈrɪndʒ/', color: 'border-sky-300' },
  { id: 'pill', name: 'Medicine Pill', emoji: '💊', description: 'A small round mass of solid medicine to be swallowed whole.', phonetics: '/pɪl/', color: 'border-rose-400' },
  { id: 'fire_extinguisher', name: 'Fire Extinguisher', emoji: '🧯', description: 'A portable device discharging foam or gas to quench a fire.', phonetics: '/ˈfaɪər ɪkˈstɪŋɡwɪʃər/', color: 'border-red-600' },
  { id: 'traffic_light', name: 'Traffic Light', emoji: '🚦', description: 'A set of automatically operated colored lights controlling traffic.', phonetics: '/ˈtræfɪk laɪt/', color: 'border-yellow-500' },
  { id: 'ticket', name: 'Admission Ticket', emoji: '🎟️', description: 'A piece of paper entitling the holder to enter a venue or travel.', phonetics: '/ˈtɪkɪt/', color: 'border-amber-400' },
  { id: 'receipt', name: 'Sales Receipt', emoji: '🧾', description: 'A written or printed acknowledgment of having received payment.', phonetics: '/rɪˈsiːt/', color: 'border-slate-300' },
  { id: 'passport', name: 'Passport', emoji: '🛂', description: 'An official document issued by a government certifying identity for travel.', phonetics: '/ˈpæspɔːrt/', color: 'border-blue-500' },
  { id: 'luggage', name: 'Luggage Cart', emoji: '🛅', description: 'Suitcases or other bags in which to pack personal belongings for traveling.', phonetics: '/ˈlʌɡɪdʒ/', color: 'border-amber-400' },

  // --- Exploration, Architecture & Wonders ---
  { id: 'windmill', name: 'Windmill', emoji: '💨', description: 'A building or mill with sails or vanes turned by the wind.', phonetics: '/ˈwɪndmɪl/', color: 'border-cyan-400' },
  { id: 'lighthouse', name: 'Lighthouse', emoji: '🗼', description: 'A tower with a beacon light to warn or guide ships at sea.', phonetics: '/ˈlaɪthaʊs/', color: 'border-red-400' },
  { id: 'canoe', name: 'Canoe', emoji: '🛶', description: 'A narrow boat with pointed ends, propelled with a paddle.', phonetics: '/kəˈnuː/', color: 'border-amber-500' },
  { id: 'helicopter', name: 'Helicopter', emoji: '🚁', description: 'An aircraft whose lift is derived from horizontal revolving rotors.', phonetics: '/ˈhɛlɪkɒptər/', color: 'border-sky-400' },
  { id: 'submarine', name: 'Submarine', emoji: '🤿', description: 'A warship or vessel capable of submerging and operating underwater.', phonetics: '/ˌsʌbməˈriːn/', color: 'border-teal-400' },
  { id: 'parachute', name: 'Parachute', emoji: '🪂', description: 'A cloth canopy allowing descending safely from an aircraft.', phonetics: '/ˈpærəʃuːt/', color: 'border-orange-400' },
  { id: 'tent', name: 'Camping Tent', emoji: '⛺', description: 'A portable shelter made of cloth supported by poles and ropes.', phonetics: '/tɛnt/', color: 'border-green-400' },
  { id: 'campfire', name: 'Campfire', emoji: '🔥', description: 'An open-air fire in a camp used for warmth and cooking.', phonetics: '/ˈkæmpfaɪər/', color: 'border-orange-500' },
  { id: 'hot_air_balloon', name: 'Hot Air Balloon', emoji: '🎈', description: 'A large balloon bag inflated with heated air to carry passengers in a basket.', phonetics: '/hɒt ɛər bəˈluːn/', color: 'border-rose-400' },
  { id: 'bridge', name: 'Suspension Bridge', emoji: '🌉', description: 'A structure carrying a road or path across a river or obstacle.', phonetics: '/brɪdʒ/', color: 'border-indigo-400' },
  { id: 'castle', name: 'Medieval Castle', emoji: '🏰', description: 'A large fortified building or fortress from medieval times.', phonetics: '/ˈkɑːsəl/', color: 'border-stone-400' },
  { id: 'statue', name: 'Sculpture Statue', emoji: '🗿', description: 'A carved or cast figure of a person or animal, especially life-size.', phonetics: '/ˈstætʃuː/', color: 'border-stone-300' },
  { id: 'pyramid', name: 'Ancient Pyramid', emoji: '🏜️', description: 'A monumental structure with a square or triangular base and sloping sides.', phonetics: '/ˈpɪrəmɪd/', color: 'border-yellow-400' },
  { id: 'treasure_chest', name: 'Treasure Chest', emoji: '🪙', description: 'A strong wooden box filled with gold, jewels, or precious items.', phonetics: '/ˈtrɛʒər tʃɛst/', color: 'border-amber-500' },
  { id: 'magic_wand', name: 'Magic Wand', emoji: '🪄', description: 'A rod used by a magician or wizard to perform magic or spells.', phonetics: '/ˈmædʒɪk wɒnd/', color: 'border-purple-400' },
  { id: 'crystal_ball', name: 'Crystal Ball', emoji: '🔮', description: 'A sphere of crystal or glass used for divination and vision.', phonetics: '/ˈkrɪstəl bɔːl/', color: 'border-fuchsia-400' },
  { id: 'musical_notes', name: 'Musical Score', emoji: '🎶', description: 'Written symbols indicating the pitch and duration of a musical sound.', phonetics: '/ˈmjuːzɪkəl skɔːr/', color: 'border-pink-300' },
  { id: 'yarn', name: 'Knitting Yarn', emoji: '🧶', description: 'Continuous spun fiber used in knitting, weaving, or sewing.', phonetics: '/jɑːrn/', color: 'border-rose-300' },
  { id: 'thread', name: 'Sewing Spool', emoji: '🧵', description: 'A long thin strand of cotton, nylon, or other fibers used in sewing.', phonetics: '/θrɛd/', color: 'border-purple-300' },
  { id: 'safety_pin', name: 'Safety Pin', emoji: '🧷', description: 'A pin with a point that is bent back to the head and held in a protective clasp.', phonetics: '/ˈseɪfti pɪn/', color: 'border-slate-300' },
  { id: 'sponge', name: 'Cleaning Sponge', emoji: '🧽', description: 'A piece of absorbent porous material used for washing and cleaning.', phonetics: '/spʌndʒ/', color: 'border-yellow-400' },
  { id: 'soap', name: 'Soap Bar', emoji: '🧼', description: 'A cleansing substance made by reacting fats and alkalis.', phonetics: '/soʊp/', color: 'border-teal-300' },
  { id: 'toothbrush', name: 'Toothbrush', emoji: '🪥', description: 'A small brush with a long handle used for cleaning teeth.', phonetics: '/ˈtuːθbrʌʃ/', color: 'border-cyan-400' },
  { id: 'comb', name: 'Hair Comb', emoji: '🪮', description: 'A strip of plastic or metal with a row of narrow teeth, used for untangling hair.', phonetics: '/koʊm/', color: 'border-amber-600' },
  { id: 'ladder', name: 'Step Ladder', emoji: '🪜', description: 'A series of rungs or steps between two uprights used for climbing up or down.', phonetics: '/ˈlædər/', color: 'border-amber-500' }
];

interface PlacedItem extends QuestItem {
  translateX: number;
  translateY: number;
  translateZ: number;
}

const RECENT_TARGETS_KEY = 'lingoland_exploration_quest_recent_targets';

const getRecentTargetIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(RECENT_TARGETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveRecentTargetIds = (newIds: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentTargetIds();
    // Remember up to 160 recent target IDs across playthroughs to guarantee no repetition
    const updated = Array.from(new Set([...existing, ...newIds])).slice(-160);
    sessionStorage.setItem(RECENT_TARGETS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
};

export function ExplorationQuest3D({ onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const { user } = useAuth();
  const firestore = useFirestore();

  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [rotation, setRotation] = React.useState(0); // Orbit Yaw (-180 to 180)
  const [pitch, setPitch] = React.useState(-14); // Orbit Pitch (-65 to 15)
  const [zoom, setZoom] = React.useState(1); // Zoom scale factor (0.6 to 1.5)
  const [isDragging, setIsDragging] = React.useState(false);
  
  const dragStart = React.useRef({ x: 0, y: 0 });
  const startRotation = React.useRef({ yaw: 0, pitch: -14 });
  const hasDragged = React.useRef(false);

  const [selectedItem, setSelectedItem] = React.useState<QuestItem | null>(null);
  const [targetItems, setTargetItems] = React.useState<string[]>([]);
  const [roomItems, setRoomItems] = React.useState<PlacedItem[]>([]);
  const [foundItems, setFoundItems] = React.useState<string[]>([]);
  const [gameState, setGameState] = React.useState<'idle' | 'playing' | 'finished'>('idle');
  const [speakActive, setSpeakActive] = React.useState(false);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Initialize target items with anti-repetition engine and spacious 3D distribution
  const initGame = () => {
    const recentIds = getRecentTargetIds();

    // 1. Filter out recently played target items so the player encounters brand new words
    let candidatePool = ALL_OBJECTS.filter(item => !recentIds.includes(item.id));

    // If pool is running low (< 16 items left), reset history to cycle freshly through all 210+ words
    if (candidatePool.length < 16) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(RECENT_TARGETS_KEY);
      }
      candidatePool = [...ALL_OBJECTS];
    }

    // Shuffle candidate pool
    const shuffledCandidates = [...candidatePool].sort(() => 0.5 - Math.random());

    // 2. Pick 8 completely fresh quest target items
    const selectedTargets = shuffledCandidates.slice(0, 8);
    const targetIds = selectedTargets.map(item => item.id);

    // 3. Pick 4 distractor items from remaining objects (also prioritizing unplayed items)
    const remainingCandidates = ALL_OBJECTS.filter(item => !targetIds.includes(item.id));
    const unplayedDistractors = remainingCandidates.filter(item => !recentIds.includes(item.id));
    const distractorPool = unplayedDistractors.length >= 4 ? unplayedDistractors : remainingCandidates;
    const shuffledDistractors = [...distractorPool].sort(() => 0.5 - Math.random());
    const distractors = shuffledDistractors.slice(0, 4);

    // 4. Combine 8 targets + 4 distractors = 12 total room items, shuffled randomly for 3D placement
    const selected = [...selectedTargets, ...distractors].sort(() => 0.5 - Math.random());

    // 5. Store targetIds in session storage so subsequent games will NOT repeat them
    saveRecentTargetIds(targetIds);
    
    // Spacious 3D distribution:
    // Radius ring: 220px to 410px from center.
    // 3 Distinct vertical heights:
    // - -110px: Upper Shelves / Wall displays
    // - 0px: Mid Counter / Tables
    // - +110px: Floor / Lower pedestals
    const placed: PlacedItem[] = [];
    const minDistanceXZ = 160; // Minimum 160px horizontal distance
    const minDistance3D = 180; // Minimum 180px 3D distance

    for (let i = 0; i < selected.length; i++) {
      const item = selected[i];
      let bestX = 0;
      let bestY = 0;
      let bestZ = 0;
      let foundSpot = false;

      // Try candidate positions around angular ring
      for (let attempt = 0; attempt < 80; attempt++) {
        const baseAngle = (i * (360 / selected.length) + (Math.random() * 26 - 13)) * (Math.PI / 180);
        const radius = 220 + Math.random() * 190;
        
        const candX = Math.round(Math.cos(baseAngle) * radius);
        const candZ = Math.round(Math.sin(baseAngle) * radius);
        
        // Stagger vertical heights evenly across tiers
        const tier = (i + attempt) % 3;
        const candY = tier === 0 ? -110 : tier === 1 ? 0 : 110;

        let tooClose = false;
        for (const existing of placed) {
          const distXZ = Math.hypot(candX - existing.translateX, candZ - existing.translateZ);
          const dist3D = Math.hypot(candX - existing.translateX, candY - existing.translateY, candZ - existing.translateZ);
          if (distXZ < minDistanceXZ || dist3D < minDistance3D) {
            tooClose = true;
            break;
          }
        }

        if (!tooClose) {
          bestX = candX;
          bestY = candY;
          bestZ = candZ;
          foundSpot = true;
          break;
        }
      }

      // Safe deterministic fallback
      if (!foundSpot) {
        const fallbackAngle = (i / selected.length) * 2 * Math.PI;
        bestX = Math.round(Math.cos(fallbackAngle) * 320);
        bestZ = Math.round(Math.sin(fallbackAngle) * 320);
        bestY = i % 3 === 0 ? -110 : i % 3 === 1 ? 0 : 110;
      }

      placed.push({
        ...item,
        translateX: bestX,
        translateY: bestY,
        translateZ: bestZ,
      });
    }

    setRoomItems(placed);
    setTargetItems(targets);
  };

  React.useEffect(() => {
    initGame();
  }, []);

  // Global mouse & touch dragging for orbit rotation
  React.useEffect(() => {
    if (!isDragging) return;

    const handleGlobalPointerMove = (e: PointerEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        hasDragged.current = true;
      }
      
      const newYaw = startRotation.current.yaw + dx * 0.42;
      const newPitch = startRotation.current.pitch - dy * 0.32;
      
      setRotation(newYaw);
      setPitch(Math.max(-65, Math.min(18, newPitch)));
    };

    const handleGlobalPointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);
    
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [isDragging]);

  const handleStartGame = () => {
    initGame();
    setGameState('playing');
    setFoundItems([]);
    setSelectedItem(null);
    setRotation(0);
    setPitch(-14);
    setZoom(1);
  };

  const handleSelectItem = (item: QuestItem) => {
    if (hasDragged.current) return;
    setSelectedItem(item);
    
    // Native pronunciation audio
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeakActive(true);
      const utterance = new SpeechSynthesisUtterance(item.name);
      utterance.rate = 0.95;
      utterance.onend = () => setSpeakActive(false);
      window.speechSynthesis.speak(utterance);
    }

    const currentTargetId = targetItems.find(id => !foundItems.includes(id));
    if (gameState === 'playing' && item.id === currentTargetId) {
      const nextFound = [...foundItems, item.id];
      setFoundItems(nextFound);
      
      if (nextFound.length === targetItems.length) {
        setGameState('finished');
        if (firestore) {
          logAnalyticsEvent(firestore, user?.uid || 'guest', {
            type: 'game_played',
            details: { slug: 'exploration-quest-3d', score: 100 }
          });
        }
        window.dispatchEvent(new CustomEvent('lingoland_game_completed_hijack', {
          detail: { state: 'finished' }
        }));
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    setIsDragging(true);
    hasDragged.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    startRotation.current = { yaw: rotation, pitch: pitch };
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.6, Math.min(1.5, z - e.deltaY * 0.0012)));
  };

  // Camera presets
  const handleRotateLeft = () => setRotation(r => r - 45);
  const handleRotateRight = () => setRotation(r => r + 45);
  const handleZoomIn = () => setZoom(z => Math.min(1.5, z + 0.15));
  const handleZoomOut = () => setZoom(z => Math.max(0.6, z - 0.15));
  const handleResetCamera = () => {
    setRotation(0);
    setPitch(-14);
    setZoom(1);
  };
  const handleOverviewCamera = () => {
    setRotation(0);
    setPitch(-52);
    setZoom(0.85);
  };

  // Aim camera directly at the current active target
  const currentTargetId = targetItems.find(id => !foundItems.includes(id));
  const currentTargetItem = ALL_OBJECTS.find(i => i.id === currentTargetId);


  return (
    <div className={cn(
      "w-full transition-all duration-500 flex flex-col bg-zinc-950 text-white relative overflow-hidden",
      isFullscreen 
        ? "min-h-screen h-screen w-full rounded-none border-none p-4 sm:p-6 lg:p-8 max-w-none justify-start" 
        : "w-full flex-1 min-h-[calc(100dvh-4.5rem)] rounded-2xl md:rounded-3xl p-4 sm:p-6 lg:p-8 border border-indigo-500/20 bg-zinc-950/90 backdrop-blur-2xl shadow-2xl justify-start"
    )}>
      {/* Background ambient light */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar - Always pinned at top */}
      <div className="w-full flex items-center justify-between border-b border-slate-900/80 pb-3 mb-4 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl">
            <Search className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-tight bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                3D Exploration & Questing
              </h2>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                CEFR B1–B2 • 210+ Words
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden xs:block">
              Interactive 360° quest with 210+ dynamic, non-repeating vocabulary words and authentic native audio.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onToggleFullscreen && (
            <button 
              onClick={onToggleFullscreen} 
              className="h-9 px-3 flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-slate-800/80 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              <span className="hidden md:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex-1 w-full flex flex-col justify-center items-center py-4 sm:py-6 z-10"
          >
            <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
              {/* Hero Banner Header */}
              <div className="w-full text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-black uppercase tracking-widest shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span>210+ Non-Repeating Words • Interactive 3D Dimension</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  Vocabulary Quest
                </h1>
                <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal">
                  Step into an interactive 360° virtual room. Rotate the camera in any direction, zoom in with your scroll wheel, hear native pronunciations, and locate all hidden quest targets!
                </p>
              </div>

              {/* 3-Column Feature Briefing Grid Spanning Full Width */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 w-full">
                {/* Feature 1: The Objective */}
                <div className="bg-slate-900/60 border border-indigo-500/20 hover:border-indigo-500/40 rounded-2xl p-5 backdrop-blur-xl transition-all shadow-xl flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <Target className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">
                        8 Fresh Targets
                      </h3>
                      <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                        Zero Repeat
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Drawn from an expansive library of 210+ CEFR vocabulary items. Our anti-repetition engine guarantees a brand-new set of words every time you play!
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-indigo-300">
                    <span>Curriculum Library</span>
                    <span className="font-mono bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/30">210+ Words • Anti-Repeat</span>
                  </div>
                </div>

                {/* Feature 2: 360° Spatial Arena */}
                <div className="bg-slate-900/60 border border-purple-500/20 hover:border-purple-500/40 rounded-2xl p-5 backdrop-blur-xl transition-all shadow-xl flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <RotateCw className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                      360° Orbit & Zoom
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Click and drag across the room to look around walls, shelves, and floors. Scroll with your mouse wheel or HUD buttons to zoom.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-purple-300">
                    <span>Spatial Controls</span>
                    <span className="font-mono bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/30">Drag • Wheel • HUD</span>
                  </div>
                </div>

                {/* Feature 3: Native Pronunciation Audio */}
                <div className="bg-slate-900/60 border border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl p-5 backdrop-blur-xl transition-all shadow-xl flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      <Headphones className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                      Native Audio & IPA
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Listen to authentic native speech pronunciations for every target. Study IPA phonetic symbols and English definitions on demand.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-cyan-300">
                    <span>Speech Synthesis</span>
                    <span className="font-mono bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">Native Audio</span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Launch Bar */}
              <div className="w-full bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wide">
                      Dynamic Non-Repeating Quests
                    </h4>
                    <p className="text-xs text-slate-400">
                      210+ vocabulary items across science, academics, nature & culture. Play again and again with fresh words every round!
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleStartGame}
                  className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-500 text-white font-black uppercase text-sm tracking-widest rounded-xl transition-all shadow-[0_4px_25px_rgba(99,102,241,0.5)] hover:scale-105 active:scale-95 flex items-center justify-center gap-3 border border-indigo-400/40 shrink-0"
                >
                  <Sparkles className="h-5 w-5 text-indigo-200 animate-spin" />
                  <span>Begin Quest</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-5 z-10"
          >
            {/* Left Control Panel: Current Objective & Quest Roadmap (3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="bg-slate-950/90 border-2 border-indigo-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between h-full backdrop-blur-xl shadow-2xl space-y-4">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/40 px-3 py-1.5 rounded-xl shadow-sm">
                      <Crosshair className="w-4 h-4 text-indigo-300 animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-200">
                        Current Objective
                      </span>
                    </div>
                    <div className="bg-slate-800/90 border border-slate-700/80 px-3 py-1 rounded-lg text-xs font-mono font-black text-cyan-300 shadow-inner">
                      {foundItems.length + 1} of {targetItems.length}
                    </div>
                  </div>

                  {currentTargetItem ? (
                    <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-indigo-400/60 rounded-2xl space-y-3 relative overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.25)]">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">
                            Seek & Identify
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mt-0.5">
                            {currentTargetItem.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => {
                            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                              const u = new SpeechSynthesisUtterance(currentTargetItem.name);
                              window.speechSynthesis.speak(u);
                            }
                          }}
                          className="p-2.5 rounded-xl bg-indigo-500/25 border border-indigo-400/50 text-indigo-200 hover:text-white hover:bg-indigo-500/40 transition-all shadow-sm active:scale-95"
                          title="Listen to Target Pronunciation"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="inline-flex items-center gap-1.5 bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 rounded-lg">
                        <span className="text-xs font-mono font-bold text-cyan-300">
                          {currentTargetItem.phonetics}
                        </span>
                      </div>

                      <div className="bg-slate-950/90 border border-slate-800/90 p-3.5 rounded-xl shadow-inner">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                          Definition Clue:
                        </span>
                        <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                          "{currentTargetItem.description}"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <h4 className="text-base font-black text-emerald-300">All Targets Cleared!</h4>
                    </div>
                  )}
                </div>

                {/* Quest Targets Roadmap - Fills empty space with a clean interactive target tracker */}
                <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                      Quest Targets
                    </span>
                    <span className="text-emerald-400 font-black">
                      {foundItems.length}/{targetItems.length} Found
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {targetItems.map((tid, idx) => {
                      const isFound = foundItems.includes(tid);
                      const isCurrent = tid === currentTargetId;
                      const matched = ALL_OBJECTS.find(o => o.id === tid);

                      return (
                        <div
                          key={tid}
                          className={cn(
                            "p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center min-h-[50px]",
                            isFound
                              ? "bg-emerald-950/70 border-emerald-400/70 text-emerald-300"
                              : isCurrent
                              ? "bg-indigo-950/90 border-indigo-400 text-indigo-200 ring-1 ring-indigo-400/60 shadow-sm"
                              : "bg-slate-900/60 border-slate-800/80 text-slate-500"
                          )}
                          title={isFound ? `Found: ${matched?.name}` : isCurrent ? `Current: ${matched?.name}` : `Target #${idx + 1}`}
                        >
                          <span className="text-[11px] font-black uppercase">
                            {isFound ? "✓" : `#${idx + 1}`}
                          </span>
                          <span className="text-[9px] font-bold truncate w-full mt-0.5">
                            {isFound ? matched?.name : isCurrent ? matched?.name : "???"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress bar & Control hints */}
                <div className="border-t border-slate-900/90 pt-3 space-y-2">
                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                      style={{ width: `${(foundItems.length / targetItems.length) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold px-0.5 pt-0.5">
                    <span>Drag to Rotate 360°</span>
                    <span>Scroll Wheel to Zoom</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center 3D World Stage (6 cols) */}
            <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-center justify-center relative bg-slate-950/70 border border-indigo-500/20 rounded-3xl p-3 sm:p-4 overflow-hidden min-h-[460px] sm:min-h-[520px] md:min-h-[560px] shadow-2xl">
              
              {/* Comprehensive Camera HUD Overlay */}
              <div className="absolute top-3 left-3 right-3 flex flex-wrap justify-between items-center gap-2 z-20 pointer-events-none">
                {/* Left Orbit Controls */}
                <div className="flex items-center gap-1.5 pointer-events-auto">
                  <button 
                    onClick={handleRotateLeft}
                    className="p-2 bg-slate-900/90 border border-slate-800 hover:border-indigo-400 hover:text-indigo-300 rounded-xl hover:scale-105 active:scale-95 transition-all text-slate-400 shadow-md"
                    title="Rotate Left 45°"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={handleRotateRight}
                    className="p-2 bg-slate-900/90 border border-slate-800 hover:border-indigo-400 hover:text-indigo-300 rounded-xl hover:scale-105 active:scale-95 transition-all text-slate-400 shadow-md"
                    title="Rotate Right 45°"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                </div>

                {/* Center Orbit & Zoom Pill */}
                <div className="text-[10px] sm:text-xs uppercase font-black tracking-widest text-slate-300 bg-slate-950/95 border border-slate-800/80 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-lg select-none flex items-center gap-2">
                  <span>YAW {Math.round(rotation)}°</span>
                  <span className="text-slate-600">&bull;</span>
                  <span>PITCH {Math.round(pitch)}°</span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-indigo-300">{Math.round(zoom * 100)}% ZOOM</span>
                </div>

                {/* Right Camera Presets & Zoom Buttons */}
                <div className="flex items-center gap-1.5 pointer-events-auto">
                  <button 
                    onClick={handleZoomIn}
                    className="p-2 bg-slate-900/90 border border-slate-800 hover:border-indigo-400 hover:text-indigo-300 rounded-xl hover:scale-105 active:scale-95 transition-all text-slate-400 shadow-md"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={handleZoomOut}
                    className="p-2 bg-slate-900/90 border border-slate-800 hover:border-indigo-400 hover:text-indigo-300 rounded-xl hover:scale-105 active:scale-95 transition-all text-slate-400 shadow-md"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={handleOverviewCamera}
                    className="p-2 bg-slate-900/90 border border-slate-800 hover:border-indigo-400 hover:text-indigo-300 rounded-xl hover:scale-105 active:scale-95 transition-all text-slate-400 shadow-md"
                    title="Bird's Eye Overview"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={handleResetCamera}
                    className="p-2 bg-slate-900/90 border border-slate-800 hover:border-indigo-400 hover:text-indigo-300 rounded-xl hover:scale-105 active:scale-95 transition-all text-slate-400 shadow-md"
                    title="Reset View"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* 3D Scene Viewport */}
              <div 
                onPointerDown={handlePointerDown}
                onWheel={handleWheel}
                className={cn(
                  "w-full h-full min-h-[420px] sm:min-h-[480px] md:min-h-[520px] relative flex items-center justify-center overflow-hidden select-none mt-6 bg-slate-950/40 rounded-3xl border border-slate-900/80 transition-all duration-300 touch-none",
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                )}
              >
                {/* 3D Scaled Scene Wrapper with Zoom Multiplier */}
                <div 
                  className="absolute w-[1000px] h-[600px] flex items-center justify-center [perspective:1400px] origin-center transition-all duration-300 pointer-events-none"
                  style={{
                    transform: `scale(${zoom * (isFullscreen ? 1.05 : 0.85)})`
                  }}
                >
                  <div 
                    className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-300 ease-out pointer-events-auto"
                    style={{ transform: `rotateX(${pitch}deg) rotateY(${rotation}deg)` }}
                  >
                    {/* Spacious Room Floor with Grid */}
                    <div 
                      className="absolute w-[1100px] h-[1100px] bg-slate-950/95 border-2 border-indigo-500/20 rounded-3xl [transform:rotateX(90deg)_translateZ(-240px)_translateX(-50px)_translateY(-50px)] shadow-[0_0_80px_rgba(99,102,241,0.08)_inset]"
                      style={{
                        backgroundImage: 'linear-gradient(to right, rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.08) 1px, transparent 1px)',
                        backgroundSize: '55px 55px',
                      }}
                    />

                    {/* Back Wall with Shelves */}
                    <div className="absolute w-[1100px] h-[600px] bg-slate-950/80 border-b border-indigo-500/20 [transform:translateZ(-500px)_translateX(-50px)_translateY(-140px)] flex flex-col justify-between p-8 pointer-events-none">
                      <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent rounded-full shadow-[0_0_12px_rgba(99,102,241,0.4)]" />
                      <div className="w-3/4 mx-auto h-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent rounded-full" />
                    </div>

                    {/* Left Wall */}
                    <div className="absolute w-[1100px] h-[600px] bg-slate-950/90 border-r border-indigo-500/15 [transform:rotateY(90deg)_translateZ(-550px)_translateY(-140px)] pointer-events-none" />

                    {/* Right Wall */}
                    <div className="absolute w-[1100px] h-[600px] bg-slate-950/90 border-l border-indigo-500/15 [transform:rotateY(-90deg)_translateZ(-550px)_translateY(-140px)] pointer-events-none" />

                    {/* Non-overlapping, Space-Aware Interactive 3D Tokens */}
                    {roomItems.map(obj => {
                      const isFound = foundItems.includes(obj.id);

                      return (
                        <div
                          key={obj.id}
                          onClick={() => handleSelectItem(obj)}
                          className={cn(
                            "absolute cursor-pointer [transform-style:preserve-3d] transition-transform duration-200 flex flex-col items-center justify-center group select-none",
                            isFound ? "z-10" : "z-20"
                          )}
                          style={{
                            width: '84px',
                            height: '92px',
                            transform: `translateX(${obj.translateX}px) translateY(${obj.translateY}px) translateZ(${obj.translateZ}px) rotateY(${-rotation}deg) rotateX(${-pitch}deg)`,
                          }}
                        >
                          {/* Main Glass Token Card */}
                          <div className={cn(
                            "w-full h-full rounded-2xl border-2 flex flex-col items-center justify-center p-1.5 transition-all duration-300 relative backdrop-blur-md shadow-xl",
                            isFound
                              ? "bg-emerald-950/75 border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.35)]"
                              : cn("bg-slate-900/80 border-slate-700/80 hover:border-slate-400 group-hover:scale-105 group-hover:bg-slate-800/90", obj.color)
                          )}>
                            {/* Found Check Badge */}
                            {isFound && (
                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 shadow-md">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                            )}

                            <span className={cn(
                              "text-3xl sm:text-4xl transition-transform duration-200 drop-shadow-md",
                              !isFound && "group-hover:scale-115"
                            )}>
                              {obj.emoji}
                            </span>

                            <span className={cn(
                              "text-[9px] font-black uppercase text-center truncate w-full px-0.5 mt-1 tracking-tight",
                              isFound ? "text-emerald-300" : "text-slate-300"
                            )}>
                              {obj.name}
                            </span>
                          </div>

                          {/* Vertical 3D Pedestal Pin anchoring token to space */}
                          <div className="w-0.5 h-4 bg-gradient-to-b from-indigo-400/40 to-transparent mt-0.5" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Information Display Panel (3 cols) */}
            <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-4">
              <div className="bg-slate-950/90 border-2 border-purple-500/30 rounded-2xl p-4 sm:p-5 h-full flex flex-col justify-between backdrop-blur-xl shadow-2xl space-y-4">
                <div>
                  <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-400/40 px-3 py-1.5 rounded-xl shadow-sm mb-3.5">
                    <Eye className="w-4 h-4 text-purple-300" />
                    <span className="text-xs font-black uppercase tracking-wider text-purple-200">
                      Explorer Inspector
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    {selectedItem ? (
                      <motion.div 
                        key={selectedItem.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="space-y-4"
                      >
                        {/* Big Visual Card */}
                        <div className="p-4 bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-purple-500/40 rounded-2xl flex items-center gap-3.5 shadow-xl">
                          <div className="w-14 h-14 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-inner">
                            <span className="text-3xl drop-shadow">{selectedItem.emoji}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-xl sm:text-2xl font-black text-white truncate leading-tight">
                              {selectedItem.name}
                            </h3>
                            <div className="inline-flex items-center gap-1.5 mt-1 bg-indigo-950/80 border border-indigo-400/40 px-2.5 py-0.5 rounded-md">
                              <span className="text-xs font-mono font-bold text-indigo-300">
                                {selectedItem.phonetics}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Audio Pronunciation Button */}
                        <button
                          onClick={() => {
                            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                              setSpeakActive(true);
                              const utterance = new SpeechSynthesisUtterance(selectedItem.name);
                              utterance.onend = () => setSpeakActive(false);
                              window.speechSynthesis.speak(utterance);
                            }
                          }}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 border border-indigo-400/30"
                        >
                          <Volume2 className={cn("w-4 h-4 text-white", speakActive && "animate-bounce")} />
                          <span>Pronounce Native Audio</span>
                        </button>

                        {/* Detailed Definition */}
                        <div className="bg-slate-900/90 border border-slate-800/90 p-3.5 rounded-xl space-y-1 shadow-inner">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            Linguistic Meaning:
                          </span>
                          <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                            {selectedItem.description}
                          </p>
                        </div>

                        {/* Match Tag */}
                        <div className={cn(
                          "p-2.5 rounded-xl border text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2",
                          foundItems.includes(selectedItem.id)
                            ? "bg-emerald-950/70 border-emerald-400/70 text-emerald-300 shadow-sm"
                            : "bg-slate-900/80 border-slate-700/80 text-slate-200"
                        )}>
                          {foundItems.includes(selectedItem.id) ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Target Collected!
                            </>
                          ) : (
                            <>
                              <Search className="w-4 h-4 text-cyan-400" /> Classroom Room Object
                            </>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      /* Idle State - Rich Guide Card instead of empty dark void */
                      <div className="flex flex-col items-center justify-center text-center p-4 space-y-3.5 my-auto">
                        <div className="p-4 bg-slate-900/90 border-2 border-purple-500/40 rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.2)]">
                          <Search className="w-8 h-8 text-purple-400 animate-pulse" />
                        </div>
                        <h4 className="text-base font-black text-white uppercase tracking-tight">
                          Inspector Ready
                        </h4>
                        <p className="text-xs font-medium text-slate-300 leading-relaxed max-w-xs">
                          Click any object in the 3D room to inspect its native spelling, phonetic transcription, and listen to spoken audio!
                        </p>
                        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-[11px] text-indigo-300 font-bold w-full text-left space-y-1.5 shadow-inner">
                          <p>💡 <span className="text-white">Tip:</span> Rotate 360° to uncover objects on wall shelves.</p>
                          <p>🔍 <span className="text-white">Zoom:</span> Use your mouse wheel or +/- HUD buttons.</p>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-center text-[10px] text-slate-400 font-medium">
                  Click objects in room to verify target match
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex-1 w-full flex flex-col justify-center items-center py-6 sm:py-10 z-10"
          >
            <div className="w-full max-w-4xl mx-auto bg-slate-950/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6 text-center">
              <div className="relative inline-block mx-auto">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 blur-xl opacity-50 animate-pulse" />
                <div className="relative p-5 bg-slate-900 border border-emerald-500/40 rounded-full shadow-2xl">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                </div>
              </div>

              <div className="space-y-2 max-w-xl mx-auto">
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-200 bg-clip-text text-transparent">
                  Explorer Quest Cleared!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  Outstanding exploration! You navigated the 3D room, unlocked all target objects, and mastered authentic pronunciation audio.
                </p>
              </div>

              {/* Stats Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
                <div className="bg-slate-900/80 border border-emerald-500/20 p-3.5 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Objects Found</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-300">{targetItems.length} / {targetItems.length}</span>
                </div>
                <div className="bg-slate-900/80 border border-indigo-500/20 p-3.5 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Curriculum Tier</span>
                  <span className="text-xl sm:text-2xl font-black text-indigo-300">CEFR B1–B2</span>
                </div>
                <div className="bg-slate-900/80 border border-purple-500/20 p-3.5 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Quest Score</span>
                  <span className="text-xl sm:text-2xl font-black text-purple-300">100 PTS</span>
                </div>
              </div>

              {/* Discovered Vocabulary Chips */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 max-w-2xl mx-auto space-y-2.5">
                <span className="text-xs uppercase font-black tracking-wider text-slate-300 block text-left">
                  Vocabulary Mastered:
                </span>
                <div className="flex flex-wrap gap-2 justify-center">
                  {targetItems.map(tid => {
                    const obj = ALL_OBJECTS.find(o => o.id === tid);
                    if (!obj) return null;
                    return (
                      <div 
                        key={tid}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs font-bold text-white shadow-sm"
                      >
                        <span>{obj.emoji}</span>
                        <span>{obj.name}</span>
                        <span className="text-[10px] font-mono text-cyan-300">{obj.phonetics}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex flex-col items-center">
                <button
                  onClick={handleStartGame}
                  className="px-10 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-[0_4px_25px_rgba(16,185,129,0.35)] hover:scale-105 active:scale-95 border border-emerald-400/40"
                >
                  Explore Next Quest (Fresh Words)
                </button>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">
                  Guaranteed fresh words from the 210+ item library with zero repetition.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
