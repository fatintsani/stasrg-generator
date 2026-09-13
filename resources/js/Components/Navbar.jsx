import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Sun, Moon, LayoutDashboard, LogIn } from 'lucide-react';
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
    const user = pageProps?.auth?.user;
    const [activeSection, setActiveSection] = useState('overview');

    const navItems = [
        { name: t.nav?.overview || 'Overview', href: '#overview', id: 'overview' },
        { name: 'Showcase', href: '#projects-showcase', id: 'projects-showcase' },
        { name: t.nav?.about || 'Tentang', href: '#about', id: 'about' },
        { name: t.nav?.principles || 'Prinsip', href: '#principles', id: 'principles' },
        { name: t.nav?.howItWorks || 'Cara Kerja', href: '#how-it-works', id: 'how-it-works' },
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
            const sectionIds = ['overview', 'projects-showcase', 'about', 'principles', 'how-it-works'];
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

    return (
        <header className="sticky top-0 z-50 w-full bg-white/85 dark:bg-[#090D16]/85 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                
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
                        <span className="font-normal text-zinc-500 dark:text-zinc-400">Projects</span>
                    </span>
                </a>

                {/* Center: Navigation Menu */}
                <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                    {navItems.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                            <a
                                key={item.id}
                                href={item.href}
                                onClick={(e) => handleNavClick(e, item.id)}
                                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                                    isActive
                                        ? 'bg-white dark:bg-zinc-800 text-[#0D5A34] dark:text-emerald-400 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-800/50'
                                }`}
                            >
                                {item.name}
                            </a>
                        );
                    })}
                </nav>

                {/* Right: Controls (Language Toggle + Theme Toggle + Dashboard/Login Button) */}
                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                    {/* Language Toggle Button */}
                    <button
                        type="button"
                        onClick={toggleLanguage}
                        aria-label="Toggle language"
                        title={language === 'id' ? 'Bahasa Indonesia (Klik untuk beralih ke English)' : 'English (Click to switch to Indonesian)'}
                        className="p-1.5 rounded-lg bg-transparent flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
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
                        className="p-1.5 rounded-lg bg-transparent flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-[#0D5A34] dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                        ) : (
                            <Moon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        )}
                    </button>

                    {/* Auth Action: Dashboard (if logged in) or Login (if guest) */}
                    {user ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-1.5 bg-[#0D5A34] hover:bg-[#094226] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border border-[#0D5A34] transition-all duration-150 cursor-pointer shadow-xs shadow-emerald-950/10"
                        >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            <span>Dashboard</span>
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 bg-[#0D5A34] hover:bg-[#094226] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border border-[#0D5A34] transition-all duration-150 cursor-pointer shadow-xs shadow-emerald-950/10"
                        >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>{t.nav?.login || 'Login'}</span>
                        </Link>
                    )}
                </div>

            </div>
        </header>
    );
}
