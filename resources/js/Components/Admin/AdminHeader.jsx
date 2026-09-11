import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Menu,
    Search,
    Plus,
    Sun,
    Moon,
    Fingerprint,
    CheckCircle2,
    LogOut,
    User,
    Shield,
    ExternalLink,
    ChevronDown,
} from 'lucide-react';
import { useApp } from '../../Context/AppContext';

function IndonesiaFlag({ className = "w-5 h-3.5" }) {
    return (
        <span className={`inline-flex items-center justify-center overflow-hidden rounded-[2px] border border-zinc-300 dark:border-zinc-700 shrink-0 ${className}`}>
            <svg viewBox="0 0 600 400" className="w-full h-full block">
                <rect width="600" height="200" fill="#E11D48" />
                <rect y="200" width="600" height="200" fill="#FFFFFF" />
            </svg>
        </span>
    );
}

function EnglishFlag({ className = "w-5 h-3.5" }) {
    return (
        <span className={`inline-flex items-center justify-center overflow-hidden rounded-[2px] border border-zinc-300 dark:border-zinc-700 shrink-0 ${className}`}>
            <svg viewBox="0 0 60 30" className="w-full h-full block">
                <clipPath id="uk-clip-admin"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
                <clipPath id="uk-diag-admin"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
                <g clipPath="url(#uk-clip-admin)">
                    <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-diag-admin)" stroke="#C8102E" strokeWidth="4"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
                </g>
            </svg>
        </span>
    );
}

