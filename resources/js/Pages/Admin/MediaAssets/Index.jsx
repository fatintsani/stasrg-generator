import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useApp } from '../../../Context/AppContext';
import { useAlert } from '../../../Context/AlertContext';
import {
    FolderHeart,
    Building2,
    GraduationCap,
    HandCoins,
    Landmark,
    Award,
    ShieldCheck,
    FileCheck,
    Search,
    Plus,
    Copy,
    Check,
    Download,
    Trash2,
    ExternalLink,
    Layers,
    Sparkles,
    Shield,
    Upload,
    X,
    Loader2,
    CheckCircle2,
    RotateCcw,
    ArrowUpDown,
    Filter,
    Pencil,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MediaAssetsIndex({
    assets = { data: [], links: [] },
    stats = {},
    filters = {},
}) {
    const { t } = useApp();
    const { showSuccess, showError, showConfirm } = useAlert();
    const m = t?.mediaAssets || {};

    const [search, setSearch] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState(filters.type || 'all'); // 'all' | 'partner_logo' | 'badge_icon'
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [sort, setSort] = useState(filters.sort || 'created_at');
    const [direction, setDirection] = useState(filters.direction || 'desc');

    // Upload Modal State
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadData, setUploadData] = useState({
        name: '',
        type: 'partner_logo',
        category: 'industry',
        file: null,
        tags: '',
    });
    const [isUploading, setIsUploading] = useState(false);

    // Edit Modal State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [editData, setEditData] = useState({
        id: null,
        name: '',
        type: 'partner_logo',
        category: 'industry',
        file: null,
        tags: '',
        is_verified: true,
        is_system_preset: false,
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const isFilterActive = activeTab !== 'all' || selectedCategory !== 'all' || search !== '' || sort !== 'created_at' || direction !== 'desc';

    // Apply Filter Helper
    const applyFilters = (type = activeTab, cat = selectedCategory, s = search, newSort = sort, newDirection = direction) => {
        router.get(
            '/media-library',
            {
                type: type === 'all' ? undefined : type,
                category: cat === 'all' ? undefined : cat,
                search: s || undefined,
                sort: newSort,
                direction: newDirection,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        setSelectedCategory('all');
        applyFilters(newTab, 'all', search, sort, direction);
    };

    const handleCategoryChange = (newCat) => {
        setSelectedCategory(newCat);
        applyFilters(activeTab, newCat, search, sort, direction);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters(activeTab, selectedCategory, search, sort, direction);
    };

    const handleClearSearch = () => {
        setSearch('');
        applyFilters(activeTab, selectedCategory, '', sort, direction);
    };

    const handleSortChange = (e) => {
        const val = e.target.value;
        const [newSort, newDir] = val.split('-');
        setSort(newSort);
        setDirection(newDir);
        applyFilters(activeTab, selectedCategory, search, newSort, newDir);
    };

    const handleResetFilters = () => {
        setSearch('');
        setActiveTab('all');
        setSelectedCategory('all');
        setSort('created_at');
        setDirection('desc');
        router.get('/media-library', {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleCopyLink = (asset) => {
        const url = asset.resolved_url;
        navigator.clipboard.writeText(url);
        setCopiedId(asset.id);
        showSuccess('Tautan Aset Tersalin', `${asset.name} link berhasil disalin ke clipboard.`);
        setTimeout(() => setCopiedId(null), 2500);
    };

    const handleDownload = (asset) => {
        if (asset.svg_content) {
            const blob = new Blob([asset.svg_content], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${asset.name.toLowerCase().replace(/\s+/g, '-')}.svg`;
            a.click();
            URL.revokeObjectURL(url);
        } else if (asset.resolved_url) {
            const a = document.createElement('a');
            a.href = asset.resolved_url;
            a.download = `${asset.name.toLowerCase().replace(/\s+/g, '-')}`;
            a.target = '_blank';
            a.click();
        }
    };

    const handleDelete = async (asset) => {
        if (asset.is_system_preset) {
            showError('Aksi Ditolak', 'Aset preset sistem resmi tidak dapat dihapus.');
            return;
        }

        const confirmed = await showConfirm({
            title: 'Hapus Aset Media?',
            message: `Apakah Anda yakin ingin menghapus "${asset.name}" dari pustaka aset?`,
            confirmText: 'Hapus Aset',
            cancelText: 'Batal',
            variant: 'danger',
        });

        if (confirmed) {
            router.delete(`/media-library/${asset.id}`, {
                preserveScroll: true,
                onSuccess: () => showSuccess('Aset Dihapus', 'Aset berhasil dihapus dari pustaka.'),
                onError: (err) => showError('Gagal Menghapus', Object.values(err)[0] || 'Terjadi kesalahan.'),
            });
        }
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        if (!uploadData.name) {
            showError('Data Tidak Lengkap', 'Nama aset wajib diisi.');
            return;
        }
        if (!uploadData.file) {
            showError('File Diperlukan', 'Pilih file logo/badge format PNG atau SVG.');
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('name', uploadData.name);
        formData.append('type', uploadData.type);
        formData.append('category', uploadData.category);
        if (uploadData.file) {
            formData.append('file', uploadData.file);
        }

        const tagsArray = uploadData.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
        tagsArray.forEach((tag) => formData.append('tags[]', tag));

        router.post('/media-library', formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsUploading(false);
                setIsUploadOpen(false);
                setUploadData({
                    name: '',
                    type: 'partner_logo',
                    category: 'industry',
                    file: null,
                    tags: '',
                });
                showSuccess('Aset Berhasil Diunggah', 'Aset media baru siap digunakan pada seluruh proyek riset.');
            },
            onError: (err) => {
                setIsUploading(false);
                showError('Gagal Mengunggah Aset', Object.values(err)[0] || 'Periksa kembali file dan data yang diinput.');
            },
        });
    };

    const handleEdit = (asset) => {
        setEditingAsset(asset);
        setEditData({
            id: asset.id,
            name: asset.name || '',
            type: asset.type || 'partner_logo',
            category: asset.category || 'industry',
            file: null,
            svg_content: asset.svg_content || '',
            tags: Array.isArray(asset.tags) ? asset.tags.join(', ') : (asset.tags || ''),
            is_verified: Boolean(asset.is_verified),
            is_system_preset: Boolean(asset.is_system_preset),
        });
        setIsEditOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editData.name) {
            showError('Data Tidak Lengkap', 'Nama aset wajib diisi.');
            return;
        }

        setIsUpdating(true);

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('name', editData.name);
        formData.append('type', editData.type);
        formData.append('category', editData.category);
        formData.append('is_verified', editData.is_verified ? '1' : '0');

        if (editData.file) {
            formData.append('file', editData.file);
        }

        const tagsArray = (editData.tags || '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
        tagsArray.forEach((tag) => formData.append('tags[]', tag));

        router.post(`/media-library/${editingAsset.id}`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsUpdating(false);
                setIsEditOpen(false);
                setEditingAsset(null);
                showSuccess('Aset Berhasil Diperbarui', 'Data aset media berhasil diperbarui.');
            },
            onError: (err) => {
                setIsUpdating(false);
                showError('Gagal Memperbarui Aset', Object.values(err)[0] || 'Periksa kembali data yang diinput.');
            },
        });
    };

    // Sub-Categories depending on Active Tab
    const categoriesForFilter = [
        { id: 'all', label: m.catAll || 'Semua Kategori', icon: Layers },
        ...(activeTab !== 'badge_icon'
            ? [
                  { id: 'industry', label: m.catIndustry || 'Industri', icon: Building2 },
                  { id: 'university', label: m.catUniversity || 'Universitas', icon: GraduationCap },
                  { id: 'grant', label: m.catGrant || 'Lembaga Hibah', icon: HandCoins },
                  { id: 'government', label: m.catGovernment || 'BRIN & Dikti', icon: Landmark },
              ]
            : []),
        ...(activeTab !== 'partner_logo'
            ? [
                  { id: 'accreditation', label: m.catAccreditation || 'Akreditasi', icon: Award },
                  { id: 'patent', label: m.catPatent || 'Paten', icon: ShieldCheck },
                  { id: 'hki', label: m.catHki || 'HKI', icon: FileCheck },
                  { id: 'iso', label: m.catIso || 'Standar ISO', icon: Shield },
              ]
            : []),
    ];

    return (
        <AdminLayout title={m.title || 'Media & Asset Library'} currentPath="/media-library">
            <div className="space-y-6 sm:space-y-8 pb-12">
                {/* 1. TOP HEADER & TITLE (Matching Style Template with Green Badge) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-gradient-to-bl from-[#0AB600]/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                    <div className="space-y-1 z-10 flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-2 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600] shrink-0">
                                <FolderHeart className="w-5 h-5" />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                {m.title || 'Media & Asset Library'}
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                            {m.subtitle ||
                                'Katalog logo partner terverifikasi, icon bank, akreditasi, paten, dan standar ISO resmi untuk dokumen flyer riset.'}
                        </p>
                    </div>

                    {/* Actions Toolbar: Upload Button */}
                    <div className="flex items-center gap-2 z-10 shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsUploadOpen(true)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{m.btnUpload || 'Unggah Aset Baru'}</span>
                        </button>
                    </div>
                </div>

                {/* 2. KPI STATS SUMMARY CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
                        <div className="p-2.5 rounded-xl bg-[#0AB600]/10 text-[#0AB600]">
                            <FolderHeart className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                {stats.total || 0}
                            </div>
                            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                {m.statsTotal || 'Total Aset Terdaftar'}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                {stats.partner_logos || 0}
                            </div>
                            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                {m.statsLogos || 'Logo Partner Resmi'}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                {stats.badge_icons || 0}
                            </div>
                            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                {m.statsBadges || 'Icon & Badge Bank'}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
                        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                {stats.total_usage || 0}
                            </div>
                            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                {m.statsUsage || 'Pemanfaatan Proyek'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. MAIN NAVIGATION TABS & FILTER BAR */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3.5">
                    {/* Primary Tab Switcher */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
                        <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-semibold">
                            {[
                                { id: 'all', label: m.tabAll || 'Semua Aset' },
                                { id: 'partner_logo', label: m.tabPartnerLogos || 'Logo Partner Terverifikasi' },
                                { id: 'badge_icon', label: m.tabBadges || 'Icon & Badge Bank' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'bg-[#0AB600] text-white shadow-2xs font-bold'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search & Sort Controls */}
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            {/* Search Form */}
                            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
                                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={m.searchPlaceholder || 'Cari nama mitra, badge, tags...'}
                                    className="w-full pl-9 pr-14 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0AB600]"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="absolute right-9 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[11px] font-bold bg-[#0AB600] text-white"
                                >
                                    Cari
                                </button>
                            </form>

                            {/* Sort Dropdown */}
                            <select
                                value={`${sort}-${direction}`}
                                onChange={handleSortChange}
                                className="px-2.5 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0AB600] cursor-pointer"
                            >
                                <option value="created_at-desc">Waktu: Terbaru</option>
                                <option value="created_at-asc">Waktu: Terlama</option>
                                <option value="name-asc">Nama (A - Z)</option>
                                <option value="name-desc">Nama (Z - A)</option>
                                <option value="usage_count-desc">Paling Sering Digunakan</option>
                            </select>

                            {/* Reset Button */}
                            {isFilterActive ? (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    title="Reset Filter"
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-colors cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Reset</span>
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {/* Sub-Category Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {categoriesForFilter.map((cat) => {
                            const Icon = cat.icon;
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                                        isSelected
                                            ? 'bg-[#0AB600] text-white shadow-2xs font-bold'
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Result Counter & Active Badge */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="text-zinc-500 dark:text-zinc-400">
                            Menampilkan <span className="font-semibold text-slate-900 dark:text-white">{assets.from || 0}</span> - <span className="font-semibold text-slate-900 dark:text-white">{assets.to || 0}</span> dari <span className="font-semibold text-slate-900 dark:text-white">{assets.total || 0}</span> aset pustaka
                        </div>
                        {isFilterActive && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#0AB600]/10 text-[#0AB600] text-[11px] font-semibold border border-[#0AB600]/30">
                                <Filter className="w-3 h-3 text-[#0AB600]" />
                                <span>Filter & Urutan Aktif</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. ASSET CARDS GRID */}
                {assets.data && assets.data.length > 0 ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {assets.data.map((asset) => (
                                <div
                                    key={asset.id}
                                    className="group p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-[#0AB600]/50 transition-all flex flex-col justify-between overflow-hidden"
                                >
                                    <div>
                                        {/* Preview Container Box */}
                                        <div className="w-full h-24 rounded-xl flex items-center justify-center p-3 mb-3 border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 transition-colors relative overflow-hidden">
                                            {asset.svg_content ? (
                                                <div
                                                    className="w-full h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:w-auto [&>svg]:h-auto object-contain"
                                                    dangerouslySetInnerHTML={{ __html: asset.svg_content }}
                                                />
                                            ) : asset.resolved_url ? (
                                                <img
                                                    src={asset.resolved_url}
                                                    alt={asset.name}
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            ) : (
                                                <FolderHeart className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                                            )}

                                            {/* Verified Tag in Top Corner */}
                                            {asset.is_verified && (
                                                <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[9px] font-extrabold text-[#0AB600] bg-[#0AB600]/15/90 dark:bg-[#0AB600]/10 px-1.5 py-0.5 rounded-full backdrop-blur-xs border border-[#0AB600]/30">
                                                    <Check className="w-2.5 h-2.5" /> Resmi
                                                </span>
                                            )}
                                        </div>

                                        {/* Title & Metadata */}
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#0AB600] dark:group-hover:text-[#0AB600] transition-colors">
                                            {asset.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                {asset.category}
                                            </span>
                                            {asset.is_system_preset ? (
                                                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded">
                                                    Preset
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded">
                                                    Custom
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons Toolbar */}
                                    <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleCopyLink(asset)}
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-[#0AB600] dark:hover:text-[#0AB600] transition cursor-pointer p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                            title="Salin Tautan Aset"
                                        >
                                            {copiedId === asset.id ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-[#0AB600]" />
                                                    <span className="text-[#0AB600] font-bold">Tersalin</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    <span>Salin Link</span>
                                                </>
                                            )}
                                        </button>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(asset)}
                                                className="p-1.5 text-zinc-400 hover:text-[#0AB600] dark:hover:text-[#0AB600] rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                                                title="Edit Data Aset"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDownload(asset)}
                                                className="p-1.5 text-zinc-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                                                title="Unduh File Aset"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                            </button>

                                            {!asset.is_system_preset && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(asset)}
                                                    className="p-1.5 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                                    title="Hapus Aset"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Links */}
                        {assets.links && assets.links.length > 3 && (
                            <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Halaman <span className="font-semibold">{assets.current_page}</span> dari <span className="font-semibold">{assets.last_page}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {assets.links.map((link, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
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
                ) : (
                    /* Empty State */
                    <div className="py-16 p-8 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 text-center space-y-3">
                        <img
                            src="/assets/img/icon/notfound.png"
                            alt="Tidak Ada Aset"
                            className="w-28 sm:w-32 h-auto object-contain mx-auto drop-shadow-xs"
                        />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {m.emptyTitle || 'Belum Ada Aset Ditemukan'}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                            {m.emptyDesc || 'Tidak ada logo atau badge yang cocok dengan kriteria filter pencarian Anda.'}
                        </p>
                    </div>
                )}

                {/* 5. UPLOAD ASSET MODAL */}
                <AnimatePresence>
                    {isUploadOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-[#101726] rounded-3xl border border-zinc-200/80 dark:border-zinc-800 w-full max-w-lg shadow-2xl overflow-hidden"
                            >
                                <div className="px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-xl bg-[#0AB600]/10 text-[#0AB600]">
                                            <Upload className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                            {m.modalUploadTitle || 'Unggah Aset Media Baru'}
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsUploadOpen(false)}
                                        className="p-1.5 rounded-lg text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                            {m.inputName || 'Nama Mitra / Badge'} <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={uploadData.name}
                                            onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                                            placeholder={m.inputNamePlaceholder || 'Contoh: PT Telkom Indonesia'}
                                            className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                                {m.inputType || 'Tipe Aset'}
                                            </label>
                                            <select
                                                value={uploadData.type}
                                                onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                                            >
                                                <option value="partner_logo">Logo Partner</option>
                                                <option value="badge_icon">Icon & Badge</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                                {m.inputCategory || 'Kategori'}
                                            </label>
                                            <select
                                                value={uploadData.category}
                                                onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                                            >
                                                <option value="industry">Industri</option>
                                                <option value="university">Universitas</option>
                                                <option value="grant">Lembaga Hibah</option>
                                                <option value="government">BRIN / Dikti</option>
                                                <option value="accreditation">Akreditasi</option>
                                                <option value="patent">Paten</option>
                                                <option value="hki">HKI</option>
                                                <option value="iso">Standar ISO</option>
                                                <option value="other">Lainnya</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                            {m.inputFile || 'File Logo / Badge (PNG / SVG)'} <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="file"
                                            required
                                            accept="image/png,image/svg+xml,image/webp,image/jpeg"
                                            onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
                                            className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0AB600]/10 file:text-[#0AB600] dark:file:bg-[#0AB600]/10 dark:file:text-[#0AB600] cursor-pointer"
                                        />
                                        <p className="text-[10px] text-zinc-500 mt-1">
                                            {m.inputFileHint || 'Format PNG transparan atau SVG resolusi tinggi (maks. 3MB)'}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                            {m.inputTags || 'Tags Pencarian'}
                                        </label>
                                        <input
                                            type="text"
                                            value={uploadData.tags}
                                            onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                                            placeholder={m.inputTagsPlaceholder || 'telkom, bumn, telekomunikasi'}
                                            className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                                        />
                                    </div>

                                    <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <button
                                            type="button"
                                            onClick={() => setIsUploadOpen(false)}
                                            disabled={isUploading}
                                            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                                        >
                                            {m.btnCancel || 'Batal'}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isUploading}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>{m.saving || 'Menyimpan...'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span>{m.btnSave || 'Simpan ke Pustaka'}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* 6. EDIT ASSET MODAL */}
                <AnimatePresence>
                    {isEditOpen && editingAsset && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-[#101726] rounded-3xl border border-zinc-200/80 dark:border-zinc-800 w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                            >
                                <div className="px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-xl bg-[#0AB600]/10 text-[#0AB600]">
                                            <Pencil className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                                {m.modalEditTitle || 'Edit Data Aset Media'}
                                            </h3>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                                {editingAsset.name}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditOpen(false)}
                                        className="p-1.5 rounded-lg text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                                    {/* Asset Current Preview */}
                                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center p-2 overflow-hidden shrink-0">
                                            {editingAsset.svg_content ? (
                                                <div
                                                    className="w-full h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:w-auto [&>svg]:h-auto object-contain"
                                                    dangerouslySetInnerHTML={{ __html: editingAsset.svg_content }}
                                                />
                                            ) : editingAsset.resolved_url ? (
                                                <img
                                                    src={editingAsset.resolved_url}
                                                    alt={editingAsset.name}
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            ) : (
                                                <FolderHeart className="w-8 h-8 text-zinc-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                                    Pratinjau Saat Ini
                                                </span>
                                                {editingAsset.is_system_preset ? (
                                                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded">
                                                        Preset Sistem
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-bold text-zinc-600 bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.2 rounded">
                                                        Custom
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {editingAsset.name}
                                            </p>
                                            <p className="text-[11px] text-zinc-400">
                                                Pemanfaatan: {editingAsset.usage_count || 0} kali
                                            </p>
                                        </div>
                                    </div>

                                    {/* Asset Name */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                            {m.inputName || 'Nama Mitra / Badge'} <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            placeholder={m.inputNamePlaceholder || 'Contoh: PT Telkom Indonesia'}
                                            className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]"
                                        />
                                    </div>

                                    {/* Type and Category */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                                {m.inputType || 'Tipe Aset'}
                                            </label>
                                            <select
                                                value={editData.type}
                                                onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                                            >
                                                <option value="partner_logo">Logo Partner</option>
                                                <option value="badge_icon">Icon & Badge</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                                {m.inputCategory || 'Kategori'}
                                            </label>
                                            <select
                                                value={editData.category}
                                                onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                                            >
                                                <option value="industry">Industri</option>
                                                <option value="university">Universitas</option>
                                                <option value="grant">Lembaga Hibah</option>
                                                <option value="government">BRIN / Dikti</option>
                                                <option value="accreditation">Akreditasi</option>
                                                <option value="patent">Paten</option>
                                                <option value="hki">HKI</option>
                                                <option value="iso">Standar ISO</option>
                                                <option value="other">Lainnya</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Optional File Replacement */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                            {m.inputFileEdit || 'Ganti File Logo / Badge (Opsional)'}
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/png,image/svg+xml,image/webp,image/jpeg"
                                            onChange={(e) => setEditData({ ...editData, file: e.target.files[0] })}
                                            className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0AB600]/10 file:text-[#0AB600] dark:file:bg-[#0AB600]/10 dark:file:text-[#0AB600] cursor-pointer"
                                        />
                                        <p className="text-[10px] text-zinc-500 mt-1">
                                            Kosongkan jika tidak ingin mengubah file aset saat ini (PNG/SVG maks 3MB).
                                        </p>
                                    </div>

                                    {/* Tags */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                            {m.inputTags || 'Tags Pencarian'}
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.tags}
                                            onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                                            placeholder={m.inputTagsPlaceholder || 'telkom, bumn, telekomunikasi'}
                                            className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                                        />
                                    </div>

                                    {/* Verification Checkbox */}
                                    <div className="pt-2">
                                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-zinc-200 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={editData.is_verified}
                                                onChange={(e) => setEditData({ ...editData, is_verified: e.target.checked })}
                                                className="rounded border-zinc-300 dark:border-zinc-700 text-[#0AB600] focus:ring-[#0AB600]"
                                            />
                                            <span>Tandai sebagai Aset Resmi & Terverifikasi</span>
                                        </label>
                                    </div>

                                    {/* Submit / Cancel Footer */}
                                    <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditOpen(false)}
                                            disabled={isUpdating}
                                            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                                        >
                                            {m.btnCancel || 'Batal'}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isUpdating}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                                        >
                                            {isUpdating ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>Menyimpan Perubahan...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span>Simpan Perubahan</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </AdminLayout>
    );
}
