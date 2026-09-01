import React, { useEffect, useRef } from 'react';
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

export const VisitDetailModal: React.FC<VisitDetailModalProps> = ({ visit, onClose, lang }) => {
  const t = translations[lang];
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
        <span style="color: #64748b;">${visit.isGps ? '📍 GPS Accurate Pin' : `IP: ${visit.ip}`}</span><br/>
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[82vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs ${
                visit.isGps
                  ? 'bg-rose-50 border border-rose-200 text-rose-600'
                  : 'bg-indigo-50 border border-indigo-100 text-indigo-600'
              }`}
            >
              {visit.isGps ? <Crosshair className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-black text-slate-950">{t.detailedInfoTitle}</h3>
                <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  {visit.ip}
                </span>
                {visit.isGps && (
                  <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-rose-600 text-white uppercase tracking-wider">
                    GPS EXACT
                  </span>
                )}
                {visit.isProxyVpn && (
                  <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-amber-500 text-white uppercase tracking-wider">
                    VPN / PROXY
                  </span>
                )}
              </div>
              <span className="text-[9px] text-slate-500 font-medium">
                {visit.localTime || new Date(visit.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 flex flex-col gap-2.5">
          {/* Map Section (If coordinates available) */}
          {visit.lat && visit.lon && (
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
                      {lang === 'ar' ? '🛰️ قمر صناعي' : '🛰️ Satellite'}
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

          {/* Grid 3: Security & Diagnostics */}
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
