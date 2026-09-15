import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../Context/AppContext';

export default function InternalNoteBanner() {
    const { t } = useApp();

    return (
        <section id="login" className="scroll-mt-20 py-10 sm:py-20 md:py-28 px-3.5 sm:px-6 lg:px-8 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-[#FAFAFA] dark:bg-[#090D16] transition-colors relative overflow-hidden">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -3 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    className="relative rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-[#0AB600]/40 dark:hover:border-[#0AB600]/40 p-5 sm:p-10 lg:p-14 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                    {/* Ambient Glows */}
                    <div className="absolute -top-24 -right-24 w-64 sm:w-96 h-64 sm:h-96 bg-[#0AB600]/10 rounded-full blur-3xl pointer-events-none" style={{ filter: 'blur(64px)', WebkitFilter: 'blur(64px)' }} />
                    <div className="absolute -bottom-24 -left-24 w-48 sm:w-72 h-48 sm:h-72 bg-[#0AB600]/5 rounded-full blur-3xl pointer-events-none" style={{ filter: 'blur(64px)', WebkitFilter: 'blur(64px)' }} />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
                        {/* Left Content */}
                        <div className="md:col-span-7 text-left">
                            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#0AB600]/10 dark:bg-[#0AB600]/20 border border-[#0AB600]/25 text-[#0AB600] text-[10px] sm:text-xs font-semibold tracking-wide mb-3 sm:mb-5">
                                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0AB600]" />
                                <span>CoE STAS-RG SSO</span>
                            </div>

                            <h2 className="text-xl sm:text-3xl lg:text-[2.6rem] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-2.5 sm:mb-4">
                                {t.internal.ctaTitle}
                            </h2>

                            <p className="text-xs sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed mb-5 sm:mb-8 max-w-lg font-normal">
                                {t.internal.ctaDesc}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-[#0AB600] hover:bg-[#089600] text-white text-xs sm:text-base font-semibold px-4 py-2.5 sm:px-7 sm:py-3.5 rounded-xl sm:rounded-full border border-[#0AB600] transition-all duration-200 cursor-pointer shadow-md shadow-[#0AB600]/25 hover:shadow-lg hover:shadow-[#0AB600]/35 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <span>{t.internal.ctaButton}</span>
                                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5" />
                                </Link>

                                <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#0AB600]" />
                                    <span>{t.internal.ctaAuth}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Illustration */}
                        <div className="md:col-span-5 flex items-center justify-center">
                            <div className="relative w-full max-w-[180px] sm:max-w-[280px] sm:max-w-[340px] aspect-square flex items-center justify-center">
                                <div className="absolute inset-2 sm:inset-4 bg-gradient-to-tr from-[#0AB600]/15 to-transparent rounded-full blur-2xl pointer-events-none" />
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
