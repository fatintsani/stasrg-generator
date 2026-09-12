/**
 * Clean and strip all HTML tags, scripts, styles, and HTML entities from a string.
 * Returns pure plain text suitable for cards, snippets, and SEO meta tags.
 *
 * @param {string|null|undefined} html
 * @returns {string}
 */
export function stripHtml(html) {
    if (!html || typeof html !== 'string') {
        return '';
    }

    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&apos;/gi, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Truncate clean text to a maximum length with ellipsis.
 *
 * @param {string|null|undefined} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateCleanText(text, maxLength = 160) {
    const clean = stripHtml(text);
    if (!clean || clean.length <= maxLength) {
        return clean;
    }
    return clean.slice(0, maxLength).trim() + '...';
}
