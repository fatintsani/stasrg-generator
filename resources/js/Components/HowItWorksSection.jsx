import React from 'react';
import { motion } from 'framer-motion';
import { FileCode, CheckCheck, FolderArchive, ArrowRight, ListOrdered } from 'lucide-react';
import { useApp } from '../Context/AppContext';

export default function HowItWorksSection() {
    const { t } = useApp();

    const steps = [
        {
            step: t.howItWorks.step1Badge,
            title: t.howItWorks.step1Title,
            description: t.howItWorks.step1Desc,
            metaIcon: FileCode,
            metaText: t.howItWorks.step1Meta,
        },
        {
            step: t.howItWorks.step2Badge,
            title: t.howItWorks.step2Title,
            description: t.howItWorks.step2Desc,
            metaIcon: CheckCheck,
            metaText: t.howItWorks.step2Meta,
        },
        {
            step: t.howItWorks.step3Badge,
            title: t.howItWorks.step3Title,
            description: t.howItWorks.step3Desc,
            metaIcon: FolderArchive,
            metaText: t.howItWorks.step3Meta,
        },
    ];

    return (
        <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-[#090D16] transition-colors">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
                        <ListOrdered className="w-3 h-3" />
                        <span>{t.howItWorks.tag}</span>
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
                        {t.howItWorks.title}
                    </h2>
                    <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed">
                        {t.howItWorks.subtitle}
                    </p>
                </div>

                {/* 3 Step Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                    {steps.map((item, index) => {
                        const MetaIcon = item.metaIcon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -4 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="group p-8 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-emerald-300/80 dark:hover:border-emerald-700/80 flex flex-col justify-between transition-all cursor-default"
                            >
                                <div>
                                    {/* Number Badge */}
                                    <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-sm font-extrabold group-hover:bg-[#0D5A34] group-hover:text-white dark:group-hover:bg-emerald-600 dark:group-hover:text-white transition-all mb-6">
                                        {item.step}
                                    </div>

                                    {/* Title & Description */}
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-emerald-900 dark:group-hover:text-emerald-300 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Bottom Metadata */}
                                <div className="mt-8 pt-5 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-medium group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                    <MetaIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>{item.metaText}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
