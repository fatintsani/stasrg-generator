<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test guest cannot access activity logs dashboard.
     */
    public function test_guest_cannot_access_activity_logs(): void
    {
        $response = $this->get(route('activity-logs.index'));

        $response->assertRedirect(route('login'));
    }

    /**
     * Test approved admin can access activity logs dashboard.
     */
    public function test_approved_admin_can_access_activity_logs(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        ActivityLogger::logAuth('auth.login', 'Admin logged in', $admin);

        $response = $this->actingAs($admin)->get(route('activity-logs.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/ActivityLogs/Index')
            ->has('logs.data')
            ->has('stats')
        );
    }

    /**
     * Test activity logs filtering by log type and search query.
     */
    public function test_activity_logs_can_be_filtered(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        ActivityLogger::logAuth('auth.login', 'Login auth record', $admin);
        ActivityLogger::logProject('project.created', 'Research Drone project created');
        ActivityLogger::logExport('export.png', 'Flyer downloaded as PNG');

        // Filter by type=auth
        $responseAuth = $this->actingAs($admin)->get(route('activity-logs.index', ['type' => 'auth']));
        $responseAuth->assertStatus(200);
        $responseAuth->assertInertia(fn ($page) => $page
            ->where('logs.total', 1)
        );

        // Filter by search=Drone
        $responseSearch = $this->actingAs($admin)->get(route('activity-logs.index', ['search' => 'Drone']));
        $responseSearch->assertStatus(200);
        $responseSearch->assertInertia(fn ($page) => $page
            ->where('logs.total', 1)
        );
    }

    /**
     * Test exporting activity logs to CSV format.
     */
    public function test_activity_logs_can_be_exported_to_csv(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        ActivityLogger::logAuth('auth.login', 'Test CSV login record', $admin);

        $response = $this->actingAs($admin)->get(route('activity-logs.export-csv'));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    /**
     * Test tracking export/print via AJAX endpoint.
     */
    public function test_can_track_export_action(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        $project = Project::factory()->create([
            'user_id' => $admin->id,
            'name' => 'Solar Autonomous Car',
        ]);

        $response = $this->actingAs($admin)->postJson(route('activity-logs.track-export'), [
            'project_id' => $project->id,
            'format' => 'png',
        ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('activity_logs', [
            'log_type' => 'export',
            'action' => 'export.png',
        ]);
    }

    /**
     * Test admin can prune old activity logs.
     */
    public function test_admin_can_prune_old_logs(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        // Create an old log (older than 60 days)
        $oldLog = ActivityLogger::logSystem('system.test', 'Old log to prune');
        ActivityLog::where('id', $oldLog->id)->update(['created_at' => now()->subDays(70)]);

        // Create a recent log
        $recentLog = ActivityLogger::logSystem('system.recent', 'Recent log to keep');

        $response = $this->actingAs($admin)->post(route('activity-logs.prune'), [
            'days' => 60,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseMissing('activity_logs', ['id' => $oldLog->id]);
        $this->assertDatabaseHas('activity_logs', ['id' => $recentLog->id]);
    }

    /**
     * Test project mutation operations automatically record activity logs.
     */
    public function test_project_crud_records_activity_logs(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        // 1. Create Project
        $storeResponse = $this->actingAs($admin)->post(route('projects.store'), [
            'name' => 'AI Crop Disease Detection',
            'title' => 'AI Crop Disease Detection',
            'category' => 'Smart Agriculture',
            'status' => 'draft',
        ]);
        $storeResponse->assertRedirect();

        $project = Project::where('name', 'AI Crop Disease Detection')->first();
        $this->assertNotNull($project);

        $this->assertDatabaseHas('activity_logs', [
            'log_type' => 'project',
            'action' => 'project.created',
        ]);

        // 2. Duplicate Project
        $duplicateResponse = $this->actingAs($admin)->post(route('projects.duplicate', $project));
        $duplicateResponse->assertRedirect();

        $this->assertDatabaseHas('activity_logs', [
            'log_type' => 'project',
            'action' => 'project.duplicated',
        ]);

        // 3. Delete Project
        $deleteResponse = $this->actingAs($admin)->delete(route('projects.destroy', $project));
        $deleteResponse->assertRedirect();

        $this->assertDatabaseHas('activity_logs', [
            'log_type' => 'project',
            'action' => 'project.deleted',
        ]);
    }
}
