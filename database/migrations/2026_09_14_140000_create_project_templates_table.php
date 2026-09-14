<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('project_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category')->nullable()->default('General');
            $table->text('description')->nullable();
            $table->string('design_style')->default('classic_standard');
            $table->string('doc_format')->default('a4_flyer');
            $table->string('layout_preset')->default('balanced');
            $table->string('color_theme')->default('stas_official');
            $table->string('print_mode')->default('light');
            $table->string('boilerplate_type')->nullable()->default('stas_default');
            $table->json('default_data')->nullable();
            $table->string('preview_image')->nullable();
            $table->boolean('is_system')->default(false);
            $table->unsignedInteger('usage_count')->default(0);
            $table->timestamps();
        });

        // Add design_style to projects table if not present
        if (Schema::hasTable('projects') && ! Schema::hasColumn('projects', 'design_style')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->string('design_style')->default('classic_standard')->after('layout_preset');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('projects') && Schema::hasColumn('projects', 'design_style')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropColumn('design_style');
            });
        }

        Schema::dropIfExists('project_templates');
    }
};
