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
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0"></span>
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
                    {/* Card 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3 }}
                        className="group p-8 sm:p-9 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-emerald-300/80 dark:hover:border-emerald-700/80 transition-all cursor-default"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/70 flex items-center justify-center text-emerald-800 dark:text-emerald-300 mb-6 transition-transform group-hover:scale-105">
                            <LayoutGrid className="w-6 h-6" />
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-emerald-900 dark:group-hover:text-emerald-300 transition-colors">
                            {t.about.card1Title}
                        </h3>

                        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-8">
                            {t.about.card1Desc}
                        </p>

                        <div className="space-y-3 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60">
                            <div className="flex items-start gap-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                                <div className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 mt-0.5 shrink-0">
                                    <Check className="w-3.5 h-3.5" />
                                </div>
                                <span>{t.about.card1Item1}</span>
                            </div>
                            <div className="flex items-start gap-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                                <div className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 mt-0.5 shrink-0">
                                    <Check className="w-3.5 h-3.5" />
                                </div>
                                <span>{t.about.card1Item2}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                        className="group p-8 sm:p-9 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-emerald-300/80 dark:hover:border-emerald-700/80 transition-all cursor-default"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/70 flex items-center justify-center text-emerald-800 dark:text-emerald-300 mb-6 transition-transform group-hover:scale-105">
                            <FileCode2 className="w-6 h-6" />
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-emerald-900 dark:group-hover:text-emerald-300 transition-colors">
                            {t.about.card2Title}
                        </h3>

                        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-8">
                            {t.about.card2Desc}
                        </p>

                        <div className="space-y-3 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60">
                            <div className="flex items-start gap-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                                <div className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 mt-0.5 shrink-0">
                                    <Check className="w-3.5 h-3.5" />
                                </div>
                                <span>{t.about.card2Item1}</span>
                            </div>
                            <div className="flex items-start gap-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                                <div className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 mt-0.5 shrink-0">
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
