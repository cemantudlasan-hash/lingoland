import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import {
  Mail,
  ShieldCheck,
  Clock,
  GraduationCap,
  Globe2,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  ArrowLeft,
  Building2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us & Educator Support | LingoLandVerse",
  description:
    "Get in touch with LingoLandVerse founder Ceman Tudlasan and our curriculum support team for ESL classroom inquiries, school partnerships, technical assistance, and editorial feedback.",
  alternates: {
    canonical: "https://www.lingolandverse.com/contact",
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact LingoLandVerse",
    description:
      "Official contact and educator support portal for LingoLandVerse ESL & multilingual learning platform.",
    url: "https://www.lingolandverse.com/contact",
    mainEntity: {
      "@type": "EducationalOrganization",
      name: "LingoLandVerse",
      founder: {
        "@type": "Person",
        name: "Ceman Tudlasan",
      },
      email: "vanguardfeatme@yahoo.com",
      url: "https://www.lingolandverse.com",
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/40 border border-cyan-500/30 px-3.5 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Flight Deck
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            Official Support &amp; Institutional Inquiries
          </span>
        </div>

        {/* Hero Section */}
        <section className="rounded-3xl border border-cyan-500/30 bg-slate-950/80 backdrop-blur-xl p-8 sm:p-12 shadow-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
            <Mail className="w-3.5 h-3.5" /> Direct Educator &amp; Learner Communications
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Contact LingoLandVerse
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            Whether you are an ESL teacher integrating our smartboard modules into your classroom, a student working through CEFR reading passages, or an academic partner with curriculum feedback, our team responds directly to all inquiries.
          </p>
        </section>

        {/* Contact Channels Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-white">Direct Email Desk</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              For account assistance, bug reports, curriculum requests, or general feedback:
            </p>
            <a
              href="mailto:vanguardfeatme@yahoo.com"
              className="inline-block text-sm font-bold text-cyan-400 hover:text-cyan-300 underline break-all"
            >
              vanguardfeatme@yahoo.com
            </a>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-white">Founder &amp; Lead Educator</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Curriculum design, pedagogical partnerships, and school deployment inquiries are overseen by founder <strong>Ceman Tudlasan</strong>.
            </p>
            <Link
              href="/about"
              className="inline-block text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
            >
              Read Founder Profile &amp; Mission &rarr;
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-white">Response Timeframe</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              We review all educator and student messages Monday through Saturday and typically respond within <strong>24 to 48 hours</strong> (ICT / UTC+7).
            </p>
            <Link
              href="/support"
              className="inline-block text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
            >
              Open Interactive Support &amp; FAQ Center &rarr;
            </Link>
          </div>
        </section>

        {/* Department Guide */}
        <section className="rounded-3xl border border-white/10 bg-slate-950/75 p-8 sm:p-10 space-y-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-cyan-400" />
            How Can We Help You Today?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-300">
            <div className="space-y-2 p-5 rounded-2xl bg-slate-900/50 border border-white/5">
              <h3 className="font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                Classroom Teachers &amp; Schools
              </h3>
              <p className="leading-relaxed">
                Need custom vocabulary lists, O-NET or Cambridge CEFR practice sets, or guidance on setting up smartboard games for your school? Email us with your grade level and curriculum goals.
              </p>
            </div>
            <div className="space-y-2 p-5 rounded-2xl bg-slate-900/50 border border-white/5">
              <h3 className="font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Editorial Corrections &amp; Content Suggestions
              </h3>
              <p className="leading-relaxed">
                Found a typo in a reading passage or quiz item? Please include the page URL or game title so our editorial team can verify and update the curriculum database immediately.
              </p>
            </div>
            <div className="space-y-2 p-5 rounded-2xl bg-slate-900/50 border border-white/5">
              <h3 className="font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Privacy, Data &amp; Account Requests
              </h3>
              <p className="leading-relaxed">
                To request account data export, profile deletion, or clarification regarding our <Link href="/privacy-policy" className="text-cyan-400 underline">Privacy Policy</Link>, contact our data steward directly via email.
              </p>
            </div>
            <div className="space-y-2 p-5 rounded-2xl bg-slate-900/50 border border-white/5">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-amber-400" />
                Peer &amp; Educator Marketplace Verification
              </h3>
              <p className="leading-relaxed">
                Educators applying for verified listing status in the LingoLandVerse Peer Tutor Directory can submit their teaching credentials and syllabus overview for manual review.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
