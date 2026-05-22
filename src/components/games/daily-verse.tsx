'use client';

import * as React from 'react';
import { 
  Newspaper, Award, Calendar, BookOpen, Clock, ChevronRight, 
  CheckCircle2, XCircle, RefreshCw, Maximize, Minimize, AlertCircle, 
  Play, ArrowLeft, Loader2, Sparkles, Check, BookmarkCheck, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { fetchNewsHeadlines, generateDailyVerse, GenerateDailyVerseOutput, NewsArticle } from '@/ai/flows/generate-daily-verse';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { logAnalyticsEvent } from '@/lib/analytics';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Badge interfaces
interface BadgeData {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  icon: string;
  gradient: string;
}

const BADGES: BadgeData[] = [
  {
    id: 'novice-reporter',
    name: 'Novice Reporter',
    description: 'Passed a Daily Verse quiz on Beginner difficulty.',
    difficulty: 'beginner',
    icon: '📰',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'global-analyst',
    name: 'Global Analyst',
    description: 'Passed a Daily Verse quiz on Intermediate difficulty.',
    difficulty: 'intermediate',
    icon: '🌍',
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'lexical-anchor',
    name: 'Lexical Anchor',
    description: 'Passed a Daily Verse quiz on Advanced difficulty.',
    difficulty: 'advanced',
    icon: '⚓',
    gradient: 'from-amber-500 to-rose-500',
  },
  {
    id: 'news-sentinel',
    name: 'News Sentinel',
    description: 'Scored 100% (4/4 correct answers) on any Daily Verse quiz.',
    difficulty: 'perfect',
    icon: '⚡',
    gradient: 'from-emerald-500 to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]',
  }
];

export function DailyVerse({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const { user } = useAuth();
  const firestore = useFirestore();

  // Component States
  const [headlines, setHeadlines] = React.useState<NewsArticle[]>([]);
  const [loadingHeadlines, setLoadingHeadlines] = React.useState(true);
  const [selectedNews, setSelectedNews] = React.useState<NewsArticle | null>(null);
  const [difficulty, setDifficulty] = React.useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [generatingArticle, setGeneratingArticle] = React.useState(false);
  const [currentArticleData, setCurrentArticleData] = React.useState<GenerateDailyVerseOutput | null>(null);
  const [gameState, setGameState] = React.useState<'lobby' | 'reading' | 'quiz' | 'results'>('lobby');

  // Quiz States
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const [answersLog, setAnswersLog] = React.useState<{ questionIndex: number; selected: string; correct: boolean }[]>([]);
  const [timeLeft, setTimeLeft] = React.useState(60);
  const [quizTimerActive, setQuizTimerActive] = React.useState(false);
  
  // Persistent tracking
  const [completedNewsIds, setCompletedNewsIds] = React.useState<string[]>([]);
  const [unlockedBadgeIds, setUnlockedBadgeIds] = React.useState<string[]>([]);

  // Sound and visual feedback
  const [showExplanation, setShowExplanation] = React.useState(false);

  // Load persistence from localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const readNews = localStorage.getItem('lingoland_daily_verse_read');
      if (readNews) {
        setCompletedNewsIds(JSON.parse(readNews));
      }
      const badges = localStorage.getItem('lingoland_daily_verse_badges');
      if (badges) {
        setUnlockedBadgeIds(JSON.parse(badges));
      }
    }
    loadHeadlines();
  }, []);

  // Timer logic for quiz
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizTimerActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && quizTimerActive) {
      handleQuizTimeout();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizTimerActive]);

  // Fetch news headlines
  const loadHeadlines = async () => {
    setLoadingHeadlines(true);
    try {
      const fetched = await fetchNewsHeadlines();
      setHeadlines(fetched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHeadlines(false);
    }
  };

  // Generate article and questions via Genkit
  const handleSelectNews = async (news: NewsArticle) => {
    setSelectedNews(news);
    setGeneratingArticle(true);
    try {
      const data = await generateDailyVerse({
        headline: news.title,
        description: news.description,
        difficulty: difficulty
      });
      setCurrentArticleData(data);
      setGameState('reading');
    } catch (err) {
      console.error("Error generating verse:", err);
      alert("Failed to generate simplified reading passage. Please try again.");
    } finally {
      setGeneratingArticle(false);
    }
  };

  const startQuiz = () => {
    setGameState('quiz');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswersLog([]);
    setTimeLeft(60);
    setShowExplanation(false);
    setQuizTimerActive(true);
  };

  const handleSelectAnswer = (option: string) => {
    if (selectedAnswer !== null) return; // Answer locked
    setSelectedAnswer(option);
    const question = currentArticleData?.questions[currentQuestionIndex];
    if (!question) return;

    const isCorrect = option === question.correctAnswer;
    setAnswersLog(prev => [
      ...prev,
      {
        questionIndex: currentQuestionIndex,
        selected: option,
        correct: isCorrect
      }
    ]);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    const questionsLength = currentArticleData?.questions.length || 0;
    if (currentQuestionIndex + 1 < questionsLength) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      endQuiz();
    }
  };

  const handleQuizTimeout = () => {
    setQuizTimerActive(false);
    // Fill remaining unanswered questions as incorrect
    const questions = currentArticleData?.questions || [];
    const logs = [...answersLog];
    for (let i = logs.length; i < questions.length; i++) {
      logs.push({
        questionIndex: i,
        selected: "TIMEOUT",
        correct: false
      });
    }
    setAnswersLog(logs);
    setGameState('results');
  };

  const endQuiz = () => {
    setQuizTimerActive(false);
    setGameState('results');

    // Calculate score
    const correctCount = answersLog.filter(l => l.correct).length;
    const totalCount = currentArticleData?.questions.length || 4;

    // Log analytics
    if (firestore) {
      logAnalyticsEvent(firestore, user?.uid || 'guest', {
        type: 'game_played',
        details: {
          slug: 'daily-verse',
          headline: selectedNews?.title,
          difficulty,
          score: correctCount,
          totalQuestions: totalCount
        }
      });
    }

    // Award Badges & Record Completed News ID
    if (selectedNews) {
      const updatedCompleted = Array.from(new Set([...completedNewsIds, selectedNews.id]));
      setCompletedNewsIds(updatedCompleted);
      localStorage.setItem('lingoland_daily_verse_read', JSON.stringify(updatedCompleted));
    }

    // Unlock badge conditions
    const newUnlocked = [...unlockedBadgeIds];
    let unlockedAny = false;

    // Standard difficulty badge
    if (correctCount >= 3) {
      const matchingBadge = BADGES.find(b => b.difficulty === difficulty);
      if (matchingBadge && !newUnlocked.includes(matchingBadge.id)) {
        newUnlocked.push(matchingBadge.id);
        unlockedAny = true;
      }
    }

    // Perfect score badge
    if (correctCount === totalCount) {
      const perfectBadge = BADGES.find(b => b.difficulty === 'perfect');
      if (perfectBadge && !newUnlocked.includes(perfectBadge.id)) {
        newUnlocked.push(perfectBadge.id);
        unlockedAny = true;
      }
    }

    if (unlockedAny) {
      setUnlockedBadgeIds(newUnlocked);
      localStorage.setItem('lingoland_daily_verse_badges', JSON.stringify(newUnlocked));
    }
  };

  const resetToLobby = () => {
    setSelectedNews(null);
    setCurrentArticleData(null);
    setGameState('lobby');
  };

  // Filter headlines to push completed ones to the bottom or let user view progress
  const sortedHeadlines = React.useMemo(() => {
    return [...headlines].sort((a, b) => {
      const aDone = completedNewsIds.includes(a.id) ? 1 : 0;
      const bDone = completedNewsIds.includes(b.id) ? 1 : 0;
      return aDone - bDone;
    });
  }, [headlines, completedNewsIds]);

  return (
    <div className="w-full min-h-[600px] flex flex-col justify-start bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md text-slate-100 p-6 relative">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800 z-10">
        <div className="flex items-center gap-3">
          <Newspaper className="h-8 w-8 text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              The Daily Verse
            </h1>
            <p className="text-xs text-slate-400">AI News Aggregator & Comprehension Quiz</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onToggleFullscreen && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFullscreen}
              className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
            >
              <Maximize className="h-4 w-4 mr-1" />
              Fullscreen
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* LOBBY STATE */}
        {gameState === 'lobby' && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex-grow flex flex-col gap-6 z-10"
          >
            {/* Top Stats & Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
                <div className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center">
                  <BookmarkCheck className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <div className="text-xl font-bold">{completedNewsIds.length}</div>
                  <div className="text-xs text-slate-400">Articles Analyzed</div>
                </div>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4 col-span-2">
                <div className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-amber-400 animate-pulse" />
                </div>
                <div className="flex-grow">
                  <div className="text-xs text-slate-400 font-semibold mb-1">Daily Verse Badges Unlocked</div>
                  <div className="flex flex-wrap gap-2">
                    {BADGES.map(badge => {
                      const isUnlocked = unlockedBadgeIds.includes(badge.id);
                      return (
                        <div
                          key={badge.id}
                          title={`${badge.name}: ${badge.description}`}
                          className={cn(
                            "px-2.5 py-1 text-[11px] font-bold rounded-full flex items-center gap-1 border transition-all duration-300",
                            isUnlocked 
                              ? `bg-gradient-to-r ${badge.gradient} text-white border-transparent`
                              : "bg-slate-950/80 text-slate-600 border-slate-800/60 filter grayscale opacity-40"
                          )}
                        >
                          <span>{badge.icon}</span>
                          <span>{badge.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Selection Setup Bar */}
            <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-sm font-semibold text-indigo-300">Reading Level Adjustment</span>
                <p className="text-xs text-slate-400">Changes the vocabulary complexity of the generated text</p>
              </div>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(['beginner', 'intermediate', 'advanced'] as const).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setDifficulty(lvl)}
                    className={cn(
                      "px-4 py-1.5 text-xs font-semibold rounded-md transition-all capitalize",
                      difficulty === lvl 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Headlines Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  Aggregated Daily Headlines
                </span>
                <Button 
                  onClick={loadHeadlines} 
                  variant="ghost" 
                  size="sm"
                  disabled={loadingHeadlines}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <RefreshCw className={cn("h-4 w-4 mr-1", loadingHeadlines && "animate-spin")} />
                  Refresh Feed
                </Button>
              </div>

              {loadingHeadlines ? (
                <div className="h-60 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                  <span className="text-slate-400 text-sm animate-pulse">Aggregating live news stories...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedHeadlines.map(news => {
                    const isDone = completedNewsIds.includes(news.id);
                    return (
                      <Card 
                        key={news.id}
                        className={cn(
                          "bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900/30 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden group",
                          isDone && "border-green-950/30 bg-slate-900/10 opacity-70"
                        )}
                        onClick={() => !generatingArticle && handleSelectNews(news)}
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-slate-900 text-indigo-400 hover:bg-slate-900 font-semibold border border-slate-800 text-[10px] uppercase">
                              {news.category}
                            </Badge>
                            {isDone && (
                              <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/10 text-[10px] flex items-center gap-1 font-semibold">
                                <Check className="h-3 w-3" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base font-bold text-slate-100 leading-snug group-hover:text-indigo-300 transition-colors">
                            {news.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {news.description}
                          </p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(news.pubDate).toLocaleDateString()}
                          </span>
                          <span className="text-indigo-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                            Analyze & Quiz
                            <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* GENERATING STATE */}
        {generatingArticle && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
              <Loader2 className="h-16 w-16 text-indigo-500 animate-spin relative" />
            </div>
            <div className="text-center max-w-sm mt-4">
              <h3 className="font-bold text-lg text-slate-200">AI Article Simplifier</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Simplifying technical concepts and language structure to <strong>{difficulty}</strong> difficulty while composing reading comprehension queries...
              </p>
            </div>
          </motion.div>
        )}

        {/* READING STATE */}
        {gameState === 'reading' && currentArticleData && (
          <motion.div
            key="reading"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-grow flex flex-col gap-6 z-10"
          >
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={resetToLobby}
                className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Aggregator
              </Button>
              <div className="flex items-center gap-2">
                <Badge className="bg-slate-900 text-slate-400 hover:bg-slate-900 border border-slate-800 text-xs">
                  {selectedNews?.category}
                </Badge>
                <Badge className="bg-indigo-600 text-white font-bold border-transparent text-xs capitalize shadow-sm shadow-indigo-600/30">
                  {difficulty} Level
                </Badge>
              </div>
            </div>

            {/* Main Reading Card */}
            <Card className="bg-slate-900/30 border border-slate-800 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <CardHeader className="p-6">
                <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {selectedNews && new Date(selectedNews.pubDate).toLocaleDateString()}
                </div>
                <CardTitle className="text-xl md:text-2xl font-extrabold text-slate-100 leading-tight">
                  {currentArticleData.headline}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="text-slate-200 text-base leading-relaxed space-y-4 font-normal text-justify tracking-wide selection:bg-indigo-500/30">
                  {currentArticleData.article.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-6 bg-slate-950/50 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <BookOpen className="h-4 w-4 text-indigo-400" />
                  <span>Read carefully. Once you start the 1-minute quiz, the clock is ticking.</span>
                </div>
                <Button
                  onClick={startQuiz}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-6 shadow-md shadow-indigo-600/20 py-5 text-sm"
                >
                  <Play className="h-4 w-4 mr-1.5 fill-white" />
                  Start Comprehension Quiz
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* QUIZ STATE */}
        {gameState === 'quiz' && currentArticleData && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-grow flex flex-col gap-6 z-10"
          >
            {/* Quiz Header Bar */}
            <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                  Question {currentQuestionIndex + 1} of {currentArticleData.questions.length}
                </span>
              </div>
              
              {/* Animated Timer */}
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-bold transition-all",
                timeLeft <= 15
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse scale-105"
                  : "bg-slate-950 text-slate-300 border-slate-800"
              )}>
                <Clock className={cn("h-4 w-4", timeLeft <= 15 && "animate-spin")} />
                <span>{timeLeft}s remaining</span>
              </div>
            </div>

            {/* Timer visual progress bar */}
            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-1000",
                  timeLeft <= 15 ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "bg-indigo-500"
                )}
                style={{ width: `${(timeLeft / 60) * 100}%` }}
              />
            </div>

            {/* Question Panel */}
            {(() => {
              const currentQuestion = currentArticleData.questions[currentQuestionIndex];
              return (
                <div className="flex flex-col gap-6">
                  <h2 className="text-lg md:text-xl font-bold text-slate-100 leading-snug">
                    {currentQuestion.question}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = selectedAnswer === option;
                      const isCorrectAnswer = option === currentQuestion.correctAnswer;
                      const hasAnswered = selectedAnswer !== null;

                      let btnStyle = "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200";
                      if (hasAnswered) {
                        if (isCorrectAnswer) {
                          btnStyle = "bg-green-500/10 border-green-500/40 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.1)]";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-500/10 border-rose-500/40 text-rose-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
                        } else {
                          btnStyle = "bg-slate-950/40 border-slate-900 text-slate-500 filter opacity-60";
                        }
                      } else {
                        btnStyle += " hover:bg-slate-900/40";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={hasAnswered}
                          onClick={() => handleSelectAnswer(option)}
                          className={cn(
                            "w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all duration-300 flex items-start justify-between gap-3 relative overflow-hidden",
                            btnStyle
                          )}
                        >
                          <span>{option}</span>
                          {hasAnswered && isCorrectAnswer && (
                            <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                          )}
                          {hasAnswered && isSelected && !isCorrectAnswer && (
                            <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Explanation Display */}
                  <AnimatePresence>
                    {showExplanation && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                          "border rounded-xl p-4 text-xs leading-relaxed flex items-start gap-3",
                          selectedAnswer === currentQuestion.correctAnswer
                            ? "bg-green-500/5 border-green-500/20 text-green-300/90"
                            : "bg-rose-500/5 border-rose-500/20 text-rose-300/90"
                        )}
                      >
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <div>
                          <div className="font-bold mb-0.5">
                            {selectedAnswer === currentQuestion.correctAnswer ? "Correct Answer!" : "Incorrect Answer"}
                          </div>
                          <div>{currentQuestion.explanation}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Nav Button */}
                  {selectedAnswer !== null && (
                    <div className="flex justify-end mt-2">
                      <Button
                        onClick={handleNextQuestion}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4"
                      >
                        {currentQuestionIndex + 1 === currentArticleData.questions.length ? "Finish Quiz" : "Next Question"}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* RESULTS STATE */}
        {gameState === 'results' && currentArticleData && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex-grow flex flex-col items-center justify-center text-center gap-6 py-8 z-10"
          >
            {/* Score Ring */}
            {(() => {
              const correctCount = answersLog.filter(l => l.correct).length;
              const totalCount = currentArticleData.questions.length;
              const passed = correctCount >= 3;
              const percent = (correctCount / totalCount) * 100;

              return (
                <div className="flex flex-col items-center gap-4 max-w-md w-full">
                  <div className="relative flex items-center justify-center">
                    {/* Pulsing ring */}
                    <div className={cn(
                      "absolute inset-0 rounded-full blur-xl filter opacity-20 animate-pulse",
                      passed ? "bg-emerald-500" : "bg-rose-500"
                    )} />
                    <div className={cn(
                      "w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center font-black relative bg-slate-950/80 shadow-inner",
                      passed ? "border-emerald-500 text-emerald-400" : "border-rose-500 text-rose-400"
                    )}>
                      <span className="text-4xl">{correctCount}/{totalCount}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Score</span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-100">
                      {correctCount === totalCount
                        ? "Perfect Performance!"
                        : passed
                          ? "Quiz Passed!"
                          : "Quiz Unsuccessful"}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {correctCount === totalCount
                        ? "Outstanding! You fully comprehended the details of today's news article."
                        : passed
                          ? "Great work! You scored high enough to claim the badges for this difficulty level."
                          : "Take a closer look at the passage next time and try to extract the main supporting details."}
                    </p>
                  </div>

                  {/* Earned Badges Alert */}
                  {passed && (
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 w-full flex flex-col items-center gap-2.5 mt-2">
                      <div className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5 animate-bounce">
                        <Flame className="h-4 w-4 fill-amber-400" />
                        Achievements Unlocked!
                      </div>
                      <div className="flex flex-wrap justify-center gap-3">
                        {BADGES.map(badge => {
                          const correctBadge = badge.difficulty === difficulty || (badge.difficulty === 'perfect' && correctCount === totalCount);
                          if (!correctBadge) return null;

                          return (
                            <motion.div
                              key={badge.id}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={cn(
                                "px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 border bg-gradient-to-r text-white border-transparent",
                                badge.gradient
                              )}
                            >
                              <span className="text-lg">{badge.icon}</span>
                              <span className="flex flex-col items-start leading-none">
                                <span className="font-bold">{badge.name}</span>
                                <span className="text-[8px] text-white/70 font-medium">Badge Awarded</span>
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Summary Breakdown Logs */}
                  <div className="w-full flex flex-col gap-2 mt-4 text-left">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider pl-1">Question Log</span>
                    {answersLog.map((log, index) => {
                      const question = currentArticleData.questions[log.questionIndex];
                      return (
                        <div 
                          key={index} 
                          className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-3 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="truncate pr-4 flex-grow">
                            <div className="font-bold text-slate-300 truncate">{question.question}</div>
                            <div className="text-slate-500 truncate mt-0.5">Your answer: {log.selected}</div>
                          </div>
                          {log.correct ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer buttons */}
                  <div className="flex w-full gap-3 mt-4">
                    <Button
                      variant="outline"
                      onClick={resetToLobby}
                      className="flex-grow bg-slate-900 border-slate-800 text-slate-300 hover:text-white py-5 font-bold"
                    >
                      Return to Feed
                    </Button>
                    <Button
                      onClick={startQuiz}
                      className="flex-grow bg-indigo-600 hover:bg-indigo-500 text-white py-5 font-bold"
                    >
                      <RefreshCw className="h-4 w-4 mr-1.5" />
                      Retake Quiz
                    </Button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
