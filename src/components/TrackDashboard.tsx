import React, { useState, useEffect } from 'react';
import {
  Link2,
  RefreshCw,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  MapPin,
  Crosshair,
  Radio,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Search,
  Battery,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  Smartphone,
  Wifi,
  FileDown,
  FileText,
} from 'lucide-react';
import { Language, translations } from '../translations';
import { TrackingLink, VisitRecord } from '../types';
import { BrowserIcon } from './BrowserIcon';
import { DeviceIcon } from './DeviceIcon';
import { VisitDetailModal } from './VisitDetailModal';
import { AnalyticsCharts } from './dashboard/AnalyticsCharts';

interface TrackDashboardProps {
  link: TrackingLink;
  visits: VisitRecord[];
  lang: Language;
  onRefresh: () => void;
  isRefreshing: boolean;
  onDelete: (code: string) => Promise<void>;
  onGoHome: () => void;
}

export const TrackDashboard: React.FC<TrackDashboardProps> = ({
  link,
  visits,
  lang,
  onRefresh,
  isRefreshing,
  onDelete,
  onGoHome,
}) => {
  const t = translations[lang];
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<VisitRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const directTrackingUrl = `${origin}/p/${link.code}.html`;

  // clck.ru Short Link State
  const [clckShortUrl, setClckShortUrl] = useState<string>('');
  const [isShorteningClck, setIsShorteningClck] = useState(true);

  const fetchClckUrl = async () => {
    setIsShorteningClck(true);
    try {
      const res = await fetch(`/api/shorten/clck?url=${encodeURIComponent(directTrackingUrl)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.shortUrl) {
          setClckShortUrl(data.shortUrl);
          return;
        }
      }
      setClckShortUrl(`https://clck.ru/--?url=${encodeURIComponent(directTrackingUrl)}`);
    } catch (err) {
      console.warn('Failed to shorten with clck.ru:', err);
      setClckShortUrl(`https://clck.ru/--?url=${encodeURIComponent(directTrackingUrl)}`);
    } finally {
      setIsShorteningClck(false);
    }
  };

  useEffect(() => {
    fetchClckUrl();
  }, [link.code, directTrackingUrl]);

  // Clean clck.ru host & path for username-style URL masking
  const activeClckUrl = clckShortUrl || `https://clck.ru/--?url=${encodeURIComponent(directTrackingUrl)}`;
  const clckRaw = activeClckUrl.replace(/^https?:\/\//, '');

  const disguisedTemplates = [
    {
      label: 'Facebook',
      prefix: 'https://facebook.com-login@',
      url: `https://facebook.com-login@${clckRaw}`,
    },
    {
      label: 'Instagram',
      prefix: 'https://instagram.com-feed@',
      url: `https://instagram.com-feed@${clckRaw}`,
    },
    {
      label: 'YouTube',
      prefix: 'https://youtube.com-watch@',
      url: `https://youtube.com-watch@${clckRaw}`,
    },
    {
      label: 'Google Drive',
      prefix: 'https://drive.google.com-share@',
      url: `https://drive.google.com-share@${clckRaw}`,
    },
    {
      label: 'Google Redirect',
      prefix: 'https://google.com/url?q=',
      url: `https://www.google.com/url?q=${encodeURIComponent(activeClckUrl)}`,
    },
    {
      label: 'Telegram',
      prefix: 'https://t.me-channel@',
      url: `https://t.me-channel@${clckRaw}`,
    },
    {
      label: 'TikTok',
      prefix: 'https://tiktok.com-video@',
      url: `https://tiktok.com-video@${clckRaw}`,
    },
    {
      label: 'Snapchat',
      prefix: 'https://snapchat.com-add@',
      url: `https://snapchat.com-add@${clckRaw}`,
    },
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(link.code);
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  const filteredVisits = visits.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.ip.toLowerCase().includes(q) ||
      (v.country && v.country.toLowerCase().includes(q)) ||
      (v.city && v.city.toLowerCase().includes(q)) ||
      (v.device && v.device.toLowerCase().includes(q)) ||
      (v.browser && v.browser.toLowerCase().includes(q)) ||
      (v.gpu && v.gpu.toLowerCase().includes(q)) ||
      (v.isp && v.isp.toLowerCase().includes(q))
    );
  });

  const totalCount = visits.length || 1;
  const gpsCount = visits.filter((v) => v.isGps).length;
  const vpnCount = visits.filter((v) => v.isProxyVpn).length;
  const mobileSimCount = visits.filter(
    (v) => v.networkMedium === 'mobile_sim' || v.isMobileCarrier
  ).length;

  const osStats = visits.reduce((acc, v) => {
    const os = v.os || 'Unknown';
    acc[os] = (acc[os] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-5 flex flex-col gap-3.5">
      {/* Header Bar with Back and Mode Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={onGoHome}
            className="p-1.5 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-2xs"
          >
            {lang === 'ar' ? (
              <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
            ) : (
              <ArrowLeft className="w-3.5 h-3.5 text-indigo-600" />
            )}
            <span>{t.navHome}</span>
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-1.5">
              <span>{lang === 'ar' ? 'لوحة تتبع الرابط' : 'Tracking Dashboard'}</span>
              <span className="font-mono text-indigo-600 text-sm">/{link.code}</span>
            </h1>
            <span className="text-[10px] text-slate-500 font-medium">
              {lang === 'ar' ? 'تم الإنشاء:' : 'Created:'}{' '}
              {new Date(link.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
            </span>
          </div>
        </div>

            {/* Tracking Mode Pill */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              link.mode === 'precise'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : link.mode === 'pdf'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}
          >
            {link.mode === 'precise' ? (
              <>
                <Crosshair className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t.preciseTrackingBadge}</span>
              </>
            ) : link.mode === 'pdf' ? (
              <>
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.pdfTrackingBadge}</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-slate-600" />
                <span>{t.nearTrackingBadge}</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Bento Grid Row 1: Direct Link & Telemetry Status */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Primary Direct Link Card (Span 8) */}
        {link.mode !== 'pdf' ? (
          <div className="col-span-12 md:col-span-8 bg-white/85 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs p-3.5 sm:p-4 flex flex-col justify-between gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-950">
                {t.directLinkTitle}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-950 truncate select-all font-bold">
                  {activeClckUrl}
                </div>

                <button
                  onClick={() => handleCopy(activeClckUrl, 'direct')}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  title={t.copyLink}
                >
                  {copiedKey === 'direct' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'direct' ? t.copied : t.copyLink}</span>
                </button>

                <a
                  href={activeClckUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors shrink-0"
                  title="Test open in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                </a>
              </div>
            </div>

            {/* Original Target URL */}
            <div className="flex flex-col gap-0.5 text-xs pt-1.5 border-t border-slate-100">
              <span className="text-slate-500 font-semibold text-[10px]">{t.originalUrlTitle}:</span>
              <a
                href={link.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline font-mono truncate max-w-2xl inline-flex items-center gap-1 font-medium text-xs"
              >
                <span>{link.originalUrl}</span>
                <ExternalLink className="w-3 h-3 shrink-0 text-indigo-500" />
              </a>
            </div>
          </div>
        ) : (
          <div className="col-span-12 md:col-span-8 bg-indigo-50 rounded-3xl border border-indigo-200 shadow-xl p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/10 transition-all"></div>
            
            <div className="flex flex-col gap-3 relative z-10 text-center sm:text-start ps-0 sm:ps-6">
              <div className="flex items-center justify-center sm:justify-start gap-4">
                <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-black text-slate-950 tracking-tight">{lang === 'ar' ? 'ملف التتبع النشط' : 'Active Tracking File'}</h3>
                  <span className="text-xs font-mono text-indigo-600 font-bold uppercase tracking-widest">{link.code}.pdf</span>
                </div>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed max-w-sm font-medium">
                {lang === 'ar' 
                  ? 'هذا الملف يحتوي على كود صامت (Canary Token) يجمع البيانات فور فتحه. لا تقم بتغيير محتوى الملف.' 
                  : 'This file contains a silent Canary Token that collects telemetry upon opening. Do not modify the file content.'}
              </p>
            </div>

            <a
              href={`/api/pdf/generate/${link.code}`}
              download={`tracking_report_${link.code}.pdf`}
              onClick={async (e) => {
                // If direct link click behaves normally in browser
                try {
                  const url = `/api/pdf/generate/${link.code}`;
                  const res = await fetch(url);
                  if (res.ok) {
                    const blob = await res.blob();
                    const downloadUrl = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = downloadUrl;
                    a.download = `tracking_report_${link.code}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(downloadUrl);
                    }, 500);
                    e.preventDefault();
                  }
                } catch {
                  // Fallback: let standard browser anchor navigation execute
                }
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 text-sm font-black flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-95 group shrink-0 relative z-10 text-decoration-none"
            >
              <FileDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              <span>{t.pdfDownloadBtn}</span>
            </a>
          </div>
        )}

        {/* Live Telemetry Stats Tile (Span 4) */}
        <div className="col-span-12 md:col-span-4 bg-white/85 backdrop-blur-md border border-slate-200 rounded-2xl p-3.5 sm:p-4 text-slate-900 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
              {lang === 'ar' ? 'إحصاءات الرابط' : 'Link Telemetry'}
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>

          <div className="my-1">
            <span className="text-2xl font-black text-slate-950 font-mono">{visits.length}</span>
            <span className="text-[11px] text-slate-600 block">{t.visitsCount}</span>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs">
            <span className="text-slate-600 font-mono text-[10px]">
              MODE: {link.mode.toUpperCase()}
            </span>
            <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> 100% Active
            </span>
          </div>
        </div>
      </div>

      {/* Bento Row 2: clck.ru Shortening & Camouflage Service Card */}
      {link.mode !== 'pdf' && (
        <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs p-3.5 sm:p-4 flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-black text-[10px]">
                clck
              </span>
              <h3 className="text-xs font-black text-slate-950">{t.shortenServicesTitle}</h3>
            </div>

            <button
              onClick={fetchClckUrl}
              disabled={isShorteningClck}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isShorteningClck ? 'animate-spin' : ''}`} />
              <span>{isShorteningClck ? t.generatingClck : t.generateClckBtn}</span>
            </button>
          </div>

          {/* clck.ru Short Link Display */}
          <div className="flex items-center gap-2">
            <div className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-indigo-950 font-bold truncate select-all flex items-center justify-between gap-2">
              <span className="truncate">{activeClckUrl}</span>
              {isShorteningClck ? (
                <span className="text-[10px] font-sans font-medium text-amber-600 shrink-0 flex items-center gap-1">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  {lang === 'ar' ? 'جاري الاختصار...' : 'Shortening...'}
                </span>
              ) : clckShortUrl && !clckShortUrl.includes('/--?url=') ? (
                <span className="text-[10px] font-sans font-bold text-emerald-600 shrink-0 flex items-center gap-0.5">
                  <Check className="w-3 h-3" />
                  {lang === 'ar' ? 'مختصر جاهز' : 'Shortened'}
                </span>
              ) : null}
            </div>

            <button
              onClick={() => handleCopy(activeClckUrl, 'clck')}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              {copiedKey === 'clck' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedKey === 'clck' ? t.copied : t.copyLink}</span>
            </button>

            <a
              href={activeClckUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
            </a>
          </div>

          {/* Camouflage URL masks */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-950">{t.disguisePresets}</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-mono">
              {disguisedTemplates.map((mask, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCopy(mask.url, `mask-${idx}`)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 transition-all flex items-center justify-between gap-1.5 cursor-pointer text-slate-800 text-start group"
                  title={mask.url}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] font-bold text-slate-500 group-hover:text-indigo-700">
                      {mask.label}
                    </span>
                    <span className="text-[10px] truncate font-mono text-slate-950">
                      {mask.prefix}...
                    </span>
                  </div>
                  {copiedKey === `mask-${idx}` ? (
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400 shrink-0 group-hover:text-indigo-700" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed">{t.shortenNotice}</p>
        </div>
      )}

      {/* Bento Row 3: Control Actions & Refresh Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/85 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <button
          id="btn-refresh-visits"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{t.refreshBtn}</span>
        </button>

        <button
          id="btn-delete-link"
          onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all cursor-pointer"
        >
          <Trash2 className="w-3 h-3 text-red-600" />
          <span>{link.mode === 'pdf' ? t.deleteFile : t.deleteLink}</span>
        </button>
      </div>
      <p className="text-[10px] text-slate-500 -mt-2 ps-1">{link.mode === 'pdf' ? t.deleteFileExplanation : t.deleteExplanation}</p>

      {/* Bento Row 4: Interactive Telemetry & Analytics Chart Card */}
      {visits.length > 0 && (
        <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs p-3.5 sm:p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
              <h3 className="text-xs sm:text-sm font-black text-slate-950">
                {lang === 'ar' ? 'الرسوم البيانية والمؤشرات الإحصائية للزيارات' : 'Visual Traffic Analytics & Telemetry Spectrum'}
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500">
              SM-ANALYTICS v3.2
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Chart 1: GPS Precision Ratio */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600 uppercase">
                  {lang === 'ar' ? 'دقة الموقع (GPS)' : 'Location Mode'}
                </span>
                <Crosshair className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-lg font-black text-slate-950 font-mono">
                    {Math.round((gpsCount / totalCount) * 100)}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {gpsCount} / {totalCount} {lang === 'ar' ? 'GPS دقيق' : 'GPS'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-rose-500 h-full transition-all duration-500"
                    style={{ width: `${(gpsCount / totalCount) * 100}%` }}
                  ></div>
                  <div
                    className="bg-indigo-400 h-full transition-all duration-500"
                    style={{ width: `${((totalCount - gpsCount) / totalCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Chart 2: Connection Medium (SIM vs Router) */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600 uppercase">
                  {lang === 'ar' ? 'نوع الاتصال والشبكة' : 'Network Spectrum'}
                </span>
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-lg font-black text-slate-950 font-mono">
                    {Math.round((mobileSimCount / totalCount) * 100)}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {mobileSimCount} {lang === 'ar' ? 'بيانات شريحة' : 'SIM'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-500"
                    style={{ width: `${(mobileSimCount / totalCount) * 100}%` }}
                  ></div>
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${((totalCount - mobileSimCount) / totalCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Chart 3: VPN Risk & Proxy Audit */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600 uppercase">
                  {lang === 'ar' ? 'فحص VPN والتمويه' : 'Proxy / VPN Ratio'}
                </span>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-lg font-black text-slate-950 font-mono">
                    {Math.round((vpnCount / totalCount) * 100)}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {vpnCount} {lang === 'ar' ? 'اتصال مموه' : 'Proxied'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-amber-500 h-full transition-all duration-500"
                    style={{ width: `${(vpnCount / totalCount) * 100}%` }}
                  ></div>
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${((totalCount - vpnCount) / totalCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Chart 4: OS Breakdown Top Bar */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600 uppercase">
                  {lang === 'ar' ? 'أنظمة التشغيل' : 'OS Breakdown'}
                </span>
                <Layers className="w-3.5 h-3.5 text-slate-700" />
              </div>
              <div className="flex flex-col gap-1">
                {Object.entries(osStats)
                  .slice(0, 2)
                  .map(([osName, count]) => {
                    const c = Number(count) || 0;
                    const pct = Math.round((c / totalCount) * 100);
                    return (
                      <div key={osName} className="flex flex-col gap-0.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-800">
                          <span>{osName}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-slate-900 h-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Charts */}
      {visits.length > 0 && <AnalyticsCharts visits={visits} />}

      {/* Bento Row 5: Visits Stream & Table Card */}
      <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs p-3.5 sm:p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-black text-slate-950">{t.visitsTableTitle}</h2>
            <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
              {visits.length}
            </span>
          </div>

          {visits.length > 0 && (
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute inset-y-0 start-3 my-auto pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === 'ar'
                    ? 'بحث في الزيارات (IP، الدولة، المعالج)...'
                    : 'Search visits (IP, Country, GPU)...'
                }
                className="w-full ps-8 pe-3 py-1.5 text-xs bg-slate-50 text-slate-950 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
              />
            </div>
          )}
        </div>

        {visits.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center p-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mb-2">
              <Radio className="w-4 h-4 animate-pulse text-indigo-600" />
            </div>
            <p className="text-xs font-bold text-slate-950 mb-0.5">{t.noVisitsYet}</p>
            <p className="text-[11px] text-slate-500 max-w-md">
              {lang === 'ar'
                ? 'عند فتح الرابط الداخلي في نافذة خاصة أو جهاز آخر، ستظهر بيانات الزائر التقنية هنا فوراً بعد التحديث.'
                : 'Open the tracking link in another tab or device to see live telemetry here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-950 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2 px-3 text-start">{t.colIp}</th>
                  <th className="py-2 px-3 text-start">{t.colCountry}</th>
                  <th className="py-2 px-3 text-start">{t.colCity}</th>
                  <th className="py-2 px-3 text-start">{t.colDevice}</th>
                  <th className="py-2 px-3 text-start">{t.colBrowser}</th>
                  <th className="py-2 px-3 text-start">{t.colBattery}</th>
                  <th className="py-2 px-3 text-start">{t.colTime}</th>
                  <th className="py-2 px-3 text-center">{t.colDetails}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="py-2 px-3 font-mono font-bold text-slate-950 text-xs">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{v.ip}</span>
                          {v.isGps ? (
                            <span
                              className="px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 text-[9px] font-black tracking-tight"
                              title="GPS Precise Position"
                            >
                              GPS
                            </span>
                          ) : (
                            <span
                              className="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700 text-[9px] font-semibold"
                              title="IP Geolocation"
                            >
                              IP
                            </span>
                          )}

                          {v.isProxyVpn ? (
                            <span
                              className="px-1.5 py-0.2 rounded-md bg-amber-500 text-white text-[9px] font-black flex items-center gap-0.5 shadow-2xs"
                              title={`VPN / Proxy Active: ${v.vpnProviderName || 'Detected'}`}
                            >
                              <ShieldAlert className="w-2.5 h-2.5" />
                              {v.vpnProviderName && v.vpnProviderName.toLowerCase().includes('tor') ? 'TOR' : 'VPN'}
                            </span>
                          ) : v.timezoneMismatch ? (
                            <span
                              className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[9px] font-black flex items-center gap-0.5"
                              title="Timezone mismatch / VPN suspected"
                            >
                              <ShieldAlert className="w-2.5 h-2.5" />
                              VPN?
                            </span>
                          ) : null}

                          {v.networkMedium === 'mobile_sim' || v.isMobileCarrier ? (
                            <span
                              className="px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-700 text-[9px] font-black flex items-center gap-0.5"
                              title={lang === 'ar' ? 'هاتف شريحة (بيانات خلوية)' : 'Mobile SIM'}
                            >
                              <Smartphone className="w-2.5 h-2.5" />
                              {lang === 'ar' ? 'شريحة' : 'SIM'}
                            </span>
                          ) : (
                            <span
                              className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-black flex items-center gap-0.5"
                              title={lang === 'ar' ? 'راوتر منزلي / واي فاي' : 'Router / Wi-Fi'}
                            >
                              <Wifi className="w-2.5 h-2.5" />
                              {lang === 'ar' ? 'راوتر' : 'Router'}
                            </span>
                          )}
                        </div>

                        {v.deviceFingerprint && (
                          <span className="text-[9px] font-mono text-indigo-700 font-bold">
                            {v.deviceFingerprint}
                          </span>
                        )}

                        {v.isGps && v.lat && v.lon && (
                          <span className="text-[10px] text-rose-600 font-mono font-bold">
                            {v.lat.toFixed(4)}, {v.lon.toFixed(4)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-950 text-xs">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-950">{v.country || '-'}</span>
                        {v.isp && (
                          <span className="text-[10px] text-indigo-700 font-bold whitespace-normal break-words max-w-[220px]" title={v.isp}>
                            {v.isp}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-800 text-xs">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-950">{v.city || '-'}</span>
                        {v.exactAddress && (
                          <span className="text-[10px] text-slate-500 whitespace-normal break-words max-w-[220px]" title={v.exactAddress}>
                            {v.exactAddress}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <DeviceIcon device={v.uaModel || v.device} os={v.os} />
                    </td>
                    <td className="py-2 px-3">
                      <BrowserIcon browser={v.uaFullVersion ? `${v.browser} ${v.uaFullVersion}` : v.browser} />
                    </td>
                    <td className="py-2 px-3">
                      {v.battery != null ? (
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 text-xs">
                          <Battery className="w-3 h-3" />
                          <span>{v.battery}%</span>
                          {v.batteryCharging && <span className="text-amber-500 text-[10px]">⚡</span>}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[10px] font-mono">
                      {v.localTime || new Date(v.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedVisit(v)}
                          className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          {t.viewDetails}
                        </button>
                        {v.lat && v.lon && (
                          <>
                            <a
                              href={`https://www.google.com/maps?q=${v.lat},${v.lon}&z=17`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                              title="Google Maps"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`https://earth.google.com/web/search/${v.lat},${v.lon}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                              title="Google Earth 3D"
                            >
                              <Globe className="w-3.5 h-3.5" />
                            </a>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-4 sm:p-5 max-w-md w-full flex flex-col gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5 text-red-600">
              <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-950">{link.mode === 'pdf' ? t.deleteFile : t.deleteLink}</h3>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">{link.mode === 'pdf' ? t.deleteFileConfirm : t.deleteLinkConfirm}</p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {t.close}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (lang === 'ar' ? 'جاري الحذف...' : 'Deleting...') : (link.mode === 'pdf' ? t.deleteFile : t.deleteLink)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visit Detail Inspector Modal */}
      {selectedVisit && (
        <VisitDetailModal
          visit={selectedVisit}
          onClose={() => setSelectedVisit(null)}
          lang={lang}
        />
      )}
    </div>
  );
};
