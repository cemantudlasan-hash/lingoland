'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, CheckCircle, Circle, ChevronRight, ChevronLeft,
  GraduationCap, Download, Award, Star, Globe, Clock,
  Volume2, BookMarked, Flame, Trophy, X, User, Building2,
  Calendar, Sparkles, Lock
} from 'lucide-react';
import { languageModules, type Lesson, type LanguageModule } from '@/lib/language-modules';
import { useAuth } from '@/context/auth-context';
import { ConstellationCanvas } from '@/components/ui/constellation-canvas';
import Link from 'next/link';

/* ─── Lesson type icons ──────────────────────────────────────── */
const lessonTypeIcon: Record<string, React.ReactNode> = {
  vocabulary: <BookOpen className="w-3.5 h-3.5" />,
  grammar: <BookMarked className="w-3.5 h-3.5" />,
  conversation: <Volume2 className="w-3.5 h-3.5" />,
  culture: <Globe className="w-3.5 h-3.5" />,
  pronunciation: <Flame className="w-3.5 h-3.5" />,
};

const lessonTypeColor: Record<string, string> = {
  vocabulary:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  grammar:       'bg-blue-500/10 text-blue-400 border-blue-500/20',
  conversation:  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  culture:       'bg-amber-500/10 text-amber-400 border-amber-500/20',
  pronunciation: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

const difficultyColor: Record<string, string> = {
  beginner:     'text-emerald-400',
  intermediate: 'text-amber-400',
  advanced:     'text-rose-400',
};

/* ─── Certificate Generator ──────────────────────────────────── */
interface CertificateData {
  fullName: string;
  courseName: string;
  completionDate: string;
  additionalDetail: string;
}

function LanguageCertificateGenerator({
  language,
  flag,
  gradient,
  onClose,
}: {
  language: string;
  flag: string;
  gradient: string;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CertificateData>({
    fullName: '',
    courseName: `${language} Language Mastery`,
    completionDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    additionalDetail: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const handleDownloadJPG = useCallback(async () => {
    if (!form.fullName.trim()) return;
    setIsGenerating(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(certRef.current!, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: 900,
        height: 638,
        windowWidth: 900,
        windowHeight: 638,
      });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.97);
      const link = document.createElement('a');
      link.download = `${form.fullName.replace(/\s+/g, '_')}_${language}_Certificate.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Certificate download failed', e);
    } finally {
      setIsGenerating(false);
    }
  }, [form, language]);

  return (
    <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-white font-black text-lg">Certificate of Completion</h2>
              <p className="text-slate-400 text-xs">{flag} {language} Language Mastery</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Full Name *
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Course Name
              </label>
              <input
                type="text"
                value={form.courseName}
                onChange={e => setForm(p => ({ ...p, courseName: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Date of Completion
              </label>
              <input
                type="text"
                value={form.completionDate}
                onChange={e => setForm(p => ({ ...p, completionDate: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Additional Detail (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. with distinction, Level B1"
                value={form.additionalDetail}
                onChange={e => setForm(p => ({ ...p, additionalDetail: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          {/* Certificate Preview */}
          <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Preview</p>
            <div className="flex justify-center">
              <div style={{ width: 900, transformOrigin: 'top center', transform: 'scale(0.55)', marginBottom: '-250px' }}>
                <CertificateCanvas
                  ref={certRef}
                  data={form}
                  language={language}
                  flag={flag}
                  gradient={gradient}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadJPG}
              disabled={!form.fullName.trim() || isGenerating}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20"
            >
              <Download className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Download Certificate (JPG)'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3.5 rounded-xl border border-slate-700 text-slate-400 font-bold text-sm hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
          </div>
          {!form.fullName.trim() && (
            <p className="text-xs text-center text-amber-400/70">⚠ Please enter your full name to download the certificate.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Certificate Canvas (actual rendered certificate) ───────── */
const CertificateCanvas = React.forwardRef<HTMLDivElement, {
  data: CertificateData;
  language: string;
  flag: string;
  gradient: string;
}>(({ data, language, flag, gradient }, ref) => {
  const gradFrom = gradient.includes('from-red') ? '#dc2626'
    : gradient.includes('from-blue-7') ? '#1d4ed8'
    : gradient.includes('from-blue-6') ? '#2563eb'
    : gradient.includes('from-blue-5') ? '#3b82f6'
    : gradient.includes('from-yellow') ? '#ca8a04'
    : '#6366f1';
  const gradTo = gradient.includes('to-yellow-5') ? '#eab308'
    : gradient.includes('to-yellow-4') ? '#facc15'
    : gradient.includes('to-red-5') ? '#ef4444'
    : gradient.includes('to-red-4') ? '#f87171'
    : gradient.includes('to-pink') ? '#f472b6'
    : '#8b5cf6';

  return (
    <div
      ref={ref}
      style={{
        width: 900,
        height: 638,
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef9ec 40%, #fffdf5 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Georgia, serif',
        boxSizing: 'border-box',
      }}
    >
      {/* Google Fonts load */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Great+Vibes&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');`}</style>

      {/* Outer border */}
      <div style={{
        position: 'absolute', inset: 10,
        border: `6px solid`,
        borderImage: `linear-gradient(135deg, ${gradFrom}, #d97706, ${gradTo}) 1`,
        pointerEvents: 'none',
      }} />
      {/* Inner border */}
      <div style={{
        position: 'absolute', inset: 20,
        border: '1.5px solid rgba(180,83,9,0.4)',
        pointerEvents: 'none',
      }} />

      {/* Corner ornaments */}
      {[
        { top: 14, left: 14, rotate: 0 },
        { top: 14, right: 14, rotate: 90 },
        { bottom: 14, left: 14, rotate: -90 },
        { bottom: 14, right: 14, rotate: 180 },
      ].map((pos, i) => (
        <svg key={i} width="36" height="36" viewBox="0 0 100 100"
          style={{ position: 'absolute', ...pos, transform: `rotate(${pos.rotate}deg)`, opacity: 0.65 }}>
          <path d="M0,0 L30,0 Q10,10 0,30 Z" fill={gradFrom} />
          <rect x="6" y="6" width="2" height="36" fill={gradFrom} />
          <rect x="6" y="6" width="36" height="2" fill={gradFrom} />
        </svg>
      ))}

      {/* Background watermark */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        fontSize: 200, opacity: 0.03,
        userSelect: 'none', pointerEvents: 'none',
        lineHeight: 1,
      }}>
        {flag}
      </div>

      {/* Content wrapper — centered column */}
      <div style={{
        position: 'absolute', inset: 28,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
        textAlign: 'center',
        padding: '18px 50px 12px',
        boxSizing: 'border-box',
      }}>
        {/* Top: Institution + flag */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 28 }}>{flag}</div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 11, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: '#78350f', opacity: 0.75,
          }}>
            LingoLandVerse · Language Academy
          </div>
        </div>

        {/* Certificate title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 38, fontWeight: 900,
            letterSpacing: '0.08em',
            color: '#78350f',
            lineHeight: 1.1,
            textShadow: '0 1px 2px rgba(0,0,0,0.08)',
          }}>
            CERTIFICATE OF COMPLETION
          </div>
          <div style={{
            width: 120, height: 2,
            background: `linear-gradient(to right, transparent, ${gradFrom}, transparent)`,
            marginTop: 4,
          }} />
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            fontSize: 13, color: '#92400e', opacity: 0.8,
            letterSpacing: '0.05em',
          }}>
            This is to proudly certify that
          </div>
        </div>

        {/* Recipient name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{
            fontFamily: "'Great Vibes', cursive",
            fontSize: 58, color: '#1e3a5f',
            lineHeight: 1.1,
            letterSpacing: '0.01em',
            maxWidth: 700,
            wordBreak: 'break-word',
          }}>
            {data.fullName || 'Your Full Name'}
          </div>
          <div style={{
            width: '70%', height: 1.5,
            background: `linear-gradient(to right, transparent, ${gradFrom}aa, transparent)`,
          }} />
        </div>

        {/* Body text */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic', fontSize: 13,
            color: '#78350f', opacity: 0.8,
          }}>
            has successfully completed all modules in
          </div>
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 19, fontWeight: 700,
            color: '#7c2d12',
            letterSpacing: '0.06em',
            textDecoration: 'underline',
            textDecorationColor: `${gradFrom}66`,
            textUnderlineOffset: 4,
          }}>
            {data.courseName}
          </div>
          {data.additionalDetail && (
            <div style={{
              padding: '2px 20px', border: `1px dashed ${gradFrom}66`,
              borderRadius: 999,
              fontFamily: "'Playfair Display', serif",
              fontSize: 11, color: '#92400e',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              {data.additionalDetail}
            </div>
          )}
        </div>

        {/* Footer: date + seal + signature */}
        <div style={{
          width: '100%', display: 'flex',
          alignItems: 'flex-end', justifyContent: 'space-between',
          paddingTop: 4,
        }}>
          {/* Date */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 140 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 12, color: '#1e293b', fontWeight: 600 }}>
              {data.completionDate}
            </div>
            <div style={{ width: 120, height: 1, background: '#94a3b8' }} />
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 9, color: '#64748b', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Date Issued
            </div>
          </div>

          {/* Seal */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: `radial-gradient(circle, #fbbf24 0%, #d97706 70%, #b45309 100%)`,
              border: '3px solid #fde68a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(180,83,9,0.4)',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.209l8.2-1.191L12 .587z" />
              </svg>
            </div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 9, color: '#92400e', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Official Seal
            </div>
          </div>

          {/* Instructor signature */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 140 }}>
            <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 16, color: '#1e293b', fontWeight: 600 }}>
              LingoLandVerse
            </div>
            <div style={{ width: 120, height: 1, background: '#94a3b8' }} />
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 9, color: '#64748b', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Language Director
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
CertificateCanvas.displayName = 'CertificateCanvas';

