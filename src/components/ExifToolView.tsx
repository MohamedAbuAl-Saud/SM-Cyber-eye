import React, { useState, useRef, useEffect } from 'react';
import exifr from 'exifr';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Camera,
  UploadCloud,
  FileImage,
  RefreshCw,
  AlertTriangle,
  FileText,
  MapPin,
  Download,
  Lock,
  CheckCircle2,
  ExternalLink,
  Globe,
  Sliders,
  Info,
  Layers,
  Search,
  Copy,
  Check,
} from 'lucide-react';
import { Language, translations } from '../translations';

interface ExifData {
  fileName: string;
  fileSize: number;
  fileType: string;
  make?: string;
  model?: string;
  lensModel?: string;
  software?: string;
  dateTimeOriginal?: string;
  createDate?: string;
  modifyDate?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  exposureTime?: number | string;
  fNumber?: number;
  iso?: number;
  focalLength?: number;
  dimensions?: { width: number; height: number };
  megapixels?: string;
  allTags: Record<string, any>;
}

interface ExifToolViewProps {
  lang: Language;
}

export const ExifToolView: React.FC<ExifToolViewProps> = ({ lang }) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConvertingHeic, setIsConvertingHeic] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'gps' | 'camera' | 'raw'>('overview');
  const [mapType, setMapType] = useState<'satellite' | 'google' | 'osm'>('satellite');
  const [searchTag, setSearchTag] = useState('');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setExifData(null);
    setSelectedFile(file);

    let isHeic = false;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'heic' || ext === 'heif' || file.type.includes('heic') || file.type.includes('heif')) {
      isHeic = true;
    }

    if (isHeic) {
      setIsConvertingHeic(true);
      try {
        const heic2any = (await import('heic2any')).default;
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.92,
        });

        const finalBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        const convertedUrl = URL.createObjectURL(finalBlob);
        setPreviewUrl(convertedUrl);
      } catch (err) {
        console.warn('HEIC preview conversion warning:', err);
        setPreviewUrl(URL.createObjectURL(file));
      } finally {
        setIsConvertingHeic(false);
      }
    } else {
      setPreviewUrl(URL.createObjectURL(file));
    }

    // Auto extract EXIF
    parseExif(file);
  };

  const parseExif = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const output = await exifr.parse(file, true);

      let dims: { width: number; height: number } | undefined;
      let megapixels: string | undefined;

      try {
        const sizeData = await exifr.parse(file, { tiff: true, xmp: true, gps: false });
        if (sizeData && (sizeData.ImageWidth || sizeData.ExifImageWidth)) {
          const w = sizeData.ImageWidth || sizeData.ExifImageWidth;
          const h = sizeData.ImageHeight || sizeData.ExifImageHeight;
          if (w && h) {
            dims = { width: w, height: h };
            megapixels = `${((w * h) / 1000000).toFixed(1)} MP`;
          }
        }
      } catch (e) {
        // Fallback for image dimensions
      }

      if (!dims && previewUrl) {
        try {
          const img = new Image();
          img.src = previewUrl;
          await new Promise((res) => {
            img.onload = res;
          });
          if (img.width && img.height) {
            dims = { width: img.width, height: img.height };
            megapixels = `${((img.width * img.height) / 1000000).toFixed(1)} MP`;
          }
        } catch (e) {
          // ignore
        }
      }

      let lat: number | undefined;
      let lon: number | undefined;
      let alt: number | undefined;

      if (output?.latitude && output?.longitude) {
        lat = Number(output.latitude);
        lon = Number(output.longitude);
        if (output.altitude) alt = Number(output.altitude);
      } else {
        try {
          const gps = await exifr.gps(file);
          if (gps?.latitude && gps?.longitude) {
            lat = Number(gps.latitude);
            lon = Number(gps.longitude);
          }
        } catch (e) {
          // ignore
        }
      }

      const parsedData: ExifData = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || file.name.split('.').pop()?.toUpperCase() || 'IMAGE',
        make: output?.Make,
        model: output?.Model,
        lensModel: output?.LensModel || output?.LensInfo,
        software: output?.Software,
        dateTimeOriginal: output?.DateTimeOriginal ? String(output.DateTimeOriginal) : undefined,
        createDate: output?.CreateDate ? String(output.CreateDate) : undefined,
        modifyDate: output?.ModifyDate ? String(output.ModifyDate) : undefined,
        latitude: lat,
        longitude: lon,
        altitude: alt,
        exposureTime: output?.ExposureTime,
        fNumber: output?.FNumber,
        iso: output?.ISO || output?.ISOSpeedRatings,
        focalLength: output?.FocalLength,
        dimensions: dims,
        megapixels,
        allTags: output || {},
      };

      setExifData(parsedData);
      if (lat && lon) {
        setActiveTab('gps');
      } else {
        setActiveTab('overview');
      }
    } catch (err: any) {
      console.error('EXIF extraction error:', err);
      setError(
        lang === 'ar'
          ? 'عذراً، لم نتمكن من قراءة هيدر الصورة أو لا تحتوي على وسم EXIF قياسي.'
          : 'Could not parse EXIF header or image contains non-standard metadata.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const formatExifDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', {
          dateStyle: 'full',
          timeStyle: 'medium',
        });
      }
    } catch (e) {
      // ignore
    }
    return dateStr;
  };

  const handleDownloadReportPdf = () => {
    if (!exifData) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('SM CyberEye - ExifTool Audit Report', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`File: ${exifData.fileName}`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);

    const summaryRows: Array<[string, string]> = [
      ['File Size', `${(exifData.fileSize / 1024).toFixed(1)} KB`],
      ['File Format', exifData.fileType],
      ['Dimensions', exifData.dimensions ? `${exifData.dimensions.width} x ${exifData.dimensions.height} (${exifData.megapixels || ''})` : 'N/A'],
      ['Camera Make', exifData.make || 'N/A'],
      ['Camera Model', exifData.model || 'N/A'],
      ['Lens Model', exifData.lensModel || 'N/A'],
      ['Software', exifData.software || 'N/A'],
      ['Capture Timestamp', formatExifDate(exifData.dateTimeOriginal)],
      ['ISO Speed', exifData.iso ? `ISO ${exifData.iso}` : 'N/A'],
      ['Aperture', exifData.fNumber ? `f/${exifData.fNumber}` : 'N/A'],
      ['Exposure Time', exifData.exposureTime ? `${exifData.exposureTime}s` : 'N/A'],
      ['GPS Coordinates', exifData.latitude && exifData.longitude ? `${exifData.latitude.toFixed(6)}, ${exifData.longitude.toFixed(6)}` : 'No Embedded GPS'],
    ];

    autoTable(doc, {
      startY: 42,
      head: [['Metadata Tag', 'Value']],
      body: summaryRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`ExifReport_${exifData.fileName.replace(/\.[^/.]+$/, '')}.pdf`);
  };

  const handleDownloadJson = () => {
    if (!exifData) return;
    const blob = new Blob([JSON.stringify(exifData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ExifReport_${exifData.fileName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    if (!exifData) return;
    let txt = `=====================================================\n`;
    txt += `تقرير فحص البيانات الوصفية (ExifTool Report)\n`;
    txt += `اسم الملف: ${exifData.fileName}\n`;
    txt += `تاريخ التقرير: ${new Date().toISOString()}\n`;
    txt += `=====================================================\n\n`;

    txt += `[مواصفات الملف والكاميرا]\n`;
    txt += `الحجم: ${(exifData.fileSize / 1024).toFixed(1)} KB\n`;
    txt += `الشركة المصنعة: ${exifData.make || 'N/A'}\n`;
    txt += `الموديل: ${exifData.model || 'N/A'}\n`;
    txt += `العدسة: ${exifData.lensModel || 'N/A'}\n`;
    txt += `تاريخ التقاط الصورة: ${formatExifDate(exifData.dateTimeOriginal)}\n`;
    txt += `أبعاد الصورة: ${exifData.dimensions ? `${exifData.dimensions.width} x ${exifData.dimensions.height} (${exifData.megapixels || ''})` : 'N/A'}\n`;
    txt += `ISO: ${exifData.iso || 'N/A'}\n`;
    txt += `فتحة العدسة: ${exifData.fNumber ? `f/${exifData.fNumber}` : 'N/A'}\n`;
    txt += `سرعة الغالق: ${exifData.exposureTime ? `${exifData.exposureTime}s` : 'N/A'}\n`;
    txt += `إحداثيات GPS: ${exifData.latitude && exifData.longitude ? `${exifData.latitude}, ${exifData.longitude}` : 'غير متوفرة'}\n`;

    const blob = new Blob(['\uFEFF' + txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ExifReport_${exifData.fileName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCleanImage = async () => {
    if (!previewUrl || !selectedFile) return;
    setIsCleaning(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = previewUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CLEANED_${selectedFile.name.replace(/\.[^/.]+$/, '')}.jpg`;
            a.click();
            URL.revokeObjectURL(url);
          }
          setIsCleaning(false);
        }, 'image/jpeg', 0.95);
      }
    } catch (err) {
      console.error('Clean image error:', err);
      setIsCleaning(false);
    }
  };

  const copyTagValue = (key: string, val: any) => {
    const text = `${key}: ${String(val)}`;
    navigator.clipboard.writeText(text);
    setCopiedTag(key);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  const filteredTags = exifData
    ? Object.entries(exifData.allTags).filter(
        ([key, val]) =>
          key.toLowerCase().includes(searchTag.toLowerCase()) ||
          String(val).toLowerCase().includes(searchTag.toLowerCase())
      )
    : [];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 p-3 sm:p-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                {t.exifToolTitle}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                EXIF & METADATA
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {t.exifToolSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Upload Zone & Controls */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif,.HEIC,.HEIF,.hif,.HIF,image/heic,image/heif,image/heic-sequence,image/heif-sequence,.jpg,.jpeg,.png,.webp,.tiff,.tif,.gif,.bmp,.avif"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileSelect(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        {/* Drag and Drop Card */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            selectedFile
              ? 'border-indigo-400 bg-indigo-50/20'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/70'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 shadow-inner">
            {isConvertingHeic ? (
              <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin" />
            ) : selectedFile ? (
              <FileImage className="w-7 h-7 text-indigo-600" />
            ) : (
              <UploadCloud className="w-7 h-7 text-slate-500" />
            )}
          </div>

          <h3 className="text-sm sm:text-base font-black text-slate-950">
            {isConvertingHeic
              ? (lang === 'ar' ? 'جارِ معالجة وتحويل صورة HEIC من iPhone...' : 'Converting HEIC image from iPhone...')
              : selectedFile
              ? selectedFile.name
              : t.exifUploadLabel}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            {selectedFile
              ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • ${selectedFile.type || 'Image File'}`
              : t.exifUploadHint}
          </p>

          <div className="mt-3 flex items-center justify-center">
            <span className="px-4 py-2 rounded-full text-xs font-bold bg-slate-900 hover:bg-indigo-600 text-white shadow-xs transition-colors">
              {selectedFile
                ? (lang === 'ar' ? 'تغيير الصورة' : 'Change Image')
                : (lang === 'ar' ? 'اختر ملف الصورة من جهازك' : 'Browse File')}
            </span>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Selected File Details & Primary Actions */}
        {selectedFile && (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Upload Preview"
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-950 truncate max-w-[260px]">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.name.split('.').pop()?.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setExifData(null);
                  setError(null);
                }}
                className="px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                {lang === 'ar' ? 'مسح' : 'Clear'}
              </button>

              <button
                disabled={isLoading}
                onClick={() => selectedFile && parseExif(selectedFile)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{lang === 'ar' ? 'جارِ القراءة...' : 'Reading...'}</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t.exifFetchBtn}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCleanImage}
                disabled={isCleaning}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                title={t.exifCleanBtn}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'تجريد بيانات EXIF وحفظ الصورة نظيفة' : 'Strip & Clean EXIF'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Container */}
      {exifData && (
        <div className="flex flex-col gap-5">
          {/* Top Export Banner */}
          <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                    {exifData.make ? `${exifData.make} ${exifData.model || ''}` : exifData.fileName}
                  </h2>
                  {exifData.latitude && exifData.longitude ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-600" />
                      {t.exifGpsFound}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      {t.exifNoGps}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {exifData.dimensions ? `${exifData.dimensions.width}x${exifData.dimensions.height} (${exifData.megapixels || ''})` : ''} • {(exifData.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            {/* Export Reports */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={handleDownloadReportPdf}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF Report</span>
              </button>

              <button
                onClick={handleDownloadJson}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>

              <button
                onClick={handleDownloadTxt}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>TXT</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 border border-slate-200 rounded-2xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'ar' ? 'نظرة عامة والمواصفات' : 'Overview & Specs'}
            </button>

            <button
              onClick={() => setActiveTab('gps')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'gps'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{lang === 'ar' ? 'الموقع الجغرافي (EXIF GPS)' : 'EXIF GPS Sensor'}</span>
              {exifData.latitude && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('camera')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'camera'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'ar' ? 'إعدادات الكاميرا والتعريض' : 'Camera & Optics'}
            </button>

            {exifData.allTags && (
              <button
                onClick={() => setActiveTab('raw')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'raw'
                    ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>{lang === 'ar' ? 'جميع الوسوم الخام (Raw Tags)' : 'All Raw Tags'}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-200 text-slate-800 font-bold">
                  {Object.keys(exifData.allTags).length}
                </span>
              </button>
            )}
          </div>

          {/* TAB 1: OVERVIEW & SPECS */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* File Specs */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col gap-3">
                <div className="flex items-center gap-2 text-indigo-600">
                  <FileImage className="w-4 h-4" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    {t.exifFileInfo}
                  </h3>
                </div>
                <div className="flex flex-col gap-2 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">{lang === 'ar' ? 'اسم الملف:' : 'File Name:'}</span>
                    <span className="font-bold text-slate-900 truncate max-w-[170px]">{exifData.fileName}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">{lang === 'ar' ? 'حجم الملف:' : 'File Size:'}</span>
                    <span className="font-mono font-bold text-slate-900">{(exifData.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">{lang === 'ar' ? 'الصيغة:' : 'Format:'}</span>
                    <span className="font-mono font-bold text-indigo-600">{exifData.fileType}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">{lang === 'ar' ? 'الأبعاد:' : 'Dimensions:'}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {exifData.dimensions ? `${exifData.dimensions.width} × ${exifData.dimensions.height}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">{lang === 'ar' ? 'الدقة بالميجابكسل:' : 'Megapixels:'}</span>
                    <span className="font-mono font-bold text-emerald-600">{exifData.megapixels || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Camera Specs */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col gap-3">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Camera className="w-4 h-4" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    {t.exifCameraInfo}
                  </h3>
                </div>
                <div className="flex flex-col gap-2 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">{lang === 'ar' ? 'الشركة المصنعة:' : 'Make:'}</span>
                    <span className="font-bold text-slate-900">{exifData.make || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">{lang === 'ar' ? 'الموديل:' : 'Model:'}</span>
                    <span className="font-bold text-indigo-600">{exifData.model || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">{lang === 'ar' ? 'العدسة:' : 'Lens:'}</span>
                    <span className="font-bold text-slate-900 truncate max-w-[170px]">{exifData.lensModel || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">{lang === 'ar' ? 'البرنامج / النظام:' : 'Software:'}</span>
                    <span className="font-mono text-slate-900">{exifData.software || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Timestamp & Dates */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col gap-3">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Info className="w-4 h-4" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    {lang === 'ar' ? 'التواريخ والأختام الزمنية' : 'Timestamps & Dates'}
                  </h3>
                </div>
                <div className="flex flex-col gap-2 text-xs divide-y divide-slate-100">
                  <div className="flex flex-col gap-1 py-1">
                    <span className="text-slate-500 font-medium">{lang === 'ar' ? 'تاريخ التقاط الصورة الأصلي:' : 'Original Date:'}</span>
                    <span className="font-bold text-slate-900">{formatExifDate(exifData.dateTimeOriginal)}</span>
                  </div>
                  {exifData.createDate && (
                    <div className="flex flex-col gap-1 py-1">
                      <span className="text-slate-500 font-medium">{lang === 'ar' ? 'تاريخ إنشاء الرقمية:' : 'Digitized Date:'}</span>
                      <span className="font-bold text-slate-900">{formatExifDate(exifData.createDate)}</span>
                    </div>
                  )}
                  {exifData.modifyDate && (
                    <div className="flex flex-col gap-1 py-1">
                      <span className="text-slate-500 font-medium">{lang === 'ar' ? 'تاريخ آخر تعديل:' : 'Modified Date:'}</span>
                      <span className="font-bold text-slate-900">{formatExifDate(exifData.modifyDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXIF GPS SENSOR & SATELLITE MAP */}
          {activeTab === 'gps' && (
            <div className="flex flex-col gap-5">
              {exifData.latitude && exifData.longitude ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-950">
                          {t.exifGpsFound}
                        </h3>
                        <p className="text-xs font-mono font-bold text-rose-600 mt-0.5">
                          {exifData.latitude.toFixed(6)}, {exifData.longitude.toFixed(6)}
                          {exifData.altitude ? ` • Altitude: ${exifData.altitude}m` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Map Mode Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                        <button
                          onClick={() => setMapType('satellite')}
                          className={`px-3 py-1 font-bold rounded-lg transition-all cursor-pointer text-[11px] ${
                            mapType === 'satellite'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-950'
                          }`}
                        >
                          {lang === 'ar' ? '🛰️ قمر صناعي' : '🛰️ Satellite'}
                        </button>
                        <button
                          onClick={() => setMapType('google')}
                          className={`px-3 py-1 font-bold rounded-lg transition-all cursor-pointer text-[11px] ${
                            mapType === 'google'
                              ? 'bg-white text-indigo-700 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-950'
                          }`}
                        >
                          Google Maps
                        </button>
                        <button
                          onClick={() => setMapType('osm')}
                          className={`px-3 py-1 font-bold rounded-lg transition-all cursor-pointer text-[11px] ${
                            mapType === 'osm'
                              ? 'bg-white text-indigo-700 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-950'
                          }`}
                        >
                          OpenStreetMap
                        </button>
                      </div>

                      <a
                        href={`https://www.google.com/maps?q=${exifData.latitude},${exifData.longitude}&z=16`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors shadow-2xs"
                      >
                        <span>Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <a
                        href={`https://earth.google.com/web/search/${exifData.latitude},${exifData.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors shadow-2xs"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'جوجل إيرث 3D' : 'Google Earth'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Interactive Map */}
                  <div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner">
                    {mapType === 'satellite' ? (
                      <iframe
                        title="Google Satellite EXIF Map"
                        width="100%"
                        height="100%"
                        loading="lazy"
                        className="border-0 w-full h-full"
                        src={`https://maps.google.com/maps?q=${exifData.latitude},${exifData.longitude}&t=k&z=16&output=embed`}
                      />
                    ) : mapType === 'google' ? (
                      <iframe
                        title="Google Maps EXIF Map"
                        width="100%"
                        height="100%"
                        loading="lazy"
                        className="border-0 w-full h-full"
                        src={`https://maps.google.com/maps?q=${exifData.latitude},${exifData.longitude}&z=15&output=embed`}
                      />
                    ) : (
                      <iframe
                        title="OSM EXIF Map"
                        width="100%"
                        height="100%"
                        loading="lazy"
                        className="border-0 w-full h-full"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${exifData.longitude - 0.02}%2C${exifData.latitude - 0.02}%2C${exifData.longitude + 0.02}%2C${exifData.latitude + 0.02}&layer=mapnik&marker=${exifData.latitude}%2C${exifData.longitude}`}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    {t.exifNoGps}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                    {lang === 'ar'
                      ? 'لا تحتوي هذه الصورة على بيانات موقع GPS مدمجة في الهيدر (EXIF). يتم فقط عرض المواصفات التقنية وبيانات الكاميرا والتصوير.'
                      : 'This image does not contain embedded EXIF GPS tags. Standard optical and hardware metadata are displayed above.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CAMERA OPTICS & EXPOSURE */}
          {activeTab === 'camera' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Sliders className="w-5 h-5" />
                <h3 className="text-sm font-black text-slate-950">
                  {t.exifExposureInfo}
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                  <span className="text-[11px] text-slate-500 font-bold">{lang === 'ar' ? 'حساسية الضوء (ISO)' : 'ISO Speed'}</span>
                  <span className="text-sm font-mono font-black text-indigo-600">
                    {exifData.iso ? `ISO ${exifData.iso}` : 'N/A'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                  <span className="text-[11px] text-slate-500 font-bold">{lang === 'ar' ? 'فتحة العدسة (Aperture)' : 'Aperture'}</span>
                  <span className="text-sm font-mono font-black text-emerald-600">
                    {exifData.fNumber ? `f/${exifData.fNumber}` : 'N/A'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                  <span className="text-[11px] text-slate-500 font-bold">{lang === 'ar' ? 'سرعة الغالق (Shutter)' : 'Shutter Speed'}</span>
                  <span className="text-sm font-mono font-black text-slate-950">
                    {exifData.exposureTime ? `${exifData.exposureTime}s` : 'N/A'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                  <span className="text-[11px] text-slate-500 font-bold">{lang === 'ar' ? 'البعد البؤري (Focal)' : 'Focal Length'}</span>
                  <span className="text-sm font-mono font-black text-indigo-600">
                    {exifData.focalLength ? `${exifData.focalLength}mm` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RAW EXIF TAGS TABLE */}
          {activeTab === 'raw' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-black text-slate-950">
                    {t.exifRawTags}
                  </h3>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTag}
                    onChange={(e) => setSearchTag(e.target.value)}
                    placeholder={lang === 'ar' ? 'بحث عن وسم...' : 'Search tags...'}
                    className="w-full ps-9 pe-4 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto max-h-96 border border-slate-200 rounded-2xl shadow-2xs">
                <table className="w-full text-start border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-700 sticky top-0 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 text-start">TAG NAME</th>
                      <th className="p-3 text-start">EXTRACTED VALUE</th>
                      <th className="p-3 text-end">COPY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredTags.map(([key, val]) => (
                      <tr key={key} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-indigo-700 shrink-0">{key}</td>
                        <td className="p-3 font-mono text-slate-800 break-all max-w-md">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </td>
                        <td className="p-3 text-end">
                          <button
                            onClick={() => copyTagValue(key, val)}
                            className="p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-indigo-600 cursor-pointer"
                          >
                            {copiedTag === key ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredTags.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-slate-500 font-medium">
                          {lang === 'ar' ? 'لا توجد وسوم تطابق نتيجة البحث' : 'No EXIF tags match your search query.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
