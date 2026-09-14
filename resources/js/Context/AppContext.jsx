import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations/translations';

const AppContext = createContext();

export function AppProvider({ children }) {
    // Theme State ('light' | 'dark')
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('stas_theme');
            if (savedTheme) return savedTheme;
        }
        return 'light'; // Default to pristine light theme
    });

    // Language State ('id' | 'en')
    const [language, setLanguage] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedLang = localStorage.getItem('stas_lang');
            if (savedLang) return savedLang;
        }
        return 'id'; // default Indonesian as requested
    });

    // Font State ('plus-jakarta-sans' | 'poppins' | 'inter' | 'outfit' | 'dm-sans' | 'montserrat' | 'roboto')
    const [appFont, setAppFontState] = useState(() => {
        if (typeof window !== 'undefined') {
            const domFont = document.documentElement.getAttribute('data-font');
            if (domFont) return domFont;
            const savedFont = localStorage.getItem('stas_font');
            if (savedFont) return savedFont;
        }
        return 'plus-jakarta-sans';
    });

    // Sync theme class with <html> element
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('stas_theme', theme);
    }, [theme]);

    // Sync font data-font attribute with <html> element
    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-font', appFont);
        localStorage.setItem('stas_font', appFont);
    }, [appFont]);

    // Persist language
    useEffect(() => {
        localStorage.setItem('stas_lang', language);
    }, [language]);

    const setAppFont = (font) => {
        setAppFontState(font);
        if (typeof window !== 'undefined') {
            document.documentElement.setAttribute('data-font', font);
            localStorage.setItem('stas_font', font);
        }
    };

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'id' ? 'en' : 'id'));
    };

    // Dictionary getter with recursive fallback to avoid any missing key blank screens
    const getMergedTranslations = (lang) => {
        const primary = translations[lang] || translations.id;
        const fallback = translations.id;

        const merge = (target, base) => {
            const result = { ...target };
            for (const key in base) {
                if (!(key in result) || result[key] === undefined) {
                    result[key] = base[key];
                } else if (
                    typeof base[key] === 'object' &&
                    base[key] !== null &&
                    !Array.isArray(base[key])
                ) {
                    result[key] = merge(result[key], base[key]);
                }
            }
            return result;
        };

        return lang === 'id' ? primary : merge(primary, fallback);
    };

    // Support Modal State
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const openSupportModal = () => setIsSupportOpen(true);
    const closeSupportModal = () => setIsSupportOpen(false);

    // Auto-open Support Modal if ?support=1 or #support is present in URL
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('support') === '1' || window.location.hash === '#support') {
                setIsSupportOpen(true);
            }
        }
    }, []);

    const t = getMergedTranslations(language);

    return (
        <AppContext.Provider
            value={{
                theme,
                setTheme,
                toggleTheme,
                language,
                setLanguage,
                toggleLanguage,
                appFont,
                setAppFont,
                t,
                isSupportOpen,
                setIsSupportOpen,
                openSupportModal,
                closeSupportModal,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}

export { useAlert, AlertProvider } from './AlertContext';
