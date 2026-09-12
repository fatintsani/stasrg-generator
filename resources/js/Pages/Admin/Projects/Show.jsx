import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useAlert } from '../../../Context/AlertContext';
import ProjectPreview from '../../../Components/Admin/ProjectPreview';
import {
    ArrowLeft,
    Edit3,
    Download,
    Copy,
    Trash2,
    Calendar,
    Globe,
    ExternalLink,
    CheckCircle,
    FileText,
    Share2,
    Loader2
} from 'lucide-react';

export default function Show({ project }) {
    const { showConfirm } = useAlert();
    const [pdfLoading, setPdfLoading] = useState(false);

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

    const handleDownloadPdf = async () => {
        if (pdfLoading) return;
        setPdfLoading(true);

        try {
            const response = await fetch(`/projects/${project.slug}/pdf`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error('PDF generation failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Extract filename from Content-Disposition header or use fallback
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `${project.name.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.pdf`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) {
                    filename = match[1].replace(/['"]/g, '');
                }
            }

            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF download error:', error);
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <AdminLayout title={`Preview - ${project.name}`} currentPath="/projects">
            <div className="space-y-6">
                
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#121824] p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/projects"
                            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                                    {project.name}
                                </h1>
                                <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                        project.status === 'published'
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                            : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30'
                                    }`}
                                >
                                    {project.status === 'published' ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-3 mt-0.5">
                                <span>Kategori: <strong className="text-slate-700 dark:text-zinc-300">{project.category || '-'}</strong></span>
                                <span>•</span>
                                <span>Terakhir diupdate: {new Date(project.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </p>
                        </div>
                    </div>

                    {/* Toolbar Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Edit */}
                        <Link
                            href={`/projects/${project.slug}/edit`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all"
                        >
                            <Edit3 className="w-4 h-4" />
                            <span>Edit Project</span>
                        </Link>

                        {/* Duplicate */}
                        <button
                            type="button"
                            onClick={handleDuplicate}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
                        >
                            <Copy className="w-4 h-4" />
                            <span>Duplicate</span>
                        </button>

                        {/* Download PDF */}
                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={pdfLoading}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:cursor-wait ${
                                pdfLoading
                                    ? 'bg-[#0D5A34]/80'
                                    : 'bg-[#0D5A34] hover:bg-[#094226]'
                            }`}
                        >
                            {pdfLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Generating PDF...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    <span>Download PDF</span>
                                </>
                            )}
                        </button>

                        {/* Delete */}
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                            title="Delete Project"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
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
