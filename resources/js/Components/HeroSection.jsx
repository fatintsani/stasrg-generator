import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, CheckCircle2, ShieldCheck, Database, Layers } from 'lucide-react';
import { useApp } from '../Context/AppContext';

export default function HeroSection() {
    const { t } = useApp();

    return (
        <section id="overview" className="scroll-mt-20 relative pt-20 pb-20 sm:pt-28 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-b from-white via-[#FAFAFA] to-[#F4F6F8] dark:from-[#090D16] dark:via-[#090D16] dark:to-[#0D121F] transition-colors">
            {/* Ambient Background Glow Effect (Subtle SaaS light) */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

            <div className="max-w-4xl mx-auto text-center relative z-10">
                {/* Internal Platform Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold tracking-wide mb-8"
                >
                    <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0"></span>
                    <span>{t.hero.badge} • CoE STAS-RG</span>
                </motion.div>

                {/* Hero Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12] mb-6"
                >
                    {t.hero.title}
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
                        className="inline-flex items-center justify-center gap-2 bg-[#0D5A34] hover:bg-[#094226] text-white text-sm sm:text-base font-semibold px-7 py-3 rounded-full border border-[#0D5A34] transition-all duration-200 cursor-pointer"
                    >
                        <span>{t.hero.getStarted}</span>
                        <ArrowRight className="w-4 h-4" />
                    </a>

                    <a
                        href="#about"
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
                    className="w-full text-left rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden"
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
                                STAS-RG Workspace Overview
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse"></span>
                            <span>{t.hero.terminal.sync}</span>
                        </div>
                    </div>

                    {/* Body Metric Cards */}
                    <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Metric 1 */}
                        <motion.div 
                            whileHover={{ y: -3 }}
                            transition={{ duration: 0.2 }}
                            className="p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all cursor-default"
                        >
                            <div className="w-8 h-8 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-3">
                                <Layers className="w-4 h-4" />
                            </div>
                            <span className="block text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                                {t.hero.terminal.metric1Title}
                            </span>
                            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                                {t.hero.terminal.metric1Value}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                {t.hero.terminal.metric1Desc}
                            </p>
                        </motion.div>

                        {/* Metric 2 */}
                        <motion.div 
                            whileHover={{ y: -3 }}
                            transition={{ duration: 0.2 }}
                            className="p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all cursor-default"
                        >
                            <div className="w-8 h-8 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-3">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <span className="block text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                                {t.hero.terminal.metric2Title}
                            </span>
                            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 mb-1">
                                {t.hero.terminal.metric2Value}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                {t.hero.terminal.metric2Desc}
                            </p>
                        </motion.div>

                        {/* Metric 3 */}
                        <motion.div 
                            whileHover={{ y: -3 }}
                            transition={{ duration: 0.2 }}
                            className="p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all cursor-default"
                        >
                            <div className="w-8 h-8 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-3">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <span className="block text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                                {t.hero.terminal.metric3Title}
                            </span>
                            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                                {t.hero.terminal.metric3Value}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                {t.hero.terminal.metric3Desc}
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
