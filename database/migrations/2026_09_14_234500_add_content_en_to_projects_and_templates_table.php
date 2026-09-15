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
        if (Schema::hasTable('projects')) {
            Schema::table('projects', function (Blueprint $table) {
                if (! Schema::hasColumn('projects', 'content_en')) {
                    $table->json('content_en')->nullable()->after('layout_schema');
                }
            });
        }

        if (Schema::hasTable('project_templates')) {
            Schema::table('project_templates', function (Blueprint $table) {
                if (! Schema::hasColumn('project_templates', 'content_en')) {
                    $table->json('content_en')->nullable()->after('layout_schema');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('projects')) {
            Schema::table('projects', function (Blueprint $table) {
                if (Schema::hasColumn('projects', 'content_en')) {
                    $table->dropColumn('content_en');
                }
            });
        }

        if (Schema::hasTable('project_templates')) {
            Schema::table('project_templates', function (Blueprint $table) {
                if (Schema::hasColumn('project_templates', 'content_en')) {
                    $table->dropColumn('content_en');
                }
            });
        }
    }
};
