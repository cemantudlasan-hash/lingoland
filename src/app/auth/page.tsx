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
  GraduationCap
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs text-zinc-300 font-medium">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="agent@lingolandverse.io" 
            {...register("email")} 
            autoComplete="email" 
            className="bg-black/60 border-teal-500/30 text-white placeholder:text-zinc-500 focus-visible:ring-teal-400 rounded-xl h-10 text-sm shadow-inner"
          />
          {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs text-zinc-300 font-medium">Password</Label>
            <button
              type="button"
              onClick={() => setIsResetDialogOpen(true)}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 hover:underline transition-colors"
            >
              Forgot?
            </button>
          </div>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••"
            {...register("password")} 
            autoComplete="current-password" 
            className="bg-black/60 border-teal-500/30 text-white placeholder:text-zinc-500 focus-visible:ring-teal-400 rounded-xl h-10 text-sm shadow-inner"
          />
          {errors.password && <p className="text-xs text-rose-400">{errors.password.message}</p>}
        </div>
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-extrabold h-11 rounded-xl shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02] active:scale-95" 
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Begin Your AI Journey"}
        </Button>
      </form>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent className="bg-zinc-950/95 border border-teal-500/30 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Reset Password</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Enter your email address to receive a secure password reset link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-900 border-zinc-800 text-zinc-300">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePasswordReset} disabled={isPasswordResetting} className="bg-teal-500 hover:bg-teal-400 text-black font-bold">
              {isPasswordResetting ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SignUpForm({ onSignupSuccess }: { onSignupSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="signup-email" className="text-xs text-zinc-300 font-medium">Email</Label>
        <Input 
          id="signup-email" 
          type="email" 
          placeholder="new.agent@lingolandverse.io" 
          {...register("email")} 
          autoComplete="email" 
          className="bg-black/60 border-teal-500/30 text-white placeholder:text-zinc-500 focus-visible:ring-teal-400 rounded-xl h-9 text-sm"
        />
        {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-password" className="text-xs text-zinc-300 font-medium">Password</Label>
        <Input 
          id="signup-password" 
          type="password" 
          placeholder="••••••••"
          {...register("password")} 
          autoComplete="new-password" 
          className="bg-black/60 border-teal-500/30 text-white placeholder:text-zinc-500 focus-visible:ring-teal-400 rounded-xl h-9 text-sm"
        />
        {errors.password && <p className="text-xs text-rose-400">{errors.password.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-xs text-zinc-300 font-medium">Confirm Password</Label>
        <Input 
          id="confirmPassword" 
          type="password" 
          placeholder="••••••••"
          {...register("confirmPassword")} 
          autoComplete="new-password"
          className="bg-black/60 border-teal-500/30 text-white placeholder:text-zinc-500 focus-visible:ring-teal-400 rounded-xl h-9 text-sm"
        />
        {errors.confirmPassword && <p className="text-xs text-rose-400">{errors.confirmPassword.message}</p>}
      </div>
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-extrabold h-11 rounded-xl shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02] active:scale-95 mt-2" 
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Start Learning for Free"}
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



export default function AuthPage() {
  const { user, isGuest, loginAsGuest, logoutGuest, setAuthAction } = useAuth();
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
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-cyan-400 blur-[2px] opacity-90 absolute group-hover:scale-125 transition-transform" />
            <div className="w-3.5 h-3.5 rounded-full bg-teal-300 relative z-10" />
            <svg 
              className="absolute w-9 h-9 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
              style={{ animation: 'orbit-spin 20s linear infinite' }} 
              viewBox="0 0 36 36" 
              fill="none"
            >
              <ellipse 
                cx="18" 
                cy="18" 
                rx="15" 
                ry="5.5" 
                stroke="currentColor" 
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

        {/* Right: Bell with Red Badge, Cyan Pill Button, Profile Avatar */}
        <div className="flex items-center gap-3.5">
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
      <div className="relative flex-1 w-full pl-0 md:pl-20 pb-20 md:pb-20 z-30">
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-[1720px] w-full mx-auto">
            {/* 1. TOP VIDEO FEATURE CAROUSEL (Admin can update videos & text in /admin) */}
            <div className="w-full">
              <LoginCarousel />
            </div>

            {/* 2. BALANCED RESPONSIVE GRID (Holiday & Weather level from left to right) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start w-full">
              {/* Left Column (2-spans wide): Holiday + Weather LEVEL FROM LEFT TO RIGHT, then Calendar */}
              <div className="xl:col-span-2 space-y-6 w-full">
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
                <div className="w-full">
                  <BeautifulCalendar />
                </div>
              </div>

              {/* Right Column (1-span wide): The Dedicated Login Portal Card */}
              <div id="login-card-section" className="xl:col-span-1 w-full">
                <Card className="border border-cyan-500/40 bg-slate-950/80 backdrop-blur-3xl shadow-[0_0_70px_rgba(6,182,212,0.3)] relative overflow-hidden rounded-3xl">
                  {/* Subtle Neon Edge Glow */}
                  <div className="absolute -top-16 -right-16 w-44 h-44 bg-cyan-500/25 blur-3xl rounded-full pointer-events-none" />
                  <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-purple-500/25 blur-3xl rounded-full pointer-events-none" />

                  <CardHeader className="text-center pb-4 pt-6 px-6 relative z-10">
                    <div className="flex justify-center mb-3">
                      <Image
                        src="/logo.png"
                        alt="LingoLandVerse Logo"
                        width={120}
                        height={120}
                        className="object-contain drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                        priority
                      />
                    </div>
                    {/* Dynamic Title (Admin configurable in /admin) */}
                    <CardTitle className="text-xl md:text-2xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(56,189,248,0.85)] whitespace-pre-wrap">
                      {title}
                    </CardTitle>
                    {/* Dynamic Subtitle / Description (Admin configurable in /admin) */}
                    <CardDescription className="text-slate-300 text-xs md:text-sm mt-1.5 whitespace-pre-wrap leading-relaxed">
                      {description}
                    </CardDescription>
                    {/* Dynamic Credits */}
                    <p className="text-xs text-cyan-400 font-semibold pt-1 whitespace-pre-wrap">{credits}</p>
                  </CardHeader>

                  <CardContent className="px-6 pb-6 relative z-10 space-y-4">
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

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-3 bg-slate-900/80 p-1 border border-cyan-500/30 rounded-2xl shadow-inner">
                        <TabsTrigger value="signin" className="rounded-xl text-xs font-bold data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                          Pilot Sign In
                        </TabsTrigger>
                        <TabsTrigger value="signup" className="rounded-xl text-xs font-bold data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                          New Cadet
                        </TabsTrigger>
                        <TabsTrigger value="demo" className="rounded-xl text-xs font-bold text-cyan-300 data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                          Try Demo
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="signin" className="pt-3">
                        <LoginForm />
                      </TabsContent>

                      <TabsContent value="signup" className="pt-3">
                        <SignUpForm onSignupSuccess={() => setActiveTab("signin")} />
                      </TabsContent>

                      <TabsContent value="demo" className="pt-3">
                        <InteractiveDemo onGoToSignup={() => setActiveTab("signup")} />
                      </TabsContent>
                    </Tabs>

                    {/* Divider */}
                    <div className="relative my-3">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-teal-500/15" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                        <span className="px-2 text-zinc-500 bg-zinc-950">
                          Or Instant Access
                        </span>
                      </div>
                    </div>

                    {/* Explore as Guest Button */}
                    <Button 
                      variant="secondary" 
                      onClick={handleGuestLogin} 
                      className="w-full border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-200 font-extrabold h-11 rounded-xl shadow-inner transition-all hover:scale-[1.02] active:scale-95 text-xs cursor-pointer"
                    >
                      <LogIn className="mr-2 h-4 w-4 text-teal-300" /> 
                      Explore as Guest (Instant Access)
                    </Button>

                    {/* Live Visitor Counter */}
                    <div className="pt-1">
                      <VisitorCounter />
                    </div>
                  </CardContent>
                </Card>
              </div>
          </div>

          {/* 3. CRAWLABLE EDUCATIONAL CURRICULUM, RESEARCH ARTICLES & APP DIRECTORY (For AdSense & Visitors) */}
          <AdSenseEducationalHub />
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
              className="text-zinc-300 hover:text-teal-300 hover:underline transition-colors font-medium"
            >
              About Us
            </Link>
            <span className="text-zinc-600">•</span>
            <Link 
              href="/terms" 
              className="text-zinc-300 hover:text-teal-300 hover:underline transition-colors font-medium"
            >
              Terms and Conditions
            </Link>
            <span className="text-zinc-600">•</span>
            <Link 
              href="/privacy-policy" 
              className="text-zinc-300 hover:text-teal-300 hover:underline transition-colors font-medium"
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
