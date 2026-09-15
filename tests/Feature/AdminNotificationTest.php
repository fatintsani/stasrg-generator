<?php

namespace Tests\Feature;

use App\Models\AdminNotification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);
    }

    public function test_guest_cannot_access_notifications(): void
    {
        $response = $this->getJson(route('admin.notifications.index'));
        $response->assertUnauthorized();
    }

    public function test_authenticated_admin_can_fetch_notifications(): void
    {
        AdminNotification::create([
            'user_id' => null,
            'type' => 'ticket',
            'title' => 'Tiket Uji Coba #101',
            'message' => 'Pesan tiket uji coba',
            'action_url' => '/support-tickets/1',
            'icon' => 'LifeBuoy',
            'level' => 'warning',
        ]);

        $response = $this->actingAs($this->admin)->getJson(route('admin.notifications.index'));

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'type', 'title', 'message', 'action_url', 'icon', 'level', 'is_read', 'time_ago'],
                ],
                'counts' => ['total', 'unread', 'ticket', 'user', 'system'],
            ])
            ->assertJsonPath('counts.unread', 1)
            ->assertJsonPath('counts.total', 1);
    }

    public function test_admin_can_mark_notification_as_read(): void
    {
        $notification = AdminNotification::create([
            'user_id' => null,
            'type' => 'system',
            'title' => 'Pemberitahuan Sistem',
            'message' => 'Sistem telah diperbarui',
            'icon' => 'Bell',
            'level' => 'info',
        ]);

        $this->assertNull($notification->read_at);

        $response = $this->actingAs($this->admin)->postJson(route('admin.notifications.read', $notification->id));

        $response->assertOk()->assertJson(['success' => true]);

        $notification->refresh();
        $this->assertNotNull($notification->read_at);
    }

    public function test_admin_can_mark_all_notifications_as_read(): void
    {
        AdminNotification::create([
            'type' => 'ticket',
            'title' => 'Tiket 1',
            'message' => 'Pesan 1',
        ]);
        AdminNotification::create([
            'type' => 'user',
            'title' => 'User 1',
            'message' => 'Pesan 2',
        ]);

        $this->assertEquals(2, AdminNotification::unread()->count());

        $response = $this->actingAs($this->admin)->postJson(route('admin.notifications.mark-all-read'));

        $response->assertOk()->assertJson(['success' => true]);
        $this->assertEquals(0, AdminNotification::unread()->count());
    }

    public function test_admin_can_delete_notification(): void
    {
        $notification = AdminNotification::create([
            'type' => 'system',
            'title' => 'Notif Hapus',
            'message' => 'Isi',
        ]);

        $response = $this->actingAs($this->admin)->deleteJson(route('admin.notifications.destroy', $notification->id));

        $response->assertOk()->assertJson(['success' => true]);
        $this->assertDatabaseMissing('admin_notifications', ['id' => $notification->id]);
    }

    public function test_admin_can_clear_all_notifications(): void
    {
        AdminNotification::create(['type' => 'system', 'title' => 'N1', 'message' => 'M1']);
        AdminNotification::create(['type' => 'ticket', 'title' => 'N2', 'message' => 'M2']);

        $response = $this->actingAs($this->admin)->deleteJson(route('admin.notifications.clear-all'));

        $response->assertOk()->assertJson(['success' => true]);
        $this->assertEquals(0, AdminNotification::count());
    }

    public function test_live_pending_user_generates_notification(): void
    {
        User::factory()->create([
            'name' => 'Fatin Peneliti',
            'email' => 'fatin.peneliti@example.com',
            'status' => User::STATUS_PENDING,
        ]);

        $response = $this->actingAs($this->admin)->getJson(route('admin.notifications.index'));

        $response->assertOk();
        $this->assertGreaterThanOrEqual(1, $response->json('counts.user'));
        $this->assertDatabaseHas('admin_notifications', [
            'type' => 'user',
        ]);
    }
}
