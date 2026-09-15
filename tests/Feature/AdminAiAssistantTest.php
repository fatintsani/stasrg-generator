<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Researcher;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAiAssistantTest extends TestCase
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

    public function test_guest_cannot_access_admin_ai_assistant(): void
    {
        $response = $this->get('/ai-assistant');
        $response->assertRedirect('/login');
    }

    public function test_admin_can_access_ai_assistant_page(): void
    {
        Project::factory()->create(['status' => 'published']);
        Researcher::create([
            'name' => 'Dr. Jane Doe',
            'role' => 'Principal Investigator',
            'identifier' => '0412345678',
            'created_by' => $this->admin->id,
        ]);
        SupportTicket::create([
            'ticket_number' => 'STAS-2026-TEST01',
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'category' => 'general',
            'priority' => 'urgent',
            'subject' => 'Kendala Sistem',
            'message' => 'Pesan bantuan dari pengguna.',
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->admin)->get('/ai-assistant');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/AiAssistant/Index')
            ->has('stats')
            ->has('aiConfig')
            ->has('categories')
            ->has('researchersCount')
        );
    }

    public function test_admin_can_send_chat_message(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/ai-assistant/chat', [
            'message' => 'Halo NARA, berikan ringkasan data proyek.',
            'language' => 'id',
            'mode' => 'all_data',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'reply',
            'mode',
            'has_attachment',
            'timestamp',
        ]);
        $this->assertEquals('success', $response->json('status'));
    }

    public function test_chat_requires_message_or_attachment(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/ai-assistant/chat', [
            'message' => '',
        ]);

        $response->assertStatus(422);
    }

    public function test_admin_can_send_chat_with_stringified_history(): void
    {
        $historyJson = json_encode([
            ['role' => 'user', 'content' => 'Halo'],
            ['role' => 'assistant', 'content' => 'Halo! Ada yang bisa saya bantu?'],
        ]);

        $response = $this->actingAs($this->admin)->post('/ai-assistant/chat', [
            'message' => 'Lanjutkan penjelasan sebelumnya.',
            'history' => $historyJson,
            'language' => 'id',
            'mode' => 'all_data',
        ], ['Accept' => 'application/json']);

        $response->assertStatus(200);
        $this->assertEquals('success', $response->json('status'));
    }
}
