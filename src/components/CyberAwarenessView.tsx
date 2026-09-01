import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Zap,
  Users,
  Mail,
  Lock,
  Smartphone,
  Search,
  FileText,
  Radio,
  Globe2,
  Cpu,
  Download,
  CheckCircle2,
  ExternalLink,
  Flame,
  Volume2,
  Eye,
  Key,
  Building,
  HardDrive,
  QrCode,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Language, translations } from '../translations';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ThreatItem {
  id: number;
  category: 'links_phishing' | 'malicious_files' | 'voice_ai' | 'mobile_sms' | 'baiting_psych' | 'physical' | 'corporate_bec' | 'identity_auth';
  severity: 'critical' | 'high' | 'medium';
  icon: React.ReactNode;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  exampleAr: string;
  exampleEn: string;
  defenseAr: string;
  defenseEn: string;
}

export const CyberAwarenessView: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const categories = [
    { id: 'all', labelAr: 'الكل (50 تكتيك)', labelEn: 'All (50 Types)' },
    { id: 'links_phishing', labelAr: 'روابط وتصيد إلكتروني', labelEn: 'Links & Phishing' },
    { id: 'malicious_files', labelAr: 'ملفات ومرفقات ملغومة', labelEn: 'Malicious Files' },
    { id: 'voice_ai', labelAr: 'ذكاء اصطناعي وصوت (Vishing)', labelEn: 'AI & Voice Scams' },
    { id: 'mobile_sms', labelAr: 'هواتف ورسائل (Smishing)', labelEn: 'Mobile & SMS' },
    { id: 'baiting_psych', labelAr: 'إغراء وتلاعب نفسي', labelEn: 'Baiting & Mindset' },
    { id: 'physical', labelAr: 'هجمات مادية وميدانية', labelEn: 'Physical Threats' },
    { id: 'corporate_bec', labelAr: 'اختراق أعمال وشركات (BEC)', labelEn: 'Corporate & BEC' },
    { id: 'identity_auth', labelAr: 'جلسات ومصادقة (Auth)', labelEn: 'Auth & Identity' },
  ];

  const threats: ThreatItem[] = [
    // 1. Links & Phishing
    {
      id: 1,
      category: 'links_phishing',
      severity: 'critical',
      icon: <Mail className="w-5 h-5" />,
      titleAr: 'روابط البريد الملغومة (Link Phishing)',
      titleEn: 'Email Link Phishing',
      descAr: 'روابط تزرع في رسائل البريد تبدو رسمية لسرقة بيانات الدخول أو تفعيل برمجيات خبيثة بمجرد النقر.',
      descEn: 'Deceptive hyperlinks embedded in emails redirecting to credential harvesting portals.',
      exampleAr: 'رسالة تزعم: "تم إيقاف حسابك البنكي، اضغط هنا للتحقق الفوري" برابط شبيه بموقع البنك.',
      exampleEn: 'Email claiming: "Your bank account has been suspended, click to verify" pointing to a spoofed portal.',
      defenseAr: 'مرر مؤشر الفأرة فوق الرابط للتحقق من عنوان URL الفعلي في زاوية المتصفح قبل النقر.',
      defenseEn: 'Hover over hyperlinks to verify the exact canonical destination domain before clicking.'
    },
    {
      id: 2,
      category: 'links_phishing',
      severity: 'critical',
      icon: <Globe2 className="w-5 h-5" />,
      titleAr: 'النطاقات المتطابقة بصرياً (Typosquatting & Punycode)',
      titleEn: 'Typosquatting & Punycode Homograph',
      descAr: 'تسجيل نطاقات تشبه النطاقات الشهيرة بفارق حرف واحد أو استخدام حروف يونيكود لاتينية شبيهة.',
      descEn: 'Registering misspelled or Punycode look-alike domains (e.g. g00gle.com or аpple.com).',
      exampleAr: 'رابط باسم "micros0ft-login.com" أو استخدام حرف "o" سيريلي يشبه تماماً الحرف الإنجليزي.',
      exampleEn: 'Visiting "micros0ft-support.com" designed visually identical to the official corporate portal.',
      defenseAr: 'اكتب عنوان الموقع الحقيقي يدوياً في شريط العنوان ولا تعتمد على روابط المنشورات والرسائل.',
      defenseEn: 'Manually type known domain addresses into browser URL bars rather than clicking third-party links.'
    },
    {
      id: 3,
      category: 'links_phishing',
      severity: 'high',
      icon: <Zap className="w-5 h-5" />,
      titleAr: 'اختصارات الروابط الخبيثة (Malicious URL Shorteners)',
      titleEn: 'Obfuscated URL Shorteners',
      descAr: 'استخدام خدمات تقصير الروابط مثل bit.ly و tinyurl لإخفاء مسار الوجهة الخبيث وتجاوز فلاتر البريد.',
      descEn: 'Leveraging public URL shorteners to mask destination endpoints and evade spam filters.',
      exampleAr: 'رابط "bit.ly/3xZy99" منشور في تويتر يوجهك تلقائياً لصفحة تنزيل برمجية تروجان.',
      exampleEn: 'A short URL in a social media tweet that immediately triggers a zero-day drive-by payload.',
      defenseAr: 'استخدم أدوات فك الروابط المختصرة (URL Unshorteners) لفحص الوجهة قبل زيارتها.',
      defenseEn: 'Expand shortened URLs with unshortener security engines before visiting them.'
    },
    {
      id: 4,
      category: 'links_phishing',
      severity: 'critical',
      icon: <Users className="w-5 h-5" />,
      titleAr: 'التصيد الموجه المخصص (Spear Phishing)',
      titleEn: 'Targeted Spear Phishing',
      descAr: 'هجوم مصمم خصيصاً لشخص أو مؤسسة معينة باستخدام معلومات وظيفية وشخصية حقيقية لإضفاء المصداقية.',
      descEn: 'Highly customized phishing attacks tailoring personal data to deceive specific targets.',
      exampleAr: 'رسالة للمحاسب: "يرجى تحويل مستحقات العقد الخاص بمشروع [اسم المشروع الحقيقي]".',
      exampleEn: 'Targeting a finance officer citing authentic vendor project contract identifiers.',
      defenseAr: 'تحقق دائماً من هوية الراسل بطلب تأكيد عبر اتصال هاتفي أو وسيلة تواصل ثانوية معتمدة.',
      defenseEn: 'Always confirm unexpected transactional or sensitive requests via authenticated out-of-band channels.'
    },
    {
      id: 5,
      category: 'links_phishing',
      severity: 'critical',
      icon: <Building className="w-5 h-5" />,
      titleAr: 'صيد الحيتان (Whaling / Executive Phishing)',
      titleEn: 'Whaling Attacks on Leadership',
      descAr: 'استهداف كبار التنفيذيين والمدراء للحصول على صلاحيات الإدارة العليا أو الموافقة على تحويلات ضخمة.',
      descEn: 'High-stakes phishing aimed specifically at board members and C-level executives.',
      exampleAr: 'إشعار عاجل للرئيس التنفيذي بوجود دعوى قضائية تستوجب النقر على مستندات سرية فوراً.',
      exampleEn: 'Phishing email disguising as a supreme court subpoena demanding urgent executive response.',
      defenseAr: 'تطبيق بروتوكولات مصادقة متعددة المراحل صارمة لجميع طلبات الإدارة العليا.',
      defenseEn: 'Enforce multi-step secondary authorization procedures for executive decisions.'
    },
    {
      id: 6,
      category: 'links_phishing',
      severity: 'high',
      icon: <Layers className="w-5 h-5" />,
      titleAr: 'استنساخ الرسائل الموثوقة (Clone Phishing)',
      titleEn: 'Clone Phishing',
      descAr: 'استنساخ رسالة بريد إلكتروني حقيقية سابقة واستبدال المرفق أو الرابط بآخر خبيث وإعادة إرسالها.',
      descEn: 'Duplicating a previously delivered legitimate email and replacing links/attachments with malicious payloads.',
      exampleAr: 'إعادة إرسال نفس إيميل تجديد الاشتراك السابق مع كتابة: "نعتذر، الرابط السابق انتهت صلاحيته".',
      exampleEn: 'Resending a genuine invoice template claiming: "Updated link due to expired download window".',
      defenseAr: 'تحقق من ترويسة البريد ورسائل السجل السابقة للتأكد من هوية الخادم المرسل.',
      defenseEn: 'Inspect raw email headers (SPF, DKIM, DMARC) before interacting with duplicate threads.'
    },
    {
      id: 7,
      category: 'links_phishing',
      severity: 'critical',
      icon: <Key className="w-5 h-5" />,
      titleAr: 'تصيد صلاحيات OAuth (Illicit OAuth Phishing)',
      titleEn: 'Illicit OAuth Consent Phishing',
      descAr: 'خداع المستخدم لمنح تطبيق خارجي خبيث حق الوصول الكامل لبريده أو ملفات Google Drive و Office 365.',
      descEn: 'Tricking users into consenting OAuth permissions to a rogue cloud application.',
      exampleAr: 'نافذة تطلب الإذن لتطبيق "PDF Reader Online" بقراءة وتعديل جميع ملفاتك ورسائلك.',
      exampleEn: 'OAuth dialog prompting full mailbox read/write access for a third-party helper utility.',
      defenseAr: 'لا تمنح صلاحيات لتطبيقات غير معتمدة من مدير تكنولوجيا المعلومات في مؤسستك.',
      defenseEn: 'Audit connected third-party app permissions and restrict unauthorized enterprise OAuth apps.'
    },
    {
      id: 8,
      category: 'links_phishing',
      severity: 'medium',
      icon: <Search className="w-5 h-5" />,
      titleAr: 'تسميم محركات البحث (SEO Poisoning)',
      titleEn: 'SEO Poisoning & Malvertising',
      descAr: 'شراء إعلانات أو التلاعب بترتيب محركات البحث لوضع مواقع خبيثة في النتيجة الأولى عند البحث عن برامج شهيرة.',
      descEn: 'Placing malicious ads or manipulated search results to distribute trojans for popular software.',
      exampleAr: 'البحث عن "تحميل متصفح Chrome" والضغط على أول إعلان يقود لموقع يحمل فيروساً.',
      exampleEn: 'Searching for "AnyDesk download" and clicking sponsored ads serving infostealer malware.',
      defenseAr: 'تأكد من عنوان الدومين الرسمي ولا تضغط على الإعلانات الممولة لتحميل البرمجيات.',
      defenseEn: 'Avoid clicking sponsored search ads when downloading critical desktop applications.'
    },

    // 2. Malicious Files & Payloads
    {
      id: 9,
      category: 'malicious_files',
      severity: 'critical',
      icon: <FileText className="w-5 h-5" />,
      titleAr: 'ملفات الـ PDF المفخخة (Weaponized PDF Exploits)',
      titleEn: 'Weaponized PDF Payloads',
      descAr: 'استغلال ثغرات مشغلات PDF لتشغيل أكواد جافاسكريبت أو استدعاء ملفات تنفيذية بمجرد فتح الملف.',
      descEn: 'Embedding malicious JavaScript actions or buffer-overflow exploits inside PDF structures.',
      exampleAr: 'ملف "كشف_حساب_محدث.pdf" يفتح نافذة سوداء ثوانٍ معدودة ويحقن برمجية تجسس.',
      exampleEn: 'Opening a statement PDF that triggers an unpatched vulnerability in outdated desktop readers.',
      defenseAr: 'عطل تشغيل JavaScript في قارئ الـ PDF وتأكد من تحديث قارئ الملفات باستمرار.',
      defenseEn: 'Disable Acrobat JavaScript execution and keep PDF viewing software continually patched.'
    },
    {
      id: 10,
      category: 'malicious_files',
      severity: 'critical',
      icon: <HardDrive className="w-5 h-5" />,
      titleAr: 'ماكرو الأوفيس الخبيث (Office Macro Injection)',
      titleEn: 'Malicious Office VBA Macros',
      descAr: 'ملفات Word أو Excel تطلب الضغط على "تمكين المحتوى" لتشغيل ماكرو يقوم بتحميل برمجيات الفدية.',
      descEn: 'Word/Excel documents prompting victims to "Enable Macros" to execute remote payload droppers.',
      exampleAr: 'ملف إكسل يزعم: "المحتوى محمي، اضغط تمكين المحتوى لعرض الجدول" لتفعيل الفيروس.',
      exampleEn: 'Excel document claiming content is encrypted and requiring macros enabled to decode.',
      defenseAr: 'لا توافق أبداً على "تمكين الماكرو" أو "تمكين المحتوى" لملف وارد من مصدر غير موثوق.',
      defenseEn: 'Never enable macro execution on documents received from external or unverified origins.'
    },
    {
      id: 11,
      category: 'malicious_files',
      severity: 'high',
      icon: <AlertTriangle className="w-5 h-5" />,
      titleAr: 'الامتدادات المخفية والعكسية (RTLO & Double Extension)',
      titleEn: 'Right-to-Left Override & Double Extensions',
      descAr: 'استخدام خدعة الحروف المعكوسة أو الامتدادات المزدوجة لإخفاء ملف .exe ليبدو كصورة أو مستند.',
      descEn: 'Using Unicode RTLO characters or double extensions (e.g. report.pdf.exe) to mask executables.',
      exampleAr: 'ملف يظهر باسم "Contract[exe.pdf]" لكنه في الحقيقة ملف تنفيذي خبيث.',
      exampleEn: 'A file named "document\u202Efdp.exe" displaying as "documentexe.pdf" in file explorers.',
      defenseAr: 'فعل خيار "إظهار امتدادات الملفات" في نظام ويندوز للتعرف على الامتداد الحقيقي دائماً.',
      defenseEn: 'Enable "Show file name extensions" in OS settings and inspect exact file properties.'
    },
    {
      id: 12,
      category: 'malicious_files',
      severity: 'critical',
      icon: <Smartphone className="w-5 h-5" />,
      titleAr: 'تطبيقات الـ APK الملغومة (Malicious Sideloading)',
      titleEn: 'Malicious Android APKs',
      descAr: 'تطبيقات أندرويد يتم تحميلها من خارج المتجر الرسمي تحتوي على أحصنة طروادة وسارقي البيانات المصرفية.',
      descEn: 'Third-party Android APK packages bundled with banking trojans and spy modules.',
      exampleAr: 'تطبيق باسم "واتساب الذهبي" أو "مشاهدة مباريات مجاناً" يطلب إذن قراءة الشاشة وسرقة الـ OTP.',
      exampleEn: 'Fake modded messaging app asking for Accessibility Service permissions to log banking logins.',
      defenseAr: 'حمل تطبيقاتك حصرياً من متجر Google Play الرسمي وتأكد من تعطيل "المصادر غير المعروفة".',
      defenseEn: 'Strictly prohibit sideloading APK files from unverified web portals.'
    },
    {
      id: 13,
      category: 'malicious_files',
      severity: 'high',
      icon: <Lock className="w-5 h-5" />,
      titleAr: 'الملفات المضغوطة بكلمة سر (Password-Protected ZIPs)',
      titleEn: 'Encrypted Archive Evasion',
      descAr: 'إرسال برمجيات خبيثة داخل ملف ZIP مشفر مع إرفاق كلمة السر في النص لتجاوز فحص مكافحات الفيروسات.',
      descEn: 'Sending passworded ZIPs to prevent gateway antivirus engines from inspecting internal payloads.',
      exampleAr: 'بريد يحتوي على ملف "Confidential.zip" ومكتوب بالرسالة: "الباسورد 1234".',
      exampleEn: 'Email with attached locked ZIP stating: "Password to extract is 2026" to evade gateway filters.',
      defenseAr: 'عامل الملفات المضغوطة المحمية بكلمات مرور كتهديد محتمل وقم بفحصها في بيئة معزولة (Sandbox).',
      defenseEn: 'Treat externally passworded archive files with extreme scrutiny and sandbox inspect them.'
    },
    {
      id: 14,
      category: 'malicious_files',
      severity: 'high',
      icon: <HardDrive className="w-5 h-5" />,
      titleAr: 'ملفات الأقراص الوهمية (ISO & IMG Containers)',
      titleEn: 'ISO & VHD Container Droppers',
      descAr: 'استخدام صيغ الأقراص الوهمية لتجاوز علامة الحماية الأمنية لنظام ويندوز (Mark-of-the-Web).',
      descEn: 'Distributing malware wrapped inside ISO image files to bypass MOTW trust warnings.',
      exampleAr: 'تنزيل ملف باسم "Invoice_March.iso" وبمجرد فتحه يقوم بتركيب قرص وهمي يحتوي على ملف تشغيل.',
      exampleEn: 'Downloading an ISO pretending to be a portfolio archive that bypasses smartscreen filters.',
      defenseAr: 'احظر تثبيت ملفات ISO و IMG الواردة عبر البريد الإلكتروني أو مصادر الويب المجهولة.',
      defenseEn: 'Block ISO/VHD file attachments at the email gateway boundary.'
    },
    {
      id: 15,
      category: 'malicious_files',
      severity: 'high',
      icon: <Zap className="w-5 h-5" />,
      titleAr: 'ملفات الاختصار المفخخة (LNK & Shortcut Exploits)',
      titleEn: 'Weaponized LNK Shortcuts',
      descAr: 'ملفات اختصار تبدو كمجلدات عادية لكنها تقوم بتشغيل أوامر PowerShell الخفية لتنزيل برمجيات ضارة.',
      descEn: 'Shortcut files disguised as harmless folders executing hidden PowerShell/CMD download cradles.',
      exampleAr: 'اختصار على فلاش USB يظهر كأنه مجلد مستندات وعند النقر عليه يشغل كوداً خفياً.',
      exampleEn: 'A folder shortcut executing "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden".',
      defenseAr: 'تحقق من نوع العنصر (Item Type) في خصائص الملف وتجنب فتح ملفات الاختصارات المجهولة.',
      defenseEn: 'Examine shortcut target paths and block unauthorized script execution policies.'
    },

    // 3. Voice AI & Vishing
    {
      id: 16,
      category: 'voice_ai',
      severity: 'critical',
      icon: <Volume2 className="w-5 h-5" />,
      titleAr: 'استنساخ الصوت بالذكاء الاصطناعي (AI Voice Cloning)',
      titleEn: 'Generative AI Voice Cloning',
      descAr: 'استخدام نماذج الذكاء الاصطناعي لتقليد نبرة صوت أحد أفراد العائلة أو المدير بدقة تامة وطلب أموال عاجلة.',
      descEn: 'Using deepfake voice cloning models to impersonate relatives or executives demanding emergency wire transfers.',
      exampleAr: 'اتصال هاتفي يبدو كأنه من ابنك يستغيث: "تعرضت لحادث وأحتاج تحويل 2000 دولار فوراً للمستشفى".',
      exampleEn: 'Audio call cloning a family member in distress begging for immediate emergency money transfer.',
      defenseAr: 'حدد كلمة سر عائلية سرية (Safe Word) لا يعلمها سواكم للتحقق في مثل هذه المواقف.',
      defenseEn: 'Establish an offline family challenge phrase (safe word) to authenticate emergency calls.'
    },
    {
      id: 17,
      category: 'voice_ai',
      severity: 'critical',
      icon: <Eye className="w-5 h-5" />,
      titleAr: 'مكالمات الفيديو بالديب فيك (Deepfake Video Calls)',
      titleEn: 'Real-Time Deepfake Video Conferences',
      descAr: 'تزييف الوجه والصوت في اجتماعات الفيديو الحية لانتحال صفة المدير المالي أو المورد لإصدار أوامر تحويل.',
      descEn: 'Manipulating real-time webcam streams in video calls to impersonate corporate officers.',
      exampleAr: 'مكالمة Teams يظهر فيها المدير التنفيذي يطلب من الموظف تحويل مالي سري فوري.',
      exampleEn: 'Virtual meeting showing the CFO ordering multi-million fund transfers to offshore accounts.',
      defenseAr: 'اطلب من المتصل الالتفات جانبياً أو لمس وجهه (لتخريب معالجة الذكاء الاصطناعي) واطلب تأكيداً رسمياً.',
      defenseEn: 'Ask the person to wave their hand across their face to reveal deepfake edge distortion artifacts.'
    },
    {
      id: 18,
      category: 'voice_ai',
      severity: 'high',
      icon: <Volume2 className="w-5 h-5" />,
      titleAr: 'انتحال موظفي البنك هاتفياً (Bank Vishing)',
      titleEn: 'Bank Staff Impersonation Vishing',
      descAr: 'اتصال من رقم هاتف مضلل يزعم ممثله أنه من وحدة مكافحة الاحتيال في البنك لحمايتك وسرقة كودك.',
      descEn: 'Callers impersonating fraud prevention units asking for OTP codes under the guise of stopping fraud.',
      exampleAr: 'مكالمة: "نحن قسم أمان البنك، هناك محاولة سحب 5000 ريال، أعطني كود التحقق لإلغائها".',
      exampleEn: 'Caller: "We detected an unauthorized charge, read back the SMS verification code to block it".',
      defenseAr: 'أغلق المكالمة فوراً وتواصل بنفسك مع البنك عبر الرقم الرسمي المطبوع خلف بطاقتك الائتمانية.',
      defenseEn: 'Hang up and initiate direct contact through the official customer support number on your payment card.'
    },
    {
      id: 19,
      category: 'voice_ai',
      severity: 'high',
      icon: <Cpu className="w-5 h-5" />,
      titleAr: 'مكالمات الدعم الفني الوهمي (Tech Support Vishing)',
      titleEn: 'Fake Tech Support Scams',
      descAr: 'اتصال يدعي المتحدث فيه أنه من شركة مايكروسوفت أو أبل لإصلاح فيروس خطير في جهازك عن بُعد.',
      descEn: 'Scammers claiming your computer is compromised and demanding remote desktop access to "fix" it.',
      exampleAr: 'المتصل يطلب منك تحميل برنامج AnyDesk أو TeamViewer للتحكم بجهازك وسرقة كلمات السر.',
      exampleEn: 'Instructing victim to install remote desktop tools to "diagnose critical Windows server errors".',
      defenseAr: 'الشركات التقنية العالمية لا تتصل بالمستخدمين هاتفياً لإصلاح أجهزتهم أبداً.',
      defenseEn: 'Legitimate OS vendors never proactively call consumers regarding desktop diagnostics.'
    },
    {
      id: 20,
      category: 'voice_ai',
      severity: 'medium',
      icon: <Radio className="w-5 h-5" />,
      titleAr: 'المكالمات الآلية لجمع البيانات (Robocall Data Harvester)',
      titleEn: 'Automated Robocall Reconnaissance',
      descAr: 'مكالمات آلية مسجلة تطلب الضغط على أرقام محددة للتأكد من أن رقمك نشط وجمع نبرة صوتك لاستخدامها.',
      descEn: 'Automated robocalls testing active numbers and recording voice responses for voice biometric theft.',
      exampleAr: 'سؤال آلي: "هل تسمعني بوضوح؟" لجعلك تجيب بكلمة "نعم" واستخدام تسجيلك لاحقاً.',
      exampleEn: 'Robocall asking: "Can you hear me?" to capture audio recordings of the victim saying "Yes".',
      defenseAr: 'لا تجب بكلمات تأكيدية على المكالمات الآلية المشبوهة وأنهِ الاتصال فوراً.',
      defenseEn: 'Avoid affirmative one-word responses to unknown automated callers; terminate promptly.'
    },
    {
      id: 21,
      category: 'voice_ai',
      severity: 'medium',
      icon: <Smartphone className="w-5 h-5" />,
      titleAr: 'تزييف بدالة الهاتف التفاعلية (IVR Spoofing)',
      titleEn: 'Spoofed Interactive Voice Response (IVR)',
      descAr: 'توجيه الضحية للاتصال برقم هاتف يشغل نظام رد آلي بنكي مزيف يطلب كتابة رقم الحساب والرقم السري.',
      descEn: 'Routing targets to counterfeit automated IVR phone systems prompting PIN and card number inputs.',
      exampleAr: 'رسالة تفيد بوجود شحنة وتطلب الاتصال ببدالة آلية تطلب إدخال رقم بطاقة الدفع.',
      exampleEn: 'Prompting victims to call a toll-free number running a mock bank automated voice switchboard.',
      defenseAr: 'لا تدخل أرقامك السرية أو بيانات بطاقتك في أي بدالة هاتفية لم تتصل بها من الرقم الرسمي.',
      defenseEn: 'Never enter banking credentials into telephone menus dialed from unsolicited SMS prompts.'
    },

    // 4. Mobile & SMS (Smishing)
    {
      id: 22,
      category: 'mobile_sms',
      severity: 'critical',
      icon: <Smartphone className="w-5 h-5" />,
      titleAr: 'رسائل الشحنات والطرود المعلقة (Package Delivery Smishing)',
      titleEn: 'Package Delivery Smishing (DHL/FedEx/Aramex)',
      descAr: 'رسائل نصية قصيرة SMS تزعم أن لديك طرداً يحتاج لتحديث العنوان أو دفع رسوم جمركية بسيطة لسرقة البطاقة.',
      descEn: 'SMS alerts claiming a package is delayed pending minimal customs payment to steal card data.',
      exampleAr: 'رسالة: "طردك رقم #892 معلق، يرجى دفع 3 دولارات عبر هذا الرابط لتأكيد التوصيل".',
      exampleEn: 'SMS: "Your parcel requires updated delivery address and $1.50 fee, click to confirm".',
      defenseAr: 'تتبع شحناتك فقط عبر الموقع الرسمي لشركة الشحن أو تطبيقها وليس عبر روابط الرسائل القصيرة.',
      defenseEn: 'Track packages directly via carrier official mobile apps or verified tracking portals.'
    },
    {
      id: 23,
      category: 'mobile_sms',
      severity: 'critical',
      icon: <Key className="w-5 h-5" />,
      titleAr: 'حيل سرقة رمز التحقق المؤقت (OTP Interception Scam)',
      titleEn: 'One-Time Password (OTP) Social Engineering',
      descAr: 'محاولة إقناعك بإرسال أو قراءة رمز الـ OTP الذي وصلك بحجة تحديث البيانات أو إلغاء مسابقة.',
      descEn: 'Coercing victims into revealing multi-factor authentication SMS codes under false pretenses.',
      exampleAr: 'رسالة من شخص يدعي أنه قريبك: "أرسلت لك كود بالخطأ، يرجى إرساله لي ضرورياً".',
      exampleEn: 'Message from a compromised contact: "I mistakenly sent my verification code to your phone, please share it".',
      defenseAr: 'رمز الـ OTP سري للغاية ولا تشاركه مع أي شخص كائناً من كان حتى لو ادعى أنه من جهة أمنية.',
      defenseEn: 'Never disclose one-time SMS verification passwords under any circumstances.'
    },
    {
      id: 24,
      category: 'mobile_sms',
      severity: 'medium',
      icon: <Users className="w-5 h-5" />,
      titleAr: 'روابط مجموعات التواصل الوهمية (Fake Group Invitation Links)',
      titleEn: 'Malicious Chat Group Invitations',
      descAr: 'روابط دعوة لمجموعات واتساب أو تليجرام وهمية تستخدم لجمع أرقام الهواتف أو توزيع روابط تصيد.',
      descEn: 'Deceptive WhatsApp/Telegram group join links used for reconnaissance and malware distribution.',
      exampleAr: 'رسالة: "انضم لمجموعة توزيع المنح والمساعدات" مع رابط يطلب إدخال رقم هاتفك وتأكيده.',
      exampleEn: 'Invite link claiming to be an exclusive crypto trading signal group that steals session keys.',
      defenseAr: 'لا تنضم لمجموعات مجهولة ولا تضغط على روابط دعوة مرسلة من أرقام غير مسجلة في هاتفك.',
      defenseEn: 'Do not join untrusted public chat groups or click invite links from unknown senders.'
    },
    {
      id: 25,
      category: 'mobile_sms',
      severity: 'high',
      icon: <AlertTriangle className="w-5 h-5" />,
      titleAr: 'رسائل الشاشة الفورية المربكة (Flash SMS / Class 0 Spoof)',
      titleEn: 'Flash SMS / Class 0 Popup Attacks',
      descAr: 'رسائل تظهر مباشرة على شاشة الهاتف دون تخزينها في صندوق الوارد لإرباك المستخدم وجعله ينقر عليها.',
      descEn: 'Class 0 Flash SMS displaying full-screen over apps without saving to standard messaging inboxes.',
      exampleAr: 'رسالة تملأ الشاشة تفيد بـ "تحديث أمني عاجل لشريحة SIM اضغط موافق".',
      exampleEn: 'Full-screen system notification claiming cellular operator SIM card reconfiguration required.',
      defenseAr: 'تجاهل الرسائل الفورية المنبثقة ولا تتفاعل مع الأوامر المباشرة وافتح تطبيق الرسائل الأصلي.',
      defenseEn: 'Dismiss full-screen flash prompts and verify account notices inside official telecom apps.'
    },
    {
      id: 26,
      category: 'mobile_sms',
      severity: 'high',
      icon: <QrCode className="w-5 h-5" />,
      titleAr: 'رموز الـ QR الملغومة في الأماكن العامة (QRishing)',
      titleEn: 'QR Code Phishing (QRishing)',
      descAr: 'لصق رموز QR مزيفة فوق الرموز الحقيقية في المطاعم ومواقف السيارات لتوجيه الضحايا لمواقع دفع مزيفة.',
      descEn: 'Sticking physical malicious QR code overlays over authentic parking meters and restaurant menus.',
      exampleAr: 'مسح رمز QR لدفع تذكرة الموقف فيقودك لصفحة دفع مزيفة تسحب أموالاً من بطاقتك.',
      exampleEn: 'Scanning a compromised QR code on a public kiosk directing to an credential-harvesting web page.',
      defenseAr: 'تحقق من عدم وجود ملصق فوق رمز الـ QR الأصلي وتأكد من عنوان الرابط المعروض في الكاميرا قبل فتحه.',
      defenseEn: 'Verify physical stickers have not been placed over original signs and preview previewed URLs.'
    },
    {
      id: 27,
      category: 'mobile_sms',
      severity: 'critical',
      icon: <Smartphone className="w-5 h-5" />,
      titleAr: 'حيل تحويل المكالمات لسرقة الحسابات (Call Forwarding Hijack)',
      titleEn: 'Call Forwarding (*21*) Hijacking',
      descAr: 'خداع الضحية للاتصال بكود يبدأ بـ *21* متبوعاً برقم هاتف المهاجم، مما يحول مكالمات التحقق للمخترق.',
      descEn: 'Tricking victims into dialing MMI codes (e.g. *21*number#) that forward verification calls to attackers.',
      exampleAr: 'رسالة: "اتصل بالكود *21*05xxxxxxx# لتفعيل جائزة الإنترنت المجاني".',
      exampleEn: 'Prompting target to enter an MMI string disguised as a data-plan giveaway code.',
      defenseAr: 'لا تطلب أي كود اتصال يحتوي على * أو # يطلبه منك شخص مجهول.',
      defenseEn: 'Never dial carrier MMI/USSD string sequences suggested by unsolicited parties.'
    },

    // 5. Baiting & Psychological Exploits
    {
      id: 28,
      category: 'baiting_psych',
      severity: 'high',
      icon: <Flame className="w-5 h-5" />,
      titleAr: 'فخ الطعم والجوائز الوهمية (Baiting Scams)',
      titleEn: 'Baiting & Free Reward Traps',
      descAr: 'وعد الضحية بجائزة مغرية (هاتف مجاني، ألعاب، بطاقات تسوق) مقابل إدخال بياناته أو تنزيل ملف.',
      descEn: 'Promising appealing incentives (free giveaways, cracked apps) in exchange for downloading malware.',
      exampleAr: 'إعلان: "أنت الرابح رقم 1000 بهاتف iPhone مجاني، انقر هنا لتسجيل بيانات الشحن".',
      exampleEn: 'Popup stating: "You won a complimentary flagship smartphone, fill in shipping details".',
      defenseAr: 'تذكر دائماً: إذا كان العرض يبدو جيداً بدرجة لا تصدق، فهو احتيال بنسبة 100%.',
      defenseEn: 'Adhere to zero-trust skepticism: unprompted giveaways and luxury prizes are scams.'
    },
    {
      id: 29,
      category: 'baiting_psych',
      severity: 'medium',
      icon: <HelpCircle className="w-5 h-5" />,
      titleAr: 'الهجوم بدافع المساعدة (Quid Pro Quo)',
      titleEn: 'Quid Pro Quo Exploitation',
      descAr: 'تقديم خدمة أو مساعدة تبدو مفيدة مقابل الحصول على معلومات حساسة أو تعطيل إعدادات الأمان.',
      descEn: 'Offering a seemingly helpful service or assistance in return for sensitive corporate access.',
      exampleAr: 'شخص يدعي أنه مهندس شبكات يعرض تسريع الإنترنت لديك بشرط تعطيل الجدار الناري.',
      exampleEn: 'Attacker posing as network technician offering system speedup if you disable antivirus shields.',
      defenseAr: 'لا تقبل أي مساعدة تقنية غير مطلوبة ولا تعطل برامج الحماية بناءً على نصيحة غرباء.',
      defenseEn: 'Reject unsolicited tech assistance and never deactivate security countermeasures.'
    },
    {
      id: 30,
      category: 'baiting_psych',
      severity: 'high',
      icon: <Users className="w-5 h-5" />,
      titleAr: 'هجوم الذريعة والسيناريو المفبرك (Pretexting)',
      titleEn: 'Pretexting Scenarios',
      descAr: 'اختلاق قصة وسياق درامي مقنع لانتحال صفة رسمية (محقق، مدقق حسابات، مسؤول شؤون قانونية).',
      descEn: 'Fabricating a sophisticated fictional backstory to extract restricted records or credentials.',
      exampleAr: 'اتصال يدعي أنه من إدارة التحقيقات الضريبية ويطلب كشف حسابات فورياً لتفادي الغرامة.',
      exampleEn: 'Attacker acting as a regulatory auditor requesting internal personnel rosters.',
      defenseAr: 'اطلب دائماً إثبات هوية رسمي وتحقق من خلال القنوات الرسمية قبل الإفصاح عن أي معلومة.',
      defenseEn: 'Demand verifiable enterprise credentials and consult institutional compliance channels.'
    },
    {
      id: 31,
      category: 'baiting_psych',
      severity: 'high',
      icon: <Building className="w-5 h-5" />,
      titleAr: 'عروض التوظيف الوهمية (Fake Job Offers)',
      titleEn: 'Employment & Recruitment Scams',
      descAr: 'نشر عروض عمل برواتب خيالية لجمع الهويات الشخصية وبطاقات الهوية أو إرسال شيكات بدون رصيد.',
      descEn: 'Fictitious high-salary job postings designed to harvest personal identities and banking IDs.',
      exampleAr: 'عرض عمل عن بعد براتب 5000 دولار أسبوعياً ويطلب صورة جواز السفر ورقم الحساب البنكي.',
      exampleEn: 'Remote job posting requesting copies of passports and bank routing information on day one.',
      defenseAr: 'قدم للوظائف فقط عبر مواقع الشركات الرسمية ومنصة LinkedIn وتجنب العروض المبالغ فيها.',
      defenseEn: 'Apply solely through verified career portals and corporate recruitment channels.'
    },
    {
      id: 32,
      category: 'baiting_psych',
      severity: 'critical',
      icon: <AlertTriangle className="w-5 h-5" />,
      titleAr: 'استغلال الذعر والعجلة (Urgency & Panic Tactics)',
      titleEn: 'Urgency & Fear Exploitation',
      descAr: 'بث الرعب في نفس الضحية بوجود خطر داهم يستوجب التصرف خلال دقائق لمنعه من التفكير المنطقي.',
      descEn: 'Inducing artificial urgency to panic victims into bypassing critical thinking and checks.',
      exampleAr: 'إنذار: "سيتم حذف جميع ملفاتك وحظر هويتك خلال 10 دقائق إذا لم تضغط هنا".',
      exampleEn: 'Countdown timer warning: "Your cloud drives will be permanently erased in 5 minutes".',
      defenseAr: 'عندما تشعر بالضغط والتوتر في رسالة، توقف فوراً، فالعجلة المتعمدة هي السمة الأبرز للاحتيال.',
      defenseEn: 'Pause and reflect when experiencing artificial urgency; panic is the social engineer\'s primary lever.'
    },
    {
      id: 33,
      category: 'baiting_psych',
      severity: 'medium',
      icon: <Flame className="w-5 h-5" />,
      titleAr: 'استغلال الكوارث والتبرعات الوهمية (Crisis & Charity Scams)',
      titleEn: 'Disaster Relief & Fake Charity Frauds',
      descAr: 'استغلال التعاطف الإنساني أثناء الزلازل أو الحروب لجمع تبرعات وهمية عبر محافظ رقمية مجهولة.',
      descEn: 'Exploiting global humanitarian crises to solicit fraudulent donations to attacker-controlled wallets.',
      exampleAr: 'حملة تبرع عاجلة لضحايا كارثة طبيعية تطلب إرسال مبالغ عبر عملات مشفرة أو بطاقات هدايا.',
      exampleEn: 'Social media post soliciting crypto donations for natural disaster relief victims.',
      defenseAr: 'تبرع حصرياً عبر المنصات الخيرية الرسمية المعتمدة من الدولة.',
      defenseEn: 'Donate strictly via accredited governmental charity organizations and registered foundations.'
    },

    // 6. Physical Threats
    {
      id: 34,
      category: 'physical',
      severity: 'critical',
      icon: <HardDrive className="w-5 h-5" />,
      titleAr: 'إلقاء وحدات USB المفخخة (Malicious USB Drop)',
      titleEn: 'Malicious USB Drop Attacks',
      descAr: 'ترك فلاشات USB ملغومة في مواقف سيارات الشركات أو الممرات لجعل الموظفين الفضوليين يوصلونها بأجهزتهم.',
      descEn: 'Scattering infected USB flash drives in parking lots hoping curious employees plug them into corporate PCs.',
      exampleAr: 'فلاش USB مكتوب عليه "كشف رواتب الإدارة 2026" ملقى قرب مدخل الشركة.',
      exampleEn: 'Branded USB stick labeled "Executive Bonuses Q3" left intentionally in corporate elevator lobbies.',
      defenseAr: 'لا توصل أي وحدة تخزين مجهولة بجهازك وقم بتسليمها مباشرة لفريق أمن المعلومات.',
      defenseEn: 'Never plug untrusted flash media into computing hardware; surrender found media to SecOps.'
    },
    {
      id: 35,
      category: 'physical',
      severity: 'high',
      icon: <Building className="w-5 h-5" />,
      titleAr: 'تتبع الدخول للمنشآت (Tailgating / Piggybacking)',
      titleEn: 'Physical Tailgating / Piggybacking',
      descAr: 'تتبع موظف مصرح له للدخول عبر الأبواب الإلكترونية المحمية دون تمرير بطاقة الدخول الخاصة.',
      descEn: 'Following authorized staff through secure badge-access doors without presenting credentials.',
      exampleAr: 'شخص يرتدي زي عامل توصيل يحمل صناديق ثقيلة ويطلب منك إبقاء الباب مفتوحاً له.',
      exampleEn: 'An individual carrying heavy parcels requesting employees hold open access-controlled doors.',
      defenseAr: 'التزم بسياسة "الباب المغلق" وتأكد من أن كل شخص يمرر بطاقته المصرحة بمفرده.',
      defenseEn: 'Enforce strict single-entry turnstile policies and mandate individual badge authentication.'
    },
    {
      id: 36,
      category: 'physical',
      severity: 'medium',
      icon: <Eye className="w-5 h-5" />,
      titleAr: 'التلصص البصري على الشاشات (Shoulder Surfing)',
      titleEn: 'Shoulder Surfing',
      descAr: 'النظر خلسة إلى شاشة جهاز الضحية أو لوحة المفاتيح في المقاهي والقطارات لحفظ كلمات المرور.',
      descEn: 'Direct visual observation of screens or keyboard entries in public settings to steal credentials.',
      exampleAr: 'شخص يقف خلفك في كافيه ويسجل حركات أصابعك أثناء كتابة الرقم السري للبطاقة أو الهاتف.',
      exampleEn: 'Bystander recording your keystrokes and authentication PINs in busy public airports.',
      defenseAr: 'استخدم شاشات حماية الخصوصية (Privacy Filters) وتجنب فتح بيانات حساسة في الأماكن العامة.',
      defenseEn: 'Install polarized screen privacy filters and shield your keypad inputs during authentication.'
    },
    {
      id: 37,
      category: 'physical',
      severity: 'medium',
      icon: <Layers className="w-5 h-5" />,
      titleAr: 'البحث في مهملات الأوراق (Dumpster Diving)',
      titleEn: 'Dumpster Diving for Discarded Intel',
      descAr: 'النبش في حاويات مهملات المؤسسات لجمع مستندات مطبوعة أو فواتير أو مسودات كلمات مرور مهملة.',
      descEn: 'Rummaging through corporate refuse bins to recover discarded confidential records or credentials.',
      exampleAr: 'العثور على كشف بأسماء الموظفين وأرقامهم الداخلية ملقى في سلة مهملات خارجية.',
      exampleEn: 'Locating printed network topology diagrams and staff directories in unrecycled trash.',
      defenseAr: 'استخدم دائماً آلات تمزيق الورق (Shredders) لإتلاف كافة المستندات والمسودات قبل رميها.',
      defenseEn: 'Mandate cross-cut shredding for all physical documentation prior to disposal.'
    },
    {
      id: 38,
      category: 'physical',
      severity: 'critical',
      icon: <Radio className="w-5 h-5" />,
      titleAr: 'شبكات الواي فاي العامة المزيفة (Evil Twin Access Points)',
      titleEn: 'Evil Twin Rogue Wi-Fi Networks',
      descAr: 'إنشاء شبكة واي فاي مجانية بنفس اسم شبكة المطار أو الفندق لاعتراض وسرقة كافة البيانات والاتصالات.',
      descEn: 'Broadcasting a rogue Wi-Fi hotspot with an identical SSID to intercept transmitted traffic.',
      exampleAr: 'الاتصال بشبكة باسم "Airport_Free_WiFi" يديرها مخترق يتجسس على كلمات مرورك.',
      exampleEn: 'Connecting to a public hotspot that proxies all traffic through a man-in-the-middle sniffer.',
      defenseAr: 'استخدم دائماً VPN مشفر ولا تتصل بشبكات مفتوحة بدون كلمة مرور في الأماكن العامة.',
      defenseEn: 'Always route traffic through trusted VPN tunnels when utilizing public Wi-Fi networks.'
    },
    {
      id: 39,
      category: 'physical',
      severity: 'high',
      icon: <Zap className="w-5 h-5" />,
      titleAr: 'منافذ الشحن العامة الملغومة (Juice Jacking)',
      titleEn: 'Juice Jacking Charging Stations',
      descAr: 'تعديل منافذ كابلات USB في المطارات والمقاهي لنقل برمجيات خبيثة إلى هاتفك أثناء شحنه.',
      descEn: 'Compromised public USB charging ports modified to install malware or extract data over USB pins.',
      exampleAr: 'توصيل الهاتف بمنفذ USB في كشك شحن عام فيتم سحب الصور وجهات الاتصال تلقائياً.',
      exampleEn: 'Plugging into a wall USB port that initiates an unauthorized MTP data synchronization.',
      defenseAr: 'استخدم الشاحن الخاص بك مع مقبس الكهرباء الجداري أو استخدم واقي USB (Data Blocker).',
      defenseEn: 'Utilize dedicated AC power adapters or USB data-blocker adapters that sever data pins.'
    },

    // 7. Corporate & BEC Attacks
    {
      id: 40,
      category: 'corporate_bec',
      severity: 'critical',
      icon: <Building className="w-5 h-5" />,
      titleAr: 'اختراق البريد التجاري (Business Email Compromise - BEC)',
      titleEn: 'Business Email Compromise (BEC)',
      descAr: 'اختراق حساب بريد مسؤول مالي أو انتحاله لمخاطبة الموظفين وتغيير وجهة الحوالات المصرفية.',
      descEn: 'Compromising or spoofing executive email accounts to redirect vendor payments and wire transfers.',
      exampleAr: 'إيميل من المدير المالي: "تم تغيير الحساب البنكي للمورد، يرجى سداد الفاتورة للحساب الجديد".',
      exampleEn: 'Email appearing from the VP requesting immediate payroll batch redirection to a new IBAN.',
      defenseAr: 'فرض سياسة التأكيد الصوتي المباشر والتحقق الثنائي قبل تغيير أي حساب بنكي في النظام.',
      defenseEn: 'Enforce mandatory verbal dual-authorization protocols before modifying banking payment instructions.'
    },
    {
      id: 41,
      category: 'corporate_bec',
      severity: 'critical',
      icon: <Users className="w-5 h-5" />,
      titleAr: 'انتحال هوية الموردين والشركاء (Vendor Impersonation)',
      titleEn: 'Vendor & Supply Chain Impersonation',
      descAr: 'استغلال المعاملات المالية المعتادة للموردين وإرسال فواتير مطابقة بفارق رقم الحساب البنكي.',
      descEn: 'Impersonating trusted third-party suppliers and submitting legitimate-looking invoices with altered bank details.',
      exampleAr: 'فاتورة صيانة بنفس شعار الشركة الموردة لكنها تحمل حساباً مصرفياً تابعاً للمهاجم.',
      exampleEn: 'Receiving monthly cloud hosting invoices containing fraudulent international wire coordinates.',
      defenseAr: 'راجع معلومات الفواتير مع جهة الاتصال المعتمدة والمسجلة في العقد الرسمي فقط.',
      defenseEn: 'Cross-reference invoicing remittance coordinates against signed master service agreements.'
    },
    {
      id: 42,
      category: 'corporate_bec',
      severity: 'critical',
      icon: <Building className="w-5 h-5" />,
      titleAr: 'احتيال المدير التنفيذي (CEO Fraud)',
      titleEn: 'CEO Fraud & Executive Impersonation',
      descAr: 'إرسال رسائل عاجلة وسرية منسوبة للمدير التنفيذي تطلب من الموظف تحويل مالي سري لصفقة استحواذ.',
      descEn: 'Pretending to be the CEO requesting confidential, off-the-books emergency fund disbursement.',
      exampleAr: 'رسالة: "أنا في اجتماع سري، أحتاج تحويل 100 ألف دولار فوراً لإتمام صفقة ولا تخبر أحداً".',
      exampleEn: 'Message: "I am in a confidential acquisition session, wire $50,000 immediately without standard routing".',
      defenseAr: 'لا تستثنِ أي عملية تحويل من الإجراءات المالية القياسية مهما كانت رتبة المسؤول الطالب.',
      defenseEn: 'Never circumvent standard financial controls regardless of organizational hierarchy level.'
    },
    {
      id: 43,
      category: 'corporate_bec',
      severity: 'high',
      icon: <Globe2 className="w-5 h-5" />,
      titleAr: 'هجمات حفرة الماء (Watering Hole Attack)',
      titleEn: 'Watering Hole Targeting',
      descAr: 'اختراق المواقع والمنتديات التي يرتادها موظفو قطاع معين (مثل مواقع المهندسين) وحقنها ببرمجيات خبيثة.',
      descEn: 'Compromising third-party niche websites frequently visited by targeted industry professionals.',
      exampleAr: 'اختراق منتدى استشاري لموظفي النفط والغاز لتنزيل فيروسات في أجهزة زواره.',
      exampleEn: 'Injecting browser zero-day exploit kits into a regional defense contractor forum.',
      defenseAr: 'استخدم متصفحات معزولة وفلاتر أمان الويب المحدثة لمنع تشغيل الأكواد الخبيثة.',
      defenseEn: 'Deploy enterprise browser isolation (RBI) and content inspection gateways.'
    },
    {
      id: 44,
      category: 'corporate_bec',
      severity: 'high',
      icon: <Zap className="w-5 h-5" />,
      titleAr: 'إضافات المتصفح المشبوهة (Rogue Browser Extensions)',
      titleEn: 'Malicious Browser Add-ons & Extensions',
      descAr: 'تطوير إضافات متصفح تبدو مفيدة (مثل تعديل ملفات PDF) تقوم بسرقة بيانات التصفح وكلمات المرور.',
      descEn: 'Browser extensions performing unauthorized keylogging and exfiltrating active session tokens.',
      exampleAr: 'إضافة "ترجمة فورية مجانية" تسجل كافة البيانات التي تكتبها في صفحات الدخول والبريد.',
      exampleEn: 'A free screen capture add-on that quietly uploads browser cookie stores to command servers.',
      defenseAr: 'ثبت فقط الإضافات المعتمدة وراجع الأذونات المطلوبة كإذن "قراءة وتعديل كافة بياناتك".',
      defenseEn: 'Restrict browser extension installations through centralized endpoint group policies.'
    },
    {
      id: 45,
      category: 'corporate_bec',
      severity: 'high',
      icon: <Cpu className="w-5 h-5" />,
      titleAr: 'إشعارات التحديث الوهمية (Fake Software Update Popups)',
      titleEn: 'Fake Browser / Software Updates',
      descAr: 'نوافذ منبثقة على المواقع تزعم أن متصفحك أو برنامج تشغيل الصوت قديم ويجب تحديثه لتشغيل برمجية خبيثة.',
      descEn: 'Web overlay popups asserting your browser is out-of-date to deliver trojanized update installers.',
      exampleAr: 'نافذة: "يجب تحديث مشغل Chrome لمشاهدة هذا الفيديو" وملف التحديث هو فيروس فدية.',
      exampleEn: 'Popup declaring: "Critical video codec update required to view page content".',
      defenseAr: 'حدث برامجك ومتصفحاتك فقط من خلال قائمة الإعدادات الداخلية للبرنامج نفسه.',
      defenseEn: 'Only execute software updates initiated directly from native application preference menus.'
    },

    // 8. Identity & Session Attacks
    {
      id: 46,
      category: 'identity_auth',
      severity: 'critical',
      icon: <Key className="w-5 h-5" />,
      titleAr: 'إرهاق المصادقة الثنائية (MFA Fatigue / Prompt Bombing)',
      titleEn: 'MFA Fatigue & Push Bombing',
      descAr: 'إرسال عشرات إشعارات الموافقة على الدخول لهاتفك في منتصف الليل حتى تضغط "موافق" لوقف الإزعاج.',
      descEn: 'Bombarding victims with consecutive authentication push notifications until they inadvertently accept.',
      exampleAr: 'تلقي 40 إشعار طلب تسجيل دخول متتالي في الساعة 3 صباحاً مع اتصال يدعي أنه للدعم الفني.',
      exampleEn: 'Spamming Duo/Okta push notifications continuously until the user approves out of frustration.',
      defenseAr: 'لا توافق أبداً على طلب لم تبدأه أنت وقم بتغيير كلمة سر حسابك فوراً وأبلغ فريق الأمن.',
      defenseEn: 'Deny all unprompted push alerts immediately and report the security event to IT.'
    },
    {
      id: 47,
      category: 'identity_auth',
      severity: 'critical',
      icon: <Lock className="w-5 h-5" />,
      titleAr: 'سرقة ملفات تعريف الجلسات (Session Hijacking via Infostealers)',
      titleEn: 'Session Cookie Hijacking',
      descAr: 'سرقة ملفات الكوكيز وجلسات تسجيل الدخول النشطة من المتصفح للدخول لحساباتك دون الحاجة لكلمة السر أو 2FA.',
      descEn: 'Extracting decrypted session cookies from browser profiles to hijack active accounts without MFA.',
      exampleAr: 'تنزيل كراك لعبة يقوم بسحب ملفات تعريف الارتباط لجلسات Google و GitHub و Telegram.',
      exampleEn: 'Malware extracting Chromium session databases and uploading tokens to threat actor Telegram bots.',
      defenseAr: 'سجل الخروج بانتظام وتجنب حفظ كلمات المرور في المتصفح واستخدم مديري كلمات السر المعتمدين.',
      defenseEn: 'Regularly terminate active cloud sessions and avoid saving sensitive vault secrets in plaintext browsers.'
    },
    {
      id: 48,
      category: 'identity_auth',
      severity: 'critical',
      icon: <Globe2 className="w-5 h-5" />,
      titleAr: 'التصيد بالبروكسي العكسي (Reverse Proxy Phishing / Evilginx)',
      titleEn: 'Adversary-in-the-Middle (AiTM) / Reverse Proxy',
      descAr: 'توجيه المستخدم لصفحة وسيطة تقوم بتمرير البيانات الحقيقية لموقع Google أو Microsoft واعتراض كود الـ 2FA لحظياً.',
      descEn: 'Proxied phishing frameworks relaying live authentication traffic to intercept 2FA session cookies.',
      exampleAr: 'صفحة تبدو متصلة بموقع مايكروسوفت الحقيقي وتطلب كود التحقق وترسل لك جلسة مسجلة فعلياً.',
      exampleEn: 'AiTM portal intercepting Microsoft 365 login and session token simultaneously in real-time.',
      defenseAr: 'استخدم مفاتيح الأمان المادية (FIDO2 / YubiKey) المقاومة للتصيد الإلكتروني والبروكسي العكسي.',
      defenseEn: 'Deploy FIDO2/WebAuthn hardware security keys that enforce cryptographic origin binding.'
    },
    {
      id: 49,
      category: 'identity_auth',
      severity: 'high',
      icon: <AlertTriangle className="w-5 h-5" />,
      titleAr: 'نوافذ الإنذار الأمني الوهمية (Fake Antivirus Popups)',
      titleEn: 'Scareware & Fake Security Warning Overlays',
      descAr: 'شاشات حمراء بصوت إنذار تزعم إصابة جهازك بـ 5 فيروسات خطيرة وتطلب الاتصال برقم هاتف فوراً.',
      descEn: 'Full-screen loud warning banners declaring immediate malware infections and demanding support calls.',
      exampleAr: 'صفحة تغلق الشاشة وتطلق صوتاً مزعجاً: "جهازك مخترق! اتصل برقم الدعم 1-800 لإصلاحه".',
      exampleEn: 'Browser locked in fullscreen with audio siren urging call to an offshore fraud call center.',
      defenseAr: 'اضغط مفتاح ESC أو أغلق المتصفح عبر مدير المهام (Task Manager) ولا تتصل بالأرقام المعروضة.',
      defenseEn: 'Force-close the browser process via Task Manager and never call numbers displayed on web banners.'
    },
    {
      id: 50,
      category: 'identity_auth',
      severity: 'medium',
      icon: <HelpCircle className="w-5 h-5" />,
      titleAr: 'استغلال أسئلة الأمان والسوشيال ميديا (Account Recovery Exploit)',
      titleEn: 'Social Media Reconnaissance & Security Question Guessing',
      descAr: 'جمع إجابات أسئلة الأمان (اسم مدرستك، حي نشأتك، نوع أول سيارة) من منشوراتك العامة على فيسبوك وتويتر.',
      descEn: 'Harvesting public personal life details from social media profiles to bypass account security question reset flows.',
      exampleAr: 'المهاجم يطلب استعادة حسابك ويجيب على سؤال "ما هو اسم حيوانك الأليف؟" من صورة نشرتها على إنستغرام.',
      exampleEn: 'Answering account reset prompts by analyzing the target\'s Instagram posts.',
      defenseAr: 'ضع إجابات عشوائية لا تمت للواقع بصلة لأسئلة الأمان واحفظها في مدير كلمات المرور فقط.',
      defenseEn: 'Treat security questions like secondary passwords: use randomized, non-factual passphrases.'
    }
  ];

  const filteredThreats = useMemo(() => {
    return threats.filter((t) => {
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      const matchesSeverity = selectedSeverity === 'all' || t.severity === selectedSeverity;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.titleAr.toLowerCase().includes(q) ||
        t.titleEn.toLowerCase().includes(q) ||
        t.descAr.toLowerCase().includes(q) ||
        t.descEn.toLowerCase().includes(q) ||
        t.exampleAr.toLowerCase().includes(q) ||
        t.defenseAr.toLowerCase().includes(q);

      return matchesCategory && matchesSeverity && matchesSearch;
    });
  }, [searchQuery, selectedCategory, selectedSeverity]);

  const downloadCurriculumPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(30, 27, 75);
    doc.text('SM Cyber Defense - 50 Social Engineering Threats', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Comprehensive Curriculum | Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    const tableRows = threats.map((item) => [
      `#${item.id}`,
      item.titleEn,
      item.severity.toUpperCase(),
      item.descEn,
      item.defenseEn
    ]);

    autoTable(doc, {
      startY: 34,
      head: [['ID', 'Threat Type', 'Severity', 'Mechanism', 'Defense Strategy']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8 },
    });

    doc.save('SM_50_Social_Engineering_Threats_Guide.pdf');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Hero Banner with Circular Identity Badge */}
      <div className="relative bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Prominent Circular Logo Badge */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-rose-500 p-0.5 shadow-xl shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black uppercase tracking-widest text-indigo-300 w-fit">
                <span>50 Attack Vectors & Defenses</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight">
                {lang === 'ar' ? 'موسوعة الهندسة الاجتماعية والأمان الرقمي' : 'Social Engineering Defense Encyclopedia'}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                {lang === 'ar'
                  ? 'دليل شامل يضم 50 تكتيكاً من أساليب التلاعب النفسي والاحتيال الرقمي والروابط والملفات المفخخة مع خطط الحماية العملية.'
                  : 'A comprehensive encyclopedia of 50 advanced social engineering tactics, weaponized payloads, and actionable defensive safeguards.'}
              </p>
            </div>
          </div>

          <button
            onClick={downloadCurriculumPdf}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-indigo-900/40 flex items-center gap-2 shrink-0 cursor-pointer active:scale-95 border border-indigo-400/30"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تحميل الدليل الشامل (PDF)' : 'Export Full Guide (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Live Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-indigo-600" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث في الـ 50 تهديداً (مثال: PDF، ماكرو، فلاش، OTP، كوكيز...)' : 'Search 50 attack techniques (e.g. PDF, Macro, OTP, Cookie, Whaling)...'}
              className="w-full ps-11 pe-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">{lang === 'ar' ? 'جميع مستويات الخطورة' : 'All Severities'}</option>
              <option value="critical">{lang === 'ar' ? 'حرجة للغاية (Critical)' : 'Critical'}</option>
              <option value="high">{lang === 'ar' ? 'مرتفعة (High)' : 'High'}</option>
              <option value="medium">{lang === 'ar' ? 'متوسطة (Medium)' : 'Medium'}</option>
            </select>
          </div>
        </div>

        {/* Categories Horizontal Scroll / Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const count = cat.id === 'all' ? threats.length : threats.filter(t => t.category === cat.id).length;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-100/80 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <span>{lang === 'ar' ? cat.labelAr : cat.labelEn}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Threat Cards Grid - 50 Comprehensive Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredThreats.map((item) => {
          const isCritical = item.severity === 'critical';
          const isHigh = item.severity === 'high';

          return (
            <div
              key={item.id}
              className="group bg-white rounded-3xl border border-slate-200 p-5 hover:border-indigo-400 hover:shadow-xl transition-all flex flex-col gap-3 relative overflow-hidden"
            >
              {/* Header: Fully Circular Icon Badge & Badges */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full p-0.5 shadow-sm shrink-0 flex items-center justify-center ${
                    isCritical
                      ? 'bg-gradient-to-tr from-rose-500 to-amber-500'
                      : isHigh
                      ? 'bg-gradient-to-tr from-amber-500 to-indigo-500'
                      : 'bg-gradient-to-tr from-indigo-500 to-emerald-500'
                  }`}>
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-slate-900 group-hover:scale-105 transition-transform">
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-indigo-600">#{item.id}</span>
                    <h3 className="font-black text-slate-950 text-xs sm:text-sm tracking-tight leading-snug">
                      {lang === 'ar' ? item.titleAr : item.titleEn}
                    </h3>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-black uppercase px-2.5 py-0.8 rounded-full shrink-0 border ${
                    isCritical
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : isHigh
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {item.severity}
                </span>
              </div>

              {/* Description */}
              <p className="text-slate-600 text-xs leading-relaxed min-h-[38px]">
                {lang === 'ar' ? item.descAr : item.descEn}
              </p>

              {/* Example & Defense Strategy */}
              <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-slate-100">
                <div className="p-2.5 rounded-2xl bg-rose-50/70 border border-rose-100/80 flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    {lang === 'ar' ? 'السيناريو الواقعي:' : 'Real Attack Scenario:'}
                  </span>
                  <span className="text-[11px] text-rose-900 font-bold leading-tight">
                    {lang === 'ar' ? item.exampleAr : item.exampleEn}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/80 flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    {lang === 'ar' ? 'خطة الحماية والوقاية:' : 'Defense Protocol:'}
                  </span>
                  <span className="text-[11px] text-emerald-900 font-bold leading-tight">
                    {lang === 'ar' ? item.defenseAr : item.defenseEn}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredThreats.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 flex flex-col items-center gap-3">
          <HelpCircle className="w-10 h-10 text-slate-300" />
          <h4 className="font-bold text-slate-800 text-sm">
            {lang === 'ar' ? 'لم يتم العثور على تكتيكات مطابقة' : 'No matching attack vectors found'}
          </h4>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedSeverity('all');
            }}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 cursor-pointer"
          >
            {lang === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset All Filters'}
          </button>
        </div>
      )}

      {/* Bottom Educational Callout */}
      <div className="bg-indigo-950 text-white rounded-3xl p-5 sm:p-6 border border-indigo-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-sm font-black tracking-tight text-white">
              {lang === 'ar' ? 'المبدأ الذهبي في الأمن الرقمي (Zero Trust)' : 'The Golden Security Principle: Zero Trust'}
            </h4>
            <p className="text-xs text-indigo-200 leading-relaxed max-w-xl">
              {lang === 'ar'
                ? 'لا تثق بأي رابط أو ملف أو طلب تحويل، وتحقق دائماً عبر قناة اتصال ثانية منفصلة قبل الإقدام على أي خطوة.'
                : 'Never trust, always verify. Validate every unexpected link, attachment, or sensitive request through a secondary out-of-band communication channel.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
