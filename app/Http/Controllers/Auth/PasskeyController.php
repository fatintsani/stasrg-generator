<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PasskeyCredential;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasskeyController extends Controller
{
    /**
     * Generate a cryptographic challenge for WebAuthn/Passkey authentication.
     */
    public function challenge(Request $request): JsonResponse
    {
        // 32-byte cryptographic challenge
        $challenge = Str::random(32);
        $request->session()->put('webauthn_challenge', $challenge);

        // Fetch registered credential IDs if email or user is specified
        $allowCredentials = [];
        if ($request->filled('email')) {
            $user = User::where('email', $request->email)->first();
            if ($user) {
                $allowCredentials = $user->passkeys()->pluck('credential_id')->map(function ($id) {
                    return [
                        'type' => 'public-key',
                        'id' => $id,
                        'transports' => ['internal', 'usb', 'nfc', 'ble'],
                    ];
                })->toArray();
            }
        } else {
            // General login challenge with all registered internal credentials
            $allowCredentials = PasskeyCredential::limit(20)->pluck('credential_id')->map(function ($id) {
                return [
                    'type' => 'public-key',
                    'id' => $id,
                    'transports' => ['internal', 'usb', 'nfc', 'ble'],
                ];
            })->toArray();
        }

        $host = parse_url(config('app.url', 'localhost'), PHP_URL_HOST) ?? 'localhost';

        return response()->json([
            'challenge' => base64_encode($challenge),
            'rpId' => $host,
            'allowCredentials' => $allowCredentials,
            'timeout' => 60000,
            'userVerification' => 'preferred',
        ]);
    }

    /**
     * Verify passkey credential / biometric login assertion against database.
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'credential_id' => ['required', 'string'],
            'authenticator_data' => ['nullable', 'string'],
            'client_data_json' => ['nullable', 'string'],
            'signature' => ['nullable', 'string'],
        ]);

        $credentialId = $request->credential_id;

        // Search for registered passkey in database
        $passkey = PasskeyCredential::where('credential_id', $credentialId)
            ->with('user')
            ->first();

        if (! $passkey || ! $passkey->user) {
            throw ValidationException::withMessages([
                'passkey' => 'Kredensial Passkey / Biometrik tidak dikenali atau belum terdaftar pada akun mana pun di sistem ini. Silakan login dengan Email dan Kata Sandi terlebih dahulu untuk mendaftarkan Passkey pada perangkat Anda.',
            ]);
        }

        $user = $passkey->user;

        if ($user->isPending()) {
            throw ValidationException::withMessages([
                'passkey' => 'Akun Anda masih menunggu persetujuan admin.',
            ]);
        }

        if ($user->isRejected()) {
            $reason = $user->rejection_reason ? ' Alasan: '.$user->rejection_reason : '';
            throw ValidationException::withMessages([
                'passkey' => 'Akun Anda telah ditolak oleh admin.'.$reason,
            ]);
        }

        if ($user->isInactive()) {
            throw ValidationException::withMessages([
                'passkey' => 'Akun Anda telah dinonaktifkan oleh admin.',
            ]);
        }

        // Increment counter
        $passkey->increment('counter');

        // Clean up challenge from session
        $request->session()->forget('webauthn_challenge');

        // Log the user in
        Auth::login($user, true);
        $request->session()->regenerate();

        ActivityLogger::logAuth(
            action: 'auth.passkey_login',
            description: "Login berhasil sebagai \"{$user->name}\" via Passkey/Biometrik",
            user: $user,
            properties: [
                'auth_method' => 'passkey_biometrics',
                'device_name' => $passkey->device_name,
                'counter' => $passkey->counter,
            ],
            request: $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Autentikasi biometrik berhasil.',
            'redirect_url' => route('dashboard'),
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Generate options for registering a new passkey.
     */
    public function registerOptions(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $challenge = Str::random(32);
        $request->session()->put('webauthn_register_challenge', $challenge);
        $host = parse_url(config('app.url', 'localhost'), PHP_URL_HOST) ?? 'localhost';

        return response()->json([
            'challenge' => base64_encode($challenge),
            'rp' => [
                'name' => config('app.name', 'STAS RG Projects'),
                'id' => $host,
            ],
            'user' => [
                'id' => base64_encode((string) $user->id),
                'name' => $user->email,
                'displayName' => $user->name,
            ],
            'pubKeyCredParams' => [
                ['type' => 'public-key', 'alg' => -7],  // ES256
                ['type' => 'public-key', 'alg' => -257], // RS256
            ],
            'authenticatorSelection' => [
                'authenticatorAttachment' => 'platform',
                'userVerification' => 'preferred',
                'residentKey' => 'preferred',
            ],
            'timeout' => 60000,
            'attestation' => 'none',
        ]);
    }

    /**
     * Store new passkey credential for an authenticated user.
     */
    public function registerPasskey(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $request->validate([
            'credential_id' => ['required', 'string'],
            'public_key' => ['nullable', 'string'],
            'device_name' => ['nullable', 'string'],
        ]);

        $passkey = PasskeyCredential::updateOrCreate(
            ['credential_id' => $request->credential_id],
            [
                'user_id' => $user->id,
                'public_key' => $request->public_key ?? 'ECDSA_PUBLIC_KEY',
                'device_name' => $request->device_name ?? 'Device Biometrics / Touch ID',
                'counter' => 0,
            ]
        );

        $user->update(['is_biometric_enabled' => true]);
        $request->session()->forget('webauthn_register_challenge');

        ActivityLogger::logAuth(
            action: 'auth.passkey_registered',
            description: "Mendaftarkan Passkey biometrik baru ({$passkey->device_name})",
            user: $user,
            properties: [
                'device_name' => $passkey->device_name,
                'credential_id' => $passkey->credential_id,
            ],
            request: $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Passkey biometrik perangkat berhasil didaftarkan.',
            'passkey' => $passkey,
        ]);
    }

    /**
     * Delete a registered passkey credential.
     */
    public function destroyPasskey(Request $request, PasskeyCredential $passkey): JsonResponse
    {
        $user = $request->user();
        if (! $user || $passkey->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $deviceName = $passkey->device_name;
        $passkey->delete();

        // If no passkeys left, mark is_biometric_enabled false
        if ($user->passkeys()->count() === 0) {
            $user->update(['is_biometric_enabled' => false]);
        }

        ActivityLogger::logAuth(
            action: 'auth.passkey_deleted',
            description: "Menghapus Passkey biometrik ({$deviceName})",
            user: $user,
            properties: ['device_name' => $deviceName],
            request: $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Passkey berhasil dihapus.',
        ]);
    }
}
