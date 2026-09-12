import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useApp } from '../../../Context/AppContext';
import { useAlert } from '../../../Context/AlertContext';
import { stripHtml } from '../../../Utils/text';
import {
    FolderKanban,
    Plus,
    Search,
    Filter,
    Eye,
    Edit3,
    Copy,
    Download,
    Calendar,
    Trash2,
    CheckCircle2,
    Clock,
    MoreVertical,
    FileText,
    ExternalLink,
    AlertCircle
} from 'lucide-react';

export default function Index({ projects, filters = {} }) {
    const { t, language } = useApp();
    const { showConfirm } = useAlert();

    const p = t?.admin?.projects || {};

    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get('/projects', { search, status: statusFilter }, { preserveState: true, replace: true });
    };

    const handleStatusChange = (status) => {
        setStatusFilter(status);
        router.get('/projects', { search, status }, { preserveState: true, replace: true });
    };

    const handleDuplicate = async (slug, name = 'Project') => {
        const title = p.duplicateTitle || 'Duplikasi Project?';
        const message = (p.duplicateMsg || 'Apakah Anda ingin membuat salinan dari project "{name}"? Salinan baru akan dibuat dengan status Draft.').replace('{name}', name);
        const confirmText = p.duplicateConfirm || 'Duplikasi Project';
        const cancelText = p.duplicateCancel || 'Batal';

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

    const handleDelete = async (slug, name) => {
        const title = p.deleteTitle || 'Hapus Project?';
        const message = (p.deleteMsg || 'Project "{name}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.').replace('{name}', name);
        const confirmText = p.deleteConfirm || 'Hapus Project';
        const cancelText = p.deleteCancel || 'Batal';

        const confirmed = await showConfirm({
            title,
            message,
            confirmText,
            cancelText,
            variant: 'danger',
        });
        if (confirmed) {
            setDeletingId(slug);
            router.delete(`/projects/${slug}`, {
                onFinish: () => setDeletingId(null),
            });
        }
    };

    const projectList = projects?.data || [];

    return (
        <AdminLayout title={p.pageTitle || 'Semua Project'} currentPath="/projects">
            <div className="space-y-6">
                
                {/* Header Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#0D5A34] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <FolderKanban className="w-5 h-5" />
                            </span>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {p.headerTitle || 'Project Visual Generator'}
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                            {p.headerSubtitle || 'Kelola, generate flyer visual, dan ekspor lembar informasi riset STAS RG ke PDF.'}
                        </p>
                    </div>

                    <Link
                        href="/projects/create"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D5A34] hover:bg-[#094226] text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-900/10 hover:shadow-lg transition-all duration-150 cursor-pointer shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{p.createButton || 'Buat Project Baru'}</span>
                    </Link>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
                    
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 w-full md:w-auto bg-zinc-100 dark:bg-zinc-900/80 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-x-auto">
                        {[
                            { key: 'all', label: p.tabAll || 'Semua' },
                            { key: 'published', label: p.tabPublished || 'Published' },
                            { key: 'draft', label: p.tabDraft || 'Draft' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleStatusChange(tab.key)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                    statusFilter === tab.key
                                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                                        : 'text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={p.searchPlaceholder || 'Cari nama project, kategori...'}
                            className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#0D5A34]"
                        />
                        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                    </form>
                </div>

                {/* Projects Grid / Empty State */}
                {projectList.length === 0 ? (
                    <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-12 text-center shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#0D5A34] dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                            <FolderKanban className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {p.emptyTitle || 'Belum Ada Project'}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            {p.emptyDesc || 'Mulai buat lembar inovasi project STAS RG pertama Anda untuk digenerate menjadi flyer dan dokumen PDF.'}
                        </p>
                        <Link
                            href="/projects/create"
                            className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-xl bg-[#0D5A34] hover:bg-[#094226] text-white text-xs font-semibold shadow-md transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{p.emptyCreateButton || 'Buat Project Baru'}</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {projectList.map((project) => (
                            <div
                                key={project.id || project.slug}
                                className="group bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                {/* Thumbnail Top Banner */}
                                <div className="h-44 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden border-b border-zinc-100 dark:border-zinc-800">
                                    {project.main_image ? (
                                        <img
                                            src={`/storage/${project.main_image}`}
                                            alt={project.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                                            <FolderKanban className="w-8 h-8 mb-1" />
                                            <span className="text-[10px]">{p.noImage || 'Tidak ada gambar'}</span>
                                        </div>
                                    )}

                                    {/* Category Badge */}
                                    {project.category && (
                                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                                            {project.category}
                                        </span>
                                    )}

                                    {/* Status Badge */}
                                    <span
                                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border ${
                                            project.status === 'published'
                                                ? 'bg-emerald-500/90 text-white border-emerald-400'
                                                : 'bg-zinc-800/90 text-zinc-300 border-zinc-700'
                                        }`}
                                    >
                                        {project.status === 'published' ? (p.statusPublished || 'Published') : (p.statusDraft || 'Draft')}
                                    </span>
                                </div>

                                {/* Body Content */}
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        {/* Subtitle */}
                                        {project.subtitle && (
                                            <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 line-clamp-1 mb-1">
                                                {project.subtitle}
                                            </p>
                                        )}

                                        {/* Title */}
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#0D5A34] dark:group-hover:text-emerald-400 transition-colors uppercase">
                                            {project.title || project.name}
                                        </h3>

                                        {/* Description */}
                                        {project.description && stripHtml(project.description) && (
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
                                                {stripHtml(project.description)}
                                            </p>
                                        )}
                                    </div>

                                    {/* Metadata & Actions */}
                                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{new Date(project.updated_at).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>

                                        {/* Action Buttons Toolbar */}
                                        <div className="flex items-center gap-1">
                                            {/* Preview */}
                                            <Link
                                                href={`/projects/${project.slug}`}
                                                title={p.actionPreview || 'Lihat Detail'}
                                                className="p-1.5 rounded-lg text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>

                                            {/* Edit */}
                                            <Link
                                                href={`/projects/${project.slug}/edit`}
                                                title={p.actionEdit || 'Edit Project'}
                                                className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </Link>

                                            {/* Download PDF */}
                                            <a
                                                href={`/projects/${project.slug}/pdf`}
                                                target="_blank"
                                                rel="noreferrer"
                                                title={p.actionDownload || 'Download PDF'}
                                                className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>

                                            {/* Duplicate */}
                                            <button
                                                type="button"
                                                onClick={() => handleDuplicate(project.slug, project.name)}
                                                title={p.actionDuplicate || 'Duplikasi Project'}
                                                className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>

                                            {/* Delete */}
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(project.slug, project.name)}
                                                disabled={deletingId === project.slug}
                                                title={p.actionDelete || 'Hapus Project'}
                                                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination if applicable */}
                {projects?.links && projects.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1.5 mt-6">
                        {projects.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    link.active
                                        ? 'bg-[#0D5A34] text-white'
                                        : link.url
                                        ? 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'
                                        : 'text-zinc-400 pointer-events-none'
                                }`}
                            />
                        ))}
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
