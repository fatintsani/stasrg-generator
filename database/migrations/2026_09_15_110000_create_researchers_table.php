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
        Schema::create('researchers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('role')->default('Anggota Peneliti');
            $table->string('identifier')->nullable(); // NIP / NIDN / NIM
            $table->string('lab_affiliation')->nullable();
            $table->string('email')->nullable();
            $table->string('avatar')->nullable();
            $table->string('scholar_url')->nullable();
            $table->string('scopus_url')->nullable();
            $table->string('sinta_url')->nullable();
            $table->string('orcid_url')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->json('expertise')->nullable();
            $table->text('bio')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('usage_count')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['role', 'is_active']);
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('researchers');
    }
};
