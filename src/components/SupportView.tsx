import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
  Crosshair,
  Lock,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Code2,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { Language, translations } from '../translations';

interface SupportViewProps {
  lang: Language;
}

interface FaqItem {
  id: string;
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
  tag: string;
}

export const SupportView: React.FC<SupportViewProps> = ({ lang }) => {
  const t = translations[lang];
  const [openIds, setOpenIds] = useState<string[]>(['faq-1', 'faq-2']);
  const [copied, setCopied] = useState(false);

  const telegramHandle = '@SM_MS_IP';
  const telegramUrl = 'https://t.me/SM_MS_IP';
  const telegramLogoImg = 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg';
  const smLogoImg = 'https://i.ibb.co/d4SN4h4h/Screenshot-20260723-035727-Gallery.jpg';

  const toggleFaq = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyTelegram = () => {
    navigator.clipboard.writeText(telegramHandle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faqs: FaqItem[] = [
    {
      id: 'faq-1',
      tag: 'Tracking Engine',
      qAr: 'ما هو الفرق بين التتبع الدقيق (GPS) والتتبع القريب (IP)؟',
      qEn: 'What is the difference between Precise GPS and Near IP Tracking?',
      aAr: 'التتبع الدقيق (GPS): يطلب إذن الموقع الجغرافي من المتصفح بدقة الأقمار الصناعية، فيجلب إحداثيات حقيقية لشارع ومبنى الزائر بدقة أمتار معدودة، مع تحويل العنوان الدقيق وخريطة Google Maps.\n\nالتتبع القريب (IP): يعمل بصمت تام وبدون طلب أي أذونات من الزائر، ويعتمد على عنوان IP الخاص به لتحديد الدولة والمدينة ومزود خدمة الإنترنت (ISP) ونوع الجهاز والبطارية.',
      aEn: 'Precise GPS: Requests browser location permissions to get exact satellite coordinates (within meters accuracy) including street address reverse geocoding and live Google Maps.\n\nNear IP: Works 100% silently without asking for any permissions, determining country, city, ISP, OS, battery, and device specs based on visitor IP.',
    },
    {
      id: 'faq-2',
      tag: 'Super Fingerprinting',
      qAr: 'كيف يعمل التبصيم الفائق (Canvas, WebGL, AudioContext)؟',
      qEn: 'How does Super Fingerprinting (Canvas, WebGL, AudioContext) work?',
      aAr: 'يقوم النظام بتشغيل عمليات رسم متقدمة عبر Canvas 2D ومعالجة كارت الشاشة WebGL GPU وضغط إشارة صوتية عبر AudioContext، واستخراج شفرة تجزئة عتادية فريدة (Hardware ID) ثابتة للجهاز تميزه بدقة حتى لو تم تغيير الـ IP أو المتصفح.',
      aEn: 'The system renders 2D canvas routines, interrogates WebGL GPU parameters, and processes dynamic AudioContext signals to produce a deterministic Hardware ID for the device.',
    },
    {
      id: 'faq-3',
      tag: 'Timezone & Latency',
      qAr: 'كيف يكشف النظام اتصالات الـ VPN والبروكسي وتعارض التوقيت؟',
      qEn: 'How does the system detect VPNs, Proxies, and Timezone conflicts?',
      aAr: 'يقارن النظام المنطقة الزمنية الداخلية للجهاز مع توقيت الدولة المستخرجة من عنوان IP؛ وفي حال وجود تعارض أو فارق ساعات كبير يتم تصنيف الاتصال كـ VPN مشبوه، بالإضافة إلى قياس زمن الاستجابة والـ Ping مع خوادم Cloudflare و Google.',
      aEn: 'The system cross-references device internal time zone against the IP geolocation database. Discrepancies indicate active proxy/VPN tunnels alongside network latency triangulation.',
    },
    {
      id: 'faq-4',
      tag: 'Camouflage & Shortening',
      qAr: 'كيف يتم تمويه الروابط واختصارها عبر clck.ru؟',
      qEn: 'How are tracking links disguised and shortened via clck.ru?',
      aAr: 'يتم إرسال رابط التتبع إلى خادم clck.ru المعتمد لإنشاء رابط مختصر موثوق، ثم يوفر النظام قوالب تمويه احترافية تشبه نطاقات شهيرة (مثل YouTube, Google, Facebook) لإخفاء طبيعة الرابط تماماً وزيادة نسبة الفتح.',
      aEn: 'The tracking link is routed to clck.ru to generate an authentic short link. Pre-configured camouflage domain templates (YouTube, Google, Instagram, Facebook) can then be applied to mask the link completely.',
    },
    {
      id: 'faq-pdf',
      tag: 'PDF Document Tracking',
      qAr: 'ماذا يفعـل زر تحميل ملف الـ PDF وكيف يستفيد منه المستخدم؟',
      qEn: 'What does the PDF tracking download button do and how is it used?',
      aAr: 'يسمح لك هذا الزر بإنشاء وتنزيل ملف وثيقة رسمية بصيغة PDF مصمم خصيصاً لجلستك. بمجرد تحميل الملف وتنزيله، يمنحك القدرة على تتبع وقت فتح المستند ومعرفة بيانات الأجهزة والاتصالات الواردة في لوحة التحكم بكل سهولة.',
      aEn: 'This button allows you to generate and download an official PDF document customized for your session. Once downloaded and opened, it enables tracking document access times, device telemetry, and connection metrics directly in your dashboard.',
    },
    {
      id: 'faq-5',
      tag: 'Security & Erase',
      qAr: 'هل يمكنني حذف الرابط وسجلات الزيارات نهائياً؟',
      qEn: 'Can I permanently delete my tracking links and visit logs?',
      aAr: 'نعم، بكل سهولة. من خلال زر "حذف الملف" لملفات PDF أو "حذف الموقع" للروابط في لوحة التحكم، يقوم الخادم بمسح الملف أو الرابط وكافة سجلات الزيارات والإحداثيات نهائياً من قاعدة البيانات، ولن يتمكن أي شخص من الوصول إليها بعد ذلك.',
      aEn: 'Yes. By clicking "Delete File" for PDF documents or "Delete Link" for tracking links in your dashboard, the server wipes all associated visit logs and telemetry permanently from the database.',
    },
    {
      id: 'faq-6',
      tag: 'Official Rights',
      qAr: 'ما هي حقوق التطوير والملكية الفكرية للمطور؟',
      qEn: 'What are the official development and copyright credits?',
      aAr: 'نظام SM مبرمج ومطور بالكامل بواسطة المهندس والمطور: محمد أبو السعود (AlQeyadah AlZaeem SM) 2026.\nجميع الحقوق محفوظة.',
      aEn: 'SM Platform is engineered and developed exclusively by: Mohamed Abu AlSaud (AlQeyadah AlZaeem SM) 2026.\nAll rights reserved.',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 flex flex-col gap-3.5">
      {/* Header Banner */}
      <div className="text-center flex flex-col items-center gap-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <MessageCircle className="w-3 h-3 text-indigo-600" />
          <span>SM Support & Developer Center 2026</span>
        </div>
        <h1 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
          {t.supportTitle}
        </h1>
        <p className="text-slate-600 max-w-lg text-[11px] sm:text-xs leading-relaxed">
          {t.supportSubtitle}
        </p>
      </div>

      {/* Section Detailed Explainer Card */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
            i
          </div>
          <h3 className="text-xs sm:text-sm font-black text-slate-950">
            {lang === 'ar' ? 'دليل تتبع وثائق الـ PDF والروابط الذكية' : 'PDF Document & Smart Telemetry Guide'}
          </h3>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed ps-8">
          {lang === 'ar'
            ? 'يقدم النظام أقساماً متكاملة تشمل: تتبع الروابط الذكية عبر تحديد الموقع الجغرافي الدقيق (GPS)، التتبع القريب الصامت عبر عناوين (IP)، وتتبع وثائق الـ PDF عبر رموز التتبع الخفية (Canary Tokens). عند فتح ملف الـ PDF الذي تقوم بإنشائه، يتم إرسال طلب آلي من جهاز الفاتح لخوادمنا لجلب العنصر المدمج (Web Bug)، مما يسمح لنا بتسجيل الـ IP، الوقت، ونوع الجهاز فوراً وبدقة، دون الحاجة لأي تفاعل من المستخدم سوى فتح الملف.'
            : 'The platform provides integrated sections including: Smart GPS coordinate tracking, silent IP-based geolocation telemetry, and PDF document tracking via embedded Canary Tokens. When the generated PDF is opened, it automatically requests a hidden element (Web Bug) from our servers, allowing immediate and precise recording of the visitor IP, access time, and device telemetry silently upon opening the file.'}
        </p>
      </div>

      {/* Developer Profile & Telegram Live Support Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Card 1: Official Developer Identity (Span 6) */}
        <div className="md:col-span-6 bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <div className="w-14 h-14 rounded-full overflow-hidden p-0.5 border-2 border-indigo-600 bg-white shadow-xs">
                <img
                  src={smLogoImg}
                  alt="Mohamed Abu AlSaud"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {lang === 'ar' ? 'المطور المعتمد' : 'Lead Developer'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-950 mt-1 leading-tight">
                {lang === 'ar' ? 'محمد أبو السعود' : 'Mohamed Abu AlSaud'}
              </h2>
              <span className="text-[11px] font-bold text-indigo-700 font-mono">
                AlQeyadah AlZaeem SM
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col gap-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-600 font-medium">{lang === 'ar' ? 'الدور الهندسي:' : 'Engineering Role:'}</span>
              <span className="font-bold text-slate-950">{lang === 'ar' ? 'مهندس ومطور النظام' : 'Software Architect'}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-600 font-medium">{lang === 'ar' ? 'الإصدار الحركي:' : 'Release Version:'}</span>
              <span className="font-mono font-bold text-indigo-700">{lang === 'ar' ? 'الإصدار الأول (v1.0)' : 'Release 1.0 (v1.0)'}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-600 font-medium">{lang === 'ar' ? 'حقوق الملكية:' : 'Copyright:'}</span>
              <span className="font-bold text-slate-950 font-mono text-[10px]">© Mohamed Abu AlSaud</span>
            </div>
          </div>
        </div>

        {/* Card 2: Official Telegram Channel with Circular Logo (Span 6) */}
        <div className="md:col-span-6 bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <div className="w-14 h-14 rounded-full bg-[#229ED9]/10 border-2 border-[#229ED9]/30 p-2.5 flex items-center justify-center shadow-xs">
                <img
                  src={telegramLogoImg}
                  alt="Telegram Official Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h3 className="text-xs sm:text-sm font-black text-slate-950">
                  {t.telegramSupportTitle}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5 line-clamp-2">
                {t.telegramSupportDesc}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200">
              <span className="font-mono font-bold text-xs text-slate-950 dir-ltr select-all">
                {telegramHandle}
              </span>
              <button
                onClick={handleCopyTelegram}
                className="p-1 ms-auto rounded-full hover:bg-slate-200 text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
                title={t.copyLink}
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#229ED9] hover:bg-[#1e8ec3] text-white font-bold text-xs shadow-xs transition-all active:scale-98 cursor-pointer shrink-0"
            >
              <div className="w-4 h-4 rounded-full overflow-hidden shrink-0">
                <img
                  src={telegramLogoImg}
                  alt="Telegram"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain brightness-0 invert"
                />
              </div>
              <span>{t.contactTelegramBtn}</span>
              <ExternalLink className="w-3 h-3 opacity-90" />
            </a>
          </div>
        </div>
      </div>

      {/* FAQ Accordion Section in Translucent White Glass */}
      <div className="bg-white/85 backdrop-blur-md border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs sm:text-sm font-black text-slate-950">{t.faqTitle}</h2>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {faqs.length} {lang === 'ar' ? 'سؤال وجواب' : 'Questions'}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {faqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            const question = lang === 'ar' ? faq.qAr : faq.qEn;
            const answer = lang === 'ar' ? faq.aAr : faq.aEn;

            return (
              <div
                key={faq.id}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-slate-50/90 border-indigo-300 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-3 flex items-center justify-between gap-2.5 text-start cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                      {faq.tag}
                    </span>
                    <span className="text-xs font-bold text-slate-950 leading-snug">
                      {question}
                    </span>
                  </div>

                  <div className="shrink-0 text-slate-500">
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-indigo-600" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-3.5 pb-3 pt-1 border-t border-slate-200/60 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Developer Rights Banner */}
      <div className="p-3 rounded-xl bg-white/85 backdrop-blur-md border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-700">
        <div className="flex items-center gap-2 text-slate-950 font-bold">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>© Mohamed Abu AlSaud (AlQeyadah AlZaeem SM) 2026</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 font-semibold">
            SM Security & Diagnostics Engine
          </span>
        </div>
      </div>
    </div>
  );
};

