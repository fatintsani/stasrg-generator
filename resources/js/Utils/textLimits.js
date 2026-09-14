import { LAYOUT_PRESETS, DOCUMENT_FORMATS, getLayoutPreset, getDocumentFormat } from './layoutPresets';

/**
 * Text Limits & Layout Overflow Utilities for STAS-RG Generator
 * Standardizes character limits and layout constraints per document format.
 */

export function getPlainTextLength(htmlOrText) {
    if (!htmlOrText) return 0;
    if (typeof htmlOrText !== 'string') return 0;

    return htmlOrText
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<\/(p|li|div|h[1-6])>/gi, ' ')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim().length;
}

export const FORMAT_LIMITS = {
    a4_flyer: {
        // delegates to layout presets (balanced, visual_heavy, text_heavy)
    },
    roll_banner: {
        title: { max: 55, warn: 42, label: 'Judul Banner', desc: 'Maks 2 baris (X-Banner 60×160cm)' },
        subtitle: { max: 40, warn: 30, label: 'Subtitle Banner', desc: 'Maks 1 baris badge' },
        description: { max: 300, warn: 230, label: 'Deskripsi Singkat', desc: 'Ringkas & to the point' },
        benefits: { max: 230, warn: 180, label: 'Poin Manfaat', desc: 'Poin dampak & efisiensi' },
        specifications: { max: 230, warn: 180, label: 'Poin Spesifikasi', desc: 'Komponen teknis eye-level' },
        problem: { max: 180, warn: 135, label: 'Problem', desc: 'Uraian kendala ringkas' },
        solution: { max: 180, warn: 135, label: 'Solution', desc: 'Solusi terapan ringkas' },
    },
    factsheet_2col: {
        title: { max: 65, warn: 50, label: 'Judul Factsheet', desc: 'Maks 2 baris (Factsheet 2)' },
        subtitle: { max: 45, warn: 35, label: 'Subtitle Banner', desc: 'Maks 1 baris badge' },
        description: { max: 380, warn: 300, label: 'Deskripsi Singkat', desc: 'Ringkasan eksekutif riset' },
        benefits: { max: 280, warn: 220, label: 'Poin Manfaat', desc: 'Poin keunggulan riset' },
        specifications: { max: 280, warn: 220, label: 'Poin Spesifikasi', desc: 'Spesifikasi teknis & metodologi' },
        problem: { max: 200, warn: 160, label: 'Problem', desc: 'Kendala di lapangan' },
        solution: { max: 200, warn: 160, label: 'Solution', desc: 'Solusi teknologi' },
    },
    pitch_poster: {
        title: { max: 55, warn: 42, label: 'Judul Pitch Poster', desc: 'Maks 2 baris (16:9 Widescreen)' },
        subtitle: { max: 40, warn: 30, label: 'Subtitle Banner', desc: 'Maks 1 baris badge' },
        description: { max: 250, warn: 190, label: 'Deskripsi Singkat', desc: 'Ringkas untuk display 16:9' },
        benefits: { max: 190, warn: 145, label: 'Poin Manfaat', desc: 'Keunggulan utama pitch' },
        specifications: { max: 190, warn: 145, label: 'Poin Spesifikasi', desc: 'Spesifikasi ringkas' },
        problem: { max: 150, warn: 115, label: 'Problem', desc: 'Problem ringkas' },
        solution: { max: 150, warn: 115, label: 'Solution', desc: 'Solusi ringkas' },
    },
    social_feed: {
        title: { max: 50, warn: 38, label: 'Judul Feed', desc: 'Maks 2 baris (Feed 1:1)' },
        subtitle: { max: 35, warn: 26, label: 'Subtitle Banner', desc: 'Maks 1 baris badge' },
        description: { max: 220, warn: 170, label: 'Deskripsi Singkat', desc: 'Teks ringkas feed medsos' },
        benefits: { max: 170, warn: 130, label: 'Poin Manfaat', desc: 'Poin manfaat feed' },
        specifications: { max: 170, warn: 130, label: 'Poin Spesifikasi', desc: 'Spesifikasi feed' },
        problem: { max: 140, warn: 105, label: 'Problem', desc: 'Kendala feed ringkas' },
        solution: { max: 140, warn: 105, label: 'Solution', desc: 'Solusi feed ringkas' },
    },
    social_story: {
        title: { max: 55, warn: 40, label: 'Judul Story', desc: 'Maks 2 baris (Story 9:16)' },
        subtitle: { max: 40, warn: 30, label: 'Subtitle Banner', desc: 'Maks 1 baris badge' },
        description: { max: 260, warn: 200, label: 'Deskripsi Singkat', desc: 'Ringkas vertikal seluler' },
        benefits: { max: 200, warn: 150, label: 'Poin Manfaat', desc: 'Poin keunggulan story' },
        specifications: { max: 200, warn: 150, label: 'Poin Spesifikasi', desc: 'Spesifikasi story' },
        problem: { max: 150, warn: 115, label: 'Problem', desc: 'Kendala story' },
        solution: { max: 150, warn: 115, label: 'Solution', desc: 'Solusi story' },
    },
    brochure_trifold: {
        panelTitle: { max: 48, warn: 36, label: 'Judul Kotak Panel', desc: 'Maks 2 baris per kolom' },
        panelSubtitle: { max: 36, warn: 28, label: 'Sub-topik Kotak', desc: 'Maks 1 baris badge' },
        title: { max: 55, warn: 42, label: 'Judul Brosur', desc: 'Maks 2 baris' },
        subtitle: { max: 40, warn: 30, label: 'Subtitle Banner', desc: 'Maks 1 baris badge' },
        description: { max: 220, warn: 170, label: 'Deskripsi Kolom', desc: 'Ringkasan per kolom (Lipat 3)' },
        benefits: { max: 190, warn: 145, label: 'Poin Manfaat', desc: 'Poin manfaat per kolom' },
        specifications: { max: 190, warn: 145, label: 'Poin Spesifikasi', desc: 'Spesifikasi per kolom' },
        problem: { max: 150, warn: 115, label: 'Problem', desc: 'Kendala per kolom' },
        solution: { max: 150, warn: 115, label: 'Solution', desc: 'Solusi per kolom' },
    },
};

