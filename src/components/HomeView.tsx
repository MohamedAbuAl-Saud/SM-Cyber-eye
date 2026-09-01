import React, { useState } from 'react';
import {
  Link2,
  Crosshair,
  Radio,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Zap,
  Info,
  Clock,
  Eye,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Activity,
  Globe,
  Cpu,
  BookOpen,
  FileText,
  Search,
  Plus,
  Lock,
  Server,
  AlertTriangle,
  Flame,
  Key,
  ShieldAlert,
  Smartphone,
  Users,
  Compass,
  CheckCircle2,
  Terminal,
  HelpCircle,
  Camera
} from 'lucide-react';
import { Language, translations } from '../translations';
import { TrackingLink, TrackingMode, MainNavView } from '../types';

interface HomeViewProps {
  lang: Language;
  onCreateLink: (url: string, mode: TrackingMode) => Promise<void>;
  isCreating: boolean;
  savedLinks: TrackingLink[];
  onSelectLink: (code: string) => void;
  onNavigateIpLookup?: () => void;
  onViewChange: (view: MainNavView) => void;
  globalVisits?: number;
  globalLinks?: number;
}

export const HomeView: React.FC<HomeViewProps> = ({
  lang,
  onCreateLink,
  isCreating,
  savedLinks,
  onSelectLink,
  onNavigateIpLookup,
  onViewChange,
  globalVisits = 800,
  globalLinks = 1500,
}) => {
  const t = translations[lang];
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const isLimitReached = savedLinks.length >= 5;
  const hasPdfLink = savedLinks.some(l => l.mode === 'pdf');

  const handleCreate = async (mode: TrackingMode) => {
    if (isLimitReached) {
      setError(lang === 'ar' ? 'لقد وصلت للحد الأقصى (5 روابط). يرجى حذف رابط من الأسفل لإنشاء جديد.' : 'Limit reached (5 links). Please delete a link below.');
      return;
    }
    if (mode === 'pdf' && savedLinks.filter(l => l.mode === 'pdf').length >= 1) {
      setError(lang === 'ar' ? 'يمكنك إنشاء ملف PDF واحد فقط.' : 'You can only create 1 PDF link.');
      return;
    }
    const trimmed = url.trim();
    if (!trimmed) {
      setError(
        lang === 'ar'
          ? 'يرجى كتابة أو لصق الرابط المراد تلغيمه والتوجيه إليه أولاً، ثم الضغط على الخدمة المطلوبة.'
          : 'Please enter or paste the target destination URL first before selecting a service.'
      );
      return;
    }

    try {
      await onCreateLink(trimmed, mode);
    } catch (err: any) {
      setError(err?.message || 'Error creating link');
    }
  };

  const popularPresets = [
    { label: 'YouTube Video', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ' },
    { label: 'Google Search', url: 'https://google.com' },
    { label: 'Facebook Feed', url: 'https://facebook.com' },
    { label: 'Instagram Profile', url: 'https://instagram.com' },
  ];

  // Comprehensive sections guide data
  const sectionsGuide = [
    {
      id: 'sec-gps',
      title: lang === 'ar' ? '1. نظام تتبع الروابط الدقيق (GPS + Sensors)' : '1. High-Precision GPS Telemetry',
      badge: 'GPS',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: <Crosshair className="w-5 h-5 text-indigo-600" />,
      desc: lang === 'ar'
        ? 'يقوم هذا القسم بتوليد روابط ذكية تطلب إذن الموقع الجغرافي عالي الدقة (High Accuracy GPS) للحصول على خطوط الطول والعرض بدقة تصل إلى الأمتار، مع رسم نقطة الهدف على الخريطة التفاعلية، وقياس الارتفاع، السرعة، نسبة شحن البطارية، بصمة المعالج الرسومي (GPU/Canvas)، وتوجيه الزائر مباشرة إلى الرابط الأصلي بعد 3 ثوانٍ.'
        : 'Generates high-accuracy GPS tracking links requesting device satellite positioning with meter-level precision, interactive satellite mapping, speed, altitude, battery state, GPU WebGL fingerprinting, and automatic seamless redirect after 3 seconds.',
      features: lang === 'ar'
        ? ['إحداثيات GPS حقيقية بدقة متناهية', 'خريطة تفاعلية مدعومة بـ Google Maps و Google Earth', 'قياسات الشحن والبطارية وحالة الجهاز', 'تبصيم عتادي كامل Super Fingerprinting']
        : ['Pinpoint GPS satellite coordinates', 'Interactive map with Google Maps & Earth', 'Battery, power & device telemetry', 'Super Hardware Fingerprinting & Canvas Hash'],
      actionLabel: lang === 'ar' ? 'فتح تتبع الروابط (GPS)' : 'Open GPS Tracking',
      actionView: null,
      modeSelect: 'precise' as TrackingMode,
    },
    {
      id: 'sec-ip-near',
      title: lang === 'ar' ? '2. نظام التتبع الصامت القريب (Silent IP Tracker)' : '2. Silent Near IP Tracking',
      badge: 'IP Silent',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <Radio className="w-5 h-5 text-emerald-600" />,
      desc: lang === 'ar'
        ? 'تتبع فوري وصامت تماماً يتم دون طلب أي أذونات من المستخدم. يقوم النظام برصد عنوان الـ IP الحقيقي، اسم الدولة، المدينة، مزود خدمة الإنترنت (ISP)، رقم الـ ASN، نوع الشبكة (شريحة اتصال 4G/5G أو Wi-Fi منزلي)، وكشف استخدام برامج تغيير الـ IP مع شاشة صامتة سوداء لمدة 3 ثوانٍ ثم التحويل الفوري.'
        : 'Completely silent and immediate tracking without requiring any permissions. Captures client IP, country, city, ISP carrier, ASN routing, connection medium (Mobile Data vs Wi-Fi), and proxy detection with a 3-second black screen before redirection.',
      features: lang === 'ar'
        ? ['تتبع صامت بدون أي نوافذ إذن', 'تحديد الدولة، المدينة، ومزود الإنترنت', 'كشف نوع الخط (Wi-Fi أو Mobile 4G/5G)', 'تحويل تلقائي سلس خلال 3 ثوانٍ']
        : ['100% silent tracking with zero prompts', 'Resolve Country, City, & ISP carrier', 'Network medium classification (Wi-Fi/Cellular)', 'Instant auto-redirect within 3 seconds'],
      actionLabel: lang === 'ar' ? 'فتح التتبع الصامت (IP)' : 'Open Silent IP Tracking',
      actionView: null,
      modeSelect: 'near' as TrackingMode,
    },
    {
      id: 'sec-pdf',
      title: lang === 'ar' ? '3. تتبع مستندات الـ PDF الذكية (Canary PDF)' : '3. Canary PDF Document Tracker',
      badge: 'PDF',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: <FileText className="w-5 h-5 text-amber-600" />,
      desc: lang === 'ar'
        ? 'يتيح لك إنشاء وتحميل ملف وثيقة PDF ذكية تحتوي على رموز تتبع استخبارية (Canary Token). عند فتح ملف الـ PDF من قبل أي شخص على حاسوبه أو هاتفه، يتم إرسال إشعار فوري وتوثيق بيانات عنوان الـ IP والموقع ونوع التطبيق القارئ للـ PDF في لوحة تحكم التتبع الخاصة بك.'
        : 'Generates and downloads an official tracking PDF document embedded with stealth canary tokens. When opened on any mobile or desktop PDF reader, it automatically logs visitor IP, geo-location, and telemetry directly to your dashboard.',
      features: lang === 'ar'
        ? ['توليد ملف PDF جاهز للتحميل والمشاركة', 'تتبع فتح واستعراض المستندات عن بعد', 'توثيق عنوان IP وبرنامج قراءة الـ PDF', 'مراقبة حية للنشاط داخل لوحة التحكم']
        : ['Generate downloadable PDF ready for distribution', 'Remote document opening audit & detection', 'Captures visitor IP & PDF reader client', 'Live monitoring inside tracking dashboard'],
      actionLabel: lang === 'ar' ? 'فتح تتبع ملفات PDF' : 'Open PDF Canary Tracker',
      actionView: null,
      modeSelect: 'pdf' as TrackingMode,
    },
    {
      id: 'sec-ip-lookup',
      title: lang === 'ar' ? '4. فاحص واستخبارات الـ IP (IP Lookup & Threat Audit)' : '4. IP Intelligence & Threat Audit',
      badge: 'PRO Tool',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      icon: <Globe className="w-5 h-5 text-cyan-600" />,
      desc: lang === 'ar'
        ? 'قسم مخصص للاستعلام اليدوي والاستخباري عن أي عنوان IP حول العالم أو فحص عنوان جهازك الحالي بنقرة واحدة. يقدم تقريراً مفصلاً يشمل: الدولة، المدينة، الرمز البريدي، اسم شركة الاتصالات والمزود (ISP & ASN)، التوقيت المحلي، العملة، وفحص أمني شامل لكشف شبكات الـ VPN والبروكسي ومراكز البيانات (Datacenter).'
        : 'Comprehensive IP intelligence engine for manual lookups or instant 1-click self-inspection. Delivers deep reports: Country, City, Postal Code, ISP & ASN, Local Timezone, Currency, and deep threat analysis detecting VPNs, Proxies, and Datacenters.',
      features: lang === 'ar'
        ? ['فحص أي عنوان IP أو فحص جهازك الحالي', 'كشف شبكات الـ VPN والبروكسي ومراكز البيانات', 'تحليل مزود الخدمة (ISP) ورقم الـ ASN', 'عرض خريطة الموقع الجغرافي التقديري']
        : ['Inspect any external IP or current device IP', 'Detect VPN, Proxy, and Datacenter hosting', 'Resolve ISP, Organization, and ASN routing', 'Geographical map visualization and currency'],
      actionLabel: lang === 'ar' ? 'فتح فاحص الـ IP' : 'Open IP Lookup',
      actionView: 'ip-lookup' as MainNavView,
      modeSelect: null,
    },
    {
      id: 'sec-mac-lookup',
      title: lang === 'ar' ? '5. فحص الماك أدرس وهوية الأجهزة (MAC Lookup)' : '5. Hardware MAC Address Lookup',
      badge: 'Hardware',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: <Cpu className="w-5 h-5 text-indigo-600" />,
      desc: lang === 'ar'
        ? 'أداة احترافية للتعرف على هوية ومصنعي الأجهزة عبر عنوان الماك (MAC Address). تستخدم الأداة قاعدة بيانات IEEE OUI العالمية لتحديد الشركة المصنعة للبطاقة أو الهاتف (مثل Apple, Cisco, Samsung, Intel)، فئة العتاد المتوقعة، قوة البصمة الرقمية، مع إمكانية تصدير تقرير فحص العتاد إلى ملفات TXT و PDF.'
        : 'Professional hardware recognition tool using the global IEEE OUI database. Resolves hardware manufacturers (Apple, Cisco, Samsung, Intel), expected device categories, fingerprint strength, and exports audit reports to TXT and PDF.',
      features: lang === 'ar'
        ? ['كشف الشركة المصنعة ونوع العتاد عبر IEEE OUI', 'تحديد الأجهزة المحتملة (هواتف، أجهزة راوتر، لابتوب)', 'تحليل قوة وتفرد البصمة الرقمية للمعرف', 'تصدير التقارير بصيغة PDF و TXT']
        : ['Identify hardware vendor via IEEE OUI registry', 'Predict device categories (Phones, Routers, Laptops)', 'Digital fingerprint uniqueness scoring', 'Export reports to PDF and TXT formats'],
      actionLabel: lang === 'ar' ? 'فتح فحص الماك' : 'Open MAC Lookup',
      actionView: 'mac-lookup' as MainNavView,
      modeSelect: null,
    },
    {
      id: 'sec-exif-tool',
      title: lang === 'ar' ? '6. فاحص بيانات الصور (ExifTool)' : '6. ExifTool Image Intelligence',
      badge: 'EXIF',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <Camera className="w-5 h-5 text-emerald-600" />,
      desc: lang === 'ar'
        ? 'قسم متطور لاستخراج وتحليل البيانات الوصفية الخفية (EXIF & Metadata) المدمجة في الصور. يدعم قراءة إحداثيات GPS الدقيقة وعرضها على خريطة تفاعلية وقمر صناعي، معرفة نوع الكاميرا والعدسة، إعدادات ISO وسرعة الغالق، تاريخ التقاط الصورة بالثانية، مع إمكانية تجريد البيانات الحساسة وتصدير تقارير فحص PDF و JSON و TXT.'
        : 'Advanced image metadata suite parsing hidden EXIF data, embedded GPS coordinates, camera make and lens hardware, optical exposure data, capture timestamps, EXIF stripping, and PDF/JSON/TXT audit exports.',
      features: lang === 'ar'
        ? ['استخراج إحداثيات GPS ورسمها على خرائط الأقمار الصناعية', 'كشف نوع الكاميرا والعدسة وإعدادات التصوير الدقيقة', 'دعم صيغ JPG, PNG, HEIC, WEBP, TIFF, BMP', 'تجريد بيانات EXIF وتحميل تقارير PDF و JSON و TXT']
        : ['Extract GPS coordinates with satellite map visualization', 'Detect camera hardware, lens optics, and exposure data', 'Native support for JPG, PNG, HEIC, WEBP, TIFF, BMP', 'Strip EXIF metadata and export PDF/JSON/TXT audits'],
      actionLabel: lang === 'ar' ? 'فتح فاحص الصور (ExifTool)' : 'Open ExifTool',
      actionView: 'exif-tool' as MainNavView,
      modeSelect: null,
    },
    {
      id: 'sec-cyber-awareness',
      title: lang === 'ar' ? '7. مركز التوعية بالهندسة الاجتماعية (50 تكتيكاً)' : '7. Social Engineering Defense Guide (50 Types)',
      badge: 'EDU 50',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: <BookOpen className="w-5 h-5 text-rose-600" />,
      desc: lang === 'ar'
        ? 'موسوعة تعليمية دفاعية متكاملة تضم 50 نوعاً وتكتيكاً من أساليب الهندسة الاجتماعية والاختراق الرقمي (روابط التصيد، ملفات PDF المفخخة، ماكرو الأوفيس، تطبيقات APK الملغومة، الديب فيك واستنساخ الأصوات، هجمات الـ SMS، اختراق البريد BEC، وسرقة الجلسات والكوكيز)، مع سيناريوهات واقعية وخطة الدفاع الشاملة لكل تهديد.'
        : 'Comprehensive defensive cyber education encyclopedia covering 50 distinct social engineering vectors (phishing links, malicious PDFs, Office macros, trojan APKs, AI deepfakes & voice cloning, SMS spoofing, BEC wire fraud, session hijacking), complete with real-world scenarios and defense protocols.',
      features: lang === 'ar'
        ? ['50 تكتيكاً وتهديداً سيبرانياً مشروحاً بالتفصيل', 'سيناريو واقعي دقيق لكل عملية احتيال واختراق', 'إرشادات الحماية وخطوات الوقاية التقنية', 'بحث فوري وفلترة وتصدير الدليل إلى PDF']
        : ['50 cybersecurity & deception methods covered', 'Realistic attack scenario for every threat vector', 'Actionable defense protocols and prevention tips', 'Instant live search, filtering, & PDF export'],
      actionLabel: lang === 'ar' ? 'فتح مركز التوعية' : 'Open Cyber Awareness',
      actionView: 'cyber-awareness' as MainNavView,
      modeSelect: null,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-5 flex flex-col gap-5">
      {/* Hero Header Banner */}
      <div className="text-center flex flex-col items-center gap-1.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-slate-900 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-800 shadow-sm">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span>SM Cyber Security Suite 2026</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
          {lang === 'ar' ? 'العين السيبرانية SM الشاملة للأمان والتحليل الرقمي' : 'SM Cyber Eye - Digital Intelligence & Cyber Suite'}
        </h1>
        <p className="text-slate-600 max-w-xl text-[11px] sm:text-xs leading-relaxed">
          {lang === 'ar'
            ? 'العين السيبرانية SM توفر نظاماً متكاملاً لتتبع الروابط الذكية، تتبع ملفات PDF، استعلام عناوين IP، تحليل أجهزة الماك، وموسوعة الحماية من الهندسة الاجتماعية.'
            : 'Unified cyber platform for intelligent telemetry links, PDF canary tracking, IP intelligence, hardware MAC lookups, and 50 social engineering defenses.'}
        </p>
      </div>

      {/* Main Link Generator Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col gap-3.5">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="target-url-input"
            className="text-[11px] font-bold uppercase tracking-wider text-slate-950 flex items-center justify-between"
          >
            <span>{lang === 'ar' ? 'الرابط الأصلي المراد تتبعه والتوجيه إليه' : 'Target Destination URL'}</span>
            <span className="text-[10px] text-slate-400 font-medium lowercase">https://...</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-slate-400">
              <Link2 className="w-4 h-4 text-indigo-600" />
            </div>
            <input
              id="target-url-input"
              type="url"
              value={url}
              disabled={isLimitReached}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate('near');
              }}
              placeholder={isLimitReached ? (lang === 'ar' ? 'تم الوصول للحد الأقصى (5)' : 'Max links limit reached (5)') : t.enterUrlPlaceholder}
              className={`w-full ps-9 pe-16 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-950 placeholder:text-slate-400 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono transition-all ${isLimitReached ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100/70 focus:bg-white'}`}
            />
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="absolute end-2.5 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-800 font-bold cursor-pointer"
              >
                {lang === 'ar' ? 'مسح' : 'Clear'}
              </button>
            )}
          </div>
          {error && <p className="text-xs text-red-600 font-semibold mt-0.5">{error}</p>}

          {/* How-to Trapping Explainer Notice */}
          <div className="mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2 text-[11px] text-slate-700">
            <Crosshair className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-slate-950">
                {lang === 'ar' ? 'طريقة تلغيم الرابط والتوجيه التلقائي:' : 'How to Trap Link & Auto-Redirect:'}
              </span>
              <p className="text-[10px] text-slate-600 leading-normal">
                {lang === 'ar'
                  ? 'اكتب أو الصق رابط الوجهة الحقيقي (مثل فيديو، مقال، أو موقع) ثم اضغط على الخدمة المطلوبة بالأسفل لتلغيم الرابط والحصول على رابط التتبع الخاص بك مع إعادة التوجيه التلقائي بعد جمع القياسات.'
                  : 'Enter or paste the real destination URL, then click your desired tracking service below to arm the link and generate your telemetry URL with automatic redirection.'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick URL Presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-600 font-semibold text-[11px]">
            {lang === 'ar' ? 'أمثلة سريعة:' : 'Quick Presets:'}
          </span>
          {popularPresets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setUrl(p.url)}
              className="px-2.5 py-0.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Action Buttons in Bento Grid Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {/* 1. Precise GPS Button */}
          <button
            id="btn-create-precise"
            disabled={isCreating || isLimitReached}
            onClick={() => handleCreate('precise')}
            className="group relative flex flex-col p-4 sm:p-5 rounded-3xl bg-slate-950 hover:bg-slate-900 text-white shadow-xl shadow-black/10 transition-all active:scale-98 disabled:opacity-50 text-start cursor-pointer border border-slate-800 overflow-hidden"
          >
            <div className="flex items-center justify-between w-full mb-2 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <Crosshair className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-black tracking-tight block">{t.preciseTrackingBtn}</span>
                  <span className="text-[10px] text-indigo-300 font-semibold">{lang === 'ar' ? 'تحديد إحداثيات ومستشعرات' : 'GPS + Sensors'}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-indigo-500/20 text-indigo-300 uppercase tracking-widest border border-indigo-500/30">
                GPS
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-medium relative z-10 ps-1">
              {t.preciseTrackingDesc}
            </p>
          </button>

          {/* 2. Near IP Button */}
          <button
            id="btn-create-near"
            disabled={isCreating || isLimitReached}
            onClick={() => handleCreate('near')}
            className="group relative flex flex-col p-4 sm:p-5 rounded-3xl bg-slate-950 hover:bg-slate-900 text-white shadow-xl shadow-black/10 transition-all active:scale-98 disabled:opacity-50 text-start cursor-pointer border border-slate-800 overflow-hidden"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-black tracking-tight block">{t.nearTrackingBtn}</span>
                  <span className="text-[10px] text-emerald-300 font-semibold">{lang === 'ar' ? 'تتبع صامت وفوري للشبكة' : 'Silent Network Intel'}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 uppercase tracking-widest border border-emerald-500/30">
                IP
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-medium ps-1">
              {t.nearTrackingDesc}
            </p>
          </button>

          {/* 3. IP Lookup Button */}
          <button
            id="btn-nav-ip-lookup"
            onClick={onNavigateIpLookup}
            className="group relative flex flex-col p-4 sm:p-5 rounded-3xl bg-slate-950 hover:bg-slate-900 text-white shadow-xl shadow-black/10 transition-all active:scale-98 text-start cursor-pointer border border-slate-800 overflow-hidden"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-black tracking-tight block">{t.navIpLookup}</span>
                  <span className="text-[10px] text-cyan-300 font-semibold">{lang === 'ar' ? 'كشف VPN والبروكسي' : 'VPN & Threat Scoring'}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-cyan-500/20 text-cyan-300 uppercase tracking-widest border border-cyan-500/30">
                IP TOOL
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-medium ps-1">
              {lang === 'ar' ? 'فحص واستخبارات أي عنوان IP، كشف الـ VPN والـ Proxy والموقع الجغرافي بدقة.' : 'Investigate any IP, detect VPN/Proxy threat, and visualize precise coordinates.'}
            </p>
          </button>

          {/* 4. PDF Tracking Button */}
          <button
            id="btn-create-pdf"
            disabled={isCreating || isLimitReached || hasPdfLink}
            onClick={() => handleCreate('pdf')}
            className={`group relative flex flex-col p-4 sm:p-5 rounded-3xl shadow-xl shadow-black/10 transition-all active:scale-98 disabled:opacity-50 text-start cursor-pointer border overflow-hidden ${hasPdfLink ? 'bg-slate-900 text-slate-500 border-slate-800' : 'bg-slate-950 hover:bg-slate-900 text-white border-slate-800'}`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${hasPdfLink ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-amber-500/20 border-amber-400/30 text-amber-400'}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-black tracking-tight block">{t.pdfTrackingBtn}</span>
                  <span className={`text-[10px] font-semibold ${hasPdfLink ? 'text-slate-500' : 'text-amber-300'}`}>{lang === 'ar' ? 'تتبع فتح المستندات' : 'Canary PDF Token'}</span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${hasPdfLink ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                {hasPdfLink ? (lang === 'ar' ? 'مكتمل (1/1)' : '1/1 MAX') : 'PDF'}
              </span>
            </div>
            <p className={`text-[11px] sm:text-xs leading-relaxed ps-1 font-medium ${hasPdfLink ? 'text-slate-600' : 'text-slate-400'}`}>
              {t.pdfTrackingDesc}
            </p>
          </button>

          {/* 5. MAC Lookup Button */}
          <button
            id="btn-nav-mac-lookup"
            onClick={() => onViewChange('mac-lookup')}
            className="group relative flex flex-col p-4 sm:p-5 rounded-3xl bg-slate-950 hover:bg-slate-900 text-white shadow-xl shadow-black/10 transition-all active:scale-98 text-start cursor-pointer border border-slate-800 overflow-hidden"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-black tracking-tight block">{t.macLookupTitle}</span>
                  <span className="text-[10px] text-indigo-300 font-semibold">{lang === 'ar' ? 'كشف المصنع والعتاد وOUI' : 'Hardware & Vendor OUI'}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-indigo-500/20 text-indigo-300 uppercase tracking-widest border border-indigo-500/30">
                HARDWARE
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-medium ps-1">
              {lang === 'ar' ? 'استعلام دقيق عن هوية مصنعي الأجهزة عبر قاعدة بيانات IEEE OUI العالمية وتصدير تقارير فحص العتاد.' : 'Inspect hardware MAC addresses to discover manufacturers, device categories, and generate audit reports.'}
            </p>
          </button>

          {/* 6. ExifTool Image Intelligence Button */}
          <button
            id="btn-nav-exif-tool"
            onClick={() => onViewChange('exif-tool')}
            className="group relative flex flex-col p-4 sm:p-5 rounded-3xl bg-slate-950 hover:bg-slate-900 text-white shadow-xl shadow-black/10 transition-all active:scale-98 text-start cursor-pointer border border-emerald-900/40 overflow-hidden"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-black tracking-tight block">{t.exifToolTitle}</span>
                  <span className="text-[10px] text-emerald-300 font-semibold">{lang === 'ar' ? 'بيانات EXIF، إحداثيات GPS، وصيغ HEIC' : 'EXIF, GPS Geolocation & HEIC'}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 uppercase tracking-widest border border-emerald-500/30">
                EXIF / GPS
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-medium ps-1">
              {lang === 'ar' ? 'فحص وتحليل الصور واستخراج البيانات الوصفية وموقع التقاط الصورة وتجريد بيانات EXIF.' : 'Deep analysis of images, extracting metadata, camera optics, GPS coordinates, and metadata cleaning.'}
            </p>
          </button>

          {/* 7. Cyber Awareness Center Button */}
          <button
            id="btn-nav-cyber-awareness"
            onClick={() => onViewChange('cyber-awareness')}
            className="group relative flex flex-col p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 hover:from-slate-900 hover:to-indigo-900 text-white shadow-xl shadow-black/10 transition-all active:scale-98 text-start cursor-pointer border border-indigo-900/50 overflow-hidden"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-black tracking-tight block">{t.cyberAwarenessTitle}</span>
                  <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">{lang === 'ar' ? '50 تكتيك للهندسة الاجتماعية والحماية' : '50 Attack Vectors & Defense Protocols'}</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[9px] font-black bg-rose-500/20 text-rose-300 uppercase tracking-widest border border-rose-500/30">
                50 TYPES
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-indigo-200 leading-relaxed font-medium ps-1">
              {lang === 'ar'
                ? 'دليل استخباري تعليمي شامل يغطي 50 نوعاً من مخاطر الروابط الملغومة، ملفات الـ PDF، ماكرو الأوفيس، وتطبيقات APK.'
                : 'Comprehensive cyber awareness encyclopedia featuring 50 social engineering attack methods with real scenarios.'}
            </p>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXCLUSIVE REPLACEMENT SECTION: COMPREHENSIVE SYSTEM SECTIONS GUIDE       */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-50 border-2 border-indigo-600/20 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
                <span>{lang === 'ar' ? 'دليل وشرح أقسام العين السيبرانية SM' : 'SM Cyber Eye Comprehensive Sections Guide'}</span>
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                {lang === 'ar'
                  ? 'شرح تفصيلي ودقيق لكافة الأدوات والأنظمة المتوفرة في العين السيبرانية SM وكيفية عملها واستخدامها بأعلى كفاءة.'
                  : 'Detailed breakdown of all available system modules, telemetry engines, and how to utilize them.'}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 self-start sm:self-auto">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>{lang === 'ar' ? '7 أقسام متكاملة' : '7 Integrated Modules'}</span>
          </div>
        </div>

        {/* Sections Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sectionsGuide.map((sec) => (
            <div
              key={sec.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 hover:border-indigo-300 hover:bg-slate-50 transition-all flex flex-col justify-between gap-3 shadow-2xs"
            >
              <div className="flex flex-col gap-2.5">
                {/* Card Title & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-2xs shrink-0">
                      {sec.icon}
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-950">
                      {sec.title}
                    </h3>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${sec.badgeColor} shrink-0`}>
                    {sec.badge}
                  </span>
                </div>

                {/* Description */}
                <p className="text-slate-600 text-[11px] sm:text-xs leading-relaxed">
                  {sec.desc}
                </p>

                {/* Features Pill List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {sec.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Button for EVERY section */}
              <div className="pt-2.5 border-t border-slate-200/70 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {sec.badge}
                </span>
                <button
                  id={`btn-guide-open-${sec.id}`}
                  onClick={() => {
                    if (sec.actionView) {
                      onViewChange(sec.actionView);
                    } else if (sec.modeSelect) {
                      const targetInput = document.getElementById('target-url-input');
                      if (targetInput) {
                        targetInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        targetInput.focus();
                      } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <span>{sec.actionLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TELEMETRY METRICS & RECENT LINKS                     */}
      {/* ---------------------------------------------------- */}

      {/* Telemetry Status Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-black text-indigo-700 text-sm">{globalVisits.toLocaleString()}</span>
            <span className="text-slate-700 font-semibold">
              {lang === 'ar' ? 'زيارة موثقة' : 'Recorded Visits'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-black text-indigo-700 text-sm">
              {globalLinks.toLocaleString()}
            </span>
            <span className="text-slate-700 font-semibold">{lang === 'ar' ? 'رابط تم إنشاؤه' : 'Links Created'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-700 font-semibold">
              {lang === 'ar' ? 'تشفير وتحليل مؤمن' : '100% Secure Telemetry'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono bg-slate-100 border border-slate-200 py-1 px-3 rounded-full">
          <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
          <span className="text-slate-600">Status:</span>
          <span className="text-slate-950 font-bold">2026_Live_Active</span>
        </div>
      </div>

      {/* Saved Links Section (If any) */}
      {savedLinks.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-black text-slate-950 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>{t.recentLinksTitle}</span>
              <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${isLimitReached ? 'bg-red-50 text-red-600 border-red-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                {savedLinks.length} / 5 {isLimitReached && (lang === 'ar' ? '(الحد الأقصى)' : '(MAX)')}
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {savedLinks.map((link) => (
              <div
                key={link.code}
                onClick={() => onSelectLink(link.code)}
                className="group flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/40 cursor-pointer transition-all shadow-2xs"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs text-slate-950 group-hover:text-indigo-700 transition-colors">
                      /{link.code}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        link.mode === 'precise'
                          ? 'bg-indigo-100 text-indigo-800'
                          : link.mode === 'pdf'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {link.mode === 'precise' ? t.preciseTrackingBadge : (link.mode === 'pdf' ? t.pdfTrackingBadge : t.nearTrackingBadge)}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 truncate max-w-[220px]">
                    {link.originalUrl}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-end">
                    <span className="text-xs font-black text-slate-950">
                      {link.visitCount || 0}
                    </span>
                    <span className="text-[9px] text-slate-500 block">{t.visitsCount}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 rtl:rotate-180 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
