import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    FolderKanban,
    FileCheck2,
    FileEdit,
    ShieldCheck,
    Plus,
    ArrowUpRight,
    Search,
    Eye,
    Edit3,
    Download,
    ExternalLink,
    ChevronRight,
    Layers,
    Calendar,
    QrCode,
    Building2,
    CheckCircle2,
    Clock,
    TrendingUp,
    Globe,
    SlidersHorizontal,
    FileText,
    Copy,
    Trash2,
    X,
    Fingerprint,
    Share2,
    Tag,
    Printer,
    Image as ImageIcon,
    Loader2,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    RotateCcw,
    Filter,
} from 'lucide-react';
import { useApp } from '../../Context/AppContext';
import { useAlert } from '../../Context/AlertContext';
import AdminLayout from '../../Layouts/AdminLayout';
import ProjectPreview from '../../Components/Admin/ProjectPreview';
import { stripHtml } from '../../Utils/text';
import { downloadFlyerAsPng, printFlyer } from '../../Utils/flyerExport';

export default function Dashboard({ auth, stats, category_distribution = [], recent_projects = [] }) {
    const { t, language } = useApp();
    const { showConfirm } = useAlert();

    const d = t?.admin?.dashboard || {};

    const user = auth?.user || { name: 'Administrator', email: 'admin@stasrg.internal', role: 'admin' };

    const [projectSearch, setProjectSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortField, setSortField] = useState('updated_at');
    const [sortDirection, setSortDirection] = useState('desc');
    const [previewModalProject, setPreviewModalProject] = useState(null);
    const [modalPngLoading, setModalPngLoading] = useState(false);

    // Extract dynamic categories from recent_projects + category_distribution
    const availableCategories = useMemo(() => {
        const fromDist = category_distribution.map((c) => c.category).filter(Boolean);
        const fromProjects = recent_projects.map((p) => p.category).filter(Boolean);
        return Array.from(new Set([...fromDist, ...fromProjects]));
    }, [category_distribution, recent_projects]);

    const handleModalDownloadPng = async () => {
        if (!previewModalProject || modalPngLoading) return;
        setModalPngLoading(true);
        try {
            const canvasId = `flyer-canvas-${previewModalProject.slug || previewModalProject.id}`;
            const filename = `${previewModalProject.name.replace(/\s+/g, '_').toLowerCase()}_flyer_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.png`;
            await downloadFlyerAsPng(canvasId, filename);
        } catch (error) {
            console.error('Modal PNG export error:', error);
        } finally {
            setModalPngLoading(false);
        }
    };

    const handleModalPrint = () => {
        if (!previewModalProject) return;
        const canvasId = `flyer-canvas-${previewModalProject.slug || previewModalProject.id}`;
        printFlyer(canvasId, `Flyer - ${previewModalProject.title || previewModalProject.name}`);
    };

    // Current Date formatted nicely
    const currentDateFormatted = useMemo(() => {
        const date = new Date();
        return date.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }, [language]);

    // Filter & Sort recent projects locally
    const filteredAndSortedProjects = useMemo(() => {
        const filtered = recent_projects.filter((p) => {
            const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
            const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
            const matchesSearch =
                !projectSearch ||
                (p.name && p.name.toLowerCase().includes(projectSearch.toLowerCase())) ||
                (p.title && p.title.toLowerCase().includes(projectSearch.toLowerCase())) ||
                (p.category && p.category.toLowerCase().includes(projectSearch.toLowerCase())) ||
                (p.subtitle && p.subtitle.toLowerCase().includes(projectSearch.toLowerCase())) ||
                (p.description && stripHtml(p.description).toLowerCase().includes(projectSearch.toLowerCase()));

            return matchesStatus && matchesCategory && matchesSearch;
        });

        return filtered.sort((a, b) => {
            let fieldA = a[sortField] || '';
            let fieldB = b[sortField] || '';

            if (typeof fieldA === 'string') fieldA = fieldA.toLowerCase();
            if (typeof fieldB === 'string') fieldB = fieldB.toLowerCase();

            if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
            if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [recent_projects, statusFilter, categoryFilter, projectSearch, sortField, sortDirection]);

    const handleSortColumn = (field) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection(field === 'updated_at' || field === 'created_at' ? 'desc' : 'asc');
        }
    };

    const handleResetFilters = () => {
        setProjectSearch('');
        setStatusFilter('all');
        setCategoryFilter('all');
        setSortField('updated_at');
        setSortDirection('desc');
    };

    const isFilterActive = Boolean(
        projectSearch ||
        statusFilter !== 'all' ||
        categoryFilter !== 'all' ||
        sortField !== 'updated_at' ||
        sortDirection !== 'desc'
    );

    const handleDuplicate = async (slug, name) => {
        const title = d.duplicateTitle || 'Duplikasi Project?';
        const message = (d.duplicateMsg || 'Apakah Anda ingin membuat salinan dari project "{name}"? Salinan baru akan dibuat dengan status Draft.').replace('{name}', name);
        const confirmText = d.duplicateConfirm || 'Duplikasi Project';
        const cancelText = d.duplicateCancel || 'Batal';

        const confirmed = await showConfirm({
            title,
            message,
            confirmText,
            cancelText,
            variant: 'primary',
        });
        if (confirmed) {
            router.post(`/projects/${slug}/duplicate`);
        }
    };

    return (
        <AdminLayout title={d.pageTitle || 'Dashboard'} currentPath="/dashboard">
            <div className="space-y-6 sm:space-y-8">
                
                {/* 1. Header Banner & Greeting */}
                <div className="rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
                    {/* Subtle Background Radial Gradients */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#0AB600]/10 via-[#0AB600]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1.5 max-w-2xl">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-xs text-zinc-400 font-medium">
                                    {currentDateFormatted}
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {(d.welcome || 'Selamat Datang, {name}').replace('{name}', user.name)}
                            </h1>
                            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                {d.subtitle || 'Kelola seluruh lembar informasi riset, flyer publikasi berstandar resmi A4, dan terbitkan inovasi teknologi ke showcase publik landing page.'}
                            </p>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <a
                                href="/#projects-showcase"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
                            >
                                <Globe className="w-4 h-4 text-[#0AB600]" />
                                <span>{d.viewShowcase || 'Lihat Showcase'}</span>
                            </a>

                            <Link
                                href="/projects/create"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs sm:text-sm font-semibold shadow-md shadow-black/20 hover:shadow-lg transition-all cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{d.newProject || 'Buat Project Baru'}</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. Key Metrics & Analytics Grid (6 Cards) */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 sm:gap-4">
                    {/* Stat 1: Total Projects */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-[#0AB600]/40 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                {d.statTotalTitle || 'Total Riset'}
                            </span>
                            <div className="w-7 h-7 rounded-lg bg-[#0AB600]/10 text-[#0AB600] flex items-center justify-center">
                                <FolderKanban className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {stats?.total_projects ?? 0}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1 font-medium">
                            <TrendingUp className="w-3 h-3 text-[#0AB600]" />
                            <span>{(d.statTotalSub || '+{count} bulan ini').replace('{count}', stats?.monthly_created_count ?? 0)}</span>
                        </div>
                    </div>

                    {/* Stat 2: Published to Landing */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-[#0AB600]/40 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                {d.statLandingTitle || 'Di Landing'}
                            </span>
                            <div className="w-7 h-7 rounded-lg bg-[#0AB600]/10 text-[#0AB600] flex items-center justify-center">
                                <Globe className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-[#0AB600] tracking-tight">
                            {stats?.published_projects ?? 0}
                        </div>
                        <div className="text-[10px] text-[#0AB600] mt-1 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600] animate-pulse" />
                            <span>{d.statLandingSub || 'Publik & Live'}</span>
                        </div>
                    </div>

                    {/* Stat 3: Draft Projects */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-amber-500/40 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                {d.statDraftTitle || 'Draft Internal'}
                            </span>
                            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <FileEdit className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {stats?.draft_projects ?? 0}
                        </div>
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                            {d.statDraftSub || 'Dalam pengerjaan'}
                        </div>
                    </div>

                    {/* Stat 4: Categories Count */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-blue-500/40 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                {d.statCategoriesTitle || 'Klaster Riset'}
                            </span>
                            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Tag className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {stats?.categories_count ?? 0}
                        </div>
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 font-medium">
                            {d.statCategoriesSub || 'Domain inovasi'}
                        </div>
                    </div>

                    {/* Stat 5: QR Code Linked */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-indigo-500/40 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                {d.statQrTitle || 'QR Terhubung'}
                            </span>
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <QrCode className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {stats?.qr_linked_count ?? 0}
                        </div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                            {d.statQrSub || 'Video & Tautan Aktif'}
                        </div>
                    </div>

                    {/* Stat 6: Partner Collaborations */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-purple-500/40 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                {d.statPartnerTitle || 'Mitra Kustom'}
                            </span>
                            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <Building2 className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {stats?.partner_projects_count ?? 0}
                        </div>
                        <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 font-medium">
                            {d.statPartnerSub || 'Logo Kemitraan'}
                        </div>
                    </div>
                </div>

                {/* 3. Main Dashboard Layout (Split 8 cols / 4 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-start">
                    
                    {/* LEFT COLUMN: Recent Projects Management & Table (lg:col-span-8) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Project Table Card */}
                        <div className="bg-white dark:bg-[#121824] rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs">
                            
                            {/* Card Header & Filters */}
                            <div className="p-5 sm:p-6 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                                        {d.recentProjectsTitle || 'Project Riset & Flyer Terbaru'}
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                        {d.recentProjectsSubtitle || 'Daftar dokumen flyer inovasi visual yang siap diedit dan diekspor ke format PDF.'}
                                    </p>
                                </div>

                                <Link
                                    href="/projects"
                                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0AB600] hover:underline shrink-0"
                                >
                                    <span>{(d.viewAll || 'Lihat Semua ({count})').replace('{count}', stats?.total_projects ?? 0)}</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {/* Toolbar: Filters, Category, Search & Sort (1 Jajar) */}
                            <div className="p-4 bg-zinc-50/70 dark:bg-zinc-900/40 border-b border-zinc-200/70 dark:border-zinc-800/70 space-y-3">
                                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 overflow-x-auto pb-0.5">
                                    
                                    {/* Status Filter Tabs */}
                                    <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 shrink-0">
                                        {[
                                            { key: 'all', label: d.tabAll || 'Semua' },
                                            { key: 'published', label: d.tabPublished || 'Published' },
                                            { key: 'draft', label: d.tabDraft || 'Draft' },
                                        ].map((tab) => (
                                            <button
                                                key={tab.key}
                                                type="button"
                                                onClick={() => setStatusFilter(tab.key)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                                    statusFilter === tab.key
                                                        ? 'bg-[#0AB600] text-white shadow-xs font-bold'
                                                        : 'text-zinc-600 dark:text-zinc-300 hover:text-slate-900'
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Category, Sort, Search & Reset Controls in 1 Row */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* Category Filter */}
                                        {availableCategories.length > 0 && (
                                            <select
                                                value={categoryFilter}
                                                onChange={(e) => setCategoryFilter(e.target.value)}
                                                className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#0AB600] cursor-pointer shrink-0"
                                            >
                                                <option value="all">Semua Kategori</option>
                                                {availableCategories.map((cat) => (
                                                    <option key={cat} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        {/* Sort Dropdown */}
                                        <select
                                            value={`${sortField}:${sortDirection}`}
                                            onChange={(e) => {
                                                const [f, dir] = e.target.value.split(':');
                                                setSortField(f);
                                                setSortDirection(dir);
                                            }}
                                            className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#0AB600] cursor-pointer shrink-0"
                                        >
                                            <option value="updated_at:desc">Terbaru Diperbarui</option>
                                            <option value="updated_at:asc">Terlama Diperbarui</option>
                                            <option value="name:asc">Nama (A &rarr; Z)</option>
                                            <option value="name:desc">Nama (Z &rarr; A)</option>
                                            <option value="category:asc">Kategori (A &rarr; Z)</option>
                                            <option value="status:asc">Status</option>
                                        </select>

                                        {/* Local Search Input */}
                                        <div className="relative w-48 sm:w-56 shrink-0">
                                            <input
                                                type="text"
                                                value={projectSearch}
                                                onChange={(e) => setProjectSearch(e.target.value)}
                                                placeholder={d.searchPlaceholder || 'Cari riset, headline...'}
                                                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#0AB600]"
                                            />
                                            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5 pointer-events-none" />
                                            {projectSearch && (
                                                <button
                                                    type="button"
                                                    onClick={() => setProjectSearch('')}
                                                    className="p-1 rounded-md text-zinc-400 hover:text-slate-900 dark:hover:text-white absolute right-1.5 top-1.5 transition-colors cursor-pointer"
                                                    title="Hapus pencarian"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Reset Button */}
                                        {isFilterActive && (
                                            <button
                                                type="button"
                                                onClick={handleResetFilters}
                                                title="Reset Semua Filter"
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer shrink-0"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                                <span>Reset</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Active Counter & Filter Status */}
                                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
                                    <div className="flex items-center gap-2">
                                        <span>
                                            Menampilkan <strong className="text-slate-900 dark:text-white">{filteredAndSortedProjects.length}</strong> dari <strong className="text-[#0AB600]">{recent_projects.length}</strong> proyek riset
                                        </span>
                                        {isFilterActive && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0AB600]/10 text-[#0AB600] font-bold border border-[#0AB600]/30">
                                                <Filter className="w-2.5 h-2.5" />
                                                Filter Aktif
                                            </span>
                                        )}
                                    </div>

                                    <span className="text-zinc-400">
                                        Sort: <strong className="text-slate-700 dark:text-zinc-300">{sortField === 'name' ? 'Nama' : sortField === 'category' ? 'Kategori' : sortField === 'status' ? 'Status' : 'Pembaruan'} ({sortDirection.toUpperCase()})</strong>
                                    </span>
                                </div>
                            </div>

                            {/* Table Content */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                                    <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200/70 dark:border-zinc-800/70 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-5 py-3">{d.thThumbnail || 'Thumbnail'}</th>
                                            
                                            {/* Sortable: Nama Riset */}
                                            <th className="px-5 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSortColumn('title')}
                                                    className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                                >
                                                    <span>{d.thResearchName || 'Nama Riset & Headline'}</span>
                                                    {sortField === 'title' || sortField === 'name' ? (
                                                        sortDirection === 'asc' ? (
                                                            <ArrowUp className="w-3.5 h-3.5 text-[#0AB600]" />
                                                        ) : (
                                                            <ArrowDown className="w-3.5 h-3.5 text-[#0AB600]" />
                                                        )
                                                    ) : (
                                                        <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60" />
                                                    )}
                                                </button>
                                            </th>

                                            {/* Sortable: Kategori */}
                                            <th className="px-5 py-3 hidden sm:table-cell">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSortColumn('category')}
                                                    className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                                >
                                                    <span>{d.thCategoryPartner || 'Kategori & Mitra'}</span>
                                                    {sortField === 'category' ? (
                                                        sortDirection === 'asc' ? (
                                                            <ArrowUp className="w-3.5 h-3.5 text-[#0AB600]" />
                                                        ) : (
                                                            <ArrowDown className="w-3.5 h-3.5 text-[#0AB600]" />
                                                        )
                                                    ) : (
                                                        <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60" />
                                                    )}
                                                </button>
                                            </th>

                                            {/* Sortable: Status */}
                                            <th className="px-5 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSortColumn('status')}
                                                    className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                                >
                                                    <span>{d.thStatus || 'Status'}</span>
                                                    {sortField === 'status' ? (
                                                        sortDirection === 'asc' ? (
                                                            <ArrowUp className="w-3.5 h-3.5 text-[#0AB600]" />
                                                        ) : (
                                                            <ArrowDown className="w-3.5 h-3.5 text-[#0AB600]" />
                                                        )
                                                    ) : (
                                                        <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60" />
                                                    )}
                                                </button>
                                            </th>

                                            {/* Sortable: Update */}
                                            <th className="px-5 py-3 hidden md:table-cell">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSortColumn('updated_at')}
                                                    className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                                >
                                                    <span>{d.thUpdate || 'Update'}</span>
                                                    {sortField === 'updated_at' ? (
                                                        sortDirection === 'asc' ? (
                                                            <ArrowUp className="w-3.5 h-3.5 text-[#0AB600]" />
                                                        ) : (
                                                            <ArrowDown className="w-3.5 h-3.5 text-[#0AB600]" />
                                                        )
                                                    ) : (
                                                        <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60" />
                                                    )}
                                                </button>
                                            </th>

                                            <th className="px-5 py-3 text-right">{d.thAction || 'Aksi'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                                        {filteredAndSortedProjects.length > 0 ? (
                                            filteredAndSortedProjects.map((project) => (
                                                <tr
                                                    key={project.slug || project.id}
                                                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                                                >
                                                    {/* Thumbnail */}
                                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                                        <div className="w-14 h-11 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center relative">
                                                            {project.main_image ? (
                                                                <img
                                                                    src={project.main_image}
                                                                    alt={project.name}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                                />
                                                            ) : (
                                                                <FolderKanban className="w-5 h-5 text-zinc-400 opacity-60" />
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Title & Name */}
                                                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white max-w-xs">
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewModalProject(project)}
                                                            className="font-bold hover:text-[#0AB600] dark:hover:text-[#0AB600] truncate block uppercase text-left cursor-pointer transition-colors"
                                                        >
                                                            {project.title || project.name}
                                                        </button>
                                                        <span className="text-[11px] text-zinc-400 truncate block mt-0.5">
                                                            {project.name}
                                                        </span>
                                                    </td>

                                                    {/* Category & Partner */}
                                                    <td className="px-5 py-3.5 hidden sm:table-cell">
                                                        <span className="text-[11px] font-semibold text-[#0AB600] block truncate">
                                                            {project.category}
                                                        </span>
                                                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block truncate">
                                                            {project.subtitle || '-'}
                                                        </span>
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                                project.status === 'published'
                                                                    ? 'bg-[#0AB600]/10 border-[#0AB600]/30 text-[#0AB600]'
                                                                    : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                                                            }`}
                                                        >
                                                            {project.status === 'published' && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600]" />
                                                            )}
                                                            {project.status === 'published' ? (d.statusPublished || 'Published') : (d.statusDraft || 'Draft')}
                                                        </span>
                                                    </td>

                                                    {/* Date */}
                                                    <td className="px-5 py-3.5 text-zinc-400 text-[11px] hidden md:table-cell whitespace-nowrap">
                                                        {project.updated_at}
                                                    </td>

                                                    {/* Actions Toolbar */}
                                                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {/* Quick View Modal */}
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreviewModalProject(project)}
                                                                title={d.actionQuickView || 'Quick View Flyer'}
                                                                className="p-1.5 rounded-lg text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>

                                                            {/* Edit */}
                                                            <Link
                                                                href={`/projects/${project.slug}/edit`}
                                                                title={d.actionEdit || 'Edit Project'}
                                                                className="p-1.5 rounded-lg text-zinc-400 hover:text-[#0AB600] dark:hover:text-[#0AB600] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </Link>

                                                            {/* View / Preview */}
                                                            <Link
                                                                href={`/projects/${project.slug}`}
                                                                title={d.actionQuickView || 'Lihat Flyer'}
                                                                className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                            >
                                                                <FileText className="w-4 h-4" />
                                                            </Link>

                                                            {/* Duplicate */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDuplicate(project.slug, project.name)}
                                                                title={d.actionDuplicate || 'Duplicate'}
                                                                className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-5 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                                        <img
                                                            src="/assets/img/icon/notfound.png"
                                                            alt="Tidak Ada Project"
                                                            className="w-24 sm:w-28 h-auto object-contain mx-auto mb-3 drop-shadow-xs"
                                                        />
                                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {d.emptyProjectsFilter || 'Tidak Ada Project Sesuai Filter'}
                                                        </h3>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                                            {projectSearch || statusFilter !== 'all' || categoryFilter !== 'all'
                                                                ? 'Coba ubah kata kunci atau parameter filter untuk menampilkan data proyek.'
                                                                : (d.emptyDesc || 'Mulai buat lembar inovasi project STAS RG pertama Anda untuk digenerate menjadi flyer visual siap cetak.')}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Quick CTA Banner */}
                        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0AB600] to-[#089600] text-white border border-[#0AB600]/40 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-lg shadow-[#0AB600]/20">
                            <div className="flex items-center gap-4 sm:gap-5 z-10 max-w-lg">
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0 flex items-center justify-center">
                                    <img
                                        src="/assets/img/icon/profile_dev.png"
                                        alt="Developer Assistant"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://github.com/fatintsani.png';
                                        }}
                                    />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                                        {d.ctaTitle || 'Ingin Menerbitkan Flyer Riset Baru?'}
                                    </h3>
                                    <p className="text-xs text-white/90 mt-1 leading-relaxed">
                                        {d.ctaDesc || 'Lengkapi foto prototype, spesifikasi teknologi, poin manfaat, dan tautan video untuk langsung meng-generate lembar publikasi siap cetak.'}
                                    </p>
                                </div>
                            </div>

                            <Link
                                href="/projects/create"
                                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-white hover:bg-zinc-100 text-[#0AB600] text-xs sm:text-sm font-bold transition-all shadow-md shrink-0 cursor-pointer z-10 self-start sm:self-center"
                            >
                                <span>{d.ctaButton || 'Buat Sekarang'}</span>
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>

                            {/* Background Pattern */}
                            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Category Distribution & System Metrics (lg:col-span-4) */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* 1. Category Distribution Breakdown */}
                        <div className="bg-white dark:bg-[#121824] rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <span className="p-1 rounded-md bg-[#0AB600]/10 text-[#0AB600]">
                                        <Tag className="w-4 h-4" />
                                    </span>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        {d.categoryTitle || 'Distribusi Klaster Riset'}
                                    </h3>
                                </div>
                                <span className="text-[11px] font-bold text-zinc-400">
                                    {(d.categoryCount || '{count} Kategori').replace('{count}', category_distribution.length)}
                                </span>
                            </div>

                            {category_distribution.length > 0 ? (
                                <div className="space-y-3.5">
                                    {category_distribution.map((cat, idx) => (
                                        <div key={idx} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[200px]">
                                                    {cat.name}
                                                </span>
                                                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                                                    {cat.count} ({cat.percentage}%)
                                                </span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-[#0AB600] to-[#089600] transition-all duration-500"
                                                    style={{ width: `${cat.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-zinc-400 text-center py-4">
                                    {d.categoryEmpty || 'Belum ada data kategori riset.'}
                                </p>
                            )}
                        </div>

                        {/* Quick Launcher Shortcuts */}
                        <div className="bg-white dark:bg-[#121824] rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-xs space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                {d.shortcutsTitle || 'Pintasan Navigasi'}
                            </h3>

                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    href="/projects"
                                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/15 border border-zinc-200/70 dark:border-zinc-800 hover:border-[#0AB600]/30 transition-all text-left"
                                >
                                    <FolderKanban className="w-4 h-4 text-[#0AB600] mb-1" />
                                    <span className="block text-xs font-bold text-slate-900 dark:text-white">{d.shortcutAllProjects || 'Semua Project'}</span>
                                    <span className="block text-[10px] text-zinc-400">{d.shortcutAllProjectsDesc || 'Kelola dokumen'}</span>
                                </Link>

                                <Link
                                    href="/settings"
                                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/15 border border-zinc-200/70 dark:border-zinc-800 hover:border-[#0AB600]/30 transition-all text-left"
                                >
                                    <Fingerprint className="w-4 h-4 text-[#0AB600] mb-1" />
                                    <span className="block text-xs font-bold text-slate-900 dark:text-white">{d.shortcutPasskey || 'Passkey Auth'}</span>
                                    <span className="block text-[10px] text-zinc-400">{d.shortcutPasskeyDesc || 'Biometrik & akun'}</span>
                                </Link>
                            </div>
                        </div>

                    </div>

                </div>

            </div>

            {/* Quick View Live Flyer Modal */}
            {previewModalProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
                    <div className="bg-white dark:bg-[#121824] rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
                        
                        {/* Modal Header */}
                        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-900/60">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                        {previewModalProject.title || previewModalProject.name}
                                    </h3>
                                    <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                            previewModalProject.status === 'published'
                                                ? 'bg-[#0AB600]/10 text-[#0AB600] border-[#0AB600]/30'
                                                : 'bg-zinc-500/10 text-zinc-600 border-zinc-500/30'
                                        }`}
                                    >
                                        {previewModalProject.status === 'published' ? (d.statusPublished || 'Published') : (d.statusDraft || 'Draft')}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    {previewModalProject.subtitle || previewModalProject.category}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/projects/${previewModalProject.slug}/edit`}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold transition-all"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>{d.modalEdit || 'Edit'}</span>
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleModalPrint}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
                                    title="Cetak atau Simpan sebagai PDF via browser (Ctrl+P)"
                                >
                                    <Printer className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                                    <span>Print / Simpan PDF</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleModalDownloadPng}
                                    disabled={modalPngLoading}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:cursor-wait"
                                    title="Download Gambar PNG Resolusi Tinggi (300 DPI)"
                                >
                                    {modalPngLoading ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>PNG...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon className="w-3.5 h-3.5" />
                                            <span>PNG</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPreviewModalProject(null)}
                                    className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body: Flyer Canvas */}
                        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)] flex items-center justify-center bg-zinc-100 dark:bg-zinc-950">
                            <div className="max-w-2xl w-full">
                                <ProjectPreview project={previewModalProject} isLive={false} />
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </AdminLayout>
    );
}
