'use client';

import { useAICounter } from '@/hooks/use-ai-counter';
import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Enjoying this app?</AlertDialogTitle>
          <AlertDialogDescription>
            You can donate starts at 1$ for maintenance and improvements for this site. Thank you!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDonate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Ok
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
