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
import { Loader2, Sparkles, FileQuestion, GraduationCap, CheckCircle, ChevronRight, ChevronLeft, ArrowLeft, LogIn, Maximize, Minimize, FileDown, BookCheck, ClipboardList, Edit3, Trash2, Save, X, BookOpen, Compass, Award, HelpCircle } from 'lucide-react';
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

    content += `<br/><div style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10pt; color: #a0aec0; font-family: Arial, sans-serif;">www.lingolandverse.com</div>`;

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

    content += `<br/><div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 9pt; color: #a0aec0; font-family: Arial, sans-serif;">www.lingolandverse.com</div>`;

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

  if (authLoading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-primary" /></div>;

  if (examState === 'restricted') {
    return (
      <Card className="max-w-md mx-auto text-center p-8 bg-slate-900/40 border border-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl">
        <CardHeader>
          <div className="mx-auto bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-4 rounded-full border border-slate-700/50 w-24 h-24 flex items-center justify-center mb-4">
            <FileQuestion className="h-12 w-12 text-indigo-400 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-black bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">Member Exclusive Feature</CardTitle>
          <CardDescription className="text-slate-400 font-medium">Exam Mode is available only for registered members and admins. Guests must sign in to generate and take exams.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-500 to-indigo-650 hover:scale-[1.02] transition-transform">
            <Link href="/auth">
              <LogIn className="mr-2 h-5 w-5" /> Sign In or Register
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={cn("max-w-full w-full px-4 md:px-8 space-y-8 relative", isFullscreen && "bg-slate-950 p-8 w-screen h-screen overflow-y-auto")}
      data-fullscreen-container={isFullscreen}
    >
      {/* Decorative background glow spheres */}
      <div className="absolute top-[-10%] left-[10%] w-72 h-72 rounded-full blur-[150px] bg-purple-500/15 pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[10%] w-80 h-80 rounded-full blur-[150px] bg-indigo-500/15 pointer-events-none -z-10" />

      <AnimatePresence mode="wait">
        {examState === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            {/* Split Widescreen Bento Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-stretch">
              
              {/* Left Column: Command Center presentation */}
              <div className="lg:col-span-5 flex flex-col justify-between p-8 rounded-3xl bg-gradient-to-br from-indigo-900/40 via-purple-950/20 to-slate-900/60 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden shadow-2xl min-h-[400px]">
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="space-y-6 relative">
                  <div className="inline-flex bg-gradient-to-r from-purple-500/20 to-indigo-500/20 p-4 rounded-2xl border border-indigo-500/30 shadow-inner">
                    <Sparkles className="h-8 w-8 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400">Classroom Suite</span>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
                      AI EXAM <br />
                      <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">GENERATOR</span>
                    </h1>
                  </div>
                  <p className="text-slate-400 text-sm font-medium max-w-sm leading-relaxed">
                    Instantly craft customized diagnostic assessments, quizzes, and unit exams. Powered by Gemini AI tailored to your classroom focus.
                  </p>
                </div>

                <div className="pt-8 space-y-3.5 border-t border-slate-800/60 mt-8 relative">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-300">Customized difficulty level scaling</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-300">Printable word files & answer keys</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-300">Interactive digital reviewer dashboard</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Frosted Inputs Dashboard */}
              <div className="lg:col-span-7 rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl p-8 flex flex-col justify-between shadow-2xl relative">
                <div className="absolute top-4 right-4 z-10">
                  <Button 
                    variant="ghost" 
                    className="text-slate-400 hover:text-white hover:bg-slate-850 h-9 px-3 gap-2 rounded-xl text-xs font-bold" 
                    onClick={handleFullScreen}
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-wider">Configure Exam</h3>
                    <p className="text-xs text-slate-400">Specify details to trigger customized question pipelines.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exam-topic" className="text-sm font-black uppercase tracking-widest text-slate-400">Exam Topic</Label>
                    <Input 
                      id="exam-topic"
                      placeholder="e.g., Passive Voice, World Geography, irregular verbs..." 
                      value={setup.topic} 
                      onChange={(e) => setSetup({ ...setup, topic: e.target.value })}
                      className="h-12 text-base bg-slate-950/60 border-slate-800 text-white rounded-xl focus-visible:ring-indigo-500 placeholder:text-slate-650"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Difficulty Level</Label>
                      <Select value={setup.difficulty} onValueChange={(v) => setSetup({ ...setup, difficulty: v })}>
                        <SelectTrigger className="h-12 bg-slate-950/60 border-slate-800 text-white rounded-xl focus:ring-indigo-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Number of Items</Label>
                      <Select value={String(setup.itemCount)} onValueChange={(v) => setSetup({ ...setup, itemCount: Number(v) })}>
                        <SelectTrigger className="h-12 bg-slate-950/60 border-slate-800 text-white rounded-xl focus:ring-indigo-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          {[10, 20, 30, 40, 50].map(n => (
                            <SelectItem key={n} value={String(n)}>{n} Items</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="pt-8 mt-6">
                  <Button 
                    onClick={handleStartExam} 
                    className="w-full h-14 text-lg font-black uppercase tracking-widest bg-gradient-to-r from-purple-500 to-indigo-650 hover:from-purple-400 hover:to-indigo-550 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] rounded-xl flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-5 w-5" /> Generate Assessment
                  </Button>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {examState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center min-h-[450px] text-center space-y-6 bg-slate-900/30 border border-slate-800/40 rounded-3xl p-12 backdrop-blur-xl"
          >
            <div className="relative">
              <div className="h-28 w-28 rounded-full border-4 border-indigo-500/20 border-t-indigo-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <GraduationCap className="h-10 w-10 text-indigo-400 animate-bounce" />
              </div>
            </div>
            <div className="space-y-2 max-w-sm">
              <h2 className="text-2xl font-black uppercase tracking-tight text-white animate-pulse">Forging Custom Exam...</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Gemini AI is structuring syllabus-aligned questions. This process may take around 5-10 seconds.
              </p>
            </div>
          </motion.div>
        )}

        {examState === 'taking' && examData && (
          <motion.div
            key="taking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 w-full"
          >
            {/* Top Toolbar Container */}
            <div className="flex justify-between items-center bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md shadow-lg flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  className="text-slate-400 hover:text-white hover:bg-slate-850 h-9 px-3 gap-2 rounded-xl text-xs font-bold" 
                  onClick={handleFullScreen}
                >
                  {isFullscreen ? <Minimize className="h-4.5 w-4.5" /> : <Maximize className="h-4.5 w-4.5" />}
                  <span>{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
                </Button>
                <div className="space-y-0.5 border-l border-slate-800 pl-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-black uppercase">{setup.difficulty}</Badge>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Digital Exam</span>
                  </div>
                  <h3 className="font-extrabold text-white text-base truncate max-w-[250px] leading-tight">{examData.title}</h3>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5 ml-auto flex-wrap">
                <Button 
                  variant={isEditing ? "default" : "outline"} 
                  onClick={() => setIsEditing(!isEditing)} 
                  className={cn("h-10 font-bold rounded-xl border-slate-800 text-xs px-4", isEditing ? "bg-purple-600 text-white hover:bg-purple-700 border-none" : "text-slate-350 hover:bg-slate-850 hover:text-white")}
                >
                  {isEditing ? <><Save className="mr-2 h-4 w-4"/> Done Editing</> : <><Edit3 className="mr-2 h-4 w-4"/> Edit Question</>}
                </Button>
                <Button variant="secondary" onClick={handleDownloadWord} className="bg-blue-600 hover:bg-blue-500 text-white h-10 font-bold rounded-xl text-xs px-4">
                    <FileDown className="mr-2 h-4 w-4" /> Download DOC
                </Button>
                <Button variant="outline" onClick={handleDownloadAnswerSheet} className="border-slate-800 hover:bg-slate-850 text-slate-350 hover:text-white h-10 font-bold rounded-xl text-xs px-4">
                    <ClipboardList className="mr-2 h-4 w-4 text-indigo-400" /> Answer Sheet
                </Button>
                <div className="text-right ml-2 border-l border-slate-800 pl-4 hidden sm:block">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Question</p>
                    <p className="text-2xl font-black text-white">{currentQuestionIndex + 1} <span className="text-slate-650 text-sm font-bold">/ {examData.questions.length}</span></p>
                </div>
              </div>
            </div>

            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500"
                style={{ width: `${((currentQuestionIndex + 1) / examData.questions.length) * 100}%` }}
              />
            </div>

            {/* Split Taking Area with Badge Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
              
              {/* Left Column: Interactive Navigation Grid (Bento style) */}
              <div className="lg:col-span-3 rounded-2xl bg-slate-900/40 border border-slate-800/80 p-5 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-850">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300">Exam Navigator</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-indigo-300 bg-indigo-500/5 border-indigo-500/10">Items: {examData.questions.length}</Badge>
                </div>

                <div className="grid grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {examData.questions.map((_, idx) => {
                    const isActive = idx === currentQuestionIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentQuestionIndex(idx);
                        }}
                        className={cn(
                          "h-10 w-full rounded-xl font-extrabold text-xs transition-all duration-200 border flex items-center justify-center",
                          isActive 
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-650/20 scale-105" 
                            : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-white"
                        )}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="text-[9px] text-slate-500 font-bold leading-normal pt-2 border-t border-slate-850">
                  💡 Select any cell index to skip directly to that question.
                </div>
              </div>

              {/* Right Column: Question Canvas Card */}
              <div className="lg:col-span-9">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -30, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <Card className="min-h-[420px] bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-3xl flex flex-col relative overflow-hidden shadow-2xl">
                      {isEditing && (
                        <div className="absolute top-4 right-4 z-10">
                          <Button variant="destructive" size="sm" onClick={() => removeQuestion(currentQuestionIndex)} className="h-8 rounded-lg text-xs font-bold px-3">
                            <Trash2 className="mr-2 h-4 w-4" /> Remove Question
                          </Button>
                        </div>
                      )}
                      
                      <CardHeader className="p-8">
                        <p className="text-indigo-400 font-black text-xs uppercase mb-2 tracking-[0.25em] flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
                          {examData.questions[currentQuestionIndex].type.replace(/_/g, ' ')}
                        </p>
                        
                        {isEditing ? (
                          <div className="space-y-2 pt-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Question Text</Label>
                            <Textarea 
                              value={examData.questions[currentQuestionIndex].question} 
                              onChange={(e) => updateQuestion(currentQuestionIndex, { question: e.target.value })}
                              className="text-lg font-medium bg-slate-950/60 border-slate-800 text-white rounded-xl focus:ring-indigo-500"
                              rows={3}
                            />
                          </div>
                        ) : (
                          <CardTitle className={cn(
                            "text-2xl md:text-3xl font-extrabold text-white leading-normal tracking-tight",
                            examData.questions[currentQuestionIndex].type === 'unscramble' && "text-4xl md:text-5xl font-black tracking-widest uppercase text-indigo-400 text-center py-8"
                          )}>
                            {examData.questions[currentQuestionIndex].question}
                          </CardTitle>
                        )}
                        
                        {examData.questions[currentQuestionIndex].type === 'unscramble' && !isEditing && (
                          <p className="text-center text-slate-500 text-xs font-black tracking-wider uppercase mt-2">UNSCRAMBLE THIS WORD</p>
                        )}
                      </CardHeader>
                      
                      <CardContent className="p-8 pt-0 flex-grow">
                        {examData.questions[currentQuestionIndex].options && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                            {examData.questions[currentQuestionIndex].options?.map((opt, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "h-auto py-5 text-lg font-bold px-6 rounded-2xl border-2 flex items-center relative transition-all",
                                  isEditing && examData.questions[currentQuestionIndex].correctAnswer === opt 
                                    ? "border-emerald-500 bg-emerald-500/[0.03] text-emerald-350" 
                                    : "border-slate-800 bg-slate-950/20 text-slate-200"
                                )}
                              >
                                <span className={cn(
                                  "mr-4 h-9 w-9 rounded-xl border-2 flex items-center justify-center shrink-0 font-extrabold text-sm",
                                  isEditing && examData.questions[currentQuestionIndex].correctAnswer === opt 
                                    ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" 
                                    : "border-indigo-500/40 text-indigo-300 bg-indigo-500/5"
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
                                        const newAnswer = oldAnswer === opt ? e.target.value : oldAnswer;
                                        updateQuestion(currentQuestionIndex, { options: newOptions, correctAnswer: newAnswer });
                                      }}
                                      className="text-base font-semibold h-10 bg-slate-900 border-slate-800 text-white rounded-lg"
                                    />
                                    <Button 
                                      size="sm" 
                                      variant={examData.questions[currentQuestionIndex].correctAnswer === opt ? "default" : "outline"}
                                      onClick={() => updateQuestion(currentQuestionIndex, { correctAnswer: opt })}
                                      className={cn("shrink-0 text-[10px] font-black uppercase h-8 px-2.5 rounded-lg", examData.questions[currentQuestionIndex].correctAnswer === opt ? "bg-emerald-600 hover:bg-emerald-700" : "border-slate-800")}
                                    >
                                      {examData.questions[currentQuestionIndex].correctAnswer === opt ? <CheckCircle className="h-4 w-4" /> : "Set Correct"}
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="leading-tight">{opt}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {isEditing && (
                          <div className="mt-8 space-y-4 border-t border-slate-850 pt-6">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Correct Answer (Full Word/Text)</Label>
                              <Input 
                                value={examData.questions[currentQuestionIndex].correctAnswer} 
                                onChange={(e) => updateQuestion(currentQuestionIndex, { correctAnswer: e.target.value })}
                                className="bg-slate-950/60 border-slate-800 font-bold text-white rounded-xl"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Explanation</Label>
                              <Textarea 
                                value={examData.questions[currentQuestionIndex].explanation || ''} 
                                onChange={(e) => updateQuestion(currentQuestionIndex, { explanation: e.target.value })}
                                className="bg-slate-950/60 border-slate-800 text-white rounded-xl"
                                rows={2}
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                      
                      <CardFooter className="p-8 border-t border-slate-850 bg-slate-950/20 flex justify-between gap-4 flex-wrap">
                        <Button 
                          variant="outline"
                          onClick={handlePrevious} 
                          size="lg" 
                          disabled={currentQuestionIndex === 0}
                          className="px-6 font-bold h-12 rounded-xl border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-white"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => { setExamState('finished'); setIsEditing(false); }}
                                className="font-bold h-12 rounded-xl px-5 text-slate-300 bg-slate-800 hover:bg-slate-750"
                            >
                                <BookCheck className="mr-2 h-4.5 w-4.5" /> Answer Key
                            </Button>
                            <Button 
                                onClick={handleNext} 
                                size="lg" 
                                className="px-6 font-black h-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-650 hover:opacity-90"
                            >
                                {currentQuestionIndex === examData.questions.length - 1 ? 'Finish Exam' : 'Next Question'}
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        )}

        {examState === 'finished' && examData && (
          <motion.div
            key="finished"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 w-full"
          >
            {/* Elegant Header Banner */}
            <Card className="overflow-hidden bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-slate-800/80 shadow-2xl rounded-3xl relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="p-8 md:p-12 text-center relative space-y-4">
                <Button 
                  variant="ghost" 
                  className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-white/5 h-9 rounded-xl font-bold text-xs"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? <><Save className="mr-2 h-4 w-4"/> Done Editing</> : <><Edit3 className="mr-2 h-4 w-4"/> Edit Key</>}
                </Button>
                <div className="inline-flex bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl mb-2">
                  <Award className="h-8 w-8 text-emerald-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">EXAM ANSWER KEY</h2>
                <p className="text-slate-400 text-sm max-w-lg mx-auto font-medium">
                  Review generated questions, refine correct answers, and compile diagnostic study guides.
                </p>
              </div>
              
              <CardContent className="p-6 bg-slate-950/40 backdrop-blur-md flex flex-wrap gap-3.5 justify-center border-t border-slate-850">
                <Button onClick={() => setExamState('setup')} size="lg" variant="outline" className="h-12 font-bold border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-white rounded-xl">
                  <ArrowLeft className="mr-2 h-4 w-4" /> New Exam
                </Button>
                <Button onClick={handleDownloadWord} size="lg" className="h-12 font-black shadow-lg bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm px-6">
                  <FileDown className="mr-2 h-4.5 w-4.5" /> Download Printable Key (.doc)
                </Button>
                <Button onClick={handleDownloadAnswerSheet} size="lg" className="h-12 font-bold shadow-lg bg-slate-900 border-2 border-indigo-500/20 text-indigo-300 hover:bg-slate-850 rounded-xl text-sm px-6">
                  <ClipboardList className="mr-2 h-4.5 w-4.5" /> Download Answer Sheet
                </Button>
              </CardContent>
            </Card>

            {/* Answer items review */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white px-3 border-l-4 border-indigo-500 uppercase tracking-widest">Question Bank Review</h3>
              
              <div className="grid grid-cols-1 gap-6">
                {examData.questions.map((q, i) => {
                    const correctIdx = q.options?.indexOf(q.correctAnswer) ?? -1;
                    const correctLetter = correctIdx !== -1 ? String.fromCharCode(65 + correctIdx) : '';
                    
                    return (
                      <Card key={i} className="border-slate-800 bg-slate-900/20 backdrop-blur-sm rounded-2xl relative shadow-md overflow-hidden">
                          {isEditing && (
                            <div className="absolute top-4 right-4">
                              <Button variant="ghost" size="icon" onClick={() => removeQuestion(i)} className="text-red-400 hover:bg-red-500/10 hover:text-red-300">
                                <Trash2 className="h-4.5 w-4.5" />
                              </Button>
                            </div>
                          )}
                          
                          <CardHeader className="p-6 pb-2">
                              <div className="space-y-1">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Question {i + 1} - {q.type.replace(/_/g, ' ')}</p>
                                {isEditing ? (
                                  <Textarea 
                                    value={q.question} 
                                    onChange={(e) => updateQuestion(i, { question: e.target.value })}
                                    className="font-medium bg-slate-950/60 border-slate-800 text-white rounded-xl mt-2"
                                  />
                                ) : (
                                  <CardTitle className={cn(
                                      "text-lg font-bold text-white leading-snug pt-1",
                                      q.type === 'unscramble' && "font-black tracking-widest uppercase text-indigo-300"
                                  )}>{q.question}</CardTitle>
                                )}
                              </div>
                          </CardHeader>
                          
                          <CardContent className="px-6 pb-6 space-y-4">
                            <div className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                  <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0" />
                                  <div className="flex-grow">
                                      <p className="text-[9px] font-black text-emerald-450 uppercase tracking-widest">Correct Answer</p>
                                      {isEditing ? (
                                        <div className="flex gap-2 mt-1.5">
                                          <Input 
                                            value={q.correctAnswer} 
                                            onChange={(e) => updateQuestion(i, { correctAnswer: e.target.value })}
                                            className="bg-slate-900 border-slate-800 text-white font-bold h-9 text-sm rounded-lg"
                                          />
                                          {q.options && (
                                            <Select value={q.correctAnswer} onValueChange={(v) => updateQuestion(i, { correctAnswer: v })}>
                                              <SelectTrigger className="w-40 bg-slate-900 border-slate-800 text-white h-9 text-xs">
                                                <SelectValue placeholder="Pick Option" />
                                              </SelectTrigger>
                                              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                {q.options.map((opt, idx) => (
                                                  <SelectItem key={idx} value={opt}>Option {String.fromCharCode(65 + idx)}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          )}
                                        </div>
                                      ) : (
                                        <p className="text-lg font-extrabold text-emerald-300 flex items-center gap-2 pt-0.5">
                                            {correctLetter && <span className="px-2 py-0.5 rounded-lg bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-black">{correctLetter}</span>}
                                            <span className="uppercase">{q.correctAnswer}</span>
                                        </p>
                                      )}
                                  </div>
                                </div>
                                
                                {isEditing && q.options && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-slate-950/40 rounded-xl border border-slate-850">
                                    {q.options.map((opt, idx) => (
                                      <div key={idx} className="flex items-center gap-2">
                                        <span className="font-black text-xs text-indigo-400 shrink-0">{String.fromCharCode(65 + idx)}:</span>
                                        <Input 
                                          value={opt} 
                                          onChange={(e) => {
                                            const newOpts = [...q.options!];
                                            const oldAns = q.correctAnswer;
                                            newOpts[idx] = e.target.value;
                                            const newAns = oldAns === opt ? e.target.value : oldAns;
                                            updateQuestion(i, { options: newOpts, correctAnswer: newAns });
                                          }}
                                          className="h-8 text-xs bg-slate-900 border-slate-800 text-white rounded-lg"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                            </div>
                            
                            <div className="p-4 bg-slate-950/20 border border-slate-850/60 rounded-xl space-y-1">
                                <p className="text-xs font-black text-indigo-400 uppercase tracking-wider">Explanation</p>
                                {isEditing ? (
                                  <Textarea 
                                    value={q.explanation || ''} 
                                    onChange={(e) => updateQuestion(i, { explanation: e.target.value })}
                                    className="text-xs bg-slate-900 border-slate-800 text-white rounded-lg mt-1"
                                    rows={2}
                                  />
                                ) : (
                                  <p className="text-sm text-slate-300 leading-relaxed">{q.explanation || 'No explanation provided.'}</p>
                                )}
                            </div>
                          </CardContent>
                      </Card>
                    );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
