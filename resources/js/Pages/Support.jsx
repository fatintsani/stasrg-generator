import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AppProvider, useApp } from '../Context/AppContext';
import { useAlert } from '../Context/AlertContext';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import AiChatWidget from '../Components/AiChatWidget';
import RichTextEditor from '../Components/Admin/RichTextEditor';
import {
    LifeBuoy,
    Send,
    CheckCircle2,
    Copy,
    Check,
    UploadCloud,
    FileText,
    AlertCircle,
    Building2,
    User,
    Mail,
    Phone,
    HelpCircle,
    Bug,
    Handshake,
    Sparkles,
    ShieldAlert,
    Clock,
    MapPin,
    ArrowRight,
    MessageSquare,
    ShieldCheck,
    X,
    ExternalLink
} from 'lucide-react';

function SupportContent() {
    const { t, language } = useApp();
    const { showSuccess, showError, showWarning } = useAlert();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        institution: '',
        category: 'general',
        priority: 'medium',
        subject: '',
        message: '',
    });

    const [attachment, setAttachment] = useState(null);
    const [attachmentError, setAttachmentError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [successData, setSuccessData] = useState(null);
    const [copied, setCopied] = useState(false);

    // Ticket tracking state
    const [showTrackModal, setShowTrackModal] = useState(false);
    const [trackFormData, setTrackFormData] = useState({
        ticket_number: '',
        email: '',
    });
    const [trackErrors, setTrackErrors] = useState({});
    const [isVerifyingTrack, setIsVerifyingTrack] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('track') === '1') {
            setShowTrackModal(true);
            if (urlParams.get('ticket')) {
                setTrackFormData((prev) => ({ ...prev, ticket_number: urlParams.get('ticket') }));
            }
        }
    }, []);

    const s = t?.support || {};

    const categories = [
        { key: 'general', label: s.categories?.general || 'Pertanyaan Umum', icon: HelpCircle, desc: 'Pertanyaan seputar platform & fitur' },
        { key: 'technical_issue', label: s.categories?.technical_issue || 'Kendala Teknis & Bug', icon: Bug, desc: 'Error rendering, export, atau layout' },
        { key: 'partnership', label: s.categories?.partnership || 'Kemitraan & Riset', icon: Handshake, desc: 'Kerjasama riset & integrasi mitra' },
        { key: 'feature_request', label: s.categories?.feature_request || 'Saran & Permintaan', icon: Sparkles, desc: 'Ide fitur baru & feedback' },
        { key: 'account_access', label: s.categories?.account_access || 'Akses & Autentikasi', icon: ShieldAlert, desc: 'Persetujuan akun & password' },
    ];

    const priorities = [
        { key: 'low', label: s.priorities?.low || 'Rendah', color: 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400', activeColor: 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white ring-2 ring-slate-400' },
        { key: 'medium', label: s.priorities?.medium || 'Sedang', color: 'border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400', activeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500' },
        { key: 'high', label: s.priorities?.high || 'Tinggi', color: 'border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400', activeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500' },
        { key: 'urgent', label: s.priorities?.urgent || 'Urgent', color: 'border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400', activeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500' },
    ];

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            const errorMsg = language === 'id' ? 'Ukuran file tidak boleh melebihi 5MB.' : 'File size must not exceed 5MB.';
            setAttachmentError(errorMsg);
            showWarning({
                title: language === 'id' ? 'Ukuran File Terlalu Besar' : 'File Too Large',
                message: errorMsg,
                confirmText: language === 'id' ? 'Mengerti' : 'Got it',
            });
            return;
        }

        const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'zip', 'doc', 'docx'];
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!ext || !allowedExtensions.includes(ext)) {
            const errorMsg = language === 'id' ? 'Format file tidak didukung (gunakan JPG, PNG, PDF, ZIP, DOCX).' : 'Unsupported file format (use JPG, PNG, PDF, ZIP, DOCX).';
            setAttachmentError(errorMsg);
            showWarning({
                title: language === 'id' ? 'Format File Tidak Didukung' : 'Unsupported Format',
                message: errorMsg,
                confirmText: language === 'id' ? 'Mengerti' : 'Got it',
            });
            return;
        }

        setAttachmentError('');
        setAttachment(file);
    };

    const handleRemoveFile = () => {
        setAttachment(null);
        setAttachmentError('');
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const payload = new FormData();
        Object.entries(formData).forEach(([key, val]) => {
            if (val !== null && val !== undefined && val !== '') {
                payload.append(key, val);
            }
        });

        if (attachment) {
            payload.append('attachment', attachment);
        }

        router.post('/support/submit', payload, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                setIsSubmitting(false);
                const flash = page.props?.flash;
                const ticketNumber = flash?.ticket_number || ('STAS-' + Math.floor(1000 + Math.random() * 9000));
                const message = flash?.success || (language === 'id' ? 'Tiket bantuan Anda berhasil dikirim!' : 'Your support ticket has been submitted successfully!');

                setSuccessData({
                    ticket_number: ticketNumber,
                    message: message,
                });

                // Tampilkan alert modal notifikasi keberhasilan
                showSuccess({
                    title: language === 'id' ? 'Tiket Berhasil Terkirim!' : 'Ticket Submitted Successfully!',
                    message: language === 'id'
                        ? `Tiket #${ticketNumber} telah berhasil dicatat. Tim support kami akan segera meninjau dan merespon melalui email terdaftar dalam 1x24 jam kerja.`
                        : `Support ticket #${ticketNumber} has been logged. Our team will review and respond via your registered email within 1 business day.`,
                    confirmText: language === 'id' ? 'Lihat Tiket' : 'View Ticket',
                });
            },
            onError: (errs) => {
                setIsSubmitting(false);
                setErrors(errs);
                const firstErrorMessage =
                    Object.values(errs)[0] ||
                    (language === 'id'
                        ? 'Gagal mengirim tiket bantuan. Mohon lengkapi dan periksa kembali form isian Anda.'
                        : 'Failed to submit support ticket. Please verify your form inputs.');

                showError({
                    title: language === 'id' ? 'Gagal Mengirim Tiket' : 'Submission Failed',
                    message: firstErrorMessage,
                    confirmText: language === 'id' ? 'Periksa Kembali' : 'Review Form',
                });
            },
        });
    };

    const handleVerifyTrack = (e) => {
        e.preventDefault();
        if (!trackFormData.ticket_number.trim() || !trackFormData.email.trim()) {
            return;
        }

        setIsVerifyingTrack(true);
        setTrackErrors({});

        router.post('/support/track/verify', trackFormData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsVerifyingTrack(false);
                setShowTrackModal(false);
            },
            onError: (errs) => {
                setIsVerifyingTrack(false);
                setTrackErrors(errs);
                const errMsg = Object.values(errs)[0] || (language === 'id' ? 'Nomor tiket atau email verifikasi tidak cocok.' : 'Ticket number or email verification mismatch.');
                showError({
                    title: language === 'id' ? 'Verifikasi Tiket Gagal' : 'Ticket Verification Failed',
                    message: errMsg,
                    confirmText: language === 'id' ? 'Periksa Kembali' : 'Review Inputs',
                });
            },
        });
    };

    const handleCopyTicket = () => {
        if (!successData?.ticket_number) return;
        navigator.clipboard.writeText(successData.ticket_number);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleReset = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            institution: '',
            category: 'general',
            priority: 'medium',
            subject: '',
            message: '',
        });
        setAttachment(null);
        setAttachmentError('');
        setErrors({});
        setSuccessData(null);
    };

    return (
        <>
            <Head title="Pusat Bantuan & Kontak Dukungan - STAS RG Projects">
                <meta name="description" content="Layanan bantuan teknis, permohonan kemitraan riset, dan helpdesk resmi CoE STAS-RG." />
            </Head>

            <div className="min-h-screen flex flex-col bg-[#FAFBFD] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 selection:bg-[#0AB600] selection:text-white font-sans antialiased transition-colors">
                {/* Navbar */}
                <Navbar />

                {/* Main Content Area */}
                <main className="flex-grow py-8 sm:py-16 relative overflow-hidden">
                    {/* Ambient Background Glow Effect (Subtle SaaS light) */}
                <div className="ambient-glow" style={{ filter: 'blur(64px)', WebkitFilter: 'blur(64px)' }} />

                    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
                        {/* Hero Header */}
                        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-2.5 sm:space-y-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-semibold tracking-wider uppercase bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30 shadow-xs">
                                <LifeBuoy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0AB600]" />
                                <span>{s.badge || 'PUSAT DUKUNGAN & HELPDESK'}</span>
                            </div>

                            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {s.modalTitle || 'Pusat Bantuan & Kontak Dukungan'}
                            </h1>

                            <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                                {s.modalSubtitle || 'Punya kendala teknis, pertanyaan riset, atau permohonan kemitraan? Tim STAS-RG siap membantu Anda.'}
                            </p>

                            {/* Quick Action: Track Ticket Button */}
                            <div className="flex items-center justify-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowTrackModal(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 hover:border-[#0AB600] dark:hover:border-[#0AB600] shadow-xs hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <MessageSquare className="w-4 h-4 text-[#0AB600] group-hover:scale-110 transition-transform" />
                                    <span>{language === 'id' ? 'Lacak & Buka Percakapan Tiket' : 'Track & Open Ticket Chat'}</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Success State */}
                        {successData ? (
                            <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-12 text-center animate-in zoom-in-50 duration-300">
                                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600] flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                    <CheckCircle2 className="w-7 h-7 sm:w-10 sm:h-10" />
                                </div>

                                <h2 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2">
                                    {s.successTitle || 'Tiket Berhasil Terkirim!'}
                                </h2>

                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-5 sm:mb-8 leading-relaxed">
                                    {s.successDesc || 'Permintaan bantuan Anda telah dicatat oleh sistem administrasi CoE STAS-RG.'}
                                </p>

                                {/* Ticket Number Card */}
                                <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#0AB600]/5 dark:bg-[#0AB600]/10 border border-[#0AB600]/20 dark:border-[#0AB600]/30 mb-5 sm:mb-6 text-left">
                                    <p className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#0AB600] font-semibold mb-1">
                                        {s.ticketNumberLabel || 'Nomor Referensi Tiket'}
                                    </p>
                                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                                        <span className="font-mono text-lg sm:text-2xl font-extrabold text-[#0AB600] tracking-wider">
                                            {successData.ticket_number}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleCopyTicket}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-[11px] sm:text-xs font-semibold transition-all shadow-sm cursor-pointer"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    <span>{s.copied || 'Tersalin!'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    <span>{s.copyTicket || 'Salin Kode'}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-5 sm:mb-8 leading-normal">
                                    {language === 'id'
                                        ? 'Nomor tiket dan tautan ruang chat telah kami kirimkan ke email Anda. Anda dapat langsung membuka ruang obrolan sekarang untuk memantau atau berkomunikasi dengan admin.'
                                        : 'Ticket code and chat link have been sent to your email. You can open the live chat room now to monitor or communicate with our support team.'}
                                </p>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
                                    <Link
                                        href={`/support/ticket/${successData.ticket_number}`}
                                        className="w-full sm:w-auto py-2.5 px-5 sm:py-3 sm:px-6 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#0AB600]/25 transition-all text-center inline-flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        <span>{language === 'id' ? 'Buka Ruang Chat Tiket Ini' : 'Open Ticket Live Chat'}</span>
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="w-full sm:w-auto py-2.5 px-5 sm:py-3 sm:px-6 rounded-xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                                    >
                                        {s.sendAnother || 'Kirim Tiket Lain'}
                                    </button>
                                    <Link
                                        href="/"
                                        className="w-full sm:w-auto py-2.5 px-4 sm:py-3 sm:px-5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 font-semibold text-xs sm:text-sm transition-all text-center"
                                    >
                                        Beranda
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            /* Main Form & Contact Info Layout */
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-12 items-start">
                                {/* Left Column: Direct Info & Laboratory Channels (Span 5) */}
                                <div className="lg:col-span-5 space-y-4 sm:space-y-6">
                                    {/* Direct Contact Card */}
                                    <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-sm space-y-4 sm:space-y-5">
                                        <div className="flex items-center gap-2 sm:gap-2.5">
                                            <img
                                                src="/assets/img/icon/contact.png"
                                                alt="Contact"
                                                className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0"
                                            />
                                            <div>
                                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                                    {s.directContactTitle || 'Saluran Kontak Langsung'}
                                                </h3>
                                                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                                                    CoE STAS-RG Telkom University
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2 text-xs sm:text-sm">
                                            {/* Location */}
                                            <div className="flex items-start gap-2.5 sm:gap-3">
                                                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0AB600] shrink-0 mt-0.5" />
                                                <div className="space-y-0.5">
                                                    <span className="font-semibold text-slate-900 dark:text-white block text-[11px] sm:text-xs">
                                                        Lokasi Laboratorium
                                                    </span>
                                                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                                        {s.labLocation || 'Laboratorium CoE STAS-RG, Gd. Riset Terpadu Lt. 3, Bandung, Jawa Barat'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="flex items-start gap-2.5 sm:gap-3">
                                                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0AB600] shrink-0 mt-0.5" />
                                                <div className="space-y-0.5">
                                                    <span className="font-semibold text-slate-900 dark:text-white block text-[11px] sm:text-xs">
                                                        Email Resmi
                                                    </span>
                                                    <a
                                                        href="mailto:stas.research@telkomuniversity.ac.id"
                                                        className="font-mono text-[11px] sm:text-xs text-[#0AB600] hover:underline block font-semibold truncate"
                                                    >
                                                        stas.research@telkomuniversity.ac.id
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Phone */}
                                            <div className="flex items-start gap-2.5 sm:gap-3">
                                                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0AB600] shrink-0 mt-0.5" />
                                                <div className="space-y-0.5">
                                                    <span className="font-semibold text-slate-900 dark:text-white block text-[11px] sm:text-xs">
                                                        Telepon / Fax
                                                    </span>
                                                    <span className="font-mono text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 block">
                                                        +62 22 7566456
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Hours */}
                                            <div className="flex items-start gap-2.5 sm:gap-3">
                                                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0AB600] shrink-0 mt-0.5" />
                                                <div className="space-y-0.5">
                                                    <span className="font-semibold text-slate-900 dark:text-white block text-[11px] sm:text-xs">
                                                        Jam Operasional
                                                    </span>
                                                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                                        {s.officeHours || 'Senin - Jumat: 08:30 - 17:00 WIB'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* SLA Badge */}
                                        <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#0AB600]/5 border border-[#0AB600]/20 flex items-center justify-between gap-2 text-[11px] sm:text-xs">
                                            <div className="flex items-center gap-1.5 sm:gap-2 text-[#0AB600] font-medium">
                                                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0AB600]" />
                                                <span>SLA Respons Cepat</span>
                                            </div>
                                            <span className="text-[10px] sm:text-[11px] font-semibold text-[#0AB600]">
                                                {s.responseTarget || '< 24 jam kerja'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quick FAQ / Guidance Card */}
                                    <div className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-2.5 sm:space-y-3">
                                        <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                                            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0AB600]" />
                                            <span>Panduan Singkat Bantuan</span>
                                        </h4>
                                        <ul className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                            <li className="flex items-start gap-1.5 sm:gap-2">
                                                <span className="text-[#0AB600] font-bold">•</span>
                                                <span>Gunakan form tiket di samping untuk aduan bug, permintaan fitur, atau konsultasi riset.</span>
                                            </li>
                                            <li className="flex items-start gap-1.5 sm:gap-2">
                                                <span className="text-[#0AB600] font-bold">•</span>
                                                <span>Sertakan tangkapan layar (screenshot) jika mengalami kendala layout atau error sistem.</span>
                                            </li>
                                            <li className="flex items-start gap-1.5 sm:gap-2">
                                                <span className="text-[#0AB600] font-bold">•</span>
                                                <span>Setiap tiket akan mendapatkan nomor referensi unik untuk pelacakan status penanganan.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Right Column: Ticket Submission Form (Span 7) */}
                                <div className="lg:col-span-7 bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm">
                                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                        {/* Category Selector */}
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 sm:mb-2.5">
                                                {s.category || 'Kategori Pertanyaan'} <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                                                {categories.map((cat) => {
                                                    const IconComp = cat.icon;
                                                    const isSelected = formData.category === cat.key;
                                                    return (
                                                        <button
                                                            key={cat.key}
                                                            type="button"
                                                            onClick={() => handleInputChange('category', cat.key)}
                                                            className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left flex items-start gap-2.5 sm:gap-3 transition-all cursor-pointer ${
                                                                isSelected
                                                                    ? 'border-[#0AB600] bg-[#0AB600]/10 text-slate-900 dark:text-white ring-2 ring-[#0AB600]/40 shadow-xs'
                                                                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-white/[0.02]'
                                                            }`}
                                                        >
                                                            <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl shrink-0 ${isSelected ? 'bg-[#0AB600] text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                                                                <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-bold leading-snug block">{cat.label}</span>
                                                                <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{cat.desc}</span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {errors.category && (
                                                <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.category}
                                                </p>
                                            )}
                                        </div>

                                        {/* Priority Selector */}
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">
                                                {s.priority || 'Tingkat Prioritas'}
                                            </label>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                                                {priorities.map((p) => {
                                                    const isSelected = formData.priority === p.key;
                                                    return (
                                                        <button
                                                            key={p.key}
                                                            type="button"
                                                            onClick={() => handleInputChange('priority', p.key)}
                                                            className={`py-1.5 sm:py-2.5 px-2.5 sm:px-3 rounded-lg sm:rounded-xl border text-[11px] sm:text-xs font-medium transition-all text-center cursor-pointer ${
                                                                isSelected ? p.activeColor : p.color + ' bg-slate-50/50 dark:bg-white/[0.02]'
                                                            }`}
                                                        >
                                                            {p.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Name & Email */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            {/* Name */}
                                            <div>
                                                <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 sm:mb-1.5">
                                                    {s.fullName || 'Nama Lengkap'} <span className="text-rose-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 top-2.5 sm:left-3.5 sm:top-3.5 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.name}
                                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                                        placeholder={s.fullNamePlaceholder || 'Masukkan nama lengkap'}
                                                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-3.5 py-2 sm:py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0AB600] focus:border-[#0AB600] transition-all"
                                                    />
                                                </div>
                                                {errors.name && (
                                                    <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                                                        <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 sm:mb-1.5">
                                                    {s.email || 'Alamat Email'} <span className="text-rose-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 top-2.5 sm:left-3.5 sm:top-3.5 text-slate-400" />
                                                    <input
                                                        type="email"
                                                        required
                                                        value={formData.email}
                                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                                        placeholder={s.emailPlaceholder || 'Masukkan alamat email aktif'}
                                                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-3.5 py-2 sm:py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0AB600] focus:border-[#0AB600] transition-all"
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                                                        <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 sm:mb-1.5">
                                                    {s.phone || 'WhatsApp / Telepon (Opsional)'}
                                                </label>
                                                <div className="relative">
                                                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 top-2.5 sm:left-3.5 sm:top-3.5 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        value={formData.phone}
                                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                                        placeholder={s.phonePlaceholder || 'Masukkan nomor WhatsApp / telepon'}
                                                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-3.5 py-2 sm:py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0AB600] focus:border-[#0AB600] transition-all"
                                                    />
                                                </div>
                                                {errors.phone && (
                                                    <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                                                        <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Institution */}
                                            <div>
                                                <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 sm:mb-1.5">
                                                    {s.institution || 'Institusi / Instansi (Opsional)'}
                                                </label>
                                                <div className="relative">
                                                    <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 top-2.5 sm:left-3.5 sm:top-3.5 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        value={formData.institution}
                                                        onChange={(e) => handleInputChange('institution', e.target.value)}
                                                        placeholder={s.institutionPlaceholder || 'Masukkan nama institusi / instansi'}
                                                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-3.5 py-2 sm:py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0AB600] focus:border-[#0AB600] transition-all"
                                                    />
                                                </div>
                                                {errors.institution && (
                                                    <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                                                        <AlertCircle className="w-3.5 h-3.5" /> {errors.institution}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Subject */}
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 sm:mb-1.5">
                                                {s.subject || 'Subjek / Judul Permintaan'} <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.subject}
                                                onChange={(e) => handleInputChange('subject', e.target.value)}
                                                placeholder={s.subjectPlaceholder || 'Masukkan subjek atau topik permohonan'}
                                                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0AB600] focus:border-[#0AB600] transition-all"
                                            />
                                            {errors.subject && (
                                                <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.subject}
                                                </p>
                                            )}
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 sm:mb-1.5">
                                                {s.message || 'Pesan / Rincian Kendala'} <span className="text-rose-500">*</span>
                                            </label>
                                            <RichTextEditor
                                                value={formData.message}
                                                onChange={(val) => handleInputChange('message', val)}
                                                placeholder={s.messagePlaceholder || 'Tuliskan rincian pesan, kendala, atau kebutuhan Anda secara jelas...'}
                                                minHeight="140px"
                                            />
                                            {errors.message && (
                                                <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* File Attachment */}
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 sm:mb-1.5">
                                                {s.attachment || 'Lampiran Dokumen / Screenshot (Opsional)'}
                                            </label>

                                            {attachment ? (
                                                <div className="p-2.5 sm:p-3 bg-[#0AB600]/10 border border-[#0AB600]/30 rounded-xl flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2 sm:gap-2.5 overflow-hidden">
                                                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#0AB600] shrink-0" />
                                                        <div className="truncate">
                                                            <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                                                                {attachment.name}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                                {(attachment.size / 1024).toFixed(1)} KB
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveFile}
                                                        className="p-1 sm:p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-500 transition-all cursor-pointer"
                                                    >
                                                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center justify-center p-3.5 sm:p-5 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl sm:rounded-2xl cursor-pointer hover:border-[#0AB600] hover:bg-[#0AB600]/5 transition-all">
                                                    <UploadCloud className="w-5 h-5 sm:w-7 sm:h-7 text-slate-400 mb-1 sm:mb-1.5" />
                                                    <span className="text-[11px] sm:text-xs font-medium text-slate-700 dark:text-slate-300">
                                                        {language === 'id' ? 'Klik atau seret file ke sini' : 'Click or drag file here'}
                                                    </span>
                                                    <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                                        {s.attachmentHint || 'PNG, JPG, PDF, ZIP, DOCX maks. 5MB'}
                                                    </span>
                                                    <input
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                        accept=".jpg,.jpeg,.png,.pdf,.zip,.doc,.docx"
                                                    />
                                                </label>
                                            )}

                                            {attachmentError && (
                                                <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                                                    <AlertCircle className="w-3.5 h-3.5" /> {attachmentError}
                                                </p>
                                            )}
                                            {errors.attachment && (
                                                <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.attachment}
                                                </p>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <div className="pt-3 sm:pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full sm:w-auto py-2.5 px-6 sm:py-3 sm:px-8 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#0AB600]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        <span>{s.submitting || 'Mengirimkan...'}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        <span>{s.submitBtn || 'Kirim Tiket Bantuan'}</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* Floating AI Chat Assistant */}
                <AiChatWidget />

                {/* Footer */}
                <Footer />

                {/* Track Ticket Modal */}
                {showTrackModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-[#101622] border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2.5 rounded-2xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600]">
                                        <LifeBuoy className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                            {language === 'id' ? 'Lacak & Buka Tiket Anda' : 'Track & Open Ticket'}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {language === 'id' ? 'Masukkan nomor tiket dan email verifikasi' : 'Enter ticket number and verification email'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowTrackModal(false)}
                                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleVerifyTrack} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        {language === 'id' ? 'Nomor Referensi Tiket' : 'Ticket Number'}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={trackFormData.ticket_number}
                                        onChange={(e) => setTrackFormData({ ...trackFormData, ticket_number: e.target.value.toUpperCase() })}
                                        placeholder="Contoh: STAS-20260915-ABCD"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        {language === 'id' ? 'Email Terdaftar Pemohon' : 'Registered Email Address'}
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={trackFormData.email}
                                        onChange={(e) => setTrackFormData({ ...trackFormData, email: e.target.value })}
                                        placeholder="nama@email.com"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600]"
                                    />
                                </div>

                                {trackErrors.ticket_number && (
                                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{trackErrors.ticket_number}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowTrackModal(false)}
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold transition-all cursor-pointer"
                                    >
                                        {language === 'id' ? 'Batal' : 'Cancel'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isVerifyingTrack || !trackFormData.ticket_number.trim() || !trackFormData.email.trim()}
                                        className="px-5 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition-all shadow-md shadow-[#0AB600]/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                                    >
                                        {isVerifyingTrack ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-3.5 h-3.5" />
                                                <span>{language === 'id' ? 'Verifikasi & Buka Chat' : 'Verify & Open Chat'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default function Support() {
    return (
        <AppProvider>
            <SupportContent />
        </AppProvider>
    );
}
