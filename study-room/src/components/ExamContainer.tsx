import { useState, useEffect } from "react";
import { 
  Trophy, Lock, ArrowLeft, Languages, Check, ArrowRight, 
  HelpCircle, RefreshCw, Award, ShieldAlert, FileText, Printer, X, Download
} from "lucide-react";
import { UserStats, TargetLanguage } from "../types";
import { EXAM_QUESTIONS } from "../examsData";

interface ExamContainerProps {
  currentLanguage: TargetLanguage;
  stats: UserStats;
  onExamCompleted: (langCode: string, score: number, passed: boolean) => Promise<void>;
  onBack: () => void;
}

interface TranslatedQuestion {
  question: string;
  options: string[];
  explanation: string;
}

export default function ExamContainer({
  currentLanguage,
  stats,
  onExamCompleted,
  onBack
}: ExamContainerProps) {
  const [examState, setExamState] = useState<'idle' | 'loading' | 'taking' | 'finished'>('idle');
  const [questions, setQuestions] = useState<TranslatedQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // Translation & view modes
  const [translating, setTranslating] = useState(false);
  const [viewMode, setViewMode] = useState<'english' | 'bilingual'>('bilingual');
  const [translateError, setTranslateError] = useState<string | null>(null);

  // Certificate Modal State
  const [showCert, setShowCert] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Fetch translation for exam when starting
  const startExam = async () => {
    setExamState('loading');
    setTranslating(true);
    setTranslateError(null);
    setCurrentQuestionIdx(0);
    setAnswers({});
    setSelectedOption(null);

    // If English is selected, no translation needed
    if (currentLanguage.code === 'en') {
      const formatted = EXAM_QUESTIONS.map(q => ({
        question: q.question,
        options: q.options,
        explanation: q.explanation
      }));
      setQuestions(formatted);
      setExamState('taking');
      setTranslating(false);
      return;
    }

    try {
      const res = await fetch("/api/translate-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetLang: currentLanguage.code,
          targetLangName: currentLanguage.name,
        }),
      });

      if (!res.ok) {
        throw new Error("Exam translation failed");
      }

      const data = await res.json();
      setQuestions(data);
      setExamState('taking');
    } catch (err) {
      console.warn("Failed fetching exam translation, using English fallback:", err);
      setTranslateError("Translation unavailable. Questions will display in English.");
      const formatted = EXAM_QUESTIONS.map(q => ({
        question: q.question,
        options: q.options,
        explanation: q.explanation
      }));
      setQuestions(formatted);
      setExamState('taking');
    } finally {
      setTranslating(false);
    }
  };

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
    setAnswers(prev => ({ ...prev, [currentQuestionIdx]: idx }));
  };

  const handleNext = async () => {
    if (currentQuestionIdx + 1 < EXAM_QUESTIONS.length) {
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      setSelectedOption(answers[nextIdx] !== undefined ? answers[nextIdx] : null);
    } else {
      // Evaluate exam
      let correct = 0;
      EXAM_QUESTIONS.forEach((q, idx) => {
        if (answers[idx] === q.answerIndex) {
          correct++;
        }
      });

      const passed = correct >= 25; // Passing grade is 25
      
      setExamState('loading');
      await onExamCompleted(currentLanguage.code, correct, passed);
      setExamState('finished');
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      const prevIdx = currentQuestionIdx - 1;
      setCurrentQuestionIdx(prevIdx);
      setSelectedOption(answers[prevIdx]);
    }
  };

  const attemptInfo = stats.examAttempts?.[currentLanguage.code];
  const isPassed = stats.passedExams?.includes(currentLanguage.code) || false;
  const bestScore = attemptInfo ? attemptInfo.score : null;

  const currentQuestion = EXAM_QUESTIONS[currentQuestionIdx];
  const translatedQuestion = questions[currentQuestionIdx];

  const progressPct = Math.round(((currentQuestionIdx + 1) / EXAM_QUESTIONS.length) * 100);

  // Helper to get formatted certificate credential hash
  const getCertId = () => {
    const codePart = currentLanguage.code.toUpperCase();
    return `LLD-CERT-${codePart}-939${bestScore || 25}-A`;
  };

  // Helper to trigger certificate print
  const handlePrintCert = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Printing Style overrides for clean neobrutalist credential layout */}
      {showCert && (
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden !important;
            }
            .print-overlay, .print-overlay * {
              visibility: visible !important;
            }
            .print-overlay {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: 100% !important;
              background: #fdfbf7 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .print-card {
              border: 8px double #d97706 !important;
              background-color: #fdfbf7 !important;
              color: #1c1917 !important;
              box-shadow: none !important;
              width: 100% !important;
              max-width: 800px !important;
              padding: 4rem !important;
              box-sizing: border-box !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}} />
      )}

      {/* Navigation and Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-slate-900 p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-900 bg-white border-2 border-slate-900 px-3.5 py-1.5 rounded-xl font-extrabold uppercase tracking-widest text-[10px] shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:-translate-y-[1px] duration-150 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Back to Dashboard</span>
        </button>

        {examState === 'taking' && (
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider font-display">Bilingual Mode:</span>
            <div className="flex gap-1.5 p-1 bg-slate-100 border-2 border-slate-900 rounded-xl">
              <button
                onClick={() => setViewMode('english')}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg cursor-pointer transition-all ${
                  viewMode === 'english' ? 'bg-slate-900 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                English Only
              </button>
              <button
                onClick={() => setViewMode('bilingual')}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg cursor-pointer transition-all ${
                  viewMode === 'bilingual' ? 'bg-slate-900 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Bilingual
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- IDLE/GATEWAY SCREEN --- */}
      {examState === 'idle' && (
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 bg-white border-2 border-slate-900 rounded-2xl p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-900 border-2 border-slate-900 px-3 py-1 rounded-full w-fit inline-block">
                Certification Portal
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight font-display">
                {currentLanguage.flag} {currentLanguage.name} Module Exam
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                Test your thorough knowledge of LingoLand syllabus topics. This final exam includes grammar constructions, corporate vocabulary, dialogue interactions, and phonetic accent rules.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 pb-2">
                <div className="bg-slate-50 border-2 border-slate-900 p-3.5 rounded-xl text-left space-y-1">
                  <span className="font-extrabold text-slate-850 text-xs flex items-center gap-1.5 font-display uppercase">
                    📝 Exam Specs
                  </span>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    30 multiple-choice questions covering all modules.
                  </p>
                </div>
                <div className="bg-slate-50 border-2 border-slate-900 p-3.5 rounded-xl text-left space-y-1">
                  <span className="font-extrabold text-slate-850 text-xs flex items-center gap-1.5 font-display uppercase">
                    🎓 Passing Target
                  </span>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Score <strong className="text-indigo-600 font-extrabold">25/30 (83%)</strong> or higher to unlock your Certificate.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-slate-900 border-dashed">
              <button
                onClick={startExam}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none duration-150 transition-all cursor-pointer"
              >
                <span>Start Certification Exam</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-100 border-2 border-slate-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="font-display font-black text-xs uppercase tracking-wider text-slate-900 border-b border-dashed border-slate-350 pb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                Your Certificate Status
              </h4>

              {isPassed ? (
                <div className="bg-emerald-50 border-2 border-slate-900 p-4 rounded-xl space-y-3.5 text-center shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
                    <Check className="w-5 h-5 font-black" />
                  </div>
                  <div>
                    <span className="text-emerald-900 text-xs font-black uppercase tracking-wider block font-display">Module Complete!</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-0.5">Best Score: {bestScore}/30</span>
                  </div>
                  <button
                    onClick={() => setShowCert(true)}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white border-2 border-slate-900 rounded-xl font-extrabold text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    View Certificate 🎓
                  </button>
                </div>
              ) : bestScore !== null ? (
                <div className="bg-orange-50 border-2 border-slate-900 p-4 rounded-xl space-y-3.5 text-center">
                  <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center text-orange-600 mx-auto shadow-inner">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-orange-900 text-xs font-black uppercase tracking-wider block font-display">Exam Incomplete</span>
                    <span className="text-[10px] text-slate-550 font-bold block mt-0.5">Best Attempt: {bestScore}/30 (Needs 25+)</span>
                  </div>
                  <p className="text-[9px] text-slate-500 italic font-semibold leading-relaxed">
                    Study the syllabus cards to prepare, then retake the exam to unlock your credential certificate.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 border-2 border-slate-900 p-6 rounded-xl space-y-3 text-center opacity-80">
                  <Lock className="w-8 h-8 text-slate-400 mx-auto" />
                  <div>
                    <span className="text-slate-800 text-xs font-black uppercase tracking-wider block font-display">Locked Certificate</span>
                    <p className="text-[9px] text-slate-500 leading-normal max-w-[200px] mx-auto font-bold mt-1">
                      Pass the 30-question assessment to generate a printable PDF certificate of proficiency.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-500 leading-normal font-bold bg-white border-2 border-slate-900 p-3.5 rounded-xl flex gap-2 items-start shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <span className="text-indigo-600 text-base leading-none">💡</span>
              <p>Passing the exam awards you a massive <strong className="text-indigo-650 font-extrabold">+500 XP</strong> bonus credit to level up your pet and boost your league rank!</p>
            </div>
          </div>
        </div>
      )}

      {/* --- LOADING SCREEN --- */}
      {examState === 'loading' && (
        <div className="text-center py-24 bg-white border-2 border-slate-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4">
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <h3 className="text-sm font-black text-slate-850 uppercase tracking-widest font-display animate-pulse">
            {translating ? "Translating Exam Module..." : "Scoring Certification Sheet..."}
          </h3>
          <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Please stand by. We are verifying target language translation structures or evaluating credential integrity.
          </p>
        </div>
      )}

      {/* --- EXAM TAKING INTERFACE --- */}
      {examState === 'taking' && currentQuestion && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* LEFT: THE ACTIVE QUESTION CARD */}
          <div className="md:col-span-2 bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-6">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <span className="text-xs font-black uppercase text-slate-900 font-display flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                Assessment Sheet
              </span>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase font-mono">
                Progress: {currentQuestionIdx + 1}/30
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
                <label className="text-[9px] font-black text-slate-550 uppercase tracking-widest block mb-1.5 font-display">English master</label>
                <p className="text-slate-900 text-sm leading-relaxed font-extrabold">{currentQuestion.question}</p>
              </div>

              {viewMode === 'bilingual' && translatedQuestion && currentLanguage.code !== 'en' && (
                <div className="bg-indigo-50 border-2 border-slate-900 p-4 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                  <label className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block mb-1.5 font-display">{currentLanguage.name}</label>
                  <p className="text-slate-900 text-sm leading-relaxed font-extrabold">{translatedQuestion.question}</p>
                </div>
              )}
            </div>

            {/* Options Button grid */}
            <div className="space-y-3.5">
              {currentQuestion.options.map((opt, oIdx) => {
                const isSelected = selectedOption === oIdx;
                const translatedOpt = translatedQuestion?.options?.[oIdx];

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
                      {viewMode === 'bilingual' && translatedOpt && currentLanguage.code !== 'en' && (
                        <span className={`text-[10px] italic font-sans block font-semibold leading-snug ${
                          isSelected ? "text-indigo-200" : "text-indigo-600"
                        }`}>
                          {translatedOpt}
                        </span>
                      )}
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
                    ? "bg-indigo-650 hover:bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <span>{currentQuestionIdx + 1 < EXAM_QUESTIONS.length ? "Confirm & Next" : "Submit Exam Sheet"}</span>
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
                  <span>Use the "Previous" and "Next" buttons to cycle through questions to check your responses.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-black text-sm leading-none">•</span>
                  <span>Passing locks in a permanent <strong className="text-amber-400 font-extrabold">+500 XP</strong> credential value to your classroom files.</span>
                </li>
              </ul>

              {translateError && (
                <div className="bg-amber-950/60 border border-amber-500/20 p-3 rounded-xl flex gap-2 text-[10px] text-amber-300 font-semibold mt-4">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>{translateError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- COMPLETED/FINISHED SCREEN --- */}
      {examState === 'finished' && attemptInfo && (
        <div className="max-w-xl mx-auto bg-white border-2 border-slate-900 rounded-2xl p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-center space-y-6">
          {attemptInfo.passed ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-amber-500 mx-auto border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <Trophy className="w-8 h-8 animate-bounce text-amber-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-lg uppercase tracking-tight text-slate-900">
                  Certification Passed! 🎉🎓
                </h3>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  {currentLanguage.name} Module assessment accomplished
                </p>
              </div>

              <div className="bg-slate-50 p-5 border-2 border-slate-900 rounded-xl space-y-1">
                <span className="text-[9px] font-black text-slate-450 tracking-widest block font-display">FINAL SCORECARD</span>
                <span className="text-4xl font-black text-indigo-755 block my-1 font-display">
                  {attemptInfo.score}/30
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
                  View Certificate 🎓
                </button>
                <button
                  onClick={onBack}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs uppercase tracking-widest rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  Close Gateway
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
                  Assessment Failed
                </h3>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  You scored {attemptInfo.score}/30
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-semibold max-w-sm mx-auto">
                A minimum score of <strong className="text-slate-850 font-extrabold">25/30 (83%)</strong> is required to pass and unlock the digital certificate. Review your lesson cards in the syllabus and try again!
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 pt-4 border-t border-slate-200">
                <button
                  onClick={startExam}
                  className="flex-1 py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  Retake Exam
                </button>
                <button
                  onClick={onBack}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs uppercase tracking-widest rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  Exit Portal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- THE PRINTABLE CERTIFICATE VIEW MODAL OVERLAY --- */}
      {showCert && (
        <div 
          onClick={() => setShowCert(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 print-overlay animate-fade-in no-print-bg-override"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-zinc-950 border-2 border-slate-900 rounded-3xl p-8 shadow-[0_25px_70px_rgba(99,102,241,0.2)] text-zinc-150 text-center space-y-6 overflow-y-auto max-h-[90vh] print-card animate-zoom-in"
          >
            {/* Elegant inner double border matching certificate standard */}
            <div className="absolute inset-4 rounded-2xl border-2 border-double border-zinc-800/80 pointer-events-none z-0 print-border" />
            
            <div className="relative z-10 space-y-6">
              {/* Certificate Header block */}
              <div className="space-y-2">
                <div className="flex justify-center no-print">
                  <Award className="h-14 w-14 text-amber-500 animate-pulse" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-widest text-zinc-200 font-display">
                  Certificate of Proficiency
                </h2>
                <p className="text-[10px] text-zinc-550 font-bold uppercase tracking-widest">
                  LingoLandVerse Educational Consortium
                </p>
              </div>

              <div className="h-px w-2/3 mx-auto bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

              {/* Certificate recipient and details */}
              <div className="space-y-4">
                <p className="text-[11px] text-zinc-450 italic">
                  This verified credential is proud to declare that
                </p>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white capitalize drop-shadow-[0_2px_10px_rgba(168,85,247,0.25)] py-1 font-display">
                  LingoLand Explorer
                </h3>
                <p className="text-[11px] text-zinc-400 max-w-md mx-auto leading-relaxed">
                  has successfully passed the comprehensive assessment for the partner certified credential of
                </p>
                <div className="py-2.5 px-4 bg-zinc-900/60 rounded-2xl border border-zinc-850 inline-block print-badge">
                  <span className="text-sm font-black uppercase tracking-wider text-amber-500">
                    {currentLanguage.name} Module Graduation
                  </span>
                  <span className="text-[10px] text-zinc-450 font-bold ml-2 font-mono">(Score: {bestScore || 25}/30)</span>
                </div>
              </div>

              {/* Issuing credentials details footer */}
              <div className="flex justify-between items-center pt-6 border-t border-zinc-900/60 max-w-xl mx-auto w-full text-left gap-8">
                <div className="space-y-1">
                  <p className="text-[9px] text-zinc-550 font-extrabold uppercase tracking-wider">Credential ID</p>
                  <p className="text-[10px] text-zinc-300 font-mono font-bold">{getCertId()}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[9px] text-zinc-550 font-extrabold uppercase tracking-wider">Issuing Body</p>
                  <p className="text-[10px] text-indigo-400 font-bold">LingoLand Academy Consortium</p>
                </div>
              </div>

              {/* Actions row inside popup overlay */}
              <div className="pt-4 flex gap-3 justify-center no-print">
                <button
                  onClick={handlePrintCert}
                  className="h-10 px-4 text-xs font-black uppercase tracking-wider border-2 border-slate-900 bg-white hover:bg-slate-50 text-slate-900 rounded-xl flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[0.5px] active:shadow-none duration-100 cursor-pointer"
                >
                  <Printer className="h-4 w-4 text-indigo-600" />
                  <span>{isPrinting ? "Printing..." : "Print / PDF Cert"}</span>
                </button>
                <button
                  onClick={() => setShowCert(false)}
                  className="h-10 px-4 text-xs font-black uppercase tracking-wider border-2 border-slate-900 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[0.5px] active:shadow-none duration-100 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  <span>Close Viewer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
