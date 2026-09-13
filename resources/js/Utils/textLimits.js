import { LAYOUT_PRESETS, getLayoutPreset } from './layoutPresets';

/**
 * Text Limits & Layout Overflow Utilities for A4 Flyer Generator
 * Ensures content fits strictly on 1 page of A4 (794px x 1123px at 96 DPI)
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

export const TEXT_LIMITS = LAYOUT_PRESETS.balanced.limits;

/**
 * Evaluates all fields of a project against A4 layout limits according to the active layout preset.
 * Returns structured warnings and overall health status.
 */
export function evaluateProjectLayoutLimits(projectData, layoutPreset = null) {
    const presetId = layoutPreset || projectData?.layout_preset || 'balanced';
    const presetConfig = getLayoutPreset(presetId);
    const limits = presetConfig.limits;

    const warnings = [];
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
                message: `${config.label} melebihi batas ideal (${presetConfig.mode}: +${length - config.max} karakter)`,
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
