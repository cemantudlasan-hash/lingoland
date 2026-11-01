"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signInWithEmail, sendPasswordResetEmail, signUpWithEmail, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  LogIn, 
  Sparkles, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  User, 
  BookOpen, 
  Users, 
  Glasses, 
  Bell, 
  ChevronRight, 
  Globe,
  Layers,
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Rocket,
  UserPlus,
  Play
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { VisitorCounter } from "@/components/layout/VisitorCounter";
import { HolidayCountdown } from "@/components/layout/HolidayCountdown";
import { BeautifulCalendar } from "@/components/layout/BeautifulCalendar";
import { BeautifulWeather } from "@/components/layout/BeautifulWeather";
import { LoginCarousel } from "@/components/layout/login-carousel";
import { LoginCockpit3DBackground } from "@/components/layout/LoginCockpit3DBackground";
import { AdSenseEducationalHub } from "@/components/layout/AdSenseEducationalHub";
import { useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { useSeasonalTheme } from "@/context/seasonal-theme-context";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signupSchema = z.object({
  email: z.string().email({ message: "A valid email is required for registration." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordResetting, setIsPasswordResetting] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { setAuthAction } = useAuth();
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    setIsLoading(true);
    setAuthAction('login');
    const { error } = await signInWithEmail(data.email, data.password);
    setIsLoading(false);
    if (error) {
      setAuthAction(null);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error,
      });
    } else {
      router.push("/");
    }
  };

  const handlePasswordReset = async () => {
    const email = getValues("email");
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address to reset your password.",
      });
      return;
    }
    setIsPasswordResetting(true);
    const { error } = await sendPasswordResetEmail(email);
    setIsPasswordResetting(false);
    setIsResetDialogOpen(false);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    } else {
      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for a link to reset your password.",
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        {/* Email Field with Left Icon */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs text-slate-200 font-bold flex items-center justify-between">
            <span>Email Address</span>
            <span className="text-[10px] text-cyan-400/80 font-mono font-medium">Cadet ID</span>
          </Label>
          <div className="relative flex items-center group">
            <Mail className="w-4 h-4 text-cyan-400 absolute left-3.5 pointer-events-none transition-colors group-focus-within:text-cyan-300" />
            <Input 
              id="email" 
              type="email" 
              placeholder="pilot@lingolandverse.io" 
              {...register("email")} 
              autoComplete="email" 
              className="pl-10 pr-3.5 bg-black/60 border border-cyan-500/30 text-white placeholder:text-zinc-500 focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400/25 rounded-2xl h-11 text-sm shadow-inner transition-all backdrop-blur-md"
            />
          </div>
          {errors.email && <p className="text-xs text-rose-400 font-medium pl-1">{errors.email.message}</p>}
        </div>

        {/* Password Field with Left Icon & Eye Toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs text-slate-200 font-bold">Password</Label>
            <button
              type="button"
              onClick={() => setIsResetDialogOpen(true)}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative flex items-center group">
            <Lock className="w-4 h-4 text-cyan-400 absolute left-3.5 pointer-events-none transition-colors group-focus-within:text-cyan-300" />
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              {...register("password")} 
              autoComplete="current-password" 
              className="pl-10 pr-10 bg-black/60 border border-cyan-500/30 text-white placeholder:text-zinc-500 focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400/25 rounded-2xl h-11 text-sm shadow-inner transition-all backdrop-blur-md"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-zinc-400 hover:text-cyan-300 transition-colors cursor-pointer"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-rose-400 font-medium pl-1">{errors.password.message}</p>}
        </div>

        {/* Action Button */}
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500 hover:from-teal-300 hover:to-indigo-400 text-slate-950 font-black text-sm tracking-wide h-12 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2" 
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <span>Ignite Pilot Cockpit</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent className="bg-slate-950/95 border border-cyan-500/40 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-lg font-black flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              <span>Reset Pilot Password</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 text-xs leading-relaxed">
              Enter your registered email address and our cosmic security gateway will send you a secure one-click link to reset your credentials.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="bg-white/[0.05] border-white/10 text-slate-300 hover:text-white rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePasswordReset} disabled={isPasswordResetting} className="bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-black rounded-xl">
              {isPasswordResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SignUpForm({ onSignupSuccess }: { onSignupSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const { setAuthAction } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupValues) => {
    setIsLoading(true);
    setAuthAction('login');
    const { error } = await signUpWithEmail(data.email, data.password);
    
    if (error) {
       setIsLoading(false);
       setAuthAction(null);
       toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error,
      });
    } else {
      await signOut();
      setIsLoading(false);
      setAuthAction(null);
      toast({
        title: "Registration Successful",
        description: "Account created! Please sign in with your new credentials.",
      });
      onSignupSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-1">
      {/* Email Field with Left Icon */}
      <div className="space-y-1.5">
        <Label htmlFor="signup-email" className="text-xs text-slate-200 font-bold flex items-center justify-between">
          <span>Email Address</span>
          <span className="text-[10px] text-cyan-400/80 font-mono font-medium">New Cadet</span>
        </Label>
        <div className="relative flex items-center group">
          <Mail className="w-4 h-4 text-cyan-400 absolute left-3.5 pointer-events-none transition-colors group-focus-within:text-cyan-300" />
          <Input 
            id="signup-email" 
            type="email" 
            placeholder="new.cadet@lingolandverse.io" 
            {...register("email")} 
            autoComplete="email" 
            className="pl-10 pr-3.5 bg-black/60 border border-cyan-500/30 text-white placeholder:text-zinc-500 focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400/25 rounded-2xl h-10 text-sm shadow-inner transition-all backdrop-blur-md"
          />
        </div>
        {errors.email && <p className="text-xs text-rose-400 font-medium pl-1">{errors.email.message}</p>}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <Label htmlFor="signup-password" className="text-xs text-slate-200 font-bold">Password</Label>
        <div className="relative flex items-center group">
          <Lock className="w-4 h-4 text-cyan-400 absolute left-3.5 pointer-events-none transition-colors group-focus-within:text-cyan-300" />
          <Input 
            id="signup-password" 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••••"
            {...register("password")} 
            autoComplete="new-password" 
            className="pl-10 pr-10 bg-black/60 border border-cyan-500/30 text-white placeholder:text-zinc-500 focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400/25 rounded-2xl h-10 text-sm shadow-inner transition-all backdrop-blur-md"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-zinc-400 hover:text-cyan-300 transition-colors cursor-pointer"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-rose-400 font-medium pl-1">{errors.password.message}</p>}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-xs text-slate-200 font-bold">Confirm Password</Label>
        <div className="relative flex items-center group">
          <ShieldCheck className="w-4 h-4 text-cyan-400 absolute left-3.5 pointer-events-none transition-colors group-focus-within:text-cyan-300" />
          <Input 
            id="confirmPassword" 
            type={showConfirmPassword ? "text" : "password"} 
            placeholder="••••••••"
            {...register("confirmPassword")} 
            autoComplete="new-password"
            className="pl-10 pr-10 bg-black/60 border border-cyan-500/30 text-white placeholder:text-zinc-500 focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400/25 rounded-2xl h-10 text-sm shadow-inner transition-all backdrop-blur-md"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3.5 text-zinc-400 hover:text-cyan-300 transition-colors cursor-pointer"
            title={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-xs text-rose-400 font-medium pl-1">{errors.confirmPassword.message}</p>}
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500 hover:from-teal-300 hover:to-indigo-400 text-slate-950 font-black text-sm tracking-wide h-12 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2" 
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Create Cadet Account Free</span>
          </>
        )}
      </Button>
    </form>
  );
}

