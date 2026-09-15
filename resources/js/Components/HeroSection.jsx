import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, FileText, Laptop, X, Minus, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { useApp } from '../Context/AppContext';

export default function HeroSection({ stats = {} }) {
    const { t, language } = useApp();

    const isId = language === 'id';

    const words = isId
        ? ['Projects', 'Generator', 'Inovasi', 'Riset', 'Dokumen', 'Showcase']
        : ['Projects', 'Generator', 'Innovations', 'Research', 'Documents', 'Showcase'];

    const [currentWordIndex, setCurrentWordIndex] = useState(0);

    // macOS Window Interactive States
    const [isClosed, setIsClosed] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }, 2400);

        return () => clearInterval(interval);
    }, [words.length]);

    // Dynamic metrics calculated from database
    const totalProjects = stats.total_projects !== undefined ? stats.total_projects : null;
    const totalUsers = stats.total_users !== undefined ? stats.total_users : null;
    const categoriesCount = stats.categories_count || 1;

    const metric1Value = totalProjects !== null 
        ? `${totalProjects} ${isId ? 'Riset' : 'Projects'}` 
        : t.hero.terminal.metric1Value;

    const metric1Desc = totalProjects !== null
        ? `${categoriesCount} ${isId ? 'Kategori Domain • CoE STAS-RG' : 'Domain Categories • CoE STAS-RG'}`
        : t.hero.terminal.metric1Desc;

    const metric2Value = t.hero.terminal.metric2Value || (isId ? '100% Ketat' : '100% Strict');
    const metric2Desc = t.hero.terminal.metric2Desc || (isId ? 'Pemeriksaan format & audit otomatis' : 'Automated syntax & audit check');

    const metric3Value = totalUsers !== null
        ? `${totalUsers} ${isId ? 'Peneliti' : 'Researchers'}`
        : t.hero.terminal.metric3Value;

    const metric3Desc = totalUsers !== null
        ? `${totalUsers} ${isId ? 'Peneliti & engineer terverifikasi' : 'Verified researchers & engineers'}`
        : t.hero.terminal.metric3Desc;

    return (
        <section id="overview" className="scroll-mt-20 relative pt-10 pb-12 sm:pt-24 sm:pb-24 px-3.5 sm:px-6 lg:px-8 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-b from-white via-[#FAFAFA] to-[#F4F6F8] dark:from-[#090D16] dark:via-[#090D16] dark:to-[#0D121F] transition-colors overflow-hidden">
            {/* Ambient Background Glow Effect (Subtle SaaS light) */}
            <div className="ambient-glow" style={{ filter: 'blur(64px)', WebkitFilter: 'blur(64px)' }} />

            <div className={`mx-auto text-center relative z-10 transition-all duration-500 ${isMaximized ? 'max-w-6xl' : 'max-w-4xl'}`}>
                {/* Internal Platform Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#0AB600]/10 dark:bg-[#0AB600]/15 border border-[#0AB600]/25 dark:border-[#0AB600]/30 text-[#0AB600] text-[11px] sm:text-xs font-semibold tracking-wide mb-5 sm:mb-8"
                >
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#0AB600] shrink-0"></span>
                    <span>{t.hero.badge}</span>
                </motion.div>

                {/* Hero Headline with Animated Morphing Word */}
                <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-2xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-3 sm:mb-6 flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3.5"
                >
                    <span>STAS RG</span>
                    <span className="inline-flex items-center justify-start min-w-[120px] sm:min-w-[270px] text-left">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={`${language}-${currentWordIndex}`}
                                initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -22, filter: 'blur(6px)' }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="text-[#0AB600]"
                            >
                                {words[currentWordIndex]}
                            </motion.span>
                        </AnimatePresence>
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xs sm:text-lg lg:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-10 font-normal"
                >
                    {t.hero.subtitle}
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mb-8 sm:mb-16"
                >
                    <a
                        href="#how-it-works"
                        className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-[#0AB600] hover:bg-[#089600] text-white text-xs sm:text-base font-semibold px-4 py-2.5 sm:px-7 sm:py-3 rounded-xl sm:rounded-full border border-[#0AB600] transition-all duration-200 cursor-pointer shadow-md shadow-[#0AB600]/20"
                    >
                        <span>{t.hero.getStarted}</span>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </a>

                    <a
                        href="/documentation"
                        className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs sm:text-base font-medium px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-full border border-zinc-200 dark:border-zinc-700 transition-all duration-200 cursor-pointer"
                    >
                        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500 dark:text-zinc-400" />
                        <span>{t.hero.viewDocs}</span>
                    </a>
                </motion.div>

                {/* Modern SaaS Interactive Preview / Metrics Showcase Card */}
                <AnimatePresence mode="wait">
                    {isClosed ? (
                        /* Reopen Pill when Window is Closed */
                        <motion.div
                            key="reopen-pill"
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            transition={{ duration: 0.3 }}
                            className="flex justify-center"
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    setIsClosed(false);
                                    setIsMinimized(false);
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-md hover:shadow-lg text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-[#0AB600] dark:hover:text-[#0AB600] transition-all cursor-pointer group"
                            >
                                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] animate-pulse"></span>
                                <Laptop className="w-4 h-4 text-[#0AB600] group-hover:rotate-12 transition-transform" />
                                <span>{isId ? 'Tampilkan Kembali Window Overview' : 'Restore Overview Window'}</span>
                                <RotateCcw className="w-3.5 h-3.5 text-zinc-400 group-hover:rotate-180 transition-transform duration-500" />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="mac-window"
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.4 }}
                            className={`w-full text-left rounded-2xl sm:rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden shadow-sm transition-shadow duration-300 ${
                                isMaximized ? 'ring-2 ring-[#0AB600]/30 shadow-xl' : ''
                            }`}
                        >
                            {/* Top Window Bar (macOS Style) */}
                            <div className="px-3.5 py-2.5 sm:px-5 sm:py-3.5 bg-zinc-50/90 dark:bg-zinc-900/90 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between select-none">
                                <div className="flex items-center gap-2.5 sm:gap-3.5 group/window">
                                    {/* macOS Traffic Lights with Functional Clicks */}
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        {/* Red: Close / Hide Window */}
                                        <button
                                            type="button"
                                            onClick={() => setIsClosed(true)}
                                            title={isId ? 'Tutup Window Overview' : 'Close Window'}
                                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] shadow-2xs flex items-center justify-center transition-transform hover:scale-125 cursor-pointer active:scale-95"
                                        >
                                            <X className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-[#7D0000] opacity-0 group-hover/window:opacity-100 transition-opacity" strokeWidth={3} />
                                        </button>

                                        {/* Yellow: Minimize / Collapse Window */}
                                        <button
                                            type="button"
                                            onClick={() => setIsMinimized(!isMinimized)}
                                            title={isMinimized ? (isId ? 'Buka Window' : 'Expand') : (isId ? 'Minimalkan Window' : 'Minimize')}
                                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-2xs flex items-center justify-center transition-transform hover:scale-125 cursor-pointer active:scale-95"
                                        >
                                            <Minus className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-[#995700] opacity-0 group-hover/window:opacity-100 transition-opacity" strokeWidth={3} />
                                        </button>

                                        {/* Green: Maximize / Enlarge Window */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsMaximized(!isMaximized);
                                                if (isMinimized) setIsMinimized(false);
                                            }}
                                            title={isMaximized ? (isId ? 'Kembalikan Ukuran' : 'Restore Size') : (isId ? 'Perbesar Window' : 'Maximize')}
                                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] shadow-2xs flex items-center justify-center transition-transform hover:scale-125 cursor-pointer active:scale-95"
                                        >
                                            {isMaximized ? (
                                                <Minimize2 className="w-1 h-1 sm:w-1.5 sm:h-1.5 text-[#006500] opacity-0 group-hover/window:opacity-100 transition-opacity" strokeWidth={3} />
                                            ) : (
                                                <Maximize2 className="w-1 h-1 sm:w-1.5 sm:h-1.5 text-[#006500] opacity-0 group-hover/window:opacity-100 transition-opacity" strokeWidth={3} />
                                            )}
                                        </button>
                                    </div>

                                    {/* Title with MacBook Icon (Clicking toggles minimize) */}
                                    <div 
                                        onClick={() => setIsMinimized(!isMinimized)}
                                        className="flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Laptop className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                                        <span className="text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-300 font-medium truncate max-w-[180px] sm:max-w-none">
                                            STAS-RG Workspace Overview • Live Metrics
                                        </span>
                                        {isMinimized && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold">
                                                minimized
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isMaximized && (
                                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                                            <span>Expanded View</span>
                                        </span>
                                    )}
                                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-[#0AB600] bg-[#0AB600]/10 dark:bg-[#0AB600]/20 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-[#0AB600]/30 dark:border-[#0AB600]/40 shrink-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600] animate-pulse"></span>
                                        <span>{t.hero.terminal.sync}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Body Metric Cards (Collapsible on Minimize) */}
                            <AnimatePresence>
                                {!isMinimized && (
                                    <motion.div
                                        key="window-body"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-3.5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 transition-all">
                                            {/* Metric 1: Registri Template / Riset Aktif */}
                                            <motion.div 
                                                whileHover={{ y: -3 }}
                                                transition={{ duration: 0.2 }}
                                                className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 hover:border-[#0AB600]/40 dark:hover:border-[#0AB600]/40 transition-all cursor-default"
                                            >
                                                <div className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-start mb-2 sm:mb-3">
                                                    <img
                                                        src="/assets/img/icon/overview/registri.png"
                                                        alt={t.hero.terminal.metric1Title}
                                                        className="w-full h-full object-contain"
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <span className="block text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold mb-0.5 sm:mb-1">
                                                    {t.hero.terminal.metric1Title}
                                                </span>
                                                <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mb-0.5 sm:mb-1">
                                                    {metric1Value}
                                                </div>
                                                <p className="text-[10.5px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                                    {metric1Desc}
                                                </p>
                                            </motion.div>

                                            {/* Metric 2: Verifikasi Integritas */}
                                            <motion.div 
                                                whileHover={{ y: -3 }}
                                                transition={{ duration: 0.2 }}
                                                className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 hover:border-[#0AB600]/40 dark:hover:border-[#0AB600]/40 transition-all cursor-default"
                                            >
                                                <div className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-start mb-2 sm:mb-3">
                                                    <img
                                                        src="/assets/img/icon/overview/verifikasi.png"
                                                        alt={t.hero.terminal.metric2Title}
                                                        className="w-full h-full object-contain"
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <span className="block text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold mb-0.5 sm:mb-1">
                                                    {t.hero.terminal.metric2Title}
                                                </span>
                                                <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#0AB600] mb-0.5 sm:mb-1">
                                                    {metric2Value}
                                                </div>
                                                <p className="text-[10.5px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                                    {metric2Desc}
                                                </p>
                                            </motion.div>

                                            {/* Metric 3: Tingkat Akses / Peneliti */}
                                            <motion.div 
                                                whileHover={{ y: -3 }}
                                                transition={{ duration: 0.2 }}
                                                className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 hover:border-[#0AB600]/40 dark:hover:border-[#0AB600]/40 transition-all cursor-default"
                                            >
                                                <div className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-start mb-2 sm:mb-3">
                                                    <img
                                                        src="/assets/img/icon/overview/akses.png"
                                                        alt={t.hero.terminal.metric3Title}
                                                        className="w-full h-full object-contain"
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <span className="block text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold mb-0.5 sm:mb-1">
                                                    {t.hero.terminal.metric3Title}
                                                </span>
                                                <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mb-0.5 sm:mb-1">
                                                    {metric3Value}
                                                </div>
                                                <p className="text-[10.5px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                                    {metric3Desc}
                                                </p>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}

