import React, { useState, useRef, useEffect } from 'react';
import {
    X,
    Download,
    Copy,
    Check,
    Printer,
    Image as ImageIcon,
    Sparkles,
    Loader2,
    Layers,
    Sun,
    Moon,
    Palette,
    FileText,
    Smartphone,
    Share2,
    Monitor,
    Maximize2,
    Flag,
    ExternalLink
} from 'lucide-react';
import { A4Document } from './ProjectPreview';
import {
    DOCUMENT_FORMATS,
    COLOR_THEMES,
    PRINT_MODES,
    getDocumentFormat,
    getColorTheme
} from '../../Utils/layoutPresets';
import {
    downloadElementAsImage,
    copyElementToClipboard,
    printFlyer
} from '../../Utils/flyerExport';
import { useAlert } from '../../Context/AlertContext';

const FORMAT_OPTIONS = [
    {
        id: 'social_feed',
        name: 'Instagram / LinkedIn (1:1)',
        category: 'Media Sosial',
        badge: '1080 × 1080',
        icon: Smartphone,
        desc: 'Postingan Feed Instagram, LinkedIn, & WhatsApp.',
    },
    {
        id: 'social_story',
        name: 'Story / WA Status (9:16)',
        category: 'Media Sosial',
        badge: '1080 × 1920',
        icon: Smartphone,
        desc: 'Instagram Story, WhatsApp Status, & Reels.',
    },
    {
        id: 'a4_flyer',
        name: 'A4 Flyer Standar',
        category: 'Dokumen Cetak',
        badge: '210 × 297 mm',
        icon: FileText,
        desc: 'Lembar publikasi cetak resmi CoE STAS-RG.',
    },
    {
        id: 'pitch_poster',
        name: 'Pitch Poster (16:9)',
        category: 'Display & Banner',
        badge: '1200 × 675',
        icon: Monitor,
        desc: 'Display TV, digital kiosk, & slide presentasi.',
    },
    {
        id: 'roll_banner',
        name: 'X-Banner (60×160cm)',
        category: 'Display & Banner',
        badge: '600 × 1600',
        icon: Flag,
        desc: 'Spanduk vertikal booth expo & seminar.',
    },
    {
        id: 'factsheet_2col',
        name: 'Factsheet 2-Kolom',
        category: 'Dokumen Cetak',
        badge: 'Executive Brief',
        icon: Layers,
        desc: 'Ringkasan eksekutif 2-kolom terstruktur.',
    },
];

