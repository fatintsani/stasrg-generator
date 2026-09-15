import React from 'react';
import { motion } from 'framer-motion';
import { FolderGit2, Layers, Zap, Compass } from 'lucide-react';
import { useApp } from '../Context/AppContext';

export default function PrinciplesSection() {
    const { t } = useApp();

    const principles = [
        {
            phase: t.principles.phase1Badge,
            icon: FolderGit2,
            title: t.principles.phase1Title,
            description: t.principles.phase1Desc,
            tag: t.principles.phase1Tag,
        },
        {
            phase: t.principles.phase2Badge,
            icon: Layers,
            title: t.principles.phase2Title,
            description: t.principles.phase2Desc,
            tag: t.principles.phase2Tag,
        },
        {
            phase: t.principles.phase3Badge,
            icon: Zap,
            title: t.principles.phase3Title,
            description: t.principles.phase3Desc,
            tag: t.principles.phase3Tag,
        },
    ];

    return (
        <section id="principles" className="scroll-mt-20 relative py-10 sm:py-20 md:py-28 px-3.5 sm:px-6 lg:px-8 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-[#FAFAFA] dark:bg-[#090D16] transition-colors overflow-hidden">
            {/* Ambient Background Glow Effect (Subtle SaaS light) */}
            <div className="ambient-glow" style={{ filter: 'blur(64px)', WebkitFilter: 'blur(64px)' }} />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-16">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#0AB600]/10 dark:bg-[#0AB600]/15 border border-[#0AB600]/25 dark:border-[#0AB600]/30 text-[#0AB600] text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4">
                        <Compass className="w-3 h-3" />
                        <span>{t.principles.tag}</span>
                    </span>
                    <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 sm:mb-4 leading-tight">
                        {t.principles.title}
                    </h2>
                    <p className="text-xs sm:text-base md:text-lg text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed">
                        {t.principles.subtitle}
                    </p>
                </div>

                {/* 3 Process Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-7">
                    {principles.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -4 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="group p-4 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-[#0AB600]/40 dark:hover:border-[#0AB600]/40 flex flex-col justify-between transition-all cursor-default"
                            >
                                <div>
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between pb-3.5 mb-3.5 sm:pb-5 sm:mb-5 border-b border-zinc-100 dark:border-zinc-800">
                                        <span className="text-[10px] sm:text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 group-hover:text-[#0AB600] transition-colors uppercase">
                                            {item.phase}
                                        </span>
                                        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#0AB600]/10 dark:bg-[#0AB600]/20 text-[#0AB600] flex items-center justify-center transition-transform group-hover:scale-105">
                                            <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </div>
                                    </div>

                                    {/* Title & Description */}
                                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-3 group-hover:text-[#0AB600] transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Bottom Tag */}
                                <div className="mt-5 sm:mt-8 pt-3 sm:pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                                    <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-zinc-400 dark:text-zinc-500 group-hover:text-[#0AB600] transition-colors">
                                        {item.tag}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
