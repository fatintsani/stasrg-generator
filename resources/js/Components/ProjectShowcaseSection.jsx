import React, { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import {
    FolderKanban,
    Eye,
    ExternalLink,
    Search,
    Calendar,
    CheckCircle2,
    Wrench,
    Lightbulb,
    QrCode,
    Globe,
    ChevronRight,
    Building2,
    Layers,
    ArrowRight
} from 'lucide-react';
import { useApp } from '../Context/AppContext';
import { stripHtml } from '../Utils/text';

export default function ProjectShowcaseSection({ projects = [] }) {
    const { t } = useApp();
    const showcaseT = t?.showcase || {};

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Extract unique categories from published projects
    const categories = useMemo(() => {
        const set = new Set();
        projects.forEach((p) => {
            if (p.category) set.add(p.category);
        });
        return ['all', ...Array.from(set)];
    }, [projects]);

    // Filter projects
    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            const matchesCategory =
                selectedCategory === 'all' ||
                (project.category && project.category.toLowerCase() === selectedCategory.toLowerCase());
            
            const matchesSearch =
                !searchQuery ||
                (project.name && project.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (project.title && project.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (project.category && project.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (project.subtitle && project.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (project.description && stripHtml(project.description).toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesCategory && matchesSearch;
        });
    }, [projects, selectedCategory, searchQuery]);

    return (
        <section id="projects-showcase" className="py-20 sm:py-28 relative overflow-hidden bg-white dark:bg-[#090F1B] border-t border-b border-zinc-200/80 dark:border-zinc-800/80">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#0AB600]/10 dark:bg-[#0AB600]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -top-10 right-10 w-72 h-72 bg-[#0AB600]/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">

                    <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                        {showcaseT.titlePart1 || 'Showcase Inovasi & Riset'} <br className="hidden sm:inline" />
                        <span className="text-[#0AB600]">
                            {showcaseT.titlePart2 || 'CoE STAS-RG'}
                        </span>
                    </h2>

                    <p className="mt-4 text-xs sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        {showcaseT.subtitle || 'Jelajahi inovasi teknologi, prototipe cerdas, dan publikasi hasil riset terapan unggulan yang dikembangkan oleh tim peneliti STAS-RG.'}
                    </p>
                </div>

                {/* Filter Controls & Search */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-zinc-200/70 dark:border-zinc-800/70">
                    
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                    selectedCategory === cat
                                        ? 'bg-[#0AB600] text-white shadow-md shadow-black/20'
                                        : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                }`}
                            >
                                {cat === 'all' ? (showcaseT.allCategories || 'Semua Kategori') : cat}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="w-full md:w-72 relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={showcaseT.searchPlaceholder || 'Cari riset atau inovasi...'}
                            className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#0AB600]"
                        />
                        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
                    </div>

                </div>

                {/* Projects Card Grid */}
                {filteredProjects.length === 0 ? (
                    <div className="rounded-3xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 p-12 text-center max-w-lg mx-auto">
                        <img
                            src="/assets/img/icon/notfound.png"
                            alt="Tidak Ditemukan"
                            className="w-28 sm:w-32 h-auto object-contain mx-auto mb-4 drop-shadow-xs"
                        />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                            {searchQuery
                                ? (showcaseT.emptySearchTitle || 'Project Tidak Ditemukan')
                                : (showcaseT.emptyStateTitle || 'Belum Ada Riset Dipublikasikan')}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                            {searchQuery
                                ? (showcaseT.emptySearchDesc
                                    ? showcaseT.emptySearchDesc.replace('{query}', searchQuery)
                                    : `Tidak ada project yang cocok dengan "${searchQuery}". Silakan coba kata kunci lain.`)
                                : (showcaseT.emptyStateDesc || 'Project riset yang telah diverifikasi dan dipublikasikan akan segera ditampilkan di sini.')}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                        {filteredProjects.map((project) => (
                            <div
                                key={project.slug || project.id}
                                className="group bg-white dark:bg-[#121824] rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#0AB600]/40 dark:hover:border-[#0AB600]/30 transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    {/* Thumbnail Banner with direct link */}
                                    <Link
                                        href={`/showcase/${project.slug}`}
                                        className="block h-52 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden border-b border-zinc-100 dark:border-zinc-800"
                                    >
                                        {project.main_image ? (
                                            <img
                                                src={project.main_image}
                                                alt={project.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                                                <FolderKanban className="w-10 h-10 mb-2 opacity-50" />
                                                <span className="text-xs font-medium">{showcaseT.prototypeFallback || 'STAS-RG Prototype'}</span>
                                            </div>
                                        )}

                                        {/* Category & Kotak Badge */}
                                        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                                            {project.category && (
                                                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/10 uppercase tracking-wider inline-flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600]"></span>
                                                    <span>{project.category}</span>
                                                </span>
                                            )}
                                            {project.problem_solution?.panel_index !== undefined && (
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#0AB600]/90 text-white backdrop-blur-md border border-white/20 uppercase tracking-wider">
                                                    Kotak {Number(project.problem_solution.panel_index) + 1}
                                                </span>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Card Body */}
                                    <div className="p-5 sm:p-6 space-y-3">
                                        {/* Partner / Subtitle */}
                                        {project.subtitle && (
                                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0AB600]">
                                                <Building2 className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{project.subtitle}</span>
                                            </div>
                                        )}

                                        {/* Project Title */}
                                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1 group-hover:text-[#0AB600] dark:group-hover:text-[#0AB600] transition-colors">
                                            <Link href={`/showcase/${project.slug}`}>
                                                {project.title || project.name}
                                            </Link>
                                        </h3>

                                        {/* Description */}
                                        {project.description && stripHtml(project.description) && (
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                                {stripHtml(project.description)}
                                            </p>
                                        )}

                                        {/* Problem / Solution Snippet Pills */}
                                        {project.problem_solution && (
                                            <div className="pt-2 flex flex-wrap gap-1.5">
                                                {project.problem_solution.problem && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[10px] font-medium">
                                                        <Lightbulb className="w-3 h-3 text-rose-500" />
                                                        <span className="truncate max-w-[200px]">{showcaseT.challengeResolved || 'Tantangan Teratasi'}</span>
                                                    </span>
                                                )}
                                                {project.benefits?.content && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0AB600]/10 text-[#0AB600] text-[10px] font-medium">
                                                        <CheckCircle2 className="w-3 h-3 text-[#0AB600]" />
                                                        <span className="truncate max-w-[200px]">{showcaseT.benefitsProven || 'Manfaat Teruji'}</span>
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Card Footer & Action Button (Detail Riset) */}
                                <div className="p-5 sm:p-6 pt-0 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                                    <Link
                                        href={`/showcase/${project.slug}`}
                                        className="inline-flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold shadow-sm shadow-black/20 transition-all cursor-pointer group/btn"
                                    >
                                        <span>{showcaseT.viewDetail || 'Lihat Detail Riset'}</span>
                                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                    </Link>

                                    {project.project_url && (
                                        <a
                                            href={project.project_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            title={showcaseT.externalLinkTitle || 'Tautan Video / Riset Eksternal'}
                                            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors shrink-0"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>
                )}

            </div>
        </section>
    );
}
