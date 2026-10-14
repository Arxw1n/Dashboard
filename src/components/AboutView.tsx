import { BOT_CONFIG } from '../config';
import React, { useState } from 'react';
import {
  Shield,
  Heart,
  Crown,
  Sparkles,
  ChevronDown,
  Activity,
  FileText,
  User,
  Zap,
  Globe,
  Github,
  Twitter,
  Send,
  ExternalLink,
} from 'lucide-react';

interface AboutViewProps {
  onBack: () => void;
  onNavigateDashboard: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onBack, onNavigateDashboard }) => {
  const [showExtraDropdown, setShowExtraDropdown] = useState(false);

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col font-['Outfit'] selection:bg-[#ff2b43] selection:text-white relative overflow-x-hidden">
      {/* Top Ambient Glow (Matches Image 2) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#ff2b43]/15 rounded-full blur-[140px] pointer-events-none -z-0"></div>

      {/* Floating Pill Navbar - Exact Match to Image 2 */}
      <header className="relative z-30 w-full max-w-6xl mx-auto px-4 pt-6">
        <div className="bg-[#101117]/85 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5 flex items-center justify-between shadow-2xl shadow-black/80">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={onBack}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff2b43] to-[#ff596e] p-0.5 flex items-center justify-center shadow-lg shadow-[#ff2b43]/40">
              <div className="w-full h-full rounded-full bg-[#0d0e12] flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#ff2b43]" />
              </div>
            </div>
            <span className="font-orbitron font-bold text-lg tracking-wider text-white">
              DEXTER<span className="text-[#ff2b43]">CORP</span>
            </span>
          </div>

          {/* Center Navigation Links - Matches Image 2 */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wider text-slate-300 uppercase relative">
            <button
              onClick={onBack}
              className="hover:text-white transition-colors cursor-pointer"
            >
              HOME
            </button>
            <button
              onClick={onNavigateDashboard}
              className="hover:text-white transition-colors cursor-pointer"
            >
              DASHBOARD
            </button>

            {/* EXTRA Dropdown Menu (Matches Image 2 Dropdown) */}
            <div className="relative">
              <button
                onClick={() => setShowExtraDropdown(!showExtraDropdown)}
                onMouseEnter={() => setShowExtraDropdown(true)}
                className="flex items-center gap-1.5 text-[#ff2b43] hover:text-white transition-colors cursor-pointer font-bold border-b border-[#ff2b43] pb-0.5"
              >
                <span>EXTRA</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showExtraDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Popup (Status, About, Documentation) */}
              {showExtraDropdown && (
                <div
                  onMouseLeave={() => setShowExtraDropdown(false)}
                  className="absolute top-8 left-1/2 -translate-x-1/2 w-44 bg-[#0e1017] border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/90 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl"
                >
                  <button
                    onClick={() => {
                      setShowExtraDropdown(false);
                      onBack();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all text-left"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#ff2b43]" />
                    <span>Status</span>
                  </button>

                  <button
                    onClick={() => setShowExtraDropdown(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#ff2b43] bg-[#ff2b43]/10 border border-[#ff2b43]/20 transition-all text-left"
                  >
                    <User className="w-3.5 h-3.5 text-[#ff2b43]" />
                    <span>About</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowExtraDropdown(false);
                      onNavigateDashboard();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all text-left"
                  >
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Commands</span>
                  </button>

                  <a
                    href="https://discord.gg/codexdev"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowExtraDropdown(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Documentation</span>
                  </a>
                </div>
              )}
            </div>

            <a
              href="https://discord.gg/codexdev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              SUPPORT
            </a>

            <div className="flex items-center gap-1 text-slate-300 px-2 py-1 rounded-md bg-white/5 border border-white/10">
              <Sparkles className="w-3 h-3 text-[#ff2b43]" />
              <span className="text-[11px] font-bold">PREMIUM</span>
            </div>
          </nav>

          {/* Right Action: Language & User Avatar / Quick Dashboard */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 cursor-pointer">
              <span>🇬🇧</span>
              <span className="font-semibold">EN</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            <button
              onClick={onNavigateDashboard}
              className="flex items-center gap-2 pl-2 pr-3.5 py-1 rounded-full bg-[#181922] hover:bg-[#20222e] border border-[#ff2b43]/40 text-white text-xs font-semibold transition-all cursor-pointer shadow-md"
              title="Open Dashboard"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="AXIO"
                className="w-5 h-5 rounded-full object-cover border border-[#ff2b43]"
              />
              <span className="hidden sm:inline font-orbitron text-[11px] font-bold">AXIO</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (Matches Image 2 Style) */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 z-10 max-w-4xl mx-auto w-full text-center">
        {/* Page Title & Subtitle (Matches Image 2 with Glowing Red Text) */}
        <div className="space-y-3 mb-10 max-w-2xl mx-auto">
          <h1 className="font-orbitron font-black text-3xl sm:text-5xl tracking-wide text-white">
            Meet <span className="text-[#ff2b43] drop-shadow-[0_0_25px_rgba(255,43,67,0.7)]">The Team</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light max-w-lg mx-auto">
            World-class developers, designers, and security experts committed to building
            the next generation of Discord bot technology
          </p>
        </div>

        {/* 1 SINGLE ABOUT CARD FOR "AXIO" (Exact match to Image 2 design, exclusively for AXIO) */}
        <div className="w-full max-w-[340px] sm:max-w-[380px] bg-[#0c0d14]/90 border-2 border-[#ff2b43] rounded-3xl p-5 sm:p-6 shadow-[0_0_40px_rgba(255,43,67,0.25)] relative overflow-hidden transition-all duration-300 group hover:-translate-y-1 backdrop-blur-xl">
          {/* Subtle neon corner glows */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff2b43]/20 rounded-full blur-[45px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#5865F2]/10 rounded-full blur-[45px] pointer-events-none"></div>

          {/* Top Banner Graphic with Dark Cyber Image */}
          <div className="w-full h-28 rounded-2xl bg-gradient-to-br from-[#1a080c] via-[#2a0e14] to-[#11121c] border border-white/10 relative overflow-hidden mb-9">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
              alt="Banner"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d14] via-transparent to-transparent"></div>

            {/* Avatar overlapping banner (Exact Match to Image 2 Avatar with Heart Badge) */}
            <div className="absolute -bottom-9 left-1/2 -translate-x-1/2">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-[#0c0d14] p-1 border-2 border-[#ff2b43] shadow-xl shadow-[#ff2b43]/50 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    alt="AXIO"
                    className="w-full h-full rounded-xl object-cover"
                  />
                </div>

                {/* Heart Badge on Avatar (Exact Match to Image 2 Avatar Badge) */}
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#ff2b43] border-2 border-[#0c0d14] flex items-center justify-center text-white shadow-md shadow-[#ff2b43]/60">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
            </div>
          </div>

          {/* Name & Role Pill (Matches Image 2) */}
          <div className="pt-2 space-y-2 text-center">
            <h2 className="font-orbitron font-black text-2xl tracking-wider text-white group-hover:text-[#ff2b43] transition-colors">
              AXIO
            </h2>

            {/* Role Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff2b43]/15 border border-[#ff2b43]/40 text-[#ff4d61] text-[10px] font-bold font-mono tracking-wider uppercase">
              <Crown className="w-3 h-3 text-[#ff2b43]" />
              <span>OWNER & LEAD DEVELOPER</span>
            </div>

            {/* Bio Description (Matches Image 2 Description style) */}
            <p className="text-xs text-slate-300/90 leading-relaxed pt-2 max-w-xs mx-auto font-light">
              The Head of DexterCorp. As the main owner and developer, he manages all operations
              and makes the final decisions that shape the future of the project.
            </p>
          </div>

          {/* Bottom Socials Bar (Row of 5 Rounded Action Buttons - Exact Match to Image 2) */}
          <div className="pt-5 border-t border-white/5 mt-5 flex items-center justify-center gap-2.5">
            <a
              href="https://discord.gg/codexdev"
              target="_blank"
              rel="noopener noreferrer"
              title="Discord"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#5865F2]/20 border border-white/5 hover:border-[#5865F2]/40 text-slate-400 hover:text-[#5865F2] flex items-center justify-center transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
            </a>

            <a
              href="https://discord.gg/codexdev"
              target="_blank"
              rel="noopener noreferrer"
              title="Official Web"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/5 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-400 flex items-center justify-center transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4" />
            </a>

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Twitter / X"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer"
            >
              <Twitter className="w-4 h-4" />
            </a>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/5 hover:border-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <Github className="w-4 h-4" />
            </a>

            <a
              href={BOT_CONFIG.getInviteUrl()}
              target="_blank"
              rel="noopener noreferrer"
              title="Bot Invite"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-400 flex items-center justify-center transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* 3 Architecture Pillar cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8 w-full max-w-2xl text-left">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[10px] text-[#ff2b43] font-mono font-bold uppercase">Architecture</span>
            <p className="font-bold text-xs text-white">Hybrid Sharding</p>
            <p className="text-[11px] text-slate-400">Zero-downtime clustering across high-traffic Discord servers.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase">Security</span>
            <p className="font-bold text-xs text-white">Military Anti-Nuke</p>
            <p className="text-[11px] text-slate-400">Sub-millisecond interception for unauthorized raid events.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">Reliability</span>
            <p className="font-bold text-xs text-white">99.98% Uptime</p>
            <p className="text-[11px] text-slate-400">Continuous 24/7 telemetry monitoring and instant sync.</p>
          </div>
        </div>
      </main>
    </div>
  );
};
