<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectAnalytic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AnalyticsTracker
{
    /**
     * Record a QR code scan event.
     */
    public static function trackQrScan(Project $project, Request $request, array $metadata = []): ?ProjectAnalytic
    {
        return self::recordEvent(
            project: $project,
            eventType: ProjectAnalytic::EVENT_QR_SCAN,
            source: 'qr',
            request: $request,
            metadata: $metadata
        );
    }

    /**
     * Record a showcase view event.
     */
    public static function trackShowcaseView(Project $project, Request $request, array $metadata = []): ?ProjectAnalytic
    {
        $src = $request->query('src', 'web');

        return self::recordEvent(
            project: $project,
            eventType: ProjectAnalytic::EVENT_SHOWCASE_VIEW,
            source: $src === 'qr' ? 'qr' : ($request->headers->get('referer') ? 'referrer' : 'direct'),
            request: $request,
            metadata: array_merge(['query_src' => $src], $metadata)
        );
    }

    /**
     * Record a flyer download or print event.
     */
    public static function trackExport(?Project $project, string $format, Request $request, array $metadata = []): ?ProjectAnalytic
    {
        $eventType = match (strtolower($format)) {
            'png' => ProjectAnalytic::EVENT_DOWNLOAD_PNG,
            'pdf' => ProjectAnalytic::EVENT_DOWNLOAD_PDF,
            'print' => ProjectAnalytic::EVENT_PRINT_FLYER,
            default => ProjectAnalytic::EVENT_DOWNLOAD_PNG,
        };

        return self::recordEvent(
            project: $project,
            eventType: $eventType,
            source: $request->input('source', 'admin_preview'),
            request: $request,
            metadata: array_merge(['format' => $format], $metadata)
        );
    }

    /**
     * Internal method to create and persist an analytic event.
     */
    public static function recordEvent(
        ?Project $project,
        string $eventType,
        string $source,
        Request $request,
        array $metadata = []
    ): ?ProjectAnalytic {
        try {
            $userAgent = $request->userAgent() ?? '';
            $deviceType = self::detectDeviceType($userAgent);
            $browser = self::detectBrowser($userAgent);
            $platform = self::detectPlatform($userAgent);
            $city = self::detectCity($request);
            $country = self::detectCountry($request);

            return ProjectAnalytic::create([
                'project_id' => $project?->id,
                'event_type' => $eventType,
                'source' => $source,
                'ip_address' => $request->ip(),
                'user_agent' => substr($userAgent, 0, 1000),
                'device_type' => $deviceType,
                'browser' => $browser,
                'platform' => $platform,
                'city' => $city,
                'country' => $country,
                'referrer' => substr($request->headers->get('referer', ''), 0, 500) ?: null,
                'metadata' => $metadata ?: null,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Failed to track analytics event: '.$e->getMessage(), [
                'event_type' => $eventType,
                'project_id' => $project?->id,
            ]);

            return null;
        }
    }

    /**
     * Detect device category from User-Agent.
     */
    public static function detectDeviceType(string $ua): string
    {
        $ua = strtolower($ua);

        if (preg_match('/(bot|crawler|spider|slurp|facebookexternalhit|curl|wget)/i', $ua)) {
            return 'bot';
        }

        if (preg_match('/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i', $ua)) {
            return 'tablet';
        }

        if (preg_match('/(mobile|iphone|ipod|blackberry|opera mini|iemobile|mobile safari)/i', $ua)) {
            return 'mobile';
        }

        return 'desktop';
    }

    /**
     * Detect browser name from User-Agent.
     */
    public static function detectBrowser(string $ua): string
    {
        if (preg_match('/Edg/i', $ua)) {
            return 'Edge';
        }
        if (preg_match('/Chrome/i', $ua) && ! preg_match('/Edg/i', $ua)) {
            return 'Chrome';
        }
        if (preg_match('/Safari/i', $ua) && ! preg_match('/Chrome/i', $ua)) {
            return 'Safari';
        }
        if (preg_match('/Firefox/i', $ua)) {
            return 'Firefox';
        }
        if (preg_match('/OPR|Opera/i', $ua)) {
            return 'Opera';
        }
        if (preg_match('/MSIE|Trident/i', $ua)) {
            return 'Internet Explorer';
        }

        return 'Other';
    }

    /**
     * Detect operating system / platform from User-Agent.
     */
    public static function detectPlatform(string $ua): string
    {
        if (preg_match('/Android/i', $ua)) {
            return 'Android';
        }
        if (preg_match('/iPhone|iPad|iPod/i', $ua)) {
            return 'iOS';
        }
        if (preg_match('/Windows/i', $ua)) {
            return 'Windows';
        }
        if (preg_match('/Macintosh|Mac OS X/i', $ua)) {
            return 'macOS';
        }
        if (preg_match('/Linux/i', $ua)) {
            return 'Linux';
        }

        return 'Other';
    }

    /**
     * Detect city location (from Cloudflare headers or heuristics).
     */
    public static function detectCity(Request $request): string
    {
        $cfCity = $request->header('CF-IPCity');
        if (! empty($cfCity)) {
            return $cfCity;
        }

        // For internal/local development or expo simulations
        $ip = $request->ip();
        if ($ip === '127.0.0.1' || $ip === '::1' || str_starts_with($ip, '192.168.') || str_starts_with($ip, '10.')) {
            return 'Bandung (Telkom University)';
        }

        return 'Bandung';
    }

    /**
     * Detect country location.
     */
    public static function detectCountry(Request $request): string
    {
        $cfCountry = $request->header('CF-IPCountry');
        if (! empty($cfCountry)) {
            return $cfCountry;
        }

        return 'Indonesia';
    }
}
