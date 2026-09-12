<?php

use App\Models\Project;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('name');
        });

        // Generate slugs for existing projects
        $projects = Project::all();
        foreach ($projects as $project) {
            $baseSlug = Str::slug($project->name ?: 'project');
            $slug = $baseSlug;
            $counter = 1;

            while (Project::where('slug', $slug)->where('id', '!=', $project->id)->exists()) {
                $counter++;
                $slug = "{$baseSlug}-{$counter}";
            }

            $project->slug = $slug;
            $project->saveQuietly();
        }

        // Make slug non-nullable after populating
        Schema::table('projects', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
