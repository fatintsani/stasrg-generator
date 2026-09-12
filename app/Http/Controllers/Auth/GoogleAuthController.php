<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google OAuth provider.
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle callback from Google OAuth.
     */
    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Find existing user by google_id or email
            $user = User::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            if ($user) {
                // Update Google profile details if needed
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar() ?? $user->avatar,
                ]);

                if ($user->isPending()) {
                    return redirect()->route('login')->withErrors([
                        'email' => 'Akun Google Anda masih menunggu persetujuan admin.',
                    ]);
                }

                if ($user->isRejected()) {
                    $reason = $user->rejection_reason ? ' Alasan: '.$user->rejection_reason : '';

                    return redirect()->route('login')->withErrors([
                        'email' => 'Akun Anda telah ditolak oleh admin.'.$reason,
                    ]);
                }

                if ($user->isInactive()) {
                    return redirect()->route('login')->withErrors([
                        'email' => 'Akun Anda telah dinonaktifkan oleh admin.',
                    ]);
                }

                Auth::login($user, true);

                return redirect()->intended(route('dashboard'));
            }

            // Register new pending user from Google profile
            User::create([
                'name' => $googleUser->getName() ?? 'User STAS-RG',
                'username' => 'google_'.substr(md5($googleUser->getId()), 0, 8),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'role' => 'admin',
                'status' => User::STATUS_PENDING,
                'password' => null,
                'is_biometric_enabled' => false,
            ]);

            return redirect()->route('login')->with('status', 'Pendaftaran melalui Google berhasil! Akun Anda sedang menunggu persetujuan admin sebelum dapat digunakan.');
        } catch (Exception $e) {
            return redirect()->route('login')->withErrors([
                'email' => 'Gagal masuk melalui akun Google: '.$e->getMessage(),
            ]);
        }
    }
}
