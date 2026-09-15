<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class PublicAiChatTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_ai_chat_validates_required_message(): void
    {
        $response = $this->postJson('/api/ai/public-chat', [
            'message' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }

    public function test_public_ai_chat_accepts_valid_message_and_returns_json(): void
    {
        $response = $this->postJson('/api/ai/public-chat', [
            'message' => 'Apa fokus riset di CoE STAS-RG Telkom University?',
            'language' => 'id',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'reply',
                'timestamp',
            ])
            ->assertJson([
                'status' => 'success',
            ]);

        $this->assertNotEmpty($response->json('reply'));
    }

    public function test_public_ai_chat_supports_english_language_and_history(): void
    {
        $response = $this->postJson('/api/ai/public-chat', [
            'message' => 'Can you tell me about the research domains?',
            'language' => 'en',
            'history' => [
                ['role' => 'user', 'content' => 'Hello'],
                ['role' => 'assistant', 'content' => 'Hello, I am CoE STAS-RG AI Assistant.'],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'reply',
                'timestamp',
            ]);
    }

    public function test_public_ai_chat_supports_specialized_modes(): void
    {
        $modes = ['general', 'research', 'document', 'partner'];

        foreach ($modes as $mode) {
            $response = $this->postJson('/api/ai/public-chat', [
                'message' => "Testing in mode {$mode}",
                'mode' => $mode,
                'language' => 'id',
            ]);

            $response->assertStatus(200)
                ->assertJson([
                    'status' => 'success',
                    'mode' => $mode,
                ]);
        }
    }

    public function test_public_ai_chat_supports_file_attachment_upload(): void
    {
        $file = UploadedFile::fake()->create('dokumen_riset.txt', 10, 'text/plain');

        $response = $this->post('/api/ai/public-chat', [
            'message' => 'Analisis berkas berikut',
            'attachment' => $file,
            'language' => 'id',
        ], ['Accept' => 'application/json']);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'has_attachment' => true,
            ]);
    }

    public function test_public_ai_chat_supports_base64_attachment(): void
    {
        $response = $this->postJson('/api/ai/public-chat', [
            'message' => 'Analisis gambar arsitektur ini',
            'attachment_base64' => 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'attachment_mime' => 'image/png',
            'attachment_name' => 'diagram.png',
            'language' => 'id',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'has_attachment' => true,
            ]);
    }

    public function test_nara_page_is_accessible(): void
    {
        $response = $this->get('/nara');
        $response->assertStatus(200);

        $responseAlias = $this->get('/kenalan-nara');
        $responseAlias->assertStatus(200);
    }
}
