import { useState, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { TargetLanguage } from "../types";

export const LANGUAGES: TargetLanguage[] = [
  { code: "th", name: "ไทย (Thai)", flag: "🇹🇭", greetingCode: "สวัสดี" },
  { code: "ko", name: "한국어 (Korean)", flag: "🇰🇷", greetingCode: "안녕하세요" },
  { code: "ja", name: "日本語 (Japanese)", flag: "🇯🇵", greetingCode: "こんにちは" },
  { code: "es", name: "Español (Spanish)", flag: "🇪🇸", greetingCode: "Hola" },
  { code: "fr", name: "Français (French)", flag: "🇫🇷", greetingCode: "Bonjour" },
  { code: "vi", name: "Tiếng Việt (Vietnamese)", flag: "🇻🇳", greetingCode: "Xin chào" },
  { code: "zh", name: "中文 (Chinese)", flag: "🇨🇳", greetingCode: "你好" },
  { code: "de", name: "Deutsch (German)", flag: "🇩🇪", greetingCode: "Hallo" },
];

interface LanguageSelectorProps {
  currentLanguage: TargetLanguage;
  onLanguageChange: (lang: TargetLanguage) => void;
}

export default function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [detectedLoc, setDetectedLoc] = useState<string>("");

  useEffect(() => {
    // Attempt to auto-detect browser language
    const browserLang = navigator.language?.split("-")[0];
    const match = LANGUAGES.find((l) => l.code === browserLang);
    if (match && !localStorage.getItem("study_room_lang_code")) {
      onLanguageChange(match);
      setDetectedLoc(`Auto-detected: ${match.flag} ${match.name}`);
    } else {
      setDetectedLoc(`Default set: ${currentLanguage.flag} ${currentLanguage.name}`);
    }
  }, []);

  const handleSelect = (lang: TargetLanguage) => {
    onLanguageChange(lang);
    localStorage.setItem("study_room_lang_code", lang.code);
    setIsOpen(false);
    setDetectedLoc(`Selected: ${lang.flag} ${lang.name}`);
  };

  return (
    <div className="relative">
      <button
        id="language-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-slate-900 hover:bg-slate-50 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-sm font-bold transition-all cursor-pointer text-slate-900"
      >
        <Globe className="w-4 h-4 text-indigo-600 animate-spin-slow" />
        <span className="font-display">
          {currentLanguage.flag} {currentLanguage.name}
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-64 bg-white border-2 border-slate-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] z-20 overflow-hidden divide-y-2 divide-slate-900 animate-fade-in font-display">
            <div className="px-4 py-2.5 bg-slate-100 text-xs text-slate-800 font-extrabold tracking-wider uppercase border-b-2 border-slate-900">
              {detectedLoc || "Select Interface Locale"}
            </div>
            <div className="py-1 max-h-72 overflow-y-auto divide-y divide-slate-100">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  id={`lang-opt-${lang.code}`}
                  onClick={() => handleSelect(lang)}
                  className="flex items-center justify-between w-full px-4 py-2 text-xs font-bold text-slate-900 hover:bg-indigo-50 transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg leading-none">{lang.flag}</span>
                    <span className="font-sans">{lang.name}</span>
                  </span>
                  {currentLanguage.code === lang.code && (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <div className="px-4 py-2.5 bg-indigo-50 text-[10px] text-indigo-900 font-bold border-t-2 border-slate-900">
              ⚡ English syllabus will translate dynamically.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
