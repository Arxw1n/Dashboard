import { BOT_CONFIG } from '../config';
import React, { useState, useEffect } from 'react';
import {
  Shield,
  ExternalLink,
  Play,
  Sparkles,
  ChevronDown,
  Activity,
  Zap,
  Server,
  Layers,
  LogOut,
} from 'lucide-react';
import { BotStats, UserProfile } from '../types';

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
  const [showExtraDropdown, setShowExtraDropdown] = useState(false);

  // Typing animation for the headline
  const words = [
    'Unbeatable Protection',
    'Extreme Precision',
    'Advanced Anti-Nuke',
    'Military-Grade Security',
    'Intelligent Automod',
  ];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    const typingSpeed = isDeleting ? 35 : 75;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < currentWord.length) {
          setCurrentText(currentWord.slice(0, currentText.length + 1));
        } else {
          // Pause at end of word
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(currentWord.slice(0, currentText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex]);

  const BOT_INVITE_URL = BOT_CONFIG.getInviteUrl();
  const SUPPORT_URL = 'https://discord.gg/codexdev';

  // Handle clicking DASHBOARD link
  const handleDashboardClick = () => {
    if (user && user.isLoggedIn) {
      onNavigateDashboard();
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col font-['Outfit'] relative overflow-x-hidden selection:bg-[#ff2b43] selection:text-white">
      {/* Top Red Ambient Lighting Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#ff2b43]/15 rounded-full blur-[140px] pointer-events-none -z-0"></div>

      {/* Header Navbar (Screenshot 1) */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-4 pt-6">
        <div className="bg-[#101117]/80 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5 flex items-center justify-between shadow-2xl shadow-black/80">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff2b43] to-[#ff596e] p-0.5 flex items-center justify-center shadow-lg shadow-[#ff2b43]/40">
              <div className="w-full h-full rounded-full bg-[#0d0e12] flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#ff2b43]" />
              </div>
            </div>
            <span className="font-orbitron font-bold text-lg tracking-wider text-white">
              ONYX<span className="text-[#ff2b43]">GUARD</span>
            </span>
          </div>

          {/* Navigation Links - Matches Image 2 */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wider text-slate-300 uppercase relative">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-white transition-colors cursor-pointer text-[#ff2b43] border-b border-[#ff2b43] pb-0.5"
            >
              HOME
            </button>
            <button
              onClick={handleDashboardClick}
              className="hover:text-white transition-colors cursor-pointer"
            >
              DASHBOARD
            </button>

            {/* EXTRA Dropdown Menu (Matches Image 2) */}
            <div className="relative">
              <button
                onClick={() => setShowExtraDropdown(!showExtraDropdown)}
                onMouseEnter={() => setShowExtraDropdown(true)}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              >
                <span>EXTRA</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showExtraDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Popup */}
              {showExtraDropdown && (
                <div
                  onMouseLeave={() => setShowExtraDropdown(false)}
                  className="absolute top-8 left-1/2 -translate-x-1/2 w-44 bg-[#0e1017] border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/90 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl"
                >
                  <a
                    href="#stats"
                    onClick={() => setShowExtraDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#ff2b43]" />
                    <span>Status</span>
                  </a>

                  <button
                    onClick={() => {
                      setShowExtraDropdown(false);
                      if (onNavigateAbout) onNavigateAbout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-[#ff2b43]/15 transition-all text-left"
                  >
                    <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-[#ff2b43]">ℹ️</span>
                    <span>About</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowExtraDropdown(false);
                      handleDashboardClick();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all text-left"
                  >
                    <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-cyan-400">⚡</span>
                    <span>Commands</span>
                  </button>

                  <a
                    href={SUPPORT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowExtraDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <span className="w-3.5 h-3.5 flex items-center justify-center text-cyan-400">📖</span>
                    <span>Documentation</span>
                  </a>
                </div>
              )}
            </div>

            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              SUPPORT
            </a>
            <div className="flex items-center gap-1 text-slate-300 px-2 py-1 rounded-md bg-white/5 border border-white/10">
              <Sparkles className="w-3 h-3 text-[#ff2b43]" />
              <span className="text-[11px] font-bold">PREMIUM</span>
            </div>
          </nav>

          {/* Right Action: Language & Login Button */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 cursor-pointer">
              <span>🇬🇧</span>
              <span className="font-semibold">EN</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {user && user.isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onNavigateDashboard}
                  className="flex items-center gap-2 pl-2 pr-4 py-1 rounded-full bg-[#181922] hover:bg-[#20222e] border border-[#ff2b43]/40 text-white text-xs font-semibold transition-all cursor-pointer shadow-md"
                  title="Open Dashboard"
                >
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-5 h-5 rounded-full object-cover border border-[#ff2b43]"
                  />
                  <span className="max-w-[100px] truncate">{user.username}</span>
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-1.5 rounded-full bg-gradient-to-r from-[#ff2b43] to-[#e61932] hover:from-[#ff4257] hover:to-[#ff2b43] text-white text-xs font-bold tracking-wider uppercase shadow-lg shadow-[#ff2b43]/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                LOGIN
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero Section (Screenshot 1 & Typing Animation) */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pt-16 pb-16 max-w-4xl mx-auto">
        {/* Main Headline with Typing Animation */}
        <h1 className="font-orbitron font-extrabold text-4xl sm:text-6xl md:text-7xl tracking-tight leading-[1.15] text-white mb-6">
          Secure your server <br />
          <span className="text-[#ff2b43] text-glow-red inline-block min-h-[1.25em]">
            {currentText}
            <span className="inline-block w-1 sm:w-1.5 h-7 sm:h-12 bg-[#ff2b43] ml-1.5 animate-pulse align-middle"></span>
          </span>
        </h1>

        {/* Subtitle description */}
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed mb-8">
          DexterCorp protects your community with advanced anti-nuke systems,
          intelligent automod, and high-fidelity utility tools.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <a
            href={BOT_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff2b43] to-[#dc1b30] hover:from-[#ff4459] hover:to-[#ff2b43] text-white text-sm font-bold tracking-wide shadow-xl shadow-[#ff2b43]/35 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Add to Discord</span>
          </a>

          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#13141b]/90 hover:bg-[#1a1c24] border border-white/10 hover:border-white/20 text-slate-200 text-sm font-semibold transition-all cursor-pointer"
          >
            <span>Support Server</span>
          </a>
        </div>

        {/* Stats Card Box (Screenshot 1) */}
        <div className="w-full max-w-2xl bg-[#0e0f15]/90 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md mb-6">
          <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
            <div className="px-3">
              <p className="font-orbitron font-extrabold text-xl sm:text-3xl text-white">
                {stats.guilds > 0 ? stats.guilds.toLocaleString() : '16,714'}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400 tracking-wider font-semibold uppercase mt-1">
                ACTIVE SERVERS
              </p>
            </div>
            <div className="px-3">
              <p className="font-orbitron font-extrabold text-xl sm:text-3xl text-white">
                {stats.users > 0 ? stats.users.toLocaleString() : '51,10,540'}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400 tracking-wider font-semibold uppercase mt-1">
                GLOBAL USERS
              </p>
            </div>
            <div className="px-3">
              <p className="font-orbitron font-extrabold text-xl sm:text-3xl text-white">
                132+
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400 tracking-wider font-semibold uppercase mt-1">
                COMMANDS
              </p>
            </div>
          </div>
        </div>

        {/* Bottom System Status */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-badge-red"></span>
            <span className="text-emerald-400 font-semibold">Global Systems Online</span>
          </div>
          <span className="text-slate-600">|</span>
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-200 transition-colors flex items-center gap-1 text-slate-400"
          >
            <span>Join Support Server</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </main>

      {/* Live Statistics Section (Matching Screenshot 5) */}
      <section id="stats" className="w-full max-w-5xl mx-auto px-4 pb-20 pt-4">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/5">
          <div>
            <h2 className="font-orbitron font-bold text-xl sm:text-2xl text-white tracking-wide">
              Live Statistics
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time bot performance metrics</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0d0e14] border border-white/5 rounded-2xl p-5 hover:border-[#ff2b43]/30 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">CLUSTER LATENCY</span>
              <Activity className="w-3.5 h-3.5 text-[#ff2b43]" />
            </div>
            <p className="font-orbitron font-bold text-2xl text-white">{stats.ping || 18}ms</p>
            <p className="text-[10px] text-emerald-400 font-semibold mt-1">✓ Nominal Response</p>
          </div>

          <div className="bg-[#0d0e14] border border-white/5 rounded-2xl p-5 hover:border-[#ff2b43]/30 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">HYBRID CLUSTERS</span>
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <p className="font-orbitron font-bold text-2xl text-white">4 Shards</p>
            <p className="text-[10px] text-cyan-400 font-semibold mt-1">✓ Cluster 0 Online</p>
          </div>

          <div className="bg-[#0d0e14] border border-white/5 rounded-2xl p-5 hover:border-[#ff2b43]/30 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">CORE COMMANDS</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="font-orbitron font-bold text-2xl text-white">132 Loaded</p>
            <p className="text-[10px] text-amber-400 font-semibold mt-1">✓ Anti-Nuke Protected</p>
          </div>

          <div className="bg-[#0d0e14] border border-white/5 rounded-2xl p-5 hover:border-[#ff2b43]/30 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">SYSTEM UPTIME</span>
              <Server className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="font-orbitron font-bold text-2xl text-white">99.98%</p>
            <p className="text-[10px] text-emerald-400 font-semibold mt-1">✓ High Fidelity Core</p>
          </div>
        </div>
      </section>

      {/* LOGIN MODAL (Screenshot 2) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#0e0f14] border border-[#ff2b43]/30 rounded-3xl p-8 text-center shadow-2xl shadow-black relative overflow-hidden">
            {/* Top Close Button */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
            >
              ✕
            </button>

            {/* Glowing Anime/Cyber Avatar (Screenshot 2) */}
            <div className="relative inline-flex items-center justify-center mx-auto mb-6">
              <div className="w-20 h-20 rounded-full p-1 border-2 border-[#ff2b43] shadow-lg shadow-[#ff2b43]/40 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border border-[#ff2b43] animate-ping opacity-25"></div>
                <img
                  src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80"
                  alt="DexterCorp Mascot"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>

            {/* Title */}
            <h2 className="font-orbitron font-bold text-2xl text-[#ff2b43] tracking-wide mb-2 text-glow-red">
              Welcome to DexterCorp
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed mb-6">
              Login to access your dashboard and manage your servers with premium tools.
            </p>

            {/* Red Discord Login Button (Screenshot 2) */}
            <button
              onClick={() => {
                setShowLoginModal(false);
                onLoginWithDiscord();
              }}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl bg-gradient-to-r from-[#ff2b43] to-[#dc182f] hover:from-[#ff4055] hover:to-[#ff2b43] text-white font-bold text-sm shadow-xl shadow-[#ff2b43]/40 transition-all transform hover:-translate-y-0.5 cursor-pointer mb-3"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              <span>Login with Discord</span>
            </button>

            {/* Terms text */}
            <p className="text-[10px] text-slate-500 leading-normal">
              By logging in, you agree to our{' '}
              <a href="#" className="text-slate-400 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-slate-400 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
