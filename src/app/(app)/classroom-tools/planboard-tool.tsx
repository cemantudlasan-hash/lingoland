'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Share2,
  FileText,
  Smartphone,
  Sparkles,
  BookOpen,
  Check,
  Download,
  AlertCircle,
  FileUp,
  Layout,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

type LessonTemplate = 'standard' | '5e' | 'inquiry' | 'custom';

type Lesson = {
  id: string;
  subject: string;
  className: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  slot: string; // e.g., "Period 1 (08:30 - 09:30)"
  title: string;
  template: LessonTemplate;
  objectives: string;
  procedure: string;
  materials: string[];
  shared: boolean;
};

const TEMPLATE_PRESETS: Record<LessonTemplate, { name: string; description: string; skeleton: string }> = {
  standard: {
    name: 'Standard Direct Instruction',
    description: 'Traditional lesson structure focused on structured learning and practice.',
    skeleton: `• Objectives & Goals:\n• Materials needed:\n• Introduction (Hook - 5 mins):\n• Direct Instruction (I do - 15 mins):\n• Guided Practice (We do - 15 mins):\n• Independent Practice (You do - 15 mins):\n• Assessment / Closure (5 mins):`,
  },
  '5e': {
    name: '5E Model (Inquiry-Based)',
    description: 'Ideal for science and discovery-based STEM lessons.',
    skeleton: `• ENGAGE (Arouse interest, access prior knowledge):\n• EXPLORE (Hands-on investigation/experiment):\n• EXPLAIN (Direct instruction & vocabulary connection):\n• ELABORATE (Apply concepts to new scenarios):\n• EVALUATE (Formative assessments & reflection):`,
  },
  inquiry: {
    name: 'Scientific Inquiry Lab',
    description: 'Perfect for structured experiments and hypothesis testing.',
    skeleton: `• Hypothesis / Question:\n• Variables (Independent, Dependent, Control):\n• Materials & Setup:\n• Lab Procedure:\n• Observation / Data Collection Table:\n• Analysis & Conclusion Questions:`,
  },
  custom: {
    name: 'Simple Template',
    description: 'A minimal layout for general announcements or quick sessions.',
    skeleton: `• Lesson Outline:\n• Learning Objectives:\n• Homework assignment:\n• Student Materials:`,
  },
};

const WEEKDAYS: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

const PERIOD_SLOTS = [
  'Period 1 (08:30 - 09:30)',
  'Period 2 (09:40 - 10:40)',
  'Period 3 (10:50 - 11:50)',
  'Period 4 (12:30 - 13:30)',
  'Period 5 (13:40 - 14:40)',
];

const INITIAL_LESSONS: Lesson[] = [
  {
    id: '1',
    subject: 'Math',
    className: 'Grade 5-A',
    day: 'Monday',
    slot: 'Period 1 (08:30 - 09:30)',
    title: 'Introduction to Fraction Multiplication',
    template: 'standard',
    objectives: 'Students will understand and represent the multiplication of fractions using area models.',
    procedure: `• Objectives & Goals: Understand multiplying fraction by fraction.\n• Materials needed: Grid paper, colored pencils.\n• Introduction (Hook - 5 mins): Display a cake sliced into quarters. How do we take half of a quarter?\n• Direct Instruction (I do - 15 mins): Model 1/2 x 1/4 using grid overlapping.\n• Guided Practice (We do - 15 mins): Work through page 56 problems together.\n• Independent Practice (You do - 15 mins): Complete Worksheet #4.\n• Assessment / Closure (5 mins): Ticket-out-the-door: calculate 2/3 x 3/4.`,
    materials: ['Fractions_Grid_Paper.pdf', 'Worksheet_4_Multiplication.pdf'],
    shared: true,
  },
  {
    id: '2',
    subject: 'Science',
    className: 'Grade 6-B',
    day: 'Wednesday',
    slot: 'Period 3 (10:50 - 11:50)',
    title: 'Condensation & Cloud Formation Lab',
    template: '5e',
    objectives: 'Students will simulate condensation inside a jar to model cloud formation.',
    procedure: `• ENGAGE: Show a cloud inside a bottle demo.\n• EXPLORE: Students create condensation jars using hot water and ice.\n• EXPLAIN: Match condensation to real-world cloud types.\n• ELABORATE: Connect cloud formation to humidity levels.\n• EVALUATE: Students draw and label their condensation jar.`,
    materials: ['Cloud_Formation_Lab_Instructions.pdf'],
    shared: false,
  },
  {
    id: '3',
    subject: 'English',
    className: 'Grade 5-A',
    day: 'Friday',
    slot: 'Period 2 (09:40 - 10:40)',
    title: 'Creative Writing: Narrative Hooks',
    template: 'standard',
    objectives: 'Students will write three different hooks (action, dialogue, description) for a narrative.',
    procedure: `• Objectives & Goals: Write engaging story introductions.\n• Materials needed: Notebooks, writing prompt cards.\n• Introduction (Hook - 5 mins): Read the opening lines of three famous children books.\n• Direct Instruction (I do - 15 mins): Define action, dialogue, and description hooks.\n• Guided Practice (We do - 15 mins): Brainstorm hooks for a story about a dragon on a bicycle.\n• Independent Practice (You do - 15 mins): Draft narrative hooks for their own chosen writing prompts.\n• Assessment / Closure (5 mins): Share one hook with a shoulder partner.`,
    materials: ['Narrative_Hooks_Examples.pdf', 'Story_Prompts_List.docx'],
    shared: true,
  },
];

