<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_users_list(): void
    {
        $admin = User::factory()->create([
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin)->get('/users');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Index')
            ->has('users.data')
            ->has('stats')
        );
    }

    public function test_admin_can_create_new_approved_user(): void
    {
        $admin = User::factory()->create([
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin)->post('/users', [
            'name' => 'Dr. Budi Santoso',
            'username' => 'budisantoso',
            'email' => 'budi.santoso@telkomuniversity.ac.id',
            'password' => 'secretPass123',
            'role' => 'admin',
            'status' => 'approved',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'email' => 'budi.santoso@telkomuniversity.ac.id',
            'username' => 'budisantoso',
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        $newUser = User::where('email', 'budi.santoso@telkomuniversity.ac.id')->first();
        $this->assertNotNull($newUser);
        $this->assertTrue(Hash::check('secretPass123', $newUser->password));
        $this->assertNotNull($newUser->approved_at);
    }

    public function test_admin_cannot_create_user_with_duplicate_email(): void
    {
        $admin = User::factory()->create([
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
            'email' => 'existing@telkomuniversity.ac.id',
        ]);

        $response = $this->actingAs($admin)->post('/users', [
            'name' => 'Clone User',
            'username' => 'cloneuser',
            'email' => 'existing@telkomuniversity.ac.id',
            'password' => 'secretPass123',
            'role' => 'admin',
            'status' => 'approved',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_admin_can_approve_pending_user(): void
    {
        $admin = User::factory()->create([
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        $pendingUser = User::factory()->create([
            'status' => User::STATUS_PENDING,
            'role' => 'user',
        ]);

        $response = $this->actingAs($admin)->post("/users/{$pendingUser->id}/approve");

        $response->assertRedirect();
        $pendingUser->refresh();

        $this->assertEquals(User::STATUS_APPROVED, $pendingUser->status);
        $this->assertEquals('admin', $pendingUser->role);
        $this->assertNotNull($pendingUser->approved_at);
    }

    public function test_admin_can_toggle_user_status(): void
    {
        $admin = User::factory()->create([
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        $otherUser = User::factory()->create([
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin)->post("/users/{$otherUser->id}/toggle-status");
        $response->assertRedirect();
        $otherUser->refresh();
        $this->assertEquals(User::STATUS_INACTIVE, $otherUser->status);

        $response = $this->actingAs($admin)->post("/users/{$otherUser->id}/toggle-status");
        $response->assertRedirect();
        $otherUser->refresh();
        $this->assertEquals(User::STATUS_APPROVED, $otherUser->status);
    }

    public function test_admin_cannot_delete_themselves(): void
    {
        $admin = User::factory()->create([
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin)->delete("/users/{$admin->id}");
        $response->assertSessionHasErrors('error');
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }
}
