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
        Schema::create('project_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->nullable()->constrained('projects')->onDelete('cascade');
            $table->string('event_type', 50)->index(); // qr_scan, showcase_view, download_png, download_pdf, print_flyer
            $table->string('source', 50)->nullable()->default('direct'); // qr, direct, landing, search, social, admin
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('device_type', 30)->default('desktop')->index(); // mobile, desktop, tablet, bot
            $table->string('browser', 50)->nullable(); // Chrome, Safari, Firefox, Edge, Opera, etc.
            $table->string('platform', 50)->nullable(); // Android, iOS, Windows, macOS, Linux, etc.
            $table->string('city', 100)->nullable();
            $table->string('country', 100)->nullable()->default('Indonesia');
            $table->string('referrer', 500)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Compound indexes for analytics aggregation performance
            $table->index(['event_type', 'created_at']);
            $table->index(['project_id', 'event_type', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_analytics');
    }
};
