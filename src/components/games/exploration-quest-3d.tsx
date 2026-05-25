'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, RotateCcw, Search, Coins, Sparkles, Maximize, Minimize, Volume2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

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

export function ExplorationQuest3D({ onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [rotation, setRotation] = React.useState(0); // Orbit Yaw
  const [pitch, setPitch] = React.useState(-12); // Orbit Pitch
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStart = React.useRef({ x: 0, y: 0 });
  const startRotation = React.useRef({ yaw: 0, pitch: -12 });
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

  
  // Initialize targets and room
  const initGame = () => {
    const shuffled = [...ALL_OBJECTS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 15); // 15 items total in the room (reduced from 20)
    const targets = selected.slice(0, 10).map(item => item.id);
    
    const placed = selected.map(item => {
      return {
        ...item,
        rotateY: Math.floor(Math.random() * 4) * 90,
        translateX: Math.floor(Math.random() * 500) - 250,
        translateY: Math.floor(Math.random() * 180) - 50, // Confined translateY to prevent top-clipping
        translateZ: Math.floor(Math.random() * 500) - 250,
      };
    });
    
    setRoomItems(placed);
    setTargetItems(targets);
  };

  React.useEffect(() => {
    initGame();
  }, []);

  React.useEffect(() => {
    if (!isDragging) return;

    const handleGlobalPointerMove = (e: PointerEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      if (Math.abs(dx) > 15 || Math.abs(dy) > 15) {
        hasDragged.current = true;
      }
      
      const newYaw = startRotation.current.yaw + dx * 0.45;
      const newPitch = startRotation.current.pitch - dy * 0.35;
      
      setRotation(newYaw);
      setPitch(Math.max(-40, Math.min(10, newPitch)));
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
  };

  const handleSelectItem = (item: QuestItem) => {
    if (hasDragged.current) return; // Prevent selection click if user was dragging/rotating
    setSelectedItem(item);
    
    // Play simple synthetic sound
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
        // Dispatch completion events for Lingo-Coins logic
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

  const handleRotateLeft = () => setRotation(r => r - 45);
  const handleRotateRight = () => setRotation(r => r + 45);

  const currentTargetId = targetItems.find(id => !foundItems.includes(id));
  const currentTargetItem = ALL_OBJECTS.find(i => i.id === currentTargetId);

  return (
    <div className={cn(
      "w-full transition-all duration-500 flex flex-col items-center bg-slate-950 text-white relative overflow-hidden",
      isFullscreen 
        ? "min-h-screen rounded-none border-none p-8 max-w-none justify-center" 
        : "max-w-4xl mx-auto rounded-3xl p-6 border border-slate-800 shadow-2xl min-h-[600px]"
    )}>
      {/* Premium background gradient elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="w-full flex items-center justify-between border-b border-slate-900 pb-4 mb-6 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl">
            <Search className="h-6 w-6 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">3D Exploration & Questing</h2>
            <p className="text-sm text-slate-400">Interact with the 3D room to discover vocabulary and complete quests!</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onToggleFullscreen && (
            <button onClick={onToggleFullscreen} className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-slate-800/50 transition-colors">
              {isFullscreen ? <Minimize className="h-4.5 w-4.5" /> : <Maximize className="h-4.5 w-4.5" />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'idle' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md my-auto space-y-6 z-10"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 blur opacity-40 animate-pulse" />
              <div className="relative p-6 bg-slate-900 border border-slate-800 rounded-full">
                <Search className="h-16 w-16 text-indigo-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Vocabulary Quest</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Step into a full 3D interactive classroom kitchen! Find objects, click on them to hear their pronunciation, and complete the daily explorer quest.
              </p>
            </div>
            <button
              onClick={handleStartGame}
              className="px-10 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black uppercase text-sm tracking-widest rounded-2xl transition-all shadow-[0_4px_25px_rgba(99,102,241,0.25)] hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Begin Quest
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-6 z-10"
          >
            {/* Left Control Panel / Active Quest */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between h-full">
                <div>
                  <span className="text-[11px] uppercase font-black tracking-widest text-indigo-400">Current Objective</span>
                  {currentTargetItem ? (
                    <div className="mt-2 space-y-2">
                      <h4 className="text-lg font-black text-white flex items-center gap-1.5 animate-pulse">
                        Find: {currentTargetItem.name}
                      </h4>
                      <p className="text-xs text-slate-400 italic">"{currentTargetItem.description}"</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-2">All items found! Completing quest...</p>
                  )}
                </div>

                <div className="border-t border-slate-900 pt-4 mt-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">Progress</span>
                    <span className="text-indigo-400 font-black">{foundItems.length}/10 Found</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
                      style={{ width: `${(foundItems.length / 10) * 100}%` }}
                    />
                  </div>

                  
                </div>
              </div>
            </div>

            {/* 3D World Stage */}
            <div className="md:col-span-2 flex flex-col items-center justify-center relative bg-slate-950/60 border border-slate-900 rounded-3xl p-4 overflow-hidden min-h-[350px]">
              {/* Rotation HUD Overlay */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
                <button 
                  onClick={handleRotateLeft}
                  className="pointer-events-auto p-2 bg-slate-900/90 border border-slate-800 hover:text-indigo-400 rounded-xl hover:scale-105 active:scale-95 transition-all text-slate-400"
                  title="Rotate Left"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <span className="text-[10px] sm:text-xs mt-1 uppercase font-black tracking-widest text-slate-400 bg-slate-950/95 border border-slate-900 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-lg select-none">
                  ORBIT: YAW {Math.round(rotation)}° • PITCH {Math.round(pitch)}°
                </span>
                <button 
                  onClick={handleRotateRight}
                  className="pointer-events-auto p-2 bg-slate-900/90 border border-slate-800 hover:text-indigo-400 rounded-xl hover:scale-105 active:scale-95 transition-all text-slate-400"
                  title="Rotate Right"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              </div>

              {/* 3D Scene Viewport */}
              <div 
                onPointerDown={handlePointerDown}
                className={cn(
                  "w-full h-[280px] sm:h-[380px] md:h-[500px] relative flex items-center justify-center overflow-hidden select-none mt-6 bg-slate-950/40 rounded-3xl border border-slate-900/80 transition-all duration-300 touch-none",
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                )}
              >
                {/* 3D Scaled Scene Wrapper */}
                <div 
                  className="absolute w-[800px] h-[500px] flex items-center justify-center [perspective:1200px] origin-center scale-[0.45] xs:scale-[0.55] sm:scale-[0.72] md:scale-100 transition-all duration-300 pointer-events-none"
                >
                  <div 
                    className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-500 ease-out pointer-events-auto"
                    style={{ transform: `rotateX(${pitch}deg) rotateY(${rotation}deg)` }}
                  >
                    {/* The Room Walls / floor (rendered in mock CSS 3D coordinates) */}
                    
                    {/* FLOOR */}
                    <div 
                      className="absolute w-[800px] h-[800px] bg-slate-900 border border-slate-800/40 opacity-70 [transform:rotateX(90deg)_translateZ(-300px)]"
                      style={{
                        backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.15) 1.5px, transparent 1.5px)',
                        backgroundSize: '20px 20px',
                      }}
                    />

                    {/* BACK WALL */}
                    <div className="absolute w-[800px] h-[600px] bg-slate-950/60 border border-indigo-500/10 [transform:translateZ(-250px)_translateX(-50px)_translateY(-20px)] flex items-center justify-center">
                      {/* Back wall panel line */}
                      <div className="w-full h-[1px] bg-slate-800/20" />
                    </div>

                    {/* LEFT WALL */}
                    <div className="absolute w-[800px] h-[600px] bg-slate-950/80 border border-indigo-500/10 [transform:rotateY(90deg)_translateZ(-400px)_translateY(-20px)]" />

                    {/* RIGHT WALL */}
                    <div className="absolute w-[300px] h-[260px] bg-slate-950/80 border border-indigo-500/10 [transform:rotateY(-90deg)_translateZ(-200px)_translateY(-20px)_translateX(-50px)]" />

                    {/* The 3D placed Interactive objects */}
                    {roomItems.map(obj => {
                      const isFound = foundItems.includes(obj.id);
                      const isTarget = targetItems.includes(obj.id);
                      const isCurrentlySeeking = currentTargetId === obj.id;
                      const itemBorderColor = obj.color.split(' ').find(c => c.startsWith('border-')) || 'border-slate-800';

                      return (
                        <div
                          key={obj.id}
                          onClick={() => handleSelectItem(obj)}
                          className={cn(
                            "absolute cursor-pointer [transform-style:preserve-3d] transition-all duration-300 flex items-center justify-center border-2 rounded-2xl group",
                            isFound
                              ? "bg-emerald-500/20 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] text-emerald-300 font-extrabold"
                              : cn("bg-slate-900/95 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] text-slate-300", itemBorderColor)
                          )}
                          style={{
                            width: obj.width,
                            height: obj.height,
                            // Billboard Counter-Rotation: cancels out parent rotateY(${rotation}deg) and rotateX(${pitch}deg)
                            transform: `translateX(${obj.translateX}px) translateY(${obj.translateY}px) translateZ(${obj.translateZ}px) rotateY(${-rotation}deg) rotateX(${-pitch}deg)`,
                          }}
                        >
                        {/* 3D Box faces representation */}
                        <div className="flex flex-col items-center justify-center gap-1.5 p-2">
                          <span className={cn("text-5xl transition-transform", !isFound && "group-hover:scale-125 duration-200")}>
                            {obj.emoji}
                          </span>
                          <span className={cn(
                            "text-[10px] font-black uppercase text-center truncate w-full px-1",
                            isFound ? "text-emerald-400" : "text-slate-200"
                          )}>
                            {obj.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Information Display Panel */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 h-full flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {selectedItem ? (
                    <motion.div 
                      key={selectedItem.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="space-y-4"
                    >
                      <div>
                        <span className="text-[11px] uppercase font-black tracking-widest text-zinc-500">Explorer Logs</span>
                        <h4 className="text-lg font-black text-white mt-1 flex items-center gap-1.5">
                          {selectedItem.name}
                          <Volume2 className={cn("h-4 w-4 text-indigo-400 cursor-pointer", speakActive && "animate-bounce")} />
                        </h4>
                        <span className="text-[10px] text-indigo-400 font-mono font-bold block">{selectedItem.phonetics}</span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-900/60 pt-3">{selectedItem.description}</p>
                      
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center text-[10px] text-slate-400 font-bold leading-normal">
                        Click the speaker icon to hear pronunciation. Drag or swipe inside the room to rotate and look around!
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-4">
                      <Search className="h-10 w-10 text-slate-700 mb-2" />
                      <p className="text-xs font-bold uppercase tracking-wider">Logs Empty</p>
                      <p className="text-[10px] text-slate-600 mt-1 leading-normal">Click any 3D room object to inspect its linguistic roots.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md my-auto space-y-6 z-10"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 blur opacity-40 animate-pulse" />
              <div className="relative p-6 bg-slate-900 border border-slate-800 rounded-full">
                <CheckCircle2 className="h-16 w-16 text-emerald-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Explorer Quest Cleared!</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Outstanding work! You successfully identified all kitchen targets in full 3D, mastered their spelling and pronunciation, and cleared the daily quest.
              </p>
            </div>

            

            <button
              onClick={handleStartGame}
              className="px-8 py-3.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Explore Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
