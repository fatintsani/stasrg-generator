import React from 'react';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Scale, FileCheck, Award, Layers, RefreshCw } from 'lucide-react';
import { AppProvider, useApp } from '../Context/AppContext';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

function TermsContent() {
    const { t } = useApp();
    const tp = t.termsPage;

    const sectionIcons = [FileCheck, Award, Scale, Layers, RefreshCw];

    return (
        <div className="min-h-screen bg-white dark:bg-[#090D16] text-slate-900 dark:text-zinc-100 flex flex-col transition-colors selection:bg-[#0D5A34] selection:text-white">
            <Head title={`${tp.title} — STAS RG Generator`} />

            <Navbar />

            <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-12 pb-8 border-b border-zinc-200/60 dark:border-zinc-800/60"
                >
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-5">
                        <Scale className="w-3.5 h-3.5" />
                        <span>{tp.tag}</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
                        {tp.title}
                    </h1>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-5">
                        {tp.lastUpdated}
                    </p>

                    <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl font-normal">
                        {tp.lead}
                    </p>
                </motion.div>

                {/* Terms Sections */}
                <div className="space-y-6 mb-16">
                    {tp.sections.map((section, idx) => {
                        const Icon = sectionIcons[idx] || Scale;
                        return (
                            <motion.article
                                key={idx}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: idx * 0.08 }}
                                whileHover={{ y: -3 }}
                                className="p-7 sm:p-8 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-emerald-300/80 dark:hover:border-emerald-700/80 transition-all"
                            >
                                <div className="flex items-start gap-5">
                                    <div className="p-3 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 shrink-0">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-2.5 flex-1">
                                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                            {section.title}
                                        </h2>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                                            {section.content}
                                        </p>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function Terms() {
    return (
        <AppProvider>
            <TermsContent />
        </AppProvider>
    );
}
