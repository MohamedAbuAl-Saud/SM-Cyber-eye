import React from 'react';
import { Language, translations } from '../translations';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  return (
    <footer className="w-full bg-white border-t border-slate-200/90 py-4 sm:py-5 mt-auto text-slate-700 transition-colors shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Developer Rights */}
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-start">
          <div className="flex items-center gap-2 text-slate-950 font-black tracking-wide">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span>© Mohamed Abu AlSaud (AlQeyadah AlZaeem SM) 2026</span>
          </div>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="text-slate-500 font-mono text-[11px] bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
            SM v1.0
          </span>
        </div>

        {/* Telegram Direct Channel & Contact */}
        <div className="flex items-center gap-2">
          <a
            id="footer-telegram-link"
            href="https://t.me/SM_MS_IP"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-indigo-50 text-slate-900 hover:text-indigo-700 font-bold border border-slate-200 hover:border-indigo-300 transition-all active:scale-95 group shadow-2xs"
          >
            <span className="font-mono text-xs text-slate-800 group-hover:text-indigo-700 dir-ltr font-black">
              @SM_MS_IP
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
};


