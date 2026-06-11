import { useState } from "react";
import { BookOpen, Brain, Headphones, Mic, Sparkles, CheckCircle2, ChevronRight, Search } from "lucide-react";
import { Lesson, LC_Category, LC_Level, UserStats } from "../types";

interface CategoryNavigatorProps {
  lessons: Lesson[];
  stats: UserStats;
  selectedCategory: LC_Category | "all";
  setSelectedCategory: (cat: LC_Category | "all") => void;
  selectedLevel: LC_Level | "all";
  setSelectedLevel: (level: LC_Level | "all") => void;
  onSelectLesson: (lesson: Lesson) => void;
}

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
  
  const categories: Array<{ id: LC_Category | "all"; label: string; icon: any; color: string }> = [
    { id: "all", label: "All Lessons", icon: Sparkles, color: "text-indigo-500 bg-indigo-50" },
    { id: "grammar", label: "Grammar", icon: BookOpen, color: "text-blue-500 bg-blue-50" },
    { id: "vocabulary", label: "Vocabulary", icon: Brain, color: "text-purple-500 bg-purple-50" },
    { id: "listening", label: "Listening", icon: Headphones, color: "text-pink-500 bg-pink-50" },
    { id: "pronunciation", label: "Pronunciation", icon: Mic, color: "text-amber-500 bg-amber-50" },
  ];

  const levels: Array<{ id: LC_Level | "all"; label: string }> = [
    { id: "all", label: "All Levels" },
    { id: "beginner", label: "Beginner" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" },
  ];

  // Filtering logic
  const filteredLessons = lessons.filter((lesson) => {
    const categoryMatch = selectedCategory === "all" || lesson.category === selectedCategory;
    const levelMatch = selectedLevel === "all" || lesson.level === selectedLevel;
    const searchMatch = !searchQuery.trim() || 
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.category.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && levelMatch && searchMatch;
  });

  const getCategoryIcon = (category: LC_Category) => {
    switch (category) {
      case "grammar": return BookOpen;
      case "vocabulary": return Brain;
      case "listening": return Headphones;
      case "pronunciation": return Mic;
    }
  };

  const getLevelBadgeStyle = (level: LC_Level) => {
    switch (level) {
      case "beginner": return "bg-blue-100 text-slate-900 border border-slate-900";
      case "intermediate": return "bg-purple-100 text-slate-900 border border-slate-900";
      case "advanced": return "bg-red-100 text-slate-900 border border-slate-900";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Area */}
      <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-5">
        {/* Category Tabs */}
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
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-800 hover:bg-slate-50"
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

        {/* Level Filters */}
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
                    isActive
                      ? "bg-slate-950 text-white"
                      : "bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Search Input - Shown when 'All Lessons' or 'All Levels' is selected */}
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

      {/* Grid of Lesson Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest font-display">
            Syllabus Content ({filteredLessons.length} Modules)
          </h3>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Auto-translation and Speech-ready</span>
        </div>

        {filteredLessons.length === 0 ? (
          <div className="text-center py-12 bg-white border-2 border-dashed border-slate-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <Sparkles className="w-8 h-8 text-indigo-500 mx-auto mb-2 animate-pulse" />
            <h4 className="font-black text-slate-900 text-sm uppercase font-display">No matches found</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              Try adjusting your active category or level filters to view additional options.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredLessons.map((lesson) => {
              const IconComp = getCategoryIcon(lesson.category);
              const isCompleted = stats.completedLessons.includes(lesson.id);
              return (
                <div
                  key={lesson.id}
                  id={`lesson-card-${lesson.id}`}
                  onClick={() => onSelectLesson(lesson)}
                  className={`group relative border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] duration-150 transition-all cursor-pointer flex flex-col justify-between ${
                    isCompleted 
                      ? "bg-emerald-50/50 hover:bg-emerald-50" 
                      : "bg-white hover:bg-indigo-50/20"
                  }`}
                >
                  {/* Complete Indicator */}
                  {isCompleted && (
                    <div className="absolute top-4 right-4 text-emerald-600" title="Completed">
                      <CheckCircle2 className="w-5 h-5 fill-emerald-100 border border-slate-900 rounded-full" />
                    </div>
                  )}

                  <div>
                    {/* Header line */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="p-1.5 rounded-lg border border-slate-900 bg-slate-100 text-slate-900">
                        <IconComp className="w-3.5 h-3.5" />
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase ${getLevelBadgeStyle(lesson.level)}`}>
                        {lesson.level}
                      </span>
                      <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase font-display">
                        {lesson.category}
                      </span>
                    </div>

                    {/* Meta info */}
                    <h4 className="font-extrabold text-slate-900 text-base font-display group-hover:text-indigo-600 transition-colors pr-6">
                      {lesson.title}
                    </h4>
                    <p className="text-xs text-slate-650 mt-1 line-clamp-2 leading-relaxed">
                      {lesson.description}
                    </p>
                  </div>

                  {/* Footer Stats row */}
                  <div className="mt-4 pt-3 border-t border-dashed border-slate-300 flex items-center justify-between text-xs text-slate-505">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-indigo-700 bg-indigo-50 border border-slate-900 px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
                        +{lesson.xpReward} XP
                      </span>
                      <span className="text-slate-400 font-bold">•</span>
                      <span className="font-bold text-slate-500">{lesson.estimatedMinutes} mins</span>
                    </div>
                    <span className="group-hover:translate-x-1 duration-150 transition-transform text-indigo-600 font-black flex items-center gap-0.5 text-xs font-display uppercase tracking-wider">
                      Open Room
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
