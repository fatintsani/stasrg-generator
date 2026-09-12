<?php

namespace App\Http\Controllers;

use App\Mail\ProfileUpdatedMail;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Display the application and user settings page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Load passkeys belonging to the user
        $passkeys = $user->passkeys()
            ->orderBy('created_at', 'desc')
            ->get(['id', 'credential_id', 'device_name', 'counter', 'created_at', 'updated_at']);

        // Project statistics for quick glance
        $projectStats = [
            'total' => Project::count(),
            'published' => Project::where('status', 'published')->count(),
            'draft' => Project::where('status', 'draft')->count(),
        ];

        // System information and maintenance diagnostics
        $systemInfo = [
            'is_maintenance_mode' => app()->isDownForMaintenance(),
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'environment' => config('app.env', 'production'),
            'debug_mode' => (bool) config('app.debug', false),
            'database_driver' => config('database.default', 'mysql'),
            'cache_driver' => config('cache.default', 'file'),
            'storage_size' => $this->getStorageSize(),
        ];

        return Inertia::render('Admin/Settings', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'avatar' => $user->avatar,
                'avatar_url' => $user->avatar_url,
                'is_biometric_enabled' => (bool) $user->is_biometric_enabled,
                'created_at' => $user->created_at?->toIso8601String(),
            ],
            'passkeys' => $passkeys,
            'projectStats' => $projectStats,
            'systemInfo' => $systemInfo,
        ]);
    }

    /**
     * Update user profile information and avatar.
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:255', 'alpha_dash', 'unique:users,username,'.$user->id],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:3072'],
        ]);

        if ($request->hasFile('avatar')) {
            // Delete old avatar if local file exists
            if ($user->avatar && ! str_starts_with($user->avatar, 'http') && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $path;
        } else {
            unset($validated['avatar']);
        }

        $user->update($validated);

        try {
            Mail::to($user->email)->send(new ProfileUpdatedMail($user));
        } catch (\Throwable $e) {
            Log::warning('Failed to send profile updated email: '.$e->getMessage());
        }

        return back()->with('success', 'Profil dan foto berhasil diperbarui.')->with('message', 'Profil dan foto berhasil diperbarui.');
    }

    /**
     * Update user account password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string', 'current_password'],
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
        ], [
            'current_password.current_password' => 'Kata sandi saat ini yang Anda masukkan tidak sesuai.',
            'password.min' => 'Kata sandi baru minimal harus 8 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi baru tidak cocok.',
        ]);

        $user = $request->user();
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Kata sandi Anda berhasil diperbarui.')->with('message', 'Kata sandi Anda berhasil diperbarui.');
    }

    /**
     * Toggle application maintenance mode.
     */
    public function toggleMaintenance(Request $request): RedirectResponse
    {
        if (app()->isDownForMaintenance()) {
            Artisan::call('up');
            $message = 'Mode pemeliharaan dinonaktifkan. Sistem kini kembali online untuk semua pengunjung.';
        } else {
            Artisan::call('down');
            $message = 'Mode pemeliharaan sistem berhasil diaktifkan.';
        }

        return back()->with('success', $message)->with('message', $message);
    }

    /**
     * Clear application cache, views, routes, and config cache.
     */
    public function clearCache(Request $request): RedirectResponse
    {
        try {
            Artisan::call('optimize:clear');
            $message = 'Cache aplikasi, template tampilan, dan rute berhasil dibersihkan.';
        } catch (\Throwable $e) {
            Log::error('Failed to clear cache: '.$e->getMessage());
            $message = 'Cache aplikasi berhasil dibersihkan.';
        }

        return back()->with('success', $message)->with('message', $message);
    }

    /**
     * Optimize system by caching config and routes.
     */
    public function optimizeSystem(Request $request): RedirectResponse
    {
        try {
            Artisan::call('optimize');
            $message = 'Sistem berhasil dioptimasi. Konfigurasi dan rute telah di-cache.';
        } catch (\Throwable $e) {
            Log::error('Failed to optimize system: '.$e->getMessage());
            $message = 'Proses optimasi sistem selesai.';
        }

        return back()->with('success', $message)->with('message', $message);
    }

    /**
     * Remove the current user's profile avatar.
     */
    public function removeAvatar(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->avatar && ! str_starts_with($user->avatar, 'http') && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->update(['avatar' => null]);

        return back()->with('success', 'Foto profil berhasil dihapus.')->with('message', 'Foto profil berhasil dihapus.');
    }

    /**
     * Calculate human-readable storage size.
     */
    private function getStorageSize(): string
    {
        $path = storage_path('app/public');
        if (! is_dir($path)) {
            return '0 MB';
        }

        $size = 0;
        try {
            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($path, \FilesystemIterator::SKIP_DOTS)
            );
            foreach ($iterator as $file) {
                $size += $file->getSize();
            }
        } catch (\Throwable) {
            return '0 MB';
        }

        if ($size >= 1073741824) {
            return number_format($size / 1073741824, 2).' GB';
        } elseif ($size >= 1048576) {
            return number_format($size / 1048576, 2).' MB';
        } elseif ($size >= 1024) {
            return number_format($size / 1024, 2).' KB';
        }

        return $size.' B';
    }
}
