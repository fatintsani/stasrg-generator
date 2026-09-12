import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useAlert } from '../../../Context/AlertContext';
import ProjectPreview from '../../../Components/Admin/ProjectPreview';
import RichTextEditor from '../../../Components/Admin/RichTextEditor';
import {
    ArrowLeft,
    Save,
    Upload,
    Image as ImageIcon,
    Layers,
    CheckCircle2,
    Wrench,
    Lightbulb,
    QrCode,
    Globe,
    FolderKanban,
    AlertCircle,
    Eye,
    RefreshCw,
    Building2,
    Trash2
} from 'lucide-react';

function InstagramIcon({ className = "w-3.5 h-3.5" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
    );
}

function YoutubeIcon({ className = "w-3.5 h-3.5" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
            <polygon points="10 15 15 12 10 9 10 15"/>
        </svg>
    );
}

const CATEGORIES = [
    'Smart Agriculture',
    'Internet of Things (IoT)',
    'Aviation & AI',
    'Cybersecurity',
    'Telecommunication',
    'Renewable Energy',
    'Healthcare Tech',
    'Robotics & Automation',
];

export default function Form({ project = null }) {
    const isEditing = !!project;
    const { showError, showSuccess } = useAlert();

    // Normalizing initial values from project if editing
    const initialBenefits = project?.benefits
        ? (typeof project.benefits === 'string' ? JSON.parse(project.benefits) : project.benefits)
        : { title: 'MANFAAT', content: '' };

    const initialSpecs = project?.specifications
        ? (typeof project.specifications === 'string' ? JSON.parse(project.specifications) : project.specifications)
        : { title: 'SPESIFIKASI', content: '' };

    const initialPS = project?.problem_solution
        ? (typeof project.problem_solution === 'string' ? JSON.parse(project.problem_solution) : project.problem_solution)
        : { title: 'PROBLEM–SOLUTION', problem: '', solution: '' };

    const { data, setData, post, processing, errors, progress } = useForm({
        name: project?.name || '',
        category: project?.category || 'Smart Agriculture',
        title: project?.title || '',
        subtitle: project?.subtitle || '',
        description: project?.description || '',
        main_image: null,
        partner_logo: null,
        remove_partner_logo: false,
        benefits: initialBenefits,
        specifications: initialSpecs,
        problem_solution: initialPS,
        project_url: project?.project_url || '',
        footer_website: project?.footer_website || 'tel-u.ac.id/stasrg',
        footer_instagram: project?.footer_instagram || '@stas.rg',
        footer_youtube: project?.footer_youtube || '@stas_rg',
        status: project?.status || 'published',
        _method: isEditing ? 'PUT' : 'POST',
    });

    // Preview state for uploaded main image
    const [imagePreviewUrl, setImagePreviewUrl] = useState(
        project?.main_image ? `/storage/${project.main_image}` : null
    );

    // Preview state for partner logo
    const [partnerLogoPreviewUrl, setPartnerLogoPreviewUrl] = useState(
        project?.partner_logo ? `/storage/${project.partner_logo}` : null
    );

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showError('Format Tidak Sesuai', 'Harap pilih file gambar (JPG, PNG, atau JPEG).');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showError('Ukuran Terlalu Besar', 'Ukuran foto maksimal adalah 5MB.');
                return;
            }
            setData('main_image', file);
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    const handlePartnerLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showError('Format Tidak Sesuai', 'Harap pilih file gambar logo (PNG, JPG, atau SVG).');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                showError('Ukuran Terlalu Besar', 'Ukuran logo maksimal adalah 2MB.');
                return;
            }
            setData((prev) => ({
                ...prev,
                partner_logo: file,
                remove_partner_logo: false,
            }));
            setPartnerLogoPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleResetPartnerLogo = () => {
        setData((prev) => ({
            ...prev,
            partner_logo: null,
            remove_partner_logo: true,
        }));
        setPartnerLogoPreviewUrl(null);
    };

    const handleSubmit = (e, explicitStatus = null) => {
        if (e && e.preventDefault) e.preventDefault();
        
        const finalStatus = explicitStatus || data.status || 'published';
        data.status = finalStatus;

        const endpoint = isEditing ? `/projects/${project.slug || project.id}` : '/projects';

        post(endpoint, {
            forceFormData: true,
            preserveScroll: true,
            onError: (err) => {
                const firstError = Object.values(err)[0];
                showError('Gagal Menyimpan Project', firstError || 'Silakan periksa kembali isian formulir.');
            },
        });
    };

    // Construct preview project object
    const previewProject = {
        name: data.name || 'Sample Project Name',
        category: data.category,
        title: data.title || 'CAGE MONITORING',
        subtitle: data.subtitle,
        description: data.description,
        main_image_preview: imagePreviewUrl,
        main_image: project?.main_image,
        partner_logo_preview: partnerLogoPreviewUrl,
        partner_logo: data.remove_partner_logo ? null : project?.partner_logo,
        benefits: data.benefits,
        specifications: data.specifications,
        problem_solution: data.problem_solution,
        project_url: data.project_url,
        footer_website: data.footer_website,
        footer_instagram: data.footer_instagram,
        footer_youtube: data.footer_youtube,
    };

    const hasCustomPartnerLogo = !!partnerLogoPreviewUrl;

    return (
        <AdminLayout 
            title={isEditing ? `Edit ${project.name}` : 'Create Project'} 
            currentPath="/projects/create"
        >
            <div className="space-y-6">
                
                {/* Top Nav Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/projects"
                            className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {isEditing ? `Edit Project: ${project.name}` : 'Create New Visual Project'}
                            </h1>
                            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                                Isi informasi, unggah foto, dan lihat live preview flyer secara realtime di sisi kanan.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {data.status === 'published' ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    setData('status', 'draft');
                                    handleSubmit(e, 'draft');
                                }}
                                disabled={processing}
                                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                            >
                                Simpan Sebagai Draft
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={(e) => {
                                    setData('status', 'published');
                                    handleSubmit(e, 'published');
                                }}
                                disabled={processing}
                                className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 text-[#0D5A34] dark:text-emerald-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                            >
                                Publikasikan ke Showcase
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, data.status)}
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0D5A34] hover:bg-[#094226] text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-900/10 transition-all cursor-pointer disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>
                                {processing 
                                    ? 'Menyimpan...' 
                                    : (isEditing 
                                        ? (data.status === 'draft' ? 'Simpan Perubahan (Draft)' : 'Simpan Perubahan') 
                                        : (data.status === 'draft' ? 'Simpan Sebagai Draft' : 'Generate & Simpan'))}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Main Split Layout: Form on Left (60%) vs Live Preview on Right (40%) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT PANEL: Form Sections (lg:col-span-7) */}
                    <div className="lg:col-span-7 space-y-5">
                        
                        {/* 1. Informasi Project Card */}
                        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400">
                                    <FolderKanban className="w-4 h-4" />
                                </span>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    1. Informasi Utama Project
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Project Internal Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                        Nama Project <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Masukkan nama project..."
                                        className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0D5A34] focus:outline-none"
                                        required
                                    />
                                    {errors.name && <p className="text-rose-500 text-[11px] mt-1">{errors.name}</p>}
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                        Kategori Riset
                                    </label>
                                    <input
                                        type="text"
                                        list="category-suggestions"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        placeholder="Pilih atau masukkan kategori riset..."
                                        className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0D5A34] focus:outline-none"
                                    />
                                    <datalist id="category-suggestions">
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>

                            {/* Subtitle / Partner Badge */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                    Subtitle Banner
                                </label>
                                <input
                                    type="text"
                                    value={data.subtitle}
                                    onChange={(e) => setData('subtitle', e.target.value)}
                                    placeholder="Masukkan subtitle atau nama mitra kerjasama..."
                                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0D5A34] focus:outline-none"
                                />
                            </div>

                            {/* Main Title (Headline) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                    Judul Flyer <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Masukkan judul utama flyer..."
                                    className="w-full px-3 py-2 text-xs font-bold uppercase bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0D5A34] focus:outline-none"
                                    required
                                />
                                {errors.title && <p className="text-rose-500 text-[11px] mt-1">{errors.title}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                    Deskripsi Singkat Sistem / Riset
                                </label>
                                <RichTextEditor
                                    value={data.description}
                                    onChange={(val) => setData('description', val)}
                                    placeholder="Tuliskan ringkasan deskripsi sistem atau inovasi riset yang dikembangkan..."
                                    minHeight="85px"
                                />
                            </div>
                        </div>

                        {/* 2. Logo Mitra / Kerjasama Header */}
                        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400">
                                        <Building2 className="w-4 h-4" />
                                    </span>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        2. Logo Mitra / Institusi Kerjasama
                                    </h2>
                                </div>
                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${hasCustomPartnerLogo ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-[#0D5A34] dark:bg-emerald-950 dark:text-emerald-300'}`}>
                                    {hasCustomPartnerLogo ? 'Logo Kustom Mitra Aktif' : 'Default (Telkom University)'}
                                </span>
                            </div>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Logo STAS-RG bersifat tetap di sebelah kanan. Anda dapat mengunggah logo mitra/kerjasama untuk menggantikan logo default Telkom University di sebelah kiri header.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                                {/* Current Logo Display */}
                                <div className="w-36 h-20 shrink-0 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-2 flex flex-col items-center justify-center relative group">
                                    <img
                                        src={partnerLogoPreviewUrl || '/assets/img/telu.png'}
                                        alt="Partner Logo Preview"
                                        className="max-h-12 max-w-full object-contain"
                                    />
                                    <span className="text-[10px] text-zinc-400 mt-1 font-medium truncate max-w-full">
                                        {hasCustomPartnerLogo ? 'Logo Mitra' : 'Telkom University'}
                                    </span>
                                </div>

                                <div className="flex-1 w-full space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700">
                                            <Upload className="w-4 h-4 text-emerald-600" />
                                            <span>{hasCustomPartnerLogo ? 'Ganti Logo Mitra' : 'Upload Logo Mitra'}</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePartnerLogoChange}
                                                className="hidden"
                                            />
                                        </label>

                                        {hasCustomPartnerLogo && (
                                            <button
                                                type="button"
                                                onClick={handleResetPartnerLogo}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" />
                                                <span>Reset ke Logo Default (Tel-U)</span>
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-zinc-400">
                                        Format PNG/SVG dengan background transparan disarankan. Max 2MB.
                                    </p>
                                    {errors.partner_logo && <p className="text-rose-500 text-[11px] mt-1">{errors.partner_logo}</p>}
                                </div>
                            </div>
                        </div>

                        {/* 3. Upload Gambar Utama */}
                        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400">
                                    <ImageIcon className="w-4 h-4" />
                                </span>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    3. Foto Prototype / Gambar Utama
                                </h2>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                {imagePreviewUrl ? (
                                    <div className="w-36 h-28 shrink-0 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 relative group bg-zinc-100">
                                        <img
                                            src={imagePreviewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <label className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-semibold cursor-pointer">
                                            Ganti Foto
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                ) : (
                                    <div className="w-36 h-28 shrink-0 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900">
                                        <ImageIcon className="w-6 h-6 mb-1" />
                                        <span className="text-[10px]">No image</span>
                                    </div>
                                )}

                                <div className="flex-1 w-full">
                                    <label className="flex flex-col items-center justify-center p-4 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-center">
                                        <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                            Klik untuk upload foto prototype
                                        </span>
                                        <span className="text-[11px] text-zinc-400 mt-0.5">
                                            PNG, JPG, JPEG (Max. 5MB)
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {errors.main_image && <p className="text-rose-500 text-[11px] mt-1">{errors.main_image}</p>}
                                </div>
                            </div>
                        </div>

                        {/* 4. Content Sections (Manfaat, Spesifikasi, Problem-Solution) */}
                        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-5">
                            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400">
                                    <Layers className="w-4 h-4" />
                                </span>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    4. Content Sections
                                </h2>
                            </div>

                            {/* Section A: Manfaat */}
                            <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                                    <CheckCircle2 className="w-4 h-4 text-[#0D5A34]" />
                                    <span>MANFAAT</span>
                                </div>
                                <RichTextEditor
                                    value={data.benefits?.content || ''}
                                    onChange={(val) =>
                                        setData('benefits', {
                                            ...data.benefits,
                                            title: 'MANFAAT',
                                            content: val,
                                        })
                                    }
                                    placeholder="Tuliskan poin-poin manfaat penerapan dan dampak riset inovasi..."
                                    minHeight="70px"
                                />
                            </div>

                            {/* Section B: Spesifikasi */}
                            <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                                    <Wrench className="w-4 h-4 text-[#0D5A34]" />
                                    <span>SPESIFIKASI</span>
                                </div>
                                <RichTextEditor
                                    value={data.specifications?.content || ''}
                                    onChange={(val) =>
                                        setData('specifications', {
                                            ...data.specifications,
                                            title: 'SPESIFIKASI',
                                            content: val,
                                        })
                                    }
                                    placeholder="Tuliskan spesifikasi teknologi, sensor, modul hardware, atau komponen sistem..."
                                    minHeight="70px"
                                />
                            </div>

                            {/* Section C: Problem - Solution */}
                            <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                                    <Lightbulb className="w-4 h-4 text-[#0D5A34]" />
                                    <span>PROBLEM–SOLUTION</span>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                        Problem :
                                    </label>
                                    <RichTextEditor
                                        value={data.problem_solution?.problem || ''}
                                        onChange={(val) =>
                                            setData('problem_solution', {
                                                ...data.problem_solution,
                                                title: 'PROBLEM–SOLUTION',
                                                problem: val,
                                            })
                                        }
                                        placeholder="Jelaskan permasalahan, tantangan, atau kendala utama yang dihadapi di lapangan..."
                                        minHeight="60px"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                        Solution :
                                    </label>
                                    <RichTextEditor
                                        value={data.problem_solution?.solution || ''}
                                        onChange={(val) =>
                                            setData('problem_solution', {
                                                ...data.problem_solution,
                                                title: 'PROBLEM–SOLUTION',
                                                solution: val,
                                            })
                                        }
                                        placeholder="Jelaskan solusi teknologi dan metode inovatif yang diterapkan untuk menyelesaikan masalah..."
                                        minHeight="60px"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 5. URL & QR Code + Footer Info */}
                        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400">
                                    <QrCode className="w-4 h-4" />
                                </span>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    5. URL, QR Code & Footer Kontak
                                </h2>
                            </div>

                            {/* Project URL */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                    URL Video Produk / Halaman Riset
                                </label>
                                <div className="relative">
                                    <input
                                        type="url"
                                        value={data.project_url}
                                        onChange={(e) => setData('project_url', e.target.value)}
                                        placeholder="Masukkan URL video produk atau tautan riset (https://...)"
                                        className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0D5A34] focus:outline-none"
                                    />
                                    <Globe className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                                </div>
                                <p className="text-[11px] text-zinc-400 mt-1">
                                    QR code akan langsung ter-render di flyer dan dibuat permanen saat disimpan.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                {/* Instagram */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                        Instagram Handle
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.footer_instagram}
                                            onChange={(e) => setData('footer_instagram', e.target.value)}
                                            placeholder="Masukkan akun Instagram..."
                                            className="w-full pl-8 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0D5A34] focus:outline-none"
                                        />
                                        <InstagramIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                                    </div>
                                </div>

                                {/* Website */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                        Website Link
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.footer_website}
                                            onChange={(e) => setData('footer_website', e.target.value)}
                                            placeholder="Masukkan alamat website..."
                                            className="w-full pl-8 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0D5A34] focus:outline-none"
                                        />
                                        <Globe className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                                    </div>
                                </div>

                                {/* Youtube */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                        Youtube Channel
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.footer_youtube}
                                            onChange={(e) => setData('footer_youtube', e.target.value)}
                                            placeholder="Masukkan channel YouTube..."
                                            className="w-full pl-8 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0D5A34] focus:outline-none"
                                        />
                                        <YoutubeIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 6. Status & Publikasi ke Landing Page */}
                        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400">
                                    <Globe className="w-4 h-4" />
                                </span>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    6. Status Publikasi ke Landing Page
                                </h2>
                            </div>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Tentukan apakah project ini ingin langsung dipublikasikan dan ditampilkan pada Landing Page STAS RG atau disimpan sebagai Draft internal.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                {/* Option 1: Published */}
                                <label
                                    onClick={() => setData('status', 'published')}
                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                                        data.status === 'published'
                                            ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-900/40'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="project_status"
                                        checked={data.status === 'published'}
                                        onChange={() => setData('status', 'published')}
                                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <div>
                                        <span className="block text-xs font-bold text-slate-900 dark:text-white">
                                            Publikasikan ke Landing Page
                                        </span>
                                        <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                            Project akan tampil pada showcase publik di halaman utama dan pembaca dapat melihat detail riset lengkap.
                                        </span>
                                    </div>
                                </label>

                                {/* Option 2: Draft */}
                                <label
                                    onClick={() => setData('status', 'draft')}
                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                                        data.status === 'draft'
                                            ? 'border-zinc-600 bg-zinc-100/70 dark:bg-zinc-800/40 shadow-xs'
                                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-900/40'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="project_status"
                                        checked={data.status === 'draft'}
                                        onChange={() => setData('status', 'draft')}
                                        className="mt-0.5 text-zinc-600 focus:ring-zinc-500"
                                    />
                                    <div>
                                        <span className="block text-xs font-bold text-slate-900 dark:text-white">
                                            Simpan Sebagai Draft (Internal)
                                        </span>
                                        <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                            Hanya dapat dilihat dan diedit oleh Anda di Admin Panel. Belum ditampilkan di halaman showcase publik.
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT PANEL: Live Output Preview (lg:col-span-5) */}
                    <div className="lg:col-span-5 sticky top-6 space-y-3">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <span className="flex h-2.5 w-2.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                                    Live Output Preview
                                </h3>
                            </div>
                            <span className="text-[11px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-mono">
                                A4 Portrait (210×297mm)
                            </span>
                        </div>

                        {/* Document Render Canvas */}
                        <div className="w-full">
                            <ProjectPreview project={previewProject} isLive={true} />
                        </div>
                    </div>

                </div>

            </div>
        </AdminLayout>
    );
}
