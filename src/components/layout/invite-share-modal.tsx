"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import {
  Share2,
  Copy,
  Check,
  QrCode,
  GraduationCap,
  Users,
  Sparkles,
  Coins,
  Globe,
  Mail,
  MessageCircle,
  Send,
  ExternalLink,
  Download,
} from "lucide-react";

const SITE_URL = "https://www.lingolandverse.com";
const SHARE_REWARD_COINS = 15;

export function InviteShareModal({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;

  const pathname = usePathname();
  const { user, userProfile } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [audience, setAudience] = useState<"students" | "teachers">("teachers");
  const [shareScope, setShareScope] = useState<"site" | "current">("site");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [rewardClaimedToday, setRewardClaimedToday] = useState(false);
  const [isPingingSeo, setIsPingingSeo] = useState(false);

  // Listen for global event so any header/page button can open the modal
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail?.audience) setAudience(detail.audience);
      if (detail?.shareScope) setShareScope(detail.shareScope);
      setIsOpen(true);
    };
    window.addEventListener("lingoland_open_invite_modal", handleOpen);
    return () => window.removeEventListener("lingoland_open_invite_modal", handleOpen);
  }, [setIsOpen]);

  // Check if daily share reward was already claimed today
  useEffect(() => {
    if (typeof window === "undefined") return;
    const todayStr = new Date().toISOString().slice(0, 10);
    const key = `lingoland_share_reward_${user?.uid || "guest"}_${todayStr}`;
    setRewardClaimedToday(localStorage.getItem(key) === "true");
  }, [user, isOpen]);

  const refCode = user?.uid ? user.uid.slice(0, 8) : "welcome";
  const targetPath =
    shareScope === "current" && pathname && pathname !== "/" ? pathname : "";
  const shareUrl = `${SITE_URL}${targetPath}?ref=${refCode}`;

  const teacherInviteText = `🚀 Fellow Educators & Teachers! Check out LingoLandVerse — a free interactive ESL, Math & Science learning platform with 79+ CEFR-aligned classroom games, AI Presentation Maker, graded reading comprehension, and Smartboard tools for students!\n\nExplore & use it free in your classroom: ${shareUrl}`;

  const studentInviteText = `🎮 Join me on LingoLandVerse! Play 79+ interactive English, Math & Science games, evolve your Lingo-Pet companion, and practice with AI voice roleplay & flashcards!\n\nStart playing here: ${shareUrl}`;

  const activeMessage = audience === "teachers" ? teacherInviteText : studentInviteText;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&color=0f172a&bgcolor=ffffff&data=${encodeURIComponent(
    shareUrl
  )}`;

  const grantDailyShareReward = async () => {
    if (typeof window === "undefined") return;
    const todayStr = new Date().toISOString().slice(0, 10);
    const key = `lingoland_share_reward_${user?.uid || "guest"}_${todayStr}`;
    if (localStorage.getItem(key) === "true") return;

    localStorage.setItem(key, "true");
    setRewardClaimedToday(true);

    try {
      if (user && firestore) {
        const petRef = doc(firestore, "user_pets", user.uid);
        const snap = await getDoc(petRef);
        const currentCoins = snap.exists() ? Number(snap.data()?.coins || 0) : 120;
        await setDoc(
          petRef,
          { coins: Number((currentCoins + SHARE_REWARD_COINS).toFixed(2)) },
          { merge: true }
        );
      } else {
        const guestPetRaw = localStorage.getItem("lingoland_guest_pet");
        if (guestPetRaw) {
          const guestPet = JSON.parse(guestPetRaw);
          guestPet.coins = Number(((guestPet.coins || 0) + SHARE_REWARD_COINS).toFixed(2));
          localStorage.setItem("lingoland_guest_pet", JSON.stringify(guestPet));
        }
      }
      toast({
        title: `+${SHARE_REWARD_COINS} Lingo-Coins Earned! 🪙`,
        description: "Thank you for inviting teachers and students to LingoLandVerse!",
      });
    } catch (err) {
      console.error("Failed to award share coins:", err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      toast({
        title: "Invite Link Copied! 🔗",
        description: "Share it with teachers, students, or classroom groups.",
      });
      await grantDailyShareReward();
    } catch (e) {}
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(activeMessage);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
      toast({
        title: "Invitation Message Copied! 📋",
        description: "Ready to paste into Facebook, LINE, WhatsApp, or Email.",
      });
      await grantDailyShareReward();
    } catch (e) {}
  };

  const handleSocialShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(activeMessage);
    const encodedTitle = encodeURIComponent(
      "LingoLandVerse — 79+ Free Interactive ESL, Math & Science Classroom Games"
    );

    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case "line":
        url = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`;
        break;
      case "whatsapp":
        url = `https://api.whatsapp.com/send?text=${encodedText}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "email":
        url = `mailto:?subject=${encodedTitle}&body=${encodedText}`;
        break;
      case "native":
        if (typeof navigator !== "undefined" && navigator.share) {
          try {
            await navigator.share({
              title: "LingoLandVerse Educational Universe",
              text: activeMessage,
              url: shareUrl,
            });
            await grantDailyShareReward();
          } catch (e) {}
          return;
        }
        break;
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      await grantDailyShareReward();
    }
  };

  const handleSeoBroadcast = async () => {
    setIsPingingSeo(true);
    try {
      const res = await fetch("/api/seo-ping", { method: "POST" });
      const data = await res.json();
      toast({
        title: "Search Engines Notified! 🌐",
        description:
          data.message ||
          "Submitted sitemap & 140+ educational pages to IndexNow & search crawlers.",
      });
    } catch (e) {
      toast({
        title: "Sitemap Ready for Crawlers 🌐",
        description: "Your sitemap.xml and structured metadata are live for Google & Bing.",
      });
    } finally {
      setIsPingingSeo(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto bg-slate-950/95 border border-cyan-500/40 text-slate-100 rounded-3xl p-5 sm:p-7 backdrop-blur-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)]">
        <DialogHeader className="space-y-2 border-b border-white/10 pb-4 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-400/40 text-cyan-300">
                <Share2 className="w-3.5 h-3.5" /> Classroom &amp; Global Invite Hub
              </span>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/40 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                <Coins className="w-3 h-3 mr-1 text-amber-400" />
                {rewardClaimedToday
                  ? "Daily Bonus Claimed ✓"
                  : `+${SHARE_REWARD_COINS} Coins Daily Share Bonus`}
              </Badge>
            </div>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Invite Teachers &amp; Students to LingoLandVerse
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Share free access to 79+ CEFR-aligned interactive games, AI Classroom Presentation tools, and Smartboard activities with fellow educators and students worldwide.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Audience & Link Scope Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 flex gap-1.5">
              <button
                type="button"
                onClick={() => setAudience("teachers")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  audience === "teachers"
                    ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Invite Teachers</span>
              </button>
              <button
                type="button"
                onClick={() => setAudience("students")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  audience === "students"
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Invite Students</span>
              </button>
            </div>

            <div className="p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 flex gap-1.5">
              <button
                type="button"
                onClick={() => setShareScope("site")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  shareScope === "site"
                    ? "bg-slate-800 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Main Website</span>
              </button>
              <button
                type="button"
                onClick={() => setShareScope("current")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  shareScope === "current"
                    ? "bg-slate-800 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Current Page/Game</span>
              </button>
            </div>
          </div>

          {/* Direct Share Link Box */}
          <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/70 p-3.5 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
              <span>Direct Invitation Link</span>
              <span className="text-[11px] text-slate-400">Works on Smartboards, Mobile &amp; Desktop</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-slate-950/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-cyan-100 font-mono select-all focus:outline-none focus:border-cyan-400"
              />
              <Button
                type="button"
                onClick={handleCopyLink}
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black rounded-xl px-5 h-10 sm:h-auto shrink-0 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1.5" /> Copy Link
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 1-Click Social Broadcast Grid */}
          <div className="space-y-2.5">
            <div className="text-xs font-black uppercase tracking-wider text-slate-300">
              1-Click Share to Social Media &amp; Teacher/Student Groups
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => handleSocialShare("facebook")}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1877F2]/20 hover:bg-[#1877F2]/35 border border-[#1877F2]/50 text-white text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>📘</span> Facebook
              </button>
              <button
                type="button"
                onClick={() => handleSocialShare("line")}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#06C755]/20 hover:bg-[#06C755]/35 border border-[#06C755]/50 text-white text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>💬</span> LINE
              </button>
              <button
                type="button"
                onClick={() => handleSocialShare("whatsapp")}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/35 border border-[#25D366]/50 text-white text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" /> WhatsApp
              </button>
              <button
                type="button"
                onClick={() => handleSocialShare("twitter")}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>𝕏</span> Post on X
              </button>
              <button
                type="button"
                onClick={() => handleSocialShare("telegram")}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#229ED9]/20 hover:bg-[#229ED9]/35 border border-[#229ED9]/50 text-white text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#38bdf8]" /> Telegram
              </button>
              <button
                type="button"
                onClick={() => handleSocialShare("linkedin")}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0A66C2]/20 hover:bg-[#0A66C2]/35 border border-[#0A66C2]/50 text-white text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>💼</span> LinkedIn
              </button>
              <button
                type="button"
                onClick={() => handleSocialShare("email")}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 border border-purple-400/50 text-white text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-purple-300" /> Email Invite
              </button>
              <button
                type="button"
                onClick={() => handleSocialShare("native")}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" /> More Apps
              </button>
            </div>
          </div>

          {/* Pre-written Invitation Message + Classroom QR Code Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* Left: Ready-to-Post Invitation Copy */}
            <div className="md:col-span-7 rounded-2xl border border-white/10 bg-slate-900/80 p-4 flex flex-col justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                    {audience === "teachers"
                      ? "Ready-to-Send Teacher Invite"
                      : "Ready-to-Send Student Invite"}
                  </span>
                  <Badge variant="outline" className="text-[10px] border-indigo-400/30 text-indigo-200">
                    Customizable
                  </Badge>
                </div>
                <textarea
                  readOnly
                  rows={5}
                  value={activeMessage}
                  className="w-full rounded-xl bg-slate-950/90 border border-white/10 p-3 text-xs text-slate-200 leading-relaxed resize-none focus:outline-none"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyMessage}
                className="w-full rounded-xl border-indigo-400/40 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-100 font-bold text-xs h-10 cursor-pointer"
              >
                {copiedMessage ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5 text-emerald-400" /> Message Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1.5" /> Copy Full Invitation Text
                  </>
                )}
              </Button>
            </div>

            {/* Right: Instant Classroom Smartboard QR Code */}
            <div className="md:col-span-5 rounded-2xl border border-white/10 bg-slate-900/80 p-4 flex flex-col items-center justify-between text-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-cyan-300">
                <QrCode className="w-4 h-4 text-cyan-400" />
                <span>Classroom Smartboard QR</span>
              </div>
              <div className="bg-white p-2.5 rounded-2xl shadow-lg border-2 border-cyan-400/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl}
                  alt="LingoLandVerse Classroom QR Code"
                  width={136}
                  height={136}
                  className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-lg"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Project on your classroom board so students can scan &amp; join immediately!
              </p>
              <a
                href={qrImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                download="lingolandverse-classroom-qr.png"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-300 hover:text-cyan-200 underline"
              >
                <Download className="w-3.5 h-3.5" /> Open Full-Size QR Poster
              </a>
            </div>
          </div>

          {/* Search Engine Indexing & Public Invite Page Footer */}
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left space-y-0.5">
              <div className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Search Engine Discovery &amp; Public Flyer</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Ping search engines (IndexNow / Bing / Yandex / DuckDuckGo) or open the public Educator Invite page.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isPingingSeo}
                onClick={handleSeoBroadcast}
                className="flex-1 sm:flex-initial rounded-xl border-emerald-400/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 text-xs font-bold h-9 cursor-pointer"
              >
                {isPingingSeo ? "Pinging..." : "Ping Search Engines"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  window.open("/invite", "_blank");
                }}
                className="flex-1 sm:flex-initial rounded-xl border-cyan-400/40 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 text-xs font-bold h-9 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1" /> Flyer Page
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

