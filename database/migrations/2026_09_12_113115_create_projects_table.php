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
        // Drop legacy related tables first (old schema)
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('generated_documents');
        Schema::dropIfExists('project_sections');
        Schema::dropIfExists('project_members');
        Schema::dropIfExists('template_schemas');
        Schema::dropIfExists('projects');
        Schema::enableForeignKeyConstraints();

        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Project identity
            $table->string('name');
            $table->string('category')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('subtitle')->nullable();

            // Main image
            $table->string('main_image')->nullable();

            // Content sections (JSON)
            $table->json('benefits')->nullable();
            $table->json('specifications')->nullable();
            $table->json('problem_solution')->nullable();

            // URL & QR
            $table->string('project_url')->nullable();
            $table->string('qr_code_path')->nullable();

            // Footer info
            $table->string('footer_website')->nullable();
            $table->string('footer_instagram')->nullable();
            $table->string('footer_youtube')->nullable();
            $table->string('footer_logo')->nullable();

            // Status
            $table->string('status')->default('draft');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
