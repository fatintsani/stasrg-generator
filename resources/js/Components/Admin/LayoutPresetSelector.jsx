import React, { useState } from 'react';
import {
    DOCUMENT_FORMATS,
    COLOR_THEMES,
    PRINT_MODES,
    BOILERPLATES,
    LAYOUT_PRESETS,
} from '../../Utils/layoutPresets';
import {
    CheckCircle2,
    Sliders,
    Image,
    FileText,
    Target,
    Layers,
    Columns,
    LayoutTemplate,
    Palette,
    Sun,
    Moon,
    Sparkles,
    BookmarkCheck,
    Wand2,
    Check,
    Smartphone,
} from 'lucide-react';

export default function LayoutPresetSelector({
    formatValue = 'a4_flyer',
    presetValue = 'balanced',
    themeValue = 'stas_official',
    printModeValue = 'light',
    onFormatChange,
    onPresetChange,
    onThemeChange,
    onPrintModeChange,
    onApplyBoilerplate,
    disabled = false,
}) {
    const [activeTab, setActiveTab] = useState('format'); // 'format' | 'theme' | 'boilerplate'
    const [appliedBoilerplateId, setAppliedBoilerplateId] = useState(null);

    const formatList = Object.values(DOCUMENT_FORMATS);
    const presetsList = Object.values(LAYOUT_PRESETS);
    const themesList = Object.values(COLOR_THEMES);
    const printModesList = Object.values(PRINT_MODES);
    const boilerplateList = Object.values(BOILERPLATES);

    const currentFormat = DOCUMENT_FORMATS[formatValue] || DOCUMENT_FORMATS.a4_flyer;
    const currentTheme = COLOR_THEMES[themeValue] || COLOR_THEMES.stas_official;

    const getFormatIcon = (id) => {
        switch (id) {
            case 'social_feed':
            case 'social_story':
                return <Smartphone className="w-4 h-4" />;
            case 'roll_banner':
                return <Layers className="w-4 h-4" />;
            case 'factsheet_2col':
                return <Columns className="w-4 h-4" />;
            case 'pitch_poster':
                return <LayoutTemplate className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const handleBoilerplateClick = (bp) => {
        if (disabled) return;
        setAppliedBoilerplateId(bp.id);
        if (onApplyBoilerplate) {
            onApplyBoilerplate(bp);
        }
        setTimeout(() => setAppliedBoilerplateId(null), 2500);
    };

    return (
        <div className="space-y-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs">
            {/* Header with Navigation Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#0D5A34] dark:bg-emerald-400" />
                        <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            Templates, Format & Preset Styling
                        </label>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Pilih template format dokumen, palet warna resmi CoE STAS-RG, print mode, dan boilerplate.
                    </p>
                </div>

                {/* Tab Pill Buttons */}
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/80 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-800 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('format')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'format'
                                ? 'bg-white dark:bg-zinc-800 text-[#0D5A34] dark:text-emerald-400 shadow-xs font-bold'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Layout</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('theme')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'theme'
                                ? 'bg-white dark:bg-zinc-800 text-[#0D5A34] dark:text-emerald-400 shadow-xs font-bold'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                    >
                        <Palette className="w-3.5 h-3.5" />
                        <span>Tema</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('boilerplate')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'boilerplate'
                                ? 'bg-white dark:bg-zinc-800 text-[#0D5A34] dark:text-emerald-400 shadow-xs font-bold'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                    >
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        <span>Boilerplates</span>
                    </button>
                </div>
            </div>

            {/* TAB 1: FORMAT & LAYOUT PRESETS */}
            {activeTab === 'format' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Document Format Cards Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-2.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide">
                                1. Pilih Format Dokumen Publikasi
                            </span>
                            <span className="text-[11px] text-zinc-500 font-medium">
                                Format aktif: <strong className="text-emerald-600 dark:text-emerald-400">{currentFormat.name}</strong>
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {formatList.map((fmt) => {
                                const isSelected = (formatValue || 'a4_flyer') === fmt.id;
                                return (
                                    <button
                                        key={fmt.id}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => onFormatChange && onFormatChange(fmt.id)}
                                        className={`relative text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                                            isSelected
                                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-[#0D5A34] dark:border-emerald-500 ring-2 ring-[#0D5A34]/30 shadow-xs'
                                                : 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-[#161e2e]'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                                                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#0D5A34] text-white' : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                                                        {getFormatIcon(fmt.id)}
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                                        {fmt.tagline}
                                                    </span>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                                    isSelected ? 'bg-[#0D5A34] text-white' : 'border border-zinc-300 dark:border-zinc-700 text-transparent'
                                                }`}>
                                                    <Check className="w-2.5 h-2.5" />
                                                </div>
                                            </div>

                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                                {fmt.name}
                                            </h4>

                                            {/* Mini Visual Silhouette */}
                                            <div className="my-2.5 h-14 bg-zinc-200/60 dark:bg-zinc-800/80 rounded-lg border border-zinc-300/40 dark:border-zinc-700/60 flex items-center justify-center overflow-hidden p-1.5">
                                                {fmt.id === 'a4_flyer' && (
                                                    <div className="w-8 h-11 bg-white dark:bg-zinc-700 rounded-xs border border-zinc-300 dark:border-zinc-600 p-0.5 flex flex-col gap-0.5 shadow-2xs">
                                                        <div className="w-full h-1 bg-[#0D5A34]/60 rounded-xs" />
                                                        <div className="w-full h-3 bg-emerald-500/20 rounded-xs" />
                                                        <div className="w-full h-0.5 bg-zinc-300 dark:bg-zinc-500 rounded-xs" />
                                                        <div className="w-full h-0.5 bg-zinc-300 dark:bg-zinc-500 rounded-xs" />
                                                    </div>
                                                )}
                                                {fmt.id === 'roll_banner' && (
                                                    <div className="w-5 h-12 bg-white dark:bg-zinc-700 rounded-xs border border-zinc-300 dark:border-zinc-600 p-0.5 flex flex-col justify-between shadow-2xs">
                                                        <div className="w-full h-1.5 bg-[#0D5A34]/70 rounded-xs" />
                                                        <div className="w-full h-5 bg-emerald-500/20 rounded-xs" />
                                                        <div className="w-2.5 h-2.5 bg-zinc-400 dark:bg-zinc-500 mx-auto rounded-xs" />
                                                    </div>
                                                )}
                                                {fmt.id === 'factsheet_2col' && (
                                                    <div className="w-8 h-11 bg-white dark:bg-zinc-700 rounded-xs border border-zinc-300 dark:border-zinc-600 p-0.5 flex flex-col gap-0.5 shadow-2xs">
                                                        <div className="w-full h-1 bg-[#0D5A34]/60 rounded-xs" />
                                                        <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                                                            <div className="bg-zinc-200/80 dark:bg-zinc-600 rounded-xs p-0.5 flex flex-col gap-0.5">
                                                                <div className="w-full h-0.5 bg-zinc-400 rounded-xs" />
                                                                <div className="w-full h-0.5 bg-zinc-400 rounded-xs" />
                                                            </div>
                                                            <div className="bg-emerald-500/20 rounded-xs flex items-center justify-center">
                                                                <Image className="w-2.5 h-2.5 text-[#0D5A34] opacity-70" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {fmt.id === 'pitch_poster' && (
                                                    <div className="w-12 h-7 bg-white dark:bg-zinc-700 rounded-xs border border-zinc-300 dark:border-zinc-600 p-0.5 flex flex-col justify-between shadow-2xs">
                                                        <div className="flex justify-between items-center">
                                                            <div className="w-4 h-0.5 bg-[#0D5A34] rounded-xs" />
                                                            <div className="w-2 h-0.5 bg-zinc-400 rounded-xs" />
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-0.5 w-full h-3.5">
                                                            <div className="col-span-1 bg-emerald-500/20 rounded-xs" />
                                                            <div className="col-span-2 bg-zinc-200/80 dark:bg-zinc-600 rounded-xs" />
                                                        </div>
                                                    </div>
                                                )}
                                                {fmt.id === 'social_feed' && (
                                                    <div className="w-10 h-10 bg-white dark:bg-zinc-700 rounded-xs border border-zinc-300 dark:border-zinc-600 p-0.5 flex flex-col justify-between shadow-2xs">
                                                        <div className="flex justify-between items-center">
                                                            <div className="w-4 h-0.5 bg-[#0D5A34] rounded-xs" />
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                                                        </div>
                                                        <div className="w-full h-4.5 bg-emerald-500/20 rounded-xs flex items-center justify-center">
                                                            <Image className="w-2 h-2 text-[#0D5A34] opacity-70" />
                                                        </div>
                                                        <div className="flex justify-between items-center gap-0.5">
                                                            <div className="w-4 h-0.5 bg-zinc-300 dark:bg-zinc-500 rounded-xs" />
                                                            <div className="w-1.5 h-1.5 bg-[#0D5A34]/60 rounded-xs" />
                                                        </div>
                                                    </div>
                                                )}
                                                {fmt.id === 'social_story' && (
                                                    <div className="w-6 h-12 bg-white dark:bg-zinc-700 rounded-xs border border-zinc-300 dark:border-zinc-600 p-0.5 flex flex-col justify-between shadow-2xs">
                                                        <div className="flex justify-between items-center">
                                                            <div className="w-2.5 h-0.5 bg-[#0D5A34] rounded-xs" />
                                                            <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                                                        </div>
                                                        <div className="w-full h-4.5 bg-emerald-500/20 rounded-xs flex items-center justify-center">
                                                            <Image className="w-2 h-2 text-[#0D5A34] opacity-70" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <div className="w-full h-0.5 bg-zinc-300 dark:bg-zinc-500 rounded-xs" />
                                                            <div className="w-full h-0.5 bg-zinc-300 dark:bg-zinc-500 rounded-xs" />
                                                        </div>
                                                        <div className="w-2 h-2 bg-[#0D5A34]/60 mx-auto rounded-xs" />
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug line-clamp-2">
                                                {fmt.description}
                                            </p>
                                        </div>

                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mt-2 pt-2 border-t border-zinc-200/40 dark:border-zinc-800">
                                            <strong>Cocok:</strong> {fmt.bestFor}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* A4 Flyer Preset Selector (Balanced / Visual / Text Heavy) */}
                    {formatValue === 'a4_flyer' && (
                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                            <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide mb-2">
                                2. Variasi Proporsi Layout A4
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {presetsList.map((preset) => {
                                    const isSelected = (presetValue || 'balanced') === preset.id;
                                    return (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => onPresetChange && onPresetChange(preset.id)}
                                            className={`relative text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                                                isSelected
                                                    ? 'bg-white dark:bg-[#121824] shadow-xs ring-2 ring-[#0D5A34] border-[#0D5A34] dark:border-emerald-500'
                                                    : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <div className="space-y-0.5">
                                                    <span className={`inline-flex items-center text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${preset.badgeColor}`}>
                                                        {preset.mode}
                                                    </span>
                                                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                                        {preset.name}
                                                    </h5>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                                    isSelected ? 'bg-[#0D5A34] text-white' : 'border border-zinc-300 dark:border-zinc-700 text-transparent'
                                                }`}>
                                                    <Check className="w-2.5 h-2.5" />
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                                                {preset.description}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: COLOR THEMES & PRINT MODE */}
            {activeTab === 'theme' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                    {/* Color Themes */}
                    <div>
                        <div className="flex items-center justify-between mb-2.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide">
                                1. Palet Warna Resmi & Aksesibilitas
                            </span>
                            <span className="text-[11px] text-zinc-500 font-medium">
                                Tema aktif: <strong style={{ color: currentTheme.primary }}>{currentTheme.name}</strong>
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {themesList.map((th) => {
                                const isSelected = (themeValue || 'stas_official') === th.id;
                                return (
                                    <button
                                        key={th.id}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => onThemeChange && onThemeChange(th.id)}
                                        className={`relative text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                                            isSelected
                                                ? 'bg-white dark:bg-[#121824] shadow-md ring-2'
                                                : 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                        }`}
                                        style={{
                                            borderColor: isSelected ? th.primary : undefined,
                                            boxShadow: isSelected ? `0 0 0 2px ${th.primary}33` : undefined,
                                        }}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                {/* Color Swatch Dot */}
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className="w-4 h-4 rounded-full border border-white dark:border-zinc-800 shadow-2xs"
                                                        style={{ backgroundColor: th.primary }}
                                                    />
                                                    <span
                                                        className="w-3 h-3 rounded-full border border-white dark:border-zinc-800 opacity-80"
                                                        style={{ backgroundColor: th.accent }}
                                                    />
                                                </div>
                                                <div
                                                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-white"
                                                    style={{
                                                        backgroundColor: isSelected ? th.primary : 'transparent',
                                                        border: isSelected ? 'none' : '1px solid #d1d5db',
                                                    }}
                                                >
                                                    {isSelected && <Check className="w-2.5 h-2.5" />}
                                                </div>
                                            </div>

                                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                                {th.name}
                                            </h5>
                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                                                {th.tagline}
                                            </p>

                                            {/* Preview Badge representation */}
                                            <div className="mt-2.5 flex items-center gap-1.5">
                                                <span
                                                    className="text-[9px] font-bold px-2 py-0.5 rounded-xs"
                                                    style={{
                                                        backgroundColor: th.badgeBg,
                                                        color: th.badgeText,
                                                    }}
                                                >
                                                    BADGE PROYEK
                                                </span>
                                                <span
                                                    className="text-[9px] font-bold underline"
                                                    style={{ color: th.primary }}
                                                >
                                                    Link Riset
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dark / Light Print Mode */}
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                        <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide mb-2">
                            2. Mode Cetak & Tampilan (Print Mode)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {printModesList.map((pm) => {
                                const isSelected = (printModeValue || 'light') === pm.id;
                                return (
                                    <button
                                        key={pm.id}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => onPrintModeChange && onPrintModeChange(pm.id)}
                                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                                            isSelected
                                                ? 'bg-white dark:bg-[#121824] shadow-xs border-[#0D5A34] dark:border-emerald-500 ring-2 ring-[#0D5A34]/20'
                                                : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg ${pm.id === 'light' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-800 text-zinc-100'}`}>
                                            {pm.id === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                                    {pm.name}
                                                </h5>
                                                {isSelected && (
                                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded">
                                                        Aktif
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                                                {pm.description}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: HEADER & FOOTER BOILERPLATES */}
            {activeTab === 'boilerplate' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide">
                                Standar Boilerplate Header & Footer Otomatis
                            </span>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Klik tombol template di bawah untuk mengisi subtitle badge dan kontak footer secara instan tanpa mengetik manual.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {boilerplateList.map((bp) => {
                            const isJustApplied = appliedBoilerplateId === bp.id;
                            return (
                                <div
                                    key={bp.id}
                                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 flex flex-col justify-between gap-2.5"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <BookmarkCheck className="w-3.5 h-3.5 text-[#0D5A34] dark:text-emerald-400" />
                                                {bp.name}
                                            </h5>
                                            <span className="text-[9px] bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold px-1.5 py-0.5 rounded">
                                                Preset
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                                            {bp.descriptionBadge}
                                        </p>
                                        <div className="text-[10px] text-zinc-600 dark:text-zinc-400 font-mono bg-white dark:bg-zinc-800/80 p-1.5 rounded border border-zinc-200/60 dark:border-zinc-700 space-y-0.5">
                                            <div><strong>Badge:</strong> {bp.subtitle}</div>
                                            <div><strong>Web:</strong> {bp.footer_website}</div>
                                            <div><strong>Social:</strong> {bp.footer_instagram} • {bp.footer_youtube}</div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => handleBoilerplateClick(bp)}
                                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                            isJustApplied
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-white border border-zinc-300 dark:border-zinc-700 hover:border-emerald-500'
                                        }`}
                                    >
                                        {isJustApplied ? (
                                            <>
                                                <Check className="w-3.5 h-3.5" />
                                                <span>Boilerplate Diterapkan!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                <span>Gunakan Template Ini</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
