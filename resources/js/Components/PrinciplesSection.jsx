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
        <section id="principles" className="scroll-mt-20 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-[#FAFAFA] dark:bg-[#090D16] transition-colors">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
                        <Compass className="w-3 h-3" />
                        <span>{t.principles.tag}</span>
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
                        {t.principles.title}
                    </h2>
                    <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed">
                        {t.principles.subtitle}
                    </p>
                </div>

                {/* 3 Process Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
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
                                className="group p-7 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-emerald-300/80 dark:hover:border-emerald-700/80 flex flex-col justify-between transition-all cursor-default"
                            >
                                <div>
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between pb-5 mb-5 border-b border-zinc-100 dark:border-zinc-800">
                                        <span className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors uppercase">
                                            {item.phase}
                                        </span>
                                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-105">
                                            <IconComponent className="w-4 h-4" />
                                        </div>
                                    </div>

                                    {/* Title & Description */}
                                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-emerald-900 dark:group-hover:text-emerald-300 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Bottom Tag */}
                                <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                                    <span className="text-xs font-semibold tracking-wide text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
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
