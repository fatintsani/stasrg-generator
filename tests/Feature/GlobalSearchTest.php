<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GlobalSearchTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test guest cannot access global search endpoint.
     */
    public function test_guest_cannot_access_global_search(): void
    {
        $response = $this->getJson(route('admin.global-search'));

        $response->assertStatus(401);
    }

    /**
     * Test empty search returns default navigation suggestions.
     */
    public function test_empty_query_returns_default_navigation_items(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        $response = $this->actingAs($admin)->getJson(route('admin.global-search'));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'query',
            'results' => [
                'navigation',
                'projects',
                'users',
                'logs',
            ],
        ]);
        $this->assertNotEmpty($response->json('results.navigation'));
    }

    /**
     * Test searching projects by name, category, or title.
     */
    public function test_search_returns_matched_projects(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        Project::factory()->create([
            'user_id' => $admin->id,
            'name' => 'Autonomous Drone Sprayer',
            'title' => 'Autonomous Drone Sprayer for Precision Farming',
            'category' => 'Smart Agriculture',
        ]);

        $response = $this->actingAs($admin)->getJson(route('admin.global-search', ['q' => 'Drone']));

        $response->assertStatus(200);
        $projects = $response->json('results.projects');
        $this->assertCount(1, $projects);
        $this->assertEquals('Autonomous Drone Sprayer', $projects[0]['name']);
    }

    /**
     * Test searching navigation shortcuts.
     */
    public function test_search_returns_matched_navigation_shortcuts(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        $response = $this->actingAs($admin)->getJson(route('admin.global-search', ['q' => 'audit']));

        $response->assertStatus(200);
        $nav = $response->json('results.navigation');
        $this->assertNotEmpty($nav);
        $this->assertEquals('Activity & Audit Logs', $nav[0]['title']);
    }

    /**
     * Test searching users and audit logs.
     */
    public function test_search_returns_users_and_activity_logs(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        $researcher = User::factory()->create([
            'name' => 'Dr. Budi Santoso',
            'email' => 'budi@telkomuniversity.ac.id',
            'role' => 'researcher',
            'status' => User::STATUS_APPROVED,
        ]);

        ActivityLogger::logAuth('auth.login', 'Dr. Budi Santoso logged in', $researcher);

        $response = $this->actingAs($admin)->getJson(route('admin.global-search', ['q' => 'Budi']));

        $response->assertStatus(200);
        $users = $response->json('results.users');
        $logs = $response->json('results.logs');

        $this->assertNotEmpty($users);
        $this->assertEquals('Dr. Budi Santoso', $users[0]['name']);
        $this->assertNotEmpty($logs);
    }
}
