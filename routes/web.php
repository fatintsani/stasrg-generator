<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\PasskeyController;
use App\Http\Controllers\Auth\PasswordResetOtpController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MediaAssetController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectTemplateController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SupportTicketController;
use App\Http\Controllers\UserController;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

// Landing & Legal Pages
Route::get('/', function () {
    $publishedProjects = [];

    if (Schema::hasTable('projects')) {
        $publishedProjects = Project::where('status', 'published')
            ->latest()
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'slug' => $project->slug,
                    'category' => $project->category ?? 'General',
                    'title' => $project->title,
                    'subtitle' => $project->subtitle,
                    'description' => $project->description,
                    'main_image' => $project->main_image ? asset('storage/'.$project->main_image) : null,
                    'benefits' => $project->benefits,
                    'specifications' => $project->specifications,
                    'problem_solution' => $project->problem_solution,
                    'project_url' => $project->project_url,
                    'qr_code_path' => $project->qr_code_path ? asset('storage/'.$project->qr_code_path) : null,
                    'partner_logo' => $project->partner_logo ? asset('storage/'.$project->partner_logo) : null,
                    'partner_logos' => ! empty($project->partner_logos) && is_array($project->partner_logos)
                        ? array_map(fn ($p) => str_starts_with($p, 'http') ? $p : asset('storage/'.$p), $project->partner_logos)
                        : ($project->partner_logo ? [asset('storage/'.$project->partner_logo)] : []),
                    'footer_website' => $project->footer_website,
                    'footer_instagram' => $project->footer_instagram,
                    'footer_youtube' => $project->footer_youtube,
                    'layout_preset' => $project->layout_preset ?? 'balanced',
                    'status' => $project->status,
                    'created_at' => $project->created_at->format('d M Y'),
                    'updated_at' => $project->updated_at->format('d M Y'),
                ];
            });
    }

    $stats = [
        'total_projects' => 0,
        'published_projects' => 0,
        'categories_count' => 0,
        'total_users' => 0,
    ];

    if (Schema::hasTable('projects')) {
        $stats['total_projects'] = Project::count();
        $stats['published_projects'] = Project::where('status', 'published')->count();
        $stats['categories_count'] = Project::distinct('category')->whereNotNull('category')->where('category', '!=', '')->count('category') ?: 1;
    }

    if (Schema::hasTable('users')) {
        $stats['total_users'] = User::count();
    }

    return Inertia::render('Welcome', [
        'publishedProjects' => $publishedProjects,
        'stats' => $stats,
    ]);
})->name('home');

// Public Project Detail Page for Published Projects
Route::get('/showcase/{project:slug}', [ProjectController::class, 'publicShow'])->name('projects.showcase.show');
Route::get('/riset/{project:slug}', [ProjectController::class, 'publicShow'])->name('projects.riset.show');

// Public QR Code Scan Tracking Gateway & Redirect
Route::get('/qr/{project:slug}', [AnalyticsController::class, 'trackQr'])->name('qr.track');

// Public Tracking for Export / Print actions
Route::post('/activity-logs/track-export', [ActivityLogController::class, 'trackExport'])
    ->middleware('throttle:30,1')
    ->name('activity-logs.track-export');

Route::get('/privacy', function () {
    return Inertia::render('Privacy');
})->name('privacy');

Route::get('/terms', function () {
    return Inertia::render('Terms');
})->name('terms');

// Public Support & Helpdesk Page and Submission
Route::get('/support', function () {
    return Inertia::render('Support');
})->name('support');

// Public Documentation Page
Route::get('/documentation', function () {
    return Inertia::render('Documentation');
})->name('documentation');

Route::post('/support/submit', [SupportTicketController::class, 'submit'])
    ->middleware('throttle:10,1')
    ->name('support.submit');

// Guest Authentication Routes
Route::middleware('guest')->group(function () {
    // Login
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('login.store');

    // Register / Create User
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('register.store');

    // Google OAuth
    Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');
    Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

    // Forgot Password & Mailpit OTP
    Route::get('/forgot-password', [PasswordResetOtpController::class, 'create'])->name('password.request');
    Route::post('/forgot-password/send-otp', [PasswordResetOtpController::class, 'sendOtp'])
        ->middleware('throttle:5,1')
        ->name('password.send-otp');
    Route::post('/forgot-password/verify-otp', [PasswordResetOtpController::class, 'verifyOtp'])
        ->middleware('throttle:10,1')
        ->name('password.verify-otp');

    // Reset Password
    Route::get('/reset-password/{token?}', [PasswordResetOtpController::class, 'showReset'])->name('password.reset');
    Route::post('/reset-password', [PasswordResetOtpController::class, 'resetPassword'])
        ->middleware('throttle:5,1')
        ->name('password.update');

    // Passkey / Biometric WebAuthn Authentication
    Route::get('/auth/passkey/challenge', [PasskeyController::class, 'challenge'])->name('auth.passkey.challenge');
    Route::post('/auth/passkey/verify', [PasskeyController::class, 'verify'])
        ->middleware('throttle:10,1')
        ->name('auth.passkey.verify');
});

