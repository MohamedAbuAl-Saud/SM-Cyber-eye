export type TrackingMode = 'precise' | 'near' | 'pdf';

export type MainNavView = 'home' | 'track' | 'ip-lookup' | 'mac-lookup' | 'exif-tool' | 'cyber-awareness' | 'support';

export interface TrackingLink {
  id: string;
  code: string;
  originalUrl: string;
  mode: TrackingMode;
  userToken: string;
  createdAt: string;
  visitCount: number;
}

export interface VisitRecord {
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
  networkMedium?: 'mobile_sim' | 'router_wifi' | 'vpn_proxy' | 'datacenter_cloud' | string | null;
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
  // Browser Inferred Demographics & Deep Telemetry
  inferredGender?: string | null;
  inferredAgeBracket?: string | null;
  browserPersona?: string | null;
  colorScheme?: string | null;
  reducedMotion?: boolean | null;
  torSuspected?: boolean | null;
  realIpCandidate?: string | null;
  createdAt: string;
}

export interface DisguiseTemplate {
  id: string;
  name: string;
  category: string;
  domain: string;
  iconName: string;
}

export interface IpLookupResult {
  ip: string;
  country: string | null;
  countryCode: string | null;
  flag: string | null;
  region: string | null;
  city: string | null;
  zip: string | null;
  lat: number | null;
  lon: number | null;
  isp: string | null;
  org: string | null;
  asn: string | null;
  asName: string | null;
  reverseDns?: string | null;
  ipRouting?: string | null;
  usageType?: string | null;
  isProxyVpn: boolean;
  isHosting: boolean;
  isMobile: boolean;
  networkMedium?: 'mobile_sim' | 'router_wifi' | 'vpn_proxy' | 'datacenter_cloud' | string;
  proxyType?: string | null;
  threatLevel: 'clean' | 'proxy' | 'hosting' | 'unknown';
  timezone: string | null;
  utcOffset: string | null;
  localTime: string | null;
  currency: string | null;
  exactAddress?: string | null;
  // VPN Unveil & Leak Diagnostics
  vpnProviderName?: string | null;
  webrtcLocalIp?: string | null;
  webrtcPublicIp?: string | null;
  dnsLeakIsp?: string | null;
  candidateOriginalLocation?: string | null;
  mismatchScore?: number | null;
}

