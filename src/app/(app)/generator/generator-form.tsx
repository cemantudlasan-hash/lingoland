
"use client";

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
import { Lightbulb, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateEslExercise, type GenerateEslExerciseInput } from "@/ai/flows/generate-esl-exercise";
import { getContextualHint, type GetContextualHintInput } from "@/ai/flows/get-contextual-hint";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";

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
      if (result.error) {
        toast({
          variant: "destructive",
          title: "AI Generation Error",
          description: result.error,
        });
        setIsLoading(false);
        return;
      }
      if (result.exercise) {
        setExercise(result.exercise);

        if (firestore) {
          logAnalyticsEvent(firestore, user?.uid || 'guest', {
            type: 'exercise_generated',
            details: { topic: values.topic, difficulty: values.difficultyLevel }
          });
        }
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: e.message || "Could not connect to the server.",
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

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Generated Exercise</title></head><body>`;
    const footer = "</body></html>";
    const exerciseParagraphs = exercise.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p}</p>`).join('');
    const content = `<h1>Exercise: ${topic} (${difficulty})</h1>${exerciseParagraphs}`;
    
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
            <Card>
            <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                <CardTitle>Generate a New Exercise</CardTitle>
                <CardDescription className="text-gray-300">
                Enter a topic and select a difficulty to create a custom ESL exercise.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-base font-semibold">Topic</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., Daily Routines, Ordering Food" {...field} />
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
                            <FormLabel className="text-base font-semibold">Difficulty Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a difficulty" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                            <FormLabel className="text-base font-semibold">Exercise Length</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a length" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Exercise
                </Button>
                </form>
            </CardContent>
            </Card>

            {isLoading && (
            <div className="flex items-center justify-center rounded-lg border p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Generating your exercise...</p>
            </div>
            )}

            {exercise && (
            <Card>
                <CardHeader>
                <CardTitle>Your Custom Exercise</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <p className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                    {exercise}
                </p>
                <FormItem>
                    <FormLabel htmlFor="studentAnswer">Your Answer</FormLabel>
                    <Textarea
                        id="studentAnswer"
                        placeholder="Type your answer here..."
                        value={studentAnswer}
                        onChange={(e) => setStudentAnswer(e.target.value)}
                    />
                </FormItem>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleGetHint} variant="outline" disabled={isHintLoading}>
                        {isHintLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        <Lightbulb className="mr-2 h-4 w-4" />
                        )}
                        Get a Hint
                    </Button>
                    <Button onClick={handleDownload} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                </div>

                {hint && (
                    <Alert>
                        <Lightbulb className="h-4 w-4" />
                        <AlertTitle>Here's a hint!</AlertTitle>
                        <AlertDescription>
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

    