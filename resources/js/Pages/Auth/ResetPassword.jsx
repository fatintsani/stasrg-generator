import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { AppProvider, useApp } from '../../Context/AppContext';
import AuthLayout from '../../Components/AuthLayout';

function ResetPasswordFormContent({ token, email }) {
    const { t, language } = useApp();
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        token: token || '',
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/reset-password', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title={t.auth?.reset?.title}
            subtitle={t.auth?.reset?.subtitle}
            badge={null}
        >
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full p-7 sm:p-9 rounded-3xl bg-white dark:bg-[#18181B] border border-zinc-200/80 dark:border-zinc-800/80 transition-colors"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* User Email Indicator */}
                    {data.email && (
                        <div className="text-center mb-2">
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/50 py-1.5 px-3 rounded-lg inline-block font-mono">
                                {data.email}
                            </span>
                        </div>
                    )}

                    {/* Email error (if session expired) */}
                    {errors.email && (
                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                            <span>{errors.email}</span>
                        </div>
                    )}

                    {/* New Password */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1.5">
                            {t.auth?.reset?.newPasswordLabel}
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder={t.auth?.reset?.newPasswordPlaceholder}
                                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/80 border ${
                                    errors.password ? 'border-rose-400 dark:border-rose-600' : 'border-zinc-200 dark:border-zinc-800'
                                } text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#0D5A34] dark:focus:border-emerald-500 transition-colors`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-zinc-400" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{errors.password}</span>
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1.5">
                            {t.auth?.reset?.confirmPasswordLabel}
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder={t.auth?.reset?.confirmPasswordPlaceholder}
                                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/80 border ${
                                    errors.password_confirmation ? 'border-rose-400 dark:border-rose-600' : 'border-zinc-200 dark:border-zinc-800'
                                } text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#0D5A34] dark:focus:border-emerald-500 transition-colors`}
                            />
                        </div>
                        {errors.password_confirmation && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{errors.password_confirmation}</span>
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#0D5A34] hover:bg-[#094226] disabled:opacity-70 text-white text-xs sm:text-sm font-semibold border border-[#0D5A34] transition-all duration-200 cursor-pointer pt-2"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{processing ? t.auth?.reset?.submitting : t.auth?.reset?.submitButton}</span>
                    </button>

                    <div className="pt-3 text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>{t.auth?.reset?.backToLogin}</span>
                        </Link>
                    </div>
                </form>
            </motion.div>
        </AuthLayout>
    );
}

export default function ResetPassword({ token, email }) {
    return (
        <AppProvider>
            <ResetPasswordFormContent token={token} email={email} />
        </AppProvider>
    );
}