/* ─── Lesson Viewer ──────────────────────────────────────────── */
function LessonViewer({
  lesson,
  lessonIndex,
  totalLessons,
  onClose,
  onComplete,
  isCompleted,
}: {
  lesson: Lesson;
  lessonIndex: number;
  totalLessons: number;
  onClose: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}) {
  const [tab, setTab] = useState<'content' | 'practice'>('content');

  return (
    <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-6 py-4 rounded-t-3xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1 ${lessonTypeColor[lesson.type]}`}>
                  {lessonTypeIcon[lesson.type]} {lesson.type}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${difficultyColor[lesson.difficulty]}`}>
                  {lesson.difficulty}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {lesson.duration}
                </span>
              </div>
              <h3 className="text-white font-black text-lg leading-tight">{lesson.title}</h3>
              <p className="text-slate-400 text-sm mt-0.5">{lesson.description}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors shrink-0">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          {/* Progress */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                style={{ width: `${((lessonIndex + 1) / totalLessons) * 100}%` }} />
            </div>
            <span className="text-[11px] text-slate-500 shrink-0">Lesson {lessonIndex + 1} / {totalLessons}</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2">
            {(['content', 'practice'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${tab === t
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-500 hover:text-slate-300'}`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'content' && (
            <div className="space-y-6">
              {/* Intro */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
                <p className="text-slate-300 text-sm leading-relaxed">{lesson.content.intro}</p>
              </div>

              {/* Key Phrases */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Key Phrases</h4>
                <div className="space-y-2">
                  {lesson.content.keyPhrases.map((phrase, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 bg-slate-800/40 border border-slate-700/40 rounded-xl hover:border-indigo-500/30 transition-all">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-xs font-black text-indigo-400 mt-0.5">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-white font-bold text-base">{phrase.native}</span>
                          {phrase.romanized && (
                            <span className="text-indigo-300 text-xs font-mono italic">[{phrase.romanized}]</span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mt-0.5">{phrase.english}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Tips & Notes</h4>
                <div className="space-y-2">
                  {lesson.content.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'practice' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-white font-black">Practice Activity</h4>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{lesson.content.practice}</p>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                <p className="text-amber-300/80 text-xs leading-relaxed">
                  💡 Complete this practice activity to reinforce what you have learned. Real language learning happens through active use!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 px-6 py-4 rounded-b-3xl flex items-center justify-between gap-4">
          <button onClick={onClose} className="flex items-center gap-1.5 text-slate-400 text-sm font-bold hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          {isCompleted ? (
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
              <CheckCircle className="w-5 h-5" /> Completed
            </div>
          ) : (
            <button
              onClick={() => { onComplete(); onClose(); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-sm hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/20"
            >
              <CheckCircle className="w-4 h-4" /> Mark as Complete
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function LanguageModulesPage() {
  const { user, isLoading, isGuest } = useAuth();
  const [activeLanguage, setActiveLanguage] = useState<string>(languageModules[0].id);
  const [completedLessons, setCompletedLessons] = useState<Record<string, Set<string>>>({});
  const [selectedLesson, setSelectedLesson] = useState<{ lesson: Lesson; index: number } | null>(null);
  const [showCertificate, setShowCertificate] = useState<string | null>(null);

  const currentModule = languageModules.find(m => m.id === activeLanguage)!;
  const completedForLang = completedLessons[activeLanguage] ?? new Set<string>();
  const allComplete = currentModule.lessons.every(l => completedForLang.has(l.id));

  const handleComplete = (langId: string, lessonId: string) => {
    setCompletedLessons(prev => {
      const updated = new Set(prev[langId] ?? []);
      updated.add(lessonId);
      return { ...prev, [langId]: updated };
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user || isGuest) {
    return (
      <div className="relative min-h-[88vh] w-full flex flex-col items-center justify-center overflow-hidden bg-slate-950/20 rounded-3xl border border-slate-900 text-white p-8">
        <ConstellationCanvas />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative z-10 flex flex-col items-center gap-6 max-w-md text-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_48px_theme(colors.indigo.500/0.4)] border border-indigo-500/30">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight">Language Modules</h2>
            <p className="text-sm text-indigo-300 font-semibold uppercase tracking-widest">Members Only</p>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Sign in to access all 7 language modules with 10 lessons each, track your progress, and earn completion certificates.
          </p>
          <Link href="/auth"
            className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_24px_theme(colors.indigo.500/0.35)] transition-all hover:scale-105 active:scale-95">
            Sign In to Access
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Lesson Viewer Modal */}
      <AnimatePresence>
        {selectedLesson && (
          <LessonViewer
            lesson={selectedLesson.lesson}
            lessonIndex={selectedLesson.index}
            totalLessons={currentModule.lessons.length}
            onClose={() => setSelectedLesson(null)}
            onComplete={() => handleComplete(activeLanguage, selectedLesson.lesson.id)}
            isCompleted={completedForLang.has(selectedLesson.lesson.id)}
          />
        )}
      </AnimatePresence>

      {/* Certificate Modal */}
      <AnimatePresence>
        {showCertificate && (() => {
          const mod = languageModules.find(m => m.id === showCertificate)!;
          return (
            <LanguageCertificateGenerator
              language={mod.language}
              flag={mod.flag}
              gradient={mod.gradient}
              onClose={() => setShowCertificate(null)}
            />
          );
        })()}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent flex items-center gap-2.5">
              <GraduationCap className="h-7 w-7 text-indigo-400" />
              Language Modules
            </h1>
            <p className="text-xs text-slate-400 mt-1">7 languages · 10 lessons each · Earn a certificate when you complete all lessons</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-indigo-300" />
              <span className="text-xs font-bold text-indigo-300">
                {Object.values(completedLessons).reduce((a, s) => a + s.size, 0)} lessons done
              </span>
            </div>
          </div>
        </div>

        {/* Language tabs */}
        <div className="flex flex-wrap gap-2">
          {languageModules.map(mod => {
            const done = (completedLessons[mod.id] ?? new Set()).size;
            const total = mod.lessons.length;
            const isActive = activeLanguage === mod.id;
            const complete = done === total;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveLanguage(mod.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${isActive
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-white shadow-lg shadow-indigo-500/10'
                  : 'border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'}`}
              >
                <span className="text-lg">{mod.flag}</span>
                <span className="hidden sm:inline">{mod.language}</span>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${complete
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : done > 0 ? 'bg-indigo-500/15 text-indigo-400'
                    : 'bg-slate-800 text-slate-500'}`}>
                  {done}/{total}
                </span>
                {complete && (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Language module content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLanguage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Module header */}
            <div className={`relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br ${currentModule.gradient}/10 to-slate-950/50 p-6`}>
              <div className="absolute inset-0 opacity-5 text-[160px] flex items-center justify-end pr-8 pointer-events-none select-none">
                {currentModule.flag}
              </div>
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{currentModule.flag}</span>
                    <div>
                      <h2 className="text-2xl font-black text-white">{currentModule.language}</h2>
                      <p className="text-slate-400 text-sm">{currentModule.lessons.length} structured lessons</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                        style={{ width: `${(completedForLang.size / currentModule.lessons.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 font-bold">
                      {completedForLang.size}/{currentModule.lessons.length} complete
                    </span>
                  </div>
                </div>

                {/* Certificate button */}
                {allComplete ? (
                  <button
                    onClick={() => setShowCertificate(activeLanguage)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/25 shrink-0"
                  >
                    <Award className="w-5 h-5" />
                    Get Certificate!
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-center opacity-60">
                    <Award className="w-8 h-8 text-slate-500" />
                    <span className="text-xs text-slate-500 font-bold">
                      {currentModule.lessons.length - completedForLang.size} more to unlock
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Completion banner */}
            {allComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Trophy className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-emerald-300 font-black">🎉 Congratulations! You completed all {currentModule.language} lessons!</h3>
                  <p className="text-emerald-400/70 text-sm">Click "Get Certificate!" to generate and download your certificate of completion.</p>
                </div>
              </motion.div>
            )}

            {/* Lesson cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentModule.lessons.map((lesson, index) => {
                const done = completedForLang.has(lesson.id);
                return (
                  <motion.button
                    key={lesson.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => setSelectedLesson({ lesson, index })}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] group ${done
                      ? 'bg-emerald-500/[0.04] border-emerald-500/20 hover:border-emerald-500/40'
                      : 'bg-slate-900/40 border-slate-800 hover:border-indigo-500/30 hover:bg-slate-900/60'}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Number / check */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-sm transition-all ${done
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 group-hover:border-indigo-500/30 group-hover:text-indigo-400'}`}>
                        {done ? <CheckCircle className="w-4.5 h-4.5" /> : String(index + 1).padStart(2, '0')}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${lessonTypeColor[lesson.type]}`}>
                            {lessonTypeIcon[lesson.type]} {lesson.type}
                          </span>
                          <span className={`text-[9px] font-bold uppercase ${difficultyColor[lesson.difficulty]}`}>
                            {lesson.difficulty}
                          </span>
                          <span className="text-[9px] text-slate-600 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> {lesson.duration}
                          </span>
                        </div>
                        <h4 className={`font-bold text-sm leading-tight ${done ? 'text-emerald-200' : 'text-white'}`}>
                          {lesson.title}
                        </h4>
                        <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{lesson.description}</p>
                      </div>
                      {/* Arrow */}
                      <ChevronRight className={`w-4 h-4 shrink-0 mt-1 transition-all group-hover:translate-x-0.5 ${done ? 'text-emerald-500' : 'text-slate-600 group-hover:text-indigo-400'}`} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
