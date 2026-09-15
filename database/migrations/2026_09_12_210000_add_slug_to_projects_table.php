<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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
        $projects = DB::table('projects')->get();
        foreach ($projects as $project) {
            $baseSlug = Str::slug($project->name ?: 'project');
            $slug = $baseSlug;
            $counter = 1;

            while (DB::table('projects')->where('slug', $slug)->where('id', '!=', $project->id)->exists()) {
                $counter++;
                $slug = "{$baseSlug}-{$counter}";
            }

            DB::table('projects')->where('id', $project->id)->update(['slug' => $slug]);
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
