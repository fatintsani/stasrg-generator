import React from 'react';

/**
 * Predefined supported social media & contact platforms
 */
export const AVAILABLE_SOCIAL_PLATFORMS = [
    {
        id: 'website',
        name: 'Website / Portal',
        placeholder: 'www.stas-rg.com',
        prefix: 'Web:',
        defaultHandle: 'www.stas-rg.com',
        color: '#0D5A34',
    },
    {
        id: 'instagram',
        name: 'Instagram',
        placeholder: '@stas.rg',
        prefix: 'IG:',
        defaultHandle: '@stas.rg',
        color: '#E1306C',
    },
    {
        id: 'youtube',
        name: 'YouTube',
        placeholder: '@stas_rg',
        prefix: 'YT:',
        defaultHandle: '@stas_rg',
        color: '#FF0000',
    },
    {
        id: 'facebook',
        name: 'Facebook',
        placeholder: 'facebook.com/stasrg',
        prefix: 'FB:',
        defaultHandle: 'facebook.com/stasrg',
        color: '#1877F2',
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        placeholder: 'linkedin.com/company/stas-rg',
        prefix: 'IN:',
        defaultHandle: 'linkedin.com/company/stas-rg',
        color: '#0A66C2',
    },
    {
        id: 'twitter',
        name: 'X (Twitter)',
        placeholder: '@stas_rg',
        prefix: 'X:',
        defaultHandle: '@stas_rg',
        color: '#000000',
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        placeholder: '@stas.rg',
        prefix: 'TT:',
        defaultHandle: '@stas.rg',
        color: '#000000',
    },
    {
        id: 'github',
        name: 'GitHub',
        placeholder: 'github.com/stas-rg',
        prefix: 'Git:',
        defaultHandle: 'github.com/stas-rg',
        color: '#24292e',
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        placeholder: '+62 812-xxxx-xxxx',
        prefix: 'WA:',
        defaultHandle: '+62 812-xxxx-xxxx',
        color: '#25D366',
    },
    {
        id: 'telegram',
        name: 'Telegram',
        placeholder: 't.me/stasrg',
        prefix: 'TG:',
        defaultHandle: 't.me/stasrg',
        color: '#229ED9',
    },
    {
        id: 'email',
        name: 'Email Kontak',
        placeholder: 'stasrg@telkomuniversity.ac.id',
        prefix: 'Email:',
        defaultHandle: 'stasrg@telkomuniversity.ac.id',
        color: '#0D5A34',
    },
    {
        id: 'custom',
        name: 'Tautan Kustom / Lainnya',
        placeholder: 'https://...',
        prefix: 'Link:',
        defaultHandle: 'https://...',
        color: '#4B5563',
    },
];

export function getSocialPlatformConfig(platformId) {
    const key = (platformId || 'website').toLowerCase();
    return AVAILABLE_SOCIAL_PLATFORMS.find((p) => p.id === key) || {
        id: key,
        name: platformId || 'Tautan',
        placeholder: 'URL / Akun',
        prefix: `${platformId}:`,
        defaultHandle: '',
        color: '#0D5A34',
    };
}

/**
 * Default fallback social links if none are configured
 */
export const DEFAULT_STAS_SOCIAL_LINKS = [
    { platform: 'website', value: 'www.stas-rg.com' },
    { platform: 'instagram', value: '@stas.rg' },
    { platform: 'youtube', value: '@stas_rg' },
];

/**
 * Normalizes project social links, ensuring backwards-compatibility
 * with legacy footer_website, footer_instagram, and footer_youtube fields.
 */
export function normalizeSocialLinks(project) {
    if (!project) return DEFAULT_STAS_SOCIAL_LINKS;

    // If social_links array is present and has items
    if (Array.isArray(project.social_links) && project.social_links.length > 0) {
        return project.social_links.filter(
            (item) => item && typeof item === 'object' && item.value && String(item.value).trim() !== ''
        );
    }

    // Try parsing if it's a JSON string
    if (typeof project.social_links === 'string') {
        try {
            const parsed = JSON.parse(project.social_links);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.filter(
                    (item) => item && typeof item === 'object' && item.value && String(item.value).trim() !== ''
                );
            }
        } catch {
            // ignore
        }
    }

    // Fallback to legacy fields
    const list = [];
    if (project.footer_website || !project.id) {
        list.push({ platform: 'website', value: project.footer_website || 'www.stas-rg.com' });
    }
    if (project.footer_instagram || !project.id) {
        list.push({ platform: 'instagram', value: project.footer_instagram || '@stas.rg' });
    }
    if (project.footer_youtube || !project.id) {
        list.push({ platform: 'youtube', value: project.footer_youtube || '@stas_rg' });
    }

    return list.length > 0 ? list : DEFAULT_STAS_SOCIAL_LINKS;
}

/**
 * Universal Vector SVG Social Icon Component
 * Crisp for both HTML/Canvas views and print/PDF rendering.
 */
export function SocialIcon({ platform, style = {}, className = '', color = 'currentColor' }) {
    const baseStyle = {
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
    };

    const key = (platform || 'website').toLowerCase();

    switch (key) {
        case 'instagram':
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={baseStyle}
                    className={className}
                >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
            );

        case 'youtube':
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={baseStyle}
                    className={className}
                >
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                    <polygon points="10 15 15 12 10 9 10 15" fill={color} stroke="none" />
                </svg>
            );

        case 'facebook':
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={baseStyle}
                    className={className}
                >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
            );

        case 'linkedin':
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={baseStyle}
                    className={className}
                >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                </svg>
            );

        case 'twitter':
        case 'x':
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={baseStyle}
                    className={className}
                >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            );

        case 'tiktok':
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={baseStyle}
                    className={className}
                >
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
            );

        case 'github':
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={baseStyle}
                    className={className}
                >
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
            );

        case 'whatsapp':
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={baseStyle}
                    className={className}
                >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
            );

        case 'telegram':
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={baseStyle}
                    className={className}
                >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
            );

        case 'email':
        case 'mail':
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={baseStyle}
                    className={className}
                >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
            );

        case 'website':
        case 'web':
        case 'globe':
        default:
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={baseStyle}
                    className={className}
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" x2="22" y1="12" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
                </svg>
            );
    }
}
