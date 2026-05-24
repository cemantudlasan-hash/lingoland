'use client';

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2, Download, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateEslExercise, type GenerateEslExerciseInput } from "@/ai/flows/generate-esl-exercise";
import { getContextualHint, type GetContextualHintInput } from "@/ai/flows/get-contextual-hint";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long."),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]),
  exerciseLength: z.enum(["short", "medium", "long"]),
});

type FormValues = z.infer<typeof formSchema>;

export function GeneratorForm() {
  const [exercise, setExercise] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      difficultyLevel: "beginner",
      exerciseLength: "medium",
    },
  });
  
  const { getValues } = form;

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setExercise(null);
    setHint(null);
    setStudentAnswer("");
    try {
      const result = await generateEslExercise(values);
      if (result.exercise) {
        setExercise(result.exercise);
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('ai_usage_increment'));
        if (firestore) {
          logAnalyticsEvent(firestore, user?.uid || 'guest', {
            type: 'exercise_generated',
            details: { topic: values.topic, difficulty: values.difficultyLevel }
          });
        }
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate an exercise. Please try again.",
      });
    }
    setIsLoading(false);
  };

  const handleGetHint = useCallback(async () => {
    if (!exercise) return;
    setIsHintLoading(true);
    setHint(null);
    try {
        const result = await getContextualHint({
            exerciseText: exercise,
            studentAnswer,
            difficultyLevel: getValues("difficultyLevel")
        });
        setHint(result.hint);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not get a hint. Please try again.",
      });
    }
    setIsHintLoading(false);
  }, [exercise, studentAnswer, getValues, toast]);

  const handleDownload = useCallback(() => {
    if (!exercise) return;

    const topic = getValues("topic");
    const difficulty = getValues("difficultyLevel");
    const filename = `${topic.replace(/\s+/g, '_')}_${difficulty}_exercise.doc`;

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Generated Exercise</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; line-height: 1.6; padding: 30px; }
  h1 { color: #4f46e5; font-size: 22pt; font-weight: bold; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px; text-align: center; }
  h2 { color: #0f172a; font-size: 16pt; font-weight: bold; margin-top: 25px; margin-bottom: 12px; text-align: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; }
  h3 { color: #4338ca; font-size: 13pt; font-weight: bold; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }
  p { font-size: 11pt; margin-bottom: 12px; color: #334155; }
  ul, ol { margin-left: 20px; margin-bottom: 15px; }
  li { font-size: 11pt; margin-bottom: 6px; color: #475569; }
  b, strong { color: #1e1b4b; font-weight: bold; background-color: #f5f3ff; padding: 2px 4px; border-radius: 4px; }
  .footer { margin-top: 45px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 9pt; color: #94a3b8; }
</style>
</head>
<body>`;
    const footer = "</body></html>";
    const content = `<h1>ESL Exercise Worksheet</h1><div>${exercise}</div><div class="footer">Generated via www.lingolandverse.com</div>`;
    
    const source = header + content + footer;

    const file = new Blob([source], {
        type: 'application/msword'
    });

    const fileUrl = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl);
  }, [exercise, getValues]);

  return (
    <Form {...form}>
        <div className="space-y-8">
            {/* Redesigned Header & Form Card */}
            <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-md text-white rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top duration-500">
            <CardHeader className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 md:p-8 rounded-t-3xl border-b border-white/10">
                <CardTitle className="text-2xl md:text-3xl font-black tracking-tight uppercase flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-200 animate-pulse" />
                  Generate a New Exercise
                </CardTitle>
                <CardDescription className="text-purple-100 font-semibold mt-1">
                  Enter a topic and select a difficulty to create a custom ESL exercise.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 px-6 md:px-8 pb-8">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-bold text-slate-300 uppercase tracking-wider">Topic / Vocabulary Area</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., Daily Routines, Ordering Food" className="bg-slate-950 border-slate-800 text-white rounded-xl h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="difficultyLevel"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-bold text-slate-300 uppercase tracking-wider">Difficulty Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl h-11">
                                  <SelectValue placeholder="Select a difficulty" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-950 border-slate-800 text-white">
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="exerciseLength"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-bold text-slate-300 uppercase tracking-wider">Exercise Length</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl h-11">
                                  <SelectValue placeholder="Select a length" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-950 border-slate-800 text-white">
                                <SelectItem value="short">Short</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="long">Long</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" disabled={isLoading} className="h-11 px-6 font-extrabold rounded-xl bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate Exercise
                </Button>
                </form>
            </CardContent>
            </Card>

            {isLoading && (
            <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-white">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <p className="ml-4 text-slate-300 font-bold">Constructing your premium ESL exercise...</p>
            </div>
            )}

            {/* Redesigned parsed rich-text exercise card */}
            {exercise && (
            <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-md text-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
                <CardHeader className="border-b border-slate-800 bg-slate-950/40 py-5 px-6 md:px-8">
                  <CardTitle className="text-xl font-black tracking-tight text-slate-100 flex items-center gap-2">
                    ✨ Your Custom ESL Exercise Outline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 px-6 md:px-8 pb-8">
                <div 
                  dangerouslySetInnerHTML={{ __html: exercise }} 
                  className={cn(
                    "rounded-2xl bg-white text-slate-800 p-6 md:p-10 border border-slate-200 shadow-inner select-text leading-relaxed font-normal",
                    "[&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:mb-6 [&_h2]:mt-2 [&_h2]:tracking-tight [&_h2]:text-center [&_h2]:border-b-2 [&_h2]:border-indigo-100 [&_h2]:pb-4",
                    "[&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-indigo-900 [&_h3]:mb-4 [&_h3]:mt-8 [&_h3]:border-b [&_h3]:border-slate-100 [&_h3]:pb-2",
                    "[&_p]:text-slate-700 [&_p]:text-base [&_p]:leading-relaxed [&_p]:mb-5 [&_p]:p-1",
                    "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:mb-5 [&_ul]:text-slate-700",
                    "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-3 [&_ol]:mb-5 [&_ol]:text-slate-700",
                    "[&_li]:text-slate-700 [&_li]:text-base [&_li]:font-medium [&_li]:my-2",
                    "[&_b]:text-indigo-950 [&_b]:font-bold [&_b]:bg-indigo-50/80 [&_b]:px-1.5 [&_b]:py-0.5 [&_b]:rounded",
                    "[&_strong]:text-indigo-950 [&_strong]:font-bold [&_strong]:bg-indigo-50/80 [&_strong]:px-1.5 [&_strong]:py-0.5 [&_strong]:rounded"
                  )}
                />
                
                <FormItem>
                    <FormLabel htmlFor="studentAnswer" className="text-sm font-bold text-slate-300 uppercase tracking-wider">Your Answer Workspace</FormLabel>
                    <Textarea
                        id="studentAnswer"
                        placeholder="Type your answers, completions, or text reactions here..."
                        value={studentAnswer}
                        onChange={(e) => setStudentAnswer(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white rounded-2xl min-h-[140px]"
                    />
                </FormItem>
                <div className="flex flex-wrap gap-2 pt-2">
                    <Button onClick={handleGetHint} variant="outline" disabled={isHintLoading} className="h-10 text-xs font-bold rounded-xl border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white">
                        {isHintLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        <Lightbulb className="mr-2 h-4 w-4 text-yellow-500" />
                        )}
                        Get a Hint
                    </Button>
                    <Button onClick={handleDownload} variant="outline" className="h-10 text-xs font-bold rounded-xl border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white">
                        <Download className="mr-2 h-4 w-4 text-purple-400" />
                        Download Outline (.doc)
                    </Button>
                </div>

                {hint && (
                    <Alert className="bg-purple-950/20 border-purple-500/20 text-purple-200 rounded-2xl p-4 animate-in slide-in-from-bottom duration-300">
                        <Lightbulb className="h-4.5 w-4.5 text-yellow-500" />
                        <AlertTitle className="font-extrabold">ESL Coach Hint</AlertTitle>
                        <AlertDescription className="text-slate-300 font-semibold leading-relaxed mt-1">
                            {hint}
                        </AlertDescription>
                    </Alert>
                )}
                </CardContent>
            </Card>
            )}
        </div>
    </Form>
  );
}