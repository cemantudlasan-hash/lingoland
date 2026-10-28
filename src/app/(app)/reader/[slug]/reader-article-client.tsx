"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Article } from "@/lib/articles";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock, Loader2, Sparkles, GraduationCap, MessageSquare, CheckCircle2, HelpCircle } from "lucide-react";
import Link from "next/link";
import { ArticleViewTracker } from './article-view-tracker';
import { ConstellationCanvas } from "@/components/ui/constellation-canvas";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { generateFlashcardContent } from "@/ai/flows/generate-flashcard-content";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function extractKeyVocabulary(content: string): Array<{ word: string; partOfSpeech: string; usageNote: string }> {
  const words = content
    .replace(/[^a-zA-Z\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.toLowerCase().trim())
    .filter((w) => w.length >= 6);

  const stopWords = new Set([
    "because", "through", "before", "should", "always", "around", "people", "little", "things", "something",
    "everything", "nothing", "another", "between", "without", "together", "sometimes", "friends", "family",
    "school", "teacher", "student", "children", "morning", "evening", "weekend", "started", "wanted", "looked"
  ]);

  const unique: string[] = [];
  for (const w of words) {
    if (!stopWords.has(w) && !unique.includes(w)) {
      unique.push(w);
    }
    if (unique.length >= 6) break;
  }

  return unique.map((word, idx) => ({
    word: word.charAt(0).toUpperCase() + word.slice(1),
    partOfSpeech: idx % 3 === 0 ? "Noun / Concept" : idx % 3 === 1 ? "Descriptive / Action" : "Academic / Contextual",
    usageNote: `Appears in context within the reading passage; highlight "${word}" in the text above to generate a custom AI spaced-repetition flashcard.`,
  }));
}

export function ReaderArticleClient({
  article,
  levelLabel,
  relatedArticles,
}: {
  article: Article;
  levelLabel: string;
  relatedArticles: Article[];
}) {
  const { user, isGuest } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [selectedWord, setSelectedWord] = useState("");
  const [contextSentence, setContextSentence] = useState("");
  const [floatingCoords, setFloatingCoords] = useState<{ x: number; y: number; isBelow: boolean } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [definition, setDefinition] = useState("");
  const [translation, setTranslation] = useState("");
  const [example, setExample] = useState("");
  const [hint, setHint] = useState("");
  const [emoji, setEmoji] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleSelectionChange = () => {
      if (!user || isGuest) return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setFloatingCoords(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 0 && text.length < 100 && text.split(/\s+/).length <= 5) {
        try {
          const range = selection.getRangeAt(0);
          const container = document.getElementById("article-content-container");
          if (container && container.contains(range.commonAncestorContainer)) {
            const rect = range.getBoundingClientRect();
            setSelectedWord(text);

            const parentNode = range.startContainer.parentNode;
            const fullText = parentNode ? parentNode.textContent || "" : "";
            setContextSentence(fullText.slice(0, 300));

            const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768;
            setFloatingCoords({
              x: rect.left + rect.width / 2,
              y: isTouch ? rect.bottom + 12 : rect.top - 12,
              isBelow: isTouch,
            });
            return;
          }
        } catch (e) {}
      }
      setFloatingCoords(null);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [user, isGuest]);

  useEffect(() => {
    if (isModalOpen && selectedWord) {
      setDefinition("");
      setTranslation("");
      setExample("");
      setHint("");
      setEmoji("");

      const fetchAIContent = async () => {
        setIsLoadingAI(true);
        try {
          const res = await generateFlashcardContent({
            word: selectedWord,
            context: contextSentence,
          });
          if (res.card) {
            setDefinition(res.card.definition);
            setTranslation(res.card.translation);
            setExample(res.card.exampleSentence);
            setHint(res.card.hint);
            // @ts-ignore
            if (res.card.emoji) setEmoji(res.card.emoji);
          }
        } catch (err) {
          console.error("AI Flashcard helper failed:", err);
          toast({
            variant: "destructive",
            title: "AI Helper Offline",
            description: "Could not auto-generate definitions. You can write them manually!",
          });
        } finally {
          setIsLoadingAI(false);
        }
      };

      fetchAIContent();
    }
  }, [isModalOpen, selectedWord, contextSentence, toast]);

  const handleSaveFlashcard = async () => {
    if (!user || isGuest) return;
    if (!definition || !translation) {
      toast({
        variant: "destructive",
        title: "Incomplete Fields",
        description: "Please provide at least a definition and translation.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const newCard = {
        word: selectedWord,
        definition,
        translation,
        exampleSentence: example,
        hint,
        context: contextSentence,
        emoji: emoji.trim(),
        createdAt: new Date().toISOString(),
        nextReviewDate: new Date().toISOString(),
        intervalDays: 1,
        box: 1,
      };

      await addDoc(collection(firestore, `users/${user.uid}/flashcards`), newCard);

      toast({
        title: "Flashcard Created!",
        description: `Successfully added "${selectedWord}" to your review deck.`,
      });
      setIsModalOpen(false);
      setFloatingCoords(null);
    } catch (err: any) {
      console.error("Failed to save flashcard:", err);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: `Could not save card: ${err?.message || err}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const wordCount = article.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const keyVocab = extractKeyVocabulary(article.content);

  return (
    <div className="relative min-h-[85vh] w-full py-4 px-2 md:px-6">
      <ConstellationCanvas />
      
      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        
        {/* Back navigation */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <Button asChild variant="outline" className="bg-slate-900/60 border border-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl backdrop-blur-sm transition-all duration-300 shadow-md">
            <Link href="/reader" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Back to Graded Reader Library
            </Link>
          </Button>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-300 bg-slate-900/60 border border-slate-800 px-3.5 py-1.5 rounded-xl backdrop-blur-sm select-none">
            <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-bold uppercase text-[10px]">
              {levelLabel}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
              {wordCount} words
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-pink-400" />
              {readingTime} min read
            </span>
          </div>
        </div>

        {/* Article content block */}
        <article className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 overflow-hidden">
          <ArticleViewTracker article={article} />

          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
              <GraduationCap className="w-4 h-4" />
              <span>CEFR Graded ESL Reading Passage &amp; Study Guide</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight font-sans bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              {article.title}
            </h1>
            <p className="text-base md:text-lg text-slate-300 font-medium leading-relaxed border-l-2 border-indigo-500/50 pl-4">
              {article.description}
            </p>
          </header>

          {/* Featured Image */}
          <div className="relative w-full h-[240px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 group">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              data-ai-hint={article.imageHint}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
          </div>
          
          {/* Prose Content */}
          <div 
            id="article-content-container"
            className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-6 md:p-8 cursor-text"
          >
            <div className="text-slate-100 text-base md:text-lg leading-relaxed whitespace-pre-line font-medium antialiased space-y-4 selection:bg-indigo-500/30 selection:text-white">
              {article.content}
            </div>
          </div>

          {/* Pedagogical Study Guide & Comprehension Analysis */}
          <div className="space-y-6 pt-4 border-t border-white/10">
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 font-mono">
                Curriculum Study Notes
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Vocabulary &amp; Reading Comprehension Guide
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                This reading selection is structured for <strong>{levelLabel}</strong> English learners to build lexical fluency, contextual inference, and syntactic awareness. Review the target vocabulary items and comprehension questions below after reading the passage.
              </p>
            </div>

            {/* Key Vocabulary Table */}
            {keyVocab.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 overflow-hidden">
                <div className="px-4 py-3 bg-slate-900/80 border-b border-white/10 text-xs font-black uppercase tracking-wider text-cyan-300">
                  Target Lexical Items in &ldquo;{article.title}&rdquo;
                </div>
                <div className="divide-y divide-white/5">
                  {keyVocab.map((item) => (
                    <div key={item.word} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-black text-white">{item.word}</span>
                        <span className="ml-2 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-400/20">
                          {item.partOfSpeech}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 max-w-xl">{item.usageNote}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comprehension & Critical Thinking Prompts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-indigo-500/25 bg-indigo-950/20 space-y-3">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <h3>Comprehension &amp; Recall Check</h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
                  <li>Summarize the main idea or central event of <em>{article.title}</em> in two complete sentences using your own words.</li>
                  <li>Identify three key verbs or transition phrases the author uses to connect ideas across paragraphs.</li>
                  <li>What specific details or examples in the passage support the main theme?</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl border border-teal-500/25 bg-teal-950/20 space-y-3">
                <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
                  <MessageSquare className="w-4 h-4 text-teal-400" />
                  <h3>Classroom &amp; Self-Study Extension</h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
                  <li><strong>Shadow Reading:</strong> Read the passage aloud twice, focusing on natural sentence stress and pausing at punctuation marks.</li>
                  <li><strong>Spaced Repetition:</strong> Highlight any unfamiliar word in the text above to generate an SM-2 Flashcard for your review deck.</li>
                  <li><strong>Written Response:</strong> Write a short 50-word reflection connecting this topic to your own daily life or perspective.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Related Reading Passages */}
          {relatedArticles.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Continue Reading: More Graded ESL Passages
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/reader/${rel.slug}`}
                    className="group p-4 rounded-2xl border border-white/10 bg-slate-950/60 hover:border-cyan-400/40 transition-all flex flex-col justify-between gap-2"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {rel.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {rel.description}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-cyan-400 inline-flex items-center gap-1 mt-2">
                      Read Passage &rarr;
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>

      {/* Floating Sparkles create card tooltip */}
      {floatingCoords && (
        <div
          className={cn(
            "fixed z-50 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs py-2 px-3.5 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center gap-2 hover:from-purple-500 hover:to-indigo-500 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer select-none border border-indigo-400/20",
            floatingCoords.isBelow ? "translate-y-0" : "-translate-y-full"
          )}
          style={{
            left: `${floatingCoords.x}px`,
            top: `${floatingCoords.y}px`,
          }}
          onClick={() => setIsModalOpen(true)}
        >
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Create Flashcard</span>
        </div>
      )}

      {/* Creation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Create AI Flashcard
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">
              Convert the word &ldquo;{selectedWord}&rdquo; into a spaced-repetition study card.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-3 space-y-1">
                <Label className="text-xs font-bold text-slate-400">Word or Phrase</Label>
                <Input
                  value={selectedWord}
                  onChange={(e) => setSelectedWord(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
              <div className="col-span-1 space-y-1">
                <Label className="text-xs font-bold text-slate-400">Emoji</Label>
                <Input
                  placeholder="✨"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white text-center text-lg"
                />
              </div>
            </div>
            
            <div className="space-y-1 relative">
              <Label className="text-xs font-bold text-slate-400 flex justify-between">
                <span>Definition</span>
                {isLoadingAI && <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />}
              </Label>
              <Textarea
                placeholder={isLoadingAI ? "AI is translating and defining..." : "Enter simple English definition"}
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                rows={2}
                className="bg-slate-950 border-slate-800 text-white resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-400">Translation / Synonym</Label>
              <Input
                placeholder={isLoadingAI ? "Analyzing translation..." : "e.g. คำอธิบาย / synonym"}
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-400">Example Sentence</Label>
              <Textarea
                placeholder="Example showing how it is used..."
                value={example}
                onChange={(e) => setExample(e.target.value)}
                rows={2}
                className="bg-slate-950 border-slate-800 text-white resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-400">Mnemonic / Memory Hint</Label>
              <Input
                placeholder="A creative memory aid..."
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveFlashcard}
              disabled={isSaving || isLoadingAI}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSaving ? "Saving..." : "Save Flashcard"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
