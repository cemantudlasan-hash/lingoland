import { useState } from "react";
import { 
  Trophy, Lock, ArrowLeft, Check, ArrowRight, 
  HelpCircle, RefreshCw, Award, ShieldAlert, FileText, CheckCircle2, Sparkles, BookOpen
} from "lucide-react";
import { UserStats, TargetLanguage } from "../types";
import { languageExams, ExamQuestion } from "../data/languageExams";
import LanguageCertificate from "./LanguageCertificate";

export interface ExamLangMeta {
  code: string;
  key: string;
  name: string;
  flag: string;
  description: string;
  gradient: string;
}

export const EXAM_LANGUAGES: ExamLangMeta[] = [
  { code: 'th', key: 'thai', name: 'Thai', flag: '🇹🇭', description: 'Consonants, 5 tones, vowel signs & daily etiquette', gradient: 'from-amber-600 to-rose-600' },
  { code: 'ko', key: 'korean', name: 'Korean', flag: '🇰🇷', description: 'Hangul syllable blocks, batchim, honorifics & K-culture', gradient: 'from-blue-600 to-rose-600' },
  { code: 'ja', key: 'japanese', name: 'Japanese', flag: '🇯🇵', description: 'Hiragana, Katakana, basic Kanji & conversational particles', gradient: 'from-rose-600 to-red-600' },
  { code: 'en', key: 'english', name: 'English', flag: '🇬🇧', description: 'Tenses, modals, subjunctive, idioms & pronunciation phonemes', gradient: 'from-blue-700 to-indigo-600' },
  { code: 'fr', key: 'french', name: 'French', flag: '🇫🇷', description: 'Gender agreements, Passé Composé, subjunctive & nasal sounds', gradient: 'from-blue-600 to-cyan-600' },
  { code: 'es', key: 'spanish', name: 'Spanish', flag: '🇪🇸', description: 'Ser vs. Estar, Por vs. Para, subjunctive & rolling R phonetics', gradient: 'from-amber-500 to-red-600' },
  { code: 'zh', key: 'chinese', name: 'Chinese', flag: '🇨🇳', description: 'Pinyin, 4 tones + neutral, stroke orders & measure words', gradient: 'from-red-600 to-amber-600' },
  { code: 'vi', key: 'vietnamese', name: 'Vietnamese', flag: '🇻🇳', description: '6 distinct tones, diacritics, pronouns & ordering patterns', gradient: 'from-yellow-500 to-red-600' },
  { code: 'de', key: 'german', name: 'German', flag: '🇩🇪', description: 'Der/Die/Das cases (Nom, Acc, Dat, Gen) & compound nouns', gradient: 'from-slate-700 to-amber-600' },
];

interface ExamContainerProps {
  currentLanguage: TargetLanguage;
  stats: UserStats;
  onExamCompleted: (langCode: string, score: number, passed: boolean) => Promise<void>;
  onBack: () => void;
  user?: any;
}

