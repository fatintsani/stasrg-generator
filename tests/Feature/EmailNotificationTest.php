<?php

namespace Tests\Feature;

use App\Mail\AccountApprovedMail;
use App\Mail\AccountRejectedMail;
use App\Mail\AccountStatusChangedMail;
use App\Mail\AdminNewUserAlertMail;
use App\Mail\LoginNotificationMail;
use App\Mail\PasswordChangedMail;
use App\Mail\PasswordResetOtpMail;
use App\Mail\ProfileUpdatedMail;
use App\Mail\ProjectNotificationMail;
use App\Mail\UserRegisteredMail;
use App\Models\PasswordResetOtp;
use App\Models\Project;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EmailNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_sends_user_and_admin_notification_emails(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'email' => 'superadmin@telkomuniversity.ac.id',
            'role' => 'superadmin',
            'status' => User::STATUS_APPROVED,
        ]);

        $payload = [
            'name' => 'Fatin Researcher',
            'username' => 'fatin_res',
            'email' => 'fatin.res@gmail.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'agree' => true,
        ];

        $response = $this->post('/register', $payload);
        $response->assertRedirect('/login');

        Mail::assertSent(UserRegisteredMail::class, function ($mail) {
            return $mail->hasTo('fatin.res@gmail.com');
        });

        Mail::assertSent(AdminNewUserAlertMail::class, function ($mail) use ($admin) {
            return $mail->hasTo($admin->email);
        });
    }

    public function test_account_approval_sends_approved_email(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'role' => 'superadmin',
            'status' => User::STATUS_APPROVED,
        ]);

        $user = User::factory()->pending()->create([
            'email' => 'newuser@telkomuniversity.ac.id',
        ]);

        $this->actingAs($admin)
            ->post("/users/{$user->id}/approve");

        Mail::assertSent(AccountApprovedMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    public function test_account_rejection_sends_rejection_email(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'role' => 'superadmin',
            'status' => User::STATUS_APPROVED,
        ]);

        $user = User::factory()->pending()->create([
            'email' => 'rejecteduser@telkomuniversity.ac.id',
        ]);

        $this->actingAs($admin)
            ->post("/users/{$user->id}/reject", [
                'reason' => 'Bukan anggota lab STAS-RG.',
            ]);

        Mail::assertSent(AccountRejectedMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email) && $mail->reason === 'Bukan anggota lab STAS-RG.';
        });
    }

    public function test_account_toggle_status_sends_status_changed_email(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'role' => 'superadmin',
            'status' => User::STATUS_APPROVED,
        ]);

        $user = User::factory()->create([
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        $this->actingAs($admin)
            ->post("/users/{$user->id}/toggle-status");

        Mail::assertSent(AccountStatusChangedMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email) && $mail->status === 'inactive';
        });
    }

    public function test_password_reset_otp_and_password_changed_emails(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'member@telkomuniversity.ac.id',
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        // 1. Request OTP
        $otpResponse = $this->postJson('/forgot-password/send-otp', [
            'email' => $user->email,
        ]);
        $otpResponse->assertOk();

        Mail::assertSent(PasswordResetOtpMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });

        // Setup verified reset token
        $otpRecord = PasswordResetOtp::where('email', $user->email)->first();
        $resetToken = 'sample_valid_reset_token_123456';
        $otpRecord->update([
            'reset_token' => $resetToken,
            'is_verified' => true,
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);

        // 2. Perform password reset
        $resetResponse = $this->post('/reset-password', [
            'token' => $resetToken,
            'email' => $user->email,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);
        $resetResponse->assertRedirect('/login');

        Mail::assertSent(PasswordChangedMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    public function test_successful_login_sends_login_notification_email(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'loginuser@telkomuniversity.ac.id',
            'password' => Hash::make('secret123'),
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'secret123',
        ]);

        $response->assertRedirect('/dashboard');

        Mail::assertSent(LoginNotificationMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    public function test_project_lifecycle_events_send_project_notification_email(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'projectlead@telkomuniversity.ac.id',
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        // 1. Create Project
        $response = $this->actingAs($user)->post('/projects', [
            'name' => 'IoT Water Monitoring',
            'title' => 'SISTEM MONITORING KUALITAS AIR',
            'category' => 'IoT & Smart Farming',
            'status' => 'draft',
        ]);

        $project = Project::where('name', 'IoT Water Monitoring')->first();
        $this->assertNotNull($project);

        Mail::assertSent(ProjectNotificationMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email) && $mail->eventType === 'created';
        });

        // 2. Update Project to Published
        $updateResponse = $this->actingAs($user)->put(route('projects.update', $project), [
            'name' => 'IoT Water Monitoring',
            'title' => 'SISTEM MONITORING KUALITAS AIR',
            'category' => 'IoT & Smart Farming',
            'status' => 'published',
        ]);
        $updateResponse->assertSessionHasNoErrors();
        $updateResponse->assertRedirect();

        Mail::assertSent(ProjectNotificationMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email) && $mail->eventType === 'published';
        });

        // 3. Duplicate Project
        $this->actingAs($user)->post(route('projects.duplicate', $project));

        Mail::assertSent(ProjectNotificationMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email) && $mail->eventType === 'duplicated';
        });

        // 4. Delete Project
        $this->actingAs($user)->delete(route('projects.destroy', $project));

        Mail::assertSent(ProjectNotificationMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email) && $mail->eventType === 'deleted';
        });
    }

    public function test_profile_update_sends_profile_updated_email(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'profileuser@telkomuniversity.ac.id',
            'name' => 'Old Name',
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        $this->actingAs($user)->post('/settings/profile', [
            'name' => 'New Name',
            'username' => 'new_username',
        ]);

        Mail::assertSent(ProfileUpdatedMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }
}
