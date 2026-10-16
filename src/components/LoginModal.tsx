import { BOT_CONFIG } from '../config';
import React from 'react';
import { X, Lock, Globe, Shield, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  const handleOAuthLogin = () => {
    const discordOAuthUrl = BOT_CONFIG.getOAuthUrl();
    window.location.href = discordOAuthUrl;
  };

  const handleDirectAccess = () => {
    if (onLogin) {
      onLogin({
        id: '1500056784000253973',
        username: 'DXTR AXIO',
        avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
        isLoggedIn: true,
        isOwner: true,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md liquid-glass rounded-3xl p-8 sm:p-10 text-center shadow-2xl overflow-hidden border border-white/10">
        {/* Top Shimmer Line */}
        <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full animate-shimmer" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mascot / Avatar with Glowing Aura */}
        <div className="relative mx-auto mb-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl opacity-60 animate-pulse-glow" />
            <div className="relative w-16 h-16 rounded-2xl border border-white/20 bg-[#12141c] overflow-hidden shadow-2xl flex items-center justify-center">
              <img
                src="https://cdn.discordapp.com/attachments/1349027457531904072/1351659687168586391/giphy.gif"
                alt="DexterCorp"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <Shield className="w-8 h-8 text-white absolute inset-0 m-auto pointer-events-none -z-10" />
            </div>
          </div>
        </div>

        {/* Secure Access Portal Pill Badge */}
        <div className="inline-flex items-center gap-2 liquid-glass rounded-full px-3.5 py-1 text-[11px] font-medium mb-4 text-slate-300">
          <Lock className="h-3 w-3 text-white" />
          <span>Secure Access Portal</span>
        </div>

        {/* Title */}
        <h2 className="font-display font-bold text-2xl text-white tracking-tight mb-1">
          <span className="text-gradient">Dexter Corporation</span>
        </h2>
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.25em] font-semibold mb-6">
          V3.0 Neural Core
        </p>

        {/* Access Control Node Button */}
        <div className="space-y-4">
          <button
            onClick={handleOAuthLogin}
            className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-200 text-black font-semibold text-sm shadow-xl shadow-white/10 transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Globe className="h-5 w-5 text-black" />
            <span>Access Control Node</span>
          </button>

          <p className="text-[11px] text-slate-400 leading-relaxed max-w-[260px] mx-auto">
            By authenticating, you establish a secure link with the{' '}
            <strong className="text-white">Dexter Corporation</strong> Neural Defense Network.
          </p>

          {/* Quick Direct Access */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Developer Mode:</span>
            <button
              type="button"
              onClick={handleDirectAccess}
              className="text-slate-300 hover:text-white underline cursor-pointer font-medium"
            >
              Direct Login &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};