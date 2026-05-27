
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, ImageDown, FileDown, FileText, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  generateLessonPlan,
} from '@/ai/flows/generate-lesson-plan';
import {
    GenerateLessonPlanInputSchema,
    type GenerateLessonPlanOutput,
} from '@/ai/flows/schemas/lesson-plan-schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import html2canvas from 'html2canvas';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type FormValues = z.infer<typeof GenerateLessonPlanInputSchema>;

export default function LessonPlannerPage() {
  const [lessonPlan, setLessonPlan] =
    React.useState<GenerateLessonPlanOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const printableAreaRef = React.useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const { user, isGuest, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="animate-spin h-12 w-12 text-purple-500" /></div>;
  }

  if (isGuest || !user) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[60vh] text-center p-8 overflow-hidden rounded-3xl bg-slate-900/40 border border-slate-850 backdrop-blur-lg shadow-2xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex p-6 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400 animate-bounce duration-[3s]">
            <FileText className="h-16 w-16" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-indigo-500 text-transparent">ACCESS RESTRICTED</h2>
            <p className="text-slate-400 text-sm leading-relaxed">Join LingoLand to craft high-quality daily lesson plans powered by state-of-the-art classroom artificial intelligence.</p>
          </div>
          <Button asChild size="lg" className="h-12 px-8 text-sm font-black uppercase tracking-wider rounded-2xl bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-550 hover:to-indigo-550 text-white shadow-lg shadow-indigo-650/20 active:scale-95 transition-all">
            <Link href="/auth">Sign In / Create Account</Link>
          </Button>
        </div>
      </div>
    );
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(GenerateLessonPlanInputSchema),
    defaultValues: {
      topic: '',
      studentType: 'ESL Student',
      teacher: '',
      grade: '',
      subject: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setLessonPlan(null);
    try {
      const result = await generateLessonPlan(values);
      setLessonPlan(result);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('ai_usage_increment'));
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.message || 'Failed to generate lesson plan. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExport = () => {
    if (printableAreaRef.current) {
        toast({
            title: "Exporting...",
            description: "Your lesson plan is being converted to an image.",
        });
        
        html2canvas(printableAreaRef.current, {
            scale: 2,
            backgroundColor: '#fdfbf7',
            useCORS: true,
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `${lessonPlan?.title.toLowerCase().replace(/\s+/g, '_') || 'lesson_plan'}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.95);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
  };

  const handleWordExport = () => {
    if (!lessonPlan) return;

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Lesson Plan</title></head><body>";
    const footer = "</body></html>";
    const printableContent = printableAreaRef.current?.innerHTML || '';
    
    const source = header + printableContent + footer;

    const file = new Blob([source], {
      type: 'application/msword'
    });

    const fileUrl = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `${lessonPlan.title.toLowerCase().replace(/\s+/g, '_') || 'lesson_plan'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl);
  };

  const handleTextChange = <T extends keyof GenerateLessonPlanOutput>(
    field: T,
    value: GenerateLessonPlanOutput[T]
  ) => {
    if (!lessonPlan) return;
    setLessonPlan({ ...lessonPlan, [field]: value });
  };

  return (
    <div className="relative space-y-8 overflow-hidden pb-12">
      {/* Ambient pulsating background light bubbles */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      <Card className="relative z-10 bg-slate-900/40 border border-slate-850 backdrop-blur-lg rounded-3xl shadow-[0_30px_80px_rgba(99,102,241,0.15)] overflow-hidden">
        <CardHeader className="bg-slate-950/45 border-b border-slate-800/80 backdrop-blur-md p-6">
          <CardTitle className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-indigo-500 flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-purple-400 animate-pulse" /> Daily Lesson Plan Generator
          </CardTitle>
          <CardDescription className="text-slate-400 font-medium mt-1">
            Create a custom lesson plan for your students with AI.
          </CardDescription>
          <CardDescription className="text-slate-500 text-xs mt-2 font-semibold tracking-wide uppercase">
            You can edit the generated daily lesson plan freely before exporting to JPG and printing it.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                 <FormField
                  control={form.control}
                  name="teacher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-indigo-400">Teacher's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mr. Smith" className="bg-slate-950/50 text-slate-100 border-slate-800 focus-visible:ring-1 focus-visible:ring-indigo-500/50 rounded-2xl h-11 placeholder:text-slate-600 font-medium" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-indigo-400">Grade</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 5th Grade" className="bg-slate-950/50 text-slate-100 border-slate-800 focus-visible:ring-1 focus-visible:ring-indigo-500/50 rounded-2xl h-11 placeholder:text-slate-600 font-medium" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-indigo-400">Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., English Language Arts" className="bg-slate-950/50 text-slate-100 border-slate-800 focus-visible:ring-1 focus-visible:ring-indigo-500/50 rounded-2xl h-11 placeholder:text-slate-600 font-medium" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-indigo-400">Date</FormLabel>
                      <FormControl>
                        <Input type="date" className="bg-slate-950/50 text-slate-100 border-slate-800 focus-visible:ring-1 focus-visible:ring-indigo-500/50 rounded-2xl h-11 font-medium" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-indigo-400">Lesson Topic</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Introduction to the Present Perfect Tense"
                          className="bg-slate-950/50 text-slate-100 border-slate-800 focus-visible:ring-1 focus-visible:ring-indigo-500/50 rounded-2xl h-11 placeholder:text-slate-600 font-medium"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="studentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-indigo-400">Student Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-950/50 text-slate-100 border-slate-800 focus-visible:ring-1 focus-visible:ring-indigo-500/50 rounded-2xl h-11 font-medium">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 rounded-2xl">
                          <SelectItem value="ESL Student">
                            ESL Student
                          </SelectItem>
                          <SelectItem value="Native English Student">
                            Native English Student
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-550 hover:to-indigo-550 text-white font-extrabold px-6 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-650/20 active:scale-95 transition-all w-full md:w-auto h-12 text-sm uppercase tracking-wider">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-purple-300" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4 text-purple-300" />
                  )}
                  Generate Lesson Plan
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-slate-900/40 border border-slate-850 p-12 text-center space-y-4 shadow-xl backdrop-blur-md animate-pulse">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-300">
            Building your customized lesson plan...
          </p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Synthesizing resources & formatting curriculum blocks</p>
        </div>
      )}

      {lessonPlan && (
        <div className="relative z-10 space-y-6">
            <Card className="bg-slate-900/50 border border-slate-850 backdrop-blur-lg rounded-3xl shadow-[0_30px_80px_rgba(99,102,241,0.15)] overflow-hidden mt-8">
            <CardHeader className="bg-slate-950/45 border-b border-slate-800/80 backdrop-blur-md p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 w-full min-w-0">
                    <span className="text-[9px] font-sans font-bold tracking-widest text-indigo-400 uppercase">Lesson Plan Title</span>
                    <Textarea
                        value={lessonPlan.title}
                        onChange={(e) => handleTextChange('title', e.target.value)}
                        className="text-xl md:text-2xl font-black text-white border-none shadow-none focus-visible:ring-0 p-0 m-0 h-auto resize-none bg-transparent placeholder:text-slate-500 mt-1 line-clamp-1"
                        rows={1}
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                      <Button onClick={handleExport} className="flex-1 sm:flex-initial bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-550 hover:to-indigo-550 text-white font-extrabold h-9 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-650/20 active:scale-95 transition-all text-xs uppercase tracking-wider px-4">
                          <ImageDown className="mr-1.5 h-4 w-4 text-purple-300" />
                          Export to JPG
                      </Button>
                      <Button onClick={handleWordExport} className="flex-1 sm:flex-initial bg-slate-950 border border-slate-800 text-slate-350 hover:bg-slate-900 hover:text-white rounded-xl h-9 flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all text-xs uppercase tracking-wider px-4">
                          <FileDown className="mr-1.5 h-4 w-4 text-indigo-400" />
                          Export to DOC
                      </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-slate-850 pt-6">
                    <EditableHeaderField label="Teacher" value={lessonPlan.teacher || ''} onChange={v => handleTextChange('teacher', v)} />
                    <EditableHeaderField label="Grade" value={lessonPlan.grade || ''} onChange={v => handleTextChange('grade', v)} />
                    <EditableHeaderField label="Subject" value={lessonPlan.subject || ''} onChange={v => handleTextChange('subject', v)} />
                    <EditableHeaderField label="Date" value={lessonPlan.date || ''} onChange={v => handleTextChange('date', v)} type="date" />
                </div>
            </CardHeader>
            <CardContent className="p-6 bg-transparent space-y-6">
                <div className="space-y-6">
                <EditableSection
                    title="Objective"
                    value={lessonPlan.objective}
                    onChange={(v) => handleTextChange('objective', v)}
                    icon={FileText}
                />
                <EditableSection
                    title="Materials"
                    value={lessonPlan.materials.join('\n')}
                    onChange={(v) => handleTextChange('materials', v.split('\n'))}
                    isList
                    icon={FileText}
                />
                <EditableSection
                    title="Warm-Up"
                    value={lessonPlan.warmUp.activity}
                    onChange={(v) => handleTextChange('warmUp', { ...lessonPlan.warmUp, activity: v })}
                    duration={lessonPlan.warmUp.duration}
                    onDurationChange={(d) => handleTextChange('warmUp', { ...lessonPlan.warmUp, duration: d })}
                    icon={Clock}
                />
                <div className="bg-slate-955/20 border border-slate-850 p-5 rounded-2xl space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-200 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-400"/> Main Activities
                    </h3>
                    <div className="space-y-4">
                      {lessonPlan.mainActivities.map((activity, index) => (
                          <EditableSection
                              key={index}
                              title={`Activity ${index + 1}`}
                              value={activity.activity}
                              onChange={(v) => {
                                  const newActivities = [...lessonPlan.mainActivities];
                                  newActivities[index] = { ...activity, activity: v };
                                  handleTextChange('mainActivities', newActivities);
                              }}
                              duration={activity.duration}
                              onDurationChange={(d) => {
                                  const newActivities = [...lessonPlan.mainActivities];
                                  newActivities[index] = { ...activity, duration: d };
                                  handleTextChange('mainActivities', newActivities);
                              }}
                              className="ml-0 sm:ml-4 border-l border-slate-800 pl-0 sm:pl-4 bg-transparent border-none p-0 space-y-2"
                              isSubSection
                          />
                      ))}
                    </div>
                </div>
                <EditableSection
                    title="Cool-Down"
                    value={lessonPlan.coolDown.activity}
                    onChange={(v) => handleTextChange('coolDown', { ...lessonPlan.coolDown, activity: v })}
                    duration={lessonPlan.coolDown.duration}
                    onDurationChange={(d) => handleTextChange('coolDown', { ...lessonPlan.coolDown, duration: d })}
                    icon={Clock}
                />
                <EditableSection
                    title="Assessment"
                    value={lessonPlan.assessment}
                    onChange={(v) => handleTextChange('assessment', v)}
                    icon={FileText}
                />
                <EditableSection
                    title="Homework"
                    value={lessonPlan.homework || ''}
                    onChange={(v) => handleTextChange('homework', v)}
                    isOptional
                    icon={FileText}
                />
                </div>
            </CardContent>
            </Card>
            
            {/* Hidden Printable Area */}
            <div className="absolute -z-10 -left-[9999px] top-0">
                <PrintableLessonPlan ref={printableAreaRef} lessonPlan={lessonPlan} />
            </div>
        </div>
      )}
    </div>
  );
}

