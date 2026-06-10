"use client";

import React, { useState } from "react";
import { Team } from "@/lib/game-types-corridor";
import { Trophy, Plus, Trash2, Shield, Users, RefreshCw, Star, PlayCircle, Target, Award } from "lucide-react";

interface LeaderboardProps {
  teams: Team[];
  activeTeamId: string | null;
  onSelectActiveTeam: (id: string | null) => void;
  onAddTeam: (name: string) => void;
  onRemoveTeam: (id: string) => void;
  onResetScores: () => void;
  onBack: () => void;
}

export default function Leaderboard({
  teams,
  activeTeamId,
  onSelectActiveTeam,
  onAddTeam,
  onRemoveTeam,
  onResetScores,
  onBack
}: LeaderboardProps) {
  const [newTeamName, setNewTeamName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    onAddTeam(newTeamName.trim());
    setNewTeamName("");
  };

  // Sort teams high to low
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden font-sans text-slate-100">
      
      {/* Glow elements */}
      <div className="absolute top-0 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header view controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Classroom Scoreboard
            </h1>
            <p className="text-slate-400 text-xs">
              Manage classroom groups, track points, and designate the active runner team before launch.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {teams.length > 0 && (
            <button
              onClick={onResetScores}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all border border-slate-700 hover:border-slate-600 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset All Scores
            </button>
          )}
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Main Menu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 relative z-10">
        
        {/* Left pane: Team Setup form and Active picker */}
        <div className="md:col-span-4 flex flex-col gap-6">
          
          {/* Quick Creator */}
          <div className="p-5 bg-slate-950/85 rounded-2xl border border-slate-800/80">
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Create Study Team
            </h2>
            <p className="text-[11px] text-slate-400 mb-4 leading-normal font-serif">
              Add teams (e.g. Team Blue, Row A, or custom group handles) so scores can be recorded to their row.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Team/Group Name"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all font-semibold"
                maxLength={20}
              />
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Team
              </button>
            </form>
          </div>

          {/* Selector widget */}
          <div className="p-5 bg-slate-950/85 rounded-2xl border border-slate-800/80">
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-indigo-400" />
              Active Group Player
            </h2>
            <p className="text-[11px] text-slate-400 mb-3.5 leading-normal font-serif">
              Select which classroom row is about to play. Their finished score will auto-save to this profile.
            </p>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              <button
                onClick={() => onSelectActiveTeam(null)}
                className={`w-full p-2.5 rounded-xl text-left transition-all text-xs font-bold font-mono flex justify-between items-center border ${
                  activeTeamId === null 
                    ? "bg-slate-800 border-indigo-500 text-indigo-300" 
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <span>🚀 Solo Practice (Guests)</span>
                {activeTeamId === null && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />}
              </button>
              
              {teams.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSelectActiveTeam(t.id)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all text-xs font-semibold flex justify-between items-center border ${
                    activeTeamId === t.id 
                      ? "bg-slate-800 border-indigo-500 text-indigo-350" 
                      : "bg-slate-900/60 border-slate-850 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span className="truncate">👥 {t.name}</span>
                  {activeTeamId === t.id && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right pane: Standings leader lists */}
        <div className="md:col-span-8 flex flex-col">
          
          <div className="p-5 bg-slate-950/85 rounded-2xl border border-slate-800/80 flex-grow flex flex-col min-h-[300px]">
            <h2 className="text-xs font-black font-mono tracking-widest text-slate-300 uppercase pb-3 border-b border-slate-850 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              STANDINGS LEADERBOARD
            </h2>

            {sortedTeams.length === 0 ? (
              <div className="my-auto py-12 text-center">
                <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-500 font-serif">Scoreboard is currently empty</p>
                <p className="text-xs text-slate-600 mt-1">Add your study groups or teams on the left panel to begin.</p>
              </div>
            ) : (
              <div className="space-y-2.5 mt-4 overflow-y-auto max-h-[380px] pr-1">
                {sortedTeams.map((team, index) => {
                  const isActive = team.id === activeTeamId;
                  const isTopRank = index === 0;
                  const isSecondRank = index === 1;
                  const isThirdRank = index === 2;

                  let rankBadge = (
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 font-bold font-mono text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                  );
                  
                  if (isTopRank) {
                    rankBadge = (
                      <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black font-mono text-xs flex items-center justify-center shadow-lg shadow-amber-500/20">
                        1
                      </span>
                    );
                  } else if (isSecondRank) {
                    rankBadge = (
                      <span className="w-6 h-6 rounded-lg bg-slate-300 text-slate-950 font-black font-mono text-xs flex items-center justify-center">
                        2
                      </span>
                    );
                  } else if (isThirdRank) {
                    rankBadge = (
                      <span className="w-6 h-6 rounded-lg bg-amber-700 text-slate-950 font-black font-mono text-xs flex items-center justify-center">
                        3
                      </span>
                    );
                  }

                  const correctRatio = team.questionsAnswered > 0 
                    ? Math.round((team.correctAnswers / team.questionsAnswered) * 100) 
                    : 0;

                  return (
                    <div
                      key={team.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all relative group ${
                        isActive 
                          ? "bg-indigo-950/55 border-indigo-500/50 shadow-md shadow-indigo-500/5" 
                          : "bg-slate-900 border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      {/* Active picker target pointer */}
                      {isActive && (
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-500 rounded-full" />
                      )}

                      <div className="flex items-center gap-3 truncate">
                        {rankBadge}
                        <div className="truncate">
                          <h3 className="text-sm font-bold text-white tracking-wide truncate flex items-center gap-1.5">
                            {team.name}
                            {isTopRank && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                          </h3>
                          
                          <div className="flex gap-3 text-[10px] text-slate-500 mt-1 font-mono items-center">
                            <span className="flex items-center gap-0.5">
                              <Target className="w-3 h-3 text-cyan-500" />
                              ACCURACY: <span className="text-slate-300 font-bold">{correctRatio}%</span>
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span>SOLVED: <span className="text-slate-300 font-bold">{team.correctAnswers}/{team.questionsAnswered}</span></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 block leading-none font-bold uppercase font-mono">Total score</span>
                          <span className={`text-base font-black tracking-wider ${
                            isTopRank ? "text-amber-400" : isSecondRank ? "text-slate-200" : "text-cyan-300"
                          }`}>
                            {team.score.toLocaleString()}
                          </span>
                        </div>

                        {/* Remove Action */}
                        <button
                          onClick={() => onRemoveTeam(team.id)}
                          className="p-1 px-1.5 hover:bg-rose-950/40 text-slate-605 group-hover:text-rose-400 hover:border border-rose-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Remove Team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
