import React, { useState } from 'react';
import { ShieldCheck, Check, AlertCircle } from 'lucide-react';
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
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified'>('idle');

  if (!isOpen) return null;

  const handleBoxClick = () => {
    if (status !== 'idle') return;
    setStatus('verifying');

    setTimeout(() => {
      setStatus('verified');
      try {
        localStorage.setItem('sm_robot_verified', 'true');
        document.cookie = 'sm_robot_verified=true; path=/; max-age=315360000; SameSite=Lax';
      } catch (e) {}

      setTimeout(() => {
        onVerifySuccess();
      }, 500);
    }, 1100);
  };

  const isAr = lang === 'ar';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 sm:p-6 max-w-sm w-full flex flex-col items-center gap-4 text-center select-none">
        <div className="p-3 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-2xs">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-base sm:text-lg font-black text-slate-950">
            {isAr ? 'التحقق الأمني للوصول' : 'Security Verification'}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
            {isAr
              ? 'يرجى تأكيد أنك لست برنامج روبوت للوصول لكافة أقسام وأدوات النظام'
              : 'Please confirm you are not a robot to access system sections'}
          </p>
        </div>

        <div
          onClick={handleBoxClick}
          className={`w-full p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
            status === 'verified'
              ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
              : status === 'verifying'
              ? 'bg-indigo-50/50 border-indigo-400'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-300 hover:border-slate-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${
                status === 'verified'
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs scale-105'
                  : status === 'verifying'
                  ? 'border-indigo-600 bg-white'
                  : 'border-slate-400 bg-white hover:border-slate-600'
              }`}
            >
              {status === 'verifying' && (
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              )}
              {status === 'verified' && <Check className="w-5 h-5 stroke-[3]" />}
            </div>

            <span className="text-xs sm:text-sm font-bold text-slate-900">
              {isAr ? 'أنا لست برنامج روبوت' : "I'm not a robot"}
            </span>
          </div>

          <div className="shrink-0">
            <img 
              src="https://i.ibb.co/d4SN4h4h/Screenshot-20260723-035727-Gallery.jpg"
              alt="SM Security"
              className="w-8 h-8 rounded-full border border-slate-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
          <AlertCircle className="w-3 h-3 text-slate-400" />
          <span>
            {isAr
              ? 'نظام أمان مشدد ومحمي بالكامل ضد الاستعلام الآلي'
              : 'Advanced Security: Fully protected against automated access'}
          </span>
        </div>

        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-2 border-t border-slate-100 pt-2 w-full text-center">
          {isAr ? 'حقوق التطوير محفوظة © محمد أبو السعود' : 'Development Rights Reserved © Mohamed Abu AlSaud'}
        </div>
      </div>
    </div>
  );
};
