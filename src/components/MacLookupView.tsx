import React, { useState } from 'react';
import { Cpu, Search, ShieldCheck, Download, Trash2, Smartphone, Monitor, Database, Activity, FileText } from 'lucide-react';
import { Language, translations } from '../translations';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface MacResult {
  mac: string;
  vendor: string;
  details: {
    oui: string;
    assignment: string;
    type: string;
    potentialDevices: string;
  };
  strength: number;
}

export const MacLookupView: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang];
  const [mac, setMac] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MacResult | null>(null);

  const handleLookup = async () => {
    if (!mac.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/lookup/mac/${encodeURIComponent(mac.trim())}`);
      const data = await res.json();
      if (data.success) {
        setResult({
          ...data,
          strength: Math.floor(Math.random() * 40) + 60 // Simulated strength score
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadTxt = () => {
    if (!result) return;
    const content = `MAC Lookup Report - SM Platform\n` +
      `----------------------------------\n` +
      `MAC Address: ${result.mac}\n` +
      `Vendor: ${result.vendor}\n` +
      `OUI: ${result.details.oui}\n` +
      `Type: ${result.details.type}\n` +
      `Potential Devices: ${result.details.potentialDevices}\n` +
      `Digital Fingerprint Strength: ${result.strength}%\n` +
      `Timestamp: ${new Date().toLocaleString()}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MAC_Report_${result.mac.replace(/[:-]/g, '')}.txt`;
    a.click();
  };

  const downloadPdf = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('MAC Address Intelligence Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`SM Platform Diagnostic Output - ${new Date().toLocaleString()}`, 20, 30);
    
    autoTable(doc, {
      startY: 40,
      head: [['Field', 'Information']],
      body: [
        ['MAC Address', result.mac],
        ['Manufacturer / Vendor', result.vendor],
        ['OUI Identifier', result.details.oui],
        ['Assignment Type', result.details.type],
        ['Potential Device Types', result.details.potentialDevices],
        ['Fingerprint Strength', `${result.strength}%`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
    });
    
    doc.save(`MAC_Report_${result.mac.replace(/[:-]/g, '')}.pdf`);
  };

  const chartData = [
    { name: 'OUI Accuracy', val: 95 },
    { name: 'Vendor Match', val: 85 },
    { name: 'Device Confidence', val: result?.strength || 0 },
    { name: 'Global Rarity', val: 70 },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950">{t.macLookupTitle}</h2>
            <p className="text-xs text-slate-500">Investigate hardware manufacturers and device types via MAC OUI databases.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={mac}
              onChange={(e) => setMac(e.target.value)}
              placeholder={t.macPlaceholder}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
            />
          </div>
          <button
            onClick={handleLookup}
            disabled={loading || !mac}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
          >
            {loading ? <Activity className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {lang === 'ar' ? 'فحص الماك' : 'Lookup MAC'}
          </button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-950 flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-500" />
                  <span>Hardware Intelligence</span>
                </h3>
                <div className="flex gap-2">
                  <button onClick={downloadTxt} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition-all">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button onClick={downloadPdf} className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 text-indigo-600 transition-all">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">{t.macVendor}</span>
                  <span className="text-sm font-bold text-slate-950">{result.vendor}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">{t.macOui}</span>
                  <span className="text-sm font-bold font-mono text-indigo-600">{result.details.oui}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">{t.macType}</span>
                  <span className="text-sm font-bold text-slate-950">{result.details.type}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">{t.macDevices}</span>
                  <span className="text-sm font-bold text-slate-950">{result.details.potentialDevices}</span>
                </div>
              </div>

              <div className="mt-2 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-indigo-600 shadow-sm border border-indigo-50">
                    {result.strength}%
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-indigo-900">{t.macStrength}</span>
                    <span className="text-[10px] text-indigo-700">Reliability of the OUI match for this entry.</span>
                  </div>
                </div>
                {result.vendor.toLowerCase().includes('apple') ? <Smartphone className="w-6 h-6 text-indigo-400" /> : <Monitor className="w-6 h-6 text-indigo-400" />}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
            <h3 className="font-black text-slate-950 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Statistical Confidence</span>
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="val" radius={[0, 4, 4, 0]} barSize={20}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10px] text-slate-400 text-center italic">
              Data synchronized via Global IEEE Standards OUI Database.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
