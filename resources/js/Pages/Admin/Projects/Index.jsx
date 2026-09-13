import React, { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useApp } from '../../../Context/AppContext';
import { useAlert } from '../../../Context/AlertContext';
import { stripHtml } from '../../../Utils/text';
import { A4Document } from '../../../Components/Admin/ProjectPreview';
import { captureFlyerToDataUrl, createZipFromFlyerImages } from '../../../Utils/flyerExport';
import ExportSosmedModal from '../../../Components/Admin/ExportSosmedModal';
import {
    FolderKanban,
    Plus,
    Search,
    Filter,
    Eye,
    Edit3,
    Copy,
    Calendar,
    Trash2,
    CheckCircle2,
    Clock,
    FileText,
    ExternalLink,
    AlertCircle,
    Archive,
    CheckSquare,
    Square,
    LayoutGrid,
    Table2,
    Loader2,
    Layers,
    Check,
    X,
    Sparkles,
    Share2
} from 'lucide-react';

export default function Index({ projects, filters = {} }) {
    const { t, language } = useApp();
    const { showConfirm, showAlert } = useAlert();

    const p = t?.admin?.projects || {};

    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [deletingId, setDeletingId] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

    // Multi-Selection State
    const [selectedIds, setSelectedIds] = useState([]);

    // Export Sosmed Modal State
    const [activeSosmedProject, setActiveSosmedProject] = useState(null);

    // Batch Export State
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, currentName: '', statusText: '' });
    const [batchComplete, setBatchComplete] = useState(false);
    const [activeBatchProject, setActiveBatchProject] = useState(null);
    const cancelBatchRef = useRef(false);

    const projectList = projects?.data || [];

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
                onFinish: () => {
                    setDeletingId(null);
                    setSelectedIds((prev) => prev.filter((id) => id !== slug && id !== projectList.find(pr => pr.slug === slug)?.id));
                },
            });
        }
    };

    // Selection Handlers
    const isAllSelected = projectList.length > 0 && projectList.every((proj) => selectedIds.includes(proj.id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(projectList.map((proj) => proj.id));
        }
    };

    const toggleSelectOne = (projectId) => {
        setSelectedIds((prev) =>
            prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
        );
    };

    const deselectAll = () => {
        setSelectedIds([]);
    };

    // Batch Export Engine
    const handleStartBatchExport = async () => {
        if (selectedIds.length === 0) return;

        const selectedProjects = projectList.filter((proj) => selectedIds.includes(proj.id));
        if (selectedProjects.length === 0) return;

        cancelBatchRef.current = false;
        setIsBatchModalOpen(true);
        setBatchComplete(false);
        setBatchProgress({
            current: 0,
            total: selectedProjects.length,
            currentName: '',
            statusText: 'Menyiapkan proses rendering flyer...',
        });

        const capturedFiles = [];

        try {
            for (let i = 0; i < selectedProjects.length; i++) {
                if (cancelBatchRef.current) {
                    break;
                }

                const proj = selectedProjects[i];
                setActiveBatchProject(proj);
                setBatchProgress({
                    current: i + 1,
                    total: selectedProjects.length,
                    currentName: proj.title || proj.name,
                    statusText: `Merender flyer (${i + 1}/${selectedProjects.length})...`,
                });

                // Wait for offscreen DOM element, fonts, and images to settle
                await new Promise((r) => setTimeout(r, 350));

                const canvasElement = document.getElementById('batch-flyer-active-canvas');
                if (canvasElement) {
                    const dataUrl = await captureFlyerToDataUrl(canvasElement);
                    const safeSlug = (proj.slug || proj.name || `project_${proj.id}`)
                        .toLowerCase()
                        .replace(/[^a-z0-9_-]/g, '_');
                    
                    capturedFiles.push({
                        filename: `${safeSlug}_flyer.png`,
                        projectName: proj.title || proj.name,
                        dataUrl,
                    });
                }
            }

            if (cancelBatchRef.current) {
                setIsBatchModalOpen(false);
                setActiveBatchProject(null);
                return;
            }

            setBatchProgress((prev) => ({
                ...prev,
                statusText: 'Mengompresi berkas ke arsip .zip...',
            }));

            const dateStr = new Date().toISOString().slice(0, 10);
            const zipFilename = `STAS-RG_Flyers_Batch_${dateStr}.zip`;

            await createZipFromFlyerImages(capturedFiles, zipFilename);

            setBatchComplete(true);
            setBatchProgress((prev) => ({
                ...prev,
                statusText: 'Arsip ZIP berhasil diunduh!',
            }));
        } catch (error) {
            console.error('Batch export failed:', error);
            setIsBatchModalOpen(false);
            if (showAlert) {
                showAlert('Gagal mengekspor flyer ke ZIP: ' + error.message, 'danger');
            }
        } finally {
            setActiveBatchProject(null);
        }
    };

    const handleCancelBatchExport = () => {
        cancelBatchRef.current = true;
        setIsBatchModalOpen(false);
        setActiveBatchProject(null);
    };

    const handleCloseBatchModal = () => {
        setIsBatchModalOpen(false);
        setBatchComplete(false);
        setSelectedIds([]);
    };

    const getLayoutPresetLabel = (preset) => {
        switch (preset) {
            case 'visual_heavy':
                return 'Visual-Heavy';
            case 'text_heavy':
                return 'Text-Heavy';
            default:
                return 'Balanced';
        }
    };

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
                                {p.headerTitle || 'Manajemen & Visual Project'}
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                            {p.headerSubtitle || 'Kelola, generate flyer visual standar A4, dan ekspor lembar riset STAS RG secara individu atau batch ZIP.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/projects/create"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D5A34] hover:bg-[#094226] text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-900/10 hover:shadow-lg transition-all duration-150 cursor-pointer shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{p.createButton || 'Buat Project Baru'}</span>
                        </Link>
                    </div>
                </div>

                {/* Filters, Search & View Toolbar */}
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

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        {/* Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="w-full md:w-72 relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={p.searchPlaceholder || 'Cari nama project, kategori...'}
                                className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#0D5A34]"
                            />
                            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                        </form>

                        {/* View Mode Toggle (Table / Grid) */}
                        <div className="flex items-center bg-zinc-100 dark:bg-zinc-900/80 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 shrink-0">
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                title="Tampilan Tabel Data"
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    viewMode === 'table'
                                        ? 'bg-white dark:bg-zinc-800 text-[#0D5A34] dark:text-emerald-400 shadow-xs'
                                        : 'text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                                }`}
                            >
                                <Table2 className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                title="Tampilan Kartu Grid"
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    viewMode === 'grid'
                                        ? 'bg-white dark:bg-zinc-800 text-[#0D5A34] dark:text-emerald-400 shadow-xs'
                                        : 'text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                                }`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Selection Action Toolbar (When 1+ items selected) */}
                {selectedIds.length > 0 && (
                    <div className="bg-slate-900 dark:bg-zinc-900 text-white p-4 rounded-2xl shadow-xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/40 shrink-0">
                                {selectedIds.length}
                            </span>
                            <div>
                                <p className="text-xs sm:text-sm font-bold text-white">
                                    {selectedIds.length} Proyek Riset Dipilih
                                </p>
                                <p className="text-[11px] text-zinc-400">
                                    Siap diekspor ke format dokumen flyer A4 (.zip)
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                                type="button"
                                onClick={deselectAll}
                                className="px-3.5 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                            >
                                Batal Pilih
                            </button>
                            <button
                                type="button"
                                onClick={handleStartBatchExport}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0D5A34] hover:bg-[#094226] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-950/40 hover:scale-[1.01] transition-all cursor-pointer"
                            >
                                <Archive className="w-4 h-4 text-emerald-300" />
                                <span>Download Selected Flyers (.zip)</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Projects List: Empty State, Table View, or Grid View */}
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
                ) : viewMode === 'table' ? (
                    /* ================= TABEL DATA VIEW ================= */
                    <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-bold">
                                        <th className="py-3 px-4 w-12 text-center">
                                            <button
                                                type="button"
                                                onClick={toggleSelectAll}
                                                title={isAllSelected ? 'Batalkan pilih semua' : 'Pilih semua proyek di halaman ini'}
                                                className="cursor-pointer text-zinc-400 hover:text-[#0D5A34] dark:hover:text-emerald-400 transition-colors"
                                            >
                                                {isAllSelected ? (
                                                    <CheckSquare className="w-4 h-4 text-[#0D5A34] dark:text-emerald-400" />
                                                ) : (
                                                    <Square className="w-4 h-4" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="py-3 px-4">Proyek & Kategori</th>
                                        <th className="py-3 px-4 hidden md:table-cell">Layout Preset</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 hidden lg:table-cell">Pembaruan</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                                    {projectList.map((project) => {
                                        const isSelected = selectedIds.includes(project.id);
                                        return (
                                            <tr
                                                key={project.id || project.slug}
                                                className={`transition-colors ${
                                                    isSelected
                                                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                                                        : 'hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40'
                                                }`}
                                            >
                                                {/* Checkbox Column */}
                                                <td className="py-3.5 px-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSelectOne(project.id)}
                                                        className="cursor-pointer text-zinc-400 hover:text-[#0D5A34] dark:hover:text-emerald-400 transition-colors"
                                                    >
                                                        {isSelected ? (
                                                            <CheckSquare className="w-4 h-4 text-[#0D5A34] dark:text-emerald-400" />
                                                        ) : (
                                                            <Square className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </td>

                                                {/* Thumbnail + Title + Category */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200/80 dark:border-zinc-700/80">
                                                            {project.main_image ? (
                                                                <img
                                                                    src={`/storage/${project.main_image}`}
                                                                    alt={project.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                                    <FolderKanban className="w-5 h-5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 max-w-md">
                                                            <Link
                                                                href={`/projects/${project.slug}`}
                                                                className="font-bold text-slate-900 dark:text-white hover:text-[#0D5A34] dark:hover:text-emerald-400 transition-colors truncate block text-xs sm:text-sm uppercase"
                                                            >
                                                                {project.title || project.name}
                                                            </Link>
                                                            {project.subtitle && (
                                                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                                                    {project.subtitle}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                {project.category && (
                                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                                                        {project.category}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Layout Preset */}
                                                <td className="py-3.5 px-4 hidden md:table-cell">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                                        <Layers className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                                        <span>{getLayoutPresetLabel(project.layout_preset)}</span>
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                                            project.status === 'published'
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                                                        }`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'published' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                                                        <span>{project.status === 'published' ? (p.statusPublished || 'Published') : (p.statusDraft || 'Draft')}</span>
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="py-3.5 px-4 hidden lg:table-cell text-zinc-500 dark:text-zinc-400 text-[11px]">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                                        <span>{new Date(project.updated_at).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveSosmedProject(project)}
                                                            title="Ekspor Media Sosial & Multi-Format (1:1, 9:16, PNG, JPG)"
                                                            className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                                                        >
                                                            <Share2 className="w-4 h-4" />
                                                        </button>
                                                        <Link
                                                            href={`/projects/${project.slug}`}
                                                            title={p.actionPreview || 'Lihat Flyer'}
                                                            className="p-1.5 rounded-lg text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={`/projects/${project.slug}/edit`}
                                                            title={p.actionEdit || 'Edit Project'}
                                                            className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDuplicate(project.slug, project.name)}
                                                            title={p.actionDuplicate || 'Duplikasi Project'}
                                                            className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
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
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* ================= KARTU GRID VIEW ================= */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {projectList.map((project) => {
                            const isSelected = selectedIds.includes(project.id);
                            return (
                                <div
                                    key={project.id || project.slug}
                                    className={`group bg-white dark:bg-[#121824] rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                                        isSelected
                                            ? 'border-[#0D5A34] ring-2 ring-[#0D5A34]/30'
                                            : 'border-zinc-200/80 dark:border-zinc-800/80'
                                    }`}
                                >
                                    {/* Thumbnail Top Banner */}
                                    <div className="h-44 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden border-b border-zinc-100 dark:border-zinc-800">
                                        {/* Top Left Selection Checkbox */}
                                        <button
                                            type="button"
                                            onClick={() => toggleSelectOne(project.id)}
                                            className="absolute top-3 left-3 z-10 p-1.5 rounded-xl bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors cursor-pointer"
                                            title={isSelected ? 'Batalkan pilihan' : 'Pilih proyek untuk batch export'}
                                        >
                                            {isSelected ? (
                                                <CheckSquare className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                                <Square className="w-4 h-4 text-white/80" />
                                            )}
                                        </button>

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
                                            {/* Category & Preset */}
                                            <div className="flex items-center gap-1.5 mb-2">
                                                {project.category && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-[#0D5A34] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                        {project.category}
                                                    </span>
                                                )}
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                    {getLayoutPresetLabel(project.layout_preset)}
                                                </span>
                                            </div>

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
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveSosmedProject(project)}
                                                    title="Ekspor Media Sosial & Multi-Format (1:1, 9:16, PNG, JPG)"
                                                    className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                </button>
                                                <Link
                                                    href={`/projects/${project.slug}`}
                                                    title={p.actionPreview || 'Lihat Detail'}
                                                    className="p-1.5 rounded-lg text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/projects/${project.slug}/edit`}
                                                    title={p.actionEdit || 'Edit Project'}
                                                    className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDuplicate(project.slug, project.name)}
                                                    title={p.actionDuplicate || 'Duplikasi Project'}
                                                    className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
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
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
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

            {/* ================= BATCH EXPORT PROGRESS MODAL ================= */}
            {isBatchModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#121824] rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
                        <div className="text-center space-y-2">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0D5A34] dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                                {batchComplete ? (
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-in zoom-in-50 duration-300" />
                                ) : (
                                    <Archive className="w-8 h-8 animate-bounce text-[#0D5A34] dark:text-emerald-400" />
                                )}
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                {batchComplete ? 'Batch Export Selesai!' : 'Mempersiapkan Arsip ZIP Flyer'}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                {batchComplete
                                    ? `Berhasil merender dan mengompresi ${batchProgress.total} lembar flyer riset ke format file .zip.`
                                    : `Sistem sedang merender lembar flyer standar A4 ke gambar beresolusi tinggi (${batchProgress.current}/${batchProgress.total})`}
                            </p>
                        </div>

                        {/* Progress Bar & Status */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                <span>{batchProgress.statusText || 'Memproses...'}</span>
                                <span>{Math.round((batchProgress.current / (batchProgress.total || 1)) * 100)}%</span>
                            </div>
                            <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-200 dark:border-zinc-700">
                                <div
                                    className="h-full bg-linear-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-300 ease-out"
                                    style={{
                                        width: `${Math.max(5, (batchProgress.current / (batchProgress.total || 1)) * 100)}%`,
                                    }}
                                />
                            </div>
                            {batchProgress.currentName && !batchComplete && (
                                <p className="text-[11px] text-zinc-400 truncate text-center pt-1">
                                    Memproses: <span className="font-semibold text-slate-800 dark:text-zinc-200">{batchProgress.currentName}</span>
                                </p>
                            )}
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="pt-2 flex justify-end gap-2">
                            {batchComplete ? (
                                <button
                                    type="button"
                                    onClick={handleCloseBatchModal}
                                    className="w-full py-2.5 rounded-xl bg-[#0D5A34] hover:bg-[#094226] text-white text-xs font-bold transition-colors cursor-pointer"
                                >
                                    Selesai & Tutup
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleCancelBatchExport}
                                    className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Export Multi-Format & Media Sosial Modal */}
            <ExportSosmedModal
                project={activeSosmedProject}
                isOpen={!!activeSosmedProject}
                onClose={() => setActiveSosmedProject(null)}
            />

            {/* Offscreen A4 Canvas for Batch Rendering & High-Res PNG Capture */}
            <div
                className="fixed -left-[9999px] top-0 pointer-events-none opacity-0 select-none overflow-hidden"
                aria-hidden="true"
                style={{ width: '794px', height: '1123px' }}
            >
                {activeBatchProject && (
                    <A4Document
                        key={`batch-render-${activeBatchProject.id}`}
                        project={activeBatchProject}
                        id="batch-flyer-active-canvas"
                    />
                )}
            </div>
        </AdminLayout>
    );
}
