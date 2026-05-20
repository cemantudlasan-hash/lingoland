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
import { Loader2, Wand2, ImageDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateRubricAction } from './actions';
import { GenerateRubricInputSchema, type GenerateRubricOutput } from '@/ai/flows/schemas/rubric-schema';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import html2canvas from 'html2canvas';

type FormValues = z.infer<typeof GenerateRubricInputSchema>;

export default function RubricsPage() {
  const [rubric, setRubric] = React.useState<GenerateRubricOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [scores, setScores] = React.useState<Record<number, number>>({});
  const [comments, setComments] = React.useState('');
  const rubricRef = React.useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(GenerateRubricInputSchema),
    defaultValues: {
      studentName: '',
      className: '',
      rubricType: '',
      gradeLevel: '',
      scoringUse: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setRubric(null);
    setScores({});
    setComments('');
    try {
      const result = await generateRubricAction(values);
      setRubric(result);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to generate rubric. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExport = () => {
    if (rubricRef.current) {
        toast({
            title: "Exporting...",
            description: "Your rubric is being converted to an image.",
        });
        html2canvas(rubricRef.current, {
            scale: 2, 
            backgroundColor: '#ffffff',
            useCORS: true,
            windowWidth: 1024,
            ignoreElements: (element) => element.classList.contains('export-hidden'),
            onclone: (clonedDoc) => {
                const elements = clonedDoc.getElementsByClassName('printable-area');
                for (let i = 0; i < elements.length; i++) {
                    const el = elements[i] as HTMLElement;
                    el.style.width = '1024px';
                    el.style.maxWidth = '1024px';
                    el.style.padding = '24px';
                }
            }
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'rubric.jpg';
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.click();
        });
    }
  };

  const handleScoreChange = (criterionIndex: number, value: string) => {
    const newScores = { ...scores };
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue)) {
      newScores[criterionIndex] = numericValue;
    } else {
      delete newScores[criterionIndex];
    }
    setScores(newScores);
  };

  const totalScore = React.useMemo(() => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  }, [scores]);

  return (
    <div className="space-y-8">
      <Card className="print-hidden">
        <CardHeader
          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
        >
          <CardTitle>Rubric Generator</CardTitle>
          <CardDescription className="text-gray-300">Create a custom scoring rubric with the power of AI.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                 <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student/Group Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="className"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class/Section (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., English 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="rubricType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Type of Rubric</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Oral Presentation, Essay" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scoringUse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Scoring Focus</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Historical Accuracy, Grammar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                 <FormField
                  control={form.control}
                  name="gradeLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade Level</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 5th Grade" {...field} />
                      </FormControl>
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
                Generate Rubric
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center rounded-lg border p-12 print-hidden">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Building your rubric...</p>
        </div>
      )}

      {rubric && (
        <Card ref={rubricRef} className="printable-area bg-white text-black">
            <CardHeader>
                <div className='flex justify-between items-start'>
                    <div>
                        <CardTitle>{rubric.title}</CardTitle>
                        <CardDescription>Generated Rubric</CardDescription>
                    </div>
                     <Button onClick={handleExport} variant="outline" className="export-hidden bg-gray-800 text-white hover:bg-gray-700">
                        <ImageDown className="mr-2 h-4 w-4 text-white" />
                        Export to JPG
                    </Button>
                </div>
            </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 border-b pb-4">
                <div><span className="font-semibold">Student/Group: </span>{rubric.studentName || 'N/A'}</div>
                <div><span className="font-semibold">Class: </span>{rubric.className || 'N/A'}</div>
                <div><span className="font-semibold">Grade: </span>{rubric.gradeLevel || 'N/A'}</div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] font-bold">Criteria</TableHead>
                  {rubric.criteria[0]?.levels.map((level, levelIndex) => (
                    <TableHead key={`header-${levelIndex}`} className="font-bold text-center">
                      {level.levelName} ({level.points} pts)
                    </TableHead>
                  ))}
                   <TableHead className="w-[100px] font-bold text-center">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rubric.criteria.map((criterion, criterionIndex) => (
                  <TableRow key={`criterion-${criterionIndex}`}>
                    <TableCell className="font-medium align-top">{criterion.name}</TableCell>
                    {criterion.levels.map((level, levelIndex) => (
                      <TableCell key={`level-${criterionIndex}-${levelIndex}`} className="text-sm align-top">
                        {level.description}
                      </TableCell>
                    ))}
                     <TableCell className="align-top">
                        <Input 
                            type="number"
                            className="w-20 text-center mx-auto print:border-none bg-white text-black border border-black"
                            onChange={(e) => handleScoreChange(criterionIndex, e.target.value)}
                            value={scores[criterionIndex] || ''}
                        />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                    <TableCell colSpan={rubric.criteria[0]?.levels.length + 1} className="text-right font-bold text-lg">Total Score</TableCell>
                    <TableCell className="text-center font-bold text-lg">{totalScore > 0 ? totalScore : ''}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <div className="mt-8">
                <div>
                    <Label htmlFor="comments" className="text-lg font-bold">Comments</Label>
                    <Textarea id="comments" className="mt-2 bg-white text-black border border-black" rows={4} value={comments} onChange={(e) => setComments(e.target.value)} />
                </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
