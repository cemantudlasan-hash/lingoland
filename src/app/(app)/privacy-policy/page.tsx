import React from 'react';
import Link from 'next/link';
import { Shield, Cookie, Eye, Lock, Globe, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ConstellationCanvas } from '@/components/ui/constellation-canvas';

export const metadata = {
  title: 'Privacy Policy | LingoLandVerse',
  description: 'Official Privacy Policy, Cookie Usage, Data Tracking, and Google AdSense Advertising Disclosures for LingoLandVerse.com.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <ConstellationCanvas />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/40 border border-cyan-500/30 px-3.5 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Flight Deck
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            Last Updated: October 2026
          </span>
        </div>

        {/* Hero Header */}
        <div className="rounded-3xl border border-cyan-500/30 bg-slate-950/80 backdrop-blur-xl p-8 sm:p-10 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              <Shield className="w-3.5 h-3.5" /> Official Regulatory Disclosure
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Privacy Policy &amp; Data Transparency
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              At LingoLandVerse.com, your privacy and digital safety are paramount. This policy details how our educational metaverse collects, uses, protects your information, and outlines our third-party advertising practices.
            </p>
          </div>
        </div>

        {/* Content Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-xl p-8 sm:p-10 shadow-2xl space-y-8 text-sm leading-relaxed text-slate-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-cyan-400 font-mono text-base">01.</span> Introduction &amp; Scope
            </h2>
            <p>
              Welcome to <strong>LingoLandVerse</strong> (&quot;LingoLandVerse.com&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), operated by creator and educational technologist <strong>Cem Antudlasan</strong>. This Privacy Policy governs all aspects of your access to our online language learning universe, including our 79+ gamified learning worlds, AI-assisted curriculum generators, Acoustic Study Room, companion pets, and language certification modules.
            </p>
            <p>
              By accessing or using LingoLandVerse, you consent to the data collection, cookie usage, and advertising practices described in this document.
            </p>
          </section>

          {/* Section 2: Cookie Usage & Tracking (EXPLICIT USER REQUIREMENT) */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-cyan-400 font-mono text-base">02.</span> Cookie Usage &amp; Data Tracking Technologies
            </h2>
            <p>
              LingoLandVerse uses <strong>cookies, local storage, web beacons, and session identifiers</strong> to deliver a seamless, personalized educational experience.
            </p>
            <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-white text-xs uppercase tracking-wider">
                  <Cookie className="w-4 h-4 text-cyan-400" /> Essential Session Cookies
                </div>
                <p className="text-xs text-slate-400">
                  Maintain your authentication state, protect against CSRF attacks, and enable uninterrupted transitions across educational worlds.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-white text-xs uppercase tracking-wider">
                  <Lock className="w-4 h-4 text-cyan-400" /> LocalStorage Progress Tokens
                </div>
                <p className="text-xs text-slate-400">
                  Save your study streaks, audio soundscape volume preferences, Pomodoro timer states, whiteboard notes, and completed lesson XP locally.
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              You can choose to disable or selectively turn off our cookies or third-party cookies in your browser settings. However, disabling essential cookies may impact your ability to interact with student dashboards and save daily streaks.
            </p>
          </section>

          {/* Section 3: Google AdSense and Third-Party Vendors (EXPLICIT USER REQUIREMENT) */}
          <section className="space-y-3 p-6 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
            <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-2 border-b border-cyan-500/20 pb-2">
              <span className="text-cyan-400 font-mono text-base">03.</span> Google AdSense &amp; Third-Party Advertising Disclosures
            </h2>
            <p className="font-semibold text-white">
              We plan to use and/or currently use Google AdSense and third-party advertising vendors to serve advertisements to support the free educational content provided across LingoLandVerse.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-slate-300">
              <li>
                <strong>Third-Party Vendor Disclosures:</strong> Third-party vendors, including <strong>Google</strong>, use cookies to serve ads based on a user&apos;s prior visits to LingoLandVerse.com or other websites across the Internet.
              </li>
              <li>
                <strong>DoubleClick DART Cookie:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.
              </li>
              <li>
                <strong>User Opt-Out Mechanisms:</strong> Users may opt out of personalized advertising at any time by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-bold hover:text-cyan-300">Google Ads Settings</a>. Alternatively, users can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-bold hover:text-cyan-300">www.aboutads.info</a>.
              </li>
              <li>
                <strong>Third-Party Ad Networks:</strong> These third-party ad servers or ad networks use technology in the advertisements and links that appear on LingoLandVerse, which are sent directly to your browser. They automatically receive your IP address when this occurs. Other technologies (such as cookies, JavaScript, or Web Beacons) may also be used by our third-party ad networks to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see.
              </li>
              <li>
                LingoLandVerse has no access to or control over these cookies that are used by third-party advertisers.
              </li>
            </ul>
          </section>

          {/* Section 4: Information We Collect */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-cyan-400 font-mono text-base">04.</span> Information We Collect
            </h2>
            <div className="space-y-2">
              <p>
                <strong>1. Account &amp; Profile Data:</strong> When you register as an ESL Cadet or Pilot, we collect your email address, display username, and authentication identifiers through Google Firebase Authentication.
              </p>
              <p>
                <strong>2. Academic Progress Data:</strong> Lesson completion timestamps, quiz answer accuracy, exam certificates earned, XP points, and virtual pet interaction levels.
              </p>
              <p>
                <strong>3. Automated Log Data:</strong> Internet Protocol (IP) addresses, browser type, Internet Service Provider (ISP), date/time stamps, referring/exit pages, and click counts to analyze user trends and administer the platform.
              </p>
              <p>
                <strong>4. AI Features &amp; Speech Synthesis Inputs:</strong> Phrases or queries submitted to our text-to-speech engine or AI prompt exercises are processed ephemerally for pedagogical output and are not sold or repurposed.
              </p>
            </div>
          </section>

          {/* Section 5: Children's Privacy */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-cyan-400 font-mono text-base">05.</span> Children&apos;s Online Privacy Protection (COPPA / GDPR-K)
            </h2>
            <p>
              LingoLandVerse is built for students, schools, and lifelong language learners. We strictly adhere to child privacy standards:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
              <li>We do not knowingly collect personally identifiable information from children under the age of 13 without verifiable parental or school consent.</li>
              <li>Students may engage with all learning modules and games under guest or cadet accounts without disclosing personal names or addresses.</li>
              <li>If you believe your child has submitted personal information without consent, please contact us immediately to have the data expunged.</li>
            </ul>
          </section>

          {/* Section 6: User Data Rights */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-cyan-400 font-mono text-base">06.</span> Your Data Rights (GDPR &amp; CCPA)
            </h2>
            <p>
              Regardless of your location, you hold full autonomy over your educational data. You have the right to request access to your stored records, request correction of erroneous data, export your progress history, or permanently delete your student account and all linked records.
            </p>
          </section>

          {/* Section 7: Contact & Entity Verification */}
          <section className="space-y-3 p-6 rounded-2xl bg-slate-900/60 border border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400" /> Data Controller &amp; Official Contact Information
            </h2>
            <p className="text-xs text-slate-300">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our advertising disclosures, please reach out directly:
            </p>
            <div className="pt-2 text-xs space-y-1 text-slate-300 font-mono">
              <p><strong className="text-white">Operator:</strong> Cem Antudlasan (LingoLandVerse Founder &amp; Lead Educator)</p>
              <p><strong className="text-white">Email:</strong> <a href="mailto:cemantudlasan@gmail.com" className="text-cyan-400 underline">cemantudlasan@gmail.com</a></p>
              <p><strong className="text-white">Website:</strong> <a href="https://lingolandverse.com" className="text-cyan-400 underline">https://lingolandverse.com</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
