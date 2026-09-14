import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';
import { useApp } from '../Context/AppContext';

export default function HeroSection({ stats = {} }) {
    const { t, language } = useApp();

    const isId = language === 'id';

    const words = isId
        ? ['Projects', 'Generator', 'Inovasi', 'Riset', 'Dokumen', 'Showcase']
        : ['Projects', 'Generator', 'Innovations', 'Research', 'Documents', 'Showcase'];

    const [currentWordIndex, setCurrentWordIndex] = useState(0);

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
        <section id="overview" className="scroll-mt-20 relative pt-20 pb-20 sm:pt-28 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-b from-white via-[#FAFAFA] to-[#F4F6F8] dark:from-[#090D16] dark:via-[#090D16] dark:to-[#0D121F] transition-colors">
            {/* Ambient Background Glow Effect (Subtle SaaS light) */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-64 bg-[#0AB600]/5 dark:bg-[#0AB600]/10 rounded-full blur-3xl pointer-events-none -z-0" />

            <div className="max-w-4xl mx-auto text-center relative z-10">
                {/* Internal Platform Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0AB600]/10 dark:bg-[#0AB600]/15 border border-[#0AB600]/25 dark:border-[#0AB600]/30 text-[#0AB600] text-xs font-semibold tracking-wide mb-8"
                >
                    <span className="w-2 h-2 rounded-full bg-[#0AB600] shrink-0"></span>
                    <span>{t.hero.badge}</span>
                </motion.div>

                {/* Hero Headline with Animated Morphing Word */}
                <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-6 flex flex-wrap items-center justify-center gap-x-3.5"
                >
                    <span>STAS RG</span>
                    <span className="inline-flex items-center justify-start min-w-[170px] sm:min-w-[270px] text-left">
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
                    className="text-base sm:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed mb-10 font-normal"
                >
                    {t.hero.subtitle}
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-wrap items-center justify-center gap-3.5 mb-16"
                >
                    <a
                        href="#how-it-works"
                        className="inline-flex items-center justify-center gap-2 bg-[#0AB600] hover:bg-[#089600] text-white text-sm sm:text-base font-semibold px-7 py-3 rounded-full border border-[#0AB600] transition-all duration-200 cursor-pointer shadow-md shadow-[#0AB600]/20"
                    >
                        <span>{t.hero.getStarted}</span>
                        <ArrowRight className="w-4 h-4" />
                    </a>

                    <a
                        href="/documentation"
                        className="inline-flex items-center justify-center gap-2 bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-sm sm:text-base font-medium px-6 py-3 rounded-full border border-zinc-200 dark:border-zinc-700 transition-all duration-200 cursor-pointer"
                    >
                        <FileText className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                        <span>{t.hero.viewDocs}</span>
                    </a>
                </motion.div>

                {/* Modern SaaS Interactive Preview / Metrics Showcase Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="w-full text-left rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden shadow-sm"
                >
                    {/* Top Window Bar */}
                    <div className="px-5 py-3.5 bg-zinc-50/80 dark:bg-zinc-900/90 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 inline-block"></span>
                                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 inline-block"></span>
                                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 inline-block"></span>
                            </div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                STAS-RG Workspace Overview • Live Metrics
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-semibold text-[#0AB600] bg-[#0AB600]/10 dark:bg-[#0AB600]/20 px-2.5 py-1 rounded-full border border-[#0AB600]/30 dark:border-[#0AB600]/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600] animate-pulse"></span>
                            <span>{t.hero.terminal.sync}</span>
                        </div>
                    </div>

                    {/* Body Metric Cards */}
                    <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Metric 1: Registri Template / Riset Aktif */}
                        <motion.div 
                            whileHover={{ y: -3 }}
                            transition={{ duration: 0.2 }}
                            className="p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 hover:border-[#0AB600]/40 dark:hover:border-[#0AB600]/40 transition-all cursor-default"
                        >
                            <div className="w-12 h-12 flex items-center justify-start mb-3">
                                <img
                                    src="/assets/img/icon/overview/registri.png"
                                    alt={t.hero.terminal.metric1Title}
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                />
                            </div>
                            <span className="block text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                                {t.hero.terminal.metric1Title}
                            </span>
                            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                                {metric1Value}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                {metric1Desc}
                            </p>
                        </motion.div>

                        {/* Metric 2: Verifikasi Integritas */}
                        <motion.div 
                            whileHover={{ y: -3 }}
                            transition={{ duration: 0.2 }}
                            className="p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 hover:border-[#0AB600]/40 dark:hover:border-[#0AB600]/40 transition-all cursor-default"
                        >
                            <div className="w-12 h-12 flex items-center justify-start mb-3">
                                <img
                                    src="/assets/img/icon/overview/verifikasi.png"
                                    alt={t.hero.terminal.metric2Title}
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                />
                            </div>
                            <span className="block text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                                {t.hero.terminal.metric2Title}
                            </span>
                            <div className="text-2xl sm:text-3xl font-extrabold text-[#0AB600] mb-1">
                                {metric2Value}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                {metric2Desc}
                            </p>
                        </motion.div>

                        {/* Metric 3: Tingkat Akses / Peneliti */}
                        <motion.div 
                            whileHover={{ y: -3 }}
                            transition={{ duration: 0.2 }}
                            className="p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 hover:border-[#0AB600]/40 dark:hover:border-[#0AB600]/40 transition-all cursor-default"
                        >
                            <div className="w-12 h-12 flex items-center justify-start mb-3">
                                <img
                                    src="/assets/img/icon/overview/akses.png"
                                    alt={t.hero.terminal.metric3Title}
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                />
                            </div>
                            <span className="block text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                                {t.hero.terminal.metric3Title}
                            </span>
                            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                                {metric3Value}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                {metric3Desc}
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