// Authenticated & Approved Routes
Route::middleware(['auth', 'approved'])->group(function () {
    // Admin Dashboard & Global Search
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/search/global', [DashboardController::class, 'globalSearch'])->name('admin.global-search');

    // Project Management
    Route::resource('projects', ProjectController::class);
    Route::post('/projects/{project}/duplicate', [ProjectController::class, 'duplicate'])->name('projects.duplicate');
    Route::post('/projects/ai-generate', [ProjectController::class, 'aiGenerateProject'])->name('projects.ai-generate');
    Route::post('/projects/ai-section', [ProjectController::class, 'aiPolishSection'])->name('projects.ai-section');
    Route::post('/projects/ai-translate', [ProjectController::class, 'aiTranslateProject'])->name('projects.ai-translate');

    // Project Template Management & Custom Template Builder
    Route::resource('templates', ProjectTemplateController::class);
    Route::post('/templates/{template}/duplicate', [ProjectTemplateController::class, 'duplicate'])->name('templates.duplicate');
    Route::post('/templates/save-from-project', [ProjectTemplateController::class, 'saveFromProject'])->name('templates.save-from-project');
    Route::get('/api/templates', [ProjectTemplateController::class, 'apiList'])->name('api.templates.index');

    // User & Approval Management
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::post('/users/{user}/approve', [UserController::class, 'approve'])->name('users.approve');
    Route::post('/users/{user}/reject', [UserController::class, 'reject'])->name('users.reject');
    Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    // Activity & Audit Logs
    Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
    Route::get('/activity-logs/export-csv', [ActivityLogController::class, 'exportCsv'])->name('activity-logs.export-csv');
    Route::post('/activity-logs/prune', [ActivityLogController::class, 'destroyOld'])->name('activity-logs.prune');

    // Analytics & Insights
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
    Route::get('/analytics/export-csv', [AnalyticsController::class, 'exportCsv'])->name('analytics.export-csv');

    // Media & Asset Library (Verified Partner Logos & Icon Bank)
    Route::get('/media-library', [MediaAssetController::class, 'index'])->name('media-assets.index');
    Route::post('/media-library', [MediaAssetController::class, 'store'])->name('media-assets.store');
    Route::match(['put', 'post'], '/media-library/{mediaAsset}', [MediaAssetController::class, 'update'])->name('media-assets.update');
    Route::delete('/media-library/{mediaAsset}', [MediaAssetController::class, 'destroy'])->name('media-assets.destroy');
    Route::get('/api/media-assets', [MediaAssetController::class, 'apiList'])->name('api.media-assets.index');

    // Support & Helpdesk Tickets
    Route::get('/support-tickets', [SupportTicketController::class, 'index'])->name('support-tickets.index');
    Route::get('/support-tickets/export-csv', [SupportTicketController::class, 'exportCsv'])->name('support-tickets.export-csv');
    Route::get('/support-tickets/{ticket}', [SupportTicketController::class, 'show'])->name('support-tickets.show');
    Route::put('/support-tickets/{ticket}', [SupportTicketController::class, 'update'])->name('support-tickets.update');
    Route::delete('/support-tickets/{ticket}', [SupportTicketController::class, 'destroy'])->name('support-tickets.destroy');

    // Settings & Configuration
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::post('/settings/profile', [SettingsController::class, 'updateProfile'])->name('settings.profile.update');
    Route::post('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password.update');
    Route::post('/settings/font', [SettingsController::class, 'updateAppFont'])->name('settings.font.update');
    Route::post('/settings/ai', [SettingsController::class, 'updateAiSettings'])->name('settings.ai.update');
    Route::post('/settings/ai/test', [SettingsController::class, 'testAiConnection'])->name('settings.ai.test');
    Route::post('/settings/maintenance/toggle', [SettingsController::class, 'toggleMaintenance'])->name('settings.maintenance.toggle');
    Route::post('/settings/maintenance/clear-cache', [SettingsController::class, 'clearCache'])->name('settings.maintenance.clear-cache');
    Route::post('/settings/maintenance/optimize', [SettingsController::class, 'optimizeSystem'])->name('settings.maintenance.optimize');
    Route::delete('/settings/avatar', [SettingsController::class, 'removeAvatar'])->name('settings.avatar.destroy');

    // Account & Passkey
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    Route::get('/auth/passkey/register-options', [PasskeyController::class, 'registerOptions'])->name('auth.passkey.register-options');
    Route::post('/auth/passkey/register', [PasskeyController::class, 'registerPasskey'])->name('auth.passkey.register');
    Route::delete('/auth/passkey/{passkey}', [PasskeyController::class, 'destroyPasskey'])->name('auth.passkey.destroy');
});
