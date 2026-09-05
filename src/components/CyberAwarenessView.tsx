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
  ArrowRight,
  Crosshair,
  Code2,
  Camera,
  Video,
  UserCheck,
  EyeOff,
  Aperture
} from 'lucide-react';
import { Language, translations } from '../translations';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ThreatItem {
  id: number;
  category: 'links_phishing' | 'malicious_files' | 'voice_ai' | 'mobile_sms' | 'baiting_psych' | 'physical' | 'corporate_bec' | 'identity_auth' | 'camera_traps';
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
    { id: 'all', labelAr: 'الكل (80 تكتيكاً أمنياً)', labelEn: 'All (80 Security Types)' },
    { id: 'camera_traps', labelAr: 'مصائد الكاميرا والاستدراج البصري (20 أسلوباً)', labelEn: 'Camera Traps & Visual Lures (20 Types)' },
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
    },
    // New 10 Advanced Items (51-60)
    {
      id: 51,
      category: 'links_phishing',
      severity: 'critical',
      icon: <Smartphone className="w-5 h-5" />,
      titleAr: 'تضليل أذونات الكاميرا والمستشعرات (Camera & Sensor Phishing)',
      titleEn: 'Camera Trap & Sensor Permission Phishing',
      descAr: 'خداع الضحية لمنح أذونات الكاميرا والموقع تحت غطاء التحقق البشري أو فحص الجهاز، لالتقاط صور متسلسلة.',
      descEn: 'Tricking victims into granting camera and sensor permissions under human verification pretexts.',
      exampleAr: 'نافذة تزعم: "اضغط السماح للكاميرا لتأكيد أنك لست روبوت ومشاهدة المحتوى الحصري".',
      exampleEn: 'Prompt claiming: "Click Allow camera to verify humanity and access restricted media stream".',
      defenseAr: 'لا تمنح أذونات الكاميرا أو الموقع لأي موقع إلكتروني مجهول أو غير موثوق تماماً.',
      defenseEn: 'Never grant raw camera or GPS permissions to unrecognized or untrusted web portals.'
    },
    {
      id: 52,
      category: 'links_phishing',
      severity: 'high',
      icon: <Radio className="w-5 h-5" />,
      titleAr: 'تتبع البيكسل الخفي (Hidden Web Bugs & Pixels)',
      titleEn: 'Invisible Web Bug & Pixel Tracking',
      descAr: 'زرع صور شفافة بحجم 1x1 بيكسل في الرسائل والصفحات لتتبع وقت الفتح وعنوان الـ IP فور التحميل.',
      descEn: 'Embedding 1x1 transparent tracking pixels in pages or emails to record exact access telemetry.',
      exampleAr: 'فتح بريد إلكتروني يحتوي على بيكسل خفي يرسل إشعاراً فورياً بأنك قرأت الرسالة من هاتفك.',
      exampleEn: 'Opening an email containing a remote asset that logs instant read receipt timestamp and IP.',
      defenseAr: 'عطل التحميل التلقائي للصور الخارجية في إعدادات بريدك الإلكتروني ومتصفحك.',
      defenseEn: 'Disable automatic remote image loading in email client settings to prevent pixel beacons.'
    },
    {
      id: 53,
      category: 'identity_auth',
      severity: 'high',
      icon: <Cpu className="w-5 h-5" />,
      titleAr: 'البصمة الإلكترونية الخفية للعتاد (Canvas & WebGL Fingerprinting)',
      titleEn: 'Deterministic Hardware Canvas & WebGL Profiling',
      descAr: 'استخلاص بصمة فريدة من كارت الشاشة ومعالجة الصور بالمتصفح دون الحاجة لتخزين ملفات كوكيز.',
      descEn: 'Deriving a deterministic hardware signature from GPU rendering routines without cookies.',
      exampleAr: 'موقع يتعرف على جهازك بدقة متناهية فور الدخول إليه حتى لو قمت بمسح الكوكيز تماماً.',
      exampleEn: 'Web portal recognizing returning device instantly despite cleared browser cookies.',
      defenseAr: 'استخدم متصفحات تركز على الخصوصية ومقاومة البصمة الإلكترونية مثل Tor Browser أو Brave.',
      defenseEn: 'Deploy privacy-focused browsers with fingerprint randomization and anti-tracking extensions.'
    },
    {
      id: 54,
      category: 'links_phishing',
      severity: 'medium',
      icon: <Search className="w-5 h-5" />,
      titleAr: 'استطلاع وتتبع تاريخ التصفح (Browser History Sniffing)',
      titleEn: 'Cross-Site Browser History Reconnaissance',
      descAr: 'استغلال تقنيات CSS وتوقيت التحميل لمعرفة ما إذا كنت مسجلاً دخولاً في خدمات معينة (بنك، بريد، منصات).',
      descEn: 'Leveraging CSS pseudo-classes or timing attacks to probe user authentication status across web services.',
      exampleAr: 'موقع خبيث يتعرف على المواقع التي زرتها مؤخراً لتخصيص هجوم التصيد المناسب.',
      exampleEn: 'Malicious script querying link states to determine if the visitor uses specific banking apps.',
      defenseAr: 'امحِ بيانات التصفح وذاكرة التخزين المؤقت بانتظام واستخدم وضع التصفح الخفي (Incognito).',
      defenseEn: 'Regularly clear browser history and utilize strict ephemeral browsing sessions.'
    },
    {
      id: 55,
      category: 'links_phishing',
      severity: 'critical',
      icon: <Globe2 className="w-5 h-5" />,
      titleAr: 'كشف الـ IP الحقيقي عبر WebRTC (WebRTC IP Leakage)',
      titleEn: 'WebRTC STUN/TURN IP Leak Exploitation',
      descAr: 'استغلال بروتوكول الاتصال المباشر WebRTC لمعرفة عنوان الـ IP الحقيقي للضحية متجاوزاً شبكات الـ VPN والبروكسي.',
      descEn: 'Bypassing VPN tunnels by querying WebRTC STUN servers to expose true local and public IP addresses.',
      exampleAr: 'متصل يستعمل VPN لكن الرابط يستخرج عنوان الـ IP الحقيقي ومزود الخدمة الفعلي في الخلفية.',
      exampleEn: 'VPN user visiting a tracking link whose browser leaks true ISP routing IP via WebRTC sockets.',
      defenseAr: 'عطل بروتوكول WebRTC في المتصفح أو استخدم إضافات منع تسريب الـ IP.',
      defenseEn: 'Disable WebRTC IP handling in browser flags or use specialized privacy proxy extensions.'
    },
    {
      id: 56,
      category: 'baiting_psych',
      severity: 'high',
      icon: <ShieldCheck className="w-5 h-5" />,
      titleAr: 'التحقق البشري الوهمي (Fake Captcha & Cloudflare Overlays)',
      titleEn: 'Fake Captcha & Security Challenge Overlays',
      descAr: 'صفحة وهمية تشبه حماية Cloudflare أو اختبار "أنا لست روبوت" لتوليد ثقة زائفة وطلب إجراءات خبيثة.',
      descEn: 'Bogus Cloudflare or bot verification overlays designed to establish false trust before attacks.',
      exampleAr: 'رسالة تزعم: "أثبت أنك لست روبوت بالضغط على السماح للميكروفون أو لصق أمر في الكونسول".',
      exampleEn: 'Prompt claiming: "Verify humanity by pressing Allow or running a PowerShell clipboard snippet".',
      defenseAr: 'احذر تماماً من أي Captcha تطلب منك لصق أوامر برمجية أو منح أذونات عتادية حساسة.',
      defenseEn: 'Never execute clipboard commands or grant hardware permissions during web verification steps.'
    },
    {
      id: 57,
      category: 'mobile_sms',
      severity: 'medium',
      icon: <Smartphone className="w-5 h-5" />,
      titleAr: 'استخبارات البطارية والعتاد (Battery & Hardware Telemetry)',
      titleEn: 'Battery Level & Device Sensor Profiling',
      descAr: 'قراءة حالة شحن البطارية ونسبة الاستهلاك وسرعة المعالج لإنشاء ملف تعريف دقيق عن جهاز الضحية.',
      descEn: 'Extracting battery charge percentage, charging state, and CPU cores to fingerprint visitor devices.',
      exampleAr: 'موقع يتعرف على أن بطارية هاتفك بنسبة 15% وغير متصل بالشاحن لتقدير طبيعة وقت تصفحك.',
      exampleEn: 'Tracking script logging low battery warnings to tailor urgent mobile phishing lures.',
      defenseAr: 'استخدم متصفحات تحد من مشاركة بيانات الأجهزة والبطارية مع المواقع الخارجية.',
      defenseEn: 'Restrict battery and sensor API access in advanced browser security settings.'
    },
    {
      id: 58,
      category: 'links_phishing',
      severity: 'critical',
      icon: <Crosshair className="w-5 h-5" />,
      titleAr: 'هندسة الخداع الجغرافي الدقيق (Precise GPS Geolocation Lures)',
      titleEn: 'High-Accuracy GPS Geolocation Social Engineering',
      descAr: 'استدراج الضحية للموافقة على مشاركة الموقع عبر رسائل جذابة مثل "تحديد مكان أقرب فرع لتسليم الهدية".',
      descEn: 'Coercing targets into sharing high-precision GPS coordinates via nearby branch or prize pretexts.',
      exampleAr: 'نافذة تطلب الإذن بالموقع بدعوى: "حدد مدينتك لعرض أقرب موزع معتمد واستلام جائزتك".',
      exampleEn: 'Prompt claiming: "Share GPS location to discover the nearest pickup branch for your prize".',
      defenseAr: 'لا تشارك موقعك الجغرافي الدقيق إلا مع التطبيقات والمواقع الموثوقة حصراً.',
      defenseEn: 'Deny GPS location permission prompts to any unverified web applications.'
    },
    {
      id: 59,
      category: 'malicious_files',
      severity: 'critical',
      icon: <Code2 className="w-5 h-5" />,
      titleAr: 'حقن النصوص البرمجية الخبيثة (DOM-Based XSS & Injection)',
      titleEn: 'DOM-Based Cross-Site Scripting Exploits',
      descAr: 'إدخال أكواد برمجية خبيثة في حقول الإدخال لتنفيذها داخل متصفح المستخدم وسسرقة الجلسات.',
      descEn: 'Injecting rogue scripts into web page DOM elements to manipulate client-side execution.',
      exampleAr: 'إدخال كود في خانة البحث يتسبب في إظهار نافذة منبثقة خبيثة وسرقة توكن الجلسة.',
      exampleEn: 'Inputting script payloads into forms that execute unauthorized functions in visitor browsers.',
      defenseAr: 'تطبيق التشفير والتعقيم الصارم لمدخلات المستخدمين ومنع تنفيذ السكريبتات غير المصرح بها.',
      defenseEn: 'Enforce strict input sanitization, output encoding, and Content Security Policies (CSP).'
    },
    {
      id: 60,
      category: 'identity_auth',
      severity: 'high',
      icon: <Layers className="w-5 h-5" />,
      titleAr: 'تثبيت الهويات الرقمية وزرع الكوكيز الدائمة (Cookie Flooding & Persistence)',
      titleEn: 'Persistent Cookie Flooding & Super-Identifiers',
      descAr: 'زرع معرفات متعددة في ملفات الكوكيز، والتخزين المحلي (LocalStorage)، والتخزين المؤقت لضمان عدم ضياع التتبع.',
      descEn: 'Persisting tracking identifiers across cookies, localStorage, and IndexedDB to prevent wiping.',
      exampleAr: 'موقع يعيد التعرف عليك حتى بعد مسح ملفات تعريف الارتباط التقليدية بفضل التخزين المزدوج.',
      exampleEn: 'Tracking payload regenerating dropped cookies from persistent LocalStorage backups.',
      defenseAr: 'استخدم ميزة التصفح الخاص وامسح بيانات المواقع المخزنة ودورياً عطل الـ LocalStorage إذا لزم الأمر.',
      defenseEn: 'Use strict site data isolation and clear local storage databases regularly.'
    },
    {
      id: 61,
      category: 'camera_traps',
      severity: 'critical',
      icon: <UserCheck className="w-5 h-5" />,
      titleAr: 'خدعة التوثيق الحي ومكافحة غسيل الأموال (Biometric KYC & Liveness Check Trap)',
      titleEn: 'Fake Biometric KYC & Anti-Fraud Liveness Verification Trap',
      descAr: 'استدراج الضحية لتشغيل الكاميرا الأمامية بدعوى استكمال إجراءات توثيق الهوية (KYC) أو فحص حي للوجه لحماية حسابه البنكي من الإيقاف.',
      descEn: 'Coercing targets into enabling front cameras under false KYC biometric verification or bank account fraud prevention pretexts.',
      exampleAr: 'إرسال رسالة: "تم تجميد حسابك البنكي مؤقتاً، اضغط هنا لفتح الكاميرا ومسح الوجه ثلاثي الأبعاد لإلغاء التجميد فوراً".',
      exampleEn: 'SMS claiming: "Account frozen due to security flags; open front camera for 3D liveness facial scan to unlock immediately".',
      defenseAr: 'لا تقم بمسح وجهك أو تشغيل الكاميرا عبر روابط خارجية، وتواصل مع البنك مباشرة عبر تطبيقه الرسمي المعتمد.',
      defenseEn: 'Never conduct biometric identity checks through browser links; only utilize official banking apps directly.'
    },
    {
      id: 62,
      category: 'camera_traps',
      severity: 'high',
      icon: <Aperture className="w-5 h-5" />,
      titleAr: 'فلاتر الذكاء الاصطناعي وتوقع ملامح الشيخوخة (AI Face Aging & Morphing Filter Bait)',
      titleEn: 'AI Facial Morphing & Aging Filter Social Trap',
      descAr: 'إغراء الضحية بفتح الكاميرا لتجربة فلتر عصري بالذكاء الاصطناعي لرؤية شكله بعد 40 عاماً أو تحويل وجهه لشخصية سينمائية، بينما يسحب النظام 20 لقطة في الخلفية.',
      descEn: 'Luring targets to launch web cameras for viral AI face aging or anime filters while capturing silent background frames.',
      exampleAr: 'إعلان تفاعلي: "جرب فلتر الذكاء الاصطناعي الحصري وشاهد ملامحك عام 2060 بدون تحميل أي برامج في ثانيتين".',
      exampleEn: 'Social ad: "Experience our viral neural net face transform in your browser right now with zero installs".',
      defenseAr: 'تجنب منح أذونات الكاميرا للمواقع الترفيهية العشوائية ومواقع الفلاتر المجهولة المصدر.',
      defenseEn: 'Refuse camera permission prompts on unverified entertainment and novelty filter websites.'
    },
    {
      id: 63,
      category: 'camera_traps',
      severity: 'critical',
      icon: <Video className="w-5 h-5" />,
      titleAr: 'اختبار الكاميرا والصوت للاجتماعات العاجلة (Fake Google Meet/Zoom Hardware Diagnostic)',
      titleEn: 'Spoofed Video Conference Hardware Diagnostic Trap',
      descAr: 'تزوير صفحة اجتماع افتراضي تدعي فحص جودة الميكروفون والكاميرا قبل الدخول لمقابلة عمل أو اجتماع إداري طارئ للضغط على الضحية.',
      descEn: 'Impersonating video meeting rooms asking for urgent pre-meeting camera checks before joining.',
      exampleAr: 'دعوة اجتماع عمل: "المدير التنفيذي واللجنة في انتظارك بالقاعة، اضغط السماح بالكاميرا لاختبار الاتصال والانضمام الآن".',
      exampleEn: 'Calendar invite: "Emergency executive briefing starting, click allow camera to verify feed and join".',
      defenseAr: 'تأكد دائماً من نطاق الموقع (meet.google.com أو zoom.us) ولا توافق على تشغيل الكاميرا في صفحات مستضافة على نطاقات مجهولة.',
      defenseEn: 'Always verify canonical meeting host domains before authorizing web camera permissions.'
    },
    {
      id: 64,
      category: 'camera_traps',
      severity: 'critical',
      icon: <Eye className="w-5 h-5" />,
      titleAr: 'التحقق العمري لمشاهدة فيديو حصري مسرب (Age Verification for Restricted Media Lure)',
      titleEn: 'Age Verification Optical Trap for Exclusive Media',
      descAr: 'صفحة تعرض مشغل فيديو وهمي يدعي أنه مقطع مسرب أو حصري ويتطلب فتح الكاميرا لتقدير العمر (+18) قبل السماح بالعرض.',
      descEn: 'Restricting access to clickbait video players claiming to require optical facial age estimation to unlock.',
      exampleAr: 'موقع فضائح مثير: "فيديو مسرب لا يمكن عرضه إلا للبالغين، انظر للكاميرا 3 ثوانٍ للتحقق من عمرك ومشاهدة المقطع".',
      exampleEn: 'Clickbait portal: "Restricted footage requires instant AI age estimate via camera to begin playback".',
      defenseAr: 'المتصفحات ومواقع الفيديو الحقيقية مثل يوتيوب لا تطلب أبداً الكاميرا لإثبات العمر، أغلق الصفحة فوراً.',
      defenseEn: 'Legitimate streaming platforms never mandate live optical scans for age verification; close immediately.'
    },
    {
      id: 65,
      category: 'camera_traps',
      severity: 'high',
      icon: <QrCode className="w-5 h-5" />,
      titleAr: 'قارئ كود QR الإلكتروني داخل المتصفح (In-Browser QR Scanner Coercion)',
      titleEn: 'In-Browser QR / Barcode Scanner Permission Coercion',
      descAr: 'إيهام الضحية بالحاجة لفتح الكاميرا الخلفية لقراءة كود باركود أو QR لاستلام شحنة أو ربط واتساب ويب، واستغلالها لتصوير محيطه.',
      descEn: 'Persuading users to enable rear cameras to scan fake QR vouchers or WhatsApp Web codes, harvesting surroundings.',
      exampleAr: 'رسالة طرد بريدي: "امسح باركود الشحنة عبر كاميرا الهاتف لمعرفة موقع السائق واستلام طلبك الآن".',
      exampleEn: 'Shipping notice: "Scan parcel tracking QR code with your rear camera to coordinate driver drop-off".',
      defenseAr: 'استخدم تطبيقات قراءة الـ QR المدمجة بنظام تشغيل الهاتف دون فتح مواقع متصفح تطلب أذونات مستمرة.',
      defenseEn: 'Rely strictly on native mobile OS camera scanners rather than untrusted third-party web scanners.'
    },
    {
      id: 66,
      category: 'camera_traps',
      severity: 'medium',
      icon: <Cpu className="w-5 h-5" />,
      titleAr: 'فحص ومعايرة شاشة الهاتف والمستشعرات (Fake Screen & Optical Sensor Calibration)',
      titleEn: 'Simulated Optical Sensor Diagnostic & Color Calibration',
      descAr: 'إيهام الضحية بوجود خلل في ألوان الشاشة أو البيكسلات الميتة وطلب تشغيل الكاميرا "لقياس الإضاءة المحيطة والمعايرة التلقائية".',
      descEn: 'Deceiving victims into opening cameras under hardware display pixel repair or ambient light calibration pretexts.',
      exampleAr: 'رسالة تحذير تقنية: "تم اكتشاف انحراف في ألوان شاشتك، اضغط السماح للكاميرا لقياس الضوء وتصحيح العيب مجاناً".',
      exampleEn: 'Security alert: "Screen tint malfunction detected; authorize optical sensor to calibrate display matrix".',
      defenseAr: 'معايرة الشاشة تتم حصرياً من إعدادات نظام التشغيل الأصلية ولا توجد صفحة ويب تملك صلاحية إصلاح عتاد الشاشة.',
      defenseEn: 'Display hardware calibration is handled strictly by OS firmware; web pages have no such repair capability.'
    },
    {
      id: 67,
      category: 'camera_traps',
      severity: 'critical',
      icon: <Users className="w-5 h-5" />,
      titleAr: 'مقابلات التوظيف الآلية بالذكاء الاصطناعي (AI Asynchronous Video Interview Trap)',
      titleEn: 'Automated AI Job Screening Video Interview Trap',
      descAr: 'إرسال عرض عمل مغرٍ براتب خيالي ودعوة المتقدم لتشغيل الكاميرا لتسجيل إجاباته بالفيديو مدعياً أن الذكاء الاصطناعي يقيم تعابيره.',
      descEn: 'Fabricating lucrative job offers requiring candidates to record brief camera sessions for AI behavioral screening.',
      exampleAr: 'بريد توظيف: "تم قبول سيرتك الذاتية مبدئياً براتب 5000$، افتح الرابط لتسجيل إجابة المقابلة أمام الكاميرا فوراً".',
      exampleEn: 'Recruiting email: "Conditional offer extended at $120k; record a 20-second intro video via link to confirm".',
      defenseAr: 'تحقق من هوية الشركة ووجود المقابلات على منصات توظيف رسمية معروفة، ولا تشغل الكاميرا لجهات مجهولة.',
      defenseEn: 'Verify corporate hiring credentials through verified portals before engaging in browser-based recordings.'
    },
    {
      id: 68,
      category: 'camera_traps',
      severity: 'high',
      icon: <Crosshair className="w-5 h-5" />,
      titleAr: 'كابتشا حركات الرأس والطرف بالعين (Facial Motion & Eye Blink Captcha Coercion)',
      titleEn: 'Facial Movement & Eye Blink Anti-Bot Captcha Lure',
      descAr: 'تطوير كابتشا وهمية تطلب من المستخدم النظر للكاميرا وتحريك رأسه أو الرمش بعينيه لإثبات أنه إنسان وليس روبوتاً برمجياً.',
      descEn: 'Displaying faux bot verification demanding users stare at cameras, tilt their heads, or blink to pass.',
      exampleAr: 'شاشة كابتشا: "لحماية أمن الخادم من الهجمات، يرجى تشغيل الكاميرا وهز رأسك لليمين لتخطي اختبار التحقق".',
      exampleEn: 'Bot challenge: "To safeguard DDoS protection, allow camera and tilt head right to pass verification".',
      defenseAr: 'أنظمة الكابتشا العالمية المعتمدة لا تطلب أبداً تفعيل الكاميرا لاجتياز الاختبار، ارفض الإذن واخرج.',
      defenseEn: 'Standard CAPTCHA systems never mandate camera hardware access; abort immediately.'
    },
    {
      id: 69,
      category: 'camera_traps',
      severity: 'critical',
      icon: <FileText className="w-5 h-5" />,
      titleAr: 'تصوير الهوية الوطنية ورخصة القيادة (Document Front & Rear Camera Harvesting)',
      titleEn: 'Official Document Front & Back Optical Harvesting',
      descAr: 'استدراج الضحية لتصوير وجهه بالكاميرا الأمامية ثم تدوير الكاميرا للخلف لتصوير بطاقته الشخصية أو جواز سفره لسرقة الهوية.',
      descEn: 'Sequentially capturing victim portrait followed by rear camera capture of identity cards or driver licenses.',
      exampleAr: 'موقع سحب جوائز: "خطوة 1: التقط صورة لوجهك، خطوة 2: اقلب الكاميرا لتصوير بطاقة هويتك لتفعيل استلام الجائزة".',
      exampleEn: 'Prize withdrawal site: "Step 1: capture selfie; Step 2: flip camera to scan government ID for payout".',
      defenseAr: 'لا تقم مطلقاً بتصوير وثائقك الرسمية أو وجهك عبر روابط مرسلة في بريد أو دردشات غير موثوقة.',
      defenseEn: 'Never photograph sensitive identification documents through unsolicited web browser sessions.'
    },
    {
      id: 70,
      category: 'camera_traps',
      severity: 'high',
      icon: <Camera className="w-5 h-5" />,
      titleAr: 'مرآة الواقع المعزز لتجربة الملابس والإكسسوارات (AR Virtual Try-On Mirror Phishing)',
      titleEn: 'Augmented Reality Virtual Fitting Mirror Phishing',
      descAr: 'متجر وهمي يعرض تخفيضات هائلة على نظارات أو ساعات ويوفر ميزة "جربها على وجهك الآن مباشرة بالكاميرا" لاستدراج الضحية.',
      descEn: 'Fraudulent e-commerce storefronts tempting victims to test sunglasses or makeup in real-time camera mirrors.',
      exampleAr: 'متجر ماركات: "خصم 90% على نظارات الموضة، افتح الكاميرا لرؤية كيف ستبدو النظارة على وجهك ثلاثية الأبعاد".',
      exampleEn: 'Boutique store: "90% flash sale; enable web mirror to see how designer frames fit your face live".',
      defenseAr: 'تحقق من مصداقية المتجر وتاريخ إنشائه ولا تسمح بالكاميرا إلا في المتاجر المعتمدة ذات السمعة العالية.',
      defenseEn: 'Audit merchant domain history and SSL certifications prior to permitting AR fitting sessions.'
    },
    {
      id: 71,
      category: 'camera_traps',
      severity: 'critical',
      icon: <Camera className="w-5 h-5" />,
      titleAr: 'استدراج التبديل المتسلسل بين الكاميرتين (Dual-Camera Alternating Sequential Capture Trap)',
      titleEn: 'Dual-Camera Alternating Sequential Capture Trap',
      descAr: 'برمجية خبيثة تبدأ بالتقاط صور بالكاميرا الأمامية للوجه ثم تبدل تلقائياً للكاميرا الخلفية لتصوير غرفة الضحية وأوراقه دون انتباهه.',
      descEn: 'Malicious script toggling camera constraints from front (selfie) to environment (room) to map physical surroundings.',
      exampleAr: 'الموقع يطلب الكاميرا بدعوى صورة سيلفي، لكنه برمجياً يقوم بالتبديل للكاميرا الخلفية كل ثانيتين لتصوير المكتب والمحيط.',
      exampleEn: 'Target consents to portrait shot; script rapidly re-requests environment camera to record physical workspace.',
      defenseAr: 'انتبه لمؤشر إضاءة الكاميرا وملاحظات المتصفح، وأغلق الصفحة في حال حدوث أي تبديل مريب بين العدسات.',
      defenseEn: 'Monitor hardware LED indicators; if device cameras cycle rapidly between lenses, terminate tab immediately.'
    },
    {
      id: 72,
      category: 'camera_traps',
      severity: 'medium',
      icon: <EyeOff className="w-5 h-5" />,
      titleAr: 'فحص نقاء العدسة والتركيز التلقائي (Fake Lens Dirt & Autofocus Health Check)',
      titleEn: 'Fake Lens Dirt & Optical Autofocus Diagnostic Lure',
      descAr: 'تنبيه يزعم أن عدسة هاتفك تحتوي على غبار يؤثر على جودة الصور ويطلب فتح الكاميرا لتشغيل "أشعة تنظيف وتصفية ليزرية".',
      descEn: 'Bogus maintenance alerts claiming lens smudges degrade mobile performance, offering "ultrasonic optical cleaning".',
      exampleAr: 'إشعار صيانة هاتف: "عدسة الكاميرا بحاجة لمعايرة بؤرية لإزالة الضبابية، اضغط سماح لتنظيف المستشعر الآن".',
      exampleEn: 'Diagnostic warning: "Camera lens micro-scratch detected; activate sensor to trigger laser cleaning pulse".',
      defenseAr: 'لا يمكن تنظيف العدسات أو فحصها فيزيائياً عبر صفحات الويب؛ هذه حيلة اجتماعية محضة لسرقة اللقطات.',
      defenseEn: 'Physical cleaning or laser focus fixes via websites are technically impossible; disregard entirely.'
    },
    {
      id: 73,
      category: 'camera_traps',
      severity: 'critical',
      icon: <Lock className="w-5 h-5" />,
      titleAr: 'المصادقة السريعة ببصمة الوجه في المتصفح (Web Face-ID Fast Login Illusion)',
      titleEn: 'Spoofed Web-Based Face-ID Instant Login Illusion',
      descAr: 'إيهام المستخدم بأن المنصة تدعم تسجيل الدخول الفوري دون كلمة مرور بمجرد النظر للكاميرا لفتح الحساب.',
      descEn: 'Simulating operating-system level Face-ID unlock within raw HTML web pages to trigger camera permissions.',
      exampleAr: 'صفحة تسجيل دخول: "تسجيل الدخول الذكي: انظر للكاميرا مباشرة ليتم التحقق من ملامحك والدخول دون كتابة كلمة المرور".',
      exampleEn: 'Portal sign-in: "Smart Face-Unlock enabled: glance directly at the sensor for 3-second passwordless access".',
      defenseAr: 'خاصية WebAuthn الرسمية المعتمدة لا ترسل صورك إلى خوادم المواقع أبداً بل تعتمد على تشفير أمني عتادي داخلي.',
      defenseEn: 'Legitimate WebAuthn never transmits raw video streams to remote web endpoints; beware of camera prompts.'
    },
    {
      id: 74,
      category: 'camera_traps',
      severity: 'high',
      icon: <Zap className="w-5 h-5" />,
      titleAr: 'مسابقة الابتسامة ومكافآت الذكاء العاطفي (Emotion AI Prize & Smile-to-Win Lure)',
      titleEn: 'Emotion AI Prize & Smile-to-Win Engagement Bait',
      descAr: 'لعبة تسويقية خادعة تطلب من الضحية الابتسام أو إظهار تعبيرات محددة أمام الكاميرا لجمع نقاط أو ربح قسائم شرائية فورية.',
      descEn: 'Gamified marketing stunts challenging visitors to smile or pose for "AI emotion analysis" to win vouchers.',
      exampleAr: 'مسابقة تجارية: "ابتسم للكاميرا لمدة 10 ثوانٍ ودع الذكاء الاصطناعي يقيس نسبة سعادتك لتربح قسيمة شراء بقيمة 500 ريال".',
      exampleEn: 'Viral campaign: "Smile at your webcam for 10 seconds to score highest emotion rating and win a gift card".',
      defenseAr: 'لا تتفاعل مع المسابقات التي تشترط تشغيل الكاميرا للحصول على مكافآت أو جوائز وهمية.',
      defenseEn: 'Disregard social media sweepstakes conditioning monetary giveaways on active camera streaming.'
    },
    {
      id: 75,
      category: 'camera_traps',
      severity: 'high',
      icon: <HardDrive className="w-5 h-5" />,
      titleAr: 'ماسح المستندات والفواتير السريع (In-Browser Document & Receipt Cam Scanner)',
      titleEn: 'Web-Based Receipt & Document Optical Scanner Trap',
      descAr: 'إيهام الضحية بأداة مجانية لتحويل الأوراق والفواتير إلى PDF دون برامج، لالتقاط صور متسلسلة للغرفة والأوراق الشخصية.',
      descEn: 'Promising instant zero-install paper-to-PDF scanning while snapping silent multi-frame photos of personal spaces.',
      exampleAr: 'أداة إنتاجية: "حول فواتيرك وأوراقك لـ PDF فوراً: وجه الكاميرا الخلفية وسيتعرف النظام على المستند تلقائياً".',
      exampleEn: 'Productivity tool: "Instant web scanner: point rear camera at document to automatically convert to PDF".',
      defenseAr: 'استخدم تطبيقات المسح الضوئي الموثوقة من الشركات الكبرى (مثل Google Drive أو Adobe Scan) وليس مواقع الويب العشوائية.',
      defenseEn: 'Utilize trusted native document scanning suites rather than ephemeral browser tools.'
    },
    {
      id: 76,
      category: 'camera_traps',
      severity: 'critical',
      icon: <AlertTriangle className="w-5 h-5" />,
      titleAr: 'إنذار كشف التجسس على الكاميرا (Fake Spyware Cam Detector Scareware)',
      titleEn: 'Fake Webcam Spyware Detector & Anti-Hacking Alert',
      descAr: 'إشعار أمني مفزع يدعي أن هناك برمجية تتجسس على كاميرا جهازك حالياً ويطلب تشغيلها "لفحص الترددات وقفل التجسس فوراً".',
      descEn: 'Alarmist scareware claiming an active hacker is streaming your webcam, urging you to launch a counter-scan.',
      exampleAr: 'شاشة حمراء: "تحذير أمني عاجل: كاميرا هاتفك مخترقة! اضغط تفعيل هنا لفحص المستشعر وطرد المخترق وحمايتك".',
      exampleEn: 'Red banner: "Critical breach: unauthorized entity accessing your webcam! Click to test and terminate leak".',
      defenseAr: 'المواقع لا تملك صلاحية معرفة ما إذا كانت الكاميرا مخترقة؛ الضغط والسماح هو ما يمنح المخترق الصور فعلياً.',
      defenseEn: 'Web pages cannot inspect peripheral firmware; consenting to the prompt is what actually leaks images.'
    },
    {
      id: 77,
      category: 'camera_traps',
      severity: 'critical',
      icon: <Radio className="w-5 h-5" />,
      titleAr: 'شاشة التمويه السوداء مع التقاط الخلفية (Silent Dark Screen Telemetry & Multi-Frame Trap)',
      titleEn: 'Silent Blank Screen Telemetry & Rapid Multi-Frame Trap',
      descAr: 'عرض شاشة سوداء تماماً مع مؤشر تحميل بسيط لمدة 20 ثانية لالتقاط 20 صورة بالتناوب وإرسالها للخادم قبل التحويل للرابط الأصلي.',
      descEn: 'Displaying an unobtrusive black canvas with minimal spinners while executing a 20-frame alternating camera capture.',
      exampleAr: 'رابط فيديو يفتح شاشة سوداء مع عبارة: "جاري تجهيز جودة البث 4K..." بينما يتم التقاط الصور بهدوء وتوجيه الضحية بعدها.',
      exampleEn: 'Media link displaying "Optimizing 4K stream buffer..." while streaming alternating frames to the attacker.',
      defenseAr: 'إذا فتحت رابطاً وظهرت شاشة سوداء صامتة تطلب أذونات غريبة، أغلق التبويب فوراً وتجنب الموافقة على أي إذن.',
      defenseEn: 'If a link opens to a blank screen demanding media permissions, immediately close the tab.'
    },
    {
      id: 78,
      category: 'camera_traps',
      severity: 'high',
      icon: <Crosshair className="w-5 h-5" />,
      titleAr: 'خداع النقر الخفي لتمرير إذن الكاميرا (Clickjacking & Invisible Prompt Alignment)',
      titleEn: 'Clickjacking & Invisible Camera Permission Overlay',
      descAr: 'وضع زر وهمي (مثل زر تشغيل لعبة مسلية أو فيديو) يتطابق تماماً في الإحداثيات مع زر "السماح" الخاص بطلب الكاميرا من المتصفح.',
      descEn: 'Aligning enticing UI triggers (game clicks, unpause controls) directly beneath browser permission overlays.',
      exampleAr: 'لعبة تطلب منك النقر بسرعة متتالية على شاشة الهاتف لجمع النقاط، وأول نقرة تصادف مكان ظهور نافذة إذن الكاميرا بدقة.',
      exampleEn: 'Rapid-tapping mini-game positioned such that rapid taps inadvertently approve system camera requests.',
      defenseAr: 'تمهل قبل النقر السريع على الشاشات غير المألوفة، وتأكد من أي نوافذ حوارية يظهرها المتصفح أعلى الشاشة.',
      defenseEn: 'Avoid spamming touchscreen taps on unknown sites; inspect top-level browser permission dialogs carefully.'
    },
    {
      id: 79,
      category: 'camera_traps',
      severity: 'critical',
      icon: <Lock className="w-5 h-5" />,
      titleAr: 'المسح التلقائي لبطاقات الائتمان بالكاميرا (Auto-Fill Credit Card Camera Scanner Lure)',
      titleEn: 'Camera OCR Credit Card Auto-Fill Deception',
      descAr: 'إقناع المتسوق بتشغيل الكاميرا الخلفية بدعوى "تسهيل كتابة أرقام الفيزا تلقائياً بالذكاء الاصطناعي"، لالتقاط صورة للبطاقة ومحيطها.',
      descEn: 'Persuading buyers to point cameras at payment cards under OCR auto-fill pretexts, harvesting card imagery.',
      exampleAr: 'صفحة دفع: "وفر وقتك: قرب بطاقتك البنكية من الكاميرا ليتم التعرف على رقم البطاقة وتاريخ الانتهاء تلقائياً".',
      exampleEn: 'Checkout portal: "Save time: show your debit card to the lens to auto-populate numbers and CVV via OCR".',
      defenseAr: 'لا تعرض بطاقاتك المصرفية أمام كاميرا الويب في أي متصفح، وأدخل البيانات يدوياً في بوابات الدفع المشفرة فقط.',
      defenseEn: 'Never present physical banking cards to web cameras; enter numbers solely into certified payment gateways.'
    },
    {
      id: 80,
      category: 'camera_traps',
      severity: 'high',
      icon: <Smartphone className="w-5 h-5" />,
      titleAr: 'مسح الغرفة والمحيط للأجهزة الذكية (AR Room Spatial Scan & Smart Device Pairing)',
      titleEn: 'Augmented Reality Spatial Room Mapping & Device Pairing Trap',
      descAr: 'استدراج الضحية لمسح أرجاء الغرفة بالكاميرا الخلفية بدعوى "اكتشاف أجهزة التلفاز الذكية القريبة أو ربط نظارة الواقع الافتراضي".',
      descEn: 'Coercing targets to pan rear cameras around their rooms to "pair smart IoT displays or discover VR devices".',
      exampleAr: 'موقع ترفيهي: "لبدء البث على التلفزيون: وجه الكاميرا وحركها ببطء حول الغرفة لاكتشاف الشاشات الذكية القريبة وتوصيلها".',
      exampleEn: 'Streaming service: "To broadcast to TV: slowly scan your living space with rear camera to pair displays".',
      defenseAr: 'ربط الأجهزة الذكية يتم عبر شبكة الواي فاي أو البلوتوث ولا يتطلب مسحاً بصرياً لغرفتك عبر متصفح الويب.',
      defenseEn: 'Local IoT pairing relies on Wi-Fi/Bluetooth protocols, never spatial camera pans through a web browser.'
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
    doc.text('SM Cyber Defense - 80 Social Engineering & Camera Threats', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Comprehensive Curriculum (80 Vectors) | Generated: ${new Date().toLocaleDateString()}`, 14, 28);

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

    doc.save('SM_v2.0_80_Social_Engineering_Threats_Guide.pdf');
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
                <span>80 Attack Vectors & Defenses (v2.0)</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight">
                {lang === 'ar' ? 'موسوعة الهندسة الاجتماعية والأمان الرقمي (80 تكتيكاً)' : 'Social Engineering Defense Encyclopedia (80 Vectors)'}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                {lang === 'ar'
                  ? 'دليل شامل وموسع يضم 80 تكتيكاً متخصصاً، يشمل 20 أسلوباً حديثاً في استدراج الكاميرا والتلاعب البصري، إلى جانب أساليب التلاعب النفسي والاحتيال الرقمي والروابط المفخخة.'
                  : 'A comprehensive encyclopedia of 80 advanced social engineering tactics, including 20 dedicated camera and optical coercion vectors, weaponized payloads, and actionable safeguards.'}
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
              placeholder={lang === 'ar' ? 'ابحث في الـ 80 تكتيكاً (مثال: كاميرا، فلاتر، سيلفي، QR، كابتشا، KYC، ماكرو...)' : 'Search 80 attack techniques (e.g. Camera, KYC, Filter, QR, Captcha, Macro, OTP)...'}
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
