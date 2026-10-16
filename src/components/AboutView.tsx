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
    <div className="min-h-screen bg-[#06070a] text-white flex flex-col font-['Inter'] selection:bg-white/20 selection:text-white relative overflow-x-hidden">
      {/* Top Ambient Glow & Mesh */}
      <div className="absolute inset-0 bg-mesh pointer-events-none opacity-40"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-white/5 rounded-full blur-[140px] pointer-events-none -z-0"></div>

      {/* Floating Pill Navbar */}
      <header className="relative z-30 w-full max-w-6xl mx-auto px-4 pt-6">
        <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between shadow-2xl">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={onBack}
          >
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-white">
              Dexter<span className="text-slate-400">Corp</span>
            </span>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
            <button
              onClick={onBack}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={onNavigateDashboard}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Dashboard
            </button>

            {/* Extra Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExtraDropdown(!showExtraDropdown)}
                onMouseEnter={() => setShowExtraDropdown(true)}
                className="flex items-center gap-1.5 text-white hover:text-white transition-colors cursor-pointer font-semibold"
              >
                <span>Extra</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showExtraDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showExtraDropdown && (
                <div
                  onMouseLeave={() => setShowExtraDropdown(false)}
                  className="absolute top-8 left-1/2 -translate-x-1/2 w-48 liquid-glass rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl"
                >
                  <button
                    onClick={() => {
                      setShowExtraDropdown(false);
                      onBack();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all text-left"
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Status</span>
                  </button>

                  <button
                    onClick={() => setShowExtraDropdown(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 transition-all text-left"
                  >
                    <User className="w-3.5 h-3.5 text-white" />
                    <span>About</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowExtraDropdown(false);
                      onNavigateDashboard();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all text-left"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Commands</span>
                  </button>

                  <a
                    href="https://discord.gg/dextercorp"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowExtraDropdown(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Documentation</span>
                  </a>
                </div>
              )}
            </div>

            <a
              href="https://discord.gg/dextercorp"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Support
            </a>

            <div className="flex items-center gap-1.5 text-slate-300 px-3 py-1 rounded-full liquid-glass">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-[11px] font-semibold">Premium</span>
            </div>
          </nav>

          {/* Right Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateDashboard}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-slate-200 transition-all cursor-pointer shadow-md"
              title="Open Dashboard"
            >
              <span>Console</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 z-10 max-w-4xl mx-auto w-full text-center">
        {/* Page Title & Subtitle */}
        <div className="space-y-3 mb-12 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-1.5 text-xs font-medium text-slate-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Leadership & Engineering</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight text-white">
            Meet <span className="text-gradient">The Team</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light max-w-lg mx-auto">
            World-class developers, designers, and security engineers committed to building
            the next generation of Discord protection architecture.
          </p>
        </div>

        {/* 1 SINGLE ABOUT CARD FOR "AXIO" - Obsidian Liquid Glass Edition */}
        <div className="w-full max-w-[360px] sm:max-w-[400px] liquid-glass rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden transition-all duration-300 group hover:-translate-y-1">
          {/* Top Shimmer Line */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full animate-shimmer" />

          {/* Top Banner Graphic with Dark Cyber Grid */}
          <div className="w-full h-32 rounded-2xl bg-gradient-to-br from-[#12141c] via-[#161822] to-[#0c0d12] border border-white/10 relative overflow-hidden mb-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#06070a]/90 via-transparent to-transparent"></div>

            {/* Avatar overlapping banner */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl opacity-60 animate-pulse-glow" />
                <div className="relative w-20 h-20 rounded-2xl bg-[#0e1017] p-1 border border-white/20 shadow-2xl overflow-hidden">
                  <img
                    src="https://cdn.discordapp.com/embed/avatars/0.png"
                    alt="AXIO"
                    className="w-full h-full rounded-xl object-cover"
                  />
                </div>

                {/* Heart Badge */}
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white text-black border-2 border-[#06070a] flex items-center justify-center shadow-md">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
            </div>
          </div>

          {/* Name & Role Pill */}
          <div className="pt-2 space-y-2 text-center">
            <h2 className="font-display font-bold text-2xl tracking-tight text-white group-hover:text-slate-200 transition-colors">
              AXIO
            </h2>

            {/* Role Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass text-amber-400 text-[10px] font-semibold tracking-wider uppercase">
              <Crown className="w-3 h-3 text-amber-400" />
              <span>Owner & Lead Architect</span>
            </div>

            {/* Bio Description */}
            <p className="text-xs text-slate-300/90 leading-relaxed pt-2 max-w-xs mx-auto font-light">
              The Head of Dexter Corporation. As the principal owner and developer, he directs all security protocols
              and oversees core infrastructure engineering.
            </p>
          </div>

          {/* Bottom Socials Bar */}
          <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-center gap-2.5">
            <a
              href="https://discord.gg/dextercorp"
              target="_blank"
              rel="noopener noreferrer"
              title="Discord"
              className="w-10 h-10 rounded-xl liquid-glass hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
            </a>

            <a
              href="https://discord.gg/dextercorp"
              target="_blank"
              rel="noopener noreferrer"
              title="Official Web"
              className="w-10 h-10 rounded-xl liquid-glass hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4" />
            </a>

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Twitter / X"
              className="w-10 h-10 rounded-xl liquid-glass hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <Twitter className="w-4 h-4" />
            </a>

            <a
              href="https://discord.gg/dextercorp"
              target="_blank"
              rel="noopener noreferrer"
              title="Telegram Channel"
              className="w-10 h-10 rounded-xl liquid-glass hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};
