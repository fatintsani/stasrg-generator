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
        Schema::create('media_assets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['partner_logo', 'badge_icon'])->default('partner_logo')->index();
            $table->enum('category', [
                'industry',
                'university',
                'grant',
                'government',
                'accreditation',
                'patent',
                'hki',
                'iso',
                'other',
            ])->default('other')->index();
            $table->string('file_path')->nullable();
            $table->string('preview_url')->nullable();
            $table->longText('svg_content')->nullable();
            $table->json('tags')->nullable();
            $table->boolean('is_verified')->default(true)->index();
            $table->boolean('is_system_preset')->default(false)->index();
            $table->unsignedBigInteger('usage_count')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_assets');
    }
};
