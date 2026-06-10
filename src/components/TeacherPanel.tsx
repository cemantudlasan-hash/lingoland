"use client";

import React, { useState } from "react";
import { Question, PRESET_CATEGORIES } from "@/lib/game-types-corridor";
import { generateDynamicQuestions } from "@/lib/questionGenerator-corridor";
import { Sparkles, Save, Trash2, Plus, ArrowLeft, Download, Upload, Cpu, Edit3, Settings, HelpCircle, Check, Play } from "lucide-react";

interface TeacherPanelProps {
  activeQuestions: Question[];
  onSaveQuestions: (questions: Question[]) => void;
  onBack: () => void;
  onLaunchGame: () => void;
}

export default function TeacherPanel({
  activeQuestions,
  onSaveQuestions,
  onBack,
  onLaunchGame
}: TeacherPanelProps) {
  // Current local copy of question sets
  const [questions, setQuestions] = useState<Question[]>([...activeQuestions]);
  
  // Gemini inputs
  const [geminiTopic, setGeminiTopic] = useState("Irregular past tense verbs");
  const [gradeLevel, setGradeLevel] = useState("Middle School");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorLog, setErrorLog] = useState<string | null>(null);

  // Manual Creation Input State
  const [manualPrompt, setManualPrompt] = useState("");
  const [manualCategory, setManualCategory] = useState("Grammar");
  const [manualOptions, setManualOptions] = useState<[string, string, string]>(["", "", ""]);
  const [manualCorrectIdx, setManualCorrectIdx] = useState<number>(0);
  const [manualExplanation, setManualExplanation] = useState("");

  const handleApplyPreset = (presetName: string) => {
    const selected = PRESET_CATEGORIES.find((p) => p.name === presetName);
    if (selected) {
      setQuestions([...selected.questions]);
      onSaveQuestions([...selected.questions]);
      setErrorLog(null);
    }
  };

  const handleGenerateWithGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiTopic.trim()) {
      setErrorLog("Please enter a focus topic first");
      return;
    }

    setIsGenerating(true);
    setErrorLog(null);

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: geminiTopic, gradeLevel }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate questions");
      }

      const data = await response.json();
      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        onSaveQuestions(data.questions);
      } else {
        throw new Error("Invalid response format received from generator server");
      }
    } catch (err: any) {
      console.error(err);
      setErrorLog(`Gemini Error: ${err.message || "Failed to structure quiz questions"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteQuestion = (id: string) => {
    const nextQ = questions.filter((q) => q.id !== id);
    setQuestions(nextQ);
    onSaveQuestions(nextQ);
  };

  const handleAddManualQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPrompt.trim() || manualOptions.some((o) => !o.trim())) {
      setErrorLog("Please complete the Prompt text and all 3 lane choices.");
      return;
    }

    const newQ: Question = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category: manualCategory || "General",
      prompt: manualPrompt,
      options: [manualOptions[0], manualOptions[1], manualOptions[2]],
      correctIdx: manualCorrectIdx,
      explanation: manualExplanation || "Great job!",
    };

    const nextQ = [...questions, newQ];
    setQuestions(nextQ);
    onSaveQuestions(nextQ);

    // Reset inputs
    setManualPrompt("");
    setManualOptions(["", "", ""]);
    setManualCorrectIdx(0);
    setManualExplanation("");
    setErrorLog(null);
  };

  const handleOptionChange = (idx: number, value: string) => {
    const updated = [...manualOptions] as [string, string, string];
    updated[idx] = value;
    setManualOptions(updated);
  };

  const handleInPlaceCellChange = (qId: string, field: keyof Question, value: any) => {
    const updated = questions.map((q) => {
      if (q.id === qId) {
        return { ...q, [field]: value };
      }
      return q;
    });
    setQuestions(updated);
    onSaveQuestions(updated);
  };

  const handleInPlaceOptionChange = (qId: string, optIdx: number, value: string) => {
    const updated = questions.map((q) => {
      if (q.id === qId) {
        const nextOpts = [...q.options] as [string, string, string];
        nextOpts[optIdx] = value;
        return { ...q, options: nextOpts };
      }
      return q;
    });
    setQuestions(updated);
    onSaveQuestions(updated);
  };

  // Export Quiz to JSON file download
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `3d-classroom-quiz-${geminiTopic.replace(/\s+/g, "-").toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import Quiz from JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          const validated: Question[] = parsed.map((q: any, i) => ({
            id: q.id || `imported-${i}-${Date.now()}`,
            category: q.category || "Vocabulary",
            prompt: q.prompt || "Enter question text",
            options: Array.isArray(q.options) && q.options.length >= 3 
              ? [q.options[0], q.options[1], q.options[2]] 
              : ["Choice A", "Choice B", "Choice C"],
            correctIdx: typeof q.correctIdx === "number" ? q.correctIdx : 0,
            explanation: q.explanation || "Correct answer note"
          }));

          setQuestions(validated);
          onSaveQuestions(validated);
          setErrorLog(null);
        } else {
          setErrorLog("JSON must represent an array of question objects");
        }
      } catch (err) {
        setErrorLog("Failed parsing JSON. Please inspect the schema format");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 font-sans text-slate-100 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
      
      {/* Decorative backdrop glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header section with fast back control */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded-xl transition-all cursor-pointer"
            id="back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-indigo-400" />
              Teacher Control Room
            </h1>
            <p className="text-slate-400 text-xs">
              Configure pedagogical categories, edit interactive word gates, or leverage Gemini AI levels generator.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {questions.length > 0 && (
            <button
              onClick={onLaunchGame}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-95 flex items-center gap-2 cursor-pointer"
              id="launch-preset-btn"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Launch Active Game
            </button>
          )}
        </div>
      </div>

      {errorLog && (
        <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-xs flex gap-2 items-center z-10 relative">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          {errorLog}
        </div>
      )}

      {/* Main Grid: Generator & Manual Builders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 relative z-10">
        
        {/* Left Column: AI Generation Tools */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Gemini Generating Panel */}
          <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4.5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400 animate-pulse" />
                  Gemini AI AI Creator
                </h2>
                <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full uppercase">
                  Server-Side
                </span>
              </div>
              
              <p className="text-xs text-slate-400 mb-4 leading-relaxed font-serif">
                Input any English learning focus or specific text corpus. Gemini will dynamically design 8 fully balanced 3D gate runner spelling or syntax questions.
              </p>

              <form onSubmit={handleGenerateWithGemini} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase font-semibold mb-1.5">
                    What should students practice?
                  </label>
                  <input
                    type="text"
                    value={geminiTopic}
                    onChange={(e) => setGeminiTopic(e.target.value)}
                    placeholder="e.g. Adverbs of frequency, TOEFL Synonyms, SAT level"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all font-sans"
                    disabled={isGenerating}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase font-semibold mb-1.5">
                    Target Grade / Learning Bracket
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                    disabled={isGenerating}
                  >
                    <option value="Elementary (A1-A2)">Elementary (A1-A2)</option>
                    <option value="Middle School (B1)">Middle School (B1)</option>
                    <option value="High School / SAT (B2)">High School / SAT (B2)</option>
                    <option value="Advanced / Academic (C1-C2)">Advanced / Academic (C1-C2)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !geminiTopic.trim()}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  id="gemini-generate-btn"
                >
                  <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin text-amber-300" : "text-white"}`} />
                  {isGenerating ? "Gemini Compiling Level..." : "Generate AI Level Pack"}
                </button>
              </form>
            </div>
          </div>

          {/* Quick Curriculum presets selection */}
          <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800/80">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3 uppercase">
              Curriculum Presets
            </h2>
            <p className="text-xs text-slate-400 mb-4 font-serif leading-relaxed">
              Instantly seed the active deck with these popular standardized grammar and word-gate presets.
            </p>

            <button
              onClick={() => {
                const generated = generateDynamicQuestions(20);
                setQuestions(generated);
                onSaveQuestions(generated);
                setErrorLog(null);
              }}
              className="w-full mb-4 py-3 px-4 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-bold text-xs uppercase tracking-wider rounded-xl border border-teal-500/20 hover:border-teal-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
              Auto-Generate 20 Random Questions
            </button>

            <div className="space-y-2.5">
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleApplyPreset(cat.name)}
                  className="w-full p-3 bg-slate-900/60 hover:bg-slate-800 border border-slate-800/60 hover:border-slate-700 rounded-xl text-left transition-all group flex items-start gap-3 cursor-pointer"
                >
                  <div className="p-1 px-2.5 bg-slate-800 rounded-md group-hover:bg-slate-700 transition-all font-mono text-[9px] text-cyan-400 font-bold uppercase tracking-wider mt-0.5">
                    PRESET
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-all leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                      {cat.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Active Interactive Questions Editor */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Active Question List Deck wrapper */}
          <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">
                  ACTIVE LEVEL DECK ({questions.length} questions)
                </h2>
              </div>

              {/* JSON import/export panel icons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportJSON}
                  className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white hover:bg-slate-800 text-slate-400 rounded-lg text-[10px] font-mono flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Export Quiz to JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>

                <label
                  className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white hover:bg-slate-800 text-slate-400 rounded-lg text-[10px] font-mono flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Import from JSON"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>

                {questions.length > 0 && (
                  <button
                    onClick={() => {
                      setQuestions([]);
                      onSaveQuestions([]);
                    }}
                    className="p-1.5 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/30 hover:border-rose-800 text-rose-400 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Questions List scroll viewport */}
            <div className="space-y-4 mt-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {questions.length === 0 ? (
                <div className="py-12 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/20">
                  <p className="text-sm text-slate-500 font-serif">No questions in the active level.</p>
                  <p className="text-xs text-slate-600 mt-1 font-sans">
                    Use the Gemini AI generator on the left or type manual entries below inside the editor.
                  </p>
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 bg-slate-900 rounded-2xl border border-slate-800/80 shadow relative group"
                  >
                    {/* Delete item button */}
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="absolute top-3 right-3 p-1.5 hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 hover:border border-rose-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Question Row Meta header */}
                    <div className="flex gap-2 items-center mb-3">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={q.category}
                        onChange={(e) => handleInPlaceCellChange(q.id, "category", e.target.value)}
                        className="bg-slate-950 border border-transparent hover:border-slate-800 rounded px-2 py-0.5 text-[9px] font-mono text-cyan-400 uppercase tracking-widest outline-none focus:border-slate-700 w-32"
                      />
                    </div>

                    {/* Prompt prompt editor */}
                    <div className="mb-3">
                      <label className="text-[10px] font-mono text-slate-500 uppercase font-semibold block mb-0.5">
                        Prompt Question (Billboard Headline)
                      </label>
                      <input
                        type="text"
                        value={q.prompt}
                        onChange={(e) => handleInPlaceCellChange(q.id, "prompt", e.target.value)}
                        className="w-full bg-slate-950 border border-transparent hover:border-slate-850 rounded px-3 py-1.5 text-xs text-slate-100 font-semibold outline-none focus:border-indigo-600"
                        placeholder="Primary sentence prompt core text"
                      />
                    </div>

                    {/* Left/Center/Right answers mapping options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      {[0, 1, 2].map((lane) => {
                        const label = lane === 0 ? "Lane A (Left)" : lane === 1 ? "Lane B (Middle)" : "Lane C (Right)";
                        const ringColor = lane === q.correctIdx ? "border-emerald-500 bg-emerald-950/20" : "border-slate-850 bg-slate-950";
                        return (
                          <div key={lane} className={`p-2.5 rounded-xl border ${ringColor} transition-all`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                              <button
                                onClick={() => handleInPlaceCellChange(q.id, "correctIdx", lane)}
                                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                                  lane === q.correctIdx 
                                    ? "border-emerald-500 bg-emerald-500 text-white" 
                                    : "border-slate-600 hover:border-emerald-400"
                                }`}
                                title="Mark as correct answer"
                              >
                                {lane === q.correctIdx && <Check className="w-2.5 h-2.5" />}
                              </button>
                            </div>
                            <input
                              type="text"
                              value={q.options[lane]}
                              onChange={(e) => handleInPlaceOptionChange(q.id, lane, e.target.value)}
                              className="w-full bg-transparent text-[11px] font-bold text-slate-200 outline-none"
                              placeholder={`Choice ${lane}`}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Pedagogical Explanation */}
                    <div>
                      <label className="text-[10px] font-mono text-slate-500 uppercase font-semibold block mb-0.5">
                        Pedagogical Feedback Explanation
                      </label>
                      <input
                        type="text"
                        value={q.explanation}
                        onChange={(e) => handleInPlaceCellChange(q.id, "explanation", e.target.value)}
                        className="w-full bg-slate-950 border border-transparent hover:border-slate-850 rounded px-2.5 py-1 text-[11px] text-slate-400 outline-none focus:border-slate-700 font-serif"
                        placeholder="Explain correcting rule concisely"
                      />
                    </div>

                  </div>
                ))
              )}
            </div>

            {/* manual adder form overlay */}
            <form onSubmit={handleAddManualQuestion} className="mt-6 pt-5 border-t border-slate-800 space-y-4">
              <h3 className="text-xs font-bold font-mono tracking-wider text-indigo-400 uppercase">
                + ADD CUSTOM MANUAL QUESTION
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                <div className="md:col-span-9">
                  <input
                    type="text"
                    value={manualPrompt}
                    onChange={(e) => setManualPrompt(e.target.value)}
                    placeholder="e.g. Find the correct auxiliary verb: 'She ___ finished already.'"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>
                <div className="md:col-span-3">
                  <input
                    type="text"
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    placeholder="Category (e.g. Verbs)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Lane Choices adders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[0, 1, 2].map((lane) => {
                  const label = lane === 0 ? "Lane A: Option" : lane === 1 ? "Lane B: Option" : "Lane C: Option";
                  const buttonSel = lane === manualCorrectIdx ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-500";
                  return (
                    <div key={lane} className={`p-2 bg-slate-900 rounded-xl border border-slate-800 flex gap-2 items-center`}>
                      <button
                        type="button"
                        onClick={() => setManualCorrectIdx(lane)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                          lane === manualCorrectIdx ? "bg-emerald-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-400"
                        }`}
                        title="Set as correct lane"
                      >
                        {lane === manualCorrectIdx ? "Correct" : "Lane " + (lane === 0 ? "A" : lane === 1 ? "B" : "C")}
                      </button>
                      <input
                        type="text"
                        value={manualOptions[lane]}
                        onChange={(e) => handleOptionChange(lane, e.target.value)}
                        className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-600 font-semibold outline-none"
                        placeholder="Choice text"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Manual Explanation fields */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualExplanation}
                  onChange={(e) => setManualExplanation(e.target.value)}
                  placeholder="Feedback Explanation (e.g., 'Has' is paired with the singular past subject third person)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-serif"
                />
                
                <button
                  type="submit"
                  className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-mono uppercase whitespace-nowrap tracking-wide cursor-pointer hover:shadow-lg hover:shadow-indigo-500/10 active:scale-95 transition-all flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}