export function PlanboardTool() {
  const db = useFirestore();
  const { user, isGuest, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const [lessons, setLessons] = React.useState<Lesson[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = React.useState(true);
  const [selectedDay, setSelectedDay] = React.useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [selectedSlot, setSelectedSlot] = React.useState<string>(PERIOD_SLOTS[0]);
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingLessonId, setEditingLessonId] = React.useState<string | null>(null);

  // Form State
  const [formSubject, setFormSubject] = React.useState('English');
  const [formClass, setFormClass] = React.useState('Grade 5-A');
  const [formTitle, setFormTitle] = React.useState('');
  const [formTemplate, setFormTemplate] = React.useState<LessonTemplate>('standard');
  const [formObjectives, setFormObjectives] = React.useState('');
  const [formProcedure, setFormProcedure] = React.useState(TEMPLATE_PRESETS.standard.skeleton);
  const [formMaterials, setFormMaterials] = React.useState<string[]>([]);
  const [newMaterialName, setNewMaterialName] = React.useState('');
  const [isMobileMode, setIsMobileMode] = React.useState(false);
  const [sharingCode, setSharingCode] = React.useState<string | null>(null);

  // Load lessons from Firestore
  React.useEffect(() => {
    if (!user || isGuest) {
      setIsLoadingPlans(false);
      return;
    }

    const loadLessons = async () => {
      setIsLoadingPlans(true);
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data && data.planboardLessons) {
            setLessons(data.planboardLessons);
          } else {
            // First time load: initialize with INITIAL_LESSONS and save to Firestore
            setLessons(INITIAL_LESSONS);
            await setDoc(userRef, { planboardLessons: INITIAL_LESSONS }, { merge: true });
          }
        } else {
          setLessons(INITIAL_LESSONS);
          await setDoc(userRef, { planboardLessons: INITIAL_LESSONS }, { merge: true });
        }
      } catch (e) {
        console.error('Error loading planboard lessons:', e);
        setLessons(INITIAL_LESSONS);
      } finally {
        setIsLoadingPlans(false);
      }
    };

    loadLessons();
  }, [user, isGuest, db]);

  // Save lessons to Firestore
  const saveLessons = async (newLessons: Lesson[]) => {
    setLessons(newLessons);
    if (!user || isGuest) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { planboardLessons: newLessons }, { merge: true });
    } catch (e) {
      console.error('Error saving planboard lessons:', e);
      toast({
        variant: 'destructive',
        title: 'Error saving plan',
        description: 'Your changes could not be saved to the database. Please try again.',
      });
    }
  };

  // Handle template change to populate procedure skeleton
  React.useEffect(() => {
    if (!editingLessonId) {
      setFormProcedure(TEMPLATE_PRESETS[formTemplate].skeleton);
    }
  }, [formTemplate, editingLessonId]);

  const handleOpenAdd = (day: typeof WEEKDAYS[number], slot: string) => {
    setSelectedDay(day);
    setSelectedSlot(slot);
    setFormTitle('');
    setFormSubject('English');
    setFormClass('Grade 5-A');
    setFormTemplate('standard');
    setFormObjectives('');
    setFormProcedure(TEMPLATE_PRESETS.standard.skeleton);
    setFormMaterials([]);
    setEditingLessonId(null);
    setIsAdding(true);
  };

  const handleOpenEdit = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setSelectedDay(lesson.day);
    setSelectedSlot(lesson.slot);
    setFormTitle(lesson.title);
    setFormSubject(lesson.subject);
    setFormClass(lesson.className);
    setFormTemplate(lesson.template);
    setFormObjectives(lesson.objectives);
    setFormProcedure(lesson.procedure);
    setFormMaterials(lesson.materials);
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) return;

    const lessonData: Lesson = {
      id: editingLessonId || Math.random().toString(),
      subject: formSubject,
      className: formClass,
      day: selectedDay,
      slot: selectedSlot,
      title: formTitle,
      template: formTemplate,
      objectives: formObjectives,
      procedure: formProcedure,
      materials: formMaterials,
      shared: editingLessonId ? (lessons.find((l) => l.id === editingLessonId)?.shared ?? false) : false,
    };

    let updated: Lesson[] = [];
    if (editingLessonId) {
      updated = lessons.map((l) => (l.id === editingLessonId ? lessonData : l));
    } else {
      updated = [...lessons, lessonData];
    }
    await saveLessons(updated);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    const updated = lessons.filter((l) => l.id !== id);
    await saveLessons(updated);
    setIsAdding(false);
  };

  const handleAddMaterial = () => {
    if (newMaterialName.trim() && !formMaterials.includes(newMaterialName.trim())) {
      setFormMaterials([...formMaterials, newMaterialName.trim()]);
      setNewMaterialName('');
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setFormMaterials(formMaterials.filter((_, idx) => idx !== index));
  };

  const handleToggleShare = async (id: string) => {
    const updated = lessons.map((l) => {
      if (l.id === id) {
        const newShared = !l.shared;
        if (newShared) {
          setSharingCode(`PLAN-${Math.floor(1000 + Math.random() * 9000)}`);
        } else {
          setSharingCode(null);
        }
        return { ...l, shared: newShared };
      }
      return l;
    });
    await saveLessons(updated);
  };

  // Find lesson by Day and Period Slot
  const getLessonAt = (day: string, slot: string) => {
    return lessons.find((l) => l.day === day && l.slot === slot);
  };

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin h-10 w-10 text-indigo-500 rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
      </div>
    );
  }

  if (!user || isGuest) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[50vh] text-center p-8 overflow-hidden rounded-3xl bg-slate-950/40 border border-slate-850/80 backdrop-blur-lg shadow-xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex p-5 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400">
            <Layout className="h-12 w-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-200">Planboard is Restricted</h2>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
              Planboard digital lesson planner is only available for registered teacher accounts. Please sign up or sign in to plan, schedule, and share lessons.
            </p>
          </div>
          <Button asChild size="sm" className="h-10 px-6 text-xs font-bold uppercase tracking-wider rounded-xl bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-550 hover:to-indigo-550 text-white shadow-lg active:scale-95 transition-all">
            <Link href="/auth">Sign In / Create Account</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoadingPlans) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin h-10 w-10 text-indigo-500 rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      {/* Planboard Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Planboard Lesson Timetable</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Intuitive calendar scheduler for teachers. Create lesson templates, schedule timelines, and sync material details.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant={isMobileMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsMobileMode(!isMobileMode)}
            className="border-slate-800 text-xs gap-1.5 h-9"
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile App View</span>
          </Button>
          <Button
            onClick={() => handleOpenAdd('Monday', PERIOD_SLOTS[0])}
            size="sm"
            className="bg-indigo-650 hover:bg-indigo-600 text-xs font-bold gap-1.5 h-9"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan</span>
          </Button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Timetable / Mobile App Grid */}
        <div className={cn('lg:col-span-3 space-y-4', isMobileMode && 'flex justify-center')}>
          {isMobileMode ? (
            /* Mobile Device Mockup Frame */
            <div className="relative w-[340px] h-[640px] rounded-[3rem] border-8 border-slate-800 bg-slate-950 shadow-2xl overflow-hidden flex flex-col">
              {/* Speaker / Camera Notch */}
              <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 flex justify-center items-center z-50">
                <div className="w-20 h-3.5 bg-slate-950 rounded-b-xl" />
              </div>

              {/* Mobile App Header */}
              <div className="pt-8 pb-4 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-indigo-500/20 rounded-lg">
                    <Layout className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-sm font-black tracking-tight text-white">Planboard Mobile</span>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase font-bold">
                  Free App
                </Badge>
              </div>

              {/* Mobile Body Content */}
              <div className="flex-grow overflow-y-auto p-3 space-y-4">
                {/* Horizontal Date Picker */}
                <div className="flex justify-between gap-1 overflow-x-auto pb-1">
                  {WEEKDAYS.map((day) => {
                    const isSelected = selectedDay === day;
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={cn(
                          'flex-1 py-1.5 rounded-xl text-center flex flex-col items-center gap-0.5 transition-all border',
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-900 border-slate-880 text-slate-400'
                        )}
                      >
                        <span className="text-[9px] font-bold uppercase">{day.substring(0, 3)}</span>
                        <span className="text-xs font-black">{day === 'Monday' ? '18' : day === 'Tuesday' ? '19' : day === 'Wednesday' ? '20' : day === 'Thursday' ? '21' : '22'}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-indigo-400">Timetable Slots</span>
                    <span className="text-[10px] text-slate-500">{selectedDay}</span>
                  </div>

                  {PERIOD_SLOTS.map((slot) => {
                    const lesson = getLessonAt(selectedDay, slot);
                    return (
                      <div
                        key={slot}
                        className={cn(
                          'p-3 rounded-2xl border transition-all flex flex-col gap-2',
                          lesson
                            ? 'bg-slate-900/90 border-slate-800 shadow-md'
                            : 'bg-slate-950/20 border-dashed border-slate-900 hover:border-slate-800'
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] text-slate-500 font-bold uppercase flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {slot.split(' ')[0]}
                          </span>
                          {lesson && (
                            <Badge className="bg-indigo-500/10 text-indigo-300 border-none font-extrabold text-[8px] uppercase">
                              {lesson.subject}
                            </Badge>
                          )}
                        </div>

                        {lesson ? (
                          <div className="space-y-1.5">
                            <h4 className="text-xs font-black text-white leading-tight">{lesson.title}</h4>
                            <p className="text-[10px] text-slate-400 font-bold">{lesson.className}</p>
                            <div className="flex gap-2 pt-1 border-t border-slate-850/60 mt-1">
                              <button
                                onClick={() => handleOpenEdit(lesson)}
                                className="text-[9px] text-indigo-400 font-extrabold hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleToggleShare(lesson.id)}
                                className="text-[9px] text-emerald-400 font-extrabold hover:underline flex items-center gap-0.5"
                              >
                                {lesson.shared ? <Check className="w-2.5 h-2.5" /> : null}
                                {lesson.shared ? 'Shared' : 'Share'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenAdd(selectedDay, slot)}
                            className="w-full py-1.5 rounded-xl border border-dashed border-slate-800 hover:bg-slate-900/30 transition-all text-center flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-400"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Lesson
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Home Bar */}
              <div className="h-4 bg-slate-900 flex justify-center items-center">
                <div className="w-24 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>
          ) : (
            /* Desktop Timetable View */
            <div className="w-full bg-slate-950/40 border border-slate-850 rounded-[2rem] overflow-hidden shadow-xl">
              {/* Timetable Header */}
              <div className="grid grid-cols-6 border-b border-slate-850 bg-slate-900/60">
                <div className="p-4 text-xs font-black uppercase text-indigo-400 border-r border-slate-850 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Timetable
                </div>
                {WEEKDAYS.map((day) => (
                  <div key={day} className="p-4 text-center text-xs font-black uppercase tracking-wider text-slate-300">
                    {day}
                  </div>
                ))}
              </div>

              {/* Timetable Rows */}
              <div className="divide-y divide-slate-850">
                {PERIOD_SLOTS.map((slot) => (
                  <div key={slot} className="grid grid-cols-6 items-stretch min-h-[96px]">
                    {/* Period Label Column */}
                    <div className="p-3.5 border-r border-slate-850 flex flex-col justify-center bg-slate-900/20">
                      <span className="text-[10px] font-black uppercase text-slate-400 leading-tight">
                        {slot.split(' ')[0] + ' ' + slot.split(' ')[1]}
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold mt-1">
                        {slot.substring(slot.indexOf('(') + 1, slot.indexOf(')'))}
                      </span>
                    </div>

                    {/* Weekday Columns */}
                    {WEEKDAYS.map((day) => {
                      const lesson = getLessonAt(day, slot);
                      return (
                        <div
                          key={day}
                          className={cn(
                            'p-2.5 border-r last:border-r-0 border-slate-850 transition-all relative group flex flex-col justify-between',
                            lesson
                              ? 'bg-indigo-650/[0.03] hover:bg-indigo-650/[0.06]'
                              : 'bg-transparent hover:bg-slate-900/20'
                          )}
                        >
                          {lesson ? (
                            <div className="space-y-1.5 flex-grow flex flex-col justify-between">
                              <div className="space-y-1">
                                <div className="flex justify-between items-start gap-1">
                                  <Badge className="bg-indigo-500/10 text-indigo-300 border-none font-extrabold text-[8px] px-1.5 py-0.5 uppercase tracking-wide">
                                    {lesson.subject}
                                  </Badge>
                                  {lesson.shared && (
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-extrabold text-[8px] px-1.5 py-0.5 uppercase flex items-center gap-0.5">
                                      <Check className="w-2.5 h-2.5" /> Shared
                                    </Badge>
                                  )}
                                </div>
                                <h4 className="text-[11px] font-black text-slate-100 leading-snug group-hover:text-indigo-400 transition-colors">
                                  {lesson.title}
                                </h4>
                              </div>

                              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-850/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEdit(lesson)}
                                  className="text-[9px] font-extrabold text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                  Open
                                </button>
                                <span className="text-[8px] text-slate-500 font-extrabold">{lesson.className}</span>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenAdd(day, slot)}
                              className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs text-indigo-400 transition-all rounded-lg m-1 border border-dashed border-indigo-500/30 gap-1.5"
                            >
                              <Plus className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-wider">Plan Lesson</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lesson Editor / Details Pane */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {isAdding ? (
              /* Add/Edit Form Panel */
              <motion.div
                key="editor"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="border-indigo-500/30 bg-slate-900/60 backdrop-blur-md">
                  <CardHeader className="pb-3 border-b border-slate-855">
                    <CardTitle className="text-sm font-black uppercase text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span>{editingLessonId ? 'Modify Lesson Plan' : 'Plan Lesson'}</span>
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold">
                      {selectedDay} &bull; {selectedSlot.split(' ')[0]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {/* Subject & Class */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Subject</label>
                        <select
                          value={formSubject}
                          onChange={(e) => setFormSubject(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-bold text-slate-100"
                        >
                          <option>English</option>
                          <option>Math</option>
                          <option>Science</option>
                          <option>Social Studies</option>
                          <option>Art</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Classroom</label>
                        <select
                          value={formClass}
                          onChange={(e) => setFormClass(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-bold text-slate-100"
                        >
                          <option>Grade 5-A</option>
                          <option>Grade 6-B</option>
                          <option>Grade 7-C</option>
                          <option>Primary 4</option>
                        </select>
                      </div>
                    </div>

                    {/* Lesson Title */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Lesson Title</label>
                      <Input
                        placeholder="e.g., Photosynthesis Experiment"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="bg-slate-950 border-slate-850 rounded-xl text-xs font-bold"
                      />
                    </div>

                    {/* Template Picker */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Lesson Template</label>
                      <select
                        value={formTemplate}
                        onChange={(e) => setFormTemplate(e.target.value as LessonTemplate)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-bold text-slate-100"
                      >
                        <option value="standard">Standard Direct Instruction</option>
                        <option value="5e">5E Inquiry Model</option>
                        <option value="inquiry">Scientific Inquiry Lab</option>
                        <option value="custom">Minimal Outline</option>
                      </select>
                    </div>

                    {/* Objectives */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Objectives</label>
                      <Textarea
                        placeholder="What will students learn or achieve?"
                        value={formObjectives}
                        onChange={(e) => setFormObjectives(e.target.value)}
                        className="bg-slate-950 border-slate-850 rounded-xl text-xs font-bold h-16 min-h-[64px]"
                      />
                    </div>

                    {/* Lesson Procedure Outline */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Procedure & Timelines</label>
                        <Badge variant="outline" className="text-[8px] uppercase tracking-wide border-indigo-500/20 text-indigo-400 bg-indigo-500/5">
                          Autosaved
                        </Badge>
                      </div>
                      <Textarea
                        placeholder="Steps of your lesson..."
                        value={formProcedure}
                        onChange={(e) => setFormProcedure(e.target.value)}
                        className="bg-slate-950 border-slate-850 rounded-xl text-xs font-bold h-44 min-h-[120px] font-mono leading-relaxed"
                      />
                    </div>

                    {/* Material Upload Simulator */}
                    <div className="space-y-2 pt-2 border-t border-slate-850/60">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <FileUp className="w-3.5 h-3.5 text-indigo-400" /> Material Attachments
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., lab_sheet.pdf"
                          value={newMaterialName}
                          onChange={(e) => setNewMaterialName(e.target.value)}
                          className="bg-slate-950 border-slate-850 rounded-xl text-xs font-bold flex-grow h-8"
                        />
                        <Button
                          type="button"
                          onClick={handleAddMaterial}
                          className="bg-slate-850 hover:bg-slate-800 text-[10px] font-bold h-8 px-2.5 rounded-xl border border-slate-800"
                        >
                          Attach
                        </Button>
                      </div>

                      {/* Materials List */}
                      {formMaterials.length > 0 && (
                        <div className="space-y-1.5 max-h-24 overflow-y-auto pt-1">
                          {formMaterials.map((material, idx) => (
                            <div
                              key={material}
                              className="flex items-center justify-between bg-slate-950/80 border border-slate-850 p-1.5 rounded-lg"
                            >
                              <span className="text-[10px] font-bold text-slate-300 truncate max-w-[180px] flex items-center gap-1">
                                <FileText className="w-3 h-3 text-indigo-400 shrink-0" /> {material}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveMaterial(idx)}
                                className="text-[9px] text-rose-500 font-extrabold hover:underline px-1"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleSave}
                        className="flex-grow bg-indigo-650 hover:bg-indigo-600 text-xs font-bold rounded-xl h-10"
                      >
                        Save Plan
                      </Button>
                      {editingLessonId && (
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(editingLessonId)}
                          className="text-xs font-bold rounded-xl h-10 px-3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => setIsAdding(false)}
                        className="border-slate-800 text-xs font-bold rounded-xl h-10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              /* Informational Sidebar when idle */
              <motion.div
                key="info"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                {/* Sharing Status Widget */}
                {sharingCode && (
                  <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1">
                        <Share2 className="w-4 h-4" /> Share Complete
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                      <p className="text-slate-300 leading-relaxed font-medium">
                        Lesson plan has been published to student workspace. Students can access class materials directly.
                      </p>
                      <div className="bg-slate-950/80 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between">
                        <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider text-xs">{sharingCode}</span>
                        <span className="text-[9px] text-slate-500 font-extrabold uppercase flex items-center gap-0.5">
                          Active Link <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Main Instruction Card */}
                <Card className="border-slate-850 bg-slate-900/60 backdrop-blur-md">
                  <CardHeader className="pb-3 border-b border-slate-850/60">
                    <CardTitle className="text-sm font-black uppercase text-indigo-400 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" /> Lesson Planner Info
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold">
                      Prepare, Schedule & Share Lesson Timetables
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="space-y-3.5">
                      <div className="flex gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center">
                          <Layout className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">Lesson Templates</h4>
                          <p className="text-[10px] text-slate-400 font-bold leading-relaxed mt-0.5">
                            Prepare classes quickly using templates (Standard, 5E Inquiry, Lab Experiments) to scaffold objectives and timelines.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">Timetable Schedule</h4>
                          <p className="text-[10px] text-slate-400 font-bold leading-relaxed mt-0.5">
                            Plan periods in your timetable. Click any empty slot on the grid to create or edit classes.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center">
                          <Share2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">Share Materials</h4>
                          <p className="text-[10px] text-slate-400 font-bold leading-relaxed mt-0.5">
                            Upload lesson files, worksheets, or guidelines, and publish them to students with one click.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-850 flex items-start gap-2.5 mt-2">
                      <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-slate-500 font-bold leading-relaxed">
                        To add a lesson plan, click on any slot on the calendar grid, or select "Create New Plan" in the upper right. Use "Mobile App View" to preview the smartphone layout!
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Pre-populated list of current plans */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Upcoming Planned Lessons</span>
                  <div className="space-y-2">
                    {lessons.slice(0, 3).map((lesson) => (
                      <div
                        key={lesson.id}
                        onClick={() => handleOpenEdit(lesson)}
                        className="bg-slate-900/60 border border-slate-850 p-3 rounded-xl hover:border-slate-700 hover:bg-slate-850/60 transition-all cursor-pointer flex justify-between items-center gap-4"
                      >
                        <div className="space-y-1 truncate">
                          <span className="text-[8px] bg-slate-950/60 text-slate-400 font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                            {lesson.subject}
                          </span>
                          <h4 className="text-[11px] font-black text-slate-200 truncate mt-0.5">{lesson.title}</h4>
                          <p className="text-[9px] text-slate-500 font-bold">
                            {lesson.day} &bull; {lesson.slot.split(' ')[0]}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleShare(lesson.id);
                          }}
                          className={cn(
                            'p-1.5 rounded-lg border transition-all shrink-0',
                            lesson.shared
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white'
                          )}
                          title={lesson.shared ? 'Shared with Students' : 'Share with Students'}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