interface DemoQuestion {
  word: string;
  definition: string;
  options: string[];
  correct: number;
}

const DEMO_QUESTIONS: DemoQuestion[] = [
  {
    word: "Resilient",
    definition: "Able to withstand or recover quickly from difficult conditions.",
    options: ["Able to withstand or recover quickly", "Easily broken or fragile", "Extremely loud and noisy", "Bright and shining"],
    correct: 0
  },
  {
    word: "Pragmatic",
    definition: "Dealing with things sensibly and realistically in a way that is based on practical considerations.",
    options: ["Highly emotional", "Practical and realistic", "Mysterious and hidden", "Very old and ancient"],
    correct: 1
  },
  {
    word: "Ebullient",
    definition: "Cheerful and full of energy.",
    options: ["Sad and gloomy", "Extremely angry", "Cheerful and energetic", "Quiet and thoughtful"],
    correct: 2
  },
  {
    word: "Meticulous",
    definition: "Showing great attention to detail; very careful and precise.",
    options: ["Careless and messy", "Very careful and precise", "Fast and rushed", "Lazy and slow"],
    correct: 1
  },
  {
    word: "Vast",
    definition: "Very great in size, extent, or quantity.",
    options: ["Extremely large", "Very small", "Heavy", "Bright"],
    correct: 0
  }
];

