import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Mail, Send, ArrowLeft, CheckCircle2, RefreshCw, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';
import { AppProvider, useApp } from '../../Context/AppContext';
import AuthLayout from '../../Components/AuthLayout';

function ForgotPasswordFormContent() {
    const { t, language } = useApp();
    const [step, setStep] = useState('email'); // 'email' | 'otp'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        let timer;
        if (step === 'otp' && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            setCanResend(true);
        }
        return () => clearInterval(timer);
    }, [step, countdown]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch('/forgot-password/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStep('otp');
                setCountdown(60);
                setCanResend(false);
                setSuccessMessage(data.message || 'Kode OTP telah dikirim ke email Anda.');
            } else {
                setErrorMessage(data.message || (data.errors && Object.values(data.errors)[0]?.[0]) || 'Gagal mengirim kode OTP.');
            }
        } catch (err) {
            setErrorMessage('Terjadi kesalahan jaringan. Pastikan Mailpit atau SMTP berjalan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch('/forgot-password/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.redirect_url) {
                    window.location.href = data.redirect_url;
                } else {
                    window.location.href = `/reset-password/${data.reset_token}?email=${encodeURIComponent(email)}`;
                }
            } else {
                setErrorMessage(data.message || (data.errors && Object.values(data.errors)[0]?.[0]) || 'Kode OTP tidak valid.');
            }
        } catch (err) {
            setErrorMessage('Gagal memverifikasi OTP. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch('/forgot-password/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (res.ok) {
                setCountdown(60);
                setCanResend(false);
                setSuccessMessage('Kode OTP baru telah dikirimkan.');
            } else {
                setErrorMessage(data.message || 'Gagal mengirim ulang OTP.');
            }
        } catch (err) {
            setErrorMessage('Gagal mengirim ulang OTP.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title={step === 'email' ? t.auth?.forgot?.title : t.auth?.forgot?.otpTitle}
            subtitle={step === 'email' ? t.auth?.forgot?.subtitle : t.auth?.forgot?.otpSubtitle}
            badge={null}
        >
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full p-7 sm:p-9 rounded-3xl bg-white dark:bg-[#18181B] border border-zinc-200/80 dark:border-zinc-800/80 transition-colors"
            >
                {/* Global Error Banner */}
                {errorMessage && (
                    <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Global Success Banner */}
                {successMessage && step === 'otp' && (
                    <div className="mb-5 p-3 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-xs font-semibold text-[#0AB600] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0AB600]" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {step === 'email' ? (
                    /* Step 1: Input Email */
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1.5">
                                {t.auth?.forgot?.emailLabel}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t.auth?.forgot?.emailPlaceholder}
                                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#0AB600] dark:focus:border-[#0AB600] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#0AB600] hover:bg-[#089600] disabled:opacity-70 text-white text-xs sm:text-sm font-semibold border border-[#0AB600] transition-all duration-200 cursor-pointer pt-2"
                        >
                            <Send className="w-4 h-4" />
                            <span>{isSubmitting ? t.auth?.forgot?.submitting : t.auth?.forgot?.submitButton}</span>
                        </button>

                        {/* Back to Login */}
                        <div className="pt-4 text-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>{t.auth?.forgot?.backToLogin}</span>
                            </Link>
                        </div>
                    </form>
                ) : (
                    /* Step 2: Input 6-Digit OTP */
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="text-center mb-2">
                            <span className="text-xs font-semibold text-[#0AB600] bg-[#0AB600]/10 py-1.5 px-3 rounded-lg inline-block font-mono">
                                {email}
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1.5 text-center">
                                {t.auth?.forgot?.otpLabel}
                            </label>
                            <div className="relative max-w-[240px] mx-auto">
                                <input
                                    type="text"
                                    maxLength={6}
                                    required
                                    autoFocus
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="------"
                                    className="w-full py-3 text-center text-2xl font-extrabold tracking-[8px] font-mono rounded-xl bg-zinc-50/70 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-[#0AB600] focus:outline-none focus:border-[#0AB600] dark:focus:border-[#0AB600] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Verify Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || otp.length !== 6}
                            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#0AB600] hover:bg-[#089600] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold border border-[#0AB600] transition-all duration-200 cursor-pointer pt-2"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            <span>{isSubmitting ? t.auth?.forgot?.otpVerifying : t.auth?.forgot?.otpVerifyButton}</span>
                        </button>

                        {/* Resend OTP & Change Email */}
                        <div className="pt-3 flex flex-col items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400">
                            <div>
                                <span>{t.auth?.forgot?.resendPrompt} </span>
                                {canResend ? (
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={isSubmitting}
                                        className="font-bold text-[#0AB600] hover:underline cursor-pointer inline-flex items-center gap-1"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        <span>{t.auth?.forgot?.resendButton}</span>
                                    </button>
                                ) : (
                                    <span className="text-zinc-400 dark:text-zinc-500">
                                        {language === 'id' ? `Kirim ulang dalam ${countdown} dtk` : `Resend in ${countdown}s`}
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep('email');
                                    setErrorMessage('');
                                }}
                                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 underline cursor-pointer"
                            >
                                {t.auth?.forgot?.changeEmail || 'Ganti Email'}
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </AuthLayout>
    );
}

export default function ForgotPassword() {
    return (
        <AppProvider>
            <ForgotPasswordFormContent />
        </AppProvider>
    );
}