const PrintableLessonPlan = React.forwardRef<HTMLDivElement, { lessonPlan: GenerateLessonPlanOutput }>(({ lessonPlan }, ref) => {
    return (
        <div ref={ref} className="relative p-10 bg-[#fdfbf7] text-[#1c1917] w-[800px] font-serif border-4 border-double border-[#d69e2e]/60 rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-2 border border-[#d69e2e]/20 rounded-2xl pointer-events-none" />
            <div className="relative z-10 space-y-6">
                <div className="text-center space-y-1.5 pb-4 border-b border-stone-200">
                    <span className="text-[9px] font-sans font-bold tracking-widest text-[#d69e2e] uppercase">LingoLand Academic Curriculum</span>
                    <h1 className="text-3xl font-black font-serif text-stone-905 capitalize leading-tight">{lessonPlan.title}</h1>
                </div>
                
                <div className="flex justify-between items-center text-xs font-sans border-b border-stone-200/80 pb-4 mt-6">
                    <div><strong className="block text-stone-500 font-bold uppercase tracking-wider text-[9px] mb-0.5">Teacher</strong> <span className="text-sm font-black text-stone-800">{lessonPlan.teacher || 'N/A'}</span></div>
                    <div><strong className="block text-stone-500 font-bold uppercase tracking-wider text-[9px] mb-0.5">Grade</strong> <span className="text-sm font-black text-stone-800">{lessonPlan.grade || 'N/A'}</span></div>
                    <div><strong className="block text-stone-500 font-bold uppercase tracking-wider text-[9px] mb-0.5">Subject</strong> <span className="text-sm font-black text-[#6366f1]">{lessonPlan.subject || 'N/A'}</span></div>
                    <div className="text-right"><strong className="block text-stone-500 font-bold uppercase tracking-wider text-[9px] mb-0.5">Date</strong> <span className="text-sm font-black text-stone-800">{lessonPlan.date || 'N/A'}</span></div>
                </div>
                
                <div className="space-y-4">
                    <PrintSection title="Objective" content={lessonPlan.objective} icon={FileText}/>
                    <div>
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <FileText className="text-primary"/> Materials
                        </h3>
                        <ul className="list-disc pl-5 space-y-1 font-sans text-stone-700 leading-relaxed text-sm" style={{ columnCount: 2, columnGap: '20px' }}>
                            {lessonPlan.materials.map((item, i) => item.trim() && <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <PrintSection title="Warm-Up" content={lessonPlan.warmUp.activity} duration={lessonPlan.warmUp.duration} icon={Clock}/>
                    <div>
                         <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Clock className="text-primary"/> Main Activities</h3>
                          {lessonPlan.mainActivities.map((act, i) => (
                              <PrintSection key={i} title={`Activity ${i+1}`} content={act.activity} duration={act.duration} className="ml-4 border-l border-stone-200 pl-4" />
                          ))}
                    </div>
                    <PrintSection title="Cool-Down" content={lessonPlan.coolDown.activity} duration={lessonPlan.coolDown.duration} icon={Clock}/>
                    <PrintSection title="Assessment" content={lessonPlan.assessment} icon={FileText}/>
                    <PrintSection title="Homework" content={lessonPlan.homework || 'None'} icon={FileText} isOptional={!lessonPlan.homework}/>
                </div>
                
                <div className="mt-12 pt-4 border-t border-stone-200 text-stone-400 text-center text-xs font-sans tracking-widest">
                    www.lingolandverse.com
                </div>
            </div>
        </div>
    );
});
PrintableLessonPlan.displayName = "PrintableLessonPlan";

function PrintSection({title, content, duration, icon: Icon, className, isOptional }: {title: string, content: string, duration?: number, icon: React.ElementType, className?: string, isOptional?: boolean}) {
    return (
        <div className={className}>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                {Icon && <Icon className="text-primary"/>} 
                {title}
                 {isOptional && <span className="text-sm font-normal text-gray-500">(Optional)</span>}
                 {duration !== undefined && (
                     <span className="text-sm font-normal text-gray-500 ml-auto">{duration} mins</span>
                 )}
            </h3>
            <p className="whitespace-pre-line text-stone-750 font-serif leading-relaxed text-[15px]">{content}</p>
        </div>
    )
}

function EditableHeaderField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string; }) {
    return (
        <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-3 hover:border-slate-800 transition-all">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{label}</label>
            <Input 
                type={type}
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                className="w-full border-0 border-b border-slate-800 focus:border-indigo-500/40 rounded-none px-0 focus-visible:ring-0 bg-transparent text-slate-100 font-bold h-8 text-sm mt-1"
            />
        </div>
    )
}

