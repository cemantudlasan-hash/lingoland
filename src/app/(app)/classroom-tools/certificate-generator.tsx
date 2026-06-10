'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import {
  Award,
  Printer,
  Plus,
  Trash2,
  Upload,
  Check,
  Sparkles,
  Settings,
  UserPlus,
  Eye,
  FileSpreadsheet,
  Download,
  BookOpen
} from 'lucide-react';

// Define the interface for a Student Certificate
interface StudentCertificate {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  className: string;
  honor: 'none' | 'honors' | 'high-honors' | 'highest-honors';
  awardType: string;
  awardRank?: string; // For Top 10 (1-10)
  customAwardTitle?: string;
  customDescription?: string;
}

// Preset award descriptions template
const awardTemplates: Record<string, { title: string; desc: (name: string, pronouns: any) => string }> = {
  'best-speaker': {
    title: 'Best Speaker',
    desc: (name, p) => `This is to certify that ${name} did an excellent job in using English language in the class, demonstrating outstanding verbal expression, confidence, and public speaking skills.`
  },
  'best-speller': {
    title: 'Best in Spelling',
    desc: (name, p) => `This is to certify that ${name} has demonstrated outstanding spelling accuracy and vocabulary skills during spelling activities and class spelling bees.`
  },
  'most-cooperative': {
    title: 'Most Cooperative',
    desc: (name, p) => `This is to certify that ${name} has consistently shown exceptional teamwork, helpfulness, and a cooperative spirit with ${p.possessive} peers and teachers.`
  },
  'active-student': {
    title: 'Active Student',
    desc: (name, p) => `This is to certify that ${name} has displayed exceptional eagerness, energy, and dedication to learning, actively engaging in all classroom activities.`
  },
  'participative': {
    title: 'Participative Student',
    desc: (name, p) => `This is to certify that ${name} has been highly participative, frequently sharing insightful ideas and contributing positively to class discussions.`
  },
  'best-leader': {
    title: 'Best Leader',
    desc: (name, p) => `This is to certify that ${name} has demonstrated remarkable leadership qualities, guiding ${p.possessive} classmates with integrity, empathy, and responsibility.`
  },
  'top-student': {
    title: 'Top Student',
    desc: (name, p) => `This is to certify that ${name} has achieved outstanding academic excellence, securing a position in the Top 10 of the class through hard work and academic dedication.`
  },
  'custom': {
    title: 'Custom Award',
    desc: (name, p) => `This is to certify that ${name} has demonstrated outstanding effort and excellence in class.`
  }
};

const getPronouns = (gender: 'male' | 'female' | 'other') => {
  switch (gender) {
    case 'male':
      return { subject: 'he', object: 'him', possessive: 'his', capitalSubject: 'He' };
    case 'female':
      return { subject: 'she', object: 'her', possessive: 'her', capitalSubject: 'She' };
    default:
      return { subject: 'they', object: 'them', possessive: 'their', capitalSubject: 'They' };
  }
};

const getHonorText = (honor: string) => {
  switch (honor) {
    case 'honors':
      return 'With Honors';
    case 'high-honors':
      return 'With High Honors';
    case 'highest-honors':
      return 'With Highest Honors';
    default:
      return '';
  }
};

