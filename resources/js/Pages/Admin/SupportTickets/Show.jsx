import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useApp } from '../../../Context/AppContext';
import { useAlert } from '../../../Context/AlertContext';
import {
    ArrowLeft,
    LifeBuoy,
    Clock,
    RotateCcw,
    CheckCircle2,
    CheckCheck,
    AlertCircle,
    AlertTriangle,
    Mail,
    Phone,
    Building2,
    User,
    FileText,
    Download,
    ExternalLink,
    Check,
    Copy,
    Trash2,
    Send,
    MessageSquare,
    Shield,
    Globe,
    Laptop,
    Sparkles,
    Calendar,
    Save,
    Share2,
    ChevronRight,
    Headphones,
    Paperclip,
    X,
    Mic,
    MicOff,
    Square,
} from 'lucide-react';

export default function SupportTicketShow({ ticket }) {
    const { t, language } = useApp();
    const { showSuccess, showError, showConfirm, showWarning } = useAlert();

    const [statusDraft, setStatusDraft] = useState(ticket.status || 'pending');
    const [priorityDraft, setPriorityDraft] = useState(ticket.priority || 'medium');
    const [adminNotesDraft, setAdminNotesDraft] = useState(ticket.admin_notes || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedNumber, setCopiedNumber] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);

    // Live replies & attachments state
    const [replies, setReplies] = useState(ticket.replies || []);
    const [replyMessage, setReplyMessage] = useState('');
    const [replyStatus, setReplyStatus] = useState(ticket.status === 'pending' ? 'in_progress' : ticket.status);
    const [replyAttachment, setReplyAttachment] = useState(null);
    const [attachmentError, setAttachmentError] = useState('');
    const [isSendingReply, setIsSendingReply] = useState(false);

    // Voice Speech-to-Text state
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const fileInputRef = useRef(null);

    // Web Speech API: Voice Recognition Setup
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = language === 'id' ? 'id-ID' : 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                const transcript = event.results?.[0]?.[0]?.transcript;
                if (transcript) {
                    setReplyMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
                }
            };

            recognition.onerror = (event) => {
                console.warn('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    showWarning({
                        title: 'Izin Mikrofon Ditolak',
                        message: 'Harap izinkan akses mikrofon pada browser Anda untuk menggunakan fitur suara.',
                    });
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch {
                    // ignore
                }
            }
        };
    }, [language]);

    const handleToggleVoice = () => {
        if (!recognitionRef.current) {
            showWarning({
                title: 'Input Suara Tidak Didukung',
                message: 'Browser Anda belum mendukung Web Speech API.',
                confirmText: 'Mengerti',
            });
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
            } catch (err) {
                console.warn('Recognition start error:', err);
                setIsListening(false);
            }
        }
    };

    // Auto-polling for live incoming user messages
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`/api/support-tickets/${ticket.ticket_number}/messages`, {
                    headers: { Accept: 'application/json' },
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.replies) {
                        setReplies((prevReplies) => {
                            if (JSON.stringify(data.replies) !== JSON.stringify(prevReplies)) {
                                return data.replies;
                            }
                            return prevReplies;
                        });
                        if (data.status && data.status !== statusDraft) {
                            setStatusDraft(data.status);
                        }
                    }
                }
            } catch (e) {
                // Silently ignore background polling errors
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [ticket.ticket_number, statusDraft]);

    const categoryLabels = {
        general: { label: 'Pertanyaan Umum', color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700' },
        technical: { label: 'Kendala Teknis', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50' },
        technical_issue: { label: 'Kendala Teknis', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50' },
        partnership: { label: 'Kemitraan / Kerjasama', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900/50' },
        research_collaboration: { label: 'Kolaborasi Riset', color: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-900/50' },
        feature_request: { label: 'Permintaan Fitur', color: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-900/50' },
        account: { label: 'Akses Akun', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/50' },
        account_access: { label: 'Akses Akun', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/50' },
        other: { label: 'Lainnya', color: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200 dark:border-zinc-700' },
    };

    const priorityBadges = {
        low: { label: 'Rendah', color: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300 border-slate-200 dark:border-white/10' },
        medium: { label: 'Sedang', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900/50' },
        high: { label: 'Tinggi', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/50' },
        urgent: { label: 'Urgent', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900/50 animate-pulse' },
    };

    const statusBadges = {
        pending: { label: 'Menunggu', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/50', icon: Clock },
        in_progress: { label: 'Diproses', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900/50', icon: RotateCcw },
        resolved: { label: 'Selesai', color: 'bg-[#0AB600]/10 text-[#0AB600] dark:bg-[#0AB600]/10 dark:text-[#0AB600] border-[#0AB600]/30', icon: CheckCircle2 },
        closed: { label: 'Ditutup', color: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400 border-slate-200 dark:border-white/10', icon: CheckCheck },
    };

    const handleCopyText = (text, type = 'number') => {
        if (!navigator?.clipboard) return;
        navigator.clipboard.writeText(text);
        if (type === 'number') {
            setCopiedNumber(true);
            setTimeout(() => setCopiedNumber(false), 2000);
        } else if (type === 'email') {
            setCopiedEmail(true);
            setTimeout(() => setCopiedEmail(false), 2000);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            const errorMsg = 'Ukuran berkas tidak boleh melebihi 5MB.';
            setAttachmentError(errorMsg);
            showWarning({
                title: 'Ukuran Berkas Terlalu Besar',
                message: errorMsg,
                confirmText: 'Mengerti',
            });
            return;
        }

        const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'zip', 'doc', 'docx'];
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!ext || !allowedExtensions.includes(ext)) {
            const errorMsg = 'Format berkas tidak didukung (gunakan JPG, PNG, PDF, ZIP, DOCX).';
            setAttachmentError(errorMsg);
            showWarning({
                title: 'Format Tidak Didukung',
                message: errorMsg,
                confirmText: 'Mengerti',
            });
            return;
        }

        setAttachmentError('');
        setReplyAttachment(file);
    };

    const handleRemoveFile = () => {
        setReplyAttachment(null);
        setAttachmentError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const replyTemplates = [
        {
            id: 'ack',
            title: 'Konfirmasi Penanganan',
            desc: 'Pemberitahuan bahwa pesan sedang ditinjau tim lab',
            status: 'in_progress',
            text: `Halo ${ticket.name},\n\nTerima kasih telah menghubungi Center of Excellence (CoE) STAS-RG Telkom University.\n\nPesan dan tiket bantuan Anda (#${ticket.ticket_number}) telah kami terima dan saat ini sedang ditindaklanjuti oleh tim laboratorium kami. Kami akan mengabari Anda kembali segera setelah ada pembaruan lebih lanjut.\n\nSalam hangat,\nTim Layanan Dukungan CoE STAS-RG\nTelkom University Bandung`,
        },
        {
            id: 'solved',
            title: 'Solusi & Selesai',
            desc: 'Tanggapan solusi dan tandai tiket selesai',
            status: 'resolved',
            text: `Halo ${ticket.name},\n\nMenindaklanjuti tiket bantuan #${ticket.ticket_number} terkait "${ticket.subject}", kami informasikan bahwa permohonan/kendala Anda telah berhasil kami tangani dan selesaikan.\n\nSilakan periksa kembali akun atau layanan terkait. Jika Anda masih memiliki pertanyaan atau membutuhkan bantuan tambahan, jangan ragu untuk membalas email ini secara langsung.\n\nSalam hangat,\nTim Layanan Dukungan CoE STAS-RG\nTelkom University Bandung`,
        },
        {
            id: 'partnership',
            title: 'Respon Kerjasama',
            desc: 'Tanggapan minat kolaborasi riset / kemitraan',
            status: 'in_progress',
            text: `Halo ${ticket.name},\n\nTerima kasih atas ketertarikan dan inisiatif kemitraan/kolaborasi riset dengan CoE STAS-RG Telkom University.\n\nInformasi dan proposal Anda telah kami teruskan kepada Koordinator Bidang Riset & Kerjasama Lab STAS-RG. Tim kami akan segera menghubungi Anda kembali untuk mendiskusikan agenda dan peluang sinergi lebih lanjut.\n\nSalam hangat,\nTim Kerjasama & Kemitraan CoE STAS-RG\nTelkom University Bandung`,
        },
        {
            id: 'closed',
            title: 'Penutupan Tiket',
            desc: 'Pemberitahuan penutupan tiket resmi',
            status: 'closed',
            text: `Halo ${ticket.name},\n\nTiket bantuan #${ticket.ticket_number} kini telah resmi kami tutup dalam sistem Helpdesk CoE STAS-RG. Terima kasih atas partisipasi dan kerjasama Anda.\n\nJika di kemudian hari Anda membutuhkan bantuan lain, silakan kunjungi portal kami dan ajukan tiket baru kapan saja.\n\nSalam hangat,\nTim Administrator CoE STAS-RG\nTelkom University Bandung`,
        },
    ];

    const applyReplyTemplate = (template) => {
        setReplyMessage(template.text);
        setReplyStatus(template.status);
    };

    const handleSendEmailReply = (e) => {
        e?.preventDefault();
        if (!replyMessage.trim() && !replyAttachment) {
            showError('Pesan Kosong', 'Harap tuliskan isi pesan balasan email terlebih dahulu.');
            return;
        }

        setIsSendingReply(true);

        const formData = new FormData();
        formData.append('message', replyMessage);
        formData.append('status', replyStatus);
        if (replyAttachment) {
            formData.append('attachment', replyAttachment);
        }

        router.post(
            `/support-tickets/${ticket.id}/reply`,
            formData,
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsSendingReply(false);
                    setReplyMessage('');
                    handleRemoveFile();
                    showSuccess(
                        'Email Balasan Terkirim',
                        `Balasan resmi berhasil dikirimkan via email ke ${ticket.email}.`
                    );
                },
                onError: (errors) => {
                    setIsSendingReply(false);
                    showError('Gagal Mengirim Email', Object.values(errors)[0] || 'Terjadi kesalahan saat mengirimkan email balasan.');
                },
            }
        );
    };

    const handleSaveResolution = (e) => {
        e?.preventDefault();
        setIsSaving(true);
        router.put(
            `/support-tickets/${ticket.id}`,
            {
                status: statusDraft,
                priority: priorityDraft,
                admin_notes: adminNotesDraft,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                    showSuccess(
                        'Status Tiket Diperbarui',
                        `Tiket #${ticket.ticket_number} berhasil diperbarui.`
                    );
                },
                onError: (errors) => {
                    setIsSaving(false);
                    showError('Gagal Menyimpan', Object.values(errors)[0] || 'Terjadi kesalahan saat memperbarui tiket.');
                },
            }
        );
    };

    const handleDelete = async () => {
        const confirmed = await showConfirm({
            title: 'Hapus Tiket Dukungan?',
            message: `Apakah Anda yakin ingin menghapus tiket #${ticket.ticket_number} dari "${ticket.name}"? Data lampiran dan pesan terkait akan dihapus permanen.`,
            confirmText: 'Hapus Tiket',
            cancelText: 'Batal',
            variant: 'danger',
        });

        if (confirmed) {
            setIsDeleting(true);
            router.delete(`/support-tickets/${ticket.id}`, {
                onSuccess: () => {
                    router.visit('/support-tickets');
                },
                onError: () => {
                    setIsDeleting(false);
                },
            });
        }
    };

    const StatusIcon = statusBadges[ticket.status]?.icon || Clock;
    const cleanPhone = ticket.phone ? ticket.phone.replace(/[^0-9]/g, '') : '';
    const whatsappPhone = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;

    const emailSubject = encodeURIComponent(`Re: [STAS-SUPPORT] ${ticket.subject} (#${ticket.ticket_number})`);
    const emailBody = encodeURIComponent(
        `Halo ${ticket.name},\n\nTerima kasih telah menghubungi Center of Excellence (CoE) STAS-RG Telkom University.\n\nMenindaklanjuti pesan Anda terkait tiket #${ticket.ticket_number} (${ticket.subject}):\n\n[Tuliskan balasan Anda di sini]\n\nSalam hangat,\nTim Dukungan CoE STAS-RG\nTelkom University Bandung\nhttps://stasrg.telkomuniversity.ac.id`
    );
    const mailtoUrl = `mailto:${ticket.email}?subject=${emailSubject}&body=${emailBody}`;

    const whatsappMessage = encodeURIComponent(
        `Halo ${ticket.name}, kami dari Tim Support CoE STAS-RG Telkom University ingin merespon tiket bantuan #${ticket.ticket_number} (${ticket.subject}). Ada yang bisa kami bantu lebih lanjut?`
    );
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${whatsappMessage}`;

    return (
        <AdminLayout title={`Tiket #${ticket.ticket_number} - Dukungan & Kontak`} currentPath="/support-tickets">
            <Head title={`Tiket #${ticket.ticket_number} - ${ticket.name} - STAS RG`} />

            <div className="space-y-6 pb-16">
                {/* Breadcrumbs & Navigation Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/support-tickets"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-2xs transition-all"
                        >
                            <ArrowLeft className="w-4 h-4 text-zinc-500" />
                            <span>Kembali ke Daftar Tiket</span>
                        </Link>

                        <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400">
                            <ChevronRight className="w-3.5 h-3.5" />
                            <span>Detail Tiket</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                            <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">#{ticket.ticket_number}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-950/50 shadow-2xs transition-all cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isDeleting ? 'Menghapus...' : 'Hapus Tiket'}</span>
                        </button>
                    </div>
                </div>

                {/* Main Hero Header Card */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30 text-xs font-mono font-bold">
                                    <span>#{ticket.ticket_number}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopyText(ticket.ticket_number, 'number')}
                                        title="Salin Nomor Tiket"
                                        className="p-1 hover:bg-[#0AB600]/20 rounded transition-colors cursor-pointer ml-1"
                                    >
                                        {copiedNumber ? <Check className="w-3.5 h-3.5 text-[#0AB600]" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>

                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusBadges[ticket.status]?.color || statusBadges.pending.color}`}>
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    <span>{statusBadges[ticket.status]?.label || ticket.status}</span>
                                </span>

                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${priorityBadges[ticket.priority]?.color || priorityBadges.medium.color}`}>
                                    <span>Prioritas: {priorityBadges[ticket.priority]?.label || ticket.priority}</span>
                                </span>

                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${categoryLabels[ticket.category]?.color || categoryLabels.general.color}`}>
                                    {categoryLabels[ticket.category]?.label || ticket.category}
                                </span>
                            </div>

                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {ticket.subject}
                            </h1>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Diterima pada {ticket.created_at} ({ticket.created_at_human})</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column (8 cols): Unified Chronological Conversation Stream & Reply Composer */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* 1. Unified Conversation Stream Card */}
                        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600]">
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Riwayat Percakapan & Tiket
                                        </h3>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                            Percakapan dua arah terintegrasi email antara pengunjung dan tim CoE STAS-RG.
                                        </p>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30 text-xs font-semibold font-mono">
                                    {1 + (replies ? replies.length : 0)} Pesan
                                </span>
                            </div>

                            {/* Thread Messages */}
                            <div className="space-y-4">
                                
                                {/* Initial Message from Visitor */}
                                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/90 dark:bg-zinc-900/70 border border-zinc-200/70 dark:border-zinc-800/70 space-y-3">
                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                        {ticket.name}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-900/60">
                                                        Permohonan Awal Pengunjung
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-zinc-400">{ticket.email}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${priorityBadges[ticket.priority]?.color || priorityBadges.medium.color}`}>
                                                {priorityBadges[ticket.priority]?.label || ticket.priority}
                                            </span>
                                            <span>{ticket.created_at}</span>
                                        </div>
                                    </div>

                                    {/* Message Body */}
                                    <div
                                        className="p-3.5 rounded-xl bg-white dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-800/50 text-slate-800 dark:text-zinc-200 text-xs sm:text-sm leading-relaxed prose dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: ticket.message }}
                                    />

                                    {/* Attachment (if any) */}
                                    {ticket.attachment_path && (
                                        <div className="pt-1 flex items-center justify-between gap-3 bg-[#0AB600]/5 p-2.5 rounded-xl border border-[#0AB600]/20">
                                            <div className="flex items-center gap-2 truncate">
                                                <FileText className="w-4 h-4 text-[#0AB600] shrink-0" />
                                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                    {ticket.attachment_original_name || 'Lampiran Berkas'}
                                                </span>
                                            </div>
                                            <a
                                                href={ticket.attachment_url || `/storage/${ticket.attachment_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0AB600] hover:bg-[#089600] text-white text-[11px] font-semibold transition-all shrink-0 cursor-pointer"
                                            >
                                                <Download className="w-3 h-3" />
                                                <span>Unduh</span>
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Chronological Replies */}
                                {replies && replies.map((reply) => {
                                    const isUser = reply.sender_type === 'user';

                                    return (
                                        <div
                                            key={reply.id}
                                            className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                                                isUser
                                                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/50'
                                                    : 'bg-blue-50/30 dark:bg-blue-950/20 border-blue-200/70 dark:border-blue-900/50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                                                            isUser
                                                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                                                : 'bg-[#0AB600]/15 text-[#0AB600]'
                                                        }`}
                                                    >
                                                        {isUser ? <User className="w-4 h-4" /> : (reply.user?.name ? reply.user.name.charAt(0).toUpperCase() : 'A')}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                                {isUser
                                                                    ? (reply.sender_name || ticket.name)
                                                                    : (reply.user?.name || reply.sender_name || 'Admin Laboratorium')}
                                                            </span>
                                                            {isUser ? (
                                                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-900/60">
                                                                    Pengunjung / User
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-[#0AB600]/10 text-[#0AB600] font-semibold border border-[#0AB600]/30">
                                                                    <CheckCheck className="w-3 h-3 text-[#0AB600]" />
                                                                    Admin CoE STAS-RG
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] text-zinc-400">
                                                            {isUser ? ticket.email : (reply.user?.email || 'admin@stasrg.com')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                                                    {reply.status_at_reply && (
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBadges[reply.status_at_reply]?.color || statusBadges.pending.color}`}>
                                                            {statusBadges[reply.status_at_reply]?.label || reply.status_at_reply}
                                                        </span>
                                                    )}
                                                    <span>{reply.created_at} ({reply.created_at_human})</span>
                                                </div>
                                            </div>

                                            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-800/50 text-slate-800 dark:text-zinc-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                                                {reply.message}

                                                {reply.attachment_url && (
                                                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-xl">
                                                        <div className="flex items-center gap-2 truncate">
                                                            <FileText className="w-4 h-4 text-[#0AB600] shrink-0" />
                                                            <span className="text-xs font-semibold truncate">
                                                                {reply.attachment_original_name || 'Lampiran Berkas'}
                                                            </span>
                                                        </div>
                                                        <a
                                                            href={reply.attachment_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            download
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0AB600] hover:bg-[#089600] text-white text-[11px] font-semibold transition-all shrink-0"
                                                        >
                                                            <Download className="w-3 h-3" />
                                                            <span>Unduh</span>
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                            </div>
                        </div>

                        {/* 2. Official Email Reply Composer Card (Positioned directly below the conversation thread) */}
                        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Kirim Balasan Resmi
                                        </h3>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                            Tanggapan akan terkirim langsung ke email <strong className="text-slate-800 dark:text-zinc-200">{ticket.email}</strong> dan muncul di ruang lacak tiket pengunjung.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Response Templates */}
                            <div className="space-y-1.5">
                                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Templat Balasan Cepat:</span>
                                </span>
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                                    {replyTemplates.map((template) => (
                                        <button
                                            key={template.id}
                                            type="button"
                                            onClick={() => applyReplyTemplate(template)}
                                            className="px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-semibold bg-zinc-50 dark:bg-zinc-900/60 hover:bg-[#0AB600]/10 hover:text-[#0AB600] border border-zinc-200/70 dark:border-zinc-800/70 hover:border-[#0AB600]/30 transition-all cursor-pointer shrink-0"
                                        >
                                            {template.title}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Active Voice Listening Banner */}
                            {isListening && (
                                <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600] animate-in fade-in-50">
                                    <div className="flex items-center gap-2.5">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0AB600] opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0AB600]"></span>
                                        </span>
                                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                                            <Mic className="w-3.5 h-3.5 animate-bounce text-[#0AB600]" />
                                            <span>Mendengarkan suara... Silakan berbicara.</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleToggleVoice}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                                    >
                                        <Square className="w-3 h-3 fill-current" />
                                        <span>Selesai Bicara</span>
                                    </button>
                                </div>
                            )}

                            {/* Reply Message Form with Unified Card */}
                            <form onSubmit={handleSendEmailReply} className="space-y-3">
                                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/80 focus-within:border-[#0AB600] focus-within:ring-2 focus-within:ring-[#0AB600]/20 transition-all p-3 space-y-2 shadow-xs">
                                    
                                    {/* Attachment Preview Pill (if any) */}
                                    {replyAttachment && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-xs font-semibold text-blue-700 dark:text-blue-300">
                                            <FileText className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate max-w-xs">{replyAttachment.name}</span>
                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                className="p-1 hover:bg-blue-200/50 rounded-full transition-colors cursor-pointer"
                                            >
                                                <X className="w-3 h-3 text-slate-500 hover:text-rose-500" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Textarea Input */}
                                    <textarea
                                        rows={4}
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder={`Tuliskan tanggapan resmi laboratorium untuk ${ticket.name}...`}
                                        className="w-full bg-transparent border-0 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-0 resize-y p-1 leading-relaxed"
                                    />

                                    {/* Toolbar inside wrapper */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                                        
                                        {/* Left Buttons: File Attachment + Voice */}
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                                accept=".jpg,.jpeg,.png,.pdf,.zip,.doc,.docx"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                title="Lampirkan Dokumen / Gambar"
                                                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                                                    replyAttachment
                                                        ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/50'
                                                        : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                                }`}
                                            >
                                                <Paperclip className="w-4 h-4" />
                                                <span className="hidden sm:inline text-[11px]">
                                                    {replyAttachment ? 'Lampiran Dipilih' : 'Lampirkan Berkas'}
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleToggleVoice}
                                                title={isListening ? 'Hentikan Rekam Suara' : 'Diktekan Pesan dengan Suara (Voice Input)'}
                                                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                                                    isListening
                                                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 animate-pulse'
                                                        : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                                }`}
                                            >
                                                {isListening ? (
                                                    <>
                                                        <MicOff className="w-4 h-4" />
                                                        <span className="text-[11px] font-bold">Merekam...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Mic className="w-4 h-4 text-[#0AB600]" />
                                                        <span className="hidden sm:inline text-[11px]">Input Suara</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Right Controls: Status Update + Send Button */}
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:inline">Status:</span>
                                                <select
                                                    value={replyStatus}
                                                    onChange={(e) => setReplyStatus(e.target.value)}
                                                    className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0AB600]"
                                                >
                                                    <option value="in_progress">Diproses</option>
                                                    <option value="resolved">Selesai</option>
                                                    <option value="closed">Ditutup</option>
                                                    <option value="pending">Menunggu</option>
                                                </select>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isSendingReply || (!replyMessage.trim() && !replyAttachment)}
                                                className="px-4 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition-all shadow-md shadow-[#0AB600]/20 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                            >
                                                {isSendingReply ? (
                                                    <>
                                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        <span>Mengirim...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="w-3.5 h-3.5" />
                                                        <span>Kirim Balasan</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {attachmentError && (
                                    <p className="text-rose-500 text-xs flex items-center gap-1 px-1">
                                        <AlertCircle className="w-3.5 h-3.5" /> {attachmentError}
                                    </p>
                                )}
                            </form>
                        </div>

                    </div>

                    {/* Right Column (4 cols): Consolidated Ticket Settings, Profile & Quick Actions */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* 1. Ticket Settings & Internal Notes Card */}
                        <form onSubmit={handleSaveResolution} className="p-6 rounded-3xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-500">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Pengaturan & Catatan Internal
                                    </h3>
                                </div>
                            </div>

                            <div className="space-y-3 text-xs">
                                {/* Status Selector */}
                                <div className="space-y-1">
                                    <label className="block font-semibold text-slate-800 dark:text-zinc-200">
                                        Status Tiket
                                    </label>
                                    <select
                                        value={statusDraft}
                                        onChange={(e) => setStatusDraft(e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0AB600]"
                                    >
                                        <option value="pending">Menunggu (Pending)</option>
                                        <option value="in_progress">Sedang Diproses (In Progress)</option>
                                        <option value="resolved">Selesai Ditangani (Resolved)</option>
                                        <option value="closed">Ditutup (Closed)</option>
                                    </select>
                                </div>

                                {/* Priority Selector */}
                                <div className="space-y-1">
                                    <label className="block font-semibold text-slate-800 dark:text-zinc-200">
                                        Tingkat Prioritas
                                    </label>
                                    <select
                                        value={priorityDraft}
                                        onChange={(e) => setPriorityDraft(e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0AB600]"
                                    >
                                        <option value="low">Rendah (Low)</option>
                                        <option value="medium">Sedang (Medium)</option>
                                        <option value="high">Tinggi (High)</option>
                                        <option value="urgent">Urgent / Kritis</option>
                                    </select>
                                </div>

                                {/* Admin Notes */}
                                <div className="space-y-1">
                                    <label className="block font-semibold text-slate-800 dark:text-zinc-200 flex items-center justify-between">
                                        <span>Catatan Solusi / Audit</span>
                                        <span className="text-[10px] text-zinc-400 font-normal">Internal Lab</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={adminNotesDraft}
                                        onChange={(e) => setAdminNotesDraft(e.target.value)}
                                        placeholder="Tuliskan catatan tindak lanjut internal..."
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#0AB600] resize-y"
                                    />
                                </div>

                                {ticket.resolver && (
                                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70 text-[11px] text-zinc-500 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0AB600] shrink-0" />
                                        <span>Diselesaikan: <strong>{ticket.resolver.name}</strong></span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-3.5 h-3.5" />
                                            <span>Simpan Pengaturan Tiket</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* 2. Sender Profile Card */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                                Profil Pengirim
                            </h3>

                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600] font-bold text-base flex items-center justify-center shrink-0">
                                    {ticket.name ? ticket.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                        {ticket.name}
                                    </h4>
                                    {ticket.affiliation ? (
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                                            <Building2 className="w-3 h-3 text-zinc-400 shrink-0" />
                                            <span>{ticket.affiliation}</span>
                                        </p>
                                    ) : (
                                        <p className="text-xs text-zinc-400 italic mt-0.5">Pengunjung Umum</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 gap-2">
                                    <a
                                        href={`mailto:${ticket.email}`}
                                        className="font-medium text-[#0AB600] hover:underline truncate"
                                    >
                                        {ticket.email}
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => handleCopyText(ticket.email, 'email')}
                                        title="Salin Email"
                                        className="p-1 text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                    >
                                        {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#0AB600]" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>

                                {ticket.phone && (
                                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 gap-2">
                                        <a
                                            href={`https://wa.me/${whatsappPhone}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-[#0AB600] hover:underline font-mono"
                                        >
                                            {ticket.phone}
                                        </a>
                                        <a
                                            href={`https://wa.me/${whatsappPhone}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 text-zinc-400 hover:text-[#0AB600] transition-colors"
                                            title="Buka Chat WhatsApp"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Alternative Direct Action Channels */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                                Saluran Kontak Cepat
                            </h3>

                            <div className="grid grid-cols-1 gap-2.5">
                                <a
                                    href={mailtoUrl}
                                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/70 hover:border-[#0AB600] transition-all flex items-center gap-3 group cursor-pointer"
                                >
                                    <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
                                        <Mail className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="space-y-0.5 min-w-0">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                                            <span>Buka Email Client Lokal</span>
                                            <ExternalLink className="w-3 h-3 text-zinc-400" />
                                        </div>
                                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                                            Outlook / Thunderbird / Mail
                                        </p>
                                    </div>
                                </a>

                                {ticket.phone && (
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-2xl bg-[#0AB600]/5 dark:bg-[#0AB600]/10 border border-[#0AB600]/30 hover:border-[#0AB600] transition-all flex items-center gap-3 group cursor-pointer"
                                    >
                                        <div className="p-2 rounded-xl bg-[#0AB600] text-white shrink-0">
                                            <Phone className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="space-y-0.5 min-w-0">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-[#0AB600]">
                                                <span>Kirim Pesan WhatsApp</span>
                                                <ExternalLink className="w-3 h-3 text-[#0AB600]" />
                                            </div>
                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                                                Hubungi {ticket.phone}
                                            </p>
                                        </div>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* 4. Security & Audit Metadata Card */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                                Data Audit & Keamanan
                            </h3>

                            <div className="space-y-2 text-xs">
                                <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/50">
                                    <span className="text-zinc-500 flex items-center gap-1.5">
                                        <Globe className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>IP Pengirim:</span>
                                    </span>
                                    <span className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold">{ticket.ip_address || '127.0.0.1'}</span>
                                </div>
                                <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/50">
                                    <span className="text-zinc-500 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>Dibuat:</span>
                                    </span>
                                    <span className="text-zinc-800 dark:text-zinc-200">{ticket.created_at}</span>
                                </div>
                                {ticket.resolved_at && (
                                    <div className="flex items-center justify-between py-1">
                                        <span className="text-zinc-500 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#0AB600]" />
                                            <span>Selesai:</span>
                                        </span>
                                        <span className="text-zinc-800 dark:text-zinc-200">{ticket.resolved_at}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
