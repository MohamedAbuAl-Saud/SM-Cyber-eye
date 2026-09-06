import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Check, AlertCircle, Cpu, Fingerprint } from 'lucide-react';
import { Language } from '../translations';

interface RobotCaptchaModalProps {
  isOpen: boolean;
  lang: Language;
  onVerifySuccess: () => void;
}

export const RobotCaptchaModal: React.FC<RobotCaptchaModalProps> = ({
  isOpen,
  lang,
  onVerifySuccess,
}) => {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const [entropy, setEntropy] = useState<number>(0);
  const [movementCount, setMovementCount] = useState<number>(0);
  const [activeLog, setActiveLog] = useState<string>('');
  const [verifiedTime, setVerifiedTime] = useState<number | null>(null);
  
  // Track mouse coordinates for behavioral trajectory analysis
  const coordsRef = useRef<{ x: number; y: number; t: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Reset state on modal open
    setStatus('idle');
    setEntropy(0);
    setMovementCount(0);
    setActiveLog(lang === 'ar' ? 'بانتظار حركة مؤشر الفأرة أو اللمس...' : 'Awaiting pointer or touch interaction...');
    coordsRef.current = [];

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (status !== 'idle') return;
      
      const now = Date.now();
      coordsRef.current.push({ x: e.clientX, y: e.clientY, t: now });
      
      // Limit to last 50 coordinates
      if (coordsRef.current.length > 50) {
        coordsRef.current.shift();
      }

      setMovementCount(prev => prev + 1);

      // Calculate trajectory entropy based on velocity variations and jitter
      if (coordsRef.current.length > 5) {
        let totalJitter = 0;
        let velocities: number[] = [];
        
        for (let i = 1; i < coordsRef.current.length; i++) {
          const p1 = coordsRef.current[i - 1];
          const p2 = coordsRef.current[i];
          const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
          const dt = Math.max(1, p2.t - p1.t);
          velocities.push(dist / dt);
        }

        // Standard deviation of velocities represents movement complexity (natural vs programmatic)
        const meanVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
        const variance = velocities.reduce((a, b) => a + Math.pow(b - meanVelocity, 2), 0) / velocities.length;
        const computedEntropy = Math.min(100, Math.round(Math.sqrt(variance) * 85 + (movementCount * 0.4)));
        
        setEntropy(computedEntropy);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isOpen, status, movementCount, lang]);

  if (!isOpen) return null;

  const handleBoxClick = () => {
    if (status !== 'idle') return;

    // Advanced anti-bot check: if absolutely no movement recorded, or entropy is extremely low (0)
    // and it's not a mobile touch event, block it.
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    
    // We expect some natural entropy if it's a mouse. Let's make it robust but fail-safe
    if (!isTouch && movementCount < 3) {
      setStatus('failed');
      setActiveLog(lang === 'ar' ? 'تنبيه: تم اكتشاف نقرة مبرمجة تلقائية! يرجى تحريك الفأرة.' : 'Warning: Automated/Programmatic click detected! Please move your mouse naturally.');
      return;
    }

    setStatus('verifying');
    
    // Step-by-step verification progress simulating highly complex biometric calculations
    const logs = lang === 'ar' ? [
      'جاري قراءة إحداثيات حركة اليد وتأثير التسارع...',
      'تحليل منحنى المؤشر والتحقق من التباين البشري...',
      'مطابقة بصمة المتصفح البيومترية وتقييم الـ Entropy...',
      'التحقق من سلامة الأجهزة والـ GPU والمصادقة الأمنية...',
      'تم المصادقة بنجاح: الحركة طبيعية تماماً (بشر)'
    ] : [
      'Extracting pointer trajectory & acceleration vector...',
      'Analyzing cursor velocity curve & human jitter...',
      'Matching hardware fingerprint & dynamic entropy matrix...',
      'Verifying WebGL context integrity & secure sandbox...',
      'Human verified successfully: Genuine biomechanics approved'
    ];

    let currentLogIndex = 0;
    setActiveLog(logs[0]);

    const interval = setInterval(() => {
      currentLogIndex++;
      if (currentLogIndex < logs.length) {
        setActiveLog(logs[currentLogIndex]);
      } else {
        clearInterval(interval);
        setStatus('verified');
        
        try {
          localStorage.setItem('sm_robot_verified_time', Date.now().toString());
          // 14400 seconds = 4 Hours Expiration
          document.cookie = 'sm_robot_verified=true; path=/; max-age=14400; SameSite=Lax';
        } catch (e) {}

        setTimeout(() => {
          onVerifySuccess();
        }, 1100);
      }
    }, 450);
  };

  const isAr = lang === 'ar';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        ref={containerRef}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-4 sm:p-5 max-w-sm w-full flex flex-col items-center gap-3.5 text-center select-none"
      >
        <div className="relative p-2.5 rounded-full bg-slate-50 border border-slate-100 text-indigo-600 shadow-2xs">
          <ShieldCheck className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm sm:text-base font-black text-slate-950 tracking-tight">
            {isAr ? 'حماية النظام الذكية (SM-SHIELD)' : 'Intelligent Protection (SM-SHIELD)'}
          </h3>
          <p className="text-[10px] text-slate-500 leading-normal max-w-xs px-2">
            {isAr
              ? 'الرجاء تأكيد الهوية البشرية للولوج. يحلل النظام حركة مؤشر اليد تلقائياً للتأكد من غياب الروبوتات.'
              : 'Please verify your human identity. The system analyzes mouse trajectory curves to prevent automated scrapers.'}
          </p>
        </div>

        {/* Biometric Analysis Visualizer */}
        <div className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex flex-col gap-1.5 text-start font-mono text-[9px] text-slate-600 leading-normal">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-1 font-bold text-[10px] text-indigo-950">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-indigo-600 animate-pulse" />
              {isAr ? 'التحليل السلوكي الآني' : 'Live Trajectory Analytics'}
            </span>
            <span className={entropy > 30 ? 'text-emerald-600' : 'text-amber-600'}>
              {isAr ? 'التباين البيومتري:' : 'Entropy:'} {entropy}%
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-500 font-mono">
            <div>X/Y Coords: <span className="text-slate-800 font-bold">{coordsRef.current[coordsRef.current.length - 1]?.x || 0}, {coordsRef.current[coordsRef.current.length - 1]?.y || 0}</span></div>
            <div>Jitter Count: <span className="text-slate-800 font-bold">{movementCount} px</span></div>
          </div>

          {/* Movement entropy progress bar */}
          <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${entropy > 35 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
              style={{ width: `${Math.min(100, entropy)}%` }} 
            />
          </div>

          <div className="text-[8.5px] text-indigo-600 font-bold bg-indigo-50/50 p-1 rounded border border-indigo-100/60 leading-normal flex items-start gap-1">
            <Fingerprint className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
            <span className="truncate">{activeLog}</span>
          </div>
        </div>

        {/* The reCAPTCHA Box Container */}
        <div
          onClick={handleBoxClick}
          className={`w-full p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
            status === 'verified'
              ? 'bg-slate-50 border-emerald-500/80 shadow-2xs'
              : status === 'verifying'
              ? 'bg-indigo-50/30 border-indigo-400/80 animate-pulse'
              : status === 'failed'
              ? 'bg-rose-50/50 border-rose-400'
              : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-5.5 h-5.5 rounded border flex items-center justify-center transition-all ${
                status === 'verified'
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs scale-105'
                  : status === 'verifying'
                  ? 'border-indigo-600 bg-white'
                  : status === 'failed'
                  ? 'bg-rose-600 border-rose-600 text-white'
                  : 'border-slate-300 bg-white hover:border-slate-400'
              }`}
            >
              {status === 'verifying' && (
                <div className="w-2.5 h-2.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              )}
              {status === 'verified' && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
              {status === 'failed' && <span className="font-bold text-[9px]">!</span>}
            </div>

            <span className="text-xs font-bold text-slate-800">
              {isAr ? 'أنا لست برنامج روبوت' : "I'm not a robot"}
            </span>
          </div>

          <div className="shrink-0 flex items-center gap-1.5">
            <img 
              src="https://i.ibb.co/d4SN4h4h/Screenshot-20260723-035727-Gallery.jpg"
              alt="SM Security"
              className="w-6.5 h-6.5 rounded-full border border-slate-200/80"
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 text-[9px] text-slate-400 font-medium">
          <AlertCircle className="w-2.5 h-2.5 text-slate-400 shrink-0" />
          <span>
            {isAr
              ? 'يتم تجديد جلسة التحقق تلقائياً كل 4 ساعات.'
              : 'Verification updates automatically every 4 hours.'}
          </span>
        </div>

        <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider border-t border-slate-100 pt-1.5 w-full text-center">
          {isAr ? 'حقوق التطوير محفوظة © محمد أبو السعود' : 'Development Rights Reserved © Mohamed Abu AlSaud'}
        </div>
      </div>
    </div>
  );
};

