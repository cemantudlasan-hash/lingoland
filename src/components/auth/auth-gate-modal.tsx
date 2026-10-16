'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { ShieldAlert, Sparkles, LogIn, UserPlus, ArrowRight, Lock } from 'lucide-react';

interface AuthGateModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  canDismiss?: boolean;
  onGuestSuccess?: () => void;
}

export function AuthGateModal({
  open,
  onOpenChange,
  canDismiss = false,
  onGuestSuccess,
}: AuthGateModalProps) {
  const router = useRouter();
  const { loginAsGuest } = useAuth();

  const handleGuestLogin = () => {
    loginAsGuest();
    if (onGuestSuccess) {
      onGuestSuccess();
    } else if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleUserLogin = () => {
    router.push('/auth');
  };

  const handleRegister = () => {
    router.push('/auth?mode=signup');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val && !canDismiss) {
          // If modal cannot be dismissed, prevent closing until user selects an auth option
          return;
        }
        if (onOpenChange) onOpenChange(val);
      }}
    >
      <DialogContent 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg p-6 sm:p-8 z-50 border border-cyan-400/40 bg-slate-950/95 backdrop-blur-3xl text-white rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.4)] max-h-[90vh] overflow-y-auto"
      >
        {/* Ambient Cosmic Lights */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/25 blur-3xl rounded-full pointer-events-none" />

        <DialogHeader className="text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            <Lock className="w-7 h-7 animate-pulse" />
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight">
            Login As A Guest / Login User Account or Register in order to access the Homepage or Menu
          </DialogTitle>

          <DialogDescription className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            Access to the flight deck, all 26 educational menus, and interactive classroom portals requires authorization. Please select one of the three options below to enter:
          </DialogDescription>
        </DialogHeader>

        {/* 3 Authorization Action Pathways */}
        <div className="mt-6 space-y-3.5">
          {/* Option 1: Explore as Guest */}
          <button
            onClick={handleGuestLogin}
            className="w-full group p-4 rounded-2xl bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400 hover:from-teal-300 hover:to-indigo-300 text-slate-950 font-black text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-between cursor-pointer text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-950/20 flex items-center justify-center text-slate-950 shrink-0">
                <Sparkles className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="text-sm font-black">Login As A Guest (Instant Access)</div>
                <div className="text-[11px] font-semibold text-slate-900/80">
                  Instant access to the Homepage, Menu &amp; Games with zero registration
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-950 shrink-0 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Option 2: Login User Account */}
          <button
            onClick={handleUserLogin}
            className="w-full group p-4 rounded-2xl bg-slate-900/80 hover:bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 text-white font-bold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-between cursor-pointer text-left shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-300 shrink-0">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Login User Account
                </div>
                <div className="text-[11px] text-slate-400">
                  Sign in with registered Pilot credentials to restore streaks &amp; XP
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Option 3: Register */}
          <button
            onClick={handleRegister}
            className="w-full group p-4 rounded-2xl bg-slate-900/80 hover:bg-indigo-950/40 border border-indigo-500/30 hover:border-indigo-400 text-white font-bold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-between cursor-pointer text-left shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-indigo-300 shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Register New Pilot Account
                </div>
                <div className="text-[11px] text-slate-400">
                  Free cadet enrollment with cloud dossier synchronization
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {canDismiss && onOpenChange && (
          <div className="mt-4 pt-3 border-t border-white/[0.08] text-center">
            <button
              onClick={() => onOpenChange(false)}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Stay on Current Portal
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
