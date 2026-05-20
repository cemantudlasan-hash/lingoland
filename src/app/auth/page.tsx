
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signInWithEmail, sendPasswordResetEmail, signUpWithEmail, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, UserPlus, LogIn } from "lucide-react";
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
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
        <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
        </Button>
    </form>
  )
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
            <div className="flex min-h-screen items-center justify-center relative p-4 gap-8 flex-col lg:flex-row">
                <div className="relative z-10 w-full max-w-md order-1 lg:order-none mt-8 lg:mt-0">
                    <HolidayCountdown />
                </div>
                <div
                    className="relative z-10 w-full max-w-md order-2 lg:order-none"
                >
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-bold tracking-tighter">Welcome to LingoLandVerse</CardTitle>
                            <CardDescription>Sign in, create an account, or continue as a guest.</CardDescription>
                            <p className="text-sm text-muted-foreground pt-2">Ideas and created by: CSC Tech Corp., Powered by Ai.</p>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                                </TabsList>
                                <TabsContent value="signin" className="pt-4">
                                    <LoginForm />
                                </TabsContent>
                                <TabsContent value="signup" className="pt-4">
                                    <SignUpForm onSignupSuccess={() => setActiveTab("signin")} />
                                </TabsContent>
                            </Tabs>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="px-2 text-muted-foreground bg-card">
                                    Or
                                    </span>
                                </div>
                            </div>
                            <Button variant="secondary" className="w-full" onClick={handleGuestLogin} disabled={isGuest}>
                               <LogIn className="mr-2 h-4 w-4" /> {isGuest ? "Already browsing as Guest" : "Continue as a Guest"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <VisitorCounter />
        </>
    )
}
