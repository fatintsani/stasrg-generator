import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useApp } from '../../../Context/AppContext';
import { useAlert } from '../../../Context/AlertContext';
import {
    Activity,
    Shield,
    FolderKanban,
    Users,
    Download,
    Cpu,
    Search,
    Calendar,
    DownloadCloud,
    Trash2,
    Clock,
    User,
    Globe,
    FileText,
    ChevronRight,
    X,
    Filter,
    CheckCircle2,
    AlertCircle,
    Info,
    RotateCcw,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';

export default function ActivityLogsIndex({ logs = { data: [], links: [] }, stats = {}, filters = {} }) {
    const { t } = useApp();
    const { showConfirm, showSuccess } = useAlert();

    const a = t?.activityLogs || {};

    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [sort, setSort] = useState(filters.sort || 'created_at');
    const [direction, setDirection] = useState(filters.direction || 'desc');

    // Metadata Detail Modal
    const [selectedLog, setSelectedLog] = useState(null);

    // Prune Modal
    const [isPruning, setIsPruning] = useState(false);
    const [pruneDays, setPruneDays] = useState(60);

    const isFilterActive = typeFilter !== 'all' || search !== '' || dateFrom !== '' || dateTo !== '' || sort !== 'created_at' || direction !== 'desc';

    const applyFilters = (newType = typeFilter, newSearch = search, newDateFrom = dateFrom, newDateTo = dateTo, newSort = sort, newDirection = direction) => {
        router.get(
            '/activity-logs',
            {
                type: newType !== 'all' ? newType : undefined,
                search: newSearch || undefined,
                date_from: newDateFrom || undefined,
                date_to: newDateTo || undefined,
                sort: newSort,
                direction: newDirection,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters(typeFilter, search, dateFrom, dateTo, sort, direction);
    };

    const handleClearSearch = () => {
        setSearch('');
        applyFilters(typeFilter, '', dateFrom, dateTo, sort, direction);
    };

    const handleTypeChange = (type) => {
        setTypeFilter(type);
        applyFilters(type, search, dateFrom, dateTo, sort, direction);
    };

    const handleSortChange = (e) => {
        const val = e.target.value;
        const [newSort, newDir] = val.split('-');
        setSort(newSort);
        setDirection(newDir);
        applyFilters(typeFilter, search, dateFrom, dateTo, newSort, newDir);
    };

    const handleSortColumn = (column) => {
        const newDirection = sort === column && direction === 'asc' ? 'desc' : 'asc';
        setSort(column);
        setDirection(newDirection);
        applyFilters(typeFilter, search, dateFrom, dateTo, column, newDirection);
    };

    const renderSortIcon = (column) => {
        if (sort !== column) {
            return <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 opacity-60" />;
        }
        return direction === 'asc' ? (
            <ArrowUp className="w-3.5 h-3.5 text-[#0AB600]" />
        ) : (
            <ArrowDown className="w-3.5 h-3.5 text-[#0AB600]" />
        );
    };

    const handleResetFilters = () => {
        setSearch('');
        setTypeFilter('all');
        setDateFrom('');
        setDateTo('');
        setSort('created_at');
        setDirection('desc');
        router.get('/activity-logs', {}, { preserveState: true, replace: true });
    };

    const handlePruneLogs = async () => {
        const title = a.actions?.confirmPruneTitle || 'Bersihkan Log Lama?';
        const message = (a.actions?.confirmPruneMsg || 'Apakah Anda yakin ingin menghapus catatan log yang berusia lebih dari {days} hari? Tindakan ini tidak dapat dibatalkan.')
            .replace('{days}', pruneDays);
        const confirmText = a.actions?.confirmPruneBtn || 'Bersihkan Log';
        const cancelText = a.actions?.confirmPruneCancel || 'Batal';

        const confirmed = await showConfirm({
            title,
            message,
            confirmText,
            cancelText,
            variant: 'danger',
        });

        if (confirmed) {
            router.post('/activity-logs/prune', { days: pruneDays }, {
                onSuccess: () => {
                    setIsPruning(false);
                }
            });
        }
    };

    // Category styling & icons helper
    const getCategoryConfig = (type) => {
        switch (type) {
            case 'auth':
                return {
                    label: 'Auth & Security',
                    icon: Shield,
                    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/80',
                    dot: 'bg-indigo-500',
                };
            case 'project':
                return {
                    label: 'Project Change',
                    icon: FolderKanban,
                    bg: 'bg-[#0AB600]/10 text-[#0AB600] border-[#0AB600]/30 dark:bg-[#0AB600]/10 dark:text-[#0AB600] dark:border-[#0AB600]/30',
                    dot: 'bg-[#0AB600]',
                };
            case 'user':
                return {
                    label: 'User Audit',
                    icon: Users,
                    bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/80',
                    dot: 'bg-purple-500',
                };
            case 'export':
                return {
                    label: 'Export & Print',
                    icon: Download,
                    bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80',
                    dot: 'bg-amber-500',
                };
            case 'system':
                return {
                    label: 'System Operation',
                    icon: Cpu,
                    bg: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/80',
                    dot: 'bg-sky-500',
                };
            default:
                return {
                    label: type || 'General',
                    icon: Activity,
                    bg: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
                    dot: 'bg-zinc-400',
                };
        }
    };

    const filterTabs = [
        { id: 'all', label: a.filters?.all || 'Semua Log', count: stats.total || 0, icon: Activity },
        { id: 'auth', label: a.filters?.auth || 'Autentikasi', count: stats.auth || 0, icon: Shield },
        { id: 'project', label: a.filters?.project || 'Proyek Riset', count: stats.project || 0, icon: FolderKanban },
        { id: 'export', label: a.filters?.export || 'Ekspor & Cetak', count: stats.export || 0, icon: Download },
        { id: 'user', label: a.filters?.user || 'Manajemen User', count: stats.user || 0, icon: Users },
        { id: 'system', label: a.filters?.system || 'Sistem', icon: Cpu },
    ];

    return (
        <AdminLayout
            title={a.title || 'Activity & Audit Logs'}
            currentPath="/activity-logs"
        >
            <div className="space-y-6">
                {/* Header Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-2 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600] shrink-0">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {a.title || 'Activity & Audit Logs'}
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
                            {a.subtitle || 'Pemantauan real-time riwayat perubahan proyek, log autentikasi keamanan, audit persetujuan user, dan histori ekspor deliverable.'}
                        </p>
                    </div>

                    {/* Top Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Export CSV Button */}
                        <a
                            href={`/activity-logs/export-csv?type=${typeFilter}&search=${encodeURIComponent(search)}&date_from=${dateFrom}&date_to=${dateTo}`}
                            download
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm transition-all cursor-pointer"
                        >
                            <DownloadCloud className="w-4 h-4 text-[#0AB600]" />
                            <span>{a.actions?.exportCsv || 'Ekspor CSV'}</span>
                        </a>

                        {/* Prune Logs Button */}
                        <button
                            type="button"
                            onClick={() => setIsPruning(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-950/70 transition-all cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{a.actions?.pruneOld || 'Pembersihan'}</span>
                        </button>
                    </div>
                </div>

                {/* Stat Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                {a.stats?.totalLogs || 'Total Aktivitas'}
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                                <Activity className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                            {Number(stats.total || 0).toLocaleString()}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-[#0AB600] font-medium">
                            <span>+{stats.today || 0} hari ini</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                {a.stats?.authLogs || 'Log Autentikasi'}
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Shield className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-black text-indigo-600 dark:text-indigo-400">
                            {Number(stats.auth || 0).toLocaleString()}
                        </div>
                        <div className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                            Login, Passkey, OAuth, OTP
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                {a.stats?.projectLogs || 'Perubahan Proyek'}
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-[#0AB600]/10 flex items-center justify-center text-[#0AB600]">
                                <FolderKanban className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-black text-[#0AB600]">
                            {Number(stats.project || 0).toLocaleString()}
                        </div>
                        <div className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                            Create, Edit, Delete, Duplicate
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                {a.stats?.exportLogs || 'Ekspor & Cetak'}
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <Download className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
                            {Number(stats.export || 0).toLocaleString()}
                        </div>
                        <div className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                            Flyer PNG, PDF, & Print
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar Section */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
                    {/* Category Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {filterTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = typeFilter === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleTypeChange(tab.id)}
                                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30 shadow-sm'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                                    }`}
                                >
                                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0AB600]' : 'text-zinc-400'}`} />
                                    <span>{tab.label}</span>
                                    {tab.count !== undefined && (
                                        <span className={`px-1.5 py-0.5 text-[10px] rounded-md font-extrabold ${
                                            isActive
                                                ? 'bg-[#0AB600]/15 dark:bg-[#0AB600]/15 text-[#0AB600]'
                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search & Date Filter Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        {/* Search Input */}
                        <form onSubmit={handleSearchSubmit} className="md:col-span-4 relative">
                            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={a.filters?.searchPlaceholder || 'Cari deskripsi, user, email, aksi, atau IP...'}
                                className="w-full pl-9 pr-20 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600]"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-12 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#0AB600] hover:bg-[#0B4A2B] text-white shadow-xs transition-colors cursor-pointer"
                            >
                                Cari
                            </button>
                        </form>

                        {/* Sort Selector Dropdown */}
                        <div className="md:col-span-3 relative">
                            <select
                                value={`${sort}-${direction}`}
                                onChange={handleSortChange}
                                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600] cursor-pointer"
                            >
                                <option value="created_at-desc">Waktu: Terbaru</option>
                                <option value="created_at-asc">Waktu: Terlama</option>
                                <option value="action-asc">Aksi (A - Z)</option>
                                <option value="action-desc">Aksi (Z - A)</option>
                                <option value="log_type-asc">Kategori (A - Z)</option>
                                <option value="user-asc">User (A - Z)</option>
                                <option value="ip_address-asc">IP Address (A - Z)</option>
                            </select>
                        </div>

                        {/* Date From */}
                        <div className="md:col-span-2 relative">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => {
                                    setDateFrom(e.target.value);
                                    applyFilters(typeFilter, search, e.target.value, dateTo, sort, direction);
                                }}
                                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600]"
                                title={a.filters?.dateFrom || 'Dari Tanggal'}
                            />
                        </div>

                        {/* Date To */}
                        <div className="md:col-span-2 relative">
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => {
                                    setDateTo(e.target.value);
                                    applyFilters(typeFilter, search, dateFrom, e.target.value, sort, direction);
                                }}
                                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600]"
                                title={a.filters?.dateTo || 'Sampai Tanggal'}
                            />
                        </div>

                        {/* Reset Filter Button */}
                        <div className="md:col-span-1 flex justify-end">
                            {isFilterActive ? (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    title="Reset Semua Filter"
                                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Reset</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 cursor-not-allowed opacity-60"
                                    disabled
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Reset</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Result Counter & Active Filter Badge */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="text-zinc-500 dark:text-zinc-400">
                            Menampilkan <span className="font-semibold text-slate-900 dark:text-white">{logs.from || 0}</span> - <span className="font-semibold text-slate-900 dark:text-white">{logs.to || 0}</span> dari <span className="font-semibold text-slate-900 dark:text-white">{logs.total || 0}</span> catatan log
                        </div>
                        {isFilterActive && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0AB600]/10 text-[#0AB600] text-[11px] font-semibold border border-[#0AB600]/30">
                                <Filter className="w-3 h-3 text-[#0AB600]" />
                                <span>Filter & Urutan Aktif</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Audit Logs Table */}
                <div className="bg-white dark:bg-[#101622] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/50 text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    <th className="py-3.5 px-4">
                                        <button
                                            type="button"
                                            onClick={() => handleSortColumn('created_at')}
                                            className="inline-flex items-center gap-1.5 hover:text-[#0AB600] dark:hover:text-[#0AB600] transition cursor-pointer"
                                        >
                                            <span>{a.table?.timestamp || 'Waktu & Tanggal'}</span>
                                            {renderSortIcon('created_at')}
                                        </button>
                                    </th>
                                    <th className="py-3.5 px-4">
                                        <button
                                            type="button"
                                            onClick={() => handleSortColumn('user')}
                                            className="inline-flex items-center gap-1.5 hover:text-[#0AB600] dark:hover:text-[#0AB600] transition cursor-pointer"
                                        >
                                            <span>{a.table?.user || 'Pengguna'}</span>
                                            {renderSortIcon('user')}
                                        </button>
                                    </th>
                                    <th className="py-3.5 px-4">
                                        <button
                                            type="button"
                                            onClick={() => handleSortColumn('log_type')}
                                            className="inline-flex items-center gap-1.5 hover:text-[#0AB600] dark:hover:text-[#0AB600] transition cursor-pointer"
                                        >
                                            <span>{a.table?.category || 'Kategori'}</span>
                                            {renderSortIcon('log_type')}
                                        </button>
                                    </th>
                                    <th className="py-3.5 px-4">
                                        <button
                                            type="button"
                                            onClick={() => handleSortColumn('action')}
                                            className="inline-flex items-center gap-1.5 hover:text-[#0AB600] dark:hover:text-[#0AB600] transition cursor-pointer"
                                        >
                                            <span>{a.table?.action || 'Aksi & Deskripsi'}</span>
                                            {renderSortIcon('action')}
                                        </button>
                                    </th>
                                    <th className="py-3.5 px-4">
                                        <button
                                            type="button"
                                            onClick={() => handleSortColumn('ip_address')}
                                            className="inline-flex items-center gap-1.5 hover:text-[#0AB600] dark:hover:text-[#0AB600] transition cursor-pointer"
                                        >
                                            <span>{a.table?.ipDevice || 'IP & Perangkat'}</span>
                                            {renderSortIcon('ip_address')}
                                        </button>
                                    </th>
                                    <th className="py-3.5 px-4 text-right">{a.table?.details || 'Metadata'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                                {logs.data && logs.data.length > 0 ? (
                                    logs.data.map((log) => {
                                        const config = getCategoryConfig(log.log_type);
                                        const CategoryIcon = config.icon;
                                        return (
                                            <tr
                                                key={log.id}
                                                className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                                            >
                                                {/* Timestamp */}
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-slate-900 dark:text-white">
                                                            {log.created_at}
                                                        </span>
                                                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 mt-0.5">
                                                            <Clock className="w-3 h-3" />
                                                            {log.created_at_relative}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* User Info */}
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    {log.user ? (
                                                        <div className="flex items-center gap-2.5">
                                                            {log.user.avatar_url ? (
                                                                <img
                                                                    src={log.user.avatar_url}
                                                                    alt={log.user.name}
                                                                    className="w-7 h-7 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-7 h-7 rounded-full bg-[#0AB600]/15 dark:bg-[#0AB600]/10 text-[#0AB600] font-bold text-xs flex items-center justify-center shrink-0">
                                                                    {log.user.name ? log.user.name.charAt(0).toUpperCase() : 'U'}
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-900 dark:text-white leading-tight">
                                                                    {log.user.name}
                                                                </span>
                                                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight">
                                                                    {log.user.email}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 italic">
                                                            <User className="w-3.5 h-3.5" />
                                                            <span>{a.table?.systemGuest || 'Sistem / Tamu'}</span>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Category Badge */}
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${config.bg}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                                                        <CategoryIcon className="w-3 h-3" />
                                                        {config.label}
                                                    </span>
                                                </td>

                                                {/* Description & Action */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex flex-col max-w-md">
                                                        <span className="font-semibold text-slate-800 dark:text-zinc-200 leading-snug">
                                                            {log.description}
                                                        </span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                                                                {log.action}
                                                            </span>
                                                            {log.subject_type && (
                                                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                                                                    Target: {log.subject_type} #{log.subject_id}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* IP & User Agent */}
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                                            <Globe className="w-3 h-3 text-zinc-400" />
                                                            {log.ip_address || '-'}
                                                        </span>
                                                        {log.user_agent && (
                                                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate max-w-[160px]" title={log.user_agent}>
                                                                {log.user_agent}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Metadata Inspect Button */}
                                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                    {log.properties ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedLog(log)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                                                        >
                                                            <FileText className="w-3 h-3 text-[#0AB600]" />
                                                            <span>Detail</span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-[11px] text-zinc-400 dark:text-zinc-600">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                                <img
                                                    src="/assets/img/icon/notfound.png"
                                                    alt="Tidak Ada Log"
                                                    className="w-24 sm:w-28 h-auto object-contain mx-auto mb-3 drop-shadow-xs"
                                                />
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {a.table?.emptyTitle || 'Tidak Ada Log Ditemukan'}
                                                </h3>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                                    {a.table?.emptyDesc || 'Belum ada aktivitas yang cocok dengan parameter filter yang dipilih.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links */}
                    {logs.links && logs.links.length > 3 && (
                        <div className="px-4 py-3 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                Menampilkan <span className="font-semibold">{logs.from || 0}</span> - <span className="font-semibold">{logs.to || 0}</span> dari <span className="font-semibold">{logs.total || 0}</span> catatan log
                            </div>
                            <div className="flex items-center gap-1">
                                {logs.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                            link.active
                                                ? 'bg-[#0AB600] text-white'
                                                : link.url
                                                ? 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                                : 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Metadata Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#101622] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-[#0AB600]/15 dark:bg-[#0AB600]/10 text-[#0AB600] flex items-center justify-center">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        {a.table?.metadataModalTitle || 'Detail Metadata Log'}
                                    </h3>
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                                        Log #{selectedLog.id} • {selectedLog.action}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Description Summary */}
                            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
                                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                                    Deskripsi Aktivitas
                                </span>
                                <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                                    {selectedLog.description}
                                </p>
                            </div>

                            {/* User & Client Info */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
                                        Pengguna
                                    </span>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {selectedLog.user ? selectedLog.user.name : 'Sistem / Tamu'}
                                    </span>
                                </div>
                                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
                                        IP Address
                                    </span>
                                    <span className="font-mono text-slate-900 dark:text-white">
                                        {selectedLog.ip_address || '-'}
                                    </span>
                                </div>
                            </div>

                            {/* JSON Payload Inspector */}
                            <div>
                                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">
                                    Payload JSON Properties
                                </span>
                                <pre className="p-3.5 rounded-xl bg-zinc-900 dark:bg-black text-[#0AB600] font-mono text-[11px] leading-relaxed overflow-x-auto border border-zinc-800 max-h-56">
                                    {JSON.stringify(selectedLog.properties, null, 2)}
                                </pre>
                            </div>

                            {/* User Agent Full */}
                            {selectedLog.user_agent && (
                                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
                                        User Agent Client
                                    </span>
                                    <p className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 break-all">
                                        {selectedLog.user_agent}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0AB600] hover:bg-[#0B4A2B] text-white shadow-xs transition-colors cursor-pointer"
                            >
                                {a.table?.closeModal || 'Tutup'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Prune Logs Configuration Modal */}
            {isPruning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#101622] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                                <Trash2 className="w-4 h-4" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    {a.actions?.pruneOld || 'Pembersihan Log Audit'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPruning(false)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                Pilih rentang usia log audit yang ingin dibersihkan dari basis data untuk menghemat penyimpanan:
                            </p>

                            <div className="space-y-2">
                                {[
                                    { days: 30, label: a.actions?.prune30Days || 'Lebih dari 30 Hari' },
                                    { days: 60, label: a.actions?.prune60Days || 'Lebih dari 60 Hari (Direkomendasikan)' },
                                    { days: 90, label: a.actions?.prune90Days || 'Lebih dari 90 Hari' },
                                    { days: 180, label: 'Lebih dari 180 Hari (6 Bulan)' },
                                ].map((option) => (
                                    <label
                                        key={option.days}
                                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                                            pruneDays === option.days
                                                ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-300'
                                                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-zinc-300'
                                        }`}
                                    >
                                        <span>{option.label}</span>
                                        <input
                                            type="radio"
                                            name="prune_days"
                                            value={option.days}
                                            checked={pruneDays === option.days}
                                            onChange={() => setPruneDays(option.days)}
                                            className="text-rose-600 focus:ring-rose-500"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsPruning(false)}
                                className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                {a.actions?.confirmPruneCancel || 'Batal'}
                            </button>
                            <button
                                type="button"
                                onClick={handlePruneLogs}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors cursor-pointer"
                            >
                                {a.actions?.confirmPruneBtn || 'Hapus Log Lama'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
