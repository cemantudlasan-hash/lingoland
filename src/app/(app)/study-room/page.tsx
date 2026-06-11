'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { ConstellationCanvas } from '@/components/ui/constellation-canvas';

export default function StudyRoomPage() {
  const { isLoading } = useAuth();
  const [iframeLoading, setIframeLoading] = useState(true);
  const studyRoomUrl = 'https://studio--lingoland-kpvxp.us-central1.hosted.app';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[88vh] w-full p-2 sm:p-4 text-white overflow-hidden bg-slate-950/20 rounded-3xl border border-slate-900 flex flex-col">
      <ConstellationCanvas />
      
      {/* Decorative blurs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full flex-1 flex flex-col h-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/50 backdrop-blur-md">
        {/* Iframe loader */}
        <AnimatePresence mode="wait">
          {iframeLoading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col justify-center items-center bg-slate-950/80 z-20 gap-3"
            >
              <Loader2 className="animate-spin h-10 w-10 text-indigo-500" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">
                Synchronizing AI Study Room...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Embedded Study Room Applet */}
        <iframe
          src={studyRoomUrl}
          title="Acoustic Study Room"
          className="w-full h-[85vh] border-0 rounded-2xl"
          allow="microphone; camera; midi; encrypted-media; clipboard-read; clipboard-write;"
          onLoad={() => setIframeLoading(false)}
        />
      </div>
    </div>
  );
}
