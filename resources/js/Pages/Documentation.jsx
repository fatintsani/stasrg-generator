import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { AppProvider, useApp } from '../Context/AppContext';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import {
    BookOpen,
    FileText,
    Layers,
    Settings,
    Users,
    Image,
    BarChart3,
    Shield,
    ChevronRight,
    Search,
    ArrowUp,
    Sparkles,
    Palette,
    Download,
    QrCode,
    FolderKanban,
    LifeBuoy,
    Zap,
    CheckCircle2,
    Copy,
    Check,
    ExternalLink,
    Hash,
    List,
    Monitor,
    Printer,
    Globe,
    Lock,
    UserCheck,
    Activity,
    HardDrive,
    Paintbrush,
    LayoutTemplate,
    Workflow,
    PenLine,
    Eye,
    Upload,
    FileCheck,
    Brain,
    RefreshCw,
} from 'lucide-react';

/* ─────────────────── TABLE OF CONTENTS DATA ─────────────────── */
const tocSections = [
    { id: 'getting-started', label: 'Memulai', icon: Zap },
    { id: 'dashboard', label: 'Dashboard', icon: Monitor },
    { id: 'projects', label: 'Manajemen Proyek', icon: FolderKanban },
    { id: 'templates', label: 'Template Builder', icon: LayoutTemplate },
    { id: 'document-formats', label: 'Format Dokumen', icon: FileText },
    { id: 'design-styles', label: 'Gaya Desain Visual', icon: Paintbrush },
    { id: 'color-themes', label: 'Tema Warna', icon: Palette },
    { id: 'preview-export', label: 'Preview & Export', icon: Download },
    { id: 'media-library', label: 'Media & Aset', icon: Image },
    { id: 'ai-features', label: 'Fitur AI', icon: Brain },
    { id: 'users-access', label: 'Pengguna & Akses', icon: Users },
    { id: 'analytics', label: 'Analytics & Insight', icon: BarChart3 },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
    { id: 'security', label: 'Keamanan', icon: Shield },
    { id: 'faq', label: 'FAQ', icon: LifeBuoy },
];

/* ─────────────────── DOC SECTION COMPONENT ─────────────────── */
function DocSection({ id, icon: Icon, title, badge, children }) {
    return (
        <section id={id} className="scroll-mt-28 mb-12 sm:mb-16">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#0AB600]" />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {title}
                    </h2>
                    {badge && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30">
                            {badge}
                        </span>
                    )}
                </div>
            </div>
            <div className="pl-0 sm:pl-[52px] space-y-4">
                {children}
            </div>
        </section>
    );
}

/* ─────────────────── INFO CARD COMPONENT ─────────────────── */
function InfoCard({ icon: Icon, title, children, accent = false }) {
    return (
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            accent
                ? 'bg-[#0AB600]/5 dark:bg-[#0AB600]/10 border-[#0AB600]/30'
                : 'bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200/60 dark:border-zinc-700/60'
        }`}>
            {Icon && (
                <div className="flex items-center gap-2.5 mb-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${accent ? 'text-[#0AB600]' : 'text-zinc-500 dark:text-zinc-400'}`} />
                    <span className={`text-sm font-bold ${accent ? 'text-[#0AB600]' : 'text-slate-800 dark:text-zinc-200'}`}>
                        {title}
                    </span>
                </div>
            )}
            <div className="text-[13px] sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-2">
                {children}
            </div>
        </div>
    );
}

