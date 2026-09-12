import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    HelpCircle,
    Trash2,
    X,
} from 'lucide-react';

export default function AlertModal({
    isOpen,
    onClose,
    type = 'info', // 'success' | 'error' | 'warning' | 'info' | 'confirm'
    title = '',
    message = '',
    confirmText,
    cancelText,
    variant = 'primary', // 'danger' | 'warning' | 'primary' (primarily for confirm)
    onConfirm,
    onCancel,
    showCloseButton = true,
    closeOnBackdrop = true,
}) {
    const confirmButtonRef = useRef(null);

    // Auto-focus the confirm button when modal opens
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                confirmButtonRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                if (type === 'confirm' && onCancel) {
                    onCancel();
                } else if (onClose) {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, type, onCancel, onClose]);

    if (!isOpen) return null;

    const isConfirm = type === 'confirm';

    // Default button labels
    const resolvedConfirmText = confirmText || (isConfirm ? 'Konfirmasi' : 'Mengerti');
    const resolvedCancelText = cancelText || 'Batal';

    // Determine icon & styling based on type and variant
    const getModalConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
                    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/80',
                    confirmBtnClass:
                        'bg-gradient-to-r from-[#0D5A34] to-[#147a47] hover:from-[#147a47] hover:to-[#0D5A34] text-white shadow-lg shadow-[#0D5A34]/20 focus:ring-emerald-500',
                };
            case 'error':
                return {
                    icon: <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
                    iconBg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/80',
                    confirmBtnClass:
                        'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg shadow-rose-600/20 focus:ring-rose-500',
                };
            case 'warning':
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
                    iconBg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/80',
                    confirmBtnClass:
                        'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-lg shadow-amber-500/20 focus:ring-amber-500',
                };
            case 'confirm':
                if (variant === 'danger') {
                    return {
                        icon: <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
                        iconBg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/80',
                        confirmBtnClass:
                            'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg shadow-rose-600/25 focus:ring-rose-500',
                    };
                }
                if (variant === 'warning') {
                    return {
                        icon: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
                        iconBg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/80',
                        confirmBtnClass:
                            'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-lg shadow-amber-500/25 focus:ring-amber-500',
                    };
                }
                return {
                    icon: <HelpCircle className="w-6 h-6 text-[#0D5A34] dark:text-emerald-400" />,
                    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/80',
                    confirmBtnClass:
                        'bg-gradient-to-r from-[#0D5A34] to-[#147a47] hover:from-[#147a47] hover:to-[#0D5A34] text-white shadow-lg shadow-[#0D5A34]/25 focus:ring-emerald-500',
                };
            case 'info':
            default:
                return {
                    icon: <Info className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
                    iconBg: 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800/80',
                    confirmBtnClass:
                        'bg-gradient-to-r from-[#0D5A34] to-[#147a47] hover:from-[#147a47] hover:to-[#0D5A34] text-white shadow-lg shadow-[#0D5A34]/20 focus:ring-emerald-500',
                };
        }
    };

    const config = getModalConfig();

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && closeOnBackdrop) {
            if (isConfirm && onCancel) {
                onCancel();
            } else if (onClose) {
                onClose();
            }
        }
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        if (onClose) onClose();
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        if (onClose) onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
                    onClick={handleBackdropClick}
                    role="dialog"
                    aria-modal="true"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm"
                    />

                    {/* Modal Window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 8 }}
                        transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
                        className="relative w-full max-w-md bg-white dark:bg-[#121824] rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xl shadow-slate-900/20 dark:shadow-black/60 p-6 sm:p-7 overflow-hidden z-10"
                    >
                        {/* Close button */}
                        {showCloseButton && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
                                aria-label="Tutup"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}

                        <div className="flex flex-col items-start text-left">
                            {/* Icon Header */}
                            <div className={`p-3 rounded-2xl border ${config.iconBg} mb-4`}>
                                {config.icon}
                            </div>

                            {/* Title & Message */}
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                                {title}
                            </h3>

                            {message && (
                                <div className="mt-2 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                                    {typeof message === 'string' ? (
                                        <p>{message}</p>
                                    ) : (
                                        message
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-6 w-full flex items-center gap-3">
                                {isConfirm && (
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700/60 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
                                    >
                                        {resolvedCancelText}
                                    </button>
                                )}

                                <button
                                    ref={confirmButtonRef}
                                    type="button"
                                    onClick={handleConfirm}
                                    className={`${
                                        isConfirm ? 'flex-1' : 'w-full'
                                    } py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
                                        config.confirmBtnClass
                                    }`}
                                >
                                    {resolvedConfirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
