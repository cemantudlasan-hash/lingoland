import { useState } from "react";
import { BookOpen, Brain, Headphones, Mic, Sparkles, CheckCircle2, ChevronRight, Search, Globe, MessageCircle } from "lucide-react";
import { Lesson, LC_Category, LC_Level, UserStats, TargetLang } from "../types";
import LanguageCertificate from "./LanguageCertificate";

interface CategoryNavigatorProps {
  lessons: Lesson[];
  stats: UserStats;
  selectedCategory: LC_Category | "all";
  setSelectedCategory: (cat: LC_Category | "all") => void;
  selectedLevel: LC_Level | "all";
  setSelectedLevel: (level: LC_Level | "all") => void;
  onSelectLesson: (lesson: Lesson) => void;
}

const LANG_META: Record<TargetLang, { flag: string; name: string; color: string; bg: string }> = {
  thai:       { flag: "🇹🇭", name: "Thai",       color: "text-blue-700",   bg: "bg-blue-50 border-blue-700" },
  korean:     { flag: "🇰🇷", name: "Korean",     color: "text-red-700",    bg: "bg-red-50 border-red-700" },
  japanese:   { flag: "🇯🇵", name: "Japanese",   color: "text-rose-700",   bg: "bg-rose-50 border-rose-700" },
  french:     { flag: "🇫🇷", name: "French",     color: "text-sky-700",    bg: "bg-sky-50 border-sky-700" },
  spanish:    { flag: "🇪🇸", name: "Spanish",    color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-700" },
  chinese:    { flag: "🇨🇳", name: "Chinese",    color: "text-orange-700", bg: "bg-orange-50 border-orange-700" },
  vietnamese: { flag: "🇻🇳", name: "Vietnamese", color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-700" },
  german:     { flag: "🇩🇪", name: "German",     color: "text-violet-750", bg: "bg-violet-50 border-violet-700" },
};

export default function CategoryNavigator({
  lessons,
  stats,
  selectedCategory,
  setSelectedCategory,
  selectedLevel,
  setSelectedLevel,
  onSelectLesson,
}: CategoryNavigatorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mainTab, setMainTab] = useState<"syllabus" | "languages">("syllabus");
  const [activeLang, setActiveLang] = useState<TargetLang | "all">("all");
  const [certLang, setCertLang] = useState<TargetLang | null>(null);

  const categories: Array<{ id: LC_Category | "all"; label: string; icon: any }> = [
    { id: "all", label: "All Lessons", icon: Sparkles },
    { id: "grammar", label: "Grammar", icon: BookOpen },
    { id: "vocabulary", label: "Vocabulary", icon: Brain },
    { id: "listening", label: "Listening", icon: Headphones },
    { id: "pronunciation", label: "Pronunciation", icon: Mic },
  ];

  const levels: Array<{ id: LC_Level | "all"; label: string }> = [
    { id: "all", label: "All Levels" },
    { id: "beginner", label: "Beginner" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" },
  ];

  const englishLessons = lessons.filter((l) => !l.targetLang);
  const langLessons = lessons.filter((l) => !!l.targetLang);

  const filteredEnglishLessons = englishLessons.filter((lesson) => {
    const categoryMatch = selectedCategory === "all" || lesson.category === selectedCategory;
    const levelMatch = selectedLevel === "all" || lesson.level === selectedLevel;
    const searchMatch =
      !searchQuery.trim() ||
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.category.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && levelMatch && searchMatch;
  });

  const filteredLangLessons =
    activeLang === "all" ? langLessons : langLessons.filter((l) => l.targetLang === activeLang);

  const getCategoryIcon = (category: LC_Category) => {
    switch (category) {
      case "grammar": return BookOpen;
      case "vocabulary": return Brain;
      case "listening": return Headphones;
      case "pronunciation": return Mic;
      case "conversation": return MessageCircle;
    }
  };

  const getLevelBadgeStyle = (level: LC_Level) => {
    switch (level) {
      case "beginner": return "bg-blue-100 text-slate-900 border border-slate-900";
      case "intermediate": return "bg-purple-100 text-slate-900 border border-slate-900";
      case "advanced": return "bg-red-100 text-slate-900 border border-slate-900";
    }
  };

  const renderLessonCard = (lesson: Lesson) => {
    const IconComp = getCategoryIcon(lesson.category);
    const isCompleted = stats.completedLessons.includes(lesson.id);
    const langMeta = lesson.targetLang ? LANG_META[lesson.targetLang] : null;
    return (
      <div
        key={lesson.id}
        id={`lesson-card-${lesson.id}`}
        onClick={() => onSelectLesson(lesson)}
        className={`group relative border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] duration-150 transition-all cursor-pointer flex flex-col justify-between ${
          isCompleted ? "bg-emerald-50/50 hover:bg-emerald-50" : "bg-white hover:bg-indigo-50/20"
        }`}
      >
        {isCompleted && (
          <div className="absolute top-4 right-4 text-emerald-600" title="Completed">
            <CheckCircle2 className="w-5 h-5 fill-emerald-100 border border-slate-900 rounded-full" />
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="p-1.5 rounded-lg border border-slate-900 bg-slate-100 text-slate-900">
              <IconComp className="w-3.5 h-3.5" />
            </span>
            {langMeta && (
              <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase border ${langMeta.bg} ${langMeta.color}`}>
                {langMeta.flag} {langMeta.name}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase ${getLevelBadgeStyle(lesson.level)}`}>
              {lesson.level}
            </span>
            <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase font-display">
              {lesson.category}
            </span>
          </div>

          <h4 className="font-extrabold text-slate-900 text-base font-display group-hover:text-indigo-600 transition-colors pr-6">
            {lesson.title}
          </h4>
          <p className="text-xs text-slate-650 mt-1 line-clamp-2 leading-relaxed">
            {lesson.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-dashed border-slate-300 flex items-center justify-between text-xs text-slate-505">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-indigo-700 bg-indigo-50 border border-slate-900 px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
              +{lesson.xpReward} XP
            </span>
            <span className="text-slate-400 font-bold">•</span>
            <span className="font-bold text-slate-500">{lesson.estimatedMinutes} mins</span>
            <span className="text-slate-400 font-bold">•</span>
            <span className="font-bold text-slate-500">{lesson.content.quiz.length} Qs</span>
          </div>
          <span className="group-hover:translate-x-1 duration-150 transition-transform text-indigo-600 font-black flex items-center gap-0.5 text-xs font-display uppercase tracking-wider">
            Open <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top-level Tab: English Syllabus vs Language Modules */}
      <div className="bg-white border-2 border-slate-900 rounded-2xl p-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex gap-2">
        <button
          id="main-tab-syllabus"
          onClick={() => setMainTab("syllabus")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-900 text-xs font-black uppercase tracking-wider font-display transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
            mainTab === "syllabus" ? "bg-slate-950 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          English Syllabus
          <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-black border ${mainTab === "syllabus" ? "bg-white/20 border-white/30 text-white" : "bg-slate-100 border-slate-300 text-slate-600"}`}>
            {englishLessons.length}
          </span>
        </button>
        <button
          id="main-tab-languages"
          onClick={() => setMainTab("languages")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-900 text-xs font-black uppercase tracking-wider font-display transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
            mainTab === "languages" ? "bg-indigo-600 text-white" : "bg-white text-slate-700 hover:bg-indigo-50"
          }`}
        >
          <Globe className="w-4 h-4" />
          Language Modules
          <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-black border ${mainTab === "languages" ? "bg-white/20 border-white/30 text-white" : "bg-indigo-50 border-indigo-200 text-indigo-700"}`}>
            🇹🇭🇰🇷🇯🇵 {langLessons.length}
          </span>
        </button>
      </div>

      {/* ── ENGLISH SYLLABUS ── */}
      {mainTab === "syllabus" && (
        <>
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-5">
            <div>
              <label className="text-xs font-black text-slate-900 uppercase tracking-widest block mb-2.5 font-display">
                Focus Modules
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {categories.map((cat) => {
                  const IconComp = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      id={`cat-nav-${cat.id}`}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 border-slate-900 text-xs font-black uppercase tracking-wider font-display transition-all text-left cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                        isActive ? "bg-indigo-600 text-white" : "bg-white text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      <span className={`p-1 rounded-lg border border-slate-900 shrink-0 ${isActive ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-950"}`}>
                        <IconComp className="w-3.5 h-3.5" />
                      </span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t-2 border-slate-100">
              <label className="text-xs font-black text-slate-900 uppercase tracking-widest block mb-2.5 font-display">
                Proficiency Levels
              </label>
              <div className="flex flex-wrap gap-2.5">
                {levels.map((lvl) => {
                  const isActive = selectedLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      id={`level-nav-${lvl.id}`}
                      onClick={() => setSelectedLevel(lvl.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest font-display border-2 border-slate-900 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                        isActive ? "bg-slate-950 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {(selectedCategory === "all" || selectedLevel === "all") && (
              <div className="pt-4 border-t-2 border-slate-100 space-y-2">
                <label htmlFor="search-input" className="text-xs font-black text-slate-900 uppercase tracking-widest block font-display">
                  Search Modules or Topics
                </label>
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    id="search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by module title, description, or topic..."
                    className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-400 text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest font-display">
                Syllabus Content ({filteredEnglishLessons.length} Modules)
              </h3>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Auto-translation and Speech-ready</span>
            </div>

            {filteredEnglishLessons.length === 0 ? (
              <div className="text-center py-12 bg-white border-2 border-dashed border-slate-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                <Sparkles className="w-8 h-8 text-indigo-500 mx-auto mb-2 animate-pulse" />
                <h4 className="font-black text-slate-900 text-sm uppercase font-display">No matches found</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">Try adjusting your active category or level filters to view additional options.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredEnglishLessons.map(renderLessonCard)}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── LANGUAGE MODULES ── */}
      {mainTab === "languages" && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <label className="text-xs font-black text-slate-900 uppercase tracking-widest block mb-3 font-display">
              Select Language
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                id="lang-filter-all"
                onClick={() => setActiveLang("all")}
                className={`px-4 py-2 rounded-xl border-2 border-slate-900 text-xs font-black uppercase tracking-wider font-display transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] ${
                  activeLang === "all" ? "bg-slate-950 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                🌐 All Languages ({langLessons.length})
              </button>
              {(Object.entries(LANG_META) as [TargetLang, typeof LANG_META[TargetLang]][]).map(([code, meta]) => {
                const count = langLessons.filter((l) => l.targetLang === code).length;
                const isActive = activeLang === code;
                return (
                  <button
                    key={code}
                    id={`lang-filter-${code}`}
                    onClick={() => setActiveLang(code)}
                    className={`px-4 py-2 rounded-xl border-2 border-slate-900 text-xs font-black uppercase tracking-wider font-display transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] ${
                      isActive ? `${meta.bg} ${meta.color} shadow-none translate-x-[1px] translate-y-[1px]` : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {meta.flag} {meta.name} ({count})
                  </button>
                );
              })}
            </div>

            {activeLang !== "all" && (
              <div className={`mt-4 p-4 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] ${LANG_META[activeLang].bg}`}>
                <p className={`text-xs font-black uppercase tracking-widest ${LANG_META[activeLang].color}`}>
                  {LANG_META[activeLang].flag} Learning {LANG_META[activeLang].name} — {filteredLangLessons.length} modules available
                </p>
                <p className="text-[11px] text-slate-600 mt-1 font-semibold">
                  Complete all modules to master vocabulary, conversational dialogues, and cultural knowledge.
                </p>
              </div>
            )}
          </div>

          {/* Grouped view when "All" selected */}
          {activeLang === "all" ? (
            <div className="space-y-10">
              {(Object.entries(LANG_META) as [TargetLang, typeof LANG_META[TargetLang]][]).map(([code, meta]) => {
                const group = langLessons.filter((l) => l.targetLang === code);
                const completedCount = group.filter((l) => stats.completedLessons.includes(l.id)).length;
                return (
                  <div key={code} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-black uppercase tracking-wider font-display flex items-center gap-2 ${meta.color}`}>
                        <span className="text-2xl leading-none">{meta.flag}</span>
                        {meta.name} Language Modules
                      </h3>
                      <div className="flex items-center gap-2">
                        {completedCount === group.length && group.length > 0 && (
                          <button
                            onClick={() => setCertLang(code as TargetLang)}
                            className="bg-amber-400 hover:bg-amber-300 text-slate-900 border-2 border-slate-900 px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Get Certificate
                          </button>
                        )}
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider bg-white border-2 border-slate-900 px-2 py-1 rounded-lg shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                          {completedCount}/{group.length} completed
                        </span>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {group.map(renderLessonCard)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest font-display">
                  {LANG_META[activeLang].flag} {LANG_META[activeLang].name} Modules ({filteredLangLessons.length})
                </h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  {filteredLangLessons.filter((l) => stats.completedLessons.includes(l.id)).length}/{filteredLangLessons.length} completed
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredLangLessons.map(renderLessonCard)}
              </div>
            </div>
          )}
        </div>
      )}

      {certLang && (
        <LanguageCertificate
          language={LANG_META[certLang].name}
          flag={LANG_META[certLang].flag}
          onClose={() => setCertLang(null)}
          score={stats.examAttempts?.[certLang]?.score}
        />
      )}
    </div>
  );
}
