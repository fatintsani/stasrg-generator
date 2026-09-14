import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
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
                <clipPath id="uk-clip-page"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
                <clipPath id="uk-diag-page"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
                <g clipPath="url(#uk-clip-page)">
                    <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-diag-page)" stroke="#C8102E" strokeWidth="4"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
                </g>
            </svg>
        </span>
    );
}

export default function PageNavbar({ backText }) {
    const { theme, toggleTheme, language, toggleLanguage, t } = useApp();

    return (
        <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 transition-colors">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Left: Back Link & Brand */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 text-[#0AB600]" />
                        <span>{backText || (language === 'id' ? 'Kembali' : 'Back')}</span>
                    </Link>

                    <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 hidden sm:block" />

                    <Link href="/" className="hidden sm:flex items-center gap-2">
                        <img
                            src="/assets/img/stas.png"
                            alt="STAS RG Logo"
                            className="h-7 w-auto object-contain"
                            onError={(e) => {
                                e.currentTarget.src = '/assets/img/STAS RG.png';
                            }}
                        />
                        <span className="text-sm tracking-tight text-slate-900 dark:text-white">
                            <span className="font-extrabold">STAS RG</span>{' '}
                            <span className="font-normal text-zinc-600 dark:text-zinc-400">Projects</span>
                        </span>
                    </Link>
                </div>

                {/* Right: Transparent Language Flag & Theme Toggles */}
                <div className="flex items-center gap-2">
                    {/* Language Flag Only Toggle */}
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

                    {/* Dark/Light Mode Toggle */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label="Toggle theme mode"
                        title={theme === 'dark' ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
                        className="p-1.5 rounded-lg bg-transparent flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-[#0AB600] dark:hover:text-[#0AB600] transition-colors cursor-pointer"
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                        ) : (
                            <Moon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
