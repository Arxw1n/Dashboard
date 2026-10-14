import { BOT_CONFIG } from '../config';
import React from 'react';
import { X, ShieldCheck, Lock, ExternalLink, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOAuthLogin = () => {
    const discordOAuthUrl = BOT_CONFIG.getOAuthUrl();
    window.location.href = discordOAuthUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-['Outfit']">
      <div className="relative w-full max-w-sm bg-[#0e0f15] border border-[#ff2b43]/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-black overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-[#ff2b43]/15 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-[#5865F2]/15 rounded-full blur-[60px] pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mascot / Avatar with Glowing Rings */}
        <div className="relative inline-flex items-center justify-center mx-auto mb-5">
          <div className="w-20 h-20 rounded-full p-1 border-2 border-[#ff2b43] shadow-lg shadow-[#ff2b43]/40 flex items-center justify-center relative bg-[#090a0f]">
            <div className="absolute inset-0 rounded-full border border-[#ff2b43] animate-ping opacity-20"></div>
            <img
              src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80"
              alt="DexterCorp Mascot"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="font-orbitron font-bold text-xl sm:text-2xl text-white tracking-wide mb-2">
          AUTHENTICATE WITH DISCORD
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed mb-6 max-w-xs mx-auto">
          Sign in via official Discord OAuth2 to access your servers and configure security modules.
        </p>

        {/* Discord OAuth Action */}
        <div className="space-y-4">
          <button
            onClick={handleOAuthLogin}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-[#5865F2] hover:bg-[#4752c4] active:scale-98 text-white font-bold text-sm shadow-xl shadow-[#5865F2]/40 transition-all cursor-pointer group"
          >
            <svg className="w-5 h-5 fill-current shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
            <span>Continue with Discord</span>
          </button>

          {/* Security & Scope Guarantee */}
          <div className="pt-2 border-t border-white/5 space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Discord OAuth2 Protocol</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Only servers where you have Administrator or Manage Server permissions will be displayed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};