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
  { id: 'medal', name: 'Medal', emoji: '🏅', description: 'A stamped metal disk commemorating victory.', phonetics: '/ˈmɛdəl/', color: 'border-amber-300' }
];

interface PlacedItem extends QuestItem {
  translateX: number;
  translateY: number;
  translateZ: number;
}

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

  // Initialize target items and space them out without any clustering
  const initGame = () => {
    const shuffled = [...ALL_OBJECTS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 12); // 12 distinct items in the room
    const targets = selected.slice(0, 8).map(item => item.id); // 8 quest targets
    
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
                CEFR B1–B2
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden xs:block">
              Interactive 360° classroom vocabulary quest with authentic audio pronunciation.
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
                  <span>Interactive 3D Language Dimension</span>
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
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                      8 Quest Targets
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      You will be assigned 8 target vocabulary objects to discover one by one using linguistic clues, definitions, and phonetics.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-indigo-300">
                    <span>Curriculum Level</span>
                    <span className="font-mono bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/30">CEFR B1–B2</span>
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
                      Fair Challenge Mode
                    </h4>
                    <p className="text-xs text-slate-400">
                      No blinking beacon spoilers. Hunt for items using your knowledge and clue descriptions!
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

              <div className="pt-2">
                <button
                  onClick={handleStartGame}
                  className="px-10 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-[0_4px_25px_rgba(16,185,129,0.35)] hover:scale-105 active:scale-95 border border-emerald-400/40"
                >
                  Explore Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
