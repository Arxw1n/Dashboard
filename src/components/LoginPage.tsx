import { BOT_CONFIG } from '../config';
import React, { useState } from 'react';
import { Shield, ArrowRight, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile, token?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = () => {
  const [showRedirectGuide, setShowRedirectGuide] = useState(false);
  const CLIENT_ID = '1552995406860779611';

  const handleDiscordOAuth = () => {
    const oauthUrl = BOT_CONFIG.getOAuthUrl();
    window.location.href = oauthUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#07090e]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[128px] pointer-events-none"></div>

      <div className="w-full max-w-lg glass-panel p-8 sm:p-10 rounded-3xl border border-violet-500/30 shadow-2xl shadow-violet-950/60 relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 shadow-xl shadow-violet-600/30 mb-1">
            <Shield className="w-8 h-8 text-white" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 pulse-badge"></span>
          </div>

          <h1 className="text-3xl font-black text-white font-['Outfit'] tracking-tight">
            DEXTER<span className="gradient-text-purple">CORP</span>
          </h1>
          <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            Connect your Discord account to manage servers where you hold Administrator permissions.
          </p>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Discord Admin Detection</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Real-time Bot Sync</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Anti-Nuke Protection</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Hybrid Shard Core</span>
          </div>
        </div>

        {/* Official Discord OAuth Connect Button */}
        <div>
          <button
            onClick={handleDiscordOAuth}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#5865F2]/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <svg className="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
            <span>Connect with Discord</span>
            <ArrowRight className="w-5 h-5 ml-auto text-indigo-200" />
          </button>
        </div>

        {/* Current Redirect URI Display */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            Redirect URI: <code className="text-violet-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">{BOT_CONFIG.getRedirectUri()}</code>
          </p>
        </div>
      </div>
    </div>
  );
};