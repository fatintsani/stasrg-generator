import React from 'react';
import { 
    LayoutTemplate, 
    Image, 
    AlignLeft, 
    Sparkles, 
    Cpu, 
    CheckCircle2, 
    QrCode, 
    ChevronUp, 
    ChevronDown, 
    Eye, 
    EyeOff, 
    Columns, 
    RotateCcw,
    Sliders,
    Layers
} from 'lucide-react';
import { AVAILABLE_BLOCK_TYPES, getDefaultLayoutSchema } from '../../Utils/layoutPresets';

const BLOCK_ICONS = {
    header: LayoutTemplate,
    media: Image,
    description: AlignLeft,
    benefits: Sparkles,
    specifications: Cpu,
    problem_solution: CheckCircle2,
    footer_qr: QrCode,
};

export default function LayoutBlockList({ 
    schema, 
    onChange, 
    docFormat = 'a4_flyer',
    designStyle = 'classic_standard',
    disabled = false 
}) {
    const currentSchema = schema?.blocks ? schema : getDefaultLayoutSchema(docFormat, designStyle);
    const blocks = currentSchema.blocks || [];

    const handleMoveBlock = (index, direction) => {
        if (disabled) return;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= blocks.length) return;

        const newBlocks = [...blocks];
        const [movedBlock] = newBlocks.splice(index, 1);
        newBlocks.splice(newIndex, 0, movedBlock);

        onChange({
            ...currentSchema,
            blocks: newBlocks,
        });
    };

    const handleToggleVisibility = (index) => {
        if (disabled) return;
        const newBlocks = blocks.map((b, idx) => {
            if (idx === index) {
                return { ...b, visible: b.visible !== false ? false : true };
            }
            return b;
        });

        onChange({
            ...currentSchema,
            blocks: newBlocks,
        });
    };

    const handleColSpanChange = (index, colSpan) => {
        if (disabled) return;
        const newBlocks = blocks.map((b, idx) => {
            if (idx === index) {
                return { ...b, colSpan: Number(colSpan) };
            }
            return b;
        });

        onChange({
            ...currentSchema,
            blocks: newBlocks,
        });
    };

    const handleVariantChange = (index, variant) => {
        if (disabled) return;
        const newBlocks = blocks.map((b, idx) => {
            if (idx === index) {
                return { ...b, variant };
            }
            return b;
        });

        onChange({
            ...currentSchema,
            blocks: newBlocks,
        });
    };

    const handleReset = () => {
        if (disabled) return;
        onChange(getDefaultLayoutSchema(docFormat, designStyle));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#0AB600]" />
                        Struktur & Tata Letak Blok Visual
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Atur urutan posisi, lebar grid (kolom), dan visibilitas setiap modul dokumen secara fleksibel.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleReset}
                    disabled={disabled}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-700"
                    title="Kembalikan urutan blok ke standar"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Default</span>
                </button>
            </div>

            <div className="space-y-2.5">
                {blocks.map((block, index) => {
                    const blockMeta = AVAILABLE_BLOCK_TYPES.find(t => t.type === block.type) || {
                        name: block.type,
                        description: '',
                        allowedColSpans: [12],
                        hasVariants: false,
                        variants: [],
                    };
                    const IconComponent = BLOCK_ICONS[block.type] || Layers;
                    const isVisible = block.visible !== false;
                    const colSpan = block.colSpan || 12;

                    return (
                        <div
                            key={block.id || `${block.type}_${index}`}
                            className={`p-3 rounded-xl border transition-all duration-200 ${
                                isVisible 
                                    ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-[#0AB600]/40' 
                                    : 'bg-zinc-50 dark:bg-zinc-900/40 border-dashed border-zinc-300 dark:border-zinc-800 opacity-60'
                            }`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                {/* Left Side: Drag Handle & Meta Info */}
                                <div className="flex items-center gap-3">
                                    {/* Order Buttons */}
                                    <div className="flex flex-col gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => handleMoveBlock(index, 'up')}
                                            disabled={disabled || index === 0}
                                            className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                            title="Geser ke atas"
                                        >
                                            <ChevronUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleMoveBlock(index, 'down')}
                                            disabled={disabled || index === blocks.length - 1}
                                            className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                            title="Geser ke bawah"
                                        >
                                            <ChevronDown className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Icon */}
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                        isVisible
                                            ? 'bg-[#0AB600]/10 text-[#0AB600] dark:bg-[#0AB600]/20'
                                            : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600'
                                    }`}>
                                        <IconComponent className="w-4 h-4" />
                                    </div>

                                    {/* Label & Description */}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                                {index + 1}. {blockMeta.name}
                                            </span>
                                            {colSpan < 12 && (
                                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
                                                    {colSpan === 6 ? '50% Lebar' : `${colSpan}/12 Grid`}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                            {blockMeta.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Right Side: Controls */}
                                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                    {/* Grid Column Selector */}
                                    {blockMeta.allowedColSpans && blockMeta.allowedColSpans.length > 1 && isVisible && (
                                        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg">
                                            {blockMeta.allowedColSpans.map(span => (
                                                <button
                                                    key={span}
                                                    type="button"
                                                    disabled={disabled}
                                                    onClick={() => handleColSpanChange(index, span)}
                                                    className={`px-2 py-1 text-[10px] font-medium rounded-md transition-colors ${
                                                        colSpan === span
                                                            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                                                            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                                    }`}
                                                    title={`Gunakan lebar ${span === 12 ? 'Penuh (100%)' : span === 6 ? 'Setengah (50%)' : '1/3 Lebar'}`}
                                                >
                                                    {span === 12 ? 'Full (100%)' : span === 6 ? '1/2 (50%)' : '1/3'}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Variant Dropdown */}
                                    {blockMeta.hasVariants && blockMeta.variants?.length > 0 && isVisible && (
                                        <select
                                            disabled={disabled}
                                            value={block.variant || blockMeta.variants[0]?.id}
                                            onChange={(e) => handleVariantChange(index, e.target.value)}
                                            className="text-[11px] py-1 px-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-700 dark:text-zinc-300 focus:ring-1 focus:ring-[#0AB600]"
                                        >
                                            {blockMeta.variants.map(v => (
                                                <option key={v.id} value={v.id}>
                                                    {v.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {/* Visibility Toggle */}
                                    <button
                                        type="button"
                                        onClick={() => handleToggleVisibility(index)}
                                        disabled={disabled}
                                        className={`p-1.5 rounded-lg border transition-colors ${
                                            isVisible
                                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-300'
                                        }`}
                                        title={isVisible ? 'Sembunyikan blok dari layout' : 'Tampilkan blok di layout'}
                                    >
                                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
