'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, FileQuestion, GraduationCap, CheckCircle, ChevronRight, ChevronLeft, ArrowLeft, LogIn, Maximize, Minimize, FileDown, BookCheck, ClipboardList, Edit3, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateExam } from '@/ai/flows/generate-exam';
import type { GenerateExamOutput, ExamQuestion } from '@/ai/flows/schemas/exam-schema';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';

type ExamState = 'restricted' | 'setup' | 'loading' | 'taking' | 'finished';

const HISTORY_KEY = 'lingoland_exam_history';

export default function ExamModePage() {
  const { user, isGuest, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [examState, setExamState] = React.useState<ExamState>('setup');
  const [examData, setExamData] = React.useState<GenerateExamOutput | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [setup, setSetup] = React.useState({ topic: '', difficulty: 'intermediate' as any, itemCount: 10 });
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading) {
      if (isGuest || !user) {
        setExamState('restricted');
      }
    }
  }, [authLoading, isGuest, user]);

  const handleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        toast({ variant: 'destructive', title: 'Fullscreen Error', description: err.message });
      });
    } else {
      document.exitFullscreen();
    }
  };

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const getUsedQuestionsForTopic = (topic: string): string[] => {
    try {
      const historyStr = localStorage.getItem(HISTORY_KEY);
      if (!historyStr) return [];
      const history = JSON.parse(historyStr);
      return history[topic.toLowerCase().trim()] || [];
    } catch (e) {
      return [];
    }
  };

  const saveUsedQuestionsForTopic = (topic: string, questions: ExamQuestion[]) => {
    try {
      const historyStr = localStorage.getItem(HISTORY_KEY);
      const history = historyStr ? JSON.parse(historyStr) : {};
      const key = topic.toLowerCase().trim();
      const existing = history[key] || [];
      const newQuestions = questions.map(q => q.question);
      
      const updated = Array.from(new Set([...existing, ...newQuestions])).slice(-100);
      history[key] = updated;
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save exam history', e);
    }
  };

  const handleStartExam = async () => {
    if (!setup.topic.trim()) {
      toast({ variant: 'destructive', title: 'Topic Required', description: 'Please enter a topic for the exam.' });
      return;
    }
    setExamState('loading');
    
    const usedQuestions = getUsedQuestionsForTopic(setup.topic);

    try {
      const result = await generateExam({
        topic: setup.topic,
        difficulty: setup.difficulty,
        itemCount: setup.itemCount,
        usedQuestions: usedQuestions,
      });
      
      saveUsedQuestionsForTopic(setup.topic, result.questions);
      setExamData(result);
      setCurrentQuestionIndex(0);
      setExamState('taking');
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not generate exam. Please try again.' });
      setExamState('setup');
    }
  };

  const handleNext = () => {
    if (!examData) return;
    if (currentQuestionIndex < examData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setExamState('finished');
      setIsEditing(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Editing Functions
  const updateQuestion = (index: number, updatedFields: Partial<ExamQuestion>) => {
    if (!examData) return;
    const newQuestions = [...examData.questions];
    newQuestions[index] = { ...newQuestions[index], ...updatedFields };
    setExamData({ ...examData, questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    if (!examData || examData.questions.length <= 1) {
      toast({ variant: 'destructive', title: 'Action Denied', description: 'Exam must have at least one question.' });
      return;
    }
    const newQuestions = examData.questions.filter((_, i) => i !== index);
    setExamData({ ...examData, questions: newQuestions });
    if (currentQuestionIndex >= newQuestions.length) {
      setCurrentQuestionIndex(newQuestions.length - 1);
    }
    toast({ title: 'Question Removed' });
  };

  const handleDownloadWord = () => {
    if (!examData) return;

    const topic = setup.topic;
    const filename = `${topic.replace(/\s+/g, '_')}_exam.doc`;

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${examData.title}</title><style>body { font-family: Arial, sans-serif; } .question { margin-bottom: 20px; } .options { margin-left: 20px; }</style></head><body>`;
    const footer = "</body></html>";
    
    let content = `<h1>${examData.title}</h1>`;
    content += `<p><strong>Topic:</strong> ${topic}</p>`;
    content += `<p><strong>Difficulty:</strong> ${setup.difficulty}</p><br/>`;

    examData.questions.forEach((q, i) => {
      content += `<div class="question">`;
      content += `<p><strong>Question ${i + 1}:</strong> ${q.question}</p>`;
      if (q.options) {
        content += `<div class="options">`;
        q.options.forEach((opt, optIdx) => {
          content += `<p>${String.fromCharCode(65 + optIdx)}) ${opt}</p>`;
        });
        content += `</div>`;
      } else {
        content += `<p>__________________________________________________</p>`;
      }
      content += `</div>`;
    });

    const source = header + content + footer;
    const file = new Blob([source], { type: 'application/msword' });
    const fileUrl = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl);
    
    toast({ title: "Exam Downloaded", description: "Your printable Word document is ready." });
  };

  const handleDownloadAnswerSheet = () => {
    if (!examData) return;

    const topic = setup.topic;
    const filename = `${topic.replace(/\s+/g, '_')}_answer_sheet.doc`;
    const totalItems = examData.questions.length;
    
    let numCols = 1;
    if (totalItems > 25) numCols = 3;
    else if (totalItems > 12) numCols = 2;

    const itemsPerColumn = Math.ceil(totalItems / numCols);

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Answer Sheet - ${topic}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 10pt; margin: 0.25in; }
          .title { text-align: center; color: #4f46e5; font-size: 16pt; font-weight: bold; margin-bottom: 5pt; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 8pt; }
          .header-table td { border: 1px solid #ccc; padding: 4pt; }
          .answer-grid { width: 100%; border-collapse: collapse; table-layout: fixed; }
          .answer-grid td { border: 1px solid #000; padding: 2pt; height: 18pt; vertical-align: middle; }
          .num-col { width: 25pt; font-weight: bold; background-color: #f0f0f0; text-align: center; font-size: 9pt; }
          .spacer-col { width: 15pt; border: none !important; background: none !important; }
        </style>
      </head>
      <body>`;
    const footer = "</body></html>";
    
    let content = `<div class="title">LINGOLANDVERSE ANSWER SHEET</div>`;
    
    content += `<table class="header-table">
      <tr>
        <td style="width: 75%"><strong>Name:</strong> ________________________________</td>
        <td style="width: 25%"><strong>Seat No:</strong> __________</td>
      </tr>
      <tr>
        <td><strong>Date:</strong> ________________________________</td>
        <td><strong>Class:</strong> _______________________________</td>
      </tr>
      <tr>
        <td colspan="2"><strong>Topic:</strong> ${topic}</td>
      </tr>
    </table>`;

    content += `<p style="margin-bottom: 6pt; font-size: 9pt;">Please write your answers clearly in the boxes below.</p>`;

    content += `<table class="answer-grid">`;
    
    for (let row = 0; row < itemsPerColumn; row++) {
      content += `<tr>`;
      for (let col = 0; col < numCols; col++) {
        const itemIdx = row + (col * itemsPerColumn);
        if (itemIdx < totalItems) {
          content += `<td class="num-col">${itemIdx + 1}</td>`;
          content += `<td></td>`;
        } else {
          content += `<td style="border:none"></td><td style="border:none"></td>`;
        }
        if (col < numCols - 1) {
          content += `<td class="spacer-col"></td>`;
        }
      }
      content += `</tr>`;
    }
    content += `</table>`;

    const source = header + content + footer;
    const file = new Blob([source], { type: 'application/msword' });
    const fileUrl = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl);
    
    toast({ title: "Answer Sheet Downloaded", description: "Your one-page printable answer sheet is ready." });
  };

  if (authLoading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>;

  if (examState === 'restricted') {
    return (
      <Card className="max-w-md mx-auto text-center p-8">
        <CardHeader>
          <FileQuestion className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <CardTitle>Member Exclusive Feature</CardTitle>
          <CardDescription>Exam Mode is available only for registered members and admins. Guests must sign in to generate and take exams.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/auth">
              <LogIn className="mr-2 h-4 w-4" /> Sign In or Register
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={cn("max-w-4xl mx-auto space-y-6", isFullscreen && "bg-background p-8 w-screen h-screen overflow-y-auto")}
      data-fullscreen-container={isFullscreen}
    >
      <AnimatePresence mode="wait">
        {examState === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="overflow-hidden border-none shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                      <FileQuestion className="h-8 w-8" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-black tracking-tight">AI EXAM GENERATOR</CardTitle>
                      <CardDescription className="text-purple-100 font-medium">Create a custom assessment for your class.</CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="text-white hover:bg-white/20 h-auto p-2 gap-2" 
                    onClick={handleFullScreen}
                  >
                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                    <span className="font-bold text-sm">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6 bg-card/50 backdrop-blur-sm">
                <div className="space-y-2">
                  <Label className="text-base font-bold">Exam Topic</Label>
                  <Input 
                    placeholder="e.g., Passive Voice, World Geography, irregular verbs..." 
                    value={setup.topic} 
                    onChange={(e) => setSetup({ ...setup, topic: e.target.value })}
                    className="h-12 text-lg bg-background/50 text-foreground"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base font-bold">Difficulty Level</Label>
                    <Select value={setup.difficulty} onValueChange={(v) => setSetup({ ...setup, difficulty: v })}>
                      <SelectTrigger className="h-12 bg-background/50 text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-bold">Number of Items</Label>
                    <Select value={String(setup.itemCount)} onValueChange={(v) => setSetup({ ...setup, itemCount: Number(v) })}>
                      <SelectTrigger className="h-12 bg-background/50 text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 20, 30, 40, 50].map(n => (
                          <SelectItem key={n} value={String(n)}>{n} Items</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleStartExam} size="lg" className="w-full h-14 text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-[1.02] transition-transform shadow-lg shadow-purple-500/20">
                  <Sparkles className="mr-2 h-6 w-6" /> Generate Exam
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {examState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6"
          >
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-primary animate-bounce" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold animate-pulse">Building your custom exam...</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">Gemini AI is crafting unique questions. This might take a moment.</p>
            </div>
          </motion.div>
        )}

        {examState === 'taking' && examData && (
          <motion.div
            key="taking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  className="hover:bg-muted h-auto p-2 gap-2" 
                  onClick={handleFullScreen}
                >
                  {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                  <span className="font-bold text-xs uppercase">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
                </Button>
                <div className="space-y-1">
                  <Badge className="bg-purple-500">{setup.difficulty.toUpperCase()}</Badge>
                  <h3 className="font-bold text-lg truncate max-w-[200px]">{examData.title}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto flex-wrap">
                <Button 
                  variant={isEditing ? "default" : "outline"} 
                  onClick={() => setIsEditing(!isEditing)} 
                  className="h-10 font-bold"
                >
                  {isEditing ? <><Save className="mr-2 h-4 w-4"/> Done Editing</> : <><Edit3 className="mr-2 h-4 w-4"/> Edit Exam</>}
                </Button>
                <Button variant="secondary" onClick={handleDownloadWord} className="bg-blue-600 text-white hover:bg-blue-700 h-10 font-bold">
                    <FileDown className="mr-2 h-4 w-4" /> Download Exam (.doc)
                </Button>
                <Button variant="outline" onClick={handleDownloadAnswerSheet} className="border-2 border-indigo-200 hover:bg-indigo-50 h-10 font-bold">
                    <ClipboardList className="mr-2 h-4 w-4 text-indigo-600" /> Answer Sheet
                </Button>
                <div className="text-right ml-2 border-l pl-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Question</p>
                    <p className="text-2xl font-black">{currentQuestionIndex + 1} / {examData.questions.length}</p>
                </div>
              </div>
            </div>
            <Progress value={((currentQuestionIndex + 1) / examData.questions.length) * 100} className="h-3" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Card className="min-h-[400px] border-none shadow-xl flex flex-col relative overflow-hidden">
                  {isEditing && (
                    <div className="absolute top-4 right-4 z-10">
                      <Button variant="destructive" size="sm" onClick={() => removeQuestion(currentQuestionIndex)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Remove Question
                      </Button>
                    </div>
                  )}
                  <CardHeader className="p-8">
                    <p className="text-muted-foreground font-bold text-xs uppercase mb-2 tracking-widest flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                      {examData.questions[currentQuestionIndex].type.replace(/_/g, ' ')}
                    </p>
                    
                    {isEditing ? (
                      <div className="space-y-2">
                        <Label className="font-bold text-foreground">Question Text</Label>
                        <Textarea 
                          value={examData.questions[currentQuestionIndex].question} 
                          onChange={(e) => updateQuestion(currentQuestionIndex, { question: e.target.value })}
                          className="text-xl font-medium bg-muted/20 text-foreground"
                        />
                      </div>
                    ) : (
                      <CardTitle className={cn(
                        "text-3xl md:text-4xl font-medium leading-tight",
                        examData.questions[currentQuestionIndex].type === 'unscramble' && "text-5xl font-black tracking-widest uppercase text-primary text-center py-8"
                      )}>
                        {examData.questions[currentQuestionIndex].question}
                      </CardTitle>
                    )}
                    
                    {examData.questions[currentQuestionIndex].type === 'unscramble' && !isEditing && (
                      <p className="text-center text-muted-foreground text-sm font-bold">UNSCRAMBLE THIS WORD</p>
                    )}
                  </CardHeader>
                  <CardContent className="p-8 pt-0 flex-grow">
                    {examData.questions[currentQuestionIndex].options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {examData.questions[currentQuestionIndex].options?.map((opt, i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-auto py-6 text-2xl font-bold px-8 rounded-2xl border-4 flex items-center bg-muted/20 relative",
                              isEditing && examData.questions[currentQuestionIndex].correctAnswer === opt ? "border-green-500 bg-green-50" : "border-muted"
                            )}
                          >
                            <span className={cn(
                              "mr-6 h-12 w-12 rounded-full border-4 flex items-center justify-center shrink-0 font-black",
                              isEditing && examData.questions[currentQuestionIndex].correctAnswer === opt ? "border-green-600 text-green-600 bg-white" : "border-primary text-primary"
                            )}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            {isEditing ? (
                              <div className="flex-grow flex items-center gap-2">
                                <Input 
                                  value={opt} 
                                  onChange={(e) => {
                                    const newOptions = [...examData.questions[currentQuestionIndex].options!];
                                    const oldAnswer = examData.questions[currentQuestionIndex].correctAnswer;
                                    newOptions[i] = e.target.value;
                                    // If we edited the text of the correct answer, update the reference
                                    const newAnswer = oldAnswer === opt ? e.target.value : oldAnswer;
                                    updateQuestion(currentQuestionIndex, { options: newOptions, correctAnswer: newAnswer });
                                  }}
                                  className="text-xl font-bold h-12 bg-white text-black"
                                />
                                <Button 
                                  size="sm" 
                                  variant={examData.questions[currentQuestionIndex].correctAnswer === opt ? "default" : "outline"}
                                  onClick={() => updateQuestion(currentQuestionIndex, { correctAnswer: opt })}
                                  className={cn("shrink-0", examData.questions[currentQuestionIndex].correctAnswer === opt && "bg-green-600 hover:bg-green-700")}
                                >
                                  {examData.questions[currentQuestionIndex].correctAnswer === opt ? <CheckCircle className="h-4 w-4" /> : "Set Correct"}
                                </Button>
                              </div>
                            ) : (
                              opt
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {isEditing && (
                      <div className="mt-8 space-y-4 border-t pt-6">
                        <div className="space-y-2">
                          <Label className="font-bold text-foreground">Correct Answer (Full Word/Text)</Label>
                          <Input 
                            value={examData.questions[currentQuestionIndex].correctAnswer} 
                            onChange={(e) => updateQuestion(currentQuestionIndex, { correctAnswer: e.target.value })}
                            className="bg-muted/10 font-bold text-foreground"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold text-foreground">Explanation</Label>
                          <Textarea 
                            value={examData.questions[currentQuestionIndex].explanation} 
                            onChange={(e) => updateQuestion(currentQuestionIndex, { explanation: e.target.value })}
                            className="bg-muted/10 text-foreground"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-8 border-t bg-muted/30 flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={handlePrevious} 
                      size="lg" 
                      disabled={currentQuestionIndex === 0}
                      className="px-8 font-bold h-12 rounded-full border-2"
                    >
                      <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                    </Button>
                    <div className="flex gap-4">
                        <Button
                            variant="secondary"
                            onClick={() => { setExamState('finished'); setIsEditing(false); }}
                            className="font-bold h-12 rounded-full px-6"
                        >
                            <BookCheck className="mr-2 h-5 w-5" /> Finish & Answer Key
                        </Button>
                        <Button 
                            onClick={handleNext} 
                            size="lg" 
                            className="px-8 font-bold h-12 rounded-full bg-primary"
                        >
                            {currentQuestionIndex === examData.questions.length - 1 ? 'Finish Exam' : 'Next Question'}
                            <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {examState === 'finished' && examData && (
          <motion.div
            key="finished"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <Card className="overflow-hidden border-none shadow-2xl">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-12 text-center relative">
                <Button 
                  variant="ghost" 
                  className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? <><Save className="mr-2 h-4 w-4"/> Done Editing</> : <><Edit3 className="mr-2 h-4 w-4"/> Edit Key</>}
                </Button>
                <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter">ANSWER KEY</h2>
                <p className="text-xl font-medium opacity-90">Review and refine the correct answers for the {setup.topic} exam.</p>
              </div>
              <CardContent className="p-8 bg-card flex flex-wrap gap-4 justify-center border-b">
                <Button onClick={() => setExamState('setup')} size="lg" variant="outline" className="h-12 font-bold border-2">
                  <ArrowLeft className="mr-2 h-5 w-5" /> New Exam
                </Button>
                <Button onClick={handleDownloadWord} size="lg" className="h-12 font-bold shadow-lg bg-blue-600 text-white hover:bg-blue-700">
                  <FileDown className="mr-2 h-5 w-5" /> Download Printable Key (.doc)
                </Button>
                <Button onClick={handleDownloadAnswerSheet} size="lg" className="h-12 font-bold shadow-lg bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                  <ClipboardList className="mr-2 h-5 w-5" /> Download Answer Sheet (.doc)
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold px-2 border-l-4 border-primary">Review & Explanations</h3>
              {examData.questions.map((q, i) => {
                  const correctIdx = q.options?.indexOf(q.correctAnswer) ?? -1;
                  const correctLetter = correctIdx !== -1 ? String.fromCharCode(65 + correctIdx) : '';
                  
                  return (
                    <Card key={i} className="border-primary/20 bg-muted/10 relative">
                        {isEditing && (
                          <div className="absolute top-4 right-4">
                            <Button variant="ghost" size="icon" onClick={() => removeQuestion(i)} className="text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <CardHeader className="p-6 pb-2">
                            <div className="space-y-1">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Question {i + 1} - {q.type.replace(/_/g, ' ')}</p>
                            {isEditing ? (
                              <Textarea 
                                value={q.question} 
                                onChange={(e) => updateQuestion(i, { question: e.target.value })}
                                className="font-medium bg-white text-black mt-2"
                              />
                            ) : (
                              <CardTitle className={cn(
                                  "text-xl font-medium leading-snug",
                                  q.type === 'unscramble' && "font-black tracking-widest uppercase"
                              )}>{q.question}</CardTitle>
                            )}
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 space-y-4">
                        <div className="p-4 rounded-xl bg-green-500/10 border-2 border-green-500/20 flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                              <div className="flex-grow">
                                  <p className="text-xs font-black text-green-600 uppercase tracking-widest">Correct Answer</p>
                                  {isEditing ? (
                                    <div className="flex gap-2 mt-1">
                                      <Input 
                                        value={q.correctAnswer} 
                                        onChange={(e) => updateQuestion(i, { correctAnswer: e.target.value })}
                                        className="bg-white text-black font-bold"
                                      />
                                      {q.options && (
                                        <Select value={q.correctAnswer} onValueChange={(v) => updateQuestion(i, { correctAnswer: v })}>
                                          <SelectTrigger className="w-40 bg-white text-black">
                                            <SelectValue placeholder="Pick Option" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {q.options.map((opt, idx) => (
                                              <SelectItem key={idx} value={opt}>Option {String.fromCharCode(65 + idx)}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-xl font-black text-green-700">
                                        {correctLetter && <span className="mr-2 px-2 py-0.5 rounded bg-green-600 text-white text-base">{correctLetter}</span>}
                                        {q.correctAnswer}
                                    </p>
                                  )}
                              </div>
                            </div>
                            
                            {isEditing && q.options && (
                              <div className="grid grid-cols-2 gap-2 p-2 bg-black/5 rounded-lg">
                                {q.options.map((opt, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-foreground">{String.fromCharCode(65 + idx)}:</span>
                                    <Input 
                                      value={opt} 
                                      onChange={(e) => {
                                        const newOpts = [...q.options!];
                                        const oldAns = q.correctAnswer;
                                        newOpts[idx] = e.target.value;
                                        const newAns = oldAns === opt ? e.target.value : oldAns;
                                        updateQuestion(i, { options: newOpts, correctAnswer: newAns });
                                      }}
                                      className="h-8 text-xs bg-white text-black"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                        <div className="p-4 bg-muted/50 rounded-xl">
                            <p className="text-sm font-bold mb-1 text-foreground">Explanation:</p>
                            {isEditing ? (
                              <Textarea 
                                value={q.explanation} 
                                onChange={(e) => updateQuestion(i, { explanation: e.target.value })}
                                className="text-sm bg-white text-black"
                              />
                            ) : (
                              <p className="text-sm text-foreground/90">{q.explanation}</p>
                            )}
                        </div>
                        </CardContent>
                    </Card>
                  );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
