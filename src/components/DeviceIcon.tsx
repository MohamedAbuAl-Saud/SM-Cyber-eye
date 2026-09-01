import React from 'react';
import { Smartphone, Monitor, Laptop, Tablet, Terminal } from 'lucide-react';

interface DeviceIconProps {
  device: string;
  os?: string;
  className?: string;
}

export const DeviceIcon: React.FC<DeviceIconProps> = ({ device, os = '', className = 'w-4 h-4' }) => {
  const d = (device + ' ' + os).toLowerCase();

  if (d.includes('android')) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
        <Smartphone className={`${className} text-emerald-600`} />
        <span>Android</span>
      </span>
    );
  }

  if (d.includes('iphone') || d.includes('ipad') || d.includes('ios')) {
    return (
      <span className="inline-flex items-center gap-1 text-slate-800 font-medium">
        <Smartphone className={`${className} text-slate-700`} />
        <span>iPhone / iPad</span>
      </span>
    );
  }

  if (d.includes('mac') || d.includes('macos')) {
    return (
      <span className="inline-flex items-center gap-1 text-slate-800 font-medium">
        <Laptop className={`${className} text-slate-700`} />
        <span>Mac</span>
      </span>
    );
  }

  if (d.includes('windows') || d.includes('pc')) {
    return (
      <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
        <Monitor className={`${className} text-blue-600`} />
        <span>PC (Windows)</span>
      </span>
    );
  }

  if (d.includes('linux')) {
    return (
      <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
        <Terminal className={`${className} text-amber-600`} />
        <span>Linux</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
      <Monitor className={`${className} text-slate-500`} />
      <span>{device || 'Device'}</span>
    </span>
  );
};
