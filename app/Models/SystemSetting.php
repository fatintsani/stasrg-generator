<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class SystemSetting extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'value',
        'type',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::saved(function (SystemSetting $setting) {
            Cache::forget("system_setting_{$setting->key}");
        });

        static::deleted(function (SystemSetting $setting) {
            Cache::forget("system_setting_{$setting->key}");
        });
    }

    /**
     * Get a setting value with fallback support.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember("system_setting_{$key}", 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();

            if (! $setting || $setting->value === null) {
                // Configuration fallbacks for common keys (compatible with config:cache)
                if ($key === 'ai_api_key') {
                    return config('services.ai.gemini_key', $default);
                }
                if ($key === 'ai_provider') {
                    return config('services.ai.provider', $default ?: 'gemini');
                }
                if ($key === 'ai_model') {
                    return config('services.ai.model', $default ?: 'gemini-3.6-flash');
                }
                if ($key === 'ai_custom_endpoint') {
                    return config('services.ai.custom_endpoint', $default);
                }

                return $default;
            }

            return match ($setting->type) {
                'encrypted' => self::decryptSafely($setting->value, $default),
                'json' => json_decode($setting->value, true) ?: $default,
                'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
                'integer' => (int) $setting->value,
                default => $setting->value,
            };
        });
    }

    /**
     * Set / store a setting value.
     */
    public static function set(string $key, mixed $value, string $type = 'string'): self
    {
        $storedValue = $value;

        if ($type === 'encrypted' && ! empty($value)) {
            $storedValue = Crypt::encryptString((string) $value);
        } elseif ($type === 'json' && is_array($value)) {
            $storedValue = json_encode($value);
        } elseif ($type === 'boolean') {
            $storedValue = $value ? '1' : '0';
        }

        $setting = static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $storedValue,
                'type' => $type,
            ]
        );

        Cache::forget("system_setting_{$key}");

        return $setting;
    }

    /**
     * Set / store an encrypted secret value.
     */
    public static function setSecret(string $key, ?string $value): self
    {
        return static::set($key, $value, 'encrypted');
    }

    /**
     * Get a decrypted secret value.
     */
    public static function getSecret(string $key, mixed $default = null): ?string
    {
        $val = static::get($key, $default);

        return is_string($val) ? $val : $default;
    }

    /**
     * Helper to safely decrypt strings with error protection.
     */
    private static function decryptSafely(string $encrypted, mixed $default = null): mixed
    {
        try {
            return Crypt::decryptString($encrypted);
        } catch (\Throwable $e) {
            Log::warning('Failed to decrypt system setting: '.$e->getMessage());

            return $default;
        }
    }

    /**
     * Return a masked version of secret keys (e.g. AIzaSy...38f1).
     */
    public static function maskSecret(?string $secret, int $visible = 4): string
    {
        if (empty($secret)) {
            return '';
        }

        $length = strlen($secret);
        if ($length <= $visible * 2) {
            return str_repeat('•', $length);
        }

        return substr($secret, 0, $visible).str_repeat('•', max(4, $length - ($visible * 2))).substr($secret, -$visible);
    }
}
