import React, { useState } from 'react';
import {
    X,
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
    ArrowRight
} from 'lucide-react';
import { router } from '@inertiajs/react';
import RichTextEditor from './Admin/RichTextEditor';

export default function SupportModal({ isOpen, onClose, translations: t, lang = 'id' }) {
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

    if (!isOpen) return null;

    const s = t?.support || {};

    const categoryIcons = {
        general: HelpCircle,
        technical_issue: Bug,
        partnership: Handshake,
        feature_request: Sparkles,
        account_access: ShieldAlert,
    };

    const categories = [
        { key: 'general', label: s.categories?.general || 'General Inquiry', icon: HelpCircle },
        { key: 'technical_issue', label: s.categories?.technical_issue || 'Technical Bug', icon: Bug },
        { key: 'partnership', label: s.categories?.partnership || 'Partnership', icon: Handshake },
        { key: 'feature_request', label: s.categories?.feature_request || 'Feature Request', icon: Sparkles },
        { key: 'account_access', label: s.categories?.account_access || 'Account Access', icon: ShieldAlert },
    ];

    const priorities = [
        { key: 'low', label: s.priorities?.low || 'Low', color: 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400', activeColor: 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white ring-1 ring-slate-400' },
        { key: 'medium', label: s.priorities?.medium || 'Medium', color: 'border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400', activeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500' },
        { key: 'high', label: s.priorities?.high || 'High', color: 'border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400', activeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500' },
        { key: 'urgent', label: s.priorities?.urgent || 'Urgent', color: 'border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400', activeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500' },
    ];

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Max 5MB
        if (file.size > 5 * 1024 * 1024) {
            setAttachmentError(lang === 'id' ? 'Ukuran file tidak boleh melebihi 5MB.' : 'File size must not exceed 5MB.');
            return;
        }

        const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'zip', 'doc', 'docx'];
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!ext || !allowedExtensions.includes(ext)) {
            setAttachmentError(lang === 'id' ? 'Format file tidak didukung (gunakan JPG, PNG, PDF, ZIP, DOCX).' : 'Unsupported file format (use JPG, PNG, PDF, ZIP, DOCX).');
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
                if (flash?.success) {
                    setSuccessData({
                        ticket_number: flash.ticket_number || 'STAS-HELPDESK',
                        message: flash.success,
                    });
                } else {
                    setSuccessData({
                        ticket_number: 'STAS-' + Math.floor(1000 + Math.random() * 9000),
                        message: s.successDesc || 'Ticket submitted successfully.',
                    });
                }
            },
            onError: (errs) => {
                setIsSubmitting(false);
                setErrors(errs);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="relative w-full max-w-4xl bg-white dark:bg-[#0c1410] border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden z-10 my-8">
                {/* Header Pattern Background */}
                <div className="relative bg-[#0AB600] px-6 sm:px-8 py-6 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
                    
                    <div className="relative flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
                                <LifeBuoy className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest font-semibold uppercase bg-white/20 text-white border border-white/30">
                                    {s.badge || 'SUPPORT & HELPDESK'}
                                </span>
                                <h3 className="text-xl font-bold tracking-tight text-white mt-1">
                                    {s.modalTitle || 'Pusat Bantuan & Kontak Dukungan'}
                                </h3>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                {successData ? (
                    /* Success Screen */
                    <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-3xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600] flex items-center justify-center mb-6 animate-in zoom-in-50 duration-300">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>

                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            {s.successTitle || 'Tiket Berhasil Terkirim!'}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed mb-8">
                            {s.successDesc || 'Permintaan bantuan Anda telah dicatat oleh sistem administrasi CoE STAS-RG.'}
                        </p>

                        {/* Ticket Number Card */}
                        <div className="w-full max-w-md p-5 rounded-2xl bg-[#0AB600]/5 dark:bg-[#0AB600]/10 border border-[#0AB600]/20 dark:border-[#0AB600]/30 mb-6 text-left">
                            <p className="text-xs font-mono uppercase tracking-wider text-[#0AB600] font-semibold mb-1">
                                {s.ticketNumberLabel || 'Nomor Referensi Tiket'}
                            </p>
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-mono text-xl font-extrabold text-[#0AB600] tracking-wider">
                                    {successData.ticket_number}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleCopyTicket}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0AB600] text-white hover:bg-[#089600] text-xs font-medium transition-all shadow-sm"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>{s.copied || 'Tersalin!'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>{s.copyTicket || 'Salin Kode'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-500 max-w-lg mb-8 leading-normal">
                            {s.successNote || 'Simpan nomor tiket ini untuk pelacakan. Tim support kami akan menghubungi Anda via email dalam 1x24 jam kerja.'}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium text-sm transition-all"
                            >
                                {s.sendAnother || 'Kirim Tiket Lain'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white font-semibold text-sm shadow-lg shadow-[#0AB600]/20 transition-all"
                            >
                                {s.close || 'Tutup'}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Submission Form */
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto">
                        <div className="bg-[#0AB600]/5 dark:bg-[#0AB600]/10 border border-[#0AB600]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                {s.modalSubtitle || 'Punya kendala teknis, pertanyaan riset, atau permohonan kemitraan? Tim STAS-RG siap membantu.'}
                            </p>
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#0AB600] shrink-0">
                                <Clock className="w-3.5 h-3.5" />
                                {s.responseTarget || 'Respon < 24 jam'}
                            </span>
                        </div>

                        {/* Category Selector */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                {s.category || 'Kategori Pertanyaan'} <span className="text-rose-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                {categories.map((cat) => {
                                    const IconComp = cat.icon;
                                    const isSelected = formData.category === cat.key;
                                    return (
                                        <button
                                            key={cat.key}
                                            type="button"
                                            onClick={() => handleInputChange('category', cat.key)}
                                            className={`p-3 rounded-2xl border text-left flex flex-col items-start gap-2 transition-all ${
                                                isSelected
                                                    ? 'border-[#0AB600] bg-[#0AB600]/10 text-slate-900 dark:text-white ring-2 ring-[#0AB600]/40'
                                                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-white/[0.02]'
                                            }`}
                                        >
                                            <IconComp className={`w-4 h-4 ${isSelected ? 'text-[#0AB600]' : 'text-slate-400'}`} />
                                            <span className="text-xs font-medium leading-snug">{cat.label}</span>
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

                        {/* Priority Selection */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                {s.priority || 'Tingkat Prioritas'}
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {priorities.map((p) => {
                                    const isSelected = formData.priority === p.key;
                                    return (
                                        <button
                                            key={p.key}
                                            type="button"
                                            onClick={() => handleInputChange('priority', p.key)}
                                            className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all text-center ${
                                                isSelected ? p.activeColor : p.color + ' bg-slate-50/50 dark:bg-white/[0.02]'
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Contact Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Name */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    {s.fullName || 'Nama Lengkap'} <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder={s.fullNamePlaceholder || 'Masukkan nama lengkap'}
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0AB600] focus:border-[#0AB600] transition-all"
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
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    {s.email || 'Alamat Email'} <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder={s.emailPlaceholder || 'Masukkan alamat email aktif'}
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0AB600] focus:border-[#0AB600] transition-all"
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
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    {s.phone || 'WhatsApp / Telepon (Opsional)'}
                                </label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder={s.phonePlaceholder || 'Masukkan nomor WhatsApp / telepon'}
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0AB600] focus:border-[#0AB600] transition-all"
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
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    {s.institution || 'Institusi / Instansi (Opsional)'}
                                </label>
                                <div className="relative">
                                    <Building2 className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.institution}
                                        onChange={(e) => handleInputChange('institution', e.target.value)}
                                        placeholder={s.institutionPlaceholder || 'Masukkan nama institusi / instansi'}
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0AB600] focus:border-[#0AB600] transition-all"
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
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                {s.subject || 'Subjek / Judul Permintaan'} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.subject}
                                onChange={(e) => handleInputChange('subject', e.target.value)}
                                placeholder={s.subjectPlaceholder || 'Masukkan subjek atau topik permohonan'}
                                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0AB600] focus:border-[#0AB600] transition-all"
                            />
                            {errors.subject && (
                                <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.subject}
                                </p>
                            )}
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
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
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                {s.attachment || 'Lampiran Dokumen / Screenshot (Opsional)'}
                            </label>

                            {attachment ? (
                                <div className="p-3 bg-[#0AB600]/10 border border-[#0AB600]/30 rounded-xl flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                        <FileText className="w-5 h-5 text-[#0AB600] shrink-0" />
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
                                        className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-500 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl cursor-pointer hover:border-[#0AB600] hover:bg-[#0AB600]/5 transition-all">
                                    <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                        {lang === 'id' ? 'Klik atau seret file ke sini' : 'Click or drag file here'}
                                    </span>
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
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

                        {/* Footer Action Buttons */}
                        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <MapPin className="w-3.5 h-3.5 text-[#0AB600] shrink-0" />
                                <span className="truncate">{s.labLocation || 'Gd. Riset Terpadu Lt. 3, Bandung'}</span>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-medium text-sm transition-all"
                                >
                                    {s.close || 'Batal'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white font-semibold text-sm shadow-lg shadow-[#0AB600]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>{s.submitting || 'Mengirimkan...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>{s.submitBtn || 'Kirim Tiket Bantuan'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
