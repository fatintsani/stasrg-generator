import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, FileCode2, Check } from 'lucide-react';
import { useApp } from '../Context/AppContext';

export default function AboutSection() {
    const { t } = useApp();

    return (
        <section id="about" className="scroll-mt-20 relative py-10 sm:py-20 md:py-28 px-3.5 sm:px-6 lg:px-8 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-[#090D16] transition-colors overflow-hidden">
            {/* Ambient Background Glow Effect (Subtle SaaS light) */}
            <div className="ambient-glow" style={{ filter: 'blur(64px)', WebkitFilter: 'blur(64px)' }} />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Top Section Header */}
                <div className="max-w-3xl mb-8 sm:mb-14">
                    <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#0AB600]/10 dark:bg-[#0AB600]/15 border border-[#0AB600]/25 dark:border-[#0AB600]/30 text-[#0AB600] text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600] shrink-0"></span>
                        <span>{t.about.tag}</span>
                    </span>

                    <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                        {t.about.title}
                    </h2>

                    <p className="mt-2.5 sm:mt-4 text-xs sm:text-base md:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                        {t.about.description}
                    </p>
                </div>

                {/* 2 Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                    {/* Card 1: Ruang Kerja Terpusat */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3 }}
                        className="group p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-[#0AB600]/40 dark:hover:border-[#0AB600]/40 flex flex-col justify-between transition-all cursor-default shadow-xs hover:shadow-sm overflow-hidden"
                    >
                        <div>
                            {/* Illustration Container */}
                            <div className="relative w-full h-36 sm:h-48 md:h-56 rounded-xl sm:rounded-2xl bg-gradient-to-b from-white to-[#0AB600]/5 dark:from-zinc-800/60 dark:to-[#0AB600]/10 border border-zinc-200/60 dark:border-zinc-800/60 p-3 sm:p-4 mb-4 sm:mb-6 flex items-center justify-center overflow-hidden">
                                <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs text-[#0AB600] border border-[#0AB600]/30 dark:border-[#0AB600]/40 shadow-2xs group-hover:bg-[#0AB600] group-hover:text-white dark:group-hover:bg-[#0AB600] dark:group-hover:text-white transition-all z-10">
                                    <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <img
                                    src="/assets/img/icon/tentang/RuangKerjaTerpusat.png"
                                    alt={t.about.card1Title}
                                    className="max-h-full max-w-full object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>

                            <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-3 group-hover:text-[#0AB600] transition-colors">
                                {t.about.card1Title}
                            </h3>

                            <p className="text-[11px] sm:text-xs md:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4 sm:mb-6">
                                {t.about.card1Desc}
                            </p>
                        </div>

                        <div className="space-y-2 sm:space-y-3 pt-4 sm:pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60">
                            <div className="flex items-start gap-2.5 sm:gap-3 text-[11px] sm:text-xs md:text-sm text-zinc-700 dark:text-zinc-300">
                                <div className="p-0.5 rounded-full bg-[#0AB600]/15 dark:bg-[#0AB600]/25 text-[#0AB600] mt-0.5 shrink-0">
                                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                </div>
                                <span>{t.about.card1Item1}</span>
                            </div>
                            <div className="flex items-start gap-2.5 sm:gap-3 text-[11px] sm:text-xs md:text-sm text-zinc-700 dark:text-zinc-300">
                                <div className="p-0.5 rounded-full bg-[#0AB600]/15 dark:bg-[#0AB600]/25 text-[#0AB600] mt-0.5 shrink-0">
                                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                </div>
                                <span>{t.about.card1Item2}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Output Terstandarisasi */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                        className="group p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-[#0AB600]/40 dark:hover:border-[#0AB600]/40 flex flex-col justify-between transition-all cursor-default shadow-xs hover:shadow-sm overflow-hidden"
                    >
                        <div>
                            {/* Illustration Container */}
                            <div className="relative w-full h-36 sm:h-48 md:h-56 rounded-xl sm:rounded-2xl bg-gradient-to-b from-white to-[#0AB600]/5 dark:from-zinc-800/60 dark:to-[#0AB600]/10 border border-zinc-200/60 dark:border-zinc-800/60 p-3 sm:p-4 mb-4 sm:mb-6 flex items-center justify-center overflow-hidden">
                                <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs text-[#0AB600] border border-[#0AB600]/30 dark:border-[#0AB600]/40 shadow-2xs group-hover:bg-[#0AB600] group-hover:text-white dark:group-hover:bg-[#0AB600] dark:group-hover:text-white transition-all z-10">
                                    <FileCode2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <img
                                    src="/assets/img/icon/tentang/OutputTerstandarisasi.png"
                                    alt={t.about.card2Title}
                                    className="max-h-full max-w-full object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>

                            <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-3 group-hover:text-[#0AB600] transition-colors">
                                {t.about.card2Title}
                            </h3>

                            <p className="text-[11px] sm:text-xs md:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4 sm:mb-6">
                                {t.about.card2Desc}
                            </p>
                        </div>

                        <div className="space-y-2 sm:space-y-3 pt-4 sm:pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60">
                            <div className="flex items-start gap-2.5 sm:gap-3 text-[11px] sm:text-xs md:text-sm text-zinc-700 dark:text-zinc-300">
                                <div className="p-0.5 rounded-full bg-[#0AB600]/15 dark:bg-[#0AB600]/25 text-[#0AB600] mt-0.5 shrink-0">
                                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                </div>
                                <span>{t.about.card2Item1}</span>
                            </div>
                            <div className="flex items-start gap-2.5 sm:gap-3 text-[11px] sm:text-xs md:text-sm text-zinc-700 dark:text-zinc-300">
                                <div className="p-0.5 rounded-full bg-[#0AB600]/15 dark:bg-[#0AB600]/25 text-[#0AB600] mt-0.5 shrink-0">
                                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                </div>
                                <span>{t.about.card2Item2}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