function InteractiveDemo({ onGoToSignup }: { onGoToSignup: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsFinished(true);
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const handleStart = () => {
    setIsPlaying(true);
    setCurrentIdx(0);
    setScore(0);
    setTimeLeft(30);
    setSelectedOpt(null);
    setIsFinished(false);
  };

  const handleAnswer = (optionIdx: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(optionIdx);
    
    if (optionIdx === DEMO_QUESTIONS[currentIdx].correct) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      setSelectedOpt(null);
      if (currentIdx + 1 < DEMO_QUESTIONS.length) {
        setCurrentIdx(prev => prev + 1);
      } else {
        setIsFinished(true);
        setIsPlaying(false);
      }
    }, 800);
  };

  if (isFinished) {
    return (
      <div className="text-center p-4 space-y-3 bg-black/40 rounded-xl border border-teal-500/20">
        <Sparkles className="h-8 w-8 mx-auto text-teal-400 animate-bounce" />
        <h4 className="text-base font-bold text-white">Quiz Finished!</h4>
        <p className="text-xs text-zinc-300">You scored <span className="font-extrabold text-teal-300 text-sm">{score}</span> out of {DEMO_QUESTIONS.length}</p>
        <div className="flex gap-2 pt-2">
          <Button onClick={handleStart} variant="outline" className="flex-1 text-xs border-zinc-800 text-zinc-300">Try Again</Button>
          <Button onClick={onGoToSignup} className="flex-1 text-xs bg-teal-500 hover:bg-teal-400 text-black font-bold">Sign Up Free</Button>
        </div>
      </div>
    );
  }

  if (!isPlaying) {
    return (
      <div className="text-center p-5 space-y-3 bg-black/40 rounded-xl border border-teal-500/20">
        <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto text-teal-300">
          <Sparkles className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-white">Quick 30s Vocabulary Speed-Run</h4>
        <p className="text-xs text-zinc-400">Test your language prowess with real exam questions.</p>
        <Button onClick={handleStart} className="w-full bg-teal-500 hover:bg-teal-400 text-black font-bold h-10 rounded-xl shadow-lg shadow-teal-500/20">
          Start Quiz Now
        </Button>
      </div>
    );
  }

  const currentQuestion = DEMO_QUESTIONS[currentIdx];

  return (
    <div className="space-y-3 p-1">
      <div className="flex justify-between items-center bg-zinc-950/60 px-3 py-1.5 rounded-xl border border-zinc-900 text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400 font-semibold">
          <Timer className="h-3.5 w-3.5 text-rose-500" />
          <span className="text-rose-400 font-bold">{timeLeft}s</span>
        </div>
        <div className="text-zinc-400 font-semibold">
          Score: <span className="text-teal-400 font-bold">{score}</span>
        </div>
      </div>

      <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-1">
        <span className="text-[9px] uppercase font-bold tracking-wider text-teal-400">Word {currentIdx + 1} / {DEMO_QUESTIONS.length}</span>
        <h3 className="text-lg font-black tracking-tight text-white">{currentQuestion.word}</h3>
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        {currentQuestion.options.map((opt, i) => {
          let btnClass = "bg-zinc-900/70 border-zinc-800 text-zinc-300 text-left justify-start py-2.5 px-3 rounded-xl border font-medium text-xs transition-all hover:bg-zinc-800 hover:text-white";
          let icon = null;

          if (selectedOpt !== null) {
            if (i === currentQuestion.correct) {
              btnClass = "bg-green-500/20 border-green-500 text-green-300 text-left justify-start py-2.5 px-3 rounded-xl border font-bold text-xs";
              icon = <CheckCircle2 className="h-3.5 w-3.5 ml-auto text-green-400 shrink-0" />;
            } else if (i === selectedOpt) {
              btnClass = "bg-rose-500/20 border-rose-500 text-rose-300 text-left justify-start py-2.5 px-3 rounded-xl border font-bold text-xs";
              icon = <XCircle className="h-3.5 w-3.5 ml-auto text-rose-400 shrink-0" />;
            } else {
              btnClass = "bg-zinc-900/30 border-zinc-800/50 text-zinc-600 text-left justify-start py-2.5 px-3 rounded-xl border font-medium text-xs opacity-50";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={selectedOpt !== null}
              className={`flex items-center w-full ${btnClass}`}
            >
              <span>{opt}</span>
              {icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}



function getGoogleDriveFileId(url: string) {
  if (!url) return null;
  const dMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) return dMatch[1];
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return idMatch[1];
  return null;
}

function resolveImageUrl(url: string) {
  if (!url) return "";
  const driveId = getGoogleDriveFileId(url);
  if (driveId) {
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }
  return url;
}

export default function AuthPage() {
  const { user, isGuest, loginAsGuest, logoutGuest, setAuthAction } = useAuth();
  const { activeTheme, isThemeActiveForUser, settings: seasonalSettings } = useSeasonalTheme();
  const isSeasonalActive = isThemeActiveForUser && (seasonalSettings.includeLoginPage ?? true) && activeTheme.id !== 'default';
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("signin");
  const [activeSideNav, setActiveSideNav] = useState("signin");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode') || params.get('tab');
      if (mode === 'signup' || mode === 'register') {
        setActiveTab('signup');
      } else if (mode === 'signin' || mode === 'login') {
        setActiveTab('signin');
      }
      if (window.location.hash === '#login-card-section' || mode) {
        const el = document.getElementById('login-card-section');
        el?.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          document.getElementById('login-card-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, []);

  const firestore = useFirestore();
  const loginFormRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, "announcements", "login_form");
  }, [firestore]);

  const { data: loginTexts } = useDoc(loginFormRef);
  const title = loginTexts?.title || "Master Any Subject with Your Personal AI Companion here in Lingolandverse!";
  const description = loginTexts?.description || "Welcome to LingoLandVerse - Learn language and educational subjects with 79+ interactive games, classroom tools, PowerPoint generator, jobs posting and more! Explore and use it for free!";
  const credits = loginTexts?.credits || "Ideas and created by: CSC Group Tech, Powered by AI.";
  const rawLogo = loginTexts?.logoUrl || loginTexts?.imageUrl || "";
  const resolvedLogo = rawLogo ? resolveImageUrl(rawLogo) : "/logo.png";

  const handleGuestLogin = () => {
    setAuthAction('login');
    loginAsGuest();
    router.push("/");
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-transparent text-slate-100 font-sans select-none overflow-x-hidden">
      {/* 1. ULTRA-REALISTIC 4K COCKPIT OBSERVATORY BACKGROUND with 3D Constellation & Galaxy Animation */}
      <LoginCockpit3DBackground />

      {/* 2. TOP NAVIGATION BAR (Attached flush to the top) */}
      <header className="relative w-full h-16 px-4 md:px-8 flex items-center justify-between border-b border-cyan-500/20 bg-slate-950/40 backdrop-blur-xl sticky top-0 z-50">
        {/* Left: Glowing Planetary Orbit Icon */}
        <div 
          onClick={() => router.push('/')}
          className="flex items-center gap-3 cursor-pointer group"
          title="LingoLandVerse"
        >
          <div className="relative w-9 h-9 flex items-center justify-center shrink-0 overflow-hidden">
            <div className="w-4 h-4 rounded-full bg-cyan-400 blur-[2px] opacity-90 absolute group-hover:scale-125 transition-transform" />
            <div className="w-3.5 h-3.5 rounded-full bg-teal-300 relative z-10" />
            <svg 
              width={36}
              height={36}
              className="absolute w-9 h-9 max-w-[36px] max-h-[36px] text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] pointer-events-none"
              style={{ width: '36px', height: '36px', animation: 'orbit-spin 20s linear infinite' }} 
              viewBox="0 0 36 36" 
              fill="none"
            >
              <ellipse 
                cx="18" 
                cy="18" 
                rx="15" 
                ry="5.5" 
                stroke="#67e8f9" 
                strokeWidth="1.8" 
                transform="rotate(-28 18 18)" 
              />
              <circle cx="28" cy="12" r="1.5" fill="#38bdf8" />
            </svg>
          </div>
          <span className="font-extrabold tracking-wider text-white text-base hidden sm:inline-block bg-gradient-to-r from-teal-300 via-cyan-200 to-white bg-clip-text text-transparent">
            LINGOLANDVERSE
          </span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
          <Link href="/games" className="hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.7)] transition-all">
            Explore
          </Link>
          <Link href="/language-modules" className="hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.7)] transition-all">
            Learn
          </Link>
          <Link href="/classroom-tools" className="hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.7)] transition-all">
            Live Classes
          </Link>
          <button
            onClick={() => {
              if (!user || isGuest) {
                toast({
                  title: "Log In Required",
                  description: "Log in to explore this tab",
                });
                router.push('/marketplace?notice=login-required');
              } else {
                router.push('/marketplace');
              }
            }}
            className="hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.7)] transition-all font-medium text-sm text-zinc-300 cursor-pointer"
          >
            AI Tutor
          </button>
        </nav>

        {/* Right: Holiday Badge (if active), Bell with Red Badge, Cyan Pill Button, Profile Avatar */}
        <div className="flex items-center gap-3.5">
          {isSeasonalActive && seasonalSettings.headerBadge && (
            <div className={cn(
              "hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm transition-all animate-pulse",
              activeTheme.badgeText,
              activeTheme.badgeBg
            )}>
              <span>{activeTheme.emoji}</span>
              <span>{seasonalSettings.customBadgeText || activeTheme.defaultBadgeText}</span>
            </div>
          )}

          <Link 
            href="/notifications" 
            className="relative p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-zinc-300" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center border border-black shadow-[0_0_8px_rgba(244,63,94,0.8)]">
              1
            </span>
          </Link>

          <button
            onClick={() => {
              const el = document.getElementById("login-card-section");
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-zinc-950 font-bold px-4 py-1.5 rounded-full text-xs sm:text-sm shadow-[0_0_18px_rgba(20,184,166,0.4)] transition-all hover:scale-105 active:scale-95"
          >
            <span>Welcome!</span>
          </button>

          <div 
            onClick={() => {
              if (user) {
                router.push('/profile');
              } else {
                document.getElementById("login-card-section")?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="relative w-8 h-8 rounded-full border-2 border-teal-400/40 overflow-hidden cursor-pointer hover:border-teal-400 transition-colors shadow-[0_0_10px_rgba(20,184,166,0.25)]"
            title={user ? "User Profile" : "Sign-In"}
          >
            <img 
              src="/logo.png" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* 3. DESKTOP SIDEBAR - Docked flush from top-16 header to bottom-14 dock */}
      <aside className="fixed left-0 top-16 bottom-14 w-20 border-r border-cyan-500/20 bg-slate-950/40 backdrop-blur-xl hidden md:flex flex-col items-center py-6 gap-6 z-40">
        <button 
          onClick={() => { 
            setActiveSideNav("signin"); 
            if (user) {
              router.push('/profile');
            } else {
              document.getElementById('login-card-section')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className={`flex flex-col items-center gap-1 group w-full relative py-2 transition-all ${
            activeSideNav === 'signin' || activeSideNav === 'profile' ? 'text-teal-400' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title={user ? "Profile" : "Sign-In"}
        >
          {(activeSideNav === 'signin' || activeSideNav === 'profile') && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
          )}
          <div className={`p-2 rounded-xl transition-all ${activeSideNav === 'signin' || activeSideNav === 'profile' ? 'bg-teal-500/10' : 'group-hover:bg-white/5'}`}>
            {user ? <User className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
          </div>
          <span className="text-[11px] font-medium tracking-wide">{user ? "Profile" : "Sign-In"}</span>
        </button>

        <button 
          onClick={() => { setActiveSideNav("courses"); router.push('/language-modules'); }}
          className={`flex flex-col items-center gap-1 group w-full relative py-2 transition-all ${
            activeSideNav === 'courses' ? 'text-teal-400' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {activeSideNav === 'courses' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
          )}
          <div className={`p-2 rounded-xl transition-all ${activeSideNav === 'courses' ? 'bg-teal-500/10' : 'group-hover:bg-white/5'}`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium tracking-wide">Courses</span>
        </button>

        <button 
          onClick={() => { setActiveSideNav("community"); router.push('/lounge'); }}
          className={`flex flex-col items-center gap-1 group w-full relative py-2 transition-all ${
            activeSideNav === 'community' ? 'text-teal-400' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {activeSideNav === 'community' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
          )}
          <div className={`p-2 rounded-xl transition-all ${activeSideNav === 'community' ? 'bg-teal-500/10' : 'group-hover:bg-white/5'}`}>
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium tracking-wide">Community</span>
        </button>

        <a 
          href="https://www.myhomeworkhub.co.in" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 group w-full relative py-2 transition-all text-zinc-400 hover:text-cyan-300"
          title="HomeworkHub (myhomeworkhub.co.in)"
        >
          <div className="p-2 rounded-xl transition-all group-hover:bg-white/5 group-hover:scale-110">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-wide">HomeworkHub</span>
        </a>
      </aside>

      {/* 4. MAIN SCROLLABLE DASHBOARD & AUTH PORTAL CONTENT */}
      <div className="relative flex-1 w-full pl-0 md:pl-20 pb-20 md:pb-16 z-30">
        <main className="flex-1 p-3 sm:p-4 lg:px-4 lg:py-4 xl:px-5 space-y-5 sm:space-y-6 w-full max-w-none mx-auto">
            {/* 1. TOP VIDEO FEATURE CAROUSEL (Admin can update videos & text in /admin) */}
            <div className="w-full">
              <LoginCarousel />
            </div>

            {/* 2. BALANCED RESPONSIVE GRID (Holiday & Weather level from left to right) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch w-full">
              {/* Left Column (2-spans wide): Holiday + Weather LEVEL FROM LEFT TO RIGHT, then Calendar */}
              <div className="xl:col-span-2 flex flex-col justify-between gap-6 w-full">
                {/* Row 1: Holiday Season 2026 (Left) & Weather & Location (Right) - LEVEL FROM LEFT TO RIGHT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full items-stretch">
                  <div className="w-full flex">
                    <HolidayCountdown className="w-full h-full" />
                  </div>
                  <div className="w-full flex">
                    <BeautifulWeather className="w-full h-full" />
                  </div>
                </div>

                {/* Row 2: Beautiful Interactive Calendar */}
                <div className="w-full flex-1 flex flex-col">
                  <BeautifulCalendar />
                </div>
              </div>

              {/* Right Column (1-span wide): The Dedicated Login Portal Card */}
              <div id="login-card-section" className="xl:col-span-1 w-full flex flex-col">
                <Card 
                  className={cn(
                    "backdrop-blur-3xl relative overflow-hidden rounded-3xl flex-1 flex flex-col justify-between transition-all duration-700 select-none",
                    isSeasonalActive
                      ? `bg-slate-950/95 border-2 ${activeTheme.borderColor}`
                      : "border border-cyan-500/40 bg-slate-950/90 shadow-[0_12px_60px_rgba(0,0,0,0.8),0_0_50px_rgba(6,182,212,0.25)]"
                  )}
                  style={{
                    boxShadow: isSeasonalActive
                      ? `0 0 50px ${activeTheme.glowColor}, inset 0 0 25px ${activeTheme.glowColor}`
                      : undefined
                  }}
                >
                  {/* Sleek Top Edge Highlight Beam */}
                  <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />

                  {/* Neon Edge Glow Orbs */}
                  <div 
                    className="absolute -top-16 -right-16 w-44 h-44 blur-3xl rounded-full pointer-events-none transition-all duration-700" 
                    style={{ backgroundColor: isSeasonalActive ? activeTheme.accentColor : '#06b6d4', opacity: 0.22 }}
                  />
                  <div 
                    className="absolute -bottom-16 -left-16 w-44 h-44 blur-3xl rounded-full pointer-events-none transition-all duration-700" 
                    style={{ backgroundColor: isSeasonalActive ? activeTheme.accentColor : '#a855f7', opacity: 0.22 }}
                  />

                  <CardHeader className="text-center pb-3 pt-5 px-5 sm:px-6 relative z-10 space-y-2.5">
                    {/* Top Security Status Bar */}
                    <div className="flex items-center justify-between w-full pb-2.5 border-b border-white/[0.08]">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Pilot Access Gateway</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/70 px-2.5 py-0.5 rounded-full border border-cyan-500/35 shadow-sm">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                        </span>
                        <span>256-Bit SSL</span>
                      </div>
                    </div>

                    {/* Seasonal Holiday Festival Announcement on Login Card */}
                    {isSeasonalActive && (
                      <div className={cn(
                        "w-full py-2 px-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 shadow-lg transition-all animate-pulse",
                        activeTheme.badgeBg,
                        activeTheme.borderColor
                      )}>
                        <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-white">
                          <span className="text-base">{activeTheme.emoji}</span>
                          <span>{seasonalSettings.customHeadline || activeTheme.defaultBadgeText}</span>
                          <span className="text-base">{activeTheme.emoji}</span>
                        </div>
                        <p className="text-[11px] text-slate-200/90 font-medium leading-tight">
                          {seasonalSettings.customMessage || activeTheme.greetingText}
                        </p>
                      </div>
                    )}

                    {/* Logo with Luminous Halo (Enlarged & Prominently Visible) */}
                    <div className="relative flex justify-center items-center py-2 sm:py-3 w-full">
                      <div className="absolute w-48 h-48 sm:w-60 sm:h-60 mx-auto rounded-full bg-gradient-to-tr from-cyan-400/30 via-teal-400/20 to-indigo-500/30 blur-3xl pointer-events-none animate-pulse" />
                      <div className="relative z-10 w-full flex justify-center items-center">
                        <img
                          src={resolvedLogo}
                          alt="LingoLandVerse Logo"
                          className="w-auto h-32 sm:h-40 md:h-44 max-w-[280px] sm:max-w-[340px] object-contain drop-shadow-[0_4px_30px_rgba(34,211,238,0.75)] hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
                        />
                      </div>
                    </div>

                    {/* Dynamic Title */}
                    <CardTitle className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white drop-shadow-[0_2px_15px_rgba(56,189,248,0.7)] whitespace-pre-wrap leading-tight">
                      {title}
                    </CardTitle>

                    {/* Dynamic Subtitle / Description */}
                    <CardDescription className="text-slate-300 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-medium">
                      {description}
                    </CardDescription>

                    {/* Dynamic Credits */}
                    <p className="text-xs text-cyan-400 font-bold whitespace-pre-wrap">{credits}</p>
                  </CardHeader>

                  <CardContent className="px-5 sm:px-6 pb-6 relative z-10 space-y-4">
                    {(user || isGuest) && (
                      <div className="p-3.5 rounded-2xl bg-cyan-950/60 border border-cyan-400/40 text-xs space-y-2.5 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <div className="flex items-center justify-between text-cyan-300 font-bold">
                          <span className="truncate">
                            {user ? `Active Pilot: ${user.email || 'Cadet'}` : 'Exploring as Guest Cadet'}
                          </span>
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => router.push('/')} 
                            className="flex-1 h-9 text-xs bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-black rounded-xl shadow-md cursor-pointer"
                          >
                            Return to Menu / Cockpit
                          </Button>
                          <Button 
                            onClick={async () => {
                              if (isGuest) {
                                logoutGuest();
                              } else {
                                await signOut();
                              }
                            }} 
                            variant="outline" 
                            className="h-9 text-xs border-cyan-500/30 hover:border-rose-400 text-slate-300 hover:text-rose-300 rounded-xl cursor-pointer"
                          >
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* High-Tech Tabs Selector with Glowing Pill Switch */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-3 bg-black/60 p-1 border border-cyan-500/30 rounded-2xl shadow-inner backdrop-blur-md">
                        <TabsTrigger 
                          value="signin" 
                          className="rounded-xl text-xs font-bold data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-[0_0_15px_rgba(6,182,212,0.6)] flex items-center justify-center gap-1 transition-all"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Sign In</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="signup" 
                          className="rounded-xl text-xs font-bold data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-[0_0_15px_rgba(6,182,212,0.6)] flex items-center justify-center gap-1 transition-all"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Cadet</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="demo" 
                          className="rounded-xl text-xs font-bold text-cyan-300 data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-[0_0_15px_rgba(6,182,212,0.6)] flex items-center justify-center gap-1 transition-all"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Demo</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="signin" className="pt-2">
                        <LoginForm />
                      </TabsContent>

                      <TabsContent value="signup" className="pt-2">
                        <SignUpForm onSignupSuccess={() => setActiveTab("signin")} />
                      </TabsContent>

                      <TabsContent value="demo" className="pt-2">
                        <InteractiveDemo onGoToSignup={() => setActiveTab("signup")} />
                      </TabsContent>
                    </Tabs>

                    {/* Divider */}
                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-cyan-500/20" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                        <span className="px-2.5 py-0.5 text-slate-400 bg-slate-950 rounded-full border border-white/10">
                          Instant Access Pass
                        </span>
                      </div>
                    </div>

                    {/* Explore as Guest Card with Quick Perks */}
                    <div className="p-3 rounded-2xl bg-gradient-to-b from-white/[0.04] to-black/40 border border-teal-500/30 space-y-2 shadow-inner">
                      <Button 
                        variant="secondary" 
                        onClick={handleGuestLogin} 
                        className="w-full border border-teal-500/40 bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-indigo-500/20 hover:from-teal-500/30 hover:to-indigo-500/30 text-teal-200 hover:text-white font-black h-11 rounded-xl shadow-inner transition-all hover:scale-[1.02] active:scale-95 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer group"
                      >
                        <Rocket className="w-4 h-4 text-teal-300 group-hover:scale-110 transition-transform" /> 
                        <span>Explore as Guest (Instant Access)</span>
                      </Button>
                      <div className="flex items-center justify-center gap-2.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>⚡ Zero Password</span>
                        <span>•</span>
                        <span>🎮 79+ Games Live</span>
                        <span>•</span>
                        <span>🚀 Instant Pass</span>
                      </div>
                    </div>

                    {/* Live Visitor Counter */}
                    <div className="pt-0.5">
                      <VisitorCounter />
                    </div>
                  </CardContent>
                </Card>
              </div>
          </div>

          {/* 3. CRAWLABLE EDUCATIONAL CURRICULUM, RESEARCH ARTICLES & APP DIRECTORY (For AdSense & Visitors - Extend & Hide) */}
          <AdSenseEducationalHub collapsible={true} defaultExpanded={false} />
        </main>
      </div>

      {/* 5. CONNECTED BOTTOM DOCK BAR - Spans full width, connects seamlessly with sidebar */}
      <footer className="fixed left-0 right-0 bottom-0 min-h-14 py-1.5 md:py-0 border-t border-cyan-500/20 bg-slate-950/85 backdrop-blur-xl z-40 flex items-center justify-between">
        {/* Desktop View: System Links & Explore Button */}
        <div className="hidden md:flex items-center justify-between w-full pl-24 pr-6">
          <div className="flex items-center gap-4 text-xs text-zinc-300">
            <span className="flex items-center gap-1.5 font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              LingoLandVerse
            </span>
            <span className="text-zinc-600">•</span>
            <Link 
              href="/apps" 
              className="text-zinc-300 hover:text-teal-300 hover:underline transition-colors font-medium"
            >
              Explore Apps &amp; Tools (All 26 Menus)
            </Link>
            <span className="text-zinc-600">•</span>
            <Link 
              href="/blog" 
              className="text-zinc-300 hover:text-teal-300 hover:underline transition-colors font-medium"
            >
              Educational Universe Blog
            </Link>
            <span className="text-zinc-600">•</span>
            <Link 
              href="/about" 
              className="text-zinc-200 hover:text-teal-300 hover:underline transition-colors font-semibold"
            >
              About Us
            </Link>
            <span className="text-zinc-600">•</span>
            <Link 
              href="/editorial-policy" 
              className="text-zinc-200 hover:text-teal-300 hover:underline transition-colors font-semibold"
            >
              Editorial Policy
            </Link>
            <span className="text-zinc-600">•</span>
            <Link 
              href="/contact" 
              className="text-zinc-200 hover:text-teal-300 hover:underline transition-colors font-semibold"
            >
              Contact Us
            </Link>
            <span className="text-zinc-600">•</span>
            <Link 
              href="/terms" 
              className="text-zinc-200 hover:text-teal-300 hover:underline transition-colors font-semibold"
            >
              Terms and Conditions
            </Link>
            <span className="text-zinc-600">•</span>
            <Link 
              href="/privacy-policy" 
              className="text-zinc-200 hover:text-teal-300 hover:underline transition-colors font-semibold"
            >
              Privacy Policy
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/games"
              className="flex items-center gap-1.5 text-xs font-bold text-teal-300 hover:text-white transition-colors bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 px-3.5 py-1.5 rounded-xl shadow-sm"
            >
              <span>Explore 79+ Games</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Mobile View: Auto-Arranging High-Tech Dock Navigation & Compliance Text Links */}
        <div className="flex md:hidden flex-col items-center justify-center w-full px-2 py-1 gap-1">
          <div className="flex items-center justify-around w-full">
            <button 
              onClick={() => { 
                setActiveSideNav("signin"); 
                if (user) {
                  router.push('/profile');
                } else {
                  document.getElementById('login-card-section')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${activeSideNav === 'signin' || activeSideNav === 'profile' ? 'text-teal-400 bg-teal-500/10' : 'text-zinc-400'}`}
              title={user ? "Profile" : "Sign-In"}
            >
              {user ? <User className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span className="text-[10px] font-medium">{user ? "Profile" : "Sign-In"}</span>
            </button>
            <button 
              onClick={() => { setActiveSideNav("courses"); router.push('/language-modules'); }}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${activeSideNav === 'courses' ? 'text-teal-400 bg-teal-500/10' : 'text-zinc-400'}`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-[10px] font-medium">Courses</span>
            </button>
            <button 
              onClick={() => { setActiveSideNav("community"); router.push('/lounge'); }}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${activeSideNav === 'community' ? 'text-teal-400 bg-teal-500/10' : 'text-zinc-400'}`}
            >
              <Users className="w-4 h-4" />
              <span className="text-[10px] font-medium">Community</span>
            </button>
            <a 
              href="https://www.myhomeworkhub.co.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors text-zinc-400 hover:text-cyan-300"
              title="HomeworkHub"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="text-[10px] font-medium">HomeworkHub</span>
            </a>
            <Link 
              href="/games"
              className="flex items-center gap-1 text-[10px] font-bold text-teal-300 bg-teal-500/20 border border-teal-500/30 px-2.5 py-1 rounded-lg"
            >
              <span>Games</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-[10px] text-zinc-400 pt-0.5 border-t border-white/[0.06] w-full">
            <Link href="/apps" className="hover:text-teal-300 transition-colors">
              Apps
            </Link>
            <span className="text-zinc-600">•</span>
            <Link href="/blog" className="hover:text-teal-300 transition-colors">
              Blog
            </Link>
            <span className="text-zinc-600">•</span>
            <Link href="/about" className="hover:text-teal-300 transition-colors">
              About Us
            </Link>
            <span className="text-zinc-600">•</span>
            <Link href="/terms" className="hover:text-teal-300 transition-colors">
              Terms
            </Link>
            <span className="text-zinc-600">•</span>
            <Link href="/privacy-policy" className="hover:text-teal-300 transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
