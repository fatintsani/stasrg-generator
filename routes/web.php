<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\PasskeyController;
use App\Http\Controllers\Auth\PasswordResetOtpController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Landing & Legal Pages
Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::get('/privacy', function () {
    return Inertia::render('Privacy');
})->name('privacy');

Route::get('/terms', function () {
    return Inertia::render('Terms');
})->name('terms');

// Guest Authentication Routes
Route::middleware('guest')->group(function () {
    // Login
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');

    // Register / Create User
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store'])->name('register.store');

    // Google OAuth
    Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');
    Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

    // Forgot Password & Mailpit OTP
    Route::get('/forgot-password', [PasswordResetOtpController::class, 'create'])->name('password.request');
    Route::post('/forgot-password/send-otp', [PasswordResetOtpController::class, 'sendOtp'])->name('password.send-otp');
    Route::post('/forgot-password/verify-otp', [PasswordResetOtpController::class, 'verifyOtp'])->name('password.verify-otp');

    // Reset Password
    Route::get('/reset-password/{token?}', [PasswordResetOtpController::class, 'showReset'])->name('password.reset');
    Route::post('/reset-password', [PasswordResetOtpController::class, 'resetPassword'])->name('password.update');

    // Passkey / Biometric WebAuthn Authentication
    Route::get('/auth/passkey/challenge', [PasskeyController::class, 'challenge'])->name('auth.passkey.challenge');
    Route::post('/auth/passkey/verify', [PasskeyController::class, 'verify'])->name('auth.passkey.verify');
});

// Authenticated Routes
Route::middleware('auth')->group(function () {
    // Admin Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    Route::get('/auth/passkey/register-options', [PasskeyController::class, 'registerOptions'])->name('auth.passkey.register-options');
    Route::post('/auth/passkey/register', [PasskeyController::class, 'registerPasskey'])->name('auth.passkey.register');
});
