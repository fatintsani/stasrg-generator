import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FolderKanban,
    FileText,
    Layers,
    ShieldCheck,
    Plus,
    ArrowUpRight,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    FileCode,
    Sparkles,
    ExternalLink,
    ChevronRight,
    Lock,
} from 'lucide-react';
import { useApp } from '../../Context/AppContext';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Dashboard({ auth, stats, recent_projects }) {
    const { t, language } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    const user = auth?.user || { name: 'Administrator', email: 'admin@stasrg.internal', role: 'admin' };

    const filteredProjects = (recent_projects || []).filter((project) => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.lead.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || project.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...new Set((recent_projects || []).map((p) => p.category))];

    return (
        <AdminLayout
            title={t.admin?.dashboard?.welcome ? 'Dashboard' : 'Admin Dashboard'}
            currentPath="/dashboard"
            onOpenNewProject={() => alert(language === 'id' ? 'Formulir Input Proyek Baru siap dihubungkan!' : 'New Project Input form ready to connect!')}
        >
            <div className="space-y-6 sm:space-y-8">
                {/* 1. Page Greeting & Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {t.admin?.dashboard?.welcome || 'Selamat Datang Kembali'}, {user.name.split(' ')[0]} 👋
                        </h1>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
                            {t.admin?.dashboard?.subtitle || 'Pusat komando dan manajemen terpusat untuk standarisasi proyek riset CoE STAS-RG.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => alert(language === 'id' ? 'Formulir Input Proyek Baru siap dihubungkan!' : 'New Project Input form ready!')}
                            className="inline-flex items-center gap-2 py-2.5 px-4 rounded-full bg-[#0D5A34] hover:bg-[#094226] text-white text-xs sm:text-sm font-semibold border border-[#0D5A34] transition-all cursor-pointer shadow-none"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{t.admin?.dashboard?.quickActionButton || 'Input Proyek Baru'}</span>
                        </button>
                    </div>
                </div>

                {/* 2. Key Stats Overview Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                    {/* Stat 1: Total Proyek */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                {t.admin?.dashboard?.statProjects || 'Total Proyek Aktif'}
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                                <FolderKanban className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {stats?.total_projects || 4}
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                +1 bulan ini
                            </span>
                        </div>
                    </div>

                    {/* Stat 2: Dokumen Ter-generate */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                {t.admin?.dashboard?.statDocuments || 'Dokumen Ter-generate'}
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 flex items-center justify-center text-blue-700 dark:text-blue-400">
                                <FileText className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {stats?.total_documents || 12}
                            </span>
                            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                                100% Valid
                            </span>
                        </div>
                    </div>

                    {/* Stat 3: Template Standar */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                {t.admin?.dashboard?.statTemplates || 'Template Skema'}
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 flex items-center justify-center text-amber-700 dark:text-amber-400">
                                <Layers className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {stats?.total_templates || 28}
                            </span>
                            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                                CoE Format
                            </span>
                        </div>
                    </div>

                    {/* Stat 4: Keamanan Passkey */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                {t.admin?.dashboard?.statPasskey || 'Keamanan Akses'}
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {user.is_biometric_enabled ? 'WebAuthn Aktif' : 'Password Only'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. Quick Project Input Banner */}
                <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-900 to-[#0D5A34] text-white border border-emerald-800/80 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="max-w-xl z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-200 text-xs font-semibold mb-3">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Workflow Standarisasi Riset</span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                            {t.admin?.dashboard?.quickActionTitle || 'Input Proyek Riset Baru'}
                        </h2>
                        <p className="text-xs sm:text-sm text-emerald-100/90 mt-1.5 leading-relaxed">
                            {t.admin?.dashboard?.quickActionDesc || 'Mulai entri data proyek, anggota tim, deliverable, dan otomatisasi pembuatan dokumen terstandarisasi.'}
                        </p>
                    </div>

                    <div className="shrink-0 z-10">
                        <button
                            type="button"
                            onClick={() => alert(language === 'id' ? 'Formulir Input Proyek Baru siap dihubungkan!' : 'New Project Input form ready!')}
                            className="inline-flex items-center gap-2 py-3 px-5 rounded-full bg-white hover:bg-emerald-50 text-[#0D5A34] text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                        >
                            <span>{t.admin?.dashboard?.quickActionButton || 'Mulai Input Proyek'}</span>
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Background Decorative Pattern */}
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                </div>

                {/* 4. Recent Projects Table Area */}
                <div className="rounded-3xl bg-white dark:bg-[#18181B] border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden transition-colors">
                    {/* Table Header & Search Controls */}
                    <div className="p-5 sm:p-6 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                {t.admin?.dashboard?.recentProjectsTitle || 'Daftar Proyek Riset Terbaru'}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                {t.admin?.dashboard?.recentProjectsSubtitle || 'Status kelengkapan skema dan dokumen proyek yang sedang berjalan.'}
                            </p>
                        </div>

                        {/* Search and Category Filter */}
                        <div className="flex items-center gap-2.5 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={language === 'id' ? 'Filter proyek...' : 'Filter projects...'}
                                    className="w-full pl-9 pr-3 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#0D5A34]"
                                />
                            </div>

                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#0D5A34] cursor-pointer"
                            >
                                <option value="all">{language === 'id' ? 'Semua Kategori' : 'All Categories'}</option>
                                {categories.filter(c => c !== 'all').map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                            <thead className="bg-zinc-50/70 dark:bg-zinc-900/70 border-b border-zinc-200/80 dark:border-zinc-800/80 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3">{t.admin?.dashboard?.colCode || 'Kode'}</th>
                                    <th className="px-5 py-3">{t.admin?.dashboard?.colTitle || 'Nama Proyek Riset'}</th>
                                    <th className="px-5 py-3 hidden sm:table-cell">Kategori / Lead</th>
                                    <th className="px-5 py-3">{t.admin?.dashboard?.colStatus || 'Status'}</th>
                                    <th className="px-5 py-3 hidden md:table-cell">{t.admin?.dashboard?.colDate || 'Pembaruan'}</th>
                                    <th className="px-5 py-3 text-right">{t.admin?.dashboard?.colAction || 'Aksi'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
                                {filteredProjects.length > 0 ? (
                                    filteredProjects.map((project) => (
                                        <tr
                                            key={project.id}
                                            className="hover:bg-zinc-50/80 dark:hover:bg-zinc-850/40 transition-colors"
                                        >
                                            <td className="px-5 py-3.5 font-mono text-[11px] font-semibold text-[#0D5A34] dark:text-emerald-400 whitespace-nowrap">
                                                {project.code}
                                            </td>
                                            <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                                                {project.title}
                                            </td>
                                            <td className="px-5 py-3.5 hidden sm:table-cell">
                                                <span className="text-[11px] text-zinc-600 dark:text-zinc-400 block truncate">
                                                    {project.category}
                                                </span>
                                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block truncate">
                                                    {project.lead}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                        project.status_type === 'success'
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                                                            : project.status_type === 'warning'
                                                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                                                            : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                                                    }`}
                                                >
                                                    {project.status_type === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                                    {project.status_type === 'warning' && <Clock className="w-3 h-3 text-amber-600" />}
                                                    <span>{project.status} ({project.documents_count} Dok)</span>
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 text-[11px] hidden md:table-cell whitespace-nowrap">
                                                {project.updated_at}
                                            </td>
                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => alert(`Membuka rincian proyek: ${project.title}`)}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D5A34] dark:text-emerald-400 hover:underline cursor-pointer"
                                                >
                                                    <span>Buka Dokumen</span>
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-8 text-center text-zinc-500 dark:text-zinc-400 text-xs">
                                            {t.admin?.dashboard?.emptyProjects || 'Tidak ada proyek yang sesuai.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. System Health & Guidelines Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Database & System Infrastructure Status */}
                    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#18181B] border border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                {t.admin?.dashboard?.systemStatusTitle || 'Status Sistem & Keamanan'}
                            </h4>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            {t.admin?.dashboard?.systemStatusDesc || 'Infrastruktur internal STAS-RG berjalan optimal dengan perlindungan WebAuthn.'}
                        </p>
                        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/70 flex items-center justify-between text-[11px]">
                            <span className="text-zinc-500">Database Engine</span>
                            <span className="font-semibold text-slate-900 dark:text-white">MySQL (stasrg_generator)</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                            <span className="text-zinc-500">OTP Mail Service</span>
                            <span className="font-semibold text-slate-900 dark:text-white">Mailpit (127.0.0.1:1025)</span>
                        </div>
                    </div>

                    {/* Quick Guide Card */}
                    <div className="p-5 sm:p-6 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <FileCode className="w-4 h-4 text-[#0D5A34] dark:text-emerald-400" />
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                Panduan Input Proyek
                            </h4>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Admin dapat memasukkan data identitas proyek, skema anggota, dan target luaran. Sistem akan otomatis menyusun dokumen format CoE STAS-RG.
                        </p>
                        <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                28 Standar Template Tersedia
                            </span>
                            <a
                                href="/#how-it-works"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                <span>Pelajari Skema</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
