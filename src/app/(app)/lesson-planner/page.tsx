
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

type FormValues = z.infer<typeof GenerateLessonPlanInputSchema>;

export default function LessonPlannerPage() {
  const [lessonPlan, setLessonPlan] =
    React.useState<GenerateLessonPlanOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const printableAreaRef = React.useRef<HTMLDivElement>(null);

  const { toast } = useToast();

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
            backgroundColor: '#ffffff',
            useCORS: true,
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `${lessonPlan?.title.replace(/\s/g, '_') || 'lesson_plan'}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.95);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
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
    link.download = `${lessonPlan.title.replace(/\s/g, '_') || 'lesson_plan'}.doc`;
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
    <div className="space-y-8">
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-500 to-teal-500 text-white">
          <CardTitle>Daily Lesson Plan Generator</CardTitle>
          <CardDescription className="text-blue-100">
            Create a custom lesson plan for your students with AI.
          </CardDescription>
          <CardDescription className="text-blue-100 pt-2">
            You can edit the generated daily lesson plan freely before exporting to JPG and printing it.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                 <FormField
                  control={form.control}
                  name="teacher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teacher's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mr. Smith" {...field} />
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
                      <FormLabel>Grade</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 5th Grade" {...field} />
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
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., English Language Arts" {...field} />
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
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                      <FormLabel className="font-semibold">Lesson Topic</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Introduction to the Present Perfect Tense"
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
                      <FormLabel className="font-semibold">Student Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate Lesson Plan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center rounded-lg border p-12 print-hidden">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">
            Building your lesson plan...
          </p>
        </div>
      )}

      {lessonPlan && (
        <>
            <Card className="bg-white text-black">
            <CardHeader>
                <div className="flex items-center justify-between">
                <Textarea
                    value={lessonPlan.title}
                    onChange={(e) => handleTextChange('title', e.target.value)}
                    className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 p-0 m-0 h-auto resize-none bg-transparent"
                />
                <div className="flex items-center gap-2">
                    <Button onClick={handleExport} variant="outline" size="sm" className="bg-gray-800 text-white hover:bg-gray-700">
                        <ImageDown className="mr-2 h-4 w-4 text-white" />
                        Export to JPG
                    </Button>
                    <Button onClick={handleWordExport} variant="outline" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                        <FileDown className="mr-2 h-4 w-4 text-white" />
                        Export to DOC
                    </Button>
                </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 border-t pt-4 text-sm">
                    <EditableHeaderField label="Teacher" value={lessonPlan.teacher || ''} onChange={v => handleTextChange('teacher', v)} />
                    <EditableHeaderField label="Grade" value={lessonPlan.grade || ''} onChange={v => handleTextChange('grade', v)} />
                    <EditableHeaderField label="Subject" value={lessonPlan.subject || ''} onChange={v => handleTextChange('subject', v)} />
                    <EditableHeaderField label="Date" value={lessonPlan.date || ''} onChange={v => handleTextChange('date', v)} type="date" />
                </div>
            </CardHeader>
            <CardContent className="p-6 bg-white">
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
                <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Clock className="text-primary"/> Main Activities</h3>
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
                            className="ml-4 border-l-2 border-primary/20 pl-4"
                            isSubSection
                        />
                    ))}
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
        </>
      )}
    </div>
  );
}

const PrintableLessonPlan = React.forwardRef<HTMLDivElement, { lessonPlan: GenerateLessonPlanOutput }>(({ lessonPlan }, ref) => {
    return (
        <div ref={ref} className="p-8 bg-white text-black w-[800px]">
            <h1 className="text-3xl font-bold text-center mb-2">{lessonPlan.title}</h1>
            <div className="grid grid-cols-4 gap-4 my-6 text-sm border-y py-2">
                <div><strong className="block text-gray-500">Teacher:</strong> {lessonPlan.teacher || 'N/A'}</div>
                <div><strong className="block text-gray-500">Grade:</strong> {lessonPlan.grade || 'N/A'}</div>
                <div><strong className="block text-gray-500">Subject:</strong> {lessonPlan.subject || 'N/A'}</div>
                <div><strong className="block text-gray-500">Date:</strong> {lessonPlan.date || 'N/A'}</div>
            </div>
            
            <div className="space-y-4">
                <PrintSection title="Objective" content={lessonPlan.objective} icon={FileText}/>
                <div className="">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <FileText className="text-primary"/> Materials
                    </h3>
                    <ul className="list-disc pl-5 space-y-1" style={{ columnCount: 2, columnGap: '20px' }}>
                        {lessonPlan.materials.map((item, i) => item.trim() && <li key={i}>{item}</li>)}
                    </ul>
                </div>
                <PrintSection title="Warm-Up" content={lessonPlan.warmUp.activity} duration={lessonPlan.warmUp.duration} icon={Clock}/>
                <div>
                     <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Clock className="text-primary"/> Main Activities</h3>
                      {lessonPlan.mainActivities.map((act, i) => (
                          <PrintSection key={i} title={`Activity ${i+1}`} content={act.activity} duration={act.duration} className="ml-4 border-l-2 border-gray-200 pl-4" />
                      ))}
                </div>
                <PrintSection title="Cool-Down" content={lessonPlan.coolDown.activity} duration={lessonPlan.coolDown.duration} icon={Clock}/>
                <PrintSection title="Assessment" content={lessonPlan.assessment} icon={FileText}/>
                <PrintSection title="Homework" content={lessonPlan.homework || 'None'} icon={FileText} isOptional={!lessonPlan.homework}/>

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
            <p className="whitespace-pre-line text-gray-700">{content}</p>
        </div>
    )
}

function EditableHeaderField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string; }) {
    return (
        <div>
            <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
            <Input 
                type={type}
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                className="w-full border-0 border-b-2 rounded-none px-0 focus-visible:ring-0 focus:border-primary bg-transparent text-black"
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
        <div className={className}>
            <TitleComponent className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
                {Icon && <Icon className="text-primary"/>}
                {title}
                 {isOptional && <span className="text-sm font-normal text-muted-foreground">(Optional)</span>}
                 {duration !== undefined && (
                     <div className="flex items-center gap-1 text-sm font-normal text-muted-foreground ml-auto">
                        <Clock className="h-4 w-4" />
                        <Input 
                            type="number" 
                            value={duration} 
                            onChange={(e) => onDurationChange?.(parseInt(e.target.value) || 0)}
                            className="w-16 h-8 text-center bg-transparent text-black"
                         />
                         <span>mins</span>
                     </div>
                 )}
            </TitleComponent>
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-50 border-slate-200 text-black"
                rows={isList ? value.split('\n').length + 1 : 3}
            />
        </div>
    )
}

    