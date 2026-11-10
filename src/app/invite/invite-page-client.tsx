"use client";

import React, { useState } from "react";
import { InviteShareModal } from "@/components/layout/invite-share-modal";
import {
  Share2,
  GraduationCap,
  Users,
  QrCode,
  Copy,
  Check,
  Printer,
  Globe,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function InvitePageClient() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAudience, setModalAudience] = useState<"teachers" | "students">("teachers");
  const [copiedUrl, setCopiedUrl] = useState(false);

  const siteUrl = "https://www.lingolandverse.com";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&color=082f49&bgcolor=ffffff&data=${encodeURIComponent(
    `${siteUrl}/?ref=classroom_qr`
  )}`;

  const handleOpenModal = (audience: "teachers" | "students") => {
    setModalAudience(audience);
    setModalOpen(true);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
      toast({
        title: "Website Link Copied!",
        description: "Share https://www.lingolandverse.com with teachers and students!",
      });
    } catch {
      // ignore
    }
  };

  const handlePrintPoster = () => {
    window.print();
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        {/* Left 7 columns: Quick Invite Actions */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900/80 border border-cyan-500/30 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-[0_0_50px_rgba(6,182,212,0.12)]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> +15 Lingo-Coins Daily Share Bonus
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-headline text-white">
              1-Click Social & Messenger Invitations
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Open our interactive Invitation Studio to customize pre-written messages for{" "}
              <strong className="text-amber-300">Teachers</strong> or{" "}
              <strong className="text-cyan-300">Students</strong> and share directly to{" "}
              <span className="text-white font-semibold">
                Facebook, LINE, WhatsApp, X (Twitter), Telegram, LinkedIn, Google Classroom, or Email
              </span>
              .
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => handleOpenModal("teachers")}
              className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black uppercase tracking-wider text-xs sm:text-sm shadow-[0_0_25px_rgba(251,191,36,0.35)] transition-all cursor-pointer"
            >
              <GraduationCap className="w-5 h-5" />
              Invite Fellow Teachers
            </button>

            <button
              type="button"
              onClick={() => handleOpenModal("students")}
              className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 text-slate-950 font-black uppercase tracking-wider text-xs sm:text-sm shadow-[0_0_25px_rgba(34,211,238,0.35)] transition-all cursor-pointer"
            >
              <Users className="w-5 h-5" />
              Invite Students & Classmates
            </button>
          </div>

          {/* Direct URL Copy Bar */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Official Platform Link
            </span>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="flex-1 bg-slate-950/90 border border-white/15 rounded-xl px-4 py-3 text-sm font-mono text-cyan-200 select-all flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">{siteUrl}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-cyan-300" /> Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right 5 columns: Printable / Smartboard Classroom QR Poster */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/15 p-6 sm:p-8 flex flex-col items-center justify-between text-center space-y-5 shadow-xl">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-cyan-400 text-xs font-black uppercase tracking-widest">
              <QrCode className="w-4 h-4" /> Classroom Smartboard & Poster QR
            </div>
            <h3 className="text-xl font-black text-white">Scan to Join LingoLandVerse</h3>
            <p className="text-xs text-slate-400">
              Project on your classroom screen or print for your school bulletin board
            </p>
          </div>

          <div className="bg-white p-4 rounded-3xl shadow-[0_0_40px_rgba(34,211,238,0.25)] border-4 border-cyan-400/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="LingoLandVerse Classroom QR Code"
              width={210}
              height={210}
              className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
            <button
              type="button"
              onClick={() => handleOpenModal("students")}
              className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-200 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> Open Full Share Studio
            </button>
            <button
              type="button"
              onClick={handlePrintPoster}
              className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Flyer
            </button>
          </div>
        </div>
      </div>

      <InviteShareModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultAudience={modalAudience}
        defaultScope="site"
      />
    </>
  );
}

