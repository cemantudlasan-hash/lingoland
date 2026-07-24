'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Loader2,
  Download,
  Wand2,
  Maximize,
  Minimize,
  MousePointerClick,
  Folder,
  FolderPlus,
  FolderOpen,
  FileText,
  Trash2,
  Edit,
  Save,
  ChevronRight,
  ChevronDown,
  Search,
  AlignLeft,
  AlignCenter,
  FolderClosed,
  ChevronLeft,
  X,
  FileCode,
  FolderSymlink,
  Plus,
  Globe,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Video,
  FileUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  generatePresentation,
  type GeneratePresentationInput,
  type GeneratePresentationOutput,
} from '@/ai/flows/generate-presentation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import Link from 'next/link';
import { 
  doc, 
  onSnapshot, 
  setDoc
} from 'firebase/firestore';
import { ThreeBackground } from '@/components/presentation/ThreeBackground';

const formSchema = z.object({
  topic: z.string().optional().or(z.literal('')),
  slideCount: z.coerce
    .number()
    .int()
    .min(3)
    .max(20, 'Cannot be more than 20 slides.'),
});

type FormValues = z.infer<typeof formSchema>;

interface DbFolder {
  id: string;
  name: string;
  createdAt: string;
}

interface DbPresentation {
  id: string;
  title: string;
  slides: {
    title: string;
    content: string[];
  }[];
  folderId: string | null;
  theme?: string;
  fontFamily?: string;
  fontSize?: {
    name: string;
    className: string;
    titleClassName: string;
    fullScreenClassName: string;
    fullScreenTitleClassName: string;
  };
  align?: 'left' | 'center';
  createdAt: string;
  updatedAt: string;
}

