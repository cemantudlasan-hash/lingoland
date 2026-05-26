
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signInWithEmail, sendPasswordResetEmail, signUpWithEmail, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, UserPlus, LogIn, Sparkles, Timer, CheckCircle2, XCircle, Award } from "lucide-react";
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
      setAuthAction(null); // Clear auth action on error
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error,
      });
    } else {
      router.push("/dashboard");
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="agent@lingolandverse.io" {...register("email")} autoComplete="email" />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                        type="button"
                        onClick={() => setIsResetDialogOpen(true)}
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        Forgot Password?
                    </button>
                    </div>
                    <Input id="password" type="password" {...register("password")} autoComplete="current-password" />
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 font-extrabold h-11 rounded-xl shadow-lg shadow-indigo-600/10 transition-all hover:scale-[1.02] active:scale-95" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Begin Your AI Journey"}
                </Button>
            </form>
             <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Reset Password</AlertDialogTitle>
                    <AlertDialogDescription>
                    Enter your email address to receive a password reset link.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePasswordReset} disabled={isPasswordResetting}>
                    {isPasswordResetting ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
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
    setAuthAction('login'); // Use login animation for signup as well
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
      // Force sign out after creation to ensure clean initial login as requested
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input id="signup-email" type="email" placeholder="new.agent@lingolandverse.io" {...register("email")} autoComplete="email" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input id="signup-password" type="password" {...register("password")} autoComplete="new-password" />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" {...register("confirmPassword")} autoComplete="new-password"/>
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
        </div>
        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 font-extrabold h-11 rounded-xl shadow-lg shadow-indigo-600/10 transition-all hover:scale-[1.02] active:scale-95" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Start Learning for Free"}
        </Button>
    </form>
  )
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
    }, 1000);
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center text-center p-4 space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/20">
          <Award className="h-10 w-10 text-amber-500 animate-bounce" />
        </div>
        <h4 className="text-xl font-bold text-white">Quiz Finished!</h4>
        <p className="text-sm text-zinc-300">
          You scored <span className="font-extrabold text-indigo-400 text-lg">{score}/{DEMO_QUESTIONS.length}</span> in under 30 seconds!
        </p>
        <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-800 text-xs text-zinc-400 max-w-xs">
          🚀 In LingoLandVerse, you can play <span className="text-indigo-300 font-bold">66+ interactive subjects and language games</span>, level up your skills, and earn trophies!
        </div>
        <Button onClick={onGoToSignup} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 font-extrabold shadow-lg hover:shadow-indigo-500/20 h-11 rounded-xl">
          Start Learning for Free
        </Button>
      </div>
    );
  }

  if (!isPlaying) {
    return (
      <div className="flex flex-col items-center text-center p-4 space-y-4">
        <div className="p-3 bg-indigo-500/10 rounded-full border border-indigo-500/20">
          <Sparkles className="h-8 w-8 text-indigo-400 animate-pulse" />
        </div>
        <h4 className="text-lg font-bold text-white uppercase tracking-tight">Try a 30s Vocabulary Quiz!</h4>
        <p className="text-xs text-zinc-400 max-w-xs">
          Experience LingoLandVerse instantly. Answer as many correct definitions as you can before the 30-second timer runs out!
        </p>
        <Button onClick={handleStart} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold h-11 rounded-xl shadow-md">
          Start Quiz Now
        </Button>
      </div>
    );
  }

  const currentQuestion = DEMO_QUESTIONS[currentIdx];

  return (
    <div className="space-y-4 p-2 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-zinc-950/40 px-3 py-2 rounded-xl border border-zinc-900">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold">
          <Timer className="h-4 w-4 text-rose-500" />
          Time Left: <span className="text-rose-400 font-extrabold text-sm">{timeLeft}s</span>
        </div>
        <div className="text-xs text-zinc-400 font-semibold">
          Score: <span className="text-green-400 font-extrabold text-sm">{score}</span>
        </div>
      </div>

      <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-800 space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Word {currentIdx + 1} of {DEMO_QUESTIONS.length}</span>
        <h3 className="text-2xl font-black tracking-tight text-white">{currentQuestion.word}</h3>
        <p className="text-xs text-zinc-400 italic">Select the correct definition below:</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {currentQuestion.options.map((opt, i) => {
          let btnClass = "bg-zinc-900/60 border-zinc-800 text-zinc-300 text-left justify-start h-auto py-3 px-4 rounded-xl border font-medium transition-all hover:bg-zinc-800/80 hover:text-white";
          let icon = null;

          if (selectedOpt !== null) {
            if (i === currentQuestion.correct) {
              btnClass = "bg-green-500/20 border-green-500 text-green-300 text-left justify-start h-auto py-3 px-4 rounded-xl border font-bold";
              icon = <CheckCircle2 className="h-4 w-4 ml-auto text-green-400 shrink-0" />;
            } else if (i === selectedOpt) {
              btnClass = "bg-rose-500/20 border-rose-500 text-rose-300 text-left justify-start h-auto py-3 px-4 rounded-xl border font-bold";
              icon = <XCircle className="h-4 w-4 ml-auto text-rose-400 shrink-0" />;
            } else {
              btnClass = "bg-zinc-900/30 border-zinc-800/50 text-zinc-550 text-left justify-start h-auto py-3 px-4 rounded-xl border font-medium opacity-50";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={selectedOpt !== null}
              className={`flex items-center w-full ${btnClass}`}
            >
              <span className="text-xs sm:text-sm">{opt}</span>
              {icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AuthPage() {
    const { user, isGuest, isLoading, loginAsGuest, setAuthAction, authAction } = useAuth();
    const [activeTab, setActiveTab] = useState("signin");
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            // Only redirect if a real user is logged in.
            // Guests are allowed to visit this page to sign in/up.
            if (user) {
                router.replace('/dashboard');
            }
        }
    }, [user, isLoading, router]);

    const handleGuestLogin = () => {
        setAuthAction('login');
        loginAsGuest();
        router.push("/games");
    }

    if (isLoading && !authAction) {
        return null;
    }
    
    return (
        <>
            <div className="flex min-h-screen items-center justify-center relative p-4 gap-6 flex-col lg:flex-row max-w-7xl w-full mx-auto">
                <div className="relative z-10 w-full max-w-md order-1 lg:order-none space-y-6">
                    <HolidayCountdown />
                    <BeautifulWeather />
                </div>
                <div className="relative z-10 w-full max-w-md order-2 lg:order-none">
                    <BeautifulCalendar />
                </div>
                <div
                    className="relative z-10 w-full max-w-md order-3 lg:order-none"
                >
                    <Card className="border border-white/5 bg-zinc-950/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-indigo-500/5 blur-3xl pointer-events-none" />
                        <CardHeader className="text-center pb-4 relative z-10">
                            <div className="flex justify-center mb-2">
                              <Image
                                src="/logo.png"
                                alt="LingoLandVerse Logo"
                                width={240}
                                height={240}
                                className="object-contain"
                                priority
                              />
                            </div>
                            <CardTitle className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                                Master Any Subject with Your Personal AI Companion
                            </CardTitle>
                            <CardDescription className="text-zinc-400 text-sm mt-1">
                                Welcome to LingoLandVerse — Learn language and educational subjects with 66+ interactive games.
                            </CardDescription>
                            <p className="text-xs text-indigo-400/80 font-semibold pt-1">Ideas and created by: CSC Tech Corp., Powered by AI.</p>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-3 bg-zinc-950 p-1 border border-white/5 rounded-xl">
                                    <TabsTrigger value="signin" className="rounded-lg font-bold">Sign In</TabsTrigger>
                                    <TabsTrigger value="signup" className="rounded-lg font-bold">Sign Up</TabsTrigger>
                                    <TabsTrigger value="demo" className="rounded-lg font-extrabold text-indigo-400 hover:text-indigo-300">Try Demo</TabsTrigger>
                                </TabsList>
                                <TabsContent value="signin" className="pt-4">
                                    <LoginForm />
                                </TabsContent>
                                <TabsContent value="signup" className="pt-4">
                                    <SignUpForm onSignupSuccess={() => setActiveTab("signin")} />
                                </TabsContent>
                                <TabsContent value="demo" className="pt-4">
                                    <InteractiveDemo onGoToSignup={() => setActiveTab("signup")} />
                                </TabsContent>
                            </Tabs>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/5" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="px-2 text-zinc-550 bg-[#09090b] text-zinc-500">
                                    Or
                                    </span>
                                </div>
                            </div>
                            <Button variant="secondary" className="w-full border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-300 font-extrabold h-11 rounded-xl shadow-inner transition-all hover:scale-[1.02] active:scale-95" onClick={handleGuestLogin} disabled={isGuest}>
                               <LogIn className="mr-2 h-4 w-4 text-indigo-400" /> {isGuest ? "Browsing as Guest" : "Explore as Guest (Instant Access)"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <VisitorCounter />
        </>
    )
}
