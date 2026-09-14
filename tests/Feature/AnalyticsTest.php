<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectAnalytic;
use App\Models\User;
use App\Services\AnalyticsTracker;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_analytics(): void
    {
        $response = $this->get('/analytics');
        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_view_analytics_dashboard(): void
    {
        $user = User::factory()->create(['status' => 'approved']);
        $project = Project::factory()->create([
            'user_id' => $user->id,
            'status' => 'published',
        ]);

        // Seed some analytics events
        ProjectAnalytic::create([
            'project_id' => $project->id,
            'event_type' => ProjectAnalytic::EVENT_QR_SCAN,
            'source' => 'qr',
            'device_type' => 'mobile',
            'browser' => 'Chrome',
            'platform' => 'Android',
            'city' => 'Bandung',
            'country' => 'Indonesia',
            'created_at' => now(),
        ]);

        ProjectAnalytic::create([
            'project_id' => $project->id,
            'event_type' => ProjectAnalytic::EVENT_SHOWCASE_VIEW,
            'source' => 'direct',
            'device_type' => 'desktop',
            'browser' => 'Chrome',
            'platform' => 'Windows',
            'city' => 'Bandung',
            'country' => 'Indonesia',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($user)->get('/analytics');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Analytics/Index')
            ->has('metrics')
            ->has('timeline')
            ->has('hourly')
            ->has('devices')
            ->has('locations')
            ->has('leaderboards')
            ->has('recent_events')
            ->where('metrics.total_scans', 1)
            ->where('metrics.total_views', 1)
        );
    }

    public function test_qr_tracking_gateway_records_scan_and_redirects(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
            'status' => 'published',
            'project_url' => 'https://stas-rg.com/demo',
        ]);

        $response = $this->withServerVariables([
            'HTTP_USER_AGENT' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
        ])->get("/qr/{$project->slug}");

        $response->assertRedirect('https://stas-rg.com/demo?src=qr_scan');

        $this->assertDatabaseHas('project_analytics', [
            'project_id' => $project->id,
            'event_type' => ProjectAnalytic::EVENT_QR_SCAN,
            'device_type' => 'mobile',
            'platform' => 'iOS',
            'browser' => 'Safari',
        ]);
    }

    public function test_qr_tracking_gateway_redirects_to_showcase_if_no_project_url(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
            'status' => 'published',
            'project_url' => null,
        ]);

        $response = $this->get("/qr/{$project->slug}");

        $response->assertRedirect(route('projects.showcase.show', ['project' => $project->slug, 'src' => 'qr']));

        $this->assertDatabaseHas('project_analytics', [
            'project_id' => $project->id,
            'event_type' => ProjectAnalytic::EVENT_QR_SCAN,
        ]);
    }

    public function test_public_showcase_tracks_view_event(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $user->id,
            'status' => 'published',
        ]);

        $response = $this->withServerVariables([
            'HTTP_USER_AGENT' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0.0.0 Safari/537.36',
        ])->get("/showcase/{$project->slug}?src=qr");

        $response->assertOk();

        $this->assertDatabaseHas('project_analytics', [
            'project_id' => $project->id,
            'event_type' => ProjectAnalytic::EVENT_SHOWCASE_VIEW,
            'source' => 'qr',
            'device_type' => 'desktop',
            'platform' => 'Windows',
            'browser' => 'Chrome',
        ]);
    }

    public function test_track_export_ajax_logs_analytic_record(): void
    {
        $user = User::factory()->create(['status' => 'approved']);
        $project = Project::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->postJson('/activity-logs/track-export', [
            'project_id' => $project->id,
            'project_name' => $project->name,
            'format' => 'pdf',
        ]);

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('project_analytics', [
            'project_id' => $project->id,
            'event_type' => ProjectAnalytic::EVENT_DOWNLOAD_PDF,
        ]);
    }

    public function test_export_analytics_csv_downloads_stream(): void
    {
        $user = User::factory()->create(['status' => 'approved']);
        $project = Project::factory()->create(['user_id' => $user->id]);

        ProjectAnalytic::create([
            'project_id' => $project->id,
            'event_type' => ProjectAnalytic::EVENT_QR_SCAN,
            'source' => 'qr',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($user)->get('/analytics/export-csv');

        $response->assertOk();
        $this->assertTrue($response->headers->contains('content-type', 'text/csv; charset=UTF-8'));
    }

    public function test_analytics_tracker_helper_methods(): void
    {
        $this->assertEquals('mobile', AnalyticsTracker::detectDeviceType('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)'));
        $this->assertEquals('desktop', AnalyticsTracker::detectDeviceType('Mozilla/5.0 (Windows NT 10.0; Win64; x64)'));
        $this->assertEquals('tablet', AnalyticsTracker::detectDeviceType('Mozilla/5.0 (iPad; CPU OS 12_2)'));

        $this->assertEquals('Chrome', AnalyticsTracker::detectBrowser('Mozilla/5.0 Chrome/115.0.0.0 Safari/537.36'));
        $this->assertEquals('Edge', AnalyticsTracker::detectBrowser('Mozilla/5.0 Edg/115.0.0.0'));
        $this->assertEquals('Firefox', AnalyticsTracker::detectBrowser('Mozilla/5.0 Firefox/115.0'));

        $this->assertEquals('Android', AnalyticsTracker::detectPlatform('Android 12; Mobile'));
        $this->assertEquals('iOS', AnalyticsTracker::detectPlatform('iPhone OS 16_0'));
        $this->assertEquals('Windows', AnalyticsTracker::detectPlatform('Windows NT 10.0'));
    }
}
