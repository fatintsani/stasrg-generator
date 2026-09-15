<?php

namespace App\Services;

class HtmlSanitizer
{
    /**
     * Allowed HTML tags for rich text content.
     */
    protected const ALLOWED_TAGS = '<b><strong><i><em><u><s><strike><del><p><br><span><ul><ol><li><a><div>';

    /**
     * Sanitize a rich text string or return empty string.
     */
    public static function clean(?string $html): ?string
    {
        if ($html === null || trim($html) === '') {
            return null;
        }

        // 1. Strip all disallowed tags
        $clean = strip_tags($html, self::ALLOWED_TAGS);

        // 2. Remove any inline JavaScript / event handlers (e.g. onclick=, onerror=, onload=)
        $clean = preg_replace('/\son\w+\s*=\s*(["\']).*?\1/i', '', $clean);
        $clean = preg_replace('/\son\w+\s*=\s*[^ >]+/i', '', $clean);

        // 3. Remove javascript: pseudo-protocols in attributes (e.g. href="javascript:...")
        $clean = preg_replace('/href\s*=\s*(["\'])\s*javascript:[^"\']*\1/i', 'href="#"', $clean);

        // 4. Remove data-* attributes (e.g. data-start, data-end, data-index from copied content)
        $clean = preg_replace('/\sdata-[a-zA-Z0-9_\-]+(\s*=\s*(["\']).*?\2|\s*=\s*[^ >\s]+)?/i', '', $clean);

        // 5. Remove class and id attributes from external rich editors
        $clean = preg_replace('/\sclass\s*=\s*(["\']).*?\1/i', '', $clean);
        $clean = preg_replace('/\sid\s*=\s*(["\']).*?\1/i', '', $clean);

        // 6. Sanitize style attribute: only allow safe CSS properties
        $clean = preg_replace_callback('/style\s*=\s*(["\'])(.*?)\1/i', function ($matches) {
            $rawStyles = $matches[2];
            $safeStyles = [];
            $declarations = explode(';', $rawStyles);

            foreach ($declarations as $declaration) {
                $parts = explode(':', $declaration, 2);
                if (count($parts) === 2) {
                    $prop = strtolower(trim($parts[0]));
                    $val = trim($parts[1]);

                    // Only allow safe CSS properties
                    if (in_array($prop, ['color', 'background-color', 'font-size', 'text-align', 'font-weight', 'font-style', 'text-decoration'])) {
                        // Disallow url(), expression(), or suspicious content
                        if (! preg_match('/(url|expression|behavior|javascript)/i', $val)) {
                            $safeStyles[] = "$prop: $val";
                        }
                    }
                }
            }

            if (empty($safeStyles)) {
                return '';
            }

            return 'style="'.implode('; ', $safeStyles).'"';
        }, $clean);

        // 7. Clean up redundant empty tags and extra spaces
        $clean = preg_replace('/<p>\s*<\/p>/i', '', $clean);
        $clean = trim($clean);

        return $clean !== '' ? $clean : null;
    }

    /**
     * Strip all HTML tags, decode entities, and return pure clean plain text.
     */
    public static function strip(?string $html): string
    {
        if ($html === null || trim($html) === '') {
            return '';
        }

        $text = preg_replace('/<style[^>]*>[\s\S]*?<\/style>/i', '', $html);
        $text = preg_replace('/<script[^>]*>[\s\S]*?<\/script>/i', '', $text);
        $text = strip_tags($text);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/', ' ', $text);

        return trim($text);
    }

    /**
     * Deeply sanitize SVG markup to eliminate stored XSS risks (script tags, foreignObject, event listeners, javascript: URIs).
     */
    public static function cleanSvg(?string $svg): ?string
    {
        if ($svg === null || trim($svg) === '') {
            return null;
        }

        $clean = trim($svg);

        // 1. Remove XML declaration, DOCTYPE, and comments if needed or keep minimal
        $clean = preg_replace('/<\?xml[^>]*\?>/i', '', $clean);
        $clean = preg_replace('/<!DOCTYPE[^>]*>/i', '', $clean);

        // 2. Remove dangerous tags and their content
        $dangerousTags = [
            'script',
            'foreignObject',
            'iframe',
            'embed',
            'object',
            'link',
            'meta',
            'applet',
            'audio',
            'video',
            'form',
            'input',
            'button',
            'textarea',
            'select',
        ];

        foreach ($dangerousTags as $tag) {
            $clean = preg_replace('/<'.$tag.'[^>]*>[\s\S]*?<\/'.$tag.'>/i', '', $clean);
            $clean = preg_replace('/<'.$tag.'[^>]*\/?>/i', '', $clean);
        }

        // 3. Remove inline JavaScript event handlers (e.g. onload=, onclick=, onerror=)
        $clean = preg_replace('/\son\w+\s*=\s*(["\']).*?\1/i', '', $clean);
        $clean = preg_replace('/\son\w+\s*=\s*[^ >]+/i', '', $clean);

        // 4. Remove javascript:, vbscript:, and data: (except data:image/) in href and xlink:href attributes
        $clean = preg_replace_callback('/(href|xlink:href)\s*=\s*(["\'])(.*?)\2/i', function ($matches) {
            $attr = $matches[1];
            $val = trim($matches[3]);
            if (preg_match('/^(javascript|vbscript|data:(?!image\/))/i', $val)) {
                return $attr.'="#"';
            }

            return $matches[0];
        }, $clean);

        // 5. Ensure svg root element is present
        $clean = trim($clean);
        if (! str_contains(strtolower($clean), '<svg')) {
            return null;
        }

        return $clean !== '' ? $clean : null;
    }
}
