import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, X, User, Building2, Calendar, Sparkles, Download } from "lucide-react";
import html2canvas from "html2canvas";

interface CertificateData {
  fullName: string;
  courseName: string;
  completionDate: string;
  score: string;
  showSeal?: boolean;
  sealStyle?: "logo" | "star";
}

interface LanguageCertificateProps {
  language: string;
  flag: string;
  onClose: () => void;
  score?: number;
}

export default function LanguageCertificate({ language, flag, onClose, score }: LanguageCertificateProps) {
  const [form, setForm] = useState<CertificateData>({
    fullName: "",
    courseName: `${language} Language Mastery`,
    completionDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    score: score !== undefined ? `Score: ${score}/30` : "Score: 30/30",
    showSeal: true,
    sealStyle: "logo",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);
  const downloadCertRef = useRef<HTMLDivElement>(null);

  const handleDownloadJPG = useCallback(async () => {
    if (!form.fullName.trim() || !downloadCertRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(downloadCertRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        width: 900,
        height: 638,
        windowWidth: 900,
        windowHeight: 638,
      });
      const dataUrl = canvas.toDataURL("image/jpeg", 0.97);
      const link = document.createElement("a");
      link.download = `${form.fullName.replace(/\s+/g, "_")}_${language}_Certificate.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Certificate download failed", e);
    } finally {
      setIsGenerating(false);
    }
  }, [form, language]);

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border-2 border-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-slate-900 font-black text-lg uppercase tracking-wider font-display">Certificate of Completion</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{flag} {language} Mastery</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white border-2 border-slate-900 hover:bg-slate-100 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer">
            <X className="w-4 h-4 text-slate-900" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 font-display">
                <User className="w-3.5 h-3.5" /> Full Name *
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                className="w-full bg-white border-2 border-slate-900 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 font-display">
                <Building2 className="w-3.5 h-3.5" /> Course Name
              </label>
              <input
                type="text"
                value={form.courseName}
                onChange={(e) => setForm((p) => ({ ...p, courseName: e.target.value }))}
                className="w-full bg-white border-2 border-slate-900 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 font-display">
                <Calendar className="w-3.5 h-3.5" /> Date of Completion
              </label>
              <input
                type="text"
                value={form.completionDate}
                onChange={(e) => setForm((p) => ({ ...p, completionDate: e.target.value }))}
                className="w-full bg-white border-2 border-slate-900 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 font-display">
                <Sparkles className="w-3.5 h-3.5" /> Test Score
              </label>
              <input
                type="text"
                placeholder="e.g. Score: 27/30"
                value={form.score}
                onChange={(e) => setForm((p) => ({ ...p, score: e.target.value }))}
                className="w-full bg-white border-2 border-slate-900 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 font-display">
                <Award className="w-3.5 h-3.5" /> Official Seal
              </label>
              <div className="flex items-center gap-4 h-[48px] bg-white border-2 border-slate-900 rounded-xl px-4">
                <label className="flex items-center gap-2.5 text-slate-900 text-sm font-semibold cursor-pointer select-none w-full">
                  <input
                    type="checkbox"
                    checked={form.showSeal !== false}
                    onChange={(e) => setForm((p) => ({ ...p, showSeal: e.target.checked }))}
                    className="w-4 h-4 rounded border-2 border-slate-900 bg-white text-indigo-600 focus:ring-indigo-400 accent-indigo-600 cursor-pointer"
                  />
                  <span>Show Official Seal</span>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 font-display">
                <Sparkles className="w-3.5 h-3.5" /> Seal Logo Style
              </label>
              <select
                disabled={form.showSeal === false}
                value={form.sealStyle || "logo"}
                onChange={(e) => setForm((p) => ({ ...p, sealStyle: e.target.value as "logo" | "star" }))}
                className="w-full h-[48px] bg-white border-2 border-slate-900 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="logo">LingoLandVerse Logo (Default)</option>
                <option value="star">Classic Gold Star</option>
              </select>
            </div>
          </div>

          {/* Preview */}
          <div className="overflow-hidden rounded-2xl border-2 border-slate-900 bg-slate-50 p-4">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 text-center font-display">Preview</p>
            <div className="flex justify-center">
              <div style={{ width: 900, transformOrigin: "top center", transform: "scale(0.55)", marginBottom: "-250px" }}>
                <CertificateCanvas ref={certRef} data={form} language={language} flag={flag} />
              </div>
            </div>
          </div>

          {/* Hidden, unscaled CertificateCanvas for download capture */}
          <div style={{ position: "absolute", top: -9999, left: -9999, width: 900, height: 638, overflow: "hidden", pointerEvents: "none" }}>
            <CertificateCanvas ref={downloadCertRef} data={form} language={language} flag={flag} />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t-2 border-slate-100">
            <button
              onClick={handleDownloadJPG}
              disabled={!form.fullName.trim() || isGenerating}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 border-2 border-slate-900 text-slate-900 font-black uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-300 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-display cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {isGenerating ? "Generating..." : "Download Certificate (JPG)"}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3.5 rounded-xl border-2 border-slate-900 bg-white text-slate-900 font-black uppercase tracking-wider text-sm hover:bg-slate-50 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-display cursor-pointer"
            >
              Cancel
            </button>
          </div>
          {!form.fullName.trim() && (
            <p className="text-xs text-center font-bold text-amber-600">⚠ Please enter your full name to download the certificate.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

const CertificateCanvas = React.forwardRef<HTMLDivElement, {
  data: CertificateData;
  language: string;
  flag: string;
}>(({ data, language, flag }, ref) => {
  const gradFrom = "#2563eb";
  const gradTo = "#8b5cf6";

  return (
    <div
      ref={ref}
      style={{
        width: 900,
        height: 638,
        background: "linear-gradient(135deg, #fffbeb 0%, #fef9ec 40%, #fffdf5 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Georgia, serif",
        boxSizing: "border-box",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Great+Vibes&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');`}</style>
      
      {/* Outer border simulated with 4 absolute lines to avoid html2canvas border-image issue */}
      <div style={{
        position: 'absolute', top: 10, left: 10, right: 10, height: 6,
        background: `linear-gradient(to right, ${gradFrom}, #d97706, ${gradTo})`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 10, left: 10, right: 10, height: 6,
        background: `linear-gradient(to right, ${gradFrom}, #d97706, ${gradTo})`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 10, bottom: 10, left: 10, width: 6,
        background: `linear-gradient(to bottom, ${gradFrom}, #d97706, ${gradTo})`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 10, bottom: 10, right: 10, width: 6,
        background: `linear-gradient(to bottom, ${gradFrom}, #d97706, ${gradTo})`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: "absolute", inset: 20, border: "1.5px solid rgba(180,83,9,0.4)", pointerEvents: "none" }} />
      {[
        { top: 14, left: 14, rotate: 0 },
        { top: 14, right: 14, rotate: 90 },
        { bottom: 14, left: 14, rotate: -90 },
        { bottom: 14, right: 14, rotate: 180 },
      ].map(({ rotate, ...pos }, i) => (
        <svg key={i} width="36" height="36" viewBox="0 0 100 100" style={{ position: "absolute", ...pos, transform: `rotate(${rotate}deg)`, opacity: 0.65 }}>
          <path d="M0,0 L30,0 Q10,10 0,30 Z" fill={gradFrom} />
          <rect x="6" y="6" width="2" height="36" fill={gradFrom} />
          <rect x="6" y="6" width="36" height="2" fill={gradFrom} />
        </svg>
      ))}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 200, opacity: 0.03, userSelect: "none", pointerEvents: "none", lineHeight: 1 }}>{flag}</div>
      <div style={{ position: "absolute", inset: 28, textAlign: "center", boxSizing: "border-box" }}>
        <div style={{
          position: "absolute",
          top: 15,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 28 }}>{flag}</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#78350f", opacity: 0.75 }}>LingoLandVerse · Language Academy</div>
        </div>
        <div style={{
          position: "absolute",
          top: 110,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          textAlign: "center",
        }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 38, fontWeight: 900, letterSpacing: "0.08em", color: "#78350f", lineHeight: 1.1, textShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>CERTIFICATE OF COMPLETION</div>
          <div style={{ width: 120, height: 2, background: `linear-gradient(to right, transparent, ${gradFrom}, transparent)`, marginTop: 4 }} />
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 13, color: "#92400e", opacity: 0.8, letterSpacing: "0.05em" }}>This is to proudly certify that</div>
        </div>
        
        {/* Recipient name (dynamic sizing + styling fixes to prevent vertical clipping) */}
        {(() => {
          const nameLength = data.fullName.length;
          const nameFontSize = nameLength > 28 ? 32 : nameLength > 18 ? 44 : 56;
          return (
            <div style={{
              position: 'absolute',
              top: 235,
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: "'Great Vibes', cursive",
                fontSize: nameFontSize,
                color: "#1e3a5f",
                lineHeight: 1.4,
                letterSpacing: "0.01em",
                maxWidth: 700,
                textAlign: "center"
              }}>
                {data.fullName || "Your Full Name"}
              </div>
              <div style={{ width: "70%", height: 1.5, background: `linear-gradient(to right, transparent, ${gradFrom}aa, transparent)` }} />
            </div>
          );
        })()}

        <div style={{
          position: "absolute",
          top: 350,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          textAlign: "center",
        }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 13, color: "#78350f", opacity: 0.8 }}>has successfully completed all modules in</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 19, fontWeight: 700, color: "#7c2d12", letterSpacing: "0.06em", textDecoration: "underline", textDecorationColor: `${gradFrom}66`, textUnderlineOffset: 4 }}>{data.courseName}</div>
          {data.score && (
            <div style={{
              display: 'inline-block',
              padding: '4px 20px',
              border: `1px solid ${gradFrom}33`,
              borderRadius: 20,
              backgroundColor: '#fffbeb',
              fontFamily: "'Cinzel', serif",
              fontSize: 10,
              fontWeight: 700,
              color: '#b45309',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: 8,
              textAlign: 'center',
            }}>
              {data.score}
            </div>
          )}
        </div>
        
        {/* Footer info */}
        <div style={{
          position: "absolute",
          bottom: 15,
          left: 40,
          width: 180,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          textAlign: "center",
        }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 12, color: "#1e293b", fontWeight: 600 }}>{data.completionDate}</div>
          <div style={{ width: 120, height: 1, background: "#94a3b8" }} />
          <div style={{ fontFamily: "Georgia, serif", fontSize: 9, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>Date Issued</div>
        </div>

        {/* Seal */}
        {data.showSeal !== false && (
          <div style={{
            position: "absolute",
            bottom: 5,
            left: "50%",
            transform: "translateX(-50%)",
            width: 180,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            textAlign: "center"
          }}>
            {data.sealStyle === "star" ? (
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "radial-gradient(circle, #fbbf24 0%, #d97706 70%, #b45309 100%)",
                border: "3px solid #fde68a",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(180,83,9,0.4)"
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.209l8.2-1.191L12 .587z" /></svg>
              </div>
            ) : (
              <div style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                backgroundColor: "#f8fafc",
                border: "3px solid #fde68a",
                boxShadow: "0 4px 12px rgba(180,83,9,0.3)",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <img
                  src="/logo.png"
                  crossOrigin="anonymous"
                  alt="LingoLandVerse Logo"
                  style={{
                    height: 50,
                    width: "auto",
                  }}
                />
              </div>
            )}
            <div style={{ fontFamily: "Georgia, serif", fontSize: 9, color: "#92400e", letterSpacing: "0.15em", textTransform: "uppercase" }}>Official Seal</div>
          </div>
        )}

        <div style={{
          position: "absolute",
          bottom: 15,
          right: 40,
          width: 180,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          textAlign: "center",
        }}>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 16, color: "#1e293b", fontWeight: 600 }}>LingoLandVerse</div>
          <div style={{ width: 120, height: 1, background: "#94a3b8" }} />
          <div style={{ fontFamily: "Georgia, serif", fontSize: 9, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>Language Director</div>
        </div>
      </div>
    </div>
  );
});
CertificateCanvas.displayName = "CertificateCanvas";
