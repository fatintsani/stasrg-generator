<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectTemplatePresetTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_project_with_custom_template_and_presets(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('projects.store'), [
            'name' => 'Smart IoT Agriculture Drone',
            'category' => 'Smart Agriculture',
            'title' => 'SMART DRONE MONITORING',
            'subtitle' => 'KEDAIREKA MATCHING FUND',
            'description' => 'Autonomous drone for precision agriculture.',
            'layout_preset' => 'visual_heavy',
            'doc_format' => 'roll_banner',
            'color_theme' => 'ocean_tech',
            'print_mode' => 'dark',
            'boilerplate_type' => 'industry_kedaireka',
            'status' => 'published',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('projects', [
            'name' => 'Smart IoT Agriculture Drone',
            'layout_preset' => 'visual_heavy',
            'doc_format' => 'roll_banner',
            'color_theme' => 'ocean_tech',
            'print_mode' => 'dark',
            'boilerplate_type' => 'industry_kedaireka',
        ]);
    }

    public function test_user_can_update_project_template_presets(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->for($user)->create([
            'doc_format' => 'a4_flyer',
            'color_theme' => 'stas_official',
            'print_mode' => 'light',
        ]);

        $response = $this->actingAs($user)->put(route('projects.update', $project), [
            'name' => $project->name,
            'title' => $project->title,
            'doc_format' => 'pitch_poster',
            'color_theme' => 'crimson_innovation',
            'print_mode' => 'dark',
            'layout_preset' => 'text_heavy',
        ]);

        $response->assertRedirect();

        $project->refresh();
        $this->assertEquals('pitch_poster', $project->doc_format);
        $this->assertEquals('crimson_innovation', $project->color_theme);
        $this->assertEquals('dark', $project->print_mode);
        $this->assertEquals('text_heavy', $project->layout_preset);
    }
}
