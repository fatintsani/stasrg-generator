import React, { useState, useEffect } from 'react';
import {
    LayoutTemplate,
    Search,
    X,
    Check,
    Sparkles,
    CheckCircle2,
    Layers,
    Palette,
    Eye,
    Sliders,
    BookmarkCheck,
    Loader2,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { A4Document } from './ProjectPreview';
import PreviewPanZoomContainer from './PreviewPanZoomContainer';
import { getDocumentFormat, getColorTheme, getDesignStyle } from '../../Utils/layoutPresets';

export default function TemplatePickerModal({
    isOpen,
    onClose,
    onSelectTemplate,
}) {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [previewZoom, setPreviewZoom] = useState(100);

    useEffect(() => {
        if (!isOpen) return;

        setLoading(true);
        fetch('/api/templates')
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.templates) {
                    setTemplates(data.templates);
                }
            })
            .catch((err) => console.error('Failed to load templates', err))
            .finally(() => setLoading(false));
    }, [isOpen]);

    if (!isOpen) return null;

    const categories = Array.from(new Set(templates.map((t) => t.category).filter(Boolean)));

    const filteredTemplates = templates.filter((t) => {
        const matchesSearch =
            !search ||
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
            (t.category && t.category.toLowerCase().includes(search.toLowerCase()));

        const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;

        return matchesSearch && matchesCat;
    });

    const handleApply = (tpl) => {
        if (onSelectTemplate) {
            onSelectTemplate(tpl);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-[#0AB600] text-white">
                            <LayoutTemplate className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Pilih Template Desain Proyek
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Terapkan format, gaya tata letak visual, palet warna, dan struktur poin otomatis dari template.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Filter & Search Bar */}
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari template atau gaya desain..."
                            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0AB600]/20"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                selectedCategory === 'all'
                                    ? 'bg-[#0AB600] text-white font-bold'
                                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                            }`}
                        >
                            Semua
                        </button>
                        {categories.map((cat, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                    selectedCategory === cat
                                        ? 'bg-[#0AB600] text-white font-bold'
                                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Templates Grid Content */}
                <div className="p-4 sm:p-5 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-3">
                            <Loader2 className="w-8 h-8 text-[#0AB600] animate-spin" />
                            <p className="text-xs text-zinc-500">Memuat katalog template...</p>
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="text-center py-16 space-y-2">
                            <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                                Tidak ada template yang cocok
                            </p>
                            <p className="text-xs text-zinc-500">Coba ubah kata kunci pencarian Anda.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTemplates.map((tpl) => {
                                const formatCfg = getDocumentFormat(tpl.doc_format);
                                const themeCfg = getColorTheme(tpl.color_theme);
                                const styleCfg = getDesignStyle(tpl.design_style);

                                const previewObj = {
                                    title: tpl.default_data?.title || tpl.name,
                                    subtitle: tpl.default_data?.subtitle || 'CoE STAS-RG Template',
                                    description: tpl.default_data?.description || tpl.description || '',
                                    category: tpl.category || 'General',
                                    doc_format: tpl.doc_format || 'a4_flyer',
                                    layout_preset: tpl.layout_preset || 'balanced',
                                    design_style: tpl.design_style || 'classic_standard',
                                    color_theme: tpl.color_theme || 'stas_official',
                                    print_mode: tpl.print_mode || 'light',
                                    benefits: tpl.default_data?.benefits,
                                    specifications: tpl.default_data?.specifications,
                                    problem_solution: tpl.default_data?.problem_solution,
                                    footer_website: tpl.default_data?.footer_website || 'www.stas-rg.com',
                                    footer_instagram: tpl.default_data?.footer_instagram || '@stas.rg',
                                    footer_youtube: tpl.default_data?.footer_youtube || '@stas_rg',
                                    social_links: tpl.default_data?.social_links || [
                                        { platform: 'website', value: tpl.default_data?.footer_website || 'www.stas-rg.com' },
                                        { platform: 'instagram', value: tpl.default_data?.footer_instagram || '@stas.rg' },
                                        { platform: 'youtube', value: tpl.default_data?.footer_youtube || '@stas_rg' },
                                    ],
                                    project_url: 'https://www.stas-rg.com',
                                    layout_schema: tpl.layout_schema || null,
                                };

                                return (
                                    <div
                                        key={tpl.id}
                                        className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#161e2e] flex flex-col justify-between hover:border-[#0AB600] transition-all hover:shadow-lg overflow-hidden group"
                                    >
                                        {/* Card Top Scaled Canvas Thumbnail */}
                                        <div className="relative p-2.5 bg-gradient-to-b from-zinc-100 to-zinc-200/80 dark:from-zinc-900 dark:to-zinc-950 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center overflow-hidden h-44">
                                            {(() => {
                                                const availableHeight = 150;
                                                const availableWidth = 260;
                                                const s = Math.min(availableHeight / formatCfg.canvasHeight, availableWidth / formatCfg.canvasWidth);
                                                const scaledW = formatCfg.canvasWidth * s;
                                                const scaledH = formatCfg.canvasHeight * s;

                                                return (
                                                    <div 
                                                        className="relative rounded-sm shadow-sm transition-transform duration-300 group-hover:scale-105 border border-black/10 dark:border-white/10 shrink-0"
                                                        style={{
                                                            width: `${scaledW}px`,
                                                            height: `${scaledH}px`,
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        <div
                                                            className="pointer-events-none select-none"
                                                            style={{
                                                                width: `${formatCfg.canvasWidth}px`,
                                                                height: `${formatCfg.canvasHeight}px`,
                                                                transform: `scale(${s})`,
                                                                transformOrigin: 'top left',
                                                            }}
                                                        >
                                                            <A4Document project={previewObj} id={`tpl-picker-mini-${tpl.id}`} />
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* Top badges */}
                                            <div className="absolute top-2 left-2 flex gap-1 z-10">
                                                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs text-slate-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                                                    {formatCfg.name}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-[#0AB600] bg-[#0AB600]/10 px-2 py-0.5 rounded">
                                                        {tpl.category}
                                                    </span>
                                                </div>

                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#0AB600] transition-colors">
                                                    {tpl.name}
                                                </h4>

                                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                                    {tpl.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 pt-1">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: themeCfg.primary }} />
                                                <span>{formatCfg.name} • {themeCfg.name}</span>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleApply(tpl)}
                                                className="flex-1 py-1.5 px-3 rounded-lg bg-[#0AB600] hover:bg-[#099600] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                <span>Terapkan Template</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPreviewZoom(100);
                                                    setPreviewTemplate(previewObj);
                                                }}
                                                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                                                title="Preview Desain"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>
            </div>

            {/* Sub-Modal for Full Preview with Pan & Zoom */}
            {previewTemplate && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#121824] rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">
                        {/* Sub-Modal Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-[#0AB600]/10 flex items-center justify-center text-[#0AB600] shrink-0">
                                    <LayoutTemplate className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                            {previewTemplate.title}
                                        </h4>
                                        <span className="text-[10px] bg-[#0AB600]/10 text-[#0AB600] font-mono font-bold px-2 py-0.5 rounded shrink-0">
                                            {previewTemplate.doc_format}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                        Pratinjau format kanvas ({previewTemplate.doc_format} • {previewTemplate.design_style} • {previewTemplate.color_theme})
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                {/* Zoom Controls */}
                                <div className="inline-flex items-center bg-white dark:bg-zinc-800 rounded-xl p-1 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewZoom((z) => Math.max(40, z - 15))}
                                        disabled={previewZoom <= 40}
                                        className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors cursor-pointer"
                                        title="Zoom Out (Perkecil)"
                                    >
                                        <ZoomOut className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewZoom(100)}
                                        className="px-2.5 py-1 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                                        title="Reset Zoom 100%"
                                    >
                                        {previewZoom}%
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewZoom((z) => Math.min(200, z + 15))}
                                        disabled={previewZoom >= 200}
                                        className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors cursor-pointer"
                                        title="Zoom In (Perbesar)"
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setPreviewTemplate(null)}
                                    className="p-2 rounded-xl text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                    title="Tutup Preview"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Canvas Viewport with Pan & Zoom */}
                        <div className="flex-1 overflow-hidden bg-zinc-950/20 dark:bg-zinc-950/70 p-2 sm:p-4 flex items-center justify-center relative">
                            <PreviewPanZoomContainer
                                zoom={previewZoom}
                                maxHeight="100%"
                                onResetZoom={() => setPreviewZoom(100)}
                            >
                                <A4Document project={previewTemplate} isLive={true} id="tpl-submodal-preview" />
                            </PreviewPanZoomContainer>
                        </div>

                        {/* Sub-Modal Footer */}
                        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 flex items-center justify-between gap-3 shrink-0">
                            <span className="text-xs text-zinc-500 hidden sm:inline">
                                Gunakan scroll atau drag mouse untuk menggeser dokumen saat diperbesar.
                            </span>
                            <div className="flex items-center gap-2 ml-auto">
                                <button
                                    type="button"
                                    onClick={() => setPreviewTemplate(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-slate-700 dark:text-zinc-300"
                                >
                                    Tutup
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const found = templates.find((t) => t.id === previewTemplate.id || t.name === previewTemplate.title);
                                        if (found) handleApply(found);
                                        setPreviewTemplate(null);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0AB600] hover:bg-[#099600] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>Terapkan Template Ini</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
