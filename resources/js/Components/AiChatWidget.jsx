import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { useApp } from '../Context/AppContext';
import { useAlert } from '../Context/AlertContext';
import { 
    Bot, 
    Sparkles, 
    X, 
    Send, 
    RotateCcw, 
    User, 
    Copy, 
    Check, 
    ExternalLink, 
    Loader2,
    Cpu,
    Zap,
    ThumbsUp,
    ThumbsDown,
    Shield,
    Layers,
    ArrowUpRight,
    ArrowRight,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Paperclip,
    Download,
    Maximize2,
    Minimize2,
    FileText,
    Image as ImageIcon,
    Trash2,
    CheckCircle2,
    Sparkle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

function AiAvatar({ className = "w-7 h-7", iconClass = "w-4 h-4 text-[#0AB600]" }) {
    const [imgError, setImgError] = useState(false);
    
    if (imgError) {
        return (
            <div className={`${className} bg-[#0AB600]/15 rounded-full flex items-center justify-center text-[#0AB600] shrink-0`}>
                <Bot className={iconClass} />
            </div>
        );
    }

    return (
        <div className={`${className} rounded-full border-2 border-[#0AB600] overflow-hidden bg-white dark:bg-[#131C2E] shrink-0 flex items-center justify-center shadow-xs`}>
            <img 
                src="/assets/img/icon/profile_cs.png" 
                alt="NARA" 
                className="w-full h-full object-cover object-center scale-[1.18]"
                onError={() => setImgError(true)}
            />
        </div>
    );
}

/**
 * Clean markdown for smooth text-to-speech output
 */
function cleanMarkdownForSpeech(text) {
    if (!text || typeof text !== 'string') return '';
    return text
        .replace(/```[\s\S]*?```/g, ' cuplikan kode terlampir. ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/[*_~#>]/g, '')
        .replace(/^[•\-\*\+]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        .replace(/\n+/g, ' ')
        .trim();
}

/**
 * Parses inline markdown tokens: bold, italic, bold+italic, code, and links.
 */
function parseInlineMarkdown(text, isAssistant, keyPrefix = 'inline') {
    if (!text || typeof text !== 'string') return text;

    const regex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)|`([^`]+)`|\*\*\*([^*]+)\*\*\*|___([^_]+)___|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_)/g;

    const elements = [];
    let lastIndex = 0;
    let match;
    let counter = 0;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            elements.push(text.substring(lastIndex, match.index));
        }

        const [fullMatch, , linkText, linkUrl, codeText, boldItalicText1, boldItalicText2, boldText1, boldText2, italicText1, italicText2] = match;
        const key = `${keyPrefix}-${counter++}`;

        if (linkText && linkUrl) {
            elements.push(
                <a
                    key={key}
                    href={linkUrl}
                    target={linkUrl.startsWith('http') ? '_blank' : undefined}
                    rel={linkUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={isAssistant 
                        ? "text-[#0AB600] dark:text-[#22c55e] underline font-semibold hover:opacity-80 inline-flex items-center gap-0.5 break-all" 
                        : "text-white underline font-semibold break-all"}
                >
                    {linkText}
                </a>
            );
        } else if (codeText) {
            elements.push(
                <code
                    key={key}
                    className={isAssistant 
                        ? "px-1.5 py-0.5 mx-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px] text-[#0AB600] dark:text-[#22c55e] border border-zinc-200 dark:border-zinc-700 break-all inline" 
                        : "px-1.5 py-0.5 mx-0.5 rounded bg-white/20 font-mono text-[11px] text-white break-all inline"}
                >
                    {codeText}
                </code>
            );
        } else if (boldItalicText1 || boldItalicText2) {
            const biText = boldItalicText1 || boldItalicText2;
            elements.push(
                <strong key={key} className={isAssistant ? "font-bold italic text-slate-900 dark:text-white break-words" : "font-bold italic break-words"}>
                    {biText}
                </strong>
            );
        } else if (boldText1 || boldText2) {
            const bText = boldText1 || boldText2;
            elements.push(
                <strong key={key} className={isAssistant ? "font-bold text-slate-900 dark:text-white break-words" : "font-bold break-words"}>
                    {bText}
                </strong>
            );
        } else if (italicText1 || italicText2) {
            const iText = italicText1 || italicText2;
            elements.push(
                <em key={key} className="italic break-words">
                    {iText}
                </em>
            );
        }

        lastIndex = match.index + fullMatch.length;
    }

    if (lastIndex < text.length) {
        elements.push(text.substring(lastIndex));
    }

    return elements.length > 0 ? elements : text;
}

/**
 * Rich message renderer supporting markdown headings, tables, ordered/unordered lists, blockquotes, and paragraphs.
 */
function FormattedMessage({ content, isAssistant }) {
    if (!content) return null;

    const lines = content.split('\n');
    const nodes = [];
    let currentList = null;

    const flushList = (key) => {
        if (currentList) {
            if (currentList.type === 'ol') {
                nodes.push(
                    <ol key={key} className="my-1.5 space-y-1 pl-0.5 max-w-full">
                        {currentList.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11.5px] leading-relaxed max-w-full">
                                <span className={isAssistant ? "font-bold text-[#0AB600] shrink-0 min-w-[14px]" : "font-bold text-white shrink-0 min-w-[14px]"}>
                                    {item.num}.
                                </span>
                                <div className="flex-1 min-w-0 break-words [overflow-wrap:anywhere]">
                                    {parseInlineMarkdown(item.text, isAssistant, `ol-${idx}`)}
                                </div>
                            </li>
                        ))}
                    </ol>
                );
            } else {
                nodes.push(
                    <ul key={key} className="my-1.5 space-y-1 pl-0.5 max-w-full">
                        {currentList.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11.5px] leading-relaxed max-w-full">
                                <span className={isAssistant ? "text-[#0AB600] font-bold mt-0.5 leading-none shrink-0" : "text-white font-bold mt-0.5 leading-none shrink-0"}>
                                •
                                </span>
                                <div className="flex-1 min-w-0 break-words [overflow-wrap:anywhere]">
                                    {parseInlineMarkdown(item.text, isAssistant, `ul-${idx}`)}
                                </div>
                            </li>
                        ))}
                    </ul>
                );
            }
            currentList = null;
        }
    };

    lines.forEach((rawLine, i) => {
        const line = rawLine.trim();

        if (!line) {
            flushList(`list-${i}`);
            nodes.push(<div key={`spacer-${i}`} className="h-1.5" />);
            return;
        }

        // Ordered list (e.g. "1. **Smart Agriculture**:")
        const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (olMatch) {
            if (!currentList || currentList.type !== 'ol') {
                flushList(`flush-${i}`);
                currentList = { type: 'ol', items: [] };
            }
            currentList.items.push({ num: olMatch[1], text: olMatch[2] });
            return;
        }

        // Unordered list (e.g. "- Smart Agriculture" or "* Smart Agriculture" or "• ...")
        const ulMatch = line.match(/^[-*•]\s+(.*)$/);
        if (ulMatch) {
            if (!currentList || currentList.type !== 'ul') {
                flushList(`flush-${i}`);
                currentList = { type: 'ul', items: [] };
            }
            currentList.items.push({ text: ulMatch[1] });
            return;
        }

        // Heading (###, ##, #)
        const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
        if (headingMatch) {
            flushList(`flush-${i}`);
            nodes.push(
                <div key={`h-${i}`} className={`font-bold my-1.5 text-slate-900 dark:text-white break-words [overflow-wrap:anywhere] ${headingMatch[1].length <= 2 ? 'text-xs border-b border-zinc-200/60 dark:border-zinc-700/60 pb-1' : 'text-[11.5px]'}`}>
                    {parseInlineMarkdown(headingMatch[2], isAssistant, `h-${i}`)}
                </div>
            );
            return;
        }

        // Blockquote (> text)
        if (line.startsWith('>')) {
            flushList(`flush-${i}`);
            const quoteText = line.replace(/^>\s*/, '');
            nodes.push(
                <div key={`quote-${i}`} className="my-1.5 pl-2.5 border-l-2 border-[#0AB600] italic text-zinc-600 dark:text-zinc-300 text-[11px] bg-[#0AB600]/5 py-1 rounded-r-md break-words [overflow-wrap:anywhere]">
                    {parseInlineMarkdown(quoteText, isAssistant, `quote-${i}`)}
                </div>
            );
            return;
        }

        // Normal paragraph text
        flushList(`flush-${i}`);
        nodes.push(
            <div key={`p-${i}`} className="text-[11.5px] leading-relaxed break-words [overflow-wrap:anywhere]">
                {parseInlineMarkdown(line, isAssistant, `p-${i}`)}
            </div>
        );
    });

    flushList('flush-final');

    return <div className="space-y-0.5 max-w-full min-w-0 overflow-hidden break-words [overflow-wrap:anywhere]">{nodes}</div>;
}

export default function AiChatWidget() {
    const { t, language } = useApp();
    const { showConfirm, showWarning, showError } = useAlert();
    const isId = language === 'id';
    const chatT = t?.aiChat || {};

    const [isOpen, setIsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [feedbackState, setFeedbackState] = useState({});
    const [chatMode, setChatMode] = useState('general');
    const [activeTab, setActiveTab] = useState('all');
    const [isTopicsExpanded, setIsTopicsExpanded] = useState(false);

    // Voice & Audio States
    const [isListening, setIsListening] = useState(false);
    const [voiceError, setVoiceError] = useState(null);
    const [speakingMessageId, setSpeakingMessageId] = useState(null);

    // Attachment State
    const [attachment, setAttachment] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const [messages, setMessages] = useState(() => {
        try {
            const saved = sessionStorage.getItem('stas_ai_chat_messages');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch {
            // ignore
        }
        return [
            {
                id: 'welcome',
                role: 'assistant',
                content: chatT.welcomeMessage || (isId 
                    ? 'Halo! Saya NARA, Asisten AI CoE STAS-RG Telkom University.\n\nAda yang bisa saya bantu terkait riset terapan, direktori inovasi, pembuatan dokumen Flyer & Brosur, atau konsultasi kemitraan?'
                    : 'Hello! I am NARA, the CoE STAS-RG Telkom University AI Assistant.\n\nHow can I help you regarding applied research, innovation portfolio, documents, or partnership opportunities?'),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
        ];
    });

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);

    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, messages, isLoading]);

    // Persist messages in session
    useEffect(() => {
        try {
            sessionStorage.setItem('stas_ai_chat_messages', JSON.stringify(messages));
        } catch {
            // ignore
        }
    }, [messages]);

    // External trigger to open chat with optional prompt and mode
    useEffect(() => {
        const handleOpenChat = (e) => {
            setIsOpen(true);
            const prompt = e.detail?.prompt;
            const mode = e.detail?.mode;
            if (mode) setChatMode(mode);
            if (prompt) {
                setTimeout(() => {
                    handleSendMessage(prompt);
                }, 200);
            }
        };

        window.addEventListener('open-nara-chat', handleOpenChat);
        window.addEventListener('open-stas-ai-chat', handleOpenChat);

        return () => {
            window.removeEventListener('open-nara-chat', handleOpenChat);
            window.removeEventListener('open-stas-ai-chat', handleOpenChat);
        };
    }, [messages, isLoading]);

    // Web Speech API: Voice Recognition Setup
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = isId ? 'id-ID' : 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
                setVoiceError(null);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (transcript) {
                    setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
                }
            };

            recognition.onerror = (event) => {
                console.warn('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    setVoiceError(chatT.voice?.permissionDenied || (isId ? 'Izin mikrofon ditolak.' : 'Microphone permission denied.'));
                } else if (event.error !== 'no-speech') {
                    setVoiceError(event.error);
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
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, [language]);

    // Toggle Voice Input
    const handleToggleVoice = () => {
        if (!recognitionRef.current) {
            showWarning({
                title: isId ? 'Input Suara Tidak Didukung' : 'Voice Input Not Supported',
                message: chatT.voice?.notSupported || (isId ? 'Browser Anda tidak mendukung Web Speech API.' : 'Browser does not support Web Speech API.'),
                confirmText: isId ? 'Mengerti' : 'Understood',
            });
            return;
        }

        if (isListening) {
            try {
                recognitionRef.current.stop();
            } catch {
                // ignore
            }
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.lang = isId ? 'id-ID' : 'en-US';
                recognitionRef.current.start();
            } catch (err) {
                console.error('Failed to start speech recognition:', err);
                setIsListening(false);
            }
        }
    };

    // Text-to-Speech (TTS) for Assistant Messages
    const handleToggleTTS = (messageId, rawContent) => {
        if (!('speechSynthesis' in window)) return;

        if (speakingMessageId === messageId) {
            window.speechSynthesis.cancel();
            setSpeakingMessageId(null);
            return;
        }

        window.speechSynthesis.cancel();
        const cleanText = cleanMarkdownForSpeech(rawContent);
        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = isId ? 'id-ID' : 'en-US';
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        // Try to pick a natural voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => isId ? v.lang.startsWith('id') : v.lang.startsWith('en'));
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
            setSpeakingMessageId(messageId);
        };

        utterance.onend = () => {
            setSpeakingMessageId(null);
        };

        utterance.onerror = () => {
            setSpeakingMessageId(null);
        };

        window.speechSynthesis.speak(utterance);
    };

    // Handle File Attachment Selection
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showWarning({
                title: isId ? 'Ukuran Berkas Terlalu Besar' : 'File Size Limit Exceeded',
                message: chatT.attachment?.tooLarge || (isId ? 'Ukuran file melebihi batas maksimum 5MB.' : 'File exceeds 5MB limit.'),
                confirmText: isId ? 'Mengerti' : 'Understood',
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const isImage = file.type.startsWith('image/');
        const reader = new FileReader();

        if (isImage) {
            reader.onload = (event) => {
                setAttachment({
                    file,
                    name: file.name,
                    size: (file.size / 1024).toFixed(1) + ' KB',
                    type: file.type,
                    data: event.target.result,
                    isImage: true,
                });
            };
            reader.readAsDataURL(file);
        } else {
            reader.onload = (event) => {
                setAttachment({
                    file,
                    name: file.name,
                    size: (file.size / 1024).toFixed(1) + ' KB',
                    type: file.type || 'text/plain',
                    text: event.target.result,
                    isImage: false,
                });
            };
            reader.readAsText(file);
        }
    };

    const handleRemoveAttachment = () => {
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Export Conversation History
    const handleExportChat = () => {
        const title = `# NARA Assistant Chat Transcript\n*Timestamp: ${new Date().toLocaleString()}*\n*Mode: ${chatMode}*\n\n---\n\n`;
        const content = messages.map(m => {
            const sender = m.role === 'assistant' ? '**NARA (Asisten Riset)**' : '**Pengguna**';
            return `### ${sender} _(${m.timestamp})_\n\n${m.content}\n\n`;
        }).join('\n---\n\n');

        const blob = new Blob([title + content], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nara-chat-transcript-${Date.now()}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleSendMessage = async (customText = null) => {
        const textToSend = typeof customText === 'string' ? customText : input;
        if ((!textToSend.trim() && !attachment) || isLoading) return;

        const currentAttachment = attachment;
        const userMsg = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: textToSend.trim(),
            attachment: currentAttachment ? {
                name: currentAttachment.name,
                size: currentAttachment.size,
                isImage: currentAttachment.isImage,
                data: currentAttachment.isImage ? currentAttachment.data : null,
            } : null,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const newHistory = [...messages, userMsg];
        setMessages(newHistory);
        setInput('');
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsLoading(true);

        try {
            const backendHistory = newHistory
                .filter(m => m.id !== 'welcome' && !m.id?.startsWith('ai-err-') && m.content)
                .slice(-6)
                .map(m => ({
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: typeof m.content === 'string' ? m.content.slice(0, 1500) : ''
                }));

            const payload = {
                message: userMsg.content,
                history: backendHistory,
                language: language,
                mode: chatMode,
            };

            if (currentAttachment) {
                if (currentAttachment.isImage && currentAttachment.data) {
                    payload.attachment_base64 = currentAttachment.data;
                    payload.attachment_mime = currentAttachment.type;
                    payload.attachment_name = currentAttachment.name;
                } else if (currentAttachment.text) {
                    payload.attachment_text = currentAttachment.text;
                    payload.attachment_name = currentAttachment.name;
                    payload.attachment_mime = currentAttachment.type;
                }
            }

            let aiReply = '';

            if (window.axios) {
                const res = await window.axios.post('/api/ai/public-chat', payload);
                aiReply = res.data?.reply;
            } else {
                const response = await fetch('/api/ai/public-chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }

                const data = await response.json();
                aiReply = data.reply;
            }

            if (!aiReply) {
                aiReply = isId 
                    ? 'Terima kasih atas pesan Anda. Silakan hubungi tim kami via menu Bantuan (/support) untuk konsultasi lebih lanjut.'
                    : 'Thank you for your message. Please reach out to our team via the Support page (/support) for further consultation.';
            }

            setMessages(prev => [
                ...prev,
                {
                    id: `ai-${Date.now()}`,
                    role: 'assistant',
                    content: aiReply,
                    mode: chatMode,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
            ]);
        } catch (err) {
            console.error('Chat error:', err);
            const isRateLimit = err?.response?.status === 429 || err?.message?.includes('429');
            const errorMsg = isRateLimit 
                ? (isId ? 'Terlalu banyak permintaan. Mohon tunggu sejenak.' : 'Too many requests. Please wait a moment.')
                : (chatT.errorNotice || (isId 
                    ? 'Maaf, terjadi kendala komunikasi dengan server AI. Anda tetap dapat menjelajahi publikasi di showcase atau menghubungi kami via formulir /support.'
                    : 'Sorry, communication with the AI server timed out. You can still explore showcase publications or contact us via /support.'));

            setMessages(prev => [
                ...prev,
                {
                    id: `ai-err-${Date.now()}`,
                    role: 'assistant',
                    content: errorMsg,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = async () => {
        const confirmed = await showConfirm({
            title: chatT.clearConfirmTitle || (isId ? 'Hapus Riwayat Percakapan' : 'Clear Chat History'),
            message: chatT.clearConfirm || (isId ? 'Apakah Anda yakin ingin menghapus seluruh riwayat percakapan dengan NARA? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to clear all conversation history with NARA? This action cannot be undone.'),
            confirmText: chatT.clearConfirmBtn || (isId ? 'Hapus Riwayat' : 'Clear History'),
            cancelText: chatT.cancelBtn || (isId ? 'Batal' : 'Cancel'),
            variant: 'danger',
        });

        if (confirmed) {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            setSpeakingMessageId(null);
            const welcomeMsg = [
                {
                    id: 'welcome',
                    role: 'assistant',
                    content: chatT.welcomeMessage || (isId 
                        ? 'Halo! Saya NARA, Asisten AI CoE STAS-RG Telkom University.\n\nAda yang bisa saya bantu terkait riset terapan, direktori inovasi, atau pembuatan dokumen Flyer & Brosur?'
                        : 'Hello! I am NARA, the CoE STAS-RG Telkom University AI Assistant.\n\nHow can I help you regarding applied research, innovation portfolio, or documents?'),
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
            ];
            setMessages(welcomeMsg);
            sessionStorage.removeItem('stas_ai_chat_messages');
        }
    };

    const handleCopyText = (id, text) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleFeedback = (id, type) => {
        setFeedbackState(prev => ({
            ...prev,
            [id]: prev[id] === type ? null : type
        }));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Mode definitions
    const modes = [
        { id: 'general', label: chatT.modes?.general || (isId ? 'Umum' : 'General'), icon: Sparkles },
        { id: 'research', label: chatT.modes?.research || (isId ? 'Riset & IoT' : 'Research'), icon: Cpu },
        { id: 'document', label: chatT.modes?.document || (isId ? 'Dokumen' : 'Docs'), icon: FileText },
        { id: 'partner', label: chatT.modes?.partner || (isId ? 'Kemitraan' : 'Partner'), icon: Shield },
    ];

    // Dynamic multilingual quick topics configuration
    const quickTopicsData = chatT.quickTopics || {
        title: isId ? 'Topik Eksplorasi Cepat' : 'Quick Exploration Topics',
        showMore: isId ? 'Buka Topik' : 'Show Topics',
        showLess: isId ? 'Tutup Topik' : 'Hide Topics',
        categories: {
            all: isId ? 'Semua' : 'All',
            research: isId ? 'Riset' : 'Research',
            docs: isId ? 'Dokumen' : 'Docs',
            partner: isId ? 'Mitra' : 'Partner',
        },
        items: [
            { cat: 'research', text: isId ? 'Apa saja bidang riset unggulan di CoE STAS-RG?' : 'What are the core research domains of CoE STAS-RG?' },
            { cat: 'research', text: isId ? 'Sebutkan contoh proyek riset IoT yang telah dipublikasikan.' : 'Give examples of published IoT research projects.' },
            { cat: 'docs', text: isId ? 'Apa aturan batas karakter Flyer A4 Balanced?' : 'What are the character limits for Balanced A4 Flyer?' },
            { cat: 'docs', text: isId ? 'Bagaimana cara menyusun Brosur Lipat Tiga Trifold?' : 'How do I organize a 3-panel Trifold Brochure?' },
            { cat: 'partner', text: isId ? 'Bagaimana prosedur mengajukan kerjasama riset dengan lab?' : 'How do we submit a research collaboration proposal?' },
            { cat: 'partner', text: isId ? 'Siapa saja daftar peneliti utama di CoE STAS-RG?' : 'Who are the lead researchers at CoE STAS-RG?' }
        ]
    };

    const promptCategories = [
        { id: 'all', label: quickTopicsData.categories?.all || (isId ? 'Semua' : 'All') },
        { id: 'research', label: quickTopicsData.categories?.research || (isId ? 'Riset' : 'Research') },
        { id: 'docs', label: quickTopicsData.categories?.docs || (isId ? 'Dokumen' : 'Docs') },
        { id: 'partner', label: quickTopicsData.categories?.partner || (isId ? 'Mitra' : 'Partner') }
    ];

    const promptItems = quickTopicsData.items || [];

    const filteredPrompts = activeTab === 'all' 
        ? promptItems 
        : promptItems.filter(p => p.cat === activeTab);

    return (
        <aside aria-label="Interactive AI Assistant Widget" className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[60] font-sans select-none">
            
            {/* Hidden File Input for Attachments */}
            <input 
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".txt,.pdf,.csv,.json,.md,image/png,image/jpeg,image/webp"
                onChange={handleFileSelect}
            />

            {/* ═══════ 1. INTERACTIVE CHAT WINDOW (SLENDER OR EXPANDED FULLSCREEN) ═══════ */}
            {isOpen && (
                <div 
                    className={`fixed z-[45] bg-white dark:bg-[#0E1524] rounded-2xl border border-zinc-200 dark:border-zinc-800 ring-1 ring-[#0AB600]/30 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200 ${
                        isFullscreen 
                            ? 'top-4 bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[680px] sm:h-[calc(100dvh-5rem)]' 
                            : 'bottom-20 sm:bottom-22 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[370px] h-[460px] sm:h-[500px] max-h-[calc(100dvh-8rem)]'
                    }`}
                >
                    
                    {/* ──── Header: Solid Main Brand Color (#0AB600) ──── */}
                    <div className="px-3.5 py-2.5 bg-[#0AB600] text-white flex items-center justify-between shrink-0 border-b border-[#089600]">
                        <div className="flex items-center gap-2">
                            <div className="relative shrink-0">
                                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden flex items-center justify-center bg-white shadow-xs">
                                    <img
                                        src="/assets/img/icon/profile_cs.png"
                                        alt="NARA"
                                        className="w-full h-full object-cover object-center scale-[1.18]"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-300 rounded-full border-2 border-[#0AB600] z-10" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold tracking-tight text-white leading-none">
                                    {chatT.title || 'NARA Assistant'}
                                </h3>
                                <p className="text-[10px] text-emerald-100 font-medium mt-0.5">
                                    {chatT.onlineStatus || 'Grounded AI Live'}
                                </p>
                            </div>
                        </div>

                        {/* Controls (Export, Fullscreen, Clear, Close) */}
                        <div className="flex items-center gap-0.5 text-white/90">
                            <button
                                type="button"
                                onClick={handleExportChat}
                                className="p-1.5 rounded-lg hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                                title={chatT.actions?.export || 'Ekspor Percakapan (.md)'}
                            >
                                <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="p-1.5 rounded-lg hover:bg-white/20 hover:text-white transition-colors cursor-pointer hidden sm:block"
                                title={isFullscreen ? (chatT.actions?.minimize || 'Kecilkan') : (chatT.actions?.fullscreen || 'Perbesar')}
                            >
                                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                            </button>
                            <button
                                type="button"
                                onClick={handleClearChat}
                                className="p-1.5 rounded-lg hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                                title={chatT.clearChat || 'Bersihkan Percakapan'}
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                                title="Tutup"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* ──── Mode Selector Strip ──── */}
                    <div className="px-3 py-2 bg-[#FAFBFD] dark:bg-[#090E17] border-b border-zinc-200/80 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1 pl-0.5">
                            {isId ? 'Mode:' : 'Mode:'}
                        </span>
                        {modes.map(m => {
                            const Icon = m.icon;
                            const isActive = chatMode === m.id;
                            return (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setChatMode(m.id)}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs ${
                                        isActive
                                            ? 'bg-[#0AB600] text-white shadow-xs scale-[1.02]'
                                            : 'bg-white dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 hover:bg-[#0AB600]/10 hover:text-[#0AB600]'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5 shrink-0" />
                                    <span>{m.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* ──── Body: Message Feed ──── */}
                    <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-[#FAFBFD] dark:bg-[#0B101D] text-xs leading-relaxed select-text">
                        
                        {/* Compact Dropdown Suggestion Hub */}
                        {messages.length <= 1 && (
                            <div className="rounded-xl bg-white dark:bg-[#131C2E] border border-zinc-200/90 dark:border-zinc-800 shadow-2xs overflow-hidden transition-all">
                                
                                {/* Dropdown Trigger Bar */}
                                <button
                                    type="button"
                                    onClick={() => setIsTopicsExpanded(!isTopicsExpanded)}
                                    className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                                >
                                    <span className="text-[10.5px] font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-[#0AB600]" />
                                        <span>{quickTopicsData.title || (isId ? 'Topik Eksplorasi Cepat' : 'Quick Exploration Topics')}</span>
                                        <span className="px-1.5 py-0.2 rounded-full bg-[#0AB600]/10 text-[#0AB600] text-[9px] font-bold">
                                            {filteredPrompts.length}
                                        </span>
                                    </span>
                                    <div className="flex items-center gap-1 text-[9.5px] font-semibold text-slate-400 dark:text-slate-500">
                                        <span>{isTopicsExpanded ? (quickTopicsData.showLess || (isId ? 'Tutup' : 'Hide')) : (quickTopicsData.showMore || (isId ? 'Buka' : 'Show'))}</span>
                                        {isTopicsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#0AB600]" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </div>
                                </button>

                                {/* Dropdown Expandable Content */}
                                {isTopicsExpanded && (
                                    <div className="p-2.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                                        {/* Category Filter Pills */}
                                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                                            {promptCategories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setActiveTab(cat.id)}
                                                    className={`px-2 py-0.5 rounded-md text-[9px] font-semibold transition-all cursor-pointer shrink-0 ${
                                                        activeTab === cat.id
                                                            ? 'bg-[#0AB600] text-white shadow-xs'
                                                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                                    }`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Clickable Question Prompts */}
                                        <div className="grid grid-cols-1 gap-1 max-h-[160px] overflow-y-auto pr-0.5">
                                            {filteredPrompts.map((item, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => {
                                                        handleSendMessage(item.text);
                                                        setIsTopicsExpanded(false);
                                                    }}
                                                    className="text-left px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 hover:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/15 text-zinc-700 dark:text-zinc-300 hover:text-[#0AB600] dark:hover:text-[#0AB600] border border-zinc-200/80 dark:border-zinc-700/80 transition-all text-[10px] font-medium flex items-center justify-between cursor-pointer group"
                                                >
                                                    <span className="line-clamp-1">{item.text}</span>
                                                    <ArrowUpRight className="w-3 h-3 text-[#0AB600] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1.5" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Render Message List */}
                        {messages.map((msg) => {
                            const isAssistant = msg.role === 'assistant';
                            const isSpeaking = speakingMessageId === msg.id;

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex items-start gap-2 max-w-full min-w-0 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                                >
                                    {isAssistant && (
                                        <AiAvatar className="w-6 h-6 rounded-full shrink-0 mt-0.5" iconClass="w-3.5 h-3.5 text-[#0AB600]" />
                                    )}

                                    <div
                                        className={`max-w-[85%] sm:max-w-[88%] min-w-0 rounded-2xl px-3 py-2.5 relative group transition-all shadow-xs overflow-hidden break-words [overflow-wrap:anywhere] ${
                                            isAssistant
                                                ? 'bg-white dark:bg-[#131C2E] border border-zinc-200/90 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 rounded-tl-xs'
                                                : 'bg-[#0AB600] text-white font-medium rounded-br-xs'
                                        }`}
                                    >
                                        {/* Attachment Preview for User Message */}
                                        {msg.attachment && (
                                            <div className="mb-2 p-1.5 rounded-lg bg-white/15 border border-white/20 flex items-center gap-2 text-[10.5px] max-w-full overflow-hidden">
                                                {msg.attachment.isImage ? (
                                                    <img src={msg.attachment.data} alt="Upload" className="w-7 h-7 rounded object-cover shrink-0" />
                                                ) : (
                                                    <FileText className="w-4 h-4 text-white shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0 truncate">
                                                    <div className="font-bold truncate">{msg.attachment.name}</div>
                                                    <div className="text-[9px] opacity-80">{msg.attachment.size}</div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="text-[11.5px] leading-relaxed max-w-full min-w-0 overflow-hidden break-words [overflow-wrap:anywhere]">
                                            <FormattedMessage content={msg.content} isAssistant={isAssistant} />
                                        </div>

                                        {/* Metadata & Message Action Bar */}
                                        <div className={`mt-2 pt-1.5 flex items-center justify-between text-[9px] ${
                                            isAssistant 
                                                ? 'text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800' 
                                                : 'text-emerald-100 justify-end'
                                        }`}>
                                            <span className="flex items-center gap-1">
                                                <span>{msg.timestamp}</span>
                                                {isSpeaking && (
                                                    <span className="text-[#0AB600] font-bold flex items-center gap-0.5 animate-pulse">
                                                        <Volume2 className="w-2.5 h-2.5" />
                                                        <span>Membaca...</span>
                                                    </span>
                                                )}
                                            </span>

                                            {isAssistant && (
                                                <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {/* Text-to-Speech Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleTTS(msg.id, msg.content)}
                                                        className={`p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                                                            isSpeaking ? 'text-[#0AB600]' : 'text-zinc-400 hover:text-[#0AB600]'
                                                        }`}
                                                        title={isSpeaking ? (chatT.voice?.stopSpeak || 'Hentikan Suara') : (chatT.voice?.speak || 'Dengarkan Suara')}
                                                    >
                                                        {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                                    </button>

                                                    {/* Copy Text Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyText(msg.id, msg.content)}
                                                        className="p-1 rounded text-zinc-400 hover:text-[#0AB600] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                                        title={copiedId === msg.id ? (chatT.actions?.copied || 'Tersalin!') : (chatT.actions?.copy || 'Salin Pesan')}
                                                    >
                                                        {copiedId === msg.id ? (
                                                             <Check className="w-3 h-3 text-[#0AB600]" />
                                                        ) : (
                                                            <Copy className="w-3 h-3" />
                                                        )}
                                                    </button>

                                                    {msg.id !== 'welcome' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleFeedback(msg.id, 'up')}
                                                                className={`p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                                                                    feedbackState[msg.id] === 'up'
                                                                        ? 'text-[#0AB600]'
                                                                        : 'text-zinc-400 hover:text-zinc-600'
                                                                }`}
                                                                title="Membantu"
                                                            >
                                                                <ThumbsUp className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleFeedback(msg.id, 'down')}
                                                                className={`p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                                                                    feedbackState[msg.id] === 'down'
                                                                        ? 'text-rose-500'
                                                                        : 'text-zinc-400 hover:text-zinc-600'
                                                                }`}
                                                                title="Kurang Membantu"
                                                            >
                                                                <ThumbsDown className="w-3 h-3" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {!isAssistant && (
                                        <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 shrink-0 mt-0.5">
                                            <User className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Thinking / Analyzing Indicator */}
                        {isLoading && (
                            <div className="flex items-start gap-2 justify-start">
                                <AiAvatar className="w-6 h-6 rounded-full" iconClass="w-3.5 h-3.5 text-[#0AB600]" />
                                <div className="p-2.5 rounded-xl bg-white dark:bg-[#131C2E] border border-zinc-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 flex items-center gap-2 shadow-xs">
                                    <div className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600] animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600] animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600] animate-bounce" />
                                    </div>
                                    <span className="text-[10px] font-semibold text-[#0AB600]">
                                        {chatT.thinking || 'NARA sedang menganalisis...'}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* ──── Active Attachment Pill (if attached) ──── */}
                    {attachment && (
                        <div className="px-3 py-1.5 bg-[#0AB600]/10 dark:bg-[#0AB600]/15 border-t border-[#0AB600]/30 flex items-center justify-between text-xs shrink-0">
                            <div className="flex items-center gap-2 truncate text-slate-800 dark:text-zinc-200">
                                {attachment.isImage ? (
                                    <ImageIcon className="w-3.5 h-3.5 text-[#0AB600] shrink-0" />
                                ) : (
                                    <FileText className="w-3.5 h-3.5 text-[#0AB600] shrink-0" />
                                )}
                                <span className="font-bold text-[10.5px] truncate">{attachment.name}</span>
                                <span className="text-[9.5px] text-slate-400 shrink-0">({attachment.size})</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleRemoveAttachment}
                                className="p-1 rounded hover:bg-rose-500/20 text-rose-500 transition-colors cursor-pointer shrink-0"
                                title={chatT.attachment?.remove || 'Hapus berkas'}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    {/* ──── Voice Listening Live Banner ──── */}
                    {isListening && (
                        <div className="px-3 py-1.5 bg-rose-500/10 border-t border-rose-500/30 flex items-center justify-between text-xs shrink-0 animate-pulse text-rose-600 dark:text-rose-400">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                                <span className="font-bold text-[10.5px]">
                                    {chatT.voice?.listening || 'Mendengarkan suara Anda...'}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleToggleVoice}
                                className="px-2 py-0.5 rounded bg-rose-500 text-white text-[9.5px] font-bold hover:bg-rose-600 transition-colors cursor-pointer"
                            >
                                Selesai
                            </button>
                        </div>
                    )}

                    {/* ──── Footer: Full-Featured Input Bar ──── */}
                    <div className="p-2.5 bg-white dark:bg-[#121A2B] border-t border-zinc-200 dark:border-zinc-800 shrink-0 space-y-1.5">
                        
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            className="relative flex items-center gap-1.5"
                        >
                            {/* Paperclip File Upload Button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-[#0AB600]/15 text-zinc-500 dark:text-zinc-400 hover:text-[#0AB600] flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-zinc-200 dark:border-zinc-700"
                                title={chatT.attachment?.attach || 'Lampirkan Berkas atau Gambar'}
                            >
                                <Paperclip className="w-3.5 h-3.5" />
                            </button>

                            {/* Voice Input Mic Button */}
                            <button
                                type="button"
                                onClick={handleToggleVoice}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 border ${
                                    isListening
                                        ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                                        : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-[#0AB600]/15 text-zinc-500 dark:text-zinc-400 hover:text-[#0AB600] border-zinc-200 dark:border-zinc-700'
                                }`}
                                title={isListening ? (chatT.voice?.stop || 'Hentikan Rekaman') : (chatT.voice?.start || 'Bicara dengan Suara')}
                            >
                                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                            </button>

                            {/* Text Input */}
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={chatT.placeholder || (isId ? 'Ketik pertanyaan atau gunakan suara...' : 'Type message or use voice...')}
                                disabled={isLoading}
                                className="flex-1 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#0AB600] focus:border-[#0AB600] transition-colors disabled:opacity-50"
                            />
                            
                            {/* Send Button */}
                            <button
                                type="submit"
                                disabled={(!input.trim() && !attachment) || isLoading}
                                className="w-8 h-8 rounded-xl bg-[#0AB600] hover:bg-[#089600] disabled:opacity-40 disabled:hover:bg-[#0AB600] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
                                aria-label={chatT.send || 'Kirim'}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Send className="w-3.5 h-3.5" />
                                )}
                            </button>
                        </form>

                        <div className="flex items-center justify-between text-[9px] text-zinc-400 dark:text-zinc-500 px-0.5">
                            <span className="flex items-center gap-1">
                                <Shield className="w-2.5 h-2.5 text-[#0AB600]" />
                                <span>CoE STAS-RG Multimodal AI Hub</span>
                            </span>

                            <Link
                                href="/nara"
                                onClick={() => setIsOpen(false)}
                                className="text-[#0AB600] hover:underline font-bold flex items-center gap-0.5"
                            >
                                <span>Kenalan NARA</span>
                                <ExternalLink className="w-2 h-2" />
                            </Link>
                        </div>

                    </div>

                </div>
            )}

            {/* ═══════ 2. CIRCULAR TOGGLE BUTTON ═══════ */}
            <div className="relative inline-block">
                
                {/* Live Ping Badge */}
                <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 z-50 pointer-events-none">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#0AB600] border-2 border-white dark:border-[#0E1524]" />
                </span>

                {/* Main Button */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full border-[3.5px] border-[#0AB600] bg-[#0AB600] overflow-hidden flex items-center justify-center cursor-pointer focus:outline-none transition-transform duration-200 hover:scale-108 p-0 shadow-lg"
                    aria-label={chatT.title || "Tanya NARA (Asisten AI CoE STAS-RG)"}
                    title={isOpen ? "Tutup Chat" : (chatT.title || "Tanya NARA")}
                >
                    <img
                        src="/assets/img/icon/profile_cs.png"
                        alt="NARA"
                        className="w-full h-full object-cover object-center scale-[1.18]"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </button>
            </div>

        </aside>
    );
}
