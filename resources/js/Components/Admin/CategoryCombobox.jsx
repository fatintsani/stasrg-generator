import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus, X, Tag } from 'lucide-react';

export default function CategoryCombobox({
    value = '',
    onChange,
    categories = [],
    placeholder = 'Pilih atau ketik kategori riset...',
    error = null,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState(value || '');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Sync internal query when value prop changes externally
    useEffect(() => {
        setQuery(value || '');
    }, [value]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter categories based on user query
    const filteredCategories = categories.filter((cat) =>
        cat.toLowerCase().includes(query.toLowerCase().trim())
    );

    const isExactMatch = categories.some(
        (cat) => cat.toLowerCase() === query.toLowerCase().trim()
    );

    const handleSelect = (category) => {
        setQuery(category);
        onChange(category);
        setIsOpen(false);
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        onChange(val);
        setIsOpen(true);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        setQuery('');
        onChange('');
        inputRef.current?.focus();
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Input Container */}
            <div className="relative flex items-center">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className={`w-full pl-3 pr-16 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border rounded-xl text-slate-900 dark:text-white transition-all focus:outline-none ${
                        error
                            ? 'border-rose-500 focus:border-rose-600'
                            : 'border-zinc-200 dark:border-zinc-700 focus:border-[#0D5A34]'
                    }`}
                />

                <div className="absolute right-2 flex items-center gap-1">
                    {query && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                            title="Hapus pilihan"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                        title="Buka daftar kategori"
                    >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/90 dark:border-zinc-800 shadow-xl py-1 text-xs">
                    {/* Header Note */}
                    <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase text-zinc-400 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                        <span>Pilihan Kategori Riset</span>
                        <span>{filteredCategories.length} opsi</span>
                    </div>

                    {/* Custom Typed Category Option (if not already an exact match) */}
                    {query.trim() && !isExactMatch && (
                        <div
                            onClick={() => handleSelect(query.trim())}
                            className="px-3 py-2 text-[#0D5A34] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer flex items-center gap-2 font-semibold border-b border-zinc-100 dark:border-zinc-800/60"
                        >
                            <Plus className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                            <span className="truncate">
                                Gunakan kategori baru: <strong>"{query.trim()}"</strong>
                            </span>
                        </div>
                    )}

                    {/* Filtered Category Items */}
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat) => {
                            const isSelected = query.toLowerCase().trim() === cat.toLowerCase();

                            return (
                                <div
                                    key={cat}
                                    onClick={() => handleSelect(cat)}
                                    className={`px-3 py-2 cursor-pointer flex items-center justify-between transition-colors ${
                                        isSelected
                                            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 text-[#0D5A34] dark:text-emerald-300 font-bold'
                                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
                                        <span className="truncate">{cat}</span>
                                    </div>
                                    {isSelected && (
                                        <Check className="w-3.5 h-3.5 text-[#0D5A34] dark:text-emerald-400 shrink-0" />
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        !query.trim() && (
                            <div className="px-3 py-3 text-center text-zinc-400 text-xs">
                                Tidak ada kategori tersedia
                            </div>
                        )
                    )}
                </div>
            )}

            {error && <p className="text-rose-500 text-[11px] mt-1">{error}</p>}
        </div>
    );
}