export default function ExportSosmedModal({ project, isOpen, onClose }) {
    if (!isOpen || !project) return null;

    const { showSuccess, showError } = useAlert();

    // Local Format, Theme & Print Mode states
    const [selectedFormat, setSelectedFormat] = useState(project.doc_format || 'social_feed');
    const [selectedTheme, setSelectedTheme] = useState(project.color_theme || 'stas_official');
    const [selectedPrintMode, setSelectedPrintMode] = useState(project.print_mode || 'light');

    // Loading & Copy States
    const [downloadingPng, setDownloadingPng] = useState(false);
    const [downloadingJpg, setDownloadingJpg] = useState(false);
    const [copyingClipboard, setCopyingClipboard] = useState(false);
    const [copiedSuccess, setCopiedSuccess] = useState(false);

    // Auto-scale measuring ref
    const previewViewportRef = useRef(null);
    const [viewportWidth, setViewportWidth] = useState(0);

    const formatConfig = getDocumentFormat(selectedFormat);
    const themeConfig = getColorTheme(selectedTheme);

    const activeProjectData = {
        ...project,
        doc_format: selectedFormat,
        color_theme: selectedTheme,
        print_mode: selectedPrintMode,
    };

    const canvasDomId = `export-hub-canvas-${project.slug || project.id || 'preview'}`;

    // Measure viewport width for crisp auto-scaling
    useEffect(() => {
        if (!previewViewportRef.current) return;

        const updateWidth = () => {
            if (previewViewportRef.current) {
                setViewportWidth(previewViewportRef.current.clientWidth);
            }
        };

        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        observer.observe(previewViewportRef.current);

        return () => observer.disconnect();
    }, [selectedFormat]);

    const canvasWidth = formatConfig.canvasWidth || 1080;
    const canvasHeight = formatConfig.canvasHeight || 1080;

    // Calculate dynamic scaling so preview fits preview box cleanly
    const previewScale = viewportWidth > 0 
        ? Math.min(0.85, (viewportWidth - 32) / canvasWidth) 
        : 0.45;
    const scaledHeight = canvasHeight * previewScale;

    const getFilenameBase = () => {
        const slug = (project.slug || project.name || 'stasrg_project')
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .toLowerCase();
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `${slug}_${selectedFormat}_${dateStr}`;
    };

    // Download as PNG (Lossless HD 300 DPI)
    const handleDownloadPng = async () => {
        if (downloadingPng) return;
        setDownloadingPng(true);
        try {
            const filename = getFilenameBase();
            await downloadElementAsImage(canvasDomId, filename, 'png', {
                pixelRatio: 2.5,
            });
            showSuccess('Download PNG Berhasil', `File ${filename}.png resolusi tinggi berhasil disimpan.`);
        } catch (error) {
            console.error('PNG export failed:', error);
            showError('Gagal Export PNG', error.message || 'Terjadi kesalahan saat memproses gambar PNG.');
        } finally {
            setDownloadingPng(false);
        }
    };

    // Download as JPG (Compressed for Social Media & Web)
    const handleDownloadJpg = async () => {
        if (downloadingJpg) return;
        setDownloadingJpg(true);
        try {
            const filename = getFilenameBase();
            await downloadElementAsImage(canvasDomId, filename, 'jpg', {
                pixelRatio: 2.5,
                quality: 0.92,
            });
            showSuccess('Download JPG Berhasil', `File ${filename}.jpg siap sosmed berhasil disimpan.`);
        } catch (error) {
            console.error('JPG export failed:', error);
            showError('Gagal Export JPG', error.message || 'Terjadi kesalahan saat memproses gambar JPG.');
        } finally {
            setDownloadingJpg(false);
        }
    };

    // Copy directly to OS Clipboard
    const handleCopyToClipboard = async () => {
        if (copyingClipboard) return;
        setCopyingClipboard(true);
        try {
            await copyElementToClipboard(canvasDomId, {
                pixelRatio: 2.0,
            });
            setCopiedSuccess(true);
            showSuccess('Tersalin ke Clipboard!', 'Gambar siap dipaste (Ctrl+V) langsung ke WhatsApp Web, Canva, Telegram, atau Figma.');
            setTimeout(() => setCopiedSuccess(false), 3000);
        } catch (error) {
            console.error('Clipboard copy failed:', error);
            showError('Gagal Menyalin Gambar', error.message || 'Browser tidak mengizinkan akses clipboard gambar.');
        } finally {
            setCopyingClipboard(false);
        }
    };

    const handlePrint = () => {
        printFlyer(canvasDomId, `${project.title || project.name} - ${formatConfig.name}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#101726] rounded-3xl border border-zinc-200/80 dark:border-zinc-800 w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
                
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50/70 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <Share2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>Multi-Format & Media Sosial Exporter</span>
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                    Sosmed Ready
                                </span>
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-xl">
                                Ekspor "{project.name}" ke format Feed 1:1, Story 9:16, Banner, atau A4 tanpa membuka PDF.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Tutup Modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Main Body (2 Columns Layout) */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-zinc-200/80 dark:divide-zinc-800">
                    
                    {/* LEFT COLUMN: Controls & Presets (lg:col-span-5) */}
                    <div className="lg:col-span-5 p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(92vh-150px)]">
                        
                        {/* 1. Format Selection Grid */}
                        <div className="space-y-2.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                                <span>1. Pilih Format Ekspor</span>
                                <span className="text-[11px] font-normal text-zinc-400">
                                    {formatConfig.tagline}
                                </span>
                            </label>

                            <div className="grid grid-cols-2 gap-2.5">
                                {FORMAT_OPTIONS.map((opt) => {
                                    const isSelected = selectedFormat === opt.id;
                                    const IconComponent = opt.icon;
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setSelectedFormat(opt.id)}
                                            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                                                isSelected
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-[#0D5A34] dark:border-emerald-600 ring-2 ring-[#0D5A34]/20'
                                                    : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`p-1.5 rounded-lg ${
                                                    isSelected 
                                                        ? 'bg-[#0D5A34] text-white' 
                                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                                }`}>
                                                    <IconComponent className="w-4 h-4" />
                                                </span>
                                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700">
                                                    {opt.badge}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className={`text-xs font-bold truncate ${
                                                    isSelected ? 'text-[#0D5A34] dark:text-emerald-300' : 'text-slate-800 dark:text-zinc-200'
                                                }`}>
                                                    {opt.name}
                                                </h4>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                                                    {opt.desc}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Color Theme Selector */}
                        <div className="space-y-2.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                                <span>2. Tema Warna Dokumen</span>
                                <span className="text-[11px] font-semibold" style={{ color: themeConfig.primary }}>
                                    {themeConfig.name}
                                </span>
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                                {Object.values(COLOR_THEMES).map((theme) => {
                                    const isSelected = selectedTheme === theme.id;
                                    return (
                                        <button
                                            key={theme.id}
                                            type="button"
                                            onClick={() => setSelectedTheme(theme.id)}
                                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                                                isSelected
                                                    ? 'border-[#0D5A34] bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-[#0D5A34]'
                                                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:bg-zinc-50'
                                            }`}
                                        >
                                            <span 
                                                className="w-4 h-4 rounded-full shrink-0 shadow-xs border border-white/20"
                                                style={{ backgroundColor: theme.primary }}
                                            />
                                            <div className="min-w-0">
                                                <div className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 truncate">
                                                    {theme.name}
                                                </div>
                                                <div className="text-[9px] text-zinc-400 truncate">
                                                    {theme.tagline}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 3. Light vs Dark Print Mode */}
                        <div className="space-y-2.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                                3. Mode Tampilan Canvas
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'light', name: 'Light Canvas (Putih)', icon: Sun, desc: 'Standar bersih untuk cetak/sosmed' },
                                    { id: 'dark', name: 'Dark Mode (Modern)', icon: Moon, desc: 'Futuristik high-contrast' },
                                ].map((mode) => {
                                    const isSelected = selectedPrintMode === mode.id;
                                    const IconComponent = mode.icon;
                                    return (
                                        <button
                                            key={mode.id}
                                            type="button"
                                            onClick={() => setSelectedPrintMode(mode.id)}
                                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                                                isSelected
                                                    ? 'border-[#0D5A34] bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-[#0D5A34]'
                                                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:bg-zinc-50'
                                            }`}
                                        >
                                            <span className={`p-1 rounded-lg ${isSelected ? 'bg-[#0D5A34] text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                                                <IconComponent className="w-3.5 h-3.5" />
                                            </span>
                                            <div className="min-w-0">
                                                <div className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 truncate">
                                                    {mode.name}
                                                </div>
                                                <div className="text-[9px] text-zinc-400 truncate">
                                                    {mode.desc}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 4. Action Export Buttons Section */}
                        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                                4. Aksi Unduh & Salin
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {/* Download PNG HD */}
                                <button
                                    type="button"
                                    onClick={handleDownloadPng}
                                    disabled={downloadingPng}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D5A34] hover:bg-[#094226] text-white text-xs font-bold shadow-md shadow-emerald-950/20 transition-all cursor-pointer disabled:cursor-wait"
                                    title="Download Gambar PNG Resolusi Tinggi (300 DPI)"
                                >
                                    {downloadingPng ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Rendering PNG...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4" />
                                            <span>Download PNG (HD)</span>
                                        </>
                                    )}
                                </button>

                                {/* Download JPG */}
                                <button
                                    type="button"
                                    onClick={handleDownloadJpg}
                                    disabled={downloadingJpg}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all cursor-pointer disabled:cursor-wait"
                                    title="Download Gambar JPG Kompresi Ringan"
                                >
                                    {downloadingJpg ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Rendering JPG...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon className="w-4 h-4" />
                                            <span>Download JPG</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* One-Click Copy to Clipboard & Print */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={handleCopyToClipboard}
                                    disabled={copyingClipboard}
                                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                        copiedSuccess
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                            : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
                                    }`}
                                    title="Salin gambar visual langsung ke Clipboard (Bisa Ctrl+V di WA Web)"
                                >
                                    {copyingClipboard ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Menyalin Gambar...</span>
                                        </>
                                    ) : copiedSuccess ? (
                                        <>
                                            <Check className="w-4 h-4 text-emerald-600" />
                                            <span>Gambar Tersalin!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            <span>Salin Gambar (Ctrl+V)</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
                                    title="Buka dialog Print / Simpan sebagai PDF"
                                >
                                    <Printer className="w-4 h-4 text-zinc-500" />
                                    <span>Print / Simpan PDF</span>
                                </button>
                            </div>

                            <p className="text-[10px] text-zinc-400 text-center pt-1">
                                Resolusi Kanvas: <strong>{canvasWidth} × {canvasHeight} px</strong> • Otomatis tajam di layar Retina & Smartphone.
                            </p>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Real-Time Interactive Canvas Preview (lg:col-span-7) */}
                    <div 
                        ref={previewViewportRef}
                        className="lg:col-span-7 p-6 bg-zinc-100/80 dark:bg-zinc-950/80 flex flex-col items-center justify-start overflow-y-auto max-h-[calc(92vh-150px)]"
                    >
                        <div className="w-full flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Live Visual Preview ({formatConfig.name})</span>
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                                Skala Preview: {Math.round(previewScale * 100)}%
                            </span>
                        </div>

                        {/* Scaled Preview Frame */}
                        <div 
                            style={{
                                width: `${canvasWidth}px`,
                                height: `${canvasHeight}px`,
                                transform: `scale(${previewScale})`,
                                transformOrigin: 'top center',
                                marginBottom: `-${canvasHeight - scaledHeight}px`,
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08)',
                            }}
                            className="rounded-md shrink-0 bg-white"
                        >
                            <A4Document 
                                project={activeProjectData} 
                                isLive={false} 
                                id={canvasDomId} 
                            />
                        </div>
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="px-6 py-3 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-500">
                    <div>
                        Format aktif: <strong className="text-slate-800 dark:text-zinc-200">{formatConfig.name}</strong> ({formatConfig.tagline})
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>

            </div>
        </div>
    );
}
