import { BOT_CONFIG } from '../config';
import React, { useState } from 'react';
import { Lock, Globe, CheckCircle2, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile, token?: string) => void;
  onDirectLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onDirectLogin }) => {
  const [authStatus, setAuthStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    text?: string;
  }>({ type: 'idle' });

  const handleDiscordOAuth = () => {
    setAuthStatus({ type: 'loading', text: 'Initializing Neural Auth Node...' });
    const oauthUrl = BOT_CONFIG.getOAuthUrl();
    window.location.href = oauthUrl;
  };

  const handleInstantDemoLogin = () => {
    const demoUser: UserProfile = {
      id: '1500056784000253973',
      username: 'DXTR AXIO',
      avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
      isLoggedIn: true,
      isOwner: true,
    };
    onLoginSuccess(demoUser, 'demo_token_authenticated');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#06070a] overflow-hidden selection:bg-white/20 selection:text-white">
      {/* Background ambient lighting & mesh */}
      <div className="absolute inset-0 bg-mesh pointer-events-none opacity-40"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-white/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-[128px] pointer-events-none"></div>

      {/* Obsidian Security Center Glass Card */}
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="liquid-glass rounded-3xl p-10 md:p-12 text-center relative z-10">
          {/* Top Edge Shimmer Accent Line */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full animate-shimmer" />

          {/* Bot Mascot / Avatar with Glowing Aura */}
          <div className="relative mx-auto mb-8">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-2xl opacity-60 animate-pulse-glow" />
              <div className="relative w-20 h-20 rounded-2xl border border-white/20 bg-[#12141c] overflow-hidden shadow-2xl flex items-center justify-center">
                <img
                  src="/astra-avatar.png"
                  alt="Dexter Corporation"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (!img.dataset.fallback) {
                      img.dataset.fallback = '1';
                      img.src = 'https://obsidiansecurity.in/assets/bot-logo-gif-CqVxt4Yt.gif';
                    }
                  }}
                />
                <Shield className="w-10 h-10 text-white/30 absolute inset-0 m-auto pointer-events-none -z-10" />
              </div>
            </div>
          </div>

          {/* Secure Access Portal Pill Badge */}
          <div className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-1.5 text-xs font-medium mb-5 text-slate-300">
            <Lock className="h-3.5 w-3.5 text-white" />
            <span>Secure Access Portal</span>
          </div>

          {/* Brand Heading */}
          <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight text-white">
            <span className="text-gradient">Dexter Corporation</span>
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-[0.3em] font-semibold mt-2">
            V3.0 Neural Core
          </p>

          {/* Action Button Section */}
          <div className="mt-9 space-y-4">
            {authStatus.type === 'loading' ? (
              <div className="py-6 flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <p className="text-sm font-semibold text-slate-300">{authStatus.text}</p>
              </div>
            ) : authStatus.type === 'error' ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{authStatus.text}</span>
              </div>
            ) : null}

            {/* Primary Obsidian Access Control Node Button */}
            <button
              onClick={handleDiscordOAuth}
              className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-200 text-black font-semibold text-sm shadow-xl shadow-white/10 hover:shadow-white/20 transition-all flex items-center justify-center gap-2.5 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Globe className="h-5 w-5 text-black" />
              <span>Access Control Node</span>
            </button>

            {/* Disclaimer text */}
            <p className="text-xs text-slate-400 leading-relaxed max-w-[280px] mx-auto">
              By authenticating, you establish a secure link with the{' '}
              <strong className="text-white">Dexter Corporation</strong> Neural Defense Network.
            </p>

            {/* Demo / Direct Access link */}
            {onDirectLogin && (
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                <span>Instant Developer Access:</span>
                <button
                  type="button"
                  onClick={onDirectLogin}
                  className="text-slate-300 hover:text-white underline cursor-pointer font-medium"
                >
                  Direct Login &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};