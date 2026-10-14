import { BOT_CONFIG } from '../config';
import React from 'react';
import { Shield, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="glass-panel border-t border-slate-800/80 mt-16 py-8 px-4 sm:px-8 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-violet-400" />
          <span className="font-semibold text-slate-300 font-['Outfit']">DEXTERCORP</span>
          <span>• Dedicated Discord Protection & Hybrid Cluster Engine</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://discord.gg/codexdev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-violet-400 transition-colors flex items-center gap-1"
          >
            Support Discord <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={BOT_CONFIG.getInviteUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            Invite DEXTERCORP <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
};