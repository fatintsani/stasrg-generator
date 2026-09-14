import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
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
    Globe,
    Download,
    Layers,
} from 'lucide-react';
import ExportSosmedModal from '../../Components/Admin/ExportSosmedModal';
import { SocialIcon, normalizeSocialLinks } from '../../Utils/socialPlatforms';

function ProjectDetailContent({ project, relatedProjects = [] }) {
    const { t } = useApp();
    const [copied, setCopied] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const isTrifold = project?.doc_format === 'brochure_trifold' && Array.isArray(project?.problem_solution?.panels) && project.problem_solution.panels.length > 0;
    const trifoldPanels = isTrifold ? project.problem_solution.panels : [];
    
    const [activePanelIdx, setActivePanelIdx] = useState(() => {
        if (typeof window !== 'undefined' && window.location.hash) {
            if (window.location.hash === '#kotak-2' || window.location.hash === '#panel-2') return 1;
            if (window.location.hash === '#kotak-3' || window.location.hash === '#panel-3') return 2;
        }
        return 0;
    });

    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash === '#kotak-2' || window.location.hash === '#panel-2') setActivePanelIdx(1);
            else if (window.location.hash === '#kotak-3' || window.location.hash === '#panel-3') setActivePanelIdx(2);
            else if (window.location.hash === '#kotak-1' || window.location.hash === '#panel-1') setActivePanelIdx(0);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const activePanel = isTrifold && trifoldPanels[activePanelIdx] ? trifoldPanels[activePanelIdx] : null;

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    if (!project) return null;

    const pageTitle = isTrifold && activePanel?.title
        ? `${activePanel.title} (Kotak ${activePanelIdx + 1}) - STAS RG Showcase`
        : `${project.title || project.name} - STAS RG Showcase`;
    const rawPageDesc = (isTrifold && activePanel?.description) || project.subtitle || project.description || 'Publikasi hasil riset dan inovasi teknologi terapan CoE STAS-RG Telkom University.';
    const cleanPageDesc = stripHtml(rawPageDesc);

    // Multi-partner logos resolution
    let partnerLogoUrls = [];
    if (Array.isArray(project.partner_logos) && project.partner_logos.length > 0) {
        partnerLogoUrls = project.partner_logos.filter(Boolean).map(logo => {
            if (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('blob:') || logo.startsWith('data:') || logo.startsWith('/')) {
                return logo;
            }
            return `/storage/${logo}`;
        });
    }
    if (partnerLogoUrls.length === 0) {
        const single = project.partner_logo;
        if (single) {
            partnerLogoUrls = [(single.startsWith('http') || single.startsWith('blob:') || single.startsWith('data:') || single.startsWith('/')) ? single : `/storage/${single}`];
        } else {
            partnerLogoUrls = ['/assets/img/telu.png'];
        }
    }

    const panelMainImage = isTrifold && activePanel?.image_url ? activePanel.image_url : null;
    const mainImageUrl = panelMainImage || (project.main_image 
        ? (project.main_image.startsWith('http') || project.main_image.startsWith('blob:') ? project.main_image : `/storage/${project.main_image}`)
        : null);

    const activeQrUrl = isTrifold && activePanel?.project_url ? activePanel.project_url : (project.project_url || (typeof window !== 'undefined' ? window.location.href : ''));

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

            <div className="min-h-screen flex flex-col bg-[#FAFBFD] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 selection:bg-[#0AB600]/20 selection:text-[#0AB600] font-sans antialiased transition-colors">
                {/* Public Sticky Header */}
                <Navbar />

                <main className="flex-grow pb-24">
                    {/* Top Ambient Glow */}
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#0AB600]/10 dark:bg-[#0AB600]/5 blur-[140px] rounded-full pointer-events-none" />

                    {/* 1. Breadcrumb & Back Navigation */}
                    <div className="border-b border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md sticky top-16 z-30 transition-colors">
                        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 overflow-x-auto whitespace-nowrap">
                                <Link href="/" className="hover:text-[#089600] transition-colors">
                                    Beranda
                                </Link>
                                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-zinc-300 dark:text-zinc-600" />
                                <a href="/#projects-showcase" className="hover:text-[#089600] transition-colors">
                                    Showcase Riset
                                </a>
                                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-zinc-300 dark:text-zinc-600" />
                                <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[200px] sm:max-w-xs">
                                    {project.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsExportModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0AB600]/10 hover:bg-[#0AB600]/15 dark:hover:bg-[#0AB600]/20 text-[#0AB600] border border-[#0AB600]/30 text-xs font-bold transition-all cursor-pointer shadow-xs"
                                    title="Unduh Flyer A4 atau Format Media Sosial (1:1, 9:16)"
                                >
                                    <Share2 className="w-3.5 h-3.5 text-[#0AB600]" />
                                    <span>Unduh Flyer / Sosmed</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleShare}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-all cursor-pointer"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 text-[#0AB600]" /> : <Share2 className="w-3.5 h-3.5" />}
                                    <span>{copied ? 'Tautan Disalin!' : 'Bagikan'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 2. Article Header & Hero Banner */}
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-8">
                        
                        {/* Trifold 3-Panel Switcher Banner if Trifold Format */}
                        {isTrifold && (
                            <div className="bg-white dark:bg-[#121824] p-3 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-2">
                                <div className="flex items-center justify-between px-2 text-xs">
                                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <Layers className="w-4 h-4 text-[#0AB600]" />
                                        <span>Publikasi Brosur Lipat 3 • Pilih Kotak Inovasi</span>
                                    </span>
                                    <span className="text-[11px] text-zinc-500 font-medium">
                                        Menampilkan Kotak {activePanelIdx + 1} dari 3
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {trifoldPanels.map((p, idx) => {
                                        const isCurrent = activePanelIdx === idx;
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    setActivePanelIdx(idx);
                                                    window.location.hash = `kotak-${idx + 1}`;
                                                }}
                                                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                                                    isCurrent
                                                        ? 'bg-[#0AB600] border-[#0AB600] text-white shadow-md scale-[1.01]'
                                                        : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-[#0AB600]/40 text-slate-700 dark:text-zinc-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-[10px] font-black uppercase tracking-wider ${isCurrent ? 'text-white/90' : 'text-[#0AB600]'}`}>
                                                        Kotak {idx + 1} • {idx === 0 ? 'Panel Kiri' : idx === 1 ? 'Panel Tengah' : 'Panel Kanan'}
                                                    </span>
                                                    {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                                <div className="text-xs font-bold truncate">
                                                    {p.title || (idx === 0 ? (project.title || project.name) : `Inovasi Kotak ${idx + 1}`)}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Badges Bar */}
                            <div className="flex flex-wrap items-center gap-2">
                                {(activePanel?.category || project.category) && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600] uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600] dark:bg-[#0AB600]"></span>
                                        <span>{activePanel?.category || project.category}</span>
                                    </span>
                                )}

                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                    <Calendar className="w-3 h-3" />
                                    <span>Dipublikasikan: {project.updated_at}</span>
                                </span>
                            </div>

                            {/* Main Title / Headline */}
                            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase leading-[1.15]">
                                {activePanel?.title || project.title || project.name}
                            </h1>

                            {/* Subtitle / Partner info */}
                            {(activePanel?.subtitle || project.subtitle) && (
                                <p className="text-sm sm:text-lg font-semibold text-[#0AB600] flex items-center gap-2">
                                    <Building2 className="w-4 h-4 shrink-0" />
                                    <span>{activePanel?.subtitle || project.subtitle}</span>
                                </p>
                            )}
                        </div>

                        {/* 3. Hero Visual Box / Poster Frame with Logos */}
                        <div className="relative rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md group">
                            {mainImageUrl ? (
                                <div className="w-full aspect-[16/9] sm:aspect-[16/10] max-h-[540px] bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden relative">
                                    <img
                                        src={mainImageUrl}
                                        alt={activePanel?.title || project.title || project.name}
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

                            {/* Top Right Header Overlay: STAS + Partner Logos */}
                            <div className="absolute top-3 right-3 sm:top-5 sm:right-6 z-20 pointer-events-auto">
                                <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-white/40 dark:border-zinc-700/60 shadow-xl">
                                    {/* Partner Logos */}
                                    {partnerLogoUrls.map((url, idx) => (
                                        <img
                                            key={idx}
                                            src={url}
                                            alt={`Partner Logo ${idx + 1}`}
                                            className={`h-6 sm:h-7.5 w-auto object-contain max-w-[80px] sm:max-w-[120px] ${url.includes('telu.png') ? 'dark:brightness-0 dark:invert' : ''}`}
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ))}
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
                                {(activePanel?.description || project.description) && (
                                    <div className="bg-white dark:bg-[#121824] rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 shadow-xs space-y-4">
                                        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                            <span className="p-1.5 rounded-xl bg-[#0AB600]/10 text-[#0AB600]">
                                                <FileText className="w-4 h-4" />
                                            </span>
                                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                Ringkasan Sistem &amp; Inovasi {isTrifold ? `Kotak ${activePanelIdx + 1}` : 'Riset'}
                                            </h2>
                                        </div>

                                        <div
                                            dangerouslySetInnerHTML={{ __html: activePanel?.description || project.description }}
                                            className="text-sm sm:text-base text-slate-700 dark:text-zinc-300 leading-relaxed space-y-2.5 prose dark:prose-invert max-w-none"
                                        />
                                    </div>
                                )}

                                {/* Section B: Manfaat & Dampak Terapan */}
                                {(activePanel?.benefits || (project.benefits && project.benefits.content)) && (
                                    <div className="bg-white dark:bg-[#121824] rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 shadow-xs space-y-4">
                                        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                            <span className="p-1.5 rounded-xl bg-[#0AB600]/10 text-[#0AB600]">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </span>
                                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                Manfaat &amp; Dampak Penerapan
                                            </h2>
                                        </div>

                                        <div
                                            dangerouslySetInnerHTML={{ __html: activePanel?.benefits || project.benefits.content }}
                                            className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed prose dark:prose-invert max-w-none"
                                        />
                                    </div>
                                )}

                                {/* Section C: Spesifikasi Teknologi & Hardware */}
                                {(activePanel?.specifications || (project.specifications && project.specifications.content)) && (
                                    <div className="bg-white dark:bg-[#121824] rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 shadow-xs space-y-4">
                                        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                            <span className="p-1.5 rounded-xl bg-[#0AB600]/10 text-[#0AB600]">
                                                <Wrench className="w-4 h-4" />
                                            </span>
                                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                Spesifikasi Teknologi &amp; Komponen
                                            </h2>
                                        </div>

                                        <div
                                            dangerouslySetInnerHTML={{ __html: activePanel?.specifications || project.specifications.content }}
                                            className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed prose dark:prose-invert max-w-none"
                                        />
                                    </div>
                                )}

                                {/* Section D: Problem & Solution Comparative Matrix */}
                                {((activePanel?.problem || activePanel?.solution) || (project.problem_solution && (project.problem_solution.problem || project.problem_solution.solution))) && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <span className="p-1.5 rounded-xl bg-[#0AB600]/10 text-[#0AB600]">
                                                <Lightbulb className="w-4 h-4" />
                                            </span>
                                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                Problem &amp; Solution
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Problem Card */}
                                            {(activePanel?.problem || project.problem_solution?.problem) && (
                                                <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-3">
                                                    <div className="inline-flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                                                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                                                        <span>Tantangan / Permasalahan</span>
                                                    </div>
                                                    <div
                                                        dangerouslySetInnerHTML={{ __html: activePanel?.problem || project.problem_solution.problem }}
                                                        className="text-xs sm:text-sm text-rose-950 dark:text-rose-200/90 leading-relaxed prose dark:prose-invert max-w-none"
                                                    />
                                                </div>
                                            )}

                                            {/* Solution Card */}
                                            {(activePanel?.solution || project.problem_solution?.solution) && (
                                                <div className="p-6 rounded-3xl bg-[#0AB600]/10/50 dark:bg-[#0AB600]/10 border border-[#0AB600]/30 dark:border-emerald-900/40 space-y-3">
                                                    <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0AB600] uppercase tracking-wider">
                                                        <span className="w-2 h-2 rounded-full bg-[#0AB600]" />
                                                        <span>Solusi Inovasi Teknologi</span>
                                                    </div>
                                                    <div
                                                        dangerouslySetInnerHTML={{ __html: activePanel?.solution || project.problem_solution.solution }}
                                                        className="text-xs sm:text-sm text-slate-900 dark:text-[#0AB600]/90 leading-relaxed prose dark:prose-invert max-w-none"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* RIGHT SIDEBAR: Meta, Interactive Links & QR Code (lg:col-span-4) */}
                            <div className="lg:col-span-4 space-y-6 sticky top-32">
                                
                                {/* 1. Video / URL & QR Code Card */}
                                {(activeQrUrl || project.qr_code_path) && (
                                    <div className="bg-white dark:bg-[#121824] rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-xs space-y-5 text-center">
                                        <div className="space-y-1">
                                            <div className="w-10 h-10 rounded-2xl bg-[#0AB600]/10 text-[#0AB600] flex items-center justify-center mx-auto mb-2">
                                                <QrCode className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                Akses Riset Interaktif {isTrifold ? `(Kotak ${activePanelIdx + 1})` : ''}
                                            </h3>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                Scan QR code atau klik tautan untuk demo, paper, atau materi riset kotak ini.
                                            </p>
                                        </div>

                                        {/* Render SVG / File QR Code */}
                                        <div className="w-44 h-44 mx-auto rounded-2xl p-3 bg-white border border-zinc-200 dark:border-zinc-700 shadow-inner flex items-center justify-center">
                                            {activeQrUrl ? (
                                                <QRCodeSVG value={activeQrUrl} size={152} level="M" fgColor="#0AB600" />
                                            ) : project.qr_code_path ? (
                                                <img
                                                    src={project.qr_code_path}
                                                    alt="QR Code Riset"
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : null}
                                        </div>

                                        {/* External Video / Research Button */}
                                        {activeQrUrl && (
                                            <a
                                                href={activeQrUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold shadow-md shadow-black/20 transition-all cursor-pointer"
                                            >
                                                <span>Buka Tautan / Demo Riset</span>
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
                                                <span className="font-semibold text-[#0AB600]">
                                                    {project.subtitle}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Socials */}
                                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                                        {normalizeSocialLinks(project).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                                                <SocialIcon platform={item.platform} style={{ width: '14px', height: '14px' }} className="text-[#0AB600] shrink-0" />
                                                <span className="truncate">{item.value}</span>
                                            </div>
                                        ))}
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
                                            className="group bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs hover:shadow-md hover:border-[#0AB600]/40 transition-all flex flex-col justify-between"
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
                                                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase line-clamp-1 group-hover:text-[#0AB600] dark:group-hover:text-[#0AB600] transition-colors">
                                                        {rel.title || rel.name}
                                                    </h3>
                                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                                                        {rel.subtitle || rel.name}
                                                    </p>
                                                </div>

                                                <div className="pt-2 text-[11px] font-semibold text-[#0AB600] flex items-center gap-1">
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

                {/* Multi-Format & Media Sosial Export Modal */}
                <ExportSosmedModal
                    project={project}
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                />

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
