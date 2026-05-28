'use client';

import * as React from 'react';
import { useState } from 'react';
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
import { Loader2, Mail, KeyRound, HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

      <Tabs defaultValue="faqs" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-transparent sm:bg-muted mb-8 max-w-2xl mx-auto md:mx-0 p-1 rounded-lg">
          <TabsTrigger value="faqs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:data-[state=active]:bg-background sm:data-[state=active]:text-foreground py-2 text-sm font-semibold">FAQs</TabsTrigger>
          <TabsTrigger value="concerns" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:data-[state=active]:bg-background sm:data-[state=active]:text-foreground py-2 text-sm font-semibold">General Concerns</TabsTrigger>
          <TabsTrigger value="password" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:data-[state=active]:bg-background sm:data-[state=active]:text-foreground py-2 text-sm font-semibold">Password Recovery</TabsTrigger>
        </TabsList>
        
        <TabsContent value="faqs" className="space-y-6 animate-in fade-in-50 duration-300">
          <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-primary/5 border-b border-border/50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-primary">
                <HelpCircle className="h-5 w-5" /> Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Find quick answers to common questions about LingoLandVerse tools, games, and accounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-border/50">
                  <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors py-4">
                    What is LingoLandVerse?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    LingoLandVerse is an interactive educational and ESL (English as a Second Language) platform filled with games, tools, resources, and digital worksheets designed to make language teaching and learning fun, engaging, and dynamic.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border-border/50">
                  <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors py-4">
                    How do I play classroom games?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Head over to the <strong>Classroom Games</strong> tab in the sidebar menu! There, you will find our library of highly interactive, AI-enhanced educational games (such as Context Detective, Spelling Bee, Vocabulary Match, and Vocabulary Voyage) that can be projected on a screen or board for students.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border-border/50">
                  <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors py-4">
                    Is my data safe when using Classroom Tools?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Absolutely. We secure and partition student records, attendance charts, and morning dashboards by account UID so that your classroom logs, attendance details, and personalized dashboards are entirely private and protected from cross-account data leaks.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border-border/50">
                  <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors py-4">
                    How does the Lingo-Pet companion work?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Lingo-Pet is an interactive virtual companion that lives in your workspace! As you work, practice exercises, or play games, your Lingo-Pet grows and offers encouraging motivational reminders to help build healthy learning habits.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="border-border/50">
                  <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors py-4">
                    How do I connect Google AdSense to serve ads?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    If you are the admin, you can set the AdSense Publisher ID in your local environment configuration under the key <code>NEXT_PUBLIC_ADSENSE_CLIENT_ID</code>. The system automatically loads optimized ad scripts and renders responsive preview blocks.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="border-border/50">
                  <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors py-4">
                    I'm having trouble resetting my password. What should I do?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Go to the <strong>Password Recovery</strong> tab on this Support page and click <strong>Send Reset Email</strong>. A secure password reset link will be sent to your registered email immediately. If the email doesn't show up, check your spam or junk folders.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="concerns" className="animate-in fade-in-50 duration-300">
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

        <TabsContent value="password" className="animate-in fade-in-50 duration-300">
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
