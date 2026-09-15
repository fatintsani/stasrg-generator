<?php

namespace Tests\Feature;

use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SettingsControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_settings_page(): void
    {
        $user = User::factory()->create([
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        $response = $this->actingAs($user)->get('/settings');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Settings')
            ->where('user.id', $user->id)
            ->where('user.name', $user->name)
            ->has('systemInfo')
        );
    }

    public function test_user_can_update_profile_name(): void
    {
        $user = User::factory()->create([
            'name' => 'Original Name',
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        $response = $this->actingAs($user)->post('/settings/profile', [
            'name' => 'Fatin Muflihuts Tsani',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Fatin Muflihuts Tsani',
        ]);
    }

    public function test_user_can_update_profile_avatar(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        $file = UploadedFile::fake()->image('avatar.jpg');

        $response = $this->actingAs($user)->post('/settings/profile', [
            'name' => 'New Name With Avatar',
            'avatar' => $file,
        ]);

        $response->assertRedirect();
        $user->refresh();

        $this->assertNotNull($user->avatar);
        Storage::disk('public')->assertExists($user->avatar);
    }

    public function test_user_can_remove_avatar(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'status' => User::STATUS_APPROVED,
            'avatar' => 'avatars/sample.jpg',
        ]);

        Storage::disk('public')->put('avatars/sample.jpg', 'dummy');

        $response = $this->actingAs($user)->delete('/settings/avatar');

        $response->assertRedirect();
        $user->refresh();

        $this->assertNull($user->avatar);
        Storage::disk('public')->assertMissing('avatars/sample.jpg');
    }

    public function test_user_can_update_password_with_valid_current_password(): void
    {
        $user = User::factory()->create([
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
            'password' => Hash::make('oldpassword123'),
        ]);

        $response = $this->actingAs($user)->post('/settings/password', [
            'current_password' => 'oldpassword123',
            'password' => 'newSecretPassword123',
            'password_confirmation' => 'newSecretPassword123',
        ]);

        $response->assertRedirect();
        $user->refresh();

        $this->assertTrue(Hash::check('newSecretPassword123', $user->password));
    }

    public function test_user_cannot_update_password_with_incorrect_current_password(): void
    {
        $user = User::factory()->create([
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
            'password' => Hash::make('oldpassword123'),
        ]);

        $response = $this->actingAs($user)->post('/settings/password', [
            'current_password' => 'wrongpassword',
            'password' => 'newSecretPassword123',
            'password_confirmation' => 'newSecretPassword123',
        ]);

        $response->assertSessionHasErrors('current_password');
        $user->refresh();

        $this->assertTrue(Hash::check('oldpassword123', $user->password));
    }

    public function test_user_cannot_update_password_with_mismatched_confirmation(): void
    {
        $user = User::factory()->create([
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
            'password' => Hash::make('oldpassword123'),
        ]);

        $response = $this->actingAs($user)->post('/settings/password', [
            'current_password' => 'oldpassword123',
            'password' => 'newSecretPassword123',
            'password_confirmation' => 'differentPassword123',
        ]);

        $response->assertSessionHasErrors('password');
        $user->refresh();

        $this->assertTrue(Hash::check('oldpassword123', $user->password));
    }

    public function test_user_can_toggle_maintenance_mode(): void
    {
        $user = User::factory()->create([
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        // Ensure system starts online
        Artisan::call('up');
        $this->assertFalse(app()->isDownForMaintenance());

        // Toggle to down
        $response = $this->actingAs($user)->post('/settings/maintenance/toggle');
        $response->assertRedirect();
        $this->assertTrue(app()->isDownForMaintenance());

        // Toggle back to up
        $response = $this->actingAs($user)->post('/settings/maintenance/toggle');
        $response->assertRedirect();
        $this->assertFalse(app()->isDownForMaintenance());
    }

    public function test_user_can_clear_cache(): void
    {
        $user = User::factory()->create([
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        $response = $this->actingAs($user)->post('/settings/maintenance/clear-cache');
        $response->assertRedirect();
        $response->assertSessionHas('success');
    }

    public function test_user_can_optimize_system(): void
    {
        $user = User::factory()->create([
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        $response = $this->actingAs($user)->post('/settings/maintenance/optimize');
        $response->assertRedirect();
        $response->assertSessionHas('success');
    }

    public function test_user_can_update_app_font(): void
    {
        $user = User::factory()->create([
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        $response = $this->actingAs($user)->post('/settings/font', [
            'app_font' => 'poppins',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertEquals('poppins', SystemSetting::get('app_font'));

        // Test updating back to default
        $response2 = $this->actingAs($user)->post('/settings/font', [
            'app_font' => 'plus-jakarta-sans',
        ]);

        $response2->assertRedirect();
        $this->assertEquals('plus-jakarta-sans', SystemSetting::get('app_font'));
    }

    public function test_user_cannot_update_app_font_with_invalid_value(): void
    {
        $user = User::factory()->create([
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        $response = $this->actingAs($user)->post('/settings/font', [
            'app_font' => 'comic-sans-ms-invalid',
        ]);

        $response->assertSessionHasErrors('app_font');
    }

    public function test_system_settings_are_cached_and_invalidated_on_change(): void
    {
        SystemSetting::set('test_cache_key', 'initial_value');
        $this->assertEquals('initial_value', SystemSetting::get('test_cache_key'));
        $this->assertTrue(Cache::has('system_setting_test_cache_key'));

        // Update setting and verify cache is invalidated and updated
        SystemSetting::set('test_cache_key', 'updated_value');
        $this->assertEquals('updated_value', SystemSetting::get('test_cache_key'));
    }
}
