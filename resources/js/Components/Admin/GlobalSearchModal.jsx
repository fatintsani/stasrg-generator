import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { router } from '@inertiajs/react';
import {
    Search,
    X,
    FolderKanban,
    LayoutDashboard,
    FilePlus2,
    Users,
    Activity,
    Settings,
    ExternalLink,
    Clock,
    User,
    Shield,
    ChevronRight,
    Sparkles,
    ArrowRight,
    Loader2,
    Command
} from 'lucide-react';

export default function GlobalSearchModal({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({
        projects: [],
        navigation: [],
        users: [],
        logs: [],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const inputRef = useRef(null);
    const resultsContainerRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Flatten items for unified arrow key navigation
    const flatItems = [
        ...(results.projects || []).map((item) => ({ ...item, _type: 'project' })),
        ...(results.navigation || []).map((item) => ({ ...item, _type: 'nav' })),
        ...(results.users || []).map((item) => ({ ...item, _type: 'user' })),
        ...(results.logs || []).map((item) => ({ ...item, _type: 'log' })),
    ];

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            fetchResults('');
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    }, [isOpen]);

    // Live search query with debounce
    useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(() => {
            fetchResults(query);
        }, 150);

        return () => clearTimeout(timer);
    }, [query, isOpen]);

    const fetchResults = async (q) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setIsLoading(true);

        try {
            const res = await fetch(`/search/global?q=${encodeURIComponent(q)}`, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                signal: abortControllerRef.current.signal,
            });

            if (res.ok) {
                const data = await res.json();
                setResults(data.results || {});
                setSelectedIndex(0);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Search fetch error:', err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Keyboard navigation (Up, Down, Enter, Escape)
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
            return;
        }

        if (flatItems.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % flatItems.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const activeItem = flatItems[selectedIndex];
            if (activeItem) {
                handleSelectItem(activeItem);
            }
        }
    };

    const handleSelectItem = (item) => {
        onClose();
        if (item._type === 'project') {
            router.visit(item.show_url || item.edit_url);
        } else if (item._type === 'nav') {
            router.visit(item.url);
        } else if (item._type === 'user') {
            router.visit(item.url);
        } else if (item._type === 'log') {
            router.visit(item.url);
        }
    };

    const getNavIcon = (iconName) => {
        switch (iconName) {
            case 'LayoutDashboard':
                return LayoutDashboard;
            case 'FolderKanban':
                return FolderKanban;
            case 'FilePlus2':
                return FilePlus2;
            case 'Users':
                return Users;
            case 'Activity':
                return Activity;
            case 'Settings':
                return Settings;
            case 'ExternalLink':
                return ExternalLink;
            default:
                return Sparkles;
        }
    };

    if (!isOpen || typeof document === 'undefined') return null;

    let currentIndexCounter = 0;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
            {/* Backdrop click to dismiss */}
            <div className="fixed inset-0" onClick={onClose} />

            {/* Modal Card */}
            <div
                className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#101622] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
                onKeyDown={handleKeyDown}
            >
                {/* Search Input Bar */}
                <div className="relative flex items-center px-4 py-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#0AB600]/10 text-[#0AB600] mr-3 shrink-0">
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#0AB600]" />
                        ) : (
                            <Search className="w-4 h-4" />
                        )}
                    </div>

                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari proyek, navigasi menu, pengguna, atau log audit..."
                        className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
                    />

                    {query && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('');
                                inputRef.current?.focus();
                            }}
                            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer mr-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}

                    <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 px-2 py-1 rounded bg-zinc-200/70 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 shrink-0">
                        ESC
                    </kbd>
                </div>

                {/* Search Results Container */}
                <div
                    ref={resultsContainerRef}
                    className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-4 custom-scrollbar text-xs"
                >
                    {/* 1. Projects Section */}
                    {results.projects && results.projects.length > 0 && (
                        <div>
                            <div className="px-2 py-1 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                <span className="flex items-center gap-1.5">
                                    <FolderKanban className="w-3.5 h-3.5 text-[#0AB600]" />
                                    Proyek Riset & Deliverable ({results.projects.length})
                                </span>
                            </div>
                            <div className="mt-1 space-y-1">
                                {results.projects.map((project) => {
                                    const itemIndex = currentIndexCounter++;
                                    const isSelected = selectedIndex === itemIndex;
                                    return (
                                        <div
                                            key={`p-${project.id}`}
                                            onClick={() => handleSelectItem({ ...project, _type: 'project' })}
                                            className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'bg-[#0AB600]/10 border border-[#0AB600]/30 shadow-xs'
                                                    : 'hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 truncate min-w-0">
                                                {project.main_image ? (
                                                    <img
                                                        src={project.main_image}
                                                        alt={project.name}
                                                        className="w-9 h-9 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-lg bg-[#0AB600]/10 text-[#0AB600] font-extrabold flex items-center justify-center shrink-0">
                                                        {project.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex flex-col truncate">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900 dark:text-white truncate">
                                                            {project.name}
                                                        </span>
                                                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                                                            project.status === 'published'
                                                                ? 'bg-[#0AB600]/10 text-[#0AB600]'
                                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                                        }`}>
                                                            {project.status === 'published' ? 'Published' : 'Draft'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                                        {project.category} • {project.title}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0 ml-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onClose();
                                                        router.visit(project.edit_url);
                                                    }}
                                                    className="hidden sm:inline-flex px-2 py-1 rounded-lg text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 border border-zinc-200 dark:border-zinc-700"
                                                >
                                                    Edit Form
                                                </button>
                                                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#0AB600]' : 'text-zinc-400'}`} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 2. Navigation Items Section */}
                    {results.navigation && results.navigation.length > 0 && (
                        <div>
                            <div className="px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                <span>Navigasi Menu & Pintasan</span>
                            </div>
                            <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {results.navigation.map((nav, idx) => {
                                    const itemIndex = currentIndexCounter++;
                                    const isSelected = selectedIndex === itemIndex;
                                    const Icon = getNavIcon(nav.icon);
                                    return (
                                        <div
                                            key={`nav-${idx}`}
                                            onClick={() => handleSelectItem({ ...nav, _type: 'nav' })}
                                            className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'bg-[#0AB600]/10 border border-[#0AB600]/30 shadow-xs'
                                                    : 'hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 border border-transparent'
                                            }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                isSelected
                                                    ? 'bg-[#0AB600] text-white'
                                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                                            }`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col truncate">
                                                <span className="font-bold text-slate-900 dark:text-white truncate">
                                                    {nav.title}
                                                </span>
                                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                                                    {nav.subtitle}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 3. Users Section */}
                    {results.users && results.users.length > 0 && (
                        <div>
                            <div className="px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-purple-500" />
                                <span>Pengguna & Peneliti</span>
                            </div>
                            <div className="mt-1 space-y-1">
                                {results.users.map((user) => {
                                    const itemIndex = currentIndexCounter++;
                                    const isSelected = selectedIndex === itemIndex;
                                    return (
                                        <div
                                            key={`u-${user.id}`}
                                            onClick={() => handleSelectItem({ ...user, _type: 'user' })}
                                            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80'
                                                    : 'hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 truncate">
                                                {user.avatar_url ? (
                                                    <img
                                                        src={user.avatar_url}
                                                        alt={user.name}
                                                        className="w-7 h-7 rounded-full object-cover shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex flex-col truncate">
                                                    <span className="font-bold text-slate-900 dark:text-white truncate">
                                                        {user.name}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-400 truncate">
                                                        {user.email} • {user.role}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">
                                                {user.status}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 4. Logs Section */}
                    {results.logs && results.logs.length > 0 && (
                        <div>
                            <div className="px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Log Audit Terkait</span>
                            </div>
                            <div className="mt-1 space-y-1">
                                {results.logs.map((log) => {
                                    const itemIndex = currentIndexCounter++;
                                    const isSelected = selectedIndex === itemIndex;
                                    return (
                                        <div
                                            key={`l-${log.id}`}
                                            onClick={() => handleSelectItem({ ...log, _type: 'log' })}
                                            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80'
                                                    : 'hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 border border-transparent'
                                            }`}
                                        >
                                            <div className="flex flex-col truncate mr-2">
                                                <span className="font-medium text-slate-800 dark:text-zinc-200 truncate">
                                                    {log.description}
                                                </span>
                                                <span className="text-[10px] font-mono text-zinc-400 truncate">
                                                    {log.action} • {log.created_at}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 shrink-0">
                                                Lihat di Audit Log →
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Empty Search State */}
                    {query && flatItems.length === 0 && !isLoading && (
                        <div className="py-8 text-center flex flex-col items-center justify-center">
                            <img
                                src="/assets/img/icon/notfound.png"
                                alt="Tidak Ditemukan"
                                className="w-20 sm:w-24 h-auto object-contain mx-auto mb-2 drop-shadow-xs"
                            />
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                                Tidak ada hasil untuk "{query}"
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Coba kata kunci judul proyek, nama kategori, atau menu sistem lainnya.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Navigation Shortcuts Helper */}
                <div className="px-4 py-2.5 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/60 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-300 font-bold">
                                ↑
                            </kbd>
                            <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-300 font-bold">
                                ↓
                            </kbd>
                            navigasi
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-300 font-bold">
                                ↵
                            </kbd>
                            pilih
                        </span>
                    </div>

                    <span className="text-[10px] text-[#0AB600] font-semibold">
                        STAS-RG Global Spotlight
                    </span>
                </div>
            </div>
        </div>,
        document.body
    );
}
