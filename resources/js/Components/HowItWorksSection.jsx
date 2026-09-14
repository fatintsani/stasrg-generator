import React from 'react';
import { motion } from 'framer-motion';
import { FileCode, CheckCheck, FolderArchive, ListOrdered } from 'lucide-react';
import { useApp } from '../Context/AppContext';

export default function HowItWorksSection() {
    const { t } = useApp();

    const steps = [
        {
            step: t.howItWorks.step1Badge,
            title: t.howItWorks.step1Title,
            description: t.howItWorks.step1Desc,
            image: '/assets/img/icon/cara_kerja/BuatProyek.png',
            metaIcon: FileCode,
            metaText: t.howItWorks.step1Meta,
        },
        {
            step: t.howItWorks.step2Badge,
            title: t.howItWorks.step2Title,
            description: t.howItWorks.step2Desc,
            image: '/assets/img/icon/cara_kerja/IsiInformasiProyek.png',
            metaIcon: CheckCheck,
            metaText: t.howItWorks.step2Meta,
        },
        {
            step: t.howItWorks.step3Badge,
            title: t.howItWorks.step3Title,
            description: t.howItWorks.step3Desc,
            image: '/assets/img/icon/cara_kerja/GenerateKelola.png',
            metaIcon: FolderArchive,
            metaText: t.howItWorks.step3Meta,
        },
    ];

    return (
        <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-[#090D16] transition-colors">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0AB600]/10 dark:bg-[#0AB600]/15 border border-[#0AB600]/25 dark:border-[#0AB600]/30 text-[#0AB600] text-xs font-semibold uppercase tracking-wider mb-4">
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
                                className="group p-6 sm:p-7 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-[#0AB600]/40 dark:hover:border-[#0AB600]/40 flex flex-col justify-between transition-all cursor-default overflow-hidden shadow-xs hover:shadow-sm"
                            >
                                <div>
                                    {/* Illustration Container with Step Badge */}
                                    <div className="relative w-full h-48 sm:h-52 rounded-2xl bg-gradient-to-b from-white to-[#0AB600]/5 dark:from-zinc-800/60 dark:to-[#0AB600]/10 border border-zinc-200/60 dark:border-zinc-800/60 p-4 mb-6 flex items-center justify-center overflow-hidden">
                                        {/* Step Number Badge */}
                                        <div className="absolute top-3 left-3 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs text-[#0AB600] border border-[#0AB600]/30 dark:border-[#0AB600]/40 text-xs font-extrabold shadow-2xs group-hover:bg-[#0AB600] group-hover:text-white dark:group-hover:bg-[#0AB600] dark:group-hover:text-white transition-all z-10">
                                            {item.step}
                                        </div>

                                        {/* Step Illustration Image */}
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="max-h-full max-w-full object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>

                                    {/* Title & Description */}
                                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2.5 group-hover:text-[#0AB600] transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Bottom Metadata */}
                                <div className="mt-6 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-medium group-hover:text-[#0AB600] transition-colors">
                                    <MetaIcon className="w-4 h-4 text-[#0AB600] shrink-0" />
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
