<?php

namespace Tests\Feature;

use App\Models\Researcher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ResearcherControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_researchers(): void
    {
        $response = $this->get('/researchers');
        $response->assertRedirect('/login');
    }

    public function test_user_can_view_researchers_index(): void
    {
        $user = User::factory()->create();
        Researcher::create([
            'name' => 'Dr. Jane Doe',
            'role' => 'Principal Investigator / Ketua Peneliti',
            'identifier' => '0412345678',
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user)->get('/researchers');
        $response->assertOk();
    }

    public function test_user_can_store_researcher_with_comma_separated_expertise_string(): void
    {
        $user = User::factory()->create();

        $payload = [
            'name' => 'Dr. Ahmad Fauzi, S.T., M.T.',
            'role' => 'Principal Investigator / Ketua Peneliti',
            'identifier' => '0415068901',
            'lab_affiliation' => 'Center of Excellence STAS-RG',
            'email' => 'ahmad@telkomuniversity.ac.id',
            'scholar_url' => 'https://scholar.google.com/citations?user=123',
            'scopus_url' => 'https://www.scopus.com/authid/detail.uri?authorId=123',
            'sinta_url' => 'https://sinta.kemdikbud.go.id/authors/profile/123',
            'orcid_url' => 'https://orcid.org/0000-0002-1234-5678',
            'linkedin_url' => 'https://linkedin.com/in/ahmadfauzi',
            'expertise' => 'Smart Agriculture, IoT Sensors, Computer Vision, AI',
            'bio' => 'Ketua kelompok riset STAS RG dengan fokus IoT agrikultur.',
        ];

        $response = $this->actingAs($user)->post('/researchers', $payload);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('researchers', [
            'name' => 'Dr. Ahmad Fauzi, S.T., M.T.',
            'identifier' => '0415068901',
        ]);

        $researcher = Researcher::where('name', 'Dr. Ahmad Fauzi, S.T., M.T.')->first();
        $this->assertNotNull($researcher);
        $this->assertIsArray($researcher->expertise);
        $this->assertEquals(['Smart Agriculture', 'IoT Sensors', 'Computer Vision', 'AI'], $researcher->expertise);
    }

    public function test_user_can_store_researcher_with_array_expertise(): void
    {
        $user = User::factory()->create();

        $payload = [
            'name' => 'Sarah Amanda, S.Kom.',
            'role' => 'Anggota Peneliti',
            'expertise' => ['Machine Learning', 'Data Science'],
        ];

        $response = $this->actingAs($user)->post('/researchers', $payload);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $researcher = Researcher::where('name', 'Sarah Amanda, S.Kom.')->first();
        $this->assertNotNull($researcher);
        $this->assertEquals(['Machine Learning', 'Data Science'], $researcher->expertise);
    }

    public function test_user_can_update_researcher_expertise(): void
    {
        $user = User::factory()->create();

        $researcher = Researcher::create([
            'name' => 'Budi Santoso',
            'role' => 'Anggota Peneliti',
            'expertise' => ['IoT'],
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user)->put("/researchers/{$researcher->id}", [
            'name' => 'Budi Santoso, M.Kom.',
            'role' => 'Anggota Peneliti',
            'expertise' => 'IoT, Embedded Systems, Robotics',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $researcher->refresh();
        $this->assertEquals('Budi Santoso, M.Kom.', $researcher->name);
        $this->assertEquals(['IoT', 'Embedded Systems', 'Robotics'], $researcher->expertise);
    }

    public function test_quick_store_researcher_endpoint(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/researchers/quick-store', [
            'name' => 'Prof. Dr. Ir. Hendra',
            'role' => 'Principal Investigator / Ketua Peneliti',
            'identifier' => '0412345678',
            'expertise' => 'AI, Robotics',
        ]);

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('researchers', [
            'name' => 'Prof. Dr. Ir. Hendra',
            'identifier' => '0412345678',
        ]);
    }
}
