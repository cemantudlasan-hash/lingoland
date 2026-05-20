'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2, Mail, KeyRound } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';

export default function SupportPage() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  
  const [concernText, setConcernText] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "No email associated with your account.",
        variant: "destructive"
      });
      return;
    }
    
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: "Password Reset Email Sent",
        description: `Check your inbox at ${user.email} for further instructions.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to send reset email",
        description: error.message || "An error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmitConcern = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concernText.trim()) return;
    
    const subject = encodeURIComponent("Customer Support Request: LingoLandVerse");
    const body = encodeURIComponent(`Name: ${userProfile?.displayName || 'User'}\nEmail: ${user?.email || 'N/A'}\n\nConcern:\n${concernText}`);
    window.location.href = `mailto:vanguardfeatme@yahoo.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="container max-w-4xl py-12 mx-auto">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2 text-foreground">Customer Support</h1>
        <p className="text-muted-foreground text-lg">We're here to help. Select an option below to get assistance.</p>
      </div>

      <Tabs defaultValue="concerns" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md mx-auto md:mx-0">
          <TabsTrigger value="concerns">General Concerns</TabsTrigger>
          <TabsTrigger value="password">Password Recovery</TabsTrigger>
        </TabsList>
        
        <TabsContent value="concerns">
          <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-primary/5 border-b border-border/50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-primary"><Mail className="h-5 w-5"/> Contact Support</CardTitle>
              <CardDescription>
                Send us an email with your questions, feedback, or any issues you are facing.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitConcern} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={userProfile?.displayName || ''} disabled className="bg-muted text-muted-foreground font-medium" />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Email</Label>
                    <Input value={user?.email || ''} disabled className="bg-muted text-muted-foreground font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="concern" className="font-semibold">How can we help you?</Label>
                  <Textarea 
                    id="concern"
                    placeholder="Describe your issue or question here..."
                    className="min-h-[150px] resize-y bg-background"
                    value={concernText}
                    onChange={(e) => setConcernText(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full sm:w-auto font-semibold">
                  Open Email Client
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm max-w-2xl">
            <CardHeader className="bg-primary/5 border-b border-border/50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-primary"><KeyRound className="h-5 w-5"/> Reset Your Password</CardTitle>
              <CardDescription>
                Forgot your password or want to change it? We can send a secure reset link to your email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>Account Email</Label>
                <Input value={user?.email || ''} disabled className="bg-muted text-muted-foreground font-medium" />
              </div>
              <div className="bg-blue-500/10 text-blue-700 dark:text-blue-400 p-4 rounded-lg text-sm flex items-start gap-3">
                 <Mail className="h-5 w-5 flex-shrink-0 mt-0.5" />
                 <p>
                    We will send a password reset link to <strong>{user?.email || 'your email'}</strong>. 
                    Please ensure you have access to this inbox.
                 </p>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button onClick={handlePasswordReset} disabled={isResetting || !user?.email} size="lg" className="font-semibold">
                {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Email
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
