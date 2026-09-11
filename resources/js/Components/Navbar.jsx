import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Sun, Moon, LogOut, User as UserIcon, Fingerprint, CheckCircle2 } from 'lucide-react';
import { useApp } from '../Context/AppContext';

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
                <clipPath id="uk-clip-nav"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
                <clipPath id="uk-diag-nav"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
                <g clipPath="url(#uk-clip-nav)">
                    <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-diag-nav)" stroke="#C8102E" strokeWidth="4"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
                </g>
            </svg>
        </span>
    );
}

export default function Navbar() {
    const { theme, toggleTheme, language, toggleLanguage, t } = useApp();
    const { props: pageProps } = usePage() || { props: {} };
    const [activeSection, setActiveSection] = useState('overview');

    const navItems = [
        { name: t.nav.overview, href: '#overview', id: 'overview' },
        { name: t.nav.about, href: '#about', id: 'about' },
        { name: t.nav.principles, href: '#principles', id: 'principles' },
        { name: t.nav.howItWorks, href: '#how-it-works', id: 'how-it-works' },
    ];

    const handleNavClick = (e, targetId) => {
        const element = document.getElementById(targetId);
        if (element) {
            e.preventDefault();
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection(targetId);
            window.history.pushState(null, '', `#${targetId}`);
        } else {
            window.location.href = `/#${targetId}`;
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const sectionIds = ['overview', 'about', 'principles', 'how-it-works'];
            const scrollPosition = window.scrollY + 100;

            for (let i = sectionIds.length - 1; i >= 0; i--) {
                const section = document.getElementById(sectionIds[i]);
                if (section) {
                    const top = section.offsetTop;
                    if (scrollPosition >= top) {
                        setActiveSection(sectionIds[i]);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [isEnrollingPasskey, setIsEnrollingPasskey] = useState(false);
    const [passkeyEnrolledSuccess, setPasskeyEnrolledSuccess] = useState(false);

    const handleEnrollPasskey = async () => {
        if (!window.PublicKeyCredential || !navigator.credentials) {
            alert(language === 'id' ? 'Browser atau perangkat Anda tidak mendukung WebAuthn / Passkey.' : 'Your browser or device does not support WebAuthn / Passkey.');
            return;
        }

        setIsEnrollingPasskey(true);
        try {
            // 1. Fetch registration options from server
            const optionsRes = await fetch('/auth/passkey/register-options', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!optionsRes.ok) {
                throw new Error('Gagal memuat opsi registrasi passkey.');
            }

            const options = await optionsRes.json();

            // 2. Format challenge and user id
            const rawChallenge = atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/'));
            const challengeBytes = new Uint8Array(rawChallenge.length);
            for (let i = 0; i < rawChallenge.length; i++) {
                challengeBytes[i] = rawChallenge.charCodeAt(i);
            }

            const rawUserId = atob(options.user.id.replace(/-/g, '+').replace(/_/g, '/'));
            const userIdBytes = new Uint8Array(rawUserId.length);
            for (let i = 0; i < rawUserId.length; i++) {
                userIdBytes[i] = rawUserId.charCodeAt(i);
            }

            // 3. Trigger hardware authenticator creation (Touch ID / Windows Hello)
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

            if (!credential) {
                throw new Error('Tidak ada respon dari sensor.');
            }

            // 4. Encode rawId
            const rawIdBytes = new Uint8Array(credential.rawId);
            let binary = '';
            for (let i = 0; i < rawIdBytes.byteLength; i++) {
                binary += String.fromCharCode(rawIdBytes[i]);
            }
            const rawId = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

            // 5. Save credential to backend database
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
                setPasskeyEnrolledSuccess(true);
                setTimeout(() => setPasskeyEnrolledSuccess(false), 4000);
            } else {
                const errData = await saveRes.json();
                alert(errData.message || 'Gagal mendaftarkan Passkey.');
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
        <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#090D16]/80 backdrop-blur-md border-b border-zinc-200/70 dark:border-zinc-800/70 transition-colors">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 relative flex items-center justify-between">
                {/* Left: Brand Logo & Title */}
                <a 
                    href="#overview" 
                    onClick={(e) => handleNavClick(e, 'overview')}
                    className="flex items-center gap-2.5 group shrink-0"
                >
                    <img 
                        src="/assets/img/stas.png" 
                        alt="STAS RG Logo" 
                        className="h-8 w-auto object-contain transition-transform group-hover:scale-105" 
                        onError={(e) => {
                            e.currentTarget.src = '/assets/img/STAS RG.png';
                        }}
                    />
                    <span className="text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                        <span className="font-extrabold">STAS RG</span>{' '}
                        <span className="font-normal text-zinc-500 dark:text-zinc-400">Generator</span>
                    </span>
                </a>

                {/* Center: Navigation Menu with Active Indicator */}
                <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 p-1 rounded-full bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                    {navItems.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                            <a
                                key={item.id}
                                href={item.href}
                                onClick={(e) => handleNavClick(e, item.id)}
                                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                                    isActive
                                        ? 'bg-white dark:bg-zinc-800 text-[#0D5A34] dark:text-emerald-400 border border-zinc-200/80 dark:border-zinc-700/80'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-800/50'
                                }`}
                            >
                                {item.name}
                            </a>
                        );
                    })}
                </nav>

                {/* Right: Controls (Language Flag + Theme + Login/Auth) */}
                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                    {/* Language Flag Only Toggle Button */}
                    <button
                        type="button"
                        onClick={toggleLanguage}
                        aria-label="Toggle language"
                        title={language === 'id' ? 'Bahasa Indonesia (Klik untuk ganti ke English)' : 'English (Click to switch to Indonesian)'}
                        className="p-1.5 rounded-lg bg-transparent flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        {language === 'id' ? (
                            <IndonesiaFlag className="w-5 h-3.5" />
                        ) : (
                            <EnglishFlag className="w-5 h-3.5" />
                        )}
                    </button>

                    {/* Dark/Light Mode Toggle Button */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label="Toggle theme mode"
                        title={theme === 'dark' ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
                        className="p-1.5 rounded-lg bg-transparent flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-[#0D5A34] dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                        ) : (
                            <Moon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        )}
                    </button>

                    {/* Auth State Button */}
                    {pageProps?.auth?.user ? (
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            {/* Enroll Device Passkey Button */}
                            <button
                                type="button"
                                onClick={handleEnrollPasskey}
                                disabled={isEnrollingPasskey}
                                title={language === 'id' ? 'Daftarkan Touch ID / Passkey Perangkat Ini' : 'Enroll Touch ID / Passkey on This Device'}
                                className={`hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                                    passkeyEnrolledSuccess
                                        ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                                        : 'bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100/60 text-[#0D5A34] dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/80'
                                }`}
                            >
                                {passkeyEnrolledSuccess ? (
                                    <>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>{language === 'id' ? 'Passkey Aktif!' : 'Passkey Active!'}</span>
                                    </>
                                ) : (
                                    <>
                                        <Fingerprint className="w-3.5 h-3.5" />
                                        <span>{isEnrollingPasskey ? (language === 'id' ? 'Memindai...' : 'Scanning...') : (language === 'id' ? '+ Passkey' : '+ Passkey')}</span>
                                    </>
                                )}
                            </button>

                            {/* Dashboard Link */}
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-1.5 bg-[#0D5A34] hover:bg-[#094226] text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-[#0D5A34] transition-all cursor-pointer"
                            >
                                <span>Dashboard</span>
                            </Link>

                            {/* User Name Badge */}
                            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100/80 dark:bg-zinc-850/80 border border-zinc-200/80 dark:border-zinc-750 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                <UserIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="max-w-[110px] truncate">{pageProps.auth.user.name}</span>
                            </div>

                            {/* Logout Button */}
                            <Link
                                method="post"
                                href="/logout"
                                as="button"
                                title={language === 'id' ? 'Keluar / Logout' : 'Logout'}
                                className="inline-flex items-center justify-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-zinc-200/80 dark:border-zinc-700/80 hover:border-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{language === 'id' ? 'Keluar' : 'Logout'}</span>
                            </Link>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center gap-2 bg-[#0D5A34] hover:bg-[#094226] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border border-[#0D5A34] transition-all duration-200 cursor-pointer"
                        >
                            <span>{t.nav.login}</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
