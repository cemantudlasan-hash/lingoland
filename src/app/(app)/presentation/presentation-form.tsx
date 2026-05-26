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
  Plus
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

const formSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
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
    { name: 'Small text', className: 'text-base', titleClassName: 'text-2xl', fullScreenClassName: 'text-[2.2vw] leading-relaxed', fullScreenTitleClassName: 'text-[3.5vw] leading-tight' },
    { name: 'Medium text', className: 'text-lg', titleClassName: 'text-3xl', fullScreenClassName: 'text-[2.8vw] leading-relaxed', fullScreenTitleClassName: 'text-[4.5vw] leading-tight' },
    { name: 'Large text', className: 'text-xl', titleClassName: 'text-4xl', fullScreenClassName: 'text-[3.3vw] leading-relaxed', fullScreenTitleClassName: 'text-[5.5vw] leading-tight' },
    { name: 'Extra Large', className: 'text-2xl', titleClassName: 'text-5xl', fullScreenClassName: 'text-[3.8vw] leading-relaxed', fullScreenTitleClassName: 'text-[6.5vw] leading-tight' },
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
  const [searchImageEngine, setSearchImageEngine] = React.useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = React.useState(false);
  const [showImageModal, setShowImageModal] = React.useState(false);
  const [imageSearchError, setImageSearchError] = React.useState<string | null>(null);
  // Image picker states (fullscreen mode)
  const [pickerImages, setPickerImages] = React.useState<Array<{ url: string; thumb?: string; engine: string; title: string }>>([]);
  const [selectedPickerImage, setSelectedPickerImage] = React.useState<string | null>(null);
  const [isLoadingPicker, setIsLoadingPicker] = React.useState(false);

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

    setIsEditMode(false);
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
      const slidesData = isEditMode ? editableSlides : presentation.slides;
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

  const handleShowImage = async (text: string) => {
    setIsLoadingImage(true);
    setSearchImage(null);
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
        setSearchImageEngine(data.engine || null);
      } else {
        setImageSearchError(`Could not find a photo matching "${text}" in the libraries.`);
        // In fullscreen mode, if no single image found and no emoji fallback, load picker
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
      // Still try picker in fullscreen if connection failed
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

  const handlePickerImageSelect = (imageUrl: string) => {
    setSearchImage(imageUrl);
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
      if (presentation) {
        setupWordAnimation(presentation.slides);
      }
    };
    
    const onReInit = () => {
        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);
        if (presentation) {
            setupWordAnimation(presentation.slides);
        }
    };
    
    onReInit();

    api.on("select", onSelect);
    api.on("reInit", onReInit);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onReInit);
    };
  }, [api, presentation, setupWordAnimation]);

  // AI Submit Form Outlines
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setPresentation(null);
    setActiveDbId(null);
    setIsEditMode(false);
    try {
      const result = await generatePresentation(values);
      setPresentation(result);
      setEditableTitle(result.title);
      setEditableSlides(JSON.parse(JSON.stringify(result.slides)));

      if (typeof window !== 'undefined') window.dispatchEvent(new Event('ai_usage_increment'));
      setupWordAnimation(result.slides);
    } catch (e) {
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
        (slide) => `
        <div style="page-break-after: always; padding: 40px; border: 1px solid #ccc; margin-bottom: 20px; position: relative;">
            <h2 style="font-size: 24px; font-family: Arial, sans-serif;">${slide.title}</h2>
            <ul style="font-size: 18px; font-family: Arial, sans-serif; line-height: 1.6; margin-bottom: 40px;">
                ${slide.content.map((point) => `<li>${point}</li>`).join('')}
            </ul>
            <div style="position: absolute; bottom: 15px; left: 0; right: 0; text-align: center; font-size: 11px; color: #a0aec0; font-family: Arial, sans-serif; border-top: 1px solid #eee; padding-top: 5px; margin: 0 40px;">
                www.lingolandverse.com
            </div>
        </div>
    `
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
    form.reset();
  };

  // Slide content render helper
  const renderAnimatedContent = (content: string[], visibleCount: number) => {
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
          return <li key={pointIndex}>{visibleWords.join(' ')}</li>;
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
                    className="h-9 px-4 text-xs font-extrabold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg"
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
                  'relative h-[480px] w-full mt-4 select-text', 
                  isFullscreen && 'fixed inset-0 z-50 w-screen h-screen !m-0 rounded-none'
              )}
              onClick={(isFullscreen || isEditMode) ? undefined : handleRevealNextWord}
            >
              {isFullscreen && (
                <>
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
                          "w-full h-full flex transition-all duration-500",
                          theme, fontFamily
                        )}
                        onClick={(isFullscreen || isEditMode) ? undefined : handleRevealNextWord}
                      >
                        <div className={cn(
                          "w-full overflow-y-auto",
                          !isFullscreen && "flex flex-col justify-center p-8 md:p-12",
                          isFullscreen && "py-24 px-8 md:px-16 lg:px-24"
                        )}>
                          <div className={cn("max-w-4xl w-full mx-auto animate-in fade-in duration-700", align === 'center' ? 'text-center' : 'text-left')}>
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
                              <ul className={cn("pl-8 mx-auto transition-all duration-300",
                                align === 'center' ? 'list-none pl-0' : 'list-disc pl-8',
                                !isFullscreen ? `space-y-4 ${fontSize.className}` : `space-y-4 md:space-y-6 lg:space-y-8 ${fontSize.fullScreenClassName}`
                              )}>
                                {renderAnimatedContent(slide.content, visibleWordCounts[index] || 0)}
                              </ul>
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
                    "absolute z-30 transition-all duration-200 select-none animate-in fade-in zoom-in-95",
                    "fixed bottom-24 left-1/2 -translate-x-1/2 md:absolute md:bottom-auto md:left-auto"
                  )}
                  style={typeof window !== 'undefined' && window.innerWidth >= 768 && selectionCoords ? {
                    left: `${selectionCoords.x}px`,
                    top: `${selectionCoords.y}px`,
                    transform: 'translateX(-50%)',
                  } : undefined}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowImage(selectionText);
                    }}
                    className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full shadow-[0_4px_20px_rgba(99,102,241,0.4)] border border-purple-400/30 flex items-center gap-1.5 backdrop-blur-md transition-all active:scale-95"
                  >
                    <Search className="h-3 w-3 animate-pulse" /> Show Image for "{selectionText}"
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
                      isFullscreen && pickerImages.length > 0 ? "w-full max-w-3xl max-h-[80vh]" : "w-full max-w-sm"
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
                      isFullscreen && pickerImages.length > 0 ? "min-h-[400px] w-full" : "aspect-square w-full"
                    )}>
                      {isLoadingImage || isLoadingPicker ? (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">Searching Libraries...</p>
                        </div>
                      ) : searchImage ? (
                        <img 
                          src={searchImage} 
                          alt={selectionText} 
                          className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
                          onError={() => {
                            setSearchImage(null);
                            setImageSearchError(`The image for "${selectionText}" failed to load from the remote library.`);
                          }}
                        />
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
                                        onClick={() => handlePickerImageSelect(img.url)}
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
                                    ))}\n                                  </div>
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
          </div>
        ) : (
          /* 4. Presentation Maker Generator Input Form */
          <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-md text-white rounded-3xl overflow-hidden shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <CardTitle className="font-black text-2xl tracking-tight">Presentation Maker Generator</CardTitle>
              <CardDescription className="text-gray-200">
                Enter a topic, and our Genkit AI agent will construct a stunning slide outline. Outlines can be styled and sorted in folders inside your library.
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
                          Topic or Presentation Theme
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., The History of the Internet, Benefits of Regular Exercise"
                            className="bg-slate-950 border-slate-850 text-white rounded-xl h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slideCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-slate-200">
                          Desired Number of Slides
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="3"
                            max="20"
                            className="w-[180px] bg-slate-950 border-slate-850 text-white rounded-xl h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="h-11 px-6 font-extrabold rounded-xl bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg">
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
