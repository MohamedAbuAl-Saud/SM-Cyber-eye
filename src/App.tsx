import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, MainNavView } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { TrackDashboard } from './components/TrackDashboard';
import { IpLookupView } from './components/IpLookupView';
import { MacLookupView } from './components/MacLookupView';
import { ExifToolView } from './components/ExifToolView';
import { CyberAwarenessView } from './components/CyberAwarenessView';
import { SupportView } from './components/SupportView';
import { RobotCaptchaModal } from './components/RobotCaptchaModal';
import { Language, translations } from './translations';
import { TrackingLink, TrackingMode, VisitRecord } from './types';
import { X, Clock, ExternalLink, Trash2, Globe } from 'lucide-react';

const USER_TOKEN_KEY = 'ipsm_user_token';
const SAVED_LINKS_KEY = 'ipsm_saved_links';
const LANG_KEY = 'ipsm_lang';

function checkIsRobotVerified(): boolean {
  try {
    const isLocal = localStorage.getItem('sm_robot_verified') === 'true';
    const isCookie = document.cookie.includes('sm_robot_verified=true');
    return isLocal || isCookie;
  } catch {
    return false;
  }
}

function getOrSetUserToken(): string {
  let token = localStorage.getItem(USER_TOKEN_KEY);
  if (!token) {
    const cookieMatch = document.cookie.match(/(?:^|; )ipsm_user_token=([^;]*)/);
    if (cookieMatch && cookieMatch[1]) {
      token = decodeURIComponent(cookieMatch[1]);
    }
  }
  if (!token) {
    token =
      'usr_' +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }
  try {
    localStorage.setItem(USER_TOKEN_KEY, token);
    document.cookie = `ipsm_user_token=${encodeURIComponent(token)}; path=/; max-age=315360000; SameSite=Lax`;
  } catch (e) {
    console.warn('Cookie storage error:', e);
  }
  return token;
}

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_KEY);
    return saved === 'en' ? 'en' : 'ar';
  });

  const [activeView, setActiveView] = useState<MainNavView>('home');
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [currentLink, setCurrentLink] = useState<TrackingLink | null>(null);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [savedLinks, setSavedLinks] = useState<TrackingLink[]>(() => {
    try {
      const saved = localStorage.getItem(SAVED_LINKS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [pendingView, setPendingView] = useState<MainNavView | null>(null);

  const [globalVisits, setGlobalVisits] = useState(800);
  const [globalLinks, setGlobalLinks] = useState(1500);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.classList.remove('dark');
  }, [lang]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    const tabParam = params.get('tab');

    if (codeParam) {
      setActiveCode(codeParam);
      setActiveView('track');
    } else if (tabParam === 'ip-lookup' || tabParam === 'support') {
      setActiveView(tabParam);
    }
  }, []);

  useEffect(() => {
    const token = getOrSetUserToken();
    fetch(`/api/user-links?token=${encodeURIComponent(token)}`, {
      headers: {
        'x-user-token': token,
        'x-sm-auth': 'active'
      },
    })
      .then(async (res) => {
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          return res.json();
        }
        return { success: false };
      })
      .then((data) => {
        if (data && data.success) {
          if (data.globalVisits != null) setGlobalVisits(data.globalVisits);
          if (data.globalLinks != null) setGlobalLinks(data.globalLinks);
          
          if (Array.isArray(data.links)) {
            setSavedLinks((prev) => {
              const map = new Map<string, TrackingLink>();
              data.links.forEach((l: TrackingLink) => map.set(l.code, l));
              prev.forEach((l: TrackingLink) => {
                if (!map.has(l.code)) map.set(l.code, l);
              });
              const merged = Array.from(map.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              persistLinks(merged);
              return merged;
            });
          }
        }
      })
      .catch((err) => console.warn('Sync user links notice:', err));
  }, []);

  const persistLinks = (links: TrackingLink[]) => {
    setSavedLinks(links);
    try {
      localStorage.setItem(SAVED_LINKS_KEY, JSON.stringify(links));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLinkData = useCallback(async (code: string) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/links/${code}`, {
        headers: { 'x-sm-auth': 'active' }
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.success) {
          setCurrentLink(data.link);
          setVisits(data.visits || []);

          setSavedLinks((prev) => {
            const next = prev.map((l) =>
              l.code === code ? { ...l, visitCount: data.visits?.length || 0 } : l
            );
            persistLinks(next);
            return next;
          });
          return;
        }
      }
      setActiveCode(null);
      setCurrentLink(null);
      setActiveView('home');
    } catch (err) {
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (activeCode) {
      fetchLinkData(activeCode);
      const interval = setInterval(() => {
        fetchLinkData(activeCode);
      }, 8000);
      return () => clearInterval(interval);
    } else {
      setCurrentLink(null);
      setVisits([]);
    }
  }, [activeCode, fetchLinkData]);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const handleCreateLink = async (originalUrl: string, mode: TrackingMode) => {
    if (!checkIsRobotVerified()) {
      setShowCaptcha(true);
      return;
    }

    setIsCreating(true);
    try {
      const userToken = getOrSetUserToken();
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sm-auth': 'active'
        },
        body: JSON.stringify({ originalUrl, mode, userToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to generate tracking link');
      }

      if (data.success && data.link) {
        const newLink: TrackingLink = data.link;
        const updated = [newLink, ...savedLinks.filter((l) => l.code !== newLink.code)];
        persistLinks(updated);
        setActiveCode(newLink.code);
        setActiveView('track');
        window.history.pushState({}, '', `?code=${newLink.code}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteLink = async (code: string) => {
    try {
      await fetch(`/api/links/${code}`, {
        method: 'DELETE',
        headers: { 'x-sm-auth': 'active' }
      });
    } catch (err) {
    } finally {
      const updated = savedLinks.filter((l) => l.code !== code);
      persistLinks(updated);
      setActiveCode(null);
      setCurrentLink(null);
      setVisits([]);
      setActiveView('home');
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  const handleSelectLink = (code: string) => {
    if (!checkIsRobotVerified()) {
      setShowCaptcha(true);
      return;
    }
    setActiveCode(code);
    setActiveView('track');
    window.history.pushState({}, '', `?code=${code}`);
    setShowSavedModal(false);
  };

  const handleGoHome = () => {
    setActiveCode(null);
    setCurrentLink(null);
    setVisits([]);
    setActiveView('home');
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleChangeView = (view: MainNavView) => {
    if (!checkIsRobotVerified()) {
      setPendingView(view);
      setShowCaptcha(true);
      return;
    }

    executeChangeView(view);
  };

  const executeChangeView = (view: MainNavView) => {
    setActiveView(view);
    if (view !== 'track') {
      setActiveCode(null);
      setCurrentLink(null);
      setVisits([]);
      const url = view === 'home' ? window.location.pathname : `?tab=${view}`;
      window.history.pushState({}, '', url);
    }
  };

  const handleCaptchaSuccess = () => {
    setShowCaptcha(false);
    if (pendingView) {
      executeChangeView(pendingView);
      setPendingView(null);
    }
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        onGoHome={handleGoHome}
        activeView={activeCode ? 'track' : activeView}
        onChangeView={handleChangeView}
        savedCount={savedLinks.length}
        onOpenSaved={() => setShowSavedModal(true)}
      />

      <main className="flex-1 flex flex-col items-center w-full max-w-7xl mx-auto px-2 sm:px-4">
        {activeCode && currentLink ? (
          <TrackDashboard
            link={currentLink}
            visits={visits}
            lang={lang}
            onRefresh={() => fetchLinkData(activeCode)}
            isRefreshing={isRefreshing}
            onDelete={handleDeleteLink}
            onGoHome={handleGoHome}
          />
        ) : activeView === 'ip-lookup' ? (
          <IpLookupView lang={lang} />
        ) : activeView === 'mac-lookup' ? (
          <MacLookupView lang={lang} />
        ) : activeView === 'exif-tool' ? (
          <ExifToolView lang={lang} />
        ) : activeView === 'cyber-awareness' ? (
          <CyberAwarenessView lang={lang} />
        ) : activeView === 'support' ? (
          <SupportView lang={lang} />
        ) : (
          <HomeView
            lang={lang}
            onCreateLink={handleCreateLink}
            isCreating={isCreating}
            savedLinks={savedLinks}
            onSelectLink={handleSelectLink}
            onViewChange={handleChangeView}
            onNavigateIpLookup={() => handleChangeView('ip-lookup')}
            globalVisits={globalVisits}
            globalLinks={globalLinks}
          />
        )}
      </main>

      <RobotCaptchaModal
        isOpen={showCaptcha}
        lang={lang}
        onVerifySuccess={handleCaptchaSuccess}
      />

      {showSavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-4 sm:p-5 max-w-md w-full flex flex-col gap-3 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs sm:text-sm font-black text-slate-950">
                  {t.recentLinksTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowSavedModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-950 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex flex-col gap-2 max-h-96 pe-1">
              {savedLinks.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  {t.noRecentLinks}
                </p>
              ) : (
                savedLinks.map((link) => (
                  <div
                    key={link.code}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 flex items-center justify-between gap-2.5 transition-colors shadow-2xs"
                  >
                    <div
                      onClick={() => handleSelectLink(link.code)}
                      className="flex flex-col gap-0.5 flex-1 cursor-pointer min-w-0"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-slate-950">
                          /{link.code}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
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
                      <span className="text-[11px] text-slate-500 truncate">
                        {link.originalUrl}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteLink(link.code)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                      title={t.deleteLink}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <Footer lang={lang} />
    </div>
  );
}
