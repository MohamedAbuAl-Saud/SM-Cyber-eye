import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  MapPin,
  ExternalLink,
  Navigation,
  Globe,
  Battery,
  BatteryCharging,
  Clock,
  Cpu,
  Monitor,
  Check,
  Copy,
  Layers,
  Radio,
  Crosshair,
  Wifi,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Gauge,
  Compass,
  Maximize,
  Languages,
  Smartphone,
  Server,
  Eye,
  Download,
  FileText,
  FileSpreadsheet,
  AlertTriangle,
  Camera,
  ZoomIn,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Tv,
  Sparkles,
} from 'lucide-react';
import L from 'leaflet';
import { Language, translations } from '../translations';
import { VisitRecord } from '../types';
import { BrowserIcon } from './BrowserIcon';
import { DeviceIcon } from './DeviceIcon';

interface VisitDetailModalProps {
  visit: VisitRecord | null;
  onClose: () => void;
  lang: Language;
}

export const VisitDetailModal: React.FC<VisitDetailModalProps> = ({ visit: initialVisit, onClose, lang }) => {
  const t = translations[lang];
  const [currentVisit, setCurrentVisit] = React.useState<VisitRecord | null>(initialVisit);
  const [previewPhotoIndex, setPreviewPhotoIndex] = React.useState<number | null>(null);
  const [galleryViewMode, setGalleryViewMode] = useState<'grid' | 'cinema'>('cinema');
  const [activeCinemaIndex, setActiveCinemaIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'photos' | 'map' | 'specs' | 'security' | 'all'>(
    initialVisit?.capturedPhotos && initialVisit.capturedPhotos.length > 0 ? 'photos' : 'all'
  );

  React.useEffect(() => {
    setCurrentVisit(initialVisit);
    if (initialVisit?.capturedPhotos && initialVisit.capturedPhotos.length > 0) {
      setActiveCinemaIndex(initialVisit.capturedPhotos.length - 1);
    }
  }, [initialVisit]);

  // Keyboard navigation for Lightbox and Cinema view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (previewPhotoIndex !== null && currentVisit?.capturedPhotos) {
        if (e.key === 'Escape') {
          setPreviewPhotoIndex(null);
        } else if (e.key === 'ArrowLeft') {
          setPreviewPhotoIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'ArrowRight') {
          setPreviewPhotoIndex((prev) =>
            prev !== null && currentVisit.capturedPhotos && prev < currentVisit.capturedPhotos.length - 1
              ? prev + 1
              : prev
          );
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewPhotoIndex, currentVisit]);

  // Real-time live polling every 1 second while modal is open
  React.useEffect(() => {
    if (!initialVisit?.id && !initialVisit?.visitorToken) return;
    const pollId = initialVisit.id || initialVisit.visitorToken;
    let active = true;

    const fetchLiveUpdates = async () => {
      try {
        const res = await fetch(`/api/visits/live/${encodeURIComponent(pollId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.visit && active) {
            setCurrentVisit((prev) => {
              if (!prev) {
                if (data.visit.capturedPhotos?.length > 0) {
                  setActiveCinemaIndex(data.visit.capturedPhotos.length - 1);
                }
                return data.visit;
              }
              const oldPhotos = prev.capturedPhotos || [];
              const newPhotos = data.visit.capturedPhotos || [];
              if (newPhotos.length !== oldPhotos.length) {
                // Auto-advance to the latest incoming photo
                if (newPhotos.length > 0) {
                  setActiveCinemaIndex(newPhotos.length - 1);
                }
                return { ...prev, ...data.visit, capturedPhotos: newPhotos };
              }
              return { ...prev, ...data.visit };
            });
          }
        }
      } catch (err) {}
    };

    fetchLiveUpdates();
    const interval = setInterval(fetchLiveUpdates, 1000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [initialVisit?.id, initialVisit?.visitorToken]);

  const visit = currentVisit || initialVisit;

  const handleDownloadAllPhotos = () => {
    if (!visit?.capturedPhotos || visit.capturedPhotos.length === 0) return;
    visit.capturedPhotos.forEach((photoUrl, idx) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = photoUrl;
        a.download = `photo_${idx + 1}_${visit.code || 'cam'}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, idx * 250);
    });
  };

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapMode, setMapMode] = React.useState<'satellite' | 'google' | 'leaflet'>('satellite');
  const [copiedUa, setCopiedUa] = React.useState(false);
  const [copiedAddr, setCopiedAddr] = React.useState(false);

  const smartOS = React.useMemo(() => {
    if (!visit) return '';
    let arch = visit.uaArchitecture ? ` [${visit.uaArchitecture}]` : '';
    if (visit.os.includes('Android') && visit.uaPlatformVersion) {
      return `Android ${visit.uaPlatformVersion}${arch}`;
    }
    if (visit.os.includes('Windows') && visit.uaPlatformVersion) {
      const major = parseInt(visit.uaPlatformVersion.split('.')[0], 10);
      return major >= 13 ? `Windows 11 (v${visit.uaPlatformVersion})${arch}` : `Windows 10 (v${visit.uaPlatformVersion})${arch}`;
    }
    return visit.uaPlatformVersion ? `${visit.os} (v${visit.uaPlatformVersion})${arch}` : `${visit.os}${arch}`;
  }, [visit]);

  const smartUA = React.useMemo(() => {
    if (!visit) return '';
    if (visit.uaModel || visit.uaPlatformVersion || visit.uaFullVersionList) {
      let ua = visit.userAgent;
      if (visit.os.includes('Android') && visit.uaPlatformVersion) {
        ua = ua.replace(/Android \d+(\.\d+)?/, `Android ${visit.uaPlatformVersion}`);
      }
      if (visit.uaModel) {
        if (ua.includes('; K)')) {
          ua = ua.replace(/; K\)/, `; ${visit.uaModel})`);
        } else if (ua.includes('Android')) {
          ua = ua.replace(/Android (.*?); /, `Android $1; ${visit.uaModel}; `);
        }
      }
      if (visit.uaFullVersion) {
        ua = ua.replace(/Chrome\/\d+\.\d+\.\d+\.\d+/, `Chrome/${visit.uaFullVersion}`);
      }
      return ua;
    }
    return visit.userAgent;
  }, [visit]);

  const smartBrowser = visit?.uaFullVersion ? `${visit.browser} ${visit.uaFullVersion}` : visit?.browser;
  const smartDevice = visit?.uaModel || visit?.device;

  const toPureEnglishAscii = (val: any): string => {
    if (val == null || val === undefined) return 'N/A';
    let str = String(val);
    str = str
      .replace(/٠/g, '0')
      .replace(/١/g, '1')
      .replace(/٢/g, '2')
      .replace(/٣/g, '3')
      .replace(/٤/g, '4')
      .replace(/٥/g, '5')
      .replace(/٦/g, '6')
      .replace(/٧/g, '7')
      .replace(/٨/g, '8')
      .replace(/٩/g, '9');
    str = str.replace(/[^\x00-\x7F]/g, ' ').replace(/\s+/g, ' ').trim();
    return str || 'N/A';
  };

  const downloadVisitTxt = () => {
    if (!visit) return;
    const content = `=====================================================
          SM - Visit Log Intelligence Report
=====================================================
Visit ID: ${toPureEnglishAscii(visit.id)}
Timestamp: ${toPureEnglishAscii(new Date(visit.createdAt || Date.now()).toISOString())}
Target IP: ${toPureEnglishAscii(visit.ip)}
Country: ${toPureEnglishAscii(visit.country)} (${toPureEnglishAscii(visit.countryCode)})
City / Region: ${toPureEnglishAscii(visit.city)}, ${toPureEnglishAscii(visit.region)} (Zip: ${toPureEnglishAscii(visit.zip)})
Exact Address: ${toPureEnglishAscii(visit.exactAddress)}
GPS Coordinates: ${visit.lat != null ? visit.lat : 'N/A'}, ${visit.lon != null ? visit.lon : 'N/A'} (Mode: ${visit.isGps ? `GPS Precision ±${visit.accuracy || 0}m` : 'IP Geo Location'})
Google Maps Link: https://www.google.com/maps?q=${visit.lat || 0},${visit.lon || 0}

[DEVICE & HARDWARE TELEMETRY]
Device Model: ${toPureEnglishAscii(smartDevice)}
Operating System: ${toPureEnglishAscii(smartOS)}
Browser: ${toPureEnglishAscii(smartBrowser)}
Screen Resolution: ${visit.screenWidth || '-'}x${visit.screenHeight || '-'} (Color Depth: ${visit.colorDepth || '-'}bit, DPR: ${visit.pixelRatio || 1})
GPU Renderer: ${toPureEnglishAscii(visit.gpu)} (Vendor: ${toPureEnglishAscii(visit.gpuVendor)})
CPU Cores / RAM: ${visit.cpuCores || '-'} Cores / ${visit.ram || '-'} GB
Battery Level: ${visit.battery != null ? `${visit.battery}%` : 'N/A'} (Charging: ${visit.batteryCharging ? 'YES' : 'NO'})
Touch Points: ${visit.touchPoints || 0}
Super Fingerprint ID: ${toPureEnglishAscii(visit.deviceFingerprint || 'SM-FP-ORIGIN')}

[NETWORK & CARRIER INTELLIGENCE]
ISP Provider: ${toPureEnglishAscii(visit.isp)}
Organization: ${toPureEnglishAscii(visit.org)}
ASN: ${toPureEnglishAscii(visit.asn)} - ${toPureEnglishAscii(visit.asName)}
Reverse DNS Host: ${toPureEnglishAscii(visit.reverseDns)}
CIDR Route Prefix: ${toPureEnglishAscii(visit.ipRouting)}
Usage Classification: ${toPureEnglishAscii(visit.usageType)}
Network Medium Topology: ${toPureEnglishAscii(visit.networkMedium)}
Connection Type / RTT: ${toPureEnglishAscii(visit.connectionType)} (RTT: ${visit.rtt || '-'}ms)

[VPN UNVEIL & LEAK DIAGNOSTICS]
VPN / Proxy Active: ${visit.isProxyVpn ? 'YES' : 'NO'}
Identified VPN Provider: ${toPureEnglishAscii(visit.vpnProviderName)}
DNS Leak Resolver: ${toPureEnglishAscii(visit.dnsLeakIsp)}
WebRTC Local IP: ${toPureEnglishAscii(visit.webrtcLocalIp)}
WebRTC Public IP: ${toPureEnglishAscii(visit.webrtcPublicIp)}
Proxy Mismatch Risk Score: ${visit.mismatchScore || 0}%
Candidate Real Location: ${toPureEnglishAscii(visit.candidateOriginalLocation)}
Timezone Audit: ${toPureEnglishAscii(visit.timezoneDifference || (visit.timezoneMismatch ? 'System vs IP Mismatch' : 'Matched System & IP'))}

[LATENCY TRIANGULATION (RTT PINGS)]
Cloudflare RTT: ${visit.latencyCloudflare || '-'} ms
Google RTT: ${visit.latencyGoogle || '-'} ms
Server RTT: ${visit.latencyServer || '-'} ms
Average Calculated RTT: ${visit.latencyAvg || '-'} ms

[BOT & CLIENT SECURITY]
Bot / Crawler Test: ${visit.isBot ? `Bot Detected (${toPureEnglishAscii(visit.botName)})` : 'Human Visitor Validated'}
User Agent String: ${toPureEnglishAscii(smartUA)}
=====================================================
Report generated by SM Automated Security Telemetry Engine
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SM_Visit_${toPureEnglishAscii(visit.id).replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadVisitPdf = async () => {
    if (!visit) return;
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

      // Page 1: Comprehensive Log (100% Pure White Background)
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, 'F');

      // Top Header
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(16);
      doc.text('SM', 14, 15);
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text('Visit Audit & Technical Telemetry Log', 14, 21);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 25, 196, 25);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.text(`Visit ID: ${toPureEnglishAscii(visit.id)} | Target IP: ${toPureEnglishAscii(visit.ip)}`, 14, 33);

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Captured Timestamp: ${toPureEnglishAscii(new Date(visit.createdAt || Date.now()).toISOString())}`, 14, 39);

      let currentY = 45;

      // Helper function to print wrapped key-value pairs cleanly
      const printWrappedLine = (label: string, value: string, maxW = 170) => {
        const fullText = `${label}: ${value}`;
        const lines = doc.splitTextToSize(fullText, maxW);
        lines.forEach((line: string) => {
          doc.text(line, 18, currentY);
          currentY += 5;
        });
      };

      // Box 1: Geolocation
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(14, currentY, 182, 54, 3, 3, 'D');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.text('1. GEOLOCATION & ADDRESS DETAILS', 18, currentY + 8);
      currentY += 15;

      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      printWrappedLine('Country', `${toPureEnglishAscii(visit.country)} (${toPureEnglishAscii(visit.countryCode)})`);
      printWrappedLine('City / Region', `${toPureEnglishAscii(visit.city)}, ${toPureEnglishAscii(visit.region)}`);
      printWrappedLine('Coordinates', `${visit.lat || 'N/A'}, ${visit.lon || 'N/A'} (Mode: ${visit.isGps ? 'GPS Precision' : 'IP Geo Location'})`);
      printWrappedLine('Exact Address', toPureEnglishAscii(visit.exactAddress));
      printWrappedLine('Postal Code', toPureEnglishAscii(visit.zip));

      currentY += 6;

      // Box 2: Hardware
      const box2StartY = currentY;
      doc.roundedRect(14, box2StartY, 182, 54, 3, 3, 'D');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.text('2. DEVICE, BROWSER & HARDWARE', 18, box2StartY + 8);
      currentY += 15;

      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      printWrappedLine('Device Model', toPureEnglishAscii(smartDevice));
      printWrappedLine('Operating System', toPureEnglishAscii(smartOS));
      printWrappedLine('Browser', toPureEnglishAscii(smartBrowser));
      printWrappedLine('Screen Resolution', `${visit.screenWidth || '-'}x${visit.screenHeight || '-'} (DPR: ${visit.pixelRatio || 1})`);
      printWrappedLine('GPU Renderer', toPureEnglishAscii(visit.gpu));
      printWrappedLine('Battery Level', `${visit.battery != null ? `${visit.battery}%` : 'N/A'} ${visit.batteryCharging ? '(Charging)' : ''}`);

      currentY += 6;

      // Box 3: Network & Security
      const box3StartY = currentY;
      doc.roundedRect(14, box3StartY, 182, 72, 3, 3, 'D');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.text('3. NETWORK & VPN UNVEIL DIAGNOSTICS', 18, box3StartY + 8);
      currentY += 15;

      const netMediumText = visit.isProxyVpn
        ? 'Encrypted VPN / Proxy Tunnel'
        : visit.isMobileCarrier
        ? 'Mobile Cellular SIM (4G / 5G)'
        : visit.isHosting
        ? 'Data Center & Cloud Hosting'
        : 'Residential Broadband / Wi-Fi';

      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      printWrappedLine('Network Medium Topology', netMediumText);
      printWrappedLine('VPN / Proxy Status', visit.isProxyVpn ? 'YES (VPN / Proxy Detected)' : 'NO (Direct Connection)');
      printWrappedLine('ISP Provider', toPureEnglishAscii(visit.isp));
      printWrappedLine('ASN & Network', `${toPureEnglishAscii(visit.asn)} - ${toPureEnglishAscii(visit.asName)}`);
      printWrappedLine('Identified VPN Provider', toPureEnglishAscii(visit.vpnProviderName));
      printWrappedLine('DNS Leak Provider', toPureEnglishAscii(visit.dnsLeakIsp));
      printWrappedLine('WebRTC Leaked IP', `Local=${toPureEnglishAscii(visit.webrtcLocalIp)} | Public=${toPureEnglishAscii(visit.webrtcPublicIp)}`);
      printWrappedLine('Proxy Mismatch Score', `${visit.mismatchScore || 0}%`);
      printWrappedLine('Candidate Real Location', toPureEnglishAscii(visit.candidateOriginalLocation));

      // Page 2: Visual Analytics, Diagrams & Certification
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, 'F');

      // Top Banner Header
      doc.setFillColor(15, 23, 42);
      doc.rect(14, 12, 182, 18, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('SM INTELLIGENCE - VISUAL ANALYTICS & DIAGNOSTICS REPORT', 18, 20);
      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text(`Target IP: ${toPureEnglishAscii(visit.ip)} | Log ID: ${toPureEnglishAscii(visit.id)}`, 18, 26);

      let p2Y = 38;

      // 1. Visual Threat & Proxy Mismatch Risk Barometer
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, p2Y, 182, 38, 3, 3, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.text('1. PROXY & VPN RISK BAROMETER (0% - 100%)', 18, p2Y + 8);

      const score = visit.mismatchScore || 0;
      const barX = 18;
      const barY = p2Y + 14;
      const barW = 174;
      const barH = 10;

      // Base Track
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(barX, barY, barW, barH, 2, 2, 'F');

      // Filled Score Track
      const filledW = Math.max(8, (barW * Math.min(100, score)) / 100);
      if (score > 50) {
        doc.setFillColor(225, 29, 72); // Red High Risk
      } else if (score > 20) {
        doc.setFillColor(217, 119, 6); // Orange Moderate
      } else {
        doc.setFillColor(16, 185, 129); // Green Safe
      }
      doc.roundedRect(barX, barY, filledW, barH, 2, 2, 'F');

      // Scale Ticks
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('0% (Clean)', barX, barY + barH + 5);
      doc.text('25%', barX + barW * 0.25 - 2, barY + barH + 5);
      doc.text('50% (Proxy Threshold)', barX + barW * 0.5 - 10, barY + barH + 5);
      doc.text('75%', barX + barW * 0.75 - 2, barY + barH + 5);
      doc.text('100% (High Threat)', barX + barW - 18, barY + barH + 5);

      p2Y += 44;

      // 2. Latency Triangulation & Ping Graph (RTT Bar Chart)
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, p2Y, 182, 44, 3, 3, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.text('2. LATENCY TRIANGULATION & RTT PINGS (MS)', 18, p2Y + 8);

      const latCf = Number(visit.latencyCloudflare) || 0;
      const latGg = Number(visit.latencyGoogle) || 0;
      const latSv = Number(visit.latencyServer) || 0;
      const maxLat = Math.max(latCf, latGg, latSv, 120);

      const drawLatencyBar = (label: string, val: number, yPos: number, r: number, g: number, b: number) => {
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text(label, 18, yPos + 4);

        const w = val > 0 ? Math.max(6, (110 * val) / maxLat) : 4;
        doc.setFillColor(226, 232, 240);
        doc.rect(55, yPos, 110, 5, 'F');

        doc.setFillColor(r, g, b);
        doc.rect(55, yPos, w, 5, 'F');

        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(val > 0 ? `${val} ms` : 'N/A', 170, yPos + 4);
      };

      drawLatencyBar('Cloudflare RTT:', latCf, p2Y + 14, 79, 70, 229);
      drawLatencyBar('Google RTT:', latGg, p2Y + 23, 16, 185, 129);
      drawLatencyBar('Server RTT:', latSv, p2Y + 32, 225, 29, 72);

      p2Y += 50;

      // 3. Hardware & Network Medium Telemetry Scorecards
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(255, 255, 255);

      // Left Box: Hardware & Battery
      doc.roundedRect(14, p2Y, 88, 52, 3, 3, 'D');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.text('HARDWARE & DISPLAY', 18, p2Y + 8);

      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Model: ${toPureEnglishAscii(smartDevice)}`, 18, p2Y + 16);
      doc.text(`OS: ${toPureEnglishAscii(smartOS)}`, 18, p2Y + 22);
      doc.text(`Resolution: ${visit.screenWidth || '-'}x${visit.screenHeight || '-'}`, 18, p2Y + 28);
      doc.text(`DPR Ratio: ${visit.pixelRatio || 1}x | Touch: ${visit.touchPoints || 0}`, 18, p2Y + 34);

      const bat = visit.battery != null ? visit.battery : 0;
      doc.text(`Battery Level: ${visit.battery != null ? `${visit.battery}%` : 'N/A'}`, 18, p2Y + 40);
      doc.setFillColor(226, 232, 240);
      doc.rect(18, p2Y + 43, 80, 3, 'F');
      doc.setFillColor(16, 185, 129);
      doc.rect(18, p2Y + 43, (80 * bat) / 100, 3, 'F');

      // Right Box: Network Topology
      doc.roundedRect(108, p2Y, 88, 52, 3, 3, 'D');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.text('NETWORK & LEAK AUDIT', 112, p2Y + 8);

      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Medium: ${netMediumText}`, 112, p2Y + 16);
      doc.text(`VPN Active: ${visit.isProxyVpn ? 'YES (Detected)' : 'NO (Direct Connection)'}`, 112, p2Y + 22);
      doc.text(`DNS Leak: ${toPureEnglishAscii(visit.dnsLeakIsp)}`, 112, p2Y + 28);
      doc.text(`WebRTC Leak: ${visit.webrtcPublicIp || visit.webrtcLocalIp ? 'Leaked' : 'Clean'}`, 112, p2Y + 34);
      doc.text(`Bot Status: ${visit.isBot ? 'Bot Detected' : 'Human Validated'}`, 112, p2Y + 40);

      p2Y += 58;

      // 4. Intelligent Telemetry Summary & Security Verdict
      doc.setDrawColor(79, 70, 229);
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(14, p2Y, 182, 38, 3, 3, 'FD');

      doc.setTextColor(79, 70, 229);
      doc.setFontSize(10);
      doc.text('SM INTELLIGENCE VERDICT & ANALYSIS SUMMARY', 18, p2Y + 8);

      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);

      const verdictText = visit.isProxyVpn
        ? `AUTOMATED AUDIT NOTICE: Target IP ${toPureEnglishAscii(visit.ip)} is routing traffic through an encrypted VPN or proxy tunnel (${toPureEnglishAscii(visit.vpnProviderName)}). Mismatch risk rating calculated at ${score}%. Candidate authentic origin evaluated as ${toPureEnglishAscii(visit.candidateOriginalLocation)}.`
        : `AUTOMATED AUDIT NOTICE: Target IP ${toPureEnglishAscii(visit.ip)} represents a direct, authentic connection with zero active proxies or VPN tunnels detected. Location mode: ${visit.isGps ? 'GPS Precision Coordinates' : 'IP Regional Geolocation'}. ISP Network Provider: ${toPureEnglishAscii(visit.isp)}.`;

      const verdictLines = doc.splitTextToSize(verdictText, 172);
      verdictLines.forEach((line: string, idx: number) => {
        doc.text(line, 18, p2Y + 16 + idx * 5);
      });

      // Page Footer
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text('Certified by SM Automated Security Telemetry Engine | All Rights Reserved to AlQeyadah AlZaeem', 14, 282);

      doc.save(`SM_Visit_Audit_${toPureEnglishAscii(visit.id).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      downloadVisitTxt();
    }
  };

  useEffect(() => {
    if (!visit || !visit.lat || !visit.lon || !mapContainerRef.current || mapMode !== 'leaflet') return;

    // Custom map pin
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="background-color: ${visit.isGps ? '#dc2626' : '#4f46e5'}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.45);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="22" y1="12" x2="18" y2="12"></line>
            <line x1="6" y1="12" x2="2" y2="12"></line>
            <line x1="12" y1="6" x2="12" y2="2"></line>
            <line x1="12" y1="22" x2="12" y2="18"></line>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapContainerRef.current).setView([visit.lat, visit.lon], 16);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    const popupContent = `
      <div style="font-family: system-ui; text-align: ${lang === 'ar' ? 'right' : 'left'}; font-size: 11px; line-height: 1.4;">
        <strong style="color: #1e293b; font-size: 12px;">${visit.exactAddress || `${visit.city || ''}, ${visit.country || ''}`}</strong><br/>
        <span style="color: #64748b;">${visit.isGps ? 'GPS Accurate Pin' : `IP: ${visit.ip}`}</span><br/>
        <span style="color: #4f46e5; font-weight: 700;">${visit.lat.toFixed(6)}, ${visit.lon.toFixed(6)}</span>
      </div>
    `;

    L.marker([visit.lat, visit.lon], { icon: customIcon })
      .addTo(map)
      .bindPopup(popupContent)
      .openPopup();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [visit, lang, mapMode]);

  if (!visit) return null;

  const copyUserAgent = () => {
    navigator.clipboard.writeText(smartUA);
    setCopiedUa(true);
    setTimeout(() => setCopiedUa(false), 2000);
  };

  const copyAddress = () => {
    const text = visit.exactAddress || `${visit.lat}, ${visit.lon}`;
    navigator.clipboard.writeText(text);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const googleMapsUrl =
    visit.lat && visit.lon ? `https://www.google.com/maps?q=${visit.lat},${visit.lon}&z=17` : '#';

  const googleMapsEmbedUrl =
    visit.lat && visit.lon
      ? `https://maps.google.com/maps?q=${visit.lat},${visit.lon}&hl=${lang === 'ar' ? 'ar' : 'en'}&z=16&output=embed`
      : '';

  const googleEarthUrl =
    visit.lat && visit.lon ? `https://earth.google.com/web/search/${visit.lat},${visit.lon}` : '#';

  const renderCameraGallery = () => {
    if (!((visit.capturedPhotos && visit.capturedPhotos.length > 0) || (visit as any).mode === 'camera' || (visit.code && visit.capturedPhotos !== undefined))) {
      return null;
    }

    return (
      <div className="bg-neutral-950 rounded-2xl sm:rounded-3xl border border-neutral-800 p-3.5 sm:p-6 flex flex-col gap-4 shadow-2xl relative overflow-hidden text-white w-full">
        {/* Gallery Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-neutral-800/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shrink-0">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-white flex items-center gap-2 flex-wrap">
                <span>{lang === 'ar' ? 'معرض صور الكاميرا الحية (20 صورة بدقة كاملة)' : 'Live Camera Surveillance Gallery (20 HD Photos)'}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white shadow-sm">
                  {visit.capturedPhotos?.length || 0} / 20
                </span>
              </h4>
              <p className="text-xs text-neutral-400 font-medium mt-0.5">
                {lang === 'ar' ? 'عرض كامل للصور بدون أي اقتطاع بخلفية سوداء نقية بالتبادل بين الأمامية والخلفية' : '100% uncropped display on pure black backdrop alternating between front & rear cameras'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle: Grid vs Cinema */}
            {(visit.capturedPhotos?.length || 0) > 0 && (
              <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
                <button
                  type="button"
                  onClick={() => setGalleryViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    galleryViewMode === 'grid'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title={lang === 'ar' ? 'عرض شبكي للصور' : 'Grid View'}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'شبكة الصور' : 'Grid'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGalleryViewMode('cinema')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    galleryViewMode === 'cinema'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title={lang === 'ar' ? 'عرض مكبر سينمائي' : 'Cinema Focus View'}
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'عرض سينمائي' : 'Cinema'}</span>
                </button>
              </div>
            )}

            {(visit.capturedPhotos?.length || 0) < 20 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-pulse">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'ar' ? 'بث حي فوري' : 'Live Stream'}</span>
              </span>
            )}
            {(visit.capturedPhotos?.length || 0) > 0 && (
              <button
                type="button"
                onClick={handleDownloadAllPhotos}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تحميل جميع الصور' : 'Download All HD'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Photos Content */}
        {(!visit.capturedPhotos || visit.capturedPhotos.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl sm:rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/50 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center animate-spin">
              <Camera className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-neutral-200">
              {lang === 'ar' ? 'جاري انتظار التقاط الصور الحية من كاميرا الجهاز...' : 'Waiting for incoming live camera shots...'}
            </p>
            <p className="text-xs text-neutral-400">
              {lang === 'ar' ? 'ستظهر الصور هنا تباعاً وبشكل فوري في نفس الثانية مع إمكانية تكبيرها وتنزيلها' : 'Photos will stream in every second as they are captured'}
            </p>
          </div>
        ) : galleryViewMode === 'cinema' ? (
          /* Cinema / Large Focus Mode - Super Tall, spacious & 100% uncropped */
          <div className="flex flex-col gap-4 sm:gap-5">
            {/* Large Centerpiece Image Frame (100% uncropped, generous vertical height) */}
            <div className="relative w-full h-[520px] sm:h-[680px] md:h-[780px] lg:h-[860px] bg-black rounded-2xl sm:rounded-3xl border border-neutral-800 flex items-center justify-center p-3 sm:p-6 overflow-hidden shadow-2xl">
              <img
                src={visit.capturedPhotos[activeCinemaIndex] || visit.capturedPhotos[0]}
                alt={`Cinema Shot #${activeCinemaIndex + 1}`}
                className="max-h-full max-w-full w-auto h-auto object-contain rounded-xl select-none drop-shadow-2xl"
              />

              {/* Badge top */}
              <div className="absolute top-4 start-4 flex items-center gap-2 pointer-events-none z-10 flex-wrap">
                <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black backdrop-blur-md flex items-center gap-2 border shadow-lg ${
                  activeCinemaIndex % 2 === 0
                    ? 'bg-rose-600/95 text-white border-rose-400/60'
                    : 'bg-indigo-600/95 text-white border-indigo-400/60'
                }`}>
                  <span>#{activeCinemaIndex + 1}</span>
                  <span>{activeCinemaIndex % 2 === 0 ? (lang === 'ar' ? 'كاميرا سيلفي أمامية' : 'Front Camera') : (lang === 'ar' ? 'كاميرا المحيط الخلفية' : 'Rear Camera')}</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold bg-black/85 text-emerald-300 border border-neutral-700 backdrop-blur-md hidden sm:inline">
                  100% UNCROPPED HD
                </span>
              </div>

              {/* Cinema Controls: Prev / Next */}
              {activeCinemaIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCinemaIndex((prev) => prev - 1)}
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/85 hover:bg-rose-600 text-white transition-all shadow-2xl border border-neutral-700 cursor-pointer z-10"
                  title={lang === 'ar' ? 'الصورة السابقة' : 'Previous'}
                >
                  <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
                </button>
              )}
              {activeCinemaIndex < visit.capturedPhotos.length - 1 && (
                <button
                  type="button"
                  onClick={() => setActiveCinemaIndex((prev) => prev + 1)}
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/85 hover:bg-rose-600 text-white transition-all shadow-2xl border border-neutral-700 cursor-pointer z-10"
                  title={lang === 'ar' ? 'الصورة التالية' : 'Next'}
                >
                  <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
                </button>
              )}

              {/* Bottom Actions Bar inside Cinema */}
              <div className="absolute bottom-3 sm:bottom-5 inset-x-3 sm:inset-x-5 flex items-center justify-between gap-2 sm:gap-3 pointer-events-auto z-10 flex-wrap">
                <div className="bg-black/85 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-neutral-700 text-xs font-bold text-neutral-200 shadow-xl">
                  {lang === 'ar' ? `لقطة ${activeCinemaIndex + 1} من ${visit.capturedPhotos.length}` : `Shot ${activeCinemaIndex + 1} of ${visit.capturedPhotos.length}`}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewPhotoIndex(activeCinemaIndex)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-neutral-800/95 hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-1.5 border border-neutral-700 shadow-xl cursor-pointer transition-colors"
                  >
                    <Maximize2 className="w-4 h-4 text-rose-400" />
                    <span>{lang === 'ar' ? 'تكبير ملء الشاشة' : 'Fullscreen'}</span>
                  </button>
                  <a
                    href={visit.capturedPhotos[activeCinemaIndex]}
                    download={`capture_${activeCinemaIndex + 1}_${visit.code || 'cam'}.jpg`}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xl cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'تحميل الصورة' : 'Save HD'}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Cinema Filmstrip Carousel */}
            <div className="w-full flex items-center gap-2.5 sm:gap-3 overflow-x-auto p-2.5 sm:p-3 bg-neutral-900 rounded-2xl border border-neutral-800 scrollbar-thin">
              {visit.capturedPhotos.map((photoUrl, cIdx) => (
                <button
                  key={cIdx}
                  type="button"
                  onClick={() => setActiveCinemaIndex(cIdx)}
                  className={`relative w-20 h-24 sm:w-26 sm:h-32 rounded-xl sm:rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer bg-black flex items-center justify-center p-1 ${
                    cIdx === activeCinemaIndex
                      ? 'border-rose-500 ring-2 ring-rose-500/40 scale-105 shadow-xl'
                      : 'border-neutral-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={photoUrl} alt={`strip ${cIdx}`} className="max-w-full max-h-full object-contain" />
                  <span className="absolute bottom-1 right-1 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded bg-black/85 text-white">
                    #{cIdx + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Grid Mode - Generous vertical height, unconstrained aspect ratio */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {visit.capturedPhotos.map((photoUrl, idx) => {
              const isFront = idx % 2 === 0;
              return (
                <div
                  key={idx}
                  className="group relative bg-neutral-900 rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-800 hover:border-rose-500/70 shadow-2xl flex flex-col transition-all"
                >
                  {/* Image Frame - Generous height for portrait camera shots */}
                  <div
                    onClick={() => setPreviewPhotoIndex(idx)}
                    className="relative w-full h-[480px] sm:h-[580px] md:h-[640px] bg-black flex items-center justify-center overflow-hidden cursor-pointer p-3 sm:p-5"
                    title={lang === 'ar' ? 'اضغط لعرض الصورة بالحجم الكامل المكبر' : 'Click to view full size'}
                  >
                    <img
                      src={photoUrl}
                      alt={`Capture ${idx + 1}`}
                      className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-[1.02] transition-transform duration-200 select-none drop-shadow-xl"
                    />
                    {/* Badge top */}
                    <div className="absolute top-3.5 start-3.5 flex items-center gap-2 pointer-events-none z-10">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black backdrop-blur-md flex items-center gap-1.5 border shadow-sm ${
                        isFront
                          ? 'bg-rose-600/95 text-white border-rose-400/50'
                          : 'bg-indigo-600/95 text-white border-indigo-400/50'
                      }`}>
                        <span>#{idx + 1}</span>
                        <span>{isFront ? (lang === 'ar' ? 'أمامية (سيلفي)' : 'Front') : (lang === 'ar' ? 'خلفية (المحيط)' : 'Rear')}</span>
                      </span>
                    </div>

                    {/* Hover hint to expand */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="px-4 py-2 rounded-xl bg-black/85 text-white text-xs font-bold border border-white/20 flex items-center gap-2 shadow-2xl">
                        <ZoomIn className="w-4 h-4 text-rose-400" />
                        <span>{lang === 'ar' ? 'عرض مكبر بدقة كاملة' : 'Enlarge HD'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewPhotoIndex(idx)}
                      className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-4 h-4 text-rose-400" />
                      <span>{lang === 'ar' ? 'عرض مكبر' : 'View Full'}</span>
                    </button>
                    <a
                      href={photoUrl}
                      download={`capture_${idx + 1}_${visit.code || 'cam'}.jpg`}
                      className="py-2 px-3.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title={lang === 'ar' ? 'تحميل الصورة الأصلية' : 'Download HD Photo'}
                    >
                      <Download className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'تحميل' : 'Save'}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/98 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-[96vw] 2xl:max-w-[1600px] h-[96vh] max-h-[96vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/95 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${
                visit.isGps
                  ? 'bg-rose-50 border border-rose-200 text-rose-600'
                  : 'bg-indigo-50 border border-indigo-100 text-indigo-600'
              }`}
            >
              {visit.isGps ? <Crosshair className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-slate-950">{t.detailedInfoTitle}</h3>
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-0.5 rounded-full border border-indigo-200">
                  {visit.ip}
                </span>
                {visit.isGps && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white uppercase tracking-wider shadow-xs">
                    GPS EXACT
                  </span>
                )}
                {visit.isProxyVpn && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white uppercase tracking-wider shadow-xs">
                    VPN / PROXY
                  </span>
                )}
                {visit.capturedPhotos && visit.capturedPhotos.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{visit.capturedPhotos.length} {lang === 'ar' ? 'صور حية بدقة كاملة' : 'Live HD Photos'}</span>
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                {visit.localTime || new Date(visit.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            title={lang === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Quick-Switch Navigation Tabs */}
        <div className="px-3 sm:px-6 py-2 bg-slate-100/95 border-b border-slate-200 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none shrink-0 z-10">
          {visit.capturedPhotos && visit.capturedPhotos.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'photos'
                  ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-600/30'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{lang === 'ar' ? `معرض صور الكاميرا (${visit.capturedPhotos.length})` : `Live Camera (${visit.capturedPhotos.length})`}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{lang === 'ar' ? 'التقرير الشامل (عرض الكل)' : 'Full Report'}</span>
          </button>

          {visit.lat && visit.lon && (
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{lang === 'ar' ? 'الخريطة والموقع' : 'Map & Location'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>{lang === 'ar' ? 'مواصفات الجهاز والعتاد' : 'Device & Hardware'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{lang === 'ar' ? 'الأمان والشبكة' : 'Security & Network'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6 scrollbar-thin pb-28 sm:pb-36">
          {/* Dedicated Fullscreen / Lightbox Modal - 100% PURE BLACK */}
          {previewPhotoIndex !== null && visit.capturedPhotos && visit.capturedPhotos[previewPhotoIndex] && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-2 sm:p-4 bg-black/98 backdrop-blur-md animate-in fade-in duration-200">
              <div className="relative w-full max-w-[98vw] h-[98vh] flex flex-col items-center justify-between gap-3 p-2">
                {/* Lightbox Top Controls */}
                <div className="w-full flex items-center justify-between gap-3 text-white px-3 py-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-4 py-1.5 rounded-full text-xs font-black bg-rose-600 text-white shadow-md">
                      {lang === 'ar' ? `الصورة #${previewPhotoIndex + 1} من ${visit.capturedPhotos.length}` : `Photo #${previewPhotoIndex + 1} of ${visit.capturedPhotos.length}`}
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-neutral-900 text-neutral-200 border border-neutral-700">
                      {previewPhotoIndex % 2 === 0 ? (lang === 'ar' ? 'كاميرا أمامية (سيلفي)' : 'Front Camera') : (lang === 'ar' ? 'كاميرا خلفية (المحيط)' : 'Rear Camera')}
                    </span>
                    <span className="text-xs text-emerald-400 font-mono font-bold hidden sm:inline px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800">
                      100% FULL-HEIGHT UNCROPPED
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <a
                      href={visit.capturedPhotos[previewPhotoIndex]}
                      download={`full_capture_${previewPhotoIndex + 1}_${visit.code || 'cam'}.jpg`}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-md cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'تحميل الصورة الأصلية' : 'Download HD'}</span>
                    </a>
                    <button
                      onClick={() => setPreviewPhotoIndex(null)}
                      className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white transition-colors cursor-pointer border border-neutral-700"
                      title={lang === 'ar' ? 'إغلاق (Esc)' : 'Close (Esc)'}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Lightbox Image Container (100% uncropped on pure black with full vertical height) */}
                <div className="relative w-full flex-1 min-h-0 bg-black rounded-2xl border border-neutral-800 flex items-center justify-center p-3 sm:p-6 overflow-hidden shadow-2xl">
                  <img
                    src={visit.capturedPhotos[previewPhotoIndex]}
                    alt={`Full capture ${previewPhotoIndex + 1}`}
                    className="max-h-full max-w-full w-auto h-auto object-contain rounded-xl select-none drop-shadow-2xl"
                  />

                  {/* Nav prev */}
                  {previewPhotoIndex > 0 && (
                    <button
                      onClick={() => setPreviewPhotoIndex(previewPhotoIndex - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/85 hover:bg-rose-600 text-white transition-all shadow-2xl border border-neutral-700 cursor-pointer z-10"
                      title={lang === 'ar' ? 'السابق (السهم الأيسر)' : 'Previous (Left Arrow)'}
                    >
                      <ChevronLeft className="w-7 h-7" />
                    </button>
                  )}

                  {/* Nav next */}
                  {previewPhotoIndex < visit.capturedPhotos.length - 1 && (
                    <button
                      onClick={() => setPreviewPhotoIndex(previewPhotoIndex + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/85 hover:bg-rose-600 text-white transition-all shadow-2xl border border-neutral-700 cursor-pointer z-10"
                      title={lang === 'ar' ? 'التالي (السهم الأيمن)' : 'Next (Right Arrow)'}
                    >
                      <ChevronRight className="w-7 h-7" />
                    </button>
                  )}
                </div>

                {/* Lightbox Filmstrip Thumbnail Strip */}
                <div className="w-full h-20 shrink-0 flex items-center justify-center gap-2 overflow-x-auto p-2 bg-neutral-950/90 rounded-2xl border border-neutral-800 scrollbar-thin">
                  {visit.capturedPhotos.map((photoUrl, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => setPreviewPhotoIndex(pIdx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer bg-black flex items-center justify-center p-0.5 ${
                        pIdx === previewPhotoIndex
                          ? 'border-rose-500 ring-2 ring-rose-500/50 scale-105'
                          : 'border-neutral-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={photoUrl} alt={`thumb ${pIdx}`} className="max-w-full max-h-full object-contain" />
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] font-black px-1.5 rounded bg-black/85 text-white">
                        #{pIdx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Standalone Photos Tab */}
          {activeTab === 'photos' && renderCameraGallery()}

          {/* Map Section (If coordinates available) */}
          {(activeTab === 'all' || activeTab === 'map') && visit.lat && visit.lon && (
            <div className="bg-white/80 rounded-[2rem] border border-slate-200 p-4 flex flex-col gap-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-black text-slate-950">
                  <Navigation className="w-4 h-4 text-rose-600" />
                  <span>
                    {visit.isGps
                      ? (lang === 'ar' ? 'موقع GPS حقيقي مباشر (أقمار صناعية)' : 'Live High-Precision GPS Coordinates')
                      : t.coordsTitle}
                  </span>
                  <span className="font-mono text-indigo-600 font-black">
                    ({visit.lat.toFixed(6)}, {visit.lon.toFixed(6)})
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 text-xs">
                    <button
                      onClick={() => setMapMode('satellite')}
                      className={`px-3 py-1 font-bold rounded-full transition-all cursor-pointer text-[11px] ${
                        mapMode === 'satellite'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      {lang === 'ar' ? 'قمر صناعي' : 'Satellite'}
                    </button>
                    <button
                      onClick={() => setMapMode('google')}
                      className={`px-3 py-1 font-bold rounded-full transition-all cursor-pointer text-[11px] ${
                        mapMode === 'google'
                          ? 'bg-white text-indigo-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      Google Maps
                    </button>
                    <button
                      onClick={() => setMapMode('leaflet')}
                      className={`px-3 py-1 font-bold rounded-full transition-all cursor-pointer text-[11px] ${
                        mapMode === 'leaflet'
                          ? 'bg-white text-indigo-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      OpenStreetMap
                    </button>
                  </div>

                  {/* Google Maps External Link */}
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md"
                    title="Google Maps 2D"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Google Earth 3D Map Button */}
                  <a
                    href={googleEarthUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md"
                    title="Google Earth 3D Satellite"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'جوجل إيرث 3D' : 'Google Earth'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Exact Address Notification */}
              {visit.exactAddress && (
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-slate-950 font-bold">{visit.exactAddress}</span>
                  </div>
                  <button
                    onClick={copyAddress}
                    className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors"
                    title={t.copyLink}
                  >
                    {copiedAddr ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* Map Container */}
              <div className="w-full h-40 sm:h-52 rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner">
                {mapMode === 'satellite' ? (
                  <iframe
                    title="Google Satellite Map View"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    className="border-0 w-full h-full"
                    src={`https://maps.google.com/maps?q=${visit.lat},${visit.lon}&hl=${lang === 'ar' ? 'ar' : 'en'}&t=k&z=16&output=embed`}
                  />
                ) : mapMode === 'google' && googleMapsEmbedUrl ? (
                  <iframe
                    title="Google Maps Location View"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    className="border-0 w-full h-full"
                    src={googleMapsEmbedUrl}
                  />
                ) : (
                  <div ref={mapContainerRef} className="w-full h-full z-10" />
                )}
              </div>
            </div>
          )}

          {/* Grid of Diagnostic Cards */}
          {(activeTab === 'all' || activeTab === 'specs') && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {/* Card 1: Device & Hardware */}
            <div className="bg-white/80 rounded-xl border border-slate-200 p-3 flex flex-col gap-1.5 shadow-2xs">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                <span>{lang === 'ar' ? 'مواصفات الجهاز والعتاد' : 'Device & Hardware'}</span>
              </h4>

              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex flex-wrap justify-between items-center py-0.5 gap-2">
                  <span className="text-slate-500 whitespace-nowrap">{t.colDevice}:</span>
                  <span className="font-bold text-slate-950 flex flex-wrap justify-end items-center gap-1.5 text-right max-w-[200px] sm:max-w-none">
                    <DeviceIcon device={smartDevice} os={visit.os} />
                    <span>{smartDevice}</span>
                  </span>
                </div>

                <div className="flex flex-wrap justify-between items-center py-0.5 gap-2">
                  <span className="text-slate-500 whitespace-nowrap">{t.os}:</span>
                  <span className="font-bold text-slate-950 text-right">
                    {smartOS}
                  </span>
                </div>

                <div className="flex flex-wrap justify-between items-center py-0.5 gap-2">
                  <span className="text-slate-500 whitespace-nowrap">{t.colBrowser}:</span>
                  <span className="font-bold text-slate-950 flex flex-wrap justify-end items-center gap-1.5 text-right max-w-[200px] sm:max-w-none">
                    <BrowserIcon browser={visit.browser} />
                    <span>{smartBrowser}</span>
                  </span>
                </div>

                <div className="flex flex-wrap justify-between items-center py-0.5 gap-2">
                  <span className="text-slate-500 whitespace-nowrap">{t.screenRes}:</span>
                  <span className="font-mono font-bold text-slate-950 text-right">
                    {visit.screenWidth && visit.screenHeight
                      ? `${visit.screenWidth} x ${visit.screenHeight} (${visit.pixelRatio || 1}x)`
                      : t.unknown}
                  </span>
                </div>

                <div className="flex flex-wrap justify-between items-center py-0.5 gap-2">
                  <span className="text-slate-500 whitespace-nowrap">{t.cpuCores}:</span>
                  <span className="font-mono font-bold text-slate-950 text-right">
                    {visit.cpuCores ? `${visit.cpuCores} Cores` : t.unknown}
                  </span>
                </div>

                <div className="flex flex-wrap justify-between items-center py-0.5 gap-2">
                  <span className="text-slate-500 whitespace-nowrap">{t.ramMemory}:</span>
                  <span className="font-mono font-bold text-slate-950 text-right">
                    {visit.ram ? `~${visit.ram} GB` : t.unknown}
                  </span>
                </div>

                <div className="flex flex-wrap justify-between items-center py-0.5 gap-2">
                  <span className="text-slate-500 whitespace-nowrap">{t.gpuRenderer}:</span>
                  <span className="font-mono text-[11px] font-bold text-indigo-700 text-right break-words max-w-full sm:max-w-[200px]" title={visit.webglRenderer || visit.gpu || ''}>
                    {visit.webglRenderer || visit.gpu || t.unknown}
                  </span>
                </div>

                <div className="flex flex-wrap justify-between items-center py-0.5 gap-2">
                  <span className="text-slate-500 whitespace-nowrap">{lang === 'ar' ? 'مصنع GPU:' : 'GPU Vendor:'}</span>
                  <span className="font-mono text-[11px] font-bold text-slate-800 text-right break-words max-w-full sm:max-w-[200px]" title={visit.webglVendor || visit.gpuVendor || ''}>
                    {visit.webglVendor || visit.gpuVendor || t.unknown}
                  </span>
                </div>

                {visit.browserPlugins && (
                  <div className="flex flex-wrap justify-between items-center py-0.5 gap-2">
                    <span className="text-slate-500 whitespace-nowrap">{lang === 'ar' ? 'الإضافات المثبتة:' : 'Browser Plugins:'}</span>
                    <span className="font-mono text-[9px] text-slate-600 text-right break-words max-w-full sm:max-w-[220px]" title={visit.browserPlugins}>
                      {visit.browserPlugins}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Network & Geolocation */}
            <div className="bg-white/80 rounded-xl border border-slate-200 p-3.5 flex flex-col gap-2 shadow-2xs">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>{lang === 'ar' ? 'الشبكة والاتصال' : 'Network & Geolocation'}</span>
              </h4>

              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex flex-wrap justify-between items-center py-0.5 gap-2">
                  <span className="text-slate-500 whitespace-nowrap">{t.colCountry}:</span>
                  <span className="font-bold text-slate-950 text-right">
                    {visit.country || t.unknown} {visit.countryCode ? `(${visit.countryCode})` : ''}
                  </span>
                </div>

                <div className="flex flex-wrap justify-between items-center py-0.5 gap-2">
                  <span className="text-slate-500 whitespace-nowrap">{t.colCity}:</span>
                  <span className="font-bold text-slate-950 text-right">
                    {visit.city || t.unknown}
                  </span>
                </div>

                <div className="flex flex-wrap justify-between items-center py-0.5 gap-2">
                  <span className="text-slate-500 whitespace-nowrap">{t.isp}:</span>
                  <span className="font-black text-indigo-950 break-words max-w-full sm:max-w-[200px] text-right bg-indigo-50/80 px-2 py-0.5 rounded-lg border border-indigo-100" title={visit.isp || ''}>
                    {visit.isp || t.unknown}
                  </span>
                </div>

                <div className="flex flex-wrap justify-between items-center py-0.5 gap-2">
                  <span className="text-slate-500 whitespace-nowrap">{t.org}:</span>
                  <span className="font-bold text-slate-900 break-words max-w-full sm:max-w-[200px] text-right" title={visit.org || ''}>
                    {visit.org || visit.isp || t.unknown}
                  </span>
                </div>

                <div className="flex flex-wrap justify-between items-center py-0.5 gap-2">
                  <span className="text-slate-500 whitespace-nowrap">{t.asnLabel}:</span>
                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 text-right" title={visit.asn || ''}>
                    {visit.asn || t.unknown}
                  </span>
                </div>

                {visit.asName && (
                  <div className="flex flex-wrap justify-between items-center py-0.5 gap-2">
                    <span className="text-slate-500 whitespace-nowrap">{t.asName}:</span>
                    <span className="font-semibold text-slate-950 break-words max-w-full sm:max-w-[200px] text-right" title={visit.asName}>
                      {visit.asName}
                    </span>
                  </div>
                )}

                {visit.reverseDns && (
                  <div className="flex flex-wrap justify-between items-center py-0.5 gap-2">
                    <span className="text-slate-500 whitespace-nowrap">{t.reverseDns}:</span>
                    <span className="font-mono text-[11px] text-slate-800 break-words max-w-full sm:max-w-[200px] text-right" title={visit.reverseDns}>
                      {visit.reverseDns}
                    </span>
                  </div>
                )}

                {visit.ipRouting && (
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">{t.ipRouting}:</span>
                    <span className="font-mono text-[11px] font-bold text-slate-700">
                      {visit.ipRouting}
                    </span>
                  </div>
                )}

                {visit.usageType && (
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">{t.usageType}:</span>
                    <span className="font-bold text-slate-900 text-[11px] truncate max-w-[200px]" title={visit.usageType}>
                      {visit.usageType}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1 border-t border-slate-100 mt-0.5">
                  <span className="text-slate-500 font-bold">{t.networkType}:</span>
                  <span className="font-bold">
                    {visit.networkMedium === 'mobile_sim' || visit.isMobileCarrier ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-black shadow-2xs">
                        <Smartphone className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span>{lang === 'ar' ? 'هاتف شريحة (بيانات خلوية 4G/5G)' : 'Mobile SIM (4G/5G)'}</span>
                      </span>
                    ) : visit.networkMedium === 'vpn_proxy' || visit.isProxyVpn ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-black shadow-2xs">
                        <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" />
                        <span>{lang === 'ar' ? 'نفق مشفر (VPN / بروكسي)' : 'Encrypted VPN'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black shadow-2xs">
                        <Wifi className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{lang === 'ar' ? 'راوتر منزلي / واي فاي وألياف' : 'Home Router / Wi-Fi'}</span>
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">VPN / Proxy:</span>
                  <span className={`font-bold text-[11px] ${visit.isProxyVpn ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {visit.isProxyVpn
                      ? (lang === 'ar' ? 'مكتشف Yes (VPN/Proxy)' : 'Detected Yes')
                      : (lang === 'ar' ? 'نظيف No (Clean IP)' : 'Clean No')}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{t.connectionType}:</span>
                  <span className="font-semibold text-slate-950">
                    {visit.connectionType ? `${visit.connectionType.toUpperCase()} (RTT: ${visit.rtt || '-'}ms)` : t.unknown}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{t.localTimezone}:</span>
                  <span className="font-semibold text-slate-950">
                    {visit.timezone || t.unknown}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{t.language}:</span>
                  <span className="font-semibold text-slate-950 truncate max-w-[180px]">
                    {visit.languages || visit.language || t.unknown}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* New Section: Super Fingerprinting & Unique Device Telemetry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Card 3: Super Fingerprinting */}
            <div className="bg-white/80 rounded-xl border border-slate-200 p-3.5 flex flex-col gap-2 shadow-2xs">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.superFingerprintTitle}</span>
              </h4>

              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{t.deviceFingerprintId}:</span>
                  <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                    {visit.deviceFingerprint || 'SM-FP-ORIGIN'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{t.canvasFingerprint}:</span>
                  <span className="font-mono text-[11px] font-bold text-slate-950">
                    {visit.canvasFingerprint || t.unknown}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{t.webglFingerprint}:</span>
                  <span className="font-mono text-[11px] font-bold text-slate-950">
                    {visit.webglFingerprint || t.unknown}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{t.audioFingerprint}:</span>
                  <span className="font-mono text-[11px] font-bold text-slate-950">
                    {visit.audioFingerprint || t.unknown}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{t.webglExtensions}:</span>
                  <span className="font-mono text-[11px] font-bold text-slate-950">
                    {visit.webglExtensionsCount != null ? `${visit.webglExtensionsCount} Extensions` : t.unknown}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{t.maxTextureSize}:</span>
                  <span className="font-mono text-[11px] font-bold text-slate-950">
                    {visit.maxTextureSize ? `${visit.maxTextureSize}px` : t.unknown}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{lang === 'ar' ? 'عدد الخطوط المثبتة:' : 'Fonts Detected:'}</span>
                  <span className="font-mono text-[11px] font-bold text-slate-950">
                    {visit.fontsCount || t.unknown}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{lang === 'ar' ? 'اختبار Webdriver:' : 'Webdriver Test:'}</span>
                  <span className={`font-mono text-[11px] font-bold ${visit.webdriver ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {visit.webdriver ? (lang === 'ar' ? 'فشل (روبوت)' : 'Failed (Bot)') : (lang === 'ar' ? 'ناجح (بشري)' : 'Passed (Human)')}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{lang === 'ar' ? 'قارئ PDF:' : 'PDF Viewer:'}</span>
                  <span className={`font-mono text-[11px] font-bold ${visit.pdfViewerEnabled ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {visit.pdfViewerEnabled ? (lang === 'ar' ? 'مفعل' : 'Enabled') : (lang === 'ar' ? 'غير مفعل' : 'Disabled')}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{lang === 'ar' ? 'وقت الجهاز الفعلي:' : 'Device Clock Time:'}</span>
                  <span className="font-mono text-[10px] font-bold text-slate-800">
                    {visit.deviceLocalTime || t.unknown}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Security Analysis & Environment */}
            <div className="bg-white/80 rounded-xl border border-slate-200 p-3.5 flex flex-col gap-2 shadow-2xs">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{lang === 'ar' ? 'تحليل الأمان والبيئة' : 'Security & Environment'}</span>
              </h4>

              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{t.cookiesEnabled}:</span>
                  <span className={`font-bold ${visit.cookiesEnabled ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {visit.cookiesEnabled ? t.yes : t.no}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{t.doNotTrack}:</span>
                  <span className={`font-bold ${visit.doNotTrack === '1' ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {visit.doNotTrack === '1' ? (lang === 'ar' ? 'مفعل' : 'Active') : (lang === 'ar' ? 'غير مفعل' : 'Disabled')}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{lang === 'ar' ? 'عمق الألوان:' : 'Color Depth:'}</span>
                  <span className="font-bold text-slate-950">
                    {visit.colorDepth ? `${visit.colorDepth}-bit` : t.unknown}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{lang === 'ar' ? 'نسبة بكسل الشاشة:' : 'Pixel Ratio:'}</span>
                  <span className="font-bold text-slate-950">
                    {visit.pixelRatio ? `${visit.pixelRatio}x` : t.unknown}
                  </span>
                </div>

                {visit.refreshRate && (
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">{t.refreshRateLabel}:</span>
                    <span className="font-mono text-[11px] font-bold text-slate-950">
                      {visit.refreshRate} Hz
                    </span>
                  </div>
                )}

                {/* Demographic & Behavioral Persona Inferences */}
                {visit.colorScheme && (
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">{lang === 'ar' ? 'سمة المتصفح / الثيم:' : 'Theme / Scheme:'}</span>
                    <span className="font-bold text-indigo-700">
                      {visit.colorScheme}
                    </span>
                  </div>
                )}

                {visit.browserPersona && (
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">{lang === 'ar' ? 'نمط واهتمام المستخدم:' : 'User Profile Pattern:'}</span>
                    <span className="font-bold text-slate-950 text-right text-[11px]">
                      {visit.browserPersona}
                    </span>
                  </div>
                )}

                {visit.inferredAgeBracket && (
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">{lang === 'ar' ? 'الفئة العمرية المقدرة:' : 'Inferred Age Bracket:'}</span>
                    <span className="font-mono text-[11px] font-bold text-indigo-600">
                      {visit.inferredAgeBracket}
                    </span>
                  </div>
                )}

                {visit.torSuspected && (
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">{lang === 'ar' ? 'شبهة متصفح Tor:' : 'Tor Browser Suspected:'}</span>
                    <span className="font-bold text-rose-600 animate-pulse">
                      {lang === 'ar' ? 'مؤشرات Tor نشطة' : 'Tor Indicator Active'}
                    </span>
                  </div>
                )}

                {visit.permissions && (
                  <div className="flex flex-col gap-1 mt-1 pt-1 border-t border-slate-50">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">{t.permissionsLabel}:</span>
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {Object.entries(JSON.parse(visit.permissions)).map(([perm, state]) => (
                        <span key={perm} className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${
                          state === 'granted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                          state === 'denied' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {perm}: {String(state)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card 5: Timezone Conflict & Latency Triangulation */}
            <div className="bg-white/80 rounded-xl border border-slate-200 p-3.5 flex flex-col gap-2 shadow-2xs">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t.timezoneAnalysisTitle}</span>
              </h4>

              <div className="flex flex-col gap-1.5 text-xs">
                {/* Timezone Status Banner */}
                {visit.timezoneMismatch || visit.clockTamperDetected ? (
                  <div className="flex flex-col gap-1.5">
                    {visit.timezoneMismatch && (
                      <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                        <div>
                          <div className="font-bold text-[11px]">{t.timezoneMismatchDetected}</div>
                          {visit.timezoneDifference && (
                            <div className="text-[10px] opacity-90">{visit.timezoneDifference}</div>
                          )}
                        </div>
                      </div>
                    )}
                    {visit.clockTamperDetected && (
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 shrink-0 text-amber-600" />
                        <div>
                          <div className="font-bold text-[11px]">{t.clockTamperLabel}</div>
                          <div className="text-[10px] opacity-90">
                            {lang === 'ar' ? 'وقت الجهاز يختلف جذرياً عن وقت الخادم' : 'Device clock differs significantly from server time'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                    <div className="font-bold text-[11px]">{t.timezoneMatch}</div>
                  </div>
                )}

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{t.systemTimezone}:</span>
                  <span className="font-mono font-bold text-slate-950">
                    {visit.systemTimezone || visit.timezone || t.unknown}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{t.ipTimezone}:</span>
                  <span className="font-mono font-bold text-slate-950">
                    {visit.ipTimezone || t.unknown}
                  </span>
                </div>

                {/* Latency Triangulation Details */}
                <div className="pt-2 mt-1 border-t border-slate-100 flex flex-col gap-1.5">
                  <div className="text-[11px] font-bold text-slate-950 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{t.latencyTitle}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[9px] text-slate-500">Cloudflare</div>
                      <div className="font-mono text-xs font-bold text-slate-950">
                        {visit.latencyCloudflare ? `${visit.latencyCloudflare}ms` : '-'}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[9px] text-slate-500">Google</div>
                      <div className="font-mono text-xs font-bold text-slate-950">
                        {visit.latencyGoogle ? `${visit.latencyGoogle}ms` : '-'}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[9px] text-slate-500">Server</div>
                      <div className="font-mono text-xs font-bold text-indigo-600">
                        {visit.latencyServer ? `${visit.latencyServer}ms` : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Battery & Motion Sensors */}
          <div className="bg-white/80 rounded-xl border border-slate-200 p-3.5 flex flex-col gap-2 shadow-2xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Battery className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.motionSensorsTitle}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Battery column */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{t.batteryLevel}:</span>
                  <span className="font-bold text-slate-950 flex items-center gap-1.5">
                    {visit.batteryCharging ? (
                      <BatteryCharging className="w-4 h-4 text-emerald-500 animate-pulse" />
                    ) : (
                      <Battery className="w-4 h-4 text-slate-400" />
                    )}
                    <span>{visit.battery != null ? `${visit.battery}%` : t.unknown}</span>
                    {visit.batteryCharging && <span className="text-[10px] text-emerald-600 font-black">(Charging)</span>}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{t.devicePostureLabel}:</span>
                  <span className="font-bold text-indigo-600">
                    {visit.devicePosture === 'flat'
                      ? t.postureFlat
                      : visit.devicePosture === 'portrait'
                      ? t.posturePortrait
                      : visit.devicePosture === 'landscape'
                      ? t.postureLandscape
                      : visit.devicePosture === 'tilted'
                      ? t.postureTilted
                      : (visit.motionDetected ? t.postureTilted : t.noMotionData)}
                  </span>
                </div>
              </div>

              {/* Sensor Orientation & Accel */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{t.orientationAngles}:</span>
                  <span className="font-mono text-[11px] font-bold text-slate-950">
                    {visit.orientationAlpha != null || visit.orientationBeta != null || visit.orientationGamma != null
                      ? `α:${visit.orientationAlpha ?? 0}° β:${visit.orientationBeta ?? 0}° γ:${visit.orientationGamma ?? 0}°`
                      : t.noMotionData}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">{t.accelerationAxes}:</span>
                  <span className="font-mono text-[11px] font-bold text-slate-950">
                    {visit.accelerationX != null || visit.accelerationY != null || visit.accelerationZ != null
                      ? `X:${visit.accelerationX ?? 0} Y:${visit.accelerationY ?? 0} Z:${visit.accelerationZ ?? 0}`
                      : t.noMotionData}
                  </span>
                </div>
              </div>
            </div>
          </div>
            </>
          )}

          {/* Grid 3: Security & Diagnostics */}
          {(activeTab === 'all' || activeTab === 'security') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Card: Dedicated VPN Unveil & Leak Diagnostics */}
            <div className="bg-white text-slate-900 rounded-xl p-4 flex flex-col gap-3 border border-slate-200 shadow-sm relative overflow-hidden h-full">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-black text-slate-950">
                    {lang === 'ar' ? 'تحليل المخاطر والبروكسي' : 'Risk & Proxy Analysis'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    (visit.mismatchScore || 0) > 50 ? 'bg-rose-50 text-rose-600 border-rose-200' : 
                    (visit.mismatchScore || 0) > 20 ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                    'bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}>
                    {visit.mismatchScore || 0}% RISK
                  </span>
                </div>
              </div>

              {/* Visual Risk Barometer */}
              <div className="mt-1 mb-2">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      (visit.mismatchScore || 0) > 50 ? 'bg-rose-500' : 
                      (visit.mismatchScore || 0) > 20 ? 'bg-amber-500' : 
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${visit.mismatchScore || 0}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[9px] font-bold text-slate-400">
                  <span>CLEAN</span>
                  <span>SUSPICIOUS</span>
                  <span>VPN/PROXY</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">{lang === 'ar' ? 'مزود الـ VPN' : 'VPN Provider'}</span>
                  <span className="font-bold text-indigo-700 text-xs break-words whitespace-normal leading-tight">
                    {!visit.isProxyVpn || visit.vpnProviderName === 'None' || visit.vpnProviderName === 'None (Direct Connection)'
                      ? (lang === 'ar' ? 'لا يوجد (اتصال مباشر)' : 'None (Direct)')
                      : (visit.vpnProviderName || (lang === 'ar' ? 'بروكسي مجهول' : 'Generic Proxy'))}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">{lang === 'ar' ? 'خوادم DNS' : 'DNS Resolver'}</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px] break-words whitespace-normal leading-tight">
                    {visit.dnsLeakIsp || visit.reverseDns || (lang === 'ar' ? 'سليم' : 'Clean ISP')}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-1 sm:col-span-2">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">{lang === 'ar' ? 'تسريب WebRTC' : 'WebRTC Leaks'}</span>
                  <span className="font-mono font-bold text-amber-600 text-[11px] break-words whitespace-normal leading-tight">
                    {visit.webrtcPublicIp || visit.webrtcLocalIp ? `${visit.webrtcPublicIp || ''} ${visit.webrtcLocalIp ? `[${visit.webrtcLocalIp}]` : ''}` : (lang === 'ar' ? 'لا يوجد تسريب' : 'No WebRTC Leak')}
                  </span>
                </div>
              </div>

              <div className="mt-auto p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block mb-0.5">{lang === 'ar' ? 'تقدير الموقع الحقيقي:' : 'Estimated Real Location:'}</strong>
                  {!visit.isProxyVpn
                    ? (lang === 'ar' ? 'اتصال مباشر حقيقي بدون VPN' : 'Direct Authentic Connection')
                    : (visit.candidateOriginalLocation || (lang === 'ar' ? 'اتصال حقيقي مباشر' : 'Direct Connection'))}
                </span>
              </div>
            </div>

            {/* User Agent Raw Diagnostic Box */}
            <div className="bg-white/80 rounded-xl border border-slate-200 p-4 flex flex-col gap-3 shadow-sm h-full">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>{lang === 'ar' ? 'بصمة المتصفح الكاملة' : 'Full Browser User Agent'}</span>
              </h4>

              <div className="flex-1 bg-slate-900 rounded-xl p-3 border border-slate-800 relative group overflow-hidden">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={copyUserAgent}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                    title={t.copyLink}
                  >
                    {copiedUa ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <p className="font-mono text-[10px] sm:text-[11px] leading-relaxed text-slate-300 break-words select-all">
                  {smartUA}
                </p>
              </div>

              <div className="flex items-center gap-2 p-2 bg-indigo-50/50 rounded-lg border border-indigo-100 text-[10px] text-indigo-700 font-bold">
                <ShieldCheck className="w-3 h-3" />
                <span>{lang === 'ar' ? 'تم التحقق من سلامة البصمة' : 'Fingerprint Integrity Verified'}</span>
              </div>
            </div>
          </div>
          )}

          {/* Captured Camera Trap Photos Gallery in Comprehensive/All Mode */}
          {activeTab === 'all' && renderCameraGallery()}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50">
          <div className="flex items-center gap-2">
            <button
              onClick={downloadVisitTxt}
              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تحميل تقرير TXT' : 'Download TXT'}</span>
            </button>

            <button
              onClick={downloadVisitPdf}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تحميل التقرير PDF' : 'Download PDF Report'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold text-xs transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
