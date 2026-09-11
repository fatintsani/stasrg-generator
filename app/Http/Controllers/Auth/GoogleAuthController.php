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
                // Update Google info if not set
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar() ?? $user->avatar,
                ]);
            } else {
                // Create new user from Google profile
                $user = User::create([
                    'name' => $googleUser->getName() ?? 'User STAS-RG',
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'role' => 'admin',
                    'password' => null, // Google auth account
                    'is_biometric_enabled' => false,
                ]);
            }

            Auth::login($user, true);

            return redirect()->intended(route('dashboard'));
        } catch (Exception $e) {
            return redirect()->route('login')->withErrors([
                'email' => 'Gagal masuk melalui akun Google: '.$e->getMessage(),
            ]);
        }
    }
}
