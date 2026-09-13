import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { AppProvider, useApp } from '../../Context/AppContext';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { stripHtml } from '../../Utils/text';
import {
    ArrowLeft,
    FileText,
    Calendar,
    FolderKanban,
    Building2,
    CheckCircle2,
    Wrench,
    Lightbulb,
    ExternalLink,
    QrCode,
    Share2,
    Check,
    Tag,
    Clock,
    ChevronRight,
    Globe
} from 'lucide-react';

function InstagramIcon({ className = "w-4 h-4" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
    );
}

function YoutubeIcon({ className = "w-4 h-4" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
            <polygon points="10 15 15 12 10 9 10 15"/>
        </svg>
    );
}

function ProjectDetailContent({ project, relatedProjects = [] }) {
    const { t } = useApp();
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    if (!project) return null;

    const pageTitle = `${project.title || project.name} - STAS RG Showcase`;
    const rawPageDesc = project.subtitle || project.description || 'Publikasi hasil riset dan inovasi teknologi terapan CoE STAS-RG Telkom University.';
    const cleanPageDesc = stripHtml(rawPageDesc);

    const partnerLogoUrl = project.partner_logo 
        ? (project.partner_logo.startsWith('http') || project.partner_logo.startsWith('blob:') ? project.partner_logo : `/storage/${project.partner_logo}`)
        : '/assets/img/telu.png';

    const mainImageUrl = project.main_image 
        ? (project.main_image.startsWith('http') || project.main_image.startsWith('blob:') ? project.main_image : `/storage/${project.main_image}`)
        : null;

    return (
        <>
            <Head title={pageTitle}>
                <meta name="description" content={cleanPageDesc.slice(0, 160)} />
                <meta property="og:title" content={`${project.title || project.name} — STAS RG Showcase`} />
                <meta property="og:description" content={cleanPageDesc.slice(0, 200)} />
                <meta property="og:image" content={mainImageUrl || '/assets/img/stas.png'} />
                <meta property="og:type" content="article" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${project.title || project.name} — STAS RG Showcase`} />
                <meta name="twitter:description" content={cleanPageDesc.slice(0, 200)} />
                <meta name="twitter:image" content={mainImageUrl || '/assets/img/stas.png'} />
            </Head>

            <div className="min-h-screen flex flex-col bg-[#FAFBFD] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 selection:bg-emerald-100 selection:text-emerald-900 font-sans antialiased transition-colors">
                {/* Public Sticky Header */}
                <Navbar />

                <main className="flex-grow pb-24">
                    {/* Top Ambient Glow */}
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none" />

                    {/* 1. Breadcrumb & Back Navigation */}
                    <div className="border-b border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md sticky top-16 z-30 transition-colors">
                        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 overflow-x-auto whitespace-nowrap">
                                <Link href="/" className="hover:text-emerald-600 transition-colors">
                                    Beranda
                                </Link>
                                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-zinc-300 dark:text-zinc-600" />
                                <a href="/#projects-showcase" className="hover:text-emerald-600 transition-colors">
                                    Showcase Riset
                                </a>
                                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-zinc-300 dark:text-zinc-600" />
                                <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[200px] sm:max-w-xs">
                                    {project.name}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleShare}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-all cursor-pointer shrink-0"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                                <span>{copied ? 'Tautan Disalin!' : 'Bagikan'}</span>
                            </button>
                        </div>
                    </div>

                    {/* 2. Article Header & Hero Banner */}
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-8">
                        
                        <div className="space-y-4">
                            {/* Badges Bar */}
                            <div className="flex flex-wrap items-center gap-2">
                                {project.category && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-[#0D5A34] dark:text-emerald-300 uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                                        <span>{project.category}</span>
                                    </span>
                                )}

                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                    <Calendar className="w-3 h-3" />
                                    <span>Dipublikasikan: {project.updated_at}</span>
                                </span>
                            </div>

                            {/* Main Title / Headline */}
                            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase leading-[1.15]">
                                {project.title || project.name}
                            </h1>

                            {/* Subtitle / Partner info */}
                            {project.subtitle && (
                                <p className="text-sm sm:text-lg font-semibold text-[#0D5A34] dark:text-emerald-400 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 shrink-0" />
                                    <span>{project.subtitle}</span>
                                </p>
                            )}
                        </div>

                        {/* 3. Hero Visual Box / Poster Frame with Logos */}
                        <div className="relative rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md group">
                            {mainImageUrl ? (
                                <div className="w-full aspect-[16/9] sm:aspect-[16/10] max-h-[540px] bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden relative">
                                    <img
                                        src={mainImageUrl}
                                        alt={project.title || project.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Subtle gradient overlay at top for logo contrast */}
                                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 via-black/15 to-transparent pointer-events-none" />
                                </div>
                            ) : (
                                <div className="py-24 text-center space-y-3 bg-zinc-100 dark:bg-zinc-900">
                                    <FolderKanban className="w-12 h-12 text-zinc-400 mx-auto opacity-40" />
                                    <p className="text-sm font-medium text-zinc-500">Foto Prototype / Diagram Sistem</p>
                                </div>
                            )}

                            {/* Top Right Header Overlay: STAS + Partner Logos Only */}
                            <div className="absolute top-3 right-3 sm:top-5 sm:right-6 z-20 pointer-events-auto">
                                <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-white/40 dark:border-zinc-700/60 shadow-xl">
                                    {/* Partner Logo */}
                                    <img
                                        src={partnerLogoUrl}
                                        alt="Partner Logo"
                                        className="h-6 sm:h-7.5 w-auto object-contain max-w-[80px] sm:max-w-[120px]"
                                        onError={(e) => {
                                            if (e.currentTarget.src !== window.location.origin + '/assets/img/telu.png') {
                                                e.currentTarget.src = '/assets/img/telu.png';
                                            }
                                        }}
                                    />
                                    <div className="h-4 sm:h-5 w-px bg-zinc-200 dark:bg-zinc-700" />
                                    {/* STAS RG Logo */}
                                    <img
                                        src="/assets/img/stas.png"
                                        alt="CoE STAS-RG"
                                        className="h-6 sm:h-7.5 w-auto object-contain"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 4. Main Research Content Layout (Split 8 cols / 4 cols) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
                            
                            {/* LEFT ARTICLE BODY (lg:col-span-8) */}
                            <div className="lg:col-span-8 space-y-8">
                                
                                {/* Section A: Deskripsi Singkat Sistem */}
                                {project.description && (
                                    <div className="bg-white dark:bg-[#121824] rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 shadow-xs space-y-4">
                                        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                            <span className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400">
                                                <FileText className="w-4 h-4" />
                                            </span>
                                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                Ringkasan Sistem & Inovasi Riset
                                            </h2>
                                        </div>

                                        <div
                                            dangerouslySetInnerHTML={{ __html: project.description }}
                                            className="text-sm sm:text-base text-slate-700 dark:text-zinc-300 leading-relaxed space-y-2.5 prose dark:prose-invert max-w-none"
                                        />
                                    </div>
                                )}

                                {/* Section B: Problem & Solution Comparative Matrix */}
                                {project.problem_solution && (project.problem_solution.problem || project.problem_solution.solution) && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <span className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400">
                                                <Lightbulb className="w-4 h-4" />
                                            </span>
                                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                Problem & Solution
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Problem Card */}
                                            {project.problem_solution.problem && (
                                                <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-3">
                                                    <div className="inline-flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                                                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                                                        <span>Tantangan / Permasalahan</span>
                                                    </div>
                                                    <div
                                                        dangerouslySetInnerHTML={{ __html: project.problem_solution.problem }}
                                                        className="text-xs sm:text-sm text-rose-950 dark:text-rose-200/90 leading-relaxed prose dark:prose-invert max-w-none"
                                                    />
                                                </div>
                                            )}

                                            {/* Solution Card */}
                                            {project.problem_solution.solution && (
                                                <div className="p-6 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-3">
                                                    <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0D5A34] dark:text-emerald-300 uppercase tracking-wider">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                        <span>Solusi Inovasi Teknologi</span>
                                                    </div>
                                                    <div
                                                        dangerouslySetInnerHTML={{ __html: project.problem_solution.solution }}
                                                        className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-200/90 leading-relaxed prose dark:prose-invert max-w-none"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Section C: Manfaat & Dampak Terapan */}
                                {project.benefits && project.benefits.content && (
                                    <div className="bg-white dark:bg-[#121824] rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 shadow-xs space-y-4">
                                        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                            <span className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </span>
                                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                {project.benefits.title || 'Manfaat & Dampak Penerapan'}
                                            </h2>
                                        </div>

                                        <div
                                            dangerouslySetInnerHTML={{ __html: project.benefits.content }}
                                            className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed prose dark:prose-invert max-w-none"
                                        />
                                    </div>
                                )}

                                {/* Section D: Spesifikasi Teknologi & Hardware */}
                                {project.specifications && project.specifications.content && (
                                    <div className="bg-white dark:bg-[#121824] rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 shadow-xs space-y-4">
                                        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                            <span className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400">
                                                <Wrench className="w-4 h-4" />
                                            </span>
                                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                {project.specifications.title || 'Spesifikasi Teknologi & Komponen'}
                                            </h2>
                                        </div>

                                        <div
                                            dangerouslySetInnerHTML={{ __html: project.specifications.content }}
                                            className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed prose dark:prose-invert max-w-none"
                                        />
                                    </div>
                                )}

                            </div>

                            {/* RIGHT SIDEBAR: Meta, Interactive Links & QR Code (lg:col-span-4) */}
                            <div className="lg:col-span-4 space-y-6 sticky top-32">
                                
                                {/* 1. Video / URL & QR Code Card */}
                                {(project.project_url || project.qr_code_path) && (
                                    <div className="bg-white dark:bg-[#121824] rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-xs space-y-5 text-center">
                                        <div className="space-y-1">
                                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0D5A34] dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                                                <QrCode className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                Akses Riset Interaktif
                                            </h3>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                Scan QR code atau klik tautan untuk menyaksikan video demonstrasi prototype.
                                            </p>
                                        </div>

                                        {/* Render QR Code */}
                                        {project.qr_code_path && (
                                            <div className="w-40 h-40 mx-auto rounded-2xl p-2.5 bg-white border border-zinc-200 dark:border-zinc-700 shadow-inner flex items-center justify-center">
                                                <img
                                                    src={project.qr_code_path}
                                                    alt="QR Code Riset"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        )}

                                        {/* External Video / Research Button */}
                                        {project.project_url && (
                                            <a
                                                href={project.project_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl bg-[#0D5A34] hover:bg-[#094226] text-white text-xs font-bold shadow-md shadow-emerald-900/10 transition-all cursor-pointer"
                                            >
                                                <span>Kunjungi Video / Tautan Riset</span>
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>
                                )}



                                {/* 3. Institutional Information Card */}
                                <div className="bg-white dark:bg-[#121824] rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-xs space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                        Informasi Publikasi Riset
                                    </h3>

                                    <div className="space-y-3 text-xs">
                                        <div>
                                            <span className="text-zinc-400 block text-[11px]">Lembaga Riset:</span>
                                            <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                                Center of Excellence STAS-RG
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-zinc-400 block text-[11px]">Institusi:</span>
                                            <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                                Telkom University
                                            </span>
                                        </div>

                                        {project.subtitle && (
                                            <div>
                                                <span className="text-zinc-400 block text-[11px]">Mitra Kolaborasi:</span>
                                                <span className="font-semibold text-[#0D5A34] dark:text-emerald-400">
                                                    {project.subtitle}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Socials */}
                                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                                        {project.footer_instagram && (
                                            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                                                <InstagramIcon className="w-3.5 h-3.5 text-zinc-400" />
                                                <span>{project.footer_instagram}</span>
                                            </div>
                                        )}
                                        {project.footer_website && (
                                            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                                                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                                                <span>{project.footer_website}</span>
                                            </div>
                                        )}
                                        {project.footer_youtube && (
                                            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                                                <YoutubeIcon className="w-3.5 h-3.5 text-zinc-400" />
                                                <span>{project.footer_youtube}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 3. Back to Showcase CTA */}
                                <a
                                    href="/#projects-showcase"
                                    className="inline-flex items-center justify-center gap-2 w-full p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-colors text-center"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Kembali ke Showcase Riset</span>
                                </a>

                            </div>

                        </div>

                        {/* 5. Related Projects Section */}
                        {relatedProjects.length > 0 && (
                            <div className="pt-16 sm:pt-20 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-6">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                        Riset Terkait Lainnya
                                    </h2>
                                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                        Jelajahi inovasi teknologi dan prototipe terapan lainnya dari STAS-RG.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                    {relatedProjects.map((rel) => (
                                        <Link
                                            key={rel.slug}
                                            href={`/showcase/${rel.slug}`}
                                            className="group bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                                        >
                                            <div className="h-36 bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
                                                {rel.main_image ? (
                                                    <img
                                                        src={rel.main_image}
                                                        alt={rel.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                        <FolderKanban className="w-6 h-6 opacity-40" />
                                                    </div>
                                                )}
                                                {rel.category && (
                                                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-black/60 text-white backdrop-blur-md">
                                                        {rel.category}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase line-clamp-1 group-hover:text-[#0D5A34] dark:group-hover:text-emerald-400 transition-colors">
                                                        {rel.title || rel.name}
                                                    </h3>
                                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                                                        {rel.subtitle || rel.name}
                                                    </p>
                                                </div>

                                                <div className="pt-2 text-[11px] font-semibold text-[#0D5A34] dark:text-emerald-400 flex items-center gap-1">
                                                    <span>Baca Selengkapnya</span>
                                                    <ArrowRightIcon className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </main>



                {/* Footer */}
                <Footer />
            </div>
        </>
    );
}

function ArrowRightIcon({ className = "w-3 h-3" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14"/>
            <path d="m12 5 7 7-7 7"/>
        </svg>
    );
}

export default function ProjectDetail({ project, relatedProjects = [] }) {
    return (
        <AppProvider>
            <ProjectDetailContent project={project} relatedProjects={relatedProjects} />
        </AppProvider>
    );
}
