import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../Context/AppContext';

export default function InternalNoteBanner() {
    const { t } = useApp();

    return (
        <section id="login" className="scroll-mt-20 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-[#FAFAFA] dark:bg-[#090D16] transition-colors relative overflow-hidden">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -3 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    className="relative rounded-3xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-[#0AB600]/40 dark:hover:border-[#0AB600]/40 p-8 sm:p-12 lg:p-14 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                    {/* Ambient Glows */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0AB600]/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#0AB600]/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
                        {/* Left Content */}
                        <div className="md:col-span-7 text-left">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0AB600]/10 dark:bg-[#0AB600]/20 border border-[#0AB600]/25 text-[#0AB600] text-xs font-semibold tracking-wide mb-5">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#0AB600]" />
                                <span>CoE STAS-RG SSO</span>
                            </div>

                            <h2 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
                                {t.internal.ctaTitle}
                            </h2>

                            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed mb-8 max-w-lg font-normal">
                                {t.internal.ctaDesc}
                            </p>

                            <div className="flex flex-wrap items-center gap-4">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center gap-2 bg-[#0AB600] hover:bg-[#089600] text-white text-sm sm:text-base font-semibold px-7 py-3.5 rounded-full border border-[#0AB600] transition-all duration-200 cursor-pointer shadow-md shadow-[#0AB600]/25 hover:shadow-lg hover:shadow-[#0AB600]/35 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <span>{t.internal.ctaButton}</span>
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                </Link>

                                <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#0AB600]" />
                                    <span>{t.internal.ctaAuth}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Illustration */}
                        <div className="md:col-span-5 flex items-center justify-center">
                            <div className="relative w-full max-w-[280px] sm:max-w-[340px] aspect-square flex items-center justify-center">
                                <div className="absolute inset-4 bg-gradient-to-tr from-[#0AB600]/15 to-transparent rounded-full blur-2xl pointer-events-none" />
                                <img
                                    src="/assets/img/icon/siap_memulai/SiapMemulai.png"
                                    alt={t.internal.ctaTitle}
                                    className="relative z-10 w-full h-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