export default function ExamContainer({
  currentLanguage,
  stats,
  onExamCompleted,
  onBack,
  user
}: ExamContainerProps) {
  // Determine initial exam from currentLanguage
  const [activeExamKey, setActiveExamKey] = useState<string>(() => {
    const match = EXAM_LANGUAGES.find(l => l.code === currentLanguage.code);
    return match ? match.key : 'thai';
  });

  const activeExam = EXAM_LANGUAGES.find(l => l.key === activeExamKey) || EXAM_LANGUAGES[0];

  const [examState, setExamState] = useState<'idle' | 'loading' | 'taking' | 'finished'>('idle');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Certificate Modal State
  const [showCert, setShowCert] = useState(false);
  const [lastFinishedScore, setLastFinishedScore] = useState<number | null>(null);

  // Stats for the active exam language
  const attemptInfo = stats.examAttempts?.[activeExam.code];
  const isPassed = (stats.passedExams?.includes(activeExam.code) || stats.passedExams?.includes(activeExam.key) || (attemptInfo?.score ?? 0) >= 30);
  const bestScore = attemptInfo ? attemptInfo.score : (isPassed ? 40 : null);

  // Start the exam for the currently selected active language
  const startExam = () => {
    setExamState('loading');
    setCurrentQuestionIdx(0);
    setAnswers({});
    setSelectedOption(null);

    const loadedQuestions = languageExams[activeExam.key] || languageExams.thai || [];
    setQuestions(loadedQuestions);
    setExamState('taking');
  };

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
    setAnswers(prev => ({ ...prev, [currentQuestionIdx]: idx }));
  };

  const handleNext = async () => {
    if (currentQuestionIdx + 1 < questions.length) {
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      setSelectedOption(answers[nextIdx] !== undefined ? answers[nextIdx] : null);
    } else {
      // Evaluate exam
      let correct = 0;
      questions.forEach((q, idx) => {
        if (answers[idx] === q.answerIndex) {
          correct++;
        }
      });

      const passingScore = Math.ceil(questions.length * 0.75); // 30 out of 40
      const passed = correct >= passingScore;
      
      setLastFinishedScore(correct);
      setExamState('loading');
      await onExamCompleted(activeExam.code, correct, passed);
      setExamState('finished');
      if (passed) {
        setShowCert(true);
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      const prevIdx = currentQuestionIdx - 1;
      setCurrentQuestionIdx(prevIdx);
      setSelectedOption(answers[prevIdx]);
    }
  };

  const activeQuestion = questions[currentQuestionIdx];
  const progressPct = Math.round(((currentQuestionIdx + 1) / (questions.length || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-slate-900 p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-900 bg-white border-2 border-slate-900 px-3.5 py-1.5 rounded-xl font-extrabold uppercase tracking-widest text-[10px] shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:-translate-y-[1px] duration-150 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-display">
            Language Certification Gateway
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border-2 border-slate-900 bg-indigo-100 text-indigo-900">
            9 Official Exams
          </span>
        </div>
      </div>

      {/* Language Exam Switcher Bar */}
      {examState === 'idle' && (
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-900 font-display flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Select Language Certification Exam:
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              {stats.passedExams?.length || 0} / {EXAM_LANGUAGES.length} Passed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
            {EXAM_LANGUAGES.map((lang) => {
              const isSelected = activeExamKey === lang.key;
              const hasPassed = stats.passedExams?.includes(lang.code) || stats.passedExams?.includes(lang.key);
              const langAttempt = stats.examAttempts?.[lang.code];

              return (
                <button
                  key={lang.key}
                  onClick={() => {
                    setActiveExamKey(lang.key);
                  }}
                  className={`relative p-2.5 rounded-xl border-2 border-slate-900 text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                      : 'bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{lang.flag}</span>
                    {hasPassed && (
                      <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`} />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase font-display block leading-none">
                      {lang.name}
                    </span>
                    <span className={`text-[8px] font-bold block mt-1 ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {hasPassed ? 'Passed 🎓' : langAttempt ? `${langAttempt.score}/40` : '40 Qs'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* --- IDLE/GATEWAY SCREEN --- */}
      {examState === 'idle' && (
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 bg-white border-2 border-slate-900 rounded-2xl p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-900 border-2 border-slate-900 px-3 py-1 rounded-full inline-block">
                  Official Assessment
                </span>
                {isPassed && (
                  <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-900 border-2 border-slate-900 px-3 py-1 rounded-full inline-block flex items-center gap-1">
                    <Check className="w-3 h-3" /> Certified Graduate
                  </span>
                )}
              </div>

              <h3 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight font-display">
                {activeExam.flag} {activeExam.name} Certification Exam
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                {activeExam.description}. Test your full proficiency across syllabus grammar, core vocabulary, sentence pronunciation, and conversational dialogues.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 pb-2">
                <div className="bg-slate-50 border-2 border-slate-900 p-3.5 rounded-xl space-y-1">
                  <span className="font-extrabold text-slate-850 text-xs flex items-center gap-1.5 font-display uppercase">
                    📝 40 Comprehensive Questions
                  </span>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Designed to test reading comprehension, phonetic tones, grammar structures, and situational fluency.
                  </p>
                </div>
                <div className="bg-slate-50 border-2 border-slate-900 p-3.5 rounded-xl space-y-1">
                  <span className="font-extrabold text-slate-850 text-xs flex items-center gap-1.5 font-display uppercase">
                    🎯 75% Passing Standard
                  </span>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Score 30/40 or higher to instantly unlock your personalized Certificate of Completion!
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t-2 border-dashed border-slate-200">
              <button
                id="start-exam-button"
                onClick={startExam}
                className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none duration-150 transition-all cursor-pointer"
              >
                <span>{bestScore !== null ? "Retake Exam (Improve Score)" : "Start 40-Question Assessment"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {isPassed && (
                <button
                  onClick={() => setShowCert(true)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black text-xs uppercase tracking-widest py-3 px-6 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none duration-150 transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>View & Download Certificate 🎓</span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: CREDENTIAL / STATUS PANEL */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                <span className="text-xs font-black uppercase text-slate-900 font-display flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  Credential Status
                </span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border border-slate-900 ${
                  isPassed ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isPassed ? 'UNLOCKED' : 'LOCKED'}
                </span>
              </div>

              {isPassed ? (
                <div className="bg-emerald-50 border-2 border-slate-900 p-5 rounded-xl space-y-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-slate-900 flex items-center justify-center text-emerald-700 mx-auto shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Trophy className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-emerald-950 text-sm font-black uppercase tracking-tight block font-display">
                      Certificate Unlocked!
                    </span>
                    <span className="text-xs text-slate-600 font-bold block mt-1">
                      Best Score: <strong className="text-emerald-700 font-black">{bestScore}/40</strong>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                    You have demonstrated exceptional mastery of {activeExam.name}. Your official certificate is ready to customize, download, or print!
                  </p>
                  <button
                    onClick={() => setShowCert(true)}
                    className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer"
                  >
                    View Certificate 🎓
                  </button>
                </div>
              ) : bestScore !== null ? (
                <div className="bg-orange-50 border-2 border-slate-900 p-4 rounded-xl space-y-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center text-orange-600 mx-auto">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-orange-900 text-xs font-black uppercase tracking-wider block font-display">Needs 30/40 to Pass</span>
                    <span className="text-[10px] text-slate-600 font-bold block mt-0.5">Best Attempt: {bestScore}/40</span>
                  </div>
                  <p className="text-[9px] text-slate-500 italic font-semibold leading-relaxed">
                    Study the {activeExam.name} lesson cards in the syllabus, then retake the exam to unlock your certificate.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 border-2 border-slate-900 p-6 rounded-xl space-y-3 text-center">
                  <Lock className="w-8 h-8 text-slate-400 mx-auto" />
                  <div>
                    <span className="text-slate-800 text-xs font-black uppercase tracking-wider block font-display">Locked Certificate</span>
                    <p className="text-[10px] text-slate-500 leading-normal max-w-[220px] mx-auto font-bold mt-1">
                      Pass the 40-question assessment with 75%+ score to generate your official certificate.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-500 leading-normal font-bold bg-white border-2 border-slate-900 p-3.5 rounded-xl flex gap-2 items-start shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <span className="text-indigo-600 text-base leading-none">💡</span>
              <p>Passing each language exam awards <strong className="text-indigo-650 font-extrabold">+500 XP bonus</strong> to your total student progress!</p>
            </div>
          </div>
        </div>
      )}

      {/* --- LOADING SCREEN --- */}
      {examState === 'loading' && (
        <div className="text-center py-24 bg-white border-2 border-slate-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4">
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <h3 className="text-sm font-black text-slate-850 uppercase tracking-widest font-display animate-pulse">
            Evaluating Certification Sheet...
          </h3>
          <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Scoring responses and validating credential integrity...
          </p>
        </div>
      )}

      {/* --- EXAM TAKING INTERFACE --- */}
      {examState === 'taking' && activeQuestion && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* LEFT: THE ACTIVE QUESTION CARD */}
          <div className="md:col-span-2 bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-6">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <span className="text-xs font-black uppercase text-slate-900 font-display flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                {activeExam.flag} {activeExam.name} Assessment
              </span>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase font-mono">
                Question {currentQuestionIdx + 1} of {questions.length}
              </span>
            </div>

            {/* Progress Bar indicator */}
            <div className="w-full bg-slate-100 rounded-full h-3 border-2 border-slate-900 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-300 border-r border-slate-900"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Question Text block */}
            <div className="space-y-4 py-2">
              <div className="bg-slate-50 border-2 border-slate-900 p-4 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 font-display">
                  Item #{currentQuestionIdx + 1}
                </label>
                <p className="text-slate-900 text-sm leading-relaxed font-extrabold">{activeQuestion.question}</p>
              </div>
            </div>

            {/* Options Button grid */}
            <div className="space-y-3.5">
              {activeQuestion.options.map((opt, oIdx) => {
                const isSelected = selectedOption === oIdx;

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full text-left p-4 rounded-xl border-2 border-slate-900 text-xs font-bold leading-relaxed flex items-start gap-4 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                        : "bg-white text-slate-900 hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-[1px]"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-lg border-2 border-slate-900 flex items-center justify-center font-display font-black text-[10px] shrink-0 ${
                      isSelected ? "bg-white text-indigo-700" : "bg-slate-100"
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <div className="space-y-1">
                      <span className="block">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons lower bar */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-slate-200">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIdx === 0}
                className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border-2 border-slate-900 font-black text-[10px] uppercase tracking-wider font-display transition-all ${
                  currentQuestionIdx > 0
                    ? "bg-white hover:bg-slate-50 text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-50"
                }`}
              >
                <span>Previous</span>
              </button>

              <button
                onClick={handleNext}
                disabled={selectedOption === null}
                className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl border-2 border-slate-900 font-black text-[10px] uppercase tracking-wider font-display transition-all ${
                  selectedOption !== null
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <span>{currentQuestionIdx + 1 < questions.length ? "Confirm & Next" : "Submit Exam Sheet"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* RIGHT: HELPFUL EXAM INSTRUCTIONS INFO */}
          <div className="md:col-span-1">
            <div className="bg-slate-950 text-white border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4 sticky top-6">
              <h4 className="font-display font-black text-[10px] uppercase tracking-widest text-indigo-400 pb-2 border-b border-slate-850">
                Exam Regulations
              </h4>
              <ul className="space-y-3.5 text-[11px] leading-relaxed text-slate-350 font-bold">
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-black text-sm leading-none">•</span>
                  <span>Select A, B, C, or D for each question. You can modify your answer before clicking "Submit Exam".</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-black text-sm leading-none">•</span>
                  <span>Use Previous and Next to navigate through the 40 questions.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-black text-sm leading-none">•</span>
                  <span>Passing locks in a permanent <strong className="text-amber-400 font-extrabold">+500 XP</strong> credential value to your classroom files.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* --- COMPLETED/FINISHED SCREEN --- */}
      {examState === 'finished' && (
        <div className="max-w-xl mx-auto bg-white border-2 border-slate-900 rounded-2xl p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-center space-y-6">
          {(lastFinishedScore ?? 0) >= 30 ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-amber-500 mx-auto border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <Trophy className="w-8 h-8 animate-bounce text-amber-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-lg uppercase tracking-tight text-slate-900">
                  Certification Passed! 🎉🎓
                </h3>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  {activeExam.name} Module assessment accomplished
                </p>
              </div>

              <div className="bg-slate-50 p-5 border-2 border-slate-900 rounded-xl space-y-1">
                <span className="text-[9px] font-black text-slate-450 tracking-widest block font-display">FINAL SCORECARD</span>
                <span className="text-4xl font-black text-indigo-700 block my-1 font-display">
                  {lastFinishedScore}/40
                </span>
                <span className="text-[11px] font-black text-emerald-600 bg-emerald-100 border-2 border-slate-900 px-3 py-0.5 rounded-lg inline-block uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                  +500 XP CREDITED
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3.5 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowCert(true)}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  View & Download Certificate 🎓
                </button>
                <button
                  onClick={() => setExamState('idle')}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs uppercase tracking-widest rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  Return to Exams Tab
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-lg uppercase tracking-tight text-slate-900">
                  Assessment Incomplete
                </h3>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  You scored {lastFinishedScore}/40
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-semibold max-w-sm mx-auto">
                A minimum score of <strong className="text-slate-850 font-extrabold">30/40 (75%)</strong> is required to pass and unlock the digital certificate. Review your lesson cards in the syllabus and try again!
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 pt-4 border-t border-slate-200">
                <button
                  onClick={startExam}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  Retake Exam
                </button>
                <button
                  onClick={() => setExamState('idle')}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs uppercase tracking-widest rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  Back to List
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- THE CERTIFICATE MODAL --- */}
      {showCert && (
        <LanguageCertificate
          language={activeExam.name}
          flag={activeExam.flag}
          score={lastFinishedScore ?? bestScore ?? 40}
          totalQuestions={40}
          userName={user?.displayName || "Lingo Student"}
          onClose={() => setShowCert(false)}
        />
      )}
    </div>
  );
}
