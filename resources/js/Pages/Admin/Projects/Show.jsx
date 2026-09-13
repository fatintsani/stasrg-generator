import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useAlert } from '../../../Context/AlertContext';
import ProjectPreview from '../../../Components/Admin/ProjectPreview';
import {
    ArrowLeft,
    Edit3,
    Copy,
    Trash2,
    Calendar,
    Globe,
    ExternalLink,
    CheckCircle,
    FileText,
    Share2,
    Loader2,
    Printer,
    Image as ImageIcon,
    Eye
} from 'lucide-react';
import { downloadFlyerAsPng, printFlyer } from '../../../Utils/flyerExport';

export default function Show({ project }) {
    const { showConfirm } = useAlert();
    const [pngLoading, setPngLoading] = useState(false);

    if (!project) return null;

    const handleDuplicate = async () => {
        const confirmed = await showConfirm({
            title: 'Duplikasi Project?',
            message: `Apakah Anda ingin membuat salinan dari project "${project.name}"? Salinan baru akan dibuat dengan status Draft.`,
            confirmText: 'Duplikasi Project',
            cancelText: 'Batal',
            variant: 'primary',
        });
        if (confirmed) {
            router.post(`/projects/${project.slug}/duplicate`);
        }
    };

    const handleDelete = async () => {
        const confirmed = await showConfirm({
            title: 'Hapus Project?',
            message: `Project "${project.name}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`,
            confirmText: 'Hapus Project',
            cancelText: 'Batal',
            variant: 'danger',
        });
        if (confirmed) {
            router.delete(`/projects/${project.slug}`);
        }
    };

    const handleDownloadPng = async () => {
        if (pngLoading) return;
        setPngLoading(true);

        try {
            const canvasId = `flyer-canvas-${project.slug || project.id}`;
            const filename = `${project.name.replace(/\s+/g, '_').toLowerCase()}_flyer_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.png`;
            await downloadFlyerAsPng(canvasId, filename);
        } catch (error) {
            console.error('PNG download error:', error);
        } finally {
            setPngLoading(false);
        }
    };

    const handlePrint = () => {
        const canvasId = `flyer-canvas-${project.slug || project.id}`;
        printFlyer(canvasId, `Flyer - ${project.title || project.name}`);
    };

    return (
        <AdminLayout title={`Preview - ${project.name}`} currentPath="/projects">
            <div className="space-y-6">
                
                {/* Top Action Bar (2 Rows) */}
                <div className="bg-white dark:bg-[#121824] p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
                    {/* Row 1: Project Information & Navigation */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <Link
                                href="/projects"
                                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors shrink-0"
                                title="Kembali ke Semua Project"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                                        {project.name}
                                    </h1>
                                    <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                            project.status === 'published'
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                                : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30'
                                        }`}
                                    >
                                        {project.status === 'published' ? 'Published' : 'Draft'}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                                        Format: {project.doc_format === 'roll_banner' ? 'X-Banner / Roll-up' : project.doc_format === 'factsheet_2col' ? 'Factsheet 2-Kolom' : project.doc_format === 'pitch_poster' ? 'Pitch Poster (16:9)' : 'A4 Flyer'}
                                    </span>
                                    {(!project.doc_format || project.doc_format === 'a4_flyer') && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#0D5A34] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                                            {project.layout_preset === 'visual_heavy' ? 'Mode B (Visual-Heavy)' : project.layout_preset === 'text_heavy' ? 'Mode C (Text/Spec-Heavy)' : 'Mode A (Balanced)'}
                                        </span>
                                    )}
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shrink-0">
                                        Tema: {project.color_theme === 'ocean_tech' ? 'Ocean Tech' : project.color_theme === 'crimson_innovation' ? 'Crimson Innovation' : project.color_theme === 'slate_monochrome' ? 'Executive Slate' : 'STAS-RG Official'}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                                    <span>Kategori: <strong className="text-slate-700 dark:text-zinc-300">{project.category || '-'}</strong></span>
                                    <span>•</span>
                                    <span>Terakhir diupdate: {new Date(project.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </p>
                            </div>
                        </div>

                        {project.status === 'published' && (
                            <Link
                                href={`/showcase/${project.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200/60 dark:border-emerald-800/60 transition-all shrink-0"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Lihat di Showcase</span>
                            </Link>
                        )}
                    </div>

                    {/* Row 2: Action Buttons Bar */}
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5">
                        {/* Left Group: Manage Actions */}
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/projects/${project.slug}/edit`}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold whitespace-nowrap transition-all"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                            </Link>

                            <button
                                type="button"
                                onClick={handleDuplicate}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Duplicate</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                                title="Hapus Project"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Right Group: Export & Print Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
                                title="Cetak langsung atau Simpan sebagai PDF via browser Print dialog (Ctrl+P)"
                            >
                                <Printer className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                                <span>Print / Simpan PDF</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadPng}
                                disabled={pngLoading}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D5A34] hover:bg-[#094226] text-white text-xs font-semibold shadow-sm whitespace-nowrap transition-all cursor-pointer disabled:cursor-wait"
                                title="Download Gambar PNG Resolusi Tinggi (300 DPI)"
                            >
                                {pngLoading ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Generating PNG...</span>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        <span>Download PNG</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Preview Container */}
                <div className="max-w-4xl mx-auto w-full">
                    <ProjectPreview project={project} />
                </div>

            </div>
        </AdminLayout>
    );
}