export default function AdminHeader({
    onToggleMobileSidebar,
    onOpenNewProjectModal,
}) {
    const { theme, toggleTheme, language, toggleLanguage, t } = useApp();
    const { props: pageProps } = usePage() || { props: {} };
    const user = pageProps?.auth?.user || { name: 'Administrator', email: 'admin@stasrg.internal', role: 'admin' };

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [isEnrollingPasskey, setIsEnrollingPasskey] = useState(false);
    const [passkeySuccess, setPasskeySuccess] = useState(false);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEnrollPasskey = async () => {
        if (!window.PublicKeyCredential || !navigator.credentials) {
            alert(language === 'id' ? 'Browser atau perangkat tidak mendukung WebAuthn / Passkey.' : 'Browser or device does not support WebAuthn / Passkey.');
            return;
        }

        setIsEnrollingPasskey(true);
        try {
            const optionsRes = await fetch('/auth/passkey/register-options', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!optionsRes.ok) throw new Error('Gagal memuat opsi registrasi.');
            const options = await optionsRes.json();

            const rawChallenge = atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/'));
            const challengeBytes = new Uint8Array(rawChallenge.length);
            for (let i = 0; i < rawChallenge.length; i++) challengeBytes[i] = rawChallenge.charCodeAt(i);

            const rawUserId = atob(options.user.id.replace(/-/g, '+').replace(/_/g, '/'));
            const userIdBytes = new Uint8Array(rawUserId.length);
            for (let i = 0; i < rawUserId.length; i++) userIdBytes[i] = rawUserId.charCodeAt(i);

            const credential = await navigator.credentials.create({
                publicKey: {
                    ...options,
                    challenge: challengeBytes,
                    user: {
                        ...options.user,
                        id: userIdBytes,
                    },
                },
            });

            if (!credential) throw new Error('Tidak ada respon.');

            const rawIdBytes = new Uint8Array(credential.rawId);
            let binary = '';
            for (let i = 0; i < rawIdBytes.byteLength; i++) binary += String.fromCharCode(rawIdBytes[i]);
            const rawId = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const saveRes = await fetch('/auth/passkey/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    credential_id: rawId,
                    device_name: 'Device Touch ID / Passkey',
                }),
            });

            if (saveRes.ok) {
                setPasskeySuccess(true);
                setTimeout(() => setPasskeySuccess(false), 4000);
            }
        } catch (err) {
            if (err.name !== 'NotAllowedError') {
                alert(err.message || 'Gagal mendaftarkan Passkey.');
            }
        } finally {
            setIsEnrollingPasskey(false);
        }
    };

    return (
        <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-[#090D16]/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
            <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
                {/* Left: Mobile Toggle & Global Search Bar */}
                <div className="flex items-center gap-3 flex-1 max-w-lg">
                    {/* Mobile Sidebar Trigger */}
                    <button
                        type="button"
                        onClick={onToggleMobileSidebar}
                        className="p-2 rounded-xl text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden transition-colors cursor-pointer"
                        aria-label="Open sidebar"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Global Search Input */}
                    <div className="relative w-full hidden sm:block">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder={t.admin?.header?.searchPlaceholder || 'Cari proyek atau template...'}
                            className="w-full pl-10 pr-16 py-2 rounded-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 text-xs text-slate-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#0D5A34] dark:focus:border-emerald-500 transition-colors"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <kbd className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                ⌘K
                            </kbd>
                        </div>
                    </div>
                </div>

                {/* Right: Quick Action & Controls */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                    {/* New Project Quick Button */}
                    <button
                        type="button"
                        onClick={onOpenNewProjectModal}
                        className="hidden lg:inline-flex items-center gap-1.5 py-2 px-3.5 rounded-full bg-[#0D5A34] hover:bg-[#094226] text-white text-xs font-semibold border border-[#0D5A34] transition-all duration-150 cursor-pointer shadow-none"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{t.admin?.header?.newProject || 'Input Proyek'}</span>
                    </button>

                    {/* Passkey Status / Enroll Button */}
                    <button
                        type="button"
                        onClick={handleEnrollPasskey}
                        disabled={isEnrollingPasskey}
                        title={language === 'id' ? 'Daftarkan Touch ID / Passkey' : 'Enroll Touch ID / Passkey'}
                        className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                            passkeySuccess || user.is_biometric_enabled
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                                : 'bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-800'
                        }`}
                    >
                        {passkeySuccess || user.is_biometric_enabled ? (
                            <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="hidden md:inline">{t.admin?.header?.passkeyActive || 'Passkey Aktif'}</span>
                            </>
                        ) : (
                            <>
                                <Fingerprint className="w-3.5 h-3.5 text-zinc-500" />
                                <span className="hidden md:inline">{isEnrollingPasskey ? 'Memindai...' : (t.admin?.header?.enrollPasskey || '+ Passkey')}</span>
                            </>
                        )}
                    </button>

                    {/* Language Toggle */}
                    <button
                        type="button"
                        onClick={toggleLanguage}
                        aria-label="Toggle language"
                        title={language === 'id' ? 'Bahasa Indonesia (Klik untuk Switch ke English)' : 'English (Click to switch to Indonesian)'}
                        className="p-2 rounded-xl bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        {language === 'id' ? <IndonesiaFlag className="w-5 h-3.5" /> : <EnglishFlag className="w-5 h-3.5" />}
                    </button>

                    {/* Theme Toggle */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label="Toggle theme mode"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                    </button>

                    {/* User Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 transition-all cursor-pointer"
                        >
                            <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-[#0D5A34] dark:text-emerald-300 font-bold text-xs">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-zinc-200 max-w-[90px] truncate">
                                {user.name}
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                        </button>

                        {/* Dropdown Menu Card */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-2 text-slate-900 dark:text-white z-50 animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-3 py-2 border-b border-zinc-200/80 dark:border-zinc-800 mb-1">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                        {user.email}
                                    </p>
                                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                                        <Shield className="w-3 h-3 text-emerald-600" />
                                        <span>{t.admin?.header?.roleBadge || 'Administrator'}</span>
                                    </div>
                                </div>

                                <Link
                                    href="/"
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4 text-zinc-400" />
                                    <span>{t.admin?.header?.viewLanding || 'Halaman Utama'}</span>
                                </Link>

                                <Link
                                    method="post"
                                    href="/logout"
                                    as="button"
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer mt-1"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>{t.admin?.header?.logout || 'Keluar Akun'}</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
