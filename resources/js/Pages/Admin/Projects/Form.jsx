import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useApp } from '../../../Context/AppContext';
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
    Wand2,
    Link2,
    ExternalLink,
    Plus,
    Share2,
    GripVertical,
    ChevronUp,
    ChevronDown,
    RotateCcw
} from 'lucide-react';
import { downloadFlyerAsPng, printFlyer } from '../../../Utils/flyerExport';
import { compressImage, formatFileSize } from '../../../Utils/imageCompressor';
import ExportSosmedModal from '../../../Components/Admin/ExportSosmedModal';
import {
    AVAILABLE_SOCIAL_PLATFORMS,
    normalizeSocialLinks,
    SocialIcon,
    getSocialPlatformConfig,
    DEFAULT_STAS_SOCIAL_LINKS
} from '../../../Utils/socialPlatforms';

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
    const { t, language } = useApp();
    const pf = t?.projectForm || {};
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
        footer_website: project?.footer_website || 'www.stas-rg.com',
        footer_instagram: project?.footer_instagram || '@stas.rg',
        footer_youtube: project?.footer_youtube || '@stas_rg',
        social_links: normalizeSocialLinks(project),
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
    const [isExportSosmedModalOpen, setIsExportSosmedModalOpen] = useState(false);
    const [polishingSection, setPolishingSection] = useState(null);
    const [draggedSocialIndex, setDraggedSocialIndex] = useState(null);
    const [dragOverSocialIndex, setDragOverSocialIndex] = useState(null);

    // Browser Local Storage Auto-Save & Draft Cache
    const draftStorageKey = isEditing
        ? `stasikator_draft_edit_${project?.id || project?.slug}`
        : 'stasikator_draft_create';

    const [lastSavedDraftTime, setLastSavedDraftTime] = useState(null);
    const [draftRestoredNotice, setDraftRestoredNotice] = useState(false);
    const [isAutoSaving, setIsAutoSaving] = useState(false);

    // 1. Restore cached draft from localStorage on initial page load
    useEffect(() => {
        try {
            const raw = localStorage.getItem(draftStorageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.data) {
                    const d = parsed.data;
                    const hasSubstantialData = Boolean(
                        d.name || d.title || d.description ||
                        (d.benefits && d.benefits.content) ||
                        (d.specifications && d.specifications.content) ||
                        (d.problem_solution && (d.problem_solution.problem || d.problem_solution.solution))
                    );

                    if (hasSubstantialData) {
                        setData((prev) => ({
                            ...prev,
                            ...d,
                            main_image: prev.main_image,
                            partner_logo: prev.partner_logo,
                            _method: isEditing ? 'PUT' : 'POST',
                        }));
                        setDraftRestoredNotice(true);
                        setLastSavedDraftTime(parsed.updatedAt ? new Date(parsed.updatedAt) : new Date());
                    }
                }
            }
        } catch (e) {
            console.error('Failed to load local draft from localStorage', e);
        }
    }, [draftStorageKey]);

    // 2. Debounced auto-save form changes to localStorage
    useEffect(() => {
        const isCleanEmpty = !data.name && !data.title && !data.description && !data.benefits?.content && !data.specifications?.content;
        if (isCleanEmpty && !isEditing) {
            return;
        }

        setIsAutoSaving(true);
        const timer = setTimeout(() => {
            try {
                const { main_image, partner_logo, _method, ...serializableData } = data;
                const now = new Date();
                const payload = {
                    data: serializableData,
                    updatedAt: now.toISOString(),
                };
                localStorage.setItem(draftStorageKey, JSON.stringify(payload));
                setLastSavedDraftTime(now);
                setIsAutoSaving(false);
            } catch (e) {
                console.error('Failed to auto-save draft to localStorage', e);
                setIsAutoSaving(false);
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [data, draftStorageKey, isEditing]);

    const handleClearDraft = () => {
        try {
            localStorage.removeItem(draftStorageKey);
            setLastSavedDraftTime(null);
            setDraftRestoredNotice(false);
            setData({
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
                footer_website: project?.footer_website || 'www.stas-rg.com',
                footer_instagram: project?.footer_instagram || '@stas.rg',
                footer_youtube: project?.footer_youtube || '@stas_rg',
                social_links: normalizeSocialLinks(project),
                layout_preset: project?.layout_preset || 'balanced',
                doc_format: project?.doc_format || 'a4_flyer',
                color_theme: project?.color_theme || 'stas_official',
                print_mode: project?.print_mode || 'light',
                boilerplate_type: project?.boilerplate_type || null,
                status: project?.status || 'published',
                _method: isEditing ? 'PUT' : 'POST',
            });
            showSuccess('Draf Direset', 'Draf penyimpanan lokal browser telah dibersihkan.');
        } catch (e) {
            console.error(e);
        }
    };

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
            onSuccess: () => {
                try {
                    localStorage.removeItem(draftStorageKey);
                } catch (e) {
                    console.error('Failed to clean draft after submit', e);
                }
            },
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
        social_links: data.social_links,
        layout_preset: data.layout_preset || 'balanced',
        doc_format: data.doc_format || 'a4_flyer',
        color_theme: data.color_theme || 'stas_official',
        print_mode: data.print_mode || 'light',
        boilerplate_type: data.boilerplate_type,
    };

    // Social media links management handlers
    const handleAddSocialLink = (platformId = 'facebook') => {
        const platformConfig = getSocialPlatformConfig(platformId);
        const currentLinks = Array.isArray(data.social_links) ? [...data.social_links] : [];
        const newLinks = [
            ...currentLinks,
            { platform: platformId, value: platformConfig.defaultHandle || '' }
        ];
        setData('social_links', newLinks);
    };

    const handleUpdateSocialLink = (index, field, value) => {
        const currentLinks = Array.isArray(data.social_links) ? [...data.social_links] : [];
        if (!currentLinks[index]) return;

        const updatedItem = { ...currentLinks[index] };

        if (field === 'platform') {
            const oldPlatform = updatedItem.platform;
            const oldConfig = getSocialPlatformConfig(oldPlatform);
            const newConfig = getSocialPlatformConfig(value);

            if (!updatedItem.value || updatedItem.value === oldConfig.defaultHandle) {
                updatedItem.value = newConfig.defaultHandle;
            }
            updatedItem.platform = value;
        } else {
            updatedItem[field] = value;
        }

        currentLinks[index] = updatedItem;
        setData('social_links', currentLinks);

        // Keep legacy fields in sync
        const webItem = currentLinks.find((l) => l.platform === 'website');
        const igItem = currentLinks.find((l) => l.platform === 'instagram');
        const ytItem = currentLinks.find((l) => l.platform === 'youtube');
        if (webItem) setData('footer_website', webItem.value);
        if (igItem) setData('footer_instagram', igItem.value);
        if (ytItem) setData('footer_youtube', ytItem.value);
    };

    const handleRemoveSocialLink = (index) => {
        const currentLinks = Array.isArray(data.social_links) ? [...data.social_links] : [];
        const newLinks = currentLinks.filter((_, idx) => idx !== index);
        setData('social_links', newLinks);
    };

    const handleResetSocialLinks = () => {
        setData('social_links', [...DEFAULT_STAS_SOCIAL_LINKS]);
        showSuccess('Reset Media Sosial', 'Media sosial footer dikembalikan ke standar STAS-RG.');
    };

    const handleMoveSocialLink = (fromIndex, toIndex) => {
        const currentLinks = Array.isArray(data.social_links) ? [...data.social_links] : [];
        if (toIndex < 0 || toIndex >= currentLinks.length || fromIndex === toIndex) return;

        const [movedItem] = currentLinks.splice(fromIndex, 1);
        currentLinks.splice(toIndex, 0, movedItem);
        setData('social_links', currentLinks);

        // Keep legacy fields in sync
        const webItem = currentLinks.find((l) => l.platform === 'website');
        const igItem = currentLinks.find((l) => l.platform === 'instagram');
        const ytItem = currentLinks.find((l) => l.platform === 'youtube');
        if (webItem) setData('footer_website', webItem.value);
        if (igItem) setData('footer_instagram', igItem.value);
        if (ytItem) setData('footer_youtube', ytItem.value);
    };

    const handleDragStartSocial = (e, index) => {
        setDraggedSocialIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
    };

    const handleDragOverSocial = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverSocialIndex !== index) {
            setDragOverSocialIndex(index);
        }
    };

    const handleDragLeaveSocial = (e, index) => {
        if (dragOverSocialIndex === index) {
            setDragOverSocialIndex(null);
        }
    };

    const handleDropSocial = (e, targetIndex) => {
        e.preventDefault();
        if (draggedSocialIndex !== null && draggedSocialIndex !== targetIndex) {
            handleMoveSocialLink(draggedSocialIndex, targetIndex);
        }
        setDraggedSocialIndex(null);
        setDragOverSocialIndex(null);
    };

    const handleDragEndSocial = () => {
        setDraggedSocialIndex(null);
        setDragOverSocialIndex(null);
    };

    const handleLoadFullSocialPreset = () => {
        setData('social_links', [
            { platform: 'website', value: 'www.stas-rg.com' },
            { platform: 'instagram', value: '@stas.rg' },
            { platform: 'youtube', value: '@stas_rg' },
            { platform: 'linkedin', value: 'linkedin.com/company/stas-rg' },
            { platform: 'email', value: 'stasrg@telkomuniversity.ac.id' },
        ]);
        showSuccess('Preset Lengkap Terpasang', '5 Saluran media sosial & kontak resmi telah ditambahkan.');
    };

    const hasCustomPartnerLogo = !!partnerLogoPreviewUrl;
    const layoutEvaluation = evaluateProjectLayoutLimits(data, data.layout_preset);

    return (
        <AdminLayout 
            title={isEditing ? (pf.editTitle ? `${pf.editTitle}: ${project.name}` : `Edit Project: ${project.name}`) : (pf.createTitle || 'Create New Visual Project')} 
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
                                {isEditing 
                                    ? (pf.editTitle ? `${pf.editTitle}: ${project.name}` : `Edit Project: ${project.name}`) 
                                    : (pf.createTitle || 'Create New Visual Project')}
                            </h1>
                            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                                {pf.pageSubtitle || 'Isi informasi, unggah foto, dan lihat live preview flyer secara realtime di sisi kanan.'}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons & Auto-save Status */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Auto-save & Local Draft Status Pill */}
                        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-300 text-[11px]">
                            {isAutoSaving ? (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                    <span className="font-medium text-amber-600 dark:text-amber-400">{pf.autoSaveSaving || 'Menyimpan draf...'}</span>
                                </>
                            ) : lastSavedDraftTime ? (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                                        {pf.autoSaveBrowserActive || 'Draf Browser'} ({lastSavedDraftTime.toLocaleTimeString(language === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' })})
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleClearDraft}
                                        title={pf.resetDraftTooltip || 'Hapus draf lokal dan mulai ulang formulir'}
                                        className="ml-0.5 p-0.5 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-zinc-400" />
                                    <span>{pf.autoSaveReady || 'Auto-save Aktif'}</span>
                                </>
                            )}
                        </div>

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
                                {pf.saveDraft || 'Simpan Sebagai Draft'}
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
                                {pf.publishToShowcase || 'Publikasikan ke Showcase'}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, data.status)}
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0D5A34] hover:bg-[#094226] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{isEditing ? (pf.updateFlyer || 'Update Flyer') : (pf.saveAndGenerate || 'Generate & Simpan Flyer')}</span>
                        </button>
                    </div>
                </div>

                {/* Local Storage Draft Restored Notification Banner */}
                {draftRestoredNotice && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-300/80 dark:border-emerald-700/80 text-emerald-950 dark:text-emerald-200 shadow-xs animate-in fade-in duration-300">
                        <div className="flex items-start sm:items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/80 flex items-center justify-center shrink-0 text-emerald-700 dark:text-emerald-300">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold">{pf.draftRestoredTitle || 'Draf Isian Berhasil Dipulihkan Otomatis'}</p>
                                <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/90 mt-0.5">
                                    {pf.draftRestoredDesc || 'Data formulir Anda sebelum halaman dimuat ulang berhasil dipulihkan dari cache penyimpanan browser lokal. Data Anda tidak akan hilang saat refresh.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <button
                                type="button"
                                onClick={handleClearDraft}
                                className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                            >
                                {pf.resetDraftBtn || 'Reset / Hapus Draf'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setDraftRestoredNotice(false)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                            >
                                {pf.closeNotification || 'Tutup Notifikasi'}
                            </button>
                        </div>
                    </div>
                )}

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
                                    {pf.sectionInfoTitle || '1. Informasi Utama Project'}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Project Internal Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                        {pf.projectNameLabel || 'Nama Project'} <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder={pf.projectNamePlaceholder || 'Masukkan nama project...'}
                                        className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0D5A34] focus:outline-none"
                                        required
                                    />
                                    {errors.name && <p className="text-rose-500 text-[11px] mt-1">{errors.name}</p>}
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                        {pf.categoryLabel || 'Kategori Riset'}
                                    </label>
                                    <CategoryCombobox
                                        value={data.category}
                                        onChange={(val) => setData('category', val)}
                                        categories={availableCategories}
                                        placeholder={pf.categoryPlaceholder || 'Pilih atau ketik kategori riset...'}
                                        error={errors.category}
                                    />
                                </div>
                            </div>

                            {/* Subtitle / Partner Badge */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                    {pf.subtitleLabel || 'Subtitle Banner'}
                                </label>
                                <input
                                    type="text"
                                    value={data.subtitle}
                                    onChange={(e) => setData('subtitle', e.target.value)}
                                    placeholder={pf.subtitlePlaceholder || 'Masukkan subtitle atau nama mitra kerjasama...'}
                                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0D5A34] focus:outline-none"
                                />
                                <TextLimitMeter value={data.subtitle} limitKey="subtitle" preset={data.layout_preset} />
                            </div>

                            {/* Main Title (Headline) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                    {pf.flyerTitleLabel || 'Judul Flyer'} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder={pf.flyerTitlePlaceholder || 'Masukkan judul utama flyer...'}
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
                                        {pf.descriptionLabel || 'Deskripsi Singkat Sistem / Riset'}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => handleGenerateOrPolishSection('description', data.description)}
                                        disabled={polishingSection === 'description' || (!data.name && !data.description)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-[#0D5A34] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                        title={data.description ? (language === 'en' ? 'Polish description with AI' : 'Poles deskripsi agar lebih akademis dan ringkas') : (language === 'en' ? 'Generate draft description from Project Name & Category' : 'Generate draf deskripsi dari Nama Proyek & Kategori')}
                                    >
                                        {polishingSection === 'description' ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                        )}
                                        <span>{data.description ? (pf.aiPolishWithAI || 'Poles Deskripsi') : (pf.aiWriteWithAI || 'Generate Deskripsi')}</span>
                                    </button>
                                </div>
                                <RichTextEditor
                                    value={data.description}
                                    onChange={(val) => setData('description', val)}
                                    placeholder={pf.descriptionPlaceholder || 'Tuliskan ringkasan deskripsi sistem atau inovasi riset yang dikembangkan...'}
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
                                        {pf.sectionVisualTitle || '2. Logo Mitra / Institusi Kerjasama'}
                                    </h2>
                                </div>
                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${hasCustomPartnerLogo ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-[#0D5A34] dark:bg-emerald-950 dark:text-emerald-300'}`}>
                                    {hasCustomPartnerLogo 
                                        ? (language === 'en' ? 'Custom Partner Logo Active' : 'Logo Kustom Mitra Aktif') 
                                        : (language === 'en' ? 'Default (Telkom University)' : 'Default (Telkom University)')}
                                </span>
                            </div>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {language === 'en' 
                                    ? 'The STAS-RG logo is fixed on the right. You can upload a partner logo to replace the default Telkom University logo on the left header.' 
                                    : 'Logo STAS-RG bersifat tetap di sebelah kanan. Anda dapat mengunggah logo mitra/kerjasama untuk menggantikan logo default Telkom University di sebelah kiri header.'}
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
                                        {hasCustomPartnerLogo ? (language === 'en' ? 'Partner Logo' : 'Logo Mitra') : 'Telkom University'}
                                    </span>
                                </div>

                                <div className="flex-1 w-full space-y-2">
                                    {isCompressingLogo ? (
                                        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 space-y-2 animate-in fade-in">
                                            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                                                    <span>{logoCompressionProgress?.stage || (language === 'en' ? 'Optimizing logo...' : 'Mengompresi logo otomatis...')}</span>
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
                                                <span>{hasCustomPartnerLogo ? (language === 'en' ? 'Change Partner Logo' : 'Ganti Logo Mitra') : (pf.uploadLogo || 'Upload Logo Mitra')}</span>
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
                                                    <span>{language === 'en' ? 'Reset to Default Logo (Tel-U)' : 'Reset ke Logo Default (Tel-U)'}</span>
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {logoCompressionStats?.wasCompressed && (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                            <span>{language === 'en' ? 'Optimally converted:' : 'Terkonversi optimal:'} {logoCompressionStats.originalSizeStr} &rarr; {logoCompressionStats.compressedSizeStr} ({language === 'en' ? 'Saved' : 'Hemat'} {logoCompressionStats.savedPercent}%)</span>
                                        </div>
                                    )}

                                    <p className="text-[11px] text-zinc-400">
                                        {pf.partnerLogoHint || (language === 'en' ? 'Supports PNG/SVG/WebP. Automatically optimized for crisp rendering.' : 'Mendukung PNG/SVG/WebP. File besar otomatis dikompresi tanpa mengurangi ketajaman logo.')}
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
                                    {language === 'en' ? '3. Prototype Photo / Main Image' : '3. Foto Prototype / Gambar Utama'}
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
                                            {pf.changeImage || (language === 'en' ? 'Change Photo' : 'Ganti Foto')}
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
                                                    <span>{compressionProgress?.stage || (language === 'en' ? 'Compressing image automatically...' : 'Mengompresi gambar otomatis...')}</span>
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
                                                {language === 'en' ? 'Adjusting resolution and quality for optimal print & download.' : 'Menyesuaikan resolusi dan kualitas gambar agar optimal untuk dicetak & diunduh.'}
                                            </p>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center p-4 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-center">
                                            <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                                            <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                                {pf.uploadImage || (language === 'en' ? 'Click to upload prototype photo' : 'Klik untuk upload foto prototype')}
                                            </span>
                                            <span className="text-[11px] text-zinc-400 mt-0.5">
                                                {pf.mainImageUploadHint || (language === 'en' ? 'Supports all image formats (Automatically compressed to stay lightweight & sharp)' : 'Mendukung semua ukuran gambar (Otomatis dikompresi agar ringan & tajam)')}
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
                                            <span>{language === 'en' ? 'Optimally compressed:' : 'Otomatis terkompresi:'} {imageCompressionStats.originalSizeStr} &rarr; {imageCompressionStats.compressedSizeStr} ({language === 'en' ? 'Saved' : 'Hemat'} {imageCompressionStats.savedPercent}%)</span>
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
                                        {language === 'en' ? '4. Content Sections' : '4. Bagian Konten & Poin Riset'}
                                    </h2>
                                </div>

                                {/* Quick Action: Generate all 4 sections from description */}
                                <button
                                    type="button"
                                    onClick={() => handleGenerateOrPolishSection('all_sections', '')}
                                    disabled={polishingSection !== null || (!data.description && !data.name)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-[#0D5A34] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-40"
                                    title={language === 'en' ? 'Generate Problem, Solution, Benefits, and Specifications from Project Description' : 'Generate Problem, Solution, Manfaat, dan Spesifikasi otomatis dari Deskripsi Proyek'}
                                >
                                    {polishingSection === 'all_sections' ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>{language === 'en' ? 'Drafting All Sections...' : 'Menyusun Semua Bagian...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                            <span>{language === 'en' ? 'Generate All Sections from Description' : 'Generate Semua Bagian dari Deskripsi'}</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Section A: Manfaat */}
                            <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                                        <CheckCircle2 className="w-4 h-4 text-[#0D5A34]" />
                                        <span>{language === 'en' ? 'BENEFITS' : 'MANFAAT'}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleGenerateOrPolishSection('benefits', data.benefits?.content)}
                                        disabled={polishingSection === 'benefits' || (!data.description && !data.name && !data.benefits?.content)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-[#0D5A34] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                        title={data.benefits?.content ? (language === 'en' ? 'Polish benefits with AI' : 'Poles poin manfaat dengan AI') : (language === 'en' ? 'Generate benefits from description' : 'Generate poin manfaat otomatis dari deskripsi proyek')}
                                    >
                                        {polishingSection === 'benefits' ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                        )}
                                        <span>{data.benefits?.content ? (pf.aiPolishWithAI || 'Poles AI') : (language === 'en' ? 'Draft from Description' : 'Generate dari Deskripsi')}</span>
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
                                    placeholder={pf.benefitsPlaceholder || (language === 'en' ? 'Write value proposition and applied impact points...' : 'Tuliskan poin-poin manfaat penerapan dan dampak riset inovasi...')}
                                    minHeight="70px"
                                />
                                <TextLimitMeter value={data.benefits?.content} limitKey="benefits" preset={data.layout_preset} />
                            </div>

                            {/* Section B: Spesifikasi */}
                            <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                                        <Wrench className="w-4 h-4 text-[#0D5A34]" />
                                        <span>{language === 'en' ? 'SPECIFICATIONS' : 'SPESIFIKASI'}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleGenerateOrPolishSection('specifications', data.specifications?.content)}
                                        disabled={polishingSection === 'specifications' || (!data.description && !data.name && !data.specifications?.content)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-[#0D5A34] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                        title={data.specifications?.content ? (language === 'en' ? 'Polish specs with AI' : 'Poles spesifikasi teknis dengan AI') : (language === 'en' ? 'Generate specs from description' : 'Generate spesifikasi teknis otomatis dari deskripsi proyek')}
                                    >
                                        {polishingSection === 'specifications' ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                        )}
                                        <span>{data.specifications?.content ? (pf.aiPolishWithAI || 'Poles AI') : (language === 'en' ? 'Draft from Description' : 'Generate dari Deskripsi')}</span>
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
                                    placeholder={pf.specsPlaceholder || (language === 'en' ? 'List hardware specs, sensors, modules, or system components...' : 'Tuliskan spesifikasi teknologi, sensor, modul hardware, atau komponen sistem...')}
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
                                            {language === 'en' ? 'Problem :' : 'Problem :'}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => handleGenerateOrPolishSection('problem', data.problem_solution?.problem)}
                                            disabled={polishingSection === 'problem' || (!data.description && !data.name && !data.problem_solution?.problem)}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-[#0D5A34] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                            title={data.problem_solution?.problem ? (language === 'en' ? 'Polish problem statement with AI' : 'Poles rumusan masalah dengan AI') : (language === 'en' ? 'Generate problem statement from description' : 'Generate rumusan problem otomatis dari deskripsi proyek')}
                                        >
                                            {polishingSection === 'problem' ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                            )}
                                            <span>{data.problem_solution?.problem ? (pf.aiPolishWithAI || 'Poles AI') : (language === 'en' ? 'Draft from Description' : 'Generate dari Deskripsi')}</span>
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
                                        placeholder={pf.problemPlaceholder || (language === 'en' ? 'Describe the real-world pain point or baseline challenge faced in the field...' : 'Jelaskan permasalahan, tantangan, atau kendala utama yang dihadapi di lapangan...')}
                                        minHeight="60px"
                                    />
                                    <TextLimitMeter value={data.problem_solution?.problem} limitKey="problem" preset={data.layout_preset} />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                                            {language === 'en' ? 'Solution :' : 'Solution :'}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => handleGenerateOrPolishSection('solution', data.problem_solution?.solution)}
                                            disabled={polishingSection === 'solution' || (!data.description && !data.name && !data.problem_solution?.solution)}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-[#0D5A34] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                            title={data.problem_solution?.solution ? (language === 'en' ? 'Polish solution with AI' : 'Poles solusi inovatif dengan AI') : (language === 'en' ? 'Generate solution description from project' : 'Generate penjelasan solusi otomatis dari deskripsi proyek')}
                                        >
                                            {polishingSection === 'solution' ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                            )}
                                            <span>{data.problem_solution?.solution ? (pf.aiPolishWithAI || 'Poles AI') : (language === 'en' ? 'Draft from Description' : 'Generate dari Deskripsi')}</span>
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
                                        placeholder={pf.solutionPlaceholder || (language === 'en' ? 'Describe the engineered solution and innovative methods applied...' : 'Jelaskan solusi teknologi dan metode inovatif yang diterapkan untuk menyelesaikan masalah...')}
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
                                    {language === 'en' ? '5. QR Code & External Links' : '5. QR Code & Tautan Eksternal'}
                                </h2>
                            </div>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {language === 'en' 
                                    ? 'A dynamic QR code is generated on the bottom-right of the flyer to direct readers directly to demo videos, research publications, or landing pages.' 
                                    : 'QR code akan dibuat secara otomatis di bagian pojok kanan bawah flyer untuk mengarahkan pembaca langsung ke video demo YouTube, publikasi paper riset, atau URL web landing.'}
                            </p>

                            <div className="space-y-4 pt-1">
                                <div>
                                    {/* Calculated Slug & Showcase URL */}
                                    {(() => {
                                        const calculatedSlug = project?.slug || (data.name ? data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'proyek-riset');
                                        const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
                                        const showcaseUrl = `${originUrl}/showcase/${calculatedSlug}`;
                                        const isShowcaseUrl = data.project_url === showcaseUrl;
                                        const isAutoDefault = !data.project_url;

                                        return (
                                            <div className="space-y-2">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                                        {pf.qrUrlLabel || (language === 'en' ? 'QR Code Link' : 'Tautan QR Code')}
                                                    </label>

                                                    {/* Quick Auto-fill Presets */}
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setData('project_url', showcaseUrl);
                                                                showSuccess(language === 'en' ? 'Showcase Link Applied' : 'Link Showcase Terpasang', `${language === 'en' ? 'QR Code now set to:' : 'QR Code sekarang diatur ke:'} ${showcaseUrl}`);
                                                            }}
                                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                                                                isShowcaseUrl
                                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                                                    : 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[#0D5A34] dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                                            }`}
                                                            title={`${language === 'en' ? 'Auto-fill link to project showcase page:' : 'Otomatis isi link ke halaman showcase:'} ${showcaseUrl}`}
                                                        >
                                                            <Link2 className="w-3.5 h-3.5" />
                                                            <span>{pf.useShowcaseLink || 'Gunakan Link Showcase'}</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => setData('project_url', 'https://www.stas-rg.com')}
                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10.5px] font-medium border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
                                                            title={language === 'en' ? 'Fill link with official CoE STAS-RG website' : 'Isi link ke website resmi CoE STAS-RG'}
                                                        >
                                                            <Globe className="w-3 h-3 text-emerald-600" />
                                                            <span>{language === 'en' ? 'STAS-RG Web' : 'Web STAS-RG'}</span>
                                                        </button>

                                                        {data.project_url && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setData('project_url', '')}
                                                                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-all cursor-pointer"
                                                                title={language === 'en' ? 'Clear link (revert to automatic showcase mode)' : 'Kosongkan tautan (kembali ke mode otomatis showcase)'}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Input Bar */}
                                                <div className="relative">
                                                    <input
                                                        type="url"
                                                        value={data.project_url}
                                                        onChange={(e) => setData('project_url', e.target.value)}
                                                        placeholder={pf.qrUrlPlaceholder || 'https://youtu.be/... atau https://telkomuniversity.ac.id'}
                                                        className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0D5A34] focus:outline-none pr-8 font-mono"
                                                    />
                                                    <QrCode className="w-4 h-4 text-zinc-400 absolute right-3 top-2.5" />
                                                </div>

                                                {/* Dynamic Contextual Helper Card */}
                                                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                                                    isAutoDefault
                                                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                                                        : isShowcaseUrl
                                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100'
                                                        : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                                                }`}>
                                                    <QrCode className={`w-4 h-4 shrink-0 mt-0.5 ${
                                                        isAutoDefault || isShowcaseUrl ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'
                                                    }`} />
                                                    <div className="space-y-1 min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-1.5 font-bold">
                                                            <span>{language === 'en' ? 'QR Code Target Status:' : 'Status Target QR Code:'}</span>
                                                            {isAutoDefault ? (
                                                                <span className="px-2 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 text-[10px] font-extrabold uppercase">
                                                                    {language === 'en' ? 'Automatic to Showcase Page' : 'Otomatis ke Halaman Showcase'}
                                                                </span>
                                                            ) : isShowcaseUrl ? (
                                                                <span className="px-2 py-0.2 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold uppercase">
                                                                    {language === 'en' ? 'Connected to Showcase' : 'Terhubung ke Showcase'}
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-0.2 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-extrabold uppercase">
                                                                    {language === 'en' ? 'Custom External Link' : 'Tautan Eksternal Kustom'}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="text-[11px] leading-relaxed break-all">
                                                            {isAutoDefault ? (
                                                                <span>
                                                                    {language === 'en' 
                                                                        ? 'The QR code on the flyer will automatically direct readers to this public showcase page: ' 
                                                                        : 'QR code pada flyer akan otomatis mengarah ke halaman showcase publik riset ini: '}
                                                                    <strong className="font-mono text-[#0D5A34] dark:text-emerald-400 underline">{showcaseUrl}</strong>
                                                                </span>
                                                            ) : (
                                                                <span>
                                                                    {language === 'en' 
                                                                        ? 'The QR code on the flyer is currently locked to: ' 
                                                                        : 'QR code pada flyer saat ini dikunci mengarah ke: '}
                                                                    <strong className="font-mono text-[#0D5A34] dark:text-emerald-400 underline">{data.project_url}</strong>
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                {errors.project_url && <p className="text-rose-500 text-[11px] mt-1">{errors.project_url}</p>}
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Footer Social & Contact Channels Manager */}
                                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-start lg:items-center justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                                                    {pf.footerSocialTitle || 'Informasi Footer & Saluran Media Sosial'}
                                                </label>
                                            </div>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                {pf.footerSocialDesc || 'Pilih platform media sosial / kontak resmi lab. Ikon akan muncul secara otomatis pada footer flyer tanpa perlu upload icon.'}
                                            </p>
                                        </div>

                                        {/* Presets & Actions (Rata Kanan) */}
                                        <div className="flex flex-wrap items-center justify-end gap-1.5 shrink-0 self-end sm:self-auto">
                                            <button
                                                type="button"
                                                onClick={handleResetSocialLinks}
                                                className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10.5px] font-medium border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
                                                title={language === 'en' ? 'Revert to 3 standard social channels (Web, IG, YT)' : 'Kembalikan ke 3 media sosial standar (Web, IG, YT)'}
                                            >
                                                {pf.presetStandard || 'Standar'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleLoadFullSocialPreset}
                                                className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[#0D5A34] dark:text-emerald-300 text-[10.5px] font-medium border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer"
                                                title={language === 'en' ? 'Load full preset: Web, IG, YT, LinkedIn, and Email' : 'Muat preset lengkap: Web, IG, YT, LinkedIn, dan Email'}
                                            >
                                                {pf.presetFull || 'Lengkap'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleAddSocialLink('facebook')}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0D5A34] hover:bg-[#094226] text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>{pf.addChannel || 'Tambah Saluran'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Social Items List */}
                                    <div className="space-y-2 pt-1">
                                        {Array.isArray(data.social_links) && data.social_links.length > 0 ? (
                                            data.social_links.map((item, index) => {
                                                const currentPlatformConfig = getSocialPlatformConfig(item.platform);
                                                const isDragging = draggedSocialIndex === index;
                                                const isDragOver = dragOverSocialIndex === index && draggedSocialIndex !== index;

                                                return (
                                                    <div
                                                        key={index}
                                                        draggable
                                                        onDragStart={(e) => handleDragStartSocial(e, index)}
                                                        onDragOver={(e) => handleDragOverSocial(e, index)}
                                                        onDragLeave={(e) => handleDragLeaveSocial(e, index)}
                                                        onDrop={(e) => handleDropSocial(e, index)}
                                                        onDragEnd={handleDragEndSocial}
                                                        className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl border transition-all ${
                                                            isDragging
                                                                ? 'opacity-40 border-dashed border-[#0D5A34] bg-emerald-50/50 dark:bg-emerald-950/20 shadow-inner'
                                                                : isDragOver
                                                                ? 'ring-2 ring-[#0D5A34] border-[#0D5A34] bg-emerald-50/70 dark:bg-emerald-950/40 shadow-md scale-[1.01]'
                                                                : 'bg-zinc-50/90 dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                                                        }`}
                                                    >
                                                        {/* Reorder / Drag Grip Handle & Fast Move Buttons */}
                                                        <div className="flex items-center gap-0.5 shrink-0 self-start sm:self-center">
                                                            <div
                                                                className="p-1 rounded-md text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-grab active:cursor-grabbing hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
                                                                title={pf.dragToReorder || 'Tahan dan geser untuk mengatur urutan saluran'}
                                                            >
                                                                <GripVertical className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex sm:flex-col gap-0.5">
                                                                <button
                                                                    type="button"
                                                                    disabled={index === 0}
                                                                    onClick={() => handleMoveSocialLink(index, index - 1)}
                                                                    className="p-0.5 rounded text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                                                    title={pf.moveUp || 'Geser ke atas'}
                                                                >
                                                                    <ChevronUp className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    disabled={index === data.social_links.length - 1}
                                                                    onClick={() => handleMoveSocialLink(index, index + 1)}
                                                                    className="p-0.5 rounded text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                                                    title={pf.moveDown || 'Geser ke bawah'}
                                                                >
                                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Platform Selector with Auto-Icon */}
                                                        <div className="flex items-center gap-2 w-full sm:w-48 shrink-0">
                                                            <div
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-2xs"
                                                                style={{ color: currentPlatformConfig.color || '#0D5A34' }}
                                                            >
                                                                <SocialIcon
                                                                    platform={item.platform}
                                                                    style={{ width: '15px', height: '15px' }}
                                                                />
                                                            </div>
                                                            <select
                                                                value={item.platform || 'website'}
                                                                onChange={(e) => handleUpdateSocialLink(index, 'platform', e.target.value)}
                                                                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-semibold focus:border-[#0D5A34] focus:outline-none cursor-pointer"
                                                            >
                                                                {AVAILABLE_SOCIAL_PLATFORMS.map((plat) => (
                                                                    <option key={plat.id} value={plat.id}>
                                                                        {plat.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {/* Account Handle / URL Input */}
                                                        <div className="flex-1 relative">
                                                            <input
                                                                type="text"
                                                                value={item.value || ''}
                                                                onChange={(e) => handleUpdateSocialLink(index, 'value', e.target.value)}
                                                                placeholder={currentPlatformConfig.placeholder}
                                                                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-mono focus:border-[#0D5A34] focus:outline-none"
                                                            />
                                                        </div>

                                                        {/* Quick Delete Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveSocialLink(index)}
                                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer self-end sm:self-center"
                                                            title={pf.deleteChannel || 'Hapus saluran ini'}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30 text-center space-y-2">
                                                <p className="text-xs text-zinc-500">{pf.noChannels || 'Belum ada media sosial / kontak yang ditambahkan.'}</p>
                                                <button
                                                    type="button"
                                                    onClick={handleResetSocialLinks}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>{pf.applyStandardChannels || 'Pasang Standar STAS-RG (Web, IG, YT)'}</span>
                                                </button>
                                            </div>
                                        )}
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
                                    {language === 'en' ? '6. Publication Status to Landing Page' : '6. Status Publikasi ke Landing Page'}
                                </h2>
                            </div>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {language === 'en' 
                                    ? 'Determine whether this project should be immediately published to the public landing page or stored as an internal draft.' 
                                    : 'Tentukan apakah project ini ingin langsung dipublikasikan dan ditampilkan pada Landing Page STAS RG atau disimpan sebagai Draft internal.'}
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
                                            {language === 'en' ? 'Publish to Landing Page' : 'Publikasikan ke Landing Page'}
                                        </span>
                                        <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                            {language === 'en' 
                                                ? 'Project will appear on the public showcase on the main landing page, allowing readers to view full research details.' 
                                                : 'Project akan tampil pada showcase publik di halaman utama dan pembaca dapat melihat detail riset lengkap.'}
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
                                            {language === 'en' ? 'Save as Draft (Internal)' : 'Simpan Sebagai Draft (Internal)'}
                                        </span>
                                        <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                            {language === 'en' 
                                                ? 'Only visible and editable within the Admin Panel. Hidden from public showcase.' 
                                                : 'Hanya dapat dilihat dan diedit oleh Anda di Admin Panel. Belum ditampilkan di halaman showcase publik.'}
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
                                    {pf.livePreviewTitle || 'Live Output Preview'}
                                </h3>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                                {/* Export Sosmed & Multi-Format Action */}
                                <button
                                    type="button"
                                    onClick={() => setIsExportSosmedModalOpen(true)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[#0D5A34] dark:text-emerald-300 text-[11px] font-bold border border-emerald-300/80 dark:border-emerald-800 transition-colors cursor-pointer shadow-xs"
                                    title={language === 'en' ? 'Export Social Media (Feed 1:1, Story 9:16, PNG, JPG, Copy Image)' : 'Ekspor Media Sosial (Feed 1:1, Story 9:16, PNG, JPG, Salin Gambar)'}
                                >
                                    <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>{pf.multiFormatBtn || 'Multi-Format'}</span>
                                </button>

                                {/* Print Quick Action */}
                                <button
                                    type="button"
                                    onClick={handleLivePrint}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[11px] font-semibold transition-colors cursor-pointer"
                                    title={language === 'en' ? 'Print Flyer A4 Preview' : 'Print Flyer A4 Preview'}
                                >
                                    <Printer className="w-3 h-3" />
                                    <span>{pf.printBtn || 'Print'}</span>
                                </button>

                                {/* Download PNG Quick Action */}
                                <button
                                    type="button"
                                    onClick={handleLiveDownloadPng}
                                    disabled={livePngLoading}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer disabled:cursor-wait"
                                    title={language === 'en' ? 'Download High-Resolution PNG (300 DPI)' : 'Download Gambar PNG Resolusi Tinggi (300 DPI)'}
                                >
                                    {livePngLoading ? (
                                        <>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            <span>PNG...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon className="w-3 h-3" />
                                            <span>{pf.downloadPngBtn || 'PNG'}</span>
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
                                            <span>{language === 'en' ? 'Warning: Text Exceeds Ideal A4 Layout Limits' : 'Peringatan: Teks Melebihi Batas Ideal Layout A4'}</span>
                                        </p>
                                        <p className="text-[11px] text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
                                            {language === 'en' 
                                                ? 'The flyer is locked to 1 single A4 page. The following text fields are too long and may clip when printed or downloaded:' 
                                                : 'Flyer dikunci pada 1 halaman A4. Bagian teks berikut terlalu panjang dan berisiko terpotong saat dicetak atau diunduh:'}
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
                                    <span>{language === 'en' ? 'Some text fields are nearing the 1-page A4 layout limit.' : 'Beberapa kolom teks mendekati batas maksimum 1 halaman A4.'}</span>
                                </div>
                                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold shrink-0">
                                    {language === 'en' ? 'Review' : 'Periksa kembali'}
                                </span>
                            </div>
                        ) : (
                            <div className="px-3 py-1.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>{language === 'en' ? 'Optimal A4 Layout (Fits Exactly 1 Page)' : 'Layout A4 Optimal (Teks Pas 1 Halaman)'}</span>
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700/90 dark:text-emerald-400/90 font-semibold">
                                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    <span>{language === 'en' ? '100% Fits A4' : '100% Pas A4'}</span>
                                </span>
                            </div>
                        )}

                        {/* Document Render Canvas */}
                        <div className="w-full">
                            <ProjectPreview project={previewProject} isLive={true} id="live-preview-canvas" />
                        </div>
                    </div>

                </div>

                {/* Export Multi-Format & Media Sosial Modal */}
                <ExportSosmedModal
                    project={previewProject}
                    isOpen={isExportSosmedModalOpen}
                    onClose={() => setIsExportSosmedModalOpen(false)}
                />

            </div>
        </AdminLayout>
    );
}
