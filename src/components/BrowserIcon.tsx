import React from 'react';
import { Globe } from 'lucide-react';

interface BrowserIconProps {
  browser: string;
  className?: string;
  showName?: boolean;
}

export const BrowserIcon: React.FC<BrowserIconProps> = ({
  browser,
  className = 'w-4 h-4',
  showName = true,
}) => {
  const b = (browser || '').toLowerCase();

  // Chrome
  if (b.includes('chrome')) {
    return (
      <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
        <svg className={`${className} shrink-0`} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="21" fill="#EA4335" />
          <path d="M24 24L38.7 15.5C35.2 9.5 28.8 6 24 6c-7.3 0-13.6 4.3-16.5 10.5L16.2 30.5L24 24z" fill="#EA4335" />
          <path d="M24 24l-7.8 6.5C14.7 34 19 42 24 42c6.2 0 11.6-3.2 14.7-8.1L27.5 22 24 24z" fill="#34A853" />
          <path d="M24 24L38.7 15.5C40.8 19.1 42 23.3 42 28c0 2.1-.3 4.1-.8 6L27.5 22 24 24z" fill="#FBBC05" />
          <circle cx="24" cy="24" r="10" fill="#FFFFFF" />
          <circle cx="24" cy="24" r="8" fill="#1A73E8" />
        </svg>
        {showName && <span>Chrome</span>}
      </span>
    );
  }

  // Safari
  if (b.includes('safari')) {
    return (
      <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
        <svg className={`${className} shrink-0`} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="21" fill="#006CFF" />
          <circle cx="24" cy="24" r="20" stroke="#FFFFFF" strokeWidth="1.5" />
          {/* Compass Ticks */}
          <circle cx="24" cy="24" r="18" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="1 3" />
          {/* Compass Needle */}
          <polygon points="24,9 29,24 24,27 19,24" fill="#FF3B30" />
          <polygon points="24,39 29,24 24,27 19,24" fill="#FFFFFF" />
          <circle cx="24" cy="24" r="2" fill="#003D99" />
        </svg>
        {showName && <span>Safari</span>}
      </span>
    );
  }

  // Edge
  if (b.includes('edg')) {
    return (
      <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
        <svg className={`${className} shrink-0`} viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="edgeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0c80df" />
              <stop offset="100%" stopColor="#00d8b4" />
            </linearGradient>
            <linearGradient id="edgeGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0055aa" />
              <stop offset="100%" stopColor="#2bd67b" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="24" r="21" fill="url(#edgeGrad1)" />
          <path d="M24 10c7.7 0 14 6.3 14 14 0 5-2.6 9.4-6.6 11.9-2.5-3-3.9-6.8-3.9-10.9 0-4.4 2-8.3 5.1-10.9C30.2 11.6 27.2 10 24 10z" fill="#ffffff" opacity="0.9" />
          <circle cx="20" cy="28" r="9" fill="url(#edgeGrad2)" />
        </svg>
        {showName && <span>Edge</span>}
      </span>
    );
  }

  // Firefox
  if (b.includes('firefox')) {
    return (
      <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
        <svg className={`${className} shrink-0`} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="21" fill="#7C2D12" />
          <circle cx="24" cy="24" r="16" fill="#3B82F6" />
          <path d="M38 16c-3-5-9-8-16-7 4 2 7 6 7 10 0 2-.5 4-1.5 5.5-2-4.5-6-7.5-11-7.5-3 0-5.5 1-7.5 2.5C7 22 8 26 10 29c4 6 10 9 17 8 8 0 15-6 16-14 .5-2.3.2-4.7-.5-7z" fill="#FF7A00" />
          <path d="M35 19c-2-3-6-5-10-4 3 1 5 4 5 7 0 2-.5 3.5-1.5 4.5-1-3-4-5-8-5-2 0-3.5.5-5 1.5 1 2 2 4 4 6 3 4 7 6 12 5 6 0 10-4 11-10 .5-1.5.2-3.3-.5-5z" fill="#FFDC00" />
        </svg>
        {showName && <span>Firefox</span>}
      </span>
    );
  }

  // Opera
  if (b.includes('opera') || b.includes('opr')) {
    return (
      <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
        <svg className={`${className} shrink-0`} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="21" fill="#FF1B2D" />
          <ellipse cx="24" cy="24" rx="10" ry="15" fill="#FFFFFF" />
          <ellipse cx="24" cy="24" rx="6" ry="11" fill="#FF1B2D" />
        </svg>
        {showName && <span>Opera</span>}
      </span>
    );
  }

  // Samsung Browser
  if (b.includes('samsung')) {
    return (
      <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
        <svg className={`${className} shrink-0`} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="21" fill="#1C1844" />
          <circle cx="24" cy="24" r="10" fill="#4B3DF6" />
          <ellipse cx="24" cy="24" rx="18" ry="7" stroke="#9080FC" strokeWidth="2.5" transform="rotate(-30 24 24)" />
        </svg>
        {showName && <span>Samsung</span>}
      </span>
    );
  }

  // Brave
  if (b.includes('brave')) {
    return (
      <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
        <svg className={`${className} shrink-0`} viewBox="0 0 48 48" fill="none">
          <path d="M24 4L9 9v12c0 11 6.5 20.5 15 23 8.5-2.5 15-12 15-23V9L24 4z" fill="#FB542B" />
          <path d="M24 11l-8 3v7c0 6.5 3.5 12 8 13.8 4.5-1.8 8-7.3 8-13.8v-7l-8-3z" fill="#FFFFFF" />
          <polygon points="24,16 28,24 20,24" fill="#FB542B" />
        </svg>
        {showName && <span>Brave</span>}
      </span>
    );
  }

  // Generic Browser Fallback
  return (
    <span className="inline-flex items-center gap-1.5 font-bold text-slate-700">
      <div className={`${className} rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 shrink-0`}>
        <Globe className="w-3 h-3" />
      </div>
      {showName && <span>{browser || 'Browser'}</span>}
    </span>
  );
};

