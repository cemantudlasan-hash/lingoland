import { Flame, Star, Clock, Trophy, RotateCcw, AlertCircle } from "lucide-react";
import { UserStats, Lesson } from "../types";

interface ProgressDashboardProps {
  stats: UserStats;
  allLessons: Lesson[];
  onReset: () => void;
}

export default function ProgressDashboard({ stats, allLessons, onReset }: ProgressDashboardProps) {
  const percentage = allLessons.length > 0 
    ? Math.round((stats.completedLessons.length / allLessons.length) * 100) 
    : 0;

  // Let's create an elegant mini activity calendar grid to track engagement
  const today = new Date();
  const weeks = 4;
  const daysInGrid = weeks * 7;
  const activityMap = new Map<string, number>();

  stats.history.forEach((h) => {
    try {
      const dateStr = h.completedAt.split("T")[0];
      activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
    } catch (_) {}
  });

  const calendarDays = Array.from({ length: daysInGrid }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (daysInGrid - 1 - i));
    const dateStr = d.toISOString().split("T")[0];
    const rawDay = d.getDay();
    const count = activityMap.get(dateStr) || 0;
    return { dateStr, count, dayOfWeek: rawDay };
  });

  return (
    <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase font-display flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 fill-amber-500" />
            Study Room Progress
          </h2>
          <p className="text-xs text-slate-500 font-medium">Track and optimize your daily lingolandverse.com study commitment.</p>
        </div>
        
        <button
          id="reset-stats-btn"
          onClick={() => {
            if (confirm("Are you sure you want to clear your study progress and reset stats?")) {
              onReset();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-slate-900 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Stats</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-orange-50 border-2 border-slate-900 rounded-xl p-4 flex items-center gap-3.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 transition-transform">
          <div className="w-10 h-10 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-display leading-none">{stats.streakCount}</div>
            <div className="text-[10px] uppercase font-black text-slate-500 tracking-wider mt-1">Day Streak</div>
          </div>
        </div>

        <div className="bg-indigo-50 border-2 border-slate-900 rounded-xl p-4 flex items-center gap-3.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 transition-transform">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-display leading-none">{stats.points}</div>
            <div className="text-[10px] uppercase font-black text-slate-500 tracking-wider mt-1">Total XP</div>
          </div>
        </div>

        <div className="bg-emerald-50 border-2 border-slate-900 rounded-xl p-4 flex items-center gap-3.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 transition-transform">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-display leading-none">{percentage}%</div>
            <div className="text-[9px] uppercase font-black text-slate-500 tracking-wider mt-1">Mastery ({stats.completedLessons.length}/{allLessons.length})</div>
          </div>
        </div>

        <div className="bg-amber-50 border-2 border-slate-900 rounded-xl p-4 flex items-center gap-3.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 transition-transform">
          <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-display leading-none">{stats.timeSpentMinutes}m</div>
            <div className="text-[10px] uppercase font-black text-slate-500 tracking-wider mt-1">Time Studied</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-50 border-2 border-slate-900 rounded-xl p-4.5 mb-6 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex justify-between items-center text-xs mb-2 font-bold uppercase tracking-wider text-slate-700">
          <span className="font-display">Course Syllabus Accomplished</span>
          <span className="text-indigo-600 font-extrabold">{percentage}%</span>
        </div>
        <div className="w-full bg-white rounded-full h-3 border-2 border-slate-900 overflow-hidden">
          <div 
            className="bg-indigo-600 h-full rounded-full transition-all duration-700 border-r border-slate-900"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Learning Heatmap Calendar */}
      <div className="bg-slate-50 border-2 border-slate-900 rounded-xl p-4.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 font-display">Commitment Activity Heatmap (Last 4 Weeks)</h3>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-[5px] bg-white p-3 rounded-lg border-2 border-slate-900">
            {calendarDays.map((day) => {
              let color = "bg-slate-100 border-slate-300";
              if (day.count > 0) {
                if (day.count === 1) color = "bg-indigo-200 border-indigo-400";
                else if (day.count === 2) color = "bg-indigo-400 border-indigo-600";
                else color = "bg-indigo-600 border-indigo-800 text-white";
              }
              const formattedDate = new Date(day.dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
              return (
                <div
                  key={day.dateStr}
                  title={`${day.count} lesson(s) completed on ${formattedDate}`}
                  className={`w-4 h-4 rounded-[4px] border transition-colors hover:ring-2 hover:ring-indigo-300 cursor-pointer ${color}`}
                />
              );
            })}
          </div>

          <div className="text-[11px] text-slate-600 leading-relaxed max-w-sm">
            <span className="font-black text-slate-800 flex items-center gap-1 mb-1 font-display uppercase tracking-wide">
              <AlertCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              Streak System Rule
            </span>
            Complete at least one grammar, vocabulary, listening, or pronunciation exercise every calendar day to increase your streak level!
          </div>
        </div>
      </div>
    </div>
  );
}
