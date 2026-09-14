import React, { useState, useEffect } from 'react';
import {
    X,
    Search,
    Check,
    FolderHeart,
    Building2,
    GraduationCap,
    HandCoins,
    Landmark,
    Award,
    Sparkles,
    ShieldCheck,
    FileCheck,
    Layers,
    Loader2,
    Filter,
} from 'lucide-react';
import axios from 'axios';

export default function AssetPickerModal({
    isOpen,
    onClose,
    onSelectAsset,
    type = 'partner_logo', // 'partner_logo' | 'badge_icon' | 'all'
    title = 'Pilih dari Media & Asset Library',
}) {
    if (!isOpen) return null;

    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        { id: 'all', label: 'Semua Kategori', icon: Layers },
        { id: 'industry', label: 'Industri', icon: Building2 },
        { id: 'university', label: 'Universitas', icon: GraduationCap },
        { id: 'grant', label: 'Lembaga Hibah', icon: HandCoins },
        { id: 'government', label: 'BRIN & Dikti', icon: Landmark },
        { id: 'accreditation', label: 'Akreditasi', icon: Award },
        { id: 'patent', label: 'Paten', icon: ShieldCheck },
        { id: 'hki', label: 'HKI', icon: FileCheck },
        { id: 'iso', label: 'Standar ISO', icon: ShieldCheck },
    ];

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const params = {};
            if (type !== 'all') params.type = type;
            if (selectedCategory !== 'all') params.category = selectedCategory;
            if (search) params.search = search;

            const res = await axios.get('/api/media-assets', { params });
            if (res.data?.success) {
                setAssets(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch media assets:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, [type, selectedCategory]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchAssets();
    };

    const handleSelect = (asset) => {
        if (onSelectAsset) {
            onSelectAsset(asset);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#101726] rounded-3xl border border-zinc-200/80 dark:border-zinc-800 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50/70 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600]">
                            <FolderHeart className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>{title}</span>
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#0AB600]/15 dark:bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30">
                                    Resmi & Terverifikasi
                                </span>
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Pilih logo mitra atau badge berkualitas tinggi untuk langsung disematkan ke dokumen.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Tutup Modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 space-y-3 bg-white dark:bg-[#121824]">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <form onSubmit={handleSearchSubmit} className="relative w-full">
                            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari logo mitra, brand, atau badge..."
                                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0AB600]"
                            />
                        </form>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
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
                </div>

                {/* Assets Grid Content */}
                <div className="flex-1 p-5 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-[#0AB600]" />
                            <span className="text-xs font-medium">Memuat katalog aset resmi...</span>
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="py-14 text-center space-y-2 flex flex-col items-center justify-center">
                            <img
                                src="/assets/img/icon/notfound.png"
                                alt="Tidak Ada Aset"
                                className="w-24 sm:w-28 h-auto object-contain mx-auto mb-2 drop-shadow-xs"
                            />
                            <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Belum Ada Aset Ditemukan</h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                                Tidak ada logo atau badge yang cocok dengan kriteria filter pencarian Anda.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                            {assets.map((asset) => (
                                <button
                                    key={asset.id}
                                    type="button"
                                    onClick={() => handleSelect(asset)}
                                    className="group text-left p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#121824] hover:border-[#0AB600] dark:hover:border-[#0AB600] hover:shadow-md transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden"
                                >
                                    <div>
                                        {/* Visual Preview Box */}
                                        <div className="w-full h-20 rounded-xl flex items-center justify-center p-2 mb-2.5 transition-colors border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
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
                                                <FolderHeart className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                                            )}
                                        </div>

                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#0AB600] dark:group-hover:text-[#0AB600] transition-colors">
                                            {asset.name}
                                        </h4>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 capitalize">
                                                {asset.category}
                                            </span>
                                            {asset.is_verified && (
                                                <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-[#0AB600] bg-[#0AB600]/10 px-1.5 py-0.2 rounded">
                                                    <Check className="w-2.5 h-2.5" /> Resmi
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Hover Indicator */}
                                    <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-bold text-[#0AB600]">
                                        <span>Gunakan Aset</span>
                                        <Check className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
