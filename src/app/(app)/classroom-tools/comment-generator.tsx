
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { generateStudentComment } from '@/ai/flows/generate-student-comment';
import type { GenerateStudentCommentOutput } from '@/ai/flows/schemas/comment-generator-schema';
import { Loader2, Wand2, Copy, CheckCircle2, TrendingUp, AlertCircle, MessageSquareQuote, Star, AlignLeft, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function CommentGenerator() {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<GenerateStudentCommentOutput | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);
  
  const [formData, setFormData] = React.useState({
    studentName: '',
    performanceLevel: 'Satisfactory' as any,
    subject: 'English Language Arts',
    tone: 'Encouraging' as any,
    commentLength: 'Normal' as any,
    isConcise: false,
  });

  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!formData.studentName.trim()) {
      toast({ variant: 'destructive', title: 'Name Required', description: 'Please enter a student name.' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await generateStudentComment(formData);
      setResult(data);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate comments.' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: 'Copied!', description: 'Comment copied to clipboard.' });
  };

  return (
    <div className="w-full flex flex-col gap-12 items-center animate-in fade-in duration-700 py-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 items-start">
        {/* Left Side: Controls */}
        <Card className="bg-card/50 backdrop-blur-xl border-primary/10 shadow-2xl p-8 rounded-[2.5rem] lg:sticky lg:top-4">
          <CardContent className="p-0 space-y-8">
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-primary">Student Name</Label>
              <Input 
                placeholder="e.g., Alex Johnson" 
                value={formData.studentName}
                onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                className="bg-muted/50 border-white/5 rounded-2xl h-14 text-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-primary">Subject</Label>
                <Input 
                  placeholder="e.g., Science" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="bg-muted/50 border-white/5 rounded-2xl h-14"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-primary">Level</Label>
                <Select value={formData.performanceLevel} onValueChange={(v) => setFormData({...formData, performanceLevel: v})}>
                  <SelectTrigger className="bg-muted/50 border-white/5 rounded-2xl h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Satisfactory">Satisfactory</SelectItem>
                    <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-primary">Tone</Label>
                <Select value={formData.tone} onValueChange={(v) => setFormData({...formData, tone: v})}>
                  <SelectTrigger className="bg-muted/50 border-white/5 rounded-2xl h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Friendly">Friendly</SelectItem>
                    <SelectItem value="Encouraging">Encouraging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-primary">Length</Label>
                <Select value={formData.commentLength} onValueChange={(v) => setFormData({...formData, commentLength: v})}>
                  <SelectTrigger className="bg-muted/50 border-white/5 rounded-2xl h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal Mode</SelectItem>
                    <SelectItem value="1-2 sentences">1-2 sentences</SelectItem>
                    <SelectItem value="2-3 sentences">2-3 sentences</SelectItem>
                    <SelectItem value="3-5 sentences">3-5 sentences</SelectItem>
                    <SelectItem value="4-6 sentences">4-6 sentences</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between space-x-2 bg-muted/30 p-4 rounded-2xl border border-white/5 group transition-colors hover:border-primary/20">
                <div className="space-y-0.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <Zap className="w-3 h-3" /> Brevity Mode
                    </Label>
                    <p className="text-[10px] text-muted-foreground font-medium">Make comments ultra-concise</p>
                </div>
                <Switch 
                    checked={formData.isConcise}
                    onCheckedChange={(v) => setFormData({...formData, isConcise: v})}
                />
            </div>

            <Button onClick={handleGenerate} disabled={loading} className="w-full h-16 rounded-[1.5rem] bg-gradient-to-r from-indigo-600 to-purple-600 font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-white text-lg">
              {loading ? <Loader2 className="animate-spin mr-3" /> : <Wand2 className="mr-3" />}
              Generate Report
            </Button>
          </CardContent>
        </Card>

        {/* Right Side: Results Display */}
        <div className="relative flex flex-col gap-8 min-h-[400px] w-full">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0, rotateY: -20 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-6 pt-20"
              >
                <div className="w-40 h-40 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20 shadow-[0_0_60px_rgba(139,92,246,0.2)]">
                  <MessageSquareQuote className="w-16 h-16 text-primary animate-pulse" />
                </div>
                <div className="space-y-2">
                    <p className="text-2xl font-black uppercase tracking-widest text-white">Awaiting Input</p>
                    <p className="text-muted-foreground font-medium italic">Fill the student profile to generate analytics.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full space-y-8"
              >
                <CommentCard 
                  title="Strengths" 
                  content={result.strengths} 
                  icon={Star} 
                  color="text-yellow-400"
                  onCopy={() => copyToClipboard(result.strengths, 'strengths')}
                  isCopied={copied === 'strengths'}
                />
                <CommentCard 
                  title="Challenges" 
                  content={result.challenges} 
                  icon={AlertCircle} 
                  color="text-red-400"
                  onCopy={() => copyToClipboard(result.challenges, 'challenges')}
                  isCopied={copied === 'challenges'}
                />
                <CommentCard 
                  title="Path to Success" 
                  content={result.nextSteps} 
                  icon={TrendingUp} 
                  color="text-emerald-400"
                  onCopy={() => copyToClipboard(result.nextSteps, 'nextSteps')}
                  isCopied={copied === 'nextSteps'}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-6xl pb-12"
        >
          <Card className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-4 border-primary/20 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <CheckCircle2 className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <Badge className="bg-primary px-6 py-2 text-xs font-black uppercase tracking-[0.2em] text-white rounded-full">Report Card Final Synthesis</Badge>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.summary, 'summary')} className="text-primary hover:bg-primary/10 font-bold uppercase tracking-widest">
                  {copied === 'summary' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied === 'summary' ? 'Copied' : 'Copy Summary'}
                </Button>
              </div>
              <p className="text-3xl md:text-4xl lg:text-5xl font-black leading-[1.1] italic text-white tracking-tight">
                "{result.summary}"
              </p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function CommentCard({ title, content, icon: Icon, color, onCopy, isCopied }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 50, rotateY: 15 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      whileHover={{ scale: 1.02, rotateY: -2, rotateX: 2, z: 20 }}
      className="group perspective-1000"
    >
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden cursor-default transition-all duration-500 border-l-8" style={{ borderLeftColor: 'currentColor' }}>
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 bg-muted/50 rounded-2xl shadow-inner", color)}>
                <Icon className="w-6 h-6" />
              </div>
              <h4 className="font-black uppercase tracking-[0.2em] text-sm opacity-90 text-white">{title}</h4>
            </div>
            <Button variant="ghost" size="icon" className="h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 hover:bg-white/10" onClick={onCopy}>
              {isCopied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>
          <p className="text-lg leading-relaxed text-gray-100 font-medium">
            {content}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
