<?php

namespace Tests\Feature;

use App\Models\SystemSetting;
use App\Models\User;
use App\Services\AiAssistantService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'email' => 'admin@stasrg.com',
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);
    }

    public function test_guest_cannot_access_ai_endpoints(): void
    {
        $this->postJson('/settings/ai', [])->assertUnauthorized();
        $this->postJson('/settings/ai/test', [])->assertUnauthorized();
        $this->postJson('/projects/ai-generate', ['topic' => 'IoT'])->assertUnauthorized();
        $this->postJson('/projects/ai-section', ['section' => 'description', 'text' => 'sample'])->assertUnauthorized();
    }

    public function test_admin_can_save_ai_settings_encrypted(): void
    {
        $response = $this->from('/settings')
            ->actingAs($this->admin)
            ->post('/settings/ai', [
                'ai_provider' => 'gemini',
                'ai_model' => 'gemini-3.6-flash',
                'api_key' => 'AIzaSyFakeTestApiKey1234567890abcdef',
                'custom_endpoint' => null,
            ]);

        $response->assertRedirect('/settings');
        $response->assertSessionHas('success');

        $this->assertSame('gemini', SystemSetting::get('ai_provider'));
        $this->assertSame('gemini-3.6-flash', SystemSetting::get('ai_model'));
        $this->assertSame('AIzaSyFakeTestApiKey1234567890abcdef', SystemSetting::getSecret('ai_api_key'));
    }

    public function test_admin_can_test_ai_connection_successfully(): void
    {
        SystemSetting::setSecret('ai_api_key', 'AIzaSyFakeValidKey123');
        SystemSetting::set('ai_provider', 'gemini');
        SystemSetting::set('ai_model', 'gemini-3.6-flash');

        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'CONNECTED'],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/settings/ai/test', [
                'provider' => 'gemini',
                'model' => 'gemini-3.6-flash',
            ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'provider' => 'Google Gemini AI',
            'model' => 'gemini-3.6-flash',
        ]);
        $this->assertArrayHasKey('latency_ms', $response->json());
    }

    public function test_admin_gets_diagnostic_error_when_api_key_fails(): void
    {
        SystemSetting::setSecret('ai_api_key', 'invalid_key');
        SystemSetting::set('ai_provider', 'gemini');
        SystemSetting::set('ai_model', 'gemini-3.6-flash');

        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'error' => [
                    'code' => 400,
                    'message' => 'API_KEY_INVALID',
                    'status' => 'INVALID_ARGUMENT',
                ],
            ], 400),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/settings/ai/test', [
                'provider' => 'gemini',
                'model' => 'gemini-3.6-flash',
            ]);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
        ]);
        $this->assertArrayHasKey('error', $response->json());
        $this->assertArrayHasKey('hint', $response->json());
    }

    public function test_admin_can_generate_project_with_ai(): void
    {
        SystemSetting::setSecret('ai_api_key', 'AIzaSyFakeValidKey123');
        SystemSetting::set('ai_provider', 'gemini');
        SystemSetting::set('ai_model', 'gemini-3.6-flash');

        $fakeAiPayload = [
            'name' => 'Smart Poultry Monitoring IoT',
            'title' => 'CAGE MONITORING',
            'subtitle' => 'IoT Smart Farm Research',
            'category' => 'Smart Agriculture',
            'description' => '<p>Sistem pemantauan kandang ayam berbasis IoT dengan sensor suhu dan LoRaWAN.</p>',
            'problem_solution' => [
                'title' => 'PROBLEM–SOLUTION',
                'problem' => '<p>Fluktuasi suhu dan kelembaban di kandang ayam sering menyebabkan kematian ternak.</p>',
                'solution' => '<p>Pemasangan sensor cerdas LoRa multi-titik dan automasi blower exhaust.</p>',
            ],
            'benefits' => [
                'title' => 'MANFAAT',
                'content' => '<ul><li>Menurunkan mortalitas ternak hingga 40%</li><li>Efisiensi pemantauan jarak jauh 24/7</li></ul>',
            ],
            'specifications' => [
                'title' => 'SPESIFIKASI',
                'content' => '<ul><li>Sensor SHT31 Suhu & Kelembaban</li><li>Mikrokontroler ESP32 & Modul LoRa SX1276</li></ul>',
            ],
            'layout_preset' => 'balanced',
        ];

        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => json_encode($fakeAiPayload)],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/projects/ai-generate', [
                'topic' => 'Sistem pemantauan kandang ayam IoT LoRa',
                'category' => 'Smart Agriculture',
            ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'data' => [
                'name' => 'Smart Poultry Monitoring IoT',
                'title' => 'CAGE MONITORING',
                'category' => 'Smart Agriculture',
            ],
        ]);
    }

    public function test_admin_can_polish_section_with_ai(): void
    {
        SystemSetting::setSecret('ai_api_key', 'AIzaSyFakeValidKey123');
        SystemSetting::set('ai_provider', 'gemini');
        SystemSetting::set('ai_model', 'gemini-3.6-flash');

        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => '<p>Penerapan arsitektur IoT terdistribusi untuk optimasi iklim mikro peternakan.</p>'],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/projects/ai-section', [
                'section' => 'description',
                'text' => 'Sistem monitoring kandang ayam otomatis untuk memantau suhu',
            ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'section' => 'description',
        ]);
        $this->assertStringContainsString('Penerapan arsitektur IoT', $response->json('polished_text'));
    }

    public function test_admin_can_generate_all_sections_from_description(): void
    {
        SystemSetting::setSecret('ai_api_key', 'AIzaSyFakeValidKey123');
        SystemSetting::set('ai_provider', 'gemini');
        SystemSetting::set('ai_model', 'gemini-3.6-flash');

        $fakeSectionsPayload = [
            'problem' => '<p>Permasalahan mortalitas ayam akibat suhu tinggi.</p>',
            'solution' => '<p>Automasi pendingin berbasis sensor LoRa.</p>',
            'benefits' => '<ul><li>Efisiensi biaya</li></ul>',
            'specifications' => '<ul><li>ESP32 & LoRa SX1276</li></ul>',
        ];

        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => json_encode($fakeSectionsPayload)],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/projects/ai-section', [
                'section' => 'all_sections',
                'context' => [
                    'project_name' => 'Smart Poultry Monitoring',
                    'category' => 'Smart Agriculture',
                    'description' => 'Sistem pemantauan kandang ayam dengan sensor suhu dan LoRaWAN.',
                ],
            ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'section' => 'all_sections',
            'data' => [
                'problem' => '<p>Permasalahan mortalitas ayam akibat suhu tinggi.</p>',
                'solution' => '<p>Automasi pendingin berbasis sensor LoRa.</p>',
            ],
        ]);
    }

    public function test_ai_strictly_limits_and_trims_content_to_fit_a4_layout(): void
    {
        SystemSetting::setSecret('ai_api_key', 'AIzaSyFakeValidKey123');
        SystemSetting::set('ai_provider', 'gemini');
        SystemSetting::set('ai_model', 'gemini-3.6-flash');

        // Simulate excessively long AI responses that would previously trigger A4 overflow warnings
        $oversizedProblem = '<p>'.str_repeat('Permasalahan iklim kandang dan mortalitas yang sangat panjang sekali di seluruh area peternakan. ', 15).'</p>';
        $oversizedBenefits = '<ul>'.str_repeat('<li><strong>Manfaat Sangat Panjang Sekali:</strong> Penjelasan manfaat yang sangat bertele-tele dan melebihi batas ideal layout A4.</li>', 10).'</ul>';

        $fakeSectionsPayload = [
            'problem' => $oversizedProblem,
            'solution' => '<p>Solusi ringkas terapan.</p>',
            'benefits' => $oversizedBenefits,
            'specifications' => '<ul><li>ESP32 Microcontroller</li></ul>',
        ];

        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => json_encode($fakeSectionsPayload)],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/projects/ai-section', [
                'section' => 'all_sections',
                'context' => [
                    'project_name' => 'Smart Poultry Monitoring',
                    'category' => 'Smart Agriculture',
                    'description' => 'Sistem pemantauan kandang ayam.',
                    'layout_preset' => 'balanced',
                ],
            ]);

        $response->assertOk();
        $data = $response->json('data');

        // Plain text length of problem must be <= 210 (balanced limit)
        $problemPlainLen = AiAssistantService::getPlainTextLength($data['problem']);
        $this->assertLessThanOrEqual(210, $problemPlainLen);

        // Plain text length of benefits must be <= 260 (balanced limit)
        $benefitsPlainLen = AiAssistantService::getPlainTextLength($data['benefits']);
        $this->assertLessThanOrEqual(260, $benefitsPlainLen);
    }
}
