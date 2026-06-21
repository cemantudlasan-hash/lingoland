'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, CheckCircle, Circle, ChevronRight, ChevronLeft,
  GraduationCap, Download, Award, Star, Globe, Clock,
  Volume2, BookMarked, Flame, Trophy, X, User, Building2,
  Calendar, Sparkles, Lock, RefreshCw
} from 'lucide-react';
import { languageModules, type Lesson, type LanguageModule } from '@/lib/language-modules';
import { useAuth } from '@/context/auth-context';
import { ConstellationCanvas } from '@/components/ui/constellation-canvas';
import Link from 'next/link';
import { languageExams, type ExamQuestion } from '@/lib/language-exams';
import { getUserPet, saveUserPet } from '@/lib/user';
import { initializeFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { UserPet } from '@/lib/types';

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
      ].map(({ rotate, ...pos }, i) => (
        <svg key={i} width="36" height="36" viewBox="0 0 100 100"
          style={{ position: 'absolute', ...pos, transform: `rotate(${rotate}deg)`, opacity: 0.65 }}>
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
  const [currentPage, setCurrentPage] = useState<number>(1);

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

          {/* Lesson page steps indicator */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                    p === currentPage
                      ? 'w-6 bg-indigo-500'
                      : p < currentPage
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-slate-700'
                  }`}
                  title={`Page ${p}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
              {currentPage === 1 && '1. Introduction'}
              {currentPage === 2 && '2. Key Phrases'}
              {currentPage === 3 && '3. Tips & Notes'}
              {currentPage === 4 && '4. Practice'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {currentPage === 1 && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
                <h4 className="text-sm font-black text-indigo-400 uppercase tracking-wider mb-3">Introduction & Overview</h4>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{lesson.content.intro}</p>
              </div>
            </div>
          )}

          {currentPage === 2 && (
            <div className="space-y-6">
              <h4 className="text-sm font-black text-indigo-400 uppercase tracking-wider mb-3">Key Phrases / Vocabulary</h4>
              <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
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
          )}

          {currentPage === 3 && (
            <div className="space-y-6">
              <h4 className="text-sm font-black text-indigo-400 uppercase tracking-wider mb-3">Tips & Notes</h4>
              <div className="space-y-3 bg-slate-800/30 border border-slate-700/40 rounded-2xl p-5">
                {lesson.content.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentPage === 4 && (
            <div className="space-y-6">
              <h4 className="text-sm font-black text-indigo-400 uppercase tracking-wider mb-3">Practice Activity</h4>
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-white font-black">Practice Task</h4>
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
          {currentPage > 1 ? (
            <button
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="flex items-center gap-1.5 text-slate-400 text-sm font-bold hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-slate-400 text-sm font-bold hover:text-white transition-colors"
            >
              <X className="w-4 h-4" /> Close
            </button>
          )}

          {currentPage < 4 ? (
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/20"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : isCompleted ? (
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

/* ─── Language Exam Stepper Overlay ──────────────────────────── */
function LanguageExamViewer({
  exam,
  onClose,
  onAnswer,
  onNavigate,
  onSubmit,
  onRetake,
  onClaimCertificate,
}: {
  exam: {
    languageId: string;
    questions: ExamQuestion[];
    currentIdx: number;
    answers: Record<number, number>;
    finished: boolean;
    score: number;
  };
  onClose: () => void;
  onAnswer: (questionIdx: number, optionIdx: number) => void;
  onNavigate: (questionIdx: number) => void;
  onSubmit: () => void;
  onRetake: () => void;
  onClaimCertificate: () => void;
}) {
  const [showReview, setShowReview] = useState(false);
  const [cameraState, setCameraState] = useState<'prompt' | 'loading_model' | 'active' | 'denied'>('prompt');
  const [isPausedByTab, setIsPausedByTab] = useState(false);
  const [isPausedByFace, setIsPausedByFace] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modelRef = useRef<any>(null);
  const faceDetectionInterval = useRef<any>(null);

  const currentQ = exam.questions[exam.currentIdx];
  const totalQuestions = exam.questions.length;
  const answeredCount = Object.keys(exam.answers).length;
  const allAnswered = answeredCount === totalQuestions;

  const mod = languageModules.find(m => m.id === exam.languageId)!;

  const loadProctoringScripts = () => {
    return new Promise<void>((resolve, reject) => {
      if ((window as any).tf && (window as any).blazeface) {
        resolve();
        return;
      }
      const tfScript = document.createElement('script');
      tfScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js";
      tfScript.async = true;
      tfScript.onload = () => {
        const bfScript = document.createElement('script');
        bfScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.7/dist/blazeface.min.js";
        bfScript.async = true;
        bfScript.onload = () => {
          resolve();
        };
        bfScript.onerror = (e) => reject(e);
        document.body.appendChild(bfScript);
      };
      tfScript.onerror = (e) => reject(e);
      document.body.appendChild(tfScript);
    });
  };

  const cleanUpProctoring = () => {
    if (faceDetectionInterval.current) {
      clearInterval(faceDetectionInterval.current);
      faceDetectionInterval.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraState('prompt');
    setIsPausedByTab(false);
    setIsPausedByFace(false);
  };

  useEffect(() => {
    return () => {
      cleanUpProctoring();
    };
  }, []);

  useEffect(() => {
    if (exam.finished) {
      cleanUpProctoring();
    }
  }, [exam.finished]);

  const handleStartProctoring = async () => {
    setCameraState('loading_model');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' }
      });
      streamRef.current = stream;

      await loadProctoringScripts();
      const loadedModel = await (window as any).blazeface.load();
      modelRef.current = loadedModel;

      setCameraState('active');
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 200);
    } catch (err) {
      console.error('Proctoring initialization failed', err);
      setCameraState('denied');
    }
  };

  useEffect(() => {
    if (cameraState !== 'active' || exam.finished) return;

    const handleBlur = () => {
      setIsPausedByTab(true);
    };
    const handleFocus = () => {
      setIsPausedByTab(false);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsPausedByTab(true);
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cameraState, exam.finished]);

  useEffect(() => {
    if (cameraState !== 'active' || exam.finished || !modelRef.current) return;

    let consecutiveNoFaceCount = 0;

    faceDetectionInterval.current = setInterval(async () => {
      if (!videoRef.current || !modelRef.current) return;
      try {
        const returnTensors = false;
        const predictions = await modelRef.current.estimateFaces(videoRef.current, returnTensors);
        
        if (predictions.length === 0) {
          consecutiveNoFaceCount++;
          if (consecutiveNoFaceCount >= 2) {
            setIsPausedByFace(true);
          }
        } else {
          const face = predictions[0];
          const probability = face.probability ? face.probability[0] : 1.0;
          
          if (probability < 0.85) {
            consecutiveNoFaceCount++;
            if (consecutiveNoFaceCount >= 2) {
              setIsPausedByFace(true);
            }
          } else {
            consecutiveNoFaceCount = 0;
            setIsPausedByFace(false);
          }
        }
      } catch (e) {
        console.error('Face prediction error', e);
      }
    }, 800);

    return () => {
      if (faceDetectionInterval.current) {
        clearInterval(faceDetectionInterval.current);
      }
    };
  }, [cameraState, exam.finished]);

  if (exam.finished) {
    const passed = exam.score >= 23;
    return (
      <div className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{mod.flag}</span>
              <div>
                <h3 className="text-white font-black text-lg">{mod.language} Exam Results</h3>
                <p className="text-slate-400 text-xs">Certification Exam</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 flex-1">
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-850 border border-slate-800 relative">
                {passed ? (
                  <Award className="w-10 h-10 text-amber-400 animate-pulse" />
                ) : (
                  <X className="w-10 h-10 text-rose-500" />
                )}
              </div>

              <div className="space-y-1">
                <h2 className={`text-2xl font-black ${passed ? 'text-emerald-400' : 'text-rose-455 text-rose-400'}`}>
                  {passed ? 'Exam Passed!' : 'Exam Failed'}
                </h2>
                <p className="text-slate-400 text-sm">
                  You scored <span className="text-white font-bold">{exam.score}</span> out of <span className="text-white font-bold">30</span> ({(exam.score / 30 * 100).toFixed(0)}%)
                </p>
              </div>

              {passed ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 max-w-md mx-auto">
                  <p className="text-emerald-300 text-sm font-medium">
                    🎉 Excellent! You have successfully unlocked your certificate of completion for {mod.language} and earned <span className="text-amber-400 font-bold">+500 XP</span> for your companion!
                  </p>
                </div>
              ) : (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 max-w-md mx-auto">
                  <p className="text-rose-300 text-sm font-medium">
                    You need at least <span className="text-white font-bold">23 correct answers</span> (77%) to pass and unlock the certificate. Keep studying and try again!
                  </p>
                </div>
              )}
            </div>

            {/* Review Section Toggle */}
            <div className="border-t border-slate-800 pt-4">
              <button
                onClick={() => setShowReview(!showReview)}
                className="w-full flex items-center justify-between py-2 text-slate-300 hover:text-white transition-colors text-sm font-bold"
              >
                <span>{showReview ? 'Hide Question Review' : 'Review Questions & Explanations'}</span>
                <ChevronRight className={`w-4 h-4 transform transition-transform ${showReview ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence>
                {showReview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-4 mt-3"
                  >
                    {exam.questions.map((q, idx) => {
                      const userAns = exam.answers[idx];
                      const isCorrect = userAns === q.answerIndex;
                      return (
                        <div key={q.id} className={`p-4 rounded-xl border ${isCorrect ? 'bg-emerald-500/[0.02] border-emerald-500/20' : 'bg-rose-500/[0.02] border-rose-500/20'}`}>
                          <div className="flex items-start gap-2.5">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                              {idx + 1}
                            </span>
                            <div className="space-y-2 flex-1">
                              <h4 className="text-white font-bold text-sm">{q.question}</h4>
                              <div className="space-y-1.5">
                                {q.options.map((opt, optIdx) => {
                                  const isUserSelected = userAns === optIdx;
                                  const isRightAnswer = optIdx === q.answerIndex;
                                  return (
                                    <div
                                      key={optIdx}
                                      className={`text-xs p-2 rounded-lg flex items-center justify-between border ${
                                        isRightAnswer
                                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold'
                                          : isUserSelected
                                          ? 'border-rose-500/40 bg-rose-500/10 text-rose-350 text-rose-300'
                                          : 'border-slate-800 bg-slate-950/40 text-slate-400'
                                      }`}
                                    >
                                      <span>{opt}</span>
                                      {isRightAnswer && <span className="text-[10px] uppercase font-bold text-emerald-400">Correct Answer</span>}
                                      {isUserSelected && !isRightAnswer && <span className="text-[10px] uppercase font-bold text-rose-400">Your Answer</span>}
                                    </div>
                                  );
                                })}
                              </div>
                              <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                                💡 <span className="font-bold text-slate-350">Explanation:</span> {q.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row gap-3 shrink-0">
            {passed ? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20"
                >
                  <Award className="w-4 h-4" />
                  Claim Certificate
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white font-bold text-sm hover:bg-slate-800 transition-all"
                >
                  Close Results
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    cleanUpProctoring();
                    onRetake();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-sm hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retake Exam
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white font-bold text-sm hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (cameraState !== 'active') {
    return (
      <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5 text-center"
        >
          <div className="flex flex-col items-center gap-3">
            <span className="text-4xl">{mod.flag}</span>
            <h3 className="text-white font-black text-xl">{mod.language} Exam Proctoring</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              To unlock the certificate of completion, this final exam uses automated camera monitoring to verify focus and prevent browser/tab swapping.
            </p>
          </div>

          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 text-left space-y-3">
            <div className="flex gap-2.5 items-start">
              <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-xs font-black text-indigo-400 mt-0.5">
                1
              </div>
              <p className="text-slate-350 text-xs leading-relaxed font-semibold">
                <span className="text-white font-bold">Camera Access:</span> Grant camera permission so the face detector can track focus.
              </p>
            </div>
            <div className="flex gap-2.5 items-start">
              <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-xs font-black text-indigo-400 mt-0.5">
                2
              </div>
              <p className="text-slate-350 text-xs leading-relaxed font-semibold">
                <span className="text-white font-bold">Tab Lock:</span> Alt-tabbing, switching tabs, or resizing the browser window will pause the exam.
              </p>
            </div>
            <div className="flex gap-2.5 items-start">
              <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-xs font-black text-indigo-400 mt-0.5">
                3
              </div>
              <p className="text-slate-350 text-xs leading-relaxed font-semibold">
                <span className="text-white font-bold">Face Detection:</span> Looking away from the screen for more than 1 second will pause the exam.
              </p>
            </div>
          </div>

          {cameraState === 'denied' && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-left">
              <p className="text-rose-400 text-xs font-semibold leading-relaxed animate-pulse">
                ❌ Camera access was denied or failed. You must grant camera access to begin the certification exam.
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white font-bold text-xs hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            {cameraState === 'loading_model' ? (
              <button
                disabled
                className="flex-1 px-4 py-3 rounded-xl bg-indigo-600/50 text-white/50 font-black text-xs cursor-not-allowed flex items-center justify-center gap-2"
              >
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Initializing...
              </button>
            ) : (
              <button
                onClick={handleStartProctoring}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xs hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
              >
                Enable Cam & Start
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-6 py-4 rounded-t-3xl flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{mod.flag}</span>
              <div>
                <h3 className="text-white font-black text-lg">{mod.language} Certification Exam</h3>
                <p className="text-slate-400 text-xs">Answer 30 questions · Pass grade: 23/30</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/60 flex flex-col gap-2 shrink-0">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-indigo-400 uppercase tracking-wider">Question {exam.currentIdx + 1} of {totalQuestions}</span>
              <span className="text-slate-500 font-medium">{answeredCount} of {totalQuestions} answered</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${((exam.currentIdx + 1) / totalQuestions) * 100}%` }} />
            </div>
          </div>

          {/* Body content */}
          <div className="p-6 space-y-6 flex-1">
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-5 shadow-inner">
              <p className="text-slate-100 font-extrabold text-base sm:text-lg leading-relaxed">{currentQ.question}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {currentQ.options.map((option, optIdx) => {
                const letter = String.fromCharCode(65 + optIdx);
                const isSelected = exam.answers[exam.currentIdx] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => onAnswer(exam.currentIdx, optIdx)}
                    className={`text-left p-4 rounded-2xl border transition-all flex items-start gap-3 w-full group relative ${
                      isSelected
                        ? 'bg-indigo-500/15 border-indigo-500 text-white shadow-lg shadow-indigo-500/5'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                      isSelected
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-500 group-hover:bg-slate-750 group-hover:text-indigo-400'
                    }`}>
                      {letter}
                    </span>
                    <span className="text-sm font-semibold pt-0.5 leading-normal">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dot Navigation Panel */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/20 shrink-0">
            <div className="flex flex-wrap gap-1.5 justify-center max-w-xl mx-auto">
              {exam.questions.map((_, idx) => {
                const isCurrent = exam.currentIdx === idx;
                const isAnswered = exam.answers[idx] !== undefined;
                return (
                  <button
                    key={idx}
                    onClick={() => onNavigate(idx)}
                    className={`w-7 h-7 text-[10px] font-black rounded-lg transition-all border flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500'
                        : isAnswered
                        ? 'bg-indigo-950/40 border-indigo-900 text-indigo-400 hover:border-indigo-700'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-350 hover:border-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer controls */}
          <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 px-6 py-4 rounded-b-3xl flex items-center justify-between gap-4 shrink-0">
            <button
              disabled={exam.currentIdx === 0}
              onClick={() => onNavigate(exam.currentIdx - 1)}
              className="flex items-center gap-1.5 text-slate-400 disabled:opacity-30 disabled:hover:text-slate-400 text-sm font-bold hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {exam.currentIdx + 1 === totalQuestions ? (
              <button
                onClick={onSubmit}
                disabled={!allAnswered}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-650 text-slate-950 hover:text-white disabled:text-slate-950 disabled:from-emerald-500/50 disabled:to-teal-600/50 disabled:cursor-not-allowed disabled:scale-100 font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={() => onNavigate(exam.currentIdx + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-sm font-bold hover:bg-slate-800 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Floating live video preview widget */}
      <div className="fixed bottom-4 right-4 z-[550] bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2.5 flex flex-col items-center gap-1.5 shadow-2xl backdrop-blur-md w-28">
        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${isPausedByFace ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
          Live Cam
        </span>
        <div className="relative w-24 h-18 rounded-lg overflow-hidden border border-slate-800 bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
          {isPausedByFace && (
            <div className="absolute inset-0 bg-rose-950/60 flex items-center justify-center">
              <Lock className="w-4 h-4 text-rose-400 animate-pulse" />
            </div>
          )}
        </div>
        <span className="text-[8px] text-slate-400 text-center font-bold">Proctored Active</span>
      </div>

      {/* Paused Proctoring Overlays */}
      {(isPausedByTab || isPausedByFace) && (
        <div className="fixed inset-0 z-[600] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-rose-500/30 rounded-3xl p-8 max-w-md shadow-2xl shadow-rose-950/20 flex flex-col items-center gap-5"
          >
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center animate-pulse">
              <Lock className="w-8 h-8 text-rose-400" />
            </div>
            
            {isPausedByTab ? (
              <>
                <h3 className="text-white font-black text-xl">Exam Paused: Tab Changed</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  You switched browser tabs or windows. Switching tabs, alt-tabbing, or clicking away is strictly prohibited during the certification exam.
                </p>
                <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider animate-pulse">
                  Please click back inside this window to resume.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-white font-black text-xl">Exam Paused: Focus Lost</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Please face only on the monitor screen or focus on the exam. Ensure your face is fully visible to the camera.
                </p>
                <div className="w-20 h-15 rounded-lg overflow-hidden border border-slate-700 bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                </div>
                <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider animate-pulse">
                  Looking back at the screen will automatically resume the exam.
                </p>
              </>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function LanguageModulesPage() {
  const { user, isLoading, isGuest } = useAuth();
  const [activeLanguage, setActiveLanguage] = useState<string>(languageModules[0].id);
  const [completedLessons, setCompletedLessons] = useState<Record<string, Set<string>>>({});
  const [selectedLesson, setSelectedLesson] = useState<{ lesson: Lesson; index: number } | null>(null);
  const [showCertificate, setShowCertificate] = useState<string | null>(null);

  // Exams states
  const [passedExams, setPassedExams] = useState<Record<string, boolean>>({});
  const [activeExam, setActiveExam] = useState<{
    languageId: string;
    questions: ExamQuestion[];
    currentIdx: number;
    answers: Record<number, number>;
    finished: boolean;
    score: number;
  } | null>(null);

  // Load progress on mount
  useEffect(() => {
    try {
      const storedLessons = localStorage.getItem('lingoland_language_modules_completed_lessons');
      if (storedLessons) {
        const parsed = JSON.parse(storedLessons);
        const loaded: Record<string, Set<string>> = {};
        Object.entries(parsed).forEach(([lang, lessons]) => {
          loaded[lang] = new Set(lessons as string[]);
        });
        setCompletedLessons(loaded);
      }
    } catch (e) {
      console.error('Failed to load completed lessons from localStorage:', e);
    }

    try {
      const storedExams = localStorage.getItem('lingoland_language_modules_passed_exams');
      if (storedExams) {
        setPassedExams(JSON.parse(storedExams));
      }
    } catch (e) {
      console.error('Failed to load passed exams from localStorage:', e);
    }
  }, []);

  const currentModule = languageModules.find(m => m.id === activeLanguage)!;
  const completedForLang = completedLessons[activeLanguage] ?? new Set<string>();
  const allComplete = currentModule.lessons.every(l => completedForLang.has(l.id));

  const handleComplete = (langId: string, lessonId: string) => {
    setCompletedLessons(prev => {
      const updated = new Set(prev[langId] ?? []);
      updated.add(lessonId);
      const next = { ...prev, [langId]: updated };
      try {
        const serializable = Object.fromEntries(
          Object.entries(next).map(([k, set]) => [k, Array.from(set)])
        );
        localStorage.setItem('lingoland_language_modules_completed_lessons', JSON.stringify(serializable));
      } catch (e) {
        console.error('Failed to save completed lessons', e);
      }
      return next;
    });
  };

  const handlePassExam = (langId: string) => {
    setPassedExams(prev => {
      const next = { ...prev, [langId]: true };
      try {
        localStorage.setItem('lingoland_language_modules_passed_exams', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save passed exams', e);
      }
      return next;
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
            Sign in to access all {languageModules.length} language modules with {languageModules[0]?.lessons.length ?? 15} lessons each, track your progress, and earn completion certificates.
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

      {/* Exam Stepper Modal */}
      <AnimatePresence>
        {activeExam && (
          <LanguageExamViewer
            exam={activeExam}
            onClose={() => setActiveExam(null)}
            onAnswer={(questionIdx, optionIdx) => {
              setActiveExam(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  answers: { ...prev.answers, [questionIdx]: optionIdx }
                };
              });
            }}
            onNavigate={(questionIdx) => {
              setActiveExam(prev => {
                if (!prev) return null;
                return { ...prev, currentIdx: questionIdx };
              });
            }}
            onClaimCertificate={() => {
              setShowCertificate(activeExam.languageId);
            }}
            onSubmit={async () => {
              if (!activeExam) return;
              let score = 0;
              activeExam.questions.forEach((q, idx) => {
                if (activeExam.answers[idx] === q.answerIndex) {
                  score += 1;
                }
              });
              
              const passed = score >= 23;
              
              setActiveExam(prev => {
                if (!prev) return null;
                return { ...prev, finished: true, score };
              });

              if (passed) {
                handlePassExam(activeExam.languageId);
                // Reward XP to the user's pet profile!
                if (user) {
                  try {
                    const petData = await getUserPet(user.uid);
                    const currentXp = petData ? (petData.xp || 0) : 150;
                    const currentLevel = petData ? (petData.level || 1) : 1;
                    const currentCoins = petData ? (petData.coins || 0) : 120;
                    
                    const xpToAdd = 500;
                    let level = currentLevel;
                    let xp = currentXp + xpToAdd;
                    let threshold = level * 500;
                    while (xp >= threshold) {
                      xp -= threshold;
                      level += 1;
                      threshold = level * 500;
                    }
                    
                    // Also add some bonus coins for passing, e.g. +100 Coins
                    const newCoins = currentCoins + 100;
                    
                    const updates: Partial<UserPet> = {
                      xp,
                      level,
                      coins: newCoins,
                      lastActive: new Date().toISOString(),
                    };
                    
                    // Save
                    await saveUserPet(user.uid, updates);
                    
                    // Synchronize profile
                    const { firestore } = initializeFirebase();
                    const userRef = doc(firestore, 'users', user.uid);
                    await setDoc(userRef, {
                      activePetLevel: level,
                    }, { merge: true });
                    
                    console.log('Rewarded XP and coins to user pet successfully!');
                  } catch (e) {
                    console.error('Failed to reward XP/coins to user pet', e);
                  }
                }
              }
            }}
            onRetake={() => {
              const questions = languageExams[activeExam.languageId] || [];
              setActiveExam({
                languageId: activeExam.languageId,
                questions: questions,
                currentIdx: 0,
                answers: {},
                finished: false,
                score: 0
              });
            }}
          />
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent flex items-center gap-2.5">
              <GraduationCap className="h-7 w-7 text-indigo-400" />
              Language Modules
            </h1>
            <p className="text-xs text-slate-400 mt-1">{languageModules.length} languages · {currentModule.lessons.length} lessons each · Earn a certificate when you complete all lessons</p>
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
                  passedExams[activeLanguage] ? (
                    <button
                      onClick={() => setShowCertificate(activeLanguage)}
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/25 shrink-0"
                    >
                      <Award className="w-5 h-5 animate-bounce" />
                      Get Certificate!
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const questions = languageExams[activeLanguage] || [];
                        setActiveExam({
                          languageId: activeLanguage,
                          questions: questions,
                          currentIdx: 0,
                          answers: {},
                          finished: false,
                          score: 0
                        });
                      }}
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-sm hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/25 shrink-0"
                    >
                      <GraduationCap className="w-5 h-5" />
                      Take Exam
                    </button>
                  )
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
                  <p className="text-emerald-400/70 text-sm">
                    {passedExams[activeLanguage]
                      ? 'Click "Get Certificate!" to generate and download your certificate of completion.'
                      : 'You can now take the 30-question Certification Exam to unlock your certificate and earn +500 XP!'}
                  </p>
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
