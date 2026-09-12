import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    Link2,
    Unlink,
    RemoveFormatting,
    Undo2,
    Redo2,
    Palette,
    Highlighter,
    Type,
    ChevronDown,
    X,
    Check
} from 'lucide-react';

const TEXT_COLORS = [
    { label: 'Default', value: '#1f2937' },
    { label: 'Dark Green (STAS)', value: '#0D5A34' },
    { label: 'Emerald', value: '#059669' },
    { label: 'Blue', value: '#2563eb' },
    { label: 'Indigo', value: '#4f46e5' },
    { label: 'Purple', value: '#7c3aed' },
    { label: 'Rose / Red', value: '#e11d48' },
    { label: 'Amber / Orange', value: '#d97706' },
    { label: 'Muted Gray', value: '#6b7280' },
];

const HIGHLIGHT_COLORS = [
    { label: 'None', value: 'transparent' },
    { label: 'Soft Yellow', value: '#fef08a' },
    { label: 'Soft Green', value: '#bbf7d0' },
    { label: 'Soft Blue', value: '#bfdbfe' },
    { label: 'Soft Purple', value: '#e9d5ff' },
    { label: 'Soft Rose', value: '#fecdd3' },
    { label: 'Soft Orange', value: '#fed7aa' },
];

const FONT_SIZES = [
    { label: 'Kecil (Small)', value: '0.85em', cmdVal: '2' },
    { label: 'Normal (Body)', value: '1em', cmdVal: '3' },
    { label: 'Sedang (Medium)', value: '1.15em', cmdVal: '4' },
    { label: 'Besar (Heading)', value: '1.3em', cmdVal: '5' },
];