type EditableSectionProps = {
  title: string;
  value: string;
  onChange: (value: string) => void;
  isList?: boolean;
  isOptional?: boolean;
  isSubSection?: boolean;
  duration?: number;
  onDurationChange?: (duration: number) => void;
  icon?: React.ElementType;
  className?: string;
};

function EditableSection({ title, value, onChange, isList = false, isOptional = false, duration, onDurationChange, icon: Icon, isSubSection, className }: EditableSectionProps) {
    const TitleComponent = isSubSection ? 'h4' : 'h3';
    return (
        <div className={cn("bg-slate-950/20 border border-slate-850 p-5 rounded-2xl space-y-3 hover:border-slate-800 transition-all", className)}>
            <div className="flex items-center justify-between">
                <TitleComponent className="text-sm font-black uppercase tracking-widest text-slate-200 flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-purple-400" />}
                    {title}
                    {isOptional && <span className="text-[10px] font-bold text-slate-500 normal-case">(Optional)</span>}
                </TitleComponent>
                {duration !== undefined && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                        <Clock className="h-3.5 w-3.5 text-purple-400" />
                        <Input 
                            type="number" 
                            value={duration} 
                            onChange={(e) => onDurationChange?.(parseInt(e.target.value) || 0)}
                            className="w-14 h-7 text-center bg-slate-950 border border-slate-850 text-slate-200 rounded-lg p-0 focus-visible:ring-0 focus-visible:border-purple-500/50"
                         />
                        <span>mins</span>
                    </div>
                )}
            </div>
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-950/40 border border-slate-850 text-slate-200 placeholder:text-slate-500 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500/40 p-3.5 text-sm resize-none"
                rows={isList ? value.split('\n').length + 1 : 3}
            />
        </div>
    )
}

    