import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { LogIn, ShieldCheck } from 'lucide-react';
import { useApp } from '../Context/AppContext';

export default function InternalNoteBanner() {
    const { t } = useApp();

    return (
        <section id="login" className="scroll-mt-20 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-[#FAFAFA] dark:bg-[#090D16] transition-colors">
            <div className="max-w-4xl mx-auto">
                {/* Ready to Get Started? Contemporary SaaS CTA Card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -3 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    className="p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-white to-emerald-50/40 dark:from-zinc-900 dark:to-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/50 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all text-center relative overflow-hidden"
                >
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold tracking-wide mb-5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span>CoE STAS-RG SSO</span>
                    </div>

                    <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                        {t.internal.ctaTitle}
                    </h3>

                    <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto mb-8 font-normal">
                        {t.internal.ctaDesc}
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center gap-2 bg-[#0D5A34] hover:bg-[#094226] text-white text-base font-semibold px-8 py-3.5 rounded-full border border-[#0D5A34] transition-all duration-200 cursor-pointer"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>{t.internal.ctaButton}</span>
                        </Link>

                        <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{t.internal.ctaAuth}</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
