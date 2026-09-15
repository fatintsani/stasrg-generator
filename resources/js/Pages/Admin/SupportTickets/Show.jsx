import React, { useState } from 'react';
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
} from 'lucide-react';

export default function SupportTicketShow({ ticket }) {
    const { t } = useApp();
    const { showSuccess, showError, showConfirm } = useAlert();

    const [statusDraft, setStatusDraft] = useState(ticket.status || 'pending');
    const [priorityDraft, setPriorityDraft] = useState(ticket.priority || 'medium');
    const [adminNotesDraft, setAdminNotesDraft] = useState(ticket.admin_notes || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedNumber, setCopiedNumber] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);

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

    const [replyMessage, setReplyMessage] = useState('');
    const [replyStatus, setReplyStatus] = useState(ticket.status === 'pending' ? 'in_progress' : ticket.status);
    const [isSendingReply, setIsSendingReply] = useState(false);

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
        if (!replyMessage.trim()) {
            showError('Pesan Kosong', 'Harap tuliskan isi pesan balasan email terlebih dahulu.');
            return;
        }

        setIsSendingReply(true);
        router.post(
            `/support-tickets/${ticket.id}/reply`,
            {
                message: replyMessage,
                status: replyStatus,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSendingReply(false);
                    setReplyMessage('');
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column (8 cols): Original Message & Resolution Form */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* 1. Original Message Content Box */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600]">
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Isi Pesan Tiket Pengunjung
                                        </h3>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                            Pesan asli yang dikirimkan melalui formulir Helpdesk STAS-RG.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Message text area with rich styled quote box */}
                            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70 text-slate-800 dark:text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap selection:bg-[#0AB600]/20 selection:text-[#0AB600]">
                                {ticket.message}
                            </div>

                            {/* Attachment Box (if present) */}
                            {ticket.attachment_path && (
                                <div className="p-4 rounded-2xl bg-[#0AB600]/5 border border-[#0AB600]/25 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-xl bg-[#0AB600]/15 text-[#0AB600] flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {ticket.attachment_original_name || 'Lampiran Berkas'}
                                            </p>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                                {ticket.attachment_size ? `${(ticket.attachment_size / 1024).toFixed(1)} KB` : 'Dokumen pendukung'}
                                            </p>
                                        </div>
                                    </div>

                                    <a
                                        href={ticket.attachment_url || `/storage/${ticket.attachment_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-semibold transition-all shadow-xs shrink-0 cursor-pointer"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Unduh Berkas</span>
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* 2. Official Email Reply Composer Card */}
                        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#101622] border border-blue-200/80 dark:border-blue-900/40 shadow-xs space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-xs">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                Kirim Balasan Resmi via Email
                                            </h3>
                                            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[10px] font-semibold border border-blue-200 dark:border-blue-900/50">
                                                Email Notifikasi
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                            Tanggapan akan dikirimkan langsung ke <strong className="text-slate-800 dark:text-zinc-200">{ticket.email}</strong> dengan template resmi CoE STAS-RG.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Response Templates */}
                            <div className="space-y-2">
                                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Pilih Templat Tanggapan Cepat:</span>
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {replyTemplates.map((template) => (
                                        <button
                                            key={template.id}
                                            type="button"
                                            onClick={() => applyReplyTemplate(template)}
                                            className="p-2.5 rounded-xl text-left bg-zinc-50 dark:bg-zinc-900/60 hover:bg-blue-50/70 dark:hover:bg-blue-950/30 border border-zinc-200/70 dark:border-zinc-800/70 hover:border-blue-300 dark:hover:border-blue-800 transition-all group cursor-pointer"
                                        >
                                            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                {template.title}
                                            </div>
                                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                                {template.desc}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reply Message Form */}
                            <form onSubmit={handleSendEmailReply} className="space-y-4 pt-1">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center justify-between">
                                        <span>Isi Pesan Balasan Email</span>
                                        <span className="text-[11px] font-normal text-zinc-400">Mendukung format teks rapi & salam penutup</span>
                                    </label>
                                    <textarea
                                        rows={6}
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder={`Tuliskan tanggapan resmi laboratorium untuk ${ticket.name}...`}
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-y"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 shrink-0">
                                            Status setelah membalas:
                                        </label>
                                        <select
                                            value={replyStatus}
                                            onChange={(e) => setReplyStatus(e.target.value)}
                                            className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        >
                                            <option value="in_progress">Sedang Diproses (In Progress)</option>
                                            <option value="resolved">Tandai Selesai (Resolved)</option>
                                            <option value="closed">Tutup Tiket (Closed)</option>
                                            <option value="pending">Tetap Menunggu (Pending)</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSendingReply || !replyMessage.trim()}
                                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
                                    >
                                        {isSendingReply ? (
                                            <>
                                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Mengirim Email...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-3.5 h-3.5" />
                                                <span>Kirim Balasan Email Resmi</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* 3. Communication Timeline & Replies Thread */}
                        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-500">
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Riwayat Komunikasi & Balasan Email
                                        </h3>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                            Jejak pesan balasan resmi yang telah dikirimkan oleh tim admin ke pengguna.
                                        </p>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold font-mono">
                                    {ticket.replies ? ticket.replies.length : 0} Balasan
                                </span>
                            </div>

                            {ticket.replies && ticket.replies.length > 0 ? (
                                <div className="space-y-4">
                                    {ticket.replies.map((reply) => (
                                        <div
                                            key={reply.id}
                                            className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70 space-y-3"
                                        >
                                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                                                        {reply.user?.name ? reply.user.name.charAt(0).toUpperCase() : 'A'}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                                {reply.user?.name || 'Admin Laboratorium'}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium">
                                                                <CheckCheck className="w-3 h-3 text-blue-500" />
                                                                Terkirim via Email
                                                            </span>
                                                        </div>
                                                        <span className="text-[11px] text-zinc-400">
                                                            {reply.user?.email}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                                                    {reply.status_at_reply && (
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBadges[reply.status_at_reply]?.color || statusBadges.pending.color}`}>
                                                            Status: {statusBadges[reply.status_at_reply]?.label || reply.status_at_reply}
                                                        </span>
                                                    )}
                                                    <span>{reply.created_at} ({reply.created_at_human})</span>
                                                </div>
                                            </div>

                                            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-800/50 text-slate-800 dark:text-zinc-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                                                {reply.message}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-1.5">
                                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                        Belum ada pesan balasan resmi yang dikirimkan.
                                    </p>
                                    <p className="text-[11px] text-zinc-400">
                                        Gunakan formulir di atas untuk mengirimkan tanggapan langsung ke email pengirim.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 4. Alternative Direct Channels */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                        <Share2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Saluran Kontak Alternatif
                                        </h3>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                            Tautan cepat membuka aplikasi email eksternal atau percakapan WhatsApp.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {/* Email Reply Action Button */}
                                <a
                                    href={mailtoUrl}
                                    className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/70 hover:border-blue-300 dark:hover:border-blue-800 transition-all flex items-start gap-3 group cursor-pointer"
                                >
                                    <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 group-hover:scale-105 transition-transform">
                                        <Mail className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                                            <span>Buka Email Client</span>
                                            <ExternalLink className="w-3 h-3 text-zinc-400" />
                                        </div>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                            Gunakan Outlook / Thunderbird / Gmail lokal
                                        </p>
                                    </div>
                                </a>

                                {/* WhatsApp Reply Action Button */}
                                {ticket.phone ? (
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3.5 rounded-2xl bg-[#0AB600]/5 dark:bg-[#0AB600]/10 border border-[#0AB600]/30 hover:border-[#0AB600] transition-all flex items-start gap-3 group cursor-pointer"
                                    >
                                        <div className="p-2 rounded-xl bg-[#0AB600] text-white shrink-0 group-hover:scale-105 transition-transform">
                                            <Phone className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-[#0AB600]">
                                                <span>Kirim Pesan WhatsApp</span>
                                                <ExternalLink className="w-3 h-3 text-[#0AB600]" />
                                            </div>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                                Kontak instan ke {ticket.phone}
                                            </p>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 flex items-start gap-3 opacity-60">
                                        <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-400 shrink-0">
                                            <Phone className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-semibold text-zinc-500">WhatsApp Tidak Tersedia</p>
                                            <p className="text-[11px] text-zinc-400">Pengirim tidak mencantumkan nomor telepon.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Ticket Resolution & Admin Management Form */}
                        <form onSubmit={handleSaveResolution} className="p-6 rounded-3xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-500">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Status Penanganan & Catatan Internal
                                        </h3>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                            Perbarui status kemajuan tiket dan catat solusi yang diberikan.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Status Selector */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                        Status Tiket
                                    </label>
                                    <select
                                        value={statusDraft}
                                        onChange={(e) => setStatusDraft(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600] transition-colors"
                                    >
                                        <option value="pending">Menunggu (Pending)</option>
                                        <option value="in_progress">Sedang Diproses (In Progress)</option>
                                        <option value="resolved">Selesai Ditangani (Resolved)</option>
                                        <option value="closed">Ditutup (Closed)</option>
                                    </select>
                                </div>

                                {/* Priority Selector */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                        Tingkat Prioritas
                                    </label>
                                    <select
                                        value={priorityDraft}
                                        onChange={(e) => setPriorityDraft(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600] transition-colors"
                                    >
                                        <option value="low">Rendah (Low)</option>
                                        <option value="medium">Sedang (Medium)</option>
                                        <option value="high">Tinggi (High)</option>
                                        <option value="urgent">Urgent / Kritis</option>
                                    </select>
                                </div>
                            </div>

                            {/* Admin Notes / Resolution Summary Textarea */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center justify-between">
                                    <span>Catatan Penanganan & Ringkasan Solusi</span>
                                    <span className="text-[11px] font-normal text-zinc-400">Internal admin & arsip riset</span>
                                </label>
                                <textarea
                                    rows={4}
                                    value={adminNotesDraft}
                                    onChange={(e) => setAdminNotesDraft(e.target.value)}
                                    placeholder="Tuliskan ringkasan jawaban yang telah dikirimkan, tindak lanjut laboratorium, atau hasil koordinasi..."
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600] transition-colors resize-y"
                                />
                            </div>

                            {/* Resolver Info Banner */}
                            {ticket.resolver && (
                                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-[#0AB600] shrink-0" />
                                    <span>
                                        Tiket diselesaikan oleh <strong className="text-slate-800 dark:text-slate-200 font-semibold">{ticket.resolver.name}</strong> ({ticket.resolver.email}) pada {ticket.resolved_at}.
                                    </span>
                                </div>
                            )}

                            {/* Submit & Reset Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Menyimpan Perubahan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>Simpan Perubahan Tiket</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                    </div>

                    {/* Right Column (4 cols): Sender Profile & System Metadata */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* 1. Sender Profile Card */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                                Profil Pengirim
                            </h3>

                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600] font-bold text-base flex items-center justify-center shrink-0">
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

                            <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
                                {/* Email Row */}
                                <div className="space-y-1">
                                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-zinc-400">
                                        Alamat Email
                                    </span>
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
                                </div>

                                {/* Phone Row */}
                                {ticket.phone && (
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-zinc-400">
                                            Nomor Kontak / WhatsApp
                                        </span>
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
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. System Metadata Card */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3.5">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                                Data Audit & Keamanan
                            </h3>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                                    <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                                        <Globe className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>IP Address</span>
                                    </span>
                                    <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">
                                        {ticket.ip_address || '127.0.0.1'}
                                    </span>
                                </div>

                                <div className="space-y-1 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                                    <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                                        <Laptop className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>User Agent / Browser</span>
                                    </span>
                                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-mono break-all line-clamp-2">
                                        {ticket.user_agent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                                    <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>Dibuat</span>
                                    </span>
                                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                        {ticket.created_at}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
