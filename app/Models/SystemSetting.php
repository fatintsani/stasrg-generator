<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
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
     * Get a setting value with fallback support.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();

        if (! $setting || $setting->value === null) {
            // Environment variable fallbacks for common keys
            if ($key === 'ai_api_key') {
                return env('GEMINI_API_KEY') ?: env('AI_API_KEY', $default);
            }
            if ($key === 'ai_provider') {
                return env('AI_PROVIDER', $default ?: 'gemini');
            }
            if ($key === 'ai_model') {
                return env('AI_MODEL', $default ?: 'gemini-3.6-flash');
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

        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $storedValue,
                'type' => $type,
            ]
        );
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
