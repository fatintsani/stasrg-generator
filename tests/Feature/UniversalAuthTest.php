<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UniversalAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_general_email(): void
    {
        $payload = [
            'name' => 'John Doe',
            'username' => 'johndoe',
            'email' => 'johndoe@gmail.com', // Universal / Gmail
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'agree' => true,
        ];

        $response = $this->post('/register', $payload);

        $response->assertRedirect('/login');
        $response->assertSessionHas('status');

        $this->assertDatabaseHas('users', [
            'name' => 'John Doe',
            'username' => 'johndoe',
            'email' => 'johndoe@gmail.com',
            'status' => User::STATUS_PENDING,
            'role' => 'admin',
        ]);

        $this->assertGuest();
    }

    public function test_pending_user_cannot_login(): void
    {
        $user = User::factory()->pending()->create([
            'email' => 'pending@gmail.com',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->post('/login', [
            'email' => 'pending@gmail.com',
            'password' => 'secret123',
        ]);

        $response->assertSessionHasErrors([
            'email' => 'Akun Anda masih menunggu persetujuan admin.',
        ]);

        $this->assertGuest();
    }

    public function test_rejected_user_cannot_login(): void
    {
        $user = User::factory()->rejected('Dokumen tidak valid')->create([
            'email' => 'rejected@yahoo.com',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->post('/login', [
            'email' => 'rejected@yahoo.com',
            'password' => 'secret123',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_inactive_user_cannot_login(): void
    {
        $user = User::factory()->inactive()->create([
            'email' => 'inactive@domain.com',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->post('/login', [
            'email' => 'inactive@domain.com',
            'password' => 'secret123',
        ]);

        $response->assertSessionHasErrors([
            'email' => 'Akun Anda telah dinonaktifkan oleh admin.',
        ]);

        $this->assertGuest();
    }

    public function test_approved_user_can_login_with_email(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@gmail.com',
            'password' => Hash::make('secret123'),
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        $response = $this->post('/login', [
            'email' => 'admin@gmail.com',
            'password' => 'secret123',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
    }

    public function test_approved_user_can_login_with_username(): void
    {
        $user = User::factory()->create([
            'username' => 'superadmin',
            'email' => 'superadmin@gmail.com',
            'password' => Hash::make('secret123'),
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        $response = $this->post('/login', [
            'email' => 'superadmin',
            'password' => 'secret123',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
    }

    public function test_admin_can_approve_pending_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => User::STATUS_APPROVED]);
        $pendingUser = User::factory()->pending()->create();

        $response = $this->actingAs($admin)->post("/users/{$pendingUser->id}/approve");

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $pendingUser->id,
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);
    }

    public function test_admin_can_reject_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => User::STATUS_APPROVED]);
        $pendingUser = User::factory()->pending()->create();

        $response = $this->actingAs($admin)->post("/users/{$pendingUser->id}/reject", [
            'reason' => 'Data tidak lengkap.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $pendingUser->id,
            'status' => User::STATUS_REJECTED,
            'rejection_reason' => 'Data tidak lengkap.',
        ]);
    }

    public function test_admin_can_toggle_user_active_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => User::STATUS_APPROVED]);
        $targetUser = User::factory()->create(['status' => User::STATUS_APPROVED]);

        // Toggle to inactive
        $response = $this->actingAs($admin)->post("/users/{$targetUser->id}/toggle-status");
        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'status' => User::STATUS_INACTIVE,
        ]);

        // Toggle back to approved
        $response = $this->actingAs($admin)->post("/users/{$targetUser->id}/toggle-status");
        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'status' => User::STATUS_APPROVED,
        ]);
    }

    public function test_admin_can_view_user_management_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => User::STATUS_APPROVED]);
        User::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get('/users');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Index')
            ->has('users.data')
            ->has('stats')
        );
    }
}
