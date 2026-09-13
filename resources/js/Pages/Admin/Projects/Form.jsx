import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useAlert } from '../../../Context/AlertContext';
import ProjectPreview from '../../../Components/Admin/ProjectPreview';
import RichTextEditor from '../../../Components/Admin/RichTextEditor';
import TextLimitMeter from '../../../Components/Admin/TextLimitMeter';
import LayoutPresetSelector from '../../../Components/Admin/LayoutPresetSelector';
import CategoryCombobox from '../../../Components/Admin/CategoryCombobox';
import { evaluateProjectLayoutLimits } from '../../../Utils/textLimits';
import {
    ArrowLeft,
    Save,
    Upload,
    Image as ImageIcon,
    Layers,
    Check,
    CheckCircle2,
    Wrench,
    Lightbulb,
    QrCode,
    Globe,
    Building2,
    Trash2,
    Printer,
    Download,
    Loader2,
    AlertTriangle,
    RefreshCw,
    FolderKanban,
    Sliders,
    Sparkles,
    Wand2
} from 'lucide-react';
import { downloadFlyerAsPng, printFlyer } from '../../../Utils/flyerExport';
import { compressImage, formatFileSize } from '../../../Utils/imageCompressor';

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

const DEFAULT_CATEGORIES = [
    'Smart Agriculture',
    'Internet of Things (IoT)',
    'Aviation & AI',
    'Cybersecurity',
    'Telecommunication',
    'Renewable Energy',
    'Healthcare Tech',
    'Robotics & Automation',
    'Aquaculture / IoT',
];