const themes = [
    { name: 'Default Plain', className: 'bg-white text-black border border-slate-200 rounded-2xl shadow-sm' },
    { name: 'Midnight Glassmorphic', className: 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-indigo-500/20 rounded-2xl shadow-[0_8px_30px_rgba(99,102,241,0.2)] backdrop-blur-md' },
    { name: 'Solar Flare Gold', className: 'bg-neutral-950 text-amber-100 border border-amber-500/20 rounded-2xl shadow-[0_8px_30px_rgba(245,158,11,0.1)]' },
    { name: 'Aurora Teal', className: 'bg-gradient-to-br from-zinc-950 via-slate-900 to-teal-950 text-white border border-teal-500/20 rounded-2xl shadow-[0_8px_30px_rgba(20,184,166,0.1)]' },
    { name: 'Cyber Neon', className: 'bg-black text-cyan-400 border-2 border-pink-500 rounded-2xl font-mono shadow-[0_0_15px_rgba(244,63,94,0.3)]' },
    { name: 'Royal Amethyst & Gold', className: 'bg-gradient-to-br from-violet-950 via-purple-900 to-amber-950 text-amber-100 border border-amber-500/30 rounded-2xl shadow-[0_8px_30px_rgba(217,119,6,0.15)]' },
    { name: 'Deep Emerald Forest', className: 'bg-gradient-to-br from-emerald-950 via-teal-950 to-zinc-900 text-emerald-100 border border-emerald-500/20 rounded-2xl shadow-[0_8px_30px_rgba(16,185,129,0.15)]' },
    { name: 'Sakura Blossom Glassmorphic', className: 'bg-gradient-to-br from-rose-950 via-pink-950 to-slate-900 text-rose-100 border border-pink-500/20 rounded-2xl shadow-[0_8px_30px_rgba(244,63,94,0.15)]' },
    { name: 'Cosmic Nebula Dream', className: 'bg-gradient-to-br from-indigo-950 via-purple-950 to-violet-900 text-purple-100 border border-purple-500/20 rounded-2xl shadow-[0_8px_30px_rgba(139,92,246,0.2)]' },
    { name: 'Volcano Obsidian', className: 'bg-gradient-to-br from-stone-950 via-neutral-900 to-orange-950 text-orange-100 border border-orange-500/30 rounded-2xl shadow-[0_8px_30px_rgba(249,115,22,0.15)]' },
    { name: 'Classic Editorial Serif', className: 'bg-[#fdfbf7] text-stone-900 border border-stone-200 rounded-2xl shadow-sm' },
    { name: 'Dark Charcoal', className: 'bg-gray-800 text-white rounded-2xl' },
    { name: 'Sepia Nostalgia', className: 'bg-amber-100 text-stone-800 rounded-2xl' },
    { name: 'Blueprint Math', className: 'bg-blueprint text-white rounded-2xl' },
    { name: 'Twilight Velvet', className: 'bg-twilight text-white rounded-2xl' }
];

const fontFamilies = [
    { name: 'Modern Sans (Inter)', className: 'font-body' },
    { name: 'Elegant Serif (Merriweather)', className: 'font-serif font-semibold' },
    { name: 'Roboto', className: 'font-roboto' },
    { name: 'Lato Rounded', className: 'font-lato' },
    { name: 'Montserrat Impact', className: 'font-montserrat font-bold' },
    { name: 'Futuristic Mono', className: 'font-mono' }
];

const fontSizes = [
    { name: 'Small text', className: 'text-base', titleClassName: 'text-2xl', fullScreenClassName: 'text-[1.8vw] leading-relaxed', fullScreenTitleClassName: 'text-[3vw] leading-tight' },
    { name: 'Medium text', className: 'text-lg', titleClassName: 'text-3xl', fullScreenClassName: 'text-[2.2vw] leading-relaxed', fullScreenTitleClassName: 'text-[3.8vw] leading-tight' },
    { name: 'Large text', className: 'text-xl', titleClassName: 'text-4xl', fullScreenClassName: 'text-[2.5vw] leading-relaxed', fullScreenTitleClassName: 'text-[4.5vw] leading-tight' },
    { name: 'Extra Large', className: 'text-2xl', titleClassName: 'text-5xl', fullScreenClassName: 'text-[2.9vw] leading-relaxed', fullScreenTitleClassName: 'text-[5.5vw] leading-tight' },
];

const EMOJI_MAP: { [key: string]: string } = {
  // Activities / Verbs
  "hiking": "🥾", "hike": "🥾", "walking": "🚶", "walk": "🚶",
  "cycling": "🚴", "cycle": "🚴", "biking": "🚴", "bike": "🚲",
  "picnicking": "🧺", "picnic": "🧺", "playing": "🎮", "play": "🎮",
  "sports": "⚽", "sport": "⚽", "running": "🏃", "run": "🏃",
  "swimming": "🏊", "swim": "🏊", "camping": "⛺", "camp": "⛺",
  "climbing": "🧗", "climb": "🧗", "fishing": "🎣", "fish": "🐟",
  "reading": "📖", "read": "📖", "writing": "✍️", "write": "✍️",
  "learning": "🎓", "learn": "🎓", "teaching": "🏫", "teach": "🏫",
  "traveling": "✈️", "travel": "✈️", "cooking": "🍳", "cook": "🍳",
  "eating": "🍽️", "eat": "🍽️", "drinking": "🥤", "drink": "🥤",
  "singing": "🎤", "sing": "🎤", "dancing": "💃", "dance": "💃",
  // Nature / Places
  "nature": "🌲", "outdoors": "⛰️", "outdoor": "⛰️", "outside": "🏞️",
  "park": "🏞️", "parks": "🏞️", "forest": "🌳", "forests": "🌳",
  "beach": "🏖️", "beaches": "🏖️", "garden": "🏡", "gardens": "🏡",
  "mountain": "🏔️", "mountains": "🏔️", "river": "🏞️", "rivers": "🏞️",
  "lake": "🌊", "lakes": "🌊", "sea": "🌊", "ocean": "🌊",
  "sky": "🌌", "sun": "☀️", "moon": "🌙", "stars": "✨",
  "flower": "🌸", "flowers": "🌸", "tree": "🌲", "trees": "🌲",
  "rain": "🌧️", "snow": "❄️", "wind": "💨", "cloud": "☁️",
  // Common Objects (overlapping with our 80-item game dataset!)
  "refrigerator": "❄️", "fridge": "❄️", "toaster": "🍞", "clock": "⏰",
  "cabinet": "🗄️", "sink": "🚰", "window": "🪟", "microwave": "📻",
  "blender": "🥤", "pan": "🍳", "plate": "🍽️", "chair": "🪑",
  "plant": "🪴", "broom": "🧹", "trash": "🗑️", "mug": "☕",
  "apple": "🍎", "book": "📖", "lamp": "💡", "laptop": "💻",
  "keys": "🔑", "wallet": "👛", "shoes": "👞", "coat": "🧥",
  "hat": "🧢", "umbrella": "🌂", "backpack": "🎒", "glasses": "👓",
  "watch": "⌚", "camera": "📷", "headphones": "🎧", "teddy": "🧸",
  "guitar": "🎸", "soccer": "⚽", "basketball": "🏀", "tennis": "🎾",
  "pizza": "🍕", "burger": "🍔", "donut": "🍩", "icecream": "🍦",
  "cake": "🍰", "car": "🚗", "train": "🚂", "plane": "✈️",
  "boat": "⛵", "rocket": "🚀", "scissors": "✂️", "pencil": "✏️",
  "ruler": "📏", "globe": "🌍", "telescope": "🔭", "microscope": "🔬",
  "magnet": "🧲", "battery": "🔋", "bulb": "💡", "key": "🗝️",
  "lock": "🔒", "tools": "🛠️", "hammer": "🔨", "wrench": "🔧",
  "gear": "⚙️", "gem": "💎", "coin": "🪙", "money": "💵",
  "creditcard": "💳", "envelope": "✉️", "package": "📦", "gift": "🎁",
  "balloon": "🎈", "ribbon": "🎀", "trophy": "🏆", "medal": "🏅"
};

const getEmojiFallback = (text: string): string | null => {
  if (!text) return null;
  const clean = text.toLowerCase().trim();
  // Direct match
  if (EMOJI_MAP[clean]) return EMOJI_MAP[clean];
  
  // Try singularizing/removing plurals
  if (clean.endsWith('s') && EMOJI_MAP[clean.slice(0, -1)]) return EMOJI_MAP[clean.slice(0, -1)];
  if (clean.endsWith('ing')) {
    const root = clean.slice(0, -3);
    if (EMOJI_MAP[root]) return EMOJI_MAP[root];
    if (EMOJI_MAP[root + 'e']) return EMOJI_MAP[root + 'e']; // e.g. cycling -> cycle
  }
  
  // Word by word matching
  const words = clean.split(/\s+/);
  for (const w of words) {
    if (EMOJI_MAP[w]) return EMOJI_MAP[w];
    if (w.endsWith('s') && EMOJI_MAP[w.slice(0, -1)]) return EMOJI_MAP[w.slice(0, -1)];
  }

  const fallbackEmojis = ['🖼️', '🔎', '✨', '🌈', '📌'];
  return fallbackEmojis[Math.floor(Math.random() * fallbackEmojis.length)];
};

export function PresentationForm() {
  // Authentication & DB
  const { user, isGuest, isLoading: isAuthLoading } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  // Outlines States
  const [presentation, setPresentation] = React.useState<GeneratePresentationOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const presentationContainerRef = React.useRef<HTMLDivElement>(null);

  // Visual search states
  const [selectionText, setSelectionText] = React.useState("");
  const [selectionCoords, setSelectionCoords] = React.useState<{ x: number; y: number } | null>(null);
  const [showPill, setShowPill] = React.useState(false);
  const [searchImage, setSearchImage] = React.useState<string | null>(null);
  const [searchImageThumbnail, setSearchImageThumbnail] = React.useState<string | null>(null);
  const [searchImageEngine, setSearchImageEngine] = React.useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = React.useState(false);
  const [showImageModal, setShowImageModal] = React.useState(false);
  const [imageSearchError, setImageSearchError] = React.useState<string | null>(null);
  // Image picker states (fullscreen mode)
  const [pickerImages, setPickerImages] = React.useState<Array<{ url: string; thumb?: string; engine: string; title: string }>>([]);
  const [selectedPickerImage, setSelectedPickerImage] = React.useState<string | null>(null);
  const [isLoadingPicker, setIsLoadingPicker] = React.useState(false);

  // Document uploading & parser states
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [uploadedText, setUploadedText] = React.useState<string | null>(null);
  const [isParsing, setIsParsing] = React.useState(false);

  // New visual and animation control options
  const [insertPhotos, setInsertPhotos] = React.useState(true);
  const [photoSource, setPhotoSource] = React.useState<'google' | 'bing' | 'pinterest'>('google');
  const [enable3D, setEnable3D] = React.useState(true);
  const [slidePhotos, setSlidePhotos] = React.useState<{ [key: number]: string }>({});
  const [isDownloadingPptx, setIsDownloadingPptx] = React.useState(false);

  // Split-screen Visual Search sidebar states
  const [showSplitSearch, setShowSplitSearch] = React.useState(false);
  const [splitQuery, setSplitQuery] = React.useState("");
  const [splitImages, setSplitImages] = React.useState<Array<{ url: string; thumb?: string; engine: string; title: string }>>([]);
  const [splitWebResults, setSplitWebResults] = React.useState<Array<{ title: string; snippet: string; url: string }>>([]);
  const [splitVideos, setSplitVideos] = React.useState<Array<{ title: string; duration: string; channel: string; url: string; thumb: string; embedUrl?: string; views?: string }>>([]);
  const [isLoadingSplit, setIsLoadingSplit] = React.useState(false);
  const [activeSplitTab, setActiveSplitTab] = React.useState("IMAGES");
  const [activeSplitSource, setActiveSplitSource] = React.useState<string>("google");

  // "View Clearly" Text Lightbox/Viewer states
  const [showTextModal, setShowTextModal] = React.useState(false);
  const [selectedTextTitle, setSelectedTextTitle] = React.useState("");
  const [selectedTextContent, setSelectedTextContent] = React.useState("");
  const [selectedTextUrl, setSelectedTextUrl] = React.useState("");
  const [textZoomScale, setTextZoomScale] = React.useState(1.2); // default zoom scale

  // Video Lightbox Player states
  const [showVideoLightbox, setShowVideoLightbox] = React.useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = React.useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = React.useState<string | null>(null);

  // Presentation Cover & Reveal states
  const [coveredTexts, setCoveredTexts] = React.useState<{ [slideIndex: number]: string[] }>({});
  const [revealedTexts, setRevealedTexts] = React.useState<{ [slideIndex: number]: string[] }>({});

  // Zoom and pan states for searchImage
  const [zoomScale, setZoomScale] = React.useState(1);
  const [transformOrigin, setTransformOrigin] = React.useState("center center");

  // Collapsible Presentation Tips Guide state
  const [showTips, setShowTips] = React.useState(false);

  const toggleRevealText = (slideIdx: number, text: string) => {
    const lowerText = text.toLowerCase();
    setRevealedTexts(prev => {
      const list = prev[slideIdx] || [];
      if (list.includes(lowerText)) {
        return { ...prev, [slideIdx]: list.filter(t => t !== lowerText) };
      } else {
        return { ...prev, [slideIdx]: [...list, lowerText] };
      }
    });
  };

  const handleCoverText = (text: string) => {
    const slideIdx = api?.selectedScrollSnap() || 0;
    const lowerText = text.toLowerCase();
    
    setCoveredTexts(prev => {
      const list = prev[slideIdx] || [];
      if (!list.includes(lowerText)) {
        return { ...prev, [slideIdx]: [...list, lowerText] };
      }
      return prev;
    });
    
    setShowPill(false);
    
    toast({
      title: "Cover Effect Applied 🫣",
      description: `"${text}" is now covered on Slide ${slideIdx + 1}. Click to reveal!`
    });
  };

  // Styling outlines states
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [theme, setTheme] = React.useState(themes[1].className);
  const [fontFamily, setFontFamily] = React.useState(fontFamilies[0].className);
  const [fontSize, setFontSize] = React.useState(fontSizes[1]);
  const [align, setAlign] = React.useState<'left' | 'center'>('left');

  // Slide words reveal states
  const [visibleWordCounts, setVisibleWordCounts] = React.useState<{ [key: number]: number }>({});
  const allWordsOnSlide = React.useRef<{ [key: number]: string[] }>({});

  // DB Library states (using pre-approved root user document arrays)
  const [dbFolders, setDbFolders] = React.useState<DbFolder[]>([]);
  const [dbPresentations, setDbPresentations] = React.useState<DbPresentation[]>([]);
  const [expandedFolders, setExpandedFolders] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeDbId, setActiveDbId] = React.useState<string | null>(null);
  const [isSavingDb, setIsSavingDb] = React.useState(false);

  // Editing mode states
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editableTitle, setEditableTitle] = React.useState("");
  const [editableSlides, setEditableSlides] = React.useState<{ title: string; content: string[] }[]>([]);

  // Modals / Dropdowns
  const [showFolderInput, setShowFolderInput] = React.useState(false);
  const [folderName, setFolderName] = React.useState("");
  const [movingPresId, setMovingPresId] = React.useState<string | null>(null);

  // Standard Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      slideCount: 5,
    },
  });

  // Load Library from Firestore Root User Document in real-time
  React.useEffect(() => {
    if (!user || isGuest || !firestore) return;

    const userDocRef = doc(firestore, `users/${user.uid}`);
    const unsub = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const presentations = data.savedPresentations || [];
        const folders = data.savedPresentationFolders || [];
        setDbPresentations(presentations);
        setDbFolders(folders);
      }
    });

    return () => {
      unsub();
    };
  }, [user, isGuest, firestore]);

  // Sync loaded DB presentation to styling controls and editor
  const loadDbPresentation = (pres: DbPresentation) => {
    setActiveDbId(pres.id);
    setPresentation({
      title: pres.title,
      slides: pres.slides
    });
    setEditableTitle(pres.title);
    setEditableSlides(JSON.parse(JSON.stringify(pres.slides))); // deep clone

    if (pres.theme) setTheme(pres.theme);
    if (pres.fontFamily) setFontFamily(pres.fontFamily);
    if (pres.fontSize) setFontSize(pres.fontSize);
    if (pres.align) setAlign(pres.align);

    // Restore saved slide photos
    const photos: { [key: number]: string } = {};
    pres.slides.forEach((slide: any, idx: number) => {
      if (slide.photoUrl) {
        photos[idx] = slide.photoUrl;
      }
    });
    setSlidePhotos(photos);

    setIsEditMode(false);

    // Setup word animation visible counts for loaded slides
    setupWordAnimation(pres.slides);

    toast({
      title: "Loaded Outline",
      description: `Loaded outline "${pres.title}" from library.`
    });
  };

  // Save changes to Firestore User Document
  const handleSaveToDb = async () => {
    if (!user || isGuest || !firestore || !presentation) return;
    setIsSavingDb(true);

    try {
      const baseSlides = isEditMode ? editableSlides : presentation.slides;
      // Inject slide-specific photos and 3D object styles
      const slidesData = baseSlides.map((slide, idx) => ({
        ...slide,
        photoUrl: slidePhotos[idx] || (slide as any).photoUrl || undefined,
        threeDObjectStyle: (slide as any).threeDObjectStyle || (slide as any).threeDObjectStyle || undefined,
      }));
      const titleData = isEditMode ? editableTitle : presentation.title;

      let updatedList = [...dbPresentations];
      let docId = activeDbId;

      if (activeDbId) {
        // Update existing presentation
        updatedList = updatedList.map(p => {
          if (p.id === activeDbId) {
            return {
              ...p,
              title: titleData,
              slides: slidesData,
              theme,
              fontFamily,
              fontSize,
              align,
              updatedAt: new Date().toISOString()
            };
          }
          return p;
        });
        
        // Update current presentation state
        setPresentation({
          title: titleData,
          slides: slidesData
        });
        toast({
          title: "Outline Saved ✅",
          description: `Successfully updated "${titleData}" in your Library.`
        });
      } else {
        // Create new presentation with a client-side generated UUID
        const newId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
        const newPres: DbPresentation = {
          id: newId,
          title: titleData,
          slides: slidesData,
          folderId: null,
          theme,
          fontFamily,
          fontSize,
          align,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        updatedList.push(newPres);
        docId = newId;
        setActiveDbId(newId);
        
        toast({
          title: "Saved to Library 📁",
          description: `Saved "${titleData}" to your presentation outlines collection.`
        });
      }

      // Write array directly to user doc
      const userDocRef = doc(firestore, `users/${user.uid}`);
      await setDoc(userDocRef, { savedPresentations: updatedList }, { merge: true });
      setIsEditMode(false);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to persist presentation changes in Firestore."
      });
    }
    setIsSavingDb(false);
  };

  // Folder Operations
  const handleCreateFolder = async () => {
    if (!folderName.trim() || !user || isGuest || !firestore) return;
    try {
      const newId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
      const newFolder: DbFolder = {
        id: newId,
        name: folderName.trim(),
        createdAt: new Date().toISOString()
      };
      const updatedFolders = [...dbFolders, newFolder];
      
      const userDocRef = doc(firestore, `users/${user.uid}`);
      await setDoc(userDocRef, { savedPresentationFolders: updatedFolders }, { merge: true });

      setFolderName("");
      setShowFolderInput(false);
      toast({
        title: "Folder Created",
        description: "New folder added successfully to sort your slides."
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Folder Error",
        description: "Failed to create new folder."
      });
    }
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (!user || isGuest || !firestore) return;
    if (!confirm(`Are you sure you want to delete folder "${folderName}"? Sorted outlines will not be deleted but will move back to root unsorted outlines.`)) return;

    try {
      const updatedFolders = dbFolders.filter(f => f.id !== folderId);
      
      // Unlink presentations inside this folder
      const updatedPresentations = dbPresentations.map(p => 
        p.folderId === folderId ? { ...p, folderId: null } : p
      );

      const userDocRef = doc(firestore, `users/${user.uid}`);
      await setDoc(userDocRef, { 
        savedPresentationFolders: updatedFolders,
        savedPresentations: updatedPresentations
      }, { merge: true });

      toast({
        title: "Folder Removed",
        description: `Successfully removed "${folderName}". Outlines moved to Unsorted.`
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRenameFolder = async (folderId: string, oldName: string) => {
    if (!user || isGuest || !firestore) return;
    const newName = prompt(`Enter new folder name for "${oldName}":`, oldName);
    if (!newName || !newName.trim() || newName === oldName) return;

    try {
      const updatedFolders = dbFolders.map(f => f.id === folderId ? { ...f, name: newName.trim() } : f);
      const userDocRef = doc(firestore, `users/${user.uid}`);
      await setDoc(userDocRef, { savedPresentationFolders: updatedFolders }, { merge: true });
      toast({
        title: "Folder Renamed",
        description: "Successfully updated folder name."
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Outline Operations
  const handleDeletePresentation = async (presId: string, title: string) => {
    if (!user || isGuest || !firestore) return;
    if (!confirm(`Are you sure you want to delete presentation outline "${title}"?`)) return;

    try {
      const updatedPresentations = dbPresentations.filter(p => p.id !== presId);
      const userDocRef = doc(firestore, `users/${user.uid}`);
      await setDoc(userDocRef, { savedPresentations: updatedPresentations }, { merge: true });

      if (activeDbId === presId) {
        setPresentation(null);
        setActiveDbId(null);
        setIsEditMode(false);
      }
      toast({
        title: "Outline Deleted",
        description: `Removed "${title}" successfully.`
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRenamePresentation = async (presId: string, oldTitle: string) => {
    if (!user || isGuest || !firestore) return;
    const newTitle = prompt(`Enter new title for outline "${oldTitle}":`, oldTitle);
    if (!newTitle || !newTitle.trim() || newTitle === oldTitle) return;

    try {
      const updatedPresentations = dbPresentations.map(p => 
        p.id === presId ? { ...p, title: newTitle.trim(), updatedAt: new Date().toISOString() } : p
      );
      
      const userDocRef = doc(firestore, `users/${user.uid}`);
      await setDoc(userDocRef, { savedPresentations: updatedPresentations }, { merge: true });

      if (activeDbId === presId) {
        setPresentation(prev => prev ? { ...prev, title: newTitle.trim() } : null);
        setEditableTitle(newTitle.trim());
      }
      toast({
        title: "Outline Renamed",
        description: "Successfully updated title."
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleMovePresentation = async (presId: string, folderId: string | null) => {
    if (!user || isGuest || !firestore) return;
    try {
      const updatedPresentations = dbPresentations.map(p => 
        p.id === presId ? { ...p, folderId, updatedAt: new Date().toISOString() } : p
      );
      
      const userDocRef = doc(firestore, `users/${user.uid}`);
      await setDoc(userDocRef, { savedPresentations: updatedPresentations }, { merge: true });

      setMovingPresId(null);
      toast({
        title: "Outline Moved",
        description: folderId 
          ? `Moved outline into folder: "${dbFolders.find(f => f.id === folderId)?.name}"` 
          : "Moved outline to root Unsorted list."
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Folder expansion
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
    );
  };

  // Word revealing logic
  const setupWordAnimation = React.useCallback((slides: GeneratePresentationOutput['slides']) => {
    const wordCounts: { [key: number]: number } = {};
    const wordsBySlide: { [key: number]: string[] } = {};
    (slides || []).forEach((slide, index) => {
      wordCounts[index] = 0;
      wordsBySlide[index] = slide.content.flatMap((point) => point.split(' '));
    });
    setVisibleWordCounts(wordCounts);
    allWordsOnSlide.current = wordsBySlide;
  }, []);

  const handleRevealNextWord = React.useCallback(() => {
    if (!presentation) return;

    setVisibleWordCounts((prevCounts) => {
      const currentSlideIndex = api?.selectedScrollSnap() || 0;
      const currentWords = allWordsOnSlide.current[currentSlideIndex];
      if (!currentWords) return prevCounts;
      const currentVisibleCount = prevCounts[currentSlideIndex] || 0;

      if (currentVisibleCount < currentWords.length) {
        return {
          ...prevCounts,
          [currentSlideIndex]: currentVisibleCount + 1,
        };
      }
      return prevCounts;
    });
  }, [presentation, api]);

  // Fullscreen listeners
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  React.useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection) return;
      const text = selection.toString().trim();
      
      // Limit selection search between 1 and 4 words
      if (text.length > 1 && text.length < 50 && text.split(/\s+/).length <= 4) {
        const container = presentationContainerRef.current;
        if (container) {
          try {
            const range = selection.getRangeAt(0);
            if (container.contains(range.commonAncestorContainer)) {
              const rect = range.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();
              
              setSelectionCoords({
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.bottom - containerRect.top + 8, // 8px offset below
              });
              setSelectionText(text);
              setShowPill(true);
              return;
            }
          } catch (e) {
            // Ignore Range errors
          }
        }
      }
      setShowPill(false);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [presentation]);

  const handleInsertTextToSlide = (textToInsert: string) => {
    const activeIdx = api?.selectedScrollSnap() || 0;
    
    if (isEditMode) {
      setEditableSlides(prev => {
        const updated = [...prev];
        if (updated[activeIdx]) {
          updated[activeIdx] = {
            ...updated[activeIdx],
            content: [...updated[activeIdx].content, textToInsert]
          };
        }
        return updated;
      });
    }
    
    setPresentation(prev => {
      if (!prev) return null;
      const updatedSlides = [...prev.slides];
      if (updatedSlides[activeIdx]) {
        updatedSlides[activeIdx] = {
          ...updatedSlides[activeIdx],
          content: [...updatedSlides[activeIdx].content, textToInsert]
        };
      }
      return { ...prev, slides: updatedSlides };
    });
    
    toast({
      title: "Content Added to Slide! 📝",
      description: `Appended reference info directly to Slide ${activeIdx + 1}.`
    });
  };

  const handleSearchSplit = async (queryText: string, engineSource: string = activeSplitSource, targetTab: string = activeSplitTab) => {
    if (!queryText) return;
    setIsLoadingSplit(true);
    try {
      const response = await fetch(`/api/image-picker?query=${encodeURIComponent(queryText)}&source=${engineSource}&tab=${targetTab}&count=12`);
      const data = await response.json();
      if (data.success) {
        if (targetTab === 'SEARCH') {
          setSplitWebResults(data.webResults || []);
        } else if (targetTab === 'VIDEOS') {
          setSplitVideos(data.videos || []);
        } else if (targetTab === 'ALL') {
          setSplitImages(data.images || []);
          setSplitWebResults(data.webResults || []);
          setSplitVideos(data.videos || []);
        } else {
          setSplitImages(data.images || []);
        }
      } else {
        setSplitWebResults([]);
        setSplitVideos([]);
        setSplitImages([]);
      }
    } catch (err) {
      console.error("Split search failed:", err);
      setSplitWebResults([]);
      setSplitVideos([]);
      setSplitImages([]);
    }
    setIsLoadingSplit(false);
  };

  const handleEngineChange = async (newEngine: string) => {
    setActiveSplitSource(newEngine);
    const query = splitQuery || selectionText;
    if (query) {
      await handleSearchSplit(query, newEngine, activeSplitTab);
    }
  };

  React.useEffect(() => {
    if (showSplitSearch && splitQuery) {
      handleSearchSplit(splitQuery, activeSplitSource, activeSplitTab);
    }
  }, [activeSplitTab]);

  const handleShowImage = async (text: string) => {
    setZoomScale(1);
    setTransformOrigin("center center");
    if (showSplitSearch) {
      setSplitQuery(text);
      handleSearchSplit(text, activeSplitSource);
      return;
    }
    setIsLoadingImage(true);
    setSearchImage(null);
    setSearchImageThumbnail(null);
    setSearchImageEngine(null);
    setImageSearchError(null);
    setPickerImages([]);
    setSelectedPickerImage(null);
    setShowImageModal(true);
    
    try {
      const response = await fetch(`/api/image-search?query=${encodeURIComponent(text)}`);
      const data = await response.json();
      if (data.success && data.imageUrl) {
        setSearchImage(data.imageUrl);
        setSearchImageThumbnail(data.thumbUrl || data.imageUrl);
        setSearchImageEngine(data.engine || null);
      } else {
        setImageSearchError(`Could not find a photo matching "${text}" in the libraries.`);
        if (isFullscreen) {
          const fallbackEmoji = getEmojiFallback(text);
          if (!fallbackEmoji) {
            await loadImagePickerForFullscreen(text);
          }
        }
      }
    } catch (e) {
      console.error(e);
      setImageSearchError("Server connection failed. Could not retrieve photo.");
      if (isFullscreen) {
        const fallbackEmoji = getEmojiFallback(text);
        if (!fallbackEmoji) {
          await loadImagePickerForFullscreen(text);
        }
      }
    }
    setIsLoadingImage(false);
  };

  const loadImagePickerForFullscreen = async (text: string) => {
    setIsLoadingPicker(true);
    try {
      const response = await fetch(`/api/image-picker?query=${encodeURIComponent(text)}`);
      const data = await response.json();
      if (data.success && data.images && data.images.length > 0) {
        setPickerImages(data.images);
      }
    } catch (error) {
      console.error('Failed to load image picker:', error);
    }
    setIsLoadingPicker(false);
  };

  const handlePickerImageSelect = (imageUrl: string, thumbUrl?: string) => {
    setSearchImage(imageUrl);
    setSearchImageThumbnail(thumbUrl || imageUrl);
    setSearchImageEngine('user-selected');
    setPickerImages([]);
    setSelectedPickerImage(null);
  };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!presentation) return;
      if (event.key === ' ' || event.key === 'ArrowRight') {
        event.preventDefault();
        handleRevealNextWord();
      }
    };
    
    const container = presentationContainerRef.current;
    if (container && isFullscreen) {
        container.addEventListener('keydown', handleKeyDown);
        container.setAttribute('tabindex', '0');
        container.focus();
    }
    return () => {
      if (container) {
        container.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [presentation, handleRevealNextWord, isFullscreen]);

  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap() + 1);
    };
    
    const onReInit = () => {
        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);
    };
    
    onReInit();

    api.on("select", onSelect);
    api.on("reInit", onReInit);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onReInit);
    };
  }, [api, presentation]);

  // File upload and extraction handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.name.split('.').pop()?.toLowerCase();
    const allowedTypes = ['txt', 'md', 'pdf', 'docx'];
    if (!allowedTypes.includes(fileType || '')) {
      toast({
        variant: 'destructive',
        title: 'Unsupported File Type',
        description: 'Please upload a PDF, DOCX, TXT, or MD file.',
      });
      return;
    }

    setUploadedFile(file);
    setIsParsing(true);
    setUploadedText(null);

    try {
      if (fileType === 'txt' || fileType === 'md') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setUploadedText(text);
          setIsParsing(false);
          toast({
            title: 'File Loaded 📄',
            description: `Successfully read text from "${file.name}".`,
          });
        };
        reader.readAsText(file);
      } else {
        // Send to server API to parse PDF / DOCX
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/parse-document', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.text) {
          setUploadedText(data.text);
          toast({
            title: 'Document Parsed 📄',
            description: `Successfully parsed content from "${file.name}".`,
          });
        } else {
          throw new Error(data.error || 'Failed to extract text from document');
        }
      }
    } catch (error: any) {
      console.error(error);
      setUploadedFile(null);
      toast({
        variant: 'destructive',
        title: 'Parsing Failed',
        description: error.message || 'Could not parse document. Please try again.',
      });
    } finally {
      setIsParsing(false);
    }
  };

  // AI Submit Form Outlines
  const onSubmit = async (values: FormValues) => {
    if (!values.topic?.trim() && !uploadedText) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please enter a topic or upload a document.',
      });
      return;
    }

    setIsLoading(true);
    setPresentation(null);
    setActiveDbId(null);
    setIsEditMode(false);
    setSlidePhotos({});
    
    try {
      const result = await generatePresentation({
        topic: values.topic || "Presentation from Uploaded Document",
        slideCount: values.slideCount,
        documentText: uploadedText || undefined,
        documentName: uploadedFile?.name || undefined,
        insertPhotos,
        enable3D,
      });

      setPresentation(result);
      setEditableTitle(result.title);
      setEditableSlides(JSON.parse(JSON.stringify(result.slides)));

      // If insertPhotos is enabled, fetch related photos from the selected source
      if (insertPhotos && result.slides && result.slides.length > 0) {
        toast({
          title: "Presentation Generated 🧠",
          description: `Fetching slide-related photos from ${photoSource}...`,
        });
        
        const fetchedPhotos: { [key: number]: string } = {};
        await Promise.all(
          result.slides.map(async (slide, idx) => {
            const query = slide.imageQuery || slide.title || values.topic || "learning";
            try {
              const res = await fetch(`/api/image-picker?query=${encodeURIComponent(query)}&source=${photoSource}&count=1`);
              const data = await res.json();
              if (data.success && data.images && data.images.length > 0) {
                fetchedPhotos[idx] = data.images[0].url;
              }
            } catch (err) {
              console.error("Failed to fetch image for slide " + idx, err);
            }
          })
        );
        setSlidePhotos(fetchedPhotos);
      }

      // Map suggested theme to beautiful theme defaults
      if (result.suggestedTheme) {
        const themeLower = result.suggestedTheme.toLowerCase();
        let matchedTheme = themes[1].className; // Midnight Glassmorphic default
        
        if (themeLower.includes('space') || themeLower.includes('cosmic') || themeLower.includes('nebula')) {
          matchedTheme = themes[8].className; // Cosmic Nebula Dream
        } else if (themeLower.includes('solar') || themeLower.includes('gold') || themeLower.includes('royal') || themeLower.includes('amethyst')) {
          matchedTheme = themes[5].className; // Royal Amethyst & Gold
        } else if (themeLower.includes('nature') || themeLower.includes('forest') || themeLower.includes('emerald') || themeLower.includes('green')) {
          matchedTheme = themes[6].className; // Deep Emerald Forest
        } else if (themeLower.includes('teal') || themeLower.includes('aurora') || themeLower.includes('ocean')) {
          matchedTheme = themes[3].className; // Aurora Teal
        } else if (themeLower.includes('volcano') || themeLower.includes('obsidian') || themeLower.includes('fire') || themeLower.includes('orange')) {
          matchedTheme = themes[9].className; // Volcano Obsidian
        } else if (themeLower.includes('cherry') || themeLower.includes('blossom') || themeLower.includes('sakura') || themeLower.includes('pink') || themeLower.includes('rose')) {
          matchedTheme = themes[7].className; // Sakura Blossom Glassmorphic
        } else if (themeLower.includes('cyber') || themeLower.includes('neon') || themeLower.includes('tech')) {
          matchedTheme = themes[4].className; // Cyber Neon
        } else if (themeLower.includes('classic') || themeLower.includes('serif') || themeLower.includes('editorial') || themeLower.includes('plain')) {
          matchedTheme = themes[10].className; // Classic Editorial Serif
        } else if (themeLower.includes('dark') || themeLower.includes('charcoal')) {
          matchedTheme = themes[11].className; // Dark Charcoal
        }
        setTheme(matchedTheme);
      }

      if (typeof window !== 'undefined') window.dispatchEvent(new Event('ai_usage_increment'));
      setupWordAnimation(result.slides);
      
      toast({
        title: "Success! 🎉",
        description: `Successfully generated a beautiful presentation outline.`,
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate the presentation. Please try again.',
      });
    }
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (!presentation) return;

    const { title, slides } = presentation;
    const filename = `${title.replace(/\s+/g, '_')}_presentation.html`;

    const slideHtml = slides
      .map(
        (slide, idx) => {
          const photoUrl = slidePhotos[idx] || (slide as any).photoUrl;
          return `
          <div style="page-break-after: always; padding: 40px; border: 1px solid #ccc; margin-bottom: 20px; position: relative; display: flex; flex-direction: row; gap: 20px;">
              <div style="flex: 1;">
                <h2 style="font-size: 24px; font-family: Arial, sans-serif;">${slide.title}</h2>
                <ul style="font-size: 18px; font-family: Arial, sans-serif; line-height: 1.6; margin-bottom: 40px;">
                    ${slide.content.map((point) => `<li>${point}</li>`).join('')}
                </ul>
              </div>
              ${photoUrl ? `<div style="width: 300px; shrink: 0;"><img src="${photoUrl}" style="width: 100%; border-radius: 12px; max-height: 350px; object-fit: cover;" /></div>` : ''}
              <div style="position: absolute; bottom: 15px; left: 0; right: 0; text-align: center; font-size: 11px; color: #a0aec0; font-family: Arial, sans-serif; border-top: 1px solid #eee; padding-top: 5px; margin: 0 40px;">
                  www.lingolandverse.com
              </div>
          </div>
          `;
        }
      )
      .join('');

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; }
                @media print {
                    div {
                       break-inside: avoid;
                    }
                }
            </style>
        </head>
        <body>
            <h1 style="font-size: 36px; text-align: center;">${title}</h1>
            ${slideHtml}
        </body>
        </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Download Started',
      description: 'Your presentation.html file is downloading. You can open this file in PowerPoint.',
    });
  };

  const loadPptxGenJS = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).PptxGenJS) {
        resolve((window as any).PptxGenJS);
        return;
      }

      // Check if script element already exists
      const existing = document.getElementById('pptxgen-cdn-script');
      if (existing) {
        let checkCount = 0;
        const interval = setInterval(() => {
          if ((window as any).PptxGenJS) {
            clearInterval(interval);
            resolve((window as any).PptxGenJS);
          }
          checkCount++;
          if (checkCount > 50) { // 5 seconds timeout
            clearInterval(interval);
            reject(new Error('Timeout loading PowerPoint library'));
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.id = 'pptxgen-cdn-script';
      script.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
      script.onload = () => {
        if ((window as any).PptxGenJS) {
          resolve((window as any).PptxGenJS);
        } else {
          reject(new Error('PowerPoint library loaded but not found on window context'));
        }
      };
      script.onerror = () => {
        reject(new Error('Failed to load PowerPoint exporter from CDN'));
      };
      document.body.appendChild(script);
    });
  };

  const handleDownloadPptx = async () => {
    if (!presentation) return;
    setIsDownloadingPptx(true);

    try {
      const PptxGenClass = await loadPptxGenJS();
      const pptx = new PptxGenClass();
      pptx.layout = 'LAYOUT_16x9';

      // Define visual theme mapping
      let textColor = '1e293b'; // slate-800
      let bgColor = 'ffffff'; // white

      // Map styling theme colors for the PPTX background
      if (theme.includes('slate-950') || theme.includes('bg-neutral-950') || theme.includes('bg-black') || theme.includes('bg-gray-800')) {
        textColor = 'f8fafc'; // slate-50
        bgColor = '0f172a'; // slate-900 (dark background for PPTX)
      } else if (theme.includes('bg-rose-950') || theme.includes('bg-pink-950')) {
        textColor = 'fff1f2';
        bgColor = '4c0519'; // rose-950
      } else if (theme.includes('bg-[#fdfbf7]')) {
        textColor = '1c1917';
        bgColor = 'fafaf9';
      } else if (theme.includes('bg-amber-100')) {
        textColor = '451a03';
        bgColor = 'fef3c7';
      }

      // Add slides
      presentation.slides.forEach((slide, idx) => {
        const pptxSlide = pptx.addSlide();
        
        // Background color
        pptxSlide.background = { fill: bgColor };

        // Check if there is a photo for this slide
        const photoUrl = slidePhotos[idx] || (slide as any).photoUrl;

        // Slide title
        pptxSlide.addText(slide.title, {
          x: 0.5,
          y: 0.5,
          w: photoUrl ? 6.5 : 12.3,
          h: 1.0,
          fontSize: 28,
          bold: true,
          color: textColor,
          fontFace: 'Arial',
        });

        // Slide content (bullet points)
        const bulletPoints = slide.content.map(point => ({ text: point, options: { bullet: true } }));
        pptxSlide.addText(bulletPoints as any, {
          x: 0.5,
          y: 1.8,
          w: photoUrl ? 6.5 : 12.3,
          h: 4.8,
          fontSize: 16,
          color: textColor,
          fontFace: 'Arial',
          lineSpacing: 24,
        });

        // Slide photo
        if (photoUrl) {
          try {
            pptxSlide.addImage({
              path: photoUrl,
              x: 7.5,
              y: 0.8,
              w: 5.3,
              h: 5.6,
              sizing: { type: 'cover', w: 5.3, h: 5.6 },
            });
          } catch (imgError) {
            console.error("Failed to add image to PPTX slide", imgError);
          }
        }

        // Add a footer
        pptxSlide.addText("Generated by LingoLand Presentation Maker", {
          x: 0.5,
          y: 7.0,
          w: 12.3,
          h: 0.3,
          fontSize: 10,
          color: '94a3b8', // slate-400
          align: 'center',
        });
      });

      // Save PowerPoint
      await pptx.writeFile({ fileName: `${presentation.title.replace(/\s+/g, '_')}_presentation.pptx` });
      
      toast({
        title: "PowerPoint Downloaded! 📊",
        description: `Successfully exported "${presentation.title}" to a ready-made PowerPoint presentation.`,
      });
    } catch (err: any) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Failed to generate PowerPoint file: ' + (err.message || err),
      });
    }
    setIsDownloadingPptx(false);
  };

  const handleFullScreen = () => {
    if (presentationContainerRef.current) {
      if (!document.fullscreenElement) {
        presentationContainerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleCreateNew = () => {
    setPresentation(null);
    setActiveDbId(null);
    setIsEditMode(false);
    setUploadedFile(null);
    setUploadedText(null);
    setSlidePhotos({});
    form.reset();
  };

  // Cover and reveal word utility
  const renderTextWithCoverAndReveal = (text: string, slideIdx: number) => {
    const slideCovered = coveredTexts[slideIdx] || [];
    if (slideCovered.length === 0) return text;

    const sortedCovered = [...slideCovered].sort((a, b) => b.length - a.length);
    const escapeRegex = (s: string) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regexParts = sortedCovered.map(c => `(${escapeRegex(c)})`);
    const regex = new RegExp(regexParts.join('|'), 'gi');

    const parts = text.split(regex);
    
    return parts.map((part, idx) => {
      if (!part) return null;
      
      const isMatched = sortedCovered.some(c => c.toLowerCase() === part.toLowerCase());
      if (isMatched) {
        const isRevealed = (revealedTexts[slideIdx] || []).includes(part.toLowerCase());
        return (
          <span
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              toggleRevealText(slideIdx, part.toLowerCase());
            }}
            className={cn(
              "mx-1 cursor-pointer transition-all duration-300 font-bold px-1.5 py-0.5 rounded-lg border inline-flex items-center",
              isRevealed
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-in fade-in duration-300"
                : "bg-purple-950/80 text-transparent select-none border-purple-500/40 backdrop-blur-md shadow-inner filter blur-[3.5px] hover:blur-none hover:bg-purple-900/80 hover:border-purple-400/50"
            )}
            title={isRevealed ? "Click to Cover" : "Click to Reveal"}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Slide content render helper
  const renderAnimatedContent = (content: string[], visibleCount: number, slideIdx: number) => {
    let wordCounter = 0;
    return content
      .map((point, pointIndex) => {
        const words = point.split(' ');
        const visibleWords = [];
        for (let i = 0; i < words.length; i++) {
          if (wordCounter < visibleCount) {
            visibleWords.push(words[i]);
            wordCounter++;
          }
        }
        if (visibleWords.length > 0) {
          const joinedText = visibleWords.join(' ');
          return (
            <li key={pointIndex}>
              {renderTextWithCoverAndReveal(joinedText, slideIdx)}
            </li>
          );
        }
        return null;
      })
      .filter(Boolean);
  };

  // Filter lists based on Search input
  const filteredPresentations = dbPresentations.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isAuthLoading) {
    return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>;
  }

  if (isGuest || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="p-6 bg-primary/10 rounded-full">
          <MousePointerClick className="h-20 w-20 text-primary animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-foreground">PRESENTATION MAKER ACCESS RESTRICTED</h2>
          <p className="text-muted-foreground text-lg">Please sign in or create an account to access the Presentation Maker.</p>
        </div>
        <Button asChild size="lg" className="h-14 px-10 text-xl font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600">
          <Link href="/auth">Sign In or Create Account</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* 1. Left Library Sidebar Manager */}
      <div className="lg:col-span-1 space-y-4 select-none animate-in fade-in slide-in-from-left duration-500">
        <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-md text-white rounded-3xl overflow-hidden shadow-2xl p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm tracking-wider uppercase text-purple-400">Library Outlines</h3>
              <div className="flex items-center gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setShowFolderInput(!showFolderInput)} 
                  title="Create Folder"
                  className="h-8 w-8 text-slate-400 hover:text-white"
                >
                  <FolderPlus className="h-4.5 w-4.5" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={handleCreateNew} 
                  title="New Outline Generator"
                  className="h-8 w-8 text-slate-400 hover:text-white"
                >
                  <Wand2 className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>

            {/* Folder creation box */}
            {showFolderInput && (
              <div className="flex gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800 animate-in slide-in-from-top-2 duration-300">
                <Input 
                  placeholder="Folder name..." 
                  value={folderName} 
                  onChange={(e) => setFolderName(e.target.value)}
                  className="h-8 text-xs bg-slate-900 border-slate-750 text-white rounded-lg"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                />
                <Button size="sm" onClick={handleCreateFolder} className="h-8 text-xs font-bold rounded-lg px-2 bg-purple-600 hover:bg-purple-500">Add</Button>
                <Button size="icon" variant="ghost" onClick={() => setShowFolderInput(false)} className="h-8 w-8 text-slate-500 hover:text-white"><X className="h-3.5 w-3.5"/></Button>
              </div>
            )}

            {/* Search outline titles */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <Input 
                placeholder="Search presentations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8 text-xs bg-slate-950/50 border-slate-800 text-white rounded-xl"
              />
            </div>

            {/* Tree View Folder list */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {/* Loaded folders */}
              {dbFolders.map(folder => {
                const isExpanded = expandedFolders.includes(folder.id);
                const presentationsInFolder = filteredPresentations.filter(p => p.folderId === folder.id);

                return (
                  <div key={folder.id} className="space-y-1">
                    <div className="flex items-center justify-between group p-1.5 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-2 cursor-pointer flex-1 min-w-0" onClick={() => toggleFolder(folder.id)}>
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-500" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-500" />}
                        {isExpanded ? <FolderOpen className="h-4.5 w-4.5 text-yellow-500 shrink-0" /> : <Folder className="h-4.5 w-4.5 text-yellow-600 shrink-0" />}
                        <span className="text-xs font-bold truncate text-slate-200">{folder.name}</span>
                        <span className="text-[10px] text-slate-500 font-bold">({presentationsInFolder.length})</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-500 hover:text-white" onClick={() => handleRenameFolder(folder.id, folder.name)}><Edit className="h-3 w-3"/></Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-500 hover:text-red-400" onClick={() => handleDeleteFolder(folder.id, folder.name)}><Trash2 className="h-3 w-3"/></Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="pl-6 border-l border-slate-800 ml-3 space-y-1 py-1 animate-in fade-in duration-300">
                        {presentationsInFolder.length > 0 ? (
                          presentationsInFolder.map(pres => (
                            <div 
                              key={pres.id} 
                              className={cn(
                                "flex items-center justify-between group p-1.5 rounded-lg text-xs cursor-pointer hover:bg-white/5 transition-all",
                                activeDbId === pres.id ? "bg-purple-650/40 text-purple-200 border-l-2 border-purple-500" : "text-slate-400"
                              )}
                            >
                              <div className="flex items-center gap-1.5 flex-1 min-w-0" onClick={() => loadDbPresentation(pres)}>
                                <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                <span className="font-medium truncate">{pres.title}</span>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0 ml-1 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-5 w-5 text-slate-500 hover:text-white" onClick={() => handleRenamePresentation(pres.id, pres.title)}><Edit className="h-2.5 w-2.5"/></Button>
                                <Button size="icon" variant="ghost" className="h-5 w-5 text-slate-500 hover:text-white" onClick={() => setMovingPresId(movingPresId === pres.id ? null : pres.id)} title="Move Folder"><FolderSymlink className="h-2.5 w-2.5"/></Button>
                                <Button size="icon" variant="ghost" className="h-5 w-5 text-slate-500 hover:text-red-400" onClick={() => handleDeletePresentation(pres.id, pres.title)}><Trash2 className="h-2.5 w-2.5"/></Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-[10px] text-slate-600 italic pl-3 py-1">Folder is empty</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Unsorted Outlines */}
              <div className="pt-2 border-t border-slate-800/80">
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 pl-1 mb-2">Unsorted Outlines</p>
                <div className="space-y-1">
                  {filteredPresentations.filter(p => !p.folderId).length > 0 ? (
                    filteredPresentations.filter(p => !p.folderId).map(pres => (
                      <div 
                        key={pres.id} 
                        className={cn(
                          "flex items-center justify-between group p-1.5 rounded-lg text-xs cursor-pointer hover:bg-white/5 transition-all",
                          activeDbId === pres.id ? "bg-purple-650/40 text-purple-200 border-l-2 border-purple-500" : "text-slate-400"
                        )}
                      >
                        <div className="flex items-center gap-1.5 flex-1 min-w-0" onClick={() => loadDbPresentation(pres)}>
                          <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          <span className="font-medium truncate">{pres.title}</span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0 ml-1 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-5 w-5 text-slate-500 hover:text-white" onClick={() => handleRenamePresentation(pres.id, pres.title)}><Edit className="h-2.5 w-2.5"/></Button>
                          <Button size="icon" variant="ghost" className="h-5 w-5 text-slate-500 hover:text-white" onClick={() => setMovingPresId(movingPresId === pres.id ? null : pres.id)} title="Move Folder"><FolderSymlink className="h-2.5 w-2.5"/></Button>
                          <Button size="icon" variant="ghost" className="h-5 w-5 text-slate-500 hover:text-red-400" onClick={() => handleDeletePresentation(pres.id, pres.title)}><Trash2 className="h-2.5 w-2.5"/></Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-slate-600 italic pl-1">No unsorted outlines found</div>
                  )}
                </div>
              </div>
            </div>

            {/* Folder Move Dialog selector */}
            {movingPresId && (
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2 animate-in fade-in duration-300">
                <p className="font-bold text-slate-400 flex justify-between items-center">
                  <span>Move Outline To:</span>
                  <Button size="icon" variant="ghost" className="h-5 w-5 text-slate-500 hover:text-white animate-pulse" onClick={() => setMovingPresId(null)}><X className="h-3 w-3"/></Button>
                </p>
                <div className="space-y-1 max-h-[140px] overflow-y-auto">
                  <div 
                    onClick={() => handleMovePresentation(movingPresId, null)} 
                    className="p-1.5 rounded bg-slate-900 hover:bg-purple-950/40 text-left cursor-pointer"
                  >
                    📂 Unsorted Root
                  </div>
                  {dbFolders.map(f => (
                    <div 
                      key={f.id} 
                      onClick={() => handleMovePresentation(movingPresId, f.id)} 
                      className="p-1.5 rounded bg-slate-900 hover:bg-purple-950/40 text-left cursor-pointer"
                    >
                      📁 {f.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 2. Right Main Editor & Preview workspace */}
      <div className="lg:col-span-3 space-y-6 animate-in fade-in slide-in-from-right duration-500">
        {isLoading && (
          <div className="flex items-center justify-center rounded-lg border border-slate-800 bg-slate-950/60 p-12 text-white">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-purple-500" />
            <p className="ml-4 text-muted-foreground font-bold">
              Generating your presentation outline...
            </p>
          </div>
        )}

        {presentation ? (
          <div className="space-y-4 animate-in zoom-in-95 duration-500">
            {/* Outline configuration card */}
            <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-md text-white rounded-3xl overflow-hidden shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div className="flex-1 min-w-0">
                    {isEditMode ? (
                      <Input 
                        value={editableTitle} 
                        onChange={(e) => setEditableTitle(e.target.value)}
                        className="text-2xl font-black bg-slate-950 border-slate-800 text-white rounded-xl tracking-tight animate-pulse"
                      />
                    ) : (
                      <CardTitle className="text-2xl font-black text-slate-100 flex items-center gap-2 truncate">
                        <span>{presentation.title}</span>
                      </CardTitle>
                    )}
                    <CardDescription className="text-slate-400 font-medium">
                      Generated presentation outlines with {presentation.slides.length} slides.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button onClick={handleCreateNew} variant="secondary" className="h-10 text-xs font-bold rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700">
                      <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                      Create New
                    </Button>
                    <Button onClick={handleDownload} variant="outline" className="h-10 text-xs font-bold rounded-xl border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white">
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Download HTML
                    </Button>
                    <Button 
                      onClick={handleDownloadPptx} 
                      disabled={isDownloadingPptx}
                      variant="outline" 
                      className="h-10 text-xs font-bold rounded-xl border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white"
                    >
                      {isDownloadingPptx ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="mr-1.5 h-3.5 w-3.5 text-indigo-400" />
                      )}
                      Download PPTX
                    </Button>
                    <Button 
                      onClick={() => {
                        const idx = api?.selectedScrollSnap() || 0;
                        setCoveredTexts(prev => ({ ...prev, [idx]: [] }));
                        setRevealedTexts(prev => ({ ...prev, [idx]: [] }));
                        toast({
                          title: "Covers Cleared 👁️",
                          description: `All covered words on Slide ${idx + 1} have been reset.`
                        });
                      }}
                      variant="outline" 
                      className="h-10 text-xs font-bold rounded-xl border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white"
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5 text-purple-400" />
                      Clear Covers
                    </Button>
                    <Button onClick={handleFullScreen} variant="outline" className="h-10 text-xs font-bold rounded-xl border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white">
                      <Maximize className="mr-1.5 h-3.5 w-3.5" />
                      Fullscreen
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 border-t border-slate-850 pt-4">
                {/* Visual Selectors bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="theme-select" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Theme Mode</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger id="theme-select" className="bg-slate-950 border-slate-800 text-slate-200 h-10 rounded-xl">
                        <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-slate-300">
                        {themes.map((t) => (
                          <SelectItem key={t.name} value={t.className}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="font-select" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Font Family</Label>
                    <Select value={fontFamily} onValueChange={setFontFamily}>
                      <SelectTrigger id="font-select" className="bg-slate-950 border-slate-800 text-slate-200 h-10 rounded-xl">
                        <SelectValue placeholder="Select a font" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-slate-300">
                        {fontFamilies.map((f) => (
                          <SelectItem key={f.name} value={f.className} className={f.className}>{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="size-select" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Text Size</Label>
                    <Select value={fontSize.className} onValueChange={(value) => setFontSize(fontSizes.find(s => s.className === value) || fontSizes[1])}>
                      <SelectTrigger id="size-select" className="bg-slate-950 border-slate-800 text-slate-200 h-10 rounded-xl">
                        <SelectValue placeholder="Select a size" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-slate-300">
                        {fontSizes.map((s) => (
                          <SelectItem key={s.name} value={s.className}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alignment</Label>
                    <div className="flex gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl h-10">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setAlign('left')}
                        className={cn("flex-1 h-full rounded-lg text-xs gap-1 text-slate-400 hover:text-white", align === 'left' && "bg-slate-800 text-white")}
                      >
                        <AlignLeft className="h-3.5 w-3.5"/> Left
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setAlign('center')}
                        className={cn("flex-1 h-full rounded-lg text-xs gap-1 text-slate-400 hover:text-white", align === 'center' && "bg-slate-800 text-white")}
                      >
                        <AlignCenter className="h-3.5 w-3.5"/> Center
                      </Button>
                    </div>
                  </div>
                </div>

                {/* DB Save and Live Edit Toolbar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-850">
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => setIsEditMode(!isEditMode)} 
                      variant="outline" 
                      className={cn("h-9 text-xs font-extrabold rounded-lg border-slate-800", isEditMode ? "bg-purple-950 border-purple-500 text-purple-200" : "bg-slate-950 text-slate-400")}
                    >
                      <Edit className="mr-1.5 h-3.5 w-3.5" />
                      {isEditMode ? "Exit Outline Editor" : "Edit Slide Content"}
                    </Button>
                  </div>
                  <Button 
                    onClick={handleSaveToDb} 
                    disabled={isSavingDb} 
                    className="h-9 px-4 text-xs font-extrabold rounded-lg bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg"
                  >
                    {isSavingDb ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                    {activeDbId ? "Save Outline Changes" : "Save to Outline Library"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 3. Sliding Carousel Render */}
            <div
              ref={presentationContainerRef}
              className={cn(
                  'relative h-[480px] w-full mt-4 select-text overflow-hidden bg-slate-950 rounded-3xl border border-slate-800', 
                  isFullscreen && 'fixed inset-0 z-50 w-screen h-screen !m-0 rounded-none bg-slate-950',
                  showSplitSearch && 'flex flex-row'
              )}
              onClick={(isFullscreen || isEditMode || showSplitSearch) ? undefined : handleRevealNextWord}
            >
              {/* Three.js 3D Background Canvas */}
              {presentation && (
                <ThreeBackground 
                  themeStyle={theme}
                  activeSlideIndex={current - 1}
                  threeDStyle={presentation.slides[current - 1]?.threeDObjectStyle || ''}
                  enabled={enable3D}
                />
              )}

              {/* Left Side: Slide Carousel & Overlays */}
              <div className={cn(
                "h-full flex flex-col justify-between relative",
                showSplitSearch ? "flex-1 overflow-hidden" : "w-full"
              )}>
                {isFullscreen && (
                  <>
                    <Button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        const idx = api?.selectedScrollSnap() || 0;
                        setCoveredTexts(prev => ({ ...prev, [idx]: [] }));
                        setRevealedTexts(prev => ({ ...prev, [idx]: [] }));
                        toast({
                          title: "Covers Cleared 👁️",
                          description: `All covered words on Slide ${idx + 1} have been reset.`
                        });
                      }}
                      variant="secondary"
                      className="absolute top-4 right-24 z-20 h-auto p-2 gap-1.5 bg-black/20 text-white/80 hover:bg-black/30 hover:text-white"
                    >
                      <Eye className="h-4 w-4 text-purple-400" />
                      <span className="text-xs">Clear Covers</span>
                    </Button>
                    <Button
                      onClick={(e) => { e.stopPropagation(); handleFullScreen(); }}
                      variant="secondary"
                      className="absolute top-4 right-4 z-20 h-auto p-2 gap-1.5 bg-black/20 text-white/80 hover:bg-black/30 hover:text-white"
                    >
                      <Minimize className="h-4 w-4" />
                      <span className="text-xs">Exit</span>
                    </Button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 rounded-full bg-black/30 text-white/80 px-3 py-1 text-sm font-mono">
                      {current} / {count}
                    </div>
                  </>
                )}
                
                <Carousel setApi={setApi} className="w-full h-full">
                  <CarouselContent className="h-full">
                    {(isEditMode ? editableSlides : presentation.slides).map((slide, index) => (
                      <CarouselItem key={index} className="h-full">
                        <div 
                          className={cn(
                            "w-full h-full flex transition-all duration-700 ease-out transform-gpu",
                            theme, fontFamily
                          )}
                          style={enable3D ? {
                            transform: index === (current - 1)
                              ? 'perspective(1000px) rotateY(0deg) scale(1) translateZ(0px)'
                              : index < (current - 1)
                                ? 'perspective(1000px) rotateY(15deg) scale(0.92) translateZ(-50px)'
                                : 'perspective(1000px) rotateY(-15deg) scale(0.92) translateZ(-50px)',
                            opacity: index === (current - 1) ? 1 : 0.35,
                            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                          } : undefined}
                          onClick={(isFullscreen || isEditMode) ? undefined : handleRevealNextWord}
                        >
                          <div className={cn(
                            "w-full flex flex-col justify-center",
                            !isFullscreen && "overflow-y-auto p-8 md:p-12",
                            isFullscreen && "overflow-hidden py-16 px-8 md:px-16 lg:px-24 h-full"
                          )}>
                            <div className={cn(
                              "w-full animate-in fade-in duration-700 mx-auto flex flex-col md:flex-row items-center justify-center",
                              isFullscreen ? "max-w-[85vw] gap-16 h-full max-h-[85vh] overflow-hidden" : "max-w-6xl gap-8",
                              align === 'center' ? 'text-center' : 'text-left'
                            )}>
                              {/* Left side text content */}
                              <div className={cn(
                                "flex-1 min-w-0 w-full",
                                isFullscreen && "h-full overflow-y-auto pr-4 scrollbar-thin",
                                (slidePhotos[index] || (slide as any).photoUrl) && !isEditMode ? (isFullscreen ? "md:w-[60%]" : "md:w-3/5") : "w-full"
                              )}>
                                {/* Slide Title field */}
                                {isEditMode ? (
                                  <div className="space-y-1 mb-4 text-left">
                                    <Label className="text-[10px] text-slate-500 font-extrabold uppercase">Slide Title</Label>
                                    <Input 
                                      value={slide.title} 
                                      onChange={(e) => {
                                        const updated = [...editableSlides];
                                        updated[index].title = e.target.value;
                                        setEditableSlides(updated);
                                      }}
                                      className="bg-slate-950/80 border-slate-800 text-white font-bold h-9 animate-pulse"
                                    />
                                  </div>
                                ) : (
                                  <h2 className={cn("font-bold transition-all duration-300",
                                    !isFullscreen ? `mb-6 ${fontSize.titleClassName}` : `mb-8 lg:mb-16 ${fontSize.fullScreenTitleClassName}`
                                  )}>
                                    {slide.title}
                                  </h2>
                                )}

                                {/* Slide Bullet points */}
                                {isEditMode ? (
                                  <div className="space-y-3 mt-4 text-left">
                                    <Label className="text-[10px] text-slate-500 font-extrabold uppercase">Bullet Outline points</Label>
                                    {slide.content.map((point, ptIdx) => (
                                      <div key={ptIdx} className="flex gap-1.5 items-start">
                                        <Input 
                                          value={point}
                                          onChange={(e) => {
                                            const updated = [...editableSlides];
                                            updated[index].content[ptIdx] = e.target.value;
                                            setEditableSlides(updated);
                                          }}
                                          className="bg-slate-950/80 border-slate-800 text-white text-xs h-9 animate-pulse"
                                        />
                                        <Button 
                                          size="icon" 
                                          variant="ghost" 
                                          onClick={() => {
                                            const updated = [...editableSlides];
                                            updated[index].content.splice(ptIdx, 1);
                                            setEditableSlides(updated);
                                          }}
                                          className="h-9 w-9 text-slate-500 hover:text-red-400 shrink-0"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => {
                                        const updated = [...editableSlides];
                                        updated[index].content.push("New slide point outline statement.");
                                        setEditableSlides(updated);
                                      }}
                                      className="h-8 text-xs font-bold text-slate-400 hover:text-white"
                                    >
                                      <Plus className="mr-1.5 h-3.5 w-3.5" /> Add slide point
                                    </Button>
                                  </div>
                                ) : (
                                  <ul className={cn("transition-all duration-300",
                                    align === 'center' ? 'list-none pl-0 mx-auto' : 'list-disc pl-8',
                                    !isFullscreen ? `space-y-4 ${fontSize.className}` : `space-y-4 md:space-y-5 lg:space-y-6 ${fontSize.fullScreenClassName}`
                                  )}>
                                    {renderAnimatedContent(slide.content, visibleWordCounts[index] || 0, index)}
                                  </ul>
                                )}
                              </div>

                              {/* Beautiful dynamic slide photo */}
                              {(slidePhotos[index] || (slide as any).photoUrl) && !isEditMode && (
                                <div className={cn("w-full shrink-0 select-none animate-in zoom-in-95 duration-500", isFullscreen ? "md:w-[35%]" : "md:w-2/5")}>
                                  <div className="relative group perspective-[1000px]">
                                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform-gpu transition-all duration-500 hover:scale-105 hover:rotate-y-6 hover:shadow-[0_25px_60px_rgba(99,102,241,0.25)]">
                                      <img 
                                        src={slidePhotos[index] || (slide as any).photoUrl} 
                                        alt={slide.title} 
                                        className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-110" 
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                        <p className="text-[10px] text-white/80 font-mono italic">Source: {photoSource}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className={cn(
                    "absolute z-10",
                    !isFullscreen ? "left-4 top-1/2 -translate-y-1/2 bg-slate-950 border border-slate-800 text-white hover:bg-slate-900" : "left-4 bottom-4 bg-black/20 text-white hover:bg-black/40"
                  )} />
                  <CarouselNext className={cn(
                    "absolute z-10",
                    !isFullscreen ? "right-4 top-1/2 -translate-y-1/2 bg-slate-950 border border-slate-800 text-white hover:bg-slate-900" : "right-4 bottom-4 bg-black/20 text-white hover:bg-black/40"
                  )} />
                </Carousel>

                {/* Highlighted text visual search option button */}
                {showPill && (
                  <div 
                    className={cn(
                      "absolute z-30 transition-all duration-200 select-none animate-in fade-in zoom-in-95 flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-full shadow-[0_10px_30px_rgba(99,102,241,0.3)] backdrop-blur-md",
                      "fixed bottom-24 left-1/2 -translate-x-1/2 md:absolute md:bottom-auto md:left-auto"
                    )}
                    style={typeof window !== 'undefined' && window.innerWidth >= 768 && selectionCoords ? {
                      left: `${selectionCoords.x}px`,
                      top: `${selectionCoords.y}px`,
                      transform: 'translateX(-50%)',
                    } : undefined}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowImage(selectionText);
                      }}
                      className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full flex items-center gap-1 transition-all active:scale-95 shrink-0"
                    >
                      <Search className="h-3 w-3" /> Show Image
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCoverText(selectionText);
                      }}
                      className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-full flex items-center gap-1 transition-all active:scale-95 shrink-0 border border-slate-700"
                    >
                      <EyeOff className="h-3 w-3 text-purple-400" /> Cover Text
                    </button>
                  </div>
                )}

                {/* Floating glassmorphic image search modal */}
                {showImageModal && (
                  <div 
                    className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300 select-none"
                    onClick={() => setShowImageModal(false)}
                  >
                    <div 
                      className={cn(
                        "relative bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-[0_20px_50px_rgba(99,102,241,0.3)] animate-in zoom-in-95 duration-300 text-center space-y-4 backdrop-blur-md",
                        isFullscreen ? "w-full max-w-4xl max-h-[85vh] flex flex-col justify-between" : "w-full max-w-sm"
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                        <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest">
                          {isFullscreen && pickerImages.length > 0 ? "Image Picker" : "Visual Search"}
                        </h4>
                        <button 
                          onClick={() => setShowImageModal(false)}
                          className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className={cn(
                        "relative rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 p-4",
                        isFullscreen ? "min-h-[500px] w-full flex-1" : "aspect-square w-full"
                      )}>
                        {isLoadingImage || isLoadingPicker ? (
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">Searching Libraries...</p>
                          </div>
                        ) : searchImage ? (
                           <div 
                             className="w-full h-full overflow-hidden relative cursor-zoom-in rounded-xl"
                             onMouseMove={(e) => {
                               if (zoomScale <= 1) return;
                               const rect = e.currentTarget.getBoundingClientRect();
                               const x = ((e.clientX - rect.left) / rect.width) * 100;
                               const y = ((e.clientY - rect.top) / rect.height) * 100;
                               setTransformOrigin(`${x}% ${y}%`);
                             }}
                             onMouseLeave={() => {
                               setTransformOrigin("center center");
                             }}
                           >
                             <img 
                               src={searchImage} 
                               alt={selectionText} 
                               className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500 transition-transform duration-200 ease-out"
                               style={{ 
                                 transform: `scale(${zoomScale})`, 
                                 transformOrigin: transformOrigin 
                               }}
                               onError={() => {
                                 if (searchImageThumbnail && searchImage !== searchImageThumbnail) {
                                   setSearchImage(searchImageThumbnail);
                                 } else {
                                   setSearchImage(null);
                                   setImageSearchError(`The image for "${selectionText}" failed to load from the remote library.`);
                                 }
                               }}
                             />
                             
                             {/* Floating Zoom Controls Overlay */}
                             <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
                               <Button
                                 size="icon"
                                 variant="ghost"
                                 onClick={(e) => { e.stopPropagation(); setZoomScale(prev => Math.max(0.5, prev - 0.25)); }}
                                 className="h-7 w-7 text-white hover:bg-white/20 hover:text-white rounded-lg"
                                 title="Zoom Out"
                               >
                                 <ZoomOut className="h-4 w-4" />
                               </Button>
                               <span className="text-[10px] text-white font-mono font-bold flex items-center px-1">
                                 {Math.round(zoomScale * 100)}%
                               </span>
                               <Button
                                 size="icon"
                                 variant="ghost"
                                 onClick={(e) => { e.stopPropagation(); setZoomScale(prev => Math.min(3, prev + 0.25)); }}
                                 className="h-7 w-7 text-white hover:bg-white/20 hover:text-white rounded-lg"
                                 title="Zoom In"
                               >
                                 <ZoomIn className="h-4 w-4" />
                               </Button>
                               {zoomScale !== 1 && (
                                 <Button
                                   size="icon"
                                   variant="ghost"
                                   onClick={(e) => { e.stopPropagation(); setZoomScale(1); setTransformOrigin("center center"); }}
                                   className="h-7 w-7 text-purple-400 hover:bg-white/20 hover:text-purple-300 rounded-lg"
                                   title="Reset Zoom"
                                 >
                                   <Maximize className="h-3.5 w-3.5" />
                                 </Button>
                               )}
                             </div>
                           </div>
                        ) : imageSearchError ? (
                          (() => {
                            const fallbackEmoji = getEmojiFallback(selectionText);
                            // Show image picker in fullscreen mode when no emoji fallback and picker has images
                            if (isFullscreen && !fallbackEmoji && pickerImages.length > 0) {
                              return (
                                <div className="flex flex-col items-center justify-center gap-3 w-full h-full">
                                  {isLoadingPicker ? (
                                    <>
                                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Loading Images...</p>
                                    </>
                                  ) : (
                                    <div className="grid grid-cols-2 gap-2 w-full h-full overflow-y-auto">
                                      {pickerImages.map((img, idx) => (
                                        <button
                                          key={idx}
                                          onClick={() => handlePickerImageSelect(img.url, img.thumb)}
                                          className="relative aspect-square rounded-lg overflow-hidden border border-slate-700 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all group"
                                        >
                                          <img 
                                            src={img.thumb || img.url} 
                                            alt={img.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                            <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            return (
                              <div className="flex flex-col items-center justify-center text-center p-4 space-y-4 w-full">
                                {fallbackEmoji ? (
                                  <>
                                    <span className="text-7xl filter drop-shadow-[0_10px_20px_rgba(168,85,247,0.5)] animate-bounce select-none">
                                      {fallbackEmoji}
                                    </span>
                                    <div className="space-y-1">
                                      <p className="text-[11px] text-purple-300 font-extrabold uppercase tracking-widest">Emoji Fallback Loaded</p>
                                      <p className="text-[10px] text-slate-400 leading-normal font-medium">{imageSearchError}</p>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-5xl select-none">⚠️</span>
                                    <div className="space-y-1">
                                      <p className="text-[11px] text-rose-400 font-extrabold uppercase tracking-widest">No Visual Found</p>
                                      {isFullscreen && !pickerImages.length ? (
                                        <p className="text-[10px] text-slate-400 leading-normal font-medium">Searching for images...</p>
                                      ) : (
                                        <p className="text-[10px] text-slate-400 leading-normal font-medium">{imageSearchError} No matching emoji fallback available.</p>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })()
                        ) : (
                          <p className="text-xs text-slate-500 italic">Ready to search</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-extrabold text-white">"{selectionText}"</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-normal">
                          {searchImage
                            ? searchImageEngine === 'user-selected'
                              ? 'User selected from picker'
                              : searchImageEngine === 'placeholder'
                                ? 'Generated fallback image'
                                : searchImageEngine === 'unsplash-featured'
                                  ? 'Unsplash featured fallback image'
                                  : 'Dynamically fetched from Unsplash or Wikipedia'
                            : pickerImages.length > 0
                              ? 'Select an image from Unsplash'
                              : 'LingoLand Visual Search Engine'}
                        </p>

                        {/* Premium Split Search button inside Modal */}
                        {(searchImageEngine === 'placeholder' || imageSearchError || !searchImage) && (
                          <div className="pt-2.5 border-t border-slate-850 mt-2 space-y-1.5">
                            <Button 
                              onClick={() => {
                                setShowImageModal(false);
                                setShowSplitSearch(true);
                                setSplitQuery(selectionText);
                                handleSearchSplit(selectionText, activeSplitSource);
                              }}
                              className="w-full bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold h-9 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 text-xs"
                            >
                              <Search className="h-3.5 w-3.5 animate-pulse" />
                              Search External Web Library (Split Screen)
                            </Button>
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => {
                                  setShowImageModal(false);
                                  setShowSplitSearch(true);
                                  setActiveSplitSource('google');
                                  setSplitQuery(selectionText);
                                  handleSearchSplit(selectionText, 'google');
                                }}
                                variant="outline"
                                className="flex-1 h-8 text-[10px] font-bold border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 rounded-xl flex items-center justify-center gap-1"
                              >
                                <Globe className="h-3 w-3 text-blue-400" />
                                Google
                              </Button>
                              <Button 
                                onClick={() => {
                                  setShowImageModal(false);
                                  setShowSplitSearch(true);
                                  setActiveSplitSource('pinterest');
                                  setSplitQuery(selectionText);
                                  handleSearchSplit(selectionText, 'pinterest');
                                }}
                                variant="outline"
                                className="flex-1 h-8 text-[10px] font-bold border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 rounded-xl flex items-center justify-center gap-1"
                              >
                                <span className="text-[10px] text-red-500 font-extrabold">P</span>
                                Pinterest
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Presentation Text Lightbox/Viewer Modal */}
              {showTextModal && (
                <div 
                  className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 select-none"
                  onClick={() => setShowTextModal(false)}
                >
                  <div 
                    className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-[0_20px_50px_rgba(99,102,241,0.4)] animate-in zoom-in-95 duration-300 text-center flex flex-col justify-between backdrop-blur-md min-h-[350px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center pb-3 border-b border-slate-850 select-none">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🌐</span>
                        <div className="text-left">
                          <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest leading-none">
                            Presentation Text Viewer
                          </h4>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5 truncate max-w-[300px] select-all">
                            {selectedTextUrl}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowTextModal(false)}
                        className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Content View Area */}
                    <div className="flex-1 my-5 overflow-y-auto px-2 flex flex-col justify-center text-left">
                      <h2 
                        className="font-black text-slate-100 mb-3 border-l-4 border-purple-500 pl-3.5 leading-snug tracking-tight"
                        style={{ fontSize: `${textZoomScale * 1.3}rem` }}
                      >
                        {selectedTextTitle}
                      </h2>
                      <div 
                        className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl text-slate-200 leading-relaxed font-semibold select-text overflow-y-auto max-h-[250px]"
                        style={{ fontSize: `${textZoomScale}rem` }}
                      >
                        {selectedTextContent}
                      </div>
                    </div>

                    {/* Dynamic Font-Size Adjuster Panel */}
                    <div className="pt-4 border-t border-slate-850 flex flex-wrap items-center justify-between gap-4 select-none">
                      <div className="flex items-center gap-3 bg-slate-950 border border-slate-850 px-3.5 py-1.5 rounded-2xl text-[10px] font-black uppercase text-slate-400">
                        <span>Font Legibility:</span>
                        <button 
                          type="button"
                          onClick={() => setTextZoomScale(prev => Math.max(0.8, prev - 0.1))}
                          className="h-6 w-6 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg text-xs hover:text-white"
                          title="Decrease text size"
                        >
                          A-
                        </button>
                        <span className="text-[10px] font-mono text-purple-400">
                          {Math.round(textZoomScale * 100)}%
                        </span>
                        <button 
                          type="button"
                          onClick={() => setTextZoomScale(prev => Math.min(2.5, prev + 0.1))}
                          className="h-6 w-6 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg text-xs hover:text-white"
                          title="Increase text size"
                        >
                          A+
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedTextContent);
                            toast({ title: "Copied! 📋", description: "Snippet copied to clipboard." });
                          }}
                          className="h-10 text-xs font-bold border-slate-850 bg-slate-950 text-slate-300 hover:bg-slate-900 rounded-xl"
                        >
                          Copy Snippet
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            handleInsertTextToSlide(selectedTextContent);
                            setShowTextModal(false);
                          }}
                          className="h-10 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-md"
                        >
                          Insert to Slide
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Side: Split Screen Visual Search Sidebar */}
              {showSplitSearch && (
                <div 
                  className="w-80 md:w-96 h-full border-l border-slate-800 bg-slate-900/95 p-5 flex flex-col shrink-0 select-none z-40 text-left animate-in slide-in-from-right duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Search className="h-4.5 w-4.5 text-purple-400 animate-pulse" />
                      <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest">
                        Visual Search
                      </h3>
                    </div>
                    <button 
                      onClick={() => setShowSplitSearch(false)}
                      className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Close Split Search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Search Input Box */}
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input 
                      placeholder="Search web images..." 
                      value={splitQuery}
                      onChange={(e) => setSplitQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchSplit(splitQuery, activeSplitSource)}
                      className="h-10 pl-9 pr-9 text-xs bg-slate-950 border-slate-850 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    {splitQuery && (
                      <button 
                        onClick={() => {
                          setSplitQuery("");
                          setSplitImages([]);
                        }}
                        className="absolute right-3 top-3.5 text-slate-500 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Edge-like Filters Tab Bar */}
                  <div className="flex gap-2.5 border-b border-slate-850 mt-4 pb-2 overflow-x-auto text-[10px] font-black tracking-wider uppercase text-slate-400 select-none">
                    {['ALL', 'SEARCH', 'IMAGES', 'VIDEOS'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveSplitTab(tab)}
                        className={cn(
                          "pb-1 border-b-2 px-1 transition-all",
                          activeSplitTab === tab ? "border-purple-500 text-purple-400 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-300"
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Scrollable grid container */}
                  <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3">
                    {isLoadingSplit ? (
                      <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <div key={idx} className="relative aspect-[3/4] w-full rounded-xl bg-slate-950 border border-slate-850 animate-pulse flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-slate-800" />
                          </div>
                        ))}
                      </div>
                    ) : activeSplitTab === 'IMAGES' ? (
                      splitImages.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {splitImages.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSearchImage(img.url);
                                setSearchImageThumbnail(img.thumb || img.url);
                                setSearchImageEngine('user-selected');
                                setShowImageModal(true);
                              }}
                              className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-slate-850 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all group bg-slate-950"
                            >
                              <img 
                                src={img.thumb || img.url} 
                                alt={img.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center p-2 text-center">
                                <span className="text-[9px] text-white font-black opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">Select</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-6 space-y-2 h-full text-slate-500">
                          <span className="text-3xl">🔍</span>
                          <p className="text-xs font-bold text-slate-400">No images found</p>
                          <p className="text-[10px] leading-normal font-medium">Type a word in the box above to search external photo libraries.</p>
                        </div>
                      )
                    ) : activeSplitTab === 'SEARCH' ? (
                      splitWebResults.length > 0 ? (
                        <div className="space-y-3">
                          {splitWebResults.map((result, idx) => (
                            <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-850 hover:border-purple-500/50 hover:bg-slate-950 transition-all space-y-2 shadow-sm text-left">
                              <a 
                                href={result.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs font-black text-purple-450 hover:text-purple-350 hover:underline line-clamp-1 block"
                              >
                                {result.title}
                              </a>
                              <p className="text-[10px] text-slate-350 leading-relaxed font-medium line-clamp-3">
                                {result.snippet}
                              </p>
                              <div className="flex items-center justify-between pt-1 border-t border-slate-900/60">
                                <span className="text-[9px] text-slate-500 font-mono truncate max-w-[120px]">
                                  {result.url.replace('https://', '').replace('www.', '')}
                                </span>
                                <div className="flex gap-1.5 shrink-0">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedTextTitle(result.title);
                                        setSelectedTextContent(result.snippet);
                                        setSelectedTextUrl(result.url);
                                        setShowTextModal(true);
                                      }}
                                      className="h-6 px-2 text-[9px] font-bold border-slate-800 bg-slate-900 text-slate-300 hover:text-white rounded-lg flex items-center gap-0.5"
                                      title="View Clearly on Presentation"
                                    >
                                      🔍 View
                                    </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigator.clipboard.writeText(result.snippet).then(() => toast({ title: "Copied! 📋", description: "Snippet copied to clipboard." }))}
                                    className="h-6 px-2 text-[9px] font-bold border-slate-800 bg-slate-900 text-slate-300 hover:text-white rounded-lg"
                                  >
                                    Copy
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleInsertTextToSlide(result.snippet)}
                                    className="h-6 px-2 text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg"
                                  >
                                    Insert Snippet
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-6 space-y-2 h-full text-slate-500">
                          <span className="text-3xl">🌐</span>
                          <p className="text-xs font-bold text-slate-400">No search results found</p>
                        </div>
                      )
                    ) : activeSplitTab === 'VIDEOS' ? (
                      splitVideos.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                          {splitVideos.map((video, idx) => (
                            <div key={idx} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-2.5 shadow-sm text-left hover:border-slate-800 transition-all">
                              <div 
                                onClick={() => {
                                  setActiveVideoUrl(video.embedUrl || video.url);
                                  setActiveVideoTitle(video.title);
                                  setShowVideoLightbox(true);
                                }}
                                className="relative aspect-video w-full rounded-xl overflow-hidden cursor-pointer group border border-slate-850 bg-black flex items-center justify-center"
                              >
                                <img 
                                  src={video.thumb} 
                                  alt={video.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                                />
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                                  <div className="h-9 w-9 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <span className="text-[10px] pl-0.5">▶</span>
                                  </div>
                                </div>
                                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/85 text-[9px] text-white font-mono font-bold tracking-tight">
                                  {video.duration}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-[11px] font-black text-slate-200 line-clamp-1 leading-normal">
                                  {video.title}
                                </h4>
                                <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                                  <span>{video.channel}</span>
                                  <span>{video.views}</span>
                                </div>
                              </div>
                              <div className="flex gap-2 pt-1 border-t border-slate-900/60 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setActiveVideoUrl(video.embedUrl || video.url);
                                    setActiveVideoTitle(video.title);
                                    setShowVideoLightbox(true);
                                  }}
                                  className="h-6.5 text-[9px] font-bold border-slate-800 bg-slate-900 text-slate-350 hover:bg-slate-800 hover:text-white rounded-lg flex-1"
                                >
                                  Watch Preview
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleInsertTextToSlide(`Video Reference: [${video.title}](${video.url})`)}
                                  className="h-6.5 text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg flex-1"
                                >
                                  Insert Link
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-6 space-y-2 h-full text-slate-500">
                          <span className="text-3xl">🎥</span>
                          <p className="text-xs font-bold text-slate-400">No videos found</p>
                        </div>
                      )
                    ) : (
                      <div className="space-y-4 text-left">
                        {splitImages.length > 0 && (
                          <div className="space-y-1.5">
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-purple-400">Related Images</h4>
                            <div className="flex gap-2 overflow-x-auto pb-1.5 pr-1 select-none scrollbar-none snap-x">
                              {splitImages.slice(0, 4).map((img, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setSearchImage(img.url);
                                    setSearchImageThumbnail(img.thumb || img.url);
                                    setSearchImageEngine('user-selected');
                                    setShowImageModal(true);
                                  }}
                                  className="relative aspect-square w-24 rounded-lg overflow-hidden border border-slate-850 shrink-0 hover:border-purple-500 transition-all group snap-start bg-slate-950 animate-in fade-in duration-300"
                                >
                                  <img src={img.thumb || img.url} alt={img.title} className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {splitWebResults.length > 0 && (
                          <div className="space-y-2 animate-in fade-in duration-500">
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-purple-400">Web Summaries</h4>
                            <div className="space-y-2">
                              {splitWebResults.slice(0, 2).map((res, idx) => (
                                <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 space-y-1 text-left">
                                  <p className="text-[10px] font-black text-indigo-400 truncate">{res.title}</p>
                                  <p className="text-[9px] text-slate-400 line-clamp-2 leading-relaxed">{res.snippet}</p>
                                  <div className="flex justify-between items-center pt-1 border-t border-slate-900/40 mt-1 select-none">
                                    <button 
                                      onClick={() => {
                                        setSelectedTextTitle(res.title);
                                        setSelectedTextContent(res.snippet);
                                        setSelectedTextUrl(res.url);
                                        setShowTextModal(true);
                                      }}
                                      className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest"
                                    >
                                      🔍 View Clearly
                                    </button>
                                    <button 
                                      onClick={() => handleInsertTextToSlide(res.snippet)}
                                      className="text-[9px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest"
                                    >
                                      + Insert Snippet
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {splitVideos.length > 0 && (
                          <div className="space-y-2 animate-in fade-in duration-700">
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-purple-400">Video Tutorials</h4>
                            <div className="space-y-2">
                              {splitVideos.slice(0, 2).map((vid, idx) => (
                                <div key={idx} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850 flex gap-2 items-center text-left">
                                  <div 
                                    onClick={() => {
                                      setActiveVideoUrl(vid.embedUrl || vid.url);
                                      setActiveVideoTitle(vid.title);
                                      setShowVideoLightbox(true);
                                    }}
                                    className="relative h-12 w-20 rounded-lg overflow-hidden shrink-0 cursor-pointer border border-slate-850 bg-black flex items-center justify-center"
                                  >
                                    <img src={vid.thumb} className="w-full h-full object-cover opacity-80" />
                                    <span className="absolute bottom-0.5 right-0.5 bg-black/90 text-[8px] text-white px-0.5 rounded font-mono">{vid.duration}</span>
                                  </div>
                                  <div className="min-w-0 flex-1 space-y-0.5">
                                    <p className="text-[9px] font-bold text-slate-200 truncate leading-snug">{vid.title}</p>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{vid.channel}</p>
                                    <button 
                                      onClick={() => handleInsertTextToSlide(`Video Link: [${vid.title}](${vid.url})`)}
                                      className="text-[8px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest block"
                                    >
                                      + Insert Link
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Visual Search Engine Source Selector */}
                  <div className="pt-3 border-t border-slate-850 mt-4 space-y-2">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest text-center">
                      Choose Search Engine Source
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEngineChange('unsplash')}
                        className={cn(
                          "h-8 text-[10px] font-bold border-slate-800 flex items-center gap-1 py-1 px-2 transition-all rounded-xl",
                          activeSplitSource === 'unsplash' 
                            ? "bg-purple-950 border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                            : "bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white"
                        )}
                      >
                        <Search className="h-3 w-3 text-purple-400" />
                        Unsplash
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEngineChange('google')}
                        className={cn(
                          "h-8 text-[10px] font-bold border-slate-800 flex items-center gap-1 py-1 px-2 transition-all rounded-xl",
                          activeSplitSource === 'google' 
                            ? "bg-purple-950 border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                            : "bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white"
                        )}
                      >
                        <Globe className="h-3 w-3 text-blue-400" />
                        Google
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEngineChange('pinterest')}
                        className={cn(
                          "h-8 text-[10px] font-bold border-slate-800 flex items-center gap-1 py-1 px-2 transition-all rounded-xl",
                          activeSplitSource === 'pinterest' 
                            ? "bg-purple-950 border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                            : "bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white"
                        )}
                      >
                        <span className="text-[10px] text-red-500 font-extrabold">P</span>
                        Pinterest
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEngineChange('bing')}
                        className={cn(
                          "h-8 text-[10px] font-bold border-slate-800 flex items-center gap-1 py-1 px-2 transition-all rounded-xl",
                          activeSplitSource === 'bing' 
                            ? "bg-purple-950 border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                            : "bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white"
                        )}
                      >
                        <Search className="h-3 w-3 text-cyan-400" />
                        Bing
                      </Button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-3 border-t border-slate-850 mt-4 text-center">
                    <p className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest">
                      LingoLand Visual Search Engine
                    </p>
                  </div>
                </div>
              )}

              {showVideoLightbox && activeVideoUrl && (
                <div 
                  className="absolute inset-0 z-55 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-300"
                  onClick={() => {
                    setShowVideoLightbox(false);
                    setActiveVideoUrl(null);
                    setActiveVideoTitle(null);
                  }}
                >
                  <div 
                    className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-[0_25px_60px_rgba(99,102,241,0.25)] animate-in zoom-in-95 duration-300 text-center space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest truncate max-w-[80%]">
                        {activeVideoTitle || "Educational Video Preview"}
                      </h4>
                      <button 
                        onClick={() => {
                          setShowVideoLightbox(false);
                          setActiveVideoUrl(null);
                          setActiveVideoTitle(null);
                        }}
                        className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-850 shadow-inner">
                      {activeVideoUrl.includes('youtube.com/embed') ? (
                        <iframe 
                          src={`${activeVideoUrl}?autoplay=1`} 
                          title={activeVideoTitle || "Video Player"}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                          <Video className="h-10 w-10 text-slate-600 animate-pulse" />
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">External Video Link Available</p>
                          <a 
                            href={activeVideoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-purple-650 hover:bg-purple-500 text-white text-xs font-black uppercase rounded-xl transition-all shadow-md"
                          >
                            Open Video in New Tab
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 justify-end pt-2 border-t border-slate-850">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setShowVideoLightbox(false);
                          setActiveVideoUrl(null);
                          setActiveVideoTitle(null);
                        }}
                        className="h-9 px-4 text-xs font-bold border-slate-800 bg-slate-950 text-slate-350 hover:bg-slate-900 rounded-xl"
                      >
                        Close Preview
                      </Button>
                      <Button
                        onClick={() => {
                          if (activeVideoTitle && activeVideoUrl) {
                            handleInsertTextToSlide(`Video Reference: [${activeVideoTitle}](${activeVideoUrl.replace('embed/', 'watch?v=')})`);
                            setShowVideoLightbox(false);
                          }
                        }}
                        className="h-9 px-4 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-md"
                      >
                        Insert Video Reference Link
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={cn('py-2 text-center text-sm text-muted-foreground font-bold', isFullscreen && 'hidden')}>
              Slide {current} of {count}
            </div>
            {!isEditMode && (
              <div className={cn("mt-2 flex items-center justify-center gap-2 rounded-full bg-slate-950 border border-slate-850 px-4 py-2 text-sm text-muted-foreground", isFullscreen && "hidden")}>
                <MousePointerClick className="h-4 w-4 text-purple-400" />
                <p className="font-bold">Click inside slides or press Spacebar to dynamically reveal content text</p>
              </div>
            )}

            {/* Collapsible Slide Features Quick Tips Guide */}
            <div className={cn("mt-4 animate-in fade-in slide-in-from-bottom duration-500 select-none", isFullscreen && "hidden")}>
              <div 
                onClick={() => setShowTips(!showTips)}
                className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 rounded-2xl hover:bg-slate-900/60 transition-all cursor-pointer shadow-md"
              >
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">💡</span>
                  <span className="text-xs font-bold text-slate-200 tracking-wide">LingoLand Slide Features & Interactive Shortcuts Guide</span>
                </div>
                <span className="text-xs font-bold text-purple-400 hover:text-purple-300">
                  {showTips ? "Hide Quick Guide" : "Expand Quick Guide"}
                </span>
              </div>
              
              {showTips && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-5 bg-slate-900/60 border border-slate-800 rounded-3xl animate-in slide-in-from-top-3 duration-300 backdrop-blur-md">
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span>🔍</span> Dynamic Visual Search
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Highlight any word or short phrase (1–4 words) on a slide to show the floating search pill. Fetch images from **Unsplash**, **Google**, **Pinterest**, or **Bing** in real-time.
                    </p>
                    
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 pt-1">
                      <span>🫣</span> Classroom Cover & Reveal (Hide text)
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Highlight text on a slide and select **"Cover Text"** to wrap it in a blurred glass pill. Click the blurred text during your presentation to reveal it, and click it again to cover it!
                    </p>

                    <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 pt-1">
                      <span>⚙️</span> Slide Controls & Clear Covers
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Click the **"Clear Covers"** button in the slide controls toolbar (or absolute fullscreen menu) to instantly clear and reset all covered blocks on the active slide.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span>⏳</span> Dynamic Word-by-Word Reveal
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Click anywhere inside slides or press the **Spacebar / Arrow Right** to reveal slide bullet points one word at a time, keeping learners focused on your active explanation.
                    </p>

                    <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5 pt-1">
                      <span>📁</span> Folders & Library Manager
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Save generated outlines, edit titles or bullet points directly, and organize slides into folders in the real-time library manager on the left panel.
                    </p>

                    <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5 pt-1">
                      <span>📥</span> Offline PowerPoint HTML Exports
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Download highly optimized offline-ready HTML slides to open directly in web browsers or import/open as fully functional web slides inside Microsoft PowerPoint.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 4. Presentation Maker Generator Input Form */
          <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-md text-white rounded-3xl overflow-hidden shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <CardTitle className="font-black text-2xl tracking-tight">Presentation Maker Generator</CardTitle>
              <CardDescription className="text-gray-200">
                Enter a topic or upload your lesson plan/document, and our Genkit AI agent will construct a stunning slideshow.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-slate-200">
                          Topic or Presentation Theme (Optional if document uploaded)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., The History of the Internet, Benefits of Regular Exercise"
                            className="bg-slate-950 border-slate-855 text-white rounded-xl h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Document Uploader Field */}
                  <div className="space-y-3 p-5 rounded-2xl bg-slate-950/40 border border-slate-850">
                    <Label className="text-base font-semibold text-slate-200 block">
                      Optionally Upload Document or Lesson Plan
                    </Label>
                    <p className="text-xs text-slate-450">
                      Upload a PDF, DOCX, TXT, or MD file. The AI will extract the lesson plan/document content and build a beautiful, relevant PowerPoint presentation!
                    </p>
                    
                    <div className="flex flex-col gap-3">
                      <div className="relative border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 transition-all bg-slate-950 flex flex-col items-center justify-center text-center cursor-pointer group">
                        <Input
                          type="file"
                          accept=".pdf,.docx,.txt,.md"
                          onChange={handleFileUpload}
                          disabled={isParsing}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center gap-2 pointer-events-none select-none">
                          {isParsing ? (
                            <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
                          ) : uploadedFile ? (
                            <FileText className="h-10 w-10 text-emerald-400 group-hover:scale-110 transition-transform" />
                          ) : (
                            <FileUp className="h-10 w-10 text-slate-500 group-hover:text-purple-400 group-hover:scale-110 transition-transform" />
                          )}
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-200">
                              {uploadedFile ? uploadedFile.name : "Drag & Drop or Click to Upload"}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium">
                              PDF, DOCX, TXT, or MD (Max 10MB)
                            </p>
                          </div>
                        </div>
                      </div>

                      {uploadedFile && (
                        <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850 animate-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                            <span className="text-xs text-slate-300 font-bold truncate max-w-[200px]">{uploadedFile.name}</span>
                            {uploadedText && <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-mono px-1.5 py-0.5 rounded border border-emerald-500/20">Read ({Math.round(uploadedText.length / 1024)} KB)</span>}
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => {
                              setUploadedFile(null);
                              setUploadedText(null);
                            }}
                            className="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Settings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-950/40 border border-slate-850">
                    <FormField
                      control={form.control}
                      name="slideCount"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-base font-semibold text-slate-200">
                            Desired Number of Slides
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="3"
                              max="20"
                              className="w-full bg-slate-950 border-slate-850 text-white rounded-xl h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* New Presentation Options Section */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold text-slate-200 block">
                        Visual & 3D Options
                      </Label>
                      
                      <div className="space-y-3">
                        {/* Insert Photos Options */}
                        <div className="flex flex-col gap-2.5">
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id="insert-photos-checkbox" 
                              checked={insertPhotos} 
                              onChange={(e) => setInsertPhotos(e.target.checked)} 
                              className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-purple-650 focus:ring-purple-500/20"
                            />
                            <Label htmlFor="insert-photos-checkbox" className="text-xs font-bold text-slate-300 cursor-pointer">
                              Insert related photos on slides
                            </Label>
                          </div>

                          {insertPhotos && (
                            <div className="pl-6 animate-in slide-in-from-top-1 duration-200 flex items-center gap-2">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Source:</span>
                              <Select value={photoSource} onValueChange={(val: any) => setPhotoSource(val)}>
                                <SelectTrigger className="h-8 w-36 bg-slate-950 border-slate-850 text-slate-300 text-xs rounded-lg">
                                  <SelectValue placeholder="Photo Source" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-950 border-slate-800 text-slate-350 text-xs">
                                  <SelectItem value="google">Google Images</SelectItem>
                                  <SelectItem value="bing">Bing Images</SelectItem>
                                  <SelectItem value="pinterest">Pinterest</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        {/* Enable 3D Animations */}
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            id="enable-3d-checkbox" 
                            checked={enable3D} 
                            onChange={(e) => setEnable3D(e.target.checked)} 
                            className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-purple-650 focus:ring-purple-500/20"
                          />
                          <Label htmlFor="enable-3d-checkbox" className="text-xs font-bold text-slate-300 cursor-pointer">
                            Enable 3D Themes & Animations
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading || isParsing} className="h-11 px-6 font-extrabold rounded-xl bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Generate Presentation Outline
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