export default function RichTextEditor({
    value = '',
    onChange,
    placeholder = 'Ketik atau format konten di sini...',
    minHeight = '100px',
    className = '',
    disabled = false,
}) {
    const editorRef = useRef(null);
    const [activeFormats, setActiveFormats] = useState({});
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [showFontSizePicker, setShowFontSizePicker] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const savedSelectionRef = useRef(null);

    // Initial mount and external value sync
    useEffect(() => {
        if (!editorRef.current) return;
        
        const currentHtml = editorRef.current.innerHTML;
        const normalizedValue = value || '';
        
        // Only update DOM if the content has genuinely changed from outside
        if (currentHtml !== normalizedValue && document.activeElement !== editorRef.current) {
            editorRef.current.innerHTML = normalizedValue;
        }
    }, [value]);

    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
        }
    };

    const restoreSelection = () => {
        if (!savedSelectionRef.current) return;
        const sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(savedSelectionRef.current);
        }
    };

    // Update active format states on selection change
    const updateActiveFormats = useCallback(() => {
        if (!editorRef.current || document.activeElement !== editorRef.current) return;
        
        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            strikeThrough: document.queryCommandState('strikeThrough'),
            justifyLeft: document.queryCommandState('justifyLeft'),
            justifyCenter: document.queryCommandState('justifyCenter'),
            justifyRight: document.queryCommandState('justifyRight'),
            justifyFull: document.queryCommandState('justifyFull'),
            insertUnorderedList: document.queryCommandState('insertUnorderedList'),
            insertOrderedList: document.queryCommandState('insertOrderedList'),
        });
    }, []);

    const execCmd = (command, value = null) => {
        if (disabled) return;
        editorRef.current?.focus();
        document.execCommand(command, false, value);
        handleInput();
        updateActiveFormats();
    };

    const handleInput = () => {
        if (!editorRef.current) return;
        let html = editorRef.current.innerHTML;
        
        // If only whitespace or empty br, treat as empty
        if (html === '<br>' || html === '<p><br></p>' || html.trim() === '') {
            html = '';
        }

        if (onChange) {
            onChange(html);
        }
    };

    const handleApplyTextColor = (color) => {
        restoreSelection();
        execCmd('foreColor', color);
        setShowColorPicker(false);
    };

    const handleApplyHighlight = (color) => {
        restoreSelection();
        if (color === 'transparent') {
            execCmd('removeFormat');
        } else {
            execCmd('hiliteColor', color);
        }
        setShowHighlightPicker(false);
    };

    const handleApplyFontSize = (sizeOption) => {
        restoreSelection();
        execCmd('fontSize', sizeOption.cmdVal);
        setShowFontSizePicker(false);
    };

    const handleOpenLinkModal = () => {
        saveSelection();
        setLinkUrl('');
        setShowLinkModal(true);
    };

    const handleSaveLink = () => {
        restoreSelection();
        if (linkUrl && linkUrl.trim() !== '') {
            let formattedUrl = linkUrl.trim();
            if (!/^https?:\/\//i.test(formattedUrl) && !/^mailto:/i.test(formattedUrl)) {
                formattedUrl = `https://${formattedUrl}`;
            }
            execCmd('createLink', formattedUrl);
        } else {
            execCmd('unlink');
        }
        setShowLinkModal(false);
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.rich-dropdown-container')) {
                setShowColorPicker(false);
                setShowHighlightPicker(false);
                setShowFontSizePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isEditorEmpty = !value || value === '<br>' || value === '<p><br></p>' || value.trim() === '';

    return (
        <div className={`relative flex flex-col rounded-xl border transition-all ${
            isFocused 
                ? 'border-[#0D5A34] ring-2 ring-emerald-500/10' 
                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
        } bg-white dark:bg-zinc-900 overflow-hidden ${className}`}>
            
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200/80 dark:border-zinc-700/80 select-none">
                
                {/* Undo / Redo Group */}
                <div className="flex items-center gap-0.5 pr-1 border-r border-zinc-200 dark:border-zinc-700">
                    <button
                        type="button"
                        onClick={() => execCmd('undo')}
                        title="Undo (Ctrl+Z)"
                        className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                        <Undo2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCmd('redo')}
                        title="Redo (Ctrl+Y)"
                        className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                        <Redo2 className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Font Size Dropdown */}
                <div className="relative rich-dropdown-container px-1 border-r border-zinc-200 dark:border-zinc-700">
                    <button
                        type="button"
                        onMouseDown={saveSelection}
                        onClick={() => setShowFontSizePicker(!showFontSizePicker)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                        title="Ukuran Font"
                    >
                        <Type className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="text-[11px]">Size</span>
                        <ChevronDown className="w-3 h-3 text-zinc-400" />
                    </button>

                    {showFontSizePicker && (
                        <div className="absolute left-0 top-full mt-1 w-44 p-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95">
                            {FONT_SIZES.map((size) => (
                                <button
                                    key={size.label}
                                    type="button"
                                    onClick={() => handleApplyFontSize(size)}
                                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-[#0D5A34] dark:hover:text-emerald-400 transition-colors cursor-pointer"
                                >
                                    {size.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Text Styles (Bold, Italic, Underline, Strikethrough) */}
                <div className="flex items-center gap-0.5 px-1 border-r border-zinc-200 dark:border-zinc-700">
                    <button
                        type="button"
                        onClick={() => execCmd('bold')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            activeFormats.bold 
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400 font-bold' 
                                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                        title="Bold (Ctrl+B)"
                    >
                        <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCmd('italic')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            activeFormats.italic 
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400' 
                                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                        title="Italic (Ctrl+I)"
                    >
                        <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCmd('underline')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            activeFormats.underline 
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400' 
                                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                        title="Underline (Ctrl+U)"
                    >
                        <Underline className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCmd('strikeThrough')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            activeFormats.strikeThrough 
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400' 
                                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                        title="Strikethrough"
                    >
                        <Strikethrough className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Color & Highlight Dropdowns */}
                <div className="flex items-center gap-0.5 px-1 border-r border-zinc-200 dark:border-zinc-700">
                    {/* Text Color Picker */}
                    <div className="relative rich-dropdown-container">
                        <button
                            type="button"
                            onMouseDown={saveSelection}
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer flex items-center gap-0.5"
                            title="Warna Teks"
                        >
                            <Palette className="w-3.5 h-3.5 text-emerald-600" />
                            <ChevronDown className="w-2.5 h-2.5 text-zinc-400" />
                        </button>

                        {showColorPicker && (
                            <div className="absolute left-0 top-full mt-1 w-48 p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 animate-in fade-in">
                                <div className="text-[10px] font-semibold uppercase text-zinc-400 mb-1.5 px-1">
                                    Warna Teks
                                </div>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {TEXT_COLORS.map((c) => (
                                        <button
                                            key={c.label}
                                            type="button"
                                            onClick={() => handleApplyTextColor(c.value)}
                                            className="flex items-center gap-1.5 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-[11px] cursor-pointer"
                                            title={c.label}
                                        >
                                            <span 
                                                className="w-3.5 h-3.5 rounded-full border border-zinc-300 dark:border-zinc-600 shrink-0" 
                                                style={{ backgroundColor: c.value }}
                                            />
                                            <span className="truncate">{c.label.split(' ')[0]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Highlight Picker */}
                    <div className="relative rich-dropdown-container">
                        <button
                            type="button"
                            onMouseDown={saveSelection}
                            onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer flex items-center gap-0.5"
                            title="Warna Highlight"
                        >
                            <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                            <ChevronDown className="w-2.5 h-2.5 text-zinc-400" />
                        </button>

                        {showHighlightPicker && (
                            <div className="absolute left-0 top-full mt-1 w-48 p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 animate-in fade-in">
                                <div className="text-[10px] font-semibold uppercase text-zinc-400 mb-1.5 px-1">
                                    Warna Highlight
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                    {HIGHLIGHT_COLORS.map((c) => (
                                        <button
                                            key={c.label}
                                            type="button"
                                            onClick={() => handleApplyHighlight(c.value)}
                                            className="flex items-center gap-1.5 p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-[11px] cursor-pointer"
                                        >
                                            <span 
                                                className="w-3.5 h-3.5 rounded border border-zinc-300 shrink-0" 
                                                style={{ backgroundColor: c.value === 'transparent' ? '#fff' : c.value }}
                                            />
                                            <span className="truncate">{c.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Text Alignment */}
                <div className="flex items-center gap-0.5 px-1 border-r border-zinc-200 dark:border-zinc-700">
                    <button
                        type="button"
                        onClick={() => execCmd('justifyLeft')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            activeFormats.justifyLeft 
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400' 
                                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                        title="Rata Kiri (Align Left)"
                    >
                        <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCmd('justifyCenter')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            activeFormats.justifyCenter 
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400' 
                                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                        title="Rata Tengah (Align Center)"
                    >
                        <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCmd('justifyRight')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            activeFormats.justifyRight 
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400' 
                                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                        title="Rata Kanan (Align Right)"
                    >
                        <AlignRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCmd('justifyFull')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            activeFormats.justifyFull 
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400' 
                                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                        title="Rata Kanan Kiri (Justify)"
                    >
                        <AlignJustify className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Lists */}
                <div className="flex items-center gap-0.5 px-1 border-r border-zinc-200 dark:border-zinc-700">
                    <button
                        type="button"
                        onClick={() => execCmd('insertUnorderedList')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            activeFormats.insertUnorderedList 
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400' 
                                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                        title="Bullet List"
                    >
                        <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCmd('insertOrderedList')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            activeFormats.insertOrderedList 
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-[#0D5A34] dark:text-emerald-400' 
                                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                        title="Numbered List"
                    >
                        <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Link & Clear Format */}
                <div className="flex items-center gap-0.5 pl-1">
                    <button
                        type="button"
                        onClick={handleOpenLinkModal}
                        className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                        title="Sisipkan Link (URL)"
                    >
                        <Link2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCmd('removeFormat')}
                        className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                        title="Hapus Formatting"
                    >
                        <RemoveFormatting className="w-3.5 h-3.5" />
                    </button>
                </div>

            </div>

            {/* Link Popover */}
            {showLinkModal && (
                <div className="p-2.5 bg-emerald-50 dark:bg-zinc-800 border-b border-emerald-200 dark:border-zinc-700 flex items-center gap-2 animate-in fade-in">
                    <Link2 className="w-4 h-4 text-[#0D5A34] dark:text-emerald-400 shrink-0" />
                    <input
                        type="text"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://contoh-link.com"
                        className="flex-1 px-2.5 py-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-[#0D5A34]"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveLink();
                            } else if (e.key === 'Escape') {
                                setShowLinkModal(false);
                            }
                        }}
                    />
                    <button
                        type="button"
                        onClick={handleSaveLink}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0D5A34] text-white text-xs font-semibold hover:bg-[#094226] transition-colors cursor-pointer"
                    >
                        <Check className="w-3 h-3" />
                        <span>Terapkan</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowLinkModal(false)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Editable Content Area */}
            <div className="relative">
                {isEditorEmpty && !isFocused && (
                    <div className="absolute left-3 top-2.5 text-xs text-zinc-400 dark:text-zinc-500 pointer-events-none select-none">
                        {placeholder}
                    </div>
                )}
                <div
                    ref={editorRef}
                    contentEditable={!disabled}
                    onInput={handleInput}
                    onFocus={() => {
                        setIsFocused(true);
                        updateActiveFormats();
                    }}
                    onBlur={() => {
                        setIsFocused(false);
                        handleInput();
                    }}
                    onKeyUp={updateActiveFormats}
                    onMouseUp={updateActiveFormats}
                    style={{ minHeight }}
                    className="p-3 text-xs leading-relaxed text-slate-900 dark:text-zinc-100 focus:outline-none overflow-y-auto prose prose-sm dark:prose-invert max-w-none"
                />
            </div>

        </div>
    );
}