export default function Form({ project = null, categories = [] }) {
    const isEditing = !!project;
    const { showError, showSuccess } = useAlert();
    const availableCategories = Array.from(new Set([...(categories || []), ...DEFAULT_CATEGORIES]));

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
        layout_preset: project?.layout_preset || 'balanced',
        doc_format: project?.doc_format || 'a4_flyer',
        color_theme: project?.color_theme || 'stas_official',
        print_mode: project?.print_mode || 'light',
        boilerplate_type: project?.boilerplate_type || null,
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

    // Automatic Image Compression States & Feedback
    const [isCompressingImage, setIsCompressingImage] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState(null);
    const [imageCompressionStats, setImageCompressionStats] = useState(null);

    const [isCompressingLogo, setIsCompressingLogo] = useState(false);
    const [logoCompressionProgress, setLogoCompressionProgress] = useState(null);
    const [logoCompressionStats, setLogoCompressionStats] = useState(null);

    const [livePngLoading, setLivePngLoading] = useState(false);
    const [polishingSection, setPolishingSection] = useState(null);

    const handleApplyBoilerplate = (boilerplate) => {
        setData((prev) => ({
            ...prev,
            subtitle: boilerplate.subtitle || prev.subtitle,
            footer_website: boilerplate.footer_website || prev.footer_website,
            footer_instagram: boilerplate.footer_instagram || prev.footer_instagram,
            footer_youtube: boilerplate.footer_youtube || prev.footer_youtube,
            boilerplate_type: boilerplate.id,
        }));
        showSuccess('Boilerplate Diterapkan', `Template "${boilerplate.name}" berhasil diterapkan pada badge dan footer.`);
    };

    const handleGenerateOrPolishSection = async (section, text = '', context = {}) => {
        const hasBaseContext = Boolean(data.name || data.description || text);
        if (!hasBaseContext) {
            showWarning('Informasi Belum Cukup', 'Silakan isi Nama Proyek atau Deskripsi Singkat terlebih dahulu agar AI dapat menyusun bagian ini.');
            return;
        }

        setPolishingSection(section);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        try {
            const res = await fetch('/projects/ai-section', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    section,
                    text: text || '',
                    context: {
                        project_name: data.name,
                        title: data.title,
                        category: data.category,
                        description: data.description,
                        layout_preset: data.layout_preset || 'balanced',
                        ...context,
                    },
                }),
            });

            const resData = await res.json();
            if (res.ok && resData.success) {
                if (section === 'all_sections' && resData.data) {
                    setData((prev) => ({
                        ...prev,
                        problem_solution: {
                            ...prev.problem_solution,
                            title: 'PROBLEM–SOLUTION',
                            problem: resData.data.problem || prev.problem_solution?.problem || '',
                            solution: resData.data.solution || prev.problem_solution?.solution || '',
                        },
                        benefits: {
                            ...prev.benefits,
                            title: 'MANFAAT',
                            content: resData.data.benefits || prev.benefits?.content || '',
                        },
                        specifications: {
                            ...prev.specifications,
                            title: 'SPESIFIKASI',
                            content: resData.data.specifications || prev.specifications?.content || '',
                        },
                    }));
                    showSuccess('Generate AI Berhasil', 'Seluruh bagian (Problem, Solution, Manfaat, dan Spesifikasi) berhasil disusun otomatis dari deskripsi proyek.');
                } else if (section === 'description') {
                    setData('description', resData.polished_text);
                    showSuccess('AI Berhasil', 'Deskripsi proyek berhasil dipoles/dibuat.');
                } else if (section === 'benefits') {
                    setData('benefits', { ...data.benefits, title: 'MANFAAT', content: resData.polished_text });
                    showSuccess('AI Berhasil', 'Poin manfaat berhasil disusun dari deskripsi.');
                } else if (section === 'specifications') {
                    setData('specifications', { ...data.specifications, title: 'SPESIFIKASI', content: resData.polished_text });
                    showSuccess('AI Berhasil', 'Spesifikasi teknis berhasil disusun dari deskripsi.');
                } else if (section === 'problem') {
                    setData('problem_solution', { ...data.problem_solution, title: 'PROBLEM–SOLUTION', problem: resData.polished_text });
                    showSuccess('AI Berhasil', 'Latar belakang problem berhasil disusun dari deskripsi.');
                } else if (section === 'solution') {
                    setData('problem_solution', { ...data.problem_solution, title: 'PROBLEM–SOLUTION', solution: resData.polished_text });
                    showSuccess('AI Berhasil', 'Solusi teknologi berhasil disusun dari deskripsi.');
                }
            } else {
                showError('AI Gagal', resData.error || resData.message || 'Gagal memproses AI.');
            }
        } catch (err) {
            showError('Koneksi AI Gagal', err.message || 'Terjadi kesalahan saat memproses.');
        } finally {
            setPolishingSection(null);
        }
    };

    const handleLiveDownloadPng = async () => {
        if (livePngLoading) return;
        setLivePngLoading(true);
        try {
            const canvasId = 'live-preview-canvas';
            const filename = `${(data.name || 'project').replace(/\s+/g, '_').toLowerCase()}_flyer_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.png`;
            await downloadFlyerAsPng(canvasId, filename);
        } catch (err) {
            console.error('Live PNG export error:', err);
        } finally {
            setLivePngLoading(false);
        }
    };

    const handleLivePrint = () => {
        const canvasId = 'live-preview-canvas';
        printFlyer(canvasId, `Preview Flyer - ${data.title || data.name || 'STAS RG'}`);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showError('Format Tidak Sesuai', 'Harap pilih file gambar (JPG, PNG, atau JPEG).');
            return;
        }

        try {
            setIsCompressingImage(true);
            setCompressionProgress({ stage: 'Mempersiapkan gambar...', percent: 10 });

            const result = await compressImage(file, {
                maxSizeMB: 4,
                maxWidth: 2560,
                maxHeight: 2560,
                initialQuality: 0.88,
                onProgress: (p) => setCompressionProgress(p),
            });

            setData('main_image', result.file);
            setImagePreviewUrl(result.previewUrl);
            setImageCompressionStats(result);

            if (result.wasCompressed) {
                showSuccess(
                    'Kompresi Otomatis Berhasil',
                    `Ukuran foto diperkecil dari ${result.originalSizeStr} menjadi ${result.compressedSizeStr} (Hemat ${result.savedPercent}%). Kualitas tetap tajam.`
                );
            }
        } catch (err) {
            showError('Gagal Memproses Gambar', err.message || 'Terjadi kesalahan saat mengompresi gambar.');
        } finally {
            setIsCompressingImage(false);
            setCompressionProgress(null);
        }
    };

    const handlePartnerLogoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showError('Format Tidak Sesuai', 'Harap pilih file gambar logo (PNG, JPG, atau SVG).');
            return;
        }

        if (file.type === 'image/svg+xml') {
            setData((prev) => ({
                ...prev,
                partner_logo: file,
                remove_partner_logo: false,
            }));
            setPartnerLogoPreviewUrl(URL.createObjectURL(file));
            setLogoCompressionStats(null);
            return;
        }

        try {
            setIsCompressingLogo(true);
            setLogoCompressionProgress({ stage: 'Mempersiapkan logo...', percent: 10 });

            const result = await compressImage(file, {
                maxSizeMB: 2,
                maxWidth: 1600,
                maxHeight: 1600,
                initialQuality: 0.92,
                onProgress: (p) => setLogoCompressionProgress(p),
            });

            setData((prev) => ({
                ...prev,
                partner_logo: result.file,
                remove_partner_logo: false,
            }));
            setPartnerLogoPreviewUrl(result.previewUrl);
            setLogoCompressionStats(result);

            if (result.wasCompressed) {
                showSuccess(
                    'Logo Berhasil Dikompresi',
                    `Ukuran logo diperkecil dari ${result.originalSizeStr} menjadi ${result.compressedSizeStr} (Hemat ${result.savedPercent}%).`
                );
            }
        } catch (err) {
            showError('Gagal Memproses Logo', err.message || 'Terjadi kesalahan saat mengompresi logo.');
        } finally {
            setIsCompressingLogo(false);
            setLogoCompressionProgress(null);
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
        layout_preset: data.layout_preset || 'balanced',
        doc_format: data.doc_format || 'a4_flyer',
        color_theme: data.color_theme || 'stas_official',
        print_mode: data.print_mode || 'light',
        boilerplate_type: data.boilerplate_type,
    };

    const hasCustomPartnerLogo = !!partnerLogoPreviewUrl;
    const layoutEvaluation = evaluateProjectLayoutLimits(data, data.layout_preset);

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
                    <div className="flex flex-wrap items-center gap-2">
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
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0D5A34] hover:bg-[#094226] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{isEditing ? 'Update Flyer' : 'Generate & Simpan Flyer'}</span>
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
                                    <CategoryCombobox
                                        value={data.category}
                                        onChange={(val) => setData('category', val)}
                                        categories={availableCategories}
                                        placeholder="Pilih atau ketik kategori riset..."
                                        error={errors.category}
                                    />
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
                                <TextLimitMeter value={data.subtitle} limitKey="subtitle" preset={data.layout_preset} />
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
                                <TextLimitMeter value={data.title} limitKey="title" preset={data.layout_preset} />
                                {errors.title && <p className="text-rose-500 text-[11px] mt-1">{errors.title}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                        Deskripsi Singkat Sistem / Riset
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => handleGenerateOrPolishSection('description', data.description)}
                                        disabled={polishingSection === 'description' || (!data.name && !data.description)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-[#0D5A34] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                        title={data.description ? "Poles deskripsi agar lebih akademis dan ringkas" : "Generate draf deskripsi dari Nama Proyek & Kategori"}
                                    >
                                        {polishingSection === 'description' ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                        )}
                                        <span>{data.description ? 'Poles Deskripsi' : 'Generate Deskripsi'}</span>
                                    </button>
                                </div>
                                <RichTextEditor
                                    value={data.description}
                                    onChange={(val) => setData('description', val)}
                                    placeholder="Tuliskan ringkasan deskripsi sistem atau inovasi riset yang dikembangkan..."
                                    minHeight="85px"
                                />
                                <TextLimitMeter value={data.description} limitKey="description" preset={data.layout_preset} />
                            </div>
                        </div>

                        {/* 4. Templates, Formats & Preset Styling */}
                        <LayoutPresetSelector
                            formatValue={data.doc_format}
                            presetValue={data.layout_preset}
                            themeValue={data.color_theme}
                            printModeValue={data.print_mode}
                            onFormatChange={(fmt) => setData('doc_format', fmt)}
                            onPresetChange={(preset) => setData('layout_preset', preset)}
                            onThemeChange={(th) => setData('color_theme', th)}
                            onPrintModeChange={(pm) => setData('print_mode', pm)}
                            onApplyBoilerplate={handleApplyBoilerplate}
                        />

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
                                    {isCompressingLogo ? (
                                        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 space-y-2 animate-in fade-in">
                                            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                                                    <span>{logoCompressionProgress?.stage || 'Mengompresi logo otomatis...'}</span>
                                                </div>
                                                <span>{logoCompressionProgress?.percent || 0}%</span>
                                            </div>
                                            <div className="w-full bg-emerald-200 dark:bg-emerald-900 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="bg-[#0D5A34] dark:bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${logoCompressionProgress?.percent || 15}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
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
                                    )}

                                    {logoCompressionStats?.wasCompressed && (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                            <span>Terkonversi optimal: {logoCompressionStats.originalSizeStr} &rarr; {logoCompressionStats.compressedSizeStr} (Hemat {logoCompressionStats.savedPercent}%)</span>
                                        </div>
                                    )}

                                    <p className="text-[11px] text-zinc-400">
                                        Mendukung PNG/SVG/WebP. File besar otomatis dikompresi tanpa mengurangi ketajaman logo.
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

                                <div className="flex-1 w-full space-y-2">
                                    {isCompressingImage ? (
                                        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/30 space-y-2.5 animate-in fade-in">
                                            <div className="flex items-center justify-between text-xs font-bold text-emerald-950 dark:text-emerald-200">
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                                                    <span>{compressionProgress?.stage || 'Mengompresi gambar otomatis...'}</span>
                                                </div>
                                                <span className="font-mono text-[11px]">{compressionProgress?.percent || 0}%</span>
                                            </div>
                                            <div className="w-full bg-emerald-200 dark:bg-emerald-900 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-[#0D5A34] dark:bg-emerald-400 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${compressionProgress?.percent || 15}%` }}
                                                />
                                            </div>
                                            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                                                Menyesuaikan resolusi dan kualitas gambar agar optimal untuk dicetak & diunduh.
                                            </p>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center p-4 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-center">
                                            <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                                            <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                                Klik untuk upload foto prototype
                                            </span>
                                            <span className="text-[11px] text-zinc-400 mt-0.5">
                                                Mendukung semua ukuran gambar (Otomatis dikompresi agar ringan & tajam)
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}

                                    {imageCompressionStats?.wasCompressed && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                            <span>Otomatis terkompresi: {imageCompressionStats.originalSizeStr} &rarr; {imageCompressionStats.compressedSizeStr} (Hemat {imageCompressionStats.savedPercent}%)</span>
                                        </div>
                                    )}

                                    {errors.main_image && <p className="text-rose-500 text-[11px] mt-1">{errors.main_image}</p>}
                                </div>
                            </div>
                        </div>

                        {/* 4. Content Sections (Manfaat, Spesifikasi, Problem-Solution) */}
                        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-5">
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400">
                                        <Layers className="w-4 h-4" />
                                    </span>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        4. Content Sections
                                    </h2>
                                </div>

                                {/* Quick Action: Generate all 4 sections from description */}
                                <button
                                    type="button"
                                    onClick={() => handleGenerateOrPolishSection('all_sections', '')}
                                    disabled={polishingSection !== null || (!data.description && !data.name)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-[#0D5A34] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-40"
                                    title="Generate Problem, Solution, Manfaat, dan Spesifikasi otomatis dari Deskripsi Proyek"
                                >
                                    {polishingSection === 'all_sections' ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Menyusun Semua Bagian...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                            <span>Generate Semua Bagian dari Deskripsi</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Section A: Manfaat */}
                            <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                                        <CheckCircle2 className="w-4 h-4 text-[#0D5A34]" />
                                        <span>MANFAAT</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleGenerateOrPolishSection('benefits', data.benefits?.content)}
                                        disabled={polishingSection === 'benefits' || (!data.description && !data.name && !data.benefits?.content)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-[#0D5A34] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                        title={data.benefits?.content ? "Poles poin manfaat dengan AI" : "Generate poin manfaat otomatis dari deskripsi proyek"}
                                    >
                                        {polishingSection === 'benefits' ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                        )}
                                        <span>{data.benefits?.content ? 'Poles AI' : 'Generate dari Deskripsi'}</span>
                                    </button>
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
                                <TextLimitMeter value={data.benefits?.content} limitKey="benefits" preset={data.layout_preset} />
                            </div>

                            {/* Section B: Spesifikasi */}
                            <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                                        <Wrench className="w-4 h-4 text-[#0D5A34]" />
                                        <span>SPESIFIKASI</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleGenerateOrPolishSection('specifications', data.specifications?.content)}
                                        disabled={polishingSection === 'specifications' || (!data.description && !data.name && !data.specifications?.content)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-[#0D5A34] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                        title={data.specifications?.content ? "Poles spesifikasi teknis dengan AI" : "Generate spesifikasi teknis otomatis dari deskripsi proyek"}
                                    >
                                        {polishingSection === 'specifications' ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                        )}
                                        <span>{data.specifications?.content ? 'Poles AI' : 'Generate dari Deskripsi'}</span>
                                    </button>
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
                                <TextLimitMeter value={data.specifications?.content} limitKey="specifications" preset={data.layout_preset} />
                            </div>

                            {/* Section C: Problem - Solution */}
                            <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                                    <Lightbulb className="w-4 h-4 text-[#0D5A34]" />
                                    <span>PROBLEM–SOLUTION</span>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                                            Problem :
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => handleGenerateOrPolishSection('problem', data.problem_solution?.problem)}
                                            disabled={polishingSection === 'problem' || (!data.description && !data.name && !data.problem_solution?.problem)}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-[#0D5A34] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                            title={data.problem_solution?.problem ? "Poles rumusan masalah dengan AI" : "Generate rumusan problem otomatis dari deskripsi proyek"}
                                        >
                                            {polishingSection === 'problem' ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                            )}
                                            <span>{data.problem_solution?.problem ? 'Poles AI' : 'Generate dari Deskripsi'}</span>
                                        </button>
                                    </div>
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
                                    <TextLimitMeter value={data.problem_solution?.problem} limitKey="problem" preset={data.layout_preset} />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                                            Solution :
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => handleGenerateOrPolishSection('solution', data.problem_solution?.solution)}
                                            disabled={polishingSection === 'solution' || (!data.description && !data.name && !data.problem_solution?.solution)}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-[#0D5A34] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                            title={data.problem_solution?.solution ? "Poles solusi inovatif dengan AI" : "Generate penjelasan solusi otomatis dari deskripsi proyek"}
                                        >
                                            {polishingSection === 'solution' ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                            )}
                                            <span>{data.problem_solution?.solution ? 'Poles AI' : 'Generate dari Deskripsi'}</span>
                                        </button>
                                    </div>
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
                                    <TextLimitMeter value={data.problem_solution?.solution} limitKey="solution" preset={data.layout_preset} />
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
                                    5. QR Code & Tautan Eksternal
                                </h2>
                            </div>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                QR code akan dibuat secara otomatis di bagian pojok kanan bawah flyer untuk mengarahkan pembaca langsung ke video demo YouTube, publikasi paper riset, atau URL web landing.
                            </p>

                            <div className="space-y-4 pt-1">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                        Tautan QR Code (Video Demo / Riset Eksternal)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            value={data.project_url}
                                            onChange={(e) => setData('project_url', e.target.value)}
                                            placeholder="https://youtu.be/... atau https://telkomuniversity.ac.id"
                                            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0D5A34] focus:outline-none pr-8"
                                        />
                                        <QrCode className="w-4 h-4 text-zinc-400 absolute right-3 top-2.5" />
                                    </div>
                                    <p className="text-[11px] text-zinc-400 mt-1">
                                        Biarkan kosong jika ingin QR code mengarah otomatis ke halaman detail showcase landing page riset ini.
                                    </p>
                                    {errors.project_url && <p className="text-rose-500 text-[11px] mt-1">{errors.project_url}</p>}
                                </div>

                                {/* Footer Social & Contact Info */}
                                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                                        Informasi Footer Flyer
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <span className="block text-[11px] text-zinc-500 mb-1 flex items-center gap-1">
                                                <Globe className="w-3 h-3 text-emerald-600" />
                                                <span>Website:</span>
                                            </span>
                                            <input
                                                type="text"
                                                value={data.footer_website}
                                                onChange={(e) => setData('footer_website', e.target.value)}
                                                placeholder="tel-u.ac.id/stasrg"
                                                className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:border-[#0D5A34] focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <span className="block text-[11px] text-zinc-500 mb-1 flex items-center gap-1">
                                                <InstagramIcon className="w-3 h-3 text-emerald-600" />
                                                <span>Instagram:</span>
                                            </span>
                                            <input
                                                type="text"
                                                value={data.footer_instagram}
                                                onChange={(e) => setData('footer_instagram', e.target.value)}
                                                placeholder="@stas.rg"
                                                className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:border-[#0D5A34] focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <span className="block text-[11px] text-zinc-500 mb-1 flex items-center gap-1">
                                                <YoutubeIcon className="w-3 h-3 text-emerald-600" />
                                                <span>YouTube:</span>
                                            </span>
                                            <input
                                                type="text"
                                                value={data.footer_youtube}
                                                onChange={(e) => setData('footer_youtube', e.target.value)}
                                                placeholder="@stas_rg"
                                                className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:border-[#0D5A34] focus:outline-none"
                                            />
                                        </div>
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
                            
                            <div className="flex items-center gap-1.5">
                                {/* Print Quick Action */}
                                <button
                                    type="button"
                                    onClick={handleLivePrint}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[11px] font-semibold transition-colors cursor-pointer"
                                    title="Print Flyer A4 Preview"
                                >
                                    <Printer className="w-3 h-3" />
                                    <span>Print</span>
                                </button>

                                {/* Download PNG Quick Action */}
                                <button
                                    type="button"
                                    onClick={handleLiveDownloadPng}
                                    disabled={livePngLoading}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer disabled:cursor-wait"
                                    title="Download Gambar PNG Resolusi Tinggi (300 DPI)"
                                >
                                    {livePngLoading ? (
                                        <>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            <span>PNG...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon className="w-3 h-3" />
                                            <span>PNG</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Layout Health / Text Overflow Warning Banner */}
                        {layoutEvaluation.hasErrors ? (
                            <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-400/80 dark:border-amber-600/70 text-amber-950 dark:text-amber-100 shadow-xs transition-all animate-in fade-in duration-200">
                                <div className="flex items-start gap-2.5">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                    <div className="space-y-1 text-xs">
                                        <p className="font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                                            <span>Peringatan: Teks Melebihi Batas Ideal Layout A4</span>
                                        </p>
                                        <p className="text-[11px] text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
                                            Flyer dikunci pada 1 halaman A4. Bagian teks berikut terlalu panjang dan berisiko terpotong saat dicetak atau diunduh:
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {layoutEvaluation.errorWarnings.map((w) => (
                                                <span
                                                    key={w.key}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100/90 dark:bg-amber-900/70 border border-amber-300 dark:border-amber-700 text-[11px] font-semibold text-amber-950 dark:text-amber-100"
                                                >
                                                    <span>{w.field}:</span>
                                                    <strong className="text-rose-700 dark:text-rose-300">{w.current}/{w.max}</strong>
                                                    <span className="text-[10px] text-rose-600 dark:text-rose-400">(+{w.excess})</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : layoutEvaluation.hasWarnings ? (
                            <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 font-medium">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <span>Beberapa kolom teks mendekati batas maksimum 1 halaman A4.</span>
                                </div>
                                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold shrink-0">
                                    Periksa kembali
                                </span>
                            </div>
                        ) : (
                            <div className="px-3 py-1.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Layout A4 Optimal (Teks Pas 1 Halaman)</span>
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700/90 dark:text-emerald-400/90 font-semibold">
                                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    <span>100% Pas A4</span>
                                </span>
                            </div>
                        )}

                        {/* Document Render Canvas */}
                        <div className="w-full">
                            <ProjectPreview project={previewProject} isLive={true} id="live-preview-canvas" />
                        </div>
                    </div>

                </div>

            </div>
        </AdminLayout>
    );
}