export function getFormatLimits(docFormat = 'a4_flyer', layoutPreset = 'balanced') {
    if (docFormat === 'a4_flyer') {
        const presetConfig = getLayoutPreset(layoutPreset || 'balanced');
        return presetConfig.limits;
    }
    return FORMAT_LIMITS[docFormat] || FORMAT_LIMITS.a4_flyer || getLayoutPreset('balanced').limits;
}

export const TEXT_LIMITS = LAYOUT_PRESETS.balanced.limits;

/**
 * Evaluates all fields of a project against layout limits according to the active document format and layout preset.
 * Returns structured warnings and overall health status.
 */
export function evaluateProjectLayoutLimits(projectData, layoutPreset = null, docFormat = null) {
    const docFormatId = docFormat || projectData?.doc_format || 'a4_flyer';
    const formatConfig = getDocumentFormat(docFormatId);
    const presetId = layoutPreset || projectData?.layout_preset || 'balanced';
    const presetConfig = getLayoutPreset(presetId);

    const limits = getFormatLimits(docFormatId, presetId);
    const formatName = formatConfig?.name || 'Dokumen';

    const warnings = [];

    // Check if trifold brochure with panels array
    if (docFormatId === 'brochure_trifold' && Array.isArray(projectData?.problem_solution?.panels) && projectData.problem_solution.panels.length > 0) {
        const panels = projectData.problem_solution.panels;
        let totalChars = 0;
        let maxAllowedChars = 0;

        panels.forEach((panel, idx) => {
            const panelNum = idx + 1;
            const panelFields = [
                { key: `panel_${panelNum}_title`, value: panel?.title, config: limits.panelTitle || limits.title, label: `Kotak ${panelNum} - Judul` },
                { key: `panel_${panelNum}_subtitle`, value: panel?.subtitle, config: limits.panelSubtitle || limits.subtitle, label: `Kotak ${panelNum} - Subtitle` },
                { key: `panel_${panelNum}_description`, value: panel?.description, config: limits.description, label: `Kotak ${panelNum} - Deskripsi` },
                { key: `panel_${panelNum}_benefits`, value: panel?.benefits, config: limits.benefits, label: `Kotak ${panelNum} - Manfaat` },
                { key: `panel_${panelNum}_specifications`, value: panel?.specifications, config: limits.specifications, label: `Kotak ${panelNum} - Spesifikasi` },
                { key: `panel_${panelNum}_problem`, value: panel?.problem, config: limits.problem, label: `Kotak ${panelNum} - Problem` },
                { key: `panel_${panelNum}_solution`, value: panel?.solution, config: limits.solution, label: `Kotak ${panelNum} - Solusi` },
            ];

            panelFields.forEach(({ key, value, config, label }) => {
                if (!config) return;
                const length = getPlainTextLength(value);
                totalChars += length;
                maxAllowedChars += config.max;

                if (length > config.max) {
                    warnings.push({
                        key,
                        field: label,
                        current: length,
                        max: config.max,
                        excess: length - config.max,
                        level: 'error',
                        message: `${label} melebihi batas ideal ${formatName} (+${length - config.max} karakter)`,
                    });
                } else if (length >= config.warn) {
                    warnings.push({
                        key,
                        field: label,
                        current: length,
                        max: config.max,
                        excess: 0,
                        level: 'warning',
                        message: `${label} mendekati batas layout (${length}/${config.max})`,
                    });
                }
            });
        });

        const hasErrors = warnings.some((w) => w.level === 'error');
        const hasWarnings = warnings.length > 0;

        return {
            preset: presetConfig,
            format: formatConfig,
            hasErrors,
            hasWarnings,
            warnings,
            errorWarnings: warnings.filter((w) => w.level === 'error'),
            cautionWarnings: warnings.filter((w) => w.level === 'warning'),
            totalChars,
            maxAllowedChars,
            isOptimal: !hasErrors && !hasWarnings,
        };
    }

    // Standard single-canvas formats
    const fields = [
        { key: 'title', value: projectData?.title, config: limits.title },
        { key: 'subtitle', value: projectData?.subtitle, config: limits.subtitle },
        { key: 'description', value: projectData?.description, config: limits.description },
        { 
            key: 'benefits', 
            value: typeof projectData?.benefits === 'object' ? projectData.benefits?.content : projectData?.benefits, 
            config: limits.benefits 
        },
        { 
            key: 'specifications', 
            value: typeof projectData?.specifications === 'object' ? projectData.specifications?.content : projectData?.specifications, 
            config: limits.specifications 
        },
        { 
            key: 'problem', 
            value: typeof projectData?.problem_solution === 'object' ? projectData.problem_solution?.problem : '', 
            config: limits.problem 
        },
        { 
            key: 'solution', 
            value: typeof projectData?.problem_solution === 'object' ? projectData.problem_solution?.solution : (typeof projectData?.problem_solution === 'string' ? projectData.problem_solution : ''), 
            config: limits.solution 
        },
    ];

    let totalChars = 0;
    let maxAllowedChars = 0;

    fields.forEach(({ key, value, config }) => {
        if (!config) return;
        const length = getPlainTextLength(value);
        totalChars += length;
        maxAllowedChars += config.max;

        if (length > config.max) {
            warnings.push({
                key,
                field: config.label,
                current: length,
                max: config.max,
                excess: length - config.max,
                level: 'error',
                message: `${config.label} melebihi batas ideal ${formatName} (+${length - config.max} karakter)`,
            });
        } else if (length >= config.warn) {
            warnings.push({
                key,
                field: config.label,
                current: length,
                max: config.max,
                excess: 0,
                level: 'warning',
                message: `${config.label} mendekati batas layout (${length}/${config.max})`,
            });
        }
    });

    const hasErrors = warnings.some((w) => w.level === 'error');
    const hasWarnings = warnings.length > 0;

    return {
        preset: presetConfig,
        format: formatConfig,
        hasErrors,
        hasWarnings,
        warnings,
        errorWarnings: warnings.filter((w) => w.level === 'error'),
        cautionWarnings: warnings.filter((w) => w.level === 'warning'),
        totalChars,
        maxAllowedChars,
        isOptimal: !hasErrors && !hasWarnings,
    };
}

