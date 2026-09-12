<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\PasswordChangedMail;
use App\Mail\PasswordResetOtpMail;
use App\Models\PasswordResetOtp;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetOtpController extends Controller
{
    /**
     * Display the forgot password view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    /**
     * Send 6-digit OTP code to the requested academic email.
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = strtolower($request->email);

        // Verify if user exists
        $user = User::where('email', $email)->first();
        if (! $user) {
            throw ValidationException::withMessages([
                'email' => 'Email ini tidak terdaftar dalam sistem.',
            ]);
        }

        if ($user->isPending()) {
            throw ValidationException::withMessages([
                'email' => 'Akun Anda masih menunggu persetujuan admin.',
            ]);
        }

        if ($user->isRejected()) {
            $reason = $user->rejection_reason ? ' Alasan: '.$user->rejection_reason : '';
            throw ValidationException::withMessages([
                'email' => 'Akun Anda telah ditolak oleh admin.'.$reason,
            ]);
        }

        if ($user->isInactive()) {
            throw ValidationException::withMessages([
                'email' => 'Akun Anda telah dinonaktifkan oleh admin.',
            ]);
        }

        // Generate 6 digit random OTP code
        $otpCode = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        // Invalidate previous OTPs for this email
        PasswordResetOtp::where('email', $email)->delete();

        // Save new OTP with 15 minutes expiration
        PasswordResetOtp::create([
            'email' => $email,
            'otp_code' => $otpCode,
            'is_verified' => false,
            'expires_at' => Carbon::now()->addMinutes(15),
        ]);

        // Send Email via Mailpit
        try {
            Mail::to($email)->send(new PasswordResetOtpMail($otpCode, $email));
        } catch (Exception $e) {
            // Log mail exception if any
            report($e);
        }

        return response()->json([
            'success' => true,
            'message' => 'Kode OTP pemulihan telah dikirim ke email Anda.',
            'email' => $email,
        ]);
    }

    /**
     * Verify the 6-digit OTP code and issue a reset token.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $email = strtolower($request->email);
        $otpCode = $request->otp;

        $record = PasswordResetOtp::where('email', $email)
            ->where('otp_code', $otpCode)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (! $record) {
            throw ValidationException::withMessages([
                'otp' => 'Kode OTP salah atau telah kedaluwarsa.',
            ]);
        }

        // Generate secure reset token
        $resetToken = Str::random(60);
        $record->update([
            'reset_token' => $resetToken,
            'is_verified' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kode OTP berhasil diverifikasi.',
            'reset_token' => $resetToken,
            'redirect_url' => route('password.reset', ['token' => $resetToken, 'email' => $email]),
        ]);
    }

    /**
     * Display the reset password view with token.
     */
    public function showReset(Request $request, ?string $token = null): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token ?? $request->token,
            'email' => $request->email,
        ]);
    }

    /**
     * Reset the user password using verified reset token.
     */
    public function resetPassword(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $email = strtolower($request->email);

        // Verify token in database
        $otpRecord = PasswordResetOtp::where('email', $email)
            ->where('reset_token', $request->token)
            ->where('is_verified', true)
            ->where('expires_at', '>', Carbon::now()->subHours(1))
            ->first();

        if (! $otpRecord) {
            throw ValidationException::withMessages([
                'email' => 'Sesi pemulihan kata sandi tidak valid atau telah kedaluwarsa.',
            ]);
        }

        // Update User Password
        $user = User::where('email', $email)->first();
        if ($user) {
            $user->forceFill([
                'password' => Hash::make($request->password),
                'remember_token' => Str::random(60),
            ])->save();

            try {
                Mail::to($user->email)->send(new PasswordChangedMail($user, $request->ip()));
            } catch (\Throwable $e) {
                report($e);
            }
        }

        // Delete used OTP
        $otpRecord->delete();

        return redirect()->route('login')->with('status', 'Kata sandi Anda telah berhasil diperbarui!');
    }
}
