'use client';

import { useAICounter } from '@/hooks/use-ai-counter';
import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Coffee } from 'lucide-react';

export function DonationPopup() {
  const { count } = useAICounter();
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) return;
    const hasShown = sessionStorage.getItem('ai_popup_shown') === 'true';
    if (count >= 3 && count <= 5 && !hasShown) {
      setIsOpen(true);
      sessionStorage.setItem('ai_popup_shown', 'true');
    }
  }, [count, isAdmin]);

  const handleDonate = () => {
    window.open('https://www.buymeacoffee.com/cemantudlasan', '_blank');
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md border-2 border-[#FFDD00]/30 bg-card/95 backdrop-blur-md">
        <AlertDialogHeader className="flex flex-col items-center text-center gap-3">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#FFDD00] text-black shadow-lg animate-pulse mt-2">
            <Coffee className="w-9 h-9 stroke-[2.5]" />
          </div>
          <AlertDialogTitle className="text-2xl font-black tracking-tight mt-2 flex items-center gap-2">
            Support Lingoland 🚀
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm font-medium leading-relaxed px-2">
            We hope you are enjoying your learning experience! You can support the site maintenance and get new features starting at just <span className="font-bold text-foreground">$1</span>. Every coffee helps! ☕✨
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {/* Buy Me a Coffee Visual Badge */}
        <div className="my-4 flex justify-center">
          <a 
            href="https://www.buymeacoffee.com/cemantudlasan" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2.5 px-5 py-2.5 bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black font-extrabold text-sm rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md border border-black/10"
          >
            <Coffee className="w-5 h-5 fill-current" />
            <span>Buy me a coffee</span>
          </a>
        </div>

        <AlertDialogFooter className="flex items-center justify-center gap-2 sm:justify-center">
          <AlertDialogCancel onClick={() => setIsOpen(false)} className="border-border/60 hover:bg-muted font-bold transition-all">
            Maybe Later
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleDonate} className="bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black font-black transition-all px-6 border border-black/5 shadow-md">
            Donate Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
