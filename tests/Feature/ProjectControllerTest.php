<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProjectControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_projects(): void
    {
        $response = $this->get('/projects');
        $response->assertRedirect('/login');

        $response = $this->get('/projects/create');
        $response->assertRedirect('/login');
    }

    public function test_user_can_view_projects_index(): void
    {
        $user = User::factory()->create();
        Project::factory()->count(3)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get('/projects');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Projects/Index')
            ->has('projects.data', 3)
        );
    }

    public function test_user_can_create_project_with_qr_code(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $payload = [
            'name' => 'Smart Cage Monitoring',
            'category' => 'Smart Agriculture',
            'title' => 'CAGE MONITORING',
            'subtitle' => 'CoE STAS-RG x Peternakan Cilengkrang',
            'description' => 'Sistem monitoring kebersihan kandang berbasis IoT.',
            'main_image' => UploadedFile::fake()->image('cage.jpg'),
            'benefits' => [
                'title' => 'MANFAAT',
                'content' => 'Mengukur gas amonia dan suhu.',
            ],
            'specifications' => [
                'title' => 'SPESIFIKASI',
                'content' => 'Sensor MQ135 dan DHT22.',
            ],
            'problem_solution' => [
                'title' => 'PROBLEM–SOLUTION',
                'problem' => 'Kualitas telur ayam menurun.',
                'solution' => 'Sistem monitoring IoT real-time.',
            ],
            'project_url' => 'https://tel-u.ac.id/stasrg',
            'footer_website' => 'tel-u.ac.id/stasrg',
            'footer_instagram' => '@stas.rg',
            'footer_youtube' => '@stas_rg',
            'status' => 'published',
        ];

        $response = $this->actingAs($user)->post('/projects', $payload);

        $this->assertDatabaseHas('projects', [
            'user_id' => $user->id,
            'name' => 'Smart Cage Monitoring',
            'title' => 'CAGE MONITORING',
            'status' => 'published',
        ]);

        $project = Project::where('name', 'Smart Cage Monitoring')->first();
        $this->assertNotNull($project);
        $this->assertNotNull($project->main_image);
        $this->assertNotNull($project->qr_code_path);

        $response->assertRedirect(route('projects.show', $project));
    }

    public function test_user_can_view_their_project(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get("/projects/{$project->slug}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Projects/Show')
            ->where('project.id', $project->id)
            ->where('project.slug', $project->slug)
        );
    }

    public function test_user_cannot_view_another_users_project(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user1->id]);

        $response = $this->actingAs($user2)->get("/projects/{$project->slug}");

        $response->assertForbidden();
    }

    public function test_user_can_update_project(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
            'title' => 'OLD TITLE',
        ]);

        $response = $this->actingAs($user)->put("/projects/{$project->slug}", [
            'name' => 'Updated Name',
            'title' => 'NEW TITLE',
            'category' => 'IoT',
            'project_url' => 'https://example.com/new-url',
        ]);

        $project->refresh();
        $response->assertRedirect(route('projects.show', $project));

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'name' => 'Updated Name',
            'title' => 'NEW TITLE',
        ]);
    }

    public function test_user_can_duplicate_project(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
            'name' => 'Original Project',
            'title' => 'FLYER TITLE',
            'project_url' => 'https://tel-u.ac.id/stasrg',
        ]);

        $response = $this->actingAs($user)->post("/projects/{$project->slug}/duplicate");

        $duplicated = Project::where('name', 'Original Project (Copy)')->first();
        $this->assertNotNull($duplicated);
        $this->assertEquals($user->id, $duplicated->user_id);
        $this->assertEquals('draft', $duplicated->status);
        $this->assertNotNull($duplicated->slug);

        $response->assertRedirect(route('projects.edit', $duplicated));
    }

    public function test_guest_can_view_published_project_showcase_detail(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
            'name' => 'Published Showcase Test',
            'title' => 'SHOWCASE HEADLINE',
            'status' => 'published',
        ]);

        $response = $this->get("/showcase/{$project->slug}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/ProjectDetail')
            ->where('project.slug', $project->slug)
            ->where('project.title', 'SHOWCASE HEADLINE')
        );
    }

    public function test_guest_cannot_view_draft_project_showcase_detail(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
            'name' => 'Draft Showcase Test',
            'status' => 'draft',
        ]);

        $response = $this->get("/showcase/{$project->slug}");

        $response->assertNotFound();
    }

    public function test_user_can_delete_project(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->delete("/projects/{$project->slug}");

        $response->assertRedirect(route('projects.index'));
        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    }

    public function test_user_can_create_and_update_project_with_layout_presets(): void
    {
        $user = User::factory()->create();

        // Create with visual_heavy preset
        $response = $this->actingAs($user)->post('/projects', [
            'name' => 'IoT Hardware Project',
            'title' => 'SMART DRONE ROBOTICS',
            'layout_preset' => 'visual_heavy',
            'status' => 'published',
        ]);

        $project = Project::where('name', 'IoT Hardware Project')->first();
        $this->assertNotNull($project);
        $this->assertEquals('visual_heavy', $project->layout_preset);

        // Update to text_heavy preset
        $updateResponse = $this->actingAs($user)->put("/projects/{$project->slug}", [
            'name' => 'IoT Hardware Project (Updated)',
            'title' => 'SMART DRONE ROBOTICS',
            'layout_preset' => 'text_heavy',
            'status' => 'published',
        ]);

        $project->refresh();
        $this->assertEquals('text_heavy', $project->layout_preset);
    }
}
