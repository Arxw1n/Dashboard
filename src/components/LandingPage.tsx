import { BOT_CONFIG } from '../config';
import React, { useState, useEffect } from 'react';
import {
  Shield,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Activity,
  Zap,
  Server,
  Layers,
  LogOut,
  Lock,
  Globe,
  Radio,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  Terminal,
} from 'lucide-react';
import { BotStats, UserProfile } from '../types';
import { LoginModal } from './LoginModal';

interface LandingPageProps {
  stats: BotStats;
  user: UserProfile | null;
  onNavigateDashboard: () => void;
  onNavigateAbout?: () => void;
  onLoginWithDiscord: () => void;
  onDirectLogin: () => void;
  onLogout?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  stats,
  user,
  onNavigateDashboard,
  onNavigateAbout,
  onLoginWithDiscord,
  onDirectLogin,
  onLogout,
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Typing headline animation
  const headlineWords = [
    'Next-Gen Anti-Nuke',
    'Real-Time Automod',
    'Staff Anti-Betray',
    'Absolute Defense',
  ];
  const [wordIdx, setWordIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = headlineWords[wordIdx];
    const speed = isDeleting ? 40 : 80;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (typedText.length < word.length) {
          setTypedText(word.slice(0, typedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2200);
        }
      } else {
        if (typedText.length > 0) {
          setTypedText(word.slice(0, typedText.length - 1));
        } else {
          setIsDeleting(false);
          setWordIdx((prev) => (prev + 1) % headlineWords.length);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, wordIdx]);

  const BOT_INVITE_URL = BOT_CONFIG.getInviteUrl();
  const SUPPORT_URL = 'https://discord.gg/dextercorp';

  const faqs = [
    {
      q: 'What is Dexter Corporation?',
      a: 'Dexter Corporation is an advanced next-generation Discord security, anti-nuke, and moderation sentinel bot designed to protect online communities from rogue staff, nuke attacks, automated raids, and malicious links.',
    },
    {
      q: 'How does the Anti-Nuke system protect my server?',
      a: 'The bot continuously monitors high-risk events (mass kicks, bans, role & channel deletions, webhook creations). If a suspicious threshold is breached, the bot instantly strips permissions from the offending account, bans the intruder, and rolls back server changes.',
    },
    {
      q: 'What is the Anti-Betray Staff Guard?',
      a: 'Anti-Betray is a specialized security engine that strictly rate-limits administrators and moderators. It prevents compromised staff accounts from destroying the server or hijacking ownership privileges.',
    },
    {
      q: 'Is Dexter Corporation free to use?',
      a: 'Yes! Core security features, the interactive Message Sender, verification gates, and full anti-nuke protection are 100% free with unlimited server protection.',
    },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Anti-Nuke Protection',
      desc: 'Real-time defense against mass kicks, bans, channel deletion, and rogue administrator mutinies.',
    },
    {
      icon: Zap,
      title: 'Automated Auto-Mod',
      desc: 'Millisecond inspection filtering invite links, phishing domains, spam, zalgo, and mass mentions.',
    },
    {
      icon: Lock,
      title: 'Anti-Betray Staff Guard',
      desc: 'Enforces strict rate-limits on moderator and admin actions to stop insider attacks in their tracks.',
    },
    {
      icon: CheckCircle2,
      title: 'Verification Gate',
      desc: 'Interactive verification gates and captcha barriers to filter out automated self-bots and raiders.',
    },
    {
      icon: Terminal,
      title: 'Message Sender V2',
      desc: 'Craft rich interactive Discord cards with custom animated emojis, dividers, and action buttons.',
    },
    {
      icon: Activity,
      title: 'Instant Automated Rollbacks',
      desc: 'Continuous state auditing with auto-recovery that reverts destructive mutations in under 50ms.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#06070a] text-white flex flex-col font-['Inter'] relative overflow-x-hidden selection:bg-white/20 selection:text-white">
      {/* Background Ambient Glow & Mesh */}
      <div className="absolute inset-0 bg-mesh pointer-events-none opacity-40 -z-0"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/5 rounded-full blur-[160px] pointer-events-none -z-0"></div>

      {/* Floating Obsidian Navbar */}
      <header className="relative z-30 w-full max-w-6xl mx-auto px-4 pt-6">
        <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between shadow-2xl">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-white">
              Dexter<span className="text-slate-400">Corp</span>
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#protection" className="hover:text-white transition-colors">
              Protection
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
            <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              Support
            </a>
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-2">
            {user && user.isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onNavigateDashboard}
                  className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-slate-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-slate-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-md transform hover:-translate-y-0.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Portal Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION (Matches Obsidian Qt) */}
      <section className="container max-w-[1400px] mx-auto px-6 pt-16 pb-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Headline & CTA */}
          <div className="space-y-6">
            {/* Live Telemetry Pill */}
            <div className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-1.5 text-xs font-medium text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span>Protecting 2,500+ Discord Communities</span>
            </div>

            {/* Huge Headline */}
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight text-white">
              Absolute Defense.{' '}
              <span className="text-gradient block mt-1">
                {typedText}
                <span className="animate-pulse">|</span>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-lg leading-relaxed">
              The next-generation Discord security sentinel. Built from the ground up to prevent rogue staff mutinies, nuke attacks, and automated raids in real-time.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={BOT_INVITE_URL}
                target="_blank"
                rel="noreferrer"
                className="py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-200 text-black font-semibold text-sm shadow-xl shadow-white/10 transition-all flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Add to Discord</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              {user && user.isLoggedIn ? (
                <button
                  onClick={onNavigateDashboard}
                  className="py-3.5 px-6 rounded-2xl liquid-glass hover:bg-white/10 text-white font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-slate-300" />
                  <span>Open Dashboard</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="py-3.5 px-6 rounded-2xl liquid-glass hover:bg-white/10 text-white font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-slate-300" />
                  <span>Access Control Node</span>
                </button>
              )}
            </div>

            {/* Live Ping & Support Link */}
            <div className="flex items-center gap-4 text-xs pt-1">
              <div className="flex items-center gap-2 font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Systems 100% Operational</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <span>Join Support Server</span>
                <span className="text-[10px]">&rarr;</span>
              </a>
            </div>

            {/* 3 Live Telemetry Stat Cards */}
            <div className="grid grid-cols-3 gap-3 pt-4 max-w-md">
              <div className="liquid-glass rounded-2xl p-4 text-center hover:scale-[1.03] transition-transform">
                <div className="font-display font-bold text-2xl text-white">2.5K+</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Protected Guilds</div>
              </div>

              <div className="liquid-glass rounded-2xl p-4 text-center hover:scale-[1.03] transition-transform">
                <div className="font-display font-bold text-2xl text-white">1.2M+</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Total Users</div>
              </div>

              <div className="liquid-glass rounded-2xl p-4 text-center hover:scale-[1.03] transition-transform">
                <div className="font-display font-bold text-2xl text-emerald-400">99.9%</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Uptime SLA</div>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Mascot & Telemetry Cards */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
              {/* Aurora Glow behind Mascot */}
              <div className="absolute inset-10 bg-white/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

              {/* Mascot Floating Container */}
              <div className="relative z-10 w-3/4 h-3/4 flex items-center justify-center animate-float">
                <div className="relative w-full h-full rounded-3xl border border-white/20 bg-[#10121a] overflow-hidden shadow-2xl flex items-center justify-center">
                  <img
                    src="https://cdn.discordapp.com/attachments/1349027457531904072/1351659687168586391/giphy.gif"
                    alt="DexterCorp Sentinel"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <Shield className="w-24 h-24 text-white/30 absolute inset-0 m-auto pointer-events-none" />
                </div>
              </div>

              {/* Floating Badge 1: Latency */}
              <div className="absolute top-6 right-2 sm:right-6 z-20 liquid-glass rounded-2xl px-4 py-2.5 text-xs shadow-2xl">
                <div className="text-[10px] text-slate-400 font-medium">Core Latency</div>
                <div className="font-display font-bold text-white text-sm">24ms</div>
              </div>

              {/* Floating Badge 2: Commands */}
              <div className="absolute bottom-6 sm:bottom-10 left-0 z-20 liquid-glass rounded-2xl px-4 py-2.5 text-xs shadow-2xl">
                <div className="text-[10px] text-slate-400 font-medium">Active Commands</div>
                <div className="font-display font-bold text-white text-sm">147+ Built-in</div>
              </div>

              {/* Floating Badge 3: Nuke Saves */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 sm:left-2 z-20 liquid-glass rounded-2xl px-4 py-2.5 text-xs shadow-2xl">
                <div className="text-[10px] text-slate-400 font-medium">Nuke Saves</div>
                <div className="font-display font-bold text-emerald-400 text-sm">1,450 Attacks Neutralized</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID SECTION (Matches Obsidian Xt) */}
      <section id="features" className="container max-w-[1400px] mx-auto px-6 py-20 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            SYSTEM MODULES
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white">
            Engineered for absolute server defense
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Every security protocol is tuned for instant sub-millisecond execution to counter threats before permissions can be altered.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="liquid-glass rounded-2xl p-7 group cursor-default hover:-translate-y-1.5 transition-all duration-300"
            >
              {/* Icon Container with Hover Rotation */}
              <div className="relative mb-5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <feat.icon className="w-5 h-5 text-white" />
                </div>
              </div>

              <h3 className="font-display font-semibold text-lg text-white mb-2 group-hover:text-slate-200 transition-colors">
                {feat.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {feat.desc}
              </p>

              {/* Bottom Subtle Shimmer Line */}
              <div className="mt-5 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION (Matches Obsidian Yt) */}
      <section id="faq" className="container max-w-3xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center space-y-2 mb-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            KNOWLEDGE BASE
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-white">
            Questions, answered
          </h2>
        </div>

        <div className="liquid-glass rounded-3xl p-4 sm:p-6 space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border-b border-white/5 last:border-b-0 pb-3"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full py-3 px-2 flex items-center justify-between text-left font-display font-semibold text-sm sm:text-base text-white hover:text-slate-200 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                    openFaq === idx ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {openFaq === idx && (
                <p className="px-2 pt-1 pb-3 text-xs text-slate-400 leading-relaxed animate-in fade-in">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER SECTION (Matches Obsidian it) */}
      <section className="container max-w-5xl mx-auto px-6 py-20 relative z-10">
        <div className="liquid-glass rounded-3xl p-10 md:p-16 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-50 pointer-events-none" />

          {/* Rotating Sparkles */}
          <Sparkles className="absolute top-8 left-12 h-6 w-6 text-white/20 animate-spin" style={{ animationDuration: '12s' }} />
          <Sparkles className="absolute bottom-10 right-14 h-6 w-6 text-white/15 animate-spin" style={{ animationDuration: '16s' }} />

          <div className="relative z-10 space-y-4">
            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white">
              Ready to upgrade your server?
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Join over 2,500 Discord communities protected by Dexter Corporation. Free forever, no credit card required.
            </p>

            <div className="pt-4 flex flex-wrap gap-3 justify-center">
              <a
                href={BOT_INVITE_URL}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-6 rounded-2xl bg-white hover:bg-slate-200 text-black font-semibold text-xs shadow-xl shadow-white/10 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Invite DexterCorp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-6 rounded-2xl liquid-glass hover:bg-white/10 text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Get Support</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10 relative z-10 text-xs text-slate-500">
        <div className="container max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-white" />
            <span className="font-display font-semibold text-white">Dexter Corporation</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
            <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              Community
            </a>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={(demoUser) => {
          onDirectLogin();
          setShowLoginModal(false);
        }}
      />
    </div>
  );
};