export function CertificateGenerator() {
  // Main settings
  const [currentCert, setCurrentCert] = React.useState<StudentCertificate>({
    id: '1',
    name: 'Ceman Dejamo Tudlasan',
    gender: 'male',
    className: 'Grade 6-A',
    honor: 'none',
    awardType: 'best-speaker',
    awardRank: '1',
    customAwardTitle: '',
    customDescription: ''
  });

  // Certificate Styling
  const [schoolName, setSchoolName] = React.useState('LingoLand Academy');
  const [theme, setTheme] = React.useState<'gold' | 'royal-blue' | 'emerald' | 'crimson' | 'minimalist'>('gold');
  const [signatureTeacher, setSignatureTeacher] = React.useState('Ms. Sarah Jenkins');
  const [signaturePrincipal, setSignaturePrincipal] = React.useState('Dr. Arthur Pendelton');
  const [issueDate, setIssueDate] = React.useState(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
  const [showSeal, setShowSeal] = React.useState(true);
  const [showSignatures, setShowSignatures] = React.useState(true);
  const [showDate, setShowDate] = React.useState(true);
  const [customLogo, setCustomLogo] = React.useState<string | null>(null);
  const [logoSize, setLogoSize] = React.useState<number>(64);

  // Fonts Styling
  const [titleFont, setTitleFont] = React.useState('Cinzel');
  const [nameFont, setNameFont] = React.useState('Great Vibes');
  const [bodyFont, setBodyFont] = React.useState('Playfair Display');
  const [signatureFont, setSignatureFont] = React.useState('Dancing Script');

  // Custom Texts
  const [certTitleText, setCertTitleText] = React.useState('CERTIFICATE OF RECOGNITION');
  const [presentationText, setPresentationText] = React.useState('This award is proudly presented to');
  const [classLabelText, setClassLabelText] = React.useState('Student of');
  const [awardPrefixText, setAwardPrefixText] = React.useState('For being recognized as the');
  const [dateLabelText, setDateLabelText] = React.useState('Date Issued');
  const [teacherLabelText, setTeacherLabelText] = React.useState('Class Teacher');
  const [principalLabelText, setPrincipalLabelText] = React.useState('School Principal');
  const [showPrincipal, setShowPrincipal] = React.useState(false);

  // Print Portal State
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [printMode, setPrintMode] = React.useState<'single' | 'batch'>('single');
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (isPrinting) {
      const timer = setTimeout(() => {
        window.print();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isPrinting]);

  React.useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrinting(false);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  // Batch Mode
  const [batchList, setBatchList] = React.useState<StudentCertificate[]>([
    {
      id: '1',
      name: 'Ceman Dejamo Tudlasan',
      gender: 'male',
      className: 'Grade 6-A',
      honor: 'none',
      awardType: 'best-speaker',
      customDescription: ''
    },
    {
      id: '2',
      name: 'Sarah Connor',
      gender: 'female',
      className: 'Grade 6-A',
      honor: 'high-honors',
      awardType: 'best-speller',
      customDescription: ''
    },
    {
      id: '3',
      name: 'Alex Mercer',
      gender: 'other',
      className: 'Grade 6-B',
      honor: 'highest-honors',
      awardType: 'best-leader',
      customDescription: ''
    }
  ]);

  const [bulkInput, setBulkInput] = React.useState('');
  const [isBulkOpen, setIsBulkOpen] = React.useState(false);

  // Helper to resolve descriptions dynamically
  const getCertificateDescription = (cert: StudentCertificate) => {
    if (cert.customDescription) {
      return cert.customDescription;
    }
    const pronouns = getPronouns(cert.gender);
    const template = awardTemplates[cert.awardType] || awardTemplates['custom'];
    
    if (cert.awardType === 'top-student' && cert.awardRank) {
      const rankSuffix = (rank: string) => {
        if (rank === '1') return '1st';
        if (rank === '2') return '2nd';
        if (rank === '3') return '3rd';
        return `${rank}th`;
      };
      return `This is to certify that ${cert.name} did an outstanding job, achieving the prestigious position of Top ${rankSuffix(cert.awardRank)} student in ${cert.className} through academic dedication and excellent conduct.`;
    }

    return template.desc(cert.name, pronouns);
  };

  // Helper to resolve certificate title
  const getCertificateTitle = (cert: StudentCertificate) => {
    if (cert.awardType === 'custom' && cert.customAwardTitle) {
      return cert.customAwardTitle;
    }
    if (cert.awardType === 'top-student' && cert.awardRank) {
      const rankSuffix = (rank: string) => {
        if (rank === '1') return '1st';
        if (rank === '2') return '2nd';
        if (rank === '3') return '3rd';
        return `${rank}th`;
      };
      return `Top ${rankSuffix(cert.awardRank)} Student`;
    }
    return awardTemplates[cert.awardType]?.title || 'Award of Excellence';
  };

  // Auto-fill custom description in input fields when switching types
  const handleAwardTypeChange = (val: string) => {
    setCurrentCert(prev => {
      const updated = { ...prev, awardType: val };
      // Reset custom description to let it dynamically render standard unless manually overwritten
      updated.customDescription = '';
      return updated;
    });
  };

  // Add current certificate to batch list
  const handleAddToBatch = () => {
    const newCert: StudentCertificate = {
      ...currentCert,
      id: Math.random().toString(36).substring(2, 9)
    };
    setBatchList(prev => [...prev, newCert]);
  };

  // Delete from batch
  const handleDeleteFromBatch = (id: string) => {
    setBatchList(prev => prev.filter(c => c.id !== id));
  };

  // View certificate from batch list
  const handleViewFromBatch = (cert: StudentCertificate) => {
    setCurrentCert(cert);
  };

  // Parse bulk CSV input
  // Expected format: Name, Gender (male/female/other), Class, Award (best-speaker, etc.), Honor (none/honors/high-honors/highest-honors)
  const handleImportBulk = () => {
    if (!bulkInput.trim()) return;

    const lines = bulkInput.split('\n');
    const newCerts: StudentCertificate[] = [];

    lines.forEach(line => {
      if (!line.trim()) return;
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 1) {
        const name = parts[0];
        const rawGender = parts[1]?.toLowerCase() || 'other';
        const gender = ['male', 'female', 'other'].includes(rawGender) ? (rawGender as 'male' | 'female' | 'other') : 'other';
        const className = parts[2] || currentCert.className || 'Class';
        
        let awardType = 'custom';
        const rawAward = parts[3]?.toLowerCase() || '';
        if (rawAward.includes('speaker')) awardType = 'best-speaker';
        else if (rawAward.includes('speller') || rawAward.includes('spelling')) awardType = 'best-speller';
        else if (rawAward.includes('cooperative')) awardType = 'most-cooperative';
        else if (rawAward.includes('active')) awardType = 'active-student';
        else if (rawAward.includes('participative') || rawAward.includes('participation')) awardType = 'participative';
        else if (rawAward.includes('leader') || rawAward.includes('leadership')) awardType = 'best-leader';
        else if (rawAward.includes('top')) awardType = 'top-student';

        let honor = 'none';
        const rawHonor = parts[4]?.toLowerCase() || '';
        if (rawHonor.includes('highest')) honor = 'highest-honors';
        else if (rawHonor.includes('high')) honor = 'high-honors';
        else if (rawHonor.includes('honor')) honor = 'honors';

        newCerts.push({
          id: Math.random().toString(36).substring(2, 9),
          name,
          gender,
          className,
          honor: honor as any,
          awardType,
          awardRank: awardType === 'top-student' ? '1' : undefined,
          customAwardTitle: awardType === 'custom' ? parts[3] : '',
          customDescription: ''
        });
      }
    });

    if (newCerts.length > 0) {
      setBatchList(prev => [...prev, ...newCerts]);
      setBulkInput('');
      setIsBulkOpen(false);
    }
  };

  // Trigger print dialog
  const handlePrint = (mode: 'single' | 'batch') => {
    setPrintMode(mode);
    setIsPrinting(true);
  };

  // Theme Class Resolvers
  const getThemeClasses = () => {
    switch (theme) {
      case 'royal-blue':
        return {
          cardBg: 'bg-slate-50 border-slate-200',
          borderGrad: 'from-blue-700 via-yellow-500 to-blue-800',
          innerBorder: 'border-blue-900',
          titleColor: 'text-blue-900',
          textColor: 'text-slate-800',
          accentColor: 'text-blue-700',
          sealColor: '#1e3a8a',
          ribbonColor: 'fill-blue-800',
          bgTexture: 'radial-gradient(circle, #f8fafc 0%, #e2e8f0 100%)'
        };
      case 'emerald':
        return {
          cardBg: 'bg-emerald-50 border-emerald-100',
          borderGrad: 'from-emerald-700 via-amber-400 to-emerald-800',
          innerBorder: 'border-emerald-950',
          titleColor: 'text-emerald-900',
          textColor: 'text-emerald-950',
          accentColor: 'text-emerald-700',
          sealColor: '#064e3b',
          ribbonColor: 'fill-emerald-800',
          bgTexture: 'radial-gradient(circle, #f0fdf4 0%, #d1fae5 100%)'
        };
      case 'crimson':
        return {
          cardBg: 'bg-rose-50 border-rose-100',
          borderGrad: 'from-rose-800 via-amber-400 to-rose-950',
          innerBorder: 'border-rose-950',
          titleColor: 'text-rose-900',
          textColor: 'text-rose-950',
          accentColor: 'text-rose-800',
          sealColor: '#881337',
          ribbonColor: 'fill-rose-800',
          bgTexture: 'radial-gradient(circle, #fff1f2 0%, #ffe4e6 100%)'
        };
      case 'minimalist':
        return {
          cardBg: 'bg-white border-slate-300',
          borderGrad: 'from-slate-400 via-slate-500 to-slate-600',
          innerBorder: 'border-slate-800',
          titleColor: 'text-slate-900',
          textColor: 'text-slate-800',
          accentColor: 'text-slate-900',
          sealColor: '#475569',
          ribbonColor: 'fill-slate-600',
          bgTexture: '#ffffff'
        };
      case 'gold':
      default:
        return {
          cardBg: 'bg-amber-50/30 border-amber-100',
          borderGrad: 'from-amber-600 via-amber-300 to-amber-700',
          innerBorder: 'border-amber-900/60',
          titleColor: 'text-amber-950',
          textColor: 'text-amber-950',
          accentColor: 'text-amber-800',
          sealColor: '#b45309',
          ribbonColor: 'fill-amber-700',
          bgTexture: 'radial-gradient(circle, #fffbeb 0%, #fef3c7 100%)'
        };
    }
  };

  const currentTheme = getThemeClasses();

  const getFontFamily = (fontName: string) => {
    switch (fontName) {
      case 'Cinzel':
        return "'Cinzel', serif";
      case 'Playfair Display':
        return "'Playfair Display', serif";
      case 'Montserrat':
        return "'Montserrat', sans-serif";
      case 'Great Vibes':
        return "'Great Vibes', cursive";
      case 'Alex Brush':
        return "'Alex Brush', cursive";
      case 'Pinyon Script':
        return "'Pinyon Script', cursive";
      case 'Dancing Script':
        return "'Dancing Script', cursive";
      case 'Sacramento':
        return "'Sacramento', cursive";
      case 'Georgia':
        return "Georgia, serif";
      default:
        return "inherit";
    }
  };

  // Helper to render the Certificate Template dynamically
  const renderCertificate = (cert: StudentCertificate, scale: number = 1, isPrint = false) => {
    const pronouns = getPronouns(cert.gender);
    const description = getCertificateDescription(cert);
    const title = getCertificateTitle(cert);
    const honorText = getHonorText(cert.honor);

    return (
      <div
        style={{
          transform: isPrint ? 'none' : `scale(${scale})`,
          transformOrigin: 'top center',
          background: currentTheme.bgTexture,
          aspectRatio: '297/210',
        }}
        className={`relative border-8 p-1.5 shadow-2xl rounded-sm transition-all duration-300 overflow-hidden flex flex-col justify-between items-center select-none w-full cert-container-print`}
      >
        {/* Load Google Fonts */}
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@600;700;800&family=Dancing+Script:wght@600;700&family=Great+Vibes&family=Montserrat:wght@400;600;700&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,600;1,400;1,600&family=Sacramento&display=swap');
        ` }} />

        {/* Intricate Gradient Frame Border */}
        <div className={`absolute inset-0 border-[14px] border-double z-0 pointer-events-none rounded-sm border-transparent bg-clip-border`} style={{
          backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
          backgroundOrigin: 'border-box'
        }}>
          {/* Inner Golden border line */}
          <div className={`absolute inset-1 border-[3px] ${currentTheme.innerBorder} opacity-80`} />
        </div>

        {/* Vintage Corner Ornaments */}
        <div className="absolute top-4 left-4 z-10 opacity-70">
          <svg width="40" height="40" viewBox="0 0 100 100" fill="currentColor" className={currentTheme.accentColor}>
            <path d="M0,0 L20,0 Q10,10 0,20 Z" />
            <path d="M0,0 L0,20 Q10,10 20,0 Z" />
            <rect x="5" y="5" width="2" height="40" />
            <rect x="5" y="5" width="40" height="2" />
          </svg>
        </div>
        <div className="absolute top-4 right-4 z-10 rotate-90 opacity-70">
          <svg width="40" height="40" viewBox="0 0 100 100" fill="currentColor" className={currentTheme.accentColor}>
            <path d="M0,0 L20,0 Q10,10 0,20 Z" />
            <path d="M0,0 L0,20 Q10,10 20,0 Z" />
            <rect x="5" y="5" width="2" height="40" />
            <rect x="5" y="5" width="40" height="2" />
          </svg>
        </div>
        <div className="absolute bottom-4 left-4 z-10 -rotate-90 opacity-70">
          <svg width="40" height="40" viewBox="0 0 100 100" fill="currentColor" className={currentTheme.accentColor}>
            <path d="M0,0 L20,0 Q10,10 0,20 Z" />
            <path d="M0,0 L0,20 Q10,10 20,0 Z" />
            <rect x="5" y="5" width="2" height="40" />
            <rect x="5" y="5" width="40" height="2" />
          </svg>
        </div>
        <div className="absolute bottom-4 right-4 z-10 rotate-180 opacity-70">
          <svg width="40" height="40" viewBox="0 0 100 100" fill="currentColor" className={currentTheme.accentColor}>
            <path d="M0,0 L20,0 Q10,10 0,20 Z" />
            <path d="M0,0 L0,20 Q10,10 20,0 Z" />
            <rect x="5" y="5" width="2" height="40" />
            <rect x="5" y="5" width="40" height="2" />
          </svg>
        </div>

        {/* Certificate Header Banner */}
        <div className="flex flex-col items-center mt-10 z-10">
          {customLogo && (
            <div 
              style={{ height: `${logoSize}px` }} 
              className="mb-2 flex items-center justify-center"
            >
              <img 
                src={customLogo} 
                alt="School Logo" 
                className="object-contain" 
                style={{ 
                  height: `${logoSize}px`, 
                  maxHeight: `${logoSize}px`,
                  maxWidth: `${logoSize * 2.5}px` 
                }} 
              />
            </div>
          )}
          <div className="flex items-center gap-2 mb-1">
            {!customLogo && <Award className={`h-8 w-8 ${currentTheme.accentColor} animate-pulse`} />}
            <span 
              className={`text-[11px] font-semibold tracking-[0.25em] uppercase opacity-75 ${currentTheme.textColor}`}
              style={{ fontFamily: getFontFamily(bodyFont) }}
            >
              {schoolName}
            </span>
            {!customLogo && <Award className={`h-8 w-8 ${currentTheme.accentColor} animate-pulse`} />}
          </div>
          <h1 
            className={`text-4xl md:text-5xl font-extrabold tracking-widest text-center ${currentTheme.titleColor}`} 
            style={{ 
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              fontFamily: getFontFamily(titleFont)
            }}
          >
            {certTitleText}
          </h1>
          {honorText && (
            <div className={`mt-2 px-6 py-0.5 border border-dashed rounded-full text-xs font-semibold uppercase tracking-wider ${currentTheme.accentColor} border-current`}>
              {honorText}
            </div>
          )}
        </div>

        {/* Certificate Body */}
        <div className="flex flex-col items-center justify-center flex-grow w-full max-w-[85%] text-center z-10 px-4 mt-4">
          <p 
            className={`text-sm italic opacity-75 ${currentTheme.textColor}`}
            style={{ fontFamily: getFontFamily(bodyFont) }}
          >
            {presentationText}
          </p>

          <h2 
            className={`text-3xl md:text-4xl font-semibold my-2 border-b-2 pb-1 text-slate-800 inline-block px-10`}
            style={{ 
              fontFamily: getFontFamily(nameFont),
              borderImage: `linear-gradient(to right, transparent, ${theme === 'minimalist' ? '#334155' : '#d97706'}, transparent) 1`
            }}
          >
            {cert.name}
          </h2>

          <p 
            className={`text-xs uppercase tracking-widest font-semibold opacity-60 mb-3 ${currentTheme.textColor}`}
            style={{ fontFamily: getFontFamily(bodyFont) }}
          >
            {classLabelText} {cert.className}
          </p>

          <h3 
            className={`text-xl font-bold tracking-wide mb-2 uppercase ${currentTheme.titleColor}`}
            style={{ fontFamily: getFontFamily(titleFont) }}
          >
            {awardPrefixText} <span className="underline decoration-wavy decoration-amber-500 underline-offset-4">{title}</span>
          </h3>

          <p 
            className={`text-sm max-w-[88%] leading-relaxed ${currentTheme.textColor} italic opacity-90 px-4 py-2 bg-white/40 rounded-lg shadow-sm border border-white/60`}
            style={{ fontFamily: getFontFamily(bodyFont) }}
          >
            {description}
          </p>
        </div>

        {/* Footer Area with Signatures, Date and Seal */}
        <div className="w-full flex justify-between items-end px-12 pb-10 z-10 gap-4">
          {/* Issue Date */}
          <div className="flex-1 flex flex-col items-center">
            {showDate && (
              <div className="flex flex-col items-center w-full max-w-[140px]">
                <span 
                  className="text-[13px] font-medium text-slate-800 h-6 flex items-center justify-center whitespace-nowrap"
                  style={{ fontFamily: getFontFamily(bodyFont) }}
                >
                  {issueDate}
                </span>
                <div className="w-full border-t border-slate-400 mt-1.5 mb-1" />
                <span 
                  className={`text-[10px] uppercase tracking-wider font-semibold opacity-60 text-center ${currentTheme.textColor}`}
                  style={{ fontFamily: getFontFamily(bodyFont) }}
                >
                  {dateLabelText}
                </span>
              </div>
            )}
          </div>

          {/* Golden Seal of Excellence */}
          <div className="flex-1 flex justify-center relative -bottom-2">
            {showSeal && (
              <div className="relative flex flex-col items-center justify-center">
                {/* Ribbon tails */}
                <svg className={`absolute top-6 h-16 w-12 drop-shadow-md z-0 ${currentTheme.ribbonColor}`} viewBox="0 0 100 150">
                  <path d="M15,20 L35,140 L50,120 L65,140 L85,20 Z" />
                  <path d="M5,20 L15,140 L30,120 L45,140 L65,20 Z" className="opacity-80" />
                </svg>
                {/* Circular Gold Seal body */}
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-amber-300 shadow-lg z-10 animate-spin-slow" 
                  style={{ 
                    background: `radial-gradient(circle, #fbbf24 0%, #d97706 70%, #b45309 100%)`,
                    boxShadow: '0 4px 6px -1px rgba(180, 83, 9, 0.4)' 
                  }}
                >
                  {/* Inside Star detail */}
                  <svg className="w-8 h-8 text-amber-100" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.209l8.2-1.191L12 .587z" />
                  </svg>
                </div>
                <span className="absolute text-[8px] font-bold text-amber-950 uppercase tracking-widest z-20 mt-1" style={{ top: '15px' }}>
                  SEAL
                </span>
              </div>
            )}
          </div>

          {/* Teacher Signature */}
          <div className="flex-1 flex flex-col items-center">
            {showSignatures && (
              <div className="flex flex-col items-center w-full max-w-[140px]">
                <span 
                  className="text-[14px] italic text-slate-800 font-semibold h-6 flex items-center justify-center whitespace-nowrap" 
                  style={{ fontFamily: getFontFamily(signatureFont) }}
                >
                  {signatureTeacher}
                </span>
                <div className="w-full border-t border-slate-400 mt-1.5 mb-1" />
                <span 
                  className={`text-[10px] uppercase tracking-wider font-semibold opacity-60 text-center ${currentTheme.textColor}`}
                  style={{ fontFamily: getFontFamily(bodyFont) }}
                >
                  {teacherLabelText}
                </span>
              </div>
            )}
          </div>

          {/* Principal Signature */}
          {showPrincipal && (
            <div className="flex-1 flex flex-col items-center">
              <div className="flex flex-col items-center w-full max-w-[140px]">
                <span 
                  className="text-[14px] italic text-slate-800 font-semibold h-6 flex items-center justify-center whitespace-nowrap" 
                  style={{ fontFamily: getFontFamily(signatureFont) }}
                >
                  {signaturePrincipal}
                </span>
                <div className="w-full border-t border-slate-400 mt-1.5 mb-1" />
                <span 
                  className={`text-[10px] uppercase tracking-wider font-semibold opacity-60 text-center ${currentTheme.textColor}`}
                  style={{ fontFamily: getFontFamily(bodyFont) }}
                >
                  {principalLabelText}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Subtle Watermark Logo / Background Details */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none z-0 print:hidden">
          <BookOpen className="w-96 h-96" />
        </div>
      </div>
    );
  };

  const renderPrintPortal = () => {
    if (!isMounted || !isPrinting) return null;
    
    const content = (
      <div id="print-root" className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-start">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: A4 landscape;
              margin: 0mm !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 297mm !important;
              height: 210mm !important;
              background-color: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body > *:not(#print-root) {
              display: none !important;
            }
            #print-root {
              display: block !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 297mm !important;
              height: 210mm !important;
              margin: 0 !important;
              padding: 0 !important;
              background-color: #ffffff !important;
            }
            .cert-page-break {
              width: 297mm !important;
              height: 210mm !important;
              page-break-after: always !important;
              break-after: page !important;
              overflow: hidden !important;
              box-sizing: border-box !important;
            }
            .cert-container-print {
              width: 297mm !important;
              height: 210mm !important;
              box-shadow: none !important;
              border: none !important;
              margin: 0 !important;
              transform: none !important;
              box-sizing: border-box !important;
            }
          }
        `}} />
        {printMode === 'single' ? (
          <div className="w-full h-full">
            {renderCertificate(currentCert, 1, true)}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col">
            {batchList.map((cert) => (
              <div key={cert.id} className="cert-page-break">
                {renderCertificate(cert, 1, true)}
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return createPortal(content, document.body);
  };

  return (
    <div className="w-full flex flex-col h-full gap-4">
      <Tabs defaultValue="single" className="w-full">
        <div className="flex flex-wrap items-center justify-between border-b pb-2 gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Academic Certificate Generator</h2>
            <p className="text-xs text-muted-foreground">Design and print recognition certificates for outstanding achievements.</p>
          </div>
          <TabsList>
            <TabsTrigger value="single" className="gap-2">
              <Award className="h-4 w-4" /> Single Certificate
            </TabsTrigger>
            <TabsTrigger value="batch" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" /> Batch Generator ({batchList.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* SINGLE MODE */}
        <TabsContent value="single" className="w-full mt-4">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Control Form (Left) */}
            <div className="xl:col-span-5 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Settings className="h-4 w-4" /> Student Information & Customization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="cert-name">Student Full Name</Label>
                    <Input
                      id="cert-name"
                      value={currentCert.name}
                      onChange={(e) => setCurrentCert({ ...currentCert, name: e.target.value })}
                      placeholder="e.g. Ceman Dejamo Tudlasan"
                    />
                  </div>

                  {/* School Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="cert-school">School / Academy Name</Label>
                    <Input
                      id="cert-school"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g. LingoLand Academy"
                    />
                  </div>

                  {/* Gender & Class */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="cert-gender">Gender (for Pronouns)</Label>
                      <Select
                        value={currentCert.gender}
                        onValueChange={(val: 'male' | 'female' | 'other') =>
                          setCurrentCert({ ...currentCert, gender: val })
                        }
                      >
                        <SelectTrigger id="cert-gender">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other / Non-Binary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="cert-class">Class/Grade</Label>
                      <Input
                        id="cert-class"
                        value={currentCert.className}
                        onChange={(e) => setCurrentCert({ ...currentCert, className: e.target.value })}
                        placeholder="e.g. Grade 6-A"
                      />
                    </div>
                  </div>

                  {/* Honor Status */}
                  <div className="space-y-1.5">
                    <Label htmlFor="cert-honor">Honor Status</Label>
                    <Select
                      value={currentCert.honor}
                      onValueChange={(val: any) => setCurrentCert({ ...currentCert, honor: val })}
                    >
                      <SelectTrigger id="cert-honor">
                        <SelectValue placeholder="Select Honor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Special Honor</SelectItem>
                        <SelectItem value="honors">With Honors</SelectItem>
                        <SelectItem value="high-honors">With High Honors</SelectItem>
                        <SelectItem value="highest-honors">With Highest Honors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Certificate Award Type */}
                  <div className="space-y-1.5">
                    <Label htmlFor="cert-award">Certificate Category</Label>
                    <Select
                      value={currentCert.awardType}
                      onValueChange={handleAwardTypeChange}
                    >
                      <SelectTrigger id="cert-award">
                        <SelectValue placeholder="Choose Certificate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="best-speaker">Best Speaker</SelectItem>
                        <SelectItem value="best-speller">Best in Spelling</SelectItem>
                        <SelectItem value="most-cooperative">Most Cooperative</SelectItem>
                        <SelectItem value="active-student">Active Student</SelectItem>
                        <SelectItem value="participative">Participative Student</SelectItem>
                        <SelectItem value="best-leader">Best Leader</SelectItem>
                        <SelectItem value="top-student">Top 10 Students</SelectItem>
                        <SelectItem value="custom">Other / Custom Title</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Top 10 Rank selection */}
                  {currentCert.awardType === 'top-student' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="cert-rank">Class Rank</Label>
                      <Select
                        value={currentCert.awardRank || '1'}
                        onValueChange={(val) => setCurrentCert({ ...currentCert, awardRank: val })}
                      >
                        <SelectTrigger id="cert-rank">
                          <SelectValue placeholder="Select Rank" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(10)].map((_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1)}>
                              Top {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Custom Award Title */}
                  {currentCert.awardType === 'custom' && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <Label htmlFor="custom-title">Custom Award Title</Label>
                      <Input
                        id="custom-title"
                        value={currentCert.customAwardTitle || ''}
                        onChange={(e) => setCurrentCert({ ...currentCert, customAwardTitle: e.target.value })}
                        placeholder="e.g. Science Fair Champion"
                      />
                    </div>
                  )}

                  {/* Description Box */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="cert-desc">Certificate Description</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] text-amber-600 hover:text-amber-700"
                        onClick={() => setCurrentCert({ ...currentCert, customDescription: '' })}
                      >
                        <Sparkles className="h-3 w-3 mr-1" /> Auto-fill
                      </Button>
                    </div>
                    <Textarea
                      id="cert-desc"
                      value={getCertificateDescription(currentCert)}
                      onChange={(e) => setCurrentCert({ ...currentCert, customDescription: e.target.value })}
                      placeholder="Detailed text describing the student's achievement..."
                      rows={3}
                      className="text-xs"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* STYLING CONFIG */}
                <CardContent className="space-y-4">
                  <Tabs defaultValue="design" className="w-full">
                    <TabsList className="grid grid-cols-3 w-full mb-4">
                      <TabsTrigger value="design" className="text-xs">Design</TabsTrigger>
                      <TabsTrigger value="fonts" className="text-xs">Fonts</TabsTrigger>
                      <TabsTrigger value="texts" className="text-xs">Texts</TabsTrigger>
                    </TabsList>

                    {/* DESIGN TAB */}
                    <TabsContent value="design" className="space-y-4">
                      <div className="space-y-1.5">
                        <Label>Theme Color</Label>
                        <Select value={theme} onValueChange={(val: any) => setTheme(val)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gold">Classic Gold</SelectItem>
                            <SelectItem value="royal-blue">Royal Blue</SelectItem>
                            <SelectItem value="emerald">Emerald Green</SelectItem>
                            <SelectItem value="crimson">Crimson Red</SelectItem>
                            <SelectItem value="minimalist">Minimalist Black</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Custom Logo Upload */}
                      <div className="space-y-2 pt-2 border-t">
                        <Label htmlFor="logo-upload">Custom School Logo (PNG, JPG)</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setCustomLogo(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="text-xs py-1.5 h-9 cursor-pointer"
                          />
                          {customLogo && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50 shrink-0 border"
                              onClick={() => setCustomLogo(null)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {customLogo && (
                          <div className="space-y-1.5 pt-2 animate-fadeIn">
                            <div className="flex justify-between text-xs">
                              <Label>Logo Size (Height)</Label>
                              <span className="text-muted-foreground font-mono">{logoSize}px</span>
                            </div>
                            <Slider
                              value={[logoSize]}
                              onValueChange={(val) => setLogoSize(val[0])}
                              min={30}
                              max={150}
                              step={5}
                              className="py-2"
                            />
                          </div>
                        )}
                      </div>

                      {/* Toggle Elements */}
                      <div className="flex flex-wrap gap-4 text-xs font-semibold pt-2 border-t">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={showSeal}
                            onChange={(e) => setShowSeal(e.target.checked)}
                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          Show Seal
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={showDate}
                            onChange={(e) => setShowDate(e.target.checked)}
                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          Show Date
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={showSignatures}
                            onChange={(e) => setShowSignatures(e.target.checked)}
                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          Show Signatures
                        </label>
                      </div>
                    </TabsContent>

                    {/* FONTS TAB */}
                    <TabsContent value="fonts" className="space-y-4">
                      {/* Title Font */}
                      <div className="space-y-1.5">
                        <Label>Certificate Title Font</Label>
                        <Select value={titleFont} onValueChange={(val) => setTitleFont(val)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cinzel">Classic Roman (Cinzel)</SelectItem>
                            <SelectItem value="Playfair Display">Elegant Serif (Playfair)</SelectItem>
                            <SelectItem value="Montserrat">Modern Sans (Montserrat)</SelectItem>
                            <SelectItem value="Georgia">Standard Serif (Georgia)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Name Font */}
                      <div className="space-y-1.5">
                        <Label>Student Name Font</Label>
                        <Select value={nameFont} onValueChange={(val) => setNameFont(val)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Great Vibes">Elegant Script (Great Vibes)</SelectItem>
                            <SelectItem value="Alex Brush">Flowing Script (Alex Brush)</SelectItem>
                            <SelectItem value="Pinyon Script">Ornate Calligraphy (Pinyon Script)</SelectItem>
                            <SelectItem value="Playfair Display">Classic Serif (Playfair)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Body Font */}
                      <div className="space-y-1.5">
                        <Label>Body Text & Subtitles Font</Label>
                        <Select value={bodyFont} onValueChange={(val) => setBodyFont(val)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Playfair Display">Elegant Serif (Playfair)</SelectItem>
                            <SelectItem value="Montserrat">Modern Sans (Montserrat)</SelectItem>
                            <SelectItem value="Georgia">Standard Serif (Georgia)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Signature Font */}
                      <div className="space-y-1.5">
                        <Label>Signature Font</Label>
                        <Select value={signatureFont} onValueChange={(val) => setSignatureFont(val)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Dancing Script">Handwritten Script (Dancing Script)</SelectItem>
                            <SelectItem value="Great Vibes">Calligraphy Script (Great Vibes)</SelectItem>
                            <SelectItem value="Sacramento">Fine Handwriting (Sacramento)</SelectItem>
                            <SelectItem value="Playfair Display">Plain Text (Playfair)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>

                    {/* TEXTS TAB */}
                    <TabsContent value="texts" className="space-y-4">
                      {/* Certificate Title Text */}
                      <div className="space-y-1.5">
                        <Label htmlFor="text-title">Certificate Header Title</Label>
                        <Input
                          id="text-title"
                          value={certTitleText}
                          onChange={(e) => setCertTitleText(e.target.value)}
                        />
                      </div>

                      {/* Presentation Text */}
                      <div className="space-y-1.5">
                        <Label htmlFor="text-presentation">Presentation Subtitle</Label>
                        <Input
                          id="text-presentation"
                          value={presentationText}
                          onChange={(e) => setPresentationText(e.target.value)}
                        />
                      </div>

                      {/* Class Prefix Text */}
                      <div className="space-y-1.5">
                        <Label htmlFor="text-class-prefix">Class Prefix Label</Label>
                        <Input
                          id="text-class-prefix"
                          value={classLabelText}
                          onChange={(e) => setClassLabelText(e.target.value)}
                        />
                      </div>

                      {/* Award Prefix Text */}
                      <div className="space-y-1.5">
                        <Label htmlFor="text-award-prefix">Award Prefix Label</Label>
                        <Input
                          id="text-award-prefix"
                          value={awardPrefixText}
                          onChange={(e) => setAwardPrefixText(e.target.value)}
                        />
                      </div>

                      <div className="border-t pt-2 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Signatures & Date</h4>
                        
                        {/* Issue Date & Label */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="val-date">Date Issued</Label>
                            <Input
                              id="val-date"
                              value={issueDate}
                              onChange={(e) => setIssueDate(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="label-date">Date Label</Label>
                            <Input
                              id="label-date"
                              value={dateLabelText}
                              onChange={(e) => setDateLabelText(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Teacher Signature & Label */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="val-teacher">Teacher Name</Label>
                            <Input
                              id="val-teacher"
                              value={signatureTeacher}
                              onChange={(e) => setSignatureTeacher(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="label-teacher">Teacher Label</Label>
                            <Input
                              id="label-teacher"
                              value={teacherLabelText}
                              onChange={(e) => setTeacherLabelText(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Principal Signature Toggle */}
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold pt-1">
                          <input
                            type="checkbox"
                            checked={showPrincipal}
                            onChange={(e) => setShowPrincipal(e.target.checked)}
                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          Add Principal Signature
                        </label>

                        {/* Principal Signature & Label */}
                        {showPrincipal && (
                          <div className="grid grid-cols-2 gap-3 animate-fadeIn border-l-2 pl-2 border-amber-500">
                            <div className="space-y-1.5">
                              <Label htmlFor="val-principal">Principal Name</Label>
                              <Input
                                id="val-principal"
                                value={signaturePrincipal}
                                onChange={(e) => setSignaturePrincipal(e.target.value)}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="label-principal">Principal Label</Label>
                              <Input
                                id="label-principal"
                                value={principalLabelText}
                                onChange={(e) => setPrincipalLabelText(e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full">
                <Button onClick={handleAddToBatch} variant="outline" className="flex-1 gap-2">
                  <UserPlus className="h-4 w-4" /> Add to Batch
                </Button>
                <Button onClick={() => handlePrint('single')} className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700">
                  <Printer className="h-4 w-4" /> Print / PDF
                </Button>
              </div>
            </div>

            {/* Live Preview (Right) */}
            <div className="xl:col-span-7 flex flex-col gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pl-1">
                Live Certificate Preview (A4 Scale)
              </span>

              {/* Responsive Container for Scaling SVG */}
              <div className="w-full bg-slate-800 p-4 md:p-8 rounded-xl flex items-center justify-center overflow-hidden border shadow-inner">
                {/* Print area container */}
                <div id="single-print-area" className="w-full max-w-[800px]">
                  {renderCertificate(currentCert)}
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground italic text-center px-4">
                Note: Click "Print / PDF" to print or save as a landscape A4 PDF. Background styles, fonts, and borders will print accurately.
              </div>
            </div>
          </div>
        </TabsContent>

        {/* BATCH MODE */}
        <TabsContent value="batch" className="w-full mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Students Batch List</CardTitle>
                  <CardDescription>Configure multiple certificates at once and print them as a single document.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsBulkOpen(!isBulkOpen)} variant="outline" className="gap-1.5">
                    <Upload className="h-4 w-4" /> Bulk Import
                  </Button>
                  <Button onClick={() => handlePrint('batch')} className="gap-1.5 bg-amber-600 hover:bg-amber-700" disabled={batchList.length === 0}>
                    <Printer className="h-4 w-4" /> Print All ({batchList.length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bulk Import Fields */}
                {isBulkOpen && (
                  <div className="p-4 bg-slate-50 border rounded-lg space-y-3 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="bulk-csv" className="font-semibold text-sm">Bulk Enter (CSV / Copy-Paste)</Label>
                      <span className="text-[10px] text-muted-foreground">Format: Name, Gender (male/female), Class, Award Name, Honor</span>
                    </div>
                    <Textarea
                      id="bulk-csv"
                      placeholder="e.g.&#10;Ceman Dejamo Tudlasan, male, Grade 6-A, Best Speaker, none&#10;Alice Smith, female, Grade 6-A, Best in Spelling, honors&#10;Bob Rogers, male, Grade 6-B, Most Cooperative, highest-honors"
                      rows={5}
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      className="font-mono text-xs"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsBulkOpen(false)}>Cancel</Button>
                      <Button variant="outline" size="sm" onClick={handleImportBulk} className="bg-emerald-600 hover:bg-emerald-700 text-white border-transparent">
                        <Check className="h-4 w-4 mr-1.5" /> Parse & Add
                      </Button>
                    </div>
                  </div>
                )}

                {/* Batch Table */}
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Award Category</TableHead>
                        <TableHead>Honor</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batchList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No students added to the batch list yet. Add them in Single mode or Bulk Import.
                          </TableCell>
                        </TableRow>
                      ) : (
                        batchList.map((cert) => (
                          <TableRow key={cert.id}>
                            <TableCell className="font-medium">{cert.name}</TableCell>
                            <TableCell>{cert.className}</TableCell>
                            <TableCell className="capitalize">{cert.gender}</TableCell>
                            <TableCell className="capitalize">
                              {getCertificateTitle(cert)}
                            </TableCell>
                            <TableCell>
                              {getHonorText(cert.honor) || <span className="text-muted-foreground text-xs">-</span>}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600 hover:text-blue-700"
                                  onClick={() => handleViewFromBatch(cert)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-rose-600 hover:text-rose-700"
                                  onClick={() => handleDeleteFromBatch(cert.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Secret Container for Print Batching (hidden from UI) */}
            <div className="hidden">
              <div id="batch-print-area" className="flex flex-col gap-0 bg-white">
                {batchList.map((cert) => (
                  <div key={cert.id} className="cert-page-break">
                    {renderCertificate(cert, 1, true)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      {renderPrintPortal()}
    </div>
  );
}
