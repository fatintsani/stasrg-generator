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

    // Persist language
    useEffect(() => {
        localStorage.setItem('stas_lang', language);
    }, [language]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'id' ? 'en' : 'id'));
    };

    // Dictionary getter
    const t = translations[language] || translations.id;

    return (
        <AppContext.Provider
            value={{
                theme,
                setTheme,
                toggleTheme,
                language,
                setLanguage,
                toggleLanguage,
                t,
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
