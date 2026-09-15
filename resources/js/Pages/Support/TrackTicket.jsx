import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AppProvider, useApp } from '../../Context/AppContext';
import { useAlert } from '../../Context/AlertContext';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import AiChatWidget from '../../Components/AiChatWidget';
import {
    LifeBuoy,
    Send,
    CheckCircle2,
    Clock,
    RotateCcw,
    CheckCheck,
    AlertCircle,
    FileText,
    Download,
    Paperclip,
    X,
    ArrowLeft,
    Copy,
    Check,
    MessageSquare,
    Shield,
    Sparkles,
    User,
    Mail,
    Building2,
    RefreshCw,
    Radio,
    Mic,
    MicOff,
    Square
} from 'lucide-react';

function TrackTicketContent({ ticket: initialTicket, verifiedEmail }) {
    const { t, language } = useApp();
    const { showSuccess, showError, showWarning } = useAlert();

    const [ticket, setTicket] = useState(initialTicket);
    const [replies, setReplies] = useState(initialTicket.replies || []);
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [attachmentError, setAttachmentError] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(new Date());

    // Voice Speech-to-Text state
    const [isListening, setIsListening] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(false);
    const recognitionRef = useRef(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    const scrollToBottom = (behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        scrollToBottom('auto');
    }, []);

    // Web Speech API: Voice Recognition Setup
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setVoiceSupported(true);
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
                    setNewMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
                }
            };

            recognition.onerror = (event) => {
                console.warn('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    showWarning({
                        title: language === 'id' ? 'Izin Mikrofon Ditolak' : 'Microphone Permission Denied',
                        message: language === 'id' ? 'Harap izinkan akses mikrofon pada browser Anda untuk menggunakan fitur suara.' : 'Please allow microphone access in your browser to use voice typing.',
                    });
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        } else {
            setVoiceSupported(false);
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
                title: language === 'id' ? 'Input Suara Tidak Didukung' : 'Voice Input Not Supported',
                message: language === 'id' ? 'Browser Anda belum mendukung Web Speech API.' : 'Your browser does not support Web Speech API.',
                confirmText: language === 'id' ? 'Mengerti' : 'Got it',
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

    // Polling effect for real-time messages synchronization
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch(
                    `/api/support-tickets/${ticket.ticket_number}/messages?email=${encodeURIComponent(verifiedEmail || ticket.email)}`,
                    { headers: { Accept: 'application/json' } }
                );
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setReplies((prevReplies) => {
                            if (data.replies && JSON.stringify(data.replies) !== JSON.stringify(prevReplies)) {
                                setTimeout(() => scrollToBottom('smooth'), 100);
                                return data.replies;
                            }
                            return prevReplies;
                        });
                        if (data.status && data.status !== ticket.status) {
                            setTicket((prev) => ({ ...prev, status: data.status }));
                        }
                        setLastSyncTime(new Date());
                    }
                }
            } catch (err) {
                // Silently ignore transient network polling errors
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [ticket.ticket_number, verifiedEmail, ticket.email, ticket.status]);

    const handleCopyTicket = () => {
        if (!ticket.ticket_number) return;
        navigator.clipboard.writeText(ticket.ticket_number);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            const errorMsg = language === 'id' ? 'Ukuran berkas tidak boleh melebihi 5MB.' : 'File size must not exceed 5MB.';
            setAttachmentError(errorMsg);
            showWarning({
                title: language === 'id' ? 'Ukuran Berkas Terlalu Besar' : 'File Too Large',
                message: errorMsg,
                confirmText: language === 'id' ? 'Mengerti' : 'Got it',
            });
            return;
        }

        const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'zip', 'doc', 'docx'];
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!ext || !allowedExtensions.includes(ext)) {
            const errorMsg = language === 'id' ? 'Format berkas tidak didukung (gunakan JPG, PNG, PDF, ZIP, DOCX).' : 'Unsupported format (use JPG, PNG, PDF, ZIP, DOCX).';
            setAttachmentError(errorMsg);
            showWarning({
                title: language === 'id' ? 'Format Tidak Didukung' : 'Unsupported Format',
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
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !attachment) {
            return;
        }

        setIsSending(true);

        const formData = new FormData();
        formData.append('message', newMessage.trim());
        formData.append('email', verifiedEmail || ticket.email);
        if (attachment) {
            formData.append('attachment', attachment);
        }

        router.post(`/support/ticket/${ticket.ticket_number}/reply`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsSending(false);
                setNewMessage('');
                handleRemoveFile();
                setTimeout(() => scrollToBottom('smooth'), 100);
            },
            onError: (errors) => {
                setIsSending(false);
                showError({
                    title: language === 'id' ? 'Gagal Mengirim Pesan' : 'Failed to Send Message',
                    message: Object.values(errors)[0] || (language === 'id' ? 'Terjadi kendala saat mengirimkan balasan Anda.' : 'Error sending your reply.'),
                    confirmText: language === 'id' ? 'Tutup' : 'Close',
                });
            },
        });
    };

    const statusBadges = {
        pending: {
            label: language === 'id' ? 'Dalam Antrean (Pending)' : 'In Queue (Pending)',
            color: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
            icon: Clock,
        },
        in_progress: {
            label: language === 'id' ? 'Sedang Diproses (In Progress)' : 'In Progress',
            color: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
            icon: RotateCcw,
        },
        resolved: {
            label: language === 'id' ? 'Selesai (Resolved)' : 'Resolved',
            color: 'bg-[#0AB600]/10 text-[#0AB600] border-[#0AB600]/30',
            icon: CheckCircle2,
        },
        closed: {
            label: language === 'id' ? 'Ditutup (Closed)' : 'Closed',
            color: 'bg-slate-500/10 text-slate-500 border-slate-500/30',
            icon: CheckCheck,
        },
    };

    const priorityBadges = {
        low: { label: language === 'id' ? 'Prioritas Rendah' : 'Low Priority', color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' },
        medium: { label: language === 'id' ? 'Prioritas Sedang' : 'Medium Priority', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
        high: { label: language === 'id' ? 'Prioritas Tinggi' : 'High Priority', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
        urgent: { label: language === 'id' ? 'Prioritas Urgent' : 'Urgent Priority', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    };

    const currentStatus = statusBadges[ticket.status] || statusBadges.pending;
    const StatusIcon = currentStatus.icon;

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFBFD] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 selection:bg-[#0AB600] selection:text-white font-sans antialiased transition-colors">
            <Head title={`Lacak Tiket #${ticket.ticket_number} - ${ticket.subject} - STAS RG`} />

            {/* Top Navigation */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-grow py-6 sm:py-10 relative overflow-hidden">
                {/* Ambient Background Glow Effect (Subtle SaaS light) */}
                <div className="ambient-glow" style={{ filter: 'blur(64px)', WebkitFilter: 'blur(64px)' }} />

                <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 relative z-10">

                    {/* Navigation Bar & Back Button */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <Link
                            href="/support"
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/80 shadow-2xs transition-all"
                        >
                            <ArrowLeft className="w-4 h-4 text-[#0AB600]" />
                            <span>{language === 'id' ? 'Kembali ke Pusat Bantuan' : 'Back to Helpdesk'}</span>
                        </Link>

                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-zinc-900/60 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                            <span className="w-2 h-2 rounded-full bg-[#0AB600] animate-pulse" />
                            <span>Live Sync: Real-Time Active</span>
                        </div>
                    </div>

                    {/* Header Ticket Information Card */}
                    <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#101622] border border-slate-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30 text-xs font-mono font-bold">
                                        <span>#{ticket.ticket_number}</span>
                                        <button
                                            type="button"
                                            onClick={handleCopyTicket}
                                            title="Salin Nomor Tiket"
                                            className="p-0.5 hover:bg-[#0AB600]/20 rounded transition-colors cursor-pointer ml-1"
                                        >
                                            {copied ? <Check className="w-3.5 h-3.5 text-[#0AB600]" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>

                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${currentStatus.color}`}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        <span>{currentStatus.label}</span>
                                    </span>

                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${priorityBadges[ticket.priority]?.color || priorityBadges.medium.color}`}>
                                        {priorityBadges[ticket.priority]?.label || ticket.priority}
                                    </span>
                                </div>

                                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    {ticket.subject}
                                </h1>

                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                        <strong className="text-slate-700 dark:text-slate-300">{ticket.name}</strong>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{ticket.email}</span>
                                    </span>
                                    {ticket.affiliation && (
                                        <span className="flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{ticket.affiliation}</span>
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Dibuat: {ticket.created_at}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat & Conversation Feed Container */}
                    <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#101622] border border-slate-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                        
                        {/* Feed Header */}
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600]">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                        {language === 'id' ? 'Ruang Percakapan Dukungan & Live Chat' : 'Support Conversation & Live Chat'}
                                    </h3>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        {language === 'id' ? 'Pesan terhubung langsung dengan tim helpdesk CoE STAS-RG' : 'Connected directly with CoE STAS-RG helpdesk'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
                                    {replies.length + 1} Pesan
                                </span>
                            </div>
                        </div>

                        {/* Messages List Stream */}
                        <div className="p-4 sm:p-6 space-y-6 flex-grow overflow-y-auto max-h-[600px] bg-slate-50/30 dark:bg-[#0B101B]/40">
                            
                            {/* Message 1: Initial Original Ticket Inquiry */}
                            <div className="flex flex-col items-end space-y-1.5 max-w-[90%] sm:max-w-[80%] ml-auto">
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{ticket.name}</span>
                                    <span>•</span>
                                    <span>{ticket.created_at}</span>
                                </div>

                                <div className="p-4 sm:p-5 rounded-2xl rounded-tr-xs bg-slate-200/70 dark:bg-zinc-800 border border-slate-300/60 dark:border-zinc-700/60 text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-xs">
                                    <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1.5 tracking-wider">
                                        {language === 'id' ? 'Permohonan Awal Tiket' : 'Initial Ticket Request'}
                                    </div>
                                    <div
                                        className="prose dark:prose-invert max-w-none text-xs sm:text-sm"
                                        dangerouslySetInnerHTML={{ __html: ticket.message }}
                                    />

                                    {ticket.attachment_url && (
                                        <div className="mt-3 pt-3 border-t border-slate-300 dark:border-zinc-700/60 flex items-center justify-between gap-3 bg-white/50 dark:bg-black/20 p-2.5 rounded-xl">
                                            <div className="flex items-center gap-2 truncate">
                                                <FileText className="w-4 h-4 text-[#0AB600] shrink-0" />
                                                <span className="text-xs font-semibold truncate">
                                                    {ticket.attachment_original_name || 'Lampiran Berkas'}
                                                </span>
                                            </div>
                                            <a
                                                href={ticket.attachment_url}
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

                            {/* Sequential Replies Stream */}
                            {replies.map((reply) => {
                                const isAdmin = reply.sender_type === 'admin';

                                return (
                                    <div
                                        key={reply.id}
                                        className={`flex flex-col space-y-1.5 max-w-[90%] sm:max-w-[80%] ${isAdmin ? 'items-start mr-auto' : 'items-end ml-auto'}`}
                                    >
                                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                            {isAdmin ? (
                                                <>
                                                    <span className="inline-flex items-center gap-1 font-bold text-[#0AB600]">
                                                        <Shield className="w-3 h-3" />
                                                        {reply.sender_name || 'Tim Layanan STAS-RG'}
                                                    </span>
                                                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30 font-semibold">
                                                        Admin
                                                    </span>
                                                    <span>•</span>
                                                    <span>{reply.created_at}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                        {reply.sender_name || ticket.name}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{reply.created_at}</span>
                                                </>
                                            )}
                                        </div>

                                        <div
                                            className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-xs ${
                                                isAdmin
                                                    ? 'rounded-tl-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-slate-100 ring-1 ring-[#0AB600]/20'
                                                    : 'rounded-tr-xs bg-slate-200/70 dark:bg-zinc-800 border border-slate-300/60 dark:border-zinc-700/60 text-slate-900 dark:text-slate-100'
                                            }`}
                                        >
                                            <div>{reply.message}</div>

                                            {reply.attachment_url && (
                                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-black/20 p-2.5 rounded-xl">
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

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply Composer Box */}
                        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#101622] space-y-3">
                            
                            {/* Active Voice Listening Banner */}
                            {isListening && (
                                <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600] animate-in fade-in-50 slide-in-from-bottom-2">
                                    <div className="flex items-center gap-2.5">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0AB600] opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0AB600]"></span>
                                        </span>
                                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                                            <Mic className="w-3.5 h-3.5 animate-bounce text-[#0AB600]" />
                                            <span>
                                                {language === 'id' ? 'Mendengarkan suara Anda... Silakan berbicara.' : 'Listening to your voice... Speak now.'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleToggleVoice}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                                    >
                                        <Square className="w-3 h-3 fill-current" />
                                        <span>{language === 'id' ? 'Selesai Bicara' : 'Stop'}</span>
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="space-y-3">
                                
                                {/* Unified Card Wrapper */}
                                <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/80 focus-within:border-[#0AB600] focus-within:ring-2 focus-within:ring-[#0AB600]/20 transition-all p-3 space-y-2 shadow-xs">
                                    
                                    {/* Attachment Preview Pill (if any) */}
                                    {attachment && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-xs font-semibold text-[#0AB600] animate-in fade-in-50">
                                            <FileText className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate max-w-xs">{attachment.name}</span>
                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                className="p-0.5 hover:bg-[#0AB600]/20 rounded-full transition-colors cursor-pointer"
                                            >
                                                <X className="w-3.5 h-3.5 text-slate-500 hover:text-rose-500" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Textarea Input */}
                                    <textarea
                                        ref={textareaRef}
                                        rows={3}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                        placeholder={
                                            language === 'id'
                                                ? 'Tuliskan pesan balasan Anda di sini... (Tekan Enter untuk mengirim atau gunakan fitur suara)'
                                                : 'Type your reply message here... (Press Enter to send or use voice typing)'
                                        }
                                        className="w-full bg-transparent border-0 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-0 resize-none p-1 leading-relaxed"
                                    />

                                    {/* Toolbar inside wrapper */}
                                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-zinc-800/60">
                                        
                                        {/* Left Action Buttons: Attachment + Voice Mic */}
                                        <div className="flex items-center gap-1.5">
                                            
                                            {/* File Attachment Button */}
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
                                                title={language === 'id' ? 'Unggah Lampiran (JPG, PNG, PDF, ZIP, DOCX maks 5MB)' : 'Attach File (Max 5MB)'}
                                                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                                                    attachment
                                                        ? 'bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30'
                                                        : 'hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                            >
                                                <Paperclip className="w-4 h-4" />
                                                <span className="hidden sm:inline text-[11px]">
                                                    {attachment ? 'Lampiran Dipilih' : (language === 'id' ? 'Lampirkan Berkas' : 'Attach')}
                                                </span>
                                            </button>

                                            {/* Voice Speech-to-Text Button */}
                                            <button
                                                type="button"
                                                onClick={handleToggleVoice}
                                                title={
                                                    isListening
                                                        ? (language === 'id' ? 'Hentikan Rekam Suara' : 'Stop Voice Recording')
                                                        : (language === 'id' ? 'Diktekan Pesan dengan Suara (Voice Input)' : 'Dictate with Voice')
                                                }
                                                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                                                    isListening
                                                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 animate-pulse'
                                                        : 'hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-400 hover:text-[#0AB600] dark:hover:text-[#0AB600]'
                                                }`}
                                            >
                                                {isListening ? (
                                                    <>
                                                        <MicOff className="w-4 h-4" />
                                                        <span className="text-[11px] font-bold">
                                                            {language === 'id' ? 'Merekam...' : 'Listening...'}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Mic className="w-4 h-4" />
                                                        <span className="hidden sm:inline text-[11px]">
                                                            {language === 'id' ? 'Input Suara' : 'Voice'}
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Right Action: Send Button */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden md:inline">
                                                Shift + Enter untuk baris baru
                                            </span>

                                            <button
                                                type="submit"
                                                disabled={isSending || (!newMessage.trim() && !attachment)}
                                                className="px-4 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-[#0AB600]/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                {isSending ? (
                                                    <>
                                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        <span>{language === 'id' ? 'Mengirim...' : 'Sending...'}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="w-3.5 h-3.5" />
                                                        <span>{language === 'id' ? 'Kirim Balasan' : 'Send Reply'}</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1">
                                    <span>Format berkas: JPG, PNG, PDF, ZIP, DOCX (Maks 5MB)</span>
                                    <span>Dukungan input suara: Bahasa Indonesia & English</span>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <Footer />

            {/* AI Assistant Chat Widget */}
            <AiChatWidget />
        </div>
    );
}

export default function TrackTicket(props) {
    return (
        <AppProvider>
            <TrackTicketContent {...props} />
        </AppProvider>
    );
}
