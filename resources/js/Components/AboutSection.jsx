import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, FileCode2, Check } from 'lucide-react';
import { useApp } from '../Context/AppContext';

export default function AboutSection() {
    const { t } = useApp();

    return (
        <section id="about" className="scroll-mt-20 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-[#090D16] transition-colors">
            <div className="max-w-6xl mx-auto">
                {/* Top Section Header */}
                <div className="max-w-3xl mb-14">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0AB600]/10 dark:bg-[#0AB600]/15 border border-[#0AB600]/25 dark:border-[#0AB600]/30 text-[#0AB600] text-xs font-semibold uppercase tracking-wider mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600] shrink-0"></span>
                        <span>{t.about.tag}</span>
                    </span>

                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                        {t.about.title}
                    </h2>

                    <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                        {t.about.description}
                    </p>
                </div>

                {/* 2 Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Card 1: Ruang Kerja Terpusat */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3 }}
                        className="group p-6 sm:p-8 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-[#0AB600]/40 dark:hover:border-[#0AB600]/40 flex flex-col justify-between transition-all cursor-default shadow-xs hover:shadow-sm overflow-hidden"
                    >
                        <div>
                            {/* Illustration Container */}
                            <div className="relative w-full h-48 sm:h-56 rounded-2xl bg-gradient-to-b from-white to-[#0AB600]/5 dark:from-zinc-800/60 dark:to-[#0AB600]/10 border border-zinc-200/60 dark:border-zinc-800/60 p-4 mb-6 flex items-center justify-center overflow-hidden">
                                <div className="absolute top-3 left-3 p-2 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs text-[#0AB600] border border-[#0AB600]/30 dark:border-[#0AB600]/40 shadow-2xs group-hover:bg-[#0AB600] group-hover:text-white dark:group-hover:bg-[#0AB600] dark:group-hover:text-white transition-all z-10">
                                    <LayoutGrid className="w-4 h-4" />
                                </div>
                                <img
                                    src="/assets/img/icon/tentang/RuangKerjaTerpusat.png"
                                    alt={t.about.card1Title}
                                    className="max-h-full max-w-full object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-[#0AB600] transition-colors">
                                {t.about.card1Title}
                            </h3>

                            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                                {t.about.card1Desc}
                            </p>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60">
                            <div className="flex items-start gap-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                                <div className="p-0.5 rounded-full bg-[#0AB600]/15 dark:bg-[#0AB600]/25 text-[#0AB600] mt-0.5 shrink-0">
                                    <Check className="w-3.5 h-3.5" />
                                </div>
                                <span>{t.about.card1Item1}</span>
                            </div>
                            <div className="flex items-start gap-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                                <div className="p-0.5 rounded-full bg-[#0AB600]/15 dark:bg-[#0AB600]/25 text-[#0AB600] mt-0.5 shrink-0">
                                    <Check className="w-3.5 h-3.5" />
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
                        className="group p-6 sm:p-8 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-[#0AB600]/40 dark:hover:border-[#0AB600]/40 flex flex-col justify-between transition-all cursor-default shadow-xs hover:shadow-sm overflow-hidden"
                    >
                        <div>
                            {/* Illustration Container */}
                            <div className="relative w-full h-48 sm:h-56 rounded-2xl bg-gradient-to-b from-white to-[#0AB600]/5 dark:from-zinc-800/60 dark:to-[#0AB600]/10 border border-zinc-200/60 dark:border-zinc-800/60 p-4 mb-6 flex items-center justify-center overflow-hidden">
                                <div className="absolute top-3 left-3 p-2 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs text-[#0AB600] border border-[#0AB600]/30 dark:border-[#0AB600]/40 shadow-2xs group-hover:bg-[#0AB600] group-hover:text-white dark:group-hover:bg-[#0AB600] dark:group-hover:text-white transition-all z-10">
                                    <FileCode2 className="w-4 h-4" />
                                </div>
                                <img
                                    src="/assets/img/icon/tentang/OutputTerstandarisasi.png"
                                    alt={t.about.card2Title}
                                    className="max-h-full max-w-full object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-[#0AB600] transition-colors">
                                {t.about.card2Title}
                            </h3>

                            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                                {t.about.card2Desc}
                            </p>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60">
                            <div className="flex items-start gap-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                                <div className="p-0.5 rounded-full bg-[#0AB600]/15 dark:bg-[#0AB600]/25 text-[#0AB600] mt-0.5 shrink-0">
                                    <Check className="w-3.5 h-3.5" />
                                </div>
                                <span>{t.about.card2Item1}</span>
                            </div>
                            <div className="flex items-start gap-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                                <div className="p-0.5 rounded-full bg-[#0AB600]/15 dark:bg-[#0AB600]/25 text-[#0AB600] mt-0.5 shrink-0">
                                    <Check className="w-3.5 h-3.5" />
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
