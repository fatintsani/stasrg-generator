<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['Smart Agriculture', 'IoT', 'Aviation & AI', 'Cybersecurity', 'Telecommunication', 'Renewable Energy'];

        $name = fake()->words(3, true);

        return [
            'user_id' => User::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1000, 9999),
            'category' => fake()->randomElement($categories),
            'title' => strtoupper(fake()->words(rand(2, 4), true)),
            'description' => fake()->paragraph(3),
            'subtitle' => 'CoE STAS-RG x '.fake()->company(),
            'benefits' => [
                'title' => 'MANFAAT',
                'content' => fake()->paragraph(2),
            ],
            'specifications' => [
                'title' => 'SPESIFIKASI',
                'content' => fake()->paragraph(2),
            ],
            'problem_solution' => [
                'title' => 'PROBLEM–SOLUTION',
                'problem' => fake()->paragraph(2),
                'solution' => fake()->paragraph(2),
            ],
            'project_url' => fake()->url(),
            'footer_website' => 'tel-u.ac.id/stasrg',
            'footer_instagram' => '@stas.rg',
            'footer_youtube' => '@stas_rg',
            'layout_preset' => 'balanced',
            'status' => fake()->randomElement(['draft', 'published']),
        ];
    }

    /**
     * Set the project status to published.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'published',
        ]);
    }

    /**
     * Set the project status to draft.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'draft',
        ]);
    }
}
