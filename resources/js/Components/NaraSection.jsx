import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Sparkles, 
    Compass, 
    FileText, 
    ArrowRight, 
    Bot, 
    Zap,
    ExternalLink
} from 'lucide-react';
import { useApp } from '../Context/AppContext';

export default function NaraSection() {
    const { language } = useApp();
    const isId = language === 'id';

    const handleOpenChat = () => {
        window.dispatchEvent(new CustomEvent('open-nara-chat'));
    };

    return (
        <section id="nara-assistant" className="scroll-mt-20 relative py-10 sm:py-20 md:py-24 px-3.5 sm:px-6 lg:px-8 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-[#090D16] transition-colors overflow-hidden">
            {/* Ambient Background Glow Effect (Subtle SaaS light) */}
            <div className="ambient-glow" style={{ filter: 'blur(64px)', WebkitFilter: 'blur(64px)' }} />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-14 items-center">
                    
                    {/* Left Column: Clean Avatar without Background or Border */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.55 }}
                        className="lg:col-span-5 flex flex-col items-center text-center"
                    >
                        <div className="group inline-block relative">
                            <motion.img
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                src="/assets/img/icon/profile_cs.png"
                                alt="NARA Assistant"
                                className="w-44 h-44 sm:w-72 sm:h-72 lg:w-[380px] lg:h-[380px] max-w-full object-contain cursor-pointer drop-shadow-md"
                                loading="lazy"
                                onClick={handleOpenChat}
                            />
                        </div>

                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight -mt-2 sm:-mt-5 lg:-mt-6">
                            NARA
                        </h3>
                        <p className="text-[11px] sm:text-xs md:text-sm font-bold text-[#0AB600] mt-0.5 sm:mt-1">
                            Navigation & Research Assistant
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1.5 sm:mt-2 max-w-xs leading-relaxed">
                            {isId 
                                ? 'Asisten virtual cerdas CoE STAS-RG Telkom University siap mendampingi Anda 24/7.'
                                : 'Intelligent virtual assistant of CoE STAS-RG Telkom University ready to assist 24/7.'}
                        </p>

                        {/* Direct Action Link to Detail Page */}
                        <Link
                            href="/nara"
                            className="mt-3 sm:mt-4 inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#0AB600] hover:text-[#099600] dark:hover:text-[#22c55e] transition-colors group"
                        >
                            <span>{isId ? 'Kenali NARA Lebih Dekat' : 'Learn More About NARA'}</span>
                            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* Right Column: Information, Capabilities & Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.55 }}
                        className="lg:col-span-7 flex flex-col justify-between"
                    >
                        <div>
                            {/* Section Tag */}
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#0AB600]/10 dark:bg-[#0AB600]/15 border border-[#0AB600]/30 text-[#0AB600] text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4">
                                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span>{isId ? 'Yuk Kenalan Sama NARA' : 'Meet NARA Assistant'}</span>
                            </div>

                            {/* Main Title */}
                            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                                {isId ? 'Navigasi Cerdas & Eksplorasi Riset Bersama NARA' : 'Smart Navigation & Research Exploration with NARA'}
                            </h2>

                            <p className="mt-2.5 sm:mt-4 text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                {isId 
                                    ? 'NARA (Navigation & Research Assistant) hadir untuk membantu Anda mencari dan mengelola informasi proyek riset terapan, memahami kapabilitas inovasi, hingga konsultasi seputar pembuatan dokumen terstandarisasi di lingkungan CoE STAS-RG Telkom University.'
                                    : 'NARA (Navigation & Research Assistant) helps you discover and navigate applied research projects, explore innovation capabilities, and consult on standardized document generation within CoE STAS-RG Telkom University.'}
                            </p>

                            {/* 3 Key Capability Pills with Staggered Entrance and Hover Effect */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5 mt-4 sm:mt-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -4 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0A121A] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-[#0AB600]/40 transition-colors shadow-xs"
                                >
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#0AB600]/10 text-[#0AB600] flex items-center justify-center mb-1.5 sm:mb-2">
                                        <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                    <h4 className="text-[11.5px] sm:text-xs font-bold text-slate-900 dark:text-white">
                                        {isId ? 'Eksplorasi Proyek' : 'Project Discovery'}
                                    </h4>
                                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-snug">
                                        {isId ? 'Temukan riset IoT, AI, Telekomunikasi & Keamanan Siber.' : 'Find IoT, AI, Telecom & Cybersecurity research.'}
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -4 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0A121A] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-[#0AB600]/40 transition-colors shadow-xs"
                                >
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#0AB600]/10 text-[#0AB600] flex items-center justify-center mb-1.5 sm:mb-2">
                                        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                    <h4 className="text-[11.5px] sm:text-xs font-bold text-slate-900 dark:text-white">
                                        {isId ? 'Panduan Dokumen' : 'Document Guidance'}
                                    </h4>
                                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-snug">
                                        {isId ? 'Standarisasi Flyer A4, Brosur Lipat 3 & QR Code Expo.' : 'Standardized A4 Flyers, Trifold Brochures & QR Codes.'}
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -4 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: 0.3 }}
                                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0A121A] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-[#0AB600]/40 transition-colors shadow-xs"
                                >
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#0AB600]/10 text-[#0AB600] flex items-center justify-center mb-1.5 sm:mb-2">
                                        <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                    <h4 className="text-[11.5px] sm:text-xs font-bold text-slate-900 dark:text-white">
                                        {isId ? 'Tanya Jawab 24/7' : '24/7 AI Grounded'}
                                    </h4>
                                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-snug">
                                        {isId ? 'Didukung Gemini AI dengan data riset terverifikasi.' : 'Powered by Gemini AI with verified research data.'}
                                    </p>
                                </motion.div>
                            </div>
                        </div>

                        {/* Action CTA Buttons */}
                        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5">
                            <motion.button
                                type="button"
                                whileTap={{ scale: 0.96 }}
                                whileHover={{ scale: 1.02 }}
                                onClick={handleOpenChat}
                                className="px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#0AB600] hover:bg-[#099600] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-[#0AB600]/20"
                            >
                                <Bot className="w-4 h-4" />
                                <span>{isId ? 'Tanya NARA Sekarang' : 'Ask NARA Now'}</span>
                            </motion.button>

                            <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
                                <Link
                                    href="/nara"
                                    className="w-full px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <span>{isId ? 'Kenali Lebih Dekat dengan NARA' : 'Learn More About NARA'}</span>
                                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400" />
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

