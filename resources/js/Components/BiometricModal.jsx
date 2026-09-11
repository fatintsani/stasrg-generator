import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, ScanFace, ShieldCheck, CheckCircle2, AlertCircle, X, RefreshCw, KeyRound } from 'lucide-react';
import { useApp } from '../Context/AppContext';

// Helper: Convert Base64 / Base64URL string to Uint8Array
function base64ToUint8Array(base64) {
    const raw = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    const array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
        array[i] = raw.charCodeAt(i);
    }
    return array;
}

// Helper: Convert ArrayBuffer to Base64URL string
function bufferToBase64Url(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export default function BiometricModal({ isOpen, onClose, onSuccess, userEmail = '' }) {
    const { t, language } = useApp();
    const [scanState, setScanState] = useState('idle'); // 'idle' | 'scanning' | 'success' | 'error'
    const [errorMessage, setErrorMessage] = useState('');
    const [hasWebAuthn, setHasWebAuthn] = useState(false);

    // Check device WebAuthn / Passkey support
    useEffect(() => {
        if (typeof window !== 'undefined' && window.PublicKeyCredential) {
            setHasWebAuthn(true);
        }
    }, []);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setScanState('idle');
            setErrorMessage('');
            const timer = setTimeout(() => {
                startBiometricScan();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const startBiometricScan = async () => {
        setScanState('scanning');
        setErrorMessage('');

        try {
            // 1. Fetch challenge and allowed credentials from Laravel backend
            const query = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
            const challengeRes = await fetch(`/auth/passkey/challenge${query}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!challengeRes.ok) {
                throw new Error('Gagal mendapatkan sesi tantangan otentikasi dari server.');
            }

            const challengeData = await challengeRes.json();

            // 2. Prepare WebAuthn publicKey options
            if (!window.PublicKeyCredential || !navigator.credentials) {
                throw new Error('Browser atau perangkat ini tidak mendukung WebAuthn / Passkey.');
            }

            const challengeBytes = base64ToUint8Array(challengeData.challenge);
            const allowCredentials = (challengeData.allowCredentials || []).map((cred) => ({
                type: 'public-key',
                id: base64ToUint8Array(cred.id),
                transports: cred.transports || ['internal', 'usb'],
            }));

            const publicKeyOptions = {
                challenge: challengeBytes,
                rpId: challengeData.rpId || window.location.hostname,
                userVerification: challengeData.userVerification || 'preferred',
                timeout: challengeData.timeout || 60000,
            };

            if (allowCredentials.length > 0) {
                publicKeyOptions.allowCredentials = allowCredentials;
            }

            // 3. Trigger native OS / device biometric prompt (Windows Hello / Touch ID)
            let credentialAssertion = null;
            try {
                credentialAssertion = await navigator.credentials.get({
                    publicKey: publicKeyOptions,
                });
            } catch (authErr) {
                if (authErr.name === 'NotAllowedError') {
                    throw new Error(language === 'id' ? 'Pemindaian biometrik dibatalkan atau tidak dikenali oleh sensor.' : 'Biometric scan cancelled or not recognized.');
                } else if (authErr.name === 'InvalidStateError') {
                    throw new Error(language === 'id' ? 'Kredensial Passkey belum terdaftar pada perangkat ini.' : 'Passkey not registered on this device.');
                }
                throw authErr;
            }

            if (!credentialAssertion) {
                throw new Error('Tidak ada respon dari sensor biometrik.');
            }

            // 4. Encode assertion result
            const rawId = bufferToBase64Url(credentialAssertion.rawId);
            const authenticatorData = bufferToBase64Url(credentialAssertion.response.authenticatorData);
            const clientDataJSON = bufferToBase64Url(credentialAssertion.response.clientDataJSON);
            const signature = bufferToBase64Url(credentialAssertion.response.signature);

            // 5. Verify against Laravel backend database
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const verifyRes = await fetch('/auth/passkey/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    credential_id: rawId,
                    authenticator_data: authenticatorData,
                    client_data_json: clientDataJSON,
                    signature: signature,
                }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
                setScanState('success');
                setTimeout(() => {
                    if (onSuccess) {
                        onSuccess(verifyData);
                    } else if (verifyData.redirect_url) {
                        window.location.href = verifyData.redirect_url;
                    }
                }, 1000);
            } else {
                setScanState('error');
                setErrorMessage(verifyData.message || (verifyData.errors && Object.values(verifyData.errors)[0]?.[0]) || 'Passkey tidak cocok dengan akun terdaftar.');
            }
        } catch (err) {
            setScanState('error');
            setErrorMessage(err.message || (t.auth?.biometric?.statusError || 'Autentikasi biometrik tidak berhasil.'));
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 10 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 text-slate-900 dark:text-white overflow-hidden"
                >
                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold tracking-wide mb-3">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{hasWebAuthn ? (t.auth?.biometric?.supportedBadge || 'FIDO2 / WebAuthn') : 'WebAuthn'}</span>
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {t.auth?.biometric?.modalTitle || 'Autentikasi Passkey & Biometrik'}
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-xs mx-auto">
                            {t.auth?.biometric?.modalDesc || 'Gunakan sensor Touch ID, Face ID, atau Windows Hello pada perangkat Anda.'}
                        </p>
                    </div>

                    {/* Biometric Interactive Scanner Graphic */}
                    <div className="relative my-6 flex flex-col items-center justify-center">
                        <div className="relative w-28 h-28 flex items-center justify-center">
                            {/* Outer animated rings */}
                            {scanState === 'scanning' && (
                                <>
                                    <motion.div
                                        animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                        className="absolute inset-0 rounded-full border border-emerald-400/40 dark:border-emerald-500/30"
                                    />
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.1, 0.8] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                                        className="absolute inset-2 rounded-full border border-emerald-500/50 dark:border-emerald-400/40"
                                    />
                                </>
                            )}

                            {/* Center circle */}
                            <div
                                className={`w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                                    scanState === 'success'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                        : scanState === 'error'
                                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-500 text-rose-600 dark:text-rose-400'
                                        : scanState === 'scanning'
                                        ? 'bg-emerald-50/50 dark:bg-zinc-900 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                                }`}
                            >
                                {scanState === 'success' ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    >
                                        <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                                    </motion.div>
                                ) : scanState === 'error' ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    >
                                        <AlertCircle className="w-12 h-12 text-rose-600 dark:text-rose-400" />
                                    </motion.div>
                                ) : (
                                    <div className="relative flex items-center justify-center">
                                        <Fingerprint className={`w-12 h-12 transition-colors ${scanState === 'scanning' ? 'text-[#0D5A34] dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
                                        {/* Scanner beam line */}
                                        {scanState === 'scanning' && (
                                            <motion.div
                                                animate={{ y: [-20, 20, -20] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                                className="absolute w-14 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent pointer-events-none"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status / Error Label */}
                        <div className="mt-4 text-center px-2">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                                {scanState === 'scanning' && (t.auth?.biometric?.statusScanning || 'Menunggu verifikasi sensor perangkat...')}
                                {scanState === 'idle' && (t.auth?.biometric?.statusIdle || 'Siap memindai sensor')}
                                {scanState === 'success' && (t.auth?.biometric?.statusSuccess || 'Passkey Terverifikasi! Mengalihkan...')}
                                {scanState === 'error' && 'Verifikasi Tidak Berhasil'}
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                                {scanState === 'error'
                                    ? errorMessage
                                    : scanState === 'scanning'
                                    ? (t.auth?.biometric?.promptAction || 'Sentuh sensor sidik jari atau hadapkan wajah ke kamera.')
                                    : 'Perangkat akan memverifikasi kredensial hardware lokal'}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2.5">
                        {scanState === 'error' ? (
                            <button
                                type="button"
                                onClick={startBiometricScan}
                                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#0D5A34] hover:bg-[#094226] text-white text-xs sm:text-sm font-semibold border border-[#0D5A34] transition-colors cursor-pointer"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>{t.auth?.biometric?.retry || 'Pindai Ulang'}</span>
                            </button>
                        ) : scanState === 'idle' ? (
                            <button
                                type="button"
                                onClick={startBiometricScan}
                                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#0D5A34] hover:bg-[#094226] text-white text-xs sm:text-sm font-semibold border border-[#0D5A34] transition-colors cursor-pointer"
                            >
                                <Fingerprint className="w-4 h-4" />
                                <span>{t.auth?.biometric?.triggerScan || 'Mulai Pemindaian'}</span>
                            </button>
                        ) : null}

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-medium border border-zinc-200/80 dark:border-zinc-700/80 transition-colors cursor-pointer"
                        >
                            <KeyRound className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{t.auth?.biometric?.cancel || 'Gunakan Kata Sandi'}</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