/* ─────────────────── STEP ITEM COMPONENT ─────────────────── */
function StepItem({ number, title, description }) {
    return (
        <div className="flex gap-3.5">
            <div className="w-7 h-7 rounded-lg bg-[#0AB600]/10 border border-[#0AB600]/30 flex items-center justify-center text-xs font-extrabold text-[#0AB600] shrink-0 mt-0.5">
                {number}
            </div>
            <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-1">{title}</h4>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

/* ─────────────────── FAQ ITEM COMPONENT ─────────────────── */
function FaqItem({ question, answer }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-zinc-200/60 dark:border-zinc-700/60 rounded-xl overflow-hidden transition-all">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 text-left bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
            >
                <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{question}</span>
                <ChevronRight className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
            </button>
            {open && (
                <div className="px-4 sm:px-5 pb-4 pt-2 text-[13px] sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                    {answer}
                </div>
            )}
        </div>
    );
}

/* ─────────────────── TABLE COMPONENT ─────────────────── */
function DocTable({ headers, rows }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
            <table className="w-full text-[13px] sm:text-sm">
                <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200/60 dark:border-zinc-700/60">
                        {headers.map((h, i) => (
                            <th key={i} className="px-4 py-2.5 text-left font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider text-xs">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {rows.map((row, i) => (
                        <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                            {row.map((cell, j) => (
                                <td key={j} className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ═══════════════════ MAIN DOCUMENTATION CONTENT ═══════════════════ */
function DocsContent() {
    const { t, language } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSection, setActiveSection] = useState('getting-started');
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [copied, setCopied] = useState(false);
    const contentRef = useRef(null);

    // Track active section on scroll
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);

            const sections = tocSections.map(s => document.getElementById(s.id)).filter(Boolean);
            for (let i = sections.length - 1; i >= 0; i--) {
                const rect = sections[i].getBoundingClientRect();
                if (rect.top <= 140) {
                    setActiveSection(tocSections[i].id);
                    break;
                }
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Filtered TOC
    const filteredToc = tocSections.filter(s =>
        s.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const handleCopyCommand = (cmd) => {
        navigator.clipboard.writeText(cmd);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <Head title="Dokumentasi Lengkap - STAS RG Projects">
                <meta name="description" content="Dokumentasi lengkap platform STAS RG Projects: panduan pengguna, format dokumen, gaya desain, fitur AI, template builder, dan referensi API." />
            </Head>

            <div className="min-h-screen flex flex-col bg-[#FAFBFD] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 selection:bg-[#0AB600]/20 selection:text-[#0AB600] font-sans antialiased transition-colors">
                <Navbar />

                <main className="flex-grow py-10 sm:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                        {/* ═══════ HERO HEADER ═══════ */}
                        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-semibold tracking-wider uppercase bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30 shadow-xs">
                                <BookOpen className="w-4 h-4 text-[#0AB600]" />
                                <span>DOKUMENTASI PLATFORM</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Dokumentasi STAS RG Projects
                            </h1>

                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                                Panduan lengkap untuk menguasai seluruh fitur platform — dari pembuatan proyek, kustomisasi template visual, hingga ekspor multi-format dan integrasi AI.
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-400">
                                    <FileCheck className="w-3.5 h-3.5" />
                                    <span>Versi 2.0</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-400">
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>Diperbarui Sep 2026</span>
                                </span>
                            </div>
                        </div>

                        {/* ═══════ LAYOUT: SIDEBAR + CONTENT ═══════ */}
                        <div className="flex flex-col lg:flex-row gap-8">

                            {/* ──── SIDEBAR (Table of Contents) ──── */}
                            <aside className="lg:w-64 xl:w-72 shrink-0">
                                <div className="lg:sticky lg:top-24 space-y-4">
                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Cari topik..."
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-700/60 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0AB600]/40 focus:border-[#0AB600]/50 transition-all"
                                        />
                                    </div>

                                    {/* TOC List */}
                                    <nav className="p-3 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
                                        <div className="flex items-center gap-2 px-3 py-2 mb-1">
                                            <List className="w-3.5 h-3.5 text-zinc-400" />
                                            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Daftar Isi</span>
                                        </div>
                                        <div className="space-y-0.5 max-h-[60vh] overflow-y-auto">
                                            {filteredToc.map((item) => {
                                                const ItemIcon = item.icon;
                                                const isActive = activeSection === item.id;
                                                return (
                                                    <a
                                                        key={item.id}
                                                        href={`#${item.id}`}
                                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                                            isActive
                                                                ? 'bg-[#0AB600]/10 text-[#0AB600] font-bold border-l-2 border-[#0AB600]'
                                                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                                                        }`}
                                                    >
                                                        <ItemIcon className="w-3.5 h-3.5 shrink-0" />
                                                        <span>{item.label}</span>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </nav>

                                    {/* Quick Actions */}
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0AB600]/5 to-teal-500/5 dark:from-[#0AB600]/10 dark:to-teal-500/10 border border-[#0AB600]/20 dark:border-[#0AB600]/30">
                                        <h4 className="text-xs font-bold text-[#0AB600] uppercase tracking-wider mb-3">Akses Cepat</h4>
                                        <div className="space-y-2">
                                            <Link href="/login" className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 hover:text-[#0AB600] transition-colors">
                                                <ExternalLink className="w-3 h-3" />
                                                <span>Login ke Platform</span>
                                            </Link>
                                            <Link href="/support" className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 hover:text-[#0AB600] transition-colors">
                                                <LifeBuoy className="w-3 h-3" />
                                                <span>Pusat Bantuan</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </aside>

                            {/* ──── MAIN CONTENT ──── */}
                            <div ref={contentRef} className="flex-1 min-w-0">
                                <div className="max-w-3xl">

                                    {/* ═══════ 1. GETTING STARTED ═══════ */}
                                    <DocSection id="getting-started" icon={Zap} title="Memulai" badge="QUICK START">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            STAS RG Projects adalah platform internal CoE STAS-RG (Center of Excellence — Smart Technology, Advanced System, & Research Group) di Telkom University. Platform ini dirancang khusus untuk mempercepat proses dokumentasi, standardisasi, dan publikasi proyek riset dalam berbagai format visual profesional.
                                        </p>

                                        <InfoCard icon={Workflow} title="Alur Kerja Dasar" accent>
                                            <div className="space-y-3">
                                                <StepItem number="1" title="Buat Proyek Baru" description="Navigasi ke menu 'Projects' dan klik tombol 'Buat Proyek'. Isi metadata dasar seperti nama, kategori, dan deskripsi." />
                                                <StepItem number="2" title="Lengkapi Informasi" description="Isi seluruh field data proyek: judul, subjudul, deskripsi, spesifikasi teknis, manfaat, dan problem-solution. Upload gambar produk dan logo mitra." />
                                                <StepItem number="3" title="Pilih Format & Gaya" description="Pilih format dokumen (A4, X-Banner, Pitch Deck, dll), gaya desain visual, dan tema warna yang sesuai kebutuhan publikasi." />
                                                <StepItem number="4" title="Generate & Export" description="Klik 'Generate & Simpan' untuk melihat preview live. Export ke PNG/PDF atau format media sosial (Instagram, WhatsApp Story, dll)." />
                                            </div>
                                        </InfoCard>

                                        <InfoCard icon={Shield} title="Persyaratan Akses">
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Akun terdaftar dan <strong>disetujui admin</strong> (approval-based registration)</li>
                                                <li>Browser modern (Chrome, Firefox, Edge, Safari versi terbaru)</li>
                                                <li>Koneksi internet stabil untuk fitur AI dan real-time preview</li>
                                            </ul>
                                        </InfoCard>
                                    </DocSection>

                                    {/* ═══════ 2. DASHBOARD ═══════ */}
                                    <DocSection id="dashboard" icon={Monitor} title="Dashboard">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Dashboard adalah pusat kendali utama yang menampilkan ringkasan aktivitas terkini, statistik proyek, dan akses cepat ke semua modul platform.
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <InfoCard icon={BarChart3} title="Statistik Real-time">
                                                <p>Menampilkan jumlah total proyek, proyek terpublikasi, kategori aktif, pengguna terdaftar, dan scan QR code terkini.</p>
                                            </InfoCard>
                                            <InfoCard icon={Activity} title="Log Aktivitas">
                                                <p>Riwayat lengkap create, update, delete, export, dan print yang dilakukan seluruh pengguna platform.</p>
                                            </InfoCard>
                                            <InfoCard icon={FolderKanban} title="Proyek Terbaru">
                                                <p>Daftar 5 proyek terakhir yang diperbarui, dengan akses langsung ke edit dan preview.</p>
                                            </InfoCard>
                                            <InfoCard icon={Globe} title="Pencarian Global">
                                                <p>Fitur pencarian cepat di seluruh proyek, template, pengguna, dan log aktivitas via shortcut keyboard.</p>
                                            </InfoCard>
                                        </div>
                                    </DocSection>

                                    {/* ═══════ 3. MANAJEMEN PROYEK ═══════ */}
                                    <DocSection id="projects" icon={FolderKanban} title="Manajemen Proyek">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Modul inti platform untuk membuat, mengedit, menduplikasi, dan mengelola seluruh proyek riset. Setiap proyek menyimpan metadata lengkap yang diperlukan untuk menghasilkan berbagai format dokumen publikasi.
                                        </p>

                                        <DocTable
                                            headers={['Field', 'Deskripsi', 'Wajib']}
                                            rows={[
                                                ['Nama Proyek', 'Identifier unik proyek (auto-generate slug)', <span key="req1" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0AB600]"><Check className="w-3.5 h-3.5" /> Wajib</span>],
                                                ['Kategori', 'Klasifikasi domain riset (IoT, AI/ML, Robotics, dll)', <span key="req2" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0AB600]"><Check className="w-3.5 h-3.5" /> Wajib</span>],
                                                ['Judul & Subjudul', 'Headline utama dan tagline untuk flyer', <span key="req3" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0AB600]"><Check className="w-3.5 h-3.5" /> Wajib</span>],
                                                ['Deskripsi', 'Penjelasan komprehensif proyek (maks. ~300 kata)', <span key="req4" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0AB600]"><Check className="w-3.5 h-3.5" /> Wajib</span>],
                                                ['Gambar Utama', 'Foto produk/prototipe (JPG/PNG, maks. 5MB)', <span key="req5" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0AB600]"><Check className="w-3.5 h-3.5" /> Wajib</span>],
                                                ['Spesifikasi', 'Detail teknis, teknologi, framework', 'Opsional'],
                                                ['Manfaat', 'Poin-poin keunggulan dan dampak riset', 'Opsional'],
                                                ['Problem & Solution', 'Narasi masalah yang dipecahkan dan solusi', 'Opsional'],
                                                ['URL Proyek', 'Link demo, video YouTube, atau repository', 'Opsional'],
                                                ['Logo Mitra', 'Logo instansi kolaborator', 'Opsional'],
                                                ['Footer Sosial', 'Link website, Instagram, YouTube', 'Opsional'],
                                            ]}
                                        />

                                        <InfoCard icon={Copy} title="Duplikasi Proyek">
                                            <p>Klik tombol <strong>Duplikasi</strong> pada kartu proyek untuk membuat salinan lengkap beserta semua metadata, gambar, dan konfigurasi layout. Berguna untuk membuat variasi proyek yang serupa.</p>
                                        </InfoCard>

                                        <InfoCard icon={Eye} title="Status Publikasi">
                                            <p>Proyek memiliki 2 status: <strong>Draft</strong> (hanya visible di admin) dan <strong>Published</strong> (tampil di showcase publik dan dapat diakses via QR code).</p>
                                        </InfoCard>
                                    </DocSection>

                                    {/* ═══════ 4. TEMPLATE BUILDER ═══════ */}
                                    <DocSection id="templates" icon={LayoutTemplate} title="Template Builder" badge="NEW">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Fitur Template Builder memungkinkan pengguna untuk menyimpan, mengelola, dan menggunakan ulang konfigurasi desain proyek sebagai template yang siap pakai.
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <InfoCard icon={PenLine} title="Buat Template Baru">
                                                <p>Buat template dari nol dengan menentukan nama, kategori, format dokumen, gaya desain, tema warna, dan boilerplate header/footer.</p>
                                            </InfoCard>
                                            <InfoCard icon={Download} title="Simpan dari Proyek">
                                                <p>Simpan konfigurasi proyek aktif sebagai template baru langsung dari halaman form proyek via tombol "Simpan Template".</p>
                                            </InfoCard>
                                            <InfoCard icon={Copy} title="Duplikasi Template">
                                                <p>Gandakan template eksisting untuk membuat variasi tanpa mengubah template asal.</p>
                                            </InfoCard>
                                            <InfoCard icon={FolderKanban} title="Terapkan ke Proyek">
                                                <p>Pilih template dari modal "Pilih Template" saat membuat atau mengedit proyek untuk menerapkan seluruh konfigurasi visual sekaligus.</p>
                                            </InfoCard>
                                        </div>
                                    </DocSection>

                                    {/* ═══════ 5. FORMAT DOKUMEN ═══════ */}
                                    <DocSection id="document-formats" icon={FileText} title="Format Dokumen Publikasi">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Platform mendukung 6 format dokumen publikasi yang masing-masing dirancang untuk skenario penggunaan berbeda — dari cetak fisik hingga media sosial digital.
                                        </p>

                                        <DocTable
                                            headers={['Format', 'Ukuran / Rasio', 'Kegunaan Utama']}
                                            rows={[
                                                [<strong key="a4">A4 Flyer Standar</strong>, '210 × 297 mm (A4 Portrait)', 'Leaflet cetak, arsip berkas, poster 1 halaman'],
                                                [<strong key="xb">X-Banner</strong>, '60 × 160 cm (Vertikal)', 'Booth pameran, expo teknologi, seminar'],
                                                [<strong key="fs">Factsheet 2-Kolom</strong>, 'Executive Brief (A4)', 'Ringkasan eksekutif investor, pitch brief'],
                                                [<strong key="pd">Pitch Deck Poster</strong>, '16:9 Widescreen', 'Layar TV pameran, slide pitch, digital signage'],
                                                [<strong key="ig">Instagram / LinkedIn Feed</strong>, '1080 × 1080 px (1:1)', 'Feed media sosial, carousel riset'],
                                                [<strong key="st">Instagram Story / WA Status</strong>, '1080 × 1920 px (9:16)', 'IG Story, WhatsApp Status, reels'],
                                            ]}
                                        />
                                    </DocSection>

                                    {/* ═══════ 6. GAYA DESAIN VISUAL ═══════ */}
                                    <DocSection id="design-styles" icon={Paintbrush} title="Gaya Desain Visual Kanvas">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Setiap format dokumen dapat dipadukan dengan 5 gaya desain visual yang unik. Gaya desain menentukan hierarki visual, tipografi, tata letak kartu, dan estetika keseluruhan kanvas.
                                        </p>

                                        <div className="space-y-3">
                                            <InfoCard icon={Layers} title="1. CoE Classic Standard">
                                                <p>Layout resmi institusi CoE STAS-RG dengan header logo dual (STAS-RG & Telkom University), badge kategori solid, separator bar bersih, dan spesifikasi terstruktur. Cocok untuk dokumen formal dan arsip resmi.</p>
                                            </InfoCard>
                                            <InfoCard icon={Sparkles} title="2. Modern Split Hero">
                                                <p>Aksen border gradien dinamis, ribbon warna tema vertikal, hero frame asimetris, dan pill badges modern. Ideal untuk presentasi yang berkesan kontemporer dan profesional.</p>
                                            </InfoCard>
                                            <InfoCard icon={Layers} title="3. Infographic Cards">
                                                <p>Modul kartu berbingkai rounded (rounded-2xl/3xl), alur inovasi problem-to-solution, dan feature pills ber-ikon. Eye-catching untuk expo, investor pitch, dan poster pameran.</p>
                                            </InfoCard>
                                            <InfoCard icon={Hash} title="4. Minimalist Swiss Grid">
                                                <p>Desain presisi tinggi dengan border monokromatik tajam (rounded-none), garis grid Swiss, tipografi sans-serif kontras tinggi, dan technical badges monospace. Estetika Bauhaus/Swiss design.</p>
                                            </InfoCard>
                                            <InfoCard icon={FileText} title="5. Academic Paper Brief">
                                                <p>Format 2-kolom formal terinspirasi prosiding IEEE/jurnal ilmiah. Section terstruktur (Abstract, Problem & Methodology, Key Results), figure caption ilmiah, dan header simposium.</p>
                                            </InfoCard>
                                        </div>
                                    </DocSection>

                                    {/* ═══════ 7. TEMA WARNA ═══════ */}
                                    <DocSection id="color-themes" icon={Palette} title="Tema Warna">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Sistem tema warna menyediakan palet warna siap pakai yang mempengaruhi aksen, gradien, badge, dan elemen dekoratif pada kanvas flyer. Setiap tema kompatibel dengan semua format dokumen dan gaya desain.
                                        </p>

                                        <DocTable
                                            headers={['Tema', 'Warna Utama', 'Karakter']}
                                            rows={[
                                                ['STAS-RG Green (Default)', <span key="c1" className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0AB600] inline-block shadow-xs" /> Hijau CoE (#0AB600)</span>, 'Identitas resmi institusi'],
                                                ['Ocean Blue', <span key="c2" className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-xs" /> Biru Laut</span>, 'Profesional & tenang'],
                                                ['Sunset Amber', <span key="c3" className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs" /> Amber Hangat</span>, 'Energik & modern'],
                                                ['Royal Purple', <span key="c4" className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block shadow-xs" /> Ungu Royal</span>, 'Premium & elegan'],
                                                ['Rose Pink', <span key="c5" className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-xs" /> Merah Muda</span>, 'Dinamis & berani'],
                                                ['Slate Mono', <span key="c6" className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block shadow-xs" /> Abu-abu Slate</span>, 'Minimalis & formal'],
                                            ]}
                                        />
                                    </DocSection>

                                    {/* ═══════ 8. PREVIEW & EXPORT ═══════ */}
                                    <DocSection id="preview-export" icon={Download} title="Preview & Export">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Preview live menampilkan rendering real-time kanvas flyer sesuai data, format, dan gaya yang dipilih. Sistem export mendukung berbagai format output.
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <InfoCard icon={Eye} title="Live Preview">
                                                <p>Kanvas flyer dirender secara real-time setiap kali data proyek diubah. Mendukung evaluasi layout otomatis (indikator "pas 1 halaman").</p>
                                            </InfoCard>
                                            <InfoCard icon={Printer} title="Export PNG / PDF">
                                                <p>Export kanvas ke format PNG resolusi tinggi atau PDF siap cetak. Mendukung rasio DPI optimal untuk kualitas cetak.</p>
                                            </InfoCard>
                                            <InfoCard icon={QrCode} title="QR Code Otomatis">
                                                <p>QR code di-generate otomatis dari URL proyek. Setiap scan QR tercatat di analytics untuk pelacakan engagement.</p>
                                            </InfoCard>
                                            <InfoCard icon={Monitor} title="Export Media Sosial">
                                                <p>Modal export khusus untuk Instagram Feed (1:1), Instagram Story (9:16), LinkedIn, dan WhatsApp Status dengan format dan rasio yang presisi.</p>
                                            </InfoCard>
                                        </div>
                                    </DocSection>

                                    {/* ═══════ 9. MEDIA & ASET ═══════ */}
                                    <DocSection id="media-library" icon={Image} title="Media & Perpustakaan Aset">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Perpustakaan aset terpusat untuk mengelola gambar produk, logo mitra terverifikasi, ikon, dan aset visual lainnya yang digunakan dalam proyek.
                                        </p>

                                        <InfoCard icon={Upload} title="Upload & Validasi">
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Format yang didukung: JPG, JPEG, PNG, WebP</li>
                                                <li>Ukuran maksimum per file: <strong>5 MB</strong></li>
                                                <li>Kompresi otomatis untuk gambar di atas 1 MB</li>
                                                <li>Kategori aset: Foto Produk, Logo Mitra, Ikon, Lainnya</li>
                                                <li>Aset dapat digunakan ulang di banyak proyek via Asset Picker</li>
                                            </ul>
                                        </InfoCard>
                                    </DocSection>

                                    {/* ═══════ 10. FITUR AI ═══════ */}
                                    <DocSection id="ai-features" icon={Brain} title="Fitur AI" badge="BETA">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Integrasi AI untuk mempercepat proses penulisan konten proyek. Didukung oleh Gemini AI melalui API key yang dikonfigurasi di Settings.
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <InfoCard icon={Sparkles} title="AI Generate Proyek" accent>
                                                <p>Generate seluruh data proyek sekaligus dari deskripsi singkat. AI akan menghasilkan judul, subjudul, deskripsi, spesifikasi, manfaat, dan problem-solution.</p>
                                            </InfoCard>
                                            <InfoCard icon={PenLine} title="AI Polish Per-Seksi">
                                                <p>Perbaiki dan tingkatkan kualitas penulisan per field (deskripsi, manfaat, spesifikasi) secara individual menggunakan AI.</p>
                                            </InfoCard>
                                        </div>

                                        <InfoCard icon={Settings} title="Konfigurasi AI">
                                            <p>Konfigurasi API key Gemini AI, model, dan parameter di menu <strong>Settings → AI Configuration</strong>. Tes koneksi tersedia untuk memvalidasi API key sebelum digunakan.</p>
                                        </InfoCard>
                                    </DocSection>

                                    {/* ═══════ 11. PENGGUNA & AKSES ═══════ */}
                                    <DocSection id="users-access" icon={Users} title="Pengguna & Akses">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Sistem pengelolaan pengguna dengan mekanisme approval-based registration untuk memastikan hanya peneliti dan engineer terverifikasi yang memiliki akses.
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <InfoCard icon={UserCheck} title="Approval Registration">
                                                <p>Setiap pendaftaran baru memerlukan persetujuan admin sebelum akun dapat mengakses platform. Admin dapat approve atau reject dari halaman Users.</p>
                                            </InfoCard>
                                            <InfoCard icon={Lock} title="Autentikasi">
                                                <p>Login via email/password, Google OAuth, atau Passkey (WebAuthn biometric). Mendukung forgot password via OTP email.</p>
                                            </InfoCard>
                                        </div>
                                    </DocSection>

                                    {/* ═══════ 12. ANALYTICS ═══════ */}
                                    <DocSection id="analytics" icon={BarChart3} title="Analytics & Insight">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Modul analytics menyediakan metrik engagement dan aktivitas platform secara komprehensif.
                                        </p>

                                        <InfoCard icon={BarChart3} title="Metrik yang Dilacak">
                                            <ul className="list-disc list-inside space-y-1">
                                                <li><strong>QR Code Scans:</strong> Jumlah scan per proyek, distribusi waktu, sumber device</li>
                                                <li><strong>Export & Print:</strong> Frekuensi export PNG/PDF, format media sosial yang paling sering digunakan</li>
                                                <li><strong>Proyek Views:</strong> Kunjungan halaman detail publik per proyek</li>
                                                <li><strong>User Activity:</strong> Login frequency, proyek per pengguna, distribusi kategori</li>
                                            </ul>
                                        </InfoCard>
                                    </DocSection>

                                    {/* ═══════ 13. PENGATURAN ═══════ */}
                                    <DocSection id="settings" icon={Settings} title="Pengaturan">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Halaman pengaturan memungkinkan konfigurasi profil, keamanan, preferensi tampilan, dan parameter sistem.
                                        </p>

                                        <DocTable
                                            headers={['Kategori', 'Fitur']}
                                            rows={[
                                                ['Profil', 'Nama, email, foto profil, institusi'],
                                                ['Keamanan', 'Ubah password, kelola passkey biometrik'],
                                                ['Tampilan', 'Tema (light/dark), bahasa (ID/EN), font aplikasi'],
                                                ['AI', 'Konfigurasi API key Gemini, model, tes koneksi'],
                                                ['Sistem', 'Toggle maintenance mode, clear cache, optimize'],
                                            ]}
                                        />
                                    </DocSection>

                                    {/* ═══════ 14. KEAMANAN ═══════ */}
                                    <DocSection id="security" icon={Shield} title="Keamanan">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Platform menerapkan beberapa lapisan keamanan untuk melindungi data riset dan akses pengguna.
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <InfoCard icon={Lock} title="Autentikasi Multi-Layer">
                                                <p>Password hashing bcrypt, Google OAuth 2.0, WebAuthn Passkey biometric, dan OTP email reset.</p>
                                            </InfoCard>
                                            <InfoCard icon={Shield} title="Rate Limiting">
                                                <p>Throttle pada login (6/menit), register (6/menit), support (10/menit), dan export tracking (30/menit).</p>
                                            </InfoCard>
                                            <InfoCard icon={UserCheck} title="Approval Gate">
                                                <p>Middleware "approved" memastikan hanya pengguna yang di-approve admin yang dapat mengakses area admin.</p>
                                            </InfoCard>
                                            <InfoCard icon={Activity} title="Audit Trail">
                                                <p>Semua aksi create, update, delete, export, dan login tercatat dalam Activity Log dengan timestamp dan metadata.</p>
                                            </InfoCard>
                                        </div>
                                    </DocSection>

                                    {/* ═══════ 15. FAQ ═══════ */}
                                    <DocSection id="faq" icon={LifeBuoy} title="FAQ (Pertanyaan Umum)">
                                        <div className="space-y-2">
                                            <FaqItem
                                                question="Bagaimana cara mendaftar akun baru?"
                                                answer="Klik 'Register' di halaman login, isi data lengkap (nama, email, password, institusi). Setelah submit, tunggu admin meng-approve akun Anda. Anda akan mendapat akses setelah disetujui."
                                            />
                                            <FaqItem
                                                question="Format dokumen apa saja yang tersedia?"
                                                answer="6 format: A4 Flyer (cetak standar), X-Banner (60×160cm booth), Factsheet 2-Kolom (executive brief), Pitch Deck Poster (16:9 widescreen), Instagram/LinkedIn Feed (1:1), dan Instagram Story/WA Status (9:16)."
                                            />
                                            <FaqItem
                                                question="Apakah bisa mengganti gaya desain setelah proyek dibuat?"
                                                answer="Ya, gaya desain, format dokumen, dan tema warna dapat diubah kapan saja dari halaman edit proyek tanpa kehilangan data yang sudah diinput."
                                            />
                                            <FaqItem
                                                question="Bagaimana cara menggunakan fitur AI?"
                                                answer="Konfigurasi API key Gemini AI di Settings → AI Configuration. Setelah itu, tombol AI Generate dan AI Polish akan aktif di form proyek."
                                            />
                                            <FaqItem
                                                question="Apakah QR code otomatis berubah jika URL proyek diubah?"
                                                answer="Ya, QR code di-regenerate otomatis setiap kali URL proyek diperbarui dan disimpan."
                                            />
                                            <FaqItem
                                                question="Berapa ukuran maksimum gambar yang bisa diupload?"
                                                answer="Maksimum 5 MB per file. Format yang didukung: JPG, JPEG, PNG, WebP. Gambar di atas 1 MB akan dikompres otomatis oleh sistem."
                                            />
                                            <FaqItem
                                                question="Apakah platform ini bisa diakses publik?"
                                                answer="Halaman landing, showcase proyek yang di-publish, dan halaman support bersifat publik. Area admin (dashboard, project management, dll) memerlukan login dan approval."
                                            />
                                            <FaqItem
                                                question="Bagaimana cara menghubungi tim jika ada kendala?"
                                                answer="Gunakan halaman Pusat Bantuan (/support) untuk mengirim tiket dukungan. Pilih kategori dan prioritas yang sesuai, tim akan merespons sesuai SLA."
                                            />
                                        </div>
                                    </DocSection>

                                    {/* ═══════ END BANNER ═══════ */}
                                    <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0AB600]/5 via-teal-500/5 to-transparent dark:from-[#0AB600]/10 dark:via-teal-500/10 dark:to-transparent border border-[#0AB600]/20 dark:border-[#0AB600]/30 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-[#0AB600]/10 border border-[#0AB600]/30 flex items-center justify-center mx-auto mb-4">
                                            <BookOpen className="w-7 h-7 text-[#0AB600]" />
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                                            Butuh Bantuan Lebih Lanjut?
                                        </h3>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5 max-w-md mx-auto">
                                            Tim CoE STAS-RG siap membantu jika Anda menemukan kendala atau memiliki pertanyaan yang belum terjawab.
                                        </p>
                                        <div className="flex flex-wrap items-center justify-center gap-3">
                                            <Link
                                                href="/support"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-sm font-semibold shadow-xs transition-all"
                                            >
                                                <LifeBuoy className="w-4 h-4" />
                                                <span>Pusat Bantuan</span>
                                            </Link>
                                            <Link
                                                href="/login"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm font-medium border border-zinc-200 dark:border-zinc-700 shadow-xs transition-all"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                <span>Masuk Platform</span>
                                            </Link>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />

                {/* Back to Top Button */}
                {showBackToTop && (
                    <button
                        type="button"
                        onClick={scrollToTop}
                        className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-[#0AB600] hover:bg-[#089600] text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all animate-in fade-in zoom-in-50 duration-200 cursor-pointer"
                        aria-label="Back to top"
                    >
                        <ArrowUp className="w-5 h-5" />
                    </button>
                )}
            </div>
        </>
    );
}

/* ═══════════════════ EXPORTED PAGE COMPONENT ═══════════════════ */
export default function Documentation() {
    return (
        <AppProvider>
            <DocsContent />
        </AppProvider>
    );
}
